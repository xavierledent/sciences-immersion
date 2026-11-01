/* ===== Labo virtuel « Zoom in » (chem2) : le microscope des molécules =====

   Simulation propre à ce labo, commune aux deux filières ; ses textes sont
   dans le dossier du chapitre, un fichier par langue (lab-zoom.en.js,
   lab-zoom.nl.js). Le cadre commun (modale, barre d'étapes, verrous,
   traduction, rapport imprimé) est dans lab-engine.js. Ordre de chargement :
   moteur, textes, ce fichier.

   Le labo réel du chapitre (la séparation) a déjà son labo virtuel : celui-ci
   est une expérience sur un modèle, partie du cours (partie 2 : molécules,
   modèles moléculaires, limites d'un modèle). Mêmes couleurs de particules
   et mêmes nombres que le cours.

   Deux bocaux sans étiquette : à l'œil nu, deux bocaux peuvent se ressembler.
   Le microscope est imaginaire : il donne la composition (types et nombres),
   jamais la disposition. L'élève pose lui-même les particules sur la lame :
   le sel se répartit dans l'eau, l'huile reste au-dessus. Le modèle de
   référence n'apparaît qu'après la comparaison, et le modèle de l'élève se
   fige alors (pour réessayer : refaire le labo).

   Tirés au sort : un corps pur et un mélange (8 paires), leur place (bocal A
   ou B), la disposition du modèle de référence.

   Déroulé :
     1. Predict    — chaque bocal vu à l'œil nu : corps pur, mélange homogène
                     ou hétérogène ; un modèle montre-t-il la réalité telle
                     qu'elle est ?
     2. Experiment — pour chaque bocal, dans l'ordre voulu : microscope,
                     construire le modèle, comparer, noter (nombre de types,
                     corps pur ou mélange, homogène ou hétérogène)
     3. Conclude   — question 1 (répondre à un camarade de classe), question 2 (ce qui n'est
                     pas vrai dans le modèle, pourquoi des couleurs), jugement
                     des trois hypothèses
     4. Check      — 5 vérifications : particules, disposition, classement,
                     conclusion, limites du modèle ; rapport (FO3) */

(function () {
  'use strict';

  const { escapeHtml, shuffle, mulberry32, seedFrom } = LabEngine.util;

  // Cadre commun, créé en fin de fichier (LabEngine.create).
  let lab;
  const $ = sel => lab.$(sel);
  const $$ = sel => lab.$$(sel);
  const gloss = text => lab.gloss(text);

  /* ===== Textes =====
     Dans le dossier du chapitre, un fichier par langue (lab-zoom.en.js,
     lab-zoom.nl.js), chargé avant celui-ci. */
  const {
    labels: LABELS, glossary: GLOSSARY, explanations: EXPLAIN, check: CHECK
  } = LabEngine.textFor('zoom');

  /* ===== Le modèle ===== */
  // Les couleurs des particules : la clé du cours.
  const PARTICLES = {
    water: '#1f5fd6',
    salt: '#8b45ad',
    nitrogen: '#2f9e4f',
    oxygen: '#d62b2b',
    oil: '#f28c1f',
    co2: '#1c1c1c'
  };
  const PARTICLE_KEYS = Object.keys(PARTICLES);

  // look : ce qu'on voit à l'œil nu ; kind : pure, homo, hetero.
  const SAMPLES = {
    water: { look: 'clear', kind: 'pure', parts: { water: 6 } },
    oxygen: { look: 'gas', kind: 'pure', parts: { oxygen: 8 } },
    air: { look: 'gas', kind: 'homo', parts: { nitrogen: 8, oxygen: 3 } },
    salty: { look: 'clear', kind: 'homo', parts: { water: 8, salt: 4 } },
    sparkling: { look: 'clear', kind: 'homo', parts: { water: 10, co2: 2 } },
    oilwater: { look: 'layers', kind: 'hetero', parts: { water: 8, oil: 4 } }
  };
  const SAMPLE_KEYS = Object.keys(SAMPLES);
  const PURE = SAMPLE_KEYS.filter(id => SAMPLES[id].kind === 'pure');
  const MIXED = SAMPLE_KEYS.filter(id => SAMPLES[id].kind !== 'pure');

  const JARS = ['A', 'B'];
  const KINDS = ['pure', 'homo', 'hetero'];
  const NOTE_KINDS = ['pure', 'mixture'];
  const MIXES = ['homo', 'hetero'];
  const COUNTS = ['1', '2', '3'];
  const MODEL_WORDS = ['exact', 'simplified'];
  const LIMITS = ['colour', 'size', 'move', 'types'];
  const LIMITS_TRUE = ['colour', 'size', 'move'];
  const WHYS = ['apart', 'real', 'nice'];

  /* La lame : coordonnées de 0 à 1, centre (0,5 ; 0,5). Un centre de particule
     reste à INNER du centre de la lame. */
  const PR = 0.052;        // rayon d'une particule
  const INNER = 0.43;
  const RIM = 0.49;
  const MAX_PARTICLES = 24;
  const TAP_PX = 6;        // en dessous, un geste sur une particule est un toucher

  let run;      // tirage : le contenu des bocaux, la graine du modèle de référence
  let state;    // travail de l'élève

  function draw() {
    const pure = shuffle(PURE)[0];
    const mixed = shuffle(MIXED)[0];
    const [a, b] = shuffle([pure, mixed]);
    return { jars: { A: a, B: b }, seed: Math.floor(Math.random() * 1e9) };
  }

  function reset() {
    run = draw();
    state = {
      hyp: { A: null, B: null, model: null },
      because: '',
      started: false,                     // premier bocal au microscope : hypothèses figées
      jar: null,                          // bocal sous le microscope
      color: null,                        // particule choisie dans la clé
      models: { A: [], B: [] },           // { t, x, y } : les lames de l'élève
      compared: { A: false, B: false },
      notes: { A: { n: null, kind: null, mix: null }, B: { n: null, kind: null, mix: null } },
      concl: { jar: null, type: null, n: null, model: null, limits: [], why: null, v: { A: null, B: null, model: null } },
      selected: 'particles'
    };
    stepperDone = null;
  }

  /* --- Ce que disent les bocaux --- */
  const sampleOf = jar => SAMPLES[run.jars[jar]];
  const typesOf = jar => Object.keys(sampleOf(jar).parts);
  const mixedJar = () => JARS.find(j => sampleOf(j).kind !== 'pure');
  const countText = parts => LABELS.list(Object.keys(parts).map(t => LABELS.countOf(parts[t], LABELS.particles[t].many)));
  const countsOf = points => points.reduce((o, p) => { o[p.t] = (o[p.t] || 0) + 1; return o; }, {});

  /* --- La disposition : tolérante. Un vrai groupement à part est une erreur
     dans un mélange homogène ; dans le mélange hétérogène, l'huile est
     au-dessus de l'eau (une particule mal placée est permise). --- */
  const centre = pts => ({
    x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
    y: pts.reduce((s, p) => s + p.y, 0) / pts.length
  });

  function isGrouped(a, b) {
    const ca = centre(a), cb = centre(b);
    const dx = cb.x - ca.x, dy = cb.y - ca.y;
    const d = Math.hypot(dx, dy);
    if (d < 0.3) return false;
    const along = p => p.x * dx + p.y * dy;
    return Math.max(...a.map(along)) < Math.min(...b.map(along));
  }

  function oilOnTop(oil, water) {
    const misplaced = t => oil.filter(p => p.y > t).length + water.filter(p => p.y < t).length;
    return oil.concat(water).some(p => misplaced(p.y) <= 1);
  }

  function arrangementOk(jar, points) {
    const s = sampleOf(jar);
    if (s.kind === 'pure') return true;
    const [first, second] = typesOf(jar).map(t => points.filter(p => p.t === t));
    if (!first.length || !second.length) return false;
    if (s.kind === 'hetero') return oilOnTop(second, first);
    return !isGrouped(first, second);
  }

  /* --- Le modèle de référence : même tirage à chaque affichage --- */
  function referenceOf(jar) {
    const s = sampleOf(jar);
    const rng = mulberry32(seedFrom(`${run.seed}-${jar}`));
    const scatter = (band, placed, t, n) => {
      let gap = 0.135, tries = 0, count = 0;
      while (count < n) {
        const x = rng(), y = band[0] + rng() * (band[1] - band[0]);
        tries++;
        if (tries > 300) { gap *= 0.9; tries = 0; }
        if (Math.hypot(x - 0.5, y - 0.5) > INNER - 0.01) continue;
        if (placed.some(p => Math.hypot(p.x - x, p.y - y) < gap)) continue;
        placed.push({ t, x, y });
        count++;
      }
    };
    for (let attempt = 0; attempt < 30; attempt++) {
      const placed = [];
      typesOf(jar).forEach(t => {
        const band = s.kind !== 'hetero' ? [0.07, 0.93] : (t === 'oil' ? [0.09, 0.4] : [0.5, 0.92]);
        scatter(band, placed, t, s.parts[t]);
      });
      if (arrangementOk(jar, placed)) return placed;
    }
    return [];
  }

  /* ===== Dessins ===== */
  // Un bocal fermé, vu à l'œil nu.
  function jarSVG(look) {
    const clip = 'M22,28 H78 V102 Q78,112 68,112 H32 Q22,112 22,102 Z';
    const liquid = {
      clear: `<rect x="22" y="44" width="56" height="68" fill="#cfe6f3" clip-path="url(#zm-jar-clip)"/>`,
      layers: `<rect x="22" y="44" width="56" height="22" fill="#f4d774" clip-path="url(#zm-jar-clip)"/>` +
        `<rect x="22" y="66" width="56" height="46" fill="#cfe6f3" clip-path="url(#zm-jar-clip)"/>`,
      gas: ''
    }[look];
    return `<svg class="zm-jar" viewBox="0 0 100 120" aria-hidden="true" focusable="false">` +
      `<defs><clipPath id="zm-jar-clip"><path d="${clip}"/></clipPath></defs>` +
      `${liquid}<path d="${clip}" fill="none" stroke="#5d728f" stroke-width="2.5"/>` +
      `<path d="M31,38 V94" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" opacity="0.8"/>` +
      `<rect x="18" y="12" width="64" height="16" rx="3" fill="#8d9db3" stroke="#5d728f" stroke-width="2"/></svg>`;
  }

  function microscopeSVG() {
    return `<svg class="zm-microscope" viewBox="0 0 120 120" aria-hidden="true" focusable="false">` +
      `<rect x="22" y="104" width="76" height="10" rx="4" fill="#5d728f"/>` +
      `<path d="M84,104 V46 Q84,28 64,26" fill="none" stroke="#8d9db3" stroke-width="9" stroke-linecap="round"/>` +
      `<rect x="30" y="78" width="54" height="7" rx="2" fill="#5d728f"/>` +
      `<rect x="44" y="72" width="26" height="6" rx="1" fill="#cfe6f3" stroke="#5d728f"/>` +
      `<g transform="rotate(-14 56 40)"><rect x="49" y="10" width="15" height="42" rx="3" fill="#5d728f"/><rect x="52" y="52" width="9" height="12" fill="#8d9db3"/></g>` +
      `</svg>`;
  }

  const particleSVG = (p, i) => `<circle cx="${(p.x * 1000).toFixed(0)}" cy="${(p.y * 1000).toFixed(0)}" r="${PR * 1000}" fill="${PARTICLES[p.t]}" stroke="#2b2b2b" stroke-width="4"${i == null ? '' : ` data-i="${i}"`}/>`;
  const slideInner = (points, live) => `<circle cx="500" cy="500" r="${RIM * 1000}" fill="#ffffff" stroke="#4a4a4a" stroke-width="14"/>` +
    points.map((p, i) => particleSVG(p, live ? i : null)).join('');
  const slideSVG = (points, cls, aria) => `<svg class="zm-slide ${cls || ''}" viewBox="0 0 1000 1000" role="img" aria-label="${escapeHtml(aria)}">${slideInner(points, false)}</svg>`;
  const dot = t => `<span class="zm-dot" style="background:${PARTICLES[t]}" aria-hidden="true"></span>`;

  /* ===== Étapes complètes (progression stricte, voir lab-engine.js) =====
     1 : les trois hypothèses ; 2 : les deux modèles comparés et le carnet
     complet ; 3 : toutes les réponses. */
  const hypDone = () => !!(state.hyp.A && state.hyp.B && state.hyp.model);
  const noteDone = jar => {
    const n = state.notes[jar];
    return !!(n.n && n.kind && (n.kind === 'pure' || n.mix));
  };
  const runDone = () => JARS.every(j => state.compared[j] && noteDone(j));

  function stepComplete(n) {
    if (n === 1) return hypDone();
    if (n === 2) return runDone();
    return conclusionsComplete();
  }

  function lockReason(n) {
    if (n === 1) return LABELS.lockHypothesis;
    if (n === 2) return LABELS.lockRun(JARS.filter(j => !state.compared[j]).length, JARS.filter(j => !noteDone(j)).length);
    return lab.L.missingConclusions;
  }

  const questionsHTML = () => `<ol class="zm-questions">${[1, 2].map(k => `<li>${gloss(LABELS.questions[k])}</li>`).join('')}</ol>`;
  const chipHTML = (attrs, label, on) => `<button type="button" class="lab-choice zm-chip ${on ? 'is-selected' : ''}" ${attrs} aria-pressed="${on}"><span>${label}</span></button>`;

  /* ===== Étape 1 : hypothèses ===== */
  function renderPredict() {
    const h = state.hyp;
    const show = lab.state.showMissing;
    const miss = ok => (show && !ok ? 'lab-is-missing' : '');
    const jarRow = jar => `<div class="zm-hyp ${miss(h[jar])}">${jarSVG(sampleOf(jar).look)}<div>` +
      `<p class="zm-sentence"><strong>${LABELS.jarName(jar)}.</strong> ${gloss(LABELS.look[sampleOf(jar).look])}</p>` +
      `<p class="zm-sentence">${gloss(LABELS.hypJar(jar))}</p>` +
      `<div class="zm-chips">${KINDS.map(k => chipHTML(`data-hyp="${jar}" data-val="${k}"`, LABELS.kindChip[k], h[jar] === k)).join('')}</div></div></div>`;

    lab.body.innerHTML = `<div class="zm-predict">` +
      `<div class="zm-question-card"><p class="zm-kicker">${LABELS.yourQuestions}</p>${questionsHTML()}` +
        `<p class="zm-intro">${gloss(LABELS.intro)}</p></div>` +
      `<div class="zm-hyp-card"><p class="zm-kicker">${LABELS.hypothesisTitle}</p>` +
        `<div class="zm-hyp-jars">${JARS.map(jarRow).join('')}</div>` +
        `<div class="zm-hyp is-wide ${miss(h.model)}"><div><p class="zm-sentence">${gloss(LABELS.hypModel)}</p>` +
          `<div class="zm-chips">${MODEL_WORDS.map(k => chipHTML(`data-hyp="model" data-val="${k}"`, LABELS.modelWords[k], h.model === k)).join('')}</div></div></div>` +
        `<label class="zm-because"><span>${LABELS.because}</span>` +
        `<input type="text" class="lab-input zm-because-input" maxlength="160" placeholder="${LABELS.becausePlaceholder}" value="${escapeHtml(state.because)}" autocomplete="off"></label>` +
      `</div></div>`;

    $$('[data-hyp]').forEach(btn => btn.addEventListener('click', () => {
      h[btn.dataset.hyp] = btn.dataset.val;
      if (lab.state.showMissing && hypDone()) lab.state.showMissing = false;
      renderPredict();
      lab.renderStepper();
    }));
    const because = $('.zm-because-input');
    because.addEventListener('input', e => { state.because = e.target.value; });
    // Hypothèses figées dès le premier bocal au microscope.
    if (state.started) {
      $$('[data-hyp]').forEach(btn => lab.setLock(btn, LABELS.lockHypothesisFixed, { icon: false }));
      because.readOnly = true;
      lab.setLock(because, LABELS.lockHypothesisFixed);
    }

    const ready = hypDone();
    const info = lab.state.showMissing && !ready ? lab.footerInfo(LABELS.lockHypothesis, true)
      : lab.footerInfo(ready ? LABELS.hypothesisReady : LABELS.hypothesisPending);
    lab.setFooter(info + `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-next>${LABELS.toBench} →</button></div>`);
    const next = $('[data-next]');
    next.addEventListener('click', () => lab.goToStep(2));
    lab.setLock(next, ready ? null : LABELS.lockHypothesis, { missing: true, key: 'next' });
  }

  /* ===== Étape 2 : le microscope =====
     À gauche, les bocaux et le microscope ; au milieu, la lame de l'élève ; à
     droite, la lecture et la clé (puis, après la comparaison, le modèle de
     référence) ; en bas, le carnet. */
  let stepperDone = null;
  let justZoomed = false;
  let captionKey = null;

  function captionFor() {
    if (!state.jar) return LABELS.captionJar;
    if (state.compared[state.jar]) return LABELS.captionCompared;
    if (captionKey) return LABELS[captionKey];
    if (!state.color) return LABELS.captionColour;
    return state.models[state.jar].length ? LABELS.captionMove : LABELS.captionPlace;
  }

  function benchHTML() {
    return `<section class="zm-bench"><h3 class="lab-panel-title">${LABELS.benchTitle}</h3>` +
      `<div class="zm-jars">${JARS.map(jar => `<button type="button" class="zm-jar-btn ${state.jar === jar ? 'is-selected' : ''}" data-jar="${jar}" data-lab-look aria-pressed="${state.jar === jar}">` +
        `${jarSVG(sampleOf(jar).look)}<span>${LABELS.jarName(jar)}</span></button>`).join('')}</div>` +
      `<div class="zm-scope">${microscopeSVG()}<span>${state.jar ? LABELS.underScope(LABELS.jarName(state.jar)) : LABELS.scopeEmpty}</span></div></section>`;
  }

  function sideHTML() {
    const jar = state.jar;
    if (!jar) return `<section class="zm-side is-empty"><p>${gloss(LABELS.sideEmpty)}</p></section>`;
    const s = sampleOf(jar);
    if (state.compared[jar]) {
      return `<section class="zm-side is-ref"><div class="zm-ref-slide"><h3 class="lab-panel-title">${LABELS.refTitle}</h3>` +
        `${slideSVG(referenceOf(jar), 'is-ref', LABELS.refAria(LABELS.jarName(jar)))}</div>` +
        `<div class="zm-ref-text"><p class="zm-kicker">${LABELS.readingTitle}</p><p class="zm-reading">${gloss(countText(s.parts))}</p>` +
        `<p>${gloss(LABELS.sampleWas(LABELS.samples[run.jars[jar]].name))}</p>` +
        `<p class="zm-muted">${gloss(LABELS.refNote)}</p></div></section>`;
    }
    return `<section class="zm-side"><p class="zm-kicker">${LABELS.readingTitle}</p>` +
      `<p class="zm-reading">${gloss(countText(s.parts))}</p>` +
      `<p class="zm-kicker">${LABELS.keyTitle}</p>` +
      `<div class="zm-key">${PARTICLE_KEYS.map(t => `<button type="button" class="lab-choice zm-key-btn ${state.color === t ? 'is-selected' : ''}" data-color="${t}" aria-pressed="${state.color === t}">${dot(t)}<span>${LABELS.particles[t].name}</span></button>`).join('')}</div>` +
      `<button type="button" class="lab-btn lab-btn-primary zm-compare" data-compare>${LABELS.compareBtn}</button></section>`;
  }

  function selectHTML(attrs, value, options, labelOf, aria, missing) {
    return `<select class="lab-select zm-select ${value ? 'is-filled' : ''} ${missing && !value ? 'lab-is-missing' : ''}" ${attrs} aria-label="${escapeHtml(aria)}">` +
      `<option value="" disabled ${value ? '' : 'selected'}>${LABELS.choose}</option>` +
      options.map(x => `<option value="${x}" ${value === x ? 'selected' : ''}>${escapeHtml(labelOf(x))}</option>`).join('') + `</select>`;
  }

  function notebookHTML() {
    const show = lab.state.showMissing;
    const rows = JARS.map(jar => {
      const n = state.notes[jar];
      return `<tr><th scope="row">${LABELS.jarName(jar)}</th>` +
        `<td>${selectHTML(`data-note="n" data-of="${jar}"`, n.n, COUNTS, x => x, LABELS.typesHead, show)}</td>` +
        `<td>${selectHTML(`data-note="kind" data-of="${jar}"`, n.kind, NOTE_KINDS, x => LABELS.noteKinds[x], LABELS.kindHead, show)}</td>` +
        `<td>${selectHTML(`data-note="mix" data-of="${jar}"`, n.mix, MIXES, x => LABELS.mixWords[x], LABELS.mixHead, show && n.kind !== 'pure')}</td></tr>`;
    }).join('');
    return `<section class="zm-notebook"><table class="lab-table zm-notes"><caption>${LABELS.notebookTitle}</caption>` +
      `<thead><tr><th scope="col"></th><th scope="col">${LABELS.typesHead}</th><th scope="col">${LABELS.kindHead}</th><th scope="col">${LABELS.mixHead}</th></tr></thead>` +
      `<tbody>${rows}</tbody></table></section>`;
  }

  function renderExperiment() {
    const jar = state.jar;
    const points = jar ? state.models[jar] : [];
    lab.body.innerHTML = `<div class="zm-run">${benchHTML()}` +
      `<section class="zm-stage"><h3 class="lab-panel-title">${jar ? LABELS.slideTitle(LABELS.jarName(jar)) : LABELS.slideTitleEmpty}</h3>` +
        `<p class="zm-caption" aria-live="polite">${gloss(captionFor())}</p>` +
        `<svg class="zm-slide is-live ${justZoomed ? 'is-zooming' : ''}" viewBox="0 0 1000 1000" role="img" aria-label="${escapeHtml(LABELS.slideAria)}">${slideInner(points, true)}</svg>` +
      `</section>${sideHTML()}${notebookHTML()}</div>`;
    justZoomed = false;

    $$('[data-jar]').forEach(btn => btn.addEventListener('click', () => {
      if (!lab.isFrozen()) state.started = true;
      if (state.jar !== btn.dataset.jar) justZoomed = true;
      state.jar = btn.dataset.jar;
      captionKey = null;
      renderExperiment();
      lab.save();
    }));
    $$('[data-color]').forEach(btn => btn.addEventListener('click', () => {
      state.color = btn.dataset.color;
      captionKey = null;
      renderExperiment();
    }));
    const compare = $('[data-compare]');
    if (compare) {
      compare.addEventListener('click', askCompare);
      lab.setLock(compare, points.length ? null : LABELS.lockEmpty);
    }
    bindSlide();
    bindNotes();
    renderRunFooter();
  }

  /* --- La lame : toucher une couleur, puis la lame ; toucher une particule
     l'enlève, la glisser la déplace. Une particule posée sur une autre est
     écartée (les cercles restent lisibles). --- */
  function settle(p, others) {
    const q = { t: p.t, x: p.x, y: p.y };
    const clamp = () => {
      const d = Math.hypot(q.x - 0.5, q.y - 0.5);
      if (d > INNER) { q.x = 0.5 + (q.x - 0.5) * INNER / d; q.y = 0.5 + (q.y - 0.5) * INNER / d; }
    };
    clamp();
    for (let round = 0; round < 24; round++) {
      let moved = false;
      others.forEach(o => {
        const dx = q.x - o.x, dy = q.y - o.y;
        const d = Math.hypot(dx, dy);
        const min = PR * 1.95;
        if (d >= min) return;
        const a = d > 0.001 ? Math.atan2(dy, dx) : round;
        q.x = o.x + Math.cos(a) * min;
        q.y = o.y + Math.sin(a) * min;
        moved = true;
      });
      clamp();
      if (!moved) break;
    }
    q.x = Math.round(q.x * 1000) / 1000;
    q.y = Math.round(q.y * 1000) / 1000;
    return q;
  }

  function bindSlide() {
    const svg = $('.zm-slide.is-live');
    const jar = state.jar;
    if (!jar) {
      lab.setLock(svg, LABELS.lockNoJar, { icon: false });
      return;
    }
    if (state.compared[jar]) {
      lab.setLock(svg, LABELS.lockModelFixed, { icon: false });
      return;
    }
    const points = state.models[jar];
    const redraw = () => { svg.innerHTML = slideInner(points, true); };
    const toSlide = e => {
      // La lame reste carrée et centrée, même si son cadre ne l'est pas.
      const r = svg.getBoundingClientRect();
      const side = Math.min(r.width, r.height);
      return {
        x: (e.clientX - r.left - (r.width - side) / 2) / side,
        y: (e.clientY - r.top - (r.height - side) / 2) / side
      };
    };
    let drag = null;

    svg.addEventListener('pointerdown', e => {
      e.preventDefault();
      const hit = e.target.closest ? e.target.closest('[data-i]') : null;
      if (hit) {
        drag = { i: Number(hit.dataset.i), x0: e.clientX, y0: e.clientY, moved: false };
        svg.setPointerCapture(e.pointerId);
        return;
      }
      const at = toSlide(e);
      if (Math.hypot(at.x - 0.5, at.y - 0.5) > RIM) return;
      if (!state.color) { captionKey = 'captionColour'; setCaption(); return; }
      if (points.length >= MAX_PARTICLES) { captionKey = 'captionFull'; setCaption(); return; }
      points.push(settle({ t: state.color, x: at.x, y: at.y }, points));
      captionKey = null;
      redraw();
      afterModel();
    });
    svg.addEventListener('pointermove', e => {
      if (!drag) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < TAP_PX) return;
      drag.moved = true;
      const at = toSlide(e);
      const others = points.filter((p, k) => k !== drag.i);
      points[drag.i] = settle({ t: points[drag.i].t, x: at.x, y: at.y }, others);
      redraw();
    });
    const end = () => {
      if (!drag) return;
      if (!drag.moved) points.splice(drag.i, 1);
      drag = null;
      captionKey = null;
      redraw();
      afterModel();
    };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', () => {
      drag = null;
      redraw();
    });
  }

  function setCaption() {
    const el = $('.zm-caption');
    if (el) el.innerHTML = gloss(captionFor());
  }

  function afterModel() {
    setCaption();
    const compare = $('[data-compare]');
    if (compare) lab.setLock(compare, state.models[state.jar].length ? null : LABELS.lockEmpty);
    updateRunFooter();
    lab.save();
  }

  function askCompare() {
    lab.confirm({
      title: LABELS.compareTitle,
      text: LABELS.compareText,
      confirm: LABELS.compareYes,
      icon: lab.lockIcon,
      focus: 'yes'
    }).then(yes => {
      if (!yes) return;
      state.compared[state.jar] = true;
      renderExperiment();
      lab.save();
    });
  }

  function bindNotes() {
    $$('select[data-note]').forEach(sel => {
      const jar = sel.dataset.of, field = sel.dataset.note;
      const n = state.notes[jar];
      if (!state.compared[jar]) lab.setLock(sel, LABELS.lockNote(LABELS.jarName(jar)));
      else if (field === 'mix' && n.kind === 'pure') lab.setLock(sel, LABELS.lockPure);
      else if (field === 'mix' && !n.kind) lab.setLock(sel, LABELS.lockKindFirst);
      sel.addEventListener('change', () => {
        n[field] = sel.value || null;
        if (field === 'kind' && n.kind === 'pure') n.mix = null;
        if (lab.state.showMissing && runDone()) lab.state.showMissing = false;
        renderExperiment();
        lab.save();
      });
    });
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
      info.textContent = warn ? lockReason(2) : LABELS.runInfo(JARS.filter(j => state.compared[j]).length, JARS.filter(noteDone).length);
      info.classList.toggle('is-warning', warn);
    }
    const next = $('[data-next]');
    if (next) lab.setLock(next, complete ? null : lockReason(2), { missing: true, key: 'next' });
    if (complete !== stepperDone) { stepperDone = complete; lab.renderStepper(); }
  }

  /* ===== Étape 3 : conclusion =====
     À gauche, les modèles de l'élève et son carnet ; à droite, les deux
     questions (listes dans les phrases), puis le jugement des hypothèses. */
  function conclusionParts() {
    const c = state.concl;
    return {
      q1: !!(c.jar && c.type && c.n),
      q2: !!(c.model && c.limits.length && c.why),
      verdict: ['A', 'B', 'model'].every(k => c.v[k])
    };
  }

  function conclusionsComplete() {
    return Object.values(conclusionParts()).every(Boolean);
  }

  const noteClass = jar => {
    const n = state.notes[jar];
    return n.kind === 'mixture' ? n.mix : n.kind;
  };
  const noteClassText = jar => (noteClass(jar) ? LABELS.kindChip[noteClass(jar)] : '—');

  function recapHTML() {
    return `<div class="zm-recap">${JARS.map(jar => `<figure class="zm-recap-jar"><figcaption><strong>${LABELS.jarName(jar)}</strong></figcaption>` +
      `${slideSVG(state.models[jar], 'is-small', LABELS.slideTitle(LABELS.jarName(jar)))}` +
      `<p>${gloss(LABELS.recapTypes(state.notes[jar].n || '—'))}</p><p><strong>${gloss(noteClassText(jar))}</strong></p></figure>`).join('')}</div>`;
  }

  function renderConclude() {
    const c = state.concl;
    const parts = conclusionParts();
    const show = lab.state.showMissing;
    const miss = key => (show && !parts[key] ? 'lab-is-missing' : '');
    const verdict = k => `<div class="zm-verdict"><span class="zm-verdict-text">${LABELS.verdictRow(k)}</span>` +
      ['confirmed', 'rejected'].map(x => `<button type="button" class="lab-choice zm-chip is-small ${c.v[k] === x ? 'is-selected' : ''}" data-v="${k}" data-val="${x}" aria-pressed="${c.v[k] === x}">${LABELS[x]}</button>`).join('') + `</div>`;

    lab.body.innerHTML = `<div class="zm-conclude">` +
      `<section class="zm-results"><h3 class="lab-panel-title">${LABELS.resultsTitle}</h3>${recapHTML()}</section>` +
      `<section class="zm-form">` +
        `<div class="zm-q ${miss('q1')}"><p class="zm-q-title"><span class="zm-num" aria-hidden="true">1</span><span>${gloss(LABELS.questions[1])}</span></p>` +
          `<p class="zm-line">${gloss(LABELS.classmate)}</p>` +
          `<p class="zm-concl-line">${LABELS.concl1(
            selectHTML('data-c="jar"', c.jar, JARS, LABELS.jarName, LABELS.jarAria, show),
            selectHTML('data-c="type"', c.type, MIXES, x => LABELS.kinds[x], LABELS.typeAria, show),
            selectHTML('data-c="n"', c.n, COUNTS, x => x, LABELS.typesHead, show))}</p></div>` +
        `<div class="zm-q ${miss('q2')}"><p class="zm-q-title"><span class="zm-num" aria-hidden="true">2</span><span>${gloss(LABELS.questions[2])}</span></p>` +
          `<p class="zm-concl-line">${LABELS.concl2(selectHTML('data-c="model"', c.model, MODEL_WORDS, x => LABELS.modelMain[x], LABELS.questions[2], show))}</p>` +
          `<p class="zm-line">${gloss(LABELS.limitsQ)} <span class="zm-hint">${LABELS.chooseSeveral}</span></p>` +
          `<div class="zm-chips">${LIMITS.map(k => chipHTML(`data-limit="${k}"`, LABELS.limits[k], c.limits.includes(k))).join('')}</div>` +
          `<p class="zm-concl-line">${LABELS.whySentence(selectHTML('data-c="why"', c.why, WHYS, x => LABELS.whys[x], LABELS.whyAria, show))}</p></div>` +
        `<div class="zm-q zm-verdicts ${miss('verdict')}">${['A', 'B', 'model'].map(verdict).join('')}</div>` +
      `</section></div>`;

    $$('select[data-c]').forEach(sel => sel.addEventListener('change', () => {
      c[sel.dataset.c] = sel.value || null;
      afterConcl();
    }));
    $$('[data-limit]').forEach(btn => btn.addEventListener('click', () => {
      const k = btn.dataset.limit;
      c.limits = c.limits.includes(k) ? c.limits.filter(x => x !== k) : LIMITS.filter(x => c.limits.includes(x) || x === k);
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
  const CRITERIA = ['particles', 'arrangement', 'classification', 'conclusion', 'limits'];
  const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));

  function particlesOk(jar) {
    const have = countsOf(state.models[jar]);
    const want = sampleOf(jar).parts;
    return sameSet(Object.keys(have), Object.keys(want)) && Object.keys(want).every(t => have[t] === want[t]);
  }

  function noteErrors(jar) {
    const n = state.notes[jar], s = sampleOf(jar);
    const want = Object.keys(s.parts).length;
    return {
      n: Number(n.n) !== want,
      kind: n.kind !== (s.kind === 'pure' ? 'pure' : 'mixture'),
      mix: s.kind !== 'pure' && n.mix !== s.kind
    };
  }

  function evaluate() {
    const c = state.concl;
    const particleMiss = JARS.filter(j => !particlesOk(j));
    const arrangeMiss = JARS.filter(j => !arrangementOk(j, state.models[j]));
    const noteMiss = JARS.filter(j => Object.values(noteErrors(j)).some(Boolean));
    const jar = mixedJar();
    const q1Ok = c.jar === jar && c.type === sampleOf(jar).kind && Number(c.n) === typesOf(jar).length;
    const should = {
      A: state.hyp.A && state.hyp.A === noteClass('A') ? 'confirmed' : 'rejected',
      B: state.hyp.B && state.hyp.B === noteClass('B') ? 'confirmed' : 'rejected',
      model: state.hyp.model && state.hyp.model === c.model ? 'confirmed' : 'rejected'
    };
    const vMiss = ['A', 'B', 'model'].filter(k => c.v[k] !== should[k]);
    const modelOk = c.model === 'simplified';
    const limitsOk = sameSet(c.limits, LIMITS_TRUE);
    const whyOk = c.why === 'apart';
    return {
      particleMiss, arrangeMiss, noteMiss, q1Ok, should, vMiss, modelOk, limitsOk, whyOk,
      particles: particleMiss.length === 0,
      arrangement: arrangeMiss.length === 0,
      classification: noteMiss.length === 0,
      conclusion: q1Ok && vMiss.length === 0,
      limits: modelOk && limitsOk && whyOk
    };
  }

  const right1 = () => {
    const jar = mixedJar();
    return LABELS.concl1(LABELS.jarName(jar), LABELS.kinds[sampleOf(jar).kind], String(typesOf(jar).length));
  };
  const placedText = jar => {
    const have = countsOf(state.models[jar]);
    return Object.keys(have).length ? countText(have) : CHECK.nothing;
  };
  const particleNote = jar => CHECK.particlesWrong(LABELS.jarName(jar), placedText(jar), countText(sampleOf(jar).parts));
  const arrangeNote = jar => CHECK.arrangeWrong(LABELS.jarName(jar), EXPLAIN.arrange[sampleOf(jar).kind]);
  const noteRight = jar => {
    const s = sampleOf(jar);
    return CHECK.noteRight(LABELS.jarName(jar), String(Object.keys(s.parts).length), LABELS.kinds[s.kind]);
  };

  function pairsHTML() {
    return `<div class="zm-pairs">${JARS.map(jar => `<figure class="zm-pair"><figcaption><strong>${LABELS.jarName(jar)}</strong> · ${gloss(LABELS.samples[run.jars[jar]].name)}</figcaption>` +
      `<div class="zm-pair-slides"><div>${slideSVG(state.models[jar], 'is-small', LABELS.slideTitle(LABELS.jarName(jar)))}<small>${LABELS.yourModel}</small></div>` +
      `<div>${slideSVG(referenceOf(jar), 'is-small', LABELS.refAria(LABELS.jarName(jar)))}<small>${LABELS.refTitle}</small></div></div></figure>`).join('')}</div>`;
  }

  function criterionDetail(key, ev) {
    const c = state.concl;
    if (key === 'particles') {
      return (ev.particles ? `<p class="zm-ok">${CHECK.particlesGood}</p>` : `<ul class="zm-misslist">${ev.particleMiss.map(j => `<li class="zm-ko">${gloss(particleNote(j))}</li>`).join('')}</ul>`) +
        pairsHTML() + `<p class="zm-muted">${gloss(EXPLAIN.particles)}</p>`;
    }
    if (key === 'arrangement') {
      return (ev.arrangement ? `<p class="zm-ok">${CHECK.arrangeGood}</p>` : `<ul class="zm-misslist">${ev.arrangeMiss.map(j => `<li class="zm-ko">${gloss(arrangeNote(j))}</li>`).join('')}</ul>`) +
        pairsHTML() + `<p class="zm-muted">${gloss(EXPLAIN.arrange[sampleOf(mixedJar()).kind])}</p>`;
    }
    if (key === 'classification') {
      return (ev.classification ? `<p class="zm-ok">${CHECK.notesGood}</p>` : `<ul class="zm-misslist">${ev.noteMiss.map(j => `<li class="zm-ko">${gloss(noteRight(j))}</li>`).join('')}</ul>`) +
        `<ul class="zm-plainlist">${JARS.map(j => `<li><strong>${LABELS.jarName(j)}</strong> · ${gloss(EXPLAIN.samples[run.jars[j]])}</li>`).join('')}</ul>`;
    }
    if (key === 'conclusion') {
      return (ev.q1Ok ? `<p class="zm-ok">${CHECK.answerOk} ${gloss(right1())}</p>` : `<p class="zm-ko">${CHECK.answerWrong} <strong>${gloss(right1())}</strong></p>`) +
        ['A', 'B', 'model'].map(k => `<p><strong>${LABELS.verdictRow(k)}</strong> · ` +
          `${ev.vMiss.includes(k) ? `<span class="zm-ko">${CHECK.verdictWrong(ev.should[k])}</span>` : `<span class="zm-ok">${CHECK.verdictOk(c.v[k])}</span>`}</p>`).join('') +
        `<p class="zm-q-head">${CHECK.yourHyps}</p><ol>${hypTexts().map(t => `<li>${gloss(t)}</li>`).join('')}</ol>` +
        (Object.values(ev.should).includes('rejected') ? `<p class="zm-muted">${CHECK.rejectedNote}</p>` : '');
    }
    return (ev.modelOk ? `<p class="zm-ok">${CHECK.answerOk} ${gloss(LABELS.concl2(LABELS.modelMain.simplified))}</p>` : `<p class="zm-ko">${CHECK.answerWrong} <strong>${gloss(LABELS.concl2(LABELS.modelMain.simplified))}</strong></p>`) +
      `<ul class="zm-plainlist">${LIMITS.map(k => {
        const right = c.limits.includes(k) === LIMITS_TRUE.includes(k);
        return `<li class="${right ? '' : 'zm-ko'}"><strong>${LABELS.limits[k]}</strong> · ${gloss(EXPLAIN.limits[k])}</li>`;
      }).join('')}</ul>` +
      (ev.whyOk ? `<p class="zm-ok">${CHECK.answerOk} ${gloss(LABELS.whySentence(LABELS.whys.apart))}</p>` : `<p class="zm-ko">${CHECK.answerWrong} <strong>${gloss(LABELS.whySentence(LABELS.whys.apart))}</strong></p>`) +
      `<p class="zm-muted">${gloss(EXPLAIN.model)}</p>`;
  }

  function hypTexts() {
    const h = state.hyp;
    return [
      LABELS.hypJarText('A', h.A ? LABELS.kinds[h.A] : '—'),
      LABELS.hypJarText('B', h.B ? LABELS.kinds[h.B] : '—'),
      LABELS.hypModelText(h.model ? LABELS.modelWords[h.model] : '—')
    ];
  }

  function renderCheck() {
    const ev = evaluate();
    const score = CRITERIA.filter(k => ev[k]).length;
    const rows = CRITERIA.map(k => `<button type="button" class="zm-crit ${ev[k] ? 'is-ok' : 'is-ko'} ${state.selected === k ? 'is-selected' : ''}" data-crit="${k}">` +
      `<span class="zm-crit-text"><strong>${LABELS.criteria[k]}</strong><small>${LABELS.criteriaSub[k]}</small></span>` +
      `<span class="zm-crit-mark" aria-label="${ev[k] ? LABELS.markCorrect : LABELS.markIncorrect}">${ev[k] ? '✓' : '✗'}</span></button>`).join('');

    lab.body.innerHTML = `<div class="zm-check">` +
      `<div class="zm-check-left">` +
        `<div class="lab-score"><span class="lab-score-num">${score}<small> / ${CRITERIA.length}</small></span><span class="lab-score-label">${LABELS.scoreLabel}</span></div>` +
        `<div class="zm-crit-list">${rows}</div>` +
        `<div class="zm-reminder">${questionsHTML()}</div>` +
      `</div>` +
      `<div class="zm-check-detail" aria-live="polite"><h3>${LABELS.criteria[state.selected]}</h3>${criterionDetail(state.selected, ev)}</div>` +
      `</div>`;

    $$('[data-crit]').forEach(btn => btn.addEventListener('click', () => {
      state.selected = btn.dataset.crit;
      renderCheck();
    }));
    lab.fillSpace($('.zm-check-detail'));
    lab.checkFooter();
  }

  /* ===== Rapport imprimable : contenu des 7 sections de la fiche outil FO3
     (en-tête, numérotation et mise en page : cadre commun) =====
     Les erreurs passent par mark() (lab-engine.js) : lames, carnet, réponses,
     jugements. */
  const plainText = text => String(text).replace(/\[([^\]|]+)(?:\|[^\]]+)?\]/g, '$1');

  function buildReport(mark) {
    const R = LABELS.report;
    const ev = evaluate();
    const c = state.concl;
    const word = (text, ok, note) => (ok ? text : mark(text, note));

    const reportSlide = (points, aria) => slideSVG(points, 'zm-report-slide', aria);
    const modelCell = jar => {
      const svg = reportSlide(state.models[jar], LABELS.slideTitle(LABELS.jarName(jar)));
      const notes = [];
      if (ev.particleMiss.includes(jar)) notes.push(plainText(particleNote(jar)));
      if (ev.arrangeMiss.includes(jar)) notes.push(plainText(arrangeNote(jar)));
      return notes.length ? mark(svg, notes.join(' '), { box: true }) : svg;
    };
    const cell = (text, wrong, jar) => (wrong ? mark(text, plainText(`${noteRight(jar)} ${EXPLAIN.samples[run.jars[jar]]}`), { box: true }) : text);

    const obs = `<table class="zm-report-table"><caption>${R.modelsCaption}</caption>` +
      `<tr><th></th><th>${R.lookHead}</th><th>${LABELS.readingTitle}</th><th>${LABELS.yourModel}</th></tr>` +
      JARS.map(jar => `<tr><th>${LABELS.jarName(jar)}</th><td>${plainText(LABELS.look[sampleOf(jar).look])}</td><td>${plainText(countText(sampleOf(jar).parts))}</td><td>${modelCell(jar)}</td></tr>`).join('') +
      `</table>`;
    const notes = `<table class="zm-report-table"><caption>${LABELS.notebookTitle}</caption>` +
      `<tr><th></th><th>${LABELS.typesHead}</th><th>${LABELS.kindHead}</th><th>${LABELS.mixHead}</th></tr>` +
      JARS.map(jar => {
        const n = state.notes[jar], e = noteErrors(jar);
        return `<tr><th>${LABELS.jarName(jar)}</th><td>${cell(n.n || '—', e.n, jar)}</td>` +
          `<td>${cell(n.kind ? LABELS.noteKinds[n.kind] : '—', e.kind, jar)}</td>` +
          `<td>${cell(n.mix ? LABELS.mixWords[n.mix] : '—', e.mix, jar)}</td></tr>`;
      }).join('') + `</table>`;

    const interp = JARS.map(jar => `<p>${R.interp(LABELS.jarName(jar), state.notes[jar].n || '—', noteClass(jar) ? LABELS.kinds[noteClass(jar)] : '—')}</p>`).join('') +
      `<p>${R.refCompared}</p>`;

    const jar = mixedJar();
    const note1 = `${CHECK.answerWrong} ${plainText(right1())}`;
    const q1 = LABELS.concl1(c.jar ? word(LABELS.jarName(c.jar), c.jar === jar, note1) : '—',
      c.type ? word(LABELS.kinds[c.type], c.type === sampleOf(jar).kind, note1) : '—',
      c.n ? word(c.n, Number(c.n) === typesOf(jar).length, note1) : '—');
    const q2 = LABELS.concl2(c.model ? word(LABELS.modelMain[c.model], ev.modelOk, `${CHECK.answerWrong} ${plainText(LABELS.concl2(LABELS.modelMain.simplified))} ${plainText(EXPLAIN.model)}`) : '—');
    const limitsText = c.limits.length ? LABELS.list(c.limits.map(k => (LIMITS_TRUE.includes(k) ? LABELS.limits[k] : mark(LABELS.limits[k], plainText(EXPLAIN.limits[k]))))) : '—';
    const forgotten = LIMITS_TRUE.filter(k => !c.limits.includes(k));
    const limits = `<p>${plainText(LABELS.limitsQ)} ${forgotten.length ? mark(limitsText, plainText(LABELS.list(forgotten.map(k => EXPLAIN.limits[k]))), { box: true }) : limitsText}</p>`;
    const why = LABELS.whySentence(c.why ? word(LABELS.whys[c.why], ev.whyOk, `${CHECK.answerWrong} ${plainText(LABELS.whySentence(LABELS.whys.apart))}`) : '—');
    const verdicts = `<ul>${['A', 'B', 'model'].map(k => `<li>${R.verdict(LABELS.verdictRow(k), c.v[k] ? word(LABELS[c.v[k]], c.v[k] === ev.should[k], CHECK.verdictWrong(ev.should[k])) : '—')}</li>`).join('')}</ul>`;

    const hyp = `<ol>${hypTexts().map(t => `<li>${plainText(t)}</li>`).join('')}</ol>` +
      (state.because.trim() ? `<p>${R.because}: ${escapeHtml(state.because.trim())}</p>` : '');
    const correction = CRITERIA.map(k => `<tr><th>${LABELS.criteria[k]}</th><td class="${ev[k] ? 'ok' : 'ko'}">${ev[k] ? '✓' : '✗'}</td></tr>`).join('');

    return {
      title: R.title,
      sections: [
        `<ol>${[1, 2].map(k => `<li>${plainText(LABELS.questions[k])}</li>`).join('')}</ol>`,
        hyp,
        `<p>${R.materials}</p>`,
        `<ol>${R.procedure.map(s => `<li>${s}</li>`).join('')}</ol>`,
        obs + notes,
        interp,
        `<p>${plainText(LABELS.classmate)}</p><p>${q1}</p><p>${q2}</p>${limits}<p>${why}</p>` + verdicts
      ],
      correction: `<p><strong>${R.score(CRITERIA.filter(k => ev[k]).length)}</strong></p><table class="zm-report-corr">${correction}</table>`
    };
  }

  const validPoints = pts => Array.isArray(pts) && pts.every(p => p && PARTICLES[p.t] && typeof p.x === 'number' && typeof p.y === 'number');

  lab = LabEngine.create({
    id: 'zoom',
    title: LABELS.title,
    glossary: GLOSSARY,
    reset,
    stepComplete,
    lockReason,
    isStarted: () => !!(state.hyp.A || state.hyp.B || state.hyp.model || state.started),
    render: { 1: renderPredict, 2: renderExperiment, 3: renderConclude, 4: renderCheck },
    report: buildReport,
    version: 1,
    save: () => ({ run, state }),
    load(data) {
      const r = data.run, s = data.state;
      if (!r || !r.jars || !SAMPLES[r.jars.A] || !SAMPLES[r.jars.B] || typeof r.seed !== 'number' ||
        !s || !s.hyp || !s.models || !validPoints(s.models.A) || !validPoints(s.models.B) ||
        !s.compared || !s.notes || !s.notes.A || !s.notes.B ||
        !s.concl || !s.concl.v || !Array.isArray(s.concl.limits)) throw new Error('labProgress');
      run = r;
      state = s;
      stepperDone = null;
      captionKey = null;
      justZoomed = false;
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
          jars: `${run.jars.A}-${run.jars.B}`,
          hypothesis: `${state.hyp.A || '-'}-${state.hyp.B || '-'}-${state.hyp.model || '-'}`
        }
      };
    }
  });
})();
