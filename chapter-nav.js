(function () {
  // Language is inferred from the URL (.../en/... vs .../nl/...) so this one
  // shared script can render correct labels on both immersion tracks.
  const pageLang = location.pathname.split('/').includes('nl') ? 'nl' : 'en';

  const LABELS = {
    en: { home: 'Home', vocabulary: 'Vocabulary', practice: 'Practice', resources: 'Resources', explorations: 'Explorations' },
    nl: { home: 'Home', vocabulary: 'Woordenschat', practice: 'Oefeningen', resources: 'Hulpbronnen', explorations: 'Exploraties' }
  };
  const L = LABELS[pageLang];

  const SECTIONS = [
    { file: 'vocabulary.html', label: L.vocabulary },
    { file: 'practice.html', label: L.practice },
    { file: 'resources.html', label: L.resources },
    { file: 'explorations.html', label: L.explorations }
  ];

  // Existence of a section is stable for the whole visit, so the HEAD check is
  // remembered per URL instead of being repeated on every page of a chapter.
  // Both accessors are guarded: private browsing or a full quota must degrade
  // to "check every time", never break the navigation bar.
  const CACHE_PREFIX = 'chapterNavExists::';

  function readCachedExists(key) {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  }

  function writeCachedExists(key, value) {
    try { sessionStorage.setItem(key, value); } catch (e) {}
  }

  function renderChapterNav() {
    const container = document.getElementById('chapter-nav');
    if (!container) return;

    const currentFile = location.pathname.split('/').pop();

    const home = document.createElement('a');
    home.className = 'chapter-nav-btn';
    home.href = '../../../index.html';
    home.textContent = L.home;
    container.appendChild(home);

    SECTIONS.filter(s => s.file !== currentFile).forEach(section => {
      const link = document.createElement('a');
      link.className = 'chapter-nav-btn';
      link.href = './' + section.file;
      link.textContent = section.label;
      container.appendChild(link);

      // Si cette section n'existe pas encore dans ce chapitre (ex: année 2 / NL
      // en cours de construction), retire le bouton plutôt que laisser un lien mort.
      // link.href est déjà l'URL absolue résolue, donc deux chapitres différents
      // ne peuvent pas partager une entrée de cache.
      const cacheKey = CACHE_PREFIX + link.href;
      const cached = readCachedExists(cacheKey);

      if (cached === 'missing') { link.remove(); return; }
      if (cached === 'ok') return;

      fetch(link.href, { method: 'HEAD' })
        .then(res => {
          writeCachedExists(cacheKey, res.ok ? 'ok' : 'missing');
          if (!res.ok) link.remove();
        })
        .catch(() => {
          writeCachedExists(cacheKey, 'missing');
          link.remove();
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderChapterNav);
  } else {
    renderChapterNav();
  }
})();
