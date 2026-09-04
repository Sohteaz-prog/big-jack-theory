// Service worker de Big Jack Theory.
//
// Stratégie : réseau d'abord pour la page, cache d'abord pour les ressources
// fixes. Une mise à jour déposée sur l'hébergeur est donc prise en compte au
// lancement suivant si le téléphone est connecté, et l'application reste
// utilisable hors ligne dans tous les cas.
const CACHE = "big-jack-theory-1.59.3";
const FICHIERS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icone-192.png",
  "./icone-512.png",
  "./icone-512-maskable.png",
];

// Les polices vivent dans un cache à part, sans numéro de version. Le cache
// principal est vidé à chaque livraison ; y ranger les polices les ferait
// retélécharger à chaque fois, soit 128 Ko pour des fichiers qui ne changent
// jamais. Ce nom ne bouge que si les fichiers eux-mêmes changent.
const CACHE_POLICES = "big-jack-theory-polices-1";
const POLICES = [
  "./serif-600.woff2",
  "./serif-700.woff2",
  "./sans-400.woff2",
  "./sans-700.woff2",
  "./sans-400-italique.woff2",
  "./mono-400.woff2",
  "./mono-700.woff2",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    Promise.all([
      caches.open(CACHE).then((c) => c.addAll(FICHIERS)),
      // Si les polices sont déjà là, on n'y touche pas.
      caches.open(CACHE_POLICES).then((c) =>
        Promise.all(POLICES.map((u) => c.match(u).then((r) => (r ? null : c.add(u))))),
      ),
    ]).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) =>
        Promise.all(
          cles.filter((c) => c !== CACHE && c !== CACHE_POLICES).map((c) => caches.delete(c)),
        ),
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const estPage =
    e.request.mode === "navigate" ||
    (e.request.destination === "document") ||
    e.request.url.endsWith("/") ||
    e.request.url.endsWith("index.html");

  if (estPage) {
    // Réseau d'abord : la dernière version publiée l'emporte.
    e.respondWith(
      fetch(e.request)
        .then((rep) => {
          const copie = rep.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copie)).catch(() => {});
          return rep;
        })
        .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
    );
    return;
  }

  // Ressources fixes : cache d'abord, réseau en secours. caches.match() sans
  // préciser de cache interroge les deux, polices comprises.
  e.respondWith(
    caches.match(e.request).then((rep) => rep || fetch(e.request).catch(() => caches.match("./index.html")))
  );
});
