/* ===== Labo virtuel « Stop the journey » (bio2) : textes en néerlandais =====

   Simulation commune aux deux filières : js/lab-journey.js, chargée après
   ce fichier. Mêmes clés que l'anglais (en/year1/bio2/lab-journey.en.js),
   sauf le lexique (glossary).

   Mots du chapitre NL (vocabulary.json, practice.json, interactive.json) :
   testikels, penis, vagina, baarmoeder, eileiders, eierstokken, eicel,
   zaadcellen, de pil, het implantaat, het condoom, het vrouwencondoom, het
   koperen spiraaltje, terugtrekken, het HPV-vaccin, soa, geslachtsgemeenschap,
   dubbele bescherming, gedeelde verantwoordelijkheid ; jeu de tri « Stop de
   reis » : « Geen eicel », « Geen ontmoeting ».

   Les prénoms du couple (girls, boys) : même nombre qu'en anglais. */

LabEngine.addText('journey', {
  labels: {
    title: 'Stop de reis',

    // Page d'accueil (Mission) : toujours la même, rien du tirage ; des gestes, jamais des résultats.
    briefTitle: 'Opdracht: zoek waar elk middel de reis stopt',
    briefTask: 'Je bent gezondheidsconsulent voor jongeren. Op een model van de twee voortplantingsstelsels volg je de reis van de zaadcellen, de eicel en twee infecties. Waar stopt elk middel ze?',
    briefSteps: [
      '<strong>Leg</strong> elk middel op de tekeningen. <strong>Kies</strong> een advies voor een koppel.',
      '<strong>Test</strong> elk middel op het model en <strong>vink aan</strong> wat je ziet. <strong>Test</strong> dan je advies.',
      '<strong>Verklaar</strong> met je notities.'
    ],
    // Sous chaque phrase courte : le comment, en une phrase (jamais le résultat).
    briefDetails: [
      'Leg elke kaart waar het middel volgens jou werkt.',
      'Druk op “Start”, kijk, tik dan op de plaats in de tekening en vink de vakjes aan.',
      'Verbeter je tekening, sorteer de middelen en bewijs je advies met je notities.'
    ],

    yourQuestion: 'Jouw onderzoeksvraag',
    q1: 'Waar werkt elk middel, en wat stopt het?',
    q2: (girl, boy) => `${girl} en ${boy}: welke middelen passen bij hun behoeften?`,

    hypothesisTitle: 'Jouw hypothese',
    placeHow: 'Leg elke kaart op de tekeningen, waar het middel volgens jou werkt. Tik op een kaart en tik dan op de plaats (of schuif ze).',
    adviceHow: 'Jouw advies: kies 1 of 2 middelen.',
    because: 'Waarom denk je dat? (niet verplicht)',
    becausePlaceholder: 'Omdat…',
    hypothesisReady: 'Je hypothese is klaar.',
    hypothesisPending: 'Leg de zeven kaarten en kies je advies.',
    toBench: 'Volgende: het model',

    lockHypothesis: 'Leg eerst de zeven kaarten en kies je advies.',
    lockHypothesisFixed: 'Je hypothese ligt vast: het experiment is begonnen. Een wetenschapper verandert zijn hypothese niet nadat hij de resultaten gezien heeft!',
    lockNotStarted: 'Voer eerst het experiment uit.',
    lockRun: 'Werk eerst het experiment af.',

    girls: ['Lou', 'Emma', 'Nora', 'Inès', 'Zoé', 'Lena'],
    boys: ['Sam', 'Noah', 'Adam', 'Milan', 'Lucas', 'Yanis'],

    methods: {
      pill: 'de pil',
      implant: 'het implantaat',
      condom: 'het condoom',
      internal: 'het vrouwencondoom',
      iud: 'het koperen spiraaltje',
      withdrawal: 'terugtrekken',
      vaccine: 'het HPV-vaccin'
    },
    noMethod: 'geen middel',
    // Comment on l'utilise (petite étiquette sur la carte).
    use: { daily: 'elke dag', each: 'elke keer', years: 'jarenlang' },

    // Les zones du modèle.
    zones: {
      body: 'het hele lichaam',
      bladder: 'blaas',
      testes: 'testikels',
      penis: 'penis',
      vagina: 'vagina',
      uterus: 'baarmoeder',
      tubes: 'eileiders',
      ovaries: 'eierstokken'
    },
    // La flèche du contact, une ligne par élément.
    contact: ['Tijdens geslachtsgemeenschap', 'zit de penis in de vagina.'],
    legend: { sperm: 'zaadcellen', egg: 'eicel', chla: 'chlamydia', hpv: 'HPV', hormone: 'hormonen', stis: 'twee soa’s' },

    // Le couple : ses besoins (badges).
    coupleNeeds: 'Hun behoeften:',
    needs: {
      noPregnancy: 'geen zwangerschap',
      sti: 'nieuw koppel, nooit getest op soa’s',
      noHormones: 'geen hormonen',
      nothingDaily: 'niets om elke dag aan te denken',
      hpv: 'bescherming tegen HPV'
    },
    metNot: { yes: 'in orde', no: 'niet in orde' },
    badgeAria: (need, met) => `${need}: ${met}`,

    // Le carnet.
    notesTitle: 'Je notities',
    notes: {
      method: 'Test',
      where: 'Waar werkt het?',
      cols: {
        egg: 'Komt er een eicel vrij?',
        meet: 'Ontmoeten de zaadcellen de eicel?',
        chla: 'Gaat chlamydia over?',
        hpv: 'Gaat HPV over?'
      },
      colsShort: { egg: 'eicel', meet: 'ontmoeting', chla: 'chlamydia', hpv: 'HPV' }
    },
    tryName: n => `Advies ${n}`,
    marks: { yes: 'ja', no: 'nee', partly: 'gedeeltelijk' },
    empty: 'leeg',
    marksKey: 'Tik op een vakje: ✓ ja (het gebeurt, het gaat over) · ✗ nee (het wordt gestopt) · ◐ gedeeltelijk.',
    cellAria: (name, col, mark) => `${name}. ${col} ${mark}`,

    run: 'Start',
    runAgain: 'Opnieuw starten',
    part2Title: (girl, boy) => `${girl} en ${boy}`,
    another: 'Probeer een ander advies',

    // Ce qui manque encore (bouton du pied touché trop tôt).
    missing: {
      run: 'Druk op “Start”.',
      where: method => `Tik op de tekening: waar werkt ${method}?`,
      cells: 'Vink de vier vakjes van deze test aan in je notities.',
      first: 'Test eerst het model zonder middel.',
      pick: 'Test elk middel: tik op een kaart.',
      choose: 'Kies 1 of 2 middelen voor je nieuwe advies.',
      badges: 'Duid voor elke behoefte van het koppel aan: in orde of niet in orde.',
      next: label => `Druk onderaan op “${label}”.`
    },
    next: { part2: 'Volgende: test je advies', conclude: 'Volgende: besluiten' },
    partInfo: {
      1: 'Eerst zonder middel, dan elk middel, één voor één.',
      2: 'Jouw advies voor het koppel, op het model.'
    },
    // La légende : la prochaine chose à faire (voir phase dans la simulation).
    captions: {
      run: method => `${method}: druk op “Start” en bekijk de reis.`,
      runTry: 'Je advies ligt op het model. Druk op “Start” en kijk.',
      where: method => `Waar werkte ${method}? Tik op de plaats in de tekening.`,
      whereTap: method => `Tik op de plaats in de tekening waar ${method} werkt.`,
      cells: 'Kijk naar het model. Vink in je notities de vier vakjes van deze test aan.',
      first: 'Begin met de controle: tik op de kaart “geen middel” en druk dan op “Start”.',
      pick: 'Tik op de kaart van een middel dat je nog niet getest hebt.',
      choose: 'Tik op 1 of 2 kaarten voor je nieuwe advies en druk dan op “Start”.',
      badges: 'Kijk naar je resultaten en naar de kaarten. Is elke behoefte van het koppel in orde?',
      next: {
        part2: 'Alle middelen zijn getest. Ga verder met de knop onderaan.',
        conclude: 'Je advies is getest. Je kunt een ander advies proberen of naar het besluit gaan.'
      }
    },
    captionWhereFirst: 'Kies eerst een middel en druk op “Start”.',
    captionRunning: 'Bekijk de reis…',

    lockFirstNone: 'Test eerst het model zonder middel: dat is je controle.',
    lockFinishRow: method => `Werk eerst de lijn van ${method} in je notities af.`,
    lockTryRan: 'Dit advies is getest. Om het te veranderen: “Probeer een ander advies”.',
    lockRunPick: 'Tik eerst op een kaart.',
    lockRunChoose: 'Tik eerst op 1 of 2 kaarten voor je advies.',
    lockCellRun: 'Start eerst het model met dit middel.',
    lockBadgesRun: 'Start eerst het model met je advies.',

    // Étape 3.
    cTabs: { 1: 'Vraag 1', 2: 'Vraag 2' },
    ways: { w1: 'Manier 1: geen eicel', w2: 'Manier 2: geen ontmoeting', none: 'Stopt geen zwangerschap' },
    c1PlaceHow: 'Je tekening van het begin: verplaats de kaarten die op de verkeerde plaats liggen.',
    c1WayHow: 'Hoe stopt elk middel een zwangerschap? Leg elke kaart in een kader.',
    c1ShieldHow: 'Deze middelen stoppen ook een soa:',
    pileEmpty: 'Alle kaarten liggen in een kader.',
    verdictPlace: 'Mijn hypothese 1 (mijn tekening) is',
    verdictAdvice: 'Mijn hypothese 2 (mijn eerste advies) is',
    verdicts: { confirmed: 'bevestigd', partly: 'gedeeltelijk bevestigd', rejected: 'verworpen' },
    cAdvice: (girl, boy) => `Mijn advies voor ${girl} en ${boy}:`,
    cProofs: 'Tik voor elke behoefte op het vakje hieronder en dan op het resultaat in je notities dat het bewijst.',
    whoQ: 'Wie is verantwoordelijk voor de bescherming?',
    both: 'beide partners',
    noProof: 'Kijk naar de kaarten.',
    proofTap: 'Tik en kies dan een vakje',
    proofCell: (name, col, glyph) => `${name} · ${col} ${glyph}`,
    backToLab: 'Terug naar het labo',
    openNotes: 'Mijn notities',
    checkConclusions: 'Mijn besluiten controleren',
    toQ2: 'Vraag 1 is klaar: open nu “Vraag 2”.',

    // Listes : « het condoom en het implantaat ».
    list: items => (items.length < 2 ? (items[0] || '') : `${items.slice(0, -1).join(', ')} en ${items[items.length - 1]}`),

    scoreLabel: 'controles geslaagd',
    markCorrect: 'juist',
    markIncorrect: 'fout',
    criteria: { notes: 'Je notities', where: 'Waar het werkt', stops: 'Wat het stopt', advice: 'Je advies', partners: 'Beide partners' },
    criteriaSub: {
      notes: 'De tests in je notities',
      where: 'Je verbeterde tekening',
      stops: 'De twee manieren en de soa’s',
      advice: 'De behoeften en je bewijzen',
      partners: 'Verantwoordelijkheid en hypotheses'
    },

    report: {
      title: 'Labverslag — Stop de reis: waar werkt elk middel?',
      because: 'Omdat',
      advice: (girl, boy, list) => `Mijn advies voor ${girl} en ${boy}: ${list}.`,
      key: 'Mijn notities (✓ ja · ✗ nee · ◐ gedeeltelijk):',
      needsTitle: (girl, boy) => `De behoeften van ${girl} en ${boy}, met mijn advies:`,
      whereTitle: 'Mijn verbeterde tekening:',
      whereMark: 'Mijn tekening',
      finalAdvice: (girl, boy, text) => `Mijn advies voor ${girl} en ${boy}: ${text}.`,
      who: text => `Verantwoordelijk voor de bescherming: ${text}.`,
      verdict: (text, word) => `${text} ${word}.`,
      materials: 'Een model van het mannelijke en het vrouwelijke voortplantingsstelsel, met zaadcellen, een eicel, hormonen en de microben van twee soa’s (chlamydia en HPV). Zeven kaarten: de pil, het implantaat, het condoom, het vrouwencondoom, het koperen spiraaltje, terugtrekken, het HPV-vaccin.',
      steps: [
        'Start het model zonder middel: dat is de controle.',
        'Start het model met elk middel, één voor één. Noteer waar het werkt en vink aan wat overgaat of gestopt wordt.',
        'Start het model met mijn advies voor het koppel. Duid voor elke behoefte aan: in orde of niet in orde.',
        'Beantwoord de twee vragen met mijn notities.'
      ],
      score: (n, total) => `Score: ${n} / ${total} controles geslaagd.`
    }
  },

  glossary: {
    pil: 'pilule', implantaat: 'implant', condoom: 'préservatif', condooms: 'préservatifs',
    vrouwencondoom: 'préservatif interne', 'koperen spiraaltje': 'stérilet au cuivre', spiraaltje: 'stérilet',
    terugtrekken: 'le retrait', 'hpv-vaccin': 'vaccin contre le HPV',
    eicel: 'ovocyte', zaadcellen: 'spermatozoïdes', zaadcel: 'spermatozoïde',
    blaas: 'vessie', testikels: 'testicules', baarmoeder: 'utérus', eileiders: 'trompes de Fallope', eierstokken: 'ovaires',
    'hele lichaam': 'corps entier', geslachtsgemeenschap: 'rapport sexuel', bloed: 'sang',
    ontmoeten: 'rencontrer', ontmoeting: 'rencontre', vrij: 'libéré', soa: 'IST', 'soa’s': 'IST',
    reis: 'trajet (voyage)', stopt: 'arrête', stoppen: 'arrêter', gestopt: 'arrêté',
    behoeften: 'besoins', behoefte: 'besoin', advies: 'conseil', gedeeltelijk: 'en partie',
    'elke dag': 'chaque jour', 'elke keer': 'à chaque fois', jarenlang: 'pendant des années',
    'nooit getest': 'jamais dépistés', 'beide partners': 'les deux partenaires',
    'gedeelde verantwoordelijkheid': 'responsabilité partagée', 'dubbele bescherming': 'double protection',
    huid: 'peau', gezondheidsconsulent: 'conseiller santé', 'vink aan': 'coche', aanvinken: 'cocher',
    kader: 'cadre', voortplantingsstelsels: 'appareils reproducteurs', voortplantingsstelsel: 'appareil reproducteur',
    controle: 'témoin (référence)', werkt: 'agit', werkte: 'a agi', koppel: 'couple', verantwoordelijk: 'responsable',
    bescherming: 'protection', 'in orde': 'rempli (c’est bon)'
  },

  // Étape Check : ce que montre le modèle.
  explanations: {
    where: 'De pil en het implantaat zitten niet in de eierstokken, maar hun hormonen gaan via het bloed naar de eierstokken: daar werken ze. Het vaccin werkt in het hele lichaam.',
    methods: {
      pill: 'Elke dag hormonen: er komt geen eicel uit de eierstokken. Het stopt geen soa’s.',
      implant: 'Een klein staafje onder de huid van de arm geeft langzaam hormonen af: geen eicel. Het stopt geen soa’s.',
      condom: 'Het vangt de zaadcellen op: geen ontmoeting. Het stopt ook chlamydia, en HPV gedeeltelijk (het virus kan op de huid rondom zitten).',
      internal: 'Een dun omhulsel in de vagina: de zaadcellen kunnen niet verder. Het stopt ook chlamydia, en HPV gedeeltelijk.',
      iud: 'In de baarmoeder stopt het koper de zaadcellen: geen ontmoeting. Het stopt geen soa’s.',
      withdrawal: 'De penis verlaat de vagina voor de zaadcellen naar buiten komen, maar er kunnen al een paar zaadcellen vroeger naar buiten komen. Het stopt geen soa’s.',
      vaccine: 'Het stopt geen zwangerschap. Het beschermt alleen tegen HPV en werkt het best voor het eerste seksuele contact.'
    },
    advice: 'Er is vaak meer dan één goed advies. Een goed advies past bij de behoeften van het koppel: het is niet “het beste middel”.',
    partners: 'Bescherming is een gedeelde verantwoordelijkheid: in het model beschermt het condoom van de ene partner hen allebei, en voor een zwangerschap zijn een zaadcel en een eicel nodig.',
    dual: 'Dubbele bescherming: een condoom tegen soa’s, en zo nodig een ander middel tegen een zwangerschap.'
  },

  check: {
    noExperiment: 'Je hebt het experiment niet uitgevoerd: er zijn geen notities.',
    notesScore: (good, total) => `${good} / ${total} notities kloppen met het model.`,
    notesKey: 'Een rood vakje is een fout: jouw antwoord, en eronder wat het model toonde.',
    badgeLine: (tryName, need, met) => `${tryName}, “${need}”: ${met}.`,
    placeLine: (method, yours, right) => `${method}: op je tekening ${yours}. Het werkt op: ${right}.`,
    placeAllGood: 'Al je kaarten liggen op de juiste plaats. Goed gedaan!',
    stopLine: (method, way, shield) => `${method}: ${way}${shield ? ', en het stopt ook een soa' : ''}.`,
    youSaid: (way, shield) => `(jij zei: ${way}${shield ? ', stopt een soa' : ''})`,
    yourAdvice: 'Jouw advies:',
    needLine: (need, ok) => `“${need}”: ${ok ? 'in orde' : 'niet in orde'}.`,
    proofLine: (text, ok) => `Jouw bewijs: ${text}${ok ? '' : ' — dit vakje bewijst het niet: kies een ✗-vakje van een middel uit je advies, in de juiste kolom.'}`,
    whoLine: who => `Verantwoordelijk voor de bescherming: ${who}. Het is een gedeelde verantwoordelijkheid: beide partners.`,
    verdictPlace: (same, total, word) => `${same} van je ${total} kaarten lagen al bij het begin op de juiste plaats: hypothese 1 ${word}.`,
    verdictAdvice: word => `Je eerste advies en wat je aanduidde voor de behoeften: hypothese 2 ${word}.`,
    whereNote: zone => `Het werkt op: ${zone}.`,
    cellNote: (col, mark) => `${col} Het model toonde: ${mark}.`,
    badgeNote: met => `Met dit advies is de behoefte ${met}.`,
    whereReport: list => `Juiste plaatsen: ${list}.`,
    wayNote: way => `Het hoort bij: ${way}.`,
    shieldWrong: 'Dit middel stopt geen soa’s.',
    shieldMissing: 'Dit middel stopt ook een soa.',
    proofNote: col => `Kies een ✗-vakje in de kolom “${col}”, op de lijn van een middel uit je advies.`,
    unmetNote: list => `Niet in orde: ${list}.`,
    whoNote: 'Beide partners: het is een gedeelde verantwoordelijkheid.'
  }
});
