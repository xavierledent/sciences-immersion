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
    yourQuestion: 'Jouw onderzoeksvraag',
    hypothesisTitle: 'Jouw hypothese',
    hypIntro: 'Rangschik de drie manieren, van de beste tot de slechtste voor de planeet.',
    places: ['1ste: de beste', '2de', '3de: de slechtste'],
    hypText: list => `Ik denk dat de manieren, van de beste tot de slechtste voor de planeet, deze zijn: ${list}.`,
    because: 'Waarom denk je dat? (niet verplicht)',
    becausePlaceholder: 'Omdat…',
    hypothesisReady: 'Je hypothese is klaar.',
    hypothesisPending: 'Rangschik de drie manieren: één manier per regel.',
    toJourney: 'Verder: de reis',
    lockHypothesis: 'Rangschik eerst de drie manieren.',
    lockHypothesisFixed: 'Je hypothese ligt vast: het model heeft al gelopen. Een wetenschapper verandert zijn hypothese niet nadat hij de resultaten gezien heeft!',

    // Les étapes du cycle de vie (schéma du cours), les trois façons, les quatre compteurs.
    steps: {
      extraction: 'Winning van grondstoffen', manufacturing: 'Productie', distribution: 'Distributie',
      use: 'Gebruik', disposal: 'Afdanking', recycling: 'Recyclage'
    },
    ways: { throw: { name: 'Weggooien', lower: 'weggooien' }, recycle: { name: 'Recycleren', lower: 'recycleren' }, reuse: { name: 'Hergebruiken', lower: 'hergebruiken' } },
    counters: {
      raw: { name: 'Grondstoffen', unit: 'kg' }, energy: { name: 'Energie', unit: 'eenheden' },
      co2: { name: 'CO₂', unit: 'kg' }, waste: { name: 'Afval', unit: 'kg' }
    },
    taking: 'NEMEN',
    givingBack: 'TERUGGEVEN',

    /* Les objets : many (« 150 blikjes frisdrank »), scenario (la situation),
       ways (ce que veut dire chaque façon pour cet objet), loop (la boucle de
       la réutilisation, sur le dessin), events (les six cartes du voyage). */
    objects: {
      cans: {
        many: q => `${q} blikjes frisdrank`,
        scenario: q => `In één schooljaar drink je ${q} blikjes frisdrank.`,
        ways: {
          throw: 'de lege blikjes gaan bij het restafval (grijze vuilnisbak).',
          recycle: 'de lege blikjes gaan in de blauwe PMD-zak.',
          reuse: 'één hervulbare metalen drinkfles voor het hele jaar.'
        },
        loop: 'gewassen en opnieuw gevuld',
        events: {
          extraction: 'Enorme machines graven bauxiet uit de ondergrond. Het wordt omgezet in zuiver aluminium.',
          manufacturing: 'Een fabriek walst het aluminium tot dunne platen en vormt er blikjes van.',
          distribution: 'Vrachtwagens brengen de volle blikjes naar de winkels.',
          use: 'Je koopt een koude frisdrank en drinkt hem op.',
          disposal: 'Het lege blikje gaat bij het restafval: het wordt afval.',
          recycling: 'Het lege blikje wordt gesmolten om nieuw aluminium te maken.'
        }
      },
      glass: {
        many: q => `${q} flessen fruitsap`,
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
    notebookTitle: 'Jouw schrift: totalen voor één schooljaar',
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
    conclRank: 'Van de beste tot de slechtste voor de planeet:',
    conclRankText: list => `Van de beste tot de slechtste voor de planeet zijn de manieren: ${list}.`,
    conclWhy: (best, avoid) => `De beste manier is ${best}, omdat ze ${avoid} grotendeels vermijdt.`,
    avoid: { make: 'de winning van grondstoffen en de productie', transport: 'de distributie (het transport)', use: 'het gebruik van het voorwerp', bin: 'de afdanking (de vuilnisbak)' },
    avoidAria: 'Welke stappen vermijdt ze?',
    choose: '— kies —',
    verdictLine: 'Dus mijn hypothese is',
    confirmed: 'bevestigd',
    rejected: 'verworpen',
    checkConclusions: 'Mijn besluiten controleren',
    backToLab: 'Terug naar het labo',

    // Étape 4
    scoreLabel: 'controles geslaagd',
    markCorrect: 'juist',
    markIncorrect: 'fout',
    criteria: { journey: 'Levenscyclus', notes: 'Waarnemingen', graph: 'Grafiek', answer: 'Besluit', verdict: 'Hypothese' },
    criteriaSub: { journey: 'De reis', notes: 'Jouw schrift', graph: 'Jouw staven', answer: 'Jouw antwoord', verdict: 'Jouw oordeel' },
    factsTitle: 'De totalen van het model:',

    report: {
      title: 'Laboratoriumverslag — Van de aarde en terug',
      because: 'Omdat',
      materials: many => `Een model van de levenscyclus van ${many} in één schooljaar, met vier tellers: grondstoffen, energie, CO₂ en afval.`,
      procedure: counter => [
        'Leg elke kaart op haar stap van de levenscyclus.',
        'Laat het model lopen voor elke manier: weggooien, recycleren, hergebruiken. Lees de vier tellers af en noteer de totalen in het schrift.',
        `Teken een staafdiagram van „${counter}” voor de drie manieren.`
      ],
      journeyCaption: 'De reis van het voorwerp',
      stepHead: 'Stap',
      eventHead: 'Kaart',
      notesCaption: 'Schrift: totalen voor één schooljaar',
      chartCaption: 'Staafdiagram',
      wayLine: (way, raw, energy, co2, waste) => `${way}: ${raw} kg grondstoffen, ${energy} eenheden energie, ${co2} kg CO₂ en ${waste} kg afval.`,
      verdict: word => `Dus mijn hypothese is ${word}.`,
      score: n => `Score: ${n} / 5 controles geslaagd.`
    }
  },

  glossary: {
    levenscyclus: 'cycle de vie', 'winning van grondstoffen': 'extraction des matières premières', grondstoffen: 'matières premières',
    productie: 'fabrication', afdanking: 'élimination (fin de vie)', recyclage: 'recyclage', weggooien: 'jeter', recycleren: 'recycler',
    hergebruiken: 'réutiliser', verminderen: 'réduire', afval: 'déchets', restafval: 'déchets résiduels (poubelle grise)',
    'grijze vuilnisbak': 'poubelle grise', vuilnisbak: 'poubelle', 'PMD-zak': 'sac PMC', glasbol: 'bulle à verre',
    textielcontainer: 'conteneur à textiles', tweedehands: 'de seconde main', hervulbare: 'qu’on peut remplir à nouveau',
    drinkfles: 'gourde', statiegeld: 'consigne', gewassen: 'lavé(e)s', 'opnieuw gevuld': 'rempli(e)s à nouveau', ondergrond: 'sous-sol',
    gesmolten: 'fondu(e)', walst: 'lamine', platen: 'plaques', vormt: 'met en forme', gevormd: 'mis en forme', vrachtwagens: 'camions',
    winkels: 'magasins', groeve: 'carrière', zand: 'sable', kalksteen: 'calcaire', vermalen: 'broyé(e)', katoen: 'coton',
    katoenplanten: 'plants de coton', geplukt: 'récolté', spinnen: 'filent', garen: 'fil', weven: 'tissent', stof: 'tissu',
    verven: 'teignent', naaien: 'cousent', verbrand: 'brûlé', vezels: 'fibres', draagt: 'portes', 'opnieuw gedragen': 'porté à nouveau',
    tellers: 'compteurs', teller: 'compteur', nemen: 'prendre', teruggeven: 'rendre', vermijdt: 'évite', grotendeels: 'en grande partie',
    slechtste: 'le pire', beste: 'le meilleur', rangschik: 'classe', staafdiagram: 'graphique en colonnes', staven: 'colonnes', staaf: 'colonne',
    fruitsap: 'jus de fruits', blikjes: 'canettes', blikje: 'canette', frisdrank: 'soda', enorme: 'énormes', graven: 'creusent',
    schepen: 'bateaux', 'brandt niet': 'ne brûle pas', 'neemt ze terug': 'les reprend', groeien: 'poussent', veld: 'champ', gezin: 'famille',
    voorwerp: 'objet', schooljaar: 'année scolaire', schrift: 'cahier'
  },

  // Étape Check : pourquoi.
  explanations: {
    steps: 'De levenscyclus van een voorwerp: winning van grondstoffen, productie, distributie, gebruik, en dan afdanking of recyclage.',
    arrows: 'Recyclage sluit de kringloop: het afval wordt opnieuw een grondstof. Daarom zijn de pijlen van een duurzame levenscyclus dubbel.',
    reuse: {
      cans: 'Eén metalen drinkfles voor het hele jaar: het metaal wordt maar één keer gewonnen en de fles maar één keer gemaakt. Ze afwassen kost een beetje energie, veel minder dan nieuwe blikjes maken.',
      glass: 'Een fles met statiegeld wordt ongeveer 25 keer gebruikt: er worden heel weinig nieuwe flessen gemaakt. De flessen wassen en met vrachtwagens terugbrengen kost ook energie, maar veel minder dan nieuw glas smelten.',
      tshirts: 'Een tweedehands T-shirt is al gemaakt: geen katoen om te telen, geen fabriek. Sorteren, wassen en transport kosten maar een beetje energie.'
    },
    recycle: {
      cans: 'Gerecycleerd aluminium vraagt ongeveer 95 % minder energie dan nieuw aluminium uit bauxiet: recyclage vermijdt het grootste deel van de winning van grondstoffen. Maar er moeten nog altijd nieuwe blikjes gemaakt worden, en niet alle blikjes worden ingezameld.',
      glass: 'Gerecycleerd glas smelt gemakkelijker: het bespaart ongeveer een kwart van de energie, en er wordt minder zand gegraven. Maar de fabriek moet nog altijd nieuwe flessen maken: recycleren bespaart minder dan hergebruiken.',
      tshirts: 'Gerecycleerde vezels vervangen een deel van het nieuwe katoen. Maar de stof en de T-shirts moeten nog altijd in een fabriek gemaakt worden.'
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
    yourHyp: 'Jouw hypothese:',
    yourConcl: 'Jouw besluit:',
    verdictOk: v => `Je hypothese en je besluit ${v === 'confirmed' ? 'zeggen hetzelfde' : 'zeggen niet hetzelfde'}: je hypothese is dus inderdaad ${v === 'confirmed' ? 'bevestigd' : 'verworpen'}. Goed geoordeeld!`,
    verdictWrong: should => `Vergelijk je hypothese met je besluit: ze ${should === 'confirmed' ? 'zeggen hetzelfde, dus je hypothese is bevestigd' : 'zeggen niet hetzelfde, dus je hypothese is verworpen'}.`,
    rejectedNote: 'Een verworpen hypothese is geen fout: zo gaat de wetenschap vooruit.'
  }
});
