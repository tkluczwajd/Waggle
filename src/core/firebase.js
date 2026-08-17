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

// 🔥 WŁĄCZENIE TRYBU OFFLINE (Lekarstwo na Lie-Fi dla API Compat)
// Apka natychmiast pokaże dane z cache, a dopiero w tle spróbuje je 
// zsynchronizować z serwerem, rozwiązując problem z "wiszącym" zasięgiem.
db.enablePersistence({ synchronizeTabs: true })
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn("Offline: Wiele kart otwartych, działa tylko w jednej.");
        } else if (err.code === 'unimplemented') {
            console.warn("Offline: Przeglądarka nie wspiera persystencji bazy.");
        } else {
            console.warn("Offline: Błąd trybu offline: ", err);
        }
    });

export { db };
export const auth = firebase.auth();
export const fb = firebase;
