/* ===== Labo virtuel « Invisible spread » (bio2) : textes en néerlandais =====

   Simulation commune aux deux filières : js/lab-spread.js, chargée après
   ce fichier. Mêmes clés que l'anglais (en/year1/bio2/lab-spread.en.js),
   sauf le lexique (glossary).

   Mots du chapitre NL (vocabulary.json, practice.json, interactive.json) :
   soa (soa's), condoom, HPV-vaccin, geslachtsgemeenschap, « vaak zijn er
   geen tekenen ». « soa » est féminin ici (« ze », « haar »), comme
   « infectie ». Néerlandais de Belgique.

   Phrases de la conclusion : chacune reçoit sa liste déroulante toute
   faite ; les choix (words) sont écrits pour s'y insérer tels quels (le
   verbe conjugué est dans le choix : « hadden er minder de soa »). */

LabEngine.addText('spread', {
  labels: {
    title: 'Onzichtbare verspreiding',

    // Page d'accueil (Mission) : toujours la même, rien du tirage ; des gestes, jamais des résultats.
    briefTitle: 'Opdracht: volg een infectie die je niet ziet',
    briefTask: 'In een groep heeft één persoon een soa, maar niemand weet het: vaak zijn er geen tekenen. Volg met een model hoe ze zich verspreidt, en ontdek wat haar kan afremmen.',
    briefSteps: [
      '<strong>Voorspel</strong> hoe de soa zich zal verspreiden.',
      '<strong>Meng</strong> de buizen, <strong>test</strong> ze en <strong>tel</strong>. Speel daarna alles <strong>opnieuw</strong> met bescherming.',
      '<strong>Leg uit</strong> wat je gevonden hebt.'
    ],
    // Sous chaque phrase courte : le comment, en une phrase (jamais le résultat).
    briefDetails: [
      'Lees de kaart van de soa van vandaag. Kies een grafiek en vul twee zinnen aan.',
      'Meng de buizen ronde per ronde met de pipet. Vink na elke test de roze putjes aan in je notities.',
      'Gebruik je notities en je grafiek. Vergelijk daarna het model met het echte leven.'
    ],
    tools: { tubes: 'reageerbuizen', pipette: 'pipet', plate: 'testplaat', indicator: 'indicator' },

    yourQuestion: 'Jouw onderzoeksvraag',
    bigQuestion: 'Hoe verspreidt een soa zich in een groep, en wat kan dat afremmen?',
    subQuestions: [
      'Hoe verandert het aantal personen met de soa, ronde na ronde?',
      'De helft van de groep is beschermd. Wat gebeurt er met de personen die niet beschermd zijn?',
      'Lijkt het model op het echte leven?'
    ],

    // La légende du modèle : affichée du début à la fin.
    legend: {
      title: 'In dit model:',
      tube: '1 reageerbuis = 1 persoon',
      mix: 'twee buizen mengen = seksueel contact zonder condoom',
      pink: 'roze na de test = deze persoon heeft de soa',
      cap: 'een dopje = een condoom',
      sticker: 'een blauwe sticker = gevaccineerd tegen HPV',
      real: 'In het echte leven krijg je een soa niet door een glas, een buis of een handdoek te delen.'
    },

    // L'IST du jour (tirée) : trois faits repris du cours (Mission 14).
    todaySti: 'De soa van vandaag',
    sti: {
      hpv: {
        name: 'HPV',
        facts: [
          'HPV is een virus.',
          'Het wordt doorgegeven via huidcontact in de genitale zone. Vaak zijn er geen tekenen.',
          'Er bestaat een vaccin. Een condoom verkleint het risico, maar beschermt niet volledig.'
        ]
      },
      chlamydia: {
        name: 'Chlamydia',
        facts: [
          'Chlamydia wordt veroorzaakt door een bacterie.',
          'Ze wordt doorgegeven bij geslachtsgemeenschap. Vaak zijn er geen tekenen.',
          'Een condoom beschermt ertegen. Er bestaat geen vaccin.'
        ]
      }
    },

    hypothesisTitle: 'Jouw hypothese',
    hyp: {
      shape: 'Hoe zal het aantal personen met de soa veranderen, ronde na ronde?',
      protect: 'De helft van de groep is beschermd. Wat zal er gebeuren met de personen die het niet zijn?',
      condoms: 'De helft van de groep gebruikt een condoom. Hoeveel personen <strong>zonder condoom</strong> zullen de soa hebben, vergeleken met helemaal geen bescherming?',
      vaccine: 'De helft van de groep heeft het HPV-vaccin. Hoeveel personen <strong>zonder vaccin</strong> zullen de soa hebben, vergeleken met helemaal geen bescherming?'
    },
    // Sous les trois petits graphiques.
    shapes: {
      same: 'Het blijft ongeveer gelijk.',
      one: 'Elke ronde één persoon meer.',
      faster: 'Het kan elke ronde verdubbelen.'
    },
    compare: { more: 'meer', same: 'evenveel', fewer: 'minder' },
    because: 'Waarom denk je dat? (niet verplicht)',
    becausePlaceholder: 'Omdat…',
    hypothesisReady: 'Je hypothese is klaar.',
    hypothesisPending: 'Kies een grafiek en vul de twee zinnen aan.',
    toBench: 'Verder: het experiment',

    lockHypothesis: 'Kies eerst een grafiek en vul de twee zinnen aan.',
    lockHypothesisFixed: 'Je hypothese ligt vast: het experiment is begonnen. Een wetenschapper verandert zijn hypothese niet nadat hij de resultaten gezien heeft!',
    lockNotStarted: 'Voer eerst het experiment uit.',
    lockRun: 'Werk eerst het experiment af.',

    // Étape 2 : les trois parties, la paillasse, les contacts, le test, le carnet.
    parts: {
      1: 'Deel 1 · Geen bescherming',
      2: 'Deel 2 · De helft van de groep gebruikt een condoom',
      3: 'Deel 3 · De helft van de groep heeft het HPV-vaccin'
    },
    partInfo: {
      1: 'Drie rondes contacten, een test na elke ronde.',
      2: 'Dezelfde contacten, met condooms.',
      3: 'Dezelfde contacten, met het vaccin.'
    },
    views: { bench: 'Labotafel', graph: 'Grafiek' },
    exchangesTitle: 'Contacten',
    round: n => `Ronde ${n}`,
    // Deux numéros de tubes (déjà mis en forme).
    pair: (a, b) => `${a} + ${b}`,
    mixRound: n => `Ronde ${n} mengen`,
    replay: {
      condoms: 'De 3 rondes opnieuw, met condooms',
      vaccine: 'De 3 rondes opnieuw, met het vaccin'
    },
    testTitle: 'Test',
    sample: 'Een druppel van elke buis in de plaat',
    dye: 'De indicator toevoegen',

    notesTitle: 'Jouw notities',
    notesHead: 'Test',
    totalHead: 'Totaal',
    // Tableau des résultats (Conclude), correction, rapport.
    allHead: 'Alle personen met de soa',
    unprotHead: 'Personen zonder bescherming met de soa',
    rows: {
      r1: 'Na ronde 1',
      r2: 'Na ronde 2',
      r3: 'Na ronde 3',
      condoms: 'Met condooms',
      vaccine: 'Met het vaccin'
    },
    cellAria: (row, n) => `${row}, buis ${n}`,
    numAria: {
      total: row => `${row}, totaal`,
      unprot: row => `${row}, zonder bescherming`
    },
    notesHint: 'Tik op een vakje om een roze putje aan te vinken. Schrijf daarna hoeveel putjes roze zijn.',
    notesHintProt: 'Gestreepte vakjes: de beschermde personen (een condoom in deel 2, het vaccin in deel 3).',
    // À côté du carnet : les personnes non protégées (numéros déjà mis en liste).
    count: {
      title: 'Personen zonder bescherming',
      later: 'In deel 2 wordt de helft van de groep beschermd. Hier tel je dan de andere personen.',
      who: list => `Buizen ${list}: geen condoom in deel 2, geen vaccin in deel 3.`,
      question: 'Hoeveel van hen hebben de soa?'
    },
    choose: 'kies',

    // La légende : la prochaine chose à faire (voir phase dans la simulation).
    captions: {
      mix: n => `Ronde ${n}: druk op “Ronde ${n} mengen” en kijk naar de pipet.`,
      sample: 'Test de buizen: doe een druppel van elke buis in de testplaat.',
      dye: 'Voeg nu de indicator toe aan de putjes. Kijk naar de kleuren.',
      note: row => `Kijk naar de plaat. In je notities, lijn “${row}”: vink de roze putjes aan en schrijf dan het totaal.`,
      unprotFirst: 'Deel 2 begint. Rechts van je notities: hoeveel personen zonder bescherming hadden de soa na ronde 3? Kijk naar hun buizen in de lijn “Na ronde 3”.',
      unprot: 'Rechts van je notities: hoeveel personen zonder bescherming hebben nu de soa?',
      replay: {
        condoms: 'De paarse dopjes zijn de condooms. Speel dezelfde contacten opnieuw, met condooms.',
        vaccine: 'De blauwe stickers zijn het HPV-vaccin. Speel dezelfde contacten opnieuw, met het vaccin.'
      },
      graph: 'Teken een staaf voor elke ronde: schuif ze omhoog tot het totaal in je notities.',
      toGraph: 'Open de grafiek.',
      next: {
        part2: 'Deel 1 is klaar. Ga naar deel 2 met de knop onderaan.',
        part3: 'Deel 2 is klaar. Ga naar deel 3 met de knop onderaan.',
        graph: 'De drie delen zijn klaar. Teken nu je grafiek: gebruik de knop onderaan.',
        conclude: 'Het experiment is voorbij. Bekijk je notities en je grafiek en ga dan verder naar de besluiten.'
      }
    },
    captionMixingRound: n => `Ronde ${n}: de pipet mengt elk paar buizen…`,
    captionReplayed: 'De contacten zijn al opnieuw gespeeld. Test nu de buizen.',
    captionReplaying: {
      condoms: 'Dezelfde contacten, met condooms…',
      vaccine: 'Dezelfde contacten, met het vaccin…'
    },
    captionSampling: 'Een druppel van elke buis gaat in zijn putje.',
    captionDyeing: 'De indicator gaat in elk putje…',
    captionBadNumber: max => `Schrijf een geheel getal van 0 tot ${max}.`,

    lockRoundTest: n => `Test eerst de buizen na ronde ${n}.`,
    lockRoundNote: n => `Noteer eerst de test na ronde ${n} in je notities (ook het totaal).`,
    lockSampleMix: n => `Meng eerst alle paren van ronde ${n}.`,
    lockSampleReplay: 'Speel eerst de drie rondes opnieuw.',
    lockDyeSample: 'Doe eerst een druppel van elke buis in de plaat.',
    lockSampleDone: 'De druppels zitten al in de plaat: voeg nu de indicator toe.',
    lockTestNote: 'Deze test is klaar: noteer hem eerst in je notities.',
    lockTestsDone: 'Geen test meer in dit deel: ga verder met de knop onderaan.',
    lockRowTest: 'Test eerst de buizen: deze lijn is voor een latere test.',
    lockRowClosed: 'Deze test is voorbij: de plaat toont nu een andere test.',
    lockUnprotLater: 'In deel 2 weet je wie beschermd is.',
    lockReplayUnprot: 'Tel eerst de personen zonder bescherming na ronde 3 (rechts van je notities).',
    lockGraph: 'Werk eerst de drie delen af.',
    // Ce qui manque encore (bouton du pied touché trop tôt).
    missing: {
      mix: n => `Meng alle paren van ronde ${n}.`,
      replay: 'Speel de drie rondes opnieuw.',
      sample: 'Doe een druppel van elke buis in de plaat.',
      dye: 'Voeg de indicator toe.',
      note: 'Vink de roze putjes aan en schrijf het totaal in je notities.',
      unprot: 'Schrijf hoeveel personen zonder bescherming de soa hebben (rechts van je notities).',
      graph: 'Teken de drie staven van je grafiek.',
      next: label => `Druk onderaan op “${label}”.`
    },
    next: {
      part2: 'Verder: opnieuw met condooms',
      part3: 'Verder: opnieuw met het vaccin',
      graph: 'Verder: de grafiek tekenen',
      conclude: 'Verder: besluiten'
    },

    // Histogramme (fiche outil FO5b).
    chart: {
      title: 'Personen met de soa na elke test',
      scale: '1 vakje = 1 persoon',
      yName: 'Personen met de soa',
      xName: 'Test',
      groups: { none: 'Geen bescherming', half: 'De helft van de groep beschermd' },
      how: 'Schuif elke staaf omhoog tot het totaal in je notities, of tik op de juiste hoogte.'
    },

    backToLab: 'Terug naar het labo',
    checkConclusions: 'Mijn besluiten controleren',
    resultsTitle: 'Jouw resultaten',
    yourHyp: {
      shape: x => `Ronde na ronde: ${x}`,
      condoms: x => `Personen zonder condoom: ${x}.`,
      vaccine: x => `Personen zonder vaccin: ${x}.`
    },
    qShape: 'Hoe veranderde het aantal personen met de soa, ronde na ronde?',
    qProtect: 'De helft van de groep was beschermd. Wat gebeurde er met de personen die het niet waren?',
    qReal: 'En in het echte leven? Juist of fout?',
    // Chaque phrase reçoit sa liste ; dans la correction, le bon choix.
    concl: {
      shape: sel => `Het aantal personen met de soa ${sel}, ronde na ronde.`,
      condoms: sel => `Bij de personen zonder condoom ${sel}, vergeleken met deel 1.`,
      vaccine: sel => `Bij de personen zonder vaccin ${sel}, vergeleken met deel 1.`,
      both: sel => `Een condoom beschermt bij seksueel contact dus ${sel}.`
    },
    words: {
      shape: { same: 'bleef ongeveer gelijk', one: 'steeg met ongeveer één persoon per ronde', faster: 'steeg steeds sneller (het kon verdubbelen)' },
      condoms: { more: 'hadden er meer de soa', same: 'hadden er evenveel de soa', fewer: 'hadden er minder de soa' },
      vaccine: { more: 'hadden er meer de soa', same: 'hadden er evenveel de soa', fewer: 'hadden er minder de soa' },
      both: { one: 'alleen de persoon die het gebruikt', both: 'beide partners' }
    },
    conclAria: {
      shape: 'Hoe het aantal veranderde',
      condoms: 'Met condooms',
      vaccine: 'Met het vaccin',
      both: 'Wie een condoom beschermt'
    },
    verdictShape: 'Mijn hypothese 1 is',
    verdictProt: 'Mijn hypothese 2 is',
    verdicts: { confirmed: 'bevestigd', partly: 'gedeeltelijk bevestigd', rejected: 'verworpen' },
    real: {
      contact: 'Een soa wordt doorgegeven bij seksueel contact, niet door een glas of een handdoek te delen.',
      signs: 'Iemand met een soa heeft altijd tekenen.',
      onlyOne: 'Als maar één partner een condoom gebruikt, is alleen die partner beschermd.',
      test: 'Alleen een test toont of iemand een soa heeft.'
    },
    trueFalse: { true: 'juist', false: 'fout' },

    scoreLabel: 'controles geslaagd',
    markCorrect: 'juist',
    markIncorrect: 'fout',
    criteria: { counts: 'Je notities', graph: 'De grafiek', spread: 'De verspreiding', protection: 'Bescherming', reality: 'Het echte leven' },
    criteriaSub: {
      counts: 'De roze putjes en de totalen',
      graph: 'Je vijf staven',
      spread: 'Je antwoord op vraag 1',
      protection: 'Je antwoord op vraag 2',
      reality: 'Juist of fout?'
    },

    // Listes de numéros : « 1, 4 en 7 ».
    list: items => (items.length < 2 ? (items[0] || '') : `${items.slice(0, -1).join(', ')} en ${items[items.length - 1]}`),
    none: 'geen',

    report: {
      title: 'Labverslag — Een soa die je niet ziet: onzichtbare verspreiding',
      because: 'Omdat',
      exchanges: 'De contacten (dezelfde in de drie delen):',
      protected: list => `Beschermde personen in deel 2 en 3: ${list} (een dopje = een condoom, daarna een blauwe sticker = het HPV-vaccin).`,
      pinkHead: 'Roze putjes',
      graphMark: 'Mijn grafiek',
      realTitle: 'In het echte leven:',
      verdict: (text, word) => `${text} ${word}.`,
      materials: sti => `12 reageerbuizen in een rek (1 buis = 1 persoon), een pipet, een testplaat met 12 putjes, een indicator, dopjes (= condooms), blauwe stickers (= het HPV-vaccin). De soa van vandaag: ${sti}. In het begin heeft één persoon ze, maar alle buizen zijn helder.`,
      steps: [
        'Meng de buizen twee aan twee: drie rondes contacten.',
        'Doe na elke ronde een druppel van elke buis in de testplaat en voeg de indicator toe. Vink de roze putjes aan en tel ze.',
        'Speel dezelfde contacten opnieuw: de helft van de groep gebruikt een condoom. Test opnieuw.',
        'Speel dezelfde contacten opnieuw: dezelfde helft van de groep heeft het HPV-vaccin. Test opnieuw.',
        'Tel de personen zonder bescherming die de soa hebben. Teken de grafiek van de vijf testen.'
      ],
      score: (n, total) => `Score: ${n} / ${total} controles geslaagd.`
    }
  },

  glossary: {
    reageerbuis: 'tube à essai', reageerbuizen: 'tubes à essai', buis: 'tube', buizen: 'tubes', rek: 'portoir',
    testplaat: 'plaque de test', plaat: 'plaque', putje: 'creux (de la plaque)', putjes: 'creux (de la plaque)',
    dopje: 'bouchon', dopjes: 'bouchons', condoom: 'préservatif', condooms: 'préservatifs', soa: 'IST',
    geslachtsgemeenschap: 'rapport sexuel', huidcontact: 'contact de la peau', 'genitale zone': 'zone génitale',
    handdoek: 'essuie (serviette)', 'geen tekenen': 'pas de signes', 'altijd tekenen': 'toujours des signes',
    ronde: 'tournée', rondes: 'tournées', mengen: 'mélanger', meng: 'mélange', mengt: 'mélanges', gemengd: 'mélangé',
    druppel: 'goutte', druppels: 'gouttes', roze: 'rose', helder: 'incolore (transparent)', gestreepte: 'rayées', gestreept: 'rayé',
    evenveel: 'autant', minder: 'moins', verspreiding: 'propagation', verspreidt: 'se propage', verspreiden: 'se propager',
    afremmen: 'freiner', afremt: 'freine', helft: 'moitié', deel: 'partie',
    aanvinken: 'cocher', vink: 'coche', vinkjes: 'coches', staaf: 'barre (colonne)', staven: 'barres (colonnes)',
    verdubbelen: 'doubler', 'steeds sneller': 'de plus en plus vite', 'ongeveer gelijk': 'à peu près pareil',
    doorgeven: 'transmettre', doorgegeven: 'transmis', 'verkleint het risico': 'réduit le risque',
    beschermd: 'protégé', bescherming: 'protection', beschermt: 'protège',
    'beide partners': 'les deux partenaires', 'vergeleken met': 'comparé à', 'echte leven': 'vraie vie',
    'gedeelde verantwoordelijkheid': 'responsabilité partagée', 'laat je regelmatig testen': 'fais-toi dépister régulièrement'
  },

  // Étape Check : ce que montre le modèle.
  explanations: {
    spread: 'In elke ronde kan elke persoon met de soa ze doorgeven aan een partner, en die personen kunnen ze in de volgende ronde weer doorgeven. Het aantal kan dus elke ronde verdubbelen: het stijgt steeds sneller. En niemand ziet het: alle buizen bleven helder.',
    condoms: 'Een contact is beschermd als een van de twee partners een condoom gebruikt. Een persoon zonder condoom is dus ook beschermd als de partner er een gebruikt: bescherming is een gedeelde verantwoordelijkheid.',
    vaccine: {
      hpv: 'Een gevaccineerde persoon kan HPV niet krijgen, en dus ook niet doorgeven. Dat beschermt ook de personen zonder vaccin: rond hen zijn er minder personen die HPV kunnen doorgeven.',
      chlamydia: 'De soa van vandaag was chlamydia. Het HPV-vaccin beschermt alleen tegen HPV: tegen chlamydia veranderde het niets. Er bestaat geen vaccin tegen chlamydia, maar een condoom beschermt wel.'
    },
    leak: 'Met HPV gaf één beschermd contact het virus toch door: een condoom verkleint het risico, maar beschermt niet volledig, want HPV kan ook op de huid rond het condoom zitten. Daarom is het vaccin ook belangrijk.',
    real: {
      contact: 'In het model staat twee buizen mengen voor seksueel contact. Glazen, handdoeken of reageerbuizen geven geen soa door.',
      signs: 'Vaak zijn er geen tekenen: ook in het model bleven alle buizen helder.',
      onlyOne: 'Het condoom zit tussen de twee partners: het beschermt ze allebei.',
      test: 'Net zoals de indicator in het model toont alleen een test het. Laat je regelmatig testen.'
    },
    model: 'Dit labo is een model: mensen zijn geen reageerbuizen, en in het echte leven gaat een soa niet bij elk contact over. Maar het model toont hoe een infectie die je niet ziet zich verspreidt, en wat haar afremt.'
  },

  check: {
    noExperiment: 'Je hebt het experiment niet uitgevoerd: er zijn geen notities.',
    countsScore: (good, total) => `${good} / ${total} notities komen overeen met de testplaat.`,
    countsKey: 'Roze bolletje: roze putje op de plaat. ✓: jouw vinkje. Een rood vakje is een fout. Gestreept: beschermd tijdens die test.',
    countsAllGood: 'Al je notities komen overeen met de testplaat. Knap gedaan!',
    countsHow: 'Kijk goed naar elk putje van de plaat, vink alleen de roze aan en tel dan je vinkjes.',
    barLine: (cat, yours, expected) => `${cat}: je staaf toont ${yours}, je notities zeggen ${expected}.`,
    graphHow: 'Elke staaf moet tot het totaal van die test in je notities komen (1 vakje = 1 persoon).',
    yourTotals: (a, b, c) => `Je notities: ${a} na ronde 1, ${b} na ronde 2, ${c} na ronde 3.`,
    yourUnprot: (a, b, c) => `Personen zonder bescherming met de soa: ${a} in deel 1, ${b} met condooms, ${c} met het vaccin.`,
    judgedOk: 'Goed beoordeeld!',
    judgedWrong: 'Je beoordeling past niet bij je resultaten.',
    verdict: {
      confirmed: 'Je hypothese en je besluit zeggen hetzelfde: hypothese bevestigd.',
      rejected: 'Je hypothese en je besluit zeggen niet hetzelfde: hypothese verworpen.'
    },
    verdictProt: {
      confirmed: 'Je twee voorspellingen komen overeen met je twee besluiten: hypothese bevestigd.',
      partly: 'Maar één van je twee voorspellingen komt overeen met je besluiten: hypothese gedeeltelijk bevestigd.',
      rejected: 'Geen van je twee voorspellingen komt overeen met je besluiten: hypothese verworpen.'
    },
    pinkNote: list => `De plaat toonde roze putjes voor: ${list}.`,
    totalNote: n => `Er waren ${n} roze putjes.`,
    unprotNote: n => `${n} van de personen zonder bescherming hadden de soa.`,
    graphNote: list => `Je staven moeten overeenkomen met je totalen: ${list}.`,
    rightIs: sentence => `Het juiste antwoord, volgens je notities: ${sentence}`
  }
});
