/* ===== Labo virtuel « Zoom in » (chem2) : textes en anglais =====

   Simulation commune aux deux filières : js/lab-zoom.js, chargée après ce
   fichier. Le néerlandais (nl/jaar1/chem2/lab-zoom.nl.js) a exactement les
   mêmes clés.

   Chaque mot du lexique (glossary) est souligné partout où il apparaît,
   sauf dans les boutons (lab-engine.js) ; [mot] ou [mot|clé] reste utile
   pour une forme dont la clé diffère.

   Mots du cours (Part 2 et 3) : molecule, particle, slide, colour key, pure
   substance, homogeneous / heterogeneous mixture, molecular model, solution,
   solvent, solute, dissolve. Les noms des préparations commencent toujours
   une phrase : ils portent leur majuscule. */

LabEngine.addText('zoom', {
  labels: {
    title: 'Zoom in',

    // « a, b and c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0] || '',
    // « 8 water molecules » (many : le nom au singulier ou au pluriel, selon n)
    countOf: (n, many) => `${n} ${many}`,

    bigQuestion: 'What do we get when we mix substances?',
    subQuestion: name => `${name}: what do we get?`,
    yourQuestion: 'Your question',
    intro: 'On your bench: bottles of pure substances. You make two preparations and look at them with the naked eye. Then an imaginary microscope zooms in so much that we can see the particles.',
    hypothesisTitle: 'Your hypotheses',
    prepName: k => `Preparation ${k}`,
    preps: {
      hotcold: 'Hot water + cold water',
      ice: 'Water + ice cubes',
      sugars: 'Sugar cubes + granulated sugar',
      salty: 'Water + salt',
      sweet: 'Water + sugar',
      sparkling: 'Water + carbon dioxide (closed bottle)',
      soda: 'Water + sugar + carbon dioxide (closed bottle)',
      air: 'Nitrogen + oxygen',
      heliox: 'Helium + oxygen',
      oilwater: 'Water + oil',
      sandwater: 'Water + sand',
      oilsalt: 'Water + salt + oil'
    },
    ingredients: {
      water: 'water', hotWater: 'hot water', coldWater: 'cold water', ice: 'ice cubes',
      sugarCubes: 'sugar cubes', grains: 'granulated sugar', sugar: 'sugar', salt: 'salt', oil: 'oil', sand: 'sand',
      co2: 'carbon dioxide', nitrogen: 'nitrogen', oxygen: 'oxygen', helium: 'helium'
    },
    hypWill: 'I think we will get:',
    hypText: (name, word) => `${name}: I think we will get ${word}.`,
    kinds: { pure: 'a pure substance', homo: 'a homogeneous mixture', hetero: 'a heterogeneous mixture' },
    kindChip: { pure: 'Pure substance', homo: 'Homogeneous mixture', hetero: 'Heterogeneous mixture' },
    because: 'Why do you think so? (optional)',
    becausePlaceholder: 'Because…',
    hypothesisReady: 'Your hypotheses are ready.',
    hypothesisPending: 'Complete your two hypotheses.',
    toBench: 'Next: the bench',
    lockHypothesis: 'Complete your two hypotheses first.',
    lockHypothesisFixed: 'Your hypotheses are fixed: the investigation has started. A scientist does not change the hypothesis after seeing the results!',

    // La paillasse
    mixBtn: { stir: 'Stir', shake: 'Close and shake' },
    seenQ: 'With the naked eye, what do you see?',
    seen: { same: 'It looks the same everywhere', parts: 'I can see different parts' },
    // Dans une phrase (Check, rapport)
    seenNote: { same: 'it looks the same everywhere', parts: 'we can see different parts' },
    zoomBtn: 'Zoom in with the microscope',
    lockPoured: 'This is already in your preparation.',
    lockMixed: 'Your preparation is ready: nothing more to pour.',
    lockPourAll: 'Pour all the ingredients first.',
    lockMixFirst: 'Mix your preparation first.',
    lockSeenFirst: 'Note first what you see with the naked eye.',
    lockSeenFixed: 'Your observation is fixed: you have zoomed in.',
    captionPour: 'Touch each ingredient to pour it.',
    captionMix: 'Now mix your preparation.',
    captionSeen: 'Look at your preparation: what do you see with the naked eye?',
    captionZoom: 'Zoom in with the microscope.',

    // Le microscope et la lame
    slideTitle: k => `Your model: preparation ${k}`,
    slideAria: 'The microscope slide: your molecular model',
    sideEmpty: 'Pour, mix and look with the naked eye. Then zoom in: the microscope shows what is inside.',
    readingTitle: 'The microscope reads',
    keyTitle: 'Colour key',
    particles: {
      water: { name: 'Water molecule', one: 'water molecule', many: 'water molecules' },
      salt: { name: 'Salt particle', one: 'salt particle', many: 'salt particles' },
      sugar: { name: 'Sugar molecule', one: 'sugar molecule', many: 'sugar molecules' },
      oil: { name: 'Oil molecule', one: 'oil molecule', many: 'oil molecules' },
      sand: { name: 'Sand particle', one: 'sand particle', many: 'sand particles' },
      nitrogen: { name: 'Nitrogen molecule', one: 'nitrogen molecule', many: 'nitrogen molecules' },
      oxygen: { name: 'Oxygen molecule', one: 'oxygen molecule', many: 'oxygen molecules' },
      helium: { name: 'Helium particle', one: 'helium particle', many: 'helium particles' },
      co2: { name: 'Carbon dioxide molecule', one: 'carbon dioxide molecule', many: 'carbon dioxide molecules' }
    },
    // Deux formes d'une même substance
    forms: {
      hot: 'molecules of hot water',
      cold: 'molecules of cold water',
      liquid: 'molecules of liquid water',
      ice: 'molecules of ice',
      cubes: 'sugar molecules from the sugar cubes',
      grains: 'sugar molecules from the granulated sugar'
    },
    onSlide: 'On your slide:',
    captionColour: 'Touch a colour in the colour key first.',
    captionPlace: 'Touch the slide to add a particle of this colour.',
    captionMove: 'Touch the slide to add a particle. Drag a particle to move it. Touch a particle to remove it.',
    captionFull: 'The slide is full: remove a particle first.',
    captionCompared: 'Your model is fixed. Compare the two slides, then complete your notebook.',
    compareBtn: 'Compare with the reference model',
    compareTitle: 'Compare your model?',
    compareText: 'After this, you can no longer change your model of this preparation.',
    compareYes: 'Yes, compare',
    refTitle: 'Reference model',
    refAria: k => `Reference model: preparation ${k}`,
    refNote: 'This reference model is a drawing too, not a photo.',
    lockNoZoom: 'Zoom in with the microscope first.',
    lockEmpty: 'Build your model on the slide first.',
    lockModelFixed: 'Your model is fixed: you compared it. To try again, restart the lab.',
    lockNote: k => `Compare your model of preparation ${k} first.`,
    lockPure: 'A pure substance is not a mixture: nothing to choose here.',
    lockKindFirst: 'Choose first: pure substance or mixture?',
    lockLiquid: 'Solvent and solute: only for a liquid.',
    lockPureSolution: 'A pure substance is not a solution: nothing to choose here.',
    lockSolventFirst: 'Choose the solvent first.',
    lockRun: (models, notes) => {
      const parts = [];
      if (models) parts.push(models === 1 ? '1 model to compare' : `${models} models to compare`);
      if (notes) parts.push(notes === 1 ? '1 line missing in your notebook' : `${notes} lines missing in your notebook`);
      return `Not finished yet: ${parts.join(' and ')}.`;
    },
    runInfo: (models, notes) => `Models compared: ${models} / 2 · Notebook: ${notes} / 2`,
    toConclude: 'Next: conclude',

    notebookTitle: 'Your notebook',
    typesHead: 'Number of types of particles',
    kindHead: 'Pure substance or mixture?',
    mixHead: 'If it is a mixture: which type?',
    solventHead: 'Solvent',
    soluteHead: 'Solute',
    noSolute: 'nothing is dissolved',
    noteKinds: { pure: 'pure substance', mixture: 'mixture' },
    mixWords: { homo: 'homogeneous', hetero: 'heterogeneous' },
    choose: '— choose —',

    // Étape 3
    resultsTitle: 'Your results',
    yourModel: 'Your model',
    recapTypes: n => `Types of particles: ${n}`,
    answer: (name, kind, n) => `${name} gives ${kind}: the number of types of particles is ${n}.`,
    kindAria: 'What we get',
    verdictRow: k => `Hypothesis on preparation ${k}`,
    ruleIntro: 'It depends on the particles. Complete the rule:',
    rule: {
      pure: w => `In a pure substance, the particles are ${w}.`,
      homo: w => `In a homogeneous mixture, the particles are ${w}.`,
      hetero: w => `In a heterogeneous mixture, the particles are ${w}.`
    },
    ruleWords: {
      one: 'all of the same type',
      spread: 'of different types, spread out between each other',
      apart: 'of different types, apart: in layers or at the bottom'
    },
    ruleAria: 'The particles',
    confirmed: 'confirmed',
    rejected: 'rejected',
    checkConclusions: 'Check my conclusions',
    backToLab: 'Back to the lab',

    // Étape 4
    scoreLabel: 'checks passed',
    markCorrect: 'correct',
    markIncorrect: 'incorrect',
    criteria: { particles: 'Particles', arrangement: 'Arrangement', notebook: 'Notebook', preparations: 'Your preparations', rule: 'The rule' },
    criteriaSub: {
      particles: 'The types and the numbers',
      arrangement: 'Spread out, on top or at the bottom',
      notebook: 'What you saw and noted',
      preparations: 'Your answers and your judgement',
      rule: 'What the particles do'
    },

    report: {
      title: 'Laboratory report — Zoom in',
      because: 'Because',
      materials: 'Bottles of pure substances and containers. An imaginary microscope. Microscope slides and a colour key.',
      procedure: [
        'Pour the ingredients of a preparation into its container, then mix.',
        'Observe the preparation with the naked eye.',
        'Zoom in with the imaginary microscope and read what it shows.',
        'Build a molecular model on the slide, with the colour key.',
        'Compare the model with the reference model.',
        'Write in the notebook: the number of types of particles, the type of matter, the solvent and the solute.'
      ],
      lookHead: 'With the naked eye',
      modelsCaption: 'Observations and models',
      refCompared: 'Each model was compared with a reference model.',
      verdict: (row, word) => `${row}: ${word}.`,
      score: n => `Score: ${n} / 5 checks passed.`
    }
  },

  glossary: {
    bench: 'paillasse', 'naked eye': 'œil nu', 
    pour: 'verse', 'pour it': 'verse-le', 'closed bottle': 'bouteille fermée', container: 'récipient', containers: 'récipients',
    slide: 'lame', slides: 'lames', 'microscope slides': 'lames de microscope',
    'pure substance': 'corps pur', 'pure substances': 'corps purs', mixture: 'mélange',
    'homogeneous mixture': 'mélange homogène', 'heterogeneous mixture': 'mélange hétérogène',
    'colour key': 'clé des couleurs',
    dissolved: 'dissous', dissolves: 'se dissout', 'does not dissolve': 'ne se dissout pas',
    'hot water': 'eau chaude', 'cold water': 'eau froide', 'liquid water': 'eau liquide', 'ice cubes': 'glaçons', ice: 'glace',
    'sugar cubes': 'sucre en morceaux', 'granulated sugar': 'sucre cristallisé', salt: 'sel', oil: 'huile', sand: 'sable',
    nitrogen: 'azote', 
    'water molecules': 'molécules d’eau', 'sugar molecules': 'molécules de sucre', 'salt particles': 'particules de sel',
    'oil molecules': 'molécules d’huile', 'sand particles': 'particules de sable', 'nitrogen molecules': 'molécules d’azote',
    
    'looks the same everywhere': 'a le même aspect partout', 'spread out': 'répartis', evenly: 'de façon uniforme',
    apart: 'séparés', layers: 'couches', layer: 'couche', 'at the bottom': 'au fond', 'on top': 'au-dessus',
    floats: 'flotte', float: 'flottent', sinks: 'coule', 'arranged in order': 'rangées en ordre', bubbles: 'bulles',
    divers: 'plongeurs', breathe: 'respirent', drawing: 'dessin', 'move less': 'bougent moins'
  },

  // Étape Check : pourquoi.
  explanations: {
    particles: 'The microscope gave you the types and the numbers of particles. The colour key gives one colour for each type of particle.',
    model: 'Remember: a molecular model is a drawing. The colours are a code that we chose, and real particles are always moving.',
    arrange: {
      pure: 'A pure substance has only one type of particle: they can be anywhere on the slide.',
      homo: 'In a homogeneous mixture, the different particles are mixed evenly: they are spread out over the whole slide, not in a separate group.',
      top: 'Oil does not dissolve in water: the oil particles float on top, the water stays below. A dissolved substance stays spread out in the water.',
      bottom: 'Sand does not dissolve in water: the sand particles sink to the bottom, the water stays above.'
    },
    // Préparations qui donnent un corps pur : pourquoi une seule couleur.
    same: {
      hotcold: 'Hot water and cold water are made of the same water molecules: one colour for all 10.',
      ice: 'Ice is made of water molecules too: one colour for all 10.',
      sugars: 'Sugar cubes and granulated sugar are made of the same sugar molecules: one colour for all 10.'
    },
    preps: {
      hotcold: 'Hot water and cold water: only water molecules. Hot or cold, it is the same type of particle: it is a pure substance.',
      ice: 'Water and ice cubes: only water molecules. Ice is water: in the ice, the same molecules are arranged in order and move less. We can see different parts, but it is a pure substance.',
      sugars: 'Sugar cubes and granulated sugar: only sugar molecules. The pieces do not have the same size, but it is the same type of particle: it is a pure substance.',
      salty: 'Water and salt: water molecules and salt particles. The salt is dissolved: it is still there, spread out in the water. It is a solution, a homogeneous mixture. Solvent: water; solute: salt.',
      sweet: 'Water and sugar: water molecules and sugar molecules. The sugar is dissolved: it is still there, spread out in the water. It is a solution, a homogeneous mixture. Solvent: water; solute: sugar.',
      sparkling: 'Water and carbon dioxide in a closed bottle: the carbon dioxide is dissolved in the water. It looks clear, without bubbles, but it is a solution, a homogeneous mixture. Solvent: water; solute: carbon dioxide.',
      soda: 'Water, sugar and carbon dioxide: three types of particles, all spread out. It is a solution, a homogeneous mixture. Solvent: water; solutes: sugar and carbon dioxide.',
      air: 'Nitrogen and oxygen: two types of particles, mixed evenly. It is a homogeneous mixture: the air that we breathe is like this.',
      heliox: 'Helium and oxygen: helium is very light, but in a closed flask the two gases mix evenly. It is a homogeneous mixture. Divers breathe it to go very deep.',
      oilwater: 'Water and oil: oil does not dissolve in water. Two types of particles in two layers: it is a heterogeneous mixture. Nothing is dissolved.',
      sandwater: 'Water and sand: sand does not dissolve, it sinks to the bottom. Two types of particles, apart: it is a heterogeneous mixture. Nothing is dissolved.',
      oilsalt: 'Water, salt and oil: the salt dissolves in the water, the oil floats on top. It is a heterogeneous mixture. The bottom layer is a solution: solvent water, solute salt.'
    },
    rule: 'One type of particle: a pure substance, even if we can see different parts. Several types: a mixture. Spread out between each other: homogeneous. Apart, in layers or at the bottom: heterogeneous.'
  },

  check: {
    nothing: 'nothing',
    particlesWrong: (name, said, right) => `${name}: you placed ${said}. The microscope read ${right}.`,
    particlesGood: 'Your two models have the right types and the right numbers of particles. Well counted!',
    arrangeWrong: (name, why) => `${name}: look at the arrangement. ${why}`,
    arrangeGood: 'The arrangement of your particles is correct. Well thought!',
    noteRight: (name, seen, n, kind, solution) => `${name}: ${seen}; number of types of particles: ${n}, so it is ${kind}${solution ? `; ${solution}` : ''}.`,
    solution: (solvent, solutes) => `solvent: ${solvent}, solute: ${solutes}`,
    notesGood: 'Your notebook is correct. Well observed and well classified!',
    answerOk: 'Correct!',
    answerWrong: 'Not quite. The correct answer:',
    yourHyps: 'Your hypotheses:',
    verdictOk: v => `Your hypothesis and your results ${v === 'confirmed' ? 'say the same thing' : 'do not say the same thing'}: it is indeed ${v}. Well judged!`,
    verdictWrong: should => `Compare your hypothesis with your results: they ${should === 'confirmed' ? 'say the same thing, so your hypothesis is confirmed' : 'do not say the same thing, so your hypothesis is rejected'}.`,
    rejectedNote: 'A rejected hypothesis is not a mistake: it is how science moves on.',
    ruleGood: 'Your rule is correct. Well explained!'
  }
});
