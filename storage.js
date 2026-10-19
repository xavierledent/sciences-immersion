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
    'labProgress'               // [labId] — JSON {v, frame, data} (lab-engine.js)
  ]);

  // Limite d'une réponse écrite : les règles Firestore ne peuvent pas la
  // vérifier elles-mêmes (voir firestore.rules). La zone de réponse a la même
  // limite (maxlength, practice-engine.js) ; ceci n'est qu'un garde-fou.
  const ANSWER_MAX = 5000;

  const WRITE_DELAY = 3000;

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
    ? new URL('firebase-init.js', document.currentScript.src).href
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
       journal : envoyé ou non, pas encore confirmé (copie dans localStorage) */
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

  function flush() {
    clearTimeout(flushTimer);
    if (!cloud) return;
    const batch = cloud.pending;
    const families = Object.keys(batch);
    if (!families.length) return;
    cloud.pending = {};
    const fb = cloud.fb;
    const payload = { updatedAt: fb.serverTimestamp() };
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

  function loadCloud() {
    const chapterId = chapterIdFromPath(location.pathname);
    if (!chapterId || !FIREBASE_INIT || !firebaseAccessOnDevice()) return Promise.resolve();
    return import(FIREBASE_INIT).then(function (fb) {
      return fb.auth.authStateReady().then(function () {
        const user = fb.auth.currentUser;
        if (!user) return;
        const ref = fb.doc(fb.db, 'users', user.uid, 'chapters', chapterId);
        // Document absent, ou illisible hors ligne et jamais mis en cache :
        // on part d'un chapitre vide. Les écritures (merge) ne touchent que
        // leurs propres champs, rien d'existant n'est écrasé au retour du
        // réseau.
        return fb.getDoc(ref).then(function (snap) { return snap.exists() ? snap.data() : {}; },
                                   function () { return {}; })
          .then(function (stored) {
            const journalKey = 'cloudPending::' + user.uid + '::' + chapterId;
            cloud = { fb: fb, ref: ref, data: {}, pending: {}, journal: {}, journalKey: journalKey };
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
    }
  };
})(window);
