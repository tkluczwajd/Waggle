import { auth, db } from "../core/firebase.js";
import { appState as state, setState } from "../core/state.js";
import { cleanupListeners, registerListener as addListener } from "../core/listeners.js";
import { eventBus } from "../core/eventBus.js";

export function initAuth(onReady) {
    // 1. MONITOROWANIE STANU ZALOGOWANIA
    auth.onAuthStateChanged(user => {
        cleanupListeners(); 
        const loader = document.getElementById("loader");
        if (loader) loader.style.display = "none";

        if (user) {
            setState('auth.user', user);
            state.user = user; 
            
            const unsub = db.collection("users").doc(user.uid).onSnapshot(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    setState('profile', data);
                    state.profile = data;
                } else {
                    // Jeśli profil nie istnieje (np. po rejestracji), twórz go bezpiecznie
                    const newProfile = { name: "Piesek", walkCount: 0, isSearchable: true, city: "", breed: "" };
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

    // 2. OBSŁUGA PRZYCISKÓW (TU BYŁA GAFA - PRZYWRÓCONE!)
    document.addEventListener('click', (e) => {
        // Logowanie
        if (e.target.id === 'loginBtn') {
            const email = document.getElementById('authEmail').value;
            const pass = document.getElementById('authPass').value;
            if(!email || !pass) return window.Waggle.showToast("Wpisz e-mail i hasło!");
            
            auth.signInWithEmailAndPassword(email, pass).catch(err => {
                alert("Błąd logowania: " + err.message);
            });
        }

        // Rejestracja
        if (e.target.id === 'registerBtn') {
            const email = document.getElementById('authEmail').value;
            const pass = document.getElementById('authPass').value;
            if(!email || !pass) return window.Waggle.showToast("Wpisz dane do rejestracji!");
            
            auth.createUserWithEmailAndPassword(email, pass)
                .then((cred) => {
                    // Tworzymy bazowy profil dla nowego użytkownika
                    return db.collection("users").doc(cred.user.uid).set({
                        name: "Nowy Piesek", walkCount: 0, isSearchable: true, city: "", breed: "", createdAt: Date.now()
                    });
                })
                .catch(err => alert("Błąd rejestracji: " + err.message));
        }

        // Wylogowanie
        if (e.target.id === 'logoutBtn') {
            auth.signOut().then(() => window.location.reload());
        }
    });
}
