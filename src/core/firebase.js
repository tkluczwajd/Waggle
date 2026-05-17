// Usuwamy: import firebase from 'firebase/compat/app';
// Korzystamy z globalnego obiektu firebase załadowanego z CDN

// src/core/firebase.js

// Zachowaj swój dotychczasowy blok konfiguracji:
const firebaseConfig = { 
    apiKey: "AIzaSyA7CSlyOLzbz2LpO0C-KqaZQ0U_OrNqBcg", 
    authDomain: "waggle-app-31ffa.firebaseapp.com", 
    projectId: "waggle-app-31ffa", 
    storageBucket: "waggle-app-31ffa.firebasestorage.app", 
    messagingSenderId: "711707392068", 
    appId: "1:711707392068:web:b81c7e0714cfe24dd1e411" 
};

//  TUTAJ ZACZYNA SIĘ NOWA, ZABEZPIECZONA KOŃCÓWKA PLIKU:

// Sprawdzamy, czy aplikacja nie została już zainicjalizowana
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export const auth = firebase.auth();
export const fb = firebase; // Potrzebne do FieldValue

// 🔥 NOWOŚĆ OD KONSULTANTA: WŁĄCZENIE LOKALNEGO CACHE / OFFLINE-FIRST DLA TELEFONÓW
db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

db.enablePersistence({ synchronizeTabs: true })
  .catch((err) => {
      if (err.code == 'failed-precondition') {
          console.warn("Keszowanie niedostępne: otwartych wiele kart przeglądarki jednocześnie.");
      } else if (err.code == 'unimplemented') {
          console.warn("Ta przeglądarka nie obsługuje lokalnej pamięci podręcznej offline.");
      }
  });
