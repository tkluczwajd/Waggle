// src/core/firebase.js

const firebaseConfig = { 
    apiKey: "AIzaSyA7CSlyOLzbz2LpO0C-KqaZQ0U_OrNqBcg", 
    authDomain: "waggle-app-31ffa.firebaseapp.com", 
    projectId: "waggle-app-31ffa", 
    storageBucket: "waggle-app-31ffa.firebasestorage.app", 
    messagingSenderId: "711707392068", 
    appId: "1:711707392068:web:b81c7e0714cfe24dd1e411" 
};

// Sprawdzamy, czy aplikacja nie została już zainicjalizowana
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export const auth = firebase.auth();
export const fb = firebase;

// 1. KROK PIERWSZY: Ustawienia bazy danych (MUSZĄ być przed włączeniem cache)
try {
    db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });
} catch (e) {
    console.warn("Ustawienia Firestore zostały już załadowane.");
}

// 2. KROK DRUGI: Włączenie pancernego cache (Offline Persistence)
try {
    db.enablePersistence({ synchronizeTabs: true })
      .catch((err) => {
          if (err.code == 'failed-precondition') {
              console.warn("[Cache] Wiele kart, działa w pierwszej.");
          } else if (err.code == 'unimplemented') {
              console.warn("[Cache] Przeglądarka nie wspiera.");
          }
      });
} catch (e) {
    console.warn("Cache był już zainicjowany.");
}
