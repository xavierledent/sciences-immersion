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
    yourQuestions: 'Your questions',
    question2: 'When the objects are thrown away, which step of the lifecycle uses the most energy?',
    hypothesisTitle: 'Your hypothesis',
    hypIntro: 'Rank the three ways, from the best to the worst for the planet.',
    hypIntro2: 'Choose the step that uses the most energy when the objects are thrown away.',
    places: ['1st: the best', '2nd', '3rd: the worst'],
    hypText: list => `I think that, from the best to the worst for the planet, the ways are: ${list}.`,
    hypText2: step => `I think that, when the objects are thrown away, the step that uses the most energy is ${step}.`,
    because: 'Why do you think so? (optional)',
    becausePlaceholder: 'Because…',
    hypothesisReady: 'Your hypothesis is ready.',
    hypothesisPending: 'Rank the three ways and choose a step.',
    toJourney: 'Next: the journey',
    lockHypothesis: 'Answer both parts of your hypothesis: rank the three ways and choose a step.',
    lockHypothesisFixed: 'Your hypothesis is fixed: the model has already run. A scientist does not change the hypothesis after seeing the results!',

    // Les étapes du cycle de vie (schéma du cours), les trois façons, les quatre compteurs.
    steps: {
      extraction: 'Raw material extraction', manufacturing: 'Manufacturing', distribution: 'Distribution',
      use: 'Use', disposal: 'Disposal', recycling: 'Recycling'
    },
    // Dans une phrase (« the step that uses the most energy is … »).
    stepIn: {
      extraction: 'raw material extraction', manufacturing: 'manufacturing', distribution: 'distribution',
      use: 'use', disposal: 'disposal', recycling: 'recycling'
    },
    ways: { throw: { name: 'Throw away', lower: 'throw away' }, recycle: { name: 'Recycle', lower: 'recycle' }, reuse: { name: 'Reuse', lower: 'reuse' } },
    counters: {
      raw: { name: 'Raw materials', unit: 'kg' }, energy: { name: 'Energy', unit: 'units' },
      co2: { name: 'CO₂', unit: 'kg' }, waste: { name: 'Waste', unit: 'kg' }
    },
    taking: 'TAKING',
    givingBack: 'GIVING BACK',

    /* Les objets : many (« 3 smartphones »), period (la durée, à la suite
       d'un titre), scenario (la situation), ways (ce que veut dire chaque
       façon pour cet objet : réutiliser, c'est le même objet qui sert à
       nouveau), loop (la boucle de la réutilisation, sur le dessin), events
       (les six cartes du voyage, une par étape). */
    objects: {
      lunchbox: {
        many: q => `${q} lunchboxes`,
        period: 'in 6 years of secondary school',
        scenario: q => `You need an aluminium lunchbox for your 6 years of secondary school. Many students get a new one every school year: that makes ${q} lunchboxes.`,
        ways: {
          throw: 'every year, the old lunchbox goes in the grey bin.',
          recycle: 'every year, the old lunchbox goes to the container park, with the metals.',
          reuse: 'you keep the same lunchbox for 6 years: you wash it and repair its clips.'
        },
        loop: 'washed and used again',
        events: {
          extraction: 'Huge machines dig bauxite out of the subsoil. It is turned into pure aluminium.',
          manufacturing: 'A factory presses aluminium sheets into boxes and lids, and adds the clips.',
          distribution: 'Trucks bring the lunchboxes to the shops.',
          use: 'Every school day, you carry your sandwiches in the lunchbox.',
          disposal: 'The old lunchbox goes in the grey bin: it ends up as waste.',
          recycling: 'The old lunchbox is melted down to make new aluminium.'
        }
      },
      phone: {
        many: q => `${q} smartphones`,
        period: 'in 6 years of secondary school',
        scenario: q => `In 6 years of secondary school, you use ${q} smartphones, one after the other.`,
        ways: {
          throw: 'the old smartphones end up in the grey bin.',
          recycle: 'the old smartphones go back to the shop: their metals are recovered.',
          reuse: 'you buy refurbished smartphones: second-hand, checked and repaired.'
        },
        loop: 'repaired and used again',
        events: {
          extraction: 'Mines dig a lot of rock to get a few grams of copper, gold and other metals.',
          manufacturing: 'Factories make the chips, the screen and the battery, then put the smartphone together.',
          distribution: 'Planes, ships and trucks bring the smartphones to the shops.',
          use: 'You call, chat and charge your smartphone every day.',
          disposal: 'The old smartphone goes in the grey bin: its metals are lost.',
          recycling: 'The old smartphone is taken apart: copper, gold and other metals are recovered.'
        }
      },
      pan: {
        many: q => `${q} stainless steel pans`,
        period: 'in 6 years',
        scenario: q => `In 6 years, your family needs ${q} stainless steel pans: a new one each time the old one is damaged.`,
        ways: {
          throw: 'the damaged pans go in the grey bin.',
          recycle: 'the damaged pans go to the container park: the steel is recycled.',
          reuse: 'the pans are repaired (a new handle) or bought second-hand.'
        },
        loop: 'repaired and used again',
        events: {
          extraction: 'Mines dig iron ore, chromium and nickel out of the subsoil. They are turned into stainless steel.',
          manufacturing: 'A factory presses steel sheets into pans, polishes them and adds a handle.',
          distribution: 'Trucks bring the pans to the shops.',
          use: 'Your family cooks with the pan nearly every day.',
          disposal: 'The damaged pan goes in the grey bin: it ends up as waste.',
          recycling: 'The damaged pan is melted down with other scrap steel to make new steel.'
        }
      },
      glass: {
        many: q => `${q} bottles of juice`,
        period: 'in one school year',
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
        period: 'in one school year',
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
    notebookTitle: period => `Your notebook: totals ${period}`,
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
    energyBar: way => `Energy · ${way}: the colours of the steps`,
    conclRank: 'From the best to the worst for the planet:',
    conclRankText: list => `From the best to the worst for the planet, the ways are: ${list}.`,
    conclWhy: (best, avoid) => `The best way is ${best}, because it avoids most of the ${avoid}.`,
    avoid: { make: 'raw material extraction and manufacturing', transport: 'distribution (transport)', use: 'use of the object', bin: 'disposal (the bin)' },
    avoidAria: 'Which steps does it avoid?',
    conclStep: step => `When the objects are thrown away, the step that uses the most energy is ${step}.`,
    stepAria: 'Which step uses the most energy?',
    choose: '— choose —',
    verdictLine: n => `So my hypothesis ${n} is`,
    confirmed: 'confirmed',
    rejected: 'rejected',
    checkConclusions: 'Check my conclusions',
    backToLab: 'Back to the lab',

    // Étape 4
    scoreLabel: 'checks passed',
    markCorrect: 'correct',
    markIncorrect: 'incorrect',
    criteria: { journey: 'Lifecycle', notes: 'Observations', graph: 'Graph', answer: 'Question 1', step: 'Question 2', verdict: 'Hypotheses' },
    criteriaSub: { journey: 'The journey', notes: 'Your notebook', graph: 'Your columns', answer: 'The best way', step: 'The step with most energy', verdict: 'Your judgements' },
    factsTitle: 'The totals of the model:',

    report: {
      title: 'Laboratory report — From the Earth and back',
      because: 'Because',
      materials: (many, period) => `A model of the lifecycle of ${many} ${period}, with four counters: raw materials, energy, CO₂ and waste.`,
      procedure: counter => [
        'Put each event card on its step of the lifecycle.',
        'Run the model for each way: throw away, recycle, reuse. Read the four counters and write the totals in the notebook.',
        `Draw a column graph of “${counter}” for the three ways.`,
        'Look at the colours of the energy counter for “throw away”: find the biggest step.'
      ],
      journeyCaption: 'The journey of the object',
      stepHead: 'Step',
      eventHead: 'Card',
      notesCaption: period => `Notebook: totals ${period}`,
      chartCaption: 'Column graph',
      wayLine: (way, raw, energy, co2, waste) => `${way}: ${raw} kg of raw materials, ${energy} units of energy, ${co2} kg of CO₂ and ${waste} kg of waste.`,
      verdict: (n, word) => `So my hypothesis ${n} is ${word}.`,
      score: (n, total) => `Score: ${n} / ${total} checks passed.`
    }
  },

  glossary: {
    lifecycle: 'cycle de vie', 'raw material extraction': 'extraction des matières premières', 'raw materials': 'matières premières',
    manufacturing: 'fabrication', disposal: 'élimination (fin de vie)', recycling: 'recyclage',
    'throw away': 'jeter', recycle: 'recycler', reuse: 'réutiliser', reusing: 'réutiliser', reduce: 'réduire', waste: 'déchets',
    'grey bin': 'poubelle grise (déchets résiduels)', 'blue PMC bin': 'poubelle bleue des PMC', 'bottle bank': 'bulle à verre',
    'textile container': 'conteneur à textiles', 'second-hand': 'de seconde main',
    returnable: 'consigné(e)s', washed: 'lavé(e)s', refilled: 'rempli(e)s à nouveau', subsoil: 'sous-sol',
    'melted down': 'fondu(e)', melted: 'fondu(e)', sheets: 'plaques', shapes: 'met en forme',
    'shaped into': 'mis en forme de', trucks: 'camions', shops: 'magasins', quarry: 'carrière', sand: 'sable', limestone: 'calcaire',
    crushed: 'broyé(e)', cotton: 'coton', picked: 'récolté', spin: 'filent', thread: 'fil', weave: 'tissent', fabric: 'tissu',
    dye: 'teignent', sew: 'cousent', burnt: 'brûlé', 'ends up as': 'finit en', wear: 'portes', 'worn again': 'porté à nouveau',
    counters: 'compteurs', counter: 'compteur', taking: 'prendre', 'giving back': 'rendre', avoids: 'évite',
    'most of the': 'la plus grande partie de', worst: 'le pire', best: 'le meilleur', rank: 'classe', 'column graph': 'graphique en colonnes',
    juice: 'jus', dig: 'creusent', huge: 'énormes', ships: 'bateaux',
    'does not burn': 'ne brûle pas', 'takes them back': 'les reprend', grow: 'poussent', field: 'champ',
    lunchbox: 'boîte à tartines', lunchboxes: 'boîtes à tartines', 'container park': 'parc à conteneurs (recyparc)',
    clips: 'fermoirs', repair: 'répares', repaired: 'réparé(e)s', refurbished: 'reconditionné(s)', checked: 'vérifié(s)',
    recovered: 'récupéré(e)s', 'taken apart': 'démonté', chips: 'puces électroniques', screen: 'écran', planes: 'avions',
    'stainless steel': 'acier inoxydable (inox)', steel: 'acier', pans: 'casseroles', pan: 'casserole', damaged: 'abîmé(e)',
    'iron ore': 'minerai de fer', ore: 'minerai', chromium: 'chrome', presses: 'presse', polishes: 'polit', handle: 'manche',
    'scrap steel': 'acier usagé (ferraille)', cooks: 'cuisine', 'nearly every day': 'presque tous les jours', rock: 'roche',
    copper: 'cuivre', gold: 'or', 'are lost': 'sont perdus', 'uses the most energy': 'consomme le plus d’énergie',
    'thrown away': 'jeté(e)s', carry: 'transportes', sandwiches: 'tartines', lids: 'couvercles', 'one after the other': 'l’un après l’autre',
    charge: 'recharges', 'secondary school': 'l’école secondaire'
  },

  // Étape Check : pourquoi.
  explanations: {
    steps: 'The lifecycle of an object: raw material extraction, manufacturing, distribution, use, then disposal or recycling.',
    arrows: 'Recycling closes the loop: the waste becomes a resource again. That is why the arrows of a sustainable lifecycle are double.',
    reuse: {
      lunchbox: 'One lunchbox for 6 years: its aluminium is extracted and the box is made only once. New clips cost only a little energy.',
      phone: 'A refurbished smartphone is already made: it only needs a new battery and a few repairs. No new chips, no new screen.',
      pan: 'A repaired or second-hand pan is already made: no ore to dig, no new steel. A new handle costs only a little energy.',
      glass: 'A returnable bottle is used about 25 times: very few new bottles are made. Washing the bottles and bringing them back by truck also use energy, but much less than melting new glass.',
      tshirts: 'A second-hand T-shirt is already made: no cotton to grow, no factory. Sorting, washing and transport use only a little energy.'
    },
    recycle: {
      lunchbox: 'Recycled aluminium needs about 95 % less energy than new aluminium made from bauxite. But a new lunchbox must still be made every year, and not all the aluminium is recovered.',
      phone: 'Recycling recovers part of the metals: less rock is dug. But most of the energy goes into making the chips and the screen, and recycling cannot save that: a new smartphone must still be made.',
      pan: 'Steel can be recycled again and again: melting scrap steel needs much less energy than making steel from ore. But a new pan must still be made.',
      glass: 'Recycled glass melts more easily: it saves about a quarter of the energy, and less sand is dug. But new bottles must still be made in the factory: recycling saves less than reusing.',
      tshirts: 'Recycled fibres replace part of the new cotton. But the fabric and the T-shirts must still be made in a factory.'
    },
    // Question 2 : pourquoi cette étape consomme le plus.
    step: {
      lunchbox: 'For aluminium, the biggest step is raw material extraction: turning bauxite into pure aluminium needs a huge amount of energy. That is why recycling aluminium saves so much.',
      phone: 'For a smartphone, the biggest step is manufacturing: making the chips and the screen needs very clean factories and a lot of energy. Recycling the metals cannot save that energy.',
      pan: 'For stainless steel, the biggest step is raw material extraction: turning iron ore, chromium and nickel into steel needs a lot of heat.',
      glass: 'For glass, the biggest step is manufacturing: the sand must be melted at 1500 °C. The sand itself is easy to dig.',
      tshirts: 'For a T-shirt, the biggest step is manufacturing: spinning, weaving, dyeing and sewing use a lot of energy and water.'
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
    stepHead: 'Step',
    stepFacts: way => `${way}: the energy of each step (units)`,
    stepHow: 'To find the biggest step: on the energy counter of “throw away”, look for the longest colour. Each colour is one step of the lifecycle.',
    hypHead: n => `Hypothesis ${n}`,
    yourHyp: 'Your hypothesis:',
    yourConcl: 'Your conclusion:',
    verdictOk: v => `Your hypothesis and your conclusion ${v === 'confirmed' ? 'say the same thing' : 'do not say the same thing'}: it is indeed ${v}. Well judged!`,
    verdictWrong: should => `Compare your hypothesis with your conclusion: they ${should === 'confirmed' ? 'say the same thing, so your hypothesis is confirmed' : 'do not say the same thing, so your hypothesis is rejected'}.`,
    rejectedNote: 'A rejected hypothesis is not a mistake: it is how science moves on.'
  }
});
