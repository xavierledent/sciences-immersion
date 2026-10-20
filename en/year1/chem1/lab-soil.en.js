/* ===== Labo virtuel « Under our feet » (chem1) : textes en anglais =====

   Simulation commune aux deux filières : js/lab-soil.js, chargée après ce
   fichier. Le néerlandais (nl/jaar1/chem1/lab-soil.nl.js) a exactement les
   mêmes clés.

   [mot] ou [mot|clé] : mot du lexique, souligné, traduction française au
   survol ou au toucher (clé dans glossary, en minuscules). Les raisons des
   verrous restent en texte simple : la bulle du cadre commun n'affiche pas de
   lexique. */

LabEngine.addText('soil', {
  labels: {
    title: 'Under our feet',
    question: 'What is a [soil sample] made of, and does its composition change [depending on] the location?',
    yourQuestion: 'Your question',
    yourSamples: 'Your two samples',
    sample: S => `Sample ${S}`,

    hypothesisTitle: 'Your hypothesis',
    iThink: 'I think that',
    hypEnd: 'contains more [living things] and organic matter.',
    hypChoices: { A: 'sample A', B: 'sample B', same: 'neither: they are the same' },
    because: 'Why do you think so? (optional)',
    becausePlaceholder: 'Because…',
    hypothesisReady: 'Your hypothesis is ready.',
    hypothesisPending: 'Tap the words that complete your hypothesis.',
    toExperiment: 'Next: the experiment',
    lockHypothesis: 'Complete your hypothesis first.',
    lockHypothesisFixed: 'Your hypothesis is fixed: the experiment has started. A scientist does not change the hypothesis after seeing the results!',

    tools: { gloves: 'Gloves', spatula: 'Spatula', magnifier: 'Magnifying glass', touch: 'Wet or dry?' },
    hypReminder: h => h === 'same'
      ? '<b>Your hypothesis:</b> both samples contain about the same amount of [living things] and organic matter.'
      : `<b>Your hypothesis:</b> sample ${h} contains more [living things] and organic matter.`,
    status: { spread: 'Spread out', lens: 'Looked at with the magnifying glass', touch: 'Tested: wet or dry' },
    cats: { living: 'Living things', organic: 'Organic matter', mineral: 'Mineral matter', waste: 'Not part of the soil' },
    catHints: { living: 'insects, worms, roots…', organic: 'dead leaves, wood…', mineral: 'rocks, pebbles, sand…' },
    water: 'Water / humidity',
    waterHint: 'wet or dry?',
    wd: { wet: 'wet', dry: 'dry' },
    sheetTitle: 'Your observation sheet',
    sheetSub: 'fills in as you sort',
    components: 'Components',
    notSoil: list => `Not part of the soil: ${list}`,
    inspectEmpty: 'Tap something in a [tray] to [look closely] at it. Very small things only show under the [magnifying glass].',
    inBowl: (cat, S) => `In the “${cat}” [bowl] of sample ${S}. Drag it to change.`,
    sortedInfo: n => n === 0 ? 'Nothing sorted yet' : n === 1 ? '1 thing sorted' : `${n} things sorted`,
    toConclude: 'Next: conclude',
    // « a, b and c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0] || '',

    lockGloves: 'Put on your gloves first: you are going to touch real soil.',
    lockTray: 'Put on your gloves before you touch the soil.',
    lockWd: S => `Test sample ${S} first with the “Wet or dry?” tool.`,
    missing: {
      gloves: 'Put on your gloves first.',
      spread: S => `Spread sample ${S} with the spatula.`,
      lens: S => `Look at sample ${S} with the magnifying glass.`,
      sort: S => `Sort what you find in sample ${S} into its bowls.`,
      touch: S => `Test sample ${S} with the “Wet or dry?” tool.`,
      note: S => `Note on your sheet if sample ${S} is wet or dry.`
    },

    // thing : l'élément avec son article défini (items.<type>.the).
    caption: {
      start: 'Put on your [gloves] first: you are going to touch real soil.',
      gloves: 'Your [gloves] are on. Now take the [spatula] and [spread] each sample in its [tray].',
      glovesOn: 'Your [gloves] are on.',
      spatula: 'Tap a [tray] (or drag the [spatula] onto it) to [spread] its sample.',
      magnifier: 'Tap a [tray] (or drag the [magnifying glass] onto it) to look for very small things.',
      touch: 'Tap a [tray] (or drag the hand onto it) to feel if its soil is wet or dry.',
      noTool: 'Tap something in a [tray] to [look closely] at it.',
      heap: S => `This is still a [heap]. [Spread] sample ${S} with the [spatula] first.`,
      spread: S => `Sample ${S} is [spread out]. Now [look closely] with the [magnifying glass].`,
      already: S => `Sample ${S} is already [spread out].`,
      scanning: S => `The [magnifying glass] looks over sample ${S}…`,
      lensFound: S => `The [magnifying glass] found very small things in sample ${S}. They are now bigger, with a dotted circle: tap or drag them like the others.`,
      lensNothing: S => `The [magnifying glass] found nothing more in sample ${S}.`,
      tiny: 'There is something very small here. Look with the [magnifying glass].',
      empty: 'Tap something in the [tray] to [look closely] at it, or pick a tool.',
      picked: (thing, S) => `Now drag ${thing} into a [bowl] of sample ${S}, or tap the [bowl].`,
      sorted: (thing, cat, S) => `You put ${thing} in the “${cat}” [bowl] of sample ${S}.`,
      wrongSample: S => `This comes from sample ${S}. Use a [bowl] of sample ${S}.`,
      tapFirst: 'Tap something in a [tray] first, then tap a [bowl].',
      noteIt: 'Now note it on your sheet: wet or dry?',
      done: 'Everything is observed and noted. You can go on to conclude.'
    },
    touchText: {
      soil: { wet: 'The soil [sticks together] when you press it. Your glove comes out dark and cool.', dry: 'The soil breaks into dry [crumbs]. Your glove stays clean and dry.' },
      sand: { wet: 'The sand [sticks together] and keeps the print of your fingers. Your glove is wet.', dry: 'The sand [runs between your fingers] like dust. Your glove stays dry.' },
      gravel: { wet: 'The small stones are cold and shiny with water. Your glove is wet.', dry: 'The stones and the dust are dry and warm. Your glove stays dry.' }
    },

    concludeIntro: 'Use your observation sheet to answer the question.',
    qCompare: 'Which sample contains more living things and organic matter?',
    compareChoices: { A: 'Sample A', B: 'Sample B', same: 'Both the same' },
    qLocation: 'Does the composition of the soil change depending on the location?',
    locationChoices: { yes: 'Yes, it changes', no: 'No, it is the same' },
    qVerdict: 'So my hypothesis is',
    confirmed: 'confirmed',
    rejected: 'rejected',
    checkConclusions: 'Check my conclusions',
    backToLab: 'Back to the lab',

    scoreLabel: 'checks passed',
    markCorrect: 'correct',
    markIncorrect: 'incorrect',
    criteria: { sorting: 'Sorting', observation: 'Observation', conclusion: 'Conclusion', hypothesis: 'Hypothesis' },
    criteriaSub: { sorting: 'Your bowls', observation: 'Your sheet', conclusion: 'Your answers', hypothesis: 'Your judgement' },

    report: {
      title: 'Laboratory report — What is soil made of?',
      because: 'Because',
      hyp: {
        A: 'I think that sample A contains more living things and organic matter than sample B.',
        B: 'I think that sample B contains more living things and organic matter than sample A.',
        same: 'I think that samples A and B contain about the same amount of living things and organic matter.'
      },
      materials: (a, b) => `Two soil samples in trays: sample A (${a}) and sample B (${b}), gloves, a spatula, a magnifying glass, sorting bowls.`,
      procedure: [
        'Put on gloves.',
        'Spread each sample in its tray with the spatula.',
        'Look closely at each sample with the magnifying glass.',
        'Sort what you find into bowls: living things, organic matter, mineral matter, not part of the soil.',
        'Touch the soil to feel if it is wet or dry.'
      ],
      found: (S, from, counts) => `In sample ${S} (${from}), I found ${counts}.`,
      countsNone: 'nothing',
      count: (n, cat) => `${n} ${n === 1 ? { living: 'living thing', organic: 'piece of organic matter', mineral: 'piece of mineral matter' }[cat] : { living: 'living things', organic: 'pieces of organic matter', mineral: 'pieces of mineral matter' }[cat]}`,
      compare: {
        A: 'So sample A contains more living things and organic matter.',
        B: 'So sample B contains more living things and organic matter.',
        same: 'So both samples contain about the same amount of living things and organic matter.'
      },
      location: { yes: 'Its composition changes depending on the location.', no: 'Its composition does not change depending on the location.' },
      verdict: v => `My hypothesis is ${v}.`,
      score: n => `Score: ${n} / 4 checks passed.`
    }
  },

  glossary: {
    'soil sample': 'échantillon de sol', 'depending on': 'selon',
    tray: 'bac', trays: 'bacs', gloves: 'gants', 'magnifying glass': 'loupe', spatula: 'spatule',
    spread: 'étaler', 'spread out': 'étalé', heap: 'tas', bowl: 'coupelle', bowls: 'coupelles',
    'living things': 'êtres vivants', 'look closely': 'observer de près',
    'curls up': "s'enroule", grub: 'larve (ver blanc)', shoot: 'pousse', bend: 'se plient',
    crumbles: "s'effrite", bark: 'écorce', acorn: 'gland', brittle: 'cassantes', shine: 'brillent',
    'sticks together': "s'agglomère", 'runs between your fingers': 'file entre tes doigts', crumbs: 'miettes',
    earthworm: 'ver de terre', woodlouse: 'cloporte', springtail: 'collembole', twig: 'brindille',
    pebble: 'caillou', gravel: 'gravier', ridges: 'stries', crumpled: 'froissé', 'fine roots': 'fines racines',
    'sweet wrapper': 'emballage de bonbon', 'bottle cap': 'bouchon', 'beetle larva': 'larve de coléoptère',
    beetle: 'coléoptère (scarabée)', 'school forest': "bois de l'école", 'vegetable garden': 'potager',
    meadow: 'prairie', playground: 'cour de récréation', sandpit: 'bac à sable', 'gravel path': 'allée de gravier',
    'building site': 'chantier', waste: 'déchet', 'leaf litter': 'litière (feuilles mortes au sol)',
    'top soil': 'terre de surface', 'crushed rocks': 'roches broyées',
    ant: 'fourmi', 'dead leaf': 'feuille morte', 'acorn cup': 'cupule de gland', 'dry grass': 'herbe sèche',
    'piece of bark': "morceau d'écorce", 'sand grains': 'grains de sable', 'piece of rock': 'morceau de roche'
  },

  /* Ce qu'on peut trouver dans un bac. name : nom seul (fiche, coupelles,
     rapport) ; a : avec l'article indéfini, the : avec l'article défini
     (phrases, entre crochets pour le lexique) ; plural : nom au pluriel
     (« They are » plutôt que « It is »). cap : ce qu'on observe. */
  items: {
    earthworm: { name: 'earthworm', a: 'an [earthworm]', the: 'the [earthworm]', plural: false,
      cap: 'A long, soft, pink animal. It slowly [curls up] when you touch it.' },
    woodlouse: { name: 'woodlouse', a: 'a [woodlouse]', the: 'the [woodlouse]', plural: false,
      cap: 'A small grey animal with a hard back made of plates, and fourteen legs. It walks away from the light.' },
    ant: { name: 'ant', a: 'an [ant]', the: 'the [ant]', plural: false,
      cap: 'A tiny black insect with six legs. It runs fast across the [tray].' },
    larva: { name: 'beetle larva', a: 'a [beetle larva]', the: 'the [beetle larva]', plural: false,
      cap: 'A soft, white, curled [grub] with a brown head. Its little legs move slowly.' },
    springtail: { name: 'springtail', a: 'a [springtail]', the: 'the [springtail]', plural: false,
      cap: 'A tiny white animal, smaller than a grain of rice. It jumps when you breathe on it.' },
    roots: { name: 'fine roots', a: '[fine roots]', the: 'the [fine roots]', plural: true,
      cap: 'Thin white threads attached to a small green [shoot]. They are fresh and [bend] without breaking.' },
    beetleDead: { name: 'beetle', a: 'a [beetle]', the: 'the [beetle]', plural: false,
      cap: 'A black insect lying on its back. It does not move, even when you touch it. Its body is dry and very light.' },
    leaf: { name: 'dead leaf', a: 'a [dead leaf]', the: 'the [dead leaf]', plural: false,
      cap: 'A brown, dry leaf full of holes. It [crumbles] at the edges.' },
    twig: { name: 'twig', a: 'a [twig]', the: 'the [twig]', plural: false,
      cap: 'A small piece of dead wood. The [bark] comes off easily.' },
    acorn: { name: 'acorn cup', a: 'an [acorn cup]', the: 'the [acorn cup]', plural: false,
      cap: 'The empty cup of an [acorn]: brown, dry and hard.' },
    grass: { name: 'dry grass', a: '[dry grass]', the: 'the [dry grass]', plural: false,
      cap: 'Yellow, dry blades of grass. They are flat and [brittle].' },
    bark: { name: 'piece of bark', a: 'a [piece of bark]', the: 'the [piece of bark]', plural: false,
      cap: 'A piece of [bark], dark brown and dry. It breaks into flakes.' },
    pebble: { name: 'pebble', a: 'a [pebble]', the: 'the [pebble]', plural: false,
      cap: 'A small, hard, rounded stone. Pressing it changes nothing.' },
    gravel: { name: 'gravel', a: '[gravel]', the: 'the [gravel]', plural: false,
      cap: 'Grey bits of stone with sharp edges.' },
    sand: { name: 'sand grains', a: '[sand grains]', the: 'the [sand grains]', plural: true,
      cap: 'Tiny hard grains, light brown. Some of them [shine] in the light.' },
    rock: { name: 'piece of rock', a: 'a [piece of rock]', the: 'the [piece of rock]', plural: false,
      cap: 'A flat piece of rock with sharp edges. It is heavy for its size.' },
    cap: { name: 'bottle cap', a: 'a [bottle cap]', the: 'the [bottle cap]', plural: false,
      cap: 'A red, smooth, light object with [ridges] around it. It is made of plastic.' },
    wrapper: { name: 'sweet wrapper', a: 'a [sweet wrapper]', the: 'the [sweet wrapper]', plural: false,
      cap: 'A shiny, [crumpled] piece of thin plastic film.' }
  },

  // Les lieux : d'où vient l'échantillon, et pourquoi son sol est riche ou pauvre.
  places: {
    forest: { from: 'from the [school forest]',
      why: 'In a forest, dead leaves and wood fall on the ground every year, and many small animals and decomposers live in the soil: it is rich in organic matter and life.' },
    garden: { from: 'from the [vegetable garden]',
      why: 'A vegetable garden gets plant remains and compost every year, and its soil is full of worms and roots: it is rich in organic matter and life.' },
    meadow: { from: 'from the [meadow]',
      why: 'In a meadow, grass dies and grows back every year. Its roots, the dead grass and the small animals make the soil rich in organic matter and life.' },
    sandpit: { from: 'from the [playground] [sandpit]',
      why: 'The sand of a playground sandpit comes from [crushed rocks]: it is almost only mineral matter, with very little life.' },
    gravel: { from: 'from the [gravel path]',
      why: 'A gravel path is made of stones and sand put there by people: it is mostly mineral matter, with almost no life.' },
    building: { from: 'from the [building site]',
      why: 'On a building site, the [top soil] has been taken away: what is left is mostly rocks, gravel and sand.' }
  },

  // Étape Check : pourquoi un élément va dans telle coupelle.
  why: {
    living: 'It is alive: it moves, feeds or grows. It is a living thing.',
    organic: 'It comes from a living thing, but it is dead: it is organic matter.',
    mineral: 'It comes from rocks: it is mineral matter.',
    waste: 'It is made by humans and does not belong in soil: it is waste.'
  },
  trapWhy: {
    beetleDead: 'The beetle does not move, even when you touch it: it is dead. A dead animal is organic matter.',
    roots: 'These roots are fresh: they belong to a living plant. They are living things.',
    sand: 'Sand grains are tiny pieces of rock: they are mineral matter.',
    cap: 'A bottle cap is plastic, made by humans: it is waste, not part of the soil.',
    wrapper: 'A sweet wrapper is plastic, made by humans: it is waste, not part of the soil.'
  },

  // thing : l'élément avec son article défini ; things : liste déjà jointe
  // (articles indéfinis) ; one : un seul élément, au singulier.
  check: {
    sortedOk: n => n === 1 ? 'The thing you sorted is in the right bowl.' : `The ${n} things you sorted are all in the right bowls.`,
    sortedScore: (good, n) => `${good} / ${n} things in the right bowl.`,
    wrongItem: (thing, S, put, right) => `Sample ${S}: you put ${thing} in “${put}”, but the right bowl is “${right}”.`,
    missedCat: (S, cat, things, tiny, one) => `Sample ${S}: you found no ${cat.toLowerCase()}, but it contained ${things}.` +
      (tiny ? ` ${one ? 'It is' : 'They are'} very small: look with the magnifying glass.` : ''),
    foundAll: 'You found something of each kind in both samples. Careful observation!',
    humidityOk: (S, v) => `Sample ${S}: you noted “${v}”. Correct.`,
    humidityWrong: (S, v, real) => `Sample ${S}: you noted “${v}”, but the soil was ${real}.`,
    compareRight: S => `Sample ${S} contains more living things and organic matter.`,
    compareOk: 'Correct!',
    compareWrong: 'Not quite. The correct answer:',
    locationOk: 'Yes: two soils from two places do not contain the same things.',
    locationWrong: 'Look at your sheet again: the two samples do not contain the same things. The composition of the soil changes depending on the location.',
    wetPoor: S => `Careful: sample ${S} was wet, but it had almost no life. Water alone does not make a soil rich.`,
    yourHyp: 'Your hypothesis:',
    yourConcl: 'Your conclusion:',
    verdictOk: v => `Your hypothesis and your conclusion ${v === 'confirmed' ? 'say the same thing' : 'do not say the same thing'}: it is indeed ${v}. Well judged!`,
    verdictWrong: should => `Compare your hypothesis with your conclusion: they ${should === 'confirmed' ? 'say the same thing, so your hypothesis is confirmed' : 'do not say the same thing, so your hypothesis is rejected'}.`,
    rejectedNote: 'A rejected hypothesis is not a mistake: it is how science moves on.'
  },

  // Comparaison de l'hypothèse et de la conclusion, en phrases complètes.
  compareSent: {
    A: 'sample A contains more living things and organic matter.',
    B: 'sample B contains more living things and organic matter.',
    same: 'both samples contain about the same amount of living things and organic matter.'
  }
});
