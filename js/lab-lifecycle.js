/* ===== Labo virtuel « From the Earth and back » (chem1) : le cycle de vie d'un objet =====

   Simulation propre à ce labo, commune aux deux filières ; ses textes sont
   dans le dossier du chapitre, un fichier par langue (lab-lifecycle.en.js,
   lab-lifecycle.nl.js). Le cadre commun (modale, barre d'étapes, verrous,
   traduction, objet en main, rapport imprimé) est dans lab-engine.js.
   Ordre de chargement : moteur, textes, ce fichier.

   Les deux labos réels du chapitre ont déjà leur version virtuelle (Under
   our feet, Metal detectives) : ce labo part du cours (partie 4 : cycle de
   vie, mission 5, exercices 3 et 4, TAKING / GIVING BACK, les 3 R). C'est une
   expérience sur un modèle : un objet fait le tour de son cycle de vie
   (une année scolaire, ou les 6 ans du secondaire pour un objet qui dure),
   de trois façons (jeter, recycler, réutiliser), et quatre compteurs se
   remplissent étape par étape. Réutiliser, c'est toujours le même objet
   qui sert à nouveau (lavé, réparé, de seconde main), jamais un autre objet.

   Les chiffres sont des ordres de grandeur réels, arrondis (1 unit
   d'énergie = 1 MJ), par objet :
     - boîte à tartines en aluminium (200 g) : environ 4,5 kg de bauxite
       par kg d'aluminium ; aluminium neuf vers 170 MJ/kg et 12 kg de
       CO2/kg ; recycler l'aluminium économise environ 95 % de l'énergie
       (Institut international de l'aluminium) ; une boîte neuve par année
       scolaire, ou la même réparée pendant 6 ans ;
     - smartphone : quelques dizaines de kg de roche extraite pour ses
       métaux (cuivre, or, cobalt…) ; environ 60 kg de CO2 et 800 MJ pour
       le produire, dont les trois quarts pour la fabrication (puces,
       écran, batterie) ; le recyclage récupère une partie des métaux mais
       ne refait pas les puces ; un smartphone reconditionné ne demande
       qu'une batterie neuve, la remise en état et le transport ;
     - casserole en inox (1,2 kg) : minerai de fer, chrome et nickel, environ
       4 kg par kg d'acier ; inox neuf vers 60 MJ/kg et 5 kg de CO2/kg ;
       l'acier se recycle au four électrique pour environ un tiers de
       l'énergie ; réparée ou de seconde main, presque rien à faire ;
     - bouteille en verre (300 g) : sable, calcaire et soude, 1,2 kg par kg
       de verre ; fondre le verre vers 15 MJ/kg ; le calcin (verre recyclé)
       économise environ 25 % de l'énergie de fusion ; une bouteille
       consignée sert environ 25 fois (lavage et retour en camion) ;
     - T-shirt en coton (200 g) : environ 50 MJ et 4 kg de CO2 pour le
       fabriquer (culture, filature, tissage, teinture, couture) ; les fibres
       recyclées remplacent la moitié du coton neuf ; un T-shirt de seconde
       main ne demande que le tri, le lavage et le transport.
   Le modèle ne compte pas l'usage quand il est le même pour les trois
   façons (boire, porter, cuisiner) ; il compte le lavage d'une bouteille
   consignée ou d'un T-shirt de seconde main. Chaque total tombe sur une ligne de sa jauge (la
   plus grande étape absorbe l'arrondi) : l'élève peut le lire. Dans tous
   les cas : réutiliser < recycler < jeter, sur les quatre compteurs.
   L'étape qui consomme le plus d'énergie quand on jette (question 2) dépend
   de l'objet : l'extraction pour les métaux (boîte à tartines, casserole),
   la fabrication pour le smartphone, le verre et le T-shirt.

   Tirés au sort : l'objet (boîte à tartines, smartphone, casserole,
   bouteilles de jus, T-shirts), sa quantité, l'ordre des six cartes du
   voyage, le compteur du graphique en colonnes.

   Images (planche Gemini, dossier assets/ du chapitre) : les cinq objets et
   les étapes du cycle ; l'étape « use » montre l'objet lui-même.

   Déroulé :
     1. Predict    — question 1 : classer les trois façons, de la meilleure
                     à la pire pour la planète (+ « why » libre) ; question
                     2 : l'étape qui consomme le plus d'énergie quand on jette
     2. Experiment — a) le voyage : poser chaque carte (lettre en main) sur
                     son étape du cycle de vie ; b) les trois façons : le
                     modèle tourne, les quatre jauges se remplissent ;
                     l'élève lit et note les totaux ; c) le graphique en
                     colonnes d'un compteur (FO4)
     3. Conclude   — le classement, la justification (l'étape évitée),
                     l'étape la plus gourmande (lue sur la barre d'énergie
                     de « jeter »), le jugement des deux hypothèses
     4. Check      — 6 vérifications : voyage, carnet, graphique, question 1,
                     question 2, hypothèses ; rapport (FO3) */

(function () {
  'use strict';

  const { escapeHtml, shuffle, reduceMotion } = LabEngine.util;

  // Cadre commun, créé en fin de fichier (LabEngine.create).
  let lab;
  const $ = sel => lab.$(sel);
  const $$ = sel => lab.$$(sel);
  const gloss = text => lab.gloss(text);

  /* ===== Textes =====
     Dans le dossier du chapitre, un fichier par langue (lab-lifecycle.en.js,
     lab-lifecycle.nl.js), chargé avant celui-ci. */
  const {
    labels: LABELS, glossary: GLOSSARY, explanations: EXPLAIN, check: CHECK
  } = LabEngine.textFor('lifecycle');

  /* ===== Le modèle ===== */
  const STEPS = ['extraction', 'manufacturing', 'distribution', 'use', 'disposal', 'recycling'];
  const WAYS = ['throw', 'recycle', 'reuse'];
  const COUNTERS = ['raw', 'energy', 'co2', 'waste'];
  const TAKING = ['raw', 'energy'];
  const STEP_COLORS = {
    extraction: '#9a6b4f', manufacturing: '#7e62b8', distribution: '#4a90d9',
    use: '#2a9d8f', disposal: '#8d97a3', recycling: '#5aa86a'
  };
  // Une contribution : matière première (kg), énergie (units = MJ), CO2 (kg), déchets (kg).
  const v = (raw, energy, co2, waste) => ({ raw: raw || 0, energy: energy || 0, co2: co2 || 0, waste: waste || 0 });

  /* Par objet : les quantités possibles pour une année, l'échelle de chaque
     jauge [pas du quadrillage, maximum, pas des nombres], ce que coûte un objet à chaque
     étape, la part de chaque étape quand on recycle, et la réutilisation
     (q : nombre d'usages dans l'année). */
  const OBJECTS = {
    lunchbox: {
      qty: [6],
      scale: { raw: [0.5, 6, 1], energy: [10, 300, 50], co2: [1, 20, 5], waste: [0.25, 1.5, 0.5] },
      item: {
        extraction: v(0.9, 34, 2.4), manufacturing: v(0, 6, 0.4), distribution: v(0, 1, 0.08),
        disposal: v(0, 0.05, 0.01, 0.2), recycling: v(0, 2, 0.15)
      },
      recycle: { extraction: 0.3, manufacturing: 1, distribution: 1, recycling: 0.8, disposal: 0.2 },
      // La même boîte pendant 6 ans : faite une fois, ses fermoirs réparés.
      reuse: () => ({ extraction: v(0.9, 34, 2.4), manufacturing: v(0, 8, 0.55), distribution: v(0, 1, 0.08) })
    },
    phone: {
      qty: [2, 3],
      scale: { raw: [5, 130, 20], energy: [100, 2500, 500], co2: [5, 200, 50], waste: [0.1, 0.8, 0.2] },
      item: {
        extraction: v(40, 150, 10), manufacturing: v(0, 600, 45), distribution: v(0, 30, 3),
        disposal: v(0, 0.1, 0.05, 0.2), recycling: v(0, 5, 0.4)
      },
      recycle: { extraction: 0.5, manufacturing: 1, distribution: 1, recycling: 1, disposal: 0.2 },
      // Reconditionné : une batterie neuve, la remise en état, le transport.
      reuse: q => ({ extraction: v(1 * q, 10 * q, 0.8 * q), manufacturing: v(0, 30 * q, 2 * q), distribution: v(0, 5 * q, 0.4 * q) })
    },
    pan: {
      qty: [2, 3],
      scale: { raw: [1, 16, 2], energy: [10, 300, 50], co2: [1, 24, 4], waste: [0.25, 4, 1] },
      item: {
        extraction: v(5, 70, 6), manufacturing: v(0, 15, 1), distribution: v(0, 3, 0.2),
        disposal: v(0, 0.1, 0.02, 1.2), recycling: v(0, 8, 0.6)
      },
      recycle: { extraction: 0.3, manufacturing: 1, distribution: 1, recycling: 0.9, disposal: 0.1 },
      // Réparée (un manche neuf) ou de seconde main : rien à extraire.
      reuse: q => ({ manufacturing: v(0, 2 * q, 0.15 * q), distribution: v(0, 1 * q, 0.08 * q) })
    },
    glass: {
      qty: [80, 100, 120],
      scale: { raw: [2, 50, 10], energy: [20, 700, 100], co2: [2, 60, 10], waste: [2, 40, 10] },
      item: {
        extraction: v(0.36, 0.3, 0.03), manufacturing: v(0, 4.5, 0.35), distribution: v(0, 0.6, 0.05),
        disposal: v(0, 0.05, 0.01, 0.3), recycling: v(0, 0.2, 0.015)
      },
      recycle: { extraction: 0.2, manufacturing: 0.75, distribution: 1, recycling: 0.9, disposal: 0.1 },
      // Une bouteille consignée sert 25 fois : lavée, et ramenée en camion.
      reuse: q => {
        const b = Math.ceil(q / 25);
        return { extraction: v(0.36 * b, 0.3 * b, 0.03 * b), manufacturing: v(0, 4.5 * b, 0.35 * b), distribution: v(0, 1 * q, 0.08 * q), use: v(0, 1 * q, 0.06 * q) };
      }
    },
    tshirts: {
      qty: [8, 10, 12],
      scale: { raw: [0.25, 4, 1], energy: [20, 700, 100], co2: [2, 60, 10], waste: [0.25, 3, 0.5] },
      item: {
        extraction: v(0.25, 10, 1), manufacturing: v(0, 35, 2.5), distribution: v(0, 4, 0.3),
        disposal: v(0, 0.2, 0.3, 0.2), recycling: v(0, 2, 0.1)
      },
      recycle: { extraction: 0.5, manufacturing: 0.8, distribution: 1, recycling: 0.8, disposal: 0.2 },
      // Seconde main : rien à cultiver ni à fabriquer ; tri, lavage, transport.
      reuse: q => ({ distribution: v(0, 1 * q, 0.08 * q), use: v(0, 1 * q, 0.05 * q) })
    }
  };
  const OBJECT_KEYS = Object.keys(OBJECTS);

  // Le chemin de l'objet sur le cycle, pour chaque façon (les étapes sans
  // rien à compter sont sautées, sauf l'usage).
  const ROUTES = {
    throw: ['extraction', 'manufacturing', 'distribution', 'use', 'disposal'],
    recycle: ['extraction', 'manufacturing', 'distribution', 'use', 'recycling', 'disposal'],
    reuse: ['extraction', 'manufacturing', 'distribution', 'use']
  };
  const RIGHT_RANK = ['reuse', 'recycle', 'throw'];
  const AVOID = ['make', 'transport', 'use', 'bin'];
  // Question 2 : les étapes du chemin « jeter », parmi lesquelles choisir.
  const BIG_STEPS = ROUTES.throw;

  const pickOne = arr => arr[Math.floor(Math.random() * arr.length)];
  const r3 = x => Math.round(x * 1000) / 1000;
  const r2 = x => Math.round(x * 100) / 100;

  // Ce que coûte chaque étape, pour une façon : { étape: { compteur: valeur } }.
  function segmentsOf(objKey, way, q) {
    const o = OBJECTS[objKey];
    const out = {};
    if (way === 'reuse') {
      const r = o.reuse(q);
      Object.keys(r).forEach(s => { out[s] = r[s]; });
    } else {
      const f = way === 'throw' ? { extraction: 1, manufacturing: 1, distribution: 1, disposal: 1 } : o.recycle;
      Object.keys(f).forEach(s => {
        const it = o.item[s];
        out[s] = v(it.raw * f[s] * q, it.energy * f[s] * q, it.co2 * f[s] * q, it.waste * f[s] * q);
      });
    }
    // Le total de chaque compteur tombe sur une ligne de la jauge : la plus
    // grande étape absorbe l'arrondi.
    const totals = {};
    COUNTERS.forEach(c => {
      const g = o.scale[c][0];
      const t = Object.keys(out).reduce((n, s) => n + out[s][c], 0);
      const target = t > 1e-9 ? Math.max(g, Math.round(t / g) * g) : 0;
      if (t > 1e-9) {
        const big = Object.keys(out).reduce((a, s) => (out[s][c] > out[a][c] ? s : a), Object.keys(out)[0]);
        out[big][c] += target - t;
      }
      Object.keys(out).forEach(s => { out[s][c] = r3(Math.max(0, out[s][c])); });
      totals[c] = r2(target);
    });
    return { segs: out, totals };
  }

  function draw() {
    const obj = pickOne(OBJECT_KEYS);
    const qty = pickOne(OBJECTS[obj].qty);
    const ways = {};
    WAYS.forEach(w => { ways[w] = segmentsOf(obj, w, qty); });
    return { obj, qty, ways, chart: pickOne(COUNTERS) };
  }

  let run;      // tirage : l'objet, sa quantité, les compteurs des trois façons
  let state;    // travail de l'élève

  function reset() {
    run = draw();
    const notes = {}, chart = {}, ran = {};
    WAYS.forEach(w => { notes[w] = { raw: null, energy: null, co2: null, waste: null }; chart[w] = null; ran[w] = false; });
    state = {
      hyp: [null, null, null],          // classement : la meilleure façon d'abord
      hypStep: null,                    // question 2 : l'étape qui consomme le plus d'énergie
      because: '',
      view: 'journey',                  // 'journey', 'ways' ou 'graph'
      order: shuffle(STEPS.slice()),    // l'ordre des cartes du voyage (lettres A à F)
      journey: {},                      // carte (son étape juste) → étape choisie par l'élève
      way: 'throw',                     // façon affichée
      ran,
      notes,
      chart,
      concl: { rank: [null, null, null], avoid: null, step: null, verdict: [null, null] },
      selected: 'journey'
    };
    running = false;
    stepperDone = null;
  }

  /* --- Ce que l'élève a fait --- */
  const scaleOf = c => OBJECTS[run.obj].scale[c];
  const truthOf = (w, c) => run.ways[w].totals[c];
  const letterOf = card => 'ABCDEF'[state.order.indexOf(card)];
  const placedCount = () => STEPS.filter(card => state.journey[card]).length;
  const journeyDone = () => placedCount() === STEPS.length;
  const cardOn = step => STEPS.find(card => state.journey[card] === step) || null;
  const allRan = () => WAYS.every(w => state.ran[w]);
  const notesFilled = () => WAYS.reduce((n, w) => n + COUNTERS.filter(c => state.notes[w][c] != null).length, 0);
  const NOTES_TOTAL = WAYS.length * COUNTERS.length;
  const notesDone = () => notesFilled() === NOTES_TOTAL;
  const chartDone = () => WAYS.every(w => state.chart[w] != null);
  const wayName = w => LABELS.ways[w].name;
  const wayLower = w => LABELS.ways[w].lower;     // dans une phrase
  const num = x => LABELS.num(r2(x));
  const counterHead = c => `${LABELS.counters[c].name} (${LABELS.counters[c].unit})`;
  const started = () => WAYS.some(w => state.ran[w]);
  // Question 2 : l'étape qui consomme le plus d'énergie quand on jette.
  function bigStep() {
    const segs = run.ways.throw.segs;
    return BIG_STEPS.reduce((a, s) => ((segs[s] ? segs[s].energy : 0) > (segs[a] ? segs[a].energy : 0) ? s : a), BIG_STEPS[0]);
  }
  const stepIn = s => LABELS.stepIn[s];     // dans une phrase

  // Saisie d'un nombre : point ou virgule, deux décimales au plus.
  const parseNum = raw => (/^\d{1,4}([.,]\d{1,2})?$/.test(raw) ? Number(raw.replace(',', '.')) : null);

  /* ===== Dessins =====
     Les objets et les étapes du cycle : images du dossier assets/ du
     chapitre (planche Gemini). L'étape « use » montre l'objet lui-même. */
  const imgSrc = key => `assets/lab-lc-${key}.png`;
  const stepImg = s => imgSrc(s === 'use' ? run.obj : s);
  const objectIcon = cls => `<img class="lc-icon lc-img ${cls || ''}" src="${imgSrc(run.obj)}" alt="" draggable="false">`;
  const stepIcon = (s, cls) => `<img class="lc-icon lc-img ${cls || ''}" src="${stepImg(s)}" alt="" draggable="false">`;
  const svgImage = (src, x, y, size) => `<image href="${src}" x="${x}" y="${y}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/>`;

  // Un nom d'étape long passe sur deux lignes (coupé à l'espace le plus proche du milieu).
  function twoLines(text) {
    if (text.length <= 14 || !text.includes(' ')) return [text];
    const mid = text.length / 2;
    let cut = -1;
    for (let i = 0; i < text.length; i++) if (text[i] === ' ' && (cut < 0 || Math.abs(i - mid) < Math.abs(cut - mid))) cut = i;
    return [text.slice(0, cut), text.slice(cut + 1)];
  }

  const WAY_ICONS = {
    throw: `<path d="M9,12 h22 l-2,24 a2,2 0 0 1 -2,2 h-14 a2,2 0 0 1 -2,-2 Z" fill="#8d97a3"/><rect x="7" y="8" width="26" height="4" rx="1.5" fill="#5d6773"/>` +
      `<rect x="16" y="5" width="8" height="3.4" rx="1.2" fill="#5d6773"/><path d="M15,17 v16 M20,17 v16 M25,17 v16" stroke="#c9d1da" stroke-width="1.6" stroke-linecap="round"/>`,
    recycle: `<g fill="none" stroke="#2f8f5b" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">` +
      `<path d="M14,13 L20,5 L26,13"/><path d="M29,16 L33,26 L27,33"/><path d="M11,33 L6,25 L10,17"/>` +
      `<path d="M20,5 C26,5 30,9 32,14 M33,26 C30,32 25,34 20,34 M6,25 C5,19 7,14 12,11"/></g>`,
    reuse: `<g fill="none" stroke="#4a6fd9" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">` +
      `<path d="M30,14 A12,12 0 1 0 32,24"/><path d="M24,11 L31,13.6 L30.4,6"/></g><circle cx="20" cy="20" r="4" fill="#4a6fd9"/>`
  };
  const wayIcon = (w, cls) => `<svg class="lc-icon ${cls || ''}" viewBox="0 0 40 40" aria-hidden="true" focusable="false">${WAY_ICONS[w]}</svg>`;

  /* --- Le cycle de vie : 760 × 470, six étapes en cercle (schéma du cours) ---
     La même géométrie sert au plateau du voyage (cases HTML posées dessus)
     et à la scène des trois façons (SVG). */
  const RING_W = 760, RING_H = 470;
  const BOX = { w: 214, h: 104 };
  const BOX_POS = {
    extraction: [273, 6], manufacturing: [536, 96], distribution: [536, 262],
    use: [273, 360], disposal: [10, 262], recycling: [10, 96]
  };
  const ARROWS = {
    'extraction>manufacturing': 'M487,40 Q610,40 628,96',
    'manufacturing>distribution': 'M643,200 L643,262',
    'distribution>use': 'M628,366 Q610,412 487,412',
    'use>disposal': 'M273,412 Q150,412 132,366',
    'use>recycling': 'M300,360 Q262,262 168,200',
    'recycling>manufacturing': 'M224,152 Q380,196 536,152'
  };
  const LOOP = 'M352,360 C330,316 430,316 408,360';   // réutiliser : l'usage recommence

  // Une pointe de flèche par couleur : chemin suivi, reste du cycle, réutilisation.
  const HEADS = { on: '#2f3b48', off: '#b8c0c9', loop: '#4a6fd9' };

  function arrowsSVG(on, uid) {
    const head = k => `url(#lc-head-${k}-${uid})`;
    return `<defs>${Object.keys(HEADS).map(k => `<marker id="lc-head-${k}-${uid}" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">` +
      `<path d="M0,0 L10,5 L0,10 Z" fill="${HEADS[k]}"/></marker>`).join('')}</defs>` +
      Object.keys(ARROWS).map(k => {
        const lit = on.includes(k);
        return `<path d="${ARROWS[k]}" fill="none" stroke="${lit ? HEADS.on : HEADS.off}" stroke-width="${lit ? 2.6 : 1.8}" marker-end="${head(lit ? 'on' : 'off')}"/>`;
      }).join('') +
      (on.includes('loop') ? `<path d="${LOOP}" fill="none" stroke="${HEADS.loop}" stroke-width="2.6" marker-end="${head('loop')}"/>` : '');
  }

  // Les flèches suivies par une façon.
  function arrowsOf(w) {
    const r = routeOf(w);
    const out = [];
    for (let i = 1; i < r.length; i++) {
      const k = `${r[i - 1]}>${r[i]}`;
      if (ARROWS[k]) out.push(k);
    }
    if (w === 'recycle') out.push('recycling>manufacturing', 'use>disposal');
    if (w === 'reuse') out.push('loop');
    return out.filter((k, i) => out.indexOf(k) === i);
  }

  // Le chemin d'une façon : les étapes qui comptent quelque chose, et l'usage.
  function routeOf(w) {
    const segs = run.ways[w].segs;
    const order = w === 'recycle' ? ['extraction', 'manufacturing', 'distribution', 'use', 'recycling', 'disposal'] : ROUTES[w];
    return order.filter(s => s === 'use' || (segs[s] && COUNTERS.some(c => segs[s][c] > 0)));
  }

  /* --- Les jauges (à droite) : une barre horizontale par compteur ---
     Les segments sont colorés par étape du cycle ; le total tombe sur une
     ligne du quadrillage. upto : { route, i, frac } pendant que le modèle
     tourne (étapes déjà faites, et la part de celle en cours). */
  const GW = 410, GROW = 60, GX0 = 10, GX1 = 400;

  function gaugesSVG(w, upto) {
    const segs = w && (state.ran[w] || upto) ? run.ways[w].segs : null;
    let out = '';
    COUNTERS.forEach((c, k) => {
      const [g, max, every] = scaleOf(c);
      const y = k * GROW;
      const px = val => GX0 + (val / max) * (GX1 - GX0);
      out += `<text x="${GX0}" y="${y + 13}" class="lc-g-title"><tspan class="lc-g-group">${TAKING.includes(c) ? LABELS.taking : LABELS.givingBack}</tspan> · ${escapeHtml(counterHead(c))}</text>`;
      out += `<rect x="${GX0}" y="${y + 19}" width="${GX1 - GX0}" height="18" rx="3" fill="#f3f5f8" stroke="#c9d1da"/>`;
      if (segs) {
        let x = 0;
        const route = upto ? upto.route : routeOf(w);
        route.forEach((s, i) => {
          if (!segs[s] || !segs[s][c]) return;
          if (upto && i > upto.i) return;
          const part = upto && i === upto.i ? segs[s][c] * upto.frac : segs[s][c];
          if (part <= 0) return;
          out += `<rect x="${px(x).toFixed(2)}" y="${y + 19}" width="${(px(x + part) - px(x)).toFixed(2)}" height="18" fill="${STEP_COLORS[s]}"/>`;
          x += part;
        });
      }
      for (let t = 0; t <= max + 1e-9; t += g) {
        const label = Math.abs(t / every - Math.round(t / every)) < 1e-9;
        out += `<line x1="${px(t).toFixed(2)}" x2="${px(t).toFixed(2)}" y1="${y + (label ? 19 : 31)}" y2="${y + 41}" stroke="${label ? '#5d6773' : '#8d97a3'}" stroke-width="${label ? 1 : 0.8}"/>`;
        if (label) out += `<text x="${px(t).toFixed(2)}" y="${y + 52}" text-anchor="middle" class="lc-g-tick">${num(t)}</text>`;
      }
    });
    return `<svg class="lab-svg lc-gauges-svg" viewBox="0 0 ${GW} ${COUNTERS.length * GROW}" role="img" aria-label="${escapeHtml(LABELS.gaugesTitle)}">${out}</svg>`;
  }

  /* --- La scène des trois façons : le cycle, le chemin de la façon affichée,
     l'objet qui voyage --- */
  function ringSVG(w) {
    const route = w ? routeOf(w) : [];
    const on = w ? arrowsOf(w) : [];
    let out = `<rect x="0" y="0" width="${RING_W}" height="${RING_H}" fill="#ffffff"/>` + arrowsSVG(on, 'ways');
    STEPS.forEach(s => {
      const [x, y] = BOX_POS[s];
      const off = w && !route.includes(s);
      // L'image à gauche, le nom centré dans la place qui reste (deux lignes s'il est long).
      const lines = twoLines(LABELS.steps[s]);
      const tx = x + 62 + (BOX.w - 62) / 2;
      const ty = y + BOX.h / 2 + 5 - (lines.length - 1) * 9;
      out += `<g id="lc-box-${s}" class="lc-step ${off ? 'is-off' : ''}">` +
        `<rect x="${x}" y="${y + 20}" width="${BOX.w}" height="${BOX.h - 40}" rx="14" fill="#ffffff" stroke="${STEP_COLORS[s]}" stroke-width="2"/>` +
        `<rect x="${x}" y="${y + 20}" width="10" height="${BOX.h - 40}" rx="4" fill="${STEP_COLORS[s]}"/>` +
        svgImage(stepImg(s), x + 15, y + 29, 46) +
        `<text x="${tx}" y="${ty}" text-anchor="middle" class="lc-step-name">` +
        lines.map((l, i) => `<tspan x="${tx}" dy="${i ? 18 : 0}">${escapeHtml(l)}</tspan>`).join('') + `</text></g>`;
    });
    if (w === 'reuse') out += `<text x="380" y="308" text-anchor="middle" class="lc-loop-label">${escapeHtml(LABELS.objects[run.obj].loop)}</text>`;
    out += `<text x="${RING_W / 2}" y="${RING_H / 2 + 22}" text-anchor="middle" class="lc-center-label">${escapeHtml(LABELS.objects[run.obj].many(run.qty))}</text>`;
    const [mx, my] = MOVER_HOME;
    out += `<g id="lc-mover" transform="translate(${mx} ${my})">${svgImage(imgSrc(run.obj), -2, -4, 48)}</g>`;
    return `<svg class="lab-svg lc-ring" viewBox="0 0 ${RING_W} ${RING_H}" role="img" aria-label="${escapeHtml(LABELS.ringTitle)}">${out}</svg>`;
  }

  // L'objet qui voyage : au centre au départ, puis en haut à droite de chaque étape.
  const MOVER_HOME = [RING_W / 2 - 22, RING_H / 2 - 48];
  const moverAt = s => [BOX_POS[s][0] + BOX.w - 44, BOX_POS[s][1] - 4];

  /* --- Le graphique en colonnes (FO4) ---
     Un compteur (tiré au sort), une colonne par façon. L'élève touche la
     hauteur de chaque colonne : elle s'arrête sur une ligne du quadrillage. */
  const C = { W: 560, H: 380, L: 70, R: 20, T: 44, B: 62 };
  const colX = i => C.L + 40 + i * 150;
  const COL_W = 100;

  function chartSVG(values, o) {
    const c = run.chart;
    const [g, max, every] = scaleOf(c);
    const cy = val => C.T + (1 - val / max) * (C.H - C.T - C.B);
    let out = `<rect x="0" y="0" width="${C.W}" height="${C.H}" fill="#ffffff"/>` +
      `<text x="${C.W / 2}" y="22" text-anchor="middle" class="lc-c-title">${escapeHtml(LABELS.chartTitle(LABELS.counters[c].name, LABELS.objects[run.obj].many(run.qty)))}</text>`;
    for (let t = 0; t <= max + 1e-9; t += g) {
      const label = Math.abs(t / every - Math.round(t / every)) < 1e-9;
      out += `<line x1="${C.L}" x2="${C.W - C.R}" y1="${cy(t).toFixed(1)}" y2="${cy(t).toFixed(1)}" stroke="${label ? '#d9dee4' : '#eef1f4'}" stroke-width="1"/>`;
      if (label) out += `<text x="${C.L - 8}" y="${(cy(t) + 4).toFixed(1)}" text-anchor="end" class="lc-c-tick">${num(t)}</text>`;
    }
    out += `<line x1="${C.L}" x2="${C.W - C.R}" y1="${cy(0)}" y2="${cy(0)}" stroke="#5d6773" stroke-width="1.4"/>` +
      `<line x1="${C.L}" x2="${C.L}" y1="${C.T - 6}" y2="${cy(0)}" stroke="#5d6773" stroke-width="1.4"/>` +
      `<text transform="translate(16 ${(C.T + cy(0)) / 2}) rotate(-90)" text-anchor="middle" class="lc-c-axis">${escapeHtml(counterHead(c))}</text>`;
    WAYS.forEach((w, i) => {
      const x = colX(i);
      const val = values[w];
      if (val != null) out += `<rect x="${x}" y="${cy(val).toFixed(1)}" width="${COL_W}" height="${(cy(0) - cy(val)).toFixed(1)}" fill="${o.bad && o.bad.includes(w) ? '#e8a3a3' : '#7fa6d8'}" stroke="#2f5f9e" stroke-width="1.2"/>` +
        `<text x="${x + COL_W / 2}" y="${(cy(val) - 6).toFixed(1)}" text-anchor="middle" class="lc-c-val">${num(val)}</text>`;
      out += `<text x="${x + COL_W / 2}" y="${cy(0) + 20}" text-anchor="middle" class="lc-c-way">${escapeHtml(wayName(w))}</text>`;
      if (o.live) {
        out += `<rect class="lc-c-hit ${val == null ? 'is-empty' : ''}" data-col="${w}" x="${x - 10}" y="${C.T - 6}" width="${COL_W + 20}" height="${cy(0) - C.T + 12}" rx="8" ` +
          `fill="transparent" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${val == null ? 0 : val}" aria-label="${escapeHtml(LABELS.columnAria(wayName(w)))}"/>`;
      }
    });
    return `<svg class="lab-svg lc-chart" viewBox="0 0 ${C.W} ${C.H}" role="img" aria-label="${escapeHtml(LABELS.chartTitle(LABELS.counters[c].name, LABELS.objects[run.obj].many(run.qty)))}">${out}</svg>`;
  }

  /* --- L'énergie de « jeter », étape par étape (conclusion, correction) :
     la barre du compteur et sa légende, sans nombres --- */
  function energyBarHTML() {
    const segs = run.ways.throw.segs;
    const total = run.ways.throw.totals.energy;
    const steps = ROUTES.throw.filter(s => segs[s] && segs[s].energy > 0);
    let x = 0;
    const rects = steps.map(s => {
      const wd = (segs[s].energy / total) * 400;
      const r = `<rect x="${x.toFixed(2)}" y="0" width="${wd.toFixed(2)}" height="18" fill="${STEP_COLORS[s]}"/>`;
      x += wd;
      return r;
    }).join('');
    return `<div class="lc-ebar"><p class="lc-ebar-title">${wayIcon('throw')}<span>${gloss(LABELS.energyBar(wayName('throw')))}</span></p>` +
      `<svg class="lc-ebar-svg" viewBox="0 0 400 18" preserveAspectRatio="none" aria-hidden="true" focusable="false">${rects}</svg>` +
      `<ul class="lc-legend">${ROUTES.throw.map(s => `<li><span class="lc-swatch" style="background:${STEP_COLORS[s]}"></span>${escapeHtml(LABELS.steps[s])}</li>`).join('')}</ul></div>`;
  }

  /* ===== Étapes complètes (progression stricte, voir lab-engine.js) =====
     1 : le classement et l'étape ; 2 : le voyage, les trois façons, le
     carnet et le graphique ; 3 : toutes les réponses. */
  const hypDone = () => state.hyp.every(Boolean) && !!state.hypStep;

  function stepComplete(n) {
    if (n === 1) return hypDone();
    if (n === 2) return journeyDone() && allRan() && notesDone() && chartDone();
    return conclusionsComplete();
  }

  function lockReason(n) {
    if (n === 1) return LABELS.lockHypothesis;
    if (n === 2) {
      if (!journeyDone()) return LABELS.lockJourney(STEPS.length - placedCount());
      if (!allRan()) return LABELS.lockWays;
      if (!notesDone()) return LABELS.lockNotes(NOTES_TOTAL - notesFilled());
      return LABELS.lockChart;
    }
    return lab.L.missingConclusions;
  }

  // Le classement en chips : trois rangs, une façon par rang.
  function rankHTML(rank, field, missing) {
    return `<div class="lc-rank ${missing && !rank.every(Boolean) ? 'lab-is-missing' : ''}">` + [0, 1, 2].map(i =>
      `<div class="lc-rank-row"><span class="lc-rank-place">${LABELS.places[i]}</span><span class="lc-rank-chips">` +
      WAYS.map(w => `<button type="button" class="lab-choice lc-chip ${rank[i] === w ? 'is-selected' : ''}" data-${field}="${i}" data-val="${w}" aria-pressed="${rank[i] === w}">${wayIcon(w)}<span>${wayName(w)}</span></button>`).join('') +
      `</span></div>`).join('') + `</div>`;
  }

  // Question 2 : une étape à choisir parmi celles du chemin « jeter ».
  function stepChipsHTML(value, field, missing) {
    return `<div class="lc-steps ${missing && !value ? 'lab-is-missing' : ''}">` + BIG_STEPS.map(s =>
      `<button type="button" class="lab-choice lc-chip lc-step-chip ${value === s ? 'is-selected' : ''}" data-${field}="${s}" aria-pressed="${value === s}">` +
      `${stepIcon(s)}<span>${LABELS.steps[s]}</span></button>`).join('') + `</div>`;
  }

  // Une façon choisie à un rang quitte les autres rangs.
  function setRank(rank, i, w) {
    const j = rank.indexOf(w);
    if (j >= 0) rank[j] = null;
    rank[i] = rank[i] === w && j === i ? null : w;
  }

  // En petit (onglet des trois façons) : l'objet, sa durée et la seule façon affichée.
  function objectCardHTML(compact) {
    const o = LABELS.objects[run.obj];
    const ways = compact ? [state.way] : WAYS;
    return `<div class="lc-object ${compact ? 'is-compact' : ''}">${objectIcon('is-big')}<div>` +
      `<p class="lc-object-text">${gloss(compact ? `${o.many(run.qty)} ${o.period}` : o.scenario(run.qty))}</p>` +
      `<ul class="lc-ways">${ways.map(w => `<li>${wayIcon(w)}<span><strong>${wayName(w)}</strong> · ${gloss(o.ways[w])}</span></li>`).join('')}</ul>` +
      `</div></div>`;
  }

  /* ===== Étape 1 : hypothèse ===== */
  function renderPredict() {
    const show = lab.state.showMissing;
    lab.body.innerHTML = `<div class="lc-predict">` +
      `<div class="lc-question-card"><p class="lc-kicker">${LABELS.yourQuestions}</p>` +
        `<p class="lc-big-q"><span class="lc-qnum">1</span>${gloss(LABELS.question)}</p>` +
        `<p class="lc-big-q"><span class="lc-qnum">2</span>${gloss(LABELS.question2)}</p>` +
        objectCardHTML(false) + `</div>` +
      `<div class="lc-hyp-card"><p class="lc-kicker">${LABELS.hypothesisTitle}</p>` +
        `<p class="lc-hyp-text"><span class="lc-qnum">1</span>${gloss(LABELS.hypIntro)}</p>` + rankHTML(state.hyp, 'hyp', show) +
        `<p class="lc-hyp-text"><span class="lc-qnum">2</span>${gloss(LABELS.hypIntro2)}</p>` + stepChipsHTML(state.hypStep, 'hypstep', show) +
        `<label class="lc-because"><span>${LABELS.because}</span>` +
        `<input type="text" class="lab-input lc-because-input" maxlength="160" placeholder="${LABELS.becausePlaceholder}" value="${escapeHtml(state.because)}" autocomplete="off"></label>` +
      `</div></div>`;

    const after = () => {
      if (lab.state.showMissing && hypDone()) lab.state.showMissing = false;
      renderPredict();
      lab.renderStepper();
    };
    $$('[data-hyp]').forEach(btn => btn.addEventListener('click', () => {
      setRank(state.hyp, Number(btn.dataset.hyp), btn.dataset.val);
      after();
    }));
    $$('[data-hypstep]').forEach(btn => btn.addEventListener('click', () => {
      state.hypStep = state.hypStep === btn.dataset.hypstep ? null : btn.dataset.hypstep;
      after();
    }));
    const because = $('.lc-because-input');
    because.addEventListener('input', e => { state.because = e.target.value; });
    // Hypothèse figée dès que le modèle a tourné une première fois.
    if (started()) {
      $$('[data-hyp], [data-hypstep]').forEach(btn => lab.setLock(btn, LABELS.lockHypothesisFixed, { icon: false }));
      because.readOnly = true;
      lab.setLock(because, LABELS.lockHypothesisFixed);
    }

    const ready = hypDone();
    const info = lab.state.showMissing && !ready ? lab.footerInfo(LABELS.lockHypothesis, true)
      : lab.footerInfo(ready ? LABELS.hypothesisReady : LABELS.hypothesisPending);
    lab.setFooter(info + `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-next>${LABELS.toJourney} →</button></div>`);
    const next = $('[data-next]');
    next.addEventListener('click', () => lab.goToStep(2));
    lab.setLock(next, ready ? null : LABELS.lockHypothesis, { missing: true, key: 'next' });
  }

  /* ===== Étape 2 : le voyage, les trois façons, le graphique ===== */
  let running = false;      // le modèle tourne
  let stepperDone = null;
  const VIEWS = ['journey', 'ways', 'graph'];

  function renderExperiment() {
    lab.release();
    if (lab.state.showMissing && !lab.isFrozen()) {
      if (!journeyDone()) state.view = 'journey';
      else if (!allRan() || !notesDone()) state.view = 'ways';
    }
    const v = state.view;
    lab.body.innerHTML = `<div class="lc-run is-${v}">` +
      `<section class="lc-main">` +
        `<div class="lc-topbar">${tabsHTML()}${v === 'ways' ? waysPillsHTML() : ''}</div>` +
        (v === 'journey' ? boardHTML() : v === 'ways' ? waysHTML() : graphHTML()) +
      `</section>` +
      `<section class="lc-side">${v === 'journey' ? cardsHTML() : v === 'ways' ? waysSideHTML() : graphSideHTML()}</section>` +
      `</div>`;
    bindTabs();
    if (v === 'journey') bindJourney();
    else if (v === 'ways') { bindWays(); bindNotebook(); }
    else bindGraph();
    setCaption(defaultCaption());
    renderRunFooter();
  }

  const viewOpen = v => (v === 'journey' ? true : v === 'ways' ? journeyDone() : notesDone() && allRan());
  const viewLock = v => (v === 'ways' ? LABELS.lockJourney(STEPS.length - placedCount()) : v === 'graph' ? (allRan() ? LABELS.lockNotes(NOTES_TOTAL - notesFilled()) : LABELS.lockWays) : null);

  function tabsHTML() {
    return `<div class="lc-tabs" role="tablist">` + VIEWS.map((v, i) =>
      `<button type="button" role="tab" class="lc-tab ${state.view === v ? 'is-on' : ''}" data-view="${v}" data-lab-look aria-selected="${state.view === v}">` +
      `<span class="lc-tab-num">${i + 1}</span><span>${LABELS.tabs[v]}</span></button>`).join('') + `</div>`;
  }

  function bindTabs() {
    $$('[data-view]').forEach(btn => {
      const v = btn.dataset.view;
      if (v !== state.view) lab.setLock(btn, running ? LABELS.lockRunning : viewOpen(v) ? null : viewLock(v), { missing: !running, key: `tab-${v}` });
      btn.addEventListener('click', () => {
        if (state.view === v) return;
        state.view = v;
        renderExperiment();
      });
    });
  }

  /* --- a) Le voyage ---
     Six cartes (lettres A à F, dans un ordre tiré au sort), chacune un
     moment de la vie de l'objet. Chaque lettre se prend en main et se pose
     sur une étape libre du cycle. Rien n'est corrigé ici : les erreurs
     ressortent au Check et dans le rapport. */
  function letterHTML(card, extra) {
    return `<button type="button" class="lc-letter ${extra || ''}" data-card="${card}" aria-label="${escapeHtml(LABELS.cardAria(letterOf(card)))}">${letterOf(card)}</button>`;
  }

  function boardHTML() {
    const boxes = STEPS.map(s => {
      const card = cardOn(s);
      const [x, y] = BOX_POS[s];
      return `<div class="lc-box ${card ? 'is-full' : ''}" data-box="${s}" style="left:${x}px;top:${y}px;width:${BOX.w}px;height:${BOX.h}px;--lc-step:${STEP_COLORS[s]}">` +
        `<span class="lc-box-name">${stepIcon(s, 'lc-box-img')}<span>${gloss(LABELS.steps[s])}</span></span>` +
        (card ? `<span class="lc-box-card">${letterHTML(card, 'is-placed')}<span class="lc-box-text">${gloss(LABELS.objects[run.obj].events[card])}</span></span>`
          : `<span class="lc-box-empty">${LABELS.dropHere}</span>`) +
        `</div>`;
    }).join('');
    return `<div class="lc-board" style="width:${RING_W}px;height:${RING_H}px">` +
      `<svg class="lc-board-arrows" viewBox="0 0 ${RING_W} ${RING_H}" aria-hidden="true" focusable="false">${arrowsSVG(Object.keys(ARROWS), 'board')}</svg>` +
      `<div class="lc-board-center">${objectIcon('is-big')}<span>${gloss(LABELS.objects[run.obj].many(run.qty))}</span></div>` +
      boxes + `</div>` +
      `<div class="lc-controls"><p class="lab-caption lc-caption" data-caption aria-live="polite"></p></div>`;
  }

  function cardsHTML() {
    const rows = state.order.map(card => `<li class="lc-card-row ${state.journey[card] ? 'is-placed' : ''}">` +
      (state.journey[card] ? `<span class="lc-letter is-gone" aria-hidden="true">${letterOf(card)}</span>` : letterHTML(card, 'is-tray')) +
      `<span class="lc-card-text">${gloss(LABELS.objects[run.obj].events[card])}</span>` +
      // Où l'élève l'a posée (sans dire si c'est juste : c'est au Check).
      (state.journey[card] ? `<span class="lc-card-where">→ ${escapeHtml(LABELS.steps[state.journey[card]])}</span>` : '') + `</li>`).join('');
    return `<h3 class="lab-panel-title">${LABELS.cardsTitle}</h3>` +
      `<p class="lc-side-hint">${gloss(LABELS.cardsHint)}</p>` +
      `<ul class="lc-card-list" data-tray>${rows}</ul>` +
      `<p class="lc-count">${LABELS.placedCount(placedCount(), STEPS.length)}</p>`;
  }

  function bindJourney() {
    $$('[data-card]').forEach(el => {
      const card = el.dataset.card;
      lab.makeDraggable(el, {
        hold: true,
        ghost: () => `<div class="lc-ghost"><span class="lc-letter">${letterOf(card)}</span><span>${escapeHtml(plainText(LABELS.objects[run.obj].events[card]))}</span></div>`,
        targets: () => $$('.lc-box:not(.is-full)').concat(state.journey[card] ? [$('[data-tray]')] : []),
        onHold: on => setCaption(on ? LABELS.captionHold(letterOf(card)) : defaultCaption()),
        onDrop: target => {
          if (target.dataset.box) state.journey[card] = target.dataset.box;
          else delete state.journey[card];
          if (lab.state.showMissing && journeyDone()) lab.state.showMissing = false;
          renderExperiment();
          if (journeyDone()) setCaption(LABELS.captionJourneyDone);
          lab.renderStepper();
          lab.save();
        }
      });
    });
  }

  /* --- b) Les trois façons ---
     À gauche, le cycle et le chemin de la façon choisie ; à droite, l'objet,
     les quatre jauges et le carnet. Chaque façon se lance (et se rejoue) à
     part ; l'élève lit les jauges et note les totaux. */
  function waysPillsHTML() {
    return `<div class="lc-pills" role="group">` + WAYS.map(w =>
      `<button type="button" class="lc-pill ${state.way === w ? 'is-on' : ''}" data-way="${w}" data-lab-look aria-pressed="${state.way === w}">` +
      `${wayIcon(w)}<span>${wayName(w)}</span>${state.ran[w] ? '<span class="lc-pill-done" aria-hidden="true">✓</span>' : ''}</button>`).join('') + `</div>`;
  }

  function waysHTML() {
    const w = state.way;
    return `<div class="lab-scene-wrap lc-stage">${ringSVG(w)}</div>` +
      `<div class="lc-controls"><p class="lab-caption lc-caption" data-caption aria-live="polite"></p>` +
      `<button type="button" class="lab-btn lab-btn-primary lc-runbtn" data-run>${state.ran[w] ? `↻ ${LABELS.runAgain}` : `▶ ${LABELS.runWay(wayName(w))}`}</button></div>`;
  }

  function waysSideHTML() {
    return objectCardHTML(true) +
      `<div class="lc-gauges"><p class="lc-gauges-title">${wayIcon(state.way)}<span>${gloss(LABELS.gaugesFor(wayName(state.way)))}</span></p>` +
      `<div data-gauges>${gaugesSVG(state.way)}</div></div>` +
      notebookHTML();
  }

  function bindWays() {
    $$('[data-way]').forEach(b => {
      lab.setLock(b, running ? LABELS.lockRunning : null, { icon: false });
      b.addEventListener('click', () => {
        if (state.way === b.dataset.way) return;
        state.way = b.dataset.way;
        renderExperiment();
      });
    });
    const btn = $('[data-run]');
    btn.addEventListener('click', () => runWay(state.way));
    lab.setLock(btn, running ? LABELS.lockRunning : null);
  }

  /* Le modèle tourne : l'objet passe d'étape en étape (1,1 s chacune), les
     jauges se remplissent. Rien n'est enregistré avant la fin (fermé en
     route : rien). */
  const STEP_MS = 1100;

  function runWay(w) {
    if (running) return;
    running = true;
    renderExperiment();
    const route = routeOf(w);
    const gauges = $('[data-gauges]');
    const mover = $('#lc-mover');
    const token = lab.newScene();
    let t = 0;
    let last = performance.now();
    const place = (i, frac) => {
      const to = moverAt(route[i]);
      const from = i ? moverAt(route[i - 1]) : MOVER_HOME;
      const k = Math.min(1, frac / 0.4);
      const x = from[0] + (to[0] - from[0]) * k, y = from[1] + (to[1] - from[1]) * k;
      if (mover) mover.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      STEPS.forEach(s => {
        const box = $(`#lc-box-${s}`);
        if (!box) return;
        box.classList.toggle('is-active', s === route[i]);
        box.classList.toggle('is-done', route.indexOf(s) >= 0 && route.indexOf(s) < i);
      });
    };
    const frame = now => {
      if (!lab.isScene(token)) { running = false; return; }
      const dt = Math.max(0, Math.min(64, now - last));
      last = now;
      t = Math.min(route.length, t + dt / (reduceMotion ? STEP_MS / 6 : STEP_MS));
      const i = Math.min(route.length - 1, Math.floor(t));
      const frac = t >= route.length ? 1 : t - i;
      place(i, frac);
      if (gauges) gauges.innerHTML = gaugesSVG(w, { route, i, frac });
      setCaption(LABELS.captionStep(LABELS.steps[route[i]]));
      if (t < route.length) { requestAnimationFrame(frame); return; }
      running = false;
      state.ran[w] = true;
      renderExperiment();
      setCaption(LABELS.captionRan(wayName(w)));
      lab.renderStepper();
      lab.save();
    };
    requestAnimationFrame(frame);
  }

  /* --- Le carnet : les totaux lus sur les jauges, une ligne par façon --- */
  function notebookHTML() {
    const show = lab.state.showMissing;
    const rows = WAYS.map(w => `<tr><th scope="row"><span class="lc-nb-way">${wayIcon(w)}<span>${wayName(w)}</span></span></th>` +
      COUNTERS.map(c => {
        const val = state.notes[w][c];
        return `<td class="${show && val == null ? 'lab-is-missing' : ''}"><input type="text" inputmode="decimal" class="lc-num-input" data-num="${w}|${c}" ` +
          `value="${val == null ? '' : escapeHtml(num(val))}" maxlength="7" autocomplete="off" spellcheck="false" aria-label="${escapeHtml(LABELS.numAria(wayName(w), counterHead(c)))}"></td>`;
      }).join('') + `</tr>`).join('');
    return `<div class="lc-notebook"><h3 class="lab-panel-title">${LABELS.notebookTitle}</h3>` +
      `<table class="lc-nb-table"><thead><tr><th scope="col"></th>${COUNTERS.map(c => `<th scope="col">${LABELS.counters[c].name}<small>${LABELS.counters[c].unit}</small></th>`).join('')}</tr></thead>` +
      `<tbody>${rows}</tbody></table></div>`;
  }

  function bindNotebook() {
    $$('[data-num]').forEach(input => {
      const [w, c] = input.dataset.num.split('|');
      lab.setLock(input, running ? LABELS.lockRunning : state.ran[w] ? null : LABELS.lockRunFirst(wayName(w)));
      const read = final => {
        const raw = input.value.trim();
        const val = parseNum(raw);
        state.notes[w][c] = val;
        if (val != null) input.closest('td').classList.remove('lab-is-missing');
        if (final) {
          if (val != null) input.value = num(val);
          input.classList.toggle('is-invalid', val == null && raw !== '');
        }
        if (lab.state.showMissing && stepComplete(2)) lab.state.showMissing = false;
        updateRunFooter();
        lab.save();
      };
      input.addEventListener('input', () => { input.classList.remove('is-invalid'); read(false); });
      input.addEventListener('change', () => read(true));
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
    });
  }

  /* --- c) Le graphique en colonnes --- */
  function graphHTML() {
    return `<div class="lab-scene-wrap lc-chart-wrap">${chartSVG(state.chart, { live: true })}</div>` +
      `<div class="lc-controls"><p class="lab-caption lc-caption" data-caption aria-live="polite"></p></div>`;
  }

  function graphSideHTML() {
    const c = run.chart;
    return `<h3 class="lab-panel-title">${LABELS.graphTitle}</h3>` +
      `<p class="lc-side-hint">${gloss(LABELS.graphHint(LABELS.counters[c].name))}</p>` +
      `<table class="lab-table lc-recap"><thead><tr><th scope="col"></th>${COUNTERS.map(k => `<th scope="col" class="${k === c ? 'is-chart' : ''}">${LABELS.counters[k].name}<small>${LABELS.counters[k].unit}</small></th>`).join('')}</tr></thead><tbody>` +
      WAYS.map(w => `<tr><th scope="row"><span class="lc-nb-way">${wayIcon(w)}<span>${wayName(w)}</span></span></th>` +
        COUNTERS.map(k => `<td class="${k === c ? 'is-chart' : ''}">${state.notes[w][k] == null ? '—' : num(state.notes[w][k])}</td>`).join('') + `</tr>`).join('') +
      `</tbody></table>`;
  }

  function bindGraph() {
    const [g, max] = scaleOf(run.chart);
    $$('[data-col]').forEach(hit => {
      const w = hit.dataset.col;
      const set = val => {
        state.chart[w] = Math.max(0, Math.min(max, r2(Math.round(val / g) * g)));
        if (lab.state.showMissing && stepComplete(2)) lab.state.showMissing = false;
        renderExperiment();
        const again = $(`[data-col="${w}"]`);
        if (again) again.focus({ preventScroll: true });
        lab.save();
      };
      hit.addEventListener('click', e => {
        const svg = hit.ownerSVGElement;
        if (!svg || !svg.getScreenCTM) return;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const p = pt.matrixTransform(svg.getScreenCTM().inverse());
        const y0 = C.H - C.B;
        set(((y0 - p.y) / (y0 - C.T)) * max);
      });
      hit.addEventListener('keydown', e => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        e.preventDefault();
        set((state.chart[w] || 0) + (e.key === 'ArrowUp' ? g : -g));
      });
    });
  }

  function defaultCaption() {
    if (state.view === 'journey') return journeyDone() ? LABELS.captionJourneyDone : LABELS.captionJourney;
    if (state.view === 'graph') return chartDone() ? LABELS.captionChartDone : LABELS.captionChart;
    if (running) return LABELS.captionStep(LABELS.steps.extraction);
    return state.ran[state.way] ? LABELS.captionRan(wayName(state.way)) : LABELS.captionWay(wayName(state.way));
  }

  function setCaption(text, warn) {
    const c = $('[data-caption]');
    if (!c) return;
    c.innerHTML = `<span>${gloss(text)}</span>`;
    c.classList.toggle('is-warning', !!warn);
  }

  // Pied de page : vers l'onglet suivant, puis vers la conclusion.
  function nextView() {
    if (state.view === 'journey' && !stepComplete(2)) return 'ways';
    if (state.view === 'ways' && !stepComplete(2)) return 'graph';
    return null;
  }

  function renderRunFooter() {
    lab.setFooter(lab.footerInfo('') + `<div class="lab-footer-actions">` +
      `<button type="button" class="lab-btn lab-btn-primary" data-next></button></div>`);
    $('[data-next]').addEventListener('click', () => {
      const v = nextView();
      if (v) { state.view = v; renderExperiment(); } else lab.goToStep(3);
    });
    updateRunFooter();
  }

  function updateRunFooter() {
    const complete = stepComplete(2);
    const warn = lab.state.showMissing && !complete;
    const info = $('.lab-footer .lab-footer-info');
    if (info) {
      info.textContent = warn ? lockReason(2) : LABELS.runInfo(placedCount(), STEPS.length, notesFilled(), NOTES_TOTAL);
      info.classList.toggle('is-warning', warn);
    }
    const next = $('[data-next]');
    if (next) {
      const v = nextView();
      next.textContent = `${v ? LABELS.toView[v] : LABELS.toConclude} →`;
      const reason = running ? LABELS.lockRunning : v ? (viewOpen(v) ? null : viewLock(v)) : (complete ? null : lockReason(2));
      lab.setLock(next, reason, { missing: !running, key: 'next' });
    }
    if (complete !== stepperDone) { stepperDone = complete; lab.renderStepper(); }
  }

  /* ===== Étape 3 : conclusion =====
     À gauche, les résultats : le carnet et le graphique ; à droite, le
     classement, la justification (l'étape évitée), puis le jugement de
     l'hypothèse. */
  function conclusionParts() {
    const c = state.concl;
    return { rank: c.rank.every(Boolean), avoid: !!c.avoid, step: !!c.step, verdict: c.verdict.every(Boolean) };
  }

  function conclusionsComplete() {
    return Object.values(conclusionParts()).every(Boolean);
  }

  function recapTableHTML() {
    return `<table class="lab-table lc-recap"><thead><tr><th scope="col"></th>${COUNTERS.map(c => `<th scope="col">${LABELS.counters[c].name}<small>${LABELS.counters[c].unit}</small></th>`).join('')}</tr></thead><tbody>` +
      WAYS.map(w => `<tr><th scope="row"><span class="lc-nb-way">${wayIcon(w)}<span>${wayName(w)}</span></span></th>` +
        COUNTERS.map(c => `<td>${state.notes[w][c] == null ? '—' : num(state.notes[w][c])}</td>`).join('') + `</tr>`).join('') +
      `</tbody></table>`;
  }

  function bindZoom() {
    const b = $('[data-zoom]');
    if (b) b.addEventListener('click', () => lab.openSheet(`<div class="lc-zoom-view">${chartSVG(state.chart, {})}</div>`, LABELS.graphTitle));
  }

  function renderConclude() {
    const c = state.concl;
    const parts = conclusionParts();
    const show = lab.state.showMissing;
    const miss = key => (show && !parts[key] ? 'lab-is-missing' : '');
    const best = c.rank[0] ? `<strong class="lc-best">${wayLower(c.rank[0])}</strong>` : `<span class="lc-blank">……</span>`;
    const avoidSel = `<select class="lab-select lc-select ${c.avoid ? 'is-filled' : ''} ${show && !c.avoid ? 'lab-is-missing' : ''}" data-avoid aria-label="${escapeHtml(LABELS.avoidAria)}">` +
      `<option value="" disabled ${c.avoid ? '' : 'selected'}>${LABELS.choose}</option>` +
      AVOID.map(k => `<option value="${k}" ${c.avoid === k ? 'selected' : ''}>${escapeHtml(LABELS.avoid[k])}</option>`).join('') + `</select>`;
    const stepSel = `<select class="lab-select lc-select ${c.step ? 'is-filled' : ''} ${show && !c.step ? 'lab-is-missing' : ''}" data-step aria-label="${escapeHtml(LABELS.stepAria)}">` +
      `<option value="" disabled ${c.step ? '' : 'selected'}>${LABELS.choose}</option>` +
      BIG_STEPS.map(s => `<option value="${s}" ${c.step === s ? 'selected' : ''}>${escapeHtml(stepIn(s))}</option>`).join('') + `</select>`;
    const verdictRow = i => `<div class="lc-verdict-row ${show && !c.verdict[i] ? 'lab-is-missing' : ''}"><span class="lc-q-text">${LABELS.verdictLine(i + 1)}</span>` +
      ['confirmed', 'rejected'].map(x => `<button type="button" class="lab-choice lc-chip ${c.verdict[i] === x ? 'is-selected' : ''}" data-verdict="${i}" data-val="${x}" aria-pressed="${c.verdict[i] === x}">${LABELS[x]}</button>`).join('') + `</div>`;

    lab.body.innerHTML = `<div class="lc-conclude">` +
      `<section class="lc-results">` +
        `<h3 class="lab-panel-title">${LABELS.resultsTitle}</h3>` +
        `<p class="lc-results-object">${objectIcon()}<span>${gloss(LABELS.objects[run.obj].scenario(run.qty))}</span></p>` +
        recapTableHTML() + energyBarHTML() +
        `<button type="button" class="lc-zoom" data-zoom data-lab-look aria-label="${escapeHtml(LABELS.zoom)}">${chartSVG(state.chart, {})}</button>` +
      `</section>` +
      `<section class="lc-form">` +
        `<div class="lc-q ${miss('rank') || miss('avoid')}"><p class="lc-q-title"><span class="lc-qnum">1</span>${gloss(LABELS.question)}</p>` +
          `<p class="lc-q-text">${gloss(LABELS.conclRank)}</p>${rankHTML(c.rank, 'rank', false)}` +
          `<p class="lc-concl-line">${LABELS.conclWhy(best, avoidSel)}</p></div>` +
        `<div class="lc-q ${miss('step')}"><p class="lc-q-title"><span class="lc-qnum">2</span>${gloss(LABELS.question2)}</p>` +
          `<p class="lc-concl-line">${LABELS.conclStep(stepSel)}</p></div>` +
        `<div class="lc-q lc-verdicts">${verdictRow(0)}${verdictRow(1)}</div>` +
      `</section></div>`;

    bindZoom();
    $$('[data-rank]').forEach(btn => btn.addEventListener('click', () => {
      setRank(c.rank, Number(btn.dataset.rank), btn.dataset.val);
      afterConcl();
    }));
    $('[data-avoid]').addEventListener('change', e => { c.avoid = e.target.value || null; afterConcl(); });
    $('[data-step]').addEventListener('change', e => { c.step = e.target.value || null; afterConcl(); });
    $$('[data-verdict]').forEach(btn => btn.addEventListener('click', () => { c.verdict[Number(btn.dataset.verdict)] = btn.dataset.val; afterConcl(); }));

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
  }

  /* ===== Étape 4 : correction ===== */
  const CRITERIA = ['journey', 'notes', 'graph', 'answer', 'step', 'verdict'];
  const sameRank = (a, b) => a.every((x, i) => x === b[i]);

  function evaluate() {
    const c = state.concl;
    const journeyMiss = STEPS.filter(card => state.journey[card] !== card);
    const noteMiss = [];
    WAYS.forEach(w => COUNTERS.forEach(k => {
      const val = state.notes[w][k];
      if (val == null || Math.abs(val - truthOf(w, k)) > scaleOf(k)[0] + 1e-9) noteMiss.push({ w, c: k });
    }));
    // Une colonne juste : la valeur notée dans le carnet (même fausse), à une demi-ligne près.
    const g = scaleOf(run.chart)[0];
    const graphMiss = WAYS.filter(w => state.chart[w] == null || Math.abs(state.chart[w] - chartWant(w)) > g / 2 + 1e-9);
    const rankOk = sameRank(c.rank, RIGHT_RANK);
    const avoidOk = c.avoid === 'make';
    const big = bigStep();
    // Chaque hypothèse se juge contre la conclusion de l'élève (même fausse).
    const should = [
      state.hyp.every(Boolean) && sameRank(state.hyp, c.rank) ? 'confirmed' : 'rejected',
      state.hypStep && state.hypStep === c.step ? 'confirmed' : 'rejected'
    ];
    const verdictOk = [0, 1].map(i => c.verdict[i] === should[i]);
    return {
      journeyMiss, noteMiss, graphMiss, rankOk, avoidOk, big, should, verdictOk,
      notesGood: NOTES_TOTAL - noteMiss.length,
      journey: journeyMiss.length === 0,
      notes: noteMiss.length === 0,
      graph: graphMiss.length === 0,
      answer: rankOk && avoidOk,
      step: c.step === big,
      verdict: verdictOk.every(Boolean)
    };
  }

  // La hauteur attendue d'une colonne : la valeur du carnet (même fausse), sinon celle du modèle.
  const chartWant = w => (state.notes[w][run.chart] != null ? state.notes[w][run.chart] : truthOf(w, run.chart));
  const graphMissText = w => CHECK.graphWrong(wayName(w), state.chart[w] == null ? CHECK.nothing : num(state.chart[w]), num(chartWant(w)));

  const rankText = rank => LABELS.list(rank.map(w => (w ? wayLower(w) : '—')));
  const rightAnswer = () => `${LABELS.conclRankText(rankText(RIGHT_RANK))} ${LABELS.conclWhy(wayLower('reuse'), LABELS.avoid.make)}`;
  const rightStep = () => LABELS.conclStep(stepIn(bigStep()));

  // L'énergie de « jeter », étape par étape : les nombres du modèle.
  function stepTableHTML() {
    const segs = run.ways.throw.segs;
    return `<table class="lab-table lc-facts"><thead><tr><th scope="col">${CHECK.stepHead}</th><th scope="col">${LABELS.counters.energy.name}<small>${LABELS.counters.energy.unit}</small></th></tr></thead><tbody>` +
      BIG_STEPS.map(s => `<tr class="${s === bigStep() ? 'is-big' : ''}"><th scope="row"><span class="lc-nb-way">${stepIcon(s)}<span>${escapeHtml(LABELS.steps[s])}</span></span></th>` +
        `<td>${num(Math.round(segs[s] ? segs[s].energy : 0))}</td></tr>`).join('') + `</tbody></table>`;
  }

  function journeyMissText(card) {
    const at = state.journey[card];
    return CHECK.journeyWrong(letterOf(card), plainText(LABELS.objects[run.obj].events[card]), at ? LABELS.steps[at] : CHECK.nothing, LABELS.steps[card]);
  }

  function noteMissText(m) {
    const val = state.notes[m.w][m.c];
    return CHECK.readWrong(wayName(m.w), counterHead(m.c), val == null ? CHECK.nothing : num(val), num(truthOf(m.w, m.c)));
  }

  // Les faits : les totaux du modèle, et l'étape qui pèse le plus.
  function factsHTML() {
    return `<table class="lab-table lc-facts"><thead><tr><th scope="col"></th>${COUNTERS.map(c => `<th scope="col">${LABELS.counters[c].name}<small>${LABELS.counters[c].unit}</small></th>`).join('')}</tr></thead><tbody>` +
      WAYS.map(w => `<tr><th scope="row"><span class="lc-nb-way">${wayIcon(w)}<span>${wayName(w)}</span></span></th>` +
        COUNTERS.map(c => `<td>${num(truthOf(w, c))}</td>`).join('') + `</tr>`).join('') + `</tbody></table>`;
  }

  function criterionDetail(key, ev) {
    if (key === 'journey') {
      return (ev.journey ? `<p class="lc-ok">${CHECK.journeyAllGood}</p>` : `<ul class="lc-misslist">${ev.journeyMiss.map(card => `<li class="lc-ko">${gloss(journeyMissText(card))}</li>`).join('')}</ul>`) +
        `<p>${gloss(EXPLAIN.steps)}</p><p class="lc-muted">${gloss(EXPLAIN.arrows)}</p>`;
    }
    if (key === 'notes') {
      return `<p>${CHECK.notesScore(ev.notesGood, NOTES_TOTAL)}</p>` +
        (ev.notes ? `<p class="lc-ok">${CHECK.notesAllGood}</p>` : `<ul class="lc-misslist">${ev.noteMiss.map(m => `<li class="lc-ko">${gloss(noteMissText(m))}</li>`).join('')}</ul>`) +
        `<p class="lc-q-head">${LABELS.factsTitle}</p>${factsHTML()}<p class="lc-muted">${gloss(CHECK.readHow)}</p>`;
    }
    if (key === 'graph') {
      return (ev.graph ? `<p class="lc-ok">${CHECK.graphOk}</p>` : `<ul class="lc-misslist">${ev.graphMiss.map(w => `<li class="lc-ko">${gloss(graphMissText(w))}</li>`).join('')}</ul>`) +
        `<div class="lc-check-chart">${chartSVG(state.chart, { bad: ev.graphMiss })}</div><p class="lc-muted">${gloss(CHECK.graphHow)}</p>`;
    }
    if (key === 'answer') {
      return (ev.answer ? `<p class="lc-ok">${CHECK.answerOk} ${gloss(rightAnswer())}</p>` : `<p class="lc-ko">${CHECK.answerWrong} <strong>${gloss(rightAnswer())}</strong></p>`) +
        `<p>${gloss(EXPLAIN.reuse[run.obj])}</p><p>${gloss(EXPLAIN.recycle[run.obj])}</p><p class="lc-muted">${gloss(EXPLAIN.rs)}</p>`;
    }
    if (key === 'step') {
      return (ev.step ? `<p class="lc-ok">${CHECK.answerOk} ${gloss(rightStep())}</p>` : `<p class="lc-ko">${CHECK.answerWrong} <strong>${gloss(rightStep())}</strong></p>`) +
        `<p class="lc-q-head">${CHECK.stepFacts(wayName('throw'))}</p>${stepTableHTML()}` +
        `<p>${gloss(EXPLAIN.step[run.obj])}</p><p class="lc-muted">${gloss(CHECK.stepHow)}</p>`;
    }
    const c = state.concl;
    const hypLines = [LABELS.hypText(rankText(state.hyp)), LABELS.hypText2(state.hypStep ? stepIn(state.hypStep) : '—')];
    const conclLines = [LABELS.conclRankText(rankText(c.rank)), LABELS.conclStep(c.step ? stepIn(c.step) : '—')];
    return [0, 1].map(i => `<p class="lc-q-head">${CHECK.hypHead(i + 1)}</p>` +
      `<p><strong>${CHECK.yourHyp}</strong> ${gloss(hypLines[i])}</p>` +
      `<p><strong>${CHECK.yourConcl}</strong> ${gloss(conclLines[i])}</p>` +
      `<p class="${ev.verdictOk[i] ? 'lc-ok' : 'lc-ko'}">${ev.verdictOk[i] ? CHECK.verdictOk(c.verdict[i]) : CHECK.verdictWrong(ev.should[i])}</p>`).join('') +
      (ev.should.includes('rejected') ? `<p class="lc-muted">${CHECK.rejectedNote}</p>` : '');
  }

  function renderCheck() {
    const ev = evaluate();
    const score = CRITERIA.filter(k => ev[k]).length;
    const rows = CRITERIA.map(k => `<button type="button" class="lc-crit ${ev[k] ? 'is-ok' : 'is-ko'} ${state.selected === k ? 'is-selected' : ''}" data-crit="${k}">` +
      `<span class="lc-crit-text"><strong>${LABELS.criteria[k]}</strong><small>${LABELS.criteriaSub[k]}</small></span>` +
      `<span class="lc-crit-mark" aria-label="${ev[k] ? LABELS.markCorrect : LABELS.markIncorrect}">${ev[k] ? '✓' : '✗'}</span></button>`).join('');

    lab.body.innerHTML = `<div class="lc-check">` +
      `<div class="lc-check-left">` +
        `<div class="lab-score"><span class="lab-score-num">${score}<small> / ${CRITERIA.length}</small></span><span class="lab-score-label">${LABELS.scoreLabel}</span></div>` +
        `<div class="lc-crit-list">${rows}</div>` +
        `<div class="lc-reminder"><p class="lc-big-q"><span class="lc-qnum">1</span>${gloss(LABELS.question)}</p>` +
          `<p class="lc-big-q"><span class="lc-qnum">2</span>${gloss(LABELS.question2)}</p></div>` +
      `</div>` +
      `<div class="lc-check-detail" aria-live="polite"><h3>${LABELS.criteria[state.selected]}</h3>${criterionDetail(state.selected, ev)}</div>` +
      `</div>`;

    $$('[data-crit]').forEach(btn => btn.addEventListener('click', () => {
      state.selected = btn.dataset.crit;
      renderCheck();
    }));
    lab.fillSpace($('.lc-check-detail'));
    lab.checkFooter();
  }

  /* ===== Rapport imprimable : contenu des 7 sections de la fiche outil FO3
     (en-tête, numérotation et mise en page : cadre commun) =====
     Les erreurs passent par mark() (lab-engine.js) : carte posée sur une
     mauvaise étape, total mal lu, colonne fausse, classement, justification,
     jugement. Le graphique (titre, axes, unités : FO4) est dans les
     résultats. */
  function buildReport(mark) {
    const R = LABELS.report;
    const ev = evaluate();
    const c = state.concl;
    const o = LABELS.objects[run.obj];

    const journey = `<table class="lc-report-table"><caption>${R.journeyCaption}</caption>` +
      `<tr><th>${R.stepHead}</th><th>${R.eventHead}</th></tr>` +
      STEPS.map(s => {
        const card = cardOn(s);
        const text = card ? `${letterOf(card)}. ${plainText(o.events[card])}` : '—';
        return `<tr><th>${LABELS.steps[s]}</th><td>${card && card !== s ? mark(text, journeyMissText(card), { box: true }) : text}</td></tr>`;
      }).join('') + `</table>`;

    const missOf = (w, k) => ev.noteMiss.find(m => m.w === w && m.c === k);
    const notes = `<table class="lc-report-table"><caption>${R.notesCaption(o.period)}</caption>` +
      `<tr><th></th>${COUNTERS.map(k => `<th>${counterHead(k)}</th>`).join('')}</tr>` +
      WAYS.map(w => `<tr><th>${wayName(w)}</th>${COUNTERS.map(k => {
        const val = state.notes[w][k];
        const text = val == null ? '—' : num(val);
        const m = missOf(w, k);
        return `<td>${m ? mark(text, plainText(noteMissText(m)), { box: true }) : text}</td>`;
      }).join('')}</tr>`).join('') + `</table>`;

    const chartNote = ev.graphMiss.map(w => plainText(graphMissText(w))).join(' ');
    const chartTitle = `<p class="lc-report-graph-title">${ev.graph ? R.chartCaption : mark(R.chartCaption, `${chartNote} ${plainText(CHECK.graphHow)}`)}</p>`;
    const chart = `<div class="lc-report-graph">${chartTitle}${chartSVG(state.chart, {})}</div>`;

    // Interprétation : les totaux de l'élève, façon par façon.
    const interp = `<ul>${WAYS.map(w => `<li>${R.wayLine(wayName(w), ...COUNTERS.map(k => (state.notes[w][k] == null ? '—' : num(state.notes[w][k]))))}</li>`).join('')}</ul>`;
    // Conclusion : les choix de l'élève, chaque erreur marquée à sa place.
    const rankNote = `${CHECK.answerWrong} ${plainText(rightAnswer())}`;
    const rank = c.rank.every(Boolean) ? (ev.rankOk ? rankText(c.rank) : mark(rankText(c.rank), rankNote)) : '—';
    const avoid = c.avoid ? (ev.avoidOk ? LABELS.avoid[c.avoid] : mark(LABELS.avoid[c.avoid], `${rankNote} ${plainText(EXPLAIN.reuse[run.obj])}`)) : '—';
    const step = c.step ? (ev.step ? stepIn(c.step) : mark(stepIn(c.step), `${CHECK.answerWrong} ${plainText(rightStep())} ${plainText(EXPLAIN.step[run.obj])}`)) : '—';
    const verdict = i => (c.verdict[i] ? (ev.verdictOk[i] ? LABELS[c.verdict[i]] : mark(LABELS[c.verdict[i]], CHECK.verdictWrong(ev.should[i]))) : '—');
    const conclusion = `<p>1. ${LABELS.conclRankText(rank)} ${LABELS.conclWhy(c.rank[0] ? wayLower(c.rank[0]) : '—', avoid)}</p>` +
      `<p>2. ${LABELS.conclStep(step)}</p>` +
      `<p>${R.verdict(1, verdict(0))} ${R.verdict(2, verdict(1))}</p>`;

    const hyp = `<p>1. ${LABELS.hypText(rankText(state.hyp))}</p>` +
      `<p>2. ${LABELS.hypText2(state.hypStep ? stepIn(state.hypStep) : '—')}</p>` +
      (state.because.trim() ? `<p>${R.because}: ${escapeHtml(state.because.trim())}</p>` : '');

    const correction = CRITERIA.map(k => `<tr><th>${LABELS.criteria[k]}</th><td class="${ev[k] ? 'ok' : 'ko'}">${ev[k] ? '✓' : '✗'}</td></tr>`).join('');

    return {
      title: R.title,
      sections: [
        `<p>1. ${LABELS.question}</p><p>2. ${LABELS.question2}</p><p>${plainText(o.scenario(run.qty))}</p>`,
        hyp,
        `<p>${R.materials(plainText(o.many(run.qty)), o.period)}</p>`,
        `<ol>${R.procedure(LABELS.counters[run.chart].name).map(s => `<li>${s}</li>`).join('')}</ol>`,
        `<div class="lc-report-results">${journey}${notes}</div>${chart}`,
        interp,
        conclusion
      ],
      correction: `<p><strong>${R.score(CRITERIA.filter(k => ev[k]).length, CRITERIA.length)}</strong></p><table class="lc-report-corr">${correction}</table>`
    };
  }

  const plainText = text => String(text).replace(/\[([^\]|]+)(?:\|[^\]]+)?\]/g, '$1');

  lab = LabEngine.create({
    id: 'lifecycle',
    title: LABELS.title,
    glossary: GLOSSARY,
    reset,
    stepComplete,
    lockReason,
    isStarted: () => !!(state.hyp.some(Boolean) || placedCount()),
    render: { 1: renderPredict, 2: renderExperiment, 3: renderConclude, 4: renderCheck },
    report: buildReport,
    version: 2,
    save: () => ({ run, state }),
    // Ce qui ne vaut que pendant que le modèle tourne repart à zéro.
    load(data) {
      const r = data.run, s = data.state;
      if (!r || !OBJECTS[r.obj] || !r.ways || !WAYS.every(w => r.ways[w] && r.ways[w].totals && r.ways[w].segs) || !COUNTERS.includes(r.chart) ||
        !s || !Array.isArray(s.hyp) || !Array.isArray(s.order) || s.order.length !== STEPS.length || !s.journey || !s.notes || !s.chart || !s.ran ||
        !s.concl || !Array.isArray(s.concl.rank) || !Array.isArray(s.concl.verdict) || !('hypStep' in s)) throw new Error('labProgress');
      run = r;
      state = s;
      running = false;
      stepperDone = null;
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
          object: run.obj, quantity: run.qty, chart: run.chart,
          journeyRight: STEPS.length - ev.journeyMiss.length, notesRight: ev.notesGood, notes: NOTES_TOTAL,
          hypothesis: state.hyp.map(w => w || '-').join('-'), hypothesisStep: state.hypStep || '-'
        }
      };
    }
  });
})();
