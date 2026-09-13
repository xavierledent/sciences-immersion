(function () {
  // Shared by every chapter's resources.html. The fetch stays relative so each
  // chapter loads its own resources.json without any inline config.
  // Resolved at init rather than at load time, so the readyState guard at the
  // bottom actually protects the whole script and not just the fetch.
  let grid = null;
  // Populated on every renderAutoEvalModalBody: itemId -> item data, so the
  // bulb click handler (delegated, working off the rendered DOM) can get back
  // to an item's exercises/etc. without re-parsing anything.
  let autoevalItemsById = new Map();
  // Same reasoning: the full category list, kept around so the synthesis
  // message (recomputed on every bulb click, not just on open) doesn't need
  // its own fetch.
  let autoevalCategoriesCache = [];

  function createCard(title, content) {
    const card = document.createElement('article');
    card.className = 'section-card';
    card.innerHTML = `
      <h3>${richText(title)}</h3>
      ${content}
    `;
    return card;
  }

  function createVideoItem(video, basePath) {
    const embedUrl = video.embedUrl || `${basePath || ''}${video.youtubeId || ''}`;
    return `
      <div class="video-item">
        <div class="video-meta">
          <strong>${richText(video.title || '')}</strong>
        </div>
        <iframe
          src="${embedUrl}"
          title="${video.title || 'Vidéo'}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
        <div class="video-desc">
          ${video.description ? `<p>${richText(video.description)}</p>` : ''}
        </div>
      </div>
    `;
  }

  function createPdfList(items, basePath) {
    if (!items || items.length === 0) {
      return '<p>Aucun document disponible pour le moment.</p>';
    }
    const listItems = items.map(item => {
      const fileUrl  = `${basePath || ''}/${encodeURIComponent(item.file || '')}`;
      const descHtml = item.description ? `<p>${richText(item.description)}</p>` : '';
      return `<li><a href="${fileUrl}" target="_blank" rel="noopener" data-resource-type="fichesOutils">${richText(item.label || 'Document')}</a>${descHtml}</li>`;
    }).join('');
    return `<ul class="resource-list">${listItems}</ul>`;
  }

  // The fiche opens in the shared modal system (autoeval.json /
  // #autoeval-modal / initAutoEval) via the "en ligne" link; the classic
  // printable PDF stays available alongside it via data.pdfFile. Both are
  // plain <a class="resource-button">, deliberately not a <button>: a real
  // button's native OS chrome (Windows Fluent, etc.) can keep its own corner
  // radius even with appearance:none, which read as a mismatch next to the
  // PDF/mindmap links using the exact same class.
  // data.onlineTool (set in resources.json) marks a chapter migrated to its
  // own autoeval.html: the online button disappears from this card entirely
  // (it now lives in the chapter nav / index instead) and only the PDF stays.
  // Chapters without it keep the old modal-opening button exactly as before
  // — this is what lets chapters move over one at a time instead of all at
  // once.
  function createAutoEvaluationContent(data) {
    if (!data) return '<p>Fiche indisponible.</p>';
    const descHtml = data.description ? `<p style="margin:0 0 14px">${richText(data.description)}</p>` : '';
    const pdfUrl = data.pdfFile ? `${data.basePath || ''}/${encodeURIComponent(data.pdfFile)}` : '';
    const pdfBtnHtml = pdfUrl
      ? `<a class="resource-button" href="${pdfUrl}" target="_blank" rel="noopener" data-resource-type="ficheAutoEvalPdf">Fiche d'autoévaluation (PDF)</a>`
      : '';
    const onlineBtnHtml = data.onlineTool
      ? ''
      : '<a href="#" class="resource-button" id="btn-open-autoeval">Autoévaluation en ligne</a>';
    return `${descHtml}<div class="resource-button-row">${pdfBtnHtml}${onlineBtnHtml}</div>`;
  }

  const AUTOEVAL_LEVEL_LABELS = { level1: 'Niveau 1', level2: 'Niveau 2', level3: 'Niveau 3' };

  // Same rating storage convention as the rest of the site (see
  // practiceSelfAssess:: in practice-engine.js): pathname-scoped, so it
  // naturally partitions per chapter without any chapter id in the key.
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

  // Just the "Niveau X : [chips]" groups, grouped by level rather than one
  // link per exercise — the fiche can list a dozen+ attendus, and "Niveau 1 —
  // Exercice 3" repeated on every single link was the single biggest source
  // of vertical bloat. Split from createAutoEvalExerciseLinks (below) so the
  // per-attendu advice can reuse the same chips inside its own sentence.
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

  // General advice, only shown when an attendu has no exercises to point to
  // — a specific "go redo these" beats a generic one whenever there's
  // something concrete to link.
  const AUTOEVAL_GENERAL_ADVICE = {
    1: "Cette notion n'est pas encore acquise. Relis la partie du cours indiquée ci-dessous, et n'hésite pas à demander de l'aide à ton professeur.",
    2: 'Tu es sur la bonne voie ! Relis rapidement cette notion pour bien la consolider.',
    3: 'Bravo, cette notion est acquise. Continue comme ça !'
  };

  // Same three tones as AUTOEVAL_GENERAL_ADVICE above, but leading into the
  // exercise links instead of standing alone — a flat "entraîne-toi encore"
  // read as the exact same sentence at level 1 and level 3, which made no
  // sense once you'd already said "c'est acquis".
  const AUTOEVAL_EXERCISE_ADVICE_PREFIX = {
    1: "Cette notion n'est pas encore acquise : entraîne-toi avec ces exercices pour progresser :",
    2: 'Tu es sur la bonne voie : ces exercices vont t’aider à bien la consolider :',
    3: 'Bravo, cette notion est acquise, mais tu peux toujours refaire les exercices :'
  };

  // Nothing (empty string) when no level is chosen yet — the slot this fills
  // simply stays empty until the student clicks a bulb, restored or not.
  function buildAutoevalAdviceHtml(item, level) {
    if (!level) return '';
    if (item.exercises?.length) {
      return `<p class="autoeval-advice">${AUTOEVAL_EXERCISE_ADVICE_PREFIX[level]} ${createAutoEvalExerciseGroups(item.exercises)}</p>`;
    }
    return `<p class="autoeval-advice">${AUTOEVAL_GENERAL_ADVICE[level]}</p>`;
  }

  // Collapsed by default (only the statement itself + the bulbs), the rest
  // — locations and exercise links — unfolds on click. Same reasoning as the
  // per-level grouping above: a full chapter's worth of attendus, each with
  // their "emplacement dans le cours" spelled out, made the modal a very
  // long scroll. The advice slot sits outside that collapsed section on
  // purpose — it's the whole point of rating, so it shouldn't need an extra
  // click to see.
  // Shared by the initial/restored render and the click handler (which needs
  // to rebuild this same section live — once rated, exercises move to the
  // advice slot; clearing a rating with the toggle-off gesture below needs
  // to bring them back).
  function buildAutoevalDetailsHtml(item, rating) {
    const locationsHtml = item.locations?.length
      ? `<ul class="autoeval-item-locations">${item.locations.map(loc => `<li>${richText(loc)}</li>`).join('')}</ul>`
      : '';
    // Once rated, the advice above already lists these same exercises — no
    // reason to repeat them here too. Only shown in the collapsed section
    // for an attendu nobody has rated yet, where the advice slot is empty.
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

  /* ===== Synthesis message (bottom of the fiche, all categories) =====
     Recomputed from scratch on every bulb click (see the click handler in
     initAutoEval) rather than tracked incrementally — same reasoning as
     rebuilding the whole modal body on open: cheap, and impossible to get
     out of sync with what's actually in localStorage. */

  // "faible" if the lowest rated level dominates, "solide" if the highest
  // does, "mixte" for a tie (no clear tendency) or the middle level
  // dominating, null if nothing in this category has been rated yet.
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

  // Short, reusable nudge rather than a repeated full sentence — the heure
  // verte is a low-commitment slot (booked in advance, but a student can
  // show up with just one question, not a whole list), so it's worth
  // mentioning wherever a category needs work, not only the worst case.
  const AUTOEVAL_GREEN_HOUR_NUDGE = "L'heure verte est aussi là pour ça : tu peux t'y inscrire même pour une seule question.";

  const AUTOEVAL_SYNTHESIS_TEXT = {
    allWeak: `Les trois catégories montrent encore des difficultés. Plutôt que de tout refaire seul, va demander de l'aide en classe et explique précisément ce qui bloque. ${AUTOEVAL_GREEN_HOUR_NUDGE}`,
    competenceCatchingUp: "Les Savoirs et le Savoir-faire sont bien maîtrisés : c'est tout à fait normal d'être encore en progression sur la Compétence à ce stade. Essaie les exercices d'intégration les plus avancés pour continuer à progresser.",
    theoryStrong: 'Bravo, la théorie de ce chapitre est bien maîtrisée ! Concentre-toi maintenant sur les exercices d\'application plutôt que sur une relecture des notions.',
    knowledgeWeak: `Les bases théoriques semblent encore fragiles. Retourne au cours et aux fiches outils pour revoir les notions clés avant de continuer. ${AUTOEVAL_GREEN_HOUR_NUDGE}`,
    skillsWeak: `Les compétences pratiques (terrain, manipulation, lecture de données...) semblent le point à travailler. Retravaille les exercices de niveau 2 et 3 plutôt que la théorie. ${AUTOEVAL_GREEN_HOUR_NUDGE}`,
    // The Compétence-alone-faible case, but without Savoirs+Savoir-faire
    // both solide (else competenceCatchingUp already caught it) — those two
    // aren't fully stable either, so the advice leads with them first.
    competenceWeakPartial: `Ta Compétence est encore fragile sur ce chapitre, et les Savoirs et le Savoir-faire ne sont pas encore complètement stabilisés non plus. Retravaille d'abord les notions et les exercices d'application, puis reviens vers les exercices d'intégration. ${AUTOEVAL_GREEN_HOUR_NUDGE}`,
    twoWeak: (weakTitles) => `${weakTitles.join(' et ')} restent difficiles pour toi. Reprends le cours et les fiches outils pour ces deux points, puis retente les exercices de niveau 1 pour vérifier que ça tient. ${AUTOEVAL_GREEN_HOUR_NUDGE}`,
    allStrong: 'Bravo, les trois catégories sont bien maîtrisées ! Tu es prêt·e pour ce chapitre — continue sur cette lancée.',
    // No category faible, none of the "one weak" specifics above fired
    // (so at least one is mixte) — two flavours: nothing at all solide yet,
    // or a mix of mixte and solide.
    allMixed: "Ton niveau est irrégulier sur les trois catégories, sans point faible net. Refais un tour des exercices de niveau 2 pour repérer précisément où ça coince.",
    // mixteTitles always has 1 or 2 entries here (weakCount is 0 and
    // solidCount is 1 or 2, so the rest — 2 or 1 categories — are mixte);
    // .join(' et ') reads fine either way, same as twoWeak above.
    mostlyGood: (mixteTitles) => `Tu progresses bien ! Concentre-toi sur ${mixteTitles.join(' et ')} pour finir de tout consolider.`,
    vocabulary: 'Le vocabulaire du chapitre n\'est pas encore bien maîtrisé : va consulter la <a href="./vocabulary.html" target="_blank" rel="noopener">section Vocabulaire</a> avant de refaire les exercices.'
  };

  // A rule only fires once every category it depends on has actually been
  // rated at least once — an unrated category is "unknown", not "not
  // faible", so it must never let a rule conclude prematurely on partial
  // data (e.g. "Savoirs faible, the other two aren't" the moment the
  // student has only touched Savoirs). Rules are checked most-specific-first
  // where they'd otherwise overlap: rule 3 before rule 2 (Savoirs solide +
  // Savoir-faire solide + Compétence faible matches both — checking rule 2
  // first would make rule 3 unreachable). Every one of the 27 possible
  // faible/mixte/solide × 3-category combinations resolves to exactly one
  // branch below — none fall through to silence.
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
        // Only reachable with Savoirs/Savoir-faire not faible but not both
        // solide either (that combination was already caught above).
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

    // Independent of the rules above: the vocabulary attendu is flagged in
    // the JSON (isVocabulary), wherever it lives — no assumption about which
    // category it's filed under.
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
    const container = document.getElementById('autoeval-modal-synthesis');
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

  function renderAutoEvalModalBody(data) {
    const tabs = document.getElementById('autoeval-modal-tabs');
    const panels = document.getElementById('autoeval-modal-panels');
    const synthesis = document.getElementById('autoeval-modal-synthesis');
    if (!tabs || !panels) return;
    if (!data || !data.categories?.length) {
      tabs.innerHTML = '';
      panels.innerHTML = '<p>Fiche indisponible.</p>';
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

  // Self-contained, like #chapter-modal on index.html: this page has no
  // shared engine script (practice-engine.js) to lean on for modal
  // open/close/scroll-lock/Escape wiring.
  function initAutoEval() {
    const openBtn = document.getElementById('btn-open-autoeval');
    const modal = document.getElementById('autoeval-modal');
    const closeBtn = document.getElementById('autoeval-modal-close');
    const fullscreenBtn = document.getElementById('autoeval-fullscreen');
    const tabs = document.getElementById('autoeval-modal-tabs');
    const panels = document.getElementById('autoeval-modal-panels');
    if (!openBtn || !modal || !closeBtn || !fullscreenBtn || !tabs || !panels) return;

    let dataPromise = null;
    function loadAutoEvalData() {
      if (!dataPromise) {
        dataPromise = fetch('./autoeval.json?v=' + Date.now())
          .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
          .catch(error => { console.error(error); return null; });
      }
      return dataPromise;
    }

    function openModal() {
      modal.classList.add('modal-open');
      document.body.classList.add('modal-is-open');
      loadAutoEvalData().then(renderAutoEvalModalBody);
    }

    function closeModal() {
      // Closing via × while fullscreen: exit explicitly rather than counting
      // on display:none to force it automatically — that implicit exit isn't
      // reliable (see the equivalent fix in practice-engine.js's closeModal).
      if (document.fullscreenElement && modal.contains(document.fullscreenElement)) {
        document.exitFullscreen().catch(() => {});
      }
      modal.classList.remove('modal-open');
      document.body.classList.remove('modal-is-open');
    }

    openBtn.addEventListener('click', event => {
      event.preventDefault();
      if (window.logEvent) window.logEvent('autoeval_opened', {});
      openModal();
    });
    closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && modal.classList.contains('modal-open')) closeModal();
    });

    // Real fullscreen, same pattern as every exercise modal on the practice
    // page (see practice-engine.js) — ported here since this page has no
    // shared engine script to inherit the generic wiring from.
    const fullscreenCard = modal.querySelector('.modal-card');
    function syncFullscreenBtn() {
      const isFull = document.fullscreenElement === fullscreenCard;
      fullscreenBtn.classList.toggle('is-fullscreen', isFull);
      const label = isFull ? 'Quitter le plein écran' : 'Plein écran';
      fullscreenBtn.title = label;
      fullscreenBtn.setAttribute('aria-label', label);
    }
    fullscreenBtn.addEventListener('click', () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
        return;
      }
      if (fullscreenCard.requestFullscreen) fullscreenCard.requestFullscreen().catch(() => {});
    });
    document.addEventListener('fullscreenchange', syncFullscreenBtn);

    // Category tabs — rebuilt on every open, so delegate from the stable
    // container instead of binding on each button.
    tabs.addEventListener('click', event => {
      const tabBtn = event.target.closest('.autoeval-tab');
      if (!tabBtn) return;
      const categoryId = tabBtn.dataset.category;
      tabs.querySelectorAll('.autoeval-tab').forEach(b => b.classList.toggle('active', b === tabBtn));
      panels.querySelectorAll('.autoeval-panel').forEach(p => p.classList.toggle('is-active', p.dataset.category === categoryId));
    });

    // Accordion toggle and bulb rating share one delegated listener — the
    // bulbs sit as siblings of .autoeval-item-toggle, not inside it, so a
    // bulb click never also triggers the accordion (closest() simply finds
    // neither ancestor for the other's target).
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
        // Re-clicking the already-selected bulb clears the rating entirely —
        // same toggle-off gesture as the classic exercises' self-assessment
        // buttons, the only way to get back to "not rated yet" once a level
        // is picked.
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
          // Rebuilt from scratch rather than just removing the exercises
          // line: clearing the rating needs it to reappear, not just to stay
          // gone (see buildAutoevalDetailsHtml — it decides based on
          // whether `level` is set).
          itemEl.querySelector('.autoeval-item-details').innerHTML = buildAutoevalDetailsHtml(item, level);
        }
        renderAutoevalSynthesis();
      }
    });
  }

  function createMindmapContent(data, fallbackPath) {
    if (!data) return '<p>Modèle indisponible.</p>';
    const path  = data.basePath || fallbackPath || '';
    const items = data.items?.length ? data.items
      : (data.file ? [{ title: data.title, description: data.description, file: data.file }] : []);
    if (!items.length) return '<p>Modèle indisponible.</p>';
    const blocks = items.map((item, i) => {
      const fileUrl  = `${path}/${encodeURIComponent(item.file || '')}`;
      const label    = item.title || 'Modèle général';
      const rawDesc  = (item.description || '').replace('Téléchargez ce modèle', 'Télécharger ces modèles');
      const descHtml = rawDesc ? `<p style="margin:0 0 10px">${richText(rawDesc)}</p>` : '';
      return `<div>${descHtml}<a class="resource-button" href="${fileUrl}" target="_blank" rel="noopener" data-resource-type="mindmap">${richText(label)}</a></div>`;
    }).join('');
    return `<div class="mindmap-section"><div style="display:flex;flex-direction:column;gap:12px">${blocks}</div></div>`;
  }

  // Même classe et même message que dans practice-engine.js et
  // vocabulary-engine.js : une panne de chargement doit se reconnaître
  // partout sur le site, pas seulement dans les exercices.
  function showError() {
    grid.innerHTML = '<div class="load-error">Erreur de chargement. Recharge la page, et préviens ton professeur si cela se reproduit.</div>';
  }

  async function loadResources() {
    grid = document.getElementById('resources-grid');
    if (!grid) return;

    // One delegated listener for every fiches-outils/autoeval-PDF/mindmap
    // link ever rendered into the grid, rather than one per link — they're
    // plain <a target="_blank">, so this only logs; it never blocks the
    // native navigation.
    grid.addEventListener('click', event => {
      const link = event.target.closest('a[data-resource-type]');
      if (link && window.logEvent) {
        window.logEvent('resource_link_opened', {
          type: link.dataset.resourceType,
          label: link.textContent.trim(),
          file: link.getAttribute('href')
        });
      }
    });

    try {
      // Cache-buster, comme practice-engine.js : GitHub Pages sert les fichiers
      // avec 10 minutes de durée de vie, et les élèves verraient sinon l'ancien
      // contenu après une correction faite depuis l'outil admin.
      const response = await fetch('./resources.json?v=' + Date.now());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      // 1. Création de la carte "Fiches outils" (colonne de gauche)
      const fo = data.fichesOutils;
      const foDescHtml = fo?.description ? `<p style="margin:0 0 14px">${richText(fo.description)}</p>` : '';
      const fichesOutilsSection = createCard(
        fo?.title || "Fiches outils",
        foDescHtml + createPdfList(fo?.items || [], fo?.basePath || '')
      );

      // 2. Création de la carte autonome "Fiche d'autoévaluation"
      const ficheAutoEvaluationSection = createCard(
        (data.ficheAutoEvaluation && data.ficheAutoEvaluation.title) || "Autoévaluation par attendus",
        createAutoEvaluationContent(data.ficheAutoEvaluation)
      );

      // 3. Création de la carte autonome "Modèles mindmap"
      const fallbackPath = data.ficheAutoEvaluation ? data.ficheAutoEvaluation.basePath : '';
      const mindmapSection = createCard(
        "Modèles mindmap",
        createMindmapContent(data.mindmap, fallbackPath)
      );

      // --- STRUCTURATION DE LA COLONNE DE DROITE ---
      // On solidarise les cartes d'autoévaluation et de mindmap dans une colonne flexbox
      const rightColumnContainer = document.createElement('div');
      rightColumnContainer.className = 'resources-right-col';
      rightColumnContainer.style.display = 'flex';
      rightColumnContainer.style.flexDirection = 'column';
      rightColumnContainer.style.gap = '20px'; // Garde le même espace vertical qu'entre les autres blocs
      // Le conteneur est étiré par la grille pour matcher la hauteur de la
      // carte "Fiches outils" à gauche (souvent plus haute, avec sa dizaine
      // de liens) : sans space-between, l'espace en trop restait vide sous
      // la carte mindmap au lieu d'aller dans l'écart entre les deux cartes,
      // et son bas ne touchait plus le bas de la carte de gauche.
      rightColumnContainer.style.justifyContent = 'space-between';

      // On insère les deux cartes à l'intérieur du conteneur de droite
      rightColumnContainer.append(ficheAutoEvaluationSection, mindmapSection);

      // 4. Création de la carte "Vidéos" (qui prendra toute la largeur en bas)
      const hasVideos = data.videos && data.videos.items && data.videos.items.length;
      const videosSection = createCard(
        (data.videos && data.videos.title) || "Vidéos",
        hasVideos
          ? `<div class="video-list">${data.videos.items.map(video => createVideoItem(video, data.videos.basePath)).join('')}</div>`
          : '<p>Aucune vidéo disponible pour le moment.</p>'
      );
      videosSection.classList.add('full-width');

      // Nettoyage et injection finale bien ordonnée
      grid.innerHTML = '';
      grid.append(fichesOutilsSection, rightColumnContainer, videosSection);

      // The trigger button lives inside ficheAutoEvaluationSection, just
      // appended above — wire it up now that it actually exists in the DOM.
      initAutoEval();

    } catch (error) {
      console.error(error);
      showError();
    }
  }

  // Self-initialising, like practice-engine.js. The readyState guard makes the
  // script safe to move into <head> later; at the end of <body> it runs
  // immediately, exactly as the inline version did.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadResources);
  } else {
    loadResources();
  }
})();
