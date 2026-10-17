/* ===== Labo virtuel « Sun and shade » (bio1) : pourquoi pas les mêmes êtres vivants ? =====

   Version virtuelle de la Mission 1 de la sortie de terrain (« FIELD TRIP –
   Investigating our Local Woods ») : deux zones à 50 m l'une de l'autre, où
   l'on relève la température, la lumière, l'humidité de l'air et celle du
   sol, puis où l'on compte les êtres vivants dans un carré posé au sol. Le
   cadre commun (modale, barre d'étapes, verrous, traduction, rapport imprimé)
   est dans lab-engine.js, à la racine du site, chargé avant ce fichier.
   Textes en anglais seulement pour l'instant.

   Tirés au sort à chaque nouveau labo : deux milieux parmi quatre (prairie,
   lisière du bois, ombre profonde sous les arbres, bord de l'étang ; jamais
   l'étang avec l'ombre profonde, où lumière et humidité ne vont plus dans le
   même sens), les lettres A et B, les valeurs mesurées, les espèces du carré,
   leur nombre d'individus et leur place, et deux objets non vivants (caillou,
   feuille morte, brindille, coquille vide) qu'il ne faut pas compter. La
   zone la plus riche en espèces change d'un tirage à l'autre ; mousses et
   fougères sont toujours plus nombreuses dans la zone la plus humide, fleurs
   sauvages et insectes volants dans la plus lumineuse.

   Déroulé :
     1. Predict    — quelle zone est la plus chaude, la plus lumineuse, la
                     plus humide, où trouver le plus de mousses et de fougères
                     (+ « because » libre)
     2. Experiment — sur le terrain : thermomètre, luxmètre, hygromètre (posés
                     dans une zone, valeur à recopier dans la fiche), main
                     (sol sec, humide ou mouillé), carré de comptage (vue de
                     dessus : toucher un être vivant le compte, le toucher
                     encore le décompte) ; puis l'histogramme (fiche outil
                     FO5b) : échelle, nom des axes, bâtons à monter
     3. Conclude   — les questions de la fiche de terrain : quelle zone est la
                     plus chaude…, où sont mousses et fougères, fleurs et
                     insectes volants, la plus grande biodiversité, le facteur
                     clé, la réponse à la question, l'hypothèse
     4. Check      — 5 critères : mesures, comptage, histogramme, conclusion,
                     hypothèse ; rapport (FO3) */

(function () {
  'use strict';

  const { escapeHtml, mulberry32, seedFrom, pick, shuffle, ease } = LabEngine.util;

  // Cadre commun, créé en fin de fichier (LabEngine.create).
  let lab;
  const $ = sel => lab.$(sel);
  const $$ = sel => lab.$$(sel);
  const gloss = text => lab.gloss(text);
  const plain = text => String(text).replace(/\[([^\]|]+)(?:\|[^\]]+)?\]/g, '$1');
  const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

  const ZONES = ['A', 'B'];

  /* ===== Libellés =====
     [mot] ou [mot|clé] : mot du lexique, souligné, traduction française au
     survol ou au toucher (voir GLOSSARY). Les raisons des verrous restent en
     texte simple : la bulle du cadre commun n'affiche pas de lexique. */
  const LABELS = {
    title: 'Sun and shade',
    question: "Zone A and zone B are only [50 m apart]. Why don't the same plants and animals live there?",
    yourQuestion: 'Your question',
    yourZones: 'Your two zones',
    zone: Z => `Zone ${Z}`,
    apart: '50 m',
    same: 'Both the same',

    hypothesisTitle: 'Your hypothesis',
    hypIntro: 'I think that…',
    hypRows: {
      warmer: 'the warmer zone is',
      brighter: 'the brighter zone (more light) is',
      humid: 'the more humid zone is',
      moss: 'I will find more [mosses] and [ferns] in'
    },
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

    tools: { thermo: 'Thermometer', lux: 'Luxmeter', hygro: 'Hygrometer', hand: 'Feel the soil', quadrat: 'Quadrat' },
    views: { field: 'In the field', graph: 'Histogram' },
    toolAt: Z => `in zone ${Z}`,
    sheetTitle: 'Field data sheet',
    factors: { temp: 'Temperature', lux: 'Light intensity', air: 'Air humidity', soil: 'Soil humidity', species: 'Number of species' },
    units: { temp: '(°C)', lux: '(lux)', air: '(%)', soil: 'dry, moist or wet', species: 'from your count' },
    soilWords: { dry: 'dry', moist: 'moist', wet: 'wet' },
    choose: 'Choose…',
    countTitle: 'Quadrat count',
    countSub: 'individuals of each species',
    notCounted: 'Not counted yet',
    nSpecies: n => n === 1 ? '1 species' : `${n} species`,
    cellLabel: (Z, f) => `Zone ${Z}, ${LABELS.factors[f].toLowerCase()}`,
    infoField: (v, q) => `${v} / 8 measurements written · ${q} / 2 quadrats counted`,
    toConclude: 'Next: conclude',
    backToZones: 'Back to the zones',
    quadratHead: Z => `Zone ${Z} · the [quadrat] (1 m × 1 m) seen from above`,
    tapToCount: 'Tap to count',
    idEmpty: 'Tap each [living thing] inside the [quadrat] to count it. Tap it again if you made a mistake.',
    idCounted: n => `Counted. In this quadrat: ${n}.`,
    idRemoved: 'Not counted. Tap it to count it.',

    lockCell: {
      temp: Z => `First put the thermometer in zone ${Z}.`,
      lux: Z => `First put the luxmeter in zone ${Z}.`,
      air: Z => `First put the hygrometer in zone ${Z}.`,
      soil: Z => `First feel the soil of zone ${Z} with your hand.`
    },
    lockGraph: 'Count the living things in both quadrats first.',
    lockBars: 'Choose your scale first: how many individuals does one square stand for?',
    missing: {
      temp: Z => `Measure the temperature of zone ${Z} and write it in your data sheet.`,
      lux: Z => `Measure the light in zone ${Z} and write it in your data sheet.`,
      air: Z => `Measure the air humidity of zone ${Z} and write it in your data sheet.`,
      soil: Z => `Feel the soil of zone ${Z} and note if it is dry, moist or wet.`,
      count: Z => `Put the quadrat in zone ${Z} and count the living things inside.`,
      scale: 'Choose the scale of your histogram.',
      y: 'Name the vertical axis (Y) of your histogram.',
      x: 'Name the horizontal axis (X) of your histogram.',
      bars: n => `Your histogram is not finished: ${n === 1 ? '1 bar' : n + ' bars'} still to draw.`
    },

    caption: {
      start: 'Pick an instrument, then tap zone A or zone B (or drag the instrument onto the zone).',
      noTool: 'Pick an instrument first, then tap a zone.',
      tool: {
        thermo: 'Tap a zone to put the thermometer there.',
        lux: 'Tap a zone to measure its light with the [luxmeter].',
        hygro: 'Tap a zone to measure the humidity of its air with the [hygrometer].',
        hand: 'Tap a zone to feel its soil with your hand.',
        quadrat: 'Tap a zone to put the [quadrat] on the ground and count the [living things] inside.'
      },
      measured: {
        thermo: Z => `The thermometer is in zone ${Z}. Read it and write the temperature in your data sheet.`,
        lux: Z => `The [luxmeter] measures the light in zone ${Z}. Write the value in your data sheet.`,
        hygro: Z => `The [hygrometer] measures the humidity of the air in zone ${Z}. Write the value in your data sheet.`
      },
      felt: Z => `Now note in your data sheet if the soil of zone ${Z} is dry, moist or wet.`,
      quadrat: 'Tap each [living thing] inside the [quadrat] to count it. Tap it again if you made a mistake.',
      counted: (name, n, Z) => `[${capitalize(name)}|${name}]: ${n} counted in zone ${Z}.`,
      uncounted: name => `[${capitalize(name)}|${name}]: removed from your count.`,
      quadratOpen: Z => `Zone ${Z}: tap the [quadrat] to count again.`,
      fieldDone: 'Your data sheet is complete. Now open “Histogram” at the top to build your histogram.',
      graph: 'Choose your [scale], name the axes, then draw each [bar|bar]: drag it up to its value, or tap at the right height.',
      graphDone: 'Your histogram is finished. You can go on to conclude.',
      bad: {
        temp: 'Write the temperature shown on the thermometer, in °C (for example 18.5).',
        lux: 'Write the number shown on the luxmeter, in lux (for example 12400).',
        air: 'Write the number shown on the hygrometer, in % (for example 65).'
      },
      saved: 'Written down.'
    },
    feel: {
      dry: 'The soil is hard and dusty. It [crumbles] between your fingers, and your fingers stay dry.',
      moist: 'The soil is soft and cool. It [sticks] a little to your fingers, but no water comes out.',
      wet: 'The soil is [muddy]. Water comes out when you [press] it, and your fingers are wet.'
    },
    feelNote: 'Note it in your data sheet: dry, moist or wet?',

    graphTitle: 'Your histogram',
    chartTitle: 'Number of individuals of each species in zone A and zone B',
    scaleLabel: 'Scale: 1 [square] =',
    scaleOption: s => s === 1 ? '1 individual' : `${s} individuals`,
    yAxis: 'Vertical axis (Y)',
    xAxis: 'Horizontal axis (X)',
    yOptions: { individuals: 'Number of individuals', species: 'Number of species', temp: 'Temperature (°C)', light: 'Light intensity (lux)' },
    xOptions: { species: 'Species', zones: 'Zones', time: 'Time (min)', individuals: 'Number of individuals' },
    axisUnset: '?',
    barLabel: (name, Z) => `Bar of the ${name}, zone ${Z}`,

    concludeTitle: 'Use your data sheet and your histogram.',
    qFactors: 'Read your data sheet.',
    qLiving: 'Read your histogram.',
    qBio: 'Biodiversity: which zone has the most species?',
    rows: {
      warmer: 'Warmer',
      brighter: 'Brighter',
      humid: 'More humid',
      moss: 'More [mosses] and [ferns]',
      bloom: 'More [wildflowers] and [flying insects]',
      bio: 'More species'
    },
    qKey: 'Above all, [mosses] and [ferns] need…',
    keys: { warmth: 'warmth', light: 'a lot of light', humidity: 'humidity' },
    qWhy: 'The same living things do not live in both zones because…',
    whys: {
      conditions: 'the physical conditions (temperature, light, humidity) are different, and each living thing lives where they suit it',
      distance: 'the zones are too far apart: animals and seeds cannot go from one to the other',
      chance: 'it is just chance'
    },
    qVerdict: 'So my hypothesis is',
    verdicts: { confirmed: 'confirmed', partly: 'partly confirmed', rejected: 'rejected' },
    checkConclusions: 'Check my conclusions',
    backToLab: 'Back to the field',

    scoreLabel: 'checks passed',
    criteria: { measures: 'Measurements', count: 'Counting', graph: 'Histogram', conclusion: 'Conclusion', verdict: 'Hypothesis' },
    criteriaSub: { measures: 'Your data sheet', count: 'Your quadrats', graph: 'Tool sheet FO5b', conclusion: 'Your answers', verdict: 'Your judgement' },

    report: {
      title: 'Laboratory report — Sun and shade',
      question: (a, b) => `Zone A (${a}) and zone B (${b}) are only 50 m apart. Why don't the same plants and animals live there?`,
      because: 'Because',
      materials: 'A thermometer, a luxmeter, a hygrometer, a quadrat (a square of 1 m × 1 m), the field data sheet, squared paper and a ruler.',
      procedure: [
        'In each zone, measure the temperature of the air with the thermometer, the light intensity with the luxmeter and the humidity of the air with the hygrometer.',
        'Touch the soil to feel if it is dry, moist or wet.',
        'Put the quadrat on the ground and count the individuals of each species of living thing inside it.',
        'Write everything in the field data sheet.',
        'Draw a histogram of the number of individuals of each species in both zones (tool sheet FO5b).'
      ],
      zoneCol: 'Zone',
      countCaption: 'Living things in the quadrat (number of individuals)',
      species: 'Species',
      nothing: 'nothing',
      axes: (step, y, x) => `Scale: 1 square = ${step}. Vertical axis: ${y}. Horizontal axis: ${x}.`,
      results: 'My results show that',
      keyLine: key => `Above all, mosses and ferns need ${key}.`,
      conclusion: (why, verdict) => `The same living things do not live in both zones because ${why}. My hypothesis is ${verdict}.`,
      score: n => `Score: ${n} / 5 checks passed.`
    }
  };

  /* Phrases tirées des choix de l'élève (hypothèse, réponses, rapport). */
  const PHRASE = {
    warmer: v => v === 'same' ? 'both zones have the same temperature' : `zone ${v} is warmer`,
    brighter: v => v === 'same' ? 'both zones get the same light' : `zone ${v} is brighter`,
    humid: v => v === 'same' ? 'both zones are as humid' : `zone ${v} is more humid`,
    moss: v => v === 'same' ? 'there are as many mosses and ferns in both zones' : `there are more mosses and ferns in zone ${v}`,
    bloom: v => v === 'same' ? 'there are as many wildflowers and flying insects in both zones' : `there are more wildflowers and flying insects in zone ${v}`,
    bio: v => v === 'same' ? 'both zones have the same number of species' : `zone ${v} has the most species`,
    hypMoss: v => v === 'same' ? 'I will find as many mosses and ferns in both zones' : `I will find more mosses and ferns in zone ${v}`
  };

  const GLOSSARY = {
    '50 m apart': "à 50 m l'une de l'autre", meadow: 'prairie', 'edge of the woods': 'lisière du bois',
    'deep shade': 'ombre profonde', 'edge of the pond': "bord de l'étang",
    quadrat: 'carré de comptage', luxmeter: 'luxmètre (il mesure la lumière)', hygrometer: "hygromètre (il mesure l'humidité de l'air)",
    mosses: 'mousses', ferns: 'fougères', wildflowers: 'fleurs sauvages', 'flying insects': 'insectes volants',
    'living thing': 'être vivant', 'living things': 'êtres vivants',
    crumbles: "s'effrite", sticks: 'colle', muddy: 'boueux', press: 'presses',
    square: 'carreau (du quadrillage)', scale: 'échelle', bar: 'bâton', tuft: 'touffe', toothed: 'dentelées',
    thorny: 'épineuses', stings: 'pique', fungus: 'champignon', 'see-through': 'transparentes', 'sword-shaped': "en forme d'épée",
    grass: 'herbe', daisy: 'pâquerette', dandelion: 'pissenlit', buttercup: "bouton d'or", bramble: 'ronce', nettle: 'ortie',
    ivy: 'lierre', fern: 'fougère', moss: 'mousse', mushroom: 'champignon', rush: 'jonc', 'yellow iris': 'iris des marais',
    butterfly: 'papillon', bee: 'abeille', grasshopper: 'sauterelle', ant: 'fourmi', woodlouse: 'cloporte', snail: 'escargot',
    dragonfly: 'libellule', frog: 'grenouille', stone: 'caillou', 'dead leaf': 'feuille morte', twig: 'brindille',
    'empty shell': 'coquille vide', 'feed on': 'se nourrissent de', 'dry out': 'se dessèchent', 'suit it': 'lui conviennent'
  };

  /* ===== Ce qu'on trouve dans un carré =====
     r : rayon du dessin (unités du carré, 400 pour 1 m) ; la zone à toucher
     fait au moins HIT_MIN. living: false : objet à ne pas compter. layer :
     ordre de dessin (plantes, objets, fleurs, animaux). move : les animaux
     bougent un peu. Dessins vus de dessus, sauf ceux qui ne se reconnaîtraient
     pas ainsi (champignon, escargot, iris), vus de trois quarts. */
  const HIT_MIN = 13;

  function toothedLeaf(len, w, n, fill, stroke) {
    const right = [], left = [];
    for (let i = 1; i < n; i++) {
      const t = i / n, y = -len * t, half = w * Math.sin(Math.PI * Math.pow(t, 0.75)), tooth = i % 2 ? 1.3 : 0;
      right.push(`${(half + tooth).toFixed(1)} ${y.toFixed(1)}`);
      left.unshift(`${(-half - tooth).toFixed(1)} ${y.toFixed(1)}`);
    }
    return `<path d="M0 0 L${right.join(' L')} L0 ${-len} L${left.join(' L')} Z" fill="${fill}" stroke="${stroke}" stroke-width=".6" stroke-linejoin="round"/>` +
      `<path d="M0 0 L0 ${-len + 2}" stroke="${stroke}" stroke-width=".7"/>`;
  }

  const IVY_LEAF = 'M0 0 C-3 -1 -7 -1 -9 -4 C-7 -5 -6 -6 -6 -8 C-4 -8 -3 -9 -2 -11 C-1 -12 0 -14 0 -15 C0 -14 1 -12 2 -11 C3 -9 4 -8 6 -8 C6 -6 7 -5 9 -4 C7 -1 3 -1 0 0 Z';

  function frond(len) {
    let s = `<path d="M0 0 L0 ${-len}" stroke="#2f6a26" stroke-width="1.2"/>`;
    const n = 9;
    for (let k = 1; k <= n; k++) {
      const y = -len * k / (n + 1), w = 7 * (1 - k / (n + 2)), cx = w / 2 + 0.6;
      s += `<ellipse cx="${cx.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(w / 2).toFixed(1)}" ry="1.7" fill="#4f9a3a" transform="rotate(-25 ${cx.toFixed(1)} ${y.toFixed(1)})"/>` +
        `<ellipse cx="${(-cx).toFixed(1)}" cy="${y.toFixed(1)}" rx="${(w / 2).toFixed(1)}" ry="1.7" fill="#5aa843" transform="rotate(25 ${(-cx).toFixed(1)} ${y.toFixed(1)})"/>`;
    }
    return s;
  }

  const T = {
    grass: { name: 'grass', r: 20, layer: 0,
      cap: 'A [tuft] of grass: long, thin green leaves that grow in the sun.',
      draw: r => {
        let s = '<ellipse rx="9" ry="9" fill="#000" opacity=".08"/>';
        for (let i = 0; i < 11; i++) {
          const a = (i / 11) * Math.PI * 2 + r() * 0.5, len = 13 + r() * 7, bend = (r() - 0.5) * 9;
          const x = Math.cos(a) * len, y = Math.sin(a) * len;
          const cx = Math.cos(a) * len * 0.5 - Math.sin(a) * bend, cy = Math.sin(a) * len * 0.5 + Math.cos(a) * bend;
          s += `<path d="M0 0 Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}" stroke="${i % 3 ? '#3f7f2a' : '#6cae3e'}" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;
        }
        return s + '<circle r="2.6" fill="#356b23"/>';
      } },
    moss: { name: 'moss', r: 17, layer: 0,
      cap: 'A soft green cushion made of tiny leaves. It has no flowers and no roots.',
      draw: r => {
        let s = '<path d="M-15 2 C-16 -8 -6 -15 2 -13 C11 -14 17 -5 15 3 C16 11 6 16 -2 14 C-11 15 -16 9 -15 2 Z" fill="#3f7a26" stroke="#2f5f1c" stroke-width=".8"/>';
        for (let i = 0; i < 26; i++) {
          const a = r() * 6.283, d = r() * 11.5;
          s += `<circle cx="${(Math.cos(a) * d).toFixed(1)}" cy="${(Math.sin(a) * d).toFixed(1)}" r="${(1.1 + r() * 1.4).toFixed(1)}" fill="${i % 2 ? '#6aae3a' : '#88c652'}"/>`;
        }
        return s;
      } },
    fern: { name: 'fern', r: 23, layer: 0,
      cap: 'A plant with long, finely cut leaves (fronds). It has no flowers.',
      draw: r => {
        const base = r() * 60;
        return [0, 120, 240].map(a => `<g transform="rotate(${(a + base).toFixed(0)})">${frond(22)}</g>`).join('') + '<circle r="2.4" fill="#5c4630"/>';
      } },
    ivy: { name: 'ivy', r: 17, layer: 0,
      cap: 'A climbing plant with dark, shiny leaves. It stays green all year.',
      draw: () => '<path d="M-14 10 C-6 4 2 2 12 -10" stroke="#5a4a2a" stroke-width="1.3" fill="none"/>' +
        [[-12, 9, -60, 0.9], [-3, 4, 20, 1], [5, -2, -40, 0.85], [12, -10, 30, 0.75]].map(([x, y, a, s]) =>
          `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path d="${IVY_LEAF}" fill="#24502a" stroke="#173a1c" stroke-width=".7"/><path d="M0 0 L0 -13 M0 -6 L-6 -6 M0 -6 L6 -6 M0 -3 L-7 -3 M0 -3 L7 -3" stroke="#7fa77f" stroke-width=".6" fill="none"/></g>`).join('') },
    bramble: { name: 'bramble', r: 21, layer: 0,
      cap: 'A plant with long [thorny] stems and blackberries.',
      draw: () => '<path d="M-19 9 C-11 -15 9 -17 19 5" fill="none" stroke="#7a3b46" stroke-width="2.3" stroke-linecap="round"/>' +
        [[-15, 0, -60], [-7, -9, -25], [3, -11, 10], [12, -6, 45]].map(([x, y, a]) => `<path d="M${x} ${y} l-2.5 -2.5" transform="rotate(${a} ${x} ${y})" stroke="#7a3b46" stroke-width="1.1"/>`).join('') +
        [[-12, -4, -30], [8, -8, 25]].map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})">` +
          [-35, 0, 35].map(b => `<ellipse cx="0" cy="-6" rx="3.4" ry="5.6" fill="#3d7a36" stroke="#2a5a26" stroke-width=".6" transform="rotate(${b})"/>`).join('') + '</g>').join('') +
        [[15, 7], [17, 10], [13, 10], [15, 13], [18, 6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#2b1830"/>`).join('') +
        '<circle cx="14.4" cy="6.4" r=".6" fill="#ffffff" opacity=".6"/>' },
    nettle: { name: 'nettle', r: 18, layer: 0,
      cap: 'A plant with [toothed] leaves. Careful: it [stings]!',
      draw: () => [0, 90, 180, 270].map(a => `<g transform="rotate(${a})">${toothedLeaf(16, 5.6, 10, '#4c8a3a', '#2f6328')}</g>`).join('') +
        [45, 135, 225, 315].map(a => `<g transform="rotate(${a})">${toothedLeaf(9, 3.4, 6, '#5d9c47', '#2f6328')}</g>`).join('') + '<circle r="2" fill="#3c7330"/>' },
    rush: { name: 'rush', r: 19, layer: 0,
      cap: 'A plant with thin, round, stiff stems. It grows with its feet in the water.',
      draw: r => {
        let s = '<ellipse rx="7" ry="7" fill="#000" opacity=".12"/>';
        for (let i = 0; i < 16; i++) {
          const a = r() * 6.283, len = 9 + r() * 10;
          s += `<path d="M0 0 L${(Math.cos(a) * len).toFixed(1)} ${(Math.sin(a) * len).toFixed(1)}" stroke="${i % 2 ? '#2f5d22' : '#4a7d34'}" stroke-width="1.8" stroke-linecap="round"/>`;
          if (i % 5 === 0) s += `<circle cx="${(Math.cos(a) * len * 0.75).toFixed(1)}" cy="${(Math.sin(a) * len * 0.75).toFixed(1)}" r="1.9" fill="#8a6a3a"/>`;
        }
        return s;
      } },
    iris: { name: 'yellow iris', r: 19, layer: 0,
      cap: 'A tall plant with [sword-shaped] leaves and a big yellow flower. It grows near water.',
      draw: () => [-38, -19, 0, 19, 38].map(a => `<path d="M0 12 C-2.6 2 -2.2 -8 0 -17 C2.2 -8 2.6 2 0 12 Z" fill="${a % 2 ? '#3f7d36' : '#4f9442'}" transform="rotate(${a} 0 12)"/>`).join('') +
        '<g transform="translate(2 -11)">' + [0, 120, 240].map(a => `<ellipse cx="0" cy="-4.2" rx="3.4" ry="5" fill="#f3c623" stroke="#c99a12" stroke-width=".6" transform="rotate(${a})"/>`).join('') + '<circle r="1.8" fill="#d98a0b"/></g>' },
    mushroom: { name: 'mushroom', r: 13, layer: 1,
      cap: 'A [fungus]: it is not a plant. It grows on dead leaves and dead wood.',
      draw: () => '<ellipse cx="0" cy="10" rx="12" ry="2.5" fill="#000" opacity=".18"/>' +
        '<path d="M2.5 1 L2 10 L7 10 L6.5 1 Z" fill="#efe6d2"/><path d="M-5.5 4 L-6 10 L-2.5 10 L-3 4 Z" fill="#efe6d2"/>' +
        '<path d="M-5 2 C-5 -9 14 -9 14 2 Z" fill="#a8622f"/><ellipse cx="4.5" cy="2" rx="9.5" ry="1.8" fill="#e2d2b3"/><ellipse cx="1.5" cy="-4" rx="2.4" ry="1.3" fill="#d39a66" opacity=".7"/>' +
        '<path d="M-11 5 C-11 -2 1 -2 1 5 Z" fill="#b36b33"/><ellipse cx="-5" cy="5" rx="6" ry="1.3" fill="#e2d2b3"/>' },
    daisy: { name: 'daisy', r: 11, layer: 2,
      cap: 'A small white flower with a yellow heart. It opens in the sun.',
      draw: () => '<g fill="#5c9a3c">' + [20, 140, 260].map(a => `<ellipse cx="0" cy="-8" rx="3" ry="5.5" transform="rotate(${a})"/>`).join('') + '</g>' +
        Array.from({ length: 12 }, (_, i) => `<ellipse cx="0" cy="-5" rx="1.7" ry="4" fill="#ffffff" stroke="#cfcfcf" stroke-width=".4" transform="rotate(${i * 30})"/>`).join('') +
        '<circle r="3.1" fill="#f6c429"/>' },
    dandelion: { name: 'dandelion', r: 14, layer: 2,
      cap: 'A yellow flower with [toothed] leaves. Bees love it.',
      draw: () => [0, 72, 144, 216, 288].map(a => `<path d="M0 0 L3 -5 L1 -6 L4 -10 L1.5 -11 L3 -15 L0 -17 L-3 -15 L-1.5 -11 L-4 -10 L-1 -6 L-3 -5 Z" fill="#4f8f33" transform="rotate(${a + 36})"/>`).join('') +
        '<circle r="6.6" fill="#f5b800"/>' + Array.from({ length: 18 }, (_, i) => {
          const a = i * 20 * Math.PI / 180;
          return `<path d="M${(Math.cos(a) * 2.5).toFixed(1)} ${(Math.sin(a) * 2.5).toFixed(1)} L${(Math.cos(a) * 6.6).toFixed(1)} ${(Math.sin(a) * 6.6).toFixed(1)}" stroke="#ffd84a" stroke-width=".9"/>`;
        }).join('') + '<circle r="2.2" fill="#e09a00"/>' },
    buttercup: { name: 'buttercup', r: 11, layer: 2,
      cap: 'A small, shiny yellow flower with five round petals.',
      draw: () => '<path d="M-1 3 L-8 9" stroke="#4f8f33" stroke-width="1.4"/><path d="M-8 9 l-4.5 -1 l1.2 4.5 z" fill="#4f8f33"/>' +
        [0, 72, 144, 216, 288].map(a => `<circle cx="0" cy="-4.4" r="3.7" fill="#ffd21f" stroke="#d9a400" stroke-width=".5" transform="rotate(${a})"/>`).join('') +
        '<circle r="2.2" fill="#b8a838"/><ellipse cx="-1.4" cy="-6" rx="1.2" ry=".7" fill="#ffffff" opacity=".7"/>' },
    butterfly: { name: 'butterfly', r: 13, layer: 3,
      cap: 'An insect with big, colourful wings. It drinks the nectar of flowers.',
      draw: () => '<g><g>' +
        '<path d="M0 0 C-4 -9 -13 -12 -12.5 -3 C-12 1 -5 1 0 0 Z" fill="#f08a24" stroke="#3a2a1a" stroke-width=".9"/><path d="M0 0 C-3 5 -10 10 -11 4 C-11 1 -5 0 0 0 Z" fill="#e2671c" stroke="#3a2a1a" stroke-width=".9"/>' +
        '<g transform="scale(-1 1)"><path d="M0 0 C-4 -9 -13 -12 -12.5 -3 C-12 1 -5 1 0 0 Z" fill="#f08a24" stroke="#3a2a1a" stroke-width=".9"/><path d="M0 0 C-3 5 -10 10 -11 4 C-11 1 -5 0 0 0 Z" fill="#e2671c" stroke="#3a2a1a" stroke-width=".9"/></g>' +
        '<circle cx="-8" cy="-5" r="1.5" fill="#ffffff"/><circle cx="8" cy="-5" r="1.5" fill="#ffffff"/><circle cx="-7" cy="4" r="1" fill="#2b211a"/><circle cx="7" cy="4" r="1" fill="#2b211a"/>' +
        '<animateTransform attributeName="transform" type="scale" values="1 1;0.55 1;1 1" dur="0.9s" repeatCount="indefinite"/></g>' +
        '<ellipse rx="1.4" ry="6.5" fill="#2b211a"/><path d="M-.6 -6 L-3 -10 M.6 -6 L3 -10" stroke="#2b211a" stroke-width=".7"/></g>' },
    bee: { name: 'bee', r: 10, layer: 3, move: 'buzz',
      cap: 'A flying insect with yellow and black stripes. It visits flowers.',
      draw: () => '<ellipse cx="-3" cy="-5" rx="3.2" ry="5.4" fill="#e8f3fb" stroke="#9cc3e3" stroke-width=".6" transform="rotate(-35 -3 -5)" opacity=".95"/>' +
        '<ellipse cx="3" cy="-5" rx="3.2" ry="5.4" fill="#e8f3fb" stroke="#9cc3e3" stroke-width=".6" transform="rotate(35 3 -5)" opacity=".95"/>' +
        '<ellipse rx="4" ry="7" fill="#f5b72a"/><path d="M-3.8 -1.5 H3.8 M-3.4 2 H3.4 M-2.4 5 H2.4" stroke="#2b2420" stroke-width="1.7"/><circle cy="-7.6" r="2.6" fill="#2b2420"/>' },
    dragonfly: { name: 'dragonfly', r: 16, layer: 3,
      cap: 'A long flying insect with four [see-through] wings. It hunts near water.',
      draw: () => [[-4, -9, -20], [-4, 9, 20], [3, -8, 15], [3, 8, -15]].map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="2.8" ry="9" fill="#dcefff" fill-opacity=".75" stroke="#7fb0d8" stroke-width=".7" transform="rotate(${a} ${x} ${y})"/>`).join('') +
        '<path d="M-16 0 L8 0" stroke="#2c74b3" stroke-width="2.6" stroke-linecap="round"/><circle cx="10" cy="0" r="3" fill="#1f5c91"/><circle cx="11" cy="-1.6" r="1.1" fill="#9fd0f3"/><circle cx="11" cy="1.6" r="1.1" fill="#9fd0f3"/>' },
    grasshopper: { name: 'grasshopper', r: 12, layer: 3,
      cap: 'A green insect with long back legs. It jumps very far.',
      draw: () => '<path d="M-1 2 L-6 7 L-12 6 M-1 -2 L-6 -7 L-12 -6" stroke="#3f7a26" stroke-width="1.7" fill="none" stroke-linejoin="round"/>' +
        '<path d="M3 2 L4 6 M3 -2 L4 -6 M6 1.5 L8 5 M6 -1.5 L8 -5" stroke="#3f7a26" stroke-width=".9"/>' +
        '<ellipse rx="9" ry="2.8" fill="#6aa23a"/><circle cx="9" r="2.8" fill="#5c9230"/><circle cx="10" cy="-1.2" r=".8" fill="#1f2a14"/>' +
        '<path d="M11 -1 C14 -4 16 -6 18 -6 M11 1 C14 4 16 6 18 6" stroke="#3f7a26" stroke-width=".6" fill="none"/>' },
    ant: { name: 'ant', r: 8, layer: 3, move: 'run',
      cap: 'A tiny black insect. It runs fast.',
      draw: () => '<g transform="scale(1.35)"><path d="M1.6 0 L-.5 -4 M1.6 0 L3.8 -4.2 M1.6 0 L1.6 -4.6 M1.6 0 L-.5 4 M1.6 0 L3.8 4.2 M1.6 0 L1.6 4.6" stroke="#1f1c1a" stroke-width=".6"/><circle cx="-3.2" r="2.6" fill="#1f1c1a"/><circle cx="1.6" r="1.4" fill="#1f1c1a"/><circle cx="5.2" r="1.8" fill="#1f1c1a"/></g>' },
    woodlouse: { name: 'woodlouse', r: 10, layer: 3, move: 'walk',
      cap: 'A small grey animal with a hard back made of plates, and fourteen legs.',
      draw: () => '<g transform="scale(1.15)"><path d="M7.5 -2 L11.5 -5 M7.5 2 L11.5 5" stroke="#4d5257" stroke-width=".8"/><ellipse rx="8.6" ry="5.5" fill="#6c7177"/>' +
        [-5, -2.6, -0.2, 2.2, 4.6].map(i => `<path d="M${i} -5.2 Q${i + 0.7} 0 ${i} 5.2" stroke="#53585e" stroke-width=".75" fill="none"/>`).join('') + '<ellipse cx="-1" cy="-1.8" rx="6" ry="1.6" fill="#9a9fa5" opacity=".55"/></g>' },
    snail: { name: 'snail', r: 12, layer: 3, move: 'slow',
      cap: 'A soft animal that carries its shell on its back. It moves slowly.',
      draw: () => '<path d="M-12 6 C-6 3.5 5 3.5 10 5.5 L12.5 3.5 L10 1 C8 2.5 4 3 1 3 Z" fill="#c4ad90" stroke="#9c8569" stroke-width=".6"/>' +
        '<path d="M10.5 2 L13 -4 M9 2.4 L10 -4" stroke="#9c8569" stroke-width="1"/><circle cx="13" cy="-4.2" r="1" fill="#5e4a36"/><circle cx="10" cy="-4.2" r=".9" fill="#5e4a36"/>' +
        '<circle cx="-1" cy="-1" r="7" fill="#a5672e" stroke="#6e4220" stroke-width=".9"/><path d="M-1 -1 m-3 0 a3 3 0 1 1 3 3 a4.8 4.8 0 1 1 -4.8 -4.8" fill="none" stroke="#6e4220" stroke-width=".9"/>' +
        '<ellipse cx="-3.5" cy="-4" rx="2" ry="1" fill="#ffffff" opacity=".3"/>' },
    frog: { name: 'frog', r: 14, layer: 3,
      cap: 'A green animal that lives near water. Its skin is always wet.',
      draw: () => '<path d="M-5 5 L-11 9 L-13 5 M-11 9 L-9 13 M5 5 L11 9 L13 5 M11 9 L9 13 M-5 -3 L-10 -5 L-11 -8 M5 -3 L10 -5 L11 -8" stroke="#3f8233" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<ellipse cy="1" rx="7.5" ry="9.5" fill="#5aa04a"/><circle cx="-4" cy="-7" r="2.8" fill="#5aa04a"/><circle cx="4" cy="-7" r="2.8" fill="#5aa04a"/>' +
        '<circle cx="-4" cy="-7.4" r="1.4" fill="#1d2a17"/><circle cx="4" cy="-7.4" r="1.4" fill="#1d2a17"/><circle cx="-2" cy="3" r="1.4" fill="#3f8233"/><circle cx="3" cy="5" r="1.1" fill="#3f8233"/><circle cx="1" cy="-1" r="1" fill="#3f8233"/>' },
    stone: { name: 'stone', r: 11, layer: 1, living: false,
      cap: 'A small grey stone. It is hard and cold.',
      draw: r => {
        const c = ['#9c948a', '#a59a8c', '#8f8a83'][Math.floor(r() * 3)];
        return `<path d="M-10 -2 L-5 -8 L5 -8 L10 -2 L8 6 L-2 9 L-9 5 Z" fill="${c}" stroke="#00000030" stroke-width=".8"/><path d="M-5 -6 L3 -6 L-3 -2 Z" fill="#ffffff" opacity=".25"/>`;
      } },
    deadLeaf: { name: 'dead leaf', r: 14, layer: 1, living: false,
      cap: 'A brown, dry leaf that fell from a tree. It is full of holes.',
      draw: r => {
        const c = ['#7c4f25', '#93622e', '#8a5a2b'][Math.floor(r() * 3)];
        return `<path d="M-14 0 C-8 -9 6 -9 14 0 C6 9 -8 9 -14 0 Z" fill="${c}"/><path d="M-14 0 L14 0 M-6 0 L-2 -5 M1 0 L5 -5 M-6 0 L-2 5 M1 0 L5 5" stroke="#55361a" stroke-width=".65" fill="none"/><circle cx="5.5" cy="2.6" r="1.7" fill="#3b2a1c" opacity=".7"/><circle cx="-4" cy="-2.7" r="1.15" fill="#3b2a1c" opacity=".7"/>`;
      } },
    twig: { name: 'twig', r: 16, layer: 1, living: false,
      cap: 'A small piece of dead wood. The bark comes off easily.',
      draw: () => '<path d="M-16 2 L16 -2" stroke="#6b4a2f" stroke-width="3.3" stroke-linecap="round"/><path d="M3 -.5 L10 -7" stroke="#6b4a2f" stroke-width="2.1" stroke-linecap="round"/><path d="M-11 1.2 L-7 .7 M-2 .2 L1.5 -.2 M7 -.9 L11 -1.4" stroke="#977452" stroke-width=".7"/>' },
    shell: { name: 'empty shell', r: 10, layer: 1, living: false,
      cap: 'A snail shell. It is white and broken, and empty: there is no snail inside any more.',
      draw: () => '<circle r="7" fill="#efe7d6" stroke="#b8a98c" stroke-width=".9"/><path d="M0 0 m-3 0 a3 3 0 1 1 3 3 a4.8 4.8 0 1 1 -4.8 -4.8" fill="none" stroke="#c9b99a" stroke-width=".9"/>' +
        '<ellipse cx="5" cy="4" rx="2.6" ry="2" fill="#4d4436"/><path d="M2 -6.8 L3.6 -3.2 L6.4 -3.8" stroke="#8a7a5c" stroke-width=".8" fill="none"/>' }
  };

  const MOVES = {
    run: '<animateTransform attributeName="transform" type="translate" values="0 0;3 -1.5;6 0;3 1.5;0 0" dur="1.3s" repeatCount="indefinite"/>',
    walk: '<animateTransform attributeName="transform" type="translate" values="0 0;2 -1;4 0;2 1;0 0" dur="2.4s" repeatCount="indefinite"/>',
    slow: '<animateTransform attributeName="transform" type="translate" values="0 0;2 0;0 0" dur="4s" repeatCount="indefinite"/>',
    buzz: '<animateTransform attributeName="transform" type="translate" values="0 0;1 -1;-1 0;0 1;0 0" dur="0.5s" repeatCount="indefinite"/>'
  };

  const isLiving = t => T[t].living !== false;
  const hitR = t => Math.max(HIT_MIN, T[t].r);

  // Groupes de la fiche de terrain (« Species location »).
  const MOSS_FERN = ['moss', 'fern'];
  const BLOOM = ['daisy', 'dandelion', 'buttercup', 'iris', 'butterfly', 'bee', 'dragonfly'];

  /* ===== Les milieux =====
     rank : du plus ensoleillé au plus ombragé. Les plages de valeurs ne se
     recouvrent pas : dans chaque paire tirée, la zone la plus ensoleillée est
     aussi la plus chaude et la plus sèche. Lumière en lux arrondie comme sur
     un luxmètre (centaines au-delà de 10 000). always : espèces toujours
     présentes ; extra : tirées pour compléter ; counts : nombre d'individus
     dans le carré, quand il diffère de COUNTS. junk : objets non vivants. */
  const HABITATS = {
    meadow: { rank: 0, temp: [23, 26], lux: [45000, 80000], air: [38, 50], soil: 'dry',
      always: ['grass', 'daisy', 'butterfly'], extra: ['dandelion', 'buttercup', 'bee', 'grasshopper', 'ant'],
      counts: {}, junk: ['stone', 'twig'] },
    edge: { rank: 1, temp: [19.5, 21.5], lux: [18000, 32000], air: [55, 64], soil: 'dry',
      always: ['grass', 'bramble', 'fern', 'butterfly'], extra: ['nettle', 'ivy', 'dandelion', 'bee', 'snail', 'ant'],
      counts: { fern: [1, 2], grass: [3, 7], butterfly: [1, 2] }, junk: ['deadLeaf', 'twig', 'shell'] },
    pond: { rank: 2, temp: [16.5, 18], lux: [7000, 12000], air: [84, 94], soil: 'wet',
      always: ['rush', 'moss', 'dragonfly'], extra: ['iris', 'buttercup', 'frog', 'snail', 'grass'],
      counts: { moss: [3, 7], grass: [2, 5], buttercup: [1, 3] }, junk: ['stone', 'deadLeaf'] },
    shade: { rank: 3, temp: [13, 15.5], lux: [600, 2500], air: [72, 82], soil: 'moist',
      always: ['moss', 'fern'], extra: ['ivy', 'mushroom', 'woodlouse', 'snail'],
      counts: {}, junk: ['deadLeaf', 'twig', 'shell'] }
  };
  const PAIRS = [['meadow', 'edge'], ['meadow', 'shade'], ['meadow', 'pond'], ['edge', 'shade'], ['edge', 'pond']];

  const COUNTS = {
    grass: [6, 13], moss: [5, 12], fern: [2, 5], ivy: [3, 7], bramble: [2, 4], nettle: [2, 5], rush: [5, 12], iris: [1, 3],
    mushroom: [2, 5], daisy: [3, 8], dandelion: [2, 5], buttercup: [2, 5], butterfly: [1, 3], bee: [1, 3], dragonfly: [1, 2],
    grasshopper: [1, 4], ant: [3, 10], woodlouse: [3, 9], snail: [1, 3], frog: [1, 1]
  };

  const FACTORS = ['temp', 'lux', 'air', 'soil'];
  const INSTR = { thermo: 'temp', lux: 'lux', hygro: 'air' };
  const INSTR_OF = { temp: 'thermo', lux: 'lux', air: 'hygro' };
  const INSTR_NAME = { temp: 'thermometer', lux: 'luxmeter', air: 'hygrometer' };
  const UNIT = { temp: '°C', lux: 'lux', air: '%' };
  const TOOLS = ['thermo', 'lux', 'hygro', 'hand', 'quadrat'];
  const STEPS = [1, 2, 5];   // échelles proposées : 1 carreau = 1, 2 ou 5 individus (10 carreaux)

  // Couleurs des zones (palette de référence dataviz) ; la zone B est
  // hachurée en plus (daltonisme, impression en noir et blanc).
  const ZC = { A: '#2a78d6', B: '#eb6834' };

  /* ===== Tirage ===== */
  const between = (a, b) => a + Math.random() * (b - a);
  const intBetween = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  function drawValues(key) {
    const h = HABITATS[key];
    const lux = between(...h.lux);
    return {
      temp: Math.round(between(...h.temp) * 10) / 10,
      lux: lux >= 10000 ? Math.round(lux / 100) * 100 : Math.round(lux / 10) * 10,
      air: Math.round(between(...h.air)),
      soil: h.soil
    };
  }

  function drawSpecies(key, n) {
    const h = HABITATS[key];
    const types = h.always.concat(shuffle(h.extra).slice(0, n - h.always.length));
    const counts = {};
    types.forEach(t => { counts[t] = intBetween(...(h.counts[t] || COUNTS[t])); });
    return { types, counts };
  }

  const groupSum = (living, group) => group.reduce((s, t) => s + (living.counts[t] || 0), 0);

  /* Deux zones au nombre d'espèces différent ; mousses et fougères plus
     nombreuses dans la zone ombragée, fleurs et insectes volants dans la
     zone ensoleillée (sinon on tire à nouveau). */
  function drawLiving(keys) {
    const sizes = keys.map(k => {
      const h = HABITATS[k];
      return [Math.max(4, h.always.length), Math.min(6, h.always.length + h.extra.length)];
    });
    const sunny = HABITATS[keys[0]].rank < HABITATS[keys[1]].rank ? 0 : 1;
    let z = null;
    for (let tries = 0; tries < 500; tries++) {
      const nA = intBetween(...sizes[0]), nB = intBetween(...sizes[1]);
      if (nA === nB) continue;
      z = [drawSpecies(keys[0], nA), drawSpecies(keys[1], nB)];
      const shady = 1 - sunny;
      if (groupSum(z[shady], MOSS_FERN) > groupSum(z[sunny], MOSS_FERN) &&
        groupSum(z[sunny], BLOOM) > groupSum(z[shady], BLOOM)) return z;
    }
    return z;
  }

  // Place de chaque élément dans le carré : sans chevauchement des zones à toucher.
  function placeItems(list, Z) {
    const order = list.map((t, i) => ({ t, i })).sort((a, b) => hitR(b.t) - hitR(a.t));
    const placed = [];
    order.forEach(({ t }) => {
      const rr = hitR(t);
      let x = 200, y = 200;
      for (let k = 0; k < 400; k++) {
        x = 18 + rr + Math.random() * (364 - 2 * rr);
        y = 18 + rr + Math.random() * (364 - 2 * rr);
        if (placed.every(p => Math.hypot(p.x - x, p.y - y) > hitR(p.t) + rr + 3)) break;
      }
      placed.push({ t, x: Math.round(x), y: Math.round(y), rot: Math.floor(Math.random() * 360) });
    });
    return placed.map((p, i) => Object.assign(p, { uid: `${Z}${i}` }));
  }

  function buildZone(Z, key, living) {
    const items = [];
    living.types.forEach(t => { for (let i = 0; i < living.counts[t]; i++) items.push(t); });
    shuffle(HABITATS[key].junk).slice(0, 2).forEach(t => items.push(t));
    return { key, values: drawValues(key), items: placeItems(items, Z), seed: String(Math.random()) };
  }

  /* ===== État ===== */
  let state;      // tirage et travail de l'élève (enregistré tel quel, voir save)

  function reset() {
    const pair = pick(PAIRS);
    const keys = Math.random() < 0.5 ? pair : [pair[1], pair[0]];
    const living = drawLiving(keys);
    const blank = v => ({ temp: v, lux: v, air: v, soil: v });
    state = {
      hypothesis: { warmer: null, brighter: null, humid: null, moss: null },
      because: '',
      zones: { A: buildZone('A', keys[0], living[0]), B: buildZone('B', keys[1], living[1]) },
      placed: { thermo: null, lux: null, hygro: null },   // zone où se trouve chaque instrument
      measured: { A: blank(false), B: blank(false) },     // l'instrument (ou la main) est passé par la zone
      table: { A: blank(null), B: blank(null) },          // fiche de l'élève
      feelOpen: { A: false, B: false },                   // bulle « sol » à noter
      quadrat: { A: false, B: false },
      counted: { A: [], B: [] },                          // éléments touchés, dans l'ordre
      view: 'field',                                      // field, quadrat ou graph
      qz: 'A',
      lastItem: null,
      tool: null,
      graph: { step: null, y: null, x: null, bars: {} },
      conclusion: { warmer: null, brighter: null, humid: null, moss: null, bloom: null, bio: null, key: null, why: null, verdict: null },
      crit: 'measures'
    };
  }

  const zoneOf = Z => state.zones[Z];
  const itemOf = (Z, uid) => zoneOf(Z).items.find(i => i.uid === uid) || null;
  const habitatName = Z => LABELS.habitats[zoneOf(Z).key];

  function started() {
    return ZONES.some(Z => state.quadrat[Z] || FACTORS.some(f => state.measured[Z][f]));
  }

  // Ce que l'élève a compté (espèce → nombre), et dans quel ordre.
  function tally(Z) {
    const c = {};
    state.counted[Z].forEach(uid => {
      const it = itemOf(Z, uid);
      if (it) c[it.t] = (c[it.t] || 0) + 1;
    });
    return c;
  }

  function tallyOrder(Z) {
    return [...new Set(state.counted[Z].map(uid => (itemOf(Z, uid) || {}).t).filter(Boolean))];
  }

  // Ce qu'il y avait vraiment (êtres vivants seulement).
  function trueTally(Z) {
    const c = {};
    zoneOf(Z).items.forEach(it => { if (isLiving(it.t)) c[it.t] = (c[it.t] || 0) + 1; });
    return c;
  }

  // Catégories de l'histogramme : les espèces notées par l'élève, A puis B.
  function categories() {
    return [...new Set(tallyOrder('A').concat(tallyOrder('B')))];
  }

  const barValue = (t, Z) => (state.graph.bars[t] && state.graph.bars[t][Z]) || 0;

  function maxTally() {
    return Math.max(0, ...ZONES.flatMap(Z => Object.values(tally(Z))));
  }

  const bestStep = () => STEPS.find(s => 10 * s >= maxTally()) || 5;

  /* ===== Valeurs : lecture, écriture ===== */
  const fmtLux = v => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  function fmtValue(f, v) {
    if (v == null) return '—';
    if (f === 'temp') return v.toFixed(1);
    if (f === 'lux') return fmtLux(v);
    if (f === 'air') return String(Math.round(v));
    return LABELS.soilWords[v];
  }

  function withUnit(f, v) {
    return f === 'soil' ? LABELS.soilWords[v] : `${fmtValue(f, v)} ${UNIT[f]}`;
  }

  // Virgule ou point ; espaces et points de milliers acceptés pour les lux.
  function parseValue(f, raw) {
    const s = String(raw).trim();
    if (f === 'temp') {
      const t = s.replace(',', '.').replace(/\s*°?\s*c$/i, '');
      if (!/^-?(\d{1,2}(\.\d*)?|\.\d+)$/.test(t)) return NaN;
      const v = Number(t);
      return v >= -10 && v <= 50 ? Math.round(v * 10) / 10 : NaN;
    }
    if (f === 'lux') {
      const t = s.replace(/\s*(lux|lx)$/i, '').replace(/[\s.,'   ]/g, '');
      if (!/^\d{1,6}$/.test(t)) return NaN;
      const v = Number(t);
      return v <= 200000 ? v : NaN;
    }
    const t = s.replace(/\s|%/g, '');
    if (!/^\d{1,3}$/.test(t)) return NaN;
    const v = Number(t);
    return v <= 100 ? v : NaN;
  }

  function sameValue(f, said, real) {
    if (said == null) return false;
    return f === 'temp' ? Math.abs(said - real) < 0.051 : said === real;
  }

  /* ===== Étapes complètes (progression stricte, voir lab-engine.js) =====
     1 : l'hypothèse (4 choix) ; 2 : la fiche remplie, les deux carrés
     comptés, l'histogramme construit ; 3 : toutes les questions. */
  const HYP_KEYS = ['warmer', 'brighter', 'humid', 'moss'];
  const CONCL_KEYS = ['warmer', 'brighter', 'humid', 'moss', 'bloom', 'bio', 'key', 'why', 'verdict'];

  const hypComplete = () => HYP_KEYS.every(k => state.hypothesis[k]);
  const countsDone = () => ZONES.every(Z => state.counted[Z].length > 0);
  const quadratsCounted = () => ZONES.filter(Z => state.counted[Z].length > 0).length;
  const valuesWritten = () => ZONES.reduce((n, Z) => n + FACTORS.filter(f => state.table[Z][f] != null).length, 0);
  const fieldDone = () => valuesWritten() === 8 && countsDone();

  function barsLeft() {
    let n = 0;
    categories().forEach(t => ZONES.forEach(Z => { if ((tally(Z)[t] || 0) > 0 && !barValue(t, Z)) n++; }));
    return n;
  }

  const graphDone = () => {
    const g = state.graph;
    return countsDone() && !!(g.step && g.y && g.x) && barsLeft() === 0;
  };

  function missingReason() {
    const M = LABELS.missing;
    for (const Z of ZONES) for (const f of ['temp', 'lux', 'air']) if (state.table[Z][f] == null) return M[f](Z);
    for (const Z of ZONES) if (!state.table[Z].soil) return M.soil(Z);
    for (const Z of ZONES) if (!state.counted[Z].length) return M.count(Z);
    const g = state.graph;
    if (!g.step) return M.scale;
    if (!g.y) return M.y;
    if (!g.x) return M.x;
    const left = barsLeft();
    return left ? M.bars(left) : null;
  }

  const conclusionsComplete = () => CONCL_KEYS.every(k => state.conclusion[k]);

  function stepComplete(n) {
    if (n === 1) return hypComplete();
    if (n === 2) return !missingReason();
    return conclusionsComplete();
  }

  function lockReason(n) {
    if (n === 1) return LABELS.lockHypothesis;
    if (n === 2) return missingReason();
    return lab.L.missingConclusions;
  }

  /* ===== Dessins des zones (vue de côté, 400 × 300) =====
     Le même dessin à chaque affichage (graine de la zone). Les instruments se
     plantent au fond, le carré de comptage se pose devant. */
  let svgUid = 0;

  function grassStrokes(rnd, n, y1, y2, colours, h) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = rnd() * 400, y = y1 + rnd() * (y2 - y1), hh = h * (0.6 + rnd() * 0.8) * (0.6 + (y - y1) / (y2 - y1) * 0.7);
      s += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} q${(rnd() * 4 - 2).toFixed(1)} ${(-hh / 2).toFixed(1)} ${(rnd() * 6 - 3).toFixed(1)} ${(-hh).toFixed(1)}" stroke="${colours[i % colours.length]}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
    }
    return s;
  }

  function sky(u, top, bottom) {
    return `<defs><linearGradient id="${u}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>` +
      `<rect y="-60" width="400" height="360" fill="url(#${u}sky)"/>`;
  }

  function sun(x, y, r) {
    return `<g stroke="#ffc928" stroke-width="3" stroke-linecap="round">` + [0, 45, 90, 135, 180, 225, 270, 315].map(a => {
      const c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180);
      return `<path d="M${(x + c * (r + 7)).toFixed(1)} ${(y + s * (r + 7)).toFixed(1)} L${(x + c * (r + 16)).toFixed(1)} ${(y + s * (r + 16)).toFixed(1)}"/>`;
    }).join('') + `</g><circle cx="${x}" cy="${y}" r="${r}" fill="#ffd54a"/>`;
  }

  function tree(x, y, r, trunk, crowns) {
    return `<rect x="${x - r * 0.14}" y="${y}" width="${r * 0.28}" height="${150 - y + 8}" fill="${trunk}"/>` +
      `<circle cx="${x}" cy="${y}" r="${r}" fill="${crowns[0]}"/><circle cx="${x - r * 0.55}" cy="${y + r * 0.35}" r="${r * 0.62}" fill="${crowns[1]}"/>` +
      `<circle cx="${x + r * 0.55}" cy="${y + r * 0.3}" r="${r * 0.6}" fill="${crowns[2] || crowns[1]}"/>`;
  }

  const SCENES = {
    meadow: (u, rnd) => sky(u, '#a9d6f5', '#e6f4fc') + sun(340, 26, 24) +
      `<path d="M0 152 C14 132 30 130 44 138 C58 120 82 122 96 140 C108 128 126 132 136 150 Z" fill="#7fae63"/>` +
      `<path d="M250 150 C262 140 276 140 286 146 C298 136 316 138 326 150 Z" fill="#8bb86e"/>` +
      `<rect y="148" width="400" height="152" fill="#a6d16d"/><path d="M0 149 H400" stroke="#93c35a" stroke-width="3"/>` +
      grassStrokes(rnd, 120, 154, 300, ['#7fb54a', '#8fc257', '#6ea83f'], 11) +
      Array.from({ length: 22 }, () => {
        const x = rnd() * 400, y = 158 + rnd() * 138, c = ['#ffffff', '#ffd21f', '#ffffff', '#f6c429'][Math.floor(rnd() * 4)];
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.6 + (y - 158) / 70).toFixed(1)}" fill="${c}"/>`;
      }).join('') +
      `<g transform="translate(150 118)"><path d="M0 0 C-3 -7 -10 -8 -9 -2 C-9 1 -4 1 0 0 Z M0 0 C3 -7 10 -8 9 -2 C9 1 4 1 0 0 Z" fill="#f08a24"/></g>` +
      `<g transform="translate(262 100)"><path d="M0 0 C-3 -6 -8 -7 -7 -2 C-7 1 -3 1 0 0 Z M0 0 C3 -6 8 -7 7 -2 C7 1 3 1 0 0 Z" fill="#f3c623"/></g>`,
    edge: (u, rnd) => sky(u, '#b7dcf4', '#e8f4fb') + sun(330, 20, 20) +
      `<rect y="148" width="400" height="152" fill="#9fcb68"/>` +
      `<path d="M0 148 H215 C190 200 130 250 70 300 H0 Z" fill="#4f6b33" opacity=".5"/>` +
      grassStrokes(rnd, 70, 154, 300, ['#7fb54a', '#6ea83f'], 10) +
      tree(30, 52, 52, '#6b4a2f', ['#3f7f45', '#4a8f4f', '#356f3c']) + tree(110, 40, 48, '#5e4129', ['#4a8f4f', '#3f7f45']) +
      tree(176, 76, 38, '#6b4a2f', ['#3f7f45', '#4f9a55']) +
      [[205, 160], [235, 166], [262, 158]].map(([x, y]) => `<path d="M${x - 20} ${y + 10} C${x - 14} ${y - 12} ${x + 12} ${y - 14} ${x + 20} ${y + 10} Z" fill="#3d6e33"/><circle cx="${x - 5}" cy="${y - 1}" r="2" fill="#2b1830"/><circle cx="${x + 6}" cy="${y + 2}" r="2" fill="#2b1830"/>`).join('') +
      [[40, 190], [110, 214], [60, 252]].map(([x, y]) => `<path d="M${x} ${y} q-10 -16 -18 -18 M${x} ${y} q2 -20 0 -24 M${x} ${y} q10 -16 18 -18" stroke="#3f7a34" stroke-width="3" fill="none" stroke-linecap="round"/>`).join(''),
    shade: (u, rnd) => `<rect y="-60" width="400" height="360" fill="#2f4f35"/>` +
      `<path d="M120 0 L156 0 L222 300 L176 300 Z" fill="#fff6c8" opacity=".07"/><path d="M280 0 L300 0 L330 300 L300 300 Z" fill="#fff6c8" opacity=".05"/>` +
      [20, 70, 150, 240, 330, 380].map(x => `<rect x="${x}" y="40" width="7" height="130" fill="#3a2e24"/>`).join('') +
      `<rect y="160" width="400" height="140" fill="#4f3b2a"/>` +
      Array.from({ length: 70 }, () => {
        const x = rnd() * 400, y = 164 + rnd() * 134, c = ['#6e4f33', '#85613b', '#5e4129'][Math.floor(rnd() * 3)];
        return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(2.5 + (y - 160) / 40).toFixed(1)}" ry="${(1.2 + (y - 160) / 90).toFixed(1)}" fill="${c}"/>`;
      }).join('') +
      [[45, 26], [118, 22], [272, 26], [352, 20]].map(([x, w]) => `<rect x="${x - w / 2}" y="0" width="${w}" height="175" fill="#5b4330"/><path d="M${x - w / 2} 175 q-10 6 -16 6 M${x + w / 2} 175 q10 6 16 6" stroke="#5b4330" stroke-width="7" fill="none"/>` +
        `<path d="M${x - w / 2} 150 q${w / 2} -8 ${w} 0 v25 h-${w} z" fill="#5e8f3e" opacity=".8"/>`).join('') +
      `<rect y="-60" width="400" height="66" fill="#24502b"/><path d="M0 0 H400 V58 C360 86 320 70 290 82 C250 98 210 76 170 88 C130 100 90 78 50 92 C30 98 10 90 0 84 Z" fill="#24502b"/>` +
      `<circle cx="70" cy="36" r="46" fill="#2c5f33"/><circle cx="190" cy="30" r="54" fill="#285a30"/><circle cx="320" cy="34" r="50" fill="#2c5f33"/><circle cx="250" cy="58" r="30" fill="#356b3b"/><circle cx="130" cy="62" r="28" fill="#356b3b"/>` +
      [[80, 196], [196, 202], [312, 192], [150, 262], [360, 258]].map(([x, y]) => `<path d="M${x} ${y} q-14 -16 -26 -16 M${x} ${y} q-2 -22 -1 -30 M${x} ${y} q14 -16 26 -16 M${x} ${y} q-8 -20 -16 -26 M${x} ${y} q8 -20 16 -26" stroke="#4c8a3c" stroke-width="3.2" fill="none" stroke-linecap="round"/>`).join('') +
      [[24, 232], [250, 284], [380, 214]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="22" ry="7" fill="#5e8f3e"/>`).join(''),
    pond: (u, rnd) => sky(u, '#b9dbf2', '#e6f2fa') + sun(334, 18, 18) +
      `<path d="M140 150 C160 132 190 130 210 140 C232 124 262 128 280 142 C300 132 330 134 352 148 L400 150 V152 H140 Z" fill="#6f9f5b"/>` +
      `<rect y="150" width="400" height="150" fill="#7f9a4f"/>` +
      `<ellipse cx="290" cy="180" rx="150" ry="28" fill="#5f9cc4"/><ellipse cx="290" cy="176" rx="140" ry="20" fill="#6aa8cf"/>` +
      `<path d="M220 178 q14 -4 28 0 M300 186 q16 -4 32 0 M330 170 q12 -3 24 0" stroke="#a9d0ea" stroke-width="2" fill="none" stroke-linecap="round"/>` +
      `<path d="M0 214 C60 200 120 206 160 198 C150 230 80 250 0 254 Z" fill="#6d6a44" opacity=".55"/>` +
      `<rect x="44" y="60" width="16" height="100" fill="#5e4129"/>` +
      `<ellipse cx="52" cy="58" rx="62" ry="38" fill="#7aa64e"/>` +
      Array.from({ length: 16 }, (_, i) => {
        const x = -6 + i * 7.5;
        return `<path d="M${x} 60 q4 40 ${(i % 2 ? 3 : -2)} ${70 + (i % 3) * 14}" stroke="#6f9f4a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
      }).join('') +
      `<path d="M0 214 C40 206 100 212 160 206 L170 300 H0 Z" fill="#000" opacity=".08"/>` +
      Array.from({ length: 26 }, () => {
        const x = 150 + rnd() * 250, y = 156 + rnd() * 52, h = 18 + rnd() * 20;
        return `<path d="M${x.toFixed(1)} ${y.toFixed(1)} l${(rnd() * 4 - 2).toFixed(1)} ${(-h).toFixed(1)}" stroke="${rnd() < 0.5 ? '#3f6e2e' : '#4d7f37'}" stroke-width="2" stroke-linecap="round"/>`;
      }).join('') +
      [[180, 150], [236, 156], [372, 152]].map(([x, y]) => `<path d="M${x} ${y + 30} l1 -30" stroke="#4f9442" stroke-width="2"/><ellipse cx="${x + 1}" cy="${y}" rx="4" ry="3" fill="#f3c623"/>`).join('') +
      grassStrokes(rnd, 50, 200, 300, ['#6c8c40', '#7f9f4c'], 10)
  };

  // Instrument planté dans la zone : écran à cristaux liquides, valeur et unité.
  const INSTR_X = { thermo: 75, lux: 200, hygro: 325 };

  function fmtDisp(f, v) {
    if (f === 'temp') return v.toFixed(1);
    if (f === 'lux') return fmtLux(Math.round(v / (v >= 10000 ? 100 : 10)) * (v >= 10000 ? 100 : 10));
    return String(Math.round(v));
  }

  function instrumentSVG(kind, value) {
    const x = INSTR_X[kind], top = 106, f = INSTR[kind];
    const sensor = {
      thermo: `<rect x="${x - 4}" y="${top - 30}" width="8" height="34" rx="4" fill="#d3dae0" stroke="#5d6b78" stroke-width="1.2"/><circle cx="${x}" cy="${top - 26}" r="5" fill="#d94a4a"/>`,
      lux: `<path d="M${x - 18} ${top + 1} A18 15 0 0 1 ${x + 18} ${top + 1} Z" fill="#ffffff" stroke="#5d6b78" stroke-width="1.4"/><path d="M${x - 18} ${top + 1} H${x + 18}" stroke="#f0b400" stroke-width="2.6"/>`,
      hygro: `<rect x="${x - 21}" y="${top - 13}" width="42" height="15" rx="4" fill="#8cc0e2" stroke="#5d6b78" stroke-width="1.2"/>` +
        [-13, -6.5, 0, 6.5, 13].map(d => `<path d="M${x + d} ${top - 9.5} V${top - 2}" stroke="#3f7fae" stroke-width="1.8" stroke-linecap="round"/>`).join('')
    }[kind];
    return `<g class="zn-instr" data-instr="${kind}">` +
      `<ellipse cx="${x}" cy="216" rx="11" ry="2.8" fill="#000" opacity=".22"/>` +
      `<path d="M${x} 215 V${top + 70}" stroke="#8a6a44" stroke-width="4.5" stroke-linecap="round"/>` + sensor +
      `<rect x="${x - 36}" y="${top}" width="72" height="74" rx="11" fill="#f4f6f8" stroke="#5d6b78" stroke-width="1.6"/>` +
      `<rect x="${x - 30}" y="${top + 8}" width="60" height="38" rx="4" fill="#d6e5c3" stroke="#3d4a3a" stroke-width="1"/>` +
      `<text x="${x + 25}" y="${top + 30}" text-anchor="end" class="zn-lcd" data-disp="${kind}">${fmtDisp(f, value)}</text>` +
      `<text x="${x + 25}" y="${top + 41}" text-anchor="end" class="zn-lcd-unit">${UNIT[f]}</text>` +
      `<circle cx="${x - 13}" cy="${top + 60}" r="4.5" fill="#9aa6b1"/><circle cx="${x + 13}" cy="${top + 60}" r="4.5" fill="#9aa6b1"/></g>`;
  }

  // Carré posé devant, en perspective ; le toucher ouvre la vue de dessus.
  function quadratInScene(Z) {
    const tag = state.counted[Z].length ? `${LABELS.tools.quadrat} ✓` : LABELS.tapToCount;
    const pts = '120,240 280,240 308,292 92,292';
    return `<g class="zn-q-open" data-open-quadrat>` +
      `<polygon points="${pts}" fill="#ffffff" fill-opacity=".14"/>` +
      `<polygon points="${pts}" fill="none" stroke="#f4f4ef" stroke-width="6" stroke-linejoin="round"/>` +
      `<polygon points="${pts}" fill="none" stroke="#7d877d" stroke-width="1" stroke-linejoin="round"/>` +
      `<path d="M200 240 L200 292 M106 266 L294 266" stroke="#f4f4ef" stroke-width="1.6" opacity=".9"/>` +
      `<g transform="translate(200 266)"><rect x="-50" y="-11" width="100" height="22" rx="11" fill="#ffffff" fill-opacity=".92"/>` +
      `<text class="zn-q-tag" text-anchor="middle" y="4.5">${escapeHtml(tag)}</text></g></g>`;
  }

  function sceneSVG(Z, opts) {
    const o = opts || {};
    const zone = zoneOf(Z);
    const u = `zns${++svgUid}`;
    // Ciel agrandi vers le haut dans le labo (la place est là) ; vignette cadrée sur le sol.
    let out = `<svg class="zn-scene-svg" viewBox="${o.mini ? '0 0 400 300' : '0 -60 400 360'}" preserveAspectRatio="xMidYMid slice" ${o.mini ? 'aria-hidden="true" focusable="false"' : ''}>` +
      SCENES[zone.key](u, mulberry32(seedFrom(zone.seed + 'scene')));
    if (!o.mini) {
      ['thermo', 'lux', 'hygro'].forEach(k => {
        if (state.placed[k] === Z) out += instrumentSVG(k, zone.values[INSTR[k]]);
      });
      if (state.quadrat[Z]) out += quadratInScene(Z);
    }
    return out + `</svg>`;
  }

  /* ===== Vue de dessus du carré (400 × 400) ===== */
  const GROUNDS = {
    meadow: { base: '#93c25e', strokes: ['#7db04a', '#a7d06f', '#6c9f3e'], n: 260, litter: 0, litterC: [] },
    edge: { base: '#8aa957', strokes: ['#759a45', '#9cbd63'], n: 150, litter: 30, litterC: ['#9b7a4b', '#b08d58', '#8a6a3c'] },
    shade: { base: '#5a4330', strokes: [], n: 0, litter: 150, litterC: ['#6f4f33', '#86613a', '#5e4129', '#9a7346'] },
    pond: { base: '#6f6c45', strokes: ['#5f7d3a', '#7a9447'], n: 90, litter: 12, litterC: ['#55513a', '#7d7550'], puddles: true }
  };

  function groundSVG(Z) {
    const zone = zoneOf(Z);
    const G = GROUNDS[zone.key];
    const rnd = mulberry32(seedFrom(zone.seed + 'ground'));
    let s = `<rect width="400" height="400" fill="${G.base}"/>`;
    if (G.puddles) {
      [[90, 300, 46, 20], [300, 90, 38, 16], [250, 330, 30, 12]].forEach(([x, y, rx, ry]) => {
        s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#5a7f94" opacity=".55"/><ellipse cx="${x - rx * 0.3}" cy="${y - ry * 0.3}" rx="${rx * 0.4}" ry="${ry * 0.25}" fill="#a9cde2" opacity=".35"/>`;
      });
    }
    for (let i = 0; i < G.litter; i++) {
      const x = rnd() * 400, y = rnd() * 400, a = Math.floor(rnd() * 180);
      s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(5 + rnd() * 5).toFixed(1)}" ry="${(2.5 + rnd() * 2).toFixed(1)}" fill="${G.litterC[i % G.litterC.length]}" transform="rotate(${a} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    }
    for (let i = 0; i < G.n; i++) {
      const x = rnd() * 400, y = rnd() * 400, a = rnd() * 6.283, l = 4 + rnd() * 6;
      s += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} l${(Math.cos(a) * l).toFixed(1)} ${(Math.sin(a) * l).toFixed(1)}" stroke="${G.strokes[i % G.strokes.length]}" stroke-width="1.3" stroke-linecap="round"/>`;
    }
    return s;
  }

  // Cadre du carré (tube blanc) et ficelles qui le partagent en quatre.
  const QUADRAT_FRAME = '<path d="M200 12 V388 M12 200 H388" stroke="#f7f7f2" stroke-width="1.6" opacity=".85"/>' +
    '<rect x="8" y="8" width="384" height="384" fill="none" stroke="#f7f7f2" stroke-width="10"/>' +
    '<rect x="3" y="3" width="394" height="394" fill="none" stroke="#8d968d" stroke-width="1.2"/><rect x="13" y="13" width="374" height="374" fill="none" stroke="#8d968d" stroke-width="1.2"/>' +
    [[3, 3], [377, 3], [3, 377], [377, 377]].map(([x, y]) => `<rect x="${x}" y="${y}" width="20" height="20" rx="3" fill="#dfe3df" stroke="#8d968d" stroke-width="1"/>`).join('');

  function itemDrawing(Z, it) {
    return T[it.t].draw(mulberry32(seedFrom(zoneOf(Z).seed + it.uid)));
  }

  function itemMarkup(Z, it) {
    const t = T[it.t];
    const counted = state.counted[Z].includes(it.uid);
    const hr = hitR(it.t);
    const body = t.move ? `<g>${itemDrawing(Z, it)}${MOVES[t.move]}</g>` : itemDrawing(Z, it);
    return `<g class="zn-it ${counted ? 'is-counted' : ''}" data-uid="${it.uid}" transform="translate(${it.x} ${it.y})" tabindex="0" role="button" aria-pressed="${counted}" aria-label="${escapeHtml(t.name)}">` +
      `<g transform="rotate(${it.rot})">${body}</g>` +
      `<circle class="zn-it-ring" r="${hr}" fill="none"/>` +
      `<circle class="zn-it-hit" r="${hr}" fill="transparent"/>` +
      `<g class="zn-it-tick" transform="translate(${(hr * 0.72).toFixed(1)} ${(-hr * 0.72).toFixed(1)})"><circle r="6.5" fill="#1d9a6c" stroke="#ffffff" stroke-width="1.5"/>` +
      `<path d="M-3 .2 L-.8 2.4 L3.2 -2.2" stroke="#ffffff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
  }

  function quadratSVG(Z) {
    const items = zoneOf(Z).items.slice().sort((a, b) => T[a.t].layer - T[b.t].layer);
    return `<svg class="zn-quadrat" data-quadrat viewBox="0 0 400 400" role="group" aria-label="${escapeHtml(plain(LABELS.quadratHead(Z)))}">` +
      groundSVG(Z) + QUADRAT_FRAME + items.map(it => itemMarkup(Z, it)).join('') + `</svg>`;
  }

  // Petit portrait d'une espèce (fiche, liste de comptage).
  function iconSVG(t, cls) {
    return `<svg class="${cls || 'zn-ic'}" viewBox="-24 -24 48 48" aria-hidden="true" focusable="false">${T[t].draw(mulberry32(seedFrom(t)))}</svg>`;
  }

  /* ===== Icônes des outils ===== */
  const TOOL_ICON = {
    thermo: '<svg class="zn-tool-ic" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><rect x="18.5" y="1.5" width="4" height="17" rx="2" fill="#d3dae0" stroke="#5d6b78" stroke-width="1"/><circle cx="20.5" cy="4" r="2.6" fill="#d94a4a"/><rect x="8.5" y="16" width="24" height="22" rx="5" fill="#f4f6f8" stroke="#5d6b78" stroke-width="1.6"/><rect x="11.5" y="19.5" width="18" height="9" rx="1.5" fill="#d6e5c3" stroke="#3d4a3a" stroke-width=".8"/><circle cx="16" cy="33" r="1.7" fill="#9aa6b1"/><circle cx="25" cy="33" r="1.7" fill="#9aa6b1"/></svg>',
    lux: '<svg class="zn-tool-ic" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M20.5 1.5 V4.5 M10.5 5 L12.5 7 M30.5 5 L28.5 7" stroke="#f0a400" stroke-width="2" stroke-linecap="round"/><path d="M10.5 16 A10 8.5 0 0 1 30.5 16 Z" fill="#ffffff" stroke="#5d6b78" stroke-width="1.4"/><path d="M10.5 16 H30.5" stroke="#f0b400" stroke-width="2"/><rect x="8.5" y="16" width="24" height="22" rx="5" fill="#f4f6f8" stroke="#5d6b78" stroke-width="1.6"/><rect x="11.5" y="19.5" width="18" height="9" rx="1.5" fill="#d6e5c3" stroke="#3d4a3a" stroke-width=".8"/><circle cx="16" cy="33" r="1.7" fill="#9aa6b1"/><circle cx="25" cy="33" r="1.7" fill="#9aa6b1"/></svg>',
    hygro: '<svg class="zn-tool-ic" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M20.5 .8 C22.6 4 23.6 5.4 23.6 6.8 A3.1 3.1 0 0 1 17.4 6.8 C17.4 5.4 18.4 4 20.5 .8 Z" fill="#4b9fdb"/><rect x="11" y="10" width="19" height="7" rx="2" fill="#8cc0e2" stroke="#5d6b78" stroke-width="1"/><path d="M15 11.5 V15.5 M18.5 11.5 V15.5 M22 11.5 V15.5 M25.5 11.5 V15.5" stroke="#3f7fae" stroke-width="1.2"/><rect x="8.5" y="16" width="24" height="22" rx="5" fill="#f4f6f8" stroke="#5d6b78" stroke-width="1.6"/><rect x="11.5" y="19.5" width="18" height="9" rx="1.5" fill="#d6e5c3" stroke="#3d4a3a" stroke-width=".8"/><circle cx="16" cy="33" r="1.7" fill="#9aa6b1"/><circle cx="25" cy="33" r="1.7" fill="#9aa6b1"/></svg>',
    hand: '<svg class="zn-tool-ic" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M4 37 C10 33.5 26 33.5 36 37" stroke="#7a5634" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M15 33 C11 30 8 25 7 21 C6.4 19 8.8 17.8 10 19.6 L13 24 V5.5 C13 3.4 16.4 3.4 16.4 5.5 V17 V14 C16.4 12 19.8 12 19.8 14 V18 V15.5 C19.8 13.5 23.2 13.5 23.2 15.5 V19 V17.5 C23.2 15.6 26.6 15.6 26.6 17.5 V25 C26.6 29 24.5 32 23 33 Z" fill="#f1c9a5" stroke="#b98a63" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    quadrat: '<svg class="zn-tool-ic" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><rect x="5" y="5" width="30" height="30" fill="#a8d08d"/><path d="M20 6 V34 M6 20 H34" stroke="#ffffff" stroke-width="1"/><path d="M11 14 l-3 -4 M11 14 l0 -5 M11 14 l3 -4 M27 29 l-3 -4 M27 29 l0 -5 M27 29 l3 -4" stroke="#4f8a2e" stroke-width="1.6" stroke-linecap="round"/><circle cx="27" cy="12" r="2.6" fill="#ffffff"/><circle cx="27" cy="12" r="1.1" fill="#f6c429"/><rect x="5" y="5" width="30" height="30" fill="none" stroke="#f7f7f2" stroke-width="4"/><rect x="3" y="3" width="34" height="34" fill="none" stroke="#8d968d" stroke-width="1"/></svg>'
  };

  const VIEW_ICON = {
    field: '<svg class="zn-view-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 21 V14 M17 21 V12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="7" cy="10" r="5" fill="currentColor"/><circle cx="17" cy="8" r="5.5" fill="currentColor"/><path d="M2 21 H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    graph: '<svg class="zn-view-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 3 V21 H21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="6" y="11" width="3.5" height="8" fill="currentColor"/><rect x="11" y="6" width="3.5" height="13" fill="currentColor"/><rect x="16" y="13" width="3.5" height="6" fill="currentColor"/></svg>'
  };

  /* ===== Étape 1 : hypothèse ===== */
  const letter = Z => `<span class="zn-letter is-${Z}">${Z}</span>`;

  function chip(attr, key, value, label, selected) {
    return `<button type="button" class="lab-choice zn-chip ${selected ? 'is-selected' : ''}" data-${attr}="${key}:${value}" aria-pressed="${selected}">${label}</button>`;
  }

  function zoneChips(attr, key, current) {
    return `<span class="zn-chips">` + ['A', 'B', 'same'].map(v =>
      chip(attr, key, v, v === 'same' ? LABELS.same : LABELS.zone(v), current === v)).join('') + `</span>`;
  }

  function renderPredict() {
    const h = state.hypothesis;
    const show = lab.state.showMissing;
    const places = ZONES.map(Z => `<div class="zn-place">${sceneSVG(Z, { mini: true })}<span class="zn-place-name">${letter(Z)}<strong>${LABELS.zone(Z)}</strong><small>${gloss(habitatName(Z))}</small></span></div>`)
      .join(`<span class="zn-apart" aria-hidden="true"><span>←</span>${LABELS.apart}<span>→</span></span>`);
    const rows = HYP_KEYS.map(k => `<div class="zn-hrow ${show && !h[k] ? 'lab-is-missing' : ''}"><span class="zn-hrow-label">${gloss(LABELS.hypRows[k])}</span>${zoneChips('hyp', k, h[k])}</div>`).join('');

    lab.body.innerHTML = `<div class="zn-predict">` +
      `<div class="zn-question-card">` +
        `<p class="zn-kicker">${LABELS.yourQuestion}</p>` +
        `<p class="zn-question">${gloss(LABELS.question)}</p>` +
        `<p class="zn-kicker">${LABELS.yourZones}</p>` +
        `<div class="zn-places">${places}</div>` +
      `</div>` +
      `<div class="zn-hyp-card">` +
        `<p class="zn-kicker">${LABELS.hypothesisTitle}</p>` +
        `<p class="zn-hyp-intro">${LABELS.hypIntro}</p>` +
        `<div class="zn-hrows">${rows}</div>` +
        `<label class="zn-because"><span>${LABELS.because}</span>` +
        `<input type="text" class="lab-input zn-because-input" maxlength="160" placeholder="${LABELS.becausePlaceholder}" value="${escapeHtml(state.because)}" autocomplete="off"></label>` +
      `</div></div>`;

    $$('[data-hyp]').forEach(btn => btn.addEventListener('click', () => {
      const [k, v] = btn.dataset.hyp.split(':');
      state.hypothesis[k] = v;
      if (hypComplete()) lab.state.showMissing = false;
      renderPredict();
      lab.renderStepper();
    }));
    const because = $('.zn-because-input');
    because.addEventListener('input', e => { state.because = e.target.value; });
    // Hypothèse figée dès que le travail de terrain a commencé.
    if (started()) {
      $$('[data-hyp]').forEach(btn => lab.setLock(btn, LABELS.lockHypothesisFixed, { icon: false }));
      because.readOnly = true;
      lab.setLock(because, LABELS.lockHypothesisFixed);
    }

    const ready = hypComplete();
    const info = show && !ready ? lab.footerInfo(lab.L.missingHypothesis, true)
      : lab.footerInfo(ready ? LABELS.hypothesisReady : LABELS.hypothesisPending);
    lab.setFooter(info + `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-next>${LABELS.toExperiment} →</button></div>`);
    const next = $('[data-next]');
    next.addEventListener('click', () => lab.goToStep(2));
    lab.setLock(next, ready ? null : LABELS.lockHypothesis, { missing: true, key: 'next' });
  }

  /* ===== Étape 2 : sur le terrain, puis l'histogramme =====
     Outils : un clic met l'instrument en main (il suit alors la souris), un
     geste sur une zone l'y pose ; on peut aussi le glisser sur la zone. Il
     n'y a qu'un instrument de chaque : le poser dans l'autre zone l'y
     déplace. Une case de la fiche ne s'ouvre qu'une fois l'instrument passé
     par la zone : impossible de deviner. Le carré s'ouvre en vue de dessus,
     où chaque élément touché est compté (ou décompté). L'histogramme se
     construit dans le second onglet, à partir de ce que l'élève a compté. */
  function renderExperiment() {
    if (state.view === 'graph' && !countsDone()) state.view = 'field';
    lab.body.innerHTML = `<div class="zn-run">` +
      `<section class="zn-bench">` +
        `<div class="zn-toolrow"><div class="zn-tools" data-tools></div><div class="zn-views" data-views role="tablist"></div></div>` +
        `<div class="zn-stage" data-stage></div>` +
        `<p class="lab-caption zn-caption" data-caption aria-live="polite"></p>` +
      `</section>` +
      `<aside class="zn-side">` +
        `<div class="zn-panel"><h3 class="lab-panel-title">${LABELS.sheetTitle}</h3><div data-datasheet></div></div>` +
        `<div class="zn-panel zn-count-panel"><h3 class="lab-panel-title">${LABELS.countTitle}<small>${LABELS.countSub}</small></h3><div data-counts></div></div>` +
      `</aside></div>`;

    const tools = $('[data-tools]');
    tools.addEventListener('pointerdown', onToolDown);
    // Clavier : Entrée ou Espace sur un outil (clic sans pointeur).
    tools.addEventListener('click', e => {
      const b = e.target.closest('[data-tool]');
      if (b && e.detail === 0) toolTap(b.dataset.tool);
    });
    $('[data-views]').addEventListener('click', e => {
      const b = e.target.closest('[data-view]');
      if (b) setView(b.dataset.view);
    });
    const sheet = $('[data-datasheet]');
    sheet.addEventListener('change', onSheetChange);
    sheet.addEventListener('input', e => { if (e.target.matches('[data-cell]')) e.target.classList.remove('is-invalid'); });
    sheet.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('[data-cell]')) { e.preventDefault(); e.target.blur(); } });

    renderTools();
    renderViews();
    renderStage();
    renderDatasheet();
    renderCounts();
    setCaption(defaultCaption());

    lab.setFooter(lab.footerInfo('') + `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-ghost" data-conclude>${LABELS.toConclude} →</button></div>`);
    $('[data-conclude]').addEventListener('click', () => lab.goToStep(3));
    renderFooter();
  }

  function setView(v) {
    if (v === state.view || (v === 'field' && state.view === 'quadrat')) {
      if (v === 'field' && state.view === 'quadrat') { state.view = 'field'; renderStage(); renderViews(); setCaption(defaultCaption()); }
      return;
    }
    state.view = v;
    setTool(null);
    renderTools();
    renderViews();
    renderStage();
    setCaption(defaultCaption());
  }

  function defaultCaption() {
    const C = LABELS.caption;
    if (state.view === 'quadrat') return C.quadrat;
    if (state.view === 'graph') return graphDone() ? C.graphDone : C.graph;
    if (state.tool) return C.tool[state.tool];
    if (fieldDone()) return C.fieldDone;
    return C.start;
  }

  function setCaption(text, warn) {
    const c = $('[data-caption]');
    if (!c) return;
    c.innerHTML = `<span>${gloss(text)}</span>`;
    c.classList.toggle('is-warning', !!warn);
  }

  /* --- Outils et onglets --- */
  function renderTools() {
    const box = $('[data-tools]');
    if (!box) return;
    box.hidden = state.view === 'graph';
    box.innerHTML = TOOLS.map(t => {
      const at = state.placed[t];
      return `<button type="button" class="zn-tool ${state.tool === t ? 'is-active' : ''}" data-tool="${t}" aria-pressed="${state.tool === t}">${TOOL_ICON[t]}<span>${LABELS.tools[t]}</span>` +
        (at ? `<span class="zn-tool-at is-${at}" title="${LABELS.toolAt(at)}">${at}</span>` : '') + `</button>`;
    }).join('');
  }

  function renderViews() {
    const box = $('[data-views]');
    if (!box) return;
    const current = state.view === 'graph' ? 'graph' : 'field';
    const ready = fieldDone() && !graphDone() && current === 'field';
    box.innerHTML = ['field', 'graph'].map(v => `<button type="button" role="tab" class="zn-view ${current === v ? 'is-current' : ''} ${v === 'graph' && ready ? 'is-ready' : ''}" data-view="${v}" aria-selected="${current === v}">${VIEW_ICON[v]}<span>${LABELS.views[v]}</span></button>`).join('');
    const g = box.querySelector('[data-view="graph"]');
    if (!countsDone()) lab.setLock(g, LABELS.lockGraph);
    // Ce qui manque est dans l'autre onglet : c'est l'onglet qui est signalé.
    const show = lab.state.showMissing;
    g.classList.toggle('lab-is-missing', show && fieldDone() && !graphDone() && current === 'field');
    box.querySelector('[data-view="field"]').classList.toggle('lab-is-missing', show && !fieldDone() && current === 'graph');
  }

  function setTool(t) {
    state.tool = t;
    renderTools();
    ZONES.forEach(Z => {
      const f = $(`[data-zone="${Z}"]`);
      if (f) f.classList.toggle('has-tool', !!t);
    });
    followTool();
  }

  function toolTap(t) {
    if (state.view !== 'field') {
      state.view = 'field';
      renderViews();
      renderStage();
    }
    const next = state.tool === t ? null : t;
    setTool(next);
    setCaption(next ? LABELS.caption.tool[next] : LABELS.caption.noTool);
  }

  /* Outil en main (choisi d'un simple clic) : il suit la souris comme quand
     on le glisse, jusqu'à ce qu'il serve ou qu'on le repose ; au-dessus des
     zones, il remplace le curseur. Au doigt, rien à suivre : l'outil se pose
     là où on touche la zone. Caché pendant un autre glisser, et dès que les
     outils ne sont plus affichés. */
  let hand = null, handAt = null;   // fantôme de l'outil en main ; dernière position de la souris

  function followTool(e) {
    if (e) handAt = e.pointerType === 'mouse' ? { x: e.clientX, y: e.clientY } : null;
    if (!hand && !(state && state.tool)) return;
    const box = lab && lab.card.isConnected ? $('[data-tools]') : null;
    const t = handAt && state.tool && box && box.getClientRects().length && !document.querySelector('.zn-ghost:not(.zn-hand)') ? state.tool : null;
    if (!t) { if (hand) { hand.remove(); hand = null; } return; }
    const host = document.fullscreenElement || document.body;
    if (!hand || hand.dataset.tool !== t || hand.parentNode !== host) {
      if (hand) hand.remove();
      hand = document.createElement('div');
      hand.className = 'zn-ghost zn-hand';
      hand.dataset.tool = t;
      hand.innerHTML = TOOL_ICON[t].replace('class="zn-tool-ic"', 'class="zn-ghost-tool"');
      host.appendChild(hand);
    }
    hand.style.transform = `translate(${handAt.x}px, ${handAt.y}px) translate(-50%, -50%)`;
  }
  window.addEventListener('pointermove', followTool);
  window.addEventListener('pointerdown', followTool);

  /* Appui sur un outil : toucher le prend en main, glisser le porte sur une
     zone (la zone survolée s'éclaire). */
  function press(e, o) {
    const id = e.pointerId, sx = e.clientX, sy = e.clientY;
    let dragging = false, ghost = null, over = null;
    const setOver = el => {
      if (over === el) return;
      if (over) over.classList.remove('is-over');
      over = el;
      if (over) over.classList.add('is-over');
    };
    const zoneAt = ev => {
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      return el && el.closest ? el.closest('[data-zone]') : null;
    };
    const move = ev => {
      if (ev.pointerId !== id) return;
      if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) {
        dragging = true;
        if (o.onStart) o.onStart();
        ghost = document.createElement('div');
        ghost.className = 'zn-ghost';
        ghost.innerHTML = o.ghost;
        (document.fullscreenElement || document.body).appendChild(ghost);
        followTool();
      }
      if (!dragging) return;
      ghost.style.transform = `translate(${ev.clientX}px, ${ev.clientY}px) translate(-50%, -50%)`;
      setOver(zoneAt(ev));
    };
    const up = ev => {
      if (ev.pointerId !== id) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      setOver(null);
      if (ghost) ghost.remove();
      if (!dragging) { if (ev.type === 'pointerup' && o.onTap) o.onTap(ev); return; }
      if (ev.type === 'pointerup' && o.onDrop) o.onDrop(zoneAt(ev));
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  function onToolDown(e) {
    const b = e.target.closest('[data-tool]');
    if (!b || e.button !== 0) return;
    e.preventDefault();
    const t = b.dataset.tool;
    press(e, {
      ghost: TOOL_ICON[t].replace('class="zn-tool-ic"', 'class="zn-ghost-tool"'),
      onStart: () => { if (state.tool) setTool(null); },
      onTap: ev => { toolTap(t); followTool(ev); },
      onDrop: zone => { if (zone) applyTool(t, zone.dataset.zone); }
    });
  }

  /* Un outil posé dans une zone. */
  function applyTool(t, Z) {
    setTool(null);
    if (state.view !== 'field') state.view = 'field';
    if (t === 'quadrat') { openQuadrat(Z); return; }
    if (t === 'hand') {
      state.measured[Z].soil = true;
      state.feelOpen[Z] = true;
      renderStage();
      renderDatasheet();
      setCaption(LABELS.caption.felt(Z));
      renderFooter();
      return;
    }
    const f = INSTR[t];
    state.placed[t] = Z;
    state.measured[Z][f] = true;
    renderTools();
    renderStage();
    renderDatasheet();
    animateDisplay(t, Z);
    setCaption(LABELS.caption.measured[t](Z));
    renderFooter();
    const input = $(`[data-cell="${Z}:${f}"]`);
    if (input && state.table[Z][f] == null) input.focus({ preventScroll: true });
  }

  // L'écran de l'instrument monte jusqu'à sa valeur (le thermomètre prend son temps).
  function animateDisplay(t, Z) {
    const el = $(`[data-zone="${Z}"] [data-disp="${t}"]`);
    if (!el) return;
    const f = INSTR[t];
    const v = zoneOf(Z).values[f];
    const start = { temp: 20, lux: 0, air: 50 }[f];
    const token = lab.newScene();
    lab.tween(token, f === 'temp' ? 1400 : 900, k => { el.textContent = fmtDisp(f, start + (v - start) * k); }, ease.out)
      .then(() => { if (el.isConnected) el.textContent = fmtDisp(f, v); });
  }

  function openQuadrat(Z) {
    state.quadrat[Z] = true;
    state.view = 'quadrat';
    state.qz = Z;
    state.lastItem = null;
    renderViews();
    renderStage();
    setCaption(LABELS.caption.quadrat);
    renderFooter();
  }

  /* --- Scène : les deux zones, ou le carré vu de dessus, ou l'histogramme --- */
  const STATUS_ICON = {
    temp: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3 a2.6 2.6 0 0 1 2.6 2.6 V13.5 a4.6 4.6 0 1 1 -5.2 0 V5.6 A2.6 2.6 0 0 1 12 3 Z" fill="currentColor"/></svg>',
    lux: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4.6" fill="currentColor"/><path d="M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M4.9 4.9 L7 7 M17 17 L19.1 19.1 M4.9 19.1 L7 17 M17 7 L19.1 4.9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    air: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3 C15 7.5 18 10.5 18 14.2 A6 6 0 0 1 6 14.2 C6 10.5 9 7.5 12 3 Z" fill="currentColor"/></svg>',
    soil: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8.5 21 C6 19 4.5 16.5 4 14.5 C3.7 13.4 5.1 12.7 5.8 13.7 L7.5 16 V5 C7.5 3.6 9.7 3.6 9.7 5 V12 V10.5 C9.7 9.2 11.9 9.2 11.9 10.5 V12.5 V11.5 C11.9 10.2 14.1 10.2 14.1 11.5 V13 V12.4 C14.1 11.2 16.3 11.2 16.3 12.4 V16.5 C16.3 19 15 20.6 14 21 Z" fill="currentColor"/></svg>',
    count: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M12 4 V20 M4 12 H20" stroke="currentColor" stroke-width="1.3"/></svg>'
  };

  function zoneStatus(Z) {
    const m = state.measured[Z];
    const done = { temp: m.temp, lux: m.lux, air: m.air, soil: m.soil, count: state.counted[Z].length > 0 };
    const titles = { temp: LABELS.tools.thermo, lux: LABELS.tools.lux, air: LABELS.tools.hygro, soil: LABELS.tools.hand, count: LABELS.tools.quadrat };
    return `<span class="zn-status">` + Object.keys(done).map(k => `<i class="${done[k] ? 'is-done' : ''}" title="${titles[k]}">${STATUS_ICON[k]}</i>`).join('') + `</span>`;
  }

  function renderStage() {
    const box = $('[data-stage]');
    if (!box) return;
    box.className = `zn-stage is-${state.view}`;
    if (state.view === 'quadrat') renderQuadratStage(box);
    else if (state.view === 'graph') renderGraphStage(box);
    else renderFieldStage(box);
  }

  function renderFieldStage(box) {
    const show = lab.state.showMissing;
    box.innerHTML = `<div class="zn-zones">` + ZONES.map(Z => {
      const incomplete = FACTORS.some(f => state.table[Z][f] == null) || !state.counted[Z].length;
      return `<div class="zn-zone ${state.tool ? 'has-tool' : ''} ${show && incomplete ? 'lab-is-missing' : ''}" data-zone="${Z}" tabindex="0" role="button" aria-label="${LABELS.zone(Z)}">` +
        `<div class="zn-zone-head">${letter(Z)}<strong>${LABELS.zone(Z)}</strong><span class="zn-zone-name">${gloss(habitatName(Z))}</span>${zoneStatus(Z)}</div>` +
        `<div class="zn-scene">${sceneSVG(Z)}${feelBubble(Z)}</div></div>`;
    }).join(`<div class="zn-apart-v" aria-hidden="true"><span>←</span>${LABELS.apart}<span>→</span></div>`) + `</div>`;
    $$('[data-zone]').forEach(el => {
      el.addEventListener('click', e => onZoneClick(e, el.dataset.zone));
      el.addEventListener('keydown', e => {
        if (e.target !== el || (e.key !== 'Enter' && e.key !== ' ')) return;
        e.preventDefault();
        onZoneClick(e, el.dataset.zone);
      });
    });
  }

  function feelBubble(Z) {
    if (!state.feelOpen[Z]) return '';
    return `<div class="zn-feel" aria-live="polite">${TOOL_ICON.hand}<p>${gloss(LABELS.feel[zoneOf(Z).values.soil])}<br><b>${LABELS.feelNote}</b></p></div>`;
  }

  function onZoneClick(e, Z) {
    if (state.tool) { applyTool(state.tool, Z); return; }
    if (state.quadrat[Z] && e.target.closest && e.target.closest('[data-open-quadrat]')) { openQuadrat(Z); return; }
    setCaption(state.quadrat[Z] ? LABELS.caption.quadratOpen(Z) : LABELS.caption.noTool);
  }

  function renderQuadratStage(box) {
    const Z = state.qz;
    box.innerHTML = `<div class="zn-qview">` +
      `<div class="zn-qhead"><button type="button" class="lab-btn lab-btn-ghost zn-back" data-back>← ${LABELS.backToZones}</button>` +
      `${letter(Z)}<span class="zn-qtitle">${gloss(LABELS.quadratHead(Z))}</span></div>` +
      `<div class="zn-qbody"><div class="zn-qframe">${quadratSVG(Z)}</div><div class="zn-idcard" data-idcard aria-live="polite"></div></div></div>`;
    $('[data-back]').addEventListener('click', () => setView('field'));
    const svg = $('[data-quadrat]');
    svg.addEventListener('click', e => {
      const g = e.target.closest('[data-uid]');
      if (g) toggleItem(Z, g.dataset.uid);
    });
    svg.addEventListener('keydown', e => {
      const g = e.target.closest('[data-uid]');
      if (!g || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      toggleItem(Z, g.dataset.uid);
    });
    renderIdCard();
  }

  // Toucher un élément du carré : compté, ou décompté s'il l'était déjà.
  function toggleItem(Z, uid) {
    const list = state.counted[Z];
    const i = list.indexOf(uid);
    if (i >= 0) list.splice(i, 1);
    else list.push(uid);
    state.lastItem = uid;
    const counted = i < 0;
    const g = $(`[data-quadrat] [data-uid="${uid}"]`);
    if (g) {
      g.classList.toggle('is-counted', counted);
      g.setAttribute('aria-pressed', String(counted));
    }
    const it = itemOf(Z, uid);
    setCaption(counted ? LABELS.caption.counted(T[it.t].name, tally(Z)[it.t], Z) : LABELS.caption.uncounted(T[it.t].name));
    renderIdCard();
    renderCounts();
    updateSpecies();
    renderViews();
    renderFooter();
  }

  function renderIdCard() {
    const box = $('[data-idcard]');
    if (!box) return;
    const Z = state.qz;
    const it = state.lastItem ? itemOf(Z, state.lastItem) : null;
    if (!it) {
      box.className = 'zn-idcard is-empty';
      box.innerHTML = `<div class="zn-id-pic">${TOOL_ICON.quadrat}</div><p>${gloss(LABELS.idEmpty)}</p>`;
      return;
    }
    const counted = state.counted[Z].includes(it.uid);
    box.className = 'zn-idcard';
    box.innerHTML = `<div class="zn-id-pic">${iconSVG(it.t, 'zn-id-ic')}</div>` +
      `<p class="zn-id-name">${gloss(`[${T[it.t].name}]`)}</p>` +
      `<p class="zn-id-cap">${gloss(T[it.t].cap)}</p>` +
      `<p class="zn-id-state ${counted ? 'is-counted' : ''}">${counted ? LABELS.idCounted(tally(Z)[it.t]) : LABELS.idRemoved}</p>`;
  }

  /* --- Fiche de terrain : une colonne par zone, comme la fiche papier
     retournée (la place manque pour cinq colonnes). --- */
  function cellHTML(Z, f) {
    const label = LABELS.cellLabel(Z, f);
    const show = lab.state.showMissing;
    const v = state.table[Z][f];
    if (!state.measured[Z][f]) {
      return `<button type="button" class="zn-cell-wait ${show ? 'lab-is-missing' : ''}" data-wait="${Z}:${f}" aria-label="${label}"></button>`;
    }
    if (f === 'soil') {
      return `<select class="lab-select zn-soil ${state.feelOpen[Z] && !v ? 'is-asking' : ''} ${show && !v ? 'lab-is-missing' : ''}" data-soil="${Z}" aria-label="${label}">` +
        `<option value="">${LABELS.choose}</option>` +
        ['dry', 'moist', 'wet'].map(w => `<option value="${w}" ${v === w ? 'selected' : ''}>${LABELS.soilWords[w]}</option>`).join('') + `</select>`;
    }
    return `<input type="text" inputmode="decimal" class="zn-cell-input ${show && v == null ? 'lab-is-missing' : ''}" data-cell="${Z}:${f}" value="${v == null ? '' : fmtValue(f, v)}" maxlength="8" autocomplete="off" spellcheck="false" aria-label="${label}">`;
  }

  function speciesCount(Z) {
    return state.counted[Z].length ? String(tallyOrder(Z).length) : '—';
  }

  function renderDatasheet() {
    const box = $('[data-datasheet]');
    if (!box) return;
    box.innerHTML = `<table class="zn-data"><thead><tr><th scope="col"></th>` +
      ZONES.map(Z => `<th scope="col"><span class="zn-th-zone">${letter(Z)}${LABELS.zone(Z)}</span></th>`).join('') + `</tr></thead><tbody>` +
      FACTORS.map(f => `<tr><th scope="row">${LABELS.factors[f]}<small>${LABELS.units[f]}</small></th>${ZONES.map(Z => `<td>${cellHTML(Z, f)}</td>`).join('')}</tr>`).join('') +
      `<tr class="zn-species-row"><th scope="row">${LABELS.factors.species}<small>${LABELS.units.species}</small></th>${ZONES.map(Z => `<td data-species="${Z}">${speciesCount(Z)}</td>`).join('')}</tr>` +
      `</tbody></table>`;
    box.querySelectorAll('[data-wait]').forEach(b => {
      const [Z, f] = b.dataset.wait.split(':');
      lab.setLock(b, LABELS.lockCell[f](Z));
    });
  }

  function updateSpecies() {
    ZONES.forEach(Z => { const td = $(`[data-species="${Z}"]`); if (td) td.textContent = speciesCount(Z); });
  }

  function onSheetChange(e) {
    const el = e.target;
    if (el.matches('[data-soil]')) {
      const Z = el.dataset.soil;
      state.table[Z].soil = el.value || null;
      if (el.value) state.feelOpen[Z] = false;
      el.classList.remove('is-asking', 'lab-is-missing');
      const bubble = $(`[data-zone="${Z}"] .zn-feel`);
      if (bubble && el.value) bubble.remove();
      afterRecord();
      return;
    }
    if (!el.matches('[data-cell]')) return;
    const [Z, f] = el.dataset.cell.split(':');
    const raw = el.value.trim();
    if (raw === '') { state.table[Z][f] = null; afterRecord(); return; }
    const v = parseValue(f, raw);
    if (Number.isNaN(v)) {
      el.classList.add('is-invalid');
      state.table[Z][f] = null;
      afterRecord();
      setCaption(LABELS.caption.bad[f], true);
      return;
    }
    state.table[Z][f] = v;
    el.value = fmtValue(f, v);
    el.classList.remove('lab-is-missing');
    afterRecord();
  }

  // Après une saisie : rien n'est reconstruit (la saisie se valide souvent
  // quand l'élève touche déjà autre chose, et ce geste ne doit pas être coupé).
  function afterRecord() {
    renderViews();
    renderFooter();
    if (state.view === 'field' && !state.tool) setCaption(defaultCaption());
  }

  /* --- Comptage : ce que l'élève a compté dans chaque carré --- */
  function renderCounts() {
    const box = $('[data-counts]');
    if (!box) return;
    box.innerHTML = `<div class="zn-counts">` + ZONES.map(Z => {
      const c = tally(Z);
      const order = tallyOrder(Z);
      const rows = order.map(t => `<li>${iconSVG(t)}<span class="zn-count-name">${gloss(`[${T[t].name}]`)}</span><b>${c[t]}</b></li>`).join('');
      const missing = lab.state.showMissing && !order.length;
      return `<section class="zn-count-col ${missing ? 'lab-is-missing' : ''}"><h4>${letter(Z)}${LABELS.zone(Z)}<small>${order.length ? LABELS.nSpecies(order.length) : ''}</small></h4>` +
        (order.length ? `<ul>${rows}</ul>` : `<p class="zn-count-empty">${LABELS.notCounted}</p>`) + `</section>`;
    }).join('') + `</div>`;
  }

  /* --- Pied de page --- */
  let stepperDone = null;

  function renderFooter() {
    const info = $('.lab-footer .lab-footer-info');
    if (info) info.textContent = LABELS.infoField(valuesWritten(), quadratsCounted());
    const reason = missingReason();
    const done = !reason;
    if (done && lab.state.showMissing) lab.state.showMissing = false;
    const btn = $('[data-conclude]');
    if (btn) {
      btn.classList.toggle('lab-btn-primary', done);
      btn.classList.toggle('lab-btn-ghost', !done);
      lab.setLock(btn, reason, { missing: true, key: 'conclude' });
    }
    // La barre d'étapes ne change que quand l'expérience devient complète.
    if (done !== stepperDone) { stepperDone = done; lab.renderStepper(); }
  }

  /* ===== L'histogramme (fiche outil FO5b) =====
     Une catégorie par espèce comptée, deux bâtons (zone A, zone B hachurée).
     10 carreaux de haut ; l'élève choisit ce que vaut un carreau, nomme les
     axes, puis monte chaque bâton (glisser, ou toucher à la bonne hauteur ;
     flèches au clavier). Le titre est donné. */
  const C_EDIT = { W: 720, H: 330, L: 62, R: 18, T: 14, B: 70 };
  // Lecture (conclusion, correction) : affiché plus petit, donc écrit plus gros
  // (voir .zn-chart.is-read), avec plus de place pour les noms d'espèces.
  const C_READ = { W: 720, H: 360, L: 70, R: 18, T: 14, B: 96 };

  function chartSVG(o) {
    const mode = o.mode;
    const C = mode === 'read' ? C_READ : C_EDIT;
    const g = state.graph;
    const cats = categories();
    const step = g.step;
    const ph = C.H - C.T - C.B, sq = ph / 10, y0 = C.H - C.B;
    const n = Math.max(1, cats.length), gw = (C.W - C.L - C.R) / n;
    const bw = Math.min(26, gw * 0.34);
    const hid = `znh${++svgUid}`;
    let out = `<svg class="zn-chart is-${mode}" data-chart viewBox="0 0 ${C.W} ${C.H}"${o.size ? ` width="${o.size[0]}" height="${o.size[1]}"` : ''} role="${mode === 'edit' ? 'group' : 'img'}" aria-label="${LABELS.chartTitle}">` +
      `<defs><pattern id="${hid}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="${ZC.B}"/><path d="M0 0 V6" stroke="#ffffff" stroke-width="1.8" stroke-opacity=".6"/></pattern></defs>`;
    for (let k = 0; k <= 10; k++) {
      const y = y0 - k * sq;
      out += `<line x1="${C.L}" x2="${C.W - C.R}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${k ? '#e3e6e1' : '#a9ada4'}" stroke-width="1"/>`;
      if (step) out += `<text x="${C.L - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" class="zn-tick">${k * step}</text>`;
    }
    // Axes à la latte, terminés par une flèche (FO5b).
    out += `<path d="M${C.L} ${y0} V${C.T - 6}" stroke="#4d5650" stroke-width="1.4"/><path d="M${C.L - 4} ${C.T - 2} L${C.L} ${C.T - 9} L${C.L + 4} ${C.T - 2} Z" fill="#4d5650"/>`;
    const yName = g.y ? LABELS.yOptions[g.y] : (mode === 'edit' ? LABELS.axisUnset : '');
    const xName = g.x ? LABELS.xOptions[g.x] : (mode === 'edit' ? LABELS.axisUnset : '');
    out += `<text class="zn-axis-name ${g.y ? '' : 'is-unset'}" transform="translate(16 ${((C.T + y0) / 2).toFixed(1)}) rotate(-90)" text-anchor="middle">${escapeHtml(yName)}</text>` +
      `<text class="zn-axis-name ${g.x ? '' : 'is-unset'}" x="${(C.L + C.W - C.R) / 2}" y="${C.H - 6}" text-anchor="middle">${escapeHtml(xName)}</text>`;
    cats.forEach((t, i) => {
      const cx = C.L + gw * (i + 0.5);
      out += `<text class="zn-cat" text-anchor="end" transform="translate(${(cx + 5).toFixed(1)} ${y0 + (mode === 'read' ? 18 : 14)}) rotate(-30)">${escapeHtml(T[t].name)}</text>`;
      ZONES.forEach((Z, zi) => {
        const v = barValue(t, Z);
        const x = zi === 0 ? cx - bw - 1.5 : cx + 1.5;
        const h = step ? Math.min(10, v / step) * sq : 0;
        const bar = `<rect class="zn-bar" x="${x.toFixed(1)}" y="${(y0 - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${Z === 'A' ? ZC.A : `url(#${hid})`}" stroke="${ZC[Z]}" stroke-width="1"/>` +
          `<text class="zn-bar-val" x="${(x + bw / 2).toFixed(1)}" y="${(y0 - h - 5).toFixed(1)}" text-anchor="middle">${v || ''}</text>`;
        if (mode === 'edit') {
          out += `<g class="zn-slot" data-slot="${t}:${Z}" tabindex="0" role="slider" aria-label="${escapeHtml(LABELS.barLabel(T[t].name, Z))}" aria-valuemin="0" aria-valuemax="${step ? 10 * step : 0}" aria-valuenow="${v}">` +
            `<rect class="zn-slot-hit" x="${(zi === 0 ? cx - gw / 2 : cx).toFixed(1)}" y="${C.T}" width="${(gw / 2).toFixed(1)}" height="${ph.toFixed(1)}" fill="transparent"/>${bar}</g>`;
        } else out += bar;
      });
    });
    out += `<path d="M${C.L} ${y0} H${C.W - C.R + 8}" stroke="#4d5650" stroke-width="1.4"/><path d="M${C.W - C.R + 2} ${y0 - 4} L${C.W - C.R + 9} ${y0} L${C.W - C.R + 2} ${y0 + 4} Z" fill="#4d5650"/>`;
    return out + `</svg>`;
  }

  function legendHTML() {
    return `<div class="zn-legend">` + ZONES.map(Z => `<span class="zn-legend-item"><i class="zn-key is-${Z}"></i>${LABELS.zone(Z)}</span>`).join('') + `</div>`;
  }

  function axisSelect(axis, opts) {
    const g = state.graph;
    const miss = lab.state.showMissing && !g[axis] ? 'lab-is-missing' : '';
    return `<select class="lab-select zn-axis-select ${miss}" data-axis="${axis}"><option value="">${LABELS.choose}</option>` +
      Object.keys(opts).map(k => `<option value="${k}" ${g[axis] === k ? 'selected' : ''}>${opts[k]}</option>`).join('') + `</select>`;
  }

  function renderGraphStage(box) {
    const g = state.graph;
    const show = lab.state.showMissing;
    box.innerHTML = `<div class="zn-gview">` +
      `<div class="zn-gcontrols">` +
        `<div class="zn-ctl ${show && !g.step ? 'lab-is-missing' : ''}"><span class="zn-ctl-label">${gloss(LABELS.scaleLabel)}</span><span class="zn-chips">` +
          STEPS.map(s => chip('scale', 'step', s, LABELS.scaleOption(s), g.step === s)).join('') + `</span></div>` +
        `<label class="zn-ctl"><span class="zn-ctl-label">${LABELS.yAxis}</span>${axisSelect('y', LABELS.yOptions)}</label>` +
        `<label class="zn-ctl"><span class="zn-ctl-label">${LABELS.xAxis}</span>${axisSelect('x', LABELS.xOptions)}</label>` +
      `</div>` +
      `<div class="zn-chart-box"><div class="zn-chart-head"><p class="zn-chart-title">${LABELS.chartTitle}</p>${legendHTML()}</div>` +
      `<div class="zn-chart-wrap ${show && g.step && barsLeft() ? 'lab-is-missing' : ''}" data-chart-wrap>${chartSVG({ mode: 'edit' })}</div></div></div>`;

    $$('[data-scale]').forEach(b => b.addEventListener('click', () => {
      const s = Number(b.dataset.scale.split(':')[1]);
      g.step = s;
      // Un bâton ne dépasse pas le haut du papier.
      Object.values(g.bars).forEach(bz => ZONES.forEach(Z => { if (bz[Z] > 10 * s) bz[Z] = 10 * s; }));
      renderGraphStage(box);
      afterGraph();
    }));
    $$('[data-axis]').forEach(sel => sel.addEventListener('change', () => {
      g[sel.dataset.axis] = sel.value || null;
      sel.classList.remove('lab-is-missing');
      $('[data-chart-wrap]').innerHTML = chartSVG({ mode: 'edit' });
      bindChart();
      afterGraph();
    }));
    bindChart();
  }

  function bindChart() {
    const svg = $('[data-chart-wrap] svg');
    if (!svg) return;
    if (!state.graph.step) { lab.setLock(svg, LABELS.lockBars, { icon: false }); return; }
    svg.addEventListener('pointerdown', e => {
      const slot = e.target.closest('[data-slot]');
      if (!slot || e.button !== 0) return;
      e.preventDefault();
      const [t, Z] = slot.dataset.slot.split(':');
      const id = e.pointerId;
      slot.classList.add('is-active');
      setBar(t, Z, valueAt(svg, e.clientY), slot);
      const move = ev => { if (ev.pointerId === id) setBar(t, Z, valueAt(svg, ev.clientY), slot); };
      const up = ev => {
        if (ev.pointerId !== id) return;
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        slot.classList.remove('is-active');
        afterGraph();
        lab.save();
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    });
    svg.addEventListener('keydown', e => {
      const slot = e.target.closest('[data-slot]');
      if (!slot) return;
      const d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key];
      if (!d && e.key !== 'Home') return;
      e.preventDefault();
      const [t, Z] = slot.dataset.slot.split(':');
      setBar(t, Z, e.key === 'Home' ? 0 : Math.max(0, Math.min(10 * state.graph.step, barValue(t, Z) + d)), slot);
      afterGraph();
      lab.save();
    });
  }

  function valueAt(svg, clientY) {
    const m = svg.getScreenCTM();
    if (!m) return 0;
    const pt = svg.createSVGPoint();
    pt.x = 0;
    pt.y = clientY;
    const p = pt.matrixTransform(m.inverse());
    const C = C_EDIT, sq = (C.H - C.T - C.B) / 10, y0 = C.H - C.B, step = state.graph.step;
    return Math.max(0, Math.min(10 * step, Math.round((y0 - p.y) / sq * step)));
  }

  // Le bâton suit le doigt : seul ce bâton est redessiné.
  function setBar(t, Z, v, slot) {
    const g = state.graph;
    if (!g.bars[t]) g.bars[t] = { A: 0, B: 0 };
    if (g.bars[t][Z] === v) return;
    g.bars[t][Z] = v;
    const C = C_EDIT, sq = (C.H - C.T - C.B) / 10, y0 = C.H - C.B;
    const h = Math.min(10, v / g.step) * sq;
    const rect = slot.querySelector('.zn-bar');
    const text = slot.querySelector('.zn-bar-val');
    rect.setAttribute('y', (y0 - h).toFixed(1));
    rect.setAttribute('height', h.toFixed(1));
    text.setAttribute('y', (y0 - h - 5).toFixed(1));
    text.textContent = v || '';
    slot.setAttribute('aria-valuenow', String(v));
  }

  function afterGraph() {
    const wrap = $('[data-chart-wrap]');
    if (wrap && !barsLeft()) wrap.classList.remove('lab-is-missing');
    setCaption(defaultCaption());
    renderFooter();
  }

  /* ===== Étape 3 : conclusion ===== */
  function datasheetRead(opts) {
    const o = opts || {};
    return `<table class="zn-data is-read"><thead><tr><th scope="col"></th>` +
      ZONES.map(Z => `<th scope="col"><span class="zn-th-zone">${letter(Z)}${LABELS.zone(Z)}</span></th>`).join('') + `</tr></thead><tbody>` +
      FACTORS.map(f => `<tr><th scope="row">${LABELS.factors[f]}<small>${LABELS.units[f]}</small></th>${ZONES.map(Z => {
        const v = o.real ? zoneOf(Z).values[f] : state.table[Z][f];
        return `<td>${fmtValue(f, v)}</td>`;
      }).join('')}</tr>`).join('') +
      `<tr class="zn-species-row"><th scope="row">${LABELS.factors.species}<small>${o.real ? '' : LABELS.units.species}</small></th>${ZONES.map(Z => `<td>${o.real ? Object.keys(trueTally(Z)).length : speciesCount(Z)}</td>`).join('')}</tr>` +
      `</tbody></table>`;
  }

  function renderConclude() {
    followTool();   // l'outil en main ne suit plus la souris hors du terrain
    const c = state.conclusion;
    const show = lab.state.showMissing;
    const miss = k => show && !c[k] ? 'lab-is-missing' : '';
    const row = k => `<div class="zn-qrow ${miss(k)}"><span class="zn-qrow-label">${gloss(LABELS.rows[k])}</span>${zoneChips('c', k, c[k])}</div>`;
    const options = (k, opts, long) => `<div class="zn-chips ${long ? 'is-long' : ''}">` +
      Object.keys(opts).map(v => `<button type="button" class="lab-choice zn-chip ${long ? 'zn-chip-long' : ''} ${c[k] === v ? 'is-selected' : ''}" data-c="${k}:${v}" aria-pressed="${c[k] === v}">${opts[v]}</button>`).join('') + `</div>`;

    lab.body.innerHTML = `<div class="zn-conclude">` +
      `<section class="zn-ref">` +
        `<div class="zn-panel"><h3 class="lab-panel-title">${LABELS.sheetTitle}</h3>${datasheetRead()}</div>` +
        `<div class="zn-panel zn-ref-graph"><div class="zn-chart-head"><h3 class="lab-panel-title">${LABELS.graphTitle}</h3>${legendHTML()}</div><div class="zn-chart-wrap">${chartSVG({ mode: 'read' })}</div></div>` +
      `</section>` +
      `<section class="zn-form">` +
        `<p class="zn-reminder">${gloss(LABELS.question)}</p>` +
        `<div class="zn-form-cols"><div class="zn-form-col">` +
          `<div class="zn-q"><p class="zn-q-title">${LABELS.qFactors}</p>${row('warmer')}${row('brighter')}${row('humid')}</div>` +
          `<div class="zn-q"><p class="zn-q-title">${LABELS.qLiving}</p>${row('moss')}${row('bloom')}</div>` +
          `<div class="zn-q"><p class="zn-q-title">${LABELS.qBio}</p>${row('bio')}</div>` +
        `</div><div class="zn-form-col">` +
          `<div class="zn-q ${miss('key')}"><p class="zn-q-title">${gloss(LABELS.qKey)}</p>${options('key', LABELS.keys)}</div>` +
          `<div class="zn-q ${miss('why')}"><p class="zn-q-title">${LABELS.qWhy}</p>${options('why', LABELS.whys, true)}</div>` +
          `<div class="zn-q ${miss('verdict')}"><p class="zn-q-title">${LABELS.qVerdict}</p>${options('verdict', LABELS.verdicts)}</div>` +
        `</div></div>` +
      `</section></div>`;

    $$('[data-c]').forEach(btn => btn.addEventListener('click', () => {
      const [k, v] = btn.dataset.c.split(':');
      c[k] = v;
      if (conclusionsComplete()) lab.state.showMissing = false;
      renderConclude();
    }));

    const ready = conclusionsComplete();
    lab.renderStepper();
    lab.setFooter(`<button type="button" class="lab-btn lab-btn-ghost" data-back>← ${LABELS.backToLab}</button>` +
      (show && !ready ? lab.footerInfo(lab.L.missingConclusions, true) : '') +
      `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-check>${LABELS.checkConclusions}</button></div>`);
    $('[data-back]').addEventListener('click', () => lab.goToStep(2));
    const check = $('[data-check]');
    lab.setLock(check, ready ? null : lab.L.missingConclusions, { missing: true, key: 'check' });
    check.addEventListener('click', () => lab.finish());
  }

  /* ===== Étape 4 : correction ===== */
  const higher = (a, b) => a > b ? 'A' : b > a ? 'B' : 'same';
  const groupOf = (Z, group) => { const c = trueTally(Z); return group.reduce((s, t) => s + (c[t] || 0), 0); };

  function truth() {
    const v = Z => zoneOf(Z).values;
    return {
      warmer: higher(v('A').temp, v('B').temp),
      brighter: higher(v('A').lux, v('B').lux),
      humid: higher(v('A').air, v('B').air),
      moss: higher(groupOf('A', MOSS_FERN), groupOf('B', MOSS_FERN)),
      bloom: higher(groupOf('A', BLOOM), groupOf('B', BLOOM)),
      bio: higher(Object.keys(trueTally('A')).length, Object.keys(trueTally('B')).length),
      key: 'humidity',
      why: 'conditions'
    };
  }

  // Le jugement de l'hypothèse se compare aux réponses de l'élève, pas à la vérité.
  function verdictShould() {
    const same = HYP_KEYS.filter(k => state.hypothesis[k] === state.conclusion[k]).length;
    return same === HYP_KEYS.length ? 'confirmed' : same === 0 ? 'rejected' : 'partly';
  }

  function evaluate() {
    const measureMiss = [];
    ZONES.forEach(Z => FACTORS.forEach(f => {
      const said = state.table[Z][f], real = zoneOf(Z).values[f];
      if (!sameValue(f, said, real)) measureMiss.push({ Z, f, said, real });
    }));

    const countMiss = [];
    ZONES.forEach(Z => {
      const mine = tally(Z), real = trueTally(Z);
      [...new Set(Object.keys(real).concat(Object.keys(mine)))].forEach(t => {
        const s = mine[t] || 0, r = real[t] || 0;
        if (s !== r) countMiss.push({ Z, t, said: s, real: r });
      });
    });

    const g = state.graph;
    const best = bestStep();
    const barMiss = [];
    categories().forEach(t => ZONES.forEach(Z => {
      const want = tally(Z)[t] || 0, got = barValue(t, Z);
      if (want !== got) barMiss.push({ t, Z, want, got });
    }));
    const scaleOk = g.step === best, yOk = g.y === 'individuals', xOk = g.x === 'species';

    const tr = truth();
    const c = state.conclusion;
    const qKeys = CONCL_KEYS.filter(k => k !== 'verdict');
    const wrongQ = qKeys.filter(k => c[k] !== tr[k]);

    return {
      measureMiss, countMiss, barMiss, best, scaleOk, yOk, xOk, tr, wrongQ, qKeys,
      measures: measureMiss.length === 0,
      count: countMiss.length === 0,
      graph: scaleOk && yOk && xOk && barMiss.length === 0,
      conclusion: wrongQ.length === 0,
      verdict: c.verdict === verdictShould()
    };
  }

  const EXPLAIN = {
    brighter: 'Under the trees, the leaves stop most of the sunlight: much less light reaches the ground.',
    warmer: 'Where less sunlight reaches the ground, the air and the soil warm up less: it is cooler.',
    humid: 'Where it is cool and shady, less water evaporates: the air and the soil stay humid. Near a pond, the water that evaporates makes the air very humid.',
    moss: '[Mosses] and [ferns] need a lot of water: mosses have no roots and [dry out] quickly, and ferns need water to reproduce. They live where it is humid, often in the shade.',
    bloom: '[Wildflowers] need a lot of light to grow and to flower. Bees and butterflies [feed on] their nectar, and they like warmth.',
    bio: 'The number of species is what you counted in each quadrat: compare the two numbers in your data sheet.',
    key: '[Mosses] and [ferns] need humidity above all: without water, they dry out.',
    why: 'Each living thing lives where the physical conditions [suit it]. Two zones only 50 m apart can have very different temperature, light and humidity: so they do not have the same living things.'
  };

  const CHECK = {
    measScore: (good, total) => `${good} / ${total} values written correctly.`,
    measAllGood: 'All your values match the instruments. Well read!',
    measMiss: (Z, f, said, real) => f === 'soil'
      ? `Zone ${Z}, soil: you noted “${said ? LABELS.soilWords[said] : 'nothing'}”, the soil was ${LABELS.soilWords[real]}.`
      : `Zone ${Z}, ${LABELS.factors[f].toLowerCase()}: you wrote ${said == null ? 'nothing' : withUnit(f, said)}, the ${INSTR_NAME[f]} showed ${withUnit(f, real)}.`,
    realValues: 'What the instruments showed',
    countMiss: (Z, name, said, real) => real === 0
      ? `Zone ${Z}: you counted the ${name}. It is not a living thing: do not count it.`
      : said === 0
        ? `Zone ${Z}, ${name}: you did not count any, but there ${real === 1 ? 'was 1' : `were ${real}`} in the quadrat.`
        : `Zone ${Z}, ${name}: you counted ${said}, but there ${real === 1 ? 'was 1' : `were ${real}`} in the quadrat.`,
    mushroom: 'A mushroom is a [fungus]: it is a living thing, even if it is not a plant.',
    countAllGood: 'You counted every living thing, and nothing else. Well counted!',
    realCount: Z => `What was really in the quadrat of zone ${Z}:`,
    scaleOk: (s, max) => `Your scale (1 square = ${LABELS.scaleOption(s)}) fits your biggest number (${max}), and your bars are tall enough to read.`,
    scaleSmall: (s, max, best) => `With 1 square = ${LABELS.scaleOption(s)}, your histogram only goes up to ${10 * s}: your biggest number (${max}) does not fit. Choose 1 square = ${LABELS.scaleOption(best)}.`,
    scaleBig: (s, max, best) => `With 1 square = ${LABELS.scaleOption(s)}, your bars are very small. 1 square = ${LABELS.scaleOption(best)} is enough for your biggest number (${max}).`,
    yOk: 'The vertical axis shows what you counted: the number of individuals.',
    yWrong: name => `The vertical axis is not “${name}”: it shows what you counted, the number of individuals.`,
    xOk: 'The horizontal axis shows the categories you compare: the species.',
    xWrong: name => `The horizontal axis is not “${name}”: it shows the categories you compare, the species.`,
    barMiss: (name, Z, got, want) => `Bar of the ${name}, zone ${Z}: you drew ${got}, your table says ${want}.`,
    barsOk: 'All your bars are at the height of your counts.',
    concScore: (good, total) => `${good} / ${total} answers correct.`,
    youSaid: 'You said:',
    right: 'The right answer:',
    verdictOk: v => `You judged your hypothesis “${LABELS.verdicts[v]}”: that is right. Well judged!`,
    verdictWrong: should => `Compare your hypothesis with your answers: your hypothesis is ${LABELS.verdicts[should]}.`,
    verdictRule: 'All four parts the same as your answers: confirmed. Some of them: partly confirmed. None of them: rejected.',
    rejectedNote: 'A rejected hypothesis is not a mistake: it is how science moves on.',
    hypPart: 'Hypothesis',
    answerPart: 'Your answer'
  };

  function answerText(k, v) {
    if (!v) return '—';
    if (k === 'key') return LABELS.keys[v];
    if (k === 'why') return LABELS.whys[v];
    return PHRASE[k](v);
  }

  function scaleNote(ev) {
    const s = state.graph.step, max = maxTally();
    if (ev.scaleOk) return CHECK.scaleOk(s, max);
    return 10 * s < max ? CHECK.scaleSmall(s, max, ev.best) : CHECK.scaleBig(s, max, ev.best);
  }

  function criterionDetail(key, ev) {
    if (key === 'measures') {
      const good = 8 - ev.measureMiss.length;
      return `<p>${CHECK.measScore(good, 8)}</p>` +
        (ev.measureMiss.length ? `<ul class="zn-misslist">${ev.measureMiss.map(m => `<li>${CHECK.measMiss(m.Z, m.f, m.said, m.real)}</li>`).join('')}</ul>` : `<p class="zn-ok">${CHECK.measAllGood}</p>`) +
        `<p class="zn-detail-sub">${CHECK.realValues}</p>${datasheetRead({ real: true })}`;
    }
    if (key === 'count') {
      const notes = ev.countMiss.map(m => `<li>${gloss(CHECK.countMiss(m.Z, `[${T[m.t].name}]`, m.said, m.real))}${m.t === 'mushroom' && m.said < m.real ? ` ${gloss(CHECK.mushroom)}` : ''}</li>`).join('');
      const real = ZONES.map(Z => {
        const c = trueTally(Z);
        return `<p class="zn-detail-sub">${CHECK.realCount(Z)}</p><p class="zn-real-list">${Object.keys(c).map(t => `<span>${iconSVG(t)}${gloss(`[${T[t].name}]`)} <b>${c[t]}</b></span>`).join('')}</p>`;
      }).join('');
      return (ev.countMiss.length ? `<ul class="zn-misslist">${notes}</ul>` : `<p class="zn-ok">${CHECK.countAllGood}</p>`) + real;
    }
    if (key === 'graph') {
      const g = state.graph;
      const line = (ok, text) => `<li class="${ok ? 'zn-ok' : 'zn-ko'}">${ok ? '✓' : '✗'} ${text}</li>`;
      const bars = ev.barMiss.map(m => `<li>${CHECK.barMiss(T[m.t].name, m.Z, m.got, m.want)}</li>`).join('');
      return `<ul class="zn-checklist">` +
        line(ev.scaleOk, scaleNote(ev)) +
        line(ev.yOk, ev.yOk ? CHECK.yOk : CHECK.yWrong(LABELS.yOptions[g.y])) +
        line(ev.xOk, ev.xOk ? CHECK.xOk : CHECK.xWrong(LABELS.xOptions[g.x])) +
        line(!ev.barMiss.length, ev.barMiss.length ? `<ul class="zn-misslist">${bars}</ul>` : CHECK.barsOk) + `</ul>` +
        `<div class="zn-chart-wrap zn-chart-mini">${chartSVG({ mode: 'read' })}</div>`;
    }
    if (key === 'conclusion') {
      const items = ev.qKeys.map(k => {
        const ok = !ev.wrongQ.includes(k);
        const mine = answerText(k, state.conclusion[k]);
        const right = answerText(k, ev.tr[k]);
        return `<li class="${ok ? 'zn-ok-item' : 'zn-ko-item'}"><span class="zn-mark">${ok ? '✓' : '✗'}</span><span>` +
          (ok ? `${capitalize(mine)}.` : `${CHECK.youSaid} ${mine}. <b>${CHECK.right} ${right}.</b>`) +
          (!ok || k === 'why' ? ` <span class="zn-muted">${gloss(EXPLAIN[k])}</span>` : '') + `</span></li>`;
      }).join('');
      return `<p>${CHECK.concScore(ev.qKeys.length - ev.wrongQ.length, ev.qKeys.length)}</p><ul class="zn-answers">${items}</ul>`;
    }
    const should = verdictShould();
    const rows = HYP_KEYS.map(k => {
      const same = state.hypothesis[k] === state.conclusion[k];
      return `<tr><td>${k === 'moss' ? PHRASE.hypMoss(state.hypothesis[k]) : PHRASE[k](state.hypothesis[k])}</td><td>${PHRASE[k](state.conclusion[k])}</td><td class="${same ? 'zn-ok' : 'zn-ko'}">${same ? '=' : '≠'}</td></tr>`;
    }).join('');
    return `<table class="zn-hyptable"><thead><tr><th>${CHECK.hypPart}</th><th>${CHECK.answerPart}</th><th></th></tr></thead><tbody>${rows}</tbody></table>` +
      `<p class="${ev.verdict ? 'zn-ok' : 'zn-ko'}">${ev.verdict ? CHECK.verdictOk(state.conclusion.verdict) : CHECK.verdictWrong(should)}</p>` +
      `<p class="zn-muted">${CHECK.verdictRule}</p>` + (should !== 'confirmed' ? `<p class="zn-muted">${CHECK.rejectedNote}</p>` : '');
  }

  const CRITS = ['measures', 'count', 'graph', 'conclusion', 'verdict'];

  function renderCheck() {
    const ev = evaluate();
    const score = CRITS.filter(k => ev[k]).length;
    const rows = CRITS.map(k => `<button type="button" class="zn-crit ${ev[k] ? 'is-ok' : 'is-ko'} ${state.crit === k ? 'is-selected' : ''}" data-crit="${k}">` +
      `<span class="zn-crit-text"><strong>${LABELS.criteria[k]}</strong><small>${LABELS.criteriaSub[k]}</small></span>` +
      `<span class="zn-crit-mark" aria-label="${ev[k] ? 'correct' : 'incorrect'}">${ev[k] ? '✓' : '✗'}</span></button>`).join('');

    lab.body.innerHTML = `<div class="zn-check">` +
      `<div class="zn-check-left">` +
        `<div class="lab-score"><span class="lab-score-num">${score}<small> / ${CRITS.length}</small></span><span class="lab-score-label">${LABELS.scoreLabel}</span></div>` +
        `<div class="zn-crit-list">${rows}</div>` +
      `</div>` +
      `<div class="zn-check-detail" aria-live="polite"><h3>${LABELS.criteria[state.crit]}</h3>${criterionDetail(state.crit, ev)}</div>` +
      `</div>`;

    $$('[data-crit]').forEach(btn => btn.addEventListener('click', () => {
      state.crit = btn.dataset.crit;
      renderCheck();
    }));
    lab.checkFooter();
  }

  /* ===== Rapport imprimable : contenu des 7 sections de la fiche outil FO3
     (en-tête, numérotation et mise en page : cadre commun) =====
     Les erreurs passent par mark() (lab-engine.js) : valeur mal recopiée et
     comptage faux encadrés dans les tableaux, échelle et noms d'axes
     soulignés, histogramme encadré si des bâtons sont faux, réponses fausses
     soulignées dans l'interprétation et la conclusion. */
  function buildReport(mark) {
    const R = LABELS.report;
    const ev = evaluate();
    const h = state.hypothesis;
    const c = state.conclusion;

    const hyp = `I think that ${PHRASE.warmer(h.warmer)}, ${PHRASE.brighter(h.brighter)} and ${PHRASE.humid(h.humid)}, and that ${PHRASE.hypMoss(h.moss)}.`;

    // Fiche de terrain : les zones en lignes, comme la fiche papier.
    const measMiss = new Map(ev.measureMiss.map(m => [`${m.Z}-${m.f}`, m]));
    const countMissBy = Z => ev.countMiss.filter(m => m.Z === Z);
    const dataHead = `<tr><th>${R.zoneCol}</th>${FACTORS.map(f => `<th>${LABELS.factors[f]} ${f === 'soil' ? '' : LABELS.units[f]}</th>`).join('')}<th>${LABELS.factors.species}</th></tr>`;
    const dataBody = ZONES.map(Z => `<tr><th>${Z} · ${plain(habitatName(Z))}</th>` + FACTORS.map(f => {
      const m = measMiss.get(`${Z}-${f}`);
      const text = fmtValue(f, state.table[Z][f]);
      return `<td>${m ? mark(text, CHECK.measMiss(m.Z, m.f, m.said, m.real), { box: true }) : text}</td>`;
    }).join('') + (() => {
      const n = state.counted[Z].length ? tallyOrder(Z).length : 0;
      const real = Object.keys(trueTally(Z)).length;
      const text = String(n);
      const wrongSet = countMissBy(Z).some(m => m.said === 0 || m.real === 0);
      return `<td>${n !== real || wrongSet ? mark(text, `Zone ${Z}: there were ${real} species of living things in the quadrat (${Object.keys(trueTally(Z)).map(t => T[t].name).join(', ')}).`, { box: true }) : text}</td>`;
    })() + `</tr>`).join('');

    // Comptage : une ligne par espèce notée (ou oubliée), une colonne par zone.
    const rowsT = [...new Set(categories().concat(ev.countMiss.map(m => m.t)))];
    const countBody = rowsT.map(t => `<tr><th>${T[t].name}</th>${ZONES.map(Z => {
      const said = tally(Z)[t] || 0;
      const m = ev.countMiss.find(x => x.Z === Z && x.t === t);
      const text = said ? String(said) : '—';
      return `<td>${m ? mark(text, plain(CHECK.countMiss(Z, T[t].name, m.said, m.real)), { box: true }) : text}</td>`;
    }).join('')}</tr>`).join('') || `<tr><td colspan="3">${R.nothing}</td></tr>`;

    const g = state.graph;
    const stepText = g.step ? LABELS.scaleOption(g.step) : '—';
    const yText = g.y ? LABELS.yOptions[g.y] : '—';
    const xText = g.x ? LABELS.xOptions[g.x] : '—';
    let chart = `<div class="zn-report-chart">${chartSVG({ mode: 'print', size: [520, 238] })}<div class="zn-report-legend">${ZONES.map(Z => `<span><i class="zn-key is-${Z}"></i>${LABELS.zone(Z)}</span>`).join('')}</div></div>`;
    if (ev.barMiss.length) chart = mark(chart, `Bars at the wrong height: ${ev.barMiss.map(m => `${T[m.t].name} zone ${m.Z} (${m.got} instead of ${m.want})`).join(', ')}.`, { box: true });
    const axes = R.axes(
      ev.scaleOk ? stepText : mark(stepText, scaleNote(ev)),
      ev.yOk ? yText : mark(yText, CHECK.yOk),
      ev.xOk ? xText : mark(xText, CHECK.xOk)
    );

    const said = k => {
      const text = answerText(k, c[k]);
      return ev.wrongQ.includes(k) ? mark(text, `${capitalize(answerText(k, ev.tr[k]))}. ${plain(EXPLAIN[k])}`) : text;
    };
    const interp = `${R.results} ${said('warmer')}, ${said('brighter')} and ${said('humid')}. ` +
      `In the quadrats, ${said('moss')} and ${said('bloom')}; ${said('bio')}. ${R.keyLine(said('key'))}`;
    let verdictWord = LABELS.verdicts[c.verdict] || '—';
    if (!ev.verdict) verdictWord = mark(verdictWord, `${CHECK.verdictWrong(verdictShould())} ${CHECK.verdictRule}`);
    const conclusion = R.conclusion(said('why'), verdictWord);

    const correction = CRITS.map(k => `<tr><th>${LABELS.criteria[k]}</th><td class="${ev[k] ? 'ok' : 'ko'}">${ev[k] ? '✓' : '✗'}</td></tr>`).join('');

    return {
      title: R.title,
      sections: [
        `<p>${R.question(plain(habitatName('A')).toLowerCase(), plain(habitatName('B')).toLowerCase())}</p>`,
        `<p>${hyp}</p>` + (state.because.trim() ? `<p>${R.because}: ${escapeHtml(state.because.trim())}</p>` : ''),
        `<p>${R.materials}</p>`,
        `<ol>${R.procedure.map(p => `<li>${p}</li>`).join('')}</ol>`,
        `<table class="zn-report-table"><caption>${LABELS.sheetTitle}</caption>${dataHead}${dataBody}</table>` +
          `<div class="zn-report-results"><table class="zn-report-count"><caption>${R.countCaption}</caption><tr><th>${R.species}</th>${ZONES.map(Z => `<th>${LABELS.zone(Z)}</th>`).join('')}</tr>${countBody}</table>` +
          `<div class="zn-report-graph"><p class="zn-report-graph-title">${LABELS.chartTitle}</p>${chart}<p class="lab-report-note">${axes}</p></div></div>`,
        `<p>${interp}</p>`,
        `<p>${conclusion}</p>`
      ],
      correction: `<p><strong>${R.score(CRITS.filter(k => ev[k]).length)}</strong></p>` +
        `<table class="zn-report-corr">${correction}</table>`
    };
  }

  lab = LabEngine.create({
    id: 'zones',
    title: LABELS.title,
    glossary: GLOSSARY,
    reset,
    stepComplete,
    lockReason,
    isStarted: () => HYP_KEYS.some(k => state.hypothesis[k]) || started(),
    render: { 1: renderPredict, 2: renderExperiment, 3: renderConclude, 4: renderCheck },
    report: buildReport,
    version: 1,
    save: () => ({ state: Object.assign({}, state, { tool: null }) }),
    load(data) {
      const s = data.state;
      if (!s || !s.zones || !ZONES.every(Z => s.zones[Z] && HABITATS[s.zones[Z].key] && Array.isArray(s.zones[Z].items))) throw new Error('labProgress');
      state = Object.assign(s, { tool: null });
      stepperDone = null;
    },
    summary() {
      const ev = evaluate();
      const criteria = {};
      CRITS.forEach(k => { criteria[k] = ev[k]; });
      return {
        score: CRITS.filter(k => ev[k]).length,
        total: CRITS.length,
        criteria,
        details: {
          zones: `${zoneOf('A').key}-${zoneOf('B').key}`,
          valuesRight: 8 - ev.measureMiss.length,
          countMistakes: ev.countMiss.length,
          wrongAnswers: ev.wrongQ
        }
      };
    }
  });
})();
