/* ===== Tableau de bord : vue « Suivi de la classe » =====
   Une ligne par élève de la classe choisie.
     - Chapitre « Tous » : dernière activité, une colonne par chapitre (barre
       des feux des exercices + jeux et labos faits), répartition de
       l'activité, ressources et explorations ouvertes.
     - Un chapitre : chaque niveau exercice par exercice, chaque jeu, chaque
       labo, ampoules de l'autoévaluation, vocabulaire.
   Au-dessus : quatre chiffres de synthèse. Un élève est « à surveiller »
   après WATCH_DAYS jours sans activité enregistrée (ou s'il n'a jamais
   rien fait). */

import {
  esc, LIGHT, BULBS, TRACK, ACTIVITY_SECTIONS, stackBar, cellsBar, legend,
  daysSince, relativeDay, fullDate, percent, WARN_ICON
} from './dashboard-ui.js';
import { LEVELS, summarizeChapter, activityBySection } from './dashboard-data.js';

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
  const sort = ctx.prefs.sort || { key: 'name', dir: 1 };

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
  const watch = root.querySelector('#d-kpi-watch');
  if (watch) watch.addEventListener('click', () => {
    ctx.prefs.sort = { key: 'last', dir: 1 };
    renderClassView(root, ctx);
  });
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
  const work = ctx.work[email] || { chapters: {} };
  const docs = work.chapters;
  let last = null;
  Object.keys(docs).forEach(id => {
    const d = docs[id].updatedAt && docs[id].updatedAt.toDate ? docs[id].updatedAt.toDate() : null;
    if (d && (!last || d > last)) last = d;
  });
  const summaries = {};
  chapters.forEach(ch => { summaries[ch.id] = summarizeChapter(ch, docs[ch.id]); });
  const allStats = Object.keys(docs).map(id => docs[id].stats || {});
  return {
    email,
    nom: person.nom || '',
    prenom: person.prenom || '',
    display: person.nom ? `${person.nom} ${person.prenom}` : email,
    connected: !!ctx.work[email],
    last,
    summaries,
    sections: activityBySection(allStats),
    resources: allStats.reduce((n, s) => n + (Number(s.resource_link_opened) || 0), 0),
    explorations: allStats.reduce((n, s) => n + (Number(s.exploration_link_opened) || 0), 0)
  };
}

const isWatched = row => daysSince(row.last) >= WATCH_DAYS;

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
  const watched = rows.filter(isWatched).length;
  const scope = chapter ? [chapter] : chapters;
  const totalEx = scope.reduce((n, c) => n + c.exerciseCount, 0);
  const avg = rows.length && totalEx
    ? Math.round(rows.reduce((n, r) => n + percent(scope.reduce((m, c) => m + r.summaries[c.id].answeredCount, 0), totalEx), 0) / rows.length)
    : 0;
  return `<div class="d-kpis">
    <div class="d-kpi"><span class="d-kpi-label">Élèves</span><span class="d-kpi-value">${rows.length}</span></div>
    <div class="d-kpi"><span class="d-kpi-label">Actifs ces ${ACTIVE_DAYS} jours</span><span class="d-kpi-value">${active}</span></div>
    <button type="button" class="d-kpi d-kpi-button${watched ? ' is-alert' : ''}" id="d-kpi-watch"
      data-tip="${esc(`Aucune activité depuis ${WATCH_DAYS} jours ou plus. Cliquer pour les mettre en tête du tableau.`)}">
      <span class="d-kpi-label">${watched ? WARN_ICON : ''}À surveiller</span><span class="d-kpi-value">${watched}</span></button>
    <div class="d-kpi"><span class="d-kpi-label">Exercices répondus${chapter ? ` · ${esc(chapter.short)}` : ''}</span>
      <span class="d-kpi-value">${totalEx ? avg + ' %' : '—'}</span><span class="d-kpi-note">moyenne de la classe</span></div>
  </div>`;
}

function legendHtml(chapter) {
  const lights = legend([3, 2, 1, 'answered', 'none'].map(k => LIGHT[k]));
  if (chapter) {
    return `<div class="d-legends"><div><span class="d-legend-title">Exercices</span>${lights}</div>
      ${chapter.autoevalItems.length ? `<div><span class="d-legend-title">Autoévaluation</span>${legend([3, 2, 1].map(k => BULBS[k]))}</div>` : ''}</div>`;
  }
  return `<div class="d-legends"><div><span class="d-legend-title">Exercices</span>${lights}</div>
    <div><span class="d-legend-title">Répartition de l’activité</span>${legend(Object.keys(ACTIVITY_SECTIONS).map(k => ACTIVITY_SECTIONS[k]))}</div></div>`;
}

/* ===== Tri ===== */

function defaultDir(key) {
  return key === 'name' || key === 'last' ? 1 : -1;
}

function sortRows(rows, sort, valueOf) {
  return rows.slice().sort((a, b) => {
    if (sort.key === 'name') return sort.dir * a.display.localeCompare(b.display, 'fr');
    if (sort.key === 'last') {
      // Ordre 1 : les plus anciens (et « jamais ») d'abord.
      const ta = a.last ? a.last.getTime() : -Infinity;
      const tb = b.last ? b.last.getTime() : -Infinity;
      return sort.dir * (ta - tb) || a.display.localeCompare(b.display, 'fr');
    }
    return sort.dir * (valueOf(a, sort.key) - valueOf(b, sort.key)) || a.display.localeCompare(b.display, 'fr');
  });
}

function th(label, key, sort, extraClass) {
  const active = sort.key === key;
  const aria = active ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none';
  return `<th class="${extraClass || ''}" aria-sort="${aria}"><button type="button" class="d-sort${active ? ' is-active' : ''}"
    data-sort="${esc(key)}">${label}<span class="d-sort-mark" aria-hidden="true">${active ? (sort.dir === 1 ? '▲' : '▼') : ''}</span></button></th>`;
}

/* ===== Cellules communes ===== */

function nameCell(row, ctx) {
  const sub = !row.nom ? '' : (row.connected ? '' : '<span class="d-cell-note">aucune connexion</span>');
  const label = ctx.openStudent
    ? `<button type="button" class="d-student" data-student="${esc(row.email)}">${esc(row.display)}</button>`
    : `<span class="d-student-name">${esc(row.display)}</span>`;
  return `<td class="d-col-name">${label}${sub}</td>`;
}

function lastCell(date) {
  const watched = daysSince(date) >= WATCH_DAYS;
  return `<td class="d-col-last${watched ? ' is-alert' : ''}" data-tip="${esc(fullDate(date))}">
    ${watched ? WARN_ICON : ''}<span>${relativeDay(date)}</span></td>`;
}

function exercisesBar(chapter, s) {
  const c = s.counts;
  const parts = [3, 2, 1, 'answered'].map(k => ({ value: c[k], color: LIGHT[k].color }));
  const tip = `<strong>${esc(chapter.title)}</strong><br>${s.answeredCount}/${chapter.exerciseCount} exercices répondus` +
    [3, 2, 1, 'answered'].filter(k => c[k]).map(k => `<br><span class="d-swatch" style="background:${LIGHT[k].color}"></span>${c[k]} ${esc(LIGHT[k].label.toLowerCase())}`).join('');
  return stackBar(parts, chapter.exerciseCount, tip, `${s.answeredCount} sur ${chapter.exerciseCount} exercices répondus`);
}

/* ===== Tableau « Tous les chapitres » ===== */

function allTable(rows, chapters, sort, ctx) {
  const valueOf = (r, key) => {
    if (key === 'resources') return r.resources;
    if (key === 'explorations') return r.explorations;
    if (key === 'activity') return Object.keys(r.sections).reduce((n, k) => n + r.sections[k], 0);
    const ch = chapters.find(c => c.id === key);
    return ch ? r.summaries[key].answeredCount + r.summaries[key].gamesDone + r.summaries[key].labsChecked : 0;
  };
  const sorted = sortRows(rows, sort, valueOf);
  const head = `<tr>${th('Élève', 'name', sort, 'd-col-name')}${th('Dernière activité', 'last', sort)}
    ${chapters.map(c => th(esc(c.short), c.id, sort, 'd-col-chapter')).join('')}
    ${th('Répartition de l’activité', 'activity', sort, 'd-col-activity')}
    ${th('Ressources', 'resources', sort, 'd-num')}${th('Explorations', 'explorations', sort, 'd-num')}</tr>`;
  const body = sorted.map(r => `<tr>${nameCell(r, ctx)}${lastCell(r.last)}
    ${chapters.map(c => chapterCell(c, r.summaries[c.id])).join('')}
    ${activityCell(r.sections)}
    <td class="d-num">${r.resources || '<span class="d-zero">0</span>'}</td>
    <td class="d-num">${r.explorations || '<span class="d-zero">0</span>'}</td></tr>`).join('');
  return `<table class="t-table d-table"><thead>${head}</thead><tbody>${body}</tbody></table>`;
}

function chapterCell(chapter, s) {
  const bits = [];
  if (chapter.exerciseCount) bits.push(`${s.answeredCount}/${chapter.exerciseCount}`);
  if (chapter.games.length) bits.push(`Jeux ${s.gamesDone}/${chapter.games.length}`);
  if (chapter.labs.length) bits.push(`Labos ${s.labsChecked}/${chapter.labs.length}`);
  return `<td class="d-col-chapter">${chapter.exerciseCount ? exercisesBar(chapter, s) : ''}
    <span class="d-cell-note">${bits.join(' · ')}</span></td>`;
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

function chapterTable(rows, chapter, sort, ctx) {
  const levels = LEVELS.filter(l => chapter.levels[l].length);
  const hasAutoeval = chapter.autoevalItems.length > 0;
  const valueOf = (r, key) => {
    const s = r.summaries[chapter.id];
    if (key === 'games') return s.gamesDone;
    if (key === 'labs') return s.labs.reduce((n, l) => n + labRank(l.result), 0);
    if (key === 'autoeval') return s.ratedCount ? (s.ratings[1] + 2 * s.ratings[2] + 3 * s.ratings[3]) / s.ratedCount : 0;
    if (key === 'vocab') return Number(s.stats.vocabulary_cards_seen) || 0;
    if (key === 'chapterLast') return s.lastActivity ? s.lastActivity.getTime() : 0;
    return s.levels[key] ? s.levels[key].filter(e => e.state).length : 0;
  };
  const sorted = sortRows(rows, sort, valueOf);
  const head = `<tr>${th('Élève', 'name', sort, 'd-col-name')}${th('Dernière activité', 'last', sort)}
    ${levels.map(l => th(LEVEL_LABEL[l], l, sort, 'd-col-level')).join('')}
    ${chapter.games.length ? th('Jeux', 'games', sort, 'd-col-games') : ''}
    ${chapter.labs.length ? th('Labos', 'labs', sort, 'd-col-labs') : ''}
    ${hasAutoeval ? th('Autoévaluation', 'autoeval', sort, 'd-col-autoeval') : ''}
    ${th('Vocabulaire', 'vocab', sort, 'd-num')}</tr>`;
  const body = sorted.map(r => {
    const s = r.summaries[chapter.id];
    return `<tr>${nameCell(r, ctx)}${lastCell(r.last)}
      ${levels.map(l => levelCell(chapter, l, s)).join('')}
      ${chapter.games.length ? gamesCell(s) : ''}
      ${chapter.labs.length ? labsCell(s) : ''}
      ${hasAutoeval ? autoevalCell(chapter, s) : ''}
      ${vocabCell(s.stats)}</tr>`;
  }).join('');
  return `<table class="t-table d-table d-table-chapter"><thead>${head}</thead><tbody>${body}</tbody></table>`;
}

function levelCell(chapter, level, s) {
  const list = s.levels[level];
  const cells = list.map(e => {
    const look = LIGHT[e.state || 'none'];
    return { color: look.color, tip: `<strong>Ex. ${esc(e.id)}</strong>${e.title ? ' — ' + esc(e.title) : ''}<br>${esc(look.label)}` };
  });
  const done = list.filter(e => e.state).length;
  return `<td class="d-col-level">${cellsBar(cells, `${done} sur ${list.length} exercices répondus`)}
    <span class="d-cell-note">${done}/${list.length}</span></td>`;
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

function labsCell(s) {
  const lines = s.labs.map(l => {
    const r = l.result;
    let text = '—';
    let tip = 'pas encore ouvert';
    if (r && r.best && r.best.total) {
      text = `Check ${r.best.score}/${r.best.total}`;
      tip = `meilleur score ${r.best.score}/${r.best.total} · ${r.checks} Check(s)` +
        (r.last && r.last !== r.best ? `<br>dernier : ${r.last.score}/${r.last.total}` : '') +
        (r.best.minutes ? `<br>temps actif : ${Math.round(r.best.minutes)} min` : '');
    } else if (r) {
      text = `Étape ${r.maxStep || 1}/4`;
      tip = `commencé, étape ${r.maxStep || 1} sur 4 atteinte`;
    }
    return `<div class="d-lab" data-tip="${esc(`<strong>${esc(l.title)}</strong><br>${tip}`)}"><span class="d-lab-name">${esc(l.title)}</span><span class="d-lab-state${r ? '' : ' d-zero'}">${text}</span></div>`;
  }).join('');
  return `<td class="d-col-labs">${lines}</td>`;
}

function autoevalCell(chapter, s) {
  const total = chapter.autoevalItems.length;
  const parts = [3, 2, 1].map(k => ({ value: s.ratings[k], color: BULBS[k].color }));
  const tip = `<strong>Autoévaluation</strong><br>${s.ratedCount}/${total} attendus évalués` +
    [3, 2, 1].filter(k => s.ratings[k]).map(k => `<br><span class="d-swatch" style="background:${BULBS[k].color}"></span>${s.ratings[k]} × ${esc(BULBS[k].label)}`).join('');
  return `<td class="d-col-autoeval">${stackBar(parts, total, tip, `${s.ratedCount} attendus évalués sur ${total}`)}
    <span class="d-cell-note">${s.ratedCount}/${total} évalués</span></td>`;
}

function vocabCell(stats) {
  const seen = Number(stats.vocabulary_cards_seen) || 0;
  const tip = `<strong>Vocabulaire</strong><br>${Number(stats.vocabulary_sessions) || 0} session(s)<br>${seen} carte(s) vue(s)` +
    `<br>${Number(stats.vocabulary_flips) || 0} retournée(s)<br>${Number(stats.vocabulary_listens) || 0} écoutée(s)`;
  return `<td class="d-num" data-tip="${esc(tip)}">${seen || '<span class="d-zero">0</span>'}</td>`;
}
