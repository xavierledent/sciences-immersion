/* ===== Labo virtuel « Zoom in » (chem2) : que donne un mélange ? =====

   Simulation propre à ce labo, commune aux deux filières ; ses textes sont
   dans le dossier du chapitre, un fichier par langue (lab-zoom.en.js,
   lab-zoom.nl.js). Le cadre commun (modale, barre d'étapes, verrous,
   traduction, rapport imprimé) est dans lab-engine.js. Ordre de chargement :
   moteur, textes, ce fichier.

   Le labo réel du chapitre (la séparation) a déjà son labo virtuel : celui-ci
   est une expérience sur un modèle. L'élève prépare lui-même deux mélanges :
   il sait ce qu'il verse, son hypothèse s'appuie sur des faits. Le
   microscope est imaginaire : il donne la composition (sortes et nombres de
   particules), jamais la disposition. L'élève dessine le modèle moléculaire,
   puis le compare à un modèle de référence (son modèle se fige alors).

   Trois préparations donnent un corps pur : une même substance sous deux
   formes (eau chaude et froide, eau et glaçons, sucre en morceaux et
   cristallisé). Le microscope les lit comme deux formes (« 6 molecules of
   liquid water, 4 molecules of ice ») et la clé des couleurs n'a qu'une
   couleur pour l'eau : à l'élève de comprendre que ce sont les mêmes
   molécules. Couleurs des particules : celles du cours, plus le sucre,
   l'hélium et le sable (gros cercles bruns, comme dans les exercices).

   Tirés au sort : deux types de résultat différents parmi trois (corps pur,
   mélange homogène, mélange hétérogène), une préparation pour chacun (12 en
   tout), leur ordre, la disposition des modèles de référence.

   Déroulé :
     1. Predict    — pour chaque préparation (ses ingrédients sont donnés) :
                     corps pur, mélange homogène ou hétérogène ?
     2. Experiment — pour chaque préparation, dans l'ordre voulu : verser,
                     mélanger, noter ce qu'on voit à l'œil nu, zoomer,
                     dessiner le modèle, comparer, remplir le carnet (sortes
                     de particules, corps pur ou mélange, homogène ou
                     hétérogène, solvant et soluté pour un mélange liquide)
     3. Conclude   — une réponse par préparation et son jugement, puis la
                     règle (que font les particules ?) pour chaque type de
                     résultat obtenu
     4. Check      — 5 vérifications : particules, disposition, carnet,
                     préparations, règle ; rapport (FO3) */

(function () {
  'use strict';

  const { escapeHtml, shuffle, mulberry32, seedFrom } = LabEngine.util;

  // Cadre commun, créé en fin de fichier (LabEngine.create).
  let lab;
  const $ = sel => lab.$(sel);
  const $$ = sel => lab.$$(sel);
  const gloss = text => lab.gloss(text);

  /* ===== Textes =====
     Dans le dossier du chapitre, un fichier par langue (lab-zoom.en.js,
     lab-zoom.nl.js), chargé avant celui-ci. */
  const {
    labels: LABELS, glossary: GLOSSARY, explanations: EXPLAIN, check: CHECK
  } = LabEngine.textFor('zoom');

  /* ===== Le modèle ===== */
  // Les couleurs des particules : la clé du cours, plus sucre, sable, hélium.
  const PARTICLES = {
    water: '#1f5fd6',
    salt: '#8b45ad',
    sugar: '#e0609e',
    oil: '#f28c1f',
    sand: '#8a5a2b',
    nitrogen: '#2f9e4f',
    oxygen: '#d62b2b',
    helium: '#e8c21a',
    co2: '#1c1c1c'
  };
  const PARTICLE_KEYS = Object.keys(PARTICLES);

  // Les flacons de la paillasse : leur dessin et leur teinte.
  const INGREDIENTS = {
    water: { icon: 'bottle' },
    hotWater: { icon: 'bottle', hot: true },
    coldWater: { icon: 'bottle', cold: true },
    ice: { icon: 'cubes', tint: '#e3f2fb' },
    sugarCubes: { icon: 'cubes', tint: '#ffffff' },
    grains: { icon: 'pot' },
    sugar: { icon: 'pot' },
    salt: { icon: 'pot' },
    oil: { icon: 'bottle', tint: '#f4d774' },
    sand: { icon: 'pot', tint: '#d9b77a' },
    co2: { icon: 'cylinder' },
    nitrogen: { icon: 'cylinder' },
    oxygen: { icon: 'cylinder' },
    helium: { icon: 'cylinder' }
  };

  /* Les préparations. kind : pure, homo, hetero ; vessel : glass (verre
     ouvert), bottle (fermée), flask (gaz), bowl (solides) ; ing : les
     flacons ; parts : le modèle ; forms : la lecture du microscope quand elle
     nomme deux formes d'une même substance ; seen : ce qu'on voit à l'œil nu
     s'il ne suit pas le type (same : partout pareil, parts : des parties
     différentes) ; solutes : les ingrédients dissous dans l'eau (mélange
     liquide) ; top, bottom : les particules au-dessus, au fond. */
  const PREPS = {
    hotcold: { kind: 'pure', vessel: 'glass', ing: ['hotWater', 'coldWater'], parts: { water: 10 }, forms: { hot: 5, cold: 5 } },
    ice: { kind: 'pure', vessel: 'glass', ing: ['water', 'ice'], parts: { water: 10 }, forms: { liquid: 6, ice: 4 }, seen: 'parts' },
    sugars: { kind: 'pure', vessel: 'bowl', ing: ['sugarCubes', 'grains'], parts: { sugar: 10 }, forms: { cubes: 5, grains: 5 }, seen: 'parts' },
    salty: { kind: 'homo', vessel: 'glass', ing: ['water', 'salt'], parts: { water: 10, salt: 3 }, solutes: ['salt'] },
    sweet: { kind: 'homo', vessel: 'glass', ing: ['water', 'sugar'], parts: { water: 10, sugar: 3 }, solutes: ['sugar'] },
    sparkling: { kind: 'homo', vessel: 'bottle', ing: ['water', 'co2'], parts: { water: 10, co2: 2 }, solutes: ['co2'] },
    soda: { kind: 'homo', vessel: 'bottle', ing: ['water', 'sugar', 'co2'], parts: { water: 9, sugar: 2, co2: 2 }, solutes: ['sugar', 'co2'] },
    air: { kind: 'homo', vessel: 'flask', ing: ['nitrogen', 'oxygen'], parts: { nitrogen: 8, oxygen: 2 } },
    heliox: { kind: 'homo', vessel: 'flask', ing: ['helium', 'oxygen'], parts: { helium: 8, oxygen: 2 } },
    oilwater: { kind: 'hetero', vessel: 'glass', ing: ['water', 'oil'], parts: { water: 10, oil: 4 }, top: ['oil'] },
    sandwater: { kind: 'hetero', vessel: 'glass', ing: ['water', 'sand'], parts: { water: 10, sand: 3 }, bottom: ['sand'] },
    oilsalt: { kind: 'hetero', vessel: 'glass', ing: ['water', 'salt', 'oil'], parts: { water: 8, salt: 3, oil: 4 }, solutes: ['salt'], top: ['oil'] }
  };
  const PREP_KEYS = Object.keys(PREPS);

  const IDX = [0, 1];
  const RESULTS = ['pure', 'homo', 'hetero'];
  const NOTE_KINDS = ['pure', 'mixture'];
  const MIXES = ['homo', 'hetero'];
  const COUNTS = ['1', '2', '3'];
  const SEEN = ['same', 'parts'];
  const RULE_WORDS = ['one', 'spread', 'apart'];
  const RULE_RIGHT = { pure: 'one', homo: 'spread', hetero: 'apart' };

  /* La lame : coordonnées de 0 à 1, centre (0,5 ; 0,5). Un centre de particule
     reste à limitOf(t) du centre de la lame. Le sable est un gros cercle. */
  const PR = 0.052;        // rayon d'une particule
  const SAND_R = 0.075;
  const RIM = 0.49;
  const MAX_PARTICLES = 24;
  const TAP_PX = 6;        // en dessous, un geste sur une particule est un toucher
  const radius = t => (t === 'sand' ? SAND_R : PR);
  const limitOf = t => RIM - 0.008 - radius(t);

  let run;      // tirage : les deux préparations, la graine des modèles de référence
  let state;    // travail de l'élève

  function draw() {
    const kinds = shuffle(RESULTS).slice(0, 2);
    const preps = kinds.map(k => shuffle(PREP_KEYS.filter(id => PREPS[id].kind === k))[0]);
    return { preps: shuffle(preps), seed: Math.floor(Math.random() * 1e9) };
  }

  const blankNote = () => ({ n: null, kind: null, mix: null, solvent: null, solute: null });

  function reset() {
    run = draw();
    state = {
      hyp: [null, null],
      because: '',
      started: false,                     // premier flacon versé : hypothèses figées
      tab: 0,                             // préparation affichée
      color: null,                        // particule choisie dans la clé
      poured: [[], []],
      mixed: [false, false],
      seen: [null, null],                 // ce que l'élève voit à l'œil nu
      zoomed: [false, false],
      models: [[], []],                   // { t, x, y } : les lames de l'élève
      compared: [false, false],
      notes: [blankNote(), blankNote()],
      concl: { kind: [null, null], n: [null, null], v: [null, null], rule: {} },
      selected: 'particles'
    };
    stepperDone = null;
  }

  /* --- Ce que disent les préparations --- */
  const prepId = i => run.preps[i];
  const prepOf = i => PREPS[run.preps[i]];
  const nameOf = i => LABELS.preps[run.preps[i]];
  const typesOf = i => Object.keys(prepOf(i).parts);
  const isLiquid = i => prepOf(i).vessel === 'glass' || prepOf(i).vessel === 'bottle';
  const seenOf = i => prepOf(i).seen || (prepOf(i).kind === 'hetero' ? 'parts' : 'same');
  const solutesOf = i => prepOf(i).solutes || [];
  // Les types de résultat de ce tirage, dans l'ordre pure, homo, hetero.
  const runKinds = () => RESULTS.filter(k => IDX.some(i => prepOf(i).kind === k));
  const countsOf = points => points.reduce((o, p) => { o[p.t] = (o[p.t] || 0) + 1; return o; }, {});
  const countText = parts => LABELS.list(Object.keys(parts).map(t => LABELS.countOf(parts[t], parts[t] === 1 ? LABELS.particles[t].one : LABELS.particles[t].many)));

  // La lecture du microscope : [nombre, nom au pluriel] par ligne.
  function readingOf(i) {
    const p = prepOf(i);
    return p.forms ? Object.keys(p.forms).map(f => [p.forms[f], LABELS.forms[f]])
      : Object.keys(p.parts).map(t => [p.parts[t], LABELS.particles[t].many]);
  }
  const readingText = i => LABELS.list(readingOf(i).map(([n, w]) => LABELS.countOf(n, w)));

  /* --- La disposition : tolérante. Un vrai groupement à part est une erreur
     dans un mélange homogène ; dans un mélange hétérogène, l'huile est
     au-dessus, le sable au fond (une particule mal placée est permise), et
     ce qui est dissous reste réparti dans l'eau. --- */
  const centre = pts => ({
    x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
    y: pts.reduce((s, p) => s + p.y, 0) / pts.length
  });

  function isGrouped(a, b) {
    const ca = centre(a), cb = centre(b);
    const dx = cb.x - ca.x, dy = cb.y - ca.y;
    const d = Math.hypot(dx, dy);
    if (d < 0.3) return false;
    const along = p => p.x * dx + p.y * dy;
    return Math.max(...a.map(along)) < Math.min(...b.map(along));
  }

  // above au-dessus de below.
  function layered(above, below) {
    const misplaced = t => above.filter(p => p.y > t).length + below.filter(p => p.y < t).length;
    return above.concat(below).some(p => misplaced(p.y) <= 1);
  }

  function arrangementOk(i, points) {
    const p = prepOf(i);
    if (p.kind === 'pure') return true;
    const of = t => points.filter(q => q.t === t);
    if (typesOf(i).some(t => !of(t).length)) return false;
    if (p.kind === 'homo') {
      const [main, ...others] = typesOf(i);
      return others.every(t => !isGrouped(of(t), of(main)));
    }
    const apart = p.top || p.bottom;
    const sep = points.filter(q => apart.includes(q.t));
    const rest = points.filter(q => typesOf(i).includes(q.t) && !apart.includes(q.t));
    if (!(p.top ? layered(sep, rest) : layered(rest, sep))) return false;
    return solutesOf(i).every(t => !isGrouped(of(t), of('water')));
  }

  /* --- Le modèle de référence : même tirage à chaque affichage --- */
  function referenceOf(i) {
    const p = prepOf(i);
    const rng = mulberry32(seedFrom(`${run.seed}-${i}`));
    const scatter = (placed, t, n, band) => {
      let slack = 1, tries = 0, count = 0;
      while (count < n) {
        const q = { t, x: rng(), y: band[0] + rng() * (band[1] - band[0]) };
        if (++tries > 300) { slack *= 0.9; tries = 0; }
        if (Math.hypot(q.x - 0.5, q.y - 0.5) > limitOf(t) - 0.01) continue;
        if (placed.some(o => Math.hypot(o.x - q.x, o.y - q.y) < (radius(o.t) + radius(t) + 0.03) * slack)) continue;
        placed.push(q);
        count++;
      }
    };
    for (let attempt = 0; attempt < 30; attempt++) {
      const placed = [];
      if (prepId(i) === 'ice') {
        // La glace flotte : ses molécules, rangées en ordre, en haut.
        [[0.445, 0.16], [0.555, 0.16], [0.445, 0.27], [0.555, 0.27]].forEach(([x, y]) => placed.push({ t: 'water', x, y }));
        scatter(placed, 'water', p.forms.liquid, [0.42, 0.92]);
      } else {
        typesOf(i).forEach(t => {
          let band = [0.07, 0.93];
          if (p.top) band = p.top.includes(t) ? [0.09, 0.38] : [0.5, 0.92];
          if (p.bottom) band = p.bottom.includes(t) ? [0.7, 0.9] : [0.08, 0.6];
          scatter(placed, t, p.parts[t], band);
        });
      }
      if (arrangementOk(i, placed)) return placed;
    }
    return [];
  }

  /* ===== Dessins ===== */
  const LINE = '#5d728f';
  const LIQUID = '#cfe6f3';
  const OIL = '#f4d774';
  const SAND = '#d9b77a';
  const POWDER = '#f2efe8';

  // Un flacon de la paillasse.
  function ingredientSVG(g) {
    const it = INGREDIENTS[g];
    const line = `stroke="${LINE}" stroke-width="2"`;
    let body;
    if (it.icon === 'bottle') {
      const cap = it.hot ? '#d9534f' : it.cold ? '#4a90d9' : '#8d9db3';
      body = `<rect x="19" y="34" width="22" height="29" rx="4" fill="${it.tint || LIQUID}"/>` +
        `<path d="M24,14 H36 V24 Q42,26 42,32 V60 Q42,64 38,64 H22 Q18,64 18,60 V32 Q18,26 24,24 Z" fill="none" ${line}/>` +
        `<rect x="22" y="7" width="16" height="7" rx="2" fill="${cap}" ${line}/>` +
        (it.hot ? `<path d="M46,16 q4,-4 0,-8 M52,20 q4,-4 0,-8" fill="none" stroke="#b8c3d1" stroke-width="2" stroke-linecap="round"/>` : '');
    } else if (it.icon === 'pot') {
      const fill = it.tint || POWDER;
      body = `<rect x="15" y="36" width="30" height="27" rx="5" fill="${fill}"/>` +
        `<circle cx="22" cy="46" r="1.3" fill="#b9b19f"/><circle cx="31" cy="52" r="1.3" fill="#b9b19f"/><circle cx="38" cy="44" r="1.3" fill="#b9b19f"/><circle cx="26" cy="57" r="1.3" fill="#b9b19f"/>` +
        `<rect x="14" y="22" width="32" height="42" rx="6" fill="none" ${line}/>` +
        `<rect x="12" y="14" width="36" height="9" rx="3" fill="#8d9db3" ${line}/>`;
    } else if (it.icon === 'cubes') {
      const cube = (x, y, a) => `<rect x="${x}" y="${y}" width="14" height="14" rx="2" fill="${it.tint}" stroke="#8fa3ba" stroke-width="1.8" transform="rotate(${a} ${x + 7} ${y + 7})"/>`;
      body = `<ellipse cx="30" cy="58" rx="25" ry="7" fill="#eef2f6" ${line}/>` +
        cube(13, 40, -8) + cube(31, 41, 6) + cube(22, 27, 12);
    } else {
      body = `<rect x="20" y="20" width="20" height="44" rx="9" fill="#c5ced9" ${line}/>` +
        `<rect x="26" y="9" width="8" height="11" fill="#8d9db3" ${line}/>` +
        `<path d="M34,13 H42" ${line}/>`;
    }
    return `<svg class="zm-ing-icon" viewBox="0 0 60 70" aria-hidden="true" focusable="false">${body}</svg>`;
  }

  // Le récipient de la préparation, vu à l'œil nu.
  const VESSELS = {
    glass: 'M38,24 V128 Q38,140 50,140 H110 Q122,140 122,128 V24',
    bottle: 'M70,14 H90 V28 Q106,34 106,50 V130 Q106,140 96,140 H64 Q54,140 54,130 V50 Q54,34 70,28 Z',
    flask: 'M70,14 V62 A40,40 0 1 0 90,62 V14',
    bowl: 'M22,86 H138 Q138,140 80,140 Q22,140 22,86 Z'
  };

  function sceneSVG(i, mixing) {
    const p = prepOf(i);
    const has = g => state.poured[i].includes(g);
    const mixed = state.mixed[i];
    const clip = 'clip-path="url(#zm-vessel-clip)"';
    const out = [];
    const liquids = ['water', 'hotWater', 'coldWater'].filter(g => p.ing.includes(g));
    const poured = liquids.filter(has).length;
    let top = null;
    if (poured) {
      const full = p.vessel === 'bottle' ? 46 : 58;
      top = 140 - (140 - full) * poured / liquids.length;
      out.push(`<rect x="0" y="${top}" width="160" height="${150 - top}" fill="${LIQUID}" ${clip}/>`);
    }
    if (has('sand')) out.push(`<rect x="0" y="125" width="160" height="25" fill="${SAND}" ${clip}/>`);
    if (!mixed && (has('salt') || has('sugar'))) {
      out.push(`<path d="M64,141 Q80,122 96,141 Z" fill="${POWDER}" stroke="#b9b19f" stroke-width="1.5" ${clip}/>`);
    }
    if (has('oil')) out.push(`<rect x="0" y="${top == null ? 124 : top - 16}" width="160" height="16" fill="${OIL}" ${clip}/>`);
    if (has('co2') && !mixed && top != null) {
      out.push([[72, 122], [88, 108], [76, 92], [92, 76], [66, 66]].filter(([, y]) => y > top + 4)
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="none" stroke="#7fa7c4" stroke-width="1.6"/>`).join(''));
    }
    const cube = (x, y, a, fill) => `<rect x="${x}" y="${y}" width="16" height="16" rx="2" fill="${fill}" stroke="#8fa3ba" stroke-width="1.8" transform="rotate(${a} ${x + 8} ${y + 8})"/>`;
    if (has('ice')) {
      const y = top == null ? 122 : top - 8;
      out.push(cube(52, y, -8, '#e3f2fb') + cube(72, y + 1, 6, '#e3f2fb') + cube(92, y - 1, 12, '#e3f2fb'));
    }
    if (has('grains')) {
      out.push(`<path d="M30,141 Q80,100 130,141 Z" fill="${POWDER}" stroke="#b9b19f" stroke-width="1.5" ${clip}/>` +
        [[56, 126], [70, 118], [84, 122], [98, 128], [64, 134], [90, 135], [108, 134]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#b9b19f"/>`).join(''));
    }
    if (has('sugarCubes')) {
      const spots = mixed ? [[42, 116, -10], [76, 104, 8], [104, 118, 16]] : [[56, 120, -6], [76, 122, 4], [96, 119, 10]];
      out.push(spots.map(([x, y, a]) => cube(x, y, a, '#ffffff')).join(''));
    }
    const closed = mixed && (p.vessel === 'bottle' || p.vessel === 'flask');
    return `<svg class="zm-scene-svg ${mixing ? 'is-mixing' : ''}" viewBox="0 0 160 150" aria-hidden="true" focusable="false">` +
      `<defs><clipPath id="zm-vessel-clip"><path d="${VESSELS[p.vessel]}"/></clipPath></defs>` +
      `<path d="${VESSELS[p.vessel]}" fill="#ffffff"/>${out.join('')}` +
      `<path d="${VESSELS[p.vessel]}" fill="none" stroke="${LINE}" stroke-width="2.5" stroke-linejoin="round"/>` +
      (p.vessel === 'glass' ? `<path d="M46,36 V118" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" opacity="0.8"/>` : '') +
      (closed ? `<rect x="66" y="3" width="28" height="13" rx="3" fill="${p.vessel === 'flask' ? '#b07d4f' : '#8d9db3'}" stroke="${LINE}" stroke-width="2"/>` : '') +
      (has('hotWater') ? `<path d="M62,18 q6,-6 0,-12 M80,16 q6,-6 0,-12 M98,18 q6,-6 0,-12" fill="none" stroke="#b8c3d1" stroke-width="2.5" stroke-linecap="round"/>` : '') +
      `</svg>`;
  }

  const particleSVG = (p, i) => `<circle cx="${(p.x * 1000).toFixed(0)}" cy="${(p.y * 1000).toFixed(0)}" r="${radius(p.t) * 1000}" fill="${PARTICLES[p.t]}" stroke="#2b2b2b" stroke-width="4"${i == null ? '' : ` data-i="${i}"`}/>`;
  const slideInner = (points, live) => `<circle cx="500" cy="500" r="${RIM * 1000}" fill="#ffffff" stroke="#4a4a4a" stroke-width="14"/>` +
    points.map((p, i) => particleSVG(p, live ? i : null)).join('');
  const slideSVG = (points, cls, aria) => `<svg class="zm-slide ${cls || ''}" viewBox="0 0 1000 1000" role="img" aria-label="${escapeHtml(aria)}">${slideInner(points, false)}</svg>`;
  const dot = t => `<span class="zm-dot" style="background:${PARTICLES[t]}" aria-hidden="true"></span>`;

  /* ===== Étapes complètes (progression stricte, voir lab-engine.js) =====
     1 : les deux hypothèses ; 2 : les deux modèles comparés et le carnet
     complet ; 3 : toutes les réponses. */
  const hypDone = () => IDX.every(i => !!state.hyp[i]);
  const solutionOpen = i => isLiquid(i) && state.notes[i].kind === 'mixture';
  const noteDone = i => {
    const n = state.notes[i];
    return !!(n.n && n.kind && (n.kind === 'pure' || n.mix) && (!solutionOpen(i) || (n.solvent && n.solute)));
  };
  const runDone = () => IDX.every(i => state.compared[i] && noteDone(i));

  function stepComplete(n) {
    if (n === 1) return hypDone();
    if (n === 2) return runDone();
    return conclusionsComplete();
  }

  function lockReason(n) {
    if (n === 1) return LABELS.lockHypothesis;
    if (n === 2) return LABELS.lockRun(IDX.filter(i => !state.compared[i]).length, IDX.filter(i => !noteDone(i)).length);
    return lab.L.missingConclusions;
  }

  const questionsHTML = () => `<p class="zm-big-q">${gloss(LABELS.bigQuestion)}</p>` +
    `<ol class="zm-questions">${IDX.map(i => `<li>${gloss(LABELS.subQuestion(nameOf(i)))}</li>`).join('')}</ol>`;
  const chipHTML = (attrs, label, on) => `<button type="button" class="lab-choice zm-chip ${on ? 'is-selected' : ''}" ${attrs} aria-pressed="${on}"><span>${label}</span></button>`;

  /* ===== Étape 1 : hypothèses ===== */
  function renderPredict() {
    const h = state.hyp;
    const show = lab.state.showMissing;
    const miss = ok => (show && !ok ? 'lab-is-missing' : '');
    const prepRow = i => `<div class="zm-hyp ${miss(h[i])}">` +
      `<div class="zm-hyp-ings">${prepOf(i).ing.map(g => `<span class="zm-hyp-ing">${ingredientSVG(g)}<small>${gloss(LABELS.ingredients[g])}</small></span>`).join('')}</div>` +
      `<div class="zm-hyp-body"><p class="zm-sentence"><span class="zm-num" aria-hidden="true">${i + 1}</span> <strong>${gloss(LABELS.subQuestion(nameOf(i)))}</strong></p>` +
      `<p class="zm-sentence">${gloss(LABELS.hypWill)}</p>` +
      `<div class="zm-chips">${RESULTS.map(k => chipHTML(`data-hyp="${i}" data-val="${k}"`, LABELS.kindChip[k], h[i] === k)).join('')}</div></div></div>`;

    lab.body.innerHTML = `<div class="zm-predict">` +
      `<div class="zm-question-card"><p class="zm-kicker">${LABELS.yourQuestion}</p>` +
        `<p class="zm-big-q">${gloss(LABELS.bigQuestion)}</p><p class="zm-intro">${gloss(LABELS.intro)}</p></div>` +
      `<div class="zm-hyp-card"><p class="zm-kicker">${LABELS.hypothesisTitle}</p>` +
        `<div class="zm-hyp-preps">${IDX.map(prepRow).join('')}</div>` +
        `<label class="zm-because"><span>${LABELS.because}</span>` +
        `<input type="text" class="lab-input zm-because-input" maxlength="160" placeholder="${LABELS.becausePlaceholder}" value="${escapeHtml(state.because)}" autocomplete="off"></label>` +
      `</div></div>`;

    $$('[data-hyp]').forEach(btn => btn.addEventListener('click', () => {
      h[Number(btn.dataset.hyp)] = btn.dataset.val;
      if (lab.state.showMissing && hypDone()) lab.state.showMissing = false;
      renderPredict();
      lab.renderStepper();
    }));
    const because = $('.zm-because-input');
    because.addEventListener('input', e => { state.because = e.target.value; });
    // Hypothèses figées dès le premier flacon versé.
    if (state.started) {
      $$('[data-hyp]').forEach(btn => lab.setLock(btn, LABELS.lockHypothesisFixed, { icon: false }));
      because.readOnly = true;
      lab.setLock(because, LABELS.lockHypothesisFixed);
    }

    const ready = hypDone();
    const info = lab.state.showMissing && !ready ? lab.footerInfo(LABELS.lockHypothesis, true)
      : lab.footerInfo(ready ? LABELS.hypothesisReady : LABELS.hypothesisPending);
    lab.setFooter(info + `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-next>${LABELS.toBench} →</button></div>`);
    const next = $('[data-next]');
    next.addEventListener('click', () => lab.goToStep(2));
    lab.setLock(next, ready ? null : LABELS.lockHypothesis, { missing: true, key: 'next' });
  }

  /* ===== Étape 2 : la paillasse et le microscope =====
     À gauche, la préparation (onglets, récipient, flacons, œil nu, zoom) ; au
     milieu, la lame de l'élève ; à droite, la lecture et la clé (puis, après
     la comparaison, le modèle de référence) ; en bas, le carnet. */
  let stepperDone = null;
  let justZoomed = false;
  let justMixed = false;
  let captionKey = null;

  function captionFor() {
    const i = state.tab;
    if (!state.mixed[i]) return state.poured[i].length < prepOf(i).ing.length ? LABELS.captionPour : LABELS.captionMix;
    if (!state.seen[i]) return LABELS.captionSeen;
    if (!state.zoomed[i]) return LABELS.captionZoom;
    if (state.compared[i]) return LABELS.captionCompared;
    if (captionKey) return LABELS[captionKey];
    if (!state.color) return LABELS.captionColour;
    return state.models[i].length ? LABELS.captionMove : LABELS.captionPlace;
  }

  function prepHTML() {
    const i = state.tab;
    const p = prepOf(i);
    const verb = p.vessel === 'bottle' || p.vessel === 'flask' ? 'shake' : 'stir';
    return `<section class="zm-prep">` +
      `<div class="zm-tabs">${IDX.map(k => `<button type="button" class="zm-tab ${k === i ? 'is-selected' : ''}" data-tab="${k}" data-lab-look aria-pressed="${k === i}">${LABELS.prepName(k + 1)}</button>`).join('')}</div>` +
      `<p class="zm-prep-name">${gloss(nameOf(i))}</p>` +
      `<div class="zm-mixer"><div class="zm-scene">${sceneSVG(i, justMixed)}</div>` +
        `<div class="zm-ings">${p.ing.map(g => `<button type="button" class="zm-ing ${state.poured[i].includes(g) ? 'is-poured' : ''}" data-pour="${g}">${ingredientSVG(g)}<span>${LABELS.ingredients[g]}</span></button>`).join('')}</div></div>` +
      (state.mixed[i]
        ? `<p class="zm-seen-q">${gloss(LABELS.seenQ)}</p><div class="zm-seen">${SEEN.map(k => chipHTML(`data-seen="${k}"`, LABELS.seen[k], state.seen[i] === k)).join('')}</div>`
        : `<button type="button" class="lab-btn lab-btn-primary zm-act" data-mix>${LABELS.mixBtn[verb]}</button>`) +
      (state.zoomed[i] ? '' : `<button type="button" class="lab-btn lab-btn-primary zm-act" data-zoom>${LABELS.zoomBtn}</button>`) +
      `</section>`;
  }

  function readingHTML(i) {
    return `<ul class="zm-reading">${readingOf(i).map(([n, w]) => `<li><span class="zm-big">${n}</span><span>${gloss(w)}</span></li>`).join('')}</ul>`;
  }

  function sideHTML() {
    const i = state.tab;
    if (!state.zoomed[i]) return `<section class="zm-side is-empty"><p>${gloss(LABELS.sideEmpty)}</p></section>`;
    if (state.compared[i]) {
      return `<section class="zm-side is-ref"><div class="zm-ref-slide"><h3 class="lab-panel-title">${LABELS.refTitle}</h3>` +
        `${slideSVG(referenceOf(i), 'is-ref', LABELS.refAria(i + 1))}</div>` +
        `<div class="zm-ref-text"><p class="zm-kicker">${LABELS.readingTitle}</p>${readingHTML(i)}` +
        `<p class="zm-muted">${gloss(LABELS.refNote)}</p></div></section>`;
    }
    return `<section class="zm-side"><p class="zm-kicker">${LABELS.readingTitle}</p>${readingHTML(i)}` +
      `<p class="zm-kicker">${LABELS.keyTitle}</p>` +
      `<div class="zm-key">${PARTICLE_KEYS.map(t => `<button type="button" class="lab-choice zm-key-btn ${state.color === t ? 'is-selected' : ''}" data-color="${t}" aria-pressed="${state.color === t}">${dot(t)}<span>${LABELS.particles[t].name}</span></button>`).join('')}</div>` +
      `<button type="button" class="lab-btn lab-btn-primary zm-compare" data-compare>${LABELS.compareBtn}</button></section>`;
  }

  // Sous la lame : ce qui est posé, couleur par couleur (sans dire si c'est juste).
  function counterHTML(points) {
    const have = countsOf(points);
    const items = PARTICLE_KEYS.filter(t => have[t]).map(t => `<span class="zm-count-item">${dot(t)}<strong>${have[t]}</strong></span>`);
    return `<span>${LABELS.onSlide}</span>${items.length ? items.join('') : '<strong>0</strong>'}`;
  }

  function selectHTML(attrs, value, options, labelOf, aria, missing) {
    return `<select class="lab-select zm-select ${value ? 'is-filled' : ''} ${missing && !value ? 'lab-is-missing' : ''}" ${attrs} aria-label="${escapeHtml(aria)}">` +
      `<option value="" disabled ${value ? '' : 'selected'}>${LABELS.choose}</option>` +
      options.map(x => `<option value="${x}" ${value === x ? 'selected' : ''}>${escapeHtml(labelOf(x))}</option>`).join('') + `</select>`;
  }

  // Les solutés possibles : un ou deux ingrédients autres que le solvant, ou rien.
  function soluteOptions(i) {
    const others = prepOf(i).ing.filter(g => g !== state.notes[i].solvent);
    const options = others.slice();
    others.forEach((a, k) => others.slice(k + 1).forEach(b => options.push(`${a}+${b}`)));
    return options.concat('none');
  }
  const soluteLabel = v => (v === 'none' ? LABELS.noSolute : LABELS.list(v.split('+').map(g => LABELS.ingredients[g])));

  function notebookHTML() {
    const show = lab.state.showMissing;
    const rows = IDX.map(i => {
      const n = state.notes[i];
      const open = solutionOpen(i);
      return `<tr><th scope="row">${LABELS.prepName(i + 1)}</th>` +
        `<td>${selectHTML(`data-note="n" data-of="${i}"`, n.n, COUNTS, x => x, LABELS.typesHead, show)}</td>` +
        `<td>${selectHTML(`data-note="kind" data-of="${i}"`, n.kind, NOTE_KINDS, x => LABELS.noteKinds[x], LABELS.kindHead, show)}</td>` +
        `<td>${selectHTML(`data-note="mix" data-of="${i}"`, n.mix, MIXES, x => LABELS.mixWords[x], LABELS.mixHead, show && n.kind === 'mixture')}</td>` +
        `<td>${selectHTML(`data-note="solvent" data-of="${i}"`, n.solvent, prepOf(i).ing, g => LABELS.ingredients[g], LABELS.solventHead, show && open)}</td>` +
        `<td>${selectHTML(`data-note="solute" data-of="${i}"`, n.solute, soluteOptions(i), soluteLabel, LABELS.soluteHead, show && open)}</td></tr>`;
    }).join('');
    return `<section class="zm-notebook"><table class="lab-table zm-notes"><caption>${LABELS.notebookTitle}</caption>` +
      `<thead><tr><th scope="col"></th><th scope="col">${LABELS.typesHead}</th><th scope="col">${LABELS.kindHead}</th><th scope="col">${LABELS.mixHead}</th>` +
      `<th scope="col">${LABELS.solventHead}</th><th scope="col">${LABELS.soluteHead}</th></tr></thead>` +
      `<tbody>${rows}</tbody></table></section>`;
  }

  function renderExperiment() {
    const i = state.tab;
    const points = state.models[i];
    lab.body.innerHTML = `<div class="zm-run">${prepHTML()}` +
      `<section class="zm-stage"><h3 class="lab-panel-title">${LABELS.slideTitle(i + 1)}</h3>` +
        `<p class="zm-caption" aria-live="polite">${gloss(captionFor())}</p>` +
        `<svg class="zm-slide is-live ${justZoomed ? 'is-zooming' : ''}" viewBox="0 0 1000 1000" role="img" aria-label="${escapeHtml(LABELS.slideAria)}">${slideInner(points, true)}</svg>` +
        `<p class="zm-counter">${counterHTML(points)}</p>` +
      `</section>${sideHTML()}${notebookHTML()}</div>`;
    justZoomed = false;
    justMixed = false;

    $$('[data-tab]').forEach(btn => btn.addEventListener('click', () => {
      state.tab = Number(btn.dataset.tab);
      captionKey = null;
      renderExperiment();
    }));
    bindPrep(i);
    $$('[data-color]').forEach(btn => btn.addEventListener('click', () => {
      state.color = btn.dataset.color;
      captionKey = null;
      renderExperiment();
    }));
    const compare = $('[data-compare]');
    if (compare) {
      compare.addEventListener('click', askCompare);
      lab.setLock(compare, points.length ? null : LABELS.lockEmpty);
    }
    bindSlide();
    bindNotes();
    renderRunFooter();
  }

  // Verser, mélanger, regarder à l'œil nu, zoomer : dans cet ordre.
  function bindPrep(i) {
    const p = prepOf(i);
    const act = change => {
      change();
      renderExperiment();
      lab.save();
    };
    $$('[data-pour]').forEach(btn => {
      const g = btn.dataset.pour;
      if (state.mixed[i]) lab.setLock(btn, LABELS.lockMixed, { icon: false });
      else if (state.poured[i].includes(g)) lab.setLock(btn, LABELS.lockPoured, { icon: false });
      btn.addEventListener('click', () => act(() => {
        state.started = true;
        state.poured[i].push(g);
      }));
    });
    const mix = $('[data-mix]');
    if (mix) {
      lab.setLock(mix, state.poured[i].length < p.ing.length ? LABELS.lockPourAll : null);
      mix.addEventListener('click', () => act(() => { state.mixed[i] = true; justMixed = true; }));
    }
    $$('[data-seen]').forEach(btn => {
      if (state.zoomed[i]) lab.setLock(btn, LABELS.lockSeenFixed, { icon: false });
      btn.addEventListener('click', () => act(() => { state.seen[i] = btn.dataset.seen; }));
    });
    const zoom = $('[data-zoom]');
    if (zoom) {
      lab.setLock(zoom, !state.mixed[i] ? LABELS.lockMixFirst : !state.seen[i] ? LABELS.lockSeenFirst : null);
      zoom.addEventListener('click', () => act(() => { state.zoomed[i] = true; justZoomed = true; }));
    }
  }

  /* --- La lame : toucher une couleur, puis la lame ; toucher une particule
     l'enlève, la glisser la déplace. Une particule posée sur une autre est
     écartée (les cercles restent lisibles). --- */
  function settle(p, others) {
    const q = { t: p.t, x: p.x, y: p.y };
    const limit = limitOf(q.t);
    const clamp = () => {
      const d = Math.hypot(q.x - 0.5, q.y - 0.5);
      if (d > limit) { q.x = 0.5 + (q.x - 0.5) * limit / d; q.y = 0.5 + (q.y - 0.5) * limit / d; }
    };
    clamp();
    for (let round = 0; round < 24; round++) {
      let moved = false;
      others.forEach(o => {
        const dx = q.x - o.x, dy = q.y - o.y;
        const d = Math.hypot(dx, dy);
        const min = (radius(q.t) + radius(o.t)) * 0.975;
        if (d >= min) return;
        const a = d > 0.001 ? Math.atan2(dy, dx) : round;
        q.x = o.x + Math.cos(a) * min;
        q.y = o.y + Math.sin(a) * min;
        moved = true;
      });
      clamp();
      if (!moved) break;
    }
    q.x = Math.round(q.x * 1000) / 1000;
    q.y = Math.round(q.y * 1000) / 1000;
    return q;
  }

  function bindSlide() {
    const svg = $('.zm-slide.is-live');
    const i = state.tab;
    if (!state.zoomed[i]) {
      lab.setLock(svg, LABELS.lockNoZoom, { icon: false });
      return;
    }
    if (state.compared[i]) {
      lab.setLock(svg, LABELS.lockModelFixed, { icon: false });
      return;
    }
    const points = state.models[i];
    const redraw = () => {
      svg.innerHTML = slideInner(points, true);
      $('.zm-counter').innerHTML = counterHTML(points);
    };
    const toSlide = e => {
      // La lame reste carrée et centrée, même si son cadre ne l'est pas.
      const r = svg.getBoundingClientRect();
      const side = Math.min(r.width, r.height);
      return {
        x: (e.clientX - r.left - (r.width - side) / 2) / side,
        y: (e.clientY - r.top - (r.height - side) / 2) / side
      };
    };
    let drag = null;

    svg.addEventListener('pointerdown', e => {
      e.preventDefault();
      const hit = e.target.closest ? e.target.closest('[data-i]') : null;
      if (hit) {
        drag = { i: Number(hit.dataset.i), x0: e.clientX, y0: e.clientY, moved: false };
        svg.setPointerCapture(e.pointerId);
        return;
      }
      const at = toSlide(e);
      if (Math.hypot(at.x - 0.5, at.y - 0.5) > RIM) return;
      if (!state.color) { captionKey = 'captionColour'; setCaption(); return; }
      if (points.length >= MAX_PARTICLES) { captionKey = 'captionFull'; setCaption(); return; }
      points.push(settle({ t: state.color, x: at.x, y: at.y }, points));
      captionKey = null;
      redraw();
      afterModel();
    });
    svg.addEventListener('pointermove', e => {
      if (!drag) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < TAP_PX) return;
      drag.moved = true;
      const at = toSlide(e);
      const others = points.filter((p, k) => k !== drag.i);
      points[drag.i] = settle({ t: points[drag.i].t, x: at.x, y: at.y }, others);
      redraw();
    });
    const end = () => {
      if (!drag) return;
      if (!drag.moved) points.splice(drag.i, 1);
      drag = null;
      captionKey = null;
      redraw();
      afterModel();
    };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', () => {
      drag = null;
      redraw();
    });
  }

  function setCaption() {
    const el = $('.zm-caption');
    if (el) el.innerHTML = gloss(captionFor());
  }

  function afterModel() {
    setCaption();
    const compare = $('[data-compare]');
    if (compare) lab.setLock(compare, state.models[state.tab].length ? null : LABELS.lockEmpty);
    updateRunFooter();
    lab.save();
  }

  function askCompare() {
    lab.confirm({
      title: LABELS.compareTitle,
      text: LABELS.compareText,
      confirm: LABELS.compareYes,
      icon: lab.lockIcon,
      focus: 'yes'
    }).then(yes => {
      if (!yes) return;
      state.compared[state.tab] = true;
      renderExperiment();
      lab.save();
    });
  }

  function bindNotes() {
    $$('select[data-note]').forEach(sel => {
      const i = Number(sel.dataset.of), field = sel.dataset.note;
      const n = state.notes[i];
      if (!state.compared[i]) lab.setLock(sel, LABELS.lockNote(i + 1));
      else if (field === 'mix' && n.kind === 'pure') lab.setLock(sel, LABELS.lockPure);
      else if (field === 'mix' && !n.kind) lab.setLock(sel, LABELS.lockKindFirst);
      else if (field === 'solvent' || field === 'solute') {
        if (!isLiquid(i)) lab.setLock(sel, LABELS.lockLiquid);
        else if (!n.kind) lab.setLock(sel, LABELS.lockKindFirst);
        else if (n.kind === 'pure') lab.setLock(sel, LABELS.lockPureSolution);
        else if (field === 'solute' && !n.solvent) lab.setLock(sel, LABELS.lockSolventFirst);
      }
      sel.addEventListener('change', () => {
        n[field] = sel.value || null;
        if (field === 'kind' && n.kind === 'pure') Object.assign(n, { mix: null, solvent: null, solute: null });
        if (field === 'solvent') n.solute = null;
        if (lab.state.showMissing && runDone()) lab.state.showMissing = false;
        renderExperiment();
        lab.save();
      });
    });
  }

  /* Le bouton suivant : l'autre préparation tant qu'elle n'est pas finie,
     puis Conclude. Touché trop tôt, il dit ce qui manque. */
  const prepDone = i => state.compared[i] && noteDone(i);
  const otherPrep = () => IDX.find(i => i !== state.tab && !prepDone(i));

  function renderRunFooter() {
    lab.setFooter(lab.footerInfo('') + `<div class="lab-footer-actions">` +
      `<button type="button" class="lab-btn lab-btn-primary" data-next></button></div>`);
    $('[data-next]').addEventListener('click', () => {
      const other = otherPrep();
      if (other == null) { lab.goToStep(3); return; }
      state.tab = other;
      captionKey = null;
      lab.state.showMissing = false;
      renderExperiment();
    });
    updateRunFooter();
  }

  function updateRunFooter() {
    const complete = stepComplete(2);
    const warn = lab.state.showMissing && !complete;
    const info = $('.lab-footer .lab-footer-info');
    if (info) {
      info.textContent = warn ? lockReason(2) : LABELS.runInfo(IDX.filter(i => state.compared[i]).length, IDX.filter(noteDone).length);
      info.classList.toggle('is-warning', warn);
    }
    const next = $('[data-next]');
    if (next) {
      const other = otherPrep();
      next.textContent = `${other == null ? LABELS.toConclude : LABELS.toPrep(other + 1)} →`;
      const reason = other == null ? (complete ? null : lockReason(2)) : prepDone(state.tab) ? null : LABELS.lockPrepHere;
      lab.setLock(next, reason, { missing: true, key: 'next' });
    }
    if (complete !== stepperDone) { stepperDone = complete; lab.renderStepper(); }
  }

  /* ===== Étape 3 : conclusion =====
     À gauche, les modèles de l'élève et son classement ; à droite, une
     réponse par préparation et son jugement, puis la règle. */
  function conclusionParts() {
    const c = state.concl;
    return {
      answers: IDX.every(i => c.kind[i] && c.n[i]),
      verdict: IDX.every(i => c.v[i]),
      rule: runKinds().every(k => c.rule[k])
    };
  }

  function conclusionsComplete() {
    return Object.values(conclusionParts()).every(Boolean);
  }

  const noteClass = i => {
    const n = state.notes[i];
    return n.kind === 'mixture' ? n.mix : n.kind;
  };
  const noteClassText = i => (noteClass(i) ? LABELS.kindChip[noteClass(i)] : '—');

  function recapHTML() {
    return `<div class="zm-recap">${IDX.map(i => `<figure class="zm-recap-prep"><figcaption><strong>${LABELS.prepName(i + 1)}</strong><br>${gloss(nameOf(i))}</figcaption>` +
      `${slideSVG(state.models[i], 'is-small', LABELS.slideTitle(i + 1))}` +
      `<p>${gloss(LABELS.recapTypes(state.notes[i].n || '—'))}</p><p><strong>${gloss(noteClassText(i))}</strong></p></figure>`).join('')}</div>`;
  }

  function renderConclude() {
    const c = state.concl;
    const show = lab.state.showMissing;
    const miss = ok => (show && !ok ? 'lab-is-missing' : '');
    const verdict = i => `<div class="zm-verdict"><span class="zm-verdict-text">${LABELS.verdictRow(i + 1)}</span>` +
      ['confirmed', 'rejected'].map(x => `<button type="button" class="lab-choice zm-chip is-small ${c.v[i] === x ? 'is-selected' : ''}" data-v="${i}" data-val="${x}" aria-pressed="${c.v[i] === x}">${LABELS[x]}</button>`).join('') + `</div>`;
    const answer = i => `<div class="zm-q ${miss(c.kind[i] && c.n[i] && c.v[i])}">` +
      `<p class="zm-q-title"><span class="zm-num" aria-hidden="true">${i + 1}</span><span>${gloss(LABELS.subQuestion(nameOf(i)))}</span></p>` +
      `<p class="zm-concl-line">${LABELS.answer(nameOf(i),
        selectHTML(`data-ck="${i}"`, c.kind[i], RESULTS, x => LABELS.kinds[x], LABELS.kindAria, show),
        selectHTML(`data-cn="${i}"`, c.n[i], COUNTS, x => x, LABELS.typesHead, show))}</p>` +
      `${verdict(i)}</div>`;
    const kinds = runKinds();

    lab.body.innerHTML = `<div class="zm-conclude">` +
      `<section class="zm-results"><h3 class="lab-panel-title">${LABELS.resultsTitle}</h3>${recapHTML()}</section>` +
      `<section class="zm-form">${IDX.map(answer).join('')}` +
        `<div class="zm-q ${miss(kinds.every(k => c.rule[k]))}"><p class="zm-q-title"><span>${gloss(LABELS.bigQuestion)}</span></p>` +
          `<p class="zm-line">${gloss(LABELS.ruleIntro)}</p>` +
          kinds.map(k => `<p class="zm-concl-line">${LABELS.rule[k](selectHTML(`data-rule="${k}"`, c.rule[k], RULE_WORDS, x => LABELS.ruleWords[x], LABELS.ruleAria, show))}</p>`).join('') +
        `</div>` +
      `</section></div>`;

    $$('select[data-ck]').forEach(sel => sel.addEventListener('change', () => { c.kind[Number(sel.dataset.ck)] = sel.value || null; afterConcl(); }));
    $$('select[data-cn]').forEach(sel => sel.addEventListener('change', () => { c.n[Number(sel.dataset.cn)] = sel.value || null; afterConcl(); }));
    $$('select[data-rule]').forEach(sel => sel.addEventListener('change', () => { c.rule[sel.dataset.rule] = sel.value || null; afterConcl(); }));
    $$('[data-v]').forEach(btn => btn.addEventListener('click', () => { c.v[Number(btn.dataset.v)] = btn.dataset.val; afterConcl(); }));

    lab.setFooter(`<button type="button" class="lab-btn lab-btn-ghost" data-back>← ${LABELS.backToLab}</button>` +
      lab.footerInfo('') +
      `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-check>${LABELS.checkConclusions}</button></div>`);
    $('[data-back]').addEventListener('click', () => lab.goToStep(2));
    $('[data-check]').addEventListener('click', () => lab.finish());
    const ready = conclusionsComplete();
    const info = $('.lab-footer .lab-footer-info');
    if (info && show && !ready) { info.textContent = lab.L.missingConclusions; info.classList.add('is-warning'); }
    lab.setLock($('[data-check]'), ready ? null : lab.L.missingConclusions, { missing: true, key: 'check' });
    lab.renderStepper();
  }

  function afterConcl() {
    if (lab.state.showMissing && conclusionsComplete()) lab.state.showMissing = false;
    renderConclude();
    lab.save();
  }

  /* ===== Étape 4 : correction ===== */
  const CRITERIA = ['particles', 'arrangement', 'notebook', 'preparations', 'rule'];
  const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));

  function particlesOk(i) {
    const have = countsOf(state.models[i]);
    const want = prepOf(i).parts;
    return sameSet(Object.keys(have), Object.keys(want)) && Object.keys(want).every(t => have[t] === want[t]);
  }

  // Le solvant et le soluté ne comptent que pour un mélange liquide.
  function solutionWrong(i) {
    if (prepOf(i).kind === 'pure' || !solutionOpen(i)) return false;
    const n = state.notes[i];
    const want = solutesOf(i);
    const have = !n.solute || n.solute === 'none' ? [] : n.solute.split('+');
    return !sameSet(have, want) || (want.length > 0 && n.solvent !== 'water');
  }

  function noteErrors(i) {
    const n = state.notes[i], p = prepOf(i);
    return {
      seen: state.seen[i] !== seenOf(i),
      n: Number(n.n) !== typesOf(i).length,
      kind: n.kind !== (p.kind === 'pure' ? 'pure' : 'mixture'),
      mix: p.kind !== 'pure' && n.mix !== p.kind,
      solution: solutionWrong(i)
    };
  }

  function evaluate() {
    const c = state.concl;
    const particleMiss = IDX.filter(i => !particlesOk(i));
    const arrangeMiss = IDX.filter(i => !arrangementOk(i, state.models[i]));
    const noteMiss = IDX.filter(i => Object.values(noteErrors(i)).some(Boolean));
    const answerMiss = IDX.filter(i => c.kind[i] !== prepOf(i).kind || Number(c.n[i]) !== typesOf(i).length);
    const should = IDX.map(i => (state.hyp[i] && state.hyp[i] === noteClass(i) ? 'confirmed' : 'rejected'));
    const vMiss = IDX.filter(i => c.v[i] !== should[i]);
    const ruleMiss = runKinds().filter(k => c.rule[k] !== RULE_RIGHT[k]);
    return {
      particleMiss, arrangeMiss, noteMiss, answerMiss, should, vMiss, ruleMiss,
      particles: particleMiss.length === 0,
      arrangement: arrangeMiss.length === 0,
      notebook: noteMiss.length === 0,
      preparations: answerMiss.length === 0 && vMiss.length === 0,
      rule: ruleMiss.length === 0
    };
  }

  const arrangeKey = i => {
    const p = prepOf(i);
    return p.kind === 'hetero' ? (p.top ? 'top' : 'bottom') : p.kind;
  };
  const rightAnswer = i => LABELS.answer(nameOf(i), LABELS.kinds[prepOf(i).kind], String(typesOf(i).length));
  const placedText = i => {
    const have = countsOf(state.models[i]);
    return Object.keys(have).length ? countText(have) : CHECK.nothing;
  };
  const particleNote = i => CHECK.particlesWrong(nameOf(i), placedText(i), readingText(i)) +
    (EXPLAIN.same[prepId(i)] ? ` ${EXPLAIN.same[prepId(i)]}` : '');
  const arrangeNote = i => CHECK.arrangeWrong(nameOf(i), EXPLAIN.arrange[arrangeKey(i)]);
  function solutionText(i) {
    if (!isLiquid(i) || prepOf(i).kind === 'pure') return '';
    const s = solutesOf(i);
    return s.length ? CHECK.solution(LABELS.ingredients.water, LABELS.list(s.map(g => LABELS.ingredients[g]))) : LABELS.noSolute;
  }
  const noteRight = i => CHECK.noteRight(nameOf(i), LABELS.seenNote[seenOf(i)], String(typesOf(i).length), LABELS.kinds[prepOf(i).kind], solutionText(i));

  function pairsHTML() {
    return `<div class="zm-pairs">${IDX.map(i => `<figure class="zm-pair"><figcaption><strong>${LABELS.prepName(i + 1)}</strong> · ${gloss(nameOf(i))}</figcaption>` +
      `<div class="zm-pair-slides"><div>${slideSVG(state.models[i], 'is-small', LABELS.slideTitle(i + 1))}<small>${LABELS.yourModel}</small></div>` +
      `<div>${slideSVG(referenceOf(i), 'is-small', LABELS.refAria(i + 1))}<small>${LABELS.refTitle}</small></div></div></figure>`).join('')}</div>`;
  }

  const okOrList = (ok, good, miss, note) => (ok ? `<p class="zm-ok">${good}</p>`
    : `<ul class="zm-misslist">${miss.map(i => `<li class="zm-ko">${gloss(note(i))}</li>`).join('')}</ul>`);

  function criterionDetail(key, ev) {
    const c = state.concl;
    if (key === 'particles') {
      return okOrList(ev.particles, CHECK.particlesGood, ev.particleMiss, particleNote) + pairsHTML() +
        `<p class="zm-muted">${gloss(EXPLAIN.particles)} ${gloss(EXPLAIN.model)}</p>`;
    }
    if (key === 'arrangement') {
      return okOrList(ev.arrangement, CHECK.arrangeGood, ev.arrangeMiss, arrangeNote) + pairsHTML() +
        `<ul class="zm-plainlist">${IDX.map(i => `<li><strong>${LABELS.prepName(i + 1)}</strong> · ${gloss(EXPLAIN.arrange[arrangeKey(i)])}</li>`).join('')}</ul>`;
    }
    if (key === 'notebook') {
      return okOrList(ev.notebook, CHECK.notesGood, ev.noteMiss, noteRight) +
        `<ul class="zm-plainlist">${IDX.map(i => `<li><strong>${LABELS.prepName(i + 1)}</strong> · ${gloss(EXPLAIN.preps[prepId(i)])}</li>`).join('')}</ul>`;
    }
    if (key === 'preparations') {
      return IDX.map(i => (ev.answerMiss.includes(i)
        ? `<p class="zm-ko">${CHECK.answerWrong} <strong>${gloss(rightAnswer(i))}</strong></p>`
        : `<p class="zm-ok">${CHECK.answerOk} ${gloss(rightAnswer(i))}</p>`) +
        `<p><strong>${LABELS.verdictRow(i + 1)}</strong> · ` +
        `${ev.vMiss.includes(i) ? `<span class="zm-ko">${CHECK.verdictWrong(ev.should[i])}</span>` : `<span class="zm-ok">${CHECK.verdictOk(c.v[i])}</span>`}</p>`).join('') +
        `<p class="zm-q-head">${CHECK.yourHyps}</p><ol>${hypTexts().map(t => `<li>${gloss(t)}</li>`).join('')}</ol>` +
        (ev.should.includes('rejected') ? `<p class="zm-muted">${CHECK.rejectedNote}</p>` : '');
    }
    return (ev.rule ? `<p class="zm-ok">${CHECK.ruleGood}</p>` : '') +
      `<ul class="zm-plainlist">${runKinds().map(k => {
        const right = LABELS.rule[k](LABELS.ruleWords[RULE_RIGHT[k]]);
        return ev.ruleMiss.includes(k) ? `<li class="zm-ko">${CHECK.answerWrong} <strong>${gloss(right)}</strong></li>` : `<li>${gloss(right)}</li>`;
      }).join('')}</ul>` +
      `<p class="zm-muted">${gloss(EXPLAIN.rule)}</p>`;
  }

  const hypTexts = () => IDX.map(i => LABELS.hypText(nameOf(i), state.hyp[i] ? LABELS.kinds[state.hyp[i]] : '—'));

  function renderCheck() {
    const ev = evaluate();
    const score = CRITERIA.filter(k => ev[k]).length;
    const rows = CRITERIA.map(k => `<button type="button" class="zm-crit ${ev[k] ? 'is-ok' : 'is-ko'} ${state.selected === k ? 'is-selected' : ''}" data-crit="${k}">` +
      `<span class="zm-crit-text"><strong>${LABELS.criteria[k]}</strong><small>${LABELS.criteriaSub[k]}</small></span>` +
      `<span class="zm-crit-mark" aria-label="${ev[k] ? LABELS.markCorrect : LABELS.markIncorrect}">${ev[k] ? '✓' : '✗'}</span></button>`).join('');

    lab.body.innerHTML = `<div class="zm-check">` +
      `<div class="zm-check-left">` +
        `<div class="lab-score"><span class="lab-score-num">${score}<small> / ${CRITERIA.length}</small></span><span class="lab-score-label">${LABELS.scoreLabel}</span></div>` +
        `<div class="zm-crit-list">${rows}</div>` +
        `<div class="zm-reminder">${questionsHTML()}</div>` +
      `</div>` +
      `<div class="zm-check-detail" aria-live="polite"><h3>${LABELS.criteria[state.selected]}</h3>${criterionDetail(state.selected, ev)}</div>` +
      `</div>`;

    $$('[data-crit]').forEach(btn => btn.addEventListener('click', () => {
      state.selected = btn.dataset.crit;
      renderCheck();
    }));
    lab.fillSpace($('.zm-check-detail'));
    lab.checkFooter();
  }

  /* ===== Rapport imprimable : contenu des 7 sections de la fiche outil FO3
     (en-tête, numérotation et mise en page : cadre commun) =====
     Les erreurs passent par mark() (lab-engine.js) : œil nu, lames, carnet,
     réponses, jugements, règle. */
  const plainText = text => String(text).replace(/\[([^\]|]+)(?:\|[^\]]+)?\]/g, '$1');

  function buildReport(mark) {
    const R = LABELS.report;
    const ev = evaluate();
    const c = state.concl;
    const word = (text, ok, note) => (ok ? text : mark(text, plainText(note)));

    const modelCell = i => {
      const svg = slideSVG(state.models[i], 'zm-report-slide', LABELS.slideTitle(i + 1));
      const notes = [];
      if (ev.particleMiss.includes(i)) notes.push(plainText(particleNote(i)));
      if (ev.arrangeMiss.includes(i)) notes.push(plainText(arrangeNote(i)));
      return notes.length ? mark(svg, notes.join(' '), { box: true }) : svg;
    };
    const seenCell = i => (state.seen[i] ? word(LABELS.seenNote[state.seen[i]], state.seen[i] === seenOf(i), `${CHECK.answerWrong} ${LABELS.seenNote[seenOf(i)]}.`) : '—');
    const cell = (text, wrong, i) => (wrong ? mark(text, plainText(`${noteRight(i)} ${EXPLAIN.preps[prepId(i)]}`), { box: true }) : text);

    const obs = `<table class="zm-report-table"><caption>${R.modelsCaption}</caption>` +
      `<tr><th></th><th>${R.lookHead}</th><th>${LABELS.readingTitle}</th><th>${LABELS.yourModel}</th></tr>` +
      IDX.map(i => `<tr><th>${LABELS.prepName(i + 1)}<br>${plainText(nameOf(i))}</th><td>${seenCell(i)}</td>` +
        `<td>${plainText(readingText(i))}</td><td>${modelCell(i)}</td></tr>`).join('') +
      `</table>`;
    const notes = `<table class="zm-report-table"><caption>${LABELS.notebookTitle}</caption>` +
      `<tr><th></th><th>${LABELS.typesHead}</th><th>${LABELS.kindHead}</th><th>${LABELS.mixHead}</th><th>${LABELS.solventHead}</th><th>${LABELS.soluteHead}</th></tr>` +
      IDX.map(i => {
        const n = state.notes[i], e = noteErrors(i);
        return `<tr><th>${LABELS.prepName(i + 1)}</th><td>${cell(n.n || '—', e.n, i)}</td>` +
          `<td>${cell(n.kind ? LABELS.noteKinds[n.kind] : '—', e.kind, i)}</td>` +
          `<td>${cell(n.mix ? LABELS.mixWords[n.mix] : '—', e.mix, i)}</td>` +
          `<td>${cell(n.solvent ? LABELS.ingredients[n.solvent] : '—', e.solution, i)}</td>` +
          `<td>${cell(n.solute ? soluteLabel(n.solute) : '—', e.solution, i)}</td></tr>`;
      }).join('') + `</table>`;

    const answers = IDX.map(i => {
      const note = `${CHECK.answerWrong} ${rightAnswer(i)}`;
      return `<p>${LABELS.answer(plainText(nameOf(i)),
        c.kind[i] ? word(LABELS.kinds[c.kind[i]], c.kind[i] === prepOf(i).kind, note) : '—',
        c.n[i] ? word(c.n[i], Number(c.n[i]) === typesOf(i).length, note) : '—')}</p>`;
    }).join('');
    const verdicts = `<ul>${IDX.map(i => `<li>${R.verdict(LABELS.verdictRow(i + 1), c.v[i] ? word(LABELS[c.v[i]], c.v[i] === ev.should[i], CHECK.verdictWrong(ev.should[i])) : '—')}</li>`).join('')}</ul>`;
    const rule = `<p>${plainText(LABELS.ruleIntro)}</p><ul>${runKinds().map(k => `<li>${LABELS.rule[k](c.rule[k]
      ? word(LABELS.ruleWords[c.rule[k]], c.rule[k] === RULE_RIGHT[k], `${CHECK.answerWrong} ${LABELS.rule[k](LABELS.ruleWords[RULE_RIGHT[k]])}`) : '—')}</li>`).join('')}</ul>`;

    const hyp = `<ol>${hypTexts().map(t => `<li>${plainText(t)}</li>`).join('')}</ol>` +
      (state.because.trim() ? `<p>${R.because}: ${escapeHtml(state.because.trim())}</p>` : '');
    const correction = CRITERIA.map(k => `<tr><th>${LABELS.criteria[k]}</th><td class="${ev[k] ? 'ok' : 'ko'}">${ev[k] ? '✓' : '✗'}</td></tr>`).join('');

    return {
      title: R.title,
      sections: [
        `<p>${plainText(LABELS.bigQuestion)}</p><ol>${IDX.map(i => `<li>${plainText(LABELS.subQuestion(nameOf(i)))}</li>`).join('')}</ol>`,
        hyp,
        `<p>${R.materials}</p>`,
        `<ol>${R.procedure.map(s => `<li>${s}</li>`).join('')}</ol>`,
        obs,
        notes + `<p>${R.refCompared}</p>`,
        answers + verdicts + rule
      ],
      correction: `<p><strong>${R.score(CRITERIA.filter(k => ev[k]).length)}</strong></p><table class="zm-report-corr">${correction}</table>`
    };
  }

  const validPoints = pts => Array.isArray(pts) && pts.every(p => p && PARTICLES[p.t] && typeof p.x === 'number' && typeof p.y === 'number');
  const two = a => Array.isArray(a) && a.length === 2;

  lab = LabEngine.create({
    id: 'zoom',
    // Page d'accueil (Mission, voir lab-engine.js) : toujours la même, rien du tirage.
    briefing: () => ({
      heading: LABELS.briefTitle,
      intro: gloss(LABELS.briefTask),
      questionTitle: LABELS.yourQuestion,
      questions: [LABELS.bigQuestion].map(gloss),
      steps: LABELS.briefSteps.map((text, i) => ({ text: gloss(text), detail: gloss(LABELS.briefDetails[i]), pics: [null, [{ html: ingredientSVG('water') }], null][i] })),
      checks: Object.values(LABELS.criteria)
    }),
    title: LABELS.title,
    glossary: GLOSSARY,
    reset,
    stepComplete,
    lockReason,
    isStarted: () => !!(state.hyp[0] || state.hyp[1] || state.started),
    render: { 1: renderPredict, 2: renderExperiment, 3: renderConclude, 4: renderCheck },
    report: buildReport,
    version: 2,
    save: () => ({ run, state }),
    load(data) {
      const r = data.run, s = data.state;
      if (!r || !two(r.preps) || !r.preps.every(id => PREPS[id]) || typeof r.seed !== 'number' ||
        !s || !two(s.hyp) || !two(s.poured) || !s.poured.every(Array.isArray) || !two(s.mixed) || !two(s.seen) || !two(s.zoomed) ||
        !two(s.models) || !s.models.every(validPoints) || !two(s.compared) || !two(s.notes) || !s.notes.every(n => n && typeof n === 'object') ||
        !s.concl || !two(s.concl.kind) || !two(s.concl.n) || !two(s.concl.v) || !s.concl.rule) throw new Error('labProgress');
      run = r;
      state = s;
      if (state.tab !== 0 && state.tab !== 1) state.tab = 0;
      stepperDone = null;
      captionKey = null;
      justZoomed = false;
      justMixed = false;
    },
    summary() {
      const ev = evaluate();
      const criteria = {};
      CRITERIA.forEach(k => { criteria[k] = ev[k]; });
      return {
        score: CRITERIA.filter(k => ev[k]).length,
        total: CRITERIA.length,
        criteria,
        labels: LABELS.criteria, // noms des critères, pour le tableau de bord
        details: {
          preps: `${run.preps[0]}-${run.preps[1]}`,
          hypothesis: `${state.hyp[0] || '-'}-${state.hyp[1] || '-'}`
        }
      };
    }
  });
})();
