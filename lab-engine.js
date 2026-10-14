/* ===== Labos virtuels : cadre commun =====

   Ce que tous les labos partagent, quelle que soit leur simulation : la
   démarche en 4 étapes (Predict → Experiment → Conclude → Check) et le rapport
   de labo imprimable selon la fiche outil FO3 (7 sections). Autour, ce qui
   doit se comporter partout pareil sur Chromebook tactile : la modale (plein
   écran, fermeture, Échap), la barre d'étapes, les verrous explicites, la
   bulle de traduction des mots soulignés, le glisser-déposer souris + doigt,
   le panneau superposé et le pied de l'étape Check (nom, classe, recommencer,
   imprimer).

   Chaque labo est un fichier à part, dans le dossier de son chapitre
   (lab-<nom>.js + lab-<nom>.css), chargé après celui-ci. Il décrit ses étapes
   et appelle LabEngine.create(def). Plusieurs labos peuvent partager une page
   laboratory.html : chacun a sa propre modale, ouverte par le bouton
   data-lab-open="<id>" de sa carte.

   def = {
     id, title,
     glossary   : { mot: 'traduction' }, complète le lexique commun,
     reset()    : (re)crée l'état propre au labo, avec un nouveau tirage,
     canReach(n): étape 2 ou 3 accessible ? (1 l'est toujours ; 4 seulement
                  par lab.finish(), et après Check plus rien d'autre),
     isStarted(): l'élève a-t-il commencé ? (avertissement avant de quitter),
     render     : { 1: fn, 2: fn, 3: fn, 4: fn }, chacune remplit lab.body et
                  le pied de page (lab.setFooter, ou lab.checkFooter à l'étape 4),
     report()   : { title, sections: [7 × html], correction: html }
   }

   Rien n'est enregistré : recharger la page repart de zéro. */

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
      namePlaceholder: 'Your name',
      classPlaceholder: 'Class',
      printReport: 'Print my lab report',
      restart: 'Restart the lab',
      restartConfirm: 'Restart the lab? Everything you did will be erased.',
      report: {
        name: 'Name', className: 'Class', date: 'Date',
        sections: ['Question', 'Hypothesis', 'Materials', 'Procedure', 'Observations & results', 'Interpretation', 'Conclusion'],
        correction: 'Correction'
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
      namePlaceholder: 'Je naam',
      classPlaceholder: 'Klas',
      printReport: 'Mijn labverslag afdrukken',
      restart: 'Het lab opnieuw starten',
      restartConfirm: 'Het lab opnieuw starten? Alles wat je gedaan hebt, wordt gewist.',
      report: {
        name: 'Naam', className: 'Klas', date: 'Datum',
        sections: ['Onderzoeksvraag', 'Hypothese', 'Materiaal', 'Werkwijze', 'Waarnemingen en resultaten', 'Interpretatie', 'Besluit'],
        correction: 'Verbetering'
      },
      dateLocale: 'nl-BE'
    }
  };
  const L = LABELS[pageLang];

  // Mots qui reviennent d'un labo à l'autre ; chaque labo ajoute les siens.
  const COMMON_GLOSSARY = {
    hypothesis: 'hypothèse', bench: 'paillasse', notebook: 'cahier',
    sample: 'échantillon', samples: 'échantillons', tool: 'outil'
  };

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

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay lab-overlay';
    overlay.innerHTML =
      `<div class="modal-card lab-card" role="dialog" aria-modal="true" aria-labelledby="lab-title-${def.id}">` +
        `<div class="lab-header">` +
          `<button type="button" class="modal-fullscreen" data-lab-fullscreen aria-label="${L.fullscreen}">⛶</button>` +
          `<h2 id="lab-title-${def.id}" class="lab-title">${def.title}</h2>` +
          `<ol class="lab-stepper"></ol>` +
          `<button type="button" class="modal-close" data-lab-close aria-label="${L.close}">×</button>` +
        `</div>` +
        `<div class="lab-body"></div>` +
        `<div class="lab-footer"></div>` +
        `<div class="lab-sheet" hidden></div>` +
      `</div>`;
    document.body.appendChild(overlay);

    const card = overlay.querySelector('.lab-card');
    const stepperEl = card.querySelector('.lab-stepper');
    const bodyEl = card.querySelector('.lab-body');
    const footerEl = card.querySelector('.lab-footer');
    const sheetEl = card.querySelector('.lab-sheet');
    const fullscreenBtn = card.querySelector('[data-lab-fullscreen]');

    const glossary = Object.assign({}, COMMON_GLOSSARY, def.glossary || {});

    function freshFrameState(keepIdentity) {
      return {
        step: 1,
        checked: false,
        showMissing: false,
        studentName: keepIdentity ? lab.state.studentName : '',
        studentClass: keepIdentity ? lab.state.studentClass : ''
      };
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

      // Seul chemin vers l'étape 4 : la correction verrouille le labo.
      finish() {
        lab.state.checked = true;
        lab.goToStep(4);
      },

      makeDraggable,
      openSheet,
      closeSheet,

      // Pied de l'étape Check, identique pour tous les labos.
      checkFooter() {
        footerEl.innerHTML = `<div class="lab-identity">` +
          `<input type="text" class="lab-input" data-lab-name placeholder="${L.namePlaceholder}" aria-label="${L.namePlaceholder}" value="${escapeHtml(lab.state.studentName)}" autocomplete="off">` +
          `<input type="text" class="lab-input lab-input-sm" data-lab-class placeholder="${L.classPlaceholder}" aria-label="${L.classPlaceholder}" value="${escapeHtml(lab.state.studentClass)}" autocomplete="off"></div>` +
          `<div class="lab-footer-actions">` +
          `<button type="button" class="lab-btn lab-btn-ghost" data-lab-restart>${L.restart}</button>` +
          `<button type="button" class="lab-btn lab-btn-primary" data-lab-print>${L.printReport}</button></div>`;
        footerEl.querySelector('[data-lab-name]').addEventListener('input', e => { lab.state.studentName = e.target.value; });
        footerEl.querySelector('[data-lab-class]').addEventListener('input', e => { lab.state.studentClass = e.target.value; });
        footerEl.querySelector('[data-lab-print]').addEventListener('click', printReport);
        footerEl.querySelector('[data-lab-restart]').addEventListener('click', () => {
          if (!window.confirm(L.restartConfirm)) return;
          restart();
        });
      }
    };

    lab.state = freshFrameState(false);
    def.reset();

    function restart() {
      lab.state = freshFrameState(true);
      def.reset();
      render();
    }

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

    /* ===== Ouverture / fermeture ===== */
    function openLab() {
      overlay.classList.add('modal-open');
      document.body.classList.add('modal-is-open');
      render();
    }

    function closeLab() {
      sceneToken++;
      hideGloss();
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      overlay.classList.remove('modal-open');
      document.body.classList.remove('modal-is-open');
    }

    document.querySelectorAll(`[data-lab-open="${def.id}"]`).forEach(b => b.addEventListener('click', openLab));
    card.querySelector('[data-lab-close]').addEventListener('click', closeLab);

    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape' || !overlay.classList.contains('modal-open')) return;
      if (!sheetEl.hidden) { closeSheet(); return; }
      if (!document.fullscreenElement) closeLab();
    });

    fullscreenBtn.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else if (card.requestFullscreen) card.requestFullscreen().catch(() => {});
    });
    document.addEventListener('fullscreenchange', () => {
      fullscreenBtn.classList.toggle('is-fullscreen', document.fullscreenElement === card);
    });

    /* ===== Étapes ===== */
    function render() {
      sceneToken++;
      hideGloss();
      closeSheet();
      renderStepper();
      card.dataset.step = String(lab.state.step);
      def.render[lab.state.step]();
    }

    function canReach(n) {
      if (lab.state.checked) return n === 4;
      if (n === 1) return true;
      if (n === 4) return false;
      return def.canReach(n);
    }

    function renderStepper() {
      const st = lab.state;
      stepperEl.innerHTML = L.steps.map((label, i) => {
        const n = i + 1;
        const cls = n === st.step ? 'is-current' : (n < st.step || (st.checked && n < 4) ? 'is-done' : '');
        const disabled = n === st.step || !canReach(n);
        return `<li><button type="button" class="lab-step ${cls}" data-step="${n}" ${disabled ? 'disabled' : ''} ${n === st.step ? 'aria-current="step"' : ''}>` +
          `<span class="lab-step-num">${n}</span><span class="lab-step-label">${label}</span></button></li>`;
      }).join('');
      stepperEl.querySelectorAll('button[data-step]').forEach(b => {
        b.addEventListener('click', () => lab.goToStep(Number(b.dataset.step)));
      });
    }

    /* ===== Glisser-déposer (souris et doigt) =====
       Un geste court = toucher ; au-delà de 8 px, l'élément est saisi et suit
       le pointeur. Le clavier (Entrée, Espace) passe par le clic.
       opts = { ghost: () => html, targets: () => [éléments où déposer],
                onDrop: cible => …, onTap: () => … } */
    function makeDraggable(el, opts) {
      el.addEventListener('pointerdown', e => {
        if (e.button !== 0 || el.disabled) return;
        const startX = e.clientX, startY = e.clientY;
        let dragging = false;
        el.setPointerCapture(e.pointerId);

        const targets = () => (opts.targets ? opts.targets() : []).filter(Boolean);
        const targetAt = (x, y) => targets().find(t => {
          const r = t.getBoundingClientRect();
          return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
        });

        function move(ev) {
          if (!dragging && Math.hypot(ev.clientX - startX, ev.clientY - startY) > 8) {
            dragging = true;
            ghostEl.innerHTML = opts.ghost();
            ghostEl.classList.add('is-visible');
            el.classList.add('is-dragging');
          }
          if (dragging) {
            ghostEl.style.transform = `translate(${ev.clientX}px, ${ev.clientY}px)`;
            const over = targetAt(ev.clientX, ev.clientY);
            targets().forEach(t => t.classList.toggle('is-drop-target', t === over));
          }
        }

        function up(ev) {
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerup', up);
          el.removeEventListener('pointercancel', up);
          targets().forEach(t => t.classList.remove('is-drop-target'));
          if (dragging) {
            ghostEl.classList.remove('is-visible');
            el.classList.remove('is-dragging');
            const over = ev.type === 'pointerup' ? targetAt(ev.clientX, ev.clientY) : null;
            if (over) opts.onDrop(over);
          } else if (ev.type === 'pointerup') {
            opts.onTap();
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
        if (e.detail === 0) opts.onTap();
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

    /* ===== Rapport imprimable (fiche outil FO3 : 7 sections) =====
       Le labo fournit le contenu de chaque section ; l'en-tête (nom, classe,
       date), la numérotation et la mise en page A4 sont les mêmes partout. */
    function printReport() {
      const R = L.report;
      const rep = def.report();
      const today = new Date().toLocaleDateString(L.dateLocale, { day: 'numeric', month: 'long', year: 'numeric' });
      reportEl.innerHTML =
        `<h1>${rep.title}</h1>` +
        `<div class="lab-report-id"><span><strong>${R.name}:</strong> ${escapeHtml(lab.state.studentName) || '……………………………'}</span>` +
        `<span><strong>${R.className}:</strong> ${escapeHtml(lab.state.studentClass) || '………'}</span><span><strong>${R.date}:</strong> ${today}</span></div>` +
        rep.sections.map((html, i) => `<section><h2><span>${i + 1}</span>${R.sections[i]}</h2>${html}</section>`).join('') +
        `<section class="lab-report-corr"><h2>${R.correction}</h2>${rep.correction}</section>`;
      window.print();
    }

    window.addEventListener('beforeunload', e => {
      if (def.isStarted() && !lab.state.checked) { e.preventDefault(); e.returnValue = ''; }
    });

    return lab;
  }

  window.LabEngine = {
    create,
    lang: pageLang,
    labels: L,
    util: { escapeHtml, mulberry32, seedFrom, pick, shuffle, lerp, ease, reduceMotion }
  };
})();
