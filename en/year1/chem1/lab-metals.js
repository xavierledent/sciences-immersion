/* ===== Labo virtuel « Metal detectives » (chem1) : identifier des métaux =====

   Contenu et simulation propres à ce labo : échantillons, tests, scènes
   animées, correction. Le cadre commun (modale, barre d'étapes, verrous,
   traduction, glisser-déposer, rapport imprimé) est dans lab-engine.js, à la
   racine du site, chargé avant ce fichier. Textes en anglais seulement pour
   l'instant.

   Déroulé en 4 étapes :
     1. Predict   — hypothèse « métal / pas un métal / je ne sais pas »
     2. Experiment — 5 tests sur la paillasse, l'élève note lui-même ses
                    observations dans le carnet
     3. Conclude  — métal ou non, et lequel (fiche de référence)
     4. Check     — correction commentée, score, rapport imprimable (FO3)

   Cinq échantillons tirés au sort parmi dix à chaque nouveau labo (voir DRAW).
   Rien n'est enregistré : recharger la page repart de zéro, avec un nouveau
   tirage. */

(function () {
  'use strict';

  const { mulberry32, seedFrom, pick, shuffle, lerp, ease, reduceMotion } = LabEngine.util;

  // Cadre commun, créé en fin de fichier (LabEngine.create).
  let lab;
  const $ = sel => lab.$(sel);
  const gloss = text => lab.gloss(text);
  const tween = (...args) => lab.tween(...args);
  const wait = (...args) => lab.wait(...args);

  /* ===== Libellés =====
     [mot] ou [mot|clé] : mot du lexique, souligné, traduction française au
     survol ou au toucher (voir GLOSSARY). */
  const LABELS = {
    title: 'Metal detectives',

    predictIntro: 'Look carefully at each [sample]. Before any test, do you think it is a metal?',
    predictMetal: 'Metal',
    predictNot: 'Not a metal',
    predictUnsure: 'Not sure',
    predictCount: (n, total) => `${n} / ${total} hypotheses`,
    startTesting: 'Start testing',

    trayTitle: 'Samples',
    notebookTitle: (id) => `Notebook — sample ${id}`,
    notebookEmpty: 'Put a [sample] on the [bench] to fill in its notebook.',
    notebookLocked: 'Do the test first',
    lockTests: n => `Finish your tests first: ${n} ${n === 1 ? 'observation' : 'observations'} still to note in the notebook.`,
    lockHypothesesFixed: 'Your hypotheses are fixed: the tests have started. A scientist does not change the hypothesis after seeing the results!',
    lockNotebook: 'Do this test first: drag the tool onto the sample.',
    lockWhichMetal: 'First say whether it is a metal.',
    lockNotMetal: 'You said it is not a metal: there is nothing to choose.',
    sceneEmpty: 'Drag a sample here',
    sceneEmptySub: 'or tap a sample in the tray',
    captionEmpty: 'Choose a [sample] in the tray and put it on the [bench].',
    captionReady: (id) => `[Sample] ${id} is on the [bench]. Drag a [tool] onto it, or tap a tool.`,
    captionNeedSample: 'First, put a [sample] on the [bench].',
    captionRecord: ' Now write what you observed in the [notebook].',
    speedUp: 'Speed up',
    observations: (n, total) => `${n} / ${total} observations written`,
    resultsTable: 'Results table',
    toConclude: 'Next: conclude',

    concludeIntro: 'Use your results to decide. Is each [sample] a metal? If it is, which metal is it?',
    colSample: 'Sample',
    colMetal: 'Metal?',
    colWhich: 'Which metal?',
    yes: 'Yes',
    no: 'No',
    choose: 'Choose…',
    backToLab: 'Back to the lab',
    referenceSheet: 'Metal reference sheet',
    checkConclusions: 'Check my conclusions',
    notRecorded: '—',

    scoreLabel: 'correct identifications',
    hypothesesLabel: (n, total) => `${n} / ${total} hypotheses confirmed`,
    colYourAnswer: 'Your answer',
    colCorrect: 'Correct answer',
    notMetal: 'Not a metal',
    youPredicted: 'Your hypothesis',
    hypothesisConfirmed: 'confirmed',
    hypothesisRejected: 'rejected',
    hypothesisNone: 'no hypothesis',
    notebookCheck: 'Your notebook',
    youWrote: 'You wrote',
    expected: 'Expected',

    refTitle: 'Metal reference sheet',
    refIntro: 'What the five metals of the lab look like after [sanding], and how they react to two of the tests.',
    refColMetal: 'Metal',
    refColColour: 'Colour of the [sanded area]',
    refColMagnet: 'Magnet',
    refColHeat: '[Wax melts]…',
    tableTitle: 'Results table',
    tableIntro: 'Everything you wrote in the [notebook], for all the samples.',

    tests: {
      luster: { tool: 'Sandpaper', name: 'Luster', question: 'How does the [sanded area] look?' },
      magnet: { tool: 'Magnet', name: 'Magnetism', question: 'Is it attracted by the [magnet]?' },
      electric: { tool: 'Circuit', name: 'Electrical conductivity', question: 'Does it let electricity through?' },
      heat: { tool: 'Hot water', name: 'Thermal conductivity', question: 'When [does the wax melt]?' },
      hammer: { tool: 'Hammer', name: 'Malleability', question: 'Does it change shape without breaking?' }
    },
    options: {
      shiny: 'Shiny', dull: 'Dull',
      attracted: 'Attracted', notAttracted: 'Not attracted',
      conducts: 'Conducts', notConducts: 'Does not conduct',
      heatVeryFast: '< 45 s', heatFast: '45 s–1:30', heatSlow: '> 1:30', heatNone: 'No melting',
      malleable: 'Malleable', notMalleable: 'Not malleable'
    },
    heatOptionLong: {
      heatVeryFast: 'in less than 45 s', heatFast: 'between 45 s and 1:30',
      heatSlow: 'after more than 1:30', heatNone: 'did not melt in 5 min'
    },
    metals: { iron: 'Iron', copper: 'Copper', aluminium: 'Aluminium', gold: 'Gold', silver: 'Silver' },

    report: {
      title: 'Laboratory report — Identifying metals',
      question: (range) => `Which of the samples (${range}) are metals? For each metal, which metal is it?`,
      hypothesisIntro: 'Before testing, I looked at each sample and predicted:',
      materials: (n, range) => `${n} samples of the same shape (${range}), sandpaper, a magnet, an electric circuit (battery, bulb, wires, 2 clips), a beaker of hot water on a hot plate, a lab stand, wax, a stopwatch, a hammer, 2 wooden blocks.`,
      procedure: [
        'Rub the sample with sandpaper and observe the sanded area.',
        'Bring the magnet close to the sample.',
        'Connect the sample to the electric circuit and observe the bulb.',
        'Dip one end of the sample in hot water, put wax on the other end and time how long the wax takes to melt.',
        'Place the sample on two wooden blocks, hit it with the hammer and observe its shape.',
        'Repeat steps 1 to 5 for each sample and write the results in a table.'
      ],
      heatNote: 'Thermal conductivity: time for the wax to melt.',
      interpretationLine: (id, hyp, concl, verdict) => `Sample ${id}: I predicted “${hyp}”. My results show “${concl}”. Hypothesis ${verdict}.`,
      interpretationUnsure: (id, concl) => `Sample ${id}: I was not sure before testing. My results show “${concl}”.`,
      conclusionMetals: (list) => `The metals are: ${list}.`,
      conclusionNone: 'I did not identify any metal.',
      conclusionNot: (list) => `These samples are not metals: ${list}.`,
      score: (n, total) => `Score: ${n} / ${total} correct identifications.`,
      noteObs: (id, test, wrote, exp) => `Sample ${id}, ${test}: you wrote “${wrote}”, the right observation is “${exp}”.`,
      noteMetal: (id, metal) => `Sample ${id} is a metal: ${metal}.`,
      noteNotMetal: (id, what) => `Sample ${id} is not a metal: it is ${what}.`,
      nothing: 'none'
    }
  };

  const GLOSSARY = {
    sample: 'échantillon', bench: 'paillasse', tool: 'outil',
    sandpaper: 'papier de verre', sanding: 'ponçage', 'sanded area': 'zone poncée',
    magnet: 'aimant', clips: 'pinces',
    'the bulb lights up': 'l’ampoule s’allume', 'the bulb stays off': 'l’ampoule reste éteinte',
    wax: 'cire', 'wax melts': 'la cire fond', 'the wax melts': 'la cire fond',
    'does the wax melt': 'la cire fond-elle', 'the wax has still not melted': 'la cire n’a toujours pas fondu',
    'dips in hot water': 'trempe dans l’eau chaude',
    hammer: 'marteau', notebook: 'cahier', stopwatch: 'chronomètre',
    paint: 'peinture', scratched: 'rayé', cloudy: 'trouble',
    sawdust: 'sciure', 'cracks and breaks': 'se fissure et se casse', shatters: 'vole en éclats', splits: 'se fend',
    'the hammer bounces off': 'le marteau rebondit',
    bends: 'se plie', chips: 'éclats', tarnished: 'terni'
  };

  /* ===== Matériaux =====
     surface/fresh : dégradé [haut, bas] avant et après ponçage.
     heat : secondes (temps simulé) avant que la cire fonde ; null = jamais.
     Ordre de conductivité thermique retenu, comme dans les manuels :
     argent > cuivre > or > aluminium > fer. */
  const MATERIALS = {
    copper: {
      label: 'Copper', isMetal: true, metal: 'copper',
      surface: ['#ad7553', '#7e4f35'], fresh: ['#f8b98f', '#d6774a'],
      texture: 'tarnish', glossy: false, freshKind: 'metal',
      magnetic: false, conducts: true, heat: 38, hammer: 'dent', bendAmount: 0.95
    },
    iron: {
      label: 'Iron', isMetal: true, metal: 'iron',
      surface: ['#72767c', '#4a4e54'], fresh: ['#eef0f3', '#a7aeb6'],
      texture: 'rust', glossy: false, freshKind: 'metal',
      magnetic: true, conducts: true, heat: 160, hammer: 'dent', bendAmount: 0.55
    },
    aluminium: {
      label: 'Aluminium', isMetal: true, metal: 'aluminium',
      surface: ['#a3a7a4', '#7b807d'], fresh: ['#f1f3f5', '#bcc3ca'],
      texture: 'oxide', glossy: false, freshKind: 'metal',
      magnetic: false, conducts: true, heat: 68, hammer: 'dent', bendAmount: 1
    },
    gold: {
      label: 'Gold', isMetal: true, metal: 'gold',
      surface: ['#f6d56a', '#c4962b'], fresh: ['#ffe58a', '#d9a92f'],
      texture: 'none', glossy: true, freshKind: 'metal',
      magnetic: false, conducts: true, heat: 55, hammer: 'dent', bendAmount: 1
    },
    silver: {
      label: 'Silver', isMetal: true, metal: 'silver',
      surface: ['#cfcdc6', '#a09e97'], fresh: ['#ffffff', '#dfe3e8'],
      texture: 'brushed', glossy: false, freshKind: 'metal',
      magnetic: false, conducts: true, heat: 30, hammer: 'dent', bendAmount: 0.9
    },
    plasticGold: {
      label: 'Plastic painted gold', isMetal: false,
      surface: ['#f7d669', '#c7982c'], fresh: ['#f8f5ee', '#e2ddcf'],
      texture: 'none', glossy: true, freshKind: 'plastic',
      magnetic: false, conducts: false, heat: null, hammer: 'crack'
    },
    plasticSilver: {
      label: 'Plastic painted silver', isMetal: false,
      surface: ['#e9ecf0', '#a3aab3'], fresh: ['#f6f2e8', '#e0d9c8'],
      texture: 'none', glossy: true, freshKind: 'plastic',
      magnetic: false, conducts: false, heat: null, hammer: 'crack'
    },
    glass: {
      label: 'Mirror glass', isMetal: false,
      surface: ['#f4fbff', '#8fa9b8'], fresh: ['#eef2f4', '#d2dade'],
      texture: 'mirror', glossy: true, freshKind: 'frosted',
      magnetic: false, conducts: false, heat: null, hammer: 'shatter'
    },
    wood: {
      label: 'Wood', isMetal: false,
      surface: ['#cf9c66', '#9a683a'], fresh: ['#e8c294', '#c99962'],
      texture: 'wood', glossy: false, freshKind: 'wood',
      magnetic: false, conducts: false, heat: null, hammer: 'split'
    },
    granite: {
      label: 'Granite (a rock)', isMetal: false,
      surface: ['#bdb0ac', '#8e8481'], fresh: ['#c9bdb9', '#9d9390'],
      texture: 'granite', glossy: false, freshKind: 'granite',
      magnetic: false, conducts: false, heat: null, hammer: 'bounce'
    }
  };

  /* Tirage de 5 échantillons à chaque nouveau labo (chargement de la page ou
     « Restart ») : le labo se refait sans connaître les réponses. Lettres A à
     E dans un ordre mélangé, donc propres à chaque élève ; le rapport imprimé
     dit quel matériau se cachait derrière chaque lettre.
       — le fer, toujours ;
       — un métal piège, qui ne ressemble pas à un métal avant ponçage ;
       — un non-métal piège, qui ressemble à un métal ;
       — le métal qui lui ressemble (même aspect, tests différents) ;
       — un non-métal évident. */
  const DRAW = {
    always: 'iron',
    trapMetal: ['copper', 'aluminium'],
    trapNonMetal: ['plasticGold', 'plasticSilver', 'glass'],
    lookAlike: { plasticGold: ['gold'], plasticSilver: ['silver'], glass: ['gold', 'silver'] },
    plainNonMetal: ['wood', 'granite']
  };

  function drawSamples() {
    const trap = pick(DRAW.trapNonMetal);
    const mats = shuffle([DRAW.always, pick(DRAW.trapMetal), pick(DRAW.lookAlike[trap]), trap, pick(DRAW.plainNonMetal)]);
    return mats.map((mat, i) => ({ id: 'ABCDEFGHIJ'[i], mat }));
  }

  let SAMPLES = [];

  function sampleRange() { return `A to ${SAMPLES[SAMPLES.length - 1].id}`; }

  const METAL_IDS = ['iron', 'copper', 'aluminium', 'gold', 'silver'];

  const TESTS = [
    { id: 'luster', options: ['shiny', 'dull'] },
    { id: 'magnet', options: ['attracted', 'notAttracted'] },
    { id: 'electric', options: ['conducts', 'notConducts'] },
    { id: 'heat', options: ['heatVeryFast', 'heatFast', 'heatSlow', 'heatNone'] },
    { id: 'hammer', options: ['malleable', 'notMalleable'] }
  ];

  // Observation décrite, jamais interprétée : c'est à l'élève de nommer la
  // propriété dans son carnet.
  const CAPTIONS = {
    luster: {
      copper: 'Under the brown, [tarnished] surface, the [sanded area] is orange-pink and reflects light strongly.',
      iron: 'Under the dark grey surface, the [sanded area] is silvery grey and reflects light strongly.',
      aluminium: 'Under the dull grey surface, the [sanded area] is light grey and reflects light strongly.',
      gold: 'The [sanded area] stays yellow and reflects light strongly.',
      silver: 'The [sanded area] is bright white and reflects light strongly.',
      plasticGold: 'The yellow [paint] comes off. Underneath, the material is white and does not reflect light.',
      plasticSilver: 'The silver [paint] comes off. Underneath, the material is creamy white and does not reflect light.',
      glass: 'The surface gets [scratched] and [cloudy]. The [sanded area] no longer reflects light.',
      wood: 'Fine [sawdust] falls. The [sanded area] is light brown and does not reflect light.',
      granite: 'The rock is very hard: it is hardly [scratched]. It stays speckled and does not reflect light.'
    },
    magnetYes: 'The bar jumps up and sticks to the [magnet].',
    magnetNo: 'Nothing happens: the bar stays on the [bench].',
    electricYes: '[The bulb lights up].',
    electricNo: '[The bulb stays off].',
    heatMelted: (t) => `[The wax melts] after <strong>${t}</strong> (look at the [stopwatch]).`,
    heatNot: 'After <strong>5:00</strong>, [the wax has still not melted].',
    heatRunning: 'The bottom of the bar [dips in hot water]. Watch the [wax] at the top…',
    hammer: {
      dent: 'The bar [bends] where the [hammer] hit it. It changes shape, but it does not break.',
      dentSmall: 'The bar [bends] a little where the [hammer] hit it. It changes shape, but it does not break.',
      crack: 'The bar [cracks and breaks] into two pieces.',
      shatter: 'The bar [shatters] into sharp pieces.',
      split: 'The bar [splits] into two pieces.',
      bounce: '[The hammer bounces off]. The bar does not change shape; only tiny [chips] fly off.'
    }
  };

  const EXPLANATIONS = {
    copper: 'This is <strong>copper</strong>. Its sanded surface is shiny, it conducts electricity and heat very fast, and it bends without breaking: it is a metal. It is not attracted by the magnet, and its orange-pink colour sets it apart from the other metals.',
    wood: '<strong>Wood</strong> is not a metal: it stays dull, the bulb stays off, the wax does not melt, and it splits under the hammer.',
    plasticGold: 'This is <strong>plastic painted gold</strong>. It looked shiny, but only because of the paint: once sanded, it is dull, it does not conduct electricity or heat, and it cracks.',
    iron: 'This is <strong>iron</strong>, the only sample attracted by the magnet. It is shiny once sanded, conducts electricity, conducts heat (more slowly than the other metals of the lab) and bends without breaking.',
    glass: 'This is <strong>mirror glass</strong>. It is very shiny, but it is not a metal: it does not conduct electricity or heat, and it shatters under the hammer. (A mirror shines thanks to a very thin metal layer hidden behind the glass — the glass itself is not a metal.)',
    silver: 'This is <strong>silver</strong>: bright white once sanded, not magnetic, conducts electricity, bends without breaking, and is the fastest of all to melt the wax.',
    granite: '<strong>Granite</strong> is a rock, not a metal: it is dull, does not conduct electricity or heat, and does not change shape under the hammer. You met granite in the part of the chapter about rocks.',
    aluminium: 'This is <strong>aluminium</strong>. Its surface was dull grey, covered with a thin layer of oxide, so it did not look like a metal. Once sanded, it is light grey and shiny. It is not magnetic, conducts electricity and heat (fast, but more slowly than silver and copper), and bends without breaking.',
    plasticSilver: 'This is <strong>plastic painted silver</strong>. The paint makes it look like a metal, but under the paint it is dull, it does not conduct electricity or heat, and it cracks.',
    gold: 'This is <strong>gold</strong>: yellow and shiny, not magnetic, conducts electricity and heat, and bends very easily.'
  };

  /* Comparaison avec le sosie tiré au sort, ajoutée à l'explication quand les
     deux échantillons sont présents. */
  const COMPARE = {
    plasticGold: { mat: 'gold', text: id => `Compare it with sample ${id}, the real gold: same look, very different results. Looking was not enough!` },
    gold: { mat: 'plasticGold', text: id => `Compare it with sample ${id}, the fake gold.` },
    plasticSilver: { mat: 'silver', text: id => `Compare it with sample ${id}, the real silver: same look, very different results. Looking was not enough!` },
    silver: { mat: 'plasticSilver', text: id => `Compare it with sample ${id}, the plastic painted silver.` }
  };

  function explanation(s) {
    const cmp = COMPARE[s.mat];
    const other = cmp && SAMPLES.find(x => x.mat === cmp.mat);
    return EXPLANATIONS[s.mat] + (other ? ' ' + cmp.text(other.id) : '');
  }

  const REFERENCE = [
    { metal: 'iron', colour: 'Silvery grey', magnet: 'Attracted', heat: 'Slowly (> 1:30)' },
    { metal: 'copper', colour: 'Orange-pink', magnet: 'Not attracted', heat: 'Very fast (< 45 s)' },
    { metal: 'aluminium', colour: 'Light grey', magnet: 'Not attracted', heat: 'Fast (45 s – 1:30)' },
    { metal: 'gold', colour: 'Yellow', magnet: 'Not attracted', heat: 'Fast (45 s – 1:30)' },
    { metal: 'silver', colour: 'Bright white', magnet: 'Not attracted', heat: 'Very fast (< 45 s)' }
  ];

  const HEAT_LIMIT = 300;      // secondes simulées
  const HEAT_RATE = 20;        // secondes simulées par seconde réelle
  const HEAT_RATE_FAST = 60;

  /* ===== Réponses attendues ===== */
  function expectedValue(mat, testId) {
    const m = MATERIALS[mat];
    switch (testId) {
      case 'luster': return m.isMetal ? 'shiny' : 'dull';
      case 'magnet': return m.magnetic ? 'attracted' : 'notAttracted';
      case 'electric': return m.conducts ? 'conducts' : 'notConducts';
      case 'heat':
        if (m.heat == null) return 'heatNone';
        if (m.heat < 45) return 'heatVeryFast';
        if (m.heat <= 90) return 'heatFast';
        return 'heatSlow';
      case 'hammer': return m.isMetal ? 'malleable' : 'notMalleable';
    }
    return null;
  }

  function sampleById(id) { return SAMPLES.find(s => s.id === id); }

  /* ===== État propre au labo =====
     L'étape en cours, le verrou de correction et le nom de l'élève sont dans
     lab.state (cadre commun). */
  let state;
  function reset() {
    SAMPLES = drawSamples();
    state = {
      hypotheses: {},
      current: null,
      activeTest: null,
      done: {},
      notes: {},
      conclusions: {},
      sanded: {},
      selectedResult: SAMPLES[0].id
    };
    SAMPLES.forEach(sm => {
      state.done[sm.id] = {};
      state.notes[sm.id] = {};
      state.conclusions[sm.id] = { isMetal: null, metal: '' };
    });
  }

  function formatTime(sec) {
    const s = Math.round(sec);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  /* ===== Dessin d'une barrette =====
     Chemin plutôt que <rect> pour pouvoir la courber (test du marteau). */
  let uidCounter = 0;

  function barPath(x, y, w, h, bend) {
    const r = Math.min(7, h / 3);
    const b = bend || 0;
    return `M${x + r},${y} Q${x + w / 2},${y + 2 * b} ${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} ` +
      `L${x + w},${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} ` +
      `Q${x + w / 2},${y + h + 2 * b} ${x + r},${y + h} Q${x},${y + h} ${x},${y + h - r} L${x},${y + r} Q${x},${y} ${x + r},${y} Z`;
  }

  function textureSVG(kind, x, y, w, h, seedKey) {
    const rnd = mulberry32(seedFrom(seedKey));
    let out = '';
    if (kind === 'tarnish') {
      for (let i = 0; i < 7; i++) {
        out += `<ellipse cx="${x + rnd() * w}" cy="${y + rnd() * h}" rx="${8 + rnd() * 22}" ry="${3 + rnd() * 6}" fill="#4e2e1c" opacity="0.18"/>`;
      }
    } else if (kind === 'oxide') {
      // Aluminium terni : voile blanchâtre crayeux, aucun reflet.
      for (let i = 0; i < 9; i++) {
        out += `<ellipse cx="${x + rnd() * w}" cy="${y + rnd() * h}" rx="${6 + rnd() * 18}" ry="${2 + rnd() * 5}" fill="#eef0ec" opacity="${0.18 + rnd() * 0.18}"/>`;
      }
      for (let i = 0; i < Math.round(w / 12); i++) {
        out += `<circle cx="${x + rnd() * w}" cy="${y + rnd() * h}" r="${0.6 + rnd() * 1.2}" fill="#5f6461" opacity="0.35"/>`;
      }
    } else if (kind === 'rust') {
      for (let i = 0; i < Math.round(w / 9); i++) {
        out += `<circle cx="${x + rnd() * w}" cy="${y + rnd() * h}" r="${0.8 + rnd() * 1.8}" fill="#a2602f" opacity="${0.35 + rnd() * 0.35}"/>`;
      }
      for (let i = 1; i < 5; i++) {
        out += `<line x1="${x}" y1="${y + (h * i) / 5}" x2="${x + w}" y2="${y + (h * i) / 5 + rnd() * 2}" stroke="#ffffff" stroke-opacity="0.08" stroke-width="0.8"/>`;
      }
    } else if (kind === 'brushed') {
      for (let i = 1; i < 7; i++) {
        out += `<line x1="${x}" y1="${y + (h * i) / 7}" x2="${x + w}" y2="${y + (h * i) / 7 + (rnd() - 0.5) * 2}" stroke="#ffffff" stroke-opacity="${0.15 + rnd() * 0.2}" stroke-width="0.8"/>`;
      }
    } else if (kind === 'wood') {
      for (let i = 0; i < 5; i++) {
        const yy = y + (h * (i + 0.6)) / 5.2;
        const a = (rnd() - 0.5) * h * 0.25;
        out += `<path d="M${x - 4},${yy} C${x + w * 0.3},${yy + a} ${x + w * 0.6},${yy - a} ${x + w + 4},${yy + a * 0.5}" fill="none" stroke="#7a4a22" stroke-opacity="0.32" stroke-width="${0.8 + rnd()}"/>`;
      }
      out += `<ellipse cx="${x + w * (0.25 + rnd() * 0.5)}" cy="${y + h * 0.5}" rx="${h * 0.35}" ry="${h * 0.16}" fill="none" stroke="#7a4a22" stroke-opacity="0.35"/>`;
    } else if (kind === 'granite') {
      const colours = ['#2c2828', '#f6efe9', '#c98e85', '#5d5555', '#e3d7d0'];
      const n = Math.round((w * h) / 28);
      for (let i = 0; i < n; i++) {
        out += `<circle cx="${x + rnd() * w}" cy="${y + rnd() * h}" r="${0.6 + rnd() * 1.6}" fill="${colours[Math.floor(rnd() * colours.length)]}" opacity="0.85"/>`;
      }
    } else if (kind === 'mirror') {
      out += `<polygon points="${x + w * 0.12},${y} ${x + w * 0.2},${y} ${x + w * 0.12},${y + h} ${x + w * 0.04},${y + h}" fill="#ffffff" opacity="0.75"/>`;
      out += `<polygon points="${x + w * 0.24},${y} ${x + w * 0.27},${y} ${x + w * 0.19},${y + h} ${x + w * 0.16},${y + h}" fill="#ffffff" opacity="0.6"/>`;
      out += `<polygon points="${x + w * 0.7},${y} ${x + w * 0.76},${y} ${x + w * 0.68},${y + h} ${x + w * 0.62},${y + h}" fill="#ffffff" opacity="0.55"/>`;
    }
    return out;
  }

  function glossSVG(x, y, w, h, strength) {
    const s = strength || 1;
    return `<rect x="${x}" y="${y + h * 0.1}" width="${w}" height="${h * 0.22}" fill="#ffffff" opacity="${0.45 * s}"/>` +
      `<polygon points="${x + w * 0.55},${y} ${x + w * 0.6},${y} ${x + w * 0.52},${y + h} ${x + w * 0.47},${y + h}" fill="#ffffff" opacity="${0.28 * s}"/>`;
  }

  function freshPatchSVG(m, x, y, w, h, uid, seedKey) {
    const rnd = mulberry32(seedFrom(seedKey + 'patch'));
    let out = `<rect x="${x}" y="${y - 2}" width="${w}" height="${h + 4}" fill="url(#${uid}-f)"/>`;
    if (m.freshKind === 'metal') {
      out += glossSVG(x, y, w, h, 1.4);
      out += `<polygon points="${x + w * 0.2},${y} ${x + w * 0.26},${y} ${x + w * 0.18},${y + h} ${x + w * 0.12},${y + h}" fill="#ffffff" opacity="0.5"/>`;
      for (let i = 0; i < 6; i++) {
        const yy = y + rnd() * h;
        out += `<line x1="${x}" y1="${yy}" x2="${x + w}" y2="${yy + (rnd() - 0.5)}" stroke="#ffffff" stroke-opacity="0.35" stroke-width="0.6"/>`;
      }
    } else if (m.freshKind === 'frosted') {
      out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffffff" opacity="0.35"/>`;
      for (let i = 0; i < 26; i++) {
        const yy = y + rnd() * h;
        out += `<line x1="${x + rnd() * w * 0.3}" y1="${yy}" x2="${x + w * (0.6 + rnd() * 0.4)}" y2="${yy + (rnd() - 0.5) * 3}" stroke="#ffffff" stroke-opacity="0.7" stroke-width="0.7"/>`;
      }
    } else if (m.freshKind === 'plastic') {
      for (let i = 0; i < 8; i++) {
        const yy = y + rnd() * h;
        out += `<line x1="${x + rnd() * w * 0.4}" y1="${yy}" x2="${x + w * (0.5 + rnd() * 0.5)}" y2="${yy + (rnd() - 0.5) * 2}" stroke="#bdb5a3" stroke-opacity="0.55" stroke-width="0.7"/>`;
      }
      // Écailles de peinture restées sur les bords de la zone poncée.
      for (let i = 0; i < 5; i++) {
        out += `<circle cx="${x + (rnd() < 0.5 ? rnd() * 5 : w - rnd() * 5)}" cy="${y + rnd() * h}" r="${1 + rnd() * 2}" fill="url(#${uid}-s)"/>`;
      }
    } else if (m.freshKind === 'wood') {
      out += textureSVG('wood', x, y, w, h, seedKey + 'fw');
    } else if (m.freshKind === 'granite') {
      out += textureSVG('granite', x, y, w, h, seedKey);
      for (let i = 0; i < 5; i++) {
        const yy = y + rnd() * h;
        out += `<line x1="${x + rnd() * w * 0.3}" y1="${yy}" x2="${x + w * (0.5 + rnd() * 0.5)}" y2="${yy}" stroke="#ffffff" stroke-opacity="0.3" stroke-width="0.6"/>`;
      }
    }
    return out;
  }

  /* o : { mat, x, y, w, h, bend, sanded (0..1), label, id, sampleId } */
  function barSVG(o) {
    const m = MATERIALS[o.mat];
    const uid = 'bar' + (++uidCounter);
    const { x, y, w, h } = o;
    const d = barPath(x, y, w, h, o.bend);
    const seedKey = o.sampleId || o.mat;
    const px = x + w * 0.3;
    const pw = w * 0.4;
    let out = `<g${o.id ? ` id="${o.id}"` : ''} class="lab-bar" data-uid="${uid}">`;
    out += `<defs>` +
      `<linearGradient id="${uid}-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${m.surface[0]}"/><stop offset="1" stop-color="${m.surface[1]}"/></linearGradient>` +
      `<linearGradient id="${uid}-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${m.fresh[0]}"/><stop offset="1" stop-color="${m.fresh[1]}"/></linearGradient>` +
      `<clipPath id="${uid}-c"><path id="${uid}-cp" d="${d}"/></clipPath>` +
      `<clipPath id="${uid}-pc"><rect id="${uid}-pr" x="${px}" y="${y - 30}" width="${pw * (o.sanded || 0)}" height="${h + 60}"/></clipPath>` +
      `</defs>`;
    out += `<path id="${uid}-body" d="${d}" fill="url(#${uid}-s)"/>`;
    out += `<g clip-path="url(#${uid}-c)">`;
    out += textureSVG(m.texture, x, y - 6, w, h + 12, seedKey);
    if (m.glossy) out += glossSVG(x, y, w, h, m.texture === 'mirror' ? 1.3 : 1);
    out += `<g clip-path="url(#${uid}-pc)">${freshPatchSVG(m, px, y, pw, h, uid, seedKey)}</g>`;
    out += `</g>`;
    out += `<path id="${uid}-outline" d="${d}" fill="none" stroke="#13243d" stroke-opacity="0.28" stroke-width="1.2"/>`;
    if (o.label) {
      const ty = y + h / 2;
      out += `<g class="lab-bar-tag"><rect x="${x + 7}" y="${ty - 10}" width="20" height="20" rx="6" fill="#ffffff" fill-opacity="0.94" stroke="#13243d" stroke-opacity="0.15"/>` +
        `<text x="${x + 17}" y="${ty + 4.6}" text-anchor="middle" font-size="13" font-weight="700" fill="#13243d">${o.label}</text></g>`;
    }
    out += `</g>`;
    return { svg: out, uid, d };
  }

  function thumbSVG(sampleId, opts) {
    const sm = sampleById(sampleId);
    const sanded = state.sanded[sampleId] ? 1 : 0;
    const vb = (opts && opts.big) ? { w: 200, h: 52 } : { w: 120, h: 34 };
    const pad = (opts && opts.big) ? 6 : 3;
    const bar = barSVG({ mat: sm.mat, x: pad, y: pad + 2, w: vb.w - pad * 2, h: vb.h - pad * 2 - 4, sanded, sampleId });
    return `<svg class="lab-thumb" viewBox="0 0 ${vb.w} ${vb.h}" aria-hidden="true" focusable="false">${bar.svg}</svg>`;
  }

  /* ===== Icônes des outils ===== */
  const ICONS = {
    luster: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="9" width="22" height="9" rx="2" fill="#e5c9a0" stroke="currentColor" stroke-width="1.6"/><rect x="4" y="18" width="24" height="5" rx="1.5" fill="#c58a4a" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="20.5" r=".8" fill="currentColor"/><circle cx="14" cy="20.5" r=".8" fill="currentColor"/><circle cx="19" cy="20.5" r=".8" fill="currentColor"/><circle cx="24" cy="20.5" r=".8" fill="currentColor"/></svg>',
    magnet: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 25V14a8 8 0 0 1 16 0v11" fill="none" stroke="#d64545" stroke-width="6"/><rect x="5" y="22" width="6" height="5" fill="#c7ced6" stroke="currentColor" stroke-width="1.2"/><rect x="21" y="22" width="6" height="5" fill="#c7ced6" stroke="currentColor" stroke-width="1.2"/></svg>',
    electric: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4a7 7 0 0 0-4 12.7c.8.6 1.2 1.4 1.2 2.3v1h5.6v-1c0-.9.4-1.7 1.2-2.3A7 7 0 0 0 16 4z" fill="#ffe27a" stroke="currentColor" stroke-width="1.6"/><rect x="13" y="20.5" width="6" height="4" rx="1" fill="#c7ced6" stroke="currentColor" stroke-width="1.4"/><path d="M14 11l2 3 2-3" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M16 25v3" stroke="currentColor" stroke-width="1.6"/></svg>',
    heat: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 9h16l-1.5 18a2 2 0 0 1-2 1.8h-9a2 2 0 0 1-2-1.8z" fill="#eaf4fa" stroke="currentColor" stroke-width="1.6"/><path d="M9.2 17h13.6l-.8 10a1.5 1.5 0 0 1-1.5 1.3h-9a1.5 1.5 0 0 1-1.5-1.3z" fill="#8fd0ee"/><path d="M13 7c-1-1.5 1-2.5 0-4M19 7c-1-1.5 1-2.5 0-4" fill="none" stroke="#e0763a" stroke-width="1.6" stroke-linecap="round"/></svg>',
    hammer: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="14.5" y="11" width="4" height="18" rx="1.5" fill="#d9b07a" stroke="currentColor" stroke-width="1.4" transform="rotate(35 16 16)"/><rect x="5" y="5" width="15" height="8" rx="1.5" fill="#6b7785" stroke="currentColor" stroke-width="1.4" transform="rotate(35 16 16)"/></svg>'
  };

  /* Illustrations au crayon (assets/lab-tool-*.webp, fond blanc fondu par
     mix-blend-mode dans le CSS). Les icônes SVG ci-dessus restent pour les
     en-têtes du tableau, trop petits pour un dessin. */
  function toolImg(id) {
    return `<img class="lab-tool-img" src="assets/lab-tool-${id}.webp" alt="" draggable="false">`;
  }

  /* ===== Étapes complètes (progression stricte, voir lab-engine.js) : 1 toutes
     les hypothèses, 2 toutes les observations notées, 3 toutes les
     conclusions. */
  function testsStarted() {
    return SAMPLES.some(s => Object.keys(state.done[s.id]).length > 0);
  }

  function stepComplete(n) {
    if (n === 1) return SAMPLES.every(s => state.hypotheses[s.id]);
    if (n === 2) return countNotes() === SAMPLES.length * TESTS.length;
    return conclusionsComplete();
  }

  function lockReason(n) {
    if (n === 1) return lab.L.missingHypotheses;
    if (n === 2) return LABELS.lockTests(SAMPLES.length * TESTS.length - countNotes());
    return lab.L.missingConclusions;
  }

  /* ===== Étape 1 : hypothèses ===== */
  function renderPredict() {
    const cards = SAMPLES.map(s => {
      const h = state.hypotheses[s.id];
      const opt = (val, label, extra) => `<button type="button" class="lab-choice ${extra || ''} ${h === val ? 'is-selected' : ''}" data-sample="${s.id}" data-hyp="${val}" aria-pressed="${h === val}">${label}</button>`;
      return `<div class="lab-predict-card ${h ? 'is-answered' : (lab.state.showMissing ? 'is-missing' : '')}">` +
        `<div class="lab-predict-head"><span class="lab-letter">${s.id}</span></div>` +
        `<div class="lab-predict-visual">${thumbSVG(s.id, { big: true })}</div>` +
        `<div class="lab-predict-choices">${opt('metal', LABELS.predictMetal)}${opt('not', LABELS.predictNot)}${opt('unsure', LABELS.predictUnsure, 'lab-choice-wide')}</div>` +
        `</div>`;
    }).join('');
    lab.body.innerHTML = `<div class="lab-predict">` +
      `<p class="lab-instructions">${gloss(LABELS.predictIntro)}</p>` +
      `<div class="lab-predict-grid">${cards}</div></div>`;

    lab.body.querySelectorAll('[data-hyp]').forEach(b => {
      b.addEventListener('click', () => {
        state.hypotheses[b.dataset.sample] = b.dataset.hyp;
        renderPredict();
        lab.renderStepper();
      });
    });

    // Hypothèses figées dès le premier test : on les relit, on ne les change plus.
    if (testsStarted()) {
      lab.body.querySelectorAll('[data-hyp]').forEach(b => lab.setLock(b, LABELS.lockHypothesesFixed, { icon: false }));
    }

    const n = SAMPLES.filter(s => state.hypotheses[s.id]).length;
    const missing = lab.state.showMissing && n < SAMPLES.length;
    lab.footer.innerHTML = lab.footerInfo(missing ? lab.L.missingHypotheses : LABELS.predictCount(n, SAMPLES.length), missing) +
      `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" id="lab-next">${LABELS.startTesting} →</button></div>`;
    const next = $('#lab-next');
    next.addEventListener('click', () => lab.goToStep(2));
    lab.setLock(next, n === SAMPLES.length ? null : lab.L.missingHypotheses, { missing: true, key: 'next' });
  }

  /* ===== Étape 2 : paillasse ===== */
  function countNotes() {
    return SAMPLES.reduce((acc, s) => acc + Object.keys(state.notes[s.id]).length, 0);
  }

  function renderTest() {
    lab.body.innerHTML = `<div class="lab-test">` +
      `<aside class="lab-tray" aria-label="${LABELS.trayTitle}"><h3 class="lab-panel-title">${LABELS.trayTitle}</h3><div class="lab-tray-grid" id="lab-tray"></div></aside>` +
      `<section class="lab-bench">` +
        `<div class="lab-scene-wrap" id="lab-scene-wrap"><div class="lab-scene" id="lab-scene"></div><button type="button" class="lab-speed" id="lab-speed" hidden>⏩ ${LABELS.speedUp}</button></div>` +
        `<p class="lab-caption" id="lab-caption" aria-live="polite"></p>` +
        `<div class="lab-tools" id="lab-tools"></div>` +
      `</section>` +
      `<aside class="lab-notebook" id="lab-notebook"></aside>` +
      `</div>`;

    renderTray();
    renderTools();
    renderNotebook();
    showScene(state.activeTest && state.current && state.done[state.current][state.activeTest] ? 'result' : 'base');
    renderTestFooter();
  }

  function renderTestFooter() {
    lab.footer.innerHTML = lab.footerInfo(LABELS.observations(countNotes(), SAMPLES.length * TESTS.length)) +
      `<div class="lab-footer-actions">` +
      `<button type="button" class="lab-btn lab-btn-ghost" id="lab-table-btn">${LABELS.resultsTable}</button>` +
      `<button type="button" class="lab-btn lab-btn-primary" id="lab-next">${LABELS.toConclude} →</button></div>`;
    $('#lab-table-btn').addEventListener('click', () => openSheet('table'));
    const next = $('#lab-next');
    next.addEventListener('click', () => lab.goToStep(3));
    lab.setLock(next, stepComplete(2) ? null : lockReason(2), { missing: true, key: 'next' });
    lab.renderStepper();
  }

  function renderTray() {
    const tray = $('#lab-tray');
    if (!tray) return;
    tray.innerHTML = SAMPLES.map(s => {
      const n = Object.keys(state.notes[s.id]).length;
      const dots = TESTS.map(t => `<i class="${state.notes[s.id][t.id] ? 'is-on' : ''}"></i>`).join('');
      const onBench = state.current === s.id;
      const missing = lab.state.showMissing && n < TESTS.length;
      return `<button type="button" class="lab-tray-item ${onBench ? 'is-on-bench' : ''} ${missing ? 'lab-is-missing' : ''}" data-sample="${s.id}" aria-label="Sample ${s.id}, ${n} of 5 observations">` +
        `<span class="lab-tray-letter">${s.id}</span>${thumbSVG(s.id)}<span class="lab-dots" aria-hidden="true">${dots}</span></button>`;
    }).join('');
    tray.querySelectorAll('.lab-tray-item').forEach(el => {
      lab.makeDraggable(el, {
        ghost: () => `<div class="lab-ghost-sample">${thumbSVG(el.dataset.sample, { big: true })}</div>`,
        targets: () => [$('#lab-scene-wrap')],
        onDrop: () => placeSample(el.dataset.sample),
        onTap: () => placeSample(el.dataset.sample)
      });
    });
  }

  function renderTools() {
    const tools = $('#lab-tools');
    if (!tools) return;
    tools.innerHTML = TESTS.map(t => {
      const done = state.current && state.done[state.current][t.id];
      const active = state.activeTest === t.id;
      return `<button type="button" class="lab-tool ${done ? 'is-done' : ''} ${active ? 'is-active' : ''}" data-test="${t.id}">` +
        `<span class="lab-tool-icon">${toolImg(t.id)}</span><span class="lab-tool-label">${LABELS.tests[t.id].tool}</span>` +
        (done ? '<span class="lab-tool-check" aria-hidden="true">✓</span>' : '') + `</button>`;
    }).join('');
    tools.querySelectorAll('.lab-tool').forEach(el => {
      lab.makeDraggable(el, {
        ghost: () => `<div class="lab-ghost-tool">${toolImg(el.dataset.test)}</div>`,
        targets: () => [$('#lab-scene-wrap')],
        onDrop: () => runTest(el.dataset.test),
        onTap: () => runTest(el.dataset.test)
      });
    });
  }

  function renderNotebook() {
    const nb = $('#lab-notebook');
    if (!nb) return;
    if (!state.current) {
      nb.innerHTML = `<h3 class="lab-panel-title">${LABELS.notebookTitle('…')}</h3><p class="lab-notebook-empty">${gloss(LABELS.notebookEmpty)}</p>`;
      return;
    }
    const id = state.current;
    const rows = TESTS.map(t => {
      const done = state.done[id][t.id];
      const val = state.notes[id][t.id];
      const opts = t.options.map(o => `<button type="button" class="lab-note-opt ${val === o ? 'is-selected' : ''}" data-test="${t.id}" data-val="${o}" aria-pressed="${val === o}">${LABELS.options[o]}</button>`).join('');
      return `<div class="lab-note-row ${done ? '' : 'is-locked'} ${done && !val ? 'is-pending' : ''} ${t.options.length > 2 ? 'is-four' : ''}" data-row="${t.id}">` +
        `<div class="lab-note-head"><span class="lab-note-icon">${toolImg(t.id)}</span><span class="lab-note-name">${LABELS.tests[t.id].name}</span>` +
        `${done ? '' : `<span class="lab-note-lock" title="${LABELS.notebookLocked}" aria-label="${LABELS.notebookLocked}">${lab.lockIcon}</span>`}</div>` +
        `<p class="lab-note-q">${gloss(LABELS.tests[t.id].question)}</p>` +
        `<div class="lab-note-opts">${opts}</div></div>`;
    }).join('');
    nb.innerHTML = `<h3 class="lab-panel-title">${LABELS.notebookTitle(id)}</h3><div class="lab-note-rows">${rows}</div>`;
    nb.querySelectorAll('.lab-note-row.is-locked .lab-note-opt').forEach(b => lab.setLock(b, LABELS.lockNotebook, { icon: false }));
    nb.querySelectorAll('.lab-note-opt').forEach(b => {
      b.addEventListener('click', () => {
        state.notes[id][b.dataset.test] = b.dataset.val;
        renderNotebook();
        renderTray();
        renderTestFooter();
      });
    });
  }

  function placeSample(id) {
    if (state.current === id) return;
    state.current = id;
    state.activeTest = null;
    renderTray();
    renderTools();
    renderNotebook();
    showScene('base');
  }

  function setCaption(html) {
    const c = $('#lab-caption');
    if (c) c.innerHTML = `<span>${html}</span>`;
  }

  function nudgeTray() {
    const tray = $('.lab-tray');
    if (!tray) return;
    tray.classList.remove('is-nudged');
    void tray.offsetWidth;
    tray.classList.add('is-nudged');
  }

  function runTest(testId) {
    if (!state.current) {
      setCaption(gloss(LABELS.captionNeedSample));
      nudgeTray();
      return;
    }
    state.activeTest = testId;
    renderTools();
    showScene('run');
  }

  /* ===== Scènes =====
     viewBox 640 × 360, paillasse à y = 296. */
  const BENCH_Y = 296;

  function benchSVG() {
    return `<defs><linearGradient id="bench-g" gradientUnits="userSpaceOnUse" x1="0" y1="${BENCH_Y}" x2="0" y2="${BENCH_Y + 64}"><stop offset="0" stop-color="#efe6d6"/><stop offset="1" stop-color="#e3d6c0"/></linearGradient></defs>` +
      // Plus large que le viewBox : sur un écran plus large ou plus haut que
      // la scène, la paillasse continue jusqu'aux bords au lieu de s'arrêter.
      `<rect x="-1000" y="${BENCH_Y}" width="2640" height="400" fill="url(#bench-g)"/>` +
      `<rect x="-1000" y="${BENCH_Y}" width="2640" height="3" fill="#d6c6aa"/>`;
  }

  function showScene(mode) {
    const token = lab.newScene();
    const host = $('#lab-scene');
    const speed = $('#lab-speed');
    if (!host) return;
    if (speed) speed.hidden = true;

    if (!state.current) {
      host.innerHTML = `<svg viewBox="0 0 640 360" class="lab-svg" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Empty bench">${benchSVG()}` +
        `<rect x="170" y="226" width="300" height="86" rx="18" fill="#ffffff" fill-opacity="0.6" stroke="#a87a20" stroke-opacity="0.55" stroke-width="2" stroke-dasharray="8 7"/>` +
        `<text x="320" y="265" text-anchor="middle" font-size="17" font-weight="600" fill="#866222">${LABELS.sceneEmpty}</text>` +
        `<text x="320" y="289" text-anchor="middle" font-size="13" fill="#5d728f">${LABELS.sceneEmptySub}</text></svg>`;
      setCaption(gloss(LABELS.captionEmpty));
      return;
    }

    const sm = sampleById(state.current);
    const test = state.activeTest;

    if (mode === 'base' || !test) {
      const bar = barSVG({ mat: sm.mat, x: 190, y: 262, w: 260, h: 34, sanded: state.sanded[sm.id] ? 1 : 0, label: sm.id, sampleId: sm.id });
      host.innerHTML = `<svg viewBox="0 0 640 360" class="lab-svg" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Sample ${sm.id} on the bench">${benchSVG()}` +
        `<ellipse cx="320" cy="${BENCH_Y + 2}" rx="140" ry="4" fill="#13243d" opacity="0.08"/>${bar.svg}</svg>`;
      setCaption(gloss(LABELS.captionReady(sm.id)));
      return;
    }

    const scenes = { luster: sceneLuster, magnet: sceneMagnet, electric: sceneElectric, heat: sceneHeat, hammer: sceneHammer };
    scenes[test](host, sm, token, mode === 'result');
  }

  function finishTest(token, sm, testId, captionHtml) {
    if (!lab.isScene(token)) return;
    state.done[sm.id][testId] = true;
    setCaption(captionHtml + (state.notes[sm.id][testId] ? '' : gloss(LABELS.captionRecord)));
    renderTools();
    renderNotebook();
    const row = $(`.lab-note-row[data-row="${testId}"]`);
    if (row && !state.notes[sm.id][testId]) {
      row.classList.add('is-highlight');
    }
  }

  /* --- Papier de verre : éclat --- */
  function sceneLuster(host, sm, token, instant) {
    const m = MATERIALS[sm.mat];
    const already = !!state.sanded[sm.id];
    const bar = barSVG({ mat: sm.mat, x: 190, y: 262, w: 260, h: 34, sanded: already || instant ? 1 : 0, label: sm.id, id: 'luster-bar', sampleId: sm.id });
    const patchCx = 320, patchCy = 279;
    const sparkles = m.isMetal ? [[300, 270], [338, 285], [322, 266]].map(([x, y], i) =>
      `<path class="lab-sparkle" style="animation-delay:${i * 0.35}s" d="M${x},${y - 7} L${x + 1.6},${y - 1.6} L${x + 7},${y} L${x + 1.6},${y + 1.6} L${x},${y + 7} L${x - 1.6},${y + 1.6} L${x - 7},${y} L${x - 1.6},${y - 1.6} Z" fill="#ffffff"/>`).join('') : '';
    const dustColour = m.freshKind === 'metal' ? '#9aa3ad' : m.fresh[1];
    const rnd = mulberry32(seedFrom(sm.id + 'dust'));
    let dust = '';
    for (let i = 0; i < 14; i++) dust += `<circle class="lab-dust" cx="${270 + rnd() * 100}" cy="${BENCH_Y - 1}" r="${0.8 + rnd() * 1.4}" fill="${dustColour}" opacity="0"/>`;

    host.innerHTML = `<svg viewBox="0 0 640 360" class="lab-svg" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Sandpaper test on sample ${sm.id}">${benchSVG()}` +
      `<ellipse cx="320" cy="${BENCH_Y + 2}" rx="140" ry="4" fill="#13243d" opacity="0.08"/>` +
      bar.svg +
      `<g id="dust">${dust}</g>` +
      `<g id="sparkles" opacity="0">${sparkles}</g>` +
      `<g id="sandpaper" transform="translate(500 150)">` +
        `<rect x="-48" y="-6" width="96" height="22" rx="5" fill="#e5c9a0" stroke="#13243d" stroke-opacity="0.35"/>` +
        `<rect x="-50" y="16" width="100" height="10" rx="2" fill="#c58a4a" stroke="#13243d" stroke-opacity="0.35"/>` +
        Array.from({ length: 14 }, (_, i) => `<circle cx="${-44 + i * 6.6}" cy="${21}" r="0.9" fill="#7a4f22"/>`).join('') +
      `</g>` +
      `<g id="loupe" opacity="0">` +
        `<defs><clipPath id="loupe-clip"><circle cx="530" cy="112" r="62"/></clipPath></defs>` +
        `<circle cx="530" cy="112" r="62" fill="#ffffff"/>` +
        `<g clip-path="url(#loupe-clip)"><use href="#luster-bar" transform="translate(530 112) scale(2.6) translate(${-patchCx} ${-patchCy})"/></g>` +
        `<circle cx="530" cy="112" r="62" fill="none" stroke="#4a6483" stroke-width="6"/>` +
        `<line x1="486" y1="156" x2="452" y2="190" stroke="#4a6483" stroke-width="10" stroke-linecap="round"/>` +
        `<line x1="${patchCx + 50}" y1="${patchCy - 22}" x2="480" y2="160" stroke="#4a6483" stroke-opacity="0.25" stroke-dasharray="4 5"/>` +
      `</g>` +
      `</svg>`;

    const sp = host.querySelector('#sandpaper');
    const patchRect = host.querySelector(`#${bar.uid}-pr`);
    const loupe = host.querySelector('#loupe');
    const spark = host.querySelector('#sparkles');
    const fullW = 260 * 0.4;
    const caption = gloss(CAPTIONS.luster[sm.mat]);

    if (instant) {
      sp.setAttribute('transform', 'translate(560 270)');
      loupe.setAttribute('opacity', '1');
      spark.setAttribute('opacity', '1');
      finishTest(token, sm, 'luster', caption);
      return;
    }

    setCaption(gloss('The [sandpaper] rubs the surface of the bar…'));
    const restY = 262 - 26;
    (async () => {
      let ok = await tween(token, 600, t => sp.setAttribute('transform', `translate(${lerp(500, 320, t)} ${lerp(150, restY, t)})`));
      if (!ok) return;
      const dusts = Array.from(host.querySelectorAll('.lab-dust'));
      ok = await tween(token, 2000, (t, raw) => {
        const x = 320 + Math.sin(raw * Math.PI * 8) * 44;
        sp.setAttribute('transform', `translate(${x} ${restY})`);
        patchRect.setAttribute('width', String(fullW * Math.min(1, raw * 1.15)));
        dusts.forEach((d, i) => d.setAttribute('opacity', String(Math.min(0.8, Math.max(0, raw * 1.6 - i * 0.06)))));
      }, ease.linear);
      if (!ok) return;
      ok = await tween(token, 500, t => sp.setAttribute('transform', `translate(${lerp(320, 560, t)} ${lerp(restY, 270, t)})`));
      if (!ok) return;
      state.sanded[sm.id] = true;
      renderTray();
      await tween(token, 400, t => { loupe.setAttribute('opacity', String(t)); spark.setAttribute('opacity', String(t)); });
      finishTest(token, sm, 'luster', caption);
    })();
  }

  /* --- Aimant --- */
  function magnetSVG() {
    return `<g id="magnet">` +
      `<path d="M-32,58 L-32,26 A32,32 0 0 1 32,26 L32,58" fill="none" stroke="#d64545" stroke-width="22"/>` +
      `<path d="M-32,58 L-32,26 A32,32 0 0 1 32,26 L32,58" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="4" transform="translate(-6 0)"/>` +
      `<rect x="-43" y="56" width="22" height="16" fill="#c7ced6" stroke="#13243d" stroke-opacity="0.3"/>` +
      `<rect x="21" y="56" width="22" height="16" fill="#c7ced6" stroke="#13243d" stroke-opacity="0.3"/>` +
      `<text x="-32" y="68" text-anchor="middle" font-size="10" font-weight="700" fill="#13243d">N</text>` +
      `<text x="32" y="68" text-anchor="middle" font-size="10" font-weight="700" fill="#13243d">S</text>` +
      `</g>`;
  }

  function sceneMagnet(host, sm, token, instant) {
    const m = MATERIALS[sm.mat];
    const bar = barSVG({ mat: sm.mat, x: 190, y: 262, w: 260, h: 34, sanded: state.sanded[sm.id] ? 1 : 0, label: sm.id, sampleId: sm.id });
    host.innerHTML = `<svg viewBox="0 0 640 360" class="lab-svg" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Magnet test on sample ${sm.id}">${benchSVG()}` +
      `<ellipse id="shadow" cx="320" cy="${BENCH_Y + 2}" rx="140" ry="4" fill="#13243d" opacity="0.08"/>` +
      `<g id="bar-move">${bar.svg}</g>` +
      `<g id="field" opacity="0">` +
        [0, 1, 2].map(i => `<path d="M${296 - i * 10},${236 - i * 3} Q320,${226 + i * 6} ${344 + i * 10},${236 - i * 3}" fill="none" stroke="#d64545" stroke-opacity="${0.45 - i * 0.12}" stroke-width="1.5" stroke-dasharray="3 4"/>`).join('') +
      `</g>` +
      `<g id="magnet-move" transform="translate(320 20)">${magnetSVG()}</g>` +
      `</svg>`;
    const mg = host.querySelector('#magnet-move');
    const bm = host.querySelector('#bar-move');
    const field = host.querySelector('#field');
    const shadow = host.querySelector('#shadow');
    // Bas des pôles = y + 72 ; dessus de la barrette = 262.
    const touchY = 262 - 72;
    const nearY = touchY - 26;

    if (instant) {
      if (m.magnetic) {
        mg.setAttribute('transform', `translate(320 ${nearY - 60})`);
        bm.setAttribute('transform', `translate(0 ${-(262 - (nearY + 72)) - 60})`);
        shadow.setAttribute('opacity', '0.03');
      }
      finishTest(token, sm, 'magnet', gloss(m.magnetic ? CAPTIONS.magnetYes : CAPTIONS.magnetNo));
      return;
    }

    setCaption(gloss('The [magnet] comes closer to the bar…'));
    (async () => {
      let ok = await tween(token, 900, t => mg.setAttribute('transform', `translate(320 ${lerp(20, nearY, t)})`));
      if (!ok) return;
      if (m.magnetic) {
        field.setAttribute('opacity', '1');
        ok = await tween(token, 160, t => bm.setAttribute('transform', `translate(0 ${lerp(0, -(262 - (nearY + 72)), t)})`), ease.in);
        if (!ok) return;
        field.setAttribute('opacity', '0');
        await wait(token, 300);
        ok = await tween(token, 700, t => {
          const dy = lerp(0, -60, t);
          mg.setAttribute('transform', `translate(320 ${nearY + dy})`);
          bm.setAttribute('transform', `translate(0 ${-(262 - (nearY + 72)) + dy})`);
          shadow.setAttribute('opacity', String(lerp(0.08, 0.03, t)));
        });
        if (!ok) return;
        finishTest(token, sm, 'magnet', gloss(CAPTIONS.magnetYes));
      } else {
        ok = await tween(token, 300, t => mg.setAttribute('transform', `translate(320 ${lerp(nearY, touchY, t)})`));
        if (!ok) return;
        await wait(token, 500);
        ok = await tween(token, 800, t => mg.setAttribute('transform', `translate(320 ${lerp(touchY, 40, t)})`));
        if (!ok) return;
        finishTest(token, sm, 'magnet', gloss(CAPTIONS.magnetNo));
      }
    })();
  }

  /* --- Circuit électrique --- */
  function sceneElectric(host, sm, token, instant) {
    const m = MATERIALS[sm.mat];
    const bar = barSVG({ mat: sm.mat, x: 190, y: 262, w: 260, h: 34, sanded: state.sanded[sm.id] ? 1 : 0, label: sm.id, sampleId: sm.id });
    const L = { x: 206, y: 262 };   // pince gauche, posée sur la barrette
    const R = { x: 434, y: 262 };
    const L0 = { x: 150, y: 150 };  // position de départ, en l'air
    const R0 = { x: 470, y: 150 };
    const battPlus = { x: 112, y: 222 };
    const battMinus = { x: 58, y: 222 };
    const bulbL = { x: 530, y: 258 };   // bornes du support d'ampoule
    const bulbR = { x: 570, y: 258 };

    const clipSVG = (id, colour) => `<g id="${id}"><path d="M-9,-16 L9,-16 L6,0 L-6,0 Z" fill="${colour}" stroke="#13243d" stroke-opacity="0.35"/>` +
      `<path d="M-6,0 L-2,6 L2,6 L6,0" fill="#c7ced6" stroke="#13243d" stroke-opacity="0.35"/></g>`;

    host.innerHTML = `<svg viewBox="0 0 640 360" class="lab-svg" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Electric circuit test on sample ${sm.id}">${benchSVG()}` +
      `<defs><radialGradient id="glow-g"><stop offset="0" stop-color="#ffe680" stop-opacity="0.95"/><stop offset="0.45" stop-color="#ffd84d" stop-opacity="0.45"/><stop offset="1" stop-color="#ffd84d" stop-opacity="0"/></radialGradient></defs>` +
      `<ellipse cx="320" cy="${BENCH_Y + 2}" rx="140" ry="4" fill="#13243d" opacity="0.08"/>` +
      bar.svg +
      // Pile
      `<g><rect x="40" y="230" width="90" height="66" rx="8" fill="#3d4a5c"/><rect x="40" y="230" width="90" height="16" rx="6" fill="#d4a030"/>` +
      `<rect x="${battMinus.x - 6}" y="${battMinus.y}" width="12" height="9" rx="2" fill="#9aa5b1"/><rect x="${battPlus.x - 6}" y="${battPlus.y}" width="12" height="9" rx="2" fill="#9aa5b1"/>` +
      `<text x="${battMinus.x}" y="270" text-anchor="middle" font-size="18" font-weight="700" fill="#ffffff">−</text><text x="${battPlus.x}" y="270" text-anchor="middle" font-size="18" font-weight="700" fill="#ffffff">+</text>` +
      `<text x="85" y="288" text-anchor="middle" font-size="9" fill="#ffffff" opacity="0.7">4.5 V</text></g>` +
      // Ampoule
      `<g><rect x="520" y="268" width="60" height="28" rx="6" fill="#6b7785"/><rect x="532" y="246" width="36" height="24" rx="4" fill="#9aa5b1"/>` +
      `<circle id="glow" cx="550" cy="196" r="70" fill="url(#glow-g)" opacity="0"/>` +
      `<path id="bulb-glass" d="M550,160 a28,28 0 0 0 -16,51 c3,2 5,6 5,10 v4 h22 v-4 c0,-4 2,-8 5,-10 a28,28 0 0 0 -16,-51 z" fill="#f4f7fa" stroke="#9aa5b1" stroke-width="2"/>` +
      `<path id="filament" d="M543,222 v-14 l3,-6 3,6 3,-6 3,6 v14" fill="none" stroke="#8a95a1" stroke-width="1.6"/>` +
      `<rect x="539" y="225" width="22" height="22" rx="3" fill="#c7ced6" stroke="#13243d" stroke-opacity="0.25"/>` +
      `<circle cx="${bulbL.x}" cy="${bulbL.y}" r="4" fill="#c7ced6" stroke="#13243d" stroke-opacity="0.4"/><circle cx="${bulbR.x}" cy="${bulbR.y}" r="4" fill="#c7ced6" stroke="#13243d" stroke-opacity="0.4"/></g>` +
      // Fils
      `<path id="wire-bulb" d="M${battPlus.x},${battPlus.y} C${battPlus.x + 10},70 560,60 ${bulbR.x + 40},150 S${bulbR.x + 22},${bulbR.y} ${bulbR.x},${bulbR.y}" fill="none" stroke="#d64545" stroke-width="4" stroke-linecap="round"/>` +
      `<path id="wire-r" fill="none" stroke="#d64545" stroke-width="4" stroke-linecap="round"/>` +
      `<path id="wire-l" fill="none" stroke="#2c3440" stroke-width="4" stroke-linecap="round"/>` +
      `<g id="clip-l">${clipSVG('cl', '#2c3440')}</g><g id="clip-r">${clipSVG('cr', '#d64545')}</g>` +
      `</svg>`;

    const wireL = host.querySelector('#wire-l');
    const wireR = host.querySelector('#wire-r');
    const clipL = host.querySelector('#clip-l');
    const clipR = host.querySelector('#clip-r');
    const glow = host.querySelector('#glow');
    const glass = host.querySelector('#bulb-glass');
    const filament = host.querySelector('#filament');

    function place(t) {
      const l = { x: lerp(L0.x, L.x, t), y: lerp(L0.y, L.y, t) };
      const r = { x: lerp(R0.x, R.x, t), y: lerp(R0.y, R.y, t) };
      clipL.setAttribute('transform', `translate(${l.x} ${l.y})`);
      clipR.setAttribute('transform', `translate(${r.x} ${r.y})`);
      wireL.setAttribute('d', `M${battMinus.x},${battMinus.y} C${battMinus.x},150 ${l.x - 40},${l.y - 90} ${l.x},${l.y - 16}`);
      wireR.setAttribute('d', `M${bulbL.x},${bulbL.y} C${bulbL.x - 40},${bulbL.y} ${r.x + 40},${r.y - 70} ${r.x},${r.y - 16}`);
    }

    function light(t) {
      glow.setAttribute('opacity', String(t));
      glass.setAttribute('fill', t > 0.05 ? '#fff6c2' : '#f4f7fa');
      filament.setAttribute('stroke', t > 0.05 ? '#f2a900' : '#8a95a1');
    }

    if (instant) {
      place(1);
      if (m.conducts) light(1);
      finishTest(token, sm, 'electric', gloss(m.conducts ? CAPTIONS.electricYes : CAPTIONS.electricNo));
      return;
    }

    place(0);
    setCaption(gloss('The two [clips] are connected to the ends of the bar…'));
    (async () => {
      let ok = await tween(token, 900, t => place(t));
      if (!ok) return;
      await wait(token, 250);
      if (m.conducts) {
        ok = await tween(token, 500, t => light(t), ease.out);
        if (!ok) return;
      } else {
        await wait(token, 600);
      }
      finishTest(token, sm, 'electric', gloss(m.conducts ? CAPTIONS.electricYes : CAPTIONS.electricNo));
    })();
  }

  /* --- Eau chaude et cire : conductivité thermique --- */
  function sceneHeat(host, sm, token, instant) {
    const m = MATERIALS[sm.mat];
    const ox = 205, oy = 272, angle = -68, bw = 240, bh = 30;
    const rad = angle * Math.PI / 180;
    const tip = { x: ox + (bw + 6) * Math.cos(rad), y: oy + (bw + 6) * Math.sin(rad) };
    const clampAt = { x: ox + 190 * Math.cos(rad), y: oy + 190 * Math.sin(rad) };
    const bar = barSVG({ mat: sm.mat, x: 0, y: -bh / 2, w: bw, h: bh, sanded: state.sanded[sm.id] ? 1 : 0, sampleId: sm.id });

    host.innerHTML = `<svg viewBox="0 0 640 360" class="lab-svg" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Heat test on sample ${sm.id}">${benchSVG()}` +
      `<defs>` +
        `<linearGradient id="heat-g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${bw}" y2="0">` +
          `<stop id="hs0" offset="0" stop-color="#ff5a1f" stop-opacity="0.7"/>` +
          `<stop id="hs1" offset="0" stop-color="#ff8a3d" stop-opacity="0.35"/>` +
          `<stop id="hs2" offset="0" stop-color="#ffb070" stop-opacity="0"/>` +
        `</linearGradient>` +
      `</defs>` +
      // Statif et pince
      `<rect x="350" y="288" width="90" height="8" rx="3" fill="#6b7785"/><rect x="387" y="70" width="7" height="220" rx="3" fill="#9aa5b1"/>` +
      `<rect x="${clampAt.x}" y="${clampAt.y - 4}" width="${390 - clampAt.x}" height="8" rx="3" fill="#9aa5b1"/>` +
      // Plaque chauffante
      `<rect x="130" y="282" width="180" height="14" rx="4" fill="#4a5563"/><circle cx="292" cy="289" r="3" fill="#ff5a1f"/>` +
      // Bécher (arrière)
      `<path d="M150,140 L150,272 Q150,282 160,282 L280,282 Q290,282 290,272 L290,140" fill="#eef6fb" fill-opacity="0.55"/>` +
      `<path d="M152,198 Q185,192 220,198 T288,198 L288,272 Q288,280 280,280 L160,280 Q152,280 152,272 Z" fill="#8fd0ee" opacity="0.75"/>` +
      // Barrette
      `<g transform="translate(${ox} ${oy}) rotate(${angle})">${bar.svg}` +
        `<path d="${bar.d}" fill="url(#heat-g)"/>` +
        `<ellipse id="wax" cx="${bw + 4}" cy="0" rx="9" ry="13" fill="#f7f0dc" stroke="#d8cdb0" stroke-width="1.4"/>` +
      `</g>` +
      // Bécher (avant : eau sur la barrette, paroi, graduations)
      `<path d="M152,198 Q185,192 220,198 T288,198 L288,272 Q288,280 280,280 L160,280 Q152,280 152,272 Z" fill="#8fd0ee" opacity="0.35"/>` +
      `<path d="M146,138 L150,140 L150,272 Q150,284 162,284 L278,284 Q290,284 290,272 L290,140 L294,138" fill="none" stroke="#7f98a8" stroke-width="2.5" stroke-linejoin="round"/>` +
      [0, 1, 2, 3].map(i => `<line x1="152" y1="${170 + i * 26}" x2="166" y2="${170 + i * 26}" stroke="#7f98a8" stroke-width="1.5"/>`).join('') +
      `<g class="lab-steam">` +
        [170, 205, 245].map((x, i) => `<path style="animation-delay:${i * 0.6}s" d="M${x},186 c-6,-10 6,-16 0,-26 c-6,-10 6,-16 0,-26" fill="none" stroke="#a9b8c4" stroke-width="2.5" stroke-linecap="round"/>`).join('') +
      `</g>` +
      `<g id="drip" opacity="0"><path d="M0,-6 C3,-1 4,2 4,4 a4,4 0 0 1 -8,0 c0,-2 1,-5 4,-10z" fill="#f7f0dc" stroke="#d8cdb0"/></g>` +
      `<ellipse id="puddle" cx="${tip.x}" cy="${BENCH_Y + 1}" rx="0" ry="3" fill="#f7f0dc" stroke="#d8cdb0"/>` +
      // Chronomètre
      `<g transform="translate(480 26)"><rect width="128" height="64" rx="14" fill="#ffffff" stroke="#13243d" stroke-opacity="0.15"/>` +
        `<rect x="54" y="-7" width="20" height="9" rx="3" fill="#9aa5b1"/>` +
        `<text x="64" y="26" text-anchor="middle" font-size="10" fill="#5d728f" letter-spacing="1">STOPWATCH</text>` +
        `<text id="clock" x="64" y="52" text-anchor="middle" font-size="24" font-weight="700" fill="#13243d" font-variant-numeric="tabular-nums">0:00</text></g>` +
      `</svg>`;

    const hs1 = host.querySelector('#hs1');
    const hs2 = host.querySelector('#hs2');
    const wax = host.querySelector('#wax');
    const drip = host.querySelector('#drip');
    const puddle = host.querySelector('#puddle');
    const clock = host.querySelector('#clock');
    const speedBtn = $('#lab-speed');

    function heatFront(p) {
      const f = Math.max(0, Math.min(1, p));
      hs1.setAttribute('offset', String(f * 0.85));
      hs2.setAttribute('offset', String(Math.min(1, f + 0.08)));
    }

    function meltWax(t) {
      wax.setAttribute('rx', String(lerp(9, 6, t)));
      wax.setAttribute('ry', String(lerp(13, 4, t)));
      wax.setAttribute('opacity', String(lerp(1, 0.75, t)));
    }

    const end = m.heat == null ? HEAT_LIMIT : m.heat;
    const caption = m.heat == null ? gloss(CAPTIONS.heatNot) : gloss(CAPTIONS.heatMelted(formatTime(m.heat)));

    if (instant) {
      heatFront(m.heat == null ? 0.12 : 1);
      clock.textContent = formatTime(end);
      if (m.heat != null) { meltWax(1); puddle.setAttribute('rx', '9'); }
      finishTest(token, sm, 'heat', caption);
      return;
    }

    setCaption(gloss(CAPTIONS.heatRunning));
    let rate = HEAT_RATE;
    speedBtn.hidden = false;
    speedBtn.classList.remove('is-active');
    speedBtn.onclick = () => {
      rate = rate === HEAT_RATE ? HEAT_RATE_FAST : HEAT_RATE;
      speedBtn.classList.toggle('is-active', rate !== HEAT_RATE);
    };

    (async () => {
      let sim = 0;
      let last = performance.now();
      const ok = await new Promise(resolve => {
        function frame(now) {
          if (!lab.isScene(token)) { resolve(false); return; }
          const dt = Math.min(0.1, (now - last) / 1000);
          last = now;
          sim = Math.min(end, sim + dt * (reduceMotion ? HEAT_RATE_FAST * 3 : rate));
          clock.textContent = formatTime(sim);
          if (m.heat == null) heatFront(0.12 * Math.min(1, sim / 120));
          else heatFront(sim / m.heat);
          if (sim >= end) resolve(true);
          else requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
      if (!ok) return;
      speedBtn.hidden = true;
      if (m.heat != null) {
        let fine = await tween(token, 500, t => meltWax(t));
        if (!fine) return;
        drip.setAttribute('opacity', '1');
        fine = await tween(token, 650, t => drip.setAttribute('transform', `translate(${tip.x} ${lerp(tip.y + 6, BENCH_Y - 3, t)})`), ease.in);
        if (!fine) return;
        drip.setAttribute('opacity', '0');
        await tween(token, 250, t => puddle.setAttribute('rx', String(lerp(0, 9, t))));
      }
      finishTest(token, sm, 'heat', caption);
    })();
  }

  /* --- Marteau : malléabilité --- */
  function sceneHammer(host, sm, token, instant) {
    const m = MATERIALS[sm.mat];
    const X = 190, Y = 228, W = 260, H = 34;
    const pivot = { x: 572, y: 211 };
    const kind = m.hammer;

    // Deux moitiés, découpées par un bord en zigzag au centre.
    const zig = kind === 'split'
      ? [[320, Y - 4], [317, Y + 8], [323, Y + 17], [318, Y + 26], [321, Y + H + 4]]
      : [[322, Y - 4], [314, Y + 9], [326, Y + 16], [316, Y + 25], [324, Y + H + 4]];
    const zigPts = zig.map(p => p.join(',')).join(' ');
    const leftPoly = `${X - 10},${Y - 10} ${zig[0][0]},${Y - 10} ${zigPts} ${zig[zig.length - 1][0]},${Y + H + 10} ${X - 10},${Y + H + 10}`;
    const rightPoly = `${zig[0][0]},${Y - 10} ${X + W + 10},${Y - 10} ${X + W + 10},${Y + H + 10} ${zig[zig.length - 1][0]},${Y + H + 10} ${zigPts.split(' ').reverse().join(' ')}`;

    const whole = barSVG({ mat: sm.mat, x: X, y: Y, w: W, h: H, label: sm.id, id: 'hm-bar', sampleId: sm.id });
    const broken = kind === 'crack' || kind === 'shatter' || kind === 'split';
    const halfL = broken ? barSVG({ mat: sm.mat, x: X, y: Y, w: W, h: H, label: sm.id, sampleId: sm.id }) : null;
    const halfR = broken ? barSVG({ mat: sm.mat, x: X, y: Y, w: W, h: H, sampleId: sm.id }) : null;

    const rnd = mulberry32(seedFrom(sm.id + 'shards'));
    let shards = '';
    if (kind === 'shatter' || kind === 'bounce') {
      const n = kind === 'shatter' ? 12 : 5;
      for (let i = 0; i < n; i++) {
        const s = kind === 'shatter' ? 3 + rnd() * 6 : 1.2 + rnd() * 1.5;
        const fill = kind === 'shatter' ? '#dbe9f0' : MATERIALS[sm.mat].surface[1];
        shards += `<polygon class="lab-shard" data-vx="${(rnd() - 0.5) * 220}" data-vy="${-60 - rnd() * 120}" points="0,${-s} ${s},${s * 0.6} ${-s * 0.8},${s * 0.5}" fill="${fill}" stroke="#7f98a8" stroke-opacity="0.6" transform="translate(320 ${Y})" opacity="0"/>`;
      }
    }

    host.innerHTML = `<svg viewBox="0 0 640 360" class="lab-svg" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Hammer test on sample ${sm.id}">${benchSVG()}` +
      `<defs>` +
        (broken ? `<clipPath id="half-l"><polygon points="${leftPoly}"/></clipPath><clipPath id="half-r"><polygon points="${rightPoly}"/></clipPath>` : '') +
      `</defs>` +
      // Cales en bois
      `<rect x="200" y="262" width="46" height="34" rx="4" fill="#d7b98e" stroke="#13243d" stroke-opacity="0.2"/>` +
      `<rect x="394" y="262" width="46" height="34" rx="4" fill="#d7b98e" stroke="#13243d" stroke-opacity="0.2"/>` +
      `<g id="whole">${whole.svg}</g>` +
      (broken ? `<g id="hl" opacity="0"><g clip-path="url(#half-l)">${halfL.svg}</g></g><g id="hr" opacity="0"><g clip-path="url(#half-r)">${halfR.svg}</g></g>` : '') +
      `<g id="cracks" opacity="0">` +
        (kind === 'shatter' ? [[-40, -14], [36, -16], [-30, 18], [44, 14], [0, -18]].map(([dx, dy]) => `<line x1="320" y1="${Y + 17}" x2="${320 + dx}" y2="${Y + 17 + dy}" stroke="#ffffff" stroke-width="1.4"/>`).join('') : '') +
      `</g>` +
      `<g id="shards">${shards}</g>` +
      `<g id="impact" opacity="0">` +
        [[-30, -14], [-36, 0], [30, -14], [36, 0]].map(([dx, dy]) => `<line x1="${320 + dx * 0.6}" y1="${Y - 6 + dy * 0.4}" x2="${320 + dx}" y2="${Y - 6 + dy}" stroke="#d4a030" stroke-width="3" stroke-linecap="round"/>`).join('') +
      `</g>` +
      `<g id="hammer" transform="rotate(42 ${pivot.x} ${pivot.y})">` +
        `<rect x="352" y="${pivot.y - 7}" width="${pivot.x - 352 + 10}" height="14" rx="6" fill="#d9b07a" stroke="#13243d" stroke-opacity="0.3"/>` +
        `<rect x="296" y="${Y - 40}" width="62" height="40" rx="6" fill="#6b7785" stroke="#13243d" stroke-opacity="0.35"/>` +
        `<rect x="296" y="${Y - 40}" width="62" height="9" rx="4" fill="#ffffff" opacity="0.18"/>` +
      `</g>` +
      `</svg>`;

    const hammer = host.querySelector('#hammer');
    const wholeG = host.querySelector('#whole');
    const impact = host.querySelector('#impact');
    const cracks = host.querySelector('#cracks');
    const hl = host.querySelector('#hl');
    const hr = host.querySelector('#hr');
    const shardEls = Array.from(host.querySelectorAll('.lab-shard'));
    const bendMax = 13 * (m.bendAmount || 1);

    const setAngle = a => hammer.setAttribute('transform', `rotate(${a} ${pivot.x} ${pivot.y})`);

    function setBend(b) {
      const d = barPath(X, Y, W, H, b);
      ['body', 'outline', 'cp'].forEach(part => {
        const el = host.querySelector(`#${whole.uid}-${part}`);
        if (el) el.setAttribute('d', d);
      });
    }

    function breakApart(t) {
      wholeG.setAttribute('opacity', '0');
      hl.setAttribute('opacity', '1');
      hr.setAttribute('opacity', '1');
      const a = (kind === 'split' ? 16 : kind === 'crack' ? 13 : 20) * t;
      hl.setAttribute('transform', `rotate(${a} 246 262)`);
      hr.setAttribute('transform', `rotate(${-a} 394 262)`);
    }

    function flyShards(t) {
      shardEls.forEach(s => {
        const vx = Number(s.dataset.vx), vy = Number(s.dataset.vy);
        const x = 320 + vx * t;
        const y = Y + vy * t + 260 * t * t;
        s.setAttribute('transform', `translate(${x} ${Math.min(BENCH_Y - 2, y)}) rotate(${t * 300})`);
        s.setAttribute('opacity', String(kind === 'bounce' ? 1 - t : 1));
      });
    }

    const captionKey = kind === 'dent' ? (m.bendAmount < 0.7 ? 'dentSmall' : 'dent') : kind;
    const caption = gloss(CAPTIONS.hammer[captionKey]);

    if (instant) {
      setAngle(30);
      if (kind === 'dent') setBend(bendMax);
      if (broken) breakApart(1);
      if (kind === 'shatter') { cracks.setAttribute('opacity', '1'); flyShards(1); }
      finishTest(token, sm, 'hammer', caption);
      return;
    }

    setCaption(gloss('The [hammer] comes down on the middle of the bar…'));
    (async () => {
      let ok = await tween(token, 450, t => setAngle(lerp(42, 0, t)), ease.in);
      if (!ok) return;
      impact.setAttribute('opacity', '1');
      if (kind === 'dent') {
        ok = await tween(token, 220, t => setBend(bendMax * t), ease.out);
        if (!ok) return;
      } else if (kind === 'bounce') {
        shardEls.forEach(s => s.setAttribute('opacity', '1'));
        tween(token, 600, t => flyShards(t), ease.linear);
        ok = await tween(token, 260, t => setAngle(lerp(0, 22, t)), ease.out);
        if (!ok) return;
        ok = await tween(token, 200, t => setAngle(lerp(22, 12, t)), ease.inOut);
        if (!ok) return;
      } else {
        if (kind === 'shatter') cracks.setAttribute('opacity', '1');
        await wait(token, 120);
        tween(token, 700, t => flyShards(t), ease.linear);
        ok = await tween(token, 380, t => breakApart(t), ease.in);
        if (!ok) return;
      }
      await wait(token, 150);
      impact.setAttribute('opacity', '0');
      ok = await tween(token, 500, t => setAngle(lerp(kind === 'bounce' ? 12 : 0, 30, t)));
      if (!ok) return;
      finishTest(token, sm, 'hammer', caption);
    })();
  }

  /* ===== Étape 3 : conclusions ===== */
  function resultsTableHTML(withConclusions) {
    const head = `<tr><th scope="col">${LABELS.colSample}</th>` +
      TESTS.map(t => `<th scope="col"><span class="lab-th-icon">${ICONS[t.id]}</span>${LABELS.tests[t.id].name}</th>`).join('') +
      (withConclusions ? `<th scope="col">${LABELS.colMetal}</th><th scope="col">${LABELS.colWhich}</th>` : '') + `</tr>`;
    const rows = SAMPLES.map(s => {
      const cells = TESTS.map(t => {
        const v = state.notes[s.id][t.id];
        return `<td class="${v ? '' : 'is-empty'}">${v ? LABELS.options[v] : LABELS.notRecorded}</td>`;
      }).join('');
      let concl = '';
      if (withConclusions) {
        const c = state.conclusions[s.id];
        const metalOpts = METAL_IDS.map(mid => `<option value="${mid}" ${c.metal === mid ? 'selected' : ''}>${LABELS.metals[mid]}</option>`).join('');
        concl = `<td><div class="lab-yesno">` +
          `<button type="button" class="lab-choice ${c.isMetal === true ? 'is-selected' : ''}" data-concl="${s.id}" data-val="yes" aria-pressed="${c.isMetal === true}">${LABELS.yes}</button>` +
          `<button type="button" class="lab-choice ${c.isMetal === false ? 'is-selected' : ''}" data-concl="${s.id}" data-val="no" aria-pressed="${c.isMetal === false}">${LABELS.no}</button></div></td>` +
          `<td><select class="lab-select" data-metal="${s.id}" aria-label="${LABELS.colWhich} ${s.id}">` +
          `<option value="">${c.isMetal === false ? '—' : LABELS.choose}</option>${metalOpts}</select></td>`;
      }
      const missing = withConclusions && lab.state.showMissing && !conclusionDone(s);
      return `<tr class="${missing ? 'is-missing' : ''}"><th scope="row"><span class="lab-row-sample"><span class="lab-letter lab-letter-sm">${s.id}</span>${thumbSVG(s.id)}</span></th>${cells}${concl}</tr>`;
    }).join('');
    return `<table class="lab-table ${withConclusions ? 'has-conclusions' : ''}"><thead>${head}</thead><tbody>${rows}</tbody></table>`;
  }

  function conclusionDone(s) {
    const c = state.conclusions[s.id];
    return c.isMetal === false || (c.isMetal === true && !!c.metal);
  }

  function conclusionsComplete() {
    return SAMPLES.every(conclusionDone);
  }

  function renderConclude() {
    lab.body.innerHTML = `<div class="lab-conclude"><p class="lab-instructions">${gloss(LABELS.concludeIntro)}</p>` +
      `<div class="lab-table-wrap">${resultsTableHTML(true)}</div></div>`;

    lab.body.querySelectorAll('[data-concl]').forEach(b => {
      b.addEventListener('click', () => {
        const c = state.conclusions[b.dataset.concl];
        c.isMetal = b.dataset.val === 'yes';
        if (!c.isMetal) c.metal = '';
        renderConclude();
      });
    });
    lab.body.querySelectorAll('[data-metal]').forEach(sel => {
      const isMetal = state.conclusions[sel.dataset.metal].isMetal;
      if (isMetal !== true) lab.setLock(sel, isMetal === false ? LABELS.lockNotMetal : LABELS.lockWhichMetal);
      sel.addEventListener('change', () => {
        state.conclusions[sel.dataset.metal].metal = sel.value;
        if (lab.state.showMissing) sel.closest('tr').classList.toggle('is-missing', !conclusionDone(sampleById(sel.dataset.metal)));
        renderConcludeFooter();
      });
    });
    renderConcludeFooter();
  }

  function renderConcludeFooter() {
    const ready = conclusionsComplete();
    const missing = lab.state.showMissing && !ready;
    lab.footer.innerHTML = `<button type="button" class="lab-btn lab-btn-ghost" id="lab-back">← ${LABELS.backToLab}</button>` +
      (missing ? lab.footerInfo(lab.L.missingConclusions, true) : '') +
      `<div class="lab-footer-actions">` +
      `<button type="button" class="lab-btn lab-btn-ghost" id="lab-ref">${LABELS.referenceSheet}</button>` +
      `<button type="button" class="lab-btn lab-btn-primary" id="lab-check">${LABELS.checkConclusions}</button></div>`;
    $('#lab-back').addEventListener('click', () => lab.goToStep(2));
    $('#lab-ref').addEventListener('click', () => openSheet('reference'));
    const check = $('#lab-check');
    check.addEventListener('click', () => lab.finish());
    lab.setLock(check, ready ? null : lab.L.missingConclusions, { missing: true, key: 'check' });
    lab.renderStepper();
  }

  /* ===== Étape 4 : correction ===== */
  function isCorrect(s) {
    const m = MATERIALS[s.mat];
    const c = state.conclusions[s.id];
    if (c.isMetal !== m.isMetal) return false;
    return !m.isMetal || c.metal === m.metal;
  }

  function answerLabel(c) {
    if (c.isMetal === true) return LABELS.metals[c.metal] || '—';
    if (c.isMetal === false) return LABELS.notMetal;
    return '—';
  }

  function correctLabel(s) {
    const m = MATERIALS[s.mat];
    return m.isMetal ? LABELS.metals[m.metal] : LABELS.notMetal;
  }

  function hypothesisVerdict(s, against) {
    const h = state.hypotheses[s.id];
    if (h === 'unsure' || !h) return 'none';
    const isMetal = against === 'student' ? state.conclusions[s.id].isMetal : MATERIALS[s.mat].isMetal;
    return (h === 'metal') === isMetal ? 'confirmed' : 'rejected';
  }

  function hypothesisText(h) {
    return h === 'metal' ? LABELS.predictMetal : h === 'not' ? LABELS.predictNot : LABELS.predictUnsure;
  }

  function score() {
    return SAMPLES.filter(isCorrect).length;
  }

  function renderCheck() {
    const sc = score();
    const confirmed = SAMPLES.filter(s => hypothesisVerdict(s, 'truth') === 'confirmed').length;
    const list = SAMPLES.map(s => {
      const ok = isCorrect(s);
      return `<button type="button" class="lab-result-row ${ok ? 'is-ok' : 'is-ko'} ${state.selectedResult === s.id ? 'is-selected' : ''}" data-result="${s.id}">` +
        `<span class="lab-letter lab-letter-sm">${s.id}</span>${thumbSVG(s.id)}` +
        `<span class="lab-result-answer">${answerLabel(state.conclusions[s.id])}</span>` +
        `<span class="lab-result-correct">${ok ? '' : correctLabel(s)}</span>` +
        `<span class="lab-result-mark" aria-label="${ok ? 'correct' : 'incorrect'}">${ok ? '✓' : '✗'}</span></button>`;
    }).join('');

    lab.body.innerHTML = `<div class="lab-check">` +
      `<div class="lab-check-left">` +
        `<div class="lab-score"><span class="lab-score-num">${sc}<small> / ${SAMPLES.length}</small></span><span class="lab-score-label">${LABELS.scoreLabel}</span>` +
        `<span class="lab-score-sub">${LABELS.hypothesesLabel(confirmed, SAMPLES.length)}</span></div>` +
        `<div class="lab-result-head"><span></span><span>${LABELS.colYourAnswer}</span><span>${LABELS.colCorrect}</span><span></span></div>` +
        `<div class="lab-result-list">${list}</div>` +
      `</div>` +
      `<div class="lab-check-detail" id="lab-detail" aria-live="polite"></div>` +
      `</div>`;

    lab.body.querySelectorAll('[data-result]').forEach(b => {
      b.addEventListener('click', () => {
        state.selectedResult = b.dataset.result;
        lab.body.querySelectorAll('[data-result]').forEach(x => x.classList.toggle('is-selected', x === b));
        renderDetail();
      });
    });
    renderDetail();
    lab.checkFooter();
  }

  function renderDetail() {
    const s = sampleById(state.selectedResult);
    const m = MATERIALS[s.mat];
    const ok = isCorrect(s);
    const verdict = hypothesisVerdict(s, 'truth');
    const verdictText = verdict === 'confirmed' ? LABELS.hypothesisConfirmed : verdict === 'rejected' ? LABELS.hypothesisRejected : LABELS.hypothesisNone;
    const checks = TESTS.map(t => {
      const v = state.notes[s.id][t.id];
      const exp = expectedValue(s.mat, t.id);
      const good = v === exp;
      return `<li class="${v ? (good ? 'is-ok' : 'is-ko') : 'is-empty'}"><span class="lab-check-icon">${toolImg(t.id)}</span>` +
        `<span class="lab-check-name">${LABELS.tests[t.id].name}</span>` +
        `<span class="lab-check-val">${v ? LABELS.options[v] : LABELS.notRecorded}</span>` +
        `<span class="lab-check-exp">${good ? '✓' : LABELS.options[exp]}</span></li>`;
    }).join('');
    const checkHead = `<li class="lab-check-headrow"><span></span><span></span><span>${LABELS.youWrote}</span><span>${LABELS.expected}</span></li>`;
    $('#lab-detail').innerHTML =
      `<div class="lab-detail-head"><span class="lab-letter">${s.id}</span><div><h3>${m.label}</h3>` +
      `<p class="lab-detail-verdict ${ok ? 'is-ok' : 'is-ko'}">${ok ? '✓ ' + correctLabel(s) : `✗ ${LABELS.colYourAnswer}: ${answerLabel(state.conclusions[s.id])}`}</p></div>` +
      `<div class="lab-detail-thumb">${thumbSVG(s.id, { big: true })}</div></div>` +
      `<p class="lab-detail-hyp"><strong>${LABELS.youPredicted}:</strong> ${hypothesisText(state.hypotheses[s.id])} → <span class="lab-verdict-${verdict}">${verdictText}</span></p>` +
      `<p class="lab-detail-expl">${explanation(s)}</p>` +
      `<h4 class="lab-detail-sub">${LABELS.notebookCheck}</h4><ul class="lab-check-list">${checkHead}${checks}</ul>`;
  }

  /* ===== Fiche de référence et tableau de résultats (panneau superposé) ===== */
  function openSheet(kind) {
    let inner = '';
    if (kind === 'reference') {
      const rows = REFERENCE.map(r => `<tr><th scope="row">${LABELS.metals[r.metal]}</th><td><span class="lab-swatch" style="background:linear-gradient(${MATERIALS[r.metal].fresh[0]},${MATERIALS[r.metal].fresh[1]})"></span>${r.colour}</td><td>${r.magnet}</td><td>${r.heat}</td></tr>`).join('');
      inner = `<h3 class="lab-sheet-title">${LABELS.refTitle}</h3><p class="lab-sheet-intro">${gloss(LABELS.refIntro)}</p>` +
        `<table class="lab-table lab-ref-table"><thead><tr><th scope="col">${LABELS.refColMetal}</th><th scope="col">${gloss(LABELS.refColColour)}</th><th scope="col">${gloss(LABELS.refColMagnet)}</th><th scope="col">${gloss(LABELS.refColHeat)}</th></tr></thead><tbody>${rows}</tbody></table>`;
    } else {
      inner = `<h3 class="lab-sheet-title">${LABELS.tableTitle}</h3><p class="lab-sheet-intro">${gloss(LABELS.tableIntro)}</p>` +
        `<div class="lab-table-wrap">${resultsTableHTML(false)}</div>`;
    }
    lab.openSheet(inner, kind === 'reference' ? LABELS.refTitle : LABELS.tableTitle);
  }

  /* ===== Rapport imprimable : contenu des 7 sections de la fiche outil FO3
     (en-tête, numérotation et mise en page : cadre commun) ===== */
  /* Les erreurs passent par mark() (lab-engine.js) : observation fausse dans
     le tableau, identification fausse dans la conclusion. */
  function buildReport(mark) {
    const R = LABELS.report;
    const hypRows = SAMPLES.map(s => `<td><strong>${s.id}</strong><br>${hypothesisText(state.hypotheses[s.id])}</td>`).join('');
    const obsHead = `<tr><th>${LABELS.colSample}</th>${TESTS.map(t => `<th>${LABELS.tests[t.id].name}</th>`).join('')}</tr>`;
    const obsRows = SAMPLES.map(s => `<tr><th>${s.id}</th>${TESTS.map(t => {
      const v = state.notes[s.id][t.id];
      const exp = expectedValue(s.mat, t.id);
      const text = v ? LABELS.options[v] : '—';
      return `<td>${v === exp ? text : mark(text, R.noteObs(s.id, LABELS.tests[t.id].name.toLowerCase(), text, LABELS.options[exp]), { box: true })}</td>`;
    }).join('')}</tr>`).join('');
    // Échantillon de la conclusion, marqué s'il est mal identifié.
    const conclItem = (s, text) => {
      if (isCorrect(s)) return text;
      const m = MATERIALS[s.mat];
      return mark(text, m.isMetal ? R.noteMetal(s.id, LABELS.metals[m.metal].toLowerCase()) : R.noteNotMetal(s.id, m.label.toLowerCase()));
    };
    const interp = SAMPLES.map(s => {
      const c = state.conclusions[s.id];
      const concl = c.isMetal ? `a metal (${LABELS.metals[c.metal].toLowerCase()})` : 'not a metal';
      const v = hypothesisVerdict(s, 'student');
      if (v === 'none') return `<li>${R.interpretationUnsure(s.id, concl)}</li>`;
      const verdict = v === 'confirmed' ? LABELS.hypothesisConfirmed : LABELS.hypothesisRejected;
      return `<li>${R.interpretationLine(s.id, hypothesisText(state.hypotheses[s.id]).toLowerCase(), concl, verdict)}</li>`;
    }).join('');
    const metals = SAMPLES.filter(s => state.conclusions[s.id].isMetal).map(s => conclItem(s, `${s.id} (${LABELS.metals[state.conclusions[s.id].metal]})`));
    const notMetals = SAMPLES.filter(s => state.conclusions[s.id].isMetal === false).map(s => conclItem(s, s.id));
    const corrRows = SAMPLES.map(s => `<tr><th>${s.id}</th><td>${answerLabel(state.conclusions[s.id])}</td><td>${MATERIALS[s.mat].label}</td><td class="${isCorrect(s) ? 'ok' : 'ko'}">${isCorrect(s) ? '✓' : '✗'}</td></tr>`).join('');

    return {
      title: R.title,
      sections: [
        `<p>${R.question(sampleRange())}</p>`,
        `<p>${R.hypothesisIntro}</p><table class="lab-report-hyp"><tr>${hypRows}</tr></table>`,
        `<p>${R.materials(SAMPLES.length, sampleRange())}</p>`,
        `<ol>${R.procedure.map(p => `<li>${p}</li>`).join('')}</ol>`,
        `<table>${obsHead}${obsRows}</table><p class="lab-report-note">${R.heatNote}</p>`,
        `<ul>${interp}</ul>`,
        `<p>${metals.length ? R.conclusionMetals(metals.join(', ')) : R.conclusionNone} ${notMetals.length ? R.conclusionNot(notMetals.join(', ')) : ''}</p>`
      ],
      correction: `<p><strong>${R.score(score(), SAMPLES.length)}</strong></p>` +
        `<table><tr><th>${LABELS.colSample}</th><th>${LABELS.colYourAnswer}</th><th>${LABELS.colCorrect}</th><th></th></tr>${corrRows}</table>`
    };
  }

  lab = LabEngine.create({
    id: 'metals',
    title: LABELS.title,
    glossary: GLOSSARY,
    reset,
    stepComplete,
    lockReason,
    isStarted: () => Object.keys(state.hypotheses).length > 0,
    render: { 1: renderPredict, 2: renderTest, 3: renderConclude, 4: renderCheck },
    report: buildReport
  });
})();
