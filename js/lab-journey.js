/* ===== Labo virtuel « Stop the journey » (bio2) : où agit chaque méthode ? =====

   Simulation propre à ce labo, commune aux deux filières ; ses textes sont
   dans le dossier du chapitre, un fichier par langue (lab-journey.en.js,
   lab-journey.nl.js). Le cadre commun (modale, barre d'étapes, verrous,
   traduction, glisser-déposer, rapport imprimé) est dans lab-engine.js.
   Ordre de chargement : moteur, textes, ce fichier.

   Pas de labo réel dans le chapitre : expérience sur un modèle, la version
   visuelle de la Mission 13 du cours (« Stopping the journey ») élargie aux
   IST (Mission 14). Deux schémas simplifiés, comme les schémas A et B du
   cours (appareil masculin de profil, appareil féminin de face), reliés par
   la flèche du contact (« during sexual intercourse, the penis is inside the
   vagina »). Sur ce modèle bougent les spermatozoïdes, l'ovocyte, les
   hormones (pilule, implant) et deux microbes : la chlamydia (bâtonnets
   verts, une bactérie) et le HPV (hexagones violets, un virus).

   Règles du modèle (cours, Missions 13 et 14) : pilule et implant, des
   hormones par le sang jusqu'aux ovaires, pas d'ovocyte ; préservatif (sur
   le pénis) et préservatif interne (dans le vagin), pas de rencontre, la
   chlamydia arrêtée, le HPV en partie (un virus passe par la peau autour) ;
   stérilet au cuivre (utérus), les spermatozoïdes ne passent pas l'utérus ;
   retrait, quelques spermatozoïdes sortent avant (en partie) ; vaccin HPV
   (tout le corps), le HPV ne s'installe pas. Une méthode se pose d'elle-même
   là où on l'utilise (pilule, implant et vaccin : « the whole body ») ;
   l'élève note où elle agit d'après ce qu'il voit.

   Tiré au sort à chaque nouveau labo : le couple (prénoms, et ses besoins :
   toujours « pas de grossesse », plus un ou deux parmi IST, pas
   d'hormones, rien à penser chaque jour, protection contre le HPV) ;
   l'ordre des cartes ; la place des spermatozoïdes et des microbes dans
   les animations.

   Déroulé :
     1. Predict    — Q1 : poser les 7 cartes sur les dessins, là où elles
                     agissent ; Q2 : le conseil pour le couple (1 ou 2
                     cartes) ; « Why do you think so? » facultatif ; figé au
                     premier essai
     2. Experiment — partie 1 : sans méthode (le témoin), puis chaque
                     méthode ; « Run » ; noter où elle agit (toucher la zone)
                     et quatre cases à pictogrammes (ovocyte libéré,
                     rencontre, chlamydia, HPV : ✓, ✗ ou en partie) ;
                     partie 2 : le conseil essayé sur le modèle, ses quatre
                     cases, puis chaque besoin du couple rempli ou non ; un
                     2e essai possible
     3. Conclude   — Q1 : corriger le dessin de Predict, ranger les cartes
                     (pas d'ovocyte / pas de rencontre / n'empêche pas une
                     grossesse), celles qui arrêtent aussi une IST ; Q2 : le
                     conseil, pour chaque besoin la case du carnet qui le
                     prouve, qui est responsable ; jugement des deux
                     hypothèses
     4. Check      — 5 vérifications : carnet, où, ce qui est arrêté,
                     conseil, les deux partenaires ; rapport (FO3) */

(function () {
  'use strict';

  const { escapeHtml, shuffle, pick, mulberry32, seedFrom } = LabEngine.util;

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
  } = LabEngine.textFor('journey');

  /* ===== Modèle ===== */
  const METHODS = ['pill', 'implant', 'condom', 'internal', 'iud', 'withdrawal', 'vaccine'];
  const ROWS = ['none'].concat(METHODS);
  const COLS = ['egg', 'meet', 'chla', 'hpv'];
  const MARKS = ['yes', 'no', 'partly'];
  const ZONES = ['body', 'testes', 'penis', 'vagina', 'uterus', 'tubes', 'ovaries'];
  const USE_ZONE = { pill: 'body', implant: 'body', condom: 'penis', internal: 'vagina', iud: 'uterus', withdrawal: 'penis', vaccine: 'body' };
  const ACT_ZONE = { pill: 'ovaries', implant: 'ovaries', condom: 'penis', internal: 'vagina', iud: 'uterus', withdrawal: 'penis', vaccine: 'body' };
  // Ce qui passe (yes), est arrêté (no) ou passe en partie, méthode par méthode.
  const EFFECT = {
    pill: { egg: 'no', meet: 'no', chla: 'yes', hpv: 'yes' },
    implant: { egg: 'no', meet: 'no', chla: 'yes', hpv: 'yes' },
    condom: { egg: 'yes', meet: 'no', chla: 'no', hpv: 'partly' },
    internal: { egg: 'yes', meet: 'no', chla: 'no', hpv: 'partly' },
    iud: { egg: 'yes', meet: 'no', chla: 'yes', hpv: 'yes' },
    withdrawal: { egg: 'yes', meet: 'partly', chla: 'yes', hpv: 'yes' },
    vaccine: { egg: 'yes', meet: 'yes', chla: 'yes', hpv: 'no' }
  };
  const WAYS = ['w1', 'w2', 'none'];
  const WAY = { pill: 'w1', implant: 'w1', condom: 'w2', internal: 'w2', iud: 'w2', withdrawal: 'w2', vaccine: 'none' };
  const SHIELD = { pill: false, implant: false, condom: true, internal: true, iud: false, withdrawal: false, vaccine: true };
  const HORMONES = ['pill', 'implant'];
  const USE = { pill: 'daily', implant: 'years', condom: 'each', internal: 'each', iud: 'years', withdrawal: 'each', vaccine: 'years' };
  const IMG = { pill: 'pill', implant: 'implant', condom: 'condom', internal: 'internal-condom', iud: 'iud', vaccine: 'vaccine' };
  const NEEDS = ['noPregnancy', 'sti', 'noHormones', 'nothingDaily', 'hpv'];
  const COUPLES = [
    ['noPregnancy', 'sti'],
    ['noPregnancy', 'sti', 'nothingDaily'],
    ['noPregnancy', 'noHormones'],
    ['noPregnancy', 'noHormones', 'sti'],
    ['noPregnancy', 'nothingDaily', 'hpv'],
    ['noPregnancy', 'hpv', 'sti']
  ];
  // Le besoin qui se prouve par une case du carnet, et sa colonne.
  const PROOF_COL = { noPregnancy: 'meet', sti: 'chla', hpv: 'hpv' };
  const VERDICTS = ['confirmed', 'partly', 'rejected'];
  const WHO = ['girl', 'boy', 'both'];
  const CRITERIA = ['notes', 'where', 'stops', 'advice', 'partners'];
  const MAX_TRIES = 2;
  const RANK = { no: 0, partly: 1, yes: 2 };
  const DASH = '—';

  let run;      // tirage
  let state;    // travail de l'élève
  let busy = false;          // pendant une animation
  let held = null;           // la carte en main (Predict, Conclude)

  const range = n => Array.from({ length: n }, (_, i) => i);
  const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  // Ce que donne un ensemble de méthodes : la plus forte l'emporte, sans ovocyte pas de rencontre.
  function combine(cards) {
    const r = { egg: 'yes', meet: 'yes', chla: 'yes', hpv: 'yes' };
    cards.forEach(m => COLS.forEach(c => { if (RANK[EFFECT[m][c]] < RANK[r[c]]) r[c] = EFFECT[m][c]; }));
    if (r.egg === 'no') r.meet = 'no';
    return r;
  }

  function needMet(need, cards) {
    const r = combine(cards);
    if (need === 'noPregnancy') return r.meet === 'no';
    if (need === 'sti') return r.chla === 'no' && r.hpv !== 'yes';
    if (need === 'noHormones') return !cards.some(m => HORMONES.includes(m));
    if (need === 'nothingDaily') return !cards.includes('pill');
    return r.hpv === 'no';
  }

  /* Les lignes du carnet : le témoin, chaque méthode, puis les essais pour
     le couple (try0, try1). */
  const isTry = key => /^try\d$/.test(key);
  const tryIndex = key => Number(key.slice(3));
  const rowCards = key => (key === 'none' ? [] : isTry(key) ? state.tries[tryIndex(key)].cards : [key]);
  const noteOf = key => (isTry(key) ? state.tries[tryIndex(key)] : state.notes[key]);
  const truthOf = key => combine(rowCards(key));

  const freshNote = () => ({ ran: false, where: null, egg: null, meet: null, chla: null, hpv: null });
  const freshTry = cards => ({ cards: cards.slice(), ran: false, egg: null, meet: null, chla: null, hpv: null, badges: {} });
  const methodMap = v => Object.fromEntries(METHODS.map(m => [m, typeof v === 'function' ? v() : v]));

  function drawRun() {
    const girls = shuffle(range(LABELS.girls.length));
    const boys = shuffle(range(LABELS.boys.length));
    return {
      needs: pick(COUPLES).slice(),
      girl: girls[0],
      boy: boys[0],
      order: shuffle(METHODS.slice()),
      seed: String(Math.random())
    };
  }

  function reset() {
    run = drawRun();
    state = {
      hyp: { place: methodMap(null), advice: [], because: '' },
      started: false,       // l'hypothèse se fige au premier essai
      part: 1,              // 1 : chaque méthode ; 2 : le conseil
      current: null,        // la ligne du carnet montrée sur le modèle
      notes: Object.fromEntries(ROWS.map(k => [k, freshNote()])),
      tries: [],
      concl: { place: methodMap(null), placeCopied: false, way: methodMap(null), shield: methodMap(false), advice: [], adviceCopied: false, proofs: {}, who: null, vPlace: null, vAdvice: null },
      cTab: 1,
      proofFor: null,
      selected: CRITERIA[0]
    };
    busy = false;
    held = null;
    stepperDone = null;
    conclReady = null;
  }

  const girlName = () => LABELS.girls[run.girl];
  const boyName = () => LABELS.boys[run.boy];
  const methodName = m => (m === 'none' ? LABELS.noMethod : LABELS.methods[m]);

  // Ce qui est fait, dans l'ordre de la manipulation.
  const rowDone = key => {
    const n = noteOf(key);
    return n.ran && COLS.every(c => !!n[c]) && (key === 'none' || isTry(key) || !!n.where);
  };
  const part1Done = () => ROWS.every(rowDone);
  const tryDone = t => t.ran && COLS.every(c => !!t[c]) && run.needs.every(n => !!t.badges[n]);
  // Un 2e essai ouvert puis laissé vide ne compte pas.
  const activeTry = t => t.ran || t.cards.length > 0;
  const tryKeys = () => state.tries.map((t, i) => (activeTry(t) ? `try${i}` : null)).filter(Boolean);
  const part2Done = () => state.tries.length > 0 && tryDone(state.tries[0]) && state.tries.filter(activeTry).every(tryDone);
  const benchDone = () => part1Done() && part2Done();
  const lastTry = () => state.tries[state.tries.length - 1];
  const lastActiveTry = () => state.tries.filter(activeTry).pop();

  /* La prochaine chose à faire : la légende la dit, ce qu'il faut toucher
     ou remplir est en couleur, et le bouton du pied dit ce qui manque. */
  function phase() {
    if (state.part === 1) {
      const cur = state.current;
      if (cur && !rowDone(cur)) {
        const n = noteOf(cur);
        if (!n.ran) return { kind: 'run', key: cur };
        if (cur !== 'none' && !n.where) return { kind: 'where', key: cur };
        return { kind: 'cells', key: cur };
      }
      if (!state.notes.none.ran) return { kind: 'pick', first: true };
      if (METHODS.some(m => !rowDone(m))) return { kind: 'pick' };
      return { kind: 'next', to: 'part2' };
    }
    const t = lastTry();
    const key = `try${state.tries.length - 1}`;
    if (!t.ran && !t.cards.length && part2Done()) return { kind: 'next', to: 'conclude' };
    if (!t.ran) return t.cards.length ? { kind: 'run', key } : { kind: 'choose' };
    if (!COLS.every(c => !!t[c])) return { kind: 'cells', key };
    if (!run.needs.every(n => !!t.badges[n])) return { kind: 'badges' };
    return { kind: 'next', to: 'conclude' };
  }

  function missingText() {
    const p = phase();
    const M = LABELS.missing;
    if (p.kind === 'run') return M.run;
    if (p.kind === 'where') return M.where(methodName(p.key));
    if (p.kind === 'cells') return M.cells;
    if (p.kind === 'pick') return p.first ? M.first : M.pick;
    if (p.kind === 'choose') return M.choose;
    if (p.kind === 'badges') return M.badges;
    return M.next(LABELS.next[p.to]);
  }

  /* ===== Dessins =====
     Le modèle (700 × 420) : à gauche l'appareil masculin de profil, à
     droite l'appareil féminin de face, en haut le cadre « the whole body »
     relié aux ovaires par deux vaisseaux sanguins, entre les deux la flèche
     du contact. Les zones où une méthode peut agir sont des groupes data-zone
     (une forme transparente plus large que l'organe). */
  const B = { W: 700, H: 420, V: 38 };
  const C = {
    line: '#5f564f', skin: '#f1c7a8', skinDark: '#d99c7f', pink: '#f2b8c0', pinkDark: '#d97a8c', cavity: '#fbe5e7',
    tube: '#e9a3b0', ovary: '#f3d0b0', bladder: '#f4ecc8', duct: '#c58b6b', vessel: '#d96a6a',
    sperm: '#4f74b3', egg: '#f6b6c8', eggLine: '#c94f74', chla: '#3fa66b', hpv: '#8a63d2', hormone: '#f0a030', vaccine: '#2f80d1'
  };
  const PATHS = {
    male: 'M170 284 C178 272 182 266 178 262 C204 236 206 196 186 160 C170 128 140 104 128 128 C122 146 124 164 126 182 Q130 200 140 212 Q150 224 166 226 L306 231',
    contact: 'M308 232 C380 236 450 352 540 326',
    female: 'M540 326 L540 232 Q540 196 540 160 Q560 130 598 118 C618 102 634 96 650 98',
    egg: 'M666 140 Q684 122 676 104 C666 94 658 96 650 98',
    out: 'M308 234 Q334 262 326 304',
    skin: 'M206 248 C300 300 440 362 526 330',
    inside: 'M540 326 L540 282',
    vesselL: 'M350 52 C350 90 392 108 414 128',
    vesselR: 'M350 52 C424 70 612 72 666 128'
  };
  // Le canal déférent (du testicule, devant puis par-dessus la vessie, jusqu'à la prostate) et l'urètre.
  const DUCT = 'M174 264 C202 236 206 196 186 160 C170 128 140 104 128 128 C122 146 124 164 126 182';
  const URETHRA = 'M118 160 Q122 186 132 204 Q142 220 166 226 L306 231';

  // Les places des vignettes posées sur chaque zone (centres), dans l'ordre.
  const SLOTS = {
    body: [[372, 29], [412, 29], [452, 29], [492, 29], [532, 29], [572, 29], [612, 29]],
    testes: [[112, 268], [112, 308], [72, 268], [72, 308], [32, 268], [32, 308], [112, 348]],
    penis: [[190, 186], [230, 186], [270, 186], [310, 186], [230, 148], [270, 148], [310, 148]],
    vagina: [[602, 286], [642, 286], [602, 326], [642, 326], [682, 286], [682, 326], [602, 366]],
    uterus: [[540, 190], [500, 172], [580, 172], [540, 226], [498, 212], [582, 212], [540, 112]],
    tubes: [[588, 60], [628, 60], [668, 60], [548, 60], [508, 60], [468, 60], [428, 60]],
    ovaries: [[414, 188], [454, 188], [666, 188], [626, 188], [374, 188], [494, 188], [586, 188]]
  };

  const svgOpen = (cls, extra) => `<svg class="${cls}" viewBox="0 0 ${B.W} ${B.H}" ${extra || ''} aria-hidden="true" focusable="false">`;

  // Les deux schémas, les zones, les étiquettes, la flèche du contact.
  function anatomySVG() {
    const Z = LABELS.zones;
    const label = (x, y, text, anchor, cls) => `<text class="jr-organ ${cls || ''}" x="${x}" y="${y}" text-anchor="${anchor || 'middle'}">${escapeHtml(text)}</text>`;
    const contact = LABELS.contact.map((t, i) => `<tspan x="404" dy="${i ? 14 : 0}">${escapeHtml(t)}</tspan>`).join('');
    return (
      // Le cadre « the whole body » et les vaisseaux sanguins jusqu'aux ovaires.
      `<path d="${PATHS.vesselL}" class="jr-vessel"/><path d="${PATHS.vesselR}" class="jr-vessel"/>` +
      // Appareil masculin.
      `<ellipse cx="110" cy="128" rx="40" ry="34" fill="${C.bladder}" stroke="${C.line}" stroke-width="1.6"/>` +
      `<ellipse cx="160" cy="150" rx="9" ry="18" transform="rotate(-20 160 150)" fill="${C.ovary}" stroke="${C.line}" stroke-width="1.4"/>` +
      `<ellipse cx="126" cy="190" rx="20" ry="13" fill="${C.ovary}" stroke="${C.line}" stroke-width="1.4"/>` +
      `<path d="${DUCT}" fill="none" stroke="${C.duct}" stroke-width="3" stroke-linecap="round"/>` +
      `<g data-zone="penis" class="jr-zone"><path d="M136 198 L314 206 L318 258 L136 254 Z" class="jr-hit"/>` +
        `<path d="M142 206 L280 214 Q306 218 308 232 Q306 246 280 248 L142 242 Z" fill="${C.skin}" stroke="${C.line}" stroke-width="1.6"/></g>` +
      `<g data-zone="testes" class="jr-zone"><circle cx="170" cy="278" r="36" class="jr-hit"/>` +
        `<circle cx="170" cy="278" r="30" fill="${C.skin}" stroke="${C.line}" stroke-width="1.6"/>` +
        `<ellipse cx="170" cy="280" rx="16" ry="20" fill="${C.skinDark}" stroke="${C.line}" stroke-width="1.2"/></g>` +
      `<path d="${URETHRA}" fill="none" stroke="${C.duct}" stroke-width="2.4" stroke-linecap="round"/>` +
      label(112, 132, Z.bladder, 'middle', 'is-minor') + label(226, 270, Z.penis) + label(170, 326, Z.testes) +
      // Appareil féminin.
      `<g data-zone="tubes" class="jr-zone"><path d="M482 118 C452 90 424 84 404 104" class="jr-hit-line"/>` +
        `<path d="M482 118 C452 90 424 84 404 104" fill="none" stroke="${C.tube}" stroke-width="8" stroke-linecap="round"/>` +
        `<path d="M404 104 l-8 -6 M404 104 l-10 2 M404 104 l-6 8" stroke="${C.pinkDark}" stroke-width="2" stroke-linecap="round"/></g>` +
      `<g data-zone="tubes" class="jr-zone"><path d="M598 118 C628 90 656 84 676 104" class="jr-hit-line"/>` +
        `<path d="M598 118 C628 90 656 84 676 104" fill="none" stroke="${C.tube}" stroke-width="8" stroke-linecap="round"/>` +
        `<path d="M676 104 l8 -6 M676 104 l10 2 M676 104 l6 8" stroke="${C.pinkDark}" stroke-width="2" stroke-linecap="round"/></g>` +
      `<g data-zone="ovaries" class="jr-zone"><ellipse cx="414" cy="140" rx="26" ry="19" class="jr-hit"/>` +
        `<ellipse cx="414" cy="140" rx="19" ry="12" fill="${C.ovary}" stroke="${C.line}" stroke-width="1.5" data-ovary/></g>` +
      `<g data-zone="ovaries" class="jr-zone"><ellipse cx="666" cy="140" rx="26" ry="19" class="jr-hit"/>` +
        `<ellipse cx="666" cy="140" rx="19" ry="12" fill="${C.ovary}" stroke="${C.line}" stroke-width="1.5" data-ovary/></g>` +
      `<g data-zone="uterus" class="jr-zone"><path d="M478 112 Q540 92 602 112 Q604 166 574 200 Q558 216 554 230 L526 230 Q522 216 506 200 Q476 166 478 112 Z" fill="${C.pink}" stroke="${C.line}" stroke-width="1.6"/>` +
        `<path d="M500 122 Q540 112 580 122 Q562 168 540 194 Q518 168 500 122 Z" fill="${C.cavity}"/></g>` +
      `<g data-zone="vagina" class="jr-zone"><path d="M512 226 L568 226 L574 334 L506 334 Z" class="jr-hit"/>` +
        `<path d="M524 230 L556 230 L562 318 Q540 328 518 318 Z" fill="${C.pink}" stroke="${C.line}" stroke-width="1.6"/>` +
        `<path d="M532 236 L548 236 L552 314 Q540 318 528 314 Z" fill="${C.cavity}"/></g>` +
      label(436, 80, Z.tubes) + label(380, 144, Z.ovaries, 'end') + label(540, 150, Z.uterus) + label(500, 290, Z.vagina, 'end') +
      // Le cadre du corps entier (zone), en dernier pour rester au-dessus des vaisseaux.
      `<g data-zone="body" class="jr-zone jr-body"><rect x="230" y="6" width="420" height="46" rx="14" class="jr-body-box"/>` +
        `<text class="jr-organ jr-body-name" x="246" y="34">${escapeHtml(Z.body)}</text></g>` +
      // Le contact.
      `<path d="${PATHS.contact}" class="jr-contact"/>` +
      `<text class="jr-contact-text" x="404" y="352" text-anchor="middle">${contact}</text>` +
      // Les chemins (invisibles) des animations.
      Object.entries(PATHS).map(([k, d]) => `<path data-path="${k}" d="${d}" fill="none" stroke="none"/>`).join('')
    );
  }

  /* Petits dessins : ceux qui bougent sur le modèle, et les pictogrammes du
     carnet, des besoins et des cartes sans image (sans méthode, retrait). */
  const spermShape = (x, y, a, op) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(0)})" opacity="${op == null ? 1 : op}">` +
    `<path d="M-4 0 q-5 -3.5 -10 0 t-10 0" fill="none" stroke="${C.sperm}" stroke-width="1.4" stroke-linecap="round"/>` +
    `<ellipse rx="4.6" ry="3.2" fill="${C.sperm}"/></g>`;
  const eggShape = (x, y, opts) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" opacity="${opts && opts.dim ? 0.45 : 1}">` +
    (opts && opts.met ? `<circle r="15" fill="none" stroke="#e9b200" stroke-width="3"/>` : '') +
    `<circle r="9" fill="${C.egg}" stroke="${C.eggLine}" stroke-width="1.6"/><circle r="3" fill="${C.eggLine}"/></g>`;
  const chlaShape = (x, y, op) => `<rect x="${(x - 5).toFixed(1)}" y="${(y - 2.2).toFixed(1)}" width="10" height="4.4" rx="2.2" fill="${C.chla}" opacity="${op == null ? 1 : op}"/>`;
  const hpvShape = (x, y, op) => {
    const pts = range(6).map(i => { const a = Math.PI / 3 * i; return `${(x + 5.2 * Math.cos(a)).toFixed(1)},${(y + 5.2 * Math.sin(a)).toFixed(1)}`; }).join(' ');
    return `<polygon points="${pts}" fill="${C.hpv}" opacity="${op == null ? 1 : op}"/>`;
  };
  const dropShape = (x, y, op) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6" fill="${C.hormone}" opacity="${op == null ? 1 : op}"/>`;

  const icon = (w, h, inner, cls) => `<svg class="${cls || 'jr-icon'}" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">${inner}</svg>`;
  const slash = (w, h) => `<path d="M${w * 0.15} ${h * 0.85} L${w * 0.85} ${h * 0.15}" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/>`;
  const PICTO = {
    egg: icon(32, 32, eggShape(16, 16)),
    sperm: icon(32, 32, spermShape(22, 16, 0)),
    meet: icon(40, 32, `${spermShape(24, 18, 15)}${eggShape(29, 13)}`),
    chla: icon(32, 32, `${chlaShape(10, 12)}${chlaShape(20, 18)}${chlaShape(12, 24)}`),
    hpv: icon(32, 32, `${hpvShape(10, 12)}${hpvShape(22, 14)}${hpvShape(15, 24)}`),
    hormone: icon(32, 32, `<path d="M16 5 C21 13 24 17 24 21 a8 8 0 0 1 -16 0 C8 17 11 13 16 5 Z" fill="${C.hormone}"/>`),
    none: icon(48, 48, `<circle cx="24" cy="24" r="15" fill="none" stroke="${C.line}" stroke-width="3"/><path d="M13 35 L35 13" stroke="${C.line}" stroke-width="3" stroke-linecap="round"/>`, 'jr-card-svg'),
    withdrawal: icon(48, 48, `<path d="M40 16 H18 a8 8 0 0 0 0 16 H40" fill="none" stroke="${C.line}" stroke-width="2.6"/>` +
      `<path d="M30 24 H6 M12 18 L6 24 L12 30" fill="none" stroke="${C.vaccine}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`, 'jr-card-svg'),
    stis: icon(32, 32, `${chlaShape(9, 10)}${chlaShape(19, 15)}${hpvShape(10, 23)}${hpvShape(23, 25)}`),
    shield: icon(28, 28, `<path d="M14 3 L24 7 V13 C24 19 19.5 23.5 14 25.5 C8.5 23.5 4 19 4 13 V7 Z" fill="#e1edfa" stroke="${C.vaccine}" stroke-width="2"/>` +
      `${chlaShape(14, 14)}`)
  };
  const NEED_PICTO = {
    noPregnancy: icon(40, 32, `${spermShape(24, 18, 15)}${eggShape(29, 13)}${slash(40, 32)}`),
    sti: icon(32, 32, `<path d="M16 3 L27 7 V14 C27 21 22 26 16 28.5 C10 26 5 21 5 14 V7 Z" fill="#e1edfa" stroke="${C.vaccine}" stroke-width="2"/>${chlaShape(12, 14)}${hpvShape(20, 19)}`),
    noHormones: icon(32, 32, `<path d="M16 5 C21 13 24 17 24 21 a8 8 0 0 1 -16 0 C8 17 11 13 16 5 Z" fill="${C.hormone}"/>${slash(32, 32)}`),
    nothingDaily: icon(32, 32, `<rect x="5" y="7" width="22" height="20" rx="3" fill="#ffffff" stroke="${C.line}" stroke-width="2"/><path d="M5 13 H27 M11 4 V9 M21 4 V9" stroke="${C.line}" stroke-width="2"/>${slash(32, 32)}`),
    hpv: icon(32, 32, `<path d="M16 3 L27 7 V14 C27 21 22 26 16 28.5 C10 26 5 21 5 14 V7 Z" fill="#efe8fb" stroke="${C.hpv}" stroke-width="2"/>${hpvShape(16, 16)}`)
  };

  // L'image d'une carte (planche Gemini, ou pictogramme pour « sans méthode » et le retrait).
  const cardPic = (m, cls) => (IMG[m]
    ? `<img class="${cls || 'jr-card-img'}" src="assets/lab-jr-${IMG[m]}.png" alt="" draggable="false">`
    : `<span class="${cls || 'jr-card-img'}">${PICTO[m]}</span>`);
  // La même image dans un dessin SVG (vignette posée sur le modèle).
  const svgPic = (m, x, y, s) => (IMG[m]
    ? `<image href="assets/lab-jr-${IMG[m]}.png" x="${(x - s / 2).toFixed(1)}" y="${(y - s / 2).toFixed(1)}" width="${s}" height="${s}"/>`
    : `<g transform="translate(${(x - s / 2).toFixed(1)} ${(y - s / 2).toFixed(1)}) scale(${(s / 48).toFixed(3)})">${PICTO[m].replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>`);

  // Les vignettes posées sur les zones : { méthode: zone }.
  function vignettesSVG(place, opts) {
    const o = opts || {};
    const count = {};
    return METHODS.filter(m => place[m]).map(m => {
      const z = place[m];
      const i = count[z] = (count[z] || 0) + 1;
      const [x, y] = SLOTS[z][(i - 1) % SLOTS[z].length];
      const s = B.V;
      const mark = o.marks && o.marks[m];
      return `<g class="jr-vig ${mark ? `is-${mark}` : ''}" ${o.holdable ? `data-vig="${m}" tabindex="0" role="button" aria-label="${escapeHtml(plain(methodName(m)))}"` : ''}>` +
        `<rect x="${(x - s / 2 - 3).toFixed(1)}" y="${(y - s / 2 - 3).toFixed(1)}" width="${s + 6}" height="${s + 6}" rx="9" class="jr-vig-bg"/>` +
        svgPic(m, x, y, s) + `</g>`;
    }).join('');
  }

  /* Le modèle complet. mode : 'edit' (zones cibles), 'run' (animations),
     'read' (rapport, correction). place : les vignettes à montrer. */
  function boardSVG(mode, place, opts) {
    return svgOpen(`jr-board is-${mode}`, mode === 'read' ? 'role="img"' : '') +
      anatomySVG() +
      `<g data-anim></g>` +
      `<g data-vigs>${vignettesSVG(place, opts)}</g>` +
      legendSVG() + `</svg>`;
  }

  // La légende de ce qui bouge, en bas du modèle.
  function legendSVG() {
    const L = LABELS.legend;
    const items = [
      [spermShape(14, 0, 0), L.sperm], [eggShape(6, 0), L.egg], [chlaShape(6, 0), L.chla],
      [hpvShape(6, 0), L.hpv], [dropShape(6, 0), L.hormone]
    ];
    let x = 18;
    const out = items.map(([shape, text]) => {
      const g = `<g transform="translate(${x} 404)">${shape}<text class="jr-legend-text" x="22" y="4">${escapeHtml(text)}</text></g>`;
      x += 30 + text.length * 6.2;
      return g;
    }).join('');
    return `<g class="jr-legend">${out}</g>`;
  }

  /* ===== Animation =====
     Le sort de chaque agent, d'après les méthodes posées (voir l'en-tête),
     puis sa place à l'instant t (0 → 1). Tout se calcule sur les chemins du
     modèle (getPointAtLength) : le dessin final est l'instant t = 1. */
  function fates(cards) {
    const has = m => cards.includes(m);
    const hormones = cards.some(m => HORMONES.includes(m));
    const sperm = range(6).map(i => {
      if (has('condom')) return 'tip';
      if (has('withdrawal') && i !== 0) return 'out';
      if (has('internal')) return 'vagina';
      if (has('iud')) return 'uterus';
      return 'end';
    });
    const chla = range(3).map(() => (has('condom') ? 'tip' : has('internal') ? 'vagina' : 'pass'));
    const hpv = range(3).map(j => {
      let f = (has('condom') || has('internal')) ? (j === 0 ? 'skin' : has('condom') ? 'tip' : 'vagina') : 'pass';
      if (has('vaccine') && (f === 'pass' || f === 'skin')) f = f === 'skin' ? 'skinFade' : 'fade';
      return f;
    });
    const egg = !hormones;
    return { sperm, chla, hpv, egg, hormones, vaccine: has('vaccine'), meet: egg && sperm.includes('end') };
  }

  function pathTools(svgEl) {
    const P = {};
    Object.keys(PATHS).forEach(k => {
      const el = svgEl.querySelector(`[data-path="${k}"]`);
      P[k] = { el, len: el ? el.getTotalLength() : 1 };
    });
    const at = (k, d) => {
      const p = P[k];
      if (!p.el) return { x: 0, y: 0, a: 0 };
      const dd = Math.max(0, Math.min(p.len, d));
      const a = p.el.getPointAtLength(dd), b = p.el.getPointAtLength(Math.min(p.len, dd + 1.5));
      const c = dd + 1.5 > p.len ? p.el.getPointAtLength(Math.max(0, dd - 1.5)) : a;
      const ang = dd + 1.5 > p.len ? Math.atan2(a.y - c.y, a.x - c.x) : Math.atan2(b.y - a.y, b.x - a.x);
      return { x: a.x, y: a.y, a: ang * 180 / Math.PI };
    };
    return { P, at };
  }

  const clamp01 = v => Math.max(0, Math.min(1, v));

  // Le dessin de tous les agents à l'instant t.
  function agentsAt(svgEl, cards, t) {
    const F = fates(cards);
    const { P, at } = pathTools(svgEl);
    const rnd = mulberry32(seedFrom(`${run.seed}:${cards.join('+')}`));
    const jit = range(20).map(() => [(rnd() - 0.5) * 10, (rnd() - 0.5) * 10]);
    let out = '';
    // Hormones (pilule, implant) : du cadre du corps aux ovaires, par le sang.
    if (F.hormones) {
      range(6).forEach(i => {
        const k = i % 2 ? 'vesselR' : 'vesselL';
        const p = clamp01((t - i * 0.02) / 0.3);
        const q = at(k, P[k].len * p);
        out += dropShape(q.x, q.y, p >= 1 ? 0.85 : 1);
      });
      if (t > 0.3) {
        out += `<ellipse cx="414" cy="140" rx="24" ry="17" fill="none" stroke="${C.hormone}" stroke-width="3" opacity=".8"/>` +
          `<ellipse cx="666" cy="140" rx="24" ry="17" fill="none" stroke="${C.hormone}" stroke-width="3" opacity=".8"/>`;
      }
    }
    // Le vaccin : le corps entier est protégé.
    if (F.vaccine) out += `<rect x="226" y="2" width="428" height="54" rx="17" fill="none" stroke="${C.vaccine}" stroke-width="3" opacity=".75"/>`;
    // L'ovocyte : il sort de l'ovaire, ou reste dedans (hormones).
    const met = F.meet && t >= 0.96;
    if (F.egg) {
      const p = clamp01((t - 0.2) / 0.5);
      const q = at('egg', P.egg.len * p);
      out += eggShape(q.x, q.y, { met });
    } else out += eggShape(666, 140, { dim: t > 0.3 });
    // Les spermatozoïdes : par le pénis, le contact, puis le vagin, l'utérus et la trompe.
    const Lm = P.male.len, Lc = P.contact.len, Lf = P.female.len;
    const stopAt = { tip: Lm, vagina: Lm + Lc + Lf * 0.1, uterus: Lm + Lc + Lf * 0.42, end: Lm + Lc + Lf };
    F.sperm.forEach((f, i) => {
      const p = clamp01((t - 0.06 - i * 0.03) / 0.78);
      let d = p * (Lm + Lc + Lf);
      let q;
      if (f === 'out' && d > Lm) {
        const po = Math.min(P.out.len, d - Lm);
        q = at('out', po);
      } else {
        if (stopAt[f] != null) d = Math.min(d, stopAt[f] - (f === 'end' ? i * 3 : i * 2.5));
        q = d <= Lm ? at('male', d) : d <= Lm + Lc ? at('contact', d - Lm) : at('female', d - Lm - Lc);
      }
      const [jx, jy] = d > 4 ? jit[i] : [0, 0];
      out += spermShape(q.x + jx * 0.6, q.y + jy * 0.6, q.a, f === 'out' && d > Lm + P.out.len * 0.6 ? 0.55 : 1);
    });
    // Les microbes : au contact, du pénis vers le vagin.
    const microbe = (kind, f, j) => {
      const p = clamp01((t - 0.28 - j * 0.04) / 0.6);
      const route = f === 'skin' || f === 'skinFade' ? 'skin' : 'contact';
      const Lr = P[route].len, Li = P.inside.len;
      let d = p * (Lr + Li);
      if (f === 'tip') d = Math.min(d, 4 + j * 3);
      if (f === 'vagina') d = Math.min(d, Lr);
      const q = d <= Lr ? at(route, d) : at('inside', d - Lr);
      const [jx, jy] = jit[8 + j + (kind === 'hpv' ? 4 : 0)];
      const fade = (f === 'fade' || f === 'skinFade') && p > 0.8 ? Math.max(0.15, 1 - (p - 0.8) * 4) : 1;
      return (kind === 'chla' ? chlaShape : hpvShape)(q.x + jx, q.y + jy, fade);
    };
    F.chla.forEach((f, j) => { out += microbe('chla', f, j); });
    F.hpv.forEach((f, j) => { out += microbe('hpv', f, j); });
    return out;
  }

  /* ===== Étapes complètes (progression stricte, voir lab-engine.js) ===== */
  const hypDone = () => METHODS.every(m => !!state.hyp.place[m]) && state.hyp.advice.length > 0;

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

  const chipHTML = (attrs, label, on, cls) => `<button type="button" class="lab-choice jr-chip ${cls || ''} ${on ? 'is-selected' : ''}" ${attrs} aria-pressed="${on}">${label}</button>`;

  // Une carte de méthode : l'image, le nom, comment on l'utilise.
  function cardHTML(m, attrs, cls) {
    const use = m === 'none' ? '' : `<span class="jr-card-use">${escapeHtml(LABELS.use[USE[m]])}</span>`;
    return `<button type="button" class="jr-card ${cls || ''}" ${attrs}>${cardPic(m)}<span class="jr-card-name">${escapeHtml(methodName(m))}</span>${use}</button>`;
  }

  // Le couple : silhouettes, prénoms, badges des besoins (avec, en partie 2, ✓ ou ✗).
  function coupleHTML(opts) {
    const o = opts || {};
    const person = (name, color) => `<span class="jr-person">${icon(28, 32, `<circle cx="14" cy="9" r="6.5" fill="${color}"/><path d="M3 31 C3 21 8 17 14 17 C20 17 25 21 25 31 Z" fill="${color}"/>`)}<b>${escapeHtml(name)}</b></span>`;
    const badges = run.needs.map(n => {
      const t = o.tryIdx != null ? state.tries[o.tryIdx] : null;
      const v = t ? t.badges[n] : null;
      const ticks = t ? `<span class="jr-badge-ticks">${['yes', 'no'].map(x => `<button type="button" class="lab-choice jr-tick ${v === x ? 'is-selected' : ''}" data-badge="${n}" data-val="${x}" aria-pressed="${v === x}" aria-label="${escapeHtml(plain(LABELS.badgeAria(LABELS.needs[n], LABELS.metNot[x])))}">${x === 'yes' ? '✓' : '✗'}</button>`).join('')}</span>` : '';
      const proof = o.proofs ? proofSlotHTML(n) : '';
      return `<li class="jr-badge" data-need="${n}">${NEED_PICTO[n]}<span class="jr-badge-text">${gloss(LABELS.needs[n])}</span>${ticks}${proof}</li>`;
    }).join('');
    return `<div class="jr-couple ${o.compact ? 'is-compact' : ''}"><div class="jr-couple-head">${person(girlName(), '#d4527a')}${person(boyName(), '#4f74b3')}` +
      `<span class="jr-couple-title">${gloss(LABELS.coupleNeeds)}</span></div><ul class="jr-badges">${badges}</ul></div>`;
  }

  /* ===== Étape 1 : hypothèse =====
     À gauche, les cartes et le modèle (Q1 : poser chaque carte là où elle
     agit) ; à droite, les questions et le couple (Q2 : le conseil, 1 ou 2
     cartes). */
  function renderPredict() {
    lab.release();
    held = null;
    holding(false);
    const show = lab.state.showMissing;
    const h = state.hyp;
    const tray = run.order.map(m => cardHTML(m, `data-card="${m}"`, h.place[m] ? 'is-placed' : '')).join('');
    const advice = run.order.map(m => `<button type="button" class="lab-choice jr-pick ${h.advice.includes(m) ? 'is-selected' : ''}" data-advice="${m}" aria-pressed="${h.advice.includes(m)}" title="${escapeHtml(methodName(m))}">${cardPic(m, 'jr-pick-img')}<span>${escapeHtml(methodName(m))}</span></button>`).join('');

    lab.body.innerHTML = `<div class="jr-predict">` +
      `<div class="jr-left">` +
        `<div class="jr-tray ${show && METHODS.some(m => !h.place[m]) ? 'lab-is-missing' : ''}" data-tray>${tray}</div>` +
        `<div class="jr-board-wrap" data-board>${boardSVG('edit', h.place, { holdable: true })}</div>` +
      `</div>` +
      `<div class="jr-right">` +
        `<div class="jr-q"><p class="jr-kicker">${LABELS.hypothesisTitle}</p>` +
          `<p class="jr-q-line"><span class="jr-q-num">1</span><span>${gloss(LABELS.q1)}</span></p>` +
          `<p class="jr-q-how">${gloss(LABELS.placeHow)}</p></div>` +
        `<div class="jr-q ${show && !h.advice.length ? 'lab-is-missing' : ''}">` +
          `<p class="jr-q-line"><span class="jr-q-num">2</span><span>${gloss(LABELS.q2(girlName(), boyName()))}</span></p>` +
          coupleHTML({ compact: true }) +
          `<p class="jr-q-how">${gloss(LABELS.adviceHow)}</p>` +
          `<div class="jr-picks">${advice}</div></div>` +
        `<label class="jr-because"><span>${LABELS.because}</span>` +
        `<input type="text" class="lab-input jr-because-input" maxlength="160" placeholder="${escapeHtml(LABELS.becausePlaceholder)}" value="${escapeHtml(h.because)}" autocomplete="off"></label>` +
      `</div></div>`;

    bindPlacing(h.place, renderPredict, !state.started);
    $$('[data-advice]').forEach(btn => btn.addEventListener('click', () => {
      toggleIn(h.advice, btn.dataset.advice, 2);
      if (lab.state.showMissing && hypDone()) lab.state.showMissing = false;
      renderPredict();
      lab.renderStepper();
      lab.save();
    }));
    const because = $('.jr-because-input');
    because.addEventListener('input', e => { h.because = e.target.value; });
    // Hypothèse figée dès le premier essai.
    if (state.started) {
      $$('[data-card], [data-vig], [data-advice]').forEach(el => lab.setLock(el, LABELS.lockHypothesisFixed, { icon: false }));
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

  // Ajouter ou retirer une méthode d'une liste (au plus max : la plus ancienne part).
  function toggleIn(list, m, max) {
    const k = list.indexOf(m);
    if (k >= 0) list.splice(k, 1);
    else {
      list.push(m);
      while (list.length > max) list.shift();
    }
  }

  /* Poser les cartes sur le modèle (Predict, Conclude) : une carte de la
     réserve ou une vignette déjà posée se prend en main (ou se glisse), puis
     se pose sur une zone ; posée sur la réserve, elle revient. */
  function bindPlacing(place, redraw, editable) {
    if (!editable) return;
    // Jamais la place d'où vient l'objet (le clic qui le prend l'y reposerait).
    const targetsFor = el => () => $$('[data-board] [data-zone]').concat($$('[data-tray]')).filter(t => !t.contains(el));
    const drop = m => target => {
      if (target.hasAttribute('data-tray')) place[m] = null;
      else place[m] = target.dataset.zone;
      redraw();
      lab.renderStepper();
      lab.save();
    };
    $$('[data-card]').forEach(el => {
      const m = el.dataset.card;
      lab.makeDraggable(el, {
        hold: true,
        ghost: () => `<div class="jr-ghost">${cardPic(m)}</div>`,
        targets: targetsFor(el),
        onHold: on => { held = on ? m : null; markHeld(); },
        onDrop: drop(m)
      });
    });
    $$('[data-vig]').forEach(el => {
      const m = el.dataset.vig;
      lab.makeDraggable(el, {
        hold: true,
        ghost: () => `<div class="jr-ghost">${cardPic(m)}</div>`,
        targets: targetsFor(el),
        onHold: on => { held = on ? m : null; markHeld(); },
        onDrop: drop(m)
      });
    });
  }

  // La carte en main et sa vignette sont marquées ensemble.
  function markHeld() {
    $$('[data-card], [data-vig]').forEach(el => el.classList.toggle('is-held-pair', !!held && (el.dataset.card === held || el.dataset.vig === held)));
    holding(!!held);
  }

  /* Une carte en main : les autres cartes déjà posées (vignettes du modèle,
     cartes rangées dans un cadre) laissent passer le toucher vers la zone ou
     le cadre où elles sont, sinon le toucher les prendrait en main au lieu
     d'y poser la première. */
  function holding(on) {
    lab.body.classList.toggle('jr-holding', on);
  }

  /* ===== Étape 2 : l'expérience =====
     À gauche, les cartes, le modèle et la légende (avec « Run ») ; à droite,
     le carnet (et le couple en partie 2). */
  function experimentCards() {
    if (state.part === 1) return ['none'].concat(run.order);
    return run.order;
  }

  // Les méthodes posées sur le modèle pour la ligne montrée.
  const shownCards = () => (state.part === 2 ? (lastTry() ? lastTry().cards : []) : state.current && state.current !== 'none' ? [state.current] : []);
  const shownKey = () => (state.part === 2 ? `try${state.tries.length - 1}` : state.current);

  function renderExperiment(caption, warn) {
    lab.release();
    const cards = shownCards();
    const usePlace = {};
    cards.forEach(m => { usePlace[m] = USE_ZONE[m]; });
    const sel = state.part === 1 ? state.current : null;
    const tray = experimentCards().map(m => {
      const on = state.part === 1 ? sel === m : cards.includes(m);
      const done = state.part === 1 && rowDone(m);
      return cardHTML(m, `data-test="${m}" aria-pressed="${on}"`, `${on ? 'is-on' : ''} ${done ? 'is-done' : ''}`);
    }).join('');
    const key = shownKey();
    const ran = key && noteOf(key) && noteOf(key).ran;
    const runLabel = ran ? LABELS.runAgain : LABELS.run;

    lab.body.innerHTML = `<div class="jr-run">` +
      `<div class="jr-left">` +
        `<div class="jr-tray is-test">${tray}</div>` +
        `<div class="jr-board-wrap" data-board>${boardSVG('run', usePlace)}</div>` +
        `<div class="jr-runbar"><p class="lab-caption" data-caption aria-live="polite"></p>` +
          `<button type="button" class="lab-btn jr-run-btn" data-run>${runLabel}</button></div>` +
      `</div>` +
      `<div class="jr-right">` +
        (state.part === 2 ? `<section class="jr-panel jr-try-panel"><h3 class="lab-panel-title">${LABELS.part2Title(girlName(), boyName())}</h3>${coupleHTML({ tryIdx: state.tries.length - 1 })}` +
          (state.tries.length < MAX_TRIES && tryDone(lastTry()) ? `<button type="button" class="lab-btn jr-another" data-another>${LABELS.another}</button>` : '') + `</section>` : '') +
        notesHTML() +
      `</div></div>`;

    // Après un essai, le modèle montre ce qu'il a donné (l'instant final).
    if (ran) drawFinal(cards);
    bindRun();
    renderRunFooter();
    updateLocks();
    setCaption(caption || defaultCaption(), warn);
  }

  function drawFinal(cards) {
    const svgEl = $('[data-board] svg');
    const g = svgEl && svgEl.querySelector('[data-anim]');
    if (g) g.innerHTML = agentsAt(svgEl, cards, 1);
  }

  // Le carnet : une ligne par essai ; où ça agit, puis quatre cases à pictogrammes.
  function notesHTML(opts) {
    const o = opts || {};
    const keys = ROWS.concat(state.tries.map((t, i) => `try${i}`));
    const head = `<tr><th scope="col" class="jr-th-method">${LABELS.notes.method}</th><th scope="col" class="jr-th-where">${gloss(LABELS.notes.where)}</th>` +
      COLS.map(c => `<th scope="col" class="jr-th-col ${o.proofCol === c ? 'is-proof-col' : ''}" title="${escapeHtml(plain(LABELS.notes.cols[c]))}">${PICTO[c]}<span>${gloss(LABELS.notes.colsShort[c])}</span></th>`).join('') + `</tr>`;
    const rows = keys.map(key => {
      const n = noteOf(key);
      const name = isTry(key)
        ? `<span class="jr-row-pics">${n.cards.map(m => cardPic(m, 'jr-row-img')).join('')}</span><span class="jr-row-name">${escapeHtml(LABELS.tryName(tryIndex(key) + 1))}</span>`
        : `<span class="jr-row-pics">${cardPic(key, 'jr-row-img')}</span><span class="jr-row-name" title="${escapeHtml(methodName(key))}">${escapeHtml(methodName(key))}</span>`;
      const where = key === 'none' || isTry(key) ? `<td class="jr-where is-na">${DASH}</td>`
        : `<td class="jr-where"><button type="button" class="jr-where-btn lab-todo-field ${n.where ? '' : 'is-empty'}" data-where="${key}">${n.where ? escapeHtml(LABELS.zones[n.where]) : ''}</button></td>`;
      const cells = COLS.map(c => {
        const v = n[c];
        const proofOn = o.proofs && Object.values(o.proofs).includes(`${key}:${c}`);
        return `<td><button type="button" class="jr-cell ${v ? `is-${v}` : ''} ${proofOn ? 'is-proof' : ''} ${o.proofCol === c ? 'is-proof-col' : ''}" data-cell="${key}:${c}" aria-label="${escapeHtml(plain(LABELS.cellAria(isTry(key) ? LABELS.tryName(tryIndex(key) + 1) : methodName(key), LABELS.notes.cols[c], v ? LABELS.marks[v] : LABELS.empty)))}">${markGlyph(v)}</button></td>`;
      }).join('');
      return `<tr data-row="${key}" class="${state.current === key || shownKey() === key ? 'is-current' : ''} ${isTry(key) ? 'is-try' : ''}"><th scope="row">${name}</th>${where}${cells}</tr>`;
    }).join('');
    return `<section class="jr-panel jr-notes"><h3 class="lab-panel-title">${LABELS.notesTitle}</h3>` +
      `<table class="jr-table"><thead>${head}</thead><tbody>${rows}</tbody></table>` +
      `<p class="jr-key">${gloss(LABELS.marksKey)}</p></section>`;
  }

  const markGlyph = v => (v === 'yes' ? '✓' : v === 'no' ? '✗' : v === 'partly' ? '◐' : '');

  function bindRun() {
    $$('[data-test]').forEach(btn => btn.addEventListener('click', () => pickCard(btn.dataset.test)));
    const runBtn = $('[data-run]');
    if (runBtn) runBtn.addEventListener('click', () => { if (!busy) startRun(); });
    $$('[data-cell]').forEach(btn => btn.addEventListener('click', () => {
      const [key, c] = btn.dataset.cell.split(':');
      const n = noteOf(key);
      const next = MARKS[(MARKS.indexOf(n[c]) + 1) % MARKS.length];
      n[c] = n[c] == null ? 'yes' : next;
      state.current = state.part === 1 ? key : state.current;
      lab.save();
      renderExperiment();
      lab.renderStepper();
    }));
    $$('[data-where]').forEach(btn => btn.addEventListener('click', () => {
      state.current = btn.dataset.where;
      renderExperiment(LABELS.captions.whereTap(methodName(state.current)));
    }));
    $$('[data-board] [data-zone]').forEach(z => z.addEventListener('click', () => noteWhere(z.dataset.zone)));
    $$('[data-badge]').forEach(btn => btn.addEventListener('click', () => {
      const t = lastTry();
      t.badges[btn.dataset.badge] = btn.dataset.val;
      lab.save();
      renderExperiment();
      lab.renderStepper();
    }));
    const another = $('[data-another]');
    if (another) another.addEventListener('click', () => {
      if (state.tries.length >= MAX_TRIES) return;
      state.tries.push(freshTry([]));
      lab.save();
      renderExperiment();
      lab.renderStepper();
    });
  }

  // Partie 1 : la carte choisie est montrée sur le modèle ; partie 2 : elle entre dans l'essai (2 au plus).
  function pickCard(m) {
    if (busy) return;
    if (state.part === 1) {
      state.current = m;
      renderExperiment();
      return;
    }
    const t = lastTry();
    if (t.ran) return;
    toggleIn(t.cards, m, 2);
    lab.save();
    renderExperiment();
  }

  // Où la méthode a agi : la zone touchée s'inscrit dans la ligne montrée.
  function noteWhere(zone) {
    if (busy || state.part !== 1) return;
    const key = state.current;
    if (!key || key === 'none' || !state.notes[key].ran) { setCaption(LABELS.captionWhereFirst, true); return; }
    state.notes[key].where = zone;
    lab.save();
    renderExperiment();
    lab.renderStepper();
  }

  // Lancer l'essai : l'animation joue, puis le modèle garde l'instant final.
  function startRun() {
    const key = shownKey();
    if (!key) return;
    const cards = shownCards();
    const n = noteOf(key);
    state.started = true;
    n.ran = true;
    lab.save();
    renderExperiment(LABELS.captionRunning);
    const svgEl = $('[data-board] svg');
    const g = svgEl.querySelector('[data-anim]');
    g.innerHTML = '';
    busy = true;
    const runEl = $('.jr-run');
    if (runEl) runEl.classList.add('is-busy');
    $$('.lab-footer button').forEach(el => { el.disabled = true; });
    const token = lab.newScene();
    lab.tween(token, 4200, k => { g.innerHTML = agentsAt(svgEl, cards, k); }, LabEngine.util.ease.linear).then(ok => {
      busy = false;
      if (!ok) return;
      renderExperiment();
      lab.renderStepper();
    });
  }

  /* Les verrous de l'expérience (à rappeler après chaque changement) :
     chaque geste attend le précédent, et dit lequel. */
  function updateLocks() {
    const p = phase();
    // Partie 1 : le témoin d'abord ; une autre méthode attend que la ligne montrée soit remplie.
    $$('[data-test]').forEach(btn => {
      const m = btn.dataset.test;
      let why = null;
      if (state.part === 1) {
        const cur = state.current;
        if (m !== 'none' && !state.notes.none.ran) why = LABELS.lockFirstNone;
        else if (cur && cur !== m && state.notes[cur].ran && !rowDone(cur)) why = LABELS.lockFinishRow(methodName(cur));
      } else if (lastTry().ran) why = LABELS.lockTryRan;
      lab.setLock(btn, why, { icon: false });
    });
    const runBtn = $('[data-run]');
    if (runBtn) {
      const key = shownKey();
      let why = null;
      if (!key) why = LABELS.lockRunPick;
      else if (state.part === 2 && !lastTry().cards.length) why = LABELS.lockRunChoose;
      else if (state.part === 2 && lastTry().ran) why = LABELS.lockTryRan;
      lab.setLock(runBtn, why);
      runBtn.classList.toggle('lab-btn-primary', !why && p.kind === 'run');
    }
    $$('[data-cell]').forEach(btn => {
      const [key] = btn.dataset.cell.split(':');
      lab.setLock(btn, noteOf(key).ran ? null : LABELS.lockCellRun, { icon: false });
    });
    $$('[data-where]').forEach(btn => lab.setLock(btn, state.notes[btn.dataset.where].ran ? null : LABELS.lockCellRun, { icon: false }));
    $$('[data-badge]').forEach(btn => lab.setLock(btn, lastTry() && lastTry().ran ? null : LABELS.lockBadgesRun, { icon: false }));
  }

  function todoEls() {
    if (busy) return [];
    const p = phase();
    switch (p.kind) {
      case 'run': return [$('[data-run]')];
      case 'where': return [$(`[data-where="${p.key}"]`)];
      case 'cells': return COLS.filter(c => !noteOf(p.key)[c]).slice(0, 1).map(c => $(`[data-cell="${p.key}:${c}"]`));
      case 'pick': return p.first ? [$('[data-test="none"]')] : [];
      case 'badges': return run.needs.filter(n => !lastTry().badges[n]).slice(0, 1).map(n => $(`[data-need="${n}"] .jr-badge-ticks`));
      case 'next': return [$('[data-next-part]')];
      default: return [];
    }
  }

  function defaultCaption() {
    const p = phase();
    const K = LABELS.captions;
    if (p.kind === 'run') return state.part === 1 ? K.run(methodName(p.key)) : K.runTry;
    if (p.kind === 'where') return K.where(methodName(p.key));
    if (p.kind === 'cells') return K.cells;
    if (p.kind === 'pick') return p.first ? K.first : K.pick;
    if (p.kind === 'choose') return K.choose;
    if (p.kind === 'badges') return K.badges;
    return K.next[p.to];
  }

  function setCaption(text, warn) {
    const c = $('[data-caption]');
    if (!c) return;
    c.innerHTML = `<span>${gloss(text)}</span>`;
    c.classList.toggle('is-warning', !!warn);
  }

  /* Pied de page : le gros bouton mène à la partie 2, puis à la conclusion ;
     il s'allume quand la partie est finie, et touché trop tôt, il dit ce qui
     manque. */
  let stepperDone = null;

  const nextTarget = () => (state.part === 1 ? 'part2' : 'conclude');
  const targetReady = t => (t === 'part2' ? part1Done() : benchDone());

  function renderRunFooter() {
    lab.setFooter(lab.footerInfo('') + `<div class="lab-footer-actions">` +
      `<button type="button" class="lab-btn lab-btn-ghost" data-next-part></button></div>`);
    $('[data-next-part]').addEventListener('click', () => {
      const t = nextTarget();
      if (t === 'conclude') { lab.goToStep(3); return; }
      state.part = 2;
      if (!state.tries.length) state.tries.push(freshTry(state.hyp.advice));
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

  /* ===== Étape 3 : conclusion =====
     Deux onglets. Q1 : le dessin de Predict à corriger, puis les cartes à
     ranger (pas d'ovocyte / pas de rencontre / n'empêche pas une
     grossesse) et celles qui arrêtent aussi une IST ; le carnet s'ouvre par
     un bouton. Q2 : le carnet à gauche ; le conseil, pour chaque besoin la
     case qui le prouve, qui est responsable ; les jugements. */
  const proofNeeds = () => run.needs.filter(n => PROOF_COL[n]);
  const q1Done = () => METHODS.every(m => state.concl.place[m] && state.concl.way[m]) && !!state.concl.vPlace;
  const q2Done = () => state.concl.advice.length > 0 && proofNeeds().every(n => !!state.concl.proofs[n]) && !!state.concl.who && !!state.concl.vAdvice;
  const conclusionsComplete = () => q1Done() && q2Done();

  function initConclude() {
    const c = state.concl;
    if (!c.placeCopied) { METHODS.forEach(m => { c.place[m] = state.hyp.place[m]; }); c.placeCopied = true; }
    if (!c.adviceCopied) { c.advice = lastActiveTry() ? lastActiveTry().cards.slice() : state.hyp.advice.slice(); c.adviceCopied = true; }
  }

  function renderConclude() {
    lab.release();
    held = null;
    holding(false);
    initConclude();
    const c = state.concl;
    const show = lab.state.showMissing;
    const tabs = `<div class="jr-tabs" role="tablist">` + [1, 2].map(k =>
      `<button type="button" role="tab" class="jr-tab ${state.cTab === k ? 'is-on' : ''} ${show && !(k === 1 ? q1Done() : q2Done()) ? 'is-missing' : ''}" data-ctab="${k}" data-lab-look aria-selected="${state.cTab === k}">${LABELS.cTabs[k]}</button>`).join('') + `</div>`;
    let body;
    if (state.cTab === 1) {
      const pile = METHODS.filter(m => !c.way[m]);
      const mini = m => `<button type="button" class="jr-mini" data-way-card="${m}">${cardPic(m, 'jr-mini-img')}<span>${escapeHtml(methodName(m))}</span></button>`;
      const frame = w => `<div class="jr-frame jr-frame-${w}" data-way="${w}"><p class="jr-frame-title">${gloss(LABELS.ways[w])}</p>` +
        `<div class="jr-frame-cards">${METHODS.filter(m => c.way[m] === w).map(mini).join('')}</div></div>`;
      const shields = METHODS.map(m => `<button type="button" class="lab-choice jr-pick ${c.shield[m] ? 'is-selected' : ''}" data-shield="${m}" aria-pressed="${!!c.shield[m]}" title="${escapeHtml(methodName(m))}">${cardPic(m, 'jr-pick-img')}<span>${escapeHtml(methodName(m))}</span></button>`).join('');
      body = `<div class="jr-c1">` +
        `<div class="jr-left"><p class="jr-c-how"><span>${gloss(LABELS.c1PlaceHow)}</span></p>` +
          `<div class="jr-board-wrap ${show && METHODS.some(m => !c.place[m]) ? 'lab-is-missing' : ''}" data-board>${boardSVG('edit', c.place, { holdable: true })}</div>` +
        `</div>` +
        `<div class="jr-right">` +
          `<p class="jr-c-how"><span>${gloss(LABELS.c1WayHow)}</span></p>` +
          `<div class="jr-pile ${show && pile.length ? 'lab-is-missing' : ''}" data-way="pile">${pile.map(mini).join('') || `<span class="jr-empty">${LABELS.pileEmpty}</span>`}</div>` +
          `<div class="jr-frames">${WAYS.map(frame).join('')}</div>` +
          `<p class="jr-c-how">${PICTO.shield}<span>${gloss(LABELS.c1ShieldHow)}</span></p>` +
          `<div class="jr-picks">${shields}</div>` +
          verdictHTML('vPlace', LABELS.verdictPlace) +
        `</div></div>`;
    } else {
      const advice = run.order.map(m => `<button type="button" class="lab-choice jr-pick ${c.advice.includes(m) ? 'is-selected' : ''}" data-cadvice="${m}" aria-pressed="${c.advice.includes(m)}" title="${escapeHtml(methodName(m))}">${cardPic(m, 'jr-pick-img')}<span>${escapeHtml(methodName(m))}</span></button>`).join('');
      const proofCol = state.proofFor ? PROOF_COL[state.proofFor] : null;
      body = `<div class="jr-c2">` +
        `<div class="jr-left">${notesHTML({ proofs: c.proofs, proofCol })}</div>` +
        `<div class="jr-right">` +
          `<div class="jr-q ${show && !c.advice.length ? 'lab-is-missing' : ''}"><p class="jr-q-line"><span>${gloss(LABELS.cAdvice(girlName(), boyName()))}</span></p><div class="jr-picks">${advice}</div></div>` +
          `<div class="jr-q"><p class="jr-q-line"><span>${gloss(LABELS.cProofs)}</span></p>${coupleHTML({ proofs: true, compact: true })}</div>` +
          `<div class="jr-q ${show && !c.who ? 'lab-is-missing' : ''}"><p class="jr-q-line"><span>${gloss(LABELS.whoQ)}</span></p><div class="jr-chips">` +
            WHO.map(w => chipHTML(`data-who="${w}"`, escapeHtml(w === 'girl' ? girlName() : w === 'boy' ? boyName() : LABELS.both), c.who === w)).join('') + `</div></div>` +
          verdictHTML('vAdvice', LABELS.verdictAdvice) +
        `</div></div>`;
    }
    lab.body.innerHTML = `<div class="jr-conclude">${tabs}${body}</div>`;
    bindConclude();

    lab.setFooter(`<button type="button" class="lab-btn lab-btn-ghost" data-back>← ${LABELS.backToLab}</button>` +
      `<button type="button" class="lab-btn lab-btn-ghost" data-notes data-lab-look>${LABELS.openNotes}</button>` +
      lab.footerInfo('') +
      `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-check>${LABELS.checkConclusions}</button></div>`);
    $('[data-back]').addEventListener('click', () => lab.goToStep(2));
    $('[data-notes]').addEventListener('click', () => lab.openSheet(`<h3 class="lab-sheet-title">${LABELS.notesTitle}</h3><div class="jr-sheet-notes">${notesHTML()}</div>`, LABELS.notesTitle));
    $('[data-check]').addEventListener('click', () => lab.finish());
    updateConcludeFooter();
  }

  function verdictHTML(key, text) {
    const c = state.concl;
    return `<div class="jr-verdict ${lab.state.showMissing && !c[key] ? 'lab-is-missing' : ''}"><span class="jr-verdict-text">${text}</span>` +
      VERDICTS.map(x => chipHTML(`data-verdict="${key}" data-val="${x}"`, LABELS.verdicts[x], c[key] === x)).join('') + `</div>`;
  }

  function proofSlotHTML(need) {
    if (!PROOF_COL[need]) return `<span class="jr-proof is-na">${gloss(LABELS.noProof)}</span>`;
    const ref = state.concl.proofs[need];
    const on = state.proofFor === need;
    const text = ref ? proofText(ref) : LABELS.proofTap;
    return `<button type="button" class="jr-proof lab-todo-field ${ref ? 'is-filled' : ''} ${on ? 'is-on' : ''} ${lab.state.showMissing && !ref ? 'lab-is-missing' : ''}" data-proof-for="${need}">${escapeHtml(plain(text))}</button>`;
  }

  // Une case du carnet, dite en mots : « Condom · meeting ✗ ».
  function proofText(ref) {
    const [key, c] = ref.split(':');
    const n = noteOf(key);
    const name = isTry(key) ? LABELS.tryName(tryIndex(key) + 1) : methodName(key);
    return LABELS.proofCell(name, LABELS.notes.colsShort[c], markGlyph(n && n[c]) || DASH);
  }

  function bindConclude() {
    const c = state.concl;
    const after = () => {
      if (lab.state.showMissing && conclusionsComplete()) lab.state.showMissing = false;
      renderConclude();
      lab.renderStepper();
      lab.save();
    };
    $$('[data-ctab]').forEach(btn => btn.addEventListener('click', () => {
      state.cTab = Number(btn.dataset.ctab);
      state.proofFor = null;
      renderConclude();
    }));
    bindPlacing(c.place, renderConclude, true);
    // Ranger les cartes dans les cadres (ou les remettre dans la pile).
    $$('[data-way-card]').forEach(el => {
      const m = el.dataset.wayCard;
      lab.makeDraggable(el, {
        hold: true,
        ghost: () => `<div class="jr-ghost">${cardPic(m)}</div>`,
        targets: () => $$('[data-way]').filter(t => !t.contains(el)),
        onHold: holding,
        onDrop: target => { c.way[m] = target.dataset.way === 'pile' ? null : target.dataset.way; after(); }
      });
    });
    $$('[data-shield]').forEach(btn => btn.addEventListener('click', () => { c.shield[btn.dataset.shield] = !c.shield[btn.dataset.shield]; after(); }));
    $$('[data-verdict]').forEach(btn => btn.addEventListener('click', () => { c[btn.dataset.verdict] = btn.dataset.val; after(); }));
    $$('[data-cadvice]').forEach(btn => btn.addEventListener('click', () => { toggleIn(c.advice, btn.dataset.cadvice, 2); after(); }));
    $$('[data-who]').forEach(btn => btn.addEventListener('click', () => { c.who = btn.dataset.who; after(); }));
    // La preuve : toucher la case du besoin, puis une case du carnet.
    $$('[data-proof-for]').forEach(btn => btn.addEventListener('click', () => {
      state.proofFor = state.proofFor === btn.dataset.proofFor ? null : btn.dataset.proofFor;
      renderConclude();
    }));
    $$('.jr-c2 [data-cell]').forEach(btn => btn.addEventListener('click', () => {
      if (!state.proofFor) { flashCaption(); return; }
      c.proofs[state.proofFor] = btn.dataset.cell;
      state.proofFor = null;
      after();
    }));
  }

  // Une case du carnet touchée sans besoin choisi : la case du besoin se secoue.
  function flashCaption() {
    const slot = $('[data-proof-for]');
    if (!slot) return;
    slot.classList.remove('lab-shake');
    void slot.offsetWidth;
    slot.classList.add('lab-shake');
  }

  let conclReady = null;

  function updateConcludeFooter() {
    const ready = conclusionsComplete();
    const warn = lab.state.showMissing && !ready;
    const info = $('.lab-footer .lab-footer-info');
    if (info && !info.hasAttribute('data-lab-frozen')) {
      info.textContent = warn ? lab.L.missingConclusions : (state.cTab === 1 && q1Done() && !q2Done() ? LABELS.toQ2 : '');
      info.classList.toggle('is-warning', warn);
    }
    lab.setLock($('[data-check]'), ready ? null : lab.L.missingConclusions, { missing: true, key: 'check' });
    if (ready !== conclReady) { conclReady = ready; lab.renderStepper(); }
  }

  /* ===== Étape 4 : correction =====
     Carnet : chaque case comparée au modèle (où, et les quatre cases ; pour
     les essais du couple, aussi chaque besoin). Où : le dessin corrigé
     comparé aux zones du modèle. Ce qui est arrêté : les cadres et les
     boucliers. Conseil : le conseil final répond-il à tous les besoins, et
     chaque preuve est-elle une case ✗ juste, d'une ligne du conseil.
     Partenaires : « both », et les jugements comparés à l'hypothèse. */
  function proofOk(need, ref, advice) {
    if (!ref) return false;
    const [key, col] = ref.split(':');
    if (col !== PROOF_COL[need]) return false;
    const n = noteOf(key);
    if (!n || !n.ran) return false;
    const cards = rowCards(key);
    const inAdvice = isTry(key)
      ? cards.length === advice.length && cards.every(m => advice.includes(m))
      : advice.includes(key);
    return inAdvice && n[col] === 'no' && truthOf(key)[col] === 'no';
  }

  function evaluate() {
    const c = state.concl;
    const keys = ROWS.concat(tryKeys());
    const rows = {};
    let good = 0, total = 0;
    keys.forEach(key => {
      const n = noteOf(key);
      const truth = truthOf(key);
      const r = { cols: {}, where: null, badges: {} };
      COLS.forEach(col => { r.cols[col] = n[col] === truth[col]; total++; if (r.cols[col]) good++; });
      if (!isTry(key) && key !== 'none') { r.where = n.where === ACT_ZONE[key]; total++; if (r.where) good++; }
      if (isTry(key)) {
        run.needs.forEach(need => {
          r.badges[need] = n.badges[need] === (needMet(need, n.cards) ? 'yes' : 'no');
          total++; if (r.badges[need]) good++;
        });
      }
      rows[key] = r;
    });
    const placeOk = methodMap(null);
    METHODS.forEach(m => { placeOk[m] = c.place[m] === ACT_ZONE[m]; });
    const wayOk = methodMap(null), shieldOk = methodMap(null);
    METHODS.forEach(m => { wayOk[m] = c.way[m] === WAY[m]; shieldOk[m] = !!c.shield[m] === SHIELD[m]; });
    const needsOk = {};
    run.needs.forEach(n => { needsOk[n] = c.advice.length > 0 && needMet(n, c.advice); });
    const proofsOk = {};
    proofNeeds().forEach(n => { proofsOk[n] = proofOk(n, c.proofs[n], c.advice); });
    const same = METHODS.filter(m => state.hyp.place[m] && state.hyp.place[m] === c.place[m]).length;
    const shouldPlace = same === METHODS.length ? 'confirmed' : same === 0 ? 'rejected' : 'partly';
    const t0 = state.tries[0];
    const yes = t0 ? run.needs.filter(n => t0.badges[n] === 'yes').length : 0;
    const shouldAdvice = yes === run.needs.length ? 'confirmed' : yes === 0 ? 'rejected' : 'partly';
    return {
      rows, good, total, placeOk, wayOk, shieldOk, needsOk, proofsOk, same, shouldPlace, shouldAdvice,
      crit: {
        notes: good === total && keys.every(k => noteOf(k).ran),
        where: METHODS.every(m => placeOk[m]),
        stops: METHODS.every(m => wayOk[m] && shieldOk[m]),
        advice: run.needs.every(n => needsOk[n]) && proofNeeds().every(n => proofsOk[n]),
        partners: c.who === 'both' && c.vPlace === shouldPlace && c.vAdvice === shouldAdvice
      }
    };
  }

  const line = (good, html) => `<li class="${good ? 'is-ok' : 'is-ko'}"><span class="jr-mark">${good ? '✓' : '✗'}</span><span>${html}</span></li>`;

  function criterionDetail(key, ev) {
    const c = state.concl;
    if (key === 'notes') {
      if (!state.started) return `<p>${CHECK.noExperiment}</p>`;
      const keys = ROWS.concat(tryKeys());
      const head = `<tr><th></th><th>${gloss(LABELS.notes.where)}</th>${COLS.map(col => `<th>${PICTO[col]}</th>`).join('')}</tr>`;
      const rows = keys.map(k => {
        const n = noteOf(k), r = ev.rows[k], truth = truthOf(k);
        const name = isTry(k) ? LABELS.tryName(tryIndex(k) + 1) : methodName(k);
        const where = r.where == null ? `<td>${DASH}</td>` : r.where ? `<td class="is-ok">${escapeHtml(n.where ? LABELS.zones[n.where] : DASH)}</td>`
          : `<td class="is-ko"><span>${escapeHtml(n.where ? LABELS.zones[n.where] : DASH)}</span><small>${escapeHtml(LABELS.zones[ACT_ZONE[k]])}</small></td>`;
        const cells = COLS.map(col => (r.cols[col] ? `<td class="is-ok">${markGlyph(n[col])}</td>` : `<td class="is-ko"><span>${markGlyph(n[col]) || DASH}</span><small>${markGlyph(truth[col])}</small></td>`)).join('');
        return `<tr><th scope="row">${escapeHtml(name)}</th>${where}${cells}</tr>`;
      }).join('');
      const badgeLines = state.tries.map((t, i) => (!activeTry(t) ? '' : run.needs.map(need => line(ev.rows[`try${i}`].badges[need],
        gloss(CHECK.badgeLine(LABELS.tryName(i + 1), LABELS.needs[need], LABELS.metNot[needMet(need, t.cards) ? 'yes' : 'no'])))).join(''))).join('');
      return `<p>${CHECK.notesScore(ev.good, ev.total)}</p>` +
        `<table class="jr-check-table"><thead>${head}</thead><tbody>${rows}</tbody></table>` +
        `<ul class="jr-checklist">${badgeLines}</ul>` +
        `<p class="jr-muted">${gloss(CHECK.notesKey)}</p>`;
    }
    if (key === 'where') {
      const marks = {};
      METHODS.forEach(m => { marks[m] = ev.placeOk[m] ? 'ok' : 'ko'; });
      return `<div class="jr-check-board">${boardSVG('read', c.place, { marks })}</div>` +
        `<ul class="jr-checklist">${METHODS.filter(m => !ev.placeOk[m]).map(m => line(false, gloss(CHECK.placeLine(methodName(m), c.place[m] ? LABELS.zones[c.place[m]] : DASH, LABELS.zones[ACT_ZONE[m]])))).join('') ||
          line(true, CHECK.placeAllGood)}</ul>` +
        `<p>${gloss(EXPLAIN.where)}</p>`;
    }
    if (key === 'stops') {
      return `<ul class="jr-checklist">${METHODS.map(m => line(ev.wayOk[m] && ev.shieldOk[m],
        gloss(CHECK.stopLine(methodName(m), LABELS.ways[WAY[m]], SHIELD[m])) + (ev.wayOk[m] && ev.shieldOk[m] ? '' : ` <span class="jr-ko">${gloss(CHECK.youSaid(c.way[m] ? LABELS.ways[c.way[m]] : DASH, !!c.shield[m]))}</span>`) +
        `<br><span class="jr-muted">${gloss(EXPLAIN.methods[m])}</span>`)).join('')}</ul>`;
    }
    if (key === 'advice') {
      const pics = c.advice.map(m => cardPic(m, 'jr-row-img')).join('');
      return `<p class="jr-advice-line">${gloss(CHECK.yourAdvice)} <span class="jr-row-pics">${pics}</span> ${escapeHtml(LABELS.list(c.advice.map(methodName)))}</p>` +
        `<ul class="jr-checklist">${run.needs.map(n => line(ev.needsOk[n], gloss(CHECK.needLine(LABELS.needs[n], ev.needsOk[n])) +
          (PROOF_COL[n] ? `<br><span class="${ev.proofsOk[n] ? 'jr-muted' : 'jr-ko'}">${gloss(CHECK.proofLine(c.proofs[n] ? plain(proofText(c.proofs[n])) : DASH, ev.proofsOk[n]))}</span>` : ''))).join('')}</ul>` +
        `<p>${gloss(EXPLAIN.advice)}</p>`;
    }
    return `<ul class="jr-checklist">` +
      line(c.who === 'both', gloss(CHECK.whoLine(c.who === 'girl' ? girlName() : c.who === 'boy' ? boyName() : c.who ? LABELS.both : DASH))) +
      line(c.vPlace === ev.shouldPlace, gloss(CHECK.verdictPlace(ev.same, METHODS.length, LABELS.verdicts[ev.shouldPlace]))) +
      line(c.vAdvice === ev.shouldAdvice, gloss(CHECK.verdictAdvice(LABELS.verdicts[ev.shouldAdvice]))) +
      `</ul><p>${gloss(EXPLAIN.partners)}</p><p>${gloss(EXPLAIN.dual)}</p>`;
  }

  function renderCheck() {
    const ev = evaluate();
    const score = CRITERIA.filter(k => ev.crit[k]).length;
    const rows = CRITERIA.map(k => `<button type="button" class="jr-crit ${ev.crit[k] ? 'is-ok' : 'is-ko'} ${state.selected === k ? 'is-selected' : ''}" data-crit="${k}">` +
      `<span class="jr-crit-text"><strong>${LABELS.criteria[k]}</strong><small>${LABELS.criteriaSub[k]}</small></span>` +
      `<span class="jr-crit-mark" aria-label="${ev.crit[k] ? LABELS.markCorrect : LABELS.markIncorrect}">${ev.crit[k] ? '✓' : '✗'}</span></button>`).join('');
    lab.body.innerHTML = `<div class="jr-check">` +
      `<div class="jr-check-left">` +
        `<div class="lab-score"><span class="lab-score-num">${score}<small> / ${CRITERIA.length}</small></span><span class="lab-score-label">${LABELS.scoreLabel}</span></div>` +
        `<div class="jr-crit-list">${rows}</div>` +
        `<p class="jr-reminder">${gloss(LABELS.q1)}</p>` +
      `</div>` +
      `<div class="jr-check-detail" aria-live="polite"><h3>${LABELS.criteria[state.selected]}</h3>${criterionDetail(state.selected, ev)}</div>` +
      `</div>`;
    $$('[data-crit]').forEach(btn => btn.addEventListener('click', () => {
      state.selected = btn.dataset.crit;
      renderCheck();
    }));
    lab.fillSpace($('.jr-check-detail'));
    lab.checkFooter();
  }

  /* ===== Rapport imprimable : contenu des 7 sections de la fiche outil FO3
     (en-tête, numérotation et mise en page : cadre commun) =====
     Les erreurs passent par mark() (lab-engine.js), dans l'ordre de
     lecture : cases du carnet et besoins (observations), dessin corrigé et
     cadres (interprétation), conseil, preuves, responsabilité et jugements
     (conclusion). */
  function buildReport(mark) {
    const R = LABELS.report;
    const ev = evaluate();
    const c = state.concl;
    const word = (text, good, note) => (good ? text : mark(text, plain(note)));
    const names = list => escapeHtml(LABELS.list(list.map(methodName)));

    const hyp = `<div class="jr-report-board">${boardSVG('read', state.hyp.place)}</div>` +
      `<p>${R.advice(girlName(), boyName(), state.hyp.advice.length ? names(state.hyp.advice) : DASH)}</p>` +
      (state.hyp.because.trim() ? `<p>${R.because}: ${escapeHtml(state.hyp.because.trim())}</p>` : '');

    const keys = ROWS.concat(tryKeys());
    const head = `<tr><th></th><th>${plain(LABELS.notes.where)}</th>${COLS.map(col => `<th>${plain(LABELS.notes.colsShort[col])}</th>`).join('')}</tr>`;
    const rows = keys.map(k => {
      const n = noteOf(k), r = ev.rows[k], truth = truthOf(k);
      const name = isTry(k) ? `${LABELS.tryName(tryIndex(k) + 1)} (${names(n.cards)})` : escapeHtml(methodName(k));
      const whereText = n.where ? escapeHtml(LABELS.zones[n.where]) : DASH;
      const where = r.where == null ? DASH : r.where ? whereText : mark(whereText, CHECK.whereNote(LABELS.zones[ACT_ZONE[k]]), { box: true });
      const cells = COLS.map(col => {
        const t = markGlyph(n[col]) || DASH;
        return `<td>${r.cols[col] ? t : mark(t, CHECK.cellNote(LABELS.notes.cols[col], LABELS.marks[truth[col]]), { box: true })}</td>`;
      }).join('');
      return `<tr><th>${name}</th><td>${where}</td>${cells}</tr>`;
    }).join('');
    const badges = state.tries.map((t, i) => (!activeTry(t) ? '' : `<li>${LABELS.tryName(i + 1)}: ${run.needs.map(need => {
      const v = t.badges[need];
      const text = `${plain(LABELS.needs[need])} ${v ? (v === 'yes' ? '✓' : '✗') : DASH}`;
      return ev.rows[`try${i}`].badges[need] ? text : mark(text, CHECK.badgeNote(LABELS.metNot[needMet(need, t.cards) ? 'yes' : 'no']));
    }).join(' · ')}</li>`)).join('');
    const observations = `<p>${R.key}</p><table class="jr-report-table">${head}${rows}</table>` +
      `<p>${R.needsTitle(girlName(), boyName())}</p><ul>${badges}</ul>`;

    const placeErrors = METHODS.filter(m => !ev.placeOk[m]);
    const marks = {};
    METHODS.forEach(m => { marks[m] = ev.placeOk[m] ? 'ok' : 'ko'; });
    const interpretation = `<p>${R.whereTitle}</p><div class="jr-report-board">${boardSVG('read', c.place, { marks })}</div>` +
      (placeErrors.length ? `<p>${mark(R.whereMark, CHECK.whereReport(placeErrors.map(m => `${methodName(m)}: ${LABELS.zones[ACT_ZONE[m]]}`).join(' · ')))}</p>` : '') +
      `<ul>${WAYS.map(w => `<li>${plain(LABELS.ways[w])}: ${METHODS.filter(m => c.way[m] === w).map(m => (ev.wayOk[m] ? escapeHtml(methodName(m)) : mark(escapeHtml(methodName(m)), CHECK.wayNote(LABELS.ways[WAY[m]])))).join(', ') || DASH}</li>`).join('')}` +
      `<li>${plain(LABELS.c1ShieldHow)} ${METHODS.filter(m => c.shield[m] || SHIELD[m]).map(m => {
        const t = escapeHtml(methodName(m));
        if (ev.shieldOk[m]) return t;
        return mark(c.shield[m] ? t : `(${t})`, c.shield[m] ? CHECK.shieldWrong : CHECK.shieldMissing);
      }).join(', ') || DASH}</li></ul>`;

    const proofs = proofNeeds().map(n => {
      const t = c.proofs[n] ? escapeHtml(plain(proofText(c.proofs[n]))) : DASH;
      return `<li>${plain(LABELS.needs[n])}: ${ev.proofsOk[n] ? t : mark(t, CHECK.proofNote(LABELS.notes.colsShort[PROOF_COL[n]]))}</li>`;
    }).join('');
    const adviceText = c.advice.length ? names(c.advice) : DASH;
    const unmet = run.needs.filter(n => !ev.needsOk[n]);
    const whoText = c.who === 'girl' ? escapeHtml(girlName()) : c.who === 'boy' ? escapeHtml(boyName()) : c.who ? escapeHtml(LABELS.both) : DASH;
    const conclusion = `<p>${R.finalAdvice(girlName(), boyName(), unmet.length ? mark(adviceText, CHECK.unmetNote(LABELS.list(unmet.map(n => plain(LABELS.needs[n]))))) : adviceText)}</p>` +
      (proofs ? `<ul>${proofs}</ul>` : '') +
      `<p>${R.who(word(whoText, c.who === 'both', CHECK.whoNote))}</p>` +
      `<ul><li>${R.verdict(LABELS.verdictPlace, c.vPlace ? word(LABELS.verdicts[c.vPlace], c.vPlace === ev.shouldPlace, CHECK.verdictPlace(ev.same, METHODS.length, LABELS.verdicts[ev.shouldPlace])) : DASH)}</li>` +
      `<li>${R.verdict(LABELS.verdictAdvice, c.vAdvice ? word(LABELS.verdicts[c.vAdvice], c.vAdvice === ev.shouldAdvice, CHECK.verdictAdvice(LABELS.verdicts[ev.shouldAdvice])) : DASH)}</li></ul>`;

    const correction = CRITERIA.map(k => `<tr><th>${LABELS.criteria[k]}</th><td class="${ev.crit[k] ? 'ok' : 'ko'}">${ev.crit[k] ? '✓' : '✗'}</td></tr>`).join('');

    return {
      title: R.title,
      sections: [
        `<ol><li>${plain(LABELS.q1)}</li><li>${plain(LABELS.q2(girlName(), boyName()))} ${plain(LABELS.coupleNeeds)} ${escapeHtml(LABELS.list(run.needs.map(n => plain(LABELS.needs[n]))))}.</li></ol>`,
        hyp,
        `<p>${R.materials}</p>`,
        `<ol>${R.steps.map(t => `<li>${t}</li>`).join('')}</ol>`,
        observations,
        interpretation,
        conclusion
      ],
      correction: `<p><strong>${R.score(CRITERIA.filter(k => ev.crit[k]).length, CRITERIA.length)}</strong></p>` +
        `<table class="jr-report-corr">${correction}</table>`
    };
  }

  lab = LabEngine.create({
    id: 'journey',
    // Ce qu'il faut toucher ou remplir maintenant (voir phase).
    todo: step => (step === 2 ? todoEls() : []),
    // Page d'accueil (Mission, voir lab-engine.js) : toujours la même, rien du tirage.
    briefing: () => ({
      heading: LABELS.briefTitle,
      intro: gloss(LABELS.briefTask),
      questionTitle: LABELS.yourQuestion,
      questions: [gloss(LABELS.q1)],
      steps: LABELS.briefSteps.map((text, i) => ({
        text: gloss(text),
        detail: gloss(LABELS.briefDetails[i]),
        pics: i === 0 ? ['pill', 'condom', 'iud'].map(m => ({ html: cardPic(m, 'jr-brief-img'), label: methodName(m) }))
          : i === 1 ? [{ html: PICTO.sperm, label: LABELS.legend.sperm }, { html: PICTO.egg, label: LABELS.legend.egg }, { html: PICTO.stis, label: LABELS.legend.stis }]
            : null
      })),
      checks: Object.values(LABELS.criteria)
    }),
    title: LABELS.title,
    glossary: GLOSSARY,
    reset,
    stepComplete,
    lockReason,
    isStarted: () => METHODS.some(m => !!state.hyp.place[m]) || state.hyp.advice.length > 0 || state.started,
    render: { 1: renderPredict, 2: () => renderExperiment(), 3: renderConclude, 4: renderCheck },
    report: buildReport,
    version: 1,
    save: () => ({ run, state }),
    // Une animation interrompue est déjà comptée : le modèle se redessine dans l'état atteint.
    load(data) {
      const r = data.run, s = data.state;
      const okList = (l, max) => Array.isArray(l) && l.length <= max && l.every(m => METHODS.includes(m));
      if (!r || !Array.isArray(r.needs) || !r.needs.every(n => NEEDS.includes(n)) || !Number.isInteger(r.girl) || !Number.isInteger(r.boy) ||
        r.girl < 0 || r.girl >= LABELS.girls.length || r.boy < 0 || r.boy >= LABELS.boys.length ||
        !okList(r.order, METHODS.length) || r.order.length !== METHODS.length ||
        !s || !s.hyp || !s.hyp.place || !okList(s.hyp.advice, 2) || !s.notes || !ROWS.every(k => s.notes[k]) ||
        !Array.isArray(s.tries) || s.tries.length > MAX_TRIES || !s.tries.every(t => t && okList(t.cards, 2) && t.badges) ||
        !s.concl || !s.concl.place || !s.concl.way || !s.concl.shield || !okList(s.concl.advice, 2) || !s.concl.proofs ||
        ![1, 2].includes(s.part) || (s.part === 2 && !s.tries.length)) throw new Error('labProgress');
      run = r;
      state = s;
      if (!CRITERIA.includes(state.selected)) state.selected = CRITERIA[0];
      if (![1, 2].includes(state.cTab)) state.cTab = 1;
      state.proofFor = null;
      busy = false;
      held = null;
      stepperDone = null;
      conclReady = null;
    },
    summary() {
      const ev = evaluate();
      const criteria = {};
      CRITERIA.forEach(k => { criteria[k] = ev.crit[k]; });
      return {
        score: CRITERIA.filter(k => ev.crit[k]).length,
        total: CRITERIA.length,
        criteria,
        labels: LABELS.criteria, // noms des critères, pour le tableau de bord
        details: {
          needs: run.needs,
          hypAdvice: state.hyp.advice,
          advice: state.concl.advice,
          placedRight: ev.same,
          notesRight: ev.good,
          notes: ev.total
        }
      };
    }
  });
})();
