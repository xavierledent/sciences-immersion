/* ===== Labo virtuel « Under our feet » (chem1) : textes en néerlandais =====

   Simulation commune aux deux filières : js/lab-soil.js, chargée après ce
   fichier. Mêmes clés que l'anglais (en/year1/chem1/lab-soil.en.js), seul le
   lexique (glossary) a ses propres mots.

   [mot] ou [mot|clé] : mot du lexique, souligné, traduction française au
   survol ou au toucher (clé dans glossary, en minuscules). Termes repris du
   chapitre : bodem, bodemstaal, organisch materiaal, rots, zand, grind,
   reducenten. */

LabEngine.addText('soil', {
  labels: {
    title: 'Onder onze voeten',
    question: 'Waaruit bestaat een [bodemstaal], en verandert de samenstelling [afhankelijk van] de plaats?',
    yourQuestion: 'Jouw onderzoeksvraag',
    yourSamples: 'Jouw twee stalen',
    sample: S => `Staal ${S}`,

    hypothesisTitle: 'Jouw hypothese',
    iThink: 'Ik denk dat',
    hypEnd: 'meer [levende wezens] en organisch materiaal bevat.',
    hypChoices: { A: 'staal A', B: 'staal B', same: 'geen van beide: ze zijn gelijk' },
    because: 'Waarom denk je dat? (niet verplicht)',
    becausePlaceholder: 'Omdat…',
    hypothesisReady: 'Je hypothese is klaar.',
    hypothesisPending: 'Tik op de woorden die je hypothese aanvullen.',
    toExperiment: 'Verder: het experiment',
    lockHypothesis: 'Vul eerst je hypothese aan.',
    lockHypothesisFixed: 'Je hypothese ligt vast: het experiment is begonnen. Een wetenschapper verandert de hypothese niet na het zien van de resultaten!',

    tools: { gloves: 'Handschoenen', spatula: 'Spatel', magnifier: 'Loep', touch: 'Nat of droog?' },
    hypReminder: h => h === 'same'
      ? '<b>Jouw hypothese:</b> beide stalen bevatten ongeveer evenveel [levende wezens] en organisch materiaal.'
      : `<b>Jouw hypothese:</b> staal ${h} bevat meer [levende wezens] en organisch materiaal.`,
    status: { spread: 'Uitgespreid', lens: 'Bekeken met de loep', touch: 'Getest: nat of droog' },
    cats: { living: 'Levende wezens', organic: 'Organisch materiaal', mineral: 'Mineraal materiaal', waste: 'Hoort niet bij de bodem' },
    catHints: { living: 'insecten, wormen, wortels…', organic: 'dode bladeren, hout…', mineral: 'rotsen, steentjes, zand…' },
    water: 'Water / vochtigheid',
    waterHint: 'nat of droog?',
    wd: { wet: 'nat', dry: 'droog' },
    sheetTitle: 'Jouw waarnemingsblad',
    sheetSub: 'vult zich in terwijl je sorteert',
    components: 'Bestanddelen',
    notSoil: list => `Hoort niet bij de bodem: ${list}`,
    inspectEmpty: 'Tik op iets in een [bak] om het [van dichtbij te bekijken]. Heel kleine dingen zie je alleen met de [loep].',
    inBowl: (cat, S) => `In het [schaaltje] “${cat}” van staal ${S}. Sleep het om het te verplaatsen.`,
    sortedInfo: n => n === 0 ? 'Nog niets gesorteerd' : n === 1 ? '1 ding gesorteerd' : `${n} dingen gesorteerd`,
    toConclude: 'Verder: besluiten',
    // « a, b en c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' en ' + names[names.length - 1] : names[0] || '',

    lockGloves: 'Trek eerst je handschoenen aan: je gaat echte aarde aanraken.',
    lockTray: 'Trek je handschoenen aan voor je de aarde aanraakt.',
    lockWd: S => `Test staal ${S} eerst met het hulpmiddel “Nat of droog?”.`,
    missing: {
      gloves: 'Trek eerst je handschoenen aan.',
      spread: S => `Spreid staal ${S} uit met de spatel.`,
      lens: S => `Bekijk staal ${S} met de loep.`,
      sort: S => `Sorteer wat je in staal ${S} vindt in de schaaltjes.`,
      touch: S => `Test staal ${S} met het hulpmiddel “Nat of droog?”.`,
      note: S => `Noteer op je blad of staal ${S} nat of droog is.`
    },

    // thing : l'élément avec son article défini (items.<type>.the).
    caption: {
      start: 'Trek eerst je [handschoenen] aan: je gaat echte aarde aanraken.',
      gloves: 'Je [handschoenen] zijn aan. Neem nu de [spatel] om elk staal in zijn [bak] [uit te spreiden].',
      glovesOn: 'Je [handschoenen] zijn aan.',
      spatula: 'Tik op een [bak] (of sleep de [spatel] erop) om het staal [uit te spreiden].',
      magnifier: 'Tik op een [bak] (of sleep de [loep] erop) om heel kleine dingen te zoeken.',
      touch: 'Tik op een [bak] (of sleep de hand erop) om te voelen of de aarde nat of droog is.',
      noTool: 'Tik op iets in een [bak] om het [van dichtbij te bekijken].',
      heap: S => `Dit is nog een [hoop]. Je moet staal ${S} eerst [uitspreiden] met de [spatel].`,
      spread: S => `Staal ${S} is [uitgespreid]. Bekijk het nu [van dichtbij] met de [loep].`,
      already: S => `Staal ${S} is al [uitgespreid].`,
      scanning: S => `De [loep] gaat over staal ${S}…`,
      lensFound: S => `De [loep] vond heel kleine dingen in staal ${S}. Ze zijn nu groter, met een stippellijn errond: tik erop of sleep ze, zoals de andere.`,
      lensNothing: S => `De [loep] vond niets meer in staal ${S}.`,
      tiny: 'Hier is iets heel kleins. Kijk met de [loep].',
      empty: 'Tik op iets in de [bak] om het [van dichtbij te bekijken], of kies een hulpmiddel.',
      picked: (thing, S) => `Sleep ${thing} nu naar een [schaaltje] van staal ${S}, of tik op het [schaaltje].`,
      sorted: (thing, cat, S) => `Je legde ${thing} in het [schaaltje] “${cat}” van staal ${S}.`,
      wrongSample: S => `Dit komt uit staal ${S}. Gebruik een [schaaltje] van staal ${S}.`,
      tapFirst: 'Tik eerst op iets in een [bak], en dan op een [schaaltje].',
      noteIt: 'Noteer het nu op je blad: nat of droog?',
      done: 'Alles is waargenomen en genoteerd. Je kunt verder naar het besluit.'
    },
    touchText: {
      soil: { wet: 'De aarde [klontert samen] als je erop drukt. Je handschoen wordt donker en koel.', dry: 'De aarde valt uiteen in droge [kruimels]. Je handschoen blijft schoon en droog.' },
      sand: { wet: 'Het zand [klontert samen] en houdt de afdruk van je vingers. Je handschoen is nat.', dry: 'Het zand [loopt tussen je vingers] als stof. Je handschoen blijft droog.' },
      gravel: { wet: 'De steentjes zijn koud en glanzen van het water. Je handschoen is nat.', dry: 'De steentjes en het stof zijn droog en warm. Je handschoen blijft droog.' }
    },

    concludeIntro: 'Gebruik je waarnemingsblad om de vraag te beantwoorden.',
    qCompare: 'Welk staal bevat meer levende wezens en organisch materiaal?',
    compareChoices: { A: 'Staal A', B: 'Staal B', same: 'Allebei evenveel' },
    qLocation: 'Verandert de samenstelling van de bodem afhankelijk van de plaats?',
    locationChoices: { yes: 'Ja, ze verandert', no: 'Nee, ze blijft dezelfde' },
    qVerdict: 'Dus mijn hypothese is',
    confirmed: 'bevestigd',
    rejected: 'verworpen',
    checkConclusions: 'Mijn besluiten controleren',
    backToLab: 'Terug naar het labo',

    scoreLabel: 'controles geslaagd',
    markCorrect: 'juist',
    markIncorrect: 'fout',
    criteria: { sorting: 'Sorteren', observation: 'Waarneming', conclusion: 'Besluit', hypothesis: 'Hypothese' },
    criteriaSub: { sorting: 'Jouw schaaltjes', observation: 'Jouw blad', conclusion: 'Jouw antwoorden', hypothesis: 'Jouw oordeel' },

    report: {
      title: 'Laboratoriumverslag — Waaruit bestaat de bodem?',
      because: 'Omdat',
      hyp: {
        A: 'Ik denk dat staal A meer levende wezens en organisch materiaal bevat dan staal B.',
        B: 'Ik denk dat staal B meer levende wezens en organisch materiaal bevat dan staal A.',
        same: 'Ik denk dat staal A en staal B ongeveer evenveel levende wezens en organisch materiaal bevatten.'
      },
      materials: (a, b) => `Twee bodemstalen in bakken: staal A (${a}) en staal B (${b}), handschoenen, een spatel, een loep, schaaltjes om te sorteren.`,
      procedure: [
        'Trek handschoenen aan.',
        'Spreid elk staal met de spatel uit in zijn bak.',
        'Bekijk elk staal van dichtbij met de loep.',
        'Sorteer wat je vindt in schaaltjes: levende wezens, organisch materiaal, mineraal materiaal, hoort niet bij de bodem.',
        'Raak de aarde aan om te voelen of ze nat of droog is.'
      ],
      found: (S, from, counts) => `In staal ${S} (${from}) vond ik ${counts}.`,
      countsNone: 'niets',
      count: (n, cat) => `${n} ${n === 1 ? { living: 'levend wezen', organic: 'stuk organisch materiaal', mineral: 'stuk mineraal materiaal' }[cat] : { living: 'levende wezens', organic: 'stukken organisch materiaal', mineral: 'stukken mineraal materiaal' }[cat]}`,
      compare: {
        A: 'Staal A bevat dus meer levende wezens en organisch materiaal.',
        B: 'Staal B bevat dus meer levende wezens en organisch materiaal.',
        same: 'Beide stalen bevatten dus ongeveer evenveel levende wezens en organisch materiaal.'
      },
      location: { yes: 'De samenstelling verandert afhankelijk van de plaats.', no: 'De samenstelling verandert niet afhankelijk van de plaats.' },
      verdict: v => `Mijn hypothese is ${v}.`,
      score: n => `Score: ${n} / 4 controles geslaagd.`
    }
  },

  glossary: {
    bodemstaal: 'échantillon de sol', 'afhankelijk van': 'selon',
    bak: 'bac', bakken: 'bacs', handschoenen: 'gants', loep: 'loupe', spatel: 'spatule',
    'uit te spreiden': 'étaler', uitspreiden: 'étaler', uitgespreid: 'étalé', hoop: 'tas', schaaltje: 'coupelle', schaaltjes: 'coupelles',
    'levende wezens': 'êtres vivants', 'van dichtbij te bekijken': 'observer de près', 'van dichtbij': 'de près',
    'krult het zich op': "s'enroule", engerling: 'larve (ver blanc)', scheutje: 'pousse', buigen: 'se plient',
    'brokkelt af': "s'effrite", schors: 'écorce', eikel: 'gland', broos: 'cassantes', glinsteren: 'brillent',
    'klontert samen': "s'agglomère", 'loopt tussen je vingers': 'file entre tes doigts', kruimels: 'miettes',
    regenworm: 'ver de terre', pissebed: 'cloporte', springstaart: 'collembole', mier: 'fourmi', keverlarve: 'larve de coléoptère',
    kever: 'coléoptère (scarabée)', 'fijne worteltjes': 'fines racines', 'dood blad': 'feuille morte', 'dode blad': 'feuille morte',
    takje: 'brindille', eikeldopje: 'cupule de gland', 'droog gras': 'herbe sèche', 'droge gras': 'herbe sèche',
    'stukje schors': "morceau d'écorce", kiezelsteentje: 'caillou', grind: 'gravier', zandkorrels: 'grains de sable',
    'stuk rots': 'morceau de roche', flessendop: 'bouchon', snoeppapiertje: 'emballage de bonbon',
    ribbeltjes: 'stries', verfrommeld: 'froissé',
    schoolbos: "bois de l'école", moestuin: 'potager', weide: 'prairie', speelplaats: 'cour de récréation',
    zandbak: 'bac à sable', grindpad: 'allée de gravier', bouwwerf: 'chantier',
    'bovenste bodemlaag': 'terre de surface', 'vermalen gesteente': 'roches broyées'
  },

  /* Ce qu'on peut trouver dans un bac. name : nom seul (fiche, coupelles,
     rapport) ; a : avec l'article indéfini, the : avec l'article défini
     (phrases, entre crochets pour le lexique) ; plural : nom au pluriel
     (« Ze zijn » plutôt que « Het is »). cap : ce qu'on observe. */
  items: {
    earthworm: { name: 'regenworm', a: 'een [regenworm]', the: 'de [regenworm]', plural: false,
      cap: 'Een lang, zacht, roze dier. Als je het aanraakt, [krult het zich op].' },
    woodlouse: { name: 'pissebed', a: 'een [pissebed]', the: 'de [pissebed]', plural: false,
      cap: 'Een klein grijs diertje met een harde rug uit plaatjes, en veertien pootjes. Het loopt weg van het licht.' },
    ant: { name: 'mier', a: 'een [mier]', the: 'de [mier]', plural: false,
      cap: 'Een heel klein zwart insect met zes poten. Het loopt snel door de [bak].' },
    larva: { name: 'keverlarve', a: 'een [keverlarve]', the: 'de [keverlarve]', plural: false,
      cap: 'Een zachte, witte, gekrulde [engerling] met een bruine kop. Zijn pootjes bewegen langzaam.' },
    springtail: { name: 'springstaart', a: 'een [springstaart]', the: 'de [springstaart]', plural: false,
      cap: 'Een heel klein wit diertje, kleiner dan een rijstkorrel. Het springt als je erop blaast.' },
    roots: { name: 'fijne worteltjes', a: '[fijne worteltjes]', the: 'de [fijne worteltjes]', plural: true,
      cap: 'Dunne witte draadjes aan een klein groen [scheutje]. Ze zijn vers en [buigen] zonder te breken.' },
    beetleDead: { name: 'kever', a: 'een [kever]', the: 'de [kever]', plural: false,
      cap: 'Een zwart insect dat op zijn rug ligt. Het beweegt niet, zelfs niet als je het aanraakt. Zijn lijf is droog en heel licht.' },
    leaf: { name: 'dood blad', a: 'een [dood blad]', the: 'het [dode blad]', plural: false,
      cap: 'Een bruin, droog blad vol gaatjes. Het [brokkelt af] aan de randen.' },
    twig: { name: 'takje', a: 'een [takje]', the: 'het [takje]', plural: false,
      cap: 'Een stukje dood hout. De [schors] gaat er makkelijk af.' },
    acorn: { name: 'eikeldopje', a: 'een [eikeldopje]', the: 'het [eikeldopje]', plural: false,
      cap: 'Het lege dopje van een [eikel]: bruin, droog en hard.' },
    grass: { name: 'droog gras', a: '[droog gras]', the: 'het [droge gras]', plural: false,
      cap: 'Gele, droge grassprieten. Ze zijn plat en [broos].' },
    bark: { name: 'stukje schors', a: 'een [stukje schors]', the: 'het [stukje schors]', plural: false,
      cap: 'Een stukje [schors], donkerbruin en droog. Het breekt in schilfers.' },
    pebble: { name: 'kiezelsteentje', a: 'een [kiezelsteentje]', the: 'het [kiezelsteentje]', plural: false,
      cap: 'Een klein, hard, rond steentje. Als je erop drukt, verandert er niets.' },
    gravel: { name: 'grind', a: '[grind]', the: 'het [grind]', plural: false,
      cap: 'Grijze stukjes steen met scherpe randen.' },
    sand: { name: 'zandkorrels', a: '[zandkorrels]', the: 'de [zandkorrels]', plural: true,
      cap: 'Heel kleine harde korrels, lichtbruin. Sommige [glinsteren] in het licht.' },
    rock: { name: 'stuk rots', a: 'een [stuk rots]', the: 'het [stuk rots]', plural: false,
      cap: 'Een plat stuk rots met scherpe randen. Het is zwaar voor zijn grootte.' },
    cap: { name: 'flessendop', a: 'een [flessendop]', the: 'de [flessendop]', plural: false,
      cap: 'Een rood, glad, licht voorwerp met [ribbeltjes] rondom. Het is van plastic.' },
    wrapper: { name: 'snoeppapiertje', a: 'een [snoeppapiertje]', the: 'het [snoeppapiertje]', plural: false,
      cap: 'Een glanzend, [verfrommeld] stukje dunne plastic folie.' }
  },

  // Les lieux : d'où vient l'échantillon, et pourquoi son sol est riche ou pauvre.
  places: {
    forest: { from: 'uit het [schoolbos]',
      why: 'In een bos vallen elk jaar dode bladeren en hout op de grond, en in de bodem leven veel kleine dieren en reducenten: de bodem is rijk aan organisch materiaal en leven.' },
    garden: { from: 'uit de [moestuin]',
      why: 'Een moestuin krijgt elk jaar plantenresten en compost, en de bodem zit vol wormen en wortels: hij is rijk aan organisch materiaal en leven.' },
    meadow: { from: 'uit de [weide]',
      why: 'In een weide sterft het gras elk jaar af en groeit het terug. De wortels, het dode gras en de kleine dieren maken de bodem rijk aan organisch materiaal en leven.' },
    sandpit: { from: 'uit de [zandbak] van de [speelplaats]',
      why: 'Het zand van een zandbak op de speelplaats komt van [vermalen gesteente]: het is bijna alleen mineraal materiaal, met heel weinig leven.' },
    gravel: { from: 'van het [grindpad]',
      why: 'Een grindpad bestaat uit steentjes en zand die mensen er gelegd hebben: het is vooral mineraal materiaal, bijna zonder leven.' },
    building: { from: 'van de [bouwwerf]',
      why: 'Op een bouwwerf is de [bovenste bodemlaag] weggehaald: wat overblijft, is vooral rots, grind en zand.' }
  },

  // Étape Check : pourquoi un élément va dans telle coupelle.
  why: {
    living: 'Het leeft: het beweegt, voedt zich of groeit. Het is een levend wezen.',
    organic: 'Het komt van een levend wezen, maar het is dood: het is organisch materiaal.',
    mineral: 'Het komt van rotsen: het is mineraal materiaal.',
    waste: 'Het is door mensen gemaakt en hoort niet in de bodem: het is afval.'
  },
  trapWhy: {
    beetleDead: 'De kever beweegt niet, zelfs niet als je hem aanraakt: hij is dood. Een dood dier is organisch materiaal.',
    roots: 'Deze worteltjes zijn vers: ze horen bij een levende plant. Het zijn levende wezens.',
    sand: 'Zandkorrels zijn heel kleine stukjes rots: ze zijn mineraal materiaal.',
    cap: 'Een flessendop is van plastic, door mensen gemaakt: het is afval en hoort niet bij de bodem.',
    wrapper: 'Een snoeppapiertje is van plastic, door mensen gemaakt: het is afval en hoort niet bij de bodem.'
  },

  // thing : l'élément avec son article défini ; things : liste déjà jointe
  // (articles indéfinis) ; one : un seul élément, au singulier.
  check: {
    sortedOk: n => n === 1 ? 'Het ding dat je sorteerde, zit in het juiste schaaltje.' : `De ${n} dingen die je sorteerde, zitten allemaal in het juiste schaaltje.`,
    sortedScore: (good, n) => `${good} / ${n} dingen in het juiste schaaltje.`,
    wrongItem: (thing, S, put, right) => `Staal ${S}: je legde ${thing} in “${put}”, maar het juiste schaaltje is “${right}”.`,
    missedCat: (S, cat, things, tiny, one) => `Staal ${S}: je vond geen ${cat.toLowerCase()}, maar er ${one ? 'zat' : 'zaten'} ${things} in.` +
      (tiny ? ` ${one ? 'Het is' : 'Ze zijn'} heel klein: kijk met de loep.` : ''),
    foundAll: 'Je vond in beide stalen iets van elke soort. Goed waargenomen!',
    humidityOk: (S, v) => `Staal ${S}: je noteerde “${v}”. Juist.`,
    humidityWrong: (S, v, real) => `Staal ${S}: je noteerde “${v}”, maar de aarde was ${real}.`,
    compareRight: S => `Staal ${S} bevat meer levende wezens en organisch materiaal.`,
    compareOk: 'Juist!',
    compareWrong: 'Niet helemaal. Het juiste antwoord:',
    locationOk: 'Ja: twee bodems van twee plaatsen bevatten niet dezelfde dingen.',
    locationWrong: 'Bekijk je blad nog eens: de twee stalen bevatten niet dezelfde dingen. De samenstelling van de bodem verandert afhankelijk van de plaats.',
    wetPoor: S => `Let op: staal ${S} was nat, maar er was bijna geen leven in. Water alleen maakt een bodem niet rijk.`,
    yourHyp: 'Jouw hypothese:',
    yourConcl: 'Jouw besluit:',
    verdictOk: v => `Je hypothese en je besluit ${v === 'confirmed' ? 'zeggen hetzelfde' : 'zeggen niet hetzelfde'}: je hypothese is dus inderdaad ${v === 'confirmed' ? 'bevestigd' : 'verworpen'}. Goed geoordeeld!`,
    verdictWrong: should => `Vergelijk je hypothese met je besluit: ze ${should === 'confirmed' ? 'zeggen hetzelfde, dus je hypothese is bevestigd' : 'zeggen niet hetzelfde, dus je hypothese is verworpen'}.`,
    rejectedNote: 'Een verworpen hypothese is geen fout: zo gaat de wetenschap vooruit.'
  },

  // Comparaison de l'hypothèse et de la conclusion, en phrases complètes.
  compareSent: {
    A: 'staal A bevat meer levende wezens en organisch materiaal.',
    B: 'staal B bevat meer levende wezens en organisch materiaal.',
    same: 'beide stalen bevatten ongeveer evenveel levende wezens en organisch materiaal.'
  }
});
