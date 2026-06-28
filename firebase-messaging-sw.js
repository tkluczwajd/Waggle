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

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    console.log('[SW] Notification clicked');

    const data = event.notification.data || {};
    // Budujemy URL z parametrami
    let targetUrl = data.url || '/';
    if (data.lat && data.lng) {
        targetUrl = `/?view=local&lat=${data.lat}&lng=${data.lng}`;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            console.log('[SW] Window clients found:', windowClients.length);
            
            // Etap 1: Szukamy już otwartej aplikacji
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    console.log('[SW] Aplikacja w tle istnieje! Skupiam uwagę i nawiguję...');
                    // .navigate() przeładuje aplikację nowym adresem URL
                    return client.navigate(targetUrl).then(c => c.focus());
                }
            }
            
            // Etap 2: Aplikacja była zamknięta (tzw. "zimny start")
            console.log('[SW] Aplikacja zamknięta. Otwieram nowe okno...');
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
