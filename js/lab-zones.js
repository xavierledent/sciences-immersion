/* ===== Labo virtuel « Inside two ecosystems » (bio1) : pourquoi pas les mêmes êtres vivants ? =====

   Version virtuelle de la Mission 1 de la sortie de terrain (« FIELD TRIP –
   Investigating our Local Woods ») : deux zones à 50 m l'une de l'autre, où
   l'on relève la température, la lumière, l'humidité de l'air et celle du
   sol, puis où l'on identifie et compte les êtres vivants d'un carré posé au
   sol. Le cadre commun (modale, barre d'étapes, verrous, traduction, rapport
   imprimé) est dans lab-engine.js. Simulation commune aux deux filières ;
   ses textes sont dans le dossier du chapitre, un fichier par langue
   (lab-zones.en.js, lab-zones.nl.js). Ordre de chargement : moteur, textes,
   ce fichier.

   Tirés au sort à chaque nouveau labo : deux milieux parmi quatre (prairie,
   lisière du bois, ombre profonde sous les arbres, bord de l'étang ; jamais
   l'étang avec l'ombre profonde, où lumière et humidité ne vont plus dans le
   même sens), les lettres A et B, les valeurs mesurées, les espèces du carré
   (au moins deux en commun aux deux zones, plus ou moins abondantes selon la
   lumière et l'humidité qu'elles aiment, et d'autres propres à un milieu),
   leur nombre d'individus et leur place. La zone la plus riche en espèces
   change d'un tirage à l'autre ; mousses et fougères sont toujours plus
   nombreuses dans la zone la plus humide, fleurs sauvages et insectes volants
   dans la plus lumineuse.

   Déroulé :
     1. Predict    — quelle zone est la plus chaude, la plus lumineuse, la
                     plus humide, où trouver le plus de mousses et de fougères
                     (+ « because » libre)
     2. Experiment — sur le terrain : thermomètre, luxmètre, hygromètre (un
                     par zone ; seul le dernier instrument pris reste affiché,
                     dans les deux zones), valeur à recopier dans la fiche ;
                     main (sol sec, humide ou mouillé) ; carré de comptage vu
                     de dessus : toucher un être vivant demande son nom (un
                     indice si l'élève se trompe), puis entoure tous les
                     individus de son espèce, que l'élève compte et note.
                     Enfin l'histogramme (fiche outil FO5b) : un bâton par
                     espèce et par zone, à monter jusqu'au nombre noté
     3. Conclude   — les questions de la fiche de terrain : quelle zone est la
                     plus chaude…, où sont mousses et fougères, fleurs et
                     insectes volants, la plus grande biodiversité, le facteur
                     clé, la réponse à la question, l'hypothèse
     4. Check      — 5 critères : mesures, comptage, histogramme, conclusion,
                     hypothèse ; rapport (FO3) */

(function () {
  'use strict';

  const { escapeHtml, mulberry32, seedFrom, pick, shuffle, ease } = LabEngine.util;

  // Cadre commun, créé en fin de fichier (LabEngine.create).
  let lab;
  const $ = sel => lab.$(sel);
  const $$ = sel => lab.$$(sel);
  const gloss = text => lab.gloss(text);
  const plain = text => String(text).replace(/\[([^\]|]+)(?:\|[^\]]+)?\]/g, '$1');
  const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

  const ZONES = ['A', 'B'];

  /* ===== Textes =====
     Dans le dossier du chapitre, un fichier par langue (lab-zones.en.js,
     lab-zones.nl.js), chargé avant celui-ci : libellés, lexique, nom et
     description des espèces (SPECIES), morceaux de phrase (PHRASE),
     explications et correction. La température s'affiche par LABELS.num
     (séparateur décimal de la langue). */
  const {
    labels: LABELS, glossary: GLOSSARY, species: SPECIES, phrase: PHRASE, explain: EXPLAIN, check: CHECK
  } = LabEngine.textFor('zones');
  const num = LABELS.num;

  /* ===== Ce qu'on trouve dans un carré =====
     r : rayon du dessin (unités du carré, 400 pour 1 m) ; la zone à toucher
     fait au moins HIT_MIN. layer : ordre de dessin (plantes, champignons,
     fleurs, animaux). move : les animaux
     bougent un peu. Dessins vus de dessus, sauf ceux qui ne se reconnaîtraient
     pas ainsi (champignon, escargot, iris), vus de trois quarts. */
  const HIT_MIN = 13;

  function toothedLeaf(len, w, n, fill, stroke) {
    const right = [], left = [];
    for (let i = 1; i < n; i++) {
      const t = i / n, y = -len * t, half = w * Math.sin(Math.PI * Math.pow(t, 0.75)), tooth = i % 2 ? 1.3 : 0;
      right.push(`${(half + tooth).toFixed(1)} ${y.toFixed(1)}`);
      left.unshift(`${(-half - tooth).toFixed(1)} ${y.toFixed(1)}`);
    }
    return `<path d="M0 0 L${right.join(' L')} L0 ${-len} L${left.join(' L')} Z" fill="${fill}" stroke="${stroke}" stroke-width=".6" stroke-linejoin="round"/>` +
      `<path d="M0 0 L0 ${-len + 2}" stroke="${stroke}" stroke-width=".7"/>`;
  }

  const IVY_LEAF = 'M0 0 C-3 -1 -7 -1 -9 -4 C-7 -5 -6 -6 -6 -8 C-4 -8 -3 -9 -2 -11 C-1 -12 0 -14 0 -15 C0 -14 1 -12 2 -11 C3 -9 4 -8 6 -8 C6 -6 7 -5 9 -4 C7 -1 3 -1 0 0 Z';

  function frond(len) {
    let s = `<path d="M0 0 L0 ${-len}" stroke="#2f6a26" stroke-width="1.2"/>`;
    const n = 9;
    for (let k = 1; k <= n; k++) {
      const y = -len * k / (n + 1), w = 7 * (1 - k / (n + 2)), cx = w / 2 + 0.6;
      s += `<ellipse cx="${cx.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(w / 2).toFixed(1)}" ry="1.7" fill="#4f9a3a" transform="rotate(-25 ${cx.toFixed(1)} ${y.toFixed(1)})"/>` +
        `<ellipse cx="${(-cx).toFixed(1)}" cy="${y.toFixed(1)}" rx="${(w / 2).toFixed(1)}" ry="1.7" fill="#5aa843" transform="rotate(25 ${(-cx).toFixed(1)} ${y.toFixed(1)})"/>`;
    }
    return s;
  }

  const T = {
    grass: { r: 20, layer: 0,
      draw: r => {
        let s = '<ellipse rx="9" ry="9" fill="#000" opacity=".08"/>';
        for (let i = 0; i < 11; i++) {
          const a = (i / 11) * Math.PI * 2 + r() * 0.5, len = 13 + r() * 7, bend = (r() - 0.5) * 9;
          const x = Math.cos(a) * len, y = Math.sin(a) * len;
          const cx = Math.cos(a) * len * 0.5 - Math.sin(a) * bend, cy = Math.sin(a) * len * 0.5 + Math.cos(a) * bend;
          s += `<path d="M0 0 Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}" stroke="${i % 3 ? '#3f7f2a' : '#6cae3e'}" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;
        }
        return s + '<circle r="2.6" fill="#356b23"/>';
      } },
    moss: { r: 17, layer: 0,
      draw: r => {
        let s = '<path d="M-15 2 C-16 -8 -6 -15 2 -13 C11 -14 17 -5 15 3 C16 11 6 16 -2 14 C-11 15 -16 9 -15 2 Z" fill="#3f7a26" stroke="#2f5f1c" stroke-width=".8"/>';
        for (let i = 0; i < 26; i++) {
          const a = r() * 6.283, d = r() * 11.5;
          s += `<circle cx="${(Math.cos(a) * d).toFixed(1)}" cy="${(Math.sin(a) * d).toFixed(1)}" r="${(1.1 + r() * 1.4).toFixed(1)}" fill="${i % 2 ? '#6aae3a' : '#88c652'}"/>`;
        }
        return s;
      } },
    fern: { r: 23, layer: 0,
      draw: r => {
        const base = r() * 60;
        return [0, 120, 240].map(a => `<g transform="rotate(${(a + base).toFixed(0)})">${frond(22)}</g>`).join('') + '<circle r="2.4" fill="#5c4630"/>';
      } },
    ivy: { r: 17, layer: 0,
      draw: () => '<path d="M-14 10 C-6 4 2 2 12 -10" stroke="#5a4a2a" stroke-width="1.3" fill="none"/>' +
        [[-12, 9, -60, 0.9], [-3, 4, 20, 1], [5, -2, -40, 0.85], [12, -10, 30, 0.75]].map(([x, y, a, s]) =>
          `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path d="${IVY_LEAF}" fill="#24502a" stroke="#173a1c" stroke-width=".7"/><path d="M0 0 L0 -13 M0 -6 L-6 -6 M0 -6 L6 -6 M0 -3 L-7 -3 M0 -3 L7 -3" stroke="#7fa77f" stroke-width=".6" fill="none"/></g>`).join('') },
    bramble: { r: 21, layer: 0,
      draw: () => '<path d="M-19 9 C-11 -15 9 -17 19 5" fill="none" stroke="#7a3b46" stroke-width="2.3" stroke-linecap="round"/>' +
        [[-15, 0, -60], [-7, -9, -25], [3, -11, 10], [12, -6, 45]].map(([x, y, a]) => `<path d="M${x} ${y} l-2.5 -2.5" transform="rotate(${a} ${x} ${y})" stroke="#7a3b46" stroke-width="1.1"/>`).join('') +
        [[-12, -4, -30], [8, -8, 25]].map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})">` +
          [-35, 0, 35].map(b => `<ellipse cx="0" cy="-6" rx="3.4" ry="5.6" fill="#3d7a36" stroke="#2a5a26" stroke-width=".6" transform="rotate(${b})"/>`).join('') + '</g>').join('') +
        [[15, 7], [17, 10], [13, 10], [15, 13], [18, 6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#2b1830"/>`).join('') +
        '<circle cx="14.4" cy="6.4" r=".6" fill="#ffffff" opacity=".6"/>' },
    nettle: { r: 18, layer: 0,
      draw: () => [0, 90, 180, 270].map(a => `<g transform="rotate(${a})">${toothedLeaf(16, 5.6, 10, '#4c8a3a', '#2f6328')}</g>`).join('') +
        [45, 135, 225, 315].map(a => `<g transform="rotate(${a})">${toothedLeaf(9, 3.4, 6, '#5d9c47', '#2f6328')}</g>`).join('') + '<circle r="2" fill="#3c7330"/>' },
    rush: { r: 19, layer: 0,
      draw: r => {
        let s = '<ellipse rx="7" ry="7" fill="#000" opacity=".12"/>';
        for (let i = 0; i < 16; i++) {
          const a = r() * 6.283, len = 9 + r() * 10;
          s += `<path d="M0 0 L${(Math.cos(a) * len).toFixed(1)} ${(Math.sin(a) * len).toFixed(1)}" stroke="${i % 2 ? '#2f5d22' : '#4a7d34'}" stroke-width="1.8" stroke-linecap="round"/>`;
          if (i % 5 === 0) s += `<circle cx="${(Math.cos(a) * len * 0.75).toFixed(1)}" cy="${(Math.sin(a) * len * 0.75).toFixed(1)}" r="1.9" fill="#8a6a3a"/>`;
        }
        return s;
      } },
    iris: { r: 19, layer: 0,
      draw: () => [-38, -19, 0, 19, 38].map(a => `<path d="M0 12 C-2.6 2 -2.2 -8 0 -17 C2.2 -8 2.6 2 0 12 Z" fill="${a % 2 ? '#3f7d36' : '#4f9442'}" transform="rotate(${a} 0 12)"/>`).join('') +
        '<g transform="translate(2 -11)">' + [0, 120, 240].map(a => `<ellipse cx="0" cy="-4.2" rx="3.4" ry="5" fill="#f3c623" stroke="#c99a12" stroke-width=".6" transform="rotate(${a})"/>`).join('') + '<circle r="1.8" fill="#d98a0b"/></g>' },
    mushroom: { r: 13, layer: 1,
      draw: () => '<ellipse cx="0" cy="10" rx="12" ry="2.5" fill="#000" opacity=".18"/>' +
        '<path d="M2.5 1 L2 10 L7 10 L6.5 1 Z" fill="#efe6d2"/><path d="M-5.5 4 L-6 10 L-2.5 10 L-3 4 Z" fill="#efe6d2"/>' +
        '<path d="M-5 2 C-5 -9 14 -9 14 2 Z" fill="#a8622f"/><ellipse cx="4.5" cy="2" rx="9.5" ry="1.8" fill="#e2d2b3"/><ellipse cx="1.5" cy="-4" rx="2.4" ry="1.3" fill="#d39a66" opacity=".7"/>' +
        '<path d="M-11 5 C-11 -2 1 -2 1 5 Z" fill="#b36b33"/><ellipse cx="-5" cy="5" rx="6" ry="1.3" fill="#e2d2b3"/>' },
    daisy: { r: 11, layer: 2,
      draw: () => '<g fill="#5c9a3c">' + [20, 140, 260].map(a => `<ellipse cx="0" cy="-8" rx="3" ry="5.5" transform="rotate(${a})"/>`).join('') + '</g>' +
        Array.from({ length: 12 }, (_, i) => `<ellipse cx="0" cy="-5" rx="1.7" ry="4" fill="#ffffff" stroke="#cfcfcf" stroke-width=".4" transform="rotate(${i * 30})"/>`).join('') +
        '<circle r="3.1" fill="#f6c429"/>' },
    dandelion: { r: 14, layer: 2,
      draw: () => [0, 72, 144, 216, 288].map(a => `<path d="M0 0 L3 -5 L1 -6 L4 -10 L1.5 -11 L3 -15 L0 -17 L-3 -15 L-1.5 -11 L-4 -10 L-1 -6 L-3 -5 Z" fill="#4f8f33" transform="rotate(${a + 36})"/>`).join('') +
        '<circle r="6.6" fill="#f5b800"/>' + Array.from({ length: 18 }, (_, i) => {
          const a = i * 20 * Math.PI / 180;
          return `<path d="M${(Math.cos(a) * 2.5).toFixed(1)} ${(Math.sin(a) * 2.5).toFixed(1)} L${(Math.cos(a) * 6.6).toFixed(1)} ${(Math.sin(a) * 6.6).toFixed(1)}" stroke="#ffd84a" stroke-width=".9"/>`;
        }).join('') + '<circle r="2.2" fill="#e09a00"/>' },
    buttercup: { r: 11, layer: 2,
      draw: () => '<path d="M-1 3 L-8 9" stroke="#4f8f33" stroke-width="1.4"/><path d="M-8 9 l-4.5 -1 l1.2 4.5 z" fill="#4f8f33"/>' +
        [0, 72, 144, 216, 288].map(a => `<circle cx="0" cy="-4.4" r="3.7" fill="#ffd21f" stroke="#d9a400" stroke-width=".5" transform="rotate(${a})"/>`).join('') +
        '<circle r="2.2" fill="#b8a838"/><ellipse cx="-1.4" cy="-6" rx="1.2" ry=".7" fill="#ffffff" opacity=".7"/>' },
    butterfly: { r: 13, layer: 3,
      draw: () => '<g><g>' +
        '<path d="M0 0 C-4 -9 -13 -12 -12.5 -3 C-12 1 -5 1 0 0 Z" fill="#f08a24" stroke="#3a2a1a" stroke-width=".9"/><path d="M0 0 C-3 5 -10 10 -11 4 C-11 1 -5 0 0 0 Z" fill="#e2671c" stroke="#3a2a1a" stroke-width=".9"/>' +
        '<g transform="scale(-1 1)"><path d="M0 0 C-4 -9 -13 -12 -12.5 -3 C-12 1 -5 1 0 0 Z" fill="#f08a24" stroke="#3a2a1a" stroke-width=".9"/><path d="M0 0 C-3 5 -10 10 -11 4 C-11 1 -5 0 0 0 Z" fill="#e2671c" stroke="#3a2a1a" stroke-width=".9"/></g>' +
        '<circle cx="-8" cy="-5" r="1.5" fill="#ffffff"/><circle cx="8" cy="-5" r="1.5" fill="#ffffff"/><circle cx="-7" cy="4" r="1" fill="#2b211a"/><circle cx="7" cy="4" r="1" fill="#2b211a"/>' +
        '<animateTransform attributeName="transform" type="scale" values="1 1;0.55 1;1 1" dur="0.9s" repeatCount="indefinite"/></g>' +
        '<ellipse rx="1.4" ry="6.5" fill="#2b211a"/><path d="M-.6 -6 L-3 -10 M.6 -6 L3 -10" stroke="#2b211a" stroke-width=".7"/></g>' },
    bee: { r: 10, layer: 3, move: 'buzz',
      draw: () => '<ellipse cx="-3" cy="-5" rx="3.2" ry="5.4" fill="#e8f3fb" stroke="#9cc3e3" stroke-width=".6" transform="rotate(-35 -3 -5)" opacity=".95"/>' +
        '<ellipse cx="3" cy="-5" rx="3.2" ry="5.4" fill="#e8f3fb" stroke="#9cc3e3" stroke-width=".6" transform="rotate(35 3 -5)" opacity=".95"/>' +
        '<ellipse rx="4" ry="7" fill="#f5b72a"/><path d="M-3.8 -1.5 H3.8 M-3.4 2 H3.4 M-2.4 5 H2.4" stroke="#2b2420" stroke-width="1.7"/><circle cy="-7.6" r="2.6" fill="#2b2420"/>' },
    dragonfly: { r: 16, layer: 3,
      draw: () => [[-4, -9, -20], [-4, 9, 20], [3, -8, 15], [3, 8, -15]].map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="2.8" ry="9" fill="#dcefff" fill-opacity=".75" stroke="#7fb0d8" stroke-width=".7" transform="rotate(${a} ${x} ${y})"/>`).join('') +
        '<path d="M-16 0 L8 0" stroke="#2c74b3" stroke-width="2.6" stroke-linecap="round"/><circle cx="10" cy="0" r="3" fill="#1f5c91"/><circle cx="11" cy="-1.6" r="1.1" fill="#9fd0f3"/><circle cx="11" cy="1.6" r="1.1" fill="#9fd0f3"/>' },
    grasshopper: { r: 12, layer: 3,
      draw: () => '<path d="M-1 2 L-6 7 L-12 6 M-1 -2 L-6 -7 L-12 -6" stroke="#3f7a26" stroke-width="1.7" fill="none" stroke-linejoin="round"/>' +
        '<path d="M3 2 L4 6 M3 -2 L4 -6 M6 1.5 L8 5 M6 -1.5 L8 -5" stroke="#3f7a26" stroke-width=".9"/>' +
        '<ellipse rx="9" ry="2.8" fill="#6aa23a"/><circle cx="9" r="2.8" fill="#5c9230"/><circle cx="10" cy="-1.2" r=".8" fill="#1f2a14"/>' +
        '<path d="M11 -1 C14 -4 16 -6 18 -6 M11 1 C14 4 16 6 18 6" stroke="#3f7a26" stroke-width=".6" fill="none"/>' },
    ant: { r: 8, layer: 3, move: 'run',
      draw: () => '<g transform="scale(1.35)"><path d="M1.6 0 L-.5 -4 M1.6 0 L3.8 -4.2 M1.6 0 L1.6 -4.6 M1.6 0 L-.5 4 M1.6 0 L3.8 4.2 M1.6 0 L1.6 4.6" stroke="#1f1c1a" stroke-width=".6"/><circle cx="-3.2" r="2.6" fill="#1f1c1a"/><circle cx="1.6" r="1.4" fill="#1f1c1a"/><circle cx="5.2" r="1.8" fill="#1f1c1a"/></g>' },
    woodlouse: { r: 10, layer: 3, move: 'walk',
      draw: () => '<g transform="scale(1.15)"><path d="M7.5 -2 L11.5 -5 M7.5 2 L11.5 5" stroke="#4d5257" stroke-width=".8"/><ellipse rx="8.6" ry="5.5" fill="#6c7177"/>' +
        [-5, -2.6, -0.2, 2.2, 4.6].map(i => `<path d="M${i} -5.2 Q${i + 0.7} 0 ${i} 5.2" stroke="#53585e" stroke-width=".75" fill="none"/>`).join('') + '<ellipse cx="-1" cy="-1.8" rx="6" ry="1.6" fill="#9a9fa5" opacity=".55"/></g>' },
    snail: { r: 12, layer: 3, move: 'slow',
      draw: () => '<path d="M-12 6 C-6 3.5 5 3.5 10 5.5 L12.5 3.5 L10 1 C8 2.5 4 3 1 3 Z" fill="#c4ad90" stroke="#9c8569" stroke-width=".6"/>' +
        '<path d="M10.5 2 L13 -4 M9 2.4 L10 -4" stroke="#9c8569" stroke-width="1"/><circle cx="13" cy="-4.2" r="1" fill="#5e4a36"/><circle cx="10" cy="-4.2" r=".9" fill="#5e4a36"/>' +
        '<circle cx="-1" cy="-1" r="7" fill="#a5672e" stroke="#6e4220" stroke-width=".9"/><path d="M-1 -1 m-3 0 a3 3 0 1 1 3 3 a4.8 4.8 0 1 1 -4.8 -4.8" fill="none" stroke="#6e4220" stroke-width=".9"/>' +
        '<ellipse cx="-3.5" cy="-4" rx="2" ry="1" fill="#ffffff" opacity=".3"/>' },
    frog: { r: 14, layer: 3,
      draw: () => '<path d="M-5 5 L-11 9 L-13 5 M-11 9 L-9 13 M5 5 L11 9 L13 5 M11 9 L9 13 M-5 -3 L-10 -5 L-11 -8 M5 -3 L10 -5 L11 -8" stroke="#3f8233" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<ellipse cy="1" rx="7.5" ry="9.5" fill="#5aa04a"/><circle cx="-4" cy="-7" r="2.8" fill="#5aa04a"/><circle cx="4" cy="-7" r="2.8" fill="#5aa04a"/>' +
        '<circle cx="-4" cy="-7.4" r="1.4" fill="#1d2a17"/><circle cx="4" cy="-7.4" r="1.4" fill="#1d2a17"/><circle cx="-2" cy="3" r="1.4" fill="#3f8233"/><circle cx="3" cy="5" r="1.1" fill="#3f8233"/><circle cx="1" cy="-1" r="1" fill="#3f8233"/>' },
  };

  const MOVES = {
    run: '<animateTransform attributeName="transform" type="translate" values="0 0;3 -1.5;6 0;3 1.5;0 0" dur="1.3s" repeatCount="indefinite"/>',
    walk: '<animateTransform attributeName="transform" type="translate" values="0 0;2 -1;4 0;2 1;0 0" dur="2.4s" repeatCount="indefinite"/>',
    slow: '<animateTransform attributeName="transform" type="translate" values="0 0;2 0;0 0" dur="4s" repeatCount="indefinite"/>',
    buzz: '<animateTransform attributeName="transform" type="translate" values="0 0;1 -1;-1 0;0 1;0 0" dur="0.5s" repeatCount="indefinite"/>'
  };

  const hitR = t => Math.max(HIT_MIN, T[t].r);

  /* Identification : les noms proposés (le trait qui reconnaît chaque
     espèce, écrit sous son nom, est dans SPECIES), le bon en premier (mélangés à l'affichage,
     toujours dans le même ordre pour une espèce). Les noms proposés se
     ressemblent : fleurs entre elles, petites bêtes entre elles. */
  const IDENT = {
    grass: { choices: ['grass', 'rush', 'fern'] },
    moss: { choices: ['moss', 'grass', 'fern'] },
    fern: { choices: ['fern', 'nettle', 'moss'] },
    ivy: { choices: ['ivy', 'nettle', 'bramble'] },
    bramble: { choices: ['bramble', 'ivy', 'nettle'] },
    nettle: { choices: ['nettle', 'fern', 'ivy'] },
    rush: { choices: ['rush', 'grass', 'iris'] },
    iris: { choices: ['iris', 'buttercup', 'rush'] },
    mushroom: { choices: ['mushroom', 'snail', 'moss'] },
    daisy: { choices: ['daisy', 'dandelion', 'buttercup'] },
    dandelion: { choices: ['dandelion', 'daisy', 'buttercup'] },
    buttercup: { choices: ['buttercup', 'dandelion', 'daisy'] },
    butterfly: { choices: ['butterfly', 'bee', 'dragonfly'] },
    bee: { choices: ['bee', 'butterfly', 'ant'] },
    dragonfly: { choices: ['dragonfly', 'butterfly', 'bee'] },
    grasshopper: { choices: ['grasshopper', 'ant', 'woodlouse'] },
    ant: { choices: ['ant', 'woodlouse', 'bee'] },
    woodlouse: { choices: ['woodlouse', 'ant', 'snail'] },
    snail: { choices: ['snail', 'woodlouse', 'frog'] },
    frog: { choices: ['frog', 'snail', 'grasshopper'] }
  };

  // Groupes de la fiche de terrain (« Species location »).
  const MOSS_FERN = ['moss', 'fern'];
  const BLOOM = ['daisy', 'dandelion', 'buttercup', 'iris', 'butterfly', 'bee', 'dragonfly'];

  /* ===== Les milieux =====
     rank : du plus ensoleillé au plus ombragé. Les plages de valeurs ne se
     recouvrent pas : dans chaque paire tirée, la zone la plus ensoleillée est
     aussi la plus chaude et la plus sèche. Lumière en lux arrondie comme sur
     un luxmètre (centaines au-delà de 10 000). */
  const HABITATS = {
    meadow: { rank: 0, temp: [23, 26], lux: [45000, 80000], air: [38, 50], soil: 'dry' },
    edge: { rank: 1, temp: [19.5, 21.5], lux: [18000, 32000], air: [55, 64], soil: 'dry' },
    pond: { rank: 2, temp: [16.5, 18], lux: [7000, 12000], air: [84, 94], soil: 'wet' },
    shade: { rank: 3, temp: [13, 15.5], lux: [600, 2500], air: [72, 82], soil: 'moist' }
  };
  const PAIRS = [['meadow', 'edge'], ['meadow', 'shade'], ['meadow', 'pond'], ['edge', 'shade'], ['edge', 'pond']];

  /* Nombre d'individus de chaque espèce dans le carré de chaque milieu
     [min, max] ; absente du milieu si non citée. Beaucoup d'espèces vivent
     dans plusieurs milieux, plus ou moins nombreuses selon la lumière et
     l'humidité qu'elles aiment (beaucoup d'herbe en prairie, de la mousse sous
     les arbres) ; d'autres ne vivent que dans un milieu. 10 au plus : l'élève
     compte à l'œil. */
  const ABUNDANCE = {
    grass: { meadow: [7, 10], edge: [4, 7], pond: [2, 4], shade: [1, 1] },
    moss: { meadow: [1, 1], edge: [1, 3], pond: [4, 7], shade: [6, 10] },
    fern: { edge: [1, 3], pond: [1, 1], shade: [3, 6] },
    ivy: { edge: [2, 4], pond: [1, 1], shade: [3, 6] },
    bramble: { edge: [2, 4], shade: [1, 2] },
    nettle: { edge: [2, 4], pond: [1, 3], shade: [1, 1] },
    rush: { pond: [5, 9] },
    iris: { pond: [1, 3] },
    mushroom: { edge: [1, 1], shade: [2, 4] },
    daisy: { meadow: [4, 8], edge: [1, 3] },
    dandelion: { meadow: [3, 6], edge: [2, 4], pond: [1, 1] },
    buttercup: { meadow: [2, 4], edge: [1, 2], pond: [2, 5] },
    butterfly: { meadow: [1, 3], edge: [1, 2], pond: [1, 1] },
    bee: { meadow: [1, 3], edge: [1, 2], pond: [1, 1] },
    dragonfly: { pond: [1, 2] },
    grasshopper: { meadow: [1, 4], edge: [1, 2] },
    ant: { meadow: [4, 8], edge: [2, 4], pond: [1, 1], shade: [1, 2] },
    woodlouse: { edge: [1, 2], pond: [1, 1], shade: [3, 7] },
    snail: { meadow: [1, 1], edge: [1, 2], pond: [2, 4], shade: [1, 3] },
    frog: { pond: [1, 1] }
  };
  const SPECIES_MIN = 4, SPECIES_MAX = 7;   // espèces dans un carré
  const CATEGORIES_MAX = 8;                 // espèces des deux zones réunies : l'histogramme reste lisible
  const SHARED_MIN = 3;                     // espèces communes aux deux zones
  const GAP_MIN = 2;                        // écart lisible entre zones (mousses et fougères, fleurs et insectes volants)

  const FACTORS = ['temp', 'lux', 'air', 'soil'];
  const INSTR = { thermo: 'temp', lux: 'lux', hygro: 'air' };
  const UNIT = { temp: '°C', lux: 'lux', air: '%' };
  const TOOLS = ['thermo', 'lux', 'hygro', 'hand', 'quadrat'];

  // Couleurs des zones (palette de référence dataviz) ; la zone B est
  // hachurée en plus (daltonisme, impression en noir et blanc).
  const ZC = { A: '#2a78d6', B: '#eb6834' };

  /* ===== Tirage ===== */
  const between = (a, b) => a + Math.random() * (b - a);
  const intBetween = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  function drawValues(key) {
    const h = HABITATS[key];
    const lux = between(...h.lux);
    return {
      temp: Math.round(between(...h.temp) * 10) / 10,
      lux: lux >= 10000 ? Math.round(lux / 100) * 100 : Math.round(lux / 10) * 10,
      air: Math.round(between(...h.air)),
      soil: h.soil
    };
  }

  // n espèces sans remise, celles de plus grand poids ayant plus de chances.
  function pickWeighted(pool, weight, n) {
    const left = pool.slice(), out = [];
    while (out.length < n && left.length) {
      const total = left.reduce((sum, t) => sum + weight(t), 0);
      let r = Math.random() * total, i = 0;
      while (i < left.length - 1 && (r -= weight(left[i])) > 0) i++;
      out.push(left.splice(i, 1)[0]);
    }
    return out;
  }

  const groupSum = (living, group) => group.reduce((s, t) => s + (living.counts[t] || 0), 0);

  /* D'abord les espèces communes aux deux zones (de préférence celles qui
     abondent dans l'une des deux : le contraste se voit), puis chaque zone
     est complétée avec ses propres espèces (les plus abondantes du milieu
     ont plus de chances). Les deux zones n'ont pas le même nombre
     d'espèces, et l'histogramme n'en compte pas trop ; mousses et fougères
     sont nettement plus nombreuses dans la zone ombragée, fleurs et insectes
     volants dans la zone ensoleillée (sinon on tire à nouveau). */
  function drawLiving(keys) {
    const here = k => Object.keys(ABUNDANCE).filter(t => ABUNDANCE[t][k]);
    const max = (t, k) => ABUNDANCE[t][k][1];
    const both = here(keys[0]).filter(t => ABUNDANCE[t][keys[1]]);
    const sunny = HABITATS[keys[0]].rank < HABITATS[keys[1]].rank ? 0 : 1;
    const shady = 1 - sunny;
    let z = null;
    for (let tries = 0; tries < 2000; tries++) {
      const shared = pickWeighted(both, t => Math.max(max(t, keys[0]), max(t, keys[1])), intBetween(SHARED_MIN, Math.min(SHARED_MIN + 1, both.length)));
      const sizes = keys.map(k => intBetween(Math.max(SPECIES_MIN, shared.length + 1), Math.min(SPECIES_MAX, here(k).length)));
      if (sizes[0] === sizes[1]) continue;
      z = keys.map((k, n) => {
        const types = shared.concat(pickWeighted(here(k).filter(t => !shared.includes(t)), t => max(t, k), sizes[n] - shared.length));
        const counts = {};
        types.forEach(t => { counts[t] = intBetween(...ABUNDANCE[t][k]); });
        return { types, counts };
      });
      if (new Set(z[0].types.concat(z[1].types)).size <= CATEGORIES_MAX &&
        groupSum(z[shady], MOSS_FERN) >= groupSum(z[sunny], MOSS_FERN) + GAP_MIN &&
        groupSum(z[sunny], BLOOM) >= groupSum(z[shady], BLOOM) + GAP_MIN) return z;
    }
    return z;
  }

  // Place de chaque élément dans le carré : sans chevauchement des zones à toucher.
  function placeItems(list, Z) {
    const order = list.map((t, i) => ({ t, i })).sort((a, b) => hitR(b.t) - hitR(a.t));
    const placed = [];
    order.forEach(({ t }) => {
      const rr = hitR(t);
      let x = 200, y = 200;
      for (let k = 0; k < 400; k++) {
        x = 18 + rr + Math.random() * (364 - 2 * rr);
        y = 18 + rr + Math.random() * (364 - 2 * rr);
        if (placed.every(p => Math.hypot(p.x - x, p.y - y) > hitR(p.t) + rr + 3)) break;
      }
      placed.push({ t, x: Math.round(x), y: Math.round(y), rot: Math.floor(Math.random() * 360) });
    });
    return placed.map((p, i) => Object.assign(p, { uid: `${Z}${i}` }));
  }

  function buildZone(Z, key, living) {
    const items = [];
    living.types.forEach(t => { for (let i = 0; i < living.counts[t]; i++) items.push(t); });
    return { key, values: drawValues(key), items: placeItems(items, Z), seed: String(Math.random()) };
  }

  /* ===== État ===== */
  let state;      // tirage et travail de l'élève (enregistré tel quel, voir save)

  function reset() {
    const pair = pick(PAIRS);
    const keys = Math.random() < 0.5 ? pair : [pair[1], pair[0]];
    const living = drawLiving(keys);
    const blank = v => ({ temp: v, lux: v, air: v, soil: v });
    state = {
      hypothesis: { warmer: null, brighter: null, humid: null, moss: null, bloom: null, influence: null },
      because: '',
      zones: { A: buildZone('A', keys[0], living[0]), B: buildZone('B', keys[1], living[1]) },
      shown: null,                                        // instrument affiché dans les zones : le dernier pris
      measured: { A: blank(false), B: blank(false) },     // l'instrument (ou la main) est passé par la zone
      table: { A: blank(null), B: blank(null) },          // fiche de terrain de l'élève
      quadrat: { A: false, B: false },                    // carré posé
      identified: {},                                     // espèces que l'élève a su nommer
      found: { A: [], B: [] },                            // espèces trouvées dans chaque carré, dans l'ordre
      counts: { A: {}, B: {} },                           // fiche de comptage de l'élève
      view: 'field',                                      // field, quadrat ou graph
      qz: 'A',
      pick: null,                                         // élément touché dans le carré ouvert
      tries: [],                                          // noms déjà essayés à tort pour cet élément
      tool: null,
      bars: {},                                           // histogramme : espèce → { A, B }
      conclusion: { warmer: null, brighter: null, humid: null, moss: null, bloom: null, influence: null, verdict: null },
      crit: 'measures'
    };
  }

  const zoneOf = Z => state.zones[Z];
  const itemOf = (Z, uid) => zoneOf(Z).items.find(i => i.uid === uid) || null;
  const habitatName = Z => LABELS.habitats[zoneOf(Z).key];

  function started() {
    return ZONES.some(Z => state.quadrat[Z] || FACTORS.some(f => state.measured[Z][f]));
  }

  // Ce qu'il y avait vraiment dans le carré : espèce → nombre d'individus.
  function trueTally(Z) {
    const c = {};
    zoneOf(Z).items.forEach(it => { c[it.t] = (c[it.t] || 0) + 1; });
    return c;
  }

  const countOf = (Z, t) => state.found[Z].includes(t) && state.counts[Z][t] != null ? state.counts[Z][t] : 0;

  // Catégories de l'histogramme : les espèces trouvées, dans l'ordre du guide
  // (plantes, puis animaux), pour que les espèces communes ne soient pas
  // rangées par zone.
  function categories() {
    return Object.keys(T).filter(t => state.found.A.includes(t) || state.found.B.includes(t));
  }

  const barValue = (t, Z) => (state.bars[t] && state.bars[t][Z]) || 0;

  // Hauteur de l'axe : 10 carreaux, plus si l'élève a noté plus de 10.
  function yMax() {
    const max = Math.max(0, ...ZONES.flatMap(Z => state.found[Z].map(t => countOf(Z, t))));
    return Math.max(10, Math.ceil(max / 2) * 2);
  }

  /* ===== Valeurs : lecture, écriture ===== */
  const fmtLux = v => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  function fmtValue(f, v) {
    if (v == null) return '—';
    if (f === 'temp') return num(v);
    if (f === 'lux') return fmtLux(v);
    if (f === 'air') return String(Math.round(v));
    return LABELS.soilWords[v];
  }

  function withUnit(f, v) {
    return f === 'soil' ? LABELS.soilWords[v] : `${fmtValue(f, v)} ${UNIT[f]}`;
  }

  // Virgule ou point ; espaces et points de milliers acceptés pour les lux.
  function parseValue(f, raw) {
    const s = String(raw).trim();
    if (f === 'temp') {
      const t = s.replace(',', '.').replace(/\s*°?\s*c$/i, '');
      if (!/^-?(\d{1,2}(\.\d*)?|\.\d+)$/.test(t)) return NaN;
      const v = Number(t);
      return v >= -10 && v <= 50 ? Math.round(v * 10) / 10 : NaN;
    }
    if (f === 'lux') {
      const t = s.replace(/\s*(lux|lx)$/i, '').replace(/[\s.,'   ]/g, '');
      if (!/^\d{1,6}$/.test(t)) return NaN;
      const v = Number(t);
      return v <= 200000 ? v : NaN;
    }
    if (f === 'count') {
      if (!/^\d{1,2}$/.test(s)) return NaN;
      const v = Number(s);
      return v <= 30 ? v : NaN;
    }
    const t = s.replace(/\s|%/g, '');
    if (!/^\d{1,3}$/.test(t)) return NaN;
    const v = Number(t);
    return v <= 100 ? v : NaN;
  }

  function sameValue(f, said, real) {
    if (said == null) return false;
    return f === 'temp' ? Math.abs(said - real) < 0.051 : said === real;
  }

  /* ===== Étapes complètes (progression stricte, voir lab-engine.js) =====
     1 : l'hypothèse (6 choix) ; 2 : la fiche de terrain remplie, au moins une
     espèce trouvée et notée dans chaque carré, tous les bâtons tracés ; 3 :
     toutes les questions. */
  // La conclusion reprend exactement les lignes de l'hypothèse, puis la juge.
  const HYP_KEYS = ['warmer', 'brighter', 'humid', 'moss', 'bloom', 'influence'];
  const CONCL_KEYS = HYP_KEYS.concat('verdict');

  const hypComplete = () => HYP_KEYS.every(k => state.hypothesis[k]);
  const squareDone = Z => state.found[Z].length > 0 && state.found[Z].every(t => state.counts[Z][t] != null);
  const countsDone = () => ZONES.every(squareDone);
  const squaresDone = () => ZONES.filter(squareDone).length;
  const valuesWritten = () => ZONES.reduce((n, Z) => n + FACTORS.filter(f => state.table[Z][f] != null).length, 0);
  const fieldDone = () => valuesWritten() === 8 && countsDone();

  function barsLeft() {
    let n = 0;
    categories().forEach(t => ZONES.forEach(Z => { if (countOf(Z, t) > 0 && !barValue(t, Z)) n++; }));
    return n;
  }

  const graphDone = () => countsDone() && barsLeft() === 0;

  function missingReason() {
    const M = LABELS.missing;
    for (const Z of ZONES) for (const f of ['temp', 'lux', 'air']) if (state.table[Z][f] == null) return M[f](Z);
    for (const Z of ZONES) if (!state.table[Z].soil) return M.soil(Z);
    for (const Z of ZONES) if (!state.found[Z].length) return M.find(Z);
    for (const Z of ZONES) {
      const t = state.found[Z].find(x => state.counts[Z][x] == null);
      if (t) return M.count(SPECIES[t].name, Z);
    }
    const left = barsLeft();
    return left ? M.bars(left) : null;
  }

  const conclusionsComplete = () => CONCL_KEYS.every(k => state.conclusion[k]);

  function stepComplete(n) {
    if (n === 1) return hypComplete();
    if (n === 2) return !missingReason();
    return conclusionsComplete();
  }

  function lockReason(n) {
    if (n === 1) return LABELS.lockHypothesis;
    if (n === 2) return missingReason();
    return lab.L.missingConclusions;
  }

  /* ===== Dessins des zones (vue de côté, 400 × 300) =====
     Le même dessin à chaque affichage (graine de la zone). Les instruments se
     plantent au fond, le carré de comptage se pose devant. */
  let svgUid = 0;

  function grassStrokes(rnd, n, y1, y2, colours, h) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = rnd() * 400, y = y1 + rnd() * (y2 - y1), hh = h * (0.6 + rnd() * 0.8) * (0.6 + (y - y1) / (y2 - y1) * 0.7);
      s += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} q${(rnd() * 4 - 2).toFixed(1)} ${(-hh / 2).toFixed(1)} ${(rnd() * 6 - 3).toFixed(1)} ${(-hh).toFixed(1)}" stroke="${colours[i % colours.length]}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
    }
    return s;
  }

  function sky(u, top, bottom) {
    return `<defs><linearGradient id="${u}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>` +
      `<rect y="-60" width="400" height="360" fill="url(#${u}sky)"/>`;
  }

  function sun(x, y, r) {
    return `<g stroke="#ffc928" stroke-width="3" stroke-linecap="round">` + [0, 45, 90, 135, 180, 225, 270, 315].map(a => {
      const c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180);
      return `<path d="M${(x + c * (r + 7)).toFixed(1)} ${(y + s * (r + 7)).toFixed(1)} L${(x + c * (r + 16)).toFixed(1)} ${(y + s * (r + 16)).toFixed(1)}"/>`;
    }).join('') + `</g><circle cx="${x}" cy="${y}" r="${r}" fill="#ffd54a"/>`;
  }

  function tree(x, y, r, trunk, crowns) {
    return `<rect x="${x - r * 0.14}" y="${y}" width="${r * 0.28}" height="${150 - y + 8}" fill="${trunk}"/>` +
      `<circle cx="${x}" cy="${y}" r="${r}" fill="${crowns[0]}"/><circle cx="${x - r * 0.55}" cy="${y + r * 0.35}" r="${r * 0.62}" fill="${crowns[1]}"/>` +
      `<circle cx="${x + r * 0.55}" cy="${y + r * 0.3}" r="${r * 0.6}" fill="${crowns[2] || crowns[1]}"/>`;
  }

  const SCENES = {
    meadow: (u, rnd) => sky(u, '#a9d6f5', '#e6f4fc') + sun(340, 26, 24) +
      `<path d="M0 152 C14 132 30 130 44 138 C58 120 82 122 96 140 C108 128 126 132 136 150 Z" fill="#7fae63"/>` +
      `<path d="M250 150 C262 140 276 140 286 146 C298 136 316 138 326 150 Z" fill="#8bb86e"/>` +
      `<rect y="148" width="400" height="152" fill="#a6d16d"/><path d="M0 149 H400" stroke="#93c35a" stroke-width="3"/>` +
      grassStrokes(rnd, 120, 154, 300, ['#7fb54a', '#8fc257', '#6ea83f'], 11) +
      Array.from({ length: 22 }, () => {
        const x = rnd() * 400, y = 158 + rnd() * 138, c = ['#ffffff', '#ffd21f', '#ffffff', '#f6c429'][Math.floor(rnd() * 4)];
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.6 + (y - 158) / 70).toFixed(1)}" fill="${c}"/>`;
      }).join('') +
      `<g transform="translate(150 118)"><path d="M0 0 C-3 -7 -10 -8 -9 -2 C-9 1 -4 1 0 0 Z M0 0 C3 -7 10 -8 9 -2 C9 1 4 1 0 0 Z" fill="#f08a24"/></g>` +
      `<g transform="translate(262 100)"><path d="M0 0 C-3 -6 -8 -7 -7 -2 C-7 1 -3 1 0 0 Z M0 0 C3 -6 8 -7 7 -2 C7 1 3 1 0 0 Z" fill="#f3c623"/></g>`,
    edge: (u, rnd) => sky(u, '#b7dcf4', '#e8f4fb') + sun(330, 20, 20) +
      `<rect y="148" width="400" height="152" fill="#9fcb68"/>` +
      `<path d="M0 148 H215 C190 200 130 250 70 300 H0 Z" fill="#4f6b33" opacity=".5"/>` +
      grassStrokes(rnd, 70, 154, 300, ['#7fb54a', '#6ea83f'], 10) +
      tree(30, 52, 52, '#6b4a2f', ['#3f7f45', '#4a8f4f', '#356f3c']) + tree(110, 40, 48, '#5e4129', ['#4a8f4f', '#3f7f45']) +
      tree(176, 76, 38, '#6b4a2f', ['#3f7f45', '#4f9a55']) +
      [[205, 160], [235, 166], [262, 158]].map(([x, y]) => `<path d="M${x - 20} ${y + 10} C${x - 14} ${y - 12} ${x + 12} ${y - 14} ${x + 20} ${y + 10} Z" fill="#3d6e33"/><circle cx="${x - 5}" cy="${y - 1}" r="2" fill="#2b1830"/><circle cx="${x + 6}" cy="${y + 2}" r="2" fill="#2b1830"/>`).join('') +
      [[40, 190], [110, 214], [60, 252]].map(([x, y]) => `<path d="M${x} ${y} q-10 -16 -18 -18 M${x} ${y} q2 -20 0 -24 M${x} ${y} q10 -16 18 -18" stroke="#3f7a34" stroke-width="3" fill="none" stroke-linecap="round"/>`).join(''),
    shade: (u, rnd) => `<rect y="-60" width="400" height="360" fill="#2f4f35"/>` +
      `<path d="M120 0 L156 0 L222 300 L176 300 Z" fill="#fff6c8" opacity=".07"/><path d="M280 0 L300 0 L330 300 L300 300 Z" fill="#fff6c8" opacity=".05"/>` +
      [20, 70, 150, 240, 330, 380].map(x => `<rect x="${x}" y="40" width="7" height="130" fill="#3a2e24"/>`).join('') +
      `<rect y="160" width="400" height="140" fill="#4f3b2a"/>` +
      Array.from({ length: 70 }, () => {
        const x = rnd() * 400, y = 164 + rnd() * 134, c = ['#6e4f33', '#85613b', '#5e4129'][Math.floor(rnd() * 3)];
        return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(2.5 + (y - 160) / 40).toFixed(1)}" ry="${(1.2 + (y - 160) / 90).toFixed(1)}" fill="${c}"/>`;
      }).join('') +
      [[45, 26], [118, 22], [272, 26], [352, 20]].map(([x, w]) => `<rect x="${x - w / 2}" y="0" width="${w}" height="175" fill="#5b4330"/><path d="M${x - w / 2} 175 q-10 6 -16 6 M${x + w / 2} 175 q10 6 16 6" stroke="#5b4330" stroke-width="7" fill="none"/>` +
        `<path d="M${x - w / 2} 150 q${w / 2} -8 ${w} 0 v25 h-${w} z" fill="#5e8f3e" opacity=".8"/>`).join('') +
      `<rect y="-60" width="400" height="66" fill="#24502b"/><path d="M0 0 H400 V58 C360 86 320 70 290 82 C250 98 210 76 170 88 C130 100 90 78 50 92 C30 98 10 90 0 84 Z" fill="#24502b"/>` +
      `<circle cx="70" cy="36" r="46" fill="#2c5f33"/><circle cx="190" cy="30" r="54" fill="#285a30"/><circle cx="320" cy="34" r="50" fill="#2c5f33"/><circle cx="250" cy="58" r="30" fill="#356b3b"/><circle cx="130" cy="62" r="28" fill="#356b3b"/>` +
      [[80, 196], [196, 202], [312, 192], [150, 262], [360, 258]].map(([x, y]) => `<path d="M${x} ${y} q-14 -16 -26 -16 M${x} ${y} q-2 -22 -1 -30 M${x} ${y} q14 -16 26 -16 M${x} ${y} q-8 -20 -16 -26 M${x} ${y} q8 -20 16 -26" stroke="#4c8a3c" stroke-width="3.2" fill="none" stroke-linecap="round"/>`).join('') +
      [[24, 232], [250, 284], [380, 214]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="22" ry="7" fill="#5e8f3e"/>`).join(''),
    pond: (u, rnd) => sky(u, '#b9dbf2', '#e6f2fa') + sun(334, 18, 18) +
      `<path d="M140 150 C160 132 190 130 210 140 C232 124 262 128 280 142 C300 132 330 134 352 148 L400 150 V152 H140 Z" fill="#6f9f5b"/>` +
      `<rect y="150" width="400" height="150" fill="#7f9a4f"/>` +
      `<ellipse cx="290" cy="180" rx="150" ry="28" fill="#5f9cc4"/><ellipse cx="290" cy="176" rx="140" ry="20" fill="#6aa8cf"/>` +
      `<path d="M220 178 q14 -4 28 0 M300 186 q16 -4 32 0 M330 170 q12 -3 24 0" stroke="#a9d0ea" stroke-width="2" fill="none" stroke-linecap="round"/>` +
      `<path d="M0 214 C60 200 120 206 160 198 C150 230 80 250 0 254 Z" fill="#6d6a44" opacity=".55"/>` +
      `<rect x="44" y="60" width="16" height="100" fill="#5e4129"/>` +
      `<ellipse cx="52" cy="58" rx="62" ry="38" fill="#7aa64e"/>` +
      Array.from({ length: 16 }, (_, i) => {
        const x = -6 + i * 7.5;
        return `<path d="M${x} 60 q4 40 ${(i % 2 ? 3 : -2)} ${70 + (i % 3) * 14}" stroke="#6f9f4a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
      }).join('') +
      `<path d="M0 214 C40 206 100 212 160 206 L170 300 H0 Z" fill="#000" opacity=".08"/>` +
      Array.from({ length: 26 }, () => {
        const x = 150 + rnd() * 250, y = 156 + rnd() * 52, h = 18 + rnd() * 20;
        return `<path d="M${x.toFixed(1)} ${y.toFixed(1)} l${(rnd() * 4 - 2).toFixed(1)} ${(-h).toFixed(1)}" stroke="${rnd() < 0.5 ? '#3f6e2e' : '#4d7f37'}" stroke-width="2" stroke-linecap="round"/>`;
      }).join('') +
      [[180, 150], [236, 156], [372, 152]].map(([x, y]) => `<path d="M${x} ${y + 30} l1 -30" stroke="#4f9442" stroke-width="2"/><ellipse cx="${x + 1}" cy="${y}" rx="4" ry="3" fill="#f3c623"/>`).join('') +
      grassStrokes(rnd, 50, 200, 300, ['#6c8c40', '#7f9f4c'], 10)
  };

  // Instrument planté dans la zone : écran à cristaux liquides, valeur et unité.
  const INSTR_X = { thermo: 75, lux: 200, hygro: 325 };

  function fmtDisp(f, v) {
    if (f === 'temp') return num(v);
    if (f === 'lux') return fmtLux(Math.round(v / (v >= 10000 ? 100 : 10)) * (v >= 10000 ? 100 : 10));
    return String(Math.round(v));
  }

  function instrumentSVG(kind, value) {
    const x = INSTR_X[kind], top = 106, f = INSTR[kind];
    const sensor = {
      thermo: `<rect x="${x - 4}" y="${top - 30}" width="8" height="34" rx="4" fill="#d3dae0" stroke="#5d6b78" stroke-width="1.2"/><circle cx="${x}" cy="${top - 26}" r="5" fill="#d94a4a"/>`,
      lux: `<path d="M${x - 18} ${top + 1} A18 15 0 0 1 ${x + 18} ${top + 1} Z" fill="#ffffff" stroke="#5d6b78" stroke-width="1.4"/><path d="M${x - 18} ${top + 1} H${x + 18}" stroke="#f0b400" stroke-width="2.6"/>`,
      hygro: `<rect x="${x - 21}" y="${top - 13}" width="42" height="15" rx="4" fill="#8cc0e2" stroke="#5d6b78" stroke-width="1.2"/>` +
        [-13, -6.5, 0, 6.5, 13].map(d => `<path d="M${x + d} ${top - 9.5} V${top - 2}" stroke="#3f7fae" stroke-width="1.8" stroke-linecap="round"/>`).join('')
    }[kind];
    return `<g class="zn-instr" data-instr="${kind}">` +
      `<ellipse cx="${x}" cy="216" rx="11" ry="2.8" fill="#000" opacity=".22"/>` +
      `<path d="M${x} 215 V${top + 70}" stroke="#8a6a44" stroke-width="4.5" stroke-linecap="round"/>` + sensor +
      `<rect x="${x - 36}" y="${top}" width="72" height="74" rx="11" fill="#f4f6f8" stroke="#5d6b78" stroke-width="1.6"/>` +
      `<rect x="${x - 30}" y="${top + 8}" width="60" height="38" rx="4" fill="#d6e5c3" stroke="#3d4a3a" stroke-width="1"/>` +
      `<text x="${x + 25}" y="${top + 30}" text-anchor="end" class="zn-lcd" data-disp="${kind}">${fmtDisp(f, value)}</text>` +
      `<text x="${x + 25}" y="${top + 41}" text-anchor="end" class="zn-lcd-unit">${UNIT[f]}</text>` +
      `<circle cx="${x - 13}" cy="${top + 60}" r="4.5" fill="#9aa6b1"/><circle cx="${x + 13}" cy="${top + 60}" r="4.5" fill="#9aa6b1"/></g>`;
  }

  // Carré posé devant, en perspective ; le toucher l'ouvre (aussi au labo corrigé).
  function quadratInScene() {
    const pts = '120,240 280,240 308,292 92,292';
    return `<g class="zn-q-open" data-open-quadrat data-lab-look>` +
      `<polygon points="${pts}" fill="#ffffff" fill-opacity=".14"/>` +
      `<polygon points="${pts}" fill="none" stroke="#f4f4ef" stroke-width="6" stroke-linejoin="round"/>` +
      `<polygon points="${pts}" fill="none" stroke="#7d877d" stroke-width="1" stroke-linejoin="round"/>` +
      `<path d="M200 240 L200 292 M106 266 L294 266" stroke="#f4f4ef" stroke-width="1.6" opacity=".9"/>` +
      `<g transform="translate(200 266)"><rect x="-50" y="-11" width="100" height="22" rx="11" fill="#ffffff" fill-opacity=".92"/>` +
      `<text class="zn-q-tag" text-anchor="middle" y="4.5">${escapeHtml(LABELS.tapToOpen)}</text></g></g>`;
  }

  function sceneSVG(Z, opts) {
    const o = opts || {};
    const zone = zoneOf(Z);
    const u = `zns${++svgUid}`;
    // Ciel agrandi vers le haut dans le labo (la place est là) ; vignette cadrée sur le sol.
    let out = `<svg class="zn-scene-svg" viewBox="${o.mini ? '0 0 400 300' : '0 -60 400 360'}" preserveAspectRatio="xMidYMid slice" ${o.mini ? 'aria-hidden="true" focusable="false"' : ''}>` +
      SCENES[zone.key](u, mulberry32(seedFrom(zone.seed + 'scene')));
    if (!o.mini) {
      ['thermo', 'lux', 'hygro'].forEach(k => {
        if (state.shown === k && state.measured[Z][INSTR[k]]) out += instrumentSVG(k, zone.values[INSTR[k]]);
      });
      if (state.quadrat[Z]) out += quadratInScene();
    }
    return out + `</svg>`;
  }

  /* ===== Vue de dessus du carré (400 × 400) ===== */
  const GROUNDS = {
    meadow: { base: '#93c25e', strokes: ['#7db04a', '#a7d06f', '#6c9f3e'], n: 260, litter: 0, litterC: [] },
    edge: { base: '#8aa957', strokes: ['#759a45', '#9cbd63'], n: 150, litter: 30, litterC: ['#9b7a4b', '#b08d58', '#8a6a3c'] },
    shade: { base: '#5a4330', strokes: [], n: 0, litter: 150, litterC: ['#6f4f33', '#86613a', '#5e4129', '#9a7346'] },
    pond: { base: '#6f6c45', strokes: ['#5f7d3a', '#7a9447'], n: 90, litter: 12, litterC: ['#55513a', '#7d7550'], puddles: true }
  };

  function groundSVG(Z) {
    const zone = zoneOf(Z);
    const G = GROUNDS[zone.key];
    const rnd = mulberry32(seedFrom(zone.seed + 'ground'));
    let s = `<rect width="400" height="400" fill="${G.base}"/>`;
    if (G.puddles) {
      [[90, 300, 46, 20], [300, 90, 38, 16], [250, 330, 30, 12]].forEach(([x, y, rx, ry]) => {
        s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#5a7f94" opacity=".55"/><ellipse cx="${x - rx * 0.3}" cy="${y - ry * 0.3}" rx="${rx * 0.4}" ry="${ry * 0.25}" fill="#a9cde2" opacity=".35"/>`;
      });
    }
    for (let i = 0; i < G.litter; i++) {
      const x = rnd() * 400, y = rnd() * 400, a = Math.floor(rnd() * 180);
      s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(5 + rnd() * 5).toFixed(1)}" ry="${(2.5 + rnd() * 2).toFixed(1)}" fill="${G.litterC[i % G.litterC.length]}" transform="rotate(${a} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    }
    for (let i = 0; i < G.n; i++) {
      const x = rnd() * 400, y = rnd() * 400, a = rnd() * 6.283, l = 4 + rnd() * 6;
      s += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} l${(Math.cos(a) * l).toFixed(1)} ${(Math.sin(a) * l).toFixed(1)}" stroke="${G.strokes[i % G.strokes.length]}" stroke-width="1.3" stroke-linecap="round"/>`;
    }
    return s;
  }

  // Cadre du carré (tube blanc) et ficelles qui le partagent en quatre.
  const QUADRAT_FRAME = '<path d="M200 12 V388 M12 200 H388" stroke="#f7f7f2" stroke-width="1.6" opacity=".85"/>' +
    '<rect x="8" y="8" width="384" height="384" fill="none" stroke="#f7f7f2" stroke-width="10"/>' +
    '<rect x="3" y="3" width="394" height="394" fill="none" stroke="#8d968d" stroke-width="1.2"/><rect x="13" y="13" width="374" height="374" fill="none" stroke="#8d968d" stroke-width="1.2"/>' +
    [[3, 3], [377, 3], [3, 377], [377, 377]].map(([x, y]) => `<rect x="${x}" y="${y}" width="20" height="20" rx="3" fill="#dfe3df" stroke="#8d968d" stroke-width="1"/>`).join('');

  function itemDrawing(Z, it) {
    return T[it.t].draw(mulberry32(seedFrom(zoneOf(Z).seed + it.uid)));
  }

  // Entouré : un individu de l'espèce touchée, une fois nommée ; avant, seul
  // l'élément touché est marqué.
  function itemMarkup(Z, it) {
    const t = T[it.t];
    const hr = hitR(it.t);
    const circled = circledType();
    const cls = circled ? (circled === it.t ? 'is-circled' : '') : (state.pick === it.uid ? 'is-picked' : '');
    const body = t.move ? `<g>${itemDrawing(Z, it)}${MOVES[t.move]}</g>` : itemDrawing(Z, it);
    return `<g class="zn-it ${cls}" data-uid="${it.uid}" transform="translate(${it.x} ${it.y})" tabindex="0" role="button" aria-label="${escapeHtml(state.identified[it.t] ? t.name : LABELS.unknown)}">` +
      `<g transform="rotate(${it.rot})">${body}</g>` +
      `<circle class="zn-it-ring" r="${hr}" fill="none"/>` +
      `<circle class="zn-it-hit" r="${hr}" fill="transparent"/></g>`;
  }

  function quadratSVG(Z) {
    const items = zoneOf(Z).items.slice().sort((a, b) => T[a.t].layer - T[b.t].layer);
    return `<svg class="zn-quadrat" data-quadrat viewBox="0 0 400 400" role="group" aria-label="${escapeHtml(plain(LABELS.quadratHead(Z)))}">` +
      groundSVG(Z) + QUADRAT_FRAME + items.map(it => itemMarkup(Z, it)).join('') + `</svg>`;
  }

  // Petit portrait d'une espèce (fiche, liste de comptage).
  function iconSVG(t, cls) {
    return `<svg class="${cls || 'zn-ic'}" viewBox="-24 -24 48 48" aria-hidden="true" focusable="false">${T[t].draw(mulberry32(seedFrom(t)))}</svg>`;
  }

  /* ===== Icônes des outils ===== */
  const TOOL_ICON = {
    thermo: '<svg class="zn-tool-ic" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><rect x="18.5" y="1.5" width="4" height="17" rx="2" fill="#d3dae0" stroke="#5d6b78" stroke-width="1"/><circle cx="20.5" cy="4" r="2.6" fill="#d94a4a"/><rect x="8.5" y="16" width="24" height="22" rx="5" fill="#f4f6f8" stroke="#5d6b78" stroke-width="1.6"/><rect x="11.5" y="19.5" width="18" height="9" rx="1.5" fill="#d6e5c3" stroke="#3d4a3a" stroke-width=".8"/><circle cx="16" cy="33" r="1.7" fill="#9aa6b1"/><circle cx="25" cy="33" r="1.7" fill="#9aa6b1"/></svg>',
    lux: '<svg class="zn-tool-ic" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M20.5 1.5 V4.5 M10.5 5 L12.5 7 M30.5 5 L28.5 7" stroke="#f0a400" stroke-width="2" stroke-linecap="round"/><path d="M10.5 16 A10 8.5 0 0 1 30.5 16 Z" fill="#ffffff" stroke="#5d6b78" stroke-width="1.4"/><path d="M10.5 16 H30.5" stroke="#f0b400" stroke-width="2"/><rect x="8.5" y="16" width="24" height="22" rx="5" fill="#f4f6f8" stroke="#5d6b78" stroke-width="1.6"/><rect x="11.5" y="19.5" width="18" height="9" rx="1.5" fill="#d6e5c3" stroke="#3d4a3a" stroke-width=".8"/><circle cx="16" cy="33" r="1.7" fill="#9aa6b1"/><circle cx="25" cy="33" r="1.7" fill="#9aa6b1"/></svg>',
    hygro: '<svg class="zn-tool-ic" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M20.5 .8 C22.6 4 23.6 5.4 23.6 6.8 A3.1 3.1 0 0 1 17.4 6.8 C17.4 5.4 18.4 4 20.5 .8 Z" fill="#4b9fdb"/><rect x="11" y="10" width="19" height="7" rx="2" fill="#8cc0e2" stroke="#5d6b78" stroke-width="1"/><path d="M15 11.5 V15.5 M18.5 11.5 V15.5 M22 11.5 V15.5 M25.5 11.5 V15.5" stroke="#3f7fae" stroke-width="1.2"/><rect x="8.5" y="16" width="24" height="22" rx="5" fill="#f4f6f8" stroke="#5d6b78" stroke-width="1.6"/><rect x="11.5" y="19.5" width="18" height="9" rx="1.5" fill="#d6e5c3" stroke="#3d4a3a" stroke-width=".8"/><circle cx="16" cy="33" r="1.7" fill="#9aa6b1"/><circle cx="25" cy="33" r="1.7" fill="#9aa6b1"/></svg>',
    hand: '<svg class="zn-tool-ic" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M4 37 C10 33.5 26 33.5 36 37" stroke="#7a5634" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M15 33 C11 30 8 25 7 21 C6.4 19 8.8 17.8 10 19.6 L13 24 V5.5 C13 3.4 16.4 3.4 16.4 5.5 V17 V14 C16.4 12 19.8 12 19.8 14 V18 V15.5 C19.8 13.5 23.2 13.5 23.2 15.5 V19 V17.5 C23.2 15.6 26.6 15.6 26.6 17.5 V25 C26.6 29 24.5 32 23 33 Z" fill="#f1c9a5" stroke="#b98a63" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    quadrat: '<svg class="zn-tool-ic" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><rect x="5" y="5" width="30" height="30" fill="#a8d08d"/><path d="M20 6 V34 M6 20 H34" stroke="#ffffff" stroke-width="1"/><path d="M11 14 l-3 -4 M11 14 l0 -5 M11 14 l3 -4 M27 29 l-3 -4 M27 29 l0 -5 M27 29 l3 -4" stroke="#4f8a2e" stroke-width="1.6" stroke-linecap="round"/><circle cx="27" cy="12" r="2.6" fill="#ffffff"/><circle cx="27" cy="12" r="1.1" fill="#f6c429"/><rect x="5" y="5" width="30" height="30" fill="none" stroke="#f7f7f2" stroke-width="4"/><rect x="3" y="3" width="34" height="34" fill="none" stroke="#8d968d" stroke-width="1"/></svg>'
  };

  const VIEW_ICON = {
    field: '<svg class="zn-view-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 21 V14 M17 21 V12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="7" cy="10" r="5" fill="currentColor"/><circle cx="17" cy="8" r="5.5" fill="currentColor"/><path d="M2 21 H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    graph: '<svg class="zn-view-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 3 V21 H21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="6" y="11" width="3.5" height="8" fill="currentColor"/><rect x="11" y="6" width="3.5" height="13" fill="currentColor"/><rect x="16" y="13" width="3.5" height="6" fill="currentColor"/></svg>'
  };

  /* ===== Étape 1 : hypothèse ===== */
  const letter = Z => `<span class="zn-letter is-${Z}">${Z}</span>`;

  function chip(attr, key, value, label, selected) {
    return `<button type="button" class="lab-choice zn-chip ${selected ? 'is-selected' : ''}" data-${attr}="${key}:${value}" aria-pressed="${selected}">${label}</button>`;
  }

  function zoneChips(attr, key, current) {
    return `<span class="zn-chips">` + ['A', 'B', 'same'].map(v =>
      chip(attr, key, v, v === 'same' ? LABELS.same : LABELS.zone(v), current === v)).join('') + `</span>`;
  }

  function yesNoChips(attr, key, current) {
    return `<span class="zn-chips">` + ['yes', 'no'].map(v => chip(attr, key, v, LABELS.yesNo[v], current === v)).join('') + `</span>`;
  }

  function renderPredict() {
    const h = state.hypothesis;
    const show = lab.state.showMissing;
    const places = ZONES.map(Z => `<div class="zn-place">${sceneSVG(Z, { mini: true })}<span class="zn-place-name">${letter(Z)}<strong>${LABELS.zone(Z)}</strong><small>${gloss(habitatName(Z))}</small></span></div>`)
      .join(`<span class="zn-apart" aria-hidden="true"><span>←</span>${LABELS.apart}<span>→</span></span>`);
    const row = k => `<div class="zn-hrow ${show && !h[k] ? 'lab-is-missing' : ''}"><span class="zn-hrow-label">${gloss(LABELS.hypRows[k])}</span>` +
      (k === 'influence' ? yesNoChips('hyp', k, h[k]) : zoneChips('hyp', k, h[k])) + `</div>`;
    const group = (g, keys) => `<div class="zn-hgroup"><p class="zn-hgroup-title">${LABELS.hypGroups[g]}</p>${keys.map(row).join('')}</div>`;

    lab.body.innerHTML = `<div class="zn-predict">` +
      `<div class="zn-question-card">` +
        `<p class="zn-kicker">${LABELS.yourQuestion}</p>` +
        `<p class="zn-question">${gloss(LABELS.question)}</p>` +
        `<p class="zn-question-case">${gloss(LABELS.questionCase)}</p>` +
        `<div class="zn-places">${places}</div>` +
      `</div>` +
      `<div class="zn-hyp-card">` +
        `<p class="zn-kicker">${LABELS.hypothesisTitle}</p>` +
        `<div class="zn-hgroups">${group('abiotic', ['warmer', 'brighter', 'humid'])}${group('biotic', ['moss', 'bloom'])}</div>` +
        group('answer', ['influence']) +
        `<label class="zn-because"><span>${LABELS.because}</span>` +
        `<input type="text" class="lab-input zn-because-input" maxlength="160" placeholder="${LABELS.becausePlaceholder}" value="${escapeHtml(state.because)}" autocomplete="off"></label>` +
      `</div></div>`;

    $$('[data-hyp]').forEach(btn => btn.addEventListener('click', () => {
      const [k, v] = btn.dataset.hyp.split(':');
      state.hypothesis[k] = v;
      if (hypComplete()) lab.state.showMissing = false;
      renderPredict();
      lab.renderStepper();
    }));
    const because = $('.zn-because-input');
    because.addEventListener('input', e => { state.because = e.target.value; });
    // Hypothèse figée dès que le travail de terrain a commencé.
    if (started()) {
      $$('[data-hyp]').forEach(btn => lab.setLock(btn, LABELS.lockHypothesisFixed, { icon: false }));
      because.readOnly = true;
      lab.setLock(because, LABELS.lockHypothesisFixed);
    }

    const ready = hypComplete();
    const info = show && !ready ? lab.footerInfo(lab.L.missingHypothesis, true)
      : lab.footerInfo(ready ? LABELS.hypothesisReady : LABELS.hypothesisPending);
    lab.setFooter(info + `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-next>${LABELS.toExperiment} →</button></div>`);
    const next = $('[data-next]');
    next.addEventListener('click', () => lab.goToStep(2));
    lab.setLock(next, ready ? null : LABELS.lockHypothesis, { missing: true, key: 'next' });
  }

  /* ===== Étape 2 : sur le terrain, puis l'histogramme =====
     Outils : un clic met l'instrument en main (il suit alors la souris), un
     geste sur une zone l'y pose ; on peut aussi le glisser sur la zone. Il y
     a un instrument de chaque sorte par zone, mais seul le dernier pris reste
     affiché (dans les deux zones, pour comparer). Une case de la fiche ne
     s'ouvre qu'une fois l'instrument passé par la zone : impossible de
     deviner. Le carré s'ouvre en vue de dessus : toucher un être vivant
     demande son nom, puis entoure tous les individus de son espèce, que
     l'élève compte et note dans la fiche de comptage. L'histogramme se
     construit dans le second onglet, à partir de cette fiche.
     Labo corrigé (étapes figées) : seules les commandes data-lab-look, qui
     ne font que montrer (onglets, ouvrir un carré, revenir aux zones),
     restent actives. */
  const corrected = () => lab.isFrozen();

  function renderExperiment() {
    lab.body.innerHTML = `<div class="zn-run">` +
      `<section class="zn-bench">` +
        `<div class="zn-toolrow"><div class="zn-tools" data-tools></div><div class="zn-views" data-views role="tablist"></div></div>` +
        `<div class="zn-stage" data-stage></div>` +
        `<p class="lab-caption zn-caption" data-caption aria-live="polite"></p>` +
      `</section>` +
      `<aside class="zn-side">` +
        `<div class="zn-panel"><h3 class="lab-panel-title">${LABELS.sheetTitle}</h3><div data-datasheet></div></div>` +
        `<div class="zn-panel zn-count-panel"><h3 class="lab-panel-title">${LABELS.countTitle}<small>${LABELS.countSub}</small></h3><div data-counts></div></div>` +
      `</aside></div>`;

    const tools = $('[data-tools]');
    tools.addEventListener('pointerdown', onToolDown);
    // Clavier : Entrée ou Espace sur un outil (clic sans pointeur).
    tools.addEventListener('click', e => {
      const b = e.target.closest('[data-tool]');
      if (b && e.detail === 0) toolTap(b.dataset.tool);
    });
    $('[data-views]').addEventListener('click', e => {
      const b = e.target.closest('[data-view]');
      if (b) setView(b.dataset.view);
    });
    // Fiche de terrain et fiche de comptage : valider à la sortie de la case.
    ['[data-datasheet]', '[data-counts]'].forEach(sel => {
      const box = $(sel);
      box.addEventListener('change', onSheetChange);
      box.addEventListener('input', e => { if (e.target.matches('input')) e.target.classList.remove('is-invalid'); });
      box.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); e.target.blur(); } });
    });

    renderTools();
    renderViews();
    renderStage();
    renderDatasheet();
    renderCounts();
    setCaption(defaultCaption());

    lab.setFooter(lab.footerInfo('') + `<div class="lab-footer-actions">` +
      `<button type="button" class="lab-btn lab-btn-primary" data-to-graph hidden>${LABELS.toGraph} →</button>` +
      `<button type="button" class="lab-btn lab-btn-ghost" data-conclude>${LABELS.toConclude} →</button></div>`);
    $('[data-to-graph]').addEventListener('click', () => setView('graph'));
    $('[data-conclude]').addEventListener('click', () => {
      state.tool = null;
      lab.goToStep(3);
    });
    renderFooter();
  }

  // Changer de vue ne change rien au travail : permis aussi au labo corrigé.
  function setView(v) {
    const next = v === 'graph' ? 'graph' : 'field';
    if (state.view === next) return;
    state.view = next;
    state.tool = null;
    followTool();
    renderTools();
    renderViews();
    renderStage();
    renderCounts();
    setCaption(defaultCaption());
    renderFooter();
  }

  function defaultCaption() {
    const C = LABELS.caption;
    if (state.view === 'quadrat') return C.quadrat;
    if (state.view === 'graph') return graphDone() ? C.graphDone : C.graph;
    if (state.tool) return C.tool[state.tool];
    if (fieldDone()) return C.fieldDone;
    return C.start;
  }

  function setCaption(text, warn) {
    const c = $('[data-caption]');
    if (!c) return;
    c.innerHTML = `<span>${gloss(text)}</span>`;
    c.classList.toggle('is-warning', !!warn);
  }

  /* --- Outils et onglets --- */
  function renderTools() {
    const box = $('[data-tools]');
    if (!box) return;
    box.hidden = state.view === 'graph';
    box.innerHTML = TOOLS.map(t => `<button type="button" class="zn-tool ${state.tool === t ? 'is-active' : ''}" data-tool="${t}" aria-pressed="${state.tool === t}">${TOOL_ICON[t]}<span>${LABELS.tools[t]}</span></button>`).join('');
  }

  function renderViews() {
    const box = $('[data-views]');
    if (!box) return;
    const current = state.view === 'graph' ? 'graph' : 'field';
    box.innerHTML = ['field', 'graph'].map(v => `<button type="button" role="tab" class="zn-view ${current === v ? 'is-current' : ''}" data-view="${v}" data-lab-look aria-selected="${current === v}">${VIEW_ICON[v]}<span>${LABELS.views[v]}</span></button>`).join('');
    const g = box.querySelector('[data-view="graph"]');
    if (!countsDone()) lab.setLock(g, LABELS.lockGraph);
    // Ce qui manque est dans l'autre onglet : c'est l'onglet qui est signalé.
    const show = lab.state.showMissing;
    g.classList.toggle('lab-is-missing', show && fieldDone() && !graphDone() && current === 'field');
    box.querySelector('[data-view="field"]').classList.toggle('lab-is-missing', show && !fieldDone() && current === 'graph');
  }

  function setTool(t) {
    state.tool = t;
    renderTools();
    ZONES.forEach(Z => {
      const f = $(`[data-zone="${Z}"]`);
      if (f) f.classList.toggle('has-tool', !!t);
    });
    followTool();
  }

  /* Prendre un instrument range les autres : seul celui-là reste affiché,
     dans toutes les zones où il a déjà servi. */
  function show(t) {
    if (state.shown === t) return;
    state.shown = t;
    if (state.view === 'field') renderStage();
  }

  function toolTap(t) {
    const next = state.tool === t ? null : t;
    if (state.view !== 'field') {
      state.view = 'field';
      renderViews();
      renderStage();
    }
    if (next) show(next);
    setTool(next);
    setCaption(next ? LABELS.caption.tool[next] : LABELS.caption.noTool);
    renderFooter();
  }

  /* Outil en main (choisi d'un simple clic) : il suit la souris comme quand
     on le glisse, jusqu'à ce qu'il serve ou qu'on le repose ; au-dessus des
     zones, il remplace le curseur. Au doigt, rien à suivre : l'outil se pose
     là où on touche la zone. Caché pendant un autre glisser, et dès que les
     outils ne sont plus affichés. */
  let hand = null, handAt = null;   // fantôme de l'outil en main ; dernière position de la souris

  function followTool(e) {
    if (e) handAt = e.pointerType === 'mouse' ? { x: e.clientX, y: e.clientY } : null;
    if (!hand && !(state && state.tool)) return;
    const box = lab && lab.card.isConnected ? $('[data-tools]') : null;
    const t = handAt && state.tool && box && box.getClientRects().length && !document.querySelector('.zn-ghost:not(.zn-hand)') ? state.tool : null;
    if (!t) { if (hand) { hand.remove(); hand = null; } return; }
    const host = document.fullscreenElement || document.body;
    if (!hand || hand.dataset.tool !== t || hand.parentNode !== host) {
      if (hand) hand.remove();
      hand = document.createElement('div');
      hand.className = 'zn-ghost zn-hand';
      hand.dataset.tool = t;
      hand.innerHTML = TOOL_ICON[t].replace('class="zn-tool-ic"', 'class="zn-ghost-tool"');
      host.appendChild(hand);
    }
    hand.style.transform = `translate(${handAt.x}px, ${handAt.y}px) translate(-50%, -50%)`;
  }
  window.addEventListener('pointermove', followTool);
  window.addEventListener('pointerdown', followTool);

  /* Appui sur un outil : toucher le prend en main, glisser le porte sur une
     zone (la zone survolée s'éclaire). */
  function press(e, o) {
    const id = e.pointerId, sx = e.clientX, sy = e.clientY;
    let dragging = false, ghost = null, over = null;
    const setOver = el => {
      if (over === el) return;
      if (over) over.classList.remove('is-over');
      over = el;
      if (over) over.classList.add('is-over');
    };
    const zoneAt = ev => {
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      return el && el.closest ? el.closest('[data-zone]') : null;
    };
    const move = ev => {
      if (ev.pointerId !== id) return;
      if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) {
        dragging = true;
        if (o.onStart) o.onStart();
        ghost = document.createElement('div');
        ghost.className = 'zn-ghost';
        ghost.innerHTML = o.ghost;
        (document.fullscreenElement || document.body).appendChild(ghost);
        followTool();
      }
      if (!dragging) return;
      ghost.style.transform = `translate(${ev.clientX}px, ${ev.clientY}px) translate(-50%, -50%)`;
      setOver(zoneAt(ev));
    };
    const up = ev => {
      if (ev.pointerId !== id) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      setOver(null);
      if (ghost) ghost.remove();
      if (!dragging) { if (ev.type === 'pointerup' && o.onTap) o.onTap(ev); return; }
      if (ev.type === 'pointerup' && o.onDrop) o.onDrop(zoneAt(ev));
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  function onToolDown(e) {
    const b = e.target.closest('[data-tool]');
    if (!b || e.button !== 0) return;
    e.preventDefault();
    const t = b.dataset.tool;
    press(e, {
      ghost: TOOL_ICON[t].replace('class="zn-tool-ic"', 'class="zn-ghost-tool"'),
      onStart: () => {
        if (state.view !== 'field') { state.view = 'field'; renderViews(); renderStage(); }
        setTool(null);
        show(t);
      },
      onTap: ev => { toolTap(t); followTool(ev); },
      onDrop: zone => { if (zone) applyTool(t, zone.dataset.zone); }
    });
  }

  /* Un outil posé dans une zone. */
  function applyTool(t, Z) {
    setTool(null);
    show(t);
    if (t === 'quadrat') { openQuadrat(Z); return; }
    if (t === 'hand') {
      state.measured[Z].soil = true;
      renderStage();
      renderDatasheet();
      setCaption(LABELS.caption.felt(Z));
      renderFooter();
      return;
    }
    const f = INSTR[t];
    state.measured[Z][f] = true;
    renderStage();
    renderDatasheet();
    animateDisplay(t, Z);
    setCaption(LABELS.caption.measured[t](Z));
    renderFooter();
    const input = $(`[data-cell="${Z}:${f}"]`);
    if (input && state.table[Z][f] == null) input.focus({ preventScroll: true });
  }

  // L'écran de l'instrument monte jusqu'à sa valeur (le thermomètre prend son temps).
  function animateDisplay(t, Z) {
    const el = $(`[data-zone="${Z}"] [data-disp="${t}"]`);
    if (!el) return;
    const f = INSTR[t];
    const v = zoneOf(Z).values[f];
    const start = { temp: 20, lux: 0, air: 50 }[f];
    const token = lab.newScene();
    lab.tween(token, f === 'temp' ? 1400 : 900, k => { el.textContent = fmtDisp(f, start + (v - start) * k); }, ease.out)
      .then(() => { if (el.isConnected) el.textContent = fmtDisp(f, v); });
  }

  function openQuadrat(Z) {
    state.quadrat[Z] = true;
    state.view = 'quadrat';
    state.qz = Z;
    state.pick = null;
    state.tries = [];
    renderViews();
    renderStage();
    setCaption(LABELS.caption.quadrat);
    renderFooter();
  }

  /* --- Scène : les deux zones, ou le carré vu de dessus, ou l'histogramme --- */
  const STATUS_ICON = {
    temp: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3 a2.6 2.6 0 0 1 2.6 2.6 V13.5 a4.6 4.6 0 1 1 -5.2 0 V5.6 A2.6 2.6 0 0 1 12 3 Z" fill="currentColor"/></svg>',
    lux: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4.6" fill="currentColor"/><path d="M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M4.9 4.9 L7 7 M17 17 L19.1 19.1 M4.9 19.1 L7 17 M17 7 L19.1 4.9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    air: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3 C15 7.5 18 10.5 18 14.2 A6 6 0 0 1 6 14.2 C6 10.5 9 7.5 12 3 Z" fill="currentColor"/></svg>',
    soil: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8.5 21 C6 19 4.5 16.5 4 14.5 C3.7 13.4 5.1 12.7 5.8 13.7 L7.5 16 V5 C7.5 3.6 9.7 3.6 9.7 5 V12 V10.5 C9.7 9.2 11.9 9.2 11.9 10.5 V12.5 V11.5 C11.9 10.2 14.1 10.2 14.1 11.5 V13 V12.4 C14.1 11.2 16.3 11.2 16.3 12.4 V16.5 C16.3 19 15 20.6 14 21 Z" fill="currentColor"/></svg>',
    count: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M12 4 V20 M4 12 H20" stroke="currentColor" stroke-width="1.3"/></svg>'
  };

  function zoneStatus(Z) {
    const m = state.measured[Z];
    const done = { temp: m.temp, lux: m.lux, air: m.air, soil: m.soil, count: squareDone(Z) };
    const titles = { temp: LABELS.tools.thermo, lux: LABELS.tools.lux, air: LABELS.tools.hygro, soil: LABELS.tools.hand, count: LABELS.tools.quadrat };
    return `<span class="zn-status">` + Object.keys(done).map(k => `<i class="${done[k] ? 'is-done' : ''}" title="${titles[k]}">${STATUS_ICON[k]}</i>`).join('') + `</span>`;
  }

  function renderStage() {
    const box = $('[data-stage]');
    if (!box) return;
    box.className = `zn-stage is-${state.view}`;
    if (state.view === 'quadrat') renderQuadratStage(box);
    else if (state.view === 'graph') renderGraphStage(box);
    else renderFieldStage(box);
  }

  function renderFieldStage(box) {
    const show = lab.state.showMissing;
    box.innerHTML = `<div class="zn-zones">` + ZONES.map(Z => {
      const incomplete = FACTORS.some(f => state.table[Z][f] == null) || !squareDone(Z);
      return `<div class="zn-zone ${state.tool ? 'has-tool' : ''} ${show && incomplete ? 'lab-is-missing' : ''}" data-zone="${Z}" tabindex="0" role="button" aria-label="${LABELS.zone(Z)}">` +
        `<div class="zn-zone-head">${letter(Z)}<strong>${LABELS.zone(Z)}</strong><span class="zn-zone-name">${gloss(habitatName(Z))}</span>${zoneStatus(Z)}</div>` +
        `<div class="zn-scene">${sceneSVG(Z)}${feelBubble(Z)}</div></div>`;
    }).join(`<div class="zn-apart-v" aria-hidden="true"><span>←</span>${LABELS.apart}<span>→</span></div>`) + `</div>`;
    $$('[data-zone]').forEach(el => {
      el.addEventListener('click', e => onZoneClick(e, el.dataset.zone));
      el.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        if (e.target !== el && !e.target.closest('[data-open-quadrat]')) return;
        e.preventDefault();
        onZoneClick(e, el.dataset.zone);
      });
    });
  }

  // La main dans le sol : ce qu'on sent, affiché tant que la main est l'outil pris.
  function feelBubble(Z) {
    if (state.shown !== 'hand' || !state.measured[Z].soil) return '';
    return `<div class="zn-feel" aria-live="polite">${TOOL_ICON.hand}<p>${gloss(LABELS.feel[zoneOf(Z).values.soil])}<br><b>${LABELS.feelNote}</b></p></div>`;
  }

  function onZoneClick(e, Z) {
    const onSquare = state.quadrat[Z] && e.target.closest && e.target.closest('[data-open-quadrat]');
    // Labo corrigé : on regarde seulement (le carré est la seule chose qui s'ouvre).
    if (corrected()) { if (onSquare) openQuadrat(Z); return; }
    if (state.tool) { applyTool(state.tool, Z); return; }
    if (onSquare) { openQuadrat(Z); return; }
    setCaption(state.quadrat[Z] ? LABELS.caption.quadratOpen(Z) : LABELS.caption.noTool);
  }

  /* --- Le carré vu de dessus : identifier, puis compter --- */
  function renderQuadratStage(box) {
    const Z = state.qz;
    box.innerHTML = `<div class="zn-qview">` +
      `<div class="zn-qhead"><button type="button" class="lab-btn lab-btn-ghost zn-back" data-back data-lab-look>← ${LABELS.backToZones}</button>` +
      `${letter(Z)}<span class="zn-qtitle">${gloss(LABELS.quadratHead(Z))}</span></div>` +
      `<div class="zn-qbody"><div class="zn-qframe">${quadratSVG(Z)}</div><div class="zn-idcard" data-idcard aria-live="polite"></div></div></div>`;
    $('[data-back]').addEventListener('click', () => setView('field'));
    const svg = $('[data-quadrat]');
    svg.addEventListener('click', e => {
      const g = e.target.closest('[data-uid]');
      if (g) pickItem(Z, g.dataset.uid);
    });
    svg.addEventListener('keydown', e => {
      const g = e.target.closest('[data-uid]');
      if (!g || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      pickItem(Z, g.dataset.uid);
    });
    renderIdCard();
  }

  // L'espèce entourée : celle de l'élément touché, une fois nommée.
  function circledType() {
    const it = state.pick ? itemOf(state.qz, state.pick) : null;
    return it && state.identified[it.t] ? it.t : null;
  }

  function updateItems() {
    const circled = circledType();
    $$('[data-quadrat] [data-uid]').forEach(g => {
      const it = itemOf(state.qz, g.dataset.uid);
      g.classList.toggle('is-picked', g.dataset.uid === state.pick && !circled);
      g.classList.toggle('is-circled', !!circled && it.t === circled);
      g.setAttribute('aria-label', state.identified[it.t] ? SPECIES[it.t].name : LABELS.unknown);
    });
  }

  function pickItem(Z, uid) {
    const it = itemOf(Z, uid);
    if (!it) return;
    state.pick = uid;
    state.tries = [];
    if (state.identified[it.t]) {
      noteFound(Z, it.t);
      setCaption(LABELS.caption.selected(SPECIES[it.t].name));
    } else setCaption(LABELS.caption.identify);
    updateItems();
    renderIdCard();
  }

  // Le nom choisi : juste, l'espèce entre dans la fiche ; faux, un indice.
  function chooseName(t) {
    const it = itemOf(state.qz, state.pick);
    if (!it) return;
    if (t === it.t) {
      state.identified[t] = true;
      state.tries = [];
      noteFound(state.qz, t);
      setCaption(LABELS.caption.selected(SPECIES[t].name));
    } else {
      if (!state.tries.includes(t)) state.tries.push(t);
      setCaption(LABELS.caption.wrongName, true);
    }
    updateItems();
    renderIdCard();
    if (t !== it.t) {
      const b = $(`[data-name="${t}"]`);
      if (b) { b.classList.remove('lab-shake'); void b.offsetWidth; b.classList.add('lab-shake'); }
    }
  }

  function noteFound(Z, t) {
    if (state.found[Z].includes(t)) { renderCounts(); return; }
    state.found[Z].push(t);
    renderCounts();
    updateSpecies();
    renderViews();
    renderFooter();
  }

  function renderIdCard() {
    const box = $('[data-idcard]');
    if (!box) return;
    const Z = state.qz;
    const it = state.pick ? itemOf(Z, state.pick) : null;
    if (!it) {
      box.className = 'zn-idcard is-empty';
      box.innerHTML = `<div class="zn-id-pic">${TOOL_ICON.quadrat}</div><p>${gloss(LABELS.idEmpty)}</p>`;
      return;
    }
    const pic = `<div class="zn-id-pic">${iconSVG(it.t, 'zn-id-ic')}</div>`;
    if (!state.identified[it.t]) {
      // Ordre des noms propre à l'espèce : il ne change pas d'un essai à l'autre.
      const rnd = mulberry32(seedFrom(zoneOf(Z).seed + it.t));
      const names = IDENT[it.t].choices.map(c => ({ c, k: rnd() })).sort((a, b) => a.k - b.k).map(x => x.c);
      const last = state.tries[state.tries.length - 1];
      box.className = 'zn-idcard';
      box.innerHTML = pic + `<p class="zn-id-what">${LABELS.idWhat}</p>` +
        // Chaque nom avec son trait distinctif, comme dans un guide de terrain :
        // l'élève compare avec ce qu'il voit (pas de mot souligné dans un
        // bouton, où toucher le mot devrait à la fois traduire et choisir).
        `<div class="zn-id-choices">${names.map(c => `<button type="button" class="zn-id-choice ${state.tries.includes(c) ? 'is-wrong' : ''}" data-name="${c}"><b>${SPECIES[c].name}</b><small>${SPECIES[c].key}</small></button>`).join('')}</div>` +
        (last ? `<p class="zn-id-hint">${LABELS.idWrong(SPECIES[last].name)}</p>` : '');
      box.querySelectorAll('[data-name]').forEach(b => b.addEventListener('click', () => chooseName(b.dataset.name)));
      return;
    }
    const n = state.counts[Z][it.t];
    box.className = 'zn-idcard';
    box.innerHTML = pic + `<p class="zn-id-name">${gloss(`[${SPECIES[it.t].name}]`)}</p>` +
      `<p class="zn-id-cap">${gloss(SPECIES[it.t].cap)}</p>` +
      `<p class="zn-id-count">${gloss(LABELS.idCount)}</p>` +
      (n != null ? `<p class="zn-id-state">${LABELS.idNoted(n)}</p>` : '');
  }

  /* --- Fiche de terrain : une colonne par zone, comme la fiche papier
     retournée (la place manque pour cinq colonnes). --- */
  function cellHTML(Z, f) {
    const label = LABELS.cellLabel(Z, LABELS.factors[f].toLowerCase());
    const show = lab.state.showMissing;
    const v = state.table[Z][f];
    if (!state.measured[Z][f]) {
      return `<button type="button" class="zn-cell-wait ${show ? 'lab-is-missing' : ''}" data-wait="${Z}:${f}" aria-label="${label}"></button>`;
    }
    if (f === 'soil') {
      return `<select class="lab-select zn-soil ${state.shown === 'hand' && !v ? 'is-asking' : ''} ${show && !v ? 'lab-is-missing' : ''}" data-soil="${Z}" aria-label="${label}">` +
        `<option value="">${LABELS.choose}</option>` +
        ['dry', 'moist', 'wet'].map(w => `<option value="${w}" ${v === w ? 'selected' : ''}>${LABELS.soilWords[w]}</option>`).join('') + `</select>`;
    }
    return `<input type="text" inputmode="decimal" class="zn-cell-input ${show && v == null ? 'lab-is-missing' : ''}" data-cell="${Z}:${f}" value="${v == null ? '' : fmtValue(f, v)}" maxlength="8" autocomplete="off" spellcheck="false" aria-label="${label}">`;
  }

  const speciesCount = Z => state.found[Z].length ? String(state.found[Z].length) : '—';

  function renderDatasheet() {
    const box = $('[data-datasheet]');
    if (!box) return;
    box.innerHTML = `<table class="zn-data"><thead><tr><th scope="col"></th>` +
      ZONES.map(Z => `<th scope="col"><span class="zn-th-zone">${letter(Z)}${LABELS.zone(Z)}</span></th>`).join('') + `</tr></thead><tbody>` +
      `<tr class="zn-group-row"><th scope="rowgroup" colspan="3">${LABELS.abioticHead}</th></tr>` +
      FACTORS.map(f => `<tr><th scope="row">${LABELS.factors[f]}<small>${LABELS.units[f]}</small></th>${ZONES.map(Z => `<td>${cellHTML(Z, f)}</td>`).join('')}</tr>`).join('') +
      `<tr class="zn-species-row"><th scope="row">${LABELS.factors.species}<small>${LABELS.units.species}</small></th>${ZONES.map(Z => `<td data-species="${Z}">${speciesCount(Z)}</td>`).join('')}</tr>` +
      `</tbody></table>`;
    box.querySelectorAll('[data-wait]').forEach(b => {
      const [Z, f] = b.dataset.wait.split(':');
      lab.setLock(b, LABELS.lockCell[f](Z));
    });
  }

  function updateSpecies() {
    ZONES.forEach(Z => { const td = $(`[data-species="${Z}"]`); if (td) td.textContent = speciesCount(Z); });
  }

  // Saisie dans une des deux fiches : rien n'est reconstruit (la saisie se
  // valide souvent quand l'élève touche déjà autre chose, et ce geste ne
  // doit pas être coupé).
  function onSheetChange(e) {
    const el = e.target;
    if (el.matches('[data-soil]')) {
      const Z = el.dataset.soil;
      state.table[Z].soil = el.value || null;
      el.classList.remove('is-asking', 'lab-is-missing');
      afterRecord();
      return;
    }
    let f, slot, set;
    if (el.matches('[data-cell]')) {
      const [Z, fac] = el.dataset.cell.split(':');
      f = fac;
      slot = state.table[Z];
      set = v => { slot[fac] = v; };
    } else if (el.matches('[data-count]')) {
      const [Z, t] = el.dataset.count.split(':');
      f = 'count';
      set = v => { state.counts[Z][t] = v; };
    } else return;
    const raw = el.value.trim();
    if (raw === '') { set(null); afterRecord(); return; }
    const v = parseValue(f, raw);
    if (Number.isNaN(v)) {
      el.classList.add('is-invalid');
      set(null);
      afterRecord();
      setCaption(LABELS.caption.bad[f], true);
      return;
    }
    set(v);
    el.value = f === 'count' ? String(v) : fmtValue(f, v);
    el.classList.remove('lab-is-missing', 'is-asking');
    afterRecord();
  }

  function afterRecord() {
    renderViews();
    renderFooter();
    renderIdCard();
    if (state.view === 'field' && !state.tool) setCaption(defaultCaption());
  }

  /* --- Fiche de comptage : les espèces trouvées dans chaque carré, et le
     nombre que l'élève a compté. --- */
  function renderCounts() {
    const box = $('[data-counts]');
    if (!box) return;
    const show = lab.state.showMissing;
    const circled = state.view === 'quadrat' ? circledType() : null;
    box.innerHTML = `<div class="zn-counts">` + ZONES.map(Z => {
      const rows = state.found[Z].map(t => {
        const n = state.counts[Z][t];
        const current = circled === t && state.qz === Z;
        return `<li class="${current ? 'is-current' : ''}">${iconSVG(t)}<span class="zn-count-name">${gloss(`[${SPECIES[t].name}]`)}</span>` +
          `<input type="text" inputmode="numeric" class="zn-count-input ${current && n == null ? 'is-asking' : ''} ${show && n == null ? 'lab-is-missing' : ''}" data-count="${Z}:${t}" value="${n == null ? '' : n}" maxlength="2" autocomplete="off" aria-label="${escapeHtml(LABELS.countLabel(SPECIES[t].name, Z))}"></li>`;
      }).join('');
      const missing = show && !state.found[Z].length;
      return `<section class="zn-count-col ${missing ? 'lab-is-missing' : ''}"><h4>${letter(Z)}${LABELS.zone(Z)}<small>${state.found[Z].length ? LABELS.nSpecies(state.found[Z].length) : ''}</small></h4>` +
        (rows ? `<ul>${rows}</ul>` : `<p class="zn-count-empty">${LABELS.notFound}</p>`) + `</section>`;
    }).join('') + `</div>`;
  }

  /* --- Pied de page --- */
  let stepperDone = null;

  function renderFooter() {
    const info = $('.lab-footer .lab-footer-info');
    if (info) info.textContent = LABELS.infoField(valuesWritten(), squaresDone());
    const reason = missingReason();
    const done = !reason;
    if (done && lab.state.showMissing) lab.state.showMissing = false;
    const toGraph = $('[data-to-graph]');
    if (toGraph) toGraph.hidden = !(fieldDone() && state.view !== 'graph');
    const btn = $('[data-conclude]');
    if (btn) {
      btn.classList.toggle('lab-btn-primary', done);
      btn.classList.toggle('lab-btn-ghost', !done);
      lab.setLock(btn, reason, { missing: true, key: 'conclude' });
    }
    // La barre d'étapes ne change que quand l'expérience devient complète.
    if (done !== stepperDone) { stepperDone = done; lab.renderStepper(); }
  }

  /* ===== L'histogramme (fiche outil FO5b) =====
     Une catégorie par espèce trouvée, deux bâtons (zone A, zone B hachurée),
     dont la place est marquée en pointillés, avec la lettre de la zone dessous.
     Titre, noms des axes et échelle (1 carreau = 1 individu) sont donnés :
     l'élève monte chaque bâton (glisser, ou toucher à la bonne hauteur ;
     flèches au clavier). */
  const C_EDIT = { W: 720, H: 330, L: 62, R: 18, T: 24, B: 84 };
  // Lecture (conclusion, correction) : affiché plus petit, donc écrit plus gros
  // (voir .zn-chart.is-read), avec plus de place pour les noms d'espèces.
  const C_READ = { W: 720, H: 370, L: 70, R: 18, T: 26, B: 112 };

  function chartSVG(o) {
    const mode = o.mode;
    const C = mode === 'read' ? C_READ : C_EDIT;
    const cats = categories();
    const top = yMax();
    const ph = C.H - C.T - C.B, sq = ph / top, y0 = C.H - C.B;
    const n = Math.max(1, cats.length), gw = (C.W - C.L - C.R) / n;
    const bw = Math.min(26, gw * 0.34);
    const hid = `znh${++svgUid}`;
    let out = `<svg class="zn-chart is-${mode}" data-chart viewBox="0 0 ${C.W} ${C.H}"${o.size ? ` width="${o.size[0]}" height="${o.size[1]}"` : ''} role="${mode === 'edit' ? 'group' : 'img'}" aria-label="${LABELS.chartTitle}">` +
      `<defs><pattern id="${hid}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="${ZC.B}"/><path d="M0 0 V6" stroke="#ffffff" stroke-width="1.8" stroke-opacity=".6"/></pattern></defs>`;
    for (let k = 0; k <= top; k++) {
      const y = y0 - k * sq;
      out += `<line x1="${C.L}" x2="${C.W - C.R}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${k ? '#e3e6e1' : '#a9ada4'}" stroke-width="1"/>`;
      if (top <= 10 || k % 2 === 0) out += `<text x="${C.L - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" class="zn-tick">${k}</text>`;
    }
    // Axes à la latte, terminés par une flèche ; échelle dans un coin (FO5b).
    out += `<path d="M${C.L} ${y0} V${C.T - 8}" stroke="#4d5650" stroke-width="1.4"/><path d="M${C.L - 4} ${C.T - 4} L${C.L} ${C.T - 11} L${C.L + 4} ${C.T - 4} Z" fill="#4d5650"/>` +
      `<text class="zn-scale-note" x="${C.W - C.R}" y="${C.T - 8}" text-anchor="end">${LABELS.scaleNote}</text>` +
      `<text class="zn-axis-name" transform="translate(16 ${((C.T + y0) / 2).toFixed(1)}) rotate(-90)" text-anchor="middle">${LABELS.yName}</text>` +
      `<text class="zn-axis-name" x="${(C.L + C.W - C.R) / 2}" y="${C.H - 6}" text-anchor="middle">${LABELS.xName}</text>`;
    cats.forEach((t, i) => {
      const cx = C.L + gw * (i + 0.5);
      out += `<text class="zn-cat" text-anchor="end" transform="translate(${(cx + 5).toFixed(1)} ${y0 + (mode === 'read' ? 34 : 28)}) rotate(-30)">${escapeHtml(SPECIES[t].name)}</text>`;
      ZONES.forEach((Z, zi) => {
        const v = barValue(t, Z);
        const x = zi === 0 ? cx - bw - 1.5 : cx + 1.5;
        const h = Math.min(top, v) * sq;
        const letterAB = `<text class="zn-ab is-${Z}" x="${(x + bw / 2).toFixed(1)}" y="${y0 + (mode === 'read' ? 17 : 14)}" text-anchor="middle">${Z}</text>`;
        const bar = `<rect class="zn-bar" x="${x.toFixed(1)}" y="${(y0 - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${Z === 'A' ? ZC.A : `url(#${hid})`}" stroke="${ZC[Z]}" stroke-width="1"/>` +
          `<text class="zn-bar-val" x="${(x + bw / 2).toFixed(1)}" y="${(y0 - h - 5).toFixed(1)}" text-anchor="middle">${v || ''}</text>`;
        if (mode === 'edit') {
          out += `<g class="zn-slot is-${Z}" data-slot="${t}:${Z}" tabindex="0" role="slider" aria-label="${escapeHtml(LABELS.barLabel(SPECIES[t].name, Z))}" aria-valuemin="0" aria-valuemax="${top}" aria-valuenow="${v}">` +
            `<rect class="zn-slot-hit" x="${(zi === 0 ? cx - gw / 2 : cx).toFixed(1)}" y="${C.T}" width="${(gw / 2).toFixed(1)}" height="${ph.toFixed(1)}" fill="transparent"/>` +
            `<rect class="zn-slot-guide" x="${x.toFixed(1)}" y="${C.T}" width="${bw.toFixed(1)}" height="${ph.toFixed(1)}" fill="none" stroke="${ZC[Z]}"/>` +
            `${bar}${letterAB}</g>`;
        } else out += bar + letterAB;
      });
    });
    out += `<path d="M${C.L} ${y0} H${C.W - C.R + 8}" stroke="#4d5650" stroke-width="1.4"/><path d="M${C.W - C.R + 2} ${y0 - 4} L${C.W - C.R + 9} ${y0} L${C.W - C.R + 2} ${y0 + 4} Z" fill="#4d5650"/>`;
    return out + `</svg>`;
  }

  function legendHTML() {
    return `<div class="zn-legend">` + ZONES.map(Z => `<span class="zn-legend-item"><i class="zn-key is-${Z}"></i>${LABELS.zone(Z)}</span>`).join('') + `</div>`;
  }

  function renderGraphStage(box) {
    const show = lab.state.showMissing;
    box.innerHTML = `<div class="zn-gview">` +
      `<p class="zn-graph-how">${LABELS.graphHow}</p>` +
      `<div class="zn-chart-box"><div class="zn-chart-head"><p class="zn-chart-title">${LABELS.chartTitle}</p>${legendHTML()}</div>` +
      `<div class="zn-chart-wrap ${show && barsLeft() ? 'lab-is-missing' : ''}" data-chart-wrap>${chartSVG({ mode: 'edit' })}</div></div></div>`;
    bindChart();
  }

  function bindChart() {
    const svg = $('[data-chart-wrap] svg');
    if (!svg) return;
    svg.addEventListener('pointerdown', e => {
      const slot = e.target.closest('[data-slot]');
      if (!slot || e.button !== 0) return;
      e.preventDefault();
      const [t, Z] = slot.dataset.slot.split(':');
      const id = e.pointerId;
      slot.classList.add('is-active');
      setBar(t, Z, valueAt(svg, e.clientY), slot);
      const move = ev => { if (ev.pointerId === id) setBar(t, Z, valueAt(svg, ev.clientY), slot); };
      const up = ev => {
        if (ev.pointerId !== id) return;
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        slot.classList.remove('is-active');
        afterGraph();
        lab.save();
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    });
    svg.addEventListener('keydown', e => {
      const slot = e.target.closest('[data-slot]');
      if (!slot) return;
      const d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key];
      if (!d && e.key !== 'Home') return;
      e.preventDefault();
      const [t, Z] = slot.dataset.slot.split(':');
      setBar(t, Z, e.key === 'Home' ? 0 : Math.max(0, Math.min(yMax(), barValue(t, Z) + d)), slot);
      afterGraph();
      lab.save();
    });
  }

  function valueAt(svg, clientY) {
    const m = svg.getScreenCTM();
    if (!m) return 0;
    const pt = svg.createSVGPoint();
    pt.x = 0;
    pt.y = clientY;
    const p = pt.matrixTransform(m.inverse());
    const C = C_EDIT, top = yMax(), sq = (C.H - C.T - C.B) / top, y0 = C.H - C.B;
    return Math.max(0, Math.min(top, Math.round((y0 - p.y) / sq)));
  }

  // Le bâton suit le doigt : seul ce bâton est redessiné.
  function setBar(t, Z, v, slot) {
    if (!state.bars[t]) state.bars[t] = { A: 0, B: 0 };
    if (state.bars[t][Z] === v) return;
    state.bars[t][Z] = v;
    const C = C_EDIT, top = yMax(), sq = (C.H - C.T - C.B) / top, y0 = C.H - C.B;
    const h = Math.min(top, v) * sq;
    const rect = slot.querySelector('.zn-bar');
    const text = slot.querySelector('.zn-bar-val');
    rect.setAttribute('y', (y0 - h).toFixed(1));
    rect.setAttribute('height', h.toFixed(1));
    text.setAttribute('y', (y0 - h - 5).toFixed(1));
    text.textContent = v || '';
    slot.setAttribute('aria-valuenow', String(v));
  }

  function afterGraph() {
    const wrap = $('[data-chart-wrap]');
    if (wrap && !barsLeft()) wrap.classList.remove('lab-is-missing');
    setCaption(defaultCaption());
    renderFooter();
  }

  /* ===== Étape 3 : conclusion ===== */
  function datasheetRead(opts) {
    const o = opts || {};
    return `<table class="zn-data is-read"><thead><tr><th scope="col"></th>` +
      ZONES.map(Z => `<th scope="col"><span class="zn-th-zone">${letter(Z)}${LABELS.zone(Z)}</span></th>`).join('') + `</tr></thead><tbody>` +
      `<tr class="zn-group-row"><th scope="rowgroup" colspan="3">${LABELS.abioticHead}</th></tr>` +
      FACTORS.map(f => `<tr><th scope="row">${LABELS.factors[f]}<small>${LABELS.units[f]}</small></th>${ZONES.map(Z => {
        const v = o.real ? zoneOf(Z).values[f] : state.table[Z][f];
        return `<td>${fmtValue(f, v)}</td>`;
      }).join('')}</tr>`).join('') +
      `<tr class="zn-species-row"><th scope="row">${LABELS.factors.species}<small>${o.real ? '' : LABELS.units.species}</small></th>${ZONES.map(Z => `<td>${o.real ? Object.keys(trueTally(Z)).length : speciesCount(Z)}</td>`).join('')}</tr>` +
      `</tbody></table>`;
  }

  function renderConclude() {
    followTool();   // l'outil en main ne suit plus la souris hors du terrain
    const c = state.conclusion;
    const show = lab.state.showMissing;
    const miss = k => show && !c[k] ? 'lab-is-missing' : '';
    const row = k => `<div class="zn-qrow ${miss(k)}"><span class="zn-qrow-label">${gloss(LABELS.rows[k])}</span>${k === 'influence' ? yesNoChips('c', k, c[k]) : zoneChips('c', k, c[k])}</div>`;
    const options = (k, opts, long) => `<div class="zn-chips ${long ? 'is-long' : ''}">` +
      Object.keys(opts).map(v => `<button type="button" class="lab-choice zn-chip ${long ? 'zn-chip-long' : ''} ${c[k] === v ? 'is-selected' : ''}" data-c="${k}:${v}" aria-pressed="${c[k] === v}">${opts[v]}</button>`).join('') + `</div>`;

    lab.body.innerHTML = `<div class="zn-conclude">` +
      `<section class="zn-ref">` +
        `<div class="zn-panel"><h3 class="lab-panel-title">${LABELS.sheetTitle}</h3>${datasheetRead()}</div>` +
        `<div class="zn-panel zn-ref-graph"><div class="zn-chart-head"><h3 class="lab-panel-title">${LABELS.graphTitle}</h3>${legendHTML()}</div><div class="zn-chart-wrap">${chartSVG({ mode: 'read' })}</div></div>` +
      `</section>` +
      `<section class="zn-form">` +
        `<p class="zn-reminder">${gloss(LABELS.question)}</p>` +
        `<div class="zn-form-cols"><div class="zn-form-col">` +
          `<div class="zn-q"><p class="zn-q-title">${LABELS.qFactors}</p>${row('warmer')}${row('brighter')}${row('humid')}</div>` +
          `<div class="zn-q"><p class="zn-q-title">${LABELS.qLiving}</p>${row('moss')}${row('bloom')}</div>` +
        `</div><div class="zn-form-col">` +
          `<div class="zn-q"><p class="zn-q-title">${LABELS.qAnswer}</p>${row('influence')}</div>` +
          `<div class="zn-q ${miss('verdict')}"><p class="zn-q-title">${LABELS.qVerdict}</p>${options('verdict', LABELS.verdicts)}</div>` +
        `</div></div>` +
      `</section></div>`;

    $$('[data-c]').forEach(btn => btn.addEventListener('click', () => {
      const [k, v] = btn.dataset.c.split(':');
      c[k] = v;
      if (conclusionsComplete()) lab.state.showMissing = false;
      renderConclude();
    }));

    const ready = conclusionsComplete();
    lab.renderStepper();
    lab.setFooter(`<button type="button" class="lab-btn lab-btn-ghost" data-back>← ${LABELS.backToLab}</button>` +
      (show && !ready ? lab.footerInfo(lab.L.missingConclusions, true) : '') +
      `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-check>${LABELS.checkConclusions}</button></div>`);
    $('[data-back]').addEventListener('click', () => lab.goToStep(2));
    const check = $('[data-check]');
    lab.setLock(check, ready ? null : lab.L.missingConclusions, { missing: true, key: 'check' });
    check.addEventListener('click', () => lab.finish());
  }

  /* ===== Étape 4 : correction ===== */
  const higher = (a, b) => a > b ? 'A' : b > a ? 'B' : 'same';
  const groupOf = (Z, group) => { const c = trueTally(Z); return group.reduce((s, t) => s + (c[t] || 0), 0); };

  function truth() {
    const v = Z => zoneOf(Z).values;
    return {
      warmer: higher(v('A').temp, v('B').temp),
      brighter: higher(v('A').lux, v('B').lux),
      humid: higher(v('A').air, v('B').air),
      moss: higher(groupOf('A', MOSS_FERN), groupOf('B', MOSS_FERN)),
      bloom: higher(groupOf('A', BLOOM), groupOf('B', BLOOM)),
      influence: 'yes'
    };
  }

  // Le jugement de l'hypothèse se compare aux réponses de l'élève, pas à la vérité.
  function verdictShould() {
    const same = HYP_KEYS.filter(k => state.hypothesis[k] === state.conclusion[k]).length;
    return same === HYP_KEYS.length ? 'confirmed' : same === 0 ? 'rejected' : 'partly';
  }

  /* Comptage : une espèce du carré jamais trouvée (missed), ou un nombre
     différent du vrai. Les noms sont toujours justes (l'élève ne passe pas
     un nom faux). Histogramme : chaque bâton doit avoir la hauteur du
     nombre de la fiche de comptage, même faux. */
  function evaluate() {
    const measureMiss = [];
    ZONES.forEach(Z => FACTORS.forEach(f => {
      const said = state.table[Z][f], real = zoneOf(Z).values[f];
      if (!sameValue(f, said, real)) measureMiss.push({ Z, f, said, real });
    }));

    const countMiss = [];
    ZONES.forEach(Z => {
      const real = trueTally(Z);
      Object.keys(T).filter(t => real[t]).forEach(t => {
        if (!state.found[Z].includes(t)) countMiss.push({ Z, t, said: null, real: real[t], missed: true });
        else if (state.counts[Z][t] !== real[t]) countMiss.push({ Z, t, said: state.counts[Z][t], real: real[t] });
      });
    });

    const barMiss = [];
    categories().forEach(t => ZONES.forEach(Z => {
      const want = countOf(Z, t), got = barValue(t, Z);
      if (want !== got) barMiss.push({ t, Z, want, got });
    }));

    const tr = truth();
    const c = state.conclusion;
    const qKeys = CONCL_KEYS.filter(k => k !== 'verdict');
    const wrongQ = qKeys.filter(k => c[k] !== tr[k]);

    return {
      measureMiss, countMiss, barMiss, tr, wrongQ, qKeys,
      measures: measureMiss.length === 0,
      count: countMiss.length === 0,
      graph: barMiss.length === 0,
      conclusion: wrongQ.length === 0,
      verdict: c.verdict === verdictShould()
    };
  }

  // Valeur mal recopiée, avec son unité (textes : CHECK.measMiss).
  function measText(m) {
    if (m.f === 'soil') return CHECK.measMissSoil(m.Z, m.said ? LABELS.soilWords[m.said] : null, LABELS.soilWords[m.real]);
    return CHECK.measMiss(m.Z, LABELS.factors[m.f].toLowerCase(), LABELS.instruments[m.f],
      m.said == null ? null : withUnit(m.f, m.said), withUnit(m.f, m.real));
  }

  function countNote(m) {
    return m.missed ? CHECK.countMissed(m.Z, SPECIES[m.t].name, m.real) : CHECK.countWrong(m.Z, SPECIES[m.t].name, m.said, m.real);
  }

  function answerText(k, v) {
    if (!v) return '—';
    return PHRASE[k](v);
  }

  function criterionDetail(key, ev) {
    if (key === 'measures') {
      const good = 8 - ev.measureMiss.length;
      return `<p>${CHECK.measScore(good, 8)}</p>` +
        (ev.measureMiss.length ? `<ul class="zn-misslist">${ev.measureMiss.map(m => `<li>${measText(m)}</li>`).join('')}</ul>` : `<p class="zn-ok">${CHECK.measAllGood}</p>`) +
        `<p class="zn-detail-sub">${CHECK.realValues}</p>${datasheetRead({ real: true })}`;
    }
    if (key === 'count') {
      const real = ZONES.map(Z => {
        const c = trueTally(Z);
        return `<p class="zn-detail-sub">${CHECK.realCount(Z)}</p><p class="zn-real-list">${Object.keys(T).filter(t => c[t]).map(t => `<span>${iconSVG(t)}${gloss(`[${SPECIES[t].name}]`)} <b>${c[t]}</b></span>`).join('')}</p>`;
      }).join('');
      return (ev.countMiss.length ? `<ul class="zn-misslist">${ev.countMiss.map(m => `<li>${countNote(m)}</li>`).join('')}</ul>` : `<p class="zn-ok">${CHECK.countAllGood}</p>`) + real;
    }
    if (key === 'graph') {
      return (ev.barMiss.length ? `<ul class="zn-misslist">${ev.barMiss.map(m => `<li>${CHECK.barMiss(SPECIES[m.t].name, m.Z, m.got, m.want)}</li>`).join('')}</ul>` : `<p class="zn-ok">${CHECK.barsOk}</p>`) +
        `<div class="zn-chart-wrap zn-chart-mini">${chartSVG({ mode: 'read' })}</div>`;
    }
    if (key === 'conclusion') {
      const items = ev.qKeys.map(k => {
        const ok = !ev.wrongQ.includes(k);
        const mine = answerText(k, state.conclusion[k]);
        const right = answerText(k, ev.tr[k]);
        return `<li class="${ok ? 'zn-ok-item' : 'zn-ko-item'}"><span class="zn-mark">${ok ? '✓' : '✗'}</span><span>` +
          (ok ? `${capitalize(mine)}.` : `${CHECK.youSaid} ${mine}. <b>${CHECK.right} ${right}.</b>`) +
          (!ok || k === 'influence' ? ` <span class="zn-muted">${gloss(EXPLAIN[k])}</span>` : '') + `</span></li>`;
      }).join('');
      return `<p>${CHECK.concScore(ev.qKeys.length - ev.wrongQ.length, ev.qKeys.length)}</p><ul class="zn-answers">${items}</ul>`;
    }
    const should = verdictShould();
    const rows = HYP_KEYS.map(k => {
      const same = state.hypothesis[k] === state.conclusion[k];
      const hyp = k === 'moss' ? PHRASE.hypMoss(state.hypothesis[k]) : k === 'bloom' ? PHRASE.hypBloomRow(state.hypothesis[k]) : PHRASE[k](state.hypothesis[k]);
      return `<tr><td>${hyp}</td><td>${PHRASE[k](state.conclusion[k])}</td><td class="${same ? 'zn-ok' : 'zn-ko'}">${same ? '=' : '≠'}</td></tr>`;
    }).join('');
    return `<table class="zn-hyptable"><thead><tr><th>${CHECK.hypPart}</th><th>${CHECK.answerPart}</th><th></th></tr></thead><tbody>${rows}</tbody></table>` +
      `<p class="${ev.verdict ? 'zn-ok' : 'zn-ko'}">${ev.verdict ? CHECK.verdictOk(LABELS.verdicts[state.conclusion.verdict]) : CHECK.verdictWrong(LABELS.verdicts[should])}</p>` +
      `<p class="zn-muted">${CHECK.verdictRule}</p>` + (should !== 'confirmed' ? `<p class="zn-muted">${CHECK.rejectedNote}</p>` : '');
  }

  const CRITS = ['measures', 'count', 'graph', 'conclusion', 'verdict'];

  function renderCheck() {
    const ev = evaluate();
    const score = CRITS.filter(k => ev[k]).length;
    const rows = CRITS.map(k => `<button type="button" class="zn-crit ${ev[k] ? 'is-ok' : 'is-ko'} ${state.crit === k ? 'is-selected' : ''}" data-crit="${k}">` +
      `<span class="zn-crit-text"><strong>${LABELS.criteria[k]}</strong><small>${LABELS.criteriaSub[k]}</small></span>` +
      `<span class="zn-crit-mark" aria-label="${ev[k] ? LABELS.markCorrect : LABELS.markIncorrect}">${ev[k] ? '✓' : '✗'}</span></button>`).join('');

    lab.body.innerHTML = `<div class="zn-check">` +
      `<div class="zn-check-left">` +
        `<div class="lab-score"><span class="lab-score-num">${score}<small> / ${CRITS.length}</small></span><span class="lab-score-label">${LABELS.scoreLabel}</span></div>` +
        `<div class="zn-crit-list">${rows}</div>` +
      `</div>` +
      `<div class="zn-check-detail" aria-live="polite"><h3>${LABELS.criteria[state.crit]}</h3>${criterionDetail(state.crit, ev)}</div>` +
      `</div>`;

    $$('[data-crit]').forEach(btn => btn.addEventListener('click', () => {
      state.crit = btn.dataset.crit;
      renderCheck();
    }));
    lab.fillSpace(lab.$('.zn-check-detail'));
    lab.checkFooter();
  }

  /* ===== Rapport imprimable : contenu des 7 sections de la fiche outil FO3
     (en-tête, numérotation et mise en page : cadre commun) =====
     Les erreurs passent par mark() (lab-engine.js) : valeur mal recopiée et
     nombre faux encadrés dans les tableaux, espèce oubliée encadrée (ligne
     ajoutée à la fiche de comptage), histogramme encadré si des bâtons sont
     faux, réponses fausses soulignées dans l'interprétation et la conclusion. */
  function buildReport(mark) {
    const R = LABELS.report;
    const ev = evaluate();
    const h = state.hypothesis;
    const c = state.conclusion;

    const hyp = R.hypothesis(PHRASE.warmer(h.warmer), PHRASE.brighter(h.brighter), PHRASE.humid(h.humid),
      PHRASE.hypMoss(h.moss), PHRASE.hypBloom(h.bloom), PHRASE.influence(h.influence));

    // Fiche de terrain : les zones en lignes, comme la fiche papier.
    const measMiss = new Map(ev.measureMiss.map(m => [`${m.Z}-${m.f}`, m]));
    const dataHead = `<tr><th>${R.zoneCol}</th>${FACTORS.map(f => `<th>${LABELS.factors[f]} ${f === 'soil' ? '' : LABELS.units[f]}</th>`).join('')}<th>${LABELS.factors.species}</th></tr>`;
    const dataBody = ZONES.map(Z => {
      const cells = FACTORS.map(f => {
        const m = measMiss.get(`${Z}-${f}`);
        const text = fmtValue(f, state.table[Z][f]);
        return `<td>${m ? mark(text, measText(m), { box: true }) : text}</td>`;
      }).join('');
      const real = Object.keys(T).filter(t => trueTally(Z)[t]);
      const n = state.found[Z].length;
      const species = n === real.length ? String(n)
        : mark(String(n), R.speciesMiss(Z, real.length, real.map(t => SPECIES[t].name).join(', ')), { box: true });
      return `<tr><th>${Z} · ${plain(habitatName(Z))}</th>${cells}<td>${species}</td></tr>`;
    }).join('');

    // Fiche de comptage : les espèces trouvées, plus celles oubliées.
    const rowsT = Object.keys(T).filter(t => categories().includes(t) || ev.countMiss.some(m => m.t === t));
    const countBody = rowsT.map(t => `<tr><th>${SPECIES[t].name}</th>${ZONES.map(Z => {
      const n = state.found[Z].includes(t) ? state.counts[Z][t] : null;
      const m = ev.countMiss.find(x => x.Z === Z && x.t === t);
      const text = n == null ? '—' : String(n);
      return `<td>${m ? mark(text, countNote(m), { box: true }) : text}</td>`;
    }).join('')}</tr>`).join('') || `<tr><td colspan="3">${R.nothing}</td></tr>`;

    let chart = `<div class="zn-report-chart">${chartSVG({ mode: 'print', size: [520, 238] })}<div class="zn-report-legend">${ZONES.map(Z => `<span><i class="zn-key is-${Z}"></i>${LABELS.zone(Z)}</span>`).join('')}</div></div>`;
    if (ev.barMiss.length) chart = mark(chart, R.barsWrong(ev.barMiss.map(m => R.barWrong(SPECIES[m.t].name, m.Z, m.got, m.want)).join(', ')), { box: true });

    const said = k => {
      const text = answerText(k, c[k]);
      return ev.wrongQ.includes(k) ? mark(text, `${capitalize(answerText(k, ev.tr[k]))}. ${plain(EXPLAIN[k])}`) : text;
    };
    const interp = R.interpretation(said('warmer'), said('brighter'), said('humid'), said('moss'), said('bloom'));
    let verdictWord = LABELS.verdicts[c.verdict] || '—';
    if (!ev.verdict) verdictWord = mark(verdictWord, `${CHECK.verdictWrong(LABELS.verdicts[verdictShould()])} ${CHECK.verdictRule}`);
    const conclusion = R.conclusion(said('influence'), verdictWord);

    const correction = CRITS.map(k => `<tr><th>${LABELS.criteria[k]}</th><td class="${ev[k] ? 'ok' : 'ko'}">${ev[k] ? '✓' : '✗'}</td></tr>`).join('');

    return {
      title: R.title,
      sections: [
        `<p>${R.question}</p><p>${R.questionCase(plain(habitatName('A')).toLowerCase(), plain(habitatName('B')).toLowerCase())}</p>`,
        `<p>${hyp}</p>` + (state.because.trim() ? `<p>${R.because}: ${escapeHtml(state.because.trim())}</p>` : ''),
        `<p>${R.materials}</p>`,
        `<ol>${R.procedure.map(p => `<li>${p}</li>`).join('')}</ol>`,
        `<table class="zn-report-table"><caption>${R.sheetCaption}</caption>${dataHead}${dataBody}</table>` +
          `<div class="zn-report-results"><table class="zn-report-count"><caption>${R.countCaption}</caption><tr><th>${R.species}</th>${ZONES.map(Z => `<th>${LABELS.zone(Z)}</th>`).join('')}</tr>${countBody}</table>` +
          `<div class="zn-report-graph"><p class="zn-report-graph-title">${LABELS.chartTitle}</p>${chart}</div></div>`,
        `<p>${interp}</p>`,
        `<p>${conclusion}</p>`
      ],
      correction: `<p><strong>${R.score(CRITS.filter(k => ev[k]).length)}</strong></p>` +
        `<table class="zn-report-corr">${correction}</table>`
    };
  }

  lab = LabEngine.create({
    id: 'zones',
    title: LABELS.title,
    glossary: GLOSSARY,
    reset,
    stepComplete,
    lockReason,
    isStarted: () => HYP_KEYS.some(k => state.hypothesis[k]) || started(),
    render: { 1: renderPredict, 2: renderExperiment, 3: renderConclude, 4: renderCheck },
    report: buildReport,
    version: 3,
    save: () => ({ state: Object.assign({}, state, { tool: null }) }),
    load(data) {
      const s = data.state;
      if (!s || !s.zones || !s.found || !ZONES.every(Z => s.zones[Z] && HABITATS[s.zones[Z].key] && Array.isArray(s.zones[Z].items))) throw new Error('labProgress');
      state = Object.assign(s, { tool: null });
      stepperDone = null;
    },
    summary() {
      const ev = evaluate();
      const criteria = {};
      CRITS.forEach(k => { criteria[k] = ev[k]; });
      return {
        score: CRITS.filter(k => ev[k]).length,
        total: CRITS.length,
        criteria,
        labels: LABELS.criteria, // noms des critères, pour le tableau de bord
        details: {
          zones: `${zoneOf('A').key}-${zoneOf('B').key}`,
          valuesRight: 8 - ev.measureMiss.length,
          countMistakes: ev.countMiss.length,
          barMistakes: ev.barMiss.length,
          wrongAnswers: ev.wrongQ
        }
      };
    }
  });
})();
