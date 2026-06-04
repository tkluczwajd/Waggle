const CACHE_NAME = 'waggle-cache-v2'; // Zmiana nazwy wymusza odświeżenie u wszystkich użytkowników!
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/manifest.json'
    // Nie keszujemy na sztywno plików JS, żeby zawsze pobierały się najnowsze
];

// 1. INSTALACJA - Pobieranie podstawowych plików
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Wymusza natychmiastową aktywację nowego workera
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. AKTYWACJA - Sprzątanie starych śmieci
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🧹 Usuwam stary cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Przejmuje kontrolę nad otwartymi kartami
});

// 3. PRZECHWYTYWANIE ZAPYTAŃ (STRATEGIA: Network-First)
self.addEventListener('fetch', (event) => {
    // Ignorujemy zapytania do Firebase i zewnętrznych API (tylko nasze pliki)
    if (event.request.url.includes('firestore.googleapis.com') || event.request.url.includes('google.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Jeśli mamy neta i pobraliśmy plik - aktualizujemy cache w locie
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // Jeśli nie ma neta - dajemy to, co mamy w cache
                return caches.match(event.request);
            })
    );
});
