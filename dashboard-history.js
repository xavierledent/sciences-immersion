/* ===== Tableau de bord : import de l'historique du Google Sheet =====

   Avant Firebase, le site envoyait chaque action des élèves à un Google
   Sheet (onglet « Evenements » : Horodatage, Email, Page, Evenement,
   Donnees en JSON). Le travail lui-même restait sur le Chromebook de
   l'élève et n'arrive dans Firestore qu'à sa première connexion (import de
   la phase 5). Ce module reconstitue, à partir d'un export CSV de cet
   onglet, l'état de chaque élève par chapitre :
     - exercices répondus (et longueur de la réponse, jamais son texte) ;
     - dernier feu de chaque sous-question ;
     - meilleurs résultats des jeux (rattachés à l'id du jeu par son titre) ;
     - ampoules de l'autoévaluation ;
     - compteurs d'activité (mêmes noms que storage.js) et dernière activité.
   Résultat : un document history/{adresse} par élève, écrit par les
   enseignantes. Ré-importer remplace ces documents (même résultat).

   Seuls les événements ANTÉRIEURS à CUTOFF sont pris : après, les mêmes
   actions sont comptées dans Firestore (compteurs mis en ligne le
   2026-10-19 à 15:06), les prendre aussi les compterait deux fois.
   Fusion avec le travail Firestore : dashboard-data.js (summarizeChapter). */

import * as fb from './firebase-init.js';
import { esc } from './dashboard-ui.js';

export const CUTOFF = new Date(2026, 9, 19, 15, 6); // heure locale
const SCHOOL_EMAIL = /^[a-z0-9._-]+@cnddinant\.be$/;
const BATCH_DOCS = 40;

/* ===== Lecture du CSV (format de Google Sheets : virgules, guillemets
   doublés à l'intérieur d'un champ entre guillemets) ===== */

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const sep = text.split('\n', 1)[0].includes(';') && !text.split('\n', 1)[0].includes(',') ? ';' : ',';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += ch;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim()));
}

/* Horodatage tel que le Sheet l'exporte : « 19/10/2026 14:03:22 » (format
   belge), « 2026-10-19 14:03:22 » ou ISO. Jour et mois inversés
   (« 10/19/2026 ») reconnus quand le premier nombre dépasse 12 ;
   sinon jour/mois. */
function parseDate(text, monthFirst) {
  const t = text.trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(t);
  if (m) return new Date(+m[1], m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0));
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(t);
  if (m) {
    const [a, b] = [+m[1], +m[2]];
    const day = monthFirst ? b : a;
    const month = monthFirst ? a : b;
    return new Date(+m[3], month - 1, day, +m[4], +m[5], +(m[6] || 0));
  }
  const d = new Date(t);
  return isNaN(d) ? null : d;
}

function chapterIdFromPath(path) {
  const m = /\/(en|nl)\/(year1|jaar1)\/([a-z]+\d+)\/[^/]*$/.exec(path || '');
  return m ? `${m[1]}_${m[2]}_${m[3]}` : null;
}

/* ===== Reconstitution ===== */

// gamesByTitle : { chapitreId: { titre: id } } (contenu actuel du site).
export function buildHistory(csvText, gamesByTitle, teachers) {
  const rows = parseCsv(csvText);
  const report = {
    rows: rows.length, kept: 0, afterCutoff: 0, unreadable: 0, notStudent: 0,
    outsideChapter: 0, unknownGames: new Set(), first: null, last: null
  };
  if (!rows.length) return { report, students: {} };

  // En-tête : repérer les colonnes par leur nom, sinon l'ordre du Sheet.
  let col = { date: 0, email: 1, page: 2, event: 3, data: 4 };
  const head = rows[0].map(h => h.trim().toLowerCase());
  if (head.includes('evenement') || head.includes('email')) {
    rows.shift();
    report.rows--;
    const find = names => head.findIndex(h => names.includes(h));
    col = {
      date: find(['horodatage', 'date', 'timestamp']),
      email: find(['email', 'e-mail']),
      page: find(['page']),
      event: find(['evenement', 'événement', 'event']),
      data: find(['donnees', 'données', 'data'])
    };
  }
  const monthFirst = rows.some(r => {
    const m = /^(\d{1,2})\/(\d{1,2})\//.exec((r[col.date] || '').trim());
    return m && +m[2] > 12;
  });

  const students = {};
  const chapterOf = (email, chapterId) => {
    const s = students[email] = students[email] || {};
    return s[chapterId] = s[chapterId] || {
      answers: {}, lights: {}, games: {}, ratings: {}, stats: {}, lastActivity: null, vocab: {}
    };
  };
  const bump = (h, name, n) => { if (n > 0) h.stats[name] = (h.stats[name] || 0) + n; };

  // Ordre chronologique : « le dernier feu », « la dernière réponse ».
  const events = [];
  rows.forEach(r => {
    const date = parseDate(r[col.date] || '', monthFirst);
    const email = String(r[col.email] || '').trim().toLowerCase();
    const event = String(r[col.event] || '').trim();
    let data = {};
    try { data = JSON.parse(r[col.data] || '{}') || {}; } catch (e) { data = null; }
    if (!date || !event || data === null) { report.unreadable++; return; }
    if (date >= CUTOFF) { report.afterCutoff++; return; }
    if (!SCHOOL_EMAIL.test(email) || teachers[email]) { report.notStudent++; return; }
    const chapterId = chapterIdFromPath(r[col.page]);
    if (!chapterId) { report.outsideChapter++; return; }
    events.push({ date, email, event, data, chapterId });
  });
  events.sort((a, b) => a.date - b.date);

  events.forEach(({ date, email, event, data, chapterId }) => {
    report.kept++;
    if (!report.first || date < report.first) report.first = date;
    if (!report.last || date > report.last) report.last = date;
    const h = chapterOf(email, chapterId);
    if (!h.lastActivity || date > h.lastActivity) h.lastActivity = date;
    const key = `${data.level}::${data.exerciseId}::${data.subQuestion || 0}`;

    switch (event) {
      case 'answer_checked':
        if (data.hasAnswer) h.answers[key] = Number(data.answerLength) || 1;
        else delete h.answers[key];
        break;
      case 'self_assess_rated':
        if (data.rating) h.lights[key] = Number(data.rating);
        else delete h.lights[key];
        break;
      case 'autoeval_item_rated':
        if (data.rating) h.ratings[data.itemId] = Number(data.rating);
        else delete h.ratings[data.itemId];
        break;
      case 'qcm_quiz_completed':
      case 'fitb_completed':
      case 'dnd_completed':
      case 'memory_completed':
      case 'sorting_completed': {
        const id = (gamesByTitle[chapterId] || {})[data.quizTitle];
        if (!id) { report.unknownGames.add(`${chapterId} : ${data.quizTitle}`); break; }
        const g = h.games[id] = h.games[id] || {};
        const best = (stat, value) => {
          if (Number.isFinite(value) && (g[stat] === undefined || value < g[stat])) g[stat] = value;
        };
        if (event === 'qcm_quiz_completed') {
          const ratio = data.total ? data.score / data.total : -1;
          if (!g.total || ratio > g.score / g.total) { g.score = data.score; g.total = data.total; }
        } else {
          best('mistakes', Number(data.mistakes));
          best('moves', Number(data.moves));
          best('time', Number(data.timeSeconds));
        }
        break;
      }
      case 'vocabulary_session_ended': {
        // Instantanés cumulés d'une même visite : garder le plus grand.
        const id = data.sessionId || `${date.getTime()}`;
        const v = h.vocab[id] = h.vocab[id] || { seen: 0, flips: 0, listens: 0 };
        v.seen = Math.max(v.seen, Number(data.nbCartesVues) || 0);
        v.flips = Math.max(v.flips, Number(data.nbRetournees) || 0);
        v.listens = Math.max(v.listens, Number(data.nbEcoutes) || 0);
        return; // compteurs vocabulaire calculés à la fin
      }
    }
    bump(h, event, 1);
  });

  // Vocabulaire : une session par visite, cartes = somme des visites.
  Object.keys(students).forEach(email => Object.keys(students[email]).forEach(chapterId => {
    const h = students[email][chapterId];
    const visits = Object.keys(h.vocab).map(id => h.vocab[id]);
    bump(h, 'vocabulary_sessions', visits.length);
    bump(h, 'vocabulary_cards_seen', visits.reduce((n, v) => n + v.seen, 0));
    bump(h, 'vocabulary_flips', visits.reduce((n, v) => n + v.flips, 0));
    bump(h, 'vocabulary_listens', visits.reduce((n, v) => n + v.listens, 0));
    delete h.vocab;
  }));

  return { report, students };
}

export async function saveHistory(students, me, sourceRows) {
  const emails = Object.keys(students);
  for (let i = 0; i < emails.length; i += BATCH_DOCS) {
    const batch = fb.writeBatch(fb.db);
    emails.slice(i, i + BATCH_DOCS).forEach(email => {
      batch.set(fb.doc(fb.db, 'history', email), {
        chapters: students[email],
        cutoff: CUTOFF,
        importedAt: fb.serverTimestamp(),
        importedBy: me,
        sourceRows
      });
    });
    await batch.commit();
  }
}

/* ===== Section de l'onglet « Classes et élèves » ===== */

/* ctx : { me, teachers, students, content(track), historyInfo, onSaved() } */
export function renderHistorySection(box, ctx) {
  const info = ctx.historyInfo;
  box.innerHTML = `
    <h2>Historique du Google Sheet</h2>
    <p class="t-help">Reprend dans le tableau de bord ce que le site avait enregistré dans le Google Sheet
      jusqu'au ${CUTOFF.toLocaleString('fr-BE', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })} :
      exercices répondus, feux, jeux, ampoules, activité. Le texte des réponses n'y est pas ; il arrive quand
      l'élève se reconnecte sur son Chromebook. Le travail enregistré dans Firestore passe toujours avant.</p>
    ${info ? `<p class="t-help"><strong>Déjà importé :</strong> ${info.count} élève(s),
      le ${info.at ? info.at.toLocaleString('fr-BE', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '?'}.
      Un nouvel import remplace le précédent.</p>` : ''}
    <ol class="t-help t-steps">
      <li>Dans le Google Sheet, ouvrez l'onglet <strong>Evenements</strong>.</li>
      <li>Menu <strong>Fichier → Télécharger → Valeurs séparées par des virgules (.csv)</strong> : seul l'onglet affiché est exporté.</li>
      <li>Choisissez ce fichier ci-dessous, puis « Analyser ».</li>
    </ol>
    <div class="t-form-row">
      <input type="file" id="h-file" accept=".csv,text/csv" />
      <button type="button" class="t-btn t-btn-primary" id="h-analyse">Analyser</button>
    </div>
    <div id="h-preview"></div>`;

  box.querySelector('#h-analyse').addEventListener('click', async () => {
    const file = box.querySelector('#h-file').files[0];
    const preview = box.querySelector('#h-preview');
    if (!file) { preview.innerHTML = '<p class="t-status is-error">Choisissez d’abord le fichier CSV.</p>'; return; }
    preview.innerHTML = '<p class="t-help">Analyse…</p>';
    const [text, en, nl] = await Promise.all([file.text(), ctx.content('en'), ctx.content('nl')]);
    const gamesByTitle = {};
    en.concat(nl).forEach(ch => {
      gamesByTitle[ch.id] = {};
      ch.games.forEach(g => { gamesByTitle[ch.id][g.title] = g.id; });
    });
    const { report, students } = buildHistory(text, gamesByTitle, ctx.teachers);
    renderReport(preview, report, students, ctx);
  });
}

function renderReport(box, report, students, ctx) {
  const emails = Object.keys(students);
  const inList = emails.filter(e => ctx.students[e]).length;
  const day = d => d ? d.toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
  const chapterCount = emails.reduce((n, e) => n + Object.keys(students[e]).length, 0);
  const unknown = Array.from(report.unknownGames);
  box.innerHTML = `
    <div class="t-preview-group"><h3>Résultat de l'analyse</h3>
      <ul>
        <li><strong>${report.kept}</strong> événements repris, du ${day(report.first)} au ${day(report.last)}
          (sur ${report.rows} lignes du fichier)</li>
        <li><strong>${emails.length}</strong> élèves, dont ${inList} dans la liste des classes ;
          ${chapterCount} couples élève-chapitre</li>
        ${report.afterCutoff ? `<li>${report.afterCutoff} événements postérieurs à la coupure, ignorés (déjà comptés dans Firestore)</li>` : ''}
        ${report.notStudent ? `<li>${report.notStudent} événements de visiteurs, d’enseignants ou d’adresses hors école, ignorés</li>` : ''}
        ${report.outsideChapter ? `<li>${report.outsideChapter} événements hors d’une page de chapitre, ignorés</li>` : ''}
        ${report.unreadable ? `<li>${report.unreadable} lignes illisibles, ignorées</li>` : ''}
      </ul></div>
    ${unknown.length ? `<div class="t-preview-group"><h3>Jeux non retrouvés <span class="t-count">${unknown.length}</span></h3>
      <p class="t-help">Titre changé depuis : ces résultats ne sont pas repris (les autres actions de l’élève, oui).</p>
      <ul>${unknown.map(u => `<li>${esc(u)}</li>`).join('')}</ul></div>` : ''}
    <div class="t-form-row">
      <button type="button" class="t-btn t-btn-primary" id="h-save"${emails.length ? '' : ' disabled'}>Enregistrer l'historique</button>
      <span class="t-muted" id="h-save-status"></span>
    </div>`;

  box.querySelector('#h-save').addEventListener('click', async e => {
    e.target.disabled = true;
    const status = box.querySelector('#h-save-status');
    status.textContent = 'Enregistrement…';
    try {
      await saveHistory(students, ctx.me, report.rows);
      status.textContent = `Historique enregistré pour ${emails.length} élève(s).`;
      ctx.onSaved();
    } catch (err) {
      console.error(err);
      status.textContent = 'L’enregistrement a échoué : ' + (err.code || err.message);
      e.target.disabled = false;
    }
  });
}
