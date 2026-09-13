/* ===== Écran d'accès du site =====

   IMPORTANT — ce que ce mécanisme fait et ne fait pas, à garder en tête avant
   de le modifier :

   Ce site est statique, sans serveur : aucun fichier n'est réellement protégé
   sur le plan technique, quel que soit ce qui s'affiche à l'écran. Décoder un
   jeton Google ici permet de lire ce qu'il contient, pas de vérifier
   cryptographiquement qu'il vient bien de Google — cette vérification-là
   exige un serveur, qu'on n'a pas. C'est donc un filtre de confort : une
   entrée fluide pour les élèves déjà connectés à leur compte scolaire, un
   aperçu limité pour qui tombe sur le site sans y être invité — pas un
   rempart contre quelqu'un de déterminé à contourner l'écran.

   Chargé en tout premier dans <head>, avant tout autre script : le contenu de
   la page est caché dès la première ligne, avant même d'exister, et n'est
   révélé qu'une fois l'accès vérifié. */

(function () {
  /* Changer cette valeur et déployer invalide d'un coup tous les accès déjà
     enregistrés dans le navigateur des élèves — connexions Google comme
     accès visiteur — et renvoie tout le monde à l'écran d'accès. Utile pour
     couper l'accès en cours d'année, ou si la liste blanche ci-dessous change
     et que les anciens accès ne doivent plus être considérés valides. */
  const AUTH_VERSION = '2026-08';

  // Adresses e-mail acceptées individuellement, même hors du domaine de
  // l'école. Vide au départ ; à remplir à la main au besoin.
  const FULL_ACCESS_WHITELIST = [];

  // Nom de domaine scolaire : toute adresse Google Workspace se terminant par
  // @cnddinant.be est acceptée automatiquement, sans passer par la liste
  // ci-dessus.
  const SCHOOL_DOMAIN = 'cnddinant.be';

  const GOOGLE_CLIENT_ID = '116054091976-au94hfoh1v8p10jnmov432j87kbsmpii.apps.googleusercontent.com';

  const CONTACT_EMAIL = 'xavier.ledent@cnddinant.be';

  const STORAGE_KEY = 'accessToken';

  /* Adresse résolue depuis l'emplacement réel de ce script plutôt qu'écrite en
     dur : access-control.js est chargé à des profondeurs différentes selon la
     page (à la racine, ou trois niveaux plus bas dans un chapitre). Même
     technique que pour sw.js dans rich-text.js — document.currentScript n'est
     valide qu'ici, en exécution synchrone du script ; il redeviendrait null
     dans une fonction appelée plus tard. */
  const LIMITED_ACCESS_IMAGE = document.currentScript
    ? new URL('assets/Friends%20-%20Limited%20acces.png', document.currentScript.src).href
    : '';
  const CONNECT_IMAGE = document.currentScript
    ? new URL('assets/Friends.jpg', document.currentScript.src).href
    : '';

  /* Ni l'un ni l'autre écran ne s'affiche forcément en premier : un visiteur
     déjà en mode "visiteur" peut atterrir directement sur showBlockedMessage()
     sans jamais passer par showAccessScreen(), et inversement. Sans
     préchargement, l'image du <img> ne commençait à charger qu'au moment où
     cet écran précis s'affichait — d'où le temps de latence visible signalé.
     En précommandant les deux dès l'exécution du script (avant même de savoir
     lequel des deux écrans sera montré), l'image est déjà en cache le temps
     que le DOM de l'écran soit construit. */
  [LIMITED_ACCESS_IMAGE, CONNECT_IMAGE].forEach(function (href) {
    if (!href) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = href;
    document.head.appendChild(link);
  });

  /* Couleurs et rayons recopiés depuis style.css plutôt que lus via
     var(--...) : ce script s'exécute avant que la feuille de style n'ait eu
     le temps de charger, les variables CSS n'existeraient pas encore à ce
     moment-là. Garder ces valeurs synchronisées avec style.css si la palette
     du site change un jour. */
  const COLORS = {
    text: '#13243d',
    muted: '#5d728f',
    slate: '#4a6483',
    slateRgb: '74, 100, 131',
    surface: '#ffffff',
    bg: '#eef7ff',
    rose: '#d4527a'
  };

  /* Cache le contenu de la page avant même qu'il n'existe : la balise <style>
     s'applique dès son ajout, sans attendre le chargement d'aucune feuille de
     style externe.

     Masqué, jamais retiré du DOM : index.html et chaque page de chapitre ont
     leur propre script qui s'exécute au chargement et va chercher ses propres
     éléments (#language-list, #chapter-modal, les conteneurs des exercices…).
     Vider document.body pour y mettre l'écran d'accès casserait ces scripts
     sur la toute première visite de n'importe qui — le cas le plus courant.
     L'écran d'accès est donc un calque posé par-dessus (voir ensureOverlay),
     pas un remplacement : le reste de la page continue de s'exécuter
     normalement, simplement invisible tant que l'accès n'est pas validé. */
  const hideStyle = document.createElement('style');
  hideStyle.id = 'access-control-hide';
  hideStyle.textContent = 'html { visibility: hidden; }';
  document.head.appendChild(hideStyle);

  function revealContent() {
    const hide = document.getElementById('access-control-hide');
    if (hide) hide.remove();
    const overlay = document.getElementById('access-control-overlay');
    if (overlay) overlay.remove();
  }

  /* ===== Stockage de l'accès ===== */

  // Le 6 juillet de l'année scolaire en cours : au-delà de cette date dans
  // l'année civile, l'expiration bascule sur le 6 juillet suivant plutôt que
  // celui qui vient de passer.
  function computeExpiration() {
    const now = new Date();
    const year = now.getFullYear();
    let expiry = new Date(year, 6, 6, 23, 59, 59); // mois 6 = juillet (0-indexé)
    if (now.getTime() > expiry.getTime()) {
      expiry = new Date(year + 1, 6, 6, 23, 59, 59);
    }
    return expiry.getTime();
  }

  function storeAccess(mode, email) {
    const data = {
      mode: mode,
      email: email || null,
      authVersion: AUTH_VERSION,
      expires: computeExpiration()
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* stockage indisponible : rien à faire, l'écran d'accès réapparaîtra à chaque visite */ }
  }

  function readStoredAccess() {
    let raw;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    if (!raw) return null;
    let data;
    try { data = JSON.parse(raw); } catch (e) { return null; }
    if (!data || (data.mode !== 'full' && data.mode !== 'visitor')) return null;
    // Une version différente de celle du code actuel : l'accès enregistré ne
    // vaut plus rien, quelle que soit sa date d'expiration.
    if (data.authVersion !== AUTH_VERSION) return null;
    if (!data.expires || Date.now() > data.expires) return null;
    return data;
  }

  /* ===== Restriction du mode visiteur à Bio 1 anglais ===== */

  function isChapterPage(path) {
    return /\/(en\/year1|nl\/jaar1)\/[a-z]+\d+\/(practice|vocabulary|resources|explorations|autoeval)\.html$/.test(path);
  }

  function isBio1EnglishPage(path) {
    return /\/en\/year1\/bio1\/(practice|vocabulary|resources|explorations|autoeval)\.html$/.test(path);
  }

  // L'accueil et la page 404 ne sont pas des chapitres : toujours accessibles
  // au visiteur, c'est par l'accueil qu'il rejoint Bio 1.
  function visitorCanSeeThisPage() {
    const path = location.pathname;
    if (!isChapterPage(path)) return true;
    return isBio1EnglishPage(path);
  }

  /* ===== Décodage du jeton Google =====
     Lit le contenu du jeton, ne vérifie PAS sa signature — voir la note en
     tête de fichier. Un jeton dont la structure est invalide échoue
     silencieusement plutôt que de faire planter la page. */
  function decodeJwtPayload(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  /* ===== Construction de l'écran d'accès ===== */

  function injectAccessStyles() {
    if (document.getElementById('access-control-style')) return;
    const style = document.createElement('style');
    style.id = 'access-control-style';
    style.textContent = `
      /* Calque plein écran : visibility se transmet aux enfants, ce réglage
         l'annule pour ce seul élément, qui reste visible même quand <html>
         est masqué par ailleurs. */
      #access-control-overlay {
        visibility: visible;
        position: fixed;
        inset: 0;
        z-index: 99999;
      }
      .access-screen {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        background: ${COLORS.bg};
        font-family: 'Poppins', sans-serif;
      }
      .access-card {
        width: 100%;
        /* Assez large pour que le titre tienne sur une seule ligne à cette
           taille de police, sur un écran d'ordinateur ou de Chromebook. Sur
           un écran plus étroit, la carte reste contrainte par le padding du
           calque et le titre repasse naturellement sur deux lignes plutôt que
           de déborder. */
        max-width: 640px;
        background: ${COLORS.surface};
        border-radius: 28px;
        padding: 36px 32px;
        text-align: center;
        box-shadow: 0 22px 42px rgba(17, 36, 72, 0.12);
      }
      .access-title {
        margin: 0 0 8px;
        font-size: 1.35rem;
        font-weight: 700;
        color: ${COLORS.text};
      }
      .access-illustration {
        display: block;
        height: 140px;
        width: auto;
        max-width: 100%;
        margin: 4px auto 24px;
        border-radius: 16px;
      }
      .access-subtitle {
        margin: 0 0 28px;
        font-size: 0.95rem;
        color: ${COLORS.muted};
        line-height: 1.5;
      }
      .access-google-btn-container {
        display: flex;
        justify-content: center;
        margin-bottom: 14px;
      }
      /* Slate plein, texte blanc : même traitement que le bouton "Retour à
         l'accueil" de la page 404 et les cartes de langue/année une fois
         sélectionnées — c'est déjà le langage du site pour une action
         neutre, secondaire, qui ne renvoie à aucune matière. */
      /* Même largeur que le bouton Google (voir renderGoogleButton, width:
         320) plutôt que l'inverse : Google plafonne officiellement son
         bouton à 400px, l'étirer à la largeur de la carte ne fonctionnerait
         pas de façon fiable. */
      .access-visitor-btn {
        width: 320px;
        max-width: 100%;
        padding: 13px 20px;
        border-radius: 999px;
        border: none;
        background: ${COLORS.slate};
        color: #ffffff;
        font-family: inherit;
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 10px 24px rgba(${COLORS.slateRgb}, 0.28);
      }
      .access-error {
        margin: 18px 0 0;
        padding: 12px 16px;
        border-radius: 14px;
        background: rgba(212, 82, 122, 0.08);
        border: 1px solid rgba(212, 82, 122, 0.35);
        color: #a83d5e;
        font-size: 0.9rem;
        font-weight: 600;
        line-height: 1.45;
      }
      /* Même bouton que access-visitor-btn : deux usages différents, un seul
         style à faire vivre. */
      .access-back-btn {
        margin-top: 20px;
        padding: 13px 26px;
      }
      /* Statut de connexion, accueil uniquement — voir renderAccountBadge.
         En dessous du calque d'accès (z-index 99999) : quand on clique
         dessus pour rouvrir l'écran d'accès, celui-ci le recouvre
         normalement, pas de conflit à gérer. */
      /* Dans le flux normal de la page, pas en position fixe : sur une page
         qui défile avec plusieurs rangées de cartes, un badge fixé à l'écran
         finit toujours par chevaucher quelque chose à un moment ou un autre,
         quel que soit le coin choisi — on l'a vérifié deux fois. Placé juste
         après le sous-titre (voir insertBadgeInFlow), il pousse le contenu
         qui suit au lieu de se superposer à lui, et ce problème ne se pose
         alors plus jamais, quelle que soit la hauteur de la page. */
      .account-badge {
        display: inline-flex;
        margin: 14px 0 0;
        padding: 8px 14px;
        border-radius: 999px;
        border: 1px solid rgba(${COLORS.slateRgb}, 0.25);
        background: rgba(255, 255, 255, 0.92);
        color: ${COLORS.slate};
        font-family: 'Poppins', sans-serif;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 6px 16px rgba(17, 36, 72, 0.08);
      }
    `;
    document.head.appendChild(style);
  }

  function loadGoogleScript(callback) {
    if (window.google && window.google.accounts) { callback(); return; }
    const existing = document.getElementById('google-identity-script');
    if (existing) { existing.addEventListener('load', callback); return; }
    const script = document.createElement('script');
    script.id = 'google-identity-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = callback;
    document.head.appendChild(script);
  }

  function handleGoogleCredential(response) {
    const payload = decodeJwtPayload(response.credential);
    const email = payload && payload.email ? payload.email.toLowerCase() : null;
    const authorized = !!email && (payload.hd === SCHOOL_DOMAIN || FULL_ACCESS_WHITELIST.indexOf(email) !== -1);

    if (!authorized) {
      const errorBox = document.getElementById('access-error-box');
      if (errorBox) {
        errorBox.textContent = 'Cette adresse n\'est pas autorisée. Contactez ' + CONTACT_EMAIL + ' si vous pensez qu\'il s\'agit d\'une erreur.';
        errorBox.style.display = 'block';
      }
      return;
    }

    storeAccess('full', email);
    location.reload();
  }

  function renderGoogleButton(container) {
    loadGoogleScript(function () {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential
      });
      google.accounts.id.renderButton(container, { theme: 'filled_blue', size: 'large', text: 'signin_with', shape: 'pill', width: 320 });
    });
  }

  function handleVisitorClick() {
    storeAccess('visitor', null);
    // Pré-coche English immersion / Year 1 sur l'accueil, comme si l'élève
    // venait de les choisir lui-même — mêmes clés que celles qu'index.html
    // utilise déjà pour se souvenir d'un choix d'une visite à l'autre.
    try {
      localStorage.setItem('selectedLanguage', 'en');
      localStorage.setItem('selectedYear', 'year1');
    } catch (e) { /* pas grave : l'élève choisira lui-même sur l'accueil */ }
    location.reload();
  }

  // Un seul calque, créé une fois puis réutilisé : passer de l'écran d'accès
  // au message de blocage (et inversement, via le bouton « retour ») ne doit
  // pas empiler un second calque par-dessus le premier.
  function ensureOverlay() {
    let overlay = document.getElementById('access-control-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'access-control-overlay';
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function showAccessScreen() {
    injectAccessStyles();
    const overlay = ensureOverlay();
    overlay.innerHTML =
      '<div class="access-screen">' +
      '<div class="access-card">' +
      '<h1 class="access-title">Site pédagogique // Sciences en immersion</h1>' +
      '<p class="access-subtitle">Connecte-toi avec ton compte scolaire pour accéder à tout le site, ou continue en visiteur pour découvrir un chapitre.</p>' +
      '<img class="access-illustration" src="' + CONNECT_IMAGE + '" alt="" />' +
      '<div class="access-google-btn-container" id="access-google-btn"></div>' +
      '<button type="button" class="access-visitor-btn" id="access-visitor-btn">Continuer en tant que visiteur</button>' +
      '<div class="access-error" id="access-error-box" style="display:none"></div>' +
      '</div>' +
      '</div>';

    renderGoogleButton(overlay.querySelector('#access-google-btn'));
    overlay.querySelector('#access-visitor-btn').addEventListener('click', handleVisitorClick);
    // hideStyle reste en place : seul ce calque doit être visible, pas le
    // contenu réel de la page en dessous — voir la note sur hideStyle plus haut.
  }

  function showBlockedMessage() {
    injectAccessStyles();
    const overlay = ensureOverlay();
    overlay.innerHTML =
      '<div class="access-screen">' +
      '<div class="access-card">' +
      '<h1 class="access-title">Accès limité</h1>' +
      '<p class="access-subtitle">Veuillez vous identifier avec une adresse autorisée pour accéder à cette partie du site.</p>' +
      '<img class="access-illustration" src="' + LIMITED_ACCESS_IMAGE + '" alt="" />' +
      '<button type="button" class="access-visitor-btn access-back-btn" id="access-back-btn">Se connecter avec Google</button>' +
      '</div>' +
      '</div>';

    overlay.querySelector('#access-back-btn').addEventListener('click', showAccessScreen);
  }

  /* ===== Décision principale, une fois la page prête ===== */
  /* ===== Statut de connexion sur l'accueil =====
     Aujourd'hui, rien ne dit à quelqu'un quel compte il utilise — un élève
     connecté par erreur avec l'adresse d'un camarade n'a aucun moyen de le
     remarquer. Ce badge répond à ça en même temps qu'il offre un chemin de
     retour vers l'écran d'accès, pour se connecter ou changer de compte.
     Accueil uniquement : ça n'a pas de sens au milieu d'un exercice. */
  function isIndexPage() {
    return /\/(index\.html)?$/.test(location.pathname);
  }

  // Masque le badge tant que la modale de choix de section est ouverte : les
  // deux se disputeraient sinon le coin supérieur droit. Observé plutôt que
  // déclenché par index.html lui-même — comme le verrou de défilement des
  // modales ailleurs sur le site — pour ne pas avoir à toucher son code
  // d'ouverture/fermeture.
  function watchChapterModal(badge) {
    const modal = document.getElementById('chapter-modal');
    if (!modal) return;
    const sync = () => {
      badge.style.display = modal.classList.contains('modal-open') ? 'none' : '';
    };
    new MutationObserver(sync).observe(modal, { attributes: true, attributeFilter: ['class'] });
    sync();
  }

  function renderAccountBadge(stored) {
    if (!isIndexPage()) return;
    injectAccessStyles();
    let badge = document.getElementById('account-badge');
    if (!badge) {
      badge = document.createElement('button');
      badge.type = 'button';
      badge.id = 'account-badge';
      badge.className = 'account-badge';
      badge.addEventListener('click', showAccessScreen);
      // Juste après le sous-titre, dans le flux normal — voir la note sur
      // .account-badge. Repli sur body si la page a changé et n'a plus ce
      // sous-titre, pour ne jamais perdre le badge silencieusement.
      const subtitle = document.querySelector('.subtitle');
      if (subtitle) subtitle.insertAdjacentElement('afterend', badge);
      else document.body.appendChild(badge);
      watchChapterModal(badge);
    }
    badge.textContent = stored.mode === 'full'
      ? stored.email + ' — changer de compte'
      : 'Visiteur — se connecter';
  }

  function checkAccess() {
    const stored = readStoredAccess();

    if (stored && stored.mode === 'full') { revealContent(); renderAccountBadge(stored); return; }

    if (stored && stored.mode === 'visitor') {
      if (visitorCanSeeThisPage()) { revealContent(); renderAccountBadge(stored); return; }
      showBlockedMessage();
      return;
    }

    showAccessScreen();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAccess);
  } else {
    checkAccess();
  }

  /* ===== API exposée à index.html =====
     Le clic sur « Go » d'une carte de chapitre ouvre normalement la modale de
     choix de section. Pour un visiteur qui viserait un autre chapitre que
     Bio 1 anglais, on veut le message de blocage tout de suite, avant même
     que cette modale n'apparaisse — pas après un aller-retour inutile.
     index.html connaît déjà la langue et l'année choisies au moment du clic
     (selectedLanguage.code, selectedYear.code) : ce sont ces mêmes valeurs
     qu'on lui demande de fournir ici, plutôt que de les redéduire d'une
     adresse qui n'existe pas encore à ce stade. */
  function blockChapterIfNeeded(chapterFolder, langCode, yearCode) {
    const stored = readStoredAccess();
    if (!stored || stored.mode !== 'visitor') return false;
    if (chapterFolder === 'bio1' && langCode === 'en' && yearCode === 'year1') return false;
    showBlockedMessage();
    return true;
  }

  window.AccessControl = { blockChapterIfNeeded: blockChapterIfNeeded };
})();
