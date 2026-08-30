/**
 * Suivi d'activité des élèves — reçoit les événements envoyés par tracking.js
 * (window.logEvent côté site) et les écrit dans l'onglet "Evenements" de ce
 * classeur. À coller tel quel dans l'éditeur Apps Script du projet déjà
 * déployé, puis redéployer la MÊME version (Déployer > Gérer les déploiements
 * > crayon d'édition > Nouvelle version > Déployer) pour garder la même URL
 * que celle déjà collée dans tracking.js.
 *
 * Ce script doit être lié (container-bound) au Google Sheet qui doit
 * recevoir les données — SpreadsheetApp.getActiveSpreadsheet() ci-dessous
 * suppose ça. Si ce projet est un script autonome, remplacer cet appel par
 * SpreadsheetApp.openById('ID_DU_CLASSEUR') dans getOrCreateSheet_().
 */

// Doit être identique au TRACKING_TOKEN de tracking.js.
const TOKEN = 'NHcVSmZC4JUnnvuaQg9oq5Qkqn1rnmPD3Ynv8RUx';

const SHEET_EVENTS = 'Evenements';
const SHEET_ELEVES = 'Eleves';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    if (body.token !== TOKEN) {
      return jsonResponse_({ ok: false, error: 'invalid token' });
    }

    const sheet = getOrCreateSheet_(SHEET_EVENTS, ['Horodatage', 'Email', 'Page', 'Evenement', 'Donnees']);
    sheet.appendRow([
      new Date(),
      body.email || '',
      body.page || '',
      body.event || '',
      // Les données varient par type d'événement (niveau, exercice, score...)
      // — stockées en JSON dans une seule colonne plutôt que d'imposer un
      // tableau à colonnes fixes qui ne conviendrait à aucun événement.
      JSON.stringify(body.data || {})
    ]);

    return jsonResponse_({ ok: true });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

// GET de courtoisie pour vérifier que le déploiement répond (ouvrir l'URL
// /exec dans un navigateur) — n'écrit jamais rien.
function doGet(e) {
  return jsonResponse_({ ok: true, message: 'Tracking endpoint actif. Utiliser POST pour envoyer un événement.' });
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * À lancer une seule fois manuellement (menu Exécuter > setupElevesSheet
 * dans l'éditeur Apps Script) pour créer l'onglet de référence "Eleves".
 * Rien ne le lit ni ne le modifie automatiquement pour l'instant — à
 * remplir à la main (email, prénom, nom, classe), sert de table de
 * correspondance pour une exploitation future des données.
 */
function setupElevesSheet() {
  getOrCreateSheet_(SHEET_ELEVES, ['Email', 'Prenom', 'Nom', 'Classe']);
}
