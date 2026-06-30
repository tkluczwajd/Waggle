// src/core/firebase.js
const firebaseConfig = { 
    apiKey: "AIzaSyA7CSlyOLzbz2LpO0C-KqaZQ0U_OrNqBcg", 
    authDomain: "waggle-app-31ffa.firebaseapp.com", 
    projectId: "waggle-app-31ffa", 
    storageBucket: "waggle-app-31ffa.firebasestorage.app", 
    messagingSenderId: "711707392068", 
    appId: "1:711707392068:web:b81c7e0714cfe24dd1e411" 
};

// Inicjalizacja
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Pobranie instancji
const dbInstance = firebase.firestore();

// Ustawienia cache (jednorazowe)
try {
    dbInstance.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });
    // Włączenie Persistence (tylko raz)
    dbInstance.enablePersistence({ synchronizeTabs: true })
        .catch(err => console.warn("[Cache] Info:", err.code));
} catch (e) {
    // Ignorujemy, jeśli już zainicjalizowano
}

export const db = dbInstance;
export const auth = firebase.auth();
export const fb = firebase;
