import { auth, db } from '../core/firebase.js';
import { appState, setState } from '../core/state.js';
import { cleanupListeners } from '../core/listeners.js';

export function initAuth(onReadyCallback) {
    auth.onAuthStateChanged(user => {
        cleanupListeners(); 
        
        const loader = document.getElementById("loader");
        if (loader) loader.style.display = "none";

        if (user) {
            // Zapisujemy usera w centralnym stanie
            setState('auth.user', user);
            setState('auth.initialized', true);

            // Pobieramy profil (tymczasowo bezpośrednio, potem przeniesiemy to do userService)
            db.collection("users").doc(user.uid).get().then(doc => {
                if (doc.exists) {
                    setState('profile', doc.data());
                } else {
                    const newProfile = { name: "Piesek", walkCount: 0, isSearchable: true };
                    setState('profile', newProfile);
                    db.collection("users").doc(user.uid).set(newProfile);
                }
                
                document.getElementById('auth-screen').style.display = 'none';
                document.getElementById('app-interface').style.display = 'flex';
                
                if (typeof onReadyCallback === 'function') onReadyCallback();
            });

        } else {
            setState('auth.user', null);
            setState('profile', null);
            
            document.getElementById('auth-screen').style.display = 'flex';
            document.getElementById('app-interface').style.display = 'none';
        }
    });

    // Podpinamy przyciski z ekranu logowania
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const email = document.getElementById('authEmail').value;
            const pass = document.getElementById('authPass').value;
            auth.signInWithEmailAndPassword(email, pass).catch(err => alert(err.message));
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => window.location.reload());
        });
    }
}
