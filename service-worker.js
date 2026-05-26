// Podbijamy do v3, żeby wymusić nadpisanie tego zepsutego cache'a!
const CACHE_NAME = 'waggle-cache-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // 🔥 Wymusza natychmiastową instalację u użytkownika
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🧹 Service Worker: Usuwam stary cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // 🔥 Przejmuje kontrolę natychmiast po instalacji
  );
});

self.addEventListener('fetch', event => {
  // 🔥 OCHRONA FIREBASE: Ignorujemy wszystko, co nie jest zwykłym pobieraniem Twoich plików (GET)
  // To pozwala bazie Firestore, Auth i ImgBB działać bez żadnych zakłóceń!
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return; 
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request); 
      })
  );
});
