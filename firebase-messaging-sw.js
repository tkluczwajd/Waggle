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
        data: payload.data 
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // 1. Jeśli apka jest w tle (np. zminimalizowana), po prostu ją obudź i przenieś na wierzch
            for (let client of windowClients) {
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    return client.focus();
                }
            }
            // 2. Jeśli apka była całkowicie zamknięta, otwieramy CZYSTY adres root (/)
            // To gwarantuje, że Android rozpozna PWA i otworzy apkę, a nie przeglądarkę Chrome!
            return clients.openWindow('/');
        })
    );
});
