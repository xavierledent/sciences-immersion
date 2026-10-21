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
      q2: 'How can Belgium have electricity at night when there is no wind?'
    },
    yourQuestions: 'Your questions',
    intro: 'Belgium needs electricity day and night. In the control room, you decide which power plants work during one day. If there is not enough electricity at one moment: blackout!',
    hypothesisTitle: 'Your hypotheses',
    hyp1: b => `I think that wind and sun alone ${b} give Belgium electricity all day long.`,
    hyp2: 'I think that at night without wind, Belgium can use:',
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
    chainTurbine: '→ turbine → generator → electrical energy',
    chainSolar: '→ solar panel → electrical energy',
    noTurbine: 'No turbine!',
    chainCoo: 'Electricity pumps water up. Later, the water falls: → turbine → generator → electrical energy',
    emptySlot: 'empty',
    slotLabel: (what, plant) => `${what}, ${plant}`,
    bankResources: 'Energy resources',
    bankForms: 'Forms of energy',
    captionCards: 'Complete the identity card of each power plant: take a word, then choose its place. Then the control room opens.',
    captionWordPicked: word => `In your hand: ${word}. Choose a lit box.`,
    captionPickWord: 'Take a word first, then choose a box.',
    captionCardsDone: 'All the identity cards are complete. Next: the control room!',
    lockRoom: n => `Complete the identity cards first: ${n === 1 ? '1 box' : n + ' boxes'} still empty.`,

    // Onglet 2 : la salle de contrôle
    test: n => `Test ${n}`,
    testTitle: { 1: 'Test 1: wind and sun only', 2: 'Test 2: your choice of power plants' },
    on: 'ON',
    off: 'OFF',
    run: n => `Run test ${n}`,
    faster: 'Faster',
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
    captionTest2: 'Test 2: the same day, with the same weather. Switch on the power plants you need, then run the day. Goal: no blackout!',
    captionBlackout: (n, when) => `Blackout during ${n === 1 ? '1 hour' : n + ' hours'} (${when}). Change your power plants and run the day again.`,
    captionSuccess: 'No blackout all day long. Well done! Touch the hours of the graph, then write your observations in your notebook.',
    captionTest2Done: 'Test 2 is done: your day without blackout is saved. Touch an hour of the graph to see the details.',
    lockTest1Plant: 'Test 1: only the wind farm and the solar panels work.',
    lockRunning: 'The day is running. Wait until the end.',
    lockTest2Done: 'Test 2 is done: your day without blackout is saved.',
    lockNotes1: 'Write your observations of test 1 first.',
    lockRun1First: 'Run test 1 first.',
    lockSuccessFirst: 'First run a day without blackout (test 2).',
    lockShowTest2: 'Run test 2 first.',

    notebookTitle: 'Your notebook',
    n1Blackout: 'Was there a blackout?',
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
    concl1: (b, c) => `My results show that wind and sun alone ${b} give Belgium electricity all day long, because at night without wind they give ${c}.`,
    q1why: { none: 'no electricity', little: 'a little electricity', lot: 'a lot of electricity' },
    concl2: 'My results show that at night without wind, Belgium can use:',
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
      day: (season, clouds) => `One day in ${season === 'winter' ? 'winter' : 'autumn'}, ${clouds === 'none' ? 'with sun all day' : clouds === 'morning' ? 'with clouds in the morning' : 'with clouds in the afternoon'}, and no wind in the evening and at night.`,
      procedure: [
        'Complete the identity card of each power plant: energy resource, renewable or not, form of energy at the start.',
        'Test 1: run the day with the wind farm and the solar panels only. Observe the city and the graph.',
        'Test 2: run the same day (same weather: fair test) with the power plants of your choice, until there is no blackout.',
        'Write your observations in the notebook.'
      ],
      cardsCaption: 'Identity cards',
      notes1Caption: 'Notebook: test 1',
      notes2Caption: 'Notebook: test 2',
      graphCaption: n => `Test ${n}`,
      graphTitle: 'Electricity in Belgium during one day',
      test1: (blackout, when) => `Test 1 (wind and sun only): blackout: ${blackout}. Wind and sun gave no electricity ${when}.`,
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
    blackoutWrong: said => `Test 1, blackout: you wrote “${said}”. In test 1, the city went dark: there was a blackout.`,
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
