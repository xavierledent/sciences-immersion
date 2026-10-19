/* ===== Tableau de bord : « Bilan des activités » =====
   Les mêmes données que le suivi, vues par activité plutôt que par élève,
   pour une classe ou pour tous les élèves (EN et NL ensemble, regroupés par
   chapitre : les deux filières ont les mêmes exercices, jeux et attendus,
   avec les mêmes identifiants). Quatre vues : exercices, jeux,
   autoévaluation, labos. Chaque tableau commence par ce qui résiste le
   plus ; une ligne n'est classée qu'à partir de MIN_STUDENTS élèves
   concernés, les autres suivent, en gris. */

import { esc, LIGHT, BULBS, stackBar, legend, percent } from './dashboard-ui.js';
import { LEVELS, summarizeChapter } from './dashboard-data.js';

export const ALL = '__all__';
const MIN_STUDENTS = 3;
const LEVEL_LABEL = { level1: 'Level 1', level2: 'Level 2', level3: 'Level 3' };
const VIEWS = { exercises: 'Exercices', games: 'Jeux', autoeval: 'Autoévaluation', labs: 'Labos' };

/* ctx : { me, classes, students, work, teacherName, content(track), trackOf(adresse),
           prefs, savePrefs() } */
export async function renderActivitiesView(root, ctx) {
  const classIds = Object.keys(ctx.classes).sort((a, b) => {
    const mine = id => (ctx.classes[id].teacher === ctx.me ? 0 : 1);
    return mine(a) - mine(b) || a.localeCompare(b, 'fr', { numeric: true });
  });
  let scope = ctx.prefs.bilanScope;
  if (scope !== ALL && !(scope in ctx.classes)) scope = classIds[0] || ALL;
  const emails = scope === ALL
    ? Object.keys(ctx.students)
    : Object.keys(ctx.students).filter(e => ctx.students[e].classe === scope);

  // Contenu de référence (titres) : la filière de la classe, l'anglais pour tous.
  const refTrack = scope === ALL ? 'en' : ctx.classes[scope].track;
  const [ref, en, nl] = await Promise.all([ctx.content(refTrack), ctx.content('en'), ctx.content('nl')]);
  const byTrack = { en, nl };

  let folder = ctx.prefs.bilanFolder || '';
  if (folder && !ref.some(c => c.folder === folder)) folder = '';
  let view = ctx.prefs.bilanView;
  if (!VIEWS[view]) view = 'exercises';
  Object.assign(ctx.prefs, { bilanScope: scope, bilanFolder: folder, bilanView: view });
  ctx.savePrefs();

  const chapters = ref.filter(c => !folder || c.folder === folder);
  const agg = aggregate(emails, ctx, byTrack, folder);

  const scopeOptions = classIds.map(id => `<option value="${esc(id)}"${id === scope ? ' selected' : ''}>${esc(id)} — ${esc(ctx.teacherName(ctx.classes[id].teacher))}</option>`).join('')
    + `<option value="${ALL}"${scope === ALL ? ' selected' : ''}>Tous les élèves</option>`;
  const folderOptions = `<option value="">Tous les chapitres</option>` + ref.map(c =>
    `<option value="${esc(c.folder)}"${c.folder === folder ? ' selected' : ''}>${esc(c.title)}</option>`).join('');
  const views = Object.keys(VIEWS).filter(v => v !== 'labs' || chapters.some(c => c.labs.length) || Object.keys(agg.labs).length);

  root.innerHTML = `
    <div class="d-head">
      <h2 class="d-title">${scope === ALL ? 'Tous les élèves' : esc(scope)}
        <span class="d-subtitle">${emails.length} élève${emails.length > 1 ? 's' : ''}</span></h2>
      <div class="d-filters">
        <label>Classe <select id="b-scope">${scopeOptions}</select></label>
        <label>Chapitre <select id="b-folder">${folderOptions}</select></label>
      </div>
    </div>
    <div class="b-switch" role="tablist">${views.map(v => `<button type="button" role="tab" class="b-switch-btn${v === view ? ' is-active' : ''}"
      aria-selected="${v === view}" data-view="${v}">${VIEWS[v]}</button>`).join('')}</div>
    <p class="b-help">${HELP[view]} Une ligne n’est classée qu’à partir de ${MIN_STUDENTS} élèves concernés ; les autres suivent, en gris.</p>
    ${({ exercises: exercisesTable, games: gamesTables, autoeval: autoevalTable, labs: labsTables })[view](chapters, agg, emails.length)}`;

  root.querySelector('#b-scope').addEventListener('change', e => { ctx.prefs.bilanScope = e.target.value; renderActivitiesView(root, ctx); });
  root.querySelector('#b-folder').addEventListener('change', e => { ctx.prefs.bilanFolder = e.target.value; renderActivitiesView(root, ctx); });
  root.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => {
    ctx.prefs.bilanView = btn.dataset.view;
    renderActivitiesView(root, ctx);
  }));
}

const HELP = {
  exercises: 'Exercices du plus souvent en rouge au plus réussi. Le feu est celui que l’élève s’est donné.',
  games: 'Par type de jeu, du moins réussi au mieux réussi (meilleur résultat de chaque élève).',
  autoeval: 'Attendus de la moyenne d’ampoules la plus basse à la plus haute.',
  labs: 'Pour chaque labo, les critères du Check du moins au mieux réussi (dernier Check de chaque élève).'
};

/* ===== Agrégation =====
   Clés : exercice « dossier|niveau|id », jeu « dossier|id », attendu
   « dossier|id », labo « id ». */
function aggregate(emails, ctx, byTrack, folder) {
  const ex = {};
  const games = {};
  const items = {};
  const labs = {};
  emails.forEach(email => {
    const work = ctx.work[email];
    if (!work) return;
    const track = ctx.trackOf(email);
    (byTrack[track] || []).filter(c => !folder || c.folder === folder).forEach(ch => {
      const s = summarizeChapter(ch, work.chapters[ch.id], (work.history || {})[ch.id]);
      LEVELS.forEach(level => s.levels[level].forEach(e => {
        if (!e.state) return;
        const a = ex[`${ch.folder}|${level}|${e.id}`] = ex[`${ch.folder}|${level}|${e.id}`] || { answered: 0, 3: 0, 2: 0, 1: 0, answeredOnly: 0 };
        a.answered++;
        if (e.state === 'answered') a.answeredOnly++; else a[e.state]++;
      }));
      s.games.forEach(g => {
        if (!g.done) return;
        const a = games[`${ch.folder}|${g.id}`] = games[`${ch.folder}|${g.id}`] || { done: 0, ratios: [], mistakes: [], moves: [], time: [] };
        a.done++;
        const r = g.records || {};
        if (r.total) a.ratios.push(r.score / r.total);
        ['mistakes', 'moves', 'time'].forEach(k => { if (Number.isFinite(Number(r[k])) && r[k] !== undefined) a[k].push(Number(r[k])); });
      });
      Object.keys(s.itemRatings).forEach(id => {
        const a = items[`${ch.folder}|${id}`] = items[`${ch.folder}|${id}`] || { rated: 0, 1: 0, 2: 0, 3: 0, sum: 0 };
        const v = s.itemRatings[id];
        a.rated++; a[v]++; a.sum += v;
      });
      s.labs.forEach(l => {
        const r = l.result;
        if (!r) return;
        const a = labs[l.id] = labs[l.id] || { started: 0, checked: 0, ratios: [], criteria: {}, labels: {} };
        a.started++;
        if (r.last && r.last.total) {
          a.checked++;
          a.ratios.push(r.last.score / r.last.total);
          Object.keys(r.last.criteria || {}).forEach(k => {
            const c = a.criteria[k] = a.criteria[k] || { n: 0, ok: 0 };
            c.n++;
            if (r.last.criteria[k]) c.ok++;
          });
          Object.assign(a.labels, r.labels || {});
        }
      });
    });
  });
  return { ex, games, items, labs };
}

const avg = list => list.length ? list.reduce((n, v) => n + v, 0) / list.length : null;

// Tri : lignes « classées » (assez d'élèves) d'abord, par difficulté
// décroissante ; puis les autres.
function rank(rows, difficulty, enough) {
  return rows.sort((a, b) => (enough(b) - enough(a)) || (difficulty(b) - difficulty(a)));
}

function countCell(n, total, label) {
  return `<td class="d-num" data-tip="${esc(`${n} élève${n > 1 ? 's' : ''} sur ${total} ${label}`)}">${n}<span class="b-of"> / ${total}</span></td>`;
}

/* ===== Exercices ===== */

function exercisesTable(chapters, agg, total) {
  const rows = [];
  chapters.forEach(ch => LEVELS.forEach(level => ch.levels[level].forEach(e => {
    const a = agg.ex[`${ch.folder}|${level}|${e.id}`] || { answered: 0, 3: 0, 2: 0, 1: 0, answeredOnly: 0 };
    const lit = a[1] + a[2] + a[3];
    rows.push({ ch, level, e, a, lit, red: lit ? a[1] / lit : 0, orange: lit ? a[2] / lit : 0 });
  })));
  if (!rows.length) return '<p class="d-empty">Pas d’exercices dans ce chapitre.</p>';
  rank(rows, r => r.red * 1000 + r.orange, r => r.lit >= MIN_STUDENTS);
  const showChapter = chapters.length > 1;
  return `${legend([3, 2, 1, 'answered'].map(k => LIGHT[k]))}
    <div class="t-scroll d-table-wrap b-table-wrap"><table class="t-table d-table b-table">
    <thead><tr><th class="b-col-what">Exercice</th><th class="d-num">Répondu par</th><th class="b-col-bar">Feux des élèves</th>
      <th class="d-num">Rouge</th><th class="d-num">Orange</th></tr></thead>
    <tbody>${rows.map(r => {
      const a = r.a;
      const parts = [3, 2, 1, 'answered'].map(k => ({ value: k === 'answered' ? a.answeredOnly : a[k], color: LIGHT[k].color }));
      const tip = `<strong>${esc(r.ch.short)} · ${LEVEL_LABEL[r.level]} · Ex. ${esc(r.e.id)}</strong><br>${a.answered} réponse(s)` +
        [3, 2, 1].filter(k => a[k]).map(k => `<br><span class="d-swatch" style="background:${LIGHT[k].color}"></span>${a[k]} ${esc(LIGHT[k].label.toLowerCase())}`).join('') +
        (a.answeredOnly ? `<br><span class="d-swatch" style="background:${LIGHT.answered.color}"></span>${a.answeredOnly} sans feu` : '');
      return `<tr class="${r.lit >= MIN_STUDENTS ? '' : 'b-minor'}">
        <td class="b-col-what"><span class="b-ref">${showChapter ? esc(r.ch.short) + ' · ' : ''}${LEVEL_LABEL[r.level]} · Ex. ${esc(r.e.id)}</span>
          <span class="b-name">${esc(r.e.title)}</span></td>
        ${countCell(a.answered, total, 'ont répondu')}
        <td class="b-col-bar">${a.answered ? stackBar(parts, a.answered, tip, `${a.answered} réponses`) : '<span class="d-zero">—</span>'}</td>
        <td class="d-num">${r.lit ? percent(a[1], r.lit) + ' %' : '<span class="d-zero">—</span>'}</td>
        <td class="d-num">${r.lit ? percent(a[2], r.lit) + ' %' : '<span class="d-zero">—</span>'}</td></tr>`;
    }).join('')}</tbody></table></div>`;
}

/* ===== Jeux : un tableau par type ===== */

function gamesTables(chapters, agg, total) {
  const all = [];
  chapters.forEach(ch => ch.games.forEach(g => all.push({ ch, g, a: agg.games[`${ch.folder}|${g.id}`] || { done: 0, ratios: [], mistakes: [], moves: [], time: [] } })));
  if (!all.length) return '<p class="d-empty">Pas de jeux dans ce chapitre.</p>';
  const types = [];
  all.forEach(r => { if (!types.includes(r.g.type)) types.push(r.g.type); });
  const showChapter = chapters.length > 1;
  return types.map(type => {
    const rows = all.filter(r => r.g.type === type);
    const isQcm = type === 'multipleChoice';
    const hasMoves = rows.some(r => r.a.moves.length);
    const hasTime = rows.some(r => r.a.time.length);
    rank(rows, r => isQcm ? 1 - (avg(r.a.ratios) ?? 1) : (avg(r.a.mistakes) ?? avg(r.a.moves) ?? 0), r => r.a.done >= MIN_STUDENTS);
    const fmt = (v, unit) => v === null ? '<span class="d-zero">—</span>' : `${Math.round(v * 10) / 10}${unit}`;
    return `<h3 class="b-h3">${esc(rows[0].g.typeLabel)}</h3>
      <div class="t-scroll d-table-wrap b-table-wrap"><table class="t-table d-table b-table"><thead><tr>
        <th class="b-col-what">Jeu</th><th class="d-num">Terminé par</th>
        ${isQcm ? '<th class="d-num">Score moyen</th>' : '<th class="d-num">Erreurs moyennes</th>'}
        ${hasMoves ? '<th class="d-num">Coups moyens</th>' : ''}${hasTime ? '<th class="d-num">Temps moyen</th>' : ''}</tr></thead>
      <tbody>${rows.map(r => `<tr class="${r.a.done >= MIN_STUDENTS ? '' : 'b-minor'}">
        <td class="b-col-what">${showChapter ? `<span class="b-ref">${esc(r.ch.short)}</span>` : ''}<span class="b-name">${esc(r.g.title)}</span></td>
        ${countCell(r.a.done, total, 'l’ont terminé')}
        ${isQcm ? `<td class="d-num">${r.a.ratios.length ? percent(avg(r.a.ratios), 1) + ' %' : '<span class="d-zero">—</span>'}</td>`
          : `<td class="d-num">${fmt(avg(r.a.mistakes), '')}</td>`}
        ${hasMoves ? `<td class="d-num">${fmt(avg(r.a.moves), '')}</td>` : ''}
        ${hasTime ? `<td class="d-num">${fmt(avg(r.a.time), ' s')}</td>` : ''}</tr>`).join('')}</tbody></table></div>`;
  }).join('');
}

/* ===== Autoévaluation ===== */

function autoevalTable(chapters, agg, total) {
  const rows = [];
  chapters.forEach(ch => ch.autoevalItems.forEach(item => {
    const a = agg.items[`${ch.folder}|${item.id}`] || { rated: 0, 1: 0, 2: 0, 3: 0, sum: 0 };
    rows.push({ ch, item, a, mean: a.rated ? a.sum / a.rated : null });
  }));
  if (!rows.length) return '<p class="d-empty">Pas d’autoévaluation dans ce chapitre.</p>';
  rank(rows, r => r.mean === null ? -1 : 4 - r.mean, r => r.a.rated >= MIN_STUDENTS);
  const showChapter = chapters.length > 1;
  const plain = t => String(t || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return `${legend([3, 2, 1].map(k => BULBS[k]))}
    <div class="t-scroll d-table-wrap b-table-wrap"><table class="t-table d-table b-table"><thead><tr>
      <th class="b-col-what">Attendu</th><th class="d-num">Évalué par</th><th class="b-col-bar">Ampoules</th><th class="d-num">Moyenne</th></tr></thead>
    <tbody>${rows.map(r => {
      const parts = [3, 2, 1].map(k => ({ value: r.a[k], color: BULBS[k].color }));
      const tip = `<strong>${r.a.rated} élève(s)</strong>` + [3, 2, 1].filter(k => r.a[k]).map(k =>
        `<br><span class="d-swatch" style="background:${BULBS[k].color}"></span>${r.a[k]} × ${esc(BULBS[k].label)}`).join('');
      return `<tr class="${r.a.rated >= MIN_STUDENTS ? '' : 'b-minor'}">
        <td class="b-col-what"><span class="b-ref">${showChapter ? esc(r.ch.short) + ' · ' : ''}${esc(r.item.categoryTitle)}</span>
          <span class="b-name b-wrap">${esc(plain(r.item.text))}</span></td>
        ${countCell(r.a.rated, total, 'l’ont évalué')}
        <td class="b-col-bar">${r.a.rated ? stackBar(parts, r.a.rated, tip, `${r.a.rated} évaluations`) : '<span class="d-zero">—</span>'}</td>
        <td class="d-num">${r.mean === null ? '<span class="d-zero">—</span>' : r.mean.toFixed(1).replace('.', ',') + '<span class="b-of"> / 3</span>'}</td></tr>`;
    }).join('')}</tbody></table></div>`;
}

/* ===== Labos : un bloc par labo, une ligne par critère ===== */

function labsTables(chapters, agg, total) {
  const labs = [];
  chapters.forEach(ch => ch.labs.forEach(l => labs.push({ ch, l, a: agg.labs[l.id] || { started: 0, checked: 0, ratios: [], criteria: {}, labels: {} } })));
  if (!labs.length) return '<p class="d-empty">Pas de labo dans ce chapitre.</p>';
  return labs.map(({ ch, l, a }) => {
    const crits = Object.keys(a.criteria).map(k => ({ k, c: a.criteria[k], rate: a.criteria[k].n ? a.criteria[k].ok / a.criteria[k].n : 0 }));
    rank(crits, r => 1 - r.rate, r => r.c.n >= MIN_STUDENTS);
    const label = k => a.labels[k] || k.replace(/([A-Z])/g, ' $1').replace(/^./, m => m.toUpperCase());
    return `<section class="t-section b-lab">
      <div class="s-card-head"><h3 class="s-h3">${esc(l.title)} <span class="d-subtitle">${esc(ch.short)}</span></h3></div>
      <div class="b-lab-kpis">
        <div><span class="d-kpi-value">${a.started}<span class="b-of"> / ${total}</span></span><span class="d-kpi-label">l’ont commencé</span></div>
        <div><span class="d-kpi-value">${a.checked}<span class="b-of"> / ${total}</span></span><span class="d-kpi-label">l’ont mené au Check</span></div>
        <div><span class="d-kpi-value">${a.ratios.length ? percent(avg(a.ratios), 1) + ' %' : '—'}</span><span class="d-kpi-label">score moyen au Check</span></div>
      </div>
      ${crits.length ? `<table class="t-table b-table b-crit"><thead><tr><th class="b-col-what">Critère du Check</th><th class="d-num">Élèves</th>
        <th class="b-col-bar">Réussi</th><th class="d-num">Réussite</th></tr></thead><tbody>${crits.map(r => `
        <tr class="${r.c.n >= MIN_STUDENTS ? '' : 'b-minor'}"><td class="b-col-what"><span class="b-name">${esc(label(r.k))}</span></td>
          <td class="d-num">${r.c.n}</td>
          <td class="b-col-bar">${stackBar([{ value: r.c.ok, color: '#4a6483' }], r.c.n,
            `<strong>${esc(label(r.k))}</strong><br>${r.c.ok} réussi(s) sur ${r.c.n}`, `${r.c.ok} sur ${r.c.n}`)}</td>
          <td class="d-num">${percent(r.c.ok, r.c.n)} %</td></tr>`).join('')}</tbody></table>`
        : '<p class="t-muted">Aucun Check enregistré pour l’instant.</p>'}
    </section>`;
  }).join('');
}
