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

  function videoEmbedUrl(video, basePath) {
    return video.embedUrl || `${basePath || ''}${video.youtubeId || ''}`;
  }

  // Une seule vidéo affichée, à sa taille, quel que soit le nombre de vidéos :
  // empilées, elles rapetissaient à chaque ajout. Avec plusieurs vidéos, une
  // rangée de boutons numérotés (toujours une ligne, quels que soient le
  // nombre et la longueur des titres) choisit celle du lecteur ; le titre de
  // la vidéo choisie s'écrit au-dessus. Un seul lecteur, dont on change la
  // vidéo : un lecteur caché continuerait à jouer.
  const attr = text => String(text || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  function createVideoBlock(items, basePath) {
    const first = items[0];
    const tabs = items.length > 1
      ? `<div class="video-tabs">${items.map((video, i) =>
        `<button type="button" class="video-tab${i === 0 ? ' is-active' : ''}" data-video="${i}" aria-pressed="${i === 0}" aria-label="${attr(video.title)}">${i + 1}</button>`).join('')}</div>`
      : '';
    return `
      ${tabs}
      <div class="video-item">
        <strong class="video-title">${richText(first.title || '')}</strong>
        <div class="video-frame">
          <iframe
            src="${videoEmbedUrl(first, basePath)}"
            title="${attr(first.title || 'Vidéo')}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
        <p class="video-desc">${first.description ? richText(first.description) : ''}</p>
      </div>
    `;
  }

  function showVideo(card, video, basePath) {
    const frame = card.querySelector('.video-frame iframe');
    frame.src = videoEmbedUrl(video, basePath);
    frame.title = video.title || 'Vidéo';
    card.querySelector('.video-title').innerHTML = richText(video.title || '');
    card.querySelector('.video-desc').innerHTML = video.description ? richText(video.description) : '';
  }

  function createPdfList(items, basePath) {
    if (!items || items.length === 0) {
      return '<p>Aucun document disponible pour le moment.</p>';
    }
    const listItems = items.map(item => {
      const fileUrl  = `${basePath || ''}/${encodeURIComponent(item.file || '')}`;
      const descHtml = item.description ? `<p>${richText(item.description)}</p>` : '';
      return `<li><a href="${fileUrl}" target="_blank" rel="noopener" data-resource-type="fichesOutils">${richText(item.label || 'Document')}</a>${descHtml}</li>`;
    }).join('');
    return `<ul class="resource-list">${listItems}</ul>`;
  }

  // The classic printable PDF fiche only — the interactive online
  // self-assessment now lives on every chapter's own assessment.html
  // (autoeval-engine.js), reachable from the chapter nav / index, not from
  // this card anymore.
  function createAutoEvaluationContent(data) {
    if (!data) return '<p>Fiche indisponible.</p>';
    const descHtml = data.description ? `<p class="resource-desc">${richText(data.description)}</p>` : '';
    const pdfUrl = data.pdfFile ? `${data.basePath || ''}/${encodeURIComponent(data.pdfFile)}` : '';
    const pdfBtnHtml = pdfUrl
      ? `<a class="resource-button" href="${pdfUrl}" target="_blank" rel="noopener" data-resource-type="ficheAutoEvalPdf">Fiche d'autoévaluation (PDF)</a>`
      : '';
    return `${descHtml}<div class="resource-button-row">${pdfBtnHtml}</div>`;
  }

  function mindmapItems(data) {
    if (!data) return [];
    return data.items?.length ? data.items
      : (data.file ? [{ title: data.title, description: data.description, file: data.file }] : []);
  }

  // La carte ne montre que les boutons : la description des modèles (longue)
  // va dans le mode d'emploi (addMindmapHelp), faute de place sur l'écran.
  function createMindmapContent(data, fallbackPath) {
    const items = mindmapItems(data);
    if (!items.length) return '<p>Modèle indisponible.</p>';
    const path = data.basePath || fallbackPath || '';
    const blocks = items.map(item => {
      const fileUrl = `${path}/${encodeURIComponent(item.file || '')}`;
      const label   = item.title || 'Modèle général';
      return `<a class="resource-button" href="${fileUrl}" target="_blank" rel="noopener" data-resource-type="mindmap">${richText(label)}</a>`;
    }).join('');
    return `<div class="mindmap-section">${blocks}</div>`;
  }

  // Descriptions des modèles de mindmap (resources.json) dans le mode
  // d'emploi, avant le conseil du prof : un paragraphe par description,
  // précédé du titre du bloc (ou du modèle, s'il y en a plusieurs).
  function addMindmapHelp(data) {
    const box = document.querySelector('#help-modal .note-box');
    const described = mindmapItems(data).filter(item => item.description);
    if (!box || !described.length) return;
    const tip = box.querySelector('.note-box-tip');
    described.forEach(item => {
      const label = described.length > 1 ? (item.title || 'Modèle') : ((data && data.title) || 'Modèles de mindmap');
      const p = document.createElement('p');
      p.innerHTML = `<strong>${richText(label)} :</strong> ${richText(item.description)}`;
      box.insertBefore(p, tip);
    });
  }

  // Même classe et même message que dans practice-engine.js et
  // vocabulary-engine.js : une panne de chargement doit se reconnaître
  // partout sur le site, pas seulement dans les exercices.
  function showError() {
    grid.innerHTML = '<div class="load-error">Erreur de chargement. Recharge la page, et préviens ton professeur si cela se reproduit.</div>';
  }

  async function loadResources() {
    grid = document.getElementById('resources-grid');
    if (!grid) return;
    const illustration = grid.querySelector('.resources-illustration');

    // One delegated listener for every fiches-outils/autoeval-PDF/mindmap
    // link ever rendered into the grid, rather than one per link — they're
    // plain <a target="_blank">, so this only logs; it never blocks the
    // native navigation.
    grid.addEventListener('click', event => {
      const link = event.target.closest('a[data-resource-type]');
      if (link && window.logEvent) {
        window.logEvent('resource_link_opened', {
          type: link.dataset.resourceType,
          label: link.textContent.trim(),
          file: link.getAttribute('href')
        });
      }
    });

    try {
      // Cache-buster, comme practice-engine.js : GitHub Pages sert les fichiers
      // avec 10 minutes de durée de vie, et les élèves verraient sinon l'ancien
      // contenu après une correction faite depuis l'outil admin.
      const response = await fetch('./resources.json?v=' + Date.now());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      // 1. Création de la carte "Fiches outils" (colonne du milieu)
      const fo = data.fichesOutils;
      const foDescHtml = fo?.description ? `<p class="resource-desc">${richText(fo.description)}</p>` : '';
      const fichesOutilsSection = createCard(
        fo?.title || "Fiches outils",
        foDescHtml + createPdfList(fo?.items || [], fo?.basePath || '')
      );

      // 2 et 3. Colonne de droite : une seule carte en deux parties, la fiche
      // d'autoévaluation puis les modèles de mindmap (deux cartes ne tenaient
      // pas dans la hauteur du Chromebook avec la description des mindmaps).
      const fallbackPath = data.ficheAutoEvaluation ? data.ficheAutoEvaluation.basePath : '';
      const sideCard = document.createElement('article');
      sideCard.className = 'section-card resources-side-card';
      sideCard.innerHTML = `
        <section class="side-block">
          <h3>${richText((data.ficheAutoEvaluation && data.ficheAutoEvaluation.title) || "Autoévaluation par attendus")}</h3>
          ${createAutoEvaluationContent(data.ficheAutoEvaluation)}
        </section>
        <section class="side-block">
          <h3>${richText((data.mindmap && data.mindmap.title) || "Modèles de mindmap")}</h3>
          ${createMindmapContent(data.mindmap, fallbackPath)}
        </section>
      `;

      // 4. Carte "Vidéos" (colonne de gauche).
      const videoItems = (data.videos && data.videos.items) || [];
      const videosSection = createCard(
        (data.videos && data.videos.title) || "Vidéos",
        videoItems.length
          ? createVideoBlock(videoItems, data.videos.basePath)
          : '<p>Aucune vidéo disponible pour le moment.</p>'
      );
      videosSection.classList.add('videos-card');
      videosSection.addEventListener('click', event => {
        const tab = event.target.closest('.video-tab');
        if (!tab || tab.classList.contains('is-active')) return;
        videosSection.querySelectorAll('.video-tab').forEach(other => {
          const active = other === tab;
          other.classList.toggle('is-active', active);
          other.setAttribute('aria-pressed', String(active));
        });
        showVideo(videosSection, videoItems[Number(tab.dataset.video)], data.videos.basePath);
      });

      fichesOutilsSection.classList.add('fiches-card');
      // L'illustration occupe la place libre en bas de la carte de droite.
      if (illustration) sideCard.appendChild(illustration);
      addMindmapHelp(data.mindmap);

      grid.innerHTML = '';
      grid.append(videosSection, fichesOutilsSection, sideCard);

    } catch (error) {
      console.error(error);
      showError();
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
