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

  const { escapeHtml, shuffle, mulberry32, seedFrom } = LabEngine.util;

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
     tirage (la distillation, en bonus, sort rarement : 1 fois sur 27). */
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
    m14: { comps: ['nails', 'oil', 'salt', 'water'], w: 2 }
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
     dans le tamis ou sur le papier, la couche du dessus, le liquide qui
     s'évapore ou que l'on distille). */
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
    if (tool === 'decant') {
      if (!liquids.length) return fail('decantDry');
      if (P.includes('oil') && hasAq(P)) return done(['oil'], 'decant');
      return fail(solids.length ? 'decantCloudy' : 'decantOne');
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
          if (!rest.length && lastOk && !lastOk(r.left)) continue;
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

  /* Appliquer un outil sur un récipient : la partie retirée part dans un
     nouveau récipient (coupelle pour des solides, bécher pour un liquide,
     ballon pour la distillation) ou dans l'air ; le reste reste en place
     (dans la coupelle d'évaporation après chauffage). */
  function act(tool, partId, target) {
    const b = bench();
    const p = partById(partId);
    if (!p) return null;
    const r = applyTool(tool, p.comps, target);
    state.started = true;
    state.actions.push({ s: state.sample, tool, part: partName(p), target: target || null, ok: r.ok && r.key !== 'heatLost', key: r.key, removed: r.removed, left: r.left });
    if (!r.ok) return r;
    if (tool === 'heat') {
      b.air.push(r.removed);
      if (r.key === 'heatLost') {
        b.lost = true;
        b.parts = b.parts.filter(x => x !== p);
        return r;
      }
      p.vessel = 'dish';
    } else {
      const liquid = r.removed.some(c => COMPS[c].liquid);
      b.parts.push({ id: `c${b.next}`, num: b.next, vessel: tool === 'distil' ? 'flask' : liquid ? 'beaker' : 'dish', comps: r.removed });
      b.next++;
      if (tool === 'filter' && p.vessel === 'dish') p.vessel = 'beaker';
    }
    p.comps = r.left;
    b.log.push({ tool, removed: r.removed, left: r.left, ans: { removed: [], tool: null, left: [] } });
    return r;
  }

  /* ===== Dessins ===== */
  const ICONS = {
    tweezers: '<path d="M9 3l7 21M23 3l-7 21" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="16" cy="25.5" r="2.4" fill="#8d939a" stroke="currentColor" stroke-width="1.2"/>',
    magnet: '<path d="M8 25V14a8 8 0 0 1 16 0v11" fill="none" stroke="#d64545" stroke-width="6"/><rect x="5" y="22" width="6" height="5" fill="#c7ced6" stroke="currentColor" stroke-width="1.2"/><rect x="21" y="22" width="6" height="5" fill="#c7ced6" stroke="currentColor" stroke-width="1.2"/>',
    sieve: '<ellipse cx="14" cy="13" rx="11" ry="4" fill="#eef1f4" stroke="currentColor" stroke-width="1.6"/><path d="M3 13q11 14 22 0" fill="#f6f8fa" stroke="currentColor" stroke-width="1.6"/><path d="M8 15.5l12 0M7 18.5l14 0M10 21l8 0M11 13v8M17 13v8" stroke="currentColor" stroke-width=".8"/><path d="M25 12l5-3" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    filter: '<path d="M4 6h24L18.5 18v9h-5v-9z" fill="#f4f7f9" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 8.5h16l-7 8.5h-2z" fill="#ffffff" stroke="#b9c3cc" stroke-width="1"/><path d="M16 27.5v2.5" stroke="#5aa9dd" stroke-width="2" stroke-linecap="round"/>',
    decant: '<path d="M7 9h15v17a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3z" fill="#eef5fa" stroke="currentColor" stroke-width="1.6"/><path d="M7 9q-3-1-4-4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 19h12v7a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z" fill="#8fd0ee"/><path d="M8.5 15h12v4h-12z" fill="#f3c63b"/>',
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
    flask: { shape: 'M50 30V62L22 122a7 7 0 0 0 6 10H92a7 7 0 0 0 6-10L70 62V30', inner: [24, 98, 96, 131] }
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
     petit tas. */
  function contentsSVG(P, box, seed, small) {
    const [x0, y0, x1, y1] = box;
    const r = mulberry32(seed);
    const h = y1 - y0, w = x1 - x0;
    const liquids = liquidsIn(P);
    const solids = solidsIn(P);
    const aq = hasAq(P), oil = P.includes('oil');
    let out = '';
    const scale = small ? 0.55 : 1;
    if (liquids.length) {
      const top = y0 + h * (small ? 0.18 : 0.3);
      const oilH = aq && oil ? h * 0.14 : 0;
      if (oil) out += `<rect x="${x0}" y="${top}" width="${w}" height="${aq ? oilH : y1 - top}" fill="#f3c63b" fill-opacity=".8"/>`;
      if (aq) out += `<rect x="${x0}" y="${top + oilH}" width="${w}" height="${y1 - top - oilH}" fill="#8fcbef" fill-opacity=".5"/>`;
      if (aq) out += `<path d="M${x0} ${top + oilH}h${w}" stroke="#6fb6e4" stroke-width="1"/>`;
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

  function vesselSVG(vessel, P, seed, cls) {
    const v = VESSELS[vessel];
    const clip = `sp-clip-${seed}`;
    const extra = (v.rim ? '<rect x="16" y="14" width="88" height="11" rx="3" fill="#e9eef2" stroke="#7d8a97" stroke-width="1.6"/>' : '') +
      (v.spout ? '<path d="M24 22Q18 21 15 15" fill="none" stroke="#7d8a97" stroke-width="2"/><path d="M84 60h12M88 80h8M84 100h12" stroke="#a7b3bf" stroke-width="1.2"/>' : '');
    return `<svg class="sp-vessel ${cls || ''}" viewBox="0 0 120 140" aria-hidden="true" focusable="false">` +
      `<defs><clipPath id="${clip}"><path d="${v.shape}Z"/></clipPath></defs>` +
      `<path d="${v.shape}Z" fill="#f4f8fb"/>` +
      `<g clip-path="url(#${clip})">${contentsSVG(P, v.inner, seed, vessel === 'dish')}</g>` +
      `<path d="${v.shape}" fill="none" stroke="#7d8a97" stroke-width="2.2" stroke-linejoin="round"/>${extra}</svg>`;
  }

  const cloudSVG = () => '<svg class="sp-vessel is-cloud" viewBox="0 0 120 140" aria-hidden="true" focusable="false">' +
    '<path d="M30 92a16 16 0 0 1 4-31a22 22 0 0 1 41-8a18 18 0 0 1 17 33a12 12 0 0 1-6 6z" fill="#eef3f7" stroke="#a7b3bf" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M44 112c-4-5 4-8 0-13M60 116c-4-5 4-8 0-13M76 112c-4-5 4-8 0-13" fill="none" stroke="#b9c6d2" stroke-width="2" stroke-linecap="round"/></svg>';

  const partSeed = p => seedFrom(`${run.seed}-${p.id}-${p.comps.join('+')}-${p.vessel}`);

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
      `<span class="sp-part-name">${partName(p)}</span>${vesselSVG(p.vessel, p.comps, partSeed(p))}</div>`).join('');
    const air = b.air.map(() => `<div class="sp-part is-air"><span class="sp-part-name">${LABELS.airName}</span>${cloudSVG()}</div>`).join('');
    box.innerHTML = parts + air;
    box.classList.toggle('is-crowded', b.parts.length + b.air.length > 4);
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

  async function perform(tool, partId, target) {
    const p = partById(partId);
    if (!p || busy) return;
    busy = true;
    const token = lab.newScene();
    const el = $(`[data-part="${partId}"]`);
    if (el) {
      el.insertAdjacentHTML('beforeend', `<span class="sp-working ${HOT_TOOLS.includes(tool) ? 'is-hot' : ''}" aria-hidden="true">${icon(tool, 'is-big')}<i></i><i></i><i></i></span>`);
      el.classList.add('is-working');
    }
    setCaption(CAPTIONS.working[tool]);
    const before = p.comps.slice();
    const ok = await lab.wait(token, HOT_TOOLS.includes(tool) ? 1700 : 900);
    busy = false;
    if (!ok) return;
    const r = act(tool, partId, target);
    renderBench();
    renderLog();
    if (separated()) {
      lab.release();
      renderTools();
      lab.setLock($('[data-new]'), LABELS.lockSeparated);
    }
    const text = resultCaption(tool, r, before, target);
    const end = separated() ? ` ${CAPTIONS.allDone}` : deadEnd() ? ` ${CAPTIONS.deadEnd}` : '';
    setCaption(text + end, !r.ok || (!separated() && deadEnd()));
    updateRunFooter();
    lab.save();
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
      case 'decant': return C.decant(removed);
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
    const techRows = logRows().map((r, i) => {
      const t = c.tech[i] || {};
      return `<tr><th scope="row"><span class="sp-num">${i + 1}</span></th>` +
        `<td>${selectHTML(`name-${i}`, t.name, TECH_NAMES, x => LABELS.techniques[x], LABELS.colTechnique, show)}</td>` +
        `<td>${selectHTML(`why-${i}`, t.why, WHYS, x => LABELS.whys[x], LABELS.colWhy, show)}</td></tr>`;
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
    const rowMiss = logRows().map(r => ({
      removed: !sameSet(r.ans.removed, r.removed), tool: r.ans.tool !== r.tool, left: !sameSet(r.ans.left, r.left)
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
          yourVsRight(LABELS.colRemoved, namesText(r.ans.removed), namesText(r.removed), !m.removed) +
          yourVsRight(LABELS.colTool, r.ans.tool ? LABELS.tools[r.ans.tool] : '—', LABELS.tools[r.tool], !m.tool) +
          yourVsRight(LABELS.colLeft, namesText(r.ans.left), namesText(r.left), !m.left) + `</tbody></table>`;
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
          `<td>${word(namesText(r.ans.removed), !m.removed, `${LABELS.separationN(i + 1)}: ${R.rightIs} ${namesText(r.removed)}.`, true)}</td>` +
          `<td>${word(r.ans.tool ? LABELS.tools[r.ans.tool] : '—', !m.tool, `${LABELS.separationN(i + 1)}: ${R.rightIs} ${LABELS.tools[r.tool].toLowerCase()}.`, true)}</td>` +
          `<td>${word(namesText(r.ans.left), !m.left, `${LABELS.separationN(i + 1)}: ${R.rightIs} ${namesText(r.left)}.`, true)}</td></tr>`;
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
