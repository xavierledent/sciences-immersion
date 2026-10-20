/* ===== Labos virtuels : cadre commun =====

   Ce que tous les labos partagent, quelle que soit leur simulation : la
   démarche en 4 étapes (Predict → Experiment → Conclude → Check) et le rapport
   de labo imprimable selon la fiche outil FO3 (7 sections). Autour, ce qui
   doit se comporter partout pareil sur Chromebook tactile : la modale (plein
   écran, fermeture, Échap), la barre d'étapes, les verrous explicites, la
   bulle de traduction des mots soulignés, le glisser-déposer souris + doigt,
   le panneau superposé et le pied de l'étape Check (nom, classe, recommencer,
   imprimer).

   Chaque labo a sa simulation, commune aux deux filières (js/lab-<nom>.js +
   css/lab-<nom>.css), et ses textes, un fichier par langue dans le dossier du
   chapitre (lab-<nom>.<langue>.js, voir textFor). Chargés après celui-ci :
   textes, puis simulation. La simulation décrit ses étapes et appelle
   LabEngine.create(def). Plusieurs labos peuvent partager une page
   laboratory.html : chacun a sa propre modale, ouverte par le bouton
   data-lab-open="<id>" de sa carte.

   def = {
     id, title,
     glossary   : { mot: 'traduction' }, complète le lexique commun,
     reset()    : (re)crée l'état propre au labo, avec un nouveau tirage,
     stepComplete(n): l'étape 1, 2 ou 3 est-elle complète ? Progression
                  stricte : une étape ne s'ouvre que si toutes celles d'avant
                  sont complètes ; on peut toujours revenir en arrière. Check
                  (4) passe par lab.finish(), et après Check plus rien d'autre,
     lockReason(n): pourquoi l'étape n n'est pas complète, en une phrase
                  (texte de la bulle sur ce qui reste verrouillé),
     isStarted(): l'élève a-t-il commencé ? (« Restart » ne demande
                  confirmation que dans ce cas, et rien n'est enregistré
                  avant ; pas d'alerte du navigateur en quittant la page :
                  le travail est enregistré, voir Reprise),
     render     : { 1: fn, 2: fn, 3: fn, 4: fn }, chacune remplit lab.body et
                  le pied de page (lab.setFooter, ou lab.checkFooter à l'étape 4),
     report(mark): { title, sections: [7 × html], correction: html } ; chaque
                  erreur de l'élève passe par mark(html, note, { box }) (voir
                  reportHTML : correction au stylo rouge, notes numérotées ;
                  la version propre de l'élève en sort aussi, sans rien de plus),
     version    : numéro de la forme de save() ; l'augmenter dès qu'elle change
                  (une sauvegarde d'une autre version est ignorée),
     save()     : tirage et travail de l'élève, en JSON pur,
     load(data) : les remet en place (et remet à zéro ce qui ne vaut que pendant
                  une animation) ; lever une erreur si data ne convient pas,
     summary()  : { score, total, criteria: { clé: bool }, labels: { clé:
                  libellé }, details } pour le suivi (événement lab_checked,
                  résultat labResult lu par le tableau de bord)
   }

   Reprise : le travail est enregistré (SiteStorage, famille labProgress) à
   chaque action, en fermant le labo et en quittant la page. À la première
   ouverture du labo sur la page, une fenêtre propose « Continue » ou « Start
   again ». Restart efface la sauvegarde.

   Suivi (tracking.js) : lab_opened, lab_step_reached (étapes 2 et 3),
   lab_checked (score, critères, temps actif, verrous rencontrés).

   Verrous (règle commune à tout ce qui n'est pas encore accessible, barre
   d'étapes comprise) : lab.setLock(el, raison, { missing, key }). L'élément
   reste touchable mais pâli, avec un cadenas ; le toucher le fait refuser
   d'un petit mouvement et ouvre une bulle juste à côté, qui dit ce qui
   manque. missing : signaler aussi en rouge ce qui reste à faire (l'étape
   est redessinée avec lab.state.showMissing ; key retrouve l'élément ensuite). */

(function () {
  'use strict';

  const pageLang = location.pathname.split('/').includes('nl') ? 'nl' : 'en';

  const LABELS = {
    en: {
      steps: ['Predict', 'Experiment', 'Conclude', 'Check'],
      close: 'Close',
      fullscreen: 'Full screen',
      missingHypotheses: 'Some hypotheses are still missing.',
      missingHypothesis: 'Your hypothesis is not complete yet.',
      missingConclusions: 'Some conclusions are still missing.',
      frozen: 'Lab finished: you can look, but not change anything.',
      lockedCheck: 'Answer all the questions of “Conclude” first.',
      seeReport: 'See my lab report',
      reportView: 'Your lab report',
      reportMine: 'My report',
      reportCorrected: 'Corrected report',
      backToCheck: 'Back to the correction',
      printReport: 'Print',
      restart: 'Restart the lab',
      restartShort: 'Restart',
      restartTitle: 'Restart the lab?',
      restartText: 'Everything you did will be erased, and a new investigation will be drawn.',
      restartYes: 'Yes, restart',
      cancel: 'Cancel',
      resumeTitle: 'Lab in progress',
      resumeText: (n, step) => `You stopped at step ${n} · ${step}.`,
      resumeDoneTitle: 'Lab finished',
      resumeDoneText: 'Your correction and your lab report are still here.',
      resumeYes: 'Continue',
      resumeNo: 'Start again',
      report: {
        name: 'Name', className: 'Class', date: 'Date',
        sections: ['Question', 'Hypothesis', 'Materials', 'Procedure', 'Observations & results', 'Interpretation', 'Conclusion'],
        correction: 'Correction',
        mistake: 'Mistake',
        noMistake: 'No mistake in your report. Well done!'
      },
      dateLocale: 'en-GB'
    },
    nl: {
      steps: ['Voorspellen', 'Experimenteren', 'Besluiten', 'Controleren'],
      close: 'Sluiten',
      fullscreen: 'Volledig scherm',
      missingHypotheses: 'Er ontbreken nog hypotheses.',
      missingHypothesis: 'Je hypothese is nog niet volledig.',
      missingConclusions: 'Er ontbreken nog besluiten.',
      frozen: 'Labo afgewerkt: je kunt alles bekijken, maar niets meer veranderen.',
      lockedCheck: 'Beantwoord eerst alle vragen van “Besluiten”.',
      seeReport: 'Mijn labverslag bekijken',
      reportView: 'Je labverslag',
      reportMine: 'Mijn verslag',
      reportCorrected: 'Verbeterd verslag',
      backToCheck: 'Terug naar de verbetering',
      printReport: 'Afdrukken',
      restart: 'Het labo opnieuw starten',
      restartShort: 'Opnieuw',
      restartTitle: 'Het labo opnieuw starten?',
      restartText: 'Alles wat je gedaan hebt, wordt gewist, en je krijgt een nieuw onderzoek.',
      restartYes: 'Ja, opnieuw starten',
      cancel: 'Annuleren',
      resumeTitle: 'Labo bezig',
      resumeText: (n, step) => `Je bent gestopt bij stap ${n} · ${step}.`,
      resumeDoneTitle: 'Labo afgewerkt',
      resumeDoneText: 'Je verbetering en je labverslag zijn er nog.',
      resumeYes: 'Doorgaan',
      resumeNo: 'Opnieuw beginnen',
      report: {
        name: 'Naam', className: 'Klas', date: 'Datum',
        sections: ['Onderzoeksvraag', 'Hypothese', 'Materiaal', 'Werkwijze', 'Waarnemingen en resultaten', 'Interpretatie', 'Besluit'],
        correction: 'Verbetering',
        mistake: 'Fout',
        noMistake: 'Geen fouten in je verslag. Goed gedaan!'
      },
      dateLocale: 'nl-BE'
    }
  };
  const L = LABELS[pageLang];

  // Mots qui reviennent d'un labo à l'autre ; chaque labo ajoute les siens.
  const COMMON_GLOSSARY = {
    en: {
      hypothesis: 'hypothèse', bench: 'paillasse', notebook: 'cahier',
      sample: 'échantillon', samples: 'échantillons', tool: 'outil'
    },
    nl: {
      hypothese: 'hypothèse', labotafel: 'paillasse', schrift: 'cahier',
      staal: 'échantillon', stalen: 'échantillons', hulpmiddel: 'outil'
    }
  };

  /* Mots du lexique qui ont aussi un sens courant (« bij » : abeille, mais
     surtout « près de ») : soulignés seulement entre crochets, jamais
     d'office (voir Traduction des mots soulignés). */
  const MARKED_ONLY = { en: [], nl: ['bij'] };

  /* Textes des labos : un fichier par langue dans le dossier du chapitre
     (lab-<nom>.<langue>.js), chargé avant la simulation commune
     (js/lab-<nom>.js). Il appelle LabEngine.addText(id, textes) ; la
     simulation les reprend par LabEngine.textFor(id). Les deux langues ont
     les mêmes clés (vérifié par tools/validate-content.js). */
  const texts = {};
  function addText(id, text) { texts[id] = text; }
  function textFor(id) {
    if (!texts[id]) throw new Error(`Labo « ${id} » : textes manquants (lab-${id}.${pageLang}.js non chargé ?)`);
    return texts[id];
  }

  /* ===== Outils ===== */
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Générateur pseudo-aléatoire à graine : un même dessin (texture, éclats)
  // reste identique d'un affichage à l'autre.
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function seedFrom(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h;
  }

  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const lerp = (a, b, t) => a + (b - a) * t;

  const ease = {
    inOut: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    out: t => 1 - Math.pow(1 - t, 3),
    in: t => t * t * t,
    linear: t => t
  };

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Cadenas des verrous : anse arrondie, corps à reflet, trou de serrure.
     Couleur du texte (currentColor) : il prend le ton de ce qu'il verrouille. */
  const LOCK_SVG = `<svg class="lab-lock-svg" viewBox="0 0 20 24" aria-hidden="true" focusable="false">` +
    `<path d="M5.6 10.5V7.4a4.4 4.4 0 0 1 8.8 0v3.1" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>` +
    `<rect x="2.4" y="10" width="15.2" height="12.2" rx="3.2" fill="currentColor"/>` +
    `<rect x="4.1" y="11.5" width="11.8" height="2.4" rx="1.2" fill="#ffffff" fill-opacity="0.28"/>` +
    `<circle cx="10" cy="16.1" r="1.75" fill="#ffffff"/>` +
    `<path d="M10 17.2v2.3" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round"/></svg>`;

  // Cadenas ouvert : le bouton des enseignants qui lève les verrous (trou de
  // serrure découpé, pour rester lisible bouton allumé).
  const UNLOCK_SVG = `<svg class="lab-restart-svg" viewBox="0 0 20 24" aria-hidden="true" focusable="false">` +
    `<path d="M5.6 10.5V6.4a4.4 4.4 0 0 1 8.5-1.6" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>` +
    `<path fill="currentColor" fill-rule="evenodd" d="M5.6 10h8.8a3.2 3.2 0 0 1 3.2 3.2v5.8a3.2 3.2 0 0 1-3.2 3.2H5.6a3.2 3.2 0 0 1-3.2-3.2v-5.8A3.2 3.2 0 0 1 5.6 10zM10 14.4a1.75 1.75 0 1 0 0 3.5a1.75 1.75 0 1 0 0-3.5z"/></svg>`;

  // Bouton des enseignants : en français, comme le tableau de bord.
  const TEACHER = {
    unlock: 'Verrous',
    unlockTitle: 'Enseignant : lever tous les verrous pour vérifier le labo. Tant que la page est ouverte, rien n’est plus enregistré dans le suivi.'
  };

  const PRINT_SVG =`<svg class="lab-btn-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">` +
    `<path d="M7 9V3.5h10V9" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>` +
    `<rect x="3" y="9" width="18" height="8" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/>` +
    `<rect x="7" y="14" width="10" height="6.5" rx="1" fill="#ffffff" stroke="currentColor" stroke-width="2"/></svg>`;

  const REPORT_SVG = `<svg class="lab-btn-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">` +
    `<path d="M6 2.8h8.5L19 7.3v13.9H6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>` +
    `<path d="M14 3v4.6h4.6M9 12h7M9 15.5h7M9 19h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;

  /* Nom de l'élève tiré de son adresse d'école : prenom.nom@domaine →
     « Prenom Nom » (trait d'union gardé, nom en plusieurs parties accepté,
     chiffres de fin ignorés). Les accents ne sont pas dans l'adresse. Autre
     domaine ou pas d'adresse : null (ligne à remplir à la main). */
  function nameFromEmail(email, domain) {
    if (!email || !domain) return null;
    const [local, host] = String(email).toLowerCase().split('@');
    if (host !== domain) return null;
    const parts = local.replace(/\d+$/, '').split('.').filter(Boolean);
    if (!parts.length) return null;
    const cap = w => w.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('-');
    return parts.map(cap).join(' ');
  }

  function studentName() {
    const ac = window.AccessControl;
    return ac && ac.currentEmail ? nameFromEmail(ac.currentEmail(), ac.schoolDomain) : null;
  }

  // Flèche qui fait le tour : recommencer.
  const RESTART_SVG = `<svg class="lab-restart-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">` +
    `<path d="M19.6 13.4A7.8 7.8 0 1 1 17.3 6.6" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>` +
    `<path d="M18.6 2.9v4.6H14" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  // Lecture dans un cercle : reprendre.
  const RESUME_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">` +
    `<circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="2.3"/>` +
    `<path d="M10.2 8.4v7.2l5.6-3.6z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>`;

  /* ===== Éléments partagés par tous les labos de la page =====
     Le fantôme qui suit le doigt pendant un glisser, et le rapport imprimé
     (seul élément visible à l'impression, voir lab-engine.css). */
  function sharedElement(id, className) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.className = className;
      document.body.appendChild(el);
    }
    return el;
  }

  /* ===== Création d'un labo ===== */
  function create(def) {
    const ghostEl = sharedElement('lab-drag-ghost', 'lab-drag-ghost');
    ghostEl.setAttribute('aria-hidden', 'true');
    const reportEl = sharedElement('lab-report', 'lab-report');
    reportEl.classList.add('lab-doc');

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay lab-overlay';
    overlay.innerHTML =
      `<div class="modal-card lab-card" role="dialog" aria-modal="true" aria-labelledby="lab-title-${def.id}">` +
        `<div class="lab-header">` +
          `<button type="button" class="modal-fullscreen" data-lab-fullscreen aria-label="${L.fullscreen}">⛶</button>` +
          `<h2 id="lab-title-${def.id}" class="lab-title">${def.title}</h2>` +
          `<div class="lab-header-tools"><ol class="lab-stepper"></ol>` +
          `<button type="button" class="lab-restart lab-unlock" data-lab-unlock aria-pressed="false" title="${TEACHER.unlockTitle}" hidden>${UNLOCK_SVG}<span>${TEACHER.unlock}</span></button>` +
          `<button type="button" class="lab-restart" data-lab-restart title="${L.restart}" aria-label="${L.restart}">${RESTART_SVG}<span>${L.restartShort}</span></button></div>` +
          `<button type="button" class="modal-close" data-lab-close aria-label="${L.close}">×</button>` +
        `</div>` +
        `<div class="lab-body"></div>` +
        `<div class="lab-footer"></div>` +
        `<div class="lab-sheet" hidden></div>` +
        `<div class="lab-reportview" hidden>` +
          `<div class="lab-reportview-bar">` +
            `<div class="lab-reportview-tabs" role="tablist" aria-label="${L.reportView}">` +
              `<button type="button" role="tab" class="lab-reportview-tab" data-report-tab="mine">${L.reportMine}</button>` +
              `<button type="button" role="tab" class="lab-reportview-tab" data-report-tab="corrected">${L.reportCorrected}</button>` +
            `</div>` +
            `<button type="button" class="lab-btn lab-btn-primary lab-reportview-print" data-report-print>${PRINT_SVG}${L.printReport}</button>` +
            `<button type="button" class="modal-close" data-report-back aria-label="${L.backToCheck}" title="${L.backToCheck}">×</button>` +
          `</div>` +
          `<div class="lab-reportview-scroll"><article class="lab-paper lab-doc"></article></div>` +
        `</div>` +
        `<div class="lab-dialog" hidden></div>` +
      `</div>`;
    document.body.appendChild(overlay);

    const card = overlay.querySelector('.lab-card');
    const stepperEl = card.querySelector('.lab-stepper');
    const bodyEl = card.querySelector('.lab-body');
    const footerEl = card.querySelector('.lab-footer');
    const sheetEl = card.querySelector('.lab-sheet');
    const dialogEl = card.querySelector('.lab-dialog');
    const reportViewEl = card.querySelector('.lab-reportview');
    const paperEl = card.querySelector('.lab-paper');
    const fullscreenBtn = card.querySelector('[data-lab-fullscreen]');

    const glossary = Object.assign({}, COMMON_GLOSSARY[pageLang], def.glossary || {});

    /* Soulignement d'office : chaque mot du lexique est souligné partout où
       il apparaît dans le labo, même sans crochets (on ne teste pas la
       mémoire de l'élève). Le plus long d'abord (« energy meter » avant
       « meter »), mot entier, sans tenir compte de la casse. */
    const autoKeys = Object.keys(glossary)
      .filter(k => !(MARKED_ONLY[pageLang] || []).includes(k))
      .sort((a, b) => b.length - a.length);
    const autoRe = autoKeys.length
      ? new RegExp(`(?<![\\p{L}\\p{N}])(?:${autoKeys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')).join('|')})(?![\\p{L}\\p{N}])`, 'giu')
      : null;

    /* Enseignants (liste Firestore, voir AccessControl.isTeacher) : un bouton
       de l'en-tête lève tous les verrous, pour vérifier un labo sans tout
       refaire. Éteint à chaque chargement. Allumé : plus de cadenas
       (setLock), toutes les étapes accessibles (canReach), rien de figé après
       le Check (isFrozen). Dès qu'il a servi, plus rien n'est envoyé au
       suivi ni au résultat du tableau de bord (track, saveResult) jusqu'au
       rechargement de la page. */
    let unlocked = false;
    let wasUnlocked = false;

    // reached, activeMs et locksHit servent au suivi (voir Reprise et suivi).
    function freshFrameState() {
      return { step: 1, checked: false, showMissing: false, reached: 1, activeMs: 0, locksHit: 0 };
    }

    /* Animation interrompue dès que la scène change (autre étape, autre
       action) : chaque tween vérifie qu'il appartient toujours à la scène en
       cours, sinon il s'arrête sans toucher au DOM. */
    let sceneToken = 0;

    const lab = {
      L,
      lang: pageLang,
      card,
      body: bodyEl,
      footer: footerEl,
      state: null,

      $: sel => card.querySelector(sel),
      $$: sel => Array.from(card.querySelectorAll(sel)),

      newScene() { sceneToken++; return sceneToken; },
      isScene(token) { return token === sceneToken; },

      tween(token, duration, onUpdate, easing) {
        const fn = easing || ease.inOut;
        const d = reduceMotion ? Math.min(duration, 150) : duration;
        return new Promise(resolve => {
          const start = performance.now();
          function frame(now) {
            if (token !== sceneToken) { resolve(false); return; }
            const t = Math.min(1, (now - start) / d);
            onUpdate(fn(t), t);
            if (t < 1) requestAnimationFrame(frame);
            else resolve(true);
          }
          requestAnimationFrame(frame);
        });
      },

      wait(token, ms) {
        return new Promise(resolve => setTimeout(() => resolve(token === sceneToken), reduceMotion ? Math.min(ms, 100) : ms));
      },

      // [mot] ou [mot|clé] → mot souligné, traduction au survol ou au toucher.
      gloss(text) {
        return String(text).replace(/\[([^\]|]+)(?:\|([^\]]+))?\]/g, (all, word, key) => {
          const fr = glossary[(key || word).toLowerCase()];
          if (!fr) return word;
          return `<span class="lab-gloss" tabindex="0" data-translation="${escapeHtml(fr)}">${word}</span>`;
        });
      },

      setFooter(html) { footerEl.innerHTML = html; },

      /* Verrou explicite : le bouton suivant reste actif ; s'il manque quelque
         chose, ce texte le dit (warn) et le labo met en évidence ce qui reste
         à compléter. Un bouton grisé ne dit rien au doigt. */
      footerInfo(text, warn) {
        return `<span class="lab-footer-info ${warn ? 'is-warning' : ''}" aria-live="polite">${text}</span>`;
      },

      goToStep(n) {
        lab.state.step = n;
        lab.state.showMissing = false;
        render();
      },

      render() { render(); },
      renderStepper() { renderStepper(); },
      // Étapes 1 à 3 figées (labo corrigé, sauf verrous levés par un enseignant).
      isFrozen() { return isFrozen(); },

      // Seul chemin vers l'étape 4 : la correction verrouille le labo.
      finish() {
        lab.state.checked = true;
        lab.state.reached = 4;
        const s = def.summary ? def.summary() : {};
        track('lab_checked', {
          score: s.score, total: s.total, criteria: s.criteria || {},
          minutes: activeMinutes(), locksHit: lab.state.locksHit, details: s.details || {}
        });
        saveResult(4, {
          score: s.score, total: s.total, criteria: s.criteria || {},
          minutes: activeMinutes(), at: Date.now()
        }, s.labels);
        lab.goToStep(4);
      },

      // Enregistrer tout de suite (le moteur le fait déjà après chaque action).
      save() { saveProgress(); },

      makeDraggable,
      // Lâcher l'objet en main (makeDraggable, hold), avant de le redessiner.
      release() { releaseHeld(); },
      setLock,
      lockIcon: LOCK_SVG,
      openSheet,
      closeSheet,
      confirm: confirmDialog,

      /* Étape Check : le détail d'un critère prend la place libre. Le contenu
         de el (panneau à hauteur fixe) est agrandi d'un même facteur (zoom
         CSS, jusqu'à ×1.5) tant qu'il tient sans défiler. À rappeler après
         chaque changement du contenu ; refait quand l'écran change. */
      fillSpace(el) {
        if (!el) return;
        let inner = el.firstElementChild;
        if (!inner || !inner.classList.contains('lab-fill') || el.children.length > 1) {
          inner = document.createElement('div');
          inner.className = 'lab-fill';
          while (el.firstChild) inner.appendChild(el.firstChild);
          el.appendChild(inner);
        }
        fillEls.add(el);
        fitFill(el);
      },

      // Pied de l'étape Check, identique pour tous les labos : le rapport
      // s'affiche d'abord, l'impression se lance depuis là.
      checkFooter() {
        footerEl.innerHTML = `<div class="lab-footer-actions">` +
          `<button type="button" class="lab-btn lab-btn-primary" data-lab-report>${REPORT_SVG}${L.seeReport}</button></div>`;
        footerEl.querySelector('[data-lab-report]').addEventListener('click', openReport);
      }
    };

    lab.state = freshFrameState();
    def.reset();

    /* ===== Fenêtre de confirmation =====
       Dans le style du site, par-dessus le labo (jamais window.confirm).
       lab.confirm({ title, text, confirm, cancel, danger }) → Promise<bool>.
       Annuler : bouton, Échap ou toucher à côté. Le focus va sur « Annuler » :
       Entrée par réflexe n'efface rien. Quand c'est la réponse « oui » qui ne
       fait rien perdre (reprendre son travail) : focus: 'yes' et dismiss: true
       (Échap et toucher à côté valent alors « oui »). */
    let dialogResolve = null;
    let dialogDismiss = false;

    function confirmDialog(o) {
      closeDialog(dialogDismiss);
      return new Promise(resolve => {
        dialogResolve = resolve;
        dialogDismiss = !!o.dismiss;
        dialogEl.innerHTML = `<div class="lab-dialog-card ${o.danger ? 'is-danger' : ''}" role="alertdialog" aria-modal="true" aria-labelledby="lab-dialog-title-${def.id}" aria-describedby="lab-dialog-text-${def.id}">` +
          `<div class="lab-dialog-icon" aria-hidden="true">${o.icon || RESTART_SVG}</div>` +
          `<h3 class="lab-dialog-title" id="lab-dialog-title-${def.id}">${o.title}</h3>` +
          `<p class="lab-dialog-text" id="lab-dialog-text-${def.id}">${o.text}</p>` +
          `<div class="lab-dialog-actions">` +
            `<button type="button" class="lab-btn lab-btn-ghost" data-dialog="no">${o.cancel || L.cancel}</button>` +
            `<button type="button" class="lab-btn ${o.danger ? 'lab-btn-danger' : 'lab-btn-primary'}" data-dialog="yes">${o.confirm}</button>` +
          `</div></div>`;
        dialogEl.hidden = false;
        const buttons = Array.from(dialogEl.querySelectorAll('[data-dialog]'));
        buttons.forEach(b => b.addEventListener('click', () => closeDialog(b.dataset.dialog === 'yes')));
        // Tab reste entre les deux boutons.
        dialogEl.onkeydown = e => {
          if (e.key !== 'Tab') return;
          e.preventDefault();
          const i = buttons.indexOf(document.activeElement);
          buttons[(i + (e.shiftKey ? buttons.length - 1 : 1)) % buttons.length].focus();
        };
        dialogEl.onclick = e => { if (e.target === dialogEl) closeDialog(dialogDismiss); };
        buttons[o.focus === 'yes' ? 1 : 0].focus({ preventScroll: true });
      });
    }

    function closeDialog(answer) {
      if (!dialogResolve) return;
      const resolve = dialogResolve;
      dialogResolve = null;
      dialogEl.hidden = true;
      dialogEl.innerHTML = '';
      resolve(answer);
    }

    // Recommencer : demandé seulement s'il y a quelque chose à perdre.
    async function askRestart() {
      if ((def.isStarted() || lab.state.checked) &&
        !(await confirmDialog({ title: L.restartTitle, text: L.restartText, confirm: L.restartYes, danger: true }))) return;
      restart();
    }

    card.querySelector('[data-lab-restart]').addEventListener('click', askRestart);

    // Bouton des enseignants : montré seulement une fois la liste confirmée.
    const unlockBtn = card.querySelector('[data-lab-unlock]');
    if (window.AccessControl && AccessControl.isTeacher) {
      AccessControl.isTeacher().then(ok => { if (ok) unlockBtn.hidden = false; });
    }
    unlockBtn.addEventListener('click', () => {
      unlocked = !unlocked;
      if (unlocked) wasUnlocked = true;
      unlockBtn.classList.toggle('is-on', unlocked);
      unlockBtn.setAttribute('aria-pressed', String(unlocked));
      lab.state.showMissing = false;
      render();
    });

    function restart() {
      clearProgress();
      lab.state = freshFrameState();
      def.reset();
      if (activeSince) activeSince = Date.now();
      render();
    }

    /* ===== Reprise et suivi =====
       Sauvegarde : { v, frame, data }. Rien n'est lu ni écrit avant la
       première ouverture du labo, et rien n'est écrit tant que l'élève n'a
       pas commencé. Chaque élève a son propre Chromebook : une sauvegarde
       par labo et par appareil suffit. */
    const version = def.version || 1;
    let progressChecked = false;
    let saveTimer = 0;

    // Temps actif : labo ouvert et page visible, cumulé d'une séance à l'autre.
    let activeSince = 0;
    function startClock() { if (!activeSince) activeSince = Date.now(); }
    function stopClock() {
      if (!activeSince) return;
      lab.state.activeMs += Date.now() - activeSince;
      activeSince = 0;
    }
    function activeMinutes() {
      const ms = lab.state.activeMs + (activeSince ? Date.now() - activeSince : 0);
      return Math.round(ms / 6000) / 10;
    }

    function track(event, data) {
      if (wasUnlocked) return;
      if (window.logEvent) window.logEvent(event, Object.assign({ lab: def.id }, data));
    }

    function readProgress() {
      try {
        const saved = JSON.parse(SiteStorage.data.get('labProgress', [def.id]) || 'null');
        if (!saved || saved.v !== version) return null;
        return saved;
      } catch (e) {
        return null;
      }
    }

    function saveProgress() {
      clearTimeout(saveTimer);
      if (!progressChecked || !window.SiteStorage || !(def.isStarted() || lab.state.checked)) return;
      try {
        const frame = Object.assign({}, lab.state, { showMissing: false });
        frame.activeMs = lab.state.activeMs + (activeSince ? Date.now() - activeSince : 0);
        SiteStorage.data.set('labProgress', [def.id], JSON.stringify({ v: version, frame, data: def.save() }));
      } catch (e) { /* un labo sans save(), ou un état non sérialisable : pas de reprise */ }
    }

    // Après chaque geste : regroupés, pour ne pas écrire à chaque mouvement.
    function queueSave() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveProgress, 400);
    }

    /* Résultat du labo pour le tableau de bord enseignant (famille
       labResult), à part de la reprise : « Start again » efface labProgress
       mais pas ceci. { maxStep, checks, best, last, report, reportAt } ;
       best et last = { score, total, criteria, minutes, at } au moment d'un
       Check ; report = le rapport corrigé du dernier Check (HTML de
       reportHTML(true), tel que l'élève le voit), lu par la fiche élève ;
       labels = noms des critères { clé: libellé } (summary().labels), cumulés
       d'un Check à l'autre (les critères peuvent dépendre du tirage). */
    const REPORT_MAX = 150000; // garde-fou : un document Firestore fait 1 Mio au plus
    function saveResult(step, check, labels) {
      if (!window.SiteStorage || wasUnlocked) return;
      let r = null;
      try { r = JSON.parse(SiteStorage.data.get('labResult', [def.id]) || 'null'); } catch (e) { r = null; }
      r = r || { maxStep: 1, checks: 0, best: null, last: null };
      r.maxStep = Math.max(r.maxStep || 1, step);
      if (check) {
        r.checks = (r.checks || 0) + 1;
        r.last = check;
        const ratio = function (c) { return c && c.total ? c.score / c.total : -1; };
        if (ratio(check) > ratio(r.best)) r.best = check;
        if (labels) r.labels = Object.assign({}, r.labels, labels);
        try {
          const report = reportHTML(true);
          if (report.length <= REPORT_MAX) { r.report = report; r.reportAt = check.at; }
        } catch (e) { /* le rapport est un plus : le résultat s'enregistre sans lui */ }
      }
      SiteStorage.data.set('labResult', [def.id], JSON.stringify(r));
    }

    function clearProgress() {
      clearTimeout(saveTimer);
      if (window.SiteStorage) SiteStorage.data.remove('labProgress', [def.id]);
    }

    // Remet en place la sauvegarde ; false si rien à reprendre.
    function loadProgress() {
      const saved = readProgress();
      if (!saved) return false;
      try {
        def.load(saved.data);
        lab.state = Object.assign(freshFrameState(), saved.frame, { showMissing: false });
        return true;
      } catch (e) {
        def.reset();
        lab.state = freshFrameState();
        return false;
      }
    }

    async function askResume() {
      const st = lab.state;
      const yes = await confirmDialog({
        icon: RESUME_SVG,
        title: st.checked ? L.resumeDoneTitle : L.resumeTitle,
        text: st.checked ? L.resumeDoneText : L.resumeText(st.step, L.steps[st.step - 1]),
        confirm: L.resumeYes,
        cancel: L.resumeNo,
        focus: 'yes',
        dismiss: true
      });
      // « Start again » passe par la même confirmation que Restart.
      if (!yes && await confirmDialog({ title: L.restartTitle, text: L.restartText, confirm: L.restartYes, danger: true })) {
        restart();
        return false;
      }
      return true;
    }

    card.addEventListener('click', queueSave);
    card.addEventListener('change', queueSave);
    card.addEventListener('input', queueSave);
    document.addEventListener('visibilitychange', () => {
      if (!overlay.classList.contains('modal-open')) return;
      if (document.visibilityState === 'hidden') { stopClock(); saveProgress(); }
      else startClock();
    });
    window.addEventListener('pagehide', () => {
      if (overlay.classList.contains('modal-open')) stopClock();
      saveProgress();
    });

    /* ===== Traduction des mots soulignés =====
       Une seule bulle, placée dans la carte et positionnée en JS au-dessus du
       mot, ou en dessous s'il n'y a pas la place. Une bulle en CSS pur
       (::after du mot) était coupée par les zones à overflow: hidden. Souris :
       survol ; doigt et clavier : le mot prend le focus (tabindex). */
    const glossTip = document.createElement('div');
    glossTip.className = 'lab-gloss-tip';
    glossTip.setAttribute('role', 'tooltip');
    card.appendChild(glossTip);

    function showGloss(word) {
      glossTip.textContent = word.dataset.translation;
      glossTip.classList.add('is-visible');
      const c = card.getBoundingClientRect();
      const w = word.getBoundingClientRect();
      const t = glossTip.getBoundingClientRect();
      const gap = 8;
      let top = w.top - c.top - t.height - gap;
      if (top < 4) top = w.bottom - c.top + gap;
      const left = Math.max(4, Math.min(c.width - t.width - 4, w.left - c.left + w.width / 2 - t.width / 2));
      glossTip.style.top = `${top}px`;
      glossTip.style.left = `${left}px`;
    }

    function hideGloss() { glossTip.classList.remove('is-visible'); }

    card.addEventListener('mouseover', e => {
      const word = e.target.closest('.lab-gloss');
      if (word) showGloss(word);
    });
    card.addEventListener('mouseout', e => {
      const word = e.target.closest('.lab-gloss');
      if (word && !word.contains(e.relatedTarget) && document.activeElement !== word) hideGloss();
    });
    card.addEventListener('focusin', e => {
      if (e.target.classList.contains('lab-gloss')) showGloss(e.target);
    });
    card.addEventListener('focusout', e => {
      if (e.target.classList.contains('lab-gloss')) hideGloss();
    });

    /* Soulignement d'office (voir autoRe) : à chaque changement du labo, le
       texte nouveau est parcouru, SVG compris (tspan). Jamais dans ce qui se
       touche pour agir (bouton, onglet, zone à toucher, champ, étiquette de
       champ) : toucher le mot déclencherait l'action. Un mot souligné par
       crochets qui s'y trouve redevient du texte simple. Ni dans l'en-tête,
       les bulles et le rapport (une feuille). */
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const NO_GLOSS = 'button, [role="button"], [role="tab"], a, input, textarea, select, option, label, ' +
      'title, desc, style, script, .lab-header, .lab-reportview, .lab-gloss-tip, .lab-lock-tip, [data-no-gloss]';
    const NO_AUTO = `${NO_GLOSS}, .lab-gloss`;

    function glossTextNode(node) {
      const text = node.nodeValue;
      const parent = node.parentNode;
      if (!parent) return;
      autoRe.lastIndex = 0;
      const frag = document.createDocumentFragment();
      const svg = parent.namespaceURI === SVG_NS;
      let last = 0, m;
      while ((m = autoRe.exec(text))) {
        const fr = glossary[m[0].toLowerCase().replace(/\s+/g, ' ')];
        if (!fr) continue;
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const word = svg ? document.createElementNS(SVG_NS, 'tspan') : document.createElement('span');
        word.setAttribute('class', 'lab-gloss');
        word.setAttribute('tabindex', '0');
        word.setAttribute('data-translation', fr);
        word.textContent = m[0];
        frag.appendChild(word);
        last = m.index + m[0].length;
      }
      if (!last) return;
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      parent.replaceChild(frag, node);
    }

    function autoGloss(root) {
      if (root.nodeType === Node.TEXT_NODE) {
        if (autoRe && root.parentElement && !root.parentElement.closest(NO_AUTO)) glossTextNode(root);
        return;
      }
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      const words = [...root.querySelectorAll('.lab-gloss')];
      if (root.classList.contains('lab-gloss')) words.push(root);
      words.forEach(w => {
        if (w.parentElement && w.parentElement.closest(NO_GLOSS)) w.replaceWith(document.createTextNode(w.textContent));
      });
      if (!autoRe || root.closest(NO_AUTO)) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: n => (n.parentElement && !n.parentElement.closest(NO_AUTO) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT)
      });
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(glossTextNode);
    }

    // Ce qui vient d'être souligné ne contient plus de mot à souligner : pas de boucle.
    new MutationObserver(records => records.forEach(r => {
      if (r.type === 'characterData') { if (r.target.isConnected) autoGloss(r.target); }
      else r.addedNodes.forEach(n => { if (n.isConnected) autoGloss(n); });
    })).observe(card, { childList: true, subtree: true, characterData: true });

    /* ===== Labo corrigé : les étapes 1 à 3 se revoient, figées =====
       Après le Check, l'élève revient aux étapes précédentes pour revoir ses
       erreurs, sans rien y changer. Tout geste dans la zone du labo est
       arrêté ici, avant le labo et avant les verrous (phase de capture,
       écouteurs posés avant ceux des verrous). Un mot souligné garde son
       comportement par défaut (il prend le focus et montre sa traduction),
       sans que le geste atteigne le labo. Seules exceptions : les commandes
       marquées data-lab-look, qui ne font que montrer autre chose (un
       onglet, une vue rapprochée) sans rien changer au travail ; le labo s'en
       charge (lab.state.checked). Le pied de page du labo est remplacé par
       celui du mode figé, même s'il est réécrit plus tard. */
    const isFrozen = () => lab.state.checked && lab.state.step < 4 && !unlocked;
    const stopFrozen = e => {
      if (!isFrozen() || !bodyEl.contains(e.target)) return;
      if (e.type === 'keydown' && e.key === 'Tab') return;
      if (e.target.closest && e.target.closest('[data-lab-look]')) return;
      const onGloss = e.target.closest && e.target.closest('.lab-gloss');
      e.stopImmediatePropagation();
      if (onGloss) return;
      e.preventDefault();
      if (e.type === 'pointerdown' || e.type === 'keydown') nudgeFrozen();
    };
    ['pointerdown', 'mousedown', 'click', 'dblclick', 'keydown', 'beforeinput', 'paste', 'drop', 'dragstart', 'input', 'change']
      .forEach(t => card.addEventListener(t, stopFrozen, true));

    function frozenFooter() {
      footerEl.innerHTML = `<span class="lab-footer-info lab-frozen-info" data-lab-frozen>${LOCK_SVG}<span>${L.frozen}</span></span>` +
        `<div class="lab-footer-actions"><button type="button" class="lab-btn lab-btn-primary" data-lab-back-check>${L.backToCheck} →</button></div>`;
      footerEl.querySelector('[data-lab-back-check]').addEventListener('click', () => lab.goToStep(4));
    }
    new MutationObserver(() => {
      if (isFrozen() && !footerEl.querySelector('[data-lab-frozen]')) frozenFooter();
    }).observe(footerEl, { childList: true });

    // Un geste arrêté : le message du pied de page se secoue.
    function nudgeFrozen() {
      const info = footerEl.querySelector('[data-lab-frozen]');
      if (!info) return;
      info.classList.remove('lab-shake');
      void info.offsetWidth;
      info.classList.add('lab-shake');
    }

    /* ===== Verrous =====
       Un élément verrouillé n'est jamais un bouton grisé muet : il porte
       aria-disabled (le lecteur d'écran l'annonce) mais reste touchable.
       Les gestes sur lui sont interceptés ici, avant le labo (phase de
       capture) : pas de clic, pas de glisser, pas d'ouverture de liste. */
    const lockTip = document.createElement('div');
    lockTip.className = 'lab-lock-tip';
    lockTip.setAttribute('role', 'status');
    card.appendChild(lockTip);
    let lockTipTimer = 0;

    function setLock(el, reason, opts) {
      if (!el) return;
      const o = opts || {};
      const icon = el.querySelector(':scope > .lab-lock');
      if (!reason || unlocked) {
        el.classList.remove('lab-is-locked');
        el.removeAttribute('aria-disabled');
        delete el.dataset.lock;
        delete el.dataset.lockMissing;
        if (icon) icon.remove();
        return;
      }
      el.classList.add('lab-is-locked');
      el.setAttribute('aria-disabled', 'true');
      el.dataset.lock = reason;
      if (o.key) el.dataset.lockKey = o.key;
      if (o.missing) el.dataset.lockMissing = '1';
      else delete el.dataset.lockMissing;
      if (o.icon !== false && !icon && !['SELECT', 'INPUT', 'TEXTAREA'].includes(el.tagName)) {
        el.insertAdjacentHTML('afterbegin', `<span class="lab-lock" aria-hidden="true">${LOCK_SVG}</span>`);
      }
    }

    function lockedFrom(e) {
      const el = e.target.closest ? e.target.closest('.lab-is-locked') : null;
      return el && card.contains(el) ? el : null;
    }

    function hideLockTip() {
      clearTimeout(lockTipTimer);
      lockTip.classList.remove('is-visible');
    }

    function showLockTip(anchor, text) {
      lockTip.textContent = text;
      lockTip.classList.add('is-visible');
      const c = card.getBoundingClientRect();
      const a = anchor.getBoundingClientRect();
      const t = lockTip.getBoundingClientRect();
      const gap = 10;
      let top = a.top - c.top - t.height - gap;
      let below = false;
      if (top < 4) { top = a.bottom - c.top + gap; below = true; }
      const centre = a.left - c.left + a.width / 2;
      const left = Math.max(6, Math.min(c.width - t.width - 6, centre - t.width / 2));
      lockTip.style.top = `${top}px`;
      lockTip.style.left = `${left}px`;
      lockTip.style.setProperty('--arrow-x', `${centre - left}px`);
      lockTip.classList.toggle('is-below', below);
      clearTimeout(lockTipTimer);
      lockTipTimer = setTimeout(hideLockTip, 4500);
    }

    function explainLock(el) {
      const text = el.dataset.lock;
      const key = el.dataset.lockKey;
      let anchor = el;
      lab.state.locksHit++;
      // Signaler ce qui manque : l'étape est redessinée, l'élément aussi.
      if (el.dataset.lockMissing && !lab.state.showMissing) {
        lab.state.showMissing = true;
        render();
        anchor = key ? card.querySelector(`[data-lock-key="${key}"]`) : null;
      }
      if (!anchor || !anchor.isConnected) return;
      anchor.classList.remove('lab-shake');
      void anchor.offsetWidth;
      anchor.classList.add('lab-shake');
      showLockTip(anchor, anchor.dataset.lock || text);
    }

    const swallow = e => {
      if (!lockedFrom(e)) return;
      e.preventDefault();
      e.stopPropagation();
    };
    card.addEventListener('pointerdown', e => { if (!lockedFrom(e)) hideLockTip(); swallow(e); }, true);
    card.addEventListener('mousedown', swallow, true);
    card.addEventListener('click', e => {
      const el = lockedFrom(e);
      if (!el) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      explainLock(el);
    }, true);
    // Clavier : un bouton passe par le clic ; le reste (liste, zone SVG)
    // s'explique à Entrée ou Espace, et une liste verrouillée ne change pas.
    card.addEventListener('keydown', e => {
      const el = lockedFrom(e);
      if (!el || el.tagName === 'BUTTON' || e.key === 'Tab') return;
      e.preventDefault();
      e.stopPropagation();
      if (e.key === 'Enter' || e.key === ' ') explainLock(el);
    }, true);

    /* ===== Ouverture / fermeture ===== */
    async function openLab() {
      // Travail de l'élève chargé (Firestore) avant de chercher une reprise.
      // Lancé dès le chargement de la page : déjà prêt au moment du clic.
      if (window.SiteStorage) await SiteStorage.ready;
      overlay.classList.add('modal-open');
      document.body.classList.add('modal-is-open');
      let resumed = false;
      if (!progressChecked) {
        progressChecked = true;
        resumed = loadProgress();
      }
      startClock();
      render();
      fitToScreen();
      if (resumed) resumed = await askResume();
      track('lab_opened', { resumed, step: lab.state.step });
      saveResult(lab.state.step, null); // « commencé » pour le tableau de bord
    }

    function closeLab() {
      sceneToken++;
      releaseHeld();
      closeDialog(dialogDismiss);
      stopClock();
      saveProgress();
      hideGloss();
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      overlay.classList.remove('modal-open');
      document.body.classList.remove('modal-is-open');
    }

    document.querySelectorAll(`[data-lab-open="${def.id}"]`).forEach(b => b.addEventListener('click', openLab));
    card.querySelector('[data-lab-close]').addEventListener('click', closeLab);
    // Lien direct (laboratory.html?lab=<id>, devoir du tableau de bord) :
    // le labo s'ouvre comme sur un clic de sa carte.
    if (new URLSearchParams(location.search).get('lab') === def.id) requestAnimationFrame(openLab);

    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape' || !overlay.classList.contains('modal-open')) return;
      if (held) { releaseHeld(); return; }
      if (dialogResolve) { closeDialog(dialogDismiss); return; }
      if (!reportViewEl.hidden) { closeReport(); return; }
      if (!sheetEl.hidden) { closeSheet(); return; }
      if (!document.fullscreenElement) closeLab();
    });

    fullscreenBtn.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else if (card.requestFullscreen) card.requestFullscreen().catch(() => {});
    });
    document.addEventListener('fullscreenchange', () => {
      fullscreenBtn.classList.toggle('is-fullscreen', document.fullscreenElement === card);
      requestAnimationFrame(fitToScreen);
    });

    /* ===== Grand écran : le labo grandit avec la place =====
       Chaque labo est dessiné pour le Chromebook à 100 % (corps du labo de
       LAB_W × LAB_H). Avec plus de place (plein écran sur un grand écran),
       le corps et le pied de page sont agrandis d'un même facteur (zoom CSS) :
       tout grandit, au lieu d'ajouter du vide. Jamais réduits. Les mesures
       à l'écran (getBoundingClientRect, getScreenCTM) tiennent compte du zoom. */
    const LAB_W = 1204, LAB_H = 594, ZOOM_MAX = 1.8, FILL_MAX = 1.5;
    const fillEls = new Set();

    function fitFill(el) {
      const inner = el.querySelector(':scope > .lab-fill');
      if (!inner) return;
      inner.style.zoom = '';
      const fits = () => el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1;
      if (!el.clientHeight || !fits()) return;
      let lo = 1, hi = FILL_MAX;
      inner.style.zoom = String(hi);
      if (fits()) return;
      for (let i = 0; i < 7; i++) {
        const mid = (lo + hi) / 2;
        inner.style.zoom = mid.toFixed(3);
        if (fits()) lo = mid; else hi = mid;
      }
      inner.style.zoom = lo > 1.02 ? lo.toFixed(3) : '';
    }

    function fitToScreen() {
      if (!overlay.classList.contains('modal-open')) return;
      bodyEl.style.zoom = '';
      footerEl.style.zoom = '';
      const b = bodyEl.getBoundingClientRect();
      const f = footerEl.getBoundingClientRect();
      const z = Math.min(b.width / LAB_W, (b.height + f.height) / (LAB_H + f.height), ZOOM_MAX);
      if (z > 1.04) {
        bodyEl.style.zoom = z.toFixed(3);
        footerEl.style.zoom = z.toFixed(3);
      }
      fillEls.forEach(el => { if (el.isConnected) fitFill(el); else fillEls.delete(el); });
    }

    let fitTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(fitTimer);
      fitTimer = setTimeout(fitToScreen, 120);
    });

    /* ===== Étapes ===== */
    function render() {
      sceneToken++;
      releaseHeld();
      hideGloss();
      hideLockTip();
      closeSheet();
      closeReport();
      renderStepper();
      card.dataset.step = String(lab.state.step);
      card.classList.toggle('lab-is-frozen', isFrozen());
      def.render[lab.state.step]();
      if (isFrozen()) frozenFooter();
      // Étape 4 : lab_checked (lab.finish), plus complet.
      if (lab.state.step > lab.state.reached) {
        lab.state.reached = lab.state.step;
        if (lab.state.step < 4) {
          track('lab_step_reached', { step: lab.state.step, minutes: activeMinutes() });
          saveResult(lab.state.step, null);
        }
      }
      saveProgress();
    }

    // Première étape incomplète avant n (null : n est accessible).
    function blockingStep(n) {
      for (let k = 1; k < n; k++) if (!def.stepComplete(k)) return k;
      return null;
    }

    // Labo corrigé : toutes les étapes se revoient (figées, voir isFrozen).
    function canReach(n) {
      if (lab.state.checked || unlocked) return true;
      return blockingStep(n) == null;
    }

    function stepLockReason(n) {
      const k = blockingStep(n);
      return k === 3 ? L.lockedCheck : def.lockReason(k);
    }

    /* Barre d'étapes : l'étape en cours est un repère (inerte) ; les autres
       s'ouvrent si elles sont accessibles, sinon portent un cadenas qui dit
       pourquoi, comme partout. Check (4), une fois Conclude complet, fait la
       même chose que « Check my conclusions ». */
    function renderStepper() {
      const st = lab.state;
      stepperEl.innerHTML = L.steps.map((label, i) => {
        const n = i + 1;
        const current = n === st.step;
        const locked = !current && !canReach(n);
        const cls = current ? 'is-current' : (n < st.step || (st.checked && n < 4) ? 'is-done' : '');
        return `<li><button type="button" class="lab-step ${cls}" data-step="${n}" ${current ? 'disabled aria-current="step"' : ''}>` +
          `<span class="lab-step-num">${locked ? LOCK_SVG : n}</span><span class="lab-step-label">${label}</span></button></li>`;
      }).join('');
      stepperEl.querySelectorAll('button[data-step]').forEach(b => {
        const n = Number(b.dataset.step);
        if (n !== st.step && !canReach(n)) {
          // Ce qui bloque est l'étape affichée : on peut le montrer en rouge.
          setLock(b, stepLockReason(n), { icon: false, key: `step-${n}`, missing: blockingStep(n) === st.step });
        }
        b.addEventListener('click', () => {
          if (n === 4 && !st.checked) lab.finish();
          else lab.goToStep(n);
        });
      });
    }

    /* ===== Glisser-déposer (souris et doigt) =====
       Un geste court = toucher ; au-delà de 8 px, l'élément est saisi et suit
       le pointeur. Le clavier (Entrée, Espace) passe par le clic. Pendant la
       saisie, les cibles portent is-drop-ready ; celle survolée, is-drop-target.
       opts = { ghost: () => html, targets: () => [éléments où déposer],
                onDrop: cible => …, onTap: () => …,
                hold: true, onHold: enMain => … }

       hold (règle des labos : tout objet à poser sur une cible parmi
       plusieurs) : un toucher ou un clic prend l'objet « en main » au lieu
       d'appeler onTap. À la souris, l'objet devient le curseur (la flèche
       disparaît, un point marque l'endroit visé, au centre) ; les cibles
       s'annoncent (is-drop-ready) ; un clic ou un toucher sur une cible le
       pose (onDrop). Le reprendre, Échap ou en prendre un autre le lâche ;
       un clic ailleurs ne le lâche pas (geste manqué de peu). onHold dit au
       labo qu'il est pris ou lâché (légende, curseur). Le labo appelle
       lab.release() avant de redessiner l'objet. */
    let held = null;   // { el, opts } : l'objet en main

    const targetsOf = opts => (opts.targets ? opts.targets() : []).filter(Boolean);
    const targetAt = (opts, x, y) => targetsOf(opts).find(t => {
      const r = t.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });

    function placeGhost(x, y) {
      // En plein écran, seul l'élément plein écran est affiché : le
      // fantôme doit y être, sinon il reste invisible.
      const host = document.fullscreenElement || document.body;
      if (ghostEl.parentNode !== host) host.appendChild(ghostEl);
      ghostEl.style.transform = `translate(${x}px, ${y}px)`;
    }

    function takeHeld(el, opts, ev) {
      releaseHeld();
      held = { el, opts };
      el.classList.add('is-held');
      targetsOf(opts).forEach(t => t.classList.add('is-drop-ready'));
      ghostEl.innerHTML = opts.ghost();
      ghostEl.classList.add('is-carried');
      if (ev && ev.pointerType === 'mouse') showCarried(ev);
      if (opts.onHold) opts.onHold(true);
    }

    // À la souris, l'objet en main remplace le curseur.
    function showCarried(ev) {
      placeGhost(ev.clientX, ev.clientY);
      ghostEl.classList.add('is-visible');
      document.documentElement.classList.add('lab-carrying');
    }

    function hideCarried() {
      ghostEl.classList.remove('is-visible');
      document.documentElement.classList.remove('lab-carrying');
    }

    function releaseHeld() {
      if (!held) return;
      const { el, opts } = held;
      held = null;
      el.classList.remove('is-held');
      targetsOf(opts).forEach(t => t.classList.remove('is-drop-ready', 'is-drop-target'));
      hideCarried();
      ghostEl.classList.remove('is-carried');
      if (opts.onHold) opts.onHold(false);
    }

    // L'objet a été redessiné (autre lampe, autre vue) : il n'est plus en main.
    const heldGone = () => held && !held.el.isConnected && (releaseHeld(), true);

    document.addEventListener('pointermove', e => {
      if (!held || heldGone()) return;
      if (e.pointerType !== 'mouse') { hideCarried(); return; }
      showCarried(e);
      const over = targetAt(held.opts, e.clientX, e.clientY);
      targetsOf(held.opts).forEach(t => t.classList.toggle('is-drop-target', t === over));
    });

    // Poser : après les verrous et le mode figé (écouteurs posés avant).
    function dropHeldOn(e) {
      if (!held || heldGone()) return false;
      const target = targetsOf(held.opts).find(t => t.contains(e.target));
      if (!target) return false;
      e.preventDefault();
      e.stopPropagation();
      const { opts } = held;
      releaseHeld();
      opts.onDrop(target);
      return true;
    }
    card.addEventListener('click', dropHeldOn, true);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') dropHeldOn(e);
    }, true);

    function makeDraggable(el, opts) {
      const tap = ev => {
        if (!opts.hold) { opts.onTap(); return; }
        if (held && held.el === el) releaseHeld();
        else takeHeld(el, opts, ev);
      };

      el.addEventListener('pointerdown', e => {
        if (e.button !== 0 || el.disabled) return;
        const startX = e.clientX, startY = e.clientY;
        let dragging = false;
        el.setPointerCapture(e.pointerId);

        const targets = () => targetsOf(opts);

        function move(ev) {
          if (!dragging && Math.hypot(ev.clientX - startX, ev.clientY - startY) > 8) {
            dragging = true;
            releaseHeld();
            placeGhost(ev.clientX, ev.clientY);
            ghostEl.innerHTML = opts.ghost();
            ghostEl.classList.add('is-visible');
            el.classList.add('is-dragging');
            // Les cibles s'annoncent dès la saisie, pas seulement au survol.
            targets().forEach(t => t.classList.add('is-drop-ready'));
          }
          if (dragging) {
            placeGhost(ev.clientX, ev.clientY);
            const over = targetAt(opts, ev.clientX, ev.clientY);
            targets().forEach(t => t.classList.toggle('is-drop-target', t === over));
          }
        }

        function up(ev) {
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerup', up);
          el.removeEventListener('pointercancel', up);
          targets().forEach(t => t.classList.remove('is-drop-target', 'is-drop-ready'));
          if (dragging) {
            ghostEl.classList.remove('is-visible');
            el.classList.remove('is-dragging');
            const over = ev.type === 'pointerup' ? targetAt(opts, ev.clientX, ev.clientY) : null;
            if (over) opts.onDrop(over);
          } else if (ev.type === 'pointerup') {
            tap(ev);
          }
          el.dataset.pointerHandled = '1';
        }

        el.addEventListener('pointermove', move);
        el.addEventListener('pointerup', up);
        el.addEventListener('pointercancel', up);
      });

      // Activation au clavier : clic sans pointeur (detail === 0).
      el.addEventListener('click', e => {
        if (el.dataset.pointerHandled) { delete el.dataset.pointerHandled; return; }
        if (e.detail === 0) tap(null);
      });
    }

    /* ===== Panneau superposé (fiche de référence, tableau…) ===== */
    function openSheet(innerHtml, ariaLabel) {
      sheetEl.innerHTML = `<div class="lab-sheet-card" role="dialog" aria-label="${escapeHtml(ariaLabel || '')}">` +
        `<button type="button" class="modal-close lab-sheet-close" data-lab-sheet-close aria-label="${L.close}">×</button>${innerHtml}</div>`;
      sheetEl.hidden = false;
      const btn = sheetEl.querySelector('[data-lab-sheet-close]');
      btn.addEventListener('click', closeSheet);
      btn.focus({ preventScroll: true });
      sheetEl.onclick = e => { if (e.target === sheetEl) closeSheet(); };
    }

    function closeSheet() {
      sheetEl.hidden = true;
      sheetEl.innerHTML = '';
    }

    /* ===== Rapport de labo (fiche outil FO3 : 7 sections) =====
       Le labo fournit le contenu de chaque section ; l'en-tête (nom, classe,
       date), la numérotation et la mise en page sont les mêmes partout. Il
       s'affiche d'abord dans le labo, comme une feuille (seul endroit du labo
       qui défile : c'est un document) ; « Print » imprime la même chose. Le
       nom vient de l'adresse de connexion ; la classe reste à écrire à la
       main sur la feuille. Deux onglets : « My report » (sa version propre,
       ouverte d'abord) et « Corrected report » ; « Print » imprime l'onglet
       affiché. */
    let reportTab = 'mine';

    function reportHTML(corrected) {
      const R = L.report;
      /* Correction au stylo rouge : le labo passe chaque erreur par
         mark(html, note, { box }) — souligné ondulé (ou cadre, pour une case
         de tableau) et numéro, à l'endroit de l'erreur ; la note (pourquoi,
         et la bonne réponse) va dans « Correction » sous le même numéro.
         Le corps du rapport garde les mots de l'élève. Version propre : mark
         rend le texte tel quel, et la section « Correction » disparaît. */
      const notes = [];
      const mark = (html, note, o) => {
        if (!corrected) return html;
        notes.push(note);
        return `<span class="lab-mark ${o && o.box ? 'is-box' : ''}">${html}</span>` +
          `<span class="lab-mark-num" aria-label="${R.mistake} ${notes.length}">${notes.length}</span>`;
      };
      const rep = def.report(mark);
      const notesHTML = notes.length
        ? `<ol class="lab-report-notes">${notes.map((n, i) => `<li><span class="lab-mark-num">${i + 1}</span><span>${n}</span></li>`).join('')}</ol>`
        : `<p class="lab-report-allgood">${R.noMistake}</p>`;
      const today = new Date().toLocaleDateString(L.dateLocale, { day: 'numeric', month: 'long', year: 'numeric' });
      const name = studentName();
      return `<h1>${rep.title}</h1>` +
        `<div class="lab-report-id"><span><strong>${R.name}:</strong> ${name ? escapeHtml(name) : '<span class="lab-report-blank is-long"></span>'}</span>` +
        `<span><strong>${R.className}:</strong> <span class="lab-report-blank"></span></span><span><strong>${R.date}:</strong> ${today}</span></div>` +
        rep.sections.map((html, i) => `<section><h2><span>${i + 1}</span>${R.sections[i]}</h2>${html}</section>`).join('') +
        (corrected ? `<section class="lab-report-corr"><h2>${R.correction}</h2>${rep.correction}${notesHTML}</section>` : '');
    }

    const reportTabs = [...reportViewEl.querySelectorAll('[data-report-tab]')];

    function showReportTab(tab) {
      reportTab = tab;
      reportTabs.forEach(b => {
        const on = b.dataset.reportTab === tab;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
      });
      paperEl.innerHTML = reportHTML(tab === 'corrected');
      reportViewEl.querySelector('.lab-reportview-scroll').scrollTop = 0;
    }

    reportTabs.forEach((b, i) => {
      b.addEventListener('click', () => showReportTab(b.dataset.reportTab));
      b.addEventListener('keydown', e => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        const next = reportTabs[(i + (e.key === 'ArrowRight' ? 1 : reportTabs.length - 1)) % reportTabs.length];
        showReportTab(next.dataset.reportTab);
        next.focus();
      });
    });

    function openReport() {
      showReportTab('mine');
      reportViewEl.hidden = false;
      reportViewEl.querySelector('[data-report-print]').focus({ preventScroll: true });
    }

    function closeReport() {
      reportViewEl.hidden = true;
      paperEl.innerHTML = '';
    }

    function printReport() {
      reportEl.innerHTML = reportHTML(reportTab === 'corrected');
      window.print();
    }

    reportViewEl.querySelector('[data-report-back]').addEventListener('click', closeReport);
    reportViewEl.querySelector('[data-report-print]').addEventListener('click', printReport);

    return lab;
  }

  window.LabEngine = {
    create,
    addText,
    textFor,
    commonGlossary: COMMON_GLOSSARY,
    lang: pageLang,
    labels: L,
    util: { escapeHtml, mulberry32, seedFrom, pick, shuffle, lerp, ease, reduceMotion }
  };
})();
