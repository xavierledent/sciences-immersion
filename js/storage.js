/* Stockage centralisé du site — le seul fichier qui touche à localStorage
   et aux données des élèves dans Firestore.

   Deux familles, séparées exprès :

   — SiteStorage.data : les DONNÉES PÉDAGOGIQUES de l'élève (réponses,
     auto-évaluations, scores et progression des QCM et des jeux, position de
     reprise, notes par attendu, labos). Deux destinations :
       · élève connecté par Firebase, sur une page de chapitre : Firestore,
         document users/{uid}/chapters/{chapitre} (ex. en_year1_bio1), un
         champ par famille, chaque valeur rangée sous ses parties jointes par
         « :: » ('_' si aucune partie) ;
       · visiteur, ou pas de session Firebase : localStorage, clé
         'famille::<location.pathname>::parties…' (format d'avant Firebase,
         que la phase 5 importe).
     Les moteurs ne voient pas la différence :
       SiteStorage.data.get('practiceAnswer', [levelKey, exerciseId, subIndex])

   — SiteStorage.device : les PRÉFÉRENCES DE L'APPAREIL (highContrast,
     showLiveTimer, selectedLanguage, selectedYear, lastVisitAt) et la clé
     d'accès accessToken. Elles concernent le Chromebook, pas l'élève, et
     restent en localStorage.

   Firestore, sans changer l'interface synchrone des moteurs :
     0. Première connexion sur cet appareil : import des données d'avant
        Firebase (legacy-import.js), sur n'importe quelle page.
     1. Dès le chargement de ce script, le document du chapitre est lu UNE
        fois (cache de l'appareil si pas de wifi) et gardé en mémoire.
     2. SiteStorage.ready (promesse, jamais rejetée) se résout quand c'est
        fait : les moteurs l'attendent avant leur première lecture. Ensuite,
        get/set/remove travaillent en mémoire, instantanément.
     3. Les écritures sont regroupées (WRITE_DELAY après la dernière, et
        toujours quand la page est cachée ou quittée), et seuls les champs
        modifiés partent (setDoc avec merge).
     4. Filet de sécurité : tant que Firestore n'a pas confirmé une écriture,
        elle reste notée dans localStorage (clé cloudPending::uid::chapitre)
        et est renvoyée au prochain chargement — une page fermée trop vite ou
        un wifi coupé ne perd rien.

   Valeurs toujours sous forme de texte (comme localStorage) : les moteurs
   gardent leur propre JSON.parse / Number(). Toute erreur de stockage est
   absorbée ici : lecture → null, écriture → sans effet. Le site continue de
   fonctionner, simplement sans mémoire.

   Doit être chargé avant tout autre script du site (premier <script> de
   chaque page). */
(function (global) {
  'use strict';

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function safeSet(key, value) {
    try { localStorage.setItem(key, String(value)); } catch (e) { /* stockage indisponible */ }
  }

  function safeRemove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* stockage indisponible */ }
  }

  // Liste fermée : une faute de frappe dans un moteur se verrait tout de
  // suite dans la console plutôt que de créer silencieusement une nouvelle
  // famille de clés que la migration ne connaîtrait pas. Même liste dans
  // firestore.rules (champs autorisés d'un chapitre) : modifier les deux.
  const DATA_FAMILIES = new Set([
    'practiceAnswer',           // [levelKey, exerciseId, subIndex]
    'practiceSelfAssess',       // [levelKey, exerciseId, subIndex] — JSON {level, answer}
    'practiceLastExercise',     // [levelKey]
    'practiceLastTouchedLevel', // []
    'qcmBestScore',             // [quizTitle] — JSON {score, total}
    'qcmProgress',              // [quizTitle] — JSON {questionIndex, score, streak}
    'fitbBest',                 // [quizTitle]
    'dndBest',                  // [quizTitle, stat]
    'memoryBest',               // [quizTitle, stat]
    'sortingBest',              // [quizTitle]
    'autoevalRating',           // [itemId]
    'labProgress',              // [labId] — JSON {v, frame, data} (lab-engine.js)
    'labResult',                // [labId] — JSON {maxStep, checks, best, last} (lab-engine.js)
    'doneAt'                    // [ex, levelKey, exerciseId] | [game, gameId] | [lab, labId] — écrit ici seulement (markDone)
  ]);

  /* Date du premier « fait » d'un élément (millisecondes, en texte), pour les
     devoirs du tableau de bord : fait à temps ou en retard. Mêmes critères que
     le tableau de bord (dashboard-data.js) : exercice = une sous-question
     répondue, jeu = un record enregistré, labo = un Check. Jamais réécrite :
     refaire un élément ne change pas sa date. Rien d'avant cette famille
     n'est daté ; le tableau de bord le compte comme fait à temps. */
  const GAME_FAMILIES = new Set(['qcmBestScore', 'fitbBest', 'dndBest', 'memoryBest', 'sortingBest']);

  function doneKey(family, parts, text) {
    if (family === 'practiceAnswer') return text.trim() ? ['ex', parts[0], parts[1]].join('::') : null;
    if (GAME_FAMILIES.has(family)) return 'game::' + parts[0];
    if (family === 'labResult') {
      let r = null;
      try { r = JSON.parse(text); } catch (e) { return null; }
      return r && r.checks > 0 ? 'lab::' + parts[0] : null;
    }
    return null;
  }

  function markDone(family, parts, text) {
    const key = doneKey(family, parts || [], text);
    if (key && !(cloud.data.doneAt && cloud.data.doneAt[key])) cloudWrite('doneAt', key, String(Date.now()));
  }

  // Limite d'une réponse écrite : les règles Firestore ne peuvent pas la
  // vérifier elles-mêmes (voir firestore.rules). La zone de réponse a la même
  // limite (maxlength, practice-engine.js) ; ceci n'est qu'un garde-fou.
  const ANSWER_MAX = 5000;

  const WRITE_DELAY = 3000;
  // Compteurs d'activité seuls (rien d'autre à enregistrer) : envoi moins
  // pressé, pour ne pas multiplier les écritures quand l'élève fait défiler
  // des cartes de vocabulaire. Ils partent aussi avec toute autre écriture.
  const STATS_DELAY = 30000;

  /* Compteurs d'activité (champ `stats` du document de chapitre), lus par le
     tableau de bord enseignant. Une action = +1 dans le compteur qui porte le
     nom de l'événement de suivi (tracking.js le transmet ici). Les sections
     servent à la « répartition de l'activité » du tableau de bord.
     Vocabulaire : l'événement vocabulary_session_ended est un instantané
     cumulé de la visite (même sessionId) ; on n'en compte que la différence
     avec l'instantané précédent, dans quatre compteurs à part. */
  const ACTIVITY_SECTIONS = {
    exercises: ['answer_checked', 'self_assess_rated', 'revision_mode_started', 'statement_language_toggled'],
    games: ['qcm_answer_checked', 'qcm_quiz_completed', 'fitb_completed', 'dnd_completed',
            'memory_completed', 'sorting_completed'],
    autoeval: ['autoeval_page_opened', 'autoeval_item_rated'],
    vocabulary: ['vocabulary_section_opened', 'vocabulary_sessions', 'vocabulary_cards_seen',
                 'vocabulary_flips', 'vocabulary_listens'],
    resources: ['resource_link_opened'],
    explorations: ['exploration_link_opened'],
    labs: ['lab_opened', 'lab_step_reached', 'lab_checked']
  };
  const COUNTED_EVENTS = new Set([].concat.apply([], Object.keys(ACTIVITY_SECTIONS)
    .map(function (section) { return ACTIVITY_SECTIONS[section]; })));

  function checkFamily(family) {
    if (!DATA_FAMILIES.has(family)) {
      console.error('SiteStorage : famille de données inconnue « ' + family + ' »');
    }
  }

  function localKey(family, parts) {
    return [family, location.pathname].concat(parts || []).join('::');
  }

  /* ===== Firestore ===== */

  const FIREBASE_INIT = document.currentScript
    ? new URL('../firebase/firebase-init.js', document.currentScript.src).href
    : '';
  const LEGACY_IMPORT = document.currentScript
    ? new URL('../firebase/legacy-import.js', document.currentScript.src).href
    : '';
  const SITE_ROOT = document.currentScript
    ? new URL('../', document.currentScript.src).href
    : '';

  // /en/year1/bio1/practice.html → en_year1_bio1 ; null hors chapitre.
  function chapterIdFromPath(path) {
    const m = /\/(en|nl)\/(year1|jaar1)\/([a-z]+\d+)\/[^/]*$/.exec(path);
    return m ? m[1] + '_' + m[2] + '_' + m[3] : null;
  }

  // Même lecture que access-control.js : accès complet par Firebase, pas
  // expiré. Évite de charger Firebase pour un visiteur.
  function firebaseAccessOnDevice() {
    let a = null;
    try { a = JSON.parse(safeGet('accessToken') || 'null'); } catch (e) { return false; }
    return !!a && a.mode === 'full' && a.provider === 'firebase' && a.expires > Date.now();
  }

  function cloudKey(parts) {
    return (parts || []).join('::') || '_';
  }

  /* cloud : null tant que Firestore n'est pas prêt, ou pour toujours
     (visiteur, page hors chapitre, Firebase injoignable) → localStorage.
       data    : le document du chapitre, en mémoire
       pending : modifié, pas encore envoyé
       journal : envoyé ou non, pas encore confirmé (copie dans localStorage)
       statsPending : compteurs d'activité pas encore envoyés { nom: +n }.
         Pas de journal pour eux : un ajout (increment) renvoyé deux fois
         compterait deux fois, et le cache de Firestore garde déjà les
         écritures faites hors ligne. Au pire, une page fermée très vite
         perd quelques unités. */
  let cloud = null;
  let flushTimer = null;

  function saveJournal() {
    if (Object.keys(cloud.journal).length) safeSet(cloud.journalKey, JSON.stringify(cloud.journal));
    else safeRemove(cloud.journalKey);
  }

  // value : texte, ou null pour une suppression.
  function cloudWrite(family, key, value) {
    if (value === null) { if (cloud.data[family]) delete cloud.data[family][key]; }
    else (cloud.data[family] = cloud.data[family] || {})[key] = value;
    (cloud.pending[family] = cloud.pending[family] || {})[key] = value;
    (cloud.journal[family] = cloud.journal[family] || {})[key] = value;
    saveJournal();
    clearTimeout(flushTimer);
    flushTimer = setTimeout(flush, WRITE_DELAY);
  }

  function addStat(name, n) {
    if (!(n > 0)) return;
    cloud.statsPending[name] = (cloud.statsPending[name] || 0) + n;
    if (!flushTimer) flushTimer = setTimeout(flush, STATS_DELAY);
  }

  const vocabSnapshots = {}; // sessionId → dernier instantané compté

  function countEvent(name, data) {
    if (name === 'vocabulary_session_ended') {
      const id = data && data.sessionId;
      if (!id) return;
      const prev = vocabSnapshots[id] || { nbCartesVues: 0, nbRetournees: 0, nbEcoutes: 0 };
      if (!vocabSnapshots[id]) addStat('vocabulary_sessions', 1);
      addStat('vocabulary_cards_seen', (data.nbCartesVues || 0) - prev.nbCartesVues);
      addStat('vocabulary_flips', (data.nbRetournees || 0) - prev.nbRetournees);
      addStat('vocabulary_listens', (data.nbEcoutes || 0) - prev.nbEcoutes);
      vocabSnapshots[id] = {
        nbCartesVues: Math.max(prev.nbCartesVues, data.nbCartesVues || 0),
        nbRetournees: Math.max(prev.nbRetournees, data.nbRetournees || 0),
        nbEcoutes: Math.max(prev.nbEcoutes, data.nbEcoutes || 0)
      };
      return;
    }
    if (COUNTED_EVENTS.has(name)) addStat(name, 1);
  }

  function flush() {
    clearTimeout(flushTimer);
    flushTimer = null;
    if (!cloud) return;
    const batch = cloud.pending;
    const families = Object.keys(batch);
    const stats = cloud.statsPending;
    const statNames = Object.keys(stats);
    if (!families.length && !statNames.length) return;
    cloud.pending = {};
    cloud.statsPending = {};
    const fb = cloud.fb;
    // updatedAt = date de la dernière activité (toute écriture en vient).
    const payload = { updatedAt: fb.serverTimestamp() };
    if (statNames.length) {
      payload.stats = {};
      statNames.forEach(function (name) { payload.stats[name] = fb.increment(stats[name]); });
    }
    families.forEach(function (family) {
      payload[family] = {};
      Object.keys(batch[family]).forEach(function (key) {
        const value = batch[family][key];
        payload[family][key] = value === null ? fb.deleteField() : value;
      });
    });
    // Promesse résolue quand le serveur a confirmé (hors ligne : au retour du
    // réseau). On ne retire alors du journal que ce qui n'a pas changé depuis.
    fb.setDoc(cloud.ref, payload, { merge: true }).then(function () {
      families.forEach(function (family) {
        const notes = cloud.journal[family];
        if (!notes) return;
        Object.keys(batch[family]).forEach(function (key) {
          if (notes[key] === batch[family][key]) delete notes[key];
        });
        if (!Object.keys(notes).length) delete cloud.journal[family];
      });
      saveJournal();
    }, function (error) {
      // Reste dans le journal : renvoyé au prochain chargement de page.
      console.error('SiteStorage : écriture Firestore refusée ou impossible', error);
    });
  }

  /* Import unique des données d'avant Firebase (legacy-import.js), une fois
     par appareil et par élève. Attendu avant la lecture du chapitre : à la
     première connexion, l'élève retrouve directement son ancien travail.
     Un échec n'empêche pas la page de fonctionner ; nouvel essai au
     prochain chargement. */
  function importLegacyOnce(fb, user) {
    if (!LEGACY_IMPORT || safeGet('legacyImport::' + user.uid)) return Promise.resolve();
    return import(LEGACY_IMPORT).then(function (m) {
      return m.importLegacy({
        fb: fb,
        user: user,
        families: DATA_FAMILIES,
        chapterIdFromPath: chapterIdFromPath,
        siteRoot: SITE_ROOT,
        storage: {
          keys: function () {
            try { return Object.keys(localStorage); } catch (e) { return []; }
          },
          get: safeGet,
          set: safeSet
        }
      });
    }).catch(function (error) {
      console.error('Import des anciennes données : à refaire au prochain chargement', error);
    });
  }

  function loadCloud() {
    const chapterId = chapterIdFromPath(location.pathname);
    if (!FIREBASE_INIT || !firebaseAccessOnDevice()) return Promise.resolve();
    return import(FIREBASE_INIT).then(function (fb) {
      return fb.auth.authStateReady().then(function () {
        const user = fb.auth.currentUser;
        if (!user) return;
        return importLegacyOnce(fb, user).then(function () { return user; });
      }).then(function (user) {
        if (!user || !chapterId) return;
        const ref = fb.doc(fb.db, 'users', user.uid, 'chapters', chapterId);
        // Document absent, ou illisible hors ligne et jamais mis en cache :
        // on part d'un chapitre vide. Les écritures (merge) ne touchent que
        // leurs propres champs, rien d'existant n'est écrasé au retour du
        // réseau.
        return fb.getDoc(ref).then(function (snap) { return snap.exists() ? snap.data() : {}; },
                                   function () { return {}; })
          .then(function (stored) {
            const journalKey = 'cloudPending::' + user.uid + '::' + chapterId;
            cloud = { fb: fb, ref: ref, data: {}, pending: {}, journal: {}, journalKey: journalKey,
                      statsPending: {} };
            DATA_FAMILIES.forEach(function (family) {
              if (stored[family] && typeof stored[family] === 'object') cloud.data[family] = Object.assign({}, stored[family]);
            });
            // Écritures jamais confirmées lors d'une visite précédente : elles
            // sont plus récentes que le document, on les réapplique et les renvoie.
            let journal = null;
            try { journal = JSON.parse(safeGet(journalKey) || 'null'); } catch (e) { journal = null; }
            if (journal) {
              Object.keys(journal).forEach(function (family) {
                Object.keys(journal[family]).forEach(function (key) { cloudWrite(family, key, journal[family][key]); });
              });
              flush();
            }
          });
      });
    }).catch(function (error) {
      console.error('SiteStorage : Firestore indisponible, travail gardé sur cet appareil', error);
    });
  }

  const ready = loadCloud();

  // Page cachée (changement d'onglet, Chromebook refermé) ou quittée :
  // envoyer tout de suite ce qui attend.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flush();
  });
  global.addEventListener('pagehide', flush);

  /* ===== Interface ===== */

  global.SiteStorage = {
    ready: ready,
    // 'cloud' (Firestore) ou 'local' (localStorage) — pour le diagnostic.
    mode: function () { return cloud ? 'cloud' : 'local'; },
    data: {
      get: function (family, parts) {
        checkFamily(family);
        if (!cloud) return safeGet(localKey(family, parts));
        const values = cloud.data[family];
        const value = values ? values[cloudKey(parts)] : undefined;
        return value === undefined ? null : value;
      },
      set: function (family, parts, value) {
        checkFamily(family);
        let text = String(value);
        if (family === 'practiceAnswer' && text.length > ANSWER_MAX) text = text.slice(0, ANSWER_MAX);
        if (!cloud) { safeSet(localKey(family, parts), text); return; }
        cloudWrite(family, cloudKey(parts), text);
        markDone(family, parts, text);
      },
      remove: function (family, parts) {
        checkFamily(family);
        if (!cloud) { safeRemove(localKey(family, parts)); return; }
        cloudWrite(family, cloudKey(parts), null);
      }
    },
    device: {
      get: safeGet,
      set: safeSet,
      remove: safeRemove
    },
    // Compteurs d'activité : appelé par tracking.js pour chaque événement de
    // suivi. Sans effet pour un visiteur ou hors d'une page de chapitre.
    activity: {
      sections: ACTIVITY_SECTIONS,
      record: function (name, data) {
        ready.then(function () {
          if (!cloud) return;
          try { countEvent(name, data); } catch (e) { return; }
          // Événement envoyé en quittant la page : ne pas attendre.
          if (document.visibilityState === 'hidden') flush();
        });
      }
    }
  };
})(window);
