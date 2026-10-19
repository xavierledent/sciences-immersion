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
     createdAt/By, updatedAt/By, sentAt/By, sentTo [adresse]

   État d'un élève pour un devoir (décision du 2026-10-20) :
     fait            tout est fait au plus tard à la date limite (y compris
                     avant que le devoir soit donné) ;
     fait en retard  tout est fait, une partie après la date limite ;
     non fait        il manque au moins un élément.
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
  missing: { label: 'Non fait', color: LIGHT[1].color }
};
const LEVEL_NUM = { level1: 1, level2: 2, level3: 3 };

// Parties fixes du mail, dans la langue de la filière.
const MAIL = {
  en: {
    locale: 'en-GB',
    hello: name => `Hello ${name},`,
    due: date => `To do by ${date}:`,
    exercise: (lv, n) => `Exercise ${n} (Level ${lv})`,
    lab: 'Lab',
    games: { multipleChoice: 'Quiz', fillBlanks: 'Fill in the blanks', dragAndDrop: 'Drag and drop', matchPairs: 'Memory', sorting: 'Sorting' }
  },
  nl: {
    locale: 'nl-BE',
    hello: name => `Hallo ${name},`,
    due: date => `Te doen tegen ${date}:`,
    exercise: (lv, n) => `Oefening ${n} (Level ${lv})`,
    lab: 'Labo',
    games: { multipleChoice: 'Quiz', fillBlanks: 'Invuloefening', dragAndDrop: 'Sleepoefening', matchPairs: 'Memory', sorting: 'Sorteeroefening' }
  }
};

const SITE_ROOT = new URL('./', location.href).href;

let ctx = null;
let root = null;
let assignments = [];   // [{ id, ...data }]
let contents = {};      // filière → chapitres (loadContent)
let draft = null;       // devoir en cours de composition, ou null (liste)
let openId = null;      // devoir dont le détail est déplié
let summaryCache = new Map();

export async function renderHomeworkView(rootEl, context) {
  root = rootEl;
  ctx = context;
  prepareMail();
  ctx.setStatus('Chargement des devoirs…');
  try {
    const [work, snap, en, nl] = await Promise.all([
      ctx.ensureWork(),
      fb.getDocs(fb.collection(fb.db, 'assignments')),
      ctx.content('en'),
      ctx.content('nl')
    ]);
    ctx.work = work;
    contents = { en, nl };
    assignments = [];
    snap.forEach(d => assignments.push(Object.assign({ id: d.id }, d.data())));
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
  return { status, done, total, items, upcoming: status === 'missing' && Date.now() <= deadline };
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
  (a.items || []).forEach(item => {
    const chapter = chapterOf(a.track, item.ch);
    let g = groups.find(x => x.ch === item.ch);
    if (!g) groups.push(g = { ch: item.ch, title: chapter ? chapter.title : item.ch, lines: [] });
    let label;
    if (item.k === 'ex') {
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
    .concat(...groups.map(g => [g.title].concat(g.lines.map(l => `- ${l.label} : ${l.link}`), [''])))
    .concat([signature]).join('\n');

  const html = `<p>${esc(first ? t.hello(first) : t.hello('').replace(/ ,$/, ','))}</p>` +
    (message ? `<p>${esc(message).replace(/\n/g, '<br>')}</p>` : '') +
    `<p><strong>${esc(due)}</strong></p>` +
    groups.map(g => `<p style="margin-bottom:4px">${esc(g.title)}</p><ul style="margin-top:0">${g.lines.map(l =>
      `<li><a href="${esc(l.link)}">${esc(l.label)}</a></li>`).join('')}</ul>`).join('') +
    `<p>${esc(signature)}</p>`;

  return { to: email, toName: [person.prenom, person.nom].filter(Boolean).join(' '), subject: a.title, text, html };
}

/* ===== Liste des devoirs ===== */

function classLabel(ids) {
  return (ids || []).join(', ') || '—';
}

function recipientsOf(a) {
  return (a.recipients || []).slice().sort((x, y) => nameOf(x).localeCompare(nameOf(y), 'fr'));
}

function nameOf(email) {
  const p = ctx.students[email];
  return p ? `${p.nom || ''} ${p.prenom || ''}`.trim() : email;
}

function displayName(email) {
  const p = ctx.students[email];
  return p ? `${p.prenom || ''} ${p.nom || ''}`.trim() : email;
}

function countStates(a) {
  const c = { done: 0, late: 0, missing: 0, upcoming: 0 };
  (a.recipients || []).forEach(email => {
    const st = studentState(a, email);
    c[st.status]++;
    if (st.upcoming) c.upcoming++;
  });
  return c;
}

function statusBar(c, total) {
  const parts = ['done', 'late', 'missing'].map(k => ({ value: c[k], color: STATUS[k].color }));
  const tip = ['done', 'late', 'missing'].map(k => `${c[k]} ${STATUS[k].label.toLowerCase()}`).join('<br>') +
    (c.upcoming ? `<br><span class="d-tip-muted">dont ${c.upcoming} non fait(s) avant la date limite</span>` : '');
  return stackBar(parts, total, tip, `${c.done} faits, ${c.late} en retard, ${c.missing} non faits`);
}

function renderList() {
  const rows = assignments.map(a => {
    const c = countStates(a);
    const total = (a.recipients || []).length;
    const sent = a.sentAt && typeof a.sentAt.toDate === 'function'
      ? a.sentAt.toDate().toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' })
      : '<span class="d-zero">pas envoyé</span>';
    const isOpen = openId === a.id;
    return `<tr class="h-row${isOpen ? ' is-open' : ''}">
        <td><button type="button" class="h-link" data-open="${esc(a.id)}" aria-expanded="${isOpen}">${esc(a.title || 'Sans titre')}</button>
          <span class="d-cell-note">${(a.items || []).length} élément(s) · ${a.track === 'nl' ? 'NL' : 'EN'}</span></td>
        <td>${esc(classLabel(a.classes))}</td>
        <td>${esc(formatDue(a.due))}</td>
        <td>${sent}</td>
        <td class="h-col-bar">${statusBar(c, total)}<span class="d-cell-note">${c.done} faits · ${c.late} en retard · ${c.missing} non faits</span></td>
        <td class="h-actions"><button type="button" class="t-btn" data-edit="${esc(a.id)}">Modifier</button>
          <button type="button" class="t-btn t-btn-danger" data-delete="${esc(a.id)}">Supprimer</button></td>
      </tr>${isOpen ? `<tr class="h-detail"><td colspan="6">${detailHtml(a)}</td></tr>` : ''}`;
  }).join('');

  root.innerHTML = `
    <section class="t-section">
      <div class="h-head">
        <h2>Devoirs</h2>
        <button type="button" class="t-btn t-btn-primary" id="h-new">Nouveau devoir</button>
      </div>
      <p class="t-help">Un devoir regroupe des exercices, des jeux et des labos, avec une date limite. Il est envoyé
        par mail depuis votre adresse, un mail par élève. <strong>Fait</strong> : tout est fait au plus tard à la date
        limite (le travail fait avant le devoir compte) ; <strong>fait en retard</strong> : une partie après la date
        limite ; <strong>non fait</strong> : il manque au moins un élément. Cliquez sur un titre pour voir chaque élève.</p>
      ${assignments.length ? `<div class="t-scroll"><table class="t-table h-table">
        <thead><tr><th>Devoir</th><th>Classes</th><th>Date limite</th><th>Envoyé</th><th>Élèves</th><th></th></tr></thead>
        <tbody>${rows}</tbody></table></div>
        ${legend(['done', 'late', 'missing'].map(k => STATUS[k]))}`
      : '<p class="d-empty">Aucun devoir pour l\'instant.</p>'}
    </section>
    <section class="t-section" id="h-summary"></section>`;

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
      ctx.setStatus('Devoir supprimé.');
    } catch (e) {
      console.error(e);
      ctx.setStatus('La suppression a échoué : ' + (e.code || e.message), true);
    }
    renderList();
  }));
  renderSummary();
}

function detailHtml(a) {
  const deadline = deadlineOf(a);
  const rows = recipientsOf(a).map(email => {
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
  const items = (a.items || []).map(item => {
    const t = itemTitle(a.track, item);
    return `<li><a href="${esc(itemLink(a.track, item))}" target="_blank" rel="noopener">${esc(t.chapter)} · ${esc(t.label)}${t.title ? ' — ' + esc(t.title) : ''}</a></li>`;
  }).join('');
  return `<div class="h-detail-body">
      <div><h3>Contenu</h3><ol class="h-items">${items}</ol>
        ${a.message ? `<h3>Message</h3><p class="h-message-view">${esc(a.message).replace(/\n/g, '<br>')}</p>` : ''}</div>
      <div><h3>Élèves (${(a.recipients || []).length})</h3>
        <table class="t-table h-students"><thead><tr><th>Élève</th><th>Classe</th><th>État</th><th>Éléments</th></tr></thead>
        <tbody>${rows}</tbody></table></div>
    </div>`;
}

/* ===== Assiduité : résumé par élève ===== */

function renderSummary() {
  const box = root.querySelector('#h-summary');
  const classIds = ctx.sortedClassIds();
  const saved = ctx.prefs.homeworkClass;
  const selected = saved === '__all__' || classIds.includes(saved) ? saved : (classIds[0] || '__all__');
  const emails = Object.keys(ctx.students).filter(e => selected === '__all__' || ctx.students[e].classe === selected);
  const rows = emails.map(email => {
    const c = { received: 0, done: 0, late: 0, missing: 0, upcoming: 0 };
    assignments.forEach(a => {
      if (!(a.recipients || []).includes(email)) return;
      c.received++;
      const st = studentState(a, email);
      if (st.upcoming) c.upcoming++;
      else c[st.status]++;
    });
    const counted = c.done + c.late + c.missing;
    c.rate = counted ? Math.round(100 * c.done / counted) : null;
    return { email, c };
  }).sort((x, y) => (x.c.rate === null) - (y.c.rate === null) || (x.c.rate || 0) - (y.c.rate || 0)
    || nameOf(x.email).localeCompare(nameOf(y.email), 'fr'));

  const num = n => n ? n : '<span class="d-zero">0</span>';
  box.innerHTML = `
    <div class="h-head">
      <h2>Assiduité</h2>
      <label>Classe <select id="h-summary-class">
        ${classIds.map(id => `<option value="${esc(id)}"${id === selected ? ' selected' : ''}>${esc(id)}</option>`).join('')}
        <option value="__all__"${selected === '__all__' ? ' selected' : ''}>Toutes les classes</option>
      </select></label>
    </div>
    <p class="t-help">Tous les devoirs reçus par chaque élève depuis le début. Un devoir pas encore fait dont la date
      limite n'est pas passée est compté « à venir », pas « non fait ». Classement : le plus faible % à temps d'abord.
      Le détail devoir par devoir est dans la fiche de l'élève.</p>
    ${rows.length ? `<div class="t-scroll"><table class="t-table h-table">
      <thead><tr><th>Élève</th><th>Classe</th><th class="d-num">Reçus</th><th class="d-num">Faits à temps</th>
        <th class="d-num">En retard</th><th class="d-num">Non faits</th><th class="d-num">À venir</th><th class="h-col-bar">À temps</th></tr></thead>
      <tbody>${rows.map(({ email, c }) => `<tr><td>${esc(displayName(email))}</td><td>${esc(ctx.students[email].classe || '')}</td>
        <td class="d-num">${num(c.received)}</td><td class="d-num">${num(c.done)}</td><td class="d-num">${num(c.late)}</td>
        <td class="d-num">${num(c.missing)}</td><td class="d-num">${num(c.upcoming)}</td>
        <td class="h-col-bar">${c.rate === null ? '<span class="d-zero">—</span>' : `${stackBar(['done', 'late', 'missing'].map(k => ({ value: c[k], color: STATUS[k].color })), c.done + c.late + c.missing,
          `${c.done} à temps, ${c.late} en retard, ${c.missing} non faits`, `${c.rate} % à temps`)}<span class="d-cell-note">${c.rate} % à temps</span>`}</td></tr>`).join('')}</tbody>
    </table></div>` : '<p class="d-empty">Aucun élève dans cette classe.</p>'}`;

  box.querySelector('#h-summary-class').addEventListener('change', e => {
    ctx.prefs.homeworkClass = e.target.value;
    ctx.savePrefs();
    renderSummary();
  });
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
    chapter: null
  } : {
    id: null, title: '', due: nextWeek(), message: '', classes: new Set(firstClass ? [firstClass] : []),
    recipients: new Set(), items: [], sent: false, chapter: null
  };
  if (!a && firstClass) studentsOf(firstClass).forEach(e => draft.recipients.add(e));
  ctx.setStatus('');
  renderEditor();
  window.scrollTo(0, 0);
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
      <div class="h-grid">
        <div class="h-col">
          <label class="h-field"><span>Titre (objet du mail)</span>
            <input type="text" id="h-title" maxlength="150" value="${esc(draft.title)}" placeholder="ex. Homework week 9 — ecosystems" /></label>
          <label class="h-field"><span>Date limite</span>
            <input type="date" id="h-due" value="${esc(draft.due)}" /></label>
          <div class="h-field"><span>Classes</span><div id="h-classes"></div></div>
          <div class="h-field"><span>Élèves</span><div id="h-recipients"></div></div>
        </div>
        <div class="h-col">
          <div class="h-field"><span>Contenu</span><div id="h-content"></div></div>
        </div>
      </div>
      <label class="h-field"><span>Message (après « Hello / Hallo + prénom », avant la liste des liens)</span>
        <textarea id="h-message" class="h-message" maxlength="5000" placeholder="Écrivez votre consigne…">${esc(draft.message)}</textarea></label>
      <div class="h-field"><span>Aperçu du mail</span><div id="h-preview" class="h-preview"></div></div>
      <div class="t-form-row h-submit">
        <button type="button" class="t-btn t-btn-primary" id="h-send"></button>
        <button type="button" class="t-btn" id="h-save">Enregistrer sans envoyer</button>
        <span class="t-help" id="h-progress" role="status"></span>
      </div>
    </section>`;

  root.querySelector('#h-cancel').addEventListener('click', () => { draft = null; renderList(); });
  root.querySelector('#h-title').addEventListener('input', e => { draft.title = e.target.value; renderPreview(); });
  root.querySelector('#h-due').addEventListener('input', e => { draft.due = e.target.value; renderPreview(); });
  root.querySelector('#h-message').addEventListener('input', e => { draft.message = e.target.value; renderPreview(); });
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

function renderContent() {
  const box = root.querySelector('#h-content');
  const track = draftTrack();
  if (!track) { box.innerHTML = '<p class="t-help">Choisissez d\'abord une classe : le contenu dépend de sa filière.</p>'; return; }
  const chapters = (contents[track] || []).filter(c => c.exerciseCount || c.games.length || c.labs.length);
  if (!chapters.find(c => c.folder === draft.chapter)) draft.chapter = chapters.length ? chapters[0].folder : null;
  const chapter = chapters.find(c => c.folder === draft.chapter);
  const chosen = new Set(draft.items);
  const check = (item, label, title) => {
    const key = itemKey(item);
    return `<label class="h-check h-item"><input type="checkbox" data-item="${esc(key)}"${chosen.has(key) ? ' checked' : ''} />
      <span>${esc(label)}${title ? ` <span class="d-cell-note">${esc(title)}</span>` : ''}</span></label>`;
  };
  const blocks = [];
  if (chapter) {
    LEVELS.forEach(lv => {
      const list = chapter.levels[lv];
      if (list.length) blocks.push(`<h4>Exercices · niveau ${LEVEL_NUM[lv]}</h4><div class="h-checks h-items">${list.map(ex =>
        check({ ch: chapter.folder, k: 'ex', lv, id: ex.id }, `Ex. ${ex.id}`, ex.title)).join('')}</div>`);
    });
    if (chapter.games.length) blocks.push(`<h4>Jeux</h4><div class="h-checks h-items">${chapter.games.map(g =>
      check({ ch: chapter.folder, k: 'game', id: g.id }, g.typeLabel, g.title)).join('')}</div>`);
    if (chapter.labs.length) blocks.push(`<h4>Labos</h4><div class="h-checks h-items">${chapter.labs.map(l =>
      check({ ch: chapter.folder, k: 'lab', id: l.id }, 'Labo', l.title)).join('')}</div>`);
  }
  const selection = draft.items.map(key => {
    const t = itemTitle(track, keyToItem(key));
    return `<li>${esc(t.chapter)} · ${esc(t.label)}${t.title ? ` — ${esc(t.title)}` : ''}
      <button type="button" class="h-mini" data-remove="${esc(key)}" aria-label="Retirer">Retirer</button></li>`;
  }).join('');
  box.innerHTML = `
    <label>Chapitre <select id="h-chapter">${chapters.map(c =>
      `<option value="${esc(c.folder)}"${c.folder === draft.chapter ? ' selected' : ''}>${esc(c.short)} — ${esc(c.title)}</option>`).join('')}</select></label>
    <div class="h-picker">${blocks.join('') || '<p class="t-help">Rien à donner dans ce chapitre.</p>'}</div>
    <h4>Sélection (${draft.items.length})</h4>
    ${draft.items.length ? `<ol class="h-items h-selection">${selection}</ol>` : '<p class="t-help">Cochez des exercices, des jeux ou des labos, dans un ou plusieurs chapitres.</p>'}`;
  box.querySelector('#h-chapter').addEventListener('change', e => { draft.chapter = e.target.value; renderContent(); });
  box.querySelectorAll('[data-item]').forEach(cb => cb.addEventListener('change', () => {
    const key = cb.dataset.item;
    draft.items = draft.items.filter(k => k !== key);
    if (cb.checked) draft.items.push(key);
    renderContent();
    renderPreview();
  }));
  box.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => {
    draft.items = draft.items.filter(k => k !== b.dataset.remove);
    renderContent();
    renderPreview();
  }));
}

function draftAssignment() {
  return {
    title: draft.title.trim(),
    message: draft.message,
    track: draftTrack(),
    due: draft.due,
    classes: ctx.sortedClassIds().filter(id => draft.classes.has(id)),
    recipients: Array.from(draft.recipients),
    items: draft.items.map(keyToItem)
  };
}

function renderPreview() {
  const box = root.querySelector('#h-preview');
  const a = draftAssignment();
  const sendBtn = root.querySelector('#h-send');
  const n = a.recipients.length;
  sendBtn.textContent = `${draft.sent ? 'Enregistrer et renvoyer' : 'Enregistrer et envoyer'} à ${n} élève${n > 1 ? 's' : ''}`;
  if (!a.track || !a.items.length) { box.innerHTML = '<p class="t-help">L\'aperçu apparaîtra quand une classe et un contenu seront choisis.</p>'; return; }
  const sample = recipientsOf(a)[0];
  const mail = buildMail(a, sample || '');
  box.innerHTML = `<p class="h-preview-head"><strong>Objet :</strong> ${esc(mail.subject || '(sans titre)')}<br>
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

/* ===== Fiche élève : ses devoirs ===== */

/* Devoirs reçus par un élève, du plus récent au plus ancien, avec son état.
   Utilisé par la fiche élève (dashboard-student.js). */
export async function homeworkOf(email, context) {
  ctx = Object.assign({}, ctx || {}, context);
  const [snap, en, nl] = await Promise.all([
    fb.getDocs(fb.collection(fb.db, 'assignments')), ctx.content('en'), ctx.content('nl')]);
  contents = { en, nl };
  summaryCache = new Map();
  const list = [];
  snap.forEach(d => {
    const a = Object.assign({ id: d.id }, d.data());
    if ((a.recipients || []).includes(email)) list.push(a);
  });
  list.sort((a, b) => (b.due || '').localeCompare(a.due || ''));
  return list.map(a => ({ assignment: a, state: studentState(a, email) }));
}
