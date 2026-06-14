// service-worker.js
const CACHE_NAME = 'waggle-cache-dynamic';

// 1. INSTALACJA - Od razu wymuszamy nową wersję (skipWaiting)
self.addEventListener('install', (event) => {
    self.skipWaiting(); 
    console.log('[Service Worker] Zainstalowano nową wersję.');
});

// 2. AKTYWACJA - Brutalne czyszczenie starego Cache'u
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    // Usuwamy absolutnie wszystko, co stare
                    console.log('[Service Worker] Czyszczenie starego cache:', cache);
                    return caches.delete(cache);
                })
            );
        }).then(() => {
            return clients.claim(); // Przejmujemy kontrolę nad otwartą aplikacją
        })
    );
});

// 3. POBIERANIE - Zawsze pytamy serwer jako pierwszy (Network First)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Jeśli pobraliśmy najnowszy plik z sieci, aktualizujemy go w Cache
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // Jeśli nie ma internetu, próbujemy załadować z Cache'u
                return caches.match(event.request);
            })
    );
});
