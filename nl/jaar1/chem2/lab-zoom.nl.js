/* ===== Labo virtuel « Zoom in » (chem2) : textes en néerlandais =====

   Simulation commune aux deux filières : js/lab-zoom.js, chargée après ce
   fichier. Mêmes clés que l'anglais (en/year1/chem2/lab-zoom.en.js).

   Chaque mot du lexique (glossary) est souligné partout où il apparaît,
   sauf dans les boutons (lab-engine.js) ; [mot] ou [mot|clé] reste utile
   pour une forme dont la clé diffère.

   Mots du chapitre NL (practice.json, interactive.json) : zuivere stof,
   homogeen / heterogeen mengsel, molecule, deeltje, molecuulmodel,
   wetenschappelijk model, preparaat (lame), kleurensleutel, bokaal, fase,
   stikstof, zuurstof, koolstofdioxide, bruisend water, zout water. */

LabEngine.addText('zoom', {
  labels: {
    title: 'Zoom in',

    // « a, b en c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' en ' + names[names.length - 1] : names[0] || '',
    // « 8 watermoleculen »
    countOf: (n, many) => `${n} ${many}`,

    questions: {
      1: 'Wat zit er echt in deze twee bokalen?',
      2: 'Toont een molecuulmodel de werkelijkheid precies zoals ze is?'
    },
    yourQuestions: 'Jouw vragen',
    intro: 'We kunnen niet altijd op onze ogen vertrouwen. Op je labotafel staan twee gesloten bokalen zonder etiket. Een denkbeeldige microscoop zoomt zo ver in dat we de moleculen kunnen zien.',
    hypothesisTitle: 'Jouw hypotheses',
    jarName: k => `Bokaal ${k}`,
    jarAria: 'Welke bokaal',
    look: {
      clear: 'Een heldere vloeistof, zonder kleur.',
      gas: 'We zien niets in de bokaal: alleen een gas zonder kleur.',
      layers: 'Twee lagen vloeistof: een gele laag boven op een heldere laag.'
    },
    hypJar: k => `Ik denk dat bokaal ${k} dit is:`,
    hypJarText: (k, word) => `Ik denk dat bokaal ${k} ${word} is.`,
    kinds: { pure: 'een zuivere stof', homo: 'een homogeen mengsel', hetero: 'een heterogeen mengsel' },
    kindChip: { pure: 'Zuivere stof', homo: 'Homogeen mengsel', hetero: 'Heterogeen mengsel' },
    hypModel: 'Ik denk dat een molecuulmodel:',
    hypModelText: word => `Ik denk dat een molecuulmodel ${word}.`,
    modelWords: { exact: 'de werkelijkheid precies toont zoals ze is', simplified: 'de werkelijkheid niet precies toont zoals ze is' },
    // Dans une phrase principale (Conclude) : le verbe vient juste après le sujet
    modelMain: { exact: 'toont de werkelijkheid precies zoals ze is', simplified: 'toont de werkelijkheid niet precies zoals ze is' },
    because: 'Waarom denk je dat? (niet verplicht)',
    becausePlaceholder: 'Omdat…',
    hypothesisReady: 'Je hypotheses zijn klaar.',
    hypothesisPending: 'Vul je drie hypotheses in.',
    toBench: 'Volgende: de microscoop',
    lockHypothesis: 'Vul eerst je drie hypotheses in.',
    lockHypothesisFixed: 'Je hypotheses liggen vast: het onderzoek is begonnen. Een wetenschapper verandert zijn hypothese niet nadat hij de resultaten gezien heeft!',

    // Le microscope et la lame
    benchTitle: 'Je labotafel',
    scopeEmpty: 'Tik op een bokaal.',
    underScope: jar => `Onder de microscoop: ${jar}`,
    slideTitleEmpty: 'Het preparaat',
    slideTitle: jar => `Jouw model: ${jar}`,
    slideAria: 'Het preparaat onder de microscoop: jouw molecuulmodel',
    sideEmpty: 'Tik op een bokaal: de denkbeeldige microscoop zoomt erop in.',
    readingTitle: 'De microscoop leest',
    keyTitle: 'Kleurensleutel',
    particles: {
      water: { name: 'Watermolecule', many: 'watermoleculen' },
      salt: { name: 'Zoutdeeltje', many: 'zoutdeeltjes' },
      nitrogen: { name: 'Stikstofmolecule', many: 'stikstofmoleculen' },
      oxygen: { name: 'Zuurstofmolecule', many: 'zuurstofmoleculen' },
      oil: { name: 'Oliemolecule', many: 'oliemoleculen' },
      co2: { name: 'Koolstofdioxidemolecule', many: 'koolstofdioxidemoleculen' }
    },
    captionJar: 'Tik op een bokaal om hem onder de microscoop te zetten.',
    captionColour: 'Tik eerst op een kleur in de kleurensleutel.',
    captionPlace: 'Tik op het preparaat om een deeltje van deze kleur toe te voegen.',
    captionMove: 'Tik op het preparaat om een deeltje toe te voegen. Sleep een deeltje om het te verplaatsen. Tik op een deeltje om het weg te halen.',
    captionFull: 'Het preparaat is vol: haal eerst een deeltje weg.',
    captionCompared: 'Je model ligt vast. Vergelijk de twee preparaten en vul dan je schrift in.',
    compareBtn: 'Vergelijken met het referentiemodel',
    compareTitle: 'Je model vergelijken?',
    compareText: 'Daarna kun je je model van deze bokaal niet meer veranderen.',
    compareYes: 'Ja, vergelijken',
    refTitle: 'Referentiemodel',
    refAria: jar => `Referentiemodel: ${jar}`,
    refNote: 'Dit referentiemodel is ook een tekening, geen foto.',
    sampleWas: name => `In deze bokaal: ${name}.`,
    samples: {
      water: { name: 'zuiver water' },
      oxygen: { name: 'zuivere zuurstof' },
      air: { name: 'lucht' },
      salty: { name: 'zout water' },
      sparkling: { name: 'bruisend water in een gesloten fles' },
      oilwater: { name: 'water en olie' }
    },
    lockNoJar: 'Tik eerst op een bokaal.',
    lockEmpty: 'Bouw eerst je model op het preparaat.',
    lockModelFixed: 'Je model ligt vast: je hebt het vergeleken. Wil je het opnieuw proberen, begin het labo dan opnieuw.',
    lockNote: jar => `Vergelijk eerst je model van ${jar}.`,
    lockPure: 'Een zuivere stof is geen mengsel: hier valt niets te kiezen.',
    lockKindFirst: 'Kies eerst: zuivere stof of mengsel?',
    lockRun: (models, notes) => {
      const parts = [];
      if (models) parts.push(models === 1 ? '1 model om te vergelijken' : `${models} modellen om te vergelijken`);
      if (notes) parts.push(notes === 1 ? '1 regel ontbreekt in je schrift' : `${notes} regels ontbreken in je schrift`);
      return `Nog niet klaar: ${parts.join(' en ')}.`;
    },
    runInfo: (models, notes) => `Modellen vergeleken: ${models} / 2 · Schrift: ${notes} / 2`,
    toConclude: 'Volgende: besluiten',

    notebookTitle: 'Je schrift',
    typesHead: 'Aantal soorten deeltjes',
    kindHead: 'Zuivere stof of mengsel?',
    mixHead: 'Als het een mengsel is: welk soort?',
    noteKinds: { pure: 'zuivere stof', mixture: 'mengsel' },
    mixWords: { homo: 'homogeen', hetero: 'heterogeen' },
    choose: '— kies —',

    // Étape 3
    resultsTitle: 'Jouw resultaten',
    yourModel: 'Jouw model',
    recapTypes: n => `Soorten deeltjes: ${n}`,
    classmate: 'Een klasgenoot kijkt naar de twee bokalen en zegt: “Het zijn allebei zuivere stoffen!” Leg uit waarom dat niet klopt.',
    concl1: (jar, type, n) => `Nee! ${jar} is geen zuivere stof: het is ${type}, want het aantal soorten deeltjes is ${n}.`,
    typeAria: 'Welk soort mengsel',
    concl2: word => `Een molecuulmodel ${word}.`,
    limitsQ: 'Wat is in onze tekeningen niet zoals in het echt?',
    chooseSeveral: 'Kies er een of meer.',
    limits: { colour: 'De kleuren van de deeltjes', size: 'De grootte van de deeltjes', move: 'Deeltjes die stilstaan', types: 'De soorten deeltjes' },
    whySentence: why => `We gebruiken kleuren om ${why}.`,
    whys: { apart: 'de soorten deeltjes uit elkaar te houden', real: 'de echte kleur van elk deeltje te tonen', nice: 'de tekening mooier te maken' },
    whyAria: 'Waarom we kleuren gebruiken',
    verdictRow: k => (k === 'model' ? 'Hypothese over het model' : `Hypothese over bokaal ${k}`),
    confirmed: 'bevestigd',
    rejected: 'verworpen',
    checkConclusions: 'Mijn besluiten controleren',
    backToLab: 'Terug naar het labo',

    // Étape 4
    scoreLabel: 'controles geslaagd',
    markCorrect: 'juist',
    markIncorrect: 'fout',
    criteria: { particles: 'Deeltjes', arrangement: 'Schikking', classification: 'Indeling', conclusion: 'Vraag 1', limits: 'Vraag 2' },
    criteriaSub: { particles: 'De soorten en de aantallen', arrangement: 'Verspreid of in lagen', classification: 'Je schrift', conclusion: 'Je antwoord en je oordeel', limits: 'Wat een model is' },

    report: {
      title: 'Laboverslag — Zoom in',
      because: 'Omdat',
      materials: 'Twee gesloten bokalen zonder etiket. Een denkbeeldige microscoop. Preparaten en een kleurensleutel.',
      procedure: [
        'Bekijk elke bokaal met het blote oog.',
        'Zet een bokaal onder de denkbeeldige microscoop en lees wat erin zit.',
        'Bouw een molecuulmodel op het preparaat, met de kleurensleutel.',
        'Vergelijk het model met het referentiemodel.',
        'Schrijf in het schrift het aantal soorten deeltjes en het soort materie.'
      ],
      lookHead: 'Met het blote oog',
      modelsCaption: 'Waarnemingen en modellen',
      interp: (jar, n, kind) => `${jar}: aantal soorten deeltjes: ${n}, dus het is ${kind}.`,
      refCompared: 'Elk model werd vergeleken met een referentiemodel.',
      verdict: (row, word) => `${row}: ${word}.`,
      score: n => `Score: ${n} / 5 controles geslaagd.`
    }
  },

  glossary: {
    bokaal: 'bocal', bokalen: 'bocaux', gesloten: 'fermé(s)', etiket: 'étiquette', labotafel: 'paillasse', 'blote oog': 'œil nu',
    vertrouwen: 'faire confiance', denkbeeldige: 'imaginaire', preparaat: 'lame', preparaten: 'lames',
    heldere: 'transparente', lagen: 'couches', laag: 'couche', vloeistof: 'liquide', 'zuivere stof': 'corps pur', 'zuivere stoffen': 'corps purs',
    mengsel: 'mélange', 'homogeen mengsel': 'mélange homogène', 'heterogeen mengsel': 'mélange hétérogène',
    molecuulmodel: 'modèle moléculaire', 'wetenschappelijk model': 'modèle scientifique', werkelijkheid: 'réalité',
    kleurensleutel: 'clé des couleurs', deeltje: 'particule', deeltjes: 'particules', zoutdeeltjes: 'particules de sel',
    watermoleculen: 'molécules d’eau', stikstofmoleculen: 'molécules d’azote', zuurstofmoleculen: 'molécules d’oxygène',
    oliemoleculen: 'molécules d’huile', koolstofdioxidemoleculen: 'molécules de dioxyde de carbone', koolstofdioxide: 'dioxyde de carbone',
    stikstof: 'azote', zuurstof: 'oxygène', olie: 'huile', zout: 'sel', 'zout water': 'eau salée', 'bruisend water': 'eau gazeuse',
    'zuiver water': 'eau pure', 'zuivere zuurstof': 'oxygène pur', lucht: 'air', tekening: 'dessin', tekeningen: 'dessins',
    verspreid: 'répartis', stilstaan: 'restent immobiles', 'uit elkaar te houden': 'distinguer', klasgenoot: 'camarade de classe', klopt: 'est correct', 'in het echt': 'en réalité',
    'vereenvoudigde voorstelling': 'représentation simplifiée', drijven: 'flottent', opgelost: 'dissous', gelijkmatig: 'de façon uniforme',
    piepkleine: 'minuscules', belletjes: 'bulles', bewegen: 'bougent', fles: 'bouteille'
  },

  // Étape Check : pourquoi.
  explanations: {
    particles: 'De microscoop gaf je de soorten en de aantallen deeltjes. De kleurensleutel geeft de kleur van elke soort.',
    arrange: {
      pure: 'Een zuivere stof heeft maar één soort deeltjes: ze mogen overal op het preparaat staan.',
      homo: 'In een homogeen mengsel zijn de verschillende deeltjes gelijkmatig gemengd: ze zijn verspreid over het hele preparaat, niet in een aparte groep.',
      hetero: 'Olie en water mengen niet: de oliedeeltjes drijven bovenaan, de watermoleculen blijven onderaan. Daarom zien we met het blote oog twee lagen.'
    },
    samples: {
      water: 'Zuiver water: maar één soort deeltjes, watermoleculen. Het is een zuivere stof.',
      oxygen: 'Zuivere zuurstof: maar één soort deeltjes, zuurstofmoleculen. Het is een zuivere stof.',
      air: 'Lucht: hier twee soorten deeltjes, stikstofmoleculen en zuurstofmoleculen, gelijkmatig gemengd. We zien maar één fase: het is een homogeen mengsel.',
      salty: 'Zout water: watermoleculen en zoutdeeltjes. Het zout is er nog, in piepkleine stukjes, verspreid in het water. We zien maar één fase: het is een homogeen mengsel.',
      sparkling: 'Bruisend water in een gesloten fles: watermoleculen en koolstofdioxidemoleculen, opgelost in het water. Het ziet er helder uit, zonder belletjes, maar het is niet zuiver: het is een homogeen mengsel.',
      oilwater: 'Water en olie: twee soorten deeltjes in twee lagen. We zien twee fasen: het is een heterogeen mengsel.'
    },
    limits: {
      colour: 'Niet waar: echte moleculen zijn niet blauw of rood. De kleuren zijn een code die we gekozen hebben.',
      size: 'Niet waar: echte moleculen zijn veel te klein om te zien, en we tekenen ze allemaal als cirkels van dezelfde grootte.',
      move: 'Niet waar: in het echt bewegen deeltjes voortdurend. Onze tekening staat stil, zoals een foto.',
      types: 'Waar: een goed model toont de soorten deeltjes die er echt zijn.'
    },
    model: 'Een wetenschappelijk model is een vereenvoudigde voorstelling van de werkelijkheid. Het helpt ons om te begrijpen en uit te leggen wat we niet kunnen zien.'
  },

  check: {
    nothing: 'niets',
    particlesWrong: (jar, said, right) => `${jar}: je plaatste ${said}. De microscoop las ${right}.`,
    particlesGood: 'Je twee modellen hebben de juiste soorten en de juiste aantallen deeltjes. Goed geteld!',
    arrangeWrong: (jar, why) => `${jar}: kijk naar de schikking. ${why}`,
    arrangeGood: 'De schikking van je deeltjes is juist. Goed nagedacht!',
    noteRight: (jar, n, kind) => `${jar}: aantal soorten deeltjes: ${n}, dus het is ${kind}.`,
    notesGood: 'Je schrift is juist. Goed ingedeeld!',
    answerOk: 'Juist!',
    answerWrong: 'Niet helemaal. Het juiste antwoord:',
    yourHyps: 'Jouw hypotheses:',
    verdictOk: v => `Je hypothese en je resultaten ${v === 'confirmed' ? 'zeggen hetzelfde' : 'zeggen niet hetzelfde'}: je hypothese is dus inderdaad ${v === 'confirmed' ? 'bevestigd' : 'verworpen'}. Goed geoordeeld!`,
    verdictWrong: should => `Vergelijk je hypothese met je resultaten: ze ${should === 'confirmed' ? 'zeggen hetzelfde, dus je hypothese is bevestigd' : 'zeggen niet hetzelfde, dus je hypothese is verworpen'}.`,
    rejectedNote: 'Een verworpen hypothese is geen fout: zo gaat de wetenschap vooruit.'
  }
});
