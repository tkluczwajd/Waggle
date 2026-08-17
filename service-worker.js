// service-worker.js
const CACHE_NAME = 'waggle-cache-v2'; // Wymuszamy aktualizację u użytkowników

// 0. APP SHELL - Pliki krytyczne, które MUSZĄ być dostępne natychmiast z pamięci urządzenia
const APP_SHELL = [
    '/',
    '/index.html',
    '/style.css?v=premium',
    '/src/app.js?v=1009',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// 1. INSTALACJA - Wymuszamy pre-caching szkieletu aplikacji
self.addEventListener('install', (event) => {
    self.skipWaiting(); 
    console.log('[Service Worker] Zainstalowano wersję:', CACHE_NAME);
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Zapisywanie App Shell do pracy offline...');
            // addAll wymusza pobranie i zapisanie plików z tablicy w cache
            return cache.addAll(APP_SHELL); 
        })
    );
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

// 3. POBIERANIE - Strategia Stale-While-Revalidate (Cache First, Network w tle)
self.addEventListener('fetch', (event) => {
    
    // Ignorujemy zapytania inne niż GET oraz API Firebase/Google
    if (event.request.method !== 'GET' || 
        event.request.url.includes('firestore.googleapis.com') || 
        event.request.url.includes('identitytoolkit.googleapis.com')) {
        return; 
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            
            // Tworzymy zapytanie sieciowe w tle (do odświeżenia cache na przyszłość)
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            }).catch((e) => {
                console.warn("[SW] Odrzucono request w tle (brak zasięgu). Praca na cache.");
            });

            // ZWRACAMY CACHED RESPONSE NATYCHMIAST (Brak białego ekranu!)
            // Jeśli z jakiegoś powodu go nie ma, dopiero wtedy czekamy na sieć
            return cachedResponse || fetchPromise;
        })
    );
});
