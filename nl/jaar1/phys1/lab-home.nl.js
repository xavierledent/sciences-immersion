/* ===== Labo virtuel « Energy detectives at home » (phys1) : textes en néerlandais =====

   Simulation commune aux deux filières : js/lab-home.js, chargée après ce
   fichier. Mêmes clés que l'anglais (en/year1/phys1/lab-home.en.js).

   Chaque mot du lexique (glossary) est souligné partout où il apparaît,
   sauf dans les boutons (lab-engine.js) ; [mot] ou [mot|clé] reste utile
   pour une forme dont la clé diffère.

   Termes du chapitre NL : « energieopslag », « opgeslagen », codes C / M / T,
   « verloren energie », « thermische energie », « vermogen » in watt (W),
   « ledlamp », « gloeilamp », « koelkast », « haardroger »,
   « microgolfoven », « vaatwasser », « batterij », « powerbank »,
   « warmtecamera » (comme dans The energy test bench). */

LabEngine.addText('home', {
  labels: {
    title: 'Energiespeurders in huis',

    // « a, b en c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' en ' + names[names.length - 1] : names[0] || '',

    questions: {
      1: 'Waar is er in dit huis energie opgeslagen, en in welke vorm?',
      2: 'Geven alle toestellen die werken thermische energie af aan de lucht?',
      3: 'Welk toestel zet elke seconde de meeste energie om?'
    },
    yourQuestions: 'Jouw onderzoeksvragen',
    intro: 'Jij bent een energiespeurder. Onderzoek een huis met twee hulpmiddelen: een warmtecamera en een vermogensmeter.',
    hypothesisTitle: 'Jouw hypotheses',
    chooseSeveral: 'Kies er één of meer.',
    hyp1: 'Ik denk dat deze voorwerpen energie opslaan:',
    hyp1Text: list => `Ik denk dat deze voorwerpen energie opslaan: ${list}.`,
    hyp2: all => `Ik denk dat ${all} toestellen die werken thermische energie aan de lucht afgeven.`,
    allWords: { all: 'alle', some: 'maar enkele', none: 'geen' },
    hyp3: 'Ik denk dat dit toestel elke seconde de meeste energie omzet:',
    hyp3Text: the => `Ik denk dat ${the} elke seconde de meeste energie omzet.`,
    because: 'Waarom denk je dat? (niet verplicht)',
    becausePlaceholder: 'Omdat…',
    hypothesisReady: 'Je hypotheses zijn klaar.',
    hypothesisPending: 'Vul je drie hypotheses aan.',
    toHouse: 'Verder: het huis',
    lockHypothesis: 'Vul eerst je drie hypotheses aan.',
    lockHypothesisFixed: 'Je hypotheses liggen vast: het onderzoek is begonnen. Een wetenschapper verandert zijn hypothese niet nadat hij de resultaten gezien heeft!',

    // La maison et ses objets : name (bouton, carnet), the (dans une phrase), clue (carte d'indices)
    rooms: { bedroom: 'Slaapkamer', bathroom: 'Badkamer', living: 'Woonkamer', kitchen: 'Keuken', cellar: 'Kelder' },
    objects: {
      led: { name: 'Ledlamp', the: 'de ledlamp', clue: 'Een plafondlamp met een ledlamp. Ze staat aan: ze geeft licht.' },
      bulb: { name: 'Gloeilamp', the: 'de gloeilamp', clue: 'Een bureaulamp met een gewone gloeilamp. Ze staat aan: ze geeft licht.' },
      fridge: { name: 'Koelkast', the: 'de koelkast', clue: 'De koelkast houdt het eten koud. Haar motor werkt de hele dag.' },
      hairdryer: { name: 'Haardroger', the: 'de haardroger', clue: 'De haardroger staat aan: hij blaast warme lucht.' },
      microwave: { name: 'Microgolfoven', the: 'de microgolfoven', clue: 'De microgolfoven warmt een kom soep op.' },
      dishwasher: { name: 'Vaatwasser', the: 'de vaatwasser', clue: 'De vaatwasser wast de vaat met warm water.' },
      tank: { name: 'Warmwaterboiler', the: 'de warmwaterboiler', clue: 'De warmwaterboiler heeft het water ’s nachts opgewarmd. Nu staat hij uit, maar het water erin is nog warm: de hele dag komt er warm water uit de kraan.' },
      battery: { name: 'Batterijen', the: 'de batterijen', clue: 'Nieuwe batterijen in een lade. Steek ze in een zaklamp, en de zaklamp geeft licht.' },
      powerbank: { name: 'Powerbank', the: 'de powerbank', clue: 'Een opgeladen powerbank. Later kan hij een gsm opladen.' },
      wood: { name: 'Houtblokken', the: 'de houtblokken', clue: 'Houtblokken voor de kachel. Vanavond zullen ze branden en de kamer verwarmen.' },
      fruit: { name: 'Appels', the: 'de appels', clue: 'Een schaal appels. Als je er een eet, krijgt je lichaam energie om te bewegen.' },
      slingshot: { name: 'Katapult', the: 'de katapult', clue: 'Een katapult met een uitgerekt elastiek. Laat los, en het balletje vliegt weg.' },
      toycar: { name: 'Speelgoedauto', the: 'de speelgoedauto', clue: 'Een opwindautootje: aan zijn sleutel is gedraaid. Laat los, en het rijdt vanzelf.' }
    },
    tools: { camera: 'Warmtecamera', meter: 'Vermogensmeter' },
    toolsHint: 'Neem een hulpmiddel en raak dan een voorwerp aan. Raak een voorwerp zonder hulpmiddel aan om zijn kaart te lezen.',
    clueTitle: 'Kaart',
    screenEmpty: 'Raak een voorwerp aan om zijn kaart te lezen. Neem de warmtecamera of de vermogensmeter en raak dan een voorwerp aan om het te meten.',
    maxTemp: t => `Max: ${t} °C`,
    roomTemp: t => `Kamer: ${t} °C`,
    cameraAria: (name, t) => `Warmtecamera, ${name}: ${t} °C`,
    noPlug: the => `Geen stekker: de vermogensmeter kan ${the} niet meten.`,
    meterReads: the => `De vermogensmeter toont het vermogen van ${the}: de energie die het toestel elke seconde omzet.`,
    noPlugShort: 'geen stekker',

    captionStart: 'Onderzoek elk voorwerp van het huis met de twee hulpmiddelen. Noteer wat ze tonen in je schrift.',
    captionGoOn: 'Ga verder: twee metingen voor elk voorwerp (temperatuur en vermogen).',
    captionDone: 'Je schrift is volledig. Verder: besluiten!',
    captionHold: tool => `${tool}: raak een voorwerp van het huis aan.`,
    captionClue: name => `${name}: lees de kaart, rechts.`,
    captionCamera: name => `${name}: lees de temperatuur af op de warmtecamera en noteer ze in je schrift.`,
    captionMeter: name => `${name}: lees de vermogensmeter af en noteer wat hij toont in je schrift.`,

    notebookTitle: 'Jouw schrift',
    tempHead: 'Temperatuur (°C)',
    wattHead: 'Vermogen (W)',
    tempAria: name => `${name}: temperatuur in °C`,
    wattAria: name => `${name}: vermogen in W`,
    lockCamera: the => `Meet eerst ${the} met de warmtecamera.`,
    lockMeter: the => `Meet eerst ${the} met de vermogensmeter.`,
    lockNotes: n => `Vul je schrift aan: nog ${n === 1 ? '1 meting' : n + ' metingen'}.`,
    runInfo: (n, t) => `Schrift: ${n} / ${t}`,
    toConclude: 'Verder: besluiten',

    // Étape 3
    resultsTitle: 'Jouw resultaten',
    choose: '— kies —',
    forms: { C: 'chemisch (C)', M: 'mechanisch (M)', T: 'thermisch (T)', no: 'geen opslag' },
    codeAria: name => `${name}: opgeslagen energie`,
    concl2: (all, why, fate) => `Mijn metingen tonen dat ${all} toestellen die werken thermische energie aan de lucht afgeven: ze zijn ${why} de kamer. Die thermische energie verspreidt zich in de lucht: ze is ${fate}.`,
    why: { warmer: 'warmer dan', colder: 'kouder dan', same: 'even warm als' },
    whyAria: 'In vergelijking met de kamer',
    fate: { wasted: 'verloren', destroyed: 'vernietigd', stored: 'opgeslagen' },
    fateAria: 'Wat gebeurt er met die thermische energie',
    concl3: device => `Het toestel dat elke seconde de meeste energie omzet, is: ${device}.`,
    verdictRow: k => `Hypothese ${k.slice(1)}`,
    confirmed: 'bevestigd',
    rejected: 'verworpen',
    checkConclusions: 'Mijn besluiten controleren',
    backToLab: 'Terug naar het labo',

    // Étape 4
    scoreLabel: 'controles geslaagd',
    markCorrect: 'juist',
    markIncorrect: 'fout',
    criteria: { notes: 'Waarnemingen', storage: 'Vraag 1', dissipation: 'Vraag 2', power: 'Vraag 3', verdicts: 'Hypotheses' },
    criteriaSub: { notes: 'Jouw schrift', storage: 'Energieopslag', dissipation: 'Verloren energie', power: 'Vermogen', verdicts: 'Jouw oordeel' },
    factsTitle: 'De feiten van het huis:',
    storedHead: 'Opgeslagen energie',

    report: {
      title: 'Laboratoriumverslag — Energiespeurders in huis',
      because: 'Omdat',
      materials: list => `Een huis met ${list}. Een warmtecamera (temperatuur in °C) en een vermogensmeter (vermogen in W).`,
      procedure: [
        'Lees de kaart van elk voorwerp.',
        'Richt de warmtecamera op elk voorwerp en lees de hoogste temperatuur af.',
        'Steek de stekker van elk toestel in de vermogensmeter en lees het vermogen af. Sommige voorwerpen hebben geen stekker.',
        'Noteer de metingen in het schrift.'
      ],
      notesCaption: room => `Schrift (temperatuur van de kamer: ${room} °C)`,
      warm: (list, room) => `Toestellen die werken en warmer zijn dan de kamer (${room} °C): ${list}.`,
      powers: list => `Vermogen van de toestellen: ${list}.`,
      verdict: (row, word) => `${row}: ${word}.`,
      score: n => `Score: ${n} / 5 controles geslaagd.`
    }
  },

  glossary: {
    energieopslag: 'stockage d’énergie', opgeslagen: 'stocké(e)', opslaan: 'stocker', opslag: 'stockage',
    warmtecamera: 'caméra thermique', vermogensmeter: 'wattmètre', vermogen: 'puissance', stekker: 'prise',
    toestellen: 'appareils', toestel: 'appareil', afgeven: 'cèdent', omzet: 'transforme', 'elke seconde': 'chaque seconde',
    verloren: 'perdue (gaspillée)', verspreidt: 'se répand', warmer: 'plus chaud(s)', kouder: 'plus froid(s)', 'even warm als': 'aussi chaud(s) que',
    'staat aan': 'est allumé(e)', 'staat uit': 'est éteint', ledlamp: 'ampoule LED', gloeilamp: 'ampoule classique (à incandescence)',
    plafondlamp: 'plafonnier', bureaulamp: 'lampe de bureau', koelkast: 'frigo', haardroger: 'sèche-cheveux', blaast: 'souffle',
    microgolfoven: 'four à micro-ondes', vaatwasser: 'lave-vaisselle', vaat: 'vaisselle', warmwaterboiler: 'ballon d’eau chaude (boiler)',
    kraan: 'robinet', batterijen: 'piles', lade: 'tiroir', zaklamp: 'lampe de poche', powerbank: 'batterie externe', opladen: 'charger',
    opgeladen: 'chargé(e)', houtblokken: 'bûches', kachel: 'poêle', branden: 'brûler', appels: 'pommes', schaal: 'coupe (plat)',
    katapult: 'lance-pierre', elastiek: 'élastique', uitgerekt: 'tendu', opwindautootje: 'petite voiture à remonter',
    speelgoedauto: 'petite voiture (jouet)', sleutel: 'clé', 'laat los': 'lâche', vanzelf: 'tout seul', kelder: 'cave',
    slaapkamer: 'chambre', badkamer: 'salle de bain', woonkamer: 'salon', keuken: 'cuisine', onderzoek: 'enquête sur',
    energiespeurder: 'détective de l’énergie', soep: 'soupe', motor: 'moteur', 'de hele dag': 'toute la journée',
    opgewarmd: 'chauffé', 'warmt op': 'réchauffe', '’s nachts': 'pendant la nuit', schrift: 'cahier', hulpmiddel: 'outil', hulpmiddelen: 'outils'
  },

  // Étape Check : pourquoi.
  explanations: {
    camera: 'Een warmtecamera toont hoe warm iets is, in °C. Ze meet geen energie, maar een toestel dat warmer is dan de kamer, geeft thermische energie aan de lucht.',
    stores: {
      tank: 'De warmwaterboiler bewaart warm water voor later: hij slaat thermische energie op (T).',
      battery: 'Batterijen slaan chemische energie op (C). In een zaklamp wordt ze omgezet in elektrische energie, en dan in licht.',
      powerbank: 'Een powerbank is een batterij: hij slaat chemische energie op (C). We kunnen elektriciteit niet rechtstreeks opslaan.',
      wood: 'Hout slaat chemische energie op (C). Als het brandt, geeft het thermische energie en licht.',
      fruit: 'Voedsel slaat chemische energie op (C). Je lichaam zet ze om om te bewegen en warm te blijven.',
      slingshot: 'Het uitgerekte elastiek slaat mechanische energie op (M), door zijn spanning.',
      toycar: 'De veer van het autootje is opgewonden: ze slaat mechanische energie op (M), door haar spanning.'
    },
    devices: 'De toestellen die werken, slaan geen energie op: ze zetten de elektrische energie die door de draden komt, meteen om.',
    dissipation: (list, room) => `Alle toestellen die werkten, waren warmer dan de kamer (${room} °C): ${list}. Bij elke omzetting wordt een deel van de energie thermische energie in de lucht.`,
    conservation: 'Die thermische energie wordt niet vernietigd: energie wordt nooit gemaakt en nooit vernietigd. Ze verspreidt zich in de lucht en we kunnen ze niet meer gebruiken: ze is verloren.',
    power: list => `De vermogensmeter gaf: ${list}. Hoe groter het vermogen, hoe meer energie het toestel elke seconde omzet.`,
    powerHot: 'Het warmste toestel is niet altijd het krachtigste: een groot toestel kan zijn thermische energie over een groot oppervlak verspreiden.'
  },

  check: {
    nothing: 'niets',
    tempWrong: (name, said, right) => `${name}: je schreef ${said}, maar de warmtecamera toont ${right}.`,
    wattWrong: (name, said, right) => `${name}: je schreef „${said}”, maar de vermogensmeter toont „${right}”.`,
    notesScore: (good, total) => `${good} / ${total} metingen komen overeen met de hulpmiddelen.`,
    notesAllGood: 'Jouw schrift komt overeen met wat de hulpmiddelen toonden. Goed gemeten!',
    codeWrong: (name, said, right) => `${name}: je koos „${said}”. Het juiste antwoord: ${right}.`,
    codesAllGood: 'Je vond alle energieopslag van het huis, met de juiste vorm. Goed gedaan!',
    answerOk: 'Juist!',
    answerWrong: 'Niet helemaal. Het juiste antwoord:',
    yourHyps: 'Jouw hypotheses:',
    verdictOk: v => `Je hypothese en je besluit ${v === 'confirmed' ? 'zeggen hetzelfde' : 'zeggen niet hetzelfde'}: je hypothese is dus inderdaad ${v === 'confirmed' ? 'bevestigd' : 'verworpen'}. Goed geoordeeld!`,
    verdictWrong: should => `Vergelijk je hypothese met je besluit: ze ${should === 'confirmed' ? 'zeggen hetzelfde, dus je hypothese is bevestigd' : 'zeggen niet hetzelfde, dus je hypothese is verworpen'}.`,
    rejectedNote: 'Een verworpen hypothese is geen fout: zo gaat de wetenschap vooruit.'
  }
});
