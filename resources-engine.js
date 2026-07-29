(function () {
  // Shared by every chapter's resources.html. The fetch stays relative so each
  // chapter loads its own resources.json without any inline config.
  // Resolved at init rather than at load time, so the readyState guard at the
  // bottom actually protects the whole script and not just the fetch.
  let grid = null;

  function createCard(title, content) {
    const card = document.createElement('article');
    card.className = 'section-card';
    card.innerHTML = `
      <h3>${richText(title)}</h3>
      ${content}
    `;
    return card;
  }

  function createVideoItem(video, basePath) {
    const embedUrl = video.embedUrl || `${basePath || ''}${video.youtubeId || ''}`;
    return `
      <div class="video-item">
        <div class="video-meta">
          <strong>${richText(video.title || '')}</strong>
        </div>
        <iframe
          src="${embedUrl}"
          title="${video.title || 'Vidéo'}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
        <div class="video-desc">
          ${video.description ? `<p>${richText(video.description)}</p>` : ''}
        </div>
      </div>
    `;
  }

  function createPdfList(items, basePath) {
    if (!items || items.length === 0) {
      return '<p>Aucun document disponible pour le moment.</p>';
    }
    const listItems = items.map(item => {
      const fileUrl  = `${basePath || ''}/${encodeURIComponent(item.file || '')}`;
      const descHtml = item.description ? `<p>${richText(item.description)}</p>` : '';
      return `<li><a href="${fileUrl}" target="_blank" rel="noopener">${richText(item.label || 'Document')}</a>${descHtml}</li>`;
    }).join('');
    return `<ul class="resource-list">${listItems}</ul>`;
  }

  function createAutoEvaluationContent(data) {
    if (!data) return '<p>Fiche indisponible.</p>';
    const items = data.items?.length ? data.items
      : (data.file ? [{ title: data.title, description: data.description, file: data.file }] : []);
    if (!items.length) return '<p>Fiche indisponible.</p>';
    const blocks = items.map((item, i) => {
      const fileUrl  = `${data.basePath || ''}/${encodeURIComponent(item.file || '')}`;
      const label    = item.title || "Fiche d'autoévaluation";
      const rawDesc  = item.description || '';
      const descHtml = rawDesc ? `<p style="margin:0 0 10px">${richText(rawDesc)}</p>` : '';
      return `<div>${descHtml}<a class="resource-button" href="${fileUrl}" target="_blank" rel="noopener">${richText(label)}</a></div>`;
    }).join('');
    return `<div class="autoeval-section"><div style="display:flex;flex-direction:column;gap:12px">${blocks}</div></div>`;
  }

  function createMindmapContent(data, fallbackPath) {
    if (!data) return '<p>Modèle indisponible.</p>';
    const path  = data.basePath || fallbackPath || '';
    const items = data.items?.length ? data.items
      : (data.file ? [{ title: data.title, description: data.description, file: data.file }] : []);
    if (!items.length) return '<p>Modèle indisponible.</p>';
    const blocks = items.map((item, i) => {
      const fileUrl  = `${path}/${encodeURIComponent(item.file || '')}`;
      const label    = item.title || 'Modèle général';
      const rawDesc  = (item.description || '').replace('Téléchargez ce modèle', 'Télécharger ces modèles');
      const descHtml = rawDesc ? `<p style="margin:0 0 10px">${richText(rawDesc)}</p>` : '';
      return `<div>${descHtml}<a class="resource-button" href="${fileUrl}" target="_blank" rel="noopener">${richText(label)}</a></div>`;
    }).join('');
    return `<div class="mindmap-section"><div style="display:flex;flex-direction:column;gap:12px">${blocks}</div></div>`;
  }

  function showError(message) {
    grid.innerHTML = `<div class="note-box"><p>${message}</p></div>`;
  }

  async function loadResources() {
    grid = document.getElementById('resources-grid');
    if (!grid) return;
    try {
      // Cache-buster, comme practice-engine.js : GitHub Pages sert les fichiers
      // avec 10 minutes de durée de vie, et les élèves verraient sinon l'ancien
      // contenu après une correction faite depuis l'outil admin.
      const response = await fetch('./resources.json?v=' + Date.now());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      // 1. Création de la carte "Fiches outils" (colonne de gauche)
      const fo = data.fichesOutils;
      const foDescHtml = fo?.description ? `<p style="margin:0 0 14px">${richText(fo.description)}</p>` : '';
      const fichesOutilsSection = createCard(
        fo?.title || "Fiches outils",
        foDescHtml + createPdfList(fo?.items || [], fo?.basePath || '')
      );

      // 2. Création de la carte autonome "Fiche d'autoévaluation"
      const ficheAutoEvaluationSection = createCard(
        "Fiche d'autoévaluation",
        createAutoEvaluationContent(data.ficheAutoEvaluation)
      );

      // 3. Création de la carte autonome "Modèles mindmap"
      const fallbackPath = data.ficheAutoEvaluation ? data.ficheAutoEvaluation.basePath : '';
      const mindmapSection = createCard(
        "Modèles mindmap",
        createMindmapContent(data.mindmap, fallbackPath)
      );

      // --- STRUCTURATION DE LA COLONNE DE DROITE ---
      // On solidarise les cartes d'autoévaluation et de mindmap dans une colonne flexbox
      const rightColumnContainer = document.createElement('div');
      rightColumnContainer.className = 'resources-right-col';
      rightColumnContainer.style.display = 'flex';
      rightColumnContainer.style.flexDirection = 'column';
      rightColumnContainer.style.gap = '20px'; // Garde le même espace vertical qu'entre les autres blocs

      // On insère les deux cartes à l'intérieur du conteneur de droite
      rightColumnContainer.append(ficheAutoEvaluationSection, mindmapSection);

      // 4. Création de la carte "Vidéos" (qui prendra toute la largeur en bas)
      const hasVideos = data.videos && data.videos.items && data.videos.items.length;
      const videosSection = createCard(
        (data.videos && data.videos.title) || "Vidéos",
        hasVideos
          ? `<div class="video-list">${data.videos.items.map(video => createVideoItem(video, data.videos.basePath)).join('')}</div>`
          : '<p>Aucune vidéo disponible pour le moment.</p>'
      );
      videosSection.classList.add('full-width');

      // Nettoyage et injection finale bien ordonnée
      grid.innerHTML = '';
      grid.append(fichesOutilsSection, rightColumnContainer, videosSection);

    } catch (error) {
      console.error(error);
      showError('Impossible de charger les ressources depuis resources.json. Vérifiez la présence du fichier ou ouvrez la console de votre navigateur (F12) pour voir l\'erreur.');
    }
  }

  // Self-initialising, like practice-engine.js. The readyState guard makes the
  // script safe to move into <head> later; at the end of <body> it runs
  // immediately, exactly as the inline version did.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadResources);
  } else {
    loadResources();
  }
})();
