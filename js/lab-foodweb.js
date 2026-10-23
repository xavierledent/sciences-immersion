/* ===== Labo virtuel « Pull one thread » (bio1) : le réseau trophique d'une forêt belge =====

   Simulation propre à ce labo, commune aux deux filières ; ses textes sont
   dans le dossier du chapitre, un fichier par langue (lab-foodweb.en.js,
   lab-foodweb.nl.js). Le cadre commun (modale, barre d'étapes, verrous,
   traduction, objet en main, rapport imprimé) est dans lab-engine.js.
   Ordre de chargement : moteur, textes, ce fichier.

   Les deux labos réels du chapitre ont déjà leur version virtuelle (The
   vanishing leaves, Inside two ecosystems) : ce labo part du cours (partie 2,
   missions 6 à 8 : chaîne et réseau, construire le modèle de la forêt belge,
   une maladie tue tous les lapins). C'est une expérience sur un modèle. Le
   cerf n'est jamais suivi ni malade (choix de l'enseignant) ; le loup et le
   sanglier peuvent être dans le réseau.

   Le modèle : une réserve de 19 êtres vivants d'une forêt belge ; chaque
   partie en tire 12, et les flèches « is eaten by » en découlent (une
   quinzaine). Une maladie tue
   toutes les bêtes d'une espèce ; le modèle tourne sur 10 ans. Les courbes
   suivent des formes fixes (le prédateur baisse sans disparaître, l'autre
   proie qu'il chasse plus baisse, la troisième espèce monte si elle
   mangeait la même chose, ou ne bouge pas si rien ne change pour elle) ;
   seuls les effectifs varient. Les valeurs des années 0 et 10
   tombent sur une ligne du quadrillage : l'élève peut les lire. Dans une
   chaîne seule, le prédateur n'a plus rien à manger et disparaît.

   Tirés au sort : les 12 êtres vivants, puis parmi les rôles possibles dans
   ce réseau (voir rolesIn) l'espèce malade, le prédateur suivi, l'autre
   proie et la troisième espèce ; les effectifs, l'ordre des cartes. Les
   cartes écologiques s'écrivent avec ce qui est dans le réseau.

   Déroulé :
     1. Predict    — l'allure de 3 courbes dans le réseau (prédateur, autre
                     proie, concurrent) et celle du prédateur dans une chaîne
                     seule (4 vignettes : monte, pareil, baisse, disparaît)
     2. Experiment — a) le modèle : poser chaque carte sur son niveau
                     (producteurs en bas, objet en main) et faire vérifier
                     les rangées (obligatoire, jusqu'à ce qu'elles soient
                     justes) ; puis tracer les flèches (toucher une flèche
                     l'enlève) et comparer avec les cartes ; les erreurs sont
                     montrées sur le modèle jusqu'au geste suivant ; la suite
                     reste fermée tant que le modèle ne correspond pas ;
                     b) la maladie : test 1 (le réseau), test 2 (une chaîne
                     seule) ; le carnet : années 0 et 10 lues sur les
                     graphiques, et l'allure de chaque courbe
     3. Conclude   — question a (allure et cause, pour chaque espèce),
                     question b (le réseau résiste-t-il mieux ?), jugement
                     des quatre hypothèses
     4. Check      — 5 vérifications : modèle, carnet, question a,
                     question b, hypothèses ; rapport (FO3, graphiques FO5c) */

(function () {
  'use strict';

  const { escapeHtml, shuffle, mulberry32, seedFrom, reduceMotion } = LabEngine.util;

  // Cadre commun, créé en fin de fichier (LabEngine.create).
  let lab;
  const $ = sel => lab.$(sel);
  const $$ = sel => lab.$$(sel);
  const gloss = text => lab.gloss(text);

  /* ===== Textes =====
     Dans le dossier du chapitre, un fichier par langue (lab-foodweb.en.js,
     lab-foodweb.nl.js), chargé avant celui-ci. */
  const {
    labels: LABELS, glossary: GLOSSARY, explanations: EXPLAIN, check: CHECK
  } = LabEngine.textFor('foodweb');

  /* ===== Le modèle ===== */
  /* La réserve : 19 êtres vivants d'une forêt belge. Niveau : 0 producteurs,
     1 mangent des plantes, 2 mangent des animaux (même un peu : la mésange
     mange aussi des mûres). Chaque partie en garde 12. */
  const LEVEL = {
    oak: 0, beech: 0, hazel: 0, grass: 0, bramble: 0,
    rabbit: 1, mouse: 1, deer: 1, boar: 1, caterpillar: 1, squirrel: 1, snail: 1,
    bluetit: 2, fox: 2, owl: 2, buzzard: 2, wolf: 2, hedgehog: 2, marten: 2
  };
  const POOL = Object.keys(LEVEL);
  /* Ce que mange chaque animal : un animal, ou une plante et la partie
     mangée (fruit ou feuille : seuls ceux qui mangent la même partie sont
     concurrents). Les cartes écologiques s'en écrivent. */
  const DIET = {
    rabbit: ['grass:leaf'], mouse: ['oak:fruit', 'beech:fruit', 'hazel:fruit', 'bramble:fruit'],
    deer: ['grass:leaf', 'bramble:leaf', 'oak:leaf'], boar: ['oak:fruit', 'beech:fruit'],
    caterpillar: ['oak:leaf', 'beech:leaf'], squirrel: ['oak:fruit', 'beech:fruit', 'hazel:fruit'], snail: ['grass:leaf', 'bramble:leaf'],
    bluetit: ['caterpillar', 'bramble:fruit'], fox: ['rabbit', 'mouse'], owl: ['mouse', 'bluetit'], buzzard: ['rabbit', 'mouse'],
    wolf: ['deer', 'boar'], hedgehog: ['snail', 'caterpillar'], marten: ['squirrel', 'mouse']
  };
  const EATS = {};
  Object.keys(DIET).forEach(b => { EATS[b] = DIET[b].map(x => x.split(':')[0]); });
  const partOf = (b, a) => { const d = DIET[b].find(x => x.split(':')[0] === a); return d && d.split(':')[1]; };
  const isAnimal = x => LEVEL[x] > 0;
  // Jamais suivi ni malade : le cerf (choix de l'enseignant).
  const NO_ROLE = ['deer'];

  // Dans un réseau W : qui mange qui, qui mange la même chose (même partie).
  const eatsIn = (W, b, a) => W.includes(a) && W.includes(b) && !!EATS[b] && EATS[b].includes(a);
  const foodsIn = (W, b) => (EATS[b] || []).filter(a => W.includes(a));
  const predsIn = (W, a) => W.filter(b => eatsIn(W, b, a));
  const sharedIn = (W, x, y) => foodsIn(W, x).filter(p => LEVEL[p] === 0 && eatsIn(W, y, p) && partOf(x, p) === partOf(y, p));

  /* Les axes des graphiques, par espèce : g = pas du quadrillage (les
     valeurs des années 0 et 10 tombent sur une ligne), max = haut de l'axe,
     n0 = effectif de départ (multiples de g). */
  const AXIS = {
    rabbit: { g: 10, max: 240, n0: [160, 200] },
    mouse: { g: 20, max: 320, n0: [220, 280] },
    deer: { g: 4, max: 64, n0: [28, 36] },
    squirrel: { g: 4, max: 80, n0: [40, 48] },
    boar: { g: 2, max: 40, n0: [20, 28] },
    caterpillar: { g: 250, max: 4000, n0: [2500, 3250] },
    snail: { g: 250, max: 4000, n0: [2500, 3250] },
    hedgehog: { g: 1, max: 20, n0: [10, 16] },
    marten: { g: 1, max: 10, n0: [5, 8] },
    wolf: { g: 1, max: 10, n0: [5, 8] },
    bluetit: { g: 5, max: 80, n0: [50, 65] },
    fox: { g: 1, max: 16, n0: [11, 14] },
    owl: { g: 1, max: 14, n0: [8, 12] },
    buzzard: { g: 1, max: 12, n0: [7, 10] }
  };

  /* L'allure des courbes, année par année (0 à 10) : part du changement
     déjà faite. Le prédateur baisse avec un peu de retard ; l'autre proie
     baisse vite (le prédateur se reporte sur elle), passe sous sa valeur
     finale puis remonte un peu ; le concurrent monte ; une espèce pour qui
     rien ne change ne bouge pas ; dans une chaîne seule, le prédateur
     s'éteint en trois ans. */
  const SHAPES = {
    pred: [0, 0.08, 0.3, 0.55, 0.74, 0.86, 0.93, 0.97, 0.99, 1, 1],
    other: [0, 0.4, 0.95, 1.2, 1.16, 1.1, 1.06, 1.03, 1.01, 1, 1],
    rival: [0, 0.12, 0.38, 0.64, 0.82, 0.92, 0.97, 0.99, 1, 1, 1],
    flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    chain: [0, 0.35, 0.78, 1, 1, 1, 1, 1, 1, 1, 1]
  };
  const YEARS = 10;
  const TRENDS = ['rise', 'same', 'fall', 'gone'];
  const ROLES = ['pred', 'other', 'rival'];                  // les trois espèces suivies dans le réseau
  const NOTE_ROWS = ['pred', 'other', 'rival', 'chain'];     // le carnet : trois au test 1, une au test 2
  const CAUSES = ['less', 'hunted', 'more', 'none', 'disease'];
  const RESIST = ['better', 'worse'];
  const REASONS = ['other', 'babies', 'strong'];
  // Couleur de chaque courbe : l'espèce malade, le prédateur, l'autre proie, le concurrent.
  const COLORS = { sick: '#b5473f', pred: '#c27c0e', other: '#3a78b5', rival: '#2f8f5b' };

  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pickOne = arr => arr[Math.floor(Math.random() * arr.length)];
  const snap = (v, g) => Math.round(v / g) * g;

  // Une série de 11 valeurs entières, de n0 à n10 selon une allure ; un peu
  // de bruit entre les deux (graine : même courbe à chaque affichage).
  function series(n0, n10, shape, seed) {
    const r = mulberry32(seed);
    return SHAPES[shape].map((k, t) => {
      if (t === 0) return n0;
      if (t === YEARS) return n10;
      const v = n0 + (n10 - n0) * k;
      const noise = shape === 'chain' && k >= 1 ? 0 : (r() - 0.5) * 0.05 * n0;
      return Math.max(0, Math.round(v + noise));
    });
  }

  /* Les 12 êtres vivants d'une partie : 3 ou 4 producteurs, 4 ou 5 qui
     mangent des plantes, le reste qui mange des animaux (5 au plus par
     rangée du plateau). Chaque animal a de quoi manger, chaque plante est
     mangée. */
  function drawWeb() {
    for (;;) {
      const np = pickOne([3, 4]), n1 = pickOne([4, 5]), n2 = 12 - np - n1;
      if (n2 > 5) continue;
      const take = (lv, n) => shuffle(POOL.filter(x => LEVEL[x] === lv)).slice(0, n);
      const W = take(0, np).concat(take(1, n1), take(2, n2));
      if (W.filter(isAnimal).some(b => !foodsIn(W, b).length)) continue;
      if (W.filter(x => !isAnimal(x)).some(p => !predsIn(W, p).length)) continue;
      return W;
    }
  }

  /* Les rôles possibles dans un réseau W (aucun : on tire un autre réseau).
     - S, l'espèce malade : elle mange des plantes, quelqu'un la mange ;
     - P, le prédateur suivi : il mange S et autre chose (il baisse sans
       disparaître ; dans une chaîne seule, il disparaît) ;
     - O, l'autre proie, chassée plus : P la mange, ou un animal X qui mange
       P la mange aussi (P se fait rare, X se reporte sur O) ; O ne mange pas
       la même chose que S, et n'est ni la proie ni le prédateur de S ou P ;
     - T, la troisième espèce : elle monte si elle mangeait la même chose
       que S, ou ne bouge pas ; dans les deux cas, aucun autre lien proche
       avec S, P ou O (ni proie, ni prédateur, ni prédateur commun, ni un
       animal mangé qui change lui-même ; pour « ne bouge pas », pas la
       même nourriture que O non plus).
     Une espèce que deux effets tireraient en sens contraires est écartée :
     la réponse serait discutable. */
  function rolesIn(W) {
    const out = [];
    const roleOk = x => isAnimal(x) && !NO_ROLE.includes(x) && AXIS[x];
    W.filter(S => LEVEL[S] === 1 && roleOk(S)).forEach(S => {
      const predS = predsIn(W, S);
      predS.filter(P => roleOk(P) && foodsIn(W, P).length >= 2).forEach(P => {
        W.filter(O => roleOk(O) && O !== S && O !== P).forEach(O => {
          const direct = eatsIn(W, P, O);
          const top = direct ? null : W.find(X => eatsIn(W, X, P) && eatsIn(W, X, O));
          if (!direct && !top) return;
          if (sharedIn(W, O, S).length || eatsIn(W, O, S) || eatsIn(W, S, O) || eatsIn(W, O, P)) return;
          // Un animal que la maladie touche (il change) : T ne doit pas le manger.
          const touched = y => [S, P, O].includes(y) || eatsIn(W, y, S) || eatsIn(W, y, O) || eatsIn(W, P, y) || eatsIn(W, O, y) ||
            predS.some(x => eatsIn(W, x, y)) || sharedIn(W, y, S).length > 0 || sharedIn(W, y, O).length > 0;
          W.filter(T => roleOk(T) && ![S, P, O].includes(T)).forEach(T => {
            const predT = predsIn(W, T);
            const near = [[T, S], [S, T], [T, P], [P, T], [T, O], [O, T]].some(([a, b]) => eatsIn(W, a, b)) ||
              predT.some(x => predS.includes(x) || eatsIn(W, x, P) || eatsIn(W, x, O) || predsIn(W, O).includes(x)) ||
              foodsIn(W, T).filter(isAnimal).some(touched);
            if (near) return;
            const shared = sharedIn(W, T, S);
            if (!shared.length && sharedIn(W, T, O).length) return;
            out.push({ sick: S, pred: P, other: O, top, rival: T, cause: shared.length ? 'more' : 'none', shared });
          });
        });
      });
    });
    return out;
  }

  function draw() {
    for (;;) {
      const W = drawWeb();
      const all = rolesIn(W);
      if (!all.length) continue;
      // Une fois sur deux, si c'est possible, une troisième espèce qui monte.
      const more = all.filter(r => r.cause === 'more');
      const ro = pickOne(more.length && Math.random() < 0.5 ? more : all);
      const arrows = [];
      W.forEach(b => foodsIn(W, b).forEach(a => arrows.push(`${a}>${b}`)));
      const sp = { sick: ro.sick, pred: ro.pred, other: ro.other, rival: ro.rival, top: ro.top, food: pickOne(foodsIn(W, ro.sick)) };
      const n0 = {}, n10 = {};
      const rises = ro.cause === 'more';
      ['sick', 'pred', 'other', 'rival'].forEach(role => {
        const a = AXIS[sp[role]];
        // Une espèce qui va monter part assez bas pour avoir la place sur son axe.
        const hiN0 = role === 'rival' && rises ? Math.max(a.n0[0], Math.min(a.n0[1], Math.floor((a.max - 2 * a.g) / 1.35 / a.g) * a.g)) : a.n0[1];
        n0[role] = rnd(a.n0[0] / a.g, hiN0 / a.g) * a.g;
      });
      n10.sick = 0;
      n10.pred = Math.max(AXIS[sp.pred].g, snap(n0.pred * (0.55 + Math.random() * 0.12), AXIS[sp.pred].g));
      // Deux maillons plus loin, l'autre proie baisse moins.
      const [lo, hi] = ro.top ? [0.72, 0.82] : [0.6, 0.72];
      n10.other = snap(n0.other * (lo + Math.random() * (hi - lo)), AXIS[sp.other].g);
      n10.rival = rises ? Math.min(AXIS[sp.rival].max - 2 * AXIS[sp.rival].g, snap(n0.rival * (1.32 + Math.random() * 0.16), AXIS[sp.rival].g)) : n0.rival;
      const seed = seedFrom(`${sp.sick}-${sp.pred}-${n0.pred}-${n0.other}-${Date.now()}`);
      const web = {
        sick: [n0.sick].concat(Array(YEARS).fill(0)),
        pred: series(n0.pred, n10.pred, 'pred', seed + 1),
        other: series(n0.other, n10.other, 'other', seed + 2),
        rival: series(n0.rival, n10.rival, rises ? 'rival' : 'flat', seed + 3)
      };
      const chain = {
        sick: web.sick.slice(),
        pred: series(n0.pred, 0, 'chain', seed + 4)
      };
      return { species: W, arrows, sp, causes: { pred: 'less', other: 'hunted', rival: ro.cause }, shared: ro.shared, web, chain };
    }
  }

  let run;      // tirage : les espèces et les courbes
  let state;    // travail de l'élève

  function reset() {
    run = draw();
    const note = () => ({ y0: null, y10: null, trend: null });
    state = {
      hyp: { pred: null, other: null, rival: null, chain: null },
      because: '',
      view: 'model',                  // 'model' ou 'disease'
      mode: 'place',                  // le modèle : 'place' (poser les cartes) ou 'arrows'
      // rowChecks, rowsWrong, rowsOk : la vérification des rangées, obligatoire avant les flèches.
      model: { pos: {}, arrows: [], rowChecks: 0, rowsWrong: null, rowsOk: false, compares: 0, dirty: true, last: null, done: false },
      order: shuffle(run.species.slice()),
      test: 1,                        // test affiché : 1 (le réseau) ou 2 (une chaîne seule)
      ran1: false,
      ran2: false,
      notes: { pred: note(), other: note(), rival: note(), chain: note() },
      concl: {
        pred: { trend: null, cause: null }, other: { trend: null, cause: null }, rival: { trend: null, cause: null },
        resist: null, reason: null,
        v: { pred: null, other: null, rival: null, chain: null }
      },
      selected: 'model'
    };
    from = null;
    issuesOn = false;
    shownIssues = null;
    running = false;
    stepperDone = null;
  }

  /* --- Ce que disent les cartes et les courbes --- */
  const spOf = role => (role === 'chain' ? run.sp.pred : run.sp[role]);
  const seriesOf = role => (role === 'chain' ? run.chain.pred : run.web[role]);
  const trendOf = s => {
    const a = s[0], b = s[YEARS];
    if (b === 0) return 'gone';
    if (b > a * 1.1) return 'rise';
    if (b < a * 0.9) return 'fall';
    return 'same';
  };
  const truthTrend = role => trendOf(seriesOf(role));
  const rightCause = role => run.causes[role];

  const name = sp => LABELS.species[sp].name;
  const many = sp => LABELS.species[sp].many;
  const numberOf = (sp, cap) => LABELS.numberOf(many(sp), cap);
  const allPlaced = () => run.species.every(sp => state.model.pos[sp]);
  const placedCount = () => run.species.filter(sp => state.model.pos[sp]).length;
  const rowOf = sp => 2 - LEVEL[sp];        // rangée du plateau : 0 en haut (mangent des animaux), 2 en bas (producteurs)
  const started = () => state.ran1;

  // Les rangées, vérifiées d'abord : les cartes qui n'y sont pas.
  const wrongRows = () => run.species.filter(sp => state.model.pos[sp] && state.model.pos[sp].row !== rowOf(sp));

  /* Comparer les flèches aux cartes : les comptes, et où sont les erreurs
     (flèches fausses, êtres vivants à qui il manque une flèche qui arrive). */
  const missingAt = (b, arrows) => run.arrows.some(a => a.split('>')[1] === b && !arrows.includes(a));
  function compareModel() {
    const m = state.model;
    const wrongArrows = m.arrows.filter(a => !run.arrows.includes(a));
    const right = m.arrows.length - wrongArrows.length;
    return { right, missing: run.arrows.length - right, wrong: wrongArrows.length, wrongArrows, missingFor: run.species.filter(b => missingAt(b, m.arrows)) };
  }
  const modelMatches = r => r.missing === 0 && r.wrong === 0;

  // Les erreurs de la dernière vérification : montrées juste après le
  // bouton, effacées au geste suivant (voir clearIssues). Elles guident sans
  // accompagner chaque geste.
  let shownIssues = null;
  const lastIssues = () => (issuesOn && shownIssues ? shownIssues : { rows: [], arrows: [], missing: [] });

  /* ===== Dessins ===== */
  const ICONS = {
    oak: `<rect x="17" y="24" width="6" height="14" rx="1.5" fill="#8a5a3b"/><circle cx="12" cy="18" r="9" fill="#5c9a3c"/><circle cx="28" cy="18" r="9" fill="#5c9a3c"/>` +
      `<circle cx="20" cy="11" r="10" fill="#6aab47"/><ellipse cx="30" cy="28" rx="2.8" ry="3.4" fill="#b07a3a"/><path d="M27.4,25.4 h5.2" stroke="#6e4a26" stroke-width="2.2" stroke-linecap="round"/>`,
    grass: `<path d="M7,38 C8,28 6,21 3,15 M13,38 C13,27 15,19 18,11 M20,38 C20,30 22,22 28,15 M26,38 C27,31 30,26 35,22 M32,38 C32,33 33,29 37,27" stroke="#4f9a3a" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    bramble: `<path d="M4,37 C8,18 22,9 37,19" stroke="#7a4a5a" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
      `<ellipse cx="13" cy="21" rx="6" ry="3.4" fill="#4f8f3a" transform="rotate(-35 13 21)"/><ellipse cx="26" cy="12" rx="6" ry="3.4" fill="#4f8f3a" transform="rotate(8 26 12)"/>` +
      `<g fill="#3b2140">${[[30, 25], [33.5, 27], [30.5, 29], [33, 31], [19, 27], [22, 29], [19.5, 30.5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2"/>`).join('')}</g>`,
    rabbit: `<ellipse cx="23" cy="29" rx="11" ry="7.5" fill="#a58d74"/><circle cx="13" cy="23" r="6" fill="#a58d74"/>` +
      `<ellipse cx="10.5" cy="11" rx="2.4" ry="7" fill="#a58d74"/><ellipse cx="15.5" cy="11" rx="2.4" ry="7" fill="#a58d74" transform="rotate(14 15.5 11)"/>` +
      `<ellipse cx="10.5" cy="11" rx="1" ry="5" fill="#e3c9c0"/><circle cx="34" cy="27" r="3" fill="#f2ede6"/><circle cx="11" cy="22" r="1.2" fill="#2b2b2b"/><ellipse cx="17" cy="35.5" rx="4" ry="2" fill="#97806a"/>`,
    mouse: `<path d="M31,29 C38,30 38,37 30,37" stroke="#8a6a4c" stroke-width="1.5" fill="none" stroke-linecap="round"/><ellipse cx="22" cy="28" rx="10" ry="6.5" fill="#9b7653"/>` +
      `<circle cx="12.5" cy="25" r="5.2" fill="#9b7653"/><circle cx="13" cy="18.5" r="3.8" fill="#9b7653"/><circle cx="13" cy="18.5" r="2.4" fill="#d9a99a"/>` +
      `<circle cx="10.6" cy="24" r="1.1" fill="#222"/><circle cx="7.6" cy="26.4" r="0.9" fill="#4a3426"/>`,
    deer: `<ellipse cx="23" cy="22" rx="11" ry="6" fill="#a8723f"/>` +
      [14, 19, 26, 31].map(x => `<rect x="${x}" y="25" width="2.4" height="13" rx="1" fill="#8a5a30"/>`).join('') +
      `<path d="M12.6,21 L8.6,10 L12.6,9 L16.2,19.6 Z" fill="#a8723f"/><ellipse cx="9" cy="10" rx="4.2" ry="3" fill="#a8723f"/>` +
      `<path d="M10,7 L8.6,1.6 M10,7 L13.4,2.4 M8.9,3.6 L6.2,2.4" stroke="#6e4a26" stroke-width="1.4" stroke-linecap="round"/><circle cx="7.6" cy="9.4" r="0.9" fill="#222"/><circle cx="34" cy="19" r="2.2" fill="#f2ede6"/>`,
    caterpillar: [[8, 27], [14, 25], [20, 27], [26, 25], [32, 23]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#7cb342"/>`).join('') +
      `<circle cx="33" cy="19" r="5.4" fill="#5d9a2d"/><circle cx="35" cy="17.6" r="1.1" fill="#1f2a1a"/><path d="M33,14 L32,10 M35.5,14.2 L37,10.4" stroke="#3f6b1d" stroke-width="1.2" stroke-linecap="round"/>`,
    squirrel: `<path d="M25,35 C38,33 39,14 31,8 C27,5 22,8 25,13 C30,18 31,26 24,29 Z" fill="#c4622d"/><ellipse cx="18.5" cy="28" rx="7" ry="7.4" fill="#d07436"/>` +
      `<circle cx="13.5" cy="18.5" r="5.2" fill="#d07436"/><path d="M11.4,14.6 L12.6,9.4 L16,14 Z" fill="#d07436"/><circle cx="11.8" cy="18" r="1" fill="#222"/>` +
      `<ellipse cx="12.4" cy="27" rx="2.6" ry="3.2" fill="#b07a3a"/><ellipse cx="15" cy="35.4" rx="4" ry="2" fill="#b85a28"/>`,
    bluetit: `<path d="M26,23 C33,22 37,27 35,31 C31,31 27,28 26,23 Z" fill="#5b8fb0"/><ellipse cx="20" cy="24" rx="11" ry="9.4" fill="#f2d24b"/>` +
      `<path d="M10.6,19 C13,9 27,9 30,18 Z" fill="#3b82c4"/><path d="M11,21 C14,19 20,19 22,22 C18,24 13,24 11,21 Z" fill="#ffffff"/>` +
      `<circle cx="15.6" cy="20.6" r="1.3" fill="#1f2a37"/><path d="M8,21 L11.4,19.8 L11.4,22.4 Z" fill="#3a3a3a"/><path d="M18,33 v4.4 M23,33 v4.4" stroke="#7a6a5a" stroke-width="1.4" stroke-linecap="round"/>`,
    fox: `<path d="M30,25 C38,22 40,31 35,35 C31,34 29,30 30,25 Z" fill="#e07b2a"/><circle cx="35.6" cy="33.4" r="2.3" fill="#ffffff"/>` +
      `<ellipse cx="22" cy="27" rx="10" ry="6" fill="#e07b2a"/>` + [15, 19, 25, 29].map(x => `<rect x="${x}" y="30" width="2.2" height="8" rx="1" fill="#5a3418"/>`).join('') +
      `<path d="M5,20 L11,13 L13,6 L16.4,12.6 L19.6,11.4 L18.4,22 C14,25 9,24 5,20 Z" fill="#e07b2a"/><path d="M5,20 C9,24 14,25 18.4,22 L12,21 Z" fill="#ffffff"/>` +
      `<circle cx="13" cy="16.4" r="1.1" fill="#222"/><circle cx="4.8" cy="19.8" r="1.2" fill="#222"/>`,
    owl: `<path d="M9,10 L12,4 L15,10 Z M25,10 L28,4 L31,10 Z" fill="#7a5a3e"/><ellipse cx="20" cy="22" rx="12" ry="14" fill="#8d6748"/><ellipse cx="20" cy="27" rx="7" ry="8.4" fill="#b89474"/>` +
      `<circle cx="15" cy="16" r="4.8" fill="#f3e3c8"/><circle cx="25" cy="16" r="4.8" fill="#f3e3c8"/><circle cx="15" cy="16" r="2.1" fill="#1f1a15"/><circle cx="25" cy="16" r="2.1" fill="#1f1a15"/>` +
      `<path d="M20,19 L18.4,22.4 L21.6,22.4 Z" fill="#e0a73a"/>`,
    buzzard: `<path d="M20,18 C14,9 6,9 1,14 C8,15 12,19 16,24 Z" fill="#7a5532"/><path d="M20,18 C26,9 34,9 39,14 C32,15 28,19 24,24 Z" fill="#7a5532"/>` +
      `<path d="M17,31 L20,38 L23,31 Z" fill="#7a5532"/><ellipse cx="20" cy="23" rx="5" ry="9.4" fill="#8f6a44"/><ellipse cx="20" cy="25.4" rx="3" ry="5" fill="#d9c3a3"/>` +
      `<circle cx="20" cy="13.6" r="3.8" fill="#8f6a44"/><path d="M20,15 L18.4,18 L21.2,17.2 Z" fill="#e0a73a"/>`,
    beech: `<rect x="17.5" y="22" width="5" height="16" rx="1.5" fill="#8d8d8d"/><ellipse cx="20" cy="15" rx="15.5" ry="12" fill="#7aa83c"/>` +
      `<ellipse cx="19" cy="11" rx="10" ry="7" fill="#8cbb4a"/><path d="M29,25 L33,30 L28.4,31 Z" fill="#9a6b3e"/>`,
    hazel: `<path d="M12,38 L16,22 M20,38 L20,19 M28,38 L24,22" stroke="#8a5a3b" stroke-width="2.4" stroke-linecap="round"/>` +
      `<circle cx="12" cy="17" r="8" fill="#6aab47"/><circle cx="28" cy="17" r="8" fill="#6aab47"/><circle cx="20" cy="11" r="9" fill="#7cbb52"/>` +
      `<circle cx="26" cy="26" r="3" fill="#b07a3a"/><circle cx="31.4" cy="24" r="2.6" fill="#b07a3a"/>`,
    boar: [12, 17, 27, 32].map(x => `<rect x="${x}" y="28" width="2.6" height="9" rx="1" fill="#3b2c22"/>`).join('') +
      `<ellipse cx="22" cy="24" rx="13" ry="8.5" fill="#5a4636"/><path d="M14,16 C20,13 28,13 33,17" stroke="#3b2c22" stroke-width="2.2" fill="none"/>` +
      `<path d="M10,19 L3,23 L4,28 L11,29 Z" fill="#5a4636"/><ellipse cx="3.6" cy="25.6" rx="1.6" ry="2.2" fill="#3b2c22"/>` +
      `<path d="M6,28 q1,3.4 3.6,2" stroke="#f2ede6" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M12,16 L14,11 L16.6,16 Z" fill="#5a4636"/><circle cx="9.6" cy="21.4" r="1" fill="#e8d9c0"/>`,
    snail: `<path d="M3,33 H30 C34,33 36,31 37,27" stroke="#b9a07a" stroke-width="4.4" fill="none" stroke-linecap="round"/>` +
      `<path d="M36,26 L38,19 M33.4,26.4 L32,19.6" stroke="#8a7a5a" stroke-width="1.4" stroke-linecap="round"/><circle cx="38" cy="18.4" r="1.2" fill="#5a4a3a"/>` +
      `<circle cx="18" cy="20" r="11" fill="#c08a5a" stroke="#8a5a30" stroke-width="1.4"/>` +
      `<path d="M18,20 m0,-6 a6,6 0 1 1 -6,6 a3.6,3.6 0 1 1 3.6,3.6" fill="none" stroke="#8a5a30" stroke-width="1.6"/>`,
    wolf: `<path d="M30,23 C38,20 40,29 35,34 C31,33 29,28 30,23 Z" fill="#7d858f"/>` +
      `<ellipse cx="22" cy="26" rx="10.5" ry="6.4" fill="#8e96a0"/>` + [14, 18.6, 25, 29.4].map(x => `<rect x="${x}" y="29" width="2.4" height="9" rx="1" fill="#5d646c"/>`).join('') +
      `<path d="M4,21 L11,13 L12,5 L16,12 L19.4,10.6 L18.4,22 C14,25 8.6,24.6 4,21 Z" fill="#8e96a0"/><path d="M4,21 C8.6,24.6 14,25 18.4,22 L12,21 Z" fill="#dfe3e8"/>` +
      `<circle cx="12.6" cy="15.6" r="1.1" fill="#222"/><circle cx="3.8" cy="20.8" r="1.2" fill="#222"/>`,
    hedgehog: `<path d="M5,31 C5,16 30,11 35,27 L35,31 Z" fill="#6b4f36"/>` +
      `<path d="M6,26 L4,21 L9,22 L8,16 L13,18 L14,12 L18,16 L21,10 L23,15 L27,11 L28,17 L32,15 L31,21 L35,21" fill="none" stroke="#4a3626" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<path d="M28,24 C33,23 37,26 39,30 L30,32 Z" fill="#d9b98f"/><circle cx="38.6" cy="29.8" r="1.3" fill="#222"/><circle cx="33" cy="26.4" r="1" fill="#222"/>` +
      `<path d="M12,31 v4 M18,31 v4 M26,31 v4" stroke="#4a3626" stroke-width="2" stroke-linecap="round"/>`,
    marten: `<path d="M28,24 C36,21 40,30 34,35 C31,33 29,29 28,24 Z" fill="#5e3f26"/><ellipse cx="19" cy="25" rx="11" ry="5.4" fill="#7a5233"/>` +
      [12, 16, 23, 27].map(x => `<rect x="${x}" y="28" width="2.2" height="8" rx="1" fill="#5e3f26"/>`).join('') +
      `<ellipse cx="9" cy="21" rx="5.6" ry="4.6" fill="#7a5233"/><path d="M5,23 q3,3.4 7.4,1.2 l-0.6,3.4 q-4.4,1.4 -6.8,-1.4 Z" fill="#f2d48a"/>` +
      `<path d="M6,17.4 L7,13.6 L9.4,17 M11,17 L12.4,13.4 L14,17.4" fill="#7a5233" stroke="#7a5233" stroke-width="1.2"/><circle cx="7" cy="20" r="0.9" fill="#222"/><circle cx="3.6" cy="22" r="1" fill="#222"/>`
  };

  const icon = (sp, cls) => `<svg class="fw-icon ${cls || ''}" viewBox="0 0 40 40" aria-hidden="true" focusable="false">${ICONS[sp]}</svg>`;

  // Allure d'une courbe (vignette) : monte, pareil, baisse, disparaît.
  const TREND_PATHS = {
    rise: '<path d="M3,19 L9,15 L14,9 L21,5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    same: '<path d="M3,12 L9,11 L15,13 L21,12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    fall: '<path d="M3,5 L9,9 L14,15 L21,19" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    gone: '<path d="M3,5 L8,12 L12,20 L21,20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="21" cy="20" r="2.4" fill="currentColor"/>'
  };
  const trendIcon = t => `<svg class="fw-trend-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${TREND_PATHS[t]}</svg>`;

  /* --- Le plateau du modèle : 780 × 470 px, trois rangées de 5 places ---
     En haut, ce qui mange des animaux ; au milieu, ce qui mange des plantes ;
     en bas, les producteurs. Les flèches sont tracées dans un SVG de même
     taille posé dessus (mêmes coordonnées, quel que soit le zoom). */
  const BOARD_W = 780, BOARD_H = 470;
  const TOKEN_W = 140, TOKEN_H = 58;
  const BAND_TOP = [0, 157, 314];
  const TOKEN_Y = [62, 219, 376];
  const slotX = col => 10 + col * 154;
  const COLS = 5;

  // Les flèches d'un modèle : départ en haut de la nourriture, arrivée en bas
  // du mangeur (ou en arc au-dessus, sur une même rangée). Les départs et les
  // arrivées d'un même jeton s'écartent un peu.
  function arrowsSVG(pos, arrows, uid, opts) {
    const o = opts || {};
    const center = sp => slotX(pos[sp].col) + TOKEN_W / 2;
    const top = sp => TOKEN_Y[pos[sp].row];
    const list = arrows.filter(a => { const [x, y] = a.split('>'); return pos[x] && pos[y]; });
    const outs = {}, ins = {};
    list.forEach(a => {
      const [x, y] = a.split('>');
      (outs[x] = outs[x] || []).push(a);
      (ins[y] = ins[y] || []).push(a);
    });
    const spread = (group, a, key) => {
      const g = group.slice().sort((p, q) => center(p.split('>')[key]) - center(q.split('>')[key]));
      const i = g.indexOf(a);
      return (i - (g.length - 1) / 2) * 15;
    };
    const bad = o.bad || [];
    const head = (id, color) => `<marker id="${id}" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">` +
      `<path d="M0,0 L10,5 L0,10 Z" fill="${color}"/></marker>`;
    let out = `<defs>${head(`fw-head-${uid}`, o.color || '#2f3b48')}${head(`fw-head-bad-${uid}`, '#d64545')}</defs>`;
    let hits = '';
    list.forEach(a => {
      const [x, y] = a.split('>');
      const x1 = center(x) + spread(outs[x], a, 1);
      const x2 = center(y) + spread(ins[y], a, 0);
      const rx = pos[x].row, ry = pos[y].row;
      let d;
      if (ry < rx) d = `M${x1},${top(x)} L${x2},${top(y) + TOKEN_H}`;
      else if (ry > rx) d = `M${x1},${top(x) + TOKEN_H} L${x2},${top(y)}`;
      else {
        const lift = Math.max(top(x) - 46, 6);
        d = `M${x1},${top(x)} C${x1},${lift} ${x2},${lift} ${x2},${top(y)}`;
      }
      const wrong = bad.includes(a);
      out += `<path ${wrong ? 'class="is-bad" ' : ''}d="${d}" fill="none" stroke="${wrong ? '#d64545' : (o.color || '#2f3b48')}" stroke-width="${wrong ? 2.6 : (o.width || 2)}"` +
        `${wrong ? ' stroke-dasharray="7 4"' : ''} marker-end="url(#fw-head-${wrong ? 'bad-' : ''}${uid})"/>`;
      // Une large bande invisible sur la flèche : la toucher l'enlève.
      if (o.hit) hits += `<path class="fw-arrow-hit" data-arrow="${a}" d="${d}" fill="none" stroke="transparent" stroke-width="16"/>`;
    });
    return out + hits;
  }

  /* --- Les graphiques : un panneau par espèce (FO5c) ---
     Chaque espèce a son échelle (un renard, deux cents souris) : un seul
     axe écraserait les petits nombres. viewBox 360 × 180 ; quadrillage tous
     les g ; un point par année. mode : 'live' (dévoilé pendant que le
     modèle tourne), 'read' (toucher un point montre sa valeur), 'print'. */
  const P = { W: 360, H: 180, L: 44, R: 14, T: 26, B: 34 };
  const px = t => P.L + (t / YEARS) * (P.W - P.L - P.R);

  function panelSVG(sp, values, role, o) {
    const a = AXIS[sp];
    const py = v => P.T + (1 - v / a.max) * (P.H - P.T - P.B);
    const every = [1, 2, 4, 5, 10].map(k => k * a.g).find(s => a.max / s <= 8);
    const uid = o.uid;
    let out = `<rect x="0" y="0" width="${P.W}" height="${P.H}" rx="8" fill="#ffffff"/>` +
      `<text x="${P.L}" y="16" class="fw-g-title">${escapeHtml(LABELS.graphTitle(many(sp)))}</text>`;
    for (let v = 0; v <= a.max + 1e-9; v += a.g) {
      const label = Math.abs(v / every - Math.round(v / every)) < 1e-9;
      out += `<line x1="${P.L}" x2="${P.W - P.R}" y1="${py(v).toFixed(1)}" y2="${py(v).toFixed(1)}" stroke="${label ? '#d9dee4' : '#eef1f4'}" stroke-width="1"/>`;
      if (label) out += `<text x="${P.L - 6}" y="${(py(v) + 3.5).toFixed(1)}" text-anchor="end" class="fw-g-tick">${v}</text>`;
    }
    for (let t = 0; t <= YEARS; t++) {
      out += `<line x1="${px(t)}" x2="${px(t)}" y1="${P.T}" y2="${py(0)}" stroke="${t % 2 ? '#f3f5f7' : '#e6e9ed'}" stroke-width="1"/>`;
      if (t % 2 === 0) out += `<text x="${px(t)}" y="${py(0) + 14}" text-anchor="middle" class="fw-g-tick">${t}</text>`;
    }
    out += `<line x1="${P.L}" x2="${P.W - P.R}" y1="${py(0)}" y2="${py(0)}" stroke="#8d97a3" stroke-width="1.2"/>` +
      `<line x1="${P.L}" x2="${P.L}" y1="${P.T}" y2="${py(0)}" stroke="#8d97a3" stroke-width="1.2"/>` +
      `<text x="${P.W - P.R}" y="${P.H - 4}" text-anchor="end" class="fw-g-axis">${LABELS.axisX}</text>` +
      `<text transform="translate(11 ${(P.T + py(0)) / 2}) rotate(-90)" text-anchor="middle" class="fw-g-axis">${LABELS.axisY}</text>`;
    if (values) {
      const color = COLORS[role];
      const clip = o.mode === 'live' ? ` clip-path="url(#fw-clip-${uid})"` : '';
      if (o.mode === 'live') {
        out += `<clipPath id="fw-clip-${uid}"><rect class="fw-reveal" x="0" y="0" width="${o.reveal == null ? P.W : px(o.reveal) + 6}" height="${P.H}"/></clipPath>`;
      }
      const d = values.map((v, t) => `${t ? 'L' : 'M'}${px(t).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
      out += `<g${clip}><path d="${d}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round"/>` +
        values.map((v, t) => {
          const look = o.mode === 'read' ? ` class="fw-pt" data-pt="${uid}" data-year="${t}" data-val="${v}" data-lab-look` : '';
          return `<circle cx="${px(t).toFixed(1)}" cy="${py(v).toFixed(1)}" r="3.4" fill="${color}" stroke="#ffffff" stroke-width="1.2"${look}/>`;
        }).join('') + `</g>`;
      if (o.mode === 'read') out += `<text id="fw-tip-${uid}" x="${P.W - P.R}" y="16" text-anchor="end" class="fw-g-tip"></text>`;
    }
    return `<svg class="lab-svg fw-panel" viewBox="0 0 ${P.W} ${P.H}" role="img" aria-label="${escapeHtml(LABELS.graphTitle(many(sp)))}">${out}</svg>`;
  }

  // Les panneaux d'un test : test 1, l'espèce malade et les trois suivies ;
  // test 2, l'espèce malade et le prédateur, dans la chaîne seule.
  function panelsOf(test) {
    return test === 1
      ? [['sick', run.sp.sick, run.web.sick], ['pred', run.sp.pred, run.web.pred], ['other', run.sp.other, run.web.other], ['rival', run.sp.rival, run.web.rival]]
      : [['sick', run.sp.sick, run.chain.sick], ['pred', run.sp.pred, run.chain.pred]];
  }

  function panelsHTML(test, o) {
    return `<div class="fw-panels is-test${test}">` + panelsOf(test).map(([role, sp, values], k) =>
      panelSVG(sp, o.values === false ? null : values, role, Object.assign({}, o, { uid: `${o.uid}${test}${k}` }))).join('') + `</div>`;
  }

  // Valeur d'un point au toucher (conclusion, correction).
  function bindPoints() {
    $$('[data-pt]').forEach(pt => pt.addEventListener('click', () => {
      const tip = $(`#fw-tip-${pt.dataset.pt}`);
      if (tip) tip.textContent = LABELS.pointValue(Number(pt.dataset.year), Number(pt.dataset.val));
    }));
  }

  /* ===== Étapes complètes (progression stricte, voir lab-engine.js) =====
     1 : les quatre hypothèses ; 2 : le modèle juste, les deux tests et le
     carnet ; 3 : toutes les réponses. */
  const hypDone = () => NOTE_ROWS.every(r => state.hyp[r]);
  const noteFilled = r => ['y0', 'y10', 'trend'].filter(k => state.notes[r][k] != null).length;
  const notesFilled = rows => (rows || NOTE_ROWS).reduce((n, r) => n + noteFilled(r), 0);
  const notesTotal = rows => (rows || NOTE_ROWS).length * 3;
  const notes1Done = () => notesFilled(ROLES) === notesTotal(ROLES);
  const notesDone = () => notesFilled() === notesTotal();

  function stepComplete(n) {
    if (n === 1) return hypDone();
    if (n === 2) return state.model.done && state.ran1 && state.ran2 && notesDone();
    return conclusionsComplete();
  }

  function lockReason(n) {
    if (n === 1) return LABELS.lockHypothesis;
    if (n === 2) {
      if (!state.model.done) return LABELS.lockModel;
      if (!state.ran1 || !state.ran2) return LABELS.lockTests;
      return LABELS.lockNotes(notesTotal() - notesFilled());
    }
    return lab.L.missingConclusions;
  }

  function questionsHTML() {
    return `<p class="fw-big-q">${gloss(LABELS.questions.main)}</p>` +
      `<ol class="fw-questions" type="a"><li>${gloss(LABELS.questions.a)}</li><li>${gloss(LABELS.questions.b)}</li></ol>`;
  }

  // La chaîne du test 2, en mots : « grass → rabbit → fox ».
  const chainText = () => [run.sp.food, run.sp.sick, run.sp.pred].map(sp => LABELS.species[sp].short).join(' → ');

  /* ===== Étape 1 : hypothèses ===== */
  function renderPredict() {
    const h = state.hyp;
    const show = lab.state.showMissing;
    const chip = (row, t) => `<button type="button" class="lab-choice fw-trend ${h[row] === t ? 'is-selected' : ''}" data-hyp="${row}" data-val="${t}" aria-pressed="${h[row] === t}">` +
      `${trendIcon(t)}<span>${LABELS.will[t]}</span></button>`;
    const row = r => `<div class="fw-hyp-row ${show && !h[r] ? 'lab-is-missing' : ''}">` +
      `<span class="fw-hyp-who">${icon(spOf(r))}<span>${gloss(LABELS.hypRow(numberOf(spOf(r), true)))}</span></span>` +
      `<span class="fw-trends">${TRENDS.map(t => chip(r, t)).join('')}</span></div>`;

    lab.body.innerHTML = `<div class="fw-predict">` +
      `<div class="fw-question-card"><p class="fw-kicker">${LABELS.yourQuestion}</p>${questionsHTML()}</div>` +
      `<div class="fw-hyp-card">` +
        `<p class="fw-kicker">${LABELS.hypothesisTitle}</p>` +
        `<p class="fw-scenario">${icon(run.sp.sick)}<span>${gloss(LABELS.scenario(many(run.sp.sick)))}</span></p>` +
        `<p class="fw-hyp-head"><span class="fw-letter">a</span>${gloss(LABELS.hypWeb)}</p>` +
        ROLES.map(row).join('') +
        `<p class="fw-hyp-head"><span class="fw-letter">b</span>${gloss(LABELS.hypChain(chainText()))}</p>` +
        row('chain') +
        `<label class="fw-because"><span>${LABELS.because}</span>` +
        `<input type="text" class="lab-input fw-because-input" maxlength="160" placeholder="${LABELS.becausePlaceholder}" value="${escapeHtml(state.because)}" autocomplete="off"></label>` +
      `</div></div>`;

    $$('[data-hyp]').forEach(btn => btn.addEventListener('click', () => {
      h[btn.dataset.hyp] = btn.dataset.val;
      if (lab.state.showMissing && hypDone()) lab.state.showMissing = false;
      renderPredict();
      lab.renderStepper();
    }));
    const because = $('.fw-because-input');
    because.addEventListener('input', e => { state.because = e.target.value; });
    // Hypothèses figées dès que le modèle a tourné une première fois.
    if (started()) {
      $$('[data-hyp]').forEach(btn => lab.setLock(btn, LABELS.lockHypothesisFixed, { icon: false }));
      because.readOnly = true;
      lab.setLock(because, LABELS.lockHypothesisFixed);
    }

    const ready = hypDone();
    const info = lab.state.showMissing && !ready ? lab.footerInfo(LABELS.lockHypothesis, true)
      : lab.footerInfo(ready ? LABELS.hypothesisReady : LABELS.hypothesisPending);
    lab.setFooter(info + `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-next>${LABELS.toModel} →</button></div>`);
    const next = $('[data-next]');
    next.addEventListener('click', () => lab.goToStep(2));
    lab.setLock(next, ready ? null : LABELS.lockHypothesis, { missing: true, key: 'next' });
  }

  /* ===== Étape 2 : le modèle, puis la maladie ===== */
  let from = null;          // le modèle : la nourriture touchée, en attente de son mangeur
  let issuesOn = false;     // le modèle : les erreurs de la comparaison sont montrées
  let running = false;      // le modèle tourne (10 ans)
  let stepperDone = null;

  function renderExperiment() {
    lab.release();
    if (lab.state.showMissing && !lab.isFrozen() && !state.model.done) state.view = 'model';
    const disease = state.view === 'disease';
    lab.body.innerHTML = `<div class="fw-run ${disease ? 'is-disease' : 'is-model'}">` +
      `<section class="fw-main">` +
        `<div class="fw-topbar">${tabsHTML()}${disease ? testsHTML() : modesHTML()}</div>` +
        (disease ? diseaseHTML() : boardHTML()) +
      `</section>` +
      `<section class="fw-side">${disease ? notebookHTML() : cardsListHTML()}</section>` +
      `</div>`;
    bindTabs();
    if (disease) { bindDisease(); bindNotebook(); } else bindModel();
    setCaption(defaultCaption());
    renderRunFooter();
  }

  function tabsHTML() {
    return `<div class="fw-tabs" role="tablist">` + ['model', 'disease'].map((v, i) =>
      `<button type="button" role="tab" class="fw-tab ${state.view === v ? 'is-on' : ''}" data-view="${v}" data-lab-look aria-selected="${state.view === v}">` +
      `<span class="fw-tab-num">${i + 1}</span><span>${LABELS.tabs[v]}</span></button>`).join('') + `</div>`;
  }

  function bindTabs() {
    $$('[data-view]').forEach(btn => btn.addEventListener('click', () => {
      if (state.view === btn.dataset.view) return;
      state.view = btn.dataset.view;
      from = null;
      lab.state.showMissing = false;
      renderExperiment();
    }));
    if (state.view !== 'disease') lab.setLock($('[data-view="disease"]'), state.model.done ? null : LABELS.lockDisease, { missing: true, key: 'tab-disease' });
    else if (running) lab.setLock($('[data-view="model"]'), LABELS.lockRunning, { icon: false });
  }

  /* --- a) Le modèle ---
     À droite, les cartes écologiques (à lire, mots soulignés) ; chaque
     carte a son jeton, à prendre en main et à poser sur une place libre du
     plateau. « Check the rows » (obligatoire) : les cartes mal rangées
     passent en rouge ; tant qu'une carte est mal rangée, pas de flèches.
     Puis les flèches : toucher la nourriture, puis ce qui la mange (toucher
     la flèche l'enlève ; la paire à l'envers la retourne). « Compare with
     the cards » donne les comptes et montre les erreurs : flèche rouge,
     « ! » où il manque une flèche. Les marques s'effacent au geste suivant. */
  function modesHTML() {
    return `<div class="fw-modes" role="group">` + ['place', 'arrows'].map(m =>
      `<button type="button" class="fw-mode ${state.mode === m ? 'is-on' : ''}" data-mode="${m}" aria-pressed="${state.mode === m}">${LABELS.modes[m]}</button>`).join('') + `</div>`;
  }

  function tokenHTML(sp, extra, issues) {
    const wrong = issues && issues.rows.includes(sp);
    const missing = issues && issues.missing.includes(sp);
    const cls = [from === sp ? 'is-from' : '', wrong ? 'is-wrong' : '', extra || ''].join(' ');
    return `<button type="button" class="fw-token ${cls}" data-token="${sp}">${icon(sp)}<span class="fw-token-name">${LABELS.species[sp].name}</span>` +
      `${missing ? `<span class="fw-missing" title="${escapeHtml(LABELS.missingHere)}" aria-label="${escapeHtml(LABELS.missingHere)}">!</span>` : ''}</button>`;
  }

  function boardHTML() {
    const pos = state.model.pos;
    const issues = lastIssues();
    const at = {};
    run.species.forEach(sp => { if (pos[sp]) at[`${pos[sp].row}|${pos[sp].col}`] = sp; });
    let slots = '';
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < COLS; col++) {
        const sp = at[`${row}|${col}`];
        slots += `<div class="fw-slot ${sp ? 'is-full' : ''}" data-slot="${row}|${col}" style="left:${slotX(col)}px;top:${TOKEN_Y[row]}px">${sp ? tokenHTML(sp, 'is-placed', issues) : ''}</div>`;
      }
    }
    const bands = [0, 1, 2].map(row => `<div class="fw-band" style="top:${BAND_TOP[row]}px;height:${(BAND_TOP[row + 1] || BOARD_H) - BAND_TOP[row] - 3}px">` +
      `<span class="fw-band-label">${gloss(LABELS.rows[row])}</span></div>`).join('');
    return `<div class="fw-board-wrap"><div class="fw-board" style="width:${BOARD_W}px;height:${BOARD_H}px">${bands}` +
      `<svg class="fw-arrows" viewBox="0 0 ${BOARD_W} ${BOARD_H}" aria-hidden="true" focusable="false">${arrowsSVG(pos, state.model.arrows, 'live', { bad: issues.arrows, hit: state.mode === 'arrows' && !state.model.done && !lab.isFrozen() })}</svg>` +
      `${slots}</div></div>` +
      `<div class="fw-controls"><p class="lab-caption fw-caption" data-caption aria-live="polite"></p>` +
      `<button type="button" class="lab-btn lab-btn-primary fw-compare" data-compare>${state.mode === 'place' ? LABELS.checkRows : LABELS.compare}</button></div>`;
  }

  // La carte écologique d'un être vivant : ce qu'il mange dans ce réseau.
  function cardText(sp) {
    const c = LABELS.cards[sp];
    if (typeof c === 'string') return c;
    return c(LABELS.list(foodsIn(run.species, sp).map(a => (isAnimal(a) ? many(a) : LABELS.parts[a][partOf(sp, a)]))));
  }

  function cardsListHTML() {
    const m = state.model;
    const pos = m.pos;
    // Une carte posée : son nom reste, grisé, avec ✓ (« on the model »).
    const rows = state.order.map(sp => `<li class="fw-card-row">` +
      (pos[sp] ? `<span class="fw-token-gone" title="${escapeHtml(LABELS.onBoard)}">${icon(sp)}<span>${LABELS.species[sp].name}</span><span class="fw-gone-mark" aria-label="${escapeHtml(LABELS.onBoard)}">✓</span></span>`
        : tokenHTML(sp, 'is-tray')) +
      `<span class="fw-card-text">${gloss(cardText(sp))}</span></li>`).join('');
    const legend = text => (issuesOn ? `<p class="fw-legend">${gloss(text)}</p>` : '');
    let result = '';
    if (m.done) result = `<p class="fw-result is-ok">${LABELS.compareOk}</p>`;
    else if (m.rowsOk && m.last) result = `<p class="fw-result">${LABELS.compareResult(m.last.right, m.last.missing, m.last.wrong)}</p>` + legend(LABELS.compareLegend);
    else if (m.rowsOk) result = `<p class="fw-result is-ok">${LABELS.rowsOk}</p>`;
    else if (m.rowsWrong != null) result = `<p class="fw-result">${LABELS.rowsResult(m.rowsWrong)}</p>` + legend(LABELS.rowsLegend);
    return `<h3 class="lab-panel-title">${LABELS.cardsTitle}</h3>` +
      `<ul class="fw-card-list" data-tray>${rows}</ul>` +
      `<div class="fw-result-box"><p class="fw-compares">${LABELS.comparesCount(m.rowChecks, m.compares)}</p>${result}</div>`;
  }

  function bindModel() {
    const m = state.model;
    $$('[data-mode]').forEach(btn => {
      if (btn.dataset.mode === 'arrows') {
        lab.setLock(btn, !allPlaced() ? LABELS.lockArrows(run.species.length - placedCount()) : m.rowsOk ? null : LABELS.lockRowsFirst,
          { icon: false, missing: allPlaced(), key: 'mode-arrows' });
      }
      btn.addEventListener('click', () => {
        state.mode = btn.dataset.mode;
        from = null;
        renderExperiment();
      });
    });
    $$('[data-token]').forEach(el => {
      const sp = el.dataset.token;
      if (m.done) { lab.setLock(el, LABELS.lockModelDone, { icon: false }); return; }
      if (state.mode === 'arrows' && m.pos[sp]) {
        el.addEventListener('click', () => arrowTap(sp));
        return;
      }
      if (state.mode === 'arrows') { lab.setLock(el, LABELS.lockPlaceAll, { icon: false }); return; }
      // Rangées justes : les cartes ne bougent plus.
      if (m.rowsOk) { lab.setLock(el, LABELS.lockRowsDone, { icon: false }); return; }
      lab.makeDraggable(el, {
        hold: true,
        ghost: () => `<div class="fw-ghost">${icon(sp)}<span>${LABELS.species[sp].name}</span></div>`,
        targets: () => $$('.fw-slot:not(.is-full)').concat(m.pos[sp] ? [$('[data-tray]')] : []),
        onHold: on => setCaption(on ? LABELS.captionHold(LABELS.species[sp].name) : defaultCaption()),
        onDrop: target => {
          if (target.dataset.slot) {
            const [row, col] = target.dataset.slot.split('|').map(Number);
            m.pos[sp] = { row, col };
          } else {
            delete m.pos[sp];
            m.arrows = m.arrows.filter(a => !a.split('>').includes(sp));
          }
          m.dirty = true;
          renderExperiment();
          lab.save();
        }
      });
    });
    const cmp = $('[data-compare]');
    cmp.addEventListener('click', () => {
      if (state.mode === 'place') checkRows(); else compareArrows();
    });
    const reason = m.done ? LABELS.lockModelDone : !allPlaced() ? LABELS.lockPlaceAll
      : state.mode === 'place' ? (m.rowsOk ? LABELS.lockRowsDone : null)
        : !m.arrows.length ? LABELS.lockNoArrow : null;
    lab.setLock(cmp, reason, { key: 'compare' });
    $$('[data-arrow]').forEach(p => p.addEventListener('click', () => {
      const [a, b] = p.dataset.arrow.split('>');
      m.arrows = m.arrows.filter(x => x !== p.dataset.arrow);
      m.dirty = true;
      from = null;
      renderExperiment();
      setCaption(LABELS.captionRemoved(LABELS.species[a].the, LABELS.species[b].the));
      lab.save();
    }));
    // Erreurs montrées : le premier geste dans le labo les efface.
    if (issuesOn) lab.body.addEventListener('pointerdown', clearIssues, { capture: true, once: true });
  }

  // « Check the rows » : justes, les flèches s'ouvrent ; sinon, les cartes mal rangées en rouge.
  function checkRows() {
    const m = state.model;
    const wrong = wrongRows();
    m.rowChecks++;
    m.rowsWrong = wrong.length;
    if (!wrong.length) {
      m.rowsOk = true;
      state.mode = 'arrows';
      issuesOn = false;
    } else {
      shownIssues = { rows: wrong, arrows: [], missing: [] };
      issuesOn = true;
    }
    from = null;
    renderExperiment();
    if (m.rowsOk) setCaption(LABELS.captionRowsOk);
    lab.save();
  }

  // « Compare with the cards » : les flèches comparées aux cartes.
  function compareArrows() {
    const m = state.model;
    if (m.dirty) { m.compares++; m.dirty = false; }
    m.last = compareModel();
    if (modelMatches(m.last)) { m.done = true; from = null; lab.state.showMissing = false; }
    shownIssues = { rows: [], arrows: m.last.wrongArrows, missing: m.last.missingFor };
    issuesOn = !m.done;
    renderExperiment();
    if (m.done) setCaption(LABELS.captionModelDone);
    lab.renderStepper();
    lab.save();
  }

  /* Effacer les erreurs sans redessiner : le geste qui commence (prendre un
     jeton, toucher une flèche) garde ses éléments et va jusqu'au bout. */
  function clearIssues() {
    if (!issuesOn) return;
    issuesOn = false;
    $$('.fw-token.is-wrong').forEach(el => el.classList.remove('is-wrong'));
    $$('.fw-missing, .fw-legend').forEach(el => el.remove());
    $$('.fw-arrows path.is-bad').forEach(p => {
      p.classList.remove('is-bad');
      p.setAttribute('stroke', '#2f3b48');
      p.setAttribute('stroke-width', '2');
      p.removeAttribute('stroke-dasharray');
      p.setAttribute('marker-end', 'url(#fw-head-live)');
    });
  }

  // Toucher la nourriture, puis ce qui la mange : la flèche apparaît (ou
  // disparaît, si elle était déjà là ; dans l'autre sens, elle se retourne).
  function arrowTap(sp) {
    const m = state.model;
    if (from == null) {
      from = sp;
      renderExperiment();
      setCaption(LABELS.captionFrom(LABELS.species[sp].the));
      return;
    }
    if (from === sp) { from = null; renderExperiment(); return; }
    const a = `${from}>${sp}`;
    const back = `${sp}>${from}`;
    const had = m.arrows.includes(a);
    const turned = !had && m.arrows.includes(back);
    m.arrows = had ? m.arrows.filter(x => x !== a) : m.arrows.filter(x => x !== back).concat(a);
    m.dirty = true;
    const [ta, tb] = [LABELS.species[from].the, LABELS.species[sp].the];
    const text = had ? LABELS.captionRemoved(ta, tb) : turned ? LABELS.captionTurned(ta, tb) : LABELS.captionAdded(ta, tb);
    from = null;
    renderExperiment();
    setCaption(text);
    lab.save();
  }

  /* --- b) La maladie ---
     Test 1 : le modèle tourne sur 10 ans, l'espèce malade disparaît la
     première année ; quatre graphiques (l'espèce malade et les trois
     suivies). Test 2 : une chaîne seule, la même maladie ; deux graphiques.
     Chaque test se rejoue sans rien changer. */
  const test2Open = () => state.ran1 && notes1Done();

  function testsHTML() {
    return `<div class="fw-tests" role="group">` + [1, 2].map(t =>
      `<button type="button" class="fw-testpill ${state.test === t ? 'is-on' : ''}" data-test="${t}" data-lab-look aria-pressed="${state.test === t}">${LABELS.testTitle[t]}</button>`).join('') + `</div>`;
  }

  function diseaseHTML() {
    const t = state.test;
    const ran = t === 1 ? state.ran1 : state.ran2;
    const strip = t === 1
      ? `<p class="fw-banner">${icon(run.sp.sick)}<span>${gloss(LABELS.banner1(many(run.sp.sick)))}</span></p>`
      : `<p class="fw-banner fw-chain">${[run.sp.food, run.sp.sick, run.sp.pred].map((sp, k) =>
        `<span class="fw-chain-item ${k === 1 ? 'is-sick' : ''}">${icon(sp)}<span>${LABELS.species[sp].short}</span></span>`).join('<span class="fw-chain-arrow" aria-hidden="true">→</span>')}` +
        `<span class="fw-chain-text">${gloss(LABELS.banner2(many(run.sp.sick)))}</span></p>`;
    return strip +
      `<div class="lab-scene-wrap fw-stage">${panelsHTML(t, { uid: 'live', mode: 'live', reveal: ran && !running ? null : 0, values: ran || running })}</div>` +
      `<div class="fw-controls"><p class="lab-caption fw-caption" data-caption aria-live="polite"></p>` +
      `<button type="button" class="lab-btn lab-btn-primary fw-runbtn" data-run>${ran ? `↻ ${LABELS.runAgain}` : `▶ ${LABELS.runModel}`}</button></div>`;
  }

  function bindDisease() {
    $$('[data-test]').forEach(b => {
      const t = Number(b.dataset.test);
      lab.setLock(b, running ? LABELS.lockRunning : t === 2 && !test2Open() ? LABELS.lockTest2 : null, { icon: false, missing: t === 2, key: 'test2' });
      b.addEventListener('click', () => {
        if (state.test === t) return;
        state.test = t;
        renderExperiment();
      });
    });
    const btn = $('[data-run]');
    btn.addEventListener('click', () => runModel(state.test));
    lab.setLock(btn, running ? LABELS.lockRunning : null);
  }

  /* Le modèle tourne : 10 ans en 6 s environ. Les courbes se dévoilent
     année par année. Rien n'est enregistré avant la fin (fermé en route :
     rien). */
  const YEAR_MS = 600;

  function runModel(test) {
    if (running) return;
    running = true;
    renderExperiment();
    const reveals = $$('.fw-reveal');
    const token = lab.newScene();
    let t = 0;
    let last = performance.now();
    const step = now => {
      if (!lab.isScene(token)) { running = false; return; }
      const dt = Math.max(0, Math.min(64, now - last));
      last = now;
      t = Math.min(YEARS, t + dt / (reduceMotion ? YEAR_MS / 6 : YEAR_MS));
      reveals.forEach(r => r.setAttribute('width', (px(t) + 6).toFixed(1)));
      setCaption(LABELS.captionYear(Math.floor(t)));
      if (t < YEARS) { requestAnimationFrame(step); return; }
      running = false;
      if (test === 1) state.ran1 = true; else state.ran2 = true;
      renderExperiment();
      setCaption(test === 1 ? LABELS.captionRan1 : LABELS.captionRan2);
      lab.renderStepper();
      lab.save();
    };
    requestAnimationFrame(step);
  }

  /* --- Le carnet (à droite) ---
     Pour chaque espèce suivie : l'effectif à l'année 0 et à l'année 10, lus
     sur le graphique, et l'allure de la courbe. L'élève note ; le labo
     n'écrit jamais à sa place. */
  function notebookHTML() {
    const show = lab.state.showMissing;
    const row = r => {
      const n = state.notes[r];
      const sp = spOf(r);
      const input = k => `<label class="fw-num ${show && n[k] == null ? 'lab-is-missing' : ''}"><span>${LABELS.yearShort(k === 'y0' ? 0 : YEARS)}</span>` +
        `<input type="text" inputmode="numeric" class="fw-num-input" data-num="${r}|${k}" value="${n[k] == null ? '' : n[k]}" maxlength="3" autocomplete="off" spellcheck="false" ` +
        `aria-label="${escapeHtml(LABELS.numAria(many(sp), k === 'y0' ? 0 : YEARS))}"></label>`;
      return `<div class="fw-nb-row">` +
        `<div class="fw-nb-who">${icon(sp)}<strong>${LABELS.graphTitle(many(sp))}</strong></div>` +
        `<div class="fw-nb-nums">${input('y0')}${input('y10')}</div>` +
        `<div class="fw-nb-trends ${show && !n.trend ? 'lab-is-missing' : ''}">${TRENDS.map(t =>
          `<button type="button" class="lab-choice fw-trend is-small ${n.trend === t ? 'is-selected' : ''}" data-trend="${r}" data-val="${t}" aria-pressed="${n.trend === t}">${trendIcon(t)}<span>${LABELS.trendShort[t]}</span></button>`).join('')}</div>` +
        `</div>`;
    };
    return `<h3 class="lab-panel-title">${LABELS.notebookTitle}</h3>` +
      `<p class="fw-nb-hint">${gloss(LABELS.notebookHint)}</p>` +
      `<div class="fw-nb-block ${state.ran1 ? '' : 'is-waiting'}"><p class="fw-nb-title">${LABELS.testTitle[1]}</p>${ROLES.map(row).join('')}</div>` +
      `<div class="fw-nb-block ${state.ran2 ? '' : 'is-waiting'}"><p class="fw-nb-title">${LABELS.testTitle[2]}</p>${row('chain')}</div>`;
  }

  function bindNotebook() {
    const lockFor = r => (running ? LABELS.lockRunning : r === 'chain' ? (state.ran2 ? null : LABELS.lockRun2First) : (state.ran1 ? null : LABELS.lockRun1First));
    $$('[data-trend]').forEach(btn => {
      const r = btn.dataset.trend;
      lab.setLock(btn, lockFor(r), { icon: false });
      btn.addEventListener('click', () => {
        const wasOpen = test2Open();
        state.notes[r].trend = btn.dataset.val;
        afterNote(wasOpen, true);
      });
    });
    $$('[data-num]').forEach(input => {
      const [r, k] = input.dataset.num.split('|');
      lab.setLock(input, lockFor(r));
      const read = final => {
        const raw = input.value.trim();
        const valid = /^\d{1,3}$/.test(raw);
        const wasOpen = test2Open();
        state.notes[r][k] = valid ? Number(raw) : null;
        if (valid) input.closest('.fw-num').classList.remove('lab-is-missing');
        if (final) {
          if (valid) input.value = String(Number(raw));
          input.classList.toggle('is-invalid', !valid && raw !== '');
        }
        afterNote(wasOpen, final);
      };
      input.addEventListener('input', () => { input.classList.remove('is-invalid'); read(false); });
      input.addEventListener('change', () => read(true));
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
    });
  }

  // Après une saisie : le test 2 s'ouvre quand le carnet du test 1 est complet.
  // Une saisie en cours ne redessine pas le carnet (le geste suivant ne se perd pas).
  function afterNote(wasOpen, redraw) {
    if (lab.state.showMissing && stepComplete(2)) lab.state.showMissing = false;
    if (redraw) {
      renderExperiment();
      if (!wasOpen && test2Open()) setCaption(LABELS.captionTest2Open);
    } else updateRunFooter();
    lab.save();
  }

  function defaultCaption() {
    if (state.view === 'model') {
      if (state.model.done) return LABELS.captionModelDone;
      if (state.mode === 'place') return state.model.rowsOk ? LABELS.captionRowsOk : allPlaced() ? LABELS.captionPlaced : LABELS.captionPlace;
      return from ? LABELS.captionFrom(LABELS.species[from].the) : LABELS.captionArrows;
    }
    if (running) return LABELS.captionYear(0);
    if (state.test === 1) return state.ran1 ? LABELS.captionRan1 : LABELS.captionTest1;
    return state.ran2 ? LABELS.captionRan2 : LABELS.captionTest2;
  }

  function setCaption(text, warn) {
    const c = $('[data-caption]');
    if (!c) return;
    c.innerHTML = `<span>${gloss(text)}</span>`;
    c.classList.toggle('is-warning', !!warn);
  }

  // Pied de page : « vers la maladie » (ouverte quand le modèle est juste), puis « vers la conclusion ».
  function renderRunFooter() {
    lab.setFooter(lab.footerInfo('') + `<div class="lab-footer-actions">` +
      `<button type="button" class="lab-btn lab-btn-primary" data-next></button></div>`);
    $('[data-next]').addEventListener('click', () => {
      if (state.view === 'model' && state.model.done && !stepComplete(2)) {
        state.view = 'disease';
        lab.state.showMissing = false;
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
      info.textContent = warn ? lockReason(2) : LABELS.runInfo(placedCount(), run.species.length, notesFilled(), notesTotal());
      info.classList.toggle('is-warning', warn);
    }
    const next = $('[data-next]');
    if (next) {
      const toDisease = state.view === 'model' && !complete;
      next.textContent = `${toDisease ? LABELS.toDisease : LABELS.toConclude} →`;
      const reason = running ? LABELS.lockRunning : toDisease ? (state.model.done ? null : LABELS.lockModel) : (complete ? null : lockReason(2));
      lab.setLock(next, reason, { missing: !running, key: 'next' });
    }
    if (complete !== stepperDone) { stepperDone = complete; lab.renderStepper(); }
  }

  /* ===== Étape 3 : conclusion =====
     À gauche, les résultats : le carnet et les graphiques des deux tests (à
     ouvrir en grand) ; à droite, les réponses aux questions a et b (listes
     dans les phrases), puis le jugement des quatre hypothèses. */
  function conclusionParts() {
    const c = state.concl;
    return {
      a: ROLES.every(r => c[r].trend && c[r].cause),
      b: !!(c.resist && c.reason),
      verdict: NOTE_ROWS.every(r => c.v[r])
    };
  }

  function conclusionsComplete() {
    return Object.values(conclusionParts()).every(Boolean);
  }

  function selectHTML(field, value, options, labelOf, aria, missing) {
    return `<select class="lab-select fw-select ${value ? 'is-filled' : ''} ${missing && !value ? 'lab-is-missing' : ''}" data-c="${field}" aria-label="${escapeHtml(aria)}">` +
      `<option value="" disabled ${value ? '' : 'selected'}>${LABELS.choose}</option>` +
      options.map(x => `<option value="${x}" ${value === x ? 'selected' : ''}>${escapeHtml(labelOf(x))}</option>`).join('') + `</select>`;
  }

  // Les résultats notés par l'élève, en tableau.
  function notesRecapHTML() {
    const n = state.notes;
    const v = x => (x == null ? '—' : x);
    return `<table class="lab-table fw-recap"><thead><tr><th scope="col"></th><th scope="col">${LABELS.yearShort(0)}</th><th scope="col">${LABELS.yearShort(YEARS)}</th><th scope="col">${LABELS.trendHead}</th></tr></thead><tbody>` +
      NOTE_ROWS.map(r => `<tr><th scope="row"><span class="fw-recap-who">${icon(spOf(r))}<span>${rowName(r)}</span></span></th>` +
        `<td>${v(n[r].y0)}</td><td>${v(n[r].y10)}</td><td>${n[r].trend ? `<span class="fw-recap-trend">${trendIcon(n[r].trend)}${LABELS.trendShort[n[r].trend]}</span>` : '—'}</td></tr>`).join('') +
      `</tbody></table>`;
  }

  function miniPanels(test) {
    return `<button type="button" class="fw-zoom" data-zoom="${test}" data-lab-look aria-label="${escapeHtml(LABELS.zoom(LABELS.testTitle[test]))}">` +
      `<span class="fw-zoom-title">${LABELS.testTitle[test]}</span>${panelsHTML(test, { uid: `m${test}`, mode: 'print' })}</button>`;
  }

  function bindZoom() {
    $$('[data-zoom]').forEach(b => b.addEventListener('click', () => {
      const t = Number(b.dataset.zoom);
      lab.openSheet(`<h3 class="lab-sheet-title">${LABELS.testTitle[t]}</h3><div class="fw-zoom-view">${panelsHTML(t, { uid: `z${t}`, mode: 'read' })}</div>` +
        `<p class="lab-sheet-intro">${LABELS.tapPoint}</p>`, LABELS.testTitle[t]);
      bindPoints();
    }));
  }

  function renderConclude() {
    const c = state.concl;
    const parts = conclusionParts();
    const show = lab.state.showMissing;
    const miss = key => (show && !parts[key] ? 'lab-is-missing' : '');
    const sentenceA = r => {
      const sp = spOf(r);
      return `<p class="fw-concl-line">${icon(sp)}<span>${LABELS.conclA(numberOf(sp, true),
        selectHTML(`${r}|trend`, c[r].trend, TRENDS, t => LABELS.trends[t], LABELS.trendAria(many(sp)), show),
        selectHTML(`${r}|cause`, c[r].cause, CAUSES, k => LABELS.causes[k], LABELS.causeAria(many(sp)), show))}</span></p>`;
    };
    const verdict = r => {
      const sp = spOf(r);
      return `<div class="fw-verdict"><span class="fw-verdict-text">${icon(sp)}<span>${LABELS.verdictRow(LABELS.species[sp].name, r === 'chain')}</span>` +
        `${state.hyp[r] ? `<span class="fw-verdict-hyp">${trendIcon(state.hyp[r])}${LABELS.will[state.hyp[r]]}</span>` : ''}</span>` +
        `<span class="fw-verdict-chips">${['confirmed', 'rejected'].map(x => `<button type="button" class="lab-choice fw-chip ${c.v[r] === x ? 'is-selected' : ''}" data-v="${r}" data-val="${x}" aria-pressed="${c.v[r] === x}">${LABELS[x]}</button>`).join('')}</span></div>`;
    };

    lab.body.innerHTML = `<div class="fw-conclude">` +
      `<section class="fw-results">` +
        `<h3 class="lab-panel-title">${LABELS.resultsTitle}</h3>` +
        notesRecapHTML() +
        `<div class="fw-minis">${miniPanels(1)}${miniPanels(2)}</div>` +
      `</section>` +
      `<section class="fw-form">` +
        `<div class="fw-q ${miss('a')}"><p class="fw-q-title"><span class="fw-letter">a</span><span>${gloss(LABELS.questions.a)}</span></p>` +
          ROLES.map(sentenceA).join('') + `</div>` +
        `<div class="fw-q ${miss('b')}"><p class="fw-q-title"><span class="fw-letter">b</span><span>${gloss(LABELS.questions.b)}</span></p>` +
          `<p class="fw-concl-line is-plain"><span>${LABELS.conclB(
            selectHTML('resist', c.resist, RESIST, k => LABELS.resist[k], LABELS.questions.b, show),
            selectHTML('reason', c.reason, REASONS, k => LABELS.reasons[k], LABELS.reasonAria, show))}</span></p></div>` +
        `<div class="fw-q fw-verdicts ${miss('verdict')}"><p class="fw-q-title"><span>${LABELS.verdictTitle}</span></p>` +
          `<div class="fw-verdict-grid">${NOTE_ROWS.map(verdict).join('')}</div></div>` +
      `</section></div>`;

    bindZoom();
    $$('select[data-c]').forEach(sel => sel.addEventListener('change', () => {
      const [f, k] = sel.dataset.c.split('|');
      if (k) c[f][k] = sel.value || null; else c[f] = sel.value || null;
      if (lab.state.showMissing && conclusionsComplete()) lab.state.showMissing = false;
      renderConclude();
    }));
    $$('[data-v]').forEach(btn => btn.addEventListener('click', () => {
      c.v[btn.dataset.v] = btn.dataset.val;
      if (lab.state.showMissing && conclusionsComplete()) lab.state.showMissing = false;
      renderConclude();
    }));

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

  /* ===== Étape 4 : correction ===== */
  const CRITERIA = ['model', 'notes', 'answerA', 'answerB', 'verdicts'];
  const MAX_COMPARES = 3;
  const readOk = (r, k) => {
    const v = state.notes[r][k];
    const right = seriesOf(r)[k === 'y0' ? 0 : YEARS];
    return v != null && Math.abs(v - right) <= AXIS[spOf(r)].g;
  };
  // Hypothèse et résultat de l'élève : sa conclusion (réseau), son carnet (chaîne).
  const resultTrend = r => (r === 'chain' ? state.notes.chain.trend : state.concl[r].trend);

  function evaluate() {
    const c = state.concl;
    const noteMiss = [];
    NOTE_ROWS.forEach(r => {
      ['y0', 'y10'].forEach(k => { if (!readOk(r, k)) noteMiss.push({ r, k }); });
      if (state.notes[r].trend !== truthTrend(r)) noteMiss.push({ r, k: 'trend' });
    });
    const aMiss = ROLES.filter(r => c[r].trend !== truthTrend(r) || c[r].cause !== rightCause(r));
    const should = {};
    NOTE_ROWS.forEach(r => { should[r] = state.hyp[r] && state.hyp[r] === resultTrend(r) ? 'confirmed' : 'rejected'; });
    const vMiss = NOTE_ROWS.filter(r => c.v[r] !== should[r]);
    return {
      noteMiss, aMiss, should, vMiss,
      notesGood: notesTotal() - noteMiss.length,
      model: state.model.compares <= MAX_COMPARES,
      notes: noteMiss.length === 0,
      answerA: aMiss.length === 0,
      answerB: c.resist === 'better' && c.reason === 'other',
      verdicts: vMiss.length === 0
    };
  }

  const said = v => (v == null ? CHECK.nothing : v);
  const rowName = r => LABELS.recapRow(LABELS.species[spOf(r)].name, r === 'chain');

  function noteMissText(m) {
    const n = state.notes[m.r];
    if (m.k === 'trend') return CHECK.trendWrong(rowName(m.r), n.trend ? LABELS.trends[n.trend] : CHECK.nothing, LABELS.trends[truthTrend(m.r)]);
    const year = m.k === 'y0' ? 0 : YEARS;
    return CHECK.readWrong(rowName(m.r), year, said(n[m.k]), seriesOf(m.r)[year]);
  }

  // La bonne réponse a, espèce par espèce, et pourquoi.
  const rightA = r => LABELS.conclA(numberOf(spOf(r), true), LABELS.trends[truthTrend(r)], LABELS.causes[rightCause(r)]);
  const rightB = () => LABELS.conclB(LABELS.resist.better, LABELS.reasons.other);

  // Ce qu'un animal mange d'une plante (« blackberries »), ou l'animal mangé.
  const foodWord = (eater, x) => (isAnimal(x) ? many(x) : LABELS.parts[x][partOf(eater, x)]);

  function whyA(r) {
    const s = run.sp;
    const W = run.species;
    const theList = list => LABELS.list(list.map(many));
    if (r === 'pred') return EXPLAIN.pred(many(s.pred), many(s.sick), LABELS.list(foodsIn(W, s.pred).filter(x => x !== s.sick).map(x => foodWord(s.pred, x))));
    if (r === 'other') {
      if (!s.top) return EXPLAIN.other(many(s.other), theList(predsIn(W, s.sick).filter(x => eatsIn(W, x, s.other))), many(s.sick));
      // Deux maillons plus loin : le prédateur du prédateur se reporte sur l'autre proie.
      return EXPLAIN.other2(many(s.other), many(s.top), many(s.pred), many(s.sick));
    }
    return rightCause(r) === 'none' ? EXPLAIN.same(many(s.rival), many(s.sick))
      : EXPLAIN.rival(many(s.rival), LABELS.list(run.shared.map(x => foodWord(s.rival, x))), many(s.sick));
  }

  // Le modèle juste, mangeur par mangeur : « rabbit and mouse → fox ».
  function rightWebHTML() {
    return `<ul class="fw-plainlist">${run.species.filter(isAnimal).map(b => `<li>${icon(b)}<span>${gloss(EXPLAIN.eats(LABELS.species[b].short, LABELS.list(foodsIn(run.species, b).map(x => LABELS.species[x].short))))}</span></li>`).join('')}</ul>`;
  }

  function criterionDetail(key, ev) {
    const c = state.concl;
    if (key === 'model') {
      return `<p class="${ev.model ? 'fw-ok' : 'fw-ko'}">${ev.model ? CHECK.modelOk(state.model.compares) : CHECK.modelKo(state.model.compares)}</p>` +
        `<p class="fw-muted">${CHECK.modelRule(MAX_COMPARES)}</p>` +
        `<p class="fw-q-head">${LABELS.rightWeb}</p>${rightWebHTML()}` +
        `<p class="fw-muted">${gloss(EXPLAIN.model)}</p>`;
    }
    if (key === 'notes') {
      return `<p>${CHECK.notesScore(ev.notesGood, notesTotal())}</p>` +
        (ev.notes ? `<p class="fw-ok">${CHECK.notesAllGood}</p>` : `<ul class="fw-misslist">${ev.noteMiss.map(m => `<li class="fw-ko">${gloss(noteMissText(m))}</li>`).join('')}</ul>`) +
        `<p class="fw-muted">${gloss(CHECK.readHow)}</p>`;
    }
    if (key === 'answerA') {
      return ROLES.map(r => {
        const ok = !ev.aMiss.includes(r);
        return `<p class="fw-q-head">${icon(spOf(r))}${LABELS.graphTitle(many(spOf(r)))}</p>` +
          (ok ? `<p class="fw-ok">${CHECK.answerOk} ${gloss(rightA(r))}</p>` : `<p class="fw-ko">${CHECK.answerWrong} <strong>${gloss(rightA(r))}</strong></p>`) +
          `<p>${gloss(whyA(r))}</p>`;
      }).join('');
    }
    if (key === 'answerB') {
      return (ev.answerB ? `<p class="fw-ok">${CHECK.answerOk} ${gloss(rightB())}</p>` : `<p class="fw-ko">${CHECK.answerWrong} <strong>${gloss(rightB())}</strong></p>`) +
        `<p>${gloss(EXPLAIN.chain(many(run.sp.pred), many(run.sp.sick)))}</p><p>${gloss(EXPLAIN.web)}</p>`;
    }
    return NOTE_ROWS.map(r => {
      const ok = !ev.vMiss.includes(r);
      const res = resultTrend(r);
      return `<p><strong>${rowName(r)}</strong> · ${CHECK.yourHyp} ${state.hyp[r] ? LABELS.will[state.hyp[r]] : CHECK.nothing} · ` +
        `${CHECK.yourResult} ${res ? LABELS.trends[res] : CHECK.nothing}</p>` +
        `<p class="${ok ? 'fw-ok' : 'fw-ko'}">${ok ? CHECK.verdictOk(c.v[r]) : CHECK.verdictWrong(ev.should[r])}</p>`;
    }).join('') + (NOTE_ROWS.some(r => ev.should[r] === 'rejected') ? `<p class="fw-muted">${CHECK.rejectedNote}</p>` : '');
  }

  function renderCheck() {
    const ev = evaluate();
    const score = CRITERIA.filter(k => ev[k]).length;
    const rows = CRITERIA.map(k => `<button type="button" class="fw-crit ${ev[k] ? 'is-ok' : 'is-ko'} ${state.selected === k ? 'is-selected' : ''}" data-crit="${k}">` +
      `<span class="fw-crit-text"><strong>${LABELS.criteria[k]}</strong><small>${LABELS.criteriaSub[k]}</small></span>` +
      `<span class="fw-crit-mark" aria-label="${ev[k] ? LABELS.markCorrect : LABELS.markIncorrect}">${ev[k] ? '✓' : '✗'}</span></button>`).join('');

    lab.body.innerHTML = `<div class="fw-check">` +
      `<div class="fw-check-left">` +
        `<div class="lab-score"><span class="lab-score-num">${score}<small> / ${CRITERIA.length}</small></span><span class="lab-score-label">${LABELS.scoreLabel}</span></div>` +
        `<div class="fw-crit-list">${rows}</div>` +
        `<div class="fw-reminder">${questionsHTML()}</div>` +
      `</div>` +
      `<div class="fw-check-detail" aria-live="polite"><h3>${LABELS.criteria[state.selected]}</h3>${criterionDetail(state.selected, ev)}</div>` +
      `</div>`;

    $$('[data-crit]').forEach(btn => btn.addEventListener('click', () => {
      state.selected = btn.dataset.crit;
      renderCheck();
    }));
    lab.fillSpace($('.fw-check-detail'));
    lab.checkFooter();
  }

  /* ===== Rapport imprimable : contenu des 7 sections de la fiche outil FO3
     (en-tête, numérotation et mise en page : cadre commun) =====
     Les erreurs passent par mark() (lab-engine.js) : lectures et allures
     du carnet, réponses, jugements. Le réseau (le modèle de l'élève, juste à
     la fin) et les graphiques (titre, axes, unités : FO5c) sont dans les
     résultats. */
  function webSVG(uid) {
    const pos = state.model.pos;
    let out = `<rect x="0" y="0" width="${BOARD_W}" height="${BOARD_H}" fill="#ffffff"/>` + arrowsSVG(pos, state.model.arrows, uid, { width: 1.6 });
    run.species.forEach(sp => {
      if (!pos[sp]) return;
      const x = slotX(pos[sp].col), y = TOKEN_Y[pos[sp].row];
      out += `<rect x="${x}" y="${y}" width="${TOKEN_W}" height="${TOKEN_H}" rx="10" fill="#ffffff" stroke="#8d97a3" stroke-width="1.4"/>` +
        `<g transform="translate(${x + 8} ${y + 11}) scale(0.9)">${ICONS[sp]}</g>` +
        `<text x="${x + 50}" y="${y + 34}" class="fw-web-name">${escapeHtml(LABELS.species[sp].name)}</text>`;
    });
    return `<svg class="fw-report-web" viewBox="0 0 ${BOARD_W} ${BOARD_H}" role="img" aria-label="${escapeHtml(LABELS.webTitle)}">${out}</svg>`;
  }

  function buildReport(mark) {
    const R = LABELS.report;
    const ev = evaluate();
    const c = state.concl;
    const n = state.notes;
    const missOf = (r, k) => ev.noteMiss.find(m => m.r === r && m.k === k);
    const cell = (r, k) => {
      const v = k === 'trend' ? (n[r].trend ? LABELS.trendShort[n[r].trend] : '—') : (n[r][k] == null ? '—' : String(n[r][k]));
      const m = missOf(r, k);
      return m ? mark(v, plainText(noteMissText(m)), { box: true }) : v;
    };
    const table = `<table class="fw-report-table"><caption>${R.notesCaption}</caption>` +
      `<tr><th></th><th>${LABELS.yearShort(0)}</th><th>${LABELS.yearShort(YEARS)}</th><th>${LABELS.trendHead}</th></tr>` +
      NOTE_ROWS.map(r => `<tr><th>${rowName(r)}</th><td>${cell(r, 'y0')}</td><td>${cell(r, 'y10')}</td><td>${cell(r, 'trend')}</td></tr>`).join('') + `</table>`;
    const graphs = [1, 2].map(t => `<div class="fw-report-graph"><p class="fw-report-graph-title">${LABELS.testTitle[t]}</p>${panelsHTML(t, { uid: `r${t}`, mode: 'print' })}</div>`).join('');
    const web = `<div class="fw-report-graph"><p class="fw-report-graph-title">${LABELS.webTitle}</p>${webSVG('rw')}</div>`;

    // Interprétation : ce que montrent les graphiques, avec les nombres de l'élève.
    const interp = NOTE_ROWS.map(r => `<li>${R.change(rowName(r), n[r].y0 == null ? '—' : n[r].y0, n[r].y10 == null ? '—' : n[r].y10)}</li>`).join('');

    // Conclusion : les phrases de l'élève, chaque choix faux marqué à sa place.
    const word = (text, ok, note) => (ok ? text : mark(text, note));
    const linesA = ROLES.map(r => {
      const note = `${CHECK.answerWrong} ${plainText(rightA(r))} ${plainText(whyA(r))}`;
      const t = c[r].trend ? word(LABELS.trends[c[r].trend], c[r].trend === truthTrend(r), note) : '—';
      const k = c[r].cause ? word(LABELS.causes[c[r].cause], c[r].cause === rightCause(r), note) : '—';
      return `<p>${LABELS.conclA(numberOf(spOf(r), true), t, k)}</p>`;
    }).join('');
    const noteB = `${CHECK.answerWrong} ${plainText(rightB())} ${plainText(EXPLAIN.web)}`;
    const lineB = `<p>${LABELS.conclB(c.resist ? word(LABELS.resist[c.resist], c.resist === 'better', noteB) : '—',
      c.reason ? word(LABELS.reasons[c.reason], c.reason === 'other', noteB) : '—')}</p>`;
    const verdicts = `<ul>${NOTE_ROWS.map(r => `<li>${R.verdict(rowName(r),
      c.v[r] ? word(LABELS[c.v[r]], c.v[r] === ev.should[r], CHECK.verdictWrong(ev.should[r])) : '—')}</li>`).join('')}</ul>`;

    const hyp = `<ol type="a"><li><ul>${ROLES.map(r => `<li>${LABELS.hypText(numberOf(spOf(r), false), state.hyp[r] ? LABELS.will[state.hyp[r]] : '—')}</li>`).join('')}</ul></li>` +
      `<li>${LABELS.hypChainText(chainText(), numberOf(run.sp.pred, false), state.hyp.chain ? LABELS.will[state.hyp.chain] : '—')}</li></ol>` +
      (state.because.trim() ? `<p>${R.because}: ${escapeHtml(state.because.trim())}</p>` : '');

    const modelText = R.model(state.model.compares);
    const modelLine = `<p>${R.rows(state.model.rowChecks)} ${ev.model ? modelText : mark(modelText, `${CHECK.modelKo(state.model.compares)} ${CHECK.modelRule(MAX_COMPARES)}`)}</p>`;
    const correction = CRITERIA.map(k => `<tr><th>${LABELS.criteria[k]}</th><td class="${ev[k] ? 'ok' : 'ko'}">${ev[k] ? '✓' : '✗'}</td></tr>`).join('');

    return {
      title: R.title,
      sections: [
        `<p><strong>${LABELS.questions.main}</strong></p><ol type="a"><li>${LABELS.questions.a}</li><li>${LABELS.questions.b}</li></ol>`,
        hyp,
        `<p>${R.materials}</p>`,
        `<ol>${R.procedure(many(run.sp.sick), chainText()).map(s => `<li>${s}</li>`).join('')}</ol>`,
        `<div class="fw-report-results">${web}${modelLine}${table}</div><div class="fw-report-graphs">${graphs}</div>`,
        `<ul>${interp}</ul>`,
        linesA + lineB + verdicts
      ],
      correction: `<p><strong>${R.score(CRITERIA.filter(k => ev[k]).length)}</strong></p><table class="fw-report-corr">${correction}</table>`
    };
  }

  const plainText = text => String(text).replace(/\[([^\]|]+)(?:\|[^\]]+)?\]/g, '$1');

  lab = LabEngine.create({
    id: 'foodweb',
    title: LABELS.title,
    glossary: GLOSSARY,
    reset,
    stepComplete,
    lockReason,
    isStarted: () => !!(NOTE_ROWS.some(r => state.hyp[r]) || placedCount()),
    render: { 1: renderPredict, 2: renderExperiment, 3: renderConclude, 4: renderCheck },
    report: buildReport,
    // 3 : réserve de 19 êtres vivants (12 par partie), rangées vérifiées avant les flèches.
    version: 3,
    save: () => ({ run, state }),
    // Ce qui ne vaut que pendant un geste ou un modèle qui tourne repart à zéro.
    load(data) {
      const r = data.run, s = data.state;
      if (!r || !r.sp || !Array.isArray(r.species) || r.species.length !== 12 || !Array.isArray(r.arrows) || !r.causes || !Array.isArray(r.shared) ||
        !r.web || !r.chain || !Array.isArray(r.web.pred) || r.web.pred.length !== YEARS + 1 ||
        !s || !s.hyp || !s.model || !s.model.pos || !Array.isArray(s.model.arrows) || !s.notes || !s.concl || !s.concl.v ||
        !Array.isArray(s.order) || s.order.length !== r.species.length) throw new Error('labProgress');
      run = r;
      state = s;
      from = null;
      issuesOn = false;
      shownIssues = null;
      running = false;
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
          sick: run.sp.sick, predator: run.sp.pred, rowChecks: state.model.rowChecks, compares: state.model.compares,
          notesRight: ev.notesGood, notes: notesTotal(),
          hypotheses: NOTE_ROWS.map(r => state.hyp[r] || '-').join('-')
        }
      };
    }
  });
})();
