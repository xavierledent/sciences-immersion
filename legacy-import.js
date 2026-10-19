/* ===== Import des données d'avant Firebase (phase 5 de la migration) =====

   Module chargé par storage.js, une fois par appareil et par élève, juste
   après sa connexion Firebase. Lit tout ce que localStorage a gardé depuis
   septembre (toutes les pages, tous les chapitres), le convertit au format
   Firestore et le fusionne avec ce qui s'y trouve déjà.

   Règles :
   — Seulement si l'élève qui se connecte est celui qui utilisait l'appareil
     avant Firebase (accessToken.legacyEmail, gardé par access-control.js) :
     on n'importe jamais le travail d'un autre.
   — Fusion : meilleur score gardé pour les jeux ; pour tout le reste
     (réponses, autoévaluations, reprises, labos), la version Firestore
     l'emporte si elle existe.
   — Les données locales ne sont JAMAIS supprimées (retour arrière possible).
   — Une fois TOUT confirmé par Firestore, l'appareil le note
     (legacyImport::<uid>) ; sinon nouvel essai au prochain chargement, sans
     risque puisque la fusion donne le même résultat.
   — Jeux : l'ancienne clé contient le titre du jeu ; on cherche dans
     l'interactive.json du chapitre le jeu qui porte ce titre pour obtenir
     son id. Un jeu renommé entre-temps n'est pas retrouvé : ce record est
     perdu (compté dans la console).

   À retirer quand plus aucun appareil ne peut garder de données d'avant
   (ex. rentrée 2027) : ce fichier et son appel dans storage.js. */

// Famille de records → type de jeu dans interactive.json, et sens du
// « meilleur » (lower : moins d'erreurs, de coups, de secondes).
const GAME_FAMILIES = {
  qcmBestScore: { type: 'multipleChoice', best: 'qcm' },
  qcmProgress: { type: 'multipleChoice' },
  fitbBest: { type: 'fillBlanks', best: 'lower' },
  dndBest: { type: 'dragAndDrop', best: 'lower' },
  memoryBest: { type: 'matchPairs', best: 'lower' },
  sortingBest: { type: 'sorting', best: 'lower' }
};

function readJSON(text) {
  try { return JSON.parse(text); } catch (e) { return null; }
}

// Le meilleur des deux records, ou null si celui de Firestore est déjà le meilleur.
function betterLocal(family, local, remote) {
  const rule = GAME_FAMILIES[family];
  if (remote === undefined) return local;
  if (!rule || !rule.best) return null;
  if (rule.best === 'qcm') {
    const a = readJSON(local), b = readJSON(remote);
    if (!a || !b || !a.total || !b.total) return null;
    return a.score / a.total > b.score / b.total ? local : null;
  }
  const a = Number(local), b = Number(remote);
  return Number.isFinite(a) && (!Number.isFinite(b) || a < b) ? local : null;
}

/* options : { fb, user, families, chapterIdFromPath, siteRoot, storage }
   storage : { keys(), get(key), set(key, value) } sur localStorage. */
export async function importLegacy({ fb, user, families, chapterIdFromPath, siteRoot, storage }) {
  const email = (user.email || '').toLowerCase();
  const access = readJSON(storage.get('accessToken')) || {};
  const sameStudent = !!access.legacyEmail && access.legacyEmail.toLowerCase() === email;

  // 1. Regrouper les anciennes clés par chapitre : famille::<page>::parties…
  const byChapter = {};
  if (sameStudent) {
    storage.keys().forEach(key => {
      const parts = key.split('::');
      if (parts.length < 2 || !families.has(parts[0])) return;
      const chapterId = chapterIdFromPath(parts[1]);
      if (!chapterId) return;
      const entries = (byChapter[chapterId] = byChapter[chapterId] || []);
      entries.push({ family: parts[0], rest: parts.slice(2), value: storage.get(key) });
    });
  }

  const writes = [];
  const report = {};

  // 2. Chapitre par chapitre : convertir, fusionner, écrire.
  for (const chapterId of Object.keys(byChapter)) {
    const entries = byChapter[chapterId];
    const counts = (report[chapterId] = { imported: 0, kept: 0, lostGames: 0 });

    // Titres de jeux → id, d'après l'interactive.json du chapitre.
    let games = null;
    if (entries.some(e => GAME_FAMILIES[e.family])) {
      const [lang, year, chapter] = chapterId.split('_');
      try {
        const response = await fetch(new URL(lang + '/' + year + '/' + chapter + '/interactive.json', siteRoot));
        games = response.ok ? await response.json() : null;
      } catch (e) { games = null; }
      // Sans la liste des jeux, impossible de convertir : on réessaiera.
      if (!games) throw new Error('interactive.json illisible pour ' + chapterId);
    }

    const ref = fb.doc(fb.db, 'users', user.uid, 'chapters', chapterId);
    const snap = await fb.getDoc(ref);
    const remote = snap.exists() ? snap.data() : {};
    const payload = {};

    entries.forEach(({ family, rest, value }) => {
      if (value === null) return;
      let keyParts = rest;
      const game = GAME_FAMILIES[family];
      if (game) {
        const found = (games[game.type] || []).find(g => g.quizTitle === rest[0]);
        if (!found || !found.id) { counts.lostGames++; return; }
        keyParts = [found.id].concat(rest.slice(1));
      }
      const key = keyParts.join('::') || '_';
      const chosen = betterLocal(family, value, remote[family] ? remote[family][key] : undefined);
      if (chosen === null) { counts.kept++; return; }
      (payload[family] = payload[family] || {})[key] = chosen;
      counts.imported++;
    });

    if (Object.keys(payload).length) {
      payload.updatedAt = fb.serverTimestamp();
      // Pas d'await : l'écriture est d'abord appliquée au cache de
      // l'appareil (la page la voit tout de suite), puis confirmée par le
      // serveur.
      writes.push(fb.setDoc(ref, payload, { merge: true }));
    }
  }

  // 3. La fiche de l'élève.
  const userRef = fb.doc(fb.db, 'users', user.uid);
  const userSnap = await fb.getDoc(userRef);
  const profile = { email: user.email };
  if (!userSnap.exists()) profile.createdAt = fb.serverTimestamp();
  if (!userSnap.exists() || !userSnap.data().migratedAt) profile.migratedAt = fb.serverTimestamp();
  writes.push(fb.setDoc(userRef, profile, { merge: true }));

  console.info('Import des anciennes données (' + (sameStudent ? 'même élève' : 'aucune donnée de cet élève sur l\'appareil') + ') :', report);

  // 4. Noté sur l'appareil quand tout est confirmé.
  Promise.all(writes).then(() => {
    storage.set('legacyImport::' + user.uid, JSON.stringify({ at: new Date().toISOString(), sameStudent, report }));
  }, error => console.error('Import des anciennes données : à refaire au prochain chargement', error));
}
