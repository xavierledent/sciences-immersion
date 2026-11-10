/* ===== Labo virtuel « Ostend 2100 » (phys2) : pourquoi la mer monte =====

   Simulation propre à ce labo, commune aux deux filières ; ses textes sont
   dans le dossier du chapitre, un fichier par langue (lab-ostend.en.js,
   lab-ostend.nl.js). Le cadre commun (modale, barre d'étapes, verrous,
   traduction, glisser-déposer, rapport imprimé) est dans lab-engine.js.
   Ordre de chargement : moteur, textes, ce fichier.

   Labo réel repris : la Mission 13 du cours (« Sea ice or land ice? » :
   deux verres, glaçons qui flottent ou posés sur une grille), élargie à la
   dilatation de l'eau de mer et à un modèle de la côte à Ostende. Une
   grande question en deux temps : pourquoi la mer monte (deux
   expériences), et ce que cela change à Ostende d'ici 2100 (expérience
   sur un modèle).

   Tiré au sort à chaque nouveau labo : le nombre de glaçons et le niveau
   de départ des verres ; la température et le niveau de départ du flacon,
   sa masse ; un scénario mondial parmi quatre (la hausse en 2100 et ses
   deux parts) et la protection qui suffit en 2100 (sable, mur ou les deux),
   d'où la hauteur du tronçon de digue. Sans protection, la tempête de 2100
   passe toujours par-dessus la digue : l'élève en voit toujours l'effet.
   Le scénario n'est dit qu'au Check.

   Déroulé :
     1. Predict    — placer le niveau d'arrivée sur quatre dessins (verre à
                     glaçons flottants, verre à glaçons sur grille, flacon
                     d'eau de mer qu'on tiédit, forte tempête contre la
                     digue, en 2100)
     2. Experiment — trois postes : (1) les deux verres : poser les
                     glaçons, noter les niveaux, laisser fondre, noter ;
                     (2) l'eau de mer tiédie : peser le flacon, le chauffer
                     par paliers de 5 °C, noter le niveau dans le tube fin,
                     repeser ; (3) le modèle de la côte : forte tempête en
                     2025 (l'eau passe-t-elle la digue ?), passage en 2100
                     (la mer monte, avec la mire du port et les colonnes
                     « d'où vient la hausse »), noter la hausse et ses deux
                     parts, tempête en 2100, puis les protections (sable,
                     mur). Les postes 1 et 2 dans l'ordre voulu ; le poste
                     3 après eux.
     3. Conclude   — quelle glace fait monter le niveau, d'où vient surtout
                     la hausse ; volume, masse et particules de l'eau
                     chauffée ; la hausse en 2100, la tempête, le moindre
                     ouvrage qui garde la ville au sec ; le jugement des
                     quatre niveaux
     4. Check      — 5 vérifications : mesures, la glace, l'eau tiède,
                     Ostende en 2100, jugement ; rapport (FO3)

   Chiffres du modèle (cm au-dessus du niveau moyen de la mer de 2025) :
   hausses arrondies d'après les médianes du GIEC (AR6, 2100 par rapport à
   1995-2014 : 0,44 m à 0,77 m selon le scénario, ramenées à 2025) ; marée
   haute et tempête de 1953 à Ostende d'après les relevés (+4,5 m et
   +6,66 m TAW, niveau moyen vers +2,3 m TAW) ; la hauteur des vagues, le
   gain du sable et celui du mur sont des simplifications du modèle. */

(function () {
  'use strict';

  const { escapeHtml, mulberry32, seedFrom, ease } = LabEngine.util;

  // Cadre commun, créé en fin de fichier (LabEngine.create).
  let lab;
  const $ = sel => lab.$(sel);
  const $$ = sel => lab.$$(sel);
  const gloss = text => lab.gloss(text);
  const plain = text => String(text).replace(/\[([^\]|]+)(?:\|[^\]]+)?\]/g, '$1');

  /* ===== Textes =====
     Dans le dossier du chapitre, un fichier par langue, chargé avant
     celui-ci. Masses par LABELS.num (séparateur décimal de la langue). */
  const {
    labels: LABELS, glossary: GLOSSARY, explanations: EXPLAIN, check: CHECK
  } = LabEngine.textFor('ostend');
  const num = LABELS.num;

  /* ===== Modèle ===== */
  const CUBE = 10;                      // mL d'eau que donne un glaçon
  const TUBE_STEPS = [0, 16, 36, 60];   // mm gagnés dans le tube fin après 0, 1, 2, 3 paliers de 5 °C
  const YEARS = [2025, 2100];
  // rise : hausse du niveau moyen en 2100 (cm) ; land, water : ses deux
  // parts (glace terrestre, eau plus chaude).
  const SCENARIOS = {
    low: { warming: 1.8, rise: 40, land: 25, water: 15 },
    medium: { warming: 2.7, rise: 50, land: 30, water: 20 },
    high: { warming: 3.6, rise: 60, land: 35, water: 25 },
    veryHigh: { warming: 4.4, rise: 70, land: 40, water: 30 }
  };
  const HIGH_TIDE = 220;       // marée haute de 2025
  const STORM_STILL = 430;     // niveau de la mer par forte tempête, à marée haute (2025)
  const STORM_TOP = 620;       // jusqu'où montent les vagues contre la digue (2025)
  const SAND_GAIN = 20;        // plus de sable : les vagues montent moins haut
  const WALL_GAIN = 40;        // mur rehaussé
  /* Le sommet du tronçon de digue dépasse de run.margin cm les vagues de
     2025 : au moins MIN_MARGIN (la tempête d'aujourd'hui reste nettement
     dessous), toujours moins que la hausse (en 2100, sans protection,
     l'eau passe). L'excès de la hausse sur la marge fait la protection qui
     suffit : jusqu'à 20 cm le sable, jusqu'à 40 cm le mur, au-delà les deux. */
  const MIN_MARGIN = 15;
  const EXCESS = { sand: 10, wall: 25, both: 45 };
  // Essais de tempête : « année-sable-mur ».
  const CONFIGS = ['2025-00', '2100-00', '2100-10', '2100-01', '2100-11'];
  const REQUIRED = ['2025-00', '2100-00'];
  // Protections, de la moindre à la plus lourde, et l'essai qui leur correspond.
  const WORKS = ['sand', 'wall', 'both'];
  const WORK_KEYS = { sand: '2100-10', wall: '2100-01', both: '2100-11' };
  // Les trois parts de la hausse, dans l'ordre des colonnes.
  const PARTS = ['ice', 'land', 'water'];

  const MOVES = ['up', 'same', 'down'];
  const CRITERIA = ['measure', 'ice', 'water', 'coast', 'verdict'];
  const TOL = { ml: 2, mm: 2, mass: 0.05, rise: 2 };
  const DASH = '—';

  let run;      // tirage
  let state;    // travail de l'élève

  const pick = list => list[Math.floor(Math.random() * list.length)];
  const round1 = v => Math.round(v * 10) / 10;

  function reset() {
    const scenario = pick(Object.keys(SCENARIOS));
    const rise = SCENARIOS[scenario].rise;
    const need = pick(WORKS.filter(w => rise - EXCESS[w] >= MIN_MARGIN));
    run = {
      cubes: pick([2, 3, 4]),
      level: pick([50, 60, 70]),
      t0: pick([8, 10, 12]),
      h0: pick([10, 14, 18]),
      mass: round1(380 + Math.random() * 80),
      scenario,
      margin: rise - EXCESS[need],
      seed: String(Math.random())
    };
    const tests = {};
    CONFIGS.forEach(k => { tests[k] = { over: null }; });
    state = {
      pred: { a: null, b: null, flask: null, storm: null },
      because: '',
      started: false,      // les hypothèses se figent au premier geste d'un poste
      tab: 0,
      s1: { iceA: false, iceB: false, melted: false, notes: { a0: null, b0: null, a1: null, b1: null } },
      s2: { pos: 'balance', step: 0, back: false, levels: [null, null, null, null], mass: { start: null, end: null } },
      // year : 0 (2025) ou 1 (2100) ; reached : 1 dès que 2100 a été atteint.
      s3: {
        year: 0, reached: 0, storm: false, sand: false, wall: false, ran: {},
        rise: null, parts: { land: null, water: null }, tests
      },
      concl: {
        glass: null, source: null, biggest: null, volume: null, mass: null, particles: null,
        rise: null, over: null, work: null, vA: null, vB: null, vFlask: null, vStorm: null
      },
      selected: CRITERIA[0]
    };
  }

  const scen = () => SCENARIOS[run.scenario];
  const finalRise = () => scen().rise;
  // Niveau lu dans un verre : au départ glaçons posés, puis glace fondue.
  const glassLevel = (glass, melted) => run.level + (glass === 'b' && melted ? run.cubes * CUBE : 0);
  const tubeLevel = step => run.h0 + TUBE_STEPS[step];
  const seaTemp = step => run.t0 + 5 * step;

  const configKey = (year, sand, wall) => `${YEARS[year]}-${sand ? 1 : 0}${wall ? 1 : 0}`;
  const currentKey = () => configKey(state.s3.year, state.s3.sand, state.s3.wall);
  const partsOf = key => ({ late: key.slice(0, 4) === '2100', sand: key[5] === '1', wall: key[6] === '1' });
  // Jusqu'où montent les vagues, et sommet de la digue, pour un essai.
  function stormTop(key) {
    const c = partsOf(key);
    return STORM_TOP + (c.late ? finalRise() : 0) - (c.sand ? SAND_GAIN : 0);
  }
  const crestOf = key => STORM_TOP + run.margin + (partsOf(key).wall ? WALL_GAIN : 0);
  const isOver = key => stormTop(key) > crestOf(key);
  const leastWork = () => WORKS.find(w => !isOver(WORK_KEYS[w])) || 'both';

  /* ===== Dessins =====
     Tout change à l'écran (niveaux, glaçons, mer, digue) : tout est en SVG. */
  const svg = (w, h, inner, cls, extra) => `<svg class="${cls || ''}" viewBox="0 0 ${w} ${h}"${extra || ''} aria-hidden="true" focusable="false">${inner}</svg>`;
  let svgUid = 0;

  const GLASS = '#8ea6b6';
  const WATER = '#9ccbea';
  const SEA = '#7fc4c0';
  const PEN = '#2a78d6';

  /* --- Verre gradué (150 × 260) : 0 mL à y = 236, 1,2 px par mL ---
     o.glass : 'a' (glaçons qui flottent) ou 'b' (glaçons sur une grille) ;
     o.level : niveau de l'eau (mL) ; o.ice : glaçons posés ; o.size : ce
     qu'il reste des glaçons (1 → 0) ; o.move : niveau prédit (Predict) ;
     o.bare : sans graduations (petit dessin sous une colonne). */
  const GL = { x0: 40, x1: 116, top: 36, zero: 236, perMl: 1.2 };
  const glassY = ml => GL.zero - ml * GL.perMl;
  function glassSVG(o) {
    const uid = `osg${++svgUid}`;
    const y = glassY(o.level);
    const inner = `M${GL.x0 + 1},${GL.top} L${GL.x0 + 1},232 Q${GL.x0 + 1},241 ${GL.x0 + 10},241 L${GL.x1 - 10},241 Q${GL.x1 - 1},241 ${GL.x1 - 1},232 L${GL.x1 - 1},${GL.top} Z`;
    let out = `<defs><clipPath id="${uid}"><path d="${inner}"/></clipPath></defs>` +
      `<path d="${inner}" fill="#f4f9fc"/>` +
      `<g clip-path="url(#${uid})"><rect x="0" y="${y.toFixed(1)}" width="150" height="${(260 - y).toFixed(1)}" fill="${WATER}" fill-opacity="0.6"/>` +
      `<line x1="0" x2="150" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#5fa3cf" stroke-width="1.6"/></g>`;
    if (!o.bare) for (let ml = 10; ml <= 150; ml += 10) {
      const major = ml % 50 === 0;
      out += `<line x1="${GL.x0}" x2="${GL.x0 + (major ? 16 : 9)}" y1="${glassY(ml)}" y2="${glassY(ml)}" stroke="#4f6577" stroke-width="${major ? 1.6 : 1}"/>`;
      if (major) out += `<text class="os-scale" x="${GL.x0 - 6}" y="${glassY(ml) + 4}" text-anchor="end">${ml}</text>`;
    }
    if (!o.bare) out += `<text class="os-scale os-scale-unit" x="${GL.x0 - 6}" y="${glassY(150) - 12}" text-anchor="end">${LABELS.units.ml}</text>`;
    // Glaçons : dans l'eau (un dixième dépasse) ou sur la grille.
    if (o.ice && o.size > 0.02) {
      const s = 17 * Math.sqrt(o.size);
      const slot = (GL.x1 - GL.x0 - 8) / run.cubes;
      for (let i = 0; i < run.cubes; i++) {
        const cx = GL.x0 + 4 + slot * (i + 0.5);
        const top = o.glass === 'a' ? y - s * 0.12 : GL.top - 3 - s;
        out += `<rect x="${(cx - s / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${s.toFixed(1)}" height="${s.toFixed(1)}" rx="3" fill="#eef7fc" fill-opacity="0.92" stroke="#8fbcd8" stroke-width="1.3"/>` +
          `<path d="M${(cx - s * 0.25).toFixed(1)},${(top + s * 0.3).toFixed(1)} l${(s * 0.2).toFixed(1)},${(-s * 0.12).toFixed(1)}" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/>`;
        // La glace sur la grille s'égoutte dans le verre.
        if (o.glass === 'b' && o.size < 0.98) {
          out += `<circle class="os-drop" cx="${cx.toFixed(1)}" cy="${GL.top + 10}" r="2.2" fill="#5fa3cf" style="animation-delay: ${(-i * 0.27).toFixed(2)}s"/>`;
        }
      }
    }
    if (o.glass === 'b') {
      out += `<path d="M${GL.x0 - 8},${GL.top - 2} H${GL.x1 + 8}" stroke="#5b6470" stroke-width="2.6" stroke-linecap="round"/>` +
        `<path d="M${GL.x0 - 4},${GL.top - 2} H${GL.x1 + 4}" stroke="#ffffff" stroke-width="2.6" stroke-dasharray="1 6" stroke-linecap="butt"/>`;
    }
    out += `<path d="M${GL.x0},${GL.top - (o.glass === 'b' ? 0 : 6)} L${GL.x0},232 Q${GL.x0},242 ${GL.x0 + 10},242 L${GL.x1 - 10},242 Q${GL.x1},242 ${GL.x1},232 L${GL.x1},${GL.top - (o.glass === 'b' ? 0 : 6)}" fill="none" stroke="${GLASS}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>` +
      `<path d="M${GL.x1 - 9},60 L${GL.x1 - 9},220" stroke="#ffffff" stroke-opacity="0.7" stroke-width="4" stroke-linecap="round"/>`;
    if (o.move) out += moveMark(GL.x0 - 2, GL.x1 + 14, y, o.move);
    return svg(150, 260, out, 'os-glass-svg');
  }

  // Niveau prédit : un trait en pointillé, plus haut, au même niveau ou plus bas.
  function moveMark(x0, x1, y, move) {
    const at = y + { up: -18, same: 0, down: 18 }[move];
    return `<line x1="${x0}" x2="${x1}" y1="${at.toFixed(1)}" y2="${at.toFixed(1)}" stroke="${PEN}" stroke-width="2.6" stroke-dasharray="6 4" stroke-linecap="round"/>` +
      `<path d="M${x1 + 8},${(at - 5).toFixed(1)} L${x1},${at.toFixed(1)} L${x1 + 8},${(at + 5).toFixed(1)} Z" fill="${PEN}"/>`;
  }

  /* --- Flacon plein d'eau de mer, bouchon et tube fin (100 × 275) ---
     Le niveau dans le tube : 0 mm à y = 140, 1,1 px par mm. */
  const tubeY = mm => 140 - mm * 1.1;
  function flaskInner(mm, move) {
    const body = 'M41,150 L41,190 L10,258 Q6,269 17,269 L83,269 Q94,269 90,258 L59,190 L59,150 Z';
    return `<path d="${body}" fill="${SEA}" fill-opacity="0.7"/>` +
      `<rect x="46.5" y="12" width="7" height="150" rx="2" fill="#ffffff" fill-opacity="0.75" stroke="${GLASS}" stroke-width="1.4"/>` +
      `<rect x="48" y="${tubeY(mm).toFixed(1)}" width="4" height="${(162 - tubeY(mm)).toFixed(1)}" fill="${SEA}"/>` +
      `<path d="M39,146 L61,146 L59,159 L41,159 Z" fill="#b0705a" stroke="#8a5443" stroke-width="1"/>` +
      `<path d="${body}" fill="none" stroke="${GLASS}" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M29,232 L21,252" stroke="#ffffff" stroke-opacity="0.75" stroke-width="4" stroke-linecap="round"/>` +
      (move ? moveMark(40, 62, tubeY(mm), move) : '');
  }

  // Le tube fin vu de près (100 × 330) : graduations tous les 2 mm.
  const zoomY = mm => 312 - mm * 2.9;
  function tubeZoomSVG(mm) {
    let out = `<rect x="38" y="14" width="20" height="306" rx="4" fill="#ffffff" stroke="${GLASS}" stroke-width="1.6"/>` +
      `<rect x="40.5" y="${zoomY(mm).toFixed(1)}" width="15" height="${(318 - zoomY(mm)).toFixed(1)}" fill="${SEA}"/>` +
      `<line x1="40.5" x2="55.5" y1="${zoomY(mm).toFixed(1)}" y2="${zoomY(mm).toFixed(1)}" stroke="#3d9a94" stroke-width="1.6"/>`;
    for (let v = 0; v <= 100; v += 2) {
      const major = v % 10 === 0;
      out += `<line x1="58" x2="${major ? 70 : 64}" y1="${zoomY(v).toFixed(1)}" y2="${zoomY(v).toFixed(1)}" stroke="#4f6577" stroke-width="${major ? 1.5 : 0.9}"/>`;
      if (major) out += `<text class="os-scale" x="74" y="${(zoomY(v) + 4).toFixed(1)}">${v}</text>`;
    }
    return svg(100, 330, out + `<text class="os-scale os-scale-unit" x="74" y="12">${LABELS.units.mm}</text>`, 'os-zoom-svg');
  }

  /* --- Poste 2 : balance, bain d'eau sur plaque chauffante (440 × 366,
     paillasse à y = 330) --- */
  const massText = v => `${num(v)} ${LABELS.units.g}`;
  function bench2Back(mass, heating) {
    return `<rect x="24" y="274" width="132" height="7" rx="3.5" fill="#cfd6dd" stroke="#9aa5b1" stroke-width="1.2"/>` +
      `<rect x="82" y="281" width="16" height="9" fill="#aeb7c0"/>` +
      `<rect x="28" y="289" width="124" height="40" rx="8" fill="#e3e7eb" stroke="#aab4be" stroke-width="1.5"/>` +
      `<rect x="42" y="296" width="96" height="26" rx="5" fill="#1d2a23"/>` +
      `<text class="os-lcd" x="132" y="315" text-anchor="end" data-mass-display>${massText(mass)}</text>` +
      // Plaque chauffante et bécher d'eau.
      `<rect x="246" y="326" width="12" height="4" rx="1.5" fill="#7d8894"/><rect x="342" y="326" width="12" height="4" rx="1.5" fill="#7d8894"/>` +
      `<rect x="234" y="293" width="132" height="34" rx="7" fill="#e3e7eb" stroke="#aab4be" stroke-width="1.5"/>` +
      `<rect x="240" y="286" width="120" height="8" rx="2.5" fill="${heating ? '#d8562f' : '#56606b'}"/>` +
      `<circle cx="260" cy="310" r="7.5" fill="#8792a0"/><path d="M260,310 L${heating ? '265,305' : '260,303'}" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>` +
      `<circle cx="342" cy="310" r="4" fill="${heating ? '#e2412a' : '#b6bec7'}"/>` +
      `<path d="M247,190 L247,278 Q247,285 254,285 L346,285 Q353,285 353,278 L353,190 Z" fill="#f4f9fc"/>` +
      `<path d="M247,212 L353,212 L353,278 Q353,285 346,285 L254,285 Q247,285 247,278 Z" fill="${WATER}" fill-opacity="0.3"/>`;
  }

  const BENCH2_FRONT = `<path d="M247,212 L353,212 L353,278 Q353,285 346,285 L254,285 Q247,285 247,278 Z" fill="${WATER}" fill-opacity="0.22"/>` +
    `<line x1="247" x2="353" y1="212" y2="212" stroke="#7fb5da" stroke-width="1.5"/>` +
    `<path d="M242,186 L246,190 L246,278 Q246,286 254,286 L346,286 Q354,286 354,278 L354,190 L358,186" fill="none" stroke="${GLASS}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;

  /* --- Poste 3 : coupe de la côte à Ostende (770 × 250) ---
     Hauteurs en cm au-dessus du niveau moyen de la mer de 2025 :
     y = 205 − 0,25 × h. De gauche à droite : la mer, la plage, la digue
     et son mur, la ville, les polders (plus bas que la marée haute).
     o.rise : hausse du niveau moyen ; o.storm : 0 (mer calme, marée haute)
     à 1 (forte tempête) ; o.sand, o.wall : protections ; o.key : l'essai
     dessiné (pour savoir si l'eau passe). */
  const hy = h => 205 - h * 0.25;
  function coastSVG(o) {
    const base = STORM_TOP + run.margin;            // sommet du mur actuel
    const crest = base + (o.wall ? WALL_GAIN : 0);
    const walk = base - 90;                         // la promenade, sur la digue
    const sea = HIGH_TIDE + o.rise + (STORM_STILL - HIGH_TIDE) * o.storm;
    const top = sea + (STORM_TOP - STORM_STILL - (o.sand ? SAND_GAIN : 0)) * o.storm;
    const over = o.storm > 0.85 && top > crest;
    const p = pts => pts.map(([x, h]) => `${x},${hy(h).toFixed(1)}`).join(' ');
    let out = `<rect x="0" y="0" width="770" height="250" fill="${o.storm > 0.5 ? '#dfe5ea' : '#f3f8fc'}"/>`;
    // La mer, jusqu'à la digue ; la terre, dessinée par-dessus, la cache où elle est plus haute.
    out += `<rect x="0" y="${hy(sea).toFixed(1)}" width="470" height="${(250 - hy(sea)).toFixed(1)}" fill="#6fb3d9"/>`;
    if (o.storm > 0.05) {
      // Vagues : la surface se creuse, et une lame monte contre la digue.
      let wave = `M0,${hy(sea).toFixed(1)}`;
      for (let x = 0; x < 380; x += 38) wave += ` q9.5,${(-9 * o.storm).toFixed(1)} 19,0 t19,0`;
      out += `<path d="${wave} L380,250 L0,250 Z" fill="#6fb3d9"/>` +
        `<path d="M360,${hy(sea).toFixed(1)} Q430,${hy(sea + (top - sea) * 0.35).toFixed(1)} 452,${hy(top).toFixed(1)} Q462,${hy(top + 12).toFixed(1)} 470,${hy(top - 30).toFixed(1)} L470,250 L360,250 Z" fill="#8cc4e3"/>` +
        `<path d="M444,${hy(top - 6).toFixed(1)} q6,-9 14,-5 M430,${hy(top - 60).toFixed(1)} q7,-8 15,-3" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>`;
    }
    // Fond de la mer et plage.
    out += `<polygon points="${p([[0, -150], [240, -90], [300, -30], [420, 330], [440, 330]])} 440,250 0,250" fill="#e7d3a1"/>`;
    if (o.sand) out += `<polygon points="${p([[250, -80], [330, 150], [432, 420], [440, 330], [420, 330], [300, -30]])}" fill="#f1dfae" stroke="#cdb275" stroke-width="1.2" stroke-linejoin="round"/>`;
    // Digue, promenade et mur.
    out += `<polygon points="${p([[418, 330], [456, walk], [506, walk]])} 506,250 418,250" fill="#b9c0c7" stroke="#8d97a1" stroke-width="1.2" stroke-linejoin="round"/>` +
      `<rect x="498" y="${hy(base).toFixed(1)}" width="8" height="${(hy(walk) - hy(base)).toFixed(1)}" fill="#7d8894"/>` +
      (o.wall ? `<rect x="498" y="${hy(crest).toFixed(1)}" width="8" height="${(hy(base) - hy(crest)).toFixed(1)}" fill="#4f5b66"/>` : '');
    // La ville derrière la digue, puis les polders.
    out += `<polygon points="${p([[506, 250], [650, 250], [672, 120], [770, 120]])} 770,250 506,250" fill="#c9bfa8"/>` +
      `<polygon points="${p([[660, 190], [672, 120], [770, 120]])} 770,250 660,250" fill="#b9d48f"/>` +
      `<rect x="704" y="${hy(120).toFixed(1)}" width="16" height="5" fill="#6fb3d9"/>`;
    const town = [[516, 58, 22], [542, 78, 26], [572, 50, 20], [596, 68, 24], [624, 44, 20]];
    town.forEach(([x, h, w], i) => {
      const y0 = hy(250) - h;
      out += `<rect x="${x}" y="${y0.toFixed(1)}" width="${w}" height="${h}" fill="${i % 2 ? '#e8ddd0' : '#dcd3e3'}" stroke="#8d8a94" stroke-width="1"/>`;
      for (let r = 0; r < Math.floor(h / 16); r++) {
        out += `<rect x="${x + 4}" y="${(y0 + 6 + r * 15).toFixed(1)}" width="5" height="6" fill="#7f95a8"/><rect x="${x + w - 9}" y="${(y0 + 6 + r * 15).toFixed(1)}" width="5" height="6" fill="#7f95a8"/>`;
      }
    });
    out += `<path d="M738,${hy(120).toFixed(1)} v-16 h18 v16 Z M735,${(hy(120) - 16).toFixed(1)} l12,-10 l12,10 Z" fill="#d9a583" stroke="#9c6f52" stroke-width="1"/>` +
      `<circle cx="690" cy="${(hy(120) - 16).toFixed(1)}" r="9" fill="#7fae5c"/><rect x="688.5" y="${(hy(120) - 8).toFixed(1)}" width="3" height="8" fill="#7a5a3a"/>`;
    // L'eau passe par-dessus : la promenade, la rue, puis les polders.
    if (over) {
      out += `<path d="M470,${hy(top - 30).toFixed(1)} Q490,${hy(crest + 26).toFixed(1)} 512,${hy(crest - 20).toFixed(1)} L512,${hy(250).toFixed(1)} L498,${hy(walk).toFixed(1)} L470,${hy(walk).toFixed(1)} Z" fill="#8cc4e3"/>` +
        `<rect x="506" y="${(hy(250) - 5).toFixed(1)}" width="148" height="5" fill="#6fb3d9"/>` +
        `<polygon points="${p([[654, 250], [668, 165], [770, 165]])} 770,${hy(120).toFixed(1)} 672,${hy(120).toFixed(1)}" fill="#6fb3d9" fill-opacity="0.85"/>`;
    }
    // Repère : la marée haute de 2025, prolongée sous la terre.
    out += `<line x1="0" x2="770" y1="${hy(HIGH_TIDE).toFixed(1)}" y2="${hy(HIGH_TIDE).toFixed(1)}" stroke="#35628a" stroke-width="1" stroke-dasharray="5 5" stroke-opacity="0.75"/>` +
      `<text class="os-model-note" x="8" y="${(hy(HIGH_TIDE) - 5).toFixed(1)}">${LABELS.s3.tideLine}</text>`;
    if (o.storm > 0.5) {
      for (let i = 0; i < 22; i++) out += `<line x1="${20 + i * 34}" y1="${6 + (i * 37) % 60}" x2="${12 + i * 34}" y2="${22 + (i * 37) % 60}" stroke="#8ea0b0" stroke-width="1.2" stroke-linecap="round"/>`;
    }
    const names = LABELS.s3.places;
    out += `<text class="os-model-label" x="120" y="242" text-anchor="middle">${names.sea}</text>` +
      `<text class="os-model-label" x="355" y="242" text-anchor="middle">${names.beach}</text>` +
      `<text class="os-model-label" x="470" y="${(hy(crest) - 8).toFixed(1)}" text-anchor="middle">${names.dike}</text>` +
      `<text class="os-model-label" x="578" y="242" text-anchor="middle">${names.city}</text>` +
      `<text class="os-model-label" x="718" y="242" text-anchor="middle">${names.polders}</text>`;
    return svg(770, 250, out, 'os-coast-svg');
  }

  // Mire du port (110 × 190) : niveau moyen de la mer, 0 = niveau de 2025 ; 2 px par cm.
  function gaugeSVG(rise) {
    const y = cm => 176 - cm * 2;
    let out = `<rect x="0" y="${y(rise).toFixed(1)}" width="110" height="${(190 - y(rise)).toFixed(1)}" fill="#6fb3d9" fill-opacity="0.55"/>` +
      `<rect x="40" y="8" width="20" height="174" rx="2" fill="#fffdf4" stroke="#8d8a7a" stroke-width="1.4"/>`;
    for (let cm = 0; cm <= 80; cm += 5) {
      const major = cm % 10 === 0;
      out += `<line x1="60" x2="${major ? 72 : 66}" y1="${y(cm)}" y2="${y(cm)}" stroke="#4f5b54" stroke-width="${major ? 1.5 : 1}"/>`;
      if (major) out += `<text class="os-scale" x="76" y="${y(cm) + 4}">${cm}</text>`;
    }
    out += `<line x1="0" x2="110" y1="${y(rise).toFixed(1)}" y2="${y(rise).toFixed(1)}" stroke="#2f7fb5" stroke-width="2"/>` +
      `<line x1="4" x2="40" y1="${y(0)}" y2="${y(0)}" stroke="#35628a" stroke-width="1" stroke-dasharray="4 3"/>` +
      `<text class="os-scale" x="4" y="${y(0) - 4}">2025</text>` +
      `<text class="os-scale os-scale-unit" x="4" y="18">${LABELS.units.cm}</text>`;
    return svg(110, 190, out, 'os-gauge-svg');
  }

  // Un dessin du labo placé en petit dans un autre (sans sa classe, qui fixe sa taille).
  const nest = (markup, x, y, w, h) => markup.replace(/^<svg class="[^"]*"/, `<svg x="${x}" y="${y}" width="${w}" height="${h}"`);

  /* D'où vient la hausse (410 × 150) : trois colonnes de 0 à 40 cm, 2 px
     par cm, qui montent avec la mer (rise : la hausse affichée) ; sous
     chacune, en petit, le poste qui a montré cette cause (verre 1, verre
     2, flacon). Leurs noms, en HTML, sont centrés sous les colonnes
     (x = 90, 210 et 330). La glace de mer reste à 0. */
  function partsSVG(rise) {
    const y = cm => 90 - cm * 2;
    const share = rise / finalRise();
    const values = { ice: 0, land: scen().land * share, water: scen().water * share };
    const fills = { ice: '#c9d6e2', land: '#6fb3d9', water: '#e39a5b' };
    const pics = {
      ice: glassSVG({ glass: 'a', level: run.level, ice: true, size: 1, bare: true }),
      land: glassSVG({ glass: 'b', level: run.level, ice: true, size: 1, bare: true }),
      water: svg(100, 275, flaskInner(run.h0))
    };
    let out = '';
    for (let cm = 0; cm <= 40; cm += 5) {
      const major = cm % 10 === 0;
      out += `<line x1="${major ? 30 : 34}" x2="400" y1="${y(cm)}" y2="${y(cm)}" stroke="${major ? '#dcdfda' : '#eef0ec'}" stroke-width="1"/>`;
      if (major) out += `<text class="os-scale" x="26" y="${y(cm) + 4}" text-anchor="end">${cm}</text>`;
    }
    out += `<line x1="34" x2="400" y1="${y(0)}" y2="${y(0)}" stroke="#a9ada4" stroke-width="1.2"/>`;
    PARTS.forEach((k, i) => {
      const cx = 90 + i * 120;
      const top = y(values[k]).toFixed(1);
      out += `<rect x="${cx - 32}" y="${top}" width="64" height="${(y(0) - top).toFixed(1)}" fill="${fills[k]}"/>` +
        `<line x1="${cx - 35}" x2="${cx + 35}" y1="${top}" y2="${top}" stroke="#35424e" stroke-width="2"/>` +
        nest(pics[k], cx - 30, 98, 60, 52);
    });
    return svg(410, 150, out, 'os-parts-svg');
  }

  /* Predict, quatrième dessin (150 × 260) : une forte tempête aujourd'hui,
     la vague contre le talus de la digue ; le repère dit où l'eau montera
     en 2100 (move). */
  function stormPredSVG(move) {
    const top = 112;                                  // haut de la vague
    const slopeX = h => 70 + (260 - h) * 56 / 190;    // le talus, de (70, 260) à (126, 70)
    let out = `<rect x="0" y="0" width="150" height="260" rx="10" fill="#dfe5ea"/>`;
    for (let i = 0; i < 7; i++) {
      out += `<line x1="${14 + i * 20}" y1="${10 + (i * 23) % 40}" x2="${8 + i * 20}" y2="${24 + (i * 23) % 40}" stroke="#8ea0b0" stroke-width="1.2" stroke-linecap="round"/>`;
    }
    out += `<polygon points="70,260 126,70 150,70 150,260" fill="#b9c0c7" stroke="#8d97a1" stroke-width="1.2" stroke-linejoin="round"/>` +
      `<rect x="141" y="50" width="7" height="20" fill="#7d8894"/>` +
      `<path d="M0,172 q8,-8 16,0 t16,0 t16,0 t16,0 Q96,164 ${(slopeX(top) - 4).toFixed(1)},${top} L${slopeX(top).toFixed(1)},${top} L70,260 L0,260 Z" fill="#6fb3d9"/>` +
      `<path d="M${(slopeX(top) - 18).toFixed(1)},${top + 10} q6,-8 13,-6 M60,160 q6,-6 12,-2" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>`;
    if (move) out += moveMark(6, 112, top, move);
    return svg(150, 260, out, 'os-storm-svg');
  }

  // Glace et eau liquide vues par leurs particules (correction, critère « The ice »).
  function particlesSVG() {
    let out = `<rect x="2" y="2" width="116" height="96" rx="8" fill="#f4f9fc" stroke="#c7d6e2"/><rect x="132" y="2" width="116" height="96" rx="8" fill="#f4f9fc" stroke="#c7d6e2"/>`;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) out += `<circle cx="${18 + c * 21 + (r % 2) * 5}" cy="${17 + r * 22}" r="6" fill="#9ccbea" stroke="#5fa3cf"/>`;
    const rnd = mulberry32(seedFrom('ostend-liquid'));
    for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) out += `<circle cx="${(146 + c * 17.5 + (rnd() - 0.5) * 6).toFixed(1)}" cy="${(14 + r * 17.5 + (rnd() - 0.5) * 6).toFixed(1)}" r="6" fill="#9ccbea" stroke="#5fa3cf"/>`;
    return svg(250, 100, out, 'os-particles-svg');
  }

  const MOVE_PATHS = {
    up: 'M12,20 L12,5 M5,12 L12,5 L19,12',
    same: 'M4,9 L20,9 M4,15 L20,15',
    down: 'M12,4 L12,19 M5,12 L12,19 L19,12'
  };
  const moveIcon = k => `<svg class="os-move-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${MOVE_PATHS[k]}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  // n glaçons : au poste 1, autant que le tirage en met dans chaque verre ; trois sur la page Mission.
  const iceIcon = n => svg(5 + n * 13, 30, Array.from({ length: n }, (_, i) => `<rect x="${3 + i * 13}" y="${i % 2 ? 4 : 9}" width="13" height="13" rx="2.5" fill="#eef7fc" stroke="#8fbcd8" stroke-width="1.4"/>`).join('') +
    `<path d="M2,24 H${3 + n * 13}" stroke="#aab4be" stroke-width="2" stroke-linecap="round"/>`, 'os-ice-icon');
  const ICE_ICON = iceIcon(3);
  const CLOCK_ICON = `<svg class="os-btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">` +
    `<circle cx="12" cy="13.5" r="7.5" fill="none" stroke="currentColor" stroke-width="2"/>` +
    `<path d="M12,13.5 V9 M9.5,2.5 h5 M12,2.5 V6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

  /* ===== Étapes complètes (progression stricte, voir lab-engine.js) =====
     1 : les quatre niveaux placés ; 2 : les trois postes ;
     3 : toutes les réponses de la conclusion. */
  const predDone = () => Object.values(state.pred).every(Boolean);
  const s1Done = () => Object.values(state.s1.notes).every(v => v != null);
  const s2Done = () => state.s2.levels.every(v => v != null) && state.s2.mass.start != null && state.s2.mass.end != null;
  const testDone = key => !!state.s3.tests[key].over;
  const s3Done = () => state.s3.rise != null && Object.values(state.s3.parts).every(v => v != null) && REQUIRED.every(testDone);
  const stationDone = i => [s1Done, s2Done, s3Done][i]();
  const benchDone = () => s1Done() && s2Done() && s3Done();

  function stepComplete(n) {
    if (n === 1) return predDone();
    if (n === 2) return benchDone();
    return conclusionsComplete();
  }

  function lockReason(n) {
    if (n === 1) return LABELS.lockHypothesis;
    if (n === 2) return state.started ? LABELS.lockRun([0, 1, 2].filter(i => !stationDone(i)).length) : LABELS.lockNotStarted;
    return lab.L.missingConclusions;
  }

  const chipHTML = (attrs, label, on) => `<button type="button" class="lab-choice os-chip ${on ? 'is-selected' : ''}" ${attrs} aria-pressed="${on}">${label}</button>`;

  function selectHTML(attrs, value, options, labelOf, aria, missing) {
    return `<select class="lab-select os-select ${value ? 'is-filled' : ''} ${missing && !value ? 'lab-is-missing' : ''}" ${attrs} aria-label="${escapeHtml(aria)}">` +
      `<option value="" disabled ${value ? '' : 'selected'}>${LABELS.choose}</option>` +
      options.map(x => `<option value="${x}" ${value === x ? 'selected' : ''}>${escapeHtml(labelOf(x))}</option>`).join('') + `</select>`;
  }

  /* Saisie d'un nombre : la valeur compte dès qu'elle est lisible (à chaque
     frappe), sans attendre que l'élève quitte la case ; ce qui en dépend se
     déverrouille tout de suite. Mise en forme et refus en quittant la case.
     parse rend le nombre, null (case vide) ou NaN (illisible). */
  function bindField(input, parse, format, store, after) {
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      const v = parse(input.value);
      store(Number.isNaN(v) ? null : v);
      after(false);
    });
    input.addEventListener('change', () => {
      const v = parse(input.value);
      if (Number.isNaN(v)) {
        input.classList.add('is-invalid');
        setCaption(LABELS.capBadNumber, true);
        return;
      }
      if (v != null) input.value = format(v);
      after(true);
    });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
  }

  // Nombre entier (mL, mm, cm) ; masse au dixième, virgule ou point.
  function parseWhole(raw) {
    const s = raw.trim();
    if (s === '') return null;
    return /^\d{1,3}$/.test(s) ? Number(s) : NaN;
  }

  function parseMass(raw) {
    const s = raw.trim().replace(',', '.');
    if (s === '') return null;
    const v = /^\d{1,3}(\.\d*)?$/.test(s) ? Number(s) : NaN;
    return v > 0 && v < 1000 ? round1(v) : NaN;
  }

  /* ===== Étape 1 : hypothèses =====
     À gauche, la question et un fait (ce que la mer a déjà fait à
     Ostende) ; à droite, les quatre niveaux à placer. Les dessins montrent
     le départ, jamais l'arrivée (la tempête : celle d'aujourd'hui). */
  const PRED_KEYS = ['a', 'b', 'flask', 'storm'];
  function predArt(k) {
    if (k === 'flask') return `<svg class="os-flask-svg" viewBox="0 0 100 275" aria-hidden="true" focusable="false">${flaskInner(run.h0, state.pred.flask)}</svg>`;
    if (k === 'storm') return stormPredSVG(state.pred.storm);
    return glassSVG({ glass: k, level: run.level, ice: true, size: 1, move: state.pred[k] });
  }

  // Le scénario tiré : dit au Check et dans le rapport, jamais avant.
  const scenarioText = () => LABELS.scenarios[run.scenario](num(scen().warming));

  function renderPredict() {
    const show = lab.state.showMissing;
    const preds = PRED_KEYS.map(k => `<div class="os-pred"><div class="os-pred-art" data-pred-art="${k}">${predArt(k)}</div>` +
      `<span class="os-pred-name"><span>${gloss(LABELS.predNames[k])}</span></span>` +
      `<span class="os-moves">${MOVES.map(m => `<button type="button" class="lab-choice os-move ${state.pred[k] === m ? 'is-selected' : ''}" data-pred="${k}" data-move="${m}" aria-pressed="${state.pred[k] === m}" aria-label="${escapeHtml(LABELS.moves[m])}" title="${escapeHtml(LABELS.moves[m])}">${moveIcon(m)}</button>`).join('')}</span></div>`).join('');

    lab.body.innerHTML = `<div class="os-predict">` +
      `<div class="os-predict-left">` +
        `<div class="os-question-card"><p class="os-kicker">${LABELS.yourQuestion}</p>` +
          `<p class="os-big-q">${gloss(LABELS.bigQuestion)}</p><p class="os-intro">${gloss(LABELS.intro)}</p></div>` +
        `<div class="os-facts-card"><p class="os-kicker">${LABELS.factsTitle}</p><p class="os-fact">${gloss(LABELS.factPast)}</p></div>` +
      `</div>` +
      `<div class="os-hyp-card"><p class="os-kicker">${LABELS.hypothesisTitle}</p>` +
        `<div class="os-hyp-part ${show && !predDone() ? 'lab-is-missing' : ''}"><p class="os-hyp-q">${gloss(LABELS.hypLevels)}</p>` +
          `<div class="os-preds">${preds}</div></div>` +
        `<label class="os-because"><span>${LABELS.because}</span>` +
        `<input type="text" class="lab-input os-because-input" maxlength="160" placeholder="${escapeHtml(LABELS.becausePlaceholder)}" value="${escapeHtml(state.because)}" autocomplete="off"></label>` +
      `</div></div>`;

    $$('[data-pred]').forEach(btn => btn.addEventListener('click', () => {
      state.pred[btn.dataset.pred] = btn.dataset.move;
      if (lab.state.showMissing && predDone()) lab.state.showMissing = false;
      renderPredict();
      lab.renderStepper();
    }));
    const because = $('.os-because-input');
    because.addEventListener('input', e => { state.because = e.target.value; });
    // Hypothèses figées dès le premier geste d'un poste : on les relit, on ne les change plus.
    if (state.started) {
      $$('[data-pred]').forEach(btn => lab.setLock(btn, LABELS.lockHypothesisFixed, { icon: false }));
      because.readOnly = true;
      lab.setLock(because, LABELS.lockHypothesisFixed);
    }

    lab.setFooter(lab.footerInfo('') + `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-next>${LABELS.toBench} →</button></div>`);
    $('[data-next]').addEventListener('click', () => lab.goToStep(2));
    updatePredictFooter();
  }

  let predReady = null;

  function updatePredictFooter() {
    const ready = predDone();
    const warn = lab.state.showMissing && !ready;
    const info = $('.lab-footer .lab-footer-info');
    if (info && !info.hasAttribute('data-lab-frozen')) {
      info.textContent = warn ? lab.L.missingHypotheses : ready ? LABELS.hypothesisReady : LABELS.hypothesisPending;
      info.classList.toggle('is-warning', warn);
    }
    lab.setLock($('[data-next]'), ready ? null : LABELS.lockHypothesis, { missing: true, key: 'next' });
    if (ready !== predReady) { predReady = ready; lab.renderStepper(); }
  }

  /* ===== Étape 2 : les trois postes =====
     Un onglet par poste (ils ne font que montrer : data-lab-look). Chaque
     poste a sa scène à gauche et son carnet à droite. Toutes les cases du
     carnet existent dès le départ ; une case ne s'écrit que lorsque ce
     qu'elle demande se lit à l'écran, sinon elle est verrouillée et dit
     quoi faire (FIELDS : open, why). */
  let stepperDone = null;
  let fields = [];

  function fieldsOf(tab) {
    const { s1, s2, s3 } = state;
    const whole = { parse: parseWhole, format: String };
    if (tab === 0) {
      return ['a0', 'b0', 'a1', 'b1'].map(k => {
        const start = k[1] === '0';
        return Object.assign({
          id: k, aria: LABELS.s1.aria[k],
          get: () => s1.notes[k], set: v => { s1.notes[k] = v; },
          open: () => (start ? s1.iceA && s1.iceB && !s1.melted : s1.melted),
          why: () => (start ? (s1.melted ? LABELS.s1.lockStartFixed : LABELS.s1.lockStart) : LABELS.s1.lockEnd)
        }, whole);
      });
    }
    if (tab === 1) {
      const masses = ['start', 'end'].map(k => ({
        id: `mass-${k}`, aria: LABELS.s2.massAria[k], parse: parseMass, format: num,
        get: () => s2.mass[k], set: v => { s2.mass[k] = v; },
        open: () => (k === 'start' ? s2.pos === 'balance' && !s2.back : s2.back),
        why: () => (k === 'start' ? LABELS.s2.lockMassFixed : LABELS.s2.lockMassEnd)
      }));
      const levels = [0, 1, 2, 3].map(i => Object.assign({
        id: `level${i}`, aria: LABELS.s2.levelAria,
        get: () => s2.levels[i], set: v => { s2.levels[i] = v; },
        open: () => s2.pos === 'bath' && s2.step === i,
        why: () => (i < s2.step || s2.back ? LABELS.s2.lockLevelPast : LABELS.s2.lockLevel)
      }, whole));
      return masses.concat(levels);
    }
    const rise = Object.assign({
      id: 'rise', aria: LABELS.s3.riseAria,
      get: () => s3.rise, set: v => { s3.rise = v; },
      open: () => s3.year === 1,
      why: () => LABELS.s3.lockRise
    }, whole);
    const parts = ['land', 'water'].map(k => Object.assign({
      id: `part-${k}`, aria: LABELS.s3.partNames[k],
      get: () => s3.parts[k], set: v => { s3.parts[k] = v; },
      open: () => s3.year === 1,
      why: () => LABELS.s3.lockParts
    }, whole));
    return [rise].concat(parts);
  }

  function fieldHTML(id) {
    const f = fields.find(x => x.id === id);
    const v = f.get();
    return `<input type="text" inputmode="decimal" class="os-cell-input" data-field="${id}" value="${v == null ? '' : f.format(v)}" maxlength="6" autocomplete="off" spellcheck="false" aria-label="${escapeHtml(f.aria)}">`;
  }

  function renderExperiment(caption) {
    // Bouton suivant touché trop tôt : on montre le premier poste incomplet.
    if (lab.state.showMissing && stationDone(state.tab)) {
      const todo = [0, 1, 2].find(i => !stationDone(i));
      if (todo != null) state.tab = todo;
    }
    const tab = state.tab;
    fields = fieldsOf(tab);
    const tabs = LABELS.stations.map((name, i) => `<button type="button" class="os-tab ${tab === i ? 'is-selected' : ''} ${stationDone(i) ? 'is-done' : ''}" data-tab="${i}" data-lab-look aria-pressed="${tab === i}">` +
      `<span class="os-tab-num">${i + 1}</span><span>${name}</span><span class="os-tab-mark" aria-hidden="true">✓</span></button>`).join('');
    lab.body.innerHTML = `<div class="os-run"><div class="os-tabs">${tabs}</div>` +
      `<div class="os-station os-station-${tab + 1}">${[station1HTML, station2HTML, station3HTML][tab]()}</div></div>`;

    $$('[data-tab]').forEach(btn => btn.addEventListener('click', () => {
      state.tab = Number(btn.dataset.tab);
      lab.state.showMissing = false;
      renderExperiment();
    }));
    fields.forEach(f => {
      const input = $(`[data-field="${f.id}"]`);
      if (input) bindField(input, f.parse, f.format, f.set, () => refresh());
    });
    [bindStation1, bindStation2, bindStation3][tab]();
    renderRunFooter();
    updateLocks();
    updateMarks();
    setCaption(caption || defaultCaption());
  }

  // Pendant une animation, le poste ne répond pas.
  function busy() {
    $('.os-run').classList.add('is-busy');
    $$('.lab-footer button').forEach(el => { el.disabled = true; });
  }

  function begin() {
    if (state.started) return;
    state.started = true;
    lab.renderStepper();
  }

  function setCaption(text, warn) {
    const c = $('[data-caption]');
    if (!c) return;
    c.innerHTML = `<span>${gloss(text)}</span>`;
    c.classList.toggle('is-warning', !!warn);
  }

  /* Après une saisie, mise à jour sur place (verrous, repères,
     pied) sans reconstruire le poste : la saisie compte souvent quand
     l'élève touche déjà autre chose, et ce geste ne doit pas être coupé. */
  function refresh() {
    if (lab.state.showMissing && stationDone(state.tab)) lab.state.showMissing = false;
    updateLocks();
    updateMarks();
    setCaption(defaultCaption());
    updateRunFooter();
  }

  /* Cases à remplir maintenant : en couleur (is-todo), pour suivre l'ordre
     des gestes ; en rouge si le bouton suivant a été touché trop tôt. */
  function updateMarks() {
    const show = lab.state.showMissing;
    const mark = (el, todo) => {
      if (!el) return;
      el.classList.toggle('is-todo', todo && !lab.isFrozen());
      el.classList.toggle('lab-is-missing', show && todo);
    };
    fields.forEach(f => mark($(`[data-field="${f.id}"]`), f.open() && f.get() == null));
    if (state.tab !== 2) return;
    CONFIGS.forEach(key => mark($(`[data-over="${key}"]`), testOpen(key) && !state.s3.tests[key].over));
  }

  const testOpen = key => state.s3.storm && currentKey() === key;

  /* Tous les verrous du poste affiché, selon l'état (à rappeler après
     chaque changement) : chaque geste attend le précédent, et dit lequel. */
  function updateLocks() {
    const { s1, s2, s3 } = state;
    $$('[data-tab]').forEach(btn => {
      const i = Number(btn.dataset.tab);
      btn.classList.toggle('is-done', stationDone(i));
      if (i === 2) lab.setLock(btn, s1Done() && s2Done() ? null : LABELS.lockStation3, { icon: false });
    });
    fields.forEach(f => {
      const input = $(`[data-field="${f.id}"]`);
      if (!input) return;
      const open = f.open();
      input.readOnly = !open;
      lab.setLock(input, open ? null : f.why());
    });
    if (state.tab === 0) {
      const noted = s1.notes.a0 != null && s1.notes.b0 != null;
      lab.setLock($('[data-melt]'), !(s1.iceA && s1.iceB) ? LABELS.s1.lockMeltIce : noted ? null : LABELS.s1.lockMeltNotes);
    } else if (state.tab === 1) {
      const last = s2.step === 3 && s2.levels[3] != null;
      lab.setLock($('[data-flask]'), s2.back ? LABELS.s2.lockFlaskDone
        : s2.pos === 'balance' ? (s2.mass.start == null ? LABELS.s2.lockFlaskMass : null)
          : last ? null : LABELS.s2.lockFlaskBath, { icon: false });
      lab.setLock($('[data-heat]'), s2.pos !== 'bath' ? LABELS.s2.lockHeatBath
        : s2.step >= 3 ? LABELS.s2.lockHeatDone
          : s2.levels[s2.step] == null ? LABELS.s2.lockHeatNote : null);
    } else {
      // 2100 attend la tempête de 2025, notée.
      $$('[data-year]').forEach(btn => {
        const i = Number(btn.dataset.year);
        lab.setLock(btn, i === 0 || s3.reached >= 1 || testDone('2025-00') ? null : LABELS.s3.lockYear2100, { icon: false });
      });
      const works = s3.year === 0 ? LABELS.s3.lockWorksYear : testDone('2100-00') ? null : LABELS.s3.lockWorksFirst;
      // Pâlies sans cadenas : la barre de commandes reste sur une ligne.
      lab.setLock($('[data-work="sand"]'), works, { icon: false });
      lab.setLock($('[data-work="wall"]'), works, { icon: false });
      // En 2100, la tempête attend la hausse et ses deux parts, notées.
      const noted = s3.rise != null && Object.values(s3.parts).every(v => v != null);
      lab.setLock($('[data-storm]'), s3.storm || s3.year === 0 || noted ? null : LABELS.s3.lockStormNote);
      CONFIGS.forEach(key => lab.setLock($(`[data-over="${key}"]`), testOpen(key) ? null : LABELS.s3.lockTest));
    }
  }

  /* ----- Poste 1 : les deux verres ----- */
  function station1HTML() {
    const s = state.s1;
    const levelA = s.iceA ? run.level : run.level - run.cubes * CUBE;   // les glaçons posés font monter l'eau
    const glass = g => `<div class="os-glass" data-glass="${g}"><div class="os-glass-art" data-glass-art="${g}">` +
      glassSVG({ glass: g, level: g === 'a' ? levelA : glassLevel('b', s.melted), ice: g === 'a' ? s.iceA : s.iceB, size: s.melted ? 0 : 1 }) +
      `</div><span class="os-glass-name">${LABELS.s1.glassNames[g]}</span></div>`;
    const cell = id => `<td>${fieldHTML(id)}</td>`;
    return `<section class="os-bench">` +
      `<p class="lab-caption" data-caption aria-live="polite"></p>` +
      `<div class="os-stage1">${glass('a')}${glass('b')}` +
        `<div class="os-side">` +
          (s.iceA && s.iceB ? '' : `<button type="button" class="os-tool" data-ice>${iceIcon(run.cubes)}<span class="os-tool-name">${LABELS.s1.ice}</span></button>`) +
          (s.melted
            ? `<div class="os-action is-final"><span class="os-action-text"><strong>${LABELS.s1.melted}</strong><small>${LABELS.s1.meltedSub}</small></span></div>`
            : `<button type="button" class="os-action" data-melt>${CLOCK_ICON}<span class="os-action-text"><strong>${LABELS.s1.melt}</strong><small>${LABELS.s1.meltSub}</small></span></button>`) +
        `</div></div></section>` +
      `<section class="os-notes"><h3 class="lab-panel-title">${LABELS.notesTitle}</h3>` +
        `<table class="os-table"><thead><tr><th></th><th scope="col">${LABELS.s1.startHead}</th><th scope="col">${LABELS.s1.endHead}</th></tr></thead><tbody>` +
        `<tr><th scope="row">${LABELS.s1.glassNames.a}</th>${cell('a0')}${cell('a1')}</tr>` +
        `<tr><th scope="row">${LABELS.s1.glassNames.b}</th>${cell('b0')}${cell('b1')}</tr></tbody></table>` +
        `<p class="os-notes-hint">${gloss(LABELS.s1.hint)}</p></section>`;
  }

  function bindStation1() {
    const s = state.s1;
    const ice = $('[data-ice]');
    const glasses = $$('[data-glass]');
    if (ice) {
      lab.makeDraggable(ice, {
        hold: true,
        ghost: () => `<div class="os-ghost">${iceIcon(run.cubes)}</div>`,
        targets: () => glasses.filter(g => !(g.dataset.glass === 'a' ? s.iceA : s.iceB)),
        onDrop: target => {
          lab.release();
          s[target.dataset.glass === 'a' ? 'iceA' : 'iceB'] = true;
          begin();
          renderExperiment();
        },
        onHold: on => setCaption(on ? LABELS.s1.capHoldIce : defaultCaption())
      });
    }
    // Un verre touché sans glaçons en main (sinon le moteur les y a posés).
    glasses.forEach(g => g.addEventListener('click', () => {
      if (!(s.iceA && s.iceB)) setCaption(LABELS.s1.capTakeIce, true);
    }));
    const melt = $('[data-melt]');
    if (melt) melt.addEventListener('click', meltIce);
  }

  function drawMelt(p) {
    const a = $('[data-glass-art="a"]');
    const b = $('[data-glass-art="b"]');
    if (a) a.innerHTML = glassSVG({ glass: 'a', level: run.level, ice: true, size: 1 - p });
    if (b) b.innerHTML = glassSVG({ glass: 'b', level: run.level + run.cubes * CUBE * p, ice: true, size: 1 - p });
  }

  /* La glace fond (une heure en quelques secondes). Fondue tout de suite
     dans l'état : si l'animation est interrompue, il reste juste. */
  function meltIce() {
    state.s1.melted = true;
    renderExperiment(LABELS.s1.capMelting);
    busy();
    drawMelt(0);
    const token = lab.newScene();
    lab.tween(token, 2600, (k, raw) => drawMelt(raw), ease.linear).then(ok => { if (ok) renderExperiment(); });
  }

  /* ----- Poste 2 : l'eau de mer tiédie ----- */
  const tubeAt = x => {
    const i = Math.min(2, Math.floor(x));
    return run.h0 + TUBE_STEPS[i] + (TUBE_STEPS[i + 1] - TUBE_STEPS[i]) * (x - i);
  };

  function station2HTML() {
    const s = state.s2;
    const mm = tubeLevel(s.step);
    const rows = [0, 1, 2, 3].map(i => `<tr class="${i === s.step && s.pos === 'bath' ? 'is-now' : ''}"><th scope="row">${i <= s.step ? seaTemp(i) : ''}</th><td>${fieldHTML(`level${i}`)}</td></tr>`).join('');
    const mass = k => `<div class="os-mass"><span class="os-mass-label">${LABELS.s2.massNames[k]}</span>` +
      `<span class="os-mass-field">${fieldHTML(`mass-${k}`)}<span>${LABELS.units.g}</span></span></div>`;
    return `<section class="os-bench">` +
      `<p class="lab-caption" data-caption aria-live="polite"></p>` +
      `<div class="os-row2">` +
        `<div class="os-stage2">` +
          `<div class="os-stage2-back" data-bench2>${svg(440, 366, bench2Back(s.pos === 'balance' ? run.mass : 0, false))}</div>` +
          `<button type="button" class="os-flask is-at-${s.pos}" data-flask aria-label="${escapeHtml(LABELS.s2.flask)}">${svg(100, 275, flaskInner(mm), '', ' data-flask-art')}</button>` +
          `<div class="os-stage2-front">${svg(440, 366, BENCH2_FRONT)}</div>` +
          `<span class="os-spot-name os-spot-balance">${LABELS.s2.balance}</span><span class="os-spot-name os-spot-bath">${LABELS.s2.bath}</span>` +
          `<div class="os-thermo"><span class="os-lcd-box"><span data-temp>${seaTemp(s.step)}</span><small>${LABELS.units.c}</small></span>` +
            `<span class="os-tool-name">${LABELS.s2.thermo}</span></div>` +
          `<button type="button" class="os-action os-heat" data-heat><span class="os-action-text"><strong>${LABELS.s2.heat}</strong><small>${LABELS.s2.heatSub}</small></span></button>` +
        `</div>` +
        `<figure class="os-zoom"><figcaption>${LABELS.s2.zoomTitle}</figcaption><div data-zoom>${tubeZoomSVG(mm)}</div></figure>` +
      `</div></section>` +
      `<section class="os-notes"><h3 class="lab-panel-title">${LABELS.notesTitle}</h3>` +
        // Dans l'ordre des gestes : peser, mesurer, repeser.
        mass('start') +
        `<table class="os-table"><thead><tr><th scope="col">${LABELS.s2.tempHead}</th><th scope="col">${LABELS.s2.levelHead}</th></tr></thead><tbody>${rows}</tbody></table>` +
        mass('end') +
        `<p class="os-notes-hint">${gloss(LABELS.s2.hint)}</p></section>`;
  }

  function bindStation2() {
    const s = state.s2;
    // Le flacon va de la balance au bain, puis revient à la fin (verrous : updateLocks).
    $('[data-flask]').addEventListener('click', () => {
      if (s.back) return;
      if (s.pos === 'balance') s.pos = 'bath';
      else { s.pos = 'balance'; s.back = true; }
      begin();
      renderExperiment();
      if (s.back) showMass();
    });
    $('[data-heat]').addEventListener('click', heat);
  }

  // L'affichage de la balance défile jusqu'à la masse.
  function showMass() {
    const show = v => { const el = $('[data-mass-display]'); if (el) el.textContent = massText(v); };
    const token = lab.newScene();
    lab.tween(token, 600, k => show(run.mass * k), ease.out).then(ok => { if (ok) show(run.mass); });
  }

  // x : nombre de paliers de chauffage, de 0 à 3 (fractionnaire pendant l'animation).
  function drawHeat(x, heating) {
    const temp = $('[data-temp]');
    if (temp) temp.textContent = Math.round(run.t0 + 5 * x);
    const art = $('[data-flask-art]');
    if (art) art.innerHTML = flaskInner(tubeAt(x));
    const zoom = $('[data-zoom]');
    if (zoom) zoom.innerHTML = tubeZoomSVG(tubeAt(x));
    const back = $('[data-bench2]');
    if (back && heating != null) back.innerHTML = svg(440, 366, bench2Back(0, heating));
  }

  // Un palier de 5 °C (compté tout de suite dans l'état).
  function heat() {
    const s = state.s2;
    if (s.pos !== 'bath' || s.step >= 3) return;
    const from = s.step;
    s.step = from + 1;
    lab.state.showMissing = false;
    renderExperiment(LABELS.s2.capHeating);
    busy();
    drawHeat(from, true);
    const token = lab.newScene();
    lab.tween(token, 1800, (k, raw) => drawHeat(from + raw), ease.linear).then(ok => {
      if (!ok) return;
      renderExperiment();
      const input = $(`[data-field="level${s.step}"]`);
      if (input) input.focus({ preventScroll: true });
    });
  }

  /* ----- Poste 3 : le modèle de la côte -----
     Deux dates : 2025, puis 2100 (la mer monte sous les yeux de l'élève,
     avec la mire du port et les colonnes « d'où vient la hausse »). */
  const riseNow = () => (state.s3.year ? finalRise() : 0);

  function station3HTML() {
    const s = state.s3;
    const key = currentKey();
    const years = YEARS.map((y, i) => `<li><button type="button" class="os-year ${i === s.year ? 'is-selected' : ''}" data-year="${i}" data-lab-look aria-pressed="${i === s.year}">${y}</button></li>`).join('');
    const work = k => `<button type="button" class="os-work lab-gloss-btn ${s[k] ? 'is-selected' : ''}" data-work="${k}" aria-pressed="${s[k]}">${LABELS.s3.works[k]}</button>`;
    const names = PARTS.map(k => `<span>${gloss(LABELS.s3.partNames[k])}</span>`).join('');
    const row = (label, id) => `<tr><th scope="row">${gloss(label)}</th><td>${fieldHTML(id)}</td></tr>`;
    const testRows = CONFIGS.map(k => `<tr class="${k === key && s.storm ? 'is-now' : ''}"><th scope="row">${LABELS.s3.tests[k]}</th>` +
      `<td>${selectHTML(`data-over="${k}"`, s.tests[k].over, ['yes', 'no'], x => LABELS.s3.overWords[x], LABELS.s3.overAria)}</td></tr>`).join('');
    return `<section class="os-coast">` +
      `<div class="os-controls"><ol class="os-years">${years}</ol>` +
        `<span class="os-works">${work('sand')}${work('wall')}</span>` +
        `<button type="button" class="os-action os-storm ${s.storm ? 'is-on' : ''}" data-storm><span class="os-action-text"><strong>${s.storm ? LABELS.s3.calm : LABELS.s3.storm}</strong><small>${s.storm ? LABELS.s3.calmSub : LABELS.s3.stormSub}</small></span></button></div>` +
      `<p class="lab-caption" data-caption aria-live="polite"></p>` +
      `<div class="os-scene">` +
        `<div class="os-coast-wrap" data-coast>${coastSVG({ rise: riseNow(), storm: s.storm ? 1 : 0, sand: s.sand, wall: s.wall })}</div>` +
        `<figure class="os-inset os-inset-gauge"><figcaption><span>${gloss(LABELS.s3.gaugeTitle)}</span></figcaption><div data-gauge>${gaugeSVG(riseNow())}</div></figure>` +
      `</div>` +
      `<figure class="os-inset os-inset-parts"><figcaption>${gloss(LABELS.s3.partsTitle)}</figcaption>` +
        `<div class="os-parts-body"><div data-parts>${partsSVG(riseNow())}</div><div class="os-part-names">${names}</div></div></figure>` +
      `</section>` +
      `<section class="os-notes os-notes3"><h3 class="lab-panel-title">${LABELS.notesTitle}</h3>` +
        `<table class="os-table"><thead><tr><th scope="col">${LABELS.s3.in2100Head}</th><th scope="col">${LABELS.units.cm}</th></tr></thead><tbody>` +
          row(LABELS.s3.riseName, 'rise') + row(LABELS.s3.partNames.land, 'part-land') + row(LABELS.s3.partNames.water, 'part-water') +
        `</tbody></table>` +
        `<table class="os-table os-table-tests"><thead><tr><th scope="col">${LABELS.s3.testHead}</th><th scope="col">${LABELS.s3.overHead}</th></tr></thead><tbody>${testRows}</tbody></table>` +
        `<p class="os-notes-hint">${gloss(LABELS.s3.hint)}</p>` +
      `</section>`;
  }

  function drawCoast(rise, storm) {
    const s = state.s3;
    const coast = $('[data-coast]');
    if (coast) coast.innerHTML = coastSVG({ rise, storm, sand: s.sand, wall: s.wall });
  }

  // La mire du port et les colonnes suivent la mer.
  function drawRise(rise) {
    const gauge = $('[data-gauge]');
    if (gauge) gauge.innerHTML = gaugeSVG(rise);
    const parts = $('[data-parts]');
    if (parts) parts.innerHTML = partsSVG(rise);
  }

  function bindStation3() {
    const s = state.s3;
    // Les dates : la mer monte (ou redescend) sous les yeux de l'élève.
    $$('[data-year]').forEach(btn => btn.addEventListener('click', () => {
      const i = Number(btn.dataset.year);
      if (i === s.year) return;
      const from = riseNow();
      s.year = i;
      s.storm = false;
      if (i === 0) { s.sand = false; s.wall = false; }
      if (i > s.reached) { s.reached = i; begin(); }
      lab.state.showMissing = false;
      renderExperiment();
      const to = riseNow();
      busy();
      drawCoast(from, 0);
      drawRise(from);
      const token = lab.newScene();
      lab.tween(token, 1800, k => {
        const r = from + (to - from) * k;
        drawCoast(r, 0);
        drawRise(r);
      }).then(ok => {
        if (!ok) return;
        renderExperiment();
        const input = $('[data-field="rise"]');
        if (i === 1 && input && s.rise == null) input.focus({ preventScroll: true });
      });
    }));
    $$('[data-work]').forEach(btn => btn.addEventListener('click', () => {
      s[btn.dataset.work] = !s[btn.dataset.work];
      s.storm = false;
      renderExperiment();
    }));
    $$('[data-over]').forEach(sel => sel.addEventListener('change', () => {
      s.tests[sel.dataset.over].over = sel.value || null;
      sel.classList.toggle('is-filled', !!sel.value);
      refresh();
    }));
    $('[data-storm]').addEventListener('click', () => {
      if (s.storm) { s.storm = false; renderExperiment(); return; }
      // La tempête est lancée (et comptée) tout de suite ; la mer monte ensuite à l'écran.
      s.storm = true;
      s.ran[currentKey()] = true;
      begin();
      lab.state.showMissing = false;
      renderExperiment(LABELS.s3.capStorming);
      busy();
      drawCoast(riseNow(), 0);
      const token = lab.newScene();
      lab.tween(token, 1700, k => drawCoast(riseNow(), k)).then(ok => { if (ok) renderExperiment(); });
    });
  }

  function defaultCaption() {
    const { s1, s2, s3 } = state;
    if (state.tab === 0) {
      if (!(s1.iceA && s1.iceB)) return LABELS.s1.capIce;
      if (s1.notes.a0 == null || s1.notes.b0 == null) return s1.melted ? LABELS.s1.capEnd : LABELS.s1.capStart;
      if (!s1.melted) return LABELS.s1.capMelt;
      return s1Done() ? LABELS.capStationDone : LABELS.s1.capEnd;
    }
    if (state.tab === 1) {
      if (s2.back) return s2.mass.end == null ? LABELS.s2.capMassEnd : LABELS.capStationDone;
      if (s2.pos === 'balance') return s2.mass.start == null ? LABELS.s2.capMass : LABELS.s2.capToBath;
      if (s2.levels[s2.step] == null) return LABELS.s2.capLevel;
      return s2.step < 3 ? LABELS.s2.capHeat : LABELS.s2.capBack;
    }
    if (s3.storm) return testDone(currentKey()) ? LABELS.s3.capCalm : LABELS.s3.capTest;
    if (s3.year === 0) return testDone('2025-00') ? LABELS.s3.capGo2100 : LABELS.s3.capStormToday;
    if (s3.rise == null) return LABELS.s3.capRise;
    if (Object.values(s3.parts).some(v => v == null)) return LABELS.s3.capParts;
    if (!testDone('2100-00')) return LABELS.s3.capStorm2100;
    if (!testDone('2025-00')) return LABELS.s3.capBackToday;
    return LABELS.s3.capWorks;
  }

  /* Pied de page : le bouton mène au poste suivant pas encore fini, puis à
     Conclude. Il reste secondaire tant que le poste affiché (ou, pour
     Conclude, l'expérience) n'est pas fini ; touché trop tôt, il dit ce qui
     manque. */
  function nextStation() {
    const todo = [0, 1, 2].filter(i => i !== state.tab && !stationDone(i));
    const after = todo.find(i => i > state.tab);
    return after != null ? after : todo.length ? todo[0] : null;
  }

  function renderRunFooter() {
    lab.setFooter(lab.footerInfo('') + `<div class="lab-footer-actions">` +
      `<button type="button" class="lab-btn lab-btn-ghost" data-conclude></button></div>`);
    $('[data-conclude]').addEventListener('click', () => {
      const next = nextStation();
      if (next == null) { lab.goToStep(3); return; }
      state.tab = next;
      lab.state.showMissing = false;
      renderExperiment();
    });
    updateRunFooter();
  }

  function updateRunFooter() {
    const done = benchDone();
    const missing = lab.state.showMissing && !done;
    const info = $('.lab-footer .lab-footer-info');
    if (info && !info.hasAttribute('data-lab-frozen')) {
      info.textContent = missing ? LABELS.missingRun : LABELS.runInfo([0, 1, 2].filter(stationDone).length);
      info.classList.toggle('is-warning', missing);
    }
    const btn = $('[data-conclude]');
    if (btn) {
      const next = nextStation();
      const ready = next == null ? done : stationDone(state.tab);
      btn.textContent = `${next == null ? LABELS.toConclude : LABELS.toStation[next]} →`;
      btn.classList.toggle('lab-btn-primary', ready);
      btn.classList.toggle('lab-btn-ghost', !ready);
      lab.setLock(btn, ready ? null : next == null ? lockReason(2) : LABELS.lockStationHere, { missing: true, key: 'conclude' });
    }
    // La barre d'étapes ne change qu'à la fin de l'expérience (Conclude s'ouvre).
    if (done !== stepperDone) { stepperDone = done; lab.renderStepper(); }
  }

  /* ===== Étape 3 : conclusion =====
     À gauche, ce que l'élève a noté aux trois postes ; à droite, les
     réponses aux deux temps de la question (pourquoi la mer monte, ce que
     cela change à Ostende), puis le jugement des hypothèses. */
  const VERDICTS = ['vA', 'vB', 'vFlask', 'vStorm'];
  // Le niveau prédit que juge chaque verdict.
  const VERDICT_PRED = { vA: 'a', vB: 'b', vFlask: 'flask', vStorm: 'storm' };
  const CHANGES = ['up', 'same', 'down'];

  function conclusionParts() {
    const c = state.concl;
    return {
      ice: !!(c.glass && c.source && c.biggest),
      water: !!(c.volume && c.mass && c.particles),
      coast: !!(c.rise != null && c.over && c.work),
      verdict: VERDICTS.every(k => c[k])
    };
  }

  function conclusionsComplete() {
    return Object.values(conclusionParts()).every(Boolean);
  }

  const noted = (v, unit, format) => (v == null ? DASH : `${(format || String)(v)} ${unit}`);

  function recapHTML() {
    const { s1, s2, s3 } = state;
    const U = LABELS.units;
    const tests = CONFIGS.filter(k => s3.tests[k].over)
      .map(k => `<li>${LABELS.recap.test(LABELS.s3.tests[k], LABELS.s3.overWords[s3.tests[k].over])}</li>`).join('');
    return `<div class="os-recap-block"><p class="os-recap-title">${LABELS.stations[0]}</p>` +
        ['a', 'b'].map(g => `<p>${LABELS.recap.glass(LABELS.s1.glassNames[g], noted(s1.notes[`${g}0`], U.ml), noted(s1.notes[`${g}1`], U.ml))}</p>`).join('') + `</div>` +
      `<div class="os-recap-block"><p class="os-recap-title">${LABELS.stations[1]}</p>` +
        `<p>${LABELS.recap.flask(seaTemp(0), seaTemp(3), noted(s2.levels[0], U.mm), noted(s2.levels[3], U.mm))}</p>` +
        `<p>${LABELS.recap.mass(noted(s2.mass.start, U.g, num), noted(s2.mass.end, U.g, num))}</p></div>` +
      `<div class="os-recap-block"><p class="os-recap-title">${LABELS.stations[2]}</p>` +
        `<p>${LABELS.recap.rise(noted(s3.rise, U.cm), noted(s3.parts.land, U.cm), noted(s3.parts.water, U.cm))}</p>` +
        `<ul class="os-recap-tests">${tests}</ul></div>`;
  }

  function renderConclude() {
    const c = state.concl;
    const show = lab.state.showMissing;
    const parts = conclusionParts();
    const miss = k => (show && !parts[k] ? 'lab-is-missing' : '');
    const W = LABELS.concl;
    const pick = (key, options, words, aria) => selectHTML(`data-c="${key}"`, c[key], options, x => words[x], aria, show);
    const riseInput = `<input type="text" inputmode="numeric" class="lab-input os-concl-input ${show && c.rise == null ? 'lab-is-missing' : ''}" data-cr value="${c.rise == null ? '' : c.rise}" maxlength="3" autocomplete="off" spellcheck="false" aria-label="${escapeHtml(LABELS.s3.riseAria)}">`;
    const verdict = key => `<div class="os-verdict"><span class="os-verdict-text">${LABELS.verdictNames[key]}</span>` +
      ['confirmed', 'rejected'].map(x => chipHTML(`data-v="${key}" data-val="${x}"`, LABELS[x], c[key] === x)).join('') + `</div>`;

    lab.body.innerHTML = `<div class="os-conclude">` +
      `<section class="os-recap"><h3 class="lab-panel-title">${LABELS.resultsTitle}</h3>${recapHTML()}</section>` +
      `<section class="os-form">` +
        `<div class="os-q ${miss('ice')}"><p class="os-q-title">${gloss(LABELS.whyTitle)} · ${LABELS.stations[0]}</p>` +
          `<p class="os-line">${W.glass(pick('glass', ['a', 'b'], W.glassWords, W.glassAria))} ${W.source(pick('source', ['sea', 'land', 'both'], W.sourceWords, W.sourceAria))}</p>` +
          `<p class="os-line">${W.biggest(pick('biggest', PARTS, W.biggestWords, W.biggestAria))}</p></div>` +
        `<div class="os-q ${miss('water')}"><p class="os-q-title">${gloss(LABELS.whyTitle)} · ${LABELS.stations[1]}</p>` +
          `<p class="os-line">${W.water(pick('volume', CHANGES, W.changeWords, W.volumeAria), pick('mass', CHANGES, W.changeWords, W.massAria))} ${W.particles(pick('particles', ['space', 'bigger', 'more'], W.particleWords, W.particlesAria))}</p></div>` +
        `<div class="os-q ${miss('coast')}"><p class="os-q-title">${gloss(LABELS.whatTitle)}</p>` +
          `<p class="os-line">${W.rise(riseInput)} ${W.over(pick('over', ['over', 'under'], W.overWords, W.overAria))}</p>` +
          `<p class="os-line">${W.work(pick('work', WORKS, W.workWords, W.workAria))}</p></div>` +
        `<div class="os-q ${miss('verdict')}"><p class="os-q-title">${LABELS.hypothesisTitle}</p>` +
          `<div class="os-verdicts">${VERDICTS.map(verdict).join('')}</div></div>` +
      `</section></div>`;

    const after = () => {
      if (lab.state.showMissing && conclusionsComplete()) lab.state.showMissing = false;
      renderConclude();
      lab.save();
    };
    $$('select[data-c]').forEach(sel => sel.addEventListener('change', () => { c[sel.dataset.c] = sel.value || null; after(); }));
    $$('[data-v]').forEach(btn => btn.addEventListener('click', () => { c[btn.dataset.v] = btn.dataset.val; after(); }));
    // La hausse s'écrit sans redessiner l'étape : le geste suivant n'est pas coupé.
    const input = $('[data-cr]');
    bindField(input, parseWhole, String, v => { c.rise = v; }, () => {
      if (c.rise != null) input.classList.remove('lab-is-missing');
      updateConcludeFooter();
    });

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
     Mesures : chaque valeur notée, comparée à ce que montrait l'écran (un
     essai de protection facultatif ne compte que s'il a été noté).
     Ostende en 2100 : la hausse, la tempête, et le moindre ouvrage qui
     suffit dans le scénario tiré — encore faut-il l'avoir essayé.
     Jugement : chaque hypothèse comparée à ce que l'élève a lui-même noté. */
  const sign = (end, start) => (end > start ? 'up' : end < start ? 'down' : 'same');

  // Ce que montrent les notes de l'élève (à défaut, ce que montrait
  // l'écran). La tempête de 2100 monte toujours plus haut qu'aujourd'hui.
  function observed() {
    const n = state.s1.notes;
    const l = state.s2.levels;
    return {
      a: n.a0 != null && n.a1 != null ? sign(n.a1, n.a0) : 'same',
      b: n.b0 != null && n.b1 != null ? sign(n.b1, n.b0) : 'up',
      flask: l[0] != null && l[3] != null ? sign(l[3], l[0]) : 'up',
      storm: 'up'
    };
  }

  function evaluate() {
    const { s1, s2, s3, concl: c } = state;
    const U = LABELS.units;
    const miss = {};
    let total = 0;
    const check = (id, what, value, real, tol, unit, format) => {
      total++;
      if (value != null && Math.abs(value - real) <= tol + 1e-9) return;
      miss[id] = CHECK.noteMiss(what, value == null ? null : format(value), format(real), unit);
    };
    ['a0', 'b0', 'a1', 'b1'].forEach(k => check(k, LABELS.s1.aria[k], s1.notes[k], glassLevel(k[0], k[1] === '1'), TOL.ml, U.ml, String));
    ['start', 'end'].forEach(k => check(`mass-${k}`, LABELS.s2.massNames[k], s2.mass[k], run.mass, TOL.mass, U.g, num));
    [0, 1, 2, 3].forEach(i => check(`level${i}`, LABELS.s2.levelAt(seaTemp(i)), s2.levels[i], tubeLevel(i), TOL.mm, U.mm, String));
    check('rise', LABELS.s3.riseAt(YEARS[1]), s3.rise, finalRise(), TOL.rise, U.cm, String);
    ['land', 'water'].forEach(k => check(`part-${k}`, plain(LABELS.s3.partNames[k]), s3.parts[k], scen()[k], TOL.rise, U.cm, String));
    CONFIGS.forEach(key => {
      const t = s3.tests[key];
      if (!REQUIRED.includes(key) && !t.over) return;
      total++;
      const real = isOver(key) ? 'yes' : 'no';
      if (t.over !== real) miss[`over-${key}`] = CHECK.overMiss(LABELS.s3.tests[key], t.over ? LABELS.s3.overWords[t.over] : null, LABELS.s3.overWords[real]);
    });
    const wrong = Object.keys(miss).length;

    const least = leastWork();
    const riseOk = c.rise != null && Math.abs(c.rise - finalRise()) <= TOL.rise;
    const overOk = c.over === (isOver('2100-00') ? 'over' : 'under');
    const workOk = c.work === least;
    const tested = !!(c.work && s3.ran[WORK_KEYS[c.work]]);
    // Dans les quatre scénarios, la glace terrestre fait la plus grande part.
    const biggestOk = c.biggest === 'land';

    const obs = observed();
    const should = {};
    VERDICTS.forEach(k => { should[k] = state.pred[VERDICT_PRED[k]] === obs[VERDICT_PRED[k]] ? 'confirmed' : 'rejected'; });

    return {
      miss, total, good: total - wrong, least, riseOk, overOk, workOk, tested, obs, should, biggestOk,
      glassOk: c.glass === 'b', sourceOk: c.source === 'land',
      volumeOk: c.volume === 'up', massOk: c.mass === 'same', particlesOk: c.particles === 'space',
      measure: wrong === 0,
      ice: c.glass === 'b' && c.source === 'land' && biggestOk,
      water: c.volume === 'up' && c.mass === 'same' && c.particles === 'space',
      coast: riseOk && overOk && workOk && tested,
      verdict: VERDICTS.every(k => c[k] === should[k])
    };
  }

  // Les bonnes réponses, écrites avec les phrases de la conclusion.
  const right = {
    ice: () => `${LABELS.concl.glass(LABELS.concl.glassWords.b)} ${LABELS.concl.source(LABELS.concl.sourceWords.land)} ${LABELS.concl.biggest(LABELS.concl.biggestWords.land)}`,
    water: () => `${LABELS.concl.water(LABELS.concl.changeWords.up, LABELS.concl.changeWords.same)} ${LABELS.concl.particles(LABELS.concl.particleWords.space)}`,
    rise: () => LABELS.concl.rise(finalRise()),
    over: () => LABELS.concl.over(LABELS.concl.overWords[isOver('2100-00') ? 'over' : 'under']),
    work: () => LABELS.concl.work(LABELS.concl.workWords[leastWork()])
  };
  const testLine = key => CHECK.testLine(LABELS.s3.tests[key], LABELS.s3.overWords[isOver(key) ? 'yes' : 'no']);
  const predWord = k => (state.pred[k] ? LABELS.moves[state.pred[k]] : DASH);

  function criterionDetail(key, ev) {
    const c = state.concl;
    const head = ok => (ok ? `<p class="os-ok">${CHECK.answerOk}</p>` : `<p class="os-ko">${CHECK.answerWrong}</p>`);
    if (key === 'measure') {
      if (!state.started) return `<p>${CHECK.noExperiment}</p>`;
      const list = Object.values(ev.miss);
      return `<p>${CHECK.measureScore(ev.good, ev.total)}</p>` +
        (list.length
          ? `<ul class="os-misslist">${list.slice(0, 6).map(t => `<li>${t}</li>`).join('')}${list.length > 6 ? `<li>${CHECK.more(list.length - 6)}</li>` : ''}</ul>`
          : `<p class="os-ok">${CHECK.measureAllGood}</p>`);
    }
    if (key === 'ice') {
      return head(ev.ice) + `<p><strong>${gloss(right.ice())}</strong></p><p>${gloss(EXPLAIN.ice)}</p>` +
        `<div class="os-particles">${particlesSVG()}<div class="os-particle-names"><span>${LABELS.particleNames.ice}</span><span>${LABELS.particleNames.water}</span></div></div>` +
        `<p class="os-muted">${gloss(EXPLAIN.float)}</p>`;
    }
    if (key === 'water') {
      return head(ev.water) + `<p><strong>${gloss(right.water())}</strong></p><p>${gloss(EXPLAIN.water)}</p>`;
    }
    if (key === 'coast') {
      return head(ev.coast) +
        `<p><strong>${gloss(right.rise())} ${gloss(right.over())} ${gloss(right.work())}</strong></p>` +
        (ev.workOk && !ev.tested ? `<p class="os-ko">${CHECK.notTested}</p>` : '') +
        `<ul class="os-plainlist">${CONFIGS.map(k => `<li>${testLine(k)}</li>`).join('')}</ul>` +
        `<p>${gloss(scenarioText())} ${gloss(EXPLAIN.coast(scen().land, scen().water))}</p>` +
        `<p>${gloss(EXPLAIN.emissions)}</p><p class="os-muted">${gloss(EXPLAIN.model)}</p>`;
    }
    const lines = VERDICTS.map(k => {
      const ok = c[k] === ev.should[k];
      const p = VERDICT_PRED[k];
      const text = CHECK.verdictLevel(LABELS.predNames[p], predWord(p), LABELS.moves[ev.obs[p]], ev.should[k]);
      return `<p class="${ok ? 'os-ok' : 'os-ko'}">${text} ${ok ? CHECK.judgedOk : CHECK.judgedWrong}</p>`;
    }).join('');
    return lines + (Object.values(ev.should).includes('rejected') ? `<p class="os-muted">${CHECK.rejectedNote}</p>` : '');
  }

  function renderCheck() {
    const ev = evaluate();
    const score = CRITERIA.filter(k => ev[k]).length;
    const rows = CRITERIA.map(k => `<button type="button" class="os-crit ${ev[k] ? 'is-ok' : 'is-ko'} ${state.selected === k ? 'is-selected' : ''}" data-crit="${k}">` +
      `<span class="os-crit-text"><strong>${LABELS.criteria[k]}</strong><small>${LABELS.criteriaSub[k]}</small></span>` +
      `<span class="os-crit-mark" aria-label="${ev[k] ? LABELS.markCorrect : LABELS.markIncorrect}">${ev[k] ? '✓' : '✗'}</span></button>`).join('');

    lab.body.innerHTML = `<div class="os-check">` +
      `<div class="os-check-left">` +
        `<div class="lab-score"><span class="lab-score-num">${score}<small> / ${CRITERIA.length}</small></span><span class="lab-score-label">${LABELS.scoreLabel}</span></div>` +
        `<div class="os-crit-list">${rows}</div>` +
        `<p class="os-reminder">${gloss(LABELS.bigQuestion)}</p>` +
      `</div>` +
      `<div class="os-check-detail" aria-live="polite"><h3>${LABELS.criteria[state.selected]}</h3>${criterionDetail(state.selected, ev)}</div>` +
      `</div>`;

    $$('[data-crit]').forEach(btn => btn.addEventListener('click', () => {
      state.selected = btn.dataset.crit;
      renderCheck();
    }));
    lab.fillSpace($('.os-check-detail'));
    lab.checkFooter();
  }

  /* ===== Rapport imprimable : contenu des 7 sections de la fiche outil FO3
     (en-tête, numérotation et mise en page : cadre commun) =====
     Les erreurs passent par mark() (lab-engine.js), dans l'ordre de
     lecture : valeurs mal notées (observations, case par case), réponses
     sur la glace et sur l'eau (interprétation), sur Ostende et jugements
     (conclusion). */
  function buildReport(mark) {
    const R = LABELS.report;
    const ev = evaluate();
    const { s1, s2, s3, concl: c } = state;
    const U = LABELS.units;
    const W = LABELS.concl;
    const word = (text, ok, note) => (ok ? text : mark(text, plain(note)));
    const cell = (id, v, format) => {
      const text = v == null ? DASH : (format || String)(v);
      return `<td>${ev.miss[id] ? mark(text, ev.miss[id], { box: true }) : text}</td>`;
    };

    const hyp = `<ul>${PRED_KEYS.map(k => `<li>${R.hypLevel(plain(LABELS.predNames[k]), predWord(k))}</li>`).join('')}</ul>` +
      (state.because.trim() ? `<p>${R.because}: ${escapeHtml(state.because.trim())}</p>` : '');

    const glasses = `<table class="os-report-table"><caption>${LABELS.stations[0]}</caption>` +
      `<tr><th></th><th>${LABELS.s1.startHead}</th><th>${LABELS.s1.endHead}</th></tr>` +
      ['a', 'b'].map(g => `<tr><th>${LABELS.s1.glassNames[g]}</th>${cell(`${g}0`, s1.notes[`${g}0`])}${cell(`${g}1`, s1.notes[`${g}1`])}</tr>`).join('') + `</table>`;
    const flask = `<table class="os-report-table"><caption>${LABELS.stations[1]}</caption>` +
      `<tr><th>${LABELS.s2.massNames.start} (${U.g})</th>${cell('mass-start', s2.mass.start, num)}<th>${LABELS.s2.massNames.end} (${U.g})</th>${cell('mass-end', s2.mass.end, num)}</tr>` +
      `<tr><th>${LABELS.s2.tempHead}</th>${[0, 1, 2, 3].map(i => `<td>${seaTemp(i)}</td>`).join('')}</tr>` +
      `<tr><th>${LABELS.s2.levelHead}</th>${[0, 1, 2, 3].map(i => cell(`level${i}`, s2.levels[i])).join('')}</tr></table>`;
    const coast = `<table class="os-report-table"><caption>${LABELS.stations[2]} · ${plain(scenarioText())}</caption>` +
      `<tr><th>${LABELS.s3.in2100Head}</th><th>${LABELS.s3.riseName}</th>${['land', 'water'].map(k => `<th>${plain(LABELS.s3.partNames[k])}</th>`).join('')}</tr>` +
      `<tr><th>${U.cm}</th>${cell('rise', s3.rise)}${cell('part-land', s3.parts.land)}${cell('part-water', s3.parts.water)}</tr></table>`;
    const shown = CONFIGS.filter(k => REQUIRED.includes(k) || s3.tests[k].over);
    const tests = `<table class="os-report-table"><tr><th>${LABELS.s3.testHead}</th><th>${LABELS.s3.overHead}</th></tr>` +
      shown.map(k => {
        const over = s3.tests[k].over ? LABELS.s3.overWords[s3.tests[k].over] : DASH;
        return `<tr><th>${LABELS.s3.tests[k]}</th><td>${ev.miss[`over-${k}`] ? mark(over, ev.miss[`over-${k}`], { box: true }) : over}</td></tr>`;
      }).join('') + `</table>`;
    const observations = `${glasses}${flask}${coast}${tests}`;

    const glassNote = `${CHECK.answerWrong} ${W.glass(W.glassWords.b)}`;
    const sourceNote = `${CHECK.answerWrong} ${W.source(W.sourceWords.land)} ${EXPLAIN.ice}`;
    const biggestNote = `${CHECK.answerWrong} ${W.biggest(W.biggestWords.land)}`;
    const waterNote = `${CHECK.answerWrong} ${W.water(W.changeWords.up, W.changeWords.same)}`;
    const particlesNote = `${CHECK.answerWrong} ${W.particles(W.particleWords.space)} ${EXPLAIN.water}`;
    const pickWord = (key, words, ok, note) => (c[key] ? word(words[c[key]], ok, note) : DASH);
    const interpretation = `<p>${W.glass(pickWord('glass', W.glassWords, ev.glassOk, glassNote))} ${W.source(pickWord('source', W.sourceWords, ev.sourceOk, sourceNote))} ` +
      `${W.biggest(pickWord('biggest', W.biggestWords, ev.biggestOk, biggestNote))}</p>` +
      `<p>${W.water(pickWord('volume', W.changeWords, ev.volumeOk, waterNote), pickWord('mass', W.changeWords, ev.massOk, waterNote))} ` +
      `${W.particles(pickWord('particles', W.particleWords, ev.particlesOk, particlesNote))}</p>`;

    const workNote = ev.workOk ? CHECK.notTested : `${CHECK.answerWrong} ${right.work()}`;
    const conclusion = `<p>${W.rise(c.rise == null ? DASH : word(String(c.rise), ev.riseOk, `${CHECK.answerWrong} ${right.rise()}`))} ` +
      `${W.over(pickWord('over', W.overWords, ev.overOk, `${CHECK.answerWrong} ${right.over()}`))}</p>` +
      `<p>${W.work(pickWord('work', W.workWords, ev.workOk && ev.tested, workNote))}</p>` +
      `<ul>${VERDICTS.map(k => {
        const p = VERDICT_PRED[k];
        const note = CHECK.verdictLevel(plain(LABELS.predNames[p]), predWord(p), LABELS.moves[ev.obs[p]], ev.should[k]);
        return `<li>${R.verdict(LABELS.verdictNames[k], c[k] ? word(LABELS[c[k]], c[k] === ev.should[k], note) : DASH)}</li>`;
      }).join('')}</ul>`;

    const correction = CRITERIA.map(k => `<tr><th>${LABELS.criteria[k]}</th><td class="${ev[k] ? 'ok' : 'ko'}">${ev[k] ? '✓' : '✗'}</td></tr>`).join('');

    return {
      title: R.title,
      sections: [
        `<p>${plain(LABELS.bigQuestion)}</p><p>${plain(LABELS.intro)}</p>`,
        hyp,
        `<ul>${R.materials.map(t => `<li>${t}</li>`).join('')}</ul>`,
        `<ol>${R.procedure.map(t => `<li>${t}</li>`).join('')}</ol>`,
        observations,
        interpretation,
        conclusion
      ],
      correction: `<p><strong>${R.score(CRITERIA.filter(k => ev[k]).length, CRITERIA.length)}</strong></p>` +
        `<table class="os-report-corr">${correction}</table>`
    };
  }

  const isMove = v => v === null || MOVES.includes(v);

  lab = LabEngine.create({
    id: 'ostend',
    // Page d'accueil (Mission, voir lab-engine.js) : toujours la même, rien du tirage.
    briefing: () => ({
      heading: LABELS.briefTitle,
      intro: gloss(LABELS.briefTask),
      questionTitle: LABELS.yourQuestion,
      questions: [LABELS.bigQuestion].map(gloss),
      steps: LABELS.briefSteps.map((text, i) => ({
        text: gloss(text),
        detail: gloss(LABELS.briefDetails[i]),
        pics: i === 1 ? [{ html: ICE_ICON, label: LABELS.s1.ice }] : null
      })),
      checks: Object.values(LABELS.criteria)
    }),
    title: LABELS.title,
    glossary: GLOSSARY,
    reset,
    stepComplete,
    lockReason,
    isStarted: () => Object.values(state.pred).some(Boolean) || state.started,
    render: { 1: renderPredict, 2: () => renderExperiment(), 3: renderConclude, 4: renderCheck },
    report: buildReport,
    version: 2,
    save: () => ({ run, state }),
    // Une animation interrompue est déjà comptée dans l'état : le poste se
    // redessine où il en était ; la mer du modèle revient au calme.
    load(data) {
      const r = data.run, s = data.state;
      if (!r || !SCENARIOS[r.scenario] || typeof r.margin !== 'number' || typeof r.cubes !== 'number' ||
        !s || !s.pred || !PRED_KEYS.every(k => isMove(s.pred[k])) || !s.concl ||
        !s.s1 || !s.s1.notes || !s.s2 || !Array.isArray(s.s2.levels) || !s.s2.mass ||
        !s.s3 || ![0, 1].includes(s.s3.year) || !s.s3.parts || !s.s3.tests || !CONFIGS.every(k => s.s3.tests[k]) || !s.s3.ran) throw new Error('labProgress');
      run = r;
      state = s;
      state.s3.storm = false;
      if (![0, 1, 2].includes(state.tab)) state.tab = 0;
      if (!CRITERIA.includes(state.selected)) state.selected = CRITERIA[0];
      stepperDone = null;
      conclReady = null;
      predReady = null;
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
          scenario: run.scenario,
          margin: run.margin,
          leastWork: ev.least,
          chosenWork: state.concl.work,
          measuresRight: ev.good,
          measures: ev.total
        }
      };
    }
  });
})();
