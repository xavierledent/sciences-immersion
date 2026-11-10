/* ===== Labo virtuel « Down the drain » (chem2) : textes en anglais =====

   Simulation commune aux deux filières : js/lab-drain.js, chargée après ce
   fichier. Le néerlandais (nl/jaar1/chem2/lab-drain.nl.js) a exactement les
   mêmes clés.

   Chaque mot du lexique (glossary) est souligné partout où il apparaît,
   sauf dans les boutons et les zones à toucher (lab-engine.js) ; [mot] ou
   [mot|clé] reste utile pour une forme dont la clé diffère.

   Mots du cours (Part 3) : separation techniques, sifting, filtration,
   decantation, evaporation, dissolved. Station anonyme (pas de nom
   d'entreprise réelle). Les noms des choses commencent une phrase : ils
   portent leur majuscule. */

LabEngine.addText('drain', {
  labels: {
    title: 'Down the drain',

    // « a, b and c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0] || '',
    num: v => Number(v).toLocaleString('en-GB'),
    money: v => `€${Number(v).toLocaleString('en-GB')}`,
    energy: v => `${v} MWh`,

    bigQuestion: 'Where does everything we send down the drain end up?',
    subQuestions: [
      'Where does each thing end up: at a post of the station, or in the river?',
      'The town can pay for one improvement: which one protects the river best?'
    ],
    yourQuestion: 'Your question',
    todayTitle: 'Today in the town',
    intro: 'You are an operator at the wastewater treatment plant of a small Belgian town. Everything that goes down the sinks and the toilets of the town arrives here.',
    weather: { dry: 'Dry day', rain: 'Rainy day', storm: 'Storm' },

    // Page d'accueil (mission) : des gestes, jamais des résultats.
    briefTitle: 'Mission: follow the water, protect the river',
    briefTask: 'You run the treatment plant of a small town. Follow four things down the drain!',
    briefSteps: [
      '<strong>Place</strong> the four things. <strong>Choose</strong> an improvement.',
      '<strong>Open</strong> the valve. <strong>Take</strong> samples. <strong>Test</strong> improvements.',
      '<strong>Answer</strong> the two questions. Were you right?'
    ],
    // Sous chaque phrase courte : le comment, en une phrase (jamais le résultat).
    briefDetails: [
      'Drag each thing onto a post of the plan, or into the river.',
      'Take a sample at each post and in the river, then test at least two improvements.',
      'Use your operator log and the results of your tests.'
    ],
    volume: v => `Water arriving today: ${v} m³`,
    today: (weather, v) => `${weather}. Water arriving today: ${v} m³.`,

    places: { grid: 'Grid', grit: 'Sand and grease tank', bio: 'Bacteria tank', settle: 'Settling tank', river: 'River' },
    placesIn: { grid: 'at the grid', grit: 'in the sand and grease tank', bio: 'in the bacteria tank', settle: 'in the settling tank', river: 'in the river' },
    items: {
      wipes: { name: 'Wet wipes', short: 'Wipes' },
      buds: { name: 'Cotton buds', short: 'Cotton buds' },
      sand: { name: 'Sand from washing vegetables', short: 'Sand' },
      litter: { name: 'Cat litter', short: 'Cat litter' },
      oil: { name: 'Frying oil', short: 'Oil' },
      coffee: { name: 'Coffee grounds', short: 'Coffee' },
      fibres: { name: 'Fibres of a fleece (washing machine)', short: 'Fibres' },
      glitter: { name: 'Glitter', short: 'Glitter' },
      lemonade: { name: 'Lemonade', short: 'Lemonade' },
      milk: { name: 'Old milk', short: 'Milk' },
      salt: { name: 'Salty pasta water', short: 'Salt' },
      medicine: { name: 'Old medicine', short: 'Medicine' }
    },
    amounts: { 1: 'a little', 2: 'some', 3: 'a lot' },

    // Étape 1
    trayTitle: 'Today down the drain',
    trayHint: 'Take each thing and put it where you think it will end up: at a post of the plan, or in the river.',
    trayDone: 'Everything is placed. You can still move a thing.',
    choiceTitle: 'Your hypothesis on the improvement',
    choiceHint: budget => `The town has ${budget} per year for one improvement. Which one will protect the river best?`,
    because: 'Why do you think so? (optional)',
    becausePlaceholder: 'Because…',
    hypothesisReady: 'Your hypotheses are ready.',
    hypothesisPending: 'Place the four things and choose an improvement.',
    lockHypothesis: 'Place the four things and choose an improvement first.',
    lockHypothesisFixed: 'Your hypotheses are fixed: the day has started. A scientist does not change the hypothesis after seeing the results!',
    toStation: 'Next: the station',

    upgrades: {
      fineGrid: { name: 'Finer grid', what: 'The bars of the grid are closer together.', note: 'It is blocked more often: the workers rake more.' },
      longTank: { name: 'Second settling tank', what: 'The water stays twice as long in calm water.', note: 'Building a new tank costs a lot.' },
      sandFilter: { name: 'Sand filter', what: 'After the settling tank, the water goes through a thick layer of sand.', note: 'Pumps push the water through the sand: they use energy.' },
      stormTank: { name: 'Storm basin', what: 'A big basin keeps the extra rainwater, then sends it slowly into the station.', note: 'A big basin costs a lot. It only fills up on stormy days.' },
      campaign: { name: 'Campaign in the town', what: 'Posters and letters: only pee, poo and toilet paper in the toilet; old medicine back to the pharmacy; frying oil to the container park.', note: 'It only works if people follow it: about half of them do.' },
      evaporation: { name: 'Evaporation pond', what: 'All the water is heated until it evaporates: everything else stays behind.', note: 'The river gets no water at all. It needs more than 20 times the electricity of all the homes of the town.' },
      none: { name: 'No improvement' }
    },

    // Étape 2 : la station
    views: { station: 'The station', tests: 'Improvements' },
    valveBtn: 'Open the valve',
    continueBtn: 'Continue the day',
    rakeBtn: 'Rake the grid',
    cupBtn: 'Sampling cup',
    dayDone: 'The day is over.',
    captionValve: 'Open the valve: the water of the town comes in. A whole day goes by in a few seconds.',
    // La journée, heure par heure (moments : voir PHASES dans lab-drain.js)
    captionPhases: {
      night: 'Night: the town is asleep, very little water arrives. Keep an eye on the grid!',
      morning: 'Morning: the town wakes up. Showers, toilets, breakfast: much more water!',
      daytime: 'Daytime: a steady flow of water from the town.',
      evening: 'Evening: cooking, washing up, washing machines. More water again!',
      late: 'Late evening: the town goes to bed, less and less water.'
    },
    captionArrive: name => `${name}: down the drain! It is on its way to the station.`,
    captionStorm: 'The storm breaks! The station cannot take all the water: part of it goes over the storm overflow, straight to the river.',
    captionClogged: 'The grid is blocked: the water rises in front of it. Rake the grid!',
    captionPaused: 'The day is paused: continue the day.',
    captionSample: 'The day is over. Take the sampling cup, then touch a post or the river: take a sample in each place.',
    captionHold: 'Touch a post or the river to take a sample there.',
    captionAnalyse: 'What is dissolved cannot be seen: send the river sample to the laboratory.',
    captionLog: 'Complete your operator log: for each place, what you found, and the technique of each post.',
    captionToTests: 'Your log is complete. Now open “Improvements” and test some of them.',
    captionTestsFirst: 'Test an improvement: the same day runs again, with this improvement.',
    captionTests: 'Test other improvements and compare. Touch the name of a row to see it on the plan.',
    captionTested: name => `The same day, with this improvement: ${name}. Look at the new row.`,

    sampleEmpty: 'Take the sampling cup, then touch a post or the river.',
    sampleWait: 'First, let the day go by. Then take samples.',
    sampleTitle: place => `Sample: ${place}`,
    invisibleNote: 'What is dissolved cannot be seen. Send the sample to the laboratory of the station.',
    analyseBtn: 'Send to the laboratory',
    analysisTitle: 'Laboratory: dissolved in the river water',
    analysisNothing: 'Nothing from today’s list is dissolved in this water.',
    analytes: { lemonade: 'Sugar', milk: 'Milk (fat and proteins)', salt: 'Salt', medicine: 'Medicine' },
    levels: { lot: 'a lot', some: 'some', traces: 'traces', none: 'none' },

    logTitle: 'Your operator log',
    placeHead: 'Place',
    nothingHead: 'Nothing',
    nothingShort: 'None',
    techHead: 'Technique',
    tickAria: (place, item) => `${place}: ${item}`,
    logHint: 'Tick what you found in each sample. For the river, use what you see and the laboratory results.',
    techs: { sifting: 'Sifting', decantation: 'Decantation', filtration: 'Filtration', evaporation: 'Evaporation', none: 'Not a separation' },

    upsTitle: 'Improvements to test',
    budgetLine: budget => `Budget of the town: ${budget} per year, for one improvement.`,
    testBtn: 'Test',
    resultsCaption: 'Results of the tests',
    upHead: 'Improvement',
    pollutionHead: 'Pollution reaching the river',
    costHead: 'Cost per year',
    energyHead: 'Extra energy per year',
    pollutionHint: 'Pollution index: what reaches the river, counted by how harmful it is for the fish. The lower, the better.',
    baseRow: 'Today’s station',
    riverClean: 'nothing',
    overBudget: 'over the budget',
    baseStormNote: 'Part of the water went over the storm overflow.',

    lockTests: 'Complete your operator log first, with the laboratory results.',
    lockRake: 'The grid is not blocked: nothing to rake now.',
    lockCupDay: 'Let the day go by first: open the valve.',
    lockSampleFirst: place => `Take a sample here first: ${place}.`,
    lockAnalyseFirst: 'Send the river sample to the laboratory first.',
    lockDay: 'Not finished yet: let the day go by first.',
    missingSamples: n => (n === 1 ? '1 sample to take' : `${n} samples to take`),
    missingAnalysis: 'the laboratory analysis',
    missingRows: n => (n === 1 ? '1 line missing in your log' : `${n} lines missing in your log`),
    missingTests: n => (n === 1 ? '1 more improvement to test' : `${n} more improvements to test`),
    notFinished: list => `Not finished yet: ${list}.`,
    runInfo: (samples, rows, tests) => `Samples: ${samples} / 5 · Log: ${rows} / 5 · Tests: ${tests}`,
    backToPredict: 'Hypotheses',
    toConclude: 'Next: conclude',
    // Bouton suivant pendant l'expérience, tant que les améliorations manquent.
    toTests: 'Next: improvements',

    // Étape 3
    resultsTitle: 'Your results',
    placeAnswer: (name, place, reason) => `${name}: ${place} — ${reason}.`,
    reasonAria: 'Why',
    reasons: {
      big: 'too big to pass between the bars',
      thin: 'long and thin: slips between the bars',
      sinks: 'heavier than water: sinks to the bottom',
      floats: 'lighter than water: floats on top',
      fine: 'tiny pieces that sink very slowly',
      eaten: 'food mixed in the water: the bacteria eat it',
      dissolved: 'dissolved: nothing in the station can stop it',
      overflow: 'goes straight to the river over the storm overflow'
    },
    choiceLead: choice => `The improvement I choose: ${choice}.`,
    choiceAria: 'The improvement',
    choiceAnswer: (name, item, why) => `${name} keeps ${item} out of the river. The reason: ${why}.`,
    itemAria: 'Which thing',
    howAnswer: how => `It works by ${how}.`,
    howAria: 'How it works',
    hows: {
      sifting: 'sifting', decantation: 'decantation', filtration: 'filtration', evaporation: 'evaporation',
      storing: 'storing the extra rainwater', keepingOut: 'keeping it out of the drain'
    },
    priceAnswer: price => `The price to pay: ${price}.`,
    priceAria: 'The price to pay',
    prices: { work: 'more work for the workers', money: 'a lot of money', energy: 'a lot of energy', people: 'it only works if people follow it' },
    noneAnswer: why => `Why? ${why}.`,
    noneAria: 'Why',
    noneWhy: { clean: 'Nothing harmful reaches the river today', nothingHelps: 'No improvement within the budget makes the river cleaner' },
    verdicts: { confirmed: 'confirmed', partly: 'partly confirmed', rejected: 'rejected' },
    verdictPlace: 'Hypothesis: where things end up',
    verdictChoice: 'Hypothesis: the improvement',
    hypPlace: (name, place) => `${name} will end up ${place}.`,
    hypChoice: name => `The improvement that will protect the river best: ${name}.`,
    nothingFound: 'nothing from today’s list',
    notTested: 'not tested',
    checkConclusions: 'Check my conclusions',
    backToLab: 'Back to the station',
    choose: 'choose',

    // Étape 4
    scoreLabel: 'checks passed',
    markCorrect: 'correct',
    markIncorrect: 'incorrect',
    criteria: { samples: 'Samples', techniques: 'Techniques', places: 'Where it ends up', choice: 'The improvement', conclusion: 'Your hypotheses' },
    criteriaSub: {
      samples: 'What you found in each place',
      techniques: 'The technique of each post',
      places: 'The place and the reason',
      choice: 'Your choice and your reasons',
      conclusion: 'Your judgement'
    },

    report: {
      title: 'Laboratory report — Down the drain',
      because: 'Because',
      materials: 'A model of a wastewater treatment plant: grid, sand and grease tank, bacteria tank, settling tank. A sampling cup and a magnifying glass. The laboratory of the station. Six improvements to test.',
      procedure: [
        'Place each thing where you think it will end up, and choose an improvement (hypotheses).',
        'Open the valve and let one day go by; rake the grid when it is blocked.',
        'Take a sample at each post and in the river, and look at it with the magnifying glass.',
        'Send the river sample to the laboratory.',
        'Write in the operator log what you found in each place, and the technique of each post.',
        'Test at least two improvements: compare the pollution reaching the river, the cost and the energy.'
      ],
      items: 'Today down the drain',
      foundHead: 'What I found',
      analysis: 'Laboratory analysis of the river water',
      verdict: (row, word) => `${row}: ${word}.`,
      score: n => `Score: ${n} / 5 checks passed.`
    }
  },

  glossary: {
    asleep: 'endormie', 'wakes up': 'se réveille', breakfast: 'petit-déjeuner', steady: 'régulier', cooking: 'cuisiner',
    'washing up': 'faire la vaisselle', 'goes to bed': 'va se coucher', 'on its way': 'en route', 'the storm breaks': 'l’orage éclate',
    'end up': 'finir', 'ends up': 'finit', wipes: 'lingettes', oil: 'huile', sand: 'sable', 'per year': 'par an',
    'wastewater treatment plant': 'station d’épuration', drain: 'égout', sinks: 'éviers', 
    grid: 'grille', bars: 'barreaux', 'sand and grease tank': 'dessableur-déshuileur', grease: 'graisse',
    'bacteria tank': 'bassin à bactéries', 'settling tank': 'décanteur', sludge: 'boues', 
    'storm overflow': 'déversoir d’orage', storm: 'orage', stormy: 'orageux', rainy: 'pluvieux', rainwater: 'eau de pluie',
    'dry day': 'jour sec', town: 'ville', improvement: 'amélioration', improvements: 'améliorations',
    'wet wipes': 'lingettes', 'cotton buds': 'cotons-tiges', 'washing vegetables': 'lavage des légumes', 'cat litter': 'litière pour chat',
    'frying oil': 'huile de friture', 'coffee grounds': 'marc de café', fleece: 'polaire', 'washing machine': 'machine à laver',
    glitter: 'paillettes', 'old milk': 'vieux lait', milk: 'lait', 'salty pasta water': 'eau salée des pâtes', salt: 'sel',
    'fat and proteins': 'graisses et protéines',
    valve: 'vanne', rake: 'racle', 'sampling cup': 'gobelet de prélèvement', 'magnifying glass': 'loupe',
    sifting: 'tamisage', 'sand filter': 'filtre à sable', 'storm basin': 'bassin d’orage', 'evaporation pond': 'bassin d’évaporation',
    'second settling tank': 'deuxième décanteur', 'finer grid': 'grille plus fine', 'container park': 'parc à conteneurs',
    'pee, poo and toilet paper': 'pipi, caca et papier toilette', workers: 'ouvriers', 'price to pay': 'prix à payer',
    dissolved: 'dissous', 'heavier than water': 'plus lourd que l’eau', 'lighter than water': 'plus léger que l’eau',
    'sinks to the bottom': 'coule au fond', sink: 'coulent', 'floats on top': 'flotte au-dessus', floats: 'flotte',
    'tiny pieces': 'minuscules morceaux', slowly: 'lentement', 'slips between': 'glisse entre', 'long and thin': 'long et fin',
    'too big': 'trop gros', 'harmful': 'nocif', harms: 'nuit à', fish: 'poissons', 'break down': 'décomposent', 'scraped off': 'raclée',
    sewers: 'égouts', blocked: 'bouchée', 'held back': 'retenu', 'hold back': 'retiennent', 'holds back': 'retient',
    'keep an eye on': 'surveille', 'stays behind': 'reste', tick: 'coche', 'operator log': 'journal de l’opérateur',
    'clear water': 'eau limpide', cloudy: 'trouble', tangled: 'emmêlées', sheets: 'feuilles', fabric: 'tissu', sticks: 'bâtonnets',
    crunch: 'crissent', clay: 'argile', greasy: 'gras', layer: 'couche', smells: 'sent', sweet: 'sucré', lemon: 'citron',
    streaks: 'traînées', flakes: 'flocons', crumbs: 'miettes', threads: 'fils', specks: 'petits points', sparkle: 'brillent',
    shiny: 'brillants', bubbles: 'bulles', exit: 'sortie', 'fall apart': 'se défont', 'stick to': 'collent à',
    'goes over': 'passe par', straight: 'directement', heated: 'chauffée', 'fills up': 'se remplit',
    'twice as long': 'deux fois plus longtemps', 'closer together': 'plus serrés', calm: 'calme',
    'at the scale of': 'à l’échelle de'
  },

  /* Ce que montre un prélèvement (décrit, jamais interprété). base : ce
     qu'on voit toujours à cet endroit ; puis une ligne par chose trouvée. */
  looks: {
    base: {
      grid: { all: 'What the bars hold back: leaves, sticks and paper.' },
      grit: { all: 'One sample from the bottom of the tank, one from the top.' },
      bio: { all: 'Brown water full of small flakes: they are bacteria. Air bubbles everywhere.' },
      settle: { all: 'From the bottom of the tank: a brown sludge.' },
      river: { dry: 'Clear water.', rain: 'Clear water.', storm: 'Cloudy brown water.' }
    },
    grid: {
      wipes: 'Soft white sheets of fabric, all tangled together.',
      buds: 'A few thin white plastic sticks with cotton at the ends.'
    },
    grit: {
      sand: 'Bottom: grey-brown grains that crunch between the fingers.',
      litter: 'Bottom: small grey balls of clay.',
      oil: 'Top: a thick yellow layer, greasy to the touch.',
      nothing: 'Bottom and top: nothing special.'
    },
    bio: {
      lemonade: 'At the entrance of the tank, the water smells sweet, like lemon. At the exit: no more sweet smell.',
      milk: 'At the entrance of the tank: white cloudy streaks in the water. At the exit: no more white streaks.',
      nothing: 'At the entrance and at the exit of the tank, the water looks and smells the same.'
    },
    settle: {
      coffee: 'Dark brown crumbs in the sludge.',
      fibres: 'With the magnifying glass: tiny coloured threads in the sludge.',
      glitter: 'Tiny shiny specks that sparkle in the sludge.'
    },
    river: {
      wipes: 'Pieces of soft white fabric.',
      buds: 'Thin white plastic sticks floating on the water.',
      sand: 'Grey-brown grains at the bottom of the cup.',
      litter: 'Small grey balls of clay at the bottom of the cup.',
      oil: 'Greasy yellow drops on the surface.',
      coffee: 'Dark brown crumbs.',
      fibres: 'With the magnifying glass: tiny coloured threads.',
      glitter: 'Tiny shiny specks.'
    }
  },

  // Étape Check : pourquoi.
  explanations: {
    samples: 'Each post holds back what its technique can separate. What no post holds back reaches the river, even when the water looks clear.',
    storm: 'Today was a stormy day: a quarter of the water went over the storm overflow, without any treatment. A bit of everything reached the river.',
    posts: {
      grid: 'Sifting: the bars let the water through and hold back the big pieces.',
      grit: 'Decantation: the water flows slowly; heavy grains sink to the bottom, grease floats on top and is scraped off.',
      bio: 'Not a separation: bacteria eat the food mixed in the water. It disappears: nothing is collected.',
      settle: 'Decantation: the water stays a long time in a calm tank; tiny pieces slowly sink and make the sludge.'
    },
    items: {
      wipes: 'Wet wipes do not fall apart like toilet paper: they stay big, and the grid holds them back. They block the grid and the pumps.',
      buds: 'Cotton buds are long and thin: most of them slip between the bars of the grid and go through the station to the river.',
      sand: 'Sand is heavier than water: it sinks to the bottom of the sand and grease tank.',
      litter: 'Cat litter is made of heavy grains of clay: it sinks to the bottom of the sand and grease tank.',
      oil: 'Frying oil is lighter than water: it floats on top of the sand and grease tank and is scraped off. In the sewers, it sticks to the pipes.',
      coffee: 'Coffee grounds are tiny pieces: they sink slowly in the calm settling tank.',
      fibres: 'A fleece loses tiny plastic fibres in the washing machine. Most of them sink slowly in the settling tank, but some reach the river.',
      glitter: 'Glitter is made of tiny pieces of plastic. Most of it sinks slowly in the settling tank, but some reaches the river.',
      lemonade: 'Lemonade is water with dissolved sugar: the bacteria eat the sugar.',
      milk: 'Milk is food mixed in the water: the bacteria eat it. In the river, it would take the oxygen of the fish.',
      salt: 'Salt is dissolved: no post of the station can stop it, so it reaches the river. At this amount, it does not harm the fish.',
      medicine: 'Medicine is dissolved: the bacteria break down only a little of it, and the rest reaches the river, where it harms the fish. Old medicine goes back to the pharmacy.'
    },
    choice: 'An improvement only helps if it stops what reaches the river today. Some things are dissolved: no machine of the station can stop them, but people can keep them out of the drain. Evaporation would separate everything, but at the scale of a town it needs far too much energy, and the river would get no water.'
  },

  check: {
    samplesGood: 'Your log matches what was in each sample. Well observed!',
    sampleWrong: (place, right) => `${place}: look at your log again. Here, we find: ${right}.`,
    techGood: 'You named the technique of each post. Well done!',
    techWrong: (place, right) => `${place}: the right answer is “${right}”.`,
    placesGood: 'You found where each thing ends up, and why. Well explained!',
    answerWrong: 'Not quite. The correct answer:',
    best: list => `The best improvement today: ${list}.`,
    bestNone: clean => (clean
      ? 'Today, nothing harmful reaches the river: no improvement is needed.'
      : 'Today, no improvement within the budget makes the river cleaner.'),
    choiceWrong: 'Your choice is not the one that protects the river best today, within the budget.',
    notTestedNote: 'You did not test the improvement you chose: a scientist checks before choosing.',
    becauseWrong: detail => `Your reasons do not match.${detail ? ` ${detail}` : ''}`,
    upgradeDoes: (name, items, how, price) => `${name} keeps ${items} out of the river today; it works by ${how}; the price to pay: ${price}.`,
    nothingToday: 'nothing',
    choiceGood: 'The best improvement for today, tested, with the right reasons. Well argued!',
    verdictOk: word => `Indeed: ${word}. Well judged!`,
    verdictWrong: word => `Compare your hypothesis with your results: it is ${word}.`,
    placedRight: (n, total) => `${n} of your ${total} things were in the right place.`,
    yourHyps: 'Your hypotheses:',
    rejectedNote: 'A rejected hypothesis is not a mistake: it is how science moves on.'
  }
});
