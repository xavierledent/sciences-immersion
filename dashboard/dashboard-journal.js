/* ===== Tableau de bord : « Journal » =====
   Un retour rapide de l'activité sur le site, jour par jour. Les 7 derniers
   jours sont dépliés, du plus récent au plus ancien : sous chaque jour, les
   élèves venus (le plus récemment actif en haut). Chaque jour se replie sur
   son nombre d'élèves ; seul le plus récent est déplié au départ. Un clic sur un élève
   déroule ses activités de ce jour-là, les plus récentes en haut. En dessous,
   les semaines précédentes, repliées : une ligne par semaine avec le nombre
   d'élèves venus chaque jour ; un clic la déplie en jours. « Aller au » ouvre
   la semaine d'une date et y amène. Pas de durée : le site ne voit que des
   gestes, pas le temps passé à réfléchir (décision de l'enseignant).

   Données : les journaux du jour écrits par storage.js
   (journal/{AAAA-MM-JJ}/students/{uid}, champ entries). Un jour n'est lu
   (loadJournalDay, dashboard-data.js) qu'au moment où il s'affiche, puis
   gardé pour la durée de la page, sauf aujourd'hui, relu à chaque affichage.
   Les semaines repliées ne lisent pas les documents : countJournal les fait
   compter par le serveur (une lecture par jour), toutes classes confondues ;
   une fois la semaine ouverte, ses nombres suivent la classe choisie. Un seul
   filtre, la classe, « Toutes les classes » à chaque ouverture du tableau de
   bord (choix non retenu). Le journal commence à sa mise en ligne (START). */

import { esc } from './dashboard-ui.js';
import { loadJournalDay, countJournal, loadStudentJournal } from './dashboard-data.js';

const ALL = '__all__';
const RECENT = 7;
const START = '2026-10-24';
const DAY_ABBR = ['lu', 'ma', 'me', 'je', 've', 'sa', 'di'];
const STEP_NAMES = { 1: 'Predict', 2: 'Experiment', 3: 'Conclude', 4: 'Check' };

/* Pour la durée de la page : rien n'est retenu d'une connexion à l'autre.
   counts : { jour: élèves venus } (jours repliés) ; days : { jour: [{ email, entries }] } ;
   weeks : lundis des semaines dépliées ; openDays : jours dépliés (au départ,
   le jour d'activité le plus récent) ; picked : jour choisi par « Aller au ». */
const view = { scope: ALL, counts: null, days: {}, weeks: new Set(), openDays: null, open: new Set(), picked: null };

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
const weekday = id => (toDate(id).getDay() + 6) % 7;
const mondayOf = id => shiftDay(id, -weekday(id));
function dayTitle(id) {
  const text = toDate(id).toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long' });
  return text.charAt(0).toUpperCase() + text.slice(1);
}
const longDate = id => toDate(id).toLocaleDateString('fr-BE', { day: 'numeric', month: 'long' });
const clock = t => {
  const d = new Date(t);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;
// en_year1_bio1 → bio1 ; filière : en ou nl.
const folderOf = chapterId => String(chapterId || '').split('_').pop();
const trackOfChapter = chapterId => (String(chapterId || '').startsWith('nl_') ? 'nl' : 'en');

// Les jours de from à to compris, jamais avant START.
function datesBetween(from, to) {
  const out = [];
  for (let d = from < START ? START : from; d <= to; d = shiftDay(d, 1)) out.push(d);
  return out;
}
const recentFrom = () => shiftDay(today(), -(RECENT - 1));
const olderDates = () => datesBetween(START, shiftDay(recentFrom(), -1));

/* ctx : { me, classes, students, teacherName, sortedClassIds, content(track), setStatus,
   openStudent(adresse) : la fiche de l'élève, dans l'onglet Suivi } */
export async function renderJournalView(root, ctx) {
  ctx.setStatus('Chargement du journal…');
  if (!view.counts) view.counts = await countJournal(olderDates());
  await Promise.all(datesBetween(recentFrom(), today()).map(loadDay));
  if (!view.openDays) {
    const latest = datesBetween(recentFrom(), today()).reverse().find(d => studentsOf(d, ctx).length);
    view.openDays = new Set(latest ? [latest] : []);
  }
  ctx.setStatus('');
  const [en, nl] = await Promise.all([ctx.content('en'), ctx.content('nl')]);
  draw(root, ctx, { en, nl });
}

async function loadDay(date) {
  if (view.days[date] && date !== today()) return;
  view.days[date] = await loadJournalDay(date);
  view.counts[date] = view.days[date].length;
}

// Les jours repliés d'une semaine (par son lundi), du lundi au dimanche.
const weekDates = monday => olderDates().filter(d => mondayOf(d) === monday);
const loadWeek = monday => Promise.all(weekDates(monday).filter(d => view.counts[d] !== 0).map(loadDay));

function draw(root, ctx, content) {
  const classOptions = `<option value="${ALL}"${view.scope === ALL ? ' selected' : ''}>Toutes les classes</option>` +
    ctx.sortedClassIds().map(id => `<option value="${esc(id)}"${id === view.scope ? ' selected' : ''}>${esc(id)} — ${esc(ctx.teacherName(ctx.classes[id].teacher))}</option>`).join('');

  const recent = datesBetween(recentFrom(), today()).reverse()
    .map(date => ({ date, students: studentsOf(date, ctx) }))
    .filter(day => day.students.length);
  const body = recent.length
    ? recent.map(day => dayHTML(day, ctx, content)).join('')
    : `<p class="t-muted j-empty">Aucune activité enregistrée ces ${RECENT} derniers jours.</p>`;

  const mondays = [...new Set(olderDates().map(mondayOf))].reverse();
  const weeks = mondays.length
    ? `<h3 class="j-section">Semaines précédentes</h3>
       <ul class="j-weeks">${mondays.map(m => weekHTML(m, ctx, content)).join('')}</ul>`
    : '';

  root.innerHTML = `
    <div class="d-head">
      <h2 class="d-title">Journal
        <span class="d-subtitle">l’activité sur le site, jour par jour</span></h2>
      <div class="d-filters">
        <label>Classe <select id="j-scope">${classOptions}</select></label>
        <label>Aller au <input type="date" id="j-date" min="${START}" max="${today()}" value="${view.picked || ''}"></label>
      </div>
    </div>
    <div class="j-days">${body}</div>
    ${weeks}
    <p class="t-muted j-start">Journal depuis le ${esc(dayTitle(START).toLowerCase())}, date de sa mise en ligne.</p>`;

  root.querySelector('#j-scope').addEventListener('change', e => {
    view.scope = e.target.value;
    draw(root, ctx, content);
  });
  root.querySelector('#j-date').addEventListener('change', e => goTo(e.target.value, root, ctx, content));
  root.querySelectorAll('[data-week]').forEach(btn => btn.addEventListener('click', async () => {
    const monday = btn.dataset.week;
    if (view.weeks.has(monday)) {
      view.weeks.delete(monday);
    } else {
      ctx.setStatus('Chargement de la semaine…');
      try {
        await loadWeek(monday);
        view.weeks.add(monday);
        ctx.setStatus('');
      } catch (err) {
        console.error(err);
        ctx.setStatus('Cette semaine n’a pas pu être chargée (connexion internet ?).', true);
      }
    }
    draw(root, ctx, content);
  }));
  root.querySelectorAll('[data-day]').forEach(btn => btn.addEventListener('click', () => {
    const date = btn.dataset.day;
    if (view.openDays.has(date)) view.openDays.delete(date); else view.openDays.add(date);
    draw(root, ctx, content);
  }));
  root.querySelectorAll('[data-sheet]').forEach(btn => btn.addEventListener('click', () => ctx.openStudent(btn.dataset.sheet)));
  root.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', () => {
    const key = btn.dataset.open;
    if (view.open.has(key)) view.open.delete(key); else view.open.add(key);
    draw(root, ctx, content);
  }));
}

// « Aller au » : déplie la semaine de la date s'il le faut, puis y amène.
async function goTo(date, root, ctx, content) {
  if (!date || date < START || date > today()) return;
  view.picked = date;
  view.openDays.add(date);
  ctx.setStatus('');
  if (date < recentFrom()) {
    const monday = mondayOf(date);
    ctx.setStatus('Chargement de la semaine…');
    try {
      await loadWeek(monday);
      view.weeks.add(monday);
      ctx.setStatus('');
    } catch (err) {
      console.error(err);
      ctx.setStatus('Cette semaine n’a pas pu être chargée (connexion internet ?).', true);
      return;
    }
  }
  draw(root, ctx, content);
  const el = root.querySelector(`#j-day-${date}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  else ctx.setStatus(`Aucune activité le ${dayTitle(date).toLowerCase()}${view.scope === ALL ? '' : ' pour cette classe'}.`);
}

/* Les élèves d'un jour, [{ email, person, entries: [entrée triée], last }],
   le plus récemment actif en haut ; seulement la classe choisie. */
function studentsOf(date, ctx) {
  const out = [];
  (view.days[date] || []).forEach(doc => {
    const person = (doc.email && ctx.students[doc.email]) || null;
    if (view.scope !== ALL && (!person || person.classe !== view.scope)) return;
    const entries = Object.values(doc.entries || {}).filter(e => e && e.t).sort((a, b) => b.t - a.t);
    if (entries.length) out.push({ email: doc.email, person, entries, last: entries[0].t });
  });
  return out.sort((a, b) => b.last - a.last);
}

// Élèves venus un jour : comptés dans les documents une fois lus (classe choisie), sinon par le serveur.
const dayCount = (date, ctx) => (view.days[date] ? studentsOf(date, ctx).length : view.counts[date] || 0);

/* Une semaine repliée : les jours de classe toujours, le week-end seulement
   si quelqu'un est venu ; dépliée, ses jours d'activité comme ceux du haut. */
function weekHTML(monday, ctx, content) {
  const open = view.weeks.has(monday);
  const dates = weekDates(monday);
  const counts = dates
    .filter(d => weekday(d) < 5 || dayCount(d, ctx))
    .map(d => {
      const n = dayCount(d, ctx);
      return `<span class="j-wcount"><span class="t-muted">${DAY_ABBR[weekday(d)]}</span> ${n || '–'}</span>`;
    }).join('');
  let days = '';
  if (open) {
    const active = dates.slice().reverse()
      .map(date => ({ date, students: studentsOf(date, ctx) }))
      .filter(day => day.students.length);
    days = active.length
      ? `<div class="j-week-days">${active.map(day => dayHTML(day, ctx, content)).join('')}</div>`
      : `<p class="t-muted j-empty">Aucune activité cette semaine${view.scope === ALL ? '' : ' pour cette classe'}.</p>`;
  }
  return `<li class="j-week${open ? ' is-open' : ''}">
    <button type="button" class="j-week-row" data-week="${monday}" aria-expanded="${open}">
      <span class="j-caret" aria-hidden="true">${open ? '▾' : '▸'}</span>
      <span class="j-name">Semaine du ${esc(longDate(monday))}</span>
      <span class="j-wcounts">${counts}</span>
    </button>
    ${days}
  </li>`;
}

// Un jour : replié, son nombre d'élèves ; déplié, ses élèves.
function dayHTML(day, ctx, content) {
  const open = view.openDays.has(day.date);
  return `<section class="j-day${open ? ' is-open' : ''}${day.date === view.picked ? ' is-picked' : ''}" id="j-day-${day.date}">
    <h3 class="j-day-title"><button type="button" class="j-day-row" data-day="${day.date}" aria-expanded="${open}">
      <span class="j-caret" aria-hidden="true">${open ? '▾' : '▸'}</span>
      <span>${esc(dayTitle(day.date))}</span>
      <span class="d-subtitle">${plural(day.students.length, 'élève', 'élèves')}</span>
    </button></h3>
    ${open ? `<ul class="j-students">${day.students.map(s => studentHTML(day.date, s, content)).join('')}</ul>` : ''}
  </section>`;
}

function studentHTML(date, s, content) {
  const key = `${date}|${s.email}`;
  const open = view.open.has(key);
  const p = s.person;
  const name = p ? `${p.nom} ${p.prenom}`.trim() : (s.email || 'Élève inconnu');
  return `<li class="j-student${open ? ' is-open' : ''}">
    <button type="button" class="j-student-row" data-open="${esc(key)}" aria-expanded="${open}">
      <span class="j-caret" aria-hidden="true">${open ? '▾' : '▸'}</span>
      <span class="j-time">${clock(s.last)}</span>
      <span class="j-name">${esc(name)}${p && p.classe ? ` <span class="t-muted">(${esc(p.classe)})</span>` : ''}</span>
      <span class="j-summary">${esc(summaryOf(s.entries))}</span>
    </button>
    ${open && p ? `<div class="j-sheet"><button type="button" class="t-btn" data-sheet="${esc(s.email)}">Fiche de l’élève</button></div>` : ''}
    ${open ? entriesHTML(s.entries, content) : ''}
  </li>`;
}

// « bio1, chem1 · 12 activités »
function summaryOf(entries) {
  const chapters = [...new Set(entries.map(e => folderOf(e.c)))].join(', ');
  return `${chapters} · ${plural(entries.length, 'activité', 'activités')}`;
}

// Les activités d'un jour (triées), une ligne chacune.
function entriesHTML(entries, content) {
  return `<ul class="j-entries">${entries.map(e => `<li>
      <span class="j-time">${clock(e.t)}</span>
      <span class="j-chapter">${esc(folderOf(e.c))}</span>
      <span>${esc(entryText(e, content))}</span></li>`).join('')}</ul>`;
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

/* ===== Journal d'un élève (onglet « Journal » de la fiche élève) =====
   Les jours où il est venu, du plus récent au plus ancien, chacun replié sur
   ses chapitres et son nombre d'activités ; au départ, seul le plus récent
   est déplié. Lu par blocs de 4 semaines (une lecture par jour,
   loadStudentJournal) : les 4 dernières à l'ouverture, « 4 semaines de plus »
   pour remonter, jusqu'à START. Gardé pour la durée de la page. */

const STUDENT_BLOCK = 28;
// uid → { from, days: [{ date, entries }] (du plus récent au plus ancien), open: Set }
const studentJournals = {};

/* ctx : { uid, content(track), setStatus } ; uid null : élève jamais connecté. */
export async function renderStudentJournal(root, ctx) {
  if (!ctx.uid) {
    root.innerHTML = '<p class="t-muted">Pas de journal : cet élève ne s’est pas encore connecté au site.</p>';
    return;
  }
  let sj = studentJournals[ctx.uid];
  if (!sj) {
    root.innerHTML = '<p class="t-muted">Chargement du journal…</p>';
    const from = shiftDay(today(), -(STUDENT_BLOCK - 1));
    const days = await loadStudentJournal(ctx.uid, datesBetween(from, today()).reverse());
    sj = studentJournals[ctx.uid] = { from, days, open: new Set() };
    const latest = sj.days.find(d => sortedEntries(d).length);
    if (latest) sj.open.add(latest.date);
  } else {
    // Aujourd'hui relu à chaque affichage.
    const [fresh] = await loadStudentJournal(ctx.uid, [today()]);
    sj.days = sj.days.filter(d => d.date !== today());
    if (fresh) sj.days.unshift(fresh);
  }
  const [en, nl] = await Promise.all([ctx.content('en'), ctx.content('nl')]);
  drawStudentJournal(root, ctx, sj, { en, nl });
}

const sortedEntries = day => Object.values(day.entries || {}).filter(e => e && e.t).sort((a, b) => b.t - a.t);

function drawStudentJournal(root, ctx, sj, content) {
  const days = sj.days.map(d => ({ date: d.date, entries: sortedEntries(d) })).filter(d => d.entries.length);
  const more = sj.from > START;
  root.innerHTML = `
    ${days.length ? `<div class="j-days">${days.map(day => {
      const open = sj.open.has(day.date);
      return `<section class="j-day${open ? ' is-open' : ''}">
        <h3 class="j-day-title"><button type="button" class="j-day-row" data-sday="${day.date}" aria-expanded="${open}">
          <span class="j-caret" aria-hidden="true">${open ? '▾' : '▸'}</span>
          <span>${esc(dayTitle(day.date))}</span>
          <span class="d-subtitle">${esc(summaryOf(day.entries))}</span>
        </button></h3>
        ${open ? entriesHTML(day.entries, content) : ''}
      </section>`;
    }).join('')}</div>` : `<p class="t-muted j-empty">Pas venu sur le site depuis le ${esc(dayTitle(sj.from).toLowerCase())}.</p>`}
    <div class="j-more">
      ${more ? '<button type="button" class="t-btn" id="sj-more">4 semaines de plus</button>' : ''}
      <span class="t-muted">Journal depuis le ${esc(dayTitle(more ? sj.from : START).toLowerCase())}${more ? '' : ', date de sa mise en ligne'}.</span>
    </div>`;

  root.querySelectorAll('[data-sday]').forEach(btn => btn.addEventListener('click', () => {
    const date = btn.dataset.sday;
    if (sj.open.has(date)) sj.open.delete(date); else sj.open.add(date);
    drawStudentJournal(root, ctx, sj, content);
  }));
  const moreBtn = root.querySelector('#sj-more');
  if (moreBtn) moreBtn.addEventListener('click', async () => {
    moreBtn.disabled = true;
    const to = shiftDay(sj.from, -1);
    const from = shiftDay(sj.from, -STUDENT_BLOCK);
    ctx.setStatus('Chargement du journal…');
    try {
      sj.days = sj.days.concat(await loadStudentJournal(ctx.uid, datesBetween(from, to).reverse()));
      sj.from = from < START ? START : from;
      ctx.setStatus('');
    } catch (err) {
      console.error(err);
      ctx.setStatus('Le journal n’a pas pu être chargé (connexion internet ?).', true);
    }
    drawStudentJournal(root, ctx, sj, content);
  });
}
