/* ===== Labo virtuel « The great melting race » (phys2) : chaleur et température =====

   Simulation propre à ce labo, commune aux deux filières ; ses textes sont
   dans le dossier du chapitre, un fichier par langue (lab-melting.en.js,
   lab-melting.nl.js). Le cadre commun (modale, barre d'étapes, verrous,
   traduction, glisser-déposer, rapport imprimé) est dans lab-engine.js.
   Ordre de chargement : moteur, textes, ce fichier.

   Pas de labo réel repris : expérience pensée à partir du cours (PART 2,
   Missions 5 et 6 : température, agitation des particules, chaleur), sur
   un modèle simplifié (boîtes parfaitement isolées, glace à 0 °C ; dit à
   l'élève au Check).

   Tiré au sort à chaque nouveau labo : une paire d'eaux parmi cinq (une
   tasse d'eau très chaude, une cruche d'un litre plus tiède). Masse fondue
   = volume × température / 80, arrondie à 5 g (valeurs réelles : 334 J
   pour fondre 1 g de glace, 4,18 J par gramme d'eau et par degré) : selon
   la paire, la tasse gagne, la cruche gagne, ou égalité. Les deux blocs
   pèsent toujours 600 g : il en reste dans chaque boîte (sinon la course
   ne compare plus rien), mais une grande part fond et cela se voit.

   Déroulé :
     1. Predict    — deux paris par boutons : quelle eau fait fondre le plus
                     de glace ; quand la glace ne fond plus, quelle eau est la
                     plus chaude. « Why do you think so? » facultatif
     2. Experiment — volumes et températures de départ donnés (déjà dans le
                     carnet), thermomètres déjà dans les eaux ; peser chaque
                     bloc, un bloc par boîte ; verser ; la loupe à particules
                     montre les deux boîtes côte à côte (tout le contenu, un
                     point = beaucoup de particules) : noter ; « Start the
                     race » : 40 minutes d'un seul tenant, thermomètres,
                     glace et particules ensemble ; noter les températures
                     finales et ce que montre la loupe ; sortir et repeser
                     chaque bloc ; calculer la masse fondue
     3. Conclude   — le gagnant, et si c'était l'eau la plus chaude ;
                     température, énergie thermique, chaleur, fin de la
                     fonte ; jugement des deux paris
     4. Check      — 5 vérifications : mesures, particules, gagnant,
                     chaleur et température, jugement ; rapport (FO3) */

(function () {
  'use strict';

  const { escapeHtml, mulberry32, seedFrom, ease, reduceMotion } = LabEngine.util;

  // Cadre commun, créé en fin de fichier (LabEngine.create).
  let lab;
  const $ = sel => lab.$(sel);
  const $$ = sel => lab.$$(sel);
  const gloss = text => lab.gloss(text);
  const plain = text => String(text).replace(/\[([^\]|]+)(?:\|[^\]]+)?\]/g, '$1');

  /* ===== Textes =====
     Dans le dossier du chapitre, un fichier par langue, chargé avant
     celui-ci. Nombres entiers ; températures par LABELS.deg (signe moins
     typographique), volumes et masses par LABELS.vol et LABELS.mass. */
  const {
    labels: LABELS, glossary: GLOSSARY, explanations: EXPLAIN, check: CHECK
  } = LabEngine.textFor('melting');
  const deg = LABELS.deg;
  const tempText = v => `${deg(v)} ${LABELS.units.c}`;

  /* ===== Modèle =====
     mug : la tasse (petit volume, très chaude) ; jug : la cruche (1 L,
     plus tiède). L'eau refroidit vers 0 °C en exp(−t/τ), τ plus long pour
     plus d'eau ; la glace fond au même rythme que l'eau perd sa
     température. Au bout de 40 minutes, les deux thermomètres sont à 0 °C
     depuis un moment, quelle que soit la paire. */
  const PAIRS = [
    { mug: { v: 200, t: 90 }, jug: { v: 1000, t: 25 } },   // cruche
    { mug: { v: 250, t: 80 }, jug: { v: 1000, t: 40 } },   // cruche
    { mug: { v: 500, t: 80 }, jug: { v: 1000, t: 30 } },   // tasse
    { mug: { v: 400, t: 90 }, jug: { v: 1000, t: 20 } },   // tasse
    { mug: { v: 250, t: 80 }, jug: { v: 1000, t: 20 } }    // égalité
  ];
  const ICE = 600;          // g : chaque bloc (plus que la plus grande masse fondue, 500 g)
  const SIDES = ['mug', 'jug'];
  const CHOICES = ['mug', 'jug', 'same'];
  const FIELDS = ['vol', 't0', 'ice0', 't1', 'ice1', 'melted'];
  const GIVEN = ['vol', 't0'];                        // données, déjà dans le carnet
  const NOTED = ['ice0', 't1', 'ice1', 'melted'];     // à écrire par l'élève
  const SEEN = ['fastStart', 'moreStart', 'fastEnd'];
  const CRITERIA = ['measure', 'particles', 'winner', 'heat', 'verdict'];
  const RACE_MIN = 40;      // minutes de la course
  const RACE_MS = 14000;    // sa durée à l'écran
  const DOT = 25;           // g d'eau (liquide ou solide) par point de la loupe
  const DASH = '—';

  let run;      // tirage
  let state;    // travail de l'élève
  let pouring = null;   // { side, p } pendant qu'une eau se verse
  let racing = false;   // pendant l'animation de la course

  const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const round5 = v => Math.round(v / 5) * 5;
  const clamp01 = v => Math.max(0, Math.min(1, v));

  const freshConcl = () => ({ most: null, hottest: null, temp: null, energy: null, heat: null, stop: null, vWinner: null, vFinal: null });

  function reset() {
    run = { pair: randInt(0, PAIRS.length - 1), ice: ICE, seed: String(Math.random()) };
    const notes = side => ({ vol: water0(side).v, t0: water0(side).t, ice0: null, t1: null, ice1: null, melted: null });
    state = {
      bets: { winner: null, final: null },
      because: '',
      started: false,     // l'hypothèse se fige au premier geste de l'expérience
      // pos : 'tray' | 'balance' | 'mug' | 'jug' (dans la boîte de ce côté) ;
      // side : la boîte où l'eau l'a recouvert ; out : ressorti à la fin.
      blocks: [0, 1].map(() => ({ pos: 'tray', weighed: false, side: null, out: false })),
      poured: { mug: false, jug: false },
      raced: false,
      notes: { mug: notes('mug'), jug: notes('jug') },
      seen: { fastStart: null, moreStart: null, fastEnd: null },
      concl: freshConcl(),
      selected: CRITERIA[0]
    };
    lensSims = {};
  }

  const water0 = side => PAIRS[run.pair][side];
  const finalMelt = side => round5(water0(side).v * water0(side).t / 80);
  const tau = side => 2 + 4 * water0(side).v / 1000;
  const exactTemp = (side, min) => water0(side).t * Math.exp(-min / tau(side));
  const readingAt = (side, min) => Math.round(exactTemp(side, min)) + 0;
  // Glace fondue à l'instant min (en minutes depuis le versement).
  const meltAt = (side, min) => (readingAt(side, min) === 0 ? finalMelt(side)
    : Math.round(finalMelt(side) * (1 - exactTemp(side, min) / water0(side).t)));

  const now = () => (state.raced ? RACE_MIN : 0);
  const finished = () => state.raced && !racing;
  const blockIn = side => state.blocks.find(b => b.pos === side) || null;
  const onBalance = () => state.blocks.find(b => b.pos === 'balance') || null;
  const sideOut = side => state.blocks.some(b => b.out && b.side === side);
  const bothPoured = () => SIDES.every(s => state.poured[s]);

  // Ce que montrent la balance et les thermomètres : la vérité du labo.
  const truth = (side, f) => ({
    vol: water0(side).v, t0: water0(side).t, ice0: run.ice, t1: 0, ice1: run.ice - finalMelt(side)
  }[f]);
  // Masse fondue juste : la soustraction des masses notées par l'élève.
  const meltedTruth = side => {
    const n = state.notes[side];
    return n.ice0 != null && n.ice1 != null ? n.ice0 - n.ice1 : finalMelt(side);
  };

  function blockMass(b) {
    if (b.out) return run.ice - finalMelt(b.side);
    if (SIDES.includes(b.pos) && state.poured[b.pos]) return run.ice - meltAt(b.pos, now());
    return run.ice;
  }

  // Le vrai gagnant et le gagnant d'après les masses fondues notées.
  const winnerOf = (a, b) => (a === b ? 'same' : a > b ? 'mug' : 'jug');
  const trueWinner = () => winnerOf(finalMelt('mug'), finalMelt('jug'));
  function notedWinner() {
    const a = state.notes.mug.melted, b = state.notes.jug.melted;
    return a != null && b != null ? winnerOf(a, b) : trueWinner();
  }
  function notedFinal() {
    const a = state.notes.mug.t1, b = state.notes.jug.t1;
    return a != null && b != null ? winnerOf(a, b) : 'same';
  }

  /* Ce qu'on voit d'un côté à l'instant min : l'eau encore dans son
     récipient (contFill, de 0 à 1), l'eau et la glace dans la boîte, la
     température de l'eau. Pendant un versement, la part déjà versée. */
  function sideView(side, min) {
    const pour = pouring && pouring.side === side ? pouring.p : null;
    const flow = pour == null ? 1 : clamp01((pour - 0.15) / 0.7);
    const poured = state.poured[side];
    const block = blockIn(side);
    const melt = !poured || pour != null ? 0 : sideOut(side) ? finalMelt(side) : meltAt(side, min);
    const water = poured ? water0(side).v * flow + melt : 0;
    const ice = block ? run.ice - melt : 0;
    return {
      contFill: poured ? 1 - flow : 1,
      tilt: pour == null ? 0 : pour < 0.85 ? clamp01(pour / 0.15) : clamp01((1 - pour) / 0.15),
      stream: pour != null && pour > 0.12 && pour < 0.88,
      water,
      ice,
      lay: boxLayout(water, ice),
      temp: poured && pour == null ? exactTemp(side, min) : water0(side).t,
      reading: poured && pour == null ? readingAt(side, min) : water0(side).t,
      lid: poured && pour == null && !sideOut(side)
    };
  }

  /* ===== Dessins =====
     Paillasse de 470 × 400 (dessus à y = 364) : à gauche, le plateau des
     blocs (en haut) et la balance (en bas), chacun dans une grande zone où
     poser ; puis la tasse et la cruche, chacune au-dessus de sa boîte
     isolante (en coupe : on voit l'eau et la glace). Tout ce qui change est
     en SVG. */
  let svgUid = 0;
  const svg = (w, h, inner, cls, extra) => `<svg class="${cls || ''}" viewBox="0 0 ${w} ${h}" ${extra || ''} aria-hidden="true" focusable="false">${inner}</svg>`;

  const GLASS = '#8ea6b6';
  const WATER = '#9ccbea';
  const STAGE = { W: 470, H: 400, floor: 364 };
  const X = { mug: 152, jug: 314 };     // colonne de chaque côté (récipient au-dessus de sa boîte)
  const BOX_TOP = 222;                  // haut de la boîte (couvercle compris)
  const BOX = { W: 112, left: 14, floor: 130 };
  // Blocs hors des boîtes : centre et bas du dessin, dans la scène.
  const TRAY_SLOTS = [{ x: 42, y: 158 }, { x: 108, y: 158 }];
  const BALANCE_SLOT = { x: 75, y: 286 };

  // Taille d'un bloc de glace (px), selon sa masse.
  const iceSize = m => Math.round(60 * Math.cbrt(Math.max(m, 0) / ICE));

  /* Eau et glace dans la boîte (repère de la boîte, 140 × 142) : la glace
     repose au fond tant qu'il y a peu d'eau, flotte sinon (un dixième
     au-dessus de l'eau). */
  function boxLayout(water, ice) {
    const W = BOX.W;
    const s = ice > 0 ? iceSize(ice) : 0;
    const area = water * 0.055 * W;
    let h = area / W;
    let iceBottom = BOX.floor;
    if (s) {
      const rest = area / (W - s);
      if (rest <= 0.88 * s) h = rest;
      else { h = (area + 0.88 * s * s) / W; iceBottom = BOX.floor - h + 0.88 * s; }
    }
    return { s, h, waterTop: BOX.floor - h, iceTop: iceBottom - s, iceLeft: BOX.left + (W - s) / 2 };
  }

  const ICE_SVG = svg(40, 40,
    `<rect x="1.5" y="1.5" width="37" height="37" rx="6" fill="#eaf5fc" stroke="#86b6d6" stroke-width="1.6"/>` +
    `<path d="M8,10 L8,20 M10,8 L19,8" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M26,32 L32,32 L32,26" fill="none" stroke="#c4def0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`, 'mr-ice-svg');
  const ICE_INNER = ICE_SVG.replace(/^<svg[^>]*>|<\/svg>$/g, '');

  // Thermomètre numérique en stylo : afficheur en haut, tige (page Mission).
  const PROBE_ICON = svg(20, 52, `<rect x="3" y="2" width="14" height="17" rx="3" fill="#3b4652"/>` +
    `<rect x="5.5" y="5" width="9" height="6" rx="1" fill="#a6f5b8"/>` +
    `<line x1="10" y1="19" x2="10" y2="49" stroke="#aab4be" stroke-width="3.2" stroke-linecap="round"/>`, 'mr-probe-icon');

  const LENS_ICON = svg(48, 48, `<line x1="30" y1="30" x2="43" y2="43" stroke="#6b5233" stroke-width="7" stroke-linecap="round"/>` +
    `<circle cx="20" cy="20" r="14" fill="#d8ecf9" fill-opacity="0.7" stroke="#4b5a68" stroke-width="5"/>` +
    `<circle cx="16" cy="17" r="2.2" fill="#2a78d6"/><circle cx="24" cy="15" r="2.2" fill="#2a78d6"/><circle cx="21" cy="24" r="2.2" fill="#2a78d6"/>` +
    `<path d="M11,14 q2,-5 7,-6" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>`, 'mr-lens-icon');

  const STEAM = [0, 1, 2].map(i => `<path class="mr-steam" style="animation-delay: ${(-i * 0.7).toFixed(1)}s" d="M${58 + i * 9},62 q-5,-8 0,-15 q5,-7 0,-14" fill="none" stroke="#b3c2cf" stroke-width="2.2" stroke-linecap="round"/>`).join('');

  /* La tasse (verre) et la cruche graduée, 140 × 150. fill : part de l'eau
     encore dedans ; tilt : de 0 à 1, penchée pour verser au-dessus de la
     boîte (pivot près du bord qui verse). */
  const MUG = {
    outline: 'M44,66 L44,138 Q44,147 53,147 L95,147 Q104,147 104,138 L104,66',
    clip: 'M46,66 L46,138 Q46,145 53,145 L95,145 Q102,145 102,138 L102,66 Z',
    handle: 'M104,82 C124,82 124,124 104,124',
    bottom: 145, height: 76, capacity: 550, pivot: [44, 66], angle: -62
  };
  const JUG = {
    outline: 'M30,30 L36,140 Q37,147 44,147 L96,147 Q103,147 104,140 L110,30 M30,30 L20,23',
    clip: 'M32,31 L38,140 Q39,145 44,145 L96,145 Q101,145 102,140 L108,31 Z',
    handle: 'M110,46 C132,48 131,108 105,110',
    bottom: 145, height: 113, capacity: 1250, pivot: [22, 26], angle: -58
  };

  function contInner(side, fill, tilt) {
    const c = side === 'mug' ? MUG : JUG;
    const w = water0(side);
    const uid = `mrc${++svgUid}`;
    const levelOf = v => c.bottom - c.height * v / c.capacity;
    const level = levelOf(w.v * fill);
    let marks = '';
    if (side === 'mug') {
      const y = levelOf(w.v);
      marks = `<line x1="44" x2="52" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${GLASS}" stroke-width="1.6"/>` +
        `<text class="mr-grad" x="40" y="${(y + 3.5).toFixed(1)}" text-anchor="end">${LABELS.vol(w.v)}</text>`;
    } else {
      [250, 500, 750, 1000].forEach(g => {
        const y = levelOf(g);
        const x = 30 + 6 * (y - 30) / 110 + 3;
        marks += `<line x1="${x.toFixed(1)}" x2="${(x + 10).toFixed(1)}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${GLASS}" stroke-width="1.4"/>` +
          `<text class="mr-grad" x="${(x + 13).toFixed(1)}" y="${(y + 3.5).toFixed(1)}">${g}</text>`;
      });
      marks += `<text class="mr-grad" x="70" y="44">${LABELS.units.ml}</text>`;
    }
    const water = fill > 0
      ? `<rect x="0" y="${level.toFixed(1)}" width="140" height="${(150 - level).toFixed(1)}" fill="${WATER}" fill-opacity="0.65"/>` +
        `<line x1="0" x2="140" y1="${level.toFixed(1)}" y2="${level.toFixed(1)}" stroke="#7fb5da" stroke-width="1.5"/>`
      : '';
    const steam = fill > 0.5 && !tilt && w.t >= 50 ? STEAM : '';
    const body = `<defs><clipPath id="${uid}"><path d="${c.clip}"/></clipPath></defs>` +
      `<path d="${c.clip}" fill="#f4f9fc"/>` +
      `<g clip-path="url(#${uid})">${water}</g>` + marks +
      `<path d="${c.handle}" fill="none" stroke="${GLASS}" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="${c.outline}" fill="none" stroke="${GLASS}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
    const a = (c.angle * tilt).toFixed(1);
    return steam + (tilt ? `<g transform="rotate(${a} ${c.pivot[0]} ${c.pivot[1]})">${body}</g>` : body);
  }

  /* La boîte isolante en coupe, 140 × 142 : parois épaisses (isolant
     hachuré), intérieur de x = 14 à 126, fond à y = 130. Derrière : les
     parois et l'intérieur ; devant (ne se touche pas) : l'eau et le
     couvercle. */
  function boxBackInner() {
    const uid = `mrh${++svgUid}`;
    return `<defs><pattern id="${uid}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">` +
      `<rect width="6" height="6" fill="#f3ead6"/><line x1="0" y1="0" x2="0" y2="6" stroke="#ddcca6" stroke-width="2"/></pattern></defs>` +
      `<path d="M2,14 L2,134 Q2,142 10,142 L130,142 Q138,142 138,134 L138,14 L126,14 L126,130 L14,130 L14,14 Z" fill="url(#${uid})" stroke="#9aa6b2" stroke-width="1.5" stroke-linejoin="round"/>` +
      `<rect x="14" y="14" width="112" height="116" fill="#f6f9fb"/>`;
  }

  function boxFrontInner(v) {
    const L = v.lay;
    let out = '';
    if (v.water > 0) {
      out += `<rect x="14" y="${L.waterTop.toFixed(1)}" width="112" height="${(BOX.floor - L.waterTop).toFixed(1)}" fill="${WATER}" fill-opacity="0.55"/>` +
        `<line x1="14" x2="126" y1="${L.waterTop.toFixed(1)}" y2="${L.waterTop.toFixed(1)}" stroke="#7fb5da" stroke-width="1.6"/>`;
    }
    if (v.lid) out += `<rect x="0" y="2" width="140" height="12" rx="4" fill="#e3e9ee" stroke="#9aa6b2" stroke-width="1.5"/>`;
    return out;
  }

  // Bloc de glace dans la boîte : le bouton suit la place du dessin.
  function placeIceInBox(el, v) {
    const L = v.lay;
    el.style.left = `${L.iceLeft.toFixed(1)}px`;
    el.style.top = `${L.iceTop.toFixed(1)}px`;
    el.style.width = el.style.height = `${L.s}px`;
  }

  function balanceInner(mass) {
    return `<rect x="10" y="6" width="90" height="7" rx="3.5" fill="#cfd6dd" stroke="#9aa5b1" stroke-width="1.2"/>` +
      `<rect x="48" y="13" width="14" height="8" fill="#aeb7c0"/>` +
      `<rect x="4" y="20" width="102" height="62" rx="8" fill="#e3e7eb" stroke="#aab4be" stroke-width="1.5"/>` +
      `<rect x="14" y="31" width="82" height="26" rx="5" fill="#1d2a23"/>` +
      `<text class="mr-lcd" x="90" y="50" text-anchor="end" data-mass-display>${LABELS.mass(mass)}</text>`;
  }

  // Plateau des blocs, w de large (dessus à y = 8).
  const trayInner = w => `<path d="M3,8 L${w - 3},8 L${w - 10},24 L10,24 Z" fill="#dfe5ea" stroke="#9aa6b2" stroke-width="1.5" stroke-linejoin="round"/>` +
    `<line x1="10" x2="${w - 10}" y1="12" y2="12" stroke="#ffffff" stroke-width="2"/>`;

  /* Thermomètre plongé dans chaque eau, d'office : afficheur au-dessus de
     l'eau, tige jusqu'au fond. Dans le récipient avant de verser, dans la
     boîte ensuite. */
  function probeSpot(side) {
    const inBox = state.poured[side] && !(pouring && pouring.side === side);
    if (inBox) return { lcd: [X[side] + 78, 184], stick: [X[side] + 116, 208, BOX_TOP + 122] };
    return side === 'mug'
      ? { lcd: [X.mug + 72, 34], stick: [X.mug + 94, 58, 146] }
      : { lcd: [X.jug + 64, 2], stick: [X.jug + 92, 26, 146] };
  }

  function overlayInner() {
    let out = '';
    SIDES.forEach(side => {
      const s = probeSpot(side).stick;
      out += `<line x1="${s[0]}" y1="${s[1]}" x2="${s[0]}" y2="${s[2]}" stroke="#aab4be" stroke-width="3.4" stroke-linecap="round"/>` +
        `<line x1="${s[0]}" y1="${s[1]}" x2="${s[0]}" y2="${s[1] + 8}" stroke="#3b4652" stroke-width="5" stroke-linecap="round"/>`;
    });
    if (pouring) {
      const side = pouring.side;
      const v = sideView(side, 0);
      if (v.stream) {
        const c = side === 'mug' ? MUG : JUG;
        const x = X[side] + c.pivot[0];
        const y0 = 6 + c.pivot[1];
        const y1 = BOX_TOP + v.lay.waterTop;
        out += `<path d="M${x},${y0} C${x - 6},${y0 + 30} ${x - 4},${y1 - 30} ${x - 2},${y1}" fill="none" stroke="${WATER}" stroke-width="6" stroke-linecap="round" stroke-opacity="0.9"/>`;
      }
    }
    return out;
  }

  // Le matériel du jour, pour l'étape Predict : rien n'est encore versé.
  function sceneArt() {
    const label = side => `<text class="mr-art-label" x="70" y="166" text-anchor="middle">${LABELS.vol(water0(side).v)} · ${tempText(water0(side).t)}</text>`;
    const s = iceSize(run.ice);
    const blocks = [0, 1].map(i => `<svg x="${8 + i * (s + 8)}" y="${62 - s}" width="${s}" height="${s}" viewBox="0 0 40 40">${ICE_INNER}</svg>`).join('');
    return svg(430, 176, `<svg x="0" y="0" width="140" height="176" viewBox="0 0 140 176">${contInner('mug', 1, 0)}${label('mug')}</svg>` +
      `<svg x="140" y="0" width="140" height="176" viewBox="0 0 140 176">${contInner('jug', 1, 0)}${label('jug')}</svg>` +
      `<svg x="286" y="78" width="144" height="90" viewBox="0 0 144 90">${blocks}<svg x="0" y="54" width="144" height="28" viewBox="0 0 144 28">${trayInner(144)}</svg></svg>`, 'mr-art-svg');
  }

  /* ===== La loupe à particules =====
     Elle montre tout le contenu de chaque boîte, les deux côte à côte, en
     modèle : un point = beaucoup de particules d'eau (DOT grammes), les
     mêmes dans la glace et dans l'eau liquide (même substance). La glace :
     points rangés, qui vibrent sur place ; l'eau : points qui bougent en
     tous sens, d'autant plus vite que l'eau est chaude (vitesse exagérée
     pour se voir : 10 + 1,5 × T px/s, traînée proportionnelle). Contre la
     glace, les chocs : un éclair, la particule d'eau repart plus lentement
     un instant, la particule de glace touchée vibre plus fort. Quand la
     glace fond, ses points du haut se détachent et deviennent des points
     d'eau. Repère : 240 × 244, intérieur de 8 à 232 ; seul le bas de la
     boîte (y ≥ 30) est dessiné : l'eau et la glace n'en montent jamais plus
     haut, et l'échelle reste la même pour les deux boîtes. Particules
     grosses (rayon 6,5) : la vue est étroite (deux côte à côte). */
  const LV = { x0: 8, x1: 232, top: 40, floor: 236, sp: 22, R: 6.5, cell: 600 };
  const speedOf = temp => 10 + 1.5 * Math.max(0, temp);
  const lensCols = () => Math.ceil(Math.sqrt(run.ice / DOT));

  /* Place du bloc et niveau de l'eau, d'après les nombres de points. Comme
     dans la boîte : la glace flotte, un dixième au-dessus de l'eau, dès que
     l'eau est assez profonde ; sinon elle repose au fond (peu d'eau). */
  const FLOAT = 0.9;
  function lensGeom(nIce, nW) {
    const cols = lensCols();
    const rows = Math.ceil(nIce / cols);
    const W = LV.x1 - LV.x0;
    const iceW = nIce ? cols * LV.sp : 0;
    const iceH = rows * LV.sp;
    const area = nW * LV.cell;
    let h = area / W;
    let iceBottom = LV.floor;
    if (nIce) {
      const rest = area / (W - iceW);
      if (rest <= FLOAT * iceH) h = rest;
      else { h = (area + FLOAT * iceW * iceH) / W; iceBottom = LV.floor - h + FLOAT * iceH; }
    }
    const top = Math.max(LV.top, LV.floor - h);
    return { cols, ice: { x: (LV.x0 + LV.x1 - iceW) / 2, y: iceBottom - iceH, w: iceW, h: iceH }, waterTop: top };
  }

  // Place d'une particule de glace : rangées depuis le bas, la dernière centrée.
  function icePos(g, nIce, i) {
    const r = Math.floor(i / g.cols);
    const inRow = Math.min(g.cols, nIce - r * g.cols);
    const shift = (g.cols - inRow) * LV.sp / 2;
    return { x: g.ice.x + shift + (i % g.cols) * LV.sp + LV.sp / 2, y: g.ice.y + g.ice.h - r * LV.sp - LV.sp / 2 };
  }

  function waterDot(m, rnd) {
    const R = LV.R;
    const ice = m.ice;
    const h = LV.floor - m.waterTop;
    let x = 0, y = 0;
    for (let tries = 0; tries < 300; tries++) {
      x = LV.x0 + R + rnd() * (LV.x1 - LV.x0 - 2 * R);
      y = m.waterTop + R + rnd() * Math.max(0, h - 2 * R);
      if (!(ice.w && x > ice.x - R - 1 && x < ice.x + ice.w + R + 1 && y > ice.y - R - 1 && y < ice.y + ice.h + R + 1)) break;
    }
    const a = rnd() * Math.PI * 2;
    return { x, y, dx: Math.cos(a), dy: Math.sin(a), hit: 0 };
  }

  // content : { water, ice, temp } ; rnd : générateur (dessin figé : à graine).
  function lensModel(content, rnd) {
    const nIce = Math.round(content.ice / DOT);
    const nW = Math.round(content.water / DOT);
    const m = Object.assign(lensGeom(nIce, nW), { iceDots: [], dots: [], temp: content.temp, flashes: [] });
    for (let i = 0; i < nIce; i++) m.iceDots.push(Object.assign(icePos(m, nIce, i), { ph: rnd() * 6.28, boost: 0 }));
    for (let i = 0; i < nW; i++) m.dots.push(waterDot(m, rnd));
    return m;
  }

  /* Le contenu de la boîte change (versement, fonte) : les particules de
     glace du haut se détachent et deviennent des particules d'eau, là où
     elles étaient ; l'eau versée arrive n'importe où dans l'eau. */
  function syncLens(m, nIce, nW) {
    let changed = false;
    while (m.iceDots.length > nIce) {
      const p = m.iceDots.pop();
      const a = Math.random() * Math.PI * 2;
      m.dots.push({ x: p.x, y: p.y, dx: Math.cos(a), dy: Math.sin(a), hit: 0.6 });
      changed = true;
    }
    while (m.iceDots.length < nIce) {
      m.iceDots.push({ x: 0, y: 0, ph: Math.random() * 6.28, boost: 0 });
      changed = true;
    }
    if (!changed && m.dots.length === nW) return;
    Object.assign(m, lensGeom(nIce, nW));
    m.iceDots.forEach((p, i) => Object.assign(p, icePos(m, nIce, i)));
    while (m.dots.length < nW) m.dots.push(waterDot(m, Math.random));
    while (m.dots.length > nW) m.dots.pop();
    m.dirty = true;
  }

  // Les particules à leur place, traînée vers l'arrière (longueur : vitesse).
  function lensInner(m, live) {
    const R = LV.R;
    const tail = speedOf(m.temp) * 0.09;
    let out = `<rect x="1" y="31" width="238" height="212" rx="16" fill="#fbfcfd" stroke="#9aa6b2" stroke-width="2"/>`;
    if (m.dots.length) out += `<rect x="${LV.x0}" y="${m.waterTop.toFixed(1)}" width="${LV.x1 - LV.x0}" height="${(LV.floor - m.waterTop).toFixed(1)}" rx="4" fill="#dcedf9"/>`;
    if (m.ice.w) out += `<rect x="${(m.ice.x - 2).toFixed(1)}" y="${(m.ice.y - 2).toFixed(1)}" width="${m.ice.w + 4}" height="${m.ice.h + 2}" rx="5" fill="#f2f9fd" stroke="#a9cbe2" stroke-width="1.4" stroke-dasharray="4 3"/>`;
    out += `<g data-tails>${m.dots.map(d => `<line x1="${d.x.toFixed(1)}" y1="${d.y.toFixed(1)}" x2="${(d.x - d.dx * tail).toFixed(1)}" y2="${(d.y - d.dy * tail).toFixed(1)}" stroke="#2a78d6" stroke-opacity="0.35" stroke-width="3" stroke-linecap="round"/>`).join('')}</g>` +
      `<g data-dots>${m.dots.map(d => `<circle cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="${R}" fill="#2a78d6"/>`).join('')}</g>` +
      `<g data-ice>${m.iceDots.map(d => `<circle cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="${R}" fill="#2a78d6"/>`).join('')}</g>`;
    if (live) out += `<g data-flashes>${[0, 1, 2, 3, 4, 5].map(() => `<circle r="9" fill="none" stroke="#f0a020" stroke-width="2.4" opacity="0"/>`).join('')}</g>`;
    return out;
  }

  const lensSVG = (m, live, extra) => `<svg class="mr-lens-svg" viewBox="0 30 240 214" ${extra || ''} aria-hidden="true" focusable="false">${lensInner(m, live)}</svg>`;

  // Un pas de l'animation (dt en secondes).
  function stepLens(m, dt) {
    const R = LV.R;
    const v = speedOf(m.temp);
    const ice = m.ice;
    m.dots.forEach(d => {
      d.hit = Math.max(0, d.hit - dt);
      const k = 1 - 0.5 * (d.hit / 0.6);
      d.x += d.dx * v * k * dt;
      d.y += d.dy * v * k * dt;
      if (d.x < LV.x0 + R) { d.x = LV.x0 + R; d.dx = Math.abs(d.dx); }
      if (d.x > LV.x1 - R) { d.x = LV.x1 - R; d.dx = -Math.abs(d.dx); }
      if (d.y > LV.floor - R) { d.y = LV.floor - R; d.dy = -Math.abs(d.dy); }
      if (d.y < m.waterTop + R) { d.y = m.waterTop + R; d.dy = Math.abs(d.dy); }
      if (ice.w && d.x > ice.x - R && d.x < ice.x + ice.w + R && d.y > ice.y - R && d.y < ice.y + ice.h + R) {
        const pl = d.x - (ice.x - R), pr = ice.x + ice.w + R - d.x, pt = d.y - (ice.y - R), pb = ice.y + ice.h + R - d.y;
        // La glace dépasse de l'eau : pas de place au-dessus, on repart par le côté ou par dessous.
        const roomAbove = ice.y - R >= m.waterTop + R;
        const least = Math.min(pl, pr, pb, roomAbove ? pt : Infinity);
        let cx = d.x, cy = d.y;
        if (least === pt) { d.y = ice.y - R; d.dy = -Math.abs(d.dy); cy = ice.y; }
        else if (least === pb) { d.y = ice.y + ice.h + R; d.dy = Math.abs(d.dy); cy = ice.y + ice.h; }
        else if (least === pl) { d.x = ice.x - R; d.dx = -Math.abs(d.dx); cx = ice.x; }
        else { d.x = ice.x + ice.w + R; d.dx = Math.abs(d.dx); cx = ice.x + ice.w; }
        // Un choc ne compte que s'il est assez espacé du précédent pour se voir.
        if (d.hit < 0.3) {
          d.hit = 0.6;
          m.flashes.push({ x: cx, y: cy, t: 0.35 });
          if (m.flashes.length > 6) m.flashes.shift();
          let best = null, bestD = Infinity;
          m.iceDots.forEach(p => { const dd = Math.hypot(p.x - cx, p.y - cy); if (dd < bestD) { bestD = dd; best = p; } });
          if (best) best.boost = Math.min(3, best.boost + 1.6 * (v / 100) + 0.6);
        }
      }
    });
    m.iceDots.forEach(p => { p.boost = Math.max(0, p.boost - dt * 3); });
    m.flashes.forEach(f => { f.t -= dt; });
    m.flashes = m.flashes.filter(f => f.t > 0);
  }

  function drawLens(el, m, t) {
    if (m.dirty || !m.els) {
      el.innerHTML = lensInner(m, true);
      m.dirty = false;
      m.els = {
        tails: [...el.querySelectorAll('[data-tails] line')],
        dots: [...el.querySelectorAll('[data-dots] circle')],
        ice: [...el.querySelectorAll('[data-ice] circle')],
        flashes: [...el.querySelectorAll('[data-flashes] circle')]
      };
    }
    const tail = speedOf(m.temp) * 0.09;
    m.dots.forEach((d, i) => {
      const c = m.els.dots[i], l = m.els.tails[i];
      if (!c || !l) return;
      c.setAttribute('cx', d.x.toFixed(1));
      c.setAttribute('cy', d.y.toFixed(1));
      const k = tail * (1 - 0.5 * (d.hit / 0.6));
      l.setAttribute('x1', d.x.toFixed(1));
      l.setAttribute('y1', d.y.toFixed(1));
      l.setAttribute('x2', (d.x - d.dx * k).toFixed(1));
      l.setAttribute('y2', (d.y - d.dy * k).toFixed(1));
    });
    m.iceDots.forEach((p, i) => {
      const c = m.els.ice[i];
      if (!c) return;
      const a = 1.1 + p.boost;
      c.setAttribute('cx', (p.x + a * Math.sin(p.ph + t * 31)).toFixed(1));
      c.setAttribute('cy', (p.y + a * Math.cos(p.ph * 1.7 + t * 27)).toFixed(1));
    });
    m.els.flashes.forEach((c, i) => {
      const f = m.flashes[i];
      if (!f) { c.setAttribute('opacity', '0'); return; }
      c.setAttribute('cx', f.x.toFixed(1));
      c.setAttribute('cy', f.y.toFixed(1));
      c.setAttribute('r', (6 + (0.35 - f.t) * 26).toFixed(1));
      c.setAttribute('opacity', (f.t / 0.35).toFixed(2));
    });
  }

  /* Les deux loupes de l'étape Experiment : un modèle par boîte, gardé d'un
     affichage à l'autre (pas de saut quand l'élève écrit ou pose un
     objet), une seule boucle d'animation pour les deux, arrêtée dès que
     leurs dessins quittent la page. Mouvement réduit : dessin figé, refait
     à chaque changement. */
  let lensSims = {};
  let lensLoop = 0;

  function lensContent(side, min) {
    const v = sideView(side, min);
    return { water: v.water, ice: v.ice, temp: v.temp };
  }

  // Le modèle de chaque boîte suit ce qu'elle contient à l'instant min.
  function syncLenses(min) {
    SIDES.forEach(side => {
      const c = lensContent(side, min);
      const m = lensSims[side];
      if (!m) { lensSims[side] = lensModel(c, Math.random); return; }
      m.temp = c.temp;
      syncLens(m, Math.round(c.ice / DOT), Math.round(c.water / DOT));
    });
  }

  function drawLensesStill() {
    SIDES.forEach(side => {
      const el = $(`[data-lens-svg="${side}"]`);
      const m = lensSims[side];
      if (!el || !m) return;
      el.innerHTML = lensInner(m, false);
      m.els = null;
      m.dirty = false;
    });
  }

  function startLens() {
    const id = ++lensLoop;
    const els = SIDES.map(side => $(`[data-lens-svg="${side}"]`));
    SIDES.forEach(side => { if (lensSims[side]) lensSims[side].els = null; });
    if (reduceMotion || !els.some(Boolean)) { drawLensesStill(); return; }
    let last = performance.now();
    const t0 = last;
    const frame = time => {
      if (id !== lensLoop || !els.some(el => el && el.isConnected)) return;
      const dt = Math.min(0.05, Math.max(0, time - last) / 1000);
      last = time;
      SIDES.forEach((side, i) => {
        const m = lensSims[side];
        if (!m || !els[i] || !els[i].isConnected) return;
        stepLens(m, dt);
        drawLens(els[i], m, (time - t0) / 1000);
      });
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  // Dessin figé (correction) : la boîte au départ ou à la fin.
  function lensStill(side, when) {
    const w = water0(side);
    const c = when === 'start'
      ? { water: w.v, ice: run.ice, temp: w.t }
      : { water: w.v + finalMelt(side), ice: run.ice - finalMelt(side), temp: 0 };
    return lensSVG(lensModel(c, mulberry32(seedFrom(run.seed + side + when))), false);
  }

  const dotKey = `<svg class="mr-key-dot" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><circle cx="6" cy="6" r="4.5" fill="#2a78d6"/></svg>`;

  /* ===== Étapes complètes (progression stricte, voir lab-engine.js) =====
     1 : les deux paris ; 2 : les huit cases à écrire du carnet et les trois
     notes de la loupe ; 3 : toutes les réponses de la conclusion. */
  const hypDone = () => !!state.bets.winner && !!state.bets.final;
  const notesDone = () => SIDES.every(s => NOTED.every(f => state.notes[s][f] != null));
  const seenDone = () => SEEN.every(k => !!state.seen[k]);
  const benchDone = () => notesDone() && seenDone();

  function stepComplete(n) {
    if (n === 1) return hypDone();
    if (n === 2) return benchDone();
    return conclusionsComplete();
  }

  function lockReason(n) {
    if (n === 1) return LABELS.lockHypothesis;
    if (n === 2) return state.started ? LABELS.lockRun : LABELS.lockNotStarted;
    return lab.L.missingConclusions;
  }

  const chipHTML = (attrs, label, on) => `<button type="button" class="lab-choice mr-chip ${on ? 'is-selected' : ''}" ${attrs} aria-pressed="${on}">${label}</button>`;

  function selectHTML(attrs, value, options, labelOf, aria, missing) {
    return `<select class="lab-select mr-select ${value ? 'is-filled' : ''} ${missing && !value ? 'lab-is-missing' : ''}" ${attrs} aria-label="${escapeHtml(plain(aria))}">` +
      `<option value="" disabled ${value ? '' : 'selected'}>${LABELS.choose}</option>` +
      options.map(x => `<option value="${x}" ${value === x ? 'selected' : ''}>${escapeHtml(labelOf(x))}</option>`).join('') + `</select>`;
  }

  const fmt = (f, v) => (f === 't0' || f === 't1' ? deg(v) : String(v));
  const fmtUnit = (f, v) => (f === 'vol' ? LABELS.vol(v) : f === 't0' || f === 't1' ? tempText(v) : LABELS.mass(v));

  /* ===== Étape 1 : hypothèse =====
     À gauche, la question et le matériel du jour (des faits : volumes et
     températures) ; à droite, les deux paris. */
  function renderPredict() {
    const show = lab.state.showMissing;
    const part = key => `<li class="mr-hyp-part ${show && !state.bets[key] ? 'lab-is-missing' : ''}">` +
      `<p class="mr-hyp-q">${gloss(LABELS.hyp[key])}</p>` +
      `<div class="mr-chips">${CHOICES.map(c => chipHTML(`data-bet="${key}" data-val="${c}"`, LABELS.betChoices[key][c], state.bets[key] === c)).join('')}</div></li>`;
    const mug = water0('mug'), jug = water0('jug');

    lab.body.innerHTML = `<div class="mr-predict">` +
      `<div class="mr-predict-left">` +
        `<div class="mr-question-card"><p class="mr-kicker">${LABELS.yourQuestion}</p><p class="mr-big-q">${gloss(LABELS.bigQuestion)}</p></div>` +
        `<div class="mr-sit-card"><p class="mr-kicker">${LABELS.todayTitle}</p>` +
          `<div class="mr-sit-art">${sceneArt()}</div>` +
          `<p class="mr-sit-text">${gloss(LABELS.situation(LABELS.vol(mug.v), tempText(mug.t), LABELS.vol(jug.v), tempText(jug.t)))}</p></div>` +
      `</div>` +
      `<div class="mr-hyp-card"><p class="mr-kicker">${LABELS.hypothesisTitle}</p>` +
        `<ol class="mr-hyp-list">${part('winner')}${part('final')}</ol>` +
        `<label class="mr-because"><span>${LABELS.because}</span>` +
        `<input type="text" class="lab-input mr-because-input" maxlength="160" placeholder="${escapeHtml(LABELS.becausePlaceholder)}" value="${escapeHtml(state.because)}" autocomplete="off"></label>` +
      `</div></div>`;

    $$('[data-bet]').forEach(btn => btn.addEventListener('click', () => {
      state.bets[btn.dataset.bet] = btn.dataset.val;
      if (lab.state.showMissing && hypDone()) lab.state.showMissing = false;
      renderPredict();
      lab.renderStepper();
    }));
    const because = $('.mr-because-input');
    because.addEventListener('input', e => { state.because = e.target.value; });
    // Hypothèse figée dès le premier geste de l'expérience.
    if (state.started) {
      $$('[data-bet]').forEach(btn => lab.setLock(btn, LABELS.lockHypothesisFixed, { icon: false }));
      because.readOnly = true;
      lab.setLock(because, LABELS.lockHypothesisFixed);
    }

    const ready = hypDone();
    const info = show && !ready ? lab.footerInfo(lab.L.missingHypothesis, true)
      : lab.footerInfo(ready ? LABELS.hypothesisReady : LABELS.hypothesisPending);
    lab.setFooter(info + `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-next>${LABELS.toBench} →</button></div>`);
    const next = $('[data-next]');
    next.addEventListener('click', () => lab.goToStep(2));
    lab.setLock(next, ready ? null : LABELS.lockHypothesis, { missing: true, key: 'next' });
  }

  /* ===== Étape 2 : l'expérience =====
     Trois colonnes : la paillasse (scène, course, légende), la loupe à
     particules (les deux boîtes côte à côte, et les notes de l'élève) et le
     carnet (une colonne par eau). Les blocs de glace se prennent en main
     (makeDraggable, hold) ; « Pour » verse une eau sur son bloc ; « Start
     the race » fait passer les 40 minutes d'un coup. Ce qu'il faut faire
     maintenant est en couleur (todo, voir lab-engine.js). */
  const RACE_ICON = `<svg class="mr-race-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">` +
    `<circle cx="12" cy="13.5" r="7.5" fill="none" stroke="currentColor" stroke-width="2"/>` +
    `<path d="M12,13.5 V9 M9.5,2.5 h5 M12,2.5 V6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

  function iceSpot(i, b) {
    const s = iceSize(blockMass(b));
    const at = b.pos === 'balance' ? BALANCE_SLOT : TRAY_SLOTS[i];
    return `left:${at.x - s / 2}px;top:${at.y - s}px;width:${s}px;height:${s}px`;
  }

  const iceButton = (i, style) => `<button type="button" class="mr-ice" data-ice="${i}"${style ? ` style="${style}"` : ''}>${ICE_SVG}<span class="mr-sr">${LABELS.tools.ice}</span></button>`;

  function stageHTML() {
    const bal = onBalance();
    const side = s => {
      const b = blockIn(s);
      return `<div class="mr-cont" data-cont="${s}" style="left:${X[s]}px">${svg(140, 150, '', '', 'overflow="visible"')}` +
          `<span class="mr-cont-name">${LABELS.sides[s].name}</span></div>` +
        (state.poured[s] ? '' : `<button type="button" class="lab-btn mr-pour" data-pour="${s}" style="left:${X[s] + 20}px">${LABELS.pour}</button>`) +
        `<div class="mr-box" data-box="${s}" style="left:${X[s]}px">${svg(140, 142, boxBackInner(), 'mr-box-back')}` +
          (b ? iceButton(state.blocks.indexOf(b)) : '') +
          svg(140, 142, '', 'mr-box-front', 'overflow="visible"') +
          `<span class="mr-spot-name">${LABELS.tools.box}</span></div>`;
    };
    const free = state.blocks.map((b, i) => (b.pos === 'tray' || b.pos === 'balance' ? iceButton(i, iceSpot(i, b)) : '')).join('');
    const lcds = SIDES.map(s => `<div class="mr-lcd-float" data-lcd="${s}"><span data-lcd-val></span><small>${LABELS.units.c}</small></div>`).join('');
    return `<div class="mr-stage">` +
      `<div class="mr-spot mr-tray" data-place="tray">${svg(130, 28, trayInner(130))}<span class="mr-spot-name">${LABELS.tools.tray}</span></div>` +
      `<div class="mr-spot mr-balance" data-place="balance">${svg(110, 84, balanceInner(bal ? blockMass(bal) : 0))}<span class="mr-spot-name">${LABELS.tools.balance}</span></div>` +
      SIDES.map(side).join('') +
      free +
      svg(STAGE.W, STAGE.H, '', 'mr-overlay') +
      lcds +
    `</div>`;
  }

  function timerHTML(t) {
    const status = (title, sub, cls) => `<div class="mr-race ${cls}"><span class="mr-race-text"><strong>${title}</strong><small>${sub}</small></span></div>`;
    const action = racing ? status(LABELS.racing, LABELS.racingSub, 'is-running')
      : state.raced ? status(LABELS.raceDone, LABELS.raceDoneSub, 'is-final')
      : `<button type="button" class="mr-race" data-race>${RACE_ICON}<span class="mr-race-text"><strong>${LABELS.race}</strong><small data-race-sub></small></span></button>`;
    return `<div class="mr-timer"><span class="mr-clock" data-clock>${LABELS.minutes(Math.round(t))}</span>` +
      `<span class="mr-timer-info">${LABELS.timerInfo}</span>${action}</div>`;
  }

  function lensPanelHTML() {
    const view = s => `<figure class="mr-lens-fig"><svg class="mr-lens-svg" viewBox="0 30 240 214" data-lens-svg="${s}" aria-hidden="true" focusable="false"></svg>` +
      `<figcaption>${gloss(LABELS.sides[s].box)}</figcaption></figure>`;
    const row = k => `<div class="mr-seen-row"><span class="mr-seen-label">${gloss(LABELS.seenLabels[k])}</span>` +
      selectHTML(`data-seen="${k}"`, state.seen[k], CHOICES, c => LABELS.seenChoices[c], LABELS.seenLabels[k]) + `</div>`;
    return `<section class="mr-lens-panel"><h3 class="lab-panel-title">${LABELS.lensTitle}</h3>` +
      `<div class="mr-lens-pair">${SIDES.map(view).join('')}</div>` +
      `<p class="mr-key">${dotKey}<span>${gloss(LABELS.keyDot)}</span></p>` +
      `<div class="mr-seen"><p class="mr-seen-title">${LABELS.seenStart}</p>${row('fastStart')}${row('moreStart')}` +
      `<p class="mr-seen-title">${LABELS.seenEnd}</p>${row('fastEnd')}</div></section>`;
  }

  // Carnet : volumes et températures de départ donnés, le reste à écrire.
  function notesHTML() {
    const cell = (s, f) => (GIVEN.includes(f)
      ? `<td class="mr-given">${fmt(f, state.notes[s][f])}</td>`
      : `<td><input type="text" inputmode="numeric" class="mr-cell" data-f="${f}" data-s="${s}" ` +
        `value="${state.notes[s][f] == null ? '' : fmt(f, state.notes[s][f])}" maxlength="6" autocomplete="off" spellcheck="false" ` +
        `aria-label="${escapeHtml(LABELS.cellAria(plain(LABELS.fields[f]), LABELS.sides[s].name))}"></td>`);
    const row = f => `<tr><th scope="row">${gloss(LABELS.fields[f])} <small>(${LABELS.fieldUnits[f]})</small>` +
      (GIVEN.includes(f) ? ` <span class="mr-given-tag">${LABELS.given}</span>` : '') + `</th>${SIDES.map(s => cell(s, f)).join('')}</tr>`;
    const group = name => `<tr class="mr-group"><th colspan="3">${name}</th></tr>`;
    return `<section class="mr-notes"><h3 class="lab-panel-title">${LABELS.notesTitle}</h3>` +
      `<table class="mr-table"><thead><tr><th></th>${SIDES.map(s => `<th scope="col">${LABELS.sides[s].col}</th>`).join('')}</tr></thead><tbody>` +
      group(LABELS.groups.before) + ['vol', 't0', 'ice0'].map(row).join('') +
      group(LABELS.groups.after) + ['t1', 'ice1'].map(row).join('') +
      group(LABELS.groups.result) + row('melted') +
      `</tbody></table><p class="mr-notes-hint">${gloss(LABELS.meltedHint)}</p></section>`;
  }

  // at : instant dessiné (pendant la course) ; sinon maintenant.
  function renderExperiment(caption, at) {
    const t = at != null ? at : now();
    lab.body.innerHTML = `<div class="mr-run">` +
      `<section class="mr-bench">` +
        `<p class="mr-reminder">${gloss(LABELS.bigQuestion)}</p>` +
        stageHTML() +
        timerHTML(t) +
        `<p class="lab-caption" data-caption aria-live="polite"></p>` +
      `</section>` +
      lensPanelHTML() +
      notesHTML() +
    `</div>`;
    paint(t);
    bindStage();
    bindNotes();
    const race = $('[data-race]');
    if (race) race.addEventListener('click', startRace);
    renderRunFooter();
    updateLocks();
    updateMarks();
    setCaption(caption || defaultCaption());
    startLens();
  }

  /* Ce qui change avec le temps (ou pendant un versement) : récipients,
     boîtes, glace, thermomètres, horloge, et les deux loupes. */
  function paint(t) {
    SIDES.forEach(side => {
      const v = sideView(side, t);
      const cont = $(`[data-cont="${side}"] svg`);
      if (cont) cont.innerHTML = contInner(side, v.contFill, v.tilt);
      const front = $(`[data-box="${side}"] .mr-box-front`);
      if (front) front.innerHTML = boxFrontInner(v);
      const ice = $(`[data-box="${side}"] [data-ice]`);
      if (ice) placeIceInBox(ice, v);
    });
    const over = $('.mr-overlay');
    if (over) over.innerHTML = overlayInner();
    $$('[data-lcd]').forEach(el => {
      const side = el.dataset.lcd;
      const p = probeSpot(side);
      el.style.left = `${p.lcd[0]}px`;
      el.style.top = `${p.lcd[1]}px`;
      const val = el.querySelector('[data-lcd-val]');
      const text = deg(sideView(side, t).reading);
      if (val.textContent !== text) val.textContent = text;
    });
    const clock = $('[data-clock]');
    const text = LABELS.minutes(Math.round(t));
    if (clock && clock.textContent !== text) clock.textContent = text;
    syncLenses(t);
    if (reduceMotion) drawLensesStill();
  }

  function bindStage() {
    const balance = $('[data-place="balance"]');
    const tray = $('[data-place="tray"]');
    const boxEl = s => $(`[data-box="${s}"]`);

    // Blocs de glace : du plateau à la balance, puis dans une boîte vide ;
    // à la fin, de la boîte à la balance. Recouvert d'eau, il y reste
    // jusqu'à la fin de la course.
    $$('[data-ice]').forEach(el => {
      const i = Number(el.dataset.ice);
      const b = state.blocks[i];
      const inWater = SIDES.includes(b.pos) && state.poured[b.pos];
      if (inWater && !finished()) {
        el.addEventListener('click', () => setCaption(LABELS.captionIceStays, true));
        return;
      }
      lab.makeDraggable(el, {
        hold: true,
        ghost: () => { const s = iceSize(blockMass(b)); return `<div class="mr-ghost" style="width:${s}px;height:${s}px">${ICE_SVG}</div>`; },
        targets: () => {
          const list = [];
          if (!onBalance() && b.pos !== 'balance') list.push(balance);
          if (b.pos !== 'tray') list.push(tray);
          if (!b.out && !inWater) SIDES.forEach(s => { if (!state.poured[s] && !blockIn(s)) list.push(boxEl(s)); });
          return list;
        },
        onDrop: target => moveBlock(i, target.dataset.place || target.dataset.box),
        onHold: on => setCaption(on ? LABELS.captionHoldIce : defaultCaption())
      });
    });

    $$('[data-pour]').forEach(btn => btn.addEventListener('click', () => pour(btn.dataset.pour)));

    // Un endroit touché sans rien en main (sinon le moteur y a posé l'objet).
    SIDES.forEach(s => {
      $(`[data-cont="${s}"]`).addEventListener('click', () => { if (!state.poured[s]) setCaption(LABELS.captionUsePour, true); });
      boxEl(s).addEventListener('click', e => {
        if (e.target.closest('[data-ice]')) return;
        const hint = state.poured[s] && !finished() && blockIn(s) ? LABELS.captionIceStays
          : !state.poured[s] && !blockIn(s) ? LABELS.captionBoxEmpty : LABELS.captionTakeFirst;
        setCaption(hint, true);
      });
    });
    [balance, tray].forEach(el => el.addEventListener('click', () => setCaption(LABELS.captionTakeFirst, true)));
  }

  function markStarted() {
    if (!state.started) state.started = true;
  }

  function focusField(f, side) {
    const input = $(`[data-f="${f}"][data-s="${side}"]`);
    if (input && !input.readOnly) input.focus({ preventScroll: true });
  }

  function moveBlock(i, where) {
    const b = state.blocks[i];
    if (SIDES.includes(where) && !b.weighed) { setCaption(LABELS.captionWeighFirst, true); return; }
    lab.release();
    markStarted();
    if (SIDES.includes(b.pos) && state.poured[b.pos]) { b.out = true; b.side = b.pos; }
    b.pos = where;
    if (where === 'balance') b.weighed = true;
    renderExperiment();
    lab.renderStepper();
    if (where !== 'balance') return;
    // L'affichage de la balance défile jusqu'à la masse.
    const value = blockMass(b);
    const show = v => { const el = $('[data-mass-display]'); if (el) el.textContent = LABELS.mass(Math.round(v)); };
    const token = lab.newScene();
    lab.tween(token, 600, k => show(value * Math.max(0, k)), ease.out).then(ok => { if (ok) show(value); });
    if (b.out) focusField('ice1', b.side);
    else {
      const empty = SIDES.find(s => state.notes[s].ice0 == null && !state.poured[s]);
      if (empty) focusField('ice0', empty);
    }
  }

  // Pendant une animation, la paillasse ne répond pas.
  function setBusy() {
    const runEl = $('.mr-run');
    if (runEl) runEl.classList.add('is-busy');
    $$('.lab-footer button').forEach(el => { el.disabled = true; });
  }

  /* Verser : l'eau passe du récipient à la boîte, sur le bloc, avec le
     thermomètre ; le couvercle se ferme. L'état change tout de suite (si
     l'animation est interrompue, il reste juste). */
  function pour(side) {
    const b = blockIn(side);
    if (state.poured[side] || !b) return;
    lab.release();
    markStarted();
    state.poured[side] = true;
    b.side = side;
    pouring = { side, p: 0 };
    renderExperiment(LABELS.captionPouring);
    setBusy();
    const token = lab.newScene();
    lab.tween(token, 1600, (k, raw) => { if (pouring) { pouring.p = Math.max(0, raw); paint(0); } }, ease.linear).then(ok => {
      pouring = null;
      if (!ok) return;
      renderExperiment();
      lab.renderStepper();
    });
  }

  /* La course : les 40 minutes d'un seul tenant, les deux boîtes ensemble.
     Le temps à l'écran avance régulièrement : l'essentiel change au début,
     puis plus rien ne bouge (les thermomètres restent à 0 °C). */
  function startRace() {
    if (state.raced) return;
    lab.release();
    state.raced = true;
    racing = true;
    lab.state.showMissing = false;
    renderExperiment(LABELS.captionRacing, 0);
    setBusy();
    const token = lab.newScene();
    lab.tween(token, RACE_MS, (k, raw) => paint(RACE_MIN * Math.max(0, raw)), ease.linear).then(ok => {
      racing = false;
      if (!ok) return;
      renderExperiment();
      lab.renderStepper();
    });
  }

  /* Saisie : un nombre entier (l'unité tapée par habitude est acceptée).
     null : case vide ; NaN : illisible. La masse fondue peut être négative
     (soustraction à l'envers) : la correction le relèvera. */
  function parseNum(raw, f) {
    const s = raw.trim().replace(/[−–]/g, '-').replace(/\s+/g, '').replace(/(ml|g|°c|°|c)$/i, '');
    if (s === '') return null;
    if (!/^-?\d{1,5}$/.test(s)) return NaN;
    const v = Number(s) + 0;
    if (f === 't1') return v >= -50 && v <= 150 ? v : NaN;
    if (f === 'melted') return v;
    return v >= 0 ? v : NaN;
  }

  /* La valeur compte dès qu'elle est lisible (à chaque frappe) : ce qui en
     dépend se déverrouille tout de suite, sans redessiner la paillasse. */
  function bindNotes() {
    $$('[data-f]').forEach(input => {
      const side = input.dataset.s, f = input.dataset.f;
      input.addEventListener('input', () => {
        input.classList.remove('is-invalid');
        const v = parseNum(input.value, f);
        state.notes[side][f] = Number.isNaN(v) ? null : v;
        refreshRecords();
      });
      input.addEventListener('change', () => {
        const v = parseNum(input.value, f);
        if (Number.isNaN(v)) {
          input.classList.add('is-invalid');
          setCaption(LABELS.captionBad[f], true);
          return;
        }
        if (v != null) input.value = fmt(f, v);
        lab.save();
      });
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
    });
    $$('select[data-seen]').forEach(sel => sel.addEventListener('change', () => {
      state.seen[sel.dataset.seen] = sel.value || null;
      sel.classList.toggle('is-filled', !!sel.value);
      refreshRecords();
      lab.save();
    }));
  }

  function refreshRecords() {
    if (lab.state.showMissing && benchDone()) lab.state.showMissing = false;
    updateLocks();
    updateMarks();
    setCaption(defaultCaption());
    updateRunFooter();
  }

  /* Tous les verrous de la paillasse et du carnet, selon l'état (à rappeler
     après chaque changement) : chaque geste attend le précédent, et dit
     lequel. */
  function updateLocks() {
    const done = finished();
    const bal = onBalance();
    SIDES.forEach(side => {
      const n = state.notes[side];
      const reason = {
        ice0: state.poured[side] ? LABELS.lockIce0Fixed : !(bal && !bal.out) ? LABELS.lockIce0Balance : null,
        t1: !done ? LABELS.lockEndRace : null,
        ice1: !done ? LABELS.lockEndRace : !(bal && bal.out && bal.side === side) ? LABELS.lockIce1(LABELS.sides[side].box) : null,
        melted: n.ice0 == null || n.ice1 == null ? LABELS.lockMelted : null
      };
      NOTED.forEach(f => {
        const input = $(`[data-f="${f}"][data-s="${side}"]`);
        if (!input) return;
        input.readOnly = !!reason[f];
        lab.setLock(input, reason[f]);
      });
      const pourBtn = $(`[data-pour="${side}"]`);
      if (pourBtn) {
        const why = !blockIn(side) ? LABELS.lockPourIce : n.ice0 == null ? LABELS.lockPourIce0 : null;
        lab.setLock(pourBtn, why);
        pourBtn.classList.toggle('lab-btn-primary', !why);
      }
    });

    const startReason = state.raced ? LABELS.lockSeenFixed : !bothPoured() ? LABELS.lockSeenPour : null;
    const seenReason = { fastStart: startReason, moreStart: startReason, fastEnd: !done ? LABELS.lockEndRace : null };
    SEEN.forEach(k => lab.setLock($(`select[data-seen="${k}"]`), seenReason[k]));

    const race = $('[data-race]');
    if (race) {
      const why = !bothPoured() ? LABELS.lockRacePour
        : !state.seen.fastStart || !state.seen.moreStart ? LABELS.lockRaceSeen : null;
      lab.setLock(race, why, { missing: true, key: 'race' });
      race.classList.toggle('is-ready', !why);
      const sub = $('[data-race-sub]');
      if (sub) sub.textContent = why ? LABELS.raceLocked : LABELS.raceReady;
    }
  }

  // Cases encore vides (et ouvertes) à signaler : bouton suivant touché trop tôt.
  function updateMarks() {
    const show = lab.state.showMissing;
    $$('[data-f]').forEach(input => {
      const v = state.notes[input.dataset.s][input.dataset.f];
      input.classList.toggle('lab-is-missing', !!(show && v == null && !input.readOnly));
    });
    $$('select[data-seen]').forEach(sel => {
      sel.classList.toggle('lab-is-missing', !!(show && !sel.value && !sel.classList.contains('lab-is-locked')));
    });
  }

  /* La prochaine chose à faire, dans l'ordre de la manipulation : la
     légende la dit, et ce qu'il faut toucher ou remplir est en couleur. */
  function nextTask() {
    const B = state.blocks;
    const bal = onBalance();
    const n = state.notes;
    if (!bothPoured()) {
      const written = SIDES.filter(s => n[s].ice0 != null).length;
      if (bal && !bal.out && written < B.filter(b => b.weighed).length) return 'readMass';
      if (B.some(b => !b.weighed)) return bal ? 'toBox' : 'weigh';
      if (B.some(b => b.pos === 'tray' || b.pos === 'balance')) return 'toBox';
      if (SIDES.some(s => n[s].ice0 == null)) return bal ? 'readMass' : 'reweigh';
      return 'pour';
    }
    if (!state.raced && (!state.seen.fastStart || !state.seen.moreStart)) return 'seen';
    if (!state.raced) return 'race';
    if (racing) return 'racing';
    if (SIDES.some(s => n[s].t1 == null)) return 't1';
    if (!state.seen.fastEnd) return 'seenEnd';
    if (bal && bal.out && n[bal.side].ice1 == null) return 'readMassEnd';
    if (B.some(b => SIDES.includes(b.pos))) return bal ? 'freeBalance' : 'takeOut';
    if (SIDES.some(s => n[s].ice1 == null)) return 'reweighEnd';
    if (SIDES.some(s => n[s].melted == null)) return 'melted';
    return 'done';
  }

  function todoEls() {
    const B = state.blocks;
    const bal = onBalance();
    const iceEl = b => (b ? $(`[data-ice="${B.indexOf(b)}"]`) : null);
    const empty = (f, sides) => sides.filter(s => state.notes[s][f] == null).map(s => $(`[data-f="${f}"][data-s="${s}"]`));
    switch (nextTask()) {
      case 'weigh': return [iceEl(B.find(b => !b.weighed))];
      case 'readMass': return empty('ice0', SIDES).slice(0, 1);
      case 'toBox': return [iceEl(bal || B.find(b => b.pos === 'tray' && b.weighed))];
      case 'reweigh': return [iceEl(B.find(b => SIDES.includes(b.pos)))];
      case 'pour': return SIDES.filter(s => !state.poured[s]).map(s => $(`[data-pour="${s}"]`));
      case 'seen': return ['fastStart', 'moreStart'].filter(k => !state.seen[k]).map(k => $(`select[data-seen="${k}"]`));
      case 'race': return [$('[data-race]')];
      case 't1': return empty('t1', SIDES);
      case 'seenEnd': return [$('select[data-seen="fastEnd"]')];
      case 'readMassEnd': return empty('ice1', [bal.side]);
      case 'freeBalance': return [iceEl(bal)];
      case 'takeOut': return [iceEl(B.find(b => SIDES.includes(b.pos)))];
      case 'reweighEnd': return [iceEl(B.find(b => b.out && state.notes[b.side].ice1 == null))];
      case 'melted': return empty('melted', SIDES);
      default: return [];
    }
  }

  const defaultCaption = () => LABELS.captions[nextTask()];

  function setCaption(text, warn) {
    const c = $('[data-caption]');
    if (!c) return;
    c.innerHTML = `<span>${gloss(text)}</span>`;
    c.classList.toggle('is-warning', !!warn);
  }

  /* Pied de page : « Conclude » reste secondaire tant que l'expérience
     n'est pas finie ; il reste cliquable et dit ce qui manque. */
  let stepperDone = null;

  function renderRunFooter() {
    lab.setFooter(lab.footerInfo('') + `<div class="lab-footer-actions">` +
      `<button type="button" class="lab-btn lab-btn-ghost" data-conclude>${LABELS.toConclude} →</button></div>`);
    $('[data-conclude]').addEventListener('click', () => lab.goToStep(3));
    updateRunFooter();
  }

  function updateRunFooter() {
    const done = benchDone();
    const missing = lab.state.showMissing && !done;
    const info = $('.lab-footer .lab-footer-info');
    if (info && !info.hasAttribute('data-lab-frozen')) {
      info.textContent = missing ? LABELS.missingRun : finished() ? LABELS.runDone : LABELS.runSetup;
      info.classList.toggle('is-warning', missing);
    }
    const concl = $('[data-conclude]');
    if (concl) {
      concl.classList.toggle('lab-btn-primary', done);
      concl.classList.toggle('lab-btn-ghost', !done);
      lab.setLock(concl, done ? null : lockReason(2), { missing: true, key: 'conclude' });
    }
    // La barre d'étapes ne change qu'à la fin de l'expérience (Conclude s'ouvre).
    if (done !== stepperDone) { stepperDone = done; lab.renderStepper(); }
  }

  /* ===== Étape 3 : conclusion =====
     À gauche, les résultats notés par l'élève et ses paris ; à droite,
     une phrase par idée (listes au milieu des phrases), puis le jugement
     des deux paris. Les mêmes phrases donnent la bonne réponse dans la
     correction et le rapport. */
  const OPTIONS = {
    most: CHOICES,
    hottest: ['yes', 'no'],
    temp: ['energy', 'fast', 'many'],
    energy: ['fast', 'many', 'both'],
    heat: ['cold', 'waterToIce', 'iceToWater'],
    stop: ['noEnergy', 'sameTemp', 'sameMass']
  };
  const RIGHT_WHY = { temp: 'fast', energy: 'both', heat: 'waterToIce', stop: 'sameTemp' };
  const WHY = Object.keys(RIGHT_WHY);

  function conclusionParts() {
    const c = state.concl;
    return {
      winner: !!(c.most && c.hottest),
      why: WHY.every(k => !!c[k]),
      verdict: !!(c.vWinner && c.vFinal)
    };
  }

  const conclusionsComplete = () => Object.values(conclusionParts()).every(Boolean);

  const noteText = (s, f) => (state.notes[s][f] == null ? DASH : fmtUnit(f, state.notes[s][f]));
  const betText = key => LABELS.betChoices[key][state.bets[key]] || DASH;

  function resultsTable(fields) {
    return `<table class="mr-mini"><thead><tr><th></th>${SIDES.map(s => `<th scope="col">${LABELS.sides[s].col}</th>`).join('')}</tr></thead><tbody>` +
      fields.map(f => `<tr><th scope="row">${gloss(LABELS.fields[f])}</th>${SIDES.map(s => `<td>${noteText(s, f)}</td>`).join('')}</tr>`).join('') +
      `</tbody></table>`;
  }

  const sentence = (key, value) => LABELS.concl[key](LABELS.words[key][value]);

  function renderConclude() {
    const c = state.concl;
    const show = lab.state.showMissing;
    const parts = conclusionParts();
    const miss = k => (show && !parts[k] ? 'lab-is-missing' : '');
    const pick = key => selectHTML(`data-c="${key}"`, c[key], OPTIONS[key], x => LABELS.words[key][x], LABELS.conclAria[key], show);
    const verdict = (key, text) => `<div class="mr-verdict"><span class="mr-verdict-text">${text}</span>` +
      ['confirmed', 'rejected'].map(x => chipHTML(`data-v="${key}" data-val="${x}"`, LABELS[x], c[key] === x)).join('') + `</div>`;

    lab.body.innerHTML = `<div class="mr-conclude">` +
      `<section class="mr-results"><h3 class="lab-panel-title">${LABELS.resultsTitle}</h3>` +
        resultsTable(['vol', 't0', 'melted', 't1']) +
        `<div class="mr-bets"><p class="mr-kicker">${LABELS.hypothesisTitle}</p>` +
          `<p>${gloss(LABELS.yourBet.winner(betText('winner')))}</p><p>${gloss(LABELS.yourBet.final(betText('final')))}</p></div>` +
      `</section>` +
      `<section class="mr-form">` +
        `<p class="mr-big-q">${gloss(LABELS.bigQuestion)}</p>` +
        `<ol class="mr-qs">` +
          `<li class="mr-q ${miss('winner')}"><p class="mr-q-title">${gloss(LABELS.qWinner)}</p>` +
            `<p class="mr-line">${LABELS.concl.most(pick('most'))}</p>` +
            `<p class="mr-line">${LABELS.concl.hottest(pick('hottest'))}</p></li>` +
          `<li class="mr-q ${miss('why')}"><p class="mr-q-title">${gloss(LABELS.qWhy)}</p>` +
            WHY.map(k => `<p class="mr-line">${LABELS.concl[k](pick(k))}</p>`).join('') + `</li>` +
        `</ol>` +
        `<div class="mr-q mr-q-hyp ${miss('verdict')}"><p class="mr-q-title">${LABELS.hypothesisTitle}</p>` +
          verdict('vWinner', LABELS.verdictWinner) + verdict('vFinal', LABELS.verdictFinal) + `</div>` +
      `</section></div>`;

    const after = () => {
      if (lab.state.showMissing && conclusionsComplete()) lab.state.showMissing = false;
      renderConclude();
      lab.save();
    };
    $$('select[data-c]').forEach(sel => sel.addEventListener('change', () => { c[sel.dataset.c] = sel.value || null; after(); }));
    $$('[data-v]').forEach(btn => btn.addEventListener('click', () => { c[btn.dataset.v] = btn.dataset.val; after(); }));

    lab.setFooter(`<button type="button" class="lab-btn lab-btn-ghost" data-back>← ${LABELS.backToLab}</button>` +
      lab.footerInfo('') +
      `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-check>${LABELS.checkConclusions}</button></div>`);
    $('[data-back]').addEventListener('click', () => lab.goToStep(2));
    $('[data-check]').addEventListener('click', () => lab.finish());
    updateConcludeFooter();
  }

  let conclReady = null;

  function updateConcludeFooter() {
    const ready = conclusionsComplete();
    const warn = lab.state.showMissing && !ready;
    const info = $('.lab-footer .lab-footer-info');
    if (info && !info.hasAttribute('data-lab-frozen')) {
      info.textContent = warn ? lab.L.missingConclusions : '';
      info.classList.toggle('is-warning', warn);
    }
    lab.setLock($('[data-check]'), ready ? null : lab.L.missingConclusions, { missing: true, key: 'check' });
    if (ready !== conclReady) { conclReady = ready; lab.renderStepper(); }
  }

  /* ===== Étape 4 : correction =====
     Mesures : chaque case écrite comparée à ce que montraient le
     thermomètre et la balance ; la masse fondue, à la soustraction des
     masses notées (volumes et températures de départ : donnés). Particules : ce que montrait la loupe (la tasse, plus
     chaude, a les particules les plus rapides ; la cruche, plus d'eau, en
     a le plus ; à la fin, même vitesse). Gagnant : d'après les masses
     fondues notées. Jugement : le pari sur le gagnant comparé à la
     conclusion de l'élève, celui sur la température finale à ses
     températures notées. */
  const SEEN_RIGHT = { fastStart: 'mug', moreStart: 'jug', fastEnd: 'same' };

  function evaluate() {
    const misses = [];
    let good = 0;
    SIDES.forEach(side => NOTED.forEach(f => {
      const v = state.notes[side][f];
      const r = f === 'melted' ? meltedTruth(side) : truth(side, f);
      if (v != null && v === r) good++;
      else misses.push({ side, f, v, r });
    }));
    const total = SIDES.length * NOTED.length;
    const seenOk = {};
    SEEN.forEach(k => { seenOk[k] = state.seen[k] === SEEN_RIGHT[k]; });
    const c = state.concl;
    const most = notedWinner();
    const hottest = most === 'mug' ? 'yes' : 'no';
    const whyOk = {};
    WHY.forEach(k => { whyOk[k] = c[k] === RIGHT_WHY[k]; });
    const shouldWinner = state.bets.winner && state.bets.winner === c.most ? 'confirmed' : 'rejected';
    const shouldFinal = state.bets.final && state.bets.final === notedFinal() ? 'confirmed' : 'rejected';
    return {
      misses, good, total, seenOk, most, hottest, whyOk, shouldWinner, shouldFinal,
      mostOk: c.most === most,
      hottestOk: c.hottest === hottest,
      measure: good === total,
      particles: SEEN.every(k => seenOk[k]),
      winner: c.most === most && c.hottest === hottest,
      heat: WHY.every(k => whyOk[k]),
      verdict: c.vWinner === shouldWinner && c.vFinal === shouldFinal
    };
  }

  // Ce qui était à lire, et sur quoi.
  function missText(x) {
    const col = LABELS.sides[x.side].col;
    if (x.f === 'melted') {
      const n = state.notes[x.side];
      const right = n.ice0 != null && n.ice1 != null ? LABELS.subtraction(LABELS.mass(n.ice0), LABELS.mass(n.ice1), LABELS.mass(x.r)) : LABELS.mass(x.r);
      return CHECK.meltedMiss(col, x.v == null ? null : LABELS.mass(x.v), right);
    }
    return CHECK.fieldMiss(col, plain(LABELS.fields[x.f]), x.v == null ? null : fmtUnit(x.f, x.v), fmtUnit(x.f, x.r), CHECK.sources[x.f]);
  }

  const rightMost = ev => sentence('most', ev.most);
  const rightHottest = ev => sentence('hottest', ev.hottest);
  const winnerWhy = () => {
    const m = water0('mug'), j = water0('jug');
    return EXPLAIN.winner[trueWinner()](LABELS.vol(m.v), tempText(m.t), LABELS.vol(j.v), tempText(j.t));
  };
  const seenText = (k, v) => (v ? LABELS.seenChoices[v] : DASH);

  function criterionDetail(key, ev) {
    const c = state.concl;
    const head = ok => (ok ? `<p class="mr-ok">${CHECK.answerOk}</p>` : `<p class="mr-ko">${CHECK.answerWrong}</p>`);
    const line = (ok, html) => `<li class="${ok ? 'is-ok' : 'is-ko'}"><span class="mr-mark">${ok ? '✓' : '✗'}</span><span>${html}</span></li>`;
    const pair = when => `<div class="mr-pair">${SIDES.map(s => `<figure>${lensStill(s, when)}` +
      `<figcaption>${LABELS.stillCaption(LABELS.sides[s].box, tempText(when === 'start' ? water0(s).t : 0))}</figcaption></figure>`).join('')}</div>`;

    if (key === 'measure') {
      if (!state.started) return `<p>${CHECK.noExperiment}</p>`;
      const wrong = new Set(ev.misses.map(x => `${x.side}-${x.f}`));
      const rows = FIELDS.map(f => `<tr><th scope="row">${gloss(LABELS.fields[f])}</th>${SIDES.map(s => {
        const x = ev.misses.find(m => m.side === s && m.f === f);
        return wrong.has(`${s}-${f}`) && x
          ? `<td class="is-ko"><span>${noteText(s, f)}</span><small>${fmtUnit(f, x.r)}</small></td>`
          : `<td class="is-ok">${noteText(s, f)}</td>`;
      }).join('')}</tr>`).join('');
      return `<p>${CHECK.measureScore(ev.good, ev.total)}</p>` +
        `<table class="mr-mini mr-mini-check"><thead><tr><th></th>${SIDES.map(s => `<th scope="col">${LABELS.sides[s].col}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>` +
        (ev.misses.length
          ? `<ul class="mr-misslist">${ev.misses.slice(0, 3).map(x => `<li>${missText(x)}</li>`).join('')}${ev.misses.length > 3 ? `<li>${CHECK.more(ev.misses.length - 3)}</li>` : ''}</ul>`
          : `<p class="mr-ok">${CHECK.measureAllGood}</p>`);
    }
    if (key === 'particles') {
      return pair('start') +
        `<ul class="mr-checklist">${SEEN.map(k => line(ev.seenOk[k], CHECK.seenLine(gloss(LABELS.seenLabels[k]), seenText(k, state.seen[k]), seenText(k, SEEN_RIGHT[k])))).join('')}</ul>` +
        `<p class="mr-muted">${gloss(EXPLAIN.particles)}</p>`;
    }
    if (key === 'winner') {
      return head(ev.winner) +
        `<p><strong>${gloss(rightMost(ev))} ${gloss(rightHottest(ev))}</strong></p>` +
        `<p>${CHECK.yourMelted(noteText('mug', 'melted'), noteText('jug', 'melted'))}</p>` +
        `<p>${gloss(winnerWhy())}</p>` +
        `<p class="mr-muted">${gloss(EXPLAIN.model)}</p>`;
    }
    if (key === 'heat') {
      const words = Object.keys(EXPLAIN.words).map(w => `<div><dt>${gloss(EXPLAIN.words[w][0])}</dt><dd>${gloss(EXPLAIN.words[w][1])}</dd></div>`).join('');
      return head(ev.heat) +
        `<ul class="mr-checklist">${WHY.map(k => line(ev.whyOk[k], gloss(sentence(k, RIGHT_WHY[k])))).join('')}</ul>` +
        `<div class="mr-heat">${pair('start')}<dl class="mr-words">${words}</dl></div>` +
        `<p class="mr-muted">${gloss(EXPLAIN.cold)}</p>`;
    }
    const verdictLine = (ok, text) => `<p class="${ok ? 'mr-ok' : 'mr-ko'}">${text} ${ok ? CHECK.judgedOk : CHECK.judgedWrong}</p>`;
    return `<p>${gloss(LABELS.yourBet.winner(betText('winner')))} ${c.most ? CHECK.yourConclusion(gloss(sentence('most', c.most))) : ''}</p>` +
      verdictLine(c.vWinner === ev.shouldWinner, CHECK.verdictWinner[ev.shouldWinner]) +
      `<p>${gloss(LABELS.yourBet.final(betText('final')))} ${CHECK.yourFinal(noteText('mug', 't1'), noteText('jug', 't1'))}</p>` +
      verdictLine(c.vFinal === ev.shouldFinal, CHECK.verdictFinal[ev.shouldFinal]) +
      `<p class="mr-muted">${gloss(EXPLAIN.finalTemp)}</p>` +
      (ev.shouldWinner === 'rejected' || ev.shouldFinal === 'rejected' ? `<p class="mr-muted">${CHECK.rejectedNote}</p>` : '');
  }

  function renderCheck() {
    const ev = evaluate();
    const score = CRITERIA.filter(k => ev[k]).length;
    const rows = CRITERIA.map(k => `<button type="button" class="mr-crit ${ev[k] ? 'is-ok' : 'is-ko'} ${state.selected === k ? 'is-selected' : ''}" data-crit="${k}">` +
      `<span class="mr-crit-text"><strong>${LABELS.criteria[k]}</strong><small>${LABELS.criteriaSub[k]}</small></span>` +
      `<span class="mr-crit-mark" aria-label="${ev[k] ? LABELS.markCorrect : LABELS.markIncorrect}">${ev[k] ? '✓' : '✗'}</span></button>`).join('');

    lab.body.innerHTML = `<div class="mr-check">` +
      `<div class="mr-check-left">` +
        `<div class="lab-score"><span class="lab-score-num">${score}<small> / ${CRITERIA.length}</small></span><span class="lab-score-label">${LABELS.scoreLabel}</span></div>` +
        `<div class="mr-crit-list">${rows}</div>` +
        `<p class="mr-reminder mr-reminder-box">${gloss(LABELS.bigQuestion)}</p>` +
      `</div>` +
      `<div class="mr-check-detail" aria-live="polite"><h3>${LABELS.criteria[state.selected]}</h3>${criterionDetail(state.selected, ev)}</div>` +
      `</div>`;

    $$('[data-crit]').forEach(btn => btn.addEventListener('click', () => {
      state.selected = btn.dataset.crit;
      renderCheck();
    }));
    lab.fillSpace($('.mr-check-detail'));
    lab.checkFooter();
  }

  /* ===== Rapport imprimable : contenu des 7 sections de la fiche outil FO3
     (en-tête, numérotation et mise en page : cadre commun) =====
     Les erreurs passent par mark() (lab-engine.js), dans l'ordre de
     lecture : relevés faux et soustraction fausse (observations), notes de
     la loupe, confusion chaleur / température et « froid » qui passe
     (interprétation), gagnant contraire aux pesées et jugements
     (conclusion). */
  function buildReport(mark) {
    const R = LABELS.report;
    const ev = evaluate();
    const c = state.concl;
    const m = water0('mug'), j = water0('jug');
    const word = (text, ok, note) => (ok ? text : mark(text, plain(note)));

    const hyp = `<ul><li>${R.hypWinner(betText('winner'))}</li><li>${R.hypFinal(betText('final'))}</li></ul>` +
      (state.because.trim() ? `<p>${R.because}: ${escapeHtml(state.because.trim())}</p>` : '');

    const cellOf = (s, f) => {
      const x = ev.misses.find(y => y.side === s && y.f === f);
      return x ? mark(noteText(s, f), missText(x), { box: true }) : noteText(s, f);
    };
    const table = `<table class="mr-report-table"><tr><th></th>${SIDES.map(s => `<th>${LABELS.sides[s].col}</th>`).join('')}</tr>` +
      FIELDS.map(f => `<tr><th>${plain(LABELS.fields[f])}</th>${SIDES.map(s => `<td>${cellOf(s, f)}</td>`).join('')}</tr>`).join('') + `</table>`;
    const seen = k => (state.seen[k]
      ? word(LABELS.seenChoices[state.seen[k]], ev.seenOk[k], CHECK.seenNote[k](LABELS.seenChoices[SEEN_RIGHT[k]]))
      : DASH);
    const observations = table +
      `<p>${R.seenStart(seen('fastStart'), seen('moreStart'))}</p><p>${R.seenEnd(seen('fastEnd'))}</p>`;

    const why = k => LABELS.concl[k](c[k]
      ? word(LABELS.words[k][c[k]], ev.whyOk[k], `${CHECK.answerWrong} ${sentence(k, RIGHT_WHY[k])} ${CHECK.whyNote[k]}`)
      : DASH);
    const most = LABELS.concl.most(c.most ? word(LABELS.words.most[c.most], ev.mostOk, CHECK.mostNote(rightMost(ev))) : DASH);
    const hottest = LABELS.concl.hottest(c.hottest ? word(LABELS.words.hottest[c.hottest], ev.hottestOk, CHECK.mostNote(rightHottest(ev))) : DASH);
    const verdictLine = (text, v, should, notes) => R.verdict(text, v ? word(LABELS[v], v === should, notes[should]) : DASH);
    const verdicts = `<ul><li>${verdictLine(LABELS.verdictWinner, c.vWinner, ev.shouldWinner, CHECK.verdictWinner)}</li>` +
      `<li>${verdictLine(LABELS.verdictFinal, c.vFinal, ev.shouldFinal, CHECK.verdictFinal)}</li></ul>`;

    const correction = CRITERIA.map(k => `<tr><th>${LABELS.criteria[k]}</th><td class="${ev[k] ? 'ok' : 'ko'}">${ev[k] ? '✓' : '✗'}</td></tr>`).join('');

    return {
      title: R.title,
      sections: [
        `<p>${plain(LABELS.bigQuestion)}</p>`,
        hyp,
        `<p>${R.materials(LABELS.vol(m.v), tempText(m.t), LABELS.vol(j.v), tempText(j.t))}</p>`,
        `<ol>${R.steps.map(t => `<li>${t}</li>`).join('')}</ol>`,
        observations,
        WHY.map(k => `<p>${why(k)}</p>`).join(''),
        `<p>${most} ${hottest}</p>${verdicts}`
      ],
      correction: `<p><strong>${R.score(CRITERIA.filter(k => ev[k]).length, CRITERIA.length)}</strong></p>` +
        `<table class="mr-report-corr">${correction}</table>`
    };
  }

  lab = LabEngine.create({
    id: 'melting',
    // Ce qu'il faut toucher ou remplir maintenant (voir nextTask).
    todo: step => (step === 2 ? todoEls() : []),
    // Page d'accueil (Mission, voir lab-engine.js) : toujours la même, rien du tirage.
    briefing: () => ({
      heading: LABELS.briefTitle,
      intro: gloss(LABELS.briefTask),
      questionTitle: LABELS.yourQuestion,
      questions: [gloss(LABELS.bigQuestion)],
      steps: LABELS.briefSteps.map((text, i) => ({
        text: gloss(text),
        detail: gloss(LABELS.briefDetails[i]),
        pics: i === 1 ? [
          { html: `<svg viewBox="2 4 106 80" aria-hidden="true" focusable="false">${balanceInner(0)}</svg>`, label: LABELS.tools.balance },
          { html: PROBE_ICON, label: LABELS.tools.probe },
          { html: LENS_ICON, label: LABELS.tools.lens }
        ] : null
      })),
      checks: Object.values(LABELS.criteria)
    }),
    title: LABELS.title,
    glossary: GLOSSARY,
    reset,
    stepComplete,
    lockReason,
    isStarted: () => !!state.bets.winner || !!state.bets.final || state.started,
    render: { 1: renderPredict, 2: () => renderExperiment(), 3: renderConclude, 4: renderCheck },
    report: buildReport,
    version: 2,
    save: () => ({ run, state }),
    // Un versement ou une course interrompus en cours d'animation sont déjà
    // comptés : la paillasse se redessine dans l'état atteint.
    load(data) {
      const r = data.run, s = data.state;
      if (!r || !PAIRS[r.pair] || r.ice !== ICE || typeof r.seed !== 'string' ||
        !s || !s.bets || !Array.isArray(s.blocks) || s.blocks.length !== 2 || !s.poured ||
        !s.notes || !s.notes.mug || !s.notes.jug || !s.seen || !s.concl || typeof s.raced !== 'boolean') throw new Error('labProgress');
      run = r;
      state = s;
      if (!CRITERIA.includes(state.selected)) state.selected = CRITERIA[0];
      pouring = null;
      racing = false;
      lensSims = {};
      stepperDone = null;
      conclReady = null;
    },
    summary() {
      const ev = evaluate();
      const criteria = {};
      CRITERIA.forEach(k => { criteria[k] = ev[k]; });
      return {
        score: CRITERIA.filter(k => ev[k]).length,
        total: CRITERIA.length,
        criteria,
        labels: LABELS.criteria, // noms des critères, pour le tableau de bord
        details: {
          pair: run.pair,
          ice: run.ice,
          winner: trueWinner(),
          betWinner: state.bets.winner,
          betFinal: state.bets.final,
          measuresRight: ev.good,
          measures: ev.total
        }
      };
    }
  });
})();
