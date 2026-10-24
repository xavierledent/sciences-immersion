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
   « warmtecamera » (comme dans The energy test bench). Le compteur :
   « elektriciteitsmeter », sa « meterstand » (index) et son « scherm »
   (afficheur), usage belge. */

LabEngine.addText('home', {
  labels: {
    title: 'Energiespeurders in huis',

    // « a, b en c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' en ' + names[names.length - 1] : names[0] || '',
    // Nombre décimal (index du compteur) : virgule en néerlandais
    num: (v, d) => v.toFixed(d).replace('.', ','),

    questions: {
      1: 'Waar is er in dit huis energie opgeslagen, en in welke vorm?',
      2: 'Geven alle toestellen die werken thermische energie af aan de lucht?',
      3: 'Welk toestel zet elke seconde de meeste energie om?'
    },
    yourQuestions: 'Jouw onderzoeksvragen',
    intro: 'Jij bent een energiespeurder. Onderzoek een huis met een warmtecamera en zijn elektriciteitsmeter.',
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
    rooms: {
      bedroom: { name: 'Slaapkamer', the: 'de slaapkamer' },
      bathroom: { name: 'Badkamer', the: 'de badkamer' },
      living: { name: 'Woonkamer', the: 'de woonkamer' },
      kitchen: { name: 'Keuken', the: 'de keuken' },
      cellar: { name: 'Kelder', the: 'de kelder' }
    },
    objects: {
      led: { name: 'Ledlamp', the: 'de ledlamp', clue: 'Een plafondlamp met een ledlamp. Zet ze aan: ze geeft licht.' },
      bulb: { name: 'Gloeilamp', the: 'de gloeilamp', clue: 'Een bureaulamp met een gewone gloeilamp. Zet ze aan: ze geeft licht.' },
      fridge: { name: 'Koelkast', the: 'de koelkast', clue: 'De koelkast houdt het eten koud. In een huis staat ze de hele dag aan.' },
      hairdryer: { name: 'Haardroger', the: 'de haardroger', clue: 'Een haardroger. Zet hem aan: hij blaast warme lucht.' },
      microwave: { name: 'Microgolfoven', the: 'de microgolfoven', clue: 'Er staat een kom soep in de microgolfoven. Zet hem aan: hij warmt de soep op.' },
      dishwasher: { name: 'Vaatwasser', the: 'de vaatwasser', clue: 'De vaatwasser zit vol vuile vaat. Zet hem aan: hij wast de vaat met warm water.' },
      tank: { name: 'Warmwaterboiler', the: 'de warmwaterboiler', clue: 'De warmwaterboiler werkt op elektriciteit, maar alleen ’s nachts: hij heeft het water vannacht opgewarmd. Nu staat hij uit, maar het water erin is nog warm: de hele dag komt er warm water uit de kraan.' },
      battery: { name: 'Batterijen', the: 'de batterijen', clue: 'Nieuwe batterijen in een lade. Steek ze in een zaklamp, en de zaklamp geeft licht.' },
      powerbank: { name: 'Powerbank', the: 'de powerbank', clue: 'Een opgeladen powerbank. Later kan hij een gsm opladen.' },
      wood: { name: 'Houtblokken', the: 'de houtblokken', clue: 'Houtblokken voor de kachel. Vanavond zullen ze branden en de kamer verwarmen.' },
      fruit: { name: 'Appels', the: 'de appels', clue: 'Een schaal appels. Als je er een eet, krijgt je lichaam energie om te bewegen.' },
      slingshot: { name: 'Katapult', the: 'de katapult', clue: 'Een katapult met een uitgerekt elastiek. Laat los, en het balletje vliegt weg.' },
      toycar: { name: 'Speelgoedauto', the: 'de speelgoedauto', clue: 'Een opwindautootje: aan zijn sleutel is gedraaid. Laat los, en het rijdt vanzelf.' }
    },

    // Les outils : étiquettes, caméra, compteur et interrupteurs
    tagsTitle: 'Opgeslagen energie:',
    tags: { C: 'chemisch', M: 'mechanisch', T: 'thermisch', no: 'geen opslag' },
    badges: { C: 'C', M: 'M', T: 'T', no: 'geen' },
    cameraName: 'Warmtecamera',
    meterName: 'Elektriciteitsmeter',
    meterIndex: 'Meterstand',
    displayTitle: 'Scherm',
    meterText: 'Het scherm toont het vermogen van het hele huis: de energie die alle toestellen die werken samen elke seconde omzetten.',
    on: 'aan',
    off: 'uit',
    switchAria: name => `${name}: schakelaar`,
    clueTitle: 'Kaart',
    screenEmpty: 'Raak een voorwerp aan om zijn kaart te lezen. Neem een etiket en leg het op een voorwerp. Neem de warmtecamera en raak een kamer aan. Raak de elektriciteitsmeter in de kelder aan.',
    roomTemp: t => `Kamer: ${t} °C`,
    cameraAria: room => `Warmtecamera: ${room}`,

    captionStart: 'Drie opdrachten, in de volgorde die je wilt: geef elk voorwerp een etiket met de energie die het opslaat, film de kamers met de warmtecamera, en lees de elektriciteitsmeter af.',
    captionGoOn: 'Ga verder: een etiket op elk voorwerp, en een volledig schrift.',
    captionDone: 'Je schrift is volledig. Verder: besluiten!',
    captionHoldTag: form => `Etiket „${form}”: raak een voorwerp van het huis aan.`,
    captionHoldCamera: 'Warmtecamera: raak een kamer van het huis aan.',
    captionClue: name => `${name}: lees de kaart, rechts.`,
    captionTagged: (name, form) => `${name}: etiket „${form}”. Lees de kaart nog eens, rechts.`,
    captionCamera: room => `De warmtecamera filmt ${room}. Noteer de temperatuur van elk toestel dat werkt in je schrift.`,
    captionMeter: 'Zet de toestellen aan en uit, en kijk naar het scherm. Noteer het vermogen van elk toestel in je schrift.',

    notebookTitle: 'Jouw schrift',
    tempHead: 'Temperatuur als het werkt (°C)',
    tempShort: 'Temperatuur',
    wattHead: 'Vermogen (W)',
    tempAria: name => `${name}: temperatuur in °C`,
    wattAria: name => `${name}: vermogen in W`,
    lockCamera: room => `Film eerst ${room} met de warmtecamera.`,
    lockMeter: the => `Open eerst de elektriciteitsmeter in de kelder. Zet dan ${the} aan of uit en kijk naar het scherm.`,
    lockRun: (tags, notes) => {
      const parts = [];
      if (tags) parts.push(tags === 1 ? '1 voorwerp zonder etiket' : `${tags} voorwerpen zonder etiket`);
      if (notes) parts.push(notes === 1 ? 'nog 1 meting in je schrift' : `nog ${notes} metingen in je schrift`);
      return `Nog niet klaar: ${parts.join(' en ')}.`;
    },
    runInfo: (tags, tagsTotal, notes, notesTotal) => `Etiketten: ${tags} / ${tagsTotal} · Schrift: ${notes} / ${notesTotal}`,
    toConclude: 'Verder: besluiten',

    // Étape 3
    resultsTitle: 'Jouw resultaten',
    choose: '— kies —',
    forms: { C: 'chemisch (C)', M: 'mechanisch (M)', T: 'thermisch (T)', no: 'geen opslag' },
    storedHead: 'Opgeslagen energie',
    concl1: (n, store) => `In dit huis is er energie opgeslagen in ${n} voorwerpen. De toestellen die werken, ${store} energie op.`,
    countAria: 'Aantal voorwerpen',
    storeWords: { not: 'slaan geen', yes: 'slaan' },
    storeAria: 'De toestellen die werken',
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

    report: {
      title: 'Laboratoriumverslag — Energiespeurders in huis',
      because: 'Omdat',
      materials: list => `Een huis met ${list}. Een warmtecamera (temperatuur in °C). De elektriciteitsmeter van het huis en zijn scherm (vermogen in W).`,
      procedure: [
        'Lees de kaart van elk voorwerp en geef het een etiket met de energie die het opslaat.',
        'Film elke kamer met de warmtecamera, met de toestellen aan, en lees hun temperatuur af.',
        'Zet elk toestel alleen aan en lees het vermogen af op het scherm van de elektriciteitsmeter.',
        'Noteer de metingen in het schrift.'
      ],
      tagsCaption: 'Etiketten: de opgeslagen energie',
      notesCaption: room => `Schrift (temperatuur van de kamer: ${room} °C)`,
      warm: (list, room) => `Toestellen die werken en warmer zijn dan de kamer (${room} °C): ${list}.`,
      powers: list => `Vermogen van de toestellen: ${list}.`,
      verdict: (row, word) => `${row}: ${word}.`,
      score: n => `Score: ${n} / 5 controles geslaagd.`
    }
  },

  glossary: {
    energieopslag: 'stockage d’énergie', opgeslagen: 'stocké(e)', opslaan: 'stocker', opslag: 'stockage', opslaat: 'stocke',
    warmtecamera: 'caméra thermique', elektriciteitsmeter: 'compteur électrique', meterstand: 'index du compteur', scherm: 'afficheur (écran)',
    vermogen: 'puissance', toestellen: 'appareils', toestel: 'appareil', afgeven: 'cèdent', omzet: 'transforme', omzetten: 'transforment',
    'elke seconde': 'chaque seconde', verloren: 'perdue (gaspillée)', verspreidt: 'se répand', warmer: 'plus chaud(s)', kouder: 'plus froid(s)',
    'even warm als': 'aussi chaud(s) que', 'staat aan': 'est allumé(e)', 'staat uit': 'est éteint', 'zet ze aan': 'allume-la', 'zet hem aan': 'allume-le',
    'aan en uit': 'allume et éteins', 'aan of uit': 'allume ou éteins', film: 'filme', filmt: 'filme', etiket: 'étiquette', etiketten: 'étiquettes',
    ledlamp: 'ampoule LED', gloeilamp: 'ampoule classique (à incandescence)', plafondlamp: 'plafonnier', bureaulamp: 'lampe de bureau',
    koelkast: 'frigo', haardroger: 'sèche-cheveux', blaast: 'souffle', microgolfoven: 'four à micro-ondes', vaatwasser: 'lave-vaisselle',
    vaat: 'vaisselle', vuile: 'sale', warmwaterboiler: 'ballon d’eau chaude (boiler)', kraan: 'robinet', batterijen: 'piles', lade: 'tiroir',
    zaklamp: 'lampe de poche', powerbank: 'batterie externe', opladen: 'charger', opgeladen: 'chargé(e)', houtblokken: 'bûches', kachel: 'poêle',
    branden: 'brûler', appels: 'pommes', schaal: 'coupe (plat)', katapult: 'lance-pierre', elastiek: 'élastique', uitgerekt: 'tendu',
    opwindautootje: 'petite voiture à remonter', speelgoedauto: 'petite voiture (jouet)', sleutel: 'clé', 'laat los': 'lâche', vanzelf: 'tout seul',
    kelder: 'cave', slaapkamer: 'chambre', badkamer: 'salle de bain', woonkamer: 'salon', keuken: 'cuisine', onderzoek: 'enquête sur',
    energiespeurder: 'détective de l’énergie', soep: 'soupe', 'de hele dag': 'toute la journée', opgewarmd: 'chauffé', 'warmt op': 'réchauffe',
    '’s nachts': 'pendant la nuit', vannacht: 'la nuit dernière', schrift: 'cahier', 'hele huis': 'toute la maison', alleen: 'seul',
    geïsoleerd: 'isolé', ontsnapt: 's’échappe', oppervlak: 'surface', opdrachten: 'missions'
  },

  // Étape Check : pourquoi.
  explanations: {
    camera: 'Een warmtecamera toont hoe warm iets is, in °C. Ze meet geen energie, maar een toestel dat werkt en warmer is dan de kamer, geeft thermische energie aan de lucht. Een toestel dat uit staat, warmt niet op: het heeft de temperatuur van de kamer.',
    meter: 'Het scherm van de elektriciteitsmeter toont het vermogen van het hele huis. Om het vermogen van één toestel te kennen, zet je het alleen aan, of vergelijk je het scherm voor en nadat je het aanzet.',
    stores: {
      tank: 'De warmwaterboiler werkt ’s nachts op elektriciteit: hij warmt het water op en houdt het warm voor de dag. Hij slaat thermische energie op (T). Zijn oppervlak is een beetje warmer dan de kelder: een deel van die thermische energie ontsnapt langzaam. Daarom is een warmwaterboiler geïsoleerd.',
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
    power: list => `Elk toestel alleen: ${list}. Hoe groter het vermogen, hoe meer energie het toestel elke seconde omzet.`,
    powerHot: 'Het warmste toestel is niet altijd het krachtigste: een groot toestel kan zijn thermische energie over een groot oppervlak verspreiden.'
  },

  check: {
    nothing: 'niets',
    tempWrong: (name, said, right) => `${name}: je schreef ${said}, maar als het toestel werkt, toont de warmtecamera ${right}.`,
    tempOff: (name, said, right) => `${name}: je schreef ${said}, de temperatuur van de kamer. Je filmde het toestel toen het uit stond: een toestel dat niet werkt, warmt niet op. Als het werkt, toont de warmtecamera ${right}.`,
    wattWrong: (name, said, right) => `${name}: je schreef ${said}, maar alleen zet het toestel ${right} om.`,
    wattSum: (name, said, others, right) => `${name}: je schreef ${said}, maar er werkten ook andere toestellen (${others}). Alleen zet het toestel ${right} om.`,
    notesScore: (good, total) => `${good} / ${total} metingen zijn juist.`,
    notesAllGood: 'Jouw schrift komt overeen met wat de camera en de meter toonden. Goed gemeten!',
    tagWrong: (name, said, right) => `${name}: je etiket is „${said}”. Het juiste antwoord: ${right}.`,
    tagsAllGood: 'Je vond alle energieopslag van het huis, met de juiste vorm. Goed gedaan!',
    answerOk: 'Juist!',
    answerWrong: 'Niet helemaal. Het juiste antwoord:',
    yourHyps: 'Jouw hypotheses:',
    verdictOk: v => `Je hypothese en je besluit ${v === 'confirmed' ? 'zeggen hetzelfde' : 'zeggen niet hetzelfde'}: je hypothese is dus inderdaad ${v === 'confirmed' ? 'bevestigd' : 'verworpen'}. Goed geoordeeld!`,
    verdictWrong: should => `Vergelijk je hypothese met je besluit: ze ${should === 'confirmed' ? 'zeggen hetzelfde, dus je hypothese is bevestigd' : 'zeggen niet hetzelfde, dus je hypothese is verworpen'}.`,
    rejectedNote: 'Een verworpen hypothese is geen fout: zo gaat de wetenschap vooruit.'
  }
});
