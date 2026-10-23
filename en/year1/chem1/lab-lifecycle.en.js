/* ===== Labo virtuel « From the Earth and back » (chem1) : textes en anglais =====

   Simulation commune aux deux filières : js/lab-lifecycle.js, chargée après
   ce fichier. Le néerlandais (nl/jaar1/chem1/lab-lifecycle.nl.js) a
   exactement les mêmes clés.

   Chaque mot du lexique (glossary) est souligné partout où il apparaît,
   sauf dans les boutons (lab-engine.js) ; [mot] ou [mot|clé] reste utile
   pour une forme dont la clé diffère.

   Mots du cours (partie 4) : « lifecycle », « raw material extraction »,
   « manufacturing », « distribution », « use », « disposal », « recycling »,
   « TAKING / GIVING BACK », les 3 R (« reduce, reuse, recycle »), « blue PMC
   bin ». Énergie en « units », comme en physique. */

LabEngine.addText('lifecycle', {
  labels: {
    title: 'From the Earth and back',

    // « a, b and c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0] || '',
    // Nombres décimaux : point en anglais.
    num: v => String(v),

    question: 'Throw away, recycle or reuse: which way is best for the planet?',
    yourQuestion: 'Your question',
    hypothesisTitle: 'Your hypothesis',
    hypIntro: 'Rank the three ways, from the best to the worst for the planet.',
    places: ['1st: the best', '2nd', '3rd: the worst'],
    hypText: list => `I think that, from the best to the worst for the planet, the ways are: ${list}.`,
    because: 'Why do you think so? (optional)',
    becausePlaceholder: 'Because…',
    hypothesisReady: 'Your hypothesis is ready.',
    hypothesisPending: 'Rank the three ways: one way on each line.',
    toJourney: 'Next: the journey',
    lockHypothesis: 'Rank the three ways first.',
    lockHypothesisFixed: 'Your hypothesis is fixed: the model has already run. A scientist does not change the hypothesis after seeing the results!',

    // Les étapes du cycle de vie (schéma du cours), les trois façons, les quatre compteurs.
    steps: {
      extraction: 'Raw material extraction', manufacturing: 'Manufacturing', distribution: 'Distribution',
      use: 'Use', disposal: 'Disposal', recycling: 'Recycling'
    },
    ways: { throw: { name: 'Throw away', lower: 'throw away' }, recycle: { name: 'Recycle', lower: 'recycle' }, reuse: { name: 'Reuse', lower: 'reuse' } },
    counters: {
      raw: { name: 'Raw materials', unit: 'kg' }, energy: { name: 'Energy', unit: 'units' },
      co2: { name: 'CO₂', unit: 'kg' }, waste: { name: 'Waste', unit: 'kg' }
    },
    taking: 'TAKING',
    givingBack: 'GIVING BACK',

    /* Les objets : many (« 150 cans of soda »), scenario (la situation), ways
       (ce que veut dire chaque façon pour cet objet), loop (la boucle de la
       réutilisation, sur le dessin), events (les six cartes du voyage, une
       par étape). */
    objects: {
      cans: {
        many: q => `${q} cans of soda`,
        scenario: q => `In one school year, you drink ${q} cans of soda.`,
        ways: {
          throw: 'the empty cans go in the grey bin.',
          recycle: 'the empty cans go in the blue PMC bin.',
          reuse: 'one refillable metal bottle for the whole year.'
        },
        loop: 'washed and refilled',
        events: {
          extraction: 'Huge machines dig bauxite out of the subsoil. It is turned into pure aluminium.',
          manufacturing: 'A factory rolls the aluminium into thin sheets and shapes them into cans.',
          distribution: 'Trucks bring the full cans to the shops.',
          use: 'You buy a cold soda and drink it.',
          disposal: 'The empty can goes in the grey bin: it ends up as waste.',
          recycling: 'The empty can is melted down to make new aluminium.'
        }
      },
      glass: {
        many: q => `${q} bottles of juice`,
        scenario: q => `In one school year, your family drinks ${q} glass bottles of juice.`,
        ways: {
          throw: 'the empty bottles go in the grey bin.',
          recycle: 'the empty bottles go in the bottle bank.',
          reuse: 'returnable bottles: the shop takes them back, they are washed and refilled.'
        },
        loop: 'washed and refilled',
        events: {
          extraction: 'Machines take sand and limestone out of a quarry.',
          manufacturing: 'In a glass factory, the sand is melted at 1500 °C and shaped into bottles.',
          distribution: 'Trucks bring the full bottles of juice to the shops.',
          use: 'Your family opens a bottle and drinks the juice.',
          disposal: 'The empty bottle goes in the grey bin: glass does not burn, it ends up as waste.',
          recycling: 'The empty bottle is crushed and melted down to make new glass.'
        }
      },
      tshirts: {
        many: q => `${q} T-shirts`,
        scenario: q => `In one school year, you need ${q} T-shirts.`,
        ways: {
          throw: 'the old T-shirts go in the grey bin.',
          recycle: 'the old T-shirts go in the textile container.',
          reuse: 'you buy second-hand T-shirts instead of new ones.'
        },
        loop: 'worn again',
        events: {
          extraction: 'Cotton plants grow in a field. Then the cotton is picked.',
          manufacturing: 'Factories spin the cotton into thread, weave the fabric, dye it and sew the T-shirts.',
          distribution: 'Ships and trucks bring the T-shirts to the shops.',
          use: 'You wear the T-shirt and wash it many times.',
          disposal: 'The old T-shirt goes in the grey bin: it is burnt.',
          recycling: 'The old T-shirt is cut into fibres to make new fabric.'
        }
      }
    },

    tabs: { journey: 'The journey', ways: 'Three ways', graph: 'The graph' },
    toView: { ways: 'Next: three ways', graph: 'Next: the graph' },
    toConclude: 'Next: conclude',

    // Onglet 1 : le voyage
    cardsTitle: 'The journey: six cards',
    cardsHint: 'Each card is one moment in the life of the object. Take a card (touch its letter), then touch its step of the lifecycle.',
    cardAria: l => `Card ${l}`,
    dropHere: 'Put a card here',
    placedCount: (n, t) => `Cards placed: ${n} / ${t}`,
    captionJourney: 'Put each card on its step of the lifecycle.',
    captionHold: l => `Card ${l}: touch a free step of the lifecycle.`,
    captionJourneyDone: 'All the cards are on the lifecycle. Next: the three ways!',
    lockJourney: n => `Put all the cards on the lifecycle first: ${n === 1 ? '1 card' : n + ' cards'} left.`,

    // Onglet 2 : les trois façons
    ringTitle: 'The lifecycle of the object',
    gaugesTitle: 'The four counters',
    gaugesFor: way => `The counters · ${way}`,
    runWay: way => `Run: ${way}`,
    runAgain: 'Run it again',
    captionWay: way => `${way}: run the model and watch the counters.`,
    captionStep: step => `${step}…`,
    captionRan: way => `${way}: done. Read the four counters and write the totals in your notebook.`,
    notebookTitle: 'Your notebook: totals for one school year',
    numAria: (way, head) => `${way}, ${head}`,
    lockWays: 'Run the three ways first.',
    lockNotes: n => `Complete your notebook: ${n === 1 ? '1 number' : n + ' numbers'} still missing.`,
    lockRunning: 'The model is running. Wait until the end.',
    lockRunFirst: way => `Run “${way}” first.`,

    // Onglet 3 : le graphique
    graphTitle: 'Your column graph',
    graphHint: counter => `Draw the columns of “${counter}”: one column per way, as high as the number in your notebook.`,
    chartTitle: (counter, many) => `${counter} for ${many}`,
    columnAria: way => `Column: ${way}`,
    captionChart: 'Touch each column at the right height: the numbers of your notebook.',
    captionChartDone: 'Your graph is ready. Next: conclude!',
    lockChart: 'Draw the three columns of your graph.',
    runInfo: (p, pt, n, nt) => `Cards: ${p} / ${pt} · Notebook: ${n} / ${nt}`,

    // Étape 3
    resultsTitle: 'Your results',
    zoom: 'Show the graph big',
    conclRank: 'From the best to the worst for the planet:',
    conclRankText: list => `From the best to the worst for the planet, the ways are: ${list}.`,
    conclWhy: (best, avoid) => `The best way is ${best}, because it avoids most of the ${avoid}.`,
    avoid: { make: 'raw material extraction and manufacturing', transport: 'distribution (transport)', use: 'use of the object', bin: 'disposal (the bin)' },
    avoidAria: 'Which steps does it avoid?',
    choose: '— choose —',
    verdictLine: 'So my hypothesis is',
    confirmed: 'confirmed',
    rejected: 'rejected',
    checkConclusions: 'Check my conclusions',
    backToLab: 'Back to the lab',

    // Étape 4
    scoreLabel: 'checks passed',
    markCorrect: 'correct',
    markIncorrect: 'incorrect',
    criteria: { journey: 'Lifecycle', notes: 'Observations', graph: 'Graph', answer: 'Conclusion', verdict: 'Hypothesis' },
    criteriaSub: { journey: 'The journey', notes: 'Your notebook', graph: 'Your columns', answer: 'Your answer', verdict: 'Your judgement' },
    factsTitle: 'The totals of the model:',

    report: {
      title: 'Laboratory report — From the Earth and back',
      because: 'Because',
      materials: many => `A model of the lifecycle of ${many} in one school year, with four counters: raw materials, energy, CO₂ and waste.`,
      procedure: counter => [
        'Put each event card on its step of the lifecycle.',
        'Run the model for each way: throw away, recycle, reuse. Read the four counters and write the totals in the notebook.',
        `Draw a column graph of “${counter}” for the three ways.`
      ],
      journeyCaption: 'The journey of the object',
      stepHead: 'Step',
      eventHead: 'Card',
      notesCaption: 'Notebook: totals for one school year',
      chartCaption: 'Column graph',
      wayLine: (way, raw, energy, co2, waste) => `${way}: ${raw} kg of raw materials, ${energy} units of energy, ${co2} kg of CO₂ and ${waste} kg of waste.`,
      verdict: word => `So my hypothesis is ${word}.`,
      score: n => `Score: ${n} / 5 checks passed.`
    }
  },

  glossary: {
    lifecycle: 'cycle de vie', 'raw material extraction': 'extraction des matières premières', 'raw materials': 'matières premières',
    manufacturing: 'fabrication', disposal: 'élimination (fin de vie)', recycling: 'recyclage',
    'throw away': 'jeter', recycle: 'recycler', reuse: 'réutiliser', reusing: 'réutiliser', reduce: 'réduire', waste: 'déchets',
    'grey bin': 'poubelle grise (déchets résiduels)', 'blue PMC bin': 'poubelle bleue des PMC', 'bottle bank': 'bulle à verre',
    'textile container': 'conteneur à textiles', 'second-hand': 'de seconde main', refillable: 'qu’on peut remplir à nouveau',
    returnable: 'consigné(e)s', washed: 'lavé(e)s', refilled: 'rempli(e)s à nouveau', subsoil: 'sous-sol',
    'melted down': 'fondu(e)', melted: 'fondu(e)', rolls: 'lamine', sheets: 'feuilles (plaques)', shapes: 'met en forme',
    'shaped into': 'mis en forme de', trucks: 'camions', shops: 'magasins', quarry: 'carrière', sand: 'sable', limestone: 'calcaire',
    crushed: 'broyé(e)', cotton: 'coton', picked: 'récolté', spin: 'filent', thread: 'fil', weave: 'tissent', fabric: 'tissu',
    dye: 'teignent', sew: 'cousent', burnt: 'brûlé', 'ends up as': 'finit en', wear: 'portes', 'worn again': 'porté à nouveau',
    counters: 'compteurs', counter: 'compteur', taking: 'prendre', 'giving back': 'rendre', avoids: 'évite',
    'most of the': 'la plus grande partie de', worst: 'le pire', best: 'le meilleur', rank: 'classe', 'column graph': 'graphique en colonnes',
    juice: 'jus', 'cans of soda': 'canettes de soda', cans: 'canettes', dig: 'creusent', huge: 'énormes', ships: 'bateaux',
    'does not burn': 'ne brûle pas', 'takes them back': 'les reprend', grow: 'poussent', field: 'champ'
  },

  // Étape Check : pourquoi.
  explanations: {
    steps: 'The lifecycle of an object: raw material extraction, manufacturing, distribution, use, then disposal or recycling.',
    arrows: 'Recycling closes the loop: the waste becomes a resource again. That is why the arrows of a sustainable lifecycle are double.',
    reuse: {
      cans: 'One metal bottle for the whole year: its metal is extracted and the bottle is made only once. Washing it uses a little energy, much less than making new cans.',
      glass: 'A returnable bottle is used about 25 times: very few new bottles are made. Washing the bottles and bringing them back by truck also use energy, but much less than melting new glass.',
      tshirts: 'A second-hand T-shirt is already made: no cotton to grow, no factory. Sorting, washing and transport use only a little energy.'
    },
    recycle: {
      cans: 'Recycled aluminium needs about 95 % less energy than new aluminium made from bauxite: recycling avoids most of the raw material extraction. But new cans must still be made, and some cans are not collected.',
      glass: 'Recycled glass melts more easily: it saves about a quarter of the energy, and less sand is dug. But new bottles must still be made in the factory: recycling saves less than reusing.',
      tshirts: 'Recycled fibres replace part of the new cotton. But the fabric and the T-shirts must still be made in a factory.'
    },
    rs: 'The 3 R’s: reduce, reuse, recycle. Reusing comes before recycling: an object that is used again does not need to be made again. The numbers of this model are rounded, real orders of magnitude.'
  },

  check: {
    nothing: 'nothing',
    journeyWrong: (letter, text, said, right) => `Card ${letter} (“${text}”): you put it on “${said}”. It belongs to “${right}”.`,
    journeyAllGood: 'All the cards are on the right step of the lifecycle. Well done!',
    readWrong: (way, head, said, right) => `${way}, ${head}: you wrote ${said}, but the counter shows ${right}.`,
    notesScore: (good, total) => `${good} / ${total} totals match the counters.`,
    notesAllGood: 'Your notebook matches the counters. Well read!',
    readHow: 'To read a counter: find where the coloured bar stops, then read the number on the scale below. One line of the scale more or less is accepted.',
    graphOk: 'Your columns show the numbers of your notebook. Well drawn!',
    graphWrong: (way, said, want) => `${way}: your column shows ${said}, but your notebook says ${want}.`,
    graphHow: 'A column graph (FO4): one column per way, as high as its number; the title, the axis and the unit say what is measured.',
    answerOk: 'Correct!',
    answerWrong: 'Not quite. The correct answer:',
    yourHyp: 'Your hypothesis:',
    yourConcl: 'Your conclusion:',
    verdictOk: v => `Your hypothesis and your conclusion ${v === 'confirmed' ? 'say the same thing' : 'do not say the same thing'}: it is indeed ${v}. Well judged!`,
    verdictWrong: should => `Compare your hypothesis with your conclusion: they ${should === 'confirmed' ? 'say the same thing, so your hypothesis is confirmed' : 'do not say the same thing, so your hypothesis is rejected'}.`,
    rejectedNote: 'A rejected hypothesis is not a mistake: it is how science moves on.'
  }
});
