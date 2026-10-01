// PT Link service worker (GitHub Pages only): the page works offline after the first visit and
// updates itself whenever it is opened online. tools/build_site.ps1 fills in CACHE and SHELL.
const CACHE = 'ptlink-0.6.0-a6c83784';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './firmware/manifest.json', './firmware/ptlink-strom-mini-0.6.0.bin'];

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

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.endsWith('.bin')) {  // firmware names carry the version: cache first
    event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(r => keep(event.request, r))));
    return;
  }
  // Page and firmware list: network first (newest when online), the cached copy when offline.
  event.respondWith(fetch(event.request)
    .then(r => keep(event.request, r))
    .catch(() => caches.match(event.request).then(hit => hit || caches.match('./index.html'))));
});
