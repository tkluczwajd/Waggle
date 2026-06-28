// firebase-messaging-sw.js (Musi znajdować się w głównym katalogu aplikacji!)
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Twoja autentyczna konfiguracja projektu Waggle
const firebaseConfig = { 
    apiKey: "AIzaSyA7CSlyOLzbz2LpO0C-KqaZQ0U_OrNqBcg", 
    authDomain: "waggle-app-31ffa.firebaseapp.com", 
    projectId: "waggle-app-31ffa", 
    storageBucket: "waggle-app-31ffa.firebasestorage.app", 
    messagingSenderId: "711707392068", 
    appId: "1:711707392068:web:b81c7e0714cfe24dd1e411" 
};

// Inicjalizacja usług w tle
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Mechanizm przechwytywania powiadomień Push, gdy telefon jest zablokowany lub aplikacja zamknięta
messaging.onBackgroundMessage((payload) => {
    console.log('[Waggle SW] Otrzymano powiadomienie Push w tle: ', payload);
    
    const notificationTitle = payload.notification?.title || 'Waggle 🐾';
    const notificationOptions = {
        body: payload.notification?.body || 'Nowe zdarzenie w Twoim stadzie!',
        icon: '/favicon.ico', 
        badge: '/favicon.ico',
        vibrate: [200, 100, 200, 100, 200],
        data: payload.data // Tutaj przesyłamy dane takie jak lat/lng
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Nasłuchiwanie na kliknięcie w baner powiadomienia
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // Zamknij baner systemowy

    const data = event.notification.data || {};
    // Budujemy URL docelowy
    let targetUrl = data.url || '/';
    
    // Jeśli to alert SAFE, dołączamy parametry lokalizacji
    if (data.lat && data.lng) {
        targetUrl = `/?view=local&lat=${data.lat}&lng=${data.lng}`;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Szukamy otwartego okna aplikacji Waggle (pomijając stronę publicznego SAFE)
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                // Upewniamy się, że nie nawigujemy wewnątrz okna profilu SAFE
                if (client.url.includes(self.registration.scope) && !client.url.includes('safe.html') && 'focus' in client) {
                    // Nawigujemy istniejące okno do poprawnego URL z parametrami
                    return client.navigate(targetUrl).then(client => client.focus());
                }
            }
            
            // Jeśli nie ma otwartej aplikacji, otwieramy w nowym oknie
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
