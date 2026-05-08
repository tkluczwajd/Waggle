import { auth, db } from "../core/firebase.js";
import { appState as state, setState } from "../core/state.js";
import { cleanupListeners, registerListener as addListener } from "../core/listeners.js";
import { eventBus } from "../core/eventBus.js";

let appInitialized = false; // Zabezpieczenie przed wielokrotnym startem

export function initAuth(onReady) {
    auth.onAuthStateChanged(user => {
        cleanupListeners(); 
        const loader = document.getElementById("loader");
        if (loader) loader.style.display = "none";

        if (user) {
            setState('auth.user', user);
            state.user = user; 
            
            const unsub = db.collection("users").doc(user.uid).onSnapshot(doc => {
                const data = doc.exists ? doc.data() : { name: "Piesek", walkCount: 0, isSearchable: true };
                
                // Jeśli to nowy user, zapisz bazowy profil
                if (!doc.exists) db.collection("users").doc(user.uid).set(data, {merge: true});

                setState('profile', data);
                state.profile = data;
                
                // Powiadom app.js, że dane profilu są gotowe
                eventBus.emit('profileUpdated', data);
                
                document.getElementById("auth-screen").style.display = "none";
                document.getElementById("app-interface").style.display = "flex";
                
                // Uruchom resztę aplikacji TYLKO RAZ
                if (!appInitialized && typeof onReady === 'function') {
                    onReady();
                    appInitialized = true;
                }
            });
            
            addListener(unsub);
        } else {
            appInitialized = false;
            document.getElementById("app-interface").style.display = "none";
            document.getElementById("auth-screen").style.display = "flex";
        }
    });

    // Obsługa przycisków Logowania/Rejestracji
    document.addEventListener('click', (e) => {
        if (e.target.id === 'loginBtn') {
            const email = document.getElementById('authEmail').value;
            const pass = document.getElementById('authPass').value;
            if(!email || !pass) return window.Waggle.showToast("Wpisz dane!");
            auth.signInWithEmailAndPassword(email, pass).catch(err => alert(err.message));
        }
        if (e.target.id === 'registerBtn') {
            const email = document.getElementById('authEmail').value;
            const pass = document.getElementById('authPass').value;
            auth.createUserWithEmailAndPassword(email, pass).catch(err => alert(err.message));
        }
        if (e.target.id === 'logoutBtn') {
            auth.signOut().then(() => window.location.reload());
        }
    });
}
