/* ===== Labo virtuel « Zoom in » (chem2) : textes en néerlandais =====

   Simulation commune aux deux filières : js/lab-zoom.js, chargée après ce
   fichier. Mêmes clés que l'anglais (en/year1/chem2/lab-zoom.en.js).

   Chaque mot du lexique (glossary) est souligné partout où il apparaît,
   sauf dans les boutons (lab-engine.js) ; [mot] ou [mot|clé] reste utile
   pour une forme dont la clé diffère.

   Mots du chapitre NL (practice.json, interactive.json) : zuivere stof,
   homogeen / heterogeen mengsel, molecule, deeltje, molecuulmodel,
   preparaat (lame), kleurensleutel, stikstof, zuurstof, koolstofdioxide,
   oplossing, oplosmiddel, opgeloste stof, opgelost, suikerwater, zand.
   « Preparation » se dit « bereiding » : « preparaat » est la lame. Les noms
   des préparations commencent toujours une phrase : ils portent leur
   majuscule. */

LabEngine.addText('zoom', {
  labels: {
    title: 'Zoom in',

    // « a, b en c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' en ' + names[names.length - 1] : names[0] || '',
    // « 8 watermoleculen » (many : le nom au singulier ou au pluriel, selon n)
    countOf: (n, many) => `${n} ${many}`,

    bigQuestion: 'Wat krijgen we als we stoffen mengen?',
    subQuestion: name => `${name}: wat krijgen we?`,
    yourQuestion: 'Jouw vraag',
    intro: 'Op je labotafel: flessen met zuivere stoffen. Je maakt twee bereidingen en bekijkt ze met het blote oog. Daarna zoomt een denkbeeldige microscoop zo ver in dat we de deeltjes kunnen zien.',
    hypothesisTitle: 'Jouw hypotheses',
    prepName: k => `Bereiding ${k}`,
    preps: {
      hotcold: 'Warm water + koud water',
      ice: 'Water + ijsblokjes',
      sugars: 'Suikerklontjes + kristalsuiker',
      salty: 'Water + zout',
      sweet: 'Water + suiker',
      sparkling: 'Water + koolstofdioxide (gesloten fles)',
      soda: 'Water + suiker + koolstofdioxide (gesloten fles)',
      air: 'Stikstof + zuurstof',
      heliox: 'Helium + zuurstof',
      oilwater: 'Water + olie',
      sandwater: 'Water + zand',
      oilsalt: 'Water + zout + olie'
    },
    ingredients: {
      water: 'water', hotWater: 'warm water', coldWater: 'koud water', ice: 'ijsblokjes',
      sugarCubes: 'suikerklontjes', grains: 'kristalsuiker', sugar: 'suiker', salt: 'zout', oil: 'olie', sand: 'zand',
      co2: 'koolstofdioxide', nitrogen: 'stikstof', oxygen: 'zuurstof', helium: 'helium'
    },
    hypWill: 'Ik denk dat we dit krijgen:',
    hypText: (name, word) => `${name}: ik denk dat we ${word} krijgen.`,
    kinds: { pure: 'een zuivere stof', homo: 'een homogeen mengsel', hetero: 'een heterogeen mengsel' },
    kindChip: { pure: 'Zuivere stof', homo: 'Homogeen mengsel', hetero: 'Heterogeen mengsel' },
    because: 'Waarom denk je dat? (niet verplicht)',
    becausePlaceholder: 'Omdat…',
    hypothesisReady: 'Je hypotheses zijn klaar.',
    hypothesisPending: 'Vul je twee hypotheses in.',
    toBench: 'Volgende: de labotafel',
    lockHypothesis: 'Vul eerst je twee hypotheses in.',
    lockHypothesisFixed: 'Je hypotheses liggen vast: het onderzoek is begonnen. Een wetenschapper verandert zijn hypothese niet nadat hij de resultaten gezien heeft!',

    // La paillasse
    mixBtn: { stir: 'Roeren', shake: 'Sluiten en schudden' },
    seenQ: 'Wat zie je met het blote oog?',
    seen: { same: 'Het ziet er overal hetzelfde uit', parts: 'Ik zie verschillende delen' },
    // Dans une phrase (Check, rapport)
    seenNote: { same: 'het ziet er overal hetzelfde uit', parts: 'we zien verschillende delen' },
    zoomBtn: 'Inzoomen met de microscoop',
    lockPoured: 'Dit zit al in je bereiding.',
    lockMixed: 'Je bereiding is klaar: er moet niets meer bij.',
    lockPourAll: 'Giet eerst alle ingrediënten erbij.',
    lockMixFirst: 'Meng eerst je bereiding.',
    lockSeenFirst: 'Noteer eerst wat je met het blote oog ziet.',
    lockSeenFixed: 'Je waarneming ligt vast: je hebt ingezoomd.',
    captionPour: 'Tik op elk ingrediënt om het erbij te gieten.',
    captionMix: 'Meng nu je bereiding.',
    captionSeen: 'Bekijk je bereiding: wat zie je met het blote oog?',
    captionZoom: 'Zoom in met de microscoop.',

    // Le microscope et la lame
    slideTitle: k => `Jouw model: bereiding ${k}`,
    slideAria: 'Het preparaat onder de microscoop: jouw molecuulmodel',
    sideEmpty: 'Giet, meng en kijk met het blote oog. Zoom daarna in: de microscoop toont wat erin zit.',
    readingTitle: 'De microscoop leest',
    keyTitle: 'Kleurensleutel',
    particles: {
      water: { name: 'Watermolecule', one: 'watermolecule', many: 'watermoleculen' },
      salt: { name: 'Zoutdeeltje', one: 'zoutdeeltje', many: 'zoutdeeltjes' },
      sugar: { name: 'Suikermolecule', one: 'suikermolecule', many: 'suikermoleculen' },
      oil: { name: 'Oliemolecule', one: 'oliemolecule', many: 'oliemoleculen' },
      sand: { name: 'Zanddeeltje', one: 'zanddeeltje', many: 'zanddeeltjes' },
      nitrogen: { name: 'Stikstofmolecule', one: 'stikstofmolecule', many: 'stikstofmoleculen' },
      oxygen: { name: 'Zuurstofmolecule', one: 'zuurstofmolecule', many: 'zuurstofmoleculen' },
      helium: { name: 'Heliumdeeltje', one: 'heliumdeeltje', many: 'heliumdeeltjes' },
      co2: { name: 'Koolstofdioxidemolecule', one: 'koolstofdioxidemolecule', many: 'koolstofdioxidemoleculen' }
    },
    // Deux formes d'une même substance
    forms: {
      hot: 'moleculen warm water',
      cold: 'moleculen koud water',
      liquid: 'moleculen vloeibaar water',
      ice: 'moleculen ijs',
      cubes: 'suikermoleculen uit de suikerklontjes',
      grains: 'suikermoleculen uit de kristalsuiker'
    },
    onSlide: 'Op je preparaat:',
    captionColour: 'Tik eerst op een kleur in de kleurensleutel.',
    captionPlace: 'Tik op het preparaat om een deeltje van deze kleur toe te voegen.',
    captionMove: 'Tik op het preparaat om een deeltje toe te voegen. Sleep een deeltje om het te verplaatsen. Tik op een deeltje om het weg te halen.',
    captionFull: 'Het preparaat is vol: haal eerst een deeltje weg.',
    captionCompared: 'Je model ligt vast. Vergelijk de twee preparaten en vul dan je schrift in.',
    compareBtn: 'Vergelijken met het referentiemodel',
    compareTitle: 'Je model vergelijken?',
    compareText: 'Daarna kun je je model van deze bereiding niet meer veranderen.',
    compareYes: 'Ja, vergelijken',
    refTitle: 'Referentiemodel',
    refAria: k => `Referentiemodel: bereiding ${k}`,
    refNote: 'Dit referentiemodel is ook een tekening, geen foto.',
    lockNoZoom: 'Zoom eerst in met de microscoop.',
    lockEmpty: 'Bouw eerst je model op het preparaat.',
    lockModelFixed: 'Je model ligt vast: je hebt het vergeleken. Wil je het opnieuw proberen, begin het labo dan opnieuw.',
    lockNote: k => `Vergelijk eerst je model van bereiding ${k}.`,
    lockPure: 'Een zuivere stof is geen mengsel: hier valt niets te kiezen.',
    lockKindFirst: 'Kies eerst: zuivere stof of mengsel?',
    lockLiquid: 'Oplosmiddel en opgeloste stof: alleen voor een vloeistof.',
    lockPureSolution: 'Een zuivere stof is geen oplossing: hier valt niets te kiezen.',
    lockSolventFirst: 'Kies eerst het oplosmiddel.',
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
    solventHead: 'Oplosmiddel',
    soluteHead: 'Opgeloste stof',
    noSolute: 'er is niets opgelost',
    noteKinds: { pure: 'zuivere stof', mixture: 'mengsel' },
    mixWords: { homo: 'homogeen', hetero: 'heterogeen' },
    choose: '— kies —',

    // Étape 3
    resultsTitle: 'Jouw resultaten',
    yourModel: 'Jouw model',
    recapTypes: n => `Soorten deeltjes: ${n}`,
    answer: (name, kind, n) => `${name} geeft ${kind}: het aantal soorten deeltjes is ${n}.`,
    kindAria: 'Wat we krijgen',
    verdictRow: k => `Hypothese over bereiding ${k}`,
    ruleIntro: 'Het hangt af van de deeltjes. Vul de regel aan:',
    rule: {
      pure: w => `In een zuivere stof zijn de deeltjes ${w}.`,
      homo: w => `In een homogeen mengsel zijn de deeltjes ${w}.`,
      hetero: w => `In een heterogeen mengsel zijn de deeltjes ${w}.`
    },
    ruleWords: {
      one: 'allemaal van dezelfde soort',
      spread: 'van verschillende soorten, verspreid tussen elkaar',
      apart: 'van verschillende soorten, apart: in lagen of op de bodem'
    },
    ruleAria: 'De deeltjes',
    confirmed: 'bevestigd',
    rejected: 'verworpen',
    checkConclusions: 'Mijn besluiten controleren',
    backToLab: 'Terug naar het labo',

    // Étape 4
    scoreLabel: 'controles geslaagd',
    markCorrect: 'juist',
    markIncorrect: 'fout',
    criteria: { particles: 'Deeltjes', arrangement: 'Schikking', notebook: 'Schrift', preparations: 'Je bereidingen', rule: 'De regel' },
    criteriaSub: {
      particles: 'De soorten en de aantallen',
      arrangement: 'Verspreid, bovenaan of op de bodem',
      notebook: 'Wat je zag en noteerde',
      preparations: 'Je antwoorden en je oordeel',
      rule: 'Wat de deeltjes doen'
    },

    report: {
      title: 'Laboverslag — Zoom in',
      because: 'Omdat',
      materials: 'Flessen met zuivere stoffen en recipiënten. Een denkbeeldige microscoop. Preparaten en een kleurensleutel.',
      procedure: [
        'Giet de ingrediënten van een bereiding in het recipiënt en meng.',
        'Bekijk de bereiding met het blote oog.',
        'Zoom in met de denkbeeldige microscoop en lees wat hij toont.',
        'Bouw een molecuulmodel op het preparaat, met de kleurensleutel.',
        'Vergelijk het model met het referentiemodel.',
        'Schrijf in het schrift: het aantal soorten deeltjes, het soort materie, het oplosmiddel en de opgeloste stof.'
      ],
      lookHead: 'Met het blote oog',
      modelsCaption: 'Waarnemingen en modellen',
      refCompared: 'Elk model werd vergeleken met een referentiemodel.',
      verdict: (row, word) => `${row}: ${word}.`,
      score: n => `Score: ${n} / 5 controles geslaagd.`
    }
  },

  glossary: {
    labotafel: 'paillasse', flessen: 'bouteilles', fles: 'bouteille', 'gesloten fles': 'bouteille fermée', 'blote oog': 'œil nu',
    denkbeeldige: 'imaginaire', bereiding: 'préparation', bereidingen: 'préparations', gieten: 'verser',
    preparaat: 'lame', preparaten: 'lames',
    'zuivere stof': 'corps pur', 'zuivere stoffen': 'corps purs', mengsel: 'mélange', mengen: 'mélanger',
    'homogeen mengsel': 'mélange homogène', 'heterogeen mengsel': 'mélange hétérogène',
    kleurensleutel: 'clé des couleurs', deeltje: 'particule', deeltjes: 'particules',
    oplossing: 'solution', oplosmiddel: 'solvant', 'opgeloste stof': 'soluté', 'opgeloste stoffen': 'solutés', opgelost: 'dissous',
    'lost op': 'se dissout', 'lost niet op': 'ne se dissout pas',
    'warm water': 'eau chaude', 'koud water': 'eau froide', 'vloeibaar water': 'eau liquide', ijsblokjes: 'glaçons', ijs: 'glace',
    suikerklontjes: 'sucre en morceaux', kristalsuiker: 'sucre cristallisé', suiker: 'sucre', zout: 'sel', olie: 'huile', zand: 'sable',
    stikstof: 'azote', zuurstof: 'oxygène', 
    watermoleculen: 'molécules d’eau', suikermoleculen: 'molécules de sucre', zoutdeeltjes: 'particules de sel',
    oliemoleculen: 'molécules d’huile', zanddeeltjes: 'particules de sable', stikstofmoleculen: 'molécules d’azote',
    zuurstofmoleculen: 'molécules d’oxygène', 
    'overal hetzelfde': 'partout pareil', 'verschillende delen': 'différentes parties', verspreid: 'répartis',
    gelijkmatig: 'de façon uniforme', lagen: 'couches', laag: 'couche', 'op de bodem': 'au fond', bovenaan: 'en haut',
    drijft: 'flotte', drijven: 'flottent', zakt: 'coule', 'netjes geordend': 'rangées en ordre', belletjes: 'bulles',
    duikers: 'plongeurs', ademen: 'respirent', tekening: 'dessin', 'bewegen minder': 'bougent moins', waarneming: 'observation'
  },

  // Étape Check : pourquoi.
  explanations: {
    particles: 'De microscoop gaf je de soorten en de aantallen deeltjes. De kleurensleutel geeft één kleur voor elke soort deeltjes.',
    model: 'Onthoud: een molecuulmodel is een tekening. De kleuren zijn een code die we gekozen hebben, en echte deeltjes bewegen voortdurend.',
    arrange: {
      pure: 'Een zuivere stof heeft maar één soort deeltjes: ze mogen overal op het preparaat staan.',
      homo: 'In een homogeen mengsel zijn de verschillende deeltjes gelijkmatig gemengd: ze zijn verspreid over het hele preparaat, niet in een aparte groep.',
      top: 'Olie lost niet op in water: de oliedeeltjes drijven bovenaan, het water blijft onderaan. Een opgeloste stof blijft verspreid in het water.',
      bottom: 'Zand lost niet op in water: de zanddeeltjes zakken naar de bodem, het water blijft erboven.'
    },
    // Préparations qui donnent un corps pur : pourquoi une seule couleur.
    same: {
      hotcold: 'Warm water en koud water bestaan uit dezelfde watermoleculen: één kleur voor alle 10.',
      ice: 'Ook ijs bestaat uit watermoleculen: één kleur voor alle 10.',
      sugars: 'Suikerklontjes en kristalsuiker bestaan uit dezelfde suikermoleculen: één kleur voor alle 10.'
    },
    preps: {
      hotcold: 'Warm water en koud water: alleen watermoleculen. Warm of koud, het is dezelfde soort deeltjes: het is een zuivere stof.',
      ice: 'Water en ijsblokjes: alleen watermoleculen. IJs is water: in het ijs staan dezelfde moleculen netjes geordend en bewegen minder. We zien verschillende delen, maar het is een zuivere stof.',
      sugars: 'Suikerklontjes en kristalsuiker: alleen suikermoleculen. De stukjes zijn niet even groot, maar het is dezelfde soort deeltjes: het is een zuivere stof.',
      salty: 'Water en zout: watermoleculen en zoutdeeltjes. Het zout is opgelost: het is er nog, verspreid in het water. Het is een oplossing, een homogeen mengsel. Oplosmiddel: water; opgeloste stof: zout.',
      sweet: 'Water en suiker: watermoleculen en suikermoleculen. De suiker is opgelost: hij is er nog, verspreid in het water. Het is een oplossing, een homogeen mengsel. Oplosmiddel: water; opgeloste stof: suiker.',
      sparkling: 'Water en koolstofdioxide in een gesloten fles: de koolstofdioxide is opgelost in het water. Het ziet er helder uit, zonder belletjes, maar het is een oplossing, een homogeen mengsel. Oplosmiddel: water; opgeloste stof: koolstofdioxide.',
      soda: 'Water, suiker en koolstofdioxide: drie soorten deeltjes, allemaal verspreid. Het is een oplossing, een homogeen mengsel. Oplosmiddel: water; opgeloste stoffen: suiker en koolstofdioxide.',
      air: 'Stikstof en zuurstof: twee soorten deeltjes, gelijkmatig gemengd. Het is een homogeen mengsel: de lucht die we ademen is zo.',
      heliox: 'Helium en zuurstof: helium is heel licht, maar in een gesloten kolf mengen de twee gassen gelijkmatig. Het is een homogeen mengsel. Duikers ademen het om heel diep te gaan.',
      oilwater: 'Water en olie: olie lost niet op in water. Twee soorten deeltjes in twee lagen: het is een heterogeen mengsel. Er is niets opgelost.',
      sandwater: 'Water en zand: zand lost niet op, het zakt naar de bodem. Twee soorten deeltjes, apart: het is een heterogeen mengsel. Er is niets opgelost.',
      oilsalt: 'Water, zout en olie: het zout lost op in het water, de olie drijft bovenaan. Het is een heterogeen mengsel. De onderste laag is een oplossing: oplosmiddel water, opgeloste stof zout.'
    },
    rule: 'Eén soort deeltjes: een zuivere stof, ook als we verschillende delen zien. Meerdere soorten: een mengsel. Verspreid tussen elkaar: homogeen. Apart, in lagen of op de bodem: heterogeen.'
  },

  check: {
    nothing: 'niets',
    particlesWrong: (name, said, right) => `${name}: je plaatste ${said}. De microscoop las ${right}.`,
    particlesGood: 'Je twee modellen hebben de juiste soorten en de juiste aantallen deeltjes. Goed geteld!',
    arrangeWrong: (name, why) => `${name}: kijk naar de schikking. ${why}`,
    arrangeGood: 'De schikking van je deeltjes is juist. Goed nagedacht!',
    noteRight: (name, seen, n, kind, solution) => `${name}: ${seen}; aantal soorten deeltjes: ${n}, dus het is ${kind}${solution ? `; ${solution}` : ''}.`,
    solution: (solvent, solutes) => `oplosmiddel: ${solvent}, opgeloste stof: ${solutes}`,
    notesGood: 'Je schrift is juist. Goed waargenomen en goed ingedeeld!',
    answerOk: 'Juist!',
    answerWrong: 'Niet helemaal. Het juiste antwoord:',
    yourHyps: 'Jouw hypotheses:',
    verdictOk: v => `Je hypothese en je resultaten ${v === 'confirmed' ? 'zeggen hetzelfde' : 'zeggen niet hetzelfde'}: je hypothese is dus inderdaad ${v === 'confirmed' ? 'bevestigd' : 'verworpen'}. Goed geoordeeld!`,
    verdictWrong: should => `Vergelijk je hypothese met je resultaten: ze ${should === 'confirmed' ? 'zeggen hetzelfde, dus je hypothese is bevestigd' : 'zeggen niet hetzelfde, dus je hypothese is verworpen'}.`,
    rejectedNote: 'Een verworpen hypothese is geen fout: zo gaat de wetenschap vooruit.',
    ruleGood: 'Je regel is juist. Goed uitgelegd!'
  }
});
