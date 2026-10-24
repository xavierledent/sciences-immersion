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
    // Nombre décimal (index du compteur) : point en anglais
    num: (v, d) => v.toFixed(d),

    questions: {
      1: 'Where is energy stored in this house, and in which form?',
      2: 'Do all the working devices dissipate thermal energy?',
      3: 'Which device transforms the most energy every second?'
    },
    yourQuestions: 'Your questions',
    intro: 'You are an energy detective. Investigate a house with a thermal camera and its electricity meter.',
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
    rooms: {
      bedroom: { name: 'Bedroom', the: 'the bedroom' },
      bathroom: { name: 'Bathroom', the: 'the bathroom' },
      living: { name: 'Living room', the: 'the living room' },
      kitchen: { name: 'Kitchen', the: 'the kitchen' },
      cellar: { name: 'Cellar', the: 'the cellar' }
    },
    objects: {
      led: { name: 'LED bulb', the: 'the LED bulb', clue: 'A ceiling lamp with an LED bulb. Switch it on: it gives light.' },
      bulb: { name: 'Traditional bulb', the: 'the traditional bulb', clue: 'A desk lamp with a traditional bulb. Switch it on: it gives light.' },
      fridge: { name: 'Refrigerator', the: 'the refrigerator', clue: 'The refrigerator keeps the food cold. In a house, it is switched on all day long.' },
      hairdryer: { name: 'Hair dryer', the: 'the hair dryer', clue: 'A hair dryer. Switch it on: it blows hot air.' },
      microwave: { name: 'Microwave oven', the: 'the microwave oven', clue: 'A bowl of soup is in the microwave oven. Switch it on: it heats the soup.' },
      dishwasher: { name: 'Dishwasher', the: 'the dishwasher', clue: 'The dishwasher is full of dirty dishes. Switch it on: it washes them with hot water.' },
      tank: { name: 'Hot water tank', the: 'the hot water tank', clue: 'The hot water tank works with electricity, but only at night: it heated the water last night. Now it is switched off, but the water inside is still hot: hot water comes out of the tap all day.' },
      battery: { name: 'Batteries', the: 'the batteries', clue: 'New batteries in a drawer. Put them in a torch, and the torch gives light.' },
      powerbank: { name: 'Power bank', the: 'the power bank', clue: 'A charged power bank. Later, it can charge a phone.' },
      wood: { name: 'Wood logs', the: 'the wood logs', clue: 'Wood logs for the stove. Tonight, they will burn and heat the room.' },
      fruit: { name: 'Apples', the: 'the apples', clue: 'A bowl of apples. When you eat one, your body gets energy to move.' },
      slingshot: { name: 'Slingshot', the: 'the slingshot', clue: 'A slingshot with a stretched elastic band. Let it go, and the little ball flies away.' },
      toycar: { name: 'Toy car', the: 'the toy car', clue: 'A wind-up toy car: its key has been turned. Let it go, and it drives on its own.' }
    },

    // Les outils : étiquettes, caméra, compteur et interrupteurs
    tagsTitle: 'Energy stored:',
    tags: { C: 'chemical', M: 'mechanical', T: 'thermal', no: 'no storage' },
    badges: { C: 'C', M: 'M', T: 'T', no: 'none' },
    cameraName: 'Thermal camera',
    meterName: 'Electricity meter',
    meterIndex: 'Index',
    displayTitle: 'Display',
    meterText: 'The display shows the power of the whole house: the energy that all the working devices transform every second.',
    on: 'on',
    off: 'off',
    switchAria: name => `${name}: switch`,
    clueTitle: 'Card',
    screenEmpty: 'Touch an object to read its card. Take a label and put it on an object. Take the thermal camera and touch a room. Touch the electricity meter in the cellar.',
    roomTemp: t => `Room: ${t} °C`,
    cameraAria: room => `Thermal camera: ${room}`,

    captionStart: 'Three missions, in any order: label each object with the energy it stores, film the rooms with the thermal camera, and read the electricity meter.',
    captionGoOn: 'Go on: a label on every object, and a complete notebook.',
    captionDone: 'Your notebook is complete. Next: conclude!',
    captionHoldTag: form => `Label “${form}”: touch an object of the house.`,
    captionHoldCamera: 'Thermal camera: touch a room of the house.',
    captionClue: name => `${name}: read its card, on the right.`,
    captionTagged: (name, form) => `${name}: label “${form}”. Read its card again, on the right.`,
    captionCamera: room => `The thermal camera films ${room}. Write the temperature of each working device in your notebook.`,
    captionMeter: 'Switch the devices on and off, and watch the display. Write the power of each device in your notebook.',

    notebookTitle: 'Your notebook',
    tempHead: 'Temperature when working (°C)',
    tempShort: 'Temperature',
    wattHead: 'Power (W)',
    tempAria: name => `${name}: temperature in °C`,
    wattAria: name => `${name}: power in W`,
    lockCamera: room => `Film ${room} with the thermal camera first.`,
    lockMeter: the => `Open the electricity meter in the cellar first. Then switch ${the} on or off and watch the display.`,
    lockRun: (tags, notes) => {
      const parts = [];
      if (tags) parts.push(tags === 1 ? '1 object without a label' : `${tags} objects without a label`);
      if (notes) parts.push(notes === 1 ? '1 measurement missing in your notebook' : `${notes} measurements missing in your notebook`);
      return `Not finished yet: ${parts.join(' and ')}.`;
    },
    runInfo: (tags, tagsTotal, notes, notesTotal) => `Labels: ${tags} / ${tagsTotal} · Notebook: ${notes} / ${notesTotal}`,
    toConclude: 'Next: conclude',

    // Étape 3
    resultsTitle: 'Your results',
    choose: '— choose —',
    forms: { C: 'chemical (C)', M: 'mechanical (M)', T: 'thermal (T)', no: 'no storage' },
    storedHead: 'Energy stored',
    concl1: (n, store) => `Energy is stored in ${n} objects of the house. The working devices ${store} energy.`,
    countAria: 'Number of objects',
    storeWords: { not: 'do not store', yes: 'store' },
    storeAria: 'The working devices',
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

    report: {
      title: 'Laboratory report — Energy detectives at home',
      because: 'Because',
      materials: list => `A house with ${list}. A thermal camera (temperature in °C). The electricity meter of the house and its display (power in W).`,
      procedure: [
        'Read the card of each object and label the energy that it stores.',
        'Film each room with the thermal camera, with the devices switched on, and read their temperature.',
        'Switch each device on alone and read the power on the display of the electricity meter.',
        'Write the measurements in the notebook.'
      ],
      tagsCaption: 'Labels: the energy stored',
      notesCaption: room => `Notebook (temperature of the room: ${room} °C)`,
      warm: (list, room) => `Working devices warmer than the room (${room} °C): ${list}.`,
      powers: list => `Powers of the devices: ${list}.`,
      verdict: (row, word) => `${row}: ${word}.`,
      score: n => `Score: ${n} / 5 checks passed.`
    }
  },

  glossary: {
    'energy storage': 'stockage d’énergie', store: 'stockent', stored: 'stocké(e)', storage: 'stockage', stores: 'stocke',
    'thermal camera': 'caméra thermique', 'electricity meter': 'compteur électrique', display: 'afficheur (écran)', power: 'puissance',
    'working devices': 'appareils qui fonctionnent', devices: 'appareils', device: 'appareil', dissipate: 'dissipent',
    'every second': 'chaque seconde', wasted: 'gaspillée (perdue)', spreads: 'se répand', warmer: 'plus chaud(s)', colder: 'plus froid(s)',
    'switched on': 'allumé(e)', 'switched off': 'éteint(e)', 'switch it on': 'allume-le', switch: 'allume ou éteins', 'film': 'filme', films: 'filme',
    label: 'étiquette', labels: 'étiquettes', bulb: 'ampoule', 'traditional bulb': 'ampoule classique (à incandescence)',
    'ceiling lamp': 'plafonnier', 'desk lamp': 'lampe de bureau', refrigerator: 'frigo (réfrigérateur)', 'hair dryer': 'sèche-cheveux', blows: 'souffle',
    'microwave oven': 'four à micro-ondes', microwave: 'micro-ondes', dishwasher: 'lave-vaisselle', dishes: 'vaisselle', dirty: 'sale',
    'hot water tank': 'ballon d’eau chaude (boiler)', tap: 'robinet', batteries: 'piles', drawer: 'tiroir', torch: 'lampe de poche',
    'power bank': 'batterie externe', charge: 'charger', charged: 'chargé(e)', 'wood logs': 'bûches', stove: 'poêle', burn: 'brûler',
    apples: 'pommes', bowl: 'bol', slingshot: 'lance-pierre', 'elastic band': 'élastique', stretched: 'tendu', 'wind-up': 'à remonter',
    key: 'clé', 'let it go': 'lâche-le', 'drives on its own': 'roule tout seul', cellar: 'cave', bedroom: 'chambre',
    bathroom: 'salle de bain', 'living room': 'salon', kitchen: 'cuisine', 'investigate': 'enquête sur', detective: 'détective',
    soup: 'soupe', 'all day long': 'toute la journée', heats: 'chauffe', heated: 'a chauffé', 'at night': 'la nuit', 'last night': 'la nuit dernière',
    'whole house': 'toute la maison', alone: 'seul', insulated: 'isolé', escapes: 's’échappe', notebook: 'cahier'
  },

  // Étape Check : pourquoi.
  explanations: {
    camera: 'A thermal camera shows how warm things are, in °C. It does not measure energy, but a working device that is warmer than the room gives thermal energy to the air. A device that is switched off does not warm up: it is at the temperature of the room.',
    meter: 'The display of the electricity meter shows the power of the whole house. To know the power of one device, switch it on alone, or compare the display before and after you switch it on.',
    stores: {
      tank: 'The hot water tank works with electricity at night: it heats the water and keeps it hot for the day. It stores thermal energy (T). Its surface is a bit warmer than the cellar: some of this thermal energy slowly escapes. That is why a hot water tank is insulated.',
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
    power: list => `Each device alone: ${list}. The higher the power, the more energy the device transforms every second.`,
    powerHot: 'The hottest device is not always the most powerful one: a big device can spread its thermal energy over a large surface.'
  },

  check: {
    nothing: 'nothing',
    tempWrong: (name, said, right) => `${name}: you wrote ${said}, but when it works, the thermal camera shows ${right}.`,
    tempOff: (name, said, right) => `${name}: you wrote ${said}, the temperature of the room. You filmed it when it was switched off: a device that does not work does not warm up. When it works, the thermal camera shows ${right}.`,
    wattWrong: (name, said, right) => `${name}: you wrote ${said}, but alone, it transforms ${right}.`,
    wattSum: (name, said, others, right) => `${name}: you wrote ${said}, but other devices were working too (${others}). Alone, it transforms ${right}.`,
    notesScore: (good, total) => `${good} / ${total} measurements are correct.`,
    notesAllGood: 'Your notebook matches what the camera and the meter showed. Well measured!',
    tagWrong: (name, said, right) => `${name}: your label is “${said}”. The correct answer: ${right}.`,
    tagsAllGood: 'You found every energy storage of the house, with the right form. Well done!',
    answerOk: 'Correct!',
    answerWrong: 'Not quite. The correct answer:',
    yourHyps: 'Your hypotheses:',
    verdictOk: v => `Your hypothesis and your conclusion ${v === 'confirmed' ? 'say the same thing' : 'do not say the same thing'}: it is indeed ${v}. Well judged!`,
    verdictWrong: should => `Compare your hypothesis with your conclusion: they ${should === 'confirmed' ? 'say the same thing, so your hypothesis is confirmed' : 'do not say the same thing, so your hypothesis is rejected'}.`,
    rejectedNote: 'A rejected hypothesis is not a mistake: it is how science moves on.'
  }
});
