/* Page Lab (laboratory.html) : où en est l'élève dans chaque labo.

   Chaque carte de labo (data-lab-tile="<id>", générée par
   tools/generate-laboratory.js) porte une barre de quatre étapes (Predict,
   Experiment, Conclude, Check) : une case pleine par étape atteinte, toutes
   pleines après un Check ; l'état est dit en toutes lettres aux lecteurs
   d'écran (aria-label). Le bouton dit toujours « Enter the lab » : c'est le
   labo qui propose ensuite de continuer ou de recommencer. Tout vient
   du résultat que lab-engine.js enregistre pour le tableau de bord (famille
   labResult : { maxStep, checks, best }), lu ici sans rien écrire.

   Rafraîchi au chargement (SiteStorage.ready : le travail de l'élève vient de
   Firestore) et chaque fois qu'un labo se referme.

   Les textes des cartes (titre, question, présentation) rapetissent ensemble
   si l'une d'elles déborde de sa hauteur (fitTiles) : mesuré, pas supposé,
   la place dépend de l'écran et de la langue. */
(function () {
  const pageLang = location.pathname.split('/').includes('nl') ? 'nl' : 'en';

  const LABELS = {
    en: {
      notStarted: 'Not started yet',
      inProgress: n => `In progress · step ${n} of 4`,
      checked: (score, total) => total ? `Checked · best ${score} / ${total}` : 'Checked'
    },
    nl: {
      notStarted: 'Nog niet begonnen',
      inProgress: n => `Bezig · stap ${n} van 4`,
      checked: (score, total) => total ? `Gecontroleerd · beste ${score} / ${total}` : 'Gecontroleerd'
    }
  };
  const L = LABELS[pageLang];

  function readResult(id) {
    if (!window.SiteStorage) return null;
    try { return JSON.parse(SiteStorage.data.get('labResult', [id]) || 'null'); } catch (e) { return null; }
  }

  function render() {
    document.querySelectorAll('[data-lab-tile]').forEach(tile => {
      const r = readResult(tile.dataset.labTile);
      const checked = !!(r && r.checks > 0);
      const reached = checked ? 4 : (r ? Math.min(4, Math.max(1, r.maxStep || 1)) : 0);
      tile.querySelectorAll('.lab-tile-steps span').forEach((cell, i) => {
        cell.classList.toggle('is-reached', i < reached);
      });
      const bar = tile.querySelector('.lab-tile-steps');
      if (bar) {
        bar.setAttribute('aria-label', checked
          ? L.checked(r.best ? r.best.score : 0, r.best ? r.best.total : 0)
          : (r ? L.inProgress(reached) : L.notStarted));
      }
    });
  }

  // 0,6 au plus bas : sur le Chromebook, rien ne descend sous 0,78 ; plus
  // bas, c'est un écran plus petit que prévu, et la page doit y tenir
  // quand même plutôt que de déborder.
  const FIT_MIN = 0.6;

  function fitTiles() {
    const slots = document.querySelector('.lab-slots');
    if (!slots) return;
    const tiles = [...slots.querySelectorAll('.lab-tile')];
    let fit = 1;
    slots.style.setProperty('--lab-fit', fit);
    // Les cartes partagent leurs rangées (sous-grille) : un débordement se
    // voit sur la grille entière, ou dans une carte « en développement ».
    const overflows = () => slots.scrollHeight > slots.clientHeight + 1
      || tiles.some(tile => tile.scrollHeight > tile.clientHeight + 1);
    while (fit > FIT_MIN && overflows()) {
      fit = Math.round((fit - 0.03) * 100) / 100;
      slots.style.setProperty('--lab-fit', fit);
    }
  }

  async function init() {
    if (!document.querySelector('[data-lab-tile]')) return;
    render();
    fitTiles();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTiles);
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fitTiles, 150);
    });
    if (window.SiteStorage && SiteStorage.ready) {
      await SiteStorage.ready;
      render();
      fitTiles();
    }
    // Un labo refermé (lab-engine.js retire modal-is-open du body) a pu
    // avancer : on relit.
    let wasOpen = document.body.classList.contains('modal-is-open');
    new MutationObserver(() => {
      const open = document.body.classList.contains('modal-is-open');
      if (wasOpen && !open) render();
      wasOpen = open;
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
