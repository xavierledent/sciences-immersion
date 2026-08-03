/* Service worker : de la résilience, pas de la vitesse.

   Priorité fixée par l'enseignant : quand le réseau fonctionne, l'élève doit
   toujours voir la version la plus à jour — jamais une copie enregistrée qui
   traînerait en cache. Ce n'est que si le réseau échoue vraiment (coupure
   wifi en cours de travail) que la copie locale prend le relais.

   D'où deux stratégies différentes selon le type de fichier, et pas une seule
   règle pour tous :

   — Pages HTML, JS, CSS, JSON : réseau d'abord. Chaque succès réécrit aussi le
     cache, qui ne sert donc jamais une version plus vieille que la dernière
     visite réussie. C'est ce qui garantit la fraîcheur.

   — Images : cache d'abord. Une photo ne change quasiment jamais une fois
     publiée — et quand l'enseignant en remplace une, il la renomme
     systématiquement (déjà observé sur ce site), ce qui lui donne une adresse
     neuve plutôt que d'entrer en conflit avec l'ancienne en cache. Attendre le
     réseau à chaque affichage n'apporterait donc rien, seulement de la lenteur
     et de la donnée consommée pour rien sur le wifi de l'école.

   Les requêtes vers d'autres origines (polices Google) ne sont pas
   interceptées : leur propre cache HTTP s'en charge déjà, et gérer des
   réponses cross-origin ici ajouterait un risque pour un bénéfice nul. */

const CACHE_VERSION = 'v1';
const CACHE_NAME = 'sciences-immersion-' + CACHE_VERSION;

self.addEventListener('install', () => {
  // Bascule dès l'installation plutôt que d'attendre la fermeture de tous les
  // onglets : une mise à jour du service worker lui-même doit prendre effet
  // au prochain chargement de page, pas des jours plus tard.
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Purge des anciennes versions du cache. Sans ça, une correction de bug
  // dans ce fichier laisserait les anciennes entrées trainer indéfiniment —
  // l'inverse exact de ce qu'on cherche à garantir.
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return Response.error();
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(request.destination === 'image' ? cacheFirst(request) : networkFirst(request));
});
