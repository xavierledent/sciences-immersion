/* ===== Labo virtuel « Energy detectives at home » (phys1) : textes en anglais =====

   Simulation commune aux deux filières : js/lab-home.js, chargée après ce
   fichier. Le néerlandais (nl/jaar1/phys1/lab-home.nl.js) a exactement les
   mêmes clés.

   Chaque mot du lexique (glossary) est souligné partout où il apparaît,
   sauf dans les boutons (lab-engine.js) ; [mot] ou [mot|clé] reste utile
   pour une forme dont la clé diffère.

   Mots du cours : « energy storage », codes C / M / T (mission 6),
   « wasted / dissipated energy », « thermal energy », « power » en watts
   (W) : « how much energy it transforms every second » (missions 8 et 9). */

LabEngine.addText('home', {
  labels: {
    title: 'Energy detectives at home',

    // « a, b and c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0] || '',

    questions: {
      1: 'Where is energy stored in this house, and in which form?',
      2: 'Do all the working devices dissipate thermal energy?',
      3: 'Which device transforms the most energy every second?'
    },
    yourQuestions: 'Your questions',
    intro: 'You are an energy detective. Investigate a house with two tools: a thermal camera and a power meter.',
    hypothesisTitle: 'Your hypotheses',
    chooseSeveral: 'Choose one or more.',
    hyp1: 'I think that these objects store energy:',
    hyp1Text: list => `I think that these objects store energy: ${list}.`,
    hyp2: all => `I think that ${all} of the working devices dissipate thermal energy.`,
    allWords: { all: 'all', some: 'only some', none: 'none' },
    hyp3: 'I think that the device that transforms the most energy every second is:',
    hyp3Text: the => `I think that the device that transforms the most energy every second is ${the}.`,
    because: 'Why do you think so? (optional)',
    becausePlaceholder: 'Because…',
    hypothesisReady: 'Your hypotheses are ready.',
    hypothesisPending: 'Complete your three hypotheses.',
    toHouse: 'Next: the house',
    lockHypothesis: 'Complete your three hypotheses first.',
    lockHypothesisFixed: 'Your hypotheses are fixed: the investigation has started. A scientist does not change the hypothesis after seeing the results!',

    // La maison et ses objets : name (bouton, carnet), the (dans une phrase), clue (carte d'indices)
    rooms: { bedroom: 'Bedroom', bathroom: 'Bathroom', living: 'Living room', kitchen: 'Kitchen', cellar: 'Cellar' },
    objects: {
      led: { name: 'LED bulb', the: 'the LED bulb', clue: 'A ceiling lamp with an LED bulb. It is switched on: it gives light.' },
      bulb: { name: 'Traditional bulb', the: 'the traditional bulb', clue: 'A desk lamp with a traditional bulb. It is switched on: it gives light.' },
      fridge: { name: 'Refrigerator', the: 'the refrigerator', clue: 'The refrigerator keeps the food cold. Its motor works all day long.' },
      hairdryer: { name: 'Hair dryer', the: 'the hair dryer', clue: 'The hair dryer is switched on: it blows hot air.' },
      microwave: { name: 'Microwave oven', the: 'the microwave oven', clue: 'The microwave oven heats a bowl of soup.' },
      dishwasher: { name: 'Dishwasher', the: 'the dishwasher', clue: 'The dishwasher washes the dishes with hot water.' },
      tank: { name: 'Hot water tank', the: 'the hot water tank', clue: 'The hot water tank heated the water during the night. Now it is switched off, but the water inside is still hot: hot water comes out of the tap all day.' },
      battery: { name: 'Batteries', the: 'the batteries', clue: 'New batteries in a drawer. Put them in a torch, and the torch gives light.' },
      powerbank: { name: 'Power bank', the: 'the power bank', clue: 'A charged power bank. Later, it can charge a phone.' },
      wood: { name: 'Wood logs', the: 'the wood logs', clue: 'Wood logs for the stove. Tonight, they will burn and heat the room.' },
      fruit: { name: 'Apples', the: 'the apples', clue: 'A bowl of apples. When you eat one, your body gets energy to move.' },
      slingshot: { name: 'Slingshot', the: 'the slingshot', clue: 'A slingshot with a stretched elastic band. Let it go, and the little ball flies away.' },
      toycar: { name: 'Toy car', the: 'the toy car', clue: 'A wind-up toy car: its key has been turned. Let it go, and it drives on its own.' }
    },
    tools: { camera: 'Thermal camera', meter: 'Power meter' },
    toolsHint: 'Take a tool, then touch an object. Touch an object without a tool to read its card.',
    clueTitle: 'Card',
    screenEmpty: 'Touch an object to read its card. Take the thermal camera or the power meter, then touch an object to measure it.',
    maxTemp: t => `Max: ${t} °C`,
    roomTemp: t => `Room: ${t} °C`,
    cameraAria: (name, t) => `Thermal camera, ${name}: ${t} °C`,
    noPlug: the => `No plug: the power meter cannot measure ${the}.`,
    meterReads: the => `The power meter shows the power of ${the}: the energy that it transforms every second.`,
    noPlugShort: 'no plug',

    captionStart: 'Investigate each object of the house with the two tools. Write what they show in your notebook.',
    captionGoOn: 'Go on: two measurements for each object (temperature and power).',
    captionDone: 'Your notebook is complete. Next: conclude!',
    captionHold: tool => `${tool}: touch an object of the house.`,
    captionClue: name => `${name}: read its card, on the right.`,
    captionCamera: name => `${name}: read the temperature on the thermal camera and write it in your notebook.`,
    captionMeter: name => `${name}: read the power meter and write what it shows in your notebook.`,

    notebookTitle: 'Your notebook',
    tempHead: 'Temperature (°C)',
    wattHead: 'Power (W)',
    tempAria: name => `${name}: temperature in °C`,
    wattAria: name => `${name}: power in W`,
    lockCamera: the => `Measure ${the} with the thermal camera first.`,
    lockMeter: the => `Measure ${the} with the power meter first.`,
    lockNotes: n => `Complete your notebook: ${n === 1 ? '1 measurement' : n + ' measurements'} still missing.`,
    runInfo: (n, t) => `Notebook: ${n} / ${t}`,
    toConclude: 'Next: conclude',

    // Étape 3
    resultsTitle: 'Your results',
    choose: '— choose —',
    forms: { C: 'chemical (C)', M: 'mechanical (M)', T: 'thermal (T)', no: 'no storage' },
    codeAria: name => `${name}: energy stored`,
    concl2: (all, why, fate) => `My measurements show that ${all} of the working devices dissipate thermal energy: they are ${why} the room. This thermal energy spreads in the air: it is ${fate}.`,
    why: { warmer: 'warmer than', colder: 'colder than', same: 'at the same temperature as' },
    whyAria: 'Compared with the room',
    fate: { wasted: 'wasted', destroyed: 'destroyed', stored: 'stored' },
    fateAria: 'What happens to this thermal energy',
    concl3: device => `The device that transforms the most energy every second is: ${device}.`,
    verdictRow: k => `Hypothesis ${k.slice(1)}`,
    confirmed: 'confirmed',
    rejected: 'rejected',
    checkConclusions: 'Check my conclusions',
    backToLab: 'Back to the lab',

    // Étape 4
    scoreLabel: 'checks passed',
    markCorrect: 'correct',
    markIncorrect: 'incorrect',
    criteria: { notes: 'Observations', storage: 'Question 1', dissipation: 'Question 2', power: 'Question 3', verdicts: 'Hypotheses' },
    criteriaSub: { notes: 'Your notebook', storage: 'Energy storage', dissipation: 'Dissipation', power: 'Power', verdicts: 'Your judgement' },
    factsTitle: 'The facts of the house:',
    storedHead: 'Energy stored',

    report: {
      title: 'Laboratory report — Energy detectives at home',
      because: 'Because',
      materials: list => `A house with ${list}. A thermal camera (temperature in °C) and a power meter (power in W).`,
      procedure: [
        'Read the card of each object.',
        'Point the thermal camera at each object and read the highest temperature.',
        'Plug each device into the power meter and read its power. Some objects have no plug.',
        'Write the measurements in the notebook.'
      ],
      notesCaption: room => `Notebook (temperature of the room: ${room} °C)`,
      warm: (list, room) => `Working devices warmer than the room (${room} °C): ${list}.`,
      powers: list => `Powers of the devices: ${list}.`,
      verdict: (row, word) => `${row}: ${word}.`,
      score: n => `Score: ${n} / 5 checks passed.`
    }
  },

  glossary: {
    'energy storage': 'stockage d’énergie', store: 'stockent', stored: 'stocké(e)', storage: 'stockage',
    'thermal camera': 'caméra thermique', 'power meter': 'wattmètre', power: 'puissance', plug: 'prise',
    'working devices': 'appareils qui fonctionnent', devices: 'appareils', device: 'appareil', dissipate: 'dissipent',
    'every second': 'chaque seconde', wasted: 'gaspillée (perdue)', spreads: 'se répand', warmer: 'plus chaud(s)', colder: 'plus froid(s)',
    'switched on': 'allumé(e)', 'switched off': 'éteint(e)', bulb: 'ampoule', 'traditional bulb': 'ampoule classique (à incandescence)',
    'ceiling lamp': 'plafonnier', 'desk lamp': 'lampe de bureau', refrigerator: 'frigo (réfrigérateur)', 'hair dryer': 'sèche-cheveux', blows: 'souffle',
    'microwave oven': 'four à micro-ondes', microwave: 'micro-ondes', dishwasher: 'lave-vaisselle', dishes: 'vaisselle',
    'hot water tank': 'ballon d’eau chaude (boiler)', tap: 'robinet', batteries: 'piles', drawer: 'tiroir', torch: 'lampe de poche',
    'power bank': 'batterie externe', charge: 'charger', charged: 'chargé(e)', 'wood logs': 'bûches', stove: 'poêle', burn: 'brûler',
    apples: 'pommes', bowl: 'bol', slingshot: 'lance-pierre', 'elastic band': 'élastique', stretched: 'tendu', 'wind-up': 'à remonter',
    key: 'clé', 'let it go': 'lâche-le', 'drives on its own': 'roule tout seul', cellar: 'cave', bedroom: 'chambre',
    bathroom: 'salle de bain', 'living room': 'salon', kitchen: 'cuisine', 'investigate': 'enquête sur', detective: 'détective',
    soup: 'soupe', motor: 'moteur', 'all day long': 'toute la journée', heats: 'chauffe', heated: 'a chauffé'
  },

  // Étape Check : pourquoi.
  explanations: {
    camera: 'A thermal camera shows how warm things are, in °C. It does not measure energy, but a device that is warmer than the room gives thermal energy to the air.',
    stores: {
      tank: 'The hot water tank keeps hot water for later: it stores thermal energy (T).',
      battery: 'Batteries store chemical energy (C). In a torch, it is transformed into electrical energy, then into light.',
      powerbank: 'A power bank is a battery: it stores chemical energy (C). We cannot store electricity directly.',
      wood: 'Wood stores chemical energy (C). When it burns, it gives thermal energy and light.',
      fruit: 'Food stores chemical energy (C). Your body transforms it to move and to keep warm.',
      slingshot: 'The stretched elastic band stores mechanical energy (M), because of its tension.',
      toycar: 'The spring of the toy car is wound up: it stores mechanical energy (M), because of its tension.'
    },
    devices: 'The working devices do not store energy: they transform the electrical energy that comes through the wires, at once.',
    dissipation: (list, room) => `All the working devices were warmer than the room (${room} °C): ${list}. In every transformation, some energy becomes thermal energy in the air.`,
    conservation: 'This thermal energy is not destroyed: energy is never created and never destroyed. It spreads in the air and we cannot use it any more: it is wasted, or dissipated.',
    power: list => `The power meter gave: ${list}. The higher the power, the more energy the device transforms every second.`,
    powerHot: 'The hottest device is not always the most powerful one: a big device can spread its thermal energy over a large surface.'
  },

  check: {
    nothing: 'nothing',
    tempWrong: (name, said, right) => `${name}: you wrote ${said}, but the thermal camera shows ${right}.`,
    wattWrong: (name, said, right) => `${name}: you wrote “${said}”, but the power meter shows “${right}”.`,
    notesScore: (good, total) => `${good} / ${total} measurements match the tools.`,
    notesAllGood: 'Your notebook matches what the tools showed. Well measured!',
    codeWrong: (name, said, right) => `${name}: you chose “${said}”. The correct answer: ${right}.`,
    codesAllGood: 'You found every energy storage of the house, with the right form. Well done!',
    answerOk: 'Correct!',
    answerWrong: 'Not quite. The correct answer:',
    yourHyps: 'Your hypotheses:',
    verdictOk: v => `Your hypothesis and your conclusion ${v === 'confirmed' ? 'say the same thing' : 'do not say the same thing'}: it is indeed ${v}. Well judged!`,
    verdictWrong: should => `Compare your hypothesis with your conclusion: they ${should === 'confirmed' ? 'say the same thing, so your hypothesis is confirmed' : 'do not say the same thing, so your hypothesis is rejected'}.`,
    rejectedNote: 'A rejected hypothesis is not a mistake: it is how science moves on.'
  }
});
