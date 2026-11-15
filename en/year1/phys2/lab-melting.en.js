/* ===== Labo virtuel « The great melting race » (phys2) : textes en anglais =====

   Simulation commune aux deux filières : js/lab-melting.js, chargée après
   ce fichier. Le néerlandais (nl/jaar1/phys2/lab-melting.nl.js) a
   exactement les mêmes clés, sauf le lexique (glossary).

   Les mots du lexique sont soulignés d'office partout où ils apparaissent
   (traduction française au survol ou au toucher) ; [mot|clé] seulement pour
   une forme dont la clé diffère.

   Phrases de la conclusion : chacune reçoit sa liste déroulante toute
   faite ; les choix (words) sont écrits pour s'y insérer tels quels. Les
   mêmes phrases servent à donner la bonne réponse dans la correction et le
   rapport. mug : la tasse ; jug : la cruche graduée. */

LabEngine.addText('melting', {
  labels: {
    title: 'The great melting race',

    // Page d'accueil (Mission) : toujours la même, rien du tirage ; des gestes, jamais des résultats.
    briefTitle: 'Mission: find the best ice melter',
    briefTask: 'A small mug of very hot water, a big jug of cooler water and two identical ice blocks. Which water will melt more ice?',
    briefSteps: [
      '<strong>Bet</strong> on the winner.',
      '<strong>Weigh</strong>, <strong>measure</strong>, <strong>pour</strong> and <strong>look</strong> at the particles.',
      '<strong>Explain</strong> who won, and why.'
    ],
    // Sous chaque phrase courte : le comment, en une phrase (jamais le résultat).
    briefDetails: [
      'Tap your choices. You can say why.',
      'Write everything in your notes. The particle magnifier shows what happens inside each box.',
      'Use your notes and what you saw in the magnifier.'
    ],

    // Nombres entiers ; température avec le signe moins typographique.
    deg: v => (v < 0 ? '−' : '') + Math.abs(v),
    vol: v => `${v} mL`,
    mass: m => `${m} g`,
    minutes: n => `${n} min`,
    units: { c: '°C', ml: 'mL' },
    subtraction: (a, b, r) => `${a} − ${b} = ${r}`,

    yourQuestion: 'Your question',
    bigQuestion: 'Does the hottest water always melt the most ice?',
    todayTitle: 'Your experiment',
    // Volumes et températures déjà écrits (labels.vol, labels.deg + °C).
    situation: (mv, mt, jv, jt) => `A glass mug with ${mv} of water at ${mt}. A jug with ${jv} of water at ${jt}. Two identical ice blocks, two identical insulated boxes.`,

    hypothesisTitle: 'Your hypothesis',
    hyp: {
      winner: 'Which water will melt more ice?',
      final: 'When the ice stops melting, which water will be warmer?'
    },
    betChoices: {
      winner: { mug: 'the mug’s water', jug: 'the jug’s water', same: 'the same mass of ice' },
      final: { mug: 'the mug’s water', jug: 'the jug’s water', same: 'the same temperature' }
    },
    because: 'Why do you think so? (optional)',
    becausePlaceholder: 'Because…',
    hypothesisReady: 'Your hypothesis is ready.',
    hypothesisPending: 'Make your two bets.',
    toBench: 'Next: the experiment',

    // name : sous le récipient ; col : en-tête du carnet ; box : la boîte où va cette eau.
    sides: {
      mug: { name: 'mug', col: 'Mug', box: 'the mug’s box' },
      jug: { name: 'jug', col: 'Jug', box: 'the jug’s box' }
    },
    tools: { probe: 'thermometer', lens: 'particle magnifier', balance: 'balance', tray: 'tray', box: 'insulated box', ice: 'ice block' },
    pour: 'Pour',
    choose: 'choose',

    lockHypothesis: 'Make your two bets first.',
    lockHypothesisFixed: 'Your hypothesis is fixed: the experiment has started. A scientist does not change the hypothesis after seeing the results!',
    lockNotStarted: 'Carry out the experiment first.',
    lockRun: 'Finish the experiment first: every box of your notes and what you saw in the magnifier.',
    lockVolPoured: 'The water is in the box now: you cannot read this volume any more.',
    lockT0Late: 'Time has passed: the water is not at its starting temperature any more.',
    lockT0Probe: 'First put a thermometer in this water.',
    lockIce0Fixed: 'This ice block is under water now: you cannot weigh it any more.',
    lockIce0Balance: 'First put an ice block on the balance.',
    lockEndWait: 'Wait until the thermometers do not change any more.',
    lockIce1: box => `First take the ice block out of ${box} and put it on the balance.`,
    lockMelted: 'First write the mass of the ice block at the start and at the end.',
    lockPourIce: 'First put a weighed ice block in the box below.',
    lockPourIce0: 'First write the mass of the ice block.',
    lockPourProbe: 'First put a thermometer in this water.',
    lockPourT0: 'First write the temperature of this water.',
    lockPourVol: 'First write the volume of this water.',
    lockSeenStart: 'First put the magnifier on each box.',
    lockSeenFixed: 'Time has passed: this note is about the start.',
    lockSeenEnd: 'Put the magnifier on each box again.',
    lockWaitPour: 'Pour both waters first.',
    lockWaitLook: 'First look into both boxes with the particle magnifier.',
    lockWaitSeen: 'First write what you see in the magnifier.',
    lockLens: 'Pour some water first: the magnifier looks inside the boxes.',

    wait: n => `Wait ${n} minutes`,
    waitLocked: 'Not yet',
    waitReady: 'Watch the thermometers',
    waitDone: 'Nothing changes any more',
    waitDoneSub: 'The thermometers stay the same.',
    timerInfo: 'Time since pouring',

    lensTitle: 'Particle magnifier',
    lensOn: box => `Inside ${box}`,
    lensEmpty: 'Put the particle magnifier on a box to see its particles.',
    keyDot: '1 dot = many particles of water',
    seenStart: 'At the start',
    seenEnd: 'At the end',
    seenLabels: {
      fastStart: 'The particles move faster in…',
      moreStart: 'There are more particles in…',
      fastEnd: 'The particles move faster in…'
    },
    seenChoices: { mug: 'the mug’s box', jug: 'the jug’s box', same: 'no difference' },

    notesTitle: 'Your notes',
    groups: { before: 'Before pouring', after: 'When nothing changes any more', result: 'Result' },
    fields: {
      vol: 'Volume of water',
      t0: 'Temperature at the start',
      ice0: 'Ice block at the start',
      t1: 'Temperature at the end',
      ice1: 'Ice block at the end',
      melted: 'Melted ice'
    },
    fieldUnits: { vol: 'mL', t0: '°C', ice0: 'g', t1: '°C', ice1: 'g', melted: 'g' },
    cellAria: (field, side) => `${field}, ${side}`,
    meltedHint: 'Melted ice = ice block at the start − ice block at the end.',

    // La légende : la prochaine chose à faire (voir nextTask dans la simulation).
    captions: {
      weigh: 'Take an ice block from the tray and put it on the balance.',
      readMass: 'Read the balance. Write the mass of the ice block in your notes.',
      toBox: 'Put the weighed ice block in an empty insulated box. Then weigh the other one.',
      reweigh: 'Put an ice block back on the balance and write its mass.',
      probe: 'Take a thermometer and put it in the mug. Put the other one in the jug.',
      t0: 'Read the thermometers. Write the temperature of each water in your notes.',
      vol: 'Read the volume of water on the mug and on the jug. Write it in your notes.',
      pour: 'Everything is written: press “Pour” to pour each water on its ice block.',
      look: 'Take the particle magnifier and put it on each box. Look closely!',
      seen: 'Write what you see in the magnifier, under the picture.',
      wait: 'Let time pass: press “Wait 10 minutes”. Watch the thermometers and the ice.',
      t1: 'The thermometers do not change any more. Write the temperature of each water.',
      lookEnd: 'Put the particle magnifier on each box again.',
      seenEnd: 'Write what you see in the magnifier now.',
      readMassEnd: 'Read the balance. Write the mass of this ice block at the end.',
      freeBalance: 'Put this ice block on the tray. Then take the other one out of its box.',
      takeOut: 'Take each ice block out of its box and put it on the balance.',
      reweighEnd: 'Put the other ice block on the balance and write its mass.',
      melted: 'Calculate the mass of melted ice for each box: start minus end.',
      done: 'The experiment is over. Look at your notes, then go on to conclude.'
    },
    captionHoldIce: 'Now tap the place where you want to put it: the balance, the tray or a box.',
    captionHoldProbe: 'Now tap the water where you want to put the thermometer.',
    captionHoldLens: 'Now tap the box you want to look into.',
    captionWeighFirst: 'Weigh this ice block first: put it on the balance.',
    captionIceStays: 'The ice block stays in the water until the thermometers do not change any more.',
    captionTakeFirst: 'Take something first: tap it, then tap the place where it goes.',
    captionBoxEmpty: 'Put a weighed ice block in this box.',
    captionContProbe: 'Take a thermometer and put it in this water.',
    captionUsePour: 'To pour this water on its ice block, press “Pour”.',
    captionPouring: 'You pour the water on the ice block. The lid closes.',
    captionWaiting: 'Ten minutes go by…',
    captionBad: {
      vol: 'Write the volume shown on the container, in mL (for example 250).',
      t0: 'Write the temperature shown on the thermometer, in °C (for example 45).',
      ice0: 'Write the mass shown on the balance, in g (for example 950).',
      t1: 'Write the temperature shown on the thermometer, in °C (for example 45).',
      ice1: 'Write the mass shown on the balance, in g (for example 950).',
      melted: 'Write a whole number of grams (for example 120).'
    },

    runSetup: 'Set up your experiment.',
    runInfo: t => `Time since pouring: ${t}`,
    missingRun: 'Something is still missing: look at the red boxes.',
    toConclude: 'Next: conclude',
    backToLab: 'Back to the lab',
    checkConclusions: 'Check my conclusions',

    resultsTitle: 'Your results',
    yourBet: {
      winner: b => `Your bet on the winner: ${b}.`,
      final: b => `Your bet on the warmer water at the end: ${b}.`
    },
    qWinner: 'Who won the race? Was it the hottest water?',
    qWhy: 'Why? Think about the particles.',
    // Chaque phrase reçoit sa liste ; dans la correction, le bon choix.
    concl: {
      most: sel => `The winner: ${sel}.`,
      hottest: sel => `So the hottest water ${sel} the most ice.`,
      temp: sel => `The thermometer tells you ${sel}.`,
      energy: sel => `The thermal energy of the water depends on ${sel}.`,
      heat: sel => `In each box, ${sel}.`,
      stop: sel => `The ice stopped melting when the water and the ice ${sel}.`
    },
    words: {
      most: { mug: 'the mug’s water', jug: 'the jug’s water', same: 'no winner, they melted the same mass' },
      hottest: { yes: 'melted', no: 'did not melt' },
      temp: { energy: 'how much thermal energy there is', fast: 'how fast the particles move', many: 'how many particles there are' },
      energy: { fast: 'how fast its particles move', many: 'how many particles it has', both: 'how fast its particles move and how many it has' },
      heat: { cold: 'the ice gave cold to the water', waterToIce: 'the water gave heat to the ice', iceToWater: 'the ice gave heat to the water' },
      stop: { noEnergy: 'had no thermal energy left', sameTemp: 'had the same temperature', sameMass: 'had the same mass' }
    },
    conclAria: {
      most: 'The winner',
      hottest: 'Did the hottest water melt the most ice?',
      temp: 'What the thermometer tells you',
      energy: 'What the thermal energy depends on',
      heat: 'What happened in each box',
      stop: 'When the ice stopped melting'
    },
    verdictWinner: 'My bet on the winner is',
    verdictFinal: 'My bet on the warmer water at the end is',
    confirmed: 'confirmed',
    rejected: 'rejected',

    scoreLabel: 'checks passed',
    markCorrect: 'correct',
    markIncorrect: 'incorrect',
    criteria: { measure: 'Measurements', particles: 'The particles', winner: 'The winner', heat: 'Heat and temperature', verdict: 'Hypothesis' },
    criteriaSub: {
      measure: 'Your notes and your subtractions',
      particles: 'What you saw in the magnifier',
      winner: 'Your answer to “who won?”',
      heat: 'Your answer to “why?”',
      verdict: 'Your judgement'
    },
    // Sous un dessin figé de la loupe : la boîte et la température de l'eau.
    stillCaption: (box, t) => `${box}, ${t}`,

    report: {
      title: 'Laboratory report — Heat and temperature: the great melting race',
      because: 'Because',
      hypWinner: b => `The water that will melt more ice: ${b}.`,
      hypFinal: b => `When the ice stops melting, the warmer water will be: ${b}.`,
      materials: (mv, mt, jv, jt) => `A glass mug with ${mv} of water at ${mt}, a jug with ${jv} of water at ${jt}, two identical ice blocks, two identical insulated boxes with a lid, a balance, two digital thermometers, an imaginary particle magnifier.`,
      steps: [
        'Weigh each ice block and write its mass.',
        'Put a thermometer in each water. Write the temperature and the volume of each water.',
        'Put one ice block in each box. Pour the mug’s water on one block and the jug’s water on the other. Close the lids.',
        'Look inside each box with the particle magnifier.',
        'Wait until the thermometers do not change any more. Write the final temperatures. Look with the magnifier again.',
        'Take each ice block out and weigh it. Calculate the mass of melted ice.'
      ],
      seenStart: (fast, more) => `At the start, the particles moved faster in: ${fast}. There were more particles in: ${more}.`,
      seenEnd: fast => `At the end, the particles moved faster in: ${fast}.`,
      verdict: (text, word) => `${text} ${word}.`,
      score: (n, total) => `Score: ${n} / ${total} checks passed.`
    }
  },

  glossary: {
    'ice block': 'bloc de glace', 'ice blocks': 'blocs de glace',
    melt: 'fondre', melts: 'fond', melted: 'fondu (a fondu)', melting: 'fondre (la fonte)', melter: 'qui fait fondre',
    mug: 'tasse', jug: 'cruche graduée', 'insulated box': 'boîte isolante', 'insulated boxes': 'boîtes isolantes',
    lid: 'couvercle', lids: 'couvercles', tray: 'plateau', weigh: 'peser', weighed: 'pesé',
    magnifier: 'loupe', 'particle magnifier': 'loupe à particules', dot: 'point',
    heat: 'chaleur', 'thermal energy': 'énergie thermique', cold: 'froid',
    hottest: 'la plus chaude', warmer: 'plus chaude', cooler: 'plus froide',
    faster: 'plus vite', 'how fast': 'à quelle vitesse', 'how many': 'combien', 'how much': 'combien',
    bet: 'pari', winner: 'gagnant', race: 'course', 'let time pass': 'laisser passer le temps',
    'take out': 'sortir', 'stopped melting': 'a arrêté de fondre', 'stops melting': 'arrête de fondre',
    'moved faster': 'bougeaient plus vite', vibrate: 'vibrer (trembler sur place)'
  },

  // Étape Check : ce que montre le modèle.
  explanations: {
    particles: 'The magnifier shows all the water of each box: 1 dot stands for many particles. The hotter the water, the faster its particles move: the mug’s water was the hottest. The jug had more water, so more particles. At the end, both waters were at 0 °C: their particles moved at the same speed. In the ice, the particles stay in place and only vibrate.',
    // Volumes et températures déjà écrits.
    winner: {
      jug: (mv, mt, jv, jt) => `The mug’s water (${mv} at ${mt}) was hotter: its particles moved faster. But the jug had ${jv} of water: many more particles, even if they moved more slowly. All together, the jug’s water had more thermal energy to give to the ice. So the hottest water does not always melt the most ice: what counts is how fast the particles move and how many there are.`,
      mug: (mv, mt, jv, jt) => `The mug’s water (${mv} at ${mt}) had fewer particles than the jug’s water (${jv} at ${jt}), but they moved much faster. All together, here, the mug’s water had more thermal energy to give to the ice. The hottest water won this time, but not always: with much more water, a cooler water can win. What counts is how fast the particles move and how many there are.`,
      same: (mv, mt, jv, jt) => `The mug’s water (${mv} at ${mt}) had a few particles that moved fast. The jug’s water (${jv} at ${jt}) had many particles that moved more slowly. All together, they had the same thermal energy to give to the ice: the same mass melted. So the hottest water does not always melt the most ice.`
    },
    model: 'This lab is a model: the boxes are perfectly insulated (no heat comes from the air) and the ice starts at exactly 0 °C. In a real classroom, the numbers would be a little different.',
    // Les trois mots : [le mot, ce qu'il veut dire].
    words: {
      temperature: ['Temperature', 'How fast the particles move. A thermometer measures it, in °C.'],
      energy: ['Thermal energy', 'The energy of all the moving particles. It depends on how fast they move and on how many there are.'],
      heat: ['Heat', 'Thermal energy that goes from a hotter object to a colder one.']
    },
    cold: 'The ice does not give “cold”: heat always goes from the warmer object to the colder one. The water gave heat to the ice, so the water cooled down and the ice melted. The melting stopped when the water and the ice had the same temperature, 0 °C. At 0 °C, the water still has thermal energy: its particles still move.',
    finalTemp: 'At the end, both waters were at 0 °C, like the ice: heat stops going from one object to the other when they have the same temperature.'
  },

  // v : ce que l'élève a noté (null si rien) ; r : la vraie valeur ; déjà écrits avec leur unité.
  check: {
    noExperiment: 'You did not carry out the experiment: there are no measurements.',
    measureScore: (good, total) => `${good} / ${total} notes written correctly.`,
    measureAllGood: 'All your notes match the containers, the thermometers and the balance, and your subtractions are right. Well done!',
    fieldMiss: (col, field, v, r, source) => (v == null ? `${col}, ${field}: nothing written (${source} showed ${r}).` : `${col}, ${field}: you wrote ${v}, ${source} showed ${r}.`),
    meltedMiss: (col, v, right) => (v == null ? `${col}, melted ice: nothing written (${right}).` : `${col}, melted ice: you wrote ${v}, but ${right}.`),
    sources: { vol: 'the container', t0: 'the thermometer', ice0: 'the balance', t1: 'the thermometer', ice1: 'the balance' },
    more: n => `… and ${n} more.`,
    seenLine: (label, yours, right) => `${label} You chose: ${yours}. The magnifier showed: ${right}.`,
    seenNote: {
      fastStart: right => `The hottest water has the fastest particles: ${right}.`,
      moreStart: right => `More water means more particles: ${right}.`,
      fastEnd: right => `At the end, both waters were at 0 °C: ${right}.`
    },
    answerOk: 'Correct!',
    answerWrong: 'Not quite. The correct answer:',
    yourMelted: (a, b) => `Your notes: ${a} of ice melted with the mug’s water, ${b} with the jug’s water.`,
    whyNote: {
      temp: 'The temperature tells how fast the particles move, not how many there are.',
      energy: 'Faster particles or more particles: more thermal energy.',
      heat: 'Heat goes from the warmer object to the colder one. Cold does not move.',
      stop: 'Water at 0 °C still has thermal energy: its particles still move. Heat stops when the temperatures are the same.'
    },
    mostNote: right => `The correct answer, from your notes: ${right}`,
    verdictWinner: {
      confirmed: 'Your bet and your conclusion name the same winner: your bet is confirmed.',
      rejected: 'Your bet and your conclusion do not name the same winner: your bet is rejected.'
    },
    verdictFinal: {
      confirmed: 'Your bet and your final temperatures say the same thing: your bet is confirmed.',
      rejected: 'Your bet and your final temperatures do not say the same thing: your bet is rejected.'
    },
    yourConclusion: sentence => `Your conclusion: ${sentence}`,
    yourFinal: (a, b) => `Your notes at the end: ${a} in the mug’s box, ${b} in the jug’s box.`,
    judgedOk: 'Well judged!',
    judgedWrong: 'You judged it the other way round.',
    rejectedNote: 'A rejected hypothesis is not a mistake: it is how science moves on.'
  }
});
