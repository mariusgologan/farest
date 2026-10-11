/* Offline shell. Same-origin only: app files are cache-first, content files stale-while-revalidate,
   prices (products.csv) and configurator rates network-first, revalidated past the HTTP cache, the cached copy only offline.
   Bump VERSION when shipping, old caches are dropped. Paths are relative so any GitHub Pages sub-path works. */
const VERSION = 'farest-v49';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon.svg',
  'css/fonts.css', 'css/configurator.css', 'css/glass.css', 'js/ui/glass.js', 'css/chrome.css', 'js/ui/chrome.js', 'js/ui/pull.js', 'css/motion.css', 'js/ui/motion.js', 'fonts/inter-latin.woff2', 'fonts/inter-latin-ext.woff2', 'fonts/plus-jakarta-sans-latin.woff2', 'fonts/plus-jakarta-sans-latin-ext.woff2', 'css/tokens.css', 'css/base.css', 'css/surfaces.css', 'css/layout.css', 'css/components.css', 'css/overlays.css',
  'data/config.js', 'data/catalog.js', 'data/content.js',
  'js/core/util.js', 'js/core/parse.js', 'js/core/store.js', 'js/core/loader.js', 'js/core/contract.js', 'js/core/i18n.js', 'js/core/api.js', 'js/core/prices.js', 'js/core/router.js', 'js/core/actions.js',
  'js/ui/icons.js', 'js/ui/ambient.js', 'js/ui/toast.js', 'js/ui/overlay.js', 'js/ui/components.js',
  'js/views/overlays.js', 'js/cfg/rules.js', 'js/cfg/draw.js', 'js/cfg/projects.js', 'js/views/pages.js', 'js/views/configurator.js', 'js/app.js'];

self.addEventListener('install', e => e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.includes('/corporate/')) return; /* the corporate skin always loads from the network */
  const isContent = u.pathname.includes('/content/');
  if (/\/content\/(products\.csv|configurator\.json)$/.test(u.pathname)) return e.respondWith(caches.open(VERSION).then(cache =>
    fetch(new Request(e.request, { cache: 'no-cache' })).then(r => { if (r.ok) cache.put(e.request, r.clone()); return r; })
      .catch(() => cache.match(e.request).then(hit => hit || Response.error()))));
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(e.request);
    const net = fetch(e.request).then(r => { if (r.ok) cache.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit ? (isContent ? (net.catch(() => {}), hit) : hit) : net;
  }));
});
