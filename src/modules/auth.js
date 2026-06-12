// src/modules/auth.js
import { auth, db, fb } from "../core/firebase.js";
import { appState as state, setState } from "../core/state.js";
import { eventBus } from "../core/eventBus.js";

let appInitialized = false;

// 🔥 BEZPIECZNE POWIADOMIENIA (Fallback do alertu, jeśli UI jeszcze nie wstało)
function notifyUser(msg) {
    if (window.Waggle && typeof window.Waggle.showToast === 'function') {
        window.Waggle.showToast(msg);
    } else {
        alert(msg); // Niezawodny systemowy fallback!
    }
}

// 🔥 KULOODPORNE WYLOGOWANIE I CZYSZCZENIE CACHE PWA
window.Waggle = window.Waggle || {};
window.Waggle.logout = () => {
    notifyUser("Wylogowywanie i czyszczenie pamięci... ⏳");
    
    auth.signOut().then(() => {
        // 1. Czyszczenie pamięci lokalnej (sesja użytkownika)
        localStorage.clear();
        sessionStorage.clear();

        // 2. Brutalne usunięcie Service Workera i Cache (Twardy reset PWA)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                    registration.unregister();
                }
            });
            caches.keys().then(keys => {
                keys.forEach(key => caches.delete(key));
            });
        }

        // 3. Powrót na ekran logowania z ominięciem cache przeglądarki
        setTimeout(() => {
            window.location.replace(window.location.origin + window.location.pathname + '?v=' + new Date().getTime());
        }, 500);

    }).catch((err) => {
        console.error("Błąd wylogowania:", err);
        notifyUser("Wystąpił błąd podczas wylogowania.");
    });
};

// Słownik błędów Firebase na język polski
function translateAuthError(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-email': return "Niepoprawny format adresu e-mail.";
        case 'auth/user-disabled': return "Konto zostało zablokowane.";
        case 'auth/user-not-found': return "Nie znaleziono konta z tym adresem.";
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
            
            // 🔥 WAGGLE FAMILY: MAGIA! Wybieramy, czyj profil psa ładujemy!
            const targetUid = localStorage.getItem('activeDogId') || user.uid;
            
            const unsub = db.collection("users").doc(targetUid).onSnapshot(doc => {
                let data = doc.exists ? doc.data() : null;
                
                // Tworzymy domyślny profil TYLKO jeśli to nasze własne nowe konto i jest puste
                if (!data) {
                    data = { 
                        name: "Piesek", 
                        walkCount: 0, 
                        isSearchable: true, 
                        city: "", 
                        breed: "",
                        createdAt: fb.firestore.FieldValue.serverTimestamp()
                    };
                    // Zapisujemy w bazie tylko u właściciela
                    if (targetUid === user.uid) {
                        db.collection("users").doc(user.uid).set(data, {merge: true});
                    }
                }
                
                data = { ...data, isPremium: data.isPremium || false };
                
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

    // 2. OBSŁUGA PRZYCISKÓW LOGOWANIA, REJESTRACJI I RESETU
    document.addEventListener('click', (e) => {
        
        // LOGOWANIE
        if (e.target.id === 'loginBtn') {
            const email = document.getElementById('authEmail').value.trim();
            const pass = document.getElementById('authPass').value.trim();
            if(!email || !pass) return notifyUser("Wpisz e-mail i hasło! 🐾");
            notifyUser("Logowanie... ⏳");
            
            auth.signInWithEmailAndPassword(email, pass).catch(err => {
                notifyUser(`Błąd: ${translateAuthError(err.code)}`);
            });
        }

        // REJESTRACJA
        if (e.target.id === 'registerBtn') {
            const email = document.getElementById('authEmail').value.trim();
            const pass = document.getElementById('authPass').value.trim();
            const termsChecked = document.getElementById('legalTerms')?.checked;

            if (!termsChecked) return notifyUser("Musisz zaakceptować regulamin! 📜");
            if(!email || !pass) return notifyUser("Wpisz e-mail i hasło! 🐾");
            
            notifyUser("Tworzenie konta... ⏳");
            
            auth.createUserWithEmailAndPassword(email, pass).then((userCredential) => {
                // Zapisujemy e-mail w tle w prywatnym dokumencie nowego użytkownika
                db.collection("users").doc(userCredential.user.uid).set({
                    email: email,
                    createdAt: fb.firestore.FieldValue.serverTimestamp()
                }, {merge: true});
                notifyUser("Konto utworzone! Witaj w Stadzie! 🎉");
            }).catch(err => {
                notifyUser(`Błąd: ${translateAuthError(err.code)}`);
            });
        }
        
        // RESET HASŁA
        if (e.target.id === 'resetPasswordBtn') {
            const email = document.getElementById('authEmail').value.trim();
            if (!email) return notifyUser("Wpisz swój e-mail wyżej, aby zresetować hasło! 📧");
            
            auth.sendPasswordResetEmail(email).then(() => {
                notifyUser("Link do resetu hasła wysłany na e-mail! 📬");
            }).catch(err => {
                notifyUser(`Błąd: ${translateAuthError(err.code)}`);
            });
        }
    });
}
