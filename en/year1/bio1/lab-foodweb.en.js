/* ===== Labo virtuel « Pull one thread » (bio1) : textes en anglais =====

   Simulation commune aux deux filières : js/lab-foodweb.js, chargée après ce
   fichier. Le néerlandais (nl/jaar1/bio1/lab-foodweb.nl.js) a exactement les
   mêmes clés.

   Chaque mot du lexique (glossary) est souligné partout où il apparaît,
   sauf dans les boutons (lab-engine.js) ; [mot] ou [mot|clé] reste utile
   pour une forme dont la clé diffère.

   Mots du cours (partie 2) : « food chain », « food web », « producer »,
   « consumer », « scientific model », la flèche « is eaten by ». */

LabEngine.addText('foodweb', {
  labels: {
    title: 'Pull one thread',

    // « a, b and c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0] || '',

    /* Les êtres vivants : name (carte, jeton), short (dans une chaîne,
       « grass → rabbit → fox »), the (dans une phrase), many (le groupe :
       « the number of foxes »), food (une plante : ce qu'on en mange). */
    species: {
      oak: { name: 'Oak tree', short: 'oak', the: 'the oak tree', many: 'oak trees' },
      grass: { name: 'Grass', short: 'grass', the: 'the grass', many: 'grass' },
      bramble: { name: 'Bramble', short: 'bramble', the: 'the bramble', many: 'brambles', food: 'blackberries' },
      rabbit: { name: 'Rabbit', short: 'rabbit', the: 'the rabbit', many: 'rabbits' },
      mouse: { name: 'Mouse', short: 'mouse', the: 'the mouse', many: 'mice' },
      deer: { name: 'Deer', short: 'deer', the: 'the deer', many: 'deer' },
      caterpillar: { name: 'Caterpillar', short: 'caterpillar', the: 'the caterpillar', many: 'caterpillars' },
      squirrel: { name: 'Squirrel', short: 'squirrel', the: 'the squirrel', many: 'squirrels' },
      bluetit: { name: 'Blue tit', short: 'blue tit', the: 'the blue tit', many: 'blue tits' },
      fox: { name: 'Fox', short: 'fox', the: 'the fox', many: 'foxes' },
      owl: { name: 'Tawny owl', short: 'tawny owl', the: 'the tawny owl', many: 'tawny owls' },
      buzzard: { name: 'Buzzard', short: 'buzzard', the: 'the buzzard', many: 'buzzards' }
    },
    // Les cartes écologiques : ce que mange chaque être vivant.
    cards: {
      oak: 'A tree: makes its own food with sunlight. Fruits: acorns.',
      grass: 'A plant: makes its own food with sunlight.',
      bramble: 'A plant with blackberries: makes its own food with sunlight.',
      rabbit: 'Eats grass.',
      mouse: 'Eats acorns and blackberries.',
      deer: 'Eats grass, bramble leaves and young oak leaves.',
      caterpillar: 'Eats oak leaves.',
      squirrel: 'Eats acorns.',
      bluetit: 'Eats caterpillars, and blackberries in autumn.',
      fox: 'Hunts rabbits and mice.',
      owl: 'Hunts mice and blue tits, at night.',
      buzzard: 'Hunts rabbits and mice.'
    },
    numberOf: (many, cap) => `${cap ? 'The' : 'the'} number of ${many}`,

    questions: {
      main: 'What happens to a forest when one species disappears?',
      a: 'Which species change, and how?',
      b: 'Does a food web resist better than a single food chain?'
    },
    yourQuestion: 'Your question',
    hypothesisTitle: 'Your hypothesis',
    scenario: sick => `In a Belgian forest, a disease kills all the ${sick}. What happens in the next 10 years?`,
    hypWeb: 'In the food web of the forest:',
    hypChain: chain => `In a single food chain (${chain}):`,
    hypRow: num => `${num} will:`,
    // Les quatre allures : will (hypothèse), trends (phrase), trendShort (carnet).
    will: { rise: 'rise', same: 'stay about the same', fall: 'fall', gone: 'disappear' },
    trends: { rise: 'rises', same: 'stays about the same', fall: 'falls', gone: 'disappears' },
    trendShort: { rise: 'rises', same: 'same', fall: 'falls', gone: 'disappears' },
    because: 'Why do you think so? (optional)',
    becausePlaceholder: 'Because…',
    hypothesisReady: 'Your hypothesis is ready.',
    hypothesisPending: 'Choose one curve for each living thing.',
    toModel: 'Next: the model',
    lockHypothesis: 'Choose one curve for each living thing first.',
    lockHypothesisFixed: 'Your hypothesis is fixed: the model has already run. A scientist does not change the hypothesis after seeing the results!',

    tabs: { model: 'The model', disease: 'The disease' },

    // Onglet 1 : le modèle
    modes: { place: 'Place the cards', arrows: 'Draw the arrows' },
    rows: ['Consumers that eat animals', 'Consumers that eat plants', 'Producers'],
    cardsTitle: 'The ecological cards',
    onBoard: 'on the model',
    compare: 'Compare with the cards',
    comparesCount: n => (n ? `Comparisons: ${n}` : 'Read the cards carefully before you compare.'),
    compareResult: (row, right, missing, wrong) => `${row === 0 ? 'All the cards are in the right row.' : row === 1 ? '1 card is in the wrong row.' : `${row} cards are in the wrong row.`} ` +
      `Arrows: ${right} right, ${missing} missing, ${wrong} wrong.`,
    compareOk: 'Your model matches the cards. Well done!',
    compareLegend: 'On the model: a red card is in the wrong row, a red arrow is wrong, and “!” shows a living thing that is missing an arrow (something that it eats).',
    missingHere: 'An arrow is missing here: something that it eats',
    captionPlace: 'Take a card (touch it), then touch a free place of the model. Producers at the bottom!',
    captionPlaced: 'All the cards are on the model. Now draw the arrows: “is eaten by”.',
    captionHold: n => `${n}: touch a free place of the model.`,
    captionArrows: 'Touch the food first, then the living thing that eats it. The arrow means “is eaten by”. To remove an arrow, touch it.',
    captionFrom: the => `Now touch the living thing that eats ${the}.`,
    captionAdded: (a, b) => `New arrow: ${a} is eaten by ${b}.`,
    captionRemoved: (a, b) => `Arrow removed: ${a} → ${b}.`,
    captionTurned: (a, b) => `Arrow turned around: ${a} is eaten by ${b}.`,
    captionModelDone: 'Your model is ready. Next: the disease!',
    lockArrows: n => `Place all the cards first: ${n === 1 ? '1 card' : n + ' cards'} left.`,
    lockPlaceAll: 'Place all the cards on the model first.',
    lockNoArrow: 'Draw the arrows first.',
    lockModelDone: 'Your model matches the cards: it is ready.',
    lockDisease: 'Your model must match the cards first.',

    // Onglet 2 : la maladie
    testTitle: { 1: 'Test 1 · the food web', 2: 'Test 2 · a single food chain' },
    banner1: sick => `A disease kills all the ${sick}. All the other living things of your model stay in the forest.`,
    banner2: sick => `The same disease kills all the ${sick}, but in a single food chain.`,
    runModel: 'Run the model: 10 years',
    runAgain: 'Run it again',
    captionTest1: 'Run the model and watch the graphs.',
    captionTest2: 'Test 2: the same disease, in a single food chain. Run the model.',
    captionYear: y => `Year ${y}…`,
    captionRan1: 'Ten years later… Read the graphs and complete your notebook.',
    captionRan2: 'Ten years later… Read the graphs and complete your notebook.',
    captionTest2Open: 'Test 1 is in your notebook. Next: test 2!',
    lockRunning: 'The model is running. Wait until the end.',
    lockTest2: 'Complete your notebook for test 1 first.',
    lockRun1First: 'Run test 1 first.',
    lockRun2First: 'Run test 2 first.',
    graphTitle: many => `Number of ${many}`,
    axisX: 'Time (years)',
    axisY: 'Number',
    pointValue: (year, v) => `Year ${year}: ${v}`,
    tapPoint: 'Touch a point to see its value.',

    notebookTitle: 'Your notebook',
    notebookHint: 'Read the graphs: the number at year 0 and at year 10, then the shape of the curve.',
    yearShort: y => `Year ${y}`,
    numAria: (many, y) => `Number of ${many}, year ${y}`,

    toDisease: 'Next: the disease',
    toConclude: 'Next: conclude',
    lockModel: 'Your model must match the cards first.',
    lockTests: 'Run test 1 and test 2.',
    lockNotes: n => `Complete your notebook: ${n === 1 ? '1 answer' : n + ' answers'} still missing.`,
    runInfo: (p, pt, n, nt) => `Cards: ${p} / ${pt} · Notebook: ${n} / ${nt}`,

    // Étape 3
    resultsTitle: 'Your results',
    trendHead: 'Curve',
    recapRow: (short, chain) => (chain ? `${short} (single chain)` : short),
    zoom: title => `${title}: show the graphs big`,
    choose: '— choose —',
    conclA: (num, trend, cause) => `${num} ${trend} because ${cause}.`,
    trendAria: many => `How the number of ${many} changes`,
    causeAria: many => `Why the number of ${many} changes`,
    causes: { less: 'they have less food', hunted: 'they are hunted more', more: 'they have more food', none: 'nothing changes in their food or their predators', disease: 'the disease kills them too' },
    conclB: (resist, reason) => `So a food web ${resist} than a single food chain, because in a food web, the animals ${reason}.`,
    resist: { better: 'resists better', worse: 'does not resist better' },
    reasons: { other: 'have other food sources', babies: 'have more babies', strong: 'are stronger' },
    reasonAria: 'Why',
    verdictTitle: 'Your hypothesis',
    verdictRow: (short, chain) => (chain ? `${short} (single chain)` : short),
    confirmed: 'confirmed',
    rejected: 'rejected',
    checkConclusions: 'Check my conclusions',
    backToLab: 'Back to the lab',

    // Étape 4
    scoreLabel: 'checks passed',
    markCorrect: 'correct',
    markIncorrect: 'incorrect',
    criteria: { model: 'Model', notes: 'Observations', answerA: 'Question a', answerB: 'Question b', verdicts: 'Hypothesis' },
    criteriaSub: { model: 'Your food web', notes: 'Your notebook', answerA: 'Which species change?', answerB: 'Web or chain?', verdicts: 'Your judgement' },
    rightWeb: 'The food web of the cards (the arrow means “is eaten by”):',
    webTitle: 'My food web model',
    // La nourriture que l'espèce malade partageait avec son concurrent.
    sharedFood: { rabbit: 'grass', mouse: 'acorns' },
    hypText: (num, will) => `I think that ${num} will ${will}.`,
    hypChainText: (chain, num, will) => `In a single food chain (${chain}), I think that ${num} will ${will}.`,

    report: {
      title: 'Laboratory report — Pull one thread',
      because: 'Because',
      materials: '12 ecological cards of a Belgian forest. A computer model of the food web that runs over 10 years.',
      procedure: (sick, chain) => [
        'Place each ecological card on its level: producers at the bottom, then consumers that eat plants, then consumers that eat animals.',
        'Draw the arrows (“is eaten by”) and compare the model with the cards until it matches.',
        `Test 1: a disease kills all the ${sick}. Run the model over 10 years and read the graphs.`,
        `Test 2: the same disease in a single food chain (${chain}). Run the model and read the graph.`,
        'Write the numbers at year 0 and year 10, and the shape of each curve, in the notebook.'
      ],
      model: n => `The model matched the cards after ${n === 1 ? '1 comparison' : n + ' comparisons'}.`,
      notesCaption: 'Notebook: number of animals',
      change: (row, a, b) => `${row}: from ${a} (year 0) to ${b} (year 10).`,
      verdict: (row, word) => `${row}: my hypothesis is ${word}.`,
      score: n => `Score: ${n} / 5 checks passed.`
    }
  },

  glossary: {
    'food web': 'réseau trophique', 'food chain': 'chaîne alimentaire', single: 'seul(e)',
    'is eaten by': 'est mangé par', eats: 'mange', hunts: 'chasse', hunted: 'chassé(e)s', predators: 'prédateurs',
    disease: 'maladie', species: 'espèce(s)', 'living thing': 'être vivant', 'living things': 'êtres vivants',
    food: 'nourriture', 'food sources': 'sources de nourriture', leaves: 'feuilles',
    'oak tree': 'chêne', oak: 'chêne', 'oak trees': 'chênes', acorns: 'glands', grass: 'herbe',
    bramble: 'ronce', brambles: 'ronces', blackberries: 'mûres',
    rabbit: 'lapin', rabbits: 'lapins', mouse: 'souris (mulot)', mice: 'souris (mulots)', deer: 'cerf(s)',
    caterpillar: 'chenille', caterpillars: 'chenilles', squirrel: 'écureuil', squirrels: 'écureuils',
    'blue tit': 'mésange bleue', 'blue tits': 'mésanges bleues', fox: 'renard', foxes: 'renards',
    'tawny owl': 'chouette hulotte', 'tawny owls': 'chouettes hulottes', buzzard: 'buse', buzzards: 'buses',
    rises: 'augmente', falls: 'diminue', 'stays about the same': 'reste à peu près pareil',
    row: 'rangée', arrows: 'flèches', arrow: 'flèche', babies: 'petits', stronger: 'plus forts',
    sunlight: 'la lumière du soleil', matches: 'correspond à', wrong: 'faux / mauvais'
  },

  // Étape Check : pourquoi chaque espèce change.
  explanations: {
    pred: (pred, sick, others) => `The ${pred} eat ${sick}, but also ${others}. Without ${sick}, they have less food: their number falls. But they do not disappear, because they still have other food.`,
    other: (other, preds, sick) => `The ${preds} cannot eat ${sick} any more: they hunt more ${other}. So the number of ${other} falls.`,
    other2: (other, top, mid, sick) => `Without ${sick}, the ${mid} have less food: there are fewer ${mid}. The ${top} eat ${mid} and ${other}: now they hunt more ${other}. So the number of ${other} falls.`,
    same: (who, sick) => `The ${who} do not eat ${sick}, and ${sick} do not eat ${who}: their food and their predators stay the same. So their number stays about the same.`,
    rival: (rival, food, sick) => `The ${sick} and the ${rival} ate the same food: ${food}. Without ${sick}, there is more ${food} for the ${rival}: their number rises.`,
    // Les flèches qui arrivent à un mangeur : « rabbit and mouse → fox ».
    eats: (eater, foods) => `${foods} → ${eater}`,
    chain: (pred, sick) => `In a single food chain, the ${pred} eat only ${sick}. Without ${sick}, they have nothing to eat: they disappear.`,
    web: 'A food web is made of many food chains that share the same living things. When one species disappears, most animals still have other food sources: a food web is more stable than a single food chain.',
    model: 'Your food web is a scientific model: a simplified representation of reality. A real Belgian forest has many more living things, and the numbers also change with the weather and other diseases. But the model helps to understand what can happen.'
  },

  check: {
    nothing: 'nothing',
    modelOk: n => `Your model matched the cards after ${n === 1 ? '1 comparison' : n + ' comparisons'}. Well done!`,
    modelKo: n => `Your model matched the cards only after ${n} comparisons.`,
    modelRule: max => `Goal: read the cards carefully, and compare at most ${max} times.`,
    notesScore: (good, total) => `${good} / ${total} observations match the graphs.`,
    notesAllGood: 'Your notebook matches the graphs. Well observed!',
    readWrong: (row, year, said, right) => `${row}, year ${year}: you wrote ${said}, but the graph shows ${right}.`,
    trendWrong: (row, said, right) => `${row}: you wrote “${said}”, but the curve ${right}.`,
    readHow: 'To read a graph: find the year on the horizontal axis, go up to the point, then go left to the vertical axis. One line of the grid more or less is accepted.',
    answerOk: 'Correct!',
    answerWrong: 'Not quite. The correct answer:',
    yourHyp: 'your hypothesis:',
    yourResult: 'your result:',
    verdictOk: v => `Your hypothesis and your result ${v === 'confirmed' ? 'say the same thing' : 'do not say the same thing'}: it is indeed ${v}. Well judged!`,
    verdictWrong: should => `Compare your hypothesis with your result: they ${should === 'confirmed' ? 'say the same thing, so your hypothesis is confirmed' : 'do not say the same thing, so your hypothesis is rejected'}.`,
    rejectedNote: 'A rejected hypothesis is not a mistake: it is how science moves on.'
  }
});
