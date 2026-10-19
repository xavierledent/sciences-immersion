/* ===== Tableau de bord : fiche élève =====
   Pleine page, ouverte d'un clic sur un élève du tableau de la classe.
   En haut : retour à la classe, élève précédent / suivant (ordre du
   tableau), identité, export CSV des réponses, quatre chiffres, répartition
   de l'activité. Puis un onglet par chapitre : exercices (liste compacte,
   un clic déplie l'énoncé et la réponse entière), jeux, labos (rapport
   corrigé du dernier Check), autoévaluation attendu par attendu,
   vocabulaire et liens ouverts, devoirs reçus (dashboard-homework.js : une
   tuile-résumé dans « Tous les chapitres », une carte par chapitre). */

import {
  esc, LIGHT, BULBS, ACTIVITY_SECTIONS, stackBar, cellsBar, legend, bulbCounts,
  relativeDay, fullDate, daysSince, percent, WARN_ICON
} from './dashboard-ui.js';
import { LEVELS, summarizeChapter, activityBySection, studentTotals } from './dashboard-data.js';
import { labStatus } from './dashboard-class.js';
import { studentHomework, homeworkSummary, homeworkDetailHtml } from './dashboard-homework.js';

const LEVEL_LABEL = { level1: 'Level 1', level2: 'Level 2', level3: 'Level 3' };
const LIGHT_SHORT = { 3: 'Vert', 2: 'Orange', 1: 'Rouge', answered: 'Sans feu', none: 'Pas fait' };
const PREVIEW_CHARS = 110;
const ALL_TAB = '__all__';

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
     work, students, content(track), teacherName, prefs, savePrefs(),
     order (adresses dans l'ordre du tableau), onBack(), onOpen(adresse)
   } */
// keepScroll : changement d'onglet ou de carte, on reste où l'on est.
export async function renderStudentView(root, ctx, keepScroll) {
  // Devoirs reçus : un échec de lecture n'empêche pas la fiche (pas de carte Devoirs).
  const [chapters, hw] = await Promise.all([
    ctx.content(ctx.track),
    studentHomework(ctx.email, { students: ctx.students, work: ctx.work, content: ctx.content })
      .catch(e => { console.error('Devoirs illisibles', e); return null; })
  ]);
  ctx.hw = hw;
  const work = ctx.work[ctx.email] || { uid: null, chapters: {}, history: {} };
  const summaries = {};
  chapters.forEach(ch => {
    summaries[ch.id] = summarizeChapter(ch, work.chapters[ch.id], (work.history || {})[ch.id]);
  });
  const totals = studentTotals(work);

  // Onglet ouvert : ALL_TAB (« Tous les chapitres ») ou un chapitre.
  let chapterId = ctx.prefs.studentChapterId;
  if (chapterId !== ALL_TAB && !chapters.some(c => c.id === chapterId)) chapterId = ALL_TAB;
  const chapter = chapters.find(c => c.id === chapterId) || null;
  const scope = chapter ? [chapter] : chapters;

  const p = ctx.person;
  const name = p.nom ? `${p.nom} ${p.prenom}` : ctx.email;
  const index = ctx.order.indexOf(ctx.email);
  const prev = index > 0 ? ctx.order[index - 1] : null;
  const next = index >= 0 && index < ctx.order.length - 1 ? ctx.order[index + 1] : null;

  // Chiffres du haut et répartition : tout l'élève, ou le chapitre ouvert.
  const last = chapter ? summaries[chapter.id].lastActivity : totals.last;
  const sections = chapter ? activityBySection([summaries[chapter.id].stats]) : activityBySection(totals.statsList);
  const sum = f => scope.reduce((n, c) => n + f(c, summaries[c.id]), 0);
  const totalEx = sum(c => c.exerciseCount);
  const answered = sum((c, s) => s.answeredCount);
  const totalGames = sum(c => c.games.length);
  const gamesDone = sum((c, s) => s.gamesDone);
  const totalLabs = sum(c => c.labs.length);
  const labsDone = sum((c, s) => s.labsChecked);
  const watched = daysSince(last) >= 14;
  const outOf = (n, total, none) => total
    ? `<span class="d-kpi-value">${n}<span class="s-kpi-of"> / ${total}</span></span>`
    : `<span class="d-kpi-value d-zero">—</span><span class="d-kpi-note">${none}</span>`;
  const where = chapter ? ` · ${esc(chapter.short)}` : '';
  const hasWork = !!totals.last || chapters.some(c => summaries[c.id].answeredCount);
  // « Tous les chapitres » : une 5e tuile, résumé des devoirs (détail dans chaque chapitre).
  // Toujours affichée : « Aucun devoir reçu » repère un élève oublié dans les envois.
  const hwAll = !chapter && hw ? homeworkSummary(hw, null) : null;
  const hwTile = chapter ? '' : !hw
    ? `<div class="d-kpi s-hw-kpi"><span class="d-kpi-label">Devoirs</span>
        <span class="d-kpi-value d-zero">—</span><span class="d-kpi-note">lecture impossible (rechargez la page)</span></div>`
    : !hwAll.received
      ? `<div class="d-kpi s-hw-kpi"><span class="d-kpi-label">Devoirs</span>
          <span class="d-kpi-value d-zero">—</span><span class="d-kpi-note">aucun devoir reçu</span></div>`
      : `<div class="d-kpi s-hw-kpi" data-tip="${esc(hwAll.tip)}" tabindex="0">
          <span class="d-kpi-label">Devoirs</span>
          <span class="d-kpi-value">${hwAll.rate === null ? '—' : `${hwAll.rate} %`}<span class="s-kpi-of"> à temps</span></span>
          ${miniBar(hwAll.parts, hwAll.total)}
          <span class="d-kpi-note">${hwAll.received} reçu${hwAll.received > 1 ? 's' : ''} · détail dans chaque chapitre</span></div>`;

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
    </div>

    ${!ctx.connected && totals.last ? `<p class="s-notice">Pas encore reconnecté·e depuis le passage à Firebase :
      ce qui est affiché vient de l’historique du Google Sheet. Le texte des réponses arrivera à sa prochaine connexion.</p>` : ''}

    <nav class="t-tabs s-tabs" role="tablist">
      <button type="button" role="tab" class="t-tab${chapter ? '' : ' is-active'}" aria-selected="${!chapter}" data-chapter="${ALL_TAB}">Tous les chapitres</button>
      ${chapters.map(c => `<button type="button" role="tab" class="t-tab${c.id === chapterId ? ' is-active' : ''}"
        aria-selected="${c.id === chapterId}" data-chapter="${esc(c.id)}">${esc(c.short)}</button>`).join('')}</nav>

    <div class="s-scope">
      <div class="d-kpis${hwTile ? ' s-kpis-5' : ''}">
        <div class="d-kpi${watched ? ' is-alert' : ''}" data-tip="${esc(fullDate(last))}">
          <span class="d-kpi-label">${watched ? WARN_ICON : ''}Dernière activité${where}</span>
          <span class="d-kpi-value s-kpi-text">${relativeDay(last)}</span></div>
        <div class="d-kpi"><span class="d-kpi-label">Exercices répondus</span>
          ${outOf(answered, totalEx, 'pas encore d’exercices')}
          ${totalEx ? `<span class="d-kpi-note">${percent(answered, totalEx)} % des exercices</span>` : ''}</div>
        <div class="d-kpi"><span class="d-kpi-label">Jeux terminés</span>${outOf(gamesDone, totalGames, 'pas de jeux')}</div>
        <div class="d-kpi"><span class="d-kpi-label">Labos menés au Check</span>${outOf(labsDone, totalLabs, 'pas de labo')}</div>
        ${hwTile}
      </div>
      <section class="t-section s-activity">${activityHtml(sections)}</section>
      ${chapter ? chapterHtml(chapter, summaries[chapter.id], ctx) : overviewHtml(chapters, summaries)}
    </div>

    ${hasWork ? exportSection(chapters, chapter) : ''}`;

  root.querySelector('#s-back').addEventListener('click', ctx.onBack);
  if (prev) root.querySelector('#s-prev').addEventListener('click', () => ctx.onOpen(prev));
  if (next) root.querySelector('#s-next').addEventListener('click', () => ctx.onOpen(next));
  root.querySelectorAll('[data-chapter]').forEach(tab => tab.addEventListener('click', () => {
    ctx.prefs.studentChapterId = tab.dataset.chapter;
    ctx.savePrefs();
    renderStudentView(root, ctx, true);
  }));
  bindChapter(root, ctx);
  const exportBtn = root.querySelector('#s-export');
  if (exportBtn) exportBtn.addEventListener('click', () =>
    exportAnswers(root.querySelector('#s-export-scope').value, chapters, summaries, ctx));
  if (!keepScroll) window.scrollTo(0, 0);
}

/* ===== Haut de fiche ===== */

// Onglet « Tous les chapitres » : une ligne par chapitre ; un clic ouvre le chapitre.
function overviewHtml(chapters, summaries) {
  const dash = '<span class="d-zero">—</span>';
  const rows = chapters.map(c => {
    const s = summaries[c.id];
    const bar = c.exerciseCount
      ? stackBar([3, 2, 1, 'answered'].map(k => ({ value: s.counts[k], color: LIGHT[k].color })), c.exerciseCount,
        `<strong>${esc(c.title)}</strong><br>${s.answeredCount}/${c.exerciseCount} exercices répondus`, `${s.answeredCount} sur ${c.exerciseCount}`)
        + `<span class="d-cell-note">${s.answeredCount}/${c.exerciseCount}</span>`
      : dash;
    return `<tr>
      <td class="s-ov-name"><button type="button" class="d-student" data-chapter="${esc(c.id)}">${esc(c.short)}</button>
        <span class="d-cell-note">${esc(c.title.replace(/^[^:]*:\s*/, ''))}</span></td>
      <td class="s-ov-bar">${bar}</td>
      <td class="d-num">${c.games.length ? `${s.gamesDone}<span class="b-of"> / ${c.games.length}</span>` : dash}</td>
      <td class="d-num">${c.labs.length ? `${s.labsChecked}<span class="b-of"> / ${c.labs.length}</span>` : dash}</td>
      <td>${c.autoevalItems.length ? bulbCounts(s.ratings) : dash}</td>
      <td class="d-num">${Number(s.stats.vocabulary_cards_seen) || dash}</td>
      <td class="d-num" data-tip="${esc(fullDate(s.lastActivity))}">${s.lastActivity ? relativeDay(s.lastActivity) : dash}</td></tr>`;
  }).join('');
  return `<section class="t-section s-overview">
    <div class="s-card-head"><h3 class="s-h3">Par chapitre</h3><span class="t-muted">un clic sur un chapitre ouvre son détail</span></div>
    ${legend([3, 2, 1, 'answered', 'none'].map(k => LIGHT[k]))}
    <div class="t-scroll"><table class="t-table b-table s-ov-table"><thead><tr>
      <th>Chapitre</th><th>Exercices</th><th class="d-num">Jeux terminés</th><th class="d-num">Labos au Check</th>
      <th>Autoévaluation</th><th class="d-num">Cartes vues</th><th class="d-num">Dernière activité</th></tr></thead>
    <tbody>${rows}</tbody></table></div></section>`;
}

// Export des réponses : sa propre section, en bas de la fiche.
function exportSection(chapters, current) {
  const options = [`<option value="all"${current ? '' : ' selected'}>Tous les chapitres</option>`];
  chapters.filter(c => c.exerciseCount).forEach(c => {
    options.push(`<option value="${esc(c.id)}"${current && current.id === c.id ? ' selected' : ''}>${esc(c.short)}</option>`);
    LEVELS.filter(l => c.levels[l].length).forEach(l =>
      options.push(`<option value="${esc(c.id)}|${l}">${esc(c.short)} · ${LEVEL_LABEL[l]}</option>`));
  });
  return `<section class="t-section s-export">
    <div><h3 class="s-h3">Exporter les réponses</h3>
      <p class="t-help">Télécharge un fichier (Excel, Google Sheets) avec chaque réponse écrite de l’élève :
        chapitre, niveau, exercice, énoncé, réponse et feu. Utile pour un conseil de classe ou une rencontre avec les parents.</p></div>
    <div class="d-filters">
      <label>Réponses <select id="s-export-scope">${options.join('')}</select></label>
      <button type="button" class="t-btn t-btn-primary" id="s-export">Télécharger (CSV)</button></div>
  </section>`;
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

/* ===== Un chapitre =====
   Une rangée de cartes-résumés (Exercices, Jeux, Labos, Autoévaluation,
   Vocabulaire et liens ; seulement celles que le chapitre contient) qui
   servent d'onglets ; en dessous, le détail de la carte choisie, seul, sur
   toute la largeur. */

const PANELS = {
  exercises: 'Exercices',
  games: 'Jeux',
  labs: 'Labos',
  autoeval: 'Autoévaluation',
  vocab: 'Vocabulaire et liens',
  homework: 'Devoirs'
};

function panelsOf(chapter, hw) {
  return Object.keys(PANELS).filter(k =>
    (k !== 'games' || chapter.games.length) &&
    (k !== 'labs' || chapter.labs.length) &&
    (k !== 'autoeval' || chapter.autoevalItems.length));
}

// Barre décorative d'une carte (la carte entière est le bouton) : pas de
// bulle ni de focus à elle.
function miniBar(parts, total) {
  const sum = parts.reduce((n, p) => n + p.value, 0);
  const rest = Math.max(0, total - sum);
  const spans = parts.filter(p => p.value > 0).map(p => `<span style="flex-grow:${p.value};background:${p.color}"></span>`);
  if (rest > 0 || !spans.length) spans.push(`<span style="flex-grow:${rest || 1};background:#e9eef4"></span>`);
  return `<div class="d-bar" aria-hidden="true">${spans.join('')}</div>`;
}

function chapterHtml(chapter, s, ctx) {
  const panels = panelsOf(chapter, ctx.hw);
  let panel = ctx.prefs.studentPanel;
  if (!panels.includes(panel)) panel = panels[0];
  const n = k => Number(s.stats[k]) || 0;

  const summary = {
    exercises: () => chapter.exerciseCount
      ? { value: `${s.answeredCount}<span class="s-kpi-of"> / ${chapter.exerciseCount}</span>`, note: 'exercices répondus',
          viz: miniBar([3, 2, 1, 'answered'].map(k => ({ value: s.counts[k], color: LIGHT[k].color })), chapter.exerciseCount) }
      : { value: '—', note: 'pas encore d’exercices', viz: '' },
    games: () => ({ value: `${s.gamesDone}<span class="s-kpi-of"> / ${chapter.games.length}</span>`, note: 'jeux terminés',
      viz: miniBar([{ value: s.gamesDone, color: '#4a6483' }], chapter.games.length) }),
    labs: () => ({ value: `${s.labsChecked}<span class="s-kpi-of"> / ${chapter.labs.length}</span>`, note: 'menés au Check',
      viz: `<div class="s-card-labs">${s.labs.map(l => `<span>${esc(labStatus(l.result).text)}</span>`).join('')}</div>` }),
    autoeval: () => ({ value: `${s.ratedCount}<span class="s-kpi-of"> / ${chapter.autoevalItems.length}</span>`, note: 'attendus évalués',
      viz: bulbCounts(s.ratings) }),
    vocab: () => ({ value: `${n('vocabulary_cards_seen')}`, note: 'cartes vues',
      viz: `<span class="d-cell-note">${n('vocabulary_sessions')} session(s) · ${n('resource_link_opened') + n('exploration_link_opened')} lien(s) ouvert(s)</span>` }),
    homework: () => {
      if (!ctx.hw) return { value: '—', note: 'lecture impossible', viz: '' };
      const h = homeworkSummary(ctx.hw, chapter.folder);
      if (!h.received) return { value: '—', note: 'aucun devoir dans ce chapitre', viz: '' };
      return { value: h.rate === null ? '—' : `${h.rate} %`, note: `à temps · ${h.received} devoir${h.received > 1 ? 's' : ''}`,
        viz: miniBar(h.parts, h.total), tip: h.tip };
    }
  };

  const cards = panels.map(k => {
    const c = summary[k]();
    return `<button type="button" role="tab" class="s-pcard${k === panel ? ' is-active' : ''}" aria-selected="${k === panel}" data-panel="${k}"${c.tip ? ` data-tip="${esc(c.tip)}"` : ''}>
      <span class="d-kpi-label">${PANELS[k]}</span>
      <span class="d-kpi-value">${c.value}</span>
      <span class="d-kpi-note">${c.note}</span>
      ${c.viz ? `<span class="s-pcard-viz">${c.viz}</span>` : ''}</button>`;
  }).join('');

  const detail = {
    exercises: () => chapter.exerciseCount ? exercisesHtml(chapter, s, ctx) : '<p class="t-muted">Pas encore d’exercices dans ce chapitre.</p>',
    games: () => gamesHtml(s),
    labs: () => labsHtml(chapter, s),
    autoeval: () => autoevalHtml(chapter, s),
    vocab: () => vocabHtml(s.stats),
    homework: () => ctx.hw ? homeworkDetailHtml(ctx.hw, chapter.folder)
      : '<p class="t-help is-error">Les devoirs n’ont pas pu être lus. Rechargez la page.</p>'
  }[panel]();

  return `<div class="s-pcards" role="tablist" style="--s-cols:${panels.length}">${cards}</div>
    <section class="t-section s-panel" role="tabpanel">
      <div class="s-card-head"><h3 class="s-h3">${PANELS[panel]}</h3></div>${detail}</section>`;
}

/* Exercices : une ligne par exercice ; dépliée, l'énoncé à gauche et la
   réponse à droite, partie par partie. */
function exercisesHtml(chapter, s, ctx) {
  const showAll = !!ctx.prefs.studentShowAll;
  const legendHtml = legend([3, 2, 1, 'answered', 'none'].map(k => LIGHT[k]));
  const levels = LEVELS.filter(l => chapter.levels[l].length).map(level => {
    const list = s.levels[level];
    const done = list.filter(e => e.state).length;
    const cells = list.map(e => ({ color: LIGHT[e.state || 'none'].color,
      tip: `<strong>Ex. ${esc(e.id)}</strong>${e.title ? ' — ' + esc(e.title) : ''}<br>${esc(LIGHT[e.state || 'none'].label)}` }));
    const rows = list.filter(e => showAll || e.state).map(e => exerciseRow(e)).join('');
    return `<div class="s-level">
      <div class="s-level-head"><h4>${LEVEL_LABEL[level]}</h4>
        <div class="s-level-cells">${cellsBar(cells, `${done} sur ${list.length} exercices répondus`)}</div>
        <span class="t-muted">${done}/${list.length}</span></div>
      ${rows ? `<ul class="s-ex-list">${rows}</ul>` : `<p class="t-muted s-none">Aucun exercice répondu.</p>`}</div>`;
  }).join('');
  return `<div class="s-ex-tools">${legendHtml}
    <label class="s-toggle"><input type="checkbox" id="s-show-all"${showAll ? ' checked' : ''}> Afficher aussi les exercices pas faits</label></div>${levels}`;
}

function exerciseRow(e) {
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
      <div class="s-sub-q">${e.subs.length > 1 ? `<span class="s-sub-label">Partie ${String.fromCharCode(97 + i)}</span>` : ''}
        <p class="s-question">${rich(e.questions[i] || '')}</p></div>
      <div class="s-sub-a">${answer}
        <p class="s-sub-light"><span class="d-swatch" style="background:${look.color}"></span>${esc(look.label)}</p></div></div>`;
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

// Jeux : une tuile par jeu, regroupées par type.
function gamesHtml(s) {
  const types = [];
  s.games.forEach(g => { if (!types.includes(g.typeLabel)) types.push(g.typeLabel); });
  return types.map(type => `<h4 class="s-h4">${esc(type)}</h4><div class="s-tiles">${s.games.filter(g => g.typeLabel === type).map(g => `
    <div class="s-tile${g.done ? ' is-done' : ''}">
      <span class="s-tile-title">${esc(g.title)}</span>
      <span class="s-tile-state">${g.done ? esc(g.detail || 'terminé') : 'pas encore terminé'}</span></div>`).join('')}</div>`).join('');
}

// Labos : les informations à gauche, le rapport corrigé à droite.
function labsHtml(chapter, s) {
  return s.labs.map(l => {
    const st = labStatus(l.result);
    const r = l.result;
    const when = r && r.reportAt ? new Date(r.reportAt).toLocaleDateString('fr-BE', { day: 'numeric', month: 'long' }) : '';
    const facts = [];
    if (r) {
      facts.push(['Étape atteinte', `${r.maxStep || 1} / 4`]);
      facts.push(['Checks faits', r.checks || 0]);
      if (r.best && r.best.total) facts.push(['Meilleur score', `${r.best.score} / ${r.best.total}`]);
      if (r.last && r.last.total) facts.push(['Dernier score', `${r.last.score} / ${r.last.total}`]);
      if (r.last && r.last.minutes) facts.push(['Temps actif', `${Math.round(r.last.minutes)} min`]);
    }
    const report = r && r.report
      ? `<div class="s-report" data-report-box="${esc(l.id)}"><p class="t-muted">Chargement du rapport…</p></div>`
      : `<div class="s-report-empty">${r && r.checks
        ? 'Rapport non enregistré : ce Check a été fait avant le tableau de bord.'
        : (r ? 'Le rapport apparaîtra ici après le Check.' : 'Labo pas encore ouvert.')}</div>`;
    return `<div class="s-lab">
      <div class="s-lab-info">
        <h4 class="s-lab-title">${esc(l.title)}</h4>
        <p class="${st.started ? 's-lab-state' : 'd-zero'}">${st.text}</p>
        ${facts.length ? `<dl class="s-facts">${facts.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>` : ''}
        ${when ? `<p class="d-cell-note">Rapport du ${when}</p>` : ''}
      </div>${report}</div>`;
  }).join('');
}

// Autoévaluation : une colonne par catégorie.
function autoevalHtml(chapter, s) {
  const groups = {};
  chapter.autoevalItems.forEach(item => {
    (groups[item.categoryTitle] = groups[item.categoryTitle] || []).push(item);
  });
  return `<div class="s-ae-legend">${legend([3, 2, 1].map(k => BULBS[k]))}</div>
    <div class="s-ae-cols">${Object.keys(groups).map(title => `<div><h4 class="s-h4">${esc(title)}</h4><ul class="s-items">${groups[title].map(item => {
      const v = s.itemRatings[item.id] || 0;
      const bulbs = [1, 2, 3].map(k => `<span class="s-bulb" style="background:${k <= v ? BULBS[v].color : '#e9eef4'}"></span>`).join('');
      return `<li><span class="s-bulbs" role="img" aria-label="${v ? `${v} ampoule(s)` : 'non évalué'}" data-tip="${esc(v ? BULBS[v].label : 'non évalué')}">${bulbs}</span>
        <span class="${v ? '' : 'd-zero'}">${esc(plain(item.text))}</span></li>`;
    }).join('')}</ul></div>`).join('')}</div>`;
}

// Vocabulaire et liens : des chiffres en tuiles.
function vocabHtml(stats) {
  const n = k => Number(stats[k]) || 0;
  const tile = (label, v) => `<div class="s-stat"><span class="d-kpi-value${v ? '' : ' d-zero'}">${v}</span><span class="d-kpi-label">${label}</span></div>`;
  return `<h4 class="s-h4">Vocabulaire</h4><div class="s-stats">
      ${tile('sessions', n('vocabulary_sessions'))}${tile('cartes vues', n('vocabulary_cards_seen'))}
      ${tile('cartes retournées', n('vocabulary_flips'))}${tile('cartes écoutées', n('vocabulary_listens'))}</div>
    <h4 class="s-h4">Liens ouverts</h4><div class="s-stats">
      ${tile('ressources', n('resource_link_opened'))}${tile('explorations', n('exploration_link_opened'))}</div>`;
}

function bindChapter(root, ctx) {
  root.querySelectorAll('[data-panel]').forEach(btn => btn.addEventListener('click', () => {
    ctx.prefs.studentPanel = btn.dataset.panel;
    ctx.savePrefs();
    renderStudentView(root, ctx, true);
  }));
  root.querySelectorAll('.s-ex-row').forEach(btn => btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    btn.nextElementSibling.hidden = !open;
  }));
  const all = root.querySelector('#s-show-all');
  if (all) all.addEventListener('change', () => {
    ctx.prefs.studentShowAll = all.checked;
    ctx.savePrefs();
    renderStudentView(root, ctx, true);
  });
  // Rapports corrigés : affichés d'office dans le détail des labos.
  const boxes = root.querySelectorAll('[data-report-box]');
  if (boxes.length) ctx.content(ctx.track).then(chapters => boxes.forEach(box => {
    const id = box.dataset.reportBox;
    const chapter = chapters.find(c => c.labs.some(l => l.id === id));
    if (!chapter) return;
    const lab = chapter.labs.find(l => l.id === id);
    const doc = (ctx.work[ctx.email].chapters[chapter.id] || {});
    let result = null;
    try { result = JSON.parse((doc.labResult || {})[id]); } catch (e) { result = null; }
    if (result && result.report) showReport(box, chapter, lab, result.report);
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
