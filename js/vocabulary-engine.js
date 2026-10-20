// Language is inferred from the URL (.../en/... vs .../nl/...) so this one
// shared script can render correct labels and speech-synthesis voice on both
// immersion tracks. The vocabulary data itself still uses "english"/"french"
// field names on both tracks (an nl chapter's vocabulary.json stores its Dutch
// words under "english") — only the on-screen labels change here.
const pageLang = location.pathname.split('/').includes('nl') ? 'nl' : 'en';

const LABELS = {
  en: {
    targetBadge: 'EN',
    listen: 'Listen',
    iKnow: 'I know it',
    notYet: 'Not yet',
    pronounceAria: 'Pronounce word',
    speechLang: 'en-US',
    speechUnsupported: 'Speech synthesis is not supported in this browser.',
    known: 'Known',
    reviewOnly: n => `Only words to review (${n})`,
    progress: (k, n) => `${k} / ${n} words known`,
    resetAsk: k => k === 1 ? 'Forget the word marked as known?' : `Forget the ${k} words marked as known?`,
    resetYes: 'Yes, reset',
    resetNo: 'Cancel',
    endTitle: 'End of the pack',
    reviewLeft: n => n === 1 ? 'Review the last word left' : `Review the ${n} words left`,
    restart: 'Start the pack again',
    allKnownTitle: 'All words known!',
    allKnownText: 'Well done. Go through them again from time to time so you don’t forget them.',
    againAll: 'Go through all the words'
  },
  nl: {
    targetBadge: 'NL',
    listen: 'Luister',
    iKnow: 'Ik ken het',
    notYet: 'Nog niet',
    pronounceAria: 'Woord uitspreken',
    speechLang: 'nl-BE',
    speechUnsupported: 'Spraaksynthese wordt niet ondersteund in deze browser.',
    known: 'Gekend',
    reviewOnly: n => `Alleen te herhalen woorden (${n})`,
    progress: (k, n) => `${k} / ${n} woorden gekend`,
    resetAsk: k => k === 1 ? 'Het gekende woord wissen?' : `De ${k} gekende woorden wissen?`,
    resetYes: 'Ja, wissen',
    resetNo: 'Annuleren',
    endTitle: 'Einde van de stapel',
    reviewLeft: n => n === 1 ? 'Herhaal het laatste woord' : `Herhaal de ${n} overige woorden`,
    restart: 'De stapel opnieuw',
    allKnownTitle: 'Alle woorden gekend!',
    allKnownText: 'Goed gedaan. Herhaal ze af en toe, zodat je ze niet vergeet.',
    againAll: 'Alle woorden nog eens'
  }
};
const L = LABELS[pageLang];

const container = document.getElementById('flashcard-container');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const modeButtons = document.querySelectorAll('.mode-button');
const reviewOnlyBox = document.getElementById('review-only');
const reviewOnlyText = document.getElementById('review-only-text');
const knownActions = document.getElementById('known-actions');
const knowButton = document.getElementById('know-button');
const notYetButton = document.getElementById('not-yet-button');
const knownProgress = document.getElementById('known-progress');
const knownCount = document.getElementById('known-count');
const knownBar = document.getElementById('known-bar');
const resetButton = document.getElementById('known-reset');
const resetConfirm = document.getElementById('known-reset-confirm');
const resetQuestion = document.getElementById('known-reset-question');
const resetYesButton = document.getElementById('known-reset-yes');
const resetNoButton = document.getElementById('known-reset-no');

let currentMode = 'english-first';
// 'all' : tout le vocabulaire ; 'review' : seulement les mots pas encore sus
// au moment où le paquet est tiré. Indépendant de la langue (currentMode).
let currentFilter = 'all';
// currentCardIndex === cards.length : écran de fin du paquet.
let currentCardIndex = 0;
let cards = [];
let vocabularyData = [];
let advanceTimer = null;

/* Mots sus : famille vocabKnown de storage.js, un mot = une clé (la date où il
   a été marqué). La clé est le mot lui-même (champ english, sans balise) :
   corriger un mot dans vocabulary.json lui fait perdre sa marque. Même calcul
   dans le tableau de bord (dashboard-data.js, wordKey). */
const knownWords = new Set();

function wordKey(item) {
  return String(item.english || '').replace(/<[^>]*>/g, '').trim();
}

function loadKnownWords() {
  knownWords.clear();
  vocabularyData.forEach(item => {
    const key = wordKey(item);
    if (SiteStorage.data.get('vocabKnown', [key]) !== null) knownWords.add(key);
  });
}

function setKnown(item, known) {
  const key = wordKey(item);
  if (known === knownWords.has(key)) return;
  if (known) {
    knownWords.add(key);
    SiteStorage.data.set('vocabKnown', [key], Date.now());
  } else {
    knownWords.delete(key);
    SiteStorage.data.remove('vocabKnown', [key]);
  }
}

// Session-level counters for the vocabulary_session_ended log (see
// sendSessionSnapshot below) — distinct from currentCardIndex/cards, which
// only describe the current pack, not the whole session across mode changes.
const viewedCardIndices = new Set();
let flipCount = 0;
let listenCount = 0;
let sessionEnded = false;
let lastFlushThreshold = 0;

// Fixed once per page load, so every snapshot sent during this visit
// (mode-switch reshuffles, the 20-card safety flush, repeated
// visibilitychange on tab-switch, the final pagehide) carries the same id —
// letting downstream logs tell "another snapshot of this visit" apart from
// "a new visit", and sum activity across visits without double-counting.
const sessionId = (window.crypto && crypto.randomUUID)
  ? crypto.randomUUID()
  : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);

function sendSessionSnapshot(eventName) {
  if (!window.logEventBeacon) return;
  if (viewedCardIndices.size === 0 && flipCount === 0 && listenCount === 0) return;
  window.logEventBeacon(eventName, {
    sessionId,
    nbCartesVues: viewedCardIndices.size,
    nbCartesTotal: cards.length,
    nbRetournees: flipCount,
    nbEcoutes: listenCount
  });
}

// pagehide fires reliably on tab close/navigation (unlike the deprecated
// beforeunload/unload, which also break the back-forward cache); visibility
// change is a backup for cases like switching apps on a Chromebook, where
// pagehide doesn't always fire — it doesn't mark the session over since the
// student may come back to the same tab.
window.addEventListener('pagehide', () => {
  if (sessionEnded) return;
  sessionEnded = true;
  sendSessionSnapshot('vocabulary_session_ended');
});

document.addEventListener('visibilitychange', () => {
  if (sessionEnded || document.visibilityState !== 'hidden') return;
  sendSessionSnapshot('vocabulary_session_ended');
});

function shuffleArray(array) {
  const cloned = array.slice();
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

function getCardSides(item, mode) {
  if (mode === 'english-first') {
    return { frontLanguage: 'english', backLanguage: 'french' };
  }
  if (mode === 'french-first') {
    return { frontLanguage: 'french', backLanguage: 'english' };
  }
  const randomFront = Math.random() < 0.5 ? 'english' : 'french';
  return { frontLanguage: randomFront, backLanguage: randomFront === 'english' ? 'french' : 'english' };
}

function initializeCards(mode) {
  // Shuffle a list of indices into vocabularyData, rather than the items
  // themselves: vocabId then always identifies the same word, even after a
  // mode change reshuffles the pack and would otherwise hand out the same
  // 0..n-1 slots to different words (see viewedCardIndices below).
  // En « To review », le paquet est fixé ici : un mot marqué sus en cours de
  // route y reste jusqu'au tour suivant, pour que le compteur ne saute pas.
  const ids = vocabularyData.map((_, i) => i)
    .filter(i => currentFilter === 'all' || !knownWords.has(wordKey(vocabularyData[i])));
  const order = shuffleArray(ids);
  cards = order.map(vocabId => {
    const item = vocabularyData[vocabId];
    const sides = getCardSides(item, mode);
    return {
      vocabId,
      english: item.english,
      french: item.french,
      definitionEnglish: item.definitionEnglish || item.definition || '',
      definitionFrench: item.definitionFrench || item.definition || '',
      frontLanguage: sides.frontLanguage,
      backLanguage: sides.backLanguage,
      isFlipped: false
    };
  });
}

function startPack(filter) {
  if (filter) currentFilter = filter;
  reviewOnlyBox.checked = currentFilter === 'review';
  currentCardIndex = 0;
  initializeCards(currentMode);
  renderCurrentCard();
}

// Case « Only words to review » (nombre), ligne de progression et barre : tout ce qui dépend
// des mots sus, mis à jour après chaque marque.
function updateKnownDisplay() {
  const total = vocabularyData.length;
  const known = vocabularyData.filter(item => knownWords.has(wordKey(item))).length;
  reviewOnlyText.textContent = L.reviewOnly(total - known);
  // Grisée tant qu'aucun mot n'est sus (elle montrerait tout le paquet),
  // mais jamais quand elle est cochée : l'élève doit pouvoir la décocher.
  reviewOnlyBox.disabled = known === 0 && !reviewOnlyBox.checked;
  reviewOnlyBox.parentElement.classList.toggle('is-disabled', reviewOnlyBox.disabled);
  knownCount.textContent = L.progress(known, total);
  knownBar.style.width = total ? `${(known / total) * 100}%` : '0';
  resetButton.hidden = known === 0 || !resetConfirm.hidden;
  knownProgress.hidden = total === 0;
}

// Boutons « I know it / Not yet » : sur chaque carte, retournée ou non
// (l'élève peut savoir le mot sans voir la réponse) ; cachés sur l'écran de
// fin, leur place restant réservée.
function updateKnownActions() {
  const card = cards[currentCardIndex];
  const visible = !!card;
  knownActions.classList.toggle('is-hidden', !visible);
  knownActions.setAttribute('aria-hidden', String(!visible));
  [knowButton, notYetButton].forEach(btn => { btn.tabIndex = visible ? 0 : -1; });
  const known = !!card && knownWords.has(wordKey(card));
  knowButton.classList.toggle('is-current', known);
  knowButton.setAttribute('aria-pressed', String(known));
}

/* Choix explicite de la voix plutôt que de s'en remettre au navigateur.
   Toutes les machines n'ont pas de voix nl-BE : sur un poste qui n'a que
   nl-NL, laisser le navigateur décider peut aussi bien donner la voix
   néerlandaise que la voix par défaut du système — française ou anglaise, donc
   pire que rien. On descend donc explicitement : la variante demandée d'abord,
   puis n'importe quelle voix de la même langue, puis le choix du navigateur. */
function pickVoice(preferred) {
  const voices = (window.speechSynthesis.getVoices && window.speechSynthesis.getVoices()) || [];
  if (!voices.length) return null;
  const norm = tag => String(tag || '').toLowerCase().replace('_', '-');
  const want = norm(preferred);
  const base = want.split('-')[0];
  return voices.find(v => norm(v.lang) === want)
      || voices.find(v => norm(v.lang).split('-')[0] === base)
      || null;
}

function speakWord(text) {
  if (!window.speechSynthesis) {
    alert(L.speechUnsupported);
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = L.speechLang;
  const voice = pickVoice(L.speechLang);
  if (voice) utterance.voice = voice;
  utterance.rate = 0.95;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function updateNavigation() {
  prevButton.disabled = currentCardIndex === 0;
  nextButton.disabled = currentCardIndex >= cards.length;
}

// Écran de fin : après la dernière carte (Next ou une marque), ou tout de
// suite en « To review » quand il ne reste aucun mot.
function renderEndScreen() {
  const total = vocabularyData.length;
  const left = vocabularyData.filter(item => !knownWords.has(wordKey(item))).length;
  const actions = [];
  if (left === 0) {
    actions.push({ label: L.againAll, filter: 'all' });
  } else {
    actions.push({ label: L.reviewLeft(left), filter: 'review' });
    if (currentFilter === 'all') actions.push({ label: L.restart, filter: 'all' });
  }
  container.innerHTML = `
    <div class="flashcard-end">
      <h2 class="flashcard-end-title">${left === 0 ? L.allKnownTitle : L.endTitle}</h2>
      <p class="flashcard-end-text">${left === 0 ? L.allKnownText : L.progress(total - left, total)}</p>
      <div class="flashcard-end-actions"></div>
    </div>
  `;
  const box = container.querySelector('.flashcard-end-actions');
  actions.forEach((action, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'flashcard-end-btn' + (i === 0 ? ' is-main' : '');
    btn.textContent = action.label;
    btn.addEventListener('click', () => startPack(action.filter));
    box.appendChild(btn);
  });
  updateNavigation();
  updateKnownActions();
}

// Icônes dessinées (même trait que les boutons ✗ / ✓ du template).
const ICONS = {
  listen: '<svg class="flashcard-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M3.5 8v4h3l4 3.5v-11L6.5 8z"/><path d="M13.5 7.5a3.5 3.5 0 0 1 0 5M15.8 5.2a6.8 6.8 0 0 1 0 9.6"/></svg>',
  flip: '<svg class="flashcard-flip-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 9a6 6 0 0 1 10.4-3.6L16 7"/><path d="M16 3v4h-4"/><path d="M16 11a6 6 0 0 1-10.4 3.6L4 13"/><path d="M4 17v-4h4"/></svg>',
  yes: '<svg class="flashcard-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4.5 10.5l3.8 3.8 7.2-8.6"/></svg>',
  no: '<svg class="flashcard-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5.5 5.5l9 9M14.5 5.5l-9 9"/></svg>'
};

const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Retourne la carte affichée (clic, Entrée, Espace) ; null sur l'écran de fin.
let flipCurrentCard = null;

function faceHtml(card, lang, definition, isKnown) {
  const isTarget = lang === 'english';
  return `
    <div class="flashcard-top">
      <span class="flashcard-tags">
        <span class="flashcard-badge">${isTarget ? L.targetBadge : 'FR'}</span>
        ${isKnown ? `<span class="flashcard-known">${L.known}</span>` : ''}
      </span>
      ${isTarget ? `<button type="button" class="flashcard-listen-btn" aria-label="${L.pronounceAria}">${ICONS.listen}<span>${L.listen}</span></button>` : ''}
    </div>
    <div class="flashcard-body">
      <h2 class="flashcard-title">${richText(card[lang])}</h2>
      ${definition ? `<p class="flashcard-definition">${richText(definition)}</p>` : ''}
    </div>
    ${ICONS.flip}
  `;
}

/* Taille du mot mesurée, pas supposée : on part de 36 px et on réduit tant
   que le mot déborde de la carte ou dépasse deux lignes. À refaire quand la
   police Poppins arrive (elle change les largeurs) et quand la fenêtre
   change de taille. */
const TITLE_MAX = 36;
const TITLE_MIN = 22;

function fitTitles(root) {
  if (!root) return;
  root.querySelectorAll('.flashcard-title').forEach(el => {
    let size = TITLE_MAX;
    el.style.fontSize = size + 'px';
    const tooBig = () => el.scrollWidth > el.clientWidth + 1 || el.offsetHeight > size * 1.15 * 2 + 4;
    while (size > TITLE_MIN && tooBig()) {
      size -= 2;
      el.style.fontSize = size + 'px';
    }
  });
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => fitTitles(container.querySelector('.flashcard')));
}
let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => fitTitles(container.querySelector('.flashcard')), 150);
});

/* Glisser la carte (doigt ou souris) : vers la droite = « I know it », vers la
   gauche = « Not yet », comme la place des deux boutons. La carte suit le
   geste ; au-delà du seuil, la réponse est donnée au lâcher, sinon la carte
   revient. Un geste surtout vertical est laissé au défilement de la page. */
const SWIPE_THRESHOLD = 0.28; // part de la largeur de la carte

function enableSwipe(article) {
  const overlay = article.querySelector('.flashcard-swipe');
  const label = overlay.querySelector('.flashcard-swipe-label');
  let start = null;
  let dx = 0;
  let side = 0;

  article.addEventListener('pointerdown', event => {
    if (event.button !== 0 || advanceTimer || event.target.closest('.flashcard-listen-btn')) return;
    start = { x: event.clientX, y: event.clientY, id: event.pointerId, dragging: false };
    dx = 0;
    delete article.dataset.dragged;
  });

  article.addEventListener('pointermove', event => {
    if (!start || event.pointerId !== start.id) return;
    const mx = event.clientX - start.x;
    const my = event.clientY - start.y;
    if (!start.dragging) {
      if (Math.abs(mx) < 10) return;
      if (Math.abs(my) > Math.abs(mx)) { start = null; return; }
      start.dragging = true;
      article.dataset.dragged = '1';
      // L'animation d'arrivée tiendrait sinon la carte en place.
      article.classList.remove('is-entering');
      article.classList.add('is-dragging');
      try { article.setPointerCapture(event.pointerId); } catch (e) { /* pointeur déjà relâché */ }
    }
    dx = mx;
    article.style.transform = `translateX(${dx}px) rotate(${dx / 25}deg)`;
    const newSide = dx > 0 ? 1 : -1;
    if (newSide !== side) {
      side = newSide;
      overlay.className = 'flashcard-swipe ' + (side > 0 ? 'is-yes' : 'is-no');
      label.innerHTML = side > 0 ? ICONS.yes + L.iKnow : ICONS.no + L.notYet;
    }
    overlay.style.opacity = Math.min(1, Math.abs(dx) / (article.offsetWidth * SWIPE_THRESHOLD));
  });

  const end = event => {
    if (!start || event.pointerId !== start.id) return;
    const wasDragging = start.dragging;
    start = null;
    if (!wasDragging) return;
    article.classList.remove('is-dragging');
    if (event.type === 'pointerup' && Math.abs(dx) >= article.offsetWidth * SWIPE_THRESHOLD) {
      markCurrentCard(dx > 0);
    } else {
      article.style.transform = '';
      overlay.style.opacity = 0;
    }
  };
  article.addEventListener('pointerup', end);
  article.addEventListener('pointercancel', end);
}

function renderCurrentCard() {
  clearTimeout(advanceTimer);
  advanceTimer = null;
  flipCurrentCard = null;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  updateKnownDisplay();

  if (currentCardIndex >= cards.length) {
    renderEndScreen();
    return;
  }

  const card = cards[currentCardIndex];
  const isKnown = knownWords.has(wordKey(card));
  viewedCardIndices.add(card.vocabId);
  if (viewedCardIndices.size >= lastFlushThreshold + 20) {
    lastFlushThreshold = Math.floor(viewedCardIndices.size / 20) * 20;
    sendSessionSnapshot('vocabulary_session_ended');
  }
  const frontDefinition = card.frontLanguage === 'english' ? card.definitionEnglish : card.definitionFrench;
  const backDefinition = card.backLanguage === 'english' ? card.definitionEnglish : card.definitionFrench;
  container.innerHTML = '';

  // Une carte revue (Previous) repart côté question.
  card.isFlipped = false;

  const article = document.createElement('article');
  article.className = 'flashcard' + (reducedMotion() ? '' : ' is-entering');
  article.dataset.index = card.vocabId;
  article.setAttribute('tabindex', '0');
  article.setAttribute('role', 'button');
  article.setAttribute('aria-pressed', 'false');
  article.innerHTML = `
    <div class="flashcard-inner">
      <section class="flashcard-face flashcard-front">${faceHtml(card, card.frontLanguage, frontDefinition, isKnown)}</section>
      <section class="flashcard-face flashcard-back">${faceHtml(card, card.backLanguage, backDefinition, isKnown)}</section>
    </div>
    <div class="flashcard-swipe" aria-hidden="true"><span class="flashcard-swipe-label"></span></div>
  `;
  article.addEventListener('animationend', () => article.classList.remove('is-entering'), { once: true });
  container.appendChild(article);
  fitTitles(article);

  updateNavigation();
  updateKnownActions();

  function toggleCard() {
    card.isFlipped = !card.isFlipped;
    article.classList.toggle('is-flipped', card.isFlipped);
    article.setAttribute('aria-pressed', card.isFlipped.toString());
    flipCount++;
  }
  flipCurrentCard = toggleCard;

  article.addEventListener('click', event => {
    // Fin d'un glissé : ce n'est pas un appui pour retourner la carte.
    if (article.dataset.dragged) { delete article.dataset.dragged; return; }
    if (event.target.closest('.flashcard-listen-btn')) return;
    toggleCard();
  });

  article.querySelectorAll('.flashcard-listen-btn').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      listenCount++;
      speakWord(card.english);
    });
  });

  enableSwipe(article);
}

// « I know it » / « Not yet » (bouton, glissé ou touche K / N) : la marque
// est enregistrée tout de suite, la carte part du côté de la réponse (droite
// pour « I know it », gauche pour « Not yet »), puis la suivante arrive.
// storage.js regroupe les écritures : plusieurs marques rapides partent
// ensemble.
function markCurrentCard(known) {
  const card = cards[currentCardIndex];
  if (!card || advanceTimer) return;
  setKnown(card, known);
  if (window.logEvent) window.logEvent('vocabulary_word_marked', { known });
  updateKnownDisplay();
  updateKnownActions();
  const article = container.querySelector('.flashcard');
  const still = reducedMotion();
  if (article && !still) {
    const overlay = article.querySelector('.flashcard-swipe');
    overlay.className = 'flashcard-swipe ' + (known ? 'is-yes' : 'is-no');
    overlay.querySelector('.flashcard-swipe-label').innerHTML = known ? ICONS.yes + L.iKnow : ICONS.no + L.notYet;
    overlay.style.opacity = 1;
    const dir = known ? 1 : -1;
    article.classList.remove('is-dragging', 'is-entering');
    article.style.transition = 'transform 0.3s ease-in, opacity 0.3s ease-in';
    article.style.transform = `translateX(${dir * 115}%) rotate(${dir * 10}deg)`;
    article.style.opacity = '0';
  }
  advanceTimer = setTimeout(() => {
    currentCardIndex++;
    renderCurrentCard();
  }, still ? 150 : 300);
}

function showResetConfirm(show) {
  resetConfirm.hidden = !show;
  knownCount.hidden = show;
  knownBar.parentElement.hidden = show;
  resetButton.hidden = show || knownWords.size === 0;
  if (show) {
    resetQuestion.textContent = L.resetAsk(knownWords.size);
    resetNoButton.focus();
  }
}

// Même message que dans practice-engine.js, volontiers en français quelle que
// soit la filière : une panne n'est pas du contenu de cours, elle ne s'adresse
// pas à l'élève dans la langue d'immersion.
function showLoadError() {
  container.innerHTML = `
    <div class="load-error">Erreur de chargement. Recharge la page, et préviens ton professeur si cela se reproduit.</div>
  `;
}

async function loadVocabulary() {
  try {
    // Cache-buster, comme practice-engine.js : GitHub Pages sert les fichiers
    // avec 10 minutes de durée de vie, et les élèves verraient sinon l'ancien
    // contenu après une correction faite depuis l'outil admin.
    const response = await fetch('./vocabulary.json?v=' + Date.now());
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    vocabularyData = await response.json();
    // Les mots sus viennent de Firestore : attendre la lecture du chapitre.
    await SiteStorage.ready;
    loadKnownWords();
    startPack();
  } catch (error) {
    showLoadError();
    console.error(error);
  }
}

/* Clavier : Espace retourne la carte (Entrée aussi quand elle a le focus),
   K = « I know it », N = « Not yet » (mêmes lettres en néerlandais : Ik Ken
   het, Nog niet), flèches = carte précédente / suivante, comme les boutons
   ← →. Rien quand on écrit dans un champ ; Espace et Entrée gardent leur rôle
   sur un bouton ou une case. */
document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const el = document.activeElement;
  const tag = el ? el.tagName : '';
  if (tag === 'TEXTAREA' || tag === 'SELECT' || (tag === 'INPUT' && el.type !== 'checkbox')) return;
  if (document.querySelector('.modal-overlay.modal-open')) return;
  const onControl = tag === 'BUTTON' || tag === 'A' || tag === 'INPUT';
  const onCard = !!el && el.classList.contains('flashcard');
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if ((key === ' ' && !onControl) || (key === 'Enter' && onCard)) {
    if (!flipCurrentCard) return; // écran de fin : Espace fait défiler la page
    flipCurrentCard();
  } else if (key === 'k') {
    markCurrentCard(true);
  } else if (key === 'n') {
    markCurrentCard(false);
  } else if (key === 'ArrowLeft' && !(tag === 'INPUT')) {
    prevButton.click();
  } else if (key === 'ArrowRight' && !(tag === 'INPUT')) {
    nextButton.click();
  } else {
    return;
  }
  event.preventDefault();
});

prevButton.addEventListener('click', () => {
  if (currentCardIndex > 0) {
    currentCardIndex--;
    renderCurrentCard();
  }
});

nextButton.addEventListener('click', () => {
  if (currentCardIndex < cards.length) {
    currentCardIndex++;
    renderCurrentCard();
  }
});

modeButtons.forEach(button => {
  button.addEventListener('click', () => {
    modeButtons.forEach(btn => {
      btn.classList.toggle('active', btn === button);
      btn.setAttribute('aria-pressed', String(btn === button));
    });
    currentMode = button.dataset.mode;
    startPack();
  });
});

reviewOnlyBox.addEventListener('change', () => startPack(reviewOnlyBox.checked ? 'review' : 'all'));

knowButton.addEventListener('click', () => markCurrentCard(true));
notYetButton.addEventListener('click', () => markCurrentCard(false));

resetButton.addEventListener('click', () => showResetConfirm(true));
resetNoButton.addEventListener('click', () => {
  showResetConfirm(false);
  resetButton.focus();
});
resetYesButton.addEventListener('click', () => {
  vocabularyData.forEach(item => setKnown(item, false));
  showResetConfirm(false);
  startPack();
});

loadVocabulary();
