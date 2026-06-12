// src/modules/auth.js
import { auth, db, fb } from "../core/firebase.js";
import { appState as state, setState } from "../core/state.js";
import { eventBus } from "../core/eventBus.js";
import { renderCaretakers } from "./family.js"; // 🔥 IMPORTUJEMY NASZ NOWY MODUŁ STADA!

let appInitialized = false;

// 🔥 SYSTEM BŁĘDÓW
function showAuthAlert(msg, isError = true) {
    let modal = document.getElementById('auth-alert-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'auth-alert-modal';
        modal.className = 'modal';
        modal.style.zIndex = '2147483647'; 
        modal.innerHTML = `
            <div class="card" style="padding: 30px 20px; max-width: 320px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                <div id="auth-alert-icon" style="font-size: 45px; margin-bottom: 15px;">🛑</div>
                <h3 id="auth-alert-title" style="margin-top: 0; font-size: 22px;">Uwaga</h3>
                <p id="auth-alert-msg" style="font-weight: 700; color: var(--text-color); margin-bottom: 25px; font-size: 15px; line-height: 1.4;"></p>
                <button id="auth-alert-btn" class="btn-main" style="width: 100%; padding: 14px; font-size: 14px; font-weight: 900; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">OK, rozumiem</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('auth-alert-btn').onclick = () => { modal.style.display = 'none'; };
    }
    document.getElementById('auth-alert-icon').innerText = isError ? '🛑' : '✅';
    document.getElementById('auth-alert-title').innerText = isError ? 'Błąd' : 'Sukces';
    document.getElementById('auth-alert-title').style.color = isError ? 'var(--danger)' : 'var(--secondary)';
    document.getElementById('auth-alert-btn').style.background = isError ? 'var(--danger)' : 'var(--secondary)';
    document.getElementById('auth-alert-msg').innerText = msg;
    modal.style.display = 'flex';
}

function notifyUser(msg) {
    if (window.Waggle && typeof window.Waggle.showToast === 'function') {
        window.Waggle.showToast(msg);
    } else {
        console.log(msg);
    }
}

// 🔥 KULOODPORNE WYLOGOWANIE
window.Waggle = window.Waggle || {};
window.Waggle.logout = () => {
    notifyUser("Wylogowywanie... ⏳");
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
        console.error(err);
        showAuthAlert("Wystąpił błąd podczas wylogowania.");
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

export function initAuth(onReady) {
    // 1. MONITOROWANIE STANU ZALOGOWANIA
    auth.onAuthStateChanged(user => {
        const loader = document.getElementById("loader");
        if (loader) loader.style.display = "none";

        if (user) {
            setState('auth.user', user);
            state.user = user; 
            
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

                // 🔥 Wywołujemy zewnętrzną funkcję zarządzającą Stadem
                renderCaretakers(data, user.uid);
                
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

    // 2. OBSŁUGA PRZYCISKÓW LOGOWANIA (Globalny nasłuchiwacz)
    document.addEventListener('click', (e) => {
        
        // LOGOWANIE
        if (e.target.id === 'loginBtn') {
            const email = document.getElementById('authEmail').value.trim();
            const pass = document.getElementById('authPass').value.trim();
            if(!email || !pass) return showAuthAlert("Wpisz e-mail i hasło!");
            
            const btn = document.getElementById('loginBtn');
            const originalText = btn.innerText;
            btn.innerText = "Logowanie...";
            
            auth.signInWithEmailAndPassword(email, pass).catch(err => {
                btn.innerText = originalText;
                showAuthAlert(translateAuthError(err.code));
            });
        }

        // REJESTRACJA
        if (e.target.id === 'registerBtn') {
            const email = document.getElementById('authEmail').value.trim();
            const pass = document.getElementById('authPass').value.trim();
            const termsChecked = document.getElementById('legalTerms')?.checked;

            if (!termsChecked) return showAuthAlert("Musisz zaakceptować regulamin!");
            if(!email || !pass) return showAuthAlert("Wpisz e-mail i hasło!");
            if(pass.length < 6) return showAuthAlert("Hasło musi mieć min. 6 znaków!");
            
            const btn = document.getElementById('registerBtn');
            const originalText = btn.innerText;
            btn.innerText = "Tworzenie...";

            auth.createUserWithEmailAndPassword(email, pass).then((userCredential) => {
                db.collection("users").doc(userCredential.user.uid).set({
                    email: email,
                    createdAt: fb.firestore.FieldValue.serverTimestamp()
                }, {merge: true});
                showAuthAlert("Konto utworzone pomyślnie! Witaj w Stadzie!", false);
            }).catch(err => {
                btn.innerText = originalText;
                showAuthAlert(translateAuthError(err.code));
            });
        }
        
        // RESET HASŁA
        if (e.target.id === 'resetPasswordBtn') {
            const email = document.getElementById('authEmail').value.trim();
            if (!email) return showAuthAlert("Wpisz swój e-mail wyżej, aby zresetować hasło!");
            
            auth.sendPasswordResetEmail(email).then(() => {
                showAuthAlert("Link do resetu hasła został wysłany na Twój adres e-mail.", false);
            }).catch(err => showAuthAlert(translateAuthError(err.code)));
        }
    });
}
