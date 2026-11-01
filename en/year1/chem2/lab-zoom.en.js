/* ===== Labo virtuel « Zoom in » (chem2) : textes en anglais =====

   Simulation commune aux deux filières : js/lab-zoom.js, chargée après ce
   fichier. Le néerlandais (nl/jaar1/chem2/lab-zoom.nl.js) a exactement les
   mêmes clés.

   Chaque mot du lexique (glossary) est souligné partout où il apparaît,
   sauf dans les boutons (lab-engine.js) ; [mot] ou [mot|clé] reste utile
   pour une forme dont la clé diffère.

   Mots du cours (Part 2) : molecule, particle, slide, colour key, pure
   substance, homogeneous / heterogeneous mixture, molecular model, scientific
   model. */

LabEngine.addText('zoom', {
  labels: {
    title: 'Zoom in',

    // « a, b and c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0] || '',
    // « 8 water molecules »
    countOf: (n, many) => `${n} ${many}`,

    questions: {
      1: 'What is really inside these two jars?',
      2: 'Does a molecular model show reality exactly as it is?'
    },
    yourQuestions: 'Your questions',
    intro: 'We cannot always trust our eyes. Two closed jars without labels are on your bench. An imaginary microscope zooms in so much that we can see the molecules.',
    hypothesisTitle: 'Your hypotheses',
    jarName: k => `Jar ${k}`,
    jarAria: 'Which jar',
    look: {
      clear: 'A clear liquid, without colour.',
      gas: 'We see nothing inside: only a gas without colour.',
      layers: 'Two layers of liquid: a yellow one on top of a clear one.'
    },
    hypJar: k => `I think that jar ${k} is:`,
    hypJarText: (k, word) => `I think that jar ${k} is ${word}.`,
    kinds: { pure: 'a pure substance', homo: 'a homogeneous mixture', hetero: 'a heterogeneous mixture' },
    kindChip: { pure: 'Pure substance', homo: 'Homogeneous mixture', hetero: 'Heterogeneous mixture' },
    hypModel: 'I think that a molecular model:',
    hypModelText: word => `I think that a molecular model ${word}.`,
    modelWords: { exact: 'shows reality exactly as it is', simplified: 'does not show reality exactly as it is' },
    // Dans une phrase principale (Conclude)
    modelMain: { exact: 'shows reality exactly as it is', simplified: 'does not show reality exactly as it is' },
    because: 'Why do you think so? (optional)',
    becausePlaceholder: 'Because…',
    hypothesisReady: 'Your hypotheses are ready.',
    hypothesisPending: 'Complete your three hypotheses.',
    toBench: 'Next: the microscope',
    lockHypothesis: 'Complete your three hypotheses first.',
    lockHypothesisFixed: 'Your hypotheses are fixed: the investigation has started. A scientist does not change the hypothesis after seeing the results!',

    // Le microscope et la lame
    benchTitle: 'Your bench',
    scopeEmpty: 'Touch a jar.',
    underScope: jar => `Under the microscope: ${jar}`,
    slideTitleEmpty: 'The slide',
    slideTitle: jar => `Your model: ${jar}`,
    slideAria: 'The microscope slide: your molecular model',
    sideEmpty: 'Touch a jar: the imaginary microscope zooms in on it.',
    readingTitle: 'The microscope reads',
    keyTitle: 'Colour key',
    particles: {
      water: { name: 'Water molecule', many: 'water molecules' },
      salt: { name: 'Salt particle', many: 'salt particles' },
      nitrogen: { name: 'Nitrogen molecule', many: 'nitrogen molecules' },
      oxygen: { name: 'Oxygen molecule', many: 'oxygen molecules' },
      oil: { name: 'Oil molecule', many: 'oil molecules' },
      co2: { name: 'Carbon dioxide molecule', many: 'carbon dioxide molecules' }
    },
    captionJar: 'Touch a jar to put it under the microscope.',
    captionColour: 'Touch a colour in the colour key first.',
    captionPlace: 'Touch the slide to add a particle of this colour.',
    captionMove: 'Touch the slide to add a particle. Drag a particle to move it. Touch a particle to remove it.',
    captionFull: 'The slide is full: remove a particle first.',
    captionCompared: 'Your model is fixed. Compare the two slides, then complete your notebook.',
    compareBtn: 'Compare with the reference model',
    compareTitle: 'Compare your model?',
    compareText: 'After this, you can no longer change your model of this jar.',
    compareYes: 'Yes, compare',
    refTitle: 'Reference model',
    refAria: jar => `Reference model: ${jar}`,
    refNote: 'This reference model is a drawing too, not a photo.',
    sampleWas: name => `In this jar: ${name}.`,
    samples: {
      water: { name: 'pure water' },
      oxygen: { name: 'pure oxygen' },
      air: { name: 'air' },
      salty: { name: 'salty water' },
      sparkling: { name: 'sparkling water in a closed bottle' },
      oilwater: { name: 'water and oil' }
    },
    lockNoJar: 'Touch a jar first.',
    lockEmpty: 'Build your model on the slide first.',
    lockModelFixed: 'Your model is fixed: you compared it. To try again, restart the lab.',
    lockNote: jar => `Compare your model of ${jar} first.`,
    lockPure: 'A pure substance is not a mixture: nothing to choose here.',
    lockKindFirst: 'Choose first: pure substance or mixture?',
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
    noteKinds: { pure: 'pure substance', mixture: 'mixture' },
    mixWords: { homo: 'homogeneous', hetero: 'heterogeneous' },
    choose: '— choose —',

    // Étape 3
    resultsTitle: 'Your results',
    yourModel: 'Your model',
    recapTypes: n => `Types of particles: ${n}`,
    classmate: 'A classmate looks at the two jars and says: “Both of them are pure substances!” Explain why this is wrong.',
    concl1: (jar, type, n) => `No! ${jar} is not a pure substance: it is ${type}, because the number of types of particles is ${n}.`,
    typeAria: 'Which type of mixture',
    concl2: word => `A molecular model ${word}.`,
    limitsQ: 'What is not like in real life in our drawings?',
    chooseSeveral: 'Choose one or more.',
    limits: { colour: 'The colours of the particles', size: 'The size of the particles', move: 'Particles that stand still', types: 'The types of particles' },
    whySentence: why => `We use colours to ${why}.`,
    whys: { apart: 'tell the types of particles apart', real: 'show the real colour of each particle', nice: 'make the drawing nicer' },
    whyAria: 'Why we use colours',
    verdictRow: k => (k === 'model' ? 'Hypothesis on the model' : `Hypothesis on jar ${k}`),
    confirmed: 'confirmed',
    rejected: 'rejected',
    checkConclusions: 'Check my conclusions',
    backToLab: 'Back to the lab',

    // Étape 4
    scoreLabel: 'checks passed',
    markCorrect: 'correct',
    markIncorrect: 'incorrect',
    criteria: { particles: 'Particles', arrangement: 'Arrangement', classification: 'Classification', conclusion: 'Question 1', limits: 'Question 2' },
    criteriaSub: { particles: 'The types and the numbers', arrangement: 'Spread out or in layers', classification: 'Your notebook', conclusion: 'Your answer and your judgement', limits: 'What a model is' },

    report: {
      title: 'Laboratory report — Zoom in',
      because: 'Because',
      materials: 'Two closed jars without labels. An imaginary microscope. Microscope slides and a colour key.',
      procedure: [
        'Observe each jar with the naked eye.',
        'Put a jar under the imaginary microscope and read what it contains.',
        'Build a molecular model on the slide, with the colour key.',
        'Compare the model with the reference model.',
        'Write in the notebook the number of types of particles and the type of matter.'
      ],
      lookHead: 'With the naked eye',
      modelsCaption: 'Observations and models',
      interp: (jar, n, kind) => `${jar}: number of types of particles: ${n}, so it is ${kind}.`,
      refCompared: 'Each model was compared with a reference model.',
      verdict: (row, word) => `${row}: ${word}.`,
      score: n => `Score: ${n} / 5 checks passed.`
    }
  },

  glossary: {
    jar: 'bocal', jars: 'bocaux', closed: 'fermé(s)', labels: 'étiquettes', bench: 'paillasse', 'naked eye': 'œil nu',
    trust: 'faire confiance à', 'zooms in': 'zoome', slide: 'lame', slides: 'lames', 'microscope slides': 'lames de microscope',
    clear: 'transparent(e)', layers: 'couches', 'on top of': 'au-dessus de', 'pure substance': 'corps pur', 'pure substances': 'corps purs',
    mixture: 'mélange', 'homogeneous mixture': 'mélange homogène', 'heterogeneous mixture': 'mélange hétérogène',
    'molecular model': 'modèle moléculaire', 'molecular models': 'modèles moléculaires', 'scientific model': 'modèle scientifique',
    'colour key': 'clé des couleurs', 'salt particles': 'particules de sel', 'salty water': 'eau salée',
    'water molecules': 'molécules d’eau', 'nitrogen molecules': 'molécules d’azote', 'oil molecules': 'molécules d’huile',
    'oxygen molecules': 'molécules d’oxygène', 'carbon dioxide molecules': 'molécules de dioxyde de carbone',
    'carbon dioxide': 'dioxyde de carbone', nitrogen: 'azote', oil: 'huile', salt: 'sel', 'sparkling water': 'eau gazeuse',
    'pure water': 'eau pure', 'pure oxygen': 'oxygène pur', drawing: 'dessin', drawings: 'dessins',
    'spread out': 'répartis', 'stand still': 'restent immobiles', 'tell the types of particles apart': 'distinguer les types de particules',
    classmate: 'camarade de classe', wrong: 'faux', 'real life': 'la vraie vie', 'simplified representation': 'représentation simplifiée',
    float: 'flotte', 'dissolved': 'dissous', 'evenly': 'de façon uniforme', tiny: 'minuscule(s)', bubbles: 'bulles'
  },

  // Étape Check : pourquoi.
  explanations: {
    particles: 'The microscope gave you the types and the numbers of particles. The colour key gives the colour of each type.',
    arrange: {
      pure: 'A pure substance has only one type of particle: they can be anywhere on the slide.',
      homo: 'In a homogeneous mixture, the different particles are mixed evenly: they are spread out over the whole slide, not in a separate group.',
      hetero: 'Oil and water do not mix: the oil particles float on top, the water molecules stay below. That is why we can see two layers with the naked eye.'
    },
    samples: {
      water: 'Pure water: only one type of particle, water molecules. It is a pure substance.',
      oxygen: 'Pure oxygen: only one type of particle, oxygen molecules. It is a pure substance.',
      air: 'Air: two types of particles here, nitrogen and oxygen molecules, mixed evenly. We see only one phase: it is a homogeneous mixture.',
      salty: 'Salty water: water molecules and salt particles. The salt is still there, in tiny pieces, spread out in the water. We see only one phase: it is a homogeneous mixture.',
      sparkling: 'Sparkling water in a closed bottle: water molecules and carbon dioxide molecules, dissolved in the water. It looks clear, without bubbles, but it is not pure: it is a homogeneous mixture.',
      oilwater: 'Water and oil: two types of particles in two layers. We can see two phases: it is a heterogeneous mixture.'
    },
    limits: {
      colour: 'Not true: real molecules are not blue or red. The colours are a code that we chose.',
      size: 'Not true: real molecules are much too small to see, and we draw them all as circles of the same size.',
      move: 'Not true: in real life, particles are always moving. Our drawing stands still, like a photo.',
      types: 'True: a good model shows the types of particles that are really there.'
    },
    model: 'A scientific model is a simplified representation of reality. It helps us to understand and to explain what we cannot see.'
  },

  check: {
    nothing: 'nothing',
    particlesWrong: (jar, said, right) => `${jar}: you placed ${said}. The microscope read ${right}.`,
    particlesGood: 'Your two models have the right types and the right numbers of particles. Well counted!',
    arrangeWrong: (jar, why) => `${jar}: look at the arrangement. ${why}`,
    arrangeGood: 'The arrangement of your particles is correct. Well thought!',
    noteRight: (jar, n, kind) => `${jar}: number of types of particles: ${n}, so it is ${kind}.`,
    notesGood: 'Your notebook is correct. Well classified!',
    answerOk: 'Correct!',
    answerWrong: 'Not quite. The correct answer:',
    yourHyps: 'Your hypotheses:',
    verdictOk: v => `Your hypothesis and your results ${v === 'confirmed' ? 'say the same thing' : 'do not say the same thing'}: it is indeed ${v}. Well judged!`,
    verdictWrong: should => `Compare your hypothesis with your results: they ${should === 'confirmed' ? 'say the same thing, so your hypothesis is confirmed' : 'do not say the same thing, so your hypothesis is rejected'}.`,
    rejectedNote: 'A rejected hypothesis is not a mistake: it is how science moves on.'
  }
});
