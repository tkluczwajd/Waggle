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

const db = firebase.firestore();

// 🔥 NOWOCZESNE USTAWIENIA CACHE (Lekarstwo na Lie-Fi i czysta konsola)
try {
    db.settings({
        // Wdrażamy nowy, agresywny system pamięci offline.
        // Jeśli telefon ma 1 kreskę zasięgu (Lie-Fi), apka natychmiast pokaże dane z cache,
        // a dopiero w tle spróbuje je zsynchronizować z serwerem.
        cache: firebase.firestore.persistentLocalCache({
            tabManager: firebase.firestore.persistentMultipleTabManager(),
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
        })
    });
} catch (e) {
    console.warn("Firestore już skonfigurowany:", e.message);
}

export { db };
export const auth = firebase.auth();
export const fb = firebase;
