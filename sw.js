/*
 * Tree of Everything service worker, generated at build time (see vite.config.ts),
 * which fills in this build's cache version and file list.
 *
 * - Install: cache the whole app (page, hashed bundle, manifest, icons), so a
 *   player who visited once can open the game offline.
 * - Pages: network first (new deploys show up at once), the cached page when offline.
 * - Hashed files: cache first; they never change under the same name.
 * - Only this game's own caches are ever deleted; the origin is shared with other
 *   GitHub Pages sites.
 */
const PREFIX = 'tree-of-everything-';
const CACHE = PREFIX + '5c1d98c1fb00';
const PRECACHE = ["./","./assets/index-Du97opRg.js","./assets/index-Bhaj9CqL.css","./manifest.webmanifest","./favicon.svg","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];
const SCOPE = self.registration.scope;
const PAGE_PATHS = [new URL(SCOPE).pathname, new URL(SCOPE).pathname + 'index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // revalidate with the server: the browser's HTTP cache may still hold the previous deploy's page
      .then((cache) => cache.addAll(PRECACHE.map((u) => new Request(u, { cache: 'no-cache' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const cacheable = (res) => res && res.ok && res.type === 'basic';

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !req.url.startsWith(SCOPE)) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // only the game page itself becomes the offline page (not an icon or the manifest opened in a tab)
          if (cacheable(res) && PAGE_PATHS.includes(url.pathname) && (res.headers.get('content-type') || '').startsWith('text/html')) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(SCOPE, copy));
          }
          return res;
        })
        .catch(() => caches.match(SCOPE).then((hit) => hit || caches.match(req, { ignoreSearch: true }))),
    );
    return;
  }

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (cacheable(res) && url.search === '') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
