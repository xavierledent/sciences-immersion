/* ===== Labo virtuel « Keep the lights on » (phys1) : textes en anglais =====

   Simulation commune aux deux filières : js/lab-grid.js, chargée après ce
   fichier. Le néerlandais (nl/jaar1/phys1/lab-grid.nl.js) a exactement les
   mêmes clés.

   Chaque mot du lexique (glossary) est souligné partout où il apparaît,
   sauf dans les boutons (lab-engine.js) ; [mot] ou [mot|clé] reste utile
   pour une forme dont la clé diffère.

   Mots du cours : « energy resource », « renewable / non-renewable »,
   « power plant », « wind farm », « solar panels », « blackout », « energy
   storage », « units ». Le labo s'en tient aux faits observés (pas de
   jugement de valeur : voir FO2). */

LabEngine.addText('grid', {
  labels: {
    title: 'Keep the lights on',

    // « a, b and c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0] || '',

    // Les installations : name (bouton, carte), the (dans une phrase), short (étiquette du paysage)
    plants: {
      wind: { name: 'Wind farm', the: 'the wind farm', short: 'Wind farm' },
      solar: { name: 'Solar panels', the: 'the solar panels', short: 'Solar panels' },
      nuclear: { name: 'Nuclear power plant', the: 'the nuclear power plant', short: 'Nuclear' },
      gas: { name: 'Gas power plant', the: 'the gas power plant', short: 'Gas' },
      coo: { name: 'Coo storage plant', the: 'the Coo storage plant', short: 'Coo' }
    },
    city: 'City',
    resources: { wind: 'wind', sun: 'sun', uranium: 'uranium', gas: 'natural gas', coal: 'coal', water: 'water' },
    forms: {
      chemical: 'chemical energy', mechanical: 'mechanical energy', thermal: 'thermal energy',
      electrical: 'electrical energy', light: 'light energy', nuclear: 'nuclear energy'
    },
    renewable: { yes: 'renewable', no: 'non-renewable' },
    periods: { morning: 'in the morning', afternoon: 'in the afternoon', evening: 'in the evening', night: 'at night' },
    periodsShort: { morning: 'morning', afternoon: 'afternoon', evening: 'evening', night: 'night' },
    yes: 'yes',
    no: 'no',
    unitsWord: 'units',
    hour: h => `${h} h`,

    questions: {
      q1: 'Can wind and sun alone give Belgium electricity all day long?',
      // La question 2 est tirée au sort parmi trois (voir js/lab-grid.js).
      q2: {
        night: 'How can Belgium have electricity at night when there is no wind?',
        follow: 'Which installations give more electricity in the evening, when more is needed?',
        coo: 'What is the Coo storage plant for?'
      }
    },
    yourQuestions: 'Your questions',
    intro: 'Belgium needs electricity day and night. In the control room, you decide which power plants work during one day. If there is not enough electricity at one moment: blackout!',
    hypothesisTitle: 'Your hypotheses',
    // Hypothèse 1 : un pari sur la panne du test 1.
    hyp1: b => `I think that with wind and sun alone, Belgium will have a blackout: ${b}.`,
    when: { never: 'never', night: 'only at night', both: 'during the day and at night' },
    hyp2: {
      night: 'I think that at night without wind, Belgium can use:',
      follow: 'I think that these installations give more electricity in the evening, when more is needed:',
      coo: (a, b) => `I think that Coo pumps water up when Belgium has ${a} electricity, and lets the water fall down when Belgium has ${b} electricity.`
    },
    // On ne stocke pas l'électricité elle-même (cours, mission 6) : Coo pompe l'eau, l'énergie est stockée en hauteur.
    cooWhen: { much: 'too much', little: 'too little' },
    cooRowA: 'Coo pumps water up when Belgium has:',
    cooRowB: 'The water falls down when Belgium has:',
    hyp2Hint: 'Choose one or more.',
    can: 'can',
    cannot: 'cannot',
    because: 'Why do you think so? (optional)',
    becausePlaceholder: 'Because…',
    hypothesisReady: 'Your hypotheses are ready.',
    hypothesisPending: 'Complete your two hypotheses.',
    toCards: 'Next: the power plants',

    tabs: { cards: 'The power plants', room: 'The control room' },

    // Onglet 1 : les cartes d'identité
    cardResource: 'Energy resource',
    cardRenewable: 'Renewable?',
    cardChain: 'Energy chain',
    cardStored: 'Energy stored (water high up)',
    noTurbine: 'No turbine!',
    choose: '— choose —',
    // La chaîne d'énergie : les objets (ovales du diagramme de flux).
    objects: { boiler: 'boiler', reactor: 'reactor', turbine: 'turbine', generator: 'generator', panel: 'solar panel' },
    cooNote: 'Coo has no energy resource: it uses the electricity of the other power plants to pump water up to a high lake, where the energy is stored. Later, the water falls down.',
    slotLabel: (what, plant) => `${what}, ${plant}`,
    captionCards: 'Complete the identity card of each power plant: choose in the lists. Then the control room opens.',
    captionCardsDone: 'All the identity cards are complete. Next: the control room!',
    lockRoom: n => `Complete the identity cards first: ${n === 1 ? '1 box' : n + ' boxes'} still empty.`,

    // Onglet 2 : la salle de contrôle
    test: n => `Test ${n}`,
    testTitle: { 1: 'Test 1: wind and sun only', 2: 'Test 2: your choice of power plants' },
    on: 'ON',
    off: 'OFF',
    faster: 'Faster',
    runDay: 'Run the day',
    runAgain: 'Run it again',
    // Les journées jouées : test 1, puis les essais du test 2.
    pillTest1: 'Test 1 · wind + sun',
    test2Goal: 'Test 2 · goal: no blackout',
    hoursShort: n => `${n} h`,
    tryTitle: (n, plant) => `Test 2, try ${n}: + ${plant}`,
    tapHint: 'Touch a column to see the details',
    cooStores: 'stores',
    cooGives: 'gives back',
    zoom: title => `${title}: show it big`,
    today: 'Today',
    // Le bulletin, en bref (au-dessus du carnet) ; la phrase entière va dans le rapport.
    forecastShort: (season, sky, wind) => {
      const day = { autumn: 'Autumn', winter: 'Winter' };
      const skies = { sunny: 'sun all day', grey: 'grey sky', morning: 'clouds in the morning', afternoon: 'clouds in the afternoon' };
      const winds = { storm: 'storm', morning: 'strong wind in the morning', afternoon: 'strong wind in the afternoon', light: 'light wind' };
      return `${day[season]} · ${skies[sky]} · ${winds[wind]} · no wind tonight`;
    },
    forecast: (season, sky, wind) => {
      const day = { autumn: 'An autumn day', winter: 'A winter day' };
      const skies = { sunny: 'sun all day', grey: 'clouds all day', morning: 'clouds in the morning', afternoon: 'clouds in the afternoon' };
      const winds = { storm: 'a storm during the day', morning: 'strong wind in the morning', afternoon: 'strong wind in the afternoon', light: 'light wind during the day' };
      return `${day[season]}: ${skies[sky]}, ${winds[wind]}, and no wind in the evening and at night.`;
    },
    graphTitle: 'Electricity in Belgium during one day',
    axisY: 'Energy (units)',
    axisX: 'Time (h)',
    legend: { nuclear: 'nuclear', wind: 'wind', solar: 'sun', gas: 'gas', coo: 'Coo', need: 'need', missing: 'missing', stored: 'stored in Coo' },
    blackoutSign: 'BLACKOUT',
    weather: { sun: 'sun', clouds: 'clouds', dark: 'dark', calm: 'no wind', light: 'light wind', strong: 'strong wind' },
    sceneLabel: 'Belgium during one day: the power plants, the weather and the city',
    hourButton: h => `${h} h: show the details`,
    // Détail d'une heure : t heure, weather météo, parts « nuclear 34 », need, missing
    hourDetail: (t, weather, parts, need, missing) => `${t}, ${weather}. Need: ${need} units. Electricity: ${parts || 'none'}.` +
      (missing ? ` Missing: ${missing} units, blackout!` : ' Enough electricity.'),
    part: (plant, v) => `${plant} ${v}`,
    storedPart: v => `Coo stores ${v} units`,

    captionTest1: 'Test 1: only the wind farm and the solar panels work. Run the day and watch the city.',
    captionRunning: 'The day is running… Watch the city, the weather and the graph.',
    captionTest1Done: 'Test 1 is over. Touch an hour of the graph to see the details. Then write your observations in your notebook.',
    captionTest2: 'Test 2: the same day, with the same weather. Add one power plant at a time, until there is no blackout!',
    captionAddPlant: 'Switch on one more power plant (only one), then run the day.',
    captionTryReady: plant => `${plant}: switched on. Run the day!`,
    // Sans le nombre d'heures : l'élève compte les colonnes rouges lui-même.
    captionBlackout: when => `Blackout (${when})! Count the red columns of the graph and write the hours of blackout in your notebook. Then switch on one more power plant.`,
    captionSuccess: 'No blackout all day long. Well done! Touch the hours of the graph, then write your observations in your notebook.',
    captionTest2Done: 'Test 2 is done: your day without blackout is saved. Touch an hour of the graph to see the details.',
    lockTest1Plant: 'Test 1: only the wind farm and the solar panels work.',
    lockRunning: 'The day is running. Wait until the end.',
    lockTest2Done: 'Test 2 is done: your day without blackout is saved.',
    lockRun1First: 'Run test 1 first.',
    lockRunFirst: 'Run the day first.',
    lockAlreadyOn: 'Already on: it stays on for the next tries.',
    lockPickPlant: 'Switch on one more power plant first.',
    lockHoursFirst: 'First count the hours of blackout of the last day and write them in your notebook.',
    lockSuccessFirst: 'First run a day without blackout (test 2).',

    notebookTitle: 'Your notebook',
    // Les heures de panne de chaque journée : l'élève compte les colonnes rouges.
    hoursTitle: 'Hours of blackout',
    hoursHint: 'Count the red columns of the graph.',
    hoursAria: day => `Hours of blackout, ${day}`,
    hourUnit: 'h',
    n1Nothing: 'When did wind and sun give no electricity at all?',
    n1NothingHint: 'Choose one or more.',
    darkCalm: 'Dark and calm: the hours with the moon and no wind.',
    n2Head: 'Installation',
    n2Dark: 'Electricity when dark and calm?',
    n2Same: 'Same amount all day?',
    choiceLabel: (row, q, v) => `${row}, ${q}: ${v}`,

    toRoom: 'Next: the control room',
    toConclude: 'Next: conclude',
    lockCards: n => `Complete the identity cards: ${n === 1 ? '1 box' : n + ' boxes'} still empty.`,
    lockTests: 'Run test 1, write your observations, then run a day without blackout (test 2).',
    lockNotes: n => `Complete your notebook: ${n === 1 ? '1 answer' : n + ' answers'} still missing.`,
    runInfo: (c, ct, n, nt) => `Cards: ${c} / ${ct} · Notebook: ${n} / ${nt}`,
    lockHypothesis: 'Complete your two hypotheses first.',
    lockHypothesisFixed: 'Your hypotheses are fixed: the experiment has started. A scientist does not change the hypothesis after seeing the results!',

    // Étape 3
    resultsTitle: 'Your results',
    concl1a: b => `My results show that with wind and sun alone, Belgium had a blackout: ${b}.`,
    concl1: (b, c) => `So wind and sun alone ${b} give Belgium electricity all day long, because at night without wind they give ${c}.`,
    q1why: { none: 'no electricity', little: 'a little electricity', lot: 'a lot of electricity' },
    concl2: {
      night: 'My results show that at night without wind, Belgium can use:',
      follow: 'My results show that these installations give more electricity in the evening, when more is needed:',
      coo: (a, b) => `My results show that Coo pumps water up when Belgium has ${a} electricity, and lets the water fall down when Belgium has ${b} electricity.`
    },
    concl2b: b => `Coo gives back the energy that it ${b} during the day.`,
    stored: { stored: 'stored', made: 'made', destroyed: 'destroyed' },
    qVerdict: n => `So my hypothesis ${n} is`,
    confirmed: 'confirmed',
    rejected: 'rejected',
    checkConclusions: 'Check my conclusions',
    backToLab: 'Back to the lab',

    // Étape 4
    scoreLabel: 'checks passed',
    markCorrect: 'correct',
    markIncorrect: 'incorrect',
    criteria: { plants: 'Power plants', chains: 'Energy chains', notes: 'Observations', answers: 'Conclusions', verdicts: 'Hypotheses' },
    criteriaSub: { plants: 'Resources', chains: 'Your cards', notes: 'Your notebook', answers: 'Your answers', verdicts: 'Your judgement' },
    factsTitle: 'Identity cards: the facts',
    factsHead: { plant: 'Installation', resource: 'Energy resource', renewable: 'Renewable?', weather: 'Needs the weather?', dark: 'Dark and calm?', same: 'Same amount all day?' },
    factsStorage: 'storage',

    report: {
      title: 'Laboratory report — Keep the lights on',
      because: 'Because',
      materials: day => `A model of the electricity network of Belgium: a wind farm, solar panels, a nuclear power plant, a gas power plant and the Coo storage plant. ${day}`,
      procedure: [
        'Complete the identity card of each power plant: energy resource, renewable or not, form of energy at the start.',
        'Test 1: run the day with the wind farm and the solar panels only. Observe the city and the graph.',
        'Test 2: run the same day again (same weather: fair test), with one more power plant at each try, until there is no blackout.',
        'Write your observations in the notebook.'
      ],
      cardsCaption: 'Identity cards',
      notes1Caption: 'Notebook: test 1',
      notes2Caption: 'Notebook: test 2',
      triesCaption: 'Hours of blackout (test 1, then one more power plant at each try of test 2)',
      triesHead: { try: 'Try', added: 'Power plant added', hours: 'Hours of blackout' },
      graphCaption: n => `Test ${n}`,
      graphTitle: 'Electricity in Belgium during one day',
      test1: (hours, when) => `Test 1 (wind and sun only): ${hours} hours of blackout. Wind and sun gave no electricity ${when}.`,
      test2: (tries, plants) => `Test 2: a day without blackout after ${tries === 1 ? '1 try' : tries + ' tries'}, with ${plants}.`,
      dark: list => `When it was dark and calm, the electricity came from: ${list}.`,
      verdict: (n, word) => `My hypothesis ${n} is ${word}.`,
      score: n => `Score: ${n} / 5 checks passed.`
    }
  },

  glossary: {
    blackout: 'panne d’électricité générale', 'power plant': 'centrale électrique', 'power plants': 'centrales électriques',
    'wind farm': 'parc éolien', 'all day long': 'toute la journée', dark: 'il fait noir',
    stored: 'stocké(e)', stores: 'stocke', storage: 'stockage', 'gives back': 'rend', pumps: 'pompe',
    'high up': 'en hauteur', 'switch on': 'allume', amount: 'quantité', need: 'besoin (ce qu’il faut)',
    enough: 'assez', missing: 'manquant', coal: 'charbon', 'fair test': 'expérience équitable',
    wasted: 'perdue', neighbours: 'voisins', 'control room': 'salle de contrôle'
  },

  // Étape Check : les faits, centrale par centrale, et le bilan.
  explanations: {
    wind: 'A wind farm needs wind: when there is no wind, it gives no electricity.',
    solar: 'Solar panels need the light of the sun: at night, they give no electricity. With clouds, they give less.',
    nuclear: 'A nuclear power plant works day and night, always with the same amount. It does not depend on the weather.',
    gas: 'A gas power plant can be switched on and off quickly: it follows the need, more in the evening, less at noon. It does not depend on the weather.',
    coo: 'When there is more electricity than needed, Coo pumps water up to a high lake: the energy is stored as mechanical energy. When electricity is missing, the water falls down through turbines: Coo gives back electrical energy.',
    losses: 'Coo gives back only about 3 units for every 4 units used to pump the water up: the rest is wasted energy (thermal energy in the water and the machines).',
    noTurbine: 'Solar panels have no turbine: they transform light energy directly into electrical energy.',
    other: 'In this model, there are five installations. In real life, Belgium also has other power plants (biomass, small hydroelectric plants), and it imports electricity from its neighbours when it does not have enough.',
    facts: 'These are facts: you can check them with the graph. Which power plant is the best is a value judgment: people do not all agree.'
  },

  check: {
    nothing: 'nothing',
    cardWrongRes: (plant, said, right) => `${plant}: you wrote “${said}”. Its energy resource is ${right}.`,
    cardWrongRen: (plant, said, right) => `${plant}: you wrote “${said}”. The right answer: ${right}.`,
    cardsAllGood: 'All your energy resources and all your “renewable or not” answers are correct. Well done!',
    chainWrong: (plant, said, right) => `${plant}: you wrote “${said}”. The energy at the start is ${right}.`,
    chainsAllGood: 'All your energy chains start with the right form of energy. Well done!',
    chainWhy: {
      wind: 'The wind is moving air: mechanical energy.',
      solar: 'The sun gives light: light energy.',
      nuclear: 'Uranium has nuclear energy.',
      gas: 'Natural gas burns: it has chemical energy.',
      coo: 'The water high up has mechanical energy (because of its height).'
    },
    notesScore: (good, total) => `${good} / ${total} observations match what happened.`,
    notesAllGood: 'Your notebook matches what happened in the control room. Well observed!',
    hoursWrong: (day, said, right) => `${day}: you wrote ${said} hours of blackout, but the graph has ${right} red columns.`,
    nothingWrong: (said, right) => `Test 1: you chose ${said}. Wind and sun gave no electricity at all ${right}: look at the empty columns of the graph.`,
    plantWrong: (plant, q, said, right) => `${plant}, “${q}”: you wrote “${said}”, but the answer is “${right}”.`,
    answerOk: 'Correct!',
    answerWrong: 'Not quite. The correct answer:',
    verdictOk: v => `Your hypothesis and your conclusion ${v === 'confirmed' ? 'say the same thing' : 'do not say the same thing'}: it is indeed ${v}. Well judged!`,
    verdictWrong: should => `Compare your hypothesis with your conclusion: they ${should === 'confirmed' ? 'say the same thing, so your hypothesis is confirmed' : 'do not say the same thing, so your hypothesis is rejected'}.`,
    rejectedNote: 'A rejected hypothesis is not a mistake: it is how science moves on.',
    yourHyp: n => `Your hypothesis ${n}:`,
    yourConcl: n => `Your conclusion ${n}:`
  }
});
