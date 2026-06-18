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
// 3. POBIERANIE - Zawsze pytamy serwer jako pierwszy (Network First)
self.addEventListener('fetch', (event) => {
    
    // 🔥 KLUCZOWA ZMIANA: Ignorujemy wszystko co nie jest pobieraniem (GET)
    // Dzięki temu Firebase może swobodnie używać POST do gadania z bazą danych
    if (event.request.method !== 'GET') {
        return; 
    }

    // Pomijamy też bezpośrednie wywołania do API Google i Firebase (dla bezpieczeństwa)
    if (event.request.url.includes('firestore.googleapis.com') || 
        event.request.url.includes('identitytoolkit.googleapis.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Zapisujemy w Cache tylko poprawne odpowiedzi
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        // Dodany .catch, żeby nigdy więcej nie wywalić apki przy problemie z cachem
                        cache.put(event.request, responseClone).catch(e => console.warn("Cache skip:", e));
                    });
                }
                return response;
            })
            .catch(() => {
                // Jeśli nie ma internetu, wyciągamy z pamięci
                return caches.match(event.request);
            })
    );
});
