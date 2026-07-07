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
    
    const data = payload.data || {};
    const notificationTitle = data.title || 'Waggle 🐾';
    
    // Ustalamy wzór wibracji w zależności od priorytetu
    const isEmergency = data.type === 'SAFE' || data.type === 'SIGHTING';
    const vibrationPattern = isEmergency ? [500, 200, 500, 200, 1000] : [200, 100, 200];

    const notificationOptions = {
        body: data.body || 'Nowe zdarzenie w okolicy!',
        icon: data.icon || '/assets/logo.png', // Możesz tu podać ścieżkę do ładnej ikony powiadomienia
        vibrate: vibrationPattern,
        requireInteraction: isEmergency, // Wymusza kliknięcie przez użytkownika przy alarmach
        data: {
            type: data.type || 'GENERAL',
            chatId: data.chatId || null,
            targetUrl: data.url || '/'
        }
    };
    
    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    const payloadData = event.notification.data || {};
    const targetUrl = new URL(payloadData.targetUrl, self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // 1. Aplikacja jest już otwarta w tle (Android PWA trzyma ją w pamięci)
            for (let client of windowClients) {
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    client.focus();
                    // 🔥 ROUTER: Mówimy otwartej aplikacji, gdzie ma się przełączyć
                    client.postMessage({ 
                        type: 'NOTIFICATION_ROUTING', 
                        routeData: payloadData 
                    });
                    return;
                }
            }
            
            // 2. Aplikacja była całkowicie ubita - otwieramy z dedykowanym URL
            // (Możemy w przyszłości dopisać odczytywanie parametrów np. /?chatId=123)
            return clients.openWindow(targetUrl);
        })
    );
});
