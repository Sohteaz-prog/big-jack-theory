// Service worker de Big Jack Theory.
//
// Stratégie : réseau d'abord pour la page, cache d'abord pour les ressources
// fixes. Une mise à jour déposée sur l'hébergeur est donc prise en compte au
// lancement suivant si le téléphone est connecté, et l'application reste
// utilisable hors ligne dans tous les cas.
const CACHE = "big-jack-theory-1.62";
const FICHIERS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icone-192.png",
  "./icone-512.png",
  "./icone-512-maskable.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
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

  // Ressources fixes : cache d'abord, réseau en secours.
  e.respondWith(
    caches.match(e.request).then((rep) => rep || fetch(e.request).catch(() => caches.match("./index.html")))
  );
});
