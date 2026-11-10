/* ===== Labo virtuel « Ostend 2100 » (phys2) : textes en néerlandais =====

   Simulation commune aux deux filières : js/lab-ostend.js, chargée après
   ce fichier. Mêmes clés que l'anglais (en/year1/phys2/lab-ostend.en.js),
   seul le lexique (glossary) a ses propres mots.

   Les mots du lexique sont soulignés d'office partout où ils apparaissent
   (traduction française au survol ou au toucher). Termes repris du
   chapitre : zeespiegel, zee-ijs, landijs, ijskappen, gletsjers,
   uitzetting, deeltjes, massa, drijven, smelten.

   Phrases de la conclusion (concl) : chacune reçoit ses listes déroulantes
   (ou sa case) toutes faites. Le choix porte le verbe quand la phrase est
   une subordonnée (« waar het ijs » + « op het rooster lag ») ; ailleurs il
   vient au participe (« is zijn volume » + « gestegen ») : pas de verbe
   coupé en deux. Les mêmes phrases donnent la bonne réponse dans la
   correction et le rapport.

   Chiffres : la hausse à Ostende de 1951 à 2019 vient des relevés du
   marégraphe (VLIZ) ; les réchauffements des scénarios sont ceux du GIEC
   (AR6, 2081-2100 par rapport à 1850-1900). */

LabEngine.addText('ostend', {
  labels: {
    title: 'Oostende 2100',

    // Page d'accueil (Mission) : toujours la même, rien du tirage ; des gestes, jamais des résultats.
    briefTitle: 'Opdracht: ontdek waarom de zee stijgt, en maak Oostende klaar voor 2100',
    briefTask: 'Overal ter wereld stijgt de zeespiegel, ook aan de Belgische kust. Je zoekt de oorzaken op je labotafel en reist dan naar 2100 op een model van de kust.',
    briefSteps: [
      '<strong>Plaats</strong> vier waterpeilen.',
      '<strong>Smelt</strong> ijs. <strong>Warm</strong> zeewater <strong>op</strong>. <strong>Reis</strong> naar 2100 op het model.',
      '<strong>Leg uit</strong> waarom de zee stijgt. <strong>Zeg</strong> wat Oostende nodig heeft.'
    ],
    // Sous chaque phrase courte : le comment, en une phrase (jamais le résultat).
    briefDetails: [
      'Tik op een pijl onder elke tekening: hoger, even hoog of lager.',
      'Drie posten, elk met zijn schrift: schrijf wat je afleest op de glazen, het buisje, de peilschaal en de grafiek.',
      'Gebruik je drie schriften.'
    ],

    // Masse au dixième, avec le séparateur décimal de la langue.
    num: v => v.toFixed(1).replace('.', ','),
    units: { ml: 'mL', mm: 'mm', g: 'g', c: '°C', cm: 'cm' },

    yourQuestion: 'Jouw onderzoeksvraag',
    bigQuestion: 'Waarom stijgt de zee, en wat verandert dat tegen 2100 in Oostende?',
    intro: 'Eerst de oorzaken: twee experimenten. Dan de gevolgen: een model van de kust in Oostende.',
    factsTitle: 'Een feit',
    factPast: 'In Oostende is de zeespiegel tussen 1951 en 2019 ongeveer 13 cm gestegen.',
    // Dit au Check et dans le rapport, jamais avant. w : réchauffement en 2100, déjà écrit (labels.num).
    scenarios: {
      low: w => `Jouw scenario: de wereld vermindert snel haar uitstoot van broeikasgassen. In 2100 is de aarde ongeveer ${w} °C warmer dan in 1850–1900.`,
      medium: w => `Jouw scenario: de uitstoot van broeikasgassen blijft tot 2050 ongeveer zoals nu en daalt daarna. In 2100 is de aarde ongeveer ${w} °C warmer dan in 1850–1900.`,
      high: w => `Jouw scenario: de uitstoot van broeikasgassen blijft toenemen. In 2100 is de aarde ongeveer ${w} °C warmer dan in 1850–1900.`,
      veryHigh: w => `Jouw scenario: de uitstoot van broeikasgassen neemt heel snel toe. In 2100 is de aarde ongeveer ${w} °C warmer dan in 1850–1900.`
    },

    hypothesisTitle: 'Jouw hypotheses',
    hypLevels: 'Waar staat het water op het einde: hoger, even hoog of lager? Tik op een pijl onder elke tekening. De laatste tekening toont een zeer zware storm vandaag.',
    predNames: { a: 'drijvend ijs smelt', b: 'ijs op een rooster smelt', flask: 'zeewater warmt op', storm: 'een zeer zware storm in 2100' },
    moves: { up: 'hoger', same: 'even hoog', down: 'lager' },
    because: 'Waarom denk je dat? (niet verplicht)',
    becausePlaceholder: 'Omdat…',
    hypothesisReady: 'Je hypotheses zijn klaar.',
    hypothesisPending: 'Plaats de vier peilen.',
    toBench: 'Verder: de experimenten',

    lockHypothesis: 'Plaats eerst de vier peilen.',
    lockHypothesisFixed: 'Je hypotheses kunnen niet meer veranderen: de experimenten zijn begonnen. Een wetenschapper verandert een hypothese niet na het zien van de resultaten!',
    lockNotStarted: 'Voer eerst de experimenten uit.',
    lockRun: n => `Werk eerst de experimenten af: nog ${n === 1 ? '1 post' : n + ' posten'}.`,
    lockStation3: 'Werk eerst post 1 en post 2 af: je hebt ze nodig om het model te begrijpen.',
    choose: 'kies',

    stations: ['Twee glazen', 'Warm zeewater', 'De kust tot 2100'],
    notesTitle: 'Jouw schrift',
    capBadNumber: 'Schrijf alleen het getal dat je afleest (bijvoorbeeld 60).',
    capStationDone: 'Deze post is klaar. Ga naar de volgende post, of ga verder naar het besluit.',
    runInfo: n => `${n} / 3 posten klaar`,
    missingRun: 'Er ontbreekt nog iets: kijk naar de rode vakjes.',
    toConclude: 'Verder: besluiten',
    // Bouton suivant pendant l'expérience : le poste pas encore fini.
    toStation: ['Verder: twee glazen', 'Verder: warm zeewater', 'Verder: de kust'],
    lockStationHere: 'Werk deze post eerst af.',
    backToLab: 'Terug naar het labo',
    checkConclusions: 'Mijn besluiten controleren',

    // Poste 1 : les deux verres.
    s1: {
      glassNames: { a: 'Glas 1', b: 'Glas 2' },
      ice: 'ijsblokjes',
      melt: 'Laat het ijs smelten',
      meltSub: '1 uur, versneld',
      melted: 'Het ijs is gesmolten',
      meltedSub: '1 uur later',
      startHead: 'Begin (mL)',
      endHead: 'Einde (mL)',
      hint: 'Glas 1: het ijs drijft in het water. Glas 2: het ijs ligt op een rooster, boven het water.',
      aria: { a0: 'Glas 1, peil bij het begin', b0: 'Glas 2, peil bij het begin', a1: 'Glas 1, peil op het einde', b1: 'Glas 2, peil op het einde' },
      lockStart: 'Leg eerst ijsblokjes in elk glas.',
      lockStartFixed: 'Het ijs is gesmolten: je kunt het beginpeil niet meer aflezen.',
      lockEnd: 'Dit peil lees je af wanneer het ijs gesmolten is.',
      lockMeltIce: 'Leg eerst ijsblokjes in elk glas.',
      lockMeltNotes: 'Schrijf eerst voor elk glas het peil bij het begin op.',
      capIce: 'Leg ijsblokjes in elk glas: tik op de ijsblokjes en tik dan op een glas.',
      capHoldIce: 'Tik nu op een glas.',
      capTakeIce: 'Neem eerst de ijsblokjes: tik erop.',
      capStart: 'Lees het waterpeil in elk glas af en schrijf het in de kolom “Begin”.',
      capMelt: 'Beide peilen genoteerd. Laat nu het ijs smelten.',
      capMelting: 'Er gaat een uur voorbij…',
      capEnd: 'Al het ijs is gesmolten. Lees de twee peilen opnieuw af en schrijf ze in de kolom “Einde”.'
    },

    // Poste 2 : l'eau de mer tiédie.
    s2: {
      flask: 'erlenmeyer met zeewater',
      balance: 'balans',
      bath: 'warmwaterbad op een verwarmplaat',
      thermo: 'zeewater',
      heat: 'Verwarmen: +5 °C',
      heatSub: 'het waterbad opwarmen',
      zoomTitle: 'Het dunne buisje, van dichtbij',
      massNames: { start: 'Massa bij het begin', end: 'Massa op het einde' },
      massAria: { start: 'Massa van de erlenmeyer bij het begin, in gram', end: 'Massa van de erlenmeyer op het einde, in gram' },
      tempHead: 'Temperatuur (°C)',
      levelHead: 'Peil in het buisje (mm)',
      levelAria: 'Peil van het zeewater in het dunne buisje, in mm',
      // t : température, en °C.
      levelAt: t => `Peil in het buisje bij ${t} °C`,
      hint: 'De erlenmeyer zit vol zeewater (gekleurd, om het beter te zien). Hij is afgesloten met een stop met een dun buisje.',
      lockFlaskMass: 'Schrijf eerst de massa van de erlenmeyer op.',
      lockFlaskBath: 'Lees eerst het peil af bij de vier temperaturen.',
      lockFlaskDone: 'Dit experiment is klaar.',
      lockHeatBath: 'Zet eerst de erlenmeyer in het waterbad.',
      lockHeatNote: 'Schrijf eerst het peil in het buisje bij deze temperatuur op.',
      lockHeatDone: 'Je hebt de vier temperaturen. Zet de erlenmeyer terug op de balans.',
      lockLevel: 'Dit peil lees je af wanneer het zeewater deze temperatuur heeft.',
      lockLevelPast: 'Het zeewater heeft deze temperatuur niet meer: je kunt dit peil niet meer aflezen.',
      lockMassFixed: 'De erlenmeyer staat niet meer op de balans: je kunt deze massa niet meer aflezen.',
      lockMassEnd: 'Zet de erlenmeyer op het einde terug op de balans.',
      capMass: 'De erlenmeyer staat op de balans. Lees de massa af en schrijf ze op.',
      capToBath: 'Massa genoteerd. Zet nu de erlenmeyer in het waterbad: tik op de erlenmeyer.',
      capLevel: 'Lees het peil van het zeewater in het dunne buisje af (rechts, van dichtbij) en schrijf het op.',
      capHeat: 'Peil genoteerd. Verwarm het waterbad met 5 °C.',
      capHeating: 'Het zeewater warmt op…',
      capBack: 'Laatste peil genoteerd. Zet de erlenmeyer terug op de balans: tik op de erlenmeyer.',
      capMassEnd: 'Lees de massa van de erlenmeyer opnieuw af en schrijf ze op.'
    },

    // Poste 3 : le modèle de la côte.
    s3: {
      places: { sea: 'zee', beach: 'strand', dike: 'dijk', city: 'Oostende', polders: 'polders' },
      tideLine: 'hoogwater in 2025',
      works: { sand: 'Meer zand', wall: 'Hogere muur' },
      storm: 'Zeer zware storm',
      stormSub: 'bij hoogwater, zoals in 1953',
      calm: 'Kalme zee',
      calmSub: 'de storm stoppen',
      gaugeTitle: 'Peilschaal in de haven: gemiddelde zeespiegel',
      partsTitle: 'Waar komt de stijging vandaan? (cm)',
      partNames: { ice: 'gesmolten zee-ijs', land: 'gesmolten landijs', water: 'warmer zeewater' },
      in2100Head: 'In 2100',
      riseName: 'Stijging van de zee',
      testHead: 'Stormtest',
      overHead: 'Over de dijk?',
      tests: {
        '2025-00': '2025',
        '2100-00': '2100, geen nieuwe bescherming',
        '2100-10': '2100, meer zand',
        '2100-01': '2100, hogere muur',
        '2100-11': '2100, zand + muur'
      },
      overWords: { yes: 'ja', no: 'nee' },
      riseAria: 'Stijging van de zee in 2100, in cm',
      overAria: 'Kwam het water over de dijk?',
      hint: 'Over de dijk? Kijk achter de dijk: staan de straat en de polders onder water?',
      // y : année.
      riseAt: y => `Stijging van de zee in ${y}`,
      lockRise: 'Ga naar 2100 om de peilschaal in de haven af te lezen.',
      lockParts: 'De grafiek lees je af in 2100.',
      lockTest: 'Voer deze stormtest uit om te zeggen of het water over de dijk komt.',
      lockYear2100: 'Test eerst de storm in 2025 en zeg of het water over de dijk kwam.',
      lockWorksYear: 'Nieuwe beschermingen zijn voor 2100: ga eerst naar 2100.',
      lockWorksFirst: 'Test eerst de storm in 2100 zonder nieuwe bescherming, en noteer hem.',
      lockStormNote: 'Schrijf eerst de stijging van de zee en haar twee delen op in je schrift.',
      capStormToday: 'Dit is vandaag, bij hoogwater. Start een zeer zware storm om te zien hoe hoog het water komt.',
      capStorming: 'De storm duwt de zee tegen de dijk…',
      capTest: 'Kijk naar de kust: kwam het water over de dijk? Kies ja of nee in je schrift.',
      capCalm: 'Test genoteerd. Maak de zee weer kalm om verder te gaan.',
      capGo2100: 'Reis nu naar 2100: tik op 2100.',
      capRise: 'Lees de peilschaal in de haven af: hoeveel hoger staat de zee? Schrijf het op in je schrift.',
      capParts: 'Lees nu de grafiek af: schrijf het deel van het gesmolten landijs en het deel van het warmere zeewater op.',
      capStorm2100: 'Start een zeer zware storm in 2100, zonder nieuwe bescherming.',
      capBackToday: 'Ga terug naar 2025 en test de storm ook daar.',
      capWorks: 'Test nu beschermingen in 2100: meer zand, een hogere muur, of allebei. Ga daarna verder naar het besluit.'
    },

    resultsTitle: 'Jouw resultaten',
    // Valeurs déjà écrites avec leur unité, ou un tiret.
    recap: {
      glass: (name, start, end) => `${name}: ${start} → ${end}`,
      flask: (t0, t1, start, end) => `Van ${t0} °C naar ${t1} °C: ${start} → ${end}`,
      mass: (start, end) => `Massa: ${start} → ${end}`,
      rise: (rise, land, water) => `In 2100: de zee staat ${rise} hoger (landijs ${land}, warmer water ${water})`,
      test: (name, over) => `${name}: over de dijk: ${over}`
    },
    whyTitle: 'Waarom stijgt de zee?',
    whatTitle: 'Wat verandert dat tegen 2100 in Oostende?',
    // Chaque phrase reçoit sa liste (ou sa case) ; dans la correction, le bon mot.
    concl: {
      glass: sel => `Het waterpeil is alleen gestegen in het glas waar het ijs ${sel}.`,
      glassWords: { a: 'in het water dreef', b: 'op het rooster lag' },
      glassAria: 'Waar het ijs was',
      source: sel => `De zee stijgt dus wanneer ${sel} smelt.`,
      sourceWords: { sea: 'drijvend zee-ijs', land: 'ijs op het land', both: 'om het even welk ijs' },
      sourceAria: 'Welk ijs de zee doet stijgen',
      biggest: sel => `In 2100 komt het grootste deel van de stijging van ${sel}.`,
      biggestWords: { ice: 'gesmolten zee-ijs', land: 'gesmolten landijs', water: 'warmer zeewater' },
      biggestAria: 'Waar het grootste deel van de stijging vandaan komt',
      water: (volume, mass) => `Toen het zeewater opwarmde, is zijn volume ${volume} en is zijn massa ${mass}.`,
      changeWords: { up: 'gestegen', same: 'gelijk gebleven', down: 'gedaald' },
      volumeAria: 'Wat het volume deed',
      massAria: 'Wat de massa deed',
      particles: sel => `Zijn deeltjes ${sel}.`,
      particleWords: { space: 'bewegen sneller en nemen meer plaats in', bigger: 'worden groter', more: 'worden talrijker' },
      particlesAria: 'Wat de deeltjes doen',
      rise: input => `Op het model staat de zee in Oostende in 2100 ${input} cm hoger dan in 2025.`,
      over: sel => `Zonder nieuwe bescherming komt het water van een zeer zware storm dan ${sel} de top van de dijk.`,
      overWords: { over: 'over', under: 'niet over' },
      overAria: 'Het stormwater en de top van de dijk',
      work: sel => `Het kleinste werk dat de stad droog houdt: ${sel}.`,
      workWords: { sand: 'meer zand op het strand', wall: 'een hogere stormmuur', both: 'meer zand en een hogere stormmuur' },
      workAria: 'Het kleinste werk dat volstaat'
    },
    verdictNames: { vA: 'Glas 1', vB: 'Glas 2', vFlask: 'De erlenmeyer', vStorm: 'De storm in 2100' },
    confirmed: 'bevestigd',
    rejected: 'verworpen',

    scoreLabel: 'controles geslaagd',
    markCorrect: 'juist',
    markIncorrect: 'fout',
    criteria: { measure: 'Metingen', ice: 'Het ijs', water: 'Warm water', coast: 'Oostende in 2100', verdict: 'Hypotheses' },
    criteriaSub: { measure: 'Je drie schriften', ice: 'Je antwoord over de glazen', water: 'Je antwoord over de erlenmeyer', coast: 'Je antwoorden over de kust', verdict: 'Je oordelen' },
    particleNames: { ice: 'ijs', water: 'vloeibaar water' },

    report: {
      title: 'Laboverslag — Waarom de zee stijgt, en Oostende in 2100',
      because: 'Omdat',
      hypLevel: (name, word) => `“${name}”: het peil zal ${word} staan.`,
      materials: [
        'Twee glazen met maatstreepjes, water, ijsblokjes, een rooster.',
        'Een erlenmeyer vol zeewater met een stop en een dun buisje, een warmwaterbad op een verwarmplaat, een thermometer, een balans.',
        'Een model van de kust in Oostende: peilschaal in de haven, grafiek van waar de stijging vandaan komt, storm, beschermingen.'
      ],
      procedure: [
        'Twee glazen: leg ijsblokjes in het water van glas 1 en op het rooster van glas 2. Schrijf de twee peilen op, laat het ijs smelten en schrijf de twee peilen opnieuw op.',
        'Zeewater: weeg de erlenmeyer, verwarm hem in stappen van 5 °C en schrijf telkens het peil in het dunne buisje op. Weeg hem daarna opnieuw.',
        'Model: test een zeer zware storm in 2025 en ga dan naar 2100. Schrijf de stijging van de zee en haar twee delen op. Test de storm in 2100, en test daarna beschermingen.'
      ],
      verdict: (text, word) => `${text}: ${word}.`,
      score: (n, total) => `Score: ${n} / ${total} controles geslaagd.`
    }
  },

  glossary: {
    zeespiegel: 'niveau de la mer', 'zee-ijs': 'banquise (glace de mer)', landijs: 'glace terrestre (glaciers, calottes)',
    'ijs op het land': 'glace sur la terre ferme', ijskappen: 'calottes glaciaires',
    dijk: 'digue', stormmuur: 'mur anti-tempête', storm: 'tempête', hoogwater: 'marée haute',
    strand: 'plage', zand: 'sable', haven: 'port', peilschaal: 'mire (échelle graduée)', waterpeil: "niveau de l'eau", peil: 'niveau',
    ijsblokjes: 'glaçons', rooster: 'grille', 'dun buisje': 'tube fin', 'dunne buisje': 'tube fin', buisje: 'petit tube',
    zeewater: 'eau de mer', waterbad: "bain d'eau", warmwaterbad: 'bain-marie', verwarmplaat: 'plaque chauffante',
    drijft: 'flotte', dreef: 'flottait', drijvend: 'qui flotte', smelt: 'fond', smelten: 'fondre', gesmolten: 'fondu',
    'warmt op': 'se réchauffe', opwarmde: 'se réchauffait', warmer: 'plus chaud',
    'thermische uitzetting': 'dilatation thermique', broeikasgassen: 'gaz à effet de serre', uitstoot: 'émissions',
    stijging: 'hausse', stijgt: 'monte', gestegen: 'a monté', gedaald: 'a baissé', 'gelijk gebleven': 'resté pareil',
    weeg: 'pèse', deeltjes: 'particules', oorzaken: 'causes', gevolgen: 'conséquences',
    bescherming: 'protection', beschermingen: 'protections', gemiddelde: 'moyen', schrift: 'cahier'
  },

  // Étape Check : ce qui se passe.
  explanations: {
    ice: 'Drijvend ijs duwt al evenveel water opzij als het zelf wordt wanneer het smelt: het peil verandert niet. Daarom doet het smeltende zee-ijs van de Noordpool de zee niet stijgen. IJs op het land (gletsjers, de ijskappen van Groenland en Antarctica) is nieuw water voor de zee: er komt meer water in de zee, dus de zeespiegel stijgt.',
    float: 'Water is bijzonder: wanneer het bevriest, nemen zijn deeltjes meer plaats in. IJs neemt ongeveer een tiende meer plaats in dan het water waaruit het ontstaat. Daarom drijft het, met een tiende boven het water.',
    water: 'De stop liet niets in of uit: de massa en het aantal deeltjes bleven gelijk. Maar warmere deeltjes bewegen sneller en nemen meer plaats in, dus het volume neemt toe: dat is thermische uitzetting. De zee doet hetzelfde wanneer ze warmer wordt.',
    // land, water : les deux parts de la hausse en 2100, en cm.
    coast: (land, water) => `In jouw scenario zorgt gesmolten landijs tegen 2100 voor ongeveer ${land} cm en warmer zeewater voor ongeveer ${water} cm. Dat lijkt weinig, maar een storm vertrekt dan van een hogere zee, dus het water komt hoger tegen de dijk. En de polders achter de dijk liggen nu al lager dan het hoogwater: ze hangen af van de dijk.`,
    emissions: 'Met minder broeikasgassen stijgt de zee minder: ongeveer 40 cm tegen 2100 als de wereld haar uitstoot snel vermindert, tot 70 cm als die heel snel toeneemt.',
    model: 'Een model vereenvoudigt. De echte stijging kan lager of hoger zijn dan deze middenwaarde, en ze stopt niet in 2100. België brengt nu al zand aan op zijn stranden en bouwt stormmuren, ook in Oostende.'
  },

  // v : ce que l'élève a noté (null si rien) ; r : la vraie valeur.
  check: {
    noExperiment: 'Je hebt de experimenten niet uitgevoerd: er zijn geen metingen.',
    measureScore: (good, total) => `${good} / ${total} metingen juist genoteerd.`,
    measureAllGood: 'Al je metingen kloppen met wat de glazen, het buisje, de balans, de peilschaal in de haven, de grafiek en de kust toonden. Goed afgelezen!',
    noteMiss: (what, v, r, unit) => v == null ? `${what}: niets genoteerd (het was ${r} ${unit}).` : `${what}: je schreef ${v} ${unit}, het was ${r} ${unit}.`,
    overMiss: (name, v, r) => v == null ? `Stormtest “${name}”: je zei niet of het water over de dijk kwam (het was “${r}”).` : `Stormtest “${name}”, over de dijk: je schreef “${v}”, het was “${r}”.`,
    more: n => `… en nog ${n}.`,
    answerOk: 'Juist!',
    answerWrong: 'Niet helemaal. Het juiste antwoord:',
    notTested: 'Deze bescherming is de juiste, maar je hebt ze niet getest op het model: een wetenschapper controleert voor hij besluit.',
    testLine: (name, word) => `${name}: over de dijk: ${word}.`,
    verdictLevel: (name, pred, obs, should) => `“${name}”: je voorspelde “${pred}”, je nam “${obs}” waar. Je hypothese is ${should === 'confirmed' ? 'bevestigd' : 'verworpen'}.`,
    judgedOk: 'Goed beoordeeld!',
    judgedWrong: 'Je hebt het omgekeerd beoordeeld.',
    rejectedNote: 'Een verworpen hypothese is geen fout: zo gaat de wetenschap vooruit.'
  }
});
