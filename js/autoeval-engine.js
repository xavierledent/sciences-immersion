(function () {
  // Page d'autoévaluation (assessment.html), mise en page « paysage » : tout
  // sur un écran de Chromebook. À gauche la mascotte, les trois catégories
  // (avec l'état de chacune) et « Bilan du chapitre » ; à droite la liste de
  // la catégorie choisie, en une ou deux colonnes selon la place (fitList).
  // On note dans la ligne (ampoules) ; toucher le texte d'un attendu ouvre
  // sa fenêtre (texte entier, ampoules, conseil, parties du cours, exercices
  // et labos liés) ; le bilan s'ouvre dans une fenêtre aussi.
  let autoevalItemsById = new Map();
  let autoevalCategoriesCache = [];
  let autoevalCategoryOfItem = new Map();

  const AUTOEVAL_LEVEL_LABELS = { level1: 'Niveau 1', level2: 'Niveau 2', level3: 'Niveau 3' };

  // Stockage via storage.js (clé 'autoevalRating::<page>::<itemId>').
  function readAutoevalRating(itemId) {
    const level = parseInt(SiteStorage.data.get('autoevalRating', [itemId]), 10);
    return (level >= 1 && level <= 3) ? level : null;
  }

  function writeAutoevalRating(itemId, level) {
    SiteStorage.data.set('autoevalRating', [itemId], String(level));
  }

  function clearAutoevalRating(itemId) {
    SiteStorage.data.remove('autoevalRating', [itemId]);
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

  // Labs linked to an attendu (savoir-faire and compétence only, see
  // validate-content.js): same chip as an exercise, but titled, on a line of
  // its own. Titles come from the page (generate-assessment.js, chapters.json),
  // in the track's language. Only a link: never the student's lab result, so
  // the student goes back to the lab before rating.
  const LAB_TITLES = (() => {
    try { return JSON.parse(document.getElementById('chapter-labs')?.textContent || '{}'); } catch { return {}; }
  })();

  const knownLabs = labs => (labs || []).filter(id => LAB_TITLES[id]);

  function createAutoEvalLabChips(labs) {
    return `<span class="autoeval-lab-group">${knownLabs(labs).map(id =>
      `<a class="autoeval-ex-chip autoeval-lab-chip" href="./laboratory.html?lab=${encodeURIComponent(id)}" target="_blank" rel="noopener">${escapeAutoevalHtml(LAB_TITLES[id])}</a>`
    ).join('')}</span>`;
  }

  function escapeAutoevalHtml(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function createAutoEvalLabLinks(labs) {
    const n = knownLabs(labs).length;
    if (!n) return '';
    return `<p class="autoeval-item-exercises autoeval-item-labs">${n > 1 ? 'Labos liés' : 'Labo lié'} : ${createAutoEvalLabChips(labs)}</p>`;
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

  // Advice for an attendu linked only to labs (one = "ce labo", several = "ces labos").
  const AUTOEVAL_LAB_ADVICE_PREFIX = {
    1: what => `Cette notion n'est pas encore acquise : refais ${what} pour progresser :`,
    2: what => `Tu es sur la bonne voie : refais ${what} pour bien la consolider :`,
    3: what => `Bravo, cette notion est acquise, mais tu peux toujours refaire ${what} :`
  };

  function buildAutoevalAdviceHtml(item, level) {
    if (!level) return '';
    const labCount = knownLabs(item.labs).length;
    const labs = labCount ? createAutoEvalLabChips(item.labs) : '';
    if (item.exercises?.length) {
      const also = labCount ? `<br>${labCount > 1 ? 'Refais aussi les labos' : 'Refais aussi le labo'} : ${labs}` : '';
      return `<p class="autoeval-advice">${AUTOEVAL_EXERCISE_ADVICE_PREFIX[level]} ${createAutoEvalExerciseGroups(item.exercises)}${also}</p>`;
    }
    if (labCount) {
      return `<p class="autoeval-advice">${AUTOEVAL_LAB_ADVICE_PREFIX[level](labCount > 1 ? 'ces labos' : 'ce labo')} ${labs}</p>`;
    }
    return `<p class="autoeval-advice">${AUTOEVAL_GENERAL_ADVICE[level]}</p>`;
  }

  function buildAutoevalDetailsHtml(item, rating) {
    const locationsHtml = item.locations?.length
      ? `<ul class="autoeval-item-locations">${item.locations.map(loc => `<li>${richText(loc)}</li>`).join('')}</ul>`
      : '';
    const linksHtml = rating ? '' : createAutoEvalExerciseLinks(item.exercises) + createAutoEvalLabLinks(item.labs);
    return locationsHtml + linksHtml;
  }

  // Drawn bulb rather than the 💡 emoji: an emoji can only be tinted as a
  // whole (filter), so an unlit bulb was either too faint to look clickable
  // or no longer looked like glass. With separate parts, assessment.css
  // colours glass/filament/base per state (unlit = clear glass with a
  // visible outline, lit = yellow glass with a glow). The markup itself lives
  // in templates/partials/bulb-icon.svg (shared with the practice level
  // buttons), injected into the page as <template id="bulb-icon-template">.
  // Read lazily, falling back to the emoji if the template is ever missing.
  let bulbSvg = null;
  function getBulbSvg() {
    if (bulbSvg === null) {
      const tpl = document.getElementById('bulb-icon-template');
      bulbSvg = (tpl && tpl.innerHTML.trim()) || '💡';
    }
    return bulbSvg;
  }

  function createBulbsHtml(rating) {
    return '<div class="autoeval-bulbs">' +
      [1, 2, 3].map(n =>
        `<button type="button" class="autoeval-bulb${rating && n <= rating ? ' is-lit' : ''}" data-level="${n}" aria-label="Niveau ${n}">${getBulbSvg()}</button>`
      ).join('') +
      '</div>';
  }

  // Le texte est un bouton qui ouvre la fenêtre de l'attendu ; le chevron
  // « › » en bout de texte le signale.
  function createAutoEvalItem(item) {
    const rating = readAutoevalRating(item.id);
    return `
      <div class="autoeval-item" data-item-id="${item.id}" data-rating="${rating || 0}">
        <button type="button" class="autoeval-item-open" aria-haspopup="dialog">
          <span class="autoeval-item-text">${richText(item.text || '')}</span>
          <span class="autoeval-item-more" aria-hidden="true">›</span>
        </button>
        ${createBulbsHtml(rating)}
      </div>
    `;
  }

  // La fenêtre d'un attendu : même structure de notation (data-item-id,
  // ampoules) que la ligne, donc le même geste et la même mise à jour.
  function renderAutoevalDetail(itemId) {
    const box = document.getElementById('autoeval-detail');
    const item = autoevalItemsById.get(itemId);
    if (!box || !item) return;
    const rating = readAutoevalRating(item.id);
    const category = autoevalCategoryOfItem.get(itemId);
    box.innerHTML = `
      <div class="autoeval-detail-item" data-item-id="${item.id}" data-rating="${rating || 0}">
        <span class="autoeval-detail-kicker">${richText((category && category.title) || '')}</span>
        <p class="autoeval-detail-text" id="autoeval-detail-text">${richText(item.text || '')}</p>
        <div class="autoeval-detail-rate">${createBulbsHtml(rating)}<span>Touche l'ampoule de ton niveau.</span></div>
        <div class="autoeval-advice-slot">${buildAutoevalAdviceHtml(item, rating)}</div>
        <div class="autoeval-item-details">${buildAutoevalDetailsHtml(item, rating)}</div>
      </div>
    `;
  }

  // 'irregulier' (a tie between two or more levels — ratings pulling in
  // different directions, no clear tendency) and 'enCours' (level 2 alone
  // dominant — a coherent "getting there", not yet acquired) used to both
  // collapse into one 'mixte' status; kept distinct now since they call for
  // different advice, not because either is more "weak" or "solid" than
  // the other — neither counts toward weakCount/solidCount below.
  function computeCategoryStatus(category) {
    const ratings = category.items.map(item => readAutoevalRating(item.id)).filter(r => r !== null);
    if (ratings.length === 0) return null;
    const counts = { 1: 0, 2: 0, 3: 0 };
    ratings.forEach(r => counts[r]++);
    const maxCount = Math.max(counts[1], counts[2], counts[3]);
    const dominant = [1, 2, 3].filter(level => counts[level] === maxCount);
    if (dominant.length > 1) return 'irregulier';
    if (dominant[0] === 1) return 'faible';
    if (dominant[0] === 3) return 'solide';
    return 'enCours';
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

  // Compact label for the "Bilan par catégorie" scoreboard — shown from the
  // very first rating in ANY category (unlike the "Bilan croisé" below it,
  // which needs all three). "acquis" rather than "solide" to match the
  // wording students already see on a single attendu (AUTOEVAL_GENERAL_ADVICE
  // [3]: "cette notion est acquise").
  const AUTOEVAL_CATEGORY_STATUS_LABEL = { faible: 'Faible', enCours: 'À consolider', irregulier: 'Irrégulier', solide: 'Acquis' };

  // A single rating already produces a status (computeCategoryStatus has no
  // minimum), which would otherwise read as a firm verdict off one data
  // point. How many attendus it rests on is therefore shown too — but on its
  // own line and in words: a fraction glued to the label ("Acquis (1/8)")
  // read like a mark, one that contradicted the label itself.
  function buildCoverageText(ratedCount, total) {
    if (ratedCount >= total) return 'Tous les attendus évalués';
    return ratedCount === 1
      ? `1 attendu évalué sur ${total}`
      : `${ratedCount} attendus évalués sur ${total}`;
  }

  function buildCategoryScoreboardHtml(categories, statuses) {
    const items = categories.map(category => {
      const status = statuses[category.id];
      const total = category.items.length;
      const ratedCount = category.items.filter(item => readAutoevalRating(item.id) !== null).length;
      const statusText = status ? AUTOEVAL_CATEGORY_STATUS_LABEL[status] : '—';
      const coverageHtml = status
        ? `<span class="autoeval-scoreboard-coverage">${buildCoverageText(ratedCount, total)}</span>`
        : '';
      return `<div class="autoeval-scoreboard-item">` +
        `<span class="autoeval-scoreboard-label">${richText(category.title || '')}</span>` +
        `<span class="autoeval-scoreboard-status">${statusText}</span>` +
        coverageHtml +
        `</div>`;
    }).join('');
    return `<div class="autoeval-scoreboard">${items}</div>`;
  }

  function computeAutoevalSynthesis(categories) {
    const statuses = {};
    categories.forEach(category => { statuses[category.id] = computeCategoryStatus(category); });
    const { savoirs, savoirFaire, competence } = statuses;

    const categoryScoreboard = Object.values(statuses).some(s => s !== null)
      ? buildCategoryScoreboardHtml(categories, statuses)
      : null;

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
        // weakCount is 0 here (no 'faible') and solidCount is 1 or 2 (the 0
        // and 3 cases were already handled above), so "not solide" reliably
        // means "enCours or irregulier" — never "faible" in this branch.
        const mixteTitles = categories
          .filter(category => statuses[category.id] !== 'solide')
          .map(category => category.title);
        mainMessage = AUTOEVAL_SYNTHESIS_TEXT.mostlyGood(mixteTitles);
      }
    }
    // Else: not all three categories have data yet — mainMessage stays null
    // and the cross-category comparison simply doesn't run. The scoreboard
    // above (already computed) is shown on its own in the meantime.

    let vocabMessage = null;
    categories.forEach(category => category.items.forEach(item => {
      if (item.isVocabulary) {
        const rating = readAutoevalRating(item.id);
        if (rating === 1 || rating === 2) vocabMessage = AUTOEVAL_SYNTHESIS_TEXT.vocabulary;
      }
    }));

    return { mainMessage, categoryScoreboard, vocabMessage };
  }

  function renderAutoevalSynthesis() {
    const container = document.getElementById('autoeval-synthesis');
    if (!container) return;
    const { mainMessage, categoryScoreboard, vocabMessage } = computeAutoevalSynthesis(autoevalCategoriesCache);
    // categoryScoreboard (per-category score) shows from the first rating in
    // any category; mainMessage (the cross-category "Bilan croisé") only
    // once all three have data, and is never duplicated by a lesser version
    // of itself while waiting — the scoreboard alone covers that gap.
    const blocks = [
      categoryScoreboard ? ['Bilan par catégorie', categoryScoreboard] : null,
      mainMessage ? ['Bilan croisé', mainMessage] : null,
      vocabMessage ? ['Vocabulaire', vocabMessage] : null
    ].filter(Boolean).map(([kicker, text]) =>
      `<div class="autoeval-synthesis-msg"><span class="autoeval-synthesis-kicker">${kicker}</span>${text}</div>`
    );
    const waiting = !categoryScoreboard
      ? '<p class="autoeval-synthesis-wait">Évalue d\'abord quelques attendus : ton bilan apparaîtra ici.</p>'
      : (!mainMessage ? '<p class="autoeval-synthesis-wait">Le bilan croisé apparaît dès que tu as évalué au moins un attendu dans chacune des trois catégories.</p>' : '');
    container.innerHTML = blocks.join('') + waiting;
    renderTabStatuses();
  }

  // L'état de chaque catégorie, sous son nom dans la colonne de gauche :
  // « À consolider · 6 / 8 » (même mot que le bilan par catégorie).
  function renderTabStatuses() {
    autoevalCategoriesCache.forEach(category => {
      const el = document.querySelector(`.autoeval-tab-status[data-category="${category.id}"]`);
      if (!el) return;
      const total = category.items.length;
      const rated = category.items.filter(item => readAutoevalRating(item.id) !== null).length;
      const status = computeCategoryStatus(category);
      el.textContent = `${status ? AUTOEVAL_CATEGORY_STATUS_LABEL[status] : 'À évaluer'} · ${rated} / ${total}`;
    });
  }

  function showError() {
    const panels = document.getElementById('autoeval-panels');
    const tabs = document.getElementById('autoeval-tabs');
    if (tabs) tabs.innerHTML = '';
    if (panels) panels.innerHTML = '<div class="load-error">Erreur de chargement. Recharge la page, et préviens ton professeur si cela se reproduit.</div>';
  }

  /* La liste de la catégorie choisie remplit sa carte : en une colonne si
     elle tient, sinon en deux (colonne de gauche d'abord), puis le texte
     rapetisse (--autoeval-fit). Mesuré, pas supposé :
     le nombre d'attendus et la longueur des textes varient d'un chapitre à
     l'autre (de 1 à 14 attendus, de 30 à 300 caractères). */
  // 0,6 au plus bas : sur le Chromebook, rien ne descend sous 0,78 ; plus
  // bas, c'est un écran plus petit que prévu, et la page doit y tenir
  // quand même plutôt que de déborder.
  const FIT_MIN = 0.6;

  function fitList() {
    const panel = document.querySelector('.autoeval-panel.is-active');
    if (!panel) return;
    const list = panel.querySelector('.autoeval-list');
    const count = list.children.length;
    // Débordement : de la liste, ou d'un texte hors de sa case (les rangées
    // se tassent avant que la liste ne déborde).
    const texts = [...list.querySelectorAll('.autoeval-item-open')];
    const overflows = () => list.scrollHeight > list.clientHeight + 1
      || texts.some(t => t.scrollHeight > t.clientHeight + 1);
    const apply = (cols, fit) => {
      list.style.setProperty('--autoeval-cols', cols);
      list.style.setProperty('--autoeval-rows', Math.ceil(count / cols));
      list.style.setProperty('--autoeval-fit', fit);
    };
    apply(1, 1);
    if (!overflows()) return;
    if (count > 1) apply(2, 1);
    let fit = 1;
    while (fit > FIT_MIN && overflows()) {
      fit = Math.round((fit - 0.03) * 100) / 100;
      apply(count > 1 ? 2 : 1, fit);
    }
  }

  function showCategory(categoryId) {
    document.querySelectorAll('.autoeval-tab').forEach(b => {
      const on = b.dataset.category === categoryId;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    document.querySelectorAll('.autoeval-panel').forEach(p => p.classList.toggle('is-active', p.dataset.category === categoryId));
    fitList();
  }

  function renderAutoEvalPage(data) {
    const tabs = document.getElementById('autoeval-tabs');
    const panels = document.getElementById('autoeval-panels');
    if (!tabs || !panels) return;

    if (!data || !data.categories?.length) {
      tabs.innerHTML = '';
      panels.innerHTML = '<p>Fiche indisponible pour ce chapitre pour le moment.</p>';
      autoevalCategoriesCache = [];
      return;
    }

    const categories = data.categories.filter(category => category.items?.length);
    autoevalCategoriesCache = categories;
    autoevalItemsById = new Map();
    autoevalCategoryOfItem = new Map();
    categories.forEach(category => category.items.forEach(item => {
      autoevalItemsById.set(String(item.id), item);
      autoevalCategoryOfItem.set(String(item.id), category);
    }));

    tabs.innerHTML = categories.map((category, i) =>
      `<button type="button" class="autoeval-tab${i === 0 ? ' active' : ''}" data-category="${category.id}" aria-pressed="${i === 0}">` +
      `<span class="autoeval-tab-title">${richText(category.title || '')}</span>` +
      `<span class="autoeval-tab-status" data-category="${category.id}"></span></button>`
    ).join('');
    panels.innerHTML = categories.map((category, i) => `
      <div class="autoeval-panel${i === 0 ? ' is-active' : ''}" data-category="${category.id}">
        <h2 class="autoeval-panel-title">${richText(category.title || '')}</h2>
        <div class="autoeval-list">${category.items.map(createAutoEvalItem).join('')}</div>
      </div>
    `).join('');

    renderAutoevalSynthesis();
    fitList();
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('modal-open');
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('modal-open');
  }

  // Une note (ligne ou fenêtre) : enregistrée, puis la ligne, la fenêtre si
  // elle montre cet attendu, les états des catégories et le bilan suivent.
  function rate(itemId, clickedLevel) {
    const wasAlreadyAtThisLevel = readAutoevalRating(itemId) === clickedLevel;
    const level = wasAlreadyAtThisLevel ? null : clickedLevel;
    if (level === null) clearAutoevalRating(itemId);
    else writeAutoevalRating(itemId, level);

    if (window.logEvent) {
      const category = autoevalCategoryOfItem.get(itemId);
      window.logEvent('autoeval_item_rated', { itemId, category: category ? category.id : null, rating: level });
    }

    document.querySelectorAll(`[data-item-id="${itemId}"]`).forEach(el => {
      el.dataset.rating = level || 0;
      el.querySelectorAll('.autoeval-bulb').forEach(b => {
        b.classList.toggle('is-lit', level !== null && parseInt(b.dataset.level, 10) <= level);
      });
    });
    const detail = document.querySelector(`.autoeval-detail-item[data-item-id="${itemId}"]`);
    const item = autoevalItemsById.get(itemId);
    if (detail && item) {
      detail.querySelector('.autoeval-advice-slot').innerHTML = buildAutoevalAdviceHtml(item, level);
      detail.querySelector('.autoeval-item-details').innerHTML = buildAutoevalDetailsHtml(item, level);
    }
    renderAutoevalSynthesis();
  }

  function loadAutoEval() {
    const tabs = document.getElementById('autoeval-tabs');
    const panels = document.getElementById('autoeval-panels');
    if (!tabs || !panels) return;

    tabs.addEventListener('click', event => {
      const tabBtn = event.target.closest('.autoeval-tab');
      if (tabBtn) showCategory(tabBtn.dataset.category);
    });

    document.addEventListener('click', event => {
      const bulbBtn = event.target.closest('.autoeval-bulb');
      if (bulbBtn) {
        const holder = bulbBtn.closest('[data-item-id]');
        if (holder) rate(holder.dataset.itemId, parseInt(bulbBtn.dataset.level, 10));
        return;
      }
      const openBtn = event.target.closest('.autoeval-item-open');
      if (openBtn) {
        renderAutoevalDetail(openBtn.closest('.autoeval-item').dataset.itemId);
        openModal('autoeval-detail-modal');
        return;
      }
      if (event.target.closest('#autoeval-bilan-open')) {
        renderAutoevalSynthesis();
        openModal('autoeval-bilan-modal');
        return;
      }
      const closeBtn = event.target.closest('[data-autoeval-close]');
      if (closeBtn) { closeModal(closeBtn.closest('.modal-overlay')); return; }
      // Un toucher sur le fond grisé referme la fenêtre.
      if (event.target.matches('#autoeval-detail-modal, #autoeval-bilan-modal')) closeModal(event.target);
    });

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      document.querySelectorAll('#autoeval-detail-modal.modal-open, #autoeval-bilan-modal.modal-open').forEach(closeModal);
    });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fitList, 150);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitList);

    if (window.logEvent) window.logEvent('autoeval_page_opened', {});

    // SiteStorage.ready : les notes de l'élève sont chargées (Firestore)
    // avant le premier affichage.
    Promise.all([fetch('./autoeval.json?v=' + Date.now()), SiteStorage.ready])
      .then(([response]) => {
        // A 404 means this chapter simply has no fiche yet — not a technical
        // failure, so it takes the same friendly empty-state as a fiche with
        // no categories (renderAutoEvalPage below), never the "reload / tell
        // your teacher" error message that a genuine fetch/parse failure gets.
        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(renderAutoEvalPage)
      .catch(error => { console.error(error); showError(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAutoEval);
  } else {
    loadAutoEval();
  }
})();
