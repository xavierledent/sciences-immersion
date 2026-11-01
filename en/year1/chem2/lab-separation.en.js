/* ===== Labo virtuel « The separation challenge » (chem2) : textes en anglais =====

   Simulation commune aux deux filières : js/lab-separation.js, chargée
   après ce fichier. Le néerlandais (nl/jaar1/chem2/lab-separation.nl.js) a
   exactement les mêmes clés.

   Chaque mot du lexique (glossary) est souligné partout où il apparaît,
   sauf dans les boutons (lab-engine.js) ; [mot] ou [mot|clé] reste utile
   pour une forme dont la clé diffère.

   Mots du cours (Part 3, Mission 7) : manual
   separation, magnetic separation, sifting, filtration, decantation,
   evaporation ; distillation (Extra) ; separation log, component, phase,
   homogeneous / heterogeneous mixture, solute, solvent, solution. */

(function () {
// Majuscule, minuscule en tête de phrase.
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const lc = s => s.charAt(0).toLowerCase() + s.slice(1);

LabEngine.addText('separation', {
  labels: {
    title: 'The separation challenge',

    // « a, b and c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0] || '',
    temp: v => `${v} °C`,

    yourQuestion: 'Your question',
    question: 'How can we separate all the components of this mixture, and in which order?',
    subQuestion: the => `You cannot see ${the}. Is it still in the water?`,
    labelTitle: 'Label on the jar',

    // Étape 1 : observer (partie A du journal) et planifier (partie B)
    observeTitle: 'A. Observe the mixture',
    phasesQ: 'How many phases can you see?',
    typeQ: 'It is a…',
    types: { homogeneous: 'Homogeneous mixture', heterogeneous: 'Heterogeneous mixture' },
    statesQ: 'What do you see of each component?',
    stateWords: { solid: 'Solid', liquid: 'Liquid', hidden: 'Not visible' },
    planTitle: 'B. Plan your separation (your hypothesis)',
    planSlot: i => (i === 0 ? 'First:' : 'Then:'),
    gestures: {
      tweezers: 'Pick out pieces with tweezers',
      magnet: 'Use a magnet',
      sieve: 'Pour through a sieve',
      filter: 'Pour through a filter paper',
      decant: 'Pour off the top layer',
      heat: 'Heat on the hot plate',
      distil: 'Distil (heat, then cool the vapour)'
    },
    planSentence: (gestures, last) => `${gestures.map((g, i) => (i === 0 ? 'First, ' : 'then, ') + lc(g)).join('; ')}. At the end, ${last} is left.`,
    lastQ: 'At the end, what is left?',
    betQ: the => `What happened to ${the} in the water?`,
    bets: { gone: 'It has disappeared', still: 'It is still in the water' },
    because: 'Why do you think so? (optional)',
    becausePlaceholder: 'Because…',
    choose: '— choose —',
    lockPredict: 'Observe the mixture and complete your plan first.',
    lockPredictFixed: 'Your observation and your plan are fixed: the separation has started. A scientist does not change the hypothesis after seeing the results!',
    predictReady: 'Your plan is ready.',
    predictPending: 'Observe the mixture, then plan your separation.',
    toBench: 'Next: the bench',

    // Étape 2 : la paillasse
    deskTitle: 'Teacher’s desk',
    tools: {
      tweezers: 'Tweezers',
      magnet: 'Magnet',
      sieve: 'Sieve',
      filter: 'Funnel and filter paper',
      decant: 'Empty beaker',
      heat: 'Hot plate',
      distil: 'Distillation set-up'
    },
    goggles: 'Put on safety goggles',
    gogglesOn: 'Goggles on',
    lockGoggles: 'Put on your safety goggles first: it gets very hot.',
    lockSeparated: 'All the components are already separated.',
    captionHold: name => `You are holding: ${lc(name)}. Now tap the container you want to use it on.`,
    captionGoggles: 'Your safety goggles are on: you can use the hot plate now.',
    jarName: 'Jar',
    containerName: n => `Container ${n}`,
    airName: 'In the air',
    newSample: 'New sample',
    newSampleTitle: 'Take a new sample?',
    newSampleText: 'Your containers are emptied, and you start again with a full jar of the same mixture. Your separation log starts again too.',
    newSampleYes: 'Yes, new sample',
    askTarget: 'Which pieces do you pick out?',
    logTitle: 'Separation log',
    logEmpty: 'After each separation, a new line appears here. Fill it in: what you remove, the tool, and what is left.',
    separationN: n => `Separation ${n}`,
    removedQ: 'We remove',
    toolQ: 'Tool',
    leftQ: 'What is left?',
    runInfo: (rows, steps, sample) => `${rows} / ${steps} separations` + (sample > 1 ? ` · sample ${sample}` : ''),
    lockRun: (done, missing) => (!done
      ? 'Separate all the components first: each container must hold only one component.'
      : `Complete your separation log first: ${missing} ${missing === 1 ? 'line is' : 'lines are'} not complete.`),
    toConclude: 'Next: conclude',

    // Étape 3 : conclusion
    colRemoved: 'We remove',
    colTool: 'Tool',
    colLeft: 'What is left',
    techTitle: 'Name the technique of each separation, and say why it works. The techniques sheet can help you.',
    colTechnique: 'Technique',
    colWhy: 'Why does it work?',
    techniques: {
      manual: 'Manual separation',
      magnetic: 'Magnetic separation',
      sifting: 'Sifting',
      filtration: 'Filtration',
      decantation: 'Decantation',
      evaporation: 'Evaporation',
      distillation: 'Distillation'
    },
    whys: {
      big: 'The pieces are big: we can take them one by one.',
      magnetic: 'A magnet attracts iron.',
      size: 'The pieces have different sizes.',
      solid: 'The paper stops the solid pieces; the liquid goes through.',
      floats: 'The light liquid floats on top.',
      boils: 'The liquid becomes a gas; the solid stays.',
      bp: 'One liquid boils at a lower temperature.'
    },
    notebookBtn: 'Techniques sheet',
    stillAnswers: { yes: 'Yes, it is still in the water', no: 'No, it has disappeared' },
    soluteLine: (solute, solvent) => `The solute is ${solute} and the solvent is ${solvent}.`,
    soluteAria: 'Solute',
    solventAria: 'Solvent',
    planQ: 'Compare with your plan. Did your plan work?',
    worked: { yes: 'My plan worked', no: 'My plan did not work' },
    reasonQ: 'Why not?',
    reasons: {
      order: 'The order of the steps was wrong.',
      tool: 'A tool could not separate the components.',
      last: 'Another component was left at the end.'
    },
    backToLab: 'Back to the bench',
    checkConclusions: 'Check my conclusions',

    // Étape 4 : correction
    scoreLabel: 'checks passed',
    markCorrect: 'correct',
    markIncorrect: 'incorrect',
    criteria: { observe: 'Observation', separate: 'Separation', log: 'Separation log', techniques: 'Techniques', conclusion: 'Conclusion' },
    criteriaSub: { observe: 'Phases, type, components', separate: 'The right tool each time', log: 'Removed, tool, left', techniques: 'Name and why', conclusion: 'Your answers and your plan' },
    yours: 'You',
    expected: 'Expected',
    phasesShort: 'Phases',
    typeShort: 'Type of mixture',
    sampleN: n => `Sample ${n}`,

    report: {
      title: 'Laboratory report — Separating a mixture',
      bet: (the, bet) => `About ${the}: ${lc(bet)}.`,
      because: 'Because',
      materials: (comps, tools) => `A jar with a mixture of ${comps}. On the teacher’s desk: ${tools}.`,
      goggles: 'safety goggles',
      newSample: 'I took a new sample of the mixture.',
      step: (tool, part, target) => `${cap(tool)} → ${part}` + (target ? ` (${target})` : ''),
      observeCaption: 'A. Observation of the mixture',
      logCaption: 'Separation log',
      rightIs: 'The right answer is',
      technique: (n, name, why) => `Separation ${n}: ${name}. Why it works: ${why}`,
      order: list => `We separated the components with: ${list}.`,
      still: (the, answer) => `Is ${the} still in the water? ${answer}.`,
      reason: x => `Why: ${x}`,
      plan: judged => `${judged}.`,
      score: n => `Score: ${n} / 5 checks passed.`
    }
  },

  glossary: {
    mixture: 'le mélange', component: 'le constituant', components: 'les constituants',
    jar: 'le pot', label: 'l’étiquette', container: 'le récipient', 'teacher’s desk': 'le bureau du professeur',
    sand: 'le sable', 'iron filings': 'la limaille de fer', salt: 'le sel', sugar: 'le sucre', flour: 'la farine',
    pebbles: 'les cailloux', nails: 'les clous', 'paper clips': 'les trombones', marbles: 'les billes', oil: 'l’huile',
    tweezers: 'la pince à épiler', magnet: 'l’aimant', sieve: 'le tamis', funnel: 'l’entonnoir',
    'filter paper': 'le papier filtre', beaker: 'le bécher', 'hot plate': 'la plaque chauffante', dish: 'la coupelle',
    'safety goggles': 'les lunettes de protection', goggles: 'les lunettes', flask: 'le ballon', condenser: 'le réfrigérant',
    'separation log': 'le journal de séparation', 'what is left': 'ce qui reste',
    dissolved: 'dissous', floats: 'flotte', 'top layer': 'la couche du dessus', layer: 'la couche',
    'pour off': 'verser', pour: 'verser', boils: 'bout', 'boils away': 's’évapore en bouillant', clear: 'limpide', cloudy: 'trouble',
    holes: 'les trous', 'pick out': 'retirer', 'one by one': 'un par un', attracts: 'attire', 'sticks to': 'colle à',
    heat: 'chauffer', heated: 'chauffé', empty: 'vide', still: 'toujours', 'drips into': 'goutte dans'
  },

  // Les constituants : name (étiquette, listes), the (dans une phrase),
  // look (ce qu'on voit, sans dire ce que c'est : c'est à l'élève de le dire).
  comps: {
    sand: { name: 'Sand', the: 'the sand', look: 'the beige grains' },
    ironFilings: { name: 'Iron filings', the: 'the iron filings', look: 'the dark grey powder' },
    salt: { name: 'Salt', the: 'the salt', look: 'the white crystals' },
    sugar: { name: 'Sugar', the: 'the sugar', look: 'the white crystals' },
    flour: { name: 'Flour', the: 'the flour', look: 'the fine white powder' },
    rice: { name: 'Rice', the: 'the rice', look: 'the long white grains' },
    lentils: { name: 'Lentils', the: 'the lentils', look: 'the small brown seeds' },
    pebbles: { name: 'Pebbles', the: 'the pebbles', look: 'the grey pebbles' },
    nails: { name: 'Iron nails', the: 'the iron nails', look: 'the small nails' },
    paperClips: { name: 'Paper clips', the: 'the paper clips', look: 'the paper clips' },
    marbles: { name: 'Glass marbles', the: 'the glass marbles', look: 'the coloured glass balls' },
    water: { name: 'Water', the: 'the water', look: 'a clear liquid' },
    alcohol: { name: 'Alcohol', the: 'the alcohol', look: 'a clear liquid' },
    oil: { name: 'Oil', the: 'the oil', look: 'a yellow liquid' }
  },

  // Ce qu'on voit pendant et après chaque geste : décrit, jamais interprété.
  captions: {
    start: 'Take a [tool] from the teacher’s desk (tap it), then tap the jar.',
    goOn: 'Take another tool and use it on a container.',
    allDone: 'Each container now holds only one component. Complete your separation log.',
    deadEnd: 'With these tools, the components still together cannot be separated any more. Take a new sample.',
    newSample: 'Here is a new sample of the same mixture. Use your tools again.',
    notStarted: 'Your jar is still full: you do not need a new sample yet.',
    crystals: 'the white crystals',
    working: {
      tweezers: 'You pick out pieces with the tweezers…',
      magnet: 'You move the magnet slowly through the mixture…',
      sieve: 'You pour the mixture through the sieve…',
      filter: 'You pour the mixture into the funnel, through the filter paper…',
      decant: 'You let the mixture rest, then you pour slowly…',
      heat: 'The hot plate heats the dish…',
      distil: 'The mixture is heated in the flask; the condenser stays cold…'
    },
    result: {
      single: 'This container holds only one component: there is nothing to separate.',
      magnetNone: 'Nothing sticks to the magnet.',
      magnet: x => `The magnet attracts ${x}. You put this part in a new dish.`,
      tweezersNone: 'There are no solid pieces to pick out.',
      tweezersSmall: x => `You try to pick out ${x}, but the pieces are too small to take one by one.`,
      tweezers: x => `You pick out ${x} one by one and put them in a new dish.`,
      sieveAll: 'Everything goes through the holes of the sieve.',
      sieveNone: 'Nothing goes through the holes: everything stays in the sieve.',
      sieve: (kept, passed) => `In the sieve: ${kept}. Through the holes: ${passed}.`,
      filterDry: 'There is no liquid: the dry mixture just stays in the filter paper.',
      filterNothing: 'All the liquid goes through the paper. Nothing stays on the filter paper.',
      filter: (kept, passed) => `On the filter paper: ${kept}. In the container below: ${passed}.`,
      decantDry: 'There is no liquid to pour off.',
      decantOne: 'There is only one liquid layer: nothing floats on top.',
      decantCloudy: 'Nothing floats on top. The liquid comes out cloudy, with grains in it: you pour it back.',
      decant: x => `On top: ${x}. You pour this layer slowly into the empty beaker.`,
      heatNothing: 'You heat for a long time, but nothing boils away.',
      heatLost: 'All the liquid boils and goes into the air. The dish is empty: these components are lost.',
      heat: kept => `The liquid boils and becomes a gas: it goes into the air. In the dish: ${kept}.`,
      distilNothing: 'Nothing boils in the flask.',
      distil: (temp, kept) => `At ${temp}, a liquid starts to boil. Its vapour cools in the condenser and drips into a new flask. Left in the heated flask: ${kept}.`
    }
  },

  // La correction : ce que l'élève a fait, ce qui était attendu, pourquoi.
  check: {
    phasesWhy: (looks, n) => `In the jar, you can see ${n} different parts: ${looks}. Each visible part is a phase. With two or more phases, it is a heterogeneous mixture.`,
    hiddenWhy: the => `${cap(the)} is dissolved in the water: you cannot see it any more, but it is still there. The water and ${the} form a solution, with only one phase.`,
    tryOk: names => `It works. Removed: ${names}.`,
    tryWrong: {
      single: 'Only one component in this container: nothing to separate.',
      magnetNone: 'Nothing here is attracted by a magnet.',
      tweezersNone: 'No solid pieces to pick out.',
      tweezersSmall: 'The pieces are too small to pick out one by one.',
      sieveAll: 'Everything goes through the holes: all the pieces are small.',
      sieveNone: 'Nothing goes through the sieve.',
      filterDry: 'A filter paper separates a solid from a liquid: here, there is no liquid.',
      filterNothing: 'Nothing stays on the paper: a dissolved solid goes through with the liquid.',
      decantDry: 'No liquid to pour off.',
      decantOne: 'Only one liquid layer: nothing floats on top.',
      decantCloudy: 'Nothing floats on top: the liquid comes out cloudy, with grains.',
      heatNothing: 'Nothing boils away on the hot plate.',
      heatLost: 'All the liquids boiled away together: they are lost.',
      distilNothing: 'Nothing boils in the flask.'
    },
    separateOk: 'All the components are separated, with the right tool each time.',
    separateKo: (failed, again) => `All the components are separated, but ${failed} ${failed === 1 ? 'try did' : 'tries did'} not work` +
      (again ? `, and you took ${again} new ${again === 1 ? 'sample' : 'samples'}` : '') + '.',
    oneWay: 'One order that works:',
    noLog: 'Your separation log is empty.',
    logHint: 'What we remove is what the tool takes out: what sticks to the magnet, what stays in the sieve or on the filter paper, the top layer, or the liquid that boils away. What is left stays in the container.',
    answerOk: 'Correct.',
    answerWrong: 'Not quite.',
    stillRight: the => `${cap(the)} is still in the water: it is dissolved. The solute is ${the} and the solvent is the water.`,
    stillWhy: the => `When the water boils away, white crystals stay in the dish: it is ${the}. ${cap(the)} did not disappear: it was dissolved in tiny pieces, too small to see.`,
    bet: (bet, right) => `Your hypothesis: “${bet}” — ${right ? 'confirmed' : 'rejected'}.`,
    yourPlan: 'Your plan',
    planWorks: 'This plan works: each step separates something, and the right component is left at the end.',
    planFails: {
      order: 'This plan does not work in this order: with the same tools in another order, it works.',
      tool: 'This plan does not work: one of the tools cannot separate these components.',
      last: 'The steps work, but another component is left at the end.'
    },
    judgedOk: 'You judged your plan correctly.',
    judgedKo: (worked, reason) => `Your judgement is not right. Expected: “${worked}”` + (reason ? `, because “${reason}”` : '') + '.'
  },

  // La fiche des techniques (cours, Mission 7 ; la distillation : Extra).
  notebook: {
    intro: 'Now you know how to separate mixtures. Scientists give a name to each technique.',
    items: {
      manual: 'we pick up the big pieces with our hands, with tweezers or with a spoon.',
      magnetic: 'a magnet attracts iron.',
      sifting: 'a sieve has holes. Small pieces go through. Big pieces stay.',
      filtration: 'a filter paper stops the solid pieces. The liquid goes through.',
      decantation: 'the light liquid floats. We pour the top layer.',
      evaporation: 'we heat the mixture. The liquid becomes a gas. The solid stays.',
      distillation: 'we heat a mixture of liquids. The liquid with the lowest boiling point becomes a gas first. In the condenser, it becomes a liquid again and falls into another flask.'
    }
  }
});
})();
