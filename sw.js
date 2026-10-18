// sw.js — MARS-KET 2.0 Service Worker (Caché estática versionada v1.0.18, excluyendo /api/state)
const CACHE_NAME = 'marsket-static-v1.0.18';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json',
  '/js/config.js?v=1.0.18',
  '/js/state.js?v=1.0.18',
  '/js/auth.js?v=1.0.18',
  '/js/ui-core.js?v=1.0.18',
  '/js/ui-empresa-core.js?v=1.0.18',
  '/js/ui-empresa-market.js?v=1.0.18',
  '/js/ui-empresa-tech.js?v=1.0.18',
  '/js/ui-empresa-finance.js?v=1.0.18',
  '/js/ui-empresa-ops.js?v=1.0.18',
  '/js/ui-empresa-gov-brand.js?v=1.0.18',
  '/js/ui-docente-core.js?v=1.0.18',
  '/js/ui-docente-eval.js?v=1.0.18',
  '/js/ui-docente-management.js?v=1.0.18'
];

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

  // PROHIBIDO cachear /api/state o peticiones que no sean GET
  if (url.pathname.startsWith('/api/state') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
