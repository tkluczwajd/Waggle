import { auth, db } from "../core/firebase.js";
import { state, addListener, clearListeners } from "../core/state.js";

export function initAuth(onReady) {
    auth.onAuthStateChanged(user => {
        clearListeners(); 
        const loader = document.getElementById("loader");
        if (loader) loader.style.display = "none";

        if (user) {
            state.user = user;
            const unsub = db.collection("users").doc(user.uid).onSnapshot(doc => {
                if (doc.exists) {
                    state.profile = doc.data();
                } else {
                    state.profile = { name: "Piesek", walkCount: 0, isSearchable: true };
                }
                
                const authScreen = document.getElementById("auth-screen");
                const appUI = document.getElementById("app-interface");
                if (authScreen) authScreen.style.display = "none";
                if (appUI) appUI.style.display = "flex";
                
                // Odpalenie głównej aplikacji po udanym logowaniu
                if (typeof onReady === 'function') onReady();
            }, err => {
                console.error("Błąd bazy danych:", err);
                if (typeof onReady === 'function') onReady();
            });
            
            addListener(unsub);
        } else {
            state.user = null;
            state.profile = null;
            const authScreen = document.getElementById("auth-screen");
            const appUI = document.getElementById("app-interface");
            if (appUI) appUI.style.display = "none";
            if (authScreen) authScreen.style.display = "flex";
        }
    });
}
