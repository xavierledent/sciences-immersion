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
        tryTargetFirst: 'Try english first',
        contentNotAvailable: 'Content not available.',
        correctionNotAvailable: 'Correction not available.',
        exerciseUnderConstruction: 'This exercise is under construction — come back later!',
        gameUnderConstruction: 'This game is under construction — come back later!',
        /* Titres de repli, affichés quand un exercice n'a pas de quizTitle
           propre. Ils reprennent le nom de chaque jeu tel qu'il figure dans
           l'en-tête des pages. */
        qcmDefaultTitle: 'Multiple-choice questions',
        fitbDefaultTitle: 'Fill in the blanks',
        dndDefaultTitle: 'Drag and drop',
        memoryDefaultTitle: 'Match the pairs',
        sortingDefaultTitle: 'Sorting challenge',
        goTo: 'Go to:',
        fullscreenEnter: 'Full screen',
        fullscreenExit: 'Leave full screen',
        go: 'Go',
        enterNumberBetween: n => `Enter a number between 1 and ${n}`,
        prevExerciseAria: 'Previous exercise',
        nextExerciseAria: 'Next exercise',
        level1: 'Level 1',
        level2: 'Level 2',
        level3: 'Level 3',

        answerPlaceholder: 'Write your answer here...',
        checkMyAnswer: 'Check my answer',
        editMyAnswer: 'Edit my answer',
        answerSaved: 'Saved',
        selfAssessPrompt: 'Evaluate your answer',
        selfAssessNeedsWork: 'Needs work',
        selfAssessAlmost: 'Almost',
        selfAssessGotIt: 'Got it',
        yourAnswer: 'Your answer',
        answerEmpty: 'You have not written an answer yet.',
        chapterOverviewTitle: 'My progress',
        exercisesRemaining: n => `${n} exercise${n !== 1 ? 's' : ''} to turn green. Keep going !`,
        overviewAllTab: 'All',
        continueLevel: 'Continue this level',
        levelActionStart: 'Start',
        levelActionContinue: 'Continue',
        levelBadgeStart: 'Start here',
        levelBadgeContinue: 'Pick up here',
        revisionModeLabel: 'Revision mode',
        revisionProgress: (remaining, total) => `${remaining} of ${total} remaining`,
        revisionNext: 'Next',
        revisionExit: 'Exit revision',
        revisionDone: 'All done !',
        enlargeHint: 'Click to open this picture full screen',

        quizCompleted: 'Quiz Completed!',
        yourScore: 'Your score:',
        yourBest: 'Your best:',
        newPersonalBest: '🎉 New personal best!',
        checkAnswer: 'Check Answer',
        nextQuestion: 'Next Question',
        qcmResumeTitle: 'Quiz paused',
        qcmResumeSubtitle: (q, total) => `You stopped at question ${q} of ${total}.`,
        qcmResumeBtn: 'Continue',
        qcmRestartBtn: 'Start over',

        rankGold: 'Gold',
        rankSilver: 'Silver',
        rankBronze: 'Bronze',
        rankPerfect: 'Perfect!',
        rankKeepPracticing: 'Keep practicing',
        newBestMistakes: 'New best: fewest mistakes!',
        newBestMoves: 'New best: fewest moves!',
        newBestTime: 'New best time!',
        errors: 'Errors:',
        memorySameSide: 'Match a light card with a dark one.',
        qcmGentleFeedback: 'Good try! Here is the correct answer — now you know it.',
        qcmExplanationWrong: "Not quite! Here's why:",
        qcmExplanationRight: "Correct! Here's why:",
        dndZoneLabel: n => `Drop zone ${n}`,
        dndCorrectPlacement: 'Correct!',
        dndIncorrectPlacement: 'Not correct, try again.',
        sortingHint: 'Tap a box, or drag the card into it.',
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
        // Même clé et mêmes valeurs que vocabulary-engine.js : les deux moteurs
        // font parler la même page, ils ne doivent pas le faire avec deux voix.
        speechLang: 'en-US',
        pause: '⏸ Pause',
        resume: '▶ Resume',
        bestTimePrefix: 'Best time: '
      },
      nl: {
        questionTarget: 'Vraag NL',
        questionFrench: 'Vraag FR',
        correctionTarget: 'Correctie NL',
        correctionFrench: 'Correctie FR',
        tryTargetFirst: 'Probeer eerst Nederlands',
        contentNotAvailable: 'Inhoud niet beschikbaar.',
        correctionNotAvailable: 'Correctie niet beschikbaar.',
        exerciseUnderConstruction: 'Deze oefening is nog in opbouw — kom later terug!',
        gameUnderConstruction: 'Dit spel is nog in opbouw — kom later terug!',
        qcmDefaultTitle: 'Meerkeuzevragen',
        fitbDefaultTitle: 'Vul de gaten in',
        dndDefaultTitle: 'Sleep en plaats',
        memoryDefaultTitle: 'Zoek de paren',
        sortingDefaultTitle: 'Sorteeruitdaging',
        goTo: 'Ga naar:',
        fullscreenEnter: 'Volledig scherm',
        fullscreenExit: 'Volledig scherm verlaten',
        go: 'Ga',
        enterNumberBetween: n => `Voer een getal in tussen 1 en ${n}`,
        prevExerciseAria: 'Vorige oefening',
        nextExerciseAria: 'Volgende oefening',
        level1: 'Level 1',
        level2: 'Level 2',
        level3: 'Level 3',

        answerPlaceholder: 'Schrijf hier je antwoord...',
        checkMyAnswer: 'Mijn antwoord nakijken',
        editMyAnswer: 'Mijn antwoord aanpassen',
        answerSaved: 'Opgeslagen',
        selfAssessPrompt: 'Beoordeel je antwoord',
        selfAssessNeedsWork: 'Nog oefenen',
        selfAssessAlmost: 'Bijna',
        selfAssessGotIt: 'Gelukt',
        yourAnswer: 'Jouw antwoord',
        answerEmpty: 'Je hebt nog geen antwoord geschreven.',
        chapterOverviewTitle: 'Mijn voortgang',
        exercisesRemaining: n => `Nog ${n} oefening${n !== 1 ? 'en' : ''} om groen te worden. Ga zo door !`,
        overviewAllTab: 'Alle',
        continueLevel: 'Dit level verderzetten',
        levelActionStart: 'Beginnen',
        levelActionContinue: 'Doorgaan',
        levelBadgeStart: 'Begin hier',
        levelBadgeContinue: 'Ga hier verder',
        revisionModeLabel: 'Herhalingsmodus',
        revisionProgress: (remaining, total) => `${remaining} van ${total} resterend`,
        revisionNext: 'Volgende',
        revisionExit: 'Herhaling stoppen',
        revisionDone: 'Helemaal klaar !',
        enlargeHint: 'Klik om deze afbeelding schermvullend te openen',

        quizCompleted: 'Quiz voltooid!',
        yourScore: 'Jouw score:',
        yourBest: 'Jouw record:',
        newPersonalBest: '🎉 Nieuw persoonlijk record!',
        checkAnswer: 'Antwoord controleren',
        nextQuestion: 'Volgende vraag',
        qcmResumeTitle: 'Quiz gepauzeerd',
        qcmResumeSubtitle: (q, total) => `Je stopte bij vraag ${q} van ${total}.`,
        qcmResumeBtn: 'Doorgaan',
        qcmRestartBtn: 'Opnieuw beginnen',

        rankGold: 'Goud',
        rankSilver: 'Zilver',
        rankBronze: 'Brons',
        rankPerfect: 'Perfect!',
        rankKeepPracticing: 'Blijf oefenen',
        newBestMistakes: 'Nieuw record: minste fouten!',
        newBestMoves: 'Nieuw record: minste zetten!',
        newBestTime: 'Nieuwe snelste tijd!',
        errors: 'Fouten:',
        memorySameSide: 'Combineer een lichte kaart met een donkere.',
        qcmGentleFeedback: 'Goed geprobeerd! Hier is het juiste antwoord — nu ken je het.',
        qcmExplanationWrong: "Net niet! Zo zit het:",
        qcmExplanationRight: "Juist! Zo zit het:",
        dndZoneLabel: n => `Plaatsingszone ${n}`,
        dndCorrectPlacement: 'Juist!',
        dndIncorrectPlacement: 'Niet juist, probeer opnieuw.',
        sortingHint: 'Tik op een vak, of sleep de kaart erin.',
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
        speechLang: 'nl-BE',
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
    const overviewModal = document.getElementById('overview-modal');
    const overviewModalClose = document.getElementById('overview-modal-close');
    const overviewModalTitle = document.getElementById('overview-modal-title');
    const overviewTabs = document.getElementById('overview-tabs');
    const overviewMascotImg = document.getElementById('overview-mascot');
    const overviewPanels = document.getElementById('overview-panels');
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

    const interactiveButtonsContainer = document.getElementById('interactive-buttons');
    const interactiveModalOverlay = document.getElementById('interactive-modal');
    const interactiveModalClose = document.getElementById('interactive-modal-close');
    const interactiveModalTitle = document.getElementById('interactive-modal-title');
    const interactiveText = document.getElementById('interactive-text');
    const interactivePagination = document.getElementById('interactive-pagination');

    let practiceData = null;
    let interactiveData = null;
    // Distingue « cet exercice n'existe pas encore » de « les données n'ont pas
    // pu être chargées » : les deux donnent une liste vide, pas le même message.
    let practiceDataFailed = false;
    let interactiveDataFailed = false;

    /* Message d'incident destiné à l'élève, en français : le reste de la page est
       en langue d'immersion, mais une panne n'est pas un exercice — il ne s'agit
       pas de la déchiffrer. Le contraste de langue signale d'ailleurs à lui seul
       que ce qui s'affiche n'est pas du cours.
       Déclaré ici, avec le drapeau qu'il accompagne : un const n'est pas hissé,
       et il est lu bien plus haut dans le fichier que là où il servait. */
    const LOAD_ERROR_TEXT = 'Erreur de chargement. Recharge la page, et préviens ton professeur si cela se reproduit.';
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

    // Mid-quiz checkpoint (index/score/streak only — not the individual answers
    // given) so a reload can offer to resume rather than always restarting at
    // question 1. Distinct key/lifecycle from qcmBestScore above: this one is
    // cleared as soon as the quiz is completed, that one never is.
    function getQcmProgressKey(quizData) {
      return 'qcmProgress::' + location.pathname + '::' + (quizData.quizTitle || 'quiz');
    }

    function getQcmProgress(quizData) {
      try {
        const raw = localStorage.getItem(getQcmProgressKey(quizData));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed.questionIndex !== 'number' || parsed.questionIndex <= 0) return null;
        // Guards against a quiz edited (fewer questions) since the checkpoint was saved.
        if (!quizData.questions || parsed.questionIndex >= quizData.questions.length) return null;
        return parsed;
      } catch (e) { return null; }
    }

    function saveQcmProgress(quizData) {
      try {
        localStorage.setItem(getQcmProgressKey(quizData), JSON.stringify({
          questionIndex: qcmCurrentQuestionIndex,
          score: qcmScore,
          streak: qcmStreak
        }));
      } catch (e) {}
    }

    function clearQcmProgress(quizData) {
      try { localStorage.removeItem(getQcmProgressKey(quizData)); } catch (e) {}
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

    // Revision mode: a session tied to one specific level, started from the
    // overview's "Continue this level" button. Never persisted (localStorage
    // or otherwise) — closing the exercise modal or reopening a level from
    // scratch always resets it, deliberately, rather than restoring a session
    // the student may not remember starting.
    let revisionActive = false;
    let revisionLevel = null;
    // Frozen at session start ("Y" in "X of Y remaining"): the live remaining
    // count already tells the shrinking half of the story, Y just needs to
    // stay put as the stable denominator.
    let revisionTotal = 0;

    // French statement/correction is locked for a few seconds on every new
    // question/sub-question, to nudge students into reading the target language
    // first. The label itself stays "Question FR" / "Correction FR" throughout;
    // the nudge instead shows as a tooltip on hover (see .toggle-lock-wrap
    // ::after), and a fill bar behind the label drains over the lock duration —
    // this avoids both a bare "(25s)" that reads as a bug and any per-second
    // text change that could resize the button.
    // The tooltip wrapper is a plain span placed around the button rather than
    // a class on the button itself: the button keeps its own overflow:hidden
    // (needed to clip .toggle-fill's square corners to the pill shape), and an
    // overflow:hidden ancestor would clip an ::after tooltip positioned outside
    // its box just the same way — so the tooltip has to live one level up.
    function wrapForLockTooltip(btn) {
      const wrap = document.createElement('span');
      wrap.className = 'toggle-lock-wrap';
      btn.parentNode.insertBefore(wrap, btn);
      wrap.appendChild(btn);
      return wrap;
    }
    const statementFrWrap = wrapForLockTooltip(btnStatementFr);
    const correctionFrWrap = wrapForLockTooltip(btnCorrectionFr);
    const FR_LOCK_NUDGE = L.tryTargetFirst;
    statementFrWrap.setAttribute('data-lock-tooltip', FR_LOCK_NUDGE);
    correctionFrWrap.setAttribute('data-lock-tooltip', FR_LOCK_NUDGE);
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
      // A real `disabled` attribute stops the button from receiving hover
      // events at all in Chrome/Firefox, which is exactly what the tooltip
      // needs — so the lock is expressed as a class on the wrapper instead
      // (see the click listeners above, which check it), with aria-disabled
      // kept in sync on the button for assistive tech.
      statementFrWrap.classList.add('is-fr-locked');
      correctionFrWrap.classList.add('is-fr-locked');
      btnStatementFr.setAttribute('aria-disabled', 'true');
      btnCorrectionFr.setAttribute('aria-disabled', 'true');
      if (currentView === 'fr') handleStatementMode('en');
      else if (currentView === 'corr_fr') handleCorrectionMode('corr_en');

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
        statementFrWrap.classList.remove('is-fr-locked');
        correctionFrWrap.classList.remove('is-fr-locked');
        btnStatementFr.setAttribute('aria-disabled', 'false');
        btnCorrectionFr.setAttribute('aria-disabled', 'false');
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

    /* Calcule la place restante pour l'image et la lui impose en pixels.
       Une valeur en pixels plutôt qu'un étirement CSS : l'étirement donnait à
       l'image une boîte plus large qu'elle, où object-fit la redessinait plus
       petite — d'où des angles droits, l'arrondi restant sur les coins
       transparents de la boîte. Ici la boîte épouse l'image.
       On raisonne sur la hauteur maximale que la modale PEUT atteindre (90vh) et
       non sur sa hauteur actuelle, qui épouse son contenu : sinon l'image se
       réduirait alors qu'il reste de la place. */
    function syncExerciseImageHeight() {
      if (!exerciseImageWrap || !modalOverlay.classList.contains('modal-open')) return;
      if (exerciseImageHost.style.display === 'none') return;

      const card = modalOverlay.querySelector('.modal-card');
      const header = modalOverlay.querySelector('.modal-header');
      const body = modalOverlay.querySelector('.modal-body');
      if (!card || !header || !body) return;

      /* Deux régimes, assumés comme tels.
         En fenêtré la carte épouse son contenu sous un plafond de 90vh : la
         mesurer serait circulaire, puisque sa hauteur dépend de l'image dont on
         cherche justement la hauteur. On raisonne donc sur ce qu'elle PEUT
         atteindre, d'où le 0,9 — reflet en dur du max-height: 90vh du CSS.
         En plein écran, la feuille du navigateur lui impose 100% : sa hauteur est
         définie, indépendante du contenu, et la mesure devient à la fois possible
         et exacte. */
      const isFullscreen = document.fullscreenElement === card;
      const cardMax = isFullscreen
        ? card.getBoundingClientRect().height
        : window.innerHeight * 0.9;

      const bodyStyle = getComputedStyle(body);
      const bodyMax = cardMax
        - header.offsetHeight
        - parseFloat(bodyStyle.paddingTop) - parseFloat(bodyStyle.paddingBottom);

      let used = 0;
      Array.from(body.children).forEach(child => {
        if (child === exerciseImageWrap) return;
        const cs = getComputedStyle(child);
        if (cs.display === 'none') return;
        used += child.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
      });

      const wrapStyle = getComputedStyle(exerciseImageWrap);
      used += parseFloat(wrapStyle.marginTop) + parseFloat(wrapStyle.marginBottom);

      // Petite marge de sécurité : les bordures et arrondis de la carte ne sont
      // pas comptés ci-dessus.
      /* Le plafond de 280px n'a jamais mordu tant que la place manquait ; en
         plein écran il deviendrait la seule contrainte active et annulerait tout
         le bénéfice. Il tombe donc là, et là seulement.
         L'image ne dépassera pas sa taille naturelle pour autant : on ne pose
         qu'un maximum, jamais une taille. Une photo de 400px de haut s'arrêtera
         à 400px, nette, plutôt que d'être étirée. */
      const available = bodyMax - used - 12;
      const ceiling = isFullscreen ? Infinity : 280;
      exerciseImage.style.maxHeight = Math.max(60, Math.min(ceiling, available)) + 'px';

      /* Le calcul ci-dessus reste une estimation : il ignore les bordures, les
         marges fusionnées et les arrondis. On mesure donc le débordement réel et
         on rend cette hauteur à l'image. Mesurer vaut mieux que d'ajuster une
         marge au jugé, et la boucle ne peut pas s'emballer — une seule passe,
         bornée par le plancher. */
      const overflow = body.scrollHeight - body.clientHeight;
      if (overflow > 0) {
        const shown = exerciseImage.getBoundingClientRect().height;
        exerciseImage.style.maxHeight = Math.max(60, shown - overflow) + 'px';
      }
    }

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
      // Starting a level fresh from its button never carries over a revision
      // session from earlier — see the state comment near revisionActive.
      revisionActive = false;
      openModalAtExercise(levelKey, 1);
    }

    // Shared by the level buttons (always exercise 1) and the chapter overview
    // grid (any exercise the student picks) — same setup either way, only the
    // starting exercise differs.
    function openModalAtExercise(levelKey, exerciseId) {
      flushAnswerSave();
      answerLoadedKey = null;
      currentLevel = levelKey;
      // Le niveau vient d'être choisi : ses images partent en arrière-plan
      // pendant que l'élève lit le premier énoncé.
      preloadImages(levelImageSources(levelKey));
      currentExercise = exerciseId;
      recordLevelResumePosition(levelKey, exerciseId);
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
      // Closing via the × normally relies on display:none forcing the browser
      // to auto-exit fullscreen — true when this card entered fullscreen the
      // usual way. But the My progress → exercise swap (see carryFullscreenTo)
      // hands fullscreen to this card via a direct element-to-element request,
      // and closing right after apparently doesn't trigger that same implicit
      // exit reliably. Exiting explicitly here covers both paths.
      if (document.fullscreenElement && modalOverlay.contains(document.fullscreenElement)) {
        document.exitFullscreen().catch(() => {});
      }
      modalOverlay.classList.remove('modal-open');
      // Never persisted — closing the modal always drops the revision session
      // rather than risk restoring one silently on the next open.
      revisionActive = false;
      // Le badge/"Continue" doit refléter ce qui vient de se passer sans
      // attendre un rechargement de page.
      applyLevelResumeUI();
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
      if (revisionActive && currentLevel === revisionLevel) {
        renderRevisionBar();
        return;
      }

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
            applySelfAssessClass(btn, worstSelfAssess(currentLevel, exerciseList.find(ex => ex.id === item)));
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

    // Next non-green exercise in revisionLevel, scanning forward from the
    // current exercise and wrapping around — never null while at least one
    // other exercise (including ones before the current position) is still
    // non-green, so revisiting one just marked green doesn't strand the
    // student on a false "done".
    function findNextRevisionExercise() {
      const exerciseList = practiceData[revisionLevel] || [];
      const ids = exerciseList.map(item => item.id);
      const currentIdx = ids.indexOf(currentExercise);
      for (let step = 1; step <= ids.length; step++) {
        const idx = (currentIdx + step) % ids.length;
        const item = exerciseList[idx];
        if (worstSelfAssess(revisionLevel, item) !== 3) return item.id;
      }
      return null;
    }

    function renderRevisionBar() {
      exercisesPagination.innerHTML = '';

      const bar = document.createElement('div');
      bar.className = 'revision-bar';

      const label = document.createElement('span');
      label.className = 'revision-bar-label';
      label.textContent = L.revisionModeLabel;
      bar.appendChild(label);

      const progress = document.createElement('span');
      progress.className = 'revision-bar-progress';
      progress.textContent = L.revisionProgress(countOverviewRemaining(revisionLevel), revisionTotal);
      bar.appendChild(progress);

      const nextId = findNextRevisionExercise();
      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'revision-bar-next';
      if (nextId === null) {
        nextBtn.classList.add('is-done');
        nextBtn.textContent = L.revisionDone;
        nextBtn.disabled = true;
      } else {
        nextBtn.textContent = L.revisionNext;
        nextBtn.addEventListener('click', () => goToExercise(nextId));
      }
      bar.appendChild(nextBtn);

      const exitBtn = document.createElement('button');
      exitBtn.type = 'button';
      exitBtn.className = 'revision-bar-exit';
      exitBtn.textContent = L.revisionExit;
      exitBtn.addEventListener('click', exitRevisionMode);
      bar.appendChild(exitBtn);

      exercisesPagination.appendChild(bar);
    }

    // Drops the session and restores the normal pager on whichever exercise
    // the student happens to be on — no navigation of its own.
    function exitRevisionMode() {
      revisionActive = false;
      renderExerciseSteps();
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
      recordLevelResumePosition(currentLevel, n);
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
        // Même distinction que dans les modales de jeu : le gris annonce une
        // absence, le rouge une panne.
        exerciseText.classList.toggle('is-load-error', practiceDataFailed);
        exerciseText.textContent = practiceDataFailed ? LOAD_ERROR_TEXT : L.exerciseUnderConstruction;
        updateAnswerCompare(null, null);
        applyToggleState();
        return;
      }

      if (exerciseItem.image) {
        // Image introuvable : on replie le conteneur plutôt que de laisser un
        // cadre vide ou une icône cassée au milieu de l'énoncé. L'exercice reste
        // lisible et utilisable sans elle.
        swapImage(exerciseImage, `assets/${exerciseItem.image}`, () => {
          exerciseImageHost.style.display = 'none';
        });
        // Chaîne vide et non 'block' : on efface le style en ligne pour rendre
        // la main à la feuille de style, qui met le conteneur en disposition
        // flexible. Un 'block' en ligne l'emportait et supprimait à la fois le
        // centrage et l'étirement qui adapte l'image à la hauteur disponible.
        exerciseImageHost.style.display = '';
      } else {
        exerciseImageHost.style.display = 'none';
      }

      renderSubQuestionNav(exerciseItem);

      const questions = getExerciseQuestions(exerciseItem);
      const source = questions ? questions[currentSubQuestion] : exerciseItem;

      // On sort du cas d'erreur : le panneau reprend son habillage normal.
      exerciseText.classList.remove('is-load-error');

      if (currentView === 'en' || currentView === 'fr') {
        setRichText(exerciseText, (source && source[currentView]) || L.contentNotAvailable);
      } else {
        setRichText(exerciseText, (source && source[currentView]) || L.correctionNotAvailable);
      }

      syncAnswerBoxForExercise();
      updateAnswerCompare(exerciseItem, source);
      applyToggleState();

      renderExerciseSteps();
      // Après le rendu : la place restante dépend de ce qui vient d'être affiché
      // (barre a/b/c, longueur de l'énoncé, zone de réponse ou non).
      syncExerciseImageHeight();
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

    /* Trois visages minimalistes plutôt que des émoji : un émoji se dessine
       différemment selon la police système (Chromebook, Windows, mobile),
       avec ses propres couleurs fixes — ça détonnerait sur une pilule pleine
       slate. Même cercle et mêmes yeux pour les trois, seule la courbe de la
       bouche change : la parenté visuelle reste lisible d'un bouton à
       l'autre. aria-hidden : le mot à côté suffit, l'icône est décorative.
       Déclaré ici, avant la construction du bloc juste en dessous, qui s'en
       sert immédiatement — plus bas dans le fichier, ce const n'existerait pas
       encore au moment où ce code s'exécute. */
    const SELF_ASSESS_MOUTHS = {
      1: 'M6.5 14 Q10 11 13.5 14',
      2: 'M6.5 12.5 H13.5',
      3: 'M6.5 11 Q10 14.5 13.5 11'
    };

    // Mêmes teintes que le point sous le numéro d'exercice (voir
    // practice-engine.css, .self-assess-N::after) : l'élève associe le même
    // rouge/ambre/vert au bouton qu'il vient de cliquer et à l'endroit où le
    // choix se retrouve résumé, sans avoir à en apprendre un second.
    //
    // Contrairement à assessment.html (verdict global slate neutre, une
    // évaluation ponctuelle), ce code couleur rose/ambre/vert reflète un
    // statut de travail en cours, pas un jugement final — un exercice "pas
    // vert" reste dans la file de révision et peut être retravaillé autant
    // de fois que nécessaire. Choix assumé, pas une incohérence avec le ton
    // neutre d'assessment.html.
    const SELF_ASSESS_COLORS = {
      1: 'var(--color-rose)',
      2: '#d99a2b',
      3: 'var(--color-emerald)'
    };

    function selfAssessIcon(level) {
      const color = SELF_ASSESS_COLORS[level];
      const svg = '<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
        '<circle cx="10" cy="10" r="8.5" fill="none" stroke="' + color + '" stroke-width="1.6" />' +
        '<circle cx="7" cy="8" r="1" fill="' + color + '" />' +
        '<circle cx="13" cy="8" r="1" fill="' + color + '" />' +
        '<path d="' + SELF_ASSESS_MOUTHS[level] + '" fill="none" stroke="' + color + '" stroke-width="1.6" stroke-linecap="round" />' +
        '</svg>';
      // Enveloppe dédiée : sur fond slate plein (bouton sélectionné), le trait
      // coloré se distinguait mal — voir .self-assess-btn.is-selected
      // .self-assess-icon dans le CSS, qui pose un petit disque blanc derrière
      // uniquement à ce moment-là, sans toucher à la couleur elle-même.
      return '<span class="self-assess-icon">' + svg + '</span>';
    }

    const SELF_ASSESS_ICONS = { 1: selfAssessIcon(1), 2: selfAssessIcon(2), 3: selfAssessIcon(3) };

    /* Flèche du bouton Check/Edit : dessinée plutôt que le caractère « ← »,
       dont le trait rendait fin et léger à côté du texte en gras du reste du
       site. Un seul tracé, pointant à droite par défaut ; la version gauche
       n'est pas redessinée à part, juste retournée horizontalement — une
       seule forme à faire vivre pour les deux sens. currentColor : ce bouton
       est toujours plein slate à texte blanc, jamais les deux états des
       pilules d'auto-évaluation, donc rien à distinguer ici. */
    function arrowIcon(direction) {
      const flip = direction === 'left' ? ' style="transform: scaleX(-1)"' : '';
      return '<svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true" focusable="false"' + flip + '>' +
        '<path d="M3 10 H16 M11 5 L16 10 L11 15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />' +
        '</svg>';
    }

    /* ===== Auto-évaluation : construction du bloc =====
       Construit en JS et inséré ici plutôt qu'écrit dans le HTML de chaque
       chapitre : la consigne était que ça apparaisse systématiquement, sur
       tous les exercices de tous les chapitres, sans rollout à faire sur
       douze pages. Se greffe entre le panneau de correction et la barre
       "Edit my answer" — placée là où l'élève regarde déjà à ce moment,
       juste avant de décider s'il modifie sa réponse. */
    let selfAssessBlock = null;
    let selfAssessRevealTimer = null;

    if (answerFeatureOn) {
      const bar = answerBox.querySelector('.student-answer-bar');
      if (bar) {
        selfAssessBlock = document.createElement('div');
        selfAssessBlock.className = 'self-assess';
        selfAssessBlock.id = 'self-assess';
        selfAssessBlock.innerHTML =
          '<p class="self-assess-prompt">' + L.selfAssessPrompt + '</p>' +
          '<div class="self-assess-buttons">' +
          '<button type="button" class="self-assess-btn" data-level="1">' + SELF_ASSESS_ICONS[1] + '<span>' + L.selfAssessNeedsWork + '</span></button>' +
          '<button type="button" class="self-assess-btn" data-level="2">' + SELF_ASSESS_ICONS[2] + '<span>' + L.selfAssessAlmost + '</span></button>' +
          '<button type="button" class="self-assess-btn" data-level="3">' + SELF_ASSESS_ICONS[3] + '<span>' + L.selfAssessGotIt + '</span></button>' +
          '</div>';
        bar.parentNode.insertBefore(selfAssessBlock, bar);

        // Un seul écouteur délégué plutôt qu'un par bouton : les trois pilules
        // ne sont jamais recréées, inutile de les re-brancher à chaque exercice.
        selfAssessBlock.querySelector('.self-assess-buttons').addEventListener('click', event => {
          const btn = event.target.closest('.self-assess-btn');
          if (!btn) return;
          const level = Number(btn.dataset.level);
          const wasSelected = btn.classList.contains('is-selected');

          // Recliquer sur le choix déjà fait l'annule, plutôt que de rester
          // bloqué sur un premier jugement qu'on regretterait.
          if (wasSelected) {
            clearSelfAssess(currentLevel, currentExercise, currentSubQuestion);
          } else {
            writeSelfAssess(currentLevel, currentExercise, currentSubQuestion, level);
          }

          if (window.logEvent) {
            window.logEvent('self_assess_rated', {
              level: currentLevel,
              exerciseId: currentExercise,
              subQuestion: currentSubQuestion,
              rating: wasSelected ? null : level
            });
          }

          selfAssessBlock.querySelectorAll('.self-assess-btn').forEach(b => {
            b.classList.toggle('is-selected', !wasSelected && b === btn);
          });
          refreshAnswerMarkers();
        });
      }
    }

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

    // Position de reprise : quel exercice a été touché en dernier dans
    // chaque niveau, et quel niveau a été touché en dernier tous niveaux
    // confondus — deux clés distinctes, car "reprendre" doit rouvrir
    // l'exercice exact, pas juste le niveau.
    function getLastExerciseKey(levelKey) {
      return 'practiceLastExercise::' + location.pathname + '::' + levelKey;
    }

    function readLastExercise(levelKey) {
      try {
        const n = parseInt(localStorage.getItem(getLastExerciseKey(levelKey)), 10);
        return Number.isInteger(n) && n >= 1 ? n : null;
      } catch (e) { return null; }
    }

    function writeLastExercise(levelKey, exerciseId) {
      try { localStorage.setItem(getLastExerciseKey(levelKey), String(exerciseId)); } catch (e) {}
    }

    function getLastTouchedLevelKey() {
      return 'practiceLastTouchedLevel::' + location.pathname;
    }

    function readLastTouchedLevel() {
      try { return localStorage.getItem(getLastTouchedLevelKey()); } catch (e) { return null; }
    }

    function writeLastTouchedLevel(levelKey) {
      try { localStorage.setItem(getLastTouchedLevelKey(), levelKey); } catch (e) {}
    }

    function recordLevelResumePosition(levelKey, exerciseId) {
      writeLastExercise(levelKey, exerciseId);
      writeLastTouchedLevel(levelKey);
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

    /* ===== Auto-évaluation de l'élève =====
       Même convention de clé que les réponses elles-mêmes : une entrée par
       sous-question, jamais par exercice entier — chaque partie a sa propre
       correction, elle a donc aussi son propre jugement. */
    function getSelfAssessKey(levelKey, exerciseId, subIndex) {
      return 'practiceSelfAssess::' + location.pathname + '::' + levelKey + '::' + exerciseId + '::' + subIndex;
    }

    /* Le jugement porte sur un texte précis, pas sur la sous-question en
       général : on stocke donc la réponse avec son niveau, et on ne restitue
       ce niveau que si la réponse actuelle lui correspond encore. Ça évite
       d'avoir à effacer explicitement au clic sur "Edit my answer" — rouvrir
       la réponse sans rien y changer laisse le jugement intact, seul un vrai
       changement de texte l'invalide, une fois enregistré.
       Un ancien format (juste le niveau, sans réponse associée) échouera au
       test typeof ci-dessous et sera traité comme absent plutôt que planter. */
    function readSelfAssess(levelKey, exerciseId, subIndex) {
      try {
        const raw = localStorage.getItem(getSelfAssessKey(levelKey, exerciseId, subIndex));
        if (!raw) return null;
        const record = JSON.parse(raw);
        if (!record || typeof record.level !== 'number') return null;
        if (record.answer !== readStoredAnswer(levelKey, exerciseId, subIndex)) return null;
        return record.level;
      } catch (e) { return null; }
    }

    function writeSelfAssess(levelKey, exerciseId, subIndex, level) {
      try {
        const record = { level: level, answer: readStoredAnswer(levelKey, exerciseId, subIndex) };
        localStorage.setItem(getSelfAssessKey(levelKey, exerciseId, subIndex), JSON.stringify(record));
      } catch (e) {}
    }

    function clearSelfAssess(levelKey, exerciseId, subIndex) {
      try { localStorage.removeItem(getSelfAssessKey(levelKey, exerciseId, subIndex)); } catch (e) {}
    }

    // Le pire des sous-parties déjà évaluées, pour le numéro principal de
    // l'exercice : une seule partie "à revoir" doit se voir sur le numéro,
    // une moyenne la masquerait. Ignore les parties pas encore jugées plutôt
    // que d'attendre que tout le monde le soit — même logique tolérante que
    // hasAnyStoredAnswer ci-dessus.
    function worstSelfAssess(levelKey, exerciseItem) {
      if (!exerciseItem) return null;
      const questions = getExerciseQuestions(exerciseItem);
      const count = questions ? questions.length : 1;
      let worst = null;
      for (let i = 0; i < count; i++) {
        const value = readSelfAssess(levelKey, exerciseItem.id, i);
        if (value !== null && (worst === null || value < worst)) worst = value;
      }
      return worst;
    }

    function applySelfAssessClass(el, level) {
      el.classList.remove('self-assess-1', 'self-assess-2', 'self-assess-3');
      if (level) el.classList.add('self-assess-' + level);
    }

    /* ===== Chapter overview modal =====
       Rebuilt from scratch on every open rather than kept in sync incrementally:
       self-assessment can change while the exercise modal is open behind it, so
       a fresh read off localStorage is simpler and cheaper than tracking
       invalidation. */
    const OVERVIEW_LEVELS = ['level1', 'level2', 'level3'];

    // "Remaining" = not green: red + amber + never-attempted, exactly what the
    // student still owes this level.
    function countOverviewRemaining(levelKey) {
      const exerciseList = practiceData[levelKey] || [];
      let remaining = 0;
      exerciseList.forEach(item => {
        if (worstSelfAssess(levelKey, item) !== 3) remaining++;
      });
      return remaining;
    }

    // "Attempted" = any self-assessment at all, red/amber/green alike — only
    // never-opened (grey) is excluded. Deliberately not "mastered" (green):
    // the header mascot rewards time spent working through a level, not the
    // score, which the counter text and pastille colours already carry.
    function countOverviewAttempted(levelKey) {
      const exerciseList = practiceData[levelKey] || [];
      let attempted = 0;
      exerciseList.forEach(item => {
        if (worstSelfAssess(levelKey, item) !== null) attempted++;
      });
      return attempted;
    }

    // Same %-attempted idea as countOverviewAttempted, but for the whole
    // chapter at once when the "All" tab is active: one combined fraction
    // across all three levels rather than one level's own.
    function overviewAttemptedPercent(levelKey) {
      if (levelKey === 'all') {
        let total = 0, attempted = 0;
        OVERVIEW_LEVELS.forEach(key => {
          total += (practiceData[key] || []).length;
          attempted += countOverviewAttempted(key);
        });
        return total > 0 ? (attempted / total) * 100 : 0;
      }
      const exerciseList = practiceData[levelKey] || [];
      return exerciseList.length > 0 ? (countOverviewAttempted(levelKey) / exerciseList.length) * 100 : 0;
    }

    function getOverviewMascotSrc(percent) {
      if (percent >= 100) return '../../../assets/Friends palier 4.png';
      if (percent >= 80) return '../../../assets/Friends palier 3.png';
      if (percent >= 21) return '../../../assets/Friends palier 2.png';
      return '../../../assets/Friends palier 1.png';
    }

    function updateOverviewMascot(levelKey) {
      if (!overviewMascotImg) return;
      overviewMascotImg.src = getOverviewMascotSrc(overviewAttemptedPercent(levelKey));
    }

    // Leaving the overview modal for the exercise modal closes the former
    // (display:none on its overlay), which forces the browser to exit
    // fullscreen if that's what was fullscreen — jumping the student back
    // into a small window even though they never asked to leave fullscreen.
    // Captured before closing, applied to the new modal's own card after.
    function isCardFullscreen(overlayEl) {
      const card = overlayEl.querySelector('.modal-card');
      return !!card && document.fullscreenElement === card;
    }

    // Returns the request's promise (always resolving, errors swallowed) so
    // callers can wait for it before hiding the overview modal: requestFullscreen
    // is asynchronous, and hiding — display:none — the still-current fullscreen
    // element while the new request hasn't landed yet interrupts that request
    // instead of letting it complete.
    function carryFullscreenTo(overlayEl) {
      const card = overlayEl.querySelector('.modal-card');
      if (card && card.requestFullscreen) return card.requestFullscreen().catch(() => {});
      return Promise.resolve();
    }

    function buildOverviewGrid(levelKey) {
      const exerciseList = practiceData[levelKey] || [];
      const grid = document.createElement('div');
      grid.className = 'overview-grid';
      exerciseList.forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'exercise-step';
        btn.textContent = String(item.id);
        // Always coloured, unlike the pager's dot: grey by default (never
        // attempted) rather than shown only once started, since the whole
        // point here is to see every exercise's status at a glance.
        applySelfAssessClass(btn, worstSelfAssess(levelKey, item));
        btn.addEventListener('click', () => {
          const wasFullscreen = isCardFullscreen(overviewModal);
          revisionActive = false;
          openModalAtExercise(levelKey, item.id);
          if (wasFullscreen) {
            // Only hide the overview modal once the new card has actually
            // become fullscreen — see carryFullscreenTo.
            carryFullscreenTo(modalOverlay).then(closeOverviewModal);
          } else {
            closeOverviewModal();
          }
        });
        grid.appendChild(btn);
      });
      return grid;
    }

    // Every non-green exercise id in a level, in exercise order — the revision
    // queue. Recomputed on demand rather than cached: self-assessment changes
    // during the session as the student works through it.
    function getNonGreenExerciseIds(levelKey) {
      const exerciseList = practiceData[levelKey] || [];
      return exerciseList.filter(item => worstSelfAssess(levelKey, item) !== 3).map(item => item.id);
    }

    function startRevisionMode(levelKey) {
      const queue = getNonGreenExerciseIds(levelKey);
      // The button that calls this is hidden whenever the level has nothing
      // left (see buildOverviewLevelSection), so an empty queue here would
      // mean the count changed between render and click — safe to just no-op.
      if (queue.length === 0) return;
      revisionActive = true;
      revisionLevel = levelKey;
      revisionTotal = queue.length;
      if (window.logEvent) window.logEvent('revision_mode_started', { level: levelKey, queueLength: queue.length });
      openModalAtExercise(levelKey, queue[0]);
    }

    // One level's counter + grid, used both as its own tab panel and as one
    // stacked section inside the "All" tab.
    function buildOverviewLevelSection(levelKey) {
      const section = document.createElement('div');
      section.className = 'overview-level-section';

      const remaining = countOverviewRemaining(levelKey);
      const counter = document.createElement('p');
      counter.className = 'overview-counter';
      counter.textContent = L.exercisesRemaining(remaining);
      section.appendChild(counter);

      section.appendChild(buildOverviewGrid(levelKey));

      // Below the grid, like the classic exercise modals' own action button
      // sits below their content. Hidden rather than disabled when the level
      // is already fully green: per the site's convention elsewhere, an
      // action with nothing left to do disappears instead of sitting there
      // inert.
      if (remaining > 0) {
        const continueBtn = document.createElement('button');
        continueBtn.type = 'button';
        continueBtn.className = 'overview-continue-btn';
        continueBtn.textContent = L.continueLevel;
        continueBtn.addEventListener('click', () => {
          const wasFullscreen = isCardFullscreen(overviewModal);
          startRevisionMode(levelKey);
          // See buildOverviewGrid's click handler and carryFullscreenTo for
          // why the overview modal only closes once the swap has landed.
          if (wasFullscreen) {
            carryFullscreenTo(modalOverlay).then(closeOverviewModal);
          } else {
            closeOverviewModal();
          }
        });
        section.appendChild(continueBtn);
      }

      return section;
    }

    function renderOverviewModal() {
      overviewTabs.innerHTML = '';
      overviewPanels.innerHTML = '';

      OVERVIEW_LEVELS.forEach(levelKey => {
        const tabBtn = document.createElement('button');
        tabBtn.type = 'button';
        tabBtn.className = 'toggle-button overview-tab';
        tabBtn.textContent = getLevelLabel(levelKey);
        tabBtn.dataset.level = levelKey;
        if (levelKey === currentLevel) tabBtn.classList.add('active');
        overviewTabs.appendChild(tabBtn);

        const panel = document.createElement('div');
        panel.className = 'overview-panel';
        panel.dataset.level = levelKey;
        if (levelKey === currentLevel) panel.classList.add('is-active');

        panel.appendChild(buildOverviewLevelSection(levelKey));
        overviewPanels.appendChild(panel);
      });

      // "All" shows every level stacked in one panel, each under its own
      // heading — bare numbers alone would be ambiguous since every level
      // restarts its own numbering at 1.
      const allTabBtn = document.createElement('button');
      allTabBtn.type = 'button';
      allTabBtn.className = 'toggle-button overview-tab';
      allTabBtn.textContent = L.overviewAllTab;
      allTabBtn.dataset.level = 'all';
      overviewTabs.appendChild(allTabBtn);

      const allPanel = document.createElement('div');
      allPanel.className = 'overview-panel';
      allPanel.dataset.level = 'all';
      OVERVIEW_LEVELS.forEach(levelKey => {
        const heading = document.createElement('h3');
        heading.className = 'overview-level-heading';
        heading.textContent = getLevelLabel(levelKey);
        allPanel.appendChild(heading);
        allPanel.appendChild(buildOverviewLevelSection(levelKey));
      });
      overviewPanels.appendChild(allPanel);
    }

    function openOverviewModal() {
      overviewModalTitle.textContent = L.chapterOverviewTitle;
      renderOverviewModal();
      updateOverviewMascot(currentLevel);
      overviewModal.classList.add('modal-open');
    }

    function closeOverviewModal() {
      overviewModal.classList.remove('modal-open');
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
        applySelfAssessClass(button, readSelfAssess(currentLevel, exerciseItem.id, index));
      });
    }

    /* Fade-in retardé la toute première fois qu'une sous-question donnée est
       évaluée — assez pour décourager un clic réflexe avant d'avoir vraiment
       comparé, sans créer d'attente agaçante. Si elle l'est déjà (retour en
       arrière dans la pagination, sans avoir modifié la réponse), les
       boutons apparaissent tout de suite, celui déjà choisi mis en évidence :
       il n'y a alors plus de réflexe à freiner, juste une relecture. */
    function updateSelfAssessDisplay(comparing) {
      if (!selfAssessBlock) return;

      // Un minuteur laissé courant pourrait sinon rendre les boutons
      // cliquables après un changement d'exercice ou de sous-question : on
      // l'annule d'abord, dans tous les cas, avant de décider quoi que ce soit.
      if (selfAssessRevealTimer) { clearTimeout(selfAssessRevealTimer); selfAssessRevealTimer = null; }

      if (!comparing) {
        // Repli instantané, sans transition : le reste de l'écran de
        // comparaison disparaît lui aussi d'un coup (voir .answer-compare),
        // un fondu qui traînerait ici seul paraîtrait orphelin. display:none
        // retire aussi le bloc du flux pendant que l'élève écrit, où il
        // laisserait sinon un vide silencieux.
        selfAssessBlock.style.display = 'none';
        selfAssessBlock.classList.remove('is-visible', 'is-clickable');
        return;
      }

      const stored = readSelfAssess(currentLevel, currentExercise, currentSubQuestion);
      selfAssessBlock.querySelectorAll('.self-assess-btn').forEach(btn => {
        btn.classList.toggle('is-selected', Number(btn.dataset.level) === stored);
      });

      // 'block' explicitement, pas '' : une chaîne vide retire seulement la
      // valeur posée en ligne, elle ne rétablit rien par défaut — la règle
      // CSS display: none serait alors la seule encore en jeu, et le bloc
      // resterait invisible malgré tout ce qui suit.
      selfAssessBlock.style.display = 'block';

      if (stored !== null) {
        // Déjà jugée : la relire n'est pas un réflexe à freiner. Transition
        // neutralisée le temps de poser les deux classes d'un coup, sinon le
        // fondu de 2 s rejouerait à chaque retour sur cette sous-question.
        selfAssessBlock.style.transition = 'none';
        selfAssessBlock.classList.add('is-visible', 'is-clickable');
        void selfAssessBlock.offsetHeight;
        selfAssessBlock.style.transition = '';
      } else {
        selfAssessBlock.classList.remove('is-visible', 'is-clickable');
        // Force le navigateur à peindre l'état invisible avant d'ajouter
        // is-visible juste en dessous : sans ce point de passage, les deux
        // opacités seraient posées dans le même instant et rien ne s'animerait.
        void selfAssessBlock.offsetHeight;
        selfAssessBlock.classList.add('is-visible');
        selfAssessRevealTimer = setTimeout(() => {
          selfAssessRevealTimer = null;
          selfAssessBlock.classList.add('is-clickable');
        }, 2000);
      }
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

      updateSelfAssessDisplay(comparing);

      if (answerCheckBtn) {
        answerCheckBtn.innerHTML = comparing
          ? arrowIcon('left') + '<span>' + L.editMyAnswer + '</span>'
          : '<span>' + L.checkMyAnswer + '</span>' + arrowIcon('right');
      }

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

    /* En plein écran, le navigateur ne rend que le sous-arbre de l'élément
       affiché. Tout ce qui doit se superposer au jeu — la visionneuse d'images,
       les confettis de victoire — doit donc y être hébergé, sans quoi il existe
       mais reste invisible. Hors plein écran, le corps de page fait l'affaire. */
    function overlayHost() {
      return document.fullscreenElement || document.body;
    }

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
      // Réattachée à chaque ouverture : le plein écran a pu changer d'hôte.
      overlayHost().appendChild(box);
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
      // La touche Échap est gérée en un seul endroit, dans bindEvents : deux
      // écouteurs sur document ne peuvent pas s'ignorer proprement l'un l'autre.
      // Lets the shared stylesheet reserve room for the a/b/c markers only on
      // pages that actually opted into the answer box.
      modalOverlay.classList.add('has-answer-box');
      answerInput.setAttribute('placeholder', L.answerPlaceholder);
      if (answerCheckBtn) answerCheckBtn.innerHTML = '<span>' + L.checkMyAnswer + '</span>' + arrowIcon('right');
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
            // Rien à effacer explicitement ici : readSelfAssess compare déjà
            // la réponse actuelle à celle qui a été jugée (voir plus haut).
            // Rouvrir sans rien changer laisse donc le jugement intact ; un
            // vrai changement de texte, une fois enregistré, l'invalidera de
            // lui-même au prochain rendu.
            currentView = lastStatementView;
            renderExerciseContent();
            answerInput.focus();
          } else {
            // Never gated on having written something: an empty box must still
            // reach the correction rather than block the student.
            if (window.logEvent) {
              const answerText = (answerInput.value || '').trim();
              window.logEvent('answer_checked', {
                level: currentLevel,
                exerciseId: currentExercise,
                subQuestion: currentSubQuestion,
                hasAnswer: answerText.length > 0,
                answerLength: answerText.length
              });
            }
            handleCorrectionMode('corr_en');
          }
        });
      }
    }

    function bindEvents() {
      levelButtonsContainer.addEventListener('click', event => {
        const levelBtn = event.target.closest('button[data-level]');
        if (levelBtn) {
          // Le niveau mis en avant rouvre l'exercice exact où l'élève
          // s'était arrêté ("Continue"), pas le système de révision (qui
          // saute les exercices déjà verts) — celui-ci reste exclusivement
          // accessible depuis "My progress".
          const savedExercise = levelBtn.classList.contains('is-current-level')
            ? readLastExercise(levelBtn.dataset.level)
            : null;
          if (savedExercise) {
            revisionActive = false;
            openModalAtExercise(levelBtn.dataset.level, savedExercise);
          } else {
            openModal(levelBtn.dataset.level);
          }
          return;
        }
        const overviewBtn = event.target.closest('button[data-action="chapter-overview"]');
        if (overviewBtn) openOverviewModal();
      });

      overviewModalClose.addEventListener('click', closeOverviewModal);

      overviewTabs.addEventListener('click', event => {
        const tabBtn = event.target.closest('.overview-tab');
        if (!tabBtn) return;
        const levelKey = tabBtn.dataset.level;
        overviewTabs.querySelectorAll('.overview-tab').forEach(b => b.classList.toggle('active', b === tabBtn));
        overviewPanels.querySelectorAll('.overview-panel').forEach(p => p.classList.toggle('is-active', p.dataset.level === levelKey));
        updateOverviewMascot(levelKey);
      });

      // Fermeture par la croix uniquement : un appui à côté de la modale est vite
      // arrivé au doigt, et il faisait perdre l'exercice en cours. Les cinq
      // modales de jeux fonctionnaient déjà ainsi.
      modalClose.addEventListener('click', closeModal);

      /* Verrou de défilement de l'arrière-plan.
         Observé plutôt qu'appelé depuis chaque fonction d'ouverture et de
         fermeture : il y en a quatorze, et il aurait suffi d'en oublier une pour
         laisser la page bloquée après la fermeture d'une modale — un bug bien
         plus déroutant que celui qu'on corrige. Ici, n'importe quel changement
         d'état est capté, quelle qu'en soit l'origine. */
      const overlays = document.querySelectorAll('.modal-overlay');

      function updateBodyScrollLock() {
        const anyOpen = Array.from(overlays).some(o => o.classList.contains('modal-open'));
        document.body.classList.toggle('modal-is-open', anyOpen);

        /* Fermer une modale affichée en plein écran laisserait l'élève devant un
           plein écran vide, l'élément affiché étant la carte qu'on vient de
           masquer. On le capte ici plutôt que dans les sept fonctions de
           fermeture : le même observateur voit déjà passer tous les changements
           d'état, quelle qu'en soit l'origine. */
        const full = document.fullscreenElement;
        if (full && !full.closest('.modal-overlay.modal-open')) {
          document.exitFullscreen().catch(() => {});
        }
      }

      const lockObserver = new MutationObserver(updateBodyScrollLock);
      overlays.forEach(o => lockObserver.observe(o, { attributes: true, attributeFilter: ['class'] }));

      // Le plateau du glisser-déposer se remesure au redimensionnement, sinon
      // les zones garderaient la taille calculée à l'ouverture.
      window.addEventListener('resize', dndSyncBoardMetrics);
      window.addEventListener('resize', syncExerciseImageHeight);
      window.addEventListener('resize', memorySyncCardSize);
      /* La taille du texte à trous change au passage en plein écran sur grand
         écran : les listes doivent se remesurer, la largeur d'hier ne vaut plus. */
      window.addEventListener('resize', fitbSyncSelectWidths);
      /* La zone de réponse grandit avec le texte saisi jusqu'à un plafond, et sa
         hauteur est posée en pixels : le changement de taille de police en plein
         écran la rend caduque. */
      window.addEventListener('resize', autoGrowAnswer);
      // L'image ne connaît ses proportions qu'une fois chargée.
      if (exerciseImage) exerciseImage.addEventListener('load', syncExerciseImageHeight);

      /* Échap ferme ce qui est ouvert. Aucun risque de fermeture accidentelle
         au doigt, contrairement au clic à côté qu'on vient de retirer, et c'est
         le réflexe attendu au clavier.
         Un seul écouteur pour les sept modales et la visionneuse : deux
         écouteurs sur document ne peuvent pas se céder la priorité proprement.
         On appelle les fonctions de fermeture existantes plutôt que de retirer
         la classe, pour ne pas court-circuiter leur nettoyage. */
      const MODAL_CLOSERS = [
        ['overview-modal', closeOverviewModal],
        ['exercise-modal', closeModal],
        ['interactive-modal', closeInteractiveModal],
        ['qcm-modal', closeQCMModal],
        ['fitb-modal', closeFitbModal],
        ['dnd-modal', closeDndModal],
        ['memory-modal', closeMemoryModal],
        ['sorting-modal', closeSortingModal]
      ];

      document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        /* La visionneuse se superpose à tout le reste : elle se ferme en premier,
           y compris en plein écran. Si le navigateur consomme la touche pour en
           sortir, l'événement ne nous parvient pas et la visionneuse reste
           ouverte au retour — mais un clic n'importe où la referme. */
        if (imageLightbox && imageLightbox.classList.contains('is-open')) {
          closeImageLightbox();
          return;
        }
        /* En plein écran, Échap en sort — c'est le navigateur qui s'en charge.
           Fermer la modale par-dessus renverrait l'élève à la page d'exercices
           alors qu'il ne demandait qu'à revenir à la fenêtre. */
        if (document.fullscreenElement) return;
        for (const [id, close] of MODAL_CLOSERS) {
          const el = document.getElementById(id);
          if (el && el.classList.contains('modal-open')) { close(); return; }
        }
      });

      function logLanguageToggle(view) {
        if (window.logEvent) window.logEvent('statement_language_toggled', { level: currentLevel, exerciseId: currentExercise, subQuestion: currentSubQuestion, view: view });
      }

      btnStatementEn.addEventListener('click', () => { logLanguageToggle('en'); handleStatementMode('en'); });
      btnStatementFr.addEventListener('click', () => {
        if (!statementFrWrap.classList.contains('is-fr-locked')) { logLanguageToggle('fr'); handleStatementMode('fr'); }
      });
      btnCorrectionEn.addEventListener('click', () => { logLanguageToggle('corr_en'); handleCorrectionMode('corr_en'); });
      btnCorrectionFr.addEventListener('click', () => {
        if (!correctionFrWrap.classList.contains('is-fr-locked')) { logLanguageToggle('corr_fr'); handleCorrectionMode('corr_fr'); }
      });

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

        const GAMES = {
          dragAndDrop: ['dnd-modal', openDndModal],
          matchPairs: ['memory-modal', openMemoryModal],
          sorting: ['sorting-modal', openSortingModal],
          multipleChoice: ['qcm-modal', openQCMModal],
          fillBlanks: ['fitb-modal', openFitbModal]
        };

        const game = GAMES[typeKey];
        if (!game) {
          openInteractiveModal(typeKey, title);
          return;
        }

        const [modalId, openGame] = game;

        /* Deux raisons de n'avoir rien à montrer, et deux messages distincts :
           les données n'ont pas chargé, ou ce jeu n'a pas encore d'exercices.
           Dans les deux cas la modale s'ouvre quand même, plutôt que de laisser
           le bouton sans effet — un bouton qui ne réagit pas ne se distingue
           pas d'un bouton cassé. */
        const list = (interactiveData && interactiveData[typeKey]) || [];
        if (interactiveDataFailed) {
          showGameNotice(modalId, LOAD_ERROR_TEXT, true);
        } else if (!list.length) {
          showGameNotice(modalId, L.gameUnderConstruction);
        } else {
          clearGameNotice(modalId);
          openGame();
        }
      });

      // Même règle que la modale d'exercice : seule la croix ferme.
      interactiveModalClose.addEventListener('click', closeInteractiveModal);

      document.getElementById('dnd-modal-close').addEventListener('click', closeDndModal);

      /* Plein écran réel des jeux. C'est de loin ce qui rend le plus de place :
         on récupère la barre d'onglets et les favoris du navigateur, qu'une
         modale ne peut pas atteindre autrement. Le bouton ne fait que rendre le
         geste accessible à l'élève qui ne connaît pas la touche dédiée du
         Chromebook — et il l'appelle, là où une touche ne se devine pas.
         C'est la carte qui passe en plein écran, pas la surcouche : elle occupe
         alors l'écran entier, sans le cadre blanc qui rappelait qu'une page
         existe derrière. Le gain n'est pas tant en pixels (5% sur chaque axe,
         soit ~11% de surface) qu'en attention. */
      const fullscreenButtons = document.querySelectorAll('.modal-fullscreen');

      function syncFullscreenButtons() {
        fullscreenButtons.forEach(btn => {
          // Chaque bouton ne reflète que sa propre modale : deux jeux ne sont
          // jamais ouverts ensemble, mais l'état doit rester juste au cas où.
          const isFull = document.fullscreenElement === btn.closest('.modal-card');
          /* L'état passe par une classe et non par un second glyphe : les
             caractères « sortir du plein écran » sont mal couverts par les
             polices et donneraient un carré vide sur certaines machines. */
          btn.classList.toggle('is-fullscreen', isFull);
          const label = isFull ? L.fullscreenExit : L.fullscreenEnter;
          btn.title = label;
          btn.setAttribute('aria-label', label);
        });
      }

      fullscreenButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
            return;
          }
          // Le bouton trouve sa propre modale : rien à câbler à l'ajout d'un jeu.
          const card = btn.closest('.modal-card');
          if (card && card.requestFullscreen) {
            // Le navigateur peut refuser (réglage, iframe) : l'échec ne doit pas
            // remonter dans la console de l'élève.
            card.requestFullscreen().catch(() => {});
          }
        });
      });

      /* L'état ne se déduit pas du clic : la touche dédiée du Chromebook et
         Échap sortent du plein écran sans passer par le bouton.
         Les jeux qui mesurent leurs éléments (plateau, cartes du memory) sont
         déjà rebranchés sur le redimensionnement, que le plein écran provoque. */
      document.addEventListener('fullscreenchange', () => {
        syncFullscreenButtons();
        /* Basculer pendant qu'une visionneuse est ouverte ou que les confettis
           tombent : les surcouches changent d'hôte pour rester visibles. */
        const host = overlayHost();
        if (imageLightbox) host.appendChild(imageLightbox);
        document.querySelectorAll('.confetti-canvas').forEach(c => host.appendChild(c));

        /* Chrome se réserve Échap pour sortir du plein écran : la frappe ne nous
           parvient jamais, on ne peut donc pas fermer la visionneuse d'abord.
           À défaut, on la referme en sortant — un seul appui produit ainsi un
           seul résultat lisible, au lieu de laisser une image ouverte
           par-dessus la fenêtre revenue à sa taille normale. */
        if (!document.fullscreenElement) closeImageLightbox();
      });
      syncFullscreenButtons();

      document.getElementById('memory-modal-close').addEventListener('click', closeMemoryModal);

      document.getElementById('sorting-modal-close').addEventListener('click', closeSortingModal);

      document.getElementById('qcm-modal-close').addEventListener('click', closeQCMModal);

      document.getElementById('fitb-modal-close').addEventListener('click', closeFitbModal);

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
          clearQcmProgress(quizData);
          const previousBest = getQcmBestScore(quizData);
          const isNewRecord = !previousBest || qcmScore > previousBest.score;
          if (isNewRecord) saveQcmBestScore(quizData, qcmScore, totalQuestions);
          qcmScoreScreenInfo = { isNewRecord, best: isNewRecord ? { score: qcmScore, total: totalQuestions } : previousBest };
          if (window.logEvent) {
            window.logEvent('qcm_quiz_completed', { quizTitle: quizData.quizTitle, score: qcmScore, total: totalQuestions });
          }
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

      /* Optional "explanation" key: one box after checking, right or wrong
         answer alike — its title ("Not quite!" / "Correct!") replaces the
         gentle-feedback line, keeping its kind tone, so the two are never stacked
         in a modal where every line counts. Without the key: unchanged. */
      if (qcmIsChecked) {
        const isWrong = qcmSelectedOptionIndex !== questionData.correctAnswer;
        const explanation = typeof questionData.explanation === 'string' ? questionData.explanation.trim() : '';
        if (explanation) {
          htmlStr += '<div class="qcm-explanation ' + (isWrong ? 'is-wrong' : 'is-right') + '">' +
            '<strong class="qcm-explanation-title">' + (isWrong ? L.qcmExplanationWrong : L.qcmExplanationRight) + '</strong> ' +
            richText(explanation) + '</div>';
        } else if (isWrong) {
          htmlStr += `<p class="qcm-gentle-feedback">${L.qcmGentleFeedback}</p>`;
        }
      }

      let actionDisabled = qcmSelectedOptionIndex === null ? 'disabled' : '';
      let actionText = qcmIsChecked ? L.nextQuestion : L.checkAnswer;
      htmlStr += '<button id="qcm-action-btn" class="qcm-action-btn" ' + actionDisabled + '>' + actionText + '</button>';

      qcmContent.innerHTML = htmlStr;

      // Même visionneuse que les exercices classiques : l'image reste petite
      // dans la modale pour laisser la place aux options, la lecture fine se
      // fait en plein écran.
      const qcmImg = qcmContent.querySelector('.qcm-question-image');
      if (qcmImg) {
        qcmImg.title = L.enlargeHint;
        qcmImg.addEventListener('click', () => openImageLightbox(qcmImg.src, qcmImg.alt));
      }

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
          const correct = qcmSelectedOptionIndex === questionData.correctAnswer;
          if (correct) {
            qcmScore++;
            qcmStreak++;
          } else {
            qcmStreak = 0;
          }
          if (window.logEvent) {
            window.logEvent('qcm_answer_checked', {
              quizTitle: quizData.quizTitle,
              questionIndex: qcmCurrentQuestionIndex,
              correct: correct
            });
          }
          renderQCM(quizData);
        });
      } else {
        actionBtn.addEventListener('click', () => {
          qcmCurrentQuestionIndex++;
          qcmSelectedOptionIndex = null;
          qcmIsChecked = false;
          if (qcmCurrentQuestionIndex < totalQuestions) saveQcmProgress(quizData);
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

      document.getElementById('qcm-modal-title').textContent = exercise.quizTitle || L.qcmDefaultTitle;

      const instrContainer = document.getElementById('qcm-instructions-container');
      if (exercise.instructions) {
        instrContainer.textContent = exercise.instructions;
        instrContainer.style.display = 'block';
      } else {
        instrContainer.textContent = '';
        instrContainer.style.display = 'none';
      }

      /* L'ordre d'affichage est calculé, celui du fichier ne sert qu'à désigner la
         bonne réponse — toujours la première, convention posée par igames.html.
         L'indice est recalculé après réordonnancement, quel qu'il soit. */
      exercise.questions.forEach(q => {
        const pairs = q.options.map((opt, i) => ({ opt, correct: i === q.correctAnswer }));
        const ordered = qcmOrderOptions(pairs);
        q.options = ordered.map(p => p.opt);
        q.correctAnswer = ordered.findIndex(p => p.correct);
      });

      const savedProgress = getQcmProgress(exercise);
      if (savedProgress) {
        renderQcmResumePrompt(exercise, savedProgress);
      } else {
        renderQCM(exercise);
      }
    }

    // Shown instead of question 1 when a checkpoint (see saveQcmProgress) exists
    // for this quiz — lets the student choose rather than silently resuming
    // (the quiz content may have changed) or silently discarding their progress.
    function renderQcmResumePrompt(quizData, savedProgress) {
      const qcmContent = document.getElementById('qcm-content');
      const qcmModalCard = document.querySelector('.qcm-modal-card');
      if (qcmModalCard) qcmModalCard.classList.remove('qcm-has-image');
      const totalQuestions = quizData.questions.length;

      qcmContent.innerHTML = `
        <div class="qcm-score-screen">
          <h3>${L.qcmResumeTitle}</h3>
          <p>${L.qcmResumeSubtitle(savedProgress.questionIndex + 1, totalQuestions)}</p>
          <div class="qcm-resume-actions">
            <button id="qcm-resume-btn" class="qcm-choice-btn">${L.qcmResumeBtn}</button>
            <button id="qcm-restart-btn" class="qcm-choice-btn">${L.qcmRestartBtn}</button>
          </div>
        </div>
      `;

      document.getElementById('qcm-resume-btn').addEventListener('click', () => {
        qcmCurrentQuestionIndex = savedProgress.questionIndex;
        qcmScore = savedProgress.score;
        qcmStreak = savedProgress.streak;
        renderQCM(quizData);
      });

      document.getElementById('qcm-restart-btn').addEventListener('click', () => {
        clearQcmProgress(quizData);
        renderQCM(quizData);
      });
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
      if (window.logEvent) {
        window.logEvent('fitb_completed', { quizTitle: exerciseData.quizTitle, mistakes: fitbMistakeCount });
      }

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

      /* Recalculé à chaque écoute, et non une fois pour toutes : un trou validé
         doit s'entendre avec son mot. C'est là tout l'intérêt de réécouter le
         texte une fois l'exercice terminé — la phrase se dit enfin en entier.
         Seuls les trous validés parlent : lire la sélection en cours reviendrait
         à souffler une réponse peut-être fausse. */
      function currentSpokenText() {
        return (exerciseData.text || '').replace(/\[blank(\d+)\]/g, (match, index) => {
          const select = document.querySelector(`#fitb-content .fitb-select[data-index="${index}"]`);
          if (select && select.classList.contains('correct') && select.value) return select.value;
          return 'blank';
        });
      }

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
          const utterance = new SpeechSynthesisUtterance(currentSpokenText());
          utterance.lang = L.speechLang;
          const voice = pickVoice(L.speechLang);
          if (voice) utterance.voice = voice;
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

    /* Toutes les listes déroulantes d'un texte adoptent la largeur de la plus
       large — c'est-à-dire celle qu'impose le mot le plus long de l'exercice,
       puisqu'un <select> se dimensionne sur sa plus longue option.
       Sans cela, le texte justifié serait doublement irrégulier : aux espaces
       étirés par la justification s'ajouteraient des trous de largeurs
       différentes selon la longueur des mots proposés. */
    function fitbSyncSelectWidths() {
      const selects = document.querySelectorAll('#fitb-content .fitb-select');
      if (!selects.length) return;

      // Remise à zéro d'abord : sinon on mesurerait la largeur déjà imposée.
      selects.forEach(select => { select.style.width = ''; });

      let widest = 0;
      selects.forEach(select => {
        widest = Math.max(widest, select.getBoundingClientRect().width);
      });
      if (widest <= 0) return;

      /* Quelques pixels de marge : une réponse juste passe en gras, ce qui
         élargit légèrement son texte après coup. */
      const target = Math.ceil(widest) + 6;
      selects.forEach(select => { select.style.width = target + 'px'; });
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
      fitbSyncSelectWidths();

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

      document.getElementById('fitb-modal-title').textContent = exercise.quizTitle || L.fitbDefaultTitle;

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

    /* Une valeur numérique, ou null si le texte n'en est pas une. La virgule est
       acceptée comme séparateur décimal : sur un site de sciences en Belgique
       francophone, « 0,5 » s'écrit ainsi bien plus souvent que « 0.5 ». */
    function qcmOptionAsNumber(text) {
      const trimmed = String(text == null ? '' : text).trim().replace(',', '.');
      if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return null;
      return Number(trimmed);
    }

    /* Une lettre isolée, majuscule, ou null. Les repères d'un schéma s'écrivent
       aussi bien A, B, C que 1, 2, 3 — les deux méritent le même traitement. */
    function qcmOptionAsLetter(text) {
      const trimmed = String(text == null ? '' : text).trim();
      return /^\p{L}$/u.test(trimmed) ? trimmed.toUpperCase() : null;
    }

    /* Des réponses qui désignent un repère — nombres ou lettres — se lisent dans
       l'ordre : présentées en désordre, elles obligent l'élève à parcourir la
       liste pour situer une valeur, ce qui n'a rien à voir avec ce que la
       question évalue.
       Le mélange ne perd rien au passage — sur une série ordonnée, la bonne
       réponse tombe aussi bien au début qu'à la fin, il n'y a pas de biais de
       position à corriger. Pour tout le reste, on continue de brasser. */
    function qcmOrderOptions(pairs) {
      const orderedBy = read => {
        if (pairs.length < 2 || pairs.some(p => read(p.opt) === null)) return null;
        return pairs.slice();
      };

      const numeric = orderedBy(qcmOptionAsNumber);
      if (numeric) {
        return numeric.sort((a, b) => qcmOptionAsNumber(a.opt) - qcmOptionAsNumber(b.opt));
      }

      const alphabetic = orderedBy(qcmOptionAsLetter);
      if (alphabetic) {
        return alphabetic.sort((a, b) =>
          qcmOptionAsLetter(a.opt).localeCompare(qcmOptionAsLetter(b.opt)));
      }

      return shuffleArray(pairs);
    }

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
      // La sortie du plein écran est centralisée dans updateBodyScrollLock.
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
      document.getElementById('dnd-modal-title').textContent = exercise.quizTitle || L.dndDefaultTitle;

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

      /* Le plateau est la seule image des jeux qui soit remplacée en place d'un
         jeu à l'autre : elle passe donc par le fondu, comme celle des exercices
         classiques. Ailleurs le contenu est reconstruit à neuf.
         swapImage ne fait rien si la source est identique, ce qui laisse le
         chemin « déjà chargée » ci-dessous fonctionner comme avant. */
      const bgImg = document.getElementById('dnd-bg-image');
      bgImg.onload = dndSyncBoardMetrics;
      /* Ici l'image n'illustre pas, elle EST le jeu : les zones de dépôt sont
         positionnées dessus. Sans elle il n'y a rien à faire, d'où un message
         explicite plutôt qu'un repli discret. */
      swapImage(bgImg, exercise.backgroundImage, () => {
        showLoadError(document.querySelector('.dnd-board-container'));
      });
      if (bgImg.complete) dndSyncBoardMetrics();

      // Reset reservoir
      const reservoir = document.getElementById('dnd-reservoir');
      reservoir.innerHTML = '';
      // L'étiquette sélectionnée vient d'être détruite avec le réservoir : sans
      // ceci, la référence survivrait et le prochain appui sur une zone
      // placerait un mot du jeu précédent.
      dndClearSelection();
      
      // Shuffle reservoir items
      const items = shuffleArray(exercise.reservoirItems || []);
      items.forEach(text => {
        const itemEl = document.createElement('div');
        itemEl.className = 'dnd-item';
        itemEl.textContent = text;
        itemEl.draggable = true;
        // Reachable by Tab, in reservoir (DOM) order — already the visual
        // reading order, since items are appended in the shuffled order
        // they're displayed in.
        itemEl.tabIndex = 0;
        itemEl.setAttribute('role', 'button');

        // HTML5 dragstart
        itemEl.addEventListener('dragstart', event => {
          event.dataTransfer.setData('text/plain', text);
          itemEl.classList.add('dragging');
        });
        itemEl.addEventListener('dragend', () => {
          itemEl.classList.remove('dragging');
        });

        // Toucher-toucher : un appui sélectionne l'étiquette, un second appui
        // sur la même la désélectionne. Le repère visuel est indispensable,
        // sinon l'élève ne sait pas qu'il « porte » quelque chose.
        itemEl.addEventListener('click', () => {
          if (dndSelectedItem === itemEl) { dndClearSelection(); return; }
          dndClearSelection();
          dndSelectedItem = itemEl;
          itemEl.classList.add('selected');
        });

        // Clavier seul : Entrée/Espace reproduisent exactement le clic
        // ci-dessus (même sélection, même classe .selected) plutôt que de
        // dupliquer la logique — un seul chemin à maintenir.
        dndBindKeyboardActivation(itemEl);

        reservoir.appendChild(itemEl);
      });

      // Reset drop zones on the board
      const board = document.getElementById('dnd-board');
      // Remove existing drop zones (keep only the bg image)
      const existingZones = board.querySelectorAll('.dnd-zone');
      existingZones.forEach(z => z.remove());

      // Create and position new drop zones, in reading order (top-to-bottom,
      // then left-to-right) rather than the JSON's authoring order — that's
      // what keeps Tab moving sensibly across the board image instead of
      // jumping around based on whatever order they were placed in the admin
      // tool. A sorted copy: exercise.dropZones itself (and each zone
      // object's identity) is untouched, only the creation/tab order here.
      const zonesInReadingOrder = exercise.dropZones
        .slice()
        .sort((a, b) => (a.y_pourcent - b.y_pourcent) || (a.x_pourcent - b.x_pourcent));

      zonesInReadingOrder.forEach((zone, zoneIdx) => {
        const zoneEl = document.createElement('div');
        zoneEl.className = 'dnd-zone';
        zoneEl.style.left = `${zone.x_pourcent}%`;
        zoneEl.style.top = `${zone.y_pourcent}%`;
        zoneEl.dataset.accepted = zone.acceptedText;
        zoneEl.dataset.index = zoneIdx;
        zoneEl.innerHTML = ``;
        // Reachable by Tab, right after the reservoir items. An empty zone
        // has no visible text of its own, so it needs an explicit label for
        // it to mean anything to a screen reader.
        zoneEl.tabIndex = 0;
        zoneEl.setAttribute('role', 'button');
        zoneEl.setAttribute('aria-label', L.dndZoneLabel(zoneIdx + 1));

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
          dndTryPlace(zoneEl, zone, event.dataTransfer.getData('text/plain'), exercise, reservoir);
        });

        // Second voie, pour le tactile : l'API de glisser HTML5 ci-dessus ne se
        // déclenche jamais au doigt. On touche l'étiquette puis la zone.
        // Le clic fonctionne aussi à la souris, sans gêner le glisser — un
        // glisser ne produit pas de clic.
        zoneEl.addEventListener('click', () => {
          if (!dndSelectedItem) return;
          const text = dndSelectedItem.textContent;
          dndClearSelection();
          dndTryPlace(zoneEl, zone, text, exercise, reservoir);
        });

        // Clavier seul : Entrée/Espace reproduisent le clic — sélectionner une
        // étiquette au clavier (Entrée dessus) puis Tab jusqu'à une zone et
        // Entrée à nouveau dépose, exactement comme un doigt qui touche
        // l'étiquette puis la zone.
        dndBindKeyboardActivation(zoneEl);

        board.appendChild(zoneEl);
      });
    }

    /* Cale l'image dans la hauteur disponible, puis publie sa largeur réelle
       dans --dnd-board-w pour que les zones de dépôt s'y proportionnent (voir
       .dnd-zone dans style.css).
       Mesuré en JS plutôt qu'avec container-type : la containment interdirait au
       plateau de tirer sa largeur de l'image, et il disparaîtrait. */
    function dndSyncBoardMetrics() {
      const bgImg = document.getElementById('dnd-bg-image');
      const board = document.getElementById('dnd-board');
      const container = document.querySelector('.dnd-board-container');
      if (!bgImg || !board) return;

      /* Le plateau était dimensionné par des maximums (max-width, max-height),
         qui ne savent que rétrécir : l'image restait donc à sa taille naturelle
         — 879×493px pour le premier jeu — quelle que soit la place disponible.
         C'est pourquoi le plein écran ne changeait rien.
         On calcule ici la mise à l'échelle « contain » et on l'applique en dur,
         ce qui permet aussi d'agrandir quand il reste de la place. */
      const nw = bgImg.naturalWidth;
      const nh = bgImg.naturalHeight;
      if (container && nw > 0 && nh > 0) {
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        if (cw > 0 && ch > 0) {
          /* Plafond d'agrandissement : au-delà, une photo de 570px de large
             devient franchement floue et on troque de la lisibilité contre de
             la surface. En pratique c'est la hauteur qui borne, pas ce plafond. */
          const scale = Math.min(cw / nw, ch / nh, 2);
          /* Taille posée sur l'image elle-même, au pixel près du rectangle
             ajusté : les zones de dépôt sont positionnées en pourcentage du
             plateau, qui épouse l'image. Un letterboxing les décalerait. */
          bgImg.style.width = Math.round(nw * scale) + 'px';
          bgImg.style.height = Math.round(nh * scale) + 'px';
        }
      }
      // Lu après le calage en taille : la largeur en dépend.
      const width = bgImg.getBoundingClientRect().width;
      if (width > 0) board.style.setProperty('--dnd-board-w', width + 'px');
    }

    // Étiquette actuellement « portée » par l'élève en mode toucher-toucher.
    let dndSelectedItem = null;

    function dndClearSelection() {
      if (dndSelectedItem) dndSelectedItem.classList.remove('selected');
      dndSelectedItem = null;
    }

    // Entrée/Espace déclenchent exactement le même clic que la souris/le
    // doigt — un seul point d'entrée logique (le listener 'click' déjà posé
    // sur l'élément) plutôt qu'une seconde implémentation à maintenir en
    // parallèle. Espace est empêché par défaut : sans ça la page défile.
    function dndBindKeyboardActivation(el) {
      el.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
          event.preventDefault();
          el.click();
        }
      });
    }

    // Le retour tactile (couleur, tremblement) est invisible pour qui utilise
    // un lecteur d'écran en plus du clavier — cette zone aria-live annonce
    // donc chaque tentative en mots, en plus (jamais à la place) du visuel
    // existant.
    function dndAnnounce(message) {
      const liveRegion = document.getElementById('dnd-live-region');
      if (liveRegion) liveRegion.textContent = message;
    }

    // Après une suppression qui retire l'étiquette actuellement focus (voir
    // dndTryPlace ci-dessous) : la suivante du réservoir s'il en reste une,
    // sinon la zone qui vient d'être remplie plutôt qu'un focus perdu sur un
    // nœud qui n'existe plus.
    function dndFocusAfterRemoval(reservoir, fallbackEl) {
      const nextItem = reservoir.querySelector('.dnd-item');
      if (nextItem) nextItem.focus();
      else if (fallbackEl) fallbackEl.focus();
    }

    /* Seul point d'entrée du placement, partagé par le glisser et le toucher :
       une divergence entre les deux voies produirait des règles de jeu
       différentes selon l'appareil. */
    function dndTryPlace(zoneEl, zone, text, exercise, reservoir) {
      if (!text || zoneEl.classList.contains('correct')) return;

      if (text === zone.acceptedText) {
        // Correct match! Bounce the zone and flash a checkmark that fades away.
        zoneEl.classList.add('correct', 'just-placed');
        zoneEl.innerHTML = `<span class='dnd-zone-text'>${text}</span><span class='dnd-zone-tick'>✓</span>`;
        // aria-label prime sur le contenu visuel pour le nom accessible d'un
        // élément : sans ceci, une zone déjà remplie continuerait à
        // s'annoncer juste "Drop zone 3" au clavier, sans dire ce qu'elle
        // contient désormais.
        zoneEl.setAttribute('aria-label', zoneEl.getAttribute('aria-label') + ': ' + text);
        setTimeout(() => {
          zoneEl.classList.remove('just-placed');
          const tick = zoneEl.querySelector('.dnd-zone-tick');
          if (tick) tick.remove();
        }, 700);
        dndAnnounce(L.dndCorrectPlacement);

        // If hideOnSuccess is true, remove from reservoir
        if (exercise.hideOnSuccess) {
          const itemsInReservoir = reservoir.querySelectorAll('.dnd-item');
          for (let item of itemsInReservoir) {
            if (item.textContent === text) {
              const wasFocused = document.activeElement === item;
              item.remove();
              if (wasFocused) dndFocusAfterRemoval(reservoir, zoneEl);
              break;
            }
          }
        }

        checkDndCompletion(exercise);
      } else {
        zoneEl.classList.add('incorrect');
        setTimeout(() => {
          zoneEl.classList.remove('incorrect');
        }, 1000);
        dndAnnounce(L.dndIncorrectPlacement);

        const items = reservoir.querySelectorAll('.dnd-item');
        items.forEach(item => {
          if (item.textContent === text) {
            item.classList.add('shake-error');
            setTimeout(() => item.classList.remove('shake-error'), 1000);
          }
        });

        dndMistakeCount++;
        const mistakesEl = document.getElementById('dnd-stat-mistakes');
        if (mistakesEl) mistakesEl.textContent = dndMistakeCount;
      }
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

        if (window.logEvent) {
          window.logEvent('dnd_completed', { quizTitle: exercise.quizTitle, mistakes: dndMistakeCount, timeSeconds: finalSeconds });
        }

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
      // Classe purement technique : elle permet de le retrouver pour le
      // déplacer si l'élève bascule en plein écran pendant l'animation.
      canvas.className = 'confetti-canvas';
      overlayHost().appendChild(canvas);

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

    /* Adapte la taille des cartes à la place disponible.
       Elles étaient figées à 135px : au-delà de deux rangées, la grille
       débordait et devait être défilée — ce qui vide le jeu de son sens, puisque
       mémoriser suppose de voir toutes les cartes en même temps.
       On retient la plus contraignante des deux dimensions, largeur ou hauteur,
       pour que la grille tienne toujours entièrement. */
    function memorySyncCardSize() {
      const container = document.querySelector('.memory-grid-container');
      const grid = document.getElementById('memory-grid');
      if (!container || !grid) return;

      const count = grid.querySelectorAll('.memory-card').length;
      if (!count) return;
      const cols = Number(grid.dataset.cols) || Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);

      const cs = getComputedStyle(container);
      const usableW = container.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const usableH = container.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const gap = window.innerWidth <= 640 ? 10 : 16;

      const byWidth = (usableW - (cols - 1) * gap) / cols;
      const byHeight = (usableH - (rows - 1) * gap) / rows;
      // Plafond à 135px : la taille d'origine, pour ne pas obtenir des cartes
      // démesurées sur grand écran.
      const size = Math.max(56, Math.min(135, Math.floor(Math.min(byWidth, byHeight))));

      grid.style.setProperty('--memory-card-size', size + 'px');
      grid.style.maxWidth = `${cols * size + (cols - 1) * gap}px`;
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
      document.getElementById('memory-modal-title').textContent = exercise.quizTitle || L.memoryDefaultTitle;

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
      // La largeur définitive est posée par memorySyncCardSize, une fois la
      // taille des cartes connue.
      grid.dataset.cols = String(bestCols);

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

      // Une fois les cartes en place : leur nombre et la place disponible sont
      // alors connus.
      memorySyncCardSize();
    }

    /* Choix explicite de la voix, même logique que dans vocabulary-engine.js.
       Toutes les machines n'ont pas de voix nl-BE : sur un poste qui n'a que
       nl-NL, laisser le navigateur décider peut aussi bien donner la voix
       néerlandaise que la voix par défaut du système — française ou anglaise,
       donc pire que rien. On descend explicitement : la variante demandée, puis
       n'importe quelle voix de la même langue, puis le choix du navigateur. */
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

    let memorySideHintTimer = null;

    function memoryShowSideHint() {
      const el = document.getElementById('memory-stat-result');
      if (!el) return;
      el.innerHTML = `<span class="memory-side-hint">${L.memorySameSide}</span>`;
      if (memorySideHintTimer) clearTimeout(memorySideHintTimer);
      memorySideHintTimer = setTimeout(() => {
        // Le message de victoire a pu occuper la place entre-temps : on ne
        // retire que ce qu'on a soi-même écrit.
        if (el.querySelector('.memory-side-hint')) el.innerHTML = '';
      }, 2500);
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
          /* La carte ne s'ouvre pas : les deux classes s'ajoutent et se retirent
             dans la même passe, le navigateur ne peint jamais l'état retourné.
             Vu de l'élève, le clic ne produit donc rien — d'où ce rappel, seul
             retour existant à ce moment-là. L'estompage des cartes de la même
             face (voir style.css) devrait le rendre rare. */
          card.classList.remove('flipped');
          memoryShowSideHint();
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

            if (window.logEvent) {
              window.logEvent('memory_completed', { quizTitle: exercise.quizTitle, moves: memoryMoveCount, timeSeconds: finalSeconds });
            }

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
      document.getElementById('sorting-modal-title').textContent = exercise.quizTitle || L.sortingDefaultTitle;

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
      /* La bande d'erreurs pleine largeur a disparu : le compteur se loge dans
         l'espace laissé libre à droite de la pioche, à hauteur de la carte que
         l'élève est en train de classer. Ne reste comme bande que le résultat de
         fin de partie, masqué tant qu'il n'y a rien à annoncer. */
      let sortingStatsBar = document.getElementById('sorting-stats-bar');
      if (sortingStatsBar) sortingStatsBar.remove();
      sortingStatsBar = document.createElement('div');
      sortingStatsBar.className = 'sorting-stats-bar';
      sortingStatsBar.id = 'sorting-stats-bar';
      sortingStatsBar.style.display = 'none';
      sortingStatsBar.innerHTML = `<div class="dnd-stat-result" id="sorting-stat-result"></div>`;
      sortingInstr.after(sortingStatsBar);

      /* Consigne à gauche de la carte, compteur à droite : la bande de la pioche
         est la seule zone où l'espace latéral est perdu, et ces deux éléments y
         encadrent la carte sans rien coûter en hauteur. La consigne, elle, doit
         bien être écrite quelque part — rien n'annonce autrement qu'on peut
         aussi bien toucher un bac que glisser la carte dedans. */
      const deckContainer = document.querySelector('.sorting-deck-container');
      let deckHint = document.getElementById('sorting-deck-hint');
      if (!deckHint) {
        deckHint = document.createElement('p');
        deckHint.id = 'sorting-deck-hint';
        deckHint.className = 'sorting-deck-hint';
        deckContainer.prepend(deckHint);
      }
      deckHint.textContent = L.sortingHint;

      let deckStat = document.getElementById('sorting-deck-stat');
      if (!deckStat) {
        deckStat = document.createElement('div');
        deckStat.id = 'sorting-deck-stat';
        deckStat.className = 'sorting-deck-stat';
        deckContainer.appendChild(deckStat);
      }
      deckStat.innerHTML = `<span class="sorting-stat-icon">❌</span>${L.errors} <span id="sorting-stat-mistakes">0</span>`;

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
          // Deux origines acceptées : une carte déjà classée qu'on déplace, ou
          // la carte active de la pioche qu'on vient déposer.
          const types = event.dataTransfer.types;
          if (types.includes('sorting-item-id') || types.includes('sorting-deck-card')) {
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
          if (event.dataTransfer.getData('sorting-deck-card')) {
            if (sortingDeckItems.length) handleSortItem(cat);
            return;
          }
          sortingMoveItem(
            event.dataTransfer.getData('source-bin-category'),
            event.dataTransfer.getData('sorting-item-id'),
            cat
          );
        });

        /* Le bac est la cible unique de toute l'interaction : on désigne
           l'endroit plutôt qu'une étiquette qui le représente. Il remplace la
           rangée de boutons de catégorie et vaut aussi bien au doigt qu'à la
           souris, l'API de glisser HTML5 ne se déclenchant pas au tactile. */
        bin.addEventListener('click', () => {
          // Priorité au déplacement d'une carte déjà placée : si l'élève en a
          // sélectionné une, c'est elle qu'il veut bouger, pas la suivante.
          if (sortingSelectedItem) {
            const { category, id } = sortingSelectedItem;
            sortingClearSelection();
            sortingMoveItem(category, id, cat);
            return;
          }
          if (sortingDeckItems.length) handleSortItem(cat);
        });

        binsContainer.appendChild(bin);
      });

      // Populate and shuffle Deck
      // Les bacs viennent d'être reconstruits : toute sélection en cours pointe
      // sur une carte du jeu précédent.
      sortingClearSelection();
      sortingDeckItems = shuffleArray(exercise.items.map(item => ({ ...item })));
      renderSortingDeck();
    }

    // Carte « portée » par l'élève en mode toucher-toucher.
    let sortingSelectedItem = null;

    function sortingClearSelection() {
      if (sortingSelectedItem && sortingSelectedItem.el) sortingSelectedItem.el.classList.remove('selected');
      sortingSelectedItem = null;
    }

    /* Seul point d'entrée du déplacement d'une carte entre deux bacs, partagé
       par le glisser et le toucher : deux copies finiraient par diverger. */
    function sortingMoveItem(sourceCategory, itemId, targetCategory) {
      if (!sourceCategory || !itemId || sourceCategory === targetCategory) return;
      const itemIndex = sortingSelections[sourceCategory].findIndex(i => String(i.id) === itemId);
      if (itemIndex === -1) return;
      const [movedItem] = sortingSelections[sourceCategory].splice(itemIndex, 1);
      sortingSelections[targetCategory].push(movedItem);
      // Les deux bacs sont reconstruits : la carte sélectionnée n'existe plus.
      sortingClearSelection();
      renderSortingBinContent(sourceCategory);
      renderSortingBinContent(targetCategory);
      if (sortingIsChecked) {
        sortingIsChecked = false;
        document.getElementById('btn-check-sorting').textContent = L.checkCategories;
      }
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
        // La classe permet au CSS de ne faire occuper toute la hauteur de la
        // pioche qu'aux cartes image : une carte texte doit rester compacte.
        card.classList.add('has-image');
        card.innerHTML = `<img src="${activeItem.content}" alt="Sorting Image" />`;
        // La pioche doit rester basse pour laisser voir les bacs : l'image y est
        // donc forcément petite. Le clic plein écran compense, comme ailleurs.
        const deckImg = card.querySelector('img');
        deckImg.title = L.enlargeHint;
        card.addEventListener('click', () => openImageLightbox(deckImg.src, deckImg.alt));
      } else {
        card.innerHTML = `<span>${activeItem.content}</span>`;
      }

      // Glisser vers un bac : c'est le geste attendu à la souris, désormais que
      // les boutons de catégorie ont disparu. Un type de données distinct permet
      // au bac de reconnaître une carte venant de la pioche.
      card.draggable = true;
      card.addEventListener('dragstart', event => {
        event.dataTransfer.setData('sorting-deck-card', '1');
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => card.classList.remove('dragging'));

      deck.appendChild(card);
    }

    /* renderSortingChoiceButtons a été supprimée : les bacs sont devenus la
       cible directe du placement, au clic comme au glisser. Le conteneur
       #sorting-choice-buttons subsiste dans les pages mais reste vide et masqué
       par le CSS. */

    function handleSortItem(category) {
      if (sortingDeckItems.length === 0) return;

      // Get first card
      const item = sortingDeckItems.shift();
      sortingSelections[category].push(item);

      // Render updated bin and deck
      renderSortingBinContent(category);
      renderSortingDeck();
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

          // Sélection au toucher. Réservée aux cartes non verrouillées : une
          // carte déjà validée ne doit pas pouvoir être déplacée.
          itemEl.addEventListener('click', event => {
            /* Tant que la pioche n'est pas vide, c'est la carte active que
               l'élève place : le clic doit atteindre le bac même s'il tombe sur
               une carte déjà posée. Viser entre les cartes d'un bac bien rempli
               relève sinon de l'adresse, pas du raisonnement. */
            if (sortingDeckItems.length) return;
            event.stopPropagation(); // sinon le clic remonte au bac et repose la carte au même endroit
            if (sortingSelectedItem && sortingSelectedItem.el === itemEl) { sortingClearSelection(); return; }
            sortingClearSelection();
            sortingSelectedItem = { id: String(item.id), category, el: itemEl };
            itemEl.classList.add('selected');
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
          checkBtn.style.display = 'none';

          const rank = getSortingRank(sortingMistakeCount);
          const previousBest = getSortingBestMistakes(exercise);
          const isNewRecord = previousBest === null || sortingMistakeCount < previousBest;
          if (isNewRecord) saveSortingBestMistakes(exercise, sortingMistakeCount);
          if (window.logEvent) {
            window.logEvent('sorting_completed', { quizTitle: exercise.quizTitle, mistakes: sortingMistakeCount });
          }
          const note = isNewRecord
            ? `🎉 ${L.newBestMistakes}`
            : (previousBest !== null ? L.bestMistakes(previousBest) : '');

          const resultEl = document.getElementById('sorting-stat-result');
          if (resultEl) {
            resultEl.innerHTML = `
              <span class="sorting-result-badge">${rank.emoji} ${rank.label}</span>
              ${note ? `<span class="sorting-result-note">${note}</span>` : ''}
            `;
            // La bande n'existe que pour ce moment-là : on la révèle maintenant.
            const bar = document.getElementById('sorting-stats-bar');
            if (bar) bar.style.display = '';
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
      }
    }

    /* ===== Préchargement des images =====
       Une image demandée pour la première fois au moment où l'élève arrive
       dessus se voit charger : soit la précédente reste affichée, soit la place
       reste vide. On lance donc les requêtes en avance, quand on sait ce dont
       l'élève aura besoin.
       Créer un objet Image et lui poser une source suffit à déclencher la
       requête. Mais on conserve ensuite l'objet lui-même, et pas seulement son
       adresse : sans référence, le ramasse-miettes peut le libérer, et il ne
       reste alors que le cache HTTP. Or GitHub Pages sert ses fichiers avec une
       durée de validité de dix minutes — au-delà, le navigateur redemande
       confirmation au serveur avant d'afficher, ce qui rend un aller-retour
       réseau au moment précis où l'on voulait n'en avoir aucun.
       Une référence retenue garde la ressource disponible pour toute la séance,
       sans réseau du tout. Le coût est de quelques mégaoctets pour la trentaine
       d'images d'un chapitre. */
    const preloadedImages = new Map();

    function preloadImages(sources) {
      sources.forEach(src => {
        // La Map évite aussi de relancer une requête déjà partie.
        if (!src || preloadedImages.has(src)) return;
        const img = new Image();
        img.src = src;
        preloadedImages.set(src, img);
      });
    }

    /* Un niveau à la fois : les exercices classiques en comptent une vingtaine
       par niveau, et l'élève n'en ouvre qu'un. */
    function levelImageSources(levelKey) {
      return (practiceData[levelKey] || [])
        .filter(item => item.image)
        .map(item => `assets/${item.image}`);
    }

    /* Les jeux, eux, ne dépendent d'aucun niveau : leurs images se préchargent
       en une fois, dès que interactive.json est lu. Elles sont peu nombreuses —
       une vingtaine tous jeux confondus — et la requête part après le rendu de
       la page, donc sans retarder ce que l'élève voit en premier. */
    function gameImageSources() {
      const data = interactiveData || {};
      const sources = [];

      (data.multipleChoice || []).forEach(quiz => {
        sources.push(quiz.image);
        (quiz.questions || []).forEach(q => sources.push(q.image));
      });
      (data.dragAndDrop || []).forEach(ex => sources.push(ex.backgroundImage));
      (data.fillBlanks || []).forEach(ex => sources.push(ex.image));
      (data.matchPairs || []).forEach(ex => {
        (ex.pairs || []).forEach(pair => {
          [pair.sideA, pair.sideB].forEach(sideData => {
            if (sideData && sideData.type === 'image') sources.push(sideData.content);
          });
        });
      });
      (data.sorting || []).forEach(ex => {
        (ex.items || []).forEach(item => {
          if (item && item.type === 'image') sources.push(item.content);
        });
      });

      return sources.filter(Boolean);
    }

    /* Remplacement en fondu, pour les seules images réutilisées d'un exercice au
       suivant : l'ancienne s'efface, la nouvelle réapparaît une fois chargée.
       Ailleurs — QCM, memory, sorting — le contenu est reconstruit à neuf à
       chaque fois, il n'y a pas d'image précédente à faire disparaître.
       L'égalité des sources est vérifiée en premier : renderExerciseContent est
       rappelé à chaque bascule de langue ou de sous-question, et sans cela
       l'image clignoterait sans avoir changé. */
    function swapImage(imgEl, src, onFail) {
      if (!imgEl || imgEl.getAttribute('src') === src) return;

      imgEl.classList.add('is-swapping');

      /* Trois sorties, parce qu'il y a trois façons d'en finir : l'image arrive,
         elle n'arrive pas, ou elle n'arrive jamais. Le dernier cas — requête
         suspendue sur un réseau coupé — n'émet aucun événement, et sans ce délai
         de garde l'image resterait invisible indéfiniment. Mieux vaut alors
         rendre la place, quitte à montrer une image cassée : l'élève voit qu'il
         y a un problème au lieu de fixer un vide. */
      let settled = false;
      const finish = failed => {
        if (settled) return;
        settled = true;
        clearTimeout(guard);
        imgEl.classList.remove('is-swapping');
        if (failed && typeof onFail === 'function') onFail();
      };

      const guard = setTimeout(() => finish(true), 8000);
      imgEl.addEventListener('load', () => finish(false), { once: true });
      imgEl.addEventListener('error', () => finish(true), { once: true });

      imgEl.src = src;
    }

    function showLoadError(container) {
      if (!container) return null;
      let el = container.querySelector(':scope > .load-error');
      if (!el) {
        el = document.createElement('p');
        el.className = 'load-error';
        el.textContent = LOAD_ERROR_TEXT;
        container.appendChild(el);
      }
      return el;
    }

    /* Message tenant lieu de jeu, affiché dans la modale plutôt que sur la page :
       c'est là que l'élève regarde après avoir cliqué, et cela évite d'encombrer
       une page d'accueil qui est le plus souvent en parfait état.
       Une classe sur le corps de la modale masque le reste de son contenu — plus
       sûr que de vider ce contenu, qui est reconstruit par les moteurs de jeu. */
    function gameModalBody(modalId) {
      return document.querySelector('#' + modalId + ' .modal-body');
    }

    function showGameNotice(modalId, text, isError) {
      const body = gameModalBody(modalId);
      if (!body) return;
      let el = body.querySelector(':scope > .game-notice');
      if (!el) {
        el = document.createElement('p');
        el.className = 'game-notice';
        body.prepend(el);
      }
      // Une panne et un jeu à venir n'appellent pas le même ton : l'une alerte,
      // l'autre informe.
      el.classList.toggle('is-error', !!isError);
      el.textContent = text;
      body.classList.add('has-notice');
      document.getElementById(modalId).classList.add('modal-open');
    }

    function clearGameNotice(modalId) {
      const body = gameModalBody(modalId);
      if (body) body.classList.remove('has-notice');
    }

    async function loadPracticeData() {
      try {
        const response = await fetch(practicePath + '?v=' + Date.now());
        if (!response.ok) throw new Error(`HTTP ${response.status} sur practice.json`);
        practiceData = await response.json();
      } catch (error) {
        console.error('Erreur lors du chargement de practice.json:', error);
        /* Un objet vide plutôt que null : practiceData est indexé sans précaution
           dans une dizaine d'endroits, et le laisser à null faisait lever une
           exception au premier clic sur un niveau — la modale se serait cassée
           avant même d'afficher le message ci-dessous. */
        /* Un objet vide plutôt que null : practiceData est indexé sans précaution
           dans une dizaine d'endroits, et le laisser à null faisait lever une
           exception au premier clic sur un niveau — la modale se serait cassée
           avant même d'afficher son message. */
        practiceData = {};
        practiceDataFailed = true;
      }

      try {
        const resInt = await fetch(interactivePath + '?v=' + Date.now());
        if (!resInt.ok) throw new Error(`HTTP ${resInt.status} sur interactive.json`);
        interactiveData = await resInt.json();
      } catch (error) {
        console.error('Erreur lors du chargement de interactive.json:', error);
        interactiveData = { multipleChoice: [], dragAndDrop: [], fillBlanks: [], matchPairs: [], sorting: [] };
        // Le message attend le clic de l'élève : il s'affichera dans la modale
        // du jeu qu'il a demandé, pas sur une page qui va le plus souvent bien.
        interactiveDataFailed = true;
      }

      preloadImages(gameImageSources());
    }

    // Lets another page (the fiche d'autoévaluation on resources.html, opened
    // in a new tab so it doesn't have to navigate itself) link straight to
    // one exercise instead of leaving the student to find it by hand.
    // Silently does nothing when the params are absent, malformed, or point
    // at a level/exercise that doesn't exist — a normal page load is
    // unaffected either way.
    function openFromDeepLink() {
      const params = new URLSearchParams(location.search);
      const levelKey = params.get('level');
      const exerciseId = parseInt(params.get('exercise'), 10);
      if (!levelKey || !practiceData[levelKey]) return;
      if (!practiceData[levelKey].some(item => item.id === exerciseId)) return;
      openModalAtExercise(levelKey, exerciseId);
    }

    // Met en évidence le niveau où reprendre. Aucun signet nulle part
    // (première visite) → Level 1 avec "Start". Sinon → le niveau touché en
    // dernier, avec "Continue" — un signet distinct par niveau, donc rouvrir
    // Level 1 puis revenir met bien en avant Level 1 à nouveau, pas le
    // dernier niveau vraiment travaillé.
    // Idempotent plutôt qu'à usage unique : rappelée à la fermeture de la
    // modale (voir closeModal) pour que le badge/"Continue" se mette à jour
    // tout de suite, sans attendre un rechargement de la page. Repart donc
    // toujours d'un état propre — sinon un badge posé au tour précédent
    // resterait collé sur l'ancien niveau en plus du nouveau.
    function applyLevelResumeUI() {
      const options = levelButtonsContainer.querySelectorAll('.level-option');
      options.forEach(btn => {
        btn.classList.remove('is-current-level');
        const badge = btn.querySelector('.level-badge');
        if (badge) badge.remove();
        const action = btn.querySelector('.level-action');
        if (action) action.textContent = L.levelActionStart;
      });

      const touchedLevel = readLastTouchedLevel();
      const currentLevelKey = (touchedLevel && practiceData[touchedLevel]) ? touchedLevel : 'level1';
      const savedExercise = readLastExercise(currentLevelKey);

      options.forEach(btn => {
        if (btn.dataset.level !== currentLevelKey) return;
        const action = btn.querySelector('.level-action');
        if (!action) return;
        btn.classList.add('is-current-level');
        action.textContent = savedExercise ? L.levelActionContinue : L.levelActionStart;
        const badge = document.createElement('span');
        badge.className = 'level-badge';
        badge.textContent = savedExercise ? L.levelBadgeContinue : L.levelBadgeStart;
        btn.prepend(badge);
      });
    }

    async function initPractice() {
      await loadPracticeData();
      bindEvents();
      initAnswerBox();
      applyLevelResumeUI();
      openFromDeepLink();
    }

    initPractice();
