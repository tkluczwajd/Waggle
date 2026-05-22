// firebase-messaging-sw.js (Musi być w głównym katalogu!)
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// ⚠️ SKOPIUJ TUTAJ SWÓJ firebaseConfig z pliku src/core/firebase.js!
const firebaseConfig = {
    apiKey: "TWÓJ_API_KEY",
    authDomain: "TWÓJ_PROJECT.firebaseapp.com",
    projectId: "TWÓJ_PROJECT",
    storageBucket: "TWÓJ_PROJECT.appspot.com",
    messagingSenderId: "TWÓJ_SENDER_ID",
    appId: "TWÓJ_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Ten kod odpala się, gdy aplikacja JEST ZAMKNIĘTA, a serwer przysyła nową wiadomość
messaging.onBackgroundMessage((payload) => {
    console.log('[Service Worker] Otrzymano powiadomienie w tle: ', payload);
    
    const notificationTitle = payload.notification?.title || 'Nowa wiadomość w Waggle! 🐾';
    const notificationOptions = {
        body: payload.notification?.body || 'Wejdź do aplikacji, aby sprawdzić.',
        icon: '/favicon.ico', // Zmień na ścieżkę do ładnej ikony apki (np. 192x192px)
        badge: '/favicon.ico',
        vibrate: [200, 100, 200, 100, 200], // Charakterystyczna wibracja
        data: payload.data // Ukryte dane (np. ID czatu), żeby po kliknięciu apka otworzyła odpowiednie okno
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
