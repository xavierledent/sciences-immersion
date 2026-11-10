/* ===== Labo virtuel « The separation challenge » (chem2) : textes en néerlandais =====

   Simulation commune aux deux filières : js/lab-separation.js, chargée
   après ce fichier. Mêmes clés que l'anglais (en/year1/chem2/lab-separation.en.js).

   Chaque mot du lexique (glossary) est souligné partout où il apparaît,
   sauf dans les boutons (lab-engine.js) ; [mot] ou [mot|clé] reste utile
   pour une forme dont la clé diffère.

   Termes repris du vocabulaire néerlandais du chapitre (vocabulary.json) et
   de ses exercices : zuivere stof, mengsel, homogeen / heterogeen mengsel,
   oplossing, opgeloste stof, oplosmiddel, sorteren met de hand, zeven,
   filtratie, verdamping, distillatie, condensor, kolf ; magnetische
   scheiding et decanteren comme dans practice.json et interactive.json. */

(function () {
// Majuscule, minuscule en tête de phrase.
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const lc = s => s.charAt(0).toLowerCase() + s.slice(1);

LabEngine.addText('separation', {
  labels: {
    title: 'De scheidingsuitdaging',

    // Page d'accueil (Mission) : toujours la même, rien du tirage ; des gestes, jamais des résultats.
    briefTitle: 'Opdracht: scheid alle bestanddelen van een mengsel',
    briefTask: 'Eén bokaal, één mengsel. Scheid alles!',
    briefSteps: [
      '<strong>Neem</strong> de bokaal <strong>waar</strong>. <strong>Plan</strong> je scheidingen.',
      '<strong>Gebruik</strong> de hulpmiddelen. <strong>Vul</strong> je scheidingslogboek <strong>in</strong>.',
      '<strong>Benoem</strong> elke techniek. Werkte je plan?'
    ],
    // Sous chaque phrase courte : le comment, en une phrase (jamais le résultat).
    briefDetails: [
      'Bekijk de fasen en zet dan de hulpmiddelen in volgorde.',
      'Neem een hulpmiddel en raak dan het recipiënt aan waarop je het wilt gebruiken.',
      'De fiche met de technieken helpt je om elke techniek te benoemen.'
    ],

    // « a, b en c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' en ' + names[names.length - 1] : names[0] || '',
    temp: v => `${v} °C`,

    yourQuestion: 'Je onderzoeksvraag',
    question: 'Hoe kunnen we alle bestanddelen van dit mengsel scheiden, en in welke volgorde?',
    subQuestion: the => `Je ziet ${the} niet. Zit ${the} nog in het water?`,
    labelTitle: 'Etiket op de bokaal',

    // Étape 1 : observer (partie A du journal) et planifier (partie B)
    observeTitle: 'A. Bekijk het mengsel',
    phasesQ: 'Hoeveel fasen zie je?',
    typeQ: 'Het is een…',
    types: { homogeneous: 'Homogeen mengsel', heterogeneous: 'Heterogeen mengsel' },
    statesQ: 'In de bokaal is elk bestanddeel…',
    stateWords: { solid: 'Vast', liquid: 'Vloeibaar', hidden: 'Niet zichtbaar' },
    planTitle: 'B. Plan je scheiding (je hypothese)',
    planSlot: i => (i === 0 ? 'Eerst:' : 'Dan:'),
    gestures: {
      tweezers: 'Stukjes eruit halen met een pincet',
      magnet: 'Een magneet gebruiken',
      sieve: 'Door een zeef gieten',
      filter: 'Door filterpapier gieten',
      decant: 'Een scheitrechter gebruiken',
      heat: 'Verwarmen op de kookplaat',
      distil: 'Distilleren (verwarmen, dan de damp afkoelen)'
    },
    planSentence: (gestures, last) => `${gestures.map((g, i) => (i === 0 ? 'Eerst ' : 'dan ') + lc(g)).join('; ')}. Op het einde blijft ${last} over.`,
    lastQ: 'Wat blijft er op het einde over?',
    betQ: the => `Wat is er met ${the} in het water gebeurd?`,
    bets: { gone: 'Verdwenen', still: 'Nog altijd in het water' },
    because: 'Waarom denk je dat? (niet verplicht)',
    becausePlaceholder: 'Omdat…',
    choose: 'kies',
    lockPredict: 'Bekijk eerst het mengsel en maak je plan af.',
    lockPredictFixed: 'Je waarneming en je plan liggen vast: de scheiding is begonnen. Een wetenschapper verandert de hypothese niet na het zien van de resultaten!',
    predictReady: 'Je plan is klaar.',
    predictPending: 'Bekijk het mengsel en plan dan je scheiding.',
    toBench: 'Verder: de labotafel',

    // Étape 2 : la paillasse
    deskTitle: 'Bureau van de leerkracht',
    tools: {
      tweezers: 'Pincet',
      magnet: 'Magneet',
      sieve: 'Zeef',
      filter: 'Trechter en filterpapier',
      decant: 'Scheitrechter',
      heat: 'Kookplaat',
      distil: 'Distillatie\u00ADopstelling' // césure possible (bouton étroit)
    },
    goggles: 'Bril opzetten',
    gogglesOn: 'Bril op',
    lockGoggles: 'Zet eerst je veiligheidsbril op: het wordt heel heet.',
    lockSeparated: 'Alle bestanddelen zijn al gescheiden.',
    captionHold: name => `Je hebt nu in je hand: ${lc(name)}. Tik op het recipiënt waarop je het wilt gebruiken.`,
    captionGoggles: 'Je veiligheidsbril staat op: je kunt nu de kookplaat gebruiken.',
    jarName: 'Bokaal',
    containerName: n => `Recipiënt ${n}`,
    airName: 'In de lucht',
    newSample: 'Nieuw staal',
    speedUp: 'Sneller',
    newSampleTitle: 'Een nieuw staal nemen?',
    newSampleText: 'Je recipiënten worden leeggemaakt en je begint opnieuw met een volle bokaal van hetzelfde mengsel. Je scheidingslogboek begint ook opnieuw.',
    newSampleYes: 'Ja, nieuw staal',
    askTarget: 'Welke stukjes haal je eruit?',
    logTitle: 'Scheidingslogboek',
    logEmpty: 'Na elke scheiding verschijnt hier een nieuwe regel. Vul hem in: wat je eruit haalt, het hulpmiddel en wat er overblijft.',
    separationN: n => `Scheiding ${n}`,
    removedQ: 'We halen eruit',
    toolQ: 'Hulpmiddel',
    leftQ: 'Wat blijft er over?',
    runInfo: (rows, steps, sample) => `${rows} / ${steps} scheidingen` + (sample > 1 ? ` · staal ${sample}` : ''),
    lockRun: (done, missing) => (!done
      ? 'Scheid eerst alle bestanddelen: elk recipiënt mag maar één bestanddeel bevatten.'
      : `Vul eerst je scheidingslogboek aan: ${missing} ${missing === 1 ? 'regel is' : 'regels zijn'} nog niet volledig.`),
    toConclude: 'Verder: besluiten',

    // Étape 3 : conclusion
    colRemoved: 'We halen eruit',
    colTool: 'Hulpmiddel',
    colLeft: 'Wat blijft over',
    techTitle: 'Benoem de techniek van elke scheiding en zeg waarom ze werkt. De fiche met de technieken kan je helpen.',
    colTechnique: 'Techniek',
    colWhy: 'Waarom werkt het?',
    techniques: {
      manual: 'Sorteren met de hand',
      magnetic: 'Magnetische scheiding',
      sifting: 'Zeven',
      filtration: 'Filtratie',
      decantation: 'Decanteren',
      evaporation: 'Verdamping',
      distillation: 'Distillatie'
    },
    whys: {
      big: 'De stukken zijn groot: we kunnen ze een voor een nemen.',
      magnetic: 'Een magneet trekt ijzer aan.',
      size: 'De stukken zijn verschillend van grootte.',
      solid: 'Het papier houdt de vaste stukjes tegen; de vloeistof gaat erdoor.',
      floats: 'De lichte vloeistof drijft bovenop.',
      boils: 'De vloeistof wordt een gas; de vaste stof blijft.',
      bp: 'Eén vloeistof kookt bij een lagere temperatuur.'
    },
    notebookBtn: 'Fiche met de technieken',
    stillAnswers: { yes: 'Ja, het zit nog in het water', no: 'Nee, het is verdwenen' },
    soluteLine: (solute, solvent) => `De opgeloste stof is ${solute} en het oplosmiddel is ${solvent}.`,
    soluteAria: 'Opgeloste stof',
    solventAria: 'Oplosmiddel',
    planQ: 'Vergelijk met je plan. Heeft je plan gewerkt?',
    worked: { yes: 'Mijn plan heeft gewerkt', no: 'Mijn plan heeft niet gewerkt' },
    reasonQ: 'Waarom niet?',
    reasons: {
      order: 'De volgorde van de stappen was fout.',
      tool: 'Een hulpmiddel kon de bestanddelen niet scheiden.',
      last: 'Op het einde bleef een ander bestanddeel over.'
    },
    backToLab: 'Terug naar de labotafel',
    checkConclusions: 'Mijn besluiten controleren',

    // Étape 4 : correction
    scoreLabel: 'controles geslaagd',
    markCorrect: 'juist',
    markIncorrect: 'fout',
    criteria: { observe: 'Waarneming', separate: 'Scheiding', log: 'Scheidingslogboek', techniques: 'Technieken', conclusion: 'Besluit' },
    criteriaSub: { observe: 'Fasen, soort, bestanddelen', separate: 'Telkens het juiste hulpmiddel', log: 'Eruit, hulpmiddel, over', techniques: 'Naam en waarom', conclusion: 'Je antwoorden en je plan' },
    yours: 'Jij',
    expected: 'Verwacht',
    phasesShort: 'Fasen',
    typeShort: 'Soort mengsel',
    sampleN: n => `Staal ${n}`,

    report: {
      title: 'Labverslag — Een mengsel scheiden',
      bet: (the, bet) => `Over ${the}: ${lc(bet)}.`,
      because: 'Omdat',
      materials: (comps, tools) => `Een bokaal met een mengsel van ${comps}. Op het bureau van de leerkracht: ${tools}.`,
      goggles: 'een veiligheidsbril',
      newSample: 'Ik heb een nieuw staal van het mengsel genomen.',
      step: (tool, part, target) => `${cap(tool)} → ${part}` + (target ? ` (${target})` : ''),
      observeCaption: 'A. Waarneming van het mengsel',
      logCaption: 'Scheidingslogboek',
      rightIs: 'Het juiste antwoord is',
      technique: (n, name, why) => `Scheiding ${n}: ${name}. Waarom het werkt: ${why}`,
      order: list => `We hebben de bestanddelen gescheiden met: ${list}.`,
      still: (the, answer) => `Zit ${the} nog in het water? ${answer}.`,
      reason: x => `Waarom: ${x}`,
      plan: judged => `${judged}.`,
      score: n => `Score: ${n} / 5 controles geslaagd.`
    }
  },

  glossary: {
    mengsel: 'le mélange', bestanddeel: 'le constituant', bestanddelen: 'les constituants',
    bokaal: 'le pot', etiket: 'l’étiquette', 
    'bureau van de leerkracht': 'le bureau du professeur',
    zand: 'le sable', ijzervijlsel: 'la limaille de fer', zout: 'le sel', suiker: 'le sucre', bloem: 'la farine',
    kiezels: 'les cailloux', nagels: 'les clous', paperclips: 'les trombones', knikkers: 'les billes', olie: 'l’huile',
    korrels: 'les grains', zaadjes: 'les graines', bolletjes: 'les petites boules',
    pincet: 'la pince à épiler', magneet: 'l’aimant', zeef: 'le tamis', trechter: 'l’entonnoir',
    scheitrechter: 'l’ampoule à décanter', kraantje: 'le robinet', 'onderste laag': 'la couche du dessous',
    bekerglas: 'le bécher', kookplaat: 'la plaque chauffante', schaaltje: 'la coupelle',
    veiligheidsbril: 'les lunettes de protection', kolf: 'le ballon', damp: 'la vapeur',
    scheidingslogboek: 'le journal de séparation', 'wat er overblijft': 'ce qui reste', 'blijft er over': 'reste',
    opgelost: 'dissous', 'opgeloste stof': 'le soluté', oplosmiddel: 'le solvant',
    drijft: 'flotte', 'bovenste laag': 'la couche du dessus', laag: 'la couche',
    afgieten: 'verser', gieten: 'verser', giet: 'verse', kookt: 'bout', wegkookt: 's’évapore en bouillant',
    helder: 'limpide', heldere: 'limpide', troebel: 'trouble', gaatjes: 'les trous',
    'eruit halen': 'retirer', 'een voor een': 'un par un', verwarmen: 'chauffer', verwarmd: 'chauffé', verwarmde: 'chauffé',
    leeg: 'vide', lege: 'vide', druppelt: 'goutte'
  },

  // Les constituants : name (étiquette, listes), the (dans une phrase),
  // look (ce qu'on voit, sans dire ce que c'est : c'est à l'élève de le dire).
  comps: {
    sand: { name: 'Zand', the: 'het zand', look: 'de beige korrels' },
    ironFilings: { name: 'IJzervijlsel', the: 'het ijzervijlsel', look: 'het donkergrijze poeder' },
    salt: { name: 'Zout', the: 'het zout', look: 'de witte kristallen' },
    sugar: { name: 'Suiker', the: 'de suiker', look: 'de witte kristallen' },
    flour: { name: 'Bloem', the: 'de bloem', look: 'het fijne witte poeder' },
    rice: { name: 'Rijst', the: 'de rijst', look: 'de lange witte korrels' },
    lentils: { name: 'Linzen', the: 'de linzen', look: 'de kleine bruine zaadjes' },
    pebbles: { name: 'Kiezels', the: 'de kiezels', look: 'de grijze kiezels' },
    nails: { name: 'IJzeren nagels', the: 'de ijzeren nagels', look: 'de kleine nagels' },
    paperClips: { name: 'Paperclips', the: 'de paperclips', look: 'de paperclips' },
    marbles: { name: 'Glazen knikkers', the: 'de glazen knikkers', look: 'de gekleurde glazen bolletjes' },
    water: { name: 'Water', the: 'het water', look: 'een heldere vloeistof' },
    alcohol: { name: 'Alcohol', the: 'de alcohol', look: 'een heldere vloeistof' },
    oil: { name: 'Olie', the: 'de olie', look: 'een gele vloeistof' }
  },

  // Ce qu'on voit pendant et après chaque geste : décrit, jamais interprété.
  captions: {
    start: 'Neem een hulpmiddel van het bureau van de leerkracht (tik erop) en tik dan op de bokaal.',
    goOn: 'Neem een ander hulpmiddel en gebruik het op een recipiënt.',
    allDone: 'Elk recipiënt bevat nu maar één bestanddeel. Vul je scheidingslogboek aan.',
    deadEnd: 'Met deze hulpmiddelen kun je de bestanddelen die nog samen zitten niet meer scheiden. Neem een nieuw staal.',
    newSample: 'Hier is een nieuw staal van hetzelfde mengsel. Gebruik je hulpmiddelen opnieuw.',
    notStarted: 'Je bokaal is nog vol: je hebt nog geen nieuw staal nodig.',
    crystals: 'de witte kristallen',
    working: {
      tweezers: 'Je haalt stukjes eruit met het pincet…',
      magnet: 'Je beweegt de magneet langzaam door het mengsel…',
      sieve: 'Je giet het mengsel door de zeef…',
      filter: 'Je giet het mengsel in de trechter, door het filterpapier…',
      decant: 'Je zet de scheitrechter klaar…',
      heat: 'De kookplaat verwarmt het schaaltje…',
      distil: 'Het mengsel wordt verwarmd in de kolf; de condensor blijft koud…'
    },
    result: {
      single: 'Dit recipiënt bevat maar één bestanddeel: er valt niets te scheiden.',
      magnetNone: 'Er blijft niets aan de magneet hangen.',
      magnet: x => `De magneet trekt ${x} aan. Je doet dat deel in een nieuw schaaltje.`,
      tweezersNone: 'Er zijn geen vaste stukjes om eruit te halen.',
      tweezersSmall: x => `Je probeert ${x} eruit te halen, maar de stukjes zijn te klein om een voor een te nemen.`,
      tweezers: x => `Je haalt ${x} een voor een eruit en legt ze in een nieuw schaaltje.`,
      sieveAll: 'Alles gaat door de gaatjes van de zeef.',
      sieveNone: 'Niets gaat door de gaatjes: alles blijft in de zeef.',
      sieve: (kept, passed) => `In de zeef: ${kept}. Door de gaatjes: ${passed}.`,
      filterDry: 'Er is geen vloeistof: het droge mengsel blijft gewoon in het filterpapier liggen.',
      filterNothing: 'Alle vloeistof gaat door het papier. Er blijft niets op het filterpapier.',
      filter: (kept, passed) => `Op het filterpapier: ${kept}. In het bekerglas eronder: ${passed}.`,
      decantDry: 'Er is geen vloeistof om in de scheitrechter te gieten.',
      decantSolids: 'Er zitten vaste stukjes in dit mengsel: ze zouden het kraantje van de scheitrechter verstoppen. Je giet het er niet in.',
      decantOne: 'Er is maar één laag vloeistof: niets drijft bovenop.',
      decant: (kept, passed) => `Er vormen zich twee lagen. Je opent het kraantje en laat de onderste laag weglopen. In de scheitrechter: ${kept}. In het bekerglas eronder: ${passed}.`,
      heatNothing: 'Je verwarmt lang, maar niets kookt weg.',
      heatLost: 'Alle vloeistof kookt en gaat de lucht in. Het schaaltje is leeg: deze bestanddelen zijn verloren.',
      heat: kept => `De vloeistof kookt en wordt een gas: ze gaat de lucht in. In het schaaltje: ${kept}.`,
      distilNothing: 'Niets kookt in de kolf.',
      distil: (temp, kept) => `Bij ${temp} begint een vloeistof te koken. Haar damp koelt af in de condensor en druppelt in een nieuwe kolf. In de verwarmde kolf blijft: ${kept}.`
    }
  },

  // La correction : ce que l'élève a fait, ce qui était attendu, pourquoi.
  check: {
    phasesWhy: (looks, n) => (n === 1
      ? `In de bokaal zie je maar één deel: ${looks}. Er is maar één fase: het is een homogeen mengsel. Je ziet de verschillende bestanddelen niet.`
      : `In de bokaal zie je ${n} verschillende delen: ${looks}. Elk zichtbaar deel is een fase. Met twee of meer fasen is het een heterogeen mengsel.`),
    hiddenWhy: the => `${cap(the)} is opgelost in het water: je ziet ${the} niet meer, maar ${the} is er nog. Het water en ${the} vormen een oplossing, met maar één fase.`,
    tryOk: names => `Het werkt. Eruit gehaald: ${names}.`,
    tryWrong: {
      single: 'Maar één bestanddeel in dit recipiënt: niets te scheiden.',
      magnetNone: 'Niets hier wordt door een magneet aangetrokken.',
      tweezersNone: 'Geen vaste stukjes om eruit te halen.',
      tweezersSmall: 'De stukjes zijn te klein om een voor een eruit te halen.',
      sieveAll: 'Alles gaat door de gaatjes: alle stukjes zijn klein.',
      sieveNone: 'Niets gaat door de zeef.',
      filterDry: 'Filterpapier scheidt een vaste stof van een vloeistof: hier is er geen vloeistof.',
      filterNothing: 'Er blijft niets op het papier: een opgeloste stof gaat samen met de vloeistof door het papier.',
      decantDry: 'Geen vloeistof om in de scheitrechter te gieten.',
      decantSolids: 'Vaste stukjes zouden het kraantje van de scheitrechter verstoppen: haal ze er eerst uit.',
      decantOne: 'Maar één laag vloeistof: niets drijft bovenop.',
      heatNothing: 'Niets kookt weg op de kookplaat.',
      heatLost: 'Alle vloeistoffen zijn samen weggekookt: ze zijn verloren.',
      distilNothing: 'Niets kookt in de kolf.'
    },
    separateOk: 'Alle bestanddelen zijn gescheiden, telkens met het juiste hulpmiddel.',
    separateKo: (failed, again) => `Alle bestanddelen zijn gescheiden, maar ${failed} ${failed === 1 ? 'poging werkte' : 'pogingen werkten'} niet` +
      (again ? `, en je hebt ${again} ${again === 1 ? 'nieuw staal' : 'nieuwe stalen'} genomen` : '') + '.',
    oneWay: 'Een volgorde die werkt:',
    noLog: 'Je scheidingslogboek is leeg.',
    logHint: 'Wat we eruit halen, is wat het hulpmiddel wegneemt: wat aan de magneet blijft hangen, wat in de zeef of op het filterpapier blijft, of de vloeistof die wegkookt. Wat overblijft, is de rest van het mengsel. Bij de scheitrechter zijn beide manieren juist: we halen de onderste laag eruit (ze loopt weg) of de bovenste laag (ze blijft in de scheitrechter).',
    // Ampoule à décanter : l'inverse est accepté aussi.
    eitherWay: '(of omgekeerd)',
    answerOk: 'Juist.',
    answerWrong: 'Niet helemaal.',
    stillRight: the => `${cap(the)} zit nog in het water: ${the} is opgelost. De opgeloste stof is ${the} en het oplosmiddel is het water.`,
    stillWhy: the => `Als het water wegkookt, blijven er witte kristallen in het schaaltje: dat is ${the}. ${cap(the)} was niet verdwenen, maar opgelost in heel kleine deeltjes, te klein om te zien.`,
    bet: (bet, right) => `Je hypothese: “${bet}” — ${right ? 'bevestigd' : 'verworpen'}.`,
    yourPlan: 'Je plan',
    planWorks: 'Dit plan werkt: elke stap scheidt iets, en op het einde blijft het juiste bestanddeel over.',
    planFails: {
      order: 'Dit plan werkt niet in deze volgorde: met dezelfde hulpmiddelen in een andere volgorde werkt het wel.',
      tool: 'Dit plan werkt niet: een van de hulpmiddelen kan deze bestanddelen niet scheiden.',
      last: 'De stappen werken, maar op het einde blijft een ander bestanddeel over.'
    },
    judgedOk: 'Je hebt je plan juist beoordeeld.',
    judgedKo: (worked, reason) => `Je oordeel is niet juist. Verwacht: “${worked}”` + (reason ? `, omdat “${reason}”` : '') + '.'
  },

  // La fiche des techniques (cours, Mission 7 ; la distillation : Extra).
  notebook: {
    intro: 'Nu weet je hoe je mengsels scheidt. Wetenschappers geven elke techniek een naam.',
    items: {
      manual: 'we nemen de grote stukken met onze handen, met een pincet of met een lepel.',
      magnetic: 'een magneet trekt ijzer aan.',
      sifting: 'een zeef heeft gaatjes. Kleine stukjes gaan erdoor. Grote stukken blijven liggen.',
      filtration: 'filterpapier houdt de vaste stukjes tegen. De vloeistof gaat erdoor.',
      decantation: 'twee vloeistoffen die niet mengen, vormen twee lagen: de lichte vloeistof drijft bovenop. In een scheitrechter openen we het kraantje: de onderste laag loopt weg, de bovenste laag blijft. Alleen vloeistoffen gaan in de scheitrechter.',
      evaporation: 'we verwarmen het mengsel. De vloeistof wordt een gas. De vaste stof blijft.',
      distillation: 'we verwarmen een mengsel van vloeistoffen. De vloeistof met het laagste kookpunt wordt eerst een gas. In de condensor wordt ze weer vloeibaar en valt ze in een andere kolf.'
    }
  }
});
})();
