/* ===== Labo virtuel « The vanishing leaves » (bio1) : la décomposition =====

   Contenu et simulation propres à ce labo. Le cadre commun (modale, barre
   d'étapes, verrous, traduction, glisser-déposer, rapport imprimé) est dans
   lab-engine.js, à la racine du site, chargé avant ce fichier. Textes en
   anglais seulement pour l'instant.

   Une question tirée parmi quatre à chaque nouveau labo, chacune sur un
   facteur : les décomposeurs (sol vivant ou stérilisé), les vers de terre,
   l'humidité, la température. Sont aussi tirés l'espèce de feuille (vitesse
   de décomposition) et l'ordre de la phrase d'hypothèse (« plus vite » n'est
   pas toujours la bonne réponse), plus de petites variations de pesée.

   Déroulé :
     1. Predict    — compléter une phrase d'hypothèse (+ « because » libre)
     2. Experiment — préparer ses bocaux (paillasse vide au départ, jusqu'à 4,
                     sans indice sur le nombre attendu) en réglant 4 facteurs,
                     puis faire passer le temps par 2 semaines : sortir le
                     sachet de feuilles de chaque bocal, le peser (sachet taré),
                     noter la masse dans le tableau ; le graphique se trace
                     à partir du tableau
     3. Conclude   — quels bocaux comparer, ce qui les distingue, la réponse,
                     hypothèse confirmée ou infirmée
     4. Check      — 4 vérifications : expérience juste, masses notées,
                     conclusion, jugement de l'hypothèse ; rapport (FO3)

   Rien n'est enregistré : recharger la page repart de zéro, avec un nouveau
   tirage. */

(function () {
  'use strict';

  const { escapeHtml, mulberry32, seedFrom, pick, lerp, ease, reduceMotion } = LabEngine.util;

  // Cadre commun, créé en fin de fichier (LabEngine.create).
  let lab;
  const $ = sel => lab.$(sel);
  const $$ = sel => lab.$$(sel);
  const gloss = text => lab.gloss(text);

  /* ===== Libellés =====
     [mot] ou [mot|clé] : mot du lexique, souligné, traduction française au
     survol ou au toucher (voir GLOSSARY). */
  const LABELS = {
    title: 'The vanishing leaves',

    questions: {
      decomposers: 'Do [decomposers] make dead leaves disappear?',
      worms: 'Do [earthworms] speed up the [decomposition] of dead leaves?',
      water: 'Does [humidity] change the speed of [decomposition]?',
      temperature: 'Does temperature change the speed of [decomposition]?'
    },
    // Formes sans lexique, pour le rapport imprimé.
    questionsPlain: {
      decomposers: 'Do decomposers make dead leaves disappear?',
      worms: 'Do earthworms speed up the decomposition of dead leaves?',
      water: 'Does humidity change the speed of decomposition?',
      temperature: 'Does temperature change the speed of decomposition?'
    },
    conditions: {
      soil: { living: 'in living soil', sterile: 'in [sterilized] soil' },
      worms: { yes: 'with [earthworms]', no: 'without [earthworms]' },
      water: { moist: 'in [moist] soil', dry: 'in [dry] soil' },
      place: { room: 'at 20 °C', fridge: 'in the [fridge] (4 °C)' }
    },
    compare: { faster: 'faster than', slower: 'more slowly than', same: 'at the same speed as' },
    leaves: { hazel: 'hazel', oak: 'oak', beech: 'beech' },

    yourQuestion: 'Your question',
    leavesLine: leaf => `In this lab, you work with dead [${leaf}] leaves.`,
    hypothesisTitle: 'Your hypothesis',
    iThink: 'I think that dead leaves will disappear',
    because: 'Why do you think so? (optional)',
    becausePlaceholder: 'Because…',
    hypothesisReady: 'Your hypothesis is ready.',
    hypothesisPending: 'Tap the words that complete your hypothesis.',
    toSetup: 'Next: plan your experiment',

    setupIntro: leaf => `Prepare your [jars|jar]. Each jar gets a [mesh bag] with <strong>10.0 g</strong> of dead ${leaf} leaves: you can take the bag out to [weigh] the leaves. Choose the conditions in each jar: only change what you want to test!`,
    jar: n => `Jar ${n}`,
    addJar: 'Add a jar',
    removeJar: n => `Remove jar ${n}`,
    factors: { soil: 'Soil', worms: 'Earthworms', water: 'Water', place: 'Temperature' },
    // Le facteur dans une phrase (« differ only by the … »).
    factorNouns: { soil: 'soil (living or sterilized)', worms: 'earthworms', water: 'water', place: 'temperature' },
    answerStart: 'Dead leaves disappear',
    options: { living: 'Living', sterile: 'Sterilized', yes: 'Yes', no: 'No', moist: 'Moist', dry: 'Dry', room: 'Room 20 °C', fridge: 'Fridge 4 °C' },
    setupInfo: n => n === 0 ? 'No jar yet' : n === 1 ? '1 jar prepared' : `${n} jars prepared`,
    setupNoJar: 'Add a jar first.',
    setupOneJar: 'With only one jar, what will you compare it to?',
    lockHypothesis: 'Complete your hypothesis first.',
    lockHypothesisFixed: 'Your hypothesis is fixed: the experiment has started. A scientist does not change the hypothesis after seeing the results!',
    lockNotStarted: 'Prepare your jars and carry out the experiment first.',
    lockExperiment: n => `Finish your experiment first: ${n} ${n === 1 ? 'mass' : 'masses'} still to write in the table.`,
    lockWait: left => `First weigh every bag and write its mass: ${left === 1 ? '1 jar' : left + ' jars'} left.`,
    lockCell: n => `First weigh the bag of jar ${n} on the balance.`,
    startExperiment: 'Start the experiment',

    placeLabel: { room: 'Room · 20 °C', fridge: 'Fridge · 4 °C' },
    condShort: {
      soil: { living: 'living soil', sterile: 'sterilized soil' },
      worms: { yes: 'earthworms', no: 'no earthworms' },
      water: { moist: 'moist', dry: 'dry' },
      place: { room: '20 °C', fridge: 'fridge 4 °C' }
    },
    waitTwoWeeks: 'Wait 2 weeks',
    waitReady: 'Ready: let time pass!',
    jarsLeft: n => n === 1 ? '1 jar left to weigh' : `${n} jars left to weigh`,
    lastWeighing: 'Last weighing',
    experimentOver: 'Experiment over',
    goConclude: 'Go on to conclude',
    timelineLabel: 'Weighing days',
    tlWeigh: 'weigh!',
    tableNow: 'now',
    changeSetup: 'Change the set-up',
    changeSetupConfirm: 'Change the set-up? Your measurements will be erased.',
    toConclude: 'Next: conclude',
    runInfo: (w, n, total) => `Week ${w} of 8 · ${n} / ${total} masses written`,
    missingPoints: 'Weigh each bag and write its mass in the table first.',
    balanceEmpty: 'Drag a [bag|mesh bag] here',
    balanceJar: n => `Leaves of jar ${n}<br>(bag [tared])`,
    weekBadge: w => `Week ${w}`,
    bagOf: n => `Bag of jar ${n}: drag it to the balance, or tap it`,
    captionStart: 'Every bag starts with 10.0 g of leaves: the first masses are already in the table. Press “Wait 2 weeks” to let time pass.',
    captionWeigh: 'Drag the [bag|mesh bag] of a [jar] onto the [balance], or tap it, to [weigh] the leaves.',
    captionRecord: n => `Leaves of jar ${n} [weighed]. Read the [balance] and write the mass in the table.`,
    captionRecorded: 'Mass written down. Weigh the next bag.',
    captionAllPlaced: 'All the bags are weighed. Press “Wait 2 weeks” at the top to let time pass!',
    captionDone: 'Week 8: the experiment is over. Look at your graph, then go on to conclude.',
    captionNeedWeigh: n => `First [weigh] the bag of jar ${n} on the [balance].`,
    captionBadValue: 'Write the mass shown on the balance, in grams (for example 7.4).',
    captionWaiting: 'Two weeks go by…',
    tableTitle: 'Your measurements',
    tableUnit: 'mass of leaves (g)',
    tableWeek: 'Week',
    cellLabel: (n, w) => `Mass of the leaves of jar ${n}, week ${w}, in grams`,
    graphTitle: 'Your graph',
    axisY: 'Mass of leaves (g)',
    axisX: 'Time (weeks)',

    concludeIntro: 'Use your graph to answer the question.',
    qPair: 'Which two jars do you compare?',
    qPairFixed: (a, b) => `You compare jar ${a} and jar ${b}.`,
    qDiffer: 'What is different between these two jars?',
    nothing: 'Nothing',
    qAnswer: 'My results show that dead leaves disappear',
    qVerdict: 'So my hypothesis is',
    confirmed: 'confirmed',
    rejected: 'rejected',
    checkConclusions: 'Check my conclusions',
    backToLab: 'Back to the lab',

    scoreLabel: 'checks passed',
    criteria: { fair: 'Fair test', points: 'Measurements', answer: 'Conclusion', verdict: 'Hypothesis' },
    criteriaSub: { fair: 'Your experiment', points: 'Your table', answer: 'Your answer', verdict: 'Your judgement' },
    legendReading: 'balance readings',

    report: {
      title: 'Laboratory report — The decomposition of dead leaves',
      because: 'Because',
      materials: (n, leaf, extras) => `${n} glass jars with a lid, soil, ${n} mesh bags, ${(n * 10).toFixed(0)} g of dead ${leaf} leaves (10.0 g per bag)${extras.length ? ', ' + extras.join(', ') : ''}, a balance.`,
      extras: { oven: 'an oven (to sterilize the soil)', worms: 'earthworms', spray: 'a water spray', fridge: 'a fridge (4 °C)' },
      procedureStart: 'Put soil in each jar, then a mesh bag with 10.0 g of dead leaves on top.',
      procedureJar: (n, desc) => `Jar ${n}: ${desc}.`,
      procedureWeigh: 'Every 2 weeks, take out each bag, weigh the leaves (bag tared) and put the bag back. Do this for 8 weeks.',
      procedureGraph: 'Draw a line graph of the mass of the leaves against time.',
      tableWeek: 'Week',
      tableUnit: 'Mass of the leaves (g)',
      interpretation: (a, b, diff, ma, mb) => `I compared jar ${a} and jar ${b}. ${diff} After 8 weeks, jar ${a} had ${ma} of leaves left and jar ${b} had ${mb}.`,
      differ: list => `They differ by: ${list}.`,
      differNothing: 'They are prepared in the same way.',
      noData: 'no measurement',
      conclusion: (sentence, verdict) => `${sentence} My hypothesis is ${verdict}.`,
      score: n => `Score: ${n} / 4 checks passed.`,
      correctAnswer: 'Correct answer:'
    }
  };

  const GLOSSARY = {
    decomposers: 'décomposeurs', decomposer: 'décomposeur', decomposition: 'décomposition',
    earthworms: 'vers de terre', earthworm: 'ver de terre', humidity: 'humidité',
    sterilized: 'stérilisé', moist: 'humide', dry: 'sec', fridge: 'frigo',
    jar: 'bocal', jars: 'bocaux', balance: 'balance', weigh: 'peser', weighed: 'pesé',
    'mesh bag': 'sachet en filet', tared: 'taré (la balance retire la masse du sachet)',
    hazel: 'noisetier', oak: 'chêne', beech: 'hêtre',
    'fair test': 'expérience équitable', control: 'témoin', fungi: 'champignons', bacteria: 'bactéries',
    'organic matter': 'matière organique', 'mineral matter': 'matière minérale', 'cycle of matter': 'cycle de la matière'
  };

  /* ===== Modèle =====
     Masse restante = 10 g × e^(−k·t), t en semaines. k dépend de l'espèce de
     feuille et des conditions :
       vie du sol : bactéries et champignons (sol vivant) + vers de terre ;
       un sol stérilisé sans vers garde un reste minime (0,03) ;
       sol sec × 0,15 ; frigo × 0,3.
     Ordres de grandeur choisis pour que chaque facteur se lise sur le
     graphique en 8 semaines, quelle que soit l'espèce. */
  const WEEKS = [0, 2, 4, 6, 8];
  const START_MASS = 10;
  const TOLERANCE = 0.05;    // g : la masse notée doit être celle de la balance (au dixième)
  const MAX_JARS = 4;        // au-delà du nécessaire : le maximum ne souffle pas la réponse

  const FACTORS = ['soil', 'worms', 'water', 'place'];
  const OPTIONS = { soil: ['living', 'sterile'], worms: ['yes', 'no'], water: ['moist', 'dry'], place: ['room', 'fridge'] };
  const DEFAULT_JAR = { soil: 'living', worms: 'no', water: 'moist', place: 'room' };

  // a : la condition où les feuilles disparaissent le plus vite.
  const QUESTIONS = {
    decomposers: { factor: 'soil', a: 'living', b: 'sterile' },
    worms: { factor: 'worms', a: 'yes', b: 'no' },
    water: { factor: 'water', a: 'moist', b: 'dry' },
    temperature: { factor: 'place', a: 'room', b: 'fridge' }
  };

  const LEAVES = {
    hazel: { k: 0.13, colour: '#c3913f' },
    oak: { k: 0.08, colour: '#9e6a34' },
    beech: { k: 0.05, colour: '#b5703a' }
  };

  // Catégoriel validé (palette de référence dataviz, 4 premières teintes) ;
  // la forme du point double la couleur (daltonisme, impression N&B), et le
  // tableau des masses donne les valeurs (aqua et jaune sous 3:1 sur blanc).
  const SERIES = [
    { colour: '#2a78d6', shape: 'circle' },
    { colour: '#eb6834', shape: 'square' },
    { colour: '#1baf7a', shape: 'triangle' },
    { colour: '#eda100', shape: 'diamond' }
  ];

  let run;      // tirage : question, ordre de la phrase, feuille, graine
  let state;    // travail de l'élève

  function reset() {
    run = {
      qid: pick(Object.keys(QUESTIONS)),
      orient: Math.random() < 0.5,
      leaf: pick(Object.keys(LEAVES)),
      seed: String(Math.random())
    };
    state = {
      hypothesis: null,
      because: '',
      jars: [],            // paillasse vide : l'élève choisit combien de bocaux
      started: false,
      wi: 0,               // indice dans WEEKS
      readings: [],        // pesées réelles [bocal][semaine]
      points: [],          // masses notées par l'élève [bocal][semaine]
      weighed: {},         // bocaux pesés pendant la semaine en cours
      active: null,        // bocal dont le sachet est sur la balance
      lastReading: null,   // { jar, value } affiché sur la balance
      conclusion: { pair: [], differ: [], answer: null, verdict: null },
      selected: 'fair'
    };
  }

  function question() { return QUESTIONS[run.qid]; }

  // Les deux conditions de la phrase, dans l'ordre tiré.
  function sides() {
    const q = question();
    return run.orient ? [q.a, q.b] : [q.b, q.a];
  }

  function truth() { return run.orient ? 'faster' : 'slower'; }

  function conditionText(value) {
    return gloss(LABELS.conditions[question().factor][value]);
  }

  function plain(text) { return String(text).replace(/\[([^\]|]+)(?:\|[^\]]+)?\]/g, '$1'); }

  function sentence(verbStart, cmp, glossed) {
    const [a, b] = sides();
    const f = question().factor;
    const t = x => glossed ? conditionText(x) : plain(LABELS.conditions[f][x]);
    return `${verbStart} ${t(a)} ${LABELS.compare[cmp]} ${t(b)}.`;
  }

  function rate(cfg) {
    const life = 0.03 + (cfg.soil === 'living' ? 1 : 0) + (cfg.worms === 'yes' ? 0.7 : 0);
    return LEAVES[run.leaf].k * life * (cfg.water === 'moist' ? 1 : 0.15) * (cfg.place === 'room' ? 1 : 0.3);
  }

  function trueMass(cfg, week) {
    return START_MASS * Math.exp(-rate(cfg) * week);
  }

  // Pesées : masse du modèle + petite variation, au dixième, jamais en hausse.
  function computeReadings(cfg, j) {
    const rnd = mulberry32(seedFrom(run.seed + j + FACTORS.map(f => cfg[f]).join('')));
    let prev = START_MASS;
    return WEEKS.map((w, i) => {
      if (i === 0) return START_MASS;
      const m = trueMass(cfg, w);
      const drop = trueMass(cfg, WEEKS[i - 1]) - m;
      const amp = Math.min(0.15, drop * 0.5);
      const v = Math.min(prev, Math.round((m + (rnd() * 2 - 1) * amp) * 10) / 10);
      prev = v;
      return v;
    });
  }

  function jarDescription(cfg) {
    return FACTORS.map(f => LABELS.condShort[f][cfg[f]]).join(', ');
  }

  function factorsBetween(i, j) {
    return FACTORS.filter(f => state.jars[i][f] !== state.jars[j][f]);
  }

  function formatMass(v) { return v == null ? '—' : `${v.toFixed(1)} g`; }

  /* ===== Dessins =====
     Bocal : viewBox 120 × 170, sol à partir de y = 112. Les feuilles
     rétrécissent, se trouent et foncent avec la décomposition ; filaments
     blancs de champignons dans un sol vivant et humide ; vers de terre roses
     visibles contre la vitre ; buée sur le verre d'un bocal humide, fentes
     dans un sol sec. */
  const LEAF_PATHS = {
    beech: 'M-18,0 C-11,-9 8,-10 18,0 C8,10 -11,9 -18,0 Z',
    oak: 'M-18,0 C-17,-4 -14,-6 -11,-4 C-10,-9 -5,-10 -3,-6 C-1,-10 4,-10 5,-6 C8,-9 12,-8 12,-4 C15,-5 18,-2 18,0 C18,2 15,5 12,4 C12,8 8,9 5,6 C4,10 -1,10 -3,6 C-5,10 -10,9 -11,4 C-14,6 -17,4 -18,0 Z',
    hazel: 'M-17,0 C-15,-11 7,-13 16,-2 L19,0 L16,2 C7,13 -15,11 -17,0 Z'
  };

  function mixColour(a, b, t) {
    const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16));
    const pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
    return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], t)).toString(16).padStart(2, '0')).join('');
  }

  function soilColour(cfg) {
    if (cfg.soil === 'living') return cfg.water === 'moist' ? '#4b3122' : '#8b6c4a';
    return cfg.water === 'moist' ? '#6e5a4b' : '#a59178';
  }

  function leafSVG(x, y, rot, scale, decay, seedKey, soil) {
    const rnd = mulberry32(seedFrom(seedKey));
    const base = LEAVES[run.leaf].colour;
    const fill = mixColour(base, '#3f2d22', Math.min(1, decay * 0.9));
    const s = scale * (1 - decay * 0.45);
    const fade = decay > 0.55 ? Math.max(0.15, 1 - (decay - 0.55) * 2) : 1;
    let holes = '';
    const nHoles = Math.round(decay * 8);
    for (let i = 0; i < nHoles; i++) {
      holes += `<circle cx="${(rnd() * 26 - 13).toFixed(1)}" cy="${(rnd() * 8 - 4).toFixed(1)}" r="${(1 + rnd() * 2.2).toFixed(1)}" fill="${soil}"/>`;
    }
    const veins = `<path d="M-18,0 L16,0 M-8,0 L-3,-5 M-8,0 L-3,5 M2,0 L7,-5 M2,0 L7,5" fill="none" stroke="#5a3d22" stroke-opacity="${0.55 * Math.max(fade, 0.6)}" stroke-width="0.8"/>`;
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)}) scale(${s.toFixed(2)})">` +
      `<path d="${LEAF_PATHS[run.leaf]}" fill="${fill}" fill-opacity="${fade.toFixed(2)}" stroke="#4a3220" stroke-opacity="0.35" stroke-width="0.8"/>` +
      `${holes}${veins}<path d="M-18,0 L-23,1" stroke="#5a3d22" stroke-width="1.2" stroke-linecap="round"/></g>`;
  }

  /* Les feuilles disparaissent une à une : la i-ème est entièrement
     décomposée quand la décomposition globale atteint LEAF_LIMITS[i] (les
     feuilles du dessus partent en premier) ; d'ici là, elle rétrécit, se
     troue et pâlit à son propre rythme. */
  const LEAF_LIMITS = [0.97, 0.83, 0.66, 0.49, 0.32];

  // sink : de combien les feuilles s'enfoncent dans le sol en se décomposant.
  function leavesSVG(spots, decay, j, soil, scale, sink) {
    return spots.map(([x, y, r], i) => {
      const limit = LEAF_LIMITS[i];
      if (decay >= limit) return '';
      return leafSVG(x, y + decay * sink, r, scale, decay / limit, run.seed + j + 'leaf' + i, soil);
    }).join('');
  }

  let svgUid = 0;

  // Filet du sachet : treillis clair en losanges.
  function meshPattern(id) {
    return `<pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">` +
      `<path d="M0,0 L0,6 M0,0 L6,0" stroke="#fffaf0" stroke-width="0.7" stroke-opacity="0.6"/></pattern>`;
  }

  // Étiquette du sachet, au bout de sa ficelle : numéro du bocal.
  function bagTag(x, y, j) {
    return `<rect x="${x - 8}" y="${y}" width="16" height="11" rx="2" fill="#ffffff" stroke="${SERIES[j].colour}" stroke-width="1.4"/>` +
      `<text x="${x}" y="${y + 8.3}" text-anchor="middle" class="dc-bag-num">${j + 1}</text>`;
  }

  /* Sachet sorti du bocal (balance, glisser) : feuilles dans le filet,
     ficelle et étiquette. viewBox 110 × 46. */
  function bagSVG(j, mass) {
    const uid = `dcb${++svgUid}`;
    const decay = Math.max(0, Math.min(1, 1 - mass / START_MASS));
    return `<svg class="dc-bag-svg" viewBox="0 0 110 46" aria-hidden="true" focusable="false">` +
      `<defs>${meshPattern(uid)}</defs>` +
      `<path d="M55,22 C52,16 58,13 55,11" fill="none" stroke="#b9ab8c" stroke-width="1.2"/>${bagTag(55, 1, j)}` +
      leavesSVG([[30, 36, -14], [55, 33, 10], [78, 36, -4], [44, 29, 24], [66, 29, -26]], decay, j, '#ffffff', 0.9, 0) +
      `<path d="M8,44 Q5,26 20,22 L90,22 Q105,26 102,44 Z" fill="url(#${uid})" fill-opacity="0.9" stroke="#d9cfb6" stroke-width="1.4"/>` +
      `</svg>`;
  }

  /* opts.bag : 'in' (sachet dans le bocal, par défaut) ou 'out' (sur la
     balance : creux dans le sol) ; opts.hit : zone à saisir pour peser,
     posée par-dessus tout le haut du bocal (cible large au doigt). */
  function jarSVG(cfg, mass, j, opts) {
    const o = opts || {};
    const bagIn = o.bag !== 'out';
    const uid = `dcj${++svgUid}`;
    const decay = Math.max(0, Math.min(1, 1 - mass / START_MASS));
    const soil = soilColour(cfg);
    const rnd = mulberry32(seedFrom(run.seed + 'jar' + j));
    const top = 112;
    let out = `<svg class="dc-jar-svg" viewBox="0 0 120 170" aria-hidden="true" focusable="false">` +
      `<defs><clipPath id="${uid}"><path d="M14,30 Q14,24 20,24 L100,24 Q106,24 106,30 L106,152 Q106,164 94,164 L26,164 Q14,164 14,152 Z"/></clipPath>${meshPattern(uid + 'm')}</defs>` +
      `<path d="M14,30 Q14,24 20,24 L100,24 Q106,24 106,30 L106,152 Q106,164 94,164 L26,164 Q14,164 14,152 Z" fill="#f3f8fb"/>` +
      `<g clip-path="url(#${uid})">` +
      `<rect x="0" y="${top}" width="120" height="60" fill="${soil}"/>`;
    // Grain du sol
    for (let i = 0; i < 26; i++) {
      out += `<circle cx="${(16 + rnd() * 88).toFixed(1)}" cy="${(top + 4 + rnd() * 46).toFixed(1)}" r="${(0.6 + rnd() * 1.1).toFixed(1)}" fill="#000" opacity="${(0.08 + rnd() * 0.12).toFixed(2)}"/>`;
    }
    if (cfg.water === 'dry') {
      out += `<path d="M30,${top + 2} l4,7 l-3,6 M70,${top + 1} l-3,8 l4,7 M90,${top + 3} l3,6" fill="none" stroke="#5c4630" stroke-opacity="0.55" stroke-width="1.1"/>`;
    }
    if (cfg.worms === 'yes') {
      out += `<path d="M24,${top + 34} q6,-7 12,0 t12,0 t10,-2" fill="none" stroke="#d98b86" stroke-width="4" stroke-linecap="round"/>` +
        `<path d="M70,${top + 20} q5,6 10,0 t10,1" fill="none" stroke="#cf7f7a" stroke-width="3.6" stroke-linecap="round"/>`;
    }
    // Feuilles dans le sachet, ou creux laissé par le sachet sorti ; puis débris sombres
    if (bagIn) out += `<g class="dc-bag-vis">${leavesSVG([[34, top - 3, -18], [60, top - 5, 12], [84, top - 2, -6], [48, top - 9, 28], [74, top - 10, -30]], decay, j, soil, 1, 4)}</g>`;
    else out += `<ellipse cx="60" cy="${top + 1}" rx="40" ry="3.5" fill="#000" opacity="0.2"/>`;
    const debris = Math.round(decay * 16);
    for (let i = 0; i < debris; i++) {
      out += `<ellipse cx="${(20 + rnd() * 80).toFixed(1)}" cy="${(top - 1 + rnd() * 4).toFixed(1)}" rx="${(1.2 + rnd() * 2).toFixed(1)}" ry="${(0.8 + rnd() * 0.8).toFixed(1)}" fill="${mixColour(LEAVES[run.leaf].colour, '#2b1d14', 0.65)}" opacity="0.85"/>`;
    }
    // Champignons : filaments blancs
    if (cfg.soil === 'living' && cfg.water === 'moist' && decay > 0.04) {
      const n = Math.round(4 + decay * 14);
      for (let i = 0; i < n; i++) {
        const x = 22 + rnd() * 76, y = top - 12 + rnd() * 18;
        out += `<path d="M${x.toFixed(1)},${y.toFixed(1)} q${(rnd() * 8 - 4).toFixed(1)},${(-3 - rnd() * 4).toFixed(1)} ${(rnd() * 12 - 6).toFixed(1)},${(-rnd() * 3).toFixed(1)}" fill="none" stroke="#ffffff" stroke-opacity="${(0.55 + rnd() * 0.35).toFixed(2)}" stroke-width="0.8"/>`;
      }
    }
    // Filet du sachet par-dessus les feuilles, ficelle jusqu'à l'étiquette sous le couvercle
    if (bagIn) {
      out += `<g class="dc-bag-vis">` +
        `<path class="dc-bag-net" d="M17,${top + 2} Q15,${top - 16} 30,${top - 19} L90,${top - 19} Q105,${top - 16} 103,${top + 2} Z" fill="url(#${uid}m)" fill-opacity="0.9" stroke="#e3d9c0" stroke-width="1.4"/>` +
        `<path d="M60,${top - 19} C55,${top - 40} 65,${top - 55} 60,42" fill="none" stroke="#b9ab8c" stroke-width="1.2"/>` +
        bagTag(60, 31, j) + `</g>`;
    }
    out += `</g>`;
    // Buée
    if (cfg.water === 'moist') {
      for (let i = 0; i < 9; i++) {
        out += `<circle cx="${(20 + rnd() * 80).toFixed(1)}" cy="${(34 + rnd() * 60).toFixed(1)}" r="${(1 + rnd() * 1.6).toFixed(1)}" fill="#ffffff" fill-opacity="0.75" stroke="#9fb6c4" stroke-opacity="0.5" stroke-width="0.5"/>`;
      }
    }
    // Reflet, contour, couvercle percé
    out += `<path d="M24,36 L24,150" stroke="#ffffff" stroke-opacity="0.7" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M14,30 Q14,24 20,24 L100,24 Q106,24 106,30 L106,152 Q106,164 94,164 L26,164 Q14,164 14,152 Z" fill="none" stroke="#8ea6b6" stroke-width="2"/>` +
      `<rect x="10" y="10" width="100" height="16" rx="4" fill="#8a96a3"/>` +
      `<rect x="10" y="10" width="100" height="5" rx="2.5" fill="#ffffff" fill-opacity="0.25"/>` +
      [30, 45, 60, 75, 90].map(x => `<circle cx="${x}" cy="19" r="1.6" fill="#4d5761"/>`).join('');
    // Zone à saisir : tout l'intérieur du bocal au-dessus du sol.
    if (o.hit && bagIn) {
      out += `<rect class="dc-bag-hit" data-bag="${j}" x="16" y="27" width="88" height="${top - 21}" rx="6" fill="transparent" tabindex="0" role="button" aria-label="${LABELS.bagOf(j + 1)}"/>`;
    }
    return out + `</svg>`;
  }

  function markerSVG(shape, x, y, colour, opts) {
    const o = opts || {};
    const r = o.r || 5;
    const fill = o.hollow ? '#ffffff' : colour;
    const stroke = o.hollow ? colour : '#ffffff';
    const sw = o.hollow ? 1.6 : 2;
    const attrs = `fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${o.extra || ''}`;
    if (shape === 'square') return `<rect x="${(x - r).toFixed(1)}" y="${(y - r).toFixed(1)}" width="${2 * r}" height="${2 * r}" rx="1.5" ${attrs}/>`;
    if (shape === 'diamond') {
      const h = r * 1.3;
      return `<path d="M${x.toFixed(1)},${(y - h).toFixed(1)} L${(x + h).toFixed(1)},${y.toFixed(1)} L${x.toFixed(1)},${(y + h).toFixed(1)} L${(x - h).toFixed(1)},${y.toFixed(1)} Z" stroke-linejoin="round" ${attrs}/>`;
    }
    if (shape === 'triangle') {
      const h = r * 1.25;
      return `<path d="M${x.toFixed(1)},${(y - h).toFixed(1)} L${(x + h).toFixed(1)},${(y + h * 0.75).toFixed(1)} L${(x - h).toFixed(1)},${(y + h * 0.75).toFixed(1)} Z" stroke-linejoin="round" ${attrs}/>`;
    }
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" ${attrs}/>`;
  }

  function legendKey(j) {
    const s = SERIES[j];
    return `<svg class="dc-key" viewBox="0 0 16 16" aria-hidden="true" focusable="false">${markerSVG(s.shape, 8, 8, s.colour, { r: 5 })}</svg>`;
  }

  /* ===== Graphique évolutif =====
     Masse (0–10 g) en fonction du temps (0–8 semaines). Une seule échelle ;
     quadrillage fin tous les 0,5 g ; segments de 2 px, points de 10 px
     cerclés de blanc, une forme par bocal ; légende toujours présente,
     étiquettes en bout de courbe seulement si elles ne se chevauchent pas.
     Il se trace tout seul à partir des masses notées dans le tableau (même
     fausses : la correction les compare aux pesées). Toucher un point
     affiche sa valeur. */
  const G = { W: 470, H: 300, L: 54, R: 54, T: 14, B: 46 };
  const gx = w => G.L + (w / 8) * (G.W - G.L - G.R);
  const gy = m => G.T + (1 - Math.max(0, Math.min(10, m)) / 10) * (G.H - G.T - G.B);

  // opts.mode : 'run' (paillasse), 'read' (conclusion, correction), 'print' ;
  // opts.fresh : [bocal, semaine] du point qui vient d'apparaître.
  function graphSVG(opts) {
    const o = opts || {};
    const mode = o.mode || 'read';
    const jars = state.jars.map((cfg, j) => j);
    let out = `<svg class="dc-graph-svg" viewBox="0 0 ${G.W} ${G.H}"${o.size ? ` width="${o.size[0]}" height="${o.size[1]}"` : ''} role="img" aria-label="${LABELS.axisY} / ${LABELS.axisX}">`;
    // Quadrillage
    for (let m = 0; m <= 10; m += 0.5) {
      const major = Number.isInteger(m);
      out += `<line x1="${G.L}" x2="${G.W - G.R}" y1="${gy(m)}" y2="${gy(m)}" stroke="${major ? '#dcdfda' : '#eef0ec'}" stroke-width="1"/>`;
      if (major) out += `<text x="${G.L - 8}" y="${gy(m) + 4}" text-anchor="end" class="dc-tick">${m}</text>`;
    }
    for (let w = 0; w <= 8; w++) {
      out += `<line x1="${gx(w)}" x2="${gx(w)}" y1="${G.T}" y2="${G.H - G.B}" stroke="${w % 2 ? '#f3f4f1' : '#e6e8e3'}" stroke-width="1"/>`;
      if (w % 2 === 0) out += `<text x="${gx(w)}" y="${G.H - G.B + 17}" text-anchor="middle" class="dc-tick">${w}</text>`;
    }
    out += `<line x1="${G.L}" x2="${G.W - G.R}" y1="${gy(0)}" y2="${gy(0)}" stroke="#a9ada4" stroke-width="1.2"/>` +
      `<line x1="${G.L}" x2="${G.L}" y1="${G.T}" y2="${gy(0)}" stroke="#a9ada4" stroke-width="1.2"/>` +
      `<text class="dc-axis" x="${(G.L + G.W - G.R) / 2}" y="${G.H - 6}" text-anchor="middle">${LABELS.axisX}</text>` +
      `<text class="dc-axis" transform="translate(13 ${(G.T + G.H - G.B) / 2}) rotate(-90)" text-anchor="middle">${LABELS.axisY}</text>`;

    // Colonne de la semaine en cours
    if (mode === 'run' && state.started && state.wi > 0) {
      const x = gx(WEEKS[state.wi]);
      out += `<rect x="${x - 13}" y="${G.T}" width="26" height="${gy(0) - G.T}" rx="6" fill="#7d8a80" fill-opacity="0.07"/>`;
    }

    // Pesées réelles (correction) : points creux, sous ceux de l'élève.
    if (o.readings) {
      jars.forEach(j => {
        const s = SERIES[j];
        (state.readings[j] || []).forEach((v, i) => {
          if (i === 0 || v == null) return;
          out += markerSVG(s.shape, gx(WEEKS[i]), gy(v), s.colour, { r: 4.5, hollow: true });
        });
      });
    }

    // Courbes de l'élève
    const ends = [];
    jars.forEach(j => {
      const s = SERIES[j];
      const pts = (state.points[j] || []).map((v, i) => v == null ? null : [gx(WEEKS[i]), gy(v), v, i]);
      let d = '';
      let pen = false;
      pts.forEach(p => {
        if (!p) { pen = false; return; }
        d += `${pen ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)} `;
        pen = true;
      });
      if (d) out += `<path d="${d}" fill="none" stroke="${s.colour}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
      pts.forEach(p => {
        if (!p) return;
        const fresh = o.fresh && o.fresh[0] === j && o.fresh[1] === p[3];
        const tip = mode === 'print' ? '' : ` data-tip="${LABELS.jar(j + 1)} · ${LABELS.weekBadge(WEEKS[p[3]])} · ${formatMass(p[2])}"`;
        const cls = [tip && 'dc-pt', fresh && 'is-fresh'].filter(Boolean).join(' ');
        out += markerSVG(s.shape, p[0], p[1], s.colour, { extra: tip + (cls ? ` class="${cls}"` : '') });
      });
      const last = pts.filter(Boolean).pop();
      if (last) ends.push({ j, x: last[0], y: last[1] });
    });

    // Étiquettes en bout de courbe, seulement sans chevauchement.
    const ys = ends.map(e => e.y).sort((a, b) => a - b);
    const clash = ys.some((y, i) => i > 0 && y - ys[i - 1] < 14);
    if (!clash) {
      ends.forEach(e => { out += `<text class="dc-endlabel" x="${e.x + 9}" y="${e.y + 4}">${LABELS.jar(e.j + 1)}</text>`; });
    }

    return out + `</svg>`;
  }

  function graphLegend(opts) {
    const o = opts || {};
    const items = state.jars.map((cfg, j) => `<span class="dc-legend-item">${legendKey(j)}${LABELS.jar(j + 1)}</span>`).join('');
    const extra = o.readings ? `<span class="dc-legend-item dc-legend-note"><svg class="dc-key" viewBox="0 0 16 16" aria-hidden="true">${markerSVG('circle', 8, 8, '#7d8a80', { r: 4.5, hollow: true })}</svg>${LABELS.legendReading}</span>` : '';
    return `<div class="dc-legend">${items}${extra}</div>`;
  }

  // Valeur au toucher (conclusion, correction).
  function bindTips(panel) {
    const tip = panel.querySelector('.dc-tip');
    if (!tip) return;
    const show = el => {
      tip.textContent = el.dataset.tip;
      tip.hidden = false;
      const p = panel.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      tip.style.left = `${Math.min(p.width - tip.offsetWidth - 4, Math.max(4, r.left - p.left + r.width / 2 - tip.offsetWidth / 2))}px`;
      tip.style.top = `${r.top - p.top - tip.offsetHeight - 8}px`;
    };
    panel.addEventListener('pointerover', e => { const el = e.target.closest('.dc-pt'); if (el) show(el); });
    panel.addEventListener('pointerdown', e => { const el = e.target.closest('.dc-pt'); if (el) show(el); });
    panel.addEventListener('pointerleave', () => { tip.hidden = true; });
  }

  /* ===== Étapes complètes (progression stricte, voir lab-engine.js) =====
     1 : l'hypothèse ; 2 : l'expérience jusqu'à la semaine 8, toutes les
     masses notées ; 3 : toutes les questions de la conclusion. */
  function experimentDone() {
    return state.started && state.wi === WEEKS.length - 1 && weekComplete();
  }

  function stepComplete(n) {
    if (n === 1) return !!state.hypothesis;
    if (n === 2) return experimentDone();
    return conclusionsComplete();
  }

  function lockReason(n) {
    if (n === 1) return LABELS.lockHypothesis;
    if (n === 2) {
      if (!state.started) return LABELS.lockNotStarted;
      return LABELS.lockExperiment(state.jars.length * (WEEKS.length - 1) - pointsPlaced());
    }
    return lab.L.missingConclusions;
  }

  /* ===== Étape 1 : hypothèse ===== */
  function renderPredict() {
    const [a, b] = sides();
    const missing = lab.state.showMissing && !state.hypothesis;
    const blank = state.hypothesis
      ? `<span class="dc-blank is-filled">${LABELS.compare[state.hypothesis]}</span>`
      : `<span class="dc-blank">……………</span>`;
    const choices = ['faster', 'slower', 'same'].map(c =>
      `<button type="button" class="lab-choice dc-choice ${state.hypothesis === c ? 'is-selected' : ''}" data-hyp="${c}" aria-pressed="${state.hypothesis === c}">${LABELS.compare[c]}</button>`).join('');

    lab.body.innerHTML = `<div class="dc-predict">` +
      `<div class="dc-question-card">` +
        `<p class="dc-kicker">${LABELS.yourQuestion}</p>` +
        `<p class="dc-question">${gloss(LABELS.questions[run.qid])}</p>` +
        `<p class="dc-leafline">${leafIcon()}<span>${gloss(LABELS.leavesLine(LABELS.leaves[run.leaf]))}</span></p>` +
      `</div>` +
      `<div class="dc-hyp-card ${missing ? 'lab-is-missing' : ''}">` +
        `<p class="dc-kicker">${LABELS.hypothesisTitle}</p>` +
        `<p class="dc-sentence">${LABELS.iThink} ${conditionText(a)} ${blank} ${conditionText(b)}.</p>` +
        `<div class="dc-choices">${choices}</div>` +
        `<label class="dc-because"><span>${LABELS.because}</span>` +
        `<input type="text" class="lab-input dc-because-input" maxlength="160" placeholder="${LABELS.becausePlaceholder}" value="${escapeHtml(state.because)}" autocomplete="off"></label>` +
      `</div></div>`;

    $$('[data-hyp]').forEach(btn => btn.addEventListener('click', () => {
      state.hypothesis = btn.dataset.hyp;
      renderPredict();
      lab.renderStepper();
    }));
    const because = $('.dc-because-input');
    because.addEventListener('input', e => { state.because = e.target.value; });
    // Hypothèse figée dès que l'expérience a commencé : on la relit, on ne la change plus.
    if (state.started) {
      $$('[data-hyp]').forEach(btn => lab.setLock(btn, LABELS.lockHypothesisFixed, { icon: false }));
      because.readOnly = true;
      lab.setLock(because, LABELS.lockHypothesisFixed);
    }

    const info = missing ? lab.footerInfo(lab.L.missingHypothesis, true)
      : lab.footerInfo(state.hypothesis ? LABELS.hypothesisReady : LABELS.hypothesisPending);
    lab.setFooter(info + `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-next>${LABELS.toSetup} →</button></div>`);
    const next = $('[data-next]');
    next.addEventListener('click', () => lab.goToStep(2));
    lab.setLock(next, state.hypothesis ? null : LABELS.lockHypothesis, { missing: true, key: 'next' });
  }

  function leafIcon() {
    return `<svg class="dc-leaf-icon" viewBox="-24 -14 46 28" aria-hidden="true" focusable="false">` +
      `<path d="${LEAF_PATHS[run.leaf]}" fill="${LEAVES[run.leaf].colour}" stroke="#4a3220" stroke-opacity="0.4"/>` +
      `<path d="M-18,0 L16,0 M-8,0 L-3,-5 M-8,0 L-3,5 M2,0 L7,-5 M2,0 L7,5 M-18,0 L-23,1" fill="none" stroke="#5a3d22" stroke-opacity="0.6" stroke-width="0.9"/></svg>`;
  }

  /* ===== Étape 2 : l'expérience ===== */
  function renderExperiment() {
    if (!state.started) renderSetup();
    else renderRun();
  }

  /* --- Préparation des bocaux ---
     Paillasse vide au départ, jusqu'à MAX_JARS bocaux : ni le nombre affiché
     ni la limite ne soufflent combien il en faut. Un nouveau bocal copie le
     précédent. Le départ est refusé sans bocal, et avec un seul bocal par une
     question qui fait chercher pourquoi il en faut au moins deux. */
  function renderSetup() {
    const cards = state.jars.map((cfg, j) => {
      const rows = FACTORS.map(f => `<div class="dc-set-row"><span class="dc-set-label">${LABELS.factors[f]}</span>` +
        `<div class="dc-seg">${OPTIONS[f].map(v => `<button type="button" class="dc-seg-btn ${cfg[f] === v ? 'is-selected' : ''}" data-jar="${j}" data-f="${f}" data-v="${v}" aria-pressed="${cfg[f] === v}">${LABELS.options[v]}</button>`).join('')}</div></div>`).join('');
      return `<div class="dc-set-card">` +
        `<div class="dc-set-head">${legendKey(j)}<span>${LABELS.jar(j + 1)}</span>` +
        `<button type="button" class="dc-remove" data-remove="${j}" aria-label="${LABELS.removeJar(j + 1)}">×</button></div>` +
        `<div class="dc-set-visual ${cfg.place === 'fridge' ? 'is-fridge' : ''}"><span class="dc-place-tag">${LABELS.placeLabel[cfg.place]}</span>${jarSVG(cfg, START_MASS, j)}</div>` +
        `<div class="dc-set-rows">${rows}</div></div>`;
    }).join('');
    const add = state.jars.length < MAX_JARS
      ? `<button type="button" class="dc-add-card ${state.jars.length ? '' : 'is-alone'} ${lab.state.showMissing && state.jars.length < 2 ? 'lab-is-missing' : ''}" data-add><span class="dc-add-plus" aria-hidden="true">+</span>${LABELS.addJar}</button>` : '';

    lab.body.innerHTML = `<div class="dc-setup">` +
      `<p class="lab-instructions dc-setup-intro">${gloss(LABELS.setupIntro(LABELS.leaves[run.leaf]))}</p>` +
      `<p class="dc-reminder">${gloss(LABELS.questions[run.qid])}</p>` +
      `<div class="dc-set-grid dc-set-grid-${state.jars.length}">${cards}${add}</div></div>`;

    $$('.dc-seg-btn').forEach(btn => btn.addEventListener('click', () => {
      state.jars[Number(btn.dataset.jar)][btn.dataset.f] = btn.dataset.v;
      renderSetup();
    }));
    $$('[data-remove]').forEach(btn => btn.addEventListener('click', () => {
      state.jars.splice(Number(btn.dataset.remove), 1);
      lab.state.showMissing = false;
      renderSetup();
    }));
    const addBtn = $('[data-add]');
    if (addBtn) addBtn.addEventListener('click', () => {
      const last = state.jars[state.jars.length - 1];
      state.jars.push(Object.assign({}, last || DEFAULT_JAR));
      lab.state.showMissing = false;
      renderSetup();
    });

    lab.setFooter(lab.footerInfo(LABELS.setupInfo(state.jars.length)) +
      `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-start>${LABELS.startExperiment} →</button></div>`);
    const start = $('[data-start]');
    start.addEventListener('click', startExperiment);
    const n = state.jars.length;
    lab.setLock(start, n === 0 ? LABELS.setupNoJar : n === 1 ? LABELS.setupOneJar : null, { missing: true, key: 'start' });
  }

  function startExperiment() {
    state.started = true;
    state.wi = 0;
    state.readings = state.jars.map((cfg, j) => computeReadings(cfg, j));
    state.points = state.jars.map(() => WEEKS.map((w, i) => i === 0 ? START_MASS : null));
    state.weighed = {};
    state.active = null;
    state.lastReading = null;
    state.conclusion = { pair: [], differ: [], answer: null, verdict: null };
    renderRun();
  }

  /* --- Paillasse : bocaux, balance, graphique --- */
  function pointsPlaced() {
    return state.points.reduce((n, row) => n + row.filter((v, i) => i > 0 && v != null).length, 0);
  }

  function weekComplete() {
    return state.wi === 0 || state.jars.every((cfg, j) => state.points[j][state.wi] != null);
  }

  function visualMass(j) {
    return state.readings[j][state.wi];
  }

  function renderRun(caption) {
    const jars = state.jars.map((cfg, j) => {
      const out = state.active === j;
      return `<div class="dc-jar ${cfg.place === 'fridge' ? 'is-fridge' : ''} ${out ? 'is-active' : ''}" data-jar="${j}">` +
        `<span class="dc-place-tag">${LABELS.placeLabel[cfg.place]}</span>` +
        `<span class="dc-jar-visual">${jarSVG(cfg, visualMass(j), j, { bag: out ? 'out' : 'in', hit: true })}</span>` +
        `<span class="dc-jar-name">${legendKey(j)}${LABELS.jar(j + 1)}<span class="dc-jar-badge" data-badge="${j}" aria-hidden="true"></span></span>` +
        `<span class="dc-jar-cond">${LABELS.condShort.soil[cfg.soil]} · ${LABELS.condShort.worms[cfg.worms]} · ${LABELS.condShort.water[cfg.water]}</span>` +
        `</div>`;
    }).join('');
    const reading = state.lastReading;

    lab.body.innerHTML = `<div class="dc-run">` +
      `<section class="dc-bench">` +
        `<div class="dc-bench-head"><span class="dc-reminder dc-reminder-inline">${gloss(LABELS.questions[run.qid])}</span></div>` +
        timelineHTML() +
        `<div class="dc-stage">` +
          `<div class="dc-jars dc-jars-${state.jars.length}">${jars}</div>` +
          `<div class="dc-balance" data-balance>` +
            `<div class="dc-balance-load">${reading ? bagSVG(reading.jar, reading.value) : ''}</div>` +
            `<div class="dc-balance-pan"></div><div class="dc-balance-stem"></div>` +
            `<div class="dc-balance-body"><span class="dc-balance-display" data-display>${reading ? reading.value.toFixed(1) : '0.0'}<small> g</small></span></div>` +
            `<span class="dc-balance-label">${gloss(reading ? LABELS.balanceJar(reading.jar + 1) : LABELS.balanceEmpty)}</span>` +
          `</div>` +
        `</div>` +
        `<p class="lab-caption" data-caption aria-live="polite"></p>` +
      `</section>` +
      `<section class="dc-graph-panel dc-results">` +
        `<div class="dc-graph-head"><h3 class="lab-panel-title">${LABELS.tableTitle}</h3><span class="dc-table-unit">${LABELS.tableUnit}</span></div>` +
        `<div class="dc-table-wrap">${tableHTML()}</div>` +
        `<div class="dc-graph-head"><h3 class="lab-panel-title">${LABELS.graphTitle}</h3>${graphLegend()}</div>` +
        `<div class="dc-graph-wrap">${graphSVG({ mode: 'run' })}</div><div class="dc-tip" hidden></div>` +
      `</section></div>`;

    $$('.dc-bag-hit').forEach(el => {
      const j = Number(el.dataset.bag);
      const netRect = () => {
        const net = el.closest('svg').querySelector('.dc-bag-net');
        return net ? net.getBoundingClientRect() : null;
      };
      lab.makeDraggable(el, {
        ghost: () => `<div class="dc-ghost-bag">${bagSVG(j, visualMass(j))}</div>`,
        targets: () => [$('[data-balance]')],
        onDrop: () => {
          const ghost = document.querySelector('#lab-drag-ghost .dc-bag-svg');
          weigh(j, ghost ? ghost.getBoundingClientRect() : null);
        },
        onTap: () => weigh(j, netRect())
      });
      // Clavier : la zone est un rect SVG, sans clic natif à Entrée.
      el.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        weigh(j, netRect());
      });
    });
    $$('[data-wait-cell]').forEach(btn => lab.setLock(btn, LABELS.lockCell(Number(btn.dataset.waitCell) + 1)));
    $$('[data-cell]').forEach(input => {
      input.addEventListener('input', () => input.classList.remove('is-invalid'));
      input.addEventListener('change', () => recordMass(Number(input.dataset.cell), input));
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
    });
    $('[data-wait]')?.addEventListener('click', waitTwoWeeks);
    bindTips($('.dc-results'));
    updateMarks();
    updateTimeline();

    setCaption(caption || defaultCaption());
    renderRunFooter();
  }

  /* Frise des jours de pesée, et au bout le bouton qui fait passer le temps.
     Le rythme (une pesée toutes les 2 semaines, 5 en tout) se voit sans lire
     la consigne. La barre --p (0 à 4) avance pendant l'attente. Le bouton
     reste actif : appuyé trop tôt, il signale ce qui manque. */
  const CALENDAR_ICON = `<svg class="dc-wait-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">` +
    `<rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>` +
    `<path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>` +
    `<path d="M10 13.5l3 2.5-3 2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function timelineHTML() {
    const last = state.wi === WEEKS.length - 1;
    const nodes = WEEKS.map((w, i) => {
      const cls = i < state.wi ? 'is-done' : i === state.wi ? 'is-now' : '';
      const sub = i < state.wi ? '✓' : '';
      return `<li class="dc-tl-node ${cls}"><span class="dc-tl-dot" aria-hidden="true"></span>` +
        `<span class="dc-tl-week">${LABELS.weekBadge(w)}</span>` +
        `<span class="dc-tl-sub" ${i === state.wi ? 'data-tl-now' : ''}>${sub}</span></li>`;
    }).join('');
    const action = last
      ? `<div class="dc-wait-btn is-final"><span class="dc-wait-text"><strong data-wait-title></strong><small data-wait-sub></small></span></div>`
      : `<button type="button" class="dc-wait-btn" data-wait>${CALENDAR_ICON}<span class="dc-wait-text"><strong>${LABELS.waitTwoWeeks}</strong><small data-wait-sub></small></span></button>`;
    return `<div class="dc-timeline" data-timeline style="--p: ${state.wi}">` +
      `<div class="dc-tl-wrap"><div class="dc-tl-track"><div class="dc-tl-fill"></div></div>` +
      `<ol class="dc-tl" aria-label="${LABELS.timelineLabel}">${nodes}</ol></div>${action}</div>`;
  }

  // Mise à jour sur place (comme refreshRecords) : bouton et frise restent
  // les mêmes éléments, un appui en cours n'est pas perdu.
  function updateTimeline() {
    const left = state.jars.filter((cfg, j) => state.points[j][state.wi] == null).length;
    const complete = left === 0;
    const last = state.wi === WEEKS.length - 1;
    const sub = $('[data-wait-sub]');
    if (sub) sub.textContent = complete ? (last ? LABELS.goConclude : LABELS.waitReady) : LABELS.jarsLeft(left);
    const title = $('[data-wait-title]');
    if (title) title.textContent = complete ? LABELS.experimentOver : LABELS.lastWeighing;
    const btn = $('.dc-wait-btn');
    if (btn) btn.classList.toggle('is-ready', complete);
    if (btn && !last) lab.setLock(btn, complete ? null : LABELS.lockWait(left), { missing: true, key: 'wait' });
    const now = $('[data-tl-now]');
    if (now) now.textContent = complete ? '✓' : LABELS.tlWeigh;
    const node = $('.dc-tl-node.is-now');
    if (node) node.classList.toggle('is-complete', complete);
  }

  /* Tableau des masses : une ligne par bocal, une colonne par semaine (comme
     l'axe du temps du graphique, juste en dessous). Les semaines passées se
     lisent ; dans la colonne de la semaine en cours, la case d'un bocal ne
     devient un champ qu'une fois son sachet pesé : impossible de deviner. */
  function tableHTML() {
    const head = `<tr><th scope="col">${LABELS.tableWeek}</th>` +
      WEEKS.map((w, i) => {
        const now = i === state.wi && i > 0;
        const tag = now ? ` <span class="dc-th-now">${LABELS.tableNow}</span>` : i > state.wi ? ` <span class="dc-th-wait" aria-hidden="true">⏳</span>` : '';
        return `<th scope="col" class="${now ? 'is-now' : ''}">${w}${tag}</th>`;
      }).join('') + `</tr>`;
    const rows = state.jars.map((cfg, j) => `<tr><th scope="row"><span class="dc-row-head">${legendKey(j)}${LABELS.jar(j + 1)}</span></th>` +
      WEEKS.map((w, i) => `<td class="${i === state.wi && i > 0 ? 'is-now' : ''}">${cellHTML(j, i)}</td>`).join('') + `</tr>`).join('');
    return `<table class="dc-table">${head}${rows}</table>`;
  }

  function cellHTML(j, i) {
    const v = state.points[j][i];
    if (i === 0 || i < state.wi) return v == null ? `<span class="dc-cell-empty">—</span>` : v.toFixed(1);
    if (i > state.wi) return '';
    const label = LABELS.cellLabel(j + 1, WEEKS[i]);
    if (!state.weighed[j] && v == null) {
      return `<button type="button" class="dc-cell-wait" data-wait-cell="${j}" aria-label="${label}"></button>`;
    }
    return `<input type="text" inputmode="decimal" class="dc-cell-input" data-cell="${j}" value="${v == null ? '' : v.toFixed(1)}" maxlength="5" autocomplete="off" spellcheck="false" aria-label="${label}">`;
  }

  /* Masse notée : virgule ou point, entre 0 et 10 g, arrondie au dixième.
     Une masse fausse mais plausible est acceptée et tracée : c'est la
     correction qui la compare à la pesée. */
  function recordMass(j, input) {
    const raw = input.value.trim().replace(',', '.');
    let fresh = null;
    if (raw === '') state.points[j][state.wi] = null;
    else {
      const v = /^(\d{1,2}(\.\d*)?|\.\d+)$/.test(raw) ? Number(raw) : NaN;
      if (!(v >= 0 && v <= START_MASS)) {
        input.classList.add('is-invalid');
        state.points[j][state.wi] = null;
        refreshRecords(null);
        setCaption(LABELS.captionBadValue, true);
        return;
      }
      state.points[j][state.wi] = Math.round(v * 10) / 10;
      input.value = state.points[j][state.wi].toFixed(1);
      fresh = [j, state.wi];
    }
    refreshRecords(fresh);
  }

  /* Après une saisie, mise à jour sur place (graphique, repères, pied) sans
     reconstruire la paillasse : la saisie se valide souvent quand l'élève
     saisit déjà le sachet suivant, et ce geste ne doit pas être coupé. */
  function refreshRecords(fresh) {
    if (lab.state.showMissing && weekComplete()) lab.state.showMissing = false;
    const wrap = $('.dc-results .dc-graph-wrap');
    if (wrap) wrap.innerHTML = graphSVG({ mode: 'run', fresh });
    updateMarks();
    updateTimeline();
    setCaption(fresh && !weekComplete() ? LABELS.captionRecorded : defaultCaption());
    updateRunFooter();
  }

  // Pastilles des bocaux (pesé, noté) et cases encore vides à signaler.
  function updateMarks() {
    const now = state.wi;
    $$('[data-badge]').forEach(el => {
      const j = Number(el.dataset.badge);
      const noted = now > 0 && state.points[j][now] != null;
      const weighed = now > 0 && state.weighed[j];
      el.textContent = noted ? '✓' : weighed ? 'g' : '';
      el.hidden = !noted && !weighed;
      el.classList.toggle('is-weighed', !noted && weighed);
    });
    const missing = j => lab.state.showMissing && now > 0 && state.points[j][now] == null;
    $$('[data-cell], [data-wait-cell]').forEach(el => {
      el.classList.toggle('lab-is-missing', missing(Number(el.dataset.cell != null ? el.dataset.cell : el.dataset.waitCell)));
    });
    $$('.dc-jar').forEach(el => el.classList.toggle('lab-is-missing', missing(Number(el.dataset.jar))));
  }

  function defaultCaption() {
    if (state.wi === 0) return LABELS.captionStart;
    if (state.active != null && state.points[state.active][state.wi] == null) return LABELS.captionRecord(state.active + 1);
    if (weekComplete()) return state.wi === WEEKS.length - 1 ? LABELS.captionDone : LABELS.captionAllPlaced;
    return LABELS.captionWeigh;
  }

  function setCaption(text, warn) {
    const c = $('[data-caption]');
    if (c) {
      c.innerHTML = `<span>${gloss(text)}</span>`;
      c.classList.toggle('is-warning', !!warn);
    }
  }

  /* Pied de page : le temps passe depuis la frise, plus d'ici. « Conclude »
     reste secondaire (contour) tant que l'expérience n'est pas finie, puis
     devient le bouton principal ; il reste cliquable, comme l'étape 3 dans
     la barre d'étapes. */
  function renderRunFooter() {
    lab.setFooter(lab.footerInfo('') + `<div class="lab-footer-actions">` +
      `<button type="button" class="lab-btn lab-btn-ghost" data-setup>${LABELS.changeSetup}</button>` +
      `<button type="button" class="lab-btn lab-btn-ghost" data-conclude>${LABELS.toConclude} →</button></div>`);
    $('[data-setup]').addEventListener('click', () => {
      if (pointsPlaced() > 0 && !window.confirm(LABELS.changeSetupConfirm)) return;
      state.started = false;
      lab.state.showMissing = false;
      renderSetup();
    });
    $('[data-conclude]').addEventListener('click', () => lab.goToStep(3));
    updateRunFooter();
  }

  let stepperDone = null;

  function updateRunFooter() {
    const total = state.jars.length * (WEEKS.length - 1);
    const missing = lab.state.showMissing && !weekComplete();
    const info = $('.lab-footer .lab-footer-info');
    if (info) {
      info.textContent = missing ? LABELS.missingPoints : LABELS.runInfo(WEEKS[state.wi], pointsPlaced(), total);
      info.classList.toggle('is-warning', missing);
    }
    const done = experimentDone();
    const concl = $('[data-conclude]');
    if (concl) {
      concl.classList.toggle('lab-btn-primary', done);
      concl.classList.toggle('lab-btn-ghost', !done);
      lab.setLock(concl, done ? null : lockReason(2), { missing: true, key: 'conclude' });
    }
    // La barre d'étapes ne change qu'à la fin de l'expérience (Conclude s'ouvre).
    if (done !== stepperDone) { stepperDone = done; lab.renderStepper(); }
  }

  /* Pesée : le sachet quitte son bocal (creux dans le sol) et se pose sur la
     balance, depuis l'endroit où il était (from : rectangle à l'écran du
     sachet dans le bocal, ou du fantôme lâché). Le sachet pesé avant
     retourne dans son bocal. Puis le curseur va dans la case à remplir. */
  function weigh(j, from) {
    if (state.wi === 0) {
      setCaption(LABELS.captionStart, true);
      return;
    }
    const value = state.readings[j][state.wi];
    state.weighed[j] = true;
    state.active = j;
    state.lastReading = { jar: j, value };
    renderRun(state.points[j][state.wi] == null ? LABELS.captionRecord(j + 1) : null);
    const display = $('[data-display]');
    const balance = $('[data-balance]');
    const bag = balance.querySelector('.dc-bag-svg');
    if (from && bag && bag.animate && !reduceMotion) {
      const to = bag.getBoundingClientRect();
      const dx = from.left + from.width / 2 - (to.left + to.width / 2);
      const dy = from.top + from.height / 2 - (to.top + to.height / 2);
      const s = to.width ? from.width / to.width : 1;
      bag.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${s})` }, { transform: 'none' }],
        { duration: 450, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
    }
    // L'affichage de la balance défile jusqu'à la valeur.
    const token = lab.newScene();
    balance.classList.add('is-weighing');
    lab.tween(token, 650, t => { display.innerHTML = `${(value * t).toFixed(1)}<small> g</small>`; }, ease.out).then(ok => {
      const bal = $('[data-balance]');
      if (bal) bal.classList.remove('is-weighing');
      if (ok) display.innerHTML = `${value.toFixed(1)}<small> g</small>`;
    });
    const input = $(`[data-cell="${j}"]`);
    if (input && state.points[j][state.wi] == null) input.focus({ preventScroll: true });
  }

  function waitTwoWeeks() {
    if (!weekComplete()) {
      lab.state.showMissing = true;
      renderRun();
      setCaption(LABELS.missingPoints, true);
      return;
    }
    const from = state.wi;
    state.weighed = {};
    state.active = null;
    state.lastReading = null;
    lab.state.showMissing = false;
    renderRun(LABELS.captionWaiting);
    // La semaine avance tout de suite : si l'animation est interrompue
    // (fermeture, autre étape), l'état reste juste. Pendant l'animation, la
    // paillasse ne répond pas (is-busy).
    state.wi = from + 1;
    $('.dc-run').classList.add('is-busy');
    $$('.lab-footer button').forEach(b => { b.disabled = true; });
    const token = lab.newScene();
    const timeline = $('[data-timeline]');
    const visuals = $$('.dc-jar-visual');
    timeline.classList.add('is-moving');
    lab.tween(token, 1600, t => {
      const week = lerp(WEEKS[from], WEEKS[from + 1], t);
      timeline.style.setProperty('--p', String(from + t));
      state.jars.forEach((cfg, j) => {
        if (visuals[j]) visuals[j].innerHTML = jarSVG(cfg, trueMass(cfg, week), j);
      });
    }, ease.inOut).then(ok => { if (ok) renderRun(); });
  }

  /* ===== Étape 3 : conclusion ===== */
  function conclusionPair() {
    if (state.jars.length === 2) return [0, 1];
    return state.conclusion.pair.length === 2 ? state.conclusion.pair.slice().sort() : null;
  }

  function conclusionParts() {
    const c = state.conclusion;
    return {
      pair: !!conclusionPair(),
      differ: c.differ.length > 0,
      answer: !!c.answer,
      verdict: !!c.verdict
    };
  }

  function conclusionsComplete() {
    const p = conclusionParts();
    return p.pair && p.differ && p.answer && p.verdict;
  }

  function renderConclude() {
    const c = state.conclusion;
    const parts = conclusionParts();
    const miss = k => lab.state.showMissing && !parts[k] ? 'lab-is-missing' : '';
    const [a, b] = sides();

    const pairBlock = state.jars.length === 2
      ? `<p class="dc-q-fixed">${LABELS.qPairFixed(1, 2)}</p>`
      : `<div class="dc-chips">${state.jars.map((cfg, j) => `<button type="button" class="lab-choice dc-chip ${c.pair.includes(j) ? 'is-selected' : ''}" data-pair="${j}" aria-pressed="${c.pair.includes(j)}">${legendKey(j)}${LABELS.jar(j + 1)}</button>`).join('')}</div>`;
    const differBlock = `<div class="dc-chips">` +
      FACTORS.map(f => `<button type="button" class="lab-choice dc-chip ${c.differ.includes(f) ? 'is-selected' : ''}" data-differ="${f}" aria-pressed="${c.differ.includes(f)}">${LABELS.factors[f]}</button>`).join('') +
      `<button type="button" class="lab-choice dc-chip ${c.differ.includes('nothing') ? 'is-selected' : ''}" data-differ="nothing" aria-pressed="${c.differ.includes('nothing')}">${LABELS.nothing}</button></div>`;
    const blank = c.answer ? `<span class="dc-blank is-filled">${LABELS.compare[c.answer]}</span>` : `<span class="dc-blank">……………</span>`;
    const answerBlock = `<p class="dc-sentence dc-sentence-sm">${LABELS.qAnswer} ${conditionText(a)} ${blank} ${conditionText(b)}.</p>` +
      `<div class="dc-chips">${['faster', 'slower', 'same'].map(x => `<button type="button" class="lab-choice dc-chip ${c.answer === x ? 'is-selected' : ''}" data-answer="${x}" aria-pressed="${c.answer === x}">${LABELS.compare[x]}</button>`).join('')}</div>`;
    const verdictBlock = `<div class="dc-chips dc-chips-inline"><span class="dc-q-text">${LABELS.qVerdict}</span>` +
      ['confirmed', 'rejected'].map(x => `<button type="button" class="lab-choice dc-chip ${c.verdict === x ? 'is-selected' : ''}" data-verdict="${x}" aria-pressed="${c.verdict === x}">${LABELS[x]}</button>`).join('') + `</div>`;

    lab.body.innerHTML = `<div class="dc-conclude">` +
      `<section class="dc-graph-panel dc-graph-read">` +
        `<div class="dc-graph-head"><h3 class="lab-panel-title">${LABELS.graphTitle}</h3>${graphLegend()}</div>` +
        `<div class="dc-graph-wrap">${graphSVG({ mode: 'read' })}</div><div class="dc-tip" hidden></div>` +
      `</section>` +
      `<section class="dc-form">` +
        `<p class="dc-reminder">${gloss(LABELS.questions[run.qid])}</p>` +
        `<div class="dc-q ${miss('pair')}"><p class="dc-q-title">${LABELS.qPair}</p>${pairBlock}</div>` +
        `<div class="dc-q ${miss('differ')}"><p class="dc-q-title">${LABELS.qDiffer}</p>${differBlock}</div>` +
        `<div class="dc-q ${miss('answer')}">${answerBlock}</div>` +
        `<div class="dc-q ${miss('verdict')}">${verdictBlock}</div>` +
      `</section></div>`;

    bindTips($('.dc-graph-read'));
    $$('[data-pair]').forEach(btn => btn.addEventListener('click', () => {
      const j = Number(btn.dataset.pair);
      if (c.pair.includes(j)) c.pair = c.pair.filter(x => x !== j);
      else c.pair = c.pair.concat(j).slice(-2);
      renderConclude();
    }));
    $$('[data-differ]').forEach(btn => btn.addEventListener('click', () => {
      const f = btn.dataset.differ;
      if (f === 'nothing') c.differ = c.differ.includes('nothing') ? [] : ['nothing'];
      else {
        const rest = c.differ.filter(x => x !== 'nothing');
        c.differ = rest.includes(f) ? rest.filter(x => x !== f) : rest.concat(f);
      }
      renderConclude();
    }));
    $$('[data-answer]').forEach(btn => btn.addEventListener('click', () => { c.answer = btn.dataset.answer; renderConclude(); }));
    $$('[data-verdict]').forEach(btn => btn.addEventListener('click', () => { c.verdict = btn.dataset.verdict; renderConclude(); }));

    const ready = conclusionsComplete();
    lab.renderStepper();
    lab.setFooter(`<button type="button" class="lab-btn lab-btn-ghost" data-back>← ${LABELS.backToLab}</button>` +
      (lab.state.showMissing && !ready ? lab.footerInfo(lab.L.missingConclusions, true) : '') +
      `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-check>${LABELS.checkConclusions}</button></div>`);
    $('[data-back]').addEventListener('click', () => lab.goToStep(2));
    const check = $('[data-check]');
    lab.setLock(check, ready ? null : lab.L.missingConclusions, { missing: true, key: 'check' });
    check.addEventListener('click', () => {
      lab.finish();
    });
  }

  /* ===== Étape 4 : correction ===== */
  function factorList(list) {
    const names = list.map(f => LABELS.factorNouns[f]);
    return names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0] || '';
  }

  function evaluate() {
    const q = question();
    const pair = conclusionPair();
    const diff = pair ? factorsBetween(pair[0], pair[1]) : [];
    const said = state.conclusion.differ.filter(x => x !== 'nothing');
    const saidOk = said.length === diff.length && said.every(f => diff.includes(f));
    const pairFair = diff.length === 1 && diff[0] === q.factor;
    const fairPairs = [];
    for (let i = 0; i < state.jars.length; i++) {
      for (let j = i + 1; j < state.jars.length; j++) {
        const d = factorsBetween(i, j);
        if (d.length === 1 && d[0] === q.factor) fairPairs.push([i, j]);
      }
    }

    const misses = [];
    let total = 0, good = 0;
    if (state.started) {
      state.jars.forEach((cfg, j) => {
        WEEKS.forEach((w, i) => {
          if (i === 0) return;
          total++;
          const v = state.points[j][i];
          const r = state.readings[j][i];
          if (v != null && Math.abs(v - r) <= TOLERANCE + 1e-9) good++;
          else misses.push({ j, w, v, r });
        });
      });
    }

    const c = state.conclusion;
    return {
      pair, diff, said, saidOk, pairFair, fairPairs, misses, total, good,
      fair: pairFair && saidOk,
      points: total > 0 && good === total,
      answer: c.answer === truth(),
      verdict: (state.hypothesis === c.answer) === (c.verdict === 'confirmed')
    };
  }

  const EXPLANATIONS = {
    decomposers: 'In living soil, [decomposers] — [bacteria] and [fungi], too small to see — feed on the dead leaves. They turn this [organic matter] into [mineral matter], which goes back into the soil. Heating the soil in an oven kills them: in sterilized soil, the leaves hardly change.',
    worms: '[Earthworms] are [decomposers] too. They pull dead leaves into the soil, eat them and cut them into tiny pieces, so [bacteria] and [fungi] work faster. Without earthworms, the leaves still disappear, but more slowly: the bacteria and fungi are still there.',
    water: '[Decomposers] need water to live. In dry soil, [bacteria] and [fungi] are much less active, so dead leaves stay much longer.',
    temperature: 'Cold slows [decomposers] down. In the fridge, [bacteria] and [fungi] are much less active, so the leaves disappear more slowly. This is also why food keeps longer in a fridge.'
  };
  const CYCLE = 'This is how a forest recycles its dead leaves: the [mineral matter] released by the decomposers feeds the plants again (the [cycle of matter]).';

  const CHECK = {
    fairOk: (a, b, f) => `Jars ${a} and ${b} differ only by the ${f}. Everything else is the same: this is a [fair test]. Any difference in the results can only come from the ${f}.`,
    fairMany: (a, b, list, n) => `Jars ${a} and ${b} differ by ${n} things: ${list}. If the leaves disappear faster in one of them, you cannot know which difference caused it.`,
    fairNone: (a, b) => `Jars ${a} and ${b} are prepared in exactly the same way: comparing them cannot answer the question.`,
    fairOther: (a, b, d, f) => `Jars ${a} and ${b} differ only by the ${d}, but your question is about the ${f}.`,
    fairBetter: (a, b) => `Jars ${a} and ${b} were the [fair test]: compare those two.`,
    fairNoPair: f => `None of your jars differ only by the ${f}. Next time, prepare two jars that are the same except for the ${f}.`,
    saidOk: 'You saw correctly what is different between the two jars.',
    saidWrong: (said, real) => `You said they differ by: ${said}. In fact, they differ by: ${real}.`,
    noExperiment: 'You did not carry out the experiment: there are no measurements.',
    pointsScore: (good, total) => `${good} / ${total} masses written correctly (the same as the balance reading).`,
    pointsAllGood: 'All your masses match the balance readings. Well read!',
    pointsMiss: (j, w, v, r) => v == null ? `Jar ${j}, week ${w}: nothing written (the balance showed ${r.toFixed(1)} g).` : `Jar ${j}, week ${w}: you wrote ${v.toFixed(1)} g, the balance showed ${r.toFixed(1)} g.`,
    pointsMore: n => `… and ${n} more.`,
    answerOk: 'Correct!',
    answerWrong: 'Not quite. The correct answer:',
    answerUnfair: 'Careful: your test was not fair, so your own results could not really show this.',
    verdictOk: v => `Your hypothesis and your conclusion ${v === 'confirmed' ? 'say the same thing' : 'do not say the same thing'}: it is indeed ${v}. Well judged!`,
    verdictWrong: (should) => `Compare your hypothesis with your conclusion: they ${should === 'confirmed' ? 'say the same thing, so your hypothesis is confirmed' : 'do not say the same thing, so your hypothesis is rejected'}.`,
    rejectedNote: 'A rejected hypothesis is not a mistake: it is how science moves on.',
    yourHyp: 'Your hypothesis:',
    yourConcl: 'Your conclusion:'
  };

  function criterionDetail(key, ev) {
    const q = question();
    const fName = LABELS.factorNouns[q.factor];
    if (key === 'fair') {
      let html = '';
      if (!ev.pair) html += `<p>${gloss(CHECK.fairNoPair(fName))}</p>`;
      else {
        const [a, b] = ev.pair.map(x => x + 1);
        if (ev.pairFair) html += `<p>${gloss(CHECK.fairOk(a, b, fName))}</p>`;
        else if (ev.diff.length === 0) html += `<p>${CHECK.fairNone(a, b)}</p>`;
        else if (ev.diff.length === 1) html += `<p>${CHECK.fairOther(a, b, LABELS.factorNouns[ev.diff[0]], fName)}</p>`;
        else html += `<p>${CHECK.fairMany(a, b, factorList(ev.diff), ev.diff.length)}</p>`;
        if (!ev.pairFair) {
          html += ev.fairPairs.length ? `<p>${gloss(CHECK.fairBetter(ev.fairPairs[0][0] + 1, ev.fairPairs[0][1] + 1))}</p>` : `<p>${CHECK.fairNoPair(fName)}</p>`;
        }
        html += `<p class="${ev.saidOk ? 'dc-ok' : 'dc-ko'}">${ev.saidOk ? CHECK.saidOk : CHECK.saidWrong(ev.said.length ? factorList(ev.said) : LABELS.nothing.toLowerCase(), ev.diff.length ? factorList(ev.diff) : LABELS.nothing.toLowerCase())}</p>`;
      }
      html += `<ul class="dc-jarlist">${state.jars.map((cfg, j) => `<li>${legendKey(j)}<strong>${LABELS.jar(j + 1)}</strong> ${jarDescription(cfg)}</li>`).join('')}</ul>`;
      return html;
    }
    if (key === 'points') {
      if (!state.started) return `<p>${CHECK.noExperiment}</p>`;
      const list = ev.misses.slice(0, 4).map(m => `<li>${CHECK.pointsMiss(m.j + 1, m.w, m.v, m.r)}</li>`).join('') +
        (ev.misses.length > 4 ? `<li>${CHECK.pointsMore(ev.misses.length - 4)}</li>` : '');
      return `<p>${CHECK.pointsScore(ev.good, ev.total)}</p>` +
        `<div class="dc-graph-panel dc-graph-mini">${graphLegend({ readings: true })}<div class="dc-graph-wrap">${graphSVG({ mode: 'read', readings: true })}</div><div class="dc-tip" hidden></div></div>` +
        (ev.misses.length ? `<ul class="dc-misslist">${list}</ul>` : `<p class="dc-ok">${CHECK.pointsAllGood}</p>`);
    }
    if (key === 'answer') {
      const right = sentence(LABELS.answerStart, truth(), true);
      return (ev.answer ? `<p class="dc-ok">${CHECK.answerOk} ${right}</p>` : `<p class="dc-ko">${CHECK.answerWrong}</p><p><strong>${right}</strong></p>`) +
        (!ev.fair && ev.answer ? `<p>${CHECK.answerUnfair}</p>` : '') +
        `<p>${gloss(EXPLANATIONS[run.qid])}</p><p class="dc-muted">${gloss(CYCLE)}</p>`;
    }
    const should = state.hypothesis === state.conclusion.answer ? 'confirmed' : 'rejected';
    return `<p><strong>${CHECK.yourHyp}</strong> ${sentence(LABELS.iThink, state.hypothesis, true)}</p>` +
      `<p><strong>${CHECK.yourConcl}</strong> ${sentence(LABELS.qAnswer, state.conclusion.answer, true)}</p>` +
      `<p class="${ev.verdict ? 'dc-ok' : 'dc-ko'}">${ev.verdict ? CHECK.verdictOk(state.conclusion.verdict) : CHECK.verdictWrong(should)}</p>` +
      (should === 'rejected' ? `<p class="dc-muted">${CHECK.rejectedNote}</p>` : '');
  }

  function renderCheck() {
    const ev = evaluate();
    const keys = ['fair', 'points', 'answer', 'verdict'];
    const score = keys.filter(k => ev[k]).length;
    const rows = keys.map(k => `<button type="button" class="dc-crit ${ev[k] ? 'is-ok' : 'is-ko'} ${state.selected === k ? 'is-selected' : ''}" data-crit="${k}">` +
      `<span class="dc-crit-text"><strong>${LABELS.criteria[k]}</strong><small>${LABELS.criteriaSub[k]}</small></span>` +
      `<span class="dc-crit-mark" aria-label="${ev[k] ? 'correct' : 'incorrect'}">${ev[k] ? '✓' : '✗'}</span></button>`).join('');

    lab.body.innerHTML = `<div class="dc-check">` +
      `<div class="dc-check-left">` +
        `<div class="lab-score"><span class="lab-score-num">${score}<small> / 4</small></span><span class="lab-score-label">${LABELS.scoreLabel}</span></div>` +
        `<div class="dc-crit-list">${rows}</div>` +
        `<p class="dc-reminder">${gloss(LABELS.questions[run.qid])}</p>` +
      `</div>` +
      `<div class="dc-check-detail" aria-live="polite"><h3>${LABELS.criteria[state.selected]}</h3>${criterionDetail(state.selected, ev)}</div>` +
      `</div>`;

    $$('[data-crit]').forEach(btn => btn.addEventListener('click', () => {
      state.selected = btn.dataset.crit;
      renderCheck();
    }));
    const mini = $('.dc-graph-mini');
    if (mini) bindTips(mini);
    lab.checkFooter();
  }

  /* ===== Rapport imprimable : contenu des 7 sections de la fiche outil FO3
     (en-tête, numérotation et mise en page : cadre commun) ===== */
  function buildReport() {
    const R = LABELS.report;
    const ev = evaluate();
    const leaf = LABELS.leaves[run.leaf];
    const used = f => state.jars.some(cfg => cfg[f.k] === f.v);
    const extras = [
      used({ k: 'soil', v: 'sterile' }) && R.extras.oven,
      used({ k: 'worms', v: 'yes' }) && R.extras.worms,
      used({ k: 'water', v: 'moist' }) && R.extras.spray,
      used({ k: 'place', v: 'fridge' }) && R.extras.fridge
    ].filter(Boolean);

    const head = `<tr><th>${R.tableWeek}</th>${state.jars.map((cfg, j) => `<th>${LABELS.jar(j + 1)}</th>`).join('')}</tr>`;
    const body = WEEKS.map((w, i) => `<tr><th>${w}</th>${state.jars.map((cfg, j) => {
      const v = state.started ? state.points[j][i] : (i === 0 ? START_MASS : null);
      return `<td>${v == null ? '—' : v.toFixed(1)}</td>`;
    }).join('')}</tr>`).join('');

    const pair = ev.pair;
    let interp = '—';
    if (pair) {
      const [a, b] = pair;
      const diffText = ev.said.length ? R.differ(factorList(ev.said)) : R.differNothing;
      const last = j => state.started && state.points[j][WEEKS.length - 1] != null ? formatMass(state.points[j][WEEKS.length - 1]) : R.noData;
      interp = R.interpretation(a + 1, b + 1, diffText, last(a), last(b));
    }

    const verdictWord = LABELS[state.conclusion.verdict] || '—';
    const correction = ['fair', 'points', 'answer', 'verdict'].map(k => `<tr><th>${LABELS.criteria[k]}</th><td class="${ev[k] ? 'ok' : 'ko'}">${ev[k] ? '✓' : '✗'}</td></tr>`).join('');

    return {
      title: R.title,
      sections: [
        `<p>${LABELS.questionsPlain[run.qid]}</p>`,
        `<p>${sentence(LABELS.iThink, state.hypothesis, false)}</p>` + (state.because.trim() ? `<p>${R.because}: ${escapeHtml(state.because.trim())}</p>` : ''),
        `<p>${R.materials(state.jars.length, leaf, extras)}</p>`,
        `<ol><li>${R.procedureStart}</li>${state.jars.map((cfg, j) => `<li>${R.procedureJar(j + 1, jarDescription(cfg))}</li>`).join('')}<li>${R.procedureWeigh}</li><li>${R.procedureGraph}</li></ol>`,
        `<div class="dc-report-results"><table class="dc-report-table"><caption>${R.tableUnit}</caption>${head}${body}</table>` +
          `<div class="dc-report-graph">${graphSVG({ mode: 'print', size: [330, 211] })}<div class="dc-report-legend">${state.jars.map((cfg, j) => `<span>${legendKey(j)}${LABELS.jar(j + 1)}</span>`).join('')}</div></div></div>`,
        `<p>${interp}</p>`,
        `<p>${state.conclusion.answer ? R.conclusion(sentence(LABELS.qAnswer, state.conclusion.answer, false), verdictWord) : '—'}</p>`
      ],
      correction: `<p><strong>${R.score(['fair', 'points', 'answer', 'verdict'].filter(k => ev[k]).length)}</strong></p>` +
        `<table class="dc-report-corr">${correction}</table>` +
        `<p>${R.correctAnswer} ${sentence(LABELS.answerStart, truth(), false)}</p>`
    };
  }

  lab = LabEngine.create({
    id: 'decomposition',
    title: LABELS.title,
    glossary: GLOSSARY,
    reset,
    stepComplete,
    lockReason,
    isStarted: () => !!state.hypothesis || state.started,
    render: { 1: renderPredict, 2: renderExperiment, 3: renderConclude, 4: renderCheck },
    report: buildReport
  });
})();
