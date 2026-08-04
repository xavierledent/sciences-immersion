// Language is inferred from the URL (.../en/... vs .../nl/...) so this one
// shared script can render correct labels and speech-synthesis voice on both
// immersion tracks. The vocabulary data itself still uses "english"/"french"
// field names on both tracks (an nl chapter's vocabulary.json stores its Dutch
// words under "english") — only the on-screen labels change here.
const pageLang = location.pathname.split('/').includes('nl') ? 'nl' : 'en';

const LABELS = {
  en: {
    targetBadge: 'EN',
    listen: '🔊 Listen',
    pronounceAria: 'Pronounce word',
    speechLang: 'en-US',
    speechUnsupported: 'Speech synthesis is not supported in this browser.'
  },
  nl: {
    targetBadge: 'NL',
    listen: '🔊 Luister',
    pronounceAria: 'Woord uitspreken',
    speechLang: 'nl-BE',
    speechUnsupported: 'Spraaksynthese wordt niet ondersteund in deze browser.'
  }
};
const L = LABELS[pageLang];

const container = document.getElementById('flashcard-container');
const cardCounter = document.getElementById('card-counter');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const modeButtons = document.querySelectorAll('.mode-button');

let currentMode = 'english-first';
let currentCardIndex = 0;
let cards = [];
let vocabularyData = [];

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
  const shuffledVocabulary = shuffleArray(vocabularyData);
  cards = shuffledVocabulary.map((item, index) => {
    const sides = getCardSides(item, mode);
    return {
      index,
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

function renderCurrentCard() {
  if (cards.length === 0) return;

  if (window.speechSynthesis) window.speechSynthesis.cancel();

  const card = cards[currentCardIndex];
  const frontDefinition = card.frontLanguage === 'english' ? card.definitionEnglish : card.definitionFrench;
  const backDefinition = card.backLanguage === 'english' ? card.definitionEnglish : card.definitionFrench;
  container.innerHTML = '';

  const article = document.createElement('article');
  article.className = 'flashcard';
  article.dataset.index = card.index;
  article.setAttribute('tabindex', '0');
  article.setAttribute('role', 'button');
  article.setAttribute('aria-pressed', 'false');

  const inner = document.createElement('div');
  inner.className = 'flashcard-inner';

  const front = document.createElement('section');
  front.className = 'flashcard-face flashcard-front';
  front.innerHTML = `
    <div class="flashcard-header">
      <span class="flashcard-badge">${card.frontLanguage === 'english' ? L.targetBadge : 'FR'}</span>
      ${card.frontLanguage === 'english' ? `<button type="button" class="flashcard-listen-btn" aria-label="${L.pronounceAria}">${L.listen}</button>` : ''}
    </div>
    <div>
      <h2 class="flashcard-title">${richText(card[card.frontLanguage])}</h2>
      <p class="flashcard-definition">${richText(frontDefinition)}</p>
    </div>
  `;

  const back = document.createElement('section');
  back.className = 'flashcard-face flashcard-back';
  back.innerHTML = `
    <div class="flashcard-header">
      <span class="flashcard-badge">${card.backLanguage === 'english' ? L.targetBadge : 'FR'}</span>
      ${card.backLanguage === 'english' ? `<button type="button" class="flashcard-listen-btn" aria-label="${L.pronounceAria}">${L.listen}</button>` : ''}
    </div>
    <div>
      <h2 class="flashcard-title">${richText(card[card.backLanguage])}</h2>
      <p class="flashcard-definition">${richText(backDefinition)}</p>
    </div>
  `;

  inner.append(front, back);
  article.append(inner);
  container.appendChild(article);

  cardCounter.textContent = `${currentCardIndex + 1} / ${cards.length}`;
  prevButton.disabled = currentCardIndex === 0;
  nextButton.disabled = currentCardIndex === cards.length - 1;

  function toggleCard() {
    card.isFlipped = !card.isFlipped;
    article.classList.toggle('is-flipped', card.isFlipped);
    article.setAttribute('aria-pressed', card.isFlipped.toString());
  }

  article.addEventListener('click', event => {
    if (event.target.closest('.flashcard-listen-btn')) return;
    toggleCard();
  });

  article.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleCard();
    }
  });

  article.querySelectorAll('.flashcard-listen-btn').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      speakWord(card.english);
    });
  });
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
    initializeCards(currentMode);
    renderCurrentCard();
  } catch (error) {
    showLoadError();
    console.error(error);
  }
}

prevButton.addEventListener('click', () => {
  if (currentCardIndex > 0) {
    currentCardIndex--;
    renderCurrentCard();
  }
});

nextButton.addEventListener('click', () => {
  if (currentCardIndex < cards.length - 1) {
    currentCardIndex++;
    renderCurrentCard();
  }
});

modeButtons.forEach(button => {
  button.addEventListener('click', () => {
    modeButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    currentMode = button.dataset.mode;
    currentCardIndex = 0;
    initializeCards(currentMode);
    renderCurrentCard();
  });
});

loadVocabulary();
