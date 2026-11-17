/* ===== Labo virtuel « Stop the journey » (bio2) : textes en anglais =====

   Simulation commune aux deux filières : js/lab-journey.js, chargée après
   ce fichier. Le néerlandais (nl/jaar1/bio2/lab-journey.nl.js) a exactement
   les mêmes clés, sauf le lexique (glossary).

   Les mots du lexique sont soulignés d'office partout où ils apparaissent
   (traduction française au survol ou au toucher) ; [mot|clé] seulement pour
   une forme dont la clé diffère.

   Mots du cours (chapitre bio2) : PART 1 (testes, penis, vagina, uterus,
   Fallopian tubes, ovaries), 2.2 (« During sexual intercourse, the penis is
   inside the vagina »), Mission 13 (« Stopping the journey », « Way 1: no
   egg cell », « Way 2: no meeting », the pill, the implant, the condom, the
   internal condom, the copper IUD, withdrawal), Mission 14 (HPV : a virus,
   skin contact, a condom reduces the risk but does not protect completely ;
   chlamydia : a bacterium, a condom protects), Summary (dual protection).
   Jeu de tri de la page Practice : « Stop the journey », « No egg cell »,
   « No meeting ».

   Les prénoms du couple (girls, boys) sont tirés au sort : même nombre dans
   les deux langues (la sauvegarde garde leur rang). */

LabEngine.addText('journey', {
  labels: {
    title: 'Stop the journey',

    // Page d'accueil (Mission) : toujours la même, rien du tirage ; des gestes, jamais des résultats.
    briefTitle: 'Mission: find where each method stops the journey',
    briefTask: 'You are a youth health counsellor. On a model of the two reproductive systems, watch the journey of the sperm cells, the egg cell and two infections. Where does each method stop them?',
    briefSteps: [
      '<strong>Place</strong> each method on the drawings. <strong>Choose</strong> an advice for a couple.',
      '<strong>Test</strong> each method on the model and <strong>tick</strong> what you see. Then <strong>test</strong> your advice.',
      '<strong>Explain</strong> with your notes.'
    ],
    // Sous chaque phrase courte : le comment, en une phrase (jamais le résultat).
    briefDetails: [
      'Put each card where you think the method acts.',
      'Press “Run”, watch, then tap the place on the drawing and tick the boxes.',
      'Correct your drawing, sort the methods, and prove your advice with your notebook.'
    ],

    yourQuestion: 'Your question',
    q1: 'Where does each method act, and what does it stop?',
    q2: (girl, boy) => `${girl} and ${boy}: which methods meet their needs?`,

    hypothesisTitle: 'Your hypothesis',
    placeHow: 'Put each card on the drawings, where you think the method acts. Tap a card, then tap the place (or slide it).',
    adviceHow: 'Your advice: choose 1 or 2 methods.',
    because: 'Why do you think so? (optional)',
    becausePlaceholder: 'Because…',
    hypothesisReady: 'Your hypothesis is ready.',
    hypothesisPending: 'Place the seven cards and choose your advice.',
    toBench: 'Next: the model',

    lockHypothesis: 'First place the seven cards and choose your advice.',
    lockHypothesisFixed: 'Your hypothesis is fixed: the experiment has started. A scientist does not change the hypothesis after seeing the results!',
    lockNotStarted: 'Carry out the experiment first.',
    lockRun: 'Finish the experiment first.',

    girls: ['Lou', 'Emma', 'Nora', 'Inès', 'Zoé', 'Lena'],
    boys: ['Sam', 'Noah', 'Adam', 'Milan', 'Lucas', 'Yanis'],

    methods: {
      pill: 'the pill',
      implant: 'the implant',
      condom: 'the condom',
      internal: 'the internal condom',
      iud: 'the copper IUD',
      withdrawal: 'withdrawal',
      vaccine: 'the HPV vaccine'
    },
    noMethod: 'no method',
    // Comment on l'utilise (petite étiquette sur la carte).
    use: { daily: 'every day', each: 'each time', years: 'for years' },

    // Les zones du modèle.
    zones: {
      body: 'the whole body',
      bladder: 'bladder',
      testes: 'testes',
      penis: 'penis',
      vagina: 'vagina',
      uterus: 'uterus',
      tubes: 'Fallopian tubes',
      ovaries: 'ovaries'
    },
    // La flèche du contact (cours, 2.2), une ligne par élément.
    contact: ['During sexual intercourse,', 'the penis is inside the vagina.'],
    legend: { sperm: 'sperm cells', egg: 'egg cell', chla: 'chlamydia', hpv: 'HPV', hormone: 'hormones', stis: 'two STIs' },

    // Le couple : ses besoins (badges).
    coupleNeeds: 'Their needs:',
    needs: {
      noPregnancy: 'no pregnancy',
      sti: 'new couple, never tested for STIs',
      noHormones: 'no hormones',
      nothingDaily: 'nothing to remember every day',
      hpv: 'protection against HPV'
    },
    metNot: { yes: 'met', no: 'not met' },
    badgeAria: (need, met) => `${need}: ${met}`,

    // Le carnet.
    notesTitle: 'Your notebook',
    notes: {
      method: 'Test',
      where: 'Where does it act?',
      cols: {
        egg: 'Is an egg cell released?',
        meet: 'Do the sperm cells meet the egg cell?',
        chla: 'Does chlamydia pass?',
        hpv: 'Does HPV pass?'
      },
      colsShort: { egg: 'egg cell', meet: 'meeting', chla: 'chlamydia', hpv: 'HPV' }
    },
    tryName: n => `Advice ${n}`,
    marks: { yes: 'yes', no: 'no', partly: 'partly' },
    empty: 'empty',
    marksKey: 'Tap a box: ✓ yes (it happens, it passes) · ✗ no (it is stopped) · ◐ partly.',
    cellAria: (name, col, mark) => `${name}. ${col} ${mark}`,

    run: 'Run',
    runAgain: 'Run again',
    part2Title: (girl, boy) => `${girl} and ${boy}`,
    another: 'Try another advice',

    // Ce qui manque encore (bouton du pied touché trop tôt).
    missing: {
      run: 'Press “Run”.',
      where: method => `Tap the drawing: where does ${method} act?`,
      cells: 'Tick the four boxes of this test in your notebook.',
      first: 'First test the model with no method.',
      pick: 'Test every method: tap a card.',
      choose: 'Choose 1 or 2 methods for your new advice.',
      badges: 'Tick each need of the couple: met or not met.',
      next: label => `Press “${label}” at the bottom.`
    },
    next: { part2: 'Next: test your advice', conclude: 'Next: conclude' },
    partInfo: {
      1: 'No method first, then each method, one at a time.',
      2: 'Your advice for the couple, on the model.'
    },
    // La légende : la prochaine chose à faire (voir phase dans la simulation).
    captions: {
      run: method => `${method}: press “Run” and watch the journey.`,
      runTry: 'Your advice is on the model. Press “Run” and watch.',
      where: method => `Where did ${method} act? Tap the place on the drawing.`,
      whereTap: method => `Tap the place on the drawing where ${method} acts.`,
      cells: 'Look at the model. In your notebook, tick the four boxes of this test.',
      first: 'Start with the reference: tap the card “no method”, then press “Run”.',
      pick: 'Tap the card of a method you have not tested yet.',
      choose: 'Tap 1 or 2 cards for your new advice, then press “Run”.',
      badges: 'Look at your results and at the cards. Is each need of the couple met?',
      next: {
        part2: 'All the methods are tested. Go on with the button at the bottom.',
        conclude: 'Your advice is tested. You can try another advice, or go on to conclude.'
      }
    },
    captionWhereFirst: 'First choose a method and press “Run”.',
    captionRunning: 'Watch the journey…',

    lockFirstNone: 'First test the model with no method: it is your reference.',
    lockFinishRow: method => `First finish the line of ${method} in your notebook.`,
    lockTryRan: 'This advice is tested. To change it, use “Try another advice”.',
    lockRunPick: 'First tap a card.',
    lockRunChoose: 'First tap 1 or 2 cards for your advice.',
    lockCellRun: 'Run the model with this method first.',
    lockBadgesRun: 'First run the model with your advice.',

    // Étape 3.
    cTabs: { 1: 'Question 1', 2: 'Question 2' },
    ways: { w1: 'Way 1: no egg cell', w2: 'Way 2: no meeting', none: 'Does not stop a pregnancy' },
    c1PlaceHow: 'Your drawing from the start: move the cards that are in the wrong place.',
    c1WayHow: 'How does each method stop a pregnancy? Put each card in a frame.',
    c1ShieldHow: 'These methods also stop an STI:',
    pileEmpty: 'All the cards are in a frame.',
    verdictPlace: 'My hypothesis 1 (my drawing) is',
    verdictAdvice: 'My hypothesis 2 (my first advice) is',
    verdicts: { confirmed: 'confirmed', partly: 'partly confirmed', rejected: 'rejected' },
    cAdvice: (girl, boy) => `My advice for ${girl} and ${boy}:`,
    cProofs: 'For each need, tap the box below, then the result in your notebook that proves it.',
    whoQ: 'Who is responsible for protection?',
    both: 'both partners',
    noProof: 'Look at the cards.',
    proofTap: 'Tap, then choose a box',
    proofCell: (name, col, glyph) => `${name} · ${col} ${glyph}`,
    backToLab: 'Back to the lab',
    openNotes: 'My notebook',
    checkConclusions: 'Check my conclusions',
    toQ2: 'Question 1 is done: now open “Question 2”.',

    // Listes : « the condom and the implant ».
    list: items => (items.length < 2 ? (items[0] || '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`),

    scoreLabel: 'checks passed',
    markCorrect: 'correct',
    markIncorrect: 'incorrect',
    criteria: { notes: 'Your notes', where: 'Where it acts', stops: 'What it stops', advice: 'Your advice', partners: 'Both partners' },
    criteriaSub: {
      notes: 'The tests of your notebook',
      where: 'Your corrected drawing',
      stops: 'The two ways and the STIs',
      advice: 'The needs and your proofs',
      partners: 'Responsibility and hypotheses'
    },

    report: {
      title: 'Laboratory report — Stop the journey: where does each method act?',
      because: 'Because',
      advice: (girl, boy, list) => `My advice for ${girl} and ${boy}: ${list}.`,
      key: 'My notebook (✓ yes · ✗ no · ◐ partly):',
      needsTitle: (girl, boy) => `The needs of ${girl} and ${boy}, with my advice:`,
      whereTitle: 'My corrected drawing:',
      whereMark: 'My drawing',
      finalAdvice: (girl, boy, text) => `My advice for ${girl} and ${boy}: ${text}.`,
      who: text => `Responsible for protection: ${text}.`,
      verdict: (text, word) => `${text} ${word}.`,
      materials: 'A model of the male and female reproductive systems, with sperm cells, an egg cell, hormones, and the microbes of two STIs (chlamydia and HPV). Seven cards: the pill, the implant, the condom, the internal condom, the copper IUD, withdrawal, the HPV vaccine.',
      steps: [
        'Run the model with no method: it is the reference.',
        'Run the model with each method, one at a time. Note where it acts, and tick what passes or is stopped.',
        'Run the model with my advice for the couple. Tick each need: met or not met.',
        'Use my notebook to answer the two questions.'
      ],
      score: (n, total) => `Score: ${n} / ${total} checks passed.`
    }
  },

  glossary: {
    'the pill': 'la pilule', pill: 'pilule', condom: 'préservatif', condoms: 'préservatifs',
    'internal condom': 'préservatif interne', 'copper iud': 'stérilet au cuivre', iud: 'stérilet',
    withdrawal: 'le retrait', 'hpv vaccine': 'vaccin contre le HPV',
    'egg cell': 'ovocyte', 'sperm cells': 'spermatozoïdes', 'sperm cell': 'spermatozoïde',
    bladder: 'vessie', testes: 'testicules', 'fallopian tubes': 'trompes de Fallope', ovaries: 'ovaires',
    'whole body': 'corps entier', 'sexual intercourse': 'rapport sexuel', blood: 'sang',
    meet: 'rencontrer', meeting: 'rencontre', 'meet their needs': 'répondent à leurs besoins', 'meets the needs': 'répond aux besoins', released: 'libéré', sti: 'IST', stis: 'IST',
    journey: 'trajet (voyage)', stop: 'arrêter', stops: 'arrête', stopped: 'arrêté',
    needs: 'besoins', advice: 'conseil', partly: 'en partie', 'every day': 'chaque jour',
    'each time': 'à chaque fois', 'for years': 'pendant des années', 'never tested': 'jamais dépistés',
    'both partners': 'les deux partenaires', 'shared responsibility': 'responsabilité partagée',
    'dual protection': 'double protection', skin: 'peau', 'youth health counsellor': 'conseiller santé pour les jeunes',
    tick: 'cocher', 'way 1': 'moyen 1', 'way 2': 'moyen 2', frame: 'cadre',
    'reproductive systems': 'appareils reproducteurs', counsellor: 'conseiller', reference: 'témoin'
  },

  // Étape Check : ce que montre le modèle.
  explanations: {
    where: 'The pill and the implant are not in the ovaries, but their hormones travel in the blood to the ovaries: they act there. The vaccine works in the whole body.',
    methods: {
      pill: 'Hormones every day: no egg cell leaves the ovaries. It does not stop STIs.',
      implant: 'A small rod under the skin of the arm releases hormones slowly: no egg cell. It does not stop STIs.',
      condom: 'It catches the sperm cells: no meeting. It also stops chlamydia, and partly HPV (the virus can be on the skin around).',
      internal: 'A thin cover inside the vagina: the sperm cells cannot go further. It also stops chlamydia, and partly HPV.',
      iud: 'In the uterus, the copper stops the sperm cells: no meeting. It does not stop STIs.',
      withdrawal: 'The penis leaves the vagina before the sperm cells come out, but a few sperm cells can come out before. It does not stop STIs.',
      vaccine: 'It does not stop a pregnancy. It protects against HPV only, and works best before the first sexual contact.'
    },
    advice: 'There is often more than one good advice. A good advice is the one that meets the needs of the couple, not “the best method”.',
    partners: 'Protection is a shared responsibility: in the model, the condom of one partner protects both of them, and a pregnancy needs a sperm cell and an egg cell.',
    dual: 'Dual protection: a condom against STIs, and another method against a pregnancy if needed.'
  },

  check: {
    noExperiment: 'You did not carry out the experiment: there are no notes.',
    notesScore: (good, total) => `${good} / ${total} notes match the model.`,
    notesKey: 'A red box is a mistake: your answer, and below it, what the model showed.',
    badgeLine: (tryName, need, met) => `${tryName}, “${need}”: ${met}.`,
    placeLine: (method, yours, right) => `${method}: on your drawing, ${yours}. It acts on: ${right}.`,
    placeAllGood: 'All your cards are in the right place. Great work!',
    stopLine: (method, way, shield) => `${method}: ${way}${shield ? ', and it also stops an STI' : ''}.`,
    youSaid: (way, shield) => `(you said: ${way}${shield ? ', stops an STI' : ''})`,
    yourAdvice: 'Your advice:',
    needLine: (need, ok) => `“${need}”: ${ok ? 'met' : 'not met'}.`,
    proofLine: (text, ok) => `Your proof: ${text}${ok ? '' : ' — this box does not prove it: choose a ✗ box of a method of your advice, in the right column.'}`,
    whoLine: who => `Responsible for protection: ${who}. It is a shared responsibility: both partners.`,
    verdictPlace: (same, total, word) => `${same} of your ${total} cards were already in the right place at the start: hypothesis 1 ${word}.`,
    verdictAdvice: word => `Your first advice and your ticks for the needs: hypothesis 2 ${word}.`,
    whereNote: zone => `It acts on: ${zone}.`,
    cellNote: (col, mark) => `${col} The model showed: ${mark}.`,
    badgeNote: met => `With this advice, the need is ${met}.`,
    whereReport: list => `Right places: ${list}.`,
    wayNote: way => `It belongs to: ${way}.`,
    shieldWrong: 'This method does not stop STIs.',
    shieldMissing: 'This method also stops an STI.',
    proofNote: col => `Choose a ✗ box in the column “${col}”, in the line of a method of your advice.`,
    unmetNote: list => `Not met: ${list}.`,
    whoNote: 'Both partners: it is a shared responsibility.'
  }
});
