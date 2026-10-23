/* ===== Labo virtuel « Metal detectives » (chem1) : textes en néerlandais =====

   Simulation commune aux deux filières : js/lab-metals.js, chargée après ce
   fichier. Mêmes clés que l'anglais (en/year1/chem1/lab-metals.en.js), seul
   le lexique (glossary) a ses propres mots.

   [mot] ou [mot|clé] : mot du lexique, souligné, traduction française au
   survol ou au toucher (clé dans glossary, en minuscules). Termes repris du
   chapitre (vocabulary.json, jeux) : staal/stalen, glans, kneedbaarheid,
   elektrische et thermische geleidbaarheid, elektrisch circuit. */

LabEngine.addText('metals', {
  labels: {
    title: 'Metaaldetectives',

    predictIntro: 'Bekijk elk [staal] aandachtig. Denk je, nog vóór de testen, dat het een metaal is?',
    predictMetal: 'Metaal',
    predictNot: 'Geen metaal',
    predictUnsure: 'Niet zeker',
    predictCount: (n, total) => `${n} / ${total} hypotheses`,
    startTesting: 'Start de testen',

    trayTitle: 'Stalen',
    trayItem: (id, n, total) => `Staal ${id}, ${n} van ${total} waarnemingen`,
    notebookTitle: (id) => `Schrift — staal ${id}`,
    notebookEmpty: 'Leg een [staal] op de [labotafel] om het schrift in te vullen.',
    notebookLocked: 'Doe eerst de test',
    lockTests: n => `Werk eerst je testen af: nog ${n} ${n === 1 ? 'waarneming' : 'waarnemingen'} te noteren in het schrift.`,
    lockHypothesesFixed: 'Je hypotheses liggen vast: de testen zijn begonnen. Een wetenschapper verandert de hypothese niet na het zien van de resultaten!',
    lockNotebook: 'Doe eerst deze test: sleep het hulpmiddel naar het staal.',
    lockWhichMetal: 'Zeg eerst of het een metaal is.',
    lockNotMetal: 'Je zei dat het geen metaal is: er valt niets te kiezen.',
    sceneEmpty: 'Sleep een staal hierheen',
    sceneEmptySub: 'of tik op een staal in de bak',
    captionEmpty: 'Kies een [staal] in de bak en leg het op de [labotafel].',
    captionReady: (id) => `[Staal] ${id} ligt op de [labotafel]. Sleep er een [hulpmiddel] naartoe, of tik op een hulpmiddel.`,
    captionNeedSample: 'Leg eerst een [staal] op de [labotafel].',
    captionRecord: ' Noteer nu in het [schrift] wat je waargenomen hebt.',
    speedUp: 'Sneller',
    observations: (n, total) => `${n} / ${total} waarnemingen genoteerd`,
    resultsTable: 'Resultatentabel',
    toConclude: 'Verder: besluiten',

    // Descriptions des scènes pour les lecteurs d'écran, textes dessinés.
    scene: {
      empty: 'Lege labotafel',
      base: id => `Staal ${id} op de labotafel`,
      luster: id => `Test met schuurpapier op staal ${id}`,
      magnet: id => `Test met de magneet op staal ${id}`,
      electric: id => `Test met het elektrisch circuit op staal ${id}`,
      heat: id => `Test met heet water op staal ${id}`,
      hammer: id => `Test met de hamer op staal ${id}`
    },
    poleNorth: 'N',
    poleSouth: 'Z',
    battery: '4,5 V',
    stopwatch: 'CHRONOMETER',

    concludeIntro: 'Gebruik je resultaten om te beslissen. Is elk [staal] een metaal? Zo ja, welk metaal is het?',
    colSample: 'Staal',
    colMetal: 'Metaal?',
    colWhich: 'Welk metaal?',
    yes: 'Ja',
    no: 'Nee',
    choose: 'Kies…',
    backToLab: 'Terug naar het labo',
    referenceSheet: 'Referentiefiche metalen',
    checkConclusions: 'Mijn besluiten controleren',
    notRecorded: '—',

    scoreLabel: 'juiste identificaties',
    hypothesesLabel: (n, total) => `${n} / ${total} hypotheses bevestigd`,
    colYourAnswer: 'Jouw antwoord',
    colCorrect: 'Juiste antwoord',
    markCorrect: 'juist',
    markIncorrect: 'fout',
    notMetal: 'Geen metaal',
    youPredicted: 'Jouw hypothese',
    hypothesisConfirmed: 'bevestigd',
    hypothesisRejected: 'verworpen',
    hypothesisNone: 'geen hypothese',
    notebookCheck: 'Jouw schrift',
    youWrote: 'Jij schreef',
    expected: 'Verwacht',

    refTitle: 'Referentiefiche metalen',
    refIntro: 'Hoe de vijf metalen van het labo eruitzien na het [schuren], en hoe ze reageren op twee van de testen.',
    refColMetal: 'Metaal',
    refColColour: 'Kleur van de [geschuurde plek]',
    refColMagnet: 'Magneet',
    refColHeat: '[Het kaarsvet smelt]…',
    tableTitle: 'Resultatentabel',
    tableIntro: 'Alles wat je in het [schrift] noteerde, voor alle stalen.',

    tests: {
      luster: { tool: 'Schuurpapier', name: 'Glans', question: 'Hoe ziet de [geschuurde plek] eruit?' },
      magnet: { tool: 'Magneet', name: 'Magnetisme', question: 'Wordt het aangetrokken door de [magneet]?' },
      electric: { tool: 'Circuit', name: 'Elektrische geleidbaarheid', question: 'Laat het elektriciteit door?' },
      heat: { tool: 'Heet water', name: 'Thermische geleidbaarheid', question: 'Wanneer [smelt het kaarsvet]?' },
      hammer: { tool: 'Hamer', name: 'Kneedbaarheid', question: 'Verandert het van vorm zonder te breken?' }
    },
    options: {
      shiny: 'Glanzend', dull: 'Dof',
      attracted: 'Aangetrokken', notAttracted: 'Niet aangetrokken',
      conducts: 'Geleidt', notConducts: 'Geleidt niet',
      heatVeryFast: '< 45 s', heatFast: '45 s–1:30', heatSlow: '> 1:30', heatNone: 'Smelt niet',
      malleable: 'Kneedbaar', notMalleable: 'Niet kneedbaar'
    },
    metals: { iron: 'IJzer', copper: 'Koper', aluminium: 'Aluminium', gold: 'Goud', silver: 'Zilver' },

    report: {
      title: 'Laboratoriumverslag — Metalen herkennen',
      question: (range) => `Welke van de stalen (${range}) zijn metalen? En welk metaal is het telkens?`,
      range: (first, last) => `${first} tot ${last}`,
      hypothesisIntro: 'Vóór de testen bekeek ik elk staal en voorspelde ik:',
      materials: (n, range) => `${n} stalen met dezelfde vorm (${range}), schuurpapier, een magneet, een elektrisch circuit (batterij, lampje, draden, 2 klemmen), een bekerglas met heet water op een verwarmingsplaat, een statief, kaarsvet, een chronometer, een hamer, 2 houten blokjes.`,
      procedure: [
        'Wrijf met schuurpapier over het staal en bekijk de geschuurde plek.',
        'Breng de magneet dicht bij het staal.',
        'Sluit het staal aan op het elektrisch circuit en kijk naar het lampje.',
        'Dompel één uiteinde van het staal in heet water, leg kaarsvet op het andere uiteinde en meet hoelang het duurt tot het kaarsvet smelt.',
        'Leg het staal op twee houten blokjes, sla erop met de hamer en bekijk de vorm.',
        'Herhaal stap 1 tot 5 voor elk staal en noteer de resultaten in een tabel.'
      ],
      heatNote: 'Thermische geleidbaarheid: tijd tot het kaarsvet smelt.',
      isMetal: (metal) => `een metaal (${metal})`,
      isNotMetal: 'geen metaal',
      interpretationLine: (id, hyp, concl, verdict) => `Staal ${id}: ik voorspelde “${hyp}”. Mijn resultaten tonen “${concl}”. Hypothese ${verdict}.`,
      interpretationUnsure: (id, concl) => `Staal ${id}: vóór de testen was ik niet zeker. Mijn resultaten tonen “${concl}”.`,
      conclusionMetals: (list) => `De metalen zijn: ${list}.`,
      conclusionNone: 'Ik heb geen enkel metaal herkend.',
      conclusionNot: (list) => `Deze stalen zijn geen metalen: ${list}.`,
      score: (n, total) => `Score: ${n} / ${total} juiste identificaties.`,
      noteObs: (id, test, wrote, exp) => `Staal ${id}, ${test}: je schreef “${wrote}”, de juiste waarneming is “${exp}”.`,
      noteMetal: (id, metal) => `Staal ${id} is een metaal: ${metal}.`,
      noteNotMetal: (id, what) => `Staal ${id} is geen metaal: het is ${what}.`
    }
  },

  glossary: {
    staal: 'échantillon', labotafel: 'paillasse', hulpmiddel: 'outil',
    schuurpapier: 'papier de verre', schuren: 'ponçage', 'geschuurde plek': 'zone poncée',
    magneet: 'aimant', klemmen: 'pinces',
    'het lampje gaat branden': 'l’ampoule s’allume', 'het lampje blijft uit': 'l’ampoule reste éteinte',
    kaarsvet: 'cire', 'het kaarsvet smelt': 'la cire fond',
    'smelt het kaarsvet': 'la cire fond-elle', 'is het kaarsvet nog altijd niet gesmolten': 'la cire n’a toujours pas fondu',
    'hangt in het hete water': 'trempe dans l’eau chaude',
    hamer: 'marteau', schrift: 'cahier',
    verf: 'peinture', gekrast: 'rayé', troebel: 'trouble',
    zaagsel: 'sciure', 'barst en breekt': 'se fissure et se casse', 'spat uiteen': 'vole en éclats', splijt: 'se fend',
    'de hamer veert terug': 'le marteau rebondit',
    buigt: 'se plie', schilfertjes: 'éclats', aangeslagen: 'terni'
  },

  // Nom de chaque matériau (correction, rapport, tableau de bord).
  materials: {
    copper: 'Koper',
    iron: 'IJzer',
    aluminium: 'Aluminium',
    gold: 'Goud',
    silver: 'Zilver',
    plasticGold: 'Goudkleurig geverfd plastic',
    plasticSilver: 'Zilverkleurig geverfd plastic',
    glass: 'Spiegelglas',
    wood: 'Hout',
    granite: 'Graniet (een rots)'
  },

  // Observation décrite, jamais interprétée : c'est à l'élève de nommer la
  // propriété dans son carnet.
  captions: {
    luster: {
      copper: 'Onder het bruine, [aangeslagen] oppervlak is de [geschuurde plek] oranjeroze en weerkaatst ze het licht sterk.',
      iron: 'Onder het donkergrijze oppervlak is de [geschuurde plek] zilvergrijs en weerkaatst ze het licht sterk.',
      aluminium: 'Onder het doffe grijze oppervlak is de [geschuurde plek] lichtgrijs en weerkaatst ze het licht sterk.',
      gold: 'De [geschuurde plek] blijft geel en weerkaatst het licht sterk.',
      silver: 'De [geschuurde plek] is helder wit en weerkaatst het licht sterk.',
      plasticGold: 'De gele [verf] gaat eraf. Daaronder is het materiaal wit en weerkaatst het geen licht.',
      plasticSilver: 'De zilverkleurige [verf] gaat eraf. Daaronder is het materiaal crèmewit en weerkaatst het geen licht.',
      glass: 'Het oppervlak raakt [gekrast] en wordt [troebel]. De [geschuurde plek] weerkaatst geen licht meer.',
      wood: 'Er valt fijn [zaagsel]. De [geschuurde plek] is lichtbruin en weerkaatst geen licht.',
      granite: 'De rots is erg hard: ze raakt amper [gekrast]. Ze blijft gespikkeld en weerkaatst geen licht.'
    },
    // IJzer, koper, aluminium zonder laagje: al glanzend vóór het schuren.
    lusterClean: {
      copper: 'Het oppervlak is al oranjeroze en weerkaatst het licht sterk. De [geschuurde plek] ziet er hetzelfde uit.',
      iron: 'Het oppervlak is al zilvergrijs en weerkaatst het licht sterk. De [geschuurde plek] ziet er hetzelfde uit.',
      aluminium: 'Het oppervlak is al lichtgrijs en weerkaatst het licht sterk. De [geschuurde plek] ziet er hetzelfde uit.'
    },
    lusterRunning: 'Het [schuurpapier] wrijft over het oppervlak van het staafje…',
    magnetRunning: 'De [magneet] komt dichter bij het staafje…',
    magnetYes: 'Het staafje springt omhoog en blijft aan de [magneet] hangen.',
    magnetNo: 'Er gebeurt niets: het staafje blijft op de [labotafel] liggen.',
    electricRunning: 'De twee [klemmen] worden aan de uiteinden van het staafje vastgemaakt…',
    electricYes: '[Het lampje gaat branden].',
    electricNo: '[Het lampje blijft uit].',
    heatMelted: (t) => `[Het kaarsvet smelt] na <strong>${t}</strong> (kijk naar de chronometer).`,
    heatNot: 'Na <strong>5:00</strong> [is het kaarsvet nog altijd niet gesmolten].',
    heatRunning: 'De onderkant van het staafje [hangt in het hete water]. Let op het [kaarsvet] bovenaan…',
    hammerRunning: 'De [hamer] slaat op het midden van het staafje…',
    hammer: {
      dent: 'Het staafje [buigt] waar de [hamer] het raakte. Het verandert van vorm, maar het breekt niet.',
      dentSmall: 'Het staafje [buigt] een beetje waar de [hamer] het raakte. Het verandert van vorm, maar het breekt niet.',
      crack: 'Het staafje [barst en breekt] in twee stukken.',
      shatter: 'Het staafje [spat uiteen] in scherpe scherven.',
      split: 'Het staafje [splijt] in twee stukken.',
      bounce: '[De hamer veert terug]. Het staafje verandert niet van vorm; er vliegen alleen kleine [schilfertjes] af.'
    }
  },

  explanations: {
    copper: 'Dit is <strong>koper</strong>. Het geschuurde oppervlak is glanzend, het geleidt elektriciteit en warmte heel snel, en het buigt zonder te breken: het is een metaal. Het wordt niet aangetrokken door de magneet, en door zijn oranjeroze kleur verschilt het van de andere metalen.',
    wood: '<strong>Hout</strong> is geen metaal: het blijft dof, het lampje blijft uit, het kaarsvet smelt niet, en het splijt onder de hamer.',
    plasticGold: 'Dit is <strong>goudkleurig geverfd plastic</strong>. Het leek glanzend, maar alleen door de verf: na het schuren is het dof, het geleidt geen elektriciteit en geen warmte, en het barst.',
    iron: 'Dit is <strong>ijzer</strong>, het enige staal dat door de magneet aangetrokken wordt. Het is glanzend na het schuren, geleidt elektriciteit, geleidt warmte (trager dan de andere metalen van het labo) en buigt zonder te breken.',
    glass: 'Dit is <strong>spiegelglas</strong>. Het is erg glanzend, maar het is geen metaal: het geleidt geen elektriciteit en geen warmte, en het spat uiteen onder de hamer. (Een spiegel glanst dankzij een heel dun laagje metaal achter het glas — het glas zelf is geen metaal.)',
    silver: 'Dit is <strong>zilver</strong>: helder wit na het schuren, niet magnetisch, geleidt elektriciteit, buigt zonder te breken, en laat het kaarsvet van allemaal het snelst smelten.',
    granite: '<strong>Graniet</strong> is een rots, geen metaal: het is dof, geleidt geen elektriciteit en geen warmte, en verandert niet van vorm onder de hamer. Je leerde graniet kennen in het deel van het hoofdstuk over rotsen.',
    aluminium: 'Dit is <strong>aluminium</strong>. Het oppervlak was dofgrijs, bedekt met een dun laagje oxide, en leek dus niet op een metaal. Na het schuren is het lichtgrijs en glanzend. Het is niet magnetisch, geleidt elektriciteit en warmte (snel, maar trager dan zilver en koper), en buigt zonder te breken.',
    // Aluminium zonder laagje oxide.
    aluminiumClean: 'Dit is <strong>aluminium</strong>: lichtgrijs en glanzend, al vóór het schuren. Het is niet magnetisch, geleidt elektriciteit en warmte (snel, maar trager dan zilver en koper), en buigt zonder te breken.',
    plasticSilver: 'Dit is <strong>zilverkleurig geverfd plastic</strong>. Door de verf lijkt het op een metaal, maar onder de verf is het dof, het geleidt geen elektriciteit en geen warmte, en het barst.',
    gold: 'Dit is <strong>goud</strong>: geel en glanzend, niet magnetisch, geleidt elektriciteit en warmte, en buigt heel gemakkelijk.'
  },

  // Comparaison avec le sosie (id : sa lettre), ajoutée à l'explication
  // quand les deux échantillons sont présents.
  compare: {
    plasticGold: id => `Vergelijk met staal ${id}, het echte goud: hetzelfde uitzicht, heel andere resultaten. Kijken was niet genoeg!`,
    gold: id => `Vergelijk met staal ${id}, het valse goud.`,
    plasticSilver: id => `Vergelijk met staal ${id}, het echte zilver: hetzelfde uitzicht, heel andere resultaten. Kijken was niet genoeg!`,
    silver: id => `Vergelijk met staal ${id}, het zilverkleurig geverfde plastic.`
  },

  // Fiche de référence : une ligne par métal.
  reference: {
    iron: { colour: 'Zilvergrijs', magnet: 'Aangetrokken', heat: 'Traag (> 1:30)' },
    copper: { colour: 'Oranjeroze', magnet: 'Niet aangetrokken', heat: 'Heel snel (< 45 s)' },
    aluminium: { colour: 'Lichtgrijs', magnet: 'Niet aangetrokken', heat: 'Snel (45 s – 1:30)' },
    gold: { colour: 'Geel', magnet: 'Niet aangetrokken', heat: 'Snel (45 s – 1:30)' },
    silver: { colour: 'Helder wit', magnet: 'Niet aangetrokken', heat: 'Heel snel (< 45 s)' }
  }
});
