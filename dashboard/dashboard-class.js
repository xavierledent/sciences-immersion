/* ===== Tableau de bord : vue « Suivi de la classe » =====
   Une ligne par élève de la classe choisie.
     - Chapitre « Tous » : répartition de l'activité (ressources et
       explorations comprises), puis une colonne par chapitre (barre des
       feux des exercices ; jeux et labos dans la bulle).
     - Un chapitre : exercices (une ligne par niveau, exercice par exercice),
       jeux, labos (une ligne par labo), ampoules de l'autoévaluation,
       vocabulaire et liens.
   Colonnes regroupées pour tenir sans défilement horizontal sur un écran de
   1366 px. Sous le nom : dernière activité, signalée après WATCH_DAYS jours
   sans activité enregistrée (ou s'il n'y en a jamais eu). Au-dessus : quatre
   chiffres de synthèse. Un chapitre sans exercices (vocabulaire seul pour
   l'instant) montre ce qui existe. */

import {
  esc, LIGHT, TRACK, ACTIVITY_SECTIONS, stackBar, cellsBar, legend, bulbCounts,
  daysSince, relativeDay, fullDate, percent, WARN_ICON
} from './dashboard-ui.js';
import { LEVELS, summarizeChapter, activityBySection, studentTotals } from './dashboard-data.js';

const WATCH_DAYS = 14;
const ACTIVE_DAYS = 7;
export const UNCLASSED = '__unclassed__';
const LEVEL_LABEL = { level1: 'Level 1', level2: 'Level 2', level3: 'Level 3' };

/* ctx : {
     me, teachers, classes, students,        listes (dashboard.js)
     work,                                   travail par adresse (loadWork)
     content(track) → Promise<chapitres>,     contenu (loadContent)
     teacherName(adresse), prefs, savePrefs(), reloadWork(), loadedAt,
     openStudent(adresse) | undefined
   } */
export async function renderClassView(root, ctx) {
  const classIds = Object.keys(ctx.classes).sort((a, b) => {
    const mine = id => (ctx.classes[id].teacher === ctx.me ? 0 : 1);
    return mine(a) - mine(b) || a.localeCompare(b, 'fr', { numeric: true });
  });
  const unclassed = unclassedEmails(ctx);
  let classId = ctx.prefs.classId;
  if (!(classId in ctx.classes) && classId !== UNCLASSED) classId = classIds[0] || UNCLASSED;

  const track = classId === UNCLASSED ? majorityTrack(unclassed, ctx) : ctx.classes[classId].track;
  const chapters = await ctx.content(track);
  let chapterId = ctx.prefs.chapterId;
  if (chapterId && !chapters.some(c => c.id === chapterId)) chapterId = '';
  ctx.prefs.classId = classId;
  ctx.prefs.chapterId = chapterId;
  ctx.savePrefs();

  const emails = classId === UNCLASSED
    ? unclassed
    : Object.keys(ctx.students).filter(e => ctx.students[e].classe === classId);
  const rows = emails.map(email => buildRow(email, ctx, chapters));
  const chapter = chapters.find(c => c.id === chapterId) || null;
  // Le tri « Dernière activité » n'existe plus (la date est sous le nom).
  const sort = ctx.prefs.sort && ctx.prefs.sort.key !== 'last' ? ctx.prefs.sort : { key: 'name', dir: 1 };

  root.innerHTML = `
    ${headerHtml(ctx, classId, classIds, unclassed.length, chapters, chapterId)}
    ${kpiHtml(rows, chapter, chapters)}
    ${rows.length ? `${legendHtml(chapter)}
      <div class="t-scroll d-table-wrap">${chapter ? chapterTable(rows, chapter, sort, ctx) : allTable(rows, chapters, sort, ctx)}</div>`
      : `<p class="d-empty">${classId === UNCLASSED
        ? 'Aucun élève hors liste : tous les élèves connectés sont rangés dans une classe.'
        : 'Aucun élève dans cette classe. Ajoutez-les dans l’onglet « Classes et élèves ».'}</p>`}`;

  // Filtres
  root.querySelector('#d-class').addEventListener('change', e => {
    ctx.prefs.classId = e.target.value;
    renderClassView(root, ctx);
  });
  root.querySelector('#d-chapter').addEventListener('change', e => {
    ctx.prefs.chapterId = e.target.value;
    ctx.prefs.sort = { key: 'name', dir: 1 };
    renderClassView(root, ctx);
  });
  root.querySelector('#d-refresh').addEventListener('click', async e => {
    e.target.disabled = true;
    await ctx.reloadWork();
    renderClassView(root, ctx);
  });
  root.querySelectorAll('[data-sort]').forEach(btn => btn.addEventListener('click', () => {
    const key = btn.dataset.sort;
    ctx.prefs.sort = { key, dir: sort.key === key ? -sort.dir : defaultDir(key) };
    renderClassView(root, ctx);
  }));
  if (ctx.openStudent) {
    root.querySelectorAll('[data-student]').forEach(btn =>
      btn.addEventListener('click', () => ctx.openStudent(btn.dataset.student)));
  }
}

/* ===== Données d'une ligne ===== */

function unclassedEmails(ctx) {
  return Object.keys(ctx.work).filter(e => !ctx.students[e] && !ctx.teachers[e]);
}

function majorityTrack(emails, ctx) {
  let en = 0;
  let nl = 0;
  emails.forEach(e => Object.keys(ctx.work[e].chapters).forEach(id => {
    if (id.startsWith('nl_')) nl++; else en++;
  }));
  return nl > en ? 'nl' : 'en';
}

function buildRow(email, ctx, chapters) {
  const person = ctx.students[email] || {};
  const work = ctx.work[email] || { uid: null, chapters: {}, history: {} };
  const summaries = {};
  chapters.forEach(ch => {
    summaries[ch.id] = summarizeChapter(ch, work.chapters[ch.id], (work.history || {})[ch.id]);
  });
  const { last, statsList: allStats } = studentTotals(work);
  return {
    email,
    nom: person.nom || '',
    prenom: person.prenom || '',
    display: person.nom ? `${person.nom} ${person.prenom}` : email,
    connected: !!work.uid,
    last,
    summaries,
    sections: activityBySection(allStats)
  };
}


/* ===== En-tête, synthèse, légende ===== */

function headerHtml(ctx, classId, classIds, unclassedCount, chapters, chapterId) {
  const title = classId === UNCLASSED ? 'Élèves non classés'
    : `${esc(classId)} <span class="d-subtitle">${esc(ctx.teacherName(ctx.classes[classId].teacher))} · ${
      ctx.classes[classId].track === 'nl' ? 'Néerlandais' : 'Anglais'}</span>`;
  const classOptions = classIds.map(id =>
    `<option value="${esc(id)}"${id === classId ? ' selected' : ''}>${esc(id)} — ${esc(ctx.teacherName(ctx.classes[id].teacher))}</option>`).join('')
    + (unclassedCount ? `<option value="${UNCLASSED}"${classId === UNCLASSED ? ' selected' : ''}>Non classés (${unclassedCount})</option>` : '');
  const chapterOptions = `<option value="">Tous les chapitres</option>` + chapters.map(c =>
    `<option value="${esc(c.id)}"${c.id === chapterId ? ' selected' : ''}>${esc(c.title)}</option>`).join('');
  const time = ctx.loadedAt ? ctx.loadedAt.toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' }) : '';
  return `<div class="d-head">
    <h2 class="d-title">${title}</h2>
    <div class="d-filters">
      <label>Classe <select id="d-class">${classOptions}</select></label>
      <label>Chapitre <select id="d-chapter">${chapterOptions}</select></label>
      <button type="button" class="t-btn" id="d-refresh" data-tip="${esc('Relire le travail des élèves (données de ' + time + ')')}">Actualiser</button>
    </div>
  </div>`;
}

function kpiHtml(rows, chapter, chapters) {
  const active = rows.filter(r => daysSince(r.last) < ACTIVE_DAYS).length;
  const used = rows.filter(r => r.last).length;
  const scope = chapter ? [chapter] : chapters;
  const totalEx = scope.reduce((n, c) => n + c.exerciseCount, 0);
  const avg = rows.length && totalEx
    ? Math.round(rows.reduce((n, r) => n + percent(scope.reduce((m, c) => m + r.summaries[c.id].answeredCount, 0), totalEx), 0) / rows.length)
    : 0;
  return `<div class="d-kpis">
    <div class="d-kpi"><span class="d-kpi-label">Élèves</span><span class="d-kpi-value">${rows.length}</span></div>
    <div class="d-kpi"><span class="d-kpi-label">Actifs ces ${ACTIVE_DAYS} derniers jours</span><span class="d-kpi-value">${active}</span></div>
    <div class="d-kpi" data-tip="${esc('Élèves qui ont déjà travaillé sur le site cette année (au moins une activité enregistrée)')}">
      <span class="d-kpi-label">Ont utilisé le site</span><span class="d-kpi-value">${used}</span>
      <span class="d-kpi-note">${rows.length ? percent(used, rows.length) + ' % de la classe' : '&nbsp;'}</span></div>
    <div class="d-kpi"><span class="d-kpi-label">Exercices répondus${chapter ? ` · ${esc(chapter.short)}` : ''}</span>
      <span class="d-kpi-value">${totalEx ? avg + ' %' : '—'}</span><span class="d-kpi-note">moyenne de la classe</span></div>
  </div>`;
}

function legendHtml(chapter) {
  const lights = legend([3, 2, 1, 'answered', 'none'].map(k => LIGHT[k]));
  if (chapter) {
    return `<div class="d-legends"><div><span class="d-legend-title">Exercices</span>${lights}</div>
</div>`;
  }
  return `<div class="d-legends"><div><span class="d-legend-title">Exercices</span>${lights}</div>
    <div><span class="d-legend-title">Répartition de l’activité</span>${legend(Object.keys(ACTIVITY_SECTIONS).map(k => ACTIVITY_SECTIONS[k]))}</div></div>`;
}

/* ===== Tri ===== */

function defaultDir(key) {
  return key === 'name' ? 1 : -1;
}

function sortRows(rows, sort, valueOf) {
  return rows.slice().sort((a, b) => {
    if (sort.key === 'name') return sort.dir * a.display.localeCompare(b.display, 'fr');
    return sort.dir * (valueOf(a, sort.key) - valueOf(b, sort.key)) || a.display.localeCompare(b.display, 'fr');
  });
}

// Tri mémorisé dont la colonne n'existe pas (ou plus) dans ce tableau.
function validSort(sort, keys) {
  return keys.includes(sort.key) ? sort : { key: 'name', dir: 1 };
}

function th(label, key, sort, extraClass) {
  const active = sort.key === key;
  const aria = active ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none';
  return `<th class="${extraClass || ''}" aria-sort="${aria}"><button type="button" class="d-sort${active ? ' is-active' : ''}"
    data-sort="${esc(key)}">${label}<span class="d-sort-mark" aria-hidden="true">${active ? (sort.dir === 1 ? '▲' : '▼') : ''}</span></button></th>`;
}

/* ===== Cellules communes ===== */

// Nom de l'élève, et sa dernière activité en dessous (en rouge au-delà de
// WATCH_DAYS jours sans activité, ou jamais).
function nameCell(row, ctx) {
  const watched = daysSince(row.last) >= WATCH_DAYS;
  const sub = `<span class="d-cell-note d-name-last${watched ? ' is-alert' : ''}" data-tip="${esc(row.last ? `Dernière activité : ${fullDate(row.last)}` : fullDate(null))}">
    ${watched ? WARN_ICON : ''}${row.last ? `actif ${relativeDay(row.last)}` : 'aucune activité'}</span>`;
  const label = ctx.openStudent
    ? `<button type="button" class="d-student" data-student="${esc(row.email)}">${esc(row.display)}</button>`
    : `<span class="d-student-name">${esc(row.display)}</span>`;
  return `<td class="d-col-name">${label}${sub}</td>`;
}

function exercisesBar(chapter, s, extra) {
  const c = s.counts;
  const parts = [3, 2, 1, 'answered'].map(k => ({ value: c[k], color: LIGHT[k].color }));
  const tip = `<strong>${esc(chapter.title)}</strong><br>${s.answeredCount}/${chapter.exerciseCount} exercices répondus` +
    [3, 2, 1, 'answered'].filter(k => c[k]).map(k => `<br><span class="d-swatch" style="background:${LIGHT[k].color}"></span>${c[k]} ${esc(LIGHT[k].label.toLowerCase())}`).join('') +
    (extra || '');
  return stackBar(parts, chapter.exerciseCount, tip, `${s.answeredCount} sur ${chapter.exerciseCount} exercices répondus`);
}

/* ===== Tableau « Tous les chapitres » ===== */

function allTable(rows, chapters, sortIn, ctx) {
  const sort = validSort(sortIn, ['name', 'activity'].concat(chapters.map(c => c.id)));
  const valueOf = (r, key) => {
    if (key === 'activity') return Object.keys(r.sections).reduce((n, k) => n + r.sections[k], 0);
    const ch = chapters.find(c => c.id === key);
    if (!ch) return 0;
    const s = r.summaries[key];
    return ch.exerciseCount || ch.games.length || ch.labs.length
      ? s.answeredCount + s.gamesDone + s.labsChecked
      : vocabRank(s);
  };
  const sorted = sortRows(rows, sort, valueOf);
  if (ctx.setOrder) ctx.setOrder(sorted.map(r => r.email));
  const head = `<tr>${th('Élève', 'name', sort, 'd-col-name')}
    ${th('Répartition de l’activité', 'activity', sort, 'd-col-activity')}
    ${chapters.map(c => th(esc(c.short), c.id, sort, 'd-col-chapter')).join('')}</tr>`;
  const body = sorted.map(r => `<tr>${nameCell(r, ctx)}
    ${activityCell(r.sections)}
    ${chapters.map(c => chapterCell(c, r.summaries[c.id])).join('')}</tr>`).join('');
  return `<table class="t-table d-table"><thead>${head}</thead><tbody>${body}</tbody></table>`;
}

// Un chapitre : la barre des exercices et « répondus / total » ; jeux et
// labos faits dans la bulle de la barre.
function chapterCell(chapter, s) {
  const more = [];
  if (chapter.games.length) more.push(`Jeux terminés : ${s.gamesDone}/${chapter.games.length}`);
  if (chapter.labs.length) more.push(`Labos au Check : ${s.labsChecked}/${chapter.labs.length}`);
  if (chapter.exerciseCount) {
    return `<td class="d-col-chapter">${exercisesBar(chapter, s, more.map(m => '<br>' + esc(m)).join(''))}
      <span class="d-cell-note">${s.answeredCount}/${chapter.exerciseCount}</span></td>`;
  }
  if (more.length) {
    return `<td class="d-col-chapter"><span class="d-cell-note">${more.map(esc).join('<br>')}</span></td>`;
  }
  // Vocabulaire seul (exercices pas encore rédigés).
  const seen = Number(s.stats.vocabulary_cards_seen) || 0;
  const known = s.vocabKnown.length;
  return `<td class="d-col-chapter" data-tip="${esc(`<strong>${esc(chapter.title)}</strong><br>Pas encore d’exercices ni de jeux : vocabulaire seul.<br>${known} mot(s) su(s) · ${seen} carte(s) vue(s)`)}">
    <span class="d-vocab-only${known || seen ? '' : ' d-zero'}">${known}/${chapter.vocabCount} mots sus</span>
    <span class="d-cell-note">${seen} carte${seen > 1 ? 's' : ''} vue${seen > 1 ? 's' : ''}</span></td>`;
}

function activityCell(sections) {
  const keys = Object.keys(ACTIVITY_SECTIONS);
  const total = keys.reduce((n, k) => n + sections[k], 0);
  if (!total) return '<td class="d-col-activity"><span class="d-zero">Aucune action</span></td>';
  const parts = keys.map(k => ({ value: sections[k], color: ACTIVITY_SECTIONS[k].color }));
  const tip = `<strong>${total} actions</strong>` + keys.filter(k => sections[k]).map(k =>
    `<br><span class="d-swatch" style="background:${ACTIVITY_SECTIONS[k].color}"></span>${esc(ACTIVITY_SECTIONS[k].label)} : ${sections[k]} (${percent(sections[k], total)} %)`).join('');
  return `<td class="d-col-activity">${stackBar(parts, total, tip, `${total} actions`)}<span class="d-cell-note">${total} actions</span></td>`;
}

/* ===== Tableau « un chapitre » ===== */

function chapterTable(rows, chapter, sortIn, ctx) {
  const levels = LEVELS.filter(l => chapter.levels[l].length);
  const hasAutoeval = chapter.autoevalItems.length > 0;
  const keys = ['name', 'vocab'];
  if (levels.length) keys.push('exercises');
  if (chapter.games.length) keys.push('games');
  if (chapter.labs.length) keys.push('labs');
  if (hasAutoeval) keys.push('autoeval');
  const sort = validSort(sortIn, keys);
  const valueOf = (r, key) => {
    const s = r.summaries[chapter.id];
    if (key === 'exercises') return s.answeredCount;
    if (key === 'games') return s.gamesDone;
    if (key === 'labs') return s.labs.reduce((n, l) => n + labRank(l.result), 0);
    if (key === 'autoeval') return s.ratedCount ? (s.ratings[1] + 2 * s.ratings[2] + 3 * s.ratings[3]) / s.ratedCount : 0;
    if (key === 'vocab') return vocabRank(s);
    return 0;
  };
  const sorted = sortRows(rows, sort, valueOf);
  if (ctx.setOrder) ctx.setOrder(sorted.map(r => r.email));
  const head = `<tr>${th('Élève', 'name', sort, 'd-col-name')}
    ${levels.length ? th('Exercices', 'exercises', sort, 'd-col-exercises') : ''}
    ${chapter.games.length ? th('Jeux', 'games', sort, 'd-col-games') : ''}
    ${chapter.labs.length ? th('Labos', 'labs', sort, 'd-col-labs') : ''}
    ${hasAutoeval ? th('Autoévaluation', 'autoeval', sort, 'd-col-autoeval') : ''}
    ${th('Vocabulaire et liens', 'vocab', sort, 'd-col-vocab')}</tr>`;
  const body = sorted.map(r => {
    const s = r.summaries[chapter.id];
    return `<tr>${nameCell(r, ctx)}
      ${levels.length ? exercisesCell(chapter, levels, s) : ''}
      ${chapter.games.length ? gamesCell(s) : ''}
      ${chapter.labs.length ? labsCell(s) : ''}
      ${hasAutoeval ? autoevalCell(chapter, s) : ''}
      ${vocabLinksCell(chapter, s)}</tr>`;
  }).join('');
  return `<table class="t-table d-table d-table-chapter"><thead>${head}</thead><tbody>${body}</tbody></table>`;
}

// Exercices : une ligne par niveau (N1, N2, N3), une case par exercice.
function exercisesCell(chapter, levels, s) {
  const lines = levels.map(level => {
    const list = s.levels[level];
    const cells = list.map(e => {
      const look = LIGHT[e.state || 'none'];
      return { color: look.color, tip: `<strong>${LEVEL_LABEL[level]} · Ex. ${esc(e.id)}</strong>${e.title ? ' — ' + esc(e.title) : ''}<br>${esc(look.label)}` };
    });
    const done = list.filter(e => e.state).length;
    return `<div class="d-level-row"><span class="d-level-tag" data-tip="${esc(LEVEL_LABEL[level])}">N${level.slice(-1)}</span>
      ${cellsBar(cells, `${LEVEL_LABEL[level]} : ${done} sur ${list.length} exercices répondus`)}
      <span class="d-level-n">${done}/${list.length}</span></div>`;
  }).join('');
  return `<td class="d-col-exercises">${lines}</td>`;
}

function gamesCell(s) {
  const cells = s.games.map(g => ({
    color: g.done ? '#4a6483' : TRACK,
    tip: `<strong>${esc(g.title)}</strong> <span class="d-tip-muted">${esc(g.typeLabel)}</span><br>${g.done ? esc(g.detail || 'terminé') : 'pas encore terminé'}`
  }));
  return `<td class="d-col-games">${cellsBar(cells, `${s.gamesDone} jeux terminés sur ${s.games.length}`)}
    <span class="d-cell-note">${s.gamesDone}/${s.games.length} terminés</span></td>`;
}

// Pour trier : Check réussi (score relatif) > étape atteinte > rien.
function labRank(r) {
  if (!r) return 0;
  if (r.best && r.best.total) return 10 + r.best.score / r.best.total;
  return r.maxStep || 0;
}

// État d'un labo pour un élève : texte court + détail (HTML échappé).
export function labStatus(r) {
  if (r && r.best && r.best.total) {
    return {
      started: true,
      text: `Check ${r.best.score}/${r.best.total}`,
      tip: `meilleur score ${r.best.score}/${r.best.total} · ${r.checks} Check(s)` +
        (r.last && (r.last.score !== r.best.score || r.last.at !== r.best.at) ? `<br>dernier : ${r.last.score}/${r.last.total}` : '') +
        (r.best.minutes ? `<br>temps actif : ${Math.round(r.best.minutes)} min` : '')
    };
  }
  if (r) return { started: true, text: `Étape ${r.maxStep || 1}/4`, tip: `commencé, étape ${r.maxStep || 1} sur 4 atteinte` };
  return { started: false, text: '—', tip: 'pas encore ouvert' };
}

// Labos : une ligne par labo, son nom (coupé s'il est long) et son état.
function labsCell(s) {
  const lines = s.labs.map(l => {
    const st = labStatus(l.result);
    return `<div class="d-lab" data-tip="${esc(`<strong>${esc(l.title)}</strong><br>${st.tip}`)}">
      <span class="d-lab-name">${esc(l.title)}</span><span class="d-lab-state${st.started ? '' : ' d-zero'}">${st.text}</span></div>`;
  }).join('');
  return `<td class="d-col-labs">${lines}</td>`;
}

function autoevalCell(chapter, s) {
  const total = chapter.autoevalItems.length;
  return `<td class="d-col-autoeval">${bulbCounts(s.ratings)}
    <span class="d-cell-note">${s.ratedCount}/${total} évalués</span></td>`;
}

// Pour trier : mots sus d'abord, cartes vues pour départager.
function vocabRank(s) {
  return s.vocabKnown.length + (Number(s.stats.vocabulary_cards_seen) || 0) / 1e6;
}

// Vocabulaire et liens : mots sus en grand, liens ouverts (ressources et
// explorations) en dessous ; le détail dans la bulle.
function vocabLinksCell(chapter, s) {
  const n = k => Number(s.stats[k]) || 0;
  const known = s.vocabKnown.length;
  const links = n('resource_link_opened') + n('exploration_link_opened');
  const tip = `<strong>Vocabulaire</strong><br>${known} mot(s) su(s) sur ${chapter.vocabCount}` +
    `<br>${n('vocabulary_sessions')} session(s) · ${n('vocabulary_cards_seen')} carte(s) vue(s)` +
    `<br>${n('vocabulary_flips')} retournée(s) · ${n('vocabulary_listens')} écoutée(s)` +
    `<br><strong>Liens ouverts</strong><br>${n('resource_link_opened')} ressource(s) · ${n('exploration_link_opened')} exploration(s)`;
  const empty = !known && !links && !n('vocabulary_cards_seen');
  return `<td class="d-col-vocab${empty ? ' d-zero' : ''}" data-tip="${esc(tip)}">
    <span class="d-vocab-known">${known}<span class="b-of"> / ${chapter.vocabCount} mots</span></span>
    <span class="d-cell-note">${links} lien${links > 1 ? 's' : ''}</span></td>`;
}
