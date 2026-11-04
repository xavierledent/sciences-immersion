/* ===== Labo virtuel « The separation challenge » (chem2) : séparer un mélange =====

   Simulation propre à ce labo, commune aux deux filières ; ses textes sont
   dans le dossier du chapitre, un fichier par langue (lab-separation.en.js,
   lab-separation.nl.js). Le cadre commun (modale, barre d'étapes, verrous,
   traduction, objet en main, rapport imprimé) est dans lab-engine.js.
   Ordre de chargement : moteur, textes, ce fichier.

   Le labo réel : la Mission 7 du cours (« Separation challenge ») et son
   journal de séparation (separation log) : observer le mélange, planifier
   l'ordre des séparations, choisir les outils sur le bureau du professeur,
   remplir le journal, nommer les techniques (fiche des techniques).
   Ici, un seul pot par labo ; c'est le mélange qui change d'un labo à
   l'autre (avec l'accord de l'enseignant, pas ses mélanges réels).

   Tiré au sort : le mélange (14 dans la réserve, trois ou quatre
   constituants ; celui qui demande une distillation sort rarement, et le
   montage de distillation n'est sur le bureau que pour lui), l'ordre des
   constituants sur l'étiquette du pot et la place des morceaux dessinés.

   Le modèle : chaque constituant a ses propriétés (taille, aimanté,
   soluble, liquide, flotte, température d'ébullition). Un outil posé sur
   un récipient sépare sa partie en deux (la partie retirée va dans un
   nouveau récipient, ou dans l'air pour un liquide qui s'évapore), ou ne
   change rien : la légende dit alors ce qu'on voit. Un mauvais ordre a des
   conséquences : chauffer avant de filtrer laisse le sable et le sel
   ensemble, et l'élève reprend un nouvel échantillon.

   Déroulé :
     1. Predict    — A. observer le pot : phases, homogène ou hétérogène,
                     état de chaque constituant (solide, liquide, invisible) ;
                     B. le plan (l'hypothèse) : les gestes dans l'ordre, ce
                     qui reste à la fin ; si un solide est dissous, un pari
                     (« il a disparu » / « il est toujours dans l'eau »)
     2. Experiment — les outils du bureau sur les récipients ; le journal de
                     séparation : pour chaque séparation, ce qu'on retire,
                     l'outil, ce qui reste
     3. Conclude   — nommer chaque technique et dire pourquoi elle marche
                     (fiche des techniques) ; s'il y a une solution : le
                     soluté est-il encore dans l'eau, soluté et solvant ; le
                     plan a-t-il marché, sinon pourquoi
     4. Check      — 5 vérifications : observation, séparation, journal,
                     techniques, conclusion ; rapport (FO3) */

(function () {
  'use strict';

  const { escapeHtml, shuffle, mulberry32, seedFrom, lerp, ease, reduceMotion } = LabEngine.util;

  // Cadre commun, créé en fin de fichier (LabEngine.create).
  let lab;
  const $ = sel => lab.$(sel);
  const $$ = sel => lab.$$(sel);
  const gloss = text => lab.gloss(text);

  /* ===== Textes =====
     Dans le dossier du chapitre, un fichier par langue, chargé avant
     celui-ci. */
  const {
    labels: LABELS, glossary: GLOSSARY, comps: COMP_TEXT, captions: CAPTIONS, check: CHECK, notebook: NOTEBOOK
  } = LabEngine.textFor('separation');

  /* ===== Le modèle =====
     Chaque constituant : solide (taille : big, grain, powder ; aimanté ;
     soluble dans l'eau) ou liquide (température d'ébullition, flotte sur
     l'eau). Un récipient contient une partie du mélange ; un outil posé sur
     un récipient le sépare en deux parties, ou ne change rien. */
  const COMPS = {
    sand: { solid: true, size: 'powder' },
    ironFilings: { solid: true, size: 'powder', mag: true },
    salt: { solid: true, size: 'powder', sol: true },
    sugar: { solid: true, size: 'powder', sol: true },
    flour: { solid: true, size: 'powder' },
    rice: { solid: true, size: 'grain' },
    lentils: { solid: true, size: 'grain' },
    pebbles: { solid: true, size: 'big' },
    nails: { solid: true, size: 'big', mag: true },
    paperClips: { solid: true, size: 'big', mag: true },
    marbles: { solid: true, size: 'big' },
    water: { liquid: true, bp: 100, aq: true },
    alcohol: { liquid: true, bp: 78, aq: true },
    oil: { liquid: true, floats: true }
  };

  /* La réserve de mélanges : trois ou quatre constituants. w : poids du
     tirage (la distillation, en bonus, sort rarement : 3 fois sur 29).
     m15 et m16 sont homogènes (une seule phase) : avec ces outils, seule
     la distillation les sépare. */
  const MIXTURES = {
    m1: { comps: ['sand', 'ironFilings', 'water'], w: 2 },
    m2: { comps: ['sand', 'salt', 'water'], w: 2 },
    m3: { comps: ['pebbles', 'oil', 'water'], w: 2 },
    m4: { comps: ['rice', 'flour', 'paperClips'], w: 2 },
    m5: { comps: ['pebbles', 'sand', 'nails'], w: 2 },
    m6: { comps: ['sand', 'sugar', 'water'], w: 2 },
    m7: { comps: ['sand', 'oil', 'water'], w: 2 },
    m8: { comps: ['lentils', 'ironFilings', 'salt'], w: 2 },
    m9: { comps: ['marbles', 'salt', 'water'], w: 2 },
    m10: { comps: ['sand', 'alcohol', 'water'], w: 1 },
    m11: { comps: ['sand', 'ironFilings', 'salt', 'water'], w: 2 },
    m12: { comps: ['pebbles', 'sand', 'oil', 'water'], w: 2 },
    m13: { comps: ['marbles', 'ironFilings', 'sugar', 'water'], w: 2 },
    m14: { comps: ['nails', 'oil', 'salt', 'water'], w: 2 },
    m15: { comps: ['salt', 'alcohol', 'water'], w: 1 },
    m16: { comps: ['sugar', 'alcohol', 'water'], w: 1 }
  };

  const BASE_TOOLS = ['tweezers', 'magnet', 'sieve', 'filter', 'decant', 'heat'];
  const HOT_TOOLS = ['heat', 'distil'];
  // Le montage de distillation n'est sur le bureau que si le mélange l'exige.
  const toolsFor = comps => (comps.includes('alcohol') ? BASE_TOOLS.concat('distil') : BASE_TOOLS);

  // La technique de chaque outil, et pourquoi elle marche (fiche des techniques).
  const TECH = {
    tweezers: { name: 'manual', why: 'big' },
    magnet: { name: 'magnetic', why: 'magnetic' },
    sieve: { name: 'sifting', why: 'size' },
    filter: { name: 'filtration', why: 'solid' },
    decant: { name: 'decantation', why: 'floats' },
    heat: { name: 'evaporation', why: 'boils' },
    distil: { name: 'distillation', why: 'bp' }
  };
  const TECH_NAMES = ['manual', 'magnetic', 'sifting', 'filtration', 'decantation', 'evaporation', 'distillation'];
  const WHYS = ['big', 'magnetic', 'size', 'solid', 'floats', 'boils', 'bp'];
  const STATES = ['solid', 'liquid', 'hidden'];
  const PHASES = ['1', '2', '3', '4'];
  const TYPES = ['homogeneous', 'heterogeneous'];
  const REASONS = ['order', 'tool', 'last'];

  const hasAq = P => P.some(c => COMPS[c].aq);
  const isDissolved = (c, P) => !!COMPS[c].sol && hasAq(P);
  const solidsIn = P => P.filter(c => COMPS[c].solid && !isDissolved(c, P));
  const liquidsIn = P => P.filter(c => COMPS[c].liquid);
  const minus = (P, R) => P.filter(c => !R.includes(c));
  const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));

  // Phases visibles : chaque solide non dissous, la phase aqueuse, l'huile.
  function phasesOf(P) {
    return solidsIn(P).length + (hasAq(P) ? 1 : 0) + (P.includes('oil') ? 1 : 0);
  }

  // Ce qu'on voit d'un constituant dans le mélange : solide, liquide, invisible.
  function stateOf(c, P) {
    if (COMPS[c].liquid) return 'liquid';
    return isDissolved(c, P) ? 'hidden' : 'solid';
  }

  /* Un outil sur une partie P (target : la pièce visée par la pince).
     → { ok, removed, left, key } ; key nomme ce qu'on observe (légende).
     removed : la partie qu'on retire (ce qu'attire l'aimant, ce qui reste
     dans le tamis, sur le papier ou dans l'ampoule à décanter, le liquide
     qui s'évapore ou que l'on distille). */
  function applyTool(tool, P, target) {
    const fail = key => ({ ok: false, key, removed: [], left: P });
    if (P.length < 2) return fail('single');
    const done = (removed, key) => ({ ok: true, key, removed, left: minus(P, removed) });
    const solids = solidsIn(P);
    const liquids = liquidsIn(P);
    if (tool === 'magnet') {
      const r = solids.filter(c => COMPS[c].mag);
      return r.length ? done(r, 'magnet') : fail('magnetNone');
    }
    if (tool === 'tweezers') {
      if (!solids.length || !target || !solids.includes(target)) return fail('tweezersNone');
      return COMPS[target].size === 'big' ? done([target], 'tweezers') : fail('tweezersSmall');
    }
    if (tool === 'sieve') {
      const r = solids.filter(c => COMPS[c].size !== 'powder');
      if (!r.length) return fail('sieveAll');
      if (r.length === P.length) return fail('sieveNone');
      return done(r, 'sieve');
    }
    if (tool === 'filter') {
      if (!liquids.length) return fail('filterDry');
      if (!solids.length) return fail('filterNothing');
      return done(solids, 'filter');
    }
    // L'ampoule à décanter : des liquides seulement (un solide boucherait
    // le robinet) ; la couche du bas s'écoule, l'huile reste dans l'ampoule.
    if (tool === 'decant') {
      if (!liquids.length) return fail('decantDry');
      if (solids.length) return fail('decantSolids');
      if (P.includes('oil') && hasAq(P)) return done(['oil'], 'decant');
      return fail('decantOne');
    }
    if (tool === 'heat') {
      const gone = liquids.filter(c => COMPS[c].bp && COMPS[c].bp <= 100);
      if (!gone.length) return fail('heatNothing');
      return done(gone, gone.length === P.length ? 'heatLost' : 'heat');
    }
    if (tool === 'distil') {
      const boil = liquids.filter(c => COMPS[c].bp).sort((a, b) => COMPS[a].bp - COMPS[b].bp);
      if (!boil.length) return fail('distilNothing');
      return done([boil[0]], 'distil');
    }
    return fail('single');
  }

  // Les pièces que la pince peut viser dans P (tous les solides visibles :
  // c'est à l'élève de voir qu'une poudre ne se prend pas à la pince).
  const targetsOf = (tool, P) => (tool === 'tweezers' ? solidsIn(P) : [null]);

  /* Séparation complète : chaque récipient (et chaque vapeur partie dans
     l'air) ne contient qu'un constituant. parts, air : listes de
     constituants. */
  const separatedParts = (parts, air) => parts.concat(air).every(p => p.length === 1);

  /* Recherche d'un chemin, en profondeur : fixed (suite d'outils imposée,
     le plan de l'élève) ou n'importe quels outils de pool, au plus steps
     séparations. lastOk(left) : condition sur ce qui reste après la
     dernière séparation. Rend la liste des gestes { tool, target, removed,
     left } ou null. */
  function search(parts, air, steps, pool, fixed, lastOk) {
    if (separatedParts(parts, air)) return fixed && fixed.length ? null : [];
    if (!steps) return null;
    const tools = fixed ? [fixed[0]] : pool;
    for (const tool of tools) {
      for (let i = 0; i < parts.length; i++) {
        for (const target of targetsOf(tool, parts[i])) {
          const r = applyTool(tool, parts[i], target);
          if (!r.ok || r.key === 'heatLost') continue;
          const nextParts = parts.slice(0, i).concat(parts.slice(i + 1));
          const nextAir = air.slice();
          if (tool === 'heat') nextAir.push(r.removed); else nextParts.push(r.removed);
          if (r.left.length) nextParts.push(r.left);
          const rest = search(nextParts, nextAir, steps - 1, pool, fixed ? fixed.slice(1) : null, lastOk);
          if (!rest) continue;
          // Ampoule à décanter : chaque couche peut être « ce qui reste ».
          if (!rest.length && lastOk && !lastOk(r.left) && !(tool === 'decant' && lastOk(r.removed))) continue;
          return [{ tool, target, removed: r.removed, left: r.left }].concat(rest);
        }
      }
    }
    return null;
  }

  /* ===== Le tirage ===== */
  function drawMixture() {
    const ids = Object.keys(MIXTURES);
    let n = Math.random() * ids.reduce((s, id) => s + MIXTURES[id].w, 0);
    const mix = ids.find(id => (n -= MIXTURES[id].w) < 0) || ids[0];
    return { mix, comps: shuffle(MIXTURES[mix].comps), seed: Math.floor(Math.random() * 1e9) };
  }

  let run;      // le tirage
  let state;    // le travail de l'élève

  const toolsHere = () => toolsFor(run.comps);
  const steps = () => run.comps.length - 1;
  const soluteOf = () => run.comps.find(c => isDissolved(c, run.comps)) || null;

  function freshBench() {
    return { parts: [{ id: 'jar', num: 0, vessel: 'jar', comps: run.comps.slice() }], air: [], next: 1, log: [], lost: false };
  }

  function reset() {
    run = drawMixture();
    state = {
      obs: { phases: null, type: null, states: {} },
      plan: Array(steps()).fill(null),
      last: null,
      bet: null,
      because: '',
      started: false,
      goggles: false,
      sample: 1,
      bench: freshBench(),
      actions: [],     // tous les gestes, échantillons précédents compris
      concl: { tech: [], still: null, solute: null, solvent: null, worked: null, reason: null },
      selected: 'observe'
    };
  }

  /* ===== Noms ===== */
  const compName = c => COMP_TEXT[c].name;
  const compThe = c => COMP_TEXT[c].the;
  // Ce qu'on voit d'un constituant dans une partie (un solide dissous ne se voit pas).
  function looksOf(P) {
    const out = [];
    P.forEach(c => {
      if (isDissolved(c, P)) return;
      const look = COMPS[c].sol && !hasAq(P) ? CAPTIONS.crystals : COMP_TEXT[c].look;
      if (!out.includes(look)) out.push(look);
    });
    return out;
  }
  const looksText = P => LABELS.list(looksOf(P));
  const partName = p => (p.id === 'jar' ? LABELS.jarName : LABELS.containerName(p.num));
  // Liste de noms dans une phrase ou une case : majuscule au premier seulement.
  const namesText = list => (list && list.length ? LABELS.list(list.map((c, i) => (i ? compName(c).toLowerCase() : compName(c)))) : '—');

  /* ===== Le banc ===== */
  const bench = () => state.bench;
  const partById = id => bench().parts.find(p => p.id === id);
  const separated = () => !bench().lost && separatedParts(bench().parts.map(p => p.comps), bench().air);
  // Plus moyen d'aller au bout avec ce qui reste : il faut un nouvel échantillon.
  function deadEnd() {
    if (separated()) return false;
    if (bench().lost) return true;
    return !search(bench().parts.map(p => p.comps), bench().air, run.comps.length, toolsHere(), null);
  }
  const logRows = () => bench().log;
  const rowDone = r => r.ans.removed.length > 0 && !!r.ans.tool && r.ans.left.length > 0;
  const logMissing = () => logRows().filter(r => !rowDone(r)).length;
  const runDone = () => separated() && logMissing() === 0;

  /* Appliquer un outil sur un récipient (à la fin de son animation). La
     partie retirée part dans un nouveau récipient (coupelle pour des
     solides, bécher pour un liquide, ballon pour la distillation) et le
     reste reste en place, sauf :
       — filtration : tout le mélange est versé ; les solides restent dans
         l'entonnoir (sur le papier), le liquide passe dans un bécher ;
       — ampoule à décanter : tout est versé dans l'ampoule ; la couche du
         bas s'écoule dans un bécher, l'huile reste dans l'ampoule ;
       — chauffage : le mélange est versé dans une coupelle sur la plaque
         (sauf s'il y est déjà) ; le liquide part dans l'air.
     Les nouveaux récipients s'ajoutent au bout de la paillasse, dans
     l'ordre de newParts (les animations les posent d'avance). */
  function newParts(tool, p, r) {
    if (!r.ok) return [];
    if (tool === 'heat') return r.key === 'heatLost' || p.vessel === 'dish' ? [] : [{ vessel: 'dish', comps: r.left }];
    if (tool === 'filter') return [{ vessel: 'beaker', comps: r.left }, { vessel: 'funnel', comps: r.removed }];
    if (tool === 'decant') return [{ vessel: 'beaker', comps: r.left }, { vessel: 'sepfunnel', comps: r.removed }];
    const liquid = r.removed.some(c => COMPS[c].liquid);
    return [{ vessel: tool === 'distil' ? 'flask' : liquid ? 'beaker' : 'dish', comps: r.removed }];
  }

  // Les récipients à venir, numérotés comme ils le seront (dessin identique avant et après).
  function plannedParts(tool, p, r) {
    return newParts(tool, p, r).map((x, i) => Object.assign({ id: `c${bench().next + i}`, num: bench().next + i }, x));
  }
  function act(tool, partId, target) {
    const b = bench();
    const p = partById(partId);
    if (!p) return null;
    const r = applyTool(tool, p.comps, target);
    state.started = true;
    state.actions.push({ s: state.sample, tool, part: partName(p), target: target || null, ok: r.ok && r.key !== 'heatLost', key: r.key, removed: r.removed, left: r.left });
    if (!r.ok) return r;
    const added = plannedParts(tool, p, r);
    if (tool === 'heat') b.air.push(r.removed);
    if (r.key === 'heatLost') b.lost = true;
    // Le récipient d'origine : vidé (filtration, ampoule à décanter, versé dans la coupelle, tout évaporé) ou avec ce qui reste.
    const emptied = tool === 'filter' || tool === 'decant' || r.key === 'heatLost' || (tool === 'heat' && p.vessel !== 'dish');
    if (emptied) b.parts = b.parts.filter(x => x !== p);
    else p.comps = r.left;
    b.parts = b.parts.concat(added);
    b.next += added.length;
    if (r.key === 'heatLost') return r;
    b.log.push({ tool, removed: r.removed, left: r.left, ans: { removed: [], tool: null, left: [] } });
    return r;
  }

  /* ===== Dessins ===== */
  const ICONS = {
    tweezers: '<path d="M9 3l7 21M23 3l-7 21" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="16" cy="25.5" r="2.4" fill="#8d939a" stroke="currentColor" stroke-width="1.2"/>',
    magnet: '<path d="M8 25V14a8 8 0 0 1 16 0v11" fill="none" stroke="#d64545" stroke-width="6"/><rect x="5" y="22" width="6" height="5" fill="#c7ced6" stroke="currentColor" stroke-width="1.2"/><rect x="21" y="22" width="6" height="5" fill="#c7ced6" stroke="currentColor" stroke-width="1.2"/>',
    sieve: '<ellipse cx="14" cy="13" rx="11" ry="4" fill="#eef1f4" stroke="currentColor" stroke-width="1.6"/><path d="M3 13q11 14 22 0" fill="#f6f8fa" stroke="currentColor" stroke-width="1.6"/><path d="M8 15.5l12 0M7 18.5l14 0M10 21l8 0M11 13v8M17 13v8" stroke="currentColor" stroke-width=".8"/><path d="M25 12l5-3" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    filter: '<path d="M4 6h24L18.5 18v9h-5v-9z" fill="#f4f7f9" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 8.5h16l-7 8.5h-2z" fill="#ffffff" stroke="#b9c3cc" stroke-width="1"/><path d="M16 27.5v2.5" stroke="#5aa9dd" stroke-width="2" stroke-linecap="round"/>',
    decant: '<path d="M14 3V7C8 9.5 6 14 8 17.5C9.5 20 13 21.5 15 23V30H17V23C19 21.5 22.5 20 24 17.5C26 14 24 9.5 18 7V3Z" fill="#eef5fa"/>' +
      '<path d="M7.3 14.4C7.3 15.6 7.5 16.6 8 17.5C9.5 20 13 21.5 15 23H17C19 21.5 22.5 20 24 17.5C24.5 16.6 24.7 15.6 24.7 14.4Z" fill="#8fd0ee"/>' +
      '<path d="M8 11.8H24C24.4 12.6 24.7 13.5 24.7 14.4H7.3C7.3 13.5 7.6 12.6 8 11.8Z" fill="#f3c63b"/>' +
      '<path d="M14 3V7C8 9.5 6 14 8 17.5C9.5 20 13 21.5 15 23V30H17V23C19 21.5 22.5 20 24 17.5C26 14 24 9.5 18 7V3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M11.5 25.5h9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    heat: '<path d="M8 11h16l-2 7H10z" fill="#ffffff" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><rect x="4" y="20" width="24" height="6" rx="2" fill="#5c6671" stroke="currentColor" stroke-width="1.4"/><path d="M8 23h16" stroke="#ef7b45" stroke-width="2" stroke-linecap="round"/><path d="M13 8c-1-1.5 1-2.5 0-4M19 8c-1-1.5 1-2.5 0-4" fill="none" stroke="#9fb3c4" stroke-width="1.5" stroke-linecap="round"/>',
    distil: '<circle cx="9" cy="20" r="6" fill="#eef5fa" stroke="currentColor" stroke-width="1.5"/><path d="M9 14V8l18 7" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M14 11l12 5" stroke="#8fd0ee" stroke-width="3.5"/><path d="M24 20h6l-1 8h-4z" fill="#eef5fa" stroke="currentColor" stroke-width="1.4"/><path d="M5 22.5h8" stroke="#8fd0ee" stroke-width="3"/>',
    goggles: '<path d="M3 12h26v7a4 4 0 0 1-4 4h-4l-3-3h-4l-3 3H7a4 4 0 0 1-4-4z" fill="#d7eefc" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M3 14l-1.5-2M29 14l1.5-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
  };
  const icon = (id, cls) => `<svg class="sp-icon ${cls || ''}" viewBox="0 0 32 32" aria-hidden="true" focusable="false">${ICONS[id]}</svg>`;

  /* Les récipients : viewBox 120 × 140. inner : la zone où dessiner le
     contenu (x0, y0, x1, y1) ; shape : le contour (aussi la découpe). */
  const VESSELS = {
    jar: { shape: 'M20 24V124a8 8 0 0 0 8 8H92a8 8 0 0 0 8-8V24', inner: [21, 30, 99, 131], rim: true },
    beaker: { shape: 'M24 22V126a6 6 0 0 0 6 6H90a6 6 0 0 0 6-6V22', inner: [25, 44, 95, 131], spout: true },
    dish: { shape: 'M10 100Q12 130 32 131H88Q108 130 110 100', inner: [12, 108, 108, 130] },
    flask: { shape: 'M50 30V62L22 122a7 7 0 0 0 6 10H92a7 7 0 0 0 6-10L70 62V30', inner: [24, 98, 96, 131] },
    // Ce qui reste sur le papier filtre : l'entonnoir et son papier plié.
    funnel: {
      shape: 'M16 40H104L68 88V128H52V88Z', inner: [36, 58, 84, 88],
      under: '<path d="M24 43H96L63 84H57Z" fill="#ffffff" stroke="#c4cdd5" stroke-width="1.2"/>'
    },
    /* L'ampoule à décanter sur son support (stand : derrière ; ring :
       l'anneau, devant), le robinet en bas de la poire (tap(angle) : 0
       fermé, 90 ouvert). Le liquide s'arrête au robinet (y 114). */
    sepfunnel: {
      shape: 'M54 14V26C32 38 22 58 30 76C37 89 50 96 56 102V128H64V102C70 96 83 89 90 76C98 58 88 38 66 26V14',
      inner: [24, 62, 96, 114],
      stand: '<g class="sp-stand"><path d="M110 30V130" stroke="#8d97a1" stroke-width="3.2" stroke-linecap="round"/>' +
        '<rect x="96" y="128" width="24" height="5" rx="1.5" fill="#8d97a1"/><path d="M84 86H110" stroke="#8d97a1" stroke-width="2.4"/></g>',
      ring: '<g class="sp-stand"><ellipse cx="60" cy="86" rx="24" ry="3" fill="none" stroke="#8d97a1" stroke-width="2.4"/></g>',
      tap: a => `<g transform="rotate(${a} 60 117)"><rect x="47" y="114.5" width="26" height="5" rx="2" fill="#c7ced6" stroke="#55606b" stroke-width="1.2"/></g>` +
        '<circle cx="60" cy="117" r="3.4" fill="#e9eef2" stroke="#55606b" stroke-width="1.2"/>'
    }
  };

  // Morceaux dessinés, par constituant. r : tirage (positions, teintes).
  function particle(c, x, y, r, small) {
    const k = small ? 0.8 : 1;
    switch (c) {
      case 'sand': return `<circle cx="${x}" cy="${y}" r="${1.25 * k}" fill="${r() < 0.5 ? '#c99d55' : '#e2c287'}"/>`;
      case 'ironFilings': return `<path d="M${x} ${y}l${(2.6 * k).toFixed(1)} ${(r() * 2 - 1).toFixed(1)}" stroke="#373c42" stroke-width="${1.3 * k}" stroke-linecap="round"/>`;
      case 'flour': return `<circle cx="${x}" cy="${y}" r="${1.3 * k}" fill="#fdfbf6" stroke="#d6cdb8" stroke-width=".35"/>`;
      case 'salt': case 'sugar': return `<rect x="${x}" y="${y}" width="${2.8 * k}" height="${2.8 * k}" transform="rotate(${Math.round(r() * 40)} ${x} ${y})" fill="#ffffff" stroke="#9aa6b2" stroke-width=".5"/>`;
      case 'rice': return `<ellipse cx="${x}" cy="${y}" rx="${3.2 * k}" ry="${1.3 * k}" transform="rotate(${Math.round(r() * 180)} ${x} ${y})" fill="#fbf8ef" stroke="#cdc4ac" stroke-width=".5"/>`;
      case 'lentils': return `<ellipse cx="${x}" cy="${y}" rx="${2.4 * k}" ry="${1.9 * k}" fill="${r() < 0.5 ? '#ad6a36' : '#c07a42'}" stroke="#7d4a22" stroke-width=".4"/>`;
      case 'pebbles': {
        const tone = ['#8d939a', '#a3a8ad', '#7a8088', '#b0a89d'][Math.floor(r() * 4)];
        return `<ellipse cx="${x}" cy="${y}" rx="${6.5 * k}" ry="${4.6 * k}" fill="${tone}" stroke="#5e646b" stroke-width=".8"/>`;
      }
      case 'nails': {
        const a = Math.round(r() * 160 - 80);
        return `<g transform="rotate(${a} ${x} ${y})"><path d="M${x - 7 * k} ${y}h${13 * k}l${2 * k} .1" stroke="#5a616b" stroke-width="${1.6 * k}" stroke-linecap="round"/><path d="M${x - 7 * k} ${y - 2.4 * k}v${4.8 * k}" stroke="#4a5058" stroke-width="${1.8 * k}" stroke-linecap="round"/></g>`;
      }
      case 'paperClips': {
        const a = Math.round(r() * 180);
        return `<rect x="${x - 6 * k}" y="${y - 2 * k}" width="${12 * k}" height="${4 * k}" rx="${2 * k}" transform="rotate(${a} ${x} ${y})" fill="none" stroke="#8e98a3" stroke-width="${1.1 * k}"/>`;
      }
      case 'marbles': {
        const tone = ['#3f8fd8', '#e0574f', '#47b36b', '#f2b233'][Math.floor(r() * 4)];
        return `<circle cx="${x}" cy="${y}" r="${4.6 * k}" fill="${tone}" stroke="rgba(0,0,0,.25)" stroke-width=".6"/><circle cx="${x - 1.4 * k}" cy="${y - 1.5 * k}" r="${1.2 * k}" fill="#ffffff" fill-opacity=".7"/>`;
      }
      default: return '';
    }
  }

  const COUNT = { powder: 46, grain: 26, big: 7 };
  const POWDER_FILL = { sand: '#dcb978', ironFilings: '#5a5f66', flour: '#f3eee2', salt: '#f4f6f8', sugar: '#f6f6f2' };

  /* Le contenu d'une partie dans la zone [x0, y0, x1, y1] : liquides (phase
     aqueuse, huile au-dessus), solides au fond ; un mélange sec forme un
     petit tas. level (animations) : hauteur de la colonne de liquide, de 0
     à 1 ; l'huile garde son épaisseur au-dessus de l'eau (l'eau s'évapore),
     sauf si all : on verse tout, l'huile part à la fin. */
  function contentsSVG(P, box, seed, small, level, all) {
    const [x0, y0, x1, y1] = box;
    const r = mulberry32(seed);
    const h = y1 - y0, w = x1 - x0;
    const liquids = liquidsIn(P);
    const solids = solidsIn(P);
    const aq = hasAq(P), oil = P.includes('oil');
    let out = '';
    const scale = small ? 0.55 : 1;
    if (liquids.length) {
      const lv = level == null ? 1 : Math.max(0, Math.min(1, level));
      const full = y1 - (y0 + h * (small ? 0.18 : 0.3));
      const oilH = aq && oil ? h * 0.14 : 0;
      const aqH = aq ? (full - oilH) * lv : 0;
      const oilCol = aq ? (all ? oilH * Math.min(1, lv * 5) : oilH) : full * lv;
      const aqTop = y1 - aqH;
      if (oil && oilCol > 0.3) out += `<rect x="${x0}" y="${aqTop - oilCol}" width="${w}" height="${oilCol}" fill="#f3c63b" fill-opacity=".8"/>`;
      if (aq && aqH > 0.3) {
        out += `<rect x="${x0}" y="${aqTop}" width="${w}" height="${aqH}" fill="#8fcbef" fill-opacity=".5"/>`;
        out += `<path d="M${x0} ${aqTop}h${w}" stroke="#6fb6e4" stroke-width="1"/>`;
      }
      // Solides au fond : la poudre en couche, les morceaux par-dessus.
      const powders = solids.filter(c => COMPS[c].size === 'powder');
      const bandH = powders.length ? Math.min(h * 0.22, 7 + 4 * powders.length) * (small ? 0.7 : 1) : 0;
      if (powders.length) {
        out += `<rect x="${x0}" y="${y1 - bandH}" width="${w}" height="${bandH}" fill="${POWDER_FILL[powders[0]]}"/>`;
        powders.forEach(c => {
          for (let i = 0; i < COUNT.powder * scale * (w / 80); i++) out += particle(c, (x0 + 2 + r() * (w - 4)).toFixed(1), (y1 - 1 - r() * (bandH - 2)).toFixed(1), r, small);
        });
      }
      solids.filter(c => COMPS[c].size !== 'powder').forEach(c => {
        const n = Math.max(2, Math.round(COUNT[COMPS[c].size] * scale * (w / 80)));
        const band = COMPS[c].size === 'big' ? 10 : 8;
        for (let i = 0; i < n; i++) out += particle(c, (x0 + 7 + r() * (w - 14)).toFixed(1), (y1 - bandH * 0.4 - 4 - r() * band).toFixed(1), r, small);
      });
      return out;
    }
    // Mélange sec (ou solides seuls) : un tas, plus haut au milieu.
    const heapTop = y0 + h * (small ? 0.2 : 0.45);
    const cx = (x0 + x1) / 2;
    const powders = solids.filter(c => COMPS[c].size === 'powder');
    if (powders.length) {
      out += `<path d="M${x0 + 2} ${y1}Q${cx} ${heapTop - (y1 - heapTop) * 0.15} ${x1 - 2} ${y1}Z" fill="${POWDER_FILL[powders[0]]}"/>`;
    }
    const inHeap = () => {
      for (let k = 0; k < 20; k++) {
        const x = x0 + 4 + r() * (w - 8);
        const y = heapTop + r() * (y1 - heapTop - 2);
        const edge = y1 - (y1 - heapTop) * (1 - Math.pow((x - cx) / (w / 2), 2));
        if (y >= edge) return [x, y];
      }
      return [cx, y1 - 3];
    };
    solids.forEach(c => {
      const n = Math.max(2, Math.round(COUNT[COMPS[c].size] * scale * (w / 80) * (COMPS[c].size === 'powder' ? 1.3 : 1)));
      for (let i = 0; i < n; i++) {
        const [x, y] = inHeap();
        out += particle(c, x.toFixed(1), y.toFixed(1), r, small);
      }
    });
    return out;
  }

  /* opts (animations) : contents (le dessin du contenu, à la place de P),
     tap (angle du robinet), bare (sans support), size (dessin en unités,
     posé dans le calque des animations), all (voir contentsSVG). */
  function vesselSVG(vessel, P, seed, cls, level, opts) {
    const v = VESSELS[vessel];
    const o = opts || {};
    const clip = `sp-clip-${seed}`;
    const extra = (v.rim ? '<rect x="16" y="14" width="88" height="11" rx="3" fill="#e9eef2" stroke="#7d8a97" stroke-width="1.6"/>' : '') +
      (v.spout ? '<path d="M24 22Q18 21 15 15" fill="none" stroke="#7d8a97" stroke-width="2"/><path d="M84 60h12M88 80h8M84 100h12" stroke="#a7b3bf" stroke-width="1.2"/>' : '') +
      (v.tap ? v.tap(o.tap || 0) : '') + (v.ring && !o.bare ? v.ring : '');
    const inside = o.contents != null ? o.contents : contentsSVG(P, v.inner, seed, vessel === 'dish' || vessel === 'funnel', level, o.all);
    return `<svg class="sp-vessel ${cls || ''}" viewBox="0 0 120 140"${o.size ? ' width="120" height="140" overflow="visible"' : ''} aria-hidden="true" focusable="false">` +
      `<defs><clipPath id="${clip}"><path d="${v.shape}Z"/></clipPath></defs>${v.stand && !o.bare ? v.stand : ''}` +
      `<path d="${v.shape}Z" fill="#f4f8fb"/>${v.under || ''}` +
      `<g clip-path="url(#${clip})">${inside}</g>` +
      `<path d="${v.shape}" fill="none" stroke="#7d8a97" stroke-width="2.2" stroke-linejoin="round"/>${extra}</svg>`;
  }

  const cloudSVG = () => '<svg class="sp-vessel is-cloud" viewBox="0 0 120 140" aria-hidden="true" focusable="false">' +
    '<path d="M30 92a16 16 0 0 1 4-31a22 22 0 0 1 41-8a18 18 0 0 1 17 33a12 12 0 0 1-6 6z" fill="#eef3f7" stroke="#a7b3bf" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M44 112c-4-5 4-8 0-13M60 116c-4-5 4-8 0-13M76 112c-4-5 4-8 0-13" fill="none" stroke="#b9c6d2" stroke-width="2" stroke-linecap="round"/></svg>';

  const partSeed = p => seedFrom(`${run.seed}-${p.id}-${p.comps.join('+')}-${p.vessel}`);

  /* ===== Animations des gestes =====
     Une petite scène par outil, dessinée dans un calque SVG posé sur la
     paillasse, en px de mise en page (le zoom du grand écran ne fausse
     rien). Les récipients d'arrivée sont posés d'avance, vides, à leur
     place définitive ; l'état du labo ne change qu'à la fin (act). Changer
     d'étape arrête la scène sans rien appliquer ; « Speed up » accélère ce
     qui reste. Les dessins des outils sont en unités de récipient (120 ×
     140), mis à l'échelle de la paillasse. */
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const ABORT = {};
  let fast = false;

  function svgEl(tag, attrs, parent) {
    const e = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v));
    if (parent) parent.appendChild(e);
    return e;
  }

  // Une durée de la scène ; step(e, t) : e avec easing, t linéaire. Lève ABORT si la scène a changé.
  function play(token, ms, step, easing) {
    const fn = easing || ease.inOut;
    return new Promise((resolve, reject) => {
      let t = 0;
      let last = performance.now();
      function frame(now) {
        if (!lab.isScene(token)) { reject(ABORT); return; }
        const speed = fast || reduceMotion ? 6 : 1;
        t = Math.min(1, t + Math.max(0, now - last) * speed / ms);
        last = now;
        step(fn(t), t);
        if (t < 1) requestAnimationFrame(frame); else resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  const mix = (a, b, e) => [lerp(a[0], b[0], e), lerp(a[1], b[1], e)];
  const put = (g, at, k, rot) => g.setAttribute('transform', `translate(${at[0].toFixed(1)} ${at[1].toFixed(1)}) rotate(${(rot || 0).toFixed(1)}) scale(${k.toFixed(3)})`);

  /* La boîte d'un récipient sur la paillasse : position et échelle de son
     dessin (unités 120 × 140) dans le calque. */
  function boxOf(el) {
    const v = el.querySelector('.sp-vbox');
    const w = v.offsetWidth, h = v.offsetHeight;
    const k = Math.min(w / 120, h / 140);
    const ox = (w - 120 * k) / 2, oy = (h - 140 * k) / 2;
    const x = el.offsetLeft + v.offsetLeft + ox;
    const y = el.offsetTop + v.offsetTop + oy;
    return { el, v, k, x, y, ox, oy, at: (ux, uy) => [x + ux * k, y + uy * k] };
  }

  const paint = (box, vessel, comps, seed, level, opts) => { box.v.innerHTML = vesselSVG(vessel, comps, seed, '', level, opts); };
  // Le niveau d'un liquide qui monte ou descend : redessiné par petits pas.
  function painter(box, vessel, comps, seed, opts) {
    let last = -1;
    return lv => {
      if (Math.abs(lv - last) < 0.04 && lv > 0 && lv < 1) return;
      last = lv;
      paint(box, vessel, comps, seed, lv, opts);
    };
  }

  // Les outils dessinés : l'origine est le point qui touche le mélange.
  const ART = {
    magnet: '<path d="M-15 -4V-22a15 15 0 0 1 30 0V-4" fill="none" stroke="#d64545" stroke-width="10"/>' +
      '<rect x="-21" y="-6" width="12" height="9" fill="#c7ced6" stroke="#55606b" stroke-width="1.4"/><rect x="9" y="-6" width="12" height="9" fill="#c7ced6" stroke="#55606b" stroke-width="1.4"/>',
    sieve: '<path d="M-30 0Q0 28 30 0" fill="#f6f8fa" stroke="#55606b" stroke-width="2"/>' +
      '<path d="M-24 6H24M-18 12H18M-10 17H10M-12 0V15M0 0V19M12 0V15" stroke="#9aa6b2" stroke-width=".9"/>' +
      '<ellipse cx="0" cy="0" rx="30" ry="6" fill="none" stroke="#55606b" stroke-width="2.4"/><path d="M30 -1L54 -11" stroke="#55606b" stroke-width="4.5" stroke-linecap="round"/>',
    funnel: '<path d="M-44 0H44L8 48V88H-8V48Z" fill="#f4f8fb" fill-opacity=".92" stroke="#7d8a97" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M-36 3H36L3 44H-3Z" fill="#ffffff" stroke="#c4cdd5" stroke-width="1.2"/>',
    tweezers: open => `<path d="M0 -52L${-open} 0M0 -52L${open} 0" fill="none" stroke="#59606a" stroke-width="3" stroke-linecap="round"/><circle cx="0" cy="-52" r="3.2" fill="#59606a"/>`
  };

  // Des morceaux d'un ou plusieurs constituants dans une zone (unités).
  function clusterSVG(comps, seed, xr, yr, n) {
    const r = mulberry32(seed);
    let out = '';
    comps.forEach(c => {
      if (!COMPS[c].solid) return;
      const count = COMPS[c].size === 'big' ? Math.max(2, Math.round(n / 3)) : n;
      for (let i = 0; i < count; i++) out += particle(c, lerp(xr[0], xr[1], r()).toFixed(1), lerp(yr[0], yr[1], r()).toFixed(1), r, false);
    });
    return out;
  }

  // Couleur de ce qui coule : l'eau, ou l'huile si elle est seule.
  const flowColor = comps => (hasAq(comps) ? '#7cc0ea' : comps.includes('oil') ? '#f0bf2c' : '#cbb388');

  // La plaque chauffante sous un récipient : elle rougit, puis refroidit.
  function plate(fx, box) {
    const rect = svgEl('rect', { rx: 2.5 * box.k, height: 7 * box.k, width: 112 * box.k, fill: '#5c6671' }, fx);
    const [x, y] = box.at(4, 132.5);
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    const glow = svgEl('rect', { x: x + 6 * box.k, y: y + 2.5 * box.k, rx: 1.2 * box.k, height: 2.2 * box.k, width: 100 * box.k, fill: '#ef7b45', opacity: 0 }, fx);
    return { set: e => glow.setAttribute('opacity', e.toFixed(2)), remove: () => { rect.remove(); glow.remove(); } };
  }

  // Des bulles qui montent dans le liquide d'un récipient (zone en unités).
  function bubbles(fx, box, zone, n) {
    const r = mulberry32(n * 97 + 13);
    const list = Array.from({ length: n }, () => ({ x: lerp(zone[0] + 4, zone[2] - 4, r()), ph: r(), sp: 0.7 + r() * 0.6, c: svgEl('circle', { r: (1.2 + r() * 1.4) * box.k, fill: '#ffffff', stroke: '#8fb9d6', 'stroke-width': 0.6 , opacity: 0 }, fx) }));
    return {
      set: (t, top) => list.forEach(b => {
        const f = (b.ph + t * 3 * b.sp) % 1;
        const [x, y] = box.at(b.x + Math.sin(f * 9) * 1.5, lerp(zone[3] - 2, top, f));
        b.c.setAttribute('cx', x.toFixed(1));
        b.c.setAttribute('cy', y.toFixed(1));
        b.c.setAttribute('opacity', (f < 0.9 ? 0.85 : (1 - f) * 8).toFixed(2));
      }),
      remove: () => list.forEach(b => b.c.remove())
    };
  }

  // De la vapeur qui monte au-dessus d'un récipient.
  function steam(fx, box, ux, uy) {
    const list = [-14, 0, 14].map((dx, i) => ({ dx, ph: i / 3, p: svgEl('path', { fill: 'none', stroke: '#b9c6d2', 'stroke-width': 2.6 * box.k, 'stroke-linecap': 'round' }, fx) }));
    return {
      set: t => list.forEach(s => {
        const f = (s.ph + t * 2.2) % 1;
        const [x, y] = box.at(ux + s.dx, uy - f * 34);
        const k = box.k;
        s.p.setAttribute('d', `M${x} ${y}c${-5 * k} ${-6 * k} ${5 * k} ${-9 * k} 0 ${-15 * k}`);
        s.p.setAttribute('opacity', (Math.sin(f * Math.PI) * 0.9).toFixed(2));
      }),
      remove: () => list.forEach(s => s.p.remove())
    };
  }

  /* Pencher un récipient vers un autre (dir : 1 vers la droite, -1 vers
     la gauche) autour du coin bas ; rend le point du bord d'où coule le
     mélange. */
  const RIMS = { jar: [100, 24, 100, 132], beaker: [96, 22, 96, 132], dish: [110, 100, 110, 112], flask: [70, 30, 98, 124] };
  function tilt(box, vessel, dir, deg) {
    const [rx, ry, px, py] = RIMS[vessel] || RIMS.jar;
    const pivX = dir > 0 ? px : 120 - px;
    box.v.style.transformOrigin = `${box.ox + pivX * box.k}px ${box.oy + py * box.k}px`;
    box.v.style.transform = `rotate(${(dir * deg).toFixed(1)}deg)`;
    const a = dir * deg * Math.PI / 180;
    const rimX = dir > 0 ? rx : 120 - rx;
    const dx = (rimX - pivX) * box.k, dy = (ry - py) * box.k;
    const [cx, cy] = box.at(pivX, py);
    return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)];
  }

  /* Verser un récipient dans un point (unités du récipient d'arrivée) :
     pencher, un filet qui coule (ms), redresser. during(t) pendant le
     filet ; solids : des morceaux qui suivent le filet. */
  async function pour(c, S, vessel, D, uTo, color, ms, during, solids) {
    const dir = D.x >= S.x ? 1 : -1;
    const tok = c.token;
    await play(tok, 480, e => tilt(S, vessel, dir, 42 * e));
    const to = D.at(uTo[0], uTo[1]);
    const stream = svgEl('path', { fill: 'none', stroke: color, 'stroke-width': 4.5 * S.k, 'stroke-linecap': 'round', 'stroke-dasharray': `${12 * S.k} ${5 * S.k}`, opacity: 0.85 }, c.fx);
    const bits = solids && solids.length ? Array.from({ length: 10 }, (x, i) => ({ ph: i / 10, g: svgEl('g', { opacity: 0 }, c.fx) })) : [];
    bits.forEach((b, i) => { b.g.innerHTML = particle(solids[i % solids.length], 0, 0, mulberry32(i + 7), false); });
    await play(tok, ms, (e, t) => {
      const from = tilt(S, vessel, dir, 42);
      const ctl = [lerp(from[0], to[0], 0.55), Math.min(from[1], to[1]) - 18 * S.k];
      stream.setAttribute('d', `M${from[0].toFixed(1)} ${from[1].toFixed(1)}Q${ctl[0].toFixed(1)} ${ctl[1].toFixed(1)} ${to[0].toFixed(1)} ${to[1].toFixed(1)}`);
      stream.setAttribute('stroke-dashoffset', (-t * 260 * S.k).toFixed(1));
      bits.forEach(b => {
        const f = (b.ph + t * 2.5) % 1;
        const x = (1 - f) * (1 - f) * from[0] + 2 * (1 - f) * f * ctl[0] + f * f * to[0];
        const y = (1 - f) * (1 - f) * from[1] + 2 * (1 - f) * f * ctl[1] + f * f * to[1];
        b.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${S.k.toFixed(3)})`);
        b.g.setAttribute('opacity', t > 0.85 ? ((1 - t) * 6).toFixed(2) : 1);
      });
      if (during) during(t);
    }, ease.linear);
    stream.remove();
    bits.forEach(b => b.g.remove());
    await play(tok, 420, e => tilt(S, vessel, dir, 42 * (1 - e)));
    S.v.style.transform = '';
  }

  // Un outil qui plonge dans un récipient et en ressort (essai sans résultat).
  async function dip(c, art, depth, rain) {
    const { S, token, fx } = c;
    const g = svgEl('g', {}, fx);
    g.innerHTML = art;
    const top = S.at(60, -18), low = S.at(60, depth);
    await play(token, 520, e => put(g, mix(top, low, e), S.k));
    await play(token, 380, (e, t) => put(g, [low[0] + Math.sin(t * Math.PI * 4) * 4 * S.k, low[1]], S.k), ease.linear);
    const drops = rain ? Array.from({ length: 12 }, (x, i) => ({ dx: (i % 6) * 9 - 22, ph: i / 12, c: svgEl('circle', { r: 1.6 * S.k, fill: rain , opacity: 0 }, fx) })) : [];
    await play(token, 560, (e, t) => {
      const at = mix(low, top, e);
      put(g, at, S.k);
      drops.forEach(d => {
        const f = (d.ph + t * 2) % 1;
        d.c.setAttribute('cx', (at[0] + d.dx * S.k).toFixed(1));
        d.c.setAttribute('cy', (at[1] + (8 + f * 40) * S.k).toFixed(1));
        d.c.setAttribute('opacity', (1 - f).toFixed(2));
      });
    });
    drops.forEach(d => d.c.remove());
    await play(token, 260, e => g.setAttribute('opacity', 1 - e));
    g.remove();
  }

  // Couleur des morceaux qui passent à travers : la poudre ou l'eau.
  function rainColor(comps) {
    if (hasAq(comps)) return '#7cc0ea';
    const powder = solidsIn(comps).find(x => COMPS[x].size === 'powder');
    return powder ? (powder === 'ironFilings' ? '#4a4f56' : '#d8b26b') : null;
  }

  /* --- Une scène par outil (c : le contexte du geste) --- */
  const SCENES = {
    async magnet(c) {
      const { S, D, r, token, fx } = c;
      const d = D[0];
      const g = svgEl('g', {}, fx);
      g.innerHTML = ART.magnet;
      const load = svgEl('g', {}, g);
      const topS = S.at(60, -16), low = S.at(60, 84), topD = d.at(60, 30), lowD = d.at(60, 98);
      await play(token, 620, e => put(g, mix(topS, low, e), S.k));
      await play(token, 420, (e, t) => put(g, [low[0] + Math.sin(t * Math.PI * 4) * 5 * S.k, low[1]], S.k), ease.linear);
      load.innerHTML = clusterSVG(r.removed, 31, [-23, -8], [4, 13], 16) + clusterSVG(r.removed, 37, [8, 23], [4, 13], 16);
      paint(S, c.p.vessel, r.left, c.seedLeft);
      await play(token, 560, e => put(g, mix(low, topS, e), S.k));
      await play(token, 620, e => put(g, mix(topS, topD, e), S.k));
      await play(token, 360, e => put(g, mix(topD, lowD, e), d.k));
      await play(token, 380, e => { load.setAttribute('transform', `translate(0 ${(e * 16).toFixed(1)})`); load.setAttribute('opacity', (1 - e).toFixed(2)); });
      paint(d, c.planned[0].vessel, r.removed, c.seedNew[0]);
      await play(token, 380, e => { put(g, mix(lowD, topD, e), d.k); g.setAttribute('opacity', (1 - e).toFixed(2)); });
      g.remove();
    },

    async tweezers(c) {
      const { S, D, r, token, fx, target } = c;
      const d = D[0];
      const g = svgEl('g', {}, fx);
      const arms = svgEl('g', {}, g);
      const held = svgEl('g', {}, g);
      const rr = mulberry32(5);
      const trips = 3;
      for (let i = 0; i < trips; i++) {
        const k = i ? 0.65 : 1;
        const topS = S.at(60, -24), pick = S.at(42 + rr() * 36, 120), topD = d.at(60, 40), drop = d.at(44 + rr() * 32, 114);
        arms.innerHTML = ART.tweezers(7);
        held.innerHTML = '';
        await play(token, 460 * k, e => put(g, mix(topS, pick, e), S.k));
        arms.innerHTML = ART.tweezers(2.5);
        held.innerHTML = particle(target, 0, 2, mulberry32(i + 3), false);
        if (i === trips - 1) paint(S, c.p.vessel, r.left, c.seedLeft);
        await play(token, 380 * k, e => put(g, mix(pick, topS, e), S.k));
        await play(token, 420 * k, e => put(g, mix(topS, topD, e), S.k));
        await play(token, 280 * k, e => put(g, mix(topD, drop, e), d.k));
        arms.innerHTML = ART.tweezers(7);
        held.innerHTML = '';
        if (i === 0) paint(d, c.planned[0].vessel, r.removed, c.seedNew[0]);
        await play(token, 240 * k, e => put(g, mix(drop, topD, e), d.k));
      }
      await play(token, 260, e => g.setAttribute('opacity', (1 - e).toFixed(2)));
      g.remove();
    },

    async sieve(c) {
      const { S, D, r, token, fx } = c;
      const d = D[0];
      const g = svgEl('g', {}, fx);
      g.innerHTML = ART.sieve;
      const load = svgEl('g', {}, g);
      const topS = S.at(60, -14), low = S.at(60, 78), topD = d.at(60, 52), lowD = d.at(60, 92);
      await play(token, 580, e => put(g, mix(topS, low, e), S.k));
      await play(token, 420, (e, t) => put(g, [low[0] + Math.sin(t * Math.PI * 6) * 5 * S.k, low[1]], S.k), ease.linear);
      load.innerHTML = clusterSVG(r.removed, 41, [-20, 20], [3, 13], 10);
      paint(S, c.p.vessel, r.left, c.seedLeft);
      const color = rainColor(r.left) || '#d8b26b';
      const drops = Array.from({ length: 16 }, (x, i) => ({ dx: (i % 8) * 6 - 21, ph: i / 16, c: svgEl('circle', { r: 1.5 * S.k, fill: color , opacity: 0 }, fx) }));
      await play(token, 760, (e, t) => {
        const at = mix(low, topS, e);
        put(g, at, S.k);
        drops.forEach(dr => {
          const f = (dr.ph + t * 2.4) % 1;
          dr.c.setAttribute('cx', (at[0] + dr.dx * S.k).toFixed(1));
          dr.c.setAttribute('cy', (at[1] + (14 + f * 46) * S.k).toFixed(1));
          dr.c.setAttribute('opacity', (t < 0.85 ? 1 - f : (1 - t) * 6 * (1 - f)).toFixed(2));
        });
      });
      drops.forEach(dr => dr.c.remove());
      await play(token, 620, e => put(g, mix(topS, topD, e), S.k));
      await play(token, 340, e => put(g, mix(topD, lowD, e), d.k));
      await play(token, 460, e => {
        put(g, lowD, d.k, -38 * e);
        load.setAttribute('transform', `translate(${(-e * 8).toFixed(1)} ${(e * 14).toFixed(1)})`);
        load.setAttribute('opacity', (1 - e).toFixed(2));
      });
      paint(d, c.planned[0].vessel, r.removed, c.seedNew[0]);
      await play(token, 320, e => { put(g, mix(lowD, topD, e), d.k, -38 * (1 - e)); g.setAttribute('opacity', (1 - e).toFixed(2)); });
      g.remove();
    },

    /* L'ampoule à décanter, tenue au-dessus du bécher (son support attend à
       sa place) : on y verse le mélange, les deux couches se forment, le
       robinet s'ouvre et la couche du bas s'écoule ; l'huile descend dans
       la pointe de l'ampoule. Robinet fermé, l'ampoule va sur son support. */
    async decant(c) {
      const { S, D, r, token, fx, P } = c;
      const [beaker, slot] = D;
      const [, y0, , y1] = VESSELS.sepfunnel.inner;
      const oilEnd = y0 + (y1 - y0) * 0.3;   // le haut de l'huile seule (voir contentsSVG)
      const full = 40, oilH = 12;             // l'ampoule pleine : l'huile sur 12 unités
      slot.v.classList.add('is-waiting');
      const g = svgEl('g', { opacity: 0 }, fx);
      const water = flowColor(r.left);
      const layers = (oilTop, waterTop, open) =>
        (waterTop < y1 - 0.3 ? `<rect x="0" y="${waterTop.toFixed(1)}" width="120" height="${(y1 - waterTop).toFixed(1)}" fill="#8fcbef" fill-opacity=".5"/>` +
          `<path d="M0 ${waterTop.toFixed(1)}h120" stroke="#6fb6e4" stroke-width="1"/>` : '') +
        (oilTop < waterTop - 0.3 ? `<rect x="0" y="${oilTop.toFixed(1)}" width="120" height="${(waterTop - oilTop).toFixed(1)}" fill="#f3c63b" fill-opacity=".8"/>` : '') +
        (open ? `<rect x="54" y="${y1}" width="12" height="${128 - y1}" fill="#8fcbef" fill-opacity=".6"/>` : '');
      const seed = c.seedNew[1] + 1;
      const draw = (oilTop, waterTop, tap) => {
        g.innerHTML = vesselSVG('sepfunnel', [], seed, '', null, { contents: layers(oilTop, waterTop, tap > 45), tap, bare: true, size: true });
      };
      // La pointe de l'ampoule (y 128) dans le haut du bécher (y 34).
      const hold = beaker.at(0, 34 - 128);
      put(g, hold, beaker.k);
      draw(y1, y1, 0);
      await play(token, 380, e => g.setAttribute('opacity', e.toFixed(2)));
      // On verse tout : le niveau monte, l'huile se rassemble au-dessus.
      const drain = painter(S, c.p.vessel, P, c.seedBefore, { all: true });
      await pour(c, S, c.p.vessel, beaker, [60, 34 - 128 + 18], flowColor(P), 1500, t => {
        drain(1 - t);
        const top = lerp(y1, full, t);
        draw(top, top + oilH * t, 0);
      });
      paint(S, c.p.vessel, [], c.seedBefore);
      S.el.classList.add('is-fading');
      await play(token, 450, () => {});
      // Le robinet s'ouvre : la couche du bas s'écoule dans le bécher.
      await play(token, 260, e => draw(full, full + oilH, 90 * e));
      const fill = painter(beaker, c.planned[0].vessel, r.left, c.seedNew[0]);
      const drops = Array.from({ length: 4 }, (x, i) => ({ ph: i / 4, c: svgEl('circle', { r: 1.8 * beaker.k, fill: water, opacity: 0 }, fx) }));
      await play(token, 2000, (e, t) => {
        draw(lerp(full, oilEnd, e), lerp(full + oilH, y1, e), 90);
        fill(Math.max(0, e * 1.05 - 0.05));
        drops.forEach(dr => {
          const f = (dr.ph + t * 4) % 1;
          const [x, y] = beaker.at(60, 36 + f * 60);
          dr.c.setAttribute('cx', x.toFixed(1));
          dr.c.setAttribute('cy', y.toFixed(1));
          dr.c.setAttribute('opacity', t > 0.94 ? 0 : 0.9);
        });
      }, ease.inOut);
      drops.forEach(dr => dr.c.remove());
      fill(1);
      // Robinet fermé : l'ampoule et son huile vont sur le support.
      await play(token, 260, e => draw(oilEnd, y1, 90 * (1 - e)));
      const onStand = slot.at(0, 0);
      await play(token, 760, e => put(g, mix(hold, onStand, e), lerp(beaker.k, slot.k, e)));
      paint(slot, c.planned[1].vessel, r.removed, c.seedNew[1]);
      slot.v.classList.remove('is-waiting');
      g.remove();
    },

    async filter(c) {
      const { S, D, r, token, fx, P } = c;
      const [beaker, paper] = D;
      // L'entonnoir est d'abord posé sur le bécher : sa place finale reste vide.
      paper.v.style.visibility = 'hidden';
      const fun = svgEl('g', {}, fx);
      fun.innerHTML = ART.funnel;
      const load = svgEl('g', { opacity: 0 }, fun);
      load.innerHTML = clusterSVG(r.removed, 43, [-14, 14], [30, 44], 8);
      const onBeaker = beaker.at(60, 34 - 88);
      put(fun, onBeaker, beaker.k);
      const fill = painter(beaker, c.planned[0].vessel, r.left, c.seedNew[0]);
      const drain = painter(S, c.p.vessel, P, c.seedBefore, { all: true });
      const drops = Array.from({ length: 4 }, (x, i) => ({ ph: i / 4, c: svgEl('circle', { r: 1.8 * beaker.k, fill: flowColor(r.left) , opacity: 0 }, fx) }));
      await play(token, 380, e => fun.setAttribute('opacity', e.toFixed(2)));
      await pour(c, S, c.p.vessel, beaker, [60, -50], flowColor(P), 1700, t => {
        drain(1 - t);
        load.setAttribute('opacity', Math.min(1, t * 1.6).toFixed(2));
        fill(Math.max(0, t * 1.1 - 0.1));
        drops.forEach(dr => {
          const f = (dr.ph + t * 4) % 1;
          const [x, y] = beaker.at(60, 36 + f * 50);
          dr.c.setAttribute('cx', x.toFixed(1));
          dr.c.setAttribute('cy', y.toFixed(1));
          dr.c.setAttribute('opacity', t > 0.92 ? 0 : 0.9);
        });
      }, solidsIn(P));
      drops.forEach(dr => dr.c.remove());
      paint(S, c.p.vessel, [], c.seedBefore);
      S.el.classList.add('is-fading');
      fill(1);
      // L'entonnoir et ce qui reste sur le papier vont à leur place.
      const atPaper = paper.at(60, 40);
      await play(token, 720, e => put(fun, mix(onBeaker, atPaper, e), lerp(beaker.k, paper.k, e)));
      paint(paper, c.planned[1].vessel, r.removed, c.seedNew[1]);
      paper.v.style.visibility = '';
      fun.remove();
    },

    async heat(c) {
      const { S, D, r, token, fx, P } = c;
      let H = S;
      if (D.length) {
        H = D[0];
        const fill = painter(H, 'dish', P, c.seedFinal);
        const drain = painter(S, c.p.vessel, P, c.seedBefore, { all: true });
        await pour(c, S, c.p.vessel, H, [60, 100], flowColor(P), 1200, t => { fill(t); drain(1 - t); }, solidsIn(P));
        paint(S, c.p.vessel, [], c.seedBefore);
        S.el.classList.add('is-fading');
      }
      const hot = plate(fx, H);
      await play(token, 520, e => hot.set(e));
      const boil = bubbles(fx, H, VESSELS.dish.inner, 9);
      const vapour = steam(fx, H, 60, 104);
      const evaporate = painter(H, 'dish', P, H === S ? c.seedBefore : c.seedFinal);
      await play(token, 2300, (e, t) => {
        evaporate(1 - e);
        boil.set(t, lerp(112, 128, e));
        vapour.set(t);
      }, ease.linear);
      boil.remove();
      vapour.remove();
      paint(H, 'dish', r.key === 'heatLost' ? [] : r.left, c.seedFinal);
      await play(token, 420, e => hot.set(1 - e));
      hot.remove();
    },

    async distil(c) {
      const { S, D, r, token, fx, P } = c;
      const d = D[0];
      const hot = plate(fx, S);
      await play(token, 420, e => hot.set(e));
      const [sx, sy] = S.at(60, 22);
      const [dx, dy] = d.at(60, 28);
      const k = S.k;
      const path = `M${sx} ${sy}C${sx} ${sy - 70 * k} ${dx} ${dy - 80 * k} ${dx} ${dy}`;
      const tube = svgEl('path', { d: path, fill: 'none', stroke: '#9fb0bf', 'stroke-width': 8 * k, 'stroke-linecap': 'round', opacity: 0 }, fx);
      const inner = svgEl('path', { d: path, fill: 'none', stroke: '#e8f4fb', 'stroke-width': 5 * k, 'stroke-linecap': 'round', opacity: 0 }, fx);
      await play(token, 320, e => { tube.setAttribute('opacity', e.toFixed(2)); inner.setAttribute('opacity', e.toFixed(2)); });
      const len = inner.getTotalLength();
      const vap = Array.from({ length: 7 }, (x, i) => ({ ph: i / 7, c: svgEl('circle', { r: 2 * k, fill: '#ffffff', stroke: '#8fb9d6', 'stroke-width': 0.8 , opacity: 0 }, fx) }));
      const drops = Array.from({ length: 3 }, (x, i) => ({ ph: i / 3, c: svgEl('circle', { r: 1.8 * k, fill: '#7cc0ea' , opacity: 0 }, fx) }));
      const v = VESSELS[c.p.vessel] || VESSELS.jar;
      const boil = bubbles(fx, S, v.inner, 7);
      const fill = painter(d, 'flask', r.removed, c.seedNew[0]);
      await play(token, 2300, (e, t) => {
        boil.set(t, lerp(v.inner[1], v.inner[3], 0.35));
        vap.forEach(b => {
          const f = (b.ph + t * 2.2) % 1;
          const pt = inner.getPointAtLength(f * len);
          b.c.setAttribute('cx', pt.x.toFixed(1));
          b.c.setAttribute('cy', pt.y.toFixed(1));
          b.c.setAttribute('opacity', (Math.sin(f * Math.PI) * 0.9).toFixed(2));
        });
        drops.forEach(dr => {
          const f = (dr.ph + t * 3) % 1;
          const [x, y] = d.at(60, 30 + f * 70);
          dr.c.setAttribute('cx', x.toFixed(1));
          dr.c.setAttribute('cy', y.toFixed(1));
          dr.c.setAttribute('opacity', t > 0.95 ? 0 : 0.9);
        });
        fill(Math.max(0, t * 1.08 - 0.08));
      }, ease.linear);
      boil.remove();
      vap.forEach(b => b.c.remove());
      drops.forEach(dr => dr.c.remove());
      fill(1);
      paint(S, c.p.vessel, r.left, c.seedLeft);
      await play(token, 380, e => { hot.set(1 - e); tube.setAttribute('opacity', (1 - e).toFixed(2)); inner.setAttribute('opacity', (1 - e).toFixed(2)); });
      tube.remove();
      inner.remove();
      hot.remove();
    }
  };

  // Un essai qui ne sépare rien : l'outil essaie, rien ne change.
  async function failScene(c) {
    const { tool, r, token, fx, S, P } = c;
    if (tool === 'magnet') return dip(c, ART.magnet, 84);
    if (tool === 'tweezers') return dip(c, ART.tweezers(3), 118);
    if (tool === 'sieve') return dip(c, ART.sieve, 78, r.key === 'sieveAll' ? rainColor(P) : null);
    if (tool === 'heat' && r.key === 'heatNothing') {
      const hot = plate(fx, S);
      await play(token, 500, e => hot.set(e));
      await play(token, 700, () => {});
      await play(token, 400, e => hot.set(1 - e));
      hot.remove();
      return;
    }
    // Les autres : l'outil se montre au-dessus du récipient.
    S.el.insertAdjacentHTML('beforeend', `<span class="sp-working" aria-hidden="true">${icon(tool, 'is-big')}</span>`);
    await play(token, 1000, () => {});
  }

  // Taille des récipients selon leur nombre sur la paillasse (sans passer à la ligne).
  function sizeBench(box, n) {
    box.classList.toggle('is-crowded', n === 5);
    box.classList.toggle('is-tight', n > 5);
  }

  // Les récipients d'arrivée, vides, avant les vapeurs (à leur place finale).
  function addSlots(planned) {
    const box = $('[data-bench]');
    const firstAir = box.querySelector('.sp-part.is-air');
    return planned.map(x => {
      const el = document.createElement('div');
      el.className = 'sp-part is-slot';
      el.innerHTML = `<span class="sp-part-name">${partName(x)}</span><span class="sp-vbox">${vesselSVG(x.vessel, [], partSeed(x))}</span>`;
      box.insertBefore(el, firstAir);
      return el;
    });
  }

  async function animate(c) {
    const box = $('[data-bench]');
    const slots = c.r.ok ? addSlots(c.planned) : [];
    sizeBench(box, box.querySelectorAll('.sp-part').length);
    const fx = svgEl('svg', { class: 'sp-fx', width: box.clientWidth, height: box.clientHeight, viewBox: `0 0 ${box.clientWidth} ${box.clientHeight}`, 'aria-hidden': 'true' }, box);
    Object.assign(c, { fx, S: boxOf(c.el), D: slots.map(boxOf) });
    if (!c.r.ok) await failScene(c);
    else await SCENES[c.tool](c);
  }

  /* ===== Étapes complètes (progression stricte, voir lab-engine.js) =====
     1 : l'observation et le plan ; 2 : tout séparé, journal rempli ;
     3 : toutes les réponses. */
  const obsDone = () => !!(state.obs.phases && state.obs.type && run.comps.every(c => state.obs.states[c]));
  const planDone = () => state.plan.every(Boolean) && !!state.last && (!soluteOf() || !!state.bet);
  const hypDone = () => obsDone() && planDone();

  function stepComplete(n) {
    if (n === 1) return hypDone();
    if (n === 2) return runDone();
    return conclusionsComplete();
  }

  function lockReason(n) {
    if (n === 1) return LABELS.lockPredict;
    if (n === 2) return LABELS.lockRun(separated(), logMissing());
    return lab.L.missingConclusions;
  }

  function questionHTML() {
    const s = soluteOf();
    return `<p class="sp-question">${gloss(LABELS.question)}</p>` +
      (s ? `<p class="sp-subquestion">${gloss(LABELS.subQuestion(compThe(s)))}</p>` : '');
  }

  function labelHTML() {
    return `<div class="sp-label"><span class="sp-label-title">${LABELS.labelTitle}</span>` +
      `<span class="sp-label-list">${run.comps.map(compName).join(' · ')}</span></div>`;
  }

  /* ===== Étape 1 : observer et planifier ===== */
  function renderPredict() {
    const o = state.obs;
    const show = lab.state.showMissing;
    const miss = ok => (show && !ok ? 'lab-is-missing' : '');
    const chip = (field, val, label, on, extra) => `<button type="button" class="lab-choice sp-chip ${on ? 'is-selected' : ''}" data-${field}="${val}" ${extra || ''} aria-pressed="${on}">${label}</button>`;
    const solute = soluteOf();
    const stateRows = run.comps.map(c => `<div class="sp-state-row ${miss(o.states[c])}"><span class="sp-state-name">${compName(c)}</span>` +
      `<span class="sp-chips">${STATES.map(s => chip('state', s, LABELS.stateWords[s], o.states[c] === s, `data-comp="${c}"`)).join('')}</span></div>`).join('');
    const gestures = toolsHere();
    const slots = state.plan.map((t, i) => `<label class="sp-slot ${miss(t)}"><span class="sp-slot-word">${LABELS.planSlot(i)}</span>` +
      selectHTML(`plan-${i}`, t, gestures, g => LABELS.gestures[g], LABELS.planSlot(i), show) + `</label>`).join('');

    lab.body.innerHTML = `<div class="sp-predict">` +
      `<section class="sp-jar-card">` +
        `<p class="sp-kicker">${LABELS.yourQuestion}</p>${questionHTML()}` +
        `<div class="sp-jar-big">${vesselSVG('jar', run.comps, seedFrom(`${run.seed}-jar`), 'is-big')}</div>${labelHTML()}` +
      `</section>` +
      `<section class="sp-form">` +
        `<div class="sp-block"><p class="sp-kicker">${LABELS.observeTitle}</p>` +
          `<div class="sp-line ${miss(o.phases)}"><span>${gloss(LABELS.phasesQ)}</span><span class="sp-chips">${PHASES.slice(0, Math.max(3, run.comps.length)).map(p => chip('phases', p, p, o.phases === p)).join('')}</span></div>` +
          `<div class="sp-line ${miss(o.type)}"><span>${gloss(LABELS.typeQ)}</span><span class="sp-chips">${TYPES.map(t => chip('type', t, LABELS.types[t], o.type === t)).join('')}</span></div>` +
          `<p class="sp-line-title">${gloss(LABELS.statesQ)}</p><div class="sp-states">${stateRows}</div>` +
        `</div>` +
        `<div class="sp-block"><p class="sp-kicker">${LABELS.planTitle}</p>` +
          `<div class="sp-slots">${slots}</div>` +
          `<label class="sp-slot sp-slot-last ${miss(state.last)}"><span class="sp-slot-word">${gloss(LABELS.lastQ)}</span>` +
            selectHTML('last', state.last, run.comps, compName, LABELS.lastQ, show) + `</label>` +
          (solute ? `<div class="sp-line ${miss(state.bet)}"><span>${gloss(LABELS.betQ(compThe(solute)))}</span><span class="sp-chips">${['gone', 'still'].map(b => chip('bet', b, LABELS.bets[b], state.bet === b)).join('')}</span></div>` : '') +
          `<label class="sp-because"><span>${LABELS.because}</span>` +
          `<input type="text" class="lab-input sp-because-input" maxlength="160" placeholder="${escapeHtml(LABELS.becausePlaceholder)}" value="${escapeHtml(state.because)}" autocomplete="off"></label>` +
        `</div>` +
      `</section></div>`;

    const after = () => {
      if (lab.state.showMissing && hypDone()) lab.state.showMissing = false;
      renderPredict();
      lab.renderStepper();
    };
    $$('[data-phases]').forEach(b => b.addEventListener('click', () => { o.phases = b.dataset.phases; after(); }));
    $$('[data-type]').forEach(b => b.addEventListener('click', () => { o.type = b.dataset.type; after(); }));
    $$('[data-state]').forEach(b => b.addEventListener('click', () => { o.states[b.dataset.comp] = b.dataset.state; after(); }));
    $$('[data-bet]').forEach(b => b.addEventListener('click', () => { state.bet = b.dataset.bet; after(); }));
    $$('select[data-c]').forEach(sel => sel.addEventListener('change', () => {
      const k = sel.dataset.c;
      if (k === 'last') state.last = sel.value || null;
      else state.plan[Number(k.split('-')[1])] = sel.value || null;
      after();
    }));
    const because = $('.sp-because-input');
    because.addEventListener('input', e => { state.because = e.target.value; });

    // L'observation et le plan se figent dès le premier geste sur la paillasse.
    if (state.started) {
      $$('.sp-form [data-phases], .sp-form [data-type], .sp-form [data-state], .sp-form [data-bet]').forEach(b => lab.setLock(b, LABELS.lockPredictFixed, { icon: false }));
      $$('.sp-form select').forEach(sel => lab.setLock(sel, LABELS.lockPredictFixed));
      because.readOnly = true;
      lab.setLock(because, LABELS.lockPredictFixed);
    }

    const ready = hypDone();
    const info = lab.state.showMissing && !ready ? lab.footerInfo(LABELS.lockPredict, true)
      : lab.footerInfo(ready ? LABELS.predictReady : LABELS.predictPending);
    lab.setFooter(info + `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-next>${LABELS.toBench} →</button></div>`);
    const next = $('[data-next]');
    next.addEventListener('click', () => lab.goToStep(2));
    lab.setLock(next, ready ? null : LABELS.lockPredict, { missing: true, key: 'next' });
  }

  function selectHTML(field, value, options, labelOf, aria, missing) {
    return `<select class="lab-select sp-select ${value ? 'is-filled' : ''} ${missing && !value ? 'lab-is-missing' : ''}" data-c="${field}" aria-label="${escapeHtml(aria)}">` +
      `<option value="" disabled ${value ? '' : 'selected'}>${LABELS.choose}</option>` +
      options.map(x => `<option value="${x}" ${value === x ? 'selected' : ''}>${escapeHtml(labelOf(x))}</option>`).join('') + `</select>`;
  }

  /* ===== Étape 2 : la paillasse =====
     À gauche, le bureau du professeur (les outils, les lunettes) ; au
     milieu, les récipients (cibles des outils) et la légende ; à droite, le
     journal de séparation. Un outil se prend en main (toucher ou clic) et se
     pose sur un récipient ; la pince demande ensuite quelles pièces
     retirer. */
  let busy = false;
  let stepperDone = null;

  function renderRun() {
    lab.release();
    busy = false;
    lab.body.innerHTML = `<div class="sp-run">` +
      `<aside class="sp-desk"><h3 class="lab-panel-title">${LABELS.deskTitle}</h3><div class="sp-tools" data-tools></div></aside>` +
      `<section class="sp-bench-wrap">` +
        `<div class="sp-bench" data-bench></div>` +
        `<button type="button" class="lab-btn lab-btn-ghost sp-speed" data-speed hidden>${LABELS.speedUp}</button>` +
        `<div class="sp-caption-row"><p class="lab-caption sp-caption" data-caption aria-live="polite"></p>` +
        `<button type="button" class="lab-btn lab-btn-ghost sp-new" data-new>${LABELS.newSample}</button></div>` +
      `</section>` +
      `<aside class="sp-log" data-log></aside>` +
      `</div>`;
    renderTools();
    renderBench();
    renderLog();
    setCaption(defaultCaption());
    $('[data-new]').addEventListener('click', askNewSample);
    lab.setLock($('[data-new]'), separated() ? LABELS.lockSeparated : null);
    $('[data-speed]').addEventListener('click', () => { fast = true; });
    renderRunFooter();
  }

  function renderTools() {
    const box = $('[data-tools]');
    if (!box) return;
    box.innerHTML = toolsHere().map(t => `<button type="button" class="sp-tool" data-tool="${t}">${icon(t)}<span>${LABELS.tools[t]}</span></button>`).join('') +
      `<button type="button" class="sp-tool sp-goggles ${state.goggles ? 'is-on' : ''}" data-goggles aria-pressed="${state.goggles}">${icon('goggles')}<span>${state.goggles ? LABELS.gogglesOn : LABELS.goggles}</span></button>`;
    // Tout est séparé : plus rien à faire sur la paillasse (un geste de trop
    // compterait comme un essai raté).
    const done = separated();
    $$('[data-tool]').forEach(el => {
      const t = el.dataset.tool;
      if (done) { lab.setLock(el, LABELS.lockSeparated); return; }
      if (HOT_TOOLS.includes(t) && !state.goggles) { lab.setLock(el, LABELS.lockGoggles); return; }
      lab.makeDraggable(el, {
        hold: true,
        ghost: () => `<div class="sp-ghost">${icon(t, 'is-big')}</div>`,
        targets: () => $$('[data-part]'),
        onHold: on => setCaption(on ? LABELS.captionHold(LABELS.tools[t]) : defaultCaption()),
        onDrop: target => useTool(t, target.dataset.part)
      });
    });
    $('[data-goggles]').addEventListener('click', () => {
      state.goggles = !state.goggles;
      lab.release();
      renderTools();
      setCaption(state.goggles ? LABELS.captionGoggles : defaultCaption());
      lab.save();
    });
  }

  function renderBench() {
    const box = $('[data-bench]');
    if (!box) return;
    const b = bench();
    const parts = b.parts.map(p => `<div class="sp-part" data-part="${p.id}" tabindex="0" role="button" aria-label="${escapeHtml(partName(p))}">` +
      `<span class="sp-part-name">${partName(p)}</span><span class="sp-vbox">${vesselSVG(p.vessel, p.comps, partSeed(p))}</span></div>`).join('');
    const air = b.air.map(() => `<div class="sp-part is-air"><span class="sp-part-name">${LABELS.airName}</span><span class="sp-vbox">${cloudSVG()}</span></div>`).join('');
    box.innerHTML = parts + air;
    sizeBench(box, b.parts.length + b.air.length);
  }

  function useTool(tool, partId) {
    if (busy) return;
    const p = partById(partId);
    if (!p) return;
    if (tool === 'tweezers' && p.comps.length > 1 && solidsIn(p.comps).length) { askTarget(p); return; }
    perform(tool, partId, null);
  }

  // La pince : quelles pièces retirer ? (les solides visibles du récipient)
  function askTarget(p) {
    const c = $('[data-caption]');
    if (!c) return;
    c.classList.remove('is-warning');
    c.innerHTML = `<span class="sp-ask">${gloss(LABELS.askTarget)}</span><span class="sp-ask-choices">` +
      solidsIn(p.comps).map(x => `<button type="button" class="lab-choice sp-chip" data-target="${x}">${compName(x)}</button>`).join('') +
      `<button type="button" class="lab-btn lab-btn-ghost sp-ask-cancel" data-cancel>${lab.L.cancel}</button></span>`;
    $$('[data-target]').forEach(btn => btn.addEventListener('click', () => perform('tweezers', p.id, btn.dataset.target)));
    $('[data-cancel]').addEventListener('click', () => setCaption(defaultCaption()));
  }

  /* Un geste : la scène, puis l'état du labo (act), le journal et la
     légende. Une scène qui plante (bug) n'empêche pas le geste. */
  async function perform(tool, partId, target) {
    const p = partById(partId);
    const el = $(`[data-part="${partId}"]`);
    if (!p || !el || busy) return;
    busy = true;
    fast = false;
    const token = lab.newScene();
    const P = p.comps.slice();
    const r = applyTool(tool, P, target);
    const planned = plannedParts(tool, p, r);
    const c = {
      tool, target, p, P, r, planned, el, token,
      seedBefore: partSeed(p),
      seedLeft: partSeed({ id: p.id, comps: r.left, vessel: p.vessel }),
      seedNew: planned.map(partSeed),
      seedFinal: planned.length ? partSeed(planned[0]) : partSeed({ id: p.id, comps: r.left, vessel: 'dish' })
    };
    setCaption(CAPTIONS.working[tool]);
    showSpeed(true);
    try {
      await animate(c);
    } catch (e) {
      if (e === ABORT) { busy = false; return; }
      console.error(e);
    }
    busy = false;
    showSpeed(false);
    act(tool, partId, target);
    renderBench();
    renderLog();
    if (separated()) {
      lab.release();
      renderTools();
      lab.setLock($('[data-new]'), LABELS.lockSeparated);
    }
    const text = resultCaption(tool, r, P, target);
    const end = separated() ? ` ${CAPTIONS.allDone}` : deadEnd() ? ` ${CAPTIONS.deadEnd}` : '';
    setCaption(text + end, !r.ok || (!separated() && deadEnd()));
    updateRunFooter();
    lab.save();
  }

  function showSpeed(on) {
    const b = $('[data-speed]');
    if (b) b.hidden = !on;
  }

  // Ce qu'on voit après le geste : décrit, jamais interprété.
  function resultCaption(tool, r, before, target) {
    const C = CAPTIONS.result;
    if (!r.ok && r.key !== 'heatLost') {
      if (r.key === 'tweezersSmall') return C.tweezersSmall(COMP_TEXT[target].look);
      return C[r.key];
    }
    const removed = looksText(r.removed);
    const left = looksText(r.left);
    switch (tool) {
      case 'magnet': return C.magnet(removed);
      case 'tweezers': return C.tweezers(removed);
      case 'sieve': return C.sieve(removed, left);
      case 'filter': return C.filter(removed, left);
      case 'decant': return C.decant(removed, left);
      case 'heat': return r.key === 'heatLost' ? C.heatLost : C.heat(left);
      case 'distil': return C.distil(LABELS.temp(COMPS[r.removed[0]].bp), left);
      default: return '';
    }
  }

  function defaultCaption() {
    if (separated()) return CAPTIONS.allDone;
    if (deadEnd()) return CAPTIONS.deadEnd;
    return state.started ? CAPTIONS.goOn : CAPTIONS.start;
  }

  function setCaption(text, warn) {
    const c = $('[data-caption]');
    if (!c) return;
    c.innerHTML = `<span>${gloss(text)}</span>`;
    c.classList.toggle('is-warning', !!warn);
  }

  async function askNewSample() {
    if (busy) return;
    if (!state.started) { setCaption(CAPTIONS.notStarted); return; }
    const yes = await lab.confirm({ title: LABELS.newSampleTitle, text: LABELS.newSampleText, confirm: LABELS.newSampleYes, cancel: lab.L.cancel });
    if (!yes) return;
    state.sample++;
    state.bench = freshBench();
    state.concl.tech = [];
    renderBench();
    renderLog();
    setCaption(CAPTIONS.newSample);
    updateRunFooter();
    lab.save();
  }

  /* --- Le journal de séparation : une ligne par séparation réussie ---
     Ce qu'on retire (un ou plusieurs constituants), l'outil, ce qui reste. */
  function renderLog() {
    const box = $('[data-log]');
    if (!box) return;
    const rows = logRows();
    const show = lab.state.showMissing;
    const chip = (i, field, c, on) => `<button type="button" class="lab-choice sp-chip is-small ${on ? 'is-selected' : ''}" data-row="${i}" data-f="${field}" data-v="${c}" aria-pressed="${on}">${compName(c)}</button>`;
    box.innerHTML = `<h3 class="lab-panel-title">${LABELS.logTitle}</h3>` + (rows.length ? rows.map((r, i) => {
      const a = r.ans;
      return `<div class="sp-row ${show && !rowDone(r) ? 'lab-is-missing' : ''}"><p class="sp-row-title"><span class="sp-num">${i + 1}</span>${LABELS.separationN(i + 1)}</p>` +
        `<p class="sp-row-q">${gloss(LABELS.removedQ)}</p><div class="sp-chips">${run.comps.map(c => chip(i, 'removed', c, a.removed.includes(c))).join('')}</div>` +
        `<p class="sp-row-q">${gloss(LABELS.toolQ)}</p>${selectHTML(`tool-${i}`, a.tool, toolsHere(), t => LABELS.tools[t], LABELS.toolQ, false)}` +
        `<p class="sp-row-q">${gloss(LABELS.leftQ)}</p><div class="sp-chips">${run.comps.map(c => chip(i, 'left', c, a.left.includes(c))).join('')}</div></div>`;
    }).join('') : `<p class="sp-log-empty">${gloss(LABELS.logEmpty)}</p>`);
    $$('.sp-log [data-row]').forEach(btn => btn.addEventListener('click', () => {
      const a = rows[Number(btn.dataset.row)].ans;
      const f = btn.dataset.f, v = btn.dataset.v;
      a[f] = a[f].includes(v) ? a[f].filter(x => x !== v) : run.comps.filter(x => a[f].includes(x) || x === v);
      afterLog();
    }));
    $$('.sp-log select[data-c]').forEach(sel => sel.addEventListener('change', () => {
      rows[Number(sel.dataset.c.split('-')[1])].ans.tool = sel.value || null;
      afterLog();
    }));
  }

  function afterLog() {
    if (lab.state.showMissing && runDone()) lab.state.showMissing = false;
    renderLog();
    updateRunFooter();
    lab.save();
  }

  function renderRunFooter() {
    lab.setFooter(lab.footerInfo('') + `<div class="lab-footer-actions">` +
      `<button type="button" class="lab-btn lab-btn-primary" data-next>${LABELS.toConclude} →</button></div>`);
    $('[data-next]').addEventListener('click', () => lab.goToStep(3));
    stepperDone = null;
    updateRunFooter();
  }

  function updateRunFooter() {
    const complete = runDone();
    const warn = lab.state.showMissing && !complete;
    const info = $('.lab-footer .lab-footer-info');
    if (info) {
      info.textContent = warn ? lockReason(2) : LABELS.runInfo(logRows().length, steps(), state.sample);
      info.classList.toggle('is-warning', warn);
    }
    const next = $('[data-next]');
    if (next) lab.setLock(next, complete ? null : lockReason(2), { missing: true, key: 'next' });
    if (complete !== stepperDone) { stepperDone = complete; lab.renderStepper(); }
  }

  /* ===== Étape 3 : conclusion =====
     À gauche, le journal (lecture) et la fiche des techniques ; à droite,
     les techniques, la réponse à la question, le jugement du plan. */
  function conclusionParts() {
    const c = state.concl;
    const s = soluteOf();
    return {
      tech: logRows().every((r, i) => c.tech[i] && c.tech[i].name && c.tech[i].why),
      answer: !s || !!(c.still && c.solute && c.solvent),
      plan: !!c.worked && (c.worked === 'yes' || !!c.reason)
    };
  }

  // Les raisons, dans un ordre tiré au sort pour chaque mélange (le même à chaque affichage, après une reprise aussi).
  function whyOrder() {
    const r = mulberry32(seedFrom(`${run.seed}-whys`));
    const a = WHYS.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function conclusionsComplete() {
    return Object.values(conclusionParts()).every(Boolean);
  }

  function recapHTML() {
    return `<table class="lab-table sp-recap"><thead><tr><th scope="col"></th><th scope="col">${LABELS.colRemoved}</th><th scope="col">${LABELS.colTool}</th><th scope="col">${LABELS.colLeft}</th></tr></thead><tbody>` +
      logRows().map((r, i) => `<tr><th scope="row"><span class="sp-num">${i + 1}</span></th><td>${namesText(r.ans.removed)}</td>` +
        `<td>${r.ans.tool ? LABELS.tools[r.ans.tool] : '—'}</td><td>${namesText(r.ans.left)}</td></tr>`).join('') + `</tbody></table>`;
  }

  function planText() {
    return LABELS.planSentence(state.plan.map(t => (t ? LABELS.gestures[t] : '…')), state.last ? compThe(state.last) : '…');
  }

  function renderConclude() {
    const c = state.concl;
    const parts = conclusionParts();
    const show = lab.state.showMissing;
    const miss = key => (show && !parts[key] ? 'lab-is-missing' : '');
    const s = soluteOf();
    const whys = whyOrder();
    const techRows = logRows().map((r, i) => {
      const t = c.tech[i] || {};
      return `<tr><th scope="row"><span class="sp-num">${i + 1}</span></th>` +
        `<td>${selectHTML(`name-${i}`, t.name, TECH_NAMES, x => LABELS.techniques[x], LABELS.colTechnique, show)}</td>` +
        `<td>${selectHTML(`why-${i}`, t.why, whys, x => LABELS.whys[x], LABELS.colWhy, show)}</td></tr>`;
    }).join('');
    const chip = (field, val, label, on) => `<button type="button" class="lab-choice sp-chip ${on ? 'is-selected' : ''}" data-k="${field}" data-val="${val}" aria-pressed="${on}">${label}</button>`;

    lab.body.innerHTML = `<div class="sp-conclude">` +
      `<section class="sp-results"><h3 class="lab-panel-title">${LABELS.logTitle}</h3>${recapHTML()}` +
        `<button type="button" class="lab-btn lab-btn-ghost sp-notebook-btn" data-notebook data-lab-look>${LABELS.notebookBtn}</button>` +
        `<div class="sp-reminder"><p class="sp-kicker">${LABELS.yourQuestion}</p>${questionHTML()}<p class="sp-plan-recap">${gloss(planText())}</p></div>` +
      `</section>` +
      `<section class="sp-cform">` +
        `<div class="sp-q ${miss('tech')}"><p class="sp-q-title"><span class="sp-num">1</span><span>${gloss(LABELS.techTitle)}</span></p>` +
          `<table class="sp-tech"><colgroup><col class="sp-tech-num"><col class="sp-tech-name"><col></colgroup><thead><tr><th></th><th scope="col">${LABELS.colTechnique}</th><th scope="col">${gloss(LABELS.colWhy)}</th></tr></thead><tbody>${techRows}</tbody></table></div>` +
        (s ? `<div class="sp-q ${miss('answer')}"><p class="sp-q-title"><span class="sp-num">2</span><span>${gloss(LABELS.subQuestion(compThe(s)))}</span></p>` +
          `<div class="sp-chips">${['yes', 'no'].map(v => chip('still', v, LABELS.stillAnswers[v], c.still === v)).join('')}</div>` +
          `<p class="sp-concl-line">${LABELS.soluteLine(
            selectHTML('solute', c.solute, run.comps, compName, LABELS.soluteAria, show),
            selectHTML('solvent', c.solvent, run.comps, compName, LABELS.solventAria, show))}</p></div>` : '') +
        `<div class="sp-q ${miss('plan')}"><p class="sp-q-title"><span class="sp-num">${s ? 3 : 2}</span><span>${gloss(LABELS.planQ)}</span></p>` +
          `<div class="sp-chips">${['yes', 'no'].map(v => chip('worked', v, LABELS.worked[v], c.worked === v)).join('')}</div>` +
          (c.worked === 'no' ? `<p class="sp-concl-line">${gloss(LABELS.reasonQ)} ${selectHTML('reason', c.reason, REASONS, x => LABELS.reasons[x], LABELS.reasonQ, show)}</p>` : '') +
        `</div>` +
      `</section></div>`;

    $$('select[data-c]').forEach(sel => sel.addEventListener('change', () => {
      const [k, i] = sel.dataset.c.split('-');
      if (k === 'name' || k === 'why') {
        c.tech[Number(i)] = Object.assign({}, c.tech[Number(i)], { [k]: sel.value || null });
      } else c[k] = sel.value || null;
      afterConcl();
    }));
    $$('[data-k]').forEach(btn => btn.addEventListener('click', () => {
      c[btn.dataset.k] = btn.dataset.val;
      if (btn.dataset.k === 'worked' && btn.dataset.val === 'yes') c.reason = null;
      afterConcl();
    }));
    $('[data-notebook]').addEventListener('click', openNotebook);

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

  // La fiche des techniques : le nom de chaque technique (cours, Mission 7).
  function openNotebook() {
    const items = TECH_NAMES.map(t => `<li><strong>${LABELS.techniques[t]}</strong>: ${gloss(NOTEBOOK.items[t])}</li>`).join('');
    lab.openSheet(`<h3 class="lab-sheet-title">${LABELS.notebookBtn}</h3><p class="lab-sheet-intro">${gloss(NOTEBOOK.intro)}</p>` +
      `<ul class="sp-notebook">${items}</ul>`, LABELS.notebookBtn);
  }

  /* ===== Étape 4 : correction ===== */
  const CRITERIA = ['observe', 'separate', 'log', 'techniques', 'conclusion'];

  // Le plan de l'élève marche-t-il (et que reste-t-il à la fin) ? Sinon, pourquoi.
  function planEval() {
    const pool = toolsHere();
    const n = steps();
    const lastOk = left => left.length === 1 && left[0] === state.last;
    if (search([run.comps], [], n, pool, state.plan, lastOk)) return { works: true, reason: null };
    if (search([run.comps], [], n, pool, state.plan, null)) return { works: false, reason: 'last' };
    const perms = list => (list.length <= 1 ? [list] : list.flatMap((x, i) => perms(list.slice(0, i).concat(list.slice(i + 1))).map(p => [x].concat(p))));
    const reorder = perms(state.plan).some(p => search([run.comps], [], n, pool, p, null));
    return { works: false, reason: reorder ? 'order' : 'tool' };
  }

  // Un chemin qui marche : celui de l'élève s'il a réussi du premier coup, sinon le premier trouvé.
  const solution = () => search([run.comps], [], steps(), toolsHere(), null);

  function evaluate() {
    const o = state.obs;
    const c = state.concl;
    const s = soluteOf();
    const phases = String(phasesOf(run.comps));
    const type = phasesOf(run.comps) > 1 ? 'heterogeneous' : 'homogeneous';
    const obsMiss = run.comps.filter(x => o.states[x] !== stateOf(x, run.comps));
    const observe = o.phases === phases && o.type === type && !obsMiss.length;
    const tries = state.actions;
    const failed = tries.filter(a => !a.ok);
    const separate = separated() && !failed.length && state.sample === 1;
    // Ampoule à décanter : retirer la couche du bas ou celle du haut, les deux se disent.
    const swapped = r => r.tool === 'decant' && sameSet(r.ans.removed, r.left) && sameSet(r.ans.left, r.removed);
    const rowMiss = logRows().map(r => ({
      removed: !swapped(r) && !sameSet(r.ans.removed, r.removed), tool: r.ans.tool !== r.tool, left: !swapped(r) && !sameSet(r.ans.left, r.left)
    }));
    const log = rowMiss.every(m => !m.removed && !m.tool && !m.left);
    const techMiss = logRows().map((r, i) => ({
      name: !c.tech[i] || c.tech[i].name !== TECH[r.tool].name, why: !c.tech[i] || c.tech[i].why !== TECH[r.tool].why
    }));
    const techniques = techMiss.every(m => !m.name && !m.why);
    const pe = planEval();
    const workedOk = c.worked === (pe.works ? 'yes' : 'no') && (pe.works || c.reason === pe.reason);
    const answerOk = !s || (c.still === 'yes' && c.solute === s && c.solvent === 'water');
    return {
      phases, type, obsMiss, failed, rowMiss, techMiss, pe, workedOk, answerOk, solute: s,
      observe, separate, log, techniques, conclusion: workedOk && answerOk
    };
  }

  function yourVsRight(label, yours, right, ok) {
    return `<tr class="${ok ? 'is-ok' : 'is-ko'}"><th scope="row">${label}</th><td>${yours}</td><td>${ok ? '✓' : right}</td></tr>`;
  }
  // La bonne réponse d'une case du journal (ampoule : l'inverse aussi).
  const rightPart = (r, comps) => namesText(comps) + (r.tool === 'decant' ? ` ${CHECK.eitherWay}` : '');
  const tableHead = () => `<thead><tr><th></th><th scope="col">${LABELS.yours}</th><th scope="col">${LABELS.expected}</th></tr></thead>`;

  function criterionDetail(key, ev) {
    const o = state.obs;
    const c = state.concl;
    if (key === 'observe') {
      const rows = yourVsRight(LABELS.phasesShort, o.phases || '—', ev.phases, o.phases === ev.phases) +
        yourVsRight(LABELS.typeShort, o.type ? LABELS.types[o.type] : '—', LABELS.types[ev.type], o.type === ev.type) +
        run.comps.map(x => yourVsRight(compName(x), o.states[x] ? LABELS.stateWords[o.states[x]] : '—', LABELS.stateWords[stateOf(x, run.comps)], !ev.obsMiss.includes(x))).join('');
      return `<table class="lab-table sp-facts">${tableHead()}<tbody>${rows}</tbody></table>` +
        `<p>${gloss(CHECK.phasesWhy(LABELS.list(looksOf(run.comps)), Number(ev.phases)))}</p>` +
        (ev.solute ? `<p>${gloss(CHECK.hiddenWhy(compThe(ev.solute)))}</p>` : '');
    }
    if (key === 'separate') {
      let sample = 0;
      const list = state.actions.map(a => {
        const head = a.s !== sample ? `<li class="sp-sample-head">${LABELS.sampleN(a.s)}</li>` : '';
        sample = a.s;
        return head + `<li class="${a.ok ? 'is-ok' : 'is-ko'}"><span class="sp-try-tool">${icon(a.tool)}<span>${LABELS.tools[a.tool]} → ${a.part}</span></span>` +
          `<span>${gloss(a.ok ? CHECK.tryOk(namesText(a.removed)) : CHECK.tryWrong[a.key] || CHECK.tryWrong.single)}</span></li>`;
      }).join('');
      const sol = solution();
      return (ev.separate ? `<p class="sp-ok">${CHECK.separateOk}</p>` : `<p class="sp-ko">${CHECK.separateKo(ev.failed.length, state.sample - 1)}</p>`) +
        `<ul class="sp-tries">${list}</ul>` +
        (sol ? `<p class="sp-q-head">${CHECK.oneWay}</p><p>${gloss(LABELS.planSentence(sol.map(st => LABELS.gestures[st.tool]), compThe(sol[sol.length - 1].left[0])))}</p>` : '');
    }
    if (key === 'log') {
      if (!logRows().length) return `<p>${CHECK.noLog}</p>`;
      return logRows().map((r, i) => {
        const m = ev.rowMiss[i];
        return `<p class="sp-q-head"><span class="sp-num">${i + 1}</span> ${LABELS.separationN(i + 1)}</p><table class="lab-table sp-facts">${tableHead()}<tbody>` +
          yourVsRight(LABELS.colRemoved, namesText(r.ans.removed), rightPart(r, r.removed), !m.removed) +
          yourVsRight(LABELS.colTool, r.ans.tool ? LABELS.tools[r.ans.tool] : '—', LABELS.tools[r.tool], !m.tool) +
          yourVsRight(LABELS.colLeft, namesText(r.ans.left), rightPart(r, r.left), !m.left) + `</tbody></table>`;
      }).join('') + `<p class="sp-muted">${gloss(CHECK.logHint)}</p>`;
    }
    if (key === 'techniques') {
      return logRows().map((r, i) => {
        const t = c.tech[i] || {};
        const m = ev.techMiss[i];
        const right = TECH[r.tool];
        return `<p class="sp-q-head"><span class="sp-num">${i + 1}</span> ${LABELS.tools[r.tool]}</p><table class="lab-table sp-facts">${tableHead()}<tbody>` +
          yourVsRight(LABELS.colTechnique, t.name ? LABELS.techniques[t.name] : '—', LABELS.techniques[right.name], !m.name) +
          yourVsRight(LABELS.colWhy, t.why ? LABELS.whys[t.why] : '—', LABELS.whys[right.why], !m.why) + `</tbody></table>` +
          `<p class="sp-muted">${gloss(NOTEBOOK.items[right.name])}</p>`;
      }).join('');
    }
    // Conclusion : la réponse sur le soluté, puis le plan.
    const pe = ev.pe;
    const s = ev.solute;
    const answer = s ? (ev.answerOk ? `<p class="sp-ok">${CHECK.answerOk} ${gloss(CHECK.stillRight(compThe(s)))}</p>`
      : `<p class="sp-ko">${CHECK.answerWrong} ${gloss(CHECK.stillRight(compThe(s)))}</p>`) +
      `<p>${gloss(CHECK.stillWhy(compThe(s)))}</p>` +
      (state.bet ? `<p>${CHECK.bet(LABELS.bets[state.bet], state.bet === 'still')}</p>` : '') : '';
    const planLine = `<p class="sp-q-head">${CHECK.yourPlan}</p><p>${gloss(planText())}</p>` +
      `<p>${gloss(pe.works ? CHECK.planWorks : CHECK.planFails[pe.reason])}</p>` +
      (ev.workedOk ? `<p class="sp-ok">${CHECK.judgedOk}</p>` : `<p class="sp-ko">${CHECK.judgedKo(LABELS.worked[pe.works ? 'yes' : 'no'], pe.reason ? LABELS.reasons[pe.reason] : '')}</p>`);
    return answer + planLine;
  }

  function renderCheck() {
    const ev = evaluate();
    const score = CRITERIA.filter(k => ev[k]).length;
    const rows = CRITERIA.map(k => `<button type="button" class="sp-crit ${ev[k] ? 'is-ok' : 'is-ko'} ${state.selected === k ? 'is-selected' : ''}" data-crit="${k}" data-lab-look>` +
      `<span class="sp-crit-text"><strong>${LABELS.criteria[k]}</strong><small>${LABELS.criteriaSub[k]}</small></span>` +
      `<span class="sp-crit-mark" aria-label="${ev[k] ? LABELS.markCorrect : LABELS.markIncorrect}">${ev[k] ? '✓' : '✗'}</span></button>`).join('');

    lab.body.innerHTML = `<div class="sp-check">` +
      `<div class="sp-check-left">` +
        `<div class="lab-score"><span class="lab-score-num">${score}<small> / ${CRITERIA.length}</small></span><span class="lab-score-label">${LABELS.scoreLabel}</span></div>` +
        `<div class="sp-crit-list">${rows}</div>` +
        `<div class="sp-reminder">${labelHTML()}</div>` +
      `</div>` +
      `<div class="sp-check-detail" aria-live="polite"><h3>${LABELS.criteria[state.selected]}</h3>${criterionDetail(state.selected, ev)}</div>` +
      `</div>`;

    $$('[data-crit]').forEach(btn => btn.addEventListener('click', () => {
      state.selected = btn.dataset.crit;
      renderCheck();
    }));
    lab.fillSpace($('.sp-check-detail'));
    lab.checkFooter();
  }

  /* ===== Rapport imprimable : contenu des 7 sections de la fiche outil FO3
     (en-tête, numérotation et mise en page : cadre commun) =====
     Les erreurs passent par mark() (lab-engine.js) : observation, journal,
     techniques, réponses, jugement du plan. */
  const plainText = text => String(text).replace(/\[([^\]|]+)(?:\|[^\]]+)?\]/g, '$1');

  function buildReport(mark) {
    const R = LABELS.report;
    const ev = evaluate();
    const o = state.obs;
    const c = state.concl;
    const s = ev.solute;
    const word = (text, ok, note, box) => (ok ? text : mark(text, plainText(note), { box }));

    const question = `<p>${plainText(LABELS.question)}</p>` + (s ? `<p>${plainText(LABELS.subQuestion(compThe(s)))}</p>` : '');
    const hyp = `<p>${plainText(planText())}</p>` +
      (s && state.bet ? `<p>${R.bet(compThe(s), LABELS.bets[state.bet])}</p>` : '') +
      (state.because.trim() ? `<p>${R.because}: ${escapeHtml(state.because.trim())}</p>` : '');
    const materials = `<p>${R.materials(LABELS.list(run.comps.map(c => compName(c).toLowerCase())), LABELS.list(toolsHere().map(t => LABELS.tools[t].toLowerCase()).concat(R.goggles)))}</p>`;

    // Démarche : les gestes, essais ratés et nouveaux échantillons compris.
    let sample = 0;
    const procedure = state.actions.map(a => {
      const head = a.s !== sample && a.s > 1 ? `<li>${R.newSample}</li>` : '';
      sample = a.s;
      return head + `<li>${R.step(LABELS.tools[a.tool].toLowerCase(), a.part, a.target ? compThe(a.target) : null)}</li>`;
    }).join('');

    const obsTable = `<table class="sp-report-table"><caption>${R.observeCaption}</caption>` +
      `<tr><th>${LABELS.phasesShort}</th><td>${word(o.phases || '—', o.phases === ev.phases, CHECK.phasesWhy(LABELS.list(looksOf(run.comps)), Number(ev.phases)), true)}</td></tr>` +
      `<tr><th>${LABELS.typeShort}</th><td>${word(o.type ? LABELS.types[o.type] : '—', o.type === ev.type, `${R.rightIs} ${LABELS.types[ev.type]}.`, true)}</td></tr>` +
      run.comps.map(x => `<tr><th>${compName(x)}</th><td>${word(o.states[x] ? LABELS.stateWords[o.states[x]] : '—', !ev.obsMiss.includes(x), `${compName(x)}: ${R.rightIs} ${LABELS.stateWords[stateOf(x, run.comps)].toLowerCase()}.` + (stateOf(x, run.comps) === 'hidden' ? ` ${CHECK.hiddenWhy(compThe(x))}` : ''), true)}</td></tr>`).join('') + `</table>`;
    const logTable = `<table class="sp-report-table"><caption>${R.logCaption}</caption>` +
      `<tr><th></th><th>${LABELS.colRemoved}</th><th>${LABELS.colTool}</th><th>${LABELS.colLeft}</th></tr>` +
      logRows().map((r, i) => {
        const m = ev.rowMiss[i];
        return `<tr><th>${i + 1}</th>` +
          `<td>${word(namesText(r.ans.removed), !m.removed, `${LABELS.separationN(i + 1)}: ${R.rightIs} ${rightPart(r, r.removed)}.`, true)}</td>` +
          `<td>${word(r.ans.tool ? LABELS.tools[r.ans.tool] : '—', !m.tool, `${LABELS.separationN(i + 1)}: ${R.rightIs} ${LABELS.tools[r.tool].toLowerCase()}.`, true)}</td>` +
          `<td>${word(namesText(r.ans.left), !m.left, `${LABELS.separationN(i + 1)}: ${R.rightIs} ${rightPart(r, r.left)}.`, true)}</td></tr>`;
      }).join('') + `</table>`;

    const interp = `<ul>${logRows().map((r, i) => {
      const t = c.tech[i] || {};
      const m = ev.techMiss[i];
      const right = TECH[r.tool];
      return `<li>${R.technique(i + 1,
        word(t.name ? LABELS.techniques[t.name] : '—', !m.name, `${R.rightIs} ${LABELS.techniques[right.name].toLowerCase()}. ${NOTEBOOK.items[right.name]}`),
        word(t.why ? LABELS.whys[t.why] : '—', !m.why, `${R.rightIs} “${LABELS.whys[right.why]}”.`))}</li>`;
    }).join('')}</ul>`;

    const order = `<p>${R.order(LABELS.list(logRows().map((r, i) => (c.tech[i] && c.tech[i].name ? LABELS.techniques[c.tech[i].name].toLowerCase() : '—'))))}</p>`;
    const answer = s ? `<p>${R.still(compThe(s), word(c.still ? LABELS.stillAnswers[c.still] : '—', c.still === 'yes', CHECK.stillRight(compThe(s))))}</p>` +
      `<p>${LABELS.soluteLine(word(c.solute ? compName(c.solute).toLowerCase() : '—', c.solute === s, `${R.rightIs} ${compName(s).toLowerCase()}.`),
        word(c.solvent ? compName(c.solvent).toLowerCase() : '—', c.solvent === 'water', `${R.rightIs} ${compName('water').toLowerCase()}.`))}</p>` : '';
    const pe = ev.pe;
    const judged = c.worked ? word(LABELS.worked[c.worked], c.worked === (pe.works ? 'yes' : 'no'), pe.works ? CHECK.planWorks : CHECK.planFails[pe.reason]) : '—';
    const reason = c.worked === 'no' && c.reason ? ` ${R.reason(word(LABELS.reasons[c.reason], !pe.works && c.reason === pe.reason, pe.works ? CHECK.planWorks : CHECK.planFails[pe.reason]))}` : '';
    const correction = CRITERIA.map(k => `<tr><th>${LABELS.criteria[k]}</th><td class="${ev[k] ? 'ok' : 'ko'}">${ev[k] ? '✓' : '✗'}</td></tr>`).join('');

    return {
      title: R.title,
      sections: [
        question,
        hyp,
        materials,
        `<ol>${procedure}</ol>`,
        obsTable + logTable,
        interp,
        order + answer + `<p>${R.plan(judged)}${reason}</p>`
      ],
      correction: `<p><strong>${R.score(CRITERIA.filter(k => ev[k]).length)}</strong></p>` +
        (ev.failed.length ? `<p>${plainText(CHECK.separateKo(ev.failed.length, state.sample - 1))}</p>` : '') +
        `<table class="sp-report-corr">${correction}</table>`
    };
  }

  lab = LabEngine.create({
    id: 'separation',
    // Page d'accueil (Mission, voir lab-engine.js) : toujours la même, rien du tirage.
    briefing: () => ({
      heading: LABELS.briefTitle,
      intro: gloss(LABELS.briefTask),
      questionTitle: LABELS.yourQuestion,
      questions: [LABELS.question].map(gloss),
      steps: LABELS.briefSteps.map((text, i) => ({ text: gloss(text), pics: [null, BASE_TOOLS.map(k => ({ html: icon(k), label: LABELS.tools[k] })), null][i] })),
      checks: Object.values(LABELS.criteria)
    }),
    title: LABELS.title,
    glossary: GLOSSARY,
    reset,
    stepComplete,
    lockReason,
    isStarted: () => !!(state.obs.phases || state.obs.type || Object.keys(state.obs.states).length || state.plan.some(Boolean) || state.last || state.started),
    render: { 1: renderPredict, 2: renderRun, 3: renderConclude, 4: renderCheck },
    report: buildReport,
    version: 1,
    save: () => ({ run, state }),
    load(data) {
      const r = data.run, s = data.state;
      const known = list => Array.isArray(list) && list.every(c => COMPS[c]);
      if (!r || !MIXTURES[r.mix] || !known(r.comps) || !sameSet(r.comps, MIXTURES[r.mix].comps) || typeof r.seed !== 'number' ||
        !s || !s.obs || !s.obs.states || !Array.isArray(s.plan) || s.plan.length !== r.comps.length - 1 || !s.bench ||
        !Array.isArray(s.bench.parts) || !s.bench.parts.every(p => p.id && VESSELS[p.vessel] && known(p.comps)) ||
        !Array.isArray(s.bench.air) || !Array.isArray(s.bench.log) || !Array.isArray(s.actions) || !s.concl || !Array.isArray(s.concl.tech) ||
        !s.bench.log.every(row => toolsFor(r.comps).includes(row.tool) && row.ans && Array.isArray(row.ans.removed) && Array.isArray(row.ans.left))) throw new Error('labProgress');
      if (!CRITERIA.includes(s.selected)) s.selected = 'observe';
      run = r;
      state = s;
      busy = false;
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
          mixture: run.comps.join('-'), tries: state.actions.length, failed: ev.failed.length,
          samples: state.sample, plan: state.plan.join('-'), planWorks: ev.pe.works
        }
      };
    }
  });
})();
