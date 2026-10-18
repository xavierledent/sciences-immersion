/* ===== Labo virtuel « Under our feet » (chem1) : de quoi est fait le sol =====

   Version virtuelle du labo fait en classe : deux échantillons de sol, venus
   de deux lieux, étalés dans des bacs, observés à la loupe et triés. Le cadre
   commun (modale, barre d'étapes, verrous, traduction, rapport imprimé) est
   dans lab-engine.js, à la racine du site, chargé avant ce fichier. Textes en
   anglais seulement pour l'instant.

   Tirés au sort à chaque nouveau labo : un lieu au sol riche (forêt de
   l'école, potager, prairie) et un lieu au sol pauvre (bac à sable de la
   cour, allée de gravier, chantier), les lettres A et B, le contenu de chaque
   bac (nombre, place) et son humidité, indépendante de la richesse : du sable
   mouillé n'a pas de vie pour autant. Pièges d'observation : un scarabée mort
   (matière organique, il ne bouge pas), un déchet (pas du sol), et de tout
   petits éléments (fines racines, collemboles, grains de sable), invisibles
   tant que la loupe n'a pas balayé le bac, puis dessinés en plus grand.

   Déroulé :
     1. Predict    — quel échantillon contient le plus d'êtres vivants et de
                     matière organique (+ « because » libre)
     2. Experiment — gants (sinon tout est verrouillé), spatule pour étaler,
                     loupe (balayage), tri dans 4 coupelles par échantillon,
                     test « Wet or dry? » pour l'humidité ; la fiche
                     d'observation se remplit seule, sans rien valider
     3. Conclude   — l'échantillon le plus riche, la composition change-t-elle
                     selon le lieu, de quoi est fait le sol, hypothèse
     4. Check      — 4 critères : tri, observation, conclusion, hypothèse ;
                     rapport (FO3) */

(function () {
  'use strict';

  const { escapeHtml, mulberry32, seedFrom, pick, reduceMotion } = LabEngine.util;

  // Cadre commun, créé en fin de fichier (LabEngine.create).
  let lab;
  const $ = sel => lab.$(sel);
  const $$ = sel => lab.$$(sel);
  const gloss = text => lab.gloss(text);
  const plain = text => String(text).replace(/\[([^\]|]+)(?:\|[^\]]+)?\]/g, '$1');

  /* ===== Libellés =====
     [mot] ou [mot|clé] : mot du lexique, souligné, traduction française au
     survol ou au toucher (voir GLOSSARY). Les raisons des verrous restent en
     texte simple : la bulle du cadre commun n'affiche pas de lexique. */
  const LABELS = {
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
      picked: (name, S) => `Now drag the ${name} into a [bowl] of sample ${S}, or tap the [bowl].`,
      sorted: (name, cat, S) => `You put the ${name} in the “${cat}” [bowl] of sample ${S}.`,
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
  };

  const GLOSSARY = {
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
    'top soil': 'terre de surface', 'crushed rocks': 'roches broyées'
  };

  /* ===== Ce qu'on peut trouver dans un bac =====
     cat : la bonne coupelle. r : rayon de prise (unités du bac, avant
     l'échelle de l'élément). tiny : ne se touche qu'à travers la loupe.
     move : les vivants bougent (le scarabée mort, non). */
  const CATS = ['living', 'organic', 'mineral', 'waste'];

  const T = {
    earthworm: { cat: 'living', r: 17, move: 'wiggle', name: 'earthworm',
      cap: 'A long, soft, pink animal. It slowly [curls up] when you touch it.',
      draw: () => '<path d="M-16 1 C-11 -7 -5 7 0 0 S10 -7 16 -2" fill="none" stroke="#c97b7b" stroke-width="4.6" stroke-linecap="round"/><path d="M-5 3 C-3 2 -1.5 1 0 0" fill="none" stroke="#e39b92" stroke-width="5.8" stroke-linecap="round"/><path d="M-16 1 C-11 -7 -5 7 0 0 S10 -7 16 -2" fill="none" stroke="#f0bdb5" stroke-width="1.1" stroke-linecap="round" stroke-dasharray="1.2 2.4" opacity=".8"/>' },
    woodlouse: { cat: 'living', r: 11, move: 'walk', name: 'woodlouse',
      cap: 'A small grey animal with a hard back made of plates, and fourteen legs. It walks away from the light.',
      draw: () => '<path d="M7.5 -2 L11.5 -5 M7.5 2 L11.5 5" stroke="#4d5257" stroke-width=".8"/><ellipse rx="8.6" ry="5.5" fill="#6c7177"/>' + [-5, -2.6, -0.2, 2.2, 4.6].map(i => `<path d="M${i} -5.2 Q${i + 0.7} 0 ${i} 5.2" stroke="#53585e" stroke-width=".75" fill="none"/>`).join('') + '<ellipse cx="-1" cy="-1.8" rx="6" ry="1.6" fill="#9a9fa5" opacity=".55"/>' },
    ant: { cat: 'living', r: 9, move: 'run', name: 'ant',
      cap: 'A tiny black insect with six legs. It runs fast across the [tray].',
      draw: () => '<path d="M1.6 0 L-.5 -4 M1.6 0 L3.8 -4.2 M1.6 0 L1.6 -4.6 M1.6 0 L-.5 4 M1.6 0 L3.8 4.2 M1.6 0 L1.6 4.6" stroke="#1f1c1a" stroke-width=".6"/><circle cx="-3.2" r="2.6" fill="#1f1c1a"/><circle cx="1.6" r="1.4" fill="#1f1c1a"/><circle cx="5.2" r="1.8" fill="#1f1c1a"/>' },
    larva: { cat: 'living', r: 10, move: 'slow', name: 'beetle larva',
      cap: 'A soft, white, curled [grub] with a brown head. Its little legs move slowly.',
      draw: () => '<path d="M5 -5 C-7 -9 -10 5 2 6" fill="none" stroke="#efe5cf" stroke-width="6.2" stroke-linecap="round"/><path d="M5 -5 C-7 -9 -10 5 2 6" fill="none" stroke="#d6c9ac" stroke-width="6.2" stroke-linecap="round" stroke-dasharray=".6 2.2"/><circle cx="6" cy="-5" r="2.9" fill="#a5642f"/>' },
    springtail: { cat: 'living', r: 7, tiny: true, move: 'jump', name: 'springtail',
      cap: 'A tiny white animal, smaller than a grain of rice. It jumps when you breathe on it.',
      draw: () => '<ellipse rx="2.7" ry="1.2" fill="#f4f1e8"/><path d="M2.5 -.4 L4.4 -1.7 M2.5 .4 L4.4 1.7" stroke="#f4f1e8" stroke-width=".4"/>' },
    roots: { cat: 'living', r: 9, tiny: true, name: 'fine roots',
      cap: 'Thin white threads attached to a small green [shoot]. They are fresh and [bend] without breaking.',
      draw: () => '<g fill="none" stroke="#f1e9d8" stroke-width=".8" stroke-linecap="round"><path d="M0 -7 C1 -3 -1 1 0 7"/><path d="M0 -2 C2 0 4 1 6 3"/><path d="M0 1 C-2 3 -4 4 -6 6"/><path d="M0 4 C1 5 2 6 3 8"/></g><path d="M0 -7 C-1 -9 -2 -10 -3 -11" stroke="#79ad45" stroke-width="1.1" fill="none"/><ellipse cx="-3.6" cy="-11.4" rx="1.8" ry=".9" fill="#8cc152" transform="rotate(-30 -3.6 -11.4)"/>' },
    beetleDead: { cat: 'organic', r: 10, name: 'beetle',
      cap: 'A black insect lying on its back. It does not move, even when you touch it. Its body is dry and very light.',
      draw: () => '<g stroke="#232428" stroke-width=".9" fill="none" stroke-linecap="round"><path d="M-3 -3 L-5 -7 L-3.5 -9"/><path d="M0 -3.6 L0 -8 L1.5 -10"/><path d="M3 -3 L5 -7 L6.5 -8.5"/><path d="M-3 3 L-5 7 L-3.5 9"/><path d="M0 3.6 L0 8 L1.5 10"/><path d="M3 3 L5 7 L6.5 8.5"/></g><ellipse rx="6.5" ry="4.5" fill="#2c2d33"/><path d="M-4 0 H4 M-3 -2 Q0 -2.7 3 -2 M-3 2 Q0 2.7 3 2" stroke="#4a4c55" stroke-width=".6" fill="none"/><circle cx="7" r="2.1" fill="#1f2024"/>' },
    leaf: { cat: 'organic', r: 15, name: 'dead leaf',
      cap: 'A brown, dry leaf full of holes. It [crumbles] at the edges.',
      draw: (r, soil) => {
        const c = ['#7c4f25', '#93622e', '#6e4520', '#8a5a2b'][Math.floor(r() * 4)];
        return `<path d="M-14 0 C-8 -9 6 -9 14 0 C6 9 -8 9 -14 0 Z" fill="${c}"/><path d="M-14 0 L14 0 M-6 0 L-2 -5 M1 0 L5 -5 M-6 0 L-2 5 M1 0 L5 5" stroke="#55361a" stroke-width=".65" fill="none"/><circle cx="5.5" cy="2.6" r="1.7" fill="${soil}"/><circle cx="-4" cy="-2.7" r="1.15" fill="${soil}"/>`;
      } },
    twig: { cat: 'organic', r: 16, name: 'twig',
      cap: 'A small piece of dead wood. The [bark] comes off easily.',
      draw: () => '<path d="M-16 2 L16 -2" stroke="#6b4a2f" stroke-width="3.3" stroke-linecap="round"/><path d="M3 -.5 L10 -7" stroke="#6b4a2f" stroke-width="2.1" stroke-linecap="round"/><path d="M-11 1.2 L-7 .7 M-2 .2 L1.5 -.2 M7 -.9 L11 -1.4" stroke="#977452" stroke-width=".7"/>' },
    acorn: { cat: 'organic', r: 8, name: 'acorn cup',
      cap: 'The empty cup of an [acorn]: brown, dry and hard.',
      draw: () => '<path d="M-6 -1 A6 4.8 0 0 0 6 -1 Z" fill="#8b6a3e"/><path d="M-6 -1 H6" stroke="#6e5230" stroke-width="1.3"/><path d="M-4 0 L-2 3 M-1 0 L1 3.5 M2 0 L4 2.6 M-3.4 2 L3.4 2" stroke="#6e5230" stroke-width=".55"/><path d="M0 -1 L0 -3.2" stroke="#6e5230" stroke-width="1.1"/>' },
    grass: { cat: 'organic', r: 13, name: 'dry grass',
      cap: 'Yellow, dry blades of grass. They are flat and [brittle].',
      draw: () => '<g stroke-linecap="round" fill="none"><path d="M-13 5 Q-2 -1 12 -5" stroke="#d6c07a" stroke-width="1.7"/><path d="M-12 1 Q0 -3 13 -1" stroke="#c9b06a" stroke-width="1.4"/><path d="M-10 6 Q2 3 11 4" stroke="#e1cf93" stroke-width="1.3"/></g>' },
    bark: { cat: 'organic', r: 11, name: 'piece of bark',
      cap: 'A piece of [bark], dark brown and dry. It breaks into flakes.',
      draw: () => '<path d="M-10 -5 L6 -7 L11 -1 L8 6 L-7 7 L-11 1 Z" fill="#4c3527"/><path d="M-8 -3 L7 -4 M-9 1 L9 0 M-6 4 L6 4.5" stroke="#6d503c" stroke-width=".85"/>' },
    pebble: { cat: 'mineral', r: 8, name: 'pebble',
      cap: 'A small, hard, rounded stone. Pressing it changes nothing.',
      draw: r => {
        const c = ['#a59a8c', '#9c948a', '#b3a796', '#8f8a83'][Math.floor(r() * 4)];
        return `<ellipse rx="6.6" ry="5" fill="${c}"/><ellipse cx="-1.8" cy="-1.8" rx="2.6" ry="1.4" fill="#ffffff" opacity=".3"/><ellipse rx="6.6" ry="5" fill="none" stroke="#00000026" stroke-width=".8"/>`;
      } },
    gravel: { cat: 'mineral', r: 8, name: 'gravel',
      cap: 'Grey bits of stone with sharp edges.',
      draw: () => '<path d="M-6 -2 L-2 -6 L5 -4 L7 2 L2 6 L-5 4 Z" fill="#8f8e8a"/><path d="M-2 -6 L1 0 L7 2 M1 0 L-5 4" stroke="#b6b5b1" stroke-width=".75" fill="none"/>' },
    sand: { cat: 'mineral', r: 6, tiny: true, name: 'sand grains',
      cap: 'Tiny hard grains, light brown. Some of them [shine] in the light.',
      draw: () => [[0, 0], [1.6, 0.8], [-1.4, 1], [0.6, -1.5], [-1.8, -1], [2.2, -1], [-0.3, 2]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 2 ? 0.75 : 0.95}" fill="${i % 3 ? '#e4d0a0' : '#c7ab74'}" stroke="#8f7647" stroke-width=".3"/>`).join('') + '<path d="M.6 -2.7 V-.3 M-.6 -1.5 H1.8" stroke="#ffffff" stroke-width=".35"/>' },
    rock: { cat: 'mineral', r: 11, name: 'piece of rock',
      cap: 'A flat piece of rock with sharp edges. It is heavy for its size.',
      draw: () => '<path d="M-11 -3 L-4 -8 L8 -6 L12 1 L5 7 L-9 5 Z" fill="#7b838a"/><path d="M-4 -8 L-1 -1 L12 1 M-1 -1 L-9 5" stroke="#a8b0b7" stroke-width=".85" fill="none"/>' },
    cap: { cat: 'waste', r: 8, name: 'bottle cap',
      cap: 'A red, smooth, light object with [ridges] around it. It is made of plastic.',
      draw: () => '<circle r="6.4" fill="#d3373b"/><circle r="4.6" fill="#ba2a2f"/><circle r="6.4" fill="none" stroke="#ef6b6e" stroke-width="1" stroke-dasharray="1 1.1"/><ellipse cx="-1.6" cy="-1.8" rx="1.8" ry="1" fill="#ffffff" opacity=".35"/>' },
    wrapper: { cat: 'waste', r: 10, name: 'sweet wrapper',
      cap: 'A shiny, [crumpled] piece of thin plastic film.',
      draw: () => '<path d="M-9 -4 L-3 -7 L4 -5 L9 -6 L8 1 L10 6 L1 5 L-6 7 L-9 2 Z" fill="#b8c2cf"/><path d="M-6 -2 L5 -3 L5 1 L-5 2 Z" fill="#8f5bd6" opacity=".75"/><path d="M-3 -7 L-1 0 L-6 7 M4 -5 L-1 0 L10 6 M-9 2 L-1 0 L9 -6" stroke="#eef2f7" stroke-width=".7" fill="none"/>' }
  };

  const MOVES = {
    wiggle: '<animateTransform attributeName="transform" type="rotate" values="0;7;-5;0" dur="2.2s" repeatCount="indefinite"/>',
    walk: '<animateTransform attributeName="transform" type="translate" values="0 0;2 -1;4 0;2 1;0 0" dur="2.4s" repeatCount="indefinite"/>',
    run: '<animateTransform attributeName="transform" type="translate" values="0 0;3 -1.5;6 0;3 1.5;0 0" dur="1.3s" repeatCount="indefinite"/>',
    slow: '<animateTransform attributeName="transform" type="rotate" values="0;-7;0" dur="3s" repeatCount="indefinite"/>',
    jump: '<animateTransform attributeName="transform" type="translate" values="0 0;0 0;3 -3;6 0;6 0;0 0" dur="2.6s" repeatCount="indefinite"/>'
  };

  /* ===== Les lieux ===== (un sol riche et un sol pauvre par tirage)
     wet : probabilité que l'échantillon soit humide. bits : ce qui dépasse
     du tas avant qu'on l'étale (voir heapArt). */
  const LOCS = {
    forest: { rich: true, from: 'from the [school forest]', kind: 'soil', wet: 0.8,
      base: '#3f2c1f', parts: ['#2a1c13', '#5b4030', '#6d4e36', '#33261b', '#7a5a3c'], crumbs: '#5a3a1e', bits: [['leaf', 4], ['twig', 1]],
      items: [['earthworm', 1], ['woodlouse', 0.7], ['springtail', 1], ['roots', 1], ['leaf', 2], ['twig', 1], ['acorn', 0.7], ['beetleDead', 0.6], ['pebble', 1], ['sand', 1]],
      why: 'In a forest, dead leaves and wood fall on the ground every year, and many small animals and decomposers live in the soil: it is rich in organic matter and life.' },
    garden: { rich: true, from: 'from the [vegetable garden]', kind: 'soil', wet: 0.7,
      base: '#55392a', parts: ['#3b281c', '#6f4c37', '#7e5a40', '#4a3123'], crumbs: '#3d2a1c', bits: [['root', 3], ['leaf', 1]],
      items: [['earthworm', 1], ['earthworm', 0.5], ['larva', 1], ['roots', 1], ['springtail', 0.6], ['grass', 1], ['bark', 0.6], ['pebble', 2], ['sand', 1], ['beetleDead', 0.5]],
      why: 'A vegetable garden gets plant remains and compost every year, and its soil is full of worms and roots: it is rich in organic matter and life.' },
    meadow: { rich: true, from: 'from the [meadow]', kind: 'soil', wet: 0.6,
      base: '#5a432f', parts: ['#43301f', '#76593e', '#8a6b47', '#4f3a27'], blades: '#8aa64a', bits: [['grass', 6], ['root', 1]],
      items: [['ant', 2], ['earthworm', 0.6], ['roots', 1], ['springtail', 0.5], ['grass', 2], ['leaf', 0.5], ['pebble', 1], ['sand', 1], ['beetleDead', 0.4]],
      why: 'In a meadow, grass dies and grows back every year. Its roots, the dead grass and the small animals make the soil rich in organic matter and life.' },
    sandpit: { rich: false, from: 'from the [playground] [sandpit]', kind: 'sand', wet: 0.4,
      base: '#d8bf8c', parts: ['#c9ad78', '#e6d3a8', '#bfa06a', '#efe1bf'],
      items: [['sand', 2], ['pebble', 2], ['cap', 1], ['leaf', 0.5], ['beetleDead', 0.6]],
      why: 'The sand of a playground sandpit comes from [crushed rocks]: it is almost only mineral matter, with very little life.' },
    gravel: { rich: false, from: 'from the [gravel path]', kind: 'gravel', wet: 0.2,
      base: '#a69c8c', parts: ['#8a8274', '#c2b9a9', '#7a7368', '#d1c9ba'], stones: true,
      items: [['gravel', 3], ['sand', 1], ['wrapper', 1], ['leaf', 0.4], ['ant', 0.3]],
      why: 'A gravel path is made of stones and sand put there by people: it is mostly mineral matter, with almost no life.' },
    building: { rich: false, from: 'from the [building site]', kind: 'gravel', wet: 0.3,
      base: '#9a8c78', parts: ['#7d705e', '#b3a690', '#6b604f', '#c4b8a2'], stones: true,
      items: [['rock', 2], ['gravel', 2], ['sand', 1], ['cap', 0.6], ['wrapper', 0.4]],
      why: 'On a building site, the [top soil] has been taken away: what is left is mostly rocks, gravel and sand.' }
  };
  const RICH = ['forest', 'garden', 'meadow'];
  const POOR = ['sandpit', 'gravel', 'building'];

  const LENS_R = 46;      // rayon de la lentille qui balaie le bac (unités du bac)
  const REVEAL = 2.2;     // agrandissement d'un tout petit élément vu à la loupe
  const SCAN_MS = 3000;   // durée du balayage
  const SOIL = { x: 10, y: 10, w: 400, h: 180 };

  /* ===== État ===== */
  let state;      // tirage et travail de l'élève (enregistré tel quel, voir save)

  function placeItems(loc, S) {
    const list = [];
    loc.items.forEach(([type, n]) => {
      const count = n >= 1 ? n : (Math.random() < n ? 1 : 0);
      for (let i = 0; i < count; i++) list.push(type);
    });
    const placed = [];
    list.forEach((type, i) => {
      const t = T[type];
      const s = t.tiny ? 0.9 : 1.3;
      const rr = t.r * s;
      let x = 0, y = 0;
      for (let k = 0; k < 300; k++) {
        x = SOIL.x + rr + 6 + Math.random() * (SOIL.w - 2 * rr - 12);
        y = SOIL.y + rr + 6 + Math.random() * (SOIL.h - 2 * rr - 12);
        if (placed.every(p => Math.hypot(p.x - x, p.y - y) > p.rr + rr + 5)) break;
      }
      placed.push({ uid: S + i, S, type, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, s, rr, rot: Math.floor(Math.random() * 360), sorted: null });
    });
    return placed;
  }

  function reset() {
    const rich = pick(RICH), poor = pick(POOR);
    const richLetter = Math.random() < 0.5 ? 'A' : 'B';
    const keys = richLetter === 'A' ? { A: rich, B: poor } : { A: poor, B: rich };
    state = {
      hypothesis: null,
      because: '',
      richLetter,
      gloves: false,
      tool: null,
      selected: null,
      samples: {},
      conclusion: { compare: null, location: null, verdict: null },
      crit: 'sorting'
    };
    ['A', 'B'].forEach(S => {
      const loc = LOCS[keys[S]];
      state.samples[S] = {
        S, key: keys[S], wet: Math.random() < loc.wet, seed: String(Math.random()),
        items: placeItems(loc, S), spread: false, lensUsed: false, touched: false, noted: null
      };
    });
  }

  const samples = () => ['A', 'B'].map(S => state.samples[S]);
  const locOf = S => LOCS[state.samples[S].key];
  const fromText = S => locOf(S).from;
  const itemByUid = uid => samples().flatMap(s => s.items).find(i => i.uid === uid) || null;
  const nameOf = it => T[it.type].name;
  // Un tout petit élément n'existe pour l'élève qu'une fois son bac balayé
  // par la loupe ; il est alors dessiné plus grand, et se prend plus large.
  const isTiny = it => !!T[it.type].tiny;
  const isHidden = it => isTiny(it) && !state.samples[it.S].lensUsed;
  const grabR = it => isTiny(it) ? it.rr * REVEAL : it.rr;

  // f négatif : éclaircit.
  function darken(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    return '#' + [16, 8, 0].map(s => Math.min(255, Math.round(((n >> s) & 255) * (1 - f))).toString(16).padStart(2, '0')).join('');
  }
  const soilColour = smp => smp.wet ? darken(LOCS[smp.key].base, 0.22) : LOCS[smp.key].base;

  // Dessin d'un élément (sa couleur tirée reste la même d'un affichage à l'autre).
  function itemDrawing(it) {
    const smp = state.samples[it.S];
    return T[it.type].draw(mulberry32(seedFrom(smp.seed + it.uid)), soilColour(smp));
  }

  /* ===== Étapes complètes (progression stricte, voir lab-engine.js) =====
     1 : l'hypothèse ; 2 : gants, chaque bac étalé, regardé à la loupe, trié
     (au moins un élément), touché et son humidité notée ; 3 : toutes les
     questions de la conclusion. */
  function missingReason() {
    const M = LABELS.missing;
    if (!state.gloves) return M.gloves;
    for (const s of samples()) if (!s.spread) return M.spread(s.S);
    for (const s of samples()) if (!s.lensUsed) return M.lens(s.S);
    for (const s of samples()) if (!s.items.some(i => i.sorted)) return M.sort(s.S);
    for (const s of samples()) if (!s.touched) return M.touch(s.S);
    for (const s of samples()) if (!s.noted) return M.note(s.S);
    return null;
  }

  function conclusionsComplete() {
    const c = state.conclusion;
    return !!(c.compare && c.location && c.verdict);
  }

  function stepComplete(n) {
    if (n === 1) return !!state.hypothesis;
    if (n === 2) return !missingReason();
    return conclusionsComplete();
  }

  function lockReason(n) {
    if (n === 1) return LABELS.lockHypothesis;
    if (n === 2) return missingReason();
    return lab.L.missingConclusions;
  }

  /* ===== Étape 1 : hypothèse ===== */
  // Petit dessin de chaque lieu, pour la carte des échantillons.
  function placeSVG(key) {
    const sky = '<rect width="120" height="72" fill="#dcecf8"/>';
    const scenes = {
      forest: sky + '<rect y="50" width="120" height="22" fill="#4a3424"/>' +
        [18, 52, 90].map(x => `<rect x="${x - 3}" y="26" width="6" height="26" fill="#6b4a2f"/><circle cx="${x}" cy="22" r="15" fill="#3f8a4a"/><circle cx="${x - 8}" cy="28" r="9" fill="#4f9a55"/><circle cx="${x + 8}" cy="27" r="9" fill="#357a40"/>`).join('') +
        [8, 30, 44, 70, 104, 112].map((x, i) => `<ellipse cx="${x}" cy="${58 + (i % 3) * 4}" rx="4" ry="1.8" fill="${i % 2 ? '#b0702f' : '#8a5a2b'}"/>`).join(''),
      garden: sky + '<rect y="40" width="120" height="32" fill="#5b3d2b"/>' +
        [46, 56, 66].map(y => `<path d="M0 ${y} H120" stroke="#3f2a1d" stroke-width="2"/>`).join('') +
        [12, 34, 56, 78, 100].map(x => `<path d="M${x} 44 l-4 -8 M${x} 44 l4 -8 M${x} 44 v-10" stroke="#4f9a40" stroke-width="2.4" stroke-linecap="round"/>`).join('') +
        '<path d="M0 30 H120 M0 38 H120" stroke="#b9875a" stroke-width="2"/>' + [10, 40, 70, 100].map(x => `<rect x="${x}" y="26" width="3" height="16" fill="#a2734a"/>`).join(''),
      meadow: sky + '<rect y="40" width="120" height="32" fill="#7db35a"/><circle cx="96" cy="26" r="11" fill="#4f9a55"/><rect x="94" y="30" width="4" height="12" fill="#6b4a2f"/>' +
        Array.from({ length: 22 }, (_, i) => `<path d="M${4 + i * 5.3} 70 q1 -7 ${i % 2 ? 2 : -2} -12" stroke="#5e9a3e" stroke-width="1.5" fill="none"/>`).join('') +
        [14, 38, 60, 82, 108].map((x, i) => `<circle cx="${x}" cy="${52 + (i % 2) * 8}" r="2.4" fill="${i % 2 ? '#ffffff' : '#f6d046'}"/>`).join(''),
      sandpit: sky + '<rect y="38" width="120" height="34" fill="#8cc06a"/><rect x="14" y="44" width="92" height="24" rx="3" fill="#e6cf98" stroke="#9c6b3c" stroke-width="4"/>' +
        '<path d="M72 50 h12 l-2 12 h-8 z" fill="#d94a4a"/><path d="M71 50 h14" stroke="#b33a3a" stroke-width="2"/><path d="M40 62 l10 -14" stroke="#3d7fc4" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="38" cy="63" rx="5" ry="3" fill="#3d7fc4"/>',
      gravel: sky + '<rect y="38" width="120" height="34" fill="#8cc06a"/><path d="M42 38 H78 L104 72 H16 Z" fill="#b9b0a0"/>' +
        Array.from({ length: 26 }, (_, i) => `<circle cx="${30 + (i * 37) % 62}" cy="${42 + (i * 11) % 28}" r="${1.3 + (i % 3) * 0.6}" fill="${i % 2 ? '#8a8274' : '#d6cebe'}"/>`).join(''),
      building: sky + '<rect y="44" width="120" height="28" fill="#9a8c78"/><path d="M86 8 V44 M86 10 H116 M86 16 L104 10 M112 10 v14" stroke="#e7b416" stroke-width="2.5" fill="none"/><rect x="108" y="24" width="8" height="6" fill="#7a6a55"/>' +
        '<path d="M20 64 l6 -18 l6 18 z" fill="#f08a24"/><path d="M22.5 57 h7" stroke="#ffffff" stroke-width="2.5"/>' +
        [[50, 60, 6], [62, 66, 4], [72, 58, 5], [40, 68, 3]].map(([x, y, r]) => `<path d="M${x - r} ${y} L${x - r / 3} ${y - r} L${x + r} ${y - r / 2} L${x + r / 2} ${y + r / 2} Z" fill="#7b838a"/>`).join('')
    };
    return `<svg class="so-place" viewBox="0 0 120 72" aria-hidden="true" focusable="false">${scenes[key]}</svg>`;
  }

  function renderPredict() {
    const missing = lab.state.showMissing && !state.hypothesis;
    const blank = state.hypothesis
      ? `<span class="so-blank is-filled">${LABELS.hypChoices[state.hypothesis]}</span>`
      : '<span class="so-blank">……………</span>';
    const choices = ['A', 'B', 'same'].map(c =>
      `<button type="button" class="lab-choice so-choice ${state.hypothesis === c ? 'is-selected' : ''}" data-hyp="${c}" aria-pressed="${state.hypothesis === c}">${LABELS.hypChoices[c]}</button>`).join('');
    const cards = samples().map(s => `<div class="so-place-card">${placeSVG(s.key)}<span><span class="so-letter">${s.S}</span><strong>${LABELS.sample(s.S)}</strong><small>${gloss(fromText(s.S))}</small></span></div>`).join('');

    lab.body.innerHTML = `<div class="so-predict">` +
      `<div class="so-question-card">` +
        `<p class="so-kicker">${LABELS.yourQuestion}</p>` +
        `<p class="so-question">${gloss(LABELS.question)}</p>` +
        `<p class="so-kicker">${LABELS.yourSamples}</p>` +
        `<div class="so-places">${cards}</div>` +
      `</div>` +
      `<div class="so-hyp-card ${missing ? 'lab-is-missing' : ''}">` +
        `<p class="so-kicker">${LABELS.hypothesisTitle}</p>` +
        `<p class="so-sentence">${LABELS.iThink} ${blank} ${gloss(LABELS.hypEnd)}</p>` +
        `<div class="so-choices">${choices}</div>` +
        `<label class="so-because"><span>${LABELS.because}</span>` +
        `<input type="text" class="lab-input so-because-input" maxlength="160" placeholder="${LABELS.becausePlaceholder}" value="${escapeHtml(state.because)}" autocomplete="off"></label>` +
      `</div></div>`;

    $$('[data-hyp]').forEach(btn => btn.addEventListener('click', () => {
      state.hypothesis = btn.dataset.hyp;
      renderPredict();
      lab.renderStepper();
    }));
    const because = $('.so-because-input');
    because.addEventListener('input', e => { state.because = e.target.value; });
    // Hypothèse figée dès que l'expérience a commencé (gants mis).
    if (state.gloves) {
      $$('[data-hyp]').forEach(btn => lab.setLock(btn, LABELS.lockHypothesisFixed, { icon: false }));
      because.readOnly = true;
      lab.setLock(because, LABELS.lockHypothesisFixed);
    }

    const info = missing ? lab.footerInfo(lab.L.missingHypothesis, true)
      : lab.footerInfo(state.hypothesis ? LABELS.hypothesisReady : LABELS.hypothesisPending);
    lab.setFooter(info + `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-next>${LABELS.toExperiment} →</button></div>`);
    const next = $('[data-next]');
    next.addEventListener('click', () => lab.goToStep(2));
    lab.setLock(next, state.hypothesis ? null : LABELS.lockHypothesis, { missing: true, key: 'next' });
  }

  /* ===== Étape 2 : la paillasse =====
     Outils : gants (une fois pour toutes) ; spatule, loupe et main « Wet or
     dry? » : un clic les met en main (l'outil suit alors la souris), un
     geste sur un bac, puis l'outil se range. La spatule étale le tas en deux
     coups, dessinée dans le bac ; la loupe balaie le bac en zigzag et révèle au passage les tout petits éléments, qui restent
     ensuite agrandis et cerclés de pointillés ; pendant l'étalement et le
     balayage, le bac ne réagit pas. La main affiche son résultat dans une bulle sur le bac,
     jusqu'à ce que l'élève note « wet » ou « dry ». Tri : toucher un élément
     l'examine (panneau de droite), le glisser le porte dans une coupelle de
     son échantillon. */
  const TOOL_ICON = {
    gloves: '<svg class="so-tool-ic" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M12 36 V22 L8 14 C7 12 9.5 10.6 11 12.4 L14 17 V7.5 C14 5.4 17.2 5.4 17.2 7.5 V16 V5.6 C17.2 3.5 20.4 3.5 20.4 5.6 V16 V6.6 C20.4 4.5 23.6 4.5 23.6 6.6 V17 V9.6 C23.6 7.6 26.8 7.6 26.8 9.6 V24 C26.8 29 25 32 23 33 V36 Z" fill="#8cc4ee" stroke="#4b86b8" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 33 H23" stroke="#4b86b8" stroke-width="1.4"/></svg>',
    spatula: '<svg class="so-tool-ic" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M6 34 L19 21" stroke="#9c6b3c" stroke-width="5" stroke-linecap="round"/><path d="M18 22 L22 18" stroke="#7f8a94" stroke-width="2.4"/><path d="M21 19 L28 9 C30 6.5 34.5 9 33.2 12 L24.5 21.5 Z" fill="#c9d2da" stroke="#7f8a94" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    magnifier: '<svg class="so-tool-ic" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><circle cx="16" cy="16" r="10" fill="#e6f3fb" stroke="#2b3440" stroke-width="3.4"/><path d="M11.5 12.5 A6 6 0 0 1 16 10" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><path d="M23.5 23.5 L34 34" stroke="#2b3440" stroke-width="5" stroke-linecap="round"/></svg>',
    touch: '<svg class="so-tool-ic" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M15 36 C11 33 8 28 7 24 C6.4 22 8.8 20.8 10 22.6 L13 27 V8.5 C13 6.4 16.4 6.4 16.4 8.5 V20 V17 C16.4 15 19.8 15 19.8 17 V21 V18.5 C19.8 16.5 23.2 16.5 23.2 18.5 V22 V20.5 C23.2 18.6 26.6 18.6 26.6 20.5 V28 C26.6 32 24.5 35 23 36 Z" fill="#8cc4ee" stroke="#4b86b8" stroke-width="1.4" stroke-linejoin="round"/><path d="M5.5 3 C7.6 6.6 9.6 8.8 9.6 11.4 A4.1 4.1 0 0 1 1.4 11.4 C1.4 8.8 3.4 6.6 5.5 3 Z" fill="#4b9fdb" stroke="#2f78ad" stroke-width="1" stroke-linejoin="round"/></svg>'
  };
  const GLOVE_PATH = TOOL_ICON.touch.match(/<path d="([^"]+)"/)[1];
  const MINI = {
    spread: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 20 L12 11" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M12 11 L17 4 C18.5 2.5 21.5 4.5 20.3 6.5 L14 13 Z" fill="currentColor"/></svg>',
    lens: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M15 15 L21 21" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
    touch: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 22 C6.5 20 5 17 4.5 15 C4.2 13.8 5.6 13.2 6.3 14.2 L8 16.5 V5 C8 3.6 10.2 3.6 10.2 5 V12 V10.5 C10.2 9.2 12.4 9.2 12.4 10.5 V12.5 V11.5 C12.4 10.2 14.6 10.2 14.6 11.5 V13 V12.4 C14.6 11.2 16.8 11.2 16.8 12.4 V17 C16.8 19.5 15.5 21.3 14.5 22 Z" fill="currentColor"/></svg>'
  };
  const TICK = '<svg class="so-tick" viewBox="0 0 24 20" aria-hidden="true" focusable="false"><path d="M3 11.5 C5 12.5 7 14.5 9 17 C12 10 16 5 21.5 2.5" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function renderExperiment() {
    busy = {};
    const trayCol = S => `<div class="so-traycol" data-col="${S}">` +
      `<div class="so-tray-head" data-head="${S}"></div>` +
      `<div class="so-tray-frame" data-frame="${S}"><svg class="so-tray-svg" data-tray="${S}" viewBox="0 0 420 200" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${LABELS.sample(S)}"></svg><div class="so-feel" data-feel="${S}" aria-live="polite" hidden></div></div>` +
      `<div class="so-bowls" data-bowls="${S}"></div></div>`;
    lab.body.innerHTML = `<div class="so-run">` +
      `<section class="so-bench">` +
        `<div class="so-toolrow"><div class="so-tools" data-tools></div><div class="so-inspector" data-inspector aria-live="polite"></div></div>` +
        `<div class="so-trays">${trayCol('A')}${trayCol('B')}</div>` +
        `<p class="lab-caption so-caption" data-caption aria-live="polite"></p>` +
      `</section>` +
      `<aside class="so-side">` +
        `<p class="so-reminder" data-reminder></p>` +
        `<div class="so-sheet-panel"><h3 class="lab-panel-title">${LABELS.sheetTitle}<small>${LABELS.sheetSub}</small></h3><div data-sheet></div></div>` +
      `</aside></div>`;

    ['A', 'B'].forEach(S => {
      buildTray(S);
      renderFeel(S);
      $(`[data-tray="${S}"]`).addEventListener('pointerdown', e => onTrayDown(e, S));
      const bowls = $(`[data-bowls="${S}"]`);
      bowls.addEventListener('pointerdown', onChipDown);
      bowls.addEventListener('click', onBowlClick);
    });
    const tools = $('[data-tools]');
    tools.addEventListener('pointerdown', onToolDown);
    // Clavier : Entrée ou Espace sur un outil (clic sans pointeur).
    tools.addEventListener('click', e => {
      const b = e.target.closest('[data-tool]');
      if (b && e.detail === 0) toolTap(b.dataset.tool, b);
    });
    $('[data-sheet]').addEventListener('click', onSheetClick);
    $('[data-reminder]').innerHTML = `${lab.lockIcon}<span>${gloss(LABELS.hypReminder(state.hypothesis))}</span>`;

    renderTools();
    renderStatus();
    renderBowls();
    renderSheet();
    renderInspector();
    renderSelection();
    setCaption(defaultCaption());

    lab.setFooter(lab.footerInfo('') + `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-ghost" data-conclude>${LABELS.toConclude} →</button></div>`);
    $('[data-conclude]').addEventListener('click', () => lab.goToStep(3));
    renderFooter();
  }

  function defaultCaption() {
    const C = LABELS.caption;
    if (!state.gloves) return C.start;
    if (!missingReason()) return C.done;
    const s = samples().find(x => !x.spread);
    if (s) return C.gloves;
    if (state.tool) return C[state.tool];
    return C.noTool;
  }

  function setCaption(text, warn) {
    const c = $('[data-caption]');
    if (!c) return;
    c.innerHTML = `<span>${gloss(text)}</span>`;
    c.classList.toggle('is-warning', !!warn);
  }

  /* --- Bacs : sol (tas, puis étalé), éléments, loupe, sélection --- */
  function soilTexture(smp) {
    const r = mulberry32(seedFrom(smp.seed + 'soil'));
    const loc = LOCS[smp.key];
    const w = smp.wet ? 0.22 : 0;
    const at = () => [(SOIL.x + r() * SOIL.w).toFixed(1), (SOIL.y + r() * SOIL.h).toFixed(1)];
    let out = `<rect x="0" y="0" width="420" height="200" fill="${soilColour(smp)}"/>`;
    for (let i = 0; i < 380; i++) {
      const [x, y] = at();
      out += `<circle cx="${x}" cy="${y}" r="${(0.5 + Math.pow(r(), 2) * 2.4).toFixed(2)}" fill="${darken(loc.parts[Math.floor(r() * loc.parts.length)], w)}"/>`;
    }
    if (loc.crumbs) {
      for (let i = 0; i < 34; i++) {
        const [x, y] = at();
        out += `<ellipse cx="${x}" cy="${y}" rx="${(1.5 + r() * 2.5).toFixed(1)}" ry="${(0.7 + r()).toFixed(1)}" fill="${darken(loc.crumbs, w)}" transform="rotate(${Math.round(r() * 180)} ${x} ${y})"/>`;
      }
    }
    if (loc.blades) {
      for (let i = 0; i < 26; i++) {
        const [x, y] = at();
        out += `<path d="M${x} ${y} l${(r() * 6 - 3).toFixed(1)} ${(-3 - r() * 4).toFixed(1)}" stroke="${darken(loc.blades, w)}" stroke-width="1" stroke-linecap="round"/>`;
      }
    }
    if (loc.stones) {
      for (let i = 0; i < 46; i++) {
        const x = SOIL.x + r() * SOIL.w, y = SOIL.y + r() * SOIL.h, s = 1.5 + r() * 3.2;
        const c = darken(['#8a8a86', '#a3a29d', '#77766f', '#bdb9b0'][Math.floor(r() * 4)], w);
        out += `<path d="M${(x - s).toFixed(1)} ${y.toFixed(1)} L${(x - s / 3).toFixed(1)} ${(y - s).toFixed(1)} L${(x + s).toFixed(1)} ${(y - s / 2).toFixed(1)} L${(x + s / 2).toFixed(1)} ${(y + s).toFixed(1)} Z" fill="${c}"/>`;
      }
    }
    if (smp.wet) out += `<rect x="0" y="0" width="420" height="200" fill="url(#so-sheen-${smp.S})"/>`;
    return out;
  }

  function itemMarkup(it) {
    const t = T[it.type];
    const anim = !reduceMotion && t.move ? MOVES[t.move] : '';
    const s = t.tiny ? it.s * REVEAL : it.s;
    const ring = t.tiny ? `<circle r="${t.r + 1.5}" fill="#ffffff" fill-opacity=".14" stroke="#ffffff" stroke-width=".7" stroke-dasharray="1.6 1.4"/>` : '';
    return `<g class="so-it" data-uid="${it.uid}" ${it.sorted || isHidden(it) ? 'display="none"' : ''} transform="translate(${it.x} ${it.y}) rotate(${it.rot}) scale(${s})"><g class="so-pop">${ring}<g>${itemDrawing(it)}${anim}</g></g></g>`;
  }

  /* --- Tas de départ, vu d'en haut, éclairé d'en haut à gauche : contour
     bosselé, mottes (ou cailloux) qui s'empilent vers le sommet, miettes
     tombées autour, ombre portée. Tiré de la graine de l'échantillon : le
     même tas à chaque affichage. Étalé, le sol plat (soilTexture) sort de
     sous le tas, découpé par trois copies du contour (voir spread). --- */
  const HEAP_C = { x: 210, y: 104 };
  // bump : relief du contour ; clods : mottes ou cailloux sur le tas, dont
  // rim au bord ; size : leur rayon ; crumbs : miettes tombées autour.
  const HEAP_SHAPE = {
    soil: { rx: 82, ry: 62, bump: 0.045, clods: 260, rim: 46, size: [2.2, 5.4], crumbs: 44 },
    sand: { rx: 80, ry: 58, bump: 0.02, clods: 0, rim: 0, size: [0, 0], crumbs: 90 },
    gravel: { rx: 80, ry: 60, bump: 0.055, clods: 160, rim: 36, size: [2.4, 5.8], crumbs: 26 }
  };
  const STONES = ['#8a8a86', '#a3a29d', '#77766f', '#bdb9b0'];
  const fx = n => n.toFixed(1);

  // Chemin fermé et lissé passant près des points (milieux reliés en courbes).
  function smoothPath(pts) {
    const mid = (a, b) => `${fx((a[0] + b[0]) / 2)} ${fx((a[1] + b[1]) / 2)}`;
    const n = pts.length;
    return `M${mid(pts[n - 1], pts[0])}` + pts.map((p, i) => ` Q${fx(p[0])} ${fx(p[1])} ${mid(p, pts[(i + 1) % n])}`).join('') + 'Z';
  }

  // Petite forme irrégulière autour de (x, y) : n sommets, rayon s.
  function lumpPts(r, x, y, s, n) {
    const a0 = r() * Math.PI * 2;
    return Array.from({ length: n }, (_, i) => {
      const a = a0 + i / n * Math.PI * 2, d = s * (0.72 + r() * 0.42);
      return [x + Math.cos(a) * d, y + Math.sin(a) * d * 0.86];
    });
  }

  // Le tas d'un échantillon : contour (centré en 0, 0) et dessin du relief.
  function heapArt(smp) {
    const r = mulberry32(seedFrom(smp.seed + 'heap'));
    const loc = LOCS[smp.key], kind = loc.kind, sh = HEAP_SHAPE[kind];
    const w = smp.wet ? 0.22 : 0;
    const waves = [3, 5, 7, 11, 17].map((k, i) => ({ k, a: sh.bump * (0.4 + r() * 0.6) / (1 + i * 0.5), p: r() * Math.PI * 2 }));
    const radius = th => waves.reduce((f, v) => f + v.a * Math.sin(v.k * th + v.p), 1);
    const at = (th, rho) => [HEAP_C.x + Math.cos(th) * sh.rx * radius(th) * rho, HEAP_C.y + Math.sin(th) * sh.ry * radius(th) * rho];
    const outline = smoothPath(Array.from({ length: 48 }, (_, i) => {
      const th = i / 48 * Math.PI * 2;
      return [Math.cos(th) * sh.rx * radius(th), Math.sin(th) * sh.ry * radius(th)];
    }));
    // Mottes : surtout le fond, plus clair ou plus sombre ; parfois une autre
    // teinte du sol. Gravier : couleurs des cailloux.
    const colour = () => kind === 'gravel' ? darken(STONES[Math.floor(r() * 4)], w)
      : r() < 0.6 ? darken(loc.base, w + r() * 0.5 - 0.32) : darken(loc.parts[Math.floor(r() * loc.parts.length)], w);

    // Motte (sol) ou caillou anguleux (gravier) : ombre, corps, reflet.
    const clod = (x, y, s) => {
      const pts = lumpPts(r, x, y, s, kind === 'gravel' ? 5 : 7);
      const d = kind === 'gravel' ? 'M' + pts.map(p => `${fx(p[0])} ${fx(p[1])}`).join(' L') + 'Z' : smoothPath(pts);
      const light = kind === 'gravel'
        ? `<path d="M${fx(pts[2][0])} ${fx(pts[2][1])} L${fx(x)} ${fx(y)} L${fx(pts[4][0])} ${fx(pts[4][1])}" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width=".7"/>`
        : `<ellipse cx="${fx(x - s * 0.3)}" cy="${fx(y - s * 0.35)}" rx="${fx(s * 0.45)}" ry="${fx(s * 0.24)}" fill="#ffffff" fill-opacity=".16" transform="rotate(-25 ${fx(x - s * 0.3)} ${fx(y - s * 0.35)})"/>`;
      return `<path d="${d}" transform="translate(${fx(s * 0.22)} ${fx(s * 0.3)})" fill="#000000" fill-opacity=".3"/><path d="${d}" fill="${colour()}"/>${light}`;
    };

    // Mottes : d'abord celles du bord, le sommet en dernier (par-dessus).
    const lumps = [];
    for (let i = 0; i < sh.clods; i++) {
      const rho = i < sh.rim ? 0.9 + r() * 0.14 : Math.sqrt(r()) * 0.9;
      lumps.push({ th: r() * Math.PI * 2, rho, s: sh.size[0] + r() * (sh.size[1] - sh.size[0]) });
    }
    lumps.sort((a, b) => b.rho - a.rho);
    let relief = lumps.map(l => clod(...at(l.th, l.rho), l.s)).join('');

    // Sable : un cône lisse, grains serrés, versant à l'ombre en bas à droite.
    if (kind === 'sand') {
      for (let i = 0; i < 260; i++) {
        const [x, y] = at(r() * Math.PI * 2, Math.sqrt(r()) * 0.97);
        relief += `<circle cx="${fx(x)}" cy="${fx(y)}" r="${(0.4 + r() * 0.55).toFixed(2)}" fill="${colour()}"/>`;
      }
      relief += `<path d="${outline}" transform="translate(${HEAP_C.x} ${HEAP_C.y})" fill="url(#so-slope-${smp.S})"/>`;
    }

    // Ce qui dépasse d'un sol riche : bouts de feuilles, racines, herbes.
    (loc.bits || []).forEach(([bit, n]) => {
      for (let i = 0; i < n; i++) {
        const [x, y] = at(r() * Math.PI * 2, 0.2 + r() * 0.6), a = Math.round(r() * 360);
        if (bit === 'leaf') relief += `<path d="M-4 0 C-2 -3 2 -3 4 -.5 C2 2.5 -2 2.5 -4 0Z" transform="translate(${fx(x)} ${fx(y)}) rotate(${a})" fill="${darken(['#7c4f25', '#93622e', '#6e4520'][i % 3], w)}"/>`;
        else if (bit === 'twig') relief += `<path d="M-8 0 L8 0 M3 0 L6 -3" transform="translate(${fx(x)} ${fx(y)}) rotate(${a})" stroke="${darken('#6b4a2f', w)}" stroke-width="1.6" stroke-linecap="round"/>`;
        else if (bit === 'root') relief += `<path d="M-7 1 C-3 -2 1 3 7 -1" transform="translate(${fx(x)} ${fx(y)}) rotate(${a})" fill="none" stroke="#d9ccb0" stroke-opacity=".8" stroke-width=".6" stroke-linecap="round"/>`;
        else relief += `<path d="M0 0 q${fx(r() * 4 - 2)} -4 ${fx(r() * 6 - 3)} -8" transform="translate(${fx(x)} ${fx(y)})" fill="none" stroke="${darken(i % 2 ? '#8aa64a' : '#c9b06a', w)}" stroke-width="1.3" stroke-linecap="round"/>`;
      }
    });

    // Volume : éclairé en haut à gauche, sombre au pied et en bas à droite.
    // Le sable, en cône bas, a un pied moins marqué qu'une motte de terre.
    relief += `<path d="${outline}" transform="translate(${HEAP_C.x} ${HEAP_C.y})" fill="url(#so-mound-${smp.S})"${kind === 'sand' ? ' opacity=".5"' : ''}/>`;

    // Miettes tombées autour du tas.
    for (let i = 0; i < sh.crumbs; i++) {
      const [x, y] = at(r() * Math.PI * 2, 1.03 + Math.pow(r(), 1.6) * 0.3);
      if (kind === 'sand') relief += `<circle cx="${fx(x)}" cy="${fx(y)}" r="${(0.5 + r() * 0.7).toFixed(2)}" fill="${colour()}"/>`;
      else relief += clod(x, y, 0.9 + r() * 1.6);
    }
    // Frange de poussière au pied du tas, plus large pour le sable.
    const fringe = `<path d="${outline}" transform="translate(${HEAP_C.x} ${HEAP_C.y}) scale(${kind === 'sand' ? 1.09 : 1.04})" fill="${darken(loc.base, w)}" fill-opacity=".55" filter="url(#so-blur-${smp.S})"/>`;
    return { outline, relief, fringe };
  }

  // La spatule vue d'en haut, lame vers le haut, (0, 0) au bord de la lame.
  function spatulaSVG(smp) {
    const blade = 'M-15 2 C-15 -1 -13 -2 -10 -2 H10 C13 -2 15 -1 15 2 L6.5 30 H-6.5 Z';
    return `<g transform="translate(6 9)" opacity=".24" filter="url(#so-blur-${smp.S})"><path d="${blade}"/><rect x="-6" y="29" width="12" height="66" rx="6"/></g>` +
      `<rect x="-6" y="37" width="12" height="58" rx="6" fill="#a8743f" stroke="#7a5230" stroke-width="1.4"/>` +
      `<path d="M-2.4 43 V89" stroke="#c99560" stroke-width="2" stroke-linecap="round"/>` +
      `<rect x="-5" y="28" width="10" height="10" rx="2" fill="#aab4bd" stroke="#7f8a94" stroke-width="1.2"/>` +
      `<path d="${blade}" fill="#d3dae1" stroke="#7f8a94" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<path d="M-15 2 C-15 -1 -13 -2 -10 -2 H10 C13 -2 15 -1 15 2 L13.5 7 C5 8.5 -5 6 -13.5 7 Z" fill="${soilColour(smp)}" opacity=".9"/>` +
      `<path d="M-9 10 L-4.5 26" stroke="#ffffff" stroke-opacity=".75" stroke-width="2" stroke-linecap="round"/>`;
  }

  function buildTray(S) {
    const smp = state.samples[S];
    const svg = $(`[data-tray="${S}"]`);
    const heap = heapArt(smp);
    // Trois copies du contour découpent le sol plat : le tas, puis ce que
    // chaque coup de spatule pousse d'un côté (voir spread).
    const blobs = [0, 1, 2].map(i => `<path data-blob d="${heap.outline}" transform="translate(${HEAP_C.x} ${HEAP_C.y}) scale(${smp.spread && !i ? 8 : 1})"/>`).join('');
    svg.innerHTML =
      `<defs>` +
        `<clipPath id="so-soilclip-${S}"><rect x="10" y="10" width="400" height="180" rx="14"/></clipPath>` +
        `<clipPath id="so-heap-${S}">${blobs}</clipPath>` +
        `<radialGradient id="so-mound-${S}" cx="50%" cy="50%" r="52%" fx="36%" fy="30%"><stop offset="0" stop-color="#ffffff" stop-opacity=".2"/><stop offset=".4" stop-color="#ffffff" stop-opacity=".04"/><stop offset=".72" stop-color="#000000" stop-opacity=".1"/><stop offset="1" stop-color="#000000" stop-opacity=".42"/></radialGradient>` +
        `<linearGradient id="so-slope-${S}" x1=".2" y1=".1" x2=".8" y2=".9"><stop offset="0" stop-color="#ffffff" stop-opacity=".22"/><stop offset=".48" stop-color="#ffffff" stop-opacity="0"/><stop offset=".56" stop-color="#000000" stop-opacity=".06"/><stop offset="1" stop-color="#000000" stop-opacity=".22"/></linearGradient>` +
        `<linearGradient id="so-sheen-${S}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".1"/><stop offset=".5" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#ffffff" stop-opacity=".08"/></linearGradient>` +
        `<filter id="so-blur-${S}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.5"/></filter>` +
      `</defs>` +
      `<rect x="1" y="1" width="418" height="198" rx="20" fill="#e6ecf2" stroke="#c4cfda" stroke-width="2"/>` +
      `<rect x="10" y="10" width="400" height="180" rx="14" fill="#f8fafc" stroke="#d3dce5"/>` +
      `<g clip-path="url(#so-soilclip-${S})"><g id="so-content-${S}">` +
        (smp.spread ? '' : `<g data-heapart><path d="${heap.outline}" transform="translate(${HEAP_C.x + 5} ${HEAP_C.y + 7})" fill="#000000" fill-opacity=".3" filter="url(#so-blur-${S})"/>${heap.fringe}</g>`) +
        // Les éléments n'apparaissent que là où le sol est étalé.
        `<g clip-path="url(#so-heap-${S})">${soilTexture(smp)}<g data-items opacity="${smp.spread ? 1 : 0}">${smp.items.map(itemMarkup).join('')}</g></g>` +
        (smp.spread ? '' : `<g data-heapart>${heap.relief}</g>`) +
      `</g></g>` +
      `<rect x="10" y="10" width="400" height="180" rx="14" fill="none" stroke="#00000014" stroke-width="3"/>` +
      `<g data-sel pointer-events="none"></g>` +
      `<g data-lens display="none" pointer-events="none">${lensSVG()}</g>` +
      `<g data-spat display="none" pointer-events="none">${spatulaSVG(smp)}</g>`;
    svg.classList.toggle('has-tool', !!state.tool);
    lab.setLock(svg, state.gloves ? null : LABELS.lockTray, { icon: false });
  }

  // La loupe qui balaie le bac, dessinée autour de (0, 0).
  function lensSVG() {
    const d = LENS_R * 0.72;
    return `<circle r="${LENS_R}" fill="#ffffff" fill-opacity=".16"/>` +
      `<path d="M${-LENS_R * 0.55} ${-LENS_R * 0.3} A${LENS_R * 0.62} ${LENS_R * 0.62} 0 0 1 ${-LENS_R * 0.2} ${-LENS_R * 0.58}" fill="none" stroke="#ffffff" stroke-opacity=".8" stroke-width="3" stroke-linecap="round"/>` +
      `<circle r="${LENS_R}" fill="none" stroke="#ffffff" stroke-opacity=".75" stroke-width="10"/>` +
      `<circle r="${LENS_R}" fill="none" stroke="#2b3440" stroke-width="6"/>` +
      `<line x1="${d}" y1="${d}" x2="${d + 26}" y2="${d + 26}" stroke="#ffffff" stroke-opacity=".75" stroke-width="13" stroke-linecap="round"/>` +
      `<line x1="${d}" y1="${d}" x2="${d + 26}" y2="${d + 26}" stroke="#2b3440" stroke-width="9" stroke-linecap="round"/>`;
  }

  // Point du bac sous le pointeur (unités du viewBox, quelle que soit la taille).
  function trayPoint(svg, clientX, clientY) {
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }

  /* --- Loupe : balayage en zigzag du bac (lignes assez proches pour que la
     lentille passe sur tout le sol) --- */
  const SCAN_PATH = [[40, 42], [380, 42], [380, 100], [40, 100], [40, 158], [380, 158]];
  let busy = {};   // bac en cours de balayage ou d'étalement : il ne réagit pas

  function scanTray(S) {
    const smp = state.samples[S];
    const svg = $(`[data-tray="${S}"]`);
    const tiny = smp.items.filter(it => isTiny(it) && !it.sorted);
    const show = it => {
      const g = svg.querySelector(`.so-it[data-uid="${it.uid}"]`);
      if (!g || g.getAttribute('display') !== 'none') return;
      g.removeAttribute('display');
      if (!reduceMotion) g.querySelector('.so-pop').classList.add('is-revealed');
    };
    const finish = () => {
      busy[S] = false;
      svg.classList.remove('is-scanning');
      svg.querySelector('[data-lens]').setAttribute('display', 'none');
      tiny.forEach(show);
      const first = !smp.lensUsed;
      smp.lensUsed = true;
      setCaption(tiny.length ? LABELS.caption.lensFound(S) : LABELS.caption.lensNothing(S));
      if (first) { renderStatus(); renderFooter(); }
      lab.save();
    };
    if (reduceMotion) { finish(); return; }

    busy[S] = true;
    svg.classList.add('is-scanning');
    setCaption(LABELS.caption.scanning(S));
    const lens = svg.querySelector('[data-lens]');
    lens.setAttribute('transform', `translate(${SCAN_PATH[0][0]} ${SCAN_PATH[0][1]})`);
    lens.setAttribute('display', 'inline');
    const segs = SCAN_PATH.slice(1).map((p, i) => Math.hypot(p[0] - SCAN_PATH[i][0], p[1] - SCAN_PATH[i][1]));
    const total = segs.reduce((a, b) => a + b, 0);
    const at = dist => {
      let i = 0;
      while (i < segs.length - 1 && dist > segs[i]) { dist -= segs[i]; i++; }
      const k = Math.min(1, dist / segs[i]), a = SCAN_PATH[i], b = SCAN_PATH[i + 1];
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    };
    // Animation propre à ce bac (pas lab.tween), comme l'étalement.
    const t0 = performance.now();
    const frame = now => {
      if (!svg.isConnected) { busy[S] = false; return; }
      const t = Math.min(1, (now - t0) / SCAN_MS);
      const [x, y] = at(total * (0.5 - Math.cos(Math.PI * t) / 2));
      lens.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      tiny.forEach(it => { if (Math.hypot(it.x - x, it.y - y) < LENS_R - 6) show(it); });
      if (t < 1) requestAnimationFrame(frame);
      else finish();
    };
    requestAnimationFrame(frame);
  }

  /* --- Spatule : deux coups, d'abord vers le côté touché, puis vers
     l'autre. La lame part de l'endroit touché ; chaque coup pousse une copie
     du contour du tas, qui grandit vers son bord du bac (à la fin, les deux
     couvrent tout le bac), et le relief du tas s'efface. --- */
  const SPREAD_MS = [560, 780, 1340, 1500];   // fins : 1er coup, reprise, 2e coup, disparition
  const SPATULA_ANGLE = 50;                    // inclinaison de la spatule (manche vers l'élève)

  function spread(S, p) {
    const smp = state.samples[S];
    if (smp.spread) { setCaption(LABELS.caption.already(S)); return; }
    smp.spread = true;
    setCaption(LABELS.caption.spread(S));
    renderStatus();
    renderFooter();
    const svg = $(`[data-tray="${S}"]`);
    const blobs = svg.querySelectorAll('[data-blob]'), art = svg.querySelectorAll('[data-heapart]');
    const items = svg.querySelector('[data-items]'), spat = svg.querySelector('[data-spat]');
    const C = HEAP_C, dir = p && p.x < C.x ? -1 : 1;
    const ends = [{ x: C.x + dir * 165, y: C.y - 10 }, { x: C.x - dir * 165, y: C.y + 8 }];
    const place = (el, x, y, s, a) => el.setAttribute('transform', `translate(${fx(x)} ${fx(y)}) rotate(${fx(a || 0)}) scale(${s.toFixed(3)})`);
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    // La lame part de l'endroit touché, ramené sur le tas ; le 2e coup part
    // du milieu.
    const from = p ? { x: clamp(p.x, C.x - 60, C.x + 60), y: clamp(p.y, C.y - 45, C.y + 45) } : { x: C.x - dir * 30, y: C.y };
    const back = { x: C.x + dir * 25, y: C.y + 6 };
    const starts = [from, back];
    // Sol poussé par un coup : le contour du tas, étiré dans le sens du coup
    // (son bord arrière ne bouge pas) jusqu'un peu devant la lame, puis
    // jusqu'au bord du bac ; il gagne aussi en hauteur. u0, lead : distances
    // au centre du tas dans le sens du coup.
    const rx = HEAP_SHAPE[LOCS[smp.key].kind].rx;
    const push = (i, k) => {
      const d = i ? -dir : dir, u0 = d * (starts[i].x - C.x);
      const lead = Math.max(rx, u0 + (165 - u0) * k + 20) + 165 * Math.pow(k, 4);
      const sx = (lead / rx + 1) / 2;
      blobs[i + 1].setAttribute('transform', `translate(${fx(C.x + d * rx * (sx - 1))} ${C.y}) scale(${sx.toFixed(3)} ${(1 + 1.2 * k).toFixed(3)})`);
    };
    // a, b : avancée des deux coups (0 à 1). Le 1er coup aplatit le tas.
    const set = (a, b) => {
      push(0, a);
      push(1, b);
      if (b >= 1) place(blobs[0], C.x, C.y, 8);
      art.forEach(g => g.setAttribute('opacity', (1 - a).toFixed(3)));
      items.setAttribute('opacity', clamp((a - 0.2) / 0.6, 0, 1).toFixed(3));
    };
    if (reduceMotion) { set(1, 1); return; }

    const ease = k => 0.5 - Math.cos(Math.PI * clamp(k, 0, 1)) / 2;
    const lerp = (u, v, k) => ({ x: u.x + (v.x - u.x) * k, y: u.y + (v.y - u.y) * k });
    const [t1, t2, t3, t4] = SPREAD_MS;
    busy[S] = true;
    svg.classList.add('is-spreading');
    spat.setAttribute('display', 'inline');
    // Animation propre à ce bac (pas lab.tween) : étaler l'autre bac
    // pendant ce temps ne doit pas l'interrompre.
    const t0 = performance.now();
    const frame = now => {
      if (!svg.isConnected) { busy[S] = false; return; }
      const t = now - t0;
      const a = ease(t / t1), lift = ease((t - t1) / (t2 - t1)), b = ease((t - t2) / (t3 - t2));
      let pos, ang, s = 1;
      if (t < t1) { pos = lerp(from, ends[0], a); ang = dir * (SPATULA_ANGLE + 6 * Math.sin(Math.PI * a)); }
      else if (t < t2) { pos = lerp(ends[0], back, lift); ang = dir * SPATULA_ANGLE * (1 - 2 * lift); s = 1 + 0.1 * Math.sin(Math.PI * lift); }
      else { pos = lerp(back, ends[1], b); ang = -dir * (SPATULA_ANGLE + 6 * Math.sin(Math.PI * b)); s = 1 + 0.06 * clamp((t - t3) / (t4 - t3), 0, 1); }
      place(spat, pos.x, pos.y, s, ang);
      spat.setAttribute('opacity', clamp(Math.min(t / 100, (t4 - t) / (t4 - t3)), 0, 1).toFixed(3));
      set(a, b);
      if (t < t4) { requestAnimationFrame(frame); return; }
      spat.setAttribute('display', 'none');
      svg.classList.remove('is-spreading');
      busy[S] = false;
    };
    requestAnimationFrame(frame);
  }

  function touchSoil(S) {
    const smp = state.samples[S];
    smp.touched = true;
    setCaption(LABELS.caption.noteIt);
    renderFeel(S);
    renderStatus();
    renderSheet();
    renderFooter();
  }

  // Bulle du test « Wet or dry? » sur le bac, jusqu'à ce que l'élève note
  // l'humidité sur sa fiche.
  function renderFeel(S) {
    const box = $(`[data-feel="${S}"]`);
    if (!box) return;
    const smp = state.samples[S];
    const show = smp.touched && !smp.noted;
    if (!show) { box.hidden = true; box.innerHTML = ''; return; }
    if (!box.hidden) return;
    const wet = smp.wet;
    const soil = soilColour(smp);
    const marks = wet
      ? '<path d="M8 27 C9.6 29.8 11 31.2 11 33 A3 3 0 0 1 5 33 C5 31.2 6.4 29.8 8 27 Z M41 25 C42.4 27.4 43.6 28.6 43.6 30.2 A2.6 2.6 0 0 1 38.4 30.2 C38.4 28.6 39.6 27.4 41 25 Z" fill="#4b9fdb"/>'
      : `<circle cx="7" cy="36" r="1.6" fill="${darken(soil, 0.25)}"/><circle cx="41" cy="35" r="1.3" fill="${darken(soil, 0.25)}"/><circle cx="44" cy="38" r="1" fill="${darken(soil, 0.25)}"/>`;
    const pic = `<svg class="so-feel-pic" viewBox="0 0 48 48" aria-hidden="true" focusable="false">` +
      `<path d="M1 41 Q24 33 47 41 V47 H1 Z" fill="${soil}"/>` +
      `<g transform="translate(40 44) rotate(180)"><path d="${GLOVE_PATH}" fill="#8cc4ee" stroke="#4b86b8" stroke-width="1.4" stroke-linejoin="round"/></g>${marks}</svg>`;
    const text = LABELS.touchText[LOCS[smp.key].kind][wet ? 'wet' : 'dry'];
    box.innerHTML = `${pic}<p><b>${LABELS.sample(S)}:</b> ${gloss(text)}<span class="so-feel-ask">${LABELS.caption.noteIt}</span></p>`;
    box.hidden = false;
  }

  // Un tout petit élément ne se prend qu'une fois révélé par la loupe.
  function hitItem(smp, x, y) {
    let best = null, bd = Infinity;
    smp.items.forEach(it => {
      if (it.sorted || isHidden(it)) return;
      const d = Math.hypot(it.x - x, it.y - y);
      if (d < grabR(it) + 5 && d < bd) { best = it; bd = d; }
    });
    return best;
  }

  function tinyNear(smp, x, y) {
    return smp.items.some(it => !it.sorted && isHidden(it) && Math.hypot(it.x - x, it.y - y) < it.rr + 9);
  }

  function select(it) {
    state.selected = it ? it.uid : null;
    renderInspector();
    renderSelection();
    renderBowls();
  }

  // Cercle autour de l'élément examiné.
  function renderSelection() {
    ['A', 'B'].forEach(S => {
      const g = $(`[data-tray="${S}"] [data-sel]`);
      if (!g) return;
      const it = state.selected ? itemByUid(state.selected) : null;
      if (!it || it.S !== S || it.sorted) { g.innerHTML = ''; return; }
      const x = it.x.toFixed(1), y = it.y.toFixed(1), r = (grabR(it) + 5).toFixed(1);
      g.innerHTML = `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#ffffff" stroke-width="4" opacity=".7"/>` +
        `<circle class="so-sel-ring" cx="${x}" cy="${y}" r="${r}" fill="none" stroke-width="2.4" stroke-dasharray="5 3"/>`;
    });
  }

  /* --- Glisser (souris et doigt) ---
     Un geste court = toucher ; au-delà de 6 px, l'élément suit le pointeur
     (fantôme) ; lâché sur une coupelle, il y est trié. */
  function press(e, o) {
    const id = e.pointerId, sx = e.clientX, sy = e.clientY;
    let dragging = false, ghost = null, over = null;
    const setOver = el => {
      if (over === el) return;
      if (over) over.classList.remove('is-over');
      over = el;
      if (over) over.classList.add('is-over');
    };
    const targetAt = ev => {
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      return el && el.closest ? el.closest('[data-bowl]') : null;
    };
    const move = ev => {
      if (ev.pointerId !== id) return;
      if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) {
        dragging = true;
        if (o.onStart) o.onStart();
        if (o.ghost) {
          ghost = document.createElement('div');
          ghost.className = 'so-ghost';
          ghost.innerHTML = o.ghost;
          (document.fullscreenElement || document.body).appendChild(ghost);
        }
      }
      if (!dragging) return;
      if (ghost) {
        ghost.style.transform = `translate(${ev.clientX}px, ${ev.clientY}px) translate(-50%, -50%)`;
        setOver(targetAt(ev));
      }
      if (o.onMove) o.onMove(ev);
    };
    const up = ev => {
      if (ev.pointerId !== id) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      setOver(null);
      if (ghost) ghost.remove();
      if (!dragging) { if (ev.type === 'pointerup' && o.onTap) o.onTap(ev); return; }
      if (ev.type === 'pointerup' && o.onDrop) o.onDrop(ghost ? targetAt(ev) : null, ev);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  // Un élément sur son disque de sol (fantôme, coupelle, panneau de droite).
  function discSVG(it, size) {
    const smp = state.samples[it.S];
    const zoom = T[it.type].tiny ? 2.4 : 1;
    return `<svg viewBox="-17 -17 34 34" width="${size}" height="${size}" aria-hidden="true" focusable="false"><circle r="16.5" fill="${soilColour(smp)}"/><circle r="16.5" fill="none" stroke="#00000026"/>` +
      `<g transform="rotate(${it.rot % 60 - 30}) scale(${zoom})">${itemDrawing(it)}</g></svg>`;
  }

  function pressItem(e, it) {
    press(e, {
      ghost: discSVG(it, 64),
      onStart: () => select(it),
      onTap: () => { select(it); setCaption(LABELS.caption.picked(gloss(`[${nameOf(it)}]`), it.S)); },
      onDrop: t => { if (t) dropInBowl(it, t); }
    });
  }

  function onTrayDown(e, S) {
    if (e.button !== 0) return;
    e.preventDefault();
    if (busy[S]) return;
    const smp = state.samples[S];
    const p = trayPoint(e.currentTarget, e.clientX, e.clientY);
    if (state.tool) { useTool(state.tool, S, p); return; }
    if (!smp.spread) { setCaption(LABELS.caption.heap(S), true); return; }
    const it = hitItem(smp, p.x, p.y);
    if (!it) {
      setCaption(tinyNear(smp, p.x, p.y) ? LABELS.caption.tiny : LABELS.caption.empty);
      return;
    }
    pressItem(e, it);
  }

  // Le geste d'un outil sur un bac (outil en main puis bac touché, ou outil
  // glissé sur le bac) ; l'outil se range ensuite. p : point touché du bac.
  function useTool(t, S, p) {
    if (busy[S]) return;
    const smp = state.samples[S];
    setTool(null);
    if (t === 'spatula') { spread(S, p); return; }
    if (!smp.spread) { setCaption(LABELS.caption.heap(S), true); return; }
    if (t === 'touch') touchSoil(S);
    else if (t === 'magnifier') scanTray(S);
  }

  /* --- Outils --- */
  function renderTools() {
    const box = $('[data-tools]');
    if (!box) return;
    box.innerHTML = ['gloves', 'spatula', 'magnifier', 'touch'].map(t =>
      `<button type="button" class="so-tool ${state.tool === t ? 'is-active' : ''}" data-tool="${t}" aria-pressed="${state.tool === t}">${TOOL_ICON[t]}<span>${LABELS.tools[t]}</span>` +
      `${t === 'gloves' && state.gloves ? '<span class="so-tool-check" aria-hidden="true">✓</span>' : ''}</button>`).join('');
    if (!state.gloves) {
      box.querySelectorAll('[data-tool]:not([data-tool="gloves"])').forEach(b => lab.setLock(b, LABELS.lockGloves, { icon: false }));
    }
    const gl = box.querySelector('[data-tool="gloves"]');
    gl.classList.toggle('lab-is-missing', lab.state.showMissing && !state.gloves);
  }

  function setTool(t) {
    state.tool = t;
    renderTools();
    ['A', 'B'].forEach(S => {
      const svg = $(`[data-tray="${S}"]`);
      if (svg) svg.classList.toggle('has-tool', !!t);
    });
    followTool();
  }

  function toolTap(t) {
    const C = LABELS.caption;
    if (t === 'gloves') {
      if (!state.gloves) {
        state.gloves = true;
        renderTools();
        ['A', 'B'].forEach(S => lab.setLock($(`[data-tray="${S}"]`), null));
        setCaption(C.gloves);
        renderFooter();
        lab.save();
      } else setCaption(C.glovesOn);
      return;
    }
    const next = state.tool === t ? null : t;
    setTool(next);
    setCaption(next ? C[next] : C.noTool);
  }

  /* Outil en main (choisi d'un simple clic) : il suit la souris comme quand
     on le glisse, jusqu'à ce qu'il serve ou qu'on le repose ; au-dessus des
     bacs, il remplace le curseur (son centre est le point qui agit). Au
     doigt, rien à suivre : l'outil se pose là où on touche le bac. Caché
     pendant un autre glisser, et dès que la paillasse n'est plus affichée. */
  let hand = null, handAt = null;   // fantôme de l'outil en main ; dernière position de la souris

  function followTool(e) {
    if (e) handAt = e.pointerType === 'mouse' ? { x: e.clientX, y: e.clientY } : null;
    if (!hand && !(state && state.tool)) return;
    const box = $('[data-tools]');
    const host = document.fullscreenElement || document.body;
    const t = handAt && state.tool && box && box.getClientRects().length && !document.querySelector('.so-ghost:not(.so-hand)') ? state.tool : null;
    if (!t) { if (hand) { hand.remove(); hand = null; } return; }
    if (!hand || hand.dataset.tool !== t || hand.parentNode !== host) {
      if (hand) hand.remove();
      hand = document.createElement('div');
      hand.className = 'so-ghost so-hand';
      hand.dataset.tool = t;
      hand.innerHTML = TOOL_ICON[t].replace('class="so-tool-ic"', 'class="so-ghost-tool"');
      host.appendChild(hand);
    }
    hand.style.transform = `translate(${handAt.x}px, ${handAt.y}px) translate(-50%, -50%)`;
  }
  window.addEventListener('pointermove', followTool);
  window.addEventListener('pointerdown', followTool);

  // Outil glissé sur un bac : son geste s'y applique tout de suite.
  function applyTool(t, S, p) {
    if (t === 'gloves') { toolTap('gloves'); return; }
    useTool(t, S, p);
  }

  function onToolDown(e) {
    const b = e.target.closest('[data-tool]');
    if (!b || e.button !== 0) return;
    e.preventDefault();
    const t = b.dataset.tool;
    press(e, {
      ghost: TOOL_ICON[t].replace('class="so-tool-ic"', 'class="so-ghost-tool"'),
      onStart: () => { if (state.tool) setTool(null); },
      onTap: ev => { toolTap(t); followTool(ev); },
      onDrop: (target, ev) => {
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        const tray = el && el.closest ? el.closest('[data-tray]') : null;
        if (tray) applyTool(t, tray.dataset.tray, trayPoint(tray, ev.clientX, ev.clientY));
      }
    });
  }

  /* --- Coupelles --- */
  function renderBowls() {
    ['A', 'B'].forEach(S => {
      const box = $(`[data-bowls="${S}"]`);
      if (!box) return;
      const smp = state.samples[S];
      box.innerHTML = CATS.map(cat => {
        const here = smp.items.filter(it => it.sorted === cat);
        const chips = here.map(it =>
          `<button type="button" class="so-piece ${state.selected === it.uid ? 'is-selected' : ''}" data-chip="${it.uid}" aria-label="${escapeHtml(nameOf(it))}">${discSVG(it, 26)}</button>`).join('');
        // Coupelle bien remplie : pastilles plus petites, tout reste visible.
        return `<div class="so-bowl ${cat === 'waste' ? 'is-waste' : ''}" data-bowl="${S}:${cat}"><span class="so-bowl-label">${LABELS.cats[cat]}</span><div class="so-dish ${here.length > 4 ? 'is-many' : ''}">${chips}</div></div>`;
      }).join('');
    });
  }

  function onChipDown(e) {
    const c = e.target.closest('[data-chip]');
    if (!c || e.button !== 0) return;
    e.preventDefault();
    const it = itemByUid(c.dataset.chip);
    press(e, {
      ghost: discSVG(it, 64),
      onStart: () => select(it),
      onTap: () => {
        select(state.selected === it.uid ? null : it);
        if (state.selected) setCaption(LABELS.inBowl(LABELS.cats[it.sorted], it.S));
      },
      onDrop: t => { if (t) dropInBowl(it, t); }
    });
  }

  function onBowlClick(e) {
    if (e.target.closest('[data-chip]')) return;
    const b = e.target.closest('[data-bowl]');
    if (!b) return;
    const it = state.selected ? itemByUid(state.selected) : null;
    if (!it) { setCaption(LABELS.caption.tapFirst); return; }
    dropInBowl(it, b);
  }

  function shake(el) {
    el.classList.remove('lab-shake');
    void el.offsetWidth;
    el.classList.add('lab-shake');
  }

  function dropInBowl(it, bowl) {
    const [S, cat] = bowl.dataset.bowl.split(':');
    if (S !== it.S) { shake(bowl); setCaption(LABELS.caption.wrongSample(it.S), true); return; }
    if (it.sorted === cat) { select(null); return; }
    it.sorted = cat;
    const g = $(`[data-tray="${it.S}"] .so-it[data-uid="${it.uid}"]`);
    if (g) g.setAttribute('display', 'none');
    state.selected = null;
    setCaption(LABELS.caption.sorted(gloss(`[${nameOf(it)}]`), LABELS.cats[cat], it.S));
    renderBowls();
    renderSheet();
    renderInspector();
    renderSelection();
    renderFooter();
  }

  /* --- Panneau de droite : l'élément examiné --- */
  function renderInspector() {
    const box = $('[data-inspector]');
    if (!box) return;
    const it = state.selected ? itemByUid(state.selected) : null;
    if (!it) {
      box.className = 'so-inspector is-empty';
      box.innerHTML = `<div class="so-pic">${TOOL_ICON.magnifier}</div><p>${gloss(LABELS.inspectEmpty)}</p>`;
      return;
    }
    box.className = 'so-inspector';
    box.innerHTML = `<div class="so-pic" data-pic>${discSVG(it, 64)}</div>` +
      `<p><b>${gloss(`[${nameOf(it)}]`)}</b> · <span class="so-from-tag">${LABELS.sample(it.S)}</span><br>${gloss(T[it.type].cap)}</p>`;
    box.querySelector('[data-pic]').addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      e.preventDefault();
      press(e, { ghost: discSVG(it, 64), onDrop: t => { if (t) dropInBowl(it, t); } });
    });
  }

  /* --- Fiche d'observation : se remplit toute seule à partir des coupelles.
     Pendant l'expérience, un bloc par échantillon (A au-dessus de B) ; à la
     conclusion, A et B côte à côte pour les comparer. --- */
  function namesIn(S, cat) {
    return [...new Set(state.samples[S].items.filter(i => i.sorted === cat).map(nameOf))];
  }

  function cellHTML(S, cat) {
    const names = namesIn(S, cat);
    if (!names.length) return '<span class="so-dash">—</span>';
    return `<span class="so-cell">${TICK}<span class="so-names">${escapeHtml(names.join(', '))}</span></span>`;
  }

  function wasteFoot() {
    const waste = samples().flatMap(s => s.items.filter(i => i.sorted === 'waste').map(i => `${nameOf(i)} (${s.S})`));
    return `<p class="so-sheet-foot">${waste.length ? escapeHtml(LABELS.notSoil(waste.join(', '))) : '&nbsp;'}</p>`;
  }

  function sheetNoteHTML() {
    const wd = smp => `<span class="so-wd">` + ['wet', 'dry'].map(v =>
      `<button type="button" class="${smp.noted === v ? 'is-selected' : ''} ${smp.touched && !smp.noted ? 'is-asking' : ''} ${lab.state.showMissing && !smp.noted ? 'lab-is-missing' : ''}" data-wd="${smp.S}:${v}" aria-pressed="${smp.noted === v}">${LABELS.wd[v]}</button>`).join('') + `</span>`;
    const row = (k, hint, v) => `<div class="so-note-row"><span class="so-note-k">${k}<small>${hint}</small></span><span class="so-note-v">${v}</span></div>`;
    return samples().map(smp => `<section class="so-note"><h4><span class="so-letter">${smp.S}</span>${LABELS.sample(smp.S)}</h4>` +
      ['living', 'organic', 'mineral'].map(cat => row(LABELS.cats[cat], LABELS.catHints[cat], cellHTML(smp.S, cat))).join('') +
      row(LABELS.water, LABELS.waterHint, wd(smp)) + `</section>`).join('') + wasteFoot();
  }

  function sheetCompareHTML() {
    const wd = S => {
      const smp = state.samples[S];
      return smp.noted ? `<span class="so-wd-read">${LABELS.wd[smp.noted]}</span>` : '<span class="so-dash">—</span>';
    };
    return `<table class="so-sheet"><thead><tr><th scope="col">${LABELS.components}</th><th scope="col"><span class="so-letter">A</span></th><th scope="col"><span class="so-letter">B</span></th></tr></thead><tbody>` +
      ['living', 'organic', 'mineral'].map(cat => `<tr><th scope="row">${LABELS.cats[cat]}<small>${LABELS.catHints[cat]}</small></th><td>${cellHTML('A', cat)}</td><td>${cellHTML('B', cat)}</td></tr>`).join('') +
      `<tr><th scope="row">${LABELS.water}<small>${LABELS.waterHint}</small></th><td>${wd('A')}</td><td>${wd('B')}</td></tr></tbody></table>` + wasteFoot();
  }

  function renderSheet() {
    const box = $('[data-sheet]');
    if (!box) return;
    box.innerHTML = sheetNoteHTML();
    box.querySelectorAll('[data-wd]').forEach(b => {
      const S = b.dataset.wd.split(':')[0];
      if (!state.samples[S].touched) lab.setLock(b, LABELS.lockWd(S));
    });
  }

  function onSheetClick(e) {
    const b = e.target.closest('[data-wd]');
    if (!b) return;
    const [S, v] = b.dataset.wd.split(':');
    state.samples[S].noted = v;
    renderFeel(S);
    renderSheet();
    renderFooter();
    if (!missingReason()) setCaption(LABELS.caption.done);
  }

  /* --- En-têtes des bacs, pied de page --- */
  function renderStatus() {
    ['A', 'B'].forEach(S => {
      const smp = state.samples[S];
      const head = $(`[data-head="${S}"]`);
      if (!head) return;
      const done = [smp.spread, smp.lensUsed, smp.touched];
      head.innerHTML = `<span class="so-letter">${S}</span><strong>${LABELS.sample(S)}</strong><span class="so-from">${gloss(fromText(S))}</span>` +
        `<span class="so-status">` + ['spread', 'lens', 'touch'].map((k, i) => `<i class="${done[i] ? 'is-done' : ''}" title="${LABELS.status[k]}">${MINI[k]}</i>`).join('') + `</span>`;
      const incomplete = !smp.spread || !smp.lensUsed || !smp.touched || !smp.items.some(it => it.sorted);
      const frame = $(`[data-frame="${S}"]`);
      if (frame) frame.classList.toggle('lab-is-missing', lab.state.showMissing && state.gloves && incomplete);
    });
  }

  let stepperDone = null;

  function renderFooter() {
    const n = samples().reduce((k, s) => k + s.items.filter(i => i.sorted).length, 0);
    const info = $('.lab-footer .lab-footer-info');
    if (info) info.textContent = LABELS.sortedInfo(n);
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

  /* ===== Étape 3 : conclusion ===== */
  function renderConclude() {
    const c = state.conclusion;
    const miss = k => lab.state.showMissing && !c[k] ? 'lab-is-missing' : '';
    const chips = (key, options) => `<div class="so-chips">` + Object.keys(options).map(v => {
      const on = c[key] === v;
      return `<button type="button" class="lab-choice so-chip ${on ? 'is-selected' : ''}" data-q="${key}" data-v="${v}" aria-pressed="${on}">${options[v]}</button>`;
    }).join('') + `</div>`;

    lab.body.innerHTML = `<div class="so-conclude">` +
      `<section class="so-sheet-panel so-sheet-read"><h3 class="lab-panel-title">${LABELS.sheetTitle}</h3>${sheetCompareHTML()}</section>` +
      `<section class="so-form">` +
        `<p class="so-reminder">${gloss(LABELS.question)}</p>` +
        `<div class="so-q ${miss('compare')}"><p class="so-q-title">${LABELS.qCompare}</p>${chips('compare', LABELS.compareChoices)}</div>` +
        `<div class="so-q ${miss('location')}"><p class="so-q-title">${LABELS.qLocation}</p>${chips('location', LABELS.locationChoices)}</div>` +
        `<div class="so-q ${miss('verdict')}"><div class="so-chips"><span class="so-q-text">${LABELS.qVerdict}</span>` +
          ['confirmed', 'rejected'].map(v => `<button type="button" class="lab-choice so-chip ${c.verdict === v ? 'is-selected' : ''}" data-q="verdict" data-v="${v}" aria-pressed="${c.verdict === v}">${LABELS[v]}</button>`).join('') + `</div></div>` +
      `</section></div>`;

    $$('[data-q]').forEach(btn => btn.addEventListener('click', () => {
      const k = btn.dataset.q, v = btn.dataset.v;
      c[k] = v;
      renderConclude();
    }));

    const ready = conclusionsComplete();
    lab.renderStepper();
    lab.setFooter(`<button type="button" class="lab-btn lab-btn-ghost" data-back>← ${LABELS.backToLab}</button>` +
      (lab.state.showMissing && !ready ? lab.footerInfo(lab.L.missingConclusions, true) : '') +
      `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-check>${LABELS.checkConclusions}</button></div>`);
    $('[data-back]').addEventListener('click', () => lab.goToStep(2));
    const check = $('[data-check]');
    lab.setLock(check, ready ? null : lab.L.missingConclusions, { missing: true, key: 'check' });
    check.addEventListener('click', () => lab.finish());
  }

  /* ===== Étape 4 : correction ===== */
  const WHY = {
    living: 'It is alive: it moves, feeds or grows. It is a living thing.',
    organic: 'It comes from a living thing, but it is dead: it is organic matter.',
    mineral: 'It comes from rocks: it is mineral matter.',
    waste: 'It is made by humans and does not belong in soil: it is waste.'
  };
  const TRAP_WHY = {
    beetleDead: 'The beetle does not move, even when you touch it: it is dead. A dead animal is organic matter.',
    roots: 'These roots are fresh: they belong to a living plant. They are living things.',
    sand: 'Sand grains are tiny pieces of rock: they are mineral matter.',
    cap: 'A bottle cap is plastic, made by humans: it is waste, not part of the soil.',
    wrapper: 'A sweet wrapper is plastic, made by humans: it is waste, not part of the soil.'
  };
  const whyOf = it => TRAP_WHY[it.type] || WHY[T[it.type].cat];
  const listText = names => names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0] || '';
  // « a pebble », « an earthworm » ; pas d'article pour un pluriel ou une masse.
  const MASS = ['dry grass', 'gravel'];
  const withArticle = n => {
    const p = plain(n);
    return MASS.includes(p) || /s$/.test(p) ? n : `${/^[aeiou]/.test(p) ? 'an' : 'a'} ${n}`;
  };

  const CHECK = {
    sortedOk: n => n === 1 ? 'The thing you sorted is in the right bowl.' : `The ${n} things you sorted are all in the right bowls.`,
    sortedScore: (good, n) => `${good} / ${n} things in the right bowl.`,
    wrongItem: (name, S, put, right) => `Sample ${S}: you put the ${name} in “${put}”, but the right bowl is “${right}”.`,
    missedCat: (S, cat, names, tiny) => {
      const one = names.length === 1 && !/s$/.test(plain(names[0]));
      return `Sample ${S}: you found no ${cat.toLowerCase()}, but it contained ${listText(names.map(withArticle))}.` +
        (tiny ? ` ${one ? 'It is' : 'They are'} very small: look with the magnifying glass.` : '');
    },
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
  };

  // Comparaison de l'hypothèse et de la conclusion, en phrases complètes.
  const COMPARE_SENT = {
    A: 'sample A contains more living things and organic matter.',
    B: 'sample B contains more living things and organic matter.',
    same: 'both samples contain about the same amount of living things and organic matter.'
  };

  function evaluate() {
    const all = samples().flatMap(s => s.items);
    const sorted = all.filter(i => i.sorted);
    const wrong = sorted.filter(i => T[i.type].cat !== i.sorted);
    const missed = [];
    samples().forEach(s => {
      ['living', 'organic', 'mineral'].forEach(cat => {
        const present = s.items.filter(i => T[i.type].cat === cat);
        if (present.length && !present.some(i => i.sorted)) missed.push({ S: s.S, cat, items: present });
      });
    });
    const humidity = samples().map(s => ({ S: s.S, noted: s.noted, real: s.wet ? 'wet' : 'dry', ok: s.noted === (s.wet ? 'wet' : 'dry') }));
    const c = state.conclusion;
    const compareOk = c.compare === state.richLetter;
    const locationOk = c.location === 'yes';
    const should = state.hypothesis === c.compare ? 'confirmed' : 'rejected';
    return {
      sorted, wrong, missed, humidity, compareOk, locationOk, should,
      sorting: sorted.length > 0 && wrong.length === 0,
      observation: missed.length === 0 && humidity.every(h => h.ok),
      conclusion: compareOk && locationOk,
      hypothesis: !!c.verdict && c.verdict === should
    };
  }

  const KEYS = ['sorting', 'observation', 'conclusion', 'hypothesis'];

  function criterionDetail(key, ev) {
    const cats = LABELS.cats;
    if (key === 'sorting') {
      if (!ev.sorted.length) return `<p>${LABELS.missing.sort('A')}</p>`;
      if (!ev.wrong.length) return `<p class="so-ok">${CHECK.sortedOk(ev.sorted.length)}</p>`;
      return `<p>${CHECK.sortedScore(ev.sorted.length - ev.wrong.length, ev.sorted.length)}</p>` +
        `<ul class="so-misslist">${ev.wrong.map(i => `<li>${gloss(CHECK.wrongItem(`[${nameOf(i)}]`, i.S, cats[i.sorted], cats[T[i.type].cat]))} ${whyOf(i)}</li>`).join('')}</ul>`;
    }
    if (key === 'observation') {
      const lines = ev.missed.map(m => `<li>${gloss(CHECK.missedCat(m.S, cats[m.cat], [...new Set(m.items.map(i => `[${nameOf(i)}]`))], m.items.every(i => T[i.type].tiny)))}</li>`)
        .concat(ev.humidity.filter(h => !h.ok).map(h => `<li>${CHECK.humidityWrong(h.S, LABELS.wd[h.noted] || '—', h.real)}</li>`));
      return (ev.missed.length ? '' : `<p class="so-ok">${CHECK.foundAll}</p>`) +
        (lines.length ? `<ul class="so-misslist">${lines.join('')}</ul>` : '') +
        ev.humidity.filter(h => h.ok).map(h => `<p class="so-ok">${CHECK.humidityOk(h.S, LABELS.wd[h.noted])}</p>`).join('');
    }
    if (key === 'conclusion') {
      const rich = state.richLetter, poor = rich === 'A' ? 'B' : 'A';
      return (ev.compareOk ? `<p class="so-ok">${CHECK.compareOk} ${CHECK.compareRight(rich)}</p>` : `<p class="so-ko">${CHECK.compareWrong}</p><p><strong>${CHECK.compareRight(rich)}</strong></p>`) +
        `<p>${gloss(LOCS[state.samples[rich].key].why)}</p><p>${gloss(LOCS[state.samples[poor].key].why)}</p>` +
        (state.samples[poor].wet ? `<p class="so-muted">${CHECK.wetPoor(poor)}</p>` : '') +
        `<p class="${ev.locationOk ? 'so-ok' : 'so-ko'}">${ev.locationOk ? CHECK.locationOk : CHECK.locationWrong}</p>`;
    }
    const c = state.conclusion;
    return `<p><strong>${CHECK.yourHyp}</strong> ${LABELS.report.hyp[state.hypothesis]}</p>` +
      `<p><strong>${CHECK.yourConcl}</strong> ${c.compare ? COMPARE_SENT[c.compare] : '—'}</p>` +
      `<p class="${ev.hypothesis ? 'so-ok' : 'so-ko'}">${ev.hypothesis ? CHECK.verdictOk(c.verdict) : CHECK.verdictWrong(ev.should)}</p>` +
      (ev.should === 'rejected' ? `<p class="so-muted">${CHECK.rejectedNote}</p>` : '');
  }

  function renderCheck() {
    const ev = evaluate();
    const score = KEYS.filter(k => ev[k]).length;
    const rows = KEYS.map(k => `<button type="button" class="so-crit ${ev[k] ? 'is-ok' : 'is-ko'} ${state.crit === k ? 'is-selected' : ''}" data-crit="${k}">` +
      `<span class="so-crit-text"><strong>${LABELS.criteria[k]}</strong><small>${LABELS.criteriaSub[k]}</small></span>` +
      `<span class="so-crit-mark" aria-label="${ev[k] ? 'correct' : 'incorrect'}">${ev[k] ? '✓' : '✗'}</span></button>`).join('');

    lab.body.innerHTML = `<div class="so-check">` +
      `<div class="so-check-left">` +
        `<div class="lab-score"><span class="lab-score-num">${score}<small> / 4</small></span><span class="lab-score-label">${LABELS.scoreLabel}</span></div>` +
        `<div class="so-crit-list">${rows}</div>` +
        `<p class="so-reminder">${gloss(LABELS.question)}</p>` +
      `</div>` +
      `<div class="so-check-detail" aria-live="polite"><h3>${LABELS.criteria[state.crit]}</h3>${criterionDetail(state.crit, ev)}</div>` +
      `</div>`;

    $$('[data-crit]').forEach(btn => btn.addEventListener('click', () => {
      state.crit = btn.dataset.crit;
      renderCheck();
    }));
    lab.fillSpace(lab.$('.so-check-detail'));
    lab.checkFooter();
  }

  /* ===== Rapport imprimable : contenu des 7 sections de la fiche outil FO3
     (en-tête, numérotation et mise en page : cadre commun) =====
     Les erreurs passent par mark() (lab-engine.js) : case de la fiche mal
     remplie (élément mal trié, catégorie manquée, humidité fausse),
     comparaison, réponse sur le lieu, composition du sol et jugement de
     l'hypothèse. Les notes reprennent les explications de l'étape Check. */
  function buildReport(mark) {
    const R = LABELS.report;
    const ev = evaluate();
    const cats = LABELS.cats;
    const c = state.conclusion;

    const cell = (s, cat) => {
      const here = s.items.filter(i => i.sorted === cat);
      const names = [...new Set(here.map(nameOf))];
      const text = names.length ? `✓ ${escapeHtml(names.join(', '))}` : '—';
      const notes = here.filter(i => T[i.type].cat !== cat).map(i => `${CHECK.wrongItem(nameOf(i), s.S, cats[cat], cats[T[i.type].cat])} ${whyOf(i)}`);
      const m = ev.missed.find(x => x.S === s.S && x.cat === cat);
      if (m) notes.push(plain(CHECK.missedCat(s.S, cats[cat], [...new Set(m.items.map(nameOf))], m.items.every(i => T[i.type].tiny))));
      return notes.length ? mark(text, notes.join(' '), { box: true }) : text;
    };
    const water = s => {
      const h = ev.humidity.find(x => x.S === s.S);
      const text = s.noted ? LABELS.wd[s.noted] : '—';
      return h.ok ? text : mark(text, CHECK.humidityWrong(s.S, text, h.real), { box: true });
    };
    const rows = ['living', 'organic', 'mineral'].map(cat => `<tr><th>${cats[cat]}</th>${samples().map(s => `<td>${cell(s, cat)}</td>`).join('')}</tr>`).join('') +
      `<tr><th>${LABELS.water}</th>${samples().map(s => `<td>${water(s)}</td>`).join('')}</tr>`;
    const wasteItems = samples().flatMap(s => s.items.filter(i => i.sorted === 'waste'));
    const wasteLine = wasteItems.length
      ? `<p>${cats.waste}: ${wasteItems.map(i => {
        const t = `${escapeHtml(nameOf(i))} (${i.S})`;
        return T[i.type].cat === 'waste' ? t : mark(t, `${CHECK.wrongItem(nameOf(i), i.S, cats.waste, cats[T[i.type].cat])} ${whyOf(i)}`);
      }).join(', ')}</p>` : '';

    const counts = s => {
      const parts = ['living', 'organic', 'mineral'].map(cat => [cat, s.items.filter(i => i.sorted === cat).length]).filter(([, n]) => n > 0).map(([cat, n]) => R.count(n, cat));
      return parts.length ? listText(parts) : R.countsNone;
    };
    const interp = samples().map(s => R.found(s.S, plain(fromText(s.S)), counts(s))).join(' ') + ' ' +
      (c.compare ? (ev.compareOk ? R.compare[c.compare] : mark(R.compare[c.compare], `${CHECK.compareRight(state.richLetter)} ${plain(LOCS[state.samples[state.richLetter].key].why)}`)) : '—');

    const conclusion = [
      c.location ? (ev.locationOk ? R.location[c.location] : mark(R.location[c.location], CHECK.locationWrong)) : '—',
      c.verdict ? R.verdict(ev.hypothesis ? LABELS[c.verdict] : mark(LABELS[c.verdict], CHECK.verdictWrong(ev.should))) : '—'
    ].join(' ');

    const correction = KEYS.map(k => `<tr><th>${LABELS.criteria[k]}</th><td class="${ev[k] ? 'ok' : 'ko'}">${ev[k] ? '✓' : '✗'}</td></tr>`).join('');

    return {
      title: R.title,
      sections: [
        `<p>${plain(LABELS.question)}</p>`,
        `<p>${R.hyp[state.hypothesis] || '—'}</p>` + (state.because.trim() ? `<p>${R.because}: ${escapeHtml(state.because.trim())}</p>` : ''),
        `<p>${R.materials(plain(fromText('A')), plain(fromText('B')))}</p>`,
        `<ol>${R.procedure.map(p => `<li>${p}</li>`).join('')}</ol>`,
        `<table class="so-report-table"><tr><th></th><th>${LABELS.sample('A')}</th><th>${LABELS.sample('B')}</th></tr>${rows}</table>${wasteLine}`,
        `<p>${interp}</p>`,
        `<p>${conclusion}</p>`
      ],
      correction: `<p><strong>${R.score(KEYS.filter(k => ev[k]).length)}</strong></p><table class="so-report-corr">${correction}</table>`
    };
  }

  lab = LabEngine.create({
    id: 'soil',
    title: LABELS.title,
    glossary: GLOSSARY,
    reset,
    stepComplete,
    lockReason,
    isStarted: () => !!state.hypothesis || state.gloves,
    render: { 1: renderPredict, 2: renderExperiment, 3: renderConclude, 4: renderCheck },
    report: buildReport,
    version: 1,
    save: () => ({ state }),
    // L'outil en main et l'élément examiné ne sont pas repris.
    load(data) {
      const s = data.state;
      if (!s || !['A', 'B'].every(S => s.samples[S] && LOCS[s.samples[S].key] && s.samples[S].items.every(i => T[i.type]))) throw new Error('labProgress');
      state = Object.assign(s, { tool: null, selected: null });
      stepperDone = null;
    },
    summary() {
      const ev = evaluate();
      const criteria = {};
      KEYS.forEach(k => { criteria[k] = ev[k]; });
      return {
        score: KEYS.filter(k => ev[k]).length,
        total: 4,
        criteria,
        details: {
          places: { A: state.samples.A.key, B: state.samples.B.key },
          hypothesis: state.hypothesis,
          wrongSorted: ev.wrong.map(i => ({ type: i.type, put: i.sorted })),
          missed: ev.missed.map(m => ({ sample: m.S, cat: m.cat })),
          humidityWrong: ev.humidity.filter(h => !h.ok).map(h => h.S)
        }
      };
    }
  });
})();
