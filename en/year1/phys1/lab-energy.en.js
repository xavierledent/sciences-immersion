/* ===== Labo virtuel « The energy test bench » (phys1) : textes en anglais =====

   Simulation commune aux deux filières : js/lab-energy.js, chargée après ce
   fichier. Le néerlandais (nl/jaar1/phys1/lab-energy.nl.js) a exactement les
   mêmes clés.

   Chaque mot du lexique (glossary) est souligné partout où il apparaît,
   sauf dans les boutons (lab-engine.js) ; [mot] ou [mot|clé] reste utile
   pour une forme dont la clé diffère.

   Les phrases à trous (hypothèses, conclusions) sont des fonctions qui
   reçoivent les trous déjà dessinés, ou les mots choisis : chaque langue
   garde son ordre des mots. Mots du cours : « light energy » (pas « EMW »),
   « wasted / dissipated energy », « units ». */

LabEngine.addText('energy', {
  labels: {
    title: 'The energy test bench',

    // « a, b and c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0] || '',

    lamps: {
      led: { name: 'LED bulb', the: 'the LED bulb', a: 'an LED bulb' },
      halogen: { name: 'Halogen bulb', the: 'the halogen bulb', a: 'a halogen bulb' },
      traditional: { name: 'Traditional bulb', the: 'the traditional bulb', a: 'a traditional bulb' }
    },
    forms: {
      chemical: 'chemical energy', mechanical: 'mechanical energy', thermal: 'thermal energy',
      electrical: 'electrical energy', light: 'light energy', nuclear: 'nuclear energy'
    },
    amounts: { more: 'more energy than', same: 'as much energy as', less: 'less energy than' },
    fates: { air: 'dissipated in the air', destroyed: 'destroyed', stored: 'stored in the lamp' },
    tools: { meter: 'Energy meter', lightmeter: 'Light meter', camera: 'Thermal camera' },
    // Sous le nom de l'instrument : ce qu'il mesure.
    toolsMeasure: { meter: 'movement, electricity', lightmeter: 'light', camera: 'heat' },

    questions: {
      light: 'Both lamps receive the same energy. Which lamp gives more light?',
      waste: 'Both lamps receive the same energy. Which lamp [wastes] more of it?',
      end: 'At the end, is there as much energy as at the start?'
    },
    yourQuestions: 'Your questions',
    lampsLine: (a, b) => `Your two lamps: ${a} and ${b}. A dynamo with a [crank] will light them.`,
    hypothesisTitle: 'Your hypotheses',
    hyp1: {
      light: b => `I think that ${b} will give more light.`,
      waste: b => `I think that ${b} will [waste] more energy.`
    },
    hyp2: b => `I think that at the end, there will be ${b} at the start.`,
    because: 'Why do you think so? (optional)',
    becausePlaceholder: 'Because…',
    hypothesisReady: 'Your hypotheses are ready.',
    hypothesisPending: 'Tap the words that complete your two hypotheses.',
    toBench: 'Next: the test bench',

    tabs: { bench: 'The test bench', diagram: 'The energy flow diagram' },
    lampsTitle: 'Lamps',
    toolsTitle: 'Instruments',
    formsTitle: 'Forms of energy',
    lampState: { socket: 'in the socket', tested: 'tested' },
    scene: {
      label: 'Test bench: a dynamo with a crank, wires and a lamp',
      given: 'ENERGY GIVEN',
      units: 'units',
      dynamo: 'DYNAMO',
      socket: 'socket',
      over: 'TEST OVER',
      knob: 'Crank of the dynamo: click it, or turn it with your finger',
      spot: (n, row) => `Point ${n}, ${row}: measure here`
    },
    tableTitle: 'Your measurements',
    tableUnit: 'energy (units)',
    tableWhere: 'Measured at',
    // Le tableau, par machine : ce qu'elle reçoit (in), ce qu'elle donne (out).
    tableFlow: 'Energy',
    machines: { dynamo: 'Dynamo', lamp: 'Lamp' },
    io: { in: 'in', out: 'out' },
    rows: { crank: 'Axle of the crank', dynamo: 'Dynamo', wires: 'Wires', light: 'In front of the lamp', lamp: 'Lamp' },
    cellLabel: (row, lamp) => `${row}, ${lamp}, in units`,

    captionStart: 'Drag a lamp into the [socket], or touch it.',
    captionReady: 'Turn the crank: click it, or draw circles around the axle with your finger. The bench stops at 100 units.',
    captionTurning: 'Keep turning the [crank] until the bench has received 100 units.',
    captionTestDone: 'Test over: the bench received 100 units. Now measure the 5 numbered points: take an instrument, then choose a point.',
    captionMeasure: 'Measure the 5 numbered points: take an instrument, then choose a point.',
    // Instrument en main : ce qu'il mesure et ses points (allumés sur le banc).
    toolUse: { meter: 'the energy that goes through the axle and the wires', lightmeter: 'the light given by the lamp', camera: 'the heat given to the air' },
    points: nums => (nums.length === 1 ? `point ${nums[0]}` : `points ${nums.slice(0, -1).join(', ')} and ${nums[nums.length - 1]}`),
    captionToolPicked: (tool, use, pts) => `${tool} in your hand: it measures ${use}, at ${pts}. Choose a lit point.`,
    captionToolDone: tool => `${tool}: everything it measures is already measured for this lamp. Take another instrument.`,
    captionPickTool: 'Take an instrument first, then choose this point.',
    captionRead: 'Read the value and write it in the table.',
    captionNextLamp: 'All the values of this lamp are in the table. Now test the other lamp!',
    captionAllDone: 'Both lamps are tested and your table is complete. Next: the [energy flow diagram].',
    captionAlready: 'This lamp is already tested: its values are still on the bench.',
    captionBadValue: 'Write the number shown by the instrument: a whole number, for example 37.',
    captionNoLamp: 'Screw a lamp into the [socket] first.',
    wrongTool: {
      meter: 'The [energy meter] measures the energy that goes through a turning [axle] or through [wires]. Try another point.',
      lightmeter: 'The [light meter] measures the light given by the lamp: hold it in front of the lamp.',
      camera: 'The thermal camera measures the heat that an object gives to the air when it [gets warm].'
    },
    captionDiagram: 'Fill in the diagram on the left: put a form of energy in each box. The diagram on the right takes the same forms. Compare the arrows of the two lamps!',
    captionFormPicked: form => `In your hand: ${form}. Choose a box in the diagram on the left.`,
    captionPickForm: 'Take a form of energy first, then choose a box.',
    captionDiagramDone: 'All the boxes are filled. Compare the arrows of the two lamps, then conclude!',
    diagramFill: 'Fill in this diagram',
    diagramCopy: 'Same forms of energy, filled in for you',
    diagram: {
      label: lamp => `Energy flow diagram: ${lamp}`,
      hand: 'Your hand', dynamo: 'Dynamo', lamp: 'Lamp', room: 'Room', air: 'Air',
      useful: 'useful energy', wasted: 'wasted energy, into the air',
      emptyBox: 'empty box'
    },
    arrows: { crank: 'Hand → dynamo', dynamo: 'Dynamo → air', wires: 'Dynamo → lamp', light: 'Lamp → room', lamp: 'Lamp → air' },

    lockHypothesis: 'Complete your two hypotheses first.',
    lockHypothesisFixed: 'Your hypotheses are fixed: the experiment has started. A scientist does not change the hypothesis after seeing the results!',
    lockNoLamp: 'Screw a lamp into the socket first.',
    lockTurnFirst: 'Turn the crank first: the bench measures the energy during the test.',
    lockCrankDone: 'Test over: the bench stopped at 100 units. Both lamps receive exactly the same energy.',
    lockCell: (row, lamp) => `First measure this point with the right instrument, with ${lamp} in the socket.`,
    lockValues: n => `First write all your measurements in the table: ${n === 1 ? '1 value' : n + ' values'} still missing.`,
    lockForms: n => `Complete the energy flow diagram: ${n === 1 ? '1 box' : n + ' boxes'} still empty.`,
    toDiagram: 'Next: the energy flow diagram',
    toConclude: 'Next: conclude',
    runInfo: (v, vt, f, ft) => `Table: ${v} / ${vt} values · Diagram: ${f} / ${ft} boxes`,

    concl1: {
      light: b => `My results show that ${b} gives more light.`,
      waste: b => `My results show that ${b} [wastes] more energy.`
    },
    concl2: b => `At the end, there is ${b} at the start.`,
    concl3: (form, fate) => `The energy that does not become light becomes ${form}. It is ${fate}.`,
    balanceTitle: 'Your energy balance',
    startChoose: 'Energy at the start: choose it.',
    startResult: v => `${v} units`,
    endChoose: 'Energy at the end: choose all of it.',
    endCalc: 'Add them up for each lamp.',
    calcStart: 'start:',
    calcEnd: 'end:',
    balanceHint: 'Compare the start and the end of your energy balance.',
    unitsWord: 'units',
    totalAria: lamp => `Energy at the end with ${lamp}, in units`,
    qVerdict: n => `So my hypothesis ${n} is`,
    confirmed: 'confirmed',
    rejected: 'rejected',
    checkConclusions: 'Check my conclusions',
    backToLab: 'Back to the lab',

    scoreLabel: 'checks passed',
    markCorrect: 'correct',
    markIncorrect: 'incorrect',
    criteria: { measures: 'Measurements', forms: 'Forms of energy', balance: 'Energy balance', answers: 'Conclusions', verdicts: 'Hypotheses' },
    criteriaSub: { measures: 'Your table', forms: 'Your diagram', balance: 'Your calculation', answers: 'Your answers', verdicts: 'Your judgement' },

    report: {
      title: 'Laboratory report — The energy test bench',
      because: 'Because',
      materials: lamps => `A dynamo with a crank on a test bench, ${lamps}, an energy meter, a light meter and a thermal camera.`,
      procedure: (a, b) => [
        `Screw ${a} into the socket.`,
        'Turn the crank until the bench has received 100 units of energy: then the bench stops.',
        'Measure the energy at five points: the energy meter on the axle of the crank and on the wires, the light meter in front of the lamp, the thermal camera on the dynamo and on the lamp. Write the values in the table.',
        `Do the same with ${b}: it receives the same energy (fair test).`,
        'Draw the energy flow diagram.'
      ],
      tableCaption: 'Energy (units)',
      diagramCaption: 'Energy flow diagram',
      arrowHead: 'Arrow',
      formHead: 'Form of energy',
      light: (a, la, b, lb) => `Light given: ${la} units with ${a}, ${lb} units with ${b}.`,
      start: (arrow, v) => `Energy at the start: ${arrow}, ${v} units.`,
      endRows: list => `At the end, I counted: ${list}.`,
      end: (lamp, expr, total) => `Energy at the end with ${lamp}: ${expr} = ${total} units.`,
      verdict: (n, word) => `My hypothesis ${n} is ${word}.`,
      score: n => `Score: ${n} / 5 checks passed.`
    }
  },

  glossary: {
    crank: 'manivelle', axle: 'axe', socket: 'douille', wires: 'fils électriques',
    'energy meter': 'compteur d’énergie', 'light meter': 'luxmètre (il mesure la lumière)',
    'gets warm': 'chauffe', waste: 'gaspiller (perdre)', wastes: 'gaspille (perd)', wasted: 'gaspillée (perdue)',
    'add them up': 'additionne-les', 'test bench': 'banc d’essai', bench: 'banc d’essai', 'energy flow diagram': 'diagramme de flux d’énergie',
    'traditional bulb': 'ampoule classique (à incandescence)', 'white-hot': 'chauffé à blanc', spreads: 'se répand'
  },

  // Étape Check : pourquoi, lampe par lampe, puis le bilan.
  explanations: {
    led: 'An LED gives light without getting very hot: about a third of its energy becomes light energy.',
    halogen: 'A halogen bulb is a traditional bulb with a hotter filament, in a small glass tube filled with a special gas. It gives a little more light than a traditional bulb, but much less than an LED.',
    traditional: 'A [traditional bulb] gives light because its thin wire, the filament, is [white-hot] (about 2 500 °C). Most of its energy becomes thermal energy: only about 5 % becomes light energy.',
    europe: 'This is why traditional bulbs are no longer sold in Europe: an LED gives the same light with much less energy.',
    conservation: 'Energy is never created and never destroyed: it is only transformed. This is the conservation of energy. Your hand gives 100 units at the start; at the end, the light energy and the thermal energy of the dynamo and of the lamp add up to 100 units again.',
    dissipation: 'The thermal energy of the dynamo and of the lamp [spreads] in the air: we cannot use it any more. It is [wasted] energy: we say that it is dissipated. It is not destroyed: the air is just a little warmer.',
    camera: 'In a real lab, a thermal camera shows temperatures, not energy. Here, the bench gives the thermal energy in units, so that you can compare it with the other forms of energy.'
  },

  // v, said : ce que l'élève a écrit ou choisi (nothing s'il n'a rien) ;
  // expr : « 19 + 38 + 43 », les valeurs des énergies choisies pour la fin.
  check: {
    nothing: 'nothing',
    measuresScore: (good, total) => `${good} / ${total} values written correctly (the same as the instruments).`,
    measuresAllGood: 'All your values match the instruments. Well read!',
    measuresLegend: 'Wrong values: what you wrote → what the instrument showed.',
    measureMiss: (row, lamp, v, r) => `${row}, ${lamp}: you wrote ${v}, the instrument showed ${r}.`,
    formsAllGood: 'All the forms of energy are in the right boxes. Well done!',
    formsSummary: 'The dynamo transforms mechanical energy into electrical energy. The lamp transforms electrical energy into light energy. Both also give thermal energy to the air: the red arrows.',
    formWrong: (arrow, said) => `${arrow}: you wrote “${said}”.`,
    formEmpty: arrow => `${arrow}: empty box.`,
    formWhy: {
      crank: 'Your hand turns the [crank]: the energy that goes into the dynamo is the energy of movement, mechanical energy.',
      dynamo: 'The dynamo [gets warm]: it gives thermal energy to the air.',
      wires: 'The [wires] carry electrical energy from the dynamo to the lamp.',
      light: 'The lamp gives light to the room: light energy.',
      lamp: 'The lamp gets hot: it gives thermal energy to the air.'
    },
    startOk: 'Energy at the start: hand → dynamo, 100 units, the energy given by your hand. Correct.',
    startWrong: v => `Energy at the start: you chose ${v}. The energy at the start is the energy that your hand gives to the dynamo (hand → dynamo): the bench always receives 100 units.`,
    endNames: { dynamo: 'the thermal energy of the dynamo', light: 'the light energy', lamp: 'the thermal energy of the lamp' },
    endsOk: list => `At the end, the energy is made of ${list}. Correct.`,
    endsWires: 'The electrical energy is not there at the end: it is only on its way from the dynamo to the lamp, and the lamp transforms it into light energy and thermal energy. If you count it too, you count the same energy twice.',
    endsCrank: 'The energy given by your hand to the [axle] of the crank is the energy at the start, not at the end.',
    endsMissing: list => `You forgot ${list}. This energy is also there at the end, even if we cannot use it.`,
    totalOk: (lamp, expr, sum) => `${lamp}: ${expr} = ${sum} units. Correct calculation.`,
    totalWrong: (lamp, said, expr, sum) => `${lamp}: you wrote ${said}, but ${expr} = ${sum} units.`,
    rightBalanceTitle: 'The right balance, with the values of the instruments:',
    rightBalance: (lamp, expr) => `${lamp}: ${expr} = 100 units.`,
    answerOk: 'Correct!',
    answerWrong: 'Not quite. The correct answer:',
    verdictOk: v => `Your hypothesis and your conclusion ${v === 'confirmed' ? 'say the same thing' : 'do not say the same thing'}: it is indeed ${v}. Well judged!`,
    verdictWrong: should => `Compare your hypothesis with your conclusion: they ${should === 'confirmed' ? 'say the same thing, so your hypothesis is confirmed' : 'do not say the same thing, so your hypothesis is rejected'}.`,
    rejectedNote: 'A rejected hypothesis is not a mistake: it is how science moves on.',
    yourHyp: n => `Your hypothesis ${n}:`,
    yourConcl: n => `Your conclusion ${n}:`
  }
});
