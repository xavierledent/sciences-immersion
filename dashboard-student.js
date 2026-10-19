/* ===== Tableau de bord : fiche élève =====
   Pleine page, ouverte d'un clic sur un élève du tableau de la classe.
   En haut : retour à la classe, élève précédent / suivant (ordre du
   tableau), identité, export CSV des réponses, quatre chiffres, répartition
   de l'activité. Puis un onglet par chapitre : exercices (liste compacte,
   un clic déplie l'énoncé et la réponse entière), jeux, labos (rapport
   corrigé du dernier Check), autoévaluation attendu par attendu,
   vocabulaire et liens ouverts. */

import {
  esc, LIGHT, BULBS, ACTIVITY_SECTIONS, stackBar, cellsBar, legend,
  relativeDay, fullDate, daysSince, percent, WARN_ICON
} from './dashboard-ui.js';
import { LEVELS, summarizeChapter, activityBySection, studentTotals } from './dashboard-data.js';
import { labStatus } from './dashboard-class.js';

const LEVEL_LABEL = { level1: 'Level 1', level2: 'Level 2', level3: 'Level 3' };
const LIGHT_SHORT = { 3: 'Vert', 2: 'Orange', 1: 'Rouge', answered: 'Sans feu', none: 'Pas fait' };
const PREVIEW_CHARS = 110;

// Texte des JSON du site : seules <strong>, <em>, <u> et <br> sont gardées.
function rich(text) {
  return esc(text)
    .replace(/&lt;(\/?)(strong|em|u)&gt;/g, '<$1$2>')
    .replace(/&lt;br\s*\/?&gt;/g, '<br>');
}

function plain(text) {
  return String(text || '').replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function clip(text, n) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
}

/* ctx : {
     email, person, className, classLabel, track, connected,
     work, content(track), teacherName, prefs, savePrefs(),
     order (adresses dans l'ordre du tableau), onBack(), onOpen(adresse)
   } */
export async function renderStudentView(root, ctx) {
  const chapters = await ctx.content(ctx.track);
  const work = ctx.work[ctx.email] || { uid: null, chapters: {}, history: {} };
  const summaries = {};
  chapters.forEach(ch => {
    summaries[ch.id] = summarizeChapter(ch, work.chapters[ch.id], (work.history || {})[ch.id]);
  });
  const { last, statsList } = studentTotals(work);
  const sections = activityBySection(statsList);

  let chapterId = ctx.prefs.studentChapterId;
  if (!chapters.some(c => c.id === chapterId)) {
    const active = chapters.find(c => {
      const s = summaries[c.id];
      return s.answeredCount || s.gamesDone || s.ratedCount || Object.keys(s.stats).length;
    });
    chapterId = (active || chapters[0] || {}).id;
  }
  const chapter = chapters.find(c => c.id === chapterId);

  const p = ctx.person;
  const name = p.nom ? `${p.nom} ${p.prenom}` : ctx.email;
  const index = ctx.order.indexOf(ctx.email);
  const prev = index > 0 ? ctx.order[index - 1] : null;
  const next = index >= 0 && index < ctx.order.length - 1 ? ctx.order[index + 1] : null;

  const totalEx = chapters.reduce((n, c) => n + c.exerciseCount, 0);
  const answered = chapters.reduce((n, c) => n + summaries[c.id].answeredCount, 0);
  const totalGames = chapters.reduce((n, c) => n + c.games.length, 0);
  const gamesDone = chapters.reduce((n, c) => n + summaries[c.id].gamesDone, 0);
  const totalLabs = chapters.reduce((n, c) => n + c.labs.length, 0);
  const labsDone = chapters.reduce((n, c) => n + summaries[c.id].labsChecked, 0);
  const watched = daysSince(last) >= 14;

  root.innerHTML = `
    <div class="s-top">
      <button type="button" class="t-btn" id="s-back">← ${esc(ctx.classLabel)}</button>
      <div class="s-nav">
        <button type="button" class="t-btn" id="s-prev"${prev ? '' : ' disabled'}>‹ Précédent</button>
        ${index >= 0 ? `<span class="t-muted">${index + 1} / ${ctx.order.length}</span>` : ''}
        <button type="button" class="t-btn" id="s-next"${next ? '' : ' disabled'}>Suivant ›</button>
      </div>
    </div>

    <div class="d-head">
      <div>
        <h2 class="d-title">${esc(name)}</h2>
        <p class="s-meta">${[ctx.className, p.nom ? ctx.email : ''].filter(Boolean).map(esc).join(' · ')}</p>
      </div>
      ${totalEx ? exportControls(chapters) : ''}
    </div>

    ${!ctx.connected && last ? `<p class="s-notice">Pas encore reconnecté·e depuis le passage à Firebase :
      ce qui est affiché vient de l’historique du Google Sheet. Le texte des réponses arrivera à sa prochaine connexion.</p>` : ''}

    <div class="d-kpis">
      <div class="d-kpi${watched ? ' is-alert' : ''}" data-tip="${esc(fullDate(last))}">
        <span class="d-kpi-label">${watched ? WARN_ICON : ''}Dernière activité</span>
        <span class="d-kpi-value s-kpi-text">${relativeDay(last)}</span></div>
      <div class="d-kpi"><span class="d-kpi-label">Exercices répondus</span>
        <span class="d-kpi-value">${answered}<span class="s-kpi-of"> / ${totalEx}</span></span>
        <span class="d-kpi-note">${percent(answered, totalEx)} % des exercices</span></div>
      <div class="d-kpi"><span class="d-kpi-label">Jeux terminés</span>
        <span class="d-kpi-value">${gamesDone}<span class="s-kpi-of"> / ${totalGames}</span></span></div>
      <div class="d-kpi"><span class="d-kpi-label">Labos menés au Check</span>
        <span class="d-kpi-value">${labsDone}<span class="s-kpi-of"> / ${totalLabs}</span></span></div>
    </div>

    <section class="t-section s-activity">${activityHtml(sections)}</section>

    <nav class="t-tabs s-tabs" role="tablist">${chapters.map(c => `<button type="button" role="tab"
      class="t-tab${c.id === chapterId ? ' is-active' : ''}" aria-selected="${c.id === chapterId}"
      data-chapter="${esc(c.id)}">${esc(c.short)}</button>`).join('')}</nav>
    <div class="s-chapter">${chapter ? chapterHtml(chapter, summaries[chapter.id], ctx) : ''}</div>`;

  root.querySelector('#s-back').addEventListener('click', ctx.onBack);
  if (prev) root.querySelector('#s-prev').addEventListener('click', () => ctx.onOpen(prev));
  if (next) root.querySelector('#s-next').addEventListener('click', () => ctx.onOpen(next));
  root.querySelectorAll('[data-chapter]').forEach(tab => tab.addEventListener('click', () => {
    ctx.prefs.studentChapterId = tab.dataset.chapter;
    ctx.savePrefs();
    renderStudentView(root, ctx);
  }));
  bindChapter(root, ctx);
  const exportBtn = root.querySelector('#s-export');
  if (exportBtn) exportBtn.addEventListener('click', () =>
    exportAnswers(root.querySelector('#s-export-scope').value, chapters, summaries, ctx));
  window.scrollTo(0, 0);
}

/* ===== Haut de fiche ===== */

function exportControls(chapters) {
  const options = [`<option value="all">Tous les chapitres</option>`];
  chapters.filter(c => c.exerciseCount).forEach(c => {
    options.push(`<option value="${esc(c.id)}">${esc(c.short)}</option>`);
    LEVELS.filter(l => c.levels[l].length).forEach(l =>
      options.push(`<option value="${esc(c.id)}|${l}">${esc(c.short)} · ${LEVEL_LABEL[l]}</option>`));
  });
  return `<div class="d-filters">
    <label>Réponses <select id="s-export-scope">${options.join('')}</select></label>
    <button type="button" class="t-btn" id="s-export">Exporter (CSV)</button></div>`;
}

function activityHtml(sections) {
  const keys = Object.keys(ACTIVITY_SECTIONS);
  const total = keys.reduce((n, k) => n + sections[k], 0);
  if (!total) return '<h3 class="s-h3">Répartition de l’activité</h3><p class="t-muted">Aucune action enregistrée.</p>';
  const parts = keys.map(k => ({ value: sections[k], color: ACTIVITY_SECTIONS[k].color }));
  const tip = `<strong>${total} actions</strong>`;
  return `<div class="s-activity-head"><h3 class="s-h3">Répartition de l’activité</h3><span class="t-muted">${total} actions</span></div>
    <div class="s-activity-bar">${stackBar(parts, total, tip, `${total} actions`)}</div>
    <ul class="s-activity-list">${keys.map(k => `<li${sections[k] ? '' : ' class="d-zero"'}>
      <span class="d-swatch" style="background:${ACTIVITY_SECTIONS[k].color}"></span>${esc(ACTIVITY_SECTIONS[k].label)}
      <span class="s-activity-n">${sections[k]}</span><span class="s-activity-pct">${percent(sections[k], total)} %</span></li>`).join('')}</ul>`;
}

/* ===== Un chapitre ===== */

function chapterHtml(chapter, s, ctx) {
  const side = [
    chapter.games.length ? card('Jeux', `${s.gamesDone}/${chapter.games.length} terminés`, gamesHtml(s)) : '',
    chapter.labs.length ? card('Labos', '', labsHtml(chapter, s)) : '',
    chapter.autoevalItems.length ? card('Autoévaluation', `${s.ratedCount}/${chapter.autoevalItems.length} évalués`, autoevalHtml(chapter, s)) : '',
    card('Vocabulaire et liens', '', vocabHtml(s.stats))
  ].join('');
  const main = chapter.exerciseCount
    ? card('Exercices', `${s.answeredCount}/${chapter.exerciseCount} répondus`, exercisesHtml(chapter, s, ctx))
    : card('Exercices', '', '<p class="t-muted">Pas encore d’exercices dans ce chapitre.</p>');
  return `<div class="s-grid"><div class="s-main">${main}</div><div class="s-side">${side}</div></div>`;
}

function card(title, note, body) {
  return `<section class="t-section s-card"><div class="s-card-head"><h3 class="s-h3">${esc(title)}</h3>
    ${note ? `<span class="t-muted">${esc(note)}</span>` : ''}</div>${body}</section>`;
}

function exercisesHtml(chapter, s, ctx) {
  const showAll = !!ctx.prefs.studentShowAll;
  const legendHtml = legend([3, 2, 1, 'answered', 'none'].map(k => LIGHT[k]));
  const levels = LEVELS.filter(l => chapter.levels[l].length).map(level => {
    const list = s.levels[level];
    const done = list.filter(e => e.state).length;
    const cells = list.map(e => ({ color: LIGHT[e.state || 'none'].color,
      tip: `<strong>Ex. ${esc(e.id)}</strong>${e.title ? ' — ' + esc(e.title) : ''}<br>${esc(LIGHT[e.state || 'none'].label)}` }));
    const rows = list.filter(e => showAll || e.state).map(e => exerciseRow(e, level)).join('');
    return `<div class="s-level">
      <div class="s-level-head"><h4>${LEVEL_LABEL[level]}</h4><span class="t-muted">${done}/${list.length}</span></div>
      ${cellsBar(cells, `${done} sur ${list.length} exercices répondus`)}
      ${rows ? `<ul class="s-ex-list">${rows}</ul>` : `<p class="t-muted s-none">Aucun exercice répondu.</p>`}</div>`;
  }).join('');
  return `<div class="s-ex-tools">${legendHtml}
    <label class="s-toggle"><input type="checkbox" id="s-show-all"${showAll ? ' checked' : ''}> Afficher aussi les exercices pas faits</label></div>${levels}`;
}

function exerciseRow(e, level) {
  const state = e.state || 'none';
  const answeredSubs = e.subs.filter(sub => sub.length > 0);
  const first = answeredSubs[0];
  let preview = '';
  if (!first) preview = '<span class="t-muted">pas de réponse</span>';
  else if (first.text) preview = `« ${esc(clip(first.text, PREVIEW_CHARS))} »`;
  else preview = `<span class="t-muted">réponse de ${first.length} caractères (texte à sa prochaine connexion)</span>`;
  if (e.subs.length > 1) preview += ` <span class="s-ex-subs">${answeredSubs.length}/${e.subs.length} parties</span>`;

  const detail = e.subs.map((sub, i) => {
    const look = sub.light ? LIGHT[sub.light] : (sub.length ? LIGHT.answered : LIGHT.none);
    const answer = sub.text
      ? `<p class="s-answer">${esc(sub.text)}</p>`
      : (sub.length ? `<p class="s-answer is-missing">Réponse de ${sub.length} caractères : le texte arrivera à sa prochaine connexion.</p>`
        : '<p class="s-answer is-missing">Pas de réponse.</p>');
    return `<div class="s-sub">
      ${e.subs.length > 1 ? `<div class="s-sub-label">Partie ${String.fromCharCode(97 + i)}</div>` : ''}
      <p class="s-question">${rich(e.questions[i] || '')}</p>
      ${answer}
      <p class="s-sub-light"><span class="d-swatch" style="background:${look.color}"></span>${esc(look.label)}</p></div>`;
  }).join('');

  return `<li class="s-ex">
    <button type="button" class="s-ex-row" aria-expanded="false">
      <span class="s-ex-num">Ex. ${esc(e.id)}</span>
      <span class="s-ex-light"><span class="d-swatch" style="background:${LIGHT[state].color}"></span>${LIGHT_SHORT[state]}</span>
      <span class="s-ex-preview">${e.title ? `<span class="s-ex-title">${esc(e.title)}</span>` : ''}${preview}</span>
      <span class="s-ex-chevron" aria-hidden="true">›</span>
    </button>
    <div class="s-ex-detail" hidden>${detail}</div></li>`;
}

function gamesHtml(s) {
  return `<table class="t-table s-table"><tbody>${s.games.map(g => `<tr>
    <td><span class="s-game-title">${esc(g.title)}</span><span class="d-cell-note">${esc(g.typeLabel)}</span></td>
    <td class="s-right${g.done ? '' : ' d-zero'}">${g.done ? esc(g.detail || 'terminé') : '—'}</td></tr>`).join('')}</tbody></table>`;
}

function labsHtml(chapter, s) {
  return s.labs.map(l => {
    const st = labStatus(l.result);
    const r = l.result;
    const when = r && r.reportAt ? new Date(r.reportAt).toLocaleDateString('fr-BE', { day: 'numeric', month: 'long' }) : '';
    return `<div class="s-lab">
      <div class="s-lab-head"><span class="s-game-title">${esc(l.title)}</span>
        <span class="${st.started ? 's-lab-state' : 'd-zero'}" data-tip="${esc(`<strong>${esc(l.title)}</strong><br>${st.tip}`)}">${st.text}</span></div>
      ${r && r.report ? `<button type="button" class="t-btn s-report-btn" data-report="${esc(l.id)}">Voir le rapport corrigé${when ? ` (${when})` : ''}</button>
        <div class="s-report" data-report-box="${esc(l.id)}" hidden></div>`
        : (r && r.checks ? '<p class="d-cell-note">Rapport non enregistré (Check fait avant le tableau de bord).</p>' : '')}
    </div>`;
  }).join('');
}

function autoevalHtml(chapter, s) {
  const groups = {};
  chapter.autoevalItems.forEach(item => {
    (groups[item.categoryTitle] = groups[item.categoryTitle] || []).push(item);
  });
  return Object.keys(groups).map(title => `<h4 class="s-h4">${esc(title)}</h4><ul class="s-items">${groups[title].map(item => {
    const v = s.itemRatings[item.id] || 0;
    const bulbs = [1, 2, 3].map(n => `<span class="s-bulb" style="background:${n <= v ? BULBS[v].color : '#e9eef4'}"></span>`).join('');
    return `<li><span class="s-bulbs" role="img" aria-label="${v ? `${v} ampoule(s)` : 'non évalué'}" data-tip="${esc(v ? BULBS[v].label : 'non évalué')}">${bulbs}</span>
      <span class="${v ? '' : 'd-zero'}">${esc(plain(item.text))}</span></li>`;
  }).join('')}</ul>`).join('');
}

function vocabHtml(stats) {
  const n = k => Number(stats[k]) || 0;
  const rows = [
    ['Sessions de vocabulaire', n('vocabulary_sessions')],
    ['Cartes vues', n('vocabulary_cards_seen')],
    ['Cartes retournées', n('vocabulary_flips')],
    ['Cartes écoutées', n('vocabulary_listens')],
    ['Ressources ouvertes', n('resource_link_opened')],
    ['Explorations ouvertes', n('exploration_link_opened')]
  ];
  return `<table class="t-table s-table"><tbody>${rows.map(([label, v]) =>
    `<tr><td>${label}</td><td class="s-right${v ? '' : ' d-zero'}">${v}</td></tr>`).join('')}</tbody></table>`;
}

function bindChapter(root, ctx) {
  root.querySelectorAll('.s-ex-row').forEach(btn => btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    btn.nextElementSibling.hidden = !open;
  }));
  const all = root.querySelector('#s-show-all');
  if (all) all.addEventListener('change', () => {
    ctx.prefs.studentShowAll = all.checked;
    ctx.savePrefs();
    renderStudentView(root, ctx);
  });
  root.querySelectorAll('[data-report]').forEach(btn => btn.addEventListener('click', async () => {
    const box = root.querySelector(`[data-report-box="${CSS.escape(btn.dataset.report)}"]`);
    if (!box.hidden) { box.hidden = true; box.innerHTML = ''; return; }
    const chapters = await ctx.content(ctx.track);
    const chapter = chapters.find(c => c.id === ctx.prefs.studentChapterId) ||
      chapters.find(c => c.labs.some(l => l.id === btn.dataset.report));
    const lab = chapter.labs.find(l => l.id === btn.dataset.report);
    const work = ctx.work[ctx.email];
    const doc = (work.chapters[chapter.id] || {});
    let result = null;
    try { result = JSON.parse((doc.labResult || {})[lab.id]); } catch (e) { result = null; }
    if (!result || !result.report) return;
    box.hidden = false;
    showReport(box, chapter, lab, result.report);
  }));
}

/* Le rapport s'affiche dans un cadre isolé, avec les feuilles de style du
   site, du moteur des labos et du labo lui-même : exactement ce que l'élève
   a vu, sans que ses styles touchent au tableau de bord. */
function showReport(box, chapter, lab, html) {
  const href = path => new URL(path, location.href).href;
  const frame = document.createElement('iframe');
  frame.className = 's-report-frame';
  frame.title = `Rapport corrigé : ${lab.title}`;
  frame.srcdoc = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="${href('style.css')}">
    <link rel="stylesheet" href="${href('lab-engine.css')}">
    <link rel="stylesheet" href="${href(chapter.base + lab.file + '.css')}">
    <style>html,body{background:#fff;margin:0;min-height:0}body{padding:20px 24px}</style>
    </head><body class="${esc(chapter.subjectClass || '')}"><div class="lab-doc">${html}</div></body></html>`;
  frame.addEventListener('load', () => {
    const fit = () => { frame.style.height = `${frame.contentDocument.documentElement.scrollHeight + 4}px`; };
    fit();
    setTimeout(fit, 400); // police chargée
  });
  box.innerHTML = '';
  box.appendChild(frame);
}

/* ===== Export CSV des réponses ===== */

function csvCell(value) {
  const t = String(value == null ? '' : value);
  return /[";\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}

function slug(text) {
  return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}

function exportAnswers(scope, chapters, summaries, ctx) {
  const [chapterId, level] = scope === 'all' ? [null, null] : scope.split('|');
  const lines = [['Élève', 'Classe', 'Chapitre', 'Niveau', 'Exercice', 'Partie', 'Titre', 'Énoncé', 'Réponse', 'Feu']];
  const p = ctx.person;
  const name = p.nom ? `${p.nom} ${p.prenom}` : ctx.email;
  chapters.filter(c => c.exerciseCount && (!chapterId || c.id === chapterId)).forEach(c => {
    LEVELS.filter(l => (!level || l === level) && c.levels[l].length).forEach(l => {
      summaries[c.id].levels[l].forEach(e => e.subs.forEach((sub, i) => {
        if (!sub.length) return;
        lines.push([name, ctx.className, c.short, LEVEL_LABEL[l], e.id, e.subs.length > 1 ? String.fromCharCode(97 + i) : '',
          e.title, plain(e.questions[i]),
          sub.text || `(texte pas encore disponible : ${sub.length} caractères)`,
          sub.light ? LIGHT_SHORT[sub.light] : '']);
      }));
    });
  });
  const csv = '﻿' + lines.map(row => row.map(csvCell).join(';')).join('\r\n');
  const label = scope === 'all' ? 'tout' : slug(chapters.find(c => c.id === chapterId).short + (level ? '-' + LEVEL_LABEL[level] : ''));
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `reponses-${slug(name)}-${label}.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
