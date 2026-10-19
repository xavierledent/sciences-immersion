/* ===== Tableau de bord : onglet « Devoirs » =====

   Un devoir = des exercices, jeux et labos d'une filière, donnés à des
   élèves (une ou plusieurs classes, élèves cochés un par un), avec une date
   limite et un message. Il est enregistré dans Firestore (assignments/{id})
   et envoyé par mail depuis le compte de l'enseignante (dashboard-mail.js),
   un mail par élève, qui commence par son prénom.

   assignments/{id} :
     title, message, track ('en' | 'nl'), due ('AAAA-MM-JJ', fin de journée),
     classes [id], recipients [adresse],
     items [{ ch: 'bio1', k: 'ex' | 'game' | 'lab', lv: 'level1' (exercice), id }],
     numbers { classe: n }, createdAt/By, updatedAt/By, sentAt/By, sentTo [adresse]

   Numéro (décision du 2026-10-20) : un par classe, attribué au premier
   envoi, seulement aux classes dont au moins la moitié des élèves reçoit le
   devoir (un envoi individuel n'a pas de numéro) ; repart à 1 chaque année
   scolaire (date limite à partir du 15 août). Chaque élève voit dans son
   mail le numéro de sa classe : « Science homework 4 · due … ».

   État d'un élève pour un devoir (décisions du 2026-10-20) :
     fait            tout est fait au plus tard à la date limite (y compris
                     avant que le devoir soit donné) ;
     fait en retard  tout est fait, une partie après la date limite ;
     partiellement   plus de la moitié des éléments faits (dates ignorées) ;
     non fait        la moitié ou moins.
   « Fait » = mêmes critères que le Suivi (summarizeChapter) : exercice
   répondu, jeu terminé une fois, labo arrivé au Check. Date : famille doneAt
   (storage.js), écrite au premier « fait » depuis le 2026-10-20 ; sans date,
   l'élément compte comme fait à temps. */

import * as fb from './firebase-init.js';
import { esc, LIGHT, stackBar, cellsBar, legend, TRACK } from './dashboard-ui.js';
import { LEVELS, summarizeChapter } from './dashboard-data.js';
import { authorize, sendMail, prepareMail } from './dashboard-mail.js';

const STATUS = {
  done: { label: 'Fait', color: LIGHT[3].color },
  late: { label: 'Fait en retard', color: LIGHT[2].color },
  // Vert clair : « en partie fait », même famille que « fait » ; l'orange reste le retard.
  partial: { label: 'Partiellement fait', color: '#8fd3bd' },
  missing: { label: 'Non fait', color: LIGHT[1].color }
};
const STATUS_ORDER = ['done', 'late', 'partial', 'missing'];
const LEVEL_NUM = { level1: 1, level2: 2, level3: 3 };

// Parties fixes du mail, dans la langue de la filière.
const MAIL = {
  en: {
    locale: 'en-GB',
    title: 'Science homework',
    subject: (title, date) => `${title} · due ${date}`,
    hello: name => `Hello ${name},`,
    due: date => `To do by ${date}:`,
    exercise: (lv, n) => `Exercise ${n} (Level ${lv})`,
    exercises: (lv, from, to) => `Exercises ${from} to ${to} (Level ${lv})`,
    lab: 'Lab',
    games: { multipleChoice: 'Quiz', fillBlanks: 'Fill in the blanks', dragAndDrop: 'Drag and drop', matchPairs: 'Memory', sorting: 'Sorting' },
    // Message proposé : une phrase par sorte d'élément donnée (décision du 2026-10-20).
    intro: 'Here is your science homework.',
    ex: 'Answer the exercises. After each one, read the correction and rate yourself honestly.',
    game: 'Play each game until the end. Try to beat your best score!',
    labDo: 'Do the lab step by step, up to the Check step.',
    outro: 'Log in with your school account so that your work is saved. If something does not work, reply to this email.'
  },
  nl: {
    locale: 'nl-BE',
    title: 'Huiswerk wetenschappen',
    subject: (title, date) => `${title} · tegen ${date}`,
    hello: name => `Hallo ${name},`,
    due: date => `Te doen tegen ${date}:`,
    exercise: (lv, n) => `Oefening ${n} (Level ${lv})`,
    exercises: (lv, from, to) => `Oefeningen ${from} tot ${to} (Level ${lv})`,
    lab: 'Labo',
    games: { multipleChoice: 'Quiz', fillBlanks: 'Invuloefening', dragAndDrop: 'Sleepoefening', matchPairs: 'Memory', sorting: 'Sorteeroefening' },
    intro: 'Hier is je huiswerk voor wetenschappen.',
    ex: 'Beantwoord de oefeningen. Lees na elke oefening de verbetering en beoordeel jezelf eerlijk.',
    game: 'Speel elk spel tot het einde. Probeer je beste score te verbeteren!',
    labDo: 'Doe het labo stap voor stap, tot en met de stap Check.',
    outro: 'Log in met je schoolaccount, zodat je werk bewaard wordt. Werkt er iets niet? Antwoord dan op deze mail.'
  }
};

function proposedMessage(track, items) {
  const t = MAIL[track] || MAIL.en;
  const kinds = new Set(items.map(i => i.k));
  const middle = [kinds.has('ex') && t.ex, kinds.has('game') && t.game, kinds.has('lab') && t.labDo].filter(Boolean);
  return [t.intro].concat(middle.length ? ['', middle.join('\n')] : [], ['', t.outro]).join('\n');
}

/* Éléments dans l'ordre du site (chapitre, puis exercices par niveau, jeux,
   labos), les exercices qui se suivent dans un niveau regroupés en une
   série : { ch, chapter, k, lv, items: [item…] }. */
function groupedItems(track, items) {
  const chapters = contents[track] || [];
  const rank = item => {
    const chapter = chapters.find(c => c.folder === item.ch);
    const ci = chapter ? chapters.indexOf(chapter) : 99;
    if (!chapter) return [ci, 9, 0, 0];
    if (item.k === 'ex') return [ci, 0, LEVELS.indexOf(item.lv), (chapter.levels[item.lv] || []).findIndex(e => String(e.id) === String(item.id))];
    if (item.k === 'game') return [ci, 1, 0, chapter.games.findIndex(g => g.id === item.id)];
    return [ci, 2, 0, chapter.labs.findIndex(l => l.id === item.id)];
  };
  const ranked = items.map(item => ({ item, r: rank(item) }))
    .sort((a, b) => a.r[0] - b.r[0] || a.r[1] - b.r[1] || a.r[2] - b.r[2] || a.r[3] - b.r[3]);
  const out = [];
  ranked.forEach(({ item, r }) => {
    const last = out[out.length - 1];
    if (last && item.k === 'ex' && last.k === 'ex' && last.ch === item.ch && last.lv === item.lv && r[3] === last.pos + 1) {
      last.items.push(item);
      last.pos = r[3];
      return;
    }
    out.push({ ch: item.ch, chapter: chapters.find(c => c.folder === item.ch) || null, k: item.k, lv: item.lv, items: [item], pos: r[3] });
  });
  return out;
}

const SITE_ROOT = new URL('./', location.href).href;

let ctx = null;
let root = null;
let assignments = [];   // [{ id, ...data }]
let contents = {};      // filière → chapitres (loadContent)
let draft = null;       // devoir en cours de composition, ou null (liste)
let openId = null;      // devoir dont le détail est déplié
let summaryCache = new Map();

/* Devoirs lus une fois, gardés jusqu'au prochain affichage de l'onglet
   Devoirs (qui relit toujours : il vient peut-être d'en enregistrer un). La
   fiche élève, elle, réutilise la lecture en cours. */
let assignmentsRead = null;

function fetchAssignments(force) {
  if (force || !assignmentsRead) {
    assignmentsRead = fb.getDocs(fb.collection(fb.db, 'assignments')).then(snap => {
      const list = [];
      snap.forEach(d => list.push(Object.assign({ id: d.id }, d.data())));
      return list;
    });
    assignmentsRead.catch(() => { assignmentsRead = null; });
  }
  return assignmentsRead;
}

export async function renderHomeworkView(rootEl, context) {
  root = rootEl;
  ctx = context;
  prepareMail();
  ctx.setStatus('Chargement des devoirs…');
  try {
    const [work, list, en, nl] = await Promise.all([
      ctx.ensureWork(),
      fetchAssignments(true),
      ctx.content('en'),
      ctx.content('nl')
    ]);
    ctx.work = work;
    contents = { en, nl };
    assignments = list.slice();
    assignments.sort((a, b) => (b.due || '').localeCompare(a.due || '') || (b.title || '').localeCompare(a.title || ''));
    summaryCache = new Map();
    ctx.setStatus('');
  } catch (e) {
    console.error(e);
    ctx.setStatus('Les devoirs n\'ont pas pu être chargés (connexion internet ?). Rechargez la page.', true);
    return;
  }
  if (draft) renderEditor(); else renderList();
}

/* ===== Calcul des états ===== */

function deadlineOf(a) {
  const [y, m, d] = String(a.due || '').split('-').map(Number);
  return y ? new Date(y, m - 1, d, 23, 59, 59, 999).getTime() : Infinity;
}

const chapterOf = (track, folder) => (contents[track] || []).find(c => c.folder === folder) || null;

function summaryFor(email, chapter) {
  const key = email + '|' + chapter.id;
  if (!summaryCache.has(key)) {
    const w = ctx.work[email] || { chapters: {}, history: {} };
    summaryCache.set(key, summarizeChapter(chapter, w.chapters[chapter.id], (w.history || {})[chapter.id]));
  }
  return summaryCache.get(key);
}

// { done, at } d'un élément pour un élève ; at = date du premier « fait » (ms) ou null.
function itemState(track, email, item) {
  const chapter = chapterOf(track, item.ch);
  if (!chapter) return { done: false, at: null };
  const s = summaryFor(email, chapter);
  let done = false;
  let key = '';
  if (item.k === 'ex') {
    const ex = (s.levels[item.lv] || []).find(e => String(e.id) === String(item.id));
    done = !!(ex && ex.state);
    key = `ex::${item.lv}::${item.id}`;
  } else if (item.k === 'game') {
    const g = s.games.find(x => x.id === item.id);
    done = !!(g && g.done);
    key = `game::${item.id}`;
  } else {
    const l = s.labs.find(x => x.id === item.id);
    done = !!(l && l.result && l.result.checks > 0);
    key = `lab::${item.id}`;
  }
  const doc = ((ctx.work[email] || {}).chapters || {})[chapter.id] || {};
  const at = done ? Number((doc.doneAt || {})[key]) || null : null;
  return { done, at };
}

// { status, done, total, items, upcoming } ; upcoming = date limite pas encore passée.
function studentState(a, email) {
  const deadline = deadlineOf(a);
  const items = (a.items || []).map(item => Object.assign({ item }, itemState(a.track, email, item)));
  const done = items.filter(i => i.done).length;
  const total = items.length;
  let status = 'missing';
  if (total && done === total) status = items.some(i => i.at && i.at > deadline) ? 'late' : 'done';
  else if (done * 2 > total) status = 'partial';
  const finished = status === 'done' || status === 'late';
  return { status, done, total, items, upcoming: !finished && Date.now() <= deadline };
}

/* ===== Numéros ===== */

// Année scolaire d'une date limite : du 15 août au 14 août suivant.
function schoolYear(due) {
  const [y, m, d] = String(due || '').split('-').map(Number);
  if (!y) return 0;
  return m > 8 || (m === 8 && d >= 15) ? y : y - 1;
}

const inClass = (email, classId) => !!ctx.students[email] && ctx.students[email].classe === classId;

// Classes qui reçoivent un numéro : au moins la moitié de leurs élèves destinataires.
function numberedClasses(a) {
  return (a.classes || []).filter(id => {
    const size = Object.keys(ctx.students).filter(e => inClass(e, id)).length;
    const n = (a.recipients || []).filter(e => inClass(e, id)).length;
    return size > 0 && n * 2 >= size;
  });
}

/* Numéros du devoir `a` (id `selfId`) : ceux déjà attribués restent ; une
   classe numérotée qui n'en a pas reçoit le plus grand numéro de la classe
   cette année + 1. */
function numbersFor(a, selfId) {
  const out = {};
  Object.keys(a.numbers || {}).forEach(id => { if ((a.classes || []).includes(id)) out[id] = a.numbers[id]; });
  const year = schoolYear(a.due);
  numberedClasses(a).forEach(id => {
    if (out[id]) return;
    let max = 0;
    assignments.forEach(o => {
      if (o.id === selfId || schoolYear(o.due) !== year) return;
      max = Math.max(max, Number((o.numbers || {})[id]) || 0);
    });
    out[id] = max + 1;
  });
  return out;
}

// Titre vu par une classe : « Science homework 4 » (sans numéro : titre seul).
function titleFor(a, classId) {
  const n = (a.numbers || {})[classId];
  return n ? `${a.title} ${n}` : a.title;
}

/* ===== Libellés des éléments ===== */

function itemTitle(track, item) {
  const chapter = chapterOf(track, item.ch);
  if (!chapter) return { chapter: item.ch, label: String(item.id), title: '' };
  if (item.k === 'ex') {
    const ex = (chapter.levels[item.lv] || []).find(e => String(e.id) === String(item.id));
    return { chapter: chapter.short, label: `Niveau ${LEVEL_NUM[item.lv]} · ex. ${item.id}`, title: ex ? ex.title : '' };
  }
  if (item.k === 'game') {
    const g = chapter.games.find(x => x.id === item.id);
    return { chapter: chapter.short, label: g ? g.typeLabel : 'Jeu', title: g ? g.title : item.id };
  }
  const l = chapter.labs.find(x => x.id === item.id);
  return { chapter: chapter.short, label: 'Labo', title: l ? l.title : item.id };
}

function itemLink(track, item) {
  const chapter = chapterOf(track, item.ch);
  if (!chapter) return SITE_ROOT;
  const page = item.k === 'lab' ? 'laboratory.html' : 'practice.html';
  const query = item.k === 'ex' ? `level=${item.lv}&exercise=${item.id}`
    : item.k === 'game' ? `game=${encodeURIComponent(item.id)}` : `lab=${encodeURIComponent(item.id)}`;
  return new URL(`${chapter.base}${page}?${query}`, SITE_ROOT).href;
}

function formatDue(due, locale) {
  const [y, m, d] = String(due || '').split('-').map(Number);
  if (!y) return '';
  return new Date(y, m - 1, d).toLocaleDateString(locale || 'fr-BE', { weekday: 'long', day: 'numeric', month: 'long' });
}

/* ===== Mail ===== */

function buildMail(a, email) {
  const t = MAIL[a.track] || MAIL.en;
  const person = ctx.students[email] || {};
  const first = person.prenom || '';
  const groups = [];
  groupedItems(a.track, a.items || []).forEach(run => {
    const chapter = run.chapter;
    const item = run.items[0];
    let g = groups.find(x => x.ch === run.ch);
    if (!g) groups.push(g = { ch: run.ch, title: chapter ? chapter.title : run.ch, lines: [] });
    let label;
    if (item.k === 'ex' && run.items.length > 1) {
      // Série : un seul lien, vers le premier ; l'élève enchaîne dans la fenêtre d'exercice.
      label = t.exercises(LEVEL_NUM[item.lv], item.id, run.items[run.items.length - 1].id);
    } else if (item.k === 'ex') {
      const ex = chapter && (chapter.levels[item.lv] || []).find(e => String(e.id) === String(item.id));
      label = t.exercise(LEVEL_NUM[item.lv], item.id) + (ex && ex.title ? ` — ${ex.title}` : '');
    } else if (item.k === 'game') {
      const game = chapter && chapter.games.find(x => x.id === item.id);
      label = `${t.games[game ? game.type : ''] || 'Game'} — ${game ? game.title : item.id}`;
    } else {
      const lab = chapter && chapter.labs.find(x => x.id === item.id);
      label = `${t.lab} — ${lab ? lab.title : item.id}`;
    }
    g.lines.push({ label, link: itemLink(a.track, item) });
  });
  const due = t.due(formatDue(a.due, t.locale));
  const message = String(a.message || '').trim();
  const signature = ctx.myName;

  const text = [first ? t.hello(first) : t.hello('').replace(/ ,$/, ','), '']
    .concat(message ? [message, ''] : [])
    .concat([due, ''])
    .concat(...groups.map(g => [g.title].concat(g.lines.map(l => `- ${l.label}: ${l.link}`), [''])))
    .concat([signature]).join('\n');

  const html = `<p>${esc(first ? t.hello(first) : t.hello('').replace(/ ,$/, ','))}</p>` +
    (message ? `<p>${esc(message).replace(/\n/g, '<br>')}</p>` : '') +
    `<p><strong>${esc(due)}</strong></p>` +
    groups.map(g => `<p style="margin-bottom:4px">${esc(g.title)}</p><ul style="margin-top:0">${g.lines.map(l =>
      `<li><a href="${esc(l.link)}">${esc(l.label)}</a></li>`).join('')}</ul>`).join('') +
    `<p>${esc(signature)}</p>`;

  const shortDue = (() => {
    const [y, m, d] = String(a.due || '').split('-').map(Number);
    return y ? new Date(y, m - 1, d).toLocaleDateString(t.locale, { weekday: 'short', day: 'numeric', month: 'short' }) : '';
  })();
  return {
    to: email,
    toName: [person.prenom, person.nom].filter(Boolean).join(' '),
    subject: shortDue ? t.subject(titleFor(a, person.classe), shortDue) : titleFor(a, person.classe),
    text, html
  };
}

/* ===== Liste des devoirs =====
   Un seul choix de classe en haut de l'onglet, pour la liste et
   l'assiduité (retenu sur l'appareil). Une classe choisie : ses devoirs,
   ses élèves seulement, son numéro dans le titre. */

const ALL = '__all__';

function selectedClass() {
  const ids = ctx.sortedClassIds();
  const saved = ctx.prefs.homeworkClass;
  return saved === ALL || ids.includes(saved) ? saved : (ids[0] || ALL);
}

function recipientsOf(a, classId) {
  return (a.recipients || []).filter(e => !classId || classId === ALL || inClass(e, classId))
    .sort((x, y) => nameOf(x).localeCompare(nameOf(y), 'fr'));
}

function nameOf(email) {
  const p = ctx.students[email];
  return p ? `${p.nom || ''} ${p.prenom || ''}`.trim() : email;
}

function displayName(email) {
  const p = ctx.students[email];
  return p ? `${p.prenom || ''} ${p.nom || ''}`.trim() : email;
}

function countStates(a, emails) {
  const c = { done: 0, late: 0, partial: 0, missing: 0, upcoming: 0 };
  emails.forEach(email => {
    const st = studentState(a, email);
    c[st.status]++;
    if (st.upcoming) c.upcoming++;
  });
  return c;
}

const countsText = c => STATUS_ORDER.filter(k => c[k]).map(k => `${c[k]} ${STATUS[k].label.toLowerCase()}`).join(' · ') || '—';

function statusBar(c, total) {
  const parts = STATUS_ORDER.map(k => ({ value: c[k], color: STATUS[k].color }));
  const tip = STATUS_ORDER.map(k => `${c[k]} ${STATUS[k].label.toLowerCase()}`).join('<br>') +
    (c.upcoming ? `<br><span class="d-tip-muted">dont ${c.upcoming} pas fini(s) avant la date limite</span>` : '');
  return stackBar(parts, total, tip, countsText(c));
}

// Titre dans la liste : avec le numéro de la classe choisie, ou tous les numéros.
function listTitle(a, classId) {
  if (classId !== ALL) return esc(titleFor(a, classId) || 'Sans titre');
  const nums = Object.keys(a.numbers || {}).sort().map(id => `${esc(id)} n° ${a.numbers[id]}`);
  return esc(a.title || 'Sans titre') + (nums.length ? ` <span class="h-nums">${nums.join(', ')}</span>` : '');
}

function renderList() {
  const classId = selectedClass();
  const classIds = ctx.sortedClassIds();
  const shown = assignments.filter(a => classId === ALL || recipientsOf(a, classId).length);
  const rows = shown.map(a => {
    const emails = recipientsOf(a, classId);
    const c = countStates(a, emails);
    const sent = a.sentAt && typeof a.sentAt.toDate === 'function'
      ? a.sentAt.toDate().toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' })
      : '<span class="d-zero">pas envoyé</span>';
    const isOpen = openId === a.id;
    const individual = classId !== ALL && !(a.numbers || {})[classId] && a.sentAt;
    return `<tr class="h-row${isOpen ? ' is-open' : ''}">
        <td><button type="button" class="h-link" data-open="${esc(a.id)}" aria-expanded="${isOpen}">${listTitle(a, classId)}</button>
          <span class="d-cell-note">${(a.items || []).length} élément(s) · ${a.track === 'nl' ? 'NL' : 'EN'}${individual ? ' · envoi individuel, sans numéro' : ''}</span></td>
        <td>${esc((a.classes || []).join(', ') || '—')}</td>
        <td>${esc(formatDue(a.due))}</td>
        <td>${sent}</td>
        <td class="h-col-bar">${statusBar(c, emails.length)}<span class="d-cell-note">${countsText(c)}</span></td>
        <td class="h-actions"><button type="button" class="t-btn" data-edit="${esc(a.id)}">Modifier</button>
          <button type="button" class="t-btn t-btn-danger" data-delete="${esc(a.id)}">Supprimer</button></td>
      </tr>${isOpen ? `<tr class="h-detail"><td colspan="6">${detailHtml(a, emails)}</td></tr>` : ''}`;
  }).join('');

  root.innerHTML = `
    <section class="t-section">
      <div class="h-head">
        <h2>Devoirs</h2>
        <div class="h-head-tools">
          <label>Classe <select id="h-class">
            ${classIds.map(id => `<option value="${esc(id)}"${id === classId ? ' selected' : ''}>${esc(id)}</option>`).join('')}
            <option value="${ALL}"${classId === ALL ? ' selected' : ''}>Toutes les classes</option>
          </select></label>
          <button type="button" class="t-btn t-btn-primary" id="h-new">Nouveau devoir</button>
        </div>
      </div>
      <p class="t-help">Un devoir regroupe des exercices, des jeux et des labos, avec une date limite. Il est envoyé
        par mail depuis votre adresse, un mail par élève. <strong>Fait</strong> : tout est fait au plus tard à la date
        limite (le travail fait avant le devoir compte) ; <strong>fait en retard</strong> : une partie après la date
        limite ; <strong>partiellement fait</strong> : plus de la moitié ; <strong>non fait</strong> : la moitié ou moins.
        Cliquez sur un titre pour voir chaque élève.</p>
      ${shown.length ? `<div class="t-scroll"><table class="t-table h-table">
        <thead><tr><th>Devoir</th><th>Classes</th><th>Date limite</th><th>Envoyé</th><th>Élèves</th><th></th></tr></thead>
        <tbody>${rows}</tbody></table></div>
        ${legend(STATUS_ORDER.map(k => STATUS[k]))}`
      : `<p class="d-empty">Aucun devoir${classId === ALL ? '' : ' pour cette classe'} pour l'instant.</p>`}
    </section>
    <section class="t-section" id="h-summary"></section>`;

  root.querySelector('#h-class').addEventListener('change', e => {
    ctx.prefs.homeworkClass = e.target.value;
    ctx.savePrefs();
    renderList();
  });
  root.querySelector('#h-new').addEventListener('click', () => startDraft(null));
  root.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => {
    openId = openId === b.dataset.open ? null : b.dataset.open;
    renderList();
  }));
  root.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () =>
    startDraft(assignments.find(a => a.id === b.dataset.edit))));
  root.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', async () => {
    const a = assignments.find(x => x.id === b.dataset.delete);
    if (!a || !(await ctx.confirmBox(`Supprimer le devoir « ${a.title} » ? Les mails déjà envoyés restent dans les boîtes des élèves ; le travail des élèves n'est pas touché.`, 'Supprimer'))) return;
    try {
      const batch = fb.writeBatch(fb.db);
      batch.delete(fb.doc(fb.db, 'assignments', a.id));
      await batch.commit();
      assignments = assignments.filter(x => x.id !== a.id);
      assignmentsRead = null;
      ctx.setStatus('Devoir supprimé.');
    } catch (e) {
      console.error(e);
      ctx.setStatus('La suppression a échoué : ' + (e.code || e.message), true);
    }
    renderList();
  }));
  renderSummary(classId);
}

function detailHtml(a, emails) {
  const deadline = deadlineOf(a);
  const rows = emails.map(email => {
    const st = studentState(a, email);
    const person = ctx.students[email];
    const cells = st.items.map(i => {
      const t = itemTitle(a.track, i.item);
      const late = i.done && i.at && i.at > deadline;
      const when = i.at ? ` le ${new Date(i.at).toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' })}` : '';
      return {
        color: !i.done ? TRACK : late ? STATUS.late.color : STATUS.done.color,
        tip: `<strong>${esc(t.chapter)} · ${esc(t.label)}</strong>${t.title ? '<br>' + esc(t.title) : ''}<br>` +
          (!i.done ? 'pas encore fait' : late ? `fait en retard${when}` : `fait${when}`)
      };
    });
    const status = STATUS[st.status];
    return `<tr><td>${esc(displayName(email))}</td><td>${esc(person ? person.classe : 'Non classé·e')}</td>
      <td><span class="d-swatch" style="background:${status.color}"></span>${esc(status.label)}${st.upcoming ? ' <span class="d-cell-note">(date limite pas passée)</span>' : ''}</td>
      <td class="h-col-cells">${cellsBar(cells, `${st.done} sur ${st.total} éléments faits`)}<span class="d-cell-note">${st.done}/${st.total}</span></td></tr>`;
  }).join('');
  // Regroupé comme dans le mail : les exercices qui se suivent sur une ligne.
  const items = groupedItems(a.track, a.items || []).map(run => {
    const first = run.items[0];
    const t = itemTitle(a.track, first);
    const label = first.k === 'ex' && run.items.length > 1
      ? `Niveau ${LEVEL_NUM[first.lv]} · ex. ${first.id} à ${run.items[run.items.length - 1].id}`
      : t.label + (t.title ? ` — ${t.title}` : '');
    return `<li><a href="${esc(itemLink(a.track, first))}" target="_blank" rel="noopener">${esc(t.chapter)} · ${esc(label)}</a></li>`;
  }).join('');
  return `<div class="h-detail-body">
      <div><h3>Contenu</h3><ol class="h-items">${items}</ol></div>
      <div><h3>Élèves (${emails.length})</h3>
        <table class="t-table h-students"><thead><tr><th>Élève</th><th>Classe</th><th>État</th><th>Éléments</th></tr></thead>
        <tbody>${rows}</tbody></table></div>
    </div>`;
}

/* ===== Assiduité : résumé par élève ===== */

function renderSummary(classId) {
  const box = root.querySelector('#h-summary');
  const emails = Object.keys(ctx.students).filter(e => classId === ALL || inClass(e, classId));
  const rows = emails.map(email => {
    const c = { received: 0, done: 0, late: 0, partial: 0, missing: 0, upcoming: 0 };
    assignments.forEach(a => {
      if (!(a.recipients || []).includes(email)) return;
      c.received++;
      const st = studentState(a, email);
      if (st.upcoming) c.upcoming++;
      else c[st.status]++;
    });
    const counted = c.done + c.late + c.partial + c.missing;
    c.counted = counted;
    c.rate = counted ? Math.round(100 * c.done / counted) : null;
    return { email, c };
  }).sort((x, y) => (x.c.rate === null) - (y.c.rate === null) || (x.c.rate || 0) - (y.c.rate || 0)
    || nameOf(x.email).localeCompare(nameOf(y.email), 'fr'));

  const num = n => n ? n : '<span class="d-zero">0</span>';
  box.innerHTML = `
    <h2>Assiduité${classId === ALL ? ' — toutes les classes' : ` — ${esc(classId)}`}</h2>
    <p class="t-help">Tous les devoirs reçus par chaque élève depuis le début. Un devoir pas fini dont la date limite
      n'est pas passée est compté « à venir ». % à temps = devoirs faits à temps parmi ceux dont la date limite est
      passée (ou déjà faits). Classement : le plus faible % d'abord. Le détail devoir par devoir est dans la fiche de l'élève.</p>
    ${rows.length ? `<div class="t-scroll"><table class="t-table h-table">
      <thead><tr><th>Élève</th><th>Classe</th><th class="d-num">Reçus</th><th class="d-num">Faits à temps</th>
        <th class="d-num">En retard</th><th class="d-num">Partiels</th><th class="d-num">Non faits</th><th class="d-num">À venir</th>
        <th class="h-col-bar">À temps</th></tr></thead>
      <tbody>${rows.map(({ email, c }) => `<tr><td>${esc(displayName(email))}</td><td>${esc(ctx.students[email].classe || '')}</td>
        <td class="d-num">${num(c.received)}</td><td class="d-num">${num(c.done)}</td><td class="d-num">${num(c.late)}</td>
        <td class="d-num">${num(c.partial)}</td><td class="d-num">${num(c.missing)}</td><td class="d-num">${num(c.upcoming)}</td>
        <td class="h-col-bar">${c.rate === null ? '<span class="d-zero">—</span>' : `${stackBar(STATUS_ORDER.map(k => ({ value: c[k], color: STATUS[k].color })), c.counted,
          countsText(c), `${c.rate} % à temps`)}<span class="d-cell-note">${c.rate} % à temps</span>`}</td></tr>`).join('')}</tbody>
    </table></div>` : '<p class="d-empty">Aucun élève dans cette classe.</p>'}`;
}
/* ===== Composition ===== */

const itemKey = item => [item.ch, item.k, item.lv || '', item.id].join('|');

function keyToItem(key) {
  const [ch, k, lv, id] = key.split('|');
  const item = { ch, k, id: k === 'ex' ? Number(id) : id };
  if (k === 'ex') item.lv = lv;
  return item;
}

function nextWeek() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* Titre et message : proposés d'office (titre fixe de la filière, message
   composé selon ce qui est coché) et modifiables. Tant que l'enseignante n'y
   a pas touché (titleAuto / messageAuto), ils suivent la filière et le
   contenu ; dès qu'elle les modifie, ils ne bougent plus. */
function startDraft(a) {
  const firstClass = ctx.sortedClassIds().find(id => ctx.classes[id].teacher === ctx.me);
  draft = a ? {
    id: a.id,
    title: a.title || '',
    due: a.due || nextWeek(),
    message: a.message || '',
    classes: new Set(a.classes || []),
    recipients: new Set(a.recipients || []),
    items: (a.items || []).map(itemKey),
    sent: !!a.sentAt,
    numbers: Object.assign({}, a.numbers || {}),
    chapter: null
  } : {
    id: null, title: '', due: nextWeek(), message: '', classes: new Set(firstClass ? [firstClass] : []),
    recipients: new Set(), items: [], sent: false, numbers: {}, chapter: null
  };
  if (!a && firstClass) studentsOf(firstClass).forEach(e => draft.recipients.add(e));
  const track = draftTrack();
  draft.titleAuto = !a || !track || draft.title === (MAIL[track] || MAIL.en).title;
  draft.messageAuto = !a || !track || draft.message === proposedMessage(track, (a.items || []));
  applyAuto();
  ctx.setStatus('');
  renderEditor();
  window.scrollTo(0, 0);
}

function applyAuto() {
  const track = draftTrack();
  if (!track) return;
  if (draft.titleAuto) draft.title = (MAIL[track] || MAIL.en).title;
  if (draft.messageAuto) draft.message = proposedMessage(track, draft.items.map(keyToItem));
}

// Après un changement de filière ou de contenu : titre et message proposés à jour à l'écran.
function refreshAuto() {
  applyAuto();
  const title = root.querySelector('#h-title');
  const message = root.querySelector('#h-message');
  if (draft.titleAuto && title) title.value = draft.title;
  if (draft.messageAuto && message) message.value = draft.message;
  const reset = root.querySelector('#h-message-reset');
  if (reset) reset.hidden = draft.messageAuto;
}

function draftTrack() {
  const first = Array.from(draft.classes)[0];
  return first && ctx.classes[first] ? ctx.classes[first].track : null;
}

function studentsOf(classId) {
  return Object.keys(ctx.students).filter(e => ctx.students[e].classe === classId)
    .sort((x, y) => nameOf(x).localeCompare(nameOf(y), 'fr'));
}

function renderEditor() {
  root.innerHTML = `
    <section class="t-section h-editor">
      <div class="h-head">
        <h2>${draft.id ? 'Modifier le devoir' : 'Nouveau devoir'}</h2>
        <button type="button" class="t-btn" id="h-cancel">Retour à la liste</button>
      </div>
      <div class="h-row-fields">
        <label class="h-field h-field-title"><span>Titre (la date limite s'ajoute dans l'objet du mail)</span>
          <input type="text" id="h-title" maxlength="150" value="${esc(draft.title)}" /></label>
        <label class="h-field"><span>Date limite</span>
          <input type="date" id="h-due" value="${esc(draft.due)}" /></label>
      </div>
      <div class="h-grid">
        <div class="h-field"><span>Classes</span><div id="h-classes"></div></div>
        <div class="h-field"><span>Élèves</span><div id="h-recipients"></div></div>
      </div>
      <div class="h-field"><span>Contenu</span><div id="h-content"></div></div>
      <div class="h-grid">
        <div class="h-field"><span>Message (après « Hello / Hallo + prénom », avant la date limite et les liens)</span>
          <textarea id="h-message" class="h-message" maxlength="5000">${esc(draft.message)}</textarea>
          <button type="button" class="h-mini" id="h-message-reset"${draft.messageAuto ? ' hidden' : ''}>Revenir au texte proposé</button></div>
        <div class="h-field"><span>Aperçu du mail</span><div id="h-preview" class="h-preview"></div></div>
      </div>
      <p class="h-warning" id="h-warning" role="status" hidden></p>
      <div class="t-form-row h-submit">
        <button type="button" class="t-btn t-btn-primary" id="h-send"></button>
        <button type="button" class="t-btn" id="h-save">Enregistrer sans envoyer</button>
        <span class="t-help" id="h-progress" role="status"></span>
      </div>
    </section>`;

  root.querySelector('#h-cancel').addEventListener('click', () => { draft = null; renderList(); });
  root.querySelector('#h-title').addEventListener('input', e => {
    draft.title = e.target.value;
    draft.titleAuto = false;
    renderPreview();
  });
  root.querySelector('#h-due').addEventListener('input', e => { draft.due = e.target.value; renderPreview(); });
  root.querySelector('#h-message').addEventListener('input', e => {
    draft.message = e.target.value;
    draft.messageAuto = false;
    root.querySelector('#h-message-reset').hidden = false;
    renderPreview();
  });
  root.querySelector('#h-message-reset').addEventListener('click', () => {
    draft.messageAuto = true;
    refreshAuto();
    renderPreview();
  });
  root.querySelector('#h-send').addEventListener('click', () => submit(true));
  root.querySelector('#h-save').addEventListener('click', () => submit(false));
  renderClasses();
  renderRecipients();
  renderContent();
  renderPreview();
}

function renderClasses() {
  const box = root.querySelector('#h-classes');
  const track = draftTrack();
  box.innerHTML = `<div class="h-checks">${ctx.sortedClassIds().map(id => {
    const c = ctx.classes[id];
    const other = track && c.track !== track;
    return `<label class="h-check${other ? ' is-off' : ''}"${other ? ' title="Autre filière : un devoir ne porte que sur une filière"' : ''}>
      <input type="checkbox" data-class="${esc(id)}"${draft.classes.has(id) ? ' checked' : ''}${other ? ' disabled' : ''} />
      ${esc(id)} <span class="d-cell-note">${c.track === 'nl' ? 'NL' : 'EN'} · ${esc(ctx.teacherName(c.teacher))}</span></label>`;
  }).join('')}</div>${track ? '' : '<p class="t-help">Cochez au moins une classe.</p>'}`;
  box.querySelectorAll('[data-class]').forEach(cb => cb.addEventListener('change', () => {
    const id = cb.dataset.class;
    const before = draftTrack();
    if (cb.checked) { draft.classes.add(id); studentsOf(id).forEach(e => draft.recipients.add(e)); }
    else { draft.classes.delete(id); studentsOf(id).forEach(e => draft.recipients.delete(e)); }
    // Filière changée (plus aucune classe, puis une autre) : le contenu choisi ne vaut plus.
    if (draftTrack() !== before && draftTrack()) { draft.items = []; draft.chapter = null; }
    refreshAuto();
    renderClasses();
    renderRecipients();
    renderContent();
    renderPreview();
  }));
}

function renderRecipients() {
  const box = root.querySelector('#h-recipients');
  const ids = ctx.sortedClassIds().filter(id => draft.classes.has(id));
  // Destinataires d'un devoir modifié qui ne sont plus dans ces classes : gardés, montrés à part.
  const listed = new Set(ids.flatMap(studentsOf));
  const others = Array.from(draft.recipients).filter(e => !listed.has(e));
  const group = (title, emails, id) => `<div class="h-group">
      <div class="h-group-head"><strong>${esc(title)}</strong>
        <span class="d-cell-note">${emails.filter(e => draft.recipients.has(e)).length}/${emails.length}</span>
        <button type="button" class="h-mini" data-all="${esc(id)}">Tous</button>
        <button type="button" class="h-mini" data-none="${esc(id)}">Aucun</button></div>
      <div class="h-checks h-students-list">${emails.map(e => `<label class="h-check">
        <input type="checkbox" data-student="${esc(e)}"${draft.recipients.has(e) ? ' checked' : ''} />${esc(displayName(e))}</label>`).join('')}</div>
    </div>`;
  box.innerHTML = ids.map(id => group(`Classe ${id}`, studentsOf(id), id)).join('') +
    (others.length ? group('Autres destinataires', others, '__others__') : '') +
    (ids.length || others.length ? '' : '<p class="t-help">Les élèves des classes cochées apparaîtront ici.</p>');
  const emailsOf = id => id === '__others__' ? others : studentsOf(id);
  box.querySelectorAll('[data-student]').forEach(cb => cb.addEventListener('change', () => {
    if (cb.checked) draft.recipients.add(cb.dataset.student); else draft.recipients.delete(cb.dataset.student);
    renderRecipients();
    renderPreview();
  }));
  box.querySelectorAll('[data-all]').forEach(b => b.addEventListener('click', () => {
    emailsOf(b.dataset.all).forEach(e => draft.recipients.add(e)); renderRecipients(); renderPreview();
  }));
  box.querySelectorAll('[data-none]').forEach(b => b.addEventListener('click', () => {
    emailsOf(b.dataset.none).forEach(e => draft.recipients.delete(e)); renderRecipients(); renderPreview();
  }));
}

/* Choix du contenu : le chapitre entier d'un coup d'œil, une colonne par
   niveau, puis jeux et labos. Cocher ne redessine pas la liste (elle
   resterait sinon remise en haut) : seules la sélection et l'aperçu
   changent. Maj + clic coche ou décoche toute la plage depuis le clic
   précédent, dans la même colonne. */
let lastChecked = null;
let given = new Map();

/* Éléments déjà donnés cette année scolaire aux classes cochées (autres
   devoirs) : clé → ['n° 3 (1C)', …]. Signalés, jamais interdits : on peut
   vouloir redonner un exercice exprès. */
function givenItems() {
  const out = new Map();
  const year = schoolYear(draft.due);
  assignments.forEach(o => {
    if (o.id === draft.id || schoolYear(o.due) !== year) return;
    const classes = (o.classes || []).filter(id => draft.classes.has(id) && (o.recipients || []).some(e => inClass(e, id)));
    if (!classes.length) return;
    const tags = classes.map(id => (o.numbers || {})[id] ? `n° ${o.numbers[id]} (${id})`
      : `${o.sentAt ? 'envoi individuel' : 'devoir pas encore envoyé'} (${id})`);
    (o.items || []).forEach(item => {
      const key = itemKey(item);
      out.set(key, (out.get(key) || []).concat(tags));
    });
  });
  return out;
}

function renderContent() {
  const box = root.querySelector('#h-content');
  const track = draftTrack();
  if (!track) { box.innerHTML = '<p class="t-help">Choisissez d\'abord une classe : le contenu dépend de sa filière.</p>'; return; }
  const chapters = (contents[track] || []).filter(c => c.exerciseCount || c.games.length || c.labs.length);
  if (!chapters.find(c => c.folder === draft.chapter)) draft.chapter = chapters.length ? chapters[0].folder : null;
  const chapter = chapters.find(c => c.folder === draft.chapter);
  const chosen = new Set(draft.items);
  given = givenItems();
  const check = (item, label, title) => {
    const key = itemKey(item);
    const tags = given.get(key);
    return `<label class="h-check h-item${tags ? ' is-given' : ''}"${title ? ` title="${esc(title)}"` : ''}><input type="checkbox" data-item="${esc(key)}"${chosen.has(key) ? ' checked' : ''} />
      <span class="h-item-body"><span class="h-item-text"><strong>${esc(label)}</strong>${title ? ` <span class="h-item-title">${esc(title)}</span>` : ''}</span>
      ${tags ? `<span class="h-given">déjà donné · ${esc(tags.join(', '))}</span>` : ''}</span></label>`;
  };
  const columns = [];
  if (chapter) {
    LEVELS.forEach(lv => {
      const list = chapter.levels[lv];
      if (list.length) columns.push(`<div class="h-pick-col"><h4>Niveau ${LEVEL_NUM[lv]}</h4>${list.map(ex =>
        check({ ch: chapter.folder, k: 'ex', lv, id: ex.id }, `Ex. ${ex.id}`, ex.title)).join('')}</div>`);
    });
    if (chapter.games.length) columns.push(`<div class="h-pick-col"><h4>Jeux</h4>${chapter.games.map(g =>
      check({ ch: chapter.folder, k: 'game', id: g.id }, g.typeLabel, g.title)).join('')}</div>`);
    if (chapter.labs.length) columns.push(`<div class="h-pick-col"><h4>Labos</h4>${chapter.labs.map(l =>
      check({ ch: chapter.folder, k: 'lab', id: l.id }, 'Labo', l.title)).join('')}</div>`);
  }
  box.innerHTML = `
    <div class="h-content-head">
      <label>Chapitre <select id="h-chapter">${chapters.map(c =>
        `<option value="${esc(c.folder)}"${c.folder === draft.chapter ? ' selected' : ''}>${esc(c.short)} — ${esc(c.title)}</option>`).join('')}</select></label>
      <span class="t-help">Astuce : Maj + clic coche toute une plage (ex. 1, puis Maj + clic sur 10).</span>
    </div>
    <div class="h-picker">${columns.join('') || '<p class="t-help">Rien à donner dans ce chapitre.</p>'}</div>
    <div id="h-selection"></div>`;
  lastChecked = null;
  // Maj lue au mousedown : un clic sur le texte de la case passe par le
  // <label>, et le clic qu'il relaie à la case ne garde pas toujours Maj.
  let shift = false;
  box.querySelector('.h-picker').addEventListener('mousedown', e => { shift = e.shiftKey; });
  box.querySelector('#h-chapter').addEventListener('change', e => { draft.chapter = e.target.value; renderContent(); });
  box.querySelectorAll('[data-item]').forEach(cb => cb.addEventListener('click', e => {
    const col = cb.closest('.h-pick-col');
    const boxes = Array.from(col.querySelectorAll('[data-item]'));
    let targets = [cb];
    if ((e.shiftKey || shift) && lastChecked && lastChecked.closest('.h-pick-col') === col) {
      const [i, j] = [boxes.indexOf(lastChecked), boxes.indexOf(cb)].sort((x, y) => x - y);
      targets = boxes.slice(i, j + 1);
    }
    targets.forEach(t => {
      t.checked = cb.checked;
      draft.items = draft.items.filter(k => k !== t.dataset.item);
      if (cb.checked) draft.items.push(t.dataset.item);
    });
    lastChecked = cb;
    shift = false;
    contentChanged();
  }));
  renderSelection();
}

function contentChanged() {
  refreshAuto();
  renderSelection();
  renderPreview();
}

// Sélection, regroupée comme dans le mail (séries d'exercices qui se suivent).
function renderSelection() {
  const box = root.querySelector('#h-selection');
  if (!box) return;
  const track = draftTrack();
  const runs = groupedItems(track, draft.items.map(keyToItem));
  const lines = runs.map((run, i) => {
    const first = run.items[0];
    const t = itemTitle(track, first);
    const label = first.k === 'ex' && run.items.length > 1
      ? `Niveau ${LEVEL_NUM[first.lv]} · ex. ${first.id} à ${run.items[run.items.length - 1].id}`
      : t.label + (t.title ? ` — ${t.title}` : '');
    return `<li>${esc(t.chapter)} · ${esc(label)}
      <button type="button" class="h-mini" data-remove="${i}">Retirer</button></li>`;
  }).join('');
  box.innerHTML = `<h4>Sélection (${draft.items.length} élément${draft.items.length > 1 ? 's' : ''})</h4>
    ${draft.items.length ? `<ul class="h-items h-selection">${lines}</ul>` : '<p class="t-help">Cochez des exercices, des jeux ou des labos, dans un ou plusieurs chapitres.</p>'}`;
  const warning = root.querySelector('#h-warning') || { };
  const repeated = draft.items.filter(k => given.has(k));
  warning.hidden = !repeated.length;
  warning.textContent = repeated.length
    ? `${repeated.length} élément${repeated.length > 1 ? 's' : ''} déjà donné${repeated.length > 1 ? 's' : ''} cette année : ` +
      repeated.map(k => { const t = itemTitle(track, keyToItem(k)); return `${t.chapter} · ${t.label} (${given.get(k).join(', ')})`; }).join(' ; ') + '.'
    : '';
  box.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => {
    const removed = new Set(runs[Number(b.dataset.remove)].items.map(itemKey));
    draft.items = draft.items.filter(k => !removed.has(k));
    root.querySelectorAll('[data-item]').forEach(cb => { if (removed.has(cb.dataset.item)) cb.checked = false; });
    contentChanged();
  }));
}

function draftAssignment() {
  const track = draftTrack();
  return {
    title: draft.title.trim(),
    message: draft.message,
    track,
    due: draft.due,
    classes: ctx.sortedClassIds().filter(id => draft.classes.has(id)),
    recipients: Array.from(draft.recipients),
    numbers: Object.assign({}, draft.numbers),
    // Dans l'ordre du site, pas dans l'ordre des clics.
    items: track ? [].concat(...groupedItems(track, draft.items.map(keyToItem)).map(r => r.items)) : []
  };
}

function renderPreview() {
  const box = root.querySelector('#h-preview');
  const a = draftAssignment();
  const sendBtn = root.querySelector('#h-send');
  const n = a.recipients.length;
  sendBtn.textContent = `${draft.sent ? 'Enregistrer et renvoyer' : 'Enregistrer et envoyer'} à ${n} élève${n > 1 ? 's' : ''}`;
  if (!a.track || !a.items.length) { box.innerHTML = '<p class="t-help">L\'aperçu apparaîtra quand une classe et un contenu seront choisis.</p>'; return; }
  // Numéros tels qu'ils seraient attribués à l'envoi.
  a.numbers = numbersFor(a, draft.id);
  const sample = recipientsOf(a)[0];
  const mail = buildMail(a, sample || '');
  const sampleClass = sample && ctx.students[sample] ? ctx.students[sample].classe : '';
  const numberNote = !sampleClass || !a.numbers[sampleClass] ? ' <span class="d-cell-note">(sans numéro : envoi à moins de la moitié de la classe)</span>'
    : draft.numbers[sampleClass] ? '' : ' <span class="d-cell-note">(numéro attribué à l\'envoi)</span>';
  box.innerHTML = `<p class="h-preview-head"><strong>Objet :</strong> ${esc(mail.subject || '(sans titre)')}${numberNote}<br>
      <strong>À :</strong> ${sample ? esc(displayName(sample)) + (n > 1 ? ` (et ${n - 1} autre${n > 2 ? 's' : ''}, chacun avec son prénom)` : '') : '—'}</p>
    <div class="h-preview-body">${mail.html}</div>`;
}

function problems(a, sending) {
  const out = [];
  if (!a.title) out.push('un titre');
  if (!a.due) out.push('une date limite');
  if (!a.track) out.push('une classe');
  if (!a.items.length) out.push('au moins un exercice, jeu ou labo');
  if (sending && !a.recipients.length) out.push('au moins un élève');
  return out;
}

async function submit(sending) {
  const progress = root.querySelector('#h-progress');
  const a = draftAssignment();
  const missing = problems(a, sending);
  progress.classList.remove('is-error');
  if (missing.length) {
    progress.classList.add('is-error');
    progress.textContent = 'Il manque ' + missing.join(', ') + '.';
    return;
  }
  const buttons = root.querySelectorAll('#h-send, #h-save');
  buttons.forEach(b => { b.disabled = true; });
  try {
    // L'autorisation Google d'abord, tant que le clic est « frais » (fenêtre).
    if (sending) { progress.textContent = 'Autorisation Google…'; await authorize(ctx.me); }
    progress.textContent = 'Enregistrement…';
    // Numéros attribués au premier envoi seulement (enregistré sans envoi : pas de numéro).
    if (sending) a.numbers = numbersFor(a, draft.id);
    draft.numbers = Object.assign({}, a.numbers);
    const ref = draft.id ? fb.doc(fb.db, 'assignments', draft.id) : fb.doc(fb.collection(fb.db, 'assignments'));
    const data = Object.assign({}, a, { updatedAt: fb.serverTimestamp(), updatedBy: ctx.me });
    if (!draft.id) Object.assign(data, { createdAt: fb.serverTimestamp(), createdBy: ctx.me });
    await fb.setDoc(ref, data, { merge: true });
    draft.id = ref.id;

    if (sending) {
      const sent = [];
      const failed = [];
      const list = recipientsOf(a);
      for (let i = 0; i < list.length; i++) {
        progress.textContent = `Envoi ${i + 1} / ${list.length}…`;
        try { await sendMail(buildMail(a, list[i])); sent.push(list[i]); } catch (e) { console.error(e); failed.push({ email: list[i], error: e }); }
      }
      if (sent.length) await fb.setDoc(ref, { sentAt: fb.serverTimestamp(), sentBy: ctx.me, sentTo: sent }, { merge: true });
      if (failed.length) {
        draft.sent = sent.length > 0;
        progress.classList.add('is-error');
        progress.textContent = `${sent.length} mail(s) envoyé(s), ${failed.length} en échec (${failed.map(f => displayName(f.email)).join(', ')}) : ${failed[0].error.message}`;
        buttons.forEach(b => { b.disabled = false; });
        return;
      }
      ctx.setStatus(`Devoir enregistré et envoyé à ${sent.length} élève${sent.length > 1 ? 's' : ''}.`);
    } else {
      ctx.setStatus('Devoir enregistré (pas envoyé).');
    }
    draft = null;
    openId = ref.id;
    await renderHomeworkView(root, ctx);
  } catch (e) {
    console.error(e);
    progress.classList.add('is-error');
    progress.textContent = e.message || ('Échec : ' + (e.code || ''));
    buttons.forEach(b => { b.disabled = false; });
  }
}

/* ===== Fiche élève : ses devoirs =====
   Utilisé par dashboard-student.js. studentHomework() lit les devoirs reçus
   par l'élève (avant l'affichage de la fiche) ; les fonctions suivantes en
   tirent, pour tous les chapitres (folder = null) ou un seul chapitre, le
   résumé d'une carte et le détail. Dans un chapitre, seuls les éléments de
   ce chapitre comptent : un devoir sur deux chapitres apparaît dans les
   deux, avec l'état de sa partie. Mêmes calculs que l'onglet Devoirs. */

export async function studentHomework(email, context) {
  ctx = Object.assign({}, ctx || {}, context);
  const [list, en, nl] = await Promise.all([fetchAssignments(), ctx.content('en'), ctx.content('nl')]);
  contents = { en, nl };
  summaryCache = new Map();
  return {
    email,
    classId: (ctx.students[email] || {}).classe,
    list: list.filter(a => (a.recipients || []).includes(email))
      .sort((a, b) => (b.due || '').localeCompare(a.due || ''))
  };
}

function entriesFor(hw, folder) {
  return hw.list
    .map(a => folder ? Object.assign({}, a, { items: (a.items || []).filter(i => i.ch === folder) }) : a)
    .filter(a => (a.items || []).length)
    .map(a => ({ a, st: studentState(a, hw.email) }));
}

function tally(entries) {
  const c = { done: 0, late: 0, partial: 0, missing: 0, upcoming: 0 };
  entries.forEach(({ st }) => { if (st.upcoming) c.upcoming++; else c[st.status]++; });
  const counted = c.done + c.late + c.partial + c.missing;
  const text = STATUS_ORDER.filter(k => c[k]).map(k => `${c[k]} ${STATUS[k].label.toLowerCase()}`)
    .concat(c.upcoming ? [`${c.upcoming} à venir`] : []).join(' · ');
  return { c, counted, rate: counted ? Math.round(100 * c.done / counted) : null, text, received: entries.length };
}

/* Résumé d'une carte : { received, rate, parts, total, tip } ; parts =
   segments de la barre (à venir en gris, en fin de barre). received = 0 :
   aucun devoir (la carte le dit, on repère ainsi un élève oublié). */
export function homeworkSummary(hw, folder) {
  const entries = entriesFor(hw, folder);
  if (!entries.length) {
    return { received: 0, rate: null, parts: [], total: 0,
      tip: folder ? 'Aucun devoir reçu dans ce chapitre' : 'Aucun devoir reçu' };
  }
  const t = tally(entries);
  const tip = `<strong>${t.received} devoir${t.received > 1 ? 's' : ''} reçu${t.received > 1 ? 's' : ''}</strong>` +
    STATUS_ORDER.filter(k => t.c[k]).map(k => `<br><span class="d-swatch" style="background:${STATUS[k].color}"></span>${t.c[k]} ${esc(STATUS[k].label.toLowerCase())}`).join('') +
    (t.c.upcoming ? `<br><span class="d-swatch" style="background:${TRACK}"></span>${t.c.upcoming} à venir (date limite pas passée)` : '') +
    (t.rate === null ? '' : `<br><strong>${t.rate} % à temps</strong>`);
  return {
    received: t.received,
    rate: t.rate,
    parts: STATUS_ORDER.map(k => ({ value: t.c[k], color: STATUS[k].color })),
    total: t.received,
    tip
  };
}

// Détail : bilan, puis un devoir par ligne, du plus récent au plus ancien.
export function homeworkDetailHtml(hw, folder) {
  const entries = entriesFor(hw, folder);
  if (!entries.length) return '<p class="t-muted">Aucun devoir reçu dans ce chapitre.</p>';
  const t = tally(entries);
  const rows = entries.map(({ a, st }) => {
    const deadline = deadlineOf(a);
    const cells = st.items.map(i => {
      const it = itemTitle(a.track, i.item);
      const late = i.done && i.at && i.at > deadline;
      const when = i.at ? ` le ${new Date(i.at).toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' })}` : '';
      return {
        color: !i.done ? TRACK : late ? STATUS.late.color : STATUS.done.color,
        tip: `<strong>${esc(it.chapter)} · ${esc(it.label)}</strong>${it.title ? '<br>' + esc(it.title) : ''}<br>` +
          (!i.done ? 'pas encore fait' : late ? `fait en retard${when}` : `fait${when}`)
      };
    });
    const status = STATUS[st.status];
    const content = groupedItems(a.track, a.items || []).map(run => {
      const first = run.items[0];
      const it = itemTitle(a.track, first);
      return first.k === 'ex' && run.items.length > 1
        ? `${it.chapter} · niv. ${LEVEL_NUM[first.lv]} ex. ${first.id} à ${run.items[run.items.length - 1].id}`
        : `${it.chapter} · ${it.label}`;
    }).join(' ; ');
    return `<tr>
      <td><strong>${esc(titleFor(a, hw.classId) || 'Sans titre')}</strong><span class="d-cell-note">${esc(content)}</span></td>
      <td>${esc(formatDue(a.due))}</td>
      <td><span class="d-swatch" style="background:${status.color}"></span>${esc(status.label)}${st.upcoming ? ' <span class="d-cell-note">date limite pas passée</span>' : ''}</td>
      <td class="h-col-cells">${cellsBar(cells, `${st.done} sur ${st.total} éléments faits`)}<span class="d-cell-note">${st.done}/${st.total}</span></td>
    </tr>`;
  }).join('');
  return `<p class="s-hw-summary"><strong>${t.received} devoir${t.received > 1 ? 's' : ''} reçu${t.received > 1 ? 's' : ''}</strong> · ${esc(t.text)}${t.rate === null ? '' : ` · <strong>${t.rate} % à temps</strong>`}</p>
    ${t.counted ? `<div class="s-hw-bar">${stackBar(STATUS_ORDER.map(k => ({ value: t.c[k], color: STATUS[k].color })), t.counted, esc(t.text), `${t.rate} % à temps`)}</div>` : ''}
    <div class="t-scroll"><table class="t-table h-table s-hw-table">
      <thead><tr><th>Devoir</th><th>Date limite</th><th>État</th><th>Éléments</th></tr></thead>
      <tbody>${rows}</tbody></table></div>
    ${legend(STATUS_ORDER.map(k => STATUS[k]))}`;
}
