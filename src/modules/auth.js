// src/modules/auth.js
import { auth, db, fb } from "../core/firebase.js";
import { appState as state, setState } from "../core/state.js";
import { eventBus } from "../core/eventBus.js";

let appInitialized = false;

// 🔥 BEZPIECZNE POWIADOMIENIA (Fallback do alertu systemowego)
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
        localStorage.clear();
        sessionStorage.clear();

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) registration.unregister();
            });
            caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
        }

        setTimeout(() => {
            window.location.replace(window.location.origin + window.location.pathname + '?v=' + new Date().getTime());
        }, 500);

    }).catch((err) => {
        console.error("Błąd wylogowania:", err);
        notifyUser("Wystąpił błąd podczas wylogowania.");
    });
};

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

// 🔥 WAGGLE FAMILY: Generator awatarów opiekunów
function renderCaretakers(profileData) {
    const container = document.getElementById('caretakers-list-container');
    if (!container) return;
    
    let html = '';
    
    // 1. Główny właściciel (Gospodarz)
    html += `<div style="width: 36px; height: 36px; background: var(--secondary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; box-shadow: 0 2px 8px rgba(52, 172, 224, 0.3);" title="Główny Opiekun">Gł</div>`;
    
    // 2. Dodatkowi domownicy pobrani z bazy Firebase
    if (profileData && profileData.caretakers) {
        for (const [uid, caretaker] of Object.entries(profileData.caretakers)) {
            const initial = caretaker.name ? caretaker.name.charAt(0).toUpperCase() : 'O';
            html += `<div style="width: 36px; height: 36px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; box-shadow: 0 2px 8px rgba(255, 82, 82, 0.3);" title="${caretaker.name}">${initial}</div>`;
        }
    }
    
    // 3. Przycisk zapraszania
    html += `<button onclick="window.openInviteModal()" style="background: var(--bg-color); border: 1px dashed var(--text-muted); color: var(--text-muted); width: 36px; height: 36px; border-radius: 50%; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Zaproś domownika">+</button>`;
    
    container.innerHTML = html;
}

export function initAuth(onReady) {
    // 1. MONITOROWANIE STANU ZALOGOWANIA
    auth.onAuthStateChanged(user => {
        const loader = document.getElementById("loader");
        if (loader) loader.style.display = "none";

        if (user) {
            setState('auth.user', user);
            state.user = user; 
            
            // WAGGLE FAMILY: Pobieramy dane wybranego psa (Swojego lub ze Stada)
            const targetUid = localStorage.getItem('activeDogId') || user.uid;
            
            const unsub = db.collection("users").doc(targetUid).onSnapshot(doc => {
                let data = doc.exists ? doc.data() : null;
                
                if (!data) {
                    data = { 
                        name: "Piesek", 
                        walkCount: 0, 
                        isSearchable: true, 
                        city: "", 
                        breed: "",
                        createdAt: fb.firestore.FieldValue.serverTimestamp()
                    };
                    if (targetUid === user.uid) {
                        db.collection("users").doc(user.uid).set(data, {merge: true});
                    }
                }
                
                data = { ...data, isPremium: data.isPremium || false };
                
                setState('profile', data);
                state.profile = data;
                eventBus.emit('profileUpdated', data);

                // Rysujemy dynamiczne awatary przy każdej zmianie profilu
                renderCaretakers(data);
                
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

    // 2. KULOODPORNA OBSŁUGA PRZYCISKÓW LOGOWANIA (Twarde podpięcie pod elementy)
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.onclick = () => {
            const email = document.getElementById('authEmail').value.trim();
            const pass = document.getElementById('authPass').value.trim();
            if(!email || !pass) return notifyUser("⚠️ Wpisz e-mail i hasło!");
            
            notifyUser("Logowanie... ⏳");
            auth.signInWithEmailAndPassword(email, pass).catch(err => {
                notifyUser(`❌ Błąd: ${translateAuthError(err.code)}`);
            });
        };
    }

    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.onclick = () => {
            const email = document.getElementById('authEmail').value.trim();
            const pass = document.getElementById('authPass').value.trim();
            const termsChecked = document.getElementById('legalTerms')?.checked;

            if (!termsChecked) return notifyUser("⚠️ Musisz zaakceptować regulamin!");
            if(!email || !pass) return notifyUser("⚠️ Wpisz e-mail i hasło!");
            if(pass.length < 6) return notifyUser("⚠️ Hasło musi mieć min. 6 znaków!");
            
            notifyUser("Tworzenie konta... ⏳");
            auth.createUserWithEmailAndPassword(email, pass).then((userCredential) => {
                db.collection("users").doc(userCredential.user.uid).set({
                    email: email,
                    createdAt: fb.firestore.FieldValue.serverTimestamp()
                }, {merge: true});
                notifyUser("✅ Konto utworzone! Witaj w Stadzie!");
            }).catch(err => {
                notifyUser(`❌ Błąd: ${translateAuthError(err.code)}`);
            });
        };
    }
    
    const resetBtn = document.getElementById('resetPasswordBtn');
    if (resetBtn) {
        resetBtn.onclick = () => {
            const email = document.getElementById('authEmail').value.trim();
            if (!email) return notifyUser("📧 Wpisz swój e-mail wyżej, aby zresetować hasło!");
            
            auth.sendPasswordResetEmail(email).then(() => {
                notifyUser("📬 Link do resetu hasła wysłany!");
            }).catch(err => notifyUser(`❌ Błąd: ${translateAuthError(err.code)}`));
        };
    }
}
