// sw.js — MARS-KET 2.0 Service Worker (Caché estática versionada v1.1.69, excluyendo /api/*)
const CACHE_NAME = 'marsket-cache-v1.1.69';
const STATIC_ASSETS = [
  './',
  './index.html',
  './logo.png',
  './logo.jpg',
  './manifest.json?v=1.1.69',
  './css/tailwind.css?v=1.1.69',
  './js/lexicon-data.js?v=1.1.69',
  './js/config.js?v=1.1.69',
  './js/state.js?v=1.1.69',
  './js/auth.js?v=1.1.69',
  './js/ui-core.js?v=1.1.69',
  './js/ui-empresa-core.js?v=1.1.69',
  './js/ui-empresa-market.js?v=1.1.69',
  './js/ui-empresa-tech.js?v=1.1.69',
  './js/ui-empresa-finance.js?v=1.1.69',
  './js/ui-empresa-ops.js?v=1.1.69',
  './js/ui-empresa-gov-brand.js?v=1.1.69',
  './js/ui-docente-core.js?v=1.1.69',
  './js/ui-docente-eval.js?v=1.1.69',
  './js/ui-docente-management.js?v=1.1.69'
].map((path) => new URL(path, self.registration.scope).toString());

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // PROHIBIDO cachear /api/* o peticiones que no sean GET
  if (url.pathname.startsWith('/api/') || event.request.method !== 'GET') {
    return;
  }

  // Network-First para garantizar que siempre se sirva la versión más reciente del servidor, con fallback a caché offline
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() =>
        caches.match(event.request).then((res) => res || caches.match(new URL('./index.html', self.registration.scope).toString()) || caches.match('/index.html'))
      )
  );
});
