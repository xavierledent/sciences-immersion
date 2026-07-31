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
})(window);
