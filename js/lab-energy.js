/* ===== Labo virtuel « The energy test bench » (phys1) : où va l'énergie ? =====

   Simulation propre à ce labo, commune aux deux filières ; ses textes sont
   dans le dossier du chapitre, un fichier par langue (lab-energy.en.js,
   lab-energy.nl.js). Le cadre commun (modale, barre d'étapes, verrous,
   traduction, glisser-déposer, rapport imprimé) est dans lab-engine.js.
   Ordre de chargement : moteur, textes, ce fichier.

   Le chapitre n'a pas de labo réel (confirmé par l'enseignant) : ce banc
   d'essai part du cours (bilan d'énergie en « units », diagramme de flux
   d'énergie avec flèches rouges pour l'énergie perdue). Une dynamo à
   manivelle allume une lampe ; trois instruments mesurent l'énergie en units
   à cinq endroits. Simplification dite à l'élève au Check : une vraie caméra
   thermique donne des températures, pas de l'énergie.

   Tirés au sort : la paire de lampes parmi trois (LED, halogène, classique)
   et leur ordre, la formulation de la question 1 (plus de lumière, ou plus
   d'énergie perdue : la LED n'est pas toujours la bonne case), les pertes de
   la dynamo et la part de lumière de chaque lampe. Chaque essai fait 100
   units tout juste ; la dynamo est la même pour les deux lampes.

   Déroulé :
     1. Predict    — deux phrases d'hypothèse à compléter (+ « because » libre)
     2. Experiment — a) le banc : visser une lampe, tourner la manivelle
                     jusqu'à 100 units (au doigt ; à la souris, un clic la
                     fait tourner seule ; le banc s'arrête : même énergie
                     pour les deux lampes ; la chaleur se voit monter de la
                     dynamo et de la lampe), mesurer chacun des cinq points
                     numérotés avec le bon instrument (pris en main, voir
                     makeDraggable hold), noter chaque valeur dans le
                     tableau, rangé par machine (ce qu'elle reçoit, ce
                     qu'elle donne) ; la même chose avec l'autre lampe ;
                     b) les deux diagrammes de flux d'énergie côte à côte :
                     l'élève remplit celui de la première lampe, le second
                     reprend ses formes ; les flèches prennent la largeur des
                     valeurs du tableau
     3. Conclude   — question 1 ; bilan guidé (l'énergie du début, celles de
                     la fin, choisies parmi les cinq flèches ; l'addition se
                     pose avec les valeurs du tableau, l'élève écrit le
                     total), question 2 et ce que devient le reste ; jugement
                     de chaque hypothèse
     4. Check      — 5 vérifications : mesures, formes d'énergie, bilan,
                     conclusions, hypothèses ; rapport (FO3) */

(function () {
  'use strict';

  const { escapeHtml, pick, shuffle, reduceMotion } = LabEngine.util;

  // Cadre commun, créé en fin de fichier (LabEngine.create).
  let lab;
  const $ = sel => lab.$(sel);
  const $$ = sel => lab.$$(sel);
  const gloss = text => lab.gloss(text);

  /* ===== Textes =====
     Dans le dossier du chapitre, un fichier par langue (lab-energy.en.js,
     lab-energy.nl.js), chargé avant celui-ci. */
  const {
    labels: LABELS, glossary: GLOSSARY, explanations: EXPLAIN, check: CHECK
  } = LabEngine.textFor('energy');

  /* ===== Modèle =====
     Points de mesure, numérotés de gauche à droite sur le banc, dans l'ordre
     du tableau : l'axe de la manivelle (mécanique, 100), la dynamo
     (thermique, perdue), les fils (électrique), la lampe (thermique,
     perdue), devant la lampe (lumière). Énergie à la fin : les deux énergies
     thermiques et la lumière. */
  const START = 100;
  const TURNS = 3;            // tours de manivelle pour donner 100 units
  const SPOTS = ['crank', 'dynamo', 'wires', 'lamp', 'light'];
  const SPOT_TOOL = { crank: 'meter', dynamo: 'camera', wires: 'meter', light: 'lightmeter', lamp: 'camera' };
  const TOOLS = ['meter', 'lightmeter', 'camera'];
  const FORMS = ['chemical', 'mechanical', 'thermal', 'electrical', 'light', 'nuclear'];
  const BOX_FORM = { crank: 'mechanical', dynamo: 'thermal', wires: 'electrical', light: 'light', lamp: 'thermal' };
  const END_ROWS = ['dynamo', 'lamp', 'light'];
  const AMOUNTS = ['more', 'same', 'less'];
  const FATES = ['air', 'destroyed', 'stored'];
  const REST_FORMS = FORMS.filter(f => f !== 'light');
  const VALUES_TOTAL = SPOTS.length * 2;
  const spotNum = s => SPOTS.indexOf(s) + 1;   // numéro du point, sur le banc et dans le tableau
  // Le tableau, par machine : ce qu'elle reçoit (in), ce qu'elle donne (out).
  // Les fils sont donnés par la dynamo et reçus par la lampe (même valeur).
  const MACHINES = [
    { id: 'dynamo', rows: [['in', 'crank'], ['out', 'dynamo'], ['out', 'wires']] },
    { id: 'lamp', rows: [['in', 'wires'], ['out', 'lamp'], ['out', 'light']] }
  ];

  /* eff : part de l'énergie électrique qui devient lumière (ordres de
     grandeur des manuels) ; rank : la lampe qui donne le plus de lumière.
     glass, glow, bright : la lampe allumée pendant qu'on tourne. */
  const LAMPS = {
    led: { rank: 3, eff: [0.28, 0.35], glass: '#fffef2', glow: '#fff3c4', bright: 1 },
    halogen: { rank: 2, eff: [0.08, 0.1], glass: '#fff3cf', glow: '#ffe08a', bright: 0.5 },
    traditional: { rank: 1, eff: [0.04, 0.06], glass: '#ffe6ad', glow: '#ffc861', bright: 0.32 }
  };
  const PAIRS = [['led', 'traditional'], ['led', 'halogen'], ['halogen', 'traditional']];

  /* Tirage : pertes de la dynamo entre 30 et 42 units, lumière de chaque
     lampe dans sa fourchette ; au moins 2 units d'écart de lumière entre
     les deux lampes (halogène et classique sont proches), sinon on retire. */
  function draw() {
    const pair = shuffle(pick(PAIRS));
    const ask = Math.random() < 0.5 ? 'light' : 'waste';
    const [hi, lo] = pair.slice().sort((x, y) => LAMPS[y].rank - LAMPS[x].rank);
    for (;;) {
      const heat = 30 + Math.floor(Math.random() * 13);
      const elec = START - heat;
      const readings = {};
      pair.forEach(k => {
        const [a, b] = LAMPS[k].eff;
        const light = Math.max(1, Math.round(elec * (a + Math.random() * (b - a))));
        readings[k] = { crank: START, dynamo: heat, wires: elec, light, lamp: elec - light };
      });
      if (readings[hi].light - readings[lo].light >= 2) return { pair, ask, readings };
    }
  }

  let run;      // tirage : lampes, question 1, lectures des instruments
  let state;    // travail de l'élève

  function reset() {
    run = draw();
    state = {
      hyp: { h1: null, h2: null },   // h1 : une lampe ; h2 : more, same ou less
      because: '',
      socket: null,                  // lampe vissée dans la douille
      energy: {},                    // units données par la manivelle, par lampe
      measured: {},                  // { lampe: { point: true } }
      values: {},                    // { lampe: { point: nombre } } notés par l'élève
      view: 'bench',                 // 'bench' ou 'diagram'
      forms: {},                     // { point: forme } cases du diagramme
      // start : le point choisi pour l'énergie du début ; ends : ceux de la fin
      concl: { q1: null, start: null, ends: [], totals: {}, q2: null, rest: null, fate: null, v1: null, v2: null },
      selected: 'measures'
    };
    run.pair.forEach(k => { state.energy[k] = 0; state.measured[k] = {}; state.values[k] = {}; });
    glow = 0;
    crankAngle = 0;
    stepperDone = null;
    heldTool = null;
    heldForm = null;
  }

  const plain = text => String(text).replace(/\[([^\]|]+)(?:\|[^\]]+)?\]/g, '$1');
  const other = k => (run.pair[0] === k ? run.pair[1] : run.pair[0]);
  const tested = k => state.energy[k] >= START;
  const started = () => run.pair.some(k => state.energy[k] > 0);
  const written = (k, s) => state.values[k][s] != null;
  const valuesWritten = () => run.pair.reduce((n, k) => n + SPOTS.filter(s => written(k, s)).length, 0);
  const valuesComplete = () => valuesWritten() === VALUES_TOTAL;
  const formsPlaced = () => SPOTS.filter(s => state.forms[s]).length;
  const lampName = k => LABELS.lamps[k].name;
  // Réponse absente (étapes ouvertes par le bouton des enseignants) : un tiret.
  const lampThe = k => (k ? LABELS.lamps[k].the : '—');
  const amountOf = x => (x ? LABELS.amounts[x] : '—');

  function bestLamp() {
    const [a, b] = run.pair;
    return LAMPS[a].rank > LAMPS[b].rank ? a : b;
  }

  // Bonne réponse à la question 1 : selon la formulation tirée.
  function truth1() { return run.ask === 'light' ? bestLamp() : other(bestLamp()); }

  /* ===== Dessins =====
     Ampoule : viewBox 60 × 90, verre centré en (30, 32), culot de 64 à 86.
     ids : préfixe des éléments que la scène allume pendant qu'on tourne. */
  const PEAR = 'M30,6 C15,6 6,18 6,32 C6,42 12,48 18,54 C21,57 22,60 22,64 L38,64 C38,60 39,57 42,54 C48,48 54,42 54,32 C54,18 45,6 30,6 Z';
  const DOME = 'M30,6 C15,6 6,18 6,32 C6,38 8,42 11,45 L49,45 C52,42 54,38 54,32 C54,18 45,6 30,6 Z';
  const GLASS_OFF = '#f2f6f9';
  const WIRE_OFF = '#8a95a1';
  const WIRE_ON = '#f29d00';

  function bulbSVG(k, ids) {
    const id = name => (ids ? ` id="${ids}-${name}"` : '');
    const base = `<rect x="21" y="64" width="18" height="15" rx="2" fill="#b9c1ca" stroke="#8a95a1"/>` +
      `<path d="M21,68 H39 M21,72 H39 M21,76 H39" stroke="#8a95a1" stroke-width="1"/>` +
      `<path d="M24,79 H36 L33,86 H27 Z" fill="#5d6773"/>`;
    if (k === 'led') {
      return `<path${id('glass')} d="${DOME}" fill="${GLASS_OFF}" stroke="#a9b3bd" stroke-width="1.5"/>` +
        `<rect x="18" y="35" width="24" height="8" rx="2.5" fill="#dfe4e9"/>` +
        [21, 28, 35].map(x => `<rect x="${x}" y="37" width="4" height="4" rx="0.8" fill="#f2c94c"/>`).join('') +
        `<path d="M11,45 L49,45 L41,64 L19,64 Z" fill="#e4e8ec" stroke="#a9b3bd" stroke-width="1.5"/>` +
        `<path d="M15,50 H45 M17,55 H43 M19,60 H41" stroke="#c4ccd4" stroke-width="1.2"/>` + base;
    }
    const capsule = k === 'halogen'
      ? `<rect x="24" y="22" width="12" height="27" rx="5" fill="#ffffff" fill-opacity="0.6" stroke="#b5bec8" stroke-width="1.2"/>` +
        `<path d="M27,63 L27.5,40 M33,63 L32.5,40" stroke="#8a95a1" stroke-width="1.1" fill="none"/>` +
        `<path${id('fil')} d="M27.5,40 l1,-3 l1,3 l1,-3 l1,3 l1,-3" stroke="${WIRE_OFF}" stroke-width="1.3" fill="none" stroke-linejoin="round"/>`
      : `<path d="M26,63 L27,36 M34,63 L33,36" stroke="#8a95a1" stroke-width="1.2" fill="none"/>` +
        `<path${id('fil')} d="M27,36 l1.5,-3 l1.5,3 l1.5,-3 l1.5,3 l1.5,-3" stroke="${WIRE_OFF}" stroke-width="1.4" fill="none" stroke-linejoin="round"/>`;
    return `<path${id('glass')} d="${PEAR}" fill="${GLASS_OFF}" stroke="#a9b3bd" stroke-width="1.5"/>` + capsule + base;
  }

  function lampIcon(k) {
    return `<svg class="eb-lamp-icon" viewBox="0 0 60 90" aria-hidden="true" focusable="false">${bulbSVG(k)}</svg>`;
  }

  const TOOL_ICONS = {
    meter: `<svg class="eb-tool-icon" viewBox="0 0 40 40" aria-hidden="true" focusable="false">` +
      `<path d="M14,30 v6 M26,30 v6" stroke-width="2.4" stroke-linecap="round" stroke="#2c3440"/><path d="M26,30 v6" stroke="#d64545" stroke-width="2.4" stroke-linecap="round"/>` +
      `<rect x="6" y="5" width="28" height="26" rx="5" fill="#2f3b4a"/><rect x="10" y="9" width="20" height="9" rx="2" fill="#bff2c9"/>` +
      `<path d="M13,13.5 h4 M19,13.5 h4 M25,13.5 h2" stroke="#2f6b3c" stroke-width="2"/>` +
      `<circle cx="15" cy="24" r="2.2" fill="#8fa3b8"/><circle cx="25" cy="24" r="2.2" fill="#8fa3b8"/></svg>`,
    lightmeter: `<svg class="eb-tool-icon" viewBox="0 0 40 40" aria-hidden="true" focusable="false">` +
      `<path d="M20,1.5 v3.5 M9.5,5.5 l2.4,2.4 M30.5,5.5 l-2.4,2.4" stroke="#e0a800" stroke-width="2" stroke-linecap="round"/>` +
      `<path d="M12.5,14 a7.5,7.5 0 0 1 15,0 Z" fill="#fff1b0" stroke="#c9a227" stroke-width="1.4"/>` +
      `<rect x="9" y="14" width="22" height="24" rx="5" fill="#3a3f47"/><rect x="13" y="19" width="14" height="7" rx="1.5" fill="#fff6cf"/>` +
      `<circle cx="20" cy="32" r="2.2" fill="#8f949c"/></svg>`,
    camera: `<svg class="eb-tool-icon" viewBox="0 0 40 40" aria-hidden="true" focusable="false">` +
      `<path d="M15,25 h10 l-2,12 h-6 z" fill="#4a5563"/>` +
      `<rect x="5" y="5" width="30" height="21" rx="4" fill="#2f3b4a"/><rect x="8" y="8" width="24" height="15" rx="2" fill="#3b4cc0"/>` +
      `<circle cx="20" cy="15.5" r="6" fill="#a03fb5"/><circle cx="20" cy="15.5" r="4" fill="#f08a24"/><circle cx="20" cy="15.5" r="1.8" fill="#ffe14d"/></svg>`
  };

  /* ===== Étapes complètes (progression stricte, voir lab-engine.js) =====
     1 : les deux hypothèses ; 2 : les 10 valeurs du tableau et les 5 cases
     du diagramme ; 3 : toutes les questions de la conclusion. */
  function stepComplete(n) {
    if (n === 1) return !!(state.hyp.h1 && state.hyp.h2);
    if (n === 2) return valuesComplete() && formsPlaced() === SPOTS.length;
    return conclusionsComplete();
  }

  function lockReason(n) {
    if (n === 1) return LABELS.lockHypothesis;
    if (n === 2) {
      const left = VALUES_TOTAL - valuesWritten();
      return left ? LABELS.lockValues(left) : LABELS.lockForms(SPOTS.length - formsPlaced());
    }
    return lab.L.missingConclusions;
  }

  function questionsHTML() {
    return `<ol class="eb-questions"><li>${gloss(LABELS.questions[run.ask])}</li><li>${gloss(LABELS.questions.end)}</li></ol>`;
  }

  const blankHTML = text => (text ? `<span class="eb-blank is-filled">${text}</span>` : `<span class="eb-blank">……………</span>`);

  /* ===== Étape 1 : hypothèses ===== */
  function renderPredict() {
    const h = state.hyp;
    const [a, b] = run.pair;
    const miss = key => (lab.state.showMissing && !h[key] ? 'lab-is-missing' : '');
    const chip = (key, val, label, icon) => `<button type="button" class="lab-choice eb-choice ${h[key] === val ? 'is-selected' : ''}" data-hyp="${key}" data-val="${val}" aria-pressed="${h[key] === val}">${icon || ''}<span>${label}</span></button>`;

    lab.body.innerHTML = `<div class="eb-predict">` +
      `<div class="eb-question-card">` +
        `<p class="eb-kicker">${LABELS.yourQuestions}</p>${questionsHTML()}` +
        `<p class="eb-lampsline"><span class="eb-lampsline-icons">${lampIcon(a)}${lampIcon(b)}</span><span>${gloss(LABELS.lampsLine(lampThe(a), lampThe(b)))}</span></p>` +
      `</div>` +
      `<div class="eb-hyp-card">` +
        `<p class="eb-kicker">${LABELS.hypothesisTitle}</p>` +
        `<div class="eb-hyp ${miss('h1')}"><span class="eb-num" aria-hidden="true">1</span><div>` +
          `<p class="eb-sentence">${gloss(LABELS.hyp1[run.ask](blankHTML(h.h1 && lampThe(h.h1))))}</p>` +
          `<div class="eb-choices">${run.pair.map(k => chip('h1', k, lampThe(k), lampIcon(k))).join('')}</div></div></div>` +
        `<div class="eb-hyp ${miss('h2')}"><span class="eb-num" aria-hidden="true">2</span><div>` +
          `<p class="eb-sentence">${gloss(LABELS.hyp2(blankHTML(h.h2 && LABELS.amounts[h.h2])))}</p>` +
          `<div class="eb-choices">${AMOUNTS.map(x => chip('h2', x, LABELS.amounts[x])).join('')}</div></div></div>` +
        `<label class="eb-because"><span>${LABELS.because}</span>` +
        `<input type="text" class="lab-input eb-because-input" maxlength="160" placeholder="${LABELS.becausePlaceholder}" value="${escapeHtml(state.because)}" autocomplete="off"></label>` +
      `</div></div>`;

    $$('[data-hyp]').forEach(btn => btn.addEventListener('click', () => {
      h[btn.dataset.hyp] = btn.dataset.val;
      renderPredict();
      lab.renderStepper();
    }));
    const because = $('.eb-because-input');
    because.addEventListener('input', e => { state.because = e.target.value; });
    // Hypothèses figées dès le premier tour de manivelle.
    if (started()) {
      $$('[data-hyp]').forEach(btn => lab.setLock(btn, LABELS.lockHypothesisFixed, { icon: false }));
      because.readOnly = true;
      lab.setLock(because, LABELS.lockHypothesisFixed);
    }

    const ready = h.h1 && h.h2;
    const info = lab.state.showMissing && !ready ? lab.footerInfo(LABELS.lockHypothesis, true)
      : lab.footerInfo(ready ? LABELS.hypothesisReady : LABELS.hypothesisPending);
    lab.setFooter(info + `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-next>${LABELS.toBench} →</button></div>`);
    const next = $('[data-next]');
    next.addEventListener('click', () => lab.goToStep(2));
    lab.setLock(next, ready ? null : LABELS.lockHypothesis, { missing: true, key: 'next' });
  }

  /* ===== Étape 2 : le banc d'essai et le diagramme =====
     Deux vues (onglets) : le banc, avec le tableau à droite ; puis les deux
     diagrammes de flux, côte à côte sur toute la largeur, qui s'ouvrent une
     fois le tableau complet. */
  let stepperDone = null;
  let heldTool = null;   // instrument en main (makeDraggable, hold)
  let heldForm = null;   // forme d'énergie en main

  function renderExperiment() {
    lab.release();
    // Ce qui manque est signalé dans la vue où il se trouve.
    if (lab.state.showMissing && !lab.isFrozen()) {
      if (!valuesComplete()) state.view = 'bench';
      else if (formsPlaced() < SPOTS.length) state.view = 'diagram';
    }
    const diagram = state.view === 'diagram';
    lab.body.innerHTML = `<div class="eb-run ${diagram ? 'is-diagram' : ''}">` +
      `<section class="eb-main">` +
        tabsHTML() +
        `<div class="lab-scene-wrap eb-scene-wrap" data-stage>` +
          (diagram ? diagramStageHTML() : benchSVG()) + `</div>` +
        `<p class="lab-caption" data-caption aria-live="polite"></p>` +
        `<div class="eb-kit">${diagram ? paletteHTML() : kitHTML()}</div>` +
      `</section>` +
      (diagram ? '' : `<section class="eb-side">` +
        `<div class="eb-side-head"><h3 class="lab-panel-title">${LABELS.tableTitle}</h3><span class="eb-unit">${LABELS.tableUnit}</span></div>` +
        `<div class="lab-table-wrap eb-table-wrap">${tableHTML('run')}</div>` +
        `<div class="eb-reminder"><p class="eb-kicker">${LABELS.yourQuestions}</p>${questionsHTML()}</div>` +
      `</section>`) +
      `</div>`;

    bindTabs();
    if (diagram) bindDiagram();
    else { bindKit(); bindCrank(); bindTable(); }
    setCaption(defaultCaption());
    renderRunFooter();
    if (!diagram && glow > 0.01) startGlowLoop(lab.newScene());
  }

  function tabsHTML() {
    return `<div class="eb-tabs" role="tablist">` + ['bench', 'diagram'].map((v, i) =>
      `<button type="button" role="tab" class="eb-tab ${state.view === v ? 'is-on' : ''}" data-view="${v}" data-lab-look aria-selected="${state.view === v}">` +
      `<span class="eb-tab-num">${i + 1}</span><span>${LABELS.tabs[v]}</span></button>`).join('') + `</div>`;
  }

  function bindTabs() {
    $$('[data-view]').forEach(btn => btn.addEventListener('click', () => {
      if (state.view === btn.dataset.view) return;
      state.view = btn.dataset.view;
      renderExperiment();
    }));
    const tab = $('[data-view="diagram"]');
    if (state.view !== 'diagram' && !valuesComplete()) {
      lab.setLock(tab, LABELS.lockValues(VALUES_TOTAL - valuesWritten()), { missing: true, key: 'tab-diagram' });
    }
  }

  /* --- Le banc : viewBox 640 × 360, paillasse à y = 296 ---
     Dynamo à gauche (manivelle sur sa face), fils, lampe sur son support à
     droite. Cinq points de mesure numérotés comme les lignes du tableau,
     puis une étiquette par mesure faite. */
  const BENCH_Y = 296;
  const AXLE = { x: 132, y: 244 };
  const ARM = 44;
  const HINT_R = ARM + 20;             // flèche qui montre le geste, autour de la manivelle
  const LAMP_C = { x: 470, y: 192 };   // centre du verre
  const SPOT_POS = { crank: [132, 244], dynamo: [232, 222], wires: [366, 254], light: [574, 188], lamp: [470, 192] };
  const BADGE_POS = { crank: [100, 168], dynamo: [230, 168], wires: [366, 324], light: [580, 126], lamp: [470, 116] };
  // Ondulations de chaleur, en diagonale vers le haut à droite (comme les
  // flèches de l'énergie perdue du diagramme) : point de départ.
  const WAVES_POS = { dynamo: [176, 184], lamp: [492, 146] };

  let crankAngle = 0;   // radians, sens horaire à l'écran
  let glow = 0;         // éclat de la lampe pendant qu'on tourne (0 à 1)

  function wavesSVG(s) {
    const [x, y] = WAVES_POS[s];
    return `<g id="eb-waves-${s}" class="eb-waves" opacity="0" pointer-events="none" transform="translate(${x} ${y}) rotate(45)">` +
      [-13, 0, 13].map((dx, i) => `<path class="eb-wave" style="animation-delay:${(i * 0.45).toFixed(2)}s" d="M${dx},0 q-5,-6 0,-12 t0,-12 t0,-12"/>`).join('') +
      `</g>`;
  }

  function benchSVG() {
    const k = state.socket;
    const done = k && tested(k);
    const e = k ? state.energy[k] : 0;
    let out = `<svg viewBox="0 0 640 360" class="lab-svg eb-bench" preserveAspectRatio="xMidYMax meet" role="img" aria-label="${LABELS.scene.label}">` +
      `<defs><linearGradient id="eb-bench-g" gradientUnits="userSpaceOnUse" x1="0" y1="${BENCH_Y}" x2="0" y2="${BENCH_Y + 64}"><stop offset="0" stop-color="#efe6d6"/><stop offset="1" stop-color="#e3d6c0"/></linearGradient>` +
      `<radialGradient id="eb-heat"><stop offset="0" stop-color="#ff3b1f" stop-opacity="0.95"/><stop offset="0.5" stop-color="#ff9a1f" stop-opacity="0.6"/><stop offset="1" stop-color="#ffd64a" stop-opacity="0"/></radialGradient>` +
      (k ? `<radialGradient id="eb-glow-g"><stop offset="0" stop-color="${LAMPS[k].glow}" stop-opacity="0.95"/><stop offset="0.45" stop-color="${LAMPS[k].glow}" stop-opacity="0.45"/><stop offset="1" stop-color="${LAMPS[k].glow}" stop-opacity="0"/></radialGradient>` : '') +
      `</defs>` +
      // Plus large que le viewBox : la paillasse continue jusqu'aux bords.
      `<rect x="-1000" y="${BENCH_Y}" width="2640" height="400" fill="url(#eb-bench-g)"/>` +
      `<rect x="-1000" y="${BENCH_Y}" width="2640" height="3" fill="#d6c6aa"/>`;

    // Compteur d'énergie donnée
    out += `<g class="eb-counter ${done ? 'is-done' : ''}"><rect x="14" y="12" width="196" height="64" rx="12" fill="#1f2a37"/>` +
      `<text x="28" y="33" class="eb-counter-label">${done ? LABELS.scene.over : LABELS.scene.given}</text>` +
      `<text x="28" y="60" class="eb-counter-num"><tspan id="eb-count">${Math.floor(e + 1e-9)}</tspan><tspan class="eb-counter-max"> / ${START} ${LABELS.scene.units}</tspan></text>` +
      `<rect x="28" y="66" width="168" height="4" rx="2" fill="#3a4757"/>` +
      `<rect id="eb-bar" x="28" y="66" width="${(168 * e / START).toFixed(1)}" height="4" rx="2" fill="#5fd38a"/></g>`;

    // Lueur de la lampe (sous tout le reste)
    if (k) out += `<circle id="eb-glow" cx="${LAMP_C.x}" cy="${LAMP_C.y}" r="100" fill="url(#eb-glow-g)" opacity="${(glow * LAMPS[k].bright).toFixed(3)}"/>`;

    // Fils
    out += `<path d="M276,224 C340,224 384,260 457,262" fill="none" stroke="#d64545" stroke-width="4" stroke-linecap="round"/>` +
      `<path d="M276,250 C340,250 384,276 457,272" fill="none" stroke="#2c3440" stroke-width="4" stroke-linecap="round"/>`;

    // Dynamo
    out += `<ellipse cx="163" cy="${BENCH_Y + 2}" rx="112" ry="4" fill="#13243d" opacity="0.08"/>` +
      `<rect x="56" y="192" width="214" height="104" rx="16" fill="#4d6a8f"/>` +
      `<rect x="56" y="192" width="214" height="16" rx="10" fill="#ffffff" fill-opacity="0.14"/>` +
      `<path d="M204,214 v44 M214,214 v44 M224,214 v44 M234,214 v44 M244,214 v44" stroke="#3b5576" stroke-width="4" stroke-linecap="round"/>` +
      `<text x="226" y="283" text-anchor="middle" class="eb-dynamo-label">${LABELS.scene.dynamo}</text>` +
      `<rect x="268" y="217" width="10" height="14" rx="2" fill="#d64545"/><rect x="268" y="243" width="10" height="14" rx="2" fill="#2c3440"/>`;

    // Manivelle : disque, bras qui tourne, poignée. Tant qu'elle n'a pas
    // tourné, une flèche circulaire montre le geste et la poignée pulse.
    const ready = k && !done;
    out += `<circle cx="${AXLE.x}" cy="${AXLE.y}" r="24" fill="#b7c1cc" stroke="#7d8a97" stroke-width="1.5"/>` +
      `<g id="eb-arm" transform="rotate(${(crankAngle * 180 / Math.PI).toFixed(1)} ${AXLE.x} ${AXLE.y})">` +
        `<rect x="${AXLE.x - 5}" y="${AXLE.y - 5}" width="${ARM + 10}" height="10" rx="5" fill="#8d99a6" stroke="#5d6773" stroke-width="1.2"/>` +
        `<circle class="eb-handle ${ready && e === 0 ? 'is-ready' : ''}" cx="${AXLE.x + ARM}" cy="${AXLE.y}" r="11" fill="#c98a4b" stroke="#8a5a2b" stroke-width="1.5"/>` +
        `<circle cx="${AXLE.x + ARM - 3}" cy="${AXLE.y - 3}" r="3" fill="#ffffff" fill-opacity="0.35"/>` +
      `</g><circle cx="${AXLE.x}" cy="${AXLE.y}" r="7" fill="#5d6773"/>`;
    if (ready && e === 0) {
      const tx = AXLE.x - HINT_R, ty = AXLE.y;
      out += `<g id="eb-crank-hint" class="eb-crank-hint" pointer-events="none">` +
        `<path d="M${AXLE.x},${AXLE.y - HINT_R} A${HINT_R},${HINT_R} 0 1 1 ${tx},${ty}" fill="none" stroke-width="3" stroke-linecap="round" stroke-dasharray="7 6"/>` +
        `<path d="M${tx - 8},${ty + 2} L${tx},${ty - 11} L${tx + 8},${ty + 2} Z" class="eb-crank-hint-head"/></g>`;
    }

    // Support, douille et lampe
    out += `<ellipse cx="${LAMP_C.x}" cy="${BENCH_Y + 2}" rx="50" ry="4" fill="#13243d" opacity="0.08"/>` +
      `<rect x="426" y="280" width="88" height="16" rx="5" fill="#4f5a66"/>` +
      `<rect x="456" y="250" width="28" height="30" rx="4" fill="#8d98a5"/>` +
      `<path d="M456,258 H484 M456,266 H484" stroke="#6f7a87" stroke-width="1.5"/>`;
    if (k) {
      out += `<g transform="translate(${LAMP_C.x - 33} ${LAMP_C.y - 35.2}) scale(1.1)">${bulbSVG(k, 'eb-bulb')}</g>`;
    } else {
      out += `<g transform="translate(${LAMP_C.x - 33} ${LAMP_C.y - 35.2}) scale(1.1)"><path d="${PEAR}" fill="#ffffff" fill-opacity="0.5" stroke="#a87a20" stroke-opacity="0.6" stroke-width="1.6" stroke-dasharray="5 4"/></g>` +
        `<text x="${LAMP_C.x}" y="${LAMP_C.y + 5}" text-anchor="middle" class="eb-socket-label">${LABELS.scene.socket}</text>`;
    }

    // Chaleur qui monte pendant qu'on tourne (voir applyGlow)
    if (k) out += wavesSVG('dynamo') + wavesSVG('lamp');

    // Chaleur vue par la caméra thermique
    if (k) {
      ['dynamo', 'lamp'].forEach(s => {
        if (!state.measured[k][s]) return;
        const a = Math.min(0.65, Math.max(0.12, run.readings[k][s] / 100)).toFixed(2);
        out += s === 'dynamo'
          ? `<ellipse cx="180" cy="244" rx="100" ry="52" fill="url(#eb-heat)" opacity="${a}" pointer-events="none"/>`
          : `<circle cx="${LAMP_C.x}" cy="${LAMP_C.y}" r="46" fill="url(#eb-heat)" opacity="${a}" pointer-events="none"/>`;
      });
    }

    // Zone où déposer une lampe
    out += `<rect class="eb-socket" data-socket x="418" y="138" width="104" height="158" rx="14" fill="transparent"/>`;

    // Zone de la manivelle, à saisir (doigt) ou à cliquer (souris)
    out += `<circle class="eb-knob" data-knob cx="${AXLE.x}" cy="${AXLE.y}" r="${ARM + 18}" fill="transparent" tabindex="0" role="button" aria-label="${LABELS.scene.knob}"/>`;

    // Points de mesure (une fois le test fini), étiquettes des mesures faites
    if (done) {
      SPOTS.forEach(s => {
        if (state.measured[k][s]) out += badgeSVG(s, run.readings[k][s], s === freshBadge);
        else out += spotSVG(s);
      });
    }
    freshBadge = null;
    return out + `</svg>`;
  }

  let freshBadge = null;   // étiquette qui vient d'apparaître (animée une fois)

  function spotSVG(s) {
    const [x, y] = SPOT_POS[s];
    return `<g class="eb-spot" data-spot="${s}" tabindex="0" role="button" aria-label="${escapeHtml(LABELS.scene.spot(spotNum(s), LABELS.rows[s]))}">` +
      `<circle cx="${x}" cy="${y}" r="21" fill="transparent"/>` +
      `<circle class="eb-spot-ring" cx="${x}" cy="${y}" r="15"/>` +
      `<text class="eb-spot-num" x="${x}" y="${y + 5}" text-anchor="middle">${spotNum(s)}</text></g>`;
  }

  function badgeSVG(s, value, fresh) {
    const [x, y] = BADGE_POS[s];
    const [sx, sy] = SPOT_POS[s];
    return `<g class="eb-badge is-${SPOT_TOOL[s]} ${fresh ? 'is-fresh' : ''}">` +
      `<line class="eb-badge-line" x1="${sx}" y1="${sy}" x2="${x}" y2="${y}"/>` +
      `<circle class="eb-badge-pin" cx="${sx}" cy="${sy}" r="5"/>` +
      `<rect class="eb-badge-box" x="${x - 56}" y="${y - 15}" width="112" height="30" rx="8"/>` +
      `<circle class="eb-badge-n" cx="${x - 41}" cy="${y}" r="9"/>` +
      `<text class="eb-badge-n-text" x="${x - 41}" y="${y + 4}" text-anchor="middle">${spotNum(s)}</text>` +
      `<text class="eb-badge-text" x="${x + 8}" y="${y + 5}" text-anchor="middle"><tspan class="eb-badge-num">${value}</tspan> ${LABELS.scene.units}</text></g>`;
  }

  /* Lampes et instruments, sous le banc. Une lampe se glisse dans la
     douille (ou se touche) ; changer de lampe ne perd rien : chaque lampe
     garde son test et ses mesures. Un instrument se prend en main (clic ou
     toucher) puis se pose sur un point, ou se glisse ; sous son nom, ce
     qu'il mesure. Les instruments restent verrouillés tant que la lampe
     vissée n'a pas reçu ses 100 units. */
  function kitHTML() {
    const miss = lab.state.showMissing;
    const lamps = run.pair.map(k => {
      const isIn = state.socket === k;
      const status = isIn ? LABELS.lampState.socket : tested(k) ? LABELS.lampState.tested : '';
      const incomplete = SPOTS.some(s => !written(k, s));
      return `<button type="button" class="eb-item eb-lamp ${isIn ? 'is-in' : ''} ${miss && incomplete ? 'lab-is-missing' : ''}" data-lamp="${k}" data-lab-look>` +
        `<span class="eb-item-icon">${lampIcon(k)}</span>` +
        `<span class="eb-item-text"><strong>${lampName(k)}</strong><small>${status}</small></span>` +
        (tested(k) && !incomplete ? `<span class="eb-item-check" aria-hidden="true">✓</span>` : '') + `</button>`;
    }).join('');
    const tools = TOOLS.map(t => `<button type="button" class="eb-item eb-tool" data-tool="${t}" aria-pressed="false">` +
      `<span class="eb-item-icon">${TOOL_ICONS[t]}</span><span class="eb-item-text"><strong>${LABELS.tools[t]}</strong><small>${LABELS.toolsMeasure[t]}</small></span></button>`).join('');
    return `<div class="eb-group eb-group-lamps"><span class="eb-group-title">${LABELS.lampsTitle}</span><div class="eb-group-items">${lamps}</div></div>` +
      `<div class="eb-group eb-group-tools"><span class="eb-group-title">${LABELS.toolsTitle}</span><div class="eb-group-items">${tools}</div></div>`;
  }

  function bindKit() {
    $$('[data-lamp]').forEach(el => {
      const k = el.dataset.lamp;
      lab.makeDraggable(el, {
        ghost: () => `<div class="eb-ghost eb-ghost-lamp">${lampIcon(k)}</div>`,
        targets: () => [$('[data-socket]')],
        onDrop: () => insertLamp(k),
        onTap: () => insertLamp(k)
      });
    });
    const k = state.socket;
    const toolLock = !k ? LABELS.lockNoLamp : !tested(k) ? LABELS.lockTurnFirst : null;
    $$('[data-tool]').forEach(el => {
      const t = el.dataset.tool;
      lab.setLock(el, toolLock);
      lab.makeDraggable(el, {
        hold: true,
        ghost: () => `<div class="eb-ghost eb-ghost-tool">${TOOL_ICONS[t]}</div>`,
        targets: () => $$('[data-spot]'),
        onDrop: target => measure(t, target.dataset.spot),
        onHold: on => {
          heldTool = on ? t : null;
          el.setAttribute('aria-pressed', String(on));
          const stage = $('[data-stage]');
          if (stage) stage.classList.toggle('is-armed', on);
          setCaption(defaultCaption());
        }
      });
    });
    // Un point touché sans instrument en main (sinon le moteur l'a posé).
    $$('[data-spot]').forEach(el => {
      el.addEventListener('click', () => setCaption(LABELS.captionPickTool, true));
      el.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        setCaption(LABELS.captionPickTool, true);
      });
    });
  }

  function insertLamp(k) {
    if (state.socket === k) return;
    state.socket = k;
    glow = 0;
    crankAngle = 0;
    renderExperiment();
    if (tested(k)) setCaption(LABELS.captionAlready);
    lab.save();
  }

  // Un instrument posé sur un point : le bon donne sa lecture, un autre dit
  // ce qu'il mesure (sans donner la réponse).
  function measure(t, s) {
    const k = state.socket;
    if (!k) { setCaption(LABELS.captionNoLamp, true); return; }
    if (!tested(k)) { setCaption(LABELS.lockTurnFirst, true); return; }
    if (state.measured[k][s]) return;
    if (SPOT_TOOL[s] !== t) { setCaption(LABELS.wrongTool[t], true); return; }
    state.measured[k][s] = true;
    freshBadge = s;
    renderExperiment();
    const input = $(`[data-cell="${k}|${s}"]`);
    if (input && !written(k, s)) input.focus({ preventScroll: true });
    lab.save();
  }

  /* Manivelle. Au doigt (ou au stylet), le bras suit le doigt autour de
     l'axe ; l'énergie donnée compte l'angle parcouru, dans un sens comme
     dans l'autre (3 tours pour 100 units) ; plus on tourne vite, plus la
     lampe brille. À la souris (un pavé tactile tourne mal), un clic la fait
     tourner seule jusqu'au bout ; au clavier, Entrée ou Espace aussi, les
     flèches avancent d'un douzième de tour. À 100 units, le banc s'arrête :
     les deux lampes reçoivent exactement la même énergie. */
  const AUTO_SPEED = 2 * Math.PI * TURNS / 4500;   // rad/ms : 3 tours en 4,5 s
  let autoTurning = false;

  function bindCrank() {
    const knob = $('[data-knob]');
    if (!knob) return;
    const k = state.socket;
    lab.setLock(knob, !k ? LABELS.lockNoLamp : tested(k) ? LABELS.lockCrankDone : null, { icon: false });
    knob.addEventListener('pointerdown', e => {
      if (e.button !== 0 || !k || tested(k)) return;
      e.preventDefault();
      if (e.pointerType === 'mouse') { autoTurn(k); return; }
      if (autoTurning) return;
      knob.setPointerCapture(e.pointerId);
      const svg = knob.ownerSVGElement;
      const pt = svg.createSVGPoint();
      pt.x = AXLE.x;
      pt.y = AXLE.y;
      const c = pt.matrixTransform(svg.getScreenCTM());
      let last = Math.atan2(e.clientY - c.y, e.clientX - c.x);
      let lastT = performance.now();
      startGlowLoop(lab.newScene());
      const move = ev => {
        const a = Math.atan2(ev.clientY - c.y, ev.clientX - c.x);
        let d = a - last;
        if (d > Math.PI) d -= 2 * Math.PI;
        if (d < -Math.PI) d += 2 * Math.PI;
        last = a;
        const now = performance.now();
        const dt = Math.max(8, now - lastT);
        lastT = now;
        crankAngle = a;
        turn(k, Math.abs(d), Math.abs(d) / dt);
      };
      const up = () => {
        knob.removeEventListener('pointermove', move);
        knob.removeEventListener('pointerup', up);
        knob.removeEventListener('pointercancel', up);
        lab.save();
      };
      knob.addEventListener('pointermove', move);
      knob.addEventListener('pointerup', up);
      knob.addEventListener('pointercancel', up);
    });
    knob.addEventListener('keydown', e => {
      const run1 = e.key === 'Enter' || e.key === ' ';
      if (!run1 && !['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      if (!k || tested(k)) return;
      if (run1) { autoTurn(k); return; }
      crankAngle += Math.PI / 6;
      startGlowLoop(lab.newScene());
      turn(k, Math.PI / 6, 0.008);
      lab.save();
    });
  }

  // La manivelle tourne seule, à vitesse régulière, jusqu'à 100 units.
  function autoTurn(k) {
    if (autoTurning) return;
    autoTurning = true;
    const token = lab.newScene();
    startGlowLoop(token);
    const speed = reduceMotion ? AUTO_SPEED * 4 : AUTO_SPEED;
    let last = performance.now();
    const step = now => {
      if (!lab.isScene(token) || state.socket !== k || tested(k)) { autoTurning = false; return; }
      const dt = Math.min(50, Math.max(0, now - last));
      last = now;
      crankAngle += speed * dt;
      turn(k, speed * dt, 0.011);
      if (tested(k)) { autoTurning = false; lab.save(); return; }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function turn(k, rad, speed) {
    const before = state.energy[k];
    state.energy[k] = Math.min(START, before + rad / (2 * Math.PI) * (START / TURNS));
    const target = Math.min(1, speed / 0.012);
    glow += (target - glow) * 0.35;
    // Premier tour : les hypothèses sont désormais figées (voir renderPredict).
    if (before === 0) {
      setCaption(LABELS.captionTurning);
      const hint = $('#eb-crank-hint');
      if (hint) hint.remove();
      const handle = $('.eb-handle');
      if (handle) handle.classList.remove('is-ready');
    }
    updateBench(k);
    if (state.energy[k] >= START) finishTest(k);
  }

  function updateBench(k) {
    const e = state.energy[k];
    const count = $('#eb-count');
    if (count) count.textContent = String(Math.floor(e + 1e-9));
    const bar = $('#eb-bar');
    if (bar) bar.setAttribute('width', (168 * e / START).toFixed(1));
    const arm = $('#eb-arm');
    if (arm) arm.setAttribute('transform', `rotate(${(crankAngle * 180 / Math.PI).toFixed(1)} ${AXLE.x} ${AXLE.y})`);
    applyGlow(k);
  }

  /* Pendant qu'on tourne : la lampe brille (selon la lampe) et la chaleur
     monte de la dynamo et de la lampe, d'autant plus visible que la lampe
     perd une grande part de l'énergie des fils (ampoule classique : presque
     tout ; LED : environ deux tiers). */
  function heatShare(k) {
    const r = run.readings[k];
    return Math.max(0.25, Math.min(1, 0.25 + 0.75 * ((r.lamp / r.wires) - 0.6) / 0.4));
  }

  function applyGlow(k) {
    const L = LAMPS[k];
    const on = glow > 0.05;
    const g = $('#eb-glow');
    if (g) g.setAttribute('opacity', (glow * L.bright).toFixed(3));
    const glass = $('#eb-bulb-glass');
    if (glass) glass.setAttribute('fill', on ? L.glass : GLASS_OFF);
    const fil = $('#eb-bulb-fil');
    if (fil) fil.setAttribute('stroke', on ? WIRE_ON : WIRE_OFF);
    const wd = $('#eb-waves-dynamo');
    if (wd) wd.setAttribute('opacity', Math.min(1, glow * 1.1).toFixed(3));
    const wl = $('#eb-waves-lamp');
    if (wl) wl.setAttribute('opacity', Math.min(1, glow * 1.1 * heatShare(k)).toFixed(3));
  }

  // La lampe s'éteint doucement quand on ne tourne plus.
  function startGlowLoop(token) {
    const k = state.socket;
    if (!k) return;
    const step = () => {
      if (!lab.isScene(token) || state.socket !== k) return;
      glow *= reduceMotion ? 0.6 : 0.93;
      if (glow < 0.01) glow = 0;
      applyGlow(k);
      if (glow > 0) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function finishTest(k) {
    state.energy[k] = START;
    renderExperiment();
    setCaption(LABELS.captionTestDone);
    lab.renderStepper();
    lab.save();
  }

  /* --- Le tableau des mesures ---
     Rangé par machine : ce que la dynamo reçoit (1) et donne (2, 3), ce que
     la lampe reçoit (3, les fils : la même valeur, reprise) et donne (4, 5).
     Numéros et noms des flèches : ceux du banc et du diagramme. Une colonne
     par lampe. Une case ne devient un champ qu'une fois le point mesuré :
     impossible de deviner. read : lecture seule (étape Conclude). */
  function tableHTML(mode) {
    const read = mode === 'read';
    const miss = lab.state.showMissing && !read;
    const head = `<tr><th scope="col" class="eb-th-where">${LABELS.tableFlow}</th>` +
      run.pair.map(k => `<th scope="col"><span class="eb-th-lamp">${lampIcon(k)}<span>${lampName(k)}</span></span></th>`).join('') + `</tr>`;
    const body = MACHINES.map(m => `<tr class="eb-machine"><th scope="colgroup" colspan="${run.pair.length + 1}">${LABELS.machines[m.id]}</th></tr>` +
      m.rows.map(([io, s]) => {
        const copy = m.id === 'lamp' && s === 'wires';
        return `<tr class="${copy ? 'is-copy' : ''}"><th scope="row" class="eb-row-head">` +
          `<span class="eb-io is-${io}">${LABELS.io[io]}</span>${numHTML(s)}<span>${LABELS.arrows[s]}</span></th>` +
          run.pair.map(k => `<td>${copy ? copyCell(k) : read ? readCell(k, s) : cellHTML(k, s, miss && !written(k, s))}</td>`).join('') + `</tr>`;
      }).join('')).join('');
    return `<table class="lab-table eb-table eb-flow-table"><thead>${head}</thead><tbody>${body}</tbody></table>`;
  }

  const numHTML = s => `<span class="eb-rownum" aria-hidden="true">${spotNum(s)}</span>`;

  function cellHTML(k, s, missing) {
    const v = state.values[k][s];
    const label = escapeHtml(LABELS.cellLabel(LABELS.rows[s], lampName(k)));
    if (!state.measured[k][s] && v == null) {
      return `<button type="button" class="eb-cell-wait ${missing ? 'lab-is-missing' : ''}" data-wait-cell="${k}|${s}" aria-label="${label}"></button>`;
    }
    return `<input type="text" inputmode="numeric" class="eb-cell-input ${missing ? 'lab-is-missing' : ''}" data-cell="${k}|${s}" value="${v == null ? '' : v}" maxlength="3" autocomplete="off" spellcheck="false" aria-label="${label}">`;
  }

  function readCell(k, s) {
    const v = state.values[k][s];
    return v == null ? `<span class="eb-cell-empty">—</span>` : `<span class="eb-cell-val">${v}</span>`;
  }

  // Les fils, reçus par la lampe : la valeur notée sur la ligne de la dynamo.
  function copyCell(k) {
    const v = state.values[k].wires;
    return `<span class="eb-cell-copy" data-copy="${k}">${v == null ? '—' : v}</span>`;
  }

  function bindTable() {
    $$('[data-wait-cell]').forEach(el => {
      const [k, s] = el.dataset.waitCell.split('|');
      lab.setLock(el, LABELS.lockCell(LABELS.rows[s], lampThe(k)));
    });
    $$('[data-cell]').forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('is-invalid');
        recordValue(input, false);
      });
      input.addEventListener('change', () => recordValue(input, true));
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
    });
  }

  /* Valeur notée : un nombre entier de 0 à 100. Une valeur fausse mais
     plausible est acceptée : c'est la correction qui la compare à la
     lecture de l'instrument. Prise en compte à chaque frappe (un bouton
     touché juste après n'est plus verrouillé à tort) ; à la sortie du champ
     (final), une saisie qui n'est pas un nombre est signalée. Mise à jour
     sur place, sans redessiner le banc. */
  function recordValue(input, final) {
    const [k, s] = input.dataset.cell.split('|');
    const raw = input.value.trim();
    const valid = /^\d{1,3}$/.test(raw) && Number(raw) <= START;
    state.values[k][s] = valid ? Number(raw) : null;
    if (valid && final) input.value = String(Number(raw));
    if (valid || raw === '') input.classList.remove('lab-is-missing');
    refreshRun();
    if (!valid && raw !== '' && final) {
      input.classList.add('is-invalid');
      setCaption(LABELS.captionBadValue, true);
    }
  }

  function refreshRun() {
    if (lab.state.showMissing && valuesComplete()) lab.state.showMissing = false;
    // L'onglet du diagramme s'ouvre dès que le tableau est complet.
    const tab = $('[data-view="diagram"]');
    if (tab && state.view !== 'diagram') {
      lab.setLock(tab, valuesComplete() ? null : LABELS.lockValues(VALUES_TOTAL - valuesWritten()), { missing: true, key: 'tab-diagram' });
    }
    $$('[data-copy]').forEach(el => {
      const v = state.values[el.dataset.copy].wires;
      el.textContent = v == null ? '—' : String(v);
    });
    // Coche des lampes complètes, sans recréer les boutons (geste en cours).
    run.pair.forEach(k => {
      const btn = $(`[data-lamp="${k}"]`);
      if (!btn) return;
      const complete = tested(k) && SPOTS.every(s => written(k, s));
      const check = btn.querySelector('.eb-item-check');
      if (complete && !check) btn.insertAdjacentHTML('beforeend', `<span class="eb-item-check" aria-hidden="true">✓</span>`);
      if (!complete && check) check.remove();
    });
    setCaption(defaultCaption());
    updateRunFooter();
  }

  function defaultCaption() {
    if (state.view === 'diagram') {
      if (formsPlaced() === SPOTS.length) return LABELS.captionDiagramDone;
      return heldForm ? LABELS.captionFormPicked(LABELS.forms[heldForm]) : LABELS.captionDiagram;
    }
    const k = state.socket;
    if (!k) return LABELS.captionStart;
    if (!tested(k)) return state.energy[k] > 0 ? LABELS.captionTurning : LABELS.captionReady;
    if (SPOTS.some(s => !state.measured[k][s])) {
      return heldTool ? LABELS.captionToolPicked(LABELS.tools[heldTool]) : LABELS.captionMeasure;
    }
    if (SPOTS.some(s => !written(k, s))) return LABELS.captionRead;
    const o = other(k);
    return SPOTS.every(s => written(o, s)) ? LABELS.captionAllDone : LABELS.captionNextLamp;
  }

  function setCaption(text, warn) {
    const c = $('[data-caption]');
    if (!c) return;
    c.innerHTML = `<span>${gloss(text)}</span>`;
    c.classList.toggle('is-warning', !!warn);
  }

  /* Pied de page : sur le banc, « vers le diagramme » (ouvert quand le
     tableau est complet) ; sur le diagramme, « vers la conclusion ». Le
     bouton reste actif : touché trop tôt, il dit ce qui manque. */
  function renderRunFooter() {
    const toDiagram = state.view === 'bench' && !stepComplete(2);
    lab.setFooter(lab.footerInfo('') + `<div class="lab-footer-actions">` +
      `<button type="button" class="lab-btn lab-btn-primary" data-next>${toDiagram ? LABELS.toDiagram : LABELS.toConclude} →</button></div>`);
    $('[data-next]').addEventListener('click', () => {
      if (toDiagram) {
        state.view = 'diagram';
        renderExperiment();
      } else lab.goToStep(3);
    });
    updateRunFooter();
  }

  function updateRunFooter() {
    const complete = stepComplete(2);
    const warn = lab.state.showMissing && !complete;
    const info = $('.lab-footer .lab-footer-info');
    if (info) {
      info.textContent = warn ? lockReason(2) : LABELS.runInfo(valuesWritten(), VALUES_TOTAL, formsPlaced(), SPOTS.length);
      info.classList.toggle('is-warning', warn);
    }
    const next = $('[data-next]');
    if (next) {
      const toDiagram = state.view === 'bench' && !complete;
      const reason = toDiagram
        ? (valuesComplete() ? null : LABELS.lockValues(VALUES_TOTAL - valuesWritten()))
        : (complete ? null : lockReason(2));
      lab.setLock(next, reason, { missing: true, key: 'next' });
    }
    // La barre d'étapes ne change que quand l'étape devient complète, ou ne l'est plus.
    if (complete !== stepperDone) { stepperDone = complete; lab.renderStepper(); }
  }

  /* --- Les diagrammes de flux d'énergie : viewBox 640 × 330 ---
     Ovales : les objets ; flèches horizontales : l'énergie utile qui passe
     d'un objet au suivant ; flèches rouges, en diagonale vers le haut à
     droite (convention du cours) : l'énergie perdue dans l'air. Une case
     par flèche, pour la forme d'énergie. Largeur des flèches : les valeurs
     du tableau de l'élève (même fausses). Deux diagrammes côte à côte, un
     par lampe, à la même échelle : l'élève remplit le premier, le second
     reprend ses formes (mêmes transformations, autres quantités). */
  const DG_Y = 206;
  const OVAL = { rx: 46, ry: 29, hand: 50, dynamo: 214, lamp: 378, room: 542 };
  const H_ARROWS = { crank: [96, 168], wires: [260, 332], light: [424, 496] };
  // Énergie perdue : de l'ovale vers le haut à droite, à 45° (départ, pointe).
  const D_ARROWS = { dynamo: [236, 183, 316, 103], lamp: [400, 183, 480, 103] };
  // Cases de l'énergie perdue : au bout de la flèche rouge, au-dessus de « Air ».
  const BOX_POS = { crank: [125, 263], wires: [296, 263], light: [460, 263], dynamo: [322, 63], lamp: [486, 63] };
  const USEFUL = '#8a9bb8';
  const WASTED = '#d64545';
  const thick = v => (v == null ? 3 : Math.max(3, Math.min(40, v * 0.4)));

  // Flèche de (x1, y1) à la pointe (x2, y2), de largeur t.
  function arrowPath(x1, y1, x2, y2, t, colour) {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    const head = 14, hw = t / 2 + 7;
    const bx = x2 - ux * head, by = y2 - uy * head;
    const p = (x, y, d) => `${(x - uy * d).toFixed(1)},${(y + ux * d).toFixed(1)}`;
    return `<path d="M${p(x1, y1, t / 2)} L${p(bx, by, t / 2)} L${p(bx, by, hw)} L${x2},${y2} ` +
      `L${p(bx, by, -hw)} L${p(bx, by, -t / 2)} L${p(x1, y1, -t / 2)} Z" fill="${colour}"/>`;
  }

  // o.mode : 'edit' (cases à remplir), 'copy' (formes reprises du premier
  // diagramme), 'check' (cases justes ou fausses).
  function diagramSVG(o) {
    const k = o.lamp;
    const val = s => state.values[k][s];
    const edit = o.mode === 'edit';
    const missing = edit && lab.state.showMissing;
    let out = `<svg class="lab-svg eb-diagram" viewBox="0 0 640 330" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escapeHtml(LABELS.diagram.label(lampName(k)))}">`;

    Object.keys(H_ARROWS).forEach(s => {
      const [x1, x2] = H_ARROWS[s];
      const v = val(s), t = thick(v);
      out += arrowPath(x1, DG_Y, x2, DG_Y, t, USEFUL) +
        `<text class="eb-arrow-val" x="${(x1 + x2 - 14) / 2}" y="${DG_Y - t / 2 - 8}" text-anchor="middle">${v == null ? '?' : v}</text>`;
    });
    Object.keys(D_ARROWS).forEach(s => {
      const [x1, y1, x2, y2] = D_ARROWS[s];
      const v = val(s), t = thick(v);
      // La valeur, du côté haut gauche de la flèche, à mi-longueur.
      const d = (t / 2 + 13) * Math.SQRT1_2;
      out += arrowPath(x1, y1, x2, y2, t, WASTED) +
        `<text class="eb-arrow-val is-wasted" x="${((x1 + x2) / 2 - d).toFixed(1)}" y="${((y1 + y2) / 2 - d + 5).toFixed(1)}" text-anchor="middle">${v == null ? '?' : v}</text>` +
        `<text class="eb-air" x="${x2 + 6}" y="${y2 - 10}" text-anchor="middle">${LABELS.diagram.air}</text>`;
    });
    ['hand', 'dynamo', 'lamp', 'room'].forEach(n => {
      out += `<ellipse class="eb-oval" cx="${OVAL[n]}" cy="${DG_Y}" rx="${OVAL.rx}" ry="${OVAL.ry}"/>` +
        `<text class="eb-oval-text" x="${OVAL[n]}" y="${DG_Y + 4.5}" text-anchor="middle">${LABELS.diagram[n]}</text>`;
    });
    SPOTS.forEach(s => {
      const [x, y] = BOX_POS[s];
      const f = state.forms[s];
      const cls = ['eb-box', f ? '' : 'is-empty', o.mode === 'copy' ? 'is-copy' : '',
        o.mode === 'check' ? (f === BOX_FORM[s] ? 'is-ok' : 'is-ko') : '',
        missing && !f ? 'is-missing' : ''].join(' ');
      const aria = escapeHtml(`${LABELS.arrows[s]} : ${f ? LABELS.forms[f] : LABELS.diagram.emptyBox}`);
      out += `<g class="${cls}" ${edit ? `data-box="${s}" tabindex="0" role="button"` : ''} aria-label="${aria}">` +
        `<rect x="${x - 70}" y="${y - 17}" width="140" height="34" rx="9"/>` +
        `<text x="${x}" y="${y + 4.5}" text-anchor="middle">${f ? LABELS.forms[f] : '?'}</text></g>`;
    });
    // Légende
    out += `<rect x="120" y="309" width="26" height="9" rx="2" fill="${USEFUL}"/>` +
      `<text class="eb-legend" x="152" y="317">${LABELS.diagram.useful}</text>` +
      `<rect x="330" y="309" width="26" height="9" rx="2" fill="${WASTED}"/>` +
      `<text class="eb-legend" x="362" y="317">${LABELS.diagram.wasted}</text>`;
    return out + `</svg>`;
  }

  // À gauche, le diagramme à remplir ; à droite, celui qui reprend ses formes.
  function diagramStageHTML() {
    const [a, b] = run.pair;
    const col = (k, mode, note) => `<div class="eb-diag-col is-${mode}">` +
      `<div class="eb-diag-head">${lampIcon(k)}<strong>${lampName(k)}</strong><span class="eb-diag-note">${note}</span></div>` +
      `<div class="eb-diag-holder">${diagramSVG({ lamp: k, mode })}</div></div>`;
    return `<div class="eb-diagrams">${col(a, 'edit', LABELS.diagramFill)}${col(b, 'copy', LABELS.diagramCopy)}</div>`;
  }

  function paletteHTML() {
    const chips = FORMS.map(f => `<button type="button" class="lab-choice eb-form-chip" data-form="${f}" aria-pressed="false">${LABELS.forms[f]}</button>`).join('');
    return `<div class="eb-group eb-group-forms"><span class="eb-group-title">${LABELS.formsTitle}</span><div class="eb-group-items">${chips}</div></div>`;
  }

  function bindDiagram() {
    $$('[data-form]').forEach(el => {
      const f = el.dataset.form;
      lab.makeDraggable(el, {
        hold: true,
        ghost: () => `<div class="eb-ghost eb-ghost-form">${LABELS.forms[f]}</div>`,
        targets: () => $$('[data-box]'),
        onDrop: target => setForm(target.dataset.box, f),
        onHold: on => {
          heldForm = on ? f : null;
          el.setAttribute('aria-pressed', String(on));
          setCaption(defaultCaption());
        }
      });
    });
    // Une case touchée sans forme en main (sinon le moteur l'a posée).
    $$('[data-box]').forEach(el => {
      el.addEventListener('click', () => setCaption(LABELS.captionPickForm, true));
      el.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        setCaption(LABELS.captionPickForm, true);
      });
    });
  }

  function setForm(box, f) {
    state.forms[box] = f;
    if (lab.state.showMissing && formsPlaced() === SPOTS.length) lab.state.showMissing = false;
    renderExperiment();
    lab.save();
  }

  /* ===== Étape 3 : conclusion =====
     À gauche, le tableau (lecture seule) et le bilan d'énergie guidé :
     a) l'énergie du début (une des cinq flèches), b) celles de la fin
     (plusieurs). À droite, la question 1, puis la question 2 avec c) le
     calcul de chaque lampe (addition posée avec les valeurs du tableau,
     l'élève écrit le total), et le jugement des hypothèses. */
  function conclusionParts() {
    const c = state.concl;
    return {
      q1: !!c.q1,
      start: !!c.start,
      ends: c.ends.length > 0,
      totals: run.pair.every(k => c.totals[k] != null),
      q2: !!c.q2,
      rest: !!(c.rest && c.fate),
      verdict: !!(c.v1 && c.v2)
    };
  }

  function conclusionsComplete() {
    return Object.values(conclusionParts()).every(Boolean);
  }

  function numInput(attr, value, aria, missing) {
    return `<input type="text" inputmode="numeric" class="eb-num-input ${missing ? 'lab-is-missing' : ''}" ${attr} value="${value == null ? '' : value}" maxlength="3" autocomplete="off" spellcheck="false" aria-label="${escapeHtml(aria)}">`;
  }

  // Les valeurs du tableau de l'élève sur ces lignes, dans l'ordre du tableau.
  const endRowsOf = c => SPOTS.filter(s => c.ends.includes(s));

  function balanceHTML() {
    const c = state.concl;
    const parts = conclusionParts();
    const show = lab.state.showMissing;
    const miss = key => (show && !parts[key] ? 'lab-is-missing' : '');
    const pick = (field, s, on) => `<button type="button" class="lab-choice eb-pick ${on ? 'is-selected' : ''}" data-${field}="${s}" aria-pressed="${on}">` +
      `${numHTML(s)}<span>${LABELS.arrows[s]}</span></button>`;
    // L'énergie du début, pour chaque lampe (la même si l'élève a bien choisi).
    const startVals = c.start ? [...new Set(run.pair.map(k => cellValue(k, c.start)))].join(' / ') : null;

    return `<div class="eb-balance">` +
      `<h3 class="lab-panel-title">${LABELS.balanceTitle}</h3>` +
      `<div class="eb-bal-part ${miss('start')}">` +
        `<p class="eb-bal-label"><span class="eb-num" aria-hidden="true">a</span><span>${LABELS.startChoose}</span>` +
        (startVals ? `<span class="eb-bal-result">${LABELS.startResult(startVals)}</span>` : '') + `</p>` +
        `<div class="eb-chips">${SPOTS.map(s => pick('start', s, c.start === s)).join('')}</div></div>` +
      `<div class="eb-bal-part ${miss('ends')}">` +
        `<p class="eb-bal-label"><span class="eb-num" aria-hidden="true">b</span><span>${LABELS.endChoose}</span></p>` +
        `<div class="eb-chips">${SPOTS.map(s => pick('end', s, c.ends.includes(s))).join('')}</div></div>` +
      `</div>`;
  }

  const cellValue = (k, s) => (state.values[k][s] == null ? '?' : state.values[k][s]);

  /* c) Pour chaque lampe, le début et la fin côte à côte : l'addition est
     posée avec les valeurs du tableau des énergies choisies en b ; l'élève
     écrit le total. Placé dans la question 2, qu'il sert à trancher. */
  function calcHTML() {
    const c = state.concl;
    const show = lab.state.showMissing;
    const ends = endRowsOf(c);
    const lines = run.pair.map(k => `<div class="eb-calc">` +
      `<span class="eb-calc-lamp">${lampIcon(k)}<span>${lampName(k)}</span></span>` +
      `<span class="eb-calc-start">${LABELS.calcStart} <b>${c.start ? cellValue(k, c.start) : '…'}</b> ${LABELS.unitsWord}</span>` +
      `<span class="eb-calc-sum">${LABELS.calcEnd} ${ends.length ? ends.map(s => `<b>${cellValue(k, s)}</b>`).join(' + ') : '<span class="eb-calc-empty">…</span>'} =</span>` +
      numInput(`data-total="${k}"`, c.totals[k], LABELS.totalAria(lampThe(k)), show && c.totals[k] == null) +
      `<span>${LABELS.unitsWord}</span></div>`).join('');
    return `<div class="eb-bal-part eb-calcs ${show && !conclusionParts().totals ? 'lab-is-missing' : ''}">` +
      `<p class="eb-bal-label"><span class="eb-num" aria-hidden="true">c</span><span>${LABELS.endCalc}</span></p>${lines}</div>`;
  }

  function renderConclude() {
    const c = state.concl;
    const parts = conclusionParts();
    const show = lab.state.showMissing;
    const miss = key => (show && !parts[key] ? 'lab-is-missing' : '');
    const chip = (field, val, label, icon) => `<button type="button" class="lab-choice eb-chip ${c[field] === val ? 'is-selected' : ''}" data-c="${field}" data-val="${val}" aria-pressed="${c[field] === val}">${icon || ''}<span>${label}</span></button>`;

    lab.body.innerHTML = `<div class="eb-conclude">` +
      `<section class="eb-read">` +
        `<div class="eb-side-head"><h3 class="lab-panel-title">${LABELS.tableTitle}</h3><span class="eb-unit">${LABELS.tableUnit}</span></div>` +
        `<div class="lab-table-wrap eb-table-wrap">${tableHTML('read')}</div>` +
        balanceHTML() +
      `</section>` +
      `<section class="eb-form">` +
        `<div class="eb-q ${miss('q1')}">` +
          `<p class="eb-q-title"><span class="eb-num" aria-hidden="true">1</span><span>${gloss(LABELS.questions[run.ask])}</span></p>` +
          `<p class="eb-sentence-sm">${gloss(LABELS.concl1[run.ask](blankHTML(c.q1 && lampThe(c.q1))))}</p>` +
          `<div class="eb-chips">${run.pair.map(k => chip('q1', k, lampThe(k), lampIcon(k))).join('')}</div>` +
        `</div>` +
        `<div class="eb-q">` +
          `<p class="eb-q-title"><span class="eb-num" aria-hidden="true">2</span><span>${gloss(LABELS.questions.end)}</span></p>` +
          `<p class="eb-q-hint">${gloss(LABELS.balanceHint)}</p>` +
          calcHTML() +
          `<div class="eb-part ${miss('q2')}"><p class="eb-sentence-sm">${gloss(LABELS.concl2(blankHTML(c.q2 && LABELS.amounts[c.q2])))}</p>` +
            `<div class="eb-chips">${AMOUNTS.map(x => chip('q2', x, LABELS.amounts[x])).join('')}</div></div>` +
          `<div class="eb-part ${miss('rest')}"><p class="eb-sentence-sm">${gloss(LABELS.concl3(blankHTML(c.rest && LABELS.forms[c.rest]), blankHTML(c.fate && LABELS.fates[c.fate])))}</p>` +
            `<div class="eb-chips">${REST_FORMS.map(f => chip('rest', f, LABELS.forms[f])).join('')}</div>` +
            `<div class="eb-chips">${FATES.map(x => chip('fate', x, LABELS.fates[x])).join('')}</div></div>` +
        `</div>` +
        `<div class="eb-q eb-verdicts ${miss('verdict')}">` +
          [1, 2].map(n => `<div class="eb-chips"><span class="eb-q-text">${LABELS.qVerdict(n)}</span>` +
            ['confirmed', 'rejected'].map(x => chip('v' + n, x, LABELS[x])).join('') + `</div>`).join('') +
        `</div>` +
      `</section></div>`;

    $$('[data-c]').forEach(btn => btn.addEventListener('click', () => {
      c[btn.dataset.c] = btn.dataset.val;
      renderConclude();
    }));
    $$('[data-start]').forEach(btn => btn.addEventListener('click', () => {
      c.start = c.start === btn.dataset.start ? null : btn.dataset.start;
      renderConclude();
    }));
    $$('[data-end]').forEach(btn => btn.addEventListener('click', () => {
      const s = btn.dataset.end;
      c.ends = c.ends.includes(s) ? c.ends.filter(x => x !== s) : SPOTS.filter(x => x === s || c.ends.includes(x));
      renderConclude();
    }));
    // Nombre entier, pris en compte à chaque frappe (voir recordValue).
    const bindNum = (input, set) => {
      const read = final => {
        const raw = input.value.trim();
        const valid = /^\d{1,3}$/.test(raw);
        set(valid ? Number(raw) : null);
        if (valid) input.classList.remove('lab-is-missing');
        if (final) {
          if (valid) input.value = String(Number(raw));
          input.classList.toggle('is-invalid', !valid && raw !== '');
        }
        updateConcludeFooter();
      };
      input.addEventListener('input', () => { input.classList.remove('is-invalid'); read(false); });
      input.addEventListener('change', () => read(true));
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
    };
    $$('[data-total]').forEach(input => bindNum(input, v => { c.totals[input.dataset.total] = v; }));

    lab.setFooter(`<button type="button" class="lab-btn lab-btn-ghost" data-back>← ${LABELS.backToLab}</button>` +
      lab.footerInfo('') +
      `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-check>${LABELS.checkConclusions}</button></div>`);
    $('[data-back]').addEventListener('click', () => lab.goToStep(2));
    $('[data-check]').addEventListener('click', () => lab.finish());
    updateConcludeFooter();
  }

  function updateConcludeFooter() {
    const ready = conclusionsComplete();
    const info = $('.lab-footer .lab-footer-info');
    if (info) {
      const warn = lab.state.showMissing && !ready;
      info.textContent = warn ? lab.L.missingConclusions : '';
      info.classList.toggle('is-warning', warn);
    }
    const check = $('[data-check]');
    if (check) lab.setLock(check, ready ? null : lab.L.missingConclusions, { missing: true, key: 'check' });
    lab.renderStepper();
  }

  /* ===== Étape 4 : correction ===== */
  const CRITERIA = ['measures', 'forms', 'balance', 'answers', 'verdicts'];

  function sumOf(k, rows) {
    return rows.reduce((n, s) => n + (state.values[k][s] || 0), 0);
  }

  // « 19 + 38 + 43 » : les valeurs de l'élève (ou des instruments) sur ces lignes.
  function exprOf(k, rows, truth) {
    if (!rows.length) return '—';
    return rows.map(s => {
      const v = truth ? run.readings[k][s] : state.values[k][s];
      return v == null ? '?' : v;
    }).join(' + ');
  }

  function evaluate() {
    const c = state.concl;
    const misses = [];
    let good = 0;
    run.pair.forEach(k => SPOTS.forEach(s => {
      const v = state.values[k][s];
      const r = run.readings[k][s];
      if (v === r) good++;
      else misses.push({ k, s, v, r });
    }));
    const formsWrong = SPOTS.filter(s => state.forms[s] !== BOX_FORM[s]);
    const ends = endRowsOf(c);
    const endsOk = ends.length === END_ROWS.length && END_ROWS.every(s => ends.includes(s));
    const startOk = c.start === 'crank';
    const totalOk = k => c.totals[k] != null && c.totals[k] === sumOf(k, ends);
    const totalsOk = run.pair.every(totalOk);
    const q1Ok = c.q1 === truth1();
    const q2Ok = c.q2 === 'same';
    const restOk = c.rest === 'thermal';
    const fateOk = c.fate === 'air';
    const should1 = state.hyp.h1 === c.q1 ? 'confirmed' : 'rejected';
    const should2 = state.hyp.h2 === c.q2 ? 'confirmed' : 'rejected';
    return {
      misses, good, total: VALUES_TOTAL, formsWrong, ends, endsOk, startOk, totalOk, totalsOk,
      q1Ok, q2Ok, restOk, fateOk, should1, should2,
      v1Ok: c.v1 === should1, v2Ok: c.v2 === should2,
      measures: misses.length === 0,
      forms: formsWrong.length === 0,
      balance: endsOk && startOk && totalsOk,
      answers: q1Ok && q2Ok && restOk && fateOk,
      verdicts: c.v1 === should1 && c.v2 === should2
    };
  }

  const missText = m => CHECK.measureMiss(LABELS.rows[m.s], lampName(m.k), m.v == null ? CHECK.nothing : m.v, m.r);
  const endNames = rows => LABELS.list(rows.map(s => CHECK.endNames[s]));

  // Ce qui ne va pas dans les énergies choisies pour la fin, en une ou plusieurs phrases.
  function endsNotes(ev) {
    const notes = [];
    if (ev.ends.includes('wires')) notes.push(CHECK.endsWires);
    if (ev.ends.includes('crank')) notes.push(CHECK.endsCrank);
    const forgot = END_ROWS.filter(s => !ev.ends.includes(s));
    if (forgot.length) notes.push(CHECK.endsMissing(endNames(forgot)));
    return notes;
  }

  const startSaid = c => (c.start ? LABELS.arrows[c.start] : CHECK.nothing);

  function sentence1(k) { return LABELS.concl1[run.ask](lampThe(k)); }
  function sentence3(rest, fate) { return LABELS.concl3(LABELS.forms[rest], LABELS.fates[fate]); }

  function criterionDetail(key, ev) {
    const c = state.concl;
    if (key === 'measures') {
      const rows = SPOTS.map(s => `<tr><th scope="row">${LABELS.rows[s]}</th>` + run.pair.map(k => {
        const v = state.values[k][s], r = run.readings[k][s];
        return `<td>${v === r ? `<span class="eb-ok">${v}</span>` : `<span class="eb-ko">${v == null ? '—' : v}</span> → <strong>${r}</strong>`}</td>`;
      }).join('') + `</tr>`).join('');
      return `<p>${CHECK.measuresScore(ev.good, ev.total)}</p>` +
        `<table class="lab-table eb-table eb-table-check"><thead><tr><th scope="col">${LABELS.tableWhere}</th>` +
        run.pair.map(k => `<th scope="col"><span class="eb-th-lamp">${lampIcon(k)}<span>${lampName(k)}</span></span></th>`).join('') + `</tr></thead><tbody>${rows}</tbody></table>` +
        `<p class="${ev.measures ? 'eb-ok' : ''}">${ev.measures ? CHECK.measuresAllGood : CHECK.measuresLegend}</p>` +
        `<p class="eb-muted">${gloss(EXPLAIN.camera)}</p>`;
    }
    if (key === 'forms') {
      const wrong = ev.formsWrong.map(s => {
        const f = state.forms[s];
        return `<li><strong>${f ? CHECK.formWrong(LABELS.arrows[s], LABELS.forms[f]) : CHECK.formEmpty(LABELS.arrows[s])}</strong> ${gloss(CHECK.formWhy[s])}</li>`;
      }).join('');
      return `<div class="eb-diag-mini">${diagramSVG({ lamp: run.pair[0], mode: 'check' })}</div>` +
        (ev.forms ? `<p class="eb-ok">${CHECK.formsAllGood}</p>` : `<ul class="eb-misslist">${wrong}</ul>`) +
        `<p>${gloss(CHECK.formsSummary)}</p>`;
    }
    if (key === 'balance') {
      let html = `<p class="${ev.startOk ? 'eb-ok' : 'eb-ko'}">${ev.startOk ? CHECK.startOk : CHECK.startWrong(startSaid(c))}</p>`;
      html += ev.endsOk ? `<p class="eb-ok">${CHECK.endsOk(endNames(END_ROWS))}</p>`
        : endsNotes(ev).map(n => `<p class="eb-ko">${gloss(n)}</p>`).join('');
      html += run.pair.map(k => {
        const expr = exprOf(k, ev.ends);
        const sum = sumOf(k, ev.ends);
        return ev.totalOk(k) ? `<p class="eb-ok">${CHECK.totalOk(lampName(k), expr, sum)}</p>`
          : `<p class="eb-ko">${CHECK.totalWrong(lampName(k), c.totals[k] == null ? CHECK.nothing : c.totals[k], expr, sum)}</p>`;
      }).join('');
      if (!ev.balance) {
        html += `<p><strong>${CHECK.rightBalanceTitle}</strong></p><ul class="eb-plainlist">` +
          run.pair.map(k => `<li>${CHECK.rightBalance(lampName(k), exprOf(k, END_ROWS, true))}</li>`).join('') + `</ul>`;
      }
      return html + `<p class="eb-muted">${gloss(EXPLAIN.conservation)}</p>`;
    }
    if (key === 'answers') {
      const right1 = sentence1(truth1());
      const right2 = LABELS.concl2(LABELS.amounts.same);
      const right3 = sentence3('thermal', 'air');
      const lampsWhy = run.pair.slice().sort((x, y) => LAMPS[y].rank - LAMPS[x].rank).map(k => gloss(EXPLAIN[k])).join(' ');
      return `<p class="eb-q-head">1. ${gloss(LABELS.questions[run.ask])}</p>` +
        (ev.q1Ok ? `<p class="eb-ok">${CHECK.answerOk} ${gloss(right1)}</p>` : `<p class="eb-ko">${CHECK.answerWrong} <strong>${gloss(right1)}</strong></p>`) +
        `<p>${lampsWhy}${run.pair.includes('traditional') ? ' ' + gloss(EXPLAIN.europe) : ''}</p>` +
        `<p class="eb-q-head">2. ${gloss(LABELS.questions.end)}</p>` +
        (ev.q2Ok ? `<p class="eb-ok">${CHECK.answerOk} ${gloss(right2)}</p>` : `<p class="eb-ko">${CHECK.answerWrong} <strong>${gloss(right2)}</strong></p>`) +
        (ev.restOk && ev.fateOk ? `<p class="eb-ok">${CHECK.answerOk} ${gloss(right3)}</p>` : `<p class="eb-ko">${CHECK.answerWrong} <strong>${gloss(right3)}</strong></p>`) +
        `<p>${gloss(EXPLAIN.dissipation)}</p>`;
    }
    // Hypothèses : chacune comparée à la conclusion de l'élève sur la même question.
    const block = (n, hypText, conclText, ok, given, should) =>
      `<p><strong>${CHECK.yourHyp(n)}</strong> ${gloss(hypText)}</p>` +
      `<p><strong>${CHECK.yourConcl(n)}</strong> ${gloss(conclText)}</p>` +
      `<p class="${ok ? 'eb-ok' : 'eb-ko'}">${ok ? CHECK.verdictOk(given) : CHECK.verdictWrong(should)}</p>`;
    return block(1, LABELS.hyp1[run.ask](lampThe(state.hyp.h1)), sentence1(c.q1), ev.v1Ok, c.v1, ev.should1) +
      block(2, LABELS.hyp2(amountOf(state.hyp.h2)), LABELS.concl2(amountOf(c.q2)), ev.v2Ok, c.v2, ev.should2) +
      (ev.should1 === 'rejected' || ev.should2 === 'rejected' ? `<p class="eb-muted">${CHECK.rejectedNote}</p>` : '');
  }

  function renderCheck() {
    const ev = evaluate();
    const score = CRITERIA.filter(k => ev[k]).length;
    const rows = CRITERIA.map(k => `<button type="button" class="eb-crit ${ev[k] ? 'is-ok' : 'is-ko'} ${state.selected === k ? 'is-selected' : ''}" data-crit="${k}">` +
      `<span class="eb-crit-text"><strong>${LABELS.criteria[k]}</strong><small>${LABELS.criteriaSub[k]}</small></span>` +
      `<span class="eb-crit-mark" aria-label="${ev[k] ? LABELS.markCorrect : LABELS.markIncorrect}">${ev[k] ? '✓' : '✗'}</span></button>`).join('');

    lab.body.innerHTML = `<div class="eb-check">` +
      `<div class="eb-check-left">` +
        `<div class="lab-score"><span class="lab-score-num">${score}<small> / ${CRITERIA.length}</small></span><span class="lab-score-label">${LABELS.scoreLabel}</span></div>` +
        `<div class="eb-crit-list">${rows}</div>` +
        `<div class="eb-reminder">${questionsHTML()}</div>` +
      `</div>` +
      `<div class="eb-check-detail" aria-live="polite"><h3>${LABELS.criteria[state.selected]}</h3>${criterionDetail(state.selected, ev)}</div>` +
      `</div>`;

    $$('[data-crit]').forEach(btn => btn.addEventListener('click', () => {
      state.selected = btn.dataset.crit;
      renderCheck();
    }));
    lab.fillSpace($('.eb-check-detail'));
    lab.checkFooter();
  }

  /* ===== Rapport imprimable : contenu des 7 sections de la fiche outil FO3
     (en-tête, numérotation et mise en page : cadre commun) =====
     Les erreurs passent par mark() (lab-engine.js) : valeur mal recopiée,
     forme d'énergie fausse, bilan (début, lignes, totaux), réponses et
     jugements. Les notes reprennent les explications de l'étape Check. */
  function buildReport(mark) {
    const R = LABELS.report;
    const ev = evaluate();
    const c = state.concl;
    const [a, b] = run.pair;

    const miss = new Map(ev.misses.map(m => [`${m.k}|${m.s}`, m]));
    const table = `<table class="eb-report-table"><caption>${R.tableCaption}</caption>` +
      `<tr><th></th>${run.pair.map(k => `<th>${lampName(k)}</th>`).join('')}</tr>` +
      SPOTS.map(s => `<tr><th>${LABELS.rows[s]}</th>${run.pair.map(k => {
        const v = state.values[k][s];
        const text = v == null ? '—' : String(v);
        const m = miss.get(`${k}|${s}`);
        return `<td>${m ? mark(text, missText(m), { box: true }) : text}</td>`;
      }).join('')}</tr>`).join('') + `</table>`;
    const forms = `<table class="eb-report-table"><caption>${R.diagramCaption}</caption>` +
      `<tr><th>${R.arrowHead}</th><th>${R.formHead}</th></tr>` +
      SPOTS.map(s => {
        const f = state.forms[s];
        const text = f ? LABELS.forms[f] : '—';
        return `<tr><th>${LABELS.arrows[s]}</th><td>${f === BOX_FORM[s] ? text : mark(text, plain(CHECK.formWhy[s]), { box: true })}</td></tr>`;
      }).join('') + `</table>`;

    // Interprétation : le bilan de l'élève, dans l'ordre de lecture.
    let start = c.start ? LABELS.arrows[c.start] : '—';
    if (!ev.startOk) start = mark(start, CHECK.startWrong(startSaid(c)));
    const startVal = c.start ? [...new Set(run.pair.map(k => (state.values[k][c.start] == null ? '—' : state.values[k][c.start])))].join(' / ') : '—';
    let rowsText = ev.ends.length ? LABELS.list(ev.ends.map(s => LABELS.arrows[s])) : '—';
    if (!ev.endsOk) rowsText = mark(rowsText, plain(endsNotes(ev).join(' ')));
    const ends = run.pair.map(k => {
      const expr = exprOf(k, ev.ends);
      let total = c.totals[k] == null ? '—' : String(c.totals[k]);
      if (!ev.totalOk(k)) total = mark(total, CHECK.totalWrong(lampName(k), c.totals[k] == null ? CHECK.nothing : c.totals[k], expr, sumOf(k, ev.ends)));
      return `<li>${R.end(lampThe(k), expr, total)}</li>`;
    }).join('');
    const lightOf = k => (state.values[k].light == null ? '—' : state.values[k].light);
    const interpretation = `<p>${R.light(lampThe(a), lightOf(a), lampThe(b), lightOf(b))}</p>` +
      `<p>${R.start(start, startVal)} ${R.endRows(rowsText)}</p><ul>${ends}</ul>`;

    // Conclusion : les phrases de l'élève, chaque mot faux marqué à sa place.
    const word = (text, ok, note) => (ok ? text : mark(text, note));
    const q1 = c.q1 ? word(lampThe(c.q1), ev.q1Ok, `${CHECK.answerWrong} ${plain(sentence1(truth1()))}`) : '—';
    const q2 = c.q2 ? word(LABELS.amounts[c.q2], ev.q2Ok, `${CHECK.answerWrong} ${plain(LABELS.concl2(LABELS.amounts.same))}`) : '—';
    const rest = c.rest ? word(LABELS.forms[c.rest], ev.restOk, plain(EXPLAIN.dissipation)) : '—';
    const fate = c.fate ? word(LABELS.fates[c.fate], ev.fateOk, plain(EXPLAIN.dissipation)) : '—';
    const verdict = (n, given, ok, should) => R.verdict(n, given ? word(LABELS[given], ok, CHECK.verdictWrong(should)) : '—');
    const conclusion = `<p>${plain(LABELS.concl1[run.ask](q1))}</p>` +
      `<p>${plain(LABELS.concl2(q2))} ${plain(LABELS.concl3(rest, fate))}</p>` +
      `<p>${verdict(1, c.v1, ev.v1Ok, ev.should1)} ${verdict(2, c.v2, ev.v2Ok, ev.should2)}</p>`;

    const hyp = `<ol><li>${plain(LABELS.hyp1[run.ask](lampThe(state.hyp.h1)))}</li>` +
      `<li>${plain(LABELS.hyp2(amountOf(state.hyp.h2)))}</li></ol>` +
      (state.because.trim() ? `<p>${R.because}: ${escapeHtml(state.because.trim())}</p>` : '');

    const correction = CRITERIA.map(k => `<tr><th>${LABELS.criteria[k]}</th><td class="${ev[k] ? 'ok' : 'ko'}">${ev[k] ? '✓' : '✗'}</td></tr>`).join('');

    return {
      title: R.title,
      sections: [
        `<ol><li>${plain(LABELS.questions[run.ask])}</li><li>${plain(LABELS.questions.end)}</li></ol>`,
        hyp,
        `<p>${R.materials(LABELS.list([LABELS.lamps[a].a, LABELS.lamps[b].a]))}</p>`,
        `<ol>${R.procedure(lampThe(a), lampThe(b)).map(step => `<li>${step}</li>`).join('')}</ol>`,
        `<div class="eb-report-results">${table}${forms}</div>`,
        interpretation,
        conclusion
      ],
      correction: `<p><strong>${R.score(CRITERIA.filter(k => ev[k]).length)}</strong></p><table class="eb-report-corr">${correction}</table>`
    };
  }

  lab = LabEngine.create({
    id: 'energy',
    title: LABELS.title,
    glossary: GLOSSARY,
    reset,
    stepComplete,
    lockReason,
    isStarted: () => !!(state.hyp.h1 || state.hyp.h2 || state.socket),
    render: { 1: renderPredict, 2: renderExperiment, 3: renderConclude, 4: renderCheck },
    report: buildReport,
    // 2 : tableau par machine, bilan guidé (start : un point, ends : des points).
    version: 2,
    save: () => ({ run, state }),
    // Ce qui ne vaut que pendant un geste (instrument ou forme en main) repart à zéro.
    load(data) {
      const r = data.run, s = data.state;
      if (!r || !Array.isArray(r.pair) || !r.pair.every(k => LAMPS[k]) || !r.readings || !LABELS.questions[r.ask] ||
        !s || !s.hyp || !s.concl || !Array.isArray(s.concl.ends) || !s.energy || !s.values || !s.measured) throw new Error('labProgress');
      run = r;
      state = s;
      heldTool = null;
      heldForm = null;
      glow = 0;
      crankAngle = 0;
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
          lamps: run.pair.join('-'), question: run.ask, valuesRight: ev.good, values: ev.total,
          formsRight: SPOTS.length - ev.formsWrong.length, hypothesis1: state.hyp.h1, hypothesis2: state.hyp.h2
        }
      };
    }
  });
})();
