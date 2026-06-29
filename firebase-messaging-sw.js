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

// 🔥 NOWOŚĆ: Pamięć podręczna Service Workera dla "zimnego startu"
let pendingNavigation = null; 

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    console.log('[SW] Notification clicked');

    const data = event.notification.data || {};
    const coords = { lat: data.lat, lng: data.lng };

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // SCENARIUSZ A: Aplikacja działa w tle
            for (let client of windowClients) {
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    console.log('[SW] Apka w tle, wysyłam postMessage');
                    client.focus();
                    client.postMessage({ type: 'GOTO_MAP', ...coords });
                    return;
                }
            }

            // SCENARIUSZ B: Zimny start (Aplikacja była zamknięta)
            console.log('[SW] Zimny start. Zapisuję dane i otwieram okno...');
            if (coords.lat && coords.lng) {
                pendingNavigation = coords; // Zapamiętujemy, dokąd chcemy lecieć
            }

            let targetUrl = (coords.lat && coords.lng) 
                ? `/?view=local&lat=${coords.lat}&lng=${coords.lng}` 
                : '/';
            return clients.openWindow(targetUrl);
        })
    );
});

// 🔥 NOWOŚĆ: Nasłuchujemy, aż nowo otwarta aplikacja wstanie i poprosi o dane
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'APP_READY') {
        console.log('[SW] Aplikacja zgłasza gotowość!');
        if (pendingNavigation) {
            console.log('[SW] Mam zaległą nawigację, wysyłam do aplikacji...');
            event.source.postMessage({ type: 'GOTO_MAP', ...pendingNavigation });
            pendingNavigation = null; // Czyścimy pamięć po pomyślnym wysłaniu
        }
    }
});
