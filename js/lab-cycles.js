/* ===== Labo virtuel « Cycle detectives » (bio2) : les cycles menstruels varient =====

   Simulation propre à ce labo, commune aux deux filières ; ses textes sont
   dans le dossier du chapitre, un fichier par langue (lab-cycles.en.js,
   lab-cycles.nl.js). Le cadre commun (modale, barre d'étapes, verrous,
   traduction, glisser-déposer, rapport imprimé) est dans lab-engine.js.
   Ordre de chargement : moteur, textes, ce fichier.

   Pas de labo réel dans le chapitre : enquête sur des données (S-F 21,
   comparer des cycles pour montrer leur variabilité). Trois jeunes femmes
   ont noté leurs règles pendant quatre mois et pris leur température chaque
   matin. Quatre affirmations à tester, classées vraies ou fausses à Predict,
   reclassées avec une preuve à Conclude :
     every28    : « Every menstrual cycle lasts 28 days. »          (fausse)
     sameLength : « The cycles of one woman always have the same length. » (fausse)
     day14      : « Ovulation is always on day 14 of the cycle. »   (fausse)
     before14   : « Ovulation comes about 14 days before the end of the cycle. » (vraie)
   La réponse attendue se calcule sur les nombres notés par l'élève (à
   défaut, ceux du tirage).

   Tiré au sort à chaque nouveau labo : les quatre mois (de janvier-avril à
   septembre-décembre 2026, mêmes mois pour les trois) ; trois profils, un
   par famille : a (régulière vers 28 jours, ou légèrement variable 27-30),
   b (irrégulière 24-36, ou première année après les premières règles,
   30-45), c (régulière vers 26, vers 31, ou longue 34-37) ; pour chacune un
   prénom, un âge, la durée de chaque règle (4 à 6 jours), la place des
   quatre premiers jours (le premier dans le mois 1, aucun 5e dans les
   quatre mois, rien d'une règle d'avant), la phase après l'ovulation du 3e
   cycle (13 à 15 jours) et les températures du matin de ce cycle (basses,
   puis environ 0,5 °C de plus dès le lendemain de l'ovulation).

   Déroulé :
     1. Predict    — les quatre cartes d'affirmations, à poser dans deux
                     colonnes (vrai / faux), prises en main ou glissées ;
                     « Why do you think so? » facultatif ; figé dès le
                     premier jour marqué
     2. Experiment — partie 1 : pour chaque femme (onglets), le calendrier
                     de quatre mois (jours de règles marqués), toucher le
                     premier jour de chaque règle (il s'inscrit dans le
                     carnet), puis calculer les trois longueurs de cycle
                     (rappel du nombre de jours sous chaque mois) ;
                     partie 2 : barres groupées par femme (FO5b), avec un
                     repère « 28 days » ; partie 3 : la courbe de
                     température du 3e cycle de chaque femme, toucher le
                     jour de l'ovulation (le dernier jour bas avant la
                     montée), écrire le nombre de jours jusqu'à la fin du
                     cycle
     3. Conclude   — chaque affirmation : vraie ou fausse, et une preuve
                     choisie dans ses résultats ; jugement de l'hypothèse
     4. Check      — 5 vérifications : premiers jours, longueurs,
                     graphique, ovulation, affirmations ; rapport (FO3) */

(function () {
  'use strict';

  const { escapeHtml, shuffle, pick } = LabEngine.util;

  // Cadre commun, créé en fin de fichier (LabEngine.create).
  let lab;
  const $ = sel => lab.$(sel);
  const $$ = sel => lab.$$(sel);
  const gloss = text => lab.gloss(text);
  const plain = text => String(text).replace(/\[([^\]|]+)(?:\|[^\]]+)?\]/g, '$1');

  /* ===== Textes =====
     Dans le dossier du chapitre, un fichier par langue, chargé avant
     celui-ci. */
  const {
    labels: LABELS, glossary: GLOSSARY, explanations: EXPLAIN, check: CHECK
  } = LabEngine.textFor('cycles');

  /* ===== Modèle ===== */
  const YEAR = 2026;
  const WOMEN = 3;
  const STARTS = 4;                 // premiers jours de règles par femme
  const CYCLES = 3;                 // cycles complets par femme
  const CLAIMS = ['every28', 'sameLength', 'day14', 'before14'];
  const ANSWERS = ['true', 'false'];
  const CRITERIA = ['days', 'lengths', 'graph', 'ovulation', 'claims'];
  const VERDICTS = ['confirmed', 'partly', 'rejected'];
  const DASH = '—';
  const T_MIN = 36.0, T_MAX = 37.2; // échelle de la courbe de température
  const C_TOP = 48;                 // échelle du graphique (jours)

  /* Profils : chaque femme vient d'une famille différente (a, b, c), pour
     que les données montrent toujours les deux variabilités (d'une femme à
     l'autre, chez une même femme). lens() rend les 5 longueurs : celle
     d'avant le premier jour noté (cachée), les 3 cycles notés, celle d'après
     (cachée). */
  const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const range = n => Array.from({ length: n }, (_, i) => i);
  const spread = list => Math.max(...list) - Math.min(...list);
  const around = (base, wobble) => range(5).map(() => base + (Math.random() < wobble ? pick([-1, 1]) : 0));
  const between = (a, b) => range(5).map(() => randInt(a, b));

  const PROFILES = {
    regular28: { family: 'a', lens: () => around(28, 0.15) },
    variable: { family: 'a', lens: () => between(27, 30), ok: l => spread(l.slice(1, 4)) >= 1 },
    irregular: { family: 'b', lens: () => between(24, 36), ok: l => spread(l.slice(1, 4)) >= 7 },
    firstYear: { family: 'b', lens: () => between(30, 45), ok: l => spread(l.slice(1, 4)) >= 8, young: true },
    regular26: { family: 'c', lens: () => around(26, 0.3) },
    regular31: { family: 'c', lens: () => around(31, 0.3) },
    long: { family: 'c', lens: () => between(34, 37) }
  };
  const FAMILIES = ['a', 'b', 'c'];

  let run;      // tirage
  let state;    // travail de l'élève

  /* ===== Calendrier =====
     Les jours des quatre mois sont numérotés de 0 (1er jour du premier mois)
     à W - 1 ; le calendrier, le carnet et la correction passent par là. */
  const daysIn = m => new Date(YEAR, m + 1, 0).getDate();
  const weekdayOf = (m, d) => (new Date(YEAR, m, d).getDay() + 6) % 7;   // lundi = 0
  const monthsOf = r => range(4).map(i => r.month + i);
  const windowDays = r => monthsOf(r).reduce((n, m) => n + daysIn(m), 0);

  function dateOf(idx) {
    let m = run.month, i = idx;
    while (i >= daysIn(m) && m < run.month + 3) { i -= daysIn(m); m++; }
    return { m, d: i + 1 };
  }
  const dateText = idx => {
    if (idx == null) return DASH;
    const { m, d } = dateOf(idx);
    return LABELS.date(d, LABELS.monthsShort[m]);
  };

  /* Une femme : ses longueurs, la place de ses règles, l'ovulation et les
     températures du 3e cycle. null si le tirage ne tient pas dans les
     quatre mois (recommencé). */
  function drawWoman(profileKey, W) {
    const P = PROFILES[profileKey];
    for (let tries = 0; tries < 400; tries++) {
      const l = P.lens();
      if (P.ok && !P.ok(l)) continue;
      const lens = l.slice(1, 4);
      const sum = lens.reduce((a, b) => a + b, 0);
      // Le premier jour noté : rien de la règle d'avant dans les quatre
      // mois, le 4e premier jour visible (et quelques jours de sa règle),
      // pas de 5e.
      const lo = Math.max(1, W - sum - l[4]);
      const hi = Math.min(l[0] - 7, W - 4 - sum);
      if (lo > hi) continue;
      const first = randInt(lo, hi);
      const starts = [first];
      lens.forEach(n => starts.push(starts[starts.length - 1] + n));
      const periods = range(STARTS).map(() => randInt(4, 6));
      const luteal = randInt(13, 15);
      const L3 = lens[2];
      const ov = L3 - luteal;
      const low = 36.32 + Math.random() * 0.12;
      const noise = () => (Math.random() - 0.5) * 0.12;
      const temps = range(L3).map(i => {
        const day = i + 1;
        let t;
        if (day < ov) t = low + noise();
        else if (day === ov) t = low - 0.04 + noise() / 2;
        else if (day === ov + 1) t = low + 0.36 + noise() / 2;
        else t = low + 0.5 + noise();
        return Math.round(t * 100) / 100;
      });
      return { profile: profileKey, lens, starts, periods, ov, temps };
    }
    return null;
  }

  /* Tirage complet : recommencé jusqu'à ce que les données montrent ce
     qu'elles doivent montrer (au moins une ovulation ailleurs qu'au jour
     14). */
  function drawRun() {
    for (let tries = 0; tries < 200; tries++) {
      const month = randInt(0, 8);
      const W = windowDays({ month });
      const keys = shuffle(FAMILIES.map(f => pick(Object.keys(PROFILES).filter(k => PROFILES[k].family === f))));
      const women = keys.map(k => drawWoman(k, W));
      if (women.some(w => !w)) continue;
      if (women.every(w => w.ov === 14)) continue;
      const names = shuffle(range(LABELS.names.length)).slice(0, WOMEN);
      women.forEach((w, i) => {
        w.name = names[i];
        w.age = PROFILES[w.profile].young ? 13 : randInt(15, 19);
      });
      return { month, women, seed: String(Math.random()) };
    }
    // Jamais atteint en pratique : un tirage connu.
    return {
      month: 8, seed: 'fixed',
      women: [
        { profile: 'regular28', lens: [28, 28, 29], starts: [9, 37, 65, 94], periods: [5, 5, 4, 5], ov: 15, name: 0, age: 16,
          temps: [36.4, 36.42, 36.38, 36.45, 36.41, 36.39, 36.44, 36.4, 36.37, 36.43, 36.41, 36.38, 36.42, 36.4, 36.35, 36.78, 36.9, 36.92, 36.88, 36.91, 36.93, 36.89, 36.9, 36.94, 36.87, 36.91, 36.9, 36.88, 36.92] },
        { profile: 'irregular', lens: [25, 34, 30], starts: [14, 39, 73, 103], periods: [6, 4, 5, 5], ov: 16, name: 1, age: 17,
          temps: [36.45, 36.4, 36.48, 36.43, 36.46, 36.41, 36.44, 36.47, 36.42, 36.45, 36.4, 36.46, 36.43, 36.44, 36.48, 36.4, 36.82, 36.95, 36.93, 36.97, 36.92, 36.96, 36.94, 36.98, 36.93, 36.95, 36.97, 36.92, 36.96, 36.94] },
        { profile: 'long', lens: [35, 36, 35], starts: [3, 38, 74, 109], periods: [5, 6, 5, 4], ov: 21, name: 2, age: 18,
          temps: [36.38, 36.35, 36.4, 36.37, 36.33, 36.39, 36.36, 36.4, 36.34, 36.38, 36.36, 36.39, 36.35, 36.37, 36.4, 36.36, 36.38, 36.34, 36.39, 36.37, 36.31, 36.72, 36.86, 36.88, 36.84, 36.9, 36.87, 36.85, 36.89, 36.86, 36.88, 36.84, 36.9, 36.87, 36.86] }
      ]
    };
  }

  const woman = w => run.women[w];
  const nameOf = w => LABELS.names[woman(w).name];
  const L3of = w => woman(w).lens[CYCLES - 1];
  const isPeriod = (w, idx) => woman(w).starts.some((s, k) => idx >= s && idx < s + woman(w).periods[k]);

  const freshConcl = () => ({
    answers: { every28: null, sameLength: null, day14: null, before14: null },
    proofs: { every28: null, sameLength: null, day14: null, before14: null },
    verdict: null
  });

  function reset() {
    run = drawRun();
    state = {
      hyp: { every28: null, sameLength: null, day14: null, before14: null },
      because: '',
      started: false,         // l'hypothèse se fige au premier jour marqué
      part: 1,                // la partie la plus loin atteinte : 1 calendrier, 2 graphique, 3 température
      view: 1,                // la partie affichée
      woman: 0,               // la femme affichée (calendrier, température)
      marks: range(WOMEN).map(() => []),          // premiers jours touchés (jours du calendrier, triés)
      lengths: range(WOMEN).map(() => range(CYCLES).map(() => null)),
      bars: range(WOMEN).map(() => range(CYCLES).map(() => 0)),
      bar: null,              // [femme, cycle] : la barre réglée en dernier
      ov: range(WOMEN).map(() => null),           // jour du cycle touché sur la courbe
      toEnd: range(WOMEN).map(() => null),
      concl: freshConcl(),
      selected: CRITERIA[0]
    };
    stepperDone = null;
    conclReady = null;
  }

  /* Les nombres de l'élève, à défaut ceux du tirage (labo ouvert par un
     enseignant, verrous levés). */
  const fromMarks = (w, k) => (state.marks[w].length === STARTS ? state.marks[w][k + 1] - state.marks[w][k] : woman(w).lens[k]);
  const notedLen = (w, k) => (state.lengths[w][k] != null ? state.lengths[w][k] : fromMarks(w, k));
  const notedOv = w => (state.ov[w] != null ? state.ov[w] : woman(w).ov);
  const notedEnd = w => (state.toEnd[w] != null ? state.toEnd[w] : L3of(w) - notedOv(w));
  const about14 = v => v >= 12 && v <= 16;

  // Ce qui est fait, dans l'ordre de la manipulation.
  const calDone = w => state.marks[w].length === STARTS && state.lengths[w].every(v => v != null);
  const part1Done = () => range(WOMEN).every(calDone);
  const graphDone = () => state.bars.every(b => b.every(v => v > 0));
  const tempDone = w => state.ov[w] != null && state.toEnd[w] != null;
  const part3Done = () => range(WOMEN).every(tempDone);
  const benchDone = () => part1Done() && graphDone() && part3Done();

  /* La prochaine chose à faire : la légende la dit, ce qu'il faut toucher
     ou remplir est en couleur, et le bouton du pied dit ce qui manque.
     view : la partie où elle se fait. */
  function nextTask() {
    if (!part1Done()) {
      const w = calDone(state.woman) ? range(WOMEN).find(x => !calDone(x)) : state.woman;
      if (w !== state.woman) return { kind: 'switch', w, view: 1 };
      if (state.marks[w].length < STARTS) return { kind: 'mark', w, view: 1 };
      return { kind: 'length', w, k: state.lengths[w].findIndex(v => v == null), view: 1 };
    }
    if (state.part < 2) return { kind: 'next', to: 'graph' };
    if (!graphDone()) return { kind: 'graph', view: 2 };
    if (state.part < 3) return { kind: 'next', to: 'temp' };
    if (!part3Done()) {
      const w = tempDone(state.woman) ? range(WOMEN).find(x => !tempDone(x)) : state.woman;
      if (w !== state.woman) return { kind: 'switch', w, view: 3 };
      if (state.ov[w] == null) return { kind: 'ov', w, view: 3 };
      return { kind: 'toEnd', w, view: 3 };
    }
    return { kind: 'next', to: 'conclude' };
  }

  function phase() {
    const t = nextTask();
    if (t.view && t.view !== state.view) return { kind: 'view', view: t.view };
    return t;
  }

  // Ce qui manque encore (bulle du bouton suivant, verrou de Conclude).
  function missingText() {
    const p = phase();
    const M = LABELS.missing;
    if (p.kind === 'view') return M.view(LABELS.views[p.view]);
    if (p.kind === 'switch') return M.switch(nameOf(p.w));
    if (p.kind === 'mark') return M.mark(nameOf(p.w));
    if (p.kind === 'length') return M.length(nameOf(p.w));
    if (p.kind === 'ov') return M.ov(nameOf(p.w));
    if (p.kind === 'toEnd') return M.toEnd(nameOf(p.w));
    if (p.kind === 'next') return M.next(LABELS.next[p.to]);
    return M.graph;
  }

  /* ===== Dessins =====
     Petits dessins (page Mission, contexte de Predict) en SVG ; le
     calendrier est en HTML (une grille de boutons) ; le graphique et la
     courbe de température en SVG. */
  const COLORS = { period: '#d4527a', periodSoft: '#fbe3ea', grid: '#e3e6e1', axis: '#4d5650', text: '#3e4a44', muted: '#6b7570' };
  const svg = (w, h, inner, cls) => `<svg class="${cls || ''}" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">${inner}</svg>`;

  const ICON = {
    calendar: svg(48, 48, `<rect x="5" y="9" width="38" height="34" rx="5" fill="#ffffff" stroke="#6b7570" stroke-width="2"/>` +
      `<path d="M5 18 H43" stroke="#6b7570" stroke-width="2"/><path d="M15 5 V12 M33 5 V12" stroke="#6b7570" stroke-width="2.4" stroke-linecap="round"/>` +
      [[13, 25], [21, 25], [29, 25], [37, 25], [13, 33], [21, 33], [29, 33], [37, 33]].map(([x, y], i) =>
        `<circle cx="${x}" cy="${y}" r="2.6" fill="${i >= 1 && i <= 3 ? COLORS.period : '#c7ccc8'}"/>`).join(''), 'cy-icon'),
    chart: svg(48, 48, `<path d="M8 6 V41 H44" fill="none" stroke="#6b7570" stroke-width="2"/>` +
      [[12, 22], [17, 19], [22, 24], [29, 14], [34, 17], [39, 11]].map(([x, y]) => `<rect x="${x}" y="${y}" width="4" height="${41 - y}" fill="var(--color-current)"/>`).join('') +
      `<path d="M8 17 H44" stroke="#6b7570" stroke-width="1.2" stroke-dasharray="3 2"/>`, 'cy-icon'),
    thermo: svg(48, 48, `<path d="M20 8 a4 4 0 0 1 8 0 V30 a8 8 0 1 1 -8 0 Z" fill="#ffffff" stroke="#6b7570" stroke-width="2"/>` +
      `<circle cx="24" cy="36" r="5" fill="${COLORS.period}"/><path d="M24 36 V18" stroke="${COLORS.period}" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M32 14 H36 M32 20 H36 M32 26 H36" stroke="#6b7570" stroke-width="1.6" stroke-linecap="round"/>`, 'cy-icon'),
    claim: svg(48, 48, `<rect x="6" y="8" width="36" height="14" rx="4" fill="#ffffff" stroke="#6b7570" stroke-width="2"/>` +
      `<rect x="6" y="26" width="36" height="14" rx="4" fill="#ffffff" stroke="#6b7570" stroke-width="2"/>` +
      `<path d="M11 15 H33 M11 33 H29" stroke="#c7ccc8" stroke-width="2.4" stroke-linecap="round"/>`, 'cy-icon')
  };

  /* Le graphique (fiche outil FO5b) : une barre par cycle, trois groupes
     (une femme chacun), un repère pointillé à 28 jours. Titre, noms des
     axes et échelle donnés : l'élève monte chaque barre (glisser, toucher à
     la bonne hauteur, flèches, ou les boutons −1 / +1 de la barre
     choisie). */
  const CH = { W: 880, H: 232, L: 60, R: 70, T: 16, B: 46 };

  function chartSVG(mode, bars, sel) {
    const C = CH;
    const ph = C.H - C.T - C.B, sq = ph / C_TOP, y0 = C.H - C.B;
    const gw = (C.W - C.L - C.R) / WOMEN, slotW = (gw - 24) / CYCLES, bw = Math.min(42, slotW * 0.62);
    const edit = mode === 'edit';
    let out = `<svg class="cy-chart is-${mode}" ${edit ? 'data-chart' : ''} viewBox="0 0 ${C.W} ${C.H}" role="${edit ? 'group' : 'img'}" aria-label="${escapeHtml(LABELS.chart.title)}">`;
    for (let k = 0; k <= C_TOP; k += 2) {
      const y = y0 - k * sq;
      out += `<line x1="${C.L}" x2="${C.W - C.R}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${k ? COLORS.grid : '#a9ada4'}" stroke-width="1"/>`;
      if (k % 4 === 0) out += `<text class="cy-tick" x="${C.L - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end">${k}</text>`;
    }
    out += `<path d="M${C.L} ${y0} V${C.T - 6}" stroke="${COLORS.axis}" stroke-width="1.4"/>` +
      `<text class="cy-axis-name" transform="translate(16 ${((C.T + y0) / 2).toFixed(1)}) rotate(-90)" text-anchor="middle">${escapeHtml(LABELS.chart.yName)}</text>`;
    range(WOMEN).forEach(w => {
      const gx = C.L + gw * w + 12;
      range(CYCLES).forEach(k => {
        const cx = gx + slotW * (k + 0.5), x = cx - bw / 2;
        const v = (bars[w] && bars[w][k]) || 0, h = Math.min(C_TOP, v) * sq;
        const on = sel && sel[0] === w && sel[1] === k;
        const bar = `<rect class="cy-bar ${on ? 'is-sel' : ''}" x="${x.toFixed(1)}" y="${(y0 - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}"/>` +
          `<text class="cy-bar-val" x="${cx.toFixed(1)}" y="${(y0 - h - 5).toFixed(1)}" text-anchor="middle">${v || ''}</text>`;
        out += `<text class="cy-cat" x="${cx.toFixed(1)}" y="${y0 + 14}" text-anchor="middle">${k + 1}</text>`;
        if (edit) {
          const aria = plain(LABELS.chart.barAria(nameOf(w), k + 1));
          out += `<g class="cy-slot" data-slot="${w}:${k}" tabindex="0" role="slider" aria-label="${escapeHtml(aria)}" aria-valuemin="0" aria-valuemax="${C_TOP}" aria-valuenow="${v}">` +
            `<rect class="cy-slot-hit" x="${(cx - slotW / 2).toFixed(1)}" y="${C.T}" width="${slotW.toFixed(1)}" height="${ph.toFixed(1)}" fill="transparent"/>` +
            `<rect class="cy-slot-guide" x="${x.toFixed(1)}" y="${C.T}" width="${bw.toFixed(1)}" height="${ph.toFixed(1)}" fill="none"/>${bar}</g>`;
        } else out += bar;
      });
      const x1 = gx + 4, x2 = gx + gw - 28, y = y0 + 24;
      out += `<path d="M${x1} ${y - 4} V${y} H${x2} V${y - 4}" fill="none" stroke="#9aa39d" stroke-width="1.2"/>` +
        `<text class="cy-group" x="${((x1 + x2) / 2).toFixed(1)}" y="${y + 15}" text-anchor="middle">${escapeHtml(nameOf(w))}</text>`;
    });
    // Le repère « 28 jours », au-dessus des barres.
    const y28 = y0 - 28 * sq;
    out += `<path d="M${C.L} ${y28.toFixed(1)} H${C.W - C.R + 4}" stroke="${COLORS.axis}" stroke-width="1.3" stroke-dasharray="6 4"/>` +
      `<text class="cy-ref" x="${C.W - C.R + 8}" y="${(y28 + 4).toFixed(1)}">${escapeHtml(LABELS.chart.ref)}</text>`;
    out += `<path d="M${C.L} ${y0} H${C.W - C.R + 4}" stroke="${COLORS.axis}" stroke-width="1.4"/>` +
      `<text class="cy-axis-name" x="${C.W - C.R + 8}" y="${y0 + 14}">${escapeHtml(LABELS.chart.xName)}</text>`;
    return out + `</svg>`;
  }

  /* La courbe de température du 3e cycle d'une femme (donnée : l'élève la
     lit). Un jour par colonne ; toucher une colonne y pose le jour de
     l'ovulation. Le dernier jour du cycle est écrit au bout de l'axe. */
  const CU = { W: 880, H: 232, L: 60, R: 20, T: 26, B: 44 };

  function curveSVG(w, mode, chosen) {
    const C = CU;
    const L = L3of(w), temps = woman(w).temps;
    const pw = C.W - C.L - C.R, ph = C.H - C.T - C.B, y0 = C.H - C.B;
    const dx = pw / L;
    const X = day => C.L + (day - 0.5) * dx;
    const Y = t => C.T + (T_MAX - t) / (T_MAX - T_MIN) * ph;
    const edit = mode === 'edit';
    let out = `<svg class="cy-curve is-${mode}" ${edit ? 'data-curve tabindex="0"' : ''} viewBox="0 0 ${C.W} ${C.H}" role="${edit ? 'group' : 'img'}" aria-label="${escapeHtml(plain(LABELS.curve.title(nameOf(w))))}">`;
    for (let k = 0; k <= 6; k++) {
      const t = T_MIN + k * 0.2, y = Y(t);
      out += `<line x1="${C.L}" x2="${C.W - C.R}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${k ? COLORS.grid : '#a9ada4'}" stroke-width="1"/>` +
        `<text class="cy-tick" x="${C.L - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end">${escapeHtml(LABELS.num(t))}</text>`;
    }
    for (let d = 1; d <= L; d++) {
      out += `<line x1="${(C.L + d * dx).toFixed(1)}" x2="${(C.L + d * dx).toFixed(1)}" y1="${C.T}" y2="${y0}" stroke="#f0f1ee" stroke-width="1"/>`;
      if (L <= 32 || d % 2 === 1 || d === L) {
        out += `<text class="cy-dnum ${d === L ? 'is-last' : ''}" x="${X(d).toFixed(1)}" y="${y0 + 14}" text-anchor="middle">${d}</text>`;
      }
    }
    out += `<path d="M${C.L} ${y0} V${C.T - 8}" stroke="${COLORS.axis}" stroke-width="1.4"/>` +
      `<path d="M${C.L} ${y0} H${C.W - C.R}" stroke="${COLORS.axis}" stroke-width="1.4"/>` +
      `<text class="cy-axis-name" transform="translate(16 ${((C.T + y0) / 2).toFixed(1)}) rotate(-90)" text-anchor="middle">${escapeHtml(LABELS.curve.yName)}</text>` +
      `<text class="cy-axis-name" x="${(C.L + pw / 2).toFixed(1)}" y="${C.H - 6}" text-anchor="middle">${escapeHtml(LABELS.curve.xName)}</text>` +
      `<text class="cy-end-note" x="${C.W - C.R}" y="${C.T - 12}" text-anchor="end">${escapeHtml(plain(LABELS.curve.end(L)))}</text>`;
    // Le jour choisi : une bande et une ligne pointillée.
    if (chosen != null) {
      const x = X(chosen);
      out += `<rect x="${(x - dx / 2).toFixed(1)}" y="${C.T}" width="${dx.toFixed(1)}" height="${ph.toFixed(1)}" fill="rgba(var(--color-current-rgb), 0.14)"/>` +
        `<path d="M${x.toFixed(1)} ${C.T} V${y0}" stroke="var(--color-current-dark)" stroke-width="2" stroke-dasharray="5 4"/>` +
        `<text class="cy-chosen" x="${x.toFixed(1)}" y="${C.T - 12}" text-anchor="middle">${escapeHtml(plain(LABELS.curve.chosen(chosen)))}</text>`;
    }
    out += `<polyline points="${temps.map((t, i) => `${X(i + 1).toFixed(1)},${Y(t).toFixed(1)}`).join(' ')}" fill="none" stroke="${COLORS.period}" stroke-width="2" stroke-linejoin="round"/>` +
      temps.map((t, i) => `<circle cx="${X(i + 1).toFixed(1)}" cy="${Y(t).toFixed(1)}" r="3.4" fill="#ffffff" stroke="${COLORS.period}" stroke-width="2"/>`).join('');
    if (edit) {
      out += range(L).map(i => `<rect class="cy-day-hit" data-day="${i + 1}" x="${(C.L + i * dx).toFixed(1)}" y="${C.T}" width="${dx.toFixed(1)}" height="${(ph + 20).toFixed(1)}" fill="transparent"/>`).join('');
    }
    return out + `</svg>`;
  }

  /* ===== Étapes complètes (progression stricte, voir lab-engine.js) =====
     1 : les quatre cartes classées ; 2 : les trois parties ; 3 : toutes les
     réponses de la conclusion. */
  const hypDone = () => CLAIMS.every(k => !!state.hyp[k]);

  function stepComplete(n) {
    if (n === 1) return hypDone();
    if (n === 2) return benchDone();
    return conclusionsComplete();
  }

  function lockReason(n) {
    if (n === 1) return LABELS.lockHypothesis;
    if (n === 2) return state.started ? `${LABELS.lockRun} ${missingText()}` : LABELS.lockNotStarted;
    return lab.L.missingConclusions;
  }

  const chipHTML = (attrs, label, on, cls) => `<button type="button" class="lab-choice cy-chip ${cls || ''} ${on ? 'is-selected' : ''}" ${attrs} aria-pressed="${on}">${label}</button>`;

  /* ===== Étape 1 : hypothèse =====
     À gauche, la question et ce que l'élève aura ; à droite, les quatre
     cartes : d'abord en pile, puis posées dans « vrai » ou « faux ». */
  function renderPredict() {
    lab.release();
    const show = lab.state.showMissing;
    const h = state.hyp;
    const card = k => `<button type="button" class="cy-claim ${h[k] ? 'is-placed' : ''}" data-claim="${k}">${gloss(LABELS.claims[k])}</button>`;
    const zone = (key, title) => {
      const cards = CLAIMS.filter(k => h[k] === key);
      return `<div class="cy-col cy-col-${key}" data-zone="${key}"><p class="cy-col-title">${title}</p>` +
        `<div class="cy-col-cards">${cards.map(card).join('') || `<p class="cy-col-empty">${LABELS.dropHere}</p>`}</div></div>`;
    };
    const pile = CLAIMS.filter(k => !h[k]);

    lab.body.innerHTML = `<div class="cy-predict">` +
      `<div class="cy-predict-left">` +
        `<div class="cy-question-card"><p class="cy-kicker">${LABELS.yourQuestion}</p><p class="cy-big-q">${gloss(LABELS.bigQuestion)}</p></div>` +
        `<div class="cy-context"><p class="cy-kicker">${LABELS.contextTitle}</p><p>${gloss(LABELS.context)}</p>` +
          `<div class="cy-context-pics">` +
            `<span>${ICON.calendar}<small>${LABELS.tools.calendar}</small></span>` +
            `<span>${ICON.thermo}<small>${LABELS.tools.thermometer}</small></span>` +
            `<span>${ICON.chart}<small>${LABELS.tools.graph}</small></span>` +
          `</div></div>` +
      `</div>` +
      `<div class="cy-hyp-card ${show && !hypDone() ? 'lab-is-missing' : ''}"><p class="cy-kicker">${LABELS.hypothesisTitle}</p>` +
        `<p class="cy-hyp-how">${gloss(LABELS.sortHow)}</p>` +
        `<div class="cy-pile" data-zone="pile">${pile.map(card).join('') || `<p class="cy-col-empty">${LABELS.pileEmpty}</p>`}</div>` +
        `<div class="cy-cols">${zone('true', LABELS.columns.true)}${zone('false', LABELS.columns.false)}</div>` +
        `<label class="cy-because"><span>${LABELS.because}</span>` +
        `<input type="text" class="lab-input cy-because-input" maxlength="160" placeholder="${escapeHtml(LABELS.becausePlaceholder)}" value="${escapeHtml(state.because)}" autocomplete="off"></label>` +
      `</div></div>`;

    $$('[data-claim]').forEach(el => {
      const k = el.dataset.claim;
      lab.makeDraggable(el, {
        hold: true,
        ghost: () => `<div class="cy-claim cy-ghost">${escapeHtml(plain(LABELS.claims[k]))}</div>`,
        targets: () => $$('[data-zone]'),
        onDrop: target => placeClaim(k, target.dataset.zone)
      });
    });
    const because = $('.cy-because-input');
    because.addEventListener('input', e => { state.because = e.target.value; });
    // Hypothèse figée dès le premier jour marqué.
    if (state.started) {
      $$('[data-claim]').forEach(el => lab.setLock(el, LABELS.lockHypothesisFixed, { icon: false }));
      because.readOnly = true;
      lab.setLock(because, LABELS.lockHypothesisFixed);
    }

    const ready = hypDone();
    const info = show && !ready ? lab.footerInfo(lab.L.missingHypothesis, true)
      : lab.footerInfo(ready ? LABELS.hypothesisReady : LABELS.hypothesisPending);
    lab.setFooter(info + `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-next>${LABELS.toBench} →</button></div>`);
    const next = $('[data-next]');
    next.addEventListener('click', () => lab.goToStep(2));
    lab.setLock(next, ready ? null : LABELS.lockHypothesis, { missing: true, key: 'next' });
  }

  function placeClaim(k, zone) {
    if (state.started) return;
    state.hyp[k] = ANSWERS.includes(zone) ? zone : null;
    if (lab.state.showMissing && hypDone()) lab.state.showMissing = false;
    renderPredict();
    lab.renderStepper();
    lab.save();
  }

  /* ===== Étape 2 : l'expérience =====
     En haut à gauche, la partie affichée (onglets : calendriers, graphique,
     température ; une femme à la fois pour le calendrier et la courbe) ; à
     droite, l'aide de la partie ; dessous, la légende (ce qu'il faut faire)
     et le carnet, toujours visible. Le bouton du pied mène à la partie
     suivante. */
  function stageHTML() {
    const parts = `<div class="cy-tabs" role="tablist">` + [1, 2, 3].map(v =>
      `<button type="button" role="tab" class="cy-tab ${state.view === v ? 'is-on' : ''}" data-view="${v}" data-lab-look aria-selected="${state.view === v}">${LABELS.views[v]}</button>`).join('') + `</div>`;
    const women = state.view === 2 ? '' : `<div class="cy-women" role="tablist">` + range(WOMEN).map(w =>
      `<button type="button" role="tab" class="cy-woman-tab ${state.woman === w ? 'is-on' : ''}" data-woman="${w}" data-lab-look aria-selected="${state.woman === w}">${escapeHtml(nameOf(w))}</button>`).join('') + `</div>`;
    let body;
    if (state.view === 1) body = calendarHTML(state.woman);
    else if (state.view === 2) {
      body = `<div class="cy-graph"><p class="cy-chart-title">${LABELS.chart.title}</p>` +
        `<div class="cy-chart-wrap ${lab.state.showMissing && !graphDone() ? 'lab-is-missing' : ''}" data-chart-wrap>${chartSVG('edit', state.bars, state.bar)}</div></div>`;
    } else {
      body = `<div class="cy-temp"><p class="cy-chart-title">${gloss(LABELS.curve.title(nameOf(state.woman)))}</p>` +
        `<div class="cy-curve-wrap ${lab.state.showMissing && state.ov[state.woman] == null ? 'lab-is-missing' : ''}" data-curve-wrap>${curveSVG(state.woman, 'edit', state.ov[state.woman])}</div></div>`;
    }
    return `<section class="cy-stage"><div class="cy-stage-head">${parts}${women}</div>${body}</section>`;
  }

  // Le calendrier de quatre mois d'une femme : les jours de règles marqués, les premiers jours touchés entourés.
  function calendarHTML(w) {
    const W = woman(w);
    let idx = 0;
    const months = monthsOf(run).map(m => {
      const n = daysIn(m);
      const lead = weekdayOf(m, 1);
      let cells = range(lead).map(() => `<span class="cy-blank"></span>`).join('');
      for (let d = 1; d <= n; d++, idx++) {
        const per = isPeriod(w, idx), on = state.marks[w].includes(idx);
        cells += `<button type="button" class="cy-day ${per ? 'is-period' : ''} ${on ? 'is-marked' : ''}" data-day="${idx}" aria-pressed="${on}" aria-label="${escapeHtml(plain(LABELS.dayAria(d, LABELS.months[m], per)))}">${d}</button>`;
      }
      return `<div class="cy-month"><p class="cy-month-name">${LABELS.months[m]}</p>` +
        `<div class="cy-grid">${LABELS.weekdays.map(x => `<span class="cy-wd">${x}</span>`).join('')}${cells}</div>` +
        `<p class="cy-month-days">${LABELS.monthDays(n)}</p></div>`;
    }).join('');
    const note = PROFILES[W.profile].young ? ` ${LABELS.firstYearNote}` : '';
    return `<div class="cy-cal"><p class="cy-who">${gloss(LABELS.womanLine(nameOf(w), W.age) + note)}` +
      `<span class="cy-key"><i class="cy-key-period"></i>${gloss(LABELS.keyPeriod)}<i class="cy-key-mark"></i>${gloss(LABELS.keyMark)}</span></p>` +
      `<div class="cy-months">${months}</div></div>`;
  }

  // À droite : l'aide de la partie affichée.
  function helpHTML() {
    const H = LABELS.help[state.view];
    let extra = '';
    if (state.view === 2) {
      const sel = state.bar;
      const what = sel ? gloss(LABELS.chart.selected(nameOf(sel[0]), sel[1] + 1)) : gloss(LABELS.chart.noneSelected);
      extra = `<div class="cy-adjust"><p>${what}</p><div class="cy-adjust-btns">` +
        `<button type="button" class="lab-btn cy-adjust-btn" data-adjust="-1" aria-label="${escapeHtml(LABELS.chart.minus)}">−1</button>` +
        `<button type="button" class="lab-btn cy-adjust-btn" data-adjust="1" aria-label="${escapeHtml(LABELS.chart.plus)}">+1</button></div></div>`;
    }
    return `<aside class="cy-help"><p class="cy-kicker">${H.title}</p>${H.lines.map(t => `<p>${gloss(t)}</p>`).join('')}` +
      (H.example ? `<p class="cy-example">${gloss(H.example)}</p>` : '') + extra + `</aside>`;
  }

  const numInput = (attrs, v, aria) => `<input type="text" inputmode="numeric" class="cy-num-in" ${attrs} value="${v == null ? '' : v}" maxlength="2" autocomplete="off" spellcheck="false" aria-label="${escapeHtml(plain(aria))}">`;

  // Le carnet : une ligne par femme.
  function notesHTML() {
    const N = LABELS.notes;
    const rows = range(WOMEN).map(w => {
      const days = range(STARTS).map(k => {
        const idx = state.marks[w][k];
        return `<td><span class="cy-date lab-todo-field ${idx == null ? 'is-empty' : ''}" data-date="${w}:${k}">${idx == null ? '' : escapeHtml(dateText(idx))}</span></td>`;
      }).join('');
      const lens = range(CYCLES).map(k => `<td>${numInput(`data-len="${w}:${k}"`, state.lengths[w][k], N.lenAria(nameOf(w), k + 1))}</td>`).join('');
      const ov = state.ov[w];
      return `<tr class="${state.woman === w && state.view !== 2 ? 'is-current' : ''}"><th scope="row">${escapeHtml(nameOf(w))}</th>${days}${lens}` +
        `<td><span class="cy-date cy-ov lab-todo-field ${ov == null ? 'is-empty' : ''}" data-ov-cell="${w}">${ov == null ? '' : escapeHtml(plain(LABELS.curve.chosen(ov)))}</span></td>` +
        `<td>${numInput(`data-toend="${w}"`, state.toEnd[w], N.toEndAria(nameOf(w)))}</td></tr>`;
    }).join('');
    return `<section class="cy-notes"><h3 class="lab-panel-title">${LABELS.notesTitle}</h3>` +
      `<table class="cy-table"><thead>` +
        `<tr><th scope="col" rowspan="2" class="cy-name-head">${N.woman}</th><th scope="colgroup" colspan="${STARTS}">${gloss(N.firstDays)}</th>` +
        `<th scope="colgroup" colspan="${CYCLES}" class="cy-sep">${gloss(N.lengths)}</th><th scope="colgroup" colspan="2" class="cy-sep">${gloss(N.temp)}</th></tr>` +
        `<tr>${range(STARTS).map(k => `<th scope="col">${N.period(k + 1)}</th>`).join('')}` +
        `${range(CYCLES).map(k => `<th scope="col" class="${k ? '' : 'cy-sep'}">${N.cycle(k + 1)}</th>`).join('')}` +
        `<th scope="col" class="cy-sep">${gloss(N.ov)}</th><th scope="col">${gloss(N.toEnd)}</th></tr>` +
      `</thead><tbody>${rows}</tbody></table></section>`;
  }

  function renderExperiment(caption, warn) {
    lab.release();
    lab.body.innerHTML = `<div class="cy-run">${stageHTML()}${helpHTML()}` +
      `<p class="lab-caption" data-caption aria-live="polite"></p>${notesHTML()}</div>`;
    bindRun();
    renderRunFooter();
    updateLocks();
    updateMarks();
    setCaption(caption || defaultCaption(), warn);
  }

  function bindRun() {
    $$('[data-view]').forEach(btn => btn.addEventListener('click', () => {
      const v = Number(btn.dataset.view);
      if (state.view === v) return;
      state.view = v;
      renderExperiment();
    }));
    $$('[data-woman]').forEach(btn => btn.addEventListener('click', () => {
      const w = Number(btn.dataset.woman);
      if (state.woman === w) return;
      state.woman = w;
      renderExperiment();
    }));
    $$('.cy-day[data-day]').forEach(btn => btn.addEventListener('click', () => markDay(Number(btn.dataset.day))));
    bindChart();
    bindCurve();
    $$('[data-adjust]').forEach(btn => btn.addEventListener('click', () => {
      if (!state.bar) { setCaption(LABELS.captionPickBar, true); return; }
      const [w, k] = state.bar;
      state.bars[w][k] = Math.max(0, Math.min(C_TOP, state.bars[w][k] + Number(btn.dataset.adjust)));
      redrawChart();
      afterGraph();
      lab.save();
    }));
    $$('.cy-num-in').forEach(input => {
      const isLen = input.dataset.len != null;
      const [w, k] = (isLen ? input.dataset.len : input.dataset.toend).split(':').map(Number);
      const [min, max] = isLen ? [10, 60] : [1, 40];
      const parse = () => {
        const s = input.value.trim();
        if (s === '') return null;
        if (!/^\d{1,2}$/.test(s)) return NaN;
        const v = Number(s);
        return v >= min && v <= max ? v : NaN;
      };
      const put = v => { if (isLen) state.lengths[w][k] = v; else state.toEnd[w] = v; };
      input.addEventListener('input', () => {
        input.classList.remove('is-invalid');
        const v = parse();
        put(Number.isNaN(v) ? null : v);
        refreshRecords();
      });
      input.addEventListener('change', () => {
        const v = parse();
        if (Number.isNaN(v)) {
          input.classList.add('is-invalid');
          setCaption(LABELS.captionBadNumber(min, max), true);
          return;
        }
        lab.save();
      });
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
    });
  }

  /* Partie 1 : toucher un jour le marque comme premier jour d'une règle
     (ou retire la marque). Quatre au plus par femme : le cinquième est
     refusé, la légende dit pourquoi. */
  function markDay(idx) {
    const w = state.woman;
    const list = state.marks[w];
    const k = list.indexOf(idx);
    if (k >= 0) list.splice(k, 1);
    else {
      if (list.length >= STARTS) { setCaption(LABELS.captionFourMarks, true); return; }
      list.push(idx);
      list.sort((a, b) => a - b);
    }
    state.started = true;
    lab.save();
    renderExperiment();
    lab.renderStepper();
  }

  // Partie 3 : le jour de l'ovulation, touché sur la courbe.
  function setOv(day) {
    const w = state.woman;
    state.ov[w] = day;
    lab.save();
    renderExperiment();
    lab.renderStepper();
  }

  function bindCurve() {
    const curve = $('[data-curve]');
    if (!curve) return;
    $$('.cy-day-hit').forEach(r => r.addEventListener('click', () => setOv(Number(r.dataset.day))));
    curve.addEventListener('keydown', e => {
      const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      const cur = state.ov[state.woman] || Math.round(L3of(state.woman) / 2);
      setOv(Math.max(1, Math.min(L3of(state.woman), cur + (state.ov[state.woman] ? d : 0))));
      const again = $('[data-curve]');
      if (again) again.focus();
    });
  }

  function refreshRecords() {
    if (lab.state.showMissing && benchDone()) lab.state.showMissing = false;
    updateLocks();
    updateMarks();
    setCaption(defaultCaption());
    updateRunFooter();
  }

  /* Tous les verrous de l'expérience, selon l'état (à rappeler après chaque
     changement) : chaque case attend ce qui la précède, et dit quoi. */
  function updateLocks() {
    range(WOMEN).forEach(w => {
      const whyLen = state.marks[w].length < STARTS ? LABELS.lockLengths(nameOf(w)) : null;
      range(CYCLES).forEach(k => {
        const el = $(`[data-len="${w}:${k}"]`);
        if (el) { el.readOnly = !!whyLen; lab.setLock(el, whyLen); }
      });
      const whyEnd = state.part < 3 ? LABELS.lockTempLater : state.ov[w] == null ? LABELS.lockToEnd(nameOf(w)) : null;
      const end = $(`[data-toend="${w}"]`);
      if (end) { end.readOnly = !!whyEnd; lab.setLock(end, whyEnd); }
    });
    [2, 3].forEach(v => {
      const tab = $(`[data-view="${v}"]`);
      if (tab) lab.setLock(tab, state.part >= v ? null : LABELS.lockView[v], { icon: false });
    });
  }

  // Cases encore vides (et ouvertes) à signaler : bouton suivant touché trop tôt.
  function updateMarks() {
    const show = lab.state.showMissing;
    $$('.cy-num-in').forEach(input => {
      const v = input.dataset.len != null
        ? state.lengths[Number(input.dataset.len.split(':')[0])][Number(input.dataset.len.split(':')[1])]
        : state.toEnd[Number(input.dataset.toend)];
      input.classList.toggle('lab-is-missing', !!(show && v == null && !input.readOnly));
    });
    $$('.cy-date[data-date]').forEach(el => {
      const [w] = el.dataset.date.split(':').map(Number);
      el.classList.toggle('lab-is-missing', !!(show && el.classList.contains('is-empty') && w === state.woman && state.view === 1));
    });
  }

  function todoEls() {
    const p = phase();
    switch (p.kind) {
      case 'view': return [$(`[data-view="${p.view}"]`)];
      case 'switch': return [$(`[data-woman="${p.w}"]`)];
      case 'mark': return [$(`[data-date="${p.w}:${state.marks[p.w].length}"]`)];
      case 'length': return [$(`[data-len="${p.w}:${p.k}"]`)];
      case 'graph': return [$('[data-chart-wrap]')];
      case 'ov': return [$('[data-curve-wrap]'), $(`[data-ov-cell="${p.w}"]`)];
      case 'toEnd': return [$(`[data-toend="${p.w}"]`)];
      case 'next': return [$('[data-next-part]')];
      default: return [];
    }
  }

  function defaultCaption() {
    const p = phase();
    const C = LABELS.captions;
    if (p.kind === 'view') return C.view(LABELS.views[p.view]);
    if (p.kind === 'switch') return C.switch(nameOf(p.w));
    if (p.kind === 'mark') return C.mark(nameOf(p.w), state.marks[p.w].length);
    if (p.kind === 'length') return C.length(nameOf(p.w), p.k + 1);
    if (p.kind === 'ov') return C.ov(nameOf(p.w));
    if (p.kind === 'toEnd') return C.toEnd(nameOf(p.w), L3of(p.w));
    if (p.kind === 'graph') return C.graph;
    return C.next[p.to];
  }

  function setCaption(text, warn) {
    const c = $('[data-caption]');
    if (!c) return;
    c.innerHTML = `<span>${gloss(text)}</span>`;
    c.classList.toggle('is-warning', !!warn);
  }

  /* Pied de page : le gros bouton mène à la partie suivante pas encore
     ouverte ; il s'allume quand ce qui la précède est fini, et touché trop
     tôt, il dit ce qui manque. */
  let stepperDone = null;

  function nextTarget() {
    if (state.part === 1) return 'graph';
    if (state.part === 2) return 'temp';
    return 'conclude';
  }

  function targetReady(t) {
    return { graph: part1Done, temp: () => part1Done() && graphDone(), conclude: benchDone }[t]();
  }

  function renderRunFooter() {
    lab.setFooter(lab.footerInfo('') + `<div class="lab-footer-actions">` +
      `<button type="button" class="lab-btn lab-btn-ghost" data-next-part></button></div>`);
    $('[data-next-part]').addEventListener('click', () => {
      const t = nextTarget();
      if (t === 'conclude') { lab.goToStep(3); return; }
      state.part = t === 'graph' ? 2 : 3;
      state.view = state.part;
      lab.state.showMissing = false;
      renderExperiment();
      lab.renderStepper();
      lab.save();
    });
    updateRunFooter();
  }

  function updateRunFooter() {
    const t = nextTarget();
    const ready = targetReady(t);
    const missing = lab.state.showMissing && !ready;
    const info = $('.lab-footer .lab-footer-info');
    if (info && !info.hasAttribute('data-lab-frozen')) {
      info.textContent = missing ? missingText() : LABELS.partInfo[state.view];
      info.classList.toggle('is-warning', missing);
    }
    const btn = $('[data-next-part]');
    if (btn) {
      btn.textContent = `${LABELS.next[t]} →`;
      btn.classList.toggle('lab-btn-primary', ready);
      btn.classList.toggle('lab-btn-ghost', !ready);
      lab.setLock(btn, ready ? null : missingText(), { missing: true, key: 'next-part' });
    }
    const done = benchDone();
    if (done !== stepperDone) { stepperDone = done; lab.renderStepper(); }
  }

  /* Graphique : la barre suit le doigt ; la barre touchée devient la barre
     choisie (boutons −1 / +1 de l'aide). */
  function bindChart() {
    const chart = $('[data-chart-wrap] svg');
    if (!chart) return;
    chart.addEventListener('pointerdown', e => {
      const slot = e.target.closest('[data-slot]');
      if (!slot || e.button !== 0) return;
      e.preventDefault();
      const [w, k] = slot.dataset.slot.split(':').map(Number);
      const id = e.pointerId;
      state.bar = [w, k];
      setBar(w, k, valueAt(chart, e.clientY));
      const move = ev => { if (ev.pointerId === id) setBar(w, k, valueAt(chart, ev.clientY)); };
      const up = ev => {
        if (ev.pointerId !== id) return;
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        redrawChart();
        afterGraph();
        lab.save();
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    });
    chart.addEventListener('keydown', e => {
      const slot = e.target.closest('[data-slot]');
      if (!slot) return;
      const d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      const [w, k] = slot.dataset.slot.split(':').map(Number);
      state.bar = [w, k];
      setBar(w, k, Math.max(0, Math.min(C_TOP, state.bars[w][k] + d)));
      redrawChart();
      afterGraph();
      lab.save();
      const again = $(`[data-slot="${w}:${k}"]`);
      if (again) again.focus();
    });
  }

  function valueAt(chart, clientY) {
    const m = chart.getScreenCTM();
    if (!m) return 0;
    const pt = chart.createSVGPoint();
    pt.x = 0;
    pt.y = clientY;
    const p = pt.matrixTransform(m.inverse());
    const sq = (CH.H - CH.T - CH.B) / C_TOP, y0 = CH.H - CH.B;
    return Math.max(0, Math.min(C_TOP, Math.round((y0 - p.y) / sq)));
  }

  // Pendant le geste, seule la barre bouge.
  function setBar(w, k, v) {
    state.bars[w][k] = v;
    const slot = $(`[data-slot="${w}:${k}"]`);
    if (!slot) return;
    const sq = (CH.H - CH.T - CH.B) / C_TOP, y0 = CH.H - CH.B, h = v * sq;
    const rect = slot.querySelector('.cy-bar');
    const text = slot.querySelector('.cy-bar-val');
    rect.setAttribute('y', (y0 - h).toFixed(1));
    rect.setAttribute('height', h.toFixed(1));
    text.setAttribute('y', (y0 - h - 5).toFixed(1));
    text.textContent = v || '';
    slot.setAttribute('aria-valuenow', String(v));
  }

  // Le graphique et l'aide redessinés (barre choisie), sans toucher au reste.
  function redrawChart() {
    const wrap = $('[data-chart-wrap]');
    if (wrap) {
      wrap.innerHTML = chartSVG('edit', state.bars, state.bar);
      bindChart();
    }
    const help = $('.cy-help');
    if (help) {
      help.outerHTML = helpHTML();
      $$('[data-adjust]').forEach(btn => btn.addEventListener('click', () => {
        if (!state.bar) { setCaption(LABELS.captionPickBar, true); return; }
        const [w, k] = state.bar;
        state.bars[w][k] = Math.max(0, Math.min(C_TOP, state.bars[w][k] + Number(btn.dataset.adjust)));
        redrawChart();
        afterGraph();
        lab.save();
      }));
    }
  }

  function afterGraph() {
    const wrap = $('[data-chart-wrap]');
    if (wrap && graphDone()) wrap.classList.remove('lab-is-missing');
    refreshRecords();
  }

  /* ===== Étape 3 : conclusion =====
     À gauche, les résultats notés par l'élève, son graphique et son
     hypothèse ; à droite, chaque affirmation : vraie ou fausse, et une
     preuve choisie dans ses résultats ; puis le jugement. */
  const lensText = w => LABELS.list(range(CYCLES).map(k => String(notedLen(w, k))));
  const PROOFS = () => range(WOMEN).map(w => `len:${w}`).concat(range(WOMEN).map(w => `ov:${w}`));
  function proofText(key) {
    const [kind, w] = key.split(':');
    return kind === 'len' ? LABELS.proofLen(nameOf(+w), lensText(+w)) : LABELS.proofOv(nameOf(+w), notedOv(+w), notedEnd(+w));
  }

  const conclusionsComplete = () => CLAIMS.every(k => state.concl.answers[k] && state.concl.proofs[k]) && !!state.concl.verdict;

  function proofSelect(k, show) {
    const v = state.concl.proofs[k];
    return `<select class="lab-select cy-select ${v ? 'is-filled' : ''} ${show && !v ? 'lab-is-missing' : ''}" data-proof="${k}" aria-label="${escapeHtml(plain(LABELS.proofAria))}">` +
      `<option value="" disabled ${v ? '' : 'selected'}>${LABELS.choose}</option>` +
      PROOFS().map(x => `<option value="${x}" ${v === x ? 'selected' : ''}>${escapeHtml(plain(proofText(x)))}</option>`).join('') + `</select>`;
  }

  function resultsTable() {
    const N = LABELS.notes;
    return `<table class="cy-mini"><thead><tr><th></th><th scope="col">${gloss(N.lengths)}</th><th scope="col">${gloss(N.ov)}</th><th scope="col">${gloss(N.toEnd)}</th></tr></thead><tbody>` +
      range(WOMEN).map(w => `<tr><th scope="row">${escapeHtml(nameOf(w))}</th><td>${escapeHtml(range(CYCLES).map(k => numText(state.lengths[w][k])).join(' · '))}</td>` +
        `<td>${numText(state.ov[w])}</td><td>${numText(state.toEnd[w])}</td></tr>`).join('') +
      `</tbody></table>`;
  }

  const numText = v => (v == null ? DASH : String(v));
  const hypWord = k => (state.hyp[k] ? LABELS.trueFalse[state.hyp[k]] : DASH);

  function renderConclude() {
    const c = state.concl;
    const show = lab.state.showMissing;
    const claim = k => {
      const done = c.answers[k] && c.proofs[k];
      return `<li class="cy-cl ${show && !done ? 'lab-is-missing' : ''}"><p class="cy-cl-text">${gloss(LABELS.claims[k])}</p>` +
        `<div class="cy-cl-row">${ANSWERS.map(a => chipHTML(`data-answer="${k}" data-val="${a}"`, LABELS.trueFalse[a], c.answers[k] === a)).join('')}` +
        `<span class="cy-proof-label">${gloss(LABELS.proofLabel)}</span>${proofSelect(k, show)}</div></li>`;
    };

    lab.body.innerHTML = `<div class="cy-conclude">` +
      `<section class="cy-results"><h3 class="lab-panel-title">${LABELS.resultsTitle}</h3>` +
        resultsTable() +
        `<div class="cy-mini-chart">${chartSVG('read', state.bars)}</div>` +
        `<div class="cy-hyps"><p class="cy-kicker">${LABELS.hypothesisTitle}</p>` +
          CLAIMS.map(k => `<p>${gloss(LABELS.claimsShort[k])}: <strong>${hypWord(k)}</strong></p>`).join('') + `</div>` +
      `</section>` +
      `<section class="cy-form">` +
        `<p class="cy-big-q">${gloss(LABELS.bigQuestion)}</p>` +
        `<p class="cy-form-how">${gloss(LABELS.concludeHow)}</p>` +
        `<ol class="cy-cls">${CLAIMS.map(claim).join('')}</ol>` +
        `<div class="cy-verdict ${show && !c.verdict ? 'lab-is-missing' : ''}"><span class="cy-verdict-text">${LABELS.verdictText}</span>` +
          VERDICTS.map(x => chipHTML(`data-verdict="${x}"`, LABELS.verdicts[x], c.verdict === x)).join('') + `</div>` +
      `</section></div>`;

    const after = () => {
      if (lab.state.showMissing && conclusionsComplete()) lab.state.showMissing = false;
      renderConclude();
      lab.save();
    };
    $$('[data-answer]').forEach(btn => btn.addEventListener('click', () => { c.answers[btn.dataset.answer] = btn.dataset.val; after(); }));
    $$('select[data-proof]').forEach(sel => sel.addEventListener('change', () => { c.proofs[sel.dataset.proof] = sel.value || null; after(); }));
    $$('[data-verdict]').forEach(btn => btn.addEventListener('click', () => { c.verdict = btn.dataset.verdict; after(); }));

    lab.setFooter(`<button type="button" class="lab-btn lab-btn-ghost" data-back>← ${LABELS.backToLab}</button>` +
      lab.footerInfo('') +
      `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-check>${LABELS.checkConclusions}</button></div>`);
    $('[data-back]').addEventListener('click', () => lab.goToStep(2));
    $('[data-check]').addEventListener('click', () => lab.finish());
    updateConcludeFooter();
  }

  let conclReady = null;

  function updateConcludeFooter() {
    const ready = conclusionsComplete();
    const warn = lab.state.showMissing && !ready;
    const info = $('.lab-footer .lab-footer-info');
    if (info && !info.hasAttribute('data-lab-frozen')) {
      info.textContent = warn ? lab.L.missingConclusions : '';
      info.classList.toggle('is-warning', warn);
    }
    lab.setLock($('[data-check]'), ready ? null : lab.L.missingConclusions, { missing: true, key: 'check' });
    if (ready !== conclReady) { conclReady = ready; lab.renderStepper(); }
  }

  /* ===== Étape 4 : correction =====
     Premiers jours : comparés au calendrier. Longueurs : chaque calcul
     comparé aux premiers jours touchés par l'élève, ou au vrai calendrier
     (une erreur de jour n'est pas comptée deux fois). Graphique : chaque barre comparée à la longueur notée.
     Ovulation : le jour touché comparé au tirage ; les jours jusqu'à la fin
     comparés au jour touché. Affirmations : la réponse attendue se lit dans
     les nombres notés ; la preuve doit la montrer ; le jugement compare
     l'hypothèse à la conclusion de l'élève. */
  function expectedOf(k) {
    const lens = range(WOMEN).map(w => range(CYCLES).map(i => notedLen(w, i)));
    if (k === 'every28') return lens.every(l => l.every(v => v === 28)) ? 'true' : 'false';
    if (k === 'sameLength') return lens.every(l => spread(l) === 0) ? 'true' : 'false';
    if (k === 'day14') return range(WOMEN).every(w => notedOv(w) === 14) ? 'true' : 'false';
    return range(WOMEN).every(w => about14(notedEnd(w))) ? 'true' : 'false';
  }

  // Une preuve qui montre la réponse attendue.
  function proofOk(k, key) {
    if (!key) return false;
    const [kind, ws] = key.split(':');
    const w = Number(ws);
    const lens = range(CYCLES).map(i => notedLen(w, i));
    const want = expectedOf(k);
    if (k === 'every28') return kind === 'len' && (want === 'true' || lens.some(v => v !== 28));
    if (k === 'sameLength') return kind === 'len' && (want === 'true' || spread(lens) > 0);
    if (k === 'day14') return kind === 'ov' && (want === 'true' || notedOv(w) !== 14);
    return kind === 'ov' && (want === 'true' ? about14(notedEnd(w)) : !about14(notedEnd(w)));
  }

  // Une preuve qui convient, pour la correction.
  function goodProof(k) {
    return PROOFS().find(key => proofOk(k, key)) || null;
  }

  function evaluate() {
    const days = range(WOMEN).map(w => range(STARTS).map(k => state.marks[w][k] === woman(w).starts[k]));
    const daysGood = days.flat().filter(Boolean).length;
    // Un calcul juste d'après ses premiers jours, ou d'après le vrai calendrier.
    const lens = range(WOMEN).map(w => range(CYCLES).map(k => state.lengths[w][k] != null &&
      (state.lengths[w][k] === fromMarks(w, k) || state.lengths[w][k] === woman(w).lens[k])));
    const lensGood = lens.flat().filter(Boolean).length;
    const bars = range(WOMEN).map(w => range(CYCLES).map(k => state.bars[w][k] === notedLen(w, k)));
    const ovs = range(WOMEN).map(w => state.ov[w] === woman(w).ov);
    const ends = range(WOMEN).map(w => state.toEnd[w] != null && state.toEnd[w] === L3of(w) - notedOv(w));
    const c = state.concl;
    const expected = {}, answerOk = {}, proofGood = {};
    CLAIMS.forEach(k => {
      expected[k] = expectedOf(k);
      answerOk[k] = c.answers[k] === expected[k];
      proofGood[k] = proofOk(k, c.proofs[k]);
    });
    const hits = CLAIMS.filter(k => state.hyp[k] && state.hyp[k] === c.answers[k]).length;
    const shouldVerdict = hits === CLAIMS.length ? 'confirmed' : hits === 0 ? 'rejected' : 'partly';
    return {
      days, daysGood, lens, lensGood, bars, ovs, ends, expected, answerOk, proofGood, shouldVerdict,
      verdictOk: c.verdict === shouldVerdict,
      crit: {
        days: daysGood === WOMEN * STARTS,
        lengths: lensGood === WOMEN * CYCLES,
        graph: bars.flat().every(Boolean),
        ovulation: ovs.every(Boolean) && ends.every(Boolean),
        claims: CLAIMS.every(k => answerOk[k] && proofGood[k]) && c.verdict === shouldVerdict
      }
    };
  }

  const line = (good, html) => `<li class="${good ? 'is-ok' : 'is-ko'}"><span class="cy-mark">${good ? '✓' : '✗'}</span><span>${html}</span></li>`;
  const cell = (good, yours, right) => (good ? `<td class="is-ok">${yours}</td>` : `<td class="is-ko"><span>${yours}</span><small>${right}</small></td>`);

  function criterionDetail(key, ev) {
    if (key === 'days') {
      if (!state.started) return `<p>${CHECK.noExperiment}</p>`;
      const rows = range(WOMEN).map(w => `<tr><th scope="row">${escapeHtml(nameOf(w))}</th>` +
        range(STARTS).map(k => cell(ev.days[w][k], escapeHtml(dateText(state.marks[w][k])), escapeHtml(dateText(woman(w).starts[k])))).join('') + `</tr>`).join('');
      return `<p>${CHECK.daysScore(ev.daysGood, WOMEN * STARTS)}</p>` +
        `<table class="cy-check-table"><thead><tr><th></th>${range(STARTS).map(k => `<th>${LABELS.notes.period(k + 1)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>` +
        `<p class="cy-muted">${gloss(CHECK.tableKey)}</p>` +
        `<p>${gloss(ev.crit.days ? CHECK.daysAllGood : CHECK.daysHow)}</p>`;
    }
    if (key === 'lengths') {
      const rows = range(WOMEN).map(w => `<tr><th scope="row">${escapeHtml(nameOf(w))}</th>` +
        range(CYCLES).map(k => cell(ev.lens[w][k], numText(state.lengths[w][k]), fromMarks(w, k))).join('') + `</tr>`).join('');
      const wrong = [];
      range(WOMEN).forEach(w => range(CYCLES).forEach(k => {
        if (!ev.lens[w][k] && state.marks[w].length === STARTS) wrong.push(line(false, gloss(calcLine(w, k))));
      }));
      return `<p>${CHECK.lengthsScore(ev.lensGood, WOMEN * CYCLES)}</p>` +
        `<table class="cy-check-table"><thead><tr><th></th>${range(CYCLES).map(k => `<th>${LABELS.notes.cycle(k + 1)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>` +
        (wrong.length ? `<ul class="cy-checklist">${wrong.slice(0, 4).join('')}</ul>` : '') +
        `<p class="cy-muted">${gloss(ev.crit.lengths ? CHECK.lengthsAllGood : CHECK.lengthsHow)}</p>`;
    }
    if (key === 'graph') {
      const items = [];
      range(WOMEN).forEach(w => range(CYCLES).forEach(k => {
        if (!ev.bars[w][k]) items.push(line(false, CHECK.barLine(nameOf(w), k + 1, state.bars[w][k], notedLen(w, k))));
      }));
      return `<div class="cy-check-chart">${chartSVG('read', state.bars)}</div>` +
        (items.length ? `<ul class="cy-checklist">${items.slice(0, 4).join('')}</ul>` : `<p class="cy-ok">${CHECK.graphAllGood}</p>`) +
        `<p class="cy-muted">${gloss(CHECK.graphHow)}</p>`;
    }
    if (key === 'ovulation') {
      const items = range(WOMEN).map(w => {
        const W = woman(w);
        return line(ev.ovs[w], gloss(CHECK.ovLine(nameOf(w), state.ov[w], W.ov))) +
          line(ev.ends[w], gloss(CHECK.endLine(nameOf(w), numText(state.toEnd[w]), L3of(w), notedOv(w))));
      }).join('');
      return `<ul class="cy-checklist">${items}</ul><p>${gloss(EXPLAIN.ovulation)}</p>`;
    }
    const items = CLAIMS.map(k => {
      const c = state.concl;
      const right = ev.expected[k];
      const proof = c.proofs[k] ? plain(proofText(c.proofs[k])) : DASH;
      const good = goodProof(k);
      return line(ev.answerOk[k] && ev.proofGood[k],
        `${gloss(LABELS.claims[k])} <strong>${LABELS.trueFalse[right]}</strong>` +
        (ev.answerOk[k] ? '' : ` <span class="cy-ko">${CHECK.youSaid(c.answers[k] ? LABELS.trueFalse[c.answers[k]] : DASH)}</span>`) +
        `<br><span class="cy-proof-line ${ev.proofGood[k] ? '' : 'cy-ko'}">${CHECK.yourProof(escapeHtml(proof))}</span>` +
        (ev.proofGood[k] || !good ? '' : `<br><span class="cy-muted">${CHECK.goodProof(escapeHtml(plain(proofText(good))))}</span>`) +
        `<br><span class="cy-muted">${gloss(EXPLAIN.claims[k])}</span>`);
    }).join('');
    return `<ul class="cy-checklist cy-claims-check">${items}</ul>` +
      `<p class="${ev.verdictOk ? 'cy-ok' : 'cy-ko'}">${CHECK.verdict[ev.shouldVerdict]} ${ev.verdictOk ? CHECK.judgedOk : CHECK.judgedWrong}</p>` +
      `<p>${gloss(EXPLAIN.safeDays)}</p>`;
  }

  // Le calcul d'une longueur, à partir des premiers jours touchés : « 30 − 5 + 3 = 28 ».
  function calcLine(w, k) {
    const a = state.marks[w][k], b = state.marks[w][k + 1];
    const A = dateOf(a), B = dateOf(b);
    const mids = [];
    for (let m = A.m + 1; m < B.m; m++) mids.push(daysIn(m));
    return CHECK.calc(nameOf(w), k + 1, dateText(a), dateText(b), A.m === B.m ? null : daysIn(A.m), A.d, mids, B.d, b - a);
  }

  function renderCheck() {
    const ev = evaluate();
    const score = CRITERIA.filter(k => ev.crit[k]).length;
    const rows = CRITERIA.map(k => `<button type="button" class="cy-crit ${ev.crit[k] ? 'is-ok' : 'is-ko'} ${state.selected === k ? 'is-selected' : ''}" data-crit="${k}">` +
      `<span class="cy-crit-text"><strong>${LABELS.criteria[k]}</strong><small>${LABELS.criteriaSub[k]}</small></span>` +
      `<span class="cy-crit-mark" aria-label="${ev.crit[k] ? LABELS.markCorrect : LABELS.markIncorrect}">${ev.crit[k] ? '✓' : '✗'}</span></button>`).join('');

    lab.body.innerHTML = `<div class="cy-check">` +
      `<div class="cy-check-left">` +
        `<div class="lab-score"><span class="lab-score-num">${score}<small> / ${CRITERIA.length}</small></span><span class="lab-score-label">${LABELS.scoreLabel}</span></div>` +
        `<div class="cy-crit-list">${rows}</div>` +
        `<p class="cy-reminder">${gloss(LABELS.bigQuestion)}</p>` +
      `</div>` +
      `<div class="cy-check-detail" aria-live="polite"><h3>${LABELS.criteria[state.selected]}</h3>${criterionDetail(state.selected, ev)}</div>` +
      `</div>`;

    $$('[data-crit]').forEach(btn => btn.addEventListener('click', () => {
      state.selected = btn.dataset.crit;
      renderCheck();
    }));
    lab.fillSpace($('.cy-check-detail'));
    lab.checkFooter();
  }

  /* ===== Rapport imprimable : contenu des 7 sections de la fiche outil FO3
     (en-tête, numérotation et mise en page : cadre commun) =====
     Les erreurs passent par mark() (lab-engine.js), dans l'ordre de
     lecture : premiers jours, longueurs, graphique, ovulation
     (observations), preuves (interprétation), réponses et jugement
     (conclusion). */
  function buildReport(mark) {
    const R = LABELS.report;
    const N = LABELS.notes;
    const ev = evaluate();
    const c = state.concl;
    const word = (text, good, note) => (good ? text : mark(text, plain(note)));

    const hyp = `<ul>${CLAIMS.map(k => `<li>${plain(LABELS.claims[k])} ${R.iThink(hypWord(k))}</li>`).join('')}</ul>` +
      (state.because.trim() ? `<p>${R.because}: ${escapeHtml(state.because.trim())}</p>` : '');

    const head = `<tr><th></th>${range(STARTS).map(k => `<th>${N.period(k + 1)}</th>`).join('')}${range(CYCLES).map(k => `<th>${N.cycle(k + 1)}</th>`).join('')}<th>${plain(N.ov)}</th><th>${plain(N.toEnd)}</th></tr>`;
    const rows = range(WOMEN).map(w => {
      const days = range(STARTS).map(k => {
        const t = escapeHtml(dateText(state.marks[w][k]));
        return `<td>${ev.days[w][k] ? t : mark(t, CHECK.dayNote(dateText(woman(w).starts[k])), { box: true })}</td>`;
      }).join('');
      const lens = range(CYCLES).map(k => {
        const t = numText(state.lengths[w][k]);
        return `<td>${ev.lens[w][k] ? t : mark(t, CHECK.lenNote(fromMarks(w, k)), { box: true })}</td>`;
      }).join('');
      const ov = numText(state.ov[w]);
      const end = numText(state.toEnd[w]);
      return `<tr><th>${escapeHtml(nameOf(w))}</th>${days}${lens}` +
        `<td>${ev.ovs[w] ? ov : mark(ov, CHECK.ovNote(woman(w).ov), { box: true })}</td>` +
        `<td>${ev.ends[w] ? end : mark(end, CHECK.endNote(L3of(w) - notedOv(w)), { box: true })}</td></tr>`;
    }).join('');
    const table = `<p>${R.tableTitle(LABELS.list(monthsOf(run).map(m => LABELS.months[m])))}</p><table class="cy-report-table">${head}${rows}</table>`;
    const graphNote = ev.crit.graph ? '' : `<p>${mark(R.graphMark, CHECK.graphNote)}</p>`;
    const observations = table + `<div class="cy-report-chart">${chartSVG('read', state.bars)}</div>` + graphNote;

    const interpretation = `<ul>${CLAIMS.map(k => {
      const p = c.proofs[k] ? escapeHtml(plain(proofText(c.proofs[k]))) : DASH;
      const good = goodProof(k);
      return `<li>${plain(LABELS.claimsShort[k])}: ${ev.proofGood[k] ? p : mark(p, CHECK.proofNote(good ? plain(proofText(good)) : DASH))}</li>`;
    }).join('')}</ul>`;

    const conclusion = `<ul>${CLAIMS.map(k => `<li>${plain(LABELS.claims[k])} ` +
      `${c.answers[k] ? word(LABELS.trueFalse[c.answers[k]], ev.answerOk[k], `${LABELS.trueFalse[ev.expected[k]]}. ${plain(EXPLAIN.claims[k])}`) : DASH}</li>`).join('')}</ul>` +
      `<p>${R.verdict(c.verdict ? word(LABELS.verdicts[c.verdict], ev.verdictOk, CHECK.verdict[ev.shouldVerdict]) : DASH)}</p>`;

    const correction = CRITERIA.map(k => `<tr><th>${LABELS.criteria[k]}</th><td class="${ev.crit[k] ? 'ok' : 'ko'}">${ev.crit[k] ? '✓' : '✗'}</td></tr>`).join('');

    return {
      title: R.title,
      sections: [
        `<p>${plain(LABELS.bigQuestion)}</p><ol>${CLAIMS.map(k => `<li>${plain(LABELS.claims[k])}</li>`).join('')}</ol>`,
        hyp,
        `<p>${R.materials}</p>`,
        `<ol>${R.steps.map(t => `<li>${t}</li>`).join('')}</ol>`,
        observations,
        interpretation,
        conclusion
      ],
      correction: `<p><strong>${R.score(CRITERIA.filter(k => ev.crit[k]).length, CRITERIA.length)}</strong></p>` +
        `<table class="cy-report-corr">${correction}</table>`
    };
  }

  lab = LabEngine.create({
    id: 'cycles',
    // Ce qu'il faut toucher ou remplir maintenant (voir phase).
    todo: step => (step === 2 ? todoEls() : []),
    // Page d'accueil (Mission, voir lab-engine.js) : toujours la même, rien du tirage.
    briefing: () => ({
      heading: LABELS.briefTitle,
      intro: gloss(LABELS.briefTask),
      questionTitle: LABELS.yourQuestion,
      questions: [gloss(LABELS.bigQuestion)],
      steps: LABELS.briefSteps.map((text, i) => ({
        text: gloss(text),
        detail: gloss(LABELS.briefDetails[i]),
        pics: i === 0 ? [{ html: ICON.claim, label: LABELS.tools.claims }]
          : i === 1 ? [
            { html: ICON.calendar, label: LABELS.tools.calendar },
            { html: ICON.chart, label: LABELS.tools.graph },
            { html: ICON.thermo, label: LABELS.tools.thermometer }
          ] : null
      })),
      checks: Object.values(LABELS.criteria)
    }),
    title: LABELS.title,
    glossary: GLOSSARY,
    reset,
    stepComplete,
    lockReason,
    isStarted: () => CLAIMS.some(k => !!state.hyp[k]) || state.started,
    render: { 1: renderPredict, 2: () => renderExperiment(), 3: renderConclude, 4: renderCheck },
    report: buildReport,
    version: 1,
    save: () => ({ run, state }),
    load(data) {
      const r = data.run, s = data.state;
      const okWoman = w => w && PROFILES[w.profile] && Array.isArray(w.lens) && w.lens.length === CYCLES &&
        Array.isArray(w.starts) && w.starts.length === STARTS && Array.isArray(w.periods) && w.periods.length === STARTS &&
        Number.isInteger(w.ov) && Array.isArray(w.temps) && w.temps.length === w.lens[CYCLES - 1] &&
        Number.isInteger(w.name) && w.name >= 0 && w.name < LABELS.names.length;
      const grid = (a, n, m) => Array.isArray(a) && a.length === n && a.every(x => Array.isArray(x) && (m == null || x.length === m));
      if (!r || !Number.isInteger(r.month) || r.month < 0 || r.month > 8 || !Array.isArray(r.women) || r.women.length !== WOMEN || !r.women.every(okWoman) ||
        !s || !s.hyp || !grid(s.marks, WOMEN) || !grid(s.lengths, WOMEN, CYCLES) || !grid(s.bars, WOMEN, CYCLES) ||
        !Array.isArray(s.ov) || s.ov.length !== WOMEN || !Array.isArray(s.toEnd) || s.toEnd.length !== WOMEN ||
        !s.concl || !s.concl.answers || !s.concl.proofs || ![1, 2, 3].includes(s.part) || ![1, 2, 3].includes(s.view)) throw new Error('labProgress');
      run = r;
      state = s;
      if (!CRITERIA.includes(state.selected)) state.selected = CRITERIA[0];
      if (!(state.woman >= 0 && state.woman < WOMEN)) state.woman = 0;
      stepperDone = null;
      conclReady = null;
    },
    summary() {
      const ev = evaluate();
      const criteria = {};
      CRITERIA.forEach(k => { criteria[k] = ev.crit[k]; });
      return {
        score: CRITERIA.filter(k => ev.crit[k]).length,
        total: CRITERIA.length,
        criteria,
        labels: LABELS.criteria, // noms des critères, pour le tableau de bord
        details: {
          profiles: run.women.map(w => w.profile),
          lengths: run.women.map(w => w.lens),
          ovulation: run.women.map(w => w.ov),
          hyp: CLAIMS.map(k => state.hyp[k]),
          daysRight: ev.daysGood,
          lengthsRight: ev.lensGood
        }
      };
    }
  });
})();
