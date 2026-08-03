/* Shared safe renderer for teacher-authored text.

   Every JSON field on this site is written in the admin tools, whose G/I/S
   buttons insert <strong>, <em> and <u>. Injecting those fields straight into
   innerHTML would make the formatting work but would also read a plain "<" as
   markup — and science statements legitimately contain them ("si T < 0 °C",
   "acide & base"). So the text is escaped first and only the formatting tags
   below are re-enabled afterwards.

   Side benefit: no arbitrary HTML from a JSON file can ever be executed.

   To allow a new tag (e.g. <sub>/<sup> for chemical formulas), add it to
   ALLOWED_TAGS here — this is the single place the four engines share. */
(function (global) {
  const ALLOWED_TAGS = 'strong|em|u|br';
  const TAG_RE = new RegExp('&lt;(\\/?)(' + ALLOWED_TAGS + ')\\s*\\/?&gt;', 'gi');

  // Returns a safe HTML string, for engines that build markup with templates.
  function richText(raw) {
    return String(raw == null ? '' : raw)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(TAG_RE, (match, slash, tag) => '<' + slash + tag.toLowerCase() + '>');
  }

  // Convenience wrapper for engines that write directly into an element.
  function setRichText(element, raw) {
    if (element) element.innerHTML = richText(raw);
  }

  global.richText = richText;
  global.setRichText = setRichText;

  /* ===== Type de pointeur réellement utilisé =====
     Posé ici parce que c'est le seul script chargé par toutes les pages du site.

     Le problème : sur un écran tactile, le navigateur simule l'arrivée d'un
     curseur au moment où le doigt se pose, mais jamais son départ. L'effet de
     survol reste donc collé au dernier élément touché — un bouton qui a l'air
     enfoncé alors qu'il ne l'est pas.

     Pourquoi les requêtes média n'y suffisent pas : (hover: hover) décrit le
     périphérique PRINCIPAL. Sur un Chromebook, c'est le pavé tactile, et la
     requête répond « souris » même quand l'élève travaille au doigt. Elle ne
     distingue donc rien sur une machine hybride — c'est-à-dire précisément sur
     les machines de vos élèves.

     On note donc le type du dernier geste, que le CSS lit via
     html[data-pointer='fine'] pour ne montrer les survols qu'à une vraie souris. */
  const root = document.documentElement;

  // Première estimation d'après la machine, corrigée dès le premier geste réel.
  root.dataset.pointer =
    global.matchMedia && global.matchMedia('(hover: hover) and (pointer: fine)').matches
      ? 'fine'
      : 'coarse';

  document.addEventListener('pointerdown', event => {
    root.dataset.pointer = (event.pointerType === 'touch' || event.pointerType === 'pen')
      ? 'coarse'
      : 'fine';
  }, true);

  /* Retour à la souris sans attendre un clic : sur un hybride, l'élève peut
     toucher l'écran puis reprendre le pavé tactile. La condition évite d'écrire
     dans le DOM à chaque pixel parcouru. */
  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'mouse' && root.dataset.pointer !== 'fine') {
      root.dataset.pointer = 'fine';
    }
  }, true);

  /* ===== Focus clavier dans les modales =====
     Deux manques aujourd'hui : ouvrir une modale ne déplace pas le focus
     dedans, Tab continue de parcourir la page cachée derrière ; et à la
     fermeture, le focus ne revient nulle part de précis — l'utilisateur au
     clavier doit repartir du haut de la page.

     Générique par construction, comme le suivi du pointeur ci-dessus : toutes
     les modales du site partagent .modal-overlay / .modal-card (jeux,
     exercices, sélection de section sur l'accueil), une seule observation
     couvre les deux fichiers HTML qui en contiennent sans toucher aux
     fonctions d'ouverture et de fermeture de chaque modale. Sans effet sur les
     pages qui n'en ont aucune : les recherches ci-dessous n'y trouvent rien. */
  const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function focusableIn(container) {
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
      .filter(el => el.getClientRects().length > 0);
  }

  function currentModalCard() {
    const overlay = document.querySelector('.modal-overlay.modal-open');
    return overlay ? overlay.querySelector('.modal-card') : null;
  }

  // Élément qui avait le focus juste avant l'ouverture, pour le lui rendre à
  // la fermeture. Une seule modale à la fois sur ce site, une seule variable
  // suffit — même hypothèse que celle déjà faite ailleurs dans le moteur.
  let elementBeforeModal = null;

  function onModalOpen(card) {
    elementBeforeModal = document.activeElement;

    /* La carte elle-même reçoit le focus, pas un bouton dedans : toutes portent
       déjà aria-labelledby vers leur titre, donc un lecteur d'écran annonce
       directement « boîte de dialogue, [titre] » — plus informatif que
       d'atterrir en silence sur une icône. Ça évite aussi qu'un Entrée resté
       au doigt après avoir ouvert la modale au clavier n'active par accident
       le premier bouton venu (plein écran, fermeture). */
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '-1');
    card.focus({ preventScroll: true });
  }

  function onModalClose() {
    if (elementBeforeModal && document.contains(elementBeforeModal)) {
      elementBeforeModal.focus({ preventScroll: true });
    }
    elementBeforeModal = null;
  }

  const modalWasOpen = new WeakMap();
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    modalWasOpen.set(overlay, overlay.classList.contains('modal-open'));
    new MutationObserver(() => {
      const isOpen = overlay.classList.contains('modal-open');
      if (isOpen === modalWasOpen.get(overlay)) return;
      modalWasOpen.set(overlay, isOpen);
      if (isOpen) {
        const card = overlay.querySelector('.modal-card');
        if (card) onModalOpen(card);
      } else {
        onModalClose();
      }
    }).observe(overlay, { attributes: true, attributeFilter: ['class'] });
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const card = currentModalCard();
    if (!card) return;

    const items = focusableIn(card);
    if (!items.length) { event.preventDefault(); return; }

    const first = items[0];
    const last = items[items.length - 1];

    /* Auto-guérison plutôt que suivi précis : le plein écran déplace parfois
       le focus de sa propre initiative pendant la transition, en dehors de
       tout code à nous. Une comparaison stricte à « premier » ou « dernier »
       élément laisserait alors Tab s'échapper silencieusement de la modale ;
       vérifier seulement que le focus est ENCORE quelque part dans la carte
       suffit à se corriger tout seul au prochain appui, sans avoir à deviner
       ce que le navigateur a fait entre-temps. */
    if (!card.contains(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus({ preventScroll: true });
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  }, true);

  /* ===== Service worker : résilience hors ligne =====
     Enregistré ici, dans le seul script chargé par toutes les pages, plutôt
     que dans chacune séparément.

     document.currentScript.src donne l'adresse RÉELLE de ce fichier, déjà
     résolue par le navigateur selon la profondeur de la page qui l'a chargé
     (../../../rich-text.js depuis un chapitre, rich-text.js depuis la racine).
     sw.js vit à côté, à la racine du dépôt : en dériver l'adresse à partir de
     celle-ci évite de deviner la profondeur nous-mêmes, et fonctionne aussi
     bien en sous-dossier GitHub Pages (…/sciences-immersion/) qu'à la racine
     d'un domaine.
     Capturé tout de suite : document.currentScript redevient null dès qu'on
     entre dans un callback asynchrone. */
  const swUrl = document.currentScript ? new URL('sw.js', document.currentScript.src).href : null;

  if (swUrl && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(swUrl).catch(() => {
        // Pas de service worker disponible (navigation privée, restriction
        // machine) : le site continue de fonctionner normalement, simplement
        // sans le filet de secours hors ligne.
      });
    });
  }

  /* ===== Préchargement du chapitre en cours =====
     Une fois qu'un élève a ouvert une page d'un chapitre, les trois autres
     sections de ce même chapitre se préparent en arrière-plan : s'il perd la
     connexion ensuite, tout le chapitre reste utilisable, pas seulement la
     page qu'il regardait au moment de la coupure.

     Portée volontairement limitée aux pages HTML, aux données JSON et aux
     images des niveaux/jeux — pas aux fiches PDF de Resources/Explorations.
     Leurs chemins suivent trois conventions différentes selon la section
     (dossier général, sous-dossier, dossier local), déjà source d'un bug
     réel sur ce site par le passé ; les reconstruire ici doublerait ce risque
     dans un fichier qui ne reçoit pas la même attention que le moteur
     principal. Un lien PDF cliqué une fois reste disponible ensuite comme
     n'importe quelle image, via le cache du service worker — seule
     l'anticipation avant le premier clic ne s'applique pas à eux. */
  const chapterMatch = location.pathname.match(
    /^(.*\/(?:en\/year1|nl\/jaar1)\/[a-z]+\d+\/)(practice|vocabulary|resources|explorations)\.html$/
  );

  if (chapterMatch && 'serviceWorker' in navigator) {
    const chapterBase = chapterMatch[1];
    const currentPage = chapterMatch[2];
    const PAGE_TYPES = ['practice', 'vocabulary', 'resources', 'explorations'];

    // Même lecture que gameImageSources()/levelImageSources() dans
    // practice-engine.js : les deux fichiers gardent des conventions de
    // chemin différentes, l'un relatif à préfixer, l'autre déjà complet.
    function imagesFromPracticeData(data) {
      const sources = [];
      Object.keys(data || {}).forEach(levelKey => {
        (data[levelKey] || []).forEach(item => {
          if (item && item.image) sources.push('assets/' + item.image);
        });
      });
      return sources;
    }

    function imagesFromInteractiveData(data) {
      const sources = [];
      data = data || {};
      (data.multipleChoice || []).forEach(quiz => {
        sources.push(quiz.image);
        (quiz.questions || []).forEach(q => sources.push(q.image));
      });
      (data.dragAndDrop || []).forEach(ex => sources.push(ex.backgroundImage));
      (data.fillBlanks || []).forEach(ex => sources.push(ex.image));
      (data.matchPairs || []).forEach(ex => {
        (ex.pairs || []).forEach(pair => {
          [pair.sideA, pair.sideB].forEach(side => {
            if (side && side.type === 'image') sources.push(side.content);
          });
        });
      });
      (data.sorting || []).forEach(ex => {
        (ex.items || []).forEach(item => {
          if (item && item.type === 'image') sources.push(item.content);
        });
      });
      return sources.filter(Boolean);
    }

    // Une requête à la fois, plutôt que tout d'un coup : sans ça, vingt-cinq
    // élèves ouvrant le même chapitre au même instant en début de cours
    // saturent le wifi partagé de l'école pendant quelques secondes. Étalées,
    // ces mêmes requêtes ne gênent ni la page en cours ni les autres postes.
    async function prefetchSequentially(urls) {
      for (const url of urls) {
        try { await fetch(url); } catch (e) { /* une adresse en échec ne doit pas arrêter les suivantes */ }
      }
    }

    async function prefetchChapter() {
      const htmlUrls = PAGE_TYPES
        .filter(type => type !== currentPage)
        .map(type => chapterBase + type + '.html');

      await prefetchSequentially(htmlUrls);

      const jsonNames = ['practice.json', 'interactive.json', 'vocabulary.json', 'resources.json', 'explorations.json'];
      const jsonUrls = jsonNames.map(name => chapterBase + name);
      const jsonResults = await Promise.all(jsonUrls.map(url =>
        fetch(url).then(r => r.ok ? r.json() : null).catch(() => null)
      ));

      const [practiceData, interactiveData] = jsonResults;
      const imageUrls = [
        ...imagesFromPracticeData(practiceData),
        ...imagesFromInteractiveData(interactiveData)
      ].map(path => chapterBase + path);

      await prefetchSequentially(imageUrls);
    }

    // Après le chargement complet, et avec un court délai : la page en cours
    // a toujours la priorité sur ce travail de fond, qui peut bien attendre
    // deux secondes de plus.
    window.addEventListener('load', () => {
      setTimeout(prefetchChapter, 2000);
    });
  }

  /* ===== Bandeau hors ligne =====
     Seul repère explicite pour l'élève : sans lui, un jeu jamais ouvert avant
     la coupure resterait silencieusement indisponible, sans qu'il comprenne
     pourquoi — exactement le genre de confusion qu'on a déjà traitée pour les
     autres messages d'erreur du site. */
  function ensureOfflineBanner() {
    let banner = document.getElementById('offline-banner');
    if (banner) return banner;
    banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.textContent = "Tu es hors ligne. Ce que tu as déjà ouvert reste utilisable — connecte-toi pour retrouver le reste.";
    document.body.appendChild(banner);
    return banner;
  }

  function updateOfflineBanner() {
    const banner = ensureOfflineBanner();
    banner.classList.toggle('is-visible', !navigator.onLine);
  }

  window.addEventListener('online', updateOfflineBanner);
  window.addEventListener('offline', updateOfflineBanner);
  document.addEventListener('DOMContentLoaded', updateOfflineBanner);
})(window);
