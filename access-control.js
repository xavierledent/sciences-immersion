/* ===== Écran d'accès du site =====

   IMPORTANT — ce que ce mécanisme fait et ne fait pas, à garder en tête avant
   de le modifier :

   Ce site est statique : aucun FICHIER n'est réellement protégé sur le plan
   technique, quel que soit ce qui s'affiche à l'écran. Pour les pages, cet
   écran reste un filtre de confort : une entrée fluide pour les élèves, un
   aperçu limité pour qui tombe sur le site sans y être invité — pas un
   rempart contre quelqu'un de déterminé à le contourner.

   La connexion, elle, passe par Firebase Authentication (firebase-init.js) :
   c'est Firebase qui vérifie auprès de Google qui est connecté. Ce sont ses
   règles de sécurité, côté serveur, qui protégeront les DONNÉES des élèves,
   pas cet écran.

   Ce que l'appareil retient (accessToken, dans storage.js) sert à décider
   tout de suite, sans attendre Firebase, s'il faut montrer la page ; Firebase
   confirme ensuite en arrière-plan (voir confirmFirebaseSession).

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
  const FULL_ACCESS_WHITELIST = ['xledent@gmail.com'];

  // Nom de domaine scolaire : toute adresse Google Workspace se terminant par
  // @cnddinant.be est acceptée automatiquement, sans passer par la liste
  // ci-dessus.
  const SCHOOL_DOMAIN = 'cnddinant.be';

  const CONTACT_EMAIL = 'xavier.ledent@cnddinant.be';

  const STORAGE_KEY = 'accessToken';

  /* Adresse résolue depuis l'emplacement réel de ce script plutôt qu'écrite en
     dur : access-control.js est chargé à des profondeurs différentes selon la
     page (à la racine, ou trois niveaux plus bas dans un chapitre). Même
     technique que pour sw.js dans rich-text.js — document.currentScript n'est
     valide qu'ici, en exécution synchrone du script ; il redeviendrait null
     dans une fonction appelée plus tard. */
  const LIMITED_ACCESS_IMAGE = document.currentScript
    ? new URL('assets/Friends%20-%20Limited%20acces.webp', document.currentScript.src).href
    : '';
  const CONNECT_IMAGE = document.currentScript
    ? new URL('assets/Friends.webp', document.currentScript.src).href
    : '';
  const FIREBASE_INIT = document.currentScript
    ? new URL('firebase-init.js', document.currentScript.src).href
    : '';
  const HOME_URL = document.currentScript
    ? new URL('index.html', document.currentScript.src).href
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

  /* Adresse de l'élève connecté sur cet appareil AVANT Firebase (ancienne
     connexion Google Identity Services, enregistrement sans provider). Gardée
     d'enregistrement en enregistrement pour l'import de la phase 5 : les
     anciennes données de l'appareil ne seront reprises que si l'élève qui se
     connecte à Firebase est bien celui-là. */
  function legacyEmailOnDevice() {
    let data = null;
    try { data = JSON.parse(SiteStorage.device.get(STORAGE_KEY) || 'null'); } catch (e) { return null; }
    if (!data) return null;
    if (data.legacyEmail) return data.legacyEmail;
    return data.mode === 'full' && data.provider !== 'firebase' && data.email ? data.email : null;
  }

  function storeAccess(mode, email) {
    const data = {
      mode: mode,
      email: email || null,
      provider: mode === 'full' ? 'firebase' : null,
      legacyEmail: legacyEmailOnDevice(),
      authVersion: AUTH_VERSION,
      expires: computeExpiration()
    };
    // Stockage indisponible : storage.js l'absorbe, l'écran d'accès réapparaîtra simplement à chaque visite.
    SiteStorage.device.set(STORAGE_KEY, JSON.stringify(data));
  }

  // Oublie l'accès, sans perdre legacyEmail (voir plus haut).
  function clearAccess() {
    const legacyEmail = legacyEmailOnDevice();
    if (legacyEmail) SiteStorage.device.set(STORAGE_KEY, JSON.stringify({ mode: 'none', legacyEmail: legacyEmail }));
    else SiteStorage.device.remove(STORAGE_KEY);
  }

  function readStoredAccess() {
    const raw = SiteStorage.device.get(STORAGE_KEY);
    if (!raw) return null;
    let data;
    try { data = JSON.parse(raw); } catch (e) { return null; }
    if (!data || (data.mode !== 'full' && data.mode !== 'visitor')) return null;
    // Accès complet d'avant Firebase : plus valable, l'élève se reconnecte une
    // fois (Firebase n'a aucune session pour lui). Le mode visiteur, lui, ne
    // dépend pas de Firebase et reste valable.
    if (data.mode === 'full' && data.provider !== 'firebase') return null;
    // Une version différente de celle du code actuel : l'accès enregistré ne
    // vaut plus rien, quelle que soit sa date d'expiration.
    if (data.authVersion !== AUTH_VERSION) return null;
    if (!data.expires || Date.now() > data.expires) return null;
    return data;
  }

  /* ===== Restriction du mode visiteur à Bio 1 anglais ===== */

  function isChapterPage(path) {
    return /\/(en\/year1|nl\/jaar1)\/[a-z]+\d+\/(practice|vocabulary|resources|explorations|autoeval|laboratory)\.html$/.test(path);
  }

  function isBio1EnglishPage(path) {
    return /\/en\/year1\/bio1\/(practice|vocabulary|resources|explorations|autoeval|laboratory)\.html$/.test(path);
  }

  // L'accueil et la page 404 ne sont pas des chapitres : toujours accessibles
  // au visiteur, c'est par l'accueil qu'il rejoint Bio 1.
  function visitorCanSeeThisPage() {
    const path = location.pathname;
    if (!isChapterPage(path)) return true;
    return isBio1EnglishPage(path);
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
        position: relative;
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
      /* Bouton de connexion : reprend l'aspect du bouton que dessinait
         Google Identity Services avant Firebase (bleu Google, pastille,
         « G » dans un rond blanc) pour que les élèves le reconnaissent. */
      .access-google-btn {
        width: 320px;
        max-width: 100%;
        min-height: 44px;
        display: flex;
        align-items: center;
        padding: 2px;
        border: none;
        border-radius: 999px;
        background: #1a73e8;
        color: #ffffff;
        font-family: inherit;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
      }
      .access-google-icon {
        flex: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #ffffff;
        display: grid;
        place-items: center;
      }
      .access-google-label {
        flex: 1;
        padding-right: 40px;
      }
      /* Croix de fermeture, visiteurs seulement (voir closeButtonHtml).
         44px : cible tactile confortable sur Chromebook. */
      .access-close-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 44px;
        height: 44px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: ${COLORS.muted};
        font-family: inherit;
        font-size: 1.6rem;
        line-height: 1;
        cursor: pointer;
      }
      .access-close-btn:hover {
        background: rgba(${COLORS.slateRgb}, 0.1);
      }
      /* Même largeur que le bouton de connexion. */
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

  /* ===== Connexion Firebase ===== */

  /* Chargé une fois par page, et seulement quand il sert (écran d'accès,
     confirmation d'une session) : un visiteur ne le télécharge jamais.
     firebaseModule est rempli dès que le chargement aboutit, pour que le clic
     sur « Se connecter » ouvre la fenêtre Google sans attendre : le
     navigateur bloque une pop-up ouverte trop longtemps après le clic. */
  let firebasePromise = null;
  let firebaseModule = null;

  function loadFirebase() {
    if (!firebasePromise) {
      firebasePromise = import(FIREBASE_INIT).then(function (m) { firebaseModule = m; return m; });
      // Échec (hors ligne, SDK pas encore en cache) : nouvel essai au prochain appel.
      firebasePromise.catch(function () { firebasePromise = null; });
    }
    return firebasePromise;
  }

  function isAuthorized(user) {
    const email = (user.email || '').toLowerCase();
    if (FULL_ACCESS_WHITELIST.indexOf(email) !== -1) return true;
    return user.emailVerified && email.endsWith('@' + SCHOOL_DOMAIN);
  }

  function showError(text) {
    const errorBox = document.getElementById('access-error-box');
    if (!errorBox) return;
    errorBox.textContent = text;
    errorBox.style.display = text ? 'block' : 'none';
  }

  const ERROR_NOT_ALLOWED = 'Cette adresse n\'est pas autorisée. Contacte ' + CONTACT_EMAIL + ' si tu penses qu\'il s\'agit d\'une erreur.';
  const ERROR_POPUP_BLOCKED = 'La fenêtre de connexion a été bloquée. Autorise les fenêtres pop-up pour ce site (icône à droite de la barre d\'adresse), puis réessaie.';
  const ERROR_NETWORK = 'Connexion impossible pour le moment. Vérifie ta connexion internet, puis réessaie.';

  function startPopup(fb) {
    const provider = new fb.GoogleAuthProvider();
    // hd : simple indication (Google propose d'abord les comptes de l'école).
    // Le vrai contrôle est isAuthorized, après la connexion.
    provider.setCustomParameters({ hd: SCHOOL_DOMAIN, prompt: 'select_account' });
    fb.signInWithPopup(fb.auth, provider).then(function (result) {
      if (!isAuthorized(result.user)) {
        fb.signOut(fb.auth);
        showError(ERROR_NOT_ALLOWED);
        return;
      }
      storeAccess('full', result.user.email.toLowerCase());
      location.reload();
    }, function (error) {
      const code = error && error.code;
      // Fenêtre fermée par l'élève : pas une erreur, il peut recliquer.
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      showError(code === 'auth/popup-blocked' ? ERROR_POPUP_BLOCKED : ERROR_NETWORK);
    });
  }

  function signInWithGoogle() {
    showError('');
    if (firebaseModule) { startPopup(firebaseModule); return; }
    loadFirebase().then(startPopup, function () { showError(ERROR_NETWORK); });
  }

  /* La page s'affiche sans attendre Firebase (ce que retient l'appareil
     suffit pour décider), puis Firebase confirme en arrière-plan. Il ne
     contredit l'appareil que si sa session a disparu ou ne correspond plus
     (déconnexion, données du navigateur effacées) : retour à l'écran
     d'accès. Firebase injoignable (premier chargement hors ligne) : l'accès
     est gardé, comme avant Firebase. */
  function confirmFirebaseSession(stored) {
    loadFirebase().then(function (fb) {
      return fb.auth.authStateReady().then(function () {
        const user = fb.auth.currentUser;
        if (user && (user.email || '').toLowerCase() === stored.email) {
          showTeacherLinkIfTeacher(fb, stored.email);
          return;
        }
        clearAccess();
        document.head.appendChild(hideStyle);
        showAccessScreen();
      });
    }).catch(function () { /* hors ligne : on garde l'accès */ });
  }

  /* Lien « Tableau de bord » sur l'accueil, à côté du badge, pour un compte
     de la liste des enseignants (Firestore, teachers/{adresse}) seulement.
     Un élève peut demander sa propre fiche dans cette liste (règles) : elle
     n'existe pas, rien ne s'affiche. Les comptes hors école ne demandent rien
     (les règles refuseraient). */
  function showTeacherLinkIfTeacher(fb, email) {
    if (!isIndexPage() || !/@cnddinant\.be$/.test(email)) return;
    fb.getDoc(fb.doc(fb.db, 'teachers', email)).then(function (snap) {
      if (!snap.exists() || document.getElementById('dashboard-link')) return;
      const badge = document.getElementById('account-badge');
      if (!badge) return;
      const link = document.createElement('a');
      link.id = 'dashboard-link';
      link.className = 'account-badge';
      link.href = 'dashboard.html';
      link.textContent = 'Tableau de bord';
      link.style.marginLeft = '8px';
      link.style.textDecoration = 'none';
      badge.insertAdjacentElement('afterend', link);
    }).catch(function () { /* hors ligne ou refusé : pas de lien */ });
  }

  // « Changer de compte » : vraie déconnexion Firebase, puis écran d'accès.
  function signOutAndShowAccessScreen() {
    clearAccess();
    loadFirebase().then(function (fb) { return fb.signOut(fb.auth); }).catch(function () {});
    showAccessScreen();
  }

  const GOOGLE_G =
    '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">' +
    '<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>' +
    '<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>' +
    '<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>' +
    '<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>' +
    '</svg>';

  function renderGoogleButton(container) {
    container.innerHTML =
      '<button type="button" class="access-google-btn">' +
      '<span class="access-google-icon">' + GOOGLE_G + '</span>' +
      '<span class="access-google-label">Se connecter avec Google</span>' +
      '</button>';
    container.querySelector('button').addEventListener('click', signInWithGoogle);
    // Préchargement : le SDK est prêt avant le clic.
    loadFirebase().catch(function () {});
  }

  function handleVisitorClick() {
    storeAccess('visitor', null);
    // Pré-coche English immersion / Year 1 sur l'accueil, comme si l'élève
    // venait de les choisir lui-même — mêmes clés que celles qu'index.html
    // utilise déjà pour se souvenir d'un choix d'une visite à l'autre.
    // Stockage indisponible : pas grave, l'élève choisira lui-même sur l'accueil.
    SiteStorage.device.set('selectedLanguage', 'en');
    SiteStorage.device.set('selectedYear', 'year1');
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

  /* Un visiteur peut renoncer à se connecter : la croix le ramène où il
     était. Sur l'accueil (chapitre refusé au clic sur « Go », ou badge
     « Visiteur — se connecter »), la page est déjà visible : on retire juste
     le calque. Sur une page de chapitre ouverte directement, la page reste
     interdite : retour à l'accueil. Pas de croix sans accès visiteur (première
     visite, après « changer de compte ») : il faut alors choisir. */
  function closeButtonHtml() {
    const stored = readStoredAccess();
    if (!stored || stored.mode !== 'visitor') return '';
    return '<button type="button" class="access-close-btn" id="access-close-btn" aria-label="Fermer">×</button>';
  }

  function bindCloseButton(overlay) {
    const btn = overlay.querySelector('#access-close-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (document.getElementById('access-control-hide')) { location.href = HOME_URL; return; }
      overlay.remove();
    });
  }

  function showAccessScreen() {
    injectAccessStyles();
    const overlay = ensureOverlay();
    overlay.innerHTML =
      '<div class="access-screen">' +
      '<div class="access-card">' +
      closeButtonHtml() +
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
    bindCloseButton(overlay);
    // hideStyle reste en place : seul ce calque doit être visible, pas le
    // contenu réel de la page en dessous — voir la note sur hideStyle plus haut.
  }

  function showBlockedMessage() {
    injectAccessStyles();
    const overlay = ensureOverlay();
    overlay.innerHTML =
      '<div class="access-screen">' +
      '<div class="access-card">' +
      closeButtonHtml() +
      '<h1 class="access-title">Accès limité</h1>' +
      '<p class="access-subtitle">Identifie-toi avec une adresse autorisée pour accéder à cette partie du site.</p>' +
      '<img class="access-illustration" src="' + LIMITED_ACCESS_IMAGE + '" alt="" />' +
      '<button type="button" class="access-visitor-btn access-back-btn" id="access-back-btn">Se connecter avec Google</button>' +
      '</div>' +
      '</div>';

    overlay.querySelector('#access-back-btn').addEventListener('click', showAccessScreen);
    bindCloseButton(overlay);
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
      const hidden = modal.classList.contains('modal-open');
      badge.style.display = hidden ? 'none' : '';
      const link = document.getElementById('dashboard-link');
      if (link) link.style.display = hidden ? 'none' : '';
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
      badge.addEventListener('click', function () {
        const current = readStoredAccess();
        if (current && current.mode === 'full') signOutAndShowAccessScreen();
        else showAccessScreen();
      });
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

    if (stored && stored.mode === 'full') {
      revealContent();
      renderAccountBadge(stored);
      confirmFirebaseSession(stored);
      return;
    }

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

  // Adresse du compte Google connecté (accès complet en cours de validité),
  // sinon null : mode visiteur, pas encore connecté, accès expiré. Sert aux
  // labos, pour mettre le nom de l'élève sur son rapport.
  function currentEmail() {
    const stored = readStoredAccess();
    return stored && stored.mode === 'full' && stored.email ? stored.email : null;
  }

  window.AccessControl = { blockChapterIfNeeded: blockChapterIfNeeded, currentEmail: currentEmail, schoolDomain: SCHOOL_DOMAIN };
})();
