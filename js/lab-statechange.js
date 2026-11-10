/* ===== Labo virtuel « Watch it change » (phys2) : palier et masse =====

   Simulation propre à ce labo, commune aux deux filières ; ses textes sont
   dans le dossier du chapitre, un fichier par langue
   (lab-statechange.en.js, lab-statechange.nl.js). Le cadre commun (modale,
   barre d'étapes, verrous, traduction, glisser-déposer, rapport imprimé)
   est dans lab-engine.js. Ordre de chargement : moteur, textes, ce fichier.

   Labo réel repris : la Mission 8 du cours (« The ice melting
   investigation » : glace pilée chauffée, température relevée chaque
   minute, masse avant et après). Ici le changement d'état est tiré au
   sort ; le cœur reste le palier et la conservation de la masse.

   Tiré au sort à chaque nouveau labo : une situation parmi cinq (l'eau sort
   plus souvent) — glace qui fond, eau qui gèle, eau qui bout, acide
   stéarique qui fond ou qui se solidifie —, puis la température de départ,
   la durée de chaque phase et la masse : deux élèves voisins n'ont pas le
   même tableau.

   Déroulé :
     1. Predict    — esquisser l'allure de la courbe (une flèche par
                     tronçon : avant, pendant, après le changement ; deux
                     tronçons pour l'ébullition) et parier sur la masse
     2. Experiment — fermer ou non le récipient (film étirable, ballon :
                     le labo n'en dit rien), le peser et noter la masse, le
                     poser sur le dispositif, y plonger le thermomètre ;
                     le chronomètre avance minute par minute : à chaque
                     arrêt, noter la température et l'état ; le graphique
                     se trace à partir du tableau ; à la fin, repeser.
                     L'élève peut recommencer la manipulation une fois.
     3. Conclude   — la température pendant le changement, sa valeur et
                     son nom ; la masse et le nombre de particules ; le
                     jugement de l'esquisse et du pari
     4. Check      — 5 vérifications : mesures, récipient fermé,
                     température, masse, jugement ; rapport (FO3) */

(function () {
  'use strict';

  const { escapeHtml, mulberry32, seedFrom, ease } = LabEngine.util;

  // Cadre commun, créé en fin de fichier (LabEngine.create).
  let lab;
  const $ = sel => lab.$(sel);
  const $$ = sel => lab.$$(sel);
  const gloss = text => lab.gloss(text);
  const plain = text => String(text).replace(/\[([^\]|]+)(?:\|[^\]]+)?\]/g, '$1');

  /* ===== Textes =====
     Dans le dossier du chapitre, un fichier par langue, chargé avant
     celui-ci. Masses par LABELS.num (séparateur décimal de la langue),
     températures par LABELS.deg (signe moins typographique). */
  const {
    labels: LABELS, glossary: GLOSSARY, explanations: EXPLAIN, check: CHECK
  } = LabEngine.textFor('statechange');
  const num = LABELS.num;
  const deg = LABELS.deg;

  /* ===== Modèle =====
     La température suit trois segments : de t0 au point de changement
     d'état (atteint à n1 + 0,5 min), le palier (d minutes), puis la suite à
     `rate` °C par minute (n3 relevés). Les relevés tombent toujours à une
     demi-minute des deux bouts du palier : l'état vu à chaque minute est
     sans équivoque. L'eau qui bout n'a pas de troisième segment (to: null).
     weight : part dans le tirage ; axis : [min, max, pas] de l'axe des
     températures ; mass : masse du récipient plein, en g. */
  const SITUATIONS = {
    iceMelt: { substance: 'water', heat: true, device: 'hotplate', vessel: 'beaker', cover: 'film', point: 0, from: 'solid', mid: 'solidLiquid', to: 'liquid', pointName: 'melting', energy: 'melt', weight: 3, axis: [-12, 24, 4], t0: [-10, -6], n1: [2, 3], rate: [3, 4.5], mass: [170, 230] },
    waterFreeze: { substance: 'water', heat: false, device: 'icebath', vessel: 'beaker', cover: 'film', point: 0, from: 'liquid', mid: 'solidLiquid', to: 'solid', pointName: 'melting', energy: 'freeze', weight: 2, axis: [-12, 24, 4], t0: [12, 18], n1: [2, 3], rate: [2, 3], mass: [170, 230] },
    waterBoil: { substance: 'water', heat: true, device: 'hotplate', vessel: 'flask', cover: 'balloon', point: 100, from: 'liquid', mid: 'liquidGas', to: null, pointName: 'boiling', energy: 'boil', weight: 3, axis: [0, 120, 10], t0: [18, 24], n1: [5, 6], rate: [0, 0], mass: [240, 290] },
    acidMelt: { substance: 'stearic', heat: true, device: 'waterbath', vessel: 'beaker', cover: 'film', point: 69, from: 'solid', mid: 'solidLiquid', to: 'liquid', pointName: 'melting', energy: 'melt', weight: 1, axis: [10, 100, 10], t0: [19, 24], n1: [3, 4], rate: [3, 4], mass: [110, 150] },
    acidFreeze: { substance: 'stearic', heat: false, device: 'mat', vessel: 'beaker', cover: 'film', point: 69, from: 'liquid', mid: 'solidLiquid', to: 'solid', pointName: 'melting', energy: 'freeze', weight: 1, axis: [40, 100, 10], t0: [82, 88], n1: [2, 3], rate: [2.5, 3.5], mass: [110, 150] }
  };

  const STATES = ['solid', 'solidLiquid', 'liquid', 'liquidGas'];
  const SLOPES = ['up', 'flat', 'down'];
  const BETS = ['more', 'same', 'less'];
  const DURING = ['up', 'same', 'down'];
  const POINTS = ['melting', 'boiling'];
  const CRITERIA = ['measure', 'closed', 'plateau', 'mass', 'verdict'];
  const ROOM = 21;           // °C : ce qu'affiche le thermomètre posé sur la paillasse
  const TEMP_TOL = 1;        // °C : écart accepté sur une température notée
  const MASS_TOL = 0.05;     // g : la masse notée est celle de la balance, au dixième
  const COVER_MASS = { film: 0.4, balloon: 2.3 };
  const MAX_MIN = 14;        // 15 lignes au plus dans le tableau (Chromebook)
  const MAX_REDO = 1;        // la manipulation se recommence une fois
  const DASH = '—';

  let run;      // tirage
  let state;    // travail de l'élève

  const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const round1 = v => Math.round(v * 10) / 10;
  const between = range => range[0] + Math.random() * (range[1] - range[0]);

  // Paillasse : remise à neuf quand l'élève recommence la manipulation.
  const freshBench = () => ({
    pos: 'bench',          // 'bench' | 'balance' | 'device'
    covered: false,
    probe: false,          // thermomètre plongé dans le récipient
    weighed: { start: false, end: false },
    mass: { start: null, end: null },
    measuring: false,      // « Start measuring » touché : le récipient reste en place
    minute: -1,            // −1 : chronomètre pas encore prêt
    temps: [],
    states: []
  });
  const freshConcl = () => ({ during: null, temp: null, point: null, mass: null, particles: null, vCurve: null, vBet: null });

  function reset() {
    const bag = Object.keys(SITUATIONS).flatMap(k => Array(SITUATIONS[k].weight).fill(k));
    const id = bag[randInt(0, bag.length - 1)];
    const s = SITUATIONS[id];
    const n1 = randInt(s.n1[0], s.n1[1]);
    const n3 = s.to ? randInt(3, 4) : 0;
    run = {
      sit: id,
      t0: randInt(s.t0[0], s.t0[1]),
      n1,
      n3,
      d: Math.min(randInt(5, 7), MAX_MIN - n1 - n3),
      rate: round1(between(s.rate)),
      mass: round1(between(s.mass)),
      loss: round1(between([1.5, 2.2])),   // g par minute d'ébullition, flacon ouvert
      seed: String(Math.random())
    };
    state = {
      curve: Array(s.to ? 3 : 2).fill(null),
      bet: null,
      because: '',
      started: false,      // l'hypothèse se fige à la première pesée
      redos: 0,
      bench: freshBench(),
      concl: freshConcl(),
      selected: CRITERIA[0]
    };
  }

  const sit = () => SITUATIONS[run.sit];
  const lastMinute = () => run.n1 + run.d + run.n3;
  const changeStart = () => run.n1 + 0.5;

  function tempAt(t) {
    const s = sit();
    const t1 = changeStart();
    if (t <= t1) return run.t0 + (s.point - run.t0) * (t / t1);
    if (!s.to || t <= t1 + run.d) return s.point;
    return s.point + (s.heat ? 1 : -1) * run.rate * (t - t1 - run.d);
  }

  // Ce qu'affiche le thermomètre numérique, au degré (jamais « −0 »).
  const reading = t => Math.round(tempAt(t)) + 0;
  // Avancement du changement d'état, de 0 à 1.
  const progress = t => Math.max(0, Math.min(1, (t - changeStart()) / run.d));

  function stateAt(m) {
    const s = sit();
    const p = progress(m);
    return p <= 0 ? s.from : (p >= 1 && s.to ? s.to : s.mid);
  }

  /* Masse sur la balance : récipient plein, plus de quoi le fermer. Seule
     l'eau qui bout dans un flacon ouvert en perd (la vapeur s'en va) ; pour
     une fusion ou une solidification, rien de mesurable au dixième. */
  const escapes = () => !sit().to && !state.bench.covered;
  const lossAt = t => (escapes() ? round1(run.loss * Math.max(0, t - changeStart())) : 0);
  const massAt = t => round1(run.mass + (state.bench.covered ? COVER_MASS[sit().cover] : 0) - lossAt(t));
  const startMass = () => massAt(0);
  const endMass = () => massAt(lastMinute());

  // Ce que l'expérience montre vraiment.
  function trueCurve() {
    const side = sit().heat ? 'up' : 'down';
    return sit().to ? [side, 'flat', side] : [side, 'flat'];
  }
  const trueMassWord = () => (endMass() < startMass() ? 'less' : 'same');
  const trueParticles = () => (trueMassWord() === 'less' ? 'down' : 'same');

  const vesselName = () => LABELS.vessels[sit().vessel];
  const deviceName = () => LABELS.devices[sit().device];

  /* ===== Dessins =====
     Tout ce qui change à l'écran est en SVG : le récipient (viewBox
     100 × 170, fond à y = 165), la balance (140 × 300) et le dispositif
     (160 × 300), posés sur une paillasse à y = 300. */
  let svgUid = 0;
  const svg = (w, h, inner, cls) => `<svg class="${cls || ''}" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">${inner}</svg>`;

  const GLASS = '#8ea6b6';
  const TINTS = {
    water: { liquid: '#9ccbea', solid: '#eef7fc', edge: '#8fbcd8' },
    stearic: { liquid: '#ecdf9c', solid: '#fbf9ef', edge: '#bdb590' }
  };
  const CHUNK_PATHS = [
    'M-9,-5 L-2,-9 L8,-6 L9,4 L1,9 L-8,6 Z',
    'M-8,-7 L5,-9 L9,-1 L6,8 L-5,9 L-9,1 Z',
    'M-9,-2 L-3,-9 L7,-7 L9,3 L2,9 L-7,7 Z'
  ];
  const VESSELS = {
    beaker: {
      outline: 'M11,72 L15,76 L15,157 Q15,165 23,165 L77,165 Q85,165 85,157 L85,76 L89,72',
      clip: 'M16,76 L16,157 Q16,164 23,164 L77,164 Q84,164 84,157 L84,76 Z',
      shine: 'M22,86 L22,150',
      marks: 'M70,100 h9 M73,116 h6 M70,132 h9 M73,148 h6',
      level: 104, floor: 163, left: 19, right: 81
    },
    flask: {
      outline: 'M38,46 L62,46 M41,46 L41,86 L10,154 Q6,165 17,165 L83,165 Q94,165 90,154 L59,86 L59,46',
      clip: 'M42,47 L42,86 L11,154 Q8,164 17,164 L83,164 Q92,164 89,154 L58,86 L58,47 Z',
      shine: 'M29,126 L20,148',
      marks: 'M62,122 h8 M68,140 h8',
      level: 116, floor: 163, left: 26, right: 74
    }
  };

  /* Morceaux de solide (glace pilée, paillettes d'acide stéarique) : douze,
     toujours aux mêmes places ; ils disparaissent un à un, dans un ordre
     tiré une fois. La glace flotte, l'acide stéarique solide reste au fond. */
  const CHUNKS = 12;
  function chunksInner(v, solid, tint, floats) {
    if (solid <= 0) return '';
    const rnd = mulberry32(seedFrom(run.seed + 'chunks'));
    const order = Array.from({ length: CHUNKS }, (x, i) => i);
    for (let i = CHUNKS - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const cols = 4, rows = CHUNKS / cols;
    const w = (v.right - v.left) / cols;
    const top = v.level + 2;
    const h = (v.floor - top) / rows;
    const anchor = floats ? v.level + 8 : v.floor - 8;
    let out = '';
    for (let i = 0; i < CHUNKS; i++) {
      const x = v.left + w * (i % cols + 0.5) + (rnd() - 0.5) * 4;
      const y0 = top + h * (Math.floor(i / cols) + 0.5) + (rnd() - 0.5) * 3;
      const rot = Math.round(rnd() * 360);
      const share = Math.max(0, Math.min(1, solid * CHUNKS - order[i]));
      if (share <= 0) continue;
      const y = anchor + (y0 - anchor) * (0.3 + 0.7 * solid);
      const k = (w / 17) * (0.5 + 0.5 * share);
      out += `<path d="${CHUNK_PATHS[i % 3]}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot}) scale(${k.toFixed(2)})" fill="${tint.solid}" stroke="${tint.edge}" stroke-width="1.3" stroke-linejoin="round"/>`;
    }
    return out;
  }

  // Bulles de l'eau qui bout : elles changent de place six fois par minute.
  function bubblesInner(v, level, t) {
    const rnd = mulberry32(seedFrom(run.seed + 'bubbles' + Math.floor(t * 6)));
    let out = '';
    for (let i = 0; i < 12; i++) {
      const y = level + 6 + rnd() * (v.floor - level - 10);
      const half = 6 + (y - 86) / (v.floor - 86) * 28;
      const x = 50 + (rnd() * 2 - 1) * half;
      out += `<circle class="sc-bubble" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.5 + rnd() * 2.4).toFixed(1)}" fill="#ffffff" fill-opacity="0.85" stroke="#7fb0d0" stroke-width="0.6" style="animation-delay: ${(-rnd() * 1.2).toFixed(2)}s"/>`;
    }
    return out;
  }

  function contentInner(t, covered) {
    const s = sit();
    const v = VESSELS[s.vessel];
    const tint = TINTS[s.substance];
    const p = progress(t);
    const solid = s.mid === 'solidLiquid' ? (s.from === 'solid' ? 1 - p : p) : 0;
    // À l'air libre, le niveau de l'eau qui bout baisse un peu.
    const level = v.level + (!s.to && !covered ? 8 * p : 0);
    let out = '';
    if (solid < 1) {
      out += `<rect x="0" y="${level.toFixed(1)}" width="100" height="${(170 - level).toFixed(1)}" fill="${tint.liquid}" fill-opacity="0.6"/>` +
        `<line x1="0" x2="100" y1="${level.toFixed(1)}" y2="${level.toFixed(1)}" stroke="${tint.liquid}" stroke-width="1.6"/>`;
    }
    out += chunksInner(v, solid, tint, s.substance === 'water');
    if (s.mid === 'liquidGas' && p > 0) out += bubblesInner(v, level, t);
    return out;
  }

  const FILM = `<path d="M10,76 Q50,68 90,76 L90,73 Q50,65 10,73 Z" fill="#bfe3f7" fill-opacity="0.85"/>` +
    `<path d="M10,83 L10,73 Q50,65 90,73 L90,83" fill="none" stroke="#6fb0d6" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`;

  const STEAM = [0, 1, 2].map(i => `<path class="sc-steam" style="animation-delay: ${(-i * 0.7).toFixed(1)}s" d="M${44 + i * 6},40 q-5,-9 0,-17 q5,-8 0,-16" fill="none" stroke="#b3c2cf" stroke-width="2.2" stroke-linecap="round"/>`).join('');

  // Ballon sur le col du flacon : mou au départ, il gonfle quand l'eau bout.
  function balloonInner(t) {
    const warm = Math.max(0, Math.min(1, (tempAt(t) - run.t0) / (sit().point - run.t0)));
    const r = 8 + 3 * warm + 13 * progress(t);
    const cy = 47 - r * 0.9;
    const body = r <= 8.4
      ? `<path d="M41,46 Q38,36 50,35 Q66,34 70,44 Q71,50 64,50 Q60,45 59,46 Z" fill="#e0607c" stroke="#b9415f" stroke-width="1.2" stroke-linejoin="round"/>`
      : `<circle cx="50" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="#e0607c" stroke="#b9415f" stroke-width="1.2"/>` +
        `<path d="M${(50 - r * 0.55).toFixed(1)},${(cy - r * 0.35).toFixed(1)} q${(r * 0.12).toFixed(1)},${(-r * 0.3).toFixed(1)} ${(r * 0.42).toFixed(1)},${(-r * 0.4).toFixed(1)}" fill="none" stroke="#ffffff" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round"/>`;
    return body + `<rect x="38.5" y="44" width="23" height="6" rx="2.5" fill="#c24a67"/>`;
  }

  // Le récipient et son contenu à l'instant t (en minutes).
  function vesselInner(t, covered) {
    const s = sit();
    const v = VESSELS[s.vessel];
    const uid = `scv${++svgUid}`;
    let out = `<defs><clipPath id="${uid}"><path d="${v.clip}"/></clipPath></defs>` +
      `<path d="${v.clip}" fill="#f4f9fc"/>` +
      `<g clip-path="url(#${uid})">${contentInner(t, covered)}</g>` +
      `<path d="${v.shine}" fill="none" stroke="#ffffff" stroke-opacity="0.75" stroke-width="4" stroke-linecap="round"/>` +
      `<path d="${v.marks}" fill="none" stroke="${GLASS}" stroke-opacity="0.7" stroke-width="1.2"/>` +
      `<path d="${v.outline}" fill="none" stroke="${GLASS}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    if (s.vessel === 'flask') out += covered ? balloonInner(t) : (progress(t) > 0 ? STEAM : '');
    else if (covered) out += FILM;
    return out;
  }

  function hotplateInner(on) {
    return `<rect x="26" y="296" width="12" height="4" rx="1.5" fill="#7d8894"/><rect x="122" y="296" width="12" height="4" rx="1.5" fill="#7d8894"/>` +
      `<rect x="14" y="263" width="132" height="34" rx="7" fill="#e3e7eb" stroke="#aab4be" stroke-width="1.5"/>` +
      `<rect x="20" y="256" width="120" height="8" rx="2.5" fill="${on ? '#d8562f' : '#56606b'}"/>` +
      `<circle cx="40" cy="280" r="7.5" fill="#8792a0"/><path d="M40,280 L${on ? '45,275' : '40,273'}" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>` +
      `<circle cx="122" cy="280" r="4" fill="${on ? '#e2412a' : '#b6bec7'}"/>`;
  }

  const BATH_WATER = 'M29,180 L131,180 L131,248 Q131,255 124,255 L36,255 Q29,255 29,248 Z';
  const TUB = 'M8,224 L152,224 L143,294 Q142,299 137,299 L23,299 Q18,299 17,294 Z';
  const MAT = `<rect x="32" y="290" width="96" height="9" rx="2.5" fill="#c9a877" stroke="#a48554" stroke-width="1.2"/>` +
    [40, 52, 67, 78, 93, 104, 117].map((x, i) => `<circle cx="${x}" cy="${293 + (i % 3) * 1.5}" r="0.9" fill="#8f6f3e"/>`).join('');
  // Fond du récipient posé sur le dispositif (y dans la scène).
  const DEVICE_BASE = { hotplate: 256, waterbath: 250, icebath: 290, mat: 290 };

  // Derrière le récipient.
  function deviceBack(on) {
    const d = sit().device;
    if (d === 'hotplate') return hotplateInner(on);
    if (d === 'waterbath') {
      return hotplateInner(true) +
        `<path d="M29,150 L29,248 Q29,255 36,255 L124,255 Q131,255 131,248 L131,150 Z" fill="#f4f9fc"/>` +
        `<path d="${BATH_WATER}" fill="#9ccbea" fill-opacity="0.3"/>`;
    }
    if (d === 'icebath') return `<path d="${TUB}" fill="#e6eef5" stroke="#9db2c4" stroke-width="2" stroke-linejoin="round"/>`;
    return MAT;
  }

  /* Devant le récipient : l'eau du bain-marie ; la glace et le sel du bain
     froid, en tas de part et d'autre du bécher et bas devant lui, pour que
     son contenu reste visible. */
  function deviceFront() {
    const d = sit().device;
    if (d === 'waterbath') {
      return `<path d="${BATH_WATER}" fill="#9ccbea" fill-opacity="0.22"/>` +
        `<line x1="29" x2="131" y1="180" y2="180" stroke="#7fb5da" stroke-width="1.5"/>` +
        `<path d="M24,146 L28,150 L28,248 Q28,256 36,256 L124,256 Q132,256 132,248 L132,150 L136,146" fill="none" stroke="${GLASS}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>` +
        `<path d="M35,160 L35,240" stroke="#ffffff" stroke-opacity="0.7" stroke-width="4" stroke-linecap="round"/>`;
    }
    if (d !== 'icebath') return '';
    const rnd = mulberry32(seedFrom(run.seed + 'bath'));
    let out = '';
    for (let i = 0; i < 34; i++) {
      const x = 22 + rnd() * 116;
      const side = x < 44 || x > 116;
      const y = (side ? 238 : 278) + rnd() * (side ? 50 : 12);
      const rot = Math.round(rnd() * 360);
      out += `<path d="${CHUNK_PATHS[i % 3]}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot}) scale(0.85)" fill="#f3f9fd" stroke="#9fc4dc" stroke-width="1.2" stroke-linejoin="round"/>`;
    }
    for (let i = 0; i < 22; i++) {
      const x = 24 + rnd() * 112;
      const side = x < 44 || x > 116;
      out += `<circle cx="${x.toFixed(1)}" cy="${((side ? 240 : 278) + rnd() * (side ? 50 : 14)).toFixed(1)}" r="1" fill="#ffffff" stroke="#b9c6d2" stroke-width="0.5"/>`;
    }
    return out + `<rect x="5" y="219" width="150" height="7" rx="3.5" fill="#c3d2de" stroke="#9db2c4" stroke-width="1.2"/>`;
  }

  const massText = v => `${num(v)} ${LABELS.units.g}`;

  function balanceInner(mass) {
    return `<rect x="14" y="244" width="112" height="7" rx="3.5" fill="#cfd6dd" stroke="#9aa5b1" stroke-width="1.2"/>` +
      `<rect x="62" y="251" width="16" height="9" fill="#aeb7c0"/>` +
      `<rect x="8" y="259" width="124" height="40" rx="8" fill="#e3e7eb" stroke="#aab4be" stroke-width="1.5"/>` +
      `<rect x="22" y="266" width="96" height="26" rx="5" fill="#1d2a23"/>` +
      `<text class="sc-lcd" x="112" y="285" text-anchor="end" data-mass-display>${massText(mass)}</text>`;
  }

  // Sonde du thermomètre numérique : bout de fil, manche et tige.
  const PROBE_ICON = svg(22, 44, `<path d="M11,3 C11,9 5,9 5.5,15" fill="none" stroke="#3b4652" stroke-width="2" stroke-linecap="round"/>` +
    `<rect x="3" y="14" width="5" height="7" rx="1.5" fill="#3b4652"/>` +
    `<line x1="5.5" y1="21" x2="5.5" y2="41" stroke="#aab4be" stroke-width="3.2" stroke-linecap="round"/>`, 'sc-probe-icon');

  const COVER_ICONS = {
    film: svg(44, 44, `<rect x="5" y="15" width="34" height="14" rx="7" fill="#dfeaf2" stroke="#8ea6b6" stroke-width="1.6"/>` +
      `<ellipse cx="9" cy="22" rx="3" ry="5" fill="#ffffff" stroke="#8ea6b6" stroke-width="1.2"/>` +
      `<path d="M14,29 L11,40 L37,40 L35,29 Z" fill="#bfe3f7" fill-opacity="0.75" stroke="#6fb0d6" stroke-width="1.4" stroke-linejoin="round"/>`, 'sc-cover-icon'),
    balloon: svg(44, 44, `<path d="M22,6 C31,6 36,13 34,21 C32,28 26,32 22,33 C18,32 12,28 10,21 C8,13 13,6 22,6 Z" fill="#e0607c" stroke="#b9415f" stroke-width="1.4"/>` +
      `<path d="M19,33 L25,33 L26,39 L18,39 Z" fill="#c24a67"/>` +
      `<path d="M15,14 q2,-4 6,-5" fill="none" stroke="#ffffff" stroke-opacity="0.65" stroke-width="2" stroke-linecap="round"/>`, 'sc-cover-icon')
  };

  // Fil et tige du thermomètre plongé dans le récipient posé sur le dispositif.
  function wireSVG() {
    const s = sit();
    const top = DEVICE_BASE[s.device] - 165;
    const flask = s.vessel === 'flask';
    const ex = flask ? 321 : 316;
    const ey = top + (flask ? 47 : 71);
    const path = flask
      ? `M378,56 C378,${ey - 14} ${ex + 40},${ey - 16} ${ex},${ey}`
      : `M378,56 C378,${ey - 60} ${ex},${ey - 70} ${ex},${ey}`;
    return svg(400, 336, `<path d="${path}" fill="none" stroke="#3b4652" stroke-width="2" stroke-linecap="round"/>` +
      `<line x1="${ex}" y1="${ey}" x2="${flask ? 317 : 316}" y2="${top + 150}" stroke="#aab4be" stroke-width="3.2" stroke-linecap="round"/>` +
      `<line x1="${ex}" y1="${ey}" x2="${ex}" y2="${ey + 7}" stroke="#3b4652" stroke-width="4.4" stroke-linecap="round"/>`, 'sc-wire-svg');
  }

  // Le matériel de départ, pour l'étape Predict : rien n'a encore changé.
  function sceneArt() {
    return svg(280, 304, `<line x1="0" x2="280" y1="300.5" y2="300.5" stroke="#d6cab2" stroke-width="2"/>` +
      `<svg x="6" y="135" width="100" height="170" viewBox="0 0 100 170">${vesselInner(0, false)}</svg>` +
      `<svg x="116" y="0" width="160" height="300" viewBox="0 0 160 300">${deviceBack(false)}${deviceFront()}</svg>`, 'sc-art-svg');
  }

  /* ===== Esquisse de la courbe (hypothèse) =====
     Un tronçon par phase ; chacun monte, reste plat ou descend. Les
     tronçons s'enchaînent et l'ensemble est centré dans le cadre. Un
     tronçon pas encore choisi est en pointillé. */
  const SK = { W: 420, H: 170, L: 40, R: 12, T: 12, B: 30 };
  function sketchSVG(curve, size) {
    const n = curve.length;
    const w = (SK.W - SK.L - SK.R) / n;
    const step = { up: -36, flat: 0, down: 36 };
    const ys = [0];
    curve.forEach(c => ys.push(ys[ys.length - 1] + (c ? step[c] : 0)));
    const mid = (Math.min(...ys) + Math.max(...ys)) / 2;
    const cy = SK.T + (SK.H - SK.T - SK.B) / 2;
    const px = i => SK.L + i * w;
    const py = v => cy + v - mid;
    const floor = SK.H - SK.B;
    let out = `<svg class="sc-sketch-svg" viewBox="0 0 ${SK.W} ${SK.H}"${size ? ` width="${size[0]}" height="${size[1]}"` : ''} aria-hidden="true" focusable="false">` +
      `<path d="M${SK.L},${SK.T - 4} L${SK.L},${floor} L${SK.W - SK.R + 4},${floor}" fill="none" stroke="#8a948c" stroke-width="1.6" stroke-linecap="round"/>` +
      `<path d="M${SK.L - 4},${SK.T + 2} L${SK.L},${SK.T - 5} L${SK.L + 4},${SK.T + 2} M${SK.W - SK.R - 2},${floor - 4} L${SK.W - SK.R + 5},${floor} L${SK.W - SK.R - 2},${floor + 4}" fill="none" stroke="#8a948c" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<text class="sc-sketch-axis" x="${SK.W - SK.R}" y="${floor + 20}" text-anchor="end">${LABELS.sketchX}</text>` +
      `<text class="sc-sketch-axis" transform="translate(${SK.L - 14} ${cy}) rotate(-90)" text-anchor="middle">${LABELS.sketchY}</text>`;
    for (let i = 1; i < n; i++) out += `<line x1="${px(i)}" x2="${px(i)}" y1="${SK.T}" y2="${floor}" stroke="#c9cfc7" stroke-width="1.2" stroke-dasharray="4 5"/>`;
    curve.forEach((c, i) => {
      const a = `x1="${px(i).toFixed(1)}" y1="${py(ys[i]).toFixed(1)}" x2="${px(i + 1).toFixed(1)}" y2="${py(ys[i + 1]).toFixed(1)}"`;
      out += c
        ? `<line ${a} stroke="#2a78d6" stroke-width="3.4" stroke-linecap="round"/>`
        : `<line ${a} stroke="#b4bcc4" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="3 8"/>`;
    });
    ys.forEach((v, i) => {
      const known = curve[i] || curve[i - 1];
      out += `<circle cx="${px(i).toFixed(1)}" cy="${py(v).toFixed(1)}" r="4" fill="${known ? '#2a78d6' : '#b4bcc4'}" stroke="#ffffff" stroke-width="1.5"/>`;
    });
    return out + `</svg>`;
  }

  const SLOPE_PATHS = {
    up: 'M5,19 L19,5 M11,5 L19,5 L19,13',
    flat: 'M3,12 L21,12 M15,6 L21,12 L15,18',
    down: 'M5,5 L19,19 M11,19 L19,19 L19,11'
  };
  const slopeIcon = k => `<svg class="sc-slope-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${SLOPE_PATHS[k]}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  /* ===== Graphique évolutif (FO5c) =====
     Température en fonction du temps. Il se trace tout seul à partir des
     températures notées dans le tableau (même fausses : la correction les
     compare au thermomètre). opts.readings : les relevés réels en points
     creux (correction) ; opts.fresh : minute du point qui vient
     d'apparaître ; opts.h : hauteur du dessin (il prend la forme de la
     place qu'on lui donne) ; opts.size : taille fixe (rapport imprimé). */
  const G = { W: 440, H: 470, L: 54, R: 16, T: 16, B: 46 };
  function graphSVG(opts) {
    const o = opts || {};
    const [lo, hi, step] = sit().axis;
    const n = lastMinute();
    const H = o.h || G.H;
    const gx = m => G.L + (m / n) * (G.W - G.L - G.R);
    const gy = v => G.T + (1 - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * (H - G.T - G.B);
    const floor = H - G.B;
    let out = `<svg class="sc-graph-svg" viewBox="0 0 ${G.W} ${H}"${o.size ? ` width="${o.size[0]}" height="${o.size[1]}"` : ''} role="img" aria-label="${escapeHtml(LABELS.axisY)} / ${escapeHtml(LABELS.axisX)}">`;
    for (let i = 0; lo + i * step / 2 <= hi + 1e-9; i++) {
      const v = lo + i * step / 2;
      const major = i % 2 === 0;
      out += `<line x1="${G.L}" x2="${G.W - G.R}" y1="${gy(v).toFixed(1)}" y2="${gy(v).toFixed(1)}" stroke="${major ? '#dcdfda' : '#eef0ec'}" stroke-width="1"/>`;
      if (major) out += `<text class="sc-tick-label" x="${G.L - 8}" y="${(gy(v) + 4).toFixed(1)}" text-anchor="end">${deg(v)}</text>`;
    }
    for (let m = 0; m <= n; m++) {
      out += `<line x1="${gx(m).toFixed(1)}" x2="${gx(m).toFixed(1)}" y1="${G.T}" y2="${floor}" stroke="#eef0ec" stroke-width="1"/>` +
        `<text class="sc-tick-label" x="${gx(m).toFixed(1)}" y="${floor + 17}" text-anchor="middle">${m}</text>`;
    }
    out += `<line x1="${G.L}" x2="${G.W - G.R}" y1="${floor}" y2="${floor}" stroke="#a9ada4" stroke-width="1.2"/>` +
      `<line x1="${G.L}" x2="${G.L}" y1="${G.T}" y2="${floor}" stroke="#a9ada4" stroke-width="1.2"/>` +
      (lo < 0 ? `<line x1="${G.L}" x2="${G.W - G.R}" y1="${gy(0).toFixed(1)}" y2="${gy(0).toFixed(1)}" stroke="#a9ada4" stroke-width="1.2"/>` : '') +
      `<text class="sc-axis-label" x="${(G.L + G.W - G.R) / 2}" y="${H - 7}" text-anchor="middle">${LABELS.axisX}</text>` +
      `<text class="sc-axis-label" transform="translate(14 ${(G.T + floor) / 2}) rotate(-90)" text-anchor="middle">${LABELS.axisY}</text>`;
    if (o.readings) {
      for (let m = 0; m <= n; m++) {
        out += `<circle cx="${gx(m).toFixed(1)}" cy="${gy(reading(m)).toFixed(1)}" r="5.5" fill="#ffffff" stroke="#7d8a80" stroke-width="1.6"/>`;
      }
    }
    const temps = state.bench.temps;
    let d = '';
    let pen = false;
    for (let m = 0; m <= n; m++) {
      if (temps[m] == null) { pen = false; continue; }
      d += `${pen ? 'L' : 'M'}${gx(m).toFixed(1)},${gy(temps[m]).toFixed(1)} `;
      pen = true;
    }
    if (d) out += `<path d="${d}" fill="none" stroke="#2a78d6" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    for (let m = 0; m <= n; m++) {
      if (temps[m] == null) continue;
      out += `<circle${o.fresh === m ? ' class="is-fresh"' : ''} cx="${gx(m).toFixed(1)}" cy="${gy(temps[m]).toFixed(1)}" r="4.5" fill="#2a78d6" stroke="#ffffff" stroke-width="1.8"/>`;
    }
    return out + `</svg>`;
  }

  const keySVG = hollow => `<svg class="sc-key" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="5" fill="${hollow ? '#ffffff' : '#2a78d6'}" stroke="${hollow ? '#7d8a80' : '#ffffff'}" stroke-width="1.6"/></svg>`;

  /* ===== Étapes complètes (progression stricte, voir lab-engine.js) =====
     1 : l'esquisse et le pari ; 2 : toutes les lignes du tableau et les
     deux masses ; 3 : toutes les réponses de la conclusion. */
  const hypDone = () => state.curve.every(Boolean) && !!state.bet;
  const rowDone = m => state.bench.temps[m] != null && !!state.bench.states[m];
  const timeUp = () => state.bench.minute === lastMinute() && rowDone(lastMinute());
  const benchDone = () => timeUp() && state.bench.mass.start != null && state.bench.mass.end != null;

  function stepComplete(n) {
    if (n === 1) return hypDone();
    if (n === 2) return benchDone();
    return conclusionsComplete();
  }

  function lockReason(n) {
    if (n === 1) return LABELS.lockHypothesis;
    if (n === 2) return state.started ? LABELS.lockRun : LABELS.lockNotStarted;
    return lab.L.missingConclusions;
  }

  const questionsHTML = () => `<p class="sc-big-q">${gloss(LABELS.bigQuestion)}</p>` +
    `<ol class="sc-questions">${LABELS.subQuestions[run.sit].map(q => `<li>${gloss(q)}</li>`).join('')}</ol>`;
  const chipHTML = (attrs, label, on) => `<button type="button" class="lab-choice sc-chip ${on ? 'is-selected' : ''}" ${attrs} aria-pressed="${on}">${label}</button>`;

  function selectHTML(attrs, value, options, labelOf, aria, missing) {
    return `<select class="lab-select sc-select ${value ? 'is-filled' : ''} ${missing && !value ? 'lab-is-missing' : ''}" ${attrs} aria-label="${escapeHtml(aria)}">` +
      `<option value="" disabled ${value ? '' : 'selected'}>${LABELS.choose}</option>` +
      options.map(x => `<option value="${x}" ${value === x ? 'selected' : ''}>${escapeHtml(labelOf(x))}</option>`).join('') + `</select>`;
  }

  /* Saisie d'un nombre : la valeur compte dès qu'elle est lisible (à chaque
     frappe), sans attendre que l'élève quitte la case ; ce qui en dépend se
     déverrouille tout de suite. Mise en forme et refus en quittant la case.
     parse rend le nombre, null (case vide) ou NaN (illisible). */
  function bindField(input, parse, format, store, after, badCaption) {
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      const v = parse(input.value);
      store(Number.isNaN(v) ? null : v);
      after(false);
    });
    input.addEventListener('change', () => {
      const v = parse(input.value);
      if (Number.isNaN(v)) {
        input.classList.add('is-invalid');
        if (badCaption) setCaption(badCaption, true);
        return;
      }
      if (v != null) input.value = format(v);
      after(true);
    });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
  }

  // Virgule ou point ; masse au dixième, température au degré (signe moins
  // du clavier ou typographique).
  function parseMass(raw) {
    const s = raw.trim().replace(',', '.');
    if (s === '') return null;
    const v = /^\d{1,3}(\.\d*)?$/.test(s) ? Number(s) : NaN;
    return v > 0 && v < 1000 ? round1(v) : NaN;
  }

  function parseTemp(raw) {
    const s = raw.trim().replace(/[−–]/g, '-').replace(',', '.');
    if (s === '') return null;
    const v = /^-?\d{1,3}(\.\d*)?$/.test(s) ? Math.round(Number(s)) + 0 : NaN;
    return v >= -50 && v <= 200 ? v : NaN;
  }

  /* ===== Étape 1 : hypothèse =====
     À gauche, la question et le matériel du jour (des faits : substance,
     température de départ, dispositif) ; à droite, l'esquisse de la courbe
     et le pari sur la masse. */
  function renderPredict() {
    const show = lab.state.showMissing;
    const miss = ok => (show && !ok ? 'lab-is-missing' : '');
    const names = LABELS.zoneNames[run.sit];
    const zones = state.curve.map((c, i) => `<div class="sc-zone"><span class="sc-zone-name">${gloss(names[i])}</span>` +
      `<span class="sc-slopes">${SLOPES.map(k => `<button type="button" class="lab-choice sc-slope ${c === k ? 'is-selected' : ''}" data-zone="${i}" data-slope="${k}" aria-pressed="${c === k}" aria-label="${escapeHtml(LABELS.slopes[k])}" title="${escapeHtml(LABELS.slopes[k])}">${slopeIcon(k)}</button>`).join('')}</span></div>`).join('');

    lab.body.innerHTML = `<div class="sc-predict">` +
      `<div class="sc-predict-left">` +
        `<div class="sc-question-card"><p class="sc-kicker">${LABELS.yourQuestion}</p>${questionsHTML()}</div>` +
        `<div class="sc-sit-card"><p class="sc-kicker">${LABELS.todayTitle}</p>` +
          `<div class="sc-sit"><div class="sc-sit-art">${sceneArt()}</div>` +
          `<p class="sc-sit-text">${gloss(LABELS.situations[run.sit](deg(run.t0)))}</p></div></div>` +
      `</div>` +
      `<div class="sc-hyp-card"><p class="sc-kicker">${LABELS.hypothesisTitle}</p>` +
        `<ol class="sc-hyp-list">` +
          `<li class="sc-hyp-part ${miss(state.curve.every(Boolean))}"><p class="sc-hyp-q">${gloss(LABELS.hypCurve)}</p>` +
            `<div class="sc-sketch" data-sketch>${sketchSVG(state.curve)}</div>` +
            `<div class="sc-zones">${zones}</div></li>` +
          `<li class="sc-hyp-part ${miss(state.bet)}"><p class="sc-hyp-q">${gloss(LABELS.hypBet)}</p>` +
            `<div class="sc-chips">${BETS.map(k => chipHTML(`data-bet="${k}"`, LABELS.bets[k], state.bet === k)).join('')}</div></li>` +
        `</ol>` +
        `<label class="sc-because"><span>${LABELS.because}</span>` +
        `<input type="text" class="lab-input sc-because-input" maxlength="160" placeholder="${escapeHtml(LABELS.becausePlaceholder)}" value="${escapeHtml(state.because)}" autocomplete="off"></label>` +
      `</div></div>`;

    const after = () => {
      if (lab.state.showMissing && hypDone()) lab.state.showMissing = false;
      renderPredict();
      lab.renderStepper();
    };
    $$('[data-slope]').forEach(btn => btn.addEventListener('click', () => {
      state.curve[Number(btn.dataset.zone)] = btn.dataset.slope;
      after();
    }));
    $$('[data-bet]').forEach(btn => btn.addEventListener('click', () => {
      state.bet = btn.dataset.bet;
      after();
    }));
    const because = $('.sc-because-input');
    because.addEventListener('input', e => { state.because = e.target.value; });
    // Hypothèse figée dès la première pesée : on la relit, on ne la change plus.
    if (state.started) {
      $$('[data-slope], [data-bet]').forEach(btn => lab.setLock(btn, LABELS.lockHypothesisFixed, { icon: false }));
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

  /* ===== Étape 2 : l'expérience =====
     Trois colonnes : la paillasse (chronomètre, scène, légende), le carnet
     (les deux masses, le tableau minute par minute) et le graphique.
     Scène de 400 × 336 : balance à gauche, dispositif à droite, le
     récipient entre les deux au départ ; en haut, le thermomètre et de quoi
     fermer le récipient. Le récipient et le thermomètre se prennent en
     main (makeDraggable, hold) ; le film ou le ballon se met et s'enlève
     d'un toucher. */
  let stepperDone = null;

  const CLOCK_ICON = `<svg class="sc-tick-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">` +
    `<circle cx="12" cy="13.5" r="7.5" fill="none" stroke="currentColor" stroke-width="2"/>` +
    `<path d="M12,13.5 V9 M9.5,2.5 h5 M12,2.5 V6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

  function clockText(t) {
    const sec = Math.round(t * 60);
    return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
  }

  /* Les trois phases de la paillasse : peser, mesurer, repeser. La phase
     en cours est en couleur ; « Start measuring » fait passer à la deuxième. */
  const phase = () => (!state.bench.measuring ? 0 : timeUp() ? 2 : 1);

  function phasesHTML() {
    const now = phase();
    return `<ol class="sc-phases">` + LABELS.phases.map((name, i) =>
      `<li class="${i === now ? 'is-now' : i < now ? 'is-done' : ''}"><span class="sc-phase-n">${i + 1}</span>${name}</li>`).join('') + `</ol>`;
  }

  function timerHTML(t) {
    const action = !state.bench.measuring
      ? `<button type="button" class="sc-tick" data-start><span class="sc-tick-text"><strong>${LABELS.startMeasure}</strong><small>${LABELS.startMeasureSub}</small></span></button>`
      : timeUp()
      ? `<div class="sc-tick is-final"><span class="sc-tick-text"><strong>${LABELS.timeUp}</strong><small>${LABELS.timeUpSub}</small></span></div>`
      : `<button type="button" class="sc-tick" data-tick>${CLOCK_ICON}<span class="sc-tick-text"><strong>${LABELS.tick}</strong><small data-tick-sub></small></span></button>`;
    return `<div class="sc-timer" data-timer><span class="sc-clock" data-clock>${clockText(t)}</span>` +
      `<span class="sc-timer-info">${LABELS.timerInfo(lastMinute())}</span>${action}</div>`;
  }

  function stageHTML(t) {
    const b = state.bench;
    const s = sit();
    const spot = b.pos === 'device' ? { x: 316, base: DEVICE_BASE[s.device] }
      : b.pos === 'balance' ? { x: 80, base: 244 } : { x: 193, base: 300 };
    const on = b.minute >= 1 && !timeUp();
    return `<div class="sc-stage">` +
      `<div class="sc-spot sc-balance" data-target="balance">${svg(140, 300, balanceInner(b.pos === 'balance' ? massAt(t) : 0))}<span class="sc-spot-name">${LABELS.tools.balance}</span></div>` +
      `<div class="sc-spot sc-device" data-target="device">${svg(160, 300, deviceBack(on))}<span class="sc-spot-name">${deviceName().name}</span></div>` +
      `<button type="button" class="sc-vessel" data-vessel style="left: ${spot.x - 50}px; top: ${spot.base - 165}px" aria-label="${escapeHtml(vesselName().name)}">${svg(100, 170, vesselInner(t, b.covered))}</button>` +
      `<div class="sc-front">${svg(160, 300, deviceFront())}</div>` +
      (b.probe ? `<div class="sc-wire">${wireSVG()}</div>` : '') +
      `<button type="button" class="sc-tool sc-probe ${b.probe ? 'is-in' : ''}" data-probe>${b.probe ? '' : PROBE_ICON}` +
        `<span class="sc-tool-body"><span class="sc-lcd-box"><span data-temp>${deg(b.probe ? reading(t) : ROOM)}</span><small>${LABELS.units.c}</small></span>` +
        `<span class="sc-tool-name">${LABELS.tools.probe}</span></span></button>` +
      `<button type="button" class="sc-tool sc-cover lab-gloss-btn ${b.covered ? 'is-selected' : ''}" data-cover aria-pressed="${b.covered}">${COVER_ICONS[s.cover]}<span class="sc-tool-name">${LABELS.tools[s.cover]}</span></button>` +
    `</div>`;
  }

  /* Carnet : les deux masses, puis une ligne par minute. Seule la ligne de
     la minute en cours s'écrit, tant que le thermomètre est dans le
     récipient : ce qu'il affichait avant ne se relit plus. */
  function tableHTML() {
    const b = state.bench;
    let rows = '';
    for (let m = 0; m <= lastMinute(); m++) {
      let temp = '', st = '';
      if (m < b.minute || (m === b.minute && !b.probe)) {
        temp = b.temps[m] == null ? DASH : deg(b.temps[m]);
        st = b.states[m] ? LABELS.states[b.states[m]] : DASH;
      } else if (m === b.minute) {
        temp = `<input type="text" inputmode="text" class="sc-cell-input" data-temp-cell value="${b.temps[m] == null ? '' : deg(b.temps[m])}" maxlength="5" autocomplete="off" spellcheck="false" aria-label="${escapeHtml(LABELS.tempAria)}">`;
        st = selectHTML('data-state-cell', b.states[m], STATES, k => LABELS.states[k], LABELS.stateAria);
      } else if (m === 0) {
        temp = `<button type="button" class="sc-cell-wait" data-wait aria-label="${escapeHtml(LABELS.tempAria)}"></button>`;
        st = `<button type="button" class="sc-cell-wait" data-wait aria-label="${escapeHtml(LABELS.stateAria)}"></button>`;
      }
      rows += `<tr class="${m === Math.max(0, b.minute) ? 'is-now' : ''}"><th scope="row">${m}</th><td>${temp}</td><td>${st}</td></tr>`;
    }
    return `<table class="sc-table"><thead><tr><th scope="col">${LABELS.tableTime}</th><th scope="col">${LABELS.tableTemp}</th><th scope="col">${LABELS.tableState}</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function notesHTML() {
    const b = state.bench;
    const field = k => `<div class="sc-mass"><span class="sc-mass-label">${LABELS.massNames[k]}</span>` +
      `<span class="sc-mass-field"><input type="text" inputmode="decimal" class="sc-cell-input" data-mass="${k}" value="${b.mass[k] == null ? '' : num(b.mass[k])}" maxlength="6" autocomplete="off" spellcheck="false" aria-label="${escapeHtml(LABELS.massAria[k])}">` +
      `<span>${LABELS.units.g}</span></span></div>`;
    return `<section class="sc-notes"><h3 class="lab-panel-title">${LABELS.notesTitle}</h3>` +
      `<div class="sc-masses">${field('start')}${field('end')}</div>` +
      `<div class="sc-table-wrap">${tableHTML()}</div></section>`;
  }

  // at : instant dessiné (pendant qu'une minute passe) ; sinon la minute en cours.
  function renderExperiment(caption, at) {
    const t = at != null ? at : Math.max(0, state.bench.minute);
    lab.body.innerHTML = `<div class="sc-run">` +
      `<section class="sc-bench">` +
        `<p class="sc-reminder">${gloss(LABELS.bigQuestion)}</p>` +
        phasesHTML() +
        timerHTML(t) +
        stageHTML(t) +
        `<p class="lab-caption" data-caption aria-live="polite"></p>` +
      `</section>` +
      notesHTML() +
      `<section class="sc-graph-panel"><h3 class="lab-panel-title">${LABELS.graphTitle}</h3>` +
        `<div class="sc-graph-wrap" data-graph>${graphSVG()}</div></section>` +
      `</div>`;
    bindStage();
    bindNotes();
    const tick = $('[data-tick]');
    if (tick) tick.addEventListener('click', runMinute);
    const start = $('[data-start]');
    if (start) start.addEventListener('click', startMeasuring);
    renderRunFooter();
    updateLocks();
    updateMarks();
    setCaption(caption || defaultCaption());
  }

  function bindStage() {
    const b = state.bench;
    const vessel = $('[data-vessel]');
    const probe = $('[data-probe]');
    const balance = $('[data-target="balance"]');
    const device = $('[data-target="device"]');
    const up = timeUp();
    const t = Math.max(0, b.minute);

    /* Le récipient se déplace librement pendant la pesée (phase 1), reste
       en place pendant les mesures (phase 2 : le thermomètre se pose
       dessus sans qu'on le reprenne), puis se reprend à la fin, thermomètre
       retiré (phase 3). */
    if (!b.measuring || (b.pos === 'device' && up && !b.probe)) {
      lab.makeDraggable(vessel, {
        hold: true,
        ghost: () => `<div class="sc-ghost">${svg(100, 170, vesselInner(t, b.covered))}</div>`,
        targets: () => (b.pos === 'bench' ? [balance, device] : b.pos === 'balance' ? [device] : [balance]),
        onDrop: target => {
          // Glissé sur un endroit verrouillé : la légende dit pourquoi.
          if (target.classList.contains('lab-is-locked')) setCaption(target.dataset.lock, true);
          else moveVessel(target.dataset.target);
        },
        onHold: on => setCaption(on ? LABELS.captionHoldVessel : defaultCaption())
      });
    } else if (!b.probe && !up) {
      // Phase 2, pot touché sans le thermomètre en main : ce qu'il attend.
      vessel.addEventListener('click', () => setCaption(LABELS.captionProbe(vesselName().the), true));
    }
    // Un endroit touché sans rien en main (sinon le moteur y a posé l'objet).
    [balance, device].forEach(el => el.addEventListener('click', () => {
      if (!b.measuring) setCaption(LABELS.captionTakeFirst(vesselName().the), true);
    }));

    if (!b.probe) {
      lab.makeDraggable(probe, {
        hold: true,
        ghost: () => `<div class="sc-ghost sc-ghost-probe">${PROBE_ICON}</div>`,
        targets: () => [vessel],
        onDrop: () => {
          lab.release();
          b.probe = true;
          if (b.minute < 0) b.minute = 0;
          renderExperiment();
          focusRow();
        },
        onHold: on => setCaption(on ? LABELS.captionHoldProbe(vesselName().the) : defaultCaption())
      });
    } else {
      // À la fin, un toucher le retire (avant : verrouillé, voir updateLocks).
      probe.addEventListener('click', () => {
        if (!timeUp()) return;
        b.probe = false;
        renderExperiment();
      });
    }

    /* Film ou ballon : mis ou retiré d'un toucher, tant que le récipient
       n'est pas sur le dispositif. Sur la balance, la masse change : celle
       déjà notée ne vaut plus. */
    $('[data-cover]').addEventListener('click', () => {
      b.covered = !b.covered;
      const onBalance = b.pos === 'balance';
      const noted = b.mass.start != null;
      b.mass.start = null;
      renderExperiment(onBalance && noted ? LABELS.captionCoverChanged : null);
    });
  }

  function focusRow() {
    const input = $('[data-temp-cell]');
    if (input) input.focus({ preventScroll: true });
  }

  function bindNotes() {
    const b = state.bench;
    $$('[data-mass]').forEach(input => bindField(input, parseMass, num,
      v => { b.mass[input.dataset.mass] = v; }, () => refreshRecords(), LABELS.captionBadMass));
    const temp = $('[data-temp-cell]');
    if (temp) {
      bindField(temp, parseTemp, deg, v => { b.temps[b.minute] = v; },
        left => refreshRecords(left && b.temps[b.minute] != null ? b.minute : null), LABELS.captionBadTemp);
    }
    const st = $('[data-state-cell]');
    if (st) {
      st.addEventListener('change', () => {
        b.states[b.minute] = st.value || null;
        st.classList.toggle('is-filled', !!st.value);
        refreshRecords();
      });
    }
  }

  // Quelque chose de lisible reste-t-il à noter ?
  function pendingNote() {
    const b = state.bench;
    return (b.minute >= 0 && !rowDone(b.minute)) ||
      (b.weighed.start && b.mass.start == null) || (b.weighed.end && b.mass.end == null);
  }

  /* Après une saisie, mise à jour sur place (graphique, verrous, repères,
     pied) sans reconstruire la paillasse : la saisie compte souvent quand
     l'élève touche déjà autre chose, et ce geste ne doit pas être coupé. */
  function refreshRecords(fresh) {
    if (lab.state.showMissing && !pendingNote()) lab.state.showMissing = false;
    const wrap = $('[data-graph]');
    if (wrap) wrap.innerHTML = graphSVG({ fresh });
    // Dernière ligne complète : le chronomètre s'arrête (et repart si
    // l'élève efface sa dernière ligne).
    const timer = $('[data-timer]');
    if (timer && timeUp() === !!$('[data-tick]')) {
      timer.outerHTML = timerHTML(Math.max(0, state.bench.minute));
      const tick = $('[data-tick]');
      if (tick) tick.addEventListener('click', runMinute);
    }
    updateLocks();
    updateMarks();
    setCaption(defaultCaption());
    updateRunFooter();
  }

  /* Tous les verrous de la paillasse, selon l'état (à rappeler après chaque
     changement) : chaque geste attend le précédent, et dit lequel. */
  function updateLocks() {
    const b = state.bench;
    const up = timeUp();
    const quiet = { icon: false };
    const onDevice = b.pos === 'device';
    lab.setLock($('[data-target="device"]'), !onDevice && b.mass.start == null ? LABELS.lockDevice : null, quiet);
    // Pas de verrou avant le thermomètre : il doit pouvoir s'y poser.
    lab.setLock($('[data-vessel]'), !b.measuring || !b.probe ? null
      : !up ? LABELS.lockVesselRunning : b.probe ? LABELS.lockProbeOut : null, quiet);
    // Thermomètre et film (ou ballon) : cadenas en pastille ; pas sur le
    // thermomètre plongé, qu'il faut lire.
    lab.setLock($('[data-probe]'), b.probe ? (up ? null : LABELS.lockProbeKeep)
      : up ? LABELS.lockProbeOver
        : !b.measuring ? LABELS.lockProbeStart : null, b.probe ? quiet : null);
    lab.setLock($('[data-cover]'), onDevice || up ? LABELS.lockCover : null);

    const first = $('[data-mass="start"]');
    const last = $('[data-mass="end"]');
    if (first) {
      const open = b.pos === 'balance' && !b.measuring;
      first.readOnly = !open;
      lab.setLock(first, open ? null : b.weighed.start ? LABELS.lockMassFixed : LABELS.lockMassStart);
    }
    if (last) {
      const open = b.pos === 'balance' && up;
      last.readOnly = !open;
      lab.setLock(last, open ? null : LABELS.lockMassEnd);
    }
    $$('[data-wait]').forEach(el => lab.setLock(el, LABELS.lockRow));
    const start = $('[data-start]');
    if (start) {
      const ready = onDevice && b.mass.start != null;
      lab.setLock(start, b.mass.start == null ? LABELS.lockStartMass
        : !onDevice ? LABELS.lockStartDevice(vesselName().the, deviceName().onto) : null, { missing: true, key: 'start' });
      start.classList.toggle('is-ready', ready);
    }

    const tick = $('[data-tick]');
    if (tick) {
      const ready = b.minute >= 0 && rowDone(b.minute);
      lab.setLock(tick, b.minute < 0 ? LABELS.lockTickSetup : ready ? null : LABELS.lockTickRow, { missing: true, key: 'tick' });
      tick.classList.toggle('is-ready', ready);
      const sub = $('[data-tick-sub]');
      if (sub) sub.textContent = b.minute < 0 ? LABELS.tickSetup : ready ? LABELS.tickReady : LABELS.tickRow;
    }
  }

  // Cases encore vides à signaler (bouton suivant touché trop tôt).
  function updateMarks() {
    const b = state.bench;
    const show = lab.state.showMissing;
    const mark = (el, on) => { if (el) el.classList.toggle('lab-is-missing', !!(show && on)); };
    mark($('[data-temp-cell]'), b.temps[b.minute] == null);
    mark($('[data-state-cell]'), !b.states[b.minute]);
    mark($('[data-mass="start"]'), b.weighed.start && b.mass.start == null);
    mark($('[data-mass="end"]'), b.weighed.end && b.mass.end == null);
  }

  function defaultCaption() {
    const b = state.bench;
    const the = vesselName().the;
    if (benchDone()) return LABELS.captionDone;
    if (timeUp()) {
      if (b.probe) return LABELS.captionProbeOut;
      return b.pos === 'balance' ? LABELS.captionMassEnd : LABELS.captionWeighEnd(the);
    }
    if (b.minute >= 0) {
      if (rowDone(b.minute)) return LABELS.captionTick;
      return b.minute === 0 ? LABELS.captionRow0 : LABELS.captionRow;
    }
    if (b.pos === 'bench') return LABELS.captionStart(the);
    if (b.pos === 'balance') return b.mass.start == null ? LABELS.captionMassStart : LABELS.captionToDevice(the, deviceName().onto);
    if (!b.measuring) return LABELS.captionReady(the);
    return LABELS.captionProbe(the);
  }

  // Phase 2 : le récipient pesé est posé ; il ne bouge plus jusqu'à la fin.
  function startMeasuring() {
    const b = state.bench;
    if (b.measuring || b.pos !== 'device' || b.mass.start == null) return;
    lab.release();
    b.measuring = true;
    renderExperiment();
  }

  function setCaption(text, warn) {
    const c = $('[data-caption]');
    if (!c) return;
    c.innerHTML = `<span>${gloss(text)}</span>`;
    c.classList.toggle('is-warning', !!warn);
  }

  /* Le récipient change de place. Sur la balance : première pesée (et
     l'hypothèse se fige), ou pesée finale une fois le temps écoulé. */
  function moveVessel(where) {
    const b = state.bench;
    lab.release();
    b.pos = where;
    if (where === 'balance') {
      state.started = true;
      b.weighed[timeUp() ? 'end' : 'start'] = true;
    }
    renderExperiment();
    lab.renderStepper();
    if (where !== 'balance') return;
    // L'affichage de la balance défile jusqu'à la masse.
    const value = massAt(Math.max(0, b.minute));
    const show = v => { const el = $('[data-mass-display]'); if (el) el.textContent = massText(v); };
    const token = lab.newScene();
    lab.tween(token, 600, k => show(value * k), ease.out).then(ok => { if (ok) show(value); });
    const input = $(`[data-mass="${timeUp() ? 'end' : 'start'}"]`);
    if (input) input.focus({ preventScroll: true });
  }

  // Le récipient, le thermomètre et le chronomètre à l'instant t.
  function drawTime(t) {
    const vessel = $('[data-vessel] svg');
    if (vessel) vessel.innerHTML = vesselInner(t, state.bench.covered);
    const temp = $('[data-temp]');
    if (temp) temp.textContent = deg(reading(t));
    const clock = $('[data-clock]');
    if (clock) clock.textContent = clockText(t);
  }

  /* Une minute passe. Elle avance tout de suite dans l'état : si
     l'animation est interrompue (fermeture, autre étape), il reste juste.
     Pendant l'animation, la paillasse ne répond pas (is-busy). */
  function runMinute() {
    const b = state.bench;
    if (b.minute < 0 || b.minute >= lastMinute()) return;
    const from = b.minute;
    b.minute = from + 1;
    lab.state.showMissing = false;
    renderExperiment(LABELS.captionRunning, from);
    $('.sc-run').classList.add('is-busy');
    $$('.lab-footer button').forEach(el => { el.disabled = true; });
    const token = lab.newScene();
    lab.tween(token, 1500, (k, raw) => drawTime(from + raw), ease.linear).then(ok => {
      if (!ok) return;
      renderExperiment();
      focusRow();
    });
  }

  /* Pied de page : recommencer la manipulation (une fois, même tirage,
     l'hypothèse reste), puis conclure. « Conclude » reste secondaire tant
     que l'expérience n'est pas finie ; il reste cliquable et dit ce qui
     manque. */
  function renderRunFooter() {
    lab.setFooter(lab.footerInfo('') + `<div class="lab-footer-actions">` +
      (state.started ? `<button type="button" class="lab-btn lab-btn-ghost" data-redo>${LABELS.redo}</button>` : '') +
      `<button type="button" class="lab-btn lab-btn-ghost" data-conclude>${LABELS.toConclude} →</button></div>`);
    const redo = $('[data-redo]');
    if (redo) {
      lab.setLock(redo, state.redos >= MAX_REDO ? LABELS.lockRedo : null);
      redo.addEventListener('click', async () => {
        if (!(await lab.confirm({ title: LABELS.redoTitle, text: LABELS.redoText, confirm: LABELS.redoYes, danger: true }))) return;
        state.redos++;
        state.bench = freshBench();
        state.concl = freshConcl();
        lab.state.showMissing = false;
        renderExperiment();
        lab.renderStepper();
        lab.save();
      });
    }
    $('[data-conclude]').addEventListener('click', () => lab.goToStep(3));
    updateRunFooter();
  }

  function updateRunFooter() {
    const b = state.bench;
    const done = benchDone();
    const missing = lab.state.showMissing && !done;
    const info = $('.lab-footer .lab-footer-info');
    if (info && !info.hasAttribute('data-lab-frozen')) {
      info.textContent = missing ? LABELS.missingRun : b.minute < 0 ? LABELS.runSetup : LABELS.runInfo(b.minute, lastMinute());
      info.classList.toggle('is-warning', missing);
    }
    const concl = $('[data-conclude]');
    if (concl) {
      concl.classList.toggle('lab-btn-primary', done);
      concl.classList.toggle('lab-btn-ghost', !done);
      lab.setLock(concl, done ? null : lockReason(2), { missing: true, key: 'conclude' });
    }
    // La barre d'étapes ne change qu'à la fin de l'expérience (Conclude s'ouvre).
    if (done !== stepperDone) { stepperDone = done; lab.renderStepper(); }
  }

  /* ===== Étape 3 : conclusion =====
     À gauche, le graphique et les deux masses de l'élève ; à droite, une
     réponse par sous-question (a : la température, b : la masse), puis le
     jugement de l'esquisse et du pari. */
  function conclusionParts() {
    const c = state.concl;
    return {
      temp: !!(c.during && c.temp != null && c.point),
      mass: !!(c.mass && c.particles),
      verdict: !!(c.vCurve && c.vBet)
    };
  }

  function conclusionsComplete() {
    return Object.values(conclusionParts()).every(Boolean);
  }

  const massNote = k => (state.bench.mass[k] == null ? DASH : massText(state.bench.mass[k]));
  const betText = () => LABELS.yourBet(state.bet ? LABELS.bets[state.bet] : DASH);

  function renderConclude() {
    const c = state.concl;
    const s = sit();
    const show = lab.state.showMissing;
    const parts = conclusionParts();
    const miss = k => (show && !parts[k] ? 'lab-is-missing' : '');
    const qs = LABELS.subQuestions[run.sit];
    const pick = (key, options, labelOf, aria) => selectHTML(`data-c="${key}"`, c[key], options, labelOf, aria, show);
    const tempInput = `<input type="text" inputmode="text" class="lab-input sc-concl-input ${show && c.temp == null ? 'lab-is-missing' : ''}" data-ct value="${c.temp == null ? '' : deg(c.temp)}" maxlength="5" autocomplete="off" spellcheck="false" aria-label="${escapeHtml(LABELS.conclTempAria)}">`;
    const verdict = (key, text) => `<div class="sc-verdict"><span class="sc-verdict-text">${text}</span>` +
      ['confirmed', 'rejected'].map(x => chipHTML(`data-v="${key}" data-val="${x}"`, LABELS[x], c[key] === x)).join('') + `</div>`;

    lab.body.innerHTML = `<div class="sc-conclude">` +
      `<section class="sc-graph-panel"><h3 class="lab-panel-title">${LABELS.resultsTitle}</h3>` +
        `<div class="sc-graph-wrap">${graphSVG()}</div>` +
        `<p class="sc-recap">${LABELS.massRecap(massNote('start'), massNote('end'))}</p></section>` +
      `<section class="sc-form">` +
        `<ol class="sc-qs">` +
          `<li class="sc-q ${miss('temp')}"><p class="sc-q-title">${gloss(qs[0])}</p>` +
            `<p class="sc-line">${LABELS.concl.during[run.sit](pick('during', DURING, x => LABELS.duringWords[x], LABELS.duringAria))}</p>` +
            `<p class="sc-line">${LABELS.concl.point(tempInput, pick('point', POINTS, x => LABELS.pointNames[x], LABELS.pointAria), LABELS.substances[s.substance])}</p></li>` +
          `<li class="sc-q ${miss('mass')}"><p class="sc-q-title">${gloss(qs[1])}</p>` +
            `<p class="sc-line">${LABELS.concl.mass(pick('mass', BETS, x => LABELS.massWords[x], LABELS.massWordAria))}</p>` +
            `<p class="sc-line">${LABELS.concl.particles(pick('particles', DURING, x => LABELS.particleWords[x], LABELS.particlesAria))}</p></li>` +
        `</ol>` +
        `<div class="sc-q sc-q-hyp ${miss('verdict')}"><p class="sc-q-title">${LABELS.hypothesisTitle}</p>` +
          `<div class="sc-hyp-recap">${sketchSVG(state.curve, [190, 77])}<p>${betText()}</p></div>` +
          verdict('vCurve', LABELS.verdictCurve) + verdict('vBet', LABELS.verdictBet) + `</div>` +
      `</section></div>`;

    const after = () => {
      if (lab.state.showMissing && conclusionsComplete()) lab.state.showMissing = false;
      renderConclude();
      lab.save();
    };
    $$('select[data-c]').forEach(sel => sel.addEventListener('change', () => { c[sel.dataset.c] = sel.value || null; after(); }));
    $$('[data-v]').forEach(btn => btn.addEventListener('click', () => { c[btn.dataset.v] = btn.dataset.val; after(); }));
    // La température s'écrit sans redessiner l'étape : le geste suivant
    // (une liste, « Check ») n'est pas coupé.
    const input = $('[data-ct]');
    bindField(input, parseTemp, deg, v => { c.temp = v; }, () => {
      if (c.temp != null) input.classList.remove('lab-is-missing');
      updateConcludeFooter();
    });

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
     Mesures : chaque température (à 1 °C près), chaque état et les deux
     masses, comparés à ce que montraient le thermomètre, le récipient et
     la balance. Masse : la réponse juste est celle que donnent les
     pesées de l'élève (flacon ouvert qui bout : la balance montre moins,
     et des particules sont parties) ; le récipient resté ouvert est
     relevé à part. Jugement : l'esquisse et le pari comparés à ses
     propres conclusions. */
  function evaluate() {
    const b = state.bench;
    const c = state.concl;
    const s = sit();
    const n = lastMinute();
    const misses = [];
    let good = 0;
    for (let m = 0; m <= n; m++) {
      const tOk = b.temps[m] != null && Math.abs(b.temps[m] - reading(m)) <= TEMP_TOL;
      const sOk = b.states[m] === stateAt(m);
      good += (tOk ? 1 : 0) + (sOk ? 1 : 0);
      if (!tOk || !sOk) misses.push({ m, tOk, sOk });
    }
    const real = { start: startMass(), end: endMass() };
    const massMiss = ['start', 'end'].filter(k => b.mass[k] == null || Math.abs(b.mass[k] - real[k]) > MASS_TOL + 1e-9);
    good += 2 - massMiss.length;
    const total = (n + 1) * 2 + 2;

    const duringOk = c.during === 'same';
    const tempOk = c.temp != null && Math.abs(c.temp - s.point) <= TEMP_TOL;
    const pointOk = c.point === s.pointName;
    const massOk = c.mass === trueMassWord();
    const particlesOk = c.particles === trueParticles();

    // La courbe que décrit la conclusion : avant et après, le sens du
    // chauffage ou du refroidissement ; pendant, ce que l'élève a conclu.
    const said = { up: 'up', same: 'flat', down: 'down' }[c.during];
    const shape = trueCurve();
    const shouldCurve = state.curve.every((v, i) => v === (i === 1 ? said : shape[i])) ? 'confirmed' : 'rejected';
    const shouldBet = state.bet && state.bet === c.mass ? 'confirmed' : 'rejected';

    return {
      misses, massMiss, real, good, total,
      duringOk, tempOk, pointOk, massOk, particlesOk, shouldCurve, shouldBet,
      measure: good === total,
      closed: b.covered,
      plateau: duringOk && tempOk && pointOk,
      mass: massOk && particlesOk,
      verdict: c.vCurve === shouldCurve && c.vBet === shouldBet
    };
  }

  const tempMissText = m => CHECK.tempMiss(m, state.bench.temps[m] == null ? null : deg(state.bench.temps[m]), deg(reading(m)));
  const stateMissText = m => CHECK.stateMiss(m, state.bench.states[m] ? LABELS.states[state.bench.states[m]] : null, LABELS.states[stateAt(m)]);
  const massMissText = (k, ev) => CHECK.massMiss(LABELS.massNames[k], state.bench.mass[k] == null ? null : num(state.bench.mass[k]), num(ev.real[k]));

  function missTexts(ev) {
    const out = ev.massMiss.map(k => massMissText(k, ev));
    ev.misses.forEach(x => {
      if (!x.tOk) out.push(tempMissText(x.m));
      if (!x.sOk) out.push(stateMissText(x.m));
    });
    return out;
  }

  // Les bonnes réponses, écrites avec les phrases de la conclusion.
  const rightDuring = () => LABELS.concl.during[run.sit](LABELS.duringWords.same);
  const rightPoint = () => LABELS.concl.point(deg(sit().point), LABELS.pointNames[sit().pointName], LABELS.substances[sit().substance]);
  const rightMass = () => LABELS.concl.mass(LABELS.massWords[trueMassWord()]);
  const rightParticles = () => LABELS.concl.particles(LABELS.particleWords[trueParticles()]);
  const massWhy = () => EXPLAIN.mass[trueMassWord() === 'less' ? 'lost' : 'same'];
  const closedNote = () => (state.bench.covered ? CHECK.closedOk[sit().cover]
    : sit().to ? CHECK.openOther : CHECK.openBoil(num(round1(startMass() - endMass()))));

  function criterionDetail(key, ev) {
    const c = state.concl;
    const verdictHead = ok => (ok ? `<p class="sc-ok">${CHECK.answerOk}</p>` : `<p class="sc-ko">${CHECK.answerWrong}</p>`);
    if (key === 'measure') {
      if (state.bench.minute < 0) return `<p>${CHECK.noExperiment}</p>`;
      const list = missTexts(ev);
      return `<p>${CHECK.measureScore(ev.good, ev.total)}</p>` +
        `<div class="sc-graph-panel sc-graph-mini"><div class="sc-legend"><span>${keySVG(false)}${LABELS.legendYours}</span><span>${keySVG(true)}${LABELS.legendReading}</span></div>` +
        `<div class="sc-graph-wrap">${graphSVG({ readings: true, h: 250 })}</div></div>` +
        (list.length
          ? `<ul class="sc-misslist">${list.slice(0, 4).map(t => `<li>${t}</li>`).join('')}${list.length > 4 ? `<li>${CHECK.more(list.length - 4)}</li>` : ''}</ul>`
          : `<p class="sc-ok">${CHECK.measureAllGood}</p>`);
    }
    if (key === 'closed') {
      return `<p class="${ev.closed ? 'sc-ok' : 'sc-ko'}">${gloss(closedNote())}</p><p class="sc-muted">${gloss(CHECK.closedWhy)}</p>`;
    }
    if (key === 'plateau') {
      return verdictHead(ev.plateau) +
        `<p><strong>${gloss(rightDuring())} ${gloss(rightPoint())}</strong></p>` +
        `<p>${gloss(EXPLAIN.energy[sit().energy])}</p><p class="sc-muted">${gloss(EXPLAIN.fixed[run.sit])}</p>`;
    }
    if (key === 'mass') {
      return verdictHead(ev.mass) +
        `<p><strong>${gloss(rightMass())} ${gloss(rightParticles())}</strong></p>` +
        `<p>${gloss(massWhy())}</p>` + (ev.closed || escapes() ? '' : `<p class="sc-muted">${gloss(closedNote())}</p>`);
    }
    const line = (ok, text) => `<p class="${ok ? 'sc-ok' : 'sc-ko'}">${text} ${ok ? CHECK.judgedOk : CHECK.judgedWrong}</p>`;
    return `<div class="sc-pair"><figure>${sketchSVG(state.curve, [230, 93])}<figcaption>${LABELS.yourSketch}</figcaption></figure>` +
      `<figure>${sketchSVG(trueCurve(), [230, 93])}<figcaption>${LABELS.realCurve}</figcaption></figure></div>` +
      line(c.vCurve === ev.shouldCurve, CHECK.verdictCurve[ev.shouldCurve]) +
      `<p>${betText()} ${c.mass ? CHECK.yourConclusion(LABELS.concl.mass(LABELS.massWords[c.mass])) : ''}</p>` +
      line(c.vBet === ev.shouldBet, CHECK.verdictBet[ev.shouldBet]) +
      (ev.shouldCurve === 'rejected' || ev.shouldBet === 'rejected' ? `<p class="sc-muted">${CHECK.rejectedNote}</p>` : '');
  }

  function renderCheck() {
    const ev = evaluate();
    const score = CRITERIA.filter(k => ev[k]).length;
    const rows = CRITERIA.map(k => `<button type="button" class="sc-crit ${ev[k] ? 'is-ok' : 'is-ko'} ${state.selected === k ? 'is-selected' : ''}" data-crit="${k}">` +
      `<span class="sc-crit-text"><strong>${LABELS.criteria[k]}</strong><small>${LABELS.criteriaSub[k]}</small></span>` +
      `<span class="sc-crit-mark" aria-label="${ev[k] ? LABELS.markCorrect : LABELS.markIncorrect}">${ev[k] ? '✓' : '✗'}</span></button>`).join('');

    lab.body.innerHTML = `<div class="sc-check">` +
      `<div class="sc-check-left">` +
        `<div class="lab-score"><span class="lab-score-num">${score}<small> / ${CRITERIA.length}</small></span><span class="lab-score-label">${LABELS.scoreLabel}</span></div>` +
        `<div class="sc-crit-list">${rows}</div>` +
        `<div class="sc-reminder sc-reminder-box">${questionsHTML()}</div>` +
      `</div>` +
      `<div class="sc-check-detail" aria-live="polite"><h3>${LABELS.criteria[state.selected]}</h3>${criterionDetail(state.selected, ev)}</div>` +
      `</div>`;

    $$('[data-crit]').forEach(btn => btn.addEventListener('click', () => {
      state.selected = btn.dataset.crit;
      renderCheck();
    }));
    lab.fillSpace($('.sc-check-detail'));
    lab.checkFooter();
  }

  /* ===== Rapport imprimable : contenu des 7 sections de la fiche outil FO3
     (en-tête, numérotation et mise en page : cadre commun) =====
     Les erreurs passent par mark() (lab-engine.js), dans l'ordre de
     lecture : récipient resté ouvert (mode opératoire), masse, température
     ou état mal notés (observations), valeur et nom du palier, nombre de
     particules (interprétation), réponses et jugements (conclusion). */
  function buildReport(mark) {
    const R = LABELS.report;
    const ev = evaluate();
    const b = state.bench;
    const c = state.concl;
    const s = sit();
    const n = lastMinute();
    const the = vesselName().the;
    const word = (text, ok, note) => (ok ? text : mark(text, plain(note)));

    const hyp = `<div class="sc-report-sketch">${sketchSVG(state.curve, [250, 101])}</div>` +
      `<ul>${state.curve.map((k, i) => `<li>${R.hypZone(plain(LABELS.zoneNames[run.sit][i]), k ? LABELS.slopes[k] : DASH)}</li>`).join('')}</ul>` +
      `<p>${R.hypBet(state.bet ? LABELS.bets[state.bet] : DASH)}</p>` +
      (state.because.trim() ? `<p>${R.because}: ${escapeHtml(state.because.trim())}</p>` : '');

    const steps = [
      b.covered ? R.stepCover[s.cover] : mark(R.stepOpen[s.cover], plain(closedNote())),
      R.stepWeigh(the), R.stepPlace(the, deviceName().onto), R.stepRead(n), R.stepEnd(the), R.stepGraph
    ];

    const massCell = k => (ev.massMiss.includes(k) ? mark(massNote(k), massMissText(k, ev)) : massNote(k));
    const masses = R.masses(massCell('start'), massCell('end'));
    const missAt = new Map(ev.misses.map(x => [x.m, x]));
    let rows = '';
    for (let m = 0; m <= n; m++) {
      const x = missAt.get(m);
      const temp = b.temps[m] == null ? DASH : deg(b.temps[m]);
      const st = b.states[m] ? LABELS.states[b.states[m]] : DASH;
      rows += `<tr><th>${m}</th><td>${x && !x.tOk ? mark(temp, tempMissText(m), { box: true }) : temp}</td>` +
        `<td>${x && !x.sOk ? mark(st, stateMissText(m), { box: true }) : st}</td></tr>`;
    }
    const observations = `<p>${masses}</p><div class="sc-report-results">` +
      `<table class="sc-report-table"><tr><th>${LABELS.tableTime}</th><th>${LABELS.tableTemp}</th><th>${LABELS.tableState}</th></tr>${rows}</table>` +
      `<div class="sc-report-graph">${graphSVG({ h: 400, size: [330, 300] })}</div></div>`;

    const point = LABELS.concl.point(
      c.temp == null ? DASH : word(deg(c.temp), ev.tempOk, CHECK.pointTemp(deg(s.point))),
      c.point ? word(LABELS.pointNames[c.point], ev.pointOk, EXPLAIN.fixed[run.sit]) : DASH,
      LABELS.substances[s.substance]);
    const particles = LABELS.concl.particles(c.particles
      ? word(LABELS.particleWords[c.particles], ev.particlesOk, `${CHECK.answerWrong} ${rightParticles()} ${massWhy()}`) : DASH);

    const during = LABELS.concl.during[run.sit](c.during
      ? word(LABELS.duringWords[c.during], ev.duringOk, `${CHECK.answerWrong} ${rightDuring()} ${EXPLAIN.energy[s.energy]}`) : DASH);
    const massLine = LABELS.concl.mass(c.mass
      ? word(LABELS.massWords[c.mass], ev.massOk, `${CHECK.answerWrong} ${rightMass()}`) : DASH);
    const verdictLine = (text, v, should, notes) => R.verdict(text, v ? word(LABELS[v], v === should, notes[should]) : DASH);
    const verdicts = `<ul><li>${verdictLine(LABELS.verdictCurve, c.vCurve, ev.shouldCurve, CHECK.verdictCurve)}</li>` +
      `<li>${verdictLine(LABELS.verdictBet, c.vBet, ev.shouldBet, CHECK.verdictBet)}</li></ul>`;

    const correction = CRITERIA.map(k => `<tr><th>${LABELS.criteria[k]}</th><td class="${ev[k] ? 'ok' : 'ko'}">${ev[k] ? '✓' : '✗'}</td></tr>`).join('');

    return {
      title: R.title,
      sections: [
        `<p>${plain(LABELS.bigQuestion)}</p><ol type="a">${LABELS.subQuestions[run.sit].map(q => `<li>${plain(q)}</li>`).join('')}</ol>`,
        hyp,
        `<p>${R.materialsLine(R.materials[run.sit], b.covered ? R.coverItem[s.cover] : '')}</p>`,
        `<ol>${steps.map(t => `<li>${t}</li>`).join('')}</ol>`,
        observations,
        `<p>${point}</p><p>${particles}</p>`,
        `<p>${during}</p><p>${massLine}</p>${verdicts}`
      ],
      correction: `<p><strong>${R.score(CRITERIA.filter(k => ev[k]).length, CRITERIA.length)}</strong></p>` +
        `<table class="sc-report-corr">${correction}</table>`
    };
  }

  lab = LabEngine.create({
    id: 'statechange',
    // Page d'accueil (Mission, voir lab-engine.js) : toujours la même, rien du tirage.
    briefing: () => ({
      heading: LABELS.briefTitle,
      intro: gloss(LABELS.briefTask),
      questionTitle: LABELS.yourQuestion,
      questions: [LABELS.briefQuestion].map(gloss),
      steps: LABELS.briefSteps.map((text, i) => ({
        text: gloss(text),
        detail: gloss(LABELS.briefDetails[i]),
        pics: i === 1 ? [
          { html: `<svg viewBox="4 238 132 64" aria-hidden="true" focusable="false">${balanceInner(0)}</svg>`, label: LABELS.tools.balance },
          { html: PROBE_ICON, label: LABELS.tools.probe }
        ] : null
      })),
      checks: Object.values(LABELS.criteria)
    }),
    title: LABELS.title,
    glossary: GLOSSARY,
    reset,
    stepComplete,
    lockReason,
    isStarted: () => state.curve.some(Boolean) || !!state.bet || state.started,
    render: { 1: renderPredict, 2: () => renderExperiment(), 3: renderConclude, 4: renderCheck },
    report: buildReport,
    version: 1,
    save: () => ({ run, state }),
    // Une minute interrompue en cours d'animation est déjà comptée : la
    // scène se redessine à la minute atteinte.
    load(data) {
      const r = data.run, s = data.state;
      if (!r || !SITUATIONS[r.sit] || typeof r.seed !== 'string' ||
        !s || !Array.isArray(s.curve) || !s.concl || !s.bench || !s.bench.mass || !s.bench.weighed ||
        !Array.isArray(s.bench.temps) || !Array.isArray(s.bench.states)) throw new Error('labProgress');
      run = r;
      state = s;
      // Sauvegarde d'avant les trois phases : déduite du thermomètre.
      if (typeof s.bench.measuring !== 'boolean') s.bench.measuring = s.bench.probe || s.bench.minute >= 0;
      if (!CRITERIA.includes(state.selected)) state.selected = CRITERIA[0];
      stepperDone = null;
      conclReady = null;
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
          situation: run.sit,
          closed: state.bench.covered,
          redos: state.redos,
          sketch: state.curve.map(k => k || '-').join('-'),
          bet: state.bet,
          measuresRight: ev.good,
          measures: ev.total
        }
      };
    }
  });
})();
