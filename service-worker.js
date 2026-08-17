// service-worker.js
const CACHE_NAME = 'waggle-capacitor-v1';

// 1. INSTALACJA
self.addEventListener('install', (event) => {
    self.skipWaiting(); 
    console.log('[Service Worker] Zainstalowano wersję dla Capacitor APK');
});

// 2. AKTYWACJA - Czyścimy wszystkie stare, przeglądarkowe cache'e, które mogły zepsuć start
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    console.log('[Service Worker] Usuwam stary cache PWA:', cache);
                    return caches.delete(cache);
                })
            );
        }).then(() => {
            return clients.claim(); 
        })
    );
});

// 3. POBIERANIE - Całkowity "Bypass" dla Capacitora
self.addEventListener('fetch', (event) => {
    // W środowisku Capacitor pliki serwowane są lokalnie (http://localhost).
    // Nie robimy ŻADNEGO cache'owania plików HTML/JS/CSS, pozwalamy,
    // aby silnik WebView ładował je prosto z dysku telefonu z prędkością światła.
    
    // Jeśli zapytanie idzie do zewnętrznego API (np. zdjęcia), puszczamy je normalnie.
    event.respondWith(fetch(event.request).catch(() => {
        console.warn("[SW] Brak sieci dla zapytania zewnętrznego:", event.request.url);
        // Jeśli padnie sieć na np. pobieraniu awatara z zewnętrznego serwera, 
        // apka się nie zawiesi, tylko wyświetli błąd w konsoli.
        return new Response(null, { status: 404 });
    }));
});
