import { auth, db } from "../core/firebase.js";
import { state, addListener, clearListeners } from "../core/state.js";
import { initApp } from "../app.js";

export function initAuth() {
    auth.onAuthStateChanged(user => {
        document.getElementById("loader").style.display = "none";
        clearListeners(); // Czyścimy stare połączenia przy zmianie usera

        if (user) {
            state.user = user;
            // Pobieramy profil pieska z bazy
            const unsub = db.collection("users").doc(user.uid).onSnapshot(doc => {
                if (doc.exists) {
                    state.profile = doc.data();
                    
                    // Pokazujemy interfejs, ukrywamy logowanie
                    document.getElementById("auth-screen").style.display = "none";
                    document.getElementById("app-interface").style.display = "flex";
                    
                    // Dopiero teraz inicjalizujemy resztę modułów!
                    initApp();
                } else {
                    // Jeśli user jest w auth, ale nie ma profilu w Firestore
                    document.getElementById("profile-setup-modal").style.display = "flex";
                }
            });
            addListener(unsub);

        } else {
            // Brak usera -> pokazujemy ekran logowania
            state.user = null;
            state.profile = null;
            document.getElementById("app-interface").style.display = "none";
            document.getElementById("auth-screen").style.display = "flex";
        }
    });
}
