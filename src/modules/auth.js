import { auth, db } from "../core/firebase.js";
import { state, addListener, clearListeners } from "../core/state.js";
import { initApp } from "../app.js";

export function initAuth() {
    auth.onAuthStateChanged(user => {
        // 🔥 KLUCZ: Czyścimy wszystko przy każdej zmianie usera (logowanie/wylogowanie)
        clearListeners(); 
        document.getElementById("loader").style.display = "none";

        if (user) {
            state.user = user;
            const unsub = db.collection("users").doc(user.uid).onSnapshot(doc => {
                if (doc.exists) {
                    state.profile = doc.data();
                    document.getElementById("auth-screen").classList.remove('active');
                    document.getElementById("app-interface").classList.add('active');
                    initApp();
                } else {
                    alert("Nie znaleziono profilu psa. Stwórz go w konsoli Firebase lub dodaj moduł setupu.");
                }
            }, err => console.error("Auth profile error:", err));
            
            addListener(unsub);
        } else {
            state.user = null;
            state.profile = null;
            document.getElementById("app-interface").classList.remove('active');
            document.getElementById("auth-screen").classList.add('active');
        }
    });
}
