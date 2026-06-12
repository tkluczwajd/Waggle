// src/modules/auth.js
import { auth, db, fb } from "../core/firebase.js";
import { appState as state, setState } from "../core/state.js";
import { eventBus } from "../core/eventBus.js";

let appInitialized = false;

// 🔥 SYSTEM BŁĘDÓW: Okienko modalne z przyciskiem "OK"
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

// 🔥 KULOODPORNE WYLOGOWANIE I CZYSZCZENIE CACHE PWA
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

// 🔥 WAGGLE FAMILY: PANEL ZARZĄDZANIA CZŁONKIEM STADA (Dla Właściciela)
window.Waggle.openMemberManagement = (uid, name, currentRole) => {
    let modal = document.getElementById('member-mgmt-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'member-mgmt-modal';
        modal.className = 'modal';
        modal.style.zIndex = '2147483646';
        modal.innerHTML = `
            <div class="card" style="padding: 25px 20px; max-width: 320px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <button class="close-modal-btn" onclick="document.getElementById('member-mgmt-modal').style.display='none'">✕</button>
                <h3 style="margin-top: 0; font-size: 20px; font-weight:900;">Zarządzaj członkiem</h3>
                <p id="mgmt-user-name" style="font-weight: 900; color: var(--secondary); margin-bottom: 20px; font-size: 16px;"></p>
                
                <div style="text-align: left; margin-bottom: 25px;">
                    <label style="font-size: 11px; font-weight: 900; color: var(--text-muted); display: block; margin-bottom: 8px; letter-spacing: 0.5px;">ROLA W STADZIE:</label>
                    <select id="mgmt-role-select" style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid var(--border-color); font-weight: 700; background: var(--bg-color); color: var(--text-color); font-family:inherit; outline:none;">
                        <option value="caretaker">📋 Opiekun (Edycja Dziennika)</option>
                        <option value="domownik">🏠 Domownik (Tylko odznaczanie)</option>
                    </select>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 10px; width:100%;">
                    <button id="mgmt-save-btn" class="btn-main" style="background: var(--secondary); font-weight:900;">ZAPISZ ZMIANY</button>
                    <button id="mgmt-kick-btn" class="btn-outline" style="border-color: var(--danger); color: var(--danger); font-weight: 900; margin-top: 5px;">Usuń ze Stada ❌</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('mgmt-user-name').innerText = name;
    document.getElementById('mgmt-role-select').value = currentRole;
    
    const dogOwnerUid = firebase.auth().currentUser.uid;

    document.getElementById('mgmt-save-btn').onclick = async () => {
        const selectedRole = document.getElementById('mgmt-role-select').value;
        try {
            document.getElementById('mgmt-save-btn').innerText = "ZAPISYWANIE...";
            await db.collection('users').doc(dogOwnerUid).set({
                caretakers: {
                    [uid]: { role: selectedRole }
                }
            }, { merge: true });
            modal.style.display = 'none';
            document.getElementById('mgmt-save-btn').innerText = "ZAPISZ ZMIANY";
            notifyUser("✅ Rola członka stada zaktualizowana!");
        } catch (e) {
            showAuthAlert("Błąd podczas zapisu uprawnień.");
        }
    };

    document.getElementById('mgmt-kick-btn').onclick = async () => {
        modal.style.display = 'none';
        // Korzystamy z Twojego autorskiego, pięknego okienka potwierdzeń!
        const confirmModal = document.getElementById('custom-confirm-modal');
        if (confirmModal) {
            document.getElementById('custom-confirm-msg').innerText = `Czy na pewno chcesz trwale usunąć opiekuna ${name} ze swojego Stada?`;
            confirmModal.style.display = 'flex';
            
            document.getElementById('custom-confirm-ok').onclick = async () => {
                try {
                    await db.collection('users').doc(dogOwnerUid).update({
                        [`caretakers.${uid}`]: fb.firestore.FieldValue.delete()
                    });
                    confirmModal.style.display = 'none';
                    notifyUser("❌ Usunięto członka ze Stada.");
                } catch(err) {
                    showAuthAlert("Nie udało się usunąć użytkownika.");
                }
            };
            document.getElementById('custom-confirm-cancel').onclick = () => { confirmModal.style.display = 'none'; };
        }
    };

    modal.style.display = 'flex';
};

// 🔥 WAGGLE FAMILY: Dynamiczny Generator awatarów opiekunów z oznaczeniem ról i uprawnieniami
function renderCaretakers(profileData, loggedInUid) {
    const container = document.getElementById('caretakers-list-container');
    if (!container) return;
    
    const dogOwnerUid = localStorage.getItem('activeDogId') || loggedInUid;
    const isOwnerOfDog = dogOwnerUid === loggedInUid;
    
    let html = '';
    
    // 1. Główny właściciel (Zawsze pierwszy na liście)
    html += `<div style="width: 36px; height: 36px; background: #2c3e50; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); position: relative;" title="Główny Właściciel psa">
                WŁ
                <span style="position: absolute; bottom: -3px; right: -3px; background: #2d3436; color: #fff; font-size: 6px; padding: 1px 3px; border-radius: 4px; font-weight: 900; scale: 0.85; border: 1px solid white;">WŁ</span>
             </div>`;
    
    // 2. Dodatkowi domownicy pobrani z bazy Firebase
    let currentRole = isOwnerOfDog ? 'owner' : 'domownik';

    if (profileData && profileData.caretakers) {
        const colors = ['#ff5252', '#33d9b2', '#ffb142', '#706fd3', '#ff793f'];
        let colorIndex = 0;

        for (const [uid, caretaker] of Object.entries(profileData.caretakers)) {
            if (uid === loggedInUid) currentRole = caretaker.role || 'caretaker';

            const name = caretaker.name || "Opiekun";
            const role = caretaker.role || "caretaker";
            const bgColor = colors[colorIndex % colors.length];
            colorIndex++;

            const roleBadge = role === 'domownik' ? 'DO' : 'OP';
            
            // INTELIGENTNY KLIK: Właściciel zarządza rolą, pozostali otwierają czat!
            let clickAction = "";
            if (isOwnerOfDog) {
                clickAction = `window.Waggle.openMemberManagement('${uid}', '${name}', '${role}')`;
            } else {
                clickAction = `if(window.Waggle && window.Waggle.openChatWithUser) { window.Waggle.openChatWithUser('${uid}', '${name}'); } else { alert('Wkrótce otworzy się tu czat z: ${name}'); }`;
            }

            html += `<div onclick="${clickAction}" style="width: 36px; height: 36px; background: ${bgColor}; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12); cursor: pointer; position: relative; transition: transform 0.2s;" title="${name} (${role === 'domownik' ? 'Domownik' : 'Opiekun'})" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                ${name.charAt(0).toUpperCase()}
                <span style="position: absolute; bottom: -3px; right: -3px; background: #2d3436; color: white; font-size: 6px; padding: 1px 3px; border-radius: 4px; font-weight: 900; scale: 0.85; border: 1px solid white;">${roleBadge}</span>
            </div>`;
        }
    }
    
    // 3. Przycisk zapraszania (Tylko Właściciel i Opiekun mogą zapraszać, Domownik ma blokadę)
    if (currentRole !== 'domownik') {
        html += `<button onclick="window.openInviteModal()" style="background: var(--bg-color); border: 1px dashed var(--text-muted); color: var(--text-muted); width: 36px; height: 36px; border-radius: 50%; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Zaproś nowego opiekuna">+</button>`;
    }
    
    container.innerHTML = html;

    // 🔥 BLOKADA UPRAWNIEŃ W UI (Ukrywanie elementów na bazie przyznanej roli)
    const careSettingsBtn = document.getElementById('openCareSettingsBtn'); // Trybik celów opieki
    const safeSetupBtn = document.getElementById('openSafeSetupBtn'); // Ołówek danych medycznych S.A.F.E
    const deleteAccountBtn = document.getElementById('deleteAccountBtn'); // Czerwony przycisk usuwania konta

    if (currentRole === 'owner') {
        if (careSettingsBtn) careSettingsBtn.style.display = 'inline-block';
        if (safeSetupBtn) safeSetupBtn.style.display = 'flex';
        if (deleteAccountBtn) deleteAccountBtn.parentElement ? deleteAccountBtn.parentElement.style.display = 'block' : deleteAccountBtn.style.display = 'block';
    } else {
        // Blokada dla Opiekuna oraz Domownika
        if (careSettingsBtn) careSettingsBtn.style.display = 'none';
        if (safeSetupBtn) safeSetupBtn.style.display = 'none';
        if (deleteAccountBtn) deleteAccountBtn.parentElement ? deleteAccountBtn.parentElement.style.display = 'none' : deleteAccountBtn.style.display = 'none';
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

                // Rysujemy dynamiczne awatary z przypisanymi uprawnieniami ról
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

    // 2. OBSŁUGA PRZYCISKÓW (Globalny nasłuchiwacz)
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
