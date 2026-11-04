/* ===== Labo virtuel « Down the drain » (chem2) : où finit ce qu'on jette ? =====

   Simulation propre à ce labo, commune aux deux filières ; ses textes sont
   dans le dossier du chapitre, un fichier par langue (lab-drain.en.js,
   lab-drain.nl.js). Le cadre commun (modale, barre d'étapes, verrous,
   traduction, objet en main, rapport imprimé) est dans lab-engine.js.
   Ordre de chargement : moteur, textes, ce fichier.

   Expérience sur un modèle, partie du cours (Partie 3, techniques de
   séparation dans la vie courante et enjeux environnementaux ; compétence :
   justifier un choix). L'élève est opérateur d'une station d'épuration
   belge, anonyme. Ce que la rue a jeté dans l'évier et les toilettes arrive
   à la station : il cherche où chaque chose finit, puis quelle amélioration,
   une seule et dans le budget, protège le mieux la rivière.

   Le modèle : chaque chose traverse les postes dans l'ordre (grille,
   dessableur-déshuileur, bassin à bactéries, décanteur, rivière) ; chaque
   poste en retient une part (capture). La pluie double le débit : le
   décanteur laisse passer deux fois plus de fines particules. Un jour
   d'orage, un quart de l'eau passe par le déversoir d'orage, brute, vers la
   rivière. Les améliorations changent ces parts (grille fine, décanteur plus
   long, filtre à sable, bassin d'orage, campagne auprès des habitants :
   moitié moins des choses visées dans l'égout, bassin d'évaporation : plus
   d'eau du tout pour la rivière, coût énorme). Indice de pollution de la
   rivière : somme des quantités arrivées × nocivité.

   Tirés au sort : 4 choses parmi 12 et leur quantité, la météo du jour (sec,
   pluie, orage plus rarement). La bonne amélioration en dépend (aucune,
   parfois : rien de nocif n'arrive à la rivière).

   Déroulé :
     1. Predict    — placer chaque chose du jour là où elle finira (un poste
                     ou la rivière) ; choisir l'amélioration qui protégera le
                     mieux la rivière (ou aucune) ; pourquoi (facultatif)
     2. Experiment — ouvrir la vanne : une journée en accéléré, la grille se
                     bouche, l'opérateur la racle ; prélever à chaque poste et
                     dans la rivière (gobelet en main), loupe qui décrit ;
                     analyse au laboratoire de l'eau de la rivière (ce qui est
                     dissous) ; journal de l'opérateur (ce qu'on trouve, la
                     technique de chaque poste) ; puis tester des
                     améliorations (au moins deux) : indice de pollution,
                     coût, énergie
     3. Conclude   — où finit chaque chose et pourquoi (propriété) ;
                     l'amélioration choisie, justifiée (chose, propriété,
                     manière de faire, prix à payer) ; jugement des deux
                     hypothèses
     4. Check      — 5 vérifications : prélèvements, techniques, destinations,
                     choix, conclusion ; rapport (FO3) */

(function () {
  'use strict';

  const { escapeHtml, shuffle, reduceMotion } = LabEngine.util;

  // Cadre commun, créé en fin de fichier (LabEngine.create).
  let lab;
  const $ = sel => lab.$(sel);
  const $$ = sel => lab.$$(sel);
  const gloss = text => lab.gloss(text);

  /* ===== Textes =====
     Dans le dossier du chapitre, un fichier par langue (lab-drain.en.js,
     lab-drain.nl.js), chargé avant celui-ci. */
  const {
    labels: LABELS, glossary: GLOSSARY, looks: LOOKS, explanations: EXPLAIN, check: CHECK
  } = LabEngine.textFor('drain');

  /* ===== Le modèle ===== */
  const PLACES = ['grid', 'grit', 'bio', 'settle', 'river'];
  const POSTS = PLACES.slice(0, 4);
  // La technique de chaque poste (bio : des bactéries mangent, ce n'est pas
  // une séparation).
  const TECH = { grid: 'sifting', grit: 'decantation', bio: 'none', settle: 'decantation' };
  const TECHS = ['sifting', 'decantation', 'filtration', 'evaporation', 'none'];

  /* Les choses jetées par la rue. place : là où finit l'essentiel ; reason :
     pourquoi (propriété) ; harm : nocivité pour la rivière ; campaign : visée
     par la campagne auprès des habitants. */
  const ITEMS = {
    wipes: { place: 'grid', reason: 'big', harm: 3, campaign: true },
    buds: { place: 'river', reason: 'thin', harm: 3, campaign: true },
    sand: { place: 'grit', reason: 'sinks', harm: 0.5 },
    litter: { place: 'grit', reason: 'sinks', harm: 0.5, campaign: true },
    oil: { place: 'grit', reason: 'floats', harm: 4, campaign: true },
    coffee: { place: 'settle', reason: 'fine', harm: 0.5 },
    fibres: { place: 'settle', reason: 'fine', harm: 2 },
    glitter: { place: 'settle', reason: 'fine', harm: 2 },
    lemonade: { place: 'bio', reason: 'eaten', harm: 2 },
    milk: { place: 'bio', reason: 'eaten', harm: 3 },
    salt: { place: 'river', reason: 'dissolved', harm: 0 },
    medicine: { place: 'river', reason: 'dissolved', harm: 4, campaign: true }
  };
  const ITEM_KEYS = Object.keys(ITEMS);
  // Invisibles dans l'eau : seule l'analyse au laboratoire les trouve.
  const DISSOLVED = ['lemonade', 'milk', 'salt', 'medicine'];
  const REASONS = ['big', 'thin', 'sinks', 'floats', 'fine', 'eaten', 'dissolved'];

  /* Les améliorations : coût (€ par an), énergie en plus (MWh par an), la
     manière dont elle agit, le prix à payer (le plus lourd ; also : accepté
     aussi). */
  const UP = {
    fineGrid: { cost: 60000, energy: 2, how: 'sifting', price: ['work'] },
    longTank: { cost: 220000, energy: 3, how: 'decantation', price: ['money'] },
    sandFilter: { cost: 260000, energy: 180, how: 'filtration', price: ['energy', 'money'] },
    stormTank: { cost: 240000, energy: 15, how: 'storing', price: ['money'] },
    campaign: { cost: 30000, energy: 0, how: 'keepingOut', price: ['people'] },
    evaporation: { cost: 90000000, energy: 690000, how: 'evaporation', price: ['energy', 'money'] }
  };
  const UPGRADES = Object.keys(UP);
  const CHOICES = UPGRADES.concat('none');
  const HOWS = ['sifting', 'decantation', 'filtration', 'evaporation', 'storing', 'keepingOut'];
  const PRICES = ['work', 'money', 'energy', 'people'];
  const WHY_REASONS = REASONS.concat('overflow');
  const NONE_WHY = ['clean', 'nothingHelps'];
  // Le budget de la ville pour une amélioration (€ par an), tiré au sort.
  const BUDGETS = [150000, 250000, 300000];
  const BYPASS = 0.25;
  const VOLUME = { dry: 3000, rain: 6000, storm: 9000 };
  const MIN_TESTS = 2;

  // Le décanteur : la part qui lui échappe (sec ; doublée sous la pluie).
  const SETTLE_LEAK = { coffee: 0.03, fibres: 0.15, glitter: 0.2 };
  // Le filtre à sable : la part qu'il retient de ce qui lui arrive.
  const FILTER_KEEP = { buds: 0.93, coffee: 1, fibres: 0.88, glitter: 0.88 };

  let run;      // tirage : les choses du jour, leur quantité, la météo
  let state;    // travail de l'élève

  function draw() {
    const items = shuffle(ITEM_KEYS).slice(0, 4).map(id => ({ id, amt: 1 + Math.floor(Math.random() * 3) }));
    const r = Math.random();
    return { items, weather: r < 0.45 ? 'dry' : r < 0.8 ? 'rain' : 'storm', budget: shuffle(BUDGETS)[0] };
  }

  const blankLog = () => {
    const log = {};
    PLACES.forEach(p => { log[p] = { found: [], none: false, tech: null }; });
    return log;
  };

  function reset() {
    run = draw();
    state = {
      hyp: { place: {}, choice: null },
      because: '',
      started: false,                    // vanne ouverte : hypothèses figées
      view: 'station',                   // station ou tests
      day: { t: 0, rakes: 0, done: false },
      sampled: {},                       // place → true
      sample: null,                      // prélèvement affiché
      analysed: false,
      log: blankLog(),
      tests: [],
      shown: null,                       // amélioration montrée sur le plan
      concl: { place: {}, reason: {}, choice: null, item: null, why: null, how: null, price: null, noneWhy: null, vPlace: null, vChoice: null },
      selected: 'samples'
    };
    transient();
  }

  // Ce qui ne vaut que pendant un affichage.
  let dayRunning = false;
  let justTested = null;
  let stepperDone = null;
  let arrivedShown = new Set();   // arrivées déjà montrées (id@t)
  let lastArrival = null;         // la dernière : { id, t }
  function transient() {
    arrivedShown = new Set();
    lastArrival = null;
    dayRunning = false;
    justTested = null;
    stepperDone = null;
  }

  /* --- Le passage dans la station --- */
  const ids = () => run.items.map(it => it.id);
  const amtOf = id => run.items.find(it => it.id === id).amt;
  const wet = () => run.weather !== 'dry';

  function capture(id, post, up) {
    if (post === 'grid') return id === 'wipes' ? 1 : id === 'buds' ? (up === 'fineGrid' ? 0.95 : 0.3) : 0;
    if (post === 'grit') return id === 'sand' || id === 'litter' || id === 'oil' ? 1 : 0;
    if (post === 'bio') return id === 'lemonade' || id === 'milk' ? 1 : id === 'medicine' ? 0.1 : 0;
    if (!(id in SETTLE_LEAK)) return 0;
    let leak = SETTLE_LEAK[id] * (wet() ? 2 : 1);
    if (up === 'longTank') leak /= 2;
    return 1 - leak;
  }

  // Ce que devient chaque chose, en quantités (up : amélioration ou null).
  function flowsOf(up) {
    const res = {};
    run.items.forEach(({ id, amt }) => {
      const a = amt * (up === 'campaign' && ITEMS[id].campaign ? 0.5 : 1);
      const o = { grid: 0, grit: 0, bio: 0, settle: 0, filter: 0, evap: 0, river: 0 };
      const b = run.weather === 'storm' && up !== 'stormTank' ? BYPASS : 0;
      o.river += a * b;
      let w = a * (1 - b);
      POSTS.forEach(p => { const c = capture(id, p, up); o[p] += w * c; w *= 1 - c; });
      if (up === 'sandFilter') { const c = FILTER_KEEP[id] || 0; o.filter += w * c; w *= 1 - c; }
      if (up === 'evaporation') { o.evap += w; w = 0; }
      o.river += w;
      res[id] = o;
    });
    return res;
  }

  const shareAt = (id, place, up) => flowsOf(up)[id][place] / amtOf(id);
  const pollutionOf = up => {
    const f = flowsOf(up);
    return Math.round(ids().reduce((s, id) => s + f[id].river * ITEMS[id].harm * 10, 0));
  };
  const levelOf = x => (x >= 0.6 ? 'lot' : x >= 0.15 ? 'some' : x > 0.02 ? 'traces' : 'none');
  const riverLevel = (id, up) => levelOf(shareAt(id, 'river', up || null));

  /* Le journal : à chaque endroit, ce qu'on doit y trouver (required), ce
     qu'on peut y trouver ou non (part faible : optional), le reste ne s'y
     trouve pas. */
  function expectedAt(place) {
    const required = [], optional = [];
    ids().forEach(id => {
      const s = shareAt(id, place, null);
      const need = place === 'river' ? s >= 0.15 : s >= 0.4;
      const maybe = place === 'river' ? s > 0.02 : s >= 0.05;
      if (need) required.push(id);
      else if (maybe) optional.push(id);
    });
    return { required, optional };
  }

  // Ce que montre un prélèvement : les choses qu'on y voit.
  function seenAt(place) {
    return ids().filter(id => {
      const s = shareAt(id, place, null);
      if (place === 'river') return s >= 0.15 && !DISSOLVED.includes(id);
      if (place === 'bio') return (id === 'lemonade' || id === 'milk') && s >= 0.05;
      return s >= 0.05;
    });
  }

  // Les meilleures améliorations du jour, dans le budget ; « none » si
  // aucune ne fait mieux que la station telle qu'elle est.
  function bestChoices() {
    const base = pollutionOf(null);
    const ok = UPGRADES.filter(u => UP[u].cost <= run.budget).map(u => [u, pollutionOf(u)]).filter(([, p]) => p < base);
    if (!ok.length) return ['none'];
    const min = Math.min(...ok.map(([, p]) => p));
    return ok.filter(([, p]) => p <= min).map(([u]) => u);
  }

  /* ===== Dessins ===== */
  const LINE = '#5d728f';
  const PIPE = '#b7c4d3';
  const RAW = '#9c8a66';
  const CLEAN = '#8fc3e3';

  // Zones du plan (viewBox 1200 × 210) : là où l'on pose une chose ou le gobelet.
  const ZONES = { grid: [110, 190], grit: [300, 210], bio: [510, 210], settle: [720, 230], river: [980, 220] };
  const zoneStyle = p => `left:${(ZONES[p][0] / 12).toFixed(3)}%;width:${(ZONES[p][1] / 12).toFixed(3)}%`;

  // Une petite icône par chose (viewBox 40 × 40).
  function itemSVG(id) {
    const s = `stroke="${LINE}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"`;
    const shapes = {
      wipes: `<path d="M8 12 Q14 8 20 12 T32 12 V30 Q26 26 20 30 T8 30 Z" fill="#ffffff" ${s}/><path d="M12 18 H28 M12 23 H26" stroke="#c9d3de" stroke-width="1.5"/>`,
      buds: `<path d="M9 31 L31 9 M13 34 L34 13" stroke="#ffffff" stroke-width="3.2"/><path d="M9 31 L31 9 M13 34 L34 13" fill="none" ${s} stroke-width="1.2"/>` +
        `<ellipse cx="8" cy="32" rx="3.6" ry="2.6" fill="#ffffff" ${s} transform="rotate(-45 8 32)"/><ellipse cx="32" cy="8" rx="3.6" ry="2.6" fill="#ffffff" ${s} transform="rotate(-45 32 8)"/>` +
        `<ellipse cx="12" cy="35" rx="3.6" ry="2.6" fill="#ffffff" ${s} transform="rotate(-45 12 35)"/><ellipse cx="35" cy="12" rx="3.6" ry="2.6" fill="#ffffff" ${s} transform="rotate(-45 35 12)"/>`,
      sand: `<path d="M5 32 Q20 10 35 32 Z" fill="#d9b77a" ${s}/><circle cx="16" cy="26" r="1.2" fill="#a5814a"/><circle cx="22" cy="22" r="1.2" fill="#a5814a"/><circle cx="25" cy="28" r="1.2" fill="#a5814a"/>`,
      litter: [[12, 28], [20, 28], [28, 28], [16, 21], [24, 21], [20, 14]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.4" fill="#c3c0b8" ${s}/>`).join(''),
      oil: `<path d="M16 6 H24 V11 Q30 13 30 19 V33 Q30 35 28 35 H12 Q10 35 10 33 V19 Q10 13 16 11 Z" fill="#f4d774" ${s}/><rect x="15" y="3" width="10" height="4" rx="1" fill="#8d9db3" ${s}/>`,
      coffee: `<path d="M8 13 H32 L26 33 H14 Z" fill="#ffffff" ${s}/><path d="M10 18 H30 L26 31 H14 Z" fill="#6b4a2f"/><circle cx="17" cy="24" r="1" fill="#a07a55"/><circle cx="23" cy="22" r="1" fill="#a07a55"/>`,
      fibres: `<path d="M12 9 L6 15 L10 19 L12 17 V34 H28 V17 L30 19 L34 15 L28 9 Q20 13 12 9 Z" fill="#7fb0d6" ${s}/><path d="M15 24 Q20 21 25 24 M15 29 Q20 26 25 29" fill="none" stroke="#ffffff" stroke-width="1.4"/>`,
      glitter: `<path d="M14 6 L16 14 L24 16 L16 18 L14 26 L12 18 L4 16 L12 14 Z" fill="#e6c34a" ${s}/><path d="M28 20 L29.5 25.5 L35 27 L29.5 28.5 L28 34 L26.5 28.5 L21 27 L26.5 25.5 Z" fill="#c98bd6" ${s}/>`,
      lemonade: `<path d="M10 9 H30 L27 35 H13 Z" fill="#fbf3c4" ${s}/><circle cx="27" cy="11" r="6" fill="#f2d64b" ${s}/><path d="M27 6 V16 M22 11 H32" stroke="#ffffff" stroke-width="1"/>`,
      milk: `<path d="M12 13 L16 6 H24 L28 13 V35 H12 Z" fill="#ffffff" ${s}/><path d="M12 13 H28" ${s}/><rect x="15" y="19" width="10" height="9" rx="2" fill="#7fb0d6"/>`,
      salt: `<path d="M13 14 Q13 8 20 8 Q27 8 27 14 V33 Q27 35 25 35 H15 Q13 35 13 33 Z" fill="#ffffff" ${s}/><path d="M13 14 H27" ${s}/><circle cx="17" cy="11" r="0.9" fill="${LINE}"/><circle cx="20" cy="10" r="0.9" fill="${LINE}"/><circle cx="23" cy="11" r="0.9" fill="${LINE}"/>`,
      medicine: `<rect x="7" y="10" width="26" height="20" rx="4" fill="#e7edf3" ${s}/>` +
        [[13, 16], [20, 16], [27, 16], [13, 24], [20, 24], [27, 24]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#e07a7a" stroke="${LINE}" stroke-width="1"/>`).join('')
    };
    return `<svg class="dr-item-svg" viewBox="0 0 40 40" aria-hidden="true" focusable="false">${shapes[id]}</svg>`;
  }

  // La météo du jour (viewBox 40 × 40).
  function weatherSVG(w) {
    const cloud = `<path d="M10 24 Q6 24 6 20 Q6 15 12 15 Q14 9 21 10 Q28 10 29 16 Q34 16 34 20 Q34 24 30 24 Z" fill="#dfe6ee" stroke="${LINE}" stroke-width="1.8" stroke-linejoin="round"/>`;
    const body = w === 'dry'
      ? `<circle cx="20" cy="20" r="8" fill="#f2c94c" stroke="${LINE}" stroke-width="1.8"/>` +
        [0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="M20 6 V9" stroke="${LINE}" stroke-width="1.8" stroke-linecap="round" transform="rotate(${a} 20 20)"/>`).join('')
      : w === 'rain'
        ? cloud + `<path d="M13 28 L11 33 M20 28 L18 33 M27 28 L25 33" stroke="#4a90d9" stroke-width="2" stroke-linecap="round"/>`
        : cloud + `<path d="M21 24 L16 31 H21 L18 37" fill="none" stroke="#e0a400" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>` +
          `<path d="M11 28 L9 33 M29 28 L27 33" stroke="#4a90d9" stroke-width="2" stroke-linecap="round"/>`;
    return `<svg class="dr-weather-svg" viewBox="0 0 40 40" aria-hidden="true" focusable="false">${body}</svg>`;
  }

  /* Le plan de la station, de gauche à droite : la ville, la grille (et sa
     benne), le dessableur-déshuileur, le bassin à bactéries, le décanteur, la
     rivière ; en bas, le déversoir d'orage. o = { up, rakes, clogged,
     water, dep } ; water : jusqu'où l'eau est arrivée (0 : station vide,
     1 : jusqu'à la rivière) ; dep : l'heure de la journée pour les dépôts (0
     à 1, voir depOf) ; stormOn : l'orage a éclaté (STORM_AT) ; flowDur :
     vitesse de l'eau dans les conduites (s) ; plain : sans la météo du
     jour (page d'accueil). Station vide avant la journée : rien ne
     montre d'avance ce que chaque poste retient. */
  function planSVG(o) {
    const up = o.up || null;
    const water = o.water ?? 1;
    const has = id => ids().includes(id);
    // Ce qui n'apparaît qu'une fois l'eau arrivée (at : seuil de water).
    const wetAt = at => `data-at="${at}" class="dr-wet ${water >= at ? 'is-wet' : ''}"`;
    const flow = (d, cls, at) => `<path d="${d}" fill="none" stroke="${PIPE}" stroke-width="12" stroke-linecap="round"/>` +
      `<path d="${d}" fill="none" class="dr-flow ${cls || ''} dr-wet ${water >= at ? 'is-wet' : ''}" data-at="${at}" stroke-width="5" stroke-linecap="round"/>`;
    const evap = up === 'evaporation';
    const storm = run.weather === 'storm' && (o.stormOn ?? true);
    const dep = o.dep ?? 1;
    const depAttr = key => `data-dep="${key}" style="--d:${depOf(key, dep).toFixed(3)}"`;
    const out = [];

    // La ville, la pluie
    out.push(`<g class="dr-town">` +
      [[8, 70, 30], [42, 60, 34], [80, 74, 26]].map(([x, y, w]) => `<path d="M${x} ${y + 12} L${x + w / 2} ${y} L${x + w} ${y + 12} V${y + 42} H${x} Z" fill="#f3efe6" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>` +
        `<rect x="${x + w / 2 - 4}" y="${y + 26}" width="8" height="16" fill="#c9d3de"/>`).join('') + `</g>`);
    if (wet() && !o.plain) out.push(`<g class="dr-rain">${[[14, 34], [34, 40], [56, 30], [76, 38], [96, 32]].map(([x, y]) => `<path d="M${x} ${y} l-4 10" stroke="#4a90d9" stroke-width="2" stroke-linecap="round"/>`).join('')}</g>`);
    if (up === 'campaign') {
      out.push(`<g class="dr-poster"><rect x="66" y="40" width="34" height="26" rx="3" fill="#ffffff" stroke="${LINE}" stroke-width="2"/>` +
        `<path d="M72 48 H94 M72 54 H90 M72 60 H86" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/></g>`);
    }

    // Les conduites (eau brute → plus claire)
    out.push(flow('M60 116 V124 H118', 'is-raw', 0.01));
    out.push(flow('M290 108 H312', 'is-raw dr-after-grid', 0.2));
    out.push(flow('M500 108 H522', 'is-raw dr-after-grid', 0.42));
    out.push(flow('M710 108 H732', 'dr-after-grid', 0.62));
    out.push(flow(up === 'sandFilter' || evap ? 'M940 104 H952' : 'M940 104 H1000', 'is-clean dr-after-grid', 0.85));
    if (up === 'sandFilter') out.push(flow('M990 104 H1004', 'is-clean dr-after-grid', 0.85));
    // Le déversoir d'orage : sous la station, de l'entrée à la rivière
    out.push(`<path d="M100 124 V182 H1040 V150" fill="none" stroke="${PIPE}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="M100 124 V182 H1040 V150" fill="none" class="dr-flow is-raw dr-flow-storm ${storm && up !== 'stormTank' ? 'is-on' : ''} dr-wet ${water >= 0.05 ? 'is-wet' : ''}" data-at="0.05" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`);
    if (up === 'stormTank') {
      out.push(`<g class="dr-stormtank"><rect x="140" y="164" width="120" height="36" rx="4" fill="#e7edf3" stroke="${LINE}" stroke-width="2"/>` +
        `<rect x="143" y="${storm ? 176 : 194}" width="114" height="${storm ? 21 : 3}" fill="${RAW}" opacity="0.6"/></g>`);
    }

    // La grille et sa benne
    const bars = up === 'fineGrid' ? 9 : 5;
    out.push(`<g class="dr-grid-post"><rect x="118" y="78" width="172" height="62" rx="4" fill="#ffffff" stroke="${LINE}" stroke-width="2.5"/>` +
      `<g ${wetAt(0.06)}><rect x="120" y="92" width="168" height="46" fill="${RAW}" opacity="0.55" class="dr-water-before"/></g>` +
      Array.from({ length: bars }, (_, k) => {
        const x = 196 + k * (24 / (bars - 1));
        return `<path d="M${x} 70 L${x + 10} 140" stroke="#4a5d75" stroke-width="${up === 'fineGrid' ? 1.6 : 2.4}"/>`;
      }).join('') +
      `<path class="dr-pile" d="M176 138 Q180 112 194 106 Q204 112 206 138 Z" fill="#8a7b5c" stroke="${LINE}" stroke-width="1.5"/>` +
      `<path d="M226 64 L234 40 H284 L292 64 Z" fill="#c8d0da" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>` +
      (o.rakes ? (k => `<path d="M234 ${42 + Math.max(0, 14 - k * 3)} Q259 ${30 - Math.min(k, 5) * 2} 284 ${42 + Math.max(0, 14 - k * 3)} Z" fill="#8a7b5c"/>`)(Math.min(o.rakes, 2) * 2.5) : '') + `</g>`);

    // Le dessableur-déshuileur
    out.push(`<g class="dr-grit-post"><rect x="312" y="78" width="188" height="66" rx="4" fill="#ffffff" stroke="${LINE}" stroke-width="2.5"/>` +
      `<g ${wetAt(0.25)}><rect x="314" y="88" width="184" height="54" fill="${RAW}" opacity="0.45"/></g>` +
      (has('oil') ? `<rect x="314" y="88" width="184" height="8" fill="#f4d774" class="dr-dep is-film" ${depAttr('oil')}/>` : '') +
      (has('sand') || has('litter') ? `<path d="M314 142 V132 Q360 126 406 132 T498 132 V142 Z" fill="#d9b77a" class="dr-dep" ${depAttr('grit')}/>` : '') +
      `<path d="M330 84 H482" stroke="#4a5d75" stroke-width="3" stroke-linecap="round"/></g>`);

    // Le bassin à bactéries
    out.push(`<g class="dr-bio-post"><rect x="522" y="72" width="188" height="72" rx="4" fill="#ffffff" stroke="${LINE}" stroke-width="2.5"/>` +
      `<g ${wetAt(0.47)}><rect x="524" y="84" width="184" height="58" fill="#a7a37a" opacity="0.5"/>` +
      [[548, 134], [580, 126], [612, 138], [644, 128], [676, 136], [566, 112], [628, 116], [690, 114]].map(([x, y], k) =>
        `<circle class="dr-bubble" style="animation-delay:${(k * 0.21).toFixed(2)}s" cx="${x}" cy="${y}" r="3.2" fill="#ffffff" stroke="#8ea0b4" stroke-width="1"/>`).join('') +
      [[540, 100], [600, 96], [660, 104], [700, 92], [570, 92]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#6b6440"/>`).join('') + `</g></g>`);

    // Le décanteur (un deuxième derrière s'il est agrandi)
    const tank = (dx, dy, faint) => `<path d="M${732 + dx} ${76 + dy} H${940 + dx} V${118 + dy} L${872 + dx} ${150 + dy} H${800 + dx} L${732 + dx} ${118 + dy} Z" fill="#ffffff" stroke="${LINE}" stroke-width="${faint ? 1.6 : 2.5}" stroke-linejoin="round" ${faint ? 'opacity="0.6"' : ''}/>`;
    out.push(`<g class="dr-settle-post">${up === 'longTank' ? tank(12, -12, true) : ''}${tank(0, 0, false)}` +
      `<g ${wetAt(0.67)}><path d="M736 90 H936 V117 L871 148 H801 L736 117 Z" fill="${CLEAN}" opacity="0.5"/></g>` +
      `<path d="M790 140 L801 148 H871 L882 140 Q836 128 790 140 Z" fill="#7a6040" class="dr-dep" ${depAttr('settle')}/>` +
      `<path d="M746 84 H926" stroke="#4a5d75" stroke-width="3" stroke-linecap="round"/></g>`);

    // Le filtre à sable, le bassin d'évaporation
    if (up === 'sandFilter') {
      out.push(`<g class="dr-filter"><rect x="952" y="76" width="38" height="66" rx="3" fill="#ffffff" stroke="${LINE}" stroke-width="2.2"/>` +
        `<rect x="954" y="100" width="34" height="18" fill="#d9b77a"/><rect x="954" y="118" width="34" height="22" fill="#b48d55"/></g>`);
    }
    if (evap) {
      out.push(`<g class="dr-evap"><path d="M948 112 H1006 V140 H948 Z" fill="#ffffff" stroke="${LINE}" stroke-width="2.2"/>` +
        `<rect x="950" y="128" width="54" height="10" fill="${CLEAN}" opacity="0.6"/>` +
        [960, 976, 992].map(x => `<path class="dr-vapour" d="M${x} 106 q-6 -8 0 -16 q6 -8 0 -16" fill="none" stroke="#b8c3d1" stroke-width="2.2" stroke-linecap="round"/>`).join('') + `</g>`);
    }

    // La rivière
    const river = evap ? '#d9c9a3' : storm && up !== 'stormTank' ? '#b5a57e' : CLEAN;
    out.push(`<g class="dr-river"><path d="M1000 96 Q1060 86 1120 96 T1200 92 V156 Q1140 166 1080 156 T1000 160 Z" fill="${river}" opacity="${evap ? 0.9 : 0.75}"/>` +
      (evap ? '' : [[1080, 126], [1150, 112]].map(([x, y]) => `<path d="M${x} ${y} q12 -8 24 0 q-12 8 -24 0 Z M${x + 24} ${y} l8 -6 v12 Z" fill="#5d7f9e"/>`).join('')) + `</g>`);

    const cls = ['dr-plan-svg', o.flowing ? 'is-flowing' : '', o.clogged ? 'is-clogged' : ''].join(' ');
    return `<svg class="${cls}" style="--flow-dur:${o.flowDur || 0.7}s" viewBox="0 0 1200 210" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">${out.join('')}</svg>`;
  }

  /* La journée de la ville (t : 0 à 1 = 0 h à 24 h). L'eau avance de poste
     en poste pendant le début de la nuit (FRONT). Le débit suit les heures
     (peu la nuit, un pic le matin et un le soir) ; un jour d'orage, l'orage
     éclate à STORM_AT. Chaque chose part dans l'égout à des heures logiques
     (ARRIVE) : on la voit sortir de la ville, jamais où elle finit ; un
     peu après, le dépôt du poste qui la retient grandit d'un palier. Les
     essais d'améliorations rejouent une journée finie. */
  const FRONT = 0.2;
  const STORM_AT = 14 / 24;
  const ARRIVE = {
    wipes: [8, 19.5], buds: [7.5, 21.5], sand: [18], litter: [9.5], oil: [20], coffee: [7, 14],
    fibres: [10.5, 19], glitter: [16], lemonade: [12, 17], milk: [8.5], salt: [12.5, 19], medicine: [10]
  };
  const arrivals = () => run.items.flatMap(({ id }) => ARRIVE[id].map(h => ({ id, t: h / 24 }))).sort((a, b) => a.t - b.t);
  // Les dépôts du plan : les choses qui les font, le temps d'arriver au poste.
  const DEP_ITEMS = { grit: ['sand', 'litter'], oil: ['oil'], settle: ['coffee', 'fibres', 'glitter'] };
  const DEP_DELAY = { grit: 0.02, oil: 0.02, settle: 0.05 };
  function depOf(key, t) {
    const times = arrivals().filter(a => DEP_ITEMS[key].includes(a.id)).map(a => a.t + DEP_DELAY[key]);
    const frac = times.length ? times.filter(x => x <= t).length / times.length : 0;
    if (key !== 'settle') return frac;
    // Le décanteur a toujours un peu de boues (la ville), plus avec les fines particules.
    return times.length ? 0.3 * t + 0.7 * frac : 0.6 * t;
  }
  // [jusqu'à quelle heure, moment, durée d'un pas de l'eau dans les conduites (s)]
  const PHASES = [[6, 'night', 1.6], [9, 'morning', 0.45], [17, 'daytime', 0.8], [21, 'evening', 0.5], [24, 'late', 1.2]];
  const phaseOf = t => PHASES.find(([h]) => t * 24 < h) || PHASES[PHASES.length - 1];
  const stormOn = t => run.weather === 'storm' && t >= STORM_AT;
  const flowDur = t => (stormOn(t) ? 0.35 : +(phaseOf(t)[2] * (wet() ? 0.8 : 1)).toFixed(2));

  function stationFill() {
    const d = state.day;
    if (state.view === 'tests' || d.done) return { water: 1, dep: 1, stormOn: true, flowDur: 0.7 };
    return { water: Math.min(1, d.t / FRONT) + (dayRunning ? 0.01 : 0), dep: d.t, stormOn: stormOn(d.t), flowDur: flowDur(d.t) };
  }
  function setStationFill(svg) {
    const fill = stationFill();
    const dur = `${fill.flowDur}s`;
    if (svg.style.getPropertyValue('--flow-dur') !== dur) svg.style.setProperty('--flow-dur', dur);
    svg.querySelectorAll('[data-dep]').forEach(el => el.style.setProperty('--d', depOf(el.dataset.dep, fill.dep).toFixed(3)));
    svg.querySelectorAll('[data-at]').forEach(el => el.classList.toggle('is-wet', fill.water >= Number(el.dataset.at)));
  }

  // Une chose sort de la ville et part dans l'égout (le temps d'un coup d'œil).
  function showArrival(id) {
    const box = $('.dr-arrivals');
    if (!box) return;
    const el = document.createElement('div');
    el.className = 'dr-arrive';
    el.setAttribute('data-no-gloss', '');
    el.innerHTML = `${itemSVG(id)}<span>${shortOf(id)}</span>`;
    box.appendChild(el);
    setTimeout(() => el.remove(), 2400);
  }

  // Le gobelet de prélèvement (viewBox 40 × 48) ; fill : teinte de l'eau.
  function cupSVG(fill, big) {
    return `<svg class="${big ? 'dr-cup-big' : 'dr-cup-svg'}" viewBox="0 0 40 48" aria-hidden="true" focusable="false">` +
      (fill ? `<path d="M9 20 H31 L29 42 Q29 44 27 44 H13 Q11 44 11 42 Z" fill="${fill}" opacity="0.75"/>` : '') +
      `<path d="M6 8 H34 L30 42 Q30 46 26 46 H14 Q10 46 10 42 Z" fill="none" stroke="${LINE}" stroke-width="2.2" stroke-linejoin="round"/>` +
      `<path d="M34 12 Q40 12 40 18 V24" fill="none" stroke="${LINE}" stroke-width="2.2" stroke-linecap="round"/></svg>`;
  }
  const SAMPLE_TINT = { grid: '#8a7b5c', grit: '#c2a776', bio: '#a7a37a', settle: '#7a6040', river: CLEAN };
  const sampleTint = p => (p === 'river' && run.weather === 'storm' ? '#b5a57e' : SAMPLE_TINT[p]);

  /* ===== Étapes complètes (progression stricte, voir lab-engine.js) =====
     1 : chaque chose placée et une amélioration choisie ; 2 : la journée,
     les cinq prélèvements, l'analyse, le journal et deux essais au moins ;
     3 : toutes les réponses. */
  const placedAll = () => ids().every(id => !!state.hyp.place[id]);
  const hypDone = () => placedAll() && !!state.hyp.choice;
  const rowDone = p => {
    const r = state.log[p];
    return (r.none || r.found.length > 0) && (p === 'river' || !!r.tech);
  };
  const logDone = () => PLACES.every(rowDone);
  const sampledAll = () => PLACES.every(p => state.sampled[p]);
  const runDone = () => state.day.done && sampledAll() && state.analysed && logDone() && state.tests.length >= MIN_TESTS;

  function stepComplete(n) {
    if (n === 1) return hypDone();
    if (n === 2) return runDone();
    return conclusionsComplete();
  }

  function runMissing() {
    if (!state.day.done) return LABELS.lockDay;
    const parts = [];
    const left = PLACES.filter(p => !state.sampled[p]).length;
    if (left) parts.push(LABELS.missingSamples(left));
    if (state.sampled.river && !state.analysed) parts.push(LABELS.missingAnalysis);
    const rows = PLACES.filter(p => !rowDone(p)).length;
    if (rows) parts.push(LABELS.missingRows(rows));
    if (state.tests.length < MIN_TESTS) parts.push(LABELS.missingTests(MIN_TESTS - state.tests.length));
    return LABELS.notFinished(LABELS.list(parts));
  }

  function lockReason(n) {
    if (n === 1) return LABELS.lockHypothesis;
    if (n === 2) return runMissing();
    return lab.L.missingConclusions;
  }

  const nameOf = id => LABELS.items[id].name;
  const shortOf = id => LABELS.items[id].short;
  const chipHTML = (attrs, label, on, cls) => `<button type="button" class="lab-choice dr-chip ${cls || ''} ${on ? 'is-selected' : ''}" ${attrs} aria-pressed="${on}"><span>${label}</span></button>`;

  function selectHTML(attrs, value, options, labelOf, aria, missing) {
    return `<select class="lab-select dr-select ${value ? 'is-filled' : ''} ${missing && !value ? 'lab-is-missing' : ''}" ${attrs} aria-label="${escapeHtml(aria)}">` +
      `<option value="" disabled ${value ? '' : 'selected'}>${LABELS.choose}</option>` +
      options.map(x => `<option value="${x}" ${value === x ? 'selected' : ''}>${escapeHtml(labelOf(x))}</option>`).join('') + `</select>`;
  }

  const questionsHTML = () => `<p class="dr-big-q">${gloss(LABELS.bigQuestion)}</p>` +
    `<ol class="dr-questions">${LABELS.subQuestions.map(q => `<li>${gloss(q)}</li>`).join('')}</ol>`;

  const todayLine = () => `<span class="dr-today-weather">${weatherSVG(run.weather)}<span>${gloss(LABELS.weather[run.weather])}</span></span>` +
    `<span>${gloss(LABELS.volume(LABELS.num(VOLUME[run.weather])))}</span>`;

  // La zone d'un endroit sur le plan (étiquette ; cible du gobelet).
  const zonesHTML = (extra) => `<div class="dr-zones">${PLACES.map(p => `<div class="dr-zone" data-place="${p}" data-no-gloss style="${zoneStyle(p)}">` +
    `<span class="dr-zone-label">${LABELS.places[p]}</span>${extra ? extra(p) : ''}</div>`).join('')}</div>`;

  /* ===== Étape 1 : hypothèses ===== */
  function tokenHTML(id) {
    return `<button type="button" class="dr-token" data-token="${id}">${itemSVG(id)}<span>${LABELS.items[id].short}</span></button>`;
  }

  function renderPredict() {
    const h = state.hyp;
    const show = lab.state.showMissing;
    const tray = ids().filter(id => !h.place[id]);

    lab.body.innerHTML = `<div class="dr-predict">` +
      `<div class="dr-question-card"><div><p class="dr-kicker">${LABELS.yourQuestion}</p>${questionsHTML()}</div>` +
        `<div class="dr-today"><p class="dr-kicker">${LABELS.todayTitle}</p><p class="dr-today-line">${todayLine()}</p>` +
        `<p class="dr-intro">${gloss(LABELS.intro)}</p></div></div>` +
      `<div class="dr-plan">${planSVG({ water: 0, dep: 0, stormOn: false })}${zonesHTML()}</div>` +
      `<div class="dr-drops">${PLACES.map(p => `<div class="dr-drop ${show && tray.length ? 'lab-is-missing' : ''}" data-drop="${p}" style="${zoneStyle(p)}">` +
        ids().filter(id => h.place[id] === p).map(tokenHTML).join('') + `</div>`).join('')}</div>` +
      `<div class="dr-predict-bottom">` +
        `<div class="dr-tray ${show && tray.length ? 'lab-is-missing' : ''}"><p class="dr-kicker">${LABELS.trayTitle}</p>` +
          `<p class="dr-hint">${gloss(tray.length ? LABELS.trayHint : LABELS.trayDone)}</p>` +
          `<div class="dr-tray-tokens">${tray.map(tokenHTML).join('')}</div></div>` +
        `<div class="dr-choice-card ${show && !h.choice ? 'lab-is-missing' : ''}"><p class="dr-kicker">${LABELS.choiceTitle}</p>` +
          `<p class="dr-hint">${gloss(LABELS.choiceHint(LABELS.money(run.budget)))}</p>` +
          `<div class="dr-chips">${CHOICES.map(u => chipHTML(`data-choice="${u}"`, LABELS.upgrades[u].name, h.choice === u)).join('')}</div>` +
          `<label class="dr-because"><span>${LABELS.because}</span>` +
          `<input type="text" class="lab-input dr-because-input" maxlength="160" placeholder="${LABELS.becausePlaceholder}" value="${escapeHtml(state.because)}" autocomplete="off"></label></div>` +
      `</div></div>`;

    const fixed = state.started;
    // Cibles : la case sous le plan, ou l'endroit sur le plan lui-même.
    const drops = () => $$('[data-drop], .dr-zone[data-place]');
    $$('[data-token]').forEach(btn => {
      const id = btn.dataset.token;
      if (fixed) { lab.setLock(btn, LABELS.lockHypothesisFixed, { icon: false }); return; }
      lab.makeDraggable(btn, {
        hold: true,
        ghost: () => `<div class="dr-token is-ghost">${itemSVG(id)}<span>${LABELS.items[id].short}</span></div>`,
        targets: drops,
        onDrop: target => {
          h.place[id] = target.dataset.drop || target.dataset.place;
          afterHyp();
        }
      });
    });
    $$('[data-choice]').forEach(btn => {
      if (fixed) lab.setLock(btn, LABELS.lockHypothesisFixed, { icon: false });
      btn.addEventListener('click', () => { h.choice = btn.dataset.choice; afterHyp(); });
    });
    const because = $('.dr-because-input');
    because.addEventListener('input', e => { state.because = e.target.value; });
    if (fixed) {
      because.readOnly = true;
      lab.setLock(because, LABELS.lockHypothesisFixed);
    }

    const ready = hypDone();
    const info = show && !ready ? lab.footerInfo(LABELS.lockHypothesis, true)
      : lab.footerInfo(ready ? LABELS.hypothesisReady : LABELS.hypothesisPending);
    lab.setFooter(info + `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-next>${LABELS.toStation} →</button></div>`);
    const next = $('[data-next]');
    next.addEventListener('click', () => lab.goToStep(2));
    lab.setLock(next, ready ? null : LABELS.lockHypothesis, { missing: true, key: 'next' });
  }

  function afterHyp() {
    if (lab.state.showMissing && hypDone()) lab.state.showMissing = false;
    renderPredict();
    lab.renderStepper();
    lab.save();
  }

  /* ===== Étape 2 : la station =====
     En haut, le plan. En bas, deux vues : la journée (à gauche la journée et
     le gobelet, au milieu le prélèvement, à droite le journal) ou les
     améliorations (un tableau : une ligne par amélioration, son bouton Test
     puis ses résultats). */
  const DAY_SECONDS = 25;
  // Un bouchon peu après chaque arrivée de lingettes (deux), un seul sans.
  const clogTimes = () => (ids().includes('wipes') ? ARRIVE.wipes.map(h => h / 24 + 0.03) : [0.5]);
  const isClogged = () => !state.day.done && state.day.t >= (clogTimes()[state.day.rakes] ?? 2);
  const clockText = t => {
    const minutes = Math.round(t * 24 * 60);
    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  };

  function captionFor() {
    const d = state.day;
    if (state.view === 'tests') {
      if (justTested) return LABELS.captionTested(LABELS.upgrades[justTested].name);
      return state.tests.length ? LABELS.captionTests : LABELS.captionTestsFirst;
    }
    if (!d.done) {
      if (d.t === 0 && !dayRunning) return LABELS.captionValve;
      if (isClogged()) return LABELS.captionClogged;
      if (!dayRunning) return LABELS.captionPaused;
      if (lastArrival && d.t - lastArrival.t < 0.05) return LABELS.captionArrive(nameOf(lastArrival.id));
      return stormOn(d.t) ? LABELS.captionStorm : LABELS.captionPhases[phaseOf(d.t)[1]];
    }
    if (!sampledAll()) return LABELS.captionSample;
    if (!state.analysed) return LABELS.captionAnalyse;
    if (!logDone()) return LABELS.captionLog;
    return LABELS.captionToTests;
  }

  function dayPanelHTML() {
    const d = state.day;
    const valve = d.done ? '' : `<button type="button" class="lab-btn lab-btn-primary dr-act" data-valve>${d.t === 0 ? LABELS.valveBtn : LABELS.continueBtn}</button>`;
    return `<section class="dr-daypanel"><p class="dr-kicker">${LABELS.todayTitle}</p>` +
      `<p class="dr-today-line">${todayLine()}</p>` +
      `<ul class="dr-daylist">${run.items.map(({ id, amt }) => `<li>${itemSVG(id)}<span>${gloss(nameOf(id))}<small>${LABELS.amounts[amt]}</small></span></li>`).join('')}</ul>` +
      `<div class="dr-clockrow"><span class="dr-clock" aria-live="off">${clockText(d.done ? 1 : d.t)}</span>` +
        `<span class="dr-daybar"><span class="dr-dayfill" style="width:${((d.done ? 1 : d.t) * 100).toFixed(1)}%"></span></span></div>` +
      // Un seul bouton à la fois : la vanne, puis la racle pendant la journée.
      (d.done ? `<p class="dr-daydone">${LABELS.dayDone}</p>`
        : dayRunning ? `<button type="button" class="lab-btn dr-act dr-rake ${isClogged() ? 'is-urgent' : ''}" data-rake>${LABELS.rakeBtn}</button>` : valve) +
      `<button type="button" class="dr-cup" data-cup>${cupSVG(null)}<span>${LABELS.cupBtn}</span></button>` +
      `</section>`;
  }

  function sampleHTML() {
    const p = state.sample;
    const tabs = PLACES.filter(q => state.sampled[q]);
    const head = `<div class="dr-sampletabs">${tabs.map(q => `<button type="button" class="dr-sampletab ${q === p ? 'is-selected' : ''}" data-show-sample="${q}" data-lab-look aria-pressed="${q === p}">${LABELS.places[q]}</button>`).join('')}</div>`;
    if (!p) return `<section class="dr-sample is-empty">${head}<p>${gloss(state.day.done ? LABELS.sampleEmpty : LABELS.sampleWait)}</p></section>`;
    const lines = [LOOKS.base[p][p === 'river' ? run.weather : 'all']];
    if (p === 'bio') {
      const foods = seenAt('bio');
      if (foods.length) foods.forEach(id => lines.push(LOOKS.bio[id]));
      else lines.push(LOOKS.bio.nothing);
    } else {
      seenAt(p).forEach(id => lines.push(LOOKS[p][id]));
      if (p === 'grit' && !seenAt('grit').length) lines.push(LOOKS.grit.nothing);
    }
    let analysis = '';
    if (p === 'river') {
      const dis = ids().filter(id => DISSOLVED.includes(id));
      analysis = state.analysed
        ? `<div class="dr-analysis"><p class="dr-kicker">${LABELS.analysisTitle}</p>` +
          (dis.length ? `<ul>${dis.map(id => `<li><span>${gloss(LABELS.analytes[id])}</span><strong>${LABELS.levels[riverLevel(id)]}</strong></li>`).join('')}</ul>`
            : `<p>${gloss(LABELS.analysisNothing)}</p>`) + `</div>`
        : `<p class="dr-muted">${gloss(LABELS.invisibleNote)}</p><button type="button" class="lab-btn lab-btn-primary dr-act" data-analyse>${LABELS.analyseBtn}</button>`;
    }
    return `<section class="dr-sample">${head}<div class="dr-sample-body">${cupSVG(sampleTint(p), true)}` +
      `<div><p class="dr-sample-title">${gloss(LABELS.sampleTitle(LABELS.places[p]))}</p><ul class="dr-looks">${lines.map(l => `<li>${gloss(l)}</li>`).join('')}</ul></div></div>` +
      `${analysis}</section>`;
  }

  function logHTML() {
    const show = lab.state.showMissing;
    const rows = PLACES.map(p => {
      const r = state.log[p];
      const miss = show && !rowDone(p);
      return `<tr class="${miss ? 'is-missing' : ''}"><th scope="row">${gloss(LABELS.places[p])}</th>` +
        ids().map(id => `<td>${chipHTML(`data-log="${p}" data-item="${id}" aria-label="${escapeHtml(LABELS.tickAria(LABELS.places[p], shortOf(id)))}"`, r.found.includes(id) ? '✓' : '', r.found.includes(id), 'dr-tick')}</td>`).join('') +
        `<td>${chipHTML(`data-log="${p}" data-item="none"`, LABELS.nothingShort, r.none, 'dr-tick is-none')}</td>` +
        `<td>${p === 'river' ? `<span class="dr-muted">—</span>` : selectHTML(`data-tech="${p}"`, r.tech, TECHS, x => LABELS.techs[x], LABELS.techHead, miss)}</td></tr>`;
    }).join('');
    return `<section class="dr-log"><table class="lab-table dr-logtable"><caption>${LABELS.logTitle}</caption>` +
      `<thead><tr><th scope="col">${LABELS.placeHead}</th>${ids().map(id => `<th scope="col"><span class="dr-loghead">${itemSVG(id)}<span>${LABELS.items[id].short}</span></span></th>`).join('')}` +
      `<th scope="col">${LABELS.nothingHead}</th><th scope="col">${LABELS.techHead}</th></tr></thead><tbody>${rows}</tbody></table>` +
      `<p class="dr-loghint">${gloss(LABELS.logHint)}</p></section>`;
  }

  function testsHTML() {
    const rowsData = [null].concat(state.tests);
    const max = Math.max(1, ...rowsData.map(u => pollutionOf(u)));
    const shown = state.shown;
    /* Une ligne par amélioration, toujours à la même place (la station
       d'aujourd'hui, puis les six) : le tableau ne grandit pas avec les
       essais. Pas encore testée : son bouton Test à la place des résultats ;
       testée : ses résultats, et son prix à payer sous la description. */
    const row = u => {
      const tested = !u || state.tests.includes(u);
      const name = u ? LABELS.upgrades[u].name : LABELS.baseRow;
      const head = tested
        ? `<button type="button" class="dr-showbtn lab-gloss-btn ${shown === u ? 'is-selected' : ''}" data-show-test="${u || 'base'}" data-lab-look aria-pressed="${shown === u}">${name}</button>`
        : `<strong class="dr-upname">${gloss(name)}</strong>`;
      const note = !u ? (run.weather === 'storm' ? LABELS.baseStormNote : '') : tested ? LABELS.upgrades[u].note : '';
      const text = `${u ? ` <span class="dr-what">${gloss(LABELS.upgrades[u].what)}</span>` : ''}${note ? ` <span class="dr-note">${gloss(note)}</span>` : ''}`;
      if (!tested) {
        return `<tr class="is-untested"><th scope="row">${head}${text}</th>` +
          `<td><button type="button" class="lab-btn lab-btn-primary dr-testbtn" data-test="${u}">${LABELS.testBtn}</button></td><td></td></tr>`;
      }
      const p = pollutionOf(u);
      const over = u && UP[u].cost > run.budget;
      const levels = ids().filter(id => riverLevel(id, u) !== 'none')
        .map(id => `<span class="dr-lvl is-${riverLevel(id, u)}">${LABELS.items[id].short}: ${LABELS.levels[riverLevel(id, u)]}</span>`).join('');
      return `<tr class="${u === justTested ? 'is-new' : ''} ${shown === u ? 'is-shown' : ''}">` +
        `<th scope="row">${head}${text}</th>` +
        `<td><span class="dr-bar"><span style="width:${(p / max * 100).toFixed(1)}%"></span></span><strong class="dr-pnum">${p}</strong>` +
          `<span class="dr-lvls">${levels || `<span class="dr-lvl">${LABELS.riverClean}</span>`}</span></td>` +
        `<td class="dr-costcell">${u ? `<strong class="${over ? 'dr-over' : ''}">${LABELS.money(UP[u].cost)}</strong>` +
          (over ? `<small class="dr-over">${LABELS.overBudget}</small>` : '') +
          `<small>${LABELS.energy(LABELS.num(UP[u].energy))}</small>` : '—'}</td></tr>`;
    };
    return `<section class="dr-tests"><div class="dr-tests-head"><p class="dr-hint">${gloss(LABELS.budgetLine(LABELS.money(run.budget)))}</p>` +
      `<p class="dr-loghint">${gloss(LABELS.pollutionHint)}</p></div>` +
      `<table class="lab-table dr-restable"><caption class="visually-hidden">${LABELS.upsTitle}</caption>` +
      `<colgroup><col class="dr-col-up"><col class="dr-col-poll"><col class="dr-col-cost"></colgroup>` +
      `<thead><tr><th scope="col">${LABELS.upHead}</th><th scope="col">${LABELS.pollutionHead}</th>` +
      `<th scope="col">${LABELS.costHead}<small>${LABELS.energyHead}</small></th></tr></thead>` +
      `<tbody>${[null].concat(UPGRADES).map(row).join('')}</tbody></table></section>`;
  }

  function renderExperiment() {
    const tests = state.view === 'tests';
    const d = state.day;
    lab.body.innerHTML = `<div class="dr-run ${tests ? 'is-tests' : ''}">` +
      `<div class="dr-plan">${planSVG(Object.assign({ up: tests ? state.shown : null, rakes: d.rakes, flowing: dayRunning || !!justTested, clogged: isClogged() }, stationFill()))}${zonesHTML()}<div class="dr-arrivals" aria-hidden="true"></div></div>` +
      `<div class="dr-viewbar"><div class="dr-views">` +
        ['station', 'tests'].map(v => `<button type="button" class="dr-view ${state.view === v ? 'is-selected' : ''}" data-view="${v}" data-lab-look aria-pressed="${state.view === v}">${LABELS.views[v]}</button>`).join('') +
      `</div><p class="dr-caption lab-caption" aria-live="polite">${gloss(captionFor())}</p></div>` +
      `<div class="dr-lower">${tests ? testsHTML() : dayPanelHTML() + sampleHTML() + logHTML()}</div></div>`;

    $$('[data-view]').forEach(btn => {
      const v = btn.dataset.view;
      if (v === 'tests' && !(logDone() && state.analysed) && !lab.isFrozen()) lab.setLock(btn, LABELS.lockTests, { icon: true });
      btn.addEventListener('click', () => {
        state.view = v;
        justTested = null;
        renderExperiment();
      });
    });
    if (tests) bindTests(); else bindStation();
    renderRunFooter();
    if (dayRunning) startDayLoop();
  }

  function bindStation() {
    const d = state.day;
    const valve = $('[data-valve]');
    if (valve) valve.addEventListener('click', () => {
      state.started = true;
      dayRunning = true;
      renderExperiment();
      lab.save();
    });
    const rake = $('[data-rake]');
    if (rake) {
      lab.setLock(rake, isClogged() ? null : LABELS.lockRake, { icon: false });
      rake.addEventListener('click', () => {
        d.rakes++;
        renderExperiment();
        lab.save();
      });
    }
    const cup = $('[data-cup]');
    if (!d.done) lab.setLock(cup, LABELS.lockCupDay);
    else {
      lab.makeDraggable(cup, {
        hold: true,
        ghost: () => `<div class="dr-cup-ghost">${cupSVG(null)}</div>`,
        targets: () => $$('.dr-zone[data-place]'),
        onHold: on => { const c = $('.dr-caption'); if (c) c.innerHTML = gloss(on ? LABELS.captionHold : captionFor()); },
        onDrop: target => {
          const p = target.dataset.place;
          state.sampled[p] = true;
          state.sample = p;
          renderExperiment();
          lab.save();
        }
      });
    }
    $$('[data-show-sample]').forEach(btn => btn.addEventListener('click', () => {
      state.sample = btn.dataset.showSample;
      renderExperiment();
    }));
    const analyse = $('[data-analyse]');
    if (analyse) analyse.addEventListener('click', () => {
      state.analysed = true;
      renderExperiment();
      lab.save();
    });
    bindLog();
  }

  function bindLog() {
    $$('[data-log]').forEach(btn => {
      const p = btn.dataset.log, id = btn.dataset.item;
      const r = state.log[p];
      if (!state.sampled[p]) lab.setLock(btn, LABELS.lockSampleFirst(LABELS.places[p]), { icon: false });
      else if (p === 'river' && !state.analysed) lab.setLock(btn, LABELS.lockAnalyseFirst, { icon: false });
      btn.addEventListener('click', () => {
        if (id === 'none') {
          r.none = !r.none;
          if (r.none) r.found = [];
        } else {
          r.none = false;
          r.found = r.found.includes(id) ? r.found.filter(x => x !== id) : r.found.concat(id);
        }
        afterLog();
      });
    });
    $$('select[data-tech]').forEach(sel => {
      const p = sel.dataset.tech;
      if (!state.sampled[p]) lab.setLock(sel, LABELS.lockSampleFirst(LABELS.places[p]));
      sel.addEventListener('change', () => {
        state.log[p].tech = sel.value || null;
        afterLog();
      });
    });
  }

  function afterLog() {
    if (lab.state.showMissing && runDone()) lab.state.showMissing = false;
    renderExperiment();
    lab.save();
  }

  function bindTests() {
    $$('[data-test]').forEach(btn => {
      const u = btn.dataset.test;
      btn.addEventListener('click', () => {
        state.tests.push(u);
        state.shown = u;
        justTested = u;
        if (lab.state.showMissing && runDone()) lab.state.showMissing = false;
        renderExperiment();
        lab.save();
      });
    });
    $$('[data-show-test]').forEach(btn => btn.addEventListener('click', () => {
      const u = btn.dataset.showTest;
      state.shown = u === 'base' ? null : u;
      justTested = null;
      renderExperiment();
    }));
  }

  /* La journée en accéléré : l'horloge avance, sauf quand la grille est
     bouchée (l'opérateur la racle). Seuls l'horloge, la barre, la légende et
     le plan changent pendant l'animation ; l'orage qui éclate redessine
     tout (déversoir, rivière). Une journée reprise ne remontre pas les
     arrivées déjà passées. */
  function startDayLoop() {
    const token = lab.newScene();
    let last = performance.now();
    let clogged = isClogged();
    const stormWas = stormOn(state.day.t);
    let caption = captionFor();
    arrivals().forEach(a => { if (a.t < state.day.t) arrivedShown.add(`${a.id}@${a.t}`); });
    const seconds = reduceMotion ? DAY_SECONDS / 4 : DAY_SECONDS;
    const frame = now => {
      if (!lab.isScene(token) || !dayRunning) return;
      const d = state.day;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!isClogged()) d.t = Math.min(1, d.t + dt / seconds);
      if (d.t >= 1) {
        d.t = 1;
        d.done = true;
        dayRunning = false;
        renderExperiment();
        lab.save();
        return;
      }
      const clock = $('.dr-clock');
      if (clock) clock.textContent = clockText(d.t);
      const fill = $('.dr-dayfill');
      if (fill) fill.style.width = `${(d.t * 100).toFixed(1)}%`;
      if (stormOn(d.t) !== stormWas) {
        renderExperiment();
        return;
      }
      arrivals().forEach(a => {
        const key = `${a.id}@${a.t}`;
        if (a.t > d.t || arrivedShown.has(key)) return;
        arrivedShown.add(key);
        lastArrival = a;
        showArrival(a.id);
      });
      const plan = $('.dr-plan-svg');
      if (plan) setStationFill(plan);
      if (isClogged() !== clogged) {
        clogged = isClogged();
        if (plan) plan.classList.toggle('is-clogged', clogged);
        const rake = $('[data-rake]');
        if (rake) {
          rake.classList.toggle('is-urgent', clogged);
          lab.setLock(rake, clogged ? null : LABELS.lockRake, { icon: false });
        }
      }
      const nextCaption = captionFor();
      if (nextCaption !== caption) {
        caption = nextCaption;
        const c = $('.dr-caption');
        if (c) c.innerHTML = gloss(caption);
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  function renderRunFooter() {
    lab.setFooter(`<button type="button" class="lab-btn lab-btn-ghost" data-back>← ${LABELS.backToPredict}</button>` +
      lab.footerInfo('') + `<div class="lab-footer-actions">` +
      `<button type="button" class="lab-btn lab-btn-primary" data-next>${LABELS.toConclude} →</button></div>`);
    $('[data-back]').addEventListener('click', () => lab.goToStep(1));
    $('[data-next]').addEventListener('click', () => lab.goToStep(3));
    const complete = stepComplete(2);
    const warn = lab.state.showMissing && !complete;
    const info = $('.lab-footer .lab-footer-info');
    if (info) {
      info.textContent = warn ? runMissing() : LABELS.runInfo(PLACES.filter(p => state.sampled[p]).length, PLACES.filter(rowDone).length, state.tests.length);
      info.classList.toggle('is-warning', warn);
    }
    lab.setLock($('[data-next]'), complete ? null : runMissing(), { missing: true, key: 'next' });
    if (complete !== stepperDone) { stepperDone = complete; lab.renderStepper(); }
  }

  /* ===== Étape 3 : conclusion =====
     À gauche, le journal et les essais en résumé ; à droite, les réponses. */
  function conclusionParts() {
    const c = state.concl;
    const q2 = c.choice === 'none' ? !!c.noneWhy : !!(c.choice && c.item && c.why && c.how && c.price);
    return {
      places: ids().every(id => c.place[id] && c.reason[id]),
      choice: q2,
      verdict: !!(c.vPlace && c.vChoice)
    };
  }
  const conclusionsComplete = () => Object.values(conclusionParts()).every(Boolean);

  function recapHTML() {
    const found = id => PLACES.filter(p => state.log[p].found.includes(id)).map(p => LABELS.places[p]);
    return `<section class="dr-recap"><h3 class="lab-panel-title">${LABELS.resultsTitle}</h3>` +
      `<p class="dr-kicker">${LABELS.logTitle}</p><ul class="dr-recaplist">${ids().map(id => `<li>${itemSVG(id)}<span><strong>${gloss(nameOf(id))}</strong>` +
        `<small>${found(id).length ? gloss(LABELS.list(found(id))) : '—'}</small></span></li>`).join('')}</ul>` +
      `<p class="dr-kicker">${LABELS.resultsCaption}</p><ul class="dr-recaptests">` +
        [null].concat(state.tests).map(u => `<li><span>${u ? LABELS.upgrades[u].name : LABELS.baseRow}</span><strong>${pollutionOf(u)}</strong>` +
          `<small class="${u && UP[u].cost > run.budget ? 'dr-over' : ''}">${u ? LABELS.money(UP[u].cost) : ''}</small></li>`).join('') +
      `</ul></section>`;
  }

  function renderConclude() {
    const c = state.concl;
    const show = lab.state.showMissing;
    const parts = conclusionParts();
    const miss = ok => (show && !ok ? 'lab-is-missing' : '');
    const verdict = (key, opts, rowLabel) => `<div class="dr-verdict"><span class="dr-verdict-text">${rowLabel}</span>` +
      opts.map(x => `<button type="button" class="lab-choice dr-chip is-small ${c[key] === x ? 'is-selected' : ''}" data-v="${key}" data-val="${x}" aria-pressed="${c[key] === x}">${LABELS.verdicts[x]}</button>`).join('') + `</div>`;
    // L'icône et le nom court : les listes de toutes les lignes s'alignent (alignNames).
    const placeRow = id => `<p class="dr-concl-line">${LABELS.placeAnswer(`<span class="dr-cname">${itemSVG(id)}<span>${gloss(shortOf(id))}</span></span>`,
      selectHTML(`data-cplace="${id}"`, c.place[id], PLACES, x => LABELS.placesIn[x], LABELS.placeHead, show),
      selectHTML(`data-creason="${id}"`, c.reason[id], REASONS, x => LABELS.reasons[x], LABELS.reasonAria, show))}</p>`;

    let q2;
    if (c.choice === 'none') {
      q2 = `<p class="dr-concl-line">${LABELS.noneAnswer(selectHTML('data-cnone', c.noneWhy, NONE_WHY, x => LABELS.noneWhy[x], LABELS.noneAria, show))}</p>`;
    } else {
      const chosen = c.choice;
      const itemOpts = ids();
      q2 = `<p class="dr-concl-line">${LABELS.choiceAnswer(
        chosen ? LABELS.upgrades[chosen].name : '…',
        selectHTML('data-citem', c.item, itemOpts, x => LABELS.items[x].name, LABELS.itemAria, show),
        selectHTML('data-cwhy', c.why, WHY_REASONS, x => LABELS.reasons[x], LABELS.reasonAria, show))}</p>` +
        `<p class="dr-concl-line">${LABELS.howAnswer(selectHTML('data-chow', c.how, HOWS, x => LABELS.hows[x], LABELS.howAria, show))}</p>` +
        `<p class="dr-concl-line">${LABELS.priceAnswer(selectHTML('data-cprice', c.price, PRICES, x => LABELS.prices[x], LABELS.priceAria, show))}</p>`;
    }

    lab.body.innerHTML = `<div class="dr-conclude">${recapHTML()}` +
      `<section class="dr-form">` +
        `<div class="dr-q ${miss(parts.places)}"><p class="dr-q-title"><span class="dr-num" aria-hidden="true">1</span><span>${gloss(LABELS.subQuestions[0])}</span></p>${ids().map(placeRow).join('')}</div>` +
        `<div class="dr-q ${miss(parts.choice)}"><p class="dr-q-title"><span class="dr-num" aria-hidden="true">2</span><span>${gloss(LABELS.subQuestions[1])}</span></p>` +
          `<p class="dr-concl-line">${LABELS.choiceLead(selectHTML('data-cchoice', c.choice, CHOICES, x => LABELS.upgrades[x].name, LABELS.choiceAria, show))}</p>${c.choice ? q2 : ''}</div>` +
        `<div class="dr-q ${miss(parts.verdict)}">${verdict('vPlace', ['confirmed', 'partly', 'rejected'], LABELS.verdictPlace)}${verdict('vChoice', ['confirmed', 'rejected'], LABELS.verdictChoice)}</div>` +
      `</section></div>`;

    const bindSel = (sel, fn) => $$(sel).forEach(el => el.addEventListener('change', () => { fn(el, el.value || null); afterConcl(); }));
    bindSel('select[data-cplace]', (el, v) => { c.place[el.dataset.cplace] = v; });
    bindSel('select[data-creason]', (el, v) => { c.reason[el.dataset.creason] = v; });
    bindSel('select[data-cchoice]', (el, v) => { c.choice = v; });
    bindSel('select[data-citem]', (el, v) => { c.item = v; });
    bindSel('select[data-cwhy]', (el, v) => { c.why = v; });
    bindSel('select[data-chow]', (el, v) => { c.how = v; });
    bindSel('select[data-cprice]', (el, v) => { c.price = v; });
    bindSel('select[data-cnone]', (el, v) => { c.noneWhy = v; });
    $$('[data-v]').forEach(btn => btn.addEventListener('click', () => { c[btn.dataset.v] = btn.dataset.val; afterConcl(); }));
    alignNames();

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

  /* Question 1 : les noms ont la largeur du plus long (en em : le zoom du
     grand écran ne fausse rien), les listes tombent l'une sous l'autre. */
  function alignNames() {
    const names = $$('.dr-cname');
    if (!names.length || !names[0].offsetParent) return;
    names.forEach(n => { n.style.minWidth = ''; });
    const widest = Math.max(...names.map(n => n.offsetWidth));
    names[0].style.width = '10em';
    const em = names[0].offsetWidth / 10;
    names[0].style.width = '';
    if (em > 0) names.forEach(n => { n.style.minWidth = `${(widest / em + 0.05).toFixed(2)}em`; });
  }

  function afterConcl() {
    if (lab.state.showMissing && conclusionsComplete()) lab.state.showMissing = false;
    renderConclude();
    lab.save();
  }

  /* ===== Étape 4 : correction ===== */
  const CRITERIA = ['samples', 'techniques', 'places', 'choice', 'conclusion'];

  // Une ligne du journal : ce qui manque, ce qui est en trop.
  function rowErrors(p) {
    const r = state.log[p];
    const { required, optional } = expectedAt(p);
    const missing = required.filter(id => !r.found.includes(id));
    const extra = r.found.filter(id => !required.includes(id) && !optional.includes(id));
    return { missing, extra, wrongNone: r.none && required.length > 0 };
  }
  const rowWrong = p => {
    const e = rowErrors(p);
    return e.missing.length > 0 || e.extra.length > 0 || e.wrongNone;
  };

  // Ce que réduit une amélioration (choses dont la part arrivée à la
  // rivière baisse vraiment).
  const reducedBy = u => ids().filter(id => flowsOf(null)[id].river - flowsOf(u)[id].river >= 0.05 * amtOf(id));

  function choiceEval() {
    const c = state.concl;
    const best = bestChoices();
    const rightChoice = best.includes(c.choice);
    const tested = c.choice === 'none' || state.tests.includes(c.choice);
    let because = true;
    if (c.choice === 'none') {
      because = c.noneWhy === (pollutionOf(null) === 0 ? 'clean' : 'nothingHelps');
    } else if (c.choice) {
      const u = c.choice;
      const itemOk = reducedBy(u).includes(c.item);
      const whyOk = itemOk && (c.why === ITEMS[c.item].reason || (u === 'stormTank' && c.why === 'overflow'));
      because = itemOk && whyOk && c.how === UP[u].how && UP[u].price.includes(c.price);
    }
    return { best, rightChoice, tested, because, ok: rightChoice && tested && because };
  }

  function evaluate() {
    const c = state.concl;
    const sampleMiss = PLACES.filter(rowWrong);
    const techMiss = POSTS.filter(p => state.log[p].tech !== TECH[p]);
    const placeMiss = ids().filter(id => c.place[id] !== ITEMS[id].place || c.reason[id] !== ITEMS[id].reason);
    const ch = choiceEval();
    const right = ids().filter(id => state.hyp.place[id] === ITEMS[id].place).length;
    const shouldPlace = right === ids().length ? 'confirmed' : right === 0 ? 'rejected' : 'partly';
    const shouldChoice = ch.best.includes(state.hyp.choice) ? 'confirmed' : 'rejected';
    return {
      sampleMiss, techMiss, placeMiss, ch, right, shouldPlace, shouldChoice,
      samples: sampleMiss.length === 0,
      techniques: techMiss.length === 0,
      places: placeMiss.length === 0,
      choice: ch.ok,
      conclusion: c.vPlace === shouldPlace && c.vChoice === shouldChoice
    };
  }

  const placeRight = id => LABELS.placeAnswer(nameOf(id), LABELS.placesIn[ITEMS[id].place], LABELS.reasons[ITEMS[id].reason]);
  const expectedText = p => {
    const { required } = expectedAt(p);
    return required.length ? LABELS.list(required.map(nameOf)) : LABELS.nothingFound;
  };
  const okOrList = (ok, good, miss, note) => (ok ? `<p class="dr-ok">${good}</p>`
    : `<ul class="dr-misslist">${miss.map(x => `<li class="dr-ko">${gloss(note(x))}</li>`).join('')}</ul>`);

  function choiceTableHTML(ev) {
    return `<table class="lab-table dr-choicetable"><thead><tr><th>${LABELS.upHead}</th><th>${LABELS.pollutionHead}</th><th>${LABELS.costHead}</th><th></th></tr></thead><tbody>` +
      [null].concat(UPGRADES).map(u => {
        const over = u && UP[u].cost > run.budget;
        const best = u ? ev.ch.best.includes(u) : ev.ch.best.includes('none');
        return `<tr class="${best ? 'is-best' : ''}"><th scope="row">${u ? LABELS.upgrades[u].name : LABELS.baseRow}</th><td>${pollutionOf(u)}</td>` +
          `<td class="${over ? 'dr-over' : ''}">${u ? LABELS.money(UP[u].cost) : '—'}</td>` +
          `<td>${u && !state.tests.includes(u) ? `<small class="dr-muted">${LABELS.notTested}</small>` : ''}</td></tr>`;
      }).join('') + `</tbody></table>`;
  }

  function criterionDetail(key, ev) {
    const c = state.concl;
    if (key === 'samples') {
      return okOrList(ev.samples, CHECK.samplesGood, ev.sampleMiss, p => CHECK.sampleWrong(LABELS.places[p], expectedText(p))) +
        `<ul class="dr-plainlist">${PLACES.map(p => `<li><strong>${LABELS.places[p]}</strong> · ${gloss(expectedText(p))}</li>`).join('')}</ul>` +
        `<p class="dr-muted">${gloss(EXPLAIN.samples)}${run.weather === 'storm' ? ` ${gloss(EXPLAIN.storm)}` : ''}</p>`;
    }
    if (key === 'techniques') {
      return okOrList(ev.techniques, CHECK.techGood, ev.techMiss, p => CHECK.techWrong(LABELS.places[p], LABELS.techs[TECH[p]])) +
        `<ul class="dr-plainlist">${POSTS.map(p => `<li><strong>${LABELS.places[p]}</strong> · ${gloss(EXPLAIN.posts[p])}</li>`).join('')}</ul>`;
    }
    if (key === 'places') {
      return okOrList(ev.places, CHECK.placesGood, ev.placeMiss, id => `${CHECK.answerWrong} ${placeRight(id)}`) +
        `<ul class="dr-plainlist">${ids().map(id => `<li><strong>${gloss(nameOf(id))}</strong> · ${gloss(EXPLAIN.items[id])}</li>`).join('')}</ul>`;
    }
    if (key === 'choice') {
      const best = ev.ch.best;
      const bestText = best.includes('none') ? CHECK.bestNone(pollutionOf(null) === 0) : CHECK.best(LABELS.list(best.map(u => LABELS.upgrades[u].name)));
      const notes = [];
      if (!ev.ch.rightChoice) notes.push(CHECK.choiceWrong);
      if (!ev.ch.tested) notes.push(CHECK.notTestedNote);
      if (!ev.ch.because) notes.push(CHECK.becauseWrong(c.choice === 'none' ? '' : explainUpgrade(c.choice)));
      return (ev.ch.ok ? `<p class="dr-ok">${CHECK.choiceGood}</p>` : `<ul class="dr-misslist">${notes.map(n => `<li class="dr-ko">${gloss(n)}</li>`).join('')}</ul>`) +
        `<p><strong>${gloss(bestText)}</strong></p>${choiceTableHTML(ev)}` +
        `<p class="dr-muted">${gloss(EXPLAIN.choice)}</p>`;
    }
    const line = (label, mine, should) => `<p><strong>${label}</strong> · ` +
      (mine === should ? `<span class="dr-ok">${CHECK.verdictOk(LABELS.verdicts[should])}</span>` : `<span class="dr-ko">${CHECK.verdictWrong(LABELS.verdicts[should])}</span>`) + `</p>`;
    return line(LABELS.verdictPlace, c.vPlace, ev.shouldPlace) +
      `<p class="dr-muted">${CHECK.placedRight(ev.right, ids().length)}</p>` +
      line(LABELS.verdictChoice, c.vChoice, ev.shouldChoice) +
      `<p class="dr-q-head">${CHECK.yourHyps}</p><ul class="dr-plainlist">${hypTexts().map(t => `<li>${gloss(t)}</li>`).join('')}</ul>` +
      (ev.shouldPlace !== 'confirmed' || ev.shouldChoice === 'rejected' ? `<p class="dr-muted">${CHECK.rejectedNote}</p>` : '');
  }

  // Ce que fait l'amélioration, pour la note d'une justification fausse.
  function explainUpgrade(u) {
    const items = reducedBy(u);
    return CHECK.upgradeDoes(LABELS.upgrades[u].name, items.length ? LABELS.list(items.map(nameOf)) : CHECK.nothingToday,
      LABELS.hows[UP[u].how], LABELS.list(UP[u].price.map(p => LABELS.prices[p])));
  }

  const hypTexts = () => ids().map(id => LABELS.hypPlace(nameOf(id), state.hyp.place[id] ? LABELS.placesIn[state.hyp.place[id]] : '—'))
    .concat(LABELS.hypChoice(state.hyp.choice ? LABELS.upgrades[state.hyp.choice].name : '—'));

  function renderCheck() {
    const ev = evaluate();
    const score = CRITERIA.filter(k => ev[k]).length;
    const rows = CRITERIA.map(k => `<button type="button" class="dr-crit ${ev[k] ? 'is-ok' : 'is-ko'} ${state.selected === k ? 'is-selected' : ''}" data-crit="${k}">` +
      `<span class="dr-crit-text"><strong>${LABELS.criteria[k]}</strong><small>${LABELS.criteriaSub[k]}</small></span>` +
      `<span class="dr-crit-mark" aria-label="${ev[k] ? LABELS.markCorrect : LABELS.markIncorrect}">${ev[k] ? '✓' : '✗'}</span></button>`).join('');

    lab.body.innerHTML = `<div class="dr-check">` +
      `<div class="dr-check-left">` +
        `<div class="lab-score"><span class="lab-score-num">${score}<small> / ${CRITERIA.length}</small></span><span class="lab-score-label">${LABELS.scoreLabel}</span></div>` +
        `<div class="dr-crit-list">${rows}</div>` +
        `<div class="dr-reminder">${questionsHTML()}</div>` +
      `</div>` +
      `<div class="dr-check-detail" aria-live="polite"><h3>${LABELS.criteria[state.selected]}</h3>${criterionDetail(state.selected, ev)}</div>` +
      `</div>`;

    $$('[data-crit]').forEach(btn => btn.addEventListener('click', () => {
      state.selected = btn.dataset.crit;
      renderCheck();
    }));
    lab.fillSpace($('.dr-check-detail'));
    lab.checkFooter();
  }

  /* ===== Rapport imprimable : contenu des 7 sections de la fiche outil FO3
     (en-tête, numérotation et mise en page : cadre commun) =====
     Les erreurs passent par mark() (lab-engine.js) : journal, techniques,
     destinations, choix, jugements. */
  const plainText = text => String(text).replace(/\[([^\]|]+)(?:\|[^\]]+)?\]/g, '$1');

  function buildReport(mark) {
    const R = LABELS.report;
    const ev = evaluate();
    const c = state.concl;
    const word = (text, ok, note) => (ok ? text : mark(text, plainText(note)));

    const logRows = PLACES.map(p => {
      const r = state.log[p];
      const said = r.none ? LABELS.nothingFound : r.found.length ? LABELS.list(r.found.map(nameOf)) : '—';
      const foundCell = rowWrong(p) ? mark(plainText(said), plainText(CHECK.sampleWrong(LABELS.places[p], expectedText(p))), { box: true }) : plainText(said);
      const tech = p === 'river' ? '—' : r.tech
        ? word(LABELS.techs[r.tech], r.tech === TECH[p], `${CHECK.answerWrong} ${LABELS.techs[TECH[p]]}. ${EXPLAIN.posts[p]}`) : '—';
      return `<tr><th>${plainText(LABELS.places[p])}</th><td>${foundCell}</td><td>${tech}</td></tr>`;
    }).join('');
    const dis = ids().filter(id => DISSOLVED.includes(id));
    const analysis = `<p>${R.analysis}: ${dis.length ? dis.map(id => `${plainText(LABELS.analytes[id])} — ${LABELS.levels[riverLevel(id)]}`).join(' ; ') : plainText(LABELS.analysisNothing)}</p>`;
    const tests = `<table class="dr-report-table"><caption>${LABELS.resultsCaption}</caption><tr><th>${LABELS.upHead}</th><th>${LABELS.pollutionHead}</th><th>${LABELS.costHead}</th><th>${LABELS.energyHead}</th></tr>` +
      [null].concat(state.tests).map(u => `<tr><th>${u ? LABELS.upgrades[u].name : LABELS.baseRow}</th><td>${pollutionOf(u)}</td>` +
        `<td>${u ? LABELS.money(UP[u].cost) : '—'}</td><td>${u ? LABELS.energy(LABELS.num(UP[u].energy)) : '—'}</td></tr>`).join('') + `</table>`;
    const obs = `<p>${plainText(LABELS.today(LABELS.weather[run.weather], LABELS.num(VOLUME[run.weather])))}</p>` +
      `<p>${R.items}: ${run.items.map(({ id, amt }) => `${plainText(nameOf(id))} (${LABELS.amounts[amt]})`).join(', ')}.</p>` +
      `<table class="dr-report-table"><caption>${LABELS.logTitle}</caption><tr><th>${LABELS.placeHead}</th><th>${R.foundHead}</th><th>${LABELS.techHead}</th></tr>${logRows}</table>` +
      analysis + tests;

    const interp = `<ul>${ids().map(id => {
      const note = `${CHECK.answerWrong} ${placeRight(id)} ${EXPLAIN.items[id]}`;
      return `<li>${LABELS.placeAnswer(plainText(nameOf(id)),
        c.place[id] ? word(LABELS.placesIn[c.place[id]], c.place[id] === ITEMS[id].place, note) : '—',
        c.reason[id] ? word(LABELS.reasons[c.reason[id]], c.reason[id] === ITEMS[id].reason, note) : '—')}</li>`;
    }).join('')}</ul>`;

    const ch = ev.ch;
    let choiceText;
    if (c.choice === 'none') {
      choiceText = LABELS.choiceLead(LABELS.upgrades.none.name) + ' ' + LABELS.noneAnswer(c.noneWhy ? LABELS.noneWhy[c.noneWhy] : '—');
    } else if (c.choice) {
      choiceText = `${LABELS.choiceLead(LABELS.upgrades[c.choice].name)} ${LABELS.choiceAnswer(LABELS.upgrades[c.choice].name, c.item ? plainText(nameOf(c.item)) : '—', c.why ? LABELS.reasons[c.why] : '—')} ` +
        `${LABELS.howAnswer(c.how ? LABELS.hows[c.how] : '—')} ${LABELS.priceAnswer(c.price ? LABELS.prices[c.price] : '—')}`;
    } else choiceText = '—';
    const bestText = ch.best.includes('none') ? CHECK.bestNone(pollutionOf(null) === 0) : CHECK.best(LABELS.list(ch.best.map(u => LABELS.upgrades[u].name)));
    const choiceNotes = [];
    if (!ch.rightChoice) choiceNotes.push(`${CHECK.choiceWrong} ${bestText}`);
    if (!ch.tested) choiceNotes.push(CHECK.notTestedNote);
    if (!ch.because) choiceNotes.push(CHECK.becauseWrong(c.choice === 'none' || !c.choice ? '' : explainUpgrade(c.choice)));
    const choiceHTML = `<p>${choiceNotes.length ? mark(plainText(choiceText), plainText(choiceNotes.join(' ')), { box: true }) : plainText(choiceText)}</p>`;
    const verdicts = `<ul><li>${R.verdict(LABELS.verdictPlace, c.vPlace ? word(LABELS.verdicts[c.vPlace], c.vPlace === ev.shouldPlace, CHECK.verdictWrong(LABELS.verdicts[ev.shouldPlace])) : '—')}</li>` +
      `<li>${R.verdict(LABELS.verdictChoice, c.vChoice ? word(LABELS.verdicts[c.vChoice], c.vChoice === ev.shouldChoice, CHECK.verdictWrong(LABELS.verdicts[ev.shouldChoice])) : '—')}</li></ul>`;

    const hyp = `<ul>${hypTexts().map(t => `<li>${plainText(t)}</li>`).join('')}</ul>` +
      (state.because.trim() ? `<p>${R.because}: ${escapeHtml(state.because.trim())}</p>` : '');
    const correction = CRITERIA.map(k => `<tr><th>${LABELS.criteria[k]}</th><td class="${ev[k] ? 'ok' : 'ko'}">${ev[k] ? '✓' : '✗'}</td></tr>`).join('');

    return {
      title: R.title,
      sections: [
        `<p>${plainText(LABELS.bigQuestion)}</p><ol>${LABELS.subQuestions.map(q => `<li>${plainText(q)}</li>`).join('')}</ol>`,
        hyp,
        `<p>${R.materials}</p>`,
        `<ol>${R.procedure.map(s => `<li>${s}</li>`).join('')}</ol>`,
        obs,
        interp,
        choiceHTML + verdicts
      ],
      correction: `<p><strong>${R.score(CRITERIA.filter(k => ev[k]).length)}</strong></p><table class="dr-report-corr">${correction}</table>`
    };
  }

  const isObj = o => !!o && typeof o === 'object' && !Array.isArray(o);

  /* Page d'accueil (mission, voir lab-engine.js) : le plan de la station,
     vide et sans la météo du jour, le gobelet, et ce que regarde la
     correction (les critères du Check). Rien du tirage. */
  function briefing() {
    return {
      heading: LABELS.briefTitle,
      intro: `${gloss(LABELS.intro)} ${gloss(LABELS.briefTask)}`,
      questionTitle: LABELS.yourQuestion,
      question: questionsHTML(),
      art: `<div class="dr-plan dr-brief-plan">${planSVG({ water: 0, dep: 0, stormOn: false, plain: true })}${zonesHTML()}</div>`,
      steps: LABELS.briefSteps.map((text, i) => ({
        text: gloss(text),
        art: i === 1 ? `<span class="dr-brief-item">${cupSVG()}<span>${LABELS.cupBtn}</span></span>` : ''
      })),
      checks: CRITERIA.map(k => LABELS.criteria[k])
    };
  }

  lab = LabEngine.create({
    id: 'drain',
    title: LABELS.title,
    glossary: GLOSSARY,
    reset,
    stepComplete,
    lockReason,
    isStarted: () => !!(state.hyp.choice || Object.keys(state.hyp.place).length || state.started),
    render: { 1: renderPredict, 2: renderExperiment, 3: renderConclude, 4: renderCheck },
    briefing,
    report: buildReport,
    version: 1,
    save: () => ({ run, state }),
    load(data) {
      const r = data.run, s = data.state;
      if (!r || !Array.isArray(r.items) || r.items.length !== 4 || !r.items.every(it => it && ITEMS[it.id] && [1, 2, 3].includes(it.amt)) ||
        !VOLUME[r.weather] || !BUDGETS.includes(r.budget) || !s || !isObj(s.hyp) || !isObj(s.hyp.place) || !isObj(s.day) || typeof s.day.t !== 'number' ||
        !isObj(s.sampled) || !isObj(s.log) || !PLACES.every(p => isObj(s.log[p]) && Array.isArray(s.log[p].found)) ||
        !Array.isArray(s.tests) || !s.tests.every(u => UP[u]) || !isObj(s.concl) || !isObj(s.concl.place) || !isObj(s.concl.reason)) throw new Error('labProgress');
      run = r;
      state = s;
      if (!['station', 'tests'].includes(state.view)) state.view = 'station';
      if (!CRITERIA.includes(state.selected)) state.selected = 'samples';
      transient();
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
          items: ids().join('-'),
          weather: run.weather,
          choice: state.concl.choice || '-',
          best: bestChoices().join('-')
        }
      };
    }
  });
})();
