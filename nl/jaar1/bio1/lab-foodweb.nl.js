/* ===== Labo virtuel « Pull one thread » (bio1) : textes en néerlandais =====

   Simulation commune aux deux filières : js/lab-foodweb.js, chargée après ce
   fichier. Mêmes clés que l'anglais (en/year1/bio1/lab-foodweb.en.js).

   Chaque mot du lexique (glossary) est souligné partout où il apparaît,
   sauf dans les boutons (lab-engine.js) ; [mot] ou [mot|clé] reste utile
   pour une forme dont la clé diffère.

   Termes du chapitre NL : « voedselweb », « voedselketen », « producent »,
   « consument », « wetenschappelijk model », « hert » (vocabulary.json).
   Une cause (conclusion a) est une subordonnée après « omdat » : le verbe
   va à la fin. */

LabEngine.addText('foodweb', {
  labels: {
    title: 'Trek aan één draad',

    // « a, b en c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' en ' + names[names.length - 1] : names[0] || '',

    /* Les êtres vivants (la réserve : 12 par partie) : name (carte, jeton),
       short (dans une chaîne), the (dans une phrase), many (le groupe :
       « het aantal vossen »). */
    species: {
      oak: { name: 'Eik', short: 'eik', the: 'de eik', many: 'eiken' },
      beech: { name: 'Beuk', short: 'beuk', the: 'de beuk', many: 'beuken' },
      hazel: { name: 'Hazelaar', short: 'hazelaar', the: 'de hazelaar', many: 'hazelaars' },
      grass: { name: 'Gras', short: 'gras', the: 'het gras', many: 'gras' },
      bramble: { name: 'Braamstruik', short: 'braamstruik', the: 'de braamstruik', many: 'braamstruiken' },
      rabbit: { name: 'Konijn', short: 'konijn', the: 'het konijn', many: 'konijnen' },
      mouse: { name: 'Bosmuis', short: 'bosmuis', the: 'de bosmuis', many: 'bosmuizen' },
      deer: { name: 'Hert', short: 'hert', the: 'het hert', many: 'herten' },
      boar: { name: 'Wild zwijn', short: 'wild zwijn', the: 'het wilde zwijn', many: 'wilde zwijnen' },
      caterpillar: { name: 'Rups', short: 'rups', the: 'de rups', many: 'rupsen' },
      squirrel: { name: 'Eekhoorn', short: 'eekhoorn', the: 'de eekhoorn', many: 'eekhoorns' },
      snail: { name: 'Slak', short: 'slak', the: 'de slak', many: 'slakken' },
      bluetit: { name: 'Pimpelmees', short: 'pimpelmees', the: 'de pimpelmees', many: 'pimpelmezen' },
      fox: { name: 'Vos', short: 'vos', the: 'de vos', many: 'vossen' },
      owl: { name: 'Bosuil', short: 'bosuil', the: 'de bosuil', many: 'bosuilen' },
      buzzard: { name: 'Buizerd', short: 'buizerd', the: 'de buizerd', many: 'buizerds' },
      wolf: { name: 'Wolf', short: 'wolf', the: 'de wolf', many: 'wolven' },
      hedgehog: { name: 'Egel', short: 'egel', the: 'de egel', many: 'egels' },
      marten: { name: 'Boommarter', short: 'boommarter', the: 'de boommarter', many: 'boommarters' }
    },
    // Ce qu'un animal mange d'une plante : ses vruchten ou ses bladeren.
    parts: {
      oak: { fruit: 'eikels', leaf: 'eikenbladeren' },
      beech: { fruit: 'beukennootjes', leaf: 'beukenbladeren' },
      hazel: { fruit: 'hazelnoten', leaf: 'hazelaarbladeren' },
      grass: { fruit: 'graszaad', leaf: 'gras' },
      bramble: { fruit: 'bramen', leaf: 'braambladeren' }
    },
    /* Les cartes écologiques. Une plante : une phrase. Un animal : une
       fonction qui reçoit ce qu'il mange dans le réseau de la partie, déjà
       en liste (« konijnen en bosmuizen »). */
    cards: {
      oak: 'Een boom: maakt zelf voedsel met zonlicht. Vruchten: eikels.',
      beech: 'Een boom: maakt zelf voedsel met zonlicht. Vruchten: beukennootjes.',
      hazel: 'Een struik: maakt zelf voedsel met zonlicht. Vruchten: hazelnoten.',
      grass: 'Een plant: maakt zelf voedsel met zonlicht.',
      bramble: 'Een plant met bramen: maakt zelf voedsel met zonlicht.',
      rabbit: f => `Eet ${f}.`,
      mouse: f => `Eet ${f}.`,
      deer: f => `Eet ${f}.`,
      boar: f => `Eet ${f}.`,
      caterpillar: f => `Eet ${f}.`,
      squirrel: f => `Eet ${f}.`,
      snail: f => `Eet ${f}.`,
      bluetit: f => `Eet ${f}.`,
      fox: f => `Jaagt op ${f}.`,
      owl: f => `Jaagt ’s nachts op ${f}.`,
      buzzard: f => `Jaagt op ${f}.`,
      wolf: f => `Jaagt in een roedel op ${f}.`,
      hedgehog: f => `Eet ’s nachts ${f}.`,
      marten: f => `Jaagt in de bomen en op de grond op ${f}.`
    },
    numberOf: (many, cap) => `${cap ? 'Het' : 'het'} aantal ${many}`,

    questions: {
      main: 'Wat gebeurt er met een bos als één soort verdwijnt?',
      a: 'Welke soorten veranderen, en hoe?',
      b: 'Houdt een voedselweb beter stand dan één enkele voedselketen?'
    },
    yourQuestion: 'Jouw onderzoeksvraag',
    hypothesisTitle: 'Jouw hypothese',
    scenario: sick => `In een Belgisch bos doodt een ziekte alle ${sick}. Wat gebeurt er in de volgende 10 jaar?`,
    hypWeb: 'In het voedselweb van het bos:',
    hypChain: chain => `In één enkele voedselketen (${chain}):`,
    hypRow: num => `${num} zal:`,
    // Les quatre allures : will (hypothèse), trends (phrase), trendShort (schrift).
    will: { rise: 'stijgen', same: 'ongeveer gelijk blijven', fall: 'dalen', gone: 'tot nul dalen' },
    trends: { rise: 'stijgt', same: 'blijft ongeveer gelijk', fall: 'daalt', gone: 'daalt tot nul' },
    trendShort: { rise: 'stijgt', same: 'gelijk', fall: 'daalt', gone: 'tot nul' },
    because: 'Waarom denk je dat? (niet verplicht)',
    becausePlaceholder: 'Omdat…',
    hypothesisReady: 'Je hypothese is klaar.',
    hypothesisPending: 'Kies één curve voor elk levend wezen.',
    toModel: 'Verder: het model',
    lockHypothesis: 'Kies eerst één curve voor elk levend wezen.',
    lockHypothesisFixed: 'Je hypothese ligt vast: het model heeft al gelopen. Een wetenschapper verandert zijn hypothese niet nadat hij de resultaten gezien heeft!',

    tabs: { model: 'Het model', disease: 'De ziekte' },

    // Onglet 1 : le modèle
    modes: { place: '1 · Kaarten plaatsen', arrows: '2 · Pijlen tekenen' },
    rows: ['Consumenten die dieren eten', 'Consumenten die planten eten', 'Producenten'],
    cardsTitle: 'De ecologische kaarten',
    onBoard: 'in het model',
    checkRows: 'De rijen controleren',
    compare: 'Vergelijken met de kaarten',
    comparesCount: (rows, arrows) => (rows || arrows ? `Rijcontroles: ${rows} · Pijlvergelijkingen: ${arrows}` : 'Lees de kaarten goed voor je controleert.'),
    rowsResult: n => (n === 1 ? '1 kaart ligt in de verkeerde rij.' : `${n} kaarten liggen in de verkeerde rij.`),
    rowsOk: 'Alle kaarten liggen in de juiste rij.',
    rowsLegend: 'Op het model ligt een rode kaart in de verkeerde rij.',
    compareResult: (right, missing, wrong) => `Pijlen: ${right} juist, ${missing} ontbreken, ${wrong} fout.`,
    compareOk: 'Je model komt overeen met de kaarten. Goed gedaan!',
    compareLegend: 'Op het model: een rode pijl is fout, en „!” toont een levend wezen waarbij een pijl ontbreekt (iets wat het eet).',
    missingHere: 'Hier ontbreekt een pijl: iets wat het eet',
    captionPlace: 'Neem een kaart (raak ze aan) en raak dan een vrije plaats van het model aan. Producenten onderaan!',
    captionPlaced: 'Alle kaarten liggen in het model. Controleer de rijen.',
    captionRowsOk: 'Alle kaarten liggen in de juiste rij! Teken nu de pijlen: „wordt gegeten door”.',
    lockRowsFirst: 'Controleer eerst de rijen van je kaarten.',
    lockRowsDone: 'Je kaarten liggen in de juiste rijen: teken nu de pijlen.',
    captionHold: n => `${n}: raak een vrije plaats van het model aan.`,
    captionArrows: 'Raak eerst het voedsel aan, en dan het levende wezen dat het eet. De pijl betekent „wordt gegeten door”. Om een pijl weg te halen, raak je hem aan.',
    captionFrom: the => `Raak nu het levende wezen aan dat ${the} eet.`,
    captionAdded: (a, b) => `Nieuwe pijl: ${a} wordt gegeten door ${b}.`,
    captionPicked: (a, b) => `Pijl ${a} → ${b}: raak hem nog eens aan om hem weg te halen.`,
    captionRemoved: (a, b) => `Pijl weggehaald: ${a} → ${b}.`,
    captionTurned: (a, b) => `Pijl omgedraaid: ${a} wordt gegeten door ${b}.`,
    captionModelDone: 'Je model is klaar. Verder: de ziekte!',
    lockArrows: n => `Plaats eerst alle kaarten: nog ${n === 1 ? '1 kaart' : n + ' kaarten'}.`,
    lockPlaceAll: 'Plaats eerst alle kaarten in het model.',
    lockNoArrow: 'Teken eerst de pijlen.',
    lockModelDone: 'Je model komt overeen met de kaarten: het is klaar.',
    lockDisease: 'Je model moet eerst overeenkomen met de kaarten.',

    // Onglet 2 : la maladie
    testTitle: { 1: 'Test 1 · het voedselweb', 2: 'Test 2 · één enkele voedselketen' },
    banner1: sick => `Een ziekte doodt alle ${sick}. Alle andere levende wezens van je model blijven in het bos.`,
    banner2: sick => `Dezelfde ziekte doodt alle ${sick}, maar in één enkele voedselketen.`,
    runModel: 'Het model laten lopen: 10 jaar',
    runAgain: 'Opnieuw laten lopen',
    captionTest1: 'Laat het model lopen en kijk naar de grafieken.',
    captionTest2: 'Test 2: dezelfde ziekte, in één enkele voedselketen. Laat het model lopen.',
    captionYear: y => `Jaar ${y}…`,
    captionRan1: 'Tien jaar later… Lees de grafieken af en vul je schrift aan.',
    captionRan2: 'Tien jaar later… Lees de grafieken af en vul je schrift aan.',
    captionTest2Open: 'Test 1 staat in je schrift. Verder: test 2!',
    lockRunning: 'Het model loopt. Wacht tot het einde.',
    lockTest2: 'Vul eerst je schrift voor test 1 aan.',
    lockRun1First: 'Laat eerst test 1 lopen.',
    lockRun2First: 'Laat eerst test 2 lopen.',
    graphTitle: many => `Aantal ${many}`,
    axisX: 'Tijd (jaar)',
    axisY: 'Aantal',
    pointValue: (year, v) => `Jaar ${year}: ${v}`,
    tapPoint: 'Raak een punt aan om zijn waarde te zien.',

    notebookTitle: 'Jouw schrift',
    notebookHint: 'Lees de grafieken af: het aantal in jaar 0 en in jaar 10, en dan de vorm van de curve.',
    yearShort: y => `Jaar ${y}`,
    numAria: (many, y) => `Aantal ${many}, jaar ${y}`,

    toDisease: 'Verder: de ziekte',
    toConclude: 'Verder: besluiten',
    lockModel: 'Je model moet eerst overeenkomen met de kaarten.',
    lockTests: 'Laat test 1 en test 2 lopen.',
    lockNotes: n => `Vul je schrift aan: nog ${n === 1 ? '1 antwoord' : n + ' antwoorden'}.`,
    runInfo: (p, pt, n, nt) => `Kaarten: ${p} / ${pt} · Schrift: ${n} / ${nt}`,

    // Étape 3
    resultsTitle: 'Jouw resultaten',
    trendHead: 'Curve',
    recapRow: (short, chain) => (chain ? `${short} (enkele keten)` : short),
    zoom: title => `${title}: de grafieken groot tonen`,
    choose: '— kies —',
    conclA: (num, trend, cause) => `${num} ${trend}, omdat ${cause}.`,
    trendAria: many => `Hoe het aantal ${many} verandert`,
    causeAria: many => `Waarom het aantal ${many} verandert`,
    causes: { less: 'ze minder voedsel hebben', hunted: 'er meer op hen gejaagd wordt', more: 'ze meer voedsel hebben', none: 'er niets verandert aan hun voedsel of hun roofdieren', disease: 'de ziekte hen ook doodt' },
    conclB: (resist, reason) => `Een voedselweb ${resist} dan één enkele voedselketen, omdat de dieren in een voedselweb ${reason}.`,
    resist: { better: 'houdt dus beter stand', worse: 'houdt dus niet beter stand' },
    reasons: { other: 'andere voedselbronnen hebben', babies: 'meer jongen krijgen', strong: 'sterker zijn' },
    reasonAria: 'Waarom',
    verdictTitle: 'Jouw hypothese',
    verdictRow: (short, chain) => (chain ? `${short} (enkele keten)` : short),
    confirmed: 'bevestigd',
    rejected: 'verworpen',
    checkConclusions: 'Mijn besluiten controleren',
    backToLab: 'Terug naar het labo',

    // Étape 4
    scoreLabel: 'controles geslaagd',
    markCorrect: 'juist',
    markIncorrect: 'fout',
    criteria: { model: 'Model', notes: 'Waarnemingen', answerA: 'Vraag a', answerB: 'Vraag b', verdicts: 'Hypothese' },
    criteriaSub: { model: 'Jouw voedselweb', notes: 'Jouw schrift', answerA: 'Welke soorten veranderen?', answerB: 'Web of keten?', verdicts: 'Jouw oordeel' },
    rightWeb: 'Het voedselweb van de kaarten (de pijl betekent „wordt gegeten door”):',
    webTitle: 'Mijn model van het voedselweb',
    // Bijzin : « zal » vlak voor het laatste werkwoord (tot nul zal dalen).
    hypText: (num, will) => `Ik denk dat ${num} ${will.replace(/(\S+)$/, 'zal $1')}.`,
    hypChainText: (chain, num, will) => `In één enkele voedselketen (${chain}) denk ik dat ${num} ${will.replace(/(\S+)$/, 'zal $1')}.`,

    report: {
      title: 'Laboratoriumverslag — Trek aan één draad',
      because: 'Omdat',
      materials: '12 ecologische kaarten van een Belgisch bos. Een computermodel van het voedselweb dat 10 jaar loopt.',
      procedure: (sick, chain) => [
        'Leg elke ecologische kaart op haar niveau: producenten onderaan, dan consumenten die planten eten, dan consumenten die dieren eten. Controleer de rijen tot elke kaart in de juiste rij ligt.',
        'Teken de pijlen („wordt gegeten door”) en vergelijk ze met de kaarten tot het model overeenkomt.',
        `Test 1: een ziekte doodt alle ${sick}. Laat het model 10 jaar lopen en lees de grafieken af.`,
        `Test 2: dezelfde ziekte in één enkele voedselketen (${chain}). Laat het model lopen en lees de grafiek af.`,
        'Noteer in het schrift het aantal in jaar 0 en in jaar 10, en de vorm van elke curve.'
      ],
      rows: n => `De kaarten lagen in de juiste rijen na ${n === 1 ? '1 controle' : n + ' controles'}.`,
      model: n => `De pijlen kwamen overeen met de kaarten na ${n === 1 ? '1 vergelijking' : n + ' vergelijkingen'}.`,
      notesCaption: 'Schrift: aantal dieren',
      change: (row, a, b) => `${row}: van ${a} (jaar 0) naar ${b} (jaar 10).`,
      verdict: (row, word) => `${row}: mijn hypothese is ${word}.`,
      score: n => `Score: ${n} / 5 controles geslaagd.`
    }
  },

  glossary: {
    voedselweb: 'réseau trophique', voedselketen: 'chaîne alimentaire', 'één enkele': 'un(e) seul(e)',
    'wordt gegeten door': 'est mangé par', eet: 'mange', eten: 'manger', 'jaagt op': 'chasse', gejaagd: 'chassé',
    ziekte: 'maladie', soort: 'espèce', soorten: 'espèces', 'levend wezen': 'être vivant', 'levende wezens': 'êtres vivants',
    'levende wezen': 'être vivant', voedsel: 'nourriture', roofdieren: 'prédateurs', voedselbronnen: 'sources de nourriture', bladeren: 'feuilles',
    eik: 'chêne', eiken: 'chênes', eikels: 'glands', eikenbladeren: 'feuilles de chêne', gras: 'herbe',
    braamstruik: 'ronce', braamstruiken: 'ronces', bramen: 'mûres', braambladeren: 'feuilles de ronce',
    beuk: 'hêtre', beuken: 'hêtres', beukennootjes: 'faînes', beukenbladeren: 'feuilles de hêtre', hazelaar: 'noisetier',
    hazelaars: 'noisetiers', hazelnoten: 'noisettes', hazelaarbladeren: 'feuilles de noisetier', struik: 'arbuste', graszaad: 'graines d’herbe',
    'wild zwijn': 'sanglier', 'wilde zwijnen': 'sangliers', 'wilde zwijn': 'sanglier', slak: 'escargot', slakken: 'escargots',
    wolf: 'loup', wolven: 'loups', egel: 'hérisson', egels: 'hérissons', boommarter: 'martre', boommarters: 'martres', roedel: 'meute',
    konijn: 'lapin', konijnen: 'lapins', bosmuis: 'mulot', bosmuizen: 'mulots', hert: 'cerf', herten: 'cerfs',
    rups: 'chenille', rupsen: 'chenilles', eekhoorn: 'écureuil', eekhoorns: 'écureuils',
    pimpelmees: 'mésange bleue', pimpelmezen: 'mésanges bleues', vos: 'renard', vossen: 'renards',
    bosuil: 'chouette hulotte', bosuilen: 'chouettes hulottes', buizerd: 'buse', buizerds: 'buses',
    stijgt: 'augmente', daalt: 'diminue', 'blijft ongeveer gelijk': 'reste à peu près pareil', verdwijnt: 'disparaît', 'tot nul': 'jusqu’à zéro',
    aantal: 'nombre', rij: 'rangée', pijlen: 'flèches', pijl: 'flèche', jongen: 'petits', sterker: 'plus forts',
    'beter stand': 'résiste mieux', zonlicht: 'la lumière du soleil', vruchten: 'fruits',
    overeenkomen: 'correspondre', 'komt overeen': 'correspond', 'kwam overeen': 'correspondait', verkeerde: 'mauvaise',
    schrift: 'cahier', '’s nachts': 'la nuit'
  },

  // Étape Check : pourquoi chaque espèce change.
  explanations: {
    pred: (pred, sick, others) => `De ${pred} eten ${sick}, maar ook ${others}. Zonder ${sick} hebben ze minder voedsel: hun aantal daalt. Maar ze verdwijnen niet, want ze hebben nog ander voedsel.`,
    other: (other, preds, sick) => `De ${preds} kunnen geen ${sick} meer eten: ze jagen meer op ${other}. Daardoor daalt het aantal ${other}.`,
    other2: (other, top, mid, sick) => `Zonder ${sick} hebben de ${mid} minder voedsel: er zijn minder ${mid}. De ${top} eten ${mid} en ${other}: nu jagen ze meer op ${other}. Daardoor daalt het aantal ${other}.`,
    same: (who, sick) => `De ${who} eten geen ${sick}, en ${sick} eten geen ${who}: hun voedsel en hun roofdieren blijven dezelfde. Daardoor blijft hun aantal ongeveer gelijk.`,
    rival: (rival, food, sick) => `De ${sick} en de ${rival} aten hetzelfde voedsel: ${food}. Zonder ${sick} is er meer ${food} voor de ${rival}: hun aantal stijgt.`,
    // Les flèches qui arrivent à un mangeur : « konijn en bosmuis → vos ».
    eats: (eater, foods) => `${foods} → ${eater}`,
    chain: (pred, sick) => `In één enkele voedselketen eten de ${pred} alleen ${sick}. Zonder ${sick} hebben ze niets meer te eten: ze verdwijnen.`,
    web: 'Een voedselweb bestaat uit veel voedselketens die dezelfde levende wezens delen. Als één soort verdwijnt, hebben de meeste dieren nog andere voedselbronnen: een voedselweb is stabieler dan één enkele voedselketen.',
    model: 'Jouw voedselweb is een wetenschappelijk model: een vereenvoudigde voorstelling van de werkelijkheid. Een echt Belgisch bos heeft veel meer levende wezens, en de aantallen veranderen ook door het weer en andere ziektes. Maar het model helpt om te begrijpen wat er kan gebeuren.'
  },

  check: {
    nothing: 'niets',
    modelOk: n => `Je model kwam overeen met de kaarten na ${n === 1 ? '1 vergelijking' : n + ' vergelijkingen'}. Goed gedaan!`,
    modelKo: n => `Je model kwam pas na ${n} vergelijkingen overeen met de kaarten.`,
    modelRule: max => `Doel: lees de kaarten goed, en vergelijk hoogstens ${max} keer.`,
    notesScore: (good, total) => `${good} / ${total} waarnemingen komen overeen met de grafieken.`,
    notesAllGood: 'Jouw schrift komt overeen met de grafieken. Goed waargenomen!',
    readWrong: (row, year, said, right) => `${row}, jaar ${year}: je schreef ${said}, maar de grafiek toont ${right}.`,
    trendWrong: (row, said, right) => `${row}: je schreef „${said}”, maar de curve ${right}.`,
    readHow: 'Een grafiek aflezen: zoek het jaar op de horizontale as, ga omhoog tot het punt, en dan naar links tot de verticale as. Eén lijn van het rooster meer of minder wordt aanvaard.',
    answerOk: 'Juist!',
    answerWrong: 'Niet helemaal. Het juiste antwoord:',
    yourHyp: 'je hypothese:',
    yourResult: 'je resultaat:',
    verdictOk: v => `Je hypothese en je resultaat ${v === 'confirmed' ? 'zeggen hetzelfde' : 'zeggen niet hetzelfde'}: je hypothese is dus inderdaad ${v === 'confirmed' ? 'bevestigd' : 'verworpen'}. Goed geoordeeld!`,
    verdictWrong: should => `Vergelijk je hypothese met je resultaat: ze ${should === 'confirmed' ? 'zeggen hetzelfde, dus je hypothese is bevestigd' : 'zeggen niet hetzelfde, dus je hypothese is verworpen'}.`,
    rejectedNote: 'Een verworpen hypothese is geen fout: zo gaat de wetenschap vooruit.'
  }
});
