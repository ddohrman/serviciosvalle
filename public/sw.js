// Service Worker for Oficios y Servicios Valle de Lerma PWA
const CACHE_NAME = 'oficios-lerma-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Never intercept archive downloads or zip files
  if (event.request.url.includes('.zip')) {
    return;
  }

  // Let browser and Firebase handle network requests smoothly
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

