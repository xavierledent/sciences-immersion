    /* Memory (« Match the pairs ») de la page Practice.
       Chargé juste après practice-engine.js, dont il utilise les déclarations
       (libellés L, interactiveData, gameStorageId, outils communs des jeux) ;
       le moteur l'appelle depuis bindEvents et le préchargement des images. */

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

    function getMemoryBestStat(exercise, stat) {
      const raw = SiteStorage.data.get('memoryBest', [gameStorageId(exercise), stat]);
      if (raw === null) return null;
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    }

    function saveMemoryBestStat(exercise, stat, value) {
      SiteStorage.data.set('memoryBest', [gameStorageId(exercise), stat], String(value));
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
