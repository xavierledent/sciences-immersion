/* ===== Labo virtuel « Cycle detectives » (bio2) : textes en néerlandais =====

   Simulation commune aux deux filières : js/lab-cycles.js, chargée après
   ce fichier. Mêmes clés que l'anglais (en/year1/bio2/lab-cycles.en.js),
   sauf le lexique (glossary).

   Mots du chapitre NL (vocabulary.json, practice.json) : menstruatie,
   menstruatiecyclus, cyclus / cycli, eisprong, « ongeveer 14 dagen voor het
   einde van de cyclus », lichaamstemperatuur, eicel, zaadcellen, staaf.

   Les prénoms (names) : même nombre et même ordre qu'en anglais. */

LabEngine.addText('cycles', {
  labels: {
    title: 'Cyclusdetectives',

    // Page d'accueil (Mission) : toujours la même, rien du tirage ; des gestes, jamais des résultats.
    briefTitle: 'Opdracht: drie dagboeken, vier beweringen om te testen',
    briefTask: 'Drie jonge vrouwen noteerden vier maanden lang hun menstruatie in een dagboek, en namen elke ochtend hun temperatuur. Je hoort vaak: “Een cyclus duurt 28 dagen, de eisprong is op dag 14.” Zeggen hun dagboeken hetzelfde?',
    briefSteps: [
      '<strong>Sorteer</strong> vier beweringen: juist of fout?',
      '<strong>Zoek</strong> de eerste dag van elke menstruatie, <strong>bereken</strong> de cycli, <strong>teken</strong> de grafiek en <strong>lees</strong> de temperatuur af.',
      '<strong>Sorteer</strong> de beweringen opnieuw, met een bewijs.'
    ],
    // Sous chaque phrase courte : le comment, en une phrase (jamais le résultat).
    briefDetails: [
      'Leg elke kaart in een kolom. Je mag zeggen waarom.',
      'Tik op de dagen in de kalender: ze komen in je notities. Dan de staven, dan de curves.',
      'Kies elk bewijs in je notities.'
    ],
    tools: { claims: 'vier beweringen', calendar: 'kalender', graph: 'grafiek', thermometer: 'temperatuur' },

    yourQuestion: 'Jouw onderzoeksvraag',
    bigQuestion: 'Heeft elke vrouw een cyclus van 28 dagen, met de eisprong op dag 14?',
    contextTitle: 'Wat je krijgt',
    context: 'De menstruatiedagboeken van drie jonge vrouwen: vier maanden kalender, en de ochtendtemperatuur van hun laatste cyclus.',

    // Les quatre affirmations (cartes de Predict, puis Conclude).
    claims: {
      every28: 'Elke menstruatiecyclus duurt 28 dagen.',
      sameLength: 'De cycli van één vrouw zijn altijd even lang.',
      day14: 'De eisprong is altijd op dag 14 van de cyclus.',
      before14: 'De eisprong komt ongeveer 14 dagen voor het einde van de cyclus.'
    },
    // Rappel court (résultats de Conclude, rapport).
    claimsShort: {
      every28: 'Elke cyclus: 28 dagen',
      sameLength: 'Eén vrouw: altijd even lang',
      day14: 'Eisprong: altijd dag 14',
      before14: 'Eisprong: ongeveer 14 dagen voor het einde'
    },

    hypothesisTitle: 'Jouw hypothese',
    sortHow: 'Leg elke kaart in een kolom: tik erop en tik dan op de kolom (of schuif ze).',
    columns: { true: 'Ik denk dat het juist is', false: 'Ik denk dat het fout is' },
    dropHere: 'Leg hier kaarten.',
    pileEmpty: 'Alle kaarten liggen in een kolom.',
    because: 'Waarom denk je dat? (niet verplicht)',
    becausePlaceholder: 'Omdat…',
    hypothesisReady: 'Je hypothese is klaar.',
    hypothesisPending: 'Leg de vier kaarten in de kolommen.',
    toBench: 'Volgende: de dagboeken',

    lockHypothesis: 'Leg eerst de vier kaarten in de kolommen.',
    lockHypothesisFixed: 'Je hypothese ligt vast: het onderzoek is begonnen. Een wetenschapper verandert zijn hypothese niet nadat hij de resultaten gezien heeft!',
    lockNotStarted: 'Voer eerst het onderzoek uit.',
    lockRun: 'Werk eerst het onderzoek af.',

    // Étape 2 : les trois parties.
    views: { 1: '1 · Kalenders', 2: '2 · Grafiek', 3: '3 · Temperatuur' },
    partInfo: {
      1: 'Voor elke vrouw: de eerste dag van elke menstruatie, dan de lengte van elke cyclus.',
      2: 'Eén staaf voor elke cyclus.',
      3: 'Voor elke vrouw: de dag van de eisprong in haar laatste cyclus.'
    },
    names: ['Lina', 'Noor', 'Amira', 'Lotte', 'Ines', 'Julie', 'Yasmine', 'Hanna', 'Elif', 'Fien'],
    months: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
    monthsShort: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
    weekdays: ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'],
    date: (d, month) => `${d} ${month}`,
    monthDays: n => `${n} dagen`,
    dayAria: (d, month, period) => `${d} ${month}${period ? ', menstruatie' : ''}`,
    womanLine: (name, age) => `Het dagboek van ${name} · ${age} jaar.`,
    firstYearNote: 'Haar eerste menstruatie was vorig jaar.',
    keyPeriod: 'menstruatie',
    keyMark: 'eerste dag die je aanduidde',

    // À droite : l'aide de chaque partie.
    help: {
      1: {
        title: 'Zo tel je',
        lines: [
          'Een cyclus begint op de eerste dag van een menstruatie. Hij eindigt de dag voor de volgende menstruatie.',
          'Lengte van een cyclus = het aantal dagen van de ene eerste dag tot de volgende eerste dag.'
        ],
        example: 'Voorbeeld: van 25 maart tot 22 april: 31 − 25 + 22 = <strong>28 dagen</strong> (maart heeft 31 dagen).'
      },
      2: {
        title: 'Je grafiek',
        lines: [
          'Eén staaf voor elke cyclus, in de volgorde van je notities.',
          'Schuif elke staaf omhoog tot de lengte in je notities, of tik op de juiste hoogte.'
        ],
        example: ''
      },
      3: {
        title: 'Lees de curve af',
        lines: [
          'De temperatuur werd elke ochtend gemeten, voor het opstaan.',
          'Na de eisprong stijgt de temperatuur en blijft ze hoog. Tik op de dag van de eisprong: de laatste lage dag voor de stijging.',
          'Tel dan de dagen van de eisprong tot het einde van de cyclus.'
        ],
        example: ''
      }
    },

    // Graphique (fiche outil FO5b).
    chart: {
      title: 'Lengte van elke cyclus',
      yName: 'Lengte van de cyclus (dagen)',
      xName: 'Cyclus',
      ref: '28 dagen',
      barAria: (name, k) => `${name}, cyclus ${k}`,
      selected: (name, k) => `Gekozen staaf: ${name}, cyclus ${k}.`,
      noneSelected: 'Tik op een staaf om ze te kiezen.',
      minus: 'Eén dag minder',
      plus: 'Eén dag meer'
    },
    // Courbe de température (donnée).
    curve: {
      title: name => `${name}: ochtendtemperatuur tijdens haar laatste cyclus`,
      yName: 'Temperatuur (°C)',
      xName: 'Dag van de cyclus',
      end: n => `Laatste dag van de cyclus: dag ${n}`,
      chosen: d => `dag ${d}`
    },
    num: v => v.toFixed(1).replace('.', ','),

    notesTitle: 'Je notities',
    notes: {
      woman: 'Dagboek',
      firstDays: 'Eerste dag van elke menstruatie',
      lengths: 'Lengte van de cyclus (dagen)',
      temp: 'Laatste cyclus: temperatuur',
      period: k => `${k}`,
      cycle: k => `Cyclus ${k}`,
      ov: 'Eisprong',
      toEnd: 'Dagen tot het einde',
      lenAria: (name, k) => `${name}, lengte van cyclus ${k}`,
      toEndAria: name => `${name}, dagen van de eisprong tot het einde van de cyclus`
    },

    // La légende : la prochaine chose à faire (voir phase dans la simulation).
    captions: {
      view: v => `Open het deel “${v}” (tabbladen bovenaan).`,
      switch: name => `Open nu het dagboek van ${name} (tabbladen bovenaan).`,
      mark: (name, n) => (n === 0
        ? `Kalender van ${name}: tik op de eerste dag van elke menstruatie. Die komt in je notities.`
        : `Kalender van ${name}: tik op de eerste dag van elke menstruatie (${n} van de 4 klaar). Tik nog eens op een dag om hem weg te halen.`),
      length: (name, k) => `Bereken de lengte van cyclus ${k} van ${name}: van de ene eerste dag tot de volgende. Schrijf ze in je notities.`,
      ov: name => `Curve van ${name}: tik op de dag van de eisprong.`,
      toEnd: (name, n) => `Hoeveel dagen van de eisprong tot het einde van de cyclus (dag ${n})? Schrijf het in je notities.`,
      graph: 'Teken één staaf voor elke cyclus: schuif ze omhoog tot de lengte in je notities.',
      next: {
        graph: 'Deel 1 is klaar. Ga verder met de knop onderaan.',
        temp: 'Je grafiek is klaar. Ga verder met de knop onderaan.',
        conclude: 'Het onderzoek is gedaan. Bekijk je notities en je grafiek, en ga dan naar het besluit.'
      }
    },
    captionFourMarks: 'Je hebt al 4 eerste dagen aangeduid. Tik nog eens op een van die dagen om hem weg te halen.',
    captionBadNumber: (min, max) => `Schrijf een geheel getal van ${min} tot ${max}.`,
    captionPickBar: 'Tik eerst op een staaf om ze te kiezen.',

    lockLengths: name => `Duid eerst de 4 eerste dagen van de menstruaties van ${name} aan op haar kalender.`,
    lockTempLater: 'In deel 3 lees je de temperatuurcurves af.',
    lockToEnd: name => `Tik eerst op de dag van de eisprong op de curve van ${name}.`,
    lockView: {
      2: 'Werk eerst deel 1 af en gebruik dan de knop onderaan.',
      3: 'Werk eerst je grafiek af en gebruik dan de knop onderaan.'
    },
    // Ce qui manque encore (bouton du pied touché trop tôt).
    missing: {
      view: v => `Open het deel “${v}”.`,
      switch: name => `Open het dagboek van ${name}.`,
      mark: name => `Duid de 4 eerste dagen van de menstruaties van ${name} aan.`,
      length: name => `Schrijf de lengtes van de cycli van ${name}.`,
      ov: name => `Tik op de dag van de eisprong op de curve van ${name}.`,
      toEnd: name => `Schrijf de dagen van de eisprong tot het einde van de cyclus van ${name}.`,
      graph: 'Teken alle staven van je grafiek.',
      next: label => `Druk onderaan op “${label}”.`
    },
    next: {
      graph: 'Volgende: teken de grafiek',
      temp: 'Volgende: lees de temperatuur af',
      conclude: 'Volgende: besluiten'
    },

    // Listes : « 28, 28 en 29 ».
    list: items => (items.length < 2 ? (items[0] || '') : `${items.slice(0, -1).join(', ')} en ${items[items.length - 1]}`),
    // Preuves proposées à Conclude (nombres notés par l'élève).
    proofLen: (name, lens) => `${name}: cycli van ${lens} dagen`,
    proofOv: (name, day, end) => `${name}: eisprong op dag ${day}, dan ${end} dagen tot het einde`,
    proofLabel: 'Bewijs:',
    proofAria: 'Bewijs uit je resultaten',
    choose: 'kies',

    backToLab: 'Terug naar het labo',
    checkConclusions: 'Mijn besluiten controleren',
    resultsTitle: 'Je resultaten',
    concludeHow: 'Voor elke bewering: juist of fout? Kies dan het resultaat dat het bewijst.',
    trueFalse: { true: 'juist', false: 'fout' },
    verdictText: 'Mijn hypothese is',
    verdicts: { confirmed: 'bevestigd', partly: 'gedeeltelijk bevestigd', rejected: 'verworpen' },

    scoreLabel: 'controles geslaagd',
    markCorrect: 'juist',
    markIncorrect: 'fout',
    criteria: { days: 'Eerste dagen', lengths: 'Lengte van de cycli', graph: 'De grafiek', ovulation: 'Eisprong', claims: 'De beweringen' },
    criteriaSub: {
      days: 'De 12 dagen die je aanduidde',
      lengths: 'Je 9 berekeningen',
      graph: 'Je 9 staven',
      ovulation: 'De temperatuurcurves',
      claims: 'Juist of fout, en de bewijzen'
    },

    report: {
      title: 'Labverslag — Cyclusdetectives: duren alle cycli 28 dagen?',
      because: 'Omdat',
      iThink: word => `Ik denk dat het ${word} is.`,
      materials: 'De menstruatiedagboeken van drie jonge vrouwen over vier maanden (kalenders), de curve van hun ochtendtemperatuur tijdens hun laatste cyclus, een grafiekblad.',
      steps: [
        'Zoek op elke kalender de eerste dag van elke menstruatie.',
        'Bereken de lengte van elke cyclus: van de ene eerste dag tot de volgende.',
        'Teken een staafdiagram van de lengtes van de cycli.',
        'Zoek op elke temperatuurcurve de dag van de eisprong (de laatste lage dag voor de stijging). Tel de dagen van de eisprong tot het einde van de cyclus.',
        'Sorteer de vier beweringen opnieuw, met een bewijs uit de resultaten.'
      ],
      tableTitle: months => `Mijn notities (${months}):`,
      graphMark: 'Mijn grafiek',
      verdict: word => `Mijn hypothese is ${word}.`,
      score: (n, total) => `Score: ${n} / ${total} controles geslaagd.`
    }
  },

  glossary: {
    menstruatie: 'règles', menstruaties: 'règles', menstruatiecyclus: 'cycle menstruel',
    menstruatiedagboeken: 'journaux des règles', eisprong: 'ovulation',
    'eerste dag': 'premier jour', 'eerste dagen': 'premiers jours', lengte: 'durée', lengtes: 'durées',
    duurt: 'dure', duren: 'durent', 'even lang': 'de même durée', dagboek: 'journal (carnet)', dagboeken: 'journaux (carnets)',
    'jonge vrouwen': 'jeunes femmes', bewering: 'affirmation', beweringen: 'affirmations', bewijs: 'preuve',
    bewijzen: 'preuves', bewijst: 'prouve', sorteer: 'trie (classe)', 'elke ochtend': 'chaque matin',
    ochtendtemperatuur: 'température du matin', opstaan: 'se lever', stijging: 'montée', stijgt: 'monte',
    'blijft ze hoog': 'elle reste élevée', lage: 'basse', 'einde van de cyclus': 'fin du cycle',
    ongeveer: 'environ', altijd: 'toujours', staaf: 'barre (colonne)', staven: 'barres (colonnes)',
    schuif: 'fais glisser', eicel: 'ovocyte', zaadcellen: 'spermatozoïdes', 'veilige dag': 'jour sans risque',
    gemiddelde: 'moyenne', regelmatig: 'régulier', regelmatige: 'réguliers', onregelmatig: 'irrégulier',
    tel: 'compte', tellen: 'compter', aanduiden: 'marquer', aanduidde: 'as marqué', duid: 'marque'
  },

  // Étape Check : ce que montrent les données.
  explanations: {
    ovulation: 'Na de eisprong stijgt de temperatuur met ongeveer 0,5 °C en blijft ze hoog tot het einde van de cyclus. De eisprong is dus de laatste lage dag voor de stijging. In een langere cyclus komt hij later.',
    claims: {
      every28: '28 dagen is maar een gemiddelde. Cycli kunnen korter of langer zijn, en dat is normaal.',
      sameLength: 'Sommige vrouwen hebben heel regelmatige cycli, andere niet. In de eerste jaren na de eerste menstruatie zijn de cycli vaak onregelmatig: dat is normaal.',
      day14: 'De eisprong is alleen op dag 14 in een cyclus van 28 dagen. In een cyclus van 35 dagen is hij rond dag 21.',
      before14: 'De eisprong komt ongeveer 14 dagen voor het einde van de cyclus. Het zijn de dagen voor de eisprong die veranderen.'
    },
    safeDays: 'Je kent de dag van de eisprong dus pas achteraf, als de volgende menstruatie komt. En zaadcellen kunnen tot 5 dagen leven. Er bestaat geen veilige dag: dagen tellen is geen manier om een zwangerschap te vermijden.'
  },

  check: {
    noExperiment: 'Je hebt het onderzoek niet uitgevoerd: er zijn geen notities.',
    daysScore: (good, total) => `${good} / ${total} eerste dagen zijn juist.`,
    tableKey: 'Een rood vakje is een fout: jouw antwoord, en eronder het juiste.',
    daysAllGood: 'Al je eerste dagen zijn juist. Goed gedaan!',
    daysHow: 'De eerste dag van een menstruatie is de eerste rode dag na dagen zonder rood.',
    lengthsScore: (good, total) => `${good} / ${total} berekeningen zijn juist.`,
    lengthsAllGood: 'Al je berekeningen zijn juist. Goed gedaan!',
    lengthsHow: 'Tel van de ene eerste dag tot de volgende eerste dag: de dagen die overblijven in de eerste maand, dan de dagen van de volgende maand.',
    // Le calcul d'une longueur : même mois (monthDays null), ou avec les mois traversés.
    calc: (name, k, from, to, monthDays, dFrom, mids, dTo, total) => `${name}, cyclus ${k}: van ${from} tot ${to}: ` +
      (monthDays == null ? `${dTo} − ${dFrom}` : [`${monthDays} − ${dFrom}`].concat(mids.map(String), String(dTo)).join(' + ')) + ` = ${total} dagen.`,
    barLine: (name, k, yours, right) => `${name}, cyclus ${k}: je staaf toont ${yours}, je notities zeggen ${right}.`,
    graphAllGood: 'Al je staven kloppen met je notities.',
    graphHow: 'Elke staaf moet tot de lengte van die cyclus in je notities gaan.',
    ovLine: (name, yours, right) => `${name}: ${yours == null ? 'geen dag aangetikt' : `je tikte op dag ${yours}`}. Eisprong: dag ${right}.`,
    endLine: (name, yours, last, ov) => `${name}: ${last} − ${ov} = ${last - ov} dagen tot het einde van de cyclus. Jij schreef ${yours}.`,
    youSaid: x => `(jij zei ${x})`,
    yourProof: x => `Jouw bewijs: ${x}`,
    goodProof: x => `Een goed bewijs: ${x}`,
    verdict: {
      confirmed: 'Je hypothese en je besluit zeggen hetzelfde: hypothese bevestigd.',
      partly: 'Je hypothese en je besluit komen maar voor sommige beweringen overeen: hypothese gedeeltelijk bevestigd.',
      rejected: 'Je hypothese en je besluit komen nooit overeen: hypothese verworpen.'
    },
    judgedOk: 'Goed beoordeeld!',
    judgedWrong: 'Je oordeel past niet bij je besluit.',
    dayNote: date => `De eerste dag van deze menstruatie was ${date}.`,
    lenNote: n => `Volgens de eerste dagen die je aanduidde: ${n} dagen.`,
    ovNote: n => `De temperatuur stijgt na dag ${n}: eisprong op dag ${n}.`,
    endNote: n => `${n} dagen.`,
    graphNote: 'Elke staaf moet tot de lengte van die cyclus in mijn notities gaan.',
    proofNote: x => `Dit resultaat bewijst het niet. Een goed bewijs: ${x}`
  }
});
