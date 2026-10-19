(function () {
  /* Suivi de l'activité : chaque événement des moteurs (logEvent) devient
     +1 dans les compteurs Firestore du chapitre (SiteStorage.activity, dans
     storage.js), lus par le tableau de bord enseignant. Rien n'est compté
     pour un visiteur ni hors d'une page de chapitre.

     Jusqu'au 2026-10-20, les événements partaient aussi vers un Google Sheet
     (Apps Script) ; cet envoi est débranché (fin de la phase 6 de la
     migration Firebase) : plus rien ne quitte le site en dehors de Firestore.

     logEventBeacon (événements envoyés quand la page se cache ou se ferme) :
     même chose ; storage.js envoie tout de suite ce qui attend quand la page
     est cachée. Jamais d'erreur visible pour l'élève. */
  function record(eventName, data) {
    try {
      if (window.SiteStorage && SiteStorage.activity) SiteStorage.activity.record(eventName, data || {});
    } catch (e) { /* jamais d'erreur visible pour l'élève */ }
  }

  window.logEvent = record;
  window.logEventBeacon = record;
})();
