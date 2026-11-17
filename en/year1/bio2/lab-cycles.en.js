/* ===== Labo virtuel « Cycle detectives » (bio2) : textes en anglais =====

   Simulation commune aux deux filières : js/lab-cycles.js, chargée après
   ce fichier. Le néerlandais (nl/jaar1/bio2/lab-cycles.nl.js) a exactement
   les mêmes clés, sauf le lexique (glossary).

   Les mots du lexique sont soulignés d'office partout où ils apparaissent
   (traduction française au survol ou au toucher) ; [mot|clé] seulement pour
   une forme dont la clé diffère.

   Mots du cours (chapitre bio2, PART 3, exercices de la page Practice) :
   menstruation (a period), menstrual cycle, ovulation, « about 14 days
   before the end of the cycle », temperature rises after ovulation, egg
   cell, sperm cells (live up to 5 days). Une longueur de cycle se compte
   du premier jour d'une règle au premier jour de la suivante.

   Les prénoms (names) sont tirés au sort : même nombre dans les deux
   langues (la sauvegarde garde leur rang). */

LabEngine.addText('cycles', {
  labels: {
    title: 'Cycle detectives',

    // Page d'accueil (Mission) : toujours la même, rien du tirage ; des gestes, jamais des résultats.
    briefTitle: 'Mission: three diaries, four claims to test',
    briefTask: 'Three young women noted their periods in a diary for four months, and took their temperature every morning. You often hear: “A cycle lasts 28 days, ovulation is on day 14.” Do their diaries say the same?',
    briefSteps: [
      '<strong>Sort</strong> four claims: true or false?',
      '<strong>Find</strong> the first day of each period, <strong>calculate</strong> the cycles, <strong>draw</strong> the graph and <strong>read</strong> the temperature.',
      '<strong>Sort</strong> the claims again, with a proof.'
    ],
    // Sous chaque phrase courte : le comment, en une phrase (jamais le résultat).
    briefDetails: [
      'Put each card in a column. You can say why.',
      'Tap the days on the calendar: they go into your notebook. Then the bars, then the curves.',
      'Choose each proof in your notebook.'
    ],
    tools: { claims: 'four claims', calendar: 'calendar', graph: 'graph', thermometer: 'temperature' },

    yourQuestion: 'Your question',
    bigQuestion: 'Does every woman have a 28-day cycle, with ovulation on day 14?',
    contextTitle: 'What you will have',
    context: 'The period diaries of three young women: four months of calendar, and the morning temperature of their last cycle.',

    // Les quatre affirmations (cartes de Predict, puis Conclude).
    claims: {
      every28: 'Every menstrual cycle lasts 28 days.',
      sameLength: 'The cycles of one woman always have the same length.',
      day14: 'Ovulation is always on day 14 of the cycle.',
      before14: 'Ovulation comes about 14 days before the end of the cycle.'
    },
    // Rappel court (résultats de Conclude, rapport).
    claimsShort: {
      every28: 'Every cycle: 28 days',
      sameLength: 'One woman: always the same length',
      day14: 'Ovulation: always day 14',
      before14: 'Ovulation: about 14 days before the end'
    },

    hypothesisTitle: 'Your hypothesis',
    sortHow: 'Put each card in a column: tap it, then tap the column (or slide it).',
    columns: { true: 'I think it is true', false: 'I think it is false' },
    dropHere: 'Put cards here.',
    pileEmpty: 'All the cards are sorted.',
    because: 'Why do you think so? (optional)',
    becausePlaceholder: 'Because…',
    hypothesisReady: 'Your hypothesis is ready.',
    hypothesisPending: 'Put the four cards in the columns.',
    toBench: 'Next: the diaries',

    lockHypothesis: 'First put the four cards in the columns.',
    lockHypothesisFixed: 'Your hypothesis is fixed: the investigation has started. A scientist does not change the hypothesis after seeing the results!',
    lockNotStarted: 'Carry out the investigation first.',
    lockRun: 'Finish the investigation first.',

    // Étape 2 : les trois parties.
    views: { 1: '1 · Calendars', 2: '2 · Graph', 3: '3 · Temperature' },
    partInfo: {
      1: 'For each woman: the first day of each period, then the length of each cycle.',
      2: 'One bar for each cycle.',
      3: 'For each woman: the day of ovulation in her last cycle.'
    },
    names: ['Lina', 'Noor', 'Amira', 'Lotte', 'Ines', 'Julie', 'Yasmine', 'Hanna', 'Elif', 'Fien'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    weekdays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    date: (d, month) => `${d} ${month}`,
    monthDays: n => `${n} days`,
    dayAria: (d, month, period) => `${d} ${month}${period ? ', period' : ''}`,
    womanLine: (name, age) => `${name}’s diary · ${age} years old.`,
    firstYearNote: 'Her first period was last year.',
    keyPeriod: 'period',
    keyMark: 'first day you marked',

    // À droite : l'aide de chaque partie.
    help: {
      1: {
        title: 'How to count',
        lines: [
          'A cycle starts on the first day of a period. It ends the day before the next period.',
          'Cycle length = the number of days from one first day to the next first day.'
        ],
        example: 'Example: from 25 March to 22 April: 31 − 25 + 22 = <strong>28 days</strong> (March has 31 days).'
      },
      2: {
        title: 'Your graph',
        lines: [
          'One bar for each cycle, in the order of your notebook.',
          'Slide each bar up to the length in your notebook, or tap at the right height.'
        ],
        example: ''
      },
      3: {
        title: 'Read the curve',
        lines: [
          'The temperature was taken every morning, before getting up.',
          'After ovulation, the temperature goes up and stays high. Tap the day of ovulation: the last low day before the rise.',
          'Then count the days from ovulation to the end of the cycle.'
        ],
        example: ''
      }
    },

    // Graphique (fiche outil FO5b).
    chart: {
      title: 'Length of each cycle',
      yName: 'Cycle length (days)',
      xName: 'Cycle',
      ref: '28 days',
      barAria: (name, k) => `${name}, cycle ${k}`,
      selected: (name, k) => `Chosen bar: ${name}, cycle ${k}.`,
      noneSelected: 'Tap a bar to choose it.',
      minus: 'One day less',
      plus: 'One day more'
    },
    // Courbe de température (donnée).
    curve: {
      title: name => `${name}: morning temperature during her last cycle`,
      yName: 'Temperature (°C)',
      xName: 'Day of the cycle',
      end: n => `Last day of the cycle: day ${n}`,
      chosen: d => `day ${d}`
    },
    num: v => v.toFixed(1),

    notesTitle: 'Your notebook',
    notes: {
      woman: 'Diary',
      firstDays: 'First day of each period',
      lengths: 'Cycle length (days)',
      temp: 'Last cycle: temperature',
      period: k => `${k}`,
      cycle: k => `Cycle ${k}`,
      ov: 'Ovulation',
      toEnd: 'Days to the end',
      lenAria: (name, k) => `${name}, length of cycle ${k}`,
      toEndAria: name => `${name}, days from ovulation to the end of the cycle`
    },

    // La légende : la prochaine chose à faire (voir phase dans la simulation).
    captions: {
      view: v => `Open the part “${v}” (tabs at the top).`,
      switch: name => `Now open ${name}’s diary (tabs at the top).`,
      mark: (name, n) => (n === 0
        ? `${name}’s calendar: tap the first day of each period. It goes into your notebook.`
        : `${name}’s calendar: tap the first day of each period (${n} of 4 done). Tap a day again to remove it.`),
      length: (name, k) => `Calculate the length of ${name}’s cycle ${k}: from one first day to the next. Write it in your notebook.`,
      ov: name => `${name}’s curve: tap the day of ovulation.`,
      toEnd: (name, n) => `How many days from ovulation to the end of the cycle (day ${n})? Write it in your notebook.`,
      graph: 'Draw one bar for each cycle: slide it up to the length in your notebook.',
      next: {
        graph: 'Part 1 is finished. Go on with the button at the bottom.',
        temp: 'Your graph is finished. Go on with the button at the bottom.',
        conclude: 'The investigation is over. Look at your notebook and your graph, then go on to conclude.'
      }
    },
    captionFourMarks: 'You already marked 4 first days. Tap one of them again to remove it.',
    captionBadNumber: (min, max) => `Write a whole number from ${min} to ${max}.`,
    captionPickBar: 'First tap a bar to choose it.',

    lockLengths: name => `First mark the 4 first days of ${name}’s periods on her calendar.`,
    lockTempLater: 'In part 3, you will read the temperature curves.',
    lockToEnd: name => `First tap the day of ovulation on ${name}’s curve.`,
    lockView: {
      2: 'First finish part 1, then use the button at the bottom.',
      3: 'First finish your graph, then use the button at the bottom.'
    },
    // Ce qui manque encore (bouton du pied touché trop tôt).
    missing: {
      view: v => `Open the part “${v}”.`,
      switch: name => `Open ${name}’s diary.`,
      mark: name => `Mark the 4 first days of ${name}’s periods.`,
      length: name => `Write the lengths of ${name}’s cycles.`,
      ov: name => `Tap the day of ovulation on ${name}’s curve.`,
      toEnd: name => `Write the days from ovulation to the end of ${name}’s cycle.`,
      graph: 'Draw all the bars of your graph.',
      next: label => `Press “${label}” at the bottom.`
    },
    next: {
      graph: 'Next: draw the graph',
      temp: 'Next: read the temperature',
      conclude: 'Next: conclude'
    },

    // Listes : « 28, 28 and 29 ».
    list: items => (items.length < 2 ? (items[0] || '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`),
    // Preuves proposées à Conclude (nombres notés par l'élève).
    proofLen: (name, lens) => `${name}: cycles of ${lens} days`,
    proofOv: (name, day, end) => `${name}: ovulation on day ${day}, then ${end} days to the end`,
    proofLabel: 'Proof:',
    proofAria: 'Proof from your results',
    choose: 'choose',

    backToLab: 'Back to the lab',
    checkConclusions: 'Check my conclusions',
    resultsTitle: 'Your results',
    concludeHow: 'For each claim: true or false? Then choose the result that proves it.',
    trueFalse: { true: 'true', false: 'false' },
    verdictText: 'My hypothesis is',
    verdicts: { confirmed: 'confirmed', partly: 'partly confirmed', rejected: 'rejected' },

    scoreLabel: 'checks passed',
    markCorrect: 'correct',
    markIncorrect: 'incorrect',
    criteria: { days: 'First days', lengths: 'Cycle lengths', graph: 'The graph', ovulation: 'Ovulation', claims: 'The claims' },
    criteriaSub: {
      days: 'The 12 days you marked',
      lengths: 'Your 9 calculations',
      graph: 'Your 9 bars',
      ovulation: 'The temperature curves',
      claims: 'True or false, and the proofs'
    },

    report: {
      title: 'Laboratory report — Cycle detectives: do all cycles last 28 days?',
      because: 'Because',
      iThink: word => `I think it is ${word}.`,
      materials: 'The period diaries of three young women over four months (calendars), the curve of their morning temperature during their last cycle, a graph sheet.',
      steps: [
        'On each calendar, find the first day of each period.',
        'Calculate the length of each cycle: from one first day to the next.',
        'Draw a bar graph of the cycle lengths.',
        'On each temperature curve, find the day of ovulation (the last low day before the rise). Count the days from ovulation to the end of the cycle.',
        'Sort the four claims again, with a proof from the results.'
      ],
      tableTitle: months => `My notebook (${months}):`,
      graphMark: 'My graph',
      verdict: word => `My hypothesis is ${word}.`,
      score: (n, total) => `Score: ${n} / ${total} checks passed.`
    }
  },

  glossary: {
    period: 'règles', periods: 'règles', 'menstrual cycle': 'cycle menstruel',
    'first day': 'premier jour', 'first days': 'premiers jours', length: 'durée', lengths: 'durées',
    lasts: 'dure', diary: 'journal (carnet)', diaries: 'journaux (carnets)', 'young women': 'jeunes femmes',
    claim: 'affirmation', claims: 'affirmations', proof: 'preuve', proves: 'prouve',
    sort: 'trier (classer)', 'every morning': 'chaque matin', 'getting up': 'se lever',
    rise: 'montée', 'goes up': 'monte', 'stays high': 'reste élevée', low: 'bas (basse)',
    'end of the cycle': 'fin du cycle', about: 'environ', always: 'toujours',
    bar: 'barre (colonne)', bars: 'barres (colonnes)', slide: 'faire glisser',
    'egg cell': 'ovocyte', 'sperm cells': 'spermatozoïdes', 'safe day': 'jour sans risque',
    average: 'moyenne', regular: 'régulier', counting: 'compter', 'count': 'compter'
  },

  // Étape Check : ce que montrent les données.
  explanations: {
    ovulation: 'After ovulation, the temperature goes up by about 0.5 °C and stays high until the end of the cycle. So ovulation is the last low day before the rise. In a longer cycle, it comes later.',
    claims: {
      every28: '28 days is only an average. Cycles can be shorter or longer, and that is normal.',
      sameLength: 'Some women have very regular cycles, others do not. In the first years after the first period, cycles are often irregular: that is normal.',
      day14: 'Ovulation is on day 14 only in a 28-day cycle. In a 35-day cycle, it is around day 21.',
      before14: 'Ovulation comes about 14 days before the end of the cycle. The days before ovulation are the ones that change.'
    },
    safeDays: 'So you can only know the day of ovulation afterwards, when the next period comes. And sperm cells can live up to 5 days. There is no safe day: counting the days is not a way to avoid a pregnancy.'
  },

  check: {
    noExperiment: 'You did not carry out the investigation: there are no notes.',
    daysScore: (good, total) => `${good} / ${total} first days are right.`,
    tableKey: 'A red box is a mistake: your answer, and below it, the right one.',
    daysAllGood: 'All your first days are right. Great work!',
    daysHow: 'The first day of a period is the first red day after days without red.',
    lengthsScore: (good, total) => `${good} / ${total} calculations are right.`,
    lengthsAllGood: 'All your calculations are right. Great work!',
    lengthsHow: 'Count from one first day to the next first day: the days left in the first month, then the days of the next month.',
    // Le calcul d'une longueur : même mois (monthDays null), ou avec les mois traversés.
    calc: (name, k, from, to, monthDays, dFrom, mids, dTo, total) => `${name}, cycle ${k}: from ${from} to ${to}: ` +
      (monthDays == null ? `${dTo} − ${dFrom}` : [`${monthDays} − ${dFrom}`].concat(mids.map(String), String(dTo)).join(' + ')) + ` = ${total} days.`,
    barLine: (name, k, yours, right) => `${name}, cycle ${k}: your bar shows ${yours}, your notebook says ${right}.`,
    graphAllGood: 'All your bars match your notebook.',
    graphHow: 'Each bar must go up to the length of that cycle in your notebook.',
    ovLine: (name, yours, right) => `${name}: ${yours == null ? 'no day tapped' : `you tapped day ${yours}`}. Ovulation: day ${right}.`,
    endLine: (name, yours, last, ov) => `${name}: ${last} − ${ov} = ${last - ov} days to the end of the cycle. You wrote ${yours}.`,
    youSaid: x => `(you said ${x})`,
    yourProof: x => `Your proof: ${x}`,
    goodProof: x => `A good proof: ${x}`,
    verdict: {
      confirmed: 'Your hypothesis and your conclusion say the same thing: hypothesis confirmed.',
      partly: 'Your hypothesis and your conclusion agree for some claims only: hypothesis partly confirmed.',
      rejected: 'Your hypothesis and your conclusion never agree: hypothesis rejected.'
    },
    judgedOk: 'Good judgement!',
    judgedWrong: 'Your judgement does not match your conclusion.',
    dayNote: date => `The first day of this period was ${date}.`,
    lenNote: n => `From the first days you marked: ${n} days.`,
    ovNote: n => `The temperature goes up after day ${n}: ovulation on day ${n}.`,
    endNote: n => `${n} days.`,
    graphNote: 'Each bar must go up to the length of that cycle in my notebook.',
    proofNote: x => `This result does not prove it. A good proof: ${x}`
  }
});
