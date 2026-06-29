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
    console.log('[SW] Notification clicked');

    const data = event.notification.data || {};
    let targetUrl = data.lat && data.lng 
        ? `/?view=local&lat=${data.lat}&lng=${data.lng}` 
        : '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    console.log('[SW] Found active client, navigating...');
                    return client.navigate(targetUrl).then(c => c.focus());
                }
            }
            console.log('[SW] No active client, opening new window...');
            return clients.openWindow(targetUrl);
        })
    );
});
