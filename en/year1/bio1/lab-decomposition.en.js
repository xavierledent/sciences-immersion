/* ===== Labo virtuel « The vanishing leaves » (bio1) : textes en anglais =====

   Simulation commune aux deux filières : js/lab-decomposition.js, chargée
   après ce fichier. Le néerlandais (nl/jaar1/bio1/lab-decomposition.nl.js) a
   exactement les mêmes clés.

   [mot] ou [mot|clé] : mot du lexique, souligné, traduction française au
   survol ou au toucher (clé dans glossary, en minuscules).

   Phrases d'hypothèse et de conclusion : début + condition + comparaison +
   condition (« I think that dead leaves will disappear » + « in living soil »
   + « faster than » + « in sterilized soil »). */

LabEngine.addText('decomposition', {
  labels: {
    title: 'The vanishing leaves',

    // Masse au dixième, avec le séparateur décimal de la langue.
    num: v => v.toFixed(1),
    // « a, b and c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0] || '',

    questions: {
      decomposers: 'Do decomposers make [dead leaves] disappear?',
      worms: 'Do [earthworms] [speed up] the decomposition of [dead leaves]?',
      water: 'Does humidity change the speed of decomposition?',
      temperature: 'Does temperature change the speed of decomposition?'
    },
    // Formes sans lexique, pour le rapport imprimé.
    questionsPlain: {
      decomposers: 'Do decomposers make dead leaves disappear?',
      worms: 'Do earthworms speed up the decomposition of dead leaves?',
      water: 'Does humidity change the speed of decomposition?',
      temperature: 'Does temperature change the speed of decomposition?'
    },
    conditions: {
      soil: { living: 'in living soil', sterile: 'in sterilized soil' },
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
    changeSetupTitle: 'Change the set-up?',
    changeSetupText: 'Your measurements will be erased: you will prepare your jars again and start from week 0.',
    changeSetupYes: 'Yes, change it',
    toConclude: 'Next: conclude',
    runInfo: (w, n, total) => `Week ${w} of 8 · ${n} / ${total} masses written`,
    missingPoints: 'Weigh each bag and write its mass in the table first.',
    balanceEmpty: 'Drag a [bag|mesh bag] here',
    balanceJar: n => `Leaves of jar ${n}<br>([bag tared])`,
    weekBadge: w => `Week ${w}`,
    bagOf: n => `Bag of jar ${n}: drag it to the balance, or tap it`,
    captionStart: 'Every bag starts with 10.0 g of leaves: the first masses are already in the table. Press “Wait 2 weeks” to let time pass.',
    captionWeigh: 'Drag the [bag|mesh bag] of a [jar] onto the balance, or tap it, to [weigh] the leaves.',
    captionRecord: n => `Leaves of jar ${n} [weighed]. Read the balance and write the mass in the table.`,
    captionRecorded: 'Mass written down. Weigh the next bag.',
    captionAllPlaced: 'All the bags are weighed. Press “Wait 2 weeks” at the top to let time pass!',
    captionDone: 'Week 8: the experiment is over. Look at your graph, then go on to conclude.',
    captionNeedWeigh: n => `First [weigh] the bag of jar ${n} on the balance.`,
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
    markCorrect: 'correct',
    markIncorrect: 'incorrect',
    criteria: { fair: 'Fair test', points: 'Measurements', answer: 'Conclusion', verdict: 'Hypothesis' },
    criteriaSub: { fair: 'Your experiment', points: 'Your table', answer: 'Your answer', verdict: 'Your judgement' },
    legendReading: 'balance readings',

    report: {
      title: 'Laboratory report — The decomposition of dead leaves',
      because: 'Because',
      materials: (n, leaf, extras) => `${n} glass jars with a lid, soil, ${n} mesh bags, ${n * 10} g of dead ${leaf} leaves (10.0 g per bag)${extras.length ? ', ' + extras.join(', ') : ''}, a balance.`,
      extras: { oven: 'an oven (to sterilize the soil)', worms: 'earthworms', spray: 'a water spray', fridge: 'a fridge (4 °C)' },
      procedureStart: 'Put soil in each jar, then a mesh bag with 10.0 g of dead leaves on top.',
      procedureJar: (n, desc) => `Jar ${n}: ${desc}.`,
      procedureWeigh: 'Every 2 weeks, take out each bag, weigh the leaves (bag tared) and put the bag back. Do this for 8 weeks.',
      procedureGraph: 'Draw a line graph of the mass of the leaves against time.',
      tableWeek: 'Week',
      tableUnit: 'Mass of the leaves (g)',
      pair: (a, b) => `jar ${a} and jar ${b}`,
      interpretation: (pair, a, b, diff, ma, mb) => `I compared ${pair}. ${diff} After 8 weeks, jar ${a} had ${ma} of leaves left and jar ${b} had ${mb}.`,
      noteAnswer: right => `Look at your graph again. The right conclusion: ${right}`,
      noteVerdict: (hyp, ans, should) => `Your hypothesis said “${hyp}”, your conclusion says “${ans}”: they ${should === 'confirmed' ? 'say the same thing, so your hypothesis is confirmed' : 'do not say the same thing, so your hypothesis is rejected'}.`,
      differ: list => `They differ by: ${list}.`,
      differNothing: 'They are prepared in the same way.',
      noData: 'no measurement',
      conclusion: (sentence, verdict) => `${sentence} My hypothesis is ${verdict}.`,
      score: n => `Score: ${n} / 4 checks passed.`
    }
  },

  glossary: {
    'dead leaves': 'feuilles mortes', 'speed up': 'accélérer',
    earthworms: 'vers de terre',
    moist: 'humide', dry: 'sec', fridge: 'frigo',
    jar: 'bocal', weigh: 'peser', weighed: 'pesé',
    'mesh bag': 'sachet en filet', 'bag tared': 'sachet taré (la balance retire la masse du sachet)',
    hazel: 'noisetier', oak: 'chêne', beech: 'hêtre',
    'fair test': 'expérience équitable', fungi: 'champignons',
    'feed on': 'se nourrissent de', 'cold slows decomposers down': 'le froid ralentit les décomposeurs',
    'food keeps longer': 'la nourriture se conserve plus longtemps',
    'organic matter': 'matière organique', 'mineral matter': 'matière minérale', 'cycle of matter': 'cycle de la matière'
  },

  // Étape Check : ce qui se passe, selon la question tirée.
  explanations: {
    decomposers: 'In living soil, decomposers — bacteria and [fungi], too small to see — [feed on] the [dead leaves]. They turn this [organic matter] into [mineral matter], which goes back into the soil. Heating the soil in an oven kills them: in sterilized soil, the leaves hardly change.',
    worms: '[Earthworms] are decomposers too. They pull dead leaves into the soil, eat them and cut them into tiny pieces, so bacteria and [fungi] work faster. Without earthworms, the leaves still disappear, but more slowly: the bacteria and fungi are still there.',
    water: 'Decomposers need water to live. In dry soil, bacteria and [fungi] are much less active, so dead leaves stay much longer.',
    temperature: '[Cold slows decomposers down]. In the fridge, bacteria and [fungi] are much less active, so the leaves disappear more slowly. This is also why [food keeps longer] in a fridge.'
  },
  cycle: 'This is how a forest recycles its dead leaves: the [mineral matter] released by the decomposers feeds the plants again (the [cycle of matter]).',

  // f, d : noms de facteurs (labels.factorNouns) ; v, r : masses déjà
  // écrites (labels.num), v vaut null si rien n'a été noté.
  check: {
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
    pointsMiss: (j, w, v, r) => v == null ? `Jar ${j}, week ${w}: nothing written (the balance showed ${r} g).` : `Jar ${j}, week ${w}: you wrote ${v} g, the balance showed ${r} g.`,
    pointsMore: n => `… and ${n} more.`,
    answerOk: 'Correct!',
    answerWrong: 'Not quite. The correct answer:',
    answerUnfair: 'Careful: your test was not fair, so your own results could not really show this.',
    verdictOk: v => `Your hypothesis and your conclusion ${v === 'confirmed' ? 'say the same thing' : 'do not say the same thing'}: it is indeed ${v}. Well judged!`,
    verdictWrong: (should) => `Compare your hypothesis with your conclusion: they ${should === 'confirmed' ? 'say the same thing, so your hypothesis is confirmed' : 'do not say the same thing, so your hypothesis is rejected'}.`,
    rejectedNote: 'A rejected hypothesis is not a mistake: it is how science moves on.',
    yourHyp: 'Your hypothesis:',
    yourConcl: 'Your conclusion:'
  }
});
