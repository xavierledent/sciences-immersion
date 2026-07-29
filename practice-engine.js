    // Language is inferred from the URL (.../en/... vs .../nl/...) so this one
    // shared script can render correct interface labels on both immersion tracks.
    // Only chrome/UI text lives here — exercise content itself comes from the
    // chapter's own JSON files, already in the right language.
    const pageLang = location.pathname.split('/').includes('nl') ? 'nl' : 'en';

    const LABELS = {
      en: {
        questionTarget: 'Question EN',
        questionFrench: 'Question FR',
        correctionTarget: 'Correction EN',
        correctionFrench: 'Correction FR',
        tryTargetFirst: 'Try EN first',
        contentNotAvailable: 'Content not available.',
        correctionNotAvailable: 'Correction not available.',
        exerciseUnderConstruction: 'Exercise is under construction...',
        selectQuiz: 'Select a quiz:',
        selectText: 'Select a text:',
        selectGame: 'Select a game:',
        goTo: 'Go to:',
        go: 'Go',
        enterNumberBetween: n => `Enter a number between 1 and ${n}`,
        prevExerciseAria: 'Previous exercise',
        nextExerciseAria: 'Next exercise',
        level1: 'Level 1',
        level2: 'Level 2',
        level3: 'Level 3',

        answerPlaceholder: 'Write your answer here...',
        checkMyAnswer: 'Check my answer',
        editMyAnswer: '← Edit my answer',
        answerSaved: 'Saved',
        yourAnswer: 'Your answer',
        answerEmpty: 'You have not written an answer yet.',
        enlargeHint: 'Click to open this picture full screen',

        quizCompleted: 'Quiz Completed!',
        yourScore: 'Your score:',
        yourBest: 'Your best:',
        newPersonalBest: '🎉 New personal best!',
        checkAnswer: 'Check Answer',
        nextQuestion: 'Next Question',

        rankGold: 'Gold',
        rankSilver: 'Silver',
        rankBronze: 'Bronze',
        rankPerfect: 'Perfect!',
        rankKeepPracticing: 'Keep practicing',
        newBestMistakes: 'New best: fewest mistakes!',
        newBestMoves: 'New best: fewest moves!',
        newBestTime: 'New best time!',
        errors: 'Errors:',
        correct: 'Correct:',
        moves: 'Moves:',
        showTimer: 'Show timer',
        hideTimer: 'Hide',
        checkCategories: 'Check Categories',
        tryAgain: 'Try Again',
        checkAnswers: 'Check Answers',
        wellDone: 'Well done !',
        bestMistakes: n => 'Best: ' + n + ' mistake' + (n !== 1 ? 's' : ''),
        bestMoves: n => 'Best: ' + n + ' move' + (n !== 1 ? 's' : ''),
        glossHint: '💡 Underlined words can be translated into French',
        listen: '🔊 Listen',
        pause: '⏸ Pause',
        resume: '▶ Resume',
        bestTimePrefix: 'Best time: '
      },
      nl: {
        questionTarget: 'Vraag NL',
        questionFrench: 'Vraag FR',
        correctionTarget: 'Correctie NL',
        correctionFrench: 'Correctie FR',
        tryTargetFirst: 'Probeer eerst NL',
        contentNotAvailable: 'Inhoud niet beschikbaar.',
        correctionNotAvailable: 'Correctie niet beschikbaar.',
        exerciseUnderConstruction: 'Deze oefening is nog in opbouw...',
        selectQuiz: 'Kies een quiz:',
        selectText: 'Kies een tekst:',
        selectGame: 'Kies een spel:',
        goTo: 'Ga naar:',
        go: 'Ga',
        enterNumberBetween: n => `Voer een getal in tussen 1 en ${n}`,
        prevExerciseAria: 'Vorige oefening',
        nextExerciseAria: 'Volgende oefening',
        level1: 'Level 1',
        level2: 'Level 2',
        level3: 'Level 3',

        answerPlaceholder: 'Schrijf hier je antwoord...',
        checkMyAnswer: 'Mijn antwoord nakijken',
        editMyAnswer: '← Mijn antwoord aanpassen',
        answerSaved: 'Opgeslagen',
        yourAnswer: 'Jouw antwoord',
        answerEmpty: 'Je hebt nog geen antwoord geschreven.',
        enlargeHint: 'Klik om deze afbeelding schermvullend te openen',

        quizCompleted: 'Quiz voltooid!',
        yourScore: 'Jouw score:',
        yourBest: 'Jouw record:',
        newPersonalBest: '🎉 Nieuw persoonlijk record!',
        checkAnswer: 'Antwoord controleren',
        nextQuestion: 'Volgende vraag',

        rankGold: 'Goud',
        rankSilver: 'Zilver',
        rankBronze: 'Brons',
        rankPerfect: 'Perfect!',
        rankKeepPracticing: 'Blijf oefenen',
        newBestMistakes: 'Nieuw record: minste fouten!',
        newBestMoves: 'Nieuw record: minste zetten!',
        newBestTime: 'Nieuwe snelste tijd!',
        errors: 'Fouten:',
        correct: 'Juist:',
        moves: 'Zetten:',
        showTimer: 'Toon timer',
        hideTimer: 'Verbergen',
        checkCategories: 'Categorieën controleren',
        tryAgain: 'Opnieuw proberen',
        checkAnswers: 'Antwoorden controleren',
        wellDone: 'Goed gedaan!',
        bestMistakes: n => 'Beste: ' + n + ' fout' + (n !== 1 ? 'en' : ''),
        bestMoves: n => 'Beste: ' + n + ' zet' + (n !== 1 ? 'ten' : ''),
        glossHint: '💡 Onderstreepte woorden kunnen naar het Frans vertaald worden',
        listen: '🔊 Luister',
        pause: '⏸ Pauze',
        resume: '▶ Hervatten',
        bestTimePrefix: 'Beste tijd: '
      }
    };
    const L = LABELS[pageLang];

    // Strictly lowercase: GitHub Pages is case-sensitive, unlike Windows, so any
    // mismatch here 404s in production while working fine locally.
    const practicePath = './practice.json';
    const interactivePath = './interactive.json';
    const levelButtonsContainer = document.getElementById('level-buttons');
    const modalOverlay = document.getElementById('exercise-modal');
    const modalClose = document.getElementById('exercise-modal-close');
    const modalTitle = document.getElementById('exercise-modal-title');
    const modalSubtitle = document.getElementById('exercise-modal-subtitle');
    const exerciseImage = document.getElementById('exercise-image');
    // Optional wrapper (answer-box pages only): an <img> cannot carry a
    // pseudo-element, so the styled hover tooltip needs a real container.
    // Showing/hiding therefore targets the wrapper when it exists.
    const exerciseImageWrap = document.getElementById('exercise-image-wrap');
    const exerciseImageHost = exerciseImageWrap || exerciseImage;
    const exerciseSubQuestionNav = document.getElementById('exercise-subquestion-nav');
    const exerciseText = document.getElementById('exercise-text');
    const exercisesPagination = document.getElementById('exercises-pagination');
    const btnStatementEn = document.getElementById('btn-statement-en');
    const btnStatementFr = document.getElementById('btn-statement-fr');
    const btnCorrectionEn = document.getElementById('btn-correction-en');
    const btnCorrectionFr = document.getElementById('btn-correction-fr');
    const statementFrFill = document.getElementById('statement-fr-fill');
    const correctionFrFill = document.getElementById('correction-fr-fill');
    const statementFrLabelEl = document.getElementById('statement-fr-label');
    const correctionFrLabelEl = document.getElementById('correction-fr-label');

    const interactiveButtonsContainer = document.getElementById('interactive-buttons');
    const interactiveModalOverlay = document.getElementById('interactive-modal');
    const interactiveModalClose = document.getElementById('interactive-modal-close');
    const interactiveModalTitle = document.getElementById('interactive-modal-title');
    const interactiveText = document.getElementById('interactive-text');
    const interactivePagination = document.getElementById('interactive-pagination');

    let practiceData = null;
    let interactiveData = null;
    let currentInteractiveType = '';
    let currentInteractiveExercise = 1;

    // QCM State Variables
    let qcmCurrentQuestionIndex = 0;
    let qcmScore = 0;
    let qcmSelectedOptionIndex = null;
    let qcmIsChecked = false;
    let qcmStreak = 0;
    let qcmScoreSaved = false;
    let qcmScoreScreenInfo = null;

    // Streak bar fills up to this many consecutive correct answers, then stays full.
    const QCM_STREAK_CAP = 5;

    function getQcmStorageKey(quizData) {
      return 'qcmBestScore::' + location.pathname + '::' + (quizData.quizTitle || 'quiz');
    }

    function getQcmBestScore(quizData) {
      try {
        const raw = localStorage.getItem(getQcmStorageKey(quizData));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (typeof parsed.score === 'number' && typeof parsed.total === 'number') return parsed;
      } catch (e) {}
      return null;
    }

    function saveQcmBestScore(quizData, score, total) {
      try { localStorage.setItem(getQcmStorageKey(quizData), JSON.stringify({ score, total })); } catch (e) {}
    }

    function getQcmRank(score, total) {
      const pct = total > 0 ? score / total : 0;
      if (pct >= 0.9) return { emoji: '🥇', label: L.rankGold };
      if (pct >= 0.7) return { emoji: '🥈', label: L.rankSilver };
      if (pct >= 0.5) return { emoji: '🥉', label: L.rankBronze };
      return { emoji: '💪', label: L.rankKeepPracticing };
    }

    let currentLevel = 'level1';
    let currentExercise = 1;
    let currentView = 'en';
    let currentSubQuestion = 0;

    // French statement/correction is locked for a few seconds on every new
    // question/sub-question, to nudge students into reading the English first.
    // While locked, the label swaps to an explicit nudge instead of a ticking
    // number, and a fill bar behind the label drains over the lock duration —
    // this avoids both a bare "(25s)" that reads as a bug and any per-second
    // text change that could resize the button.
    const frStatementLabel = statementFrLabelEl.textContent;
    const frCorrectionLabel = correctionFrLabelEl.textContent;
    const FR_LOCK_NUDGE = L.tryTargetFirst;
    let frUnlockTimeoutId = null;
    // Kept so the correction bar can be re-armed with the time actually left
    // when it is revealed part-way through the countdown.
    let frLockStartedAt = 0;
    let frLockDurationMs = 0;

    // Sub-questions already seen inside the current exercise, so the nudge is
    // armed once per sub-question instead of on every click back and forth.
    // Deliberately in memory rather than localStorage: persisting it would
    // silently disable the nudge for good after a single visit, while a new
    // sitting deserves the same "read it in the target language first" prompt.
    let visitedSubQuestions = new Set([0]);

    // Sub-question 0 is the one shown on arrival, and entering an exercise
    // already arms the lock, so it counts as visited from the start.
    function resetVisitedSubQuestions() {
      visitedSubQuestions = new Set([0]);
    }

    function getFrLockSeconds() {
      if (currentLevel === 'level3') return 30;
      if (currentLevel === 'level2') return 20;
      return 15;
    }

    function lockFrButtons() {
      if (frUnlockTimeoutId) clearTimeout(frUnlockTimeoutId);
      const seconds = getFrLockSeconds();
      btnStatementFr.disabled = true;
      btnCorrectionFr.disabled = true;
      if (currentView === 'fr') handleStatementMode('en');
      else if (currentView === 'corr_fr') handleCorrectionMode('corr_en');

      statementFrLabelEl.textContent = FR_LOCK_NUDGE;
      correctionFrLabelEl.textContent = FR_LOCK_NUDGE;

      [statementFrFill, correctionFrFill].forEach(fill => {
        fill.style.transition = 'none';
        fill.style.transform = 'scaleX(1)';
        void fill.offsetWidth; // force reflow so the transition below actually animates
        fill.style.transition = `transform ${seconds}s linear`;
        fill.style.transform = 'scaleX(0)';
      });

      frLockDurationMs = seconds * 1000;
      frLockStartedAt = Date.now();

      frUnlockTimeoutId = setTimeout(() => {
        frUnlockTimeoutId = null;
        btnStatementFr.disabled = false;
        btnCorrectionFr.disabled = false;
        statementFrLabelEl.textContent = frStatementLabel;
        correctionFrLabelEl.textContent = frCorrectionLabel;
      }, frLockDurationMs);
    }

    // On pages that hide the correction toggles until the student checks their
    // answer, the drain transition started by lockFrButtons never played: a
    // transition does not run on a display:none element. Re-arm it from the
    // remaining time at the moment the buttons actually appear.
    function resyncCorrectionFrFill() {
      if (!frUnlockTimeoutId || !frLockDurationMs) return;
      const remaining = frLockStartedAt + frLockDurationMs - Date.now();
      if (remaining <= 0) return;
      correctionFrFill.style.transition = 'none';
      correctionFrFill.style.transform = `scaleX(${remaining / frLockDurationMs})`;
      void correctionFrFill.offsetWidth;
      correctionFrFill.style.transition = `transform ${remaining / 1000}s linear`;
      correctionFrFill.style.transform = 'scaleX(0)';
    }

    // setRichText / richText come from rich-text.js, loaded before this engine.

    // Returns the exercise's questions array when it uses the multi-sub-question format, else null.
    function getExerciseQuestions(exerciseItem) {
      return (exerciseItem && Array.isArray(exerciseItem.questions) && exerciseItem.questions.length) ? exerciseItem.questions : null;
    }

    function setActiveButton(buttonGroup, activeButton) {
      buttonGroup.forEach(button => {
        button.classList.toggle('active', button === activeButton);
      });
    }

    // Derived from the current state rather than set by each caller, because the
    // two pairs stopped being one exclusive group: on answer-box pages the
    // statement toggles re-language the recalled question while a correction is
    // on screen, so "Question FR" and "Correction EN" can be active together.
    // Pages without the answer box keep the original single-active-of-four look.
    function applyToggleState() {
      const correctionMode = (currentView === 'corr_en' || currentView === 'corr_fr') ? currentView : null;

      if (!answerFeatureOn) {
        const active = correctionMode
          ? (correctionMode === 'corr_en' ? btnCorrectionEn : btnCorrectionFr)
          : (currentView === 'fr' ? btnStatementFr : btnStatementEn);
        setActiveButton([btnStatementEn, btnStatementFr, btnCorrectionEn, btnCorrectionFr], active);
        return;
      }

      setActiveButton([btnStatementEn, btnStatementFr], lastStatementView === 'fr' ? btnStatementFr : btnStatementEn);
      setActiveButton(
        [btnCorrectionEn, btnCorrectionFr],
        correctionMode === 'corr_en' ? btnCorrectionEn : (correctionMode === 'corr_fr' ? btnCorrectionFr : null)
      );
    }

    function getLevelLabel(levelKey) {
      if (levelKey === 'level1') return L.level1;
      if (levelKey === 'level2') return L.level2;
      if (levelKey === 'level3') return L.level3;
      return '';
    }

    function openModal(levelKey) {
      flushAnswerSave();
      answerLoadedKey = null;
      currentLevel = levelKey;
      currentExercise = 1;
      currentView = 'en';
      lastStatementView = 'en';
      currentSubQuestion = 0;
      resetVisitedSubQuestions();
      modalOverlay.classList.add('modal-open');
      updateModalHeader();
      renderExerciseSteps();
      renderExerciseContent();
      lockFrButtons();
    }

    function closeModal() {
      flushAnswerSave();
      modalOverlay.classList.remove('modal-open');
    }

    function updateModalHeader() {
      modalSubtitle.textContent = getLevelLabel(currentLevel);
      const exerciseList = practiceData[currentLevel] || [];
      const exerciseItem = exerciseList.find(item => item.id === currentExercise);
      modalTitle.textContent = (exerciseItem && exerciseItem.title) ? exerciseItem.title : `Exercise ${currentExercise}`;
    }

    // Builds [1, '...', current-3..current+3, '...', total], collapsing an ellipsis
    // whenever the sliding window already touches that boundary (no '...' right
    // next to the number it would have replaced), and falling back to a plain
    // 1..total list when everything already fits without needing to hide anything.
    function getPaginationRange(current, total, siblingCount) {
      const totalNumbersShown = siblingCount * 2 + 5; // first + last + current + siblings + 2 ellipses-worth of slack
      if (totalNumbersShown >= total) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }

      const leftSibling = Math.max(current - siblingCount, 1);
      const rightSibling = Math.min(current + siblingCount, total);
      const showLeftEllipsis = leftSibling > 2;
      const showRightEllipsis = rightSibling < total - 1;

      if (!showLeftEllipsis && showRightEllipsis) {
        const leftItemCount = 3 + siblingCount * 2;
        const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
        return [...leftRange, '...', total];
      }

      if (showLeftEllipsis && !showRightEllipsis) {
        const rightItemCount = 3 + siblingCount * 2;
        const rightRange = Array.from({ length: rightItemCount }, (_, i) => total - rightItemCount + i + 1);
        return [1, '...', ...rightRange];
      }

      const middleRange = Array.from({ length: rightSibling - leftSibling + 1 }, (_, i) => leftSibling + i);
      return [1, '...', ...middleRange, '...', total];
    }

    function renderExerciseSteps() {
      exercisesPagination.innerHTML = '';
      const exerciseList = practiceData[currentLevel] || [];
      const numExercises = exerciseList.length;
      if (numExercises === 0) return;

      const pager = document.createElement('div');
      pager.className = 'exercise-pager';

      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'exercise-pager-arrow';
      prevBtn.dataset.direction = 'prev';
      prevBtn.setAttribute('aria-label', L.prevExerciseAria);
      prevBtn.textContent = '◀';
      prevBtn.disabled = currentExercise <= 1;
      pager.appendChild(prevBtn);

      const numbersWrap = document.createElement('div');
      numbersWrap.className = 'exercise-pager-numbers';
      getPaginationRange(currentExercise, numExercises, 3).forEach(item => {
        if (item === '...') {
          const dots = document.createElement('span');
          dots.className = 'exercise-pager-ellipsis';
          dots.textContent = '...';
          numbersWrap.appendChild(dots);
        } else {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'exercise-step';
          btn.dataset.step = String(item);
          btn.textContent = String(item);
          if (item === currentExercise) btn.classList.add('active');
          // Purely a "you already wrote something here" reminder — deliberately
          // not a score or difficulty signal.
          if (answerFeatureOn && hasAnyStoredAnswer(currentLevel, exerciseList.find(ex => ex.id === item))) {
            btn.classList.add('has-answer');
          }
          numbersWrap.appendChild(btn);
        }
      });
      pager.appendChild(numbersWrap);

      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'exercise-pager-arrow';
      nextBtn.dataset.direction = 'next';
      nextBtn.setAttribute('aria-label', L.nextExerciseAria);
      nextBtn.textContent = '▶';
      nextBtn.disabled = currentExercise >= numExercises;
      pager.appendChild(nextBtn);

      exercisesPagination.appendChild(pager);

      const goTo = document.createElement('div');
      goTo.className = 'exercise-pager-goto';
      goTo.innerHTML =
        `<label for="exercise-goto-input">${L.goTo}</label>` +
        `<input type="number" id="exercise-goto-input" min="1" max="${numExercises}" placeholder="${currentExercise}" />` +
        `<button type="button" class="exercise-pager-goto-btn">${L.go}</button>`;
      exercisesPagination.appendChild(goTo);
    }

    // Single entry point for every way to change exercise: number click, arrows,
    // "Go to" field. Silently ignores out-of-range/non-integer targets so callers
    // that already validate (arrows, number buttons) don't need to re-check.
    function goToExercise(n) {
      const exerciseList = practiceData[currentLevel] || [];
      const numExercises = exerciseList.length;
      if (!Number.isInteger(n) || n < 1 || n > numExercises) return false;
      flushAnswerSave();
      currentExercise = n;
      currentView = 'en';
      lastStatementView = 'en';
      currentSubQuestion = 0;
      resetVisitedSubQuestions();
      renderExerciseContent();
      lockFrButtons();
      return true;
    }

    let goToErrorTimer = null;
    function showGoToError(inputEl, message) {
      inputEl.classList.add('invalid');
      const wrap = inputEl.closest('.exercise-pager-goto');
      let err = wrap.querySelector('.exercise-pager-goto-error');
      if (!err) {
        err = document.createElement('span');
        err.className = 'exercise-pager-goto-error';
        wrap.appendChild(err);
      }
      err.textContent = message;
      if (goToErrorTimer) clearTimeout(goToErrorTimer);
      goToErrorTimer = setTimeout(() => {
        inputEl.classList.remove('invalid');
        if (err) err.remove();
      }, 2500);
    }

    function submitGoTo() {
      const input = document.getElementById('exercise-goto-input');
      if (!input) return;
      const exerciseList = practiceData[currentLevel] || [];
      const numExercises = exerciseList.length;
      const raw = input.value.trim();
      const n = Number(raw);
      if (!raw || !Number.isInteger(n) || n < 1 || n > numExercises) {
        showGoToError(input, L.enterNumberBetween(numExercises));
        return;
      }
      input.classList.remove('invalid');
      goToExercise(n);
    }

    function renderExerciseContent() {
      updateModalHeader();
      const exerciseList = practiceData[currentLevel] || [];
      const exerciseItem = exerciseList.find(item => item.id === currentExercise);

      if (!exerciseItem) {
        exerciseImageHost.style.display = 'none';
        exerciseSubQuestionNav.classList.add('hidden');
        exerciseSubQuestionNav.innerHTML = '';
        exerciseText.textContent = L.exerciseUnderConstruction;
        updateAnswerCompare(null, null);
        applyToggleState();
        return;
      }

      if (exerciseItem.image) {
        exerciseImage.src = `assets/${exerciseItem.image}`;
        exerciseImageHost.style.display = 'block';
      } else {
        exerciseImageHost.style.display = 'none';
      }

      renderSubQuestionNav(exerciseItem);

      const questions = getExerciseQuestions(exerciseItem);
      const source = questions ? questions[currentSubQuestion] : exerciseItem;

      if (currentView === 'en' || currentView === 'fr') {
        setRichText(exerciseText, (source && source[currentView]) || L.contentNotAvailable);
      } else {
        setRichText(exerciseText, (source && source[currentView]) || L.correctionNotAvailable);
      }

      syncAnswerBoxForExercise();
      updateAnswerCompare(exerciseItem, source);
      applyToggleState();

      renderExerciseSteps();
    }

    // Sub-question navigation ("a/b/c" style), only shown when an exercise has more than one question.
    function renderSubQuestionNav(exerciseItem) {
      const questions = getExerciseQuestions(exerciseItem);
      if (!questions || questions.length <= 1) {
        exerciseSubQuestionNav.classList.add('hidden');
        exerciseSubQuestionNav.innerHTML = '';
        return;
      }
      exerciseSubQuestionNav.classList.remove('hidden');
      exerciseSubQuestionNav.innerHTML = questions.map((_, index) => {
        return `<button type="button" class="exercise-step" data-subquestion="${index}">${subQuestionLetter(index)}</button>`;
      }).join('');
      updateSubQuestionButtons();
      updateSubQuestionMarkers();
    }

    // a, b, c... rather than 1, 2, 3 to avoid confusion with the exercise number itself.
    function subQuestionLetter(index) {
      return String.fromCharCode(97 + index);
    }

    function updateSubQuestionButtons() {
      const buttons = exerciseSubQuestionNav.querySelectorAll('.exercise-step');
      buttons.forEach(button => {
        button.classList.toggle('active', Number(button.dataset.subquestion) === currentSubQuestion);
      });
    }

    function handleStatementMode(mode) {
      lastStatementView = mode;
      // While a correction is on screen these buttons only re-language the
      // recalled statement: switching screens would drop the correction the
      // student is reading. "Edit my answer" is the deliberate way back.
      const onCorrection = currentView === 'corr_en' || currentView === 'corr_fr';
      if (!(onCorrection && answerFeatureOn)) currentView = mode;
      renderExerciseContent();
    }

    function handleCorrectionMode(mode) {
      currentView = mode;
      renderExerciseContent();
    }

    /* ===== Student answer box =====
       Opt-in per page: the whole feature stays dormant unless the host
       practice.html provides the markup, so this shared engine can gain the
       capability without changing chapters that have not adopted it yet. */
    const answerBox = document.getElementById('student-answer');
    const answerInput = document.getElementById('student-answer-input');
    const answerSavedTag = document.getElementById('student-answer-saved');
    const answerCheckBtn = document.getElementById('btn-check-answer');
    const answerCompare = document.getElementById('answer-compare');
    const answerEcho = document.getElementById('student-answer-echo');
    const answerMineLabel = document.getElementById('answer-compare-mine-label');
    const exerciseRecall = document.getElementById('exercise-recall');
    const exerciseRecallImg = document.getElementById('exercise-recall-img');
    const exerciseRecallText = document.getElementById('exercise-recall-text');
    const answerFeatureOn = !!(answerBox && answerInput && answerCompare && answerEcho);

    // Which statement language the student last read, so the condensed recall
    // shown next to the image thumbnail matches what they actually worked from.
    let lastStatementView = 'en';
    let answerSaveTimer = null;
    let answerSavedTagTimer = null;
    let answerLoadedKey = null;
    let wasComparing = false;
    // Carries its own level/exercise so a debounced save can never land on the
    // wrong exercise when the student navigates away mid-typing.
    let pendingAnswer = null;

    // The sub-question index is part of the key so an exercise split into a/b/c
    // keeps one answer per part; exercises without sub-questions simply always
    // use index 0.
    function getAnswerStorageKey(levelKey, exerciseId, subIndex) {
      return 'practiceAnswer::' + location.pathname + '::' + levelKey + '::' + exerciseId + '::' + subIndex;
    }

    function readStoredAnswer(levelKey, exerciseId, subIndex) {
      try { return localStorage.getItem(getAnswerStorageKey(levelKey, exerciseId, subIndex)) || ''; }
      catch (e) { return ''; }
    }

    function hasStoredAnswerForSub(levelKey, exerciseId, subIndex) {
      return readStoredAnswer(levelKey, exerciseId, subIndex).trim() !== '';
    }

    // Used by the exercise pager, where the marker means "started" rather than
    // "finished": a single answered sub-question is enough to light it up.
    function hasAnyStoredAnswer(levelKey, exerciseItem) {
      if (!exerciseItem) return false;
      const questions = getExerciseQuestions(exerciseItem);
      const count = questions ? questions.length : 1;
      for (let i = 0; i < count; i++) {
        if (hasStoredAnswerForSub(levelKey, exerciseItem.id, i)) return true;
      }
      return false;
    }

    function writeStoredAnswer(levelKey, exerciseId, subIndex, value) {
      try {
        const key = getAnswerStorageKey(levelKey, exerciseId, subIndex);
        if (value.trim() === '') localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch (e) {}
    }

    function flashAnswerSaved() {
      if (!answerSavedTag) return;
      answerSavedTag.textContent = L.answerSaved;
      answerSavedTag.classList.add('is-visible');
      if (answerSavedTagTimer) clearTimeout(answerSavedTagTimer);
      answerSavedTagTimer = setTimeout(() => answerSavedTag.classList.remove('is-visible'), 1600);
    }

    // Grows the box to fit the answer, replacing the removed resize grip. The
    // CSS max-height caps it, at which point the textarea scrolls on its own.
    function autoGrowAnswer() {
      if (!answerFeatureOn) return;
      answerInput.style.height = 'auto';
      answerInput.style.height = answerInput.scrollHeight + 'px';
    }

    function scheduleAnswerSave() {
      pendingAnswer = { level: currentLevel, exercise: currentExercise, sub: currentSubQuestion, value: answerInput.value };
      if (answerSaveTimer) clearTimeout(answerSaveTimer);
      answerSaveTimer = setTimeout(flushAnswerSave, 400);
    }

    function flushAnswerSave() {
      if (answerSaveTimer) { clearTimeout(answerSaveTimer); answerSaveTimer = null; }
      if (!pendingAnswer) return;
      const { level, exercise, sub, value } = pendingAnswer;
      pendingAnswer = null;
      writeStoredAnswer(level, exercise, sub, value);
      flashAnswerSaved();
      refreshAnswerMarkers();
    }

    // Updates the a/b/c markers in place rather than re-rendering the nav, so a
    // save never rebuilds the buttons under the student's cursor.
    function updateSubQuestionMarkers() {
      if (!answerFeatureOn) return;
      const exerciseList = practiceData[currentLevel] || [];
      const exerciseItem = exerciseList.find(item => item.id === currentExercise);
      if (!exerciseItem) return;
      exerciseSubQuestionNav.querySelectorAll('.exercise-step').forEach(button => {
        const index = Number(button.dataset.subquestion);
        button.classList.toggle('has-answer', hasStoredAnswerForSub(currentLevel, exerciseItem.id, index));
      });
    }

    function refreshAnswerMarkers() {
      renderExerciseSteps();
      updateSubQuestionMarkers();
    }

    // Only reloads when the targeted sub-question actually changed, so toggling
    // EN/FR or a correction view never wipes what the student is typing.
    function syncAnswerBoxForExercise() {
      if (!answerFeatureOn) return;
      const key = getAnswerStorageKey(currentLevel, currentExercise, currentSubQuestion);
      if (answerLoadedKey === key) return;
      flushAnswerSave();
      answerInput.value = readStoredAnswer(currentLevel, currentExercise, currentSubQuestion);
      answerLoadedKey = key;
      autoGrowAnswer();
    }

    function updateAnswerCompare(exerciseItem, source) {
      if (!answerFeatureOn) return;
      const comparing = currentView === 'corr_en' || currentView === 'corr_fr';

      answerCompare.classList.toggle('is-comparing', comparing);
      // Mirrored on the modal so the stylesheet can switch the whole body
      // layout, which a child class alone could not reach.
      modalOverlay.classList.toggle('is-comparing', comparing);

      // Only on the transition into the comparison, so switching correction
      // language afterwards does not restart the bar mid-drain.
      if (comparing && !wasComparing) resyncCorrectionFrFill();
      wasComparing = comparing;

      if (answerCheckBtn) answerCheckBtn.textContent = comparing ? L.editMyAnswer : L.checkMyAnswer;

      if (comparing) {
        const written = answerInput.value.trim();
        answerEcho.textContent = written || L.answerEmpty;
        answerEcho.classList.toggle('is-empty', !written);
      } else {
        // scrollHeight reads 0 while the box is hidden, so the height is
        // recomputed once it is on screen again.
        autoGrowAnswer();
      }

      // The question is recalled throughout the comparison, so the statement
      // toggles have something to act on and the student can check the wording
      // against the correction without leaving. With an image, the full-size
      // picture is swapped for a thumbnail to keep the height in check.
      const hasImage = !!(exerciseItem && exerciseItem.image);
      if (exerciseRecall) {
        if (comparing) {
          if (hasImage) {
            exerciseImageHost.style.display = 'none';
            exerciseRecallImg.src = `assets/${exerciseItem.image}`;
            exerciseRecallImg.style.display = '';
          } else {
            exerciseRecallImg.style.display = 'none';
          }
          exerciseRecall.classList.toggle('is-textonly', !hasImage);
          setRichText(exerciseRecallText, (source && (source[lastStatementView] || source.en)) || '');
          exerciseRecall.classList.add('is-visible');
        } else {
          exerciseRecall.classList.remove('is-visible');
        }
      }
    }

    /* ===== Click-to-enlarge for exercise illustrations =====
       Keeps the modal compact without sacrificing legibility: diagrams with
       small labels (food webs, data tables) can be opened full screen instead of
       relying on browser zoom. Built lazily in JS so no chapter needs new markup. */
    let imageLightbox = null;

    function ensureImageLightbox() {
      if (imageLightbox) return imageLightbox;
      imageLightbox = document.createElement('div');
      imageLightbox.className = 'image-lightbox';
      imageLightbox.innerHTML = '<img class="image-lightbox-img" alt="" />';
      imageLightbox.addEventListener('click', closeImageLightbox);
      document.body.appendChild(imageLightbox);
      return imageLightbox;
    }

    function openImageLightbox(src, alt) {
      if (!src) return;
      const box = ensureImageLightbox();
      const img = box.querySelector('.image-lightbox-img');
      img.src = src;
      img.alt = alt || '';
      box.classList.add('is-open');
    }

    function closeImageLightbox() {
      if (imageLightbox) imageLightbox.classList.remove('is-open');
    }

    function initAnswerBox() {
      if (!answerFeatureOn) return;

      // Hover hint rendered by CSS from this attribute, same pattern as the
      // fill-in-the-blanks word glosses, so it picks up the chapter colour.
      if (exerciseImageWrap) exerciseImageWrap.dataset.hint = L.enlargeHint;
      exerciseImage.addEventListener('click', () => openImageLightbox(exerciseImage.src, exerciseImage.alt));
      if (exerciseRecallImg) {
        // The 52px thumbnail is too small to host the same tooltip; the native
        // one keeps the affordance without covering the picture.
        exerciseRecallImg.title = L.enlargeHint;
        exerciseRecallImg.addEventListener('click', () => openImageLightbox(exerciseRecallImg.src, exerciseRecallImg.alt));
      }
      // Scoped to the lightbox being open so it never swallows Escape from
      // anything else on the page.
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && imageLightbox && imageLightbox.classList.contains('is-open')) {
          event.stopPropagation();
          closeImageLightbox();
        }
      });
      // Lets the shared stylesheet reserve room for the a/b/c markers only on
      // pages that actually opted into the answer box.
      modalOverlay.classList.add('has-answer-box');
      answerInput.setAttribute('placeholder', L.answerPlaceholder);
      if (answerCheckBtn) answerCheckBtn.textContent = L.checkMyAnswer;
      if (answerMineLabel) answerMineLabel.textContent = L.yourAnswer;

      answerInput.addEventListener('input', () => {
        autoGrowAnswer();
        scheduleAnswerSave();
      });
      answerInput.addEventListener('blur', flushAnswerSave);

      if (answerCheckBtn) {
        answerCheckBtn.addEventListener('click', () => {
          flushAnswerSave();
          if (currentView === 'corr_en' || currentView === 'corr_fr') {
            // Back to writing. The statement toggles no longer leave the
            // comparison, so this is the only way back to the answer box.
            currentView = lastStatementView;
            renderExerciseContent();
            answerInput.focus();
          } else {
            // Never gated on having written something: an empty box must still
            // reach the correction rather than block the student.
            handleCorrectionMode('corr_en');
          }
        });
      }
    }

    function bindEvents() {
      levelButtonsContainer.addEventListener('click', event => {
        const button = event.target.closest('button[data-level]');
        if (!button) return;
        const levelKey = button.dataset.level;
        openModal(levelKey);
      });

      modalClose.addEventListener('click', closeModal);
      modalOverlay.addEventListener('click', event => {
        if (event.target === modalOverlay) closeModal();
      });

      btnStatementEn.addEventListener('click', () => handleStatementMode('en'));
      btnStatementFr.addEventListener('click', () => handleStatementMode('fr'));
      btnCorrectionEn.addEventListener('click', () => handleCorrectionMode('corr_en'));
      btnCorrectionFr.addEventListener('click', () => handleCorrectionMode('corr_fr'));

      exercisesPagination.addEventListener('click', event => {
        const stepBtn = event.target.closest('.exercise-step');
        if (stepBtn) {
          goToExercise(Number(stepBtn.dataset.step));
          return;
        }
        const arrowBtn = event.target.closest('.exercise-pager-arrow');
        if (arrowBtn) {
          if (arrowBtn.disabled) return;
          goToExercise(currentExercise + (arrowBtn.dataset.direction === 'next' ? 1 : -1));
          return;
        }
        const gotoBtn = event.target.closest('.exercise-pager-goto-btn');
        if (gotoBtn) submitGoTo();
      });

      exercisesPagination.addEventListener('keydown', event => {
        if (event.key === 'Enter' && event.target.id === 'exercise-goto-input') {
          event.preventDefault();
          submitGoTo();
        }
      });

      // The placeholder shows the current exercise as a hint, but browsers only
      // hide a placeholder once you start typing — clearing it on focus makes it
      // obvious right away that you can type straight into an empty field.
      exercisesPagination.addEventListener('focusin', event => {
        if (event.target.id === 'exercise-goto-input') event.target.placeholder = '';
      });
      exercisesPagination.addEventListener('focusout', event => {
        if (event.target.id === 'exercise-goto-input') event.target.placeholder = String(currentExercise);
      });

      exerciseSubQuestionNav.addEventListener('click', event => {
        const button = event.target.closest('.exercise-step');
        if (!button) return;
        flushAnswerSave();
        currentSubQuestion = Number(button.dataset.subquestion);

        // Stay on whichever screen the student is already on: walking through
        // a/b/c while reading corrections should not bounce back to the
        // statement (and lose the correction language) on every click.
        const onCorrection = currentView === 'corr_en' || currentView === 'corr_fr';
        const firstVisit = !visitedSubQuestions.has(currentSubQuestion);
        visitedSubQuestions.add(currentSubQuestion);

        if (!onCorrection) {
          currentView = 'en';
          lastStatementView = 'en';
        }

        renderExerciseContent();

        // Armed once per sub-question, not on every click: skimming a/b/c and
        // coming back is normal behaviour and used to restart the wait each
        // time. Still skipped while reading corrections, where the nudge has
        // already served its purpose.
        if (!onCorrection && firstVisit) lockFrButtons();
      });

      interactiveButtonsContainer.addEventListener('click', event => {
        const button = event.target.closest('button[data-type]');
        if (!button) return;
        const typeKey = button.dataset.type;
        const title = button.textContent;
        if (typeKey === 'dragAndDrop') {
          openDndModal();
        } else if (typeKey === 'matchPairs') {
          openMemoryModal();
        } else if (typeKey === 'sorting') {
          openSortingModal();
        } else if (typeKey === 'multipleChoice') {
          openQCMModal();
        } else if (typeKey === 'fillBlanks') {
          openFitbModal();
        } else {
          openInteractiveModal(typeKey, title);
        }
      });

      interactiveModalClose.addEventListener('click', closeInteractiveModal);
      interactiveModalOverlay.addEventListener('click', event => {
        if (event.target === interactiveModalOverlay) closeInteractiveModal();
      });

      document.getElementById('dnd-modal-close').addEventListener('click', closeDndModal);
      document.getElementById('dnd-modal').addEventListener('click', event => {
        if (event.target === document.getElementById('dnd-modal')) closeDndModal();
      });

      document.getElementById('memory-modal-close').addEventListener('click', closeMemoryModal);
      document.getElementById('memory-modal').addEventListener('click', event => {
        if (event.target === document.getElementById('memory-modal')) closeMemoryModal();
      });

      document.getElementById('sorting-modal-close').addEventListener('click', closeSortingModal);
      document.getElementById('sorting-modal').addEventListener('click', event => {
        if (event.target === document.getElementById('sorting-modal')) closeSortingModal();
      });

      document.getElementById('qcm-modal-close').addEventListener('click', closeQCMModal);
      document.getElementById('qcm-modal').addEventListener('click', event => {
        if (event.target === document.getElementById('qcm-modal')) closeQCMModal();
      });

      document.getElementById('fitb-modal-close').addEventListener('click', closeFitbModal);
      document.getElementById('fitb-modal').addEventListener('click', event => {
        if (event.target === document.getElementById('fitb-modal')) closeFitbModal();
      });

      document.getElementById('btn-check-sorting').addEventListener('click', handleSortingActionClick);

      interactivePagination.addEventListener('click', event => {
        const button = event.target.closest('.exercise-step');
        if (!button) return;
        currentInteractiveExercise = Number(button.dataset.step);
        
        // Reset QCM state
        qcmCurrentQuestionIndex = 0;
        qcmScore = 0;
        qcmSelectedOptionIndex = null;
        qcmIsChecked = false;

        renderInteractiveContent();
      });
    }

    function openInteractiveModal(type, title) {
      currentInteractiveType = type;
      currentInteractiveExercise = 1;

      // Reset QCM state
      qcmCurrentQuestionIndex = 0;
      qcmScore = 0;
      qcmSelectedOptionIndex = null;
      qcmIsChecked = false;

      interactiveModalTitle.textContent = title;
      interactiveModalOverlay.classList.add('modal-open');
      renderInteractiveSteps();
      renderInteractiveContent();
    }

    function closeInteractiveModal() {
      interactiveModalOverlay.classList.remove('modal-open');
    }

    function renderInteractiveSteps() {
      interactivePagination.innerHTML = '';
      const exerciseList = interactiveData[currentInteractiveType] || [];
      const numExercises = exerciseList.length;

      const labelElement = document.querySelector('#interactive-modal .pagination-label');
      if (labelElement) {
        labelElement.textContent = currentInteractiveType === 'fillBlanks' ? L.selectText : L.selectQuiz;
      }

      interactivePagination.innerHTML = Array.from({ length: numExercises }, (_, index) => {
        const stepNumber = index + 1;
        const prefix = currentInteractiveType === 'fillBlanks' ? 'Text' : 'Quiz';
        return `<button type="button" class="exercise-step" data-step="${stepNumber}">${prefix} ${stepNumber}</button>`;
      }).join('');
      updateInteractiveStepButtons();
    }

    function updateInteractiveStepButtons() {
      const stepButtons = interactivePagination.querySelectorAll('.exercise-step');
      stepButtons.forEach(button => {
        const stepNumber = Number(button.dataset.step);
        button.classList.toggle('active', stepNumber === currentInteractiveExercise);
      });
    }

    function renderInteractiveContent() {
      const exerciseList = interactiveData[currentInteractiveType] || [];
      if (exerciseList.length === 0) {
        interactiveText.textContent = 'Session en cours de configuration...';
        return;
      }

      if (currentInteractiveType === 'multipleChoice') {
        renderQCM(exerciseList[currentInteractiveExercise - 1]);
      } else if (currentInteractiveType === 'fillBlanks') {
        renderFillInTheBlanks(exerciseList[currentInteractiveExercise - 1]);
      } else {
        interactiveText.textContent = `Données temporaires pour l'exercice ${currentInteractiveExercise} de type ${currentInteractiveType}...`;
      }
      
      updateInteractiveStepButtons();
    }

    function renderQCM(quizData) {
      const qcmContent = document.getElementById('qcm-content');
      const qcmModalCard = document.querySelector('.qcm-modal-card');
      if (!quizData || !quizData.questions) {
        qcmContent.textContent = 'Quiz data is corrupted or missing.';
        if (qcmModalCard) qcmModalCard.classList.remove('qcm-has-image');
        return;
      }

      const totalQuestions = quizData.questions.length;

      // Score Screen
      if (qcmCurrentQuestionIndex >= totalQuestions) {
        if (!qcmScoreSaved) {
          qcmScoreSaved = true;
          const previousBest = getQcmBestScore(quizData);
          const isNewRecord = !previousBest || qcmScore > previousBest.score;
          if (isNewRecord) saveQcmBestScore(quizData, qcmScore, totalQuestions);
          qcmScoreScreenInfo = { isNewRecord, best: isNewRecord ? { score: qcmScore, total: totalQuestions } : previousBest };
        }
        const rank = getQcmRank(qcmScore, totalQuestions);
        let bestHtml = '';
        if (qcmScoreScreenInfo.isNewRecord) {
          bestHtml = `<p class="qcm-best-note qcm-best-note-new">${L.newPersonalBest}</p>`;
        } else if (qcmScoreScreenInfo.best) {
          bestHtml = '<p class="qcm-best-note">' + L.yourBest + ' ' + qcmScoreScreenInfo.best.score + ' / ' + qcmScoreScreenInfo.best.total + '</p>';
        }
        qcmContent.innerHTML = `
          <div class="qcm-score-screen">
            <div class="qcm-rank-badge">${rank.emoji}</div>
            <h3>${L.quizCompleted}</h3>
            <p>${L.yourScore} <strong>${qcmScore} / ${totalQuestions}</strong></p>
            <p class="qcm-rank-label">${rank.label}</p>
            ${bestHtml}
          </div>
        `;
        if (qcmModalCard) qcmModalCard.classList.remove('qcm-has-image');
        return;
      }

      const questionData = quizData.questions[qcmCurrentQuestionIndex];
      const progressPercent = ((qcmCurrentQuestionIndex) / totalQuestions) * 100;

      let htmlStr = '<div class="qcm-progress-row">';
      htmlStr += '<div class="qcm-progress-container">';
      htmlStr += '<div class="qcm-progress-bar" style="width: ' + progressPercent + '%;"></div>';
      htmlStr += '</div>';
      if (qcmStreak >= 2) {
        htmlStr += '<div class="qcm-streak-pips">';
        htmlStr += '<span class="qcm-streak-pips-label">🔥 ' + qcmStreak + '</span>';
        for (let i = 1; i <= QCM_STREAK_CAP; i++) {
          htmlStr += '<span class="qcm-streak-pip' + (i <= qcmStreak ? ' filled' : '') + '"></span>';
        }
        htmlStr += '</div>';
      }
      htmlStr += '</div>';

      const hasOwnImage = 'image' in questionData;
      const imageToShow = hasOwnImage
          ? questionData.image
          : (quizData.image || null);

      if (qcmModalCard) qcmModalCard.classList.toggle('qcm-has-image', !!imageToShow);

      if (imageToShow) {
        htmlStr += '<img src="' + imageToShow + '" alt="Question Image" class="qcm-question-image" />';
      }

      htmlStr += '<div class="qcm-question">Question ' + (qcmCurrentQuestionIndex + 1) + '/' + totalQuestions + ': ' + richText(questionData.question) + '</div>';
      htmlStr += '<div class="qcm-options" id="qcm-options-container">';

      htmlStr += questionData.options.map((opt, index) => {
        let extraClass = '';
        if (qcmSelectedOptionIndex === index) extraClass = 'selected';

        if (qcmIsChecked) {
          if (index === questionData.correctAnswer) {
            extraClass += ' correct';
          } else if (index === qcmSelectedOptionIndex) {
            extraClass += ' wrong';
          }
        }

        let disabledAttr = qcmIsChecked ? 'disabled' : '';
        // Safe to format: the correct answer is matched on the option's index,
        // never on its text.
        return '<button class="qcm-option ' + extraClass + '" data-index="' + index + '" ' + disabledAttr + '>' + richText(opt) + '</button>';
      }).join('');

      htmlStr += '</div>';

      if (qcmIsChecked && qcmSelectedOptionIndex !== questionData.correctAnswer) {
        htmlStr += '<p class="qcm-gentle-feedback">Not quite — take a look at the correct answer above, then try the next question!</p>';
      }

      let actionDisabled = qcmSelectedOptionIndex === null ? 'disabled' : '';
      let actionText = qcmIsChecked ? L.nextQuestion : L.checkAnswer;
      htmlStr += '<button id="qcm-action-btn" class="qcm-action-btn" ' + actionDisabled + '>' + actionText + '</button>';

      qcmContent.innerHTML = htmlStr;

      const optionsContainer = document.getElementById('qcm-options-container');
      const actionBtn = document.getElementById('qcm-action-btn');

      if (!qcmIsChecked) {
        optionsContainer.addEventListener('click', (e) => {
          const btn = e.target.closest('.qcm-option');
          if (!btn) return;
          qcmSelectedOptionIndex = Number(btn.dataset.index);
          renderQCM(quizData);
        });

        actionBtn.addEventListener('click', () => {
          if (qcmSelectedOptionIndex === null) return;
          qcmIsChecked = true;
          if (qcmSelectedOptionIndex === questionData.correctAnswer) {
            qcmScore++;
            qcmStreak++;
          } else {
            qcmStreak = 0;
          }
          renderQCM(quizData);
        });
      } else {
        actionBtn.addEventListener('click', () => {
          qcmCurrentQuestionIndex++;
          qcmSelectedOptionIndex = null;
          qcmIsChecked = false;
          renderQCM(quizData);
        });
      }
    }

    function openQCMModal() {
      qcmCurrentQuestionIndex = 0;
      qcmScore = 0;
      qcmSelectedOptionIndex = null;
      qcmIsChecked = false;
      qcmStreak = 0;
      qcmScoreSaved = false;
      qcmScoreScreenInfo = null;

      document.getElementById('qcm-modal').classList.add('modal-open');
      renderQCMPagination();
      loadQCMExercise(0);
    }

    function closeQCMModal() {
      document.getElementById('qcm-modal').classList.remove('modal-open');
    }

    function renderQCMPagination() {
      const paginationContainer = document.getElementById('qcm-pagination');
      paginationContainer.innerHTML = '';
      const qcmExercises = interactiveData.multipleChoice || [];

      qcmExercises.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'exercise-step qcm-step';
        btn.textContent = `Quiz ${index + 1}`;
        btn.dataset.index = index;
        btn.addEventListener('click', () => {
          qcmCurrentQuestionIndex = 0;
          qcmScore = 0;
          qcmSelectedOptionIndex = null;
          qcmIsChecked = false;
          qcmStreak = 0;
          qcmScoreSaved = false;
          qcmScoreScreenInfo = null;
          loadQCMExercise(index);
        });
        paginationContainer.appendChild(btn);
      });
    }

    function loadQCMExercise(index) {
      const qcmExercises = interactiveData.multipleChoice || [];
      const exercise = qcmExercises[index];
      if (!exercise) return;

      document.querySelectorAll('.qcm-step').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.index, 10) === index);
      });

      document.getElementById('qcm-modal-title').textContent = exercise.quizTitle || 'Multiple Choice Quiz';

      const instrContainer = document.getElementById('qcm-instructions-container');
      if (exercise.instructions) {
        instrContainer.textContent = exercise.instructions;
        instrContainer.style.display = 'block';
      } else {
        instrContainer.textContent = '';
        instrContainer.style.display = 'none';
      }

      // Shuffle the answer options for each question so the correct answer isn't always first.
      exercise.questions.forEach(q => {
        const pairs = q.options.map((opt, i) => ({ opt, correct: i === q.correctAnswer }));
        const shuffled = shuffleArray(pairs);
        q.options = shuffled.map(p => p.opt);
        q.correctAnswer = shuffled.findIndex(p => p.correct);
      });

      renderQCM(exercise);
    }

    // Fill in the Blanks: mistakes accumulated across attempts for the current text.
    let fitbMistakeCount = 0;

    function getFitbStorageKeyBase(exercise) {
      return 'fitbBest::' + location.pathname + '::' + (exercise.quizTitle || 'exercise');
    }

    function getFitbBestMistakes(exercise) {
      try {
        const raw = localStorage.getItem(getFitbStorageKeyBase(exercise));
        if (raw === null) return null;
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
      } catch (e) { return null; }
    }

    function saveFitbBestMistakes(exercise, mistakes) {
      try { localStorage.setItem(getFitbStorageKeyBase(exercise), String(mistakes)); } catch (e) {}
    }

    // Same thresholds as the drag & drop badge, for consistency across games.
    function getFitbRank(mistakes) {
      if (mistakes === 0) return { emoji: '🥇', label: L.rankGold };
      if (mistakes <= 2) return { emoji: '🥈', label: L.rankSilver };
      return { emoji: '🥉', label: L.rankBronze };
    }

    function updateFitbProgress(exerciseData) {
      const fitbContent = document.getElementById('fitb-content');
      const total = exerciseData.blanks.length;
      const correctCount = fitbContent.querySelectorAll('.fitb-select.correct').length;
      const progressEl = document.getElementById('fitb-stat-progress');
      if (progressEl) progressEl.textContent = correctCount + '/' + total;
      const mistakesEl = document.getElementById('fitb-stat-mistakes');
      if (mistakesEl) mistakesEl.textContent = fitbMistakeCount;
    }

    function finishFitbExercise(exerciseData) {
      const previousBest = getFitbBestMistakes(exerciseData);
      const isNewRecord = previousBest === null || fitbMistakeCount < previousBest;
      if (isNewRecord) saveFitbBestMistakes(exerciseData, fitbMistakeCount);

      const rank = getFitbRank(fitbMistakeCount);
      const note = isNewRecord
        ? `🎉 ${L.newBestMistakes}`
        : (previousBest !== null ? L.bestMistakes(previousBest) : '');

      const resultEl = document.getElementById('fitb-stat-result');
      if (resultEl) {
        resultEl.innerHTML = `
          <span class="fitb-result-badge">${rank.emoji} ${rank.label}</span>
          ${note ? `<span class="fitb-result-note">${note}</span>` : ''}
        `;
      }
    }

    function escapeHtmlAttr(str) {
      return String(str == null ? '' : str)
        .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Wraps every occurrence of each word bank entry in the raw text with a hoverable
    // span (translation shown via the native title tooltip). Runs BEFORE the blanks are
    // turned into <select> markup, so it only ever matches plain text — never reaches
    // into generated HTML (e.g. a glossed word that also happens to be a dropdown option).
    function applyWordBankGlosses(text, wordBank) {
      if (!wordBank || !wordBank.length) return text;
      let result = text;
      wordBank.forEach(entry => {
        if (!entry || !entry.word) return;
        const escapedWord = entry.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp('\\b' + escapedWord + '\\b', 'gi');
        result = result.replace(re, match => `<span class="fitb-gloss" data-translation="${escapeHtmlAttr(entry.translation)}">${match}</span>`);
      });
      return result;
    }

    // Read-aloud (pausable): blanks are read as the word "blank", nothing is given away.
    // Bumped whenever the exercise changes or the modal closes, so a stale utterance's
    // onend/onerror from a previous exercise can detect it's superseded and stop touching
    // the (now unrelated) button/state instead of reading in the background.
    let fitbSpeechGeneration = 0;

    function updateFitbSpeakButton(state) {
      const btn = document.getElementById('fitb-speak-btn');
      if (!btn) return;
      if (state === 'speaking') { btn.textContent = L.pause; btn.classList.add('active'); }
      else if (state === 'paused') { btn.textContent = L.resume; btn.classList.add('active'); }
      else { btn.textContent = L.listen; btn.classList.remove('active'); }
    }

    // Single utterance, using the browser's native pause()/resume(). A previous word-by-word
    // rewrite avoided these on the assumption they were unreliable, but the actual bug was that
    // onerror (fired by cancel() on pause) forced the button back to idle regardless of state —
    // now that onerror is gated on state, native pause/resume can be used directly and sounds natural.
    function setupFitbSpeakButton(exerciseData) {
      const btn = document.getElementById('fitb-speak-btn');
      if (!btn) return;
      if (!('speechSynthesis' in window)) { btn.style.display = 'none'; return; }

      fitbSpeechGeneration++;
      const myGeneration = fitbSpeechGeneration;

      const spokenText = (exerciseData.text || '').replace(/\[blank\d+\]/g, 'blank');

      let state = 'idle';

      btn.addEventListener('click', () => {
        if (state === 'speaking') {
          state = 'paused';
          updateFitbSpeakButton('paused');
          window.speechSynthesis.pause();
        } else if (state === 'paused') {
          state = 'speaking';
          updateFitbSpeakButton('speaking');
          window.speechSynthesis.resume();
        } else {
          const utterance = new SpeechSynthesisUtterance(spokenText);
          utterance.lang = 'en-US';
          utterance.rate = 0.95;
          utterance.onend = () => {
            if (myGeneration !== fitbSpeechGeneration || state !== 'speaking') return;
            state = 'idle';
            updateFitbSpeakButton('idle');
          };
          utterance.onerror = () => {
            if (myGeneration !== fitbSpeechGeneration || state !== 'speaking') return;
            state = 'idle';
            updateFitbSpeakButton('idle');
          };
          state = 'speaking';
          updateFitbSpeakButton('speaking');
          window.speechSynthesis.speak(utterance);
        }
      });
    }

    function renderFillInTheBlanks(exerciseData) {
      const fitbContent = document.getElementById('fitb-content');
      if (!exerciseData || !exerciseData.text || !exerciseData.blanks) {
        fitbContent.textContent = 'Exercise data is corrupted or missing.';
        return;
      }

      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      fitbMistakeCount = 0;

      const wordBank = exerciseData.wordBank || [];
      // Formatting is resolved before the glosses and the <select> markup are
      // injected, so those never get escaped. The blanks' own options stay raw:
      // they are compared as plain text against the student's choice.
      let processedText = applyWordBankGlosses(richText(exerciseData.text), wordBank);
      exerciseData.blanks.forEach((blankData, index) => {
        let optionsHtml = '<option value="">Select...</option>';
        shuffleArray(blankData.options).forEach(opt => {
          optionsHtml += `<option value="${opt}">${opt}</option>`;
        });
        const selectHtml = `<span class="fitb-blank-wrap"><select class="fitb-select" data-index="${index}">${optionsHtml}</select></span>`;
        processedText = processedText.split(`[blank${index}]`).join(selectHtml);
      });

      fitbContent.innerHTML = `
        <div class="fitb-stats-bar" id="fitb-stats-bar">
          <div class="fitb-stat"><span class="fitb-stat-icon">✅</span>${L.correct} <span id="fitb-stat-progress">0/${exerciseData.blanks.length}</span></div>
          <div class="fitb-stat"><span class="fitb-stat-icon">❌</span>${L.errors} <span id="fitb-stat-mistakes">0</span></div>
          <div class="fitb-stat-result" id="fitb-stat-result"></div>
        </div>
        <div class="fitb-tools-row">
          ${wordBank.length ? `<p class="fitb-gloss-hint">${L.glossHint}</p>` : '<span></span>'}
          <button type="button" class="fitb-speak-btn" id="fitb-speak-btn">${L.listen}</button>
        </div>
        <div class="fitb-text">${processedText}</div>
        <button id="fitb-action-btn" class="fitb-action-button">${L.checkAnswers}</button>`;

      setupFitbSpeakButton(exerciseData);

      const actionBtn = document.getElementById('fitb-action-btn');

      actionBtn.addEventListener('click', () => {
        const selects = fitbContent.querySelectorAll('.fitb-select');

        if (actionBtn.textContent === L.checkAnswers) {
          selects.forEach(select => {
            if (select.disabled) return; // already locked in correct from an earlier attempt

            const correctAnswer = exerciseData.blanks[select.dataset.index].correctAnswer;
            if (select.value.trim().toLowerCase() === String(correctAnswer).trim().toLowerCase()) {
              select.classList.remove('wrong');
              select.classList.add('correct');
              select.disabled = true;

              // Bounce the blank and flash a checkmark that fades away, same as drag & drop.
              const wrap = select.closest('.fitb-blank-wrap');
              if (wrap) {
                wrap.classList.add('just-correct');
                const tick = document.createElement('span');
                tick.className = 'fitb-blank-tick';
                tick.textContent = '✓';
                wrap.appendChild(tick);
                setTimeout(() => {
                  wrap.classList.remove('just-correct');
                  tick.remove();
                }, 700);
              }
            } else {
              select.classList.remove('correct');
              select.classList.add('wrong');
              select.disabled = true;
              fitbMistakeCount++;
            }
          });

          updateFitbProgress(exerciseData);

          const allCorrect = Array.from(selects).every(s => s.classList.contains('correct'));
          actionBtn.textContent = allCorrect ? L.wellDone : L.tryAgain;
          if (allCorrect) {
            actionBtn.disabled = true;
            finishFitbExercise(exerciseData);
          }

        } else if (actionBtn.textContent === L.tryAgain) {
          selects.forEach(select => {
            if (select.classList.contains('wrong')) {
              select.value = '';
              select.classList.remove('wrong');
              select.disabled = false;
            }
          });
          actionBtn.textContent = L.checkAnswers;
        }
      });
    }

    function openFitbModal() {
      document.getElementById('fitb-modal').classList.add('modal-open');
      renderFitbPagination();
      loadFitbExercise(0);
    }

    function closeFitbModal() {
      document.getElementById('fitb-modal').classList.remove('modal-open');
      fitbSpeechGeneration++;
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }

    function renderFitbPagination() {
      const paginationContainer = document.getElementById('fitb-pagination');
      paginationContainer.innerHTML = '';
      const fitbExercises = interactiveData.fillBlanks || [];

      fitbExercises.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'exercise-step fitb-step';
        btn.textContent = `Text ${index + 1}`;
        btn.dataset.index = index;
        btn.addEventListener('click', () => loadFitbExercise(index));
        paginationContainer.appendChild(btn);
      });
    }

    function loadFitbExercise(index) {
      const fitbExercises = interactiveData.fillBlanks || [];
      const exercise = fitbExercises[index];
      if (!exercise) return;

      document.querySelectorAll('.fitb-step').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.index, 10) === index);
      });

      document.getElementById('fitb-modal-title').textContent = exercise.quizTitle || 'Fill in the Blanks';

      const instrContainer = document.getElementById('fitb-instructions-container');
      if (exercise.instructions) {
        instrContainer.textContent = exercise.instructions;
        instrContainer.style.display = 'block';
      } else {
        instrContainer.textContent = '';
        instrContainer.style.display = 'none';
      }

      const imgContainer = document.getElementById('fitb-quiz-image-container');
      if (exercise.image) {
        imgContainer.innerHTML = `<img src="${exercise.image}" alt="Exercise Image" />`;
        imgContainer.style.display = 'block';
      } else {
        imgContainer.innerHTML = '';
        imgContainer.style.display = 'none';
      }

      renderFillInTheBlanks(exercise);
    }

    // Shared preference (drag & drop + memory): hide the live ticking stopwatch during
    // play so slower/anxious readers aren't rushed. Time is still tracked in the background
    // either way, so records keep working — only the ticking number is hidden mid-game,
    // and the final time/record is always shown once the exercise is solved.
    let showLiveTimer = localStorage.getItem('showLiveTimer') === 'true';

    function toggleLiveTimer() {
      showLiveTimer = !showLiveTimer;
      try { localStorage.setItem('showLiveTimer', String(showLiveTimer)); } catch (e) {}
      applyLiveTimerVisibility();
    }

    function applyLiveTimerVisibility() {
      document.querySelectorAll('.live-timer-display').forEach(el => {
        el.style.display = showLiveTimer ? 'inline-flex' : 'none';
      });
      document.querySelectorAll('.timer-toggle-btn').forEach(btn => {
        btn.textContent = showLiveTimer ? L.hideTimer : L.showTimer;
        btn.classList.toggle('active', showLiveTimer);
      });
    }

    // Drag and Drop Challenge JavaScript logic
    let currentDndExerciseIndex = 0;

    // Stopwatch (counts up, no pressure) + live mistake count for the current attempt.
    let dndTimerIntervalId = null;
    let dndStartTime = 0;
    let dndMistakeCount = 0;

    function shuffleArray(array) {
      const cloned = array.slice();
      for (let i = cloned.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
      }
      return cloned;
    }

    function formatDndTime(totalSeconds) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return minutes + ':' + String(seconds).padStart(2, '0');
    }

    function updateDndTimerDisplay() {
      const totalSeconds = Math.floor((Date.now() - dndStartTime) / 1000);
      const timerEl = document.getElementById('dnd-stat-timer');
      if (timerEl) timerEl.textContent = formatDndTime(totalSeconds);
      return totalSeconds;
    }

    // Bronze/Silver/Gold based on mistakes made, same spirit as the QCM ranks —
    // no time threshold, since exercises have very different numbers of zones.
    function getDndRank(mistakes) {
      if (mistakes === 0) return { emoji: '🥇', label: L.rankGold };
      if (mistakes <= 2) return { emoji: '🥈', label: L.rankSilver };
      return { emoji: '🥉', label: L.rankBronze };
    }

    function getDndStorageKeyBase(exercise) {
      return 'dndBest::' + location.pathname + '::' + (exercise.quizTitle || 'exercise');
    }

    function getDndBestStat(exercise, stat) {
      try {
        const raw = localStorage.getItem(getDndStorageKeyBase(exercise) + '::' + stat);
        if (raw === null) return null;
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
      } catch (e) { return null; }
    }

    function saveDndBestStat(exercise, stat, value) {
      try { localStorage.setItem(getDndStorageKeyBase(exercise) + '::' + stat, String(value)); } catch (e) {}
    }

    function openDndModal() {
      currentDndExerciseIndex = 0;
      document.getElementById('dnd-modal').classList.add('modal-open');
      renderDndPagination();
      loadDndExercise(0);
    }

    function closeDndModal() {
      document.getElementById('dnd-modal').classList.remove('modal-open');
    }

    function renderDndPagination() {
      const paginationContainer = document.getElementById('dnd-pagination');
      paginationContainer.innerHTML = '';
      const dndExercises = interactiveData.dragAndDrop || [];
      
      dndExercises.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'exercise-step dnd-step';
        btn.textContent = `Game ${index + 1}`;
        btn.dataset.index = index;
        btn.addEventListener('click', () => {
          loadDndExercise(index);
        });
        paginationContainer.appendChild(btn);
      });
    }

    function loadDndExercise(index) {
      currentDndExerciseIndex = index;
      const dndExercises = interactiveData.dragAndDrop || [];
      const exercise = dndExercises[index];
      if (!exercise) return;

      // Update active navigation button
      const dndButtons = document.querySelectorAll('.dnd-step');
      dndButtons.forEach(btn => {
        const btnIndex = parseInt(btn.dataset.index, 10);
        btn.classList.toggle('active', btnIndex === index);
      });

      // Update title
      document.getElementById('dnd-modal-title').textContent = exercise.quizTitle || 'Drag and Drop Challenge';

      // Show/hide instructions
      const dndInstr = document.getElementById('dnd-instructions');
      if (exercise.instructions) {
        dndInstr.textContent = exercise.instructions;
        dndInstr.style.display = 'block';
      } else {
        dndInstr.textContent = '';
        dndInstr.style.display = 'none';
      }

      // Reset the stopwatch + mistake counter for this attempt
      if (dndTimerIntervalId) clearInterval(dndTimerIntervalId);
      dndMistakeCount = 0;
      dndStartTime = Date.now();
      let dndStatsBar = document.getElementById('dnd-stats-bar');
      if (dndStatsBar) dndStatsBar.remove();
      dndStatsBar = document.createElement('div');
      dndStatsBar.className = 'dnd-stats-bar';
      dndStatsBar.id = 'dnd-stats-bar';
      dndStatsBar.innerHTML = `
        <div class="dnd-stat">
          <button type="button" class="timer-toggle-btn" id="dnd-timer-toggle">${L.showTimer}</button>
          <span class="live-timer-display"><span class="dnd-stat-icon">⏱️</span><span id="dnd-stat-timer" class="live-timer-value">0:00</span></span>
        </div>
        <div class="dnd-stat stat-badge"><span class="dnd-stat-icon">❌</span>${L.errors} <span id="dnd-stat-mistakes">0</span></div>
        <div class="dnd-stat-result" id="dnd-stat-result"></div>
      `;
      dndInstr.after(dndStatsBar);
      document.getElementById('dnd-timer-toggle').addEventListener('click', toggleLiveTimer);
      applyLiveTimerVisibility();
      dndTimerIntervalId = setInterval(updateDndTimerDisplay, 1000);

      // Load background image
      const bgImg = document.getElementById('dnd-bg-image');
      const dndBoardContainer = document.querySelector('.dnd-board-container');
      function fitDndImage() {
        if (dndBoardContainer && dndBoardContainer.clientHeight > 0) {
          bgImg.style.maxHeight = dndBoardContainer.clientHeight + 'px';
        }
      }
      bgImg.onload = fitDndImage;
      bgImg.src = exercise.backgroundImage;
      if (bgImg.complete) fitDndImage();

      // Reset reservoir
      const reservoir = document.getElementById('dnd-reservoir');
      reservoir.innerHTML = '';
      
      // Shuffle reservoir items
      const items = shuffleArray(exercise.reservoirItems || []);
      items.forEach(text => {
        const itemEl = document.createElement('div');
        itemEl.className = 'dnd-item';
        itemEl.textContent = text;
        itemEl.draggable = true;
        
        // HTML5 dragstart
        itemEl.addEventListener('dragstart', event => {
          event.dataTransfer.setData('text/plain', text);
          itemEl.classList.add('dragging');
        });
        itemEl.addEventListener('dragend', () => {
          itemEl.classList.remove('dragging');
        });

        reservoir.appendChild(itemEl);
      });

      // Reset drop zones on the board
      const board = document.getElementById('dnd-board');
      // Remove existing drop zones (keep only the bg image)
      const existingZones = board.querySelectorAll('.dnd-zone');
      existingZones.forEach(z => z.remove());

      // Create and position new drop zones
      exercise.dropZones.forEach((zone, zoneIdx) => {
        const zoneEl = document.createElement('div');
        zoneEl.className = 'dnd-zone';
        zoneEl.style.left = `${zone.x_pourcent}%`;
        zoneEl.style.top = `${zone.y_pourcent}%`;
        zoneEl.dataset.accepted = zone.acceptedText;
        zoneEl.dataset.index = zoneIdx;
        zoneEl.innerHTML = ``;

        // HTML5 dragover & dragenter
        zoneEl.addEventListener('dragover', event => {
          event.preventDefault(); // crucial to allow drop
          if (!zoneEl.classList.contains('correct')) {
            zoneEl.classList.add('hovered');
          }
        });

        zoneEl.addEventListener('dragenter', event => {
          event.preventDefault();
        });

        zoneEl.addEventListener('dragleave', () => {
          zoneEl.classList.remove('hovered');
        });

        zoneEl.addEventListener('drop', event => {
          event.preventDefault();
          zoneEl.classList.remove('hovered');
          
          if (zoneEl.classList.contains('correct')) return;

          const droppedText = event.dataTransfer.getData('text/plain');
          
          if (droppedText === zone.acceptedText) {
            // Correct match! Bounce the zone and flash a checkmark that fades away.
            zoneEl.classList.add('correct', 'just-placed');
            zoneEl.innerHTML = `<span class='dnd-zone-text'>${droppedText}</span><span class='dnd-zone-tick'>✓</span>`;
            setTimeout(() => {
              zoneEl.classList.remove('just-placed');
              const tick = zoneEl.querySelector('.dnd-zone-tick');
              if (tick) tick.remove();
            }, 700);

            // If hideOnSuccess is true, remove from reservoir
            if (exercise.hideOnSuccess) {
              const itemsInReservoir = reservoir.querySelectorAll('.dnd-item');
              for (let item of itemsInReservoir) {
                if (item.textContent === droppedText) {
                  item.remove();
                  break;
                }
              }
            }

            // Check if exercise is completed
            checkDndCompletion(exercise);
          } else {
            // Incorrect match!
            zoneEl.classList.add('incorrect');
            setTimeout(() => {
              zoneEl.classList.remove('incorrect');
            }, 1000);

            // Red ephemeral feedback on the dragged item
            const items = reservoir.querySelectorAll('.dnd-item');
            items.forEach(item => {
              if (item.textContent === droppedText) {
                item.classList.add('shake-error');
                setTimeout(() => item.classList.remove('shake-error'), 1000);
              }
            });

            dndMistakeCount++;
            const mistakesEl = document.getElementById('dnd-stat-mistakes');
            if (mistakesEl) mistakesEl.textContent = dndMistakeCount;
          }
        });

        board.appendChild(zoneEl);
      });
    }

    function checkDndCompletion(exercise) {
      const zones = document.querySelectorAll('.dnd-zone');
      const allCorrect = Array.from(zones).every(z => z.classList.contains('correct'));

      if (allCorrect) {
        if (dndTimerIntervalId) { clearInterval(dndTimerIntervalId); dndTimerIntervalId = null; }
        const finalSeconds = updateDndTimerDisplay();

        const previousBestMistakes = getDndBestStat(exercise, 'mistakes');
        const isNewMistakesRecord = previousBestMistakes === null || dndMistakeCount < previousBestMistakes;
        if (isNewMistakesRecord) saveDndBestStat(exercise, 'mistakes', dndMistakeCount);

        const previousBestTime = getDndBestStat(exercise, 'time');
        const isNewTimeRecord = previousBestTime === null || finalSeconds < previousBestTime;
        if (isNewTimeRecord) saveDndBestStat(exercise, 'time', finalSeconds);

        const rank = getDndRank(dndMistakeCount);
        const mistakesNote = isNewMistakesRecord
          ? `🎉 ${L.newBestMistakes}`
          : (previousBestMistakes !== null ? L.bestMistakes(previousBestMistakes) : '');
        const timeNote = isNewTimeRecord
          ? `🎉 ${L.newBestTime}`
          : (previousBestTime !== null ? L.bestTimePrefix + formatDndTime(previousBestTime) : '');

        const resultEl = document.getElementById('dnd-stat-result');
        if (resultEl) {
          resultEl.innerHTML = `
            <span class="dnd-result-badge">${rank.emoji} ${rank.label}</span>
            ${mistakesNote ? `<span class="dnd-result-note">${mistakesNote}</span>` : ''}
            ${timeNote ? `<span class="dnd-result-note">${timeNote}</span>` : ''}
          `;
        }

        // Trigger confettis!
        triggerDndConfetti();
      }
    }

    function triggerDndConfetti() {
      const canvas = document.createElement('canvas');
      canvas.style.position = 'fixed';
      canvas.style.inset = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.display = 'block';
      canvas.style.margin = '0';
      canvas.style.padding = '0';
      canvas.style.overflow = 'hidden';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '9999';
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const colors = ['#62B5AA', '#78629E', '#E7C360', '#0ca37f', '#1db3d4', '#7e4dd9'];
      const particles = Array.from({ length: 100 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0
      }));

      let animationFrameId;
      const startTime = Date.now();

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
          p.tiltAngle += p.tiltAngleIncremental;
          p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
          p.x += Math.sin(p.tiltAngle);
          p.tilt = Math.sin(p.tiltAngle - (p.r / 2)) * 15;

          ctx.beginPath();
          ctx.lineWidth = p.r;
          ctx.strokeStyle = p.color;
          ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
          ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
          ctx.stroke();
        });

        if (Date.now() - startTime < 3000) {
          animationFrameId = requestAnimationFrame(draw);
        } else {
          canvas.remove();
        }
      }

      draw();
    }

    // Memory Game (Match the Pairs) JavaScript logic
    let currentMemoryExerciseIndex = 0;
    let memorySelectedCard1 = null;
    let memorySelectedCard2 = null;
    let canSelectMemoryCard = true;
    let matchedPairsCount = 0;
    let totalPairsCount = 0;

    // Stopwatch and move counter for the current attempt.
    let memoryTimerIntervalId = null;
    let memoryStartTime = 0;
    let memoryMoveCount = 0;

    function formatMemoryTime(totalSeconds) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return minutes + ':' + String(seconds).padStart(2, '0');
    }

    function updateMemoryTimerDisplay() {
      const totalSeconds = Math.floor((Date.now() - memoryStartTime) / 1000);
      const timerEl = document.getElementById('memory-stat-timer');
      if (timerEl) timerEl.textContent = formatMemoryTime(totalSeconds);
      return totalSeconds;
    }

    function updateMemoryMovesDisplay() {
      const movesEl = document.getElementById('memory-stat-moves');
      if (movesEl) movesEl.textContent = memoryMoveCount;
    }

    // 💎 Perfect = flawless run (as many moves as pairs). Otherwise Gold/Silver/Bronze
    // scale relative to the number of pairs, since the minimum possible moves differs per exercise.
    function getMemoryRank(moves, totalPairs) {
      if (moves === totalPairs) return { emoji: '💎', label: L.rankPerfect };
      if (moves <= totalPairs * 2) return { emoji: '🥇', label: L.rankGold };
      if (moves <= totalPairs * 3) return { emoji: '🥈', label: L.rankSilver };
      return { emoji: '🥉', label: L.rankBronze };
    }

    function getMemoryStorageKeyBase(exercise) {
      return 'memoryBest::' + location.pathname + '::' + (exercise.quizTitle || 'exercise');
    }

    function getMemoryBestStat(exercise, stat) {
      try {
        const raw = localStorage.getItem(getMemoryStorageKeyBase(exercise) + '::' + stat);
        if (raw === null) return null;
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
      } catch (e) { return null; }
    }

    function saveMemoryBestStat(exercise, stat, value) {
      try { localStorage.setItem(getMemoryStorageKeyBase(exercise) + '::' + stat, String(value)); } catch (e) {}
    }

    function openMemoryModal() {
      currentMemoryExerciseIndex = 0;
      document.getElementById('memory-modal').classList.add('modal-open');
      renderMemoryPagination();
      loadMemoryExercise(0);
    }

    function closeMemoryModal() {
      document.getElementById('memory-modal').classList.remove('modal-open');
      // Reset any active timers or selections
      if (memoryTimerIntervalId) { clearInterval(memoryTimerIntervalId); memoryTimerIntervalId = null; }
      memorySelectedCard1 = null;
      memorySelectedCard2 = null;
      canSelectMemoryCard = true;
    }

    function renderMemoryPagination() {
      const paginationContainer = document.getElementById('memory-pagination');
      paginationContainer.innerHTML = '';
      const memoryExercises = interactiveData.matchPairs || [];
      
      memoryExercises.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'exercise-step memory-step';
        btn.textContent = `Game ${index + 1}`;
        btn.dataset.index = index;
        btn.addEventListener('click', () => {
          loadMemoryExercise(index);
        });
        paginationContainer.appendChild(btn);
      });
    }

    function loadMemoryExercise(index) {
      currentMemoryExerciseIndex = index;
      const memoryExercises = interactiveData.matchPairs || [];
      const exercise = memoryExercises[index];
      if (!exercise) return;

      // Update active navigation button
      const memoryButtons = document.querySelectorAll('.memory-step');
      memoryButtons.forEach(btn => {
        const btnIndex = parseInt(btn.dataset.index, 10);
        btn.classList.toggle('active', btnIndex === index);
      });

      // Update title
      document.getElementById('memory-modal-title').textContent = exercise.quizTitle || 'Match the Pairs';

      // Show/hide instructions
      const memInstr = document.getElementById('memory-instructions');
      if (exercise.instructions) {
        memInstr.textContent = exercise.instructions;
        memInstr.style.display = 'block';
      } else {
        memInstr.textContent = '';
        memInstr.style.display = 'none';
      }

      // Reset state
      memorySelectedCard1 = null;
      memorySelectedCard2 = null;
      canSelectMemoryCard = true;
      matchedPairsCount = 0;
      totalPairsCount = exercise.pairs.length;

      // Reset the stopwatch and move counter for this attempt
      if (memoryTimerIntervalId) clearInterval(memoryTimerIntervalId);
      memoryMoveCount = 0;
      memoryStartTime = Date.now();
      let memoryStatsBar = document.getElementById('memory-stats-bar');
      if (memoryStatsBar) memoryStatsBar.remove();
      memoryStatsBar = document.createElement('div');
      memoryStatsBar.className = 'memory-stats-bar';
      memoryStatsBar.id = 'memory-stats-bar';
      memoryStatsBar.innerHTML = `
        <div class="memory-stat">
          <button type="button" class="timer-toggle-btn" id="memory-timer-toggle">${L.showTimer}</button>
          <span class="live-timer-display"><span class="memory-stat-icon">⏱️</span><span id="memory-stat-timer" class="live-timer-value">0:00</span></span>
        </div>
        <div class="memory-stat stat-badge"><span class="memory-stat-icon">🔄</span>${L.moves} <span id="memory-stat-moves">0</span></div>
        <div class="dnd-stat-result" id="memory-stat-result"></div>
      `;
      memInstr.after(memoryStatsBar);
      document.getElementById('memory-timer-toggle').addEventListener('click', toggleLiveTimer);
      applyLiveTimerVisibility();
      memoryTimerIntervalId = setInterval(updateMemoryTimerDisplay, 1000);

      // Split and shuffle Side A and Side B
      const listA = exercise.pairs.map(p => ({ id: p.id, type: p.sideA.type, content: p.sideA.content, side: 'A' }));
      const listB = exercise.pairs.map(p => ({ id: p.id, type: p.sideB.type, content: p.sideB.content, side: 'B' }));
      const combinedCards = shuffleArray([...listA, ...listB]);

      const grid = document.getElementById('memory-grid');
      grid.innerHTML = '';

      // Prefer an exact rectangle (no empty cells) within max 8 cols / 3 rows.
      // Only fall back to an approximate (pyramid-style, flex-wrap-centered) layout if no exact rectangle fits.
      const n = exercise.pairs.length * 2;
      const maxCols = 8;
      const maxRows = 3;
      let bestCols = null;
      let bestRatio = Infinity;
      for (let cols = 1; cols <= maxCols; cols++) {
        if (n % cols !== 0) continue;
        const rows = n / cols;
        if (rows > maxRows) continue;
        const ratio = Math.max(cols, rows) / Math.min(cols, rows);
        if (ratio < bestRatio || (ratio === bestRatio && cols > bestCols)) {
          bestRatio = ratio;
          bestCols = cols;
        }
      }
      if (bestCols === null) {
        // No exact rectangle fits: approximate as square as possible, capped at 3 rows / 8 cols
        const minCols = Math.ceil(n / maxRows);
        bestCols = Math.min(maxCols, Math.max(minCols, Math.ceil(Math.sqrt(n))));
      }
      const cardGap = window.innerWidth <= 640 ? 10 : 16;
      grid.style.maxWidth = `${bestCols * 135 + (bestCols - 1) * cardGap}px`;

      combinedCards.forEach(cardData => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.pairId = cardData.id;
        card.dataset.side = cardData.side;

        let contentHtml = '';
        if (cardData.type === 'image') {
          contentHtml = `<img src="${cardData.content}" alt="Card Image" />`;
        } else {
          contentHtml = `<span>${cardData.content}</span>`;
        }

        card.innerHTML = `
          <div class="memory-card-inner">
            <div class="memory-card-front card-side-${cardData.side}">
              <div class="memory-card-backpattern">?</div>
            </div>
            <div class="memory-card-back${cardData.type === 'image' ? ' card-has-image' : ''}">
              ${contentHtml}
            </div>
          </div>
        `;

        card.addEventListener('click', () => {
          handleMemoryCardClick(card);
        });

        grid.appendChild(card);
      });
    }

    function handleMemoryCardClick(card) {
      if (!canSelectMemoryCard) return;
      if (card.classList.contains('flipped') || card.classList.contains('correct')) return;

      // Flip card
      card.classList.add('flipped');

      if (!memorySelectedCard1) {
        memorySelectedCard1 = card;
      } else {
        // Rule: Must be of different sides (A and B)
        if (memorySelectedCard1.dataset.side === card.dataset.side) {
          // Ignore click on same side card, flip it back down instantly
          card.classList.remove('flipped');
          return;
        }

        memorySelectedCard2 = card;
        canSelectMemoryCard = false;

        memoryMoveCount++;
        updateMemoryMovesDisplay();

        // Check Match
        if (memorySelectedCard1.dataset.pairId === memorySelectedCard2.dataset.pairId) {
          // Match success! Bounce both cards and flash a checkmark that fades away.
          const card1 = memorySelectedCard1, card2 = memorySelectedCard2;
          card1.classList.add('correct', 'just-matched');
          card2.classList.add('correct', 'just-matched');
          [card1, card2].forEach(c => {
            const back = c.querySelector('.memory-card-back');
            if (!back) return;
            const tick = document.createElement('span');
            tick.className = 'memory-card-tick';
            tick.textContent = '✓';
            back.appendChild(tick);
            setTimeout(() => tick.remove(), 700);
          });
          setTimeout(() => {
            card1.classList.remove('just-matched');
            card2.classList.remove('just-matched');
          }, 700);

          matchedPairsCount++;

          // Reset selection
          memorySelectedCard1 = null;
          memorySelectedCard2 = null;
          canSelectMemoryCard = true;

          // Check Win Condition
          if (matchedPairsCount === totalPairsCount) {
            if (memoryTimerIntervalId) { clearInterval(memoryTimerIntervalId); memoryTimerIntervalId = null; }
            const finalSeconds = updateMemoryTimerDisplay();
            const exercise = (interactiveData.matchPairs || [])[currentMemoryExerciseIndex];
            const rank = getMemoryRank(memoryMoveCount, totalPairsCount);

            const previousBestMoves = getMemoryBestStat(exercise, 'moves');
            const isNewMovesRecord = previousBestMoves === null || memoryMoveCount < previousBestMoves;
            if (isNewMovesRecord) saveMemoryBestStat(exercise, 'moves', memoryMoveCount);

            const previousBestTime = getMemoryBestStat(exercise, 'time');
            const isNewTimeRecord = previousBestTime === null || finalSeconds < previousBestTime;
            if (isNewTimeRecord) saveMemoryBestStat(exercise, 'time', finalSeconds);

            const movesNote = isNewMovesRecord
              ? `🎉 ${L.newBestMoves}`
              : (previousBestMoves !== null ? L.bestMoves(previousBestMoves) : '');
            const timeNote = isNewTimeRecord
              ? `🎉 ${L.newBestTime}`
              : (previousBestTime !== null ? L.bestTimePrefix + formatMemoryTime(previousBestTime) : '');

            const resultEl = document.getElementById('memory-stat-result');
            if (resultEl) {
              resultEl.innerHTML = `
                <span class="dnd-result-badge">${rank.emoji} ${rank.label}</span>
                ${movesNote ? `<span class="dnd-result-note">${movesNote}</span>` : ''}
                ${timeNote ? `<span class="dnd-result-note">${timeNote}</span>` : ''}
              `;
            }
            triggerDndConfetti();
          }
        } else {
          // Match failure!
          memorySelectedCard1.classList.add('incorrect');
          memorySelectedCard2.classList.add('incorrect');

          setTimeout(() => {
            memorySelectedCard1.classList.remove('flipped', 'incorrect');
            memorySelectedCard2.classList.remove('flipped', 'incorrect');
            memorySelectedCard1 = null;
            memorySelectedCard2 = null;
            canSelectMemoryCard = true;
          }, 1500);
        }
      }
    }

    // Sorting Challenge JavaScript logic
    let currentSortingExerciseIndex = 0;
    let sortingDeckItems = [];
    let sortingSelections = {};
    let sortingIsChecked = false;
    let sortingMistakeCount = 0;

    // Same thresholds as the other games, based on mistakes accumulated across checks.
    function getSortingRank(mistakes) {
      if (mistakes === 0) return { emoji: '🥇', label: L.rankGold };
      if (mistakes <= 2) return { emoji: '🥈', label: L.rankSilver };
      return { emoji: '🥉', label: L.rankBronze };
    }

    function getSortingStorageKeyBase(exercise) {
      return 'sortingBest::' + location.pathname + '::' + (exercise.quizTitle || 'exercise');
    }

    function getSortingBestMistakes(exercise) {
      try {
        const raw = localStorage.getItem(getSortingStorageKeyBase(exercise));
        if (raw === null) return null;
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
      } catch (e) { return null; }
    }

    function saveSortingBestMistakes(exercise, mistakes) {
      try { localStorage.setItem(getSortingStorageKeyBase(exercise), String(mistakes)); } catch (e) {}
    }

    function updateSortingMistakesDisplay() {
      const el = document.getElementById('sorting-stat-mistakes');
      if (el) el.textContent = sortingMistakeCount;
    }

    function openSortingModal() {
      currentSortingExerciseIndex = 0;
      document.getElementById('sorting-modal').classList.add('modal-open');
      renderSortingPagination();
      loadSortingExercise(0);
    }

    function closeSortingModal() {
      document.getElementById('sorting-modal').classList.remove('modal-open');
      sortingDeckItems = [];
      sortingSelections = {};
      sortingIsChecked = false;
    }

    function renderSortingPagination() {
      const paginationContainer = document.getElementById('sorting-pagination');
      paginationContainer.innerHTML = '';
      const sortingExercises = interactiveData.sorting || [];
      
      sortingExercises.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'exercise-step sorting-step';
        btn.textContent = `Game ${index + 1}`;
        btn.dataset.index = index;
        btn.addEventListener('click', () => {
          loadSortingExercise(index);
        });
        paginationContainer.appendChild(btn);
      });
    }

    function loadSortingExercise(index) {
      currentSortingExerciseIndex = index;
      const sortingExercises = interactiveData.sorting || [];
      const exercise = sortingExercises[index];
      if (!exercise) return;

      // Update active navigation button
      const sortingButtons = document.querySelectorAll('.sorting-step');
      sortingButtons.forEach(btn => {
        const btnIndex = parseInt(btn.dataset.index, 10);
        btn.classList.toggle('active', btnIndex === index);
      });

      // Update title
      document.getElementById('sorting-modal-title').textContent = exercise.quizTitle || 'Sorting Challenge';
      document.getElementById('sorting-choice-buttons').style.display = '';

      // Show/hide instructions (element created on first use, then reused)
      const sortingModalBody = document.querySelector('.sorting-modal-body');
      let sortingInstr = document.getElementById('sorting-instructions');
      if (!sortingInstr) {
        sortingInstr = document.createElement('div');
        sortingInstr.id = 'sorting-instructions';
        sortingInstr.className = 'sorting-instructions-text';
        sortingModalBody.insertBefore(sortingInstr, sortingModalBody.firstChild);
      }
      if (exercise.instructions) {
        sortingInstr.textContent = exercise.instructions;
        sortingInstr.style.display = 'block';
      } else {
        sortingInstr.textContent = '';
        sortingInstr.style.display = 'none';
      }

      // Reset the mistake counter for this attempt
      sortingMistakeCount = 0;
      let sortingStatsBar = document.getElementById('sorting-stats-bar');
      if (sortingStatsBar) sortingStatsBar.remove();
      sortingStatsBar = document.createElement('div');
      sortingStatsBar.className = 'sorting-stats-bar';
      sortingStatsBar.id = 'sorting-stats-bar';
      sortingStatsBar.innerHTML = `
        <div class="sorting-stat"><span class="sorting-stat-icon">❌</span>${L.errors} <span id="sorting-stat-mistakes">0</span></div>
        <div class="dnd-stat-result" id="sorting-stat-result"></div>
      `;
      sortingInstr.after(sortingStatsBar);

      // Reset state
      sortingIsChecked = false;
      document.querySelector('.sorting-modal-body').classList.remove('all-placed');
      const checkBtn = document.getElementById('btn-check-sorting');
      checkBtn.textContent = L.checkCategories;
      checkBtn.disabled = true;
      checkBtn.style.display = 'block';

      // Clear and build categories/bins
      const binsContainer = document.getElementById('sorting-bins-container');
      binsContainer.innerHTML = '';
      sortingSelections = {};

      exercise.categories.forEach(cat => {
        sortingSelections[cat] = [];
        const bin = document.createElement('div');
        bin.className = 'sorting-bin';
        bin.dataset.category = cat;
        bin.innerHTML = `
          <div class="sorting-bin-header">${cat}</div>
          <div class="sorting-bin-content"></div>
        `;

        bin.addEventListener('dragover', event => {
          if (event.dataTransfer.types.includes('sorting-item-id')) {
            event.preventDefault();
            bin.classList.add('drop-hover');
          }
        });
        bin.addEventListener('dragleave', event => {
          if (!bin.contains(event.relatedTarget)) {
            bin.classList.remove('drop-hover');
          }
        });
        bin.addEventListener('drop', event => {
          event.preventDefault();
          bin.classList.remove('drop-hover');
          const sourceCategory = event.dataTransfer.getData('source-bin-category');
          const itemId = event.dataTransfer.getData('sorting-item-id');
          if (!sourceCategory || !itemId || sourceCategory === cat) return;
          const itemIndex = sortingSelections[sourceCategory].findIndex(i => String(i.id) === itemId);
          if (itemIndex === -1) return;
          const [movedItem] = sortingSelections[sourceCategory].splice(itemIndex, 1);
          sortingSelections[cat].push(movedItem);
          renderSortingBinContent(sourceCategory);
          renderSortingBinContent(cat);
          if (sortingIsChecked) {
            sortingIsChecked = false;
            document.getElementById('btn-check-sorting').textContent = L.checkCategories;
          }
        });

        binsContainer.appendChild(bin);
      });

      // Populate and shuffle Deck
      sortingDeckItems = shuffleArray(exercise.items.map(item => ({ ...item })));
      renderSortingDeck();
      renderSortingChoiceButtons(exercise.categories);
    }

    function renderSortingDeck() {
      const deck = document.getElementById('sorting-deck');
      const sortingModalBody = document.querySelector('.sorting-modal-body');
      deck.innerHTML = '';

      if (sortingDeckItems.length === 0) {
        sortingModalBody.classList.add('all-placed');
        updateSortingActionButton(false); // Enable check button
        return;
      }

      sortingModalBody.classList.remove('all-placed');
      const activeItem = sortingDeckItems[0];
      const card = document.createElement('div');
      card.className = 'sorting-card';
      
      if (activeItem.type === 'image') {
        card.innerHTML = `<img src="${activeItem.content}" alt="Sorting Image" />`;
      } else {
        card.innerHTML = `<span>${activeItem.content}</span>`;
      }
      deck.appendChild(card);
    }

    function renderSortingChoiceButtons(categories) {
      const btnContainer = document.getElementById('sorting-choice-buttons');
      btnContainer.innerHTML = '';

      if (sortingDeckItems.length === 0) return;

      categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sorting-choice-btn';
        btn.textContent = cat;
        btn.addEventListener('click', () => {
          handleSortItem(cat);
        });
        btnContainer.appendChild(btn);
      });
    }

    function handleSortItem(category) {
      if (sortingDeckItems.length === 0) return;

      // Get first card
      const item = sortingDeckItems.shift();
      sortingSelections[category].push(item);

      // Render updated bin and deck
      renderSortingBinContent(category);
      renderSortingDeck();
      
      // Update choice buttons
      const sortingExercises = interactiveData.sorting || [];
      const exercise = sortingExercises[currentSortingExerciseIndex];
      renderSortingChoiceButtons(exercise.categories);
    }

    function renderSortingBinContent(category) {
      const binContent = document.querySelector(`.sorting-bin[data-category="${category}"] .sorting-bin-content`);
      binContent.innerHTML = '';
      const currentExercise = (interactiveData.sorting || [])[currentSortingExerciseIndex];
      const isImageType = currentExercise?.items?.some(i => i.type === 'image') ?? false;
      binContent.classList.toggle('image-cards', isImageType);

      sortingSelections[category].forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'sorting-bin-item' + (item.locked ? ' correct' : '');
        itemEl.dataset.id = item.id;
        itemEl.dataset.category = item.category;

        if (item.type === 'image') {
          itemEl.innerHTML = `<img src="${item.content}" alt="Sorted Image" />`;
        } else {
          itemEl.innerHTML = `<span>${item.content}</span>`;
        }

        if (item.locked) {
          itemEl.draggable = false;
        } else {
          itemEl.draggable = true;
          itemEl.addEventListener('dragstart', event => {
            event.dataTransfer.setData('sorting-item-id', String(item.id));
            event.dataTransfer.setData('source-bin-category', category);
            itemEl.classList.add('dragging');
          });
          itemEl.addEventListener('dragend', () => {
            itemEl.classList.remove('dragging');
          });
        }
        binContent.appendChild(itemEl);
      });
    }

    function updateSortingActionButton(disabled) {
      const checkBtn = document.getElementById('btn-check-sorting');
      checkBtn.disabled = disabled;
    }

    function handleSortingActionClick() {
      const checkBtn = document.getElementById('btn-check-sorting');
      const sortingExercises = interactiveData.sorting || [];
      const exercise = sortingExercises[currentSortingExerciseIndex];

      if (checkBtn.textContent === L.checkCategories) {
        let hasErrors = false;

        // Verify each column
        exercise.categories.forEach(cat => {
          const binItems = document.querySelectorAll(`.sorting-bin[data-category="${cat}"] .sorting-bin-item`);
          binItems.forEach(itemEl => {
            // Lock the board until "Try Again" is clicked, so dropping something
            // during the review window can't silently go nowhere.
            itemEl.draggable = false;

            const itemCat = itemEl.dataset.category;
            if (itemCat === cat) {
              // Remember this item is locked-in-correct on the underlying data too, so
              // renderSortingBinContent() (called again on "Try Again") keeps it green
              // and non-draggable instead of rebuilding it as a fresh, movable item.
              const dataItem = sortingSelections[cat].find(i => String(i.id) === itemEl.dataset.id);
              if (dataItem) dataItem.locked = true;

              // Bounce the item and flash a checkmark that fades away, same as the other games.
              itemEl.classList.add('correct', 'just-correct');
              const tick = document.createElement('span');
              tick.className = 'sorting-item-tick';
              tick.textContent = '✓';
              itemEl.appendChild(tick);
              setTimeout(() => {
                itemEl.classList.remove('just-correct');
                tick.remove();
              }, 700);
            } else {
              itemEl.classList.add('incorrect');
              hasErrors = true;
              sortingMistakeCount++;
            }
          });
        });

        updateSortingMistakesDisplay();

        if (hasErrors) {
          checkBtn.textContent = L.tryAgain;
        } else {
          // Win!
          document.getElementById('sorting-choice-buttons').style.display = 'none';
          checkBtn.style.display = 'none';

          const rank = getSortingRank(sortingMistakeCount);
          const previousBest = getSortingBestMistakes(exercise);
          const isNewRecord = previousBest === null || sortingMistakeCount < previousBest;
          if (isNewRecord) saveSortingBestMistakes(exercise, sortingMistakeCount);
          const note = isNewRecord
            ? `🎉 ${L.newBestMistakes}`
            : (previousBest !== null ? L.bestMistakes(previousBest) : '');

          const resultEl = document.getElementById('sorting-stat-result');
          if (resultEl) {
            resultEl.innerHTML = `
              <span class="sorting-result-badge">${rank.emoji} ${rank.label}</span>
              ${note ? `<span class="sorting-result-note">${note}</span>` : ''}
            `;
          }
          triggerDndConfetti();
        }
      } else if (checkBtn.textContent === L.tryAgain) {
        // Retrieve and reset incorrect items
        exercise.categories.forEach(cat => {
          const correctItems = [];
          const incorrectItems = [];

          sortingSelections[cat].forEach(item => {
            if (item.category === cat) {
              correctItems.push(item);
            } else {
              incorrectItems.push(item);
            }
          });

          // Save only correct items in this column
          sortingSelections[cat] = correctItems;
          renderSortingBinContent(cat);

          // Push incorrect items back into the deck
          incorrectItems.forEach(item => {
            sortingDeckItems.push(item);
          });
        });

        // Shuffle returned items
        sortingDeckItems = shuffleArray(sortingDeckItems);

        // Reset state
        checkBtn.textContent = L.checkCategories;
        checkBtn.disabled = true;
        checkBtn.style.display = 'block';

        // Re-render components
        renderSortingDeck();
        renderSortingChoiceButtons(exercise.categories);
      }
    }

    async function loadPracticeData() {
      try {
        const response = await fetch(practicePath + '?v=' + Date.now());
        if (!response.ok) throw new Error(`HTTP ${response.status} sur practice.json`);
        practiceData = await response.json();
      } catch (error) {
        console.error('Erreur lors du chargement de practice.json:', error);
      }

      try {
        const resInt = await fetch(interactivePath + '?v=' + Date.now());
        if (!resInt.ok) throw new Error(`HTTP ${resInt.status} sur interactive.json`);
        interactiveData = await resInt.json();
      } catch (error) {
        console.error('Erreur lors du chargement de interactive.json:', error);
        interactiveData = { multipleChoice: [], dragAndDrop: [], fillBlanks: [], matchPairs: [], sorting: [] };
      }
    }

    async function initPractice() {
      await loadPracticeData();
      bindEvents();
      initAnswerBox();
    }

    initPractice();
