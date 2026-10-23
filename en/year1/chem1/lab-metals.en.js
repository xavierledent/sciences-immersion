/* ===== Labo virtuel « Metal detectives » (chem1) : textes en anglais =====

   Simulation commune aux deux filières : js/lab-metals.js, chargée après ce
   fichier. Le néerlandais (nl/jaar1/chem1/lab-metals.nl.js) a exactement les
   mêmes clés.

   [mot] ou [mot|clé] : mot du lexique, souligné, traduction française au
   survol ou au toucher (clé dans glossary, en minuscules). */

LabEngine.addText('metals', {
  labels: {
    title: 'Metal detectives',

    predictIntro: 'Look carefully at each [sample]. Before any test, do you think it is a metal?',
    predictMetal: 'Metal',
    predictNot: 'Not a metal',
    predictUnsure: 'Not sure',
    predictCount: (n, total) => `${n} / ${total} hypotheses`,
    startTesting: 'Start testing',

    trayTitle: 'Samples',
    trayItem: (id, n, total) => `Sample ${id}, ${n} of ${total} observations`,
    notebookTitle: (id) => `Notebook — sample ${id}`,
    notebookEmpty: 'Put a [sample] on the [bench] to fill in its notebook.',
    notebookLocked: 'Do the test first',
    lockTests: n => `Finish your tests first: ${n} ${n === 1 ? 'observation' : 'observations'} still to note in the notebook.`,
    lockHypothesesFixed: 'Your hypotheses are fixed: the tests have started. A scientist does not change the hypothesis after seeing the results!',
    lockNotebook: 'Do this test first: drag the tool onto the sample.',
    lockWhichMetal: 'First say whether it is a metal.',
    lockNotMetal: 'You said it is not a metal: there is nothing to choose.',
    sceneEmpty: 'Drag a sample here',
    sceneEmptySub: 'or tap a sample in the tray',
    captionEmpty: 'Choose a [sample] in the tray and put it on the [bench].',
    captionReady: (id) => `[Sample] ${id} is on the [bench]. Drag a [tool] onto it, or tap a tool.`,
    captionNeedSample: 'First, put a [sample] on the [bench].',
    captionRecord: ' Now write what you observed in the [notebook].',
    speedUp: 'Speed up',
    observations: (n, total) => `${n} / ${total} observations written`,
    resultsTable: 'Results table',
    toConclude: 'Next: conclude',

    // Descriptions des scènes pour les lecteurs d'écran, textes dessinés.
    scene: {
      empty: 'Empty bench',
      base: id => `Sample ${id} on the bench`,
      luster: id => `Sandpaper test on sample ${id}`,
      magnet: id => `Magnet test on sample ${id}`,
      electric: id => `Electric circuit test on sample ${id}`,
      heat: id => `Heat test on sample ${id}`,
      hammer: id => `Hammer test on sample ${id}`
    },
    poleNorth: 'N',
    poleSouth: 'S',
    battery: '4.5 V',
    stopwatch: 'STOPWATCH',

    concludeIntro: 'Use your results to decide. Is each [sample] a metal? If it is, which metal is it?',
    colSample: 'Sample',
    colMetal: 'Metal?',
    colWhich: 'Which metal?',
    yes: 'Yes',
    no: 'No',
    choose: 'Choose…',
    backToLab: 'Back to the lab',
    referenceSheet: 'Metal reference sheet',
    checkConclusions: 'Check my conclusions',
    notRecorded: '—',

    scoreLabel: 'correct identifications',
    hypothesesLabel: (n, total) => `${n} / ${total} hypotheses confirmed`,
    colYourAnswer: 'Your answer',
    colCorrect: 'Correct answer',
    markCorrect: 'correct',
    markIncorrect: 'incorrect',
    notMetal: 'Not a metal',
    youPredicted: 'Your hypothesis',
    hypothesisConfirmed: 'confirmed',
    hypothesisRejected: 'rejected',
    hypothesisNone: 'no hypothesis',
    notebookCheck: 'Your notebook',
    youWrote: 'You wrote',
    expected: 'Expected',

    refTitle: 'Metal reference sheet',
    refIntro: 'What the five metals of the lab look like after [sanding], and how they react to two of the tests.',
    refColMetal: 'Metal',
    refColColour: 'Colour of the [sanded area]',
    refColMagnet: 'Magnet',
    refColHeat: '[Wax melts]…',
    tableTitle: 'Results table',
    tableIntro: 'Everything you wrote in the [notebook], for all the samples.',

    tests: {
      luster: { tool: 'Sandpaper', name: 'Luster', question: 'How does the [sanded area] look?' },
      magnet: { tool: 'Magnet', name: 'Magnetism', question: 'Is it attracted by the [magnet]?' },
      electric: { tool: 'Circuit', name: 'Electrical conductivity', question: 'Does it let electricity through?' },
      heat: { tool: 'Hot water', name: 'Thermal conductivity', question: 'When [does the wax melt]?' },
      hammer: { tool: 'Hammer', name: 'Malleability', question: 'Does it change shape without breaking?' }
    },
    options: {
      shiny: 'Shiny', dull: 'Dull',
      attracted: 'Attracted', notAttracted: 'Not attracted',
      conducts: 'Conducts', notConducts: 'Does not conduct',
      heatVeryFast: '< 45 s', heatFast: '45 s–1:30', heatSlow: '> 1:30', heatNone: 'No melting',
      malleable: 'Malleable', notMalleable: 'Not malleable'
    },
    metals: { iron: 'Iron', copper: 'Copper', aluminium: 'Aluminium', gold: 'Gold', silver: 'Silver' },

    report: {
      title: 'Laboratory report — Identifying metals',
      question: (range) => `Which of the samples (${range}) are metals? For each metal, which metal is it?`,
      range: (first, last) => `${first} to ${last}`,
      hypothesisIntro: 'Before testing, I looked at each sample and predicted:',
      materials: (n, range) => `${n} samples of the same shape (${range}), sandpaper, a magnet, an electric circuit (battery, bulb, wires, 2 clips), a beaker of hot water on a hot plate, a lab stand, wax, a stopwatch, a hammer, 2 wooden blocks.`,
      procedure: [
        'Rub the sample with sandpaper and observe the sanded area.',
        'Bring the magnet close to the sample.',
        'Connect the sample to the electric circuit and observe the bulb.',
        'Dip one end of the sample in hot water, put wax on the other end and time how long the wax takes to melt.',
        'Place the sample on two wooden blocks, hit it with the hammer and observe its shape.',
        'Repeat steps 1 to 5 for each sample and write the results in a table.'
      ],
      heatNote: 'Thermal conductivity: time for the wax to melt.',
      isMetal: (metal) => `a metal (${metal})`,
      isNotMetal: 'not a metal',
      interpretationLine: (id, hyp, concl, verdict) => `Sample ${id}: I predicted “${hyp}”. My results show “${concl}”. Hypothesis ${verdict}.`,
      interpretationUnsure: (id, concl) => `Sample ${id}: I was not sure before testing. My results show “${concl}”.`,
      conclusionMetals: (list) => `The metals are: ${list}.`,
      conclusionNone: 'I did not identify any metal.',
      conclusionNot: (list) => `These samples are not metals: ${list}.`,
      score: (n, total) => `Score: ${n} / ${total} correct identifications.`,
      noteObs: (id, test, wrote, exp) => `Sample ${id}, ${test}: you wrote “${wrote}”, the right observation is “${exp}”.`,
      noteMetal: (id, metal) => `Sample ${id} is a metal: ${metal}.`,
      noteNotMetal: (id, what) => `Sample ${id} is not a metal: it is ${what}.`
    }
  },

  glossary: {
    sample: 'échantillon', bench: 'paillasse', tool: 'outil',
    sandpaper: 'papier de verre', sanding: 'ponçage', 'sanded area': 'zone poncée',
    magnet: 'aimant', clips: 'pinces',
    'the bulb lights up': 'l’ampoule s’allume', 'the bulb stays off': 'l’ampoule reste éteinte',
    wax: 'cire', 'wax melts': 'la cire fond', 'the wax melts': 'la cire fond',
    'does the wax melt': 'la cire fond-elle', 'the wax has still not melted': 'la cire n’a toujours pas fondu',
    'dips in hot water': 'trempe dans l’eau chaude',
    hammer: 'marteau', notebook: 'cahier', stopwatch: 'chronomètre',
    paint: 'peinture', scratched: 'rayé', cloudy: 'trouble',
    sawdust: 'sciure', 'cracks and breaks': 'se fissure et se casse', shatters: 'vole en éclats', splits: 'se fend',
    'the hammer bounces off': 'le marteau rebondit',
    bends: 'se plie', chips: 'éclats', tarnished: 'terni'
  },

  // Nom de chaque matériau (correction, rapport, tableau de bord).
  materials: {
    copper: 'Copper',
    iron: 'Iron',
    aluminium: 'Aluminium',
    gold: 'Gold',
    silver: 'Silver',
    plasticGold: 'Plastic painted gold',
    plasticSilver: 'Plastic painted silver',
    glass: 'Mirror glass',
    wood: 'Wood',
    granite: 'Granite (a rock)'
  },

  // Observation décrite, jamais interprétée : c'est à l'élève de nommer la
  // propriété dans son carnet.
  captions: {
    luster: {
      copper: 'Under the brown, [tarnished] surface, the [sanded area] is orange-pink and reflects light strongly.',
      iron: 'Under the dark grey surface, the [sanded area] is silvery grey and reflects light strongly.',
      aluminium: 'Under the dull grey surface, the [sanded area] is light grey and reflects light strongly.',
      gold: 'The [sanded area] stays yellow and reflects light strongly.',
      silver: 'The [sanded area] is bright white and reflects light strongly.',
      plasticGold: 'The yellow [paint] comes off. Underneath, the material is white and does not reflect light.',
      plasticSilver: 'The silver [paint] comes off. Underneath, the material is creamy white and does not reflect light.',
      glass: 'The surface gets [scratched] and [cloudy]. The [sanded area] no longer reflects light.',
      wood: 'Fine [sawdust] falls. The [sanded area] is light brown and does not reflect light.',
      granite: 'The rock is very hard: it is hardly [scratched]. It stays speckled and does not reflect light.'
    },
    // Fer, cuivre, aluminium tirés propres : déjà brillants avant ponçage.
    lusterClean: {
      copper: 'The surface is already orange-pink and reflects light strongly. The [sanded area] looks the same.',
      iron: 'The surface is already silvery grey and reflects light strongly. The [sanded area] looks the same.',
      aluminium: 'The surface is already light grey and reflects light strongly. The [sanded area] looks the same.'
    },
    lusterRunning: 'The [sandpaper] rubs the surface of the bar…',
    magnetRunning: 'The [magnet] comes closer to the bar…',
    magnetYes: 'The bar jumps up and sticks to the [magnet].',
    magnetNo: 'Nothing happens: the bar stays on the [bench].',
    electricRunning: 'The two [clips] are connected to the ends of the bar…',
    electricYes: '[The bulb lights up].',
    electricNo: '[The bulb stays off].',
    heatMelted: (t) => `[The wax melts] after <strong>${t}</strong> (look at the [stopwatch]).`,
    heatNot: 'After <strong>5:00</strong>, [the wax has still not melted].',
    heatRunning: 'The bottom of the bar [dips in hot water]. Watch the [wax] at the top…',
    hammerRunning: 'The [hammer] comes down on the middle of the bar…',
    hammer: {
      dent: 'The bar [bends] where the [hammer] hit it. It changes shape, but it does not break.',
      dentSmall: 'The bar [bends] a little where the [hammer] hit it. It changes shape, but it does not break.',
      crack: 'The bar [cracks and breaks] into two pieces.',
      shatter: 'The bar [shatters] into sharp pieces.',
      split: 'The bar [splits] into two pieces.',
      bounce: '[The hammer bounces off]. The bar does not change shape; only tiny [chips] fly off.'
    }
  },

  explanations: {
    copper: 'This is <strong>copper</strong>. Its sanded surface is shiny, it conducts electricity and heat very fast, and it bends without breaking: it is a metal. It is not attracted by the magnet, and its orange-pink colour sets it apart from the other metals.',
    wood: '<strong>Wood</strong> is not a metal: it stays dull, the bulb stays off, the wax does not melt, and it splits under the hammer.',
    plasticGold: 'This is <strong>plastic painted gold</strong>. It looked shiny, but only because of the paint: once sanded, it is dull, it does not conduct electricity or heat, and it cracks.',
    iron: 'This is <strong>iron</strong>, the only sample attracted by the magnet. It is shiny once sanded, conducts electricity, conducts heat (more slowly than the other metals of the lab) and bends without breaking.',
    glass: 'This is <strong>mirror glass</strong>. It is very shiny, but it is not a metal: it does not conduct electricity or heat, and it shatters under the hammer. (A mirror shines thanks to a very thin metal layer hidden behind the glass — the glass itself is not a metal.)',
    silver: 'This is <strong>silver</strong>: bright white once sanded, not magnetic, conducts electricity, bends without breaking, and is the fastest of all to melt the wax.',
    granite: '<strong>Granite</strong> is a rock, not a metal: it is dull, does not conduct electricity or heat, and does not change shape under the hammer. You met granite in the part of the chapter about rocks.',
    aluminium: 'This is <strong>aluminium</strong>. Its surface was dull grey, covered with a thin layer of oxide, so it did not look like a metal. Once sanded, it is light grey and shiny. It is not magnetic, conducts electricity and heat (fast, but more slowly than silver and copper), and bends without breaking.',
    // Aluminium tiré propre (sans couche d'oxyde).
    aluminiumClean: 'This is <strong>aluminium</strong>: light grey and shiny, even before sanding. It is not magnetic, conducts electricity and heat (fast, but more slowly than silver and copper), and bends without breaking.',
    plasticSilver: 'This is <strong>plastic painted silver</strong>. The paint makes it look like a metal, but under the paint it is dull, it does not conduct electricity or heat, and it cracks.',
    gold: 'This is <strong>gold</strong>: yellow and shiny, not magnetic, conducts electricity and heat, and bends very easily.'
  },

  // Comparaison avec le sosie (id : sa lettre), ajoutée à l'explication
  // quand les deux échantillons sont présents.
  compare: {
    plasticGold: id => `Compare it with sample ${id}, the real gold: same look, very different results. Looking was not enough!`,
    gold: id => `Compare it with sample ${id}, the fake gold.`,
    plasticSilver: id => `Compare it with sample ${id}, the real silver: same look, very different results. Looking was not enough!`,
    silver: id => `Compare it with sample ${id}, the plastic painted silver.`
  },

  // Fiche de référence : une ligne par métal.
  reference: {
    iron: { colour: 'Silvery grey', magnet: 'Attracted', heat: 'Slowly (> 1:30)' },
    copper: { colour: 'Orange-pink', magnet: 'Not attracted', heat: 'Very fast (< 45 s)' },
    aluminium: { colour: 'Light grey', magnet: 'Not attracted', heat: 'Fast (45 s – 1:30)' },
    gold: { colour: 'Yellow', magnet: 'Not attracted', heat: 'Fast (45 s – 1:30)' },
    silver: { colour: 'Bright white', magnet: 'Not attracted', heat: 'Very fast (< 45 s)' }
  }
});
