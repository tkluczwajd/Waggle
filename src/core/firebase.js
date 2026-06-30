const firebaseConfig = { 
    apiKey: "AIzaSyA7CSlyOLzbz2LpO0C-KqaZQ0U_OrNqBcg", 
    authDomain: "waggle-app-31ffa.firebaseapp.com", 
    projectId: "waggle-app-31ffa", 
    storageBucket: "waggle-app-31ffa.firebasestorage.app", 
    messagingSenderId: "711707392068", 
    appId: "1:711707392068:web:b81c7e0714cfe24dd1e411" 
};

// Inicjalizacja tylko raz
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    // Ustawienia cache tylko przy pierwszej inicjalizacji
    firebase.firestore().settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });
}

export const db = firebase.firestore();
export const auth = firebase.auth();
export const fb = firebase;

// Persistence
try {
    db.enablePersistence({ synchronizeTabs: true })
      .catch(err => console.log("[Cache] Status:", err.code));
} catch (e) {}
