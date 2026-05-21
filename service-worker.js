const CACHE_NAME = 'waggle-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css'
];

// Instalacja Service Workera
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Nasłuchiwanie zapytań (dzięki temu apka odpali się nawet bez internetu)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Zwróć z cache
        }
        return fetch(event.request); // Pobierz z sieci
      })
  );
});
