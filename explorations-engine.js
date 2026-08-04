(function () {
  // Shared by every chapter's explorations.html. The fetch stays relative so
  // each chapter loads its own explorations.json without any inline config.
  async function loadExplorations() {
    try {
      // Cache-buster, comme practice-engine.js : GitHub Pages sert les fichiers
      // avec 10 minutes de durée de vie, et les élèves verraient sinon l'ancien
      // contenu après une correction faite depuis l'outil admin.
      const response = await fetch('./explorations.json?v=' + Date.now());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const docItems  = data.documentation?.items || [];
      const linkItems = data.liensUtiles?.items    || [];
      const count     = Math.max(docItems.length, linkItems.length);
      const grid      = document.getElementById('explorations-grid');
      const docCard   = grid.querySelector('.doc-card');
      const linksCard = grid.querySelector('.links-card');

      docCard.querySelectorAll('.exp-cell').forEach(el => el.remove());
      linksCard.querySelectorAll('.exp-cell').forEach(el => el.remove());

      // Header (row 1) + one row per item pair, shared across both subgridded cards.
      grid.style.gridTemplateRows = `auto repeat(${count}, auto)`;

      for (let i = 0; i < count; i++) {
        const doc  = docItems[i]  || null;
        const link = linkItems[i] || null;

        const docCell = document.createElement('div');
        docCell.className = 'exp-cell';
        if (doc) {
          const href = `${data.documentation.basePath}/${encodeURIComponent(doc.file)}`;
          docCell.innerHTML = `
            <a class="resource-button" href="${href}" target="_blank" rel="noopener">${richText(doc.title)}</a>
            ${doc.description ? `<p>${richText(doc.description)}</p>` : ''}
          `;
        }
        docCard.appendChild(docCell);

        const linkCell = document.createElement('div');
        linkCell.className = 'exp-cell';
        if (link) {
          linkCell.innerHTML = `
            <a class="resource-button" href="${link.url}" target="_blank" rel="noopener">${richText(link.title)} <span class="exp-external-icon" aria-hidden="true">&#8599;</span></a>
            ${link.description ? `<p>${richText(link.description)}</p>` : ''}
          `;
        }
        linksCard.appendChild(linkCell);
      }
    } catch (error) {
      console.error(error);
      // Même classe et même message que dans les trois autres moteurs : une
      // panne se reconnaît partout de la même façon sur le site.
      // grid-column:1/-1 fait toujours étendre le message sur toute la
      // largeur de la grille, seule mise en forme propre à ce contexte.
      document.getElementById('explorations-grid').insertAdjacentHTML('beforeend',
        '<div class="load-error" style="grid-column:1/-1">Erreur de chargement. Recharge la page, et préviens ton professeur si cela se reproduit.</div>');
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
