/* Page Lab (laboratory.html) : où en est l'élève dans chaque labo.

   Chaque carte de labo (data-lab-tile="<id>", générée par
   tools/generate-laboratory.js) porte une barre de quatre étapes (Predict,
   Experiment, Conclude, Check) : une case pleine par étape atteinte dans le
   travail en cours, toutes pleines après un Check, toutes vides après
   « Restart » ; une case pleine est un bouton qui ouvre le labo à cette
   étape (lab-engine.js, data-lab-step), une case vide ne fait rien ; l'état est dit en toutes lettres aux lecteurs
   d'écran (aria-label). Le bouton dit toujours « Enter the lab » : c'est le
   labo qui propose ensuite de continuer ou de recommencer. Les cases
   viennent du travail en cours que lab-engine.js enregistre pour la reprise
   (famille labProgress : frame { step, reached, checked }) ; le meilleur
   score, de son résultat pour le tableau de bord (labResult, qui survit à
   « Restart »). Lus ici sans rien écrire.

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

  function readFrame(id) {
    if (!window.SiteStorage) return null;
    try {
      const saved = JSON.parse(SiteStorage.data.get('labProgress', [id]) || 'null');
      return saved && saved.frame ? saved.frame : null;
    } catch (e) { return null; }
  }

  function render() {
    document.querySelectorAll('[data-lab-tile]').forEach(tile => {
      const id = tile.dataset.labTile;
      const frame = readFrame(id);
      const checked = !!(frame && frame.checked);
      const reached = checked ? 4 : (frame ? Math.min(3, Math.max(1, frame.reached || frame.step || 1)) : 0);
      tile.querySelectorAll('.lab-tile-step').forEach((cell, i) => {
        cell.classList.toggle('is-reached', i < reached);
        if (i < reached) cell.removeAttribute('aria-disabled');
        else cell.setAttribute('aria-disabled', 'true');
      });
      const bar = tile.querySelector('.lab-tile-steps');
      if (bar) {
        const r = checked ? readResult(id) : null;
        bar.setAttribute('aria-label', checked
          ? L.checked(r && r.best ? r.best.score : 0, r && r.best ? r.best.total : 0)
          : (frame ? L.inProgress(reached) : L.notStarted));
      }
    });
  }

  // Une case vide (étape pas encore atteinte) ne fait rien : arrêtée avant
  // d'atteindre le bouton, qui ouvrirait le labo (lab-engine.js).
  document.addEventListener('click', event => {
    const cell = event.target.closest && event.target.closest('.lab-tile-step');
    if (cell && !cell.classList.contains('is-reached')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

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
