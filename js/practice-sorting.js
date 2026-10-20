    /* Jeu de tri (« Sorting challenge ») de la page Practice.
       Chargé juste après practice-engine.js, dont il utilise les déclarations
       (libellés L, interactiveData, gameStorageId, outils communs des jeux) ;
       le moteur l'appelle depuis bindEvents et le préchargement des images. */

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

    function getSortingBestMistakes(exercise) {
      const raw = SiteStorage.data.get('sortingBest', [gameStorageId(exercise)]);
      if (raw === null) return null;
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    }

    function saveSortingBestMistakes(exercise, mistakes) {
      SiteStorage.data.set('sortingBest', [gameStorageId(exercise)], String(mistakes));
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
