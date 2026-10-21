/* ===== Labo virtuel « Keep the lights on » (phys1) : textes en néerlandais =====

   Simulation commune aux deux filières : js/lab-grid.js, chargée après ce
   fichier. Mêmes clés que l'anglais (en/year1/phys1/lab-grid.en.js).

   Chaque mot du lexique (glossary) est souligné partout où il apparaît,
   sauf dans les boutons (lab-engine.js) ; [mot] ou [mot|clé] reste utile
   pour une forme dont la clé diffère.

   Termes repris du chapitre NL (vocabulary, practice, interactive) :
   energiebron, hernieuwbaar / niet-hernieuwbaar, windpark, zonnepanelen,
   kerncentrale, gascentrale, stroompanne, energieopslag, opgeslagen,
   aardgas, steenkool, eerlijke test. Dans une subordonnée (« dat … »,
   « omdat … »), le verbe va à la fin : les phrases à trous en tiennent
   compte (« … België niet de hele dag elektriciteit kunnen geven » : can / cannot
   valent « wel » / « niet »). */

LabEngine.addText('grid', {
  labels: {
    title: 'Hou de lichten aan',

    // « a, b en c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' en ' + names[names.length - 1] : names[0] || '',

    plants: {
      wind: { name: 'Windpark', the: 'het windpark', short: 'Windpark' },
      solar: { name: 'Zonnepanelen', the: 'de zonnepanelen', short: 'Zonnepanelen' },
      nuclear: { name: 'Kerncentrale', the: 'de kerncentrale', short: 'Kerncentrale' },
      gas: { name: 'Gascentrale', the: 'de gascentrale', short: 'Gascentrale' },
      coo: { name: 'Pompcentrale van Coo', the: 'de pompcentrale van Coo', short: 'Coo' }
    },
    city: 'Stad',
    resources: { wind: 'wind', sun: 'zon', uranium: 'uranium', gas: 'aardgas', coal: 'steenkool', water: 'water' },
    forms: {
      chemical: 'chemische energie', mechanical: 'mechanische energie', thermal: 'thermische energie',
      electrical: 'elektrische energie', light: 'lichtenergie', nuclear: 'kernenergie'
    },
    renewable: { yes: 'hernieuwbaar', no: 'niet-hernieuwbaar' },
    periods: { morning: '\'s ochtends', afternoon: '\'s namiddags', evening: '\'s avonds', night: '\'s nachts' },
    periodsShort: { morning: 'ochtend', afternoon: 'namiddag', evening: 'avond', night: 'nacht' },
    yes: 'ja',
    no: 'nee',
    unitsWord: 'eenheden',
    hour: h => `${h} u`,

    questions: {
      q1: 'Kunnen wind en zon alleen België de hele dag elektriciteit geven?',
      q2: {
        night: 'Hoe kan België \'s nachts zonder wind elektriciteit hebben?',
        follow: 'Welke installaties geven \'s avonds meer elektriciteit, als er meer nodig is?',
        coo: 'Waarvoor dient de pompcentrale van Coo?'
      }
    },
    yourQuestions: 'Jouw onderzoeksvragen',
    intro: 'België heeft dag en nacht elektriciteit nodig. In de controlekamer beslis jij welke centrales werken tijdens één dag. Is er op een moment niet genoeg elektriciteit: stroompanne!',
    hypothesisTitle: 'Jouw hypotheses',
    hyp1: b => `Ik denk dat België met alleen wind en zon een stroompanne zal hebben: ${b}.`,
    when: { never: 'nooit', night: 'alleen \'s nachts', both: 'overdag en \'s nachts' },
    hyp2: {
      night: 'Ik denk dat België \'s nachts zonder wind deze installaties kan gebruiken:',
      follow: 'Ik denk dat deze installaties \'s avonds meer elektriciteit geven, als er meer nodig is:',
      coo: (a, b) => `Ik denk dat Coo water omhoog pompt als België ${a} elektriciteit heeft, en het water laat vallen als België ${b} elektriciteit heeft.`
    },
    cooWhen: { much: 'te veel', little: 'te weinig' },
    cooRowA: 'Coo pompt water omhoog bij:',
    cooRowB: 'Het water valt naar beneden bij:',
    hyp2Hint: 'Kies er één of meer.',
    can: 'wel',
    cannot: 'niet',
    because: 'Waarom denk je dat? (niet verplicht)',
    becausePlaceholder: 'Omdat…',
    hypothesisReady: 'Je hypotheses zijn klaar.',
    hypothesisPending: 'Vul je twee hypotheses aan.',
    toCards: 'Verder: de centrales',

    tabs: { cards: 'De centrales', room: 'De controlekamer' },

    cardResource: 'Energiebron',
    cardRenewable: 'Hernieuwbaar?',
    cardChain: 'Energieketen',
    cardStored: 'Opgeslagen energie (water hoog boven)',
    noTurbine: 'Geen turbine!',
    choose: '— kies —',
    objects: { boiler: 'stoomketel', reactor: 'reactor', turbine: 'turbine', generator: 'generator', panel: 'zonnepaneel' },
    cooNote: 'Coo heeft geen energiebron: het gebruikt de elektriciteit van de andere centrales om water naar een hoog meer te pompen, waar de energie opgeslagen wordt. Later valt het water naar beneden.',
    slotLabel: (what, plant) => `${what}, ${plant}`,
    captionCards: 'Vul de identiteitskaart van elke centrale aan: kies in de lijsten. Daarna gaat de controlekamer open.',
    captionCardsDone: 'Alle identiteitskaarten zijn volledig. Verder: de controlekamer!',
    lockRoom: n => `Vul eerst de identiteitskaarten aan: nog ${n === 1 ? '1 leeg vak' : n + ' lege vakken'}.`,

    test: n => `Test ${n}`,
    testTitle: { 1: 'Test 1: alleen wind en zon', 2: 'Test 2: jouw keuze van centrales' },
    on: 'AAN',
    off: 'UIT',
    faster: 'Sneller',
    runDay: 'Start de dag',
    runAgain: 'Opnieuw afspelen',
    pillTest1: 'Test 1 · wind + zon',
    test2Goal: 'Test 2 · doel: geen stroompanne',
    hoursShort: n => `${n} u`,
    tryTitle: (n, plant) => `Test 2, poging ${n}: + ${plant}`,
    tapHint: 'Tik op een kolom voor de details',
    cooStores: 'slaat op',
    cooGives: 'geeft terug',
    zoom: title => `${title}: groot tonen`,
    today: 'Vandaag',
    forecastShort: (season, sky, wind) => {
      const day = { autumn: 'Herfst', winter: 'Winter' };
      const skies = { sunny: 'de hele dag zon', grey: 'grijze lucht', morning: "wolken 's ochtends", afternoon: "wolken 's namiddags" };
      const winds = { storm: 'storm', morning: "sterke wind 's ochtends", afternoon: "sterke wind 's namiddags", light: 'zwakke wind' };
      return `${day[season]} · ${skies[sky]} · ${winds[wind]} · windstille avond en nacht`;
    },
    forecast: (season, sky, wind) => {
      const day = { autumn: 'Een herfstdag', winter: 'Een winterdag' };
      const skies = { sunny: 'de hele dag zon', grey: 'de hele dag wolken', morning: 'wolken in de ochtend', afternoon: 'wolken in de namiddag' };
      const winds = { storm: 'storm overdag', morning: 'sterke wind in de ochtend', afternoon: 'sterke wind in de namiddag', light: 'zwakke wind overdag' };
      return `${day[season]}: ${skies[sky]}, ${winds[wind]}, en geen wind 's avonds en 's nachts.`;
    },
    graphTitle: 'Elektriciteit in België tijdens één dag',
    axisY: 'Energie (eenheden)',
    axisX: 'Tijd (u)',
    legend: { nuclear: 'kern', wind: 'wind', solar: 'zon', gas: 'gas', coo: 'Coo', need: 'nodig', missing: 'tekort', stored: 'opgeslagen in Coo' },
    blackoutSign: 'STROOMPANNE',
    weather: { sun: 'zon', clouds: 'wolken', dark: 'donker', calm: 'geen wind', light: 'zwakke wind', strong: 'sterke wind' },
    sceneLabel: 'België tijdens één dag: de centrales, het weer en de stad',
    hourButton: h => `${h} u: toon de details`,
    hourDetail: (t, weather, parts, need, missing) => `${t}, ${weather}. Nodig: ${need} eenheden. Elektriciteit: ${parts || 'geen'}.` +
      (missing ? ` Tekort: ${missing} eenheden, stroompanne!` : ' Genoeg elektriciteit.'),
    part: (plant, v) => `${plant} ${v}`,
    storedPart: v => `Coo slaat ${v} eenheden op`,

    captionTest1: 'Test 1: alleen het windpark en de zonnepanelen werken. Start de dag en kijk naar de stad.',
    captionRunning: 'De dag loopt… Kijk naar de stad, het weer en de grafiek.',
    captionTest1Done: 'Test 1 is afgelopen. Tik op een uur van de grafiek om de details te zien. Noteer daarna je waarnemingen in je schrift.',
    captionTest2: 'Test 2: dezelfde dag, met hetzelfde weer. Zet telkens één centrale meer aan, tot er geen stroompanne meer is!',
    captionAddPlant: 'Zet nog één centrale aan (maar één) en start dan de dag.',
    captionTryReady: plant => `${plant}: staat aan. Start de dag!`,
    captionBlackout: when => `Stroompanne (${when})! Tel de rode kolommen van de grafiek en noteer de uren stroompanne in je schrift. Zet daarna nog één centrale aan.`,
    captionSuccess: 'De hele dag geen stroompanne. Goed gedaan! Tik op de uren van de grafiek en noteer daarna je waarnemingen in je schrift.',
    captionTest2Done: 'Test 2 is klaar: je dag zonder stroompanne is bewaard. Tik op een uur van de grafiek om de details te zien.',
    lockTest1Plant: 'Test 1: alleen het windpark en de zonnepanelen werken.',
    lockRunning: 'De dag loopt. Wacht tot het einde.',
    lockTest2Done: 'Test 2 is klaar: je dag zonder stroompanne is bewaard.',
    lockRun1First: 'Start eerst test 1.',
    lockRunFirst: 'Start eerst de dag.',
    lockAlreadyOn: 'Staat al aan: blijft aan bij de volgende pogingen.',
    lockPickPlant: 'Zet eerst nog één centrale aan.',
    lockHoursFirst: 'Tel eerst de uren stroompanne van de laatste dag en noteer ze in je schrift.',
    lockSuccessFirst: 'Start eerst een dag zonder stroompanne (test 2).',

    notebookTitle: 'Jouw schrift',
    hoursTitle: 'Uren stroompanne',
    hoursHint: 'Tel de rode kolommen van de grafiek.',
    hoursAria: day => `Uren stroompanne, ${day}`,
    hourUnit: 'u',
    n1Nothing: 'Wanneer gaven wind en zon helemaal geen elektriciteit?',
    n1NothingHint: 'Kies er één of meer.',
    darkCalm: 'Donker en windstil: de uren met de maan en zonder wind.',
    n2Head: 'Installatie',
    n2Dark: 'Elektriciteit als het donker en windstil was?',
    n2Same: 'De hele dag dezelfde hoeveelheid?',
    choiceLabel: (row, q, v) => `${row}, ${q}: ${v}`,

    toRoom: 'Verder: de controlekamer',
    toConclude: 'Verder: besluiten',
    lockCards: n => `Vul de identiteitskaarten aan: nog ${n === 1 ? '1 leeg vak' : n + ' lege vakken'}.`,
    lockTests: 'Start test 1, noteer je waarnemingen en start dan een dag zonder stroompanne (test 2).',
    lockNotes: n => `Vul je schrift aan: nog ${n === 1 ? '1 antwoord' : n + ' antwoorden'}.`,
    runInfo: (c, ct, n, nt) => `Kaarten: ${c} / ${ct} · Schrift: ${n} / ${nt}`,
    lockHypothesis: 'Vul eerst je twee hypotheses aan.',
    lockHypothesisFixed: 'Je hypotheses liggen vast: het experiment is begonnen. Een wetenschapper verandert de hypothese niet na het zien van de resultaten!',

    resultsTitle: 'Jouw resultaten',
    concl1a: b => `Mijn resultaten tonen dat België met alleen wind en zon een stroompanne had: ${b}.`,
    concl1: (b, c) => `Dus kunnen wind en zon alleen België ${b} de hele dag elektriciteit geven, omdat ze 's nachts zonder wind ${c} geven.`,
    q1why: { none: 'geen elektriciteit', little: 'een beetje elektriciteit', lot: 'veel elektriciteit' },
    concl2: {
      night: 'Mijn resultaten tonen dat België \'s nachts zonder wind deze installaties kan gebruiken:',
      follow: 'Mijn resultaten tonen dat deze installaties \'s avonds meer elektriciteit geven, als er meer nodig is:',
      coo: (a, b) => `Mijn resultaten tonen dat Coo water omhoog pompt als België ${a} elektriciteit heeft, en het water laat vallen als België ${b} elektriciteit heeft.`
    },
    concl2b: b => `Coo geeft de energie terug die het overdag ${b} heeft.`,
    stored: { stored: 'opgeslagen', made: 'gemaakt', destroyed: 'vernietigd' },
    qVerdict: n => `Dus mijn hypothese ${n} is`,
    confirmed: 'bevestigd',
    rejected: 'verworpen',
    checkConclusions: 'Mijn besluiten controleren',
    backToLab: 'Terug naar het labo',

    scoreLabel: 'controles geslaagd',
    markCorrect: 'juist',
    markIncorrect: 'fout',
    criteria: { plants: 'Centrales', chains: 'Energieketens', notes: 'Waarnemingen', answers: 'Besluiten', verdicts: 'Hypotheses' },
    criteriaSub: { plants: 'Energiebronnen', chains: 'Jouw kaarten', notes: 'Jouw schrift', answers: 'Jouw antwoorden', verdicts: 'Jouw oordeel' },
    factsTitle: 'Identiteitskaarten: de feiten',
    factsHead: { plant: 'Installatie', resource: 'Energiebron', renewable: 'Hernieuwbaar?', weather: 'Heeft het weer nodig?', dark: 'Donker en windstil?', same: 'De hele dag hetzelfde?' },
    factsStorage: 'opslag',

    report: {
      title: 'Laboratoriumverslag — Hou de lichten aan',
      because: 'Omdat',
      materials: day => `Een model van het elektriciteitsnet van België: een windpark, zonnepanelen, een kerncentrale, een gascentrale en de pompcentrale van Coo. ${day}`,
      procedure: [
        'Vul de identiteitskaart van elke centrale aan: energiebron, hernieuwbaar of niet, energievorm bij het begin.',
        'Test 1: laat de dag lopen met alleen het windpark en de zonnepanelen. Kijk naar de stad en de grafiek.',
        'Test 2: laat dezelfde dag opnieuw lopen (hetzelfde weer: eerlijke test), met telkens één centrale meer, tot er geen stroompanne meer is.',
        'Noteer je waarnemingen in het schrift.'
      ],
      cardsCaption: 'Identiteitskaarten',
      notes1Caption: 'Schrift: test 1',
      notes2Caption: 'Schrift: test 2',
      triesCaption: 'Uren stroompanne (test 1, daarna één centrale meer bij elke poging van test 2)',
      triesHead: { try: 'Poging', added: 'Toegevoegde centrale', hours: 'Uren stroompanne' },
      graphCaption: n => `Test ${n}`,
      graphTitle: 'Elektriciteit in België tijdens één dag',
      test1: (hours, when) => `Test 1 (alleen wind en zon): ${hours} uur stroompanne. Wind en zon gaven geen elektriciteit ${when}.`,
      test2: (tries, plants) => `Test 2: een dag zonder stroompanne na ${tries === 1 ? '1 poging' : tries + ' pogingen'}, met ${plants}.`,
      dark: list => `Toen het donker en windstil was, kwam de elektriciteit van: ${list}.`,
      verdict: (n, word) => `Mijn hypothese ${n} is ${word}.`,
      score: n => `Score: ${n} / 5 controles geslaagd.`
    }
  },

  glossary: {
    stroompanne: 'panne d’électricité générale', windpark: 'parc éolien', zonnepanelen: 'panneaux solaires',
    zonnepaneel: 'panneau solaire', kerncentrale: 'centrale nucléaire', gascentrale: 'centrale au gaz',
    pompcentrale: 'centrale de pompage', aardgas: 'gaz naturel', steenkool: 'charbon',
    'niet-hernieuwbaar': 'non renouvelable', hernieuwbaar: 'renouvelable', energiebron: 'ressource d’énergie',
    energiebronnen: 'ressources d’énergie', opgeslagen: 'stocké(e)', opslag: 'stockage', windstil: 'sans vent',
    donker: 'il fait noir', 'de hele dag': 'toute la journée', hoeveelheid: 'quantité', nodig: 'nécessaire (il faut)',
    tekort: 'manque', genoeg: 'assez', 'eerlijke test': 'expérience équitable', verloren: 'perdue',
    buurlanden: 'pays voisins', controlekamer: 'salle de contrôle', overdag: 'pendant la journée', schrift: 'cahier'
  },

  explanations: {
    wind: 'Een windpark heeft wind nodig: als er geen wind is, geeft het geen elektriciteit.',
    solar: 'Zonnepanelen hebben het licht van de zon nodig: \'s nachts geven ze geen elektriciteit. Met wolken geven ze minder.',
    nuclear: 'Een kerncentrale werkt dag en nacht, altijd met dezelfde hoeveelheid. Ze hangt niet af van het weer.',
    gas: 'Een gascentrale kan snel aan- en uitgezet worden: ze volgt wat nodig is, meer \'s avonds, minder \'s middags. Ze hangt niet af van het weer.',
    coo: 'Als er meer elektriciteit is dan nodig, pompt Coo water naar een hoog meer: de energie wordt opgeslagen als mechanische energie. Als er elektriciteit tekort is, valt het water naar beneden door turbines: Coo geeft elektrische energie terug.',
    losses: 'Coo geeft maar ongeveer 3 eenheden terug voor elke 4 eenheden die nodig waren om het water op te pompen: de rest is verloren energie (thermische energie in het water en de machines).',
    noTurbine: 'Zonnepanelen hebben geen turbine: ze zetten lichtenergie rechtstreeks om in elektrische energie.',
    other: 'In dit model zijn er vijf installaties. In het echt heeft België ook andere centrales (biomassa, kleine waterkrachtcentrales), en het koopt elektriciteit in de buurlanden als het er niet genoeg heeft.',
    facts: 'Dit zijn feiten: je kunt ze controleren met de grafiek. Welke centrale de beste is, is een waardeoordeel: niet iedereen is het daarover eens.'
  },

  check: {
    nothing: 'niets',
    cardWrongRes: (plant, said, right) => `${plant}: jij schreef “${said}”. De energiebron is ${right}.`,
    cardWrongRen: (plant, said, right) => `${plant}: jij schreef “${said}”. Het juiste antwoord: ${right}.`,
    cardsAllGood: 'Al je energiebronnen en al je antwoorden “hernieuwbaar of niet” zijn juist. Goed gedaan!',
    chainWrong: (plant, said, right) => `${plant}: jij schreef “${said}”. De energie bij het begin is ${right}.`,
    chainsAllGood: 'Al je energieketens beginnen met de juiste energievorm. Goed gedaan!',
    chainWhy: {
      wind: 'Wind is bewegende lucht: mechanische energie.',
      solar: 'De zon geeft licht: lichtenergie.',
      nuclear: 'Uranium heeft kernenergie.',
      gas: 'Aardgas verbrandt: het heeft chemische energie.',
      coo: 'Het water hoog boven heeft mechanische energie (door zijn hoogte).'
    },
    notesScore: (good, total) => `${good} / ${total} waarnemingen komen overeen met wat er gebeurde.`,
    notesAllGood: 'Je schrift komt overeen met wat er in de controlekamer gebeurde. Goed waargenomen!',
    hoursWrong: (day, said, right) => `${day}: jij schreef ${said} uur stroompanne, maar de grafiek heeft ${right} rode kolommen.`,
    nothingWrong: (said, right) => `Test 1: jij koos ${said}. Wind en zon gaven helemaal geen elektriciteit ${right}: kijk naar de lege kolommen van de grafiek.`,
    plantWrong: (plant, q, said, right) => `${plant}, “${q}”: jij schreef “${said}”, maar het antwoord is “${right}”.`,
    answerOk: 'Juist!',
    answerWrong: 'Niet helemaal. Het juiste antwoord:',
    verdictOk: v => `Je hypothese en je besluit ${v === 'confirmed' ? 'zeggen hetzelfde' : 'zeggen niet hetzelfde'}: je hypothese is dus inderdaad ${v === 'confirmed' ? 'bevestigd' : 'verworpen'}. Goed geoordeeld!`,
    verdictWrong: should => `Vergelijk je hypothese met je besluit: ze ${should === 'confirmed' ? 'zeggen hetzelfde, dus je hypothese is bevestigd' : 'zeggen niet hetzelfde, dus je hypothese is verworpen'}.`,
    rejectedNote: 'Een verworpen hypothese is geen fout: zo gaat de wetenschap vooruit.',
    yourHyp: n => `Jouw hypothese ${n}:`,
    yourConcl: n => `Jouw besluit ${n}:`
  }
});
