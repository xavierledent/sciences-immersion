/* ===== Labo virtuel « Energy detectives at home » (phys1) : une enquête dans une maison =====

   Simulation propre à ce labo, commune aux deux filières ; ses textes sont
   dans le dossier du chapitre, un fichier par langue (lab-home.en.js,
   lab-home.nl.js). Le cadre commun (modale, barre d'étapes, verrous,
   traduction, objet en main, rapport imprimé) est dans lab-engine.js.
   Ordre de chargement : moteur, textes, ce fichier.

   Le chapitre n'a pas de labo réel (confirmé par l'enseignant) : ce labo
   est une enquête dans une maison, partie du cours (partie 2 : stockage
   C / M / T, dissipation sous forme d'énergie thermique ; partie 3,
   missions 8 et 9 : la puissance en watts, en enrichissement). Trois
   petites questions, chacune avec son hypothèse et sa réponse.

   Le modèle : une maison de cinq pièces, huit objets et le compteur
   électrique (dans la cave). Quatre appareils électriques, chacun avec son
   interrupteur : le frigo (allumé au départ, comme dans toute maison) et
   trois tirés parmi cinq, puissances du cours (mission 9). Quatre objets
   qui gardent de l'énergie : le boiler (il chauffe l'eau la nuit, éteint
   maintenant, sans interrupteur), un objet qui stocke de l'énergie
   mécanique, deux qui stockent de l'énergie chimique. Un appareil allumé
   chauffe en 3 s (temps accéléré), éteint il refroidit de même ; éteint, il
   est à la température de la pièce. Le compteur : son index en kWh avance
   (une minute par seconde), son afficheur donne en W la puissance de toute
   la maison. Températures : ordres de grandeur réels, un peu tirés au
   sort ; la pièce est entre 19 et 21 °C.

   Tirés au sort : les trois appareils à côté du frigo, les objets de
   stockage, la place de chaque objet dans la maison, la température de la
   pièce et des objets, l'index de départ du compteur.

   Déroulé :
     1. Predict    — trois hypothèses : les objets qui stockent de
                     l'énergie ; tous, certains ou aucun des appareils
                     qui fonctionnent dissipent de l'énergie thermique ;
                     l'appareil qui transforme le plus d'énergie chaque
                     seconde
     2. Experiment — trois missions, dans l'ordre que l'élève veut :
                     étiqueter (C, M, T) les objets qui stockent de
                     l'énergie, d'après leur carte ; filmer les pièces à la caméra thermique ; lire
                     le compteur en allumant et éteignant les appareils.
                     Le carnet : la température et la puissance de chaque
                     appareil qui fonctionne
     3. Conclude   — question 1 (combien d'objets gardent de l'énergie,
                     les appareils en gardent-ils), question 2
                     (dissipation : qui, pourquoi, où va cette énergie),
                     question 3 (le plus puissant), jugement des trois
                     hypothèses
     4. Check      — 5 vérifications : carnet, stockage, dissipation,
                     puissance, hypothèses ; rapport (FO3) */

(function () {
  'use strict';

  const { escapeHtml, shuffle } = LabEngine.util;

  // Cadre commun, créé en fin de fichier (LabEngine.create).
  let lab;
  const $ = sel => lab.$(sel);
  const $$ = sel => lab.$$(sel);
  const gloss = text => lab.gloss(text);

  /* ===== Textes =====
     Dans le dossier du chapitre, un fichier par langue (lab-home.en.js,
     lab-home.nl.js), chargé avant celui-ci. */
  const {
    labels: LABELS, glossary: GLOSSARY, explanations: EXPLAIN, check: CHECK
  } = LabEngine.textFor('home');

  /* ===== Le modèle ===== */
  // Les appareils : puissance (W, cours, mission 9), température de leur
  // partie la plus chaude quand ils fonctionnent (°C), pièces possibles.
  const DEVICES = {
    fridge: { power: 200, temp: [36, 41], rooms: ['kitchen'] },
    led: { power: 10, temp: [42, 48], rooms: ['bedroom', 'living', 'bathroom'] },
    bulb: { power: 100, temp: [120, 135], rooms: ['bedroom', 'living'] },
    hairdryer: { power: 800, temp: [65, 75], rooms: ['bathroom'] },
    microwave: { power: 1200, temp: [33, 37], rooms: ['kitchen'] },
    dishwasher: { power: 2000, temp: [29, 32], rooms: ['kitchen'] }
  };
  // Les objets de stockage (ou non) : forme stockée (C, M, T), température
  // (null : celle de la pièce), pièces possibles.
  const STORES = {
    tank: { form: 'T', temp: [26, 29], rooms: ['cellar'] },
    battery: { form: 'C', rooms: ['living', 'bedroom'] },
    powerbank: { form: 'C', rooms: ['bedroom', 'living'] },
    wood: { form: 'C', rooms: ['living', 'cellar'] },
    fruit: { form: 'C', rooms: ['kitchen', 'living'] },
    slingshot: { form: 'M', rooms: ['bedroom'] },
    toycar: { form: 'M', rooms: ['bedroom', 'living'] }
  };
  const TAGS = ['C', 'M', 'T'];         // les étiquettes : seulement sur ce qui stocke
  const ALL = ['all', 'some', 'none'];
  const WHY = ['warmer', 'colder', 'same'];
  const FATE = ['wasted', 'destroyed', 'stored'];
  const STORE_WORDS = ['not', 'yes'];
  const COUNTS = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const HEAT_MS = 3000;   // un appareil chauffe (ou refroidit) en 3 s, temps accéléré
  const ACCEL = 60;       // l'index du compteur : une minute par seconde
  const TICK_MS = 200;

  /* La maison : 760 × 470 px, cinq pièces ; les places des objets (coin
     haut gauche des boutons de 80 × 78 px) et celle du compteur. */
  const HOUSE_W = 760, HOUSE_H = 470;
  const OBJ_W = 80, OBJ_H = 78;
  const ROOMS = {
    bedroom: { box: [20, 66, 370, 130], slots: [[36, 100], [136, 100], [236, 100]] },
    bathroom: { box: [390, 66, 350, 130], slots: [[440, 100], [560, 100]] },
    living: { box: [20, 206, 380, 140], slots: [[36, 244], [136, 244], [236, 244]] },
    kitchen: { box: [400, 206, 340, 140], slots: [[410, 244], [492, 244], [574, 244], [656, 244]] },
    cellar: { box: [20, 356, 720, 110], slots: [[36, 382], [136, 382], [236, 382]] }
  };
  const ROOM_KEYS = Object.keys(ROOMS);
  const METER_AT = [644, 382];

  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pickOne = arr => arr[Math.floor(Math.random() * arr.length)];

  function draw() {
    const devices = ['fridge'].concat(shuffle(Object.keys(DEVICES).filter(id => id !== 'fridge')).slice(0, 3));
    const chem = shuffle(['battery', 'powerbank', 'wood', 'fruit']).slice(0, 2);
    const stores = ['tank', pickOne(['slingshot', 'toycar'])].concat(chem);
    const room = rnd(19, 21);
    // Une place libre par objet, dans une de ses pièces (les plus contraints d'abord).
    const objects = devices.concat(stores);
    const roomsOf = id => (DEVICES[id] || STORES[id]).rooms;
    const free = {};
    ROOM_KEYS.forEach(r => { free[r] = shuffle(ROOMS[r].slots.map((s, i) => i)); });
    const place = {};
    objects.slice().sort((a, b) => roomsOf(a).length - roomsOf(b).length).forEach(id => {
      const r = shuffle(roomsOf(id)).find(k => free[k].length);
      place[id] = { room: r, slot: free[r].pop() };
    });
    const temps = {};
    objects.forEach(id => {
      const t = (DEVICES[id] || STORES[id]).temp;
      temps[id] = t ? rnd(t[0], t[1]) : (id === 'powerbank' ? room + 1 : room);
    });
    return { devices, stores, objects: shuffle(objects), place, temps, room };
  }

  let run;      // tirage : les objets, leur place, les températures
  let state;    // travail de l'élève

  function reset() {
    run = draw();
    const temp = {}, watt = {}, sw = {};
    run.devices.forEach(id => {
      temp[id] = null;
      watt[id] = null;
      sw[id] = { on: id === 'fridge', k: id === 'fridge' ? 1 : 0 };
    });
    state = {
      hyp: { stores: [], all: null, top: null },
      because: '',
      started: false,                      // premier geste dans la maison : hypothèses figées
      tags: {},                            // objet → C, M ou T (étiquette posée)
      sw,                                  // appareil → { on, k } (k : 0 froid → 1 chaud)
      kwh: rnd(2000, 8999) + Math.random(), // index du compteur
      measured: { temp: {}, watt: {} },    // appareil filmé ; interrupteur actionné, compteur ouvert
      shown: null,                         // le panneau : { kind: 'clue', id } | { kind: 'camera', room } | { kind: 'meter' }
      notes: { temp, watt },               // le carnet : les appareils
      concl: { n: null, store: null, all: null, why: null, fate: null, top: null, v: { q1: null, q2: null, q3: null } },
      selected: 'notes'
    };
    stepperDone = null;
  }

  /* --- Ce que disent les objets --- */
  const powerOf = id => (DEVICES[id] ? DEVICES[id].power : null);
  const formOf = id => (STORES[id] ? STORES[id].form : 'no');
  const topDevice = () => run.devices.reduce((a, b) => (powerOf(b) > powerOf(a) ? b : a));
  const objName = id => LABELS.objects[id].name;
  const objThe = id => LABELS.objects[id].the;
  const roomOf = id => run.place[id].room;
  // Ce que la caméra voit maintenant : un appareil éteint est à la température de la pièce.
  const tempNow = id => (DEVICES[id] ? Math.round(run.room + state.sw[id].k * (run.temps[id] - run.room)) : run.temps[id]);
  const housePower = () => run.devices.reduce((s, id) => s + (state.sw[id].on ? powerOf(id) : 0), 0);
  const tagsPlaced = () => run.objects.filter(id => state.tags[id]).length;
  const notesFilled = () => run.devices.reduce((n, id) => n + (state.notes.temp[id] != null ? 1 : 0) + (state.notes.watt[id] != null ? 1 : 0), 0);
  const NOTES_TOTAL = 8;
  const runDone = () => tagsPlaced() > 0 && notesFilled() === NOTES_TOTAL;
  const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));

  /* ===== Dessins ===== */
  const ICONS = {
    led: `<path d="M20,4 v6" stroke="#5d6773" stroke-width="2"/><path d="M12,10 h16 l-3,8 h-10 Z" fill="#c9d1da"/>` +
      `<circle cx="20" cy="25" r="8" fill="#fff6c9" stroke="#e0b93a" stroke-width="1.6"/><rect x="16.5" y="17" width="7" height="3" fill="#aab4be"/>` +
      `<path d="M8,30 L4,34 M32,30 L36,34 M20,36 v3" stroke="#f0c04a" stroke-width="1.8" stroke-linecap="round"/>`,
    bulb: `<path d="M6,36 h16" stroke="#5d6773" stroke-width="2.4" stroke-linecap="round"/><path d="M14,36 V22 L24,12" stroke="#5d6773" stroke-width="2.2" fill="none"/>` +
      `<path d="M21,9 L33,9 L30,16 L24,16 Z" fill="#7d8a97"/><circle cx="27" cy="21" r="6.5" fill="#ffe08a" stroke="#e0a73a" stroke-width="1.4"/>` +
      `<path d="M25,20 q2,-3 4,0" stroke="#d07a1a" stroke-width="1" fill="none"/>`,
    fridge: `<rect x="9" y="3" width="22" height="34" rx="2.5" fill="#eef2f6" stroke="#8d97a3" stroke-width="1.6"/><path d="M9,15 h22" stroke="#8d97a3" stroke-width="1.4"/>` +
      `<path d="M26,7 v5 M26,19 v8" stroke="#5d6773" stroke-width="2" stroke-linecap="round"/>`,
    hairdryer: `<path d="M6,10 h16 a8,8 0 0 1 0,16 h-16 Z" fill="#d06aa4"/><rect x="2" y="12" width="5" height="12" rx="1.5" fill="#a84f84"/>` +
      `<path d="M18,24 l3,13 h5 l-2,-13 Z" fill="#a84f84"/><path d="M33,14 q3,4 0,8 M36,12 q4,6 0,12" stroke="#e57373" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
    microwave: `<rect x="3" y="9" width="34" height="22" rx="2.5" fill="#dfe4ea" stroke="#7d8a97" stroke-width="1.6"/><rect x="6" y="12" width="21" height="16" rx="1.5" fill="#3d4a57"/>` +
      `<path d="M10,22 q3,-4 6,0 q3,4 6,0" stroke="#f0c04a" stroke-width="1.4" fill="none"/><circle cx="32" cy="16" r="1.8" fill="#7d8a97"/><rect x="30" y="21" width="4" height="6" rx="1" fill="#7d8a97"/>`,
    dishwasher: `<rect x="6" y="3" width="28" height="34" rx="2.5" fill="#eef2f6" stroke="#7d8a97" stroke-width="1.6"/><rect x="6" y="3" width="28" height="7" rx="2" fill="#c9d1da"/>` +
      `<circle cx="11" cy="6.5" r="1.4" fill="#5aa86a"/><path d="M13,16 h14 M13,22 h14" stroke="#aab4be" stroke-width="1.6" stroke-linecap="round"/>` +
      `<circle cx="17" cy="29" r="2" fill="#7fc6e8"/><circle cx="23" cy="31" r="1.6" fill="#7fc6e8"/>`,
    tank: `<rect x="10" y="3" width="20" height="34" rx="8" fill="#e8ecf0" stroke="#7d8a97" stroke-width="1.6"/><path d="M14,30 h12" stroke="#7d8a97" stroke-width="1.4"/>` +
      `<path d="M16,38 v-4 M24,38 v-4" stroke="#d64545" stroke-width="2.2"/><circle cx="20" cy="14" r="3.4" fill="#ffffff" stroke="#7d8a97"/><path d="M20,14 l2,-2" stroke="#d64545" stroke-width="1.2"/>`,
    battery: `<rect x="5" y="11" width="13" height="24" rx="2" fill="#3d4a57"/><rect x="5" y="11" width="13" height="8" rx="2" fill="#e0a73a"/><rect x="9" y="8" width="5" height="3" fill="#7d8a97"/>` +
      `<rect x="22" y="11" width="13" height="24" rx="2" fill="#3d4a57"/><rect x="22" y="11" width="13" height="8" rx="2" fill="#e0a73a"/><rect x="26" y="8" width="5" height="3" fill="#7d8a97"/>`,
    powerbank: `<rect x="8" y="5" width="24" height="31" rx="4" fill="#4a6fd9"/><rect x="12" y="9" width="16" height="6" rx="1.5" fill="#cfe0ff"/>` +
      `<rect x="13" y="10.5" width="10" height="3" fill="#5aa86a"/><rect x="16" y="33" width="8" height="3" rx="1" fill="#2f4ea8"/>`,
    wood: `<ellipse cx="11" cy="28" rx="6" ry="6" fill="#c08a5a" stroke="#8a5a30" stroke-width="1.4"/><ellipse cx="25" cy="28" rx="6" ry="6" fill="#c08a5a" stroke="#8a5a30" stroke-width="1.4"/>` +
      `<ellipse cx="18" cy="17" rx="6" ry="6" fill="#c08a5a" stroke="#8a5a30" stroke-width="1.4"/><circle cx="11" cy="28" r="2.4" fill="none" stroke="#8a5a30"/><circle cx="25" cy="28" r="2.4" fill="none" stroke="#8a5a30"/><circle cx="18" cy="17" r="2.4" fill="none" stroke="#8a5a30"/>`,
    fruit: `<path d="M4,24 h32 a16,10 0 0 1 -32,0 Z" fill="#d9b382"/><circle cx="14" cy="20" r="6" fill="#d64545"/><circle cx="26" cy="20" r="6" fill="#7cb342"/><circle cx="20" cy="14" r="6" fill="#e05050"/>` +
      `<path d="M20,8 v-3" stroke="#6e4a26" stroke-width="1.6"/>`,
    slingshot: `<path d="M20,37 V22 M20,22 L11,8 M20,22 L29,8" stroke="#8a5a30" stroke-width="3.4" stroke-linecap="round" fill="none"/>` +
      `<path d="M11,8 Q20,26 29,8" stroke="#d64545" stroke-width="1.8" fill="none"/><circle cx="20" cy="18" r="2.6" fill="#7d8a97"/>`,
    toycar: `<path d="M5,26 v-6 l6,-7 h14 l6,7 h4 v6 Z" fill="#e0a73a" stroke="#a87418" stroke-width="1.4" stroke-linejoin="round"/><rect x="13" y="15" width="6" height="5" fill="#cfe0ff"/><rect x="21" y="15" width="5" height="5" fill="#cfe0ff"/>` +
      `<circle cx="12" cy="28" r="4" fill="#3d4a57"/><circle cx="28" cy="28" r="4" fill="#3d4a57"/><path d="M20,13 v-6 M17,7 h6" stroke="#7d8a97" stroke-width="2" stroke-linecap="round"/>`
  };
  const icon = (id, cls) => `<svg class="hm-icon ${cls || ''}" viewBox="0 0 40 40" aria-hidden="true" focusable="false">${ICONS[id]}</svg>`;

  // La caméra thermique et le compteur électrique (boîtier, écran, bornes).
  const TOOL_ICONS = {
    camera: `<rect x="3" y="12" width="26" height="18" rx="3" fill="#3d4a57"/><rect x="7" y="8" width="9" height="5" rx="1.5" fill="#3d4a57"/>` +
      `<circle cx="16" cy="21" r="6" fill="#ff8a3d"/><circle cx="16" cy="21" r="3" fill="#ffd34d"/><rect x="29" y="16" width="8" height="10" rx="2" fill="#5d6773"/>`,
    meter: `<rect x="7" y="3" width="26" height="30" rx="3" fill="#e8ecf0" stroke="#5d6773" stroke-width="1.6"/><rect x="10" y="7" width="20" height="9" rx="1.5" fill="#203040"/>` +
      `<path d="M12.5,11.5 h3 M17.5,11.5 h3 M22.5,11.5 h3" stroke="#7cfc9a" stroke-width="2"/><circle cx="20" cy="24" r="2.6" fill="#e0a73a"/>` +
      `<path d="M13,37 v-4 M20,37 v-4 M27,37 v-4" stroke="#5d6773" stroke-width="2.2" stroke-linecap="round"/>`
  };
  const toolIcon = (t, cls) => `<svg class="hm-icon ${cls || ''}" viewBox="0 0 40 40" aria-hidden="true" focusable="false">${TOOL_ICONS[t]}</svg>`;

  // La maison, en coupe : toit, deux étages, la cave sous le sol.
  function houseSVG() {
    let out = `<rect x="0" y="0" width="${HOUSE_W}" height="${HOUSE_H}" fill="#eef6fb"/>` +
      `<rect x="0" y="351" width="${HOUSE_W}" height="${HOUSE_H - 351}" fill="#b89a7a"/>` +
      `<path d="M8,66 L380,8 L752,66 Z" fill="#b5473f"/>` +
      `<rect x="16" y="62" width="728" height="290" fill="#f7f1e8" stroke="#8d7a66" stroke-width="3"/>` +
      `<rect x="16" y="352" width="728" height="116" fill="#e6ddd2" stroke="#8d7a66" stroke-width="3"/>` +
      `<path d="M16,201 H744 M16,351 H744" stroke="#8d7a66" stroke-width="5"/><path d="M390,62 V201 M400,201 V351" stroke="#8d7a66" stroke-width="4"/>`;
    ROOM_KEYS.forEach(r => {
      const [x, y] = ROOMS[r].box;
      out += `<text x="${x + 8}" y="${y + 18}" class="hm-room">${escapeHtml(LABELS.rooms[r].name)}</text>`;
    });
    return `<svg class="hm-house" viewBox="0 0 ${HOUSE_W} ${HOUSE_H}" aria-hidden="true" focusable="false">${out}</svg>`;
  }

  /* --- La caméra thermique : fausses couleurs, du bleu (froid) au blanc
     (très chaud) --- */
  const HEAT = [[10, '#1a237e'], [20, '#1565c0'], [28, '#00acc1'], [36, '#43a047'], [45, '#fdd835'], [70, '#fb8c00'], [100, '#e53935'], [140, '#fff3e0']];
  function heatColor(t) {
    if (t <= HEAT[0][0]) return HEAT[0][1];
    for (let i = 1; i < HEAT.length; i++) {
      if (t <= HEAT[i][0]) {
        const [a, ca] = HEAT[i - 1], [b, cb] = HEAT[i];
        const k = (t - a) / (b - a);
        const pa = parseInt(ca.slice(1), 16), pb = parseInt(cb.slice(1), 16);
        const c = s => Math.round(((pa >> s) & 255) * (1 - k) + ((pb >> s) & 255) * k);
        return `#${((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1)}`;
      }
    }
    return HEAT[HEAT.length - 1][1];
  }

  // Une pièce entière vue par la caméra : chaque objet et sa température la plus haute.
  function thermalSVG(room) {
    const ids = run.objects.filter(id => roomOf(id) === room);
    const W = 400, H = 196, cy = 96;
    const step = W / ids.length;
    const scale = HEAT.map(([v, c]) => `<stop offset="${((v - 10) / 130).toFixed(3)}" stop-color="${c}"/>`).join('');
    let defs = `<linearGradient id="hm-scale">${scale}</linearGradient>`, body = '';
    ids.forEach((id, i) => {
      const t = tempNow(id), cx = step * (i + 0.5);
      defs += `<radialGradient id="hm-glow-${id}"><stop offset="0" stop-color="${heatColor(t)}"/>` +
        `<stop offset="0.55" stop-color="${heatColor((t + run.room) / 2)}"/><stop offset="1" stop-color="${heatColor(run.room)}"/></radialGradient>`;
      body += `<ellipse cx="${cx}" cy="${cy}" rx="${Math.min(70, step / 2 - 4)}" ry="50" fill="url(#hm-glow-${id})"/>` +
        `<g transform="translate(${cx - 28} ${cy - 28}) scale(1.4)" opacity="0.55" style="mix-blend-mode:luminosity">${ICONS[id]}</g>` +
        `<text x="${cx}" y="${cy - 40}" text-anchor="middle" class="hm-th-max">${t} °C</text>` +
        `<text x="${cx}" y="${cy + 58}" text-anchor="middle" class="hm-th-name">${escapeHtml(objName(id))}</text>`;
    });
    return `<svg class="lab-svg hm-thermal" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHtml(LABELS.cameraAria(LABELS.rooms[room].name))}">` +
      `<defs>${defs}</defs><rect x="0" y="0" width="${W}" height="${H}" rx="8" fill="${heatColor(run.room)}"/>${body}` +
      `<text x="12" y="20" class="hm-th-room">${escapeHtml(LABELS.roomTemp(run.room))}</text>` +
      `<rect x="14" y="166" width="372" height="8" rx="2" fill="url(#hm-scale)"/>` +
      [20, 60, 100, 140].map(v => `<text x="${(14 + (v - 10) / 130 * 372).toFixed(1)}" y="189" text-anchor="middle" class="hm-th-tick">${v} °C</text>`).join('') +
      `</svg>`;
  }

  // Le compteur et son afficheur : l'index (kWh) et la puissance de toute la maison (W).
  const kwhText = () => `${LABELS.num(state.kwh, 3)} kWh`;
  function meterHTML() {
    return `<div class="hm-meterwin">` +
      `<div class="hm-meterbox">${toolIcon('meter', 'is-huge')}<div><span class="hm-meter-label">${LABELS.meterIndex}</span>` +
        `<div class="hm-lcd is-index" data-kwh>${kwhText()}</div></div></div>` +
      `<div class="hm-displaybox"><span class="hm-meter-label">${LABELS.displayTitle}</span><div class="hm-lcd" data-watts>${housePower()} W</div></div>` +
      `<p class="hm-meter-text">${gloss(LABELS.meterText)}</p></div>`;
  }

  function updateMeter() {
    const k = $('[data-kwh]');
    if (k) k.textContent = kwhText();
    const w = $('[data-watts]');
    if (w) w.textContent = `${housePower()} W`;
  }

  /* ===== Étapes complètes (progression stricte, voir lab-engine.js) =====
     1 : les trois hypothèses ; 2 : au moins une étiquette et le carnet
     complet ; 3 : toutes les réponses. */
  const hypDone = () => !!(state.hyp.stores.length && state.hyp.all && state.hyp.top);

  function stepComplete(n) {
    if (n === 1) return hypDone();
    if (n === 2) return runDone();
    return conclusionsComplete();
  }

  function lockReason(n) {
    if (n === 1) return LABELS.lockHypothesis;
    if (n === 2) return LABELS.lockRun(tagsPlaced() === 0, NOTES_TOTAL - notesFilled());
    return lab.L.missingConclusions;
  }

  function questionsHTML() {
    return `<ol class="hm-questions">${[1, 2, 3].map(k => `<li>${gloss(LABELS.questions[k])}</li>`).join('')}</ol>`;
  }

  /* ===== Étape 1 : hypothèses ===== */
  function renderPredict() {
    const h = state.hyp;
    const show = lab.state.showMissing;
    const miss = ok => (show && !ok ? 'lab-is-missing' : '');
    const chip = (field, val, label, on, ic) => `<button type="button" class="lab-choice hm-chip ${on ? 'is-selected' : ''}" data-hyp="${field}" data-val="${val}" aria-pressed="${on}">${ic || ''}<span>${label}</span></button>`;

    lab.body.innerHTML = `<div class="hm-predict">` +
      `<div class="hm-question-card"><p class="hm-kicker">${LABELS.yourQuestions}</p>${questionsHTML()}` +
        `<p class="hm-intro">${toolIcon('camera')}${toolIcon('meter')}<span>${gloss(LABELS.intro)}</span></p></div>` +
      `<div class="hm-hyp-card"><p class="hm-kicker">${LABELS.hypothesisTitle}</p>` +
        `<div class="hm-hyp ${miss(h.stores.length)}"><span class="hm-num" aria-hidden="true">1</span><div>` +
          `<p class="hm-sentence">${gloss(LABELS.hyp1)} <span class="hm-hint">${LABELS.chooseSeveral}</span></p>` +
          `<div class="hm-chips">${run.objects.map(id => chip('stores', id, objName(id), h.stores.includes(id), icon(id))).join('')}</div></div></div>` +
        `<div class="hm-hyp ${miss(h.all)}"><span class="hm-num" aria-hidden="true">2</span><div>` +
          `<p class="hm-sentence">${gloss(LABELS.hyp2(h.all ? `<strong>${LABELS.allWords[h.all]}</strong>` : '……'))}</p>` +
          `<div class="hm-chips">${ALL.map(x => chip('all', x, LABELS.allWords[x], h.all === x)).join('')}</div></div></div>` +
        `<div class="hm-hyp ${miss(h.top)}"><span class="hm-num" aria-hidden="true">3</span><div>` +
          `<p class="hm-sentence">${gloss(LABELS.hyp3)}</p>` +
          `<div class="hm-chips">${run.devices.map(id => chip('top', id, objName(id), h.top === id, icon(id))).join('')}</div></div></div>` +
        `<label class="hm-because"><span>${LABELS.because}</span>` +
        `<input type="text" class="lab-input hm-because-input" maxlength="160" placeholder="${LABELS.becausePlaceholder}" value="${escapeHtml(state.because)}" autocomplete="off"></label>` +
      `</div></div>`;

    $$('[data-hyp]').forEach(btn => btn.addEventListener('click', () => {
      const f = btn.dataset.hyp, v = btn.dataset.val;
      if (f === 'stores') h.stores = h.stores.includes(v) ? h.stores.filter(x => x !== v) : run.objects.filter(x => h.stores.includes(x) || x === v);
      else h[f] = v;
      if (lab.state.showMissing && hypDone()) lab.state.showMissing = false;
      renderPredict();
      lab.renderStepper();
    }));
    const because = $('.hm-because-input');
    because.addEventListener('input', e => { state.because = e.target.value; });
    // Hypothèses figées dès le premier geste dans la maison.
    if (state.started) {
      $$('[data-hyp]').forEach(btn => lab.setLock(btn, LABELS.lockHypothesisFixed, { icon: false }));
      because.readOnly = true;
      lab.setLock(because, LABELS.lockHypothesisFixed);
    }

    const ready = hypDone();
    const info = lab.state.showMissing && !ready ? lab.footerInfo(LABELS.lockHypothesis, true)
      : lab.footerInfo(ready ? LABELS.hypothesisReady : LABELS.hypothesisPending);
    lab.setFooter(info + `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-next>${LABELS.toHouse} →</button></div>`);
    const next = $('[data-next]');
    next.addEventListener('click', () => lab.goToStep(2));
    lab.setLock(next, ready ? null : LABELS.lockHypothesis, { missing: true, key: 'next' });
  }

  /* ===== Étape 2 : l'enquête =====
     À gauche, la maison : ses huit objets, les interrupteurs des appareils,
     le compteur dans la cave ; au-dessus, les étiquettes (à poser sur un
     objet qui stocke de l'énergie ; la même encore une fois l'enlève) et la
     caméra (à poser sur une pièce). Toucher un objet sans
     outil montre sa carte d'indices, toucher le compteur ouvre sa fenêtre.
     À droite, ce panneau et le carnet. Trois missions, dans n'importe quel
     ordre. */
  let stepperDone = null;

  function renderExperiment() {
    lab.release();
    lab.body.innerHTML = `<div class="hm-run">` +
      `<section class="hm-main">` +
        `<div class="hm-tools"><span class="hm-tools-label">${LABELS.tagsTitle}</span>` +
          TAGS.map(f => `<button type="button" class="hm-tag" data-tag="${f}"><b>${LABELS.badges[f]}</b><span>${LABELS.tags[f]}</span></button>`).join('') +
          `<button type="button" class="hm-tool" data-tool="camera" data-lab-look>${toolIcon('camera')}<span>${LABELS.cameraName}</span></button></div>` +
        boardHTML() +
        `<p class="lab-caption hm-caption" data-caption aria-live="polite"></p>` +
      `</section>` +
      `<section class="hm-side"><div class="hm-screen" aria-live="polite">${screenHTML()}</div>${notebookHTML()}</section>` +
      `</div>`;
    bindTools();
    bindHouse();
    bindNotebook();
    setCaption(defaultCaption());
    renderRunFooter();
    startTicker(lab.newScene());
  }

  // Les pièces (cibles de la caméra) et leurs objets (cibles des étiquettes) ;
  // les interrupteurs à part, pour qu'un toucher ne pose rien.
  function boardHTML() {
    const s = state.shown;
    const box = (x, y) => `left:${x}px;top:${y}px;width:${OBJ_W}px;height:${OBJ_H}px`;
    const zones = ROOM_KEYS.map(r => {
      const [bx, by, bw, bh] = ROOMS[r].box;
      const objs = run.objects.filter(id => roomOf(id) === r).map(id => {
        const [x, y] = ROOMS[r].slots[run.place[id].slot];
        const tag = state.tags[id];
        const shown = s && s.kind === 'clue' && s.id === id;
        return `<button type="button" class="hm-obj ${shown ? 'is-shown' : ''}" data-obj="${id}" data-lab-look style="${box(x - bx, y - by)}">` +
          (tag ? `<span class="hm-badge">${LABELS.badges[tag]}</span>` : '') +
          `${icon(id, 'is-big')}<span class="hm-obj-name">${objName(id)}</span></button>`;
      }).join('');
      const meter = r === 'cellar' ? `<button type="button" class="hm-obj hm-meter-obj ${s && s.kind === 'meter' ? 'is-shown' : ''}" data-meter data-lab-look style="${box(METER_AT[0] - bx, METER_AT[1] - by)}">` +
        `${toolIcon('meter', 'is-big')}<span class="hm-obj-name">${LABELS.meterName}</span></button>` : '';
      const filmed = s && s.kind === 'camera' && s.room === r;
      return `<div class="hm-zone ${filmed ? 'is-filmed' : ''}" data-room="${r}" data-lab-look style="left:${bx}px;top:${by}px;width:${bw}px;height:${bh}px">${objs}${meter}</div>`;
    }).join('');
    const switches = run.devices.map(id => {
      const [x, y] = ROOMS[roomOf(id)].slots[run.place[id].slot];
      const on = state.sw[id].on;
      return `<button type="button" class="hm-switch ${on ? 'is-on' : ''}" data-sw="${id}" aria-pressed="${on}" aria-label="${escapeHtml(LABELS.switchAria(objName(id)))}" style="left:${x + OBJ_W - 40}px;top:${y + 2}px">${on ? LABELS.on : LABELS.off}</button>`;
    }).join('');
    return `<div class="hm-board" style="width:${HOUSE_W}px;height:${HOUSE_H}px">${houseSVG()}${zones}${switches}</div>`;
  }

  // Le panneau à droite : la carte d'indices, la vue de la caméra ou le compteur.
  function screenHTML() {
    const s = state.shown;
    if (!s) return `<p class="hm-screen-empty">${gloss(LABELS.screenEmpty)}</p>`;
    if (s.kind === 'meter') return `<p class="hm-screen-head">${toolIcon('meter')}<strong>${LABELS.meterName}</strong></p>${meterHTML()}`;
    if (s.kind === 'camera') {
      return `<p class="hm-screen-head">${toolIcon('camera')}<strong>${LABELS.rooms[s.room].name}</strong><span class="hm-screen-kind">${LABELS.cameraName}</span></p>` + thermalSVG(s.room);
    }
    return `<p class="hm-screen-head">${icon(s.id)}<strong>${objName(s.id)}</strong><span class="hm-screen-kind">${LABELS.clueTitle}</span></p>` +
      `<p class="hm-clue">${gloss(LABELS.objects[s.id].clue)}</p>`;
  }

  function bindTools() {
    $$('[data-tag]').forEach(el => {
      const f = el.dataset.tag;
      lab.makeDraggable(el, {
        hold: true,
        ghost: () => `<div class="hm-ghost"><span class="hm-badge is-big">${LABELS.badges[f]}</span></div>`,
        targets: () => $$('[data-obj]'),
        onHold: on => setCaption(on ? LABELS.captionHoldTag(LABELS.tags[f]) : defaultCaption()),
        onDrop: target => tagObject(target.dataset.obj, f)
      });
    });
    lab.makeDraggable($('[data-tool="camera"]'), {
      hold: true,
      ghost: () => `<div class="hm-ghost">${toolIcon('camera', 'is-big')}</div>`,
      targets: () => $$('[data-room]'),
      onHold: on => setCaption(on ? LABELS.captionHoldCamera : defaultCaption()),
      onDrop: target => film(target.dataset.room)
    });
  }

  function bindHouse() {
    $$('[data-obj]').forEach(el => el.addEventListener('click', () => {
      const id = el.dataset.obj;
      state.shown = { kind: 'clue', id };
      refreshSide();
      setCaption(LABELS.captionClue(objName(id)));
    }));
    $('[data-meter]').addEventListener('click', () => {
      state.shown = { kind: 'meter' };
      refreshSide();
      setCaption(LABELS.captionMeter);
    });
    $$('[data-sw]').forEach(btn => btn.addEventListener('click', () => toggle(btn)));
  }

  // Une étiquette posée : la carte de l'objet s'affiche, pour vérifier. La
  // même étiquette posée une deuxième fois l'enlève.
  function tagObject(id, form) {
    const off = state.tags[id] === form;
    if (off) delete state.tags[id]; else state.tags[id] = form;
    state.started = true;
    state.shown = { kind: 'clue', id };
    if (lab.state.showMissing && runDone()) lab.state.showMissing = false;
    renderExperiment();
    setCaption(off ? LABELS.captionUntagged(objName(id)) : LABELS.captionTagged(objName(id), LABELS.tags[form]));
    lab.save();
  }

  // Une pièce filmée : la case de température de ses appareils s'ouvre.
  function film(room) {
    if (!lab.isFrozen()) {
      run.devices.filter(id => roomOf(id) === room).forEach(id => { state.measured.temp[id] = true; });
      state.started = true;
    }
    state.shown = { kind: 'camera', room };
    renderExperiment();
    setCaption(LABELS.captionCamera(LABELS.rooms[room].the));
    lab.save();
  }

  // Un interrupteur : sans tout redessiner (l'outil en main reste en main).
  // Actionné pendant que le compteur est ouvert, il ouvre la case de puissance.
  function toggle(btn) {
    const id = btn.dataset.sw;
    const sw = state.sw[id];
    sw.on = !sw.on;
    state.started = true;
    btn.classList.toggle('is-on', sw.on);
    btn.setAttribute('aria-pressed', String(sw.on));
    btn.textContent = sw.on ? LABELS.on : LABELS.off;
    if (state.shown && state.shown.kind === 'meter') {
      state.measured.watt[id] = true;
      lab.setLock($(`[data-watt="${id}"]`), null);
      updateMeter();
    }
    lab.save();
  }

  /* Le temps qui passe, tant que l'enquête est affichée : les appareils
     chauffent ou refroidissent, l'index du compteur avance. Arrêté au
     changement de scène (autre étape, labo fermé) et dans le labo corrigé. */
  let ticker = 0;
  function startTicker(token) {
    clearInterval(ticker);
    let last = performance.now();
    ticker = setInterval(() => {
      if (!lab.isScene(token)) { clearInterval(ticker); return; }
      const now = performance.now();
      const dt = Math.min(1000, now - last);
      last = now;
      if (lab.isFrozen()) return;
      let moved = false;
      run.devices.forEach(id => {
        const sw = state.sw[id];
        const k = sw.on ? Math.min(1, sw.k + dt / HEAT_MS) : Math.max(0, sw.k - dt / HEAT_MS);
        if (k !== sw.k) { sw.k = k; moved = true; }
      });
      state.kwh += housePower() / 1000 * (dt / 3600e3) * ACCEL;
      const s = state.shown;
      if (s && s.kind === 'camera' && moved) {
        const screen = $('.hm-screen');
        if (screen) screen.innerHTML = screenHTML();
      }
      if (s && s.kind === 'meter') updateMeter();
    }, TICK_MS);
  }

  // Après une carte ou le compteur : le panneau et la marque de l'objet, sans tout redessiner.
  function refreshSide() {
    const screen = $('.hm-screen');
    if (screen) screen.innerHTML = screenHTML();
    const s = state.shown;
    $$('[data-obj]').forEach(b => b.classList.toggle('is-shown', !!s && s.kind === 'clue' && s.id === b.dataset.obj));
    $('[data-meter]').classList.toggle('is-shown', !!s && s.kind === 'meter');
    $$('[data-room]').forEach(z => z.classList.toggle('is-filmed', !!s && s.kind === 'camera' && s.room === z.dataset.room));
  }

  /* --- Le carnet : la température et la puissance de chaque appareil --- */
  function notebookHTML() {
    const show = lab.state.showMissing;
    const n = state.notes;
    const rows = run.devices.map(id => `<tr><th scope="row"><span class="hm-nb-obj">${icon(id)}<span>${objName(id)}</span></span></th>` +
      `<td class="${show && n.temp[id] == null ? 'lab-is-missing' : ''}"><input type="text" inputmode="numeric" class="hm-num-input" data-temp="${id}" value="${n.temp[id] == null ? '' : n.temp[id]}" maxlength="3" autocomplete="off" spellcheck="false" aria-label="${escapeHtml(LABELS.tempAria(objName(id)))}"></td>` +
      `<td class="${show && n.watt[id] == null ? 'lab-is-missing' : ''}"><input type="text" inputmode="numeric" class="hm-num-input" data-watt="${id}" value="${n.watt[id] == null ? '' : n.watt[id]}" maxlength="4" autocomplete="off" spellcheck="false" aria-label="${escapeHtml(LABELS.wattAria(objName(id)))}"></td></tr>`).join('');
    return `<div class="hm-notebook"><h3 class="lab-panel-title">${LABELS.notebookTitle}</h3>` +
      `<table class="hm-nb-table"><thead><tr><th scope="col"></th><th scope="col">${LABELS.tempHead}</th><th scope="col">${LABELS.wattHead}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function bindNotebook() {
    const n = state.notes;
    $$('[data-temp]').forEach(input => {
      const id = input.dataset.temp;
      lab.setLock(input, state.measured.temp[id] ? null : LABELS.lockCamera(LABELS.rooms[roomOf(id)].the));
      bindNumber(input, v => { n.temp[id] = v; }, 3);
    });
    $$('[data-watt]').forEach(input => {
      const id = input.dataset.watt;
      lab.setLock(input, state.measured.watt[id] ? null : LABELS.lockMeter(objThe(id)));
      bindNumber(input, v => { n.watt[id] = v; }, 4);
    });
  }

  function bindNumber(input, set, digits) {
    const re = new RegExp(`^\\d{1,${digits}}$`);
    const read = final => {
      const raw = input.value.trim();
      const v = re.test(raw) ? Number(raw) : null;
      set(v);
      if (v != null) input.closest('td').classList.remove('lab-is-missing');
      if (final) {
        if (v != null) input.value = String(v);
        input.classList.toggle('is-invalid', v == null && raw !== '');
      }
      afterNote();
    };
    input.addEventListener('input', () => { input.classList.remove('is-invalid'); read(false); });
    input.addEventListener('change', () => read(true));
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
  }

  function afterNote() {
    if (lab.state.showMissing && stepComplete(2)) lab.state.showMissing = false;
    updateRunFooter();
    lab.save();
  }

  function defaultCaption() {
    if (runDone()) return LABELS.captionDone;
    return state.started ? LABELS.captionGoOn : LABELS.captionStart;
  }

  function setCaption(text, warn) {
    const c = $('[data-caption]');
    if (!c) return;
    c.innerHTML = `<span>${gloss(text)}</span>`;
    c.classList.toggle('is-warning', !!warn);
  }

  function renderRunFooter() {
    lab.setFooter(lab.footerInfo('') + `<div class="lab-footer-actions">` +
      `<button type="button" class="lab-btn lab-btn-primary" data-next>${LABELS.toConclude} →</button></div>`);
    $('[data-next]').addEventListener('click', () => lab.goToStep(3));
    updateRunFooter();
  }

  function updateRunFooter() {
    const complete = stepComplete(2);
    const warn = lab.state.showMissing && !complete;
    const info = $('.lab-footer .lab-footer-info');
    if (info) {
      info.textContent = warn ? lockReason(2) : LABELS.runInfo(tagsPlaced(), notesFilled(), NOTES_TOTAL);
      info.classList.toggle('is-warning', warn);
    }
    const next = $('[data-next]');
    if (next) lab.setLock(next, complete ? null : lockReason(2), { missing: true, key: 'next' });
    if (complete !== stepperDone) { stepperDone = complete; lab.renderStepper(); }
  }

  /* ===== Étape 3 : conclusion =====
     À gauche, les étiquettes et le carnet ; à droite, les trois questions
     (listes dans les phrases), puis le jugement des trois hypothèses. */
  function conclusionParts() {
    const c = state.concl;
    return {
      q1: !!(c.n && c.store),
      q2: !!(c.all && c.why && c.fate),
      q3: !!c.top,
      verdict: ['q1', 'q2', 'q3'].every(k => c.v[k])
    };
  }

  function conclusionsComplete() {
    return Object.values(conclusionParts()).every(Boolean);
  }

  function selectHTML(field, value, options, labelOf, aria, missing) {
    return `<select class="lab-select hm-select ${value ? 'is-filled' : ''} ${missing && !value ? 'lab-is-missing' : ''}" data-c="${field}" aria-label="${escapeHtml(aria)}">` +
      `<option value="" disabled ${value ? '' : 'selected'}>${LABELS.choose}</option>` +
      options.map(x => `<option value="${x}" ${value === x ? 'selected' : ''}>${escapeHtml(labelOf(x))}</option>`).join('') + `</select>`;
  }

  const tempText = t => (t == null ? '—' : `${t} °C`);
  const wattText = w => (w == null ? '—' : `${w} W`);
  const tagText = id => (state.tags[id] ? LABELS.forms[state.tags[id]] : '—');

  function recapHTML() {
    const n = state.notes;
    return `<table class="lab-table hm-recap"><thead><tr><th scope="col"></th><th scope="col">${LABELS.storedHead}</th><th scope="col">${LABELS.tempShort}</th><th scope="col">${LABELS.wattHead}</th></tr></thead><tbody>` +
      run.objects.map(id => `<tr><th scope="row"><span class="hm-nb-obj">${icon(id)}<span>${objName(id)}</span></span></th><td>${tagText(id)}</td>` +
        (DEVICES[id] ? `<td>${tempText(n.temp[id])}</td><td>${wattText(n.watt[id])}</td>` : `<td class="hm-muted">—</td><td class="hm-muted">—</td>`) + `</tr>`).join('') +
      `</tbody></table><p class="hm-recap-room">${gloss(LABELS.roomTemp(run.room))}</p>`;
  }

  function renderConclude() {
    const c = state.concl;
    const parts = conclusionParts();
    const show = lab.state.showMissing;
    const miss = key => (show && !parts[key] ? 'lab-is-missing' : '');
    const verdict = k => `<div class="hm-verdict"><span class="hm-verdict-text">${LABELS.verdictRow(k)}</span>` +
      ['confirmed', 'rejected'].map(x => `<button type="button" class="lab-choice hm-chip is-small ${c.v[k] === x ? 'is-selected' : ''}" data-v="${k}" data-val="${x}" aria-pressed="${c.v[k] === x}">${LABELS[x]}</button>`).join('') + `</div>`;

    lab.body.innerHTML = `<div class="hm-conclude">` +
      `<section class="hm-results"><h3 class="lab-panel-title">${LABELS.resultsTitle}</h3>${recapHTML()}</section>` +
      `<section class="hm-form">` +
        `<div class="hm-q ${miss('q1')}"><p class="hm-q-title"><span class="hm-num" aria-hidden="true">1</span><span>${gloss(LABELS.questions[1])}</span></p>` +
          `<p class="hm-concl-line">${LABELS.concl1(
            selectHTML('n', c.n, COUNTS, x => x, LABELS.countAria, show),
            selectHTML('store', c.store, STORE_WORDS, x => LABELS.storeWords[x], LABELS.storeAria, show))}</p></div>` +
        `<div class="hm-q ${miss('q2')}"><p class="hm-q-title"><span class="hm-num" aria-hidden="true">2</span><span>${gloss(LABELS.questions[2])}</span></p>` +
          `<p class="hm-concl-line">${LABELS.concl2(
            selectHTML('all', c.all, ALL, x => LABELS.allWords[x], LABELS.questions[2], show),
            selectHTML('why', c.why, WHY, x => LABELS.why[x], LABELS.whyAria, show),
            selectHTML('fate', c.fate, FATE, x => LABELS.fate[x], LABELS.fateAria, show))}</p></div>` +
        `<div class="hm-q ${miss('q3')}"><p class="hm-q-title"><span class="hm-num" aria-hidden="true">3</span><span>${gloss(LABELS.questions[3])}</span></p>` +
          `<p class="hm-concl-line">${LABELS.concl3(selectHTML('top', c.top, run.devices, objName, LABELS.questions[3], show))}</p></div>` +
        `<div class="hm-q hm-verdicts ${miss('verdict')}">${['q1', 'q2', 'q3'].map(verdict).join('')}</div>` +
      `</section></div>`;

    $$('select[data-c]').forEach(sel => sel.addEventListener('change', () => {
      c[sel.dataset.c] = sel.value || null;
      afterConcl();
    }));
    $$('[data-v]').forEach(btn => btn.addEventListener('click', () => { c.v[btn.dataset.v] = btn.dataset.val; afterConcl(); }));

    lab.setFooter(`<button type="button" class="lab-btn lab-btn-ghost" data-back>← ${LABELS.backToLab}</button>` +
      lab.footerInfo('') +
      `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-check>${LABELS.checkConclusions}</button></div>`);
    $('[data-back]').addEventListener('click', () => lab.goToStep(2));
    $('[data-check]').addEventListener('click', () => lab.finish());
    const ready = conclusionsComplete();
    const info = $('.lab-footer .lab-footer-info');
    if (info && show && !ready) { info.textContent = lab.L.missingConclusions; info.classList.add('is-warning'); }
    lab.setLock($('[data-check]'), ready ? null : lab.L.missingConclusions, { missing: true, key: 'check' });
    lab.renderStepper();
  }

  function afterConcl() {
    if (lab.state.showMissing && conclusionsComplete()) lab.state.showMissing = false;
    renderConclude();
  }

  /* ===== Étape 4 : correction ===== */
  const CRITERIA = ['notes', 'storage', 'dissipation', 'power', 'verdicts'];
  // Ce que l'élève a trouvé, pour juger ses hypothèses : les objets étiquetés.
  const taggedStores = () => run.objects.filter(id => state.tags[id]);

  function evaluate() {
    const c = state.concl;
    const n = state.notes;
    const noteMiss = [];
    run.devices.forEach(id => {
      if (n.temp[id] == null || Math.abs(n.temp[id] - run.temps[id]) > 1) noteMiss.push({ id, k: 'temp' });
      if (n.watt[id] !== powerOf(id)) noteMiss.push({ id, k: 'watt' });
    });
    const tagMiss = run.objects.filter(id => (state.tags[id] || 'no') !== formOf(id));
    const q1Ok = Number(c.n) === run.stores.length && c.store === 'not';
    const q2Ok = c.all === 'all' && c.why === 'warmer' && c.fate === 'wasted';
    const q3Ok = c.top === topDevice();
    const should = {
      q1: sameSet(state.hyp.stores, taggedStores()) ? 'confirmed' : 'rejected',
      q2: state.hyp.all && state.hyp.all === c.all ? 'confirmed' : 'rejected',
      q3: state.hyp.top && state.hyp.top === c.top ? 'confirmed' : 'rejected'
    };
    const vMiss = ['q1', 'q2', 'q3'].filter(k => c.v[k] !== should[k]);
    return {
      noteMiss, tagMiss, q1Ok, q2Ok, q3Ok, should, vMiss,
      notesGood: NOTES_TOTAL - noteMiss.length,
      notes: noteMiss.length === 0,
      storage: tagMiss.length === 0 && q1Ok,
      dissipation: q2Ok,
      power: q3Ok,
      verdicts: vMiss.length === 0
    };
  }

  // Une puissance notée qui est celle de plusieurs appareils allumés ensemble : lesquels.
  function sumWith(id, value) {
    const others = run.devices.filter(x => x !== id);
    for (let mask = 1; mask < (1 << others.length); mask++) {
      const set = others.filter((x, i) => mask & (1 << i));
      if (set.reduce((s, x) => s + powerOf(x), powerOf(id)) === value) return set;
    }
    return null;
  }

  function noteMissText(m) {
    const n = state.notes;
    const name = objName(m.id);
    if (m.k === 'temp') {
      const v = n.temp[m.id];
      if (v != null && Math.abs(v - run.room) <= 1) return CHECK.tempOff(name, tempText(v), tempText(run.temps[m.id]));
      return CHECK.tempWrong(name, v == null ? CHECK.nothing : tempText(v), tempText(run.temps[m.id]));
    }
    const v = n.watt[m.id];
    const set = v == null ? null : sumWith(m.id, v);
    if (set) return CHECK.wattSum(name, wattText(v), LABELS.list(set.map(objName)), wattText(powerOf(m.id)));
    return CHECK.wattWrong(name, v == null ? CHECK.nothing : wattText(v), wattText(powerOf(m.id)));
  }

  function tagMissText(id) {
    const tag = state.tags[id], right = formOf(id);
    if (!tag) return CHECK.tagMissing(objName(id), LABELS.forms[right]);
    if (right === 'no') return CHECK.tagExtra(objName(id), LABELS.forms[tag]);
    return CHECK.tagWrong(objName(id), LABELS.forms[tag], LABELS.forms[right]);
  }
  const right1 = () => LABELS.concl1(String(run.stores.length), LABELS.storeWords.not);
  const right2 = () => LABELS.concl2(LABELS.allWords.all, LABELS.why.warmer, LABELS.fate.wasted);
  const right3 = () => LABELS.concl3(objName(topDevice()));

  // Les faits : chaque objet, ce qu'il garde, sa température (en marche) et sa puissance.
  function factsHTML() {
    return `<table class="lab-table hm-facts"><thead><tr><th scope="col"></th><th scope="col">${LABELS.storedHead}</th><th scope="col">${LABELS.tempHead}</th><th scope="col">${LABELS.wattHead}</th></tr></thead><tbody>` +
      run.objects.map(id => `<tr><th scope="row"><span class="hm-nb-obj">${icon(id)}<span>${objName(id)}</span></span></th>` +
        `<td>${LABELS.forms[formOf(id)]}</td><td>${tempText(run.temps[id])}</td><td>${wattText(powerOf(id))}</td></tr>`).join('') +
      `</tbody></table>`;
  }

  function criterionDetail(key, ev) {
    const c = state.concl;
    if (key === 'notes') {
      return `<p>${CHECK.notesScore(ev.notesGood, NOTES_TOTAL)}</p>` +
        (ev.notes ? `<p class="hm-ok">${CHECK.notesAllGood}</p>` : `<ul class="hm-misslist">${ev.noteMiss.map(m => `<li class="hm-ko">${gloss(noteMissText(m))}</li>`).join('')}</ul>`) +
        `<p class="hm-q-head">${LABELS.factsTitle}</p>${factsHTML()}<p class="hm-muted">${gloss(EXPLAIN.camera)}</p><p class="hm-muted">${gloss(EXPLAIN.meter)}</p>`;
    }
    if (key === 'storage') {
      return (ev.tagMiss.length ? `<ul class="hm-misslist">${ev.tagMiss.map(id => `<li class="hm-ko">${gloss(tagMissText(id))}</li>`).join('')}</ul>` : `<p class="hm-ok">${CHECK.tagsAllGood}</p>`) +
        (ev.q1Ok ? `<p class="hm-ok">${CHECK.answerOk} ${gloss(right1())}</p>` : `<p class="hm-ko">${CHECK.answerWrong} <strong>${gloss(right1())}</strong></p>`) +
        `<ul class="hm-plainlist">${run.stores.map(id => `<li>${icon(id)}<span>${gloss(EXPLAIN.stores[id])}</span></li>`).join('')}</ul>` +
        `<p class="hm-muted">${gloss(EXPLAIN.devices)}</p>`;
    }
    if (key === 'dissipation') {
      return (ev.q2Ok ? `<p class="hm-ok">${CHECK.answerOk} ${gloss(right2())}</p>` : `<p class="hm-ko">${CHECK.answerWrong} <strong>${gloss(right2())}</strong></p>`) +
        `<p>${gloss(EXPLAIN.dissipation(LABELS.list(run.devices.map(id => `${objName(id)} ${tempText(run.temps[id])}`)), run.room))}</p>` +
        `<p>${gloss(EXPLAIN.conservation)}</p>`;
    }
    if (key === 'power') {
      const sorted = run.devices.slice().sort((a, b) => powerOf(b) - powerOf(a));
      return (ev.q3Ok ? `<p class="hm-ok">${CHECK.answerOk} ${gloss(right3())}</p>` : `<p class="hm-ko">${CHECK.answerWrong} <strong>${gloss(right3())}</strong></p>`) +
        `<p>${gloss(EXPLAIN.power(LABELS.list(sorted.map(id => `${objName(id)} ${wattText(powerOf(id))}`))))}</p>` +
        `<p class="hm-muted">${gloss(EXPLAIN.powerHot)}</p>`;
    }
    return ['q1', 'q2', 'q3'].map(k => `<p><strong>${LABELS.verdictRow(k)}</strong> · ` +
      `${ev.vMiss.includes(k) ? `<span class="hm-ko">${CHECK.verdictWrong(ev.should[k])}</span>` : `<span class="hm-ok">${CHECK.verdictOk(c.v[k])}</span>`}</p>`).join('') +
      `<p class="hm-q-head">${CHECK.yourHyps}</p><ol>${hypTexts().map(t => `<li>${gloss(t)}</li>`).join('')}</ol>` +
      (['q1', 'q2', 'q3'].some(k => ev.should[k] === 'rejected') ? `<p class="hm-muted">${CHECK.rejectedNote}</p>` : '');
  }

  function hypTexts() {
    const h = state.hyp;
    return [
      LABELS.hyp1Text(h.stores.length ? LABELS.list(h.stores.map(objThe)) : '—'),
      LABELS.hyp2(h.all ? LABELS.allWords[h.all] : '—'),
      LABELS.hyp3Text(h.top ? objThe(h.top) : '—')
    ];
  }

  function renderCheck() {
    const ev = evaluate();
    const score = CRITERIA.filter(k => ev[k]).length;
    const rows = CRITERIA.map(k => `<button type="button" class="hm-crit ${ev[k] ? 'is-ok' : 'is-ko'} ${state.selected === k ? 'is-selected' : ''}" data-crit="${k}">` +
      `<span class="hm-crit-text"><strong>${LABELS.criteria[k]}</strong><small>${LABELS.criteriaSub[k]}</small></span>` +
      `<span class="hm-crit-mark" aria-label="${ev[k] ? LABELS.markCorrect : LABELS.markIncorrect}">${ev[k] ? '✓' : '✗'}</span></button>`).join('');

    lab.body.innerHTML = `<div class="hm-check">` +
      `<div class="hm-check-left">` +
        `<div class="lab-score"><span class="lab-score-num">${score}<small> / ${CRITERIA.length}</small></span><span class="lab-score-label">${LABELS.scoreLabel}</span></div>` +
        `<div class="hm-crit-list">${rows}</div>` +
        `<div class="hm-reminder">${questionsHTML()}</div>` +
      `</div>` +
      `<div class="hm-check-detail" aria-live="polite"><h3>${LABELS.criteria[state.selected]}</h3>${criterionDetail(state.selected, ev)}</div>` +
      `</div>`;

    $$('[data-crit]').forEach(btn => btn.addEventListener('click', () => {
      state.selected = btn.dataset.crit;
      renderCheck();
    }));
    lab.fillSpace($('.hm-check-detail'));
    lab.checkFooter();
  }

  /* ===== Rapport imprimable : contenu des 7 sections de la fiche outil FO3
     (en-tête, numérotation et mise en page : cadre commun) =====
     Les erreurs passent par mark() (lab-engine.js) : étiquettes, mesures du
     carnet, réponses, jugements. */
  function buildReport(mark) {
    const R = LABELS.report;
    const ev = evaluate();
    const c = state.concl;
    const n = state.notes;
    const word = (text, ok, note) => (ok ? text : mark(text, note));

    // Observations : les étiquettes, puis le carnet, chaque erreur encadrée.
    const tags = `<table class="hm-report-table"><caption>${R.tagsCaption}</caption>` +
      run.objects.map(id => {
        const ok = !ev.tagMiss.includes(id);
        const note = `${plainText(tagMissText(id))} ${plainText(STORES[id] ? EXPLAIN.stores[id] : EXPLAIN.devices)}`;
        return `<tr><th>${objName(id)}</th><td>${ok ? tagText(id) : mark(tagText(id), note, { box: true })}</td></tr>`;
      }).join('') + `</table>`;
    const missOf = (id, k) => ev.noteMiss.find(m => m.id === id && m.k === k);
    const cell = (text, m) => (m ? mark(text, plainText(noteMissText(m)), { box: true }) : text);
    const notes = `<table class="hm-report-table"><caption>${R.notesCaption(run.room)}</caption>` +
      `<tr><th></th><th>${LABELS.tempHead}</th><th>${LABELS.wattHead}</th></tr>` +
      run.devices.map(id => `<tr><th>${objName(id)}</th><td>${cell(tempText(n.temp[id]), missOf(id, 'temp'))}</td>` +
        `<td>${cell(wattText(n.watt[id]), missOf(id, 'watt'))}</td></tr>`).join('') + `</table>`;

    // Interprétation : les appareils plus chauds que la pièce, d'après les mesures de l'élève.
    const warm = run.devices.filter(id => n.temp[id] != null && n.temp[id] > run.room);
    const interp = `<p>${R.warm(warm.length ? LABELS.list(warm.map(objThe)) : '—', run.room)}</p>` +
      `<p>${R.powers(LABELS.list(run.devices.map(id => `${objName(id)}: ${wattText(n.watt[id])}`)))}</p>`;

    // Conclusion : les choix de l'élève, chaque erreur marquée à sa place.
    const note1 = `${CHECK.answerWrong} ${plainText(right1())}`;
    const q1 = LABELS.concl1(c.n ? word(c.n, Number(c.n) === run.stores.length, note1) : '—',
      c.store ? word(LABELS.storeWords[c.store], c.store === 'not', `${note1} ${plainText(EXPLAIN.devices)}`) : '—');
    const note2 = `${CHECK.answerWrong} ${plainText(right2())}`;
    const q2 = LABELS.concl2(c.all ? word(LABELS.allWords[c.all], c.all === 'all', note2) : '—',
      c.why ? word(LABELS.why[c.why], c.why === 'warmer', note2) : '—',
      c.fate ? word(LABELS.fate[c.fate], c.fate === 'wasted', `${note2} ${plainText(EXPLAIN.conservation)}`) : '—');
    const q3 = LABELS.concl3(c.top ? word(objName(c.top), c.top === topDevice(), `${CHECK.answerWrong} ${plainText(right3())}`) : '—');
    const verdicts = `<ul>${['q1', 'q2', 'q3'].map(k => `<li>${R.verdict(LABELS.verdictRow(k), c.v[k] ? word(LABELS[c.v[k]], c.v[k] === ev.should[k], CHECK.verdictWrong(ev.should[k])) : '—')}</li>`).join('')}</ul>`;

    const hyp = `<ol>${hypTexts().map(t => `<li>${t}</li>`).join('')}</ol>` +
      (state.because.trim() ? `<p>${R.because}: ${escapeHtml(state.because.trim())}</p>` : '');
    const correction = CRITERIA.map(k => `<tr><th>${LABELS.criteria[k]}</th><td class="${ev[k] ? 'ok' : 'ko'}">${ev[k] ? '✓' : '✗'}</td></tr>`).join('');

    return {
      title: R.title,
      sections: [
        `<ol>${[1, 2, 3].map(k => `<li>${LABELS.questions[k]}</li>`).join('')}</ol>`,
        hyp,
        `<p>${R.materials(LABELS.list(run.objects.map(objThe)))}</p>`,
        `<ol>${R.procedure.map(s => `<li>${s}</li>`).join('')}</ol>`,
        tags + notes,
        interp,
        `<p>${q1}</p><p>${q2}</p><p>${q3}</p>` + verdicts
      ],
      correction: `<p><strong>${R.score(CRITERIA.filter(k => ev[k]).length)}</strong></p><table class="hm-report-corr">${correction}</table>`
    };
  }

  const plainText = text => String(text).replace(/\[([^\]|]+)(?:\|[^\]]+)?\]/g, '$1');

  lab = LabEngine.create({
    id: 'home',
    title: LABELS.title,
    glossary: GLOSSARY,
    reset,
    stepComplete,
    lockReason,
    isStarted: () => !!(state.hyp.stores.length || state.hyp.all || state.hyp.top || state.started),
    render: { 1: renderPredict, 2: renderExperiment, 3: renderConclude, 4: renderCheck },
    report: buildReport,
    version: 2,
    save: () => ({ run, state }),
    load(data) {
      const r = data.run, s = data.state;
      if (!r || !Array.isArray(r.objects) || r.objects.length !== 8 || !Array.isArray(r.devices) || r.devices.length !== 4 || !r.place || !r.temps ||
        !s || !s.hyp || !Array.isArray(s.hyp.stores) || !s.tags || !s.sw || typeof s.kwh !== 'number' || !s.measured || !s.notes || !s.notes.temp || !s.notes.watt ||
        !s.concl || !s.concl.v || !r.devices.every(id => DEVICES[id] && s.sw[id]) ||
        !r.objects.every(id => DEVICES[id] || STORES[id])) throw new Error('labProgress');
      Object.keys(s.tags).forEach(id => { if (!TAGS.includes(s.tags[id])) delete s.tags[id]; });
      run = r;
      state = s;
      stepperDone = null;
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
          devices: run.devices.join('-'), stores: run.stores.join('-'),
          notesRight: ev.notesGood, notes: NOTES_TOTAL, tagsRight: run.objects.length - ev.tagMiss.length,
          hypothesis: `${state.hyp.stores.length}-${state.hyp.all || '-'}-${state.hyp.top || '-'}`
        }
      };
    }
  });
})();
