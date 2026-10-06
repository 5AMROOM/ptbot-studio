// PTBOT Studio service worker (GitHub Pages only): the page works offline after the first visit and
// updates itself whenever it is opened online. tools/build_site.ps1 fills in CACHE and SHELL.
const CACHE = 'ptbot-studio-0.9.14-58c089be';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png',
  './fonts/anuphan-400.woff2', './fonts/anuphan-600.woff2', './board-strom-mini.webp', './board-atom-mini.webp', './firmware/manifest.json', './firmware/ptbot-studio-fastline-swift-0.9.14.bin', './firmware/ptbot-studio-fastline-senior-0.9.14.bin', './firmware/ptbot-studio-fastline-junior-0.9.14.bin'];

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
  if (/-\d+\.\d+\.\d+\.bin$/.test(url.pathname)) {  // firmware named with its version: cache first
    event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(r => keep(event.request, r))));
    return;
  }
  // Everything else: network first (newest when online), the cached copy when the network fails or takes longer
  // than NETWORK_WAIT_MS. A slow network response still refreshes the cache for next time. Only a page load may
  // fall back to index.html: any other file (install list, flasher, bootloader) without a cached copy waits for
  // the network, since the page in its place would break the first install.
  const network = fetch(event.request).then(r => keep(event.request, r));
  const page = event.request.mode === 'navigate';
  const cached = () => caches.match(event.request).then(hit => hit || (page ? caches.match('./index.html') : undefined));
  const timeout = new Promise(resolve => setTimeout(resolve, NETWORK_WAIT_MS));
  event.respondWith(
    Promise.race([network.catch(() => null), timeout]).then(r => r || cached().then(hit => hit || network))
  );
});
