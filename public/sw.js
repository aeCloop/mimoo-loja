// public/sw.js
const CACHE_NAME = 'mimoo-pwa-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Network-first pattern ensures zero-flickering or stale-serving during workspace updates
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
