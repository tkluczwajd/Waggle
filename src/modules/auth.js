import { auth, db } from "../core/firebase.js";
import { appState as state, setState } from "../core/state.js";
import { cleanupListeners, registerListener as addListener } from "../core/listeners.js";
import { eventBus } from "../core/eventBus.js";

export function initAuth(onReady) {
    auth.onAuthStateChanged(user => {
        cleanupListeners(); 
        const loader = document.getElementById("loader");
        if (loader) loader.style.display = "none";

        if (user) {
            setState('auth.user', user);
            state.user = user; 
            
            // Pobieramy dane z bazy
            const unsub = db.collection("users").doc(user.uid).onSnapshot(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    setState('profile', data);
                    state.profile = data;
                } else {
                    // Jeśli user jest całkiem nowy, twórz profil bez kasowania czegokolwiek
                    const newProfile = { name: "Nowy Piesek", walkCount: 0, isSearchable: true };
                    db.collection("users").doc(user.uid).set(newProfile, {merge: true});
                    setState('profile', newProfile);
                    state.profile = newProfile;
                }
                
                eventBus.emit('profileUpdated', state.profile);
                
                document.getElementById("auth-screen").style.display = "none";
                document.getElementById("app-interface").style.display = "flex";
                
                if (typeof onReady === 'function') onReady();
            });
            
            addListener(unsub);
        } else {
            document.getElementById("app-interface").style.display = "none";
            document.getElementById("auth-screen").style.display = "flex";
        }
    });
}
