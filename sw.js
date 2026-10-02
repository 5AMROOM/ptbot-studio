// PT Link service worker (GitHub Pages only): the page works offline after the first visit and
// updates itself whenever it is opened online. tools/build_site.ps1 fills in CACHE and SHELL.
const CACHE = 'ptlink-0.8.5-ac427dd1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  './fonts/anuphan-400.woff2', './fonts/anuphan-600.woff2', './board-strom-mini.webp', './firmware/manifest.json', './firmware/ptlink-strom-mini-0.8.5.bin'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

function keep(request, response) {
  if (response.ok) {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(request, copy));
  }
  return response;
}

const NETWORK_WAIT_MS = 3000;  // "connected but no internet" can stall a request for many seconds

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const scope = new URL(self.registration.scope);
  // Only our own files: anything else (e.g. the page probing /api/status) goes straight to the network.
  if (event.request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  if (url.pathname.endsWith('.bin')) {  // firmware names carry the version: cache first
    event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(r => keep(event.request, r))));
    return;
  }
  // Page and firmware list: network first (newest when online), the cached copy when the network fails or
  // takes longer than NETWORK_WAIT_MS. A slow network response still refreshes the cache for next time.
  const network = fetch(event.request).then(r => keep(event.request, r));
  const cached = () => caches.match(event.request).then(hit => hit || caches.match('./index.html'));
  const timeout = new Promise(resolve => setTimeout(resolve, NETWORK_WAIT_MS));
  event.respondWith(
    Promise.race([network.catch(() => null), timeout]).then(r => r || cached().then(hit => hit || network))
  );
});
