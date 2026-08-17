// service-worker.js
const CACHE_NAME = 'waggle-capacitor-v3';

// 1. INSTALACJA
self.addEventListener('install', (event) => {
    self.skipWaiting(); 
    console.log('[Service Worker] Zainstalowano wersję dla Capacitor APK');
});

// 2. AKTYWACJA - Czyścimy wszystkie stare cache
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
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
    // Zwracamy "pustkę". Nie przechwytujemy zapytań.
    // Dzięki temu Capacitor ładuje wszystkie pliki HTML/JS natywnie z dysku.
    return;
});
