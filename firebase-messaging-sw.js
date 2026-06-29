importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = { 
    apiKey: "AIzaSyA7CSlyOLzbz2LpO0C-KqaZQ0U_OrNqBcg", 
    authDomain: "waggle-app-31ffa.firebaseapp.com", 
    projectId: "waggle-app-31ffa", 
    storageBucket: "waggle-app-31ffa.firebasestorage.app", 
    messagingSenderId: "711707392068", 
    appId: "1:711707392068:web:b81c7e0714cfe24dd1e411" 
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || 'Waggle 🐾';
    const notificationOptions = {
        body: payload.notification?.body || 'Nowe zdarzenie!',
        icon: '/favicon.ico', 
        data: payload.data // Kluczowe: przekazujemy dane
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// ... reszta kodu firebase-messaging-sw (3).js ...
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const data = event.notification.data || {};
    const coords = { lat: data.lat, lng: data.lng };

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // 1. Sprawdzamy czy apka już działa
            for (let client of windowClients) {
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    client.focus();
                    // Wysyłamy wiadomość bezpośrednio do otwartego okna
                    client.postMessage({ type: 'GOTO_MAP', ...coords });
                    return;
                }
            }
            // 2. Jeśli apka nie działa, otwieramy ją (i liczymy, że appBootstrap odczyta parametry z URL)
            // Jako fallback zostawiamy URL, bo na "zimnym starcie" tylko on zadziała
            let targetUrl = (coords.lat && coords.lng) 
                ? `/?view=local&lat=${coords.lat}&lng=${coords.lng}` 
                : '/';
            return clients.openWindow(targetUrl);
        })
    );
});
