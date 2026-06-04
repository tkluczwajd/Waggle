// src/modules/auth.js
import { auth, db, fb } from "../core/firebase.js";
import { appState as state, setState } from "../core/state.js";
import { eventBus } from "../core/eventBus.js";

let appInitialized = false;

// Słownik błędów Firebase na język polski
function translateAuthError(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-email': return "Niepoprawny format adresu e-mail.";
        case 'auth/user-disabled': return "Konto zostało zablokowane.";
        case 'auth/user-not-found': return "Nie znaleziono użytkownika z tym adresem.";
        case 'auth/wrong-password': return "Błędne hasło.";
        case 'auth/invalid-credential': return "Błędny e-mail lub hasło.";
        case 'auth/email-already-in-use': return "Ten adres e-mail jest już zajęty.";
        case 'auth/weak-password': return "Hasło jest za słabe (min. 6 znaków).";
        case 'auth/missing-password': return "Wpisz hasło.";
        default: return "Wystąpił błąd autoryzacji. Spróbuj ponownie.";
    }
}

export function initAuth(onReady) {
    // 1. MONITOROWANIE STANU ZALOGOWANIA
    auth.onAuthStateChanged(user => {
        const loader = document.getElementById("loader");
        if (loader) loader.style.display = "none";

        if (user) {
            setState('auth.user', user);
            state.user = user; 
            
            const unsub = db.collection("users").doc(user.uid).onSnapshot(doc => {
                let data = doc.exists ? doc.data() : { name: "Piesek", walkCount: 0, isSearchable: true, city: "", breed: "" };
                data = { ...data, isPremium: data.isPremium || false };

                if (!doc.exists) db.collection("users").doc(user.uid).set(data, {merge: true});

                setState('profile', data);
                state.profile = data;
                eventBus.emit('profileUpdated', data);
                
                document.getElementById("auth-screen").style.display = "none";
                document.getElementById("app-interface").style.display = "flex";
                
                if (!appInitialized && typeof onReady === 'function') {
                    onReady();
                    appInitialized = true;
                }
            });
        } else {
            appInitialized = false;
            document.getElementById("app-interface").style.display = "none";
            document.getElementById("auth-screen").style.display = "flex";
        }
    });

    // 2. OBSŁUGA PRZYCISKÓW LOGOWANIA, REJESTRACJI, RESETU I WYLOGOWANIA
    document.addEventListener('click', (e) => {
        
        // 🔥 WYLOGOWANIE (Tego tu brakowało!)
        if (e.target.closest('#logoutBtn')) {
            e.preventDefault();
            
            if (window.Waggle && window.Waggle.showToast) {
                window.Waggle.showToast("Wylogowywanie... ⏳");
            }
            
            auth.signOut().then(() => {
                // Czyszczenie pamięci PWA
                localStorage.clear();
                sessionStorage.clear();
                // Twardy powrót na ekran logowania
                window.location.replace(window.location.origin + window.location.pathname);
            }).catch((err) => {
                console.error("Błąd wylogowania:", err);
                if (window.Waggle && window.Waggle.showToast) {
                    window.Waggle.showToast("Wystąpił błąd podczas wylogowania.");
                }
            });
        }

        // LOGOWANIE
        if (e.target.id === 'loginBtn') {
            const email = document.getElementById('authEmail').value.trim();
            const pass = document.getElementById('authPass').value.trim();
            if(!email || !pass) return window.Waggle.showToast("Wpisz e-mail i hasło! 🐾");
            window.Waggle.showToast("Logowanie... ⏳");
            
            auth.signInWithEmailAndPassword(email, pass).catch(err => {
                window.Waggle.showToast(`Błąd: ${translateAuthError(err.code)}`);
            });
        }

        // REJESTRACJA
        if (e.target.id === 'registerBtn') {
            const email = document.getElementById('authEmail').value.trim();
            const pass = document.getElementById('authPass').value.trim();
            const termsChecked = document.getElementById('legalTerms')?.checked;

            if (!termsChecked) return window.Waggle.showToast("Musisz zaakceptować regulamin! 📜");
            if(!email || !pass) return window.Waggle.showToast("Wpisz e-mail i hasło! 🐾");
            
            window.Waggle.showToast("Tworzenie konta... ⏳");
            
            auth.createUserWithEmailAndPassword(email, pass).then((userCredential) => {
                db.collection("users").doc(userCredential.user.uid).set({
                    email: email,
                    createdAt: fb.firestore.FieldValue.serverTimestamp()
                }, {merge: true});
                window.Waggle.showToast("Konto utworzone! Witaj w Stadzie! 🎉");
            }).catch(err => {
                window.Waggle.showToast(`Błąd: ${translateAuthError(err.code)}`);
            });
        }
        
        // RESET HASŁA
        if (e.target.id === 'resetPasswordBtn') {
            const email = document.getElementById('authEmail').value.trim();
            if (!email) return window.Waggle.showToast("Wpisz swój e-mail wyżej, aby zresetować hasło! 📧");
            
            auth.sendPasswordResetEmail(email).then(() => {
                window.Waggle.showToast("Link do resetu hasła wysłany na e-mail! 📬");
            }).catch(err => {
                window.Waggle.showToast(`Błąd: ${translateAuthError(err.code)}`);
            });
        }
    });
}
