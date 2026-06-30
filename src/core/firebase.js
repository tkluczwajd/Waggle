// src/core/firebase.js
const firebaseConfig = { 
    apiKey: "AIzaSyA7CSlyOLzbz2LpO0C-KqaZQ0U_OrNqBcg", 
    authDomain: "waggle-app-31ffa.firebaseapp.com", 
    projectId: "waggle-app-31ffa", 
    storageBucket: "waggle-app-31ffa.firebasestorage.app", 
    messagingSenderId: "711707392068", 
    appId: "1:711707392068:web:b81c7e0714cfe24dd1e411" 
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export const auth = firebase.auth();
export const fb = firebase;

// BEZPIECZNA INICJALIZACJA
try {
    // 1. Ustawienia cache (musi być przed enablePersistence)
    db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });
    
    // 2. Włączenie persistence
    db.enablePersistence({ synchronizeTabs: true })
      .catch((err) => console.warn("[Cache] Pamięć podręczna już aktywna lub niedostępna."));
} catch (e) {
    console.warn("Firestore settings/persistence already configured.");
}
