    /* Texte à trous (« Fill in the blanks ») de la page Practice.
       Chargé juste après practice-engine.js, dont il utilise les déclarations
       (libellés L, interactiveData, gameStorageId, outils communs des jeux) ;
       le moteur l'appelle depuis bindEvents et renderInteractiveContent. */

    // Fill in the Blanks: mistakes accumulated across attempts for the current text.
    let fitbMistakeCount = 0;

    function getFitbBestMistakes(exercise) {
      const raw = SiteStorage.data.get('fitbBest', [gameStorageId(exercise)]);
      if (raw === null) return null;
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    }

    function saveFitbBestMistakes(exercise, mistakes) {
      SiteStorage.data.set('fitbBest', [gameStorageId(exercise)], String(mistakes));
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
