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

// Ustawienia cache
try {
    db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });
    // Włączamy persistencję, ale z obsługą błędów
    db.enablePersistence({ synchronizeTabs: true })
        .catch(err => console.warn("[Cache] Nie można włączyć persistencji:", err.code));
} catch (e) {
    console.warn("Firestore już skonfigurowany.");
}

export { db };
export const auth = firebase.auth();
export const fb = firebase;
