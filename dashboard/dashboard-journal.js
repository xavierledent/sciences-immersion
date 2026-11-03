/* ===== Tableau de bord : « Journal » =====
   Un retour rapide de l'activité sur le site, un jour à la fois : les élèves
   venus ce jour-là (le plus récemment actif en haut) ; un clic sur un élève
   déroule ses activités, les plus récentes en haut. Au-dessus, une bande des
   6 dernières semaines donne le nombre d'élèves venus chaque jour ; un clic
   sur une case ouvre ce jour. Flèches, « Aujourd'hui » et choix d'une date
   pour le reste. Pas de durée : le site ne voit que des gestes, pas le temps
   passé à réfléchir (décision de l'enseignant).

   Données : les journaux du jour écrits par storage.js
   (journal/{AAAA-MM-JJ}/students/{uid}, champ entries). Un jour n'est lu
   (loadJournalDay, dashboard-data.js) qu'au moment où il s'affiche, puis
   gardé pour la durée de la page, sauf aujourd'hui, relu à chaque affichage.
   La bande ne lit pas les documents : countJournal les fait compter par le
   serveur (une lecture par jour), toutes classes confondues. Un seul filtre,
   la classe, « Toutes les classes » à chaque ouverture du tableau de bord
   (choix non retenu). Le journal commence à sa mise en ligne (START). */

import { esc } from './dashboard-ui.js';
import { loadJournalDay, countJournal } from './dashboard-data.js';

const ALL = '__all__';
const WEEKS = 6;
const START = '2026-10-24';
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const STEP_NAMES = { 1: 'Predict', 2: 'Experiment', 3: 'Conclude', 4: 'Check' };

/* Pour la durée de la page : rien n'est retenu d'une connexion à l'autre.
   counts : { jour: élèves venus } ; days : { jour: [{ email, entries }] }. */
const view = { scope: ALL, date: null, counts: null, days: {}, open: new Set() };

const pad = n => String(n).padStart(2, '0');
const dayId = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => dayId(new Date());
const toDate = id => {
  const [y, m, d] = id.split('-').map(Number);
  return new Date(y, m - 1, d);
};
function shiftDay(id, days) {
  const d = toDate(id);
  return dayId(new Date(d.getFullYear(), d.getMonth(), d.getDate() + days));
}
const mondayOf = id => shiftDay(id, -((toDate(id).getDay() + 6) % 7));
function dayTitle(id) {
  const text = toDate(id).toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long' });
  return text.charAt(0).toUpperCase() + text.slice(1);
}
const shortDate = id => toDate(id).toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' });
const clock = t => {
  const d = new Date(t);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;
// en_year1_bio1 → bio1 ; filière : en ou nl.
const folderOf = chapterId => String(chapterId || '').split('_').pop();
const trackOfChapter = chapterId => (String(chapterId || '').startsWith('nl_') ? 'nl' : 'en');

// Premier lundi de la bande, puis les jours comptés (depuis START, jusqu'à aujourd'hui).
const stripFirst = () => mondayOf(shiftDay(today(), -7 * (WEEKS - 1)));
function stripDates() {
  const out = [];
  for (let d = stripFirst(), t = today(); d <= t; d = shiftDay(d, 1)) if (d >= START) out.push(d);
  return out;
}

/* ctx : { me, classes, students, teacherName, sortedClassIds, content(track), setStatus } */
export async function renderJournalView(root, ctx) {
  if (!view.counts) {
    ctx.setStatus('Chargement du journal…');
    const counts = await countJournal(stripDates());
    const t = today();
    view.date = counts[t] ? t : (Object.keys(counts).filter(d => counts[d]).sort().pop() || t);
    view.counts = counts;
  }
  await loadDay(view.date, ctx);
  ctx.setStatus('');
  const [en, nl] = await Promise.all([ctx.content('en'), ctx.content('nl')]);
  draw(root, ctx, { en, nl });
}

async function loadDay(date, ctx) {
  if (view.days[date] && date !== today()) return;
  ctx.setStatus('Chargement du journal…');
  view.days[date] = await loadJournalDay(date);
  view.counts[date] = view.days[date].length;
}

/* Le jour d'activité le plus proche dans une direction (-1 : avant, 1 : après),
   d'après les jours comptés ; hors de la bande, le jour d'à côté. null : rien. */
function neighbour(dir) {
  const known = Object.keys(view.counts)
    .filter(d => view.counts[d] && (dir < 0 ? d < view.date : d > view.date)).sort();
  const hit = dir < 0 ? known.pop() : known[0];
  if (hit) return hit;
  const first = stripDates()[0] || today();
  if (dir < 0) {
    const d = shiftDay(view.date < first ? view.date : first, -1);
    return d >= START ? d : null;
  }
  return view.date < first ? shiftDay(view.date, 1) : null;
}

function draw(root, ctx, content) {
  const classOptions = `<option value="${ALL}"${view.scope === ALL ? ' selected' : ''}>Toutes les classes</option>` +
    ctx.sortedClassIds().map(id => `<option value="${esc(id)}"${id === view.scope ? ' selected' : ''}>${esc(id)} — ${esc(ctx.teacherName(ctx.classes[id].teacher))}</option>`).join('');

  const t = today();
  const prev = neighbour(-1);
  const next = neighbour(1);
  const students = studentsOfDay(ctx);
  const body = students.length
    ? `<ul class="j-students">${students.map(s => studentHTML(view.date, s, content)).join('')}</ul>`
    : `<p class="t-muted j-empty">Aucune activité enregistrée ce jour-là${view.scope === ALL ? '' : ' pour cette classe'}.</p>`;

  root.innerHTML = `
    <div class="d-head">
      <h2 class="d-title">Journal
        <span class="d-subtitle">l’activité sur le site, jour par jour</span></h2>
      <div class="d-filters">
        <label>Classe <select id="j-scope">${classOptions}</select></label>
      </div>
    </div>
    ${stripHTML()}
    <div class="j-nav">
      <button type="button" class="t-btn j-arrow" data-day="${prev || ''}" aria-label="Jour d’activité précédent"${prev ? '' : ' disabled'}>‹</button>
      <h3 class="j-day-title">${esc(dayTitle(view.date))}
        <span class="d-subtitle">${plural(students.length, 'élève', 'élèves')}</span></h3>
      <button type="button" class="t-btn j-arrow" data-day="${next || ''}" aria-label="Jour d’activité suivant"${next ? '' : ' disabled'}>›</button>
      <button type="button" class="t-btn" data-day="${t}"${view.date === t ? ' disabled' : ''}>Aujourd’hui</button>
      <label class="j-pick">Aller au <input type="date" id="j-date" min="${START}" max="${t}" value="${view.date}"></label>
    </div>
    ${body}`;

  const go = async date => {
    if (!date || date < START || date > today()) return;
    try {
      await loadDay(date, ctx);
      view.date = date;
      ctx.setStatus('');
    } catch (err) {
      console.error(err);
      ctx.setStatus('Ce jour n’a pas pu être chargé (connexion internet ?).', true);
    }
    draw(root, ctx, content);
  };
  root.querySelector('#j-scope').addEventListener('change', e => {
    view.scope = e.target.value;
    draw(root, ctx, content);
  });
  root.querySelectorAll('[data-day]').forEach(btn => btn.addEventListener('click', () => go(btn.dataset.day)));
  root.querySelector('#j-date').addEventListener('change', e => go(e.target.value));
  root.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', () => {
    const key = btn.dataset.open;
    if (view.open.has(key)) view.open.delete(key); else view.open.add(key);
    draw(root, ctx, content);
  }));
}

/* La bande : une colonne par semaine (du lundi au dimanche), une case par
   jour avec le nombre d'élèves venus, plus foncée quand ils sont nombreux. */
function stripHTML() {
  const t = today();
  const max = Math.max(1, ...Object.values(view.counts));
  let cells = `<span></span>${WEEKDAYS.map(d => `<span class="j-wd">${d}</span>`).join('')}`;
  for (let w = 0, monday = stripFirst(); w < WEEKS; w++, monday = shiftDay(monday, 7)) {
    cells += `<span class="j-week">${esc(shortDate(monday))}</span>`;
    for (let i = 0; i < 7; i++) {
      const date = shiftDay(monday, i);
      if (date < START || date > t) { cells += '<span class="j-cell is-off"></span>'; continue; }
      const n = view.counts[date] || 0;
      cells += `<button type="button" class="j-cell${date === view.date ? ' is-current' : ''}" data-day="${date}"
        style="--j-level:${(n / max).toFixed(2)}" title="${esc(dayTitle(date))} : ${plural(n, 'élève', 'élèves')}">${n || ''}</button>`;
    }
  }
  return `<div class="j-top">
    <span class="t-muted j-strip-title">Élèves venus par jour, toutes classes</span>
    <div class="j-strip">${cells}</div>
  </div>`;
}

/* Les élèves du jour affiché, [{ email, person, entries: [entrée triée], last }],
   le plus récemment actif en haut ; seulement la classe choisie. */
function studentsOfDay(ctx) {
  const out = [];
  (view.days[view.date] || []).forEach(doc => {
    const person = (doc.email && ctx.students[doc.email]) || null;
    if (view.scope !== ALL && (!person || person.classe !== view.scope)) return;
    const entries = Object.values(doc.entries || {}).filter(e => e && e.t).sort((a, b) => b.t - a.t);
    if (entries.length) out.push({ email: doc.email, person, entries, last: entries[0].t });
  });
  return out.sort((a, b) => b.last - a.last);
}

function studentHTML(date, s, content) {
  const key = `${date}|${s.email}`;
  const open = view.open.has(key);
  const p = s.person;
  const name = p ? `${p.nom} ${p.prenom}`.trim() : (s.email || 'Élève inconnu');
  const chapters = [...new Set(s.entries.map(e => folderOf(e.c)))].join(', ');
  return `<li class="j-student${open ? ' is-open' : ''}">
    <button type="button" class="j-student-row" data-open="${esc(key)}" aria-expanded="${open}">
      <span class="j-caret" aria-hidden="true">${open ? '▾' : '▸'}</span>
      <span class="j-time">${clock(s.last)}</span>
      <span class="j-name">${esc(name)}${p && p.classe ? ` <span class="t-muted">(${esc(p.classe)})</span>` : ''}</span>
      <span class="j-summary">${esc(chapters)} · ${plural(s.entries.length, 'activité', 'activités')}</span>
    </button>
    ${open ? `<ul class="j-entries">${s.entries.map(e => `<li>
      <span class="j-time">${clock(e.t)}</span>
      <span class="j-chapter">${esc(folderOf(e.c))}</span>
      <span>${esc(entryText(e, content))}</span></li>`).join('')}</ul>` : ''}
  </li>`;
}

// Le chapitre d'une entrée dans le contenu de sa filière (titres des exercices, labos).
function chapterOf(e, content) {
  return (content[trackOfChapter(e.c)] || []).find(ch => ch.id === e.c) || null;
}

// Une activité du jour, en une phrase.
function entryText(e, content) {
  const ch = chapterOf(e, content);
  const level = l => `Level ${String(l || '').replace('level', '')}`;
  switch (e.k) {
    case 'ex': {
      const ex = ch && (ch.levels[e.level] || []).find(x => String(x.id) === String(e.ex));
      const parts = [];
      if (e.n) parts.push(plural(e.n, 'réponse vérifiée', 'réponses vérifiées'));
      if (e.sa) parts.push(plural(e.sa, 'autoévaluation', 'autoévaluations'));
      return `Exercice ${ex && ex.title ? `« ${ex.title} »` : e.ex} (${level(e.level)}) : ${parts.join(', ') || 'ouvert'}`;
    }
    case 'rev':
      return `Mode révision (${level(e.level)})${e.n > 1 ? ` : lancé ${e.n} fois` : ''}`;
    case 'game': {
      if (!e.done) return `Jeu « ${e.g} » : en cours${e.a ? ` (${plural(e.a, 'réponse', 'réponses')})` : ''}`;
      let result = '';
      if (e.total) result = `, dernier score ${e.score} / ${e.total}`;
      else if (e.mistakes != null) result = `, ${plural(e.mistakes, 'erreur', 'erreurs')} la dernière fois`;
      else if (e.moves != null) result = `, ${plural(e.moves, 'coup', 'coups')} la dernière fois`;
      return `Jeu « ${e.g} » : terminé${e.done > 1 ? ` ${e.done} fois` : ''}${result}`;
    }
    case 'vocab': {
      const parts = [];
      if (e.cards) parts.push(plural(e.cards, 'carte vue', 'cartes vues'));
      if (e.known) parts.push(plural(e.known, 'mot marqué su', 'mots marqués sus'));
      return `Vocabulaire : ${parts.join(', ') || 'ouvert'}`;
    }
    case 'auto':
      return `Autoévaluation : ${e.rated ? plural(e.rated, 'attendu noté', 'attendus notés') : 'ouverte'}`;
    case 'res':
      return `Ressource ouverte : « ${e.label} »${e.n > 1 ? ` (${e.n} fois)` : ''}`;
    case 'expl':
      return `Exploration ouverte : « ${e.label} »${e.n > 1 ? ` (${e.n} fois)` : ''}`;
    case 'lab': {
      const lab = ch && ch.labs.find(l => l.id === e.lab);
      const name = `Labo « ${lab ? lab.title : e.lab} »`;
      if (e.checks) return `${name} : Check ${e.score} / ${e.total}${e.checks > 1 ? ` (${e.checks} Checks)` : ''}`;
      if (e.step) return `${name} : étape ${e.step} (${STEP_NAMES[e.step] || ''}) atteinte`;
      return `${name} : ouvert`;
    }
    default:
      return 'Activité';
  }
}
