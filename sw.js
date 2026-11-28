/* AMO Toolkit — Offline-first Service Worker for PWA support */
const CACHE_NAME = 'amo-toolkit-v3';
const CORE_ASSETS = [
  './',
  './home.html',
  './404.html',
  './manifest.json',
  './favicon.svg',
  './css/styles.css?v=43',
  './js/main.js?v=60',
  // vendored libraries (vendor/README.md): most pages need them, so precache them for offline lab use
  './vendor/katex/0.16.11/katex.min.css',
  './vendor/katex/0.16.11/katex.min.js',
  './vendor/katex/0.16.11/contrib/auto-render.min.js',
  './vendor/chart.js/4.4.3/chart.umd.js',
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
  const isCdnAsset = /^(cdn\.jsdelivr\.net|cdn\.plot\.ly|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.hostname);
  if (!isSameOrigin && !isCdnAsset) return;
  // Leave large downloads (the book PDF, notebooks) and range requests to the network:
  // caching them would fill the visitor's storage, and a 206 partial response can't be cached.
  if (req.headers.has('range') || /\.(pdf|ipynb|zip)$/i.test(url.pathname)) return;

  // Network-first for HTML pages so updates arrive immediately when online,
  // with cache fallback for offline lab use.
  if (req.mode === 'navigate' || (isSameOrigin && url.pathname.endsWith('.html'))) {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then(m => m || (req.mode === 'navigate'
          // Redirect rather than serve home.html under another URL: its relative CSS/JS paths only resolve at the root.
          ? Response.redirect(new URL('./home.html', self.location).href, 302)
          : Response.error())))
    );
    return;
  }

  // Stale-while-revalidate for CSS, JS, fonts and images (KaTeX and Chart.js are vendored, so same-origin), Plotly and Google Fonts.
  event.respondWith(
    caches.match(req).then(cached => {
      const net = fetch(req)
        .then(res => {
          if (res && (res.status === 200 || res.type === 'opaque')) {
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
