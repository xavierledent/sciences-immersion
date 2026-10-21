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
      q2: 'Hoe kan België \'s nachts zonder wind elektriciteit hebben?'
    },
    yourQuestions: 'Jouw onderzoeksvragen',
    intro: 'België heeft dag en nacht elektriciteit nodig. In de controlekamer beslis jij welke centrales werken tijdens één dag. Is er op een moment niet genoeg elektriciteit: stroompanne!',
    hypothesisTitle: 'Jouw hypotheses',
    hyp1: b => `Ik denk dat wind en zon alleen België ${b} de hele dag elektriciteit kunnen geven.`,
    hyp2: 'Ik denk dat België \'s nachts zonder wind deze installaties kan gebruiken:',
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
    chainTurbine: '→ turbine → generator → elektrische energie',
    chainSolar: '→ zonnepaneel → elektrische energie',
    noTurbine: 'Geen turbine!',
    chainCoo: 'Elektriciteit pompt water naar boven. Later valt het water naar beneden: → turbine → generator → elektrische energie',
    emptySlot: 'leeg',
    slotLabel: (what, plant) => `${what}, ${plant}`,
    bankResources: 'Energiebronnen',
    bankForms: 'Energievormen',
    captionCards: 'Vul de identiteitskaart van elke centrale aan: neem een woord en kies dan zijn plaats. Daarna gaat de controlekamer open.',
    captionWordPicked: word => `In je hand: ${word}. Kies een vak dat oplicht.`,
    captionPickWord: 'Neem eerst een woord en kies dan een vak.',
    captionCardsDone: 'Alle identiteitskaarten zijn volledig. Verder: de controlekamer!',
    lockRoom: n => `Vul eerst de identiteitskaarten aan: nog ${n === 1 ? '1 leeg vak' : n + ' lege vakken'}.`,

    test: n => `Test ${n}`,
    testTitle: { 1: 'Test 1: alleen wind en zon', 2: 'Test 2: jouw keuze van centrales' },
    on: 'AAN',
    off: 'UIT',
    run: n => `Start test ${n}`,
    faster: 'Sneller',
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
    captionTest2: 'Test 2: dezelfde dag, met hetzelfde weer. Zet de centrales aan die je nodig hebt en start de dag. Doel: geen stroompanne!',
    captionBlackout: (n, when) => `Stroompanne gedurende ${n === 1 ? '1 uur' : n + ' uur'} (${when}). Verander je centrales en start de dag opnieuw.`,
    captionSuccess: 'De hele dag geen stroompanne. Goed gedaan! Tik op de uren van de grafiek en noteer daarna je waarnemingen in je schrift.',
    captionTest2Done: 'Test 2 is klaar: je dag zonder stroompanne is bewaard. Tik op een uur van de grafiek om de details te zien.',
    lockTest1Plant: 'Test 1: alleen het windpark en de zonnepanelen werken.',
    lockRunning: 'De dag loopt. Wacht tot het einde.',
    lockTest2Done: 'Test 2 is klaar: je dag zonder stroompanne is bewaard.',
    lockNotes1: 'Noteer eerst je waarnemingen van test 1.',
    lockRun1First: 'Start eerst test 1.',
    lockSuccessFirst: 'Start eerst een dag zonder stroompanne (test 2).',
    lockShowTest2: 'Start eerst test 2.',

    notebookTitle: 'Jouw schrift',
    n1Blackout: 'Was er een stroompanne?',
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
    concl1: (b, c) => `Mijn resultaten tonen dat wind en zon alleen België ${b} de hele dag elektriciteit kunnen geven, omdat ze 's nachts zonder wind ${c} geven.`,
    q1why: { none: 'geen elektriciteit', little: 'een beetje elektriciteit', lot: 'veel elektriciteit' },
    concl2: 'Mijn resultaten tonen dat België \'s nachts zonder wind deze installaties kan gebruiken:',
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
      day: (season, clouds) => `Eén dag in de ${season === 'winter' ? 'winter' : 'herfst'}, ${clouds === 'none' ? 'de hele dag met zon' : clouds === 'morning' ? 'met wolken in de ochtend' : 'met wolken in de namiddag'}, en zonder wind 's avonds en 's nachts.`,
      procedure: [
        'Vul de identiteitskaart van elke centrale aan: energiebron, hernieuwbaar of niet, energievorm bij het begin.',
        'Test 1: laat de dag lopen met alleen het windpark en de zonnepanelen. Kijk naar de stad en de grafiek.',
        'Test 2: laat dezelfde dag lopen (hetzelfde weer: eerlijke test) met de centrales van jouw keuze, tot er geen stroompanne meer is.',
        'Noteer je waarnemingen in het schrift.'
      ],
      cardsCaption: 'Identiteitskaarten',
      notes1Caption: 'Schrift: test 1',
      notes2Caption: 'Schrift: test 2',
      graphCaption: n => `Test ${n}`,
      graphTitle: 'Elektriciteit in België tijdens één dag',
      test1: (blackout, when) => `Test 1 (alleen wind en zon): stroompanne: ${blackout}. Wind en zon gaven geen elektriciteit ${when}.`,
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
    blackoutWrong: said => `Test 1, stroompanne: jij schreef “${said}”. In test 1 werd de stad donker: er was een stroompanne.`,
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
