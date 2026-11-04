/* ===== Labo virtuel « Down the drain » (chem2) : textes en néerlandais =====

   Simulation commune aux deux filières : js/lab-drain.js, chargée après ce
   fichier. Mêmes clés que l'anglais (en/year1/chem2/lab-drain.en.js).

   Chaque mot du lexique (glossary) est souligné partout où il apparaît,
   sauf dans les boutons et les zones à toucher (lab-engine.js) ; [mot] ou
   [mot|clé] reste utile pour une forme dont la clé diffère.

   Mots du chapitre NL (vocabulary.json, practice.json, interactive.json) :
   scheidingstechnieken, zeven, filtratie, decanteren, verdamping, opgelost,
   waterzuiveringsstation, rooster ; néerlandais de Belgique. Station anonyme
   (pas de nom d'entreprise réelle). */

LabEngine.addText('drain', {
  labels: {
    title: 'Door het putje',

    // « a, b en c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' en ' + names[names.length - 1] : names[0] || '',
    num: v => Number(v).toLocaleString('nl-BE'),
    money: v => `€ ${Number(v).toLocaleString('nl-BE')}`,
    energy: v => `${v} MWh`,

    bigQuestion: 'Waar komt alles terecht wat we door het putje spoelen?',
    subQuestions: [
      'Waar komt elk ding terecht: bij een onderdeel van het station, of in de rivier?',
      'Het stadje kan één verbetering betalen: welke beschermt de rivier het best?'
    ],
    yourQuestion: 'Je onderzoeksvraag',
    todayTitle: 'Vandaag in het stadje',
    intro: 'Je bent operator in het waterzuiveringsstation van een klein Belgisch stadje. Alles wat in de gootstenen en de toiletten van het stadje verdwijnt, komt hier aan.',
    weather: { dry: 'Droge dag', rain: 'Regenachtige dag', storm: 'Onweer' },

    // Page d'accueil (mission) : des gestes, jamais des résultats.
    briefTitle: 'Opdracht: volg het water, bescherm de rivier',
    briefTask: 'Vandaag spoelt het stadje vier dingen door het putje. Jouw taak: volg ze door het station, en zoek hoe je de rivier het best beschermt.',
    briefSteps: [
      'Bekijk de vier dingen van vandaag. <strong>Zet</strong> elk ding waar het volgens jou terechtkomt, en <strong>kies</strong> de verbetering die volgens jou de rivier het best beschermt.',
      '<strong>Open</strong> de klep en bekijk de dag in het station. <strong>Neem stalen</strong> met de staalbeker, <strong>vul</strong> je logboek <strong>in</strong> en <strong>test</strong> daarna enkele verbeteringen.',
      '<strong>Beantwoord</strong> de twee vragen met wat je in het station gezien hebt, en <strong>zeg</strong> of je hypotheses juist waren.'
    ],
    volume: v => `Water dat vandaag aankomt: ${v} m³`,
    today: (weather, v) => `${weather}. Water dat vandaag aankomt: ${v} m³.`,

    places: { grid: 'Rooster', grit: 'Zand- en vetvanger', bio: 'Bacteriëntank', settle: 'Bezinktank', river: 'Rivier' },
    placesIn: { grid: 'bij het rooster', grit: 'in de zand- en vetvanger', bio: 'in de bacteriëntank', settle: 'in de bezinktank', river: 'in de rivier' },
    items: {
      wipes: { name: 'Vochtige doekjes', short: 'Doekjes' },
      buds: { name: 'Wattenstaafjes', short: 'Wattenstaafjes' },
      sand: { name: 'Zand van het groenten wassen', short: 'Zand' },
      litter: { name: 'Kattengrit', short: 'Kattengrit' },
      oil: { name: 'Frituurolie', short: 'Olie' },
      coffee: { name: 'Koffiedik', short: 'Koffiedik' },
      fibres: { name: 'Vezels van een fleecetrui (wasmachine)', short: 'Vezels' },
      glitter: { name: 'Glitter', short: 'Glitter' },
      lemonade: { name: 'Limonade', short: 'Limonade' },
      milk: { name: 'Oude melk', short: 'Melk' },
      salt: { name: 'Zout pastawater', short: 'Zout' },
      medicine: { name: 'Oude medicijnen', short: 'Medicijnen' }
    },
    amounts: { 1: 'een beetje', 2: 'wat', 3: 'veel' },

    // Étape 1
    trayTitle: 'Vandaag door het putje',
    trayHint: 'Neem elk ding en zet het waar het volgens jou terechtkomt: bij een onderdeel op het plan, of in de rivier.',
    trayDone: 'Alles staat op zijn plaats. Je kunt een ding nog verplaatsen.',
    choiceTitle: 'Je hypothese over de verbetering',
    choiceHint: budget => `Het stadje heeft ${budget} per jaar voor één verbetering. Welke zal de rivier het best beschermen?`,
    because: 'Waarom denk je dat? (niet verplicht)',
    becausePlaceholder: 'Omdat…',
    hypothesisReady: 'Je hypotheses zijn klaar.',
    hypothesisPending: 'Zet de vier dingen op hun plaats en kies een verbetering.',
    lockHypothesis: 'Zet eerst de vier dingen op hun plaats en kies een verbetering.',
    lockHypothesisFixed: 'Je hypotheses liggen vast: de dag is begonnen. Een wetenschapper verandert zijn hypothese niet nadat hij de resultaten gezien heeft!',
    toStation: 'Volgende: het station',

    upgrades: {
      fineGrid: { name: 'Fijner rooster', what: 'De staven van het rooster staan dichter bij elkaar.', note: 'Het raakt vaker verstopt: de arbeiders moeten vaker harken.' },
      longTank: { name: 'Tweede bezinktank', what: 'Het water blijft twee keer zo lang in rustig water.', note: 'Een nieuwe tank bouwen kost veel.' },
      sandFilter: { name: 'Zandfilter', what: 'Na de bezinktank gaat het water door een dikke laag zand.', note: 'Pompen duwen het water door het zand: ze verbruiken energie.' },
      stormTank: { name: 'Regenwaterbuffer', what: 'Een groot bekken houdt het extra regenwater bij en stuurt het daarna langzaam naar het station.', note: 'Een groot bekken kost veel. Het loopt alleen vol op dagen met onweer.' },
      campaign: { name: 'Campagne in het stadje', what: 'Affiches en brieven: alleen plas, poep en wc-papier in het toilet; oude medicijnen terug naar de apotheek; frituurolie naar het containerpark.', note: 'Het werkt alleen als de mensen meedoen: ongeveer de helft doet het.' },
      evaporation: { name: 'Verdampingsbekken', what: 'Al het water wordt verwarmd tot het verdampt: al de rest blijft achter.', note: 'De rivier krijgt helemaal geen water meer. Het vraagt meer dan 20 keer de elektriciteit van alle huizen van het stadje.' },
      none: { name: 'Geen verbetering' }
    },

    // Étape 2 : la station
    views: { station: 'Het station', tests: 'Verbeteringen' },
    valveBtn: 'De klep openen',
    continueBtn: 'De dag verderzetten',
    rakeBtn: 'Het rooster harken',
    cupBtn: 'Staalbeker',
    dayDone: 'De dag is voorbij.',
    captionValve: 'Open de klep: het water van het stadje komt binnen. Een hele dag gaat voorbij in een paar seconden.',
    // La journée, heure par heure (moments : voir PHASES dans lab-drain.js)
    captionPhases: {
      night: 'Nacht: het stadje slaapt, er komt heel weinig water aan. Houd het rooster in het oog!',
      morning: 'Ochtend: het stadje wordt wakker. Douchen, toiletten, ontbijt: veel meer water!',
      daytime: 'Overdag: een gelijkmatige stroom water uit het stadje.',
      evening: 'Avond: koken, afwassen, wasmachines. Weer meer water!',
      late: 'Late avond: het stadje gaat slapen, er komt steeds minder water.'
    },
    captionArrive: name => `${name}: door het putje! Het is onderweg naar het station.`,
    captionStorm: 'Het onweer barst los! Het station kan niet al het water aan: een deel gaat via de overstort rechtstreeks naar de rivier.',
    captionClogged: 'Het rooster is verstopt: het water stijgt ervoor. Hark het rooster!',
    captionPaused: 'De dag staat stil: zet de dag verder.',
    captionSample: 'De dag is voorbij. Neem de staalbeker en raak dan een onderdeel of de rivier aan: neem op elke plaats een staal.',
    captionHold: 'Raak een onderdeel of de rivier aan om er een staal te nemen.',
    captionAnalyse: 'Wat opgelost is, kun je niet zien: stuur het staal van de rivier naar het labo.',
    captionLog: 'Vul je logboek van de operator in: voor elke plaats wat je gevonden hebt, en de techniek van elk onderdeel.',
    captionToTests: 'Je logboek is volledig. Open nu “Verbeteringen” en test er een paar.',
    captionTestsFirst: 'Test een verbetering: dezelfde dag loopt opnieuw, met die verbetering.',
    captionTests: 'Test andere verbeteringen en vergelijk. Raak de naam van een rij aan om ze op het plan te zien.',
    captionTested: name => `Dezelfde dag, met deze verbetering: ${name}. Bekijk de nieuwe rij.`,

    sampleEmpty: 'Neem de staalbeker en raak dan een onderdeel of de rivier aan.',
    sampleWait: 'Laat eerst de dag voorbijgaan. Neem dan stalen.',
    sampleTitle: place => `Staal: ${place}`,
    invisibleNote: 'Wat opgelost is, kun je niet zien. Stuur het staal naar het labo van het station.',
    analyseBtn: 'Naar het labo sturen',
    analysisTitle: 'Labo: opgelost in het rivierwater',
    analysisNothing: 'Niets van de lijst van vandaag is opgelost in dit water.',
    analytes: { lemonade: 'Suiker', milk: 'Melk (vet en eiwitten)', salt: 'Zout', medicine: 'Medicijnen' },
    levels: { lot: 'veel', some: 'wat', traces: 'sporen', none: 'niets' },

    logTitle: 'Je logboek van de operator',
    placeHead: 'Plaats',
    nothingHead: 'Niets',
    nothingShort: 'Niets',
    techHead: 'Techniek',
    tickAria: (place, item) => `${place}: ${item}`,
    logHint: 'Vink aan wat je in elk staal gevonden hebt. Gebruik voor de rivier wat je ziet en de resultaten van het labo.',
    techs: { sifting: 'Zeven', decantation: 'Decanteren', filtration: 'Filtratie', evaporation: 'Verdamping', none: 'Geen scheiding' },

    upsTitle: 'Verbeteringen om te testen',
    budgetLine: budget => `Budget van het stadje: ${budget} per jaar, voor één verbetering.`,
    testBtn: 'Testen',
    resultsCaption: 'Resultaten van de tests',
    upHead: 'Verbetering',
    pollutionHead: 'Vervuiling die de rivier bereikt',
    costHead: 'Kosten per jaar',
    energyHead: 'Extra energie per jaar',
    pollutionHint: 'Vervuilingsindex: wat de rivier bereikt, geteld volgens hoe schadelijk het is voor de vissen. Hoe lager, hoe beter.',
    baseRow: 'Het station van vandaag',
    riverClean: 'niets',
    overBudget: 'boven het budget',
    baseStormNote: 'Een deel van het water ging via de overstort.',

    lockTests: 'Vul eerst je logboek van de operator in, met de resultaten van het labo.',
    lockRake: 'Het rooster is niet verstopt: nu valt er niets te harken.',
    lockCupDay: 'Laat eerst de dag voorbijgaan: open de klep.',
    lockSampleFirst: place => `Neem hier eerst een staal: ${place}.`,
    lockAnalyseFirst: 'Stuur eerst het staal van de rivier naar het labo.',
    lockDay: 'Nog niet klaar: laat eerst de dag voorbijgaan.',
    missingSamples: n => (n === 1 ? 'nog 1 staal te nemen' : `nog ${n} stalen te nemen`),
    missingAnalysis: 'de analyse van het labo',
    missingRows: n => (n === 1 ? '1 lijn ontbreekt in je logboek' : `${n} lijnen ontbreken in je logboek`),
    missingTests: n => (n === 1 ? 'nog 1 verbetering te testen' : `nog ${n} verbeteringen te testen`),
    notFinished: list => `Nog niet klaar: ${list}.`,
    runInfo: (samples, rows, tests) => `Stalen: ${samples} / 5 · Logboek: ${rows} / 5 · Tests: ${tests}`,
    backToPredict: 'Hypotheses',
    toConclude: 'Volgende: besluiten',

    // Étape 3
    resultsTitle: 'Je resultaten',
    placeAnswer: (name, place, reason) => `${name}: ${place} — ${reason}.`,
    reasonAria: 'Waarom',
    reasons: {
      big: 'te groot om tussen de staven door te gaan',
      thin: 'lang en dun: glipt tussen de staven door',
      sinks: 'zwaarder dan water: zinkt naar de bodem',
      floats: 'lichter dan water: drijft bovenop',
      fine: 'piepkleine stukjes die heel langzaam zinken',
      eaten: 'voedsel dat in het water zit: de bacteriën eten het op',
      dissolved: 'opgelost: niets in het station kan het tegenhouden',
      overflow: 'gaat via de overstort rechtstreeks naar de rivier'
    },
    choiceLead: choice => `De verbetering die ik kies: ${choice}.`,
    choiceAria: 'De verbetering',
    choiceAnswer: (name, item, why) => `${name} houdt ${item} uit de rivier. De reden: ${why}.`,
    itemAria: 'Welk ding',
    howAnswer: how => `Ze werkt door ${how}.`,
    howAria: 'Hoe ze werkt',
    hows: {
      sifting: 'zeven', decantation: 'decanteren', filtration: 'filtratie', evaporation: 'verdamping',
      storing: 'het extra regenwater bij te houden', keepingOut: 'het uit het putje te houden'
    },
    priceAnswer: price => `De prijs die we betalen: ${price}.`,
    priceAria: 'De prijs die we betalen',
    prices: { work: 'meer werk voor de arbeiders', money: 'veel geld', energy: 'veel energie', people: 'het werkt alleen als de mensen meedoen' },
    noneAnswer: why => `Waarom? ${why}.`,
    noneAria: 'Waarom',
    noneWhy: { clean: 'Vandaag bereikt niets schadelijks de rivier', nothingHelps: 'Geen enkele verbetering binnen het budget maakt de rivier schoner' },
    verdicts: { confirmed: 'bevestigd', partly: 'deels bevestigd', rejected: 'verworpen' },
    verdictPlace: 'Hypothese: waar de dingen terechtkomen',
    verdictChoice: 'Hypothese: de verbetering',
    hypPlace: (name, place) => `${name}: ${place}.`,
    hypChoice: name => `De verbetering die de rivier het best zal beschermen: ${name}.`,
    nothingFound: 'niets van de lijst van vandaag',
    notTested: 'niet getest',
    checkConclusions: 'Mijn besluiten controleren',
    backToLab: 'Terug naar het station',
    choose: '— kies —',

    // Étape 4
    scoreLabel: 'controles geslaagd',
    markCorrect: 'juist',
    markIncorrect: 'fout',
    criteria: { samples: 'Stalen', techniques: 'Technieken', places: 'Waar het terechtkomt', choice: 'De verbetering', conclusion: 'Je hypotheses' },
    criteriaSub: {
      samples: 'Wat je op elke plaats gevonden hebt',
      techniques: 'De techniek van elk onderdeel',
      places: 'De plaats en de reden',
      choice: 'Je keuze en je redenen',
      conclusion: 'Je oordeel'
    },

    report: {
      title: 'Laboverslag — Door het putje',
      because: 'Omdat',
      materials: 'Een model van een waterzuiveringsstation: rooster, zand- en vetvanger, bacteriëntank, bezinktank. Een staalbeker en een loep. Het labo van het station. Zes verbeteringen om te testen.',
      procedure: [
        'Zet elk ding waar het volgens jou terechtkomt, en kies een verbetering (hypotheses).',
        'Open de klep en laat een dag voorbijgaan; hark het rooster als het verstopt is.',
        'Neem een staal bij elk onderdeel en in de rivier, en bekijk het met de loep.',
        'Stuur het staal van de rivier naar het labo.',
        'Schrijf in het logboek van de operator wat je op elke plaats gevonden hebt, en de techniek van elk onderdeel.',
        'Test minstens twee verbeteringen: vergelijk de vervuiling die de rivier bereikt, de kosten en de energie.'
      ],
      items: 'Vandaag door het putje',
      foundHead: 'Wat ik gevonden heb',
      analysis: 'Analyse van het rivierwater door het labo',
      verdict: (row, word) => `${row}: ${word}.`,
      score: n => `Score: ${n} / 5 controles geslaagd.`
    }
  },

  glossary: {
    slaapt: 'dort', 'wordt wakker': 'se réveille', ontbijt: 'petit-déjeuner', gelijkmatige: 'régulier', koken: 'cuisiner',
    afwassen: 'faire la vaisselle', 'gaat slapen': 'va dormir', onderweg: 'en route', 'barst los': 'éclate', 'steeds minder': 'de moins en moins',
    terechtkomt: 'finit', terechtkomen: 'finissent', terecht: 'finit (komt … terecht)', olie: 'huile', zand: 'sable',
    'per jaar': 'par an', beschermt: 'protège', beschermen: 'protéger', 'niet verplicht': 'facultatif',
    waterzuiveringsstation: 'station d’épuration', 'door het putje': 'à l’égout', putje: 'égout', gootstenen: 'éviers', 
    rooster: 'grille', staven: 'barreaux', 'zand- en vetvanger': 'dessableur-déshuileur', vet: 'graisse',
    bacteriëntank: 'bassin à bactéries', bezinktank: 'décanteur', slib: 'boues', rivierwater: 'eau de la rivière',
    overstort: 'déversoir d’orage', onweer: 'orage', regenachtige: 'pluvieuse', regenwater: 'eau de pluie', 'droge dag': 'jour sec',
    stadje: 'petite ville', onderdeel: 'poste', verbetering: 'amélioration', verbeteringen: 'améliorations',
    'vochtige doekjes': 'lingettes', doekjes: 'lingettes', wattenstaafjes: 'cotons-tiges', 'groenten wassen': 'laver les légumes',
    kattengrit: 'litière pour chat', frituurolie: 'huile de friture', koffiedik: 'marc de café', vezels: 'fibres', fleecetrui: 'pull polaire',
    wasmachine: 'machine à laver', 'oude melk': 'vieux lait', melk: 'lait', 'zout pastawater': 'eau salée des pâtes', zout: 'sel',
    suiker: 'sucre', eiwitten: 'protéines', apotheek: 'pharmacie',
    containerpark: 'parc à conteneurs', 'plas, poep en wc-papier': 'pipi, caca et papier toilette',
    klep: 'vanne', harken: 'racler', hark: 'racle', staalbeker: 'gobelet de prélèvement', loep: 'loupe',
    zeven: 'tamisage', zandfilter: 'filtre à sable', regenwaterbuffer: 'bassin d’orage',
    verdampingsbekken: 'bassin d’évaporation', bekken: 'bassin', 'tweede bezinktank': 'deuxième décanteur', 'fijner rooster': 'grille plus fine',
    arbeiders: 'ouvriers', 'de prijs die we betalen': 'le prix à payer',
    opgelost: 'dissous', 'zwaarder dan water': 'plus lourd que l’eau', 'lichter dan water': 'plus léger que l’eau',
    zinkt: 'coule', zinken: 'coulent', bodem: 'fond', drijft: 'flotte', bovenop: 'au-dessus',
    'piepkleine stukjes': 'minuscules morceaux', langzaam: 'lentement', glipt: 'glisse', 'lang en dun': 'long et fin',
    'te groot': 'trop gros', schadelijk: 'nocif', schadelijks: 'de nocif', schaadt: 'nuit à', vissen: 'poissons',
    afgeschraapt: 'raclée', riolen: 'égouts', verstopt: 'bouché', tegenhouden: 'retenir', tegenhoudt: 'retient',
    'in het oog': 'surveille (à l’œil)', 'vink aan': 'coche', logboek: 'journal',
    helder: 'limpide', troebel: 'trouble', 'in elkaar verstrengeld': 'emmêlées', stof: 'tissu', staafjes: 'bâtonnets',
    knarsen: 'crissent', klei: 'argile', vettig: 'gras', laag: 'couche', ruikt: 'sent', zoet: 'sucré', 
    strepen: 'traînées', vlokjes: 'flocons', kruimels: 'miettes', draadjes: 'fils', puntjes: 'petits points', schitteren: 'brillent',
    glimmende: 'brillants', belletjes: 'bulles', ingang: 'entrée', uitgang: 'sortie', 'uit elkaar vallen': 'se défont', kleeft: 'colle',
    rechtstreeks: 'directement', verwarmd: 'chauffée', verdampt: 's’évapore', 'loopt vol': 'se remplit',
    'twee keer zo lang': 'deux fois plus longtemps', 'dichter bij elkaar': 'plus serrés', rustig: 'calme', schaal: 'échelle',
    zuurstof: 'oxygène', stijgt: 'monte'
  },

  /* Ce que montre un prélèvement (décrit, jamais interprété). base : ce
     qu'on voit toujours à cet endroit ; puis une ligne par chose trouvée. */
  looks: {
    base: {
      grid: { all: 'Wat de staven tegenhouden: bladeren, takjes en papier.' },
      grit: { all: 'Een staal van de bodem van de tank, een van bovenaan.' },
      bio: { all: 'Bruin water vol kleine vlokjes: dat zijn bacteriën. Overal luchtbelletjes.' },
      settle: { all: 'Van de bodem van de tank: bruin slib.' },
      river: { dry: 'Helder water.', rain: 'Helder water.', storm: 'Troebel bruin water.' }
    },
    grid: {
      wipes: 'Zachte witte lapjes stof, helemaal in elkaar verstrengeld.',
      buds: 'Een paar dunne witte plastic staafjes met watten aan de uiteinden.'
    },
    grit: {
      sand: 'Bodem: grijsbruine korrels die knarsen tussen de vingers.',
      litter: 'Bodem: kleine grijze bolletjes klei.',
      oil: 'Bovenaan: een dikke gele laag, vettig om aan te raken.',
      nothing: 'Bodem en bovenkant: niets bijzonders.'
    },
    bio: {
      lemonade: 'Aan de ingang van de tank ruikt het water zoet, naar citroen. Aan de uitgang: geen zoete geur meer.',
      milk: 'Aan de ingang van de tank: witte troebele strepen in het water. Aan de uitgang: geen witte strepen meer.',
      nothing: 'Aan de ingang en aan de uitgang van de tank ziet en ruikt het water hetzelfde.'
    },
    settle: {
      coffee: 'Donkerbruine kruimels in het slib.',
      fibres: 'Met de loep: piepkleine gekleurde draadjes in het slib.',
      glitter: 'Piepkleine glimmende puntjes die schitteren in het slib.'
    },
    river: {
      wipes: 'Stukken zachte witte stof.',
      buds: 'Dunne witte plastic staafjes die op het water drijven.',
      sand: 'Grijsbruine korrels op de bodem van de beker.',
      litter: 'Kleine grijze bolletjes klei op de bodem van de beker.',
      oil: 'Vettige gele druppels aan de oppervlakte.',
      coffee: 'Donkerbruine kruimels.',
      fibres: 'Met de loep: piepkleine gekleurde draadjes.',
      glitter: 'Piepkleine glimmende puntjes.'
    }
  },

  // Étape Check : pourquoi.
  explanations: {
    samples: 'Elk onderdeel houdt tegen wat zijn techniek kan scheiden. Wat geen enkel onderdeel tegenhoudt, bereikt de rivier, ook als het water helder lijkt.',
    storm: 'Vandaag was er onweer: een kwart van het water ging via de overstort, zonder zuivering. Van alles kwam een beetje in de rivier terecht.',
    posts: {
      grid: 'Zeven: de staven laten het water door en houden de grote stukken tegen.',
      grit: 'Decanteren: het water stroomt langzaam; zware korrels zinken naar de bodem, vet drijft bovenop en wordt afgeschraapt.',
      bio: 'Geen scheiding: bacteriën eten het voedsel dat in het water zit. Het verdwijnt: er wordt niets opgevangen.',
      settle: 'Decanteren: het water blijft lang in een rustige tank; piepkleine stukjes zinken langzaam en vormen het slib.'
    },
    items: {
      wipes: 'Vochtige doekjes vallen niet uit elkaar zoals wc-papier: ze blijven groot, en het rooster houdt ze tegen. Ze verstoppen het rooster en de pompen.',
      buds: 'Wattenstaafjes zijn lang en dun: de meeste glippen tussen de staven van het rooster door en gaan door het station tot in de rivier.',
      sand: 'Zand is zwaarder dan water: het zinkt naar de bodem van de zand- en vetvanger.',
      litter: 'Kattengrit bestaat uit zware korrels klei: het zinkt naar de bodem van de zand- en vetvanger.',
      oil: 'Frituurolie is lichter dan water: ze drijft bovenop in de zand- en vetvanger en wordt afgeschraapt. In de riolen kleeft ze aan de buizen.',
      coffee: 'Koffiedik bestaat uit piepkleine stukjes: ze zinken langzaam in de rustige bezinktank.',
      fibres: 'Een fleecetrui verliest piepkleine plastic vezels in de wasmachine. De meeste zinken langzaam in de bezinktank, maar een deel bereikt de rivier.',
      glitter: 'Glitter bestaat uit piepkleine stukjes plastic. Het meeste zinkt langzaam in de bezinktank, maar een deel bereikt de rivier.',
      lemonade: 'Limonade is water met opgeloste suiker: de bacteriën eten de suiker op.',
      milk: 'Melk is voedsel dat in het water zit: de bacteriën eten het op. In de rivier zou het de zuurstof van de vissen opnemen.',
      salt: 'Zout is opgelost: geen enkel onderdeel van het station kan het tegenhouden, dus het bereikt de rivier. In deze hoeveelheid is het niet schadelijk voor de vissen.',
      medicine: 'Medicijnen zijn opgelost: de bacteriën breken er maar een klein deel van af, en de rest bereikt de rivier, waar het de vissen schaadt. Oude medicijnen gaan terug naar de apotheek.'
    },
    choice: 'Een verbetering helpt alleen als ze tegenhoudt wat vandaag de rivier bereikt. Sommige dingen zijn opgelost: geen enkele machine van het station kan ze tegenhouden, maar de mensen kunnen ze uit het putje houden. Verdamping zou alles scheiden, maar op de schaal van een stadje vraagt ze veel te veel energie, en de rivier zou geen water meer krijgen.'
  },

  check: {
    samplesGood: 'Je logboek klopt met wat er in elk staal zat. Goed waargenomen!',
    sampleWrong: (place, right) => `${place}: bekijk je logboek nog eens. Hier vinden we: ${right}.`,
    techGood: 'Je hebt de techniek van elk onderdeel benoemd. Goed gedaan!',
    techWrong: (place, right) => `${place}: het juiste antwoord is “${right}”.`,
    placesGood: 'Je hebt gevonden waar elk ding terechtkomt, en waarom. Goed uitgelegd!',
    answerWrong: 'Niet helemaal. Het juiste antwoord:',
    best: list => `De beste verbetering vandaag: ${list}.`,
    bestNone: clean => (clean
      ? 'Vandaag bereikt niets schadelijks de rivier: er is geen verbetering nodig.'
      : 'Vandaag maakt geen enkele verbetering binnen het budget de rivier schoner.'),
    choiceWrong: 'Je keuze is niet de verbetering die de rivier vandaag het best beschermt, binnen het budget.',
    notTestedNote: 'Je hebt de verbetering die je kiest niet getest: een wetenschapper controleert voor hij kiest.',
    becauseWrong: detail => `Je redenen kloppen niet.${detail ? ` ${detail}` : ''}`,
    upgradeDoes: (name, items, how, price) => `${name} houdt vandaag ${items} uit de rivier; ze werkt door ${how}; de prijs die we betalen: ${price}.`,
    nothingToday: 'niets',
    choiceGood: 'De beste verbetering voor vandaag, getest, met de juiste redenen. Goed beargumenteerd!',
    verdictOk: word => `Inderdaad: ${word}. Goed geoordeeld!`,
    verdictWrong: word => `Vergelijk je hypothese met je resultaten: ze is ${word}.`,
    placedRight: (n, total) => `${n} van je ${total} dingen stonden op de juiste plaats.`,
    yourHyps: 'Jouw hypotheses:',
    rejectedNote: 'Een verworpen hypothese is geen fout: zo gaat de wetenschap vooruit.'
  }
});
