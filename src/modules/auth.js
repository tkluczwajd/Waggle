import { auth, db } from "../core/firebase.js";
import { appState as state, setState } from "../core/state.js";
import { cleanupListeners, registerListener as addListener } from "../core/listeners.js";
import { eventBus } from "../core/eventBus.js";

let appInitialized = false; // Zabezpieczenie przed wielokrotnym startem apki

export function initAuth(onReady) {
    // 1. MONITOROWANIE STANU ZALOGOWANIA
    auth.onAuthStateChanged(user => {
        cleanupListeners(); 
        const loader = document.getElementById("loader");
        if (loader) loader.style.display = "none";

        if (user) {
            setState('auth.user', user);
            state.user = user; 
            
            // Pobieranie profilu z bazy z nasłuchem na żywo
            const unsub = db.collection("users").doc(user.uid).onSnapshot(doc => {
                const data = doc.exists ? doc.data() : { name: "Piesek", walkCount: 0, isSearchable: true, city: "", breed: "" };
                
                // Jeśli profil jest nowy, zapisujemy go bezpiecznie (merge: true)
                if (!doc.exists) db.collection("users").doc(user.uid).set(data, {merge: true});

                setState('profile', data);
                state.profile = data;
                
                // Rozsyłamy informację do reszty modułów (np. do app.js, żeby odświeżył statystyki)
                eventBus.emit('profileUpdated', data);
                
                document.getElementById("auth-screen").style.display = "none";
                document.getElementById("app-interface").style.display = "flex";
                
                // Uruchamiamy resztę aplikacji (mapę itp.) TYLKO RAZ przy starcie
                if (!appInitialized && typeof onReady === 'function') {
                    onReady();
                    appInitialized = true;
                }
            });
            
            addListener(unsub);
        } else {
            // Po wylogowaniu resetujemy stan apki
            appInitialized = false;
            document.getElementById("app-interface").style.display = "none";
            document.getElementById("auth-screen").style.display = "flex";
        }
    });

    // 2. OBSŁUGA PRZYCISKÓW LOGOWANIA, REJESTRACJI I WYLOGOWANIA
    document.addEventListener('click', (e) => {
        // Logowanie
        if (e.target.id === 'loginBtn') {
            const email = document.getElementById('authEmail').value;
            const pass = document.getElementById('authPass').value;
            if(!email || !pass) return window.Waggle.showToast("Wpisz e-mail i hasło!");
            auth.signInWithEmailAndPassword(email, pass).catch(err => alert("Błąd logowania: " + err.message));
        }

        // Rejestracja
        if (e.target.id === 'registerBtn') {
            const email = document.getElementById('authEmail').value;
            const pass = document.getElementById('authPass').value;
            if(!email || !pass) return window.Waggle.showToast("Wpisz dane do rejestracji!");
            auth.createUserWithEmailAndPassword(email, pass).catch(err => alert("Błąd rejestracji: " + err.message));
        }

        // Wylogowanie
        if (e.target.id === 'logoutBtn') {
            auth.signOut().then(() => window.location.reload());
        }
    });
}
