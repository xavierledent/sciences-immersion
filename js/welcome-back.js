/* ===== Bandeaux d'accueil =====

   - « Content de te revoir » : retour après une semaine d'absence, page
     d'accueil uniquement (script marqué data-home dans index.html).
   - « Le site a fait peau neuve » : une seule fois par appareil, sur la
     première page ouverte (accueil ou chapitre), pour les élèves qui
     connaissaient l'ancien site (mise en page « paysage », novembre 2026).
     Il reste affiché jusqu'au bouton « Compris ». À retirer quand plus aucun
     élève n'a connu l'ancien site (fin de l'année scolaire).

   Distinct de STORAGE_KEY dans access-control.js ('accessToken') : cette clé
   ne suit qu'une date, jamais un accès, les deux ne doivent pas se marcher
   dessus. */
(function () {
  const STORAGE_KEY = 'lastVisitAt';
  const REDESIGN_KEY = 'redesignNoticeSeen';
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const DISPLAY_MS = 6000;
  const IS_HOME = !!(document.currentScript && document.currentScript.hasAttribute('data-home'));

  const WELCOME_IMAGE = document.currentScript
    ? new URL('../assets/Friends%20wback.webp', document.currentScript.src).href
    : 'assets/Friends wback.webp';

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
      /* Flottant en haut de l'écran, centré, par-dessus l'en-tête : l'accueil
         tient exactement dans la hauteur de l'écran, un bandeau dans le flux
         le ferait défiler pendant ses quelques secondes. Il ne couvre que
         l'en-tête (titre, pastilles), jamais les choix de langue, d'année
         ou de chapitre ; le wrap laisse passer les clics à côté de la carte. */
      #welcome-back-wrap {
        position: fixed;
        top: 12px;
        left: 0;
        right: 0;
        z-index: 997;
        padding: 0 16px;
        display: flex;
        justify-content: center;
        pointer-events: none;
      }
      /* Une vraie carte, pas une pastille : à cette taille d'image, le
         bandeau doit se voir tout de suite. */
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
        pointer-events: auto;
      }
      #welcome-back-banner.is-visible {
        opacity: 1;
        transform: translateY(0);
      }
      /* object-fit: contain plutôt que cover: la mascotte fait signe de la
         main sur cette image précise (assets/Friends wback.webp) — un
         recadrage en cercle qui coupait ce geste, comme la version
         précédente, retirait justement ce qui rend l'image reconnaissable. */
      #welcome-back-banner img {
        height: 130px;
        width: auto;
        aspect-ratio: 944 / 1125;
        object-fit: contain;
        flex-shrink: 0;
      }
      #welcome-back-banner.is-redesign {
        max-width: 620px;
        align-items: flex-start;
      }
      #welcome-back-banner .welcome-back-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      #welcome-back-banner .welcome-back-text p {
        flex: none;
        font-size: 0.98rem;
        font-weight: 500;
        line-height: 1.5;
        /* Les paragraphes du site sont justifiés : sur une colonne étroite,
           des trous entre les mots. */
        text-align: left;
      }
      #welcome-back-banner .welcome-back-text .welcome-back-title {
        font-size: 1.2rem;
        font-weight: 700;
      }
      #welcome-back-banner .welcome-back-ok {
        align-self: flex-end;
        margin-top: 4px;
        padding: 9px 22px;
        border: none;
        border-radius: 999px;
        background: var(--color-slate, #4a6483);
        color: #ffffff;
        font-family: var(--font-family);
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
      }
      #welcome-back-banner .welcome-back-ok:focus-visible {
        outline: 3px solid rgba(74, 100, 131, 0.35);
        outline-offset: 2px;
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

  /* Le site a fait peau neuve : reste affiché jusqu'à « Compris », puis ne
     revient plus sur cet appareil. En test (?redesignTest=1), rien n'est
     enregistré. */
  function showRedesignNotice(forced) {
    injectStyles();

    const wrap = document.createElement('div');
    wrap.id = 'welcome-back-wrap';

    const banner = document.createElement('div');
    banner.id = 'welcome-back-banner';
    banner.className = 'is-redesign';
    banner.setAttribute('role', 'status');
    banner.innerHTML =
      '<img src="' + WELCOME_IMAGE + '" alt="" />' +
      '<div class="welcome-back-text">' +
        '<p class="welcome-back-title">Le site a fait peau neuve !</p>' +
        '<p>Les pages ont changé d\'allure, mais tout se trouve toujours au même endroit, ' +
        'et ton travail est bien conservé : exercices, jeux, labos et autoévaluation.</p>' +
        '<button type="button" class="welcome-back-ok">Compris</button>' +
      '</div>';
    wrap.appendChild(banner);
    document.body.insertBefore(wrap, document.body.firstChild);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => banner.classList.add('is-visible'));
    });

    banner.querySelector('.welcome-back-ok').addEventListener('click', () => {
      if (!forced) SiteStorage.device.set(REDESIGN_KEY, '1');
      banner.classList.remove('is-visible');
      setTimeout(() => wrap.remove(), 600);
    });
  }

  function init() {
    /* Peau neuve : seulement pour qui connaissait l'ancien site, reconnu à
       une trace laissée sur l'appareil (dernière visite de l'accueil, accès
       enregistré). Un nouvel élève n'a ni l'un ni l'autre : il est noté
       comme l'ayant vu, sans rien afficher (pour lui, rien n'a changé). */
    const forcedRedesign = /(?:^|[?&])redesignTest=1(?:&|$)/.test(location.search);
    let redesign = forcedRedesign;
    if (!forcedRedesign && SiteStorage.device.get(REDESIGN_KEY) !== '1') {
      const knewOldSite = !!SiteStorage.device.get(STORAGE_KEY) || !!SiteStorage.device.get('accessToken');
      if (knewOldSite) redesign = true;
      else SiteStorage.device.set(REDESIGN_KEY, '1');
    }
    if (redesign) whenContentRevealed(() => showRedesignNotice(forcedRedesign));

    if (!IS_HOME) return;

    // Uniquement pour les tests en développement : force l'affichage
    // immédiat sans attendre 7 jours, et sans jamais écraser la vraie date de
    // dernière visite enregistrée (voir plus bas) — un rechargement répété
    // avec ce paramètre ne doit pas fausser le suivi réel.
    const forced = /(?:^|[?&])welcomeTest=1(?:&|$)/.test(location.search);
    const lastVisit = readLastVisit();
    const shouldShow = forced || (lastVisit !== null && (Date.now() - lastVisit) >= SEVEN_DAYS_MS);

    if (!forced) writeLastVisit();

    if (shouldShow && !redesign) whenContentRevealed(showBanner);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
