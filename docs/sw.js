const CACHE_NAME = 'v2';

const PRECACHE_ROUTES = [
  '/',
  '/upload',
  '/game',
];

async function precache() {
  const cache = await caches.open(CACHE_NAME);
  const entries = [...PRECACHE_ROUTES];
  for (const item of entries) {
    try {
      const res = await fetch(item);
      if (res.ok) {
        await cache.put(item, res.clone());
      }
    } catch (err) {
      console.warn('Precache failed:', item, err.message);
    }
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })()
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request, { ignoreSearch: true }).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(event.request).then((network) => {
          if (network.ok) {
            cache.put(event.request, network.clone());
          }
          return network;
        });
      });
    })
  );
});
