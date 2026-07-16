// service-worker.js
const CACHE_NAME = 'waggle-cache-v1'; // Zmiana nazwy wymusi odświeżenie cache u użytkowników

// 1. INSTALACJA - Od razu wymuszamy nową wersję
self.addEventListener('install', (event) => {
    self.skipWaiting(); 
    console.log('[Service Worker] Zainstalowano wersję:', CACHE_NAME);
});

// 2. AKTYWACJA - Czyszczenie starego Cache'u
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Usuwam stary cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            return clients.claim(); 
        })
    );
});

// 3. POBIERANIE - Strategia Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
    
    // Ignorujemy zapytania inne niż GET oraz API Firebase/Google
    if (event.request.method !== 'GET' || 
        event.request.url.includes('firestore.googleapis.com') || 
        event.request.url.includes('identitytoolkit.googleapis.com')) {
        return; 
    }

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                
                // Tworzymy zapytanie sieciowe w tle (do odświeżenia cache)
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch((e) => {
                    console.warn("[SW] Background update failed (tryb offline):", e);
                });

                // Zwracamy odpowiedź z cache natychmiast (Stale), 
                // lub czekamy na sieć jeśli w cache jeszcze nie ma pliku
                return cachedResponse || fetchPromise;
            });
        })
    );
});
