/* ===== Labo virtuel « Invisible spread » (bio2) : une IST se propage dans un groupe =====

   Simulation propre à ce labo, commune aux deux filières ; ses textes sont
   dans le dossier du chapitre, un fichier par langue (lab-spread.en.js,
   lab-spread.nl.js). Le cadre commun (modale, barre d'étapes, verrous,
   traduction, glisser-déposer, rapport imprimé) est dans lab-engine.js.
   Ordre de chargement : moteur, textes, ce fichier.

   Expérience sur un modèle : l'« échange de liquides » fait en classe
   (soude et phénolphtaléine, ici un liquide sans nom et un indicateur).
   Jamais de verres : des tubes à essai et une pipette, et la légende du
   modèle reste affichée du début à la fin (1 tube = 1 personne ; mélanger
   deux tubes = un contact sexuel sans préservatif ; rose après le test = la
   personne a l'IST ; bouchon = préservatif ; étiquette bleue = vacciné
   contre le HPV ; dans la vie réelle, une IST ne passe pas par un verre).

   Tiré au sort à chaque nouveau labo : l'IST (HPV ou chlamydia, dite dès
   Predict) ; la personne qui l'a au départ (cachée : tous les tubes sont
   clairs) ; les paires des trois tournées (4 à 6 par tournée) ; les 6
   personnes protégées dans les parties 2 et 3 (les mêmes : bouchon, puis
   étiquette bleue ; jamais la personne de départ) ; pour le HPV, le seul
   contact protégé qui passe quand même (contact de la peau). Le tirage est
   recommencé jusqu'à ce que : 2 personnes après la tournée 1, 3 ou 4 après
   la tournée 2, au moins 3 de plus après la tournée 3 (au plus 9) ; avec
   les préservatifs, moins de personnes non protégées touchées ; avec le
   vaccin et le HPV, aussi (avec la chlamydia, le vaccin ne change rien).

   Règles du modèle : un contact entre une personne qui a l'IST et une qui
   ne l'a pas la transmet ; il suffit qu'un des deux ait un bouchon pour que
   le contact soit protégé (pour le HPV, sauf le contact tiré) ; le vaccin
   empêche une personne d'attraper le HPV, rien contre la chlamydia.

   Déroulé :
     1. Predict    — la carte « Today's STI » (trois faits du cours) ; Q1 :
                     un graphique parmi trois (à peu près pareil / une
                     personne de plus par tournée / peut doubler) ; Q2 : deux
                     phrases (préservatifs, vaccin : chez les non protégés,
                     plus / autant / moins de personnes avec l'IST) ;
                     « Why do you think so? » facultatif
     2. Experiment — partie 1 : chaque tournée se joue d'un coup (la
                     pipette mélange ses paires une à une), puis le test (une
                     goutte de chaque tube dans la plaque, puis
                     l'indicateur) ; cocher les creux roses dans le carnet et
                     écrire le total ; partie 2 : les mêmes contacts rejoués
                     avec les bouchons, test ; partie 3 : rejoués avec les
                     étiquettes, test ; à côté du carnet, compter les
                     personnes non protégées qui ont l'IST (après la tournée
                     3, avec préservatifs, avec vaccin) ; histogramme (FO5b)
                     des cinq tests
     3. Conclude   — Q1, Q2 (et « un préservatif protège les deux
                     partenaires »), Q3 : quatre phrases vraies ou fausses
                     dans la vie réelle ; jugement des deux hypothèses
     4. Check      — 5 vérifications : relevés, graphique, propagation,
                     protection, vie réelle ; rapport (FO3) */

(function () {
  'use strict';

  const { escapeHtml, shuffle, ease } = LabEngine.util;

  // Cadre commun, créé en fin de fichier (LabEngine.create).
  let lab;
  const $ = sel => lab.$(sel);
  const $$ = sel => lab.$$(sel);
  const gloss = text => lab.gloss(text);
  const plain = text => String(text).replace(/\[([^\]|]+)(?:\|[^\]]+)?\]/g, '$1');

  /* ===== Textes =====
     Dans le dossier du chapitre, un fichier par langue, chargé avant
     celui-ci. */
  const {
    labels: LABELS, glossary: GLOSSARY, explanations: EXPLAIN, check: CHECK
  } = LabEngine.textFor('spread');

  /* ===== Modèle ===== */
  const N = 12;                         // tubes (personnes)
  const PROTECTED = 6;                  // personnes protégées dans les parties 2 et 3
  const STIS = ['hpv', 'chlamydia'];
  // Les 5 tests du carnet : après chaque tournée, puis les deux reprises.
  const ROWS = ['r1', 'r2', 'r3', 'condoms', 'vaccine'];
  const SCEN_ROW = { condoms: 3, vaccine: 4 };
  const UNPROT_ROWS = [2, 3, 4];        // lignes où l'on compte les personnes non protégées
  const SHAPES = ['same', 'one', 'faster'];
  const COMPARE = ['more', 'same', 'fewer'];
  const REAL = ['contact', 'signs', 'onlyOne', 'test'];
  const REAL_RIGHT = { contact: 'true', signs: 'false', onlyOne: 'false', test: 'true' };
  const CRITERIA = ['counts', 'graph', 'spread', 'protection', 'reality'];
  const DASH = '—';

  let run;      // tirage
  let state;    // travail de l'élève
  let sims;     // ce que donne le tirage (recalculé, jamais enregistré)
  let busy = false;          // pendant une animation
  let replaying = null;      // { round, pair } : le contact rejoué en ce moment

  const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const range = n => Array.from({ length: n }, (_, i) => i);
  const countIn = (set, who) => who.filter(i => set[i]).length;

  const isProt = (r, i) => r.prot.includes(i);
  const unprotected = r => range(N).filter(i => !isProt(r, i));

  /* Un contact passe l'IST de celui qui l'a à celui qui ne l'a pas, sauf :
     préservatifs, un des deux a un bouchon (pour le HPV, sauf le contact
     tiré, leak) ; vaccin, contre le HPV, la personne vaccinée ne l'attrape
     pas. Les paires d'une tournée sont disjointes : l'ordre n'y compte pas.
     Rend l'état après chaque tournée (3 tableaux de 12 booléens). */
  function simulate(r, scenario) {
    let inf = range(N).map(i => i === r.carrier);
    const out = [];
    r.rounds.forEach((pairs, ri) => {
      const next = inf.slice();
      pairs.forEach(([a, b], pi) => {
        if (inf[a] === inf[b]) return;
        const to = inf[a] ? b : a;
        const leak = r.leak && r.leak.r === ri && r.leak.i === pi;
        if (scenario === 'condoms' && (isProt(r, a) || isProt(r, b)) && !leak) return;
        if (scenario === 'vaccine' && r.sti === 'hpv' && isProt(r, to)) return;
        next[to] = true;
      });
      inf = next;
      out.push(inf.slice());
    });
    return out;
  }

  // Les contacts protégés par un bouchon où l'IST aurait pu passer.
  function leakCandidates(r) {
    const steps = simulate(r, 'condoms');
    const list = [];
    r.rounds.forEach((pairs, ri) => {
      const inf = ri ? steps[ri - 1] : range(N).map(i => i === r.carrier);
      pairs.forEach(([a, b], pi) => {
        if (inf[a] !== inf[b] && (isProt(r, a) || isProt(r, b))) list.push({ r: ri, i: pi });
      });
    });
    return list;
  }

  function drawRounds(carrier) {
    return [0, 1, 2].map(() => {
      const k = randInt(4, 6);
      const order = shuffle(range(N));
      const pairs = [];
      for (let i = 0; i < k; i++) pairs.push([order[2 * i], order[2 * i + 1]].sort((x, y) => x - y));
      return pairs.sort((p, q) => p[0] - q[0]);
    });
  }

  /* Tirage complet : recommencé jusqu'à ce que l'expérience montre ce
     qu'elle doit montrer (voir l'en-tête). */
  function drawRun() {
    const sti = STIS[randInt(0, 1)];
    for (let tries = 0; tries < 20000; tries++) {
      const carrier = randInt(0, N - 1);
      const rounds = drawRounds(carrier);
      if (!rounds[0].some(p => p.includes(carrier))) continue;
      const base = simulate({ carrier, rounds, prot: [], leak: null }, 'none').map(s => s.filter(Boolean).length);
      if (base[0] !== 2 || base[1] < 3 || base[1] > 4 || base[2] < base[1] + 3 || base[2] > 9) continue;
      for (let p = 0; p < 30; p++) {
        const r = { sti, carrier, rounds, prot: shuffle(range(N).filter(i => i !== carrier)).slice(0, PROTECTED).sort((x, y) => x - y), leak: null };
        const U = unprotected(r);
        const baseU = countIn(simulate(r, 'none')[2], U);
        if (sti === 'hpv') {
          const cands = leakCandidates(r);
          if (!cands.length) continue;
          r.leak = cands[randInt(0, cands.length - 1)];
          if (countIn(simulate(r, 'vaccine')[2], U) >= baseU) continue;
        }
        if (countIn(simulate(r, 'condoms')[2], U) >= baseU) continue;
        return Object.assign(r, { seed: String(Math.random()) });
      }
    }
    // Jamais atteint en pratique : un tirage connu, qui montre tout.
    return {
      sti, carrier: 0, seed: 'fixed',
      rounds: [[[0, 4], [2, 7], [5, 9], [6, 11]], [[0, 3], [1, 8], [4, 10], [6, 9]], [[0, 6], [1, 4], [2, 11], [3, 5], [7, 10]]],
      prot: [3, 5, 6, 8, 9, 11], leak: sti === 'hpv' ? { r: 2, i: 3 } : null
    };
  }

  function computeSims() {
    const none = simulate(run, 'none');
    sims = { rows: [none[0], none[1], none[2], simulate(run, 'condoms')[2], simulate(run, 'vaccine')[2]] };
  }

  const truthRow = row => sims.rows[row];
  const truthTotal = row => truthRow(row).filter(Boolean).length;
  const truthUnprot = row => countIn(truthRow(row), unprotected(run));

  const freshConcl = () => ({ shape: null, condoms: null, vaccine: null, both: null, real: { contact: null, signs: null, onlyOne: null, test: null }, vShape: null, vProt: null });

  function reset() {
    run = drawRun();
    computeSims();
    state = {
      hyp: { shape: null, condoms: null, vaccine: null },
      because: '',
      started: false,       // l'hypothèse se fige au premier mélange
      part: 1,              // 1 : sans protection ; 2 : préservatifs ; 3 : vaccin
      view: 'bench',        // 'bench' | 'graph'
      graphOpen: false,
      mixed: [[], [], []],  // par tournée, les paires déjà mélangées (indices)
      replayed: { condoms: false, vaccine: false },
      tests: ROWS.map(() => ({ sampled: false, dyed: false })),
      marks: ROWS.map(() => []),      // tubes cochés roses (indices)
      totals: ROWS.map(() => null),
      unprot: ROWS.map(() => null),
      bars: ROWS.map(() => 0),
      concl: freshConcl(),
      selected: CRITERIA[0]
    };
    busy = false;
    replaying = null;
  }

  // Ce qui est fait, dans l'ordre de la manipulation.
  const roundMixed = r => state.mixed[r].length === run.rounds[r].length;
  const rowNoted = row => state.totals[row] != null && (row < 2 || state.unprot[row] != null);
  const part1Done = () => [0, 1, 2].every(r => roundMixed(r) && state.tests[r].dyed && state.totals[r] != null);
  const part2Done = () => part1Done() && state.replayed.condoms && state.tests[3].dyed && rowNoted(3) && state.unprot[2] != null;
  const part3Done = () => part2Done() && state.replayed.vaccine && state.tests[4].dyed && rowNoted(4);
  const graphDone = () => state.bars.every(v => v > 0);
  const benchDone = () => part3Done() && graphDone();

  // La dernière ligne testée : c'est elle que montre la plaque.
  function plateRow() {
    let row = -1;
    state.tests.forEach((t, i) => { if (t.sampled) row = i; });
    return row;
  }
  const rowOpen = row => state.tests[row].dyed && plateRow() === row;

  /* La prochaine chose à faire : la légende la dit, ce qu'il faut toucher
     ou remplir est en couleur, et le bouton du pied dit ce qui manque. */
  function phase() {
    const T = state.tests;
    if (state.part === 1) {
      for (let r = 0; r < 3; r++) {
        if (!roundMixed(r)) return { kind: 'mix', round: r };
        if (!T[r].sampled) return { kind: 'sample', row: r };
        if (!T[r].dyed) return { kind: 'dye', row: r };
        if (state.totals[r] == null) return { kind: 'note', row: r };
      }
      return { kind: 'next', to: 'part2' };
    }
    const scen = state.part === 2 ? 'condoms' : 'vaccine';
    const row = SCEN_ROW[scen];
    if (state.part === 2 && state.unprot[2] == null) return { kind: 'unprot', row: 2 };
    if (!state.replayed[scen]) return { kind: 'replay', scen };
    if (!T[row].sampled) return { kind: 'sample', row };
    if (!T[row].dyed) return { kind: 'dye', row };
    if (state.totals[row] == null) return { kind: 'note', row };
    if (state.unprot[row] == null) return { kind: 'unprot', row };
    if (state.part === 2) return { kind: 'next', to: 'part3' };
    if (!state.graphOpen) return { kind: 'next', to: 'graph' };
    if (!graphDone()) return { kind: 'graph' };
    return { kind: 'next', to: 'conclude' };
  }

  // Ce qui manque encore (bulle du bouton suivant, verrou de Conclude).
  function missingText() {
    const p = phase();
    const M = LABELS.missing;
    if (p.kind === 'mix') return M.mix(p.round + 1);
    if (p.kind === 'replay') return M.replay;
    if (p.kind === 'next') return M.next(LABELS.next[p.to]);
    return M[p.kind];
  }

  /* ===== Dessins =====
     La paillasse (676 × 258) : en haut la place des arcs de la pipette, puis
     le portoir et ses 12 tubes, leur numéro, et la plaque de test à 12
     creux, chaque creux sous son tube. Tout ce qui change est en SVG. */
  const COLORS = {
    glass: '#8ea6b6', liquid: '#e3f0f6', pink: '#e0479e', clear: '#eef5f8',
    cap: '#8a63d2', sticker: '#2f80d1', rack: '#c9b79c', rackDark: '#a99577', plate: '#f4f6f8'
  };
  const BENCH = { W: 676, H: 258, top: 58, tubeH: 102, tubeW: 26, wellY: 222, wellR: 15 };
  const TX = i => 41 + i * 54;

  const svg = (w, h, inner, cls, extra) => `<svg class="${cls || ''}" viewBox="0 0 ${w} ${h}" ${extra || ''} aria-hidden="true" focusable="false">${inner}</svg>`;

  function tubePath(cx, top, bottom, w) {
    const l = cx - w / 2, r = cx + w / 2, k = w / 2;
    return `M${l} ${top} V${bottom - k} A${k} ${k} 0 0 0 ${r} ${bottom - k} V${top}`;
  }

  // Un tube (repère de la paillasse) : verre, liquide clair, bouchon ou étiquette.
  function tubeSVG(i, mark) {
    const cx = TX(i), top = BENCH.top, bottom = top + BENCH.tubeH, w = BENCH.tubeW;
    return `<g class="sp-tube" data-tube="${i}">` +
      `<path d="${tubePath(cx, top + 46, bottom, w - 4)}" fill="${COLORS.liquid}"/>` +
      `<path d="${tubePath(cx, top, bottom, w)}" fill="none" stroke="${COLORS.glass}" stroke-width="2.2"/>` +
      `<path d="M${cx - w / 2 - 3} ${top} H${cx + w / 2 + 3}" stroke="${COLORS.glass}" stroke-width="2.6" stroke-linecap="round"/>` +
      (mark === 'cap' ? capShape(cx, top) : '') +
      (mark === 'sticker' ? stickerShape(cx, top + 66) : '') +
      `</g>`;
  }

  const capShape = (cx, top) => `<rect x="${cx - 17}" y="${top - 13}" width="34" height="16" rx="5" fill="${COLORS.cap}"/>` +
    `<rect x="${cx - 12}" y="${top - 10}" width="24" height="3" rx="1.5" fill="#ffffff" fill-opacity="0.35"/>`;
  const stickerShape = (cx, y) => `<rect x="${cx - 11}" y="${y}" width="22" height="16" rx="3" fill="${COLORS.sticker}"/>` +
    `<path d="M${cx - 4} ${y + 8} H${cx + 4} M${cx} ${y + 4} V${y + 12}" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>`;

  // Ce que montre chaque creux : vide, une goutte claire, ou la couleur du test.
  function wellFill(row, i) {
    if (row < 0 || !state.tests[row].sampled) return null;
    if (!state.tests[row].dyed) return COLORS.clear;
    return truthRow(row)[i] ? COLORS.pink : COLORS.clear;
  }

  function wellSVG(i, fill) {
    const cx = TX(i);
    return `<g data-well="${i}"><circle cx="${cx}" cy="${BENCH.wellY}" r="${BENCH.wellR}" fill="#ffffff" stroke="#b9c4cc" stroke-width="1.6"/>` +
      `<circle class="sp-well-fill" cx="${cx}" cy="${BENCH.wellY}" r="${fill ? BENCH.wellR - 3 : 0}" fill="${fill || COLORS.clear}"/>` +
      `<text class="sp-well-num" x="${cx}" y="${BENCH.wellY + 31}" text-anchor="middle">${i + 1}</text></g>`;
  }

  // Ce que porte un tube dans la partie affichée.
  const markOf = i => (!isProt(run, i) ? null : state.part === 2 ? 'cap' : state.part === 3 ? 'sticker' : null);

  function benchSVG() {
    const row = plateRow();
    const tubes = range(N).map(i => tubeSVG(i, markOf(i))).join('');
    return `<svg class="sp-bench-svg" viewBox="0 0 ${BENCH.W} ${BENCH.H}" aria-hidden="true" focusable="false">` +
      `<rect x="16" y="${BENCH.top + BENCH.tubeH - 4}" width="${BENCH.W - 32}" height="14" rx="5" fill="${COLORS.rackDark}"/>` +
      tubes +
      `<rect x="16" y="${BENCH.top + 40}" width="${BENCH.W - 32}" height="13" rx="4" fill="${COLORS.rack}" fill-opacity="0.92"/>` +
      range(N).map(i => `<text class="sp-tube-num" x="${TX(i)}" y="${BENCH.top + BENCH.tubeH + 28}" text-anchor="middle">${i + 1}</text>`).join('') +
      `<rect x="16" y="${BENCH.wellY - 26}" width="${BENCH.W - 32}" height="62" rx="12" fill="${COLORS.plate}" stroke="#cfd7dd" stroke-width="1.4"/>` +
      range(N).map(i => wellSVG(i, wellFill(row, i))).join('') +
      `<g class="sp-anim" data-anim></g>` +
      `</svg>`;
  }

  // Petits dessins : page Mission, légende du modèle, boutons.
  const ICON = {
    tube: svg(40, 48, `<path d="${tubePath(20, 6, 44, 14)}" fill="${COLORS.liquid}" stroke="${COLORS.glass}" stroke-width="2"/><path d="M11 6 H29" stroke="${COLORS.glass}" stroke-width="2.4" stroke-linecap="round"/>`, 'sp-icon'),
    mix: svg(56, 48, `<path d="${tubePath(12, 14, 46, 12)}" fill="${COLORS.liquid}" stroke="${COLORS.glass}" stroke-width="2"/><path d="${tubePath(44, 14, 46, 12)}" fill="${COLORS.liquid}" stroke="${COLORS.glass}" stroke-width="2"/>` +
      `<path d="M12 11 Q28 -4 44 11" fill="none" stroke="var(--color-current-dark)" stroke-width="2" stroke-dasharray="3 3"/><path d="M40 6 L45 11 L38 13" fill="none" stroke="var(--color-current-dark)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`, 'sp-icon'),
    pink: svg(40, 40, `<circle cx="20" cy="20" r="15" fill="#ffffff" stroke="#b9c4cc" stroke-width="2"/><circle cx="20" cy="20" r="11" fill="${COLORS.pink}"/>`, 'sp-icon'),
    cap: svg(40, 48, `<path d="${tubePath(20, 14, 46, 14)}" fill="${COLORS.liquid}" stroke="${COLORS.glass}" stroke-width="2"/><rect x="9" y="5" width="22" height="12" rx="4" fill="${COLORS.cap}"/>`, 'sp-icon'),
    sticker: svg(40, 48, `<path d="${tubePath(20, 4, 46, 14)}" fill="${COLORS.liquid}" stroke="${COLORS.glass}" stroke-width="2"/><rect x="12" y="20" width="16" height="12" rx="2" fill="${COLORS.sticker}"/><path d="M17 26 H23 M20 23 V29" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`, 'sp-icon'),
    pipette: svg(48, 48, `<path d="M8 40 L30 18" stroke="${COLORS.glass}" stroke-width="5" stroke-linecap="round"/><path d="M8 40 L30 18" stroke="${COLORS.liquid}" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="36" cy="12" rx="7" ry="9" transform="rotate(45 36 12)" fill="#e4a38a"/><path d="M6 42 L4 44" stroke="${COLORS.glass}" stroke-width="2" stroke-linecap="round"/>`, 'sp-icon'),
    plate: svg(56, 40, `<rect x="3" y="8" width="50" height="24" rx="6" fill="${COLORS.plate}" stroke="#b9c4cc" stroke-width="1.6"/>` +
      [12, 24, 36, 48].map(x => `<circle cx="${x - 2}" cy="20" r="5" fill="#ffffff" stroke="#b9c4cc" stroke-width="1.4"/>`).join(''), 'sp-icon'),
    indicator: svg(40, 48, `<rect x="11" y="18" width="18" height="26" rx="4" fill="#f3f6f8" stroke="${COLORS.glass}" stroke-width="2"/><rect x="15" y="9" width="10" height="10" rx="2" fill="#6f7f8c"/><path d="M20 9 V3" stroke="#6f7f8c" stroke-width="3" stroke-linecap="round"/><rect x="14" y="27" width="12" height="9" rx="1.5" fill="${COLORS.pink}" fill-opacity=".35"/>`, 'sp-icon')
  };

  // La légende du modèle : affichée du début à la fin (Mission comprise).
  function legendHTML(compact) {
    const L = LABELS.legend;
    const item = (icon, text) => `<li><span class="sp-legend-icon">${icon}</span><span>${gloss(text)}</span></li>`;
    return `<div class="sp-legend ${compact ? 'is-compact' : ''}"><p class="sp-kicker">${L.title}</p><ul>` +
      item(ICON.tube, L.tube) + item(ICON.mix, L.mix) + item(ICON.pink, L.pink) + item(ICON.cap, L.cap) + item(ICON.sticker, L.sticker) +
      `</ul><p class="sp-legend-real">${gloss(L.real)}</p></div>`;
  }

  // La carte de l'IST du jour : trois faits repris du cours.
  function stiCardHTML(compact) {
    const S = LABELS.sti[run.sti];
    return `<div class="sp-sti ${compact ? 'is-compact' : ''}"><p class="sp-kicker">${LABELS.todaySti}</p>` +
      `<p class="sp-sti-name">${S.name}</p>` +
      (compact ? '' : `<ul>${S.facts.map(f => `<li>${gloss(f)}</li>`).join('')}</ul>`) + `</div>`;
  }

  /* Les petits graphiques de l'hypothèse (Q1) : trois colonnes, une par
     tournée ; seule la forme compte. */
  const SHAPE_BARS = { same: [1, 1, 1], one: [2, 3, 4], faster: [2, 4, 8] };
  function shapeSVG(key) {
    const W = 150, H = 92, y0 = 74, sq = 7.2;
    const bars = SHAPE_BARS[key].map((v, i) => {
      const x = 34 + i * 38, h = v * sq;
      return `<rect x="${x}" y="${y0 - h}" width="24" height="${h}" rx="2" fill="var(--color-current)"/>` +
        `<text class="sp-mini-tick" x="${x + 12}" y="${y0 + 13}" text-anchor="middle">${i + 1}</text>`;
    }).join('');
    return svg(W, H, `<path d="M24 ${y0} H${W - 8} M24 ${y0} V8" stroke="#6b7570" stroke-width="1.4"/>${bars}`, 'sp-shape-svg');
  }

  /* L'histogramme (fiche outil FO5b) : cinq colonnes, les personnes qui
     ont l'IST à chaque test (trois tournées sans protection, puis avec
     préservatifs et avec vaccin, aux couleurs des bouchons et des
     étiquettes ; une accolade sous chaque groupe). Titre, noms des axes et
     échelle (1 carreau = 1 personne) donnés : l'élève monte chaque colonne
     (glisser, ou toucher à la bonne hauteur ; flèches au clavier). */
  const C_EDIT = { W: 760, H: 262, L: 64, R: 24, T: 22, B: 72 };
  const C_READ = C_EDIT;
  const C_TOP = N;
  const BARS = ROWS.length;
  const BAR_FILL = ['var(--color-current)', 'var(--color-current)', 'var(--color-current)', '#8a63d2', '#2f80d1'];
  const BAR_LINE = ['var(--color-current-dark)', 'var(--color-current-dark)', 'var(--color-current-dark)', '#6a46b0', '#1f63a8'];

  function chartSVG(mode, bars) {
    const C = mode === 'edit' ? C_EDIT : C_READ;
    const ph = C.H - C.T - C.B, sq = ph / C_TOP, y0 = C.H - C.B;
    const gw = (C.W - C.L - C.R) / BARS, bw = Math.min(56, gw * 0.42);
    let out = `<svg class="sp-chart is-${mode}" ${mode === 'edit' ? 'data-chart' : ''} viewBox="0 0 ${C.W} ${C.H}" role="${mode === 'edit' ? 'group' : 'img'}" aria-label="${escapeHtml(LABELS.chart.title)}">`;
    for (let k = 0; k <= C_TOP; k++) {
      const y = y0 - k * sq;
      out += `<line x1="${C.L}" x2="${C.W - C.R}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${k ? '#e3e6e1' : '#a9ada4'}" stroke-width="1"/>`;
      if (k % 2 === 0) out += `<text class="sp-tick" x="${C.L - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end">${k}</text>`;
    }
    out += `<path d="M${C.L} ${y0} V${C.T - 8}" stroke="#4d5650" stroke-width="1.4"/><path d="M${C.L - 4} ${C.T - 4} L${C.L} ${C.T - 11} L${C.L + 4} ${C.T - 4} Z" fill="#4d5650"/>` +
      `<text class="sp-scale-note" x="${C.W - C.R}" y="${C.T - 6}" text-anchor="end">${escapeHtml(LABELS.chart.scale)}</text>` +
      `<text class="sp-axis-name" transform="translate(18 ${((C.T + y0) / 2).toFixed(1)}) rotate(-90)" text-anchor="middle">${escapeHtml(LABELS.chart.yName)}</text>` +
      `<text class="sp-axis-name" x="${(C.L + C.W - C.R) / 2}" y="${C.H - 4}" text-anchor="middle">${escapeHtml(LABELS.chart.xName)}</text>`;
    // Les deux groupes : sans protection (3 tests), la moitié protégée (2 tests).
    [[0, 3, LABELS.chart.groups.none], [3, 5, LABELS.chart.groups.half]].forEach(([a, b, name]) => {
      const x1 = C.L + gw * a + 10, x2 = C.L + gw * b - 10, y = y0 + 28;
      out += `<path d="M${x1} ${y - 4} V${y} H${x2} V${y - 4}" fill="none" stroke="#9aa39d" stroke-width="1.2"/>` +
        `<text class="sp-group" x="${((x1 + x2) / 2).toFixed(1)}" y="${y + 14}" text-anchor="middle">${escapeHtml(name)}</text>`;
    });
    range(BARS).forEach(i => {
      const cx = C.L + gw * (i + 0.5), x = cx - bw / 2;
      const v = bars[i] || 0, h = Math.min(C_TOP, v) * sq;
      const name = plain(LABELS.rows[ROWS[i]]);
      const bar = `<rect class="sp-bar" x="${x.toFixed(1)}" y="${(y0 - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${BAR_FILL[i]}" stroke="${BAR_LINE[i]}" stroke-width="1"/>` +
        `<text class="sp-bar-val" x="${cx.toFixed(1)}" y="${(y0 - h - 6).toFixed(1)}" text-anchor="middle">${v || ''}</text>`;
      out += `<text class="sp-cat" x="${cx.toFixed(1)}" y="${y0 + 16}" text-anchor="middle">${escapeHtml(name)}</text>`;
      if (mode === 'edit') {
        out += `<g class="sp-slot" data-slot="${i}" tabindex="0" role="slider" aria-label="${escapeHtml(name)}" aria-valuemin="0" aria-valuemax="${C_TOP}" aria-valuenow="${v}">` +
          `<rect class="sp-slot-hit" x="${(cx - gw / 2).toFixed(1)}" y="${C.T}" width="${gw.toFixed(1)}" height="${ph.toFixed(1)}" fill="transparent"/>` +
          `<rect class="sp-slot-guide" x="${x.toFixed(1)}" y="${C.T}" width="${bw.toFixed(1)}" height="${ph.toFixed(1)}" fill="none"/>${bar}</g>`;
      } else out += bar;
    });
    out += `<path d="M${C.L} ${y0} H${C.W - C.R + 8}" stroke="#4d5650" stroke-width="1.4"/><path d="M${C.W - C.R + 2} ${y0 - 4} L${C.W - C.R + 9} ${y0} L${C.W - C.R + 2} ${y0 + 4} Z" fill="#4d5650"/>`;
    return out + `</svg>`;
  }

  /* ===== Étapes complètes (progression stricte, voir lab-engine.js) =====
     1 : les trois choix de l'hypothèse ; 2 : les trois parties et le
     graphique ; 3 : toutes les réponses de la conclusion. */
  const hypDone = () => !!(state.hyp.shape && state.hyp.condoms && state.hyp.vaccine);

  function stepComplete(n) {
    if (n === 1) return hypDone();
    if (n === 2) return benchDone();
    return conclusionsComplete();
  }

  function lockReason(n) {
    if (n === 1) return LABELS.lockHypothesis;
    if (n === 2) return state.started ? `${LABELS.lockRun} ${missingText()}` : LABELS.lockNotStarted;
    return lab.L.missingConclusions;
  }

  const chipHTML = (attrs, label, on, cls) => `<button type="button" class="lab-choice sp-chip ${cls || ''} ${on ? 'is-selected' : ''}" ${attrs} aria-pressed="${on}">${label}</button>`;

  function selectHTML(attrs, value, options, labelOf, aria, missing) {
    return `<select class="lab-select sp-select ${value ? 'is-filled' : ''} ${missing && !value ? 'lab-is-missing' : ''}" ${attrs} aria-label="${escapeHtml(plain(aria))}">` +
      `<option value="" disabled ${value ? '' : 'selected'}>${LABELS.choose}</option>` +
      options.map(x => `<option value="${x}" ${value === x ? 'selected' : ''}>${escapeHtml(labelOf(x))}</option>`).join('') + `</select>`;
  }

  /* ===== Étape 1 : hypothèse =====
     À gauche, la question, l'IST du jour et la légende du modèle ; à
     droite, le graphique choisi (Q1) et les deux phrases (Q2). */
  function renderPredict() {
    const show = lab.state.showMissing;
    const h = state.hyp;
    const miss = ok => (show && !ok ? 'lab-is-missing' : '');
    const shapes = SHAPES.map(k => `<button type="button" class="lab-choice sp-shape ${h.shape === k ? 'is-selected' : ''}" data-hyp="shape" data-val="${k}" aria-pressed="${h.shape === k}">` +
      `${shapeSVG(k)}<span>${LABELS.shapes[k]}</span></button>`).join('');
    const sentence = key => `<div class="sp-hyp-line"><p>${gloss(LABELS.hyp[key])}</p>` +
      `<div class="sp-chips">${COMPARE.map(c => chipHTML(`data-hyp="${key}" data-val="${c}"`, LABELS.compare[c], h[key] === c)).join('')}</div></div>`;

    lab.body.innerHTML = `<div class="sp-predict">` +
      `<div class="sp-predict-left">` +
        `<div class="sp-question-card"><p class="sp-kicker">${LABELS.yourQuestion}</p><p class="sp-big-q">${gloss(LABELS.bigQuestion)}</p></div>` +
        stiCardHTML() +
        legendHTML() +
      `</div>` +
      `<div class="sp-hyp-card"><p class="sp-kicker">${LABELS.hypothesisTitle}</p>` +
        `<ol class="sp-hyp-list">` +
          `<li class="sp-hyp-part ${miss(h.shape)}"><p class="sp-hyp-q">${gloss(LABELS.hyp.shape)}</p><div class="sp-shapes">${shapes}</div></li>` +
          `<li class="sp-hyp-part ${miss(h.condoms && h.vaccine)}"><p class="sp-hyp-q">${gloss(LABELS.hyp.protect)}</p>${sentence('condoms')}${sentence('vaccine')}</li>` +
        `</ol>` +
        `<label class="sp-because"><span>${LABELS.because}</span>` +
        `<input type="text" class="lab-input sp-because-input" maxlength="160" placeholder="${escapeHtml(LABELS.becausePlaceholder)}" value="${escapeHtml(state.because)}" autocomplete="off"></label>` +
      `</div></div>`;

    $$('[data-hyp]').forEach(btn => btn.addEventListener('click', () => {
      state.hyp[btn.dataset.hyp] = btn.dataset.val;
      if (lab.state.showMissing && hypDone()) lab.state.showMissing = false;
      renderPredict();
      lab.renderStepper();
    }));
    const because = $('.sp-because-input');
    because.addEventListener('input', e => { state.because = e.target.value; });
    // Hypothèse figée dès le premier mélange.
    if (state.started) {
      $$('[data-hyp]').forEach(btn => lab.setLock(btn, LABELS.lockHypothesisFixed, { icon: false }));
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
     À gauche, la paillasse (ou le graphique), avec le test à côté de la
     plaque (goutte, indicateur), puis le carnet et, à côté, le compte des
     personnes non protégées ; à droite, la légende du modèle et les
     contacts des trois tournées (un bouton joue toute la tournée, ou les
     rejoue avec la protection de la partie). Le bouton du pied mène à la
     partie suivante. */
  const PART_SCEN = { 2: 'condoms', 3: 'vaccine' };

  function benchCardHTML() {
    const tabs = `<div class="sp-tabs" role="tablist">` + ['bench', 'graph'].map(v =>
      `<button type="button" role="tab" class="sp-tab ${state.view === v ? 'is-on' : ''}" data-view="${v}" data-lab-look aria-selected="${state.view === v}">${LABELS.views[v]}</button>`).join('') + `</div>`;
    const head = `<div class="sp-card-head"><h3 class="lab-panel-title">${LABELS.parts[state.part]}</h3>${tabs}</div>`;
    if (state.view === 'graph') {
      return `<section class="sp-bench sp-graph-card">${head}` +
        `<div class="sp-graph"><p class="sp-chart-title">${LABELS.chart.title}</p>` +
        `<div class="sp-chart-wrap ${lab.state.showMissing && !graphDone() ? 'lab-is-missing' : ''}" data-chart-wrap>${chartSVG('edit', state.bars)}</div>` +
        `<p class="sp-graph-how">${gloss(LABELS.chart.how)}</p></div></section>`;
    }
    return `<section class="sp-bench">${head}<div class="sp-stage">${benchSVG()}${testHTML()}</div></section>`;
  }

  // Un contact : les deux numéros, chacun avec sa protection dans la partie affichée.
  function pairLabel(a, b) {
    const n = i => `<span class="sp-n ${markOf(i) ? `is-${markOf(i)}` : ''}">${i + 1}</span>`;
    return LABELS.pair(n(a), n(b));
  }

  function exchangesHTML() {
    const rounds = run.rounds.map((pairs, r) => {
      const chips = pairs.map((p, i) => {
        const done = state.mixed[r].includes(i);
        const now = replaying && replaying.round === r && replaying.pair === i;
        return `<span class="sp-pair ${done ? 'is-done' : ''} ${now ? 'is-now' : ''}" data-pair="${r}:${i}">${pairLabel(p[0], p[1])}</span>`;
      }).join('');
      return `<div class="sp-round" data-round="${r}"><span class="sp-round-name">${LABELS.round(r + 1)}</span><div class="sp-pairs">${chips}</div></div>`;
    }).join('');
    // Partie 1 : la prochaine tournée à jouer ; parties 2 et 3 : la reprise.
    const scen = PART_SCEN[state.part];
    const next = state.part === 1 ? [0, 1, 2].find(r => !roundMixed(r)) : undefined;
    const action = scen
      ? `<button type="button" class="lab-btn sp-replay ${state.replayed[scen] ? '' : 'lab-btn-primary'}" data-replay="${scen}">${LABELS.replay[scen]}</button>`
      : next != null ? `<button type="button" class="lab-btn sp-replay lab-btn-primary" data-mix-round="${next}">${LABELS.mixRound(next + 1)}</button>` : '';
    return `<section class="sp-side-card sp-exchanges"><h3 class="lab-panel-title">${LABELS.exchangesTitle}</h3>${rounds}${action}</section>`;
  }

  // Le test, à côté de la plaque : la goutte de chaque tube, puis l'indicateur.
  function testHTML() {
    return `<div class="sp-test"><p class="sp-test-title">${LABELS.testTitle}</p>` +
      `<button type="button" class="lab-btn sp-test-btn" data-sample>${ICON.pipette}<span>${LABELS.sample}</span></button>` +
      `<button type="button" class="lab-btn sp-test-btn" data-dye>${ICON.indicator}<span>${LABELS.dye}</span></button>` +
      `</div>`;
  }

  /* Une case du carnet est rayée quand cette personne est protégée pendant
     ce test : préservatif (ligne 4, dès la partie 2), vaccin (ligne 5, dès
     la partie 3). Les trois tournées sans protection ne sont jamais
     rayées. */
  const protAt = (row, i) => isProt(run, i) && ((row === 3 && state.part >= 2) || (row === 4 && state.part >= 3));
  const numInput = (kind, row, v, max, aria) => `<input type="text" inputmode="numeric" class="sp-num-in" data-${kind}="${row}" value="${v == null ? '' : v}" maxlength="2" autocomplete="off" spellcheck="false" aria-label="${escapeHtml(aria)}" data-max="${max}">`;

  // Le carnet : une ligne par test ; cocher les creux roses, écrire le total.
  function notesHTML() {
    const head = range(N).map(i => `<th scope="col">${i + 1}</th>`).join('');
    const rows = ROWS.map((key, row) => {
      const cells = range(N).map(i => {
        const on = state.marks[row].includes(i);
        return `<td class="${protAt(row, i) ? 'is-prot' : ''}" data-td="${row}:${i}"><button type="button" class="sp-cell ${on ? 'is-on' : ''}" data-cell="${row}:${i}" aria-pressed="${on}" aria-label="${escapeHtml(LABELS.cellAria(plain(LABELS.rows[key]), i + 1))}"></button></td>`;
      }).join('');
      return `<tr data-row="${row}"><th scope="row" class="sp-row-name lab-todo-field" data-row-name="${row}">${gloss(LABELS.rows[key])}</th>${cells}` +
        `<td class="sp-num-cell">${numInput('total', row, state.totals[row], N, LABELS.numAria.total(plain(LABELS.rows[key])))}</td></tr>`;
    }).join('');
    return `<section class="sp-notes"><h3 class="lab-panel-title">${LABELS.notesTitle}</h3>` +
      `<div class="sp-notes-body"><div>` +
        `<table class="sp-table"><thead><tr><th scope="col" class="sp-row-head">${LABELS.notesHead}</th>${head}` +
          `<th scope="col" class="sp-num-head">${LABELS.totalHead}</th></tr></thead>` +
        `<tbody>${rows}</tbody></table>` +
        `<p class="sp-notes-hint">${gloss(state.part > 1 ? LABELS.notesHintProt : LABELS.notesHint)}</p></div>` +
        countHTML() +
      `</div></section>`;
  }

  /* À côté du carnet : les personnes non protégées (toujours les mêmes, dites
     par leurs numéros) et combien d'entre elles ont l'IST, après la
     tournée 3, avec préservatifs, avec vaccin. Partie 1 : on ne sait pas
     encore qui sera protégé. */
  function countHTML() {
    const C = LABELS.count;
    const who = state.part > 1 ? C.who(LABELS.list(unprotected(run).map(i => String(i + 1)))) : C.later;
    const rows = UNPROT_ROWS.map(row => `<label class="sp-count-row"><span>${gloss(LABELS.rows[ROWS[row]])}</span>` +
      numInput('unprot', row, state.unprot[row], N - PROTECTED, LABELS.numAria.unprot(plain(LABELS.rows[ROWS[row]]))) + `</label>`).join('');
    return `<div class="sp-count"><p class="sp-kicker">${C.title}</p><p class="sp-count-who">${gloss(who)}</p>` +
      `<p class="sp-count-q">${gloss(C.question)}</p>${rows}</div>`;
  }

  function renderExperiment(caption) {
    lab.body.innerHTML = `<div class="sp-run">` +
      `<div class="sp-run-left">${benchCardHTML()}` +
        `<p class="lab-caption" data-caption aria-live="polite"></p>` +
        notesHTML() +
      `</div>` +
      `<div class="sp-run-right">` +
        `<section class="sp-side-card sp-side-legend">${stiCardHTML(true)}${legendHTML(true)}</section>` +
        exchangesHTML() +
      `</div></div>`;
    bindRun();
    renderRunFooter();
    updateLocks();
    updateMarks();
    setCaption(caption || defaultCaption());
  }

  function bindRun() {
    $$('[data-view]').forEach(btn => btn.addEventListener('click', () => {
      if (state.view === btn.dataset.view) return;
      state.view = btn.dataset.view;
      renderExperiment();
    }));
    const mix = $('[data-mix-round]');
    if (mix) mix.addEventListener('click', () => { if (!busy) mixRound(Number(mix.dataset.mixRound)); });
    const replay = $('[data-replay]');
    if (replay) replay.addEventListener('click', () => {
      if (state.replayed[replay.dataset.replay]) { setCaption(LABELS.captionReplayed, true); return; }
      startReplay(replay.dataset.replay);
    });
    const sampleBtn = $('[data-sample]');
    if (sampleBtn) sampleBtn.addEventListener('click', sample);
    const dyeBtn = $('[data-dye]');
    if (dyeBtn) dyeBtn.addEventListener('click', dye);
    $$('[data-cell]').forEach(btn => btn.addEventListener('click', () => {
      const [row, i] = btn.dataset.cell.split(':').map(Number);
      const list = state.marks[row];
      const k = list.indexOf(i);
      if (k >= 0) list.splice(k, 1); else list.push(i);
      list.sort((x, y) => x - y);
      btn.classList.toggle('is-on', k < 0);
      btn.setAttribute('aria-pressed', String(k < 0));
      refreshRecords();
      lab.save();
    }));
    $$('.sp-num-in').forEach(input => {
      const kind = input.dataset.total != null ? 'total' : 'unprot';
      const row = Number(input.dataset[kind]);
      const max = Number(input.dataset.max);
      const parse = () => {
        const s = input.value.trim();
        if (s === '') return null;
        if (!/^\d{1,2}$/.test(s)) return NaN;
        const v = Number(s);
        return v <= max ? v : NaN;
      };
      input.addEventListener('input', () => {
        input.classList.remove('is-invalid');
        const v = parse();
        (kind === 'total' ? state.totals : state.unprot)[row] = Number.isNaN(v) ? null : v;
        refreshRecords();
      });
      input.addEventListener('change', () => {
        const v = parse();
        if (Number.isNaN(v)) {
          input.classList.add('is-invalid');
          setCaption(LABELS.captionBadNumber(max), true);
          return;
        }
        lab.save();
      });
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
      // Compter les non protégés : leurs cases de cette ligne sont entourées.
      if (kind === 'unprot') {
        const cells = () => unprotected(run).map(i => $(`[data-td="${row}:${i}"]`)).filter(Boolean);
        input.addEventListener('focus', () => { if (state.part > 1) cells().forEach(td => td.classList.add('is-count')); });
        input.addEventListener('blur', () => cells().forEach(td => td.classList.remove('is-count')));
      }
    });
    bindChart();
  }

  function markStarted() {
    if (!state.started) state.started = true;
  }

  // Pendant une animation, rien d'autre ne répond.
  function setBusy(on) {
    busy = on;
    const runEl = $('.sp-run');
    if (runEl) runEl.classList.toggle('is-busy', on);
    $$('.lab-footer button').forEach(el => { el.disabled = on; });
  }

  /* Un arc de pipette d'un tube à l'autre (aller et retour), les deux tubes
     mis en avant. d : durée totale. */
  function arcAnim(token, a, b, d) {
    const g = $('[data-anim]');
    if (!g) return Promise.resolve(false);
    const xa = TX(a), xb = TX(b), y = BENCH.top - 6;
    const lift = Math.min(48, 16 + Math.abs(xb - xa) * 0.09);
    const mx = (xa + xb) / 2, my = y - lift;
    const at = t => {
      const u = 1 - t;
      return [u * u * xa + 2 * u * t * mx + t * t * xb, u * u * y + 2 * u * t * my + t * t * y];
    };
    $$(`[data-tube="${a}"], [data-tube="${b}"]`).forEach(el => el.classList.add('is-active'));
    g.innerHTML = `<path d="M${xa} ${y} Q${mx} ${my} ${xb} ${y}" fill="none" stroke="var(--color-current-dark)" stroke-width="2" stroke-dasharray="4 4" opacity=".7"/>` +
      `<circle data-drop r="6" fill="${COLORS.liquid}" stroke="var(--color-current-dark)" stroke-width="2" cx="${xa}" cy="${y}"/>`;
    const drop = g.querySelector('[data-drop]');
    return lab.tween(token, d, k => {
      const t = k < 0.5 ? k * 2 : 2 - k * 2;
      const [x, yy] = at(t);
      drop.setAttribute('cx', x.toFixed(1));
      drop.setAttribute('cy', yy.toFixed(1));
    }, ease.linear).then(ok => {
      if (!ok) return false;
      g.innerHTML = '';
      $$('.sp-tube.is-active').forEach(el => el.classList.remove('is-active'));
      return true;
    });
  }

  /* Jouer des tournées : la pipette mélange chaque paire, l'une après
     l'autre, sa paire mise en avant dans les contacts. L'état change avant
     l'animation (interrompue, elle reste juste). */
  async function playRounds(rounds, ms, caption) {
    renderExperiment(caption);
    setBusy(true);
    const token = lab.newScene();
    for (const r of rounds) {
      for (let i = 0; i < run.rounds[r].length; i++) {
        replaying = { round: r, pair: i };
        $$('.sp-pair.is-now').forEach(el => el.classList.remove('is-now'));
        const chip = $(`[data-pair="${r}:${i}"]`);
        if (chip) chip.classList.add('is-now');
        const [a, b] = run.rounds[r][i];
        if (!(await arcAnim(token, a, b, ms))) { replaying = null; setBusy(false); return; }
      }
    }
    replaying = null;
    setBusy(false);
    renderExperiment();
    lab.renderStepper();
  }

  // Partie 1 : toute une tournée d'un coup.
  function mixRound(r) {
    if (phase().kind !== 'mix' || phase().round !== r) return;
    markStarted();
    state.mixed[r] = range(run.rounds[r].length);
    lab.save();
    playRounds([r], 650, LABELS.captionMixingRound(r + 1));
  }

  // Parties 2 et 3 : les trois tournées rejouées avec la protection.
  function startReplay(scen) {
    state.replayed[scen] = true;
    lab.save();
    playRounds([0, 1, 2], 420, LABELS.captionReplaying[scen]);
  }

  // Une goutte de chaque tube dans son creux de la plaque.
  function sample() {
    const p = phase();
    if (busy || p.kind !== 'sample') return;
    const row = p.row;
    state.tests[row].sampled = true;
    lab.save();
    renderExperiment(LABELS.captionSampling);
    setBusy(true);
    const token = lab.newScene();
    const g = $('[data-anim]');
    const fills = $$('.sp-well-fill');
    fills.forEach(c => c.setAttribute('r', '0'));
    const y1 = BENCH.top + BENCH.tubeH + 4, y2 = BENCH.wellY;
    g.innerHTML = range(N).map(i => `<circle data-fall r="4" fill="${COLORS.liquid}" stroke="${COLORS.glass}" stroke-width="1.4" cx="${TX(i)}" cy="${y1}"/>`).join('');
    const drops = $$('[data-fall]');
    lab.tween(token, 800, k => {
      drops.forEach(d => d.setAttribute('cy', (y1 + (y2 - y1) * Math.min(1, k * 1.25)).toFixed(1)));
      fills.forEach(c => c.setAttribute('r', String(Math.max(0, (k - 0.75) * 4) * (BENCH.wellR - 3))));
    }, ease.in).then(ok => {
      setBusy(false);
      if (!ok) return;
      renderExperiment();
      lab.renderStepper();
    });
  }

  // L'indicateur, creux par creux : rose là où la personne a l'IST.
  function dye() {
    const p = phase();
    if (busy || p.kind !== 'dye') return;
    const row = p.row;
    state.tests[row].dyed = true;
    lab.save();
    renderExperiment(LABELS.captionDyeing);
    // Les creux redessinés clairs, puis colorés un à un.
    const fills = $$('.sp-well-fill');
    fills.forEach(c => c.setAttribute('fill', COLORS.clear));
    setBusy(true);
    const token = lab.newScene();
    const truth = truthRow(row);
    lab.tween(token, 1300, k => {
      fills.forEach((c, i) => { if (k >= (i + 1) / (N + 1)) c.setAttribute('fill', truth[i] ? COLORS.pink : COLORS.clear); });
    }, ease.linear).then(ok => {
      setBusy(false);
      if (!ok) return;
      renderExperiment();
      lab.renderStepper();
    });
  }

  function refreshRecords() {
    if (lab.state.showMissing && benchDone()) lab.state.showMissing = false;
    updateLocks();
    updateMarks();
    setCaption(defaultCaption());
    updateRunFooter();
  }

  /* Tous les verrous de l'expérience, selon l'état (à rappeler après chaque
     changement) : chaque geste attend le précédent, et dit lequel. */
  function updateLocks() {
    const p = phase();
    const T = state.tests;
    // Partie 1 : la tournée suivante attend le test de la précédente, noté.
    const mixBtn = $('[data-mix-round]');
    if (mixBtn) {
      const r = Number(mixBtn.dataset.mixRound);
      let why = null;
      for (let k = 0; k < r && !why; k++) {
        if (!T[k].dyed) why = LABELS.lockRoundTest(k + 1);
        else if (state.totals[k] == null) why = LABELS.lockRoundNote(k + 1);
      }
      lab.setLock(mixBtn, why);
      mixBtn.classList.toggle('lab-btn-primary', !why);
    }
    const sampleBtn = $('[data-sample]');
    const dyeBtn = $('[data-dye]');
    // Le test se fait après les contacts : la goutte, puis l'indicateur.
    let whySample = LABELS.lockTestsDone, whyDye = LABELS.lockTestsDone;
    if (p.kind === 'mix') { whySample = LABELS.lockSampleMix(p.round + 1); whyDye = LABELS.lockDyeSample; }
    else if (p.kind === 'replay' || (p.kind === 'unprot' && p.row === 2)) { whySample = LABELS.lockSampleReplay; whyDye = LABELS.lockDyeSample; }
    else if (p.kind === 'sample') { whySample = null; whyDye = LABELS.lockDyeSample; }
    else if (p.kind === 'dye') { whySample = LABELS.lockSampleDone; whyDye = null; }
    else if (p.kind === 'note') { whySample = LABELS.lockTestNote; whyDye = LABELS.lockTestNote; }
    lab.setLock(sampleBtn, whySample);
    lab.setLock(dyeBtn, whyDye);
    if (sampleBtn) sampleBtn.classList.toggle('lab-btn-primary', !whySample);
    if (dyeBtn) dyeBtn.classList.toggle('lab-btn-primary', !whyDye);

    // Carnet : la ligne du test que montre la plaque, après l'indicateur.
    ROWS.forEach((key, row) => {
      const why = !T[row].dyed ? LABELS.lockRowTest : !rowOpen(row) ? LABELS.lockRowClosed : null;
      $$(`[data-cell^="${row}:"]`).forEach(btn => lab.setLock(btn, why, { icon: false }));
      const total = $(`[data-total="${row}"]`);
      if (total) { total.readOnly = !!why; lab.setLock(total, why); }
      const un = $(`[data-unprot="${row}"]`);
      if (un) {
        const w = state.part < 2 ? LABELS.lockUnprotLater : !T[row].dyed ? LABELS.lockRowTest : null;
        un.readOnly = !!w;
        lab.setLock(un, w);
      }
    });

    const replay = $('[data-replay]');
    if (replay) {
      const why = state.part === 2 && state.unprot[2] == null ? LABELS.lockReplayUnprot : null;
      lab.setLock(replay, state.replayed[replay.dataset.replay] ? null : why);
    }
    const graphTab = $('[data-view="graph"]');
    if (graphTab) lab.setLock(graphTab, state.graphOpen ? null : LABELS.lockGraph, { icon: false });
  }

  // Cases encore vides (et ouvertes) à signaler : bouton suivant touché trop tôt.
  function updateMarks() {
    const show = lab.state.showMissing;
    $$('.sp-num-in').forEach(input => {
      const kind = input.dataset.total != null ? 'total' : 'unprot';
      const v = (kind === 'total' ? state.totals : state.unprot)[Number(input.dataset[kind])];
      input.classList.toggle('lab-is-missing', !!(show && v == null && !input.readOnly));
    });
  }

  function todoEls() {
    if (busy) return [];
    const p = phase();
    switch (p.kind) {
      case 'mix': return [$('[data-mix-round]')];
      case 'sample': return [$('[data-sample]')];
      case 'dye': return [$('[data-dye]')];
      case 'note': return [$(`[data-row-name="${p.row}"]`), $(`[data-total="${p.row}"]`)];
      case 'unprot': return [$(`[data-unprot="${p.row}"]`)];
      case 'replay': return [$('[data-replay]')];
      case 'graph': return state.view === 'graph' ? [$('[data-chart-wrap]')] : [$('[data-view="graph"]')];
      case 'next': return [$('[data-next-part]')];
      default: return [];
    }
  }

  function defaultCaption() {
    const p = phase();
    const C = LABELS.captions;
    if (p.kind === 'mix') return C.mix(p.round + 1);
    if (p.kind === 'sample') return C.sample;
    if (p.kind === 'dye') return C.dye;
    if (p.kind === 'note') return C.note(plain(LABELS.rows[ROWS[p.row]]));
    if (p.kind === 'unprot') return p.row === 2 ? C.unprotFirst : C.unprot;
    if (p.kind === 'replay') return C.replay[p.scen];
    if (p.kind === 'graph') return state.view === 'graph' ? C.graph : C.toGraph;
    return C.next[p.to];
  }

  function setCaption(text, warn) {
    const c = $('[data-caption]');
    if (!c) return;
    c.innerHTML = `<span>${gloss(text)}</span>`;
    c.classList.toggle('is-warning', !!warn);
  }

  /* Pied de page : le gros bouton mène à la partie suivante pas encore
     finie ; il s'allume quand la partie affichée est finie, et touché trop
     tôt, il dit ce qui manque. */
  let stepperDone = null;

  function nextTarget() {
    if (state.part === 1) return 'part2';
    if (state.part === 2) return 'part3';
    if (!state.graphOpen) return 'graph';
    return 'conclude';
  }

  function targetReady(t) {
    return { part2: part1Done, part3: part2Done, graph: part3Done, conclude: benchDone }[t]();
  }

  function renderRunFooter() {
    lab.setFooter(lab.footerInfo('') + `<div class="lab-footer-actions">` +
      `<button type="button" class="lab-btn lab-btn-ghost" data-next-part></button></div>`);
    $('[data-next-part]').addEventListener('click', () => {
      const t = nextTarget();
      if (t === 'part2') { state.part = 2; state.view = 'bench'; }
      else if (t === 'part3') { state.part = 3; state.view = 'bench'; }
      else if (t === 'graph') { state.graphOpen = true; state.view = 'graph'; }
      else { lab.goToStep(3); return; }
      lab.state.showMissing = false;
      renderExperiment();
      lab.renderStepper();
      lab.save();
    });
    updateRunFooter();
  }

  function updateRunFooter() {
    const t = nextTarget();
    const ready = targetReady(t);
    const missing = lab.state.showMissing && !ready;
    const info = $('.lab-footer .lab-footer-info');
    if (info && !info.hasAttribute('data-lab-frozen')) {
      info.textContent = missing ? missingText() : LABELS.partInfo[state.part];
      info.classList.toggle('is-warning', missing);
    }
    const btn = $('[data-next-part]');
    if (btn) {
      btn.textContent = `${LABELS.next[t]} →`;
      btn.classList.toggle('lab-btn-primary', ready);
      btn.classList.toggle('lab-btn-ghost', !ready);
      lab.setLock(btn, ready ? null : missingText(), { missing: true, key: 'next-part' });
    }
    const done = benchDone();
    if (done !== stepperDone) { stepperDone = done; lab.renderStepper(); }
  }

  /* Graphique : le bâton suit le doigt (seul ce bâton est redessiné). */
  function bindChart() {
    const chart = $('[data-chart-wrap] svg');
    if (!chart) return;
    chart.addEventListener('pointerdown', e => {
      const slot = e.target.closest('[data-slot]');
      if (!slot || e.button !== 0) return;
      e.preventDefault();
      const i = Number(slot.dataset.slot);
      const id = e.pointerId;
      setBar(i, valueAt(chart, e.clientY), slot);
      const move = ev => { if (ev.pointerId === id) setBar(i, valueAt(chart, ev.clientY), slot); };
      const up = ev => {
        if (ev.pointerId !== id) return;
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        afterGraph();
        lab.save();
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    });
    chart.addEventListener('keydown', e => {
      const slot = e.target.closest('[data-slot]');
      if (!slot) return;
      const d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      const i = Number(slot.dataset.slot);
      setBar(i, Math.max(0, Math.min(C_TOP, state.bars[i] + d)), slot);
      afterGraph();
      lab.save();
    });
  }

  function valueAt(chart, clientY) {
    const m = chart.getScreenCTM();
    if (!m) return 0;
    const pt = chart.createSVGPoint();
    pt.x = 0;
    pt.y = clientY;
    const p = pt.matrixTransform(m.inverse());
    const C = C_EDIT, sq = (C.H - C.T - C.B) / C_TOP, y0 = C.H - C.B;
    return Math.max(0, Math.min(C_TOP, Math.round((y0 - p.y) / sq)));
  }

  function setBar(i, v, slot) {
    if (state.bars[i] === v) return;
    state.bars[i] = v;
    const C = C_EDIT, sq = (C.H - C.T - C.B) / C_TOP, y0 = C.H - C.B;
    const h = v * sq;
    const rect = slot.querySelector('.sp-bar');
    const text = slot.querySelector('.sp-bar-val');
    rect.setAttribute('y', (y0 - h).toFixed(1));
    rect.setAttribute('height', h.toFixed(1));
    text.setAttribute('y', (y0 - h - 6).toFixed(1));
    text.textContent = v || '';
    slot.setAttribute('aria-valuenow', String(v));
  }

  function afterGraph() {
    const wrap = $('[data-chart-wrap]');
    if (wrap && graphDone()) wrap.classList.remove('lab-is-missing');
    refreshRecords();
  }

  /* ===== Étape 3 : conclusion =====
     À gauche, les résultats notés par l'élève, son graphique et ses
     hypothèses ; à droite, une phrase par idée (listes au milieu des
     phrases), les phrases vraies ou fausses, puis le jugement. */
  const OPTIONS = { shape: SHAPES, condoms: COMPARE, vaccine: COMPARE, both: ['one', 'both'] };

  function conclusionParts() {
    const c = state.concl;
    return {
      shape: !!(c.shape && c.vShape),
      protect: !!(c.condoms && c.vaccine && c.both && c.vProt),
      real: REAL.every(k => !!c.real[k])
    };
  }
  const conclusionsComplete = () => Object.values(conclusionParts()).every(Boolean);

  const numText = v => (v == null ? DASH : String(v));

  function resultsTable() {
    return `<table class="sp-mini"><thead><tr><th></th><th scope="col">${LABELS.allHead}</th><th scope="col">${gloss(LABELS.unprotHead)}</th></tr></thead><tbody>` +
      ROWS.map((key, row) => `<tr><th scope="row">${gloss(LABELS.rows[key])}</th><td>${numText(state.totals[row])}</td>` +
        `<td>${UNPROT_ROWS.includes(row) ? numText(state.unprot[row]) : ''}</td></tr>`).join('') +
      `</tbody></table>`;
  }

  const hypLine = key => LABELS.yourHyp[key](state.hyp[key] ? (key === 'shape' ? LABELS.shapes[state.hyp.shape] : LABELS.compare[state.hyp[key]]) : DASH);

  function renderConclude() {
    const c = state.concl;
    const show = lab.state.showMissing;
    const parts = conclusionParts();
    const miss = k => (show && !parts[k] ? 'lab-is-missing' : '');
    const pick = key => selectHTML(`data-c="${key}"`, c[key], OPTIONS[key], x => LABELS.words[key][x], LABELS.conclAria[key], show);
    const verdict = (key, opts, text) => `<div class="sp-verdict"><span class="sp-verdict-text">${text}</span>` +
      opts.map(x => chipHTML(`data-v="${key}" data-val="${x}"`, LABELS.verdicts[x], c[key] === x)).join('') + `</div>`;
    const real = k => `<div class="sp-real-row"><span>${gloss(LABELS.real[k])}</span>` +
      ['true', 'false'].map(x => chipHTML(`data-real="${k}" data-val="${x}"`, LABELS.trueFalse[x], c.real[k] === x)).join('') + `</div>`;

    lab.body.innerHTML = `<div class="sp-conclude">` +
      `<section class="sp-results"><h3 class="lab-panel-title">${LABELS.resultsTitle}</h3>` +
        stiCardHTML(true) +
        resultsTable() +
        `<div class="sp-mini-chart">${chartSVG('read', state.bars)}</div>` +
        `<div class="sp-hyps"><p class="sp-kicker">${LABELS.hypothesisTitle}</p>` +
          `<p>${gloss(hypLine('shape'))}</p><p>${gloss(hypLine('condoms'))}</p><p>${gloss(hypLine('vaccine'))}</p></div>` +
      `</section>` +
      `<section class="sp-form">` +
        `<p class="sp-big-q">${gloss(LABELS.bigQuestion)}</p>` +
        `<ol class="sp-qs">` +
          `<li class="sp-q ${miss('shape')}"><p class="sp-q-title">${gloss(LABELS.qShape)}</p>` +
            `<p class="sp-line">${LABELS.concl.shape(pick('shape'))}</p>` +
            verdict('vShape', ['confirmed', 'rejected'], LABELS.verdictShape) + `</li>` +
          `<li class="sp-q ${miss('protect')}"><p class="sp-q-title">${gloss(LABELS.qProtect)}</p>` +
            `<p class="sp-line">${LABELS.concl.condoms(pick('condoms'))}</p>` +
            `<p class="sp-line">${LABELS.concl.vaccine(pick('vaccine'))}</p>` +
            `<p class="sp-line">${LABELS.concl.both(pick('both'))}</p>` +
            verdict('vProt', ['confirmed', 'partly', 'rejected'], LABELS.verdictProt) + `</li>` +
          `<li class="sp-q ${miss('real')}"><p class="sp-q-title">${gloss(LABELS.qReal)}</p>` +
            `<div class="sp-real">${REAL.map(real).join('')}</div></li>` +
        `</ol>` +
      `</section></div>`;

    const after = () => {
      if (lab.state.showMissing && conclusionsComplete()) lab.state.showMissing = false;
      renderConclude();
      lab.save();
    };
    $$('select[data-c]').forEach(sel => sel.addEventListener('change', () => { c[sel.dataset.c] = sel.value || null; after(); }));
    $$('[data-v]').forEach(btn => btn.addEventListener('click', () => { c[btn.dataset.v] = btn.dataset.val; after(); }));
    $$('[data-real]').forEach(btn => btn.addEventListener('click', () => { c.real[btn.dataset.real] = btn.dataset.val; after(); }));

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
     Relevés : chaque ligne du carnet comparée à la plaque (creux cochés,
     total, personnes non protégées). Graphique : chaque colonne comparée
     au total noté. Propagation et protection : les réponses comparées à ce
     que disent les nombres notés par l'élève (à défaut, ceux du tirage) ;
     jugements : chaque hypothèse comparée à la conclusion de l'élève. */
  const notedTotal = row => (state.totals[row] != null ? state.totals[row] : truthTotal(row));
  const notedUnprot = row => (state.unprot[row] != null ? state.unprot[row] : truthUnprot(row));
  const compareOf = (scen, base) => (scen < base ? 'fewer' : scen > base ? 'more' : 'same');

  // La forme que montrent trois totaux : de plus en plus vite, régulière, ou à peu près pareille.
  function shapeOf(a, b, c) {
    if (c - a <= 1) return 'same';
    return c - b > b - a ? 'faster' : 'one';
  }

  function evaluate() {
    const rows = ROWS.map((key, row) => {
      const truth = truthRow(row);
      const pink = range(N).filter(i => truth[i]);
      const marked = state.marks[row];
      const marksOk = marked.length === pink.length && pink.every(i => marked.includes(i));
      const totalOk = state.totals[row] === pink.length;
      const unprotOk = !UNPROT_ROWS.includes(row) || state.unprot[row] === truthUnprot(row);
      return { pink, marksOk, totalOk, unprotOk };
    });
    const total = ROWS.length * 2 + UNPROT_ROWS.length;
    const good = rows.reduce((n, r, row) => n + (r.marksOk ? 1 : 0) + (r.totalOk ? 1 : 0) + (UNPROT_ROWS.includes(row) && r.unprotOk ? 1 : 0), 0);
    const barsOk = range(BARS).map(i => state.bars[i] === notedTotal(i));
    const c = state.concl;
    const shape = shapeOf(notedTotal(0), notedTotal(1), notedTotal(2));
    const condoms = compareOf(notedUnprot(3), notedUnprot(2));
    const vaccine = compareOf(notedUnprot(4), notedUnprot(2));
    const shouldShape = state.hyp.shape && state.hyp.shape === c.shape ? 'confirmed' : 'rejected';
    const hits = (state.hyp.condoms && state.hyp.condoms === c.condoms ? 1 : 0) + (state.hyp.vaccine && state.hyp.vaccine === c.vaccine ? 1 : 0);
    const shouldProt = hits === 2 ? 'confirmed' : hits === 1 ? 'partly' : 'rejected';
    const realOk = {};
    REAL.forEach(k => { realOk[k] = c.real[k] === REAL_RIGHT[k]; });
    const ok = {
      shape: c.shape === shape, vShape: c.vShape === shouldShape,
      condoms: c.condoms === condoms, vaccine: c.vaccine === vaccine, both: c.both === 'both', vProt: c.vProt === shouldProt
    };
    return {
      rows, good, total, barsOk, shape, condoms, vaccine, shouldShape, shouldProt, realOk, ok,
      counts: good === total,
      graph: barsOk.every(Boolean),
      spread: ok.shape && ok.vShape,
      protection: ok.condoms && ok.vaccine && ok.both && ok.vProt,
      reality: REAL.every(k => realOk[k])
    };
  }

  const pinkList = list => (list.length ? LABELS.list(list.map(i => String(i + 1))) : LABELS.none);
  const sentence = (key, value) => LABELS.concl[key](LABELS.words[key][value]);

  function criterionDetail(key, ev) {
    const c = state.concl;
    const line = (good, html) => `<li class="${good ? 'is-ok' : 'is-ko'}"><span class="sp-mark">${good ? '✓' : '✗'}</span><span>${html}</span></li>`;
    const verdictLine = (good, text) => `<p class="${good ? 'sp-ok' : 'sp-ko'}">${text} ${good ? CHECK.judgedOk : CHECK.judgedWrong}</p>`;

    if (key === 'counts') {
      if (!state.started) return `<p>${CHECK.noExperiment}</p>`;
      const head = range(N).map(i => `<th scope="col">${i + 1}</th>`).join('');
      const rows = ROWS.map((k, row) => {
        const r = ev.rows[row];
        const cells = range(N).map(i => {
          const pink = r.pink.includes(i), on = state.marks[row].includes(i);
          return `<td class="${row >= 3 && isProt(run, i) ? 'is-prot' : ''} ${pink === on ? '' : 'is-ko'}">${pink ? '<i class="sp-dot"></i>' : ''}${on ? '<b>✓</b>' : ''}</td>`;
        }).join('');
        const num = (good, yours, right) => (good ? `<td class="is-ok">${numText(yours)}</td>` : `<td class="is-ko"><span>${numText(yours)}</span><small>${right}</small></td>`);
        return `<tr><th scope="row">${gloss(LABELS.rows[k])}</th>${cells}${num(r.totalOk, state.totals[row], r.pink.length)}` +
          (UNPROT_ROWS.includes(row) ? num(r.unprotOk, state.unprot[row], truthUnprot(row)) : '<td></td>') + `</tr>`;
      }).join('');
      return `<p>${CHECK.countsScore(ev.good, ev.total)}</p>` +
        `<table class="sp-check-table"><thead><tr><th></th>${head}<th>${LABELS.totalHead}</th><th>${gloss(LABELS.unprotHead)}</th></tr></thead><tbody>${rows}</tbody></table>` +
        `<p class="sp-muted">${gloss(CHECK.countsKey)}</p>` +
        (ev.counts ? `<p class="sp-ok">${CHECK.countsAllGood}</p>` : `<p class="sp-muted">${gloss(CHECK.countsHow)}</p>`);
    }
    if (key === 'graph') {
      const expected = range(BARS).map(notedTotal);
      return `<div class="sp-check-chart">${chartSVG('read', state.bars)}</div>` +
        `<ul class="sp-checklist">${range(BARS).map(i => line(ev.barsOk[i], CHECK.barLine(plain(LABELS.rows[ROWS[i]]), state.bars[i], expected[i]))).join('')}</ul>` +
        `<p class="sp-muted">${gloss(CHECK.graphHow)}</p>`;
    }
    if (key === 'spread') {
      const totals = [0, 1, 2].map(notedTotal);
      return `<p>${CHECK.yourTotals(totals[0], totals[1], totals[2])}</p>` +
        `<ul class="sp-checklist">${line(ev.ok.shape, gloss(sentence('shape', ev.shape)))}</ul>` +
        `<p>${gloss(EXPLAIN.spread)}</p>` +
        `<p>${gloss(hypLine('shape'))}</p>` +
        verdictLine(ev.ok.vShape, CHECK.verdict[ev.shouldShape]);
    }
    if (key === 'protection') {
      return `<p>${CHECK.yourUnprot(numText(state.unprot[2]), numText(state.unprot[3]), numText(state.unprot[4]))}</p>` +
        `<ul class="sp-checklist">` +
          line(ev.ok.condoms, gloss(sentence('condoms', ev.condoms))) +
          line(ev.ok.vaccine, gloss(sentence('vaccine', ev.vaccine))) +
          line(ev.ok.both, gloss(sentence('both', 'both'))) +
        `</ul>` +
        `<p>${gloss(EXPLAIN.condoms)}</p>` +
        `<p>${gloss(EXPLAIN.vaccine[run.sti])}</p>` +
        (run.sti === 'hpv' ? `<p class="sp-muted">${gloss(EXPLAIN.leak)}</p>` : '') +
        `<p>${gloss(hypLine('condoms'))} ${gloss(hypLine('vaccine'))}</p>` +
        verdictLine(ev.ok.vProt, CHECK.verdictProt[ev.shouldProt]);
    }
    return `<ul class="sp-checklist">${REAL.map(k => line(ev.realOk[k], `${gloss(LABELS.real[k])} <strong>${LABELS.trueFalse[REAL_RIGHT[k]]}</strong>. ${gloss(EXPLAIN.real[k])}`)).join('')}</ul>` +
      legendHTML(true) +
      `<p class="sp-muted">${gloss(EXPLAIN.model)}</p>`;
  }

  function renderCheck() {
    const ev = evaluate();
    const score = CRITERIA.filter(k => ev[k]).length;
    const rows = CRITERIA.map(k => `<button type="button" class="sp-crit ${ev[k] ? 'is-ok' : 'is-ko'} ${state.selected === k ? 'is-selected' : ''}" data-crit="${k}">` +
      `<span class="sp-crit-text"><strong>${LABELS.criteria[k]}</strong><small>${LABELS.criteriaSub[k]}</small></span>` +
      `<span class="sp-crit-mark" aria-label="${ev[k] ? LABELS.markCorrect : LABELS.markIncorrect}">${ev[k] ? '✓' : '✗'}</span></button>`).join('');

    lab.body.innerHTML = `<div class="sp-check">` +
      `<div class="sp-check-left">` +
        `<div class="lab-score"><span class="lab-score-num">${score}<small> / ${CRITERIA.length}</small></span><span class="lab-score-label">${LABELS.scoreLabel}</span></div>` +
        `<div class="sp-crit-list">${rows}</div>` +
        `<p class="sp-reminder">${gloss(LABELS.bigQuestion)}</p>` +
      `</div>` +
      `<div class="sp-check-detail" aria-live="polite"><h3>${LABELS.criteria[state.selected]}</h3>${criterionDetail(state.selected, ev)}</div>` +
      `</div>`;

    $$('[data-crit]').forEach(btn => btn.addEventListener('click', () => {
      state.selected = btn.dataset.crit;
      renderCheck();
    }));
    lab.fillSpace($('.sp-check-detail'));
    lab.checkFooter();
  }

  /* ===== Rapport imprimable : contenu des 7 sections de la fiche outil FO3
     (en-tête, numérotation et mise en page : cadre commun) =====
     Les erreurs passent par mark() (lab-engine.js), dans l'ordre de
     lecture : relevés faux (observations), colonnes fausses, réponses de la
     conclusion et jugements. */
  function buildReport(mark) {
    const R = LABELS.report;
    const ev = evaluate();
    const c = state.concl;
    const word = (text, good, note) => (good ? text : mark(text, plain(note)));

    const hyp = `<ul><li>${plain(hypLine('shape'))}</li><li>${plain(hypLine('condoms'))}</li><li>${plain(hypLine('vaccine'))}</li></ul>` +
      (state.because.trim() ? `<p>${R.because}: ${escapeHtml(state.because.trim())}</p>` : '');

    const log = `<p>${R.exchanges}</p><ul>${run.rounds.map((pairs, r) => `<li>${LABELS.round(r + 1)}: ${pairs.map(([a, b]) => plain(LABELS.pair(String(a + 1), String(b + 1)))).join(' · ')}</li>`).join('')}</ul>`;
    const prot = `<p>${R.protected(LABELS.list(run.prot.map(i => String(i + 1))))}</p>`;
    const rowsHTML = ROWS.map((key, row) => {
      const r = ev.rows[row];
      const pinks = pinkList(state.marks[row]);
      const cellPink = r.marksOk ? pinks : mark(pinks, CHECK.pinkNote(pinkList(r.pink)), { box: true });
      const cellTotal = r.totalOk ? numText(state.totals[row]) : mark(numText(state.totals[row]), CHECK.totalNote(r.pink.length), { box: true });
      const cellUn = !UNPROT_ROWS.includes(row) ? '' : r.unprotOk ? numText(state.unprot[row]) : mark(numText(state.unprot[row]), CHECK.unprotNote(truthUnprot(row)), { box: true });
      return `<tr><th>${plain(LABELS.rows[key])}</th><td>${cellPink}</td><td>${cellTotal}</td><td>${cellUn}</td></tr>`;
    }).join('');
    const table = `<table class="sp-report-table"><tr><th></th><th>${R.pinkHead}</th><th>${LABELS.totalHead}</th><th>${plain(LABELS.unprotHead)}</th></tr>${rowsHTML}</table>`;
    const graphNote = ev.graph ? '' : `<p>${mark(R.graphMark, CHECK.graphNote(range(BARS).map(notedTotal).join(', ')))}</p>`;
    const observations = log + prot + table + `<div class="sp-report-chart">${chartSVG('read', state.bars)}</div>` + graphNote;

    const pickWord = (key, good, note) => LABELS.concl[key](c[key] ? word(LABELS.words[key][c[key]], good, note) : DASH);
    const interpretation = `<p>${pickWord('condoms', ev.ok.condoms, CHECK.rightIs(sentence('condoms', ev.condoms)))}</p>` +
      `<p>${pickWord('vaccine', ev.ok.vaccine, CHECK.rightIs(sentence('vaccine', ev.vaccine)))}</p>` +
      `<p>${pickWord('both', ev.ok.both, CHECK.rightIs(sentence('both', 'both')))}</p>` +
      `<p>${R.realTitle}</p><ul>${REAL.map(k => `<li>${plain(LABELS.real[k])} ${c.real[k] ? word(LABELS.trueFalse[c.real[k]], ev.realOk[k], `${LABELS.trueFalse[REAL_RIGHT[k]]}. ${plain(EXPLAIN.real[k])}`) : DASH}</li>`).join('')}</ul>`;

    const verdictLine = (text, v, should, notes) => R.verdict(text, v ? word(LABELS.verdicts[v], v === should, notes[should]) : DASH);
    const conclusion = `<p>${pickWord('shape', ev.ok.shape, CHECK.rightIs(sentence('shape', ev.shape)))}</p>` +
      `<ul><li>${verdictLine(LABELS.verdictShape, c.vShape, ev.shouldShape, CHECK.verdict)}</li>` +
      `<li>${verdictLine(LABELS.verdictProt, c.vProt, ev.shouldProt, CHECK.verdictProt)}</li></ul>`;

    const correction = CRITERIA.map(k => `<tr><th>${LABELS.criteria[k]}</th><td class="${ev[k] ? 'ok' : 'ko'}">${ev[k] ? '✓' : '✗'}</td></tr>`).join('');

    return {
      title: R.title,
      sections: [
        `<p>${plain(LABELS.bigQuestion)}</p><ol>${LABELS.subQuestions.map(q => `<li>${plain(q)}</li>`).join('')}</ol>`,
        hyp,
        `<p>${R.materials(LABELS.sti[run.sti].name)}</p><p>${plain(LABELS.legend.title)} ${[LABELS.legend.tube, LABELS.legend.mix, LABELS.legend.pink, LABELS.legend.cap, LABELS.legend.sticker].map(plain).join(' · ')}</p>`,
        `<ol>${R.steps.map(t => `<li>${t}</li>`).join('')}</ol>`,
        observations,
        interpretation,
        conclusion
      ],
      correction: `<p><strong>${R.score(CRITERIA.filter(k => ev[k]).length, CRITERIA.length)}</strong></p>` +
        `<table class="sp-report-corr">${correction}</table>`
    };
  }

  lab = LabEngine.create({
    id: 'spread',
    // Ce qu'il faut toucher ou remplir maintenant (voir phase).
    todo: step => (step === 2 ? todoEls() : []),
    // Page d'accueil (Mission, voir lab-engine.js) : toujours la même, rien du tirage.
    briefing: () => ({
      heading: LABELS.briefTitle,
      intro: gloss(LABELS.briefTask),
      questionTitle: LABELS.yourQuestion,
      questions: [gloss(LABELS.bigQuestion)],
      art: legendHTML(true),
      steps: LABELS.briefSteps.map((text, i) => ({
        text: gloss(text),
        detail: gloss(LABELS.briefDetails[i]),
        pics: i === 1 ? [
          { html: ICON.tube, label: LABELS.tools.tubes },
          { html: ICON.pipette, label: LABELS.tools.pipette },
          { html: ICON.plate, label: LABELS.tools.plate },
          { html: ICON.indicator, label: LABELS.tools.indicator }
        ] : null
      })),
      checks: Object.values(LABELS.criteria)
    }),
    title: LABELS.title,
    glossary: GLOSSARY,
    reset,
    stepComplete,
    lockReason,
    isStarted: () => !!(state.hyp.shape || state.hyp.condoms || state.hyp.vaccine) || state.started,
    render: { 1: renderPredict, 2: () => renderExperiment(), 3: renderConclude, 4: renderCheck },
    report: buildReport,
    version: 2,
    save: () => ({ run, state }),
    // Une animation interrompue est déjà comptée : la paillasse se
    // redessine dans l'état atteint.
    load(data) {
      const r = data.run, s = data.state;
      const okPair = p => Array.isArray(p) && p.length === 2 && p.every(i => Number.isInteger(i) && i >= 0 && i < N);
      if (!r || !STIS.includes(r.sti) || !Number.isInteger(r.carrier) || !Array.isArray(r.rounds) || r.rounds.length !== 3 ||
        !r.rounds.every(ps => Array.isArray(ps) && ps.every(okPair)) || !Array.isArray(r.prot) || r.prot.length !== PROTECTED ||
        !s || !s.hyp || !Array.isArray(s.mixed) || s.mixed.length !== 3 || !Array.isArray(s.tests) || s.tests.length !== ROWS.length ||
        !Array.isArray(s.marks) || !Array.isArray(s.totals) || !Array.isArray(s.unprot) || !Array.isArray(s.bars) || s.bars.length !== BARS ||
        !s.replayed || !s.concl || !s.concl.real || ![1, 2, 3].includes(s.part)) throw new Error('labProgress');
      run = r;
      state = s;
      computeSims();
      if (!CRITERIA.includes(state.selected)) state.selected = CRITERIA[0];
      busy = false;
      replaying = null;
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
          sti: run.sti,
          totals: ROWS.map((k, row) => truthTotal(row)),
          hypShape: state.hyp.shape,
          hypCondoms: state.hyp.condoms,
          hypVaccine: state.hyp.vaccine,
          notesRight: ev.good,
          notes: ev.total
        }
      };
    }
  });
})();
