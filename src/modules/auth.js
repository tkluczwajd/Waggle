import { auth, db } from "../core/firebase.js";
import { appState as state, setState } from "../core/state.js";
import { cleanupListeners, registerListener as addListener } from "../core/listeners.js";

export function initAuth(onReady) {
    auth.onAuthStateChanged(user => {
        cleanupListeners(); 
        const loader = document.getElementById("loader");
        if (loader) loader.style.display = "none";

        if (user) {
            setState('auth.user', user);
            state.user = user; // Most wstecznej kompatybilności
            
            const unsub = db.collection("users").doc(user.uid).onSnapshot(doc => {
                if (doc.exists) {
                    setState('profile', doc.data());
                    state.profile = doc.data();
                } else {
                    const newProfile = { name: "Piesek", walkCount: 0, isSearchable: true };
                    setState('profile', newProfile);
                    state.profile = newProfile;
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
            setState('auth.user', null);
            setState('profile', null);
            state.user = null;
            state.profile = null;
            
            const authScreen = document.getElementById("auth-screen");
            const appUI = document.getElementById("app-interface");
            if (appUI) appUI.style.display = "none";
            if (authScreen) authScreen.style.display = "flex";
        }
    });
}
