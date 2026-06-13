// service-worker.js
const CACHE_NAME = 'waggle-cache-v1.0.1'; // Pamiętaj, żeby to zmieniać przy dużych aktualizacjach!

// ROZWIĄZANIE 3: Automatyczne przejęcie
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalacja nowej wersji...');
    self.skipWaiting(); 
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Aktywacja...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Usuwam stary cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) 
    );
});

// ROZWIĄZANIE NA ETAP TESTÓW: Strategia "Network First"
// Zawsze najpierw pyta serwera o nowy plik. Jeśli jesteś offline, bierze z cache.
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Jeśli serwer zwrócił nowy plik, zaktualizuj go w cache
                const resClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, resClone);
                });
                return response;
            })
            .catch(() => {
                // Jeśli użytkownik nie ma internetu, zwróć plik z cache
                return caches.match(event.request);
            })
    );
});
