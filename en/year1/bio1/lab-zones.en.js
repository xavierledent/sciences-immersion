/* ===== Labo virtuel « Inside two ecosystems » (bio1) : textes en anglais =====

   Simulation commune aux deux filières : js/lab-zones.js, chargée après ce
   fichier. Le néerlandais (nl/jaar1/bio1/lab-zones.nl.js) a exactement les
   mêmes clés.

   [mot] ou [mot|clé] : mot du lexique, souligné, traduction française au
   survol ou au toucher (clé dans glossary, en minuscules). Les raisons des
   verrous restent en texte simple : la bulle du cadre commun n'affiche pas de
   lexique.

   Les phrases du rapport sont assemblées ici (report.hypothesis,
   interpretation, conclusion) à partir des morceaux de phrase : chaque
   langue a son ordre des mots. */

LabEngine.addText('zones', {
  labels: {
    title: 'Inside two ecosystems',
    question: 'Do abiotic factors (temperature, light, humidity) have an influence on biotic factors (the living things)?',
    question2: 'And do living things also have an influence on each other?',
    questionCase: 'To [find out], you compare two zones only [50 m apart]: you measure their abiotic factors and you count their living things.',
    yourQuestion: 'Your question',
    zone: Z => `Zone ${Z}`,
    apart: '50 m',
    same: 'Both the same',
    // « a, b and c » ; « a and b »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0] || '',
    pair: (a, b) => `${a} and ${b}`,

    // Valeur au dixième (température), avec le séparateur décimal de la langue.
    num: v => v.toFixed(1),

    hypothesisTitle: 'Your hypothesis',
    hypGroups: { abiotic: 'Abiotic factors · I think that…', biotic: 'Biotic factors · I think that I will find…', answer: 'My answer to the question · I think that…' },
    hypRows: {
      warmer: 'the warmer zone is',
      brighter: 'the brighter zone is',
      humid: 'the more humid zone is',
      moss: 'more [mosses] and [ferns] in',
      bloom: 'more [wildflowers] and [flying insects] in',
      influence: 'abiotic factors have an influence on living things:',
      each: 'living things have an influence on each other:'
    },
    yesNo: { yes: 'Yes', no: 'No' },
    because: 'Why do you think so? (optional)',
    becausePlaceholder: 'Because…',
    hypothesisReady: 'Your hypothesis is ready.',
    hypothesisPending: 'Tap a zone on each line to complete your hypothesis.',
    toExperiment: 'Next: go into the field',
    lockHypothesis: 'Complete your hypothesis first: one choice on each line.',
    lockHypothesisFixed: 'Your hypothesis is fixed: the field work has started. A scientist does not change the hypothesis after seeing the results!',

    habitats: {
      meadow: 'Sunny [meadow]',
      edge: '[Edge of the woods]',
      shade: '[Deep shade] under the trees',
      pond: '[Edge of the pond]'
    },

    tools: { thermo: 'Thermometer', lux: 'Luxmeter', hygro: 'Hygrometer', hand: 'Feel the soil', quadrat: 'Counting square' },
    // L'instrument dans une phrase (« the … showed »).
    instruments: { temp: 'thermometer', lux: 'luxmeter', air: 'hygrometer' },
    views: { field: 'In the field', graph: 'Histogram' },
    sheetTitle: 'Field data sheet',
    abioticHead: 'Abiotic factors',
    factors: { temp: 'Temperature', lux: 'Light intensity', air: 'Air humidity', soil: 'Soil humidity', species: 'Number of species' },
    units: { temp: '(°C)', lux: '(lux)', air: '(%)', soil: 'dry, moist or wet', species: 'from your count sheet' },
    soilWords: { dry: 'dry', moist: 'moist', wet: 'wet' },
    choose: 'Choose…',
    countTitle: 'Biotic factors: count sheet',
    countSub: 'individuals of each species',
    notFound: 'Nothing found yet',
    nSpecies: n => n === 1 ? '1 species' : `${n} species`,
    countLabel: (name, Z) => `Number of individuals: ${name}, zone ${Z}`,
    cellLabel: (Z, factor) => `Zone ${Z}, ${factor}`,
    infoField: (v, q, i) => `${v} / 8 measurements written · ${q} / 2 counting squares done · ${i} / 2 interactions`,
    toGraph: 'Next: build your histogram',
    toConclude: 'Next: conclude',
    backToZones: 'Back to the zones',
    quadratHead: Z => `Zone ${Z} · the [counting square] (1 m × 1 m) seen from above`,
    tapToOpen: 'Tap to open',
    unknown: 'a living thing',
    idEmpty: 'Tap a [living thing] in the [counting square] to find out what it is.',
    idWhat: 'What is it?',
    idWrong: wrong => `Not a ${wrong}. Read the descriptions again and compare with what you see!`,
    idCount: 'All the individuals of this species are [circled]. Count them, then write the number in your count sheet.',
    idNoted: n => `In your count sheet: ${n}`,

    // La loupe et la fiche des interactions (dans le carré)
    tasksTitle: 'In each counting square:',
    tasks: ['Identify every species and count it.', 'Note two interactions between living things (in both squares together).'],
    interHere: 'Look! One of them [interacts] with another living thing.',
    lookCloser: 'Look closer',
    openClue: pair => `Interaction: ${pair}`,
    noteInter: 'Note this interaction',
    interSheet: 'My interactions',
    interCount: (n, max) => `${n} / ${max}`,
    toComplete: 'to complete',
    emptySlot: 'Identify the living things to find an interaction.',
    removeInter: 'Remove this interaction',
    removeTitle: 'Remove this interaction?',
    removeText: pair => `${pair}: your answers for this interaction will be lost. Then you can note another one.`,
    removeYes: 'Remove',
    signLegend: '+ it gains · − it loses · 0 it is not affected',
    signs: { '+': '+', '-': '−', '0': '0' },
    // Le signe dans une phrase (question 2, correction).
    signWords: { '+': 'gains (+)', '-': 'loses (−)', '0': 'is not affected (0)' },
    relationLabel: 'Relation',
    relations: { predation: 'Predation', parasitism: 'Parasitism', mutualism: 'Mutualism', commensalism: 'Commensalism', competition: 'Competition' },
    relationWords: { predation: 'predation', parasitism: 'parasitism', mutualism: 'mutualism', commensalism: 'commensalism', competition: 'competition' },
    lockTwoNoted: 'You have already noted two interactions. To note this one, first remove one from your list.',

    lockCell: {
      temp: Z => `First put the thermometer in zone ${Z}.`,
      lux: Z => `First put the luxmeter in zone ${Z}.`,
      air: Z => `First put the hygrometer in zone ${Z}.`,
      soil: Z => `First feel the soil of zone ${Z} with your hand.`
    },
    lockGraph: 'Count the living things in both counting squares first.',
    missing: {
      temp: Z => `Measure the temperature of zone ${Z} and write it in your data sheet.`,
      lux: Z => `Measure the light in zone ${Z} and write it in your data sheet.`,
      air: Z => `Measure the air humidity of zone ${Z} and write it in your data sheet.`,
      soil: Z => `Feel the soil of zone ${Z} and note if it is dry, moist or wet.`,
      find: Z => `Open the counting square of zone ${Z} and find its living things.`,
      count: (name, Z) => `Count sheet, zone ${Z}: write the number for “${name}”.`,
      bars: n => `Your histogram is not finished: ${n === 1 ? '1 bar' : n + ' bars'} still to draw.`,
      inter: n => n === 0 ? 'Identify the living things in the counting squares: when an interaction lights up, look closer and note it. Note two interactions.' : 'Note one more interaction: identify the living things in the counting squares.',
      interOpen: pair => `Your interactions, ${pair}: give +, − or 0 to both living things, and choose the relation.`
    },

    caption: {
      start: 'Pick an instrument, then tap zone A or zone B (or drag the instrument onto the zone).',
      noTool: 'Pick an instrument first, then tap a zone.',
      tool: {
        thermo: 'Tap a zone to put a thermometer there.',
        lux: 'Tap a zone to measure its light with a [luxmeter].',
        hygro: 'Tap a zone to measure the humidity of its air with a [hygrometer].',
        hand: 'Tap a zone to feel its soil with your hand.',
        quadrat: 'Tap a zone to put the [counting square] on the ground.'
      },
      measured: {
        thermo: Z => `The thermometer is in zone ${Z}. Read it and write the temperature in your data sheet.`,
        lux: Z => `The [luxmeter] measures the light in zone ${Z}. Write the value in your data sheet.`,
        hygro: Z => `The [hygrometer] measures the humidity of the air in zone ${Z}. Write the value in your data sheet.`
      },
      felt: Z => `Now note in your data sheet if the soil of zone ${Z} is dry, moist or wet.`,
      quadrat: 'Tap a [living thing] to find out what it is. Then count all the [circled] ones and write the number in your count sheet. Some living things also [interact]: when one lights up, look closer.',
      identify: 'Which name is right? Look closely at the living thing.',
      wrongName: 'Not this one: read the hint and look again.',
      selected: name => `[${name.charAt(0).toUpperCase() + name.slice(1)}|${name}]: count all the [circled] ones and write the number in your count sheet.`,
      quadratOpen: Z => `Zone ${Z}: tap the [counting square] to open it again.`,
      interHere: 'Look! One of them [interacts] with another living thing. Tap “Look closer”.',
      found: 'Two living things [interact] here! Note this interaction in your sheet.',
      foundNoted: 'This interaction is in your sheet: +, − or 0 for each living thing, then the relation.',
      noted: 'Noted! Now give +, − or 0 to each living thing, and choose the relation.',
      fieldDone: 'Your data sheet and your count sheet are complete. Now build your histogram.',
      graph: 'Drag each bar up to the number in your count sheet, or tap at the right height.',
      graphDone: 'Your histogram is finished. You can go on to conclude.',
      bad: {
        temp: 'Write the temperature shown on the thermometer, in °C (for example 18.5).',
        lux: 'Write the number shown on the luxmeter, in lux (for example 12400).',
        air: 'Write the number shown on the hygrometer, in % (for example 65).',
        count: 'Write a whole number (for example 6).'
      }
    },
    feel: {
      dry: 'The soil is hard and dusty. It [crumbles] between your fingers, and your fingers stay dry.',
      moist: 'The soil is soft and cool. It [sticks] a little to your fingers, but no water comes out.',
      wet: 'The soil is [muddy]. Water comes out when you [press] it, and your fingers are wet.'
    },
    feelNote: 'Note it in your data sheet: dry, moist or wet?',

    graphTitle: 'Your histogram',
    chartTitle: 'Number of individuals of each species in zone A and zone B',
    graphHow: 'For each species, draw <b class="zn-how-A">a blue bar for zone A</b> and <b class="zn-how-B">an orange bar for zone B</b>, as high as the numbers in your count sheet.',
    yName: 'Number of individuals',
    xName: 'Species',
    scaleNote: 'Scale: 1 square = 1 individual',
    barLabel: (name, Z) => `Bar of the ${name}, zone ${Z}`,

    qFactors: 'Abiotic factors · read your data sheet.',
    qLiving: 'Biotic factors · read your histogram.',
    qAnswer: 'Answer to question 1',
    qEach: 'Answer to question 2',
    // Question 2 : l'exemple (rel, s1, s2 : listes déroulantes, ou les mots dans la correction).
    example: (rel, s1, s2) => `For example, in ${rel}, one [living thing] ${s1} and the other ${s2}.`,
    exAria: { rel: 'The relation', s1: 'The first living thing', s2: 'The other living thing' },
    rows: {
      warmer: 'Warmer',
      brighter: 'Brighter',
      humid: 'More humid',
      moss: 'More [mosses] and [ferns]',
      bloom: 'More [wildflowers] and [flying insects]',
      influence: 'Abiotic factors have an influence on living things:',
      each: 'Living things have an influence on each other:'
    },
    qVerdict: 'So my hypothesis is',
    verdicts: { confirmed: 'confirmed', partly: 'partly confirmed', rejected: 'rejected' },
    checkConclusions: 'Check my conclusions',
    backToLab: 'Back to the field',

    scoreLabel: 'checks passed',
    markCorrect: 'correct',
    markIncorrect: 'incorrect',
    criteria: { measures: 'Measurements', count: 'Counting', graph: 'Histogram', inter: 'Interactions', conclusion: 'Conclusion', verdict: 'Hypothesis' },
    criteriaSub: { measures: 'Your data sheet', count: 'Your count sheet', graph: 'Your bars', inter: 'Your signs and relations', conclusion: 'Your answers', verdict: 'Your judgement' },

    report: {
      title: 'Laboratory report — Inside two ecosystems',
      question: 'Do abiotic factors (temperature, light, humidity) have an influence on biotic factors (the living things)?',
      question2: 'Do living things also have an influence on each other?',
      questionCase: (a, b) => `To find out, I compared two zones only 50 m apart: zone A (${a}) and zone B (${b}).`,
      // Morceaux de phrase de phrase.<clé> (hypMoss et hypBloom pour les êtres vivants).
      hypothesis: (warmer, brighter, humid, moss, bloom, influence, each) =>
        `I think that ${warmer}, ${brighter} and ${humid}. I think that ${moss}, and ${bloom}. I think that ${influence}, and that ${each}.`,
      because: 'Because',
      materials: 'A thermometer, a luxmeter, a hygrometer, a counting square (1 m × 1 m), the field data sheet, a count sheet, squared paper and a ruler.',
      procedure: [
        'In each zone, measure the temperature of the air with the thermometer, the light intensity with the luxmeter and the humidity of the air with the hygrometer.',
        'Touch the soil to feel if it is dry, moist or wet.',
        'Put the counting square on the ground. Identify each species of living thing inside it, and count its individuals.',
        'Write everything in the field data sheet and in the count sheet.',
        'In the counting squares, look at what the living things do and find two interactions between them. For each one, note +, − or 0 for both living things, and name the relation.',
        'Draw a histogram of the number of individuals of each species in both zones (tool sheet FO5b).'
      ],
      zoneCol: 'Zone',
      sheetCaption: 'Field data sheet: abiotic factors',
      countCaption: 'Biotic factors: count sheet (number of individuals in the counting square)',
      species: 'Species',
      nothing: 'nothing',
      speciesMiss: (Z, n, list) => `Zone ${Z}: there were ${n} species in the counting square (${list}).`,
      barsWrong: list => `Bars at the wrong height: ${list}.`,
      barWrong: (name, Z, got, want) => `${name} zone ${Z} (${got} instead of ${want})`,
      interCaption: 'Biotic factors: my interactions',
      interCols: { what: 'What I saw', signs: 'Signs (+, −, 0)', rel: 'Relation' },
      interFound: list => `In the counting squares, I found ${list}.`,
      interItem: (rel, a, b) => `${rel} (${a} and ${b})`,
      interpretation: (warmer, brighter, humid, moss, bloom) =>
        `My results show that ${warmer}, ${brighter} and ${humid}. In the counting squares, ${moss} and ${bloom}.`,
      conclusion: (answer, each, example, verdict) => `So ${answer}, and ${each}. ${example} My hypothesis is ${verdict}.`,
      score: (n, total) => `Score: ${n} / ${total} checks passed.`
    }
  },

  glossary: {
    '50 m apart': "à 50 m l'une de l'autre", meadow: 'prairie', 'edge of the woods': 'lisière du bois',
    'deep shade': 'ombre profonde', 'edge of the pond': "bord de l'étang",
    'counting square': 'carré de comptage', luxmeter: 'luxmètre (il mesure la lumière)', hygrometer: "hygromètre (il mesure l'humidité de l'air)",
    mosses: 'mousses', ferns: 'fougères', wildflowers: 'fleurs sauvages', 'flying insects': 'insectes volants',
    'living thing': 'être vivant', 'find out': 'le découvrir', 'living things': 'êtres vivants', circled: 'entourés',
    crumbles: "s'effrite", sticks: 'colle', muddy: 'boueux', press: 'presses',
    tuft: 'touffe', toothed: 'dentelées', thorny: 'épineuses', stings: 'pique', fungus: 'champignon',
    'see-through': 'transparentes', 'sword-shaped': "en forme d'épée",
    grass: 'herbe', daisy: 'pâquerette', dandelion: 'pissenlit', buttercup: "bouton d'or", bramble: 'ronce', nettle: 'ortie',
    ivy: 'lierre', fern: 'fougère', moss: 'mousse', mushroom: 'champignon', rush: 'jonc', 'yellow iris': 'iris des marais',
    butterfly: 'papillon', bee: 'abeille', grasshopper: 'sauterelle', ant: 'fourmi', woodlouse: 'cloporte', snail: 'escargot',
    dragonfly: 'libellule', frog: 'grenouille',
    'feed on': 'se nourrissent de', 'dry out': 'se dessèchent', 'suit it': 'lui conviennent',
    interact: 'interagissent', interacts: 'interagit', 'each other': 'les uns sur les autres',
    aphids: 'pucerons', spider: 'araignée', fly: 'mouche', 'rust fungus': 'rouille (un champignon parasite)', centipede: 'mille-pattes',
    tree: 'arbre', trunk: 'tronc', roots: 'racines', sap: 'sève', web: 'toile', silk: 'soie', sticky: 'collante', claws: 'crochets',
    gains: 'gagne (y trouve un avantage)', loses: 'perd (y trouve un désavantage)', 'is not affected': "n'est pas touché"
  },

  /* Les espèces du carré. name : le nom (aussi clé du lexique) ; key : le
     trait qui la reconnaît, écrit sous chaque nom proposé ; cap : la
     description, une fois l'espèce nommée. */
  species: {
    grass: { name: 'grass', key: 'long, thin green leaves', cap: 'A [tuft] of grass: long, thin green leaves that grow in the sun.' },
    moss: { name: 'moss', key: 'a soft cushion of tiny leaves', cap: 'A soft green cushion made of tiny leaves. It has no flowers and no roots.' },
    fern: { name: 'fern', key: 'long leaves cut into many small parts', cap: 'A plant with long, finely cut leaves (fronds). It has no flowers.' },
    ivy: { name: 'ivy', key: 'dark, shiny leaves with points', cap: 'A climbing plant with dark, shiny leaves. It stays green all year.' },
    bramble: { name: 'bramble', key: 'stems with thorns and blackberries', cap: 'A plant with long [thorny] stems and blackberries.' },
    nettle: { name: 'nettle', key: 'toothed leaves, two by two', cap: 'A plant with [toothed] leaves. Careful: it [stings]!' },
    rush: { name: 'rush', key: 'thin, round, stiff stems', cap: 'A plant with thin, round, stiff stems. It grows with its feet in the water.' },
    iris: { name: 'yellow iris', key: 'long flat leaves like swords and a big yellow flower', cap: 'A tall plant with [sword-shaped] leaves and a big yellow flower. It grows near water.' },
    mushroom: { name: 'mushroom', key: 'a cap on a white stem', cap: 'A [fungus]: it is not a plant. It grows on dead leaves and dead wood.' },
    daisy: { name: 'daisy', key: 'white petals around a yellow heart', cap: 'A small white flower with a yellow heart. It opens in the sun.' },
    dandelion: { name: 'dandelion', key: 'a yellow flower made of many thin petals', cap: 'A yellow flower with [toothed] leaves. Bees love it.' },
    buttercup: { name: 'buttercup', key: 'five round, shiny yellow petals', cap: 'A small, shiny yellow flower with five round petals.' },
    butterfly: { name: 'butterfly', key: 'big, colourful wings', cap: 'An insect with big, colourful wings. It drinks the nectar of flowers.' },
    bee: { name: 'bee', key: 'yellow and black stripes', cap: 'A flying insect with yellow and black stripes. It visits flowers.' },
    dragonfly: { name: 'dragonfly', key: 'a long, thin body and four see-through wings', cap: 'A long flying insect with four [see-through] wings. It hunts near water.' },
    grasshopper: { name: 'grasshopper', key: 'long back legs to jump', cap: 'A green insect with long back legs. It jumps very far.' },
    ant: { name: 'ant', key: 'a tiny black body in three parts', cap: 'A tiny black insect. It runs fast.' },
    woodlouse: { name: 'woodlouse', key: 'a grey back made of plates', cap: 'A small grey animal with a hard back made of plates, and fourteen legs.' },
    snail: { name: 'snail', key: 'a shell on its back', cap: 'A soft animal that carries its shell on its back. It moves slowly.' },
    frog: { name: 'frog', key: 'smooth green skin and long back legs', cap: 'A green animal that lives near water. Its skin is always wet.' }
  },

  /* Les indices d'interactions vus à la loupe. names : les êtres vivants qui
     ne sont que dans un indice (on ne les compte pas). fact : ce qu'on voit
     (a, b : les noms des deux êtres vivants, dans l'ordre de la fiche) ;
     why : les signes et la relation, pour la correction. */
  clues: {
    names: { spider: 'spider', fly: 'fly', aphids: 'aphids', rust: 'rust fungus', tree: 'tree', centipede: 'centipede' },
    fact: {
      pollen: (a, b) => `A ${a} is sitting on a ${b}. The insect drinks the nectar of the flower, and yellow pollen sticks to its body. It carries this pollen to the next flower: that is how the flower makes seeds.`,
      frog: () => 'A frog shoots out its long, [sticky] tongue and catches a dragonfly. It swallows it.',
      web: () => 'A [spider] has built its [web] between the plants. A [fly] is stuck in it, wrapped in [silk]: the spider will eat it.',
      aphids: () => 'Tiny green [aphids] cover a leaf of the nettle. They push their mouth into the plant and suck its [sap]. This leaf is curled and yellow.',
      rust: () => 'Small orange spots cover the bramble leaves. They are a tiny [rust fungus] that lives inside the leaf and feeds on it. The spotted leaves turn yellow and die.',
      ivy: () => 'Ivy climbs up the [trunk] of a [tree], holding on with tiny roots. It does not take any food from the tree: up there, it simply gets more light.',
      mycorrhiza: () => 'Mushrooms grow at the foot of a [tree]. Under the ground, the white threads of the [fungus] wrap around the [roots] of the tree: the fungus gives the tree water and minerals, and the tree gives the fungus sugar.',
      fernmoss: () => 'Big ferns grow over the moss. Under the ferns, the moss gets little light: it is pale and yellow. The ferns and the moss also take water from the same soil.',
      bramblegrass: () => 'A bramble spreads over the grass. Under the bramble, the grass gets little light: it is pale and thin. Both plants take water from the same soil.',
      centipede: () => 'A [centipede] holds a woodlouse in its [claws] and eats it.'
    },
    why: {
      pollen: () => 'The insect gets food: the nectar (+). The flower gets its pollen carried to another flower, so it can make seeds (+). Both gain: this is mutualism.',
      frog: () => 'The frog gets food (+); the dragonfly is killed and eaten (−). One animal hunts and eats the other: this is predation.',
      web: () => 'The spider gets food (+); the fly is killed and eaten (−). This is predation.',
      aphids: () => 'The aphids get food from the nettle (+); the nettle loses its sap and gets weaker, but it does not die (−). One lives on the other and harms it: this is parasitism.',
      rust: () => 'The fungus gets food from the bramble (+); the bramble loses leaves and gets weaker (−). This is parasitism.',
      ivy: () => 'The ivy gets more light (+); the tree gains nothing and loses nothing (0). This is commensalism.',
      mycorrhiza: () => 'The fungus gets sugar (+); the tree gets water and minerals (+). Both gain: this is mutualism.',
      fernmoss: () => 'The ferns and the moss share the same light and the same water: each one gets less (− and −). This is competition.',
      bramblegrass: () => 'The bramble and the grass share the same light and the same water: each one gets less (− and −). This is competition.',
      centipede: () => 'The centipede gets food (+); the woodlouse is killed and eaten (−). This is predation.'
    }
  },

  /* Morceaux de phrase tirés des choix de l'élève (v : A, B, same ; yes, no),
     lisibles seuls (correction) ; le rapport les assemble (labels.report).
     hypBloom suit hypMoss dans la phrase du rapport ; hypBloomRow est la
     même idée en phrase complète. */
  phrase: {
    warmer: v => v === 'same' ? 'both zones have the same temperature' : `zone ${v} is warmer`,
    brighter: v => v === 'same' ? 'both zones get the same light' : `zone ${v} is brighter`,
    humid: v => v === 'same' ? 'both zones are as humid' : `zone ${v} is more humid`,
    moss: v => v === 'same' ? 'there are as many mosses and ferns in both zones' : `there are more mosses and ferns in zone ${v}`,
    bloom: v => v === 'same' ? 'there are as many wildflowers and flying insects in both zones' : `there are more wildflowers and flying insects in zone ${v}`,
    influence: v => v === 'yes' ? 'abiotic factors have an influence on living things' : 'abiotic factors have no influence on living things',
    each: v => v === 'yes' ? 'living things have an influence on each other' : 'living things have no influence on each other',
    hypMoss: v => v === 'same' ? 'I will find as many mosses and ferns in both zones' : `I will find more mosses and ferns in zone ${v}`,
    hypBloom: v => v === 'same' ? 'as many wildflowers and flying insects in both zones' : `more wildflowers and flying insects in zone ${v}`,
    hypBloomRow: v => v === 'same' ? 'I will find as many wildflowers and flying insects in both zones' : `I will find more wildflowers and flying insects in zone ${v}`
  },

  // Étape Check : pourquoi, pour chaque question.
  explain: {
    brighter: 'Under the trees, the leaves stop most of the sunlight: much less light reaches the ground.',
    warmer: 'Where less sunlight reaches the ground, the air and the soil warm up less: it is cooler.',
    humid: 'Where it is cool and shady, less water evaporates: the air and the soil stay humid. Near a pond, the water that evaporates makes the air very humid.',
    moss: '[Mosses] and [ferns] need a lot of water: mosses have no roots and [dry out] quickly, and ferns need water to reproduce. They live where it is humid, often in the shade.',
    bloom: '[Wildflowers] need a lot of light to grow and to flower. Bees and butterflies [feed on] their nectar, and they like warmth.',
    influence: 'Your two zones are only 50 m apart, but their abiotic factors (temperature, light, humidity) are very different, and so are their living things: each species lives where the conditions [suit it]. [Mosses] and [ferns] need humidity above all: without water, they [dry out]. So abiotic factors have an influence on biotic factors.',
    each: 'In the counting squares, you found living things that [interact]: one eats another, one lives on another and harms it, two help each other, two share the same light and water… So living things have an influence on each other: they are biotic factors.'
  },

  // said, real : valeurs déjà écrites avec leur unité (said vaut null si rien
  // n'a été noté) ; factor, instrument : en minuscules, pour la phrase.
  check: {
    measScore: (good, total) => `${good} / ${total} values written correctly.`,
    measAllGood: 'All your values match the instruments. Well read!',
    measMiss: (Z, factor, instrument, said, real) => `Zone ${Z}, ${factor}: you wrote ${said || 'nothing'}, the ${instrument} showed ${real}.`,
    measMissSoil: (Z, said, real) => `Zone ${Z}, soil: you noted “${said || 'nothing'}”, the soil was ${real}.`,
    realValues: 'What the instruments showed',
    countMissed: (Z, name, real) => `Zone ${Z}: you did not find the species “${name}” (${real} in the counting square).`,
    countWrong: (Z, name, said, real) => `Zone ${Z}, ${name}: you wrote ${said == null ? 'nothing' : said}, but there ${real === 1 ? 'was 1' : `were ${real}`} in the counting square.`,
    countAllGood: 'You found every species and counted every individual. Well done!',
    realCount: Z => `What was really in the counting square of zone ${Z}:`,
    barMiss: (name, Z, got, want) => `Bar of the ${name}, zone ${Z}: you drew ${got}, your count sheet says ${want}.`,
    barsOk: 'All your bars are as high as the numbers in your count sheet. Well drawn!',
    concScore: (good, total) => `${good} / ${total} answers correct.`,
    youSaid: 'You said:',
    right: 'The right answer:',
    // verdict : le libellé (labels.verdicts).
    verdictOk: verdict => `You judged your hypothesis “${verdict}”: that is right. Well judged!`,
    verdictWrong: verdict => `Compare your hypothesis with your answers: your hypothesis is ${verdict}.`,
    verdictRule: 'All seven parts the same as your answers: confirmed. Some of them: partly confirmed. None of them: rejected.',
    interScore: (good, total) => `${good} / ${total} interactions right (signs and relation).`,
    interOk: 'Your signs and your relations are all right. Well observed!',
    youNoted: 'You noted:',
    // rel : la relation choisie ; s1, s2 : ses deux signes, en mots.
    exWrong: (rel, s1, s2) => `In ${rel}, one living thing ${s1} and the other ${s2}.`,
    rejectedNote: 'A rejected hypothesis is not a mistake: it is how science moves on.',
    hypPart: 'Hypothesis',
    answerPart: 'Your answer'
  }
});
