/* ===== Labo virtuel « Watch it change » (phys2) : textes en néerlandais =====

   Simulation commune aux deux filières : js/lab-statechange.js, chargée
   après ce fichier. Mêmes clés que l'anglais
   (en/year1/phys2/lab-statechange.en.js), seul le lexique (glossary) a ses
   propres mots.

   Les mots du lexique sont soulignés d'office partout où ils apparaissent
   (traduction française au survol ou au toucher). Termes repris du
   chapitre : toestandsverandering, thermische energie, deeltjes, bindingen,
   smelten, stollen, bevriezen, koken, smeltpunt, kookpunt, plateau, balans,
   bekerglas, warmtebron, chronometer, gemalen ijs, kaarsvet, recipiënt.
   « vast » (solide) est dans le lexique : ne pas l'employer dans un autre
   sens (« ligt vast »).

   Phrases de la conclusion : chacune reçoit ses listes déroulantes (et sa
   case) toutes faites. Le choix vient en fin de phrase, au participe
   (« is de temperatuur » + « gelijk gebleven ») : pas de verbe coupé en
   deux. Les mêmes phrases servent à donner la bonne réponse dans la
   correction et le rapport. Le récipient est repris avec son article
   (het bekerglas, de erlenmeyer), jamais par un pronom. */

LabEngine.addText('statechange', {
  labels: {
    title: 'Kijk hoe het verandert',

    // Page d'accueil (Mission) : toujours la même, rien du tirage ; des gestes, jamais des résultats.
    briefTitle: 'Opdracht: betrap een toestandsverandering op heterdaad',
    briefTask: 'Op je labotafel gaat een stof van toestand veranderen. Je volgt ze minuut na minuut, met een thermometer en een balans.',
    briefSteps: [
      '<strong>Schets</strong> de temperatuurcurve. <strong>Gok</strong> op de massa.',
      '<strong>Weeg</strong>. <strong>Lees</strong> elke minuut de thermometer af. <strong>Weeg</strong> opnieuw.',
      '<strong>Beantwoord</strong> de twee vragen. Had je gelijk?'
    ],
    // Sous chaque phrase courte : le comment, en une phrase (jamais le résultat).
    briefDetails: [
      'Tik voor elk deel van de curve op een pijl.',
      'Schrijf elke temperatuur en de toestand in je tabel: de grafiek tekent zichzelf. Jij beslist of je het recipiënt afsluit.',
      'Gebruik je grafiek en je twee massa’s.'
    ],
    briefQuestion: 'Wat gebeurt er met een stof tijdens een toestandsverandering?',

    // Masse au dixième, avec le séparateur décimal de la langue.
    num: v => v.toFixed(1).replace('.', ','),
    // Température au degré, avec le signe moins typographique.
    deg: v => (v < 0 ? '−' : '') + Math.abs(v),
    units: { c: '°C', g: 'g' },

    yourQuestion: 'Jouw onderzoeksvraag',
    bigQuestion: 'Wat gebeurt er met een stof tijdens een toestandsverandering?',
    // Deux sous-questions (a, b), selon la situation tirée.
    subQuestions: {
      iceMelt: ['Hoe verandert de temperatuur terwijl het ijs smelt?', 'Hoe verandert de massa?'],
      waterFreeze: ['Hoe verandert de temperatuur terwijl het water bevriest?', 'Hoe verandert de massa?'],
      waterBoil: ['Hoe verandert de temperatuur terwijl het water kookt?', 'Hoe verandert de massa?'],
      acidMelt: ['Hoe verandert de temperatuur terwijl het stearinezuur smelt?', 'Hoe verandert de massa?'],
      acidFreeze: ['Hoe verandert de temperatuur terwijl het stearinezuur stolt?', 'Hoe verandert de massa?']
    },
    todayTitle: 'Jouw experiment',
    // t : température de départ, déjà écrite (labels.deg).
    situations: {
      iceMelt: t => `Je hebt gemalen ijs van ${t} °C in een bekerglas. Je verwarmt het op een verwarmplaat.`,
      waterFreeze: t => `Je hebt water van ${t} °C in een bekerglas. Je koelt het af in een bad van ijs en zout (ongeveer −15 °C).`,
      waterBoil: t => `Je hebt water van ${t} °C in een erlenmeyer. Je verwarmt het op een verwarmplaat.`,
      acidMelt: t => `Je hebt vast stearinezuur (een soort kaarsvet) van ${t} °C in een bekerglas. Je verwarmt het in een warmwaterbad (90 °C).`,
      acidFreeze: t => `Je hebt vloeibaar stearinezuur (een soort kaarsvet) van ${t} °C in een bekerglas. Je laat het afkoelen in de lucht van het lokaal (21 °C).`
    },

    hypothesisTitle: 'Jouw hypothese',
    hypCurve: 'Schets de temperatuurcurve: tik voor elk deel op een pijl.',
    hypBet: 'Jouw gok: op het einde toont de balans…',
    // Les tronçons de la courbe, selon la situation.
    zoneNames: {
      iceMelt: ['alleen ijs', 'ijs en water samen', 'alleen water'],
      waterFreeze: ['alleen water', 'water en ijs samen', 'alleen ijs'],
      waterBoil: ['het water warmt op', 'het water kookt'],
      acidMelt: ['alles vast', 'vast en vloeibaar samen', 'alles vloeibaar'],
      acidFreeze: ['alles vloeibaar', 'vloeibaar en vast samen', 'alles vast']
    },
    slopes: { up: 'stijgt', flat: 'blijft gelijk', down: 'daalt' },
    bets: { more: 'meer massa', same: 'dezelfde massa', less: 'minder massa' },
    sketchX: 'tijd',
    sketchY: 'temperatuur',
    because: 'Waarom denk je dat? (niet verplicht)',
    becausePlaceholder: 'Omdat…',
    hypothesisReady: 'Je hypothese is klaar.',
    hypothesisPending: 'Schets de curve en doe je gok.',
    toBench: 'Verder: het experiment',

    // Noms repris dans les phrases : forme avec article, et lieu (« op de verwarmplaat »).
    vessels: {
      beaker: { name: 'bekerglas', the: 'het bekerglas' },
      flask: { name: 'erlenmeyer', the: 'de erlenmeyer' }
    },
    devices: {
      hotplate: { name: 'verwarmplaat', onto: 'op de verwarmplaat' },
      icebath: { name: 'bad van ijs en zout', onto: 'in het bad van ijs en zout' },
      waterbath: { name: 'warmwaterbad', onto: 'in het warmwaterbad' },
      mat: { name: 'kurken onderzetter', onto: 'op de kurken onderzetter' }
    },
    tools: { probe: 'thermometer', film: 'huishoudfolie', balloon: 'ballon', balance: 'balans' },
    substances: { water: 'water', stearic: 'stearinezuur' },
    states: { solid: 'vast', solidLiquid: 'vast + vloeibaar', liquid: 'vloeibaar', liquidGas: 'vloeibaar + gas' },
    choose: 'kies',

    lockHypothesis: 'Schets eerst elk deel van de curve en doe je gok.',
    lockHypothesisFixed: 'Je hypothese kan niet meer veranderen: het experiment is begonnen. Een wetenschapper verandert de hypothese niet na het zien van de resultaten!',
    lockNotStarted: 'Voer eerst het experiment uit.',
    lockRun: 'Werk eerst het experiment af: elke lijn van de tabel en de twee massa’s.',
    lockDevice: 'Zet het recipiënt eerst op de balans en schrijf de beginmassa op.',
    lockVesselRunning: 'Het experiment loopt: verplaats het recipiënt niet.',
    lockProbeOut: 'Haal eerst de thermometer eruit: tik erop.',
    lockProbeKeep: 'Laat de thermometer erin: je hebt hem nodig tot het einde.',
    lockProbeOver: 'Het experiment is afgelopen: je hebt de thermometer niet meer nodig.',
    lockProbeStart: 'Weeg eerst, en tik dan op “Start de metingen”.',
    lockStartMass: 'Weeg eerst het recipiënt en schrijf de beginmassa op.',
    lockStartDevice: (the, onto) => `Zet eerst ${the} ${onto}.`,
    lockCover: 'Te laat om dit te veranderen: het recipiënt staat niet meer op de balans.',
    lockMassStart: 'Zet het recipiënt eerst op de balans.',
    lockMassFixed: 'Het recipiënt staat niet meer op de balans: je kunt deze massa niet meer aflezen.',
    lockMassEnd: 'Zet het recipiënt op het einde van het experiment terug op de balans.',
    lockRow: 'Zet het recipiënt eerst op zijn plaats, met de thermometer erin.',
    lockTickSetup: 'Steek eerst de thermometer in het recipiënt.',
    lockTickRow: 'Schrijf eerst de temperatuur en de toestand voor deze minuut op.',
    lockRedo: 'Je bent al één keer opnieuw begonnen.',

    tick: '1 minuut',
    tickSetup: 'Eerst de thermometer',
    phases: ['Wegen', 'Meten', 'Opnieuw wegen'],
    startMeasure: 'Start de metingen',
    startMeasureSub: 'Het recipiënt blijft staan',
    tickRow: 'Vul eerst de lijn in',
    tickReady: 'Klaar: laat de tijd lopen!',
    timeUp: 'De tijd is om',
    timeUpSub: 'Het experiment stopt.',
    timerInfo: n => `Experiment: ${n} minuten`,

    notesTitle: 'Jouw notities',
    massNames: { start: 'Beginmassa', end: 'Eindmassa' },
    massAria: { start: 'Beginmassa, in gram', end: 'Eindmassa, in gram' },
    tableTime: 'Tijd (min)',
    tableTemp: 'Temp. (°C)',
    tableState: 'Toestand',
    tempAria: 'Temperatuur voor deze minuut, in °C',
    stateAria: 'Toestand voor deze minuut',
    graphTitle: 'Jouw grafiek',
    axisX: 'Tijd (min)',
    axisY: 'Temperatuur (°C)',

    // the : le récipient avec son article ; onto : le lieu (labels.devices).
    captionStart: the => `Zet ${the} op de balans: tik erop, en tik dan op de balans.`,
    captionMassStart: 'Lees de balans af en schrijf de beginmassa in je notities.',
    captionToDevice: (the, onto) => `Zet nu ${the} ${onto}.`,
    captionProbe: the => `Neem de thermometer en steek hem in ${the}.`,
    captionReady: the => `Klaar? Tik op “Start de metingen”. Tot dan kun je ${the} nog terugzetten op de balans.`,
    captionRow0: 'Minuut 0: lees de thermometer af. Schrijf de temperatuur en de toestand in de tabel.',
    captionRow: 'Lees de thermometer af. Schrijf de temperatuur en de toestand voor deze minuut op.',
    captionTick: 'Lijn volledig. Druk op “1 minuut” om de tijd te laten lopen.',
    captionRunning: 'Er gaat een minuut voorbij…',
    captionProbeOut: 'De tijd is om. Haal de thermometer eruit: tik erop.',
    captionWeighEnd: the => `Zet ${the} terug op de balans.`,
    captionMassEnd: 'Lees de balans af en schrijf de eindmassa in je notities.',
    captionDone: 'Het experiment is afgelopen. Bekijk je grafiek en ga dan verder naar het besluit.',
    captionCoverChanged: 'Je hebt veranderd wat op de balans staat: de massa is niet meer dezelfde. Schrijf de nieuwe massa op.',
    captionBadTemp: 'Schrijf de temperatuur die de thermometer toont, in °C (bijvoorbeeld 12 of −3).',
    captionBadMass: 'Schrijf de massa die de balans toont, in gram (bijvoorbeeld 187,4).',
    captionHoldVessel: 'Tik nu op de plaats waar je dit wilt zetten.',
    captionHoldProbe: the => `Tik nu op ${the} om de thermometer erin te steken.`,
    captionTakeFirst: the => `Neem eerst ${the}: tik erop, en tik dan op de plaats waar je dit wilt zetten.`,

    runSetup: 'Zet je experiment klaar.',
    runInfo: (m, n) => `Minuut ${m} van ${n}`,
    missingRun: 'Er ontbreekt nog iets: kijk naar de rode vakjes.',
    redo: 'Het experiment opnieuw beginnen',
    redoTitle: 'Het experiment opnieuw beginnen?',
    redoText: 'Je metingen worden gewist. Je hypothese blijft. Dit kan maar één keer.',
    redoYes: 'Ja, opnieuw beginnen',
    toConclude: 'Verder: besluiten',
    backToLab: 'Terug naar het labo',
    checkConclusions: 'Mijn besluiten controleren',

    resultsTitle: 'Jouw resultaten',
    // a, b : masses déjà écrites avec leur unité, ou un tiret.
    massRecap: (a, b) => `Beginmassa: ${a} · Eindmassa: ${b}`,
    // Chaque phrase reçoit sa liste (ou sa case) ; dans la correction, le bon mot.
    concl: {
      during: {
        iceMelt: sel => `Terwijl het ijs smolt, is de temperatuur ${sel}.`,
        waterFreeze: sel => `Terwijl het water bevroor, is de temperatuur ${sel}.`,
        waterBoil: sel => `Terwijl het water kookte, is de temperatuur ${sel}.`,
        acidMelt: sel => `Terwijl het stearinezuur smolt, is de temperatuur ${sel}.`,
        acidFreeze: sel => `Terwijl het stearinezuur stolde, is de temperatuur ${sel}.`
      },
      point: (input, sel, substance) => `Tijdens deze toestandsverandering toonde de thermometer ${input} °C. Deze temperatuur is het ${sel} van ${substance}.`,
      mass: sel => `Op het einde toonde de balans ${sel} bij het begin.`,
      particles: sel => `Het aantal deeltjes in het recipiënt is ${sel}.`
    },
    duringWords: { up: 'gestegen', same: 'gelijk gebleven', down: 'gedaald' },
    pointNames: { melting: 'smeltpunt', boiling: 'kookpunt' },
    massWords: { more: 'meer dan', same: 'dezelfde massa als', less: 'minder dan' },
    particleWords: { up: 'gestegen', same: 'gelijk gebleven', down: 'gedaald' },
    duringAria: 'Wat de temperatuur deed tijdens de toestandsverandering',
    conclTempAria: 'Temperatuur tijdens de toestandsverandering, in °C',
    pointAria: 'Naam van deze temperatuur',
    massWordAria: 'De massa op het einde, vergeleken met het begin',
    particlesAria: 'Wat het aantal deeltjes deed',
    verdictCurve: 'Mijn schets van de curve is',
    verdictBet: 'Mijn gok over de massa is',
    confirmed: 'bevestigd',
    rejected: 'verworpen',
    yourSketch: 'Jouw schets',
    realCurve: 'Wat de thermometer toonde',
    yourBet: bet => `Jouw gok: ${bet}.`,

    scoreLabel: 'controles geslaagd',
    markCorrect: 'juist',
    markIncorrect: 'fout',
    criteria: { measure: 'Metingen', closed: 'Niets erin, niets eruit', plateau: 'De temperatuur', mass: 'De massa', verdict: 'Hypothese' },
    criteriaSub: { measure: 'Je tabel en je massa’s', closed: 'Je recipiënt', plateau: 'Je antwoord op vraag a', mass: 'Je antwoord op vraag b', verdict: 'Je oordeel' },
    legendYours: 'jouw notities',
    legendReading: 'wat de thermometer toonde',

    report: {
      title: 'Laboverslag — Temperatuur en massa tijdens een toestandsverandering',
      because: 'Omdat',
      hypZone: (zone, slope) => `${zone}: de temperatuur ${slope}`,
      hypBet: bet => `Op het einde zal de balans ${bet} tonen.`,
      materials: {
        iceMelt: 'Een bekerglas met gemalen ijs, een verwarmplaat, een digitale thermometer, een balans, een chronometer',
        waterFreeze: 'Een bekerglas met water, een bad van ijs en zout, een digitale thermometer, een balans, een chronometer',
        waterBoil: 'Een erlenmeyer met water, een verwarmplaat, een digitale thermometer, een balans, een chronometer',
        acidMelt: 'Een bekerglas met vast stearinezuur, een warmwaterbad op een verwarmplaat, een digitale thermometer, een balans, een chronometer',
        acidFreeze: 'Een bekerglas met vloeibaar stearinezuur, een kurken onderzetter, een digitale thermometer, een balans, een chronometer'
      },
      coverItem: { film: 'huishoudfolie', balloon: 'een ballon' },
      materialsLine: (base, cover) => `${base}${cover ? ', ' + cover : ''}.`,
      stepCover: { film: 'Sluit het bekerglas af met huishoudfolie.', balloon: 'Sluit de erlenmeyer af met een ballon.' },
      stepOpen: { film: 'Laat het bekerglas open.', balloon: 'Laat de erlenmeyer open.' },
      stepWeigh: the => `Zet ${the} op de balans. Schrijf de beginmassa op.`,
      stepPlace: (the, onto) => `Zet ${the} ${onto}. Steek de thermometer erin. Schrijf de temperatuur en de toestand op 0 minuten op.`,
      stepRead: n => `Start de chronometer. Schrijf elke minuut, ${n} minuten lang, de temperatuur en de toestand op.`,
      stepEnd: the => `Haal de thermometer eruit. Zet ${the} terug op de balans. Schrijf de eindmassa op.`,
      stepGraph: 'Teken de grafiek van de temperatuur in functie van de tijd.',
      masses: (a, b) => `Beginmassa: ${a} · Eindmassa: ${b}`,
      verdict: (text, word) => `${text} ${word}.`,
      score: (n, total) => `Score: ${n} / ${total} controles geslaagd.`
    }
  },

  glossary: {
    toestandsverandering: "changement d'état", toestand: 'état', 'thermische energie': 'énergie thermique',
    smelt: 'fond', smolt: 'fondait', smelten: 'fusion (fondre)', smeltpunt: 'point de fusion',
    bevriest: 'gèle', bevroor: 'gelait', stolt: 'se solidifie', stolde: 'se solidifiait', stollen: 'solidification (se solidifier)',
    kookt: 'bout', kookte: 'bouillait', koken: 'ébullition (bouillir)', kookpunt: "point d'ébullition",
    'warmt op': 'chauffe', verwarmt: 'chauffes', koelt: 'refroidis', afkoelen: 'refroidir',
    bekerglas: 'bécher', verwarmplaat: 'plaque chauffante', warmwaterbad: 'bain-marie', zout: 'sel',
    'kurken onderzetter': 'dessous-de-plat en liège', huishoudfolie: 'film étirable',
    ijs: 'glace', 'gemalen ijs': 'glace pilée', kaarsvet: 'cire de bougie', stearinezuur: 'acide stéarique',
    lucht: 'air', weeg: 'pèse', afsluit: 'fermes',
    schets: 'esquisse (dessin rapide)', gok: 'pari', tabel: 'tableau',
    stijgt: 'augmente', daalt: 'diminue', 'blijft gelijk': 'reste pareil',
    gestegen: 'a augmenté', gedaald: 'a diminué', 'gelijk gebleven': 'resté pareil',
    beginmassa: 'masse de départ', eindmassa: 'masse finale',
    vast: 'solide', vloeibaar: 'liquide', vloeistof: 'liquide', 'vaste stof': 'solide',
    bindingen: 'liaisons', deeltjes: 'particules', waterdamp: "vapeur d'eau",
    warmtebron: 'source de chaleur', omgeving: 'ce qui l’entoure'
  },

  // Étape Check : ce qui se passe au niveau des particules.
  explanations: {
    energy: {
      melt: 'De warmtebron geeft de hele tijd thermische energie. Voor en na het smelten doet die energie de deeltjes sneller bewegen: de temperatuur stijgt. Tijdens het smelten breekt ze de bindingen tussen de deeltjes: ze bewegen niet sneller, dus de temperatuur blijft gelijk. Het vlakke deel van de grafiek heet een plateau.',
      freeze: 'De stof geeft de hele tijd thermische energie af aan haar koudere omgeving. Voor en na het stollen bewegen haar deeltjes trager: de temperatuur daalt. Tijdens het stollen ontstaan er nieuwe bindingen tussen de deeltjes: ze vertragen niet, dus de temperatuur blijft gelijk. Het vlakke deel van de grafiek heet een plateau.',
      boil: 'De verwarmplaat geeft de hele tijd thermische energie. Voor het koken doet die energie de deeltjes sneller bewegen: de temperatuur stijgt. Tijdens het koken breekt ze de bindingen tussen de deeltjes, die de vloeistof als gas verlaten: ze bewegen niet sneller, dus de temperatuur blijft gelijk. Het vlakke deel van de grafiek heet een plateau.'
    },
    fixed: {
      iceMelt: 'IJs van zuiver water smelt altijd bij 0 °C: dat is het smeltpunt van water.',
      waterFreeze: 'Water bevriest bij dezelfde temperatuur als waarbij ijs smelt: 0 °C, het smeltpunt van water.',
      waterBoil: 'Zuiver water kookt altijd bij 100 °C (op zeeniveau): dat is zijn kookpunt.',
      acidMelt: 'Elke zuivere stof heeft haar eigen smeltpunt: 69 °C voor stearinezuur, 0 °C voor water.',
      acidFreeze: 'Een vloeistof stolt bij dezelfde temperatuur als waarbij de vaste stof smelt: 69 °C voor stearinezuur. Elke zuivere stof heeft haar eigen smeltpunt.'
    },
    mass: {
      same: 'Tijdens een toestandsverandering wordt geen enkel deeltje gemaakt of vernietigd: het aantal deeltjes blijft gelijk, dus de massa blijft gelijk. Alleen de bindingen tussen de deeltjes veranderen.',
      lost: 'Het water is niet verdwenen: de ontbrekende grammen zijn waterdeeltjes die de open erlenmeyer als waterdamp verlaten hebben. Tijdens een toestandsverandering wordt geen enkel deeltje gemaakt of vernietigd. In een gesloten recipiënt blijft de massa gelijk.'
    }
  },

  // m : minute ; v : ce que l'élève a noté (null si rien) ; r : la vraie
  // valeur ; les nombres sont déjà écrits (labels.num, labels.deg).
  check: {
    noExperiment: 'Je hebt het experiment niet uitgevoerd: er zijn geen metingen.',
    measureScore: (good, total) => `${good} / ${total} metingen juist genoteerd.`,
    measureAllGood: 'Al je metingen kloppen met de thermometer, het recipiënt en de balans. Goed afgelezen!',
    tempMiss: (m, v, r) => v == null ? `Minuut ${m}: geen temperatuur genoteerd (de thermometer toonde ${r} °C).` : `Minuut ${m}: je schreef ${v} °C, de thermometer toonde ${r} °C.`,
    stateMiss: (m, v, r) => v == null ? `Minuut ${m}: geen toestand genoteerd (het was “${r}”).` : `Minuut ${m}: je schreef “${v}”, het was “${r}”.`,
    massMiss: (name, v, r) => v == null ? `${name}: niets genoteerd (de balans toonde ${r} g).` : `${name}: je schreef ${v} g, de balans toonde ${r} g.`,
    more: n => `… en nog ${n}.`,
    closedOk: {
      film: 'Je hebt het bekerglas afgesloten met huishoudfolie: er kon niets in of uit. De balans vergelijkt dezelfde materie voor en na.',
      balloon: 'Je hebt de erlenmeyer afgesloten met een ballon: de waterdamp bleef binnen. De balans vergelijkt dezelfde materie voor en na.'
    },
    openBoil: g => `Je hebt de erlenmeyer open gelaten. De waterdamp is ontsnapt in het lokaal: de balans verloor ${g} g. Met een ballon op de erlenmeyer blijft de waterdamp binnen en weegt de balans hem nog mee.`,
    openOther: 'Je hebt het bekerglas open gelaten. Hier toonde de balans geen verschil, maar er kon iets in of uit (waterdamp, stofjes uit de lucht). Om de massa voor en na te vergelijken, sluit een wetenschapper het recipiënt af.',
    closedWhy: 'Om te weten of de massa van een stof verandert, mag er tijdens het experiment niets in of uit.',
    answerOk: 'Juist!',
    answerWrong: 'Niet helemaal. Het juiste antwoord:',
    pointTemp: t => `Bekijk je tabel opnieuw: terwijl de twee toestanden samen voorkwamen, bleef de thermometer op ${t} °C staan.`,
    verdictCurve: {
      confirmed: 'Je schets en je besluit tonen dezelfde curve: je hypothese over de curve is bevestigd.',
      rejected: 'Je schets en je besluit tonen niet dezelfde curve: je hypothese over de curve is verworpen.'
    },
    verdictBet: {
      confirmed: 'Je gok en je besluit over de massa zeggen hetzelfde: je gok is bevestigd.',
      rejected: 'Je gok en je besluit over de massa zeggen niet hetzelfde: je gok is verworpen.'
    },
    judgedOk: 'Goed beoordeeld!',
    judgedWrong: 'Je hebt het omgekeerd beoordeeld.',
    yourConclusion: sentence => `Je besluit: ${sentence}`,
    rejectedNote: 'Een verworpen hypothese is geen fout: zo gaat de wetenschap vooruit.'
  }
});
