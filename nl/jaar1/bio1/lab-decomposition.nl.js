/* ===== Labo virtuel « The vanishing leaves » (bio1) : textes en néerlandais =====

   Simulation commune aux deux filières : js/lab-decomposition.js, chargée
   après ce fichier. Mêmes clés que l'anglais
   (en/year1/bio1/lab-decomposition.en.js), seul le lexique (glossary) a ses
   propres mots.

   [mot] ou [mot|clé] : mot du lexique, souligné, traduction française au
   survol ou au toucher (clé dans glossary, en minuscules). Termes repris du
   chapitre : reducenten, schimmels, bacteriën, regenwormen, organische stof,
   minerale stof, kringloop van de stof.

   Phrases d'hypothèse et de conclusion : début + condition + comparaison +
   condition. En néerlandais, la phrase est une subordonnée (« Ik denk dat
   dode bladeren » + « in levende bodem » + « sneller verdwijnen dan » + « in
   gesteriliseerde bodem ») : le verbe est donc dans la comparaison, et
   answerStart est aussi une subordonnée. */

LabEngine.addText('decomposition', {
  labels: {
    title: 'De verdwijnende bladeren',

    // Masse au dixième, avec le séparateur décimal de la langue.
    num: v => v.toFixed(1).replace('.', ','),
    // « a, b en c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' en ' + names[names.length - 1] : names[0] || '',

    questions: {
      decomposers: 'Laten reducenten [dode bladeren] verdwijnen?',
      worms: '[Versnellen] [regenwormen] de afbraak van [dode bladeren]?',
      water: 'Verandert de vochtigheid de snelheid van de afbraak?',
      temperature: 'Verandert de temperatuur de snelheid van de afbraak?'
    },
    // Formes sans lexique, pour le rapport imprimé.
    questionsPlain: {
      decomposers: 'Laten reducenten dode bladeren verdwijnen?',
      worms: 'Versnellen regenwormen de afbraak van dode bladeren?',
      water: 'Verandert de vochtigheid de snelheid van de afbraak?',
      temperature: 'Verandert de temperatuur de snelheid van de afbraak?'
    },
    conditions: {
      soil: { living: 'in levende bodem', sterile: 'in gesteriliseerde bodem' },
      worms: { yes: 'met [regenwormen]', no: 'zonder [regenwormen]' },
      water: { moist: 'in [vochtige] bodem', dry: 'in [droge] bodem' },
      place: { room: 'bij 20 °C', fridge: 'in de [koelkast] (4 °C)' }
    },
    compare: { faster: 'sneller verdwijnen dan', slower: 'trager verdwijnen dan', same: 'even snel verdwijnen als' },
    leaves: { hazel: 'hazelaar', oak: 'eik', beech: 'beuk' },

    yourQuestion: 'Jouw onderzoeksvraag',
    leavesLine: leaf => `In dit labo werk je met dode bladeren van de [${leaf}].`,
    hypothesisTitle: 'Jouw hypothese',
    iThink: 'Ik denk dat dode bladeren',
    because: 'Waarom denk je dat? (niet verplicht)',
    becausePlaceholder: 'Omdat…',
    hypothesisReady: 'Je hypothese is klaar.',
    hypothesisPending: 'Tik op de woorden die je hypothese aanvullen.',
    toSetup: 'Verder: plan je experiment',

    setupIntro: leaf => `Maak je bokalen klaar. In elke bokaal komt een [netzakje] met <strong>10,0 g</strong> dode bladeren van de ${leaf}: je kunt het zakje eruit halen om de bladeren te [wegen]. Kies de omstandigheden in elke bokaal: verander alleen wat je wilt testen!`,
    jar: n => `Bokaal ${n}`,
    addJar: 'Bokaal toevoegen',
    removeJar: n => `Bokaal ${n} verwijderen`,
    factors: { soil: 'Bodem', worms: 'Regenwormen', water: 'Water', place: 'Temperatuur' },
    // Le facteur dans une phrase (« verschillen alleen in … »).
    factorNouns: { soil: 'de bodem (levend of gesteriliseerd)', worms: 'de regenwormen (wel of niet)', water: 'het water (vochtig of droog)', place: 'de temperatuur' },
    answerStart: 'De resultaten tonen dat dode bladeren',
    options: { living: 'Levend', sterile: 'Gesteriliseerd', yes: 'Ja', no: 'Nee', moist: 'Vochtig', dry: 'Droog', room: 'Kamer 20 °C', fridge: 'Koelkast 4 °C' },
    setupInfo: n => n === 0 ? 'Nog geen bokaal' : n === 1 ? '1 bokaal klaar' : `${n} bokalen klaar`,
    setupNoJar: 'Voeg eerst een bokaal toe.',
    setupOneJar: 'Met maar één bokaal: waarmee ga je die vergelijken?',
    lockHypothesis: 'Vul eerst je hypothese aan.',
    lockHypothesisFixed: 'Je hypothese ligt vast: het experiment is begonnen. Een wetenschapper verandert de hypothese niet na het zien van de resultaten!',
    lockNotStarted: 'Maak eerst je bokalen klaar en voer het experiment uit.',
    lockExperiment: n => `Werk eerst je experiment af: nog ${n} ${n === 1 ? 'massa' : 'massa’s'} te noteren in de tabel.`,
    lockWait: left => `Weeg eerst elk zakje en noteer de massa: nog ${left === 1 ? '1 bokaal' : left + ' bokalen'}.`,
    lockCell: n => `Weeg eerst het zakje van bokaal ${n} op de balans.`,
    startExperiment: 'Start het experiment',

    placeLabel: { room: 'Kamer · 20 °C', fridge: 'Koelkast · 4 °C' },
    condShort: {
      soil: { living: 'levende bodem', sterile: 'gesteriliseerde bodem' },
      worms: { yes: 'regenwormen', no: 'geen regenwormen' },
      water: { moist: 'vochtig', dry: 'droog' },
      place: { room: '20 °C', fridge: 'koelkast 4 °C' }
    },
    waitTwoWeeks: '2 weken wachten',
    waitReady: 'Klaar: laat de tijd verstrijken!',
    jarsLeft: n => n === 1 ? 'nog 1 bokaal te wegen' : `nog ${n} bokalen te wegen`,
    lastWeighing: 'Laatste weging',
    experimentOver: 'Experiment afgelopen',
    goConclude: 'Ga verder naar het besluit',
    timelineLabel: 'Weegdagen',
    tlWeigh: 'wegen!',
    tableNow: 'nu',
    changeSetup: 'Opstelling wijzigen',
    changeSetupTitle: 'De opstelling wijzigen?',
    changeSetupText: 'Je metingen worden gewist: je maakt je bokalen opnieuw klaar en begint weer bij week 0.',
    changeSetupYes: 'Ja, wijzigen',
    toConclude: 'Verder: besluiten',
    runInfo: (w, n, total) => `Week ${w} van 8 · ${n} / ${total} massa’s genoteerd`,
    missingPoints: 'Weeg eerst elk zakje en noteer de massa in de tabel.',
    balanceEmpty: 'Sleep een [zakje|netzakje] hierheen',
    balanceJar: n => `Bladeren van bokaal ${n}<br>([zakje getarreerd])`,
    weekBadge: w => `Week ${w}`,
    bagOf: n => `Zakje van bokaal ${n}: sleep het naar de balans, of tik erop`,
    captionStart: 'Elk zakje begint met 10,0 g bladeren: de eerste massa’s staan al in de tabel. Druk op “2 weken wachten” om de tijd te laten verstrijken.',
    captionWeigh: 'Sleep het [zakje|netzakje] van een bokaal naar de balans, of tik erop, om de bladeren te [wegen].',
    captionRecord: n => `Bladeren van bokaal ${n} [gewogen]. Lees de balans af en noteer de massa in de tabel.`,
    captionRecorded: 'Massa genoteerd. Weeg het volgende zakje.',
    captionAllPlaced: 'Alle zakjes zijn gewogen. Druk bovenaan op “2 weken wachten” om de tijd te laten verstrijken!',
    captionDone: 'Week 8: het experiment is afgelopen. Bekijk je grafiek en ga dan verder naar het besluit.',
    captionNeedWeigh: n => `[Weeg] eerst het zakje van bokaal ${n} op de balans.`,
    captionBadValue: 'Noteer de massa die de balans toont, in gram (bijvoorbeeld 7,4).',
    captionWaiting: 'Er gaan twee weken voorbij…',
    tableTitle: 'Jouw metingen',
    tableUnit: 'massa van de bladeren (g)',
    tableWeek: 'Week',
    cellLabel: (n, w) => `Massa van de bladeren van bokaal ${n}, week ${w}, in gram`,
    graphTitle: 'Jouw grafiek',
    axisY: 'Massa bladeren (g)',
    axisX: 'Tijd (weken)',

    concludeIntro: 'Gebruik je grafiek om de vraag te beantwoorden.',
    qPair: 'Welke twee bokalen vergelijk je?',
    qPairFixed: (a, b) => `Je vergelijkt bokaal ${a} en bokaal ${b}.`,
    qDiffer: 'Wat is er anders tussen die twee bokalen?',
    nothing: 'Niets',
    qAnswer: 'Mijn resultaten tonen dat dode bladeren',
    qVerdict: 'Dus mijn hypothese is',
    confirmed: 'bevestigd',
    rejected: 'verworpen',
    checkConclusions: 'Mijn besluiten controleren',
    backToLab: 'Terug naar het labo',

    scoreLabel: 'controles geslaagd',
    markCorrect: 'juist',
    markIncorrect: 'fout',
    criteria: { fair: 'Eerlijke test', points: 'Metingen', answer: 'Besluit', verdict: 'Hypothese' },
    criteriaSub: { fair: 'Jouw experiment', points: 'Jouw tabel', answer: 'Jouw antwoord', verdict: 'Jouw oordeel' },
    legendReading: 'aflezingen van de balans',

    report: {
      title: 'Laboratoriumverslag — De afbraak van dode bladeren',
      because: 'Omdat',
      materials: (n, leaf, extras) => `${n} glazen bokalen met deksel, aarde, ${n} netzakjes, ${n * 10} g dode bladeren van de ${leaf} (10,0 g per zakje)${extras.length ? ', ' + extras.join(', ') : ''}, een balans.`,
      extras: { oven: 'een oven (om de aarde te steriliseren)', worms: 'regenwormen', spray: 'een plantenspuit', fridge: 'een koelkast (4 °C)' },
      procedureStart: 'Doe aarde in elke bokaal, en leg er een netzakje met 10,0 g dode bladeren bovenop.',
      procedureJar: (n, desc) => `Bokaal ${n}: ${desc}.`,
      procedureWeigh: 'Haal om de 2 weken elk zakje eruit, weeg de bladeren (zakje getarreerd) en leg het zakje terug. Doe dat 8 weken lang.',
      procedureGraph: 'Teken een lijngrafiek van de massa van de bladeren in functie van de tijd.',
      tableWeek: 'Week',
      tableUnit: 'Massa van de bladeren (g)',
      pair: (a, b) => `bokaal ${a} en bokaal ${b}`,
      interpretation: (pair, a, b, diff, ma, mb) => `Ik vergeleek ${pair}. ${diff} Na 8 weken bleef er in bokaal ${a} nog ${ma} bladeren over, en in bokaal ${b} nog ${mb}.`,
      noteAnswer: right => `Bekijk je grafiek nog eens. Het juiste besluit: ${right}`,
      noteVerdict: (hyp, ans, should) => `Je hypothese zei “${hyp}”, je besluit zegt “${ans}”: ze ${should === 'confirmed' ? 'zeggen hetzelfde, dus je hypothese is bevestigd' : 'zeggen niet hetzelfde, dus je hypothese is verworpen'}.`,
      differ: list => `Ze verschillen in: ${list}.`,
      differNothing: 'Ze zijn op dezelfde manier klaargemaakt.',
      noData: 'geen meting',
      conclusion: (sentence, verdict) => `${sentence} Mijn hypothese is ${verdict}.`,
      score: n => `Score: ${n} / 4 controles geslaagd.`
    }
  },

  glossary: {
    'dode bladeren': 'feuilles mortes', versnellen: 'accélérer',
    regenwormen: 'vers de terre', reducenten: 'décomposeurs',
    vochtige: 'humide', droge: 'sec', koelkast: 'frigo',
    wegen: 'peser', weeg: 'pèse', gewogen: 'pesé',
    netzakje: 'sachet en filet', 'zakje getarreerd': 'sachet taré (la balance retire la masse du sachet)',
    hazelaar: 'noisetier', eik: 'chêne', beuk: 'hêtre',
    'eerlijke test': 'expérience équitable', schimmels: 'champignons',
    'voeden zich met': 'se nourrissent de', 'koude vertraagt de reducenten': 'le froid ralentit les décomposeurs',
    'blijft voedsel langer goed': 'la nourriture se conserve plus longtemps',
    'organische stof': 'matière organique', 'minerale stof': 'matière minérale', 'kringloop van de stof': 'cycle de la matière'
  },

  // Étape Check : ce qui se passe, selon la question tirée.
  explanations: {
    decomposers: 'In levende bodem leven [reducenten]: bacteriën en [schimmels], te klein om te zien. Ze [voeden zich met] de [dode bladeren] en zetten die [organische stof] om in [minerale stof], die terug in de bodem komt. Als je de aarde in een oven verwarmt, sterven ze: in gesteriliseerde bodem veranderen de bladeren bijna niet.',
    worms: '[Regenwormen] zijn ook [reducenten]. Ze trekken dode bladeren de bodem in, eten ze op en verkleinen ze tot heel kleine stukjes, zodat bacteriën en [schimmels] sneller werken. Zonder regenwormen verdwijnen de bladeren toch, maar trager: de bacteriën en schimmels zijn er nog.',
    water: '[Reducenten] hebben water nodig om te leven. In droge bodem zijn bacteriën en [schimmels] veel minder actief, dus blijven dode bladeren veel langer liggen.',
    temperature: '[Koude vertraagt de reducenten]. In de koelkast zijn bacteriën en [schimmels] veel minder actief, dus verdwijnen de bladeren trager. Daarom [blijft voedsel langer goed] in een koelkast.'
  },
  cycle: 'Zo recycleert een bos zijn dode bladeren: de [minerale stof] die de reducenten vrijmaken, voedt de planten opnieuw (de [kringloop van de stof]).',

  // f, d : noms de facteurs (labels.factorNouns) ; v, r : masses déjà
  // écrites (labels.num), v vaut null si rien n'a été noté.
  check: {
    fairOk: (a, b, f) => `Bokaal ${a} en ${b} verschillen alleen in ${f}. Al de rest is hetzelfde: dit is een [eerlijke test]. Een verschil in de resultaten kan dus alleen komen door ${f}.`,
    fairMany: (a, b, list, n) => `Bokaal ${a} en ${b} verschillen in ${n} dingen: ${list}. Als de bladeren in een van beide sneller verdwijnen, kun je niet weten welk verschil daarvoor zorgde.`,
    fairNone: (a, b) => `Bokaal ${a} en ${b} zijn precies hetzelfde klaargemaakt: door ze te vergelijken, kun je de vraag niet beantwoorden.`,
    fairOther: (a, b, d, f) => `Bokaal ${a} en ${b} verschillen alleen in ${d}, maar je vraag gaat over ${f}.`,
    fairBetter: (a, b) => `Bokaal ${a} en ${b} waren de [eerlijke test]: vergelijk die twee.`,
    fairNoPair: f => `Geen twee van je bokalen verschillen alleen in ${f}. Maak de volgende keer twee bokalen klaar die hetzelfde zijn, behalve ${f}.`,
    saidOk: 'Je zag goed wat er anders is tussen de twee bokalen.',
    saidWrong: (said, real) => `Jij zei dat ze verschillen in: ${said}. In werkelijkheid verschillen ze in: ${real}.`,
    noExperiment: 'Je hebt het experiment niet uitgevoerd: er zijn geen metingen.',
    pointsScore: (good, total) => `${good} / ${total} massa’s juist genoteerd (hetzelfde als wat de balans toonde).`,
    pointsAllGood: 'Al je massa’s komen overeen met wat de balans toonde. Goed afgelezen!',
    pointsMiss: (j, w, v, r) => v == null ? `Bokaal ${j}, week ${w}: niets genoteerd (de balans toonde ${r} g).` : `Bokaal ${j}, week ${w}: je noteerde ${v} g, de balans toonde ${r} g.`,
    pointsMore: n => `… en nog ${n}.`,
    answerOk: 'Juist!',
    answerWrong: 'Niet helemaal. Het juiste antwoord:',
    answerUnfair: 'Let op: je test was niet eerlijk, dus je eigen resultaten konden dit niet echt aantonen.',
    verdictOk: v => `Je hypothese en je besluit ${v === 'confirmed' ? 'zeggen hetzelfde' : 'zeggen niet hetzelfde'}: je hypothese is dus inderdaad ${v === 'confirmed' ? 'bevestigd' : 'verworpen'}. Goed geoordeeld!`,
    verdictWrong: (should) => `Vergelijk je hypothese met je besluit: ze ${should === 'confirmed' ? 'zeggen hetzelfde, dus je hypothese is bevestigd' : 'zeggen niet hetzelfde, dus je hypothese is verworpen'}.`,
    rejectedNote: 'Een verworpen hypothese is geen fout: zo gaat de wetenschap vooruit.',
    yourHyp: 'Jouw hypothese:',
    yourConcl: 'Jouw besluit:'
  }
});
