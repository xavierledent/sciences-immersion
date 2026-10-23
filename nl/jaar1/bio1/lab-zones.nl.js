/* ===== Labo virtuel « Inside two ecosystems » (bio1) : textes en néerlandais =====

   Simulation commune aux deux filières : js/lab-zones.js, chargée après ce
   fichier. Mêmes clés que l'anglais (en/year1/bio1/lab-zones.en.js), seul le
   lexique (glossary) a ses propres mots.

   [mot] ou [mot|clé] : mot du lexique, souligné, traduction française au
   survol ou au toucher (clé dans glossary, en minuscules). Termes repris du
   chapitre : abiotische et biotische factoren, levende wezens, temperatuur,
   vochtigheid, mossen, varens, schimmel.

   Les morceaux de phrase (phrase) sont des propositions principales : le
   rapport les introduit par deux-points (« Ik denk: zone A is warmer… »),
   une subordonnée (« dat ») renverrait le verbe à la fin. */

LabEngine.addText('zones', {
  labels: {
    title: 'Twee ecosystemen onder de loep',
    question: 'Hebben abiotische factoren (temperatuur, licht, vochtigheid) een invloed op biotische factoren (de levende wezens)?',
    question2: 'En hebben levende wezens ook een invloed op elkaar?',
    questionCase: 'Om dat te [weten te komen], vergelijk je twee zones die maar [50 m uit elkaar] liggen: je meet hun abiotische factoren en je telt hun levende wezens.',
    yourQuestion: 'Jouw onderzoeksvraag',
    zone: Z => `Zone ${Z}`,
    apart: '50 m',
    same: 'Allebei gelijk',
    // « a, b en c » ; « a en b »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' en ' + names[names.length - 1] : names[0] || '',
    pair: (a, b) => `${a} en ${b}`,

    // Valeur au dixième (température), avec le séparateur décimal de la langue.
    num: v => v.toFixed(1).replace('.', ','),

    hypothesisTitle: 'Jouw hypothese',
    hypGroups: { abiotic: 'Abiotische factoren · Ik denk:', biotic: 'Biotische factoren · Ik denk dat ik dit vind:', answer: 'Mijn antwoord op de vraag · Ik denk:' },
    hypRows: {
      warmer: 'de warmste zone is',
      brighter: 'de zone met het meeste licht is',
      humid: 'de vochtigste zone is',
      moss: 'meer [mossen] en [varens] in',
      bloom: 'meer [wilde bloemen] en [vliegende insecten] in',
      influence: 'abiotische factoren hebben een invloed op levende wezens:',
      each: 'levende wezens hebben een invloed op elkaar:'
    },
    yesNo: { yes: 'Ja', no: 'Nee' },
    because: 'Waarom denk je dat? (niet verplicht)',
    becausePlaceholder: 'Omdat…',
    hypothesisReady: 'Je hypothese is klaar.',
    hypothesisPending: 'Tik op elke regel een zone aan om je hypothese aan te vullen.',
    toExperiment: 'Verder: het terrein op',
    lockHypothesis: 'Vul eerst je hypothese aan: één keuze op elke regel.',
    lockHypothesisFixed: 'Je hypothese ligt vast: het terreinwerk is begonnen. Een wetenschapper verandert de hypothese niet na het zien van de resultaten!',

    habitats: {
      meadow: 'Zonnige [weide]',
      edge: '[Bosrand]',
      shade: '[Diepe schaduw] onder de bomen',
      pond: '[Oever van de vijver]'
    },

    tools: { thermo: 'Thermometer', lux: 'Luxmeter', hygro: 'Hygrometer', hand: 'Voel de bodem', quadrat: 'Telkader' },
    // L'instrument dans une phrase (« de … toonde »).
    instruments: { temp: 'thermometer', lux: 'luxmeter', air: 'hygrometer' },
    views: { field: 'Op het terrein', graph: 'Histogram' },
    sheetTitle: 'Terreinfiche',
    abioticHead: 'Abiotische factoren',
    factors: { temp: 'Temperatuur', lux: 'Lichtsterkte', air: 'Luchtvochtigheid', soil: 'Bodemvochtigheid', species: 'Aantal soorten' },
    units: { temp: '(°C)', lux: '(lux)', air: '(%)', soil: 'droog, vochtig of nat', species: 'uit je telblad' },
    soilWords: { dry: 'droog', moist: 'vochtig', wet: 'nat' },
    choose: 'Kies…',
    countTitle: 'Biotische factoren: telblad',
    countSub: 'individuen van elke soort',
    notFound: 'Nog niets gevonden',
    nSpecies: n => n === 1 ? '1 soort' : `${n} soorten`,
    countLabel: (name, Z) => `Aantal individuen: ${name}, zone ${Z}`,
    cellLabel: (Z, factor) => `Zone ${Z}, ${factor}`,
    infoField: (v, q) => `${v} / 8 metingen genoteerd · ${q} / 2 telkaders klaar`,
    toGraph: 'Verder: maak je histogram',
    toConclude: 'Verder: besluiten',
    backToZones: 'Terug naar de zones',
    quadratHead: Z => `Zone ${Z} · het [telkader] (1 m × 1 m) van bovenaf gezien`,
    tapToOpen: 'Tik: openen',
    unknown: 'een levend wezen',
    idEmpty: 'Tik op een [levend wezen] in het [telkader] om te weten wat het is.',
    idWhat: 'Wat is het?',
    idWrong: wrong => `Geen ${wrong}. Lees de beschrijvingen opnieuw en vergelijk met wat je ziet!`,
    idCount: 'Alle individuen van deze soort zijn [omcirkeld]. Tel ze en noteer het aantal in je telblad.',
    idNoted: n => `In je telblad: ${n}`,

    // La loupe et la fiche des interactions (dans le carré)
    tasksTitle: 'In elk telkader:',
    tasks: ['Determineer elke soort en tel ze.', 'Noteer elke interactie tussen levende wezens die je vindt.'],
    interHere: 'Kijk! Eén ervan heeft een [interactie] met een ander levend wezen.',
    lookCloser: 'Kijk van dichterbij',
    notedHere: 'Je hebt de interactie van dit levende wezen genoteerd.',
    openNoted: 'Mijn interactie bekijken',
    openClue: pair => `Interactie: ${pair}`,
    noteInter: 'Deze interactie noteren',
    interSheet: 'Mijn interacties',
    toComplete: 'nog aan te vullen',
    signLegend: '+ heeft voordeel · − heeft nadeel · 0 ondervindt geen invloed',
    signs: { '+': '+', '-': '−', '0': '0' },
    // Le signe dans une phrase (question 2, correction).
    signWords: { '+': 'heeft voordeel (+)', '-': 'heeft nadeel (−)', '0': 'ondervindt geen invloed (0)' },
    relationLabel: 'Relatie',
    relations: { predation: 'Predatie', parasitism: 'Parasitisme', mutualism: 'Mutualisme', commensalism: 'Commensalisme', competition: 'Competitie' },
    relationWords: { predation: 'predatie', parasitism: 'parasitisme', mutualism: 'mutualisme', commensalism: 'commensalisme', competition: 'competitie' },

    lockCell: {
      temp: Z => `Zet eerst de thermometer in zone ${Z}.`,
      lux: Z => `Zet eerst de luxmeter in zone ${Z}.`,
      air: Z => `Zet eerst de hygrometer in zone ${Z}.`,
      soil: Z => `Voel eerst met je hand aan de bodem van zone ${Z}.`
    },
    lockGraph: 'Tel eerst de levende wezens in beide telkaders.',
    missing: {
      temp: Z => `Meet de temperatuur van zone ${Z} en noteer ze op je terreinfiche.`,
      lux: Z => `Meet het licht in zone ${Z} en noteer het op je terreinfiche.`,
      air: Z => `Meet de luchtvochtigheid van zone ${Z} en noteer ze op je terreinfiche.`,
      soil: Z => `Voel aan de bodem van zone ${Z} en noteer of hij droog, vochtig of nat is.`,
      find: Z => `Open het telkader van zone ${Z} en zoek de levende wezens.`,
      count: (name, Z) => `Telblad, zone ${Z}: noteer het aantal voor “${name}”.`,
      bars: n => `Je histogram is niet af: nog ${n === 1 ? '1 staaf' : n + ' staven'} te tekenen.`,
      inter: 'Determineer de levende wezens in de telkaders: licht een interactie op, kijk dan van dichterbij en noteer ze.',
      interNote: pair => `Er wacht nog een interactie om genoteerd te worden: ${pair}. Kijk van dichterbij en noteer ze.`,
      interOpen: pair => `Je interacties, ${pair}: geef beide levende wezens een +, − of 0, en kies de relatie.`
    },

    caption: {
      start: 'Kies een meettoestel en tik dan op zone A of zone B (of sleep het toestel naar de zone).',
      noTool: 'Kies eerst een meettoestel en tik dan op een zone.',
      tool: {
        thermo: 'Tik op een zone om er een thermometer te zetten.',
        lux: 'Tik op een zone om het licht te meten met een [luxmeter].',
        hygro: 'Tik op een zone om de luchtvochtigheid te meten met een [hygrometer].',
        hand: 'Tik op een zone om de bodem met je hand te voelen.',
        quadrat: 'Tik op een zone om het [telkader] op de grond te leggen.'
      },
      measured: {
        thermo: Z => `De thermometer staat in zone ${Z}. Lees hem af en noteer de temperatuur op je terreinfiche.`,
        lux: Z => `De [luxmeter] meet het licht in zone ${Z}. Noteer de waarde op je terreinfiche.`,
        hygro: Z => `De [hygrometer] meet de luchtvochtigheid in zone ${Z}. Noteer de waarde op je terreinfiche.`
      },
      felt: Z => `Noteer nu op je terreinfiche of de bodem van zone ${Z} droog, vochtig of nat is.`,
      quadrat: 'Tik op een [levend wezen] om te weten wat het is. Tel dan alle [omcirkelde] exemplaren en noteer het aantal in je telblad. Sommige levende wezens hebben ook een [interactie]: licht er een op, kijk dan van dichterbij.',
      identify: 'Welke naam is juist? Kijk goed naar het levende wezen.',
      wrongName: 'Niet deze: lees de aanwijzing en kijk nog eens.',
      selected: name => `[${name.charAt(0).toUpperCase() + name.slice(1)}|${name}]: tel alle [omcirkelde] exemplaren en noteer het aantal in je telblad.`,
      quadratOpen: Z => `Zone ${Z}: tik op het [telkader] om het opnieuw te openen.`,
      interHere: 'Kijk! Eén ervan heeft een [interactie] met een ander levend wezen. Tik op „Kijk van dichterbij”.',
      found: 'Hier hebben twee levende wezens een [interactie]! Noteer ze in je fiche.',
      foundNoted: 'Deze interactie staat in je fiche: +, − of 0 voor elk levend wezen, en dan de relatie.',
      noted: 'Genoteerd! Geef nu elk levend wezen een +, − of 0, en kies de relatie.',
      fieldDone: 'Je terreinfiche en je telblad zijn volledig. Maak nu je histogram.',
      graph: 'Sleep elke staaf omhoog tot het aantal in je telblad, of tik op de juiste hoogte.',
      graphDone: 'Je histogram is klaar. Je kunt verder naar het besluit.',
      bad: {
        temp: 'Noteer de temperatuur die de thermometer toont, in °C (bijvoorbeeld 18,5).',
        lux: 'Noteer het getal dat de luxmeter toont, in lux (bijvoorbeeld 12400).',
        air: 'Noteer het getal dat de hygrometer toont, in % (bijvoorbeeld 65).',
        count: 'Noteer een geheel getal (bijvoorbeeld 6).'
      }
    },
    feel: {
      dry: 'De bodem is hard en stoffig. Hij [brokkelt] tussen je vingers, en je vingers blijven droog.',
      moist: 'De bodem is zacht en koel. Hij [plakt] een beetje aan je vingers, maar er komt geen water uit.',
      wet: 'De bodem is [modderig]. Er komt water uit als je erop [drukt], en je vingers zijn nat.'
    },
    feelNote: 'Noteer het op je terreinfiche: droog, vochtig of nat?',

    graphTitle: 'Jouw histogram',
    chartTitle: 'Aantal individuen van elke soort in zone A en zone B',
    graphHow: 'Teken voor elke soort <b class="zn-how-A">een blauwe staaf voor zone A</b> en <b class="zn-how-B">een oranje staaf voor zone B</b>, zo hoog als de aantallen in je telblad.',
    yName: 'Aantal individuen',
    xName: 'Soorten',
    scaleNote: 'Schaal: 1 hokje = 1 individu',
    barLabel: (name, Z) => `Staaf: ${name}, zone ${Z}`,

    qFactors: 'Abiotische factoren · lees je terreinfiche.',
    qLiving: 'Biotische factoren · lees je histogram.',
    qAnswer: 'Antwoord op vraag 1',
    qEach: 'Antwoord op vraag 2',
    // Question 2 : l'exemple (rel, s1, s2 : listes déroulantes, ou les mots dans la correction).
    example: (rel, s1, s2) => `Bijvoorbeeld bij ${rel}: het ene [levende wezen] ${s1} en het andere ${s2}.`,
    exAria: { rel: 'De relatie', s1: 'Het eerste levende wezen', s2: 'Het andere levende wezen' },
    rows: {
      warmer: 'Warmer',
      brighter: 'Meer licht',
      humid: 'Vochtiger',
      moss: 'Meer [mossen] en [varens]',
      bloom: 'Meer [wilde bloemen] en [vliegende insecten]',
      influence: 'Abiotische factoren hebben een invloed op levende wezens:',
      each: 'Levende wezens hebben een invloed op elkaar:'
    },
    qVerdict: 'Dus mijn hypothese is',
    verdicts: { confirmed: 'bevestigd', partly: 'gedeeltelijk bevestigd', rejected: 'verworpen' },
    checkConclusions: 'Mijn besluiten controleren',
    backToLab: 'Terug naar het terrein',

    scoreLabel: 'controles geslaagd',
    markCorrect: 'juist',
    markIncorrect: 'fout',
    criteria: { measures: 'Metingen', count: 'Tellen', graph: 'Histogram', inter: 'Interacties', conclusion: 'Besluit', verdict: 'Hypothese' },
    criteriaSub: { measures: 'Jouw terreinfiche', count: 'Jouw telblad', graph: 'Jouw staven', inter: 'Jouw tekens en relaties', conclusion: 'Jouw antwoorden', verdict: 'Jouw oordeel' },

    report: {
      title: 'Laboratoriumverslag — Twee ecosystemen onder de loep',
      question: 'Hebben abiotische factoren (temperatuur, licht, vochtigheid) een invloed op biotische factoren (de levende wezens)?',
      question2: 'Hebben levende wezens ook een invloed op elkaar?',
      questionCase: (a, b) => `Om dat te weten te komen, vergeleek ik twee zones die maar 50 m uit elkaar liggen: zone A (${a}) en zone B (${b}).`,
      // Morceaux de phrase de phrase.<clé> (hypMoss et hypBloom pour les êtres vivants).
      hypothesis: (warmer, brighter, humid, moss, bloom, influence, each) =>
        `Ik denk: ${warmer}, ${brighter} en ${humid}. Ik denk ook: ${moss}, en ${bloom}. Ik denk tot slot: ${influence}, en ${each}.`,
      because: 'Omdat',
      materials: 'Een thermometer, een luxmeter, een hygrometer, een telkader (1 m × 1 m), de terreinfiche, een telblad, ruitjespapier en een lat.',
      procedure: [
        'Meet in elke zone de luchttemperatuur met de thermometer, de lichtsterkte met de luxmeter en de luchtvochtigheid met de hygrometer.',
        'Raak de bodem aan om te voelen of hij droog, vochtig of nat is.',
        'Leg het telkader op de grond. Determineer elke soort levend wezen erin, en tel de individuen.',
        'Noteer alles op de terreinfiche en in het telblad.',
        'Kijk in de telkaders wat de levende wezens doen en zoek twee interacties tussen hen. Noteer voor elke interactie +, − of 0 voor beide levende wezens, en geef de relatie een naam.',
        'Teken een histogram van het aantal individuen van elke soort in beide zones (fiche FO5b).'
      ],
      zoneCol: 'Zone',
      sheetCaption: 'Terreinfiche: abiotische factoren',
      countCaption: 'Biotische factoren: telblad (aantal individuen in het telkader)',
      species: 'Soort',
      nothing: 'niets',
      speciesMiss: (Z, n, list) => `Zone ${Z}: er waren ${n} soorten in het telkader (${list}).`,
      barsWrong: list => `Staven op de verkeerde hoogte: ${list}.`,
      barWrong: (name, Z, got, want) => `${name} zone ${Z} (${got} in plaats van ${want})`,
      interCaption: 'Biotische factoren: mijn interacties',
      interCols: { what: 'Wat ik zag', signs: 'Tekens (+, −, 0)', rel: 'Relatie' },
      interFound: list => `In de telkaders vond ik ${list}.`,
      interItem: (rel, a, b) => `${rel} (${a} en ${b})`,
      interpretation: (warmer, brighter, humid, moss, bloom) =>
        `Mijn resultaten tonen: ${warmer}, ${brighter} en ${humid}. In de telkaders: ${moss} en ${bloom}.`,
      conclusion: (answer, each, example, verdict) => `Besluit: ${answer}, en ${each}. ${example} Mijn hypothese is ${verdict}.`,
      score: (n, total) => `Score: ${n} / ${total} controles geslaagd.`
    }
  },

  glossary: {
    '50 m uit elkaar': "à 50 m l'une de l'autre", 'weten te komen': 'le découvrir',
    weide: 'prairie', bosrand: 'lisière du bois', 'diepe schaduw': 'ombre profonde', 'oever van de vijver': "bord de l'étang",
    telkader: 'carré de comptage', luxmeter: 'luxmètre (il mesure la lumière)', hygrometer: "hygromètre (il mesure l'humidité de l'air)",
    mossen: 'mousses', varens: 'fougères', 'wilde bloemen': 'fleurs sauvages', 'vliegende insecten': 'insectes volants',
    'levend wezen': 'être vivant', 'levende wezens': 'êtres vivants', omcirkeld: 'entourés', omcirkelde: 'entourés',
    brokkelt: "s'effrite", plakt: 'colle', modderig: 'boueux', drukt: 'presses',
    pol: 'touffe', getande: 'dentelées', stekelige: 'épineuses', prikt: 'pique', schimmel: 'champignon',
    doorzichtige: 'transparentes', zwaardvormige: "en forme d'épée",
    gras: 'herbe', madeliefje: 'pâquerette', paardenbloem: 'pissenlit', boterbloem: "bouton d'or", braam: 'ronce', brandnetel: 'ortie',
    klimop: 'lierre', varen: 'fougère', mos: 'mousse', paddenstoel: 'champignon', pitrus: 'jonc', 'gele lis': 'iris des marais',
    vlinder: 'papillon', bij: 'abeille', sprinkhaan: 'sauterelle', mier: 'fourmi', pissebed: 'cloporte', slak: 'escargot',
    libel: 'libellule', kikker: 'grenouille',
    'voeden zich met': 'se nourrissent de', uitdrogen: 'se dessécher', 'drogen ze uit': 'elles se dessèchent', gunstig: 'favorables',
    loep: 'loupe', interactie: 'interaction', 'op elkaar': 'les uns sur les autres', 'levende wezen': 'être vivant',
    bladluizen: 'pucerons', spin: 'araignée', vlieg: 'mouche', roestschimmel: 'rouille (un champignon parasite)', duizendpoot: 'mille-pattes',
    boom: 'arbre', stam: 'tronc', wortels: 'racines', plantensap: 'sève', web: 'toile', spinsel: 'soie (de l’araignée)', kleverige: 'collante', kaken: 'mâchoires',
    stuifmeel: 'pollen', voordeel: 'avantage', nadeel: 'désavantage', 'geen invloed': 'aucune influence'
  },

  /* Les espèces du carré. name : le nom (aussi clé du lexique) ; key : le
     trait qui la reconnaît, écrit sous chaque nom proposé ; cap : la
     description, une fois l'espèce nommée. */
  species: {
    grass: { name: 'gras', key: 'lange, dunne groene bladeren', cap: 'Een [pol] gras: lange, dunne groene bladeren die in de zon groeien.' },
    moss: { name: 'mos', key: 'een zacht kussentje van heel kleine blaadjes', cap: 'Een zacht groen kussentje uit heel kleine blaadjes. Het heeft geen bloemen en geen wortels.' },
    fern: { name: 'varen', key: 'lange bladeren, verdeeld in veel kleine stukjes', cap: 'Een plant met lange, fijn verdeelde bladeren. Hij heeft geen bloemen.' },
    ivy: { name: 'klimop', key: 'donkere, glanzende bladeren met punten', cap: 'Een klimplant met donkere, glanzende bladeren. Hij blijft het hele jaar groen.' },
    bramble: { name: 'braam', key: 'stengels met stekels en bramen', cap: 'Een plant met lange [stekelige] stengels en bramen.' },
    nettle: { name: 'brandnetel', key: 'getande bladeren, twee aan twee', cap: 'Een plant met [getande] bladeren. Pas op: hij [prikt]!' },
    rush: { name: 'pitrus', key: 'dunne, ronde, stijve stengels', cap: 'Een plant met dunne, ronde, stijve stengels. Hij groeit met zijn voeten in het water.' },
    iris: { name: 'gele lis', key: 'lange platte bladeren zoals zwaarden en een grote gele bloem', cap: 'Een hoge plant met [zwaardvormige] bladeren en een grote gele bloem. Hij groeit bij het water.' },
    mushroom: { name: 'paddenstoel', key: 'een hoed op een witte steel', cap: 'Een [schimmel]: dit is geen plant. Hij groeit op dode bladeren en dood hout.' },
    daisy: { name: 'madeliefje', key: 'witte blaadjes rond een geel hart', cap: 'Een klein wit bloemetje met een geel hart. Het gaat open in de zon.' },
    dandelion: { name: 'paardenbloem', key: 'een gele bloem uit veel dunne blaadjes', cap: 'Een gele bloem met [getande] bladeren. Bijen zijn er dol op.' },
    buttercup: { name: 'boterbloem', key: 'vijf ronde, glanzende gele blaadjes', cap: 'Een kleine, glanzende gele bloem met vijf ronde blaadjes.' },
    butterfly: { name: 'vlinder', key: 'grote, kleurrijke vleugels', cap: 'Een insect met grote, kleurrijke vleugels. Hij drinkt de nectar van bloemen.' },
    bee: { name: 'bij', key: 'gele en zwarte strepen', cap: 'Een vliegend insect met gele en zwarte strepen. Ze bezoekt bloemen.' },
    dragonfly: { name: 'libel', key: 'een lang, dun lijf en vier doorzichtige vleugels', cap: 'Een lang vliegend insect met vier [doorzichtige] vleugels. Ze jaagt bij het water.' },
    grasshopper: { name: 'sprinkhaan', key: 'lange achterpoten om te springen', cap: 'Een groen insect met lange achterpoten. Hij springt heel ver.' },
    ant: { name: 'mier', key: 'een heel klein zwart lijf in drie delen', cap: 'Een heel klein zwart insect. Ze loopt snel.' },
    woodlouse: { name: 'pissebed', key: 'een grijze rug uit plaatjes', cap: 'Een klein grijs diertje met een harde rug uit plaatjes, en veertien pootjes.' },
    snail: { name: 'slak', key: 'een huisje op zijn rug', cap: 'Een zacht dier dat zijn huisje op zijn rug draagt. Het beweegt langzaam.' },
    frog: { name: 'kikker', key: 'een gladde groene huid en lange achterpoten', cap: 'Een groen dier dat bij het water leeft. Zijn huid is altijd nat.' }
  },

  /* Les indices d'interactions vus à la loupe. names : les êtres vivants qui
     ne sont que dans un indice (on ne les compte pas). fact : ce qu'on voit
     (a, b : les noms des deux êtres vivants, dans l'ordre de la fiche) ;
     why : les signes et la relation, pour la correction. Article indéfini
     (« een ») : le même pour tous les noms. */
  clues: {
    names: { spider: 'spin', fly: 'vlieg', aphids: 'bladluizen', rust: 'roestschimmel', tree: 'boom', centipede: 'duizendpoot' },
    fact: {
      pollen: (a, b) => `Een ${a} zit op een ${b}. Het insect drinkt de nectar van de bloem, en geel [stuifmeel] blijft aan zijn lijf plakken. Het brengt dat stuifmeel naar de volgende bloem: zo kan de bloem zaden maken.`,
      frog: () => 'Een kikker schiet zijn lange, [kleverige] tong uit en vangt een libel. Hij slikt ze in.',
      web: () => 'Een [spin] heeft haar [web] tussen de planten gemaakt. Er zit een [vlieg] in vast, ingepakt in [spinsel]: de spin zal ze opeten.',
      aphids: () => 'Heel kleine groene [bladluizen] bedekken een blad van de brandnetel. Ze steken hun mond in de plant en zuigen het [plantensap] op. Dit blad is gekruld en geel.',
      rust: () => 'Kleine oranje vlekjes bedekken de bladeren van de braam. Het is een heel kleine [roestschimmel] die in het blad leeft en zich ermee voedt. De gevlekte bladeren worden geel en sterven af.',
      ivy: () => 'Klimop klimt tegen de [stam] van een [boom] op en houdt zich vast met kleine worteltjes. Hij neemt geen voedsel van de boom: daarboven krijgt hij gewoon meer licht.',
      mycorrhiza: () => 'Paddenstoelen groeien aan de voet van een [boom]. Onder de grond wikkelen de witte draden van de [schimmel] zich rond de [wortels] van de boom: de schimmel geeft de boom water en mineralen, en de boom geeft de schimmel suiker.',
      fernmoss: () => 'Grote varens groeien over het mos. Onder de varens krijgt het mos weinig licht: het is bleek en geel. De varens en het mos halen ook water uit dezelfde bodem.',
      bramblegrass: () => 'Een braam groeit over het gras. Onder de braam krijgt het gras weinig licht: het is bleek en dun. Beide planten halen water uit dezelfde bodem.',
      centipede: () => 'Een [duizendpoot] houdt een pissebed vast in zijn [kaken] en eet hem op.'
    },
    why: {
      pollen: () => 'Het insect krijgt voedsel: de nectar (+). De bloem krijgt haar stuifmeel naar een andere bloem gebracht, zodat ze zaden kan maken (+). Allebei hebben ze voordeel: dit is mutualisme.',
      frog: () => 'De kikker krijgt voedsel (+); de libel wordt gedood en opgegeten (−). Het ene dier jaagt op het andere en eet het op: dit is predatie.',
      web: () => 'De spin krijgt voedsel (+); de vlieg wordt gedood en opgegeten (−). Dit is predatie.',
      aphids: () => 'De bladluizen krijgen voedsel van de brandnetel (+); de brandnetel verliest sap en wordt zwakker, maar gaat niet dood (−). Het ene leeft op het andere en schaadt het: dit is parasitisme.',
      rust: () => 'De schimmel krijgt voedsel van de braam (+); de braam verliest bladeren en wordt zwakker (−). Dit is parasitisme.',
      ivy: () => 'De klimop krijgt meer licht (+); de boom wint niets en verliest niets (0). Dit is commensalisme.',
      mycorrhiza: () => 'De schimmel krijgt suiker (+); de boom krijgt water en mineralen (+). Allebei hebben ze voordeel: dit is mutualisme.',
      fernmoss: () => 'De varens en het mos delen hetzelfde licht en hetzelfde water: elk krijgt minder (− en −). Dit is competitie.',
      bramblegrass: () => 'De braam en het gras delen hetzelfde licht en hetzelfde water: elk krijgt minder (− en −). Dit is competitie.',
      centipede: () => 'De duizendpoot krijgt voedsel (+); de pissebed wordt gedood en opgegeten (−). Dit is predatie.'
    }
  },

  /* Morceaux de phrase tirés des choix de l'élève (v : A, B, same ; yes, no),
     lisibles seuls (correction) ; le rapport les assemble (labels.report).
     hypBloom suit hypMoss dans la phrase du rapport ; hypBloomRow est la
     même idée en phrase complète. */
  phrase: {
    warmer: v => v === 'same' ? 'beide zones hebben dezelfde temperatuur' : `zone ${v} is warmer`,
    brighter: v => v === 'same' ? 'beide zones krijgen evenveel licht' : `zone ${v} krijgt meer licht`,
    humid: v => v === 'same' ? 'beide zones zijn even vochtig' : `zone ${v} is vochtiger`,
    moss: v => v === 'same' ? 'er zijn in beide zones evenveel mossen en varens' : `er zijn meer mossen en varens in zone ${v}`,
    bloom: v => v === 'same' ? 'er zijn in beide zones evenveel wilde bloemen en vliegende insecten' : `er zijn meer wilde bloemen en vliegende insecten in zone ${v}`,
    influence: v => v === 'yes' ? 'abiotische factoren hebben een invloed op levende wezens' : 'abiotische factoren hebben geen invloed op levende wezens',
    each: v => v === 'yes' ? 'levende wezens hebben een invloed op elkaar' : 'levende wezens hebben geen invloed op elkaar',
    hypMoss: v => v === 'same' ? 'ik zal in beide zones evenveel mossen en varens vinden' : `ik zal in zone ${v} meer mossen en varens vinden`,
    hypBloom: v => v === 'same' ? 'in beide zones evenveel wilde bloemen en vliegende insecten' : `in zone ${v} meer wilde bloemen en vliegende insecten`,
    hypBloomRow: v => v === 'same' ? 'ik zal in beide zones evenveel wilde bloemen en vliegende insecten vinden' : `ik zal in zone ${v} meer wilde bloemen en vliegende insecten vinden`
  },

  // Étape Check : pourquoi, pour chaque question.
  explain: {
    brighter: 'Onder de bomen houden de bladeren het meeste zonlicht tegen: er komt veel minder licht op de grond.',
    warmer: 'Waar minder zonlicht op de grond komt, warmen de lucht en de bodem minder op: het is er koeler.',
    humid: 'Waar het koel en schaduwrijk is, verdampt er minder water: de lucht en de bodem blijven vochtig. Bij een vijver maakt het water dat verdampt de lucht heel vochtig.',
    moss: '[Mossen] en [varens] hebben veel water nodig: mossen hebben geen wortels en kunnen snel [uitdrogen], en varens hebben water nodig om zich voort te planten. Ze leven waar het vochtig is, vaak in de schaduw.',
    bloom: '[Wilde bloemen] hebben veel licht nodig om te groeien en te bloeien. Bijen en vlinders [voeden zich met] hun nectar, en ze houden van warmte.',
    influence: 'Je twee zones liggen maar 50 m uit elkaar, maar hun abiotische factoren (temperatuur, licht, vochtigheid) zijn heel verschillend, en hun levende wezens ook: elke soort leeft waar de omstandigheden voor haar [gunstig] zijn. [Mossen] en [varens] hebben vooral vochtigheid nodig: zonder water [drogen ze uit]. Abiotische factoren hebben dus een invloed op biotische factoren.',
    each: 'In de telkaders vond je levende wezens die een [interactie] hebben: het ene eet het andere op, het ene leeft op het andere en schaadt het, twee helpen elkaar, twee delen hetzelfde licht en water… Levende wezens hebben dus een invloed op elkaar: ze zijn biotische factoren.'
  },

  // said, real : valeurs déjà écrites avec leur unité (said vaut null si rien
  // n'a été noté) ; factor, instrument : en minuscules, pour la phrase.
  check: {
    measScore: (good, total) => `${good} / ${total} waarden juist genoteerd.`,
    measAllGood: 'Al je waarden komen overeen met de meettoestellen. Goed afgelezen!',
    measMiss: (Z, factor, instrument, said, real) => `Zone ${Z}, ${factor}: je noteerde ${said || 'niets'}, de ${instrument} toonde ${real}.`,
    measMissSoil: (Z, said, real) => `Zone ${Z}, bodem: je noteerde “${said || 'niets'}”, de bodem was ${real}.`,
    realValues: 'Wat de meettoestellen toonden',
    countMissed: (Z, name, real) => `Zone ${Z}: je vond de soort “${name}” niet (${real} in het telkader).`,
    countWrong: (Z, name, said, real) => `Zone ${Z}, ${name}: je noteerde ${said == null ? 'niets' : said}, maar er ${real === 1 ? 'was er 1' : `waren er ${real}`} in het telkader.`,
    countAllGood: 'Je vond elke soort en telde elk individu. Goed gedaan!',
    realCount: Z => `Wat er echt in het telkader van zone ${Z} zat:`,
    barMiss: (name, Z, got, want) => `Staaf ${name}, zone ${Z}: je tekende ${got}, je telblad zegt ${want}.`,
    barsOk: 'Al je staven zijn zo hoog als de aantallen in je telblad. Goed getekend!',
    concScore: (good, total) => `${good} / ${total} antwoorden juist.`,
    youSaid: 'Jij zei:',
    right: 'Het juiste antwoord:',
    // verdict : le libellé (labels.verdicts).
    verdictOk: verdict => `Je beoordeelde je hypothese als “${verdict}”: dat klopt. Goed geoordeeld!`,
    verdictWrong: verdict => `Vergelijk je hypothese met je antwoorden: je hypothese is ${verdict}.`,
    verdictRule: 'Alle zeven delen hetzelfde als je antwoorden: bevestigd. Sommige: gedeeltelijk bevestigd. Geen enkel: verworpen.',
    interScore: (good, total) => `${good} / ${total} ${total === 1 ? 'interactie' : 'interacties'} juist (tekens en relatie).`,
    interOk: 'Je tekens en je relaties zijn allemaal juist. Goed waargenomen!',
    youNoted: 'Jij noteerde:',
    // rel : la relation choisie ; s1, s2 : ses deux signes, en mots.
    exWrong: (rel, s1, s2) => `Bij ${rel}: het ene levende wezen ${s1} en het andere ${s2}.`,
    rejectedNote: 'Een verworpen hypothese is geen fout: zo gaat de wetenschap vooruit.',
    hypPart: 'Hypothese',
    answerPart: 'Jouw antwoord'
  }
});
