/* ===== Labo virtuel « The great melting race » (phys2) : textes en néerlandais =====

   Simulation commune aux deux filières : js/lab-melting.js, chargée après
   ce fichier. Mêmes clés que l'anglais (en/year1/phys2/lab-melting.en.js),
   seul le lexique (glossary) a ses propres mots.

   Les mots du lexique sont soulignés d'office partout où ils apparaissent
   (traduction française au survol ou au toucher). Termes repris du
   chapitre : temperatuur, warmte, thermische energie, deeltjes (bewegen
   sneller), tas, koude, balans, thermometer. La cruche graduée est une
   « maatbeker » (pas « kan », qui est aussi un verbe courant).

   Phrases de la conclusion : chacune reçoit sa liste déroulante toute
   faite. Après un complément en tête (« In elke doos »), le verbe vient en
   deuxième place : il est dans le choix (« gaf het water warmte… ») ;
   dans une subordonnée (« toen… »), le verbe est à la fin du choix. */

LabEngine.addText('melting', {
  labels: {
    title: 'De grote smeltrace',

    // Page d'accueil (Mission) : toujours la même, rien du tirage ; des gestes, jamais des résultats.
    briefTitle: 'Opdracht: vind het water dat het best ijs smelt',
    briefTask: 'Een kleine tas met heel heet water, een grote maatbeker met koeler water en twee gelijke ijsblokken. Welk water zal meer ijs smelten?',
    briefSteps: [
      '<strong>Gok</strong> op de winnaar.',
      '<strong>Weeg</strong>, <strong>meet</strong>, <strong>giet</strong> en <strong>bekijk</strong> de deeltjes.',
      '<strong>Leg uit</strong> wie won, en waarom.'
    ],
    // Sous chaque phrase courte : le comment, en une phrase (jamais le résultat).
    briefDetails: [
      'Tik op je keuzes. Je mag zeggen waarom.',
      'Schrijf alles in je notities. De deeltjesloep toont wat er in elke doos gebeurt.',
      'Gebruik je notities en wat je in de loep zag.'
    ],

    // Nombres entiers ; température avec le signe moins typographique.
    deg: v => (v < 0 ? '−' : '') + Math.abs(v),
    vol: v => `${v} ml`,
    mass: m => `${m} g`,
    minutes: n => `${n} min`,
    units: { c: '°C', ml: 'ml' },
    subtraction: (a, b, r) => `${a} − ${b} = ${r}`,

    yourQuestion: 'Jouw onderzoeksvraag',
    bigQuestion: 'Smelt het warmste water altijd het meeste ijs?',
    todayTitle: 'Jouw experiment',
    // Volumes et températures déjà écrits (labels.vol, labels.deg + °C).
    situation: (mv, mt, jv, jt) => `Een glazen tas met ${mv} water van ${mt}. Een maatbeker met ${jv} water van ${jt}. Twee gelijke ijsblokken, twee gelijke geïsoleerde dozen.`,

    hypothesisTitle: 'Jouw hypothese',
    hyp: {
      winner: 'Welk water zal meer ijs smelten?',
      final: 'Welk water zal warmer zijn als het ijs niet meer smelt?'
    },
    betChoices: {
      winner: { mug: 'het water van de tas', jug: 'het water van de maatbeker', same: 'evenveel ijs' },
      final: { mug: 'het water van de tas', jug: 'het water van de maatbeker', same: 'dezelfde temperatuur' }
    },
    because: 'Waarom denk je dat? (niet verplicht)',
    becausePlaceholder: 'Omdat…',
    hypothesisReady: 'Je hypothese is klaar.',
    hypothesisPending: 'Doe je twee gokken.',
    toBench: 'Verder: het experiment',

    // name : sous le récipient ; col : en-tête du carnet ; box : la boîte où va cette eau.
    sides: {
      mug: { name: 'tas', col: 'Tas', box: 'de doos van de tas' },
      jug: { name: 'maatbeker', col: 'Maatbeker', box: 'de doos van de maatbeker' }
    },
    tools: { probe: 'thermometer', lens: 'deeltjesloep', balance: 'balans', tray: 'dienblad', box: 'geïsoleerde doos', ice: 'ijsblok' },
    pour: 'Gieten',
    choose: 'kies',

    lockHypothesis: 'Doe eerst je twee gokken.',
    lockHypothesisFixed: 'Je hypothese kan niet meer veranderen: het experiment is begonnen. Een wetenschapper verandert de hypothese niet na het zien van de resultaten!',
    lockNotStarted: 'Voer eerst het experiment uit.',
    lockRun: 'Werk eerst het experiment af: elk vakje van je notities en wat je in de loep zag.',
    lockVolPoured: 'Het water zit nu in de doos: je kunt dit volume niet meer aflezen.',
    lockT0Late: 'Er is tijd verstreken: het water heeft zijn begintemperatuur niet meer.',
    lockT0Probe: 'Steek eerst een thermometer in dit water.',
    lockIce0Fixed: 'Dit ijsblok ligt nu onder water: je kunt het niet meer wegen.',
    lockIce0Balance: 'Leg eerst een ijsblok op de balans.',
    lockEndWait: 'Wacht tot de thermometers niet meer veranderen.',
    lockIce1: box => `Haal eerst het ijsblok uit ${box} en leg het op de balans.`,
    lockMelted: 'Schrijf eerst de massa van het ijsblok bij het begin en op het einde.',
    lockPourIce: 'Leg eerst een gewogen ijsblok in de doos eronder.',
    lockPourIce0: 'Schrijf eerst de massa van het ijsblok.',
    lockPourProbe: 'Steek eerst een thermometer in dit water.',
    lockPourT0: 'Schrijf eerst de temperatuur van dit water.',
    lockPourVol: 'Schrijf eerst het volume van dit water.',
    lockSeenStart: 'Zet eerst de loep op elke doos.',
    lockSeenFixed: 'Er is tijd verstreken: deze notitie gaat over het begin.',
    lockSeenEnd: 'Zet de loep opnieuw op elke doos.',
    lockWaitPour: 'Giet eerst het water van de tas en van de maatbeker.',
    lockWaitLook: 'Kijk eerst met de deeltjesloep in de twee dozen.',
    lockWaitSeen: 'Schrijf eerst wat je in de loep ziet.',
    lockLens: 'Giet eerst water: de loep kijkt in de dozen.',

    wait: n => `${n} minuten wachten`,
    waitLocked: 'Nog niet',
    waitReady: 'Kijk naar de thermometers',
    waitDone: 'Er verandert niets meer',
    waitDoneSub: 'De thermometers blijven gelijk.',
    timerInfo: 'Tijd sinds het gieten',

    lensTitle: 'Deeltjesloep',
    lensOn: box => `In ${box}`,
    lensEmpty: 'Zet de deeltjesloep op een doos om de deeltjes te zien.',
    keyDot: '1 stip = veel waterdeeltjes',
    seenStart: 'Bij het begin',
    seenEnd: 'Op het einde',
    seenLabels: {
      fastStart: 'De deeltjes bewegen sneller in…',
      moreStart: 'Er zijn meer deeltjes in…',
      fastEnd: 'De deeltjes bewegen sneller in…'
    },
    seenChoices: { mug: 'de doos van de tas', jug: 'de doos van de maatbeker', same: 'geen verschil' },

    notesTitle: 'Jouw notities',
    groups: { before: 'Voor het gieten', after: 'Als er niets meer verandert', result: 'Resultaat' },
    fields: {
      vol: 'Volume water',
      t0: 'Temperatuur bij het begin',
      ice0: 'IJsblok bij het begin',
      t1: 'Temperatuur op het einde',
      ice1: 'IJsblok op het einde',
      melted: 'Gesmolten ijs'
    },
    fieldUnits: { vol: 'ml', t0: '°C', ice0: 'g', t1: '°C', ice1: 'g', melted: 'g' },
    cellAria: (field, side) => `${field}, ${side}`,
    meltedHint: 'Gesmolten ijs = ijsblok bij het begin − ijsblok op het einde.',

    // La légende : la prochaine chose à faire (voir nextTask dans la simulation).
    captions: {
      weigh: 'Neem een ijsblok van het dienblad en leg het op de balans.',
      readMass: 'Lees de balans af. Schrijf de massa van het ijsblok in je notities.',
      toBox: 'Leg het gewogen ijsblok in een lege geïsoleerde doos. Weeg daarna het andere.',
      reweigh: 'Leg een ijsblok terug op de balans en schrijf zijn massa op.',
      probe: 'Neem een thermometer en steek hem in de tas. Steek de andere in de maatbeker.',
      t0: 'Lees de thermometers af. Schrijf de temperatuur van elk water in je notities.',
      vol: 'Lees het volume water af op de tas en op de maatbeker. Schrijf het in je notities.',
      pour: 'Alles is genoteerd: druk op “Gieten” om elk water op zijn ijsblok te gieten.',
      look: 'Neem de deeltjesloep en zet die op elke doos. Kijk goed!',
      seen: 'Schrijf onder de tekening wat je in de loep ziet.',
      wait: 'Laat de tijd lopen: druk op “10 minuten wachten”. Kijk naar de thermometers en het ijs.',
      t1: 'De thermometers veranderen niet meer. Schrijf de temperatuur van elk water op.',
      lookEnd: 'Zet de deeltjesloep opnieuw op elke doos.',
      seenEnd: 'Schrijf op wat je nu in de loep ziet.',
      readMassEnd: 'Lees de balans af. Schrijf de massa van dit ijsblok op het einde.',
      freeBalance: 'Leg dit ijsblok op het dienblad. Haal daarna het andere uit zijn doos.',
      takeOut: 'Haal elk ijsblok uit zijn doos en leg het op de balans.',
      reweighEnd: 'Leg het andere ijsblok op de balans en schrijf zijn massa op.',
      melted: 'Bereken voor elke doos de massa gesmolten ijs: begin min einde.',
      done: 'Het experiment is voorbij. Bekijk je notities en ga dan verder met besluiten.'
    },
    captionHoldIce: 'Tik nu op de plaats waar je het wilt leggen: de balans, het dienblad of een doos.',
    captionHoldProbe: 'Tik nu op het water waar je de thermometer in wilt steken.',
    captionHoldLens: 'Tik nu op de doos waarin je wilt kijken.',
    captionWeighFirst: 'Weeg dit ijsblok eerst: leg het op de balans.',
    captionIceStays: 'Het ijsblok blijft in het water tot de thermometers niet meer veranderen.',
    captionTakeFirst: 'Neem eerst iets: tik erop, en tik dan op de plaats waar het moet komen.',
    captionBoxEmpty: 'Leg een gewogen ijsblok in deze doos.',
    captionContProbe: 'Neem een thermometer en steek hem in dit water.',
    captionUsePour: 'Druk op “Gieten” om dit water op zijn ijsblok te gieten.',
    captionPouring: 'Je giet het water op het ijsblok. Het deksel gaat dicht.',
    captionWaiting: 'Er gaan tien minuten voorbij…',
    captionBad: {
      vol: 'Schrijf het volume dat op het recipiënt staat, in ml (bijvoorbeeld 250).',
      t0: 'Schrijf de temperatuur die de thermometer toont, in °C (bijvoorbeeld 45).',
      ice0: 'Schrijf de massa die de balans toont, in g (bijvoorbeeld 950).',
      t1: 'Schrijf de temperatuur die de thermometer toont, in °C (bijvoorbeeld 45).',
      ice1: 'Schrijf de massa die de balans toont, in g (bijvoorbeeld 950).',
      melted: 'Schrijf een geheel aantal gram (bijvoorbeeld 120).'
    },

    runSetup: 'Zet je experiment klaar.',
    runInfo: t => `Tijd sinds het gieten: ${t}`,
    missingRun: 'Er ontbreekt nog iets: kijk naar de rode vakjes.',
    toConclude: 'Verder: besluiten',
    backToLab: 'Terug naar het labo',
    checkConclusions: 'Mijn besluiten controleren',

    resultsTitle: 'Jouw resultaten',
    yourBet: {
      winner: b => `Jouw gok op de winnaar: ${b}.`,
      final: b => `Jouw gok op het warmere water op het einde: ${b}.`
    },
    qWinner: 'Wie won de race? Was het het warmste water?',
    qWhy: 'Waarom? Denk aan de deeltjes.',
    // Chaque phrase reçoit sa liste ; dans la correction, le bon choix.
    concl: {
      most: sel => `De winnaar: ${sel}.`,
      hottest: sel => `Het warmste water heeft dus ${sel}.`,
      temp: sel => `De thermometer vertelt je ${sel}.`,
      energy: sel => `De thermische energie van het water hangt af van ${sel}.`,
      heat: sel => `In elke doos ${sel}.`,
      stop: sel => `Het ijs stopte met smelten toen het water en het ijs ${sel}.`
    },
    words: {
      most: { mug: 'het water van de tas', jug: 'het water van de maatbeker', same: 'geen winnaar, ze smolten evenveel ijs' },
      hottest: { yes: 'het meeste ijs gesmolten', no: 'niet het meeste ijs gesmolten' },
      temp: { energy: 'hoeveel thermische energie er is', fast: 'hoe snel de deeltjes bewegen', many: 'hoeveel deeltjes er zijn' },
      energy: { fast: 'hoe snel de deeltjes bewegen', many: 'hoeveel deeltjes het heeft', both: 'hoe snel de deeltjes bewegen en hoeveel het er heeft' },
      heat: { cold: 'gaf het ijs koude aan het water', waterToIce: 'gaf het water warmte aan het ijs', iceToWater: 'gaf het ijs warmte aan het water' },
      stop: { noEnergy: 'geen thermische energie meer hadden', sameTemp: 'dezelfde temperatuur hadden', sameMass: 'dezelfde massa hadden' }
    },
    conclAria: {
      most: 'De winnaar',
      hottest: 'Heeft het warmste water het meeste ijs gesmolten?',
      temp: 'Wat de thermometer je vertelt',
      energy: 'Waarvan de thermische energie afhangt',
      heat: 'Wat er in elke doos gebeurde',
      stop: 'Wanneer het ijs stopte met smelten'
    },
    verdictWinner: 'Mijn gok op de winnaar is',
    verdictFinal: 'Mijn gok op het warmere water op het einde is',
    confirmed: 'bevestigd',
    rejected: 'verworpen',

    scoreLabel: 'controles geslaagd',
    markCorrect: 'juist',
    markIncorrect: 'fout',
    criteria: { measure: 'Metingen', particles: 'De deeltjes', winner: 'De winnaar', heat: 'Warmte en temperatuur', verdict: 'Hypothese' },
    criteriaSub: {
      measure: 'Je notities en je aftrekkingen',
      particles: 'Wat je in de loep zag',
      winner: 'Je antwoord op “wie won?”',
      heat: 'Je antwoord op “waarom?”',
      verdict: 'Je beoordeling'
    },
    // Sous un dessin figé de la loupe : la boîte et la température de l'eau.
    stillCaption: (box, t) => `${box}, ${t}`,

    report: {
      title: 'Laboverslag — Warmte en temperatuur: de grote smeltrace',
      because: 'Omdat',
      hypWinner: b => `Het water dat meer ijs zal smelten: ${b}.`,
      hypFinal: b => `Als het ijs niet meer smelt, is het warmere water: ${b}.`,
      materials: (mv, mt, jv, jt) => `Een glazen tas met ${mv} water van ${mt}, een maatbeker met ${jv} water van ${jt}, twee gelijke ijsblokken, twee gelijke geïsoleerde dozen met een deksel, een balans, twee digitale thermometers, een denkbeeldige deeltjesloep.`,
      steps: [
        'Weeg elk ijsblok en schrijf zijn massa op.',
        'Steek een thermometer in elk water. Schrijf de temperatuur en het volume van elk water op.',
        'Leg een ijsblok in elke doos. Giet het water van de tas op het ene blok en het water van de maatbeker op het andere. Sluit de deksels.',
        'Kijk met de deeltjesloep in elke doos.',
        'Wacht tot de thermometers niet meer veranderen. Schrijf de eindtemperaturen op. Kijk opnieuw met de loep.',
        'Haal elk ijsblok eruit en weeg het. Bereken de massa gesmolten ijs.'
      ],
      seenStart: (fast, more) => `Bij het begin bewogen de deeltjes sneller in: ${fast}. Er waren meer deeltjes in: ${more}.`,
      seenEnd: fast => `Op het einde bewogen de deeltjes sneller in: ${fast}.`,
      verdict: (text, word) => `${text} ${word}.`,
      score: (n, total) => `Score: ${n} / ${total} controles geslaagd.`
    }
  },

  glossary: {
    ijsblok: 'bloc de glace', ijsblokken: 'blocs de glace',
    smelten: 'fondre', smelt: 'fond', smolt: 'a fondu', smolten: 'ont fondu', gesmolten: 'fondu',
    smeltrace: 'course à la fonte', tas: 'tasse', maatbeker: 'verre doseur (cruche graduée)',
    'geïsoleerde doos': 'boîte isolante', 'geïsoleerde dozen': 'boîtes isolantes', doos: 'boîte', dozen: 'boîtes',
    deksel: 'couvercle', deksels: 'couvercles', dienblad: 'plateau',
    weeg: 'pèse', wegen: 'peser', gewogen: 'pesé', giet: 'verse', gieten: 'verser',
    loep: 'loupe', deeltjesloep: 'loupe à particules', stip: 'point', deeltjes: 'particules', waterdeeltjes: "particules d'eau",
    warmte: 'chaleur', 'thermische energie': 'énergie thermique', koude: 'froid',
    warmste: 'la plus chaude', warmer: 'plus chaude', warmere: 'plus chaude', koeler: 'plus froide',
    sneller: 'plus vite', 'hoe snel': 'à quelle vitesse', hoeveel: 'combien', evenveel: 'autant',
    'hangt af van': 'dépend de', gok: 'pari', gokken: 'paris', winnaar: 'gagnant',
    aftrekkingen: 'soustractions', trillen: 'vibrent (tremblent sur place)'
  },

  // Étape Check : ce que montre le modèle.
  explanations: {
    particles: 'De loep toont al het water van elke doos: 1 stip staat voor veel deeltjes. Hoe warmer het water, hoe sneller de deeltjes bewegen: het water van de tas was het warmst. De maatbeker had meer water, dus meer deeltjes. Op het einde was het water in de twee dozen 0 °C: de deeltjes bewogen even snel. In het ijs blijven de deeltjes op hun plaats en trillen ze alleen.',
    // Volumes et températures déjà écrits.
    winner: {
      jug: (mv, mt, jv, jt) => `Het water van de tas (${mv} van ${mt}) was warmer: de deeltjes bewogen sneller. Maar de maatbeker had ${jv} water: veel meer deeltjes, ook al bewogen ze trager. Samen had het water van de maatbeker meer thermische energie om aan het ijs te geven. Het warmste water smelt dus niet altijd het meeste ijs: het hangt af van hoe snel de deeltjes bewegen en hoeveel deeltjes er zijn.`,
      mug: (mv, mt, jv, jt) => `Het water van de tas (${mv} van ${mt}) had minder deeltjes dan het water van de maatbeker (${jv} van ${jt}), maar ze bewogen veel sneller. Samen had het water van de tas hier meer thermische energie om aan het ijs te geven. Het warmste water won deze keer, maar niet altijd: met veel meer water kan koeler water winnen. Het hangt af van hoe snel de deeltjes bewegen en hoeveel deeltjes er zijn.`,
      same: (mv, mt, jv, jt) => `Het water van de tas (${mv} van ${mt}) had weinig deeltjes die snel bewogen. Het water van de maatbeker (${jv} van ${jt}) had veel deeltjes die trager bewogen. Samen hadden ze evenveel thermische energie om aan het ijs te geven: er smolt evenveel ijs. Het warmste water smelt dus niet altijd het meeste ijs.`
    },
    model: 'Dit labo is een model: de dozen zijn perfect geïsoleerd (er komt geen warmte uit de lucht) en het ijs begint precies bij 0 °C. In een echte klas zouden de getallen een beetje anders zijn.',
    // Les trois mots : [le mot, ce qu'il veut dire].
    words: {
      temperature: ['Temperatuur', 'Hoe snel de deeltjes bewegen. Je meet de temperatuur met een thermometer, in °C.'],
      energy: ['Thermische energie', 'De energie van alle bewegende deeltjes. Ze hangt af van hoe snel ze bewegen en hoeveel deeltjes er zijn.'],
      heat: ['Warmte', 'Thermische energie die van een warmer voorwerp naar een kouder voorwerp gaat.']
    },
    cold: 'Het ijs geeft geen “koude”: warmte gaat altijd van het warmere voorwerp naar het koudere. Het water gaf warmte aan het ijs: het water koelde af en het ijs smolt. Het smelten stopte toen het water en het ijs dezelfde temperatuur hadden: 0 °C. Bij 0 °C heeft het water nog thermische energie: de deeltjes bewegen nog.',
    finalTemp: 'Op het einde was het water in de twee dozen 0 °C, zoals het ijs: er gaat geen warmte meer van het ene voorwerp naar het andere als ze dezelfde temperatuur hebben.'
  },

  // v : ce que l'élève a noté (null si rien) ; r : la vraie valeur ; déjà écrits avec leur unité.
  check: {
    noExperiment: 'Je hebt het experiment niet uitgevoerd: er zijn geen metingen.',
    measureScore: (good, total) => `${good} / ${total} notities juist geschreven.`,
    measureAllGood: 'Al je notities kloppen met de recipiënten, de thermometers en de balans, en je aftrekkingen zijn juist. Goed gedaan!',
    fieldMiss: (col, field, v, r, source) => (v == null ? `${col}, ${field}: niets geschreven (${source} toonde ${r}).` : `${col}, ${field}: je schreef ${v}, ${source} toonde ${r}.`),
    meltedMiss: (col, v, right) => (v == null ? `${col}, gesmolten ijs: niets geschreven (${right}).` : `${col}, gesmolten ijs: je schreef ${v}, maar ${right}.`),
    sources: { vol: 'het recipiënt', t0: 'de thermometer', ice0: 'de balans', t1: 'de thermometer', ice1: 'de balans' },
    more: n => `… en nog ${n}.`,
    seenLine: (label, yours, right) => `${label} Jouw keuze: ${yours}. De loep toonde: ${right}.`,
    seenNote: {
      fastStart: right => `Het warmste water heeft de snelste deeltjes: ${right}.`,
      moreStart: right => `Meer water betekent meer deeltjes: ${right}.`,
      fastEnd: right => `Op het einde was het water in de twee dozen 0 °C: ${right}.`
    },
    answerOk: 'Juist!',
    answerWrong: 'Niet helemaal. Het juiste antwoord:',
    yourMelted: (a, b) => `Je notities: ${a} ijs gesmolten met het water van de tas, ${b} met het water van de maatbeker.`,
    whyNote: {
      temp: 'De temperatuur vertelt hoe snel de deeltjes bewegen, niet hoeveel er zijn.',
      energy: 'Snellere deeltjes of meer deeltjes: meer thermische energie.',
      heat: 'Warmte gaat van het warmere voorwerp naar het koudere. Koude verplaatst zich niet.',
      stop: 'Water van 0 °C heeft nog thermische energie: de deeltjes bewegen nog. De warmte stopt als de temperaturen gelijk zijn.'
    },
    mostNote: right => `Het juiste antwoord, volgens je notities: ${right}`,
    verdictWinner: {
      confirmed: 'Je gok en je besluit noemen dezelfde winnaar: je gok is bevestigd.',
      rejected: 'Je gok en je besluit noemen niet dezelfde winnaar: je gok is verworpen.'
    },
    verdictFinal: {
      confirmed: 'Je gok en je eindtemperaturen zeggen hetzelfde: je gok is bevestigd.',
      rejected: 'Je gok en je eindtemperaturen zeggen niet hetzelfde: je gok is verworpen.'
    },
    yourConclusion: sentence => `Je besluit: ${sentence}`,
    yourFinal: (a, b) => `Je notities op het einde: ${a} in de doos van de tas, ${b} in de doos van de maatbeker.`,
    judgedOk: 'Goed beoordeeld!',
    judgedWrong: 'Je hebt het omgekeerd beoordeeld.',
    rejectedNote: 'Een verworpen hypothese is geen fout: zo gaat de wetenschap vooruit.'
  }
});
