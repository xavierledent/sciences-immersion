(function () {
  // Standalone-page counterpart of the autoeval modal in resources-engine.js
  // (see that file for the original). Same data shape, same localStorage
  // rating convention, same synthesis rules — only the chrome differs: this
  // renders straight into the page instead of into a modal, so there is no
  // open/close/fullscreen wiring here.
  let autoevalItemsById = new Map();
  let autoevalCategoriesCache = [];

  const AUTOEVAL_LEVEL_LABELS = { level1: 'Niveau 1', level2: 'Niveau 2', level3: 'Niveau 3' };

  function getAutoevalRatingKey(itemId) {
    return 'autoevalRating::' + location.pathname + '::' + itemId;
  }

  function readAutoevalRating(itemId) {
    try {
      const level = parseInt(localStorage.getItem(getAutoevalRatingKey(itemId)), 10);
      return (level >= 1 && level <= 3) ? level : null;
    } catch (e) { return null; }
  }

  function writeAutoevalRating(itemId, level) {
    try { localStorage.setItem(getAutoevalRatingKey(itemId), String(level)); } catch (e) {}
  }

  function clearAutoevalRating(itemId) {
    try { localStorage.removeItem(getAutoevalRatingKey(itemId)); } catch (e) {}
  }

  function createAutoEvalExerciseGroups(exercises) {
    if (!exercises?.length) return '';
    const byLevel = new Map();
    exercises.forEach(ex => {
      if (!byLevel.has(ex.level)) byLevel.set(ex.level, []);
      byLevel.get(ex.level).push(ex.id);
    });
    return Array.from(byLevel.entries()).map(([level, ids]) => {
      const label = AUTOEVAL_LEVEL_LABELS[level] || level;
      const chips = ids.map(id =>
        `<a class="autoeval-ex-chip" href="./practice.html?level=${encodeURIComponent(level)}&exercise=${encodeURIComponent(id)}" target="_blank" rel="noopener">${id}</a>`
      ).join('');
      return `<span class="autoeval-ex-group"><span class="autoeval-ex-level">${richText(label)} :</span>${chips}</span>`;
    }).join('');
  }

  function createAutoEvalExerciseLinks(exercises) {
    const groups = createAutoEvalExerciseGroups(exercises);
    return groups ? `<p class="autoeval-item-exercises">Exercices liés : ${groups}</p>` : '';
  }

  const AUTOEVAL_GENERAL_ADVICE = {
    1: "Cette notion n'est pas encore acquise. Relis la partie du cours indiquée ci-dessous, et n'hésite pas à demander de l'aide à ton professeur.",
    2: 'Tu es sur la bonne voie ! Relis rapidement cette notion pour bien la consolider.',
    3: 'Bravo, cette notion est acquise. Continue comme ça !'
  };

  const AUTOEVAL_EXERCISE_ADVICE_PREFIX = {
    1: "Cette notion n'est pas encore acquise : entraîne-toi avec ces exercices pour progresser :",
    2: 'Tu es sur la bonne voie : ces exercices vont t’aider à bien la consolider :',
    3: 'Bravo, cette notion est acquise, mais tu peux toujours refaire les exercices :'
  };

  function buildAutoevalAdviceHtml(item, level) {
    if (!level) return '';
    if (item.exercises?.length) {
      return `<p class="autoeval-advice">${AUTOEVAL_EXERCISE_ADVICE_PREFIX[level]} ${createAutoEvalExerciseGroups(item.exercises)}</p>`;
    }
    return `<p class="autoeval-advice">${AUTOEVAL_GENERAL_ADVICE[level]}</p>`;
  }

  function buildAutoevalDetailsHtml(item, rating) {
    const locationsHtml = item.locations?.length
      ? `<ul class="autoeval-item-locations">${item.locations.map(loc => `<li>${richText(loc)}</li>`).join('')}</ul>`
      : '';
    const exercisesHtml = rating ? '' : createAutoEvalExerciseLinks(item.exercises);
    return locationsHtml + exercisesHtml;
  }

  function createAutoEvalItem(item) {
    const rating = readAutoevalRating(item.id);
    const bulbsHtml = '<div class="autoeval-bulbs">' +
      [1, 2, 3].map(n =>
        `<button type="button" class="autoeval-bulb${rating && n <= rating ? ' is-lit' : ''}" data-level="${n}" aria-label="Niveau ${n}">💡</button>`
      ).join('') +
      '</div>';
    return `
      <div class="autoeval-item" data-item-id="${item.id}">
        <div class="autoeval-item-header">
          <button type="button" class="autoeval-item-toggle" aria-expanded="false">
            <span class="autoeval-item-chevron">▾</span>
            <span class="autoeval-item-text">${richText(item.text || '')}</span>
          </button>
          ${bulbsHtml}
        </div>
        <div class="autoeval-advice-slot">${buildAutoevalAdviceHtml(item, rating)}</div>
        <div class="autoeval-item-details" hidden>
          ${buildAutoevalDetailsHtml(item, rating)}
        </div>
      </div>
    `;
  }

  function computeCategoryStatus(category) {
    const ratings = category.items.map(item => readAutoevalRating(item.id)).filter(r => r !== null);
    if (ratings.length === 0) return null;
    const counts = { 1: 0, 2: 0, 3: 0 };
    ratings.forEach(r => counts[r]++);
    const maxCount = Math.max(counts[1], counts[2], counts[3]);
    const dominant = [1, 2, 3].filter(level => counts[level] === maxCount);
    if (dominant.length > 1) return 'mixte';
    if (dominant[0] === 1) return 'faible';
    if (dominant[0] === 3) return 'solide';
    return 'mixte';
  }

  const AUTOEVAL_GREEN_HOUR_NUDGE = "L'heure verte est aussi là pour ça : tu peux t'y inscrire même pour une seule question.";

  const AUTOEVAL_SYNTHESIS_TEXT = {
    allWeak: `Les trois catégories montrent encore des difficultés. Plutôt que de tout refaire seul, va demander de l'aide en classe et explique précisément ce qui bloque. ${AUTOEVAL_GREEN_HOUR_NUDGE}`,
    competenceCatchingUp: "Les Savoirs et le Savoir-faire sont bien maîtrisés : c'est tout à fait normal d'être encore en progression sur la Compétence à ce stade. Essaie les exercices d'intégration les plus avancés pour continuer à progresser.",
    theoryStrong: 'Bravo, la théorie de ce chapitre est bien maîtrisée ! Concentre-toi maintenant sur les exercices d\'application plutôt que sur une relecture des notions.',
    knowledgeWeak: `Les bases théoriques semblent encore fragiles. Retourne au cours et aux fiches outils pour revoir les notions clés avant de continuer. ${AUTOEVAL_GREEN_HOUR_NUDGE}`,
    skillsWeak: `Les compétences pratiques (terrain, manipulation, lecture de données...) semblent le point à travailler. Retravaille les exercices de niveau 2 et 3 plutôt que la théorie. ${AUTOEVAL_GREEN_HOUR_NUDGE}`,
    competenceWeakPartial: `Ta Compétence est encore fragile sur ce chapitre, et les Savoirs et le Savoir-faire ne sont pas encore complètement stabilisés non plus. Retravaille d'abord les notions et les exercices d'application, puis reviens vers les exercices d'intégration. ${AUTOEVAL_GREEN_HOUR_NUDGE}`,
    twoWeak: (weakTitles) => `${weakTitles.join(' et ')} restent difficiles pour toi. Reprends le cours et les fiches outils pour ces deux points, puis retente les exercices de niveau 1 pour vérifier que ça tient. ${AUTOEVAL_GREEN_HOUR_NUDGE}`,
    allStrong: 'Bravo, les trois catégories sont bien maîtrisées ! Tu es prêt·e pour ce chapitre — continue sur cette lancée.',
    allMixed: "Ton niveau est irrégulier sur les trois catégories, sans point faible net. Refais un tour des exercices de niveau 2 pour repérer précisément où ça coince.",
    mostlyGood: (mixteTitles) => `Tu progresses bien ! Concentre-toi sur ${mixteTitles.join(' et ')} pour finir de tout consolider.`,
    vocabulary: 'Le vocabulaire du chapitre n\'est pas encore bien maîtrisé : va consulter la <a href="./vocabulary.html" target="_blank" rel="noopener">section Vocabulaire</a> avant de refaire les exercices.'
  };

  function computeAutoevalSynthesis(categories) {
    const statuses = {};
    categories.forEach(category => { statuses[category.id] = computeCategoryStatus(category); });
    const { savoirs, savoirFaire, competence } = statuses;

    let mainMessage = null;
    if (savoirs !== null && savoirFaire !== null && competence !== null) {
      const weakCount = [savoirs, savoirFaire, competence].filter(s => s === 'faible').length;
      const solidCount = [savoirs, savoirFaire, competence].filter(s => s === 'solide').length;
      if (weakCount === 3) {
        mainMessage = AUTOEVAL_SYNTHESIS_TEXT.allWeak;
      } else if (competence === 'faible' && savoirs === 'solide' && savoirFaire === 'solide') {
        mainMessage = AUTOEVAL_SYNTHESIS_TEXT.competenceCatchingUp;
      } else if (savoirs === 'solide' && (savoirFaire === 'faible' || competence === 'faible')) {
        mainMessage = AUTOEVAL_SYNTHESIS_TEXT.theoryStrong;
      } else if (savoirs === 'faible' && savoirFaire !== 'faible' && competence !== 'faible') {
        mainMessage = AUTOEVAL_SYNTHESIS_TEXT.knowledgeWeak;
      } else if (savoirFaire === 'faible' && savoirs !== 'faible' && competence !== 'faible') {
        mainMessage = AUTOEVAL_SYNTHESIS_TEXT.skillsWeak;
      } else if (competence === 'faible' && savoirs !== 'faible' && savoirFaire !== 'faible') {
        mainMessage = AUTOEVAL_SYNTHESIS_TEXT.competenceWeakPartial;
      } else if (weakCount === 2) {
        const weakTitles = categories
          .filter(category => statuses[category.id] === 'faible')
          .map(category => category.title);
        mainMessage = AUTOEVAL_SYNTHESIS_TEXT.twoWeak(weakTitles);
      } else if (weakCount === 0 && solidCount === 3) {
        mainMessage = AUTOEVAL_SYNTHESIS_TEXT.allStrong;
      } else if (weakCount === 0 && solidCount === 0) {
        mainMessage = AUTOEVAL_SYNTHESIS_TEXT.allMixed;
      } else if (weakCount === 0) {
        const mixteTitles = categories
          .filter(category => statuses[category.id] === 'mixte')
          .map(category => category.title);
        mainMessage = AUTOEVAL_SYNTHESIS_TEXT.mostlyGood(mixteTitles);
      }
    }

    let vocabMessage = null;
    categories.forEach(category => category.items.forEach(item => {
      if (item.isVocabulary) {
        const rating = readAutoevalRating(item.id);
        if (rating === 1 || rating === 2) vocabMessage = AUTOEVAL_SYNTHESIS_TEXT.vocabulary;
      }
    }));

    return { mainMessage, vocabMessage };
  }

  function renderAutoevalSynthesis() {
    const container = document.getElementById('autoeval-synthesis');
    if (!container) return;
    const { mainMessage, vocabMessage } = computeAutoevalSynthesis(autoevalCategoriesCache);
    const blocks = [
      mainMessage ? ['Bilan du chapitre', mainMessage] : null,
      vocabMessage ? ['Vocabulaire', vocabMessage] : null
    ].filter(Boolean).map(([kicker, text]) =>
      `<p class="autoeval-synthesis-msg"><span class="autoeval-synthesis-kicker">${kicker}</span>${text}</p>`
    );
    container.innerHTML = blocks.join('');
  }

  function showError() {
    const panels = document.getElementById('autoeval-panels');
    const tabs = document.getElementById('autoeval-tabs');
    const synthesis = document.getElementById('autoeval-synthesis');
    if (tabs) tabs.innerHTML = '';
    if (synthesis) synthesis.innerHTML = '';
    if (panels) panels.innerHTML = '<div class="load-error">Erreur de chargement. Recharge la page, et préviens ton professeur si cela se reproduit.</div>';
  }

  function renderAutoEvalPage(data) {
    const tabs = document.getElementById('autoeval-tabs');
    const panels = document.getElementById('autoeval-panels');
    const synthesis = document.getElementById('autoeval-synthesis');
    if (!tabs || !panels) return;

    if (!data || !data.categories?.length) {
      tabs.innerHTML = '';
      panels.innerHTML = '<p>Fiche indisponible pour ce chapitre pour le moment.</p>';
      if (synthesis) synthesis.innerHTML = '';
      autoevalCategoriesCache = [];
      return;
    }

    const categories = data.categories.filter(category => category.items?.length);
    autoevalCategoriesCache = categories;
    autoevalItemsById = new Map();
    categories.forEach(category => category.items.forEach(item => autoevalItemsById.set(String(item.id), item)));

    tabs.innerHTML = categories.map((category, i) =>
      `<button type="button" class="toggle-button autoeval-tab${i === 0 ? ' active' : ''}" data-category="${category.id}">${richText(category.title || '')}</button>`
    ).join('');
    panels.innerHTML = categories.map((category, i) => `
      <div class="autoeval-panel${i === 0 ? ' is-active' : ''}" data-category="${category.id}">
        ${category.items.map(createAutoEvalItem).join('')}
      </div>
    `).join('');

    renderAutoevalSynthesis();
  }

  function loadAutoEval() {
    const tabs = document.getElementById('autoeval-tabs');
    const panels = document.getElementById('autoeval-panels');
    if (!tabs || !panels) return;

    tabs.addEventListener('click', event => {
      const tabBtn = event.target.closest('.autoeval-tab');
      if (!tabBtn) return;
      const categoryId = tabBtn.dataset.category;
      tabs.querySelectorAll('.autoeval-tab').forEach(b => b.classList.toggle('active', b === tabBtn));
      panels.querySelectorAll('.autoeval-panel').forEach(p => p.classList.toggle('is-active', p.dataset.category === categoryId));
    });

    panels.addEventListener('click', event => {
      const toggleBtn = event.target.closest('.autoeval-item-toggle');
      if (toggleBtn) {
        const details = toggleBtn.closest('.autoeval-item').querySelector('.autoeval-item-details');
        const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        toggleBtn.setAttribute('aria-expanded', String(!expanded));
        details.hidden = expanded;
        return;
      }

      const bulbBtn = event.target.closest('.autoeval-bulb');
      if (bulbBtn) {
        const itemEl = bulbBtn.closest('.autoeval-item');
        const itemId = itemEl.dataset.itemId;
        const clickedLevel = parseInt(bulbBtn.dataset.level, 10);
        const wasAlreadyAtThisLevel = readAutoevalRating(itemId) === clickedLevel;
        const level = wasAlreadyAtThisLevel ? null : clickedLevel;

        if (level === null) clearAutoevalRating(itemId);
        else writeAutoevalRating(itemId, level);

        if (window.logEvent) {
          const categoryId = itemEl.closest('.autoeval-panel')?.dataset.category || null;
          window.logEvent('autoeval_item_rated', { itemId, category: categoryId, rating: level });
        }

        itemEl.querySelectorAll('.autoeval-bulb').forEach(b => {
          b.classList.toggle('is-lit', level !== null && parseInt(b.dataset.level, 10) <= level);
        });

        const item = autoevalItemsById.get(itemId);
        if (item) {
          itemEl.querySelector('.autoeval-advice-slot').innerHTML = buildAutoevalAdviceHtml(item, level);
          itemEl.querySelector('.autoeval-item-details').innerHTML = buildAutoevalDetailsHtml(item, level);
        }
        renderAutoevalSynthesis();
      }
    });

    if (window.logEvent) window.logEvent('autoeval_page_opened', {});

    fetch('./autoeval.json?v=' + Date.now())
      .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
      .then(renderAutoEvalPage)
      .catch(error => { console.error(error); showError(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAutoEval);
  } else {
    loadAutoEval();
  }
})();
