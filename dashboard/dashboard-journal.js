/* ===== Tableau de bord : « Journal » =====
   Un retour rapide de l'activité sur le site, jour par jour : les jours du
   plus récent au plus ancien ; sous chaque jour, les élèves venus (le plus
   récemment actif en haut) ; un clic sur un élève déroule ses activités de
   ce jour-là, les plus récentes en haut. Pas de durée : le site ne voit que
   des gestes, pas le temps passé à réfléchir (décision de l'enseignant).

   Données : les journaux du jour écrits par storage.js
   (journal/{AAAA-MM-JJ}/students/{uid}, champ entries), lus par loadJournal
   (dashboard-data.js). Au premier affichage, les 7 derniers jours ;
   « Jours précédents » ajoute la semaine d'avant. Un seul filtre, la classe,
   « Toutes les classes » à chaque ouverture du tableau de bord (choix non
   retenu). Le journal commence à sa mise en ligne : rien d'avant. */

import { esc } from './dashboard-ui.js';
import { loadJournal } from './dashboard-data.js';

const ALL = '__all__';
const WEEK = 7;
const STEP_NAMES = { 1: 'Predict', 2: 'Experiment', 3: 'Conclude', 4: 'Check' };

// Pour la durée de la page : rien n'est retenu d'une connexion à l'autre.
const view = { scope: ALL, from: null, docs: [], open: new Set() };

const pad = n => String(n).padStart(2, '0');
const dayId = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function shiftDay(id, days) {
  const [y, m, d] = id.split('-').map(Number);
  return dayId(new Date(y, m - 1, d + days));
}
function dayTitle(id) {
  const [y, m, d] = id.split('-').map(Number);
  const text = new Date(y, m - 1, d).toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long' });
  return text.charAt(0).toUpperCase() + text.slice(1);
}
const clock = t => {
  const d = new Date(t);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;
// en_year1_bio1 → bio1 ; filière : en ou nl.
const folderOf = chapterId => String(chapterId || '').split('_').pop();
const trackOfChapter = chapterId => (String(chapterId || '').startsWith('nl_') ? 'nl' : 'en');

/* ctx : { me, classes, students, teacherName, sortedClassIds, content(track), setStatus } */
export async function renderJournalView(root, ctx) {
  if (!view.from) {
    view.from = shiftDay(dayId(new Date()), -(WEEK - 1));
    ctx.setStatus('Chargement du journal…');
    try {
      view.docs = await loadJournal(view.from, dayId(new Date()));
    } catch (e) {
      view.from = null;
      throw e;
    }
    ctx.setStatus('');
  }
  const [en, nl] = await Promise.all([ctx.content('en'), ctx.content('nl')]);
  draw(root, ctx, { en, nl });
}

function draw(root, ctx, content) {
  const classOptions = `<option value="${ALL}"${view.scope === ALL ? ' selected' : ''}>Toutes les classes</option>` +
    ctx.sortedClassIds().map(id => `<option value="${esc(id)}"${id === view.scope ? ' selected' : ''}>${esc(id)} — ${esc(ctx.teacherName(ctx.classes[id].teacher))}</option>`).join('');

  const days = groupByDay(ctx);
  const body = days.length
    ? days.map(day => dayHTML(day, ctx, content)).join('')
    : `<p class="t-muted j-empty">Aucune activité enregistrée depuis le ${esc(dayTitle(view.from).toLowerCase())}.</p>`;

  root.innerHTML = `
    <div class="d-head">
      <h2 class="d-title">Journal
        <span class="d-subtitle">l’activité sur le site, jour par jour</span></h2>
      <div class="d-filters">
        <label>Classe <select id="j-scope">${classOptions}</select></label>
      </div>
    </div>
    <div class="j-days">${body}</div>
    <div class="j-more">
      <button type="button" class="t-btn" id="j-more">Jours précédents</button>
      <span class="t-muted">Journal depuis le ${esc(dayTitle(view.from).toLowerCase())}. Il ne remonte pas avant sa mise en ligne.</span>
    </div>`;

  root.querySelector('#j-scope').addEventListener('change', e => {
    view.scope = e.target.value;
    draw(root, ctx, content);
  });
  root.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', () => {
    const key = btn.dataset.open;
    if (view.open.has(key)) view.open.delete(key); else view.open.add(key);
    draw(root, ctx, content);
  }));
  root.querySelector('#j-more').addEventListener('click', async e => {
    e.target.disabled = true;
    const to = shiftDay(view.from, -1);
    const from = shiftDay(view.from, -WEEK);
    ctx.setStatus('Chargement des jours précédents…');
    try {
      view.docs = view.docs.concat(await loadJournal(from, to));
      view.from = from;
      ctx.setStatus('');
    } catch (err) {
      console.error(err);
      ctx.setStatus('Les jours précédents n’ont pas pu être chargés (connexion internet ?).', true);
    }
    draw(root, ctx, content);
  });
}

/* [{ date, students: [{ email, person, entries: [entrée triée], last }] }],
   jours et élèves du plus récent au plus ancien ; seulement la classe choisie. */
function groupByDay(ctx) {
  const byDay = {};
  view.docs.forEach(doc => {
    const person = (doc.email && ctx.students[doc.email]) || null;
    if (view.scope !== ALL && (!person || person.classe !== view.scope)) return;
    const entries = Object.values(doc.entries || {}).filter(e => e && e.t).sort((a, b) => b.t - a.t);
    if (!entries.length) return;
    (byDay[doc.date] = byDay[doc.date] || []).push({ email: doc.email, person, entries, last: entries[0].t });
  });
  return Object.keys(byDay).sort().reverse().map(date => ({
    date,
    students: byDay[date].sort((a, b) => b.last - a.last)
  }));
}

function dayHTML(day, ctx, content) {
  return `<section class="j-day">
    <h3 class="j-day-title">${esc(dayTitle(day.date))}
      <span class="d-subtitle">${plural(day.students.length, 'élève', 'élèves')}</span></h3>
    <ul class="j-students">${day.students.map(s => studentHTML(day.date, s, content)).join('')}</ul>
  </section>`;
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
