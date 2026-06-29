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
    console.log('[SW] Odebrano powiadomienie w tle:', payload);
    const notificationTitle = payload.data?.title || 'Waggle 🐾';
    const notificationOptions = {
        body: payload.data?.body || 'Nowe zdarzenie!',
        icon: '/favicon.ico', 
        data: payload.data // Przekazujemy kompletne dane GPS do kliknięcia
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});

let pendingNavigation = null; 

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const data = event.notification.data || {};
    const coords = { lat: data.lat, lng: data.lng };

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    client.focus();
                    client.postMessage({ type: 'GOTO_MAP', ...coords });
                    return;
                }
            }
            if (coords.lat && coords.lng) pendingNavigation = coords;
            let targetUrl = (coords.lat && coords.lng) ? `/?view=local&lat=${coords.lat}&lng=${coords.lng}` : '/';
            return clients.openWindow(targetUrl);
        })
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'APP_READY' && pendingNavigation) {
        event.source.postMessage({ type: 'GOTO_MAP', ...pendingNavigation });
        pendingNavigation = null; 
    }
});
