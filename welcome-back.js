/* ===== Bandeau de retour après absence, page d'accueil uniquement =====

   Distinct de STORAGE_KEY dans access-control.js ('accessToken') : cette clé
   ne suit qu'une date, jamais un accès, les deux ne doivent pas se marcher
   dessus. */
(function () {
  const STORAGE_KEY = 'lastVisitAt';
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const DISPLAY_MS = 6000;

  const WELCOME_IMAGE = document.currentScript
    ? new URL('assets/Friends%20wback.png', document.currentScript.src).href
    : 'assets/Friends wback.png';

  function readLastVisit() {
    const raw = SiteStorage.device.get(STORAGE_KEY);
    return raw ? parseInt(raw, 10) : null;
  }

  // Stockage indisponible : storage.js l'absorbe, le bandeau ne se déclenchera simplement jamais.
  function writeLastVisit() {
    SiteStorage.device.set(STORAGE_KEY, String(Date.now()));
  }

  /* access-control.js cache <html> (visibility:hidden) tant que l'écran
     d'accès n'est pas résolu, via une balise <style id="access-control-hide">
     retirée du <head> une fois l'accès validé (voir revealContent() là-bas).
     Sans attendre ce signal, le bandeau pourrait démarrer son compte à
     rebours de quelques secondes pendant que la page est encore invisible
     derrière l'écran d'accès, et avoir déjà disparu une fois celui-ci résolu
     — l'élève ne le verrait jamais. */
  function whenContentRevealed(callback) {
    if (!document.getElementById('access-control-hide')) { callback(); return; }
    const observer = new MutationObserver(() => {
      if (!document.getElementById('access-control-hide')) {
        observer.disconnect();
        callback();
      }
    });
    observer.observe(document.head, { childList: true });
  }

  function injectStyles() {
    if (document.getElementById('welcome-back-style')) return;
    const style = document.createElement('style');
    style.id = 'welcome-back-style';
    style.textContent = `
      /* Centré sur la même colonne que main.page (max-width 1080px) sans en
         être l'enfant : le bandeau doit rester au tout haut de la page, avant
         même le header, pas dans le flux de <main>. */
      #welcome-back-wrap {
        max-width: 1080px;
        margin: 0 auto;
        padding: 28px 22px 0;
        display: flex;
        justify-content: center;
      }
      /* Une vraie carte, pas une pastille : à cette taille d'image, le
         bandeau doit se voir tout de suite, sans jamais couvrir ce qu'il y a
         en dessous — sélecteurs de langue/année/chapitre compris, restés
         dans le flux normal de la page. */
      #welcome-back-banner {
        display: flex;
        align-items: center;
        gap: 20px;
        max-width: 560px;
        width: 100%;
        padding: 20px 28px 20px 20px;
        border-radius: 26px;
        background: var(--color-surface);
        box-shadow: var(--color-shadow);
        opacity: 0;
        transform: translateY(-36px);
        transition: opacity 550ms ease-out, transform 550ms ease-out;
      }
      #welcome-back-banner.is-visible {
        opacity: 1;
        transform: translateY(0);
      }
      /* object-fit: contain plutôt que cover: la mascotte fait signe de la
         main sur cette image précise (assets/Friends wback.png) — un
         recadrage en cercle qui coupait ce geste, comme la version
         précédente, retirait justement ce qui rend l'image reconnaissable. */
      #welcome-back-banner img {
        height: 130px;
        width: auto;
        aspect-ratio: 944 / 1125;
        object-fit: contain;
        flex-shrink: 0;
      }
      #welcome-back-banner p {
        margin: 0;
        flex: 1;
        min-width: 0;
        font-family: var(--font-family);
        font-size: 1.05rem;
        font-weight: 600;
        line-height: 1.4;
        color: var(--color-text);
      }
      @media (max-width: 560px) {
        #welcome-back-banner {
          flex-direction: column;
          text-align: center;
          padding: 22px 20px;
        }
        #welcome-back-banner img {
          height: 110px;
        }
        #welcome-back-banner p {
          font-size: 0.95rem;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        #welcome-back-banner,
        #welcome-back-banner.is-visible {
          transform: none;
          transition: opacity 300ms ease-out;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function showBanner() {
    injectStyles();

    const wrap = document.createElement('div');
    wrap.id = 'welcome-back-wrap';

    const banner = document.createElement('div');
    banner.id = 'welcome-back-banner';
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML =
      '<img src="' + WELCOME_IMAGE + '" alt="" />' +
      '<p>Content de te revoir ! Ton espace de sciences t\'attend.</p>';
    wrap.appendChild(banner);

    document.body.insertBefore(wrap, document.body.firstChild);

    // Un frame d'écart avant d'ajouter la classe : posée dans le même tick que
    // l'insertion, la transition sauterait directement à l'état final sans
    // jamais jouer (même logique que le fondu du bandeau hors-ligne ailleurs
    // sur le site).
    requestAnimationFrame(() => {
      requestAnimationFrame(() => banner.classList.add('is-visible'));
    });

    let autoHideTimer;
    function dismiss(event) {
      // Un clic sur le bandeau lui-même ne compte pas comme "ailleurs sur la
      // page" — il n'y a rien à y faire, mais il ne doit pas non plus se
      // fermer sous le doigt/curseur de l'élève au moment où il le regarde.
      if (event && event.target && event.target.closest('#welcome-back-banner')) return;
      document.removeEventListener('click', dismiss);
      clearTimeout(autoHideTimer);
      banner.classList.remove('is-visible');
      setTimeout(() => wrap.remove(), 600);
    }
    autoHideTimer = setTimeout(dismiss, DISPLAY_MS);
    document.addEventListener('click', dismiss);
  }

  function init() {
    // Uniquement pour les tests en développement : force l'affichage
    // immédiat sans attendre 7 jours, et sans jamais écraser la vraie date de
    // dernière visite enregistrée (voir plus bas) — un rechargement répété
    // avec ce paramètre ne doit pas fausser le suivi réel.
    const forced = /(?:^|[?&])welcomeTest=1(?:&|$)/.test(location.search);
    const lastVisit = readLastVisit();
    const shouldShow = forced || (lastVisit !== null && (Date.now() - lastVisit) >= SEVEN_DAYS_MS);

    if (!forced) writeLastVisit();

    if (shouldShow) whenContentRevealed(showBanner);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
