(function () {
  // Language is inferred from the URL (.../en/... vs .../nl/...) so this one
  // shared script can render correct labels on both immersion tracks.
  const pageLang = location.pathname.split('/').includes('nl') ? 'nl' : 'en';

  const LABELS = {
    en: { home: 'Home', vocabulary: 'Vocabulary', practice: 'Practice', resources: 'Resources', explorations: 'Explorations', lab: 'Lab', assessment: 'Assessment' },
    nl: { home: 'Home', vocabulary: 'Woordenschat', practice: 'Oefeningen', resources: 'Hulpbronnen', explorations: 'Exploraties', lab: 'Labo', assessment: 'Zelfevaluatie' }
  };
  const L = LABELS[pageLang];

  // Ordre du parcours : apprendre les mots, s'entraîner, faire les labos ;
  // les ressources servent tout du long ; l'autoévaluation est la finalité ;
  // les explorations, pour qui a tout fait. Même ordre que la fenêtre des
  // sections sur l'accueil (index.html, siteData.sections).
  const SECTIONS = [
    { file: 'vocabulary.html', label: L.vocabulary },
    { file: 'practice.html', label: L.practice },
    { file: 'laboratory.html', label: L.lab },
    { file: 'resources.html', label: L.resources },
    { file: 'assessment.html', label: L.assessment },
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

  // Deux emplacements :
  // - en bas de page (ancienne mise en page, juste avant </main>) : la
  //   section courante n'y figure pas ;
  // - dans l'en-tête compact (.page-bar-nav, mise en page « paysage ») : la
  //   page tient sur un écran sans défiler, la barre remonte donc en haut et
  //   montre toutes les sections, la courante en surbrillance. Le mode
  //   d'emploi, qui passait avant la barre en bas de page, s'ouvre par le
  //   bouton « ? » (initHelpModal ci-dessous).
  function renderChapterNav() {
    const container = document.getElementById('chapter-nav');
    if (!container) return;

    const currentFile = location.pathname.split('/').pop();
    const inPageBar = container.classList.contains('page-bar-nav');

    const home = document.createElement('a');
    home.className = 'chapter-nav-btn';
    home.href = '../../../index.html';
    home.textContent = L.home;
    container.appendChild(home);

    SECTIONS.filter(s => inPageBar || s.file !== currentFile).forEach(section => {
      const link = document.createElement('a');
      // Assessment en ardoise, comme dans la fenêtre des sections de
      // l'accueil et sur sa page : la finalité du parcours (style.css).
      link.className = section.file === 'assessment.html' ? 'chapter-nav-btn is-assessment' : 'chapter-nav-btn';
      link.href = './' + section.file;
      link.textContent = section.label;
      container.appendChild(link);

      // La page où l'on est : elle existe, rien à vérifier.
      if (section.file === currentFile) {
        link.classList.add('is-current');
        link.setAttribute('aria-current', 'page');
        return;
      }

      // Vocabulary has no self-assessment of its own (just flashcards) — this
      // is the only signal available for "does this student ever go there".
      if (section.file === 'vocabulary.html') {
        link.addEventListener('click', () => {
          if (window.logEvent) window.logEvent('vocabulary_section_opened', {});
        });
      }

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
          // Une vraie réponse du serveur : le verdict est fiable, on peut le
          // mémoriser durablement.
          writeCachedExists(cacheKey, res.ok ? 'ok' : 'missing');
          if (!res.ok) link.remove();
        })
        .catch(() => {
          /* Aucune réponse reçue — coupure réseau la plupart du temps, pas une
             page absente : rien ne permet de trancher. On laisse le bouton en
             place (l'hypothèse la plus sûre : la section existe) et on ne
             grave rien en mémoire, pour que la vérification reparte à zéro
             dès la page suivante, une fois le réseau revenu. Une page
             réellement absente aurait renvoyé une réponse HTTP, pas une
             erreur réseau — elle continuera d'être détectée normalement. */
        });
    });
  }

  // Mode d'emploi de la page (#help-modal), ouvert par le bouton « ? » de
  // l'en-tête compact. Fermeture par la croix ou Échap, comme les autres
  // modales du site (pas de clic à côté : trop facile au doigt).
  function initHelpModal() {
    const modal = document.getElementById('help-modal');
    if (!modal) return;
    const open = () => modal.classList.add('modal-open');
    const close = () => modal.classList.remove('modal-open');
    document.querySelectorAll('[data-help-open]').forEach(btn => btn.addEventListener('click', open));
    modal.querySelectorAll('[data-help-close]').forEach(btn => btn.addEventListener('click', close));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && modal.classList.contains('modal-open')) close();
    });
  }

  function init() {
    renderChapterNav();
    initHelpModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
