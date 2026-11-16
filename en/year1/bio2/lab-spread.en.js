/* ===== Labo virtuel « Invisible spread » (bio2) : textes en anglais =====

   Simulation commune aux deux filières : js/lab-spread.js, chargée après
   ce fichier. Le néerlandais (nl/jaar1/bio2/lab-spread.nl.js) a exactement
   les mêmes clés, sauf le lexique (glossary).

   Les mots du lexique sont soulignés d'office partout où ils apparaissent
   (traduction française au survol ou au toucher) ; [mot|clé] seulement pour
   une forme dont la clé diffère. « well » (creux de la plaque) est dans le
   lexique : ne pas l'employer comme adverbe (« well done »).

   Mots du cours (chapitre bio2, PART 5) : STI, sexual contact, sexual
   intercourse, condom, HPV vaccine, « often there are no signs », « get
   tested regularly ». Jamais « partager », « boire » ou « toucher » pour le
   modèle : mélanger deux tubes = un contact sexuel sans préservatif.

   Phrases de la conclusion : chacune reçoit sa liste déroulante toute
   faite ; les choix (words) sont écrits pour s'y insérer tels quels. Les
   mêmes phrases servent à donner la bonne réponse dans la correction et le
   rapport. */

LabEngine.addText('spread', {
  labels: {
    title: 'Invisible spread',

    // Page d'accueil (Mission) : toujours la même, rien du tirage ; des gestes, jamais des résultats.
    briefTitle: 'Mission: follow an infection you cannot see',
    briefTask: 'In a group, one person has an STI, but nobody knows it: often there are no signs. With a model, follow how it spreads, and find out what can slow it down.',
    briefSteps: [
      '<strong>Predict</strong> how the STI will spread.',
      '<strong>Mix</strong> the tubes, <strong>test</strong> them and <strong>count</strong>. Then <strong>replay</strong> with protection.',
      '<strong>Explain</strong> what you found.'
    ],
    // Sous chaque phrase courte : le comment, en une phrase (jamais le résultat).
    briefDetails: [
      'Read the card of today’s STI. Choose a graph and complete two sentences.',
      'Tap each pair of tubes to mix them. After each test, tick the pink wells in your notebook.',
      'Use your notebook and your graph. Then compare the model with real life.'
    ],
    tools: { tubes: 'test tubes', pipette: 'pipette', plate: 'test plate', indicator: 'indicator' },

    yourQuestion: 'Your question',
    bigQuestion: 'How does an STI spread in a group, and what can slow it down?',
    subQuestions: [
      'How does the number of people with the STI change, round after round?',
      'Half of the group is protected. What happens to the people who are not protected?',
      'Is the model like real life?'
    ],

    // La légende du modèle : affichée du début à la fin.
    legend: {
      title: 'In this model:',
      tube: '1 test tube = 1 person',
      mix: 'mixing two tubes = sexual contact without a condom',
      pink: 'pink after the test = this person has the STI',
      cap: 'a cap = a condom',
      sticker: 'a blue sticker = vaccinated against HPV',
      real: 'In real life, an STI is not passed on by sharing a glass, a tube or a towel.'
    },

    // L'IST du jour (tirée) : trois faits repris du cours (Mission 14).
    todaySti: 'Today’s STI',
    sti: {
      hpv: {
        name: 'HPV',
        facts: [
          'HPV is a virus.',
          'It passes by skin contact in the genital area. Often there are no signs.',
          'There is a vaccine. A condom reduces the risk, but it does not protect completely.'
        ]
      },
      chlamydia: {
        name: 'Chlamydia',
        facts: [
          'Chlamydia is caused by a bacterium.',
          'It passes during sexual intercourse. Often there are no signs.',
          'A condom protects against it. There is no vaccine.'
        ]
      }
    },

    hypothesisTitle: 'Your hypothesis',
    hyp: {
      shape: 'How will the number of people with the STI change, round after round?',
      protect: 'Half of the group is protected. What will happen to the people who are not?',
      condoms: 'Half of the group uses condoms. Compared with no protection at all, how many people <strong>without a condom</strong> will have the STI?',
      vaccine: 'Half of the group has the HPV vaccine. Compared with no protection at all, how many people <strong>without the vaccine</strong> will have the STI?'
    },
    // Sous les trois petits graphiques.
    shapes: {
      same: 'It stays about the same.',
      one: 'One more person each round.',
      faster: 'It can double each round.'
    },
    compare: { more: 'more', same: 'as many', fewer: 'fewer' },
    because: 'Why do you think so? (optional)',
    becausePlaceholder: 'Because…',
    hypothesisReady: 'Your hypothesis is ready.',
    hypothesisPending: 'Choose a graph and complete the two sentences.',
    toBench: 'Next: the experiment',

    lockHypothesis: 'First choose a graph and complete the two sentences.',
    lockHypothesisFixed: 'Your hypothesis is fixed: the experiment has started. A scientist does not change the hypothesis after seeing the results!',
    lockNotStarted: 'Carry out the experiment first.',
    lockRun: 'Finish the experiment first.',

    // Étape 2 : les trois parties, la paillasse, les contacts, le test, le carnet.
    parts: {
      1: 'Part 1 · No protection',
      2: 'Part 2 · Half of the group uses condoms',
      3: 'Part 3 · Half of the group has the HPV vaccine'
    },
    partInfo: {
      1: 'Three rounds of contacts, a test after each round.',
      2: 'The same contacts, with condoms.',
      3: 'The same contacts, with the vaccine.'
    },
    views: { bench: 'Bench', graph: 'Graph' },
    exchangesTitle: 'Contacts',
    round: n => `Round ${n}`,
    // Deux numéros de tubes (déjà mis en forme).
    pair: (a, b) => `${a} + ${b}`,
    replay: {
      condoms: 'Replay the 3 rounds with condoms',
      vaccine: 'Replay the 3 rounds with the vaccine'
    },
    testTitle: 'Test',
    sample: 'Put a drop of each tube in the plate',
    dye: 'Add the indicator',

    notesTitle: 'Your notebook',
    notesHead: 'Test',
    totalHead: 'Total',
    unprotHead: 'Without protection',
    rows: {
      r1: 'After round 1',
      r2: 'After round 2',
      r3: 'After round 3',
      condoms: 'With condoms',
      vaccine: 'With the vaccine'
    },
    cellAria: (row, n) => `${row}, tube ${n}`,
    numAria: {
      total: row => `${row}, total`,
      unprot: row => `${row}, without protection`
    },
    notesHint: 'Tap a box to tick a pink well. Then write how many wells are pink.',
    notesHintProt: 'Striped columns: the 6 protected people (parts 2 and 3). “Without protection”: count the pink wells in the other columns.',
    choose: 'choose',

    // La légende : la prochaine chose à faire (voir phase dans la simulation).
    captions: {
      mix: n => `Round ${n}: tap each pair of tubes to mix them. The order does not matter.`,
      sample: 'Test the tubes: put a drop of each tube in the test plate.',
      dye: 'Now add the indicator to the wells. Watch the colours.',
      note: row => `Look at the plate. In your notebook, line “${row}”: tick the pink wells, then write the total.`,
      unprotFirst: 'Part 2: the striped columns are the protected people. In the line “After round 3”, count the pink wells of the people without protection.',
      unprot: 'Count the pink wells of the people without protection (not striped) and write the number.',
      replay: {
        condoms: 'The purple caps are the condoms. Replay the same contacts with condoms.',
        vaccine: 'The blue stickers are the HPV vaccine. Replay the same contacts with the vaccine.'
      },
      graph: 'Draw a bar for each round: slide it up to the total in your notebook.',
      toGraph: 'Open the graph.',
      next: {
        part2: 'Part 1 is finished. Go on to part 2 with the button at the bottom.',
        part3: 'Part 2 is finished. Go on to part 3 with the button at the bottom.',
        graph: 'The three parts are finished. Now draw your graph: use the button at the bottom.',
        conclude: 'The experiment is over. Look at your notebook and your graph, then go on to conclude.'
      }
    },
    captionMixing: (a, b) => `You mix tube ${a} and tube ${b} with the pipette.`,
    captionMixedAlready: 'These two tubes are already mixed. Mix another pair.',
    captionReplayUse: 'In this part, the contacts are replayed: use the button below the contacts.',
    captionReplayed: 'The contacts have already been replayed. Now test the tubes.',
    captionReplaying: {
      condoms: 'The same contacts, with condoms…',
      vaccine: 'The same contacts, with the vaccine…'
    },
    captionSampling: 'A drop of each tube goes into its well.',
    captionDyeing: 'The indicator goes into each well…',
    captionBadNumber: max => `Write a whole number from 0 to ${max}.`,

    lockRoundMix: n => `First mix all the pairs of round ${n}.`,
    lockRoundTest: n => `First test the tubes after round ${n}.`,
    lockRoundNote: n => `First note the test after round ${n} in your notebook (the total too).`,
    lockSampleMix: n => `First mix all the pairs of round ${n}.`,
    lockSampleReplay: 'First replay the three rounds.',
    lockDyeSample: 'First put a drop of each tube in the plate.',
    lockSampleDone: 'The drops are already in the plate: now add the indicator.',
    lockTestNote: 'This test is done: first note it in your notebook.',
    lockTestsDone: 'No more test in this part: go on with the button at the bottom.',
    lockRowTest: 'Test the tubes first: this line is for a later test.',
    lockRowClosed: 'This test is over: the plate now shows another test.',
    lockUnprotLater: 'In part 2, you will know who is protected.',
    lockReplayUnprot: 'First count the people without protection in the line “After round 3”.',
    lockGraph: 'First finish the three parts.',
    // Ce qui manque encore (bouton du pied touché trop tôt).
    missing: {
      mix: n => `Mix all the pairs of round ${n}.`,
      replay: 'Replay the three rounds.',
      sample: 'Put a drop of each tube in the plate.',
      dye: 'Add the indicator.',
      note: 'Tick the pink wells and write the total in your notebook.',
      unprot: 'Write how many people without protection have the STI.',
      graph: 'Draw the three bars of your graph.',
      next: label => `Press “${label}” at the bottom.`
    },
    next: {
      part2: 'Next: replay with condoms',
      part3: 'Next: replay with the vaccine',
      graph: 'Next: draw the graph',
      conclude: 'Next: conclude'
    },

    // Histogramme (fiche outil FO5b).
    chart: {
      title: 'People with the STI after each round (no protection)',
      scale: '1 square = 1 person',
      yName: 'People with the STI',
      xName: 'Round',
      cats: ['Round 1', 'Round 2', 'Round 3'],
      how: 'Slide each bar up to the total in your notebook, or tap at the right height.'
    },

    backToLab: 'Back to the lab',
    checkConclusions: 'Check my conclusions',
    resultsTitle: 'Your results',
    yourHyp: {
      shape: x => `Round after round: ${x}`,
      condoms: x => `People without a condom: ${x}.`,
      vaccine: x => `People without the vaccine: ${x}.`
    },
    qShape: 'How did the number of people with the STI change, round after round?',
    qProtect: 'Half of the group was protected. What happened to the people who were not?',
    qReal: 'And in real life? True or false?',
    // Chaque phrase reçoit sa liste ; dans la correction, le bon choix.
    concl: {
      shape: sel => `Round after round, the number of people with the STI ${sel}.`,
      condoms: sel => `Compared with part 1, among the people without a condom, ${sel}.`,
      vaccine: sel => `Compared with part 1, among the people without the vaccine, ${sel}.`,
      both: sel => `So, during sexual contact, a condom protects ${sel}.`
    },
    words: {
      shape: { same: 'stayed about the same', one: 'grew by about one person each round', faster: 'grew faster and faster (it could double)' },
      condoms: { more: 'more people had the STI', same: 'the same number of people had the STI', fewer: 'fewer people had the STI' },
      vaccine: { more: 'more people had the STI', same: 'the same number of people had the STI', fewer: 'fewer people had the STI' },
      both: { one: 'only the person who uses it', both: 'both partners' }
    },
    conclAria: {
      shape: 'How the number changed',
      condoms: 'With condoms',
      vaccine: 'With the vaccine',
      both: 'Who a condom protects'
    },
    verdictShape: 'My hypothesis 1 is',
    verdictProt: 'My hypothesis 2 is',
    verdicts: { confirmed: 'confirmed', partly: 'partly confirmed', rejected: 'rejected' },
    real: {
      contact: 'An STI passes during sexual contact, not by sharing a glass or a towel.',
      signs: 'A person who has an STI always has signs.',
      onlyOne: 'If only one partner uses a condom, only that partner is protected.',
      test: 'Only a test shows if a person has an STI.'
    },
    trueFalse: { true: 'true', false: 'false' },

    scoreLabel: 'checks passed',
    markCorrect: 'correct',
    markIncorrect: 'incorrect',
    criteria: { counts: 'Your notes', graph: 'The graph', spread: 'The spread', protection: 'Protection', reality: 'Real life' },
    criteriaSub: {
      counts: 'The pink wells and the totals',
      graph: 'Your three bars',
      spread: 'Your answer to question 1',
      protection: 'Your answer to question 2',
      reality: 'True or false?'
    },

    // Listes de numéros : « 1, 4 and 7 ».
    list: items => (items.length < 2 ? (items[0] || '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`),
    none: 'none',

    report: {
      title: 'Laboratory report — An STI you cannot see: invisible spread',
      because: 'Because',
      exchanges: 'The contacts (the same in the three parts):',
      protected: list => `Protected people in parts 2 and 3: ${list} (a cap = a condom, then a blue sticker = the HPV vaccine).`,
      pinkHead: 'Pink wells',
      graphMark: 'My graph',
      realTitle: 'In real life:',
      verdict: (text, word) => `${text} ${word}.`,
      materials: sti => `12 test tubes in a rack (1 tube = 1 person), a pipette, a test plate with 12 wells, an indicator, caps (= condoms), blue stickers (= the HPV vaccine). Today’s STI: ${sti}. At the start, one person has it, but all the tubes are clear.`,
      steps: [
        'Mix the tubes two by two: three rounds of contacts.',
        'After each round, put a drop of each tube in the test plate and add the indicator. Tick the pink wells and count them.',
        'Replay the same contacts: half of the group uses condoms. Test again.',
        'Replay the same contacts: the same half of the group has the HPV vaccine. Test again.',
        'Count the people without protection who have the STI. Draw the graph of the three rounds.'
      ],
      score: (n, total) => `Score: ${n} / ${total} checks passed.`
    }
  },

  glossary: {
    'test tube': 'tube à essai', 'test tubes': 'tubes à essai', rack: 'portoir',
    'test plate': 'plaque de test', well: 'creux (de la plaque)', wells: 'creux (de la plaque)',
    cap: 'bouchon', caps: 'bouchons', sticker: 'autocollant', stickers: 'autocollants',
    condom: 'préservatif', condoms: 'préservatifs', sti: 'IST', 'sexual intercourse': 'rapport sexuel',
    'skin contact': 'contact de la peau', towel: 'essuie (serviette)',
    round: 'tournée', rounds: 'tournées', mix: 'mélanger', mixing: 'mélanger', mixed: 'mélangé',
    drop: 'goutte', drops: 'gouttes', pink: 'rose', clear: 'incolore (transparent)', striped: 'rayé',
    fewer: 'moins', 'as many': 'autant', spread: 'propagation (se propager)', spreads: 'se propage',
    'slow it down': 'la freiner', 'slows it down': 'la freine', replay: 'rejouer', half: 'moitié',
    tick: 'cocher', ticks: 'coches', 'grew': 'a augmenté', 'faster and faster': 'de plus en plus vite',
    'about the same': 'à peu près pareil', 'reduces the risk': 'réduit le risque',
    'passed on': 'transmis', 'pass it on': 'la transmettre', 'pass it to': 'la transmettre à', catch: 'attraper',
    'both partners': 'les deux partenaires', 'compared with': 'comparé à', 'real life': 'vraie vie',
    'get tested': 'se faire dépister', 'shared responsibility': 'responsabilité partagée'
  },

  // Étape Check : ce que montre le modèle.
  explanations: {
    spread: 'In each round, every person with the STI can pass it to a partner, and these people can pass it on in the next round. So the number can double each round: it grows faster and faster. And nobody sees it: all the tubes stayed clear.',
    condoms: 'A contact is protected when one of the two partners uses a condom. So a person without a condom is protected too when the partner uses one: protection is a shared responsibility.',
    vaccine: {
      hpv: 'A vaccinated person cannot catch HPV, so cannot pass it on. That protects the people without the vaccine too: around them, fewer people can pass on HPV.',
      chlamydia: 'Today’s STI was chlamydia. The HPV vaccine protects only against HPV: against chlamydia, it changed nothing. There is no vaccine against chlamydia, but a condom protects.'
    },
    leak: 'With HPV, one protected contact still passed the virus: a condom reduces the risk, but it does not protect completely, because HPV can also be on the skin around the condom. That is why the vaccine is important too.',
    real: {
      contact: 'In the model, mixing two tubes stands for sexual contact. Glasses, towels or test tubes do not pass on an STI.',
      signs: 'Often there are no signs: in the model too, all the tubes stayed clear.',
      onlyOne: 'The condom is between the two partners: it protects both of them.',
      test: 'Like the indicator in the model, only a test shows it. Get tested regularly.'
    },
    model: 'This lab is a model: people are not test tubes, and in real life, an STI does not pass at every contact. But the model shows how an infection you cannot see spreads, and what slows it down.'
  },

  check: {
    noExperiment: 'You did not carry out the experiment: there are no notes.',
    countsScore: (good, total) => `${good} / ${total} notes match the test plate.`,
    countsKey: 'Pink dot: pink well on the plate. ✓: your tick. A red box is a mistake. Striped: the protected people.',
    countsAllGood: 'All your notes match the test plate. Great work!',
    countsHow: 'Look at each well of the plate carefully, tick only the pink ones, then count your ticks.',
    barLine: (cat, yours, expected) => `${cat}: your bar shows ${yours}, your notebook says ${expected}.`,
    graphHow: 'Each bar must go up to the total of that test in your notebook (1 square = 1 person).',
    yourTotals: (a, b, c) => `Your notebook: ${a} after round 1, ${b} after round 2, ${c} after round 3.`,
    yourUnprot: (a, b, c) => `People without protection who had the STI: ${a} in part 1, ${b} with condoms, ${c} with the vaccine.`,
    judgedOk: 'Good judgement!',
    judgedWrong: 'Your judgement does not match your results.',
    verdict: {
      confirmed: 'Your hypothesis and your conclusion say the same thing: hypothesis confirmed.',
      rejected: 'Your hypothesis and your conclusion do not say the same thing: hypothesis rejected.'
    },
    verdictProt: {
      confirmed: 'Your two predictions match your two conclusions: hypothesis confirmed.',
      partly: 'Only one of your two predictions matches your conclusions: hypothesis partly confirmed.',
      rejected: 'None of your two predictions matches your conclusions: hypothesis rejected.'
    },
    pinkNote: list => `The plate showed pink wells for: ${list}.`,
    totalNote: n => `There were ${n} pink wells.`,
    unprotNote: n => `${n} of the people without protection (not striped) had the STI.`,
    graphNote: list => `Your bars must match your totals: ${list}.`,
    rightIs: sentence => `The correct answer, from your notes: ${sentence}`
  }
});
