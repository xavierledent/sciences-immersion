    /* Glisser-déposer (« Drag and drop ») de la page Practice.
       Chargé juste après practice-engine.js, dont il utilise les déclarations
       (libellés L, interactiveData, gameStorageId, outils communs des jeux) ;
       le moteur l'appelle depuis bindEvents et le préchargement des images. */

    // Drag and Drop Challenge JavaScript logic
    let currentDndExerciseIndex = 0;

    // Stopwatch (counts up, no pressure) + live mistake count for the current attempt.
    let dndTimerIntervalId = null;
    let dndStartTime = 0;
    let dndMistakeCount = 0;

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

    function getDndBestStat(exercise, stat) {
      const raw = SiteStorage.data.get('dndBest', [gameStorageId(exercise), stat]);
      if (raw === null) return null;
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    }

    function saveDndBestStat(exercise, stat, value) {
      SiteStorage.data.set('dndBest', [gameStorageId(exercise), stat], String(value));
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
      // Les étiquettes de ce jeu changent la hauteur du réservoir : l'image,
      // peut-être déjà calée plus haut avec celles du jeu précédent, se recale.
      dndSyncBoardMetrics();

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
    /* Crans de taille des étiquettes, du normal au plus compact. Le rembourrage
       vertical ne bouge pas : la hauteur d'une étiquette reste une cible
       confortable au doigt. 13px est le plancher, au-delà le texte devient trop
       petit pour des élèves de 12 ans sur Chromebook. */
    const DND_ITEM_STEPS = [
      { font: '1rem', padX: '20px', gap: '12px' },
      { font: '0.9375rem', padX: '14px', gap: '10px' },
      { font: '0.875rem', padX: '12px', gap: '8px' },
      { font: '0.8125rem', padX: '10px', gap: '6px' }
    ];

    /* Plus grand cran qui tient les étiquettes sur une seule ligne, mesuré sur
       les étiquettes réellement affichées. Un seul cran pour tout le jeu, pour
       qu'aucune étiquette ne paraisse plus importante qu'une autre. Si même le
       plus petit ne suffit pas, il reste appliqué et les étiquettes passent sur
       deux lignes. Doit précéder le calage de l'image, dont la hauteur
       disponible dépend de celle du réservoir. */
    function dndFitReservoir() {
      const reservoir = document.getElementById('dnd-reservoir');
      if (!reservoir || reservoir.clientWidth === 0) return;
      const items = Array.from(reservoir.querySelectorAll('.dnd-item'));
      if (!items.length) return;
      for (const step of DND_ITEM_STEPS) {
        reservoir.style.setProperty('--dnd-item-font', step.font);
        reservoir.style.setProperty('--dnd-item-pad-x', step.padX);
        reservoir.style.setProperty('--dnd-item-gap', step.gap);
        const firstTop = items[0].offsetTop;
        if (items.every(item => item.offsetTop === firstTop)) return;
      }
    }

    function dndSyncBoardMetrics() {
      const bgImg = document.getElementById('dnd-bg-image');
      const board = document.getElementById('dnd-board');
      const container = document.querySelector('.dnd-board-container');
      if (!bgImg || !board) return;
      dndFitReservoir();

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
