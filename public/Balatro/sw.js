const CACHE_NAME = 'balatro-cache-v1';
// Make URLs absolute to the origin
const urlsToCache = [
  '/Balatro/',
  '/Balatro/index.html',
  '/Balatro/love.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  '/Balatro/module.js.zip'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching URLs');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // Serve from cache
          return response;
        }
        // Not in cache, fetch from network
        return fetch(event.request);
      }
    )
  );
});
