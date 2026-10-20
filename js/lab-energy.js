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
                     jusqu'à 100 units (le banc s'arrête : même énergie pour
                     les deux lampes), mesurer chacun des cinq points avec le
                     bon instrument, noter chaque valeur dans le tableau ; la
                     même chose avec l'autre lampe ;
                     b) le diagramme de flux d'énergie : une forme par case ;
                     les flèches prennent la largeur des valeurs du tableau
     3. Conclude   — question 1 ; bilan (début, lignes cochées, total par
                     lampe), question 2 et ce que devient le reste ; jugement
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
     Points de mesure, dans l'ordre du tableau et du diagramme : l'axe de la
     manivelle (mécanique, 100), la dynamo (thermique, perdue), les fils
     (électrique), devant la lampe (lumière), la lampe (thermique, perdue).
     Énergie à la fin : la lumière et les deux énergies thermiques. */
  const START = 100;
  const TURNS = 3;            // tours de manivelle pour donner 100 units
  const SPOTS = ['crank', 'dynamo', 'wires', 'light', 'lamp'];
  const SPOT_TOOL = { crank: 'meter', dynamo: 'camera', wires: 'meter', light: 'lightmeter', lamp: 'camera' };
  const TOOLS = ['meter', 'lightmeter', 'camera'];
  const FORMS = ['chemical', 'mechanical', 'thermal', 'electrical', 'light', 'nuclear'];
  const BOX_FORM = { crank: 'mechanical', dynamo: 'thermal', wires: 'electrical', light: 'light', lamp: 'thermal' };
  const END_ROWS = ['dynamo', 'light', 'lamp'];
  const AMOUNTS = ['more', 'same', 'less'];
  const FATES = ['air', 'destroyed', 'stored'];
  const REST_FORMS = FORMS.filter(f => f !== 'light');
  const VALUES_TOTAL = SPOTS.length * 2;

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
      tool: null,                    // instrument choisi au toucher
      forms: {},                     // { point: forme } cases du diagramme
      pick: null,                    // forme choisie au toucher
      diagLamp: run.pair[0],         // lampe dont le diagramme montre les valeurs
      concl: { q1: null, start: null, ticks: [], totals: {}, q2: null, rest: null, fate: null, v1: null, v2: null },
      selected: 'measures'
    };
    run.pair.forEach(k => { state.energy[k] = 0; state.measured[k] = {}; state.values[k] = {}; });
    glow = 0;
    crankAngle = 0;
    stepperDone = null;
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
     Deux vues (onglets) : le banc, puis le diagramme de flux, qui s'ouvre
     une fois le tableau complet. Le tableau reste à droite dans les deux. */
  let stepperDone = null;

  function renderExperiment() {
    // Ce qui manque est signalé dans la vue où il se trouve.
    if (lab.state.showMissing && !lab.isFrozen()) {
      if (!valuesComplete()) state.view = 'bench';
      else if (formsPlaced() < SPOTS.length) state.view = 'diagram';
    }
    const diagram = state.view === 'diagram';
    lab.body.innerHTML = `<div class="eb-run">` +
      `<section class="eb-main">` +
        tabsHTML() +
        `<div class="lab-scene-wrap eb-scene-wrap ${diagram && state.pick ? 'is-picking' : ''} ${!diagram && state.tool ? 'is-armed' : ''}" data-stage>` +
          (diagram ? diagramStageHTML() : benchSVG()) + `</div>` +
        `<p class="lab-caption" data-caption aria-live="polite"></p>` +
        `<div class="eb-kit">${diagram ? paletteHTML() : kitHTML()}</div>` +
      `</section>` +
      `<section class="eb-side">` +
        `<div class="eb-side-head"><h3 class="lab-panel-title">${LABELS.tableTitle}</h3><span class="eb-unit">${LABELS.tableUnit}</span></div>` +
        `<div class="lab-table-wrap eb-table-wrap">${tableHTML('run')}</div>` +
        `<div class="eb-reminder"><p class="eb-kicker">${LABELS.yourQuestions}</p>${questionsHTML()}</div>` +
      `</section></div>`;

    bindTabs();
    if (diagram) bindDiagram();
    else { bindKit(); bindCrank(); }
    bindTable();
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
      state.tool = null;
      state.pick = null;
      renderExperiment();
    }));
    const tab = $('[data-view="diagram"]');
    if (state.view !== 'diagram' && !valuesComplete()) {
      lab.setLock(tab, LABELS.lockValues(VALUES_TOTAL - valuesWritten()), { missing: true, key: 'tab-diagram' });
    }
  }

  /* --- Le banc : viewBox 640 × 360, paillasse à y = 296 ---
     Dynamo à gauche (manivelle sur sa face), fils, lampe sur son support à
     droite. Cinq points de mesure, puis une étiquette par mesure faite. */
  const BENCH_Y = 296;
  const AXLE = { x: 132, y: 244 };
  const ARM = 44;
  const LAMP_C = { x: 470, y: 192 };   // centre du verre
  const SPOT_POS = { crank: [132, 244], dynamo: [232, 222], wires: [366, 254], light: [574, 188], lamp: [470, 192] };
  const BADGE_POS = { crank: [100, 168], dynamo: [230, 168], wires: [366, 324], light: [580, 126], lamp: [470, 116] };

  let crankAngle = 0;   // radians, sens horaire à l'écran
  let glow = 0;         // éclat de la lampe pendant qu'on tourne (0 à 1)

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

    // Manivelle : disque, bras qui tourne, poignée à saisir
    out += `<circle cx="${AXLE.x}" cy="${AXLE.y}" r="24" fill="#b7c1cc" stroke="#7d8a97" stroke-width="1.5"/>` +
      `<g id="eb-arm" transform="rotate(${(crankAngle * 180 / Math.PI).toFixed(1)} ${AXLE.x} ${AXLE.y})">` +
        `<rect x="${AXLE.x - 5}" y="${AXLE.y - 5}" width="${ARM + 10}" height="10" rx="5" fill="#8d99a6" stroke="#5d6773" stroke-width="1.2"/>` +
        `<circle cx="${AXLE.x + ARM}" cy="${AXLE.y}" r="11" fill="#c98a4b" stroke="#8a5a2b" stroke-width="1.5"/>` +
        `<circle cx="${AXLE.x + ARM - 3}" cy="${AXLE.y - 3}" r="3" fill="#ffffff" fill-opacity="0.35"/>` +
        `<circle class="eb-knob ${k && !done ? 'is-ready' : ''}" data-knob cx="${AXLE.x + ARM}" cy="${AXLE.y}" r="22" fill="transparent" tabindex="0" role="button" aria-label="${LABELS.scene.knob}"/>` +
      `</g><circle cx="${AXLE.x}" cy="${AXLE.y}" r="7" fill="#5d6773"/>`;

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
    return `<g class="eb-spot" data-spot="${s}" tabindex="0" role="button" aria-label="${escapeHtml(LABELS.scene.spot(LABELS.rows[s]))}">` +
      `<circle cx="${x}" cy="${y}" r="18" fill="transparent"/>` +
      `<circle class="eb-spot-ring" cx="${x}" cy="${y}" r="13"/>` +
      `<circle class="eb-spot-dot" cx="${x}" cy="${y}" r="3.5"/></g>`;
  }

  function badgeSVG(s, value, fresh) {
    const [x, y] = BADGE_POS[s];
    const [sx, sy] = SPOT_POS[s];
    return `<g class="eb-badge is-${SPOT_TOOL[s]} ${fresh ? 'is-fresh' : ''}">` +
      `<line class="eb-badge-line" x1="${sx}" y1="${sy}" x2="${x}" y2="${y}"/>` +
      `<circle class="eb-badge-pin" cx="${sx}" cy="${sy}" r="5"/>` +
      `<rect class="eb-badge-box" x="${x - 52}" y="${y - 15}" width="104" height="30" rx="8"/>` +
      `<text class="eb-badge-text" x="${x}" y="${y + 5}" text-anchor="middle"><tspan class="eb-badge-num">${value}</tspan> ${LABELS.scene.units}</text></g>`;
  }

  /* Lampes et instruments, sous le banc. Une lampe se glisse dans la
     douille (ou se touche) ; changer de lampe ne perd rien : chaque lampe
     garde son test et ses mesures. Les instruments restent verrouillés tant
     que la lampe vissée n'a pas reçu ses 100 units. */
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
    const tools = TOOLS.map(t => `<button type="button" class="eb-item eb-tool ${state.tool === t ? 'is-selected' : ''}" data-tool="${t}" aria-pressed="${state.tool === t}">` +
      `<span class="eb-item-icon">${TOOL_ICONS[t]}</span><span class="eb-item-text"><strong>${LABELS.tools[t]}</strong></span></button>`).join('');
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
        ghost: () => `<div class="eb-ghost eb-ghost-tool">${TOOL_ICONS[t]}</div>`,
        targets: () => $$('[data-spot]'),
        onDrop: target => measure(t, target.dataset.spot),
        onTap: () => pickTool(t)
      });
    });
    $$('[data-spot]').forEach(el => {
      const go = () => {
        if (state.tool) measure(state.tool, el.dataset.spot);
        else setCaption(LABELS.captionPickTool, true);
      };
      el.addEventListener('click', go);
      el.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        go();
      });
    });
  }

  function insertLamp(k) {
    if (state.socket === k) return;
    state.socket = k;
    state.tool = null;
    glow = 0;
    crankAngle = 0;
    renderExperiment();
    if (tested(k)) setCaption(LABELS.captionAlready);
    lab.save();
  }

  function pickTool(t) {
    state.tool = state.tool === t ? null : t;
    $$('[data-tool]').forEach(el => {
      const on = el.dataset.tool === state.tool;
      el.classList.toggle('is-selected', on);
      el.setAttribute('aria-pressed', String(on));
    });
    const stage = $('[data-stage]');
    if (stage) stage.classList.toggle('is-armed', !!state.tool);
    setCaption(defaultCaption());
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
    state.tool = null;
    freshBadge = s;
    renderExperiment();
    const input = $(`[data-cell="${k}|${s}"]`);
    if (input && !written(k, s)) input.focus({ preventScroll: true });
    lab.save();
  }

  /* Manivelle : le bras suit le doigt autour de l'axe ; l'énergie donnée
     compte l'angle parcouru, dans un sens comme dans l'autre (3 tours pour
     100 units). Plus on tourne vite, plus la lampe brille. À 100 units, le
     banc s'arrête : les deux lampes reçoivent exactement la même énergie.
     Clavier : flèches, Entrée ou Espace font avancer d'un douzième de tour. */
  function bindCrank() {
    const knob = $('[data-knob]');
    if (!knob) return;
    const k = state.socket;
    lab.setLock(knob, !k ? LABELS.lockNoLamp : tested(k) ? LABELS.lockCrankDone : null, { icon: false });
    knob.addEventListener('pointerdown', e => {
      if (e.button !== 0 || !k || tested(k)) return;
      e.preventDefault();
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
      if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(e.key)) return;
      e.preventDefault();
      if (!k || tested(k)) return;
      crankAngle += Math.PI / 6;
      startGlowLoop(lab.newScene());
      turn(k, Math.PI / 6, 0.008);
      lab.save();
    });
  }

  function turn(k, rad, speed) {
    const before = state.energy[k];
    state.energy[k] = Math.min(START, before + rad / (2 * Math.PI) * (START / TURNS));
    const target = Math.min(1, speed / 0.012);
    glow += (target - glow) * 0.35;
    // Premier tour : les hypothèses sont désormais figées (voir renderPredict).
    if (before === 0) setCaption(LABELS.captionTurning);
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

  function applyGlow(k) {
    const L = LAMPS[k];
    const on = glow > 0.05;
    const g = $('#eb-glow');
    if (g) g.setAttribute('opacity', (glow * L.bright).toFixed(3));
    const glass = $('#eb-bulb-glass');
    if (glass) glass.setAttribute('fill', on ? L.glass : GLASS_OFF);
    const fil = $('#eb-bulb-fil');
    if (fil) fil.setAttribute('stroke', on ? WIRE_ON : WIRE_OFF);
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
    state.tool = null;
    renderExperiment();
    setCaption(LABELS.captionTestDone);
    lab.renderStepper();
    lab.save();
  }

  /* --- Le tableau des mesures ---
     Une ligne par point de mesure, une colonne par lampe. Une case ne devient
     un champ qu'une fois le point mesuré : impossible de deviner. */
  function tableHTML(mode) {
    const read = mode === 'read';
    const miss = lab.state.showMissing && !read;
    const head = `<tr><th scope="col" class="eb-th-where">${LABELS.tableWhere}</th>` +
      run.pair.map(k => `<th scope="col"><span class="eb-th-lamp">${lampIcon(k)}<span>${lampName(k)}</span></span></th>`).join('') +
      (read ? `<th scope="col" class="eb-th-tick">${LABELS.tickHead}</th>` : '') + `</tr>`;
    const rows = SPOTS.map(s => `<tr><th scope="row" class="eb-row-head">${LABELS.rows[s]}</th>` +
      run.pair.map(k => `<td>${read ? readCell(k, s) : cellHTML(k, s, miss && !written(k, s))}</td>`).join('') +
      (read ? `<td>${tickHTML(s)}</td>` : '') + `</tr>`).join('');
    return `<table class="lab-table eb-table"><thead>${head}</thead><tbody>${rows}</tbody></table>`;
  }

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
    if (state.view === 'diagram') {
      // Les flèches suivent les valeurs du tableau.
      const holder = $('[data-diagram]');
      if (holder) {
        holder.innerHTML = diagramSVG({ lamp: state.diagLamp, mode: 'edit' });
        bindBoxes();
      }
    } else {
      const lampsGroup = $('.eb-group-lamps .eb-group-items');
      if (lampsGroup) {
        // Coche des lampes complètes, sans recréer les boutons (geste en cours).
        run.pair.forEach(k => {
          const btn = $(`[data-lamp="${k}"]`);
          if (!btn) return;
          const complete = tested(k) && SPOTS.every(s => written(k, s));
          let check = btn.querySelector('.eb-item-check');
          if (complete && !check) btn.insertAdjacentHTML('beforeend', `<span class="eb-item-check" aria-hidden="true">✓</span>`);
          if (!complete && check) check.remove();
        });
      }
    }
    setCaption(defaultCaption());
    updateRunFooter();
  }

  function defaultCaption() {
    if (state.view === 'diagram') {
      if (formsPlaced() === SPOTS.length) return LABELS.captionDiagramDone;
      return state.pick ? LABELS.captionFormPicked(LABELS.forms[state.pick]) : LABELS.captionDiagram;
    }
    const k = state.socket;
    if (!k) return LABELS.captionStart;
    if (!tested(k)) return state.energy[k] > 0 ? LABELS.captionTurning : LABELS.captionReady;
    if (SPOTS.some(s => !state.measured[k][s])) {
      return state.tool ? LABELS.captionToolPicked(LABELS.tools[state.tool]) : LABELS.captionMeasure;
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
        state.tool = null;
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

  /* --- Le diagramme de flux d'énergie : viewBox 640 × 330 ---
     Ovales : les objets ; flèches horizontales : l'énergie utile qui passe
     d'un objet au suivant ; flèches rouges : l'énergie perdue dans l'air.
     Une case par flèche, pour la forme d'énergie. Largeur des flèches : les
     valeurs du tableau de l'élève (même fausses) pour la lampe choisie. */
  const DG_Y = 206;
  const OVAL = { rx: 46, ry: 29, hand: 56, dynamo: 232, lamp: 410, room: 586 };
  const H_ARROWS = { crank: [102, 186], wires: [278, 364], light: [456, 540] };
  const V_ARROWS = { dynamo: 232, lamp: 410 };
  const BOX_POS = { crank: [144, 263], wires: [321, 263], light: [498, 263], dynamo: [136, 118], lamp: [506, 118] };
  const USEFUL = '#8a9bb8';
  const WASTED = '#d64545';
  const thick = v => (v == null ? 3 : Math.max(3, Math.min(40, v * 0.4)));

  function hArrow(x1, x2, y, t, colour) {
    const head = 14, hw = t / 2 + 7;
    return `<path d="M${x1},${y - t / 2} L${x2 - head},${y - t / 2} L${x2 - head},${y - hw} L${x2},${y} L${x2 - head},${y + hw} L${x2 - head},${y + t / 2} L${x1},${y + t / 2} Z" fill="${colour}"/>`;
  }

  // De y1 (en bas) à la pointe y2 (en haut).
  function vArrow(x, y1, y2, t, colour) {
    const head = 14, hw = t / 2 + 7;
    return `<path d="M${x - t / 2},${y1} L${x - t / 2},${y2 + head} L${x - hw},${y2 + head} L${x},${y2} L${x + hw},${y2 + head} L${x + t / 2},${y2 + head} L${x + t / 2},${y1} Z" fill="${colour}"/>`;
  }

  // o.mode : 'edit' (cases à remplir), 'check' (cases justes ou fausses).
  function diagramSVG(o) {
    const k = o.lamp;
    const val = s => state.values[k][s];
    const missing = o.mode === 'edit' && lab.state.showMissing;
    let out = `<svg class="lab-svg eb-diagram" viewBox="0 0 640 330" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${LABELS.diagram.label}">`;

    Object.keys(H_ARROWS).forEach(s => {
      const [x1, x2] = H_ARROWS[s];
      const v = val(s), t = thick(v);
      out += hArrow(x1, x2, DG_Y, t, USEFUL) +
        `<text class="eb-arrow-val" x="${(x1 + x2 - 14) / 2}" y="${DG_Y - t / 2 - 8}" text-anchor="middle">${v == null ? '?' : v}</text>`;
    });
    Object.keys(V_ARROWS).forEach(s => {
      const x = V_ARROWS[s];
      const v = val(s), t = thick(v);
      const right = s === 'dynamo';
      out += vArrow(x, DG_Y - OVAL.ry + 4, 66, t, WASTED) +
        `<text class="eb-arrow-val is-wasted" x="${right ? x + t / 2 + 7 : x - t / 2 - 7}" y="140" text-anchor="${right ? 'start' : 'end'}">${v == null ? '?' : v}</text>` +
        `<text class="eb-air" x="${x}" y="54" text-anchor="middle">${LABELS.diagram.air}</text>`;
    });
    ['hand', 'dynamo', 'lamp', 'room'].forEach(n => {
      out += `<ellipse class="eb-oval" cx="${OVAL[n]}" cy="${DG_Y}" rx="${OVAL.rx}" ry="${OVAL.ry}"/>` +
        `<text class="eb-oval-text" x="${OVAL[n]}" y="${DG_Y + 4.5}" text-anchor="middle">${LABELS.diagram[n]}</text>`;
    });
    SPOTS.forEach(s => {
      const [x, y] = BOX_POS[s];
      const f = state.forms[s];
      const cls = ['eb-box', f ? '' : 'is-empty',
        o.mode === 'check' ? (f === BOX_FORM[s] ? 'is-ok' : 'is-ko') : '',
        missing && !f ? 'is-missing' : ''].join(' ');
      const aria = escapeHtml(`${LABELS.arrows[s]} : ${f ? LABELS.forms[f] : LABELS.diagram.emptyBox}`);
      out += `<g class="${cls}" ${o.mode === 'edit' ? `data-box="${s}" tabindex="0" role="button"` : ''} aria-label="${aria}">` +
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

  function diagramStageHTML() {
    const toggle = run.pair.map(k => `<button type="button" class="lab-choice eb-diag-lamp ${state.diagLamp === k ? 'is-selected' : ''}" data-diag-lamp="${k}" data-lab-look aria-pressed="${state.diagLamp === k}">${lampIcon(k)}<span>${lampName(k)}</span></button>`).join('');
    return `<div class="eb-diag-toggle"><span>${LABELS.valuesOf}</span>${toggle}</div>` +
      `<div class="eb-diag-holder" data-diagram>${diagramSVG({ lamp: state.diagLamp, mode: 'edit' })}</div>`;
  }

  function paletteHTML() {
    const chips = FORMS.map(f => `<button type="button" class="lab-choice eb-form-chip ${state.pick === f ? 'is-selected' : ''}" data-form="${f}" aria-pressed="${state.pick === f}">${LABELS.forms[f]}</button>`).join('');
    return `<div class="eb-group eb-group-forms"><span class="eb-group-title">${LABELS.formsTitle}</span><div class="eb-group-items">${chips}</div></div>`;
  }

  function bindDiagram() {
    $$('[data-form]').forEach(el => {
      const f = el.dataset.form;
      lab.makeDraggable(el, {
        ghost: () => `<div class="eb-ghost eb-ghost-form">${LABELS.forms[f]}</div>`,
        targets: () => $$('[data-box]'),
        onDrop: target => setForm(target.dataset.box, f),
        onTap: () => {
          state.pick = state.pick === f ? null : f;
          $$('[data-form]').forEach(b => {
            const on = b.dataset.form === state.pick;
            b.classList.toggle('is-selected', on);
            b.setAttribute('aria-pressed', String(on));
          });
          const stage = $('[data-stage]');
          if (stage) stage.classList.toggle('is-picking', !!state.pick);
          setCaption(defaultCaption());
        }
      });
    });
    $$('[data-diag-lamp]').forEach(b => b.addEventListener('click', () => {
      state.diagLamp = b.dataset.diagLamp;
      $$('[data-diag-lamp]').forEach(x => {
        const on = x === b;
        x.classList.toggle('is-selected', on);
        x.setAttribute('aria-pressed', String(on));
      });
      $('[data-diagram]').innerHTML = diagramSVG({ lamp: state.diagLamp, mode: 'edit' });
      bindBoxes();
    }));
    bindBoxes();
  }

  function bindBoxes() {
    $$('[data-box]').forEach(el => {
      const go = () => {
        if (state.pick) setForm(el.dataset.box, state.pick);
        else setCaption(LABELS.captionPickForm, true);
      };
      el.addEventListener('click', go);
      el.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        go();
      });
    });
  }

  function setForm(box, f) {
    state.forms[box] = f;
    state.pick = null;
    if (lab.state.showMissing && formsPlaced() === SPOTS.length) lab.state.showMissing = false;
    renderExperiment();
    lab.save();
  }

  /* ===== Étape 3 : conclusion =====
     À gauche, le tableau (lecture seule) où l'on coche ce qui est là à la
     fin ; à droite, les deux questions et le jugement des hypothèses. */
  function conclusionParts() {
    const c = state.concl;
    return {
      q1: !!c.q1,
      balance: c.start != null && c.ticks.length > 0 && run.pair.every(k => c.totals[k] != null),
      q2: !!c.q2,
      rest: !!(c.rest && c.fate),
      verdict: !!(c.v1 && c.v2)
    };
  }

  function conclusionsComplete() {
    return Object.values(conclusionParts()).every(Boolean);
  }

  function tickHTML(s) {
    const on = state.concl.ticks.includes(s);
    return `<button type="button" class="lab-choice eb-tick ${on ? 'is-selected' : ''}" data-tick="${s}" aria-pressed="${on}" aria-label="${escapeHtml(LABELS.tickRow(LABELS.rows[s]))}">${on ? '✓' : ''}</button>`;
  }

  function numInput(attr, value, aria, missing) {
    return `<input type="text" inputmode="numeric" class="eb-num-input ${missing ? 'lab-is-missing' : ''}" ${attr} value="${value == null ? '' : value}" maxlength="3" autocomplete="off" spellcheck="false" aria-label="${escapeHtml(aria)}">`;
  }

  function renderConclude() {
    const c = state.concl;
    const parts = conclusionParts();
    const show = lab.state.showMissing;
    const miss = key => (show && !parts[key] ? 'lab-is-missing' : '');
    const chip = (field, val, label, icon) => `<button type="button" class="lab-choice eb-chip ${c[field] === val ? 'is-selected' : ''}" data-c="${field}" data-val="${val}" aria-pressed="${c[field] === val}">${icon || ''}<span>${label}</span></button>`;
    const totals = run.pair.map(k => `<span class="eb-total">${lampIcon(k)}<span>${lampName(k)}</span>` +
      numInput(`data-total="${k}"`, c.totals[k], LABELS.totalAria(lampThe(k)), show && c.totals[k] == null) +
      `<span>${LABELS.unitsWord}</span></span>`).join('');

    lab.body.innerHTML = `<div class="eb-conclude">` +
      `<section class="eb-read">` +
        `<div class="eb-side-head"><h3 class="lab-panel-title">${LABELS.tableTitle}</h3><span class="eb-unit">${LABELS.tableUnit}</span></div>` +
        `<div class="lab-table-wrap eb-table-wrap ${show && !c.ticks.length ? 'lab-is-missing' : ''}">${tableHTML('read')}</div>` +
        `<p class="eb-hint">${gloss(LABELS.tickHint)}</p>` +
      `</section>` +
      `<section class="eb-form">` +
        `<div class="eb-q ${miss('q1')}">` +
          `<p class="eb-q-title"><span class="eb-num" aria-hidden="true">1</span><span>${gloss(LABELS.questions[run.ask])}</span></p>` +
          `<p class="eb-sentence-sm">${gloss(LABELS.concl1[run.ask](blankHTML(c.q1 && lampThe(c.q1))))}</p>` +
          `<div class="eb-chips">${run.pair.map(k => chip('q1', k, lampThe(k), lampIcon(k))).join('')}</div>` +
        `</div>` +
        `<div class="eb-q">` +
          `<p class="eb-q-title"><span class="eb-num" aria-hidden="true">2</span><span>${gloss(LABELS.questions.end)}</span></p>` +
          `<div class="eb-balance ${miss('balance')}">` +
            `<div class="eb-bal-row"><span class="eb-bal-label">${LABELS.startLabel}</span>` +
              numInput('data-start', c.start, LABELS.startAria, show && c.start == null) + `<span>${LABELS.unitsWord}</span></div>` +
            `<div class="eb-bal-row"><span class="eb-bal-label">${LABELS.endLabel}</span>${totals}</div>` +
          `</div>` +
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
    $$('[data-tick]').forEach(btn => btn.addEventListener('click', () => {
      const s = btn.dataset.tick;
      c.ticks = c.ticks.includes(s) ? c.ticks.filter(x => x !== s) : SPOTS.filter(x => x === s || c.ticks.includes(x));
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
    bindNum($('[data-start]'), v => { c.start = v; });
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
    const ticks = SPOTS.filter(s => c.ticks.includes(s));
    const ticksOk = ticks.length === END_ROWS.length && END_ROWS.every(s => ticks.includes(s));
    const startOk = c.start === START;
    const totalOk = k => c.totals[k] != null && c.totals[k] === sumOf(k, ticks);
    const totalsOk = run.pair.every(totalOk);
    const q1Ok = c.q1 === truth1();
    const q2Ok = c.q2 === 'same';
    const restOk = c.rest === 'thermal';
    const fateOk = c.fate === 'air';
    const should1 = state.hyp.h1 === c.q1 ? 'confirmed' : 'rejected';
    const should2 = state.hyp.h2 === c.q2 ? 'confirmed' : 'rejected';
    return {
      misses, good, total: VALUES_TOTAL, formsWrong, ticks, ticksOk, startOk, totalOk, totalsOk,
      q1Ok, q2Ok, restOk, fateOk, should1, should2,
      v1Ok: c.v1 === should1, v2Ok: c.v2 === should2,
      measures: misses.length === 0,
      forms: formsWrong.length === 0,
      balance: ticksOk && startOk && totalsOk,
      answers: q1Ok && q2Ok && restOk && fateOk,
      verdicts: c.v1 === should1 && c.v2 === should2
    };
  }

  const missText = m => CHECK.measureMiss(LABELS.rows[m.s], lampName(m.k), m.v == null ? CHECK.nothing : m.v, m.r);
  const endNames = rows => LABELS.list(rows.map(s => CHECK.endNames[s]));

  // Ce qui ne va pas dans les lignes cochées, en une ou plusieurs phrases.
  function ticksNotes(ev) {
    const notes = [];
    if (ev.ticks.includes('wires')) notes.push(CHECK.ticksWires);
    if (ev.ticks.includes('crank')) notes.push(CHECK.ticksCrank);
    const forgot = END_ROWS.filter(s => !ev.ticks.includes(s));
    if (forgot.length) notes.push(CHECK.ticksMissing(endNames(forgot)));
    return notes;
  }

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
      return `<div class="eb-diag-mini">${diagramSVG({ lamp: state.diagLamp, mode: 'check' })}</div>` +
        (ev.forms ? `<p class="eb-ok">${CHECK.formsAllGood}</p>` : `<ul class="eb-misslist">${wrong}</ul>`) +
        `<p>${gloss(CHECK.formsSummary)}</p>`;
    }
    if (key === 'balance') {
      let html = `<p class="${ev.startOk ? 'eb-ok' : 'eb-ko'}">${ev.startOk ? CHECK.startOk : CHECK.startWrong(c.start == null ? CHECK.nothing : c.start)}</p>`;
      html += ev.ticksOk ? `<p class="eb-ok">${CHECK.ticksOk(endNames(END_ROWS))}</p>`
        : ticksNotes(ev).map(n => `<p class="eb-ko">${gloss(n)}</p>`).join('');
      html += run.pair.map(k => {
        const expr = exprOf(k, ev.ticks);
        const sum = sumOf(k, ev.ticks);
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
    let start = c.start == null ? '—' : String(c.start);
    if (!ev.startOk) start = mark(start, CHECK.startWrong(c.start == null ? CHECK.nothing : c.start));
    let rowsText = ev.ticks.length ? LABELS.list(ev.ticks.map(s => LABELS.rows[s])) : '—';
    if (!ev.ticksOk) rowsText = mark(rowsText, plain(ticksNotes(ev).join(' ')));
    const ends = run.pair.map(k => {
      const expr = exprOf(k, ev.ticks);
      let total = c.totals[k] == null ? '—' : String(c.totals[k]);
      if (!ev.totalOk(k)) total = mark(total, CHECK.totalWrong(lampName(k), c.totals[k] == null ? CHECK.nothing : c.totals[k], expr, sumOf(k, ev.ticks)));
      return `<li>${R.end(lampThe(k), expr, total)}</li>`;
    }).join('');
    const lightOf = k => (state.values[k].light == null ? '—' : state.values[k].light);
    const interpretation = `<p>${R.light(lampThe(a), lightOf(a), lampThe(b), lightOf(b))}</p>` +
      `<p>${R.start(start)} ${R.endRows(rowsText)}</p><ul>${ends}</ul>`;

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
    version: 1,
    save: () => ({ run, state }),
    // Ce qui ne vaut que pendant un geste (instrument ou forme choisis) repart à zéro.
    load(data) {
      const r = data.run, s = data.state;
      if (!r || !Array.isArray(r.pair) || !r.pair.every(k => LAMPS[k]) || !r.readings || !LABELS.questions[r.ask] ||
        !s || !s.hyp || !s.concl || !s.energy || !s.values || !s.measured) throw new Error('labProgress');
      run = r;
      state = Object.assign(s, { tool: null, pick: null });
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
