/* Stockage centralisé du site — le seul fichier qui touche à localStorage.

   Phase 0 de la migration vers Firebase (voir le plan de l'audit) : tous les
   moteurs passent par ici plutôt que d'ouvrir localStorage eux-mêmes. Le
   comportement est strictement identique à avant — mêmes clés, mêmes valeurs,
   caractère pour caractère, pour que les données déjà enregistrées par les
   élèves soient relues sans aucune conversion.

   Deux familles, séparées exprès :

   — SiteStorage.data : les DONNÉES PÉDAGOGIQUES de l'élève (réponses,
     auto-évaluations, scores et progression des QCM et des jeux, position de
     reprise, notes par attendu). Ce sont elles qui partiront dans Firebase à
     la phase 4 : seul ce fichier changera alors, pas les moteurs. C'est aussi
     pour ça que la clé est construite ICI (famille + adresse de la page +
     parties) et pas dans les moteurs : ce fichier sait à quel chapitre et à
     quel champ correspond chaque donnée, sans avoir à décortiquer une clé.
       SiteStorage.data.get('practiceAnswer', [levelKey, exerciseId, subIndex])
       → lit 'practiceAnswer::<location.pathname>::level1::4::0'

   — SiteStorage.device : les PRÉFÉRENCES DE L'APPAREIL (highContrast,
     showLiveTimer, selectedLanguage, selectedYear, lastVisitAt) et la clé
     d'accès accessToken. Elles concernent le Chromebook, pas l'élève, et
     resteront en localStorage même après la migration.

   Valeurs toujours sous forme de texte (comme localStorage) : les moteurs
   gardent leur propre JSON.parse / Number(). Toute erreur de stockage
   (navigation privée, quota plein, stockage bloqué) est absorbée ici, comme
   le faisait chaque moteur : lecture → null, écriture → sans effet. Le site
   continue de fonctionner, simplement sans mémoire.

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
  // famille de clés que la migration ne connaîtrait pas.
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
    'autoevalRating'            // [itemId]
  ]);

  function dataKey(family, parts) {
    if (!DATA_FAMILIES.has(family)) {
      console.error('SiteStorage : famille de données inconnue « ' + family + ' »');
    }
    return [family, location.pathname].concat(parts || []).join('::');
  }

  global.SiteStorage = {
    data: {
      get: function (family, parts) { return safeGet(dataKey(family, parts)); },
      set: function (family, parts, value) { safeSet(dataKey(family, parts), value); },
      remove: function (family, parts) { safeRemove(dataKey(family, parts)); }
    },
    device: {
      get: safeGet,
      set: safeSet,
      remove: safeRemove
    }
  };
})(window);
