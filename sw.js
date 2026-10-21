// sw.js — MARS-KET 2.0 Service Worker (Caché estática versionada v1.1.11, excluyendo /api/*)
const CACHE_NAME = 'marsket-static-v1.1.11';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json?v=1.1.11',
  '/css/tailwind.css?v=1.1.11',
  '/js/lexicon-data.js?v=1.1.11',
  '/js/config.js?v=1.1.11',
  '/js/state.js?v=1.1.11',
  '/js/auth.js?v=1.1.11',
  '/js/ui-core.js?v=1.1.11',
  '/js/ui-empresa-core.js?v=1.1.11',
  '/js/ui-empresa-market.js?v=1.1.11',
  '/js/ui-empresa-tech.js?v=1.1.11',
  '/js/ui-empresa-finance.js?v=1.1.11',
  '/js/ui-empresa-ops.js?v=1.1.11',
  '/js/ui-empresa-gov-brand.js?v=1.1.11',
  '/js/ui-docente-core.js?v=1.1.11',
  '/js/ui-docente-eval.js?v=1.1.11',
  '/js/ui-docente-management.js?v=1.1.11'
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

  // PROHIBIDO cachear /api/* o peticiones que no sean GET
  if (url.pathname.startsWith('/api/') || event.request.method !== 'GET') {
    return;
  }

  const isHTMLNavigation =
    event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') || '').includes('text/html') ||
    url.pathname === '/' ||
    url.pathname.endsWith('/index.html');

  if (isHTMLNavigation) {
    // Network-First para documentos HTML
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((res) => res || caches.match('/index.html')))
    );
    return;
  }

  // Cache-First con actualización en segundo plano para assets estáticos versionados
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);
      return cachedResponse || fetchPromise;
    })
  );
});
