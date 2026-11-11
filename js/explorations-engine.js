(function () {
  // Shared by every chapter's explorations.html. The fetch stays relative so
  // each chapter loads its own explorations.json without any inline config.
  //
  // Mise en page « paysage » : deux cartes l'une sous l'autre (Documentation,
  // Liens utiles), remplies de tuiles — titre, bouton court, description.
  // Les deux cartes ont le même nombre de colonnes, pour que les tuiles
  // restent alignées d'une carte à l'autre : 3 dès qu'une carte a 3
  // éléments (une seule rangée chacune), sinon 2 (4 éléments = 2 × 2, un
  // seul = une tuile et une place vide).

  // Une carte dont les tuiles ne tiennent pas dans sa hauteur : la police de
  // ses descriptions diminue pas à pas jusqu'à ce que tout tienne (mesuré,
  // pas supposé : la place dépend de l'écran et des textes).
  const DESC_MAX = 0.82; // rem
  const DESC_MIN = 0.6; // sur le Chromebook, rien ne descend sous 0,82 : plus bas, écran plus petit que prévu

  function tileHtml(href, title, description, external) {
    const label = external ? 'Ouvrir' : 'Lire';
    const icon = external ? ' <span class="exp-external-icon" aria-hidden="true">&#8599;</span>' : '';
    const type = external ? 'lien' : 'documentation';
    const plainTitle = String(title || '').replace(/<[^>]*>/g, '').replace(/"/g, '&quot;');
    return `
      <div class="exp-tile">
        <div class="exp-tile-head">
          <strong>${richText(title || '')}</strong>
          <a class="resource-button" href="${href}" target="_blank" rel="noopener" data-resource-type="${type}" aria-label="${label} : ${plainTitle}">${label}${icon}</a>
        </div>
        ${description ? `<p>${richText(description)}</p>` : ''}
      </div>
    `;
  }

  // Toutes les têtes de tuile (titre et bouton) prennent la hauteur de la
  // plus haute, dans les deux cartes : un titre sur deux lignes ne décale
  // plus son bouton ni sa description par rapport aux tuiles voisines.
  function alignHeads(grid) {
    grid.style.removeProperty('--exp-head-height');
    const heads = [...grid.querySelectorAll('.exp-tile-head')];
    const tallest = Math.max(0, ...heads.map(head => head.offsetHeight));
    if (tallest) grid.style.setProperty('--exp-head-height', tallest + 'px');
  }

  function fitDescriptions(grid) {
    alignHeads(grid);
    const cards = [...grid.querySelectorAll('.explorations-card')];
    const sizes = new Map(cards.map(card => [card, DESC_MAX]));
    const apply = card => card.style.setProperty('--exp-desc-size', sizes.get(card) + 'rem');
    cards.forEach(apply);
    const overflowing = () => cards.filter(card => card.scrollHeight > card.clientHeight + 1 && sizes.get(card) > DESC_MIN);
    for (let guard = 0; guard < 20; guard++) {
      const over = overflowing();
      if (!over.length) break;
      over.forEach(card => {
        sizes.set(card, Math.round((sizes.get(card) - 0.02) * 100) / 100);
        apply(card);
      });
    }
  }

  async function loadExplorations() {
    const grid = document.getElementById('explorations-grid');
    if (!grid) return;

    // One delegated listener for every documentation/lien-utile link ever
    // rendered here, rather than one per link — plain <a target="_blank">,
    // this only logs and never blocks the native navigation.
    grid.addEventListener('click', event => {
      const link = event.target.closest('a[data-resource-type]');
      if (link && window.logEvent) {
        const tile = link.closest('.exp-tile');
        window.logEvent('exploration_link_opened', {
          type: link.dataset.resourceType,
          label: tile ? tile.querySelector('strong').textContent.trim() : link.textContent.trim(),
          url: link.getAttribute('href')
        });
      }
    });

    try {
      // Cache-buster, comme practice-engine.js : GitHub Pages sert les fichiers
      // avec 10 minutes de durée de vie, et les élèves verraient sinon l'ancien
      // contenu après une correction faite depuis l'outil admin.
      const response = await fetch('./explorations.json?v=' + Date.now());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const docItems  = data.documentation?.items || [];
      const linkItems = data.liensUtiles?.items    || [];
      const cols = (docItems.length === 3 || linkItems.length === 3) ? 3 : 2;
      grid.style.setProperty('--exp-cols', cols);

      const docCard  = grid.querySelector('.doc-card');
      const linkCard = grid.querySelector('.links-card');

      docCard.querySelector('.exp-grid').innerHTML = docItems.length
        ? docItems.map(doc => tileHtml(
          `${data.documentation.basePath}/${encodeURIComponent(doc.file)}`,
          doc.title, doc.description, false)).join('')
        : '<p class="exp-empty">Aucun document pour le moment.</p>';

      linkCard.querySelector('.exp-grid').innerHTML = linkItems.length
        ? linkItems.map(link => tileHtml(link.url, link.title, link.description, true)).join('')
        : '<p class="exp-empty">Aucun lien pour le moment.</p>';

      fitDescriptions(grid);
      // La police Poppins change les largeurs : on remesure à son arrivée,
      // et quand la fenêtre change de taille.
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => fitDescriptions(grid));
      let resizeTimer = null;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => fitDescriptions(grid), 150);
      });
    } catch (error) {
      console.error(error);
      // Même classe et même message que dans les trois autres moteurs : une
      // panne se reconnaît partout de la même façon sur le site.
      grid.querySelector('.doc-card .exp-grid').innerHTML =
        '<div class="load-error">Erreur de chargement. Recharge la page, et préviens ton professeur si cela se reproduit.</div>';
    }
  }

  // Self-initialising, like practice-engine.js. The readyState guard makes the
  // script safe to move into <head> later; at the end of <body> it runs
  // immediately, exactly as the inline version did.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadExplorations);
  } else {
    loadExplorations();
  }
})();
