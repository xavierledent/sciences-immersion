/* ===== Labo virtuel « From the Earth and back » (chem1) : textes en néerlandais =====

   Simulation commune aux deux filières : js/lab-lifecycle.js, chargée après
   ce fichier. Mêmes clés que l'anglais (en/year1/chem1/lab-lifecycle.en.js).

   Chaque mot du lexique (glossary) est souligné partout où il apparaît,
   sauf dans les boutons (lab-engine.js) ; [mot] ou [mot|clé] reste utile
   pour une forme dont la clé diffère.

   Termes du chapitre NL : « levenscyclus », « winning van grondstoffen »,
   « productie », « distributie », « gebruik », « afdanking », « recyclage »,
   « nemen » (TAKING), « staafdiagram » ; énergie en « eenheden », comme dans
   les labos de physique. En Belgique : « PMD-zak », « glasbol »,
   « statiegeld », « restafval ». */

LabEngine.addText('lifecycle', {
  labels: {
    title: 'Van de aarde en terug',

    // « a, b en c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' en ' + names[names.length - 1] : names[0] || '',
    // Nombres décimaux : virgule en néerlandais.
    num: v => String(v).replace('.', ','),

    question: 'Weggooien, recycleren of hergebruiken: welke manier is het beste voor de planeet?',
    yourQuestions: 'Jouw onderzoeksvragen',
    question2: 'Als de voorwerpen weggegooid worden, welke stap van de levenscyclus verbruikt dan de meeste energie?',
    hypothesisTitle: 'Jouw hypothese',
    hypIntro: 'Rangschik de drie manieren, van de beste tot de slechtste voor de planeet.',
    hypIntro2: 'Kies de stap die de meeste energie verbruikt als de voorwerpen weggegooid worden.',
    places: ['1ste: de beste', '2de', '3de: de slechtste'],
    hypText: list => `Ik denk dat de manieren, van de beste tot de slechtste voor de planeet, deze zijn: ${list}.`,
    hypText2: step => `Ik denk dat ${step} de stap is die de meeste energie verbruikt als de voorwerpen weggegooid worden.`,
    because: 'Waarom denk je dat? (niet verplicht)',
    becausePlaceholder: 'Omdat…',
    hypothesisReady: 'Je hypothese is klaar.',
    hypothesisPending: 'Rangschik de drie manieren en kies een stap.',
    toJourney: 'Verder: de reis',
    lockHypothesis: 'Beantwoord de twee delen van je hypothese: rangschik de drie manieren en kies een stap.',
    lockHypothesisFixed: 'Je hypothese ligt vast: het model heeft al gelopen. Een wetenschapper verandert zijn hypothese niet nadat hij de resultaten gezien heeft!',

    // Les étapes du cycle de vie (schéma du cours), les trois façons, les quatre compteurs.
    steps: {
      extraction: 'Winning van grondstoffen', manufacturing: 'Productie', distribution: 'Distributie',
      use: 'Gebruik', disposal: 'Afdanking', recycling: 'Recyclage'
    },
    // Dans une phrase (« … is de stap die de meeste energie verbruikt »).
    stepIn: {
      extraction: 'de winning van grondstoffen', manufacturing: 'de productie', distribution: 'de distributie',
      use: 'het gebruik', disposal: 'de afdanking', recycling: 'de recyclage'
    },
    ways: { throw: { name: 'Weggooien', lower: 'weggooien' }, recycle: { name: 'Recycleren', lower: 'recycleren' }, reuse: { name: 'Hergebruiken', lower: 'hergebruiken' } },
    counters: {
      raw: { name: 'Grondstoffen', unit: 'kg' }, energy: { name: 'Energie', unit: 'eenheden' },
      co2: { name: 'CO₂', unit: 'kg' }, waste: { name: 'Afval', unit: 'kg' }
    },
    taking: 'NEMEN',
    givingBack: 'TERUGGEVEN',

    /* Les objets : many (« 3 smartphones »), period (la durée, à la suite
       d'un titre), scenario (la situation), ways (ce que veut dire chaque
       façon pour cet objet), loop (la boucle de la réutilisation, sur le
       dessin), events (les six cartes du voyage). */
    objects: {
      lunchbox: {
        many: q => `${q} brooddozen`,
        period: 'in 6 jaar secundair onderwijs',
        scenario: q => `Je hebt een aluminium brooddoos nodig voor je 6 jaar secundair onderwijs. Veel leerlingen krijgen elk schooljaar een nieuwe: dat zijn ${q} brooddozen.`,
        ways: {
          throw: 'elk jaar gaat de oude brooddoos bij het restafval (grijze vuilnisbak).',
          recycle: 'elk jaar gaat de oude brooddoos naar het containerpark, bij de metalen.',
          reuse: 'je houdt dezelfde brooddoos 6 jaar: je wast ze en herstelt haar sluitingen.'
        },
        loop: 'gewassen en opnieuw gebruikt',
        events: {
          extraction: 'Enorme machines graven bauxiet uit de ondergrond. Het wordt omgezet in zuiver aluminium.',
          manufacturing: 'Een fabriek perst aluminium platen tot dozen en deksels, en zet er sluitingen op.',
          distribution: 'Vrachtwagens brengen de brooddozen naar de winkels.',
          use: 'Elke schooldag neem je je boterhammen mee in de brooddoos.',
          disposal: 'De oude brooddoos gaat bij het restafval: ze wordt afval.',
          recycling: 'De oude brooddoos wordt gesmolten om nieuw aluminium te maken.'
        }
      },
      phone: {
        many: q => `${q} smartphones`,
        period: 'in 6 jaar secundair onderwijs',
        scenario: q => `In 6 jaar secundair onderwijs gebruik je ${q} smartphones, de ene na de andere.`,
        ways: {
          throw: 'de oude smartphones belanden bij het restafval (grijze vuilnisbak).',
          recycle: 'de oude smartphones gaan terug naar de winkel: hun metalen worden teruggewonnen.',
          reuse: 'je koopt refurbished smartphones: tweedehands, nagekeken en hersteld.'
        },
        loop: 'hersteld en opnieuw gebruikt',
        events: {
          extraction: 'Mijnen graven veel gesteente op om een paar gram koper, goud en andere metalen te krijgen.',
          manufacturing: 'Fabrieken maken de chips, het scherm en de batterij, en zetten de smartphone in elkaar.',
          distribution: 'Vliegtuigen, schepen en vrachtwagens brengen de smartphones naar de winkels.',
          use: 'Je belt, chat en laadt je smartphone elke dag op.',
          disposal: 'De oude smartphone gaat bij het restafval: zijn metalen gaan verloren.',
          recycling: 'De oude smartphone wordt uit elkaar gehaald: koper, goud en andere metalen worden teruggewonnen.'
        }
      },
      pan: {
        many: q => `${q} inox kookpotten`,
        period: 'in 6 jaar',
        scenario: q => `In 6 jaar heeft je gezin ${q} kookpotten van roestvrij staal (inox) nodig: telkens een nieuwe als de oude beschadigd is.`,
        ways: {
          throw: 'de beschadigde kookpotten gaan bij het restafval (grijze vuilnisbak).',
          recycle: 'de beschadigde kookpotten gaan naar het containerpark: het staal wordt gerecycleerd.',
          reuse: 'de kookpotten worden hersteld (een nieuw handvat) of tweedehands gekocht.'
        },
        loop: 'hersteld en opnieuw gebruikt',
        events: {
          extraction: 'Mijnen graven ijzererts, chroom en nikkel uit de ondergrond. Ze worden omgezet in roestvrij staal.',
          manufacturing: 'Een fabriek perst stalen platen tot kookpotten, poetst ze op en zet er een handvat aan.',
          distribution: 'Vrachtwagens brengen de kookpotten naar de winkels.',
          use: 'Je gezin kookt bijna elke dag met de kookpot.',
          disposal: 'De beschadigde kookpot gaat bij het restafval: hij wordt afval.',
          recycling: 'De beschadigde kookpot wordt samen met ander oud staal gesmolten om nieuw staal te maken.'
        }
      },
      glass: {
        many: q => `${q} flessen fruitsap`,
        period: 'in één schooljaar',
        scenario: q => `In één schooljaar drinkt je gezin ${q} glazen flessen fruitsap.`,
        ways: {
          throw: 'de lege flessen gaan bij het restafval (grijze vuilnisbak).',
          recycle: 'de lege flessen gaan in de glasbol.',
          reuse: 'flessen met statiegeld: de winkel neemt ze terug, ze worden gewassen en opnieuw gevuld.'
        },
        loop: 'gewassen en opnieuw gevuld',
        events: {
          extraction: 'Machines halen zand en kalksteen uit een groeve.',
          manufacturing: 'In een glasfabriek wordt het zand bij 1500 °C gesmolten en tot flessen gevormd.',
          distribution: 'Vrachtwagens brengen de volle flessen fruitsap naar de winkels.',
          use: 'Je gezin opent een fles en drinkt het fruitsap.',
          disposal: 'De lege fles gaat bij het restafval: glas brandt niet, het wordt afval.',
          recycling: 'De lege fles wordt vermalen en gesmolten om nieuw glas te maken.'
        }
      },
      tshirts: {
        many: q => `${q} T-shirts`,
        period: 'in één schooljaar',
        scenario: q => `In één schooljaar heb je ${q} T-shirts nodig.`,
        ways: {
          throw: 'de oude T-shirts gaan bij het restafval (grijze vuilnisbak).',
          recycle: 'de oude T-shirts gaan in de textielcontainer.',
          reuse: 'je koopt tweedehands T-shirts in plaats van nieuwe.'
        },
        loop: 'opnieuw gedragen',
        events: {
          extraction: 'Katoenplanten groeien op een veld. Daarna wordt het katoen geplukt.',
          manufacturing: 'Fabrieken spinnen het katoen tot garen, weven de stof, verven ze en naaien de T-shirts.',
          distribution: 'Schepen en vrachtwagens brengen de T-shirts naar de winkels.',
          use: 'Je draagt het T-shirt en wast het vaak.',
          disposal: 'Het oude T-shirt gaat bij het restafval: het wordt verbrand.',
          recycling: 'Het oude T-shirt wordt tot vezels verwerkt om nieuwe stof te maken.'
        }
      }
    },

    tabs: { journey: 'De reis', ways: 'Drie manieren', graph: 'De grafiek' },
    toView: { ways: 'Verder: drie manieren', graph: 'Verder: de grafiek' },
    toConclude: 'Verder: besluiten',

    // Onglet 1 : le voyage
    cardsTitle: 'De reis: zes kaarten',
    cardsHint: 'Elke kaart is een moment in het leven van het voorwerp. Neem een kaart (raak haar letter aan) en raak dan haar stap van de levenscyclus aan.',
    cardAria: l => `Kaart ${l}`,
    dropHere: 'Leg hier een kaart',
    placedCount: (n, t) => `Geplaatste kaarten: ${n} / ${t}`,
    captionJourney: 'Leg elke kaart op haar stap van de levenscyclus.',
    captionHold: l => `Kaart ${l}: raak een vrije stap van de levenscyclus aan.`,
    captionJourneyDone: 'Alle kaarten liggen op de levenscyclus. Verder: de drie manieren!',
    lockJourney: n => `Leg eerst alle kaarten op de levenscyclus: nog ${n === 1 ? '1 kaart' : n + ' kaarten'}.`,

    // Onglet 2 : les trois façons
    ringTitle: 'De levenscyclus van het voorwerp',
    gaugesTitle: 'De vier tellers',
    gaugesFor: way => `De tellers · ${way}`,
    runWay: way => `Laten lopen: ${way}`,
    runAgain: 'Opnieuw laten lopen',
    captionWay: way => `${way}: laat het model lopen en kijk naar de tellers.`,
    captionStep: step => `${step}…`,
    captionRan: way => `${way}: klaar. Lees de vier tellers af en noteer de totalen in je schrift.`,
    notebookTitle: period => `Jouw schrift: totalen ${period}`,
    numAria: (way, head) => `${way}, ${head}`,
    lockWays: 'Laat eerst de drie manieren lopen.',
    lockNotes: n => `Vul je schrift aan: nog ${n === 1 ? '1 getal' : n + ' getallen'}.`,
    lockRunning: 'Het model loopt. Wacht tot het einde.',
    lockRunFirst: way => `Laat eerst „${way}” lopen.`,

    // Onglet 3 : le graphique
    graphTitle: 'Jouw staafdiagram',
    graphHint: counter => `Teken de staven van „${counter}”: één staaf per manier, zo hoog als het getal in je schrift.`,
    chartTitle: (counter, many) => `${counter} voor ${many}`,
    columnAria: way => `Staaf: ${way}`,
    captionChart: 'Raak elke staaf aan op de juiste hoogte: de getallen van je schrift.',
    captionChartDone: 'Je grafiek is klaar. Verder: besluiten!',
    lockChart: 'Teken de drie staven van je grafiek.',
    runInfo: (p, pt, n, nt) => `Kaarten: ${p} / ${pt} · Schrift: ${n} / ${nt}`,

    // Étape 3
    resultsTitle: 'Jouw resultaten',
    zoom: 'De grafiek groot tonen',
    energyBar: way => `Energie · ${way}: de kleuren van de stappen`,
    conclRank: 'Van de beste tot de slechtste voor de planeet:',
    conclRankText: list => `Van de beste tot de slechtste voor de planeet zijn de manieren: ${list}.`,
    conclWhy: (best, avoid) => `De beste manier is ${best}, omdat ze ${avoid} grotendeels vermijdt.`,
    avoid: { make: 'de winning van grondstoffen en de productie', transport: 'de distributie (het transport)', use: 'het gebruik van het voorwerp', bin: 'de afdanking (de vuilnisbak)' },
    avoidAria: 'Welke stappen vermijdt ze?',
    conclStep: step => `Als de voorwerpen weggegooid worden, is ${step} de stap die de meeste energie verbruikt.`,
    stepAria: 'Welke stap verbruikt de meeste energie?',
    choose: '— kies —',
    verdictLine: n => `Dus mijn hypothese ${n} is`,
    confirmed: 'bevestigd',
    rejected: 'verworpen',
    checkConclusions: 'Mijn besluiten controleren',
    backToLab: 'Terug naar het labo',

    // Étape 4
    scoreLabel: 'controles geslaagd',
    markCorrect: 'juist',
    markIncorrect: 'fout',
    criteria: { journey: 'Levenscyclus', notes: 'Waarnemingen', graph: 'Grafiek', answer: 'Vraag 1', step: 'Vraag 2', verdict: 'Hypotheses' },
    criteriaSub: { journey: 'De reis', notes: 'Jouw schrift', graph: 'Jouw staven', answer: 'De beste manier', step: 'De stap met de meeste energie', verdict: 'Jouw oordelen' },
    factsTitle: 'De totalen van het model:',

    report: {
      title: 'Laboratoriumverslag — Van de aarde en terug',
      because: 'Omdat',
      materials: (many, period) => `Een model van de levenscyclus van ${many} ${period}, met vier tellers: grondstoffen, energie, CO₂ en afval.`,
      procedure: counter => [
        'Leg elke kaart op haar stap van de levenscyclus.',
        'Laat het model lopen voor elke manier: weggooien, recycleren, hergebruiken. Lees de vier tellers af en noteer de totalen in het schrift.',
        `Teken een staafdiagram van „${counter}” voor de drie manieren.`,
        'Kijk naar de kleuren van de energieteller voor „weggooien”: zoek de grootste stap.'
      ],
      journeyCaption: 'De reis van het voorwerp',
      stepHead: 'Stap',
      eventHead: 'Kaart',
      notesCaption: period => `Schrift: totalen ${period}`,
      chartCaption: 'Staafdiagram',
      wayLine: (way, raw, energy, co2, waste) => `${way}: ${raw} kg grondstoffen, ${energy} eenheden energie, ${co2} kg CO₂ en ${waste} kg afval.`,
      verdict: (n, word) => `Dus mijn hypothese ${n} is ${word}.`,
      score: (n, total) => `Score: ${n} / ${total} controles geslaagd.`
    }
  },

  glossary: {
    levenscyclus: 'cycle de vie', 'winning van grondstoffen': 'extraction des matières premières', grondstoffen: 'matières premières',
    productie: 'fabrication', afdanking: 'élimination (fin de vie)', recyclage: 'recyclage', weggooien: 'jeter', recycleren: 'recycler',
    hergebruiken: 'réutiliser', verminderen: 'réduire', afval: 'déchets', restafval: 'déchets résiduels (poubelle grise)',
    'grijze vuilnisbak': 'poubelle grise', vuilnisbak: 'poubelle', 'PMD-zak': 'sac PMC', glasbol: 'bulle à verre',
    textielcontainer: 'conteneur à textiles', tweedehands: 'de seconde main', statiegeld: 'consigne', gewassen: 'lavé(e)s', 'opnieuw gevuld': 'rempli(e)s à nouveau', ondergrond: 'sous-sol',
    gesmolten: 'fondu(e)', platen: 'plaques', vormt: 'met en forme', gevormd: 'mis en forme', vrachtwagens: 'camions',
    winkels: 'magasins', groeve: 'carrière', zand: 'sable', kalksteen: 'calcaire', vermalen: 'broyé(e)', katoen: 'coton',
    katoenplanten: 'plants de coton', geplukt: 'récolté', spinnen: 'filent', garen: 'fil', weven: 'tissent', stof: 'tissu',
    verven: 'teignent', naaien: 'cousent', verbrand: 'brûlé', vezels: 'fibres', draagt: 'portes', 'opnieuw gedragen': 'porté à nouveau',
    tellers: 'compteurs', teller: 'compteur', nemen: 'prendre', teruggeven: 'rendre', vermijdt: 'évite', grotendeels: 'en grande partie',
    slechtste: 'le pire', beste: 'le meilleur', rangschik: 'classe', staafdiagram: 'graphique en colonnes', staven: 'colonnes', staaf: 'colonne',
    fruitsap: 'jus de fruits', enorme: 'énormes', graven: 'creusent',
    schepen: 'bateaux', 'brandt niet': 'ne brûle pas', 'neemt ze terug': 'les reprend', groeien: 'poussent', veld: 'champ', gezin: 'famille',
    voorwerp: 'objet', schooljaar: 'année scolaire', schrift: 'cahier',
    brooddoos: 'boîte à tartines', brooddozen: 'boîtes à tartines', containerpark: 'parc à conteneurs (recyparc)',
    sluitingen: 'fermoirs', herstelt: 'répares', hersteld: 'réparé(e)s', refurbished: 'reconditionné(s)', nagekeken: 'vérifié(s)',
    teruggewonnen: 'récupéré(e)s', 'uit elkaar gehaald': 'démonté', chips: 'puces électroniques', scherm: 'écran',
    vliegtuigen: 'avions', 'roestvrij staal': 'acier inoxydable', staal: 'acier', kookpot: 'casserole', kookpotten: 'casseroles',
    beschadigd: 'abîmé(e)', beschadigde: 'abîmé(e)s', ijzererts: 'minerai de fer', erts: 'minerai', chroom: 'chrome',
    perst: 'presse', 'poetst ze op': 'les polit', handvat: 'manche', 'oud staal': 'acier usagé (ferraille)', kookt: 'cuisine',
    mijnen: 'mines', gesteente: 'roche', koper: 'cuivre', goud: 'or', 'gaan verloren': 'sont perdus', verbruikt: 'consomme',
    weggegooid: 'jeté(e)s', boterhammen: 'tartines', schooldag: 'jour d’école', deksels: 'couvercles',
    'de ene na de andere': 'l’un après l’autre', laadt: 'recharges', belanden: 'finissent', 'secundair onderwijs': 'enseignement secondaire',
    telkens: 'chaque fois'
  },

  // Étape Check : pourquoi.
  explanations: {
    steps: 'De levenscyclus van een voorwerp: winning van grondstoffen, productie, distributie, gebruik, en dan afdanking of recyclage.',
    arrows: 'Recyclage sluit de kringloop: het afval wordt opnieuw een grondstof. Daarom zijn de pijlen van een duurzame levenscyclus dubbel.',
    reuse: {
      lunchbox: 'Eén brooddoos voor 6 jaar: het aluminium wordt maar één keer gewonnen en de doos maar één keer gemaakt. Nieuwe sluitingen kosten maar een beetje energie.',
      phone: 'Een refurbished smartphone is al gemaakt: hij heeft alleen een nieuwe batterij en wat herstellingen nodig. Geen nieuwe chips, geen nieuw scherm.',
      pan: 'Een herstelde of tweedehands kookpot is al gemaakt: geen erts om op te graven, geen nieuw staal. Een nieuw handvat kost maar een beetje energie.',
      glass: 'Een fles met statiegeld wordt ongeveer 25 keer gebruikt: er worden heel weinig nieuwe flessen gemaakt. De flessen wassen en met vrachtwagens terugbrengen kost ook energie, maar veel minder dan nieuw glas smelten.',
      tshirts: 'Een tweedehands T-shirt is al gemaakt: geen katoen om te telen, geen fabriek. Sorteren, wassen en transport kosten maar een beetje energie.'
    },
    recycle: {
      lunchbox: 'Gerecycleerd aluminium vraagt ongeveer 95 % minder energie dan nieuw aluminium uit bauxiet. Maar er moet nog altijd elk jaar een nieuwe brooddoos gemaakt worden, en niet al het aluminium wordt teruggewonnen.',
      phone: 'Recyclage wint een deel van de metalen terug: er wordt minder gesteente opgegraven. Maar de meeste energie gaat naar het maken van de chips en het scherm, en dat kan recyclage niet besparen: er moet nog altijd een nieuwe smartphone gemaakt worden.',
      pan: 'Staal kan telkens opnieuw gerecycleerd worden: oud staal smelten vraagt veel minder energie dan staal maken uit erts. Maar er moet nog altijd een nieuwe kookpot gemaakt worden.',
      glass: 'Gerecycleerd glas smelt gemakkelijker: het bespaart ongeveer een kwart van de energie, en er wordt minder zand gegraven. Maar de fabriek moet nog altijd nieuwe flessen maken: recycleren bespaart minder dan hergebruiken.',
      tshirts: 'Gerecycleerde vezels vervangen een deel van het nieuwe katoen. Maar de stof en de T-shirts moeten nog altijd in een fabriek gemaakt worden.'
    },
    // Question 2 : pourquoi cette étape consomme le plus.
    step: {
      lunchbox: 'Voor aluminium is de winning van grondstoffen de grootste stap: bauxiet omzetten in zuiver aluminium vraagt enorm veel energie. Daarom bespaart aluminium recycleren zoveel.',
      phone: 'Voor een smartphone is de productie de grootste stap: chips en schermen maken vraagt heel schone fabrieken en veel energie. De metalen recycleren kan die energie niet besparen.',
      pan: 'Voor roestvrij staal is de winning van grondstoffen de grootste stap: ijzererts, chroom en nikkel omzetten in staal vraagt veel warmte.',
      glass: 'Voor glas is de productie de grootste stap: het zand moet bij 1500 °C gesmolten worden. Het zand zelf is gemakkelijk op te graven.',
      tshirts: 'Voor een T-shirt is de productie de grootste stap: spinnen, weven, verven en naaien kosten veel energie en water.'
    },
    rs: 'De 3 R’s: verminderen, hergebruiken, recycleren. Hergebruiken komt vóór recycleren: een voorwerp dat opnieuw gebruikt wordt, moet niet opnieuw gemaakt worden. De getallen van dit model zijn afgeronde, echte grootteordes.'
  },

  check: {
    nothing: 'niets',
    journeyWrong: (letter, text, said, right) => `Kaart ${letter} („${text}”): je legde ze op „${said}”. Ze hoort bij „${right}”.`,
    journeyAllGood: 'Alle kaarten liggen op de juiste stap van de levenscyclus. Goed gedaan!',
    readWrong: (way, head, said, right) => `${way}, ${head}: je schreef ${said}, maar de teller toont ${right}.`,
    notesScore: (good, total) => `${good} / ${total} totalen komen overeen met de tellers.`,
    notesAllGood: 'Jouw schrift komt overeen met de tellers. Goed afgelezen!',
    readHow: 'Een teller aflezen: zoek waar de gekleurde balk stopt, en lees dan het getal op de schaal eronder. Eén lijn van de schaal meer of minder wordt aanvaard.',
    graphOk: 'Jouw staven tonen de getallen van je schrift. Goed getekend!',
    graphWrong: (way, said, want) => `${way}: jouw staaf toont ${said}, maar in je schrift staat ${want}.`,
    graphHow: 'Een staafdiagram (FO4): één staaf per manier, zo hoog als haar getal; de titel, de as en de eenheid zeggen wat er gemeten wordt.',
    answerOk: 'Juist!',
    answerWrong: 'Niet helemaal. Het juiste antwoord:',
    stepHead: 'Stap',
    stepFacts: way => `${way}: de energie van elke stap (eenheden)`,
    stepHow: 'De grootste stap vinden: zoek op de energieteller van „weggooien” de langste kleur. Elke kleur is een stap van de levenscyclus.',
    hypHead: n => `Hypothese ${n}`,
    yourHyp: 'Jouw hypothese:',
    yourConcl: 'Jouw besluit:',
    verdictOk: v => `Je hypothese en je besluit ${v === 'confirmed' ? 'zeggen hetzelfde' : 'zeggen niet hetzelfde'}: je hypothese is dus inderdaad ${v === 'confirmed' ? 'bevestigd' : 'verworpen'}. Goed geoordeeld!`,
    verdictWrong: should => `Vergelijk je hypothese met je besluit: ze ${should === 'confirmed' ? 'zeggen hetzelfde, dus je hypothese is bevestigd' : 'zeggen niet hetzelfde, dus je hypothese is verworpen'}.`,
    rejectedNote: 'Een verworpen hypothese is geen fout: zo gaat de wetenschap vooruit.'
  }
});
