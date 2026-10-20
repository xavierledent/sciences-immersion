    /* QCM (« Multiple-choice questions ») de la page Practice.
       Chargé juste après practice-engine.js, dont il utilise les déclarations
       (libellés L, interactiveData, gameStorageId, outils communs des jeux) ;
       le moteur l'appelle depuis bindEvents et renderInteractiveContent. */

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

    // Clé commune au meilleur score et au point de reprise d'un QCM (voir
    // storage.js pour le format complet de la clé).

    function qcmStorageParts(quizData) {
      return [gameStorageId(quizData)];
    }

    function getQcmBestScore(quizData) {
      try {
        const raw = SiteStorage.data.get('qcmBestScore', qcmStorageParts(quizData));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (typeof parsed.score === 'number' && typeof parsed.total === 'number') return parsed;
      } catch (e) {}
      return null;
    }

    function saveQcmBestScore(quizData, score, total) {
      SiteStorage.data.set('qcmBestScore', qcmStorageParts(quizData), JSON.stringify({ score, total }));
    }

    // Mid-quiz checkpoint (index/score/streak only — not the individual answers
    // given) so a reload can offer to resume rather than always restarting at
    // question 1. Distinct key/lifecycle from qcmBestScore above: this one is
    // cleared as soon as the quiz is completed, that one never is.
    function getQcmProgress(quizData) {
      try {
        const raw = SiteStorage.data.get('qcmProgress', qcmStorageParts(quizData));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed.questionIndex !== 'number' || parsed.questionIndex <= 0) return null;
        // Guards against a quiz edited (fewer questions) since the checkpoint was saved.
        if (!quizData.questions || parsed.questionIndex >= quizData.questions.length) return null;
        return parsed;
      } catch (e) { return null; }
    }

    function saveQcmProgress(quizData) {
      SiteStorage.data.set('qcmProgress', qcmStorageParts(quizData), JSON.stringify({
        questionIndex: qcmCurrentQuestionIndex,
        score: qcmScore,
        streak: qcmStreak
      }));
    }

    function clearQcmProgress(quizData) {
      SiteStorage.data.remove('qcmProgress', qcmStorageParts(quizData));
    }

    function getQcmRank(score, total) {
      const pct = total > 0 ? score / total : 0;
      if (pct >= 0.9) return { emoji: '🥇', label: L.rankGold };
      if (pct >= 0.7) return { emoji: '🥈', label: L.rankSilver };
      if (pct >= 0.5) return { emoji: '🥉', label: L.rankBronze };
      return { emoji: '💪', label: L.rankKeepPracticing };
    }

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
