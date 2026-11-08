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
    // Mascotte des questions sans image : une par quiz, tirée à son ouverture.
    let qcmMascot = '';
    // Disposition de la question en cours (marge haute, taille de l'image,
    // resserrement), mesurée avant « Check Answer » et gardée après : les
    // options et le bouton ne bougent pas (voir syncQcmLayout).
    let qcmLayout = null;

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
      if (pct >= 0.9) return { icon: 'gold', label: L.rankGold };
      if (pct >= 0.7) return { icon: 'silver', label: L.rankSilver };
      if (pct >= 0.5) return { icon: 'bronze', label: L.rankBronze };
      return { icon: 'up', label: L.rankKeepPracticing };
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
          bestHtml = `<p class="qcm-best-note qcm-best-note-new">${gameReward('record')} ${L.newPersonalBest}</p>`;
        } else if (qcmScoreScreenInfo.best) {
          bestHtml = '<p class="qcm-best-note">' + L.yourBest + ' ' + qcmScoreScreenInfo.best.score + ' / ' + qcmScoreScreenInfo.best.total + '</p>';
        }
        qcmContent.innerHTML = `
          <div class="qcm-score-screen">
            <div class="qcm-rank-badge">${gameReward(rank.icon)}</div>
            <h3>${L.quizCompleted}</h3>
            <p>${L.yourScore} <strong>${qcmScore} / ${totalQuestions}</strong></p>
            <p class="qcm-rank-label">${rank.label}</p>
            ${bestHtml}
          </div>
        `;
        if (qcmModalCard) qcmModalCard.classList.remove('qcm-has-image', 'qcm-text');
        return;
      }

      const questionData = quizData.questions[qcmCurrentQuestionIndex];
      const progressPercent = ((qcmCurrentQuestionIndex) / totalQuestions) * 100;

      let htmlStr = '<div class="qcm-progress-row">';
      htmlStr += '<span class="qcm-progress-count">' + L.qcmQuestionCount(qcmCurrentQuestionIndex + 1, totalQuestions) + '</span>';
      htmlStr += '<div class="qcm-progress-container">';
      htmlStr += '<div class="qcm-progress-bar" style="width: ' + progressPercent + '%;"></div>';
      htmlStr += '</div>';
      if (qcmStreak >= 2) {
        htmlStr += '<div class="qcm-streak-pips">';
        htmlStr += '<span class="qcm-streak-pips-label">' + gameReward('streak') + ' ' + qcmStreak + '</span>';
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

      if (qcmModalCard) {
        qcmModalCard.classList.toggle('qcm-has-image', !!imageToShow);
        qcmModalCard.classList.toggle('qcm-text', !imageToShow);
      }

      /* On lit à gauche, on répond à droite, pour toutes les questions : à
         gauche la question en grand, puis l'image (celle de la question,
         sinon celle du quiz) ou, sans image, la mascotte du quiz ; à droite
         les options, le bouton, puis l'explication après « Check Answer ». */
      htmlStr += '<div class="qcm-layout"><div class="qcm-side">';
      htmlStr += '<div class="qcm-textside-question">' + richText(questionData.question) + '</div>';
      if (imageToShow) {
        htmlStr += '<img src="' + imageToShow + '" alt="" class="qcm-question-image" />';
      } else if (qcmMascot) {
        htmlStr += '<img src="' + qcmMascot + '" alt="" class="qcm-mascot" />';
      }
      htmlStr += '</div><div class="qcm-main">';
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

      // Le bouton d'abord : « Check Answer » devient « Next question » à la
      // même place ; l'explication apparaît juste dessous, là où est l'œil.
      let actionDisabled = qcmSelectedOptionIndex === null ? 'disabled' : '';
      let actionText = qcmIsChecked ? L.nextQuestion : L.checkAnswer;
      htmlStr += '<button id="qcm-action-btn" class="qcm-action-btn" ' + actionDisabled + '>' + actionText + '</button>';

      /* Optional "explanation" key: one box after checking, right or wrong
         answer alike — its title ("Not quite!" / "Correct!") replaces the
         gentle-feedback line, keeping its kind tone, so the two are never stacked
         in a modal where every line counts. Without the key: unchanged. */
      const explanation = typeof questionData.explanation === 'string' ? questionData.explanation.trim() : '';
      if (!qcmIsChecked) {
        // Avant « Check Answer » : sa place, invisible, sous le bouton. Elle
        // compte dans la hauteur du contenu (syncQcmLayout) : la disposition
        // est choisie d'avance, rien ne bouge quand l'explication apparaît.
        htmlStr += explanation
          ? '<div class="qcm-explanation qcm-feedback-ghost" aria-hidden="true"><strong class="qcm-explanation-title">' +
            L.qcmExplanationWrong + '</strong> ' + richText(explanation) + '</div>'
          : `<p class="qcm-gentle-feedback qcm-feedback-ghost" aria-hidden="true">${L.qcmGentleFeedback}</p>`;
      } else {
        const isWrong = qcmSelectedOptionIndex !== questionData.correctAnswer;
        if (explanation) {
          htmlStr += '<div class="qcm-explanation ' + (isWrong ? 'is-wrong' : 'is-right') + '">' +
            '<strong class="qcm-explanation-title">' + (isWrong ? L.qcmExplanationWrong : L.qcmExplanationRight) + '</strong> ' +
            richText(explanation) + '</div>';
        } else if (isWrong) {
          htmlStr += `<p class="qcm-gentle-feedback">${L.qcmGentleFeedback}</p>`;
        }
      }

      htmlStr += '</div></div>';

      qcmContent.innerHTML = htmlStr;
      syncQcmLayout();

      // Même visionneuse que les exercices classiques : l'image reste petite
      // dans la modale pour laisser la place aux options, la lecture fine se
      // fait en plein écran.
      // Image ou mascotte pas encore chargée : sa hauteur compte dans la
      // place du contenu, on remesure à son arrivée.
      const qcmPicture = qcmContent.querySelector('.qcm-question-image, .qcm-mascot');
      if (qcmPicture && !qcmPicture.complete) {
        qcmPicture.addEventListener('load', () => { if (!qcmIsChecked) syncQcmLayout(); }, { once: true });
      }

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

    /* Positions mesurées (pas supposées : elles dépendent de l'écran, de la
       langue et de la longueur des textes).
       - À gauche, l'image (ou la mascotte) prend la hauteur qui reste sous la
         question ; la mascotte est cachée s'il reste moins de 100 px (jamais
         en icône), et plafonnée à 260 px.
       - À droite, le contenu compte la place de l'explication (invisible
         avant « Check Answer », .qcm-feedback-ghost) : s'il ne tient pas,
         options et explication se resserrent dès le départ.
       - Le contenu des deux colonnes commence au tiers de la place libre (le
         plus haut des deux compte), plus près du regard que le milieu.
       - Mesuré avant « Check Answer » et réappliqué après (la fenêtre est
         redessinée) : rien ne bouge quand l'explication apparaît. */
    const QCM_NARROW = window.matchMedia('(max-width: 899px)');

    function syncQcmLayout() {
      const content = document.getElementById('qcm-content');
      const layout = content && content.querySelector('.qcm-layout');
      if (!layout || !document.getElementById('qcm-modal').classList.contains('modal-open')) return;
      const side = layout.querySelector('.qcm-side');
      const main = layout.querySelector('.qcm-main');
      const question = side.querySelector('.qcm-textside-question');
      const picture = side.querySelector('.qcm-question-image, .qcm-mascot');
      const apply = l => {
        layout.style.setProperty('--qcm-top', l.top + 'px');
        if (picture) picture.style.maxHeight = l.pictureMax == null ? '' : l.pictureMax + 'px';
        side.classList.toggle('qcm-no-picture', l.noPicture);
        main.classList.toggle('is-tight', l.tight);
      };

      // Petit écran : les colonnes s'empilent et la page défile (CSS seul).
      if (QCM_NARROW.matches) {
        apply({ top: 0, pictureMax: null, noPicture: false, tight: false });
        return;
      }

      if (!qcmIsChecked || !qcmLayout) {
        // Sans transition pendant la mesure : les options (transition sur
        // toutes leurs propriétés) glissaient de leur taille normale à leur
        // taille resserrée à chaque toucher, toute la colonne avec elles.
        layout.classList.add('qcm-measuring');
        const l = { top: 0, pictureMax: null, noPicture: false, tight: false };
        apply(l);
        const height = layout.clientHeight;
        const gap = parseFloat(getComputedStyle(side).rowGap) || 0;
        if (picture) {
          const room = Math.max(0, height - question.offsetHeight - gap);
          l.pictureMax = picture.classList.contains('qcm-mascot') ? Math.min(260, room) : room;
          l.noPicture = picture.classList.contains('qcm-mascot') && l.pictureMax < 100;
          apply(l);
        }
        // Les rectangles sont à l'échelle de l'écran, clientHeight en pixels
        // CSS : la fenêtre peut être réduite d'un zoom hors plein écran
        // (fitModalWindows, moteur). Tout est ramené en pixels CSS.
        const scale = layout.getBoundingClientRect().height / height || 1;
        const start = side.getBoundingClientRect().top;
        const leftEnd = picture && !l.noPicture ? picture : question;
        const leftH = (leftEnd.getBoundingClientRect().bottom - start) / scale;
        const rightH = () => (main.lastElementChild.getBoundingClientRect().bottom - start) / scale;
        if (rightH() > height) { l.tight = true; apply(l); }
        l.top = Math.round(Math.max(0, height - Math.max(leftH, rightH())) / 3);
        qcmLayout = l;
      }
      apply(qcmLayout);
      if (layout.classList.contains('qcm-measuring')) {
        void layout.offsetHeight;
        layout.classList.remove('qcm-measuring');
      }
    }

    window.addEventListener('resize', () => {
      const modal = document.getElementById('qcm-modal');
      if (!modal || !modal.classList.contains('modal-open')) return;
      // Les positions gardées ne valent plus pour la nouvelle taille.
      qcmLayout = null;
      syncQcmLayout();
    });

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
        btn.textContent = L.quizTab(index + 1);
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
      qcmMascot = randomChapterMascot(qcmMascot);
      qcmLayout = null;

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
      if (qcmModalCard) qcmModalCard.classList.remove('qcm-has-image', 'qcm-text');
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
