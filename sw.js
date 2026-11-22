/* AMO Toolkit — Offline-first Service Worker for PWA support */
const CACHE_NAME = 'amo-toolkit-v2';
const CORE_ASSETS = [
  './',
  './home.html',
  './404.html',
  './manifest.json',
  './favicon.svg',
  './css/styles.css?v=39',
  './js/main.js?v=56',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => {})
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isCdnAsset = /^(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.hostname);
  if (!isSameOrigin && !isCdnAsset) return;

  // Network-first for HTML pages so updates arrive immediately when online,
  // with cache fallback for offline lab use.
  if (req.mode === 'navigate' || (isSameOrigin && url.pathname.endsWith('.html'))) {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then(m => m || caches.match('./home.html')))
    );
    return;
  }

  // Stale-while-revalidate for CSS, JS, images, and CDN math/chart libraries.
  event.respondWith(
    caches.match(req).then(cached => {
      const net = fetch(req)
        .then(res => {
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || net;
    })
  );
});
