/* ===== Labo virtuel « Ostend 2100 » (phys2) : textes en anglais =====

   Simulation commune aux deux filières : js/lab-ostend.js, chargée après
   ce fichier. Le néerlandais (nl/jaar1/phys2/lab-ostend.nl.js) a exactement
   les mêmes clés, sauf le lexique (glossary).

   Les mots du lexique sont soulignés d'office partout où ils apparaissent
   (traduction française au survol ou au toucher).

   Phrases de la conclusion (concl) : chacune reçoit ses listes déroulantes
   (ou sa case) toutes faites ; les choix sont écrits pour s'y insérer tels
   quels. Les mêmes phrases servent à donner la bonne réponse dans la
   correction et le rapport.

   Chiffres : la hausse à Ostende de 1951 à 2019 vient des relevés du
   marégraphe (VLIZ) ; les réchauffements des scénarios sont ceux du GIEC
   (AR6, 2081-2100 par rapport à 1850-1900). */

LabEngine.addText('ostend', {
  labels: {
    title: 'Ostend 2100',

    // Page d'accueil (Mission) : toujours la même, rien du tirage ; des gestes, jamais des résultats.
    briefTitle: 'Mission: find out why the sea is rising, and get Ostend ready for 2100',
    briefTask: 'All over the world, the sea level is going up, also on the Belgian coast. You look for the causes on your bench, then you travel to 2100 on a model of the coast.',
    briefSteps: [
      '<strong>Place</strong> four water levels.',
      '<strong>Melt</strong> ice. <strong>Warm up</strong> sea water. <strong>Travel</strong> to 2100 on the model.',
      '<strong>Explain</strong> why the sea rises. <strong>Say</strong> what Ostend needs.'
    ],
    // Sous chaque phrase courte : le comment, en une phrase (jamais le résultat).
    briefDetails: [
      'Tap an arrow under each drawing: higher, the same or lower.',
      'Three stations, each with its notebook: write what you read on the glasses, the tube, the gauge and the graph.',
      'Use your three notebooks.'
    ],

    // Masse au dixième, avec le séparateur décimal de la langue.
    num: v => v.toFixed(1),
    units: { ml: 'mL', mm: 'mm', g: 'g', c: '°C', cm: 'cm' },

    yourQuestion: 'Your question',
    bigQuestion: 'Why is the sea rising, and what will it change at Ostend by 2100?',
    intro: 'First the causes: two experiments. Then the effects: a model of the coast at Ostend.',
    factsTitle: 'A fact',
    factPast: 'At Ostend, the sea level went up by about 13 cm between 1951 and 2019.',
    // Dit au Check et dans le rapport, jamais avant. w : réchauffement en 2100, déjà écrit (labels.num).
    scenarios: {
      low: w => `Your scenario: the world quickly cuts its greenhouse gas emissions. In 2100, the Earth is about ${w} °C warmer than in 1850–1900.`,
      medium: w => `Your scenario: greenhouse gas emissions stay close to today’s until 2050, then go down. In 2100, the Earth is about ${w} °C warmer than in 1850–1900.`,
      high: w => `Your scenario: greenhouse gas emissions keep going up. In 2100, the Earth is about ${w} °C warmer than in 1850–1900.`,
      veryHigh: w => `Your scenario: greenhouse gas emissions go up very fast. In 2100, the Earth is about ${w} °C warmer than in 1850–1900.`
    },

    hypothesisTitle: 'Your hypotheses',
    hypLevels: 'Where will the water be at the end: higher, the same or lower? Tap an arrow under each drawing. The last drawing shows a very strong storm today.',
    predNames: { a: 'floating ice melts', b: 'ice on a grid melts', flask: 'sea water warms up', storm: 'a very strong storm hits in 2100' },
    moves: { up: 'higher', same: 'the same', down: 'lower' },
    because: 'Why do you think so? (optional)',
    becausePlaceholder: 'Because…',
    hypothesisReady: 'Your hypotheses are ready.',
    hypothesisPending: 'Place the four levels.',
    toBench: 'Next: the experiments',

    lockHypothesis: 'Place the four levels first.',
    lockHypothesisFixed: 'Your hypotheses are fixed: the experiments have started. A scientist does not change a hypothesis after seeing the results!',
    lockNotStarted: 'Carry out the experiments first.',
    lockRun: n => `Finish the experiments first: ${n === 1 ? '1 station' : n + ' stations'} left.`,
    lockStation3: 'Finish stations 1 and 2 first: you need them to understand the model.',
    choose: 'choose',

    stations: ['Two glasses', 'Warm sea water', 'The coast until 2100'],
    notesTitle: 'Your notebook',
    capBadNumber: 'Write only the number you read (for example 60).',
    capStationDone: 'This station is finished. Go on to the next one, or conclude.',
    runInfo: n => `${n} / 3 stations finished`,
    missingRun: 'Something is still missing: look at the red boxes.',
    toConclude: 'Next: conclude',
    // Bouton suivant pendant l'expérience : le poste pas encore fini.
    toStation: ['Next: two glasses', 'Next: warm sea water', 'Next: the coast'],
    lockStationHere: 'Finish this station first.',
    backToLab: 'Back to the lab',
    checkConclusions: 'Check my conclusions',

    // Poste 1 : les deux verres.
    s1: {
      glassNames: { a: 'Glass 1', b: 'Glass 2' },
      ice: 'ice cubes',
      melt: 'Let the ice melt',
      meltSub: '1 hour, speeded up',
      melted: 'The ice has melted',
      meltedSub: '1 hour later',
      startHead: 'Start (mL)',
      endHead: 'End (mL)',
      hint: 'Glass 1: the ice floats in the water. Glass 2: the ice lies on a grid, above the water.',
      aria: { a0: 'Glass 1, level at the start', b0: 'Glass 2, level at the start', a1: 'Glass 1, level at the end', b1: 'Glass 2, level at the end' },
      lockStart: 'First put ice cubes in each glass.',
      lockStartFixed: 'The ice has melted: you cannot read the starting level any more.',
      lockEnd: 'You will read this level when the ice has melted.',
      lockMeltIce: 'First put ice cubes in each glass.',
      lockMeltNotes: 'First write the level at the start for each glass.',
      capIce: 'Put ice cubes in each glass: tap the ice cubes, then tap a glass.',
      capHoldIce: 'Now tap a glass.',
      capTakeIce: 'Take the ice cubes first: tap them.',
      capStart: 'Read the water level in each glass and write it in the “Start” column.',
      capMelt: 'Both levels written. Now let the ice melt.',
      capMelting: 'One hour goes by…',
      capEnd: 'All the ice has melted. Read the two levels again and write them in the “End” column.'
    },

    // Poste 2 : l'eau de mer tiédie.
    s2: {
      flask: 'flask of sea water',
      balance: 'balance',
      bath: 'water bath on a hot plate',
      thermo: 'sea water',
      heat: 'Heat: +5 °C',
      heatSub: 'warm up the water bath',
      zoomTitle: 'The thin tube, close up',
      massNames: { start: 'Mass at the start', end: 'Mass at the end' },
      massAria: { start: 'Mass of the flask at the start, in grams', end: 'Mass of the flask at the end, in grams' },
      tempHead: 'Temperature (°C)',
      levelHead: 'Level in the tube (mm)',
      levelAria: 'Level of the sea water in the thin tube, in mm',
      // t : température, en °C.
      levelAt: t => `Level in the tube at ${t} °C`,
      hint: 'The flask is full of sea water (coloured, to see it better). A stopper with a thin tube closes it.',
      lockFlaskMass: 'First write the mass of the flask.',
      lockFlaskBath: 'First read the level at the four temperatures.',
      lockFlaskDone: 'This experiment is finished.',
      lockHeatBath: 'First put the flask in the water bath.',
      lockHeatNote: 'First write the level in the tube at this temperature.',
      lockHeatDone: 'You have the four temperatures. Put the flask back on the balance.',
      lockLevel: 'You will read this level when the sea water is at this temperature.',
      lockLevelPast: 'The sea water is no longer at this temperature: you cannot read this level any more.',
      lockMassFixed: 'The flask has left the balance: you cannot read this mass any more.',
      lockMassEnd: 'At the end, put the flask back on the balance.',
      capMass: 'The flask is on the balance. Read its mass and write it.',
      capToBath: 'Mass written. Now put the flask in the water bath: tap the flask.',
      capLevel: 'Read the level of the sea water in the thin tube (close-up on the right) and write it.',
      capHeat: 'Level written. Heat the water bath by 5 °C.',
      capHeating: 'The sea water warms up…',
      capBack: 'Last level written. Put the flask back on the balance: tap the flask.',
      capMassEnd: 'Read the mass of the flask again and write it.'
    },

    // Poste 3 : le modèle de la côte.
    s3: {
      places: { sea: 'sea', beach: 'beach', dike: 'dike', city: 'Ostend', polders: 'polders' },
      tideLine: 'high tide in 2025',
      works: { sand: 'More sand', wall: 'Higher wall' },
      storm: 'Very strong storm',
      stormSub: 'at high tide, like in 1953',
      calm: 'Calm sea',
      calmSub: 'end the storm',
      gaugeTitle: 'Harbour gauge: average sea level',
      partsTitle: 'Where does the rise come from? (cm)',
      partNames: { ice: 'melted sea ice', land: 'melted land ice', water: 'warmer sea water' },
      in2100Head: 'In 2100',
      riseName: 'Rise of the sea',
      testHead: 'Storm test',
      overHead: 'Over the dike?',
      tests: {
        '2025-00': '2025',
        '2100-00': '2100, no new protection',
        '2100-10': '2100, more sand',
        '2100-01': '2100, higher wall',
        '2100-11': '2100, sand + wall'
      },
      overWords: { yes: 'yes', no: 'no' },
      riseAria: 'Rise of the sea in 2100, in cm',
      overAria: 'Did the water go over the dike?',
      hint: 'Over the dike? Look behind the dike: are the street and the polders under water?',
      // y : année.
      riseAt: y => `Rise of the sea in ${y}`,
      lockRise: 'Go to 2100 to read the harbour gauge.',
      lockParts: 'You will read the graph in 2100.',
      lockTest: 'Run this storm test to say if the water goes over the dike.',
      lockYear2100: 'First test the storm in 2025 and say if the water went over the dike.',
      lockWorksYear: 'New protections are for 2100: go to 2100 first.',
      lockWorksFirst: 'First test the storm in 2100 with no new protection, and note it.',
      lockStormNote: 'First write the rise of the sea and its two parts in your notebook.',
      capStormToday: 'This is today, at high tide. Start a very strong storm to see how high the water goes.',
      capStorming: 'The storm pushes the sea against the dike…',
      capTest: 'Look at the coast: did the water go over the dike? Choose yes or no in your notebook.',
      capCalm: 'Test noted. Calm the sea to go on.',
      capGo2100: 'Now travel to 2100: tap 2100.',
      capRise: 'Read the harbour gauge: how much higher is the sea? Write it in your notebook.',
      capParts: 'Now read the graph: write the part of melted land ice and the part of warmer sea water.',
      capStorm2100: 'Start a very strong storm in 2100, with no new protection.',
      capBackToday: 'Go back to 2025 and test the storm there too.',
      capWorks: 'Now test protections in 2100: more sand, a higher wall, or both. Then conclude.'
    },

    resultsTitle: 'Your results',
    // Valeurs déjà écrites avec leur unité, ou un tiret.
    recap: {
      glass: (name, start, end) => `${name}: ${start} → ${end}`,
      flask: (t0, t1, start, end) => `From ${t0} °C to ${t1} °C: ${start} → ${end}`,
      mass: (start, end) => `Mass: ${start} → ${end}`,
      rise: (rise, land, water) => `In 2100: the sea is ${rise} higher (land ice ${land}, warmer water ${water})`,
      test: (name, over) => `${name}: over the dike: ${over}`
    },
    whyTitle: 'Why is the sea rising?',
    whatTitle: 'What will it change at Ostend by 2100?',
    // Chaque phrase reçoit sa liste (ou sa case) ; dans la correction, le bon mot.
    concl: {
      glass: sel => `The water level went up only in the glass where the ice was ${sel}.`,
      glassWords: { a: 'floating in the water', b: 'on the grid' },
      glassAria: 'Where the ice was',
      source: sel => `So the sea rises when ${sel} melts.`,
      sourceWords: { sea: 'floating sea ice', land: 'ice on land', both: 'any ice' },
      sourceAria: 'Which ice makes the sea rise',
      biggest: sel => `In 2100, the biggest part of the rise comes from ${sel}.`,
      biggestWords: { ice: 'melted sea ice', land: 'melted land ice', water: 'warmer sea water' },
      biggestAria: 'Where most of the rise comes from',
      water: (volume, mass) => `When the sea water warmed up, its volume ${volume} and its mass ${mass}.`,
      changeWords: { up: 'went up', same: 'stayed the same', down: 'went down' },
      volumeAria: 'What the volume did',
      massAria: 'What the mass did',
      particles: sel => `Its particles ${sel}.`,
      particleWords: { space: 'move faster and take more space', bigger: 'get bigger', more: 'become more numerous' },
      particlesAria: 'What the particles do',
      rise: input => `On the model, the sea at Ostend is ${input} cm higher in 2100 than in 2025.`,
      over: sel => `Then, with no new protection, the water of a very strong storm ${sel} the top of the dike.`,
      overWords: { over: 'goes over', under: 'stays below' },
      overAria: 'The storm water and the top of the dike',
      work: sel => `The least work that keeps the city dry: ${sel}.`,
      workWords: { sand: 'more sand on the beach', wall: 'a higher storm wall', both: 'more sand and a higher storm wall' },
      workAria: 'The least work that is enough'
    },
    verdictNames: { vA: 'Glass 1', vB: 'Glass 2', vFlask: 'The flask', vStorm: 'The storm in 2100' },
    confirmed: 'confirmed',
    rejected: 'rejected',

    scoreLabel: 'checks passed',
    markCorrect: 'correct',
    markIncorrect: 'incorrect',
    criteria: { measure: 'Measurements', ice: 'The ice', water: 'Warm water', coast: 'Ostend in 2100', verdict: 'Hypotheses' },
    criteriaSub: { measure: 'Your three notebooks', ice: 'Your answer about the glasses', water: 'Your answer about the flask', coast: 'Your answers about the coast', verdict: 'Your judgements' },
    particleNames: { ice: 'ice', water: 'liquid water' },

    report: {
      title: 'Laboratory report — Why the sea rises, and Ostend in 2100',
      because: 'Because',
      hypLevel: (name, word) => `When ${name}: the level will be ${word}.`,
      materials: [
        'Two graduated glasses, water, ice cubes, a grid.',
        'A flask full of sea water with a stopper and a thin tube, a water bath on a hot plate, a thermometer, a balance.',
        'A model of the coast at Ostend: harbour gauge, graph of where the rise comes from, storm, protections.'
      ],
      procedure: [
        'Two glasses: put ice cubes in the water of glass 1 and on the grid of glass 2. Write the two levels, let the ice melt, write the two levels again.',
        'Sea water: weigh the flask, warm it up in steps of 5 °C and write the level in the thin tube each time, then weigh it again.',
        'Model: test a very strong storm in 2025, then go to 2100. Write the rise of the sea and its two parts. Test the storm in 2100, then test protections.'
      ],
      verdict: (text, word) => `${text}: ${word}.`,
      score: (n, total) => `Score: ${n} / ${total} checks passed.`
    }
  },

  glossary: {
    'sea level': 'niveau de la mer', 'sea ice': 'banquise (glace de mer)', 'land ice': 'glace terrestre (glaciers, calottes)',
    'ice on land': 'glace sur la terre ferme', 'ice sheets': 'calottes glaciaires',
    dike: 'digue', 'storm wall': 'mur anti-tempête', storm: 'tempête', 'high tide': 'marée haute',
    beach: 'plage', sand: 'sable', harbour: 'port', 'harbour gauge': 'mire du port (échelle graduée)', staff: 'mire (échelle graduée)',
    'ice cubes': 'glaçons', grid: 'grille', flask: 'flacon', stopper: 'bouchon', 'thin tube': 'tube fin',
    'sea water': 'eau de mer', 'water bath': 'bain d’eau', 'hot plate': 'plaque chauffante',
    floats: 'flotte', floating: 'qui flotte', melts: 'fond', melted: 'fondue', melt: 'fondre',
    'warms up': 'se réchauffe', 'warmed up': 's’est réchauffée', warmer: 'plus chaude',
    'thermal expansion': 'dilatation thermique', 'greenhouse gas': 'gaz à effet de serre',
    rise: 'hausse', rises: 'monte', rising: 'en train de monter', weigh: 'peser',
    'goes over': 'passe par-dessus', 'stays below': 'reste sous', 'least work': 'moins de travaux', average: 'moyen'
  },

  // Étape Check : ce qui se passe.
  explanations: {
    ice: 'Floating ice already pushes aside as much water as it becomes when it melts: the level does not change. This is why the melting sea ice of the Arctic does not raise the sea. Ice on land (glaciers, the ice sheets of Greenland and Antarctica) is new water for the sea: there is more water in the sea, so its level rises.',
    float: 'Water is special: when it freezes, its particles take more space. Ice takes about one tenth more space than the water it comes from, so it floats, with one tenth above the water.',
    water: 'The stopper let nothing in or out: the mass and the number of particles stayed the same. But warmer particles move faster and take more space, so the volume goes up: this is thermal expansion. The sea does the same when it gets warmer.',
    // land, water : les deux parts de la hausse en 2100, en cm.
    coast: (land, water) => `In your scenario, melted land ice gives about ${land} cm and warmer sea water about ${water} cm by 2100. It looks small, but a storm then starts from a higher sea, so the water reaches higher on the dike. And the polders behind the dike already lie below the level of high tide: they depend on the dike.`,
    emissions: 'With fewer greenhouse gases, the sea rises less: about 40 cm by 2100 if the world quickly cuts its emissions, up to 70 cm if they go up very fast.',
    model: 'A model simplifies. The real rise could be lower or higher than this middle value, and it does not stop in 2100. Belgium already adds sand to its beaches and builds storm walls, also at Ostend.'
  },

  // v : ce que l'élève a noté (null si rien) ; r : la vraie valeur.
  check: {
    noExperiment: 'You did not carry out the experiments: there are no measurements.',
    measureScore: (good, total) => `${good} / ${total} measurements written correctly.`,
    measureAllGood: 'All your measurements match what the glasses, the tube, the balance, the harbour gauge, the graph and the coast showed. Well read!',
    noteMiss: (what, v, r, unit) => v == null ? `${what}: nothing written (it was ${r} ${unit}).` : `${what}: you wrote ${v} ${unit}, it was ${r} ${unit}.`,
    overMiss: (name, v, r) => v == null ? `Storm test “${name}”: you did not say if the water went over the dike (it was “${r}”).` : `Storm test “${name}”, over the dike: you wrote “${v}”, it was “${r}”.`,
    more: n => `… and ${n} more.`,
    answerOk: 'Correct!',
    answerWrong: 'Not quite. The correct answer:',
    notTested: 'This protection is the right one, but you did not test it on the model: a scientist checks before concluding.',
    testLine: (name, word) => `${name}: over the dike: ${word}.`,
    verdictLevel: (name, pred, obs, should) => `When ${name}: you predicted “${pred}”, you observed “${obs}”. Your hypothesis is ${should === 'confirmed' ? 'confirmed' : 'rejected'}.`,
    judgedOk: 'Well judged!',
    judgedWrong: 'You judged it the other way round.',
    rejectedNote: 'A rejected hypothesis is not a mistake: it is how science moves on.'
  }
});
