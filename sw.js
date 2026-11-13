// sw.js — MARS-KET 2.0 Service Worker (Caché estática versionada v2.0.10, excluyendo /api/*)
const CACHE_NAME = 'marsket-cache-v2.0.10';
const STATIC_ASSETS = [
  './',
  './index.html',
  './logo.png',
  './logo.jpg',
  './manifest.json?v=2.0.10',
  './css/tailwind.css?v=2.0.10',
  './js/lexicon-data.js?v=2.0.10',
  './js/config.js?v=2.0.10',
  './js/state.js?v=2.0.10',
  './js/auth.js?v=2.0.10',
  './js/ui-core.js?v=2.0.10',
  './js/ui-empresa-core.js?v=2.0.10',
  './js/ui-empresa-market.js?v=2.0.10',
  './js/ui-empresa-tech.js?v=2.0.10',
  './js/ui-empresa-finance.js?v=2.0.10',
  './js/ui-empresa-ops.js?v=2.0.10',
  './js/ui-empresa-gov-brand.js?v=2.0.10',
  './js/ui-docente-core.js?v=2.0.10',
  './js/ui-docente-eval.js?v=2.0.10',
  './js/ui-docente-management.js?v=2.0.10',
  './js/ui-docente-contest.js?v=2.0.10'
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

  // Network-First con cache no-store para garantizar que siempre se sirva la versión más reciente del servidor
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
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
