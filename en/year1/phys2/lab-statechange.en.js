/* ===== Labo virtuel « Watch it change » (phys2) : textes en anglais =====

   Simulation commune aux deux filières : js/lab-statechange.js, chargée
   après ce fichier. Le néerlandais (nl/jaar1/phys2/lab-statechange.nl.js) a
   exactement les mêmes clés, sauf le lexique (glossary).

   Les mots du lexique sont soulignés d'office partout où ils apparaissent
   (traduction française au survol ou au toucher) ; [mot|clé] seulement pour
   une forme dont la clé diffère.

   Phrases de la conclusion : chacune reçoit ses listes déroulantes (et sa
   case) toutes faites ; les choix sont écrits pour s'y insérer tels quels
   (« the temperature » + « stayed the same »). Les mêmes phrases servent à
   donner la bonne réponse dans la correction et le rapport. */

LabEngine.addText('statechange', {
  labels: {
    title: 'Watch it change',

    // Page d'accueil (Mission) : toujours la même, rien du tirage ; des gestes, jamais des résultats.
    briefTitle: 'Mission: catch a change of state in the act',
    briefTask: 'On your bench, a substance is about to change state. You follow it minute by minute, with a thermometer and a balance.',
    briefSteps: [
      '<strong>Sketch</strong> the temperature curve. <strong>Bet</strong> on the mass.',
      '<strong>Weigh</strong>. <strong>Read</strong> the thermometer every minute. <strong>Weigh</strong> again.',
      '<strong>Answer</strong> the two questions. Were you right?'
    ],
    // Sous chaque phrase courte : le comment, en une phrase (jamais le résultat).
    briefDetails: [
      'Tap an arrow for each part of the curve.',
      'Write each temperature and the state in your table: the graph draws itself. You decide if you close the container.',
      'Use your graph and your two masses.'
    ],
    briefQuestion: 'What happens to a substance during a change of state?',

    // Masse au dixième, avec le séparateur décimal de la langue.
    num: v => v.toFixed(1),
    // Température au degré, avec le signe moins typographique.
    deg: v => (v < 0 ? '−' : '') + Math.abs(v),
    units: { c: '°C', g: 'g' },

    yourQuestion: 'Your question',
    bigQuestion: 'What happens to a substance during a change of state?',
    // Deux sous-questions (a, b), selon la situation tirée.
    subQuestions: {
      iceMelt: ['How does the temperature change while the ice melts?', 'How does the mass change?'],
      waterFreeze: ['How does the temperature change while the water freezes?', 'How does the mass change?'],
      waterBoil: ['How does the temperature change while the water boils?', 'How does the mass change?'],
      acidMelt: ['How does the temperature change while the stearic acid melts?', 'How does the mass change?'],
      acidFreeze: ['How does the temperature change while the stearic acid freezes?', 'How does the mass change?']
    },
    todayTitle: 'Your experiment',
    // t : température de départ, déjà écrite (labels.deg).
    situations: {
      iceMelt: t => `You have crushed ice at ${t} °C in a beaker. You will heat it on a hot plate.`,
      waterFreeze: t => `You have water at ${t} °C in a beaker. You will cool it in a bath of ice and salt (about −15 °C).`,
      waterBoil: t => `You have water at ${t} °C in a flask. You will heat it on a hot plate.`,
      acidMelt: t => `You have solid stearic acid (a candle wax) at ${t} °C in a beaker. You will heat it in a hot water bath (90 °C).`,
      acidFreeze: t => `You have liquid stearic acid (a candle wax) at ${t} °C in a beaker. You will let it cool in the air of the room (21 °C).`
    },

    hypothesisTitle: 'Your hypothesis',
    hypCurve: 'Sketch the temperature curve: tap an arrow for each part.',
    hypBet: 'Your bet: at the end, the balance will show…',
    // Les tronçons de la courbe, selon la situation.
    zoneNames: {
      iceMelt: ['only ice', 'ice and water together', 'only water'],
      waterFreeze: ['only water', 'water and ice together', 'only ice'],
      waterBoil: ['the water heats up', 'the water boils'],
      acidMelt: ['all solid', 'solid and liquid together', 'all liquid'],
      acidFreeze: ['all liquid', 'liquid and solid together', 'all solid']
    },
    slopes: { up: 'goes up', flat: 'stays the same', down: 'goes down' },
    bets: { more: 'more mass', same: 'the same mass', less: 'less mass' },
    sketchX: 'time',
    sketchY: 'temperature',
    because: 'Why do you think so? (optional)',
    becausePlaceholder: 'Because…',
    hypothesisReady: 'Your hypothesis is ready.',
    hypothesisPending: 'Sketch the curve and make your bet.',
    toBench: 'Next: the experiment',

    // Noms repris dans les phrases : forme avec article, et lieu (« on the hot plate »).
    vessels: {
      beaker: { name: 'beaker', the: 'the beaker' },
      flask: { name: 'flask', the: 'the flask' }
    },
    devices: {
      hotplate: { name: 'hot plate', onto: 'on the hot plate' },
      icebath: { name: 'bath of ice and salt', onto: 'in the bath of ice and salt' },
      waterbath: { name: 'hot water bath', onto: 'in the hot water bath' },
      mat: { name: 'cork mat', onto: 'on the cork mat' }
    },
    tools: { probe: 'thermometer', film: 'cling film', balloon: 'balloon', balance: 'balance' },
    substances: { water: 'water', stearic: 'stearic acid' },
    states: { solid: 'solid', solidLiquid: 'solid + liquid', liquid: 'liquid', liquidGas: 'liquid + gas' },
    choose: 'choose',

    lockHypothesis: 'Sketch every part of the curve and make your bet first.',
    lockHypothesisFixed: 'Your hypothesis is fixed: the experiment has started. A scientist does not change the hypothesis after seeing the results!',
    lockNotStarted: 'Carry out the experiment first.',
    lockRun: 'Finish the experiment first: every line of the table and the two masses.',
    lockDevice: 'First put the container on the balance and write the initial mass.',
    lockVesselRunning: 'The experiment is running: do not move the container.',
    lockProbeOut: 'Take the thermometer out first: tap it.',
    lockProbeKeep: 'Leave the thermometer in: you need it until the end.',
    lockProbeOver: 'The experiment is over: you do not need the thermometer any more.',
    lockProbeStart: 'First weigh, then tap “Start measuring”.',
    lockStartMass: 'First weigh the container and write the initial mass.',
    lockStartDevice: (the, onto) => `First put ${the} ${onto}.`,
    lockCover: 'Too late to change this: the container has left the balance.',
    lockMassStart: 'First put the container on the balance.',
    lockMassFixed: 'The container has left the balance: you cannot read this mass any more.',
    lockMassEnd: 'At the end of the experiment, put the container back on the balance.',
    lockRow: 'First put the container in place, with the thermometer in it.',
    lockTickSetup: 'First put the thermometer in the container.',
    lockTickRow: 'First write the temperature and the state for this minute.',
    lockRedo: 'You have already started again once.',

    tick: '1 minute',
    tickSetup: 'Thermometer first',
    phases: ['Weigh', 'Measure', 'Weigh again'],
    startMeasure: 'Start measuring',
    startMeasureSub: 'The container stays in place',
    tickRow: 'Fill in the line first',
    tickReady: 'Ready: let time pass!',
    timeUp: 'Time is up',
    timeUpSub: 'The experiment stops.',
    timerInfo: n => `Experiment: ${n} minutes`,

    notesTitle: 'Your notes',
    massNames: { start: 'Initial mass', end: 'Final mass' },
    massAria: { start: 'Initial mass, in grams', end: 'Final mass, in grams' },
    tableTime: 'Time (min)',
    tableTemp: 'Temp. (°C)',
    tableState: 'State',
    tempAria: 'Temperature for this minute, in °C',
    stateAria: 'State for this minute',
    graphTitle: 'Your graph',
    axisX: 'Time (min)',
    axisY: 'Temperature (°C)',

    // the : le récipient avec son article ; onto : le lieu (labels.devices).
    captionStart: the => `Take ${the} and put it on the balance.`,
    captionMassStart: 'Read the balance and write the initial mass in your notes.',
    captionToDevice: (the, onto) => `Now put ${the} ${onto}.`,
    captionProbe: the => `Take the thermometer and put it in ${the}.`,
    captionReady: the => `Ready? Tap “Start measuring”. Until then, you can still take ${the} back to the balance.`,
    captionRow0: 'Minute 0: read the thermometer. Write the temperature and the state in the table.',
    captionRow: 'Read the thermometer. Write the temperature and the state for this minute.',
    captionTick: 'Line complete. Press “1 minute” to let time pass.',
    captionRunning: 'One minute goes by…',
    captionProbeOut: 'Time is up. Take the thermometer out: tap it.',
    captionWeighEnd: the => `Put ${the} back on the balance.`,
    captionMassEnd: 'Read the balance and write the final mass in your notes.',
    captionDone: 'The experiment is over. Look at your graph, then go on to conclude.',
    captionCoverChanged: 'You changed what is on the balance: the mass is not the same. Write the new mass.',
    captionBadTemp: 'Write the temperature shown on the thermometer, in °C (for example 12 or −3).',
    captionBadMass: 'Write the mass shown on the balance, in grams (for example 187.4).',
    captionHoldVessel: 'Now tap the place where you want to put it.',
    captionHoldProbe: the => `Now tap ${the} to put the thermometer in it.`,
    captionTakeFirst: the => `Take ${the} first: tap it, then tap the place where you want to put it.`,

    runSetup: 'Set up your experiment.',
    runInfo: (m, n) => `Minute ${m} of ${n}`,
    missingRun: 'Something is still missing: look at the red boxes.',
    redo: 'Start the experiment again',
    redoTitle: 'Start the experiment again?',
    redoText: 'Your measurements will be erased. Your hypothesis stays. You can do this only once.',
    redoYes: 'Yes, start again',
    toConclude: 'Next: conclude',
    backToLab: 'Back to the lab',
    checkConclusions: 'Check my conclusions',

    resultsTitle: 'Your results',
    // a, b : masses déjà écrites avec leur unité, ou un tiret.
    massRecap: (a, b) => `Initial mass: ${a} · Final mass: ${b}`,
    // Chaque phrase reçoit sa liste (ou sa case) ; dans la correction, le bon mot.
    concl: {
      during: {
        iceMelt: sel => `While the ice was melting, the temperature ${sel}.`,
        waterFreeze: sel => `While the water was freezing, the temperature ${sel}.`,
        waterBoil: sel => `While the water was boiling, the temperature ${sel}.`,
        acidMelt: sel => `While the stearic acid was melting, the temperature ${sel}.`,
        acidFreeze: sel => `While the stearic acid was freezing, the temperature ${sel}.`
      },
      point: (input, sel, substance) => `During this change of state, the thermometer showed ${input} °C. This temperature is the ${sel} of ${substance}.`,
      mass: sel => `At the end, the balance showed ${sel} at the start.`,
      particles: sel => `The number of particles in the container ${sel}.`
    },
    duringWords: { up: 'went up', same: 'stayed the same', down: 'went down' },
    pointNames: { melting: 'melting point', boiling: 'boiling point' },
    massWords: { more: 'more than', same: 'the same mass as', less: 'less than' },
    particleWords: { up: 'went up', same: 'stayed the same', down: 'went down' },
    duringAria: 'What the temperature did during the change of state',
    conclTempAria: 'Temperature during the change of state, in °C',
    pointAria: 'Name of this temperature',
    massWordAria: 'The mass at the end, compared with the start',
    particlesAria: 'What the number of particles did',
    verdictCurve: 'My sketch of the curve is',
    verdictBet: 'My bet on the mass is',
    confirmed: 'confirmed',
    rejected: 'rejected',
    yourSketch: 'Your sketch',
    realCurve: 'What the thermometer showed',
    yourBet: bet => `Your bet: ${bet}.`,

    scoreLabel: 'checks passed',
    markCorrect: 'correct',
    markIncorrect: 'incorrect',
    criteria: { measure: 'Measurements', closed: 'Nothing in, nothing out', plateau: 'The temperature', mass: 'The mass', verdict: 'Hypothesis' },
    criteriaSub: { measure: 'Your table and your masses', closed: 'Your container', plateau: 'Your answer to question a', mass: 'Your answer to question b', verdict: 'Your judgement' },
    legendYours: 'your notes',
    legendReading: 'thermometer readings',

    report: {
      title: 'Laboratory report — Temperature and mass during a change of state',
      because: 'Because',
      hypZone: (zone, slope) => `${zone}: the temperature ${slope}`,
      hypBet: bet => `At the end, the balance will show ${bet}.`,
      materials: {
        iceMelt: 'A beaker with crushed ice, a hot plate, a digital thermometer, a balance, a timer',
        waterFreeze: 'A beaker with water, a bath of ice and salt, a digital thermometer, a balance, a timer',
        waterBoil: 'A flask with water, a hot plate, a digital thermometer, a balance, a timer',
        acidMelt: 'A beaker with solid stearic acid, a hot water bath on a hot plate, a digital thermometer, a balance, a timer',
        acidFreeze: 'A beaker with liquid stearic acid, a cork mat, a digital thermometer, a balance, a timer'
      },
      coverItem: { film: 'cling film', balloon: 'a balloon' },
      materialsLine: (base, cover) => `${base}${cover ? ', ' + cover : ''}.`,
      stepCover: { film: 'Close the beaker with cling film.', balloon: 'Close the flask with a balloon.' },
      stepOpen: { film: 'Leave the beaker open.', balloon: 'Leave the flask open.' },
      stepWeigh: the => `Put ${the} on the balance. Write the initial mass.`,
      stepPlace: (the, onto) => `Put ${the} ${onto}. Put the thermometer in it. Write the temperature and the state at 0 minutes.`,
      stepRead: n => `Start the timer. Every minute, for ${n} minutes, write the temperature and the state.`,
      stepEnd: the => `Take the thermometer out. Put ${the} back on the balance. Write the final mass.`,
      stepGraph: 'Draw the graph of the temperature against time.',
      masses: (a, b) => `Initial mass: ${a} · Final mass: ${b}`,
      verdict: (text, word) => `${text} ${word}.`,
      score: (n, total) => `Score: ${n} / ${total} checks passed.`
    }
  },

  glossary: {
    'change of state': "changement d'état", 'thermal energy': 'énergie thermique',
    melts: 'fond', melting: 'fusion (en train de fondre)', 'melting point': 'point de fusion',
    freezes: 'se solidifie (gèle)', freezing: 'solidification (en train de se solidifier)',
    boils: 'bout', boiling: 'ébullition (en train de bouillir)', 'boiling point': "point d'ébullition",
    'heats up': 'chauffe', heat: 'chauffer', 'heat source': 'source de chaleur', cool: 'refroidir',
    beaker: 'bécher', flask: 'flacon (erlenmeyer)', container: 'récipient',
    'hot plate': 'plaque chauffante', 'hot water bath': 'bain-marie', salt: 'sel',
    'cork mat': 'plaque de liège', 'cling film': 'film étirable',
    'crushed ice': 'glace pilée', 'candle wax': 'cire de bougie',
    weigh: 'peser', timer: 'chronomètre',
    sketch: 'esquisse (dessin rapide)', bet: 'pari',
    'goes up': 'augmente', 'goes down': 'diminue', 'stays the same': 'reste pareil',
    'went up': 'a augmenté', 'went down': 'a diminué', 'stayed the same': 'est resté pareil',
    plateau: 'palier', links: 'liaisons', surroundings: 'ce qui l’entoure'
  },

  // Étape Check : ce qui se passe au niveau des particules.
  explanations: {
    energy: {
      melt: 'The heat source gives thermal energy all the time. Before and after the melting, this energy makes the particles move faster: the temperature goes up. During the melting, it breaks the links between the particles: they do not move faster, so the temperature stays the same. The flat part of the graph is called a plateau.',
      freeze: 'The substance gives thermal energy to its colder surroundings all the time. Before and after the freezing, its particles slow down: the temperature goes down. During the freezing, new links form between the particles: they do not slow down, so the temperature stays the same. The flat part of the graph is called a plateau.',
      boil: 'The hot plate gives thermal energy all the time. Before the boiling, this energy makes the particles move faster: the temperature goes up. During the boiling, it breaks the links between the particles, which leave the liquid as a gas: they do not move faster, so the temperature stays the same. The flat part of the graph is called a plateau.'
    },
    fixed: {
      iceMelt: 'Ice made of pure water always melts at 0 °C: this is the melting point of water.',
      waterFreeze: 'Water freezes at the same temperature as ice melts: 0 °C, the melting point of water.',
      waterBoil: 'Pure water always boils at 100 °C (at sea level): this is its boiling point.',
      acidMelt: 'Each pure substance has its own melting point: 69 °C for stearic acid, 0 °C for water.',
      acidFreeze: 'A liquid freezes at the same temperature as its solid melts: 69 °C for stearic acid. Each pure substance has its own melting point.'
    },
    mass: {
      same: 'During a change of state, no particle is created or destroyed: the number of particles stays the same, so the mass stays the same. Only the links between the particles change.',
      lost: 'The water did not disappear: the missing grams are water particles that left the open flask as vapour. No particle is created or destroyed during a change of state. In a closed container, the mass stays the same.'
    }
  },

  // m : minute ; v : ce que l'élève a noté (null si rien) ; r : la vraie
  // valeur ; les nombres sont déjà écrits (labels.num, labels.deg).
  check: {
    noExperiment: 'You did not carry out the experiment: there are no measurements.',
    measureScore: (good, total) => `${good} / ${total} measurements written correctly.`,
    measureAllGood: 'All your measurements match the thermometer, the container and the balance. Well read!',
    tempMiss: (m, v, r) => v == null ? `Minute ${m}: no temperature written (the thermometer showed ${r} °C).` : `Minute ${m}: you wrote ${v} °C, the thermometer showed ${r} °C.`,
    stateMiss: (m, v, r) => v == null ? `Minute ${m}: no state written (it was “${r}”).` : `Minute ${m}: you wrote “${v}”, it was “${r}”.`,
    massMiss: (name, v, r) => v == null ? `${name}: nothing written (the balance showed ${r} g).` : `${name}: you wrote ${v} g, the balance showed ${r} g.`,
    more: n => `… and ${n} more.`,
    closedOk: {
      film: 'You closed the beaker with cling film: nothing could get in or out. The balance compares the same matter before and after.',
      balloon: 'You closed the flask with a balloon: the vapour stayed inside. The balance compares the same matter before and after.'
    },
    openBoil: g => `You left the flask open. The water vapour escaped into the room: the balance lost ${g} g. With a balloon on the flask, the vapour stays inside and the balance still weighs it.`,
    openOther: 'You left the beaker open. Here the balance did not show a difference, but something could get in or out (water vapour, dust). To compare the mass before and after, a scientist closes the container.',
    closedWhy: 'To know if the mass of a substance changes, nothing must get in or out during the experiment.',
    answerOk: 'Correct!',
    answerWrong: 'Not quite. The correct answer:',
    pointTemp: t => `Look at your table again: while the two states were together, the thermometer stayed at ${t} °C.`,
    verdictCurve: {
      confirmed: 'Your sketch and your conclusion show the same curve: your hypothesis about the curve is confirmed.',
      rejected: 'Your sketch and your conclusion do not show the same curve: your hypothesis about the curve is rejected.'
    },
    verdictBet: {
      confirmed: 'Your bet and your conclusion about the mass say the same thing: your bet is confirmed.',
      rejected: 'Your bet and your conclusion about the mass do not say the same thing: your bet is rejected.'
    },
    judgedOk: 'Well judged!',
    judgedWrong: 'You judged it the other way round.',
    yourConclusion: sentence => `Your conclusion: ${sentence}`,
    rejectedNote: 'A rejected hypothesis is not a mistake: it is how science moves on.'
  }
});
