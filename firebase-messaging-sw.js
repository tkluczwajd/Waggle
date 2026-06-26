// firebase-messaging-sw.js (Musi znajdować się w głównym katalogu aplikacji!)
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// 🔥 Twoja autentyczna konfiguracja projektu Waggle
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
        vibrate: [200, 100, 200, 100, 200], // Wibracja systemowa dla Androida
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
// Nasłuchiwanie na kliknięcie w baner powiadomienia
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // Zamknij baner systemowy

    const data = event.notification.data || {};
    const urlToOpen = data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Sprawdź, czy aplikacja Waggle jest już otwarta gdzieś w tle
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    // Jeśli otwarta - przenieś ją na wierzch i wyślij jej dane
                    client.postMessage({ 
                        type: 'GOTO_MAP', 
                        lat: data.lat, 
                        lng: data.lng 
                    });
                    return client.focus();
                }
            }
            
            // Jeśli aplikacja była całkowicie zamknięta - otwórz ją
            let targetUrl = urlToOpen;
            if (data.lat && data.lng) {
                targetUrl += `?view=local&lat=${data.lat}&lng=${data.lng}`;
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
