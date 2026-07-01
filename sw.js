const CACHE_NAME = 'crview-v1';
const SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for the detector's own LAN (images/orderlist change constantly),
// cache-first for the app shell so the UI itself works with zero signal.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const isShell = SHELL.some((s) => url.pathname.endsWith(s.replace('./', '')));

  if (isShell) {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request))
    );
    return;
  }

  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
