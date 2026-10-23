/* ===== Labo virtuel « Keep the lights on » (phys1) : le réseau électrique belge =====

   Simulation propre à ce labo, commune aux deux filières ; ses textes sont
   dans le dossier du chapitre, un fichier par langue (lab-grid.en.js,
   lab-grid.nl.js). Le cadre commun (modale, barre d'étapes, verrous,
   traduction, objet en main, rapport imprimé) est dans lab-engine.js.
   Ordre de chargement : moteur, textes, ce fichier.

   Le chapitre n'a pas de labo réel (confirmé par l'enseignant) : ce labo
   est une expérience sur un modèle, la salle de contrôle de l'électricité
   belge pendant une journée (de 6 h à 6 h). Il part des parties 3 et 4 du
   cours (centrales, ressources renouvelables ou non, électricité la nuit,
   stockage de Coo) et s'en tient aux faits observés : quelle centrale est
   « la meilleure » reste un jugement de valeur (French challenge).

   Le modèle, heure par heure : la demande (pics du matin et du soir) ; le
   vent et le soleil selon la météo ; le nucléaire, toujours la même
   quantité ; le gaz, qui suit la demande jusqu'à son maximum ; Coo, qui
   pompe l'eau vers le haut quand il y a trop d'électricité (3 units sur 4
   seulement reviendront : le reste est perdu) et la rend quand il en manque.
   Ce qui dépasse la demande et que Coo ne prend pas n'est pas produit (vent,
   puis soleil, réduits). S'il manque de l'électricité : panne.

   Tirés au sort : la saison (automne ou hiver : le soir est noir), les
   nuages (matin, après-midi ou pas), le vent (toujours calme le soir et la
   nuit, un coup de vent dans la journée), la demande (± 5 %), la puissance
   du nucléaire, du gaz et la taille de Coo. Un tirage n'est gardé que s'il
   garantit les conclusions (voir fits) : le vent et le soleil seuls ne
   suffisent pas ; une journée sans panne est possible, et elle demande les
   cinq installations ; Coo rend de l'énergie quand il fait noir et sans vent.

   Déroulé :
     1. Predict    — deux hypothèses (peut / ne peut pas ; les installations
                     utilisables la nuit sans vent) + « because » libre
     2. Experiment — a) les cartes d'identité des installations : ressource,
                     renouvelable ou non, forme d'énergie au départ (mots pris
                     en main, voir makeDraggable hold) ;
                     b) la salle de contrôle : test 1 imposé (vent et soleil),
                     test 2 le même jour (test équitable) avec les centrales
                     choisies, jusqu'à une journée sans panne ; le carnet
     3. Conclude   — les deux questions, puis le jugement des hypothèses
     4. Check      — 5 vérifications : centrales, chaînes d'énergie,
                     observations, conclusions, hypothèses ; les faits de
                     chaque installation ; rapport (FO3) */

(function () {
  'use strict';

  const { escapeHtml, shuffle, reduceMotion } = LabEngine.util;

  // Cadre commun, créé en fin de fichier (LabEngine.create).
  let lab;
  const $ = sel => lab.$(sel);
  const $$ = sel => lab.$$(sel);
  const gloss = text => lab.gloss(text);

  /* ===== Textes =====
     Dans le dossier du chapitre, un fichier par langue (lab-grid.en.js,
     lab-grid.nl.js), chargé avant celui-ci. */
  const {
    labels: LABELS, glossary: GLOSSARY, explanations: EXPLAIN, check: CHECK
  } = LabEngine.textFor('grid');

  /* ===== Modèle ===== */
  const PLANTS = ['wind', 'solar', 'nuclear', 'gas', 'coo'];
  const SOURCES = ['wind', 'solar', 'nuclear', 'gas'];          // les centrales : une ressource chacune
  const RESOURCES = ['wind', 'sun', 'uranium', 'gas', 'coal', 'water'];
  const RESOURCE_OF = { wind: 'wind', solar: 'sun', nuclear: 'uranium', gas: 'gas' };
  const RENEWABLE = { wind: 'yes', solar: 'yes', nuclear: 'no', gas: 'no' };
  const FORMS = ['chemical', 'mechanical', 'thermal', 'electrical', 'light', 'nuclear'];
  const START_FORM = { wind: 'mechanical', solar: 'light', nuclear: 'nuclear', gas: 'chemical', coo: 'mechanical' };
  const PERIODS = ['morning', 'afternoon', 'evening', 'night'];   // 6 h chacune, à partir de 6 h
  const HOURS = 24;
  const FIRST_HOUR = 6;                                             // la journée va de 6 h à 6 h
  const clockOf = i => (FIRST_HOUR + i) % 24;
  const periodOf = i => PERIODS[Math.floor(i / 6)];
  // Demande, heure par heure à partir de 6 h (units) : pic du matin, pic du soir, nuit creuse.
  const DEMAND = [62, 74, 80, 78, 76, 76, 78, 76, 74, 74, 78, 86, 94, 98, 94, 86, 72, 60, 52, 50, 48, 48, 50, 54];
  const COO_POWER = 16;       // units par heure, en pompant comme en rendant
  const COO_EFF = 0.75;       // 3 units sur 4 reviennent
  const TEST1_ON = { wind: true, solar: true, nuclear: false, gas: false, coo: false };
  const ALL_ON = { wind: true, solar: true, nuclear: true, gas: true, coo: true };
  const STACK = ['nuclear', 'wind', 'solar', 'gas', 'coo'];       // dans une colonne, du bas vers le haut
  // Couleurs du graphique d'Elia (cours), Coo en vert (« Other »).
  const COLORS = { nuclear: '#f0c04a', wind: '#7eb6db', solar: '#f08a24', gas: '#9aa3ab', coo: '#5aa86a' };
  const CARD_SLOTS = SOURCES.length * 3 + 1;                        // ressource, renouvelable, forme ; Coo : forme

  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pickOne = arr => arr[Math.floor(Math.random() * arr.length)];

  /* Une journée tirée au sort : d'abord son type (saison, ciel, vent), puis
     ses chiffres. Ciel : grand soleil, gris toute la journée, nuages le
     matin ou l'après-midi ; vent : tempête, vent fort le matin ou
     l'après-midi, vent faible. Le soir et la nuit sont toujours sans vent.
     Types écartés (presque jamais de journée sans panne possible) : le gris
     sans tempête (rien pour remplir Coo à midi), l'hiver nuageux l'après-midi
     avec vent faible. */
  const SKIES = ['sunny', 'grey', 'morning', 'afternoon'];
  const WINDS = ['storm', 'morning', 'afternoon', 'light'];
  const DAY_TYPES = [];
  ['autumn', 'winter'].forEach(season => SKIES.forEach(sky => WINDS.forEach(wind => {
    if (sky === 'grey' && wind !== 'storm') return;
    if (season === 'winter' && sky === 'afternoon' && wind === 'light') return;
    DAY_TYPES.push({ season, sky, wind });
  })));

  function weatherDay(type) {
    const { season, sky, wind: windType } = type;
    const winter = season === 'winter';
    const [rise, set] = winter ? [8.4, 17.2] : [7.4, 19.0];
    const peak = winter ? rnd(28, 34) : rnd(34, 42);
    const cloudy = [], sun = [];
    for (let i = 0; i < HOURS; i++) {
      const t = FIRST_HOUR + i + 0.5;
      cloudy.push(sky === 'grey' || (sky === 'morning' && t < 12) || (sky === 'afternoon' && t >= 12 && t < 18));
      let v = t > rise && t < set ? peak * Math.sin(Math.PI * (t - rise) / (set - rise)) : 0;
      if (cloudy[i]) v *= 0.3;
      sun.push(Math.round(v));
    }
    const calmFrom = rnd(12, 13);               // 18 h ou 19 h : plus de vent jusqu'au matin
    const morningCalm = Math.random() < 0.5;
    const base = windType === 'light' ? (winter ? rnd(16, 22) : rnd(14, 20)) : (winter ? rnd(14, 20) : rnd(10, 16));
    let gustStart = 0, gustLen = 0, gust = 0;
    if (windType === 'storm') { gustStart = rnd(1, 2); gustLen = rnd(8, 10); gust = rnd(34, 44); }
    else if (windType === 'morning') { gustStart = rnd(0, 2); gustLen = 5; gust = winter ? rnd(28, 38) : rnd(24, 34); }
    else if (windType === 'afternoon') { gustStart = rnd(6, 8); gustLen = 5; gust = winter ? rnd(28, 38) : rnd(24, 34); }
    const wind = [];
    for (let i = 0; i < HOURS; i++) {
      if (i >= calmFrom || (morningCalm && i < 2)) { wind.push(0); continue; }
      let v = base + rnd(-2, 2);
      if (gustLen && i >= gustStart && i < gustStart + gustLen) v = gust + rnd(-3, 3) - (i === gustStart || i === gustStart + gustLen - 1 ? 8 : 0);
      wind.push(Math.max(1, v));
    }
    const f = 0.95 + Math.random() * 0.1;
    return {
      season, sky, windType, rise, set, peak, cloudy, sun, wind,
      need: DEMAND.map(d => Math.round(d * f)),
      nuclear: rnd(32, 36), gasMax: rnd(48, 54), cooSize: rnd(40, 56)
    };
  }

  // Heure par heure : ce que donne chaque installation allumée (on).
  function simulate(on, day) {
    const r = day || run;
    let store = 0;
    return r.need.map((need, i) => {
      const h = {
        need, nuclear: on.nuclear ? r.nuclear : 0, solar: on.solar ? r.sun[i] : 0, wind: on.wind ? r.wind[i] : 0,
        gas: 0, coo: 0, cooIn: 0, missing: 0, storeBefore: store
      };
      const base = h.nuclear + h.solar + h.wind;
      if (base >= need) {
        let extra = base - need;
        if (on.coo) {
          h.cooIn = Math.max(0, Math.min(extra, COO_POWER, Math.ceil((r.cooSize - store) / COO_EFF)));
          store = Math.min(r.cooSize, store + h.cooIn * COO_EFF);
          extra -= h.cooIn;
        }
        // Le reste n'est pas produit : le vent, puis le soleil, sont réduits.
        const cutW = Math.min(extra, h.wind);
        h.wind -= cutW;
        h.solar -= Math.min(extra - cutW, h.solar);
      } else {
        let lack = need - base;
        if (on.gas) { h.gas = Math.min(lack, r.gasMax); lack -= h.gas; }
        if (on.coo && lack > 0) { h.coo = Math.min(lack, COO_POWER, Math.floor(store + 1e-9)); store -= h.coo; lack -= h.coo; }
        h.missing = lack;
      }
      h.store = store;
      return h;
    });
  }

  const blackoutHours = sim => sim.filter(h => h.missing > 0).length;
  const without = p => Object.assign({}, ALL_ON, { [p]: false });

  // Le tirage garantit les conclusions du labo.
  function fits(r) {
    const t1 = simulate(TEST1_ON, r);
    // Test 1 : une panne le jour (soleil) comme la nuit (réponse de l'hypothèse 1).
    if (!t1.some((h, i) => h.missing > 0 && r.sun[i] > 0) || !t1.some((h, i) => h.missing > 0 && r.sun[i] === 0)) return false;
    const all = simulate(ALL_ON, r);
    if (blackoutHours(all)) return false;
    if (PLANTS.some(p => !blackoutHours(simulate(without(p), r)))) return false;
    if (!all.some((h, i) => h.coo > 0 && r.sun[i] === 0 && r.wind[i] === 0)) return false;
    return all.some(h => h.gas !== all[0].gas);
  }

  // Un type de journée, puis des chiffres jusqu'à un tirage qui convient
  // (chaque type gardé réussit au moins une fois sur dix).
  function draw() {
    for (;;) {
      const type = pickOne(DAY_TYPES);
      for (let k = 0; k < 300; k++) {
        const r = weatherDay(type);
        if (fits(r)) return r;
      }
    }
  }

  /* Les questions : la 1 est la même pour tous ; la 2 est tirée au sort
     parmi trois, toutes répondues par la même expérience :
       night  — comment avoir de l'électricité la nuit sans vent ?
                (installations : nucléaire, gaz, Coo ; « stored »)
       follow — quelles installations donnent plus le soir, quand il en faut
                plus ? (installations : gaz, Coo)
       coo    — à quoi sert Coo ? (il stocke quand il y en a trop, rend quand
                il n'y en a pas assez ; « stored »)
     L'hypothèse et la conclusion 2 ont la forme de leur question. */
  const Q2_KINDS = ['night', 'follow', 'coo'];
  const Q2_PLANTS = { night: ['nuclear', 'gas', 'coo'], follow: ['gas', 'coo'] };
  const WHEN = ['never', 'night', 'both'];          // hypothèse 1 : la panne du test 1
  const COO_WHEN = ['much', 'little'];

  let run;      // tirage : la journée
  let state;    // travail de l'élève

  function reset() {
    run = draw();
    run.q2 = pickOne(Q2_KINDS);
    const cards = {};
    SOURCES.forEach(p => { cards[p] = { res: null, ren: null, form: null }; });
    cards.coo = { form: null };
    const plants = {};
    PLANTS.forEach(p => { plants[p] = { dark: null, same: null }; });
    state = {
      hyp: { h1: null, h2: [], coo: { a: null, b: null } },   // h1 : WHEN ; h2 : installations ; coo : COO_WHEN × 2
      because: '',
      view: 'cards',                 // 'cards' ou 'room'
      cards,
      ran1: false,                   // test 1 joué
      tries: [],                     // test 2 : une installation de plus à chaque essai (installations allumées)
      next: null,                    // test 2 : l'installation ajoutée au prochain essai
      shown: 'test1',                // journée affichée : 'test1', un essai (0, 1…) ou 'next'
      tapped: false,                 // une colonne du graphique a déjà été touchée
      // hours : heures de panne de chaque journée (0 : test 1, puis un par essai)
      notes: { hours: [], nothing: [], plants },
      concl: { when: null, q1: null, why: null, q2: [], cooA: null, cooB: null, stored: null, v1: null, v2: null },
      order: { res: shuffle(RESOURCES.slice()), forms: shuffle(FORMS.slice()) },
      selected: 'plants'
    };
    stepperDone = null;
    running = false;
    liveRun = null;
    hour = null;
  }

  // Ce que le carnet doit dire (les faits de la journée).
  function truth() {
    const t1 = simulate(TEST1_ON);
    const t2 = simulate(finalConfig());
    const darkCalm = i => run.sun[i] === 0 && run.wind[i] === 0;
    const plants = {};
    PLANTS.forEach(p => {
      const v = t2.map(h => h[p]);
      plants[p] = {
        dark: t2.some((h, i) => darkCalm(i) && h[p] > 0) ? 'yes' : 'no',
        same: v.every(x => x === v[0]) ? 'yes' : 'no'
      };
    });
    const dayBO = t1.some((h, i) => h.missing > 0 && run.sun[i] > 0);
    const nightBO = t1.some((h, i) => h.missing > 0 && run.sun[i] === 0);
    return {
      when: dayBO ? 'both' : nightBO ? 'night' : 'never',
      hours: [blackoutHours(t1)].concat(state.tries.map(on => blackoutHours(simulate(on)))),
      nothing: PERIODS.filter(p => run.need.some((_, i) => periodOf(i) === p && run.wind[i] + run.sun[i] === 0)),
      plants
    };
  }

  const cardsFilled = () => SOURCES.reduce((n, p) => n + ['res', 'ren', 'form'].filter(k => state.cards[p][k]).length, 0) + (state.cards.coo.form ? 1 : 0);
  const cardsDone = () => cardsFilled() === CARD_SLOTS;
  // Le carnet : une case d'heures par journée jouée, le moment sans vent ni soleil, deux oui/non par installation.
  const daysPlayed = () => (state.ran1 ? 1 + state.tries.length : 0);
  const hoursFilled = () => state.notes.hours.slice(0, daysPlayed()).filter(v => v != null).length;
  const notesTotal = () => Math.max(1, daysPlayed()) + 1 + PLANTS.length * 2;
  const notesFilled = () => hoursFilled() + (state.notes.nothing.length ? 1 : 0) +
    PLANTS.reduce((n, p) => n + ['dark', 'same'].filter(k => state.notes.plants[p][k]).length, 0);
  const notes1Done = () => state.notes.hours[0] != null && state.notes.nothing.length > 0;
  const notesDone = () => notesFilled() === notesTotal();
  // Les heures de la dernière journée jouée sont-elles notées ?
  const lastHoursWritten = () => daysPlayed() === 0 || state.notes.hours[daysPlayed() - 1] != null;
  const started = () => state.ran1;
  // Test 2 : les installations du dernier essai (au départ, celles du test 1).
  const lastConfig = () => (state.tries.length ? state.tries[state.tries.length - 1] : TEST1_ON);
  const success = () => state.tries.length > 0 && blackoutHours(simulate(lastConfig())) === 0;
  const finalConfig = () => (success() ? lastConfig() : ALL_ON);
  const nextConfig = () => Object.assign({}, lastConfig(), state.next ? { [state.next]: true } : {});
  const added = k => PLANTS.find(p => state.tries[k][p] && !(k ? state.tries[k - 1] : TEST1_ON)[p]);
  const plantName = p => LABELS.plants[p].name;
  const plantThe = p => LABELS.plants[p].the;
  const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));
  const inOrder = (list, all) => all.filter(x => list.includes(x));
  const listOf = (keys, name) => (keys.length ? LABELS.list(keys.map(name)) : '—');

  /* ===== Dessins ===== */
  const ICONS = {
    wind: `<path d="M19,38 L20.4,15 L21.6,15 L23,38 Z" fill="#c9d1da"/>` +
      `<g fill="#ffffff" stroke="#7d8a97" stroke-width="0.9"><path d="M21,15 L19.6,2 L22.6,2.4 Z"/><path d="M21,15 L32.6,20.6 L31,23.2 Z"/><path d="M21,15 L9.8,22.6 L8.6,19.8 Z"/></g>` +
      `<circle cx="21" cy="15" r="2.2" fill="#5d6773"/>`,
    solar: `<path d="M20,30 v7" stroke="#7d8a97" stroke-width="2"/><path d="M4,30 L11,12 L36,12 L29,30 Z" fill="#2f5f9e" stroke="#1d3d6b" stroke-width="1.2"/>` +
      `<path d="M9.4,24 L33.4,24 M11.8,18 L35,18 M17,12 L11.4,30 M23.5,12 L18,30 M30,12 L24.4,30" stroke="#7fa6d8" stroke-width="0.9"/>`,
    nuclear: `<ellipse cx="16" cy="6.5" rx="7" ry="3.4" fill="#eef2f6"/><path d="M6,37 C10,27 10,18 8.6,10 L23.4,10 C22,18 22,27 26,37 Z" fill="#d9dde2" stroke="#9aa5b1"/>` +
      `<path d="M27,37 V27 A6,6 0 0 1 39,27 V37 Z" fill="#b9c2cc" stroke="#8d98a5"/>`,
    gas: `<circle cx="33" cy="5" r="3.2" fill="#c3c9d0"/><circle cx="28.6" cy="2.6" r="2.2" fill="#d6dbe0"/>` +
      `<rect x="3" y="21" width="25" height="16" rx="1.5" fill="#8d99a6"/><rect x="7" y="25" width="5" height="4" fill="#ffd970"/><rect x="16" y="25" width="5" height="4" fill="#ffd970"/>` +
      `<rect x="30" y="9" width="6" height="28" fill="#6f7a87"/>`,
    coo: `<path d="M1,37 L15,11 L26,11 L39,37 Z" fill="#9cc47a"/><rect x="14.5" y="8" width="12" height="4.5" rx="1.5" fill="#4a90d9"/>` +
      `<path d="M23,12.5 L33,33" stroke="#5d6773" stroke-width="1.8"/><ellipse cx="33" cy="36" rx="6.5" ry="2.2" fill="#4a90d9"/>`
  };

  const plantIcon = (p, cls) => `<svg class="gr-icon ${cls || ''}" viewBox="0 0 40 40" aria-hidden="true" focusable="false">${ICONS[p]}</svg>`;

  /* --- Le paysage : viewBox 800 × 190, sol à y = 150 ---
     De gauche à droite : le parc éolien, les panneaux solaires, la centrale
     nucléaire, la centrale au gaz, Coo (lac du haut, lac du bas) et la ville.
     Les parties animées portent un id (paintScene). */
  const GROUND = 150;
  const TURBINES = [[44, 64], [88, 78], [132, 60]];   // x, hauteur du mât
  const STARS = [[40, 22], [96, 48], [150, 16], [212, 40], [268, 12], [330, 34], [392, 18], [448, 46], [505, 14], [566, 30], [618, 52], [668, 20], [728, 38], [772, 14], [180, 64], [612, 8]];
  const BUILDINGS = [[628, 104, 26], [656, 86, 22], [680, 112, 30], [712, 74, 24], [738, 98, 26], [766, 90, 28]];   // x, haut, largeur

  function sceneSVG() {
    let out = `<defs>` +
      `<linearGradient id="gr-sky" x1="0" y1="0" x2="0" y2="1"><stop id="gr-sky-a" offset="0" stop-color="#0e1f3d"/><stop id="gr-sky-b" offset="1" stop-color="#243b63"/></linearGradient>` +
      `<radialGradient id="gr-sunglow"><stop offset="0" stop-color="#fff3b0" stop-opacity="0.9"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></radialGradient>` +
      `</defs>` +
      `<rect x="-400" y="0" width="1600" height="${GROUND}" fill="url(#gr-sky)"/>` +
      `<g id="gr-stars" fill="#ffffff">${STARS.map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="${k % 3 ? 1 : 1.5}"/>`).join('')}</g>` +
      `<g id="gr-moon" transform="translate(610 58)"><circle r="12" fill="#f4f1de"/><circle cx="6" cy="-4" r="11" fill="#1a2c4f" id="gr-moon-cut"/></g>` +
      `<g id="gr-sun"><circle r="30" fill="url(#gr-sunglow)"/><circle r="13" fill="#ffd34d"/></g>` +
      `<g id="gr-clouds" fill="#ffffff">` +
        [[150, 40, 1], [380, 28, 1.2], [610, 46, 0.9]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="6" rx="30" ry="10"/><ellipse cx="-12" cy="0" rx="14" ry="11"/><ellipse cx="10" cy="-4" rx="16" ry="13"/></g>`).join('') +
      `</g>` +
      `<path d="M-400,${GROUND} L-400,128 C-200,110 0,124 120,118 C260,110 380,128 480,120 C600,110 700,126 1200,116 L1200,${GROUND} Z" fill="#b9d39b" id="gr-hills"/>` +
      `<rect x="-400" y="${GROUND}" width="1600" height="42" fill="#a7c985" id="gr-ground"/>` +
      `<rect x="-400" y="${GROUND}" width="1600" height="2" fill="#8fb36c"/>`;

    // Parc éolien
    out += `<g id="gr-p-wind" class="gr-plant">` + TURBINES.map(([x, h], k) =>
      `<path d="M${x - 3},${GROUND} L${x - 1.2},${GROUND - h} L${x + 1.2},${GROUND - h} L${x + 3},${GROUND} Z" fill="#e3e7ec" stroke="#aab4be" stroke-width="0.8"/>` +
      `<g id="gr-rotor-${k}" transform="translate(${x} ${GROUND - h})"><g class="gr-rotor">` +
        [0, 120, 240].map(a => `<path transform="rotate(${a})" d="M0,0 L-2.4,-4 L-1,-30 L1.2,-30 L2.4,-4 Z" fill="#ffffff" stroke="#8a95a1" stroke-width="0.8"/>`).join('') +
      `</g><circle r="3" fill="#5d6773"/></g>`).join('') + `</g>`;

    // Panneaux solaires
    out += `<g id="gr-p-solar" class="gr-plant">` + [[168, 132], [204, 132], [240, 132], [182, 142], [218, 142], [254, 142]].map(([x, y]) =>
      `<path d="M${x},${y + 10} L${x + 7},${y} L${x + 33},${y} L${x + 26},${y + 10} Z" fill="#2f5f9e" stroke="#1d3d6b" stroke-width="0.8"/>` +
      `<path d="M${x + 3.5},${y + 5} L${x + 29.5},${y + 5} M${x + 15},${y} L${x + 11},${y + 10} M${x + 23},${y} L${x + 19},${y + 10}" stroke="#7fa6d8" stroke-width="0.6"/>`).join('') +
      `<g id="gr-glint" opacity="0">${[[168, 132], [204, 132], [240, 132], [182, 142], [218, 142], [254, 142]].map(([x, y]) => `<path d="M${x + 17},${y + 5} l3,-3 l3,3 l-3,3 Z" fill="#ffffff"/>`).join('')}</g></g>`;

    // Centrale nucléaire : tour de refroidissement, réacteur, vapeur
    out += `<g id="gr-p-nuclear" class="gr-plant">` +
      `<g id="gr-steam" class="gr-steam" fill="#f2f5f8"><ellipse cx="318" cy="80" rx="16" ry="8"/><ellipse cx="330" cy="66" rx="13" ry="7"/><ellipse cx="344" cy="54" rx="10" ry="5.5"/></g>` +
      `<path d="M290,${GROUND} C302,128 302,110 298,92 L338,92 C334,110 334,128 346,${GROUND} Z" fill="#dde1e6" stroke="#a3adb8"/>` +
      `<path d="M352,${GROUND} V128 A13,13 0 0 1 378,128 V${GROUND} Z" fill="#bcc5cf" stroke="#909ba7"/></g>`;

    // Centrale au gaz : bâtiment, cheminée, fumée
    out += `<g id="gr-p-gas" class="gr-plant">` +
      `<g id="gr-smoke" class="gr-smoke" fill="#c7cdd3"><circle cx="468" cy="70" r="7"/><circle cx="478" cy="58" r="9"/><circle cx="492" cy="48" r="11"/></g>` +
      `<rect x="404" y="120" width="52" height="30" rx="2" fill="#8d99a6"/>` +
      [412, 426, 440].map(x => `<rect x="${x}" y="128" width="8" height="7" fill="#e8d9a8"/>`).join('') +
      `<rect x="462" y="80" width="10" height="70" fill="#6f7a87"/><rect x="460" y="78" width="14" height="5" fill="#5d6773"/></g>`;

    // Coo : colline, lac du haut (niveau = énergie stockée), conduite, lac du bas
    out += `<g id="gr-p-coo" class="gr-plant" transform="translate(-14 0)">` +
      `<path d="M496,${GROUND} L540,96 L580,96 L622,${GROUND} Z" fill="#93bd70"/>` +
      `<rect x="540" y="86" width="40" height="12" rx="3" fill="#5f7a4a"/>` +
      `<clipPath id="gr-lake-clip"><rect x="542" y="88" width="36" height="9" rx="2"/></clipPath>` +
      `<rect id="gr-lake" x="542" y="97" width="36" height="0" fill="#4a90d9" clip-path="url(#gr-lake-clip)"/>` +
      `<path d="M570,98 L606,146" stroke="#4f5a66" stroke-width="3"/>` +
      `<ellipse cx="606" cy="151" rx="20" ry="5" fill="#4a90d9"/>` +
      // L'eau dans la conduite : monte quand Coo stocke, descend quand il rend.
      `<path id="gr-coo-flow" class="gr-coo-flow" d="M570,98 L606,146" opacity="0"/>` +
      `<text id="gr-coo-say" x="560" y="80" text-anchor="middle" class="gr-scene-label gr-coo-say" opacity="0"></text></g>`;

    // La ville
    out += `<g id="gr-city">` + BUILDINGS.map(([x, top, w]) => `<rect x="${x}" y="${top}" width="${w}" height="${GROUND - top}" fill="#5b6778"/>`).join('') +
      `<g id="gr-windows">` + BUILDINGS.map(([x, top, w]) => {
        let win = '';
        for (let y = top + 6; y < GROUND - 8; y += 10) for (let wx = x + 4; wx < x + w - 6; wx += 8) win += `<rect x="${wx}" y="${y}" width="4" height="5"/>`;
        return win;
      }).join('') + `</g>` +
      `<g id="gr-blackout" opacity="0"><rect x="640" y="58" width="140" height="24" rx="6" fill="#b3261e"/>` +
      `<text x="710" y="75" text-anchor="middle" class="gr-blackout-text" data-no-gloss>${LABELS.blackoutSign}</text></g></g>`;

    // Étiquettes, horloge
    out += [['wind', 88], ['solar', 214], ['nuclear', 334], ['gas', 438], ['coo', 546]].map(([p, x]) =>
      `<text x="${x}" y="${GROUND + 26}" text-anchor="middle" class="gr-scene-label">${LABELS.plants[p].short}</text>`).join('') +
      `<text x="662" y="${GROUND + 26}" text-anchor="middle" class="gr-scene-label">${LABELS.city}</text>` +
      // « Faster », en bas à droite du paysage, pendant que la journée défile.
      `<g class="gr-speed" data-speed role="button" tabindex="0" aria-label="${escapeHtml(LABELS.faster)}" ${running ? '' : 'display="none"'}>` +
      `<rect x="700" y="${GROUND + 8}" width="92" height="26" rx="13"/><text x="746" y="${GROUND + 25}" text-anchor="middle">⏩ ${LABELS.faster}</text></g>` +
      `<g class="gr-clock"><rect x="712" y="8" width="78" height="28" rx="8" fill="#1f2a37" fill-opacity="0.85"/>` +
      `<text id="gr-clock" x="751" y="28" text-anchor="middle">06:00</text></g>`;
    return out;
  }

  /* --- Le graphique : sous le paysage, de y = 192 à 462 ---
     Une colonne par heure, découpée par installation (couleurs d'Elia) ; la
     demande en ligne ; ce qui manque en rouge hachuré ; ce que Coo stocke,
     sous l'axe ; en dessous, la météo de chaque heure, puis les heures. uid : les
     id du graphique (plusieurs graphiques sur la page : le rapport). */
  const GX = 64, COL = 30, BAR = 22;
  const Y0 = 378, KY = 1.418, YMAX = 110;
  const VIEW_H = 462;          // hauteur du SVG de la salle de contrôle (paysage + graphique)
  const WEATHER_Y = 413;       // la météo de chaque heure, sous l'axe et ce que stocke Coo
  const yOf = v => Y0 - v * KY;
  const xOf = i => GX + i * COL;

  function weatherIcon(i, x, y) {
    let out;
    // Nuit : un croissant de lune (arc extérieur de rayon 7, intérieur de rayon 9).
    if (run.sun[i] === 0) out = `<path d="M${x + 3},${y - 7} A7,7 0 1 0 ${x + 3},${y + 7} A9,9 0 0 1 ${x + 3},${y - 7} Z" fill="#3d5a8a"/>`;
    else if (run.cloudy[i]) out = `<circle cx="${x - 3}" cy="${y - 2}" r="4.5" fill="#f5b83d"/><path d="M${x - 7},${y + 5} h13 a3.6,3.6 0 0 0 -1.4,-6.9 a4.6,4.6 0 0 0 -8.8,1 a3,3 0 0 0 -2.8,5.9 Z" fill="#9aa5b1"/>`;
    else out = `<circle cx="${x}" cy="${y}" r="5" fill="#f5b83d"/>` +
      [0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="M${x},${y - 7} v-2.4" transform="rotate(${a} ${x} ${y})" stroke="#f5b83d" stroke-width="1.4" stroke-linecap="round"/>`).join('');
    // Le vent, sous l'icône : un trait (vent faible), deux (vent fort).
    const w = run.wind[i];
    if (w > 0) {
      const lines = w >= 20 ? 2 : 1;
      for (let k = 0; k < lines; k++) out += `<path d="M${x - 6},${y + 10 + k * 4} q3,-2 6,0 t6,0" fill="none" stroke="#5d82a8" stroke-width="1.4" stroke-linecap="round"/>`;
    }
    return out;
  }

  // o : { title, uid, mode: 'live' | 'print' }
  function graphSVG(sim, o) {
    const uid = o.uid;
    let out = `<defs>` +
      `<pattern id="gr-miss-${uid}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#fde2df"/><rect width="2.4" height="6" fill="#d64545"/></pattern>` +
      `<pattern id="gr-store-${uid}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="6" height="6" fill="#e2f1e4"/><rect width="2.4" height="6" fill="#5aa86a"/></pattern>` +
      `<clipPath id="gr-reveal-${uid}"><rect id="gr-reveal-rect-${uid}" x="${GX}" y="200" width="${o.reveal == null ? HOURS * COL : o.reveal * COL}" height="210"/></clipPath>` +
      `</defs>`;

    // Fond blanc, puis titre et légende
    out += `<rect x="-400" y="192" width="1600" height="${VIEW_H - 192}" fill="#ffffff"/>`;
    out += `<text x="${GX - 52}" y="208" class="gr-g-title">${escapeHtml(o.title)}</text>`;
    const legend = [['nuclear'], ['wind'], ['solar'], ['gas'], ['coo'], ['need', 'line'], ['missing', 'miss'], ['stored', 'store']];
    // Largeur estimée de chaque entrée (5,6 px par lettre) : la légende finit au bord droit.
    const widthOf = k => 15 + LABELS.legend[k].length * 5.6 + 12;
    let lx = 800 - legend.reduce((n, [k]) => n + widthOf(k), 0);
    legend.forEach(([k, kind]) => {
      const sw = kind === 'line' ? `<rect x="${lx}" y="203" width="12" height="2.6" fill="#1f2a37"/>`
        : kind === 'miss' ? `<rect x="${lx}" y="199" width="12" height="10" fill="url(#gr-miss-${uid})"/>`
          : kind === 'store' ? `<rect x="${lx}" y="199" width="12" height="10" fill="url(#gr-store-${uid})"/>`
            : `<rect x="${lx}" y="199" width="12" height="10" rx="2" fill="${COLORS[k]}"/>`;
      out += sw + `<text x="${lx + 15}" y="208" class="gr-g-legend">${LABELS.legend[k]}</text>`;
      lx += widthOf(k);
    });

    // Bandes des moments de la journée
    PERIODS.forEach((p, k) => {
      out += `<rect x="${xOf(k * 6)}" y="${yOf(YMAX)}" width="${6 * COL}" height="${Y0 - yOf(YMAX)}" fill="${k % 2 ? '#f3f5f8' : '#fafbfc'}"/>` +
        `<text x="${xOf(k * 6) + 3 * COL}" y="${yOf(YMAX) + 11}" text-anchor="middle" class="gr-g-period">${LABELS.periodsShort[p]}</text>`;
    });

    // Axes, graduations
    for (let v = 20; v <= 100; v += 20) {
      out += `<path d="M${GX},${yOf(v)} H${GX + HOURS * COL}" stroke="#e1e6ec" stroke-width="1"/>` +
        `<text x="${GX - 6}" y="${yOf(v) + 4}" text-anchor="end" class="gr-g-tick">${v}</text>`;
    }
    out += `<text x="${GX - 6}" y="${Y0 + 4}" text-anchor="end" class="gr-g-tick">0</text>` +
      `<text transform="translate(16 ${(Y0 + yOf(YMAX)) / 2}) rotate(-90)" text-anchor="middle" class="gr-g-axis">${LABELS.axisY}</text>`;
    for (let i = 0; i <= HOURS; i += 3) {
      out += `<path d="M${xOf(i)},${Y0} v5" stroke="#5d6773"/>` +
        `<text x="${xOf(i)}" y="${Y0 + 64}" text-anchor="middle" class="gr-g-tick">${LABELS.hour(clockOf(i % HOURS))}</text>`;
    }
    out += `<text x="${GX + HOURS * COL}" y="${Y0 + 78}" text-anchor="end" class="gr-g-axis">${LABELS.axisX}</text>`;

    // Météo de chaque heure
    for (let i = 0; i < HOURS; i++) out += weatherIcon(i, xOf(i) + COL / 2, WEATHER_Y);

    // Colonnes (dévoilées pendant la journée)
    let cols = '';
    if (sim) {
      sim.forEach((h, i) => {
        const x = xOf(i) + (COL - BAR) / 2;
        let top = 0;
        STACK.forEach(p => {
          if (h[p] <= 0) return;
          cols += `<rect x="${x}" y="${yOf(top + h[p])}" width="${BAR}" height="${h[p] * KY}" fill="${COLORS[p]}"/>`;
          top += h[p];
        });
        if (h.missing > 0) cols += `<rect x="${x}" y="${yOf(h.need)}" width="${BAR}" height="${h.missing * KY}" fill="url(#gr-miss-${uid})" stroke="#d64545" stroke-width="1"/>`;
        if (h.cooIn > 0) cols += `<rect x="${x}" y="${Y0}" width="${BAR}" height="${h.cooIn * KY}" fill="url(#gr-store-${uid})"/>`;
      });
    }
    out += `<g clip-path="url(#gr-reveal-${uid})">${cols}</g>`;

    // Demande : ligne en escalier, puis les axes par-dessus
    const need = run.need;
    let d = `M${xOf(0)},${yOf(need[0])}`;
    need.forEach((v, i) => { d += ` V${yOf(v)} H${xOf(i + 1)}`; });
    out += `<path d="${d}" fill="none" stroke="#1f2a37" stroke-width="2.4" stroke-linejoin="round"/>` +
      `<path d="M${GX},${yOf(YMAX)} V${Y0} H${GX + HOURS * COL}" fill="none" stroke="#5d6773" stroke-width="1.4"/>`;

    // Heures à toucher (détail), heure choisie
    if (o.mode === 'live') {
      out += `<rect id="gr-sel" class="gr-sel" x="0" y="${yOf(YMAX) - 2}" width="${COL}" height="${Y0 + 52 - yOf(YMAX)}" rx="4" opacity="0"/>`;
      // Tant qu'aucune colonne n'a été touchée : la consigne, dans un coin du graphique.
      if (o.hint) out += `<g id="gr-taphint" class="gr-taphint" pointer-events="none"><rect x="${GX + HOURS * COL - 236}" y="${yOf(YMAX) + 18}" width="230" height="22" rx="11"/>` +
        `<text x="${GX + HOURS * COL - 121}" y="${yOf(YMAX) + 33}" text-anchor="middle">${LABELS.tapHint}</text></g>`;
      for (let i = 0; i < HOURS; i++) {
        out += `<rect class="gr-hit" data-hour="${i}" data-lab-look x="${xOf(i)}" y="${yOf(YMAX)}" width="${COL}" height="${Y0 + 52 - yOf(YMAX)}" fill="transparent" tabindex="0" role="button" aria-label="${escapeHtml(LABELS.hourButton(clockOf(i)))}"/>`;
      }
    }
    return out;
  }

  /* --- Le paysage à un moment de la journée (t : heures depuis 6 h) ---
     Ciel, soleil, lune, étoiles, nuages ; ce que fait chaque installation ;
     les lumières de la ville. */
  let rotorAngle = [0, 0, 0];
  const mix = (a, b, w) => {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const c = k => Math.round(((pa >> k) & 255) * (1 - w) + ((pb >> k) & 255) * w);
    return `#${((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1)}`;
  };
  const clamp01 = v => Math.max(0, Math.min(1, v));

  function paintScene(sim, on, t) {
    const i = Math.min(HOURS - 1, Math.max(0, Math.floor(t)));
    const h = sim ? sim[i] : null;
    const tt = FIRST_HOUR + t;
    const day = clamp01((tt - run.rise + 0.6) / 1.2) * clamp01((run.set + 0.6 - tt) / 1.2);
    const dusk = 1 - Math.abs(2 * day - 1);
    const set = (sel, attr, v) => { const el = $(sel); if (el) el.setAttribute(attr, v); };
    set('#gr-sky-a', 'stop-color', mix(mix('#0e1f3d', '#6fa8dc', day), '#e98b6d', dusk * 0.55));
    set('#gr-sky-b', 'stop-color', mix(mix('#243b63', '#d3e9f7', day), '#f8cf98', dusk * 0.6));
    set('#gr-moon-cut', 'fill', mix('#1a2c4f', '#7fb3e0', day));
    set('#gr-hills', 'fill', mix('#3f5a45', '#b9d39b', 0.25 + 0.75 * day));
    set('#gr-ground', 'fill', mix('#3b5440', '#a7c985', 0.25 + 0.75 * day));
    set('#gr-stars', 'opacity', (1 - day).toFixed(2));
    set('#gr-moon', 'opacity', (1 - day).toFixed(2));
    const k = (tt - run.rise) / (run.set - run.rise);
    set('#gr-sun', 'transform', `translate(${(30 + 740 * k).toFixed(1)} ${(132 - 86 * Math.sin(Math.PI * clamp01(k))).toFixed(1)})`);
    set('#gr-sun', 'opacity', day.toFixed(2));
    set('#gr-clouds', 'opacity', run.cloudy[i] && day > 0 ? '0.92' : '0');
    const hh = Math.floor(tt) % 24, mm = Math.floor((tt % 1) * 60 / 15) * 15;
    const clock = $('#gr-clock');
    if (clock) clock.textContent = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;

    PLANTS.forEach(p => { const g = $(`#gr-p-${p}`); if (g) g.classList.toggle('is-off', !on[p]); });
    set('#gr-glint', 'opacity', h && h.solar > 0 ? (0.4 + 0.6 * h.solar / run.peak).toFixed(2) : '0');
    set('#gr-steam', 'opacity', on.nuclear ? '0.95' : '0');
    set('#gr-smoke', 'opacity', h && h.gas > 0 ? (0.25 + 0.75 * h.gas / run.gasMax).toFixed(2) : '0');
    const level = h ? (h.storeBefore + (h.store - h.storeBefore) * (t - i)) / run.cooSize : 0;
    set('#gr-lake', 'height', (9 * clamp01(level)).toFixed(1));
    set('#gr-lake', 'y', (97 - 9 * clamp01(level)).toFixed(1));
    const flow = $('#gr-coo-flow');
    const say = $('#gr-coo-say');
    const cooDir = h && h.cooIn > 0 ? 'up' : h && h.coo > 0 ? 'down' : null;
    if (flow) {
      flow.setAttribute('opacity', cooDir ? '1' : '0');
      flow.classList.toggle('is-up', cooDir === 'up');
      flow.classList.toggle('is-down', cooDir === 'down');
    }
    if (say) {
      say.textContent = cooDir === 'up' ? LABELS.cooStores : cooDir === 'down' ? LABELS.cooGives : '';
      say.setAttribute('opacity', cooDir ? '1' : '0');
    }
    const dark = !!(h && h.missing > 0);
    const win = $('#gr-windows');
    if (win) win.setAttribute('fill', dark ? '#3a4553' : mix('#ffd970', '#e9e3c8', day * 0.8));
    set('#gr-blackout', 'opacity', dark ? '1' : '0');
    const city = $('#gr-city');
    if (city) city.classList.toggle('is-dark', dark);
  }

  function spinRotors(on, t, dt) {
    const i = Math.min(HOURS - 1, Math.floor(t));
    TURBINES.forEach((_, k) => {
      if (on.wind) rotorAngle[k] = (rotorAngle[k] + dt * run.wind[i] * (0.016 + k * 0.002)) % 360;
      const r = $(`#gr-rotor-${k} .gr-rotor`);
      if (r) r.setAttribute('transform', `rotate(${rotorAngle[k].toFixed(1)})`);
    });
  }

  /* ===== Étapes complètes (progression stricte, voir lab-engine.js) =====
     1 : les deux hypothèses ; 2 : les cartes, les deux tests (dont une
     journée sans panne) et le carnet ; 3 : toutes les réponses. */
  function stepComplete(n) {
    if (n === 1) return hypDone();
    if (n === 2) return cardsDone() && state.ran1 && success() && notesDone();
    return conclusionsComplete();
  }

  function lockReason(n) {
    if (n === 1) return LABELS.lockHypothesis;
    if (n === 2) {
      if (!cardsDone()) return LABELS.lockCards(CARD_SLOTS - cardsFilled());
      if (!state.ran1 || !success()) return LABELS.lockTests;
      return LABELS.lockNotes(notesTotal() - notesFilled());
    }
    return lab.L.missingConclusions;
  }

  function questionsHTML() {
    return `<ol class="gr-questions"><li>${gloss(LABELS.questions.q1)}</li><li>${gloss(LABELS.questions.q2[run.q2])}</li></ol>`;
  }

  const usesPlants = () => run.q2 !== 'coo';
  const usesStored = () => run.q2 !== 'follow';
  const hypDone = () => !!(state.hyp.h1 && (usesPlants() ? state.hyp.h2.length : state.hyp.coo.a && state.hyp.coo.b));
  const hyp1Text = h => LABELS.hyp1(h ? LABELS.when[h] : '—');
  const hyp2Text = () => (usesPlants() ? `${LABELS.hyp2[run.q2]} ${listOf(state.hyp.h2, plantThe)}.`
    : LABELS.hyp2.coo(state.hyp.coo.a ? LABELS.cooWhen[state.hyp.coo.a] : '—', state.hyp.coo.b ? LABELS.cooWhen[state.hyp.coo.b] : '—'));
  // La bonne conclusion 2, en une phrase.
  const right2Text = () => (usesPlants()
    ? `${LABELS.concl2[run.q2]} ${LABELS.list(Q2_PLANTS[run.q2].map(plantThe))}.` + (usesStored() ? ` ${LABELS.concl2b(LABELS.stored.stored)}` : '')
    : `${LABELS.concl2.coo(LABELS.cooWhen.much, LABELS.cooWhen.little)} ${LABELS.concl2b(LABELS.stored.stored)}`);

  const blankHTML = text => (text ? `<span class="gr-blank is-filled">${text}</span>` : `<span class="gr-blank">……………</span>`);

  // Coo : « stocke quand il y a… », « rend quand il y a… » (deux lignes de choix).
  function cooRowsHTML(a, b, chip) {
    return [['a', a, LABELS.cooRowA], ['b', b, LABELS.cooRowB]].map(([row, v, label]) =>
      `<div class="gr-choices gr-coo-row"><span class="gr-coo-row-label">${label}</span>${COO_WHEN.map(x => chip(row, x, v === x)).join('')}</div>`).join('');
  }

  /* ===== Étape 1 : hypothèses ===== */
  function renderPredict() {
    const h = state.hyp;
    const miss = key => (lab.state.showMissing && !(key === 'h2' ? (usesPlants() ? h.h2.length : h.coo.a && h.coo.b) : h[key]) ? 'lab-is-missing' : '');
    const chip = (key, val, label, on, icon) => `<button type="button" class="lab-choice gr-choice ${on ? 'is-selected' : ''}" data-hyp="${key}" data-val="${val}" aria-pressed="${on}">${icon || ''}<span>${label}</span></button>`;

    lab.body.innerHTML = `<div class="gr-predict">` +
      `<div class="gr-question-card">` +
        `<p class="gr-kicker">${LABELS.yourQuestions}</p>${questionsHTML()}` +
        `<p class="gr-intro"><span class="gr-intro-icons">${PLANTS.map(p => plantIcon(p)).join('')}</span><span>${gloss(LABELS.intro)}</span></p>` +
      `</div>` +
      `<div class="gr-hyp-card">` +
        `<p class="gr-kicker">${LABELS.hypothesisTitle}</p>` +
        `<div class="gr-hyp ${miss('h1')}"><span class="gr-num" aria-hidden="true">1</span><div>` +
          `<p class="gr-sentence">${gloss(LABELS.hyp1(blankHTML(h.h1 && LABELS.when[h.h1])))}</p>` +
          `<div class="gr-choices">${WHEN.map(x => chip('h1', x, LABELS.when[x], h.h1 === x)).join('')}</div></div></div>` +
        `<div class="gr-hyp ${miss('h2')}"><span class="gr-num" aria-hidden="true">2</span><div>` +
          (usesPlants()
            ? `<p class="gr-sentence">${gloss(LABELS.hyp2[run.q2])} <span class="gr-hint">${LABELS.hyp2Hint}</span></p>` +
              `<div class="gr-choices">${PLANTS.map(p => chip('h2', p, plantName(p), h.h2.includes(p), plantIcon(p))).join('')}</div>`
            : `<p class="gr-sentence">${gloss(LABELS.hyp2.coo(blankHTML(h.coo.a && LABELS.cooWhen[h.coo.a]), blankHTML(h.coo.b && LABELS.cooWhen[h.coo.b])))}</p>` +
              cooRowsHTML(h.coo.a, h.coo.b, (row, x, on) => chip(row === 'a' ? 'cooA' : 'cooB', x, LABELS.cooWhen[x], on))) +
          `</div></div>` +
        `<label class="gr-because"><span>${LABELS.because}</span>` +
        `<input type="text" class="lab-input gr-because-input" maxlength="160" placeholder="${LABELS.becausePlaceholder}" value="${escapeHtml(state.because)}" autocomplete="off"></label>` +
      `</div></div>`;

    $$('[data-hyp]').forEach(btn => btn.addEventListener('click', () => {
      const key = btn.dataset.hyp, val = btn.dataset.val;
      if (key === 'h2') h.h2 = h.h2.includes(val) ? h.h2.filter(x => x !== val) : inOrder(h.h2.concat(val), PLANTS);
      else if (key === 'cooA') h.coo.a = val;
      else if (key === 'cooB') h.coo.b = val;
      else h[key] = val;
      renderPredict();
      lab.renderStepper();
    }));
    const because = $('.gr-because-input');
    because.addEventListener('input', e => { state.because = e.target.value; });
    // Hypothèses figées dès la première journée jouée.
    if (started()) {
      $$('[data-hyp]').forEach(btn => lab.setLock(btn, LABELS.lockHypothesisFixed, { icon: false }));
      because.readOnly = true;
      lab.setLock(because, LABELS.lockHypothesisFixed);
    }

    const ready = hypDone();
    const info = lab.state.showMissing && !ready ? lab.footerInfo(LABELS.lockHypothesis, true)
      : lab.footerInfo(ready ? LABELS.hypothesisReady : LABELS.hypothesisPending);
    lab.setFooter(info + `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-next>${LABELS.toCards} →</button></div>`);
    const next = $('[data-next]');
    next.addEventListener('click', () => lab.goToStep(2));
    lab.setLock(next, ready ? null : LABELS.lockHypothesis, { missing: true, key: 'next' });
  }

  /* ===== Étape 2 : les cartes d'identité, puis la salle de contrôle ===== */
  let stepperDone = null;
  let running = false;     // une journée défile
  let liveRun = null;      // la journée qui défile : { kind: 'test1' | 'try' | 'replay', on, sim, title }
  let hour = null;         // heure choisie sur le graphique (détail)
  let speed = 1;

  function renderExperiment() {
    lab.release();
    if (lab.state.showMissing && !lab.isFrozen() && !cardsDone()) state.view = 'cards';
    const room = state.view === 'room';
    if (room) fixShown();
    lab.body.innerHTML = `<div class="gr-run ${room ? 'is-room' : 'is-cards'}">` +
      `<section class="gr-main">` + tabsHTML() +
        (room ? roomHTML() : cardsHTML()) +
      `</section>` +
      (room ? `<section class="gr-side">${todayHTML()}${notebookHTML()}</section>` : '') +
      `</div>`;
    bindTabs();
    if (room) { bindRoom(); bindNotebook(); bindHours(); } else bindCards();
    setCaption(defaultCaption());
    renderRunFooter();
  }

  function tabsHTML() {
    return `<div class="gr-tabs" role="tablist">` + ['cards', 'room'].map((v, i) =>
      `<button type="button" role="tab" class="gr-tab ${state.view === v ? 'is-on' : ''}" data-view="${v}" data-lab-look aria-selected="${state.view === v}">` +
      `<span class="gr-tab-num">${i + 1}</span><span>${LABELS.tabs[v]}</span></button>`).join('') + `</div>`;
  }

  function bindTabs() {
    $$('[data-view]').forEach(btn => btn.addEventListener('click', () => {
      if (state.view === btn.dataset.view) return;
      state.view = btn.dataset.view;
      hour = null;
      renderExperiment();
    }));
    const tab = $('[data-view="room"]');
    if (state.view !== 'room') lab.setLock(tab, cardsDone() ? null : LABELS.lockRoom(CARD_SLOTS - cardsFilled()), { missing: true, key: 'tab-room' });
    else if (running) lab.setLock($('[data-view="cards"]'), LABELS.lockRunning, { icon: false });
  }

  /* --- a) Les cartes d'identité ---
     Une carte par installation : la ressource (liste), renouvelable ou non,
     et la chaîne d'énergie, en colonne comme un diagramme de flux du cours
     (objets dans des ovales, formes d'énergie dans des cases). L'élève
     choisit la première forme, la suite est donnée. Les lignes sont les
     mêmes sur toutes les cartes : turbine et générateur tombent à la même
     hauteur partout, et les panneaux solaires n'en ont pas. */
  const CHAINS = {
    wind: ['start', null, null, 'turbine', 'mechanical', 'generator', 'electrical'],
    solar: ['start', null, null, 'noturbine', null, 'panel', 'electrical'],
    nuclear: ['start', 'reactor', 'thermal', 'turbine', 'mechanical', 'generator', 'electrical'],
    gas: ['start', 'boiler', 'thermal', 'turbine', 'mechanical', 'generator', 'electrical'],
    coo: ['start', null, null, 'turbine', 'mechanical', 'generator', 'electrical']
  };
  const OBJECTS = ['boiler', 'reactor', 'turbine', 'generator', 'panel'];

  function selectHTML(p, kind, label) {
    const v = state.cards[p][kind];
    const miss = lab.state.showMissing && !v;
    const list = kind === 'res' ? state.order.res : state.order.forms;
    const name = x => (kind === 'res' ? LABELS.resources[x] : LABELS.forms[x]);
    return `<select class="lab-select gr-select ${v ? 'is-filled' : ''} ${miss ? 'lab-is-missing' : ''}" data-card="${p}|${kind}" aria-label="${escapeHtml(LABELS.slotLabel(label, plantName(p)))}">` +
      `<option value="" disabled ${v ? '' : 'selected'}>${LABELS.choose}</option>` +
      list.map(x => `<option value="${x}" ${v === x ? 'selected' : ''}>${name(x)}</option>`).join('') + `</select>`;
  }

  function chainHTML(p) {
    return `<div class="gr-chain">` + CHAINS[p].map(row => {
      if (row === 'start') return `<div class="gr-ch gr-ch-start">${selectHTML(p, 'form', p === 'coo' ? LABELS.cardStored : LABELS.cardChain)}</div>`;
      if (row === null) return `<div class="gr-ch gr-ch-gap"></div>`;
      if (row === 'noturbine') return `<div class="gr-ch gr-ch-gap"><strong class="gr-noturbine">${LABELS.noTurbine}</strong></div>`;
      if (OBJECTS.includes(row)) return `<div class="gr-ch gr-ch-obj"><span>${LABELS.objects[row]}</span></div>`;
      return `<div class="gr-ch gr-ch-form"><span>${LABELS.forms[row]}</span></div>`;
    }).join('') + `</div>`;
  }

  function cardHTML(p) {
    const c = state.cards[p];
    const head = `<div class="gr-card-head">${plantIcon(p, 'is-big')}<strong>${plantName(p)}</strong></div>`;
    if (p === 'coo') {
      return `<article class="gr-card is-storage">${head}` +
        `<p class="gr-chain-text">${gloss(LABELS.cooNote)}</p>` +
        `<p class="gr-card-label gr-chain-label">${gloss(LABELS.cardStored)}</p>${chainHTML(p)}</article>`;
    }
    const missRen = lab.state.showMissing && !c.ren;
    return `<article class="gr-card">${head}` +
      `<p class="gr-card-label">${LABELS.cardResource}</p>${selectHTML(p, 'res', LABELS.cardResource)}` +
      `<p class="gr-card-label">${LABELS.cardRenewable}</p>` +
      `<div class="gr-ren ${missRen ? 'lab-is-missing' : ''}">${['yes', 'no'].map(x => `<button type="button" class="lab-choice gr-ren-chip ${c.ren === x ? 'is-selected' : ''}" data-ren="${p}" data-val="${x}" aria-pressed="${c.ren === x}">${LABELS.renewable[x]}</button>`).join('')}</div>` +
      `<p class="gr-card-label gr-chain-label">${LABELS.cardChain}</p>${chainHTML(p)}` +
      `</article>`;
  }

  function cardsHTML() {
    return `<div class="gr-cards">${PLANTS.map(cardHTML).join('')}</div>` +
      `<p class="lab-caption gr-caption" data-caption aria-live="polite"></p>`;
  }

  function bindCards() {
    $$('[data-card]').forEach(sel => sel.addEventListener('change', () => {
      const [p, kind] = sel.dataset.card.split('|');
      state.cards[p][kind] = sel.value || null;
      afterCardChange();
    }));
    $$('[data-ren]').forEach(btn => btn.addEventListener('click', () => {
      state.cards[btn.dataset.ren].ren = btn.dataset.val;
      afterCardChange();
    }));
  }

  function afterCardChange() {
    if (lab.state.showMissing && cardsDone()) lab.state.showMissing = false;
    renderExperiment();
    lab.save();
  }

  /* --- b) La salle de contrôle ---
     Le paysage et le graphique de la journée (un seul SVG), les journées
     jouées (en haut du ciel), les interrupteurs, le bouton qui lance la
     journée, et à droite le bulletin du jour et le carnet.
     Test 1 : vent et soleil seuls, imposés ; il peut être rejoué. Test 2,
     la même journée (test équitable) : une installation de plus à chaque
     essai, jusqu'à une journée sans panne. Chaque essai garde ses heures de
     panne : l'échelle des essais montre ce que chaque centrale apporte.
     Une journée déjà jouée peut être revue (rejouée) sans rien changer. */
  const test2Open = () => (state.ran1 && notes1Done()) || state.tries.length > 0;
  const tryTitle = k => LABELS.tryTitle(k + 1, LABELS.plants[added(k)].short);

  // La journée affichée doit exister : sinon, la plus proche.
  function fixShown() {
    const s = state.shown;
    if (s === 'next' && (!test2Open() || success())) state.shown = state.tries.length ? state.tries.length - 1 : 'test1';
    else if (typeof s === 'number' && !(s < state.tries.length)) state.shown = state.tries.length ? state.tries.length - 1 : 'test1';
    else if (s !== 'test1' && s !== 'next' && typeof s !== 'number') state.shown = 'test1';
  }

  const simOf = s => (s === 'test1' ? (state.ran1 ? simulate(TEST1_ON) : null) : typeof s === 'number' ? simulate(state.tries[s]) : null);
  const onOf = s => (s === 'test1' ? TEST1_ON : typeof s === 'number' ? state.tries[s] : nextConfig());
  const shownSim = () => (running ? liveRun.sim : simOf(state.shown));
  const shownOn = () => (running ? liveRun.on : onOf(state.shown));
  const titleOf = s => (s === 'test1' ? LABELS.testTitle[1] : typeof s === 'number' ? tryTitle(s)
    : LABELS.tryTitle(state.tries.length + 1, state.next ? LABELS.plants[state.next].short : '?'));

  // Les journées jouées : test 1, puis les essais du test 2 et le prochain.
  function runsHTML() {
    // Panne ou pas (point rouge, ✓) ; le nombre d'heures une fois que l'élève
    // l'a compté et noté dans son carnet (le sien, juste ou non).
    const badge = (sim, d) => {
      if (!sim) return '';
      const w = state.notes.hours[d];
      if (w != null) return `<span class="gr-badge ${w ? 'is-ko' : 'is-ok'}">${LABELS.hoursShort(w)}</span>`;
      return blackoutHours(sim) ? `<span class="gr-badge is-ko is-dot" aria-label="${escapeHtml(LABELS.blackoutSign)}"></span>` : `<span class="gr-badge is-ok">✓</span>`;
    };
    const pill = (s, label, sim, d, extra) => `<button type="button" class="gr-pill ${state.shown === s ? 'is-on' : ''} ${extra || ''}" data-show="${s}" data-lab-look aria-pressed="${state.shown === s}"><span>${label}</span>${badge(sim, d)}</button>`;
    let out = pill('test1', LABELS.pillTest1, state.ran1 ? simulate(TEST1_ON) : null, 0);
    if (test2Open()) {
      out += `<span class="gr-goal">${LABELS.test2Goal}</span>` +
        state.tries.map((on, k) => pill(k, `+ ${LABELS.plants[added(k)].short}`, simulate(on), k + 1)).join('');
      if (!success()) out += pill('next', `+ ${state.next ? LABELS.plants[state.next].short : '?'}`, null, -1, 'is-next');
    }
    return `<div class="gr-runs" role="group">${out}</div>`;
  }

  function roomHTML() {
    const sim = shownSim();
    const title = running ? liveRun.title : titleOf(state.shown);
    return `<div class="lab-scene-wrap gr-stage" data-stage>` +
        `<svg class="lab-svg gr-svg" viewBox="0 0 800 ${VIEW_H}" preserveAspectRatio="xMidYMid meet" aria-label="${escapeHtml(LABELS.sceneLabel)}">` +
          `<g role="img" aria-label="${escapeHtml(LABELS.sceneLabel)}">${sceneSVG()}</g>` +
          graphSVG(sim, { uid: 'live', title, mode: 'live', reveal: sim && !running ? null : 0, hint: !!sim && !running && !state.tapped }) + `</svg>` +
        runsHTML() +
      `</div>` +
      `<p class="lab-caption gr-caption" data-caption aria-live="polite"></p>` +
      `<div class="gr-controls">` +
        `<div class="gr-switches">${PLANTS.map(switchHTML).join('')}</div>` +
        `<button type="button" class="lab-btn lab-btn-primary gr-runbtn" data-run>${runLabel()}</button>` +
      `</div>`;
  }

  // Interrupteurs : ceux de la journée affichée ; au test 2, ceux du prochain essai.
  const switchesOn = () => (running ? liveRun.on : test2Open() && !success() && state.shown !== 'test1' ? nextConfig()
    : success() && state.shown !== 'test1' ? lastConfig() : onOf(state.shown));

  function switchHTML(p) {
    const on = !!switchesOn()[p];
    return `<button type="button" class="gr-switch ${on ? 'is-on' : ''} ${state.next === p && !running ? 'is-new' : ''}" data-plant="${p}" aria-pressed="${on}">` +
      `<span class="gr-switch-icon">${plantIcon(p)}</span><span class="gr-switch-name">${LABELS.plants[p].short}</span>` +
      `<span class="gr-switch-state">${on ? LABELS.on : LABELS.off}</span></button>`;
  }

  const runLabel = () => (state.shown === 'next' || (state.shown === 'test1' && !state.ran1) ? `▶ ${LABELS.runDay}` : `↻ ${LABELS.runAgain}`);

  function bindRoom() {
    const open = test2Open() && !success();
    $$('[data-plant]').forEach(btn => {
      const p = btn.dataset.plant;
      const reason = running ? LABELS.lockRunning
        : success() && state.shown !== 'test1' ? LABELS.lockTest2Done
          : !open || (state.shown === 'test1') ? LABELS.lockTest1Plant
            : lastConfig()[p] ? LABELS.lockAlreadyOn : null;
      lab.setLock(btn, reason, { icon: false });
      btn.addEventListener('click', () => {
        state.next = state.next === p ? null : p;
        state.shown = 'next';
        hour = null;
        renderExperiment();
        lab.save();
      });
    });
    $('[data-run]').addEventListener('click', () => {
      const s = state.shown;
      if (s === 'test1') runDay('test1', TEST1_ON, LABELS.testTitle[1]);
      else if (s === 'next') runDay('try', nextConfig(), titleOf('next'));
      else runDay('replay', state.tries[s], tryTitle(s));
    });
    refreshRunButton();
    bindRuns();
    $$('[data-hour]').forEach(el => {
      const go = () => showHour(Number(el.dataset.hour));
      el.addEventListener('click', go);
      el.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        go();
      });
    });
    const speedBtn = $('[data-speed]');
    const toggleSpeed = () => {
      speed = speed === 1 ? 4 : 1;
      speedBtn.classList.toggle('is-active', speed > 1);
    };
    if (speedBtn) {
      speedBtn.addEventListener('click', toggleSpeed);
      speedBtn.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        toggleSpeed();
      });
    }
    paintScene(shownSim(), shownOn(), hour == null ? 0 : hour + 0.5);
    spinRotors(shownOn(), 0, 0);
    if (hour != null) markHour(hour);
  }

  // Le bouton de la journée : son texte et son verrou (le prochain essai attend
  // les heures notées de la journée précédente, puis une centrale de plus).
  function refreshRunButton() {
    const btn = $('[data-run]');
    if (!btn) return;
    btn.textContent = runLabel();
    const waitHours = state.shown === 'next' && !lastHoursWritten();
    const reason = running ? LABELS.lockRunning : waitHours ? LABELS.lockHoursFirst
      : state.shown === 'next' && !state.next ? LABELS.lockPickPlant : null;
    lab.setLock(btn, reason, { key: 'run', missing: waitHours });
  }

  function bindRuns() {
    $$('[data-show]').forEach(b => {
      lab.setLock(b, running ? LABELS.lockRunning : null, { icon: false });
      b.addEventListener('click', () => {
        const v = b.dataset.show;
        const s = v === 'test1' || v === 'next' ? v : Number(v);
        if (s === state.shown) return;
        state.shown = s;
        hour = null;
        renderExperiment();
      });
    });
  }

  // Après une saisie du carnet : les pastilles, le bouton et le pied de page
  // suivent, sans redessiner la salle (le geste suivant ne se perd pas).
  function refreshRoom() {
    const runs = $('.gr-runs');
    if (runs) {
      runs.insertAdjacentHTML('afterend', runsHTML());
      runs.remove();
      bindRuns();
    }
    refreshRunButton();
    setCaption(defaultCaption());
    updateRunFooter();
  }

  // Le détail d'une heure : le paysage à ce moment, la légende en mots.
  function showHour(i) {
    if (running) return;
    const sim = shownSim();
    if (!sim) { setCaption(LABELS.lockRunFirst, true); return; }
    hour = i;
    if (!state.tapped) {
      state.tapped = true;
      const hint = $('#gr-taphint');
      if (hint) hint.remove();
      lab.save();
    }
    paintScene(sim, shownOn(), i + 0.5);
    markHour(i);
    const h = sim[i];
    const weather = [run.sun[i] === 0 ? LABELS.weather.dark : run.cloudy[i] ? LABELS.weather.clouds : LABELS.weather.sun,
      run.wind[i] === 0 ? LABELS.weather.calm : run.wind[i] >= 20 ? LABELS.weather.strong : LABELS.weather.light].join(', ');
    const parts = STACK.filter(p => h[p] > 0).map(p => LABELS.part(LABELS.legend[p], h[p]));
    if (h.cooIn > 0) parts.push(LABELS.storedPart(h.cooIn));
    setCaption(LABELS.hourDetail(LABELS.hour(clockOf(i)), weather, LABELS.list(parts), h.need, h.missing));
  }

  function markHour(i) {
    const sel = $('#gr-sel');
    if (!sel) return;
    sel.setAttribute('x', String(xOf(i)));
    sel.setAttribute('opacity', '1');
  }

  /* La journée défile : environ 14 s (⏩ : 4 fois plus vite). Le graphique
     se dévoile heure par heure, le paysage suit. À la fin : le test 1 est
     joué, ou un essai du test 2 est compté ; une journée revue ne change
     rien. Rien n'est enregistré avant la fin (fermée en route : rien). */
  const HOUR_MS = 600;

  function runDay(kind, on, title) {
    if (running) return;
    const config = Object.assign({}, on);
    const sim = simulate(config);
    liveRun = { kind, on: config, sim, title };
    running = true;
    speed = 1;
    hour = null;
    renderExperiment();
    const reveal = $('#gr-reveal-rect-live');
    const token = lab.newScene();
    let t = 0;
    let last = performance.now();
    const step = now => {
      if (!lab.isScene(token)) { running = false; liveRun = null; return; }
      const dt = Math.max(0, Math.min(64, now - last));
      last = now;
      t = Math.min(HOURS, t + dt / (reduceMotion ? HOUR_MS / 6 : HOUR_MS) * speed);
      if (reveal) reveal.setAttribute('width', (t * COL).toFixed(1));
      paintScene(sim, config, Math.min(t, HOURS - 0.01));
      spinRotors(config, t, dt);
      if (t < HOURS) { requestAnimationFrame(step); return; }
      finishDay(kind, config, sim);
    };
    requestAnimationFrame(step);
  }

  function finishDay(kind, on, sim) {
    running = false;
    liveRun = null;
    const missing = blackoutHours(sim);
    if (kind === 'test1') state.ran1 = true;
    if (kind === 'try') {
      state.tries.push(on);
      state.next = null;
      state.shown = state.tries.length - 1;
    }
    renderExperiment();
    if (kind === 'try') {
      if (!missing) setCaption(LABELS.captionSuccess);
      else {
        const when = LABELS.list(PERIODS.filter(p => sim.some((h, i) => h.missing > 0 && periodOf(i) === p)).map(p => LABELS.periodsShort[p]));
        // Le nombre d'heures n'est pas donné : l'élève compte les colonnes rouges.
        setCaption(LABELS.captionBlackout(when), true);
      }
    }
    lab.renderStepper();
    lab.save();
  }

  /* --- Le bulletin du jour (à droite, au-dessus du carnet) ---
     Le type de journée tiré au sort, en mots : chacun voit que sa journée
     n'est pas celle de son voisin. */
  function todayHTML() {
    return `<div class="gr-today"><span class="gr-today-title">${LABELS.today}</span>` +
      `<span class="gr-today-text">${gloss(LABELS.forecastShort(run.season, run.sky, run.windType))}</span></div>`;
  }

  /* --- Le carnet (à droite) ---
     Test 1 : panne ou pas, et quand le vent et le soleil n'ont rien donné.
     Test 2 (une journée sans panne) : pour chaque installation, de
     l'électricité quand il faisait noir et sans vent ? la même quantité
     toute la journée ? L'élève note ; le labo n'écrit jamais à sa place. */
  function notebookHTML() {
    const n = state.notes;
    const show = lab.state.showMissing;
    const chip = (field, val, label, on, extra) => `<button type="button" class="lab-choice gr-nb-chip ${on ? 'is-selected' : ''}" data-note="${field}" data-val="${val}" aria-pressed="${on}" ${extra || ''}>${label}</button>`;
    const rows = PLANTS.map(p => `<tr><th scope="row"><span class="gr-nb-plant">${plantIcon(p)}<span>${LABELS.plants[p].short}</span></span></th>` +
      ['dark', 'same'].map(k => `<td class="${show && !n.plants[p][k] ? 'lab-is-missing' : ''}"><div class="gr-yn">` +
        ['yes', 'no'].map(v => chip(`${p}|${k}`, v, LABELS[v], n.plants[p][k] === v,
          `aria-label="${escapeHtml(LABELS.choiceLabel(LABELS.plants[p].short, k === 'dark' ? LABELS.n2Dark : LABELS.n2Same, LABELS[v]))}"`)).join('') +
      `</div></td>`).join('') + `</tr>`).join('');
    // Une case par journée jouée : le test 1, puis chaque essai du test 2.
    const days = [LABELS.test(1)].concat(state.tries.map((on, k) => `+ ${LABELS.plants[added(k)].short}`));
    const cells = (state.ran1 ? days : [LABELS.test(1)]).map((day, d) => `<label class="gr-hours-cell ${show && n.hours[d] == null ? 'lab-is-missing' : ''}">` +
      `<span class="gr-hours-day">${day}</span><span class="gr-hours-in">` +
      `<input type="text" inputmode="numeric" class="gr-hours-input" data-hours="${d}" value="${n.hours[d] == null ? '' : n.hours[d]}" maxlength="2" autocomplete="off" spellcheck="false" aria-label="${escapeHtml(LABELS.hoursAria(day))}">` +
      `<span>${LABELS.hourUnit}</span></span></label>`).join('');
    return `<h3 class="lab-panel-title">${LABELS.notebookTitle}</h3>` +
      `<div class="gr-nb-block ${state.ran1 ? '' : 'is-waiting'}">` +
        `<p class="gr-nb-title">${gloss(LABELS.hoursTitle)} <span class="gr-hint">${LABELS.hoursHint}</span></p>` +
        `<div class="gr-hours">${cells}</div>` +
      `</div>` +
      `<div class="gr-nb-block ${state.ran1 ? '' : 'is-waiting'}">` +
        `<p class="gr-nb-title">${LABELS.testTitle[1]}</p>` +
        `<div class="gr-nb-q ${show && !n.nothing.length ? 'lab-is-missing' : ''}"><p>${gloss(LABELS.n1Nothing)} <span class="gr-hint">${LABELS.n1NothingHint}</span></p>` +
          `<div class="gr-yn">${PERIODS.map(p => chip('nothing', p, LABELS.periodsShort[p], n.nothing.includes(p))).join('')}</div></div>` +
      `</div>` +
      `<div class="gr-nb-block ${success() ? '' : 'is-waiting'}">` +
        `<p class="gr-nb-title">${LABELS.testTitle[2]}</p>` +
        `<p class="gr-nb-hint">${gloss(LABELS.darkCalm)}</p>` +
        `<table class="gr-nb-table"><thead><tr><th scope="col">${LABELS.n2Head}</th><th scope="col">${gloss(LABELS.n2Dark)}</th><th scope="col">${gloss(LABELS.n2Same)}</th></tr></thead><tbody>${rows}</tbody></table>` +
      `</div>`;
  }

  function bindNotebook() {
    const n = state.notes;
    $$('[data-note]').forEach(btn => {
      const field = btn.dataset.note;
      const t1 = field === 'nothing';
      const reason = t1 ? (state.ran1 ? null : LABELS.lockRun1First) : (success() ? null : LABELS.lockSuccessFirst);
      lab.setLock(btn, running ? LABELS.lockRunning : reason, { icon: false });
      btn.addEventListener('click', () => {
        const v = btn.dataset.val;
        const wasOpen = test2Open();
        if (field === 'nothing') n.nothing = n.nothing.includes(v) ? n.nothing.filter(x => x !== v) : inOrder(n.nothing.concat(v), PERIODS);
        else {
          const [p, k] = field.split('|');
          n.plants[p][k] = v;
        }
        if (lab.state.showMissing && stepComplete(2)) lab.state.showMissing = false;
        // Le test 2 s'ouvre quand le carnet du test 1 est complet.
        const opened = !wasOpen && test2Open();
        if (opened) { state.shown = 'next'; hour = null; }
        renderExperiment();
        if (opened) setCaption(LABELS.captionTest2);
        lab.save();
      });
    });
  }

  function bindHours() {
    const n = state.notes;
    $$('[data-hours]').forEach(input => {
      const d = Number(input.dataset.hours);
      lab.setLock(input, running ? LABELS.lockRunning : d < daysPlayed() ? null : LABELS.lockRun1First);
      const read = final => {
        const raw = input.value.trim();
        const valid = /^\d{1,2}$/.test(raw) && Number(raw) <= HOURS;
        const wasOpen = test2Open();
        const before = n.hours[d];
        n.hours[d] = valid ? Number(raw) : null;
        if (valid) input.classList.remove('lab-is-missing');
        if (final) {
          if (valid) input.value = String(Number(raw));
          input.classList.toggle('is-invalid', !valid && raw !== '');
        }
        if (lab.state.showMissing && stepComplete(2)) lab.state.showMissing = false;
        // Le test 2 s'ouvre (carnet du test 1 complet) : la salle est redessinée,
        // à la sortie du champ. Sinon, seuls les pastilles et le bouton suivent.
        if (!wasOpen && test2Open()) {
          if (final) {
            state.shown = 'next';
            hour = null;
            renderExperiment();
            setCaption(LABELS.captionTest2);
          }
        } else if (final || n.hours[d] !== before) refreshRoom();
        lab.save();
      };
      input.addEventListener('input', () => { input.classList.remove('is-invalid'); read(false); });
      input.addEventListener('change', () => read(true));
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
    });
  }

  function defaultCaption() {
    if (state.view === 'cards') return cardsDone() ? LABELS.captionCardsDone : LABELS.captionCards;
    if (running) return LABELS.captionRunning;
    if (!state.ran1) return LABELS.captionTest1;
    if (!notes1Done() && !state.tries.length) return LABELS.captionTest1Done;
    if (success()) return LABELS.captionTest2Done;
    if (state.shown === 'next' && !lastHoursWritten()) return LABELS.lockHoursFirst;
    if (state.shown === 'next') return state.next ? LABELS.captionTryReady(LABELS.plants[state.next].short) : LABELS.captionAddPlant;
    return LABELS.captionTest2;
  }

  function setCaption(text, warn) {
    const c = $('[data-caption]');
    if (!c) return;
    c.innerHTML = `<span>${gloss(text)}</span>`;
    c.classList.toggle('is-warning', !!warn);
  }

  /* Pied de page : « vers la salle de contrôle » (ouverte quand les cartes
     sont complètes), puis « vers la conclusion ». */
  function renderRunFooter() {
    const toRoom = state.view === 'cards' && !stepComplete(2);
    lab.setFooter(lab.footerInfo('') + `<div class="lab-footer-actions">` +
      `<button type="button" class="lab-btn lab-btn-primary" data-next>${toRoom ? LABELS.toRoom : LABELS.toConclude} →</button></div>`);
    $('[data-next]').addEventListener('click', () => {
      if (toRoom) { state.view = 'room'; renderExperiment(); } else lab.goToStep(3);
    });
    updateRunFooter();
  }

  function updateRunFooter() {
    const complete = stepComplete(2);
    const warn = lab.state.showMissing && !complete;
    const info = $('.lab-footer .lab-footer-info');
    if (info) {
      info.textContent = warn ? lockReason(2) : LABELS.runInfo(cardsFilled(), CARD_SLOTS, notesFilled(), notesTotal());
      info.classList.toggle('is-warning', warn);
    }
    const next = $('[data-next]');
    if (next) {
      const toRoom = state.view === 'cards' && !complete;
      const reason = running ? LABELS.lockRunning : toRoom ? (cardsDone() ? null : LABELS.lockCards(CARD_SLOTS - cardsFilled())) : (complete ? null : lockReason(2));
      lab.setLock(next, reason, { missing: !running, key: 'next' });
    }
    if (complete !== stepperDone) { stepperDone = complete; lab.renderStepper(); }
  }

  /* ===== Étape 3 : conclusion =====
     À gauche, les résultats : les graphiques des deux tests et le carnet ;
     à droite, les réponses aux deux questions, puis le jugement des
     hypothèses. */
  function conclusionParts() {
    const c = state.concl;
    return {
      q1: !!(c.when && c.q1 && c.why),
      q2: !!((usesPlants() ? c.q2.length : c.cooA && c.cooB) && (!usesStored() || c.stored)),
      verdict: !!(c.v1 && c.v2)
    };
  }

  function conclusionsComplete() {
    return Object.values(conclusionParts()).every(Boolean);
  }

  // Le graphique d'un test (1, ou 2 : le dernier essai, sans panne).
  const graphTitle = n => (n === 1 ? LABELS.testTitle[1] : state.tries.length ? tryTitle(state.tries.length - 1) : LABELS.testTitle[2]);
  const graphOnly = (n, uid, cls) => `<svg class="lab-svg ${cls}" viewBox="0 192 800 ${VIEW_H - 192}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escapeHtml(graphTitle(n))}">` +
    graphSVG(simulate(n === 1 ? TEST1_ON : finalConfig()), { uid, title: graphTitle(n), mode: 'print' }) + `</svg>`;

  // Petit graphique : un toucher l'ouvre en grand, par-dessus le labo.
  function miniGraph(n, uid) {
    return `<button type="button" class="gr-zoom" data-zoom="${n}" data-lab-look aria-label="${escapeHtml(LABELS.zoom(graphTitle(n)))}">${graphOnly(n, uid, 'gr-mini')}</button>`;
  }

  function bindZoom() {
    $$('[data-zoom]').forEach(b => b.addEventListener('click', () => {
      const n = Number(b.dataset.zoom);
      lab.openSheet(`<div class="gr-zoom-view">${graphOnly(n, 'z' + n, 'gr-big')}</div>`, graphTitle(n));
    }));
  }

  // L'échelle des essais du test 2 : « + Gas 9 h → + Nuclear 3 h → + Coo ✓ ».
  const writtenHours = d => (state.notes.hours[d] == null ? '?' : LABELS.hoursShort(state.notes.hours[d]));
  const ladderText = () => [`${LABELS.test(1)} ${writtenHours(0)}`]
    .concat(state.tries.map((on, k) => `+ ${LABELS.plants[added(k)].short} ${writtenHours(k + 1)}`)).join(' → ');

  function notesRecapHTML() {
    const n = state.notes;
    const yn = v => (v ? LABELS[v] : '—');
    return `<p class="gr-recap-line"><strong>${gloss(LABELS.hoursTitle)}:</strong> ${ladderText()}</p>` +
      `<p class="gr-recap-line"><strong>${LABELS.test(1)}</strong> · ${gloss(LABELS.n1Nothing)} <b>${listOf(n.nothing, p => LABELS.periodsShort[p])}</b></p>` +
      `<table class="lab-table gr-recap"><thead><tr><th scope="col">${LABELS.test(2)}</th><th scope="col">${gloss(LABELS.n2Dark)}</th><th scope="col">${gloss(LABELS.n2Same)}</th></tr></thead><tbody>` +
      PLANTS.map(p => `<tr><th scope="row"><span class="gr-nb-plant">${plantIcon(p)}<span>${LABELS.plants[p].short}</span></span></th><td>${yn(n.plants[p].dark)}</td><td>${yn(n.plants[p].same)}</td></tr>`).join('') +
      `</tbody></table>`;
  }

  function renderConclude() {
    const c = state.concl;
    const parts = conclusionParts();
    const show = lab.state.showMissing;
    const miss = key => (show && !parts[key] ? 'lab-is-missing' : '');
    const chip = (field, val, label, on, icon) => `<button type="button" class="lab-choice gr-chip ${on ? 'is-selected' : ''}" data-c="${field}" data-val="${val}" aria-pressed="${on}">${icon || ''}<span>${label}</span></button>`;

    lab.body.innerHTML = `<div class="gr-conclude">` +
      `<section class="gr-results">` +
        `<h3 class="lab-panel-title">${LABELS.resultsTitle}</h3>` +
        `<div class="gr-minis">${miniGraph(1, 'c1')}${miniGraph(2, 'c2')}</div>` +
        notesRecapHTML() +
      `</section>` +
      `<section class="gr-form">` +
        `<div class="gr-q ${miss('q1')}">` +
          `<p class="gr-q-title"><span class="gr-num" aria-hidden="true">1</span><span>${gloss(LABELS.questions.q1)}</span></p>` +
          `<p class="gr-sentence-sm">${gloss(LABELS.concl1a(blankHTML(c.when && LABELS.when[c.when])))}</p>` +
          `<div class="gr-chips">${WHEN.map(x => chip('when', x, LABELS.when[x], c.when === x)).join('')}</div>` +
          `<p class="gr-sentence-sm">${gloss(LABELS.concl1(blankHTML(c.q1 && LABELS[c.q1]), blankHTML(c.why && LABELS.q1why[c.why])))}</p>` +
          `<div class="gr-chips">${['can', 'cannot'].map(x => chip('q1', x, LABELS[x], c.q1 === x)).join('')}</div>` +
          `<div class="gr-chips">${['none', 'little', 'lot'].map(x => chip('why', x, LABELS.q1why[x], c.why === x)).join('')}</div>` +
        `</div>` +
        `<div class="gr-q ${miss('q2')}">` +
          `<p class="gr-q-title"><span class="gr-num" aria-hidden="true">2</span><span>${gloss(LABELS.questions.q2[run.q2])}</span></p>` +
          (usesPlants()
            ? `<p class="gr-sentence-sm">${gloss(LABELS.concl2[run.q2])}</p>` +
              `<div class="gr-chips">${PLANTS.map(p => chip('q2', p, plantName(p), c.q2.includes(p), plantIcon(p))).join('')}</div>`
            : `<p class="gr-sentence-sm">${gloss(LABELS.concl2.coo(blankHTML(c.cooA && LABELS.cooWhen[c.cooA]), blankHTML(c.cooB && LABELS.cooWhen[c.cooB])))}</p>` +
              cooRowsHTML(c.cooA, c.cooB, (row, x, on) => chip(row === 'a' ? 'cooA' : 'cooB', x, LABELS.cooWhen[x], on))) +
          (usesStored()
            ? `<p class="gr-sentence-sm">${gloss(LABELS.concl2b(blankHTML(c.stored && LABELS.stored[c.stored])))}</p>` +
              `<div class="gr-chips">${['stored', 'made', 'destroyed'].map(x => chip('stored', x, LABELS.stored[x], c.stored === x)).join('')}</div>`
            : '') +
        `</div>` +
        `<div class="gr-q gr-verdicts ${miss('verdict')}">` +
          [1, 2].map(n => `<div class="gr-chips"><span class="gr-q-text">${LABELS.qVerdict(n)}</span>` +
            ['confirmed', 'rejected'].map(x => chip('v' + n, x, LABELS[x], c['v' + n] === x)).join('') + `</div>`).join('') +
        `</div>` +
      `</section></div>`;

    bindZoom();
    $$('[data-c]').forEach(btn => btn.addEventListener('click', () => {
      const f = btn.dataset.c, v = btn.dataset.val;
      if (f === 'q2') c.q2 = c.q2.includes(v) ? c.q2.filter(x => x !== v) : inOrder(c.q2.concat(v), PLANTS);
      else c[f] = v;
      renderConclude();
    }));

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

  /* ===== Étape 4 : correction ===== */
  const CRITERIA = ['plants', 'chains', 'notes', 'answers', 'verdicts'];

  function evaluate() {
    const c = state.concl;
    const t = truth();
    const cardMiss = [];
    SOURCES.forEach(p => {
      const card = state.cards[p];
      if (card.res !== RESOURCE_OF[p]) cardMiss.push({ p, k: 'res' });
      if (card.ren !== RENEWABLE[p]) cardMiss.push({ p, k: 'ren' });
    });
    const chainMiss = PLANTS.filter(p => state.cards[p].form !== START_FORM[p]);
    const noteMiss = [];
    t.hours.forEach((h, d) => { if (state.notes.hours[d] !== h) noteMiss.push({ k: 'hours', d }); });
    if (!sameSet(state.notes.nothing, t.nothing)) noteMiss.push({ k: 'nothing' });
    PLANTS.forEach(p => ['dark', 'same'].forEach(k => {
      if (state.notes.plants[p][k] !== t.plants[p][k]) noteMiss.push({ k: 'plant', p, q: k });
    }));
    const q1Ok = c.when === t.when && c.q1 === 'cannot' && c.why === 'none';
    const q2Ok = (usesPlants() ? sameSet(c.q2, Q2_PLANTS[run.q2]) : c.cooA === 'much' && c.cooB === 'little') &&
      (!usesStored() || c.stored === 'stored');
    const should1 = state.hyp.h1 === c.when ? 'confirmed' : 'rejected';
    const same2 = usesPlants() ? sameSet(state.hyp.h2, c.q2) : state.hyp.coo.a === c.cooA && state.hyp.coo.b === c.cooB;
    const should2 = same2 ? 'confirmed' : 'rejected';
    return {
      t, cardMiss, chainMiss, noteMiss, q1Ok, q2Ok, should1, should2,
      v1Ok: c.v1 === should1, v2Ok: c.v2 === should2,
      notesGood: notesTotal() - noteMiss.length,
      plants: cardMiss.length === 0,
      chains: chainMiss.length === 0,
      notes: noteMiss.length === 0,
      answers: q1Ok && q2Ok,
      verdicts: c.v1 === should1 && c.v2 === should2
    };
  }

  const said = (kind, v) => (v == null ? CHECK.nothing : kind === 'res' ? LABELS.resources[v] : kind === 'ren' ? LABELS.renewable[v] : kind === 'form' ? LABELS.forms[v] : LABELS[v]);
  const qName = k => (k === 'dark' ? LABELS.n2Dark : LABELS.n2Same);

  function cardMissText(m) {
    const card = state.cards[m.p];
    return m.k === 'res'
      ? CHECK.cardWrongRes(plantName(m.p), said('res', card.res), LABELS.resources[RESOURCE_OF[m.p]])
      : CHECK.cardWrongRen(plantName(m.p), said('ren', card.ren), LABELS.renewable[RENEWABLE[m.p]]);
  }

  const dayName = d => (d ? `${LABELS.test(2)}, + ${plantName(added(d - 1))}` : LABELS.test(1));

  const chainMissText = p => CHECK.chainWrong(plantName(p), said('form', state.cards[p].form), LABELS.forms[START_FORM[p]]);

  function noteMissText(m, t) {
    const n = state.notes;
    if (m.k === 'hours') return CHECK.hoursWrong(dayName(m.d), n.hours[m.d] == null ? CHECK.nothing : n.hours[m.d], t.hours[m.d]);
    if (m.k === 'nothing') return CHECK.nothingWrong(listOf(n.nothing, p => LABELS.periodsShort[p]), LABELS.list(t.nothing.map(p => LABELS.periods[p])));
    return CHECK.plantWrong(plantName(m.p), qName(m.q), said('yn', n.plants[m.p][m.q]), LABELS[t.plants[m.p][m.q]]);
  }

  // Les faits de chaque installation (rien que des faits : FO2).
  function factsHTML(t) {
    const H = LABELS.factsHead;
    const yn = v => LABELS[v];
    const rows = PLANTS.map(p => {
      const src = p !== 'coo';
      return `<tr><th scope="row"><span class="gr-nb-plant">${plantIcon(p)}<span>${plantName(p)}</span></span></th>` +
        `<td>${src ? LABELS.resources[RESOURCE_OF[p]] : `<em>${LABELS.factsStorage}</em>`}</td>` +
        `<td>${src ? LABELS.renewable[RENEWABLE[p]] : '—'}</td>` +
        `<td>${yn(p === 'wind' || p === 'solar' ? 'yes' : 'no')}</td>` +
        `<td>${yn(t.plants[p].dark)}</td><td>${yn(t.plants[p].same)}</td></tr>`;
    }).join('');
    return `<p class="gr-q-head">${LABELS.factsTitle}</p>` +
      `<table class="lab-table gr-facts"><thead><tr>${['plant', 'resource', 'renewable', 'weather', 'dark', 'same'].map(k => `<th scope="col">${gloss(H[k])}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  function criterionDetail(key, ev) {
    const c = state.concl;
    if (key === 'plants') {
      return (ev.plants ? `<p class="gr-ok">${CHECK.cardsAllGood}</p>` : `<ul class="gr-misslist">${ev.cardMiss.map(m => `<li class="gr-ko">${cardMissText(m)}</li>`).join('')}</ul>`) +
        factsHTML(ev.t) + `<p class="gr-muted">${gloss(EXPLAIN.facts)} ${gloss(EXPLAIN.other)}</p>`;
    }
    if (key === 'chains') {
      return (ev.chains ? `<p class="gr-ok">${CHECK.chainsAllGood}</p>`
        : `<ul class="gr-misslist">${ev.chainMiss.map(p => `<li><strong class="gr-ko">${chainMissText(p)}</strong> ${gloss(CHECK.chainWhy[p])}</li>`).join('')}</ul>`) +
        `<p>${gloss(EXPLAIN.noTurbine)}</p><p>${gloss(EXPLAIN.coo)}</p><p class="gr-muted">${gloss(EXPLAIN.losses)}</p>`;
    }
    if (key === 'notes') {
      return `<p>${CHECK.notesScore(ev.notesGood, notesTotal())}</p>` +
        (ev.notes ? `<p class="gr-ok">${CHECK.notesAllGood}</p>` : `<ul class="gr-misslist">${ev.noteMiss.map(m => `<li class="gr-ko">${gloss(noteMissText(m, ev.t))}</li>`).join('')}</ul>`) +
        `<ul class="gr-plainlist">${PLANTS.map(p => `<li>${gloss(EXPLAIN[p])}</li>`).join('')}</ul>`;
    }
    if (key === 'answers') {
      const right1 = `${LABELS.concl1a(LABELS.when[ev.t.when])} ${LABELS.concl1(LABELS.cannot, LABELS.q1why.none)}`;
      const right2 = right2Text();
      const why2 = run.q2 === 'night' ? `${gloss(EXPLAIN.nuclear)} ${gloss(EXPLAIN.gas)}</p><p>${gloss(EXPLAIN.coo)}`
        : run.q2 === 'follow' ? `${gloss(EXPLAIN.gas)}</p><p>${gloss(EXPLAIN.coo)} ${gloss(EXPLAIN.nuclear)}`
          : `${gloss(EXPLAIN.coo)}</p><p>${gloss(EXPLAIN.losses)}`;
      return `<p class="gr-q-head">1. ${gloss(LABELS.questions.q1)}</p>` +
        (ev.q1Ok ? `<p class="gr-ok">${CHECK.answerOk} ${gloss(right1)}</p>` : `<p class="gr-ko">${CHECK.answerWrong} <strong>${gloss(right1)}</strong></p>`) +
        `<p>${gloss(EXPLAIN.wind)} ${gloss(EXPLAIN.solar)}</p>` +
        `<p class="gr-q-head">2. ${gloss(LABELS.questions.q2[run.q2])}</p>` +
        (ev.q2Ok ? `<p class="gr-ok">${CHECK.answerOk} ${gloss(right2)}</p>` : `<p class="gr-ko">${CHECK.answerWrong} <strong>${gloss(right2)}</strong></p>`) +
        `<p>${why2}</p><p class="gr-muted">${gloss(EXPLAIN.other)}</p>`;
    }
    const block = (n, hypText, conclText, ok, given, should) =>
      `<p><strong>${CHECK.yourHyp(n)}</strong> ${gloss(hypText)}</p>` +
      `<p><strong>${CHECK.yourConcl(n)}</strong> ${gloss(conclText)}</p>` +
      `<p class="${ok ? 'gr-ok' : 'gr-ko'}">${ok ? CHECK.verdictOk(given) : CHECK.verdictWrong(should)}</p>`;
    const concl2 = usesPlants() ? `${LABELS.concl2[run.q2]} ${listOf(c.q2, plantThe)}.`
      : LABELS.concl2.coo(c.cooA ? LABELS.cooWhen[c.cooA] : '—', c.cooB ? LABELS.cooWhen[c.cooB] : '—');
    return block(1, hyp1Text(state.hyp.h1), LABELS.concl1a(c.when ? LABELS.when[c.when] : '—'), ev.v1Ok, c.v1, ev.should1) +
      block(2, hyp2Text(), concl2, ev.v2Ok, c.v2, ev.should2) +
      (ev.should1 === 'rejected' || ev.should2 === 'rejected' ? `<p class="gr-muted">${CHECK.rejectedNote}</p>` : '');
  }

  function renderCheck() {
    const ev = evaluate();
    const score = CRITERIA.filter(k => ev[k]).length;
    const rows = CRITERIA.map(k => `<button type="button" class="gr-crit ${ev[k] ? 'is-ok' : 'is-ko'} ${state.selected === k ? 'is-selected' : ''}" data-crit="${k}">` +
      `<span class="gr-crit-text"><strong>${LABELS.criteria[k]}</strong><small>${LABELS.criteriaSub[k]}</small></span>` +
      `<span class="gr-crit-mark" aria-label="${ev[k] ? LABELS.markCorrect : LABELS.markIncorrect}">${ev[k] ? '✓' : '✗'}</span></button>`).join('');

    lab.body.innerHTML = `<div class="gr-check">` +
      `<div class="gr-check-left">` +
        `<div class="lab-score"><span class="lab-score-num">${score}<small> / ${CRITERIA.length}</small></span><span class="lab-score-label">${LABELS.scoreLabel}</span></div>` +
        `<div class="gr-crit-list">${rows}</div>` +
        `<div class="gr-reminder">${questionsHTML()}</div>` +
      `</div>` +
      `<div class="gr-check-detail" aria-live="polite"><h3>${LABELS.criteria[state.selected]}</h3>${criterionDetail(state.selected, ev)}</div>` +
      `</div>`;

    $$('[data-crit]').forEach(btn => btn.addEventListener('click', () => {
      state.selected = btn.dataset.crit;
      renderCheck();
    }));
    lab.fillSpace($('.gr-check-detail'));
    lab.checkFooter();
  }

  /* ===== Rapport imprimable : contenu des 7 sections de la fiche outil FO3
     (en-tête, numérotation et mise en page : cadre commun) =====
     Les erreurs passent par mark() (lab-engine.js) : case de carte fausse,
     observation fausse, réponses et jugements. Les graphiques des deux tests
     (titre, axes, unités : FO5c) sont dans les résultats. */
  function buildReport(mark) {
    const R = LABELS.report;
    const ev = evaluate();
    const c = state.concl;
    const n = state.notes;
    const cardMissOf = new Map(ev.cardMiss.map(m => [`${m.p}|${m.k}`, m]));

    const cell = (p, k) => {
      const v = state.cards[p][k];
      const text = v == null ? '—' : k === 'res' ? LABELS.resources[v] : k === 'ren' ? LABELS.renewable[v] : LABELS.forms[v];
      if (k === 'form') return state.cards[p].form === START_FORM[p] ? text : mark(text, `${chainMissText(p)} ${CHECK.chainWhy[p]}`, { box: true });
      const m = cardMissOf.get(`${p}|${k}`);
      return m ? mark(text, cardMissText(m), { box: true }) : text;
    };
    const cards = `<table class="gr-report-table"><caption>${R.cardsCaption}</caption>` +
      `<tr><th></th><th>${LABELS.cardResource}</th><th>${LABELS.cardRenewable}</th><th>${LABELS.cardChain}</th></tr>` +
      PLANTS.map(p => `<tr><th>${plantName(p)}</th>` + (p === 'coo' ? `<td>—</td><td>—</td>` : `<td>${cell(p, 'res')}</td><td>${cell(p, 'ren')}</td>`) + `<td>${cell(p, 'form')}</td></tr>`).join('') + `</table>`;

    const noteMissOf = m => noteMissText(m, ev.t);
    const missFor = (k, p, q) => ev.noteMiss.find(m => m.k === k && (k === 'hours' ? m.d === p : k !== 'plant' || (m.p === p && m.q === q)));
    const noteCell = (text, m) => (m ? mark(text, plainText(noteMissOf(m)), { box: true }) : text);
    const yn = v => (v ? LABELS[v] : '—');
    const notes1 = `<table class="gr-report-table"><caption>${R.notes1Caption}</caption>` +
      `<tr><th>${LABELS.n1Nothing}</th><td>${noteCell(listOf(n.nothing, p => LABELS.periodsShort[p]), missFor('nothing'))}</td></tr></table>`;
    const notes2 = `<table class="gr-report-table"><caption>${R.notes2Caption}</caption>` +
      `<tr><th></th><th>${LABELS.n2Dark}</th><th>${LABELS.n2Same}</th></tr>` +
      PLANTS.map(p => `<tr><th>${plantName(p)}</th>${['dark', 'same'].map(q => `<td>${noteCell(yn(n.plants[p][q]), missFor('plant', p, q))}</td>`).join('')}</tr>`).join('') + `</table>`;
    const graph = k => `<div class="gr-report-graph"><p class="gr-report-graph-title">${R.graphTitle} — ${R.graphCaption(k)}</p>` +
      graphOnly(k, 'r' + k, 'gr-report-svg') + `</div>`;
    // Les heures de panne de chaque journée, notées par l'élève (test 1, puis les essais du test 2).
    const hoursCell = d => noteCell(n.hours[d] == null ? '—' : String(n.hours[d]), missFor('hours', d));
    const ladder = `<table class="gr-report-table"><caption>${R.triesCaption}</caption>` +
      `<tr><th>${R.triesHead.try}</th><th>${R.triesHead.added}</th><th>${R.triesHead.hours}</th></tr>` +
      `<tr><td>${LABELS.test(1)}</td><td>${LABELS.pillTest1}</td><td>${hoursCell(0)}</td></tr>` +
      state.tries.map((on, k) => `<tr><td>${k + 1}</td><td>+ ${plantName(added(k))}</td><td>${hoursCell(k + 1)}</td></tr>`).join('') + `</table>`;

    // Interprétation : ce que disent les deux tests, avec les mots de l'élève
    // (une erreur du carnet est déjà marquée dans les résultats).
    const blackout1 = n.hours[0] == null ? '—' : n.hours[0];
    const nothing = listOf(n.nothing, p => LABELS.periods[p]);
    const darkPlants = PLANTS.filter(p => n.plants[p].dark === 'yes');
    const plantsOn = PLANTS.filter(p => finalConfig()[p]);
    const interpretation = `<p>${R.test1(blackout1, nothing)}</p>` +
      `<p>${R.test2(state.tries.length, LABELS.list(plantsOn.map(plantThe)))} ${R.dark(listOf(darkPlants, plantThe))}</p>`;

    // Conclusion : les phrases de l'élève, chaque mot faux marqué à sa place.
    const word = (text, ok, note) => (ok ? text : mark(text, note));
    const right1 = `${CHECK.answerWrong} ${LABELS.concl1a(LABELS.when[ev.t.when])} ${LABELS.concl1(LABELS.cannot, LABELS.q1why.none)}`;
    const right2 = `${CHECK.answerWrong} ${right2Text()}`;
    const when = c.when ? word(LABELS.when[c.when], c.when === ev.t.when, right1) : '—';
    const q1 = c.q1 ? word(LABELS[c.q1], c.q1 === 'cannot', right1) : '—';
    const why = c.why ? word(LABELS.q1why[c.why], c.why === 'none', right1) : '—';
    const q2 = usesPlants()
      ? (c.q2.length ? word(LABELS.list(c.q2.map(plantThe)), sameSet(c.q2, Q2_PLANTS[run.q2]), right2) : '—')
      : LABELS.concl2.coo(c.cooA ? word(LABELS.cooWhen[c.cooA], c.cooA === 'much', right2) : '—', c.cooB ? word(LABELS.cooWhen[c.cooB], c.cooB === 'little', right2) : '—');
    const stored = c.stored ? word(LABELS.stored[c.stored], c.stored === 'stored', `${right2} ${plainText(EXPLAIN.coo)}`) : '—';
    const verdict = (k, given, ok, should) => R.verdict(k, given ? word(LABELS[given], ok, CHECK.verdictWrong(should)) : '—');
    const conclusion = `<p>${LABELS.concl1a(when)} ${LABELS.concl1(q1, why)}</p>` +
      `<p>${usesPlants() ? `${LABELS.concl2[run.q2]} ${q2}.` : q2}${usesStored() ? ` ${LABELS.concl2b(stored)}` : ''}</p>` +
      `<p>${verdict(1, c.v1, ev.v1Ok, ev.should1)} ${verdict(2, c.v2, ev.v2Ok, ev.should2)}</p>`;

    const hyp = `<ol><li>${hyp1Text(state.hyp.h1)}</li><li>${hyp2Text()}</li></ol>` +
      (state.because.trim() ? `<p>${R.because}: ${escapeHtml(state.because.trim())}</p>` : '');

    const correction = CRITERIA.map(k => `<tr><th>${LABELS.criteria[k]}</th><td class="${ev[k] ? 'ok' : 'ko'}">${ev[k] ? '✓' : '✗'}</td></tr>`).join('');

    return {
      title: R.title,
      sections: [
        `<ol><li>${LABELS.questions.q1}</li><li>${LABELS.questions.q2[run.q2]}</li></ol>`,
        hyp,
        `<p>${R.materials(LABELS.forecast(run.season, run.sky, run.windType))}</p>`,
        `<ol>${R.procedure.map(s => `<li>${s}</li>`).join('')}</ol>`,
        `<div class="gr-report-results">${cards}${notes1}${ladder}${notes2}</div><div class="gr-report-graphs">${graph(1)}${graph(2)}</div>`,
        interpretation,
        conclusion
      ],
      correction: `<p><strong>${R.score(CRITERIA.filter(k => ev[k]).length)}</strong></p><table class="gr-report-corr">${correction}</table>`
    };
  }

  const plainText = text => String(text).replace(/\[([^\]|]+)(?:\|[^\]]+)?\]/g, '$1');

  lab = LabEngine.create({
    id: 'grid',
    title: LABELS.title,
    glossary: GLOSSARY,
    reset,
    stepComplete,
    lockReason,
    isStarted: () => !!(state.hyp.h1 || state.hyp.h2.length || state.hyp.coo.a || state.hyp.coo.b || cardsFilled()),
    render: { 1: renderPredict, 2: renderExperiment, 3: renderConclude, 4: renderCheck },
    report: buildReport,
    // 4 : question 2 tirée au sort (run.q2), hypothèse 1 sur la panne du test 1 (concl.when, hyp.coo).
    version: 4,
    save: () => ({ run, state }),
    // Ce qui ne vaut que pendant un geste ou une journée qui défile repart à zéro.
    load(data) {
      const r = data.run, s = data.state;
      if (!r || !Array.isArray(r.need) || r.need.length !== HOURS || !Array.isArray(r.sun) || !Array.isArray(r.wind) ||
        !s || !s.hyp || !Array.isArray(s.hyp.h2) || !s.cards || !s.notes || !s.concl || !Array.isArray(s.concl.q2) || !Array.isArray(s.tries) || !Array.isArray(s.notes.hours) || !r.sky ||
        !Q2_KINDS.includes(r.q2) || !s.hyp.coo) throw new Error('labProgress');
      run = r;
      state = s;
      stepperDone = null;
      running = false;
      liveRun = null;
      hour = null;
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
          day: `${run.season}-${run.sky}-${run.windType}`, tries: state.tries.length,
          cardsRight: CARD_SLOTS - ev.cardMiss.length - ev.chainMiss.length, cards: CARD_SLOTS,
          notesRight: ev.notesGood, notes: notesTotal(),
          question2: run.q2, hypothesis1: state.hyp.h1,
          hypothesis2: usesPlants() ? state.hyp.h2.join('-') : `${state.hyp.coo.a}-${state.hyp.coo.b}`
        }
      };
    }
  });
})();
