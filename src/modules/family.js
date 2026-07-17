// src/modules/family.js
import { auth, db, fb } from "../core/firebase.js";

window.Waggle = window.Waggle || {};

function notifyUser(msg) {
    if (window.Waggle && typeof window.Waggle.showToast === 'function') {
        window.Waggle.showToast(msg);
    } else {
        alert(msg);
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
                    <button id="mgmt-msg-btn" class="btn-outline" style="border-color: var(--primary); color: var(--primary); font-weight: 900; margin-bottom: 5px;">Napisz wiadomość 💬</button>
                    <button id="mgmt-save-btn" class="btn-main" style="background: var(--secondary); font-weight:900;">ZAPISZ ZMIANY</button>
                    <button id="mgmt-kick-btn" class="btn-outline" style="border-color: var(--danger); color: var(--danger); font-weight: 900; margin-top: 5px;">Usuń ze Stada ❌</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('mgmt-user-name').innerText = name;
    document.getElementById('mgmt-role-select').value = currentRole;
    
    const dogOwnerUid = auth.currentUser.uid;

    document.getElementById('mgmt-msg-btn').onclick = () => {
        modal.style.display = 'none';
        if (window.Waggle && window.Waggle.openChatWithUser) {
            window.Waggle.openChatWithUser(uid, name);
        } else {
            notifyUser(`Wkrótce otworzy się czat z: ${name}`);
        }
    };

    document.getElementById('mgmt-save-btn').onclick = async () => {
        const selectedRole = document.getElementById('mgmt-role-select').value;
        try {
            document.getElementById('mgmt-save-btn').innerText = "ZAPISYWANIE...";
            await db.collection('users').doc(dogOwnerUid).set({
                caretakers: { [uid]: { role: selectedRole } }
            }, { merge: true });
            modal.style.display = 'none';
            document.getElementById('mgmt-save-btn').innerText = "ZAPISZ ZMIANY";
            notifyUser("✅ Rola członka stada zaktualizowana!");
        } catch (e) {
            alert("Błąd podczas zapisu uprawnień.");
        }
    };

    document.getElementById('mgmt-kick-btn').onclick = async () => {
        modal.style.display = 'none';
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
                    alert("Nie udało się usunąć użytkownika.");
                }
            };
            document.getElementById('custom-confirm-cancel').onclick = () => { confirmModal.style.display = 'none'; };
        }
    };

    modal.style.display = 'flex';
};

// 🔥 NOWOŚĆ: MODAL ZAPROSZENIA (Dla Właściciela)
window.openInviteModal = () => {
    let modal = document.getElementById('invite-pack-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'invite-pack-modal';
        modal.className = 'modal';
        modal.style.zIndex = '2147483646';
        document.body.appendChild(modal);
    }
    
    // Używamy UID jako unikalnego kodu Stada
    const packCode = auth.currentUser.uid;
    
    modal.innerHTML = `
        <div class="card" style="padding: 30px 20px; max-width: 320px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
            <button class="close-modal-btn" onclick="document.getElementById('invite-pack-modal').style.display='none'">✕</button>
            <div style="font-size: 40px; margin-bottom: 10px;">💌</div>
            <h3 style="margin-top: 0; font-size: 22px; font-weight:900;">Zaproś do Stada</h3>
            <p style="font-size: 13px; color: var(--text-muted); font-weight: 600; line-height: 1.5; margin-bottom: 20px;">
                Przekaż poniższy kod członkowi rodziny. Aby dołączyć, musi on kliknąć "Dołącz do Stada" w swoim profilu Waggle.
            </p>
            <div style="background: var(--bg-color); border: 2px dashed var(--border-color); border-radius: 16px; padding: 15px; margin-bottom: 20px; user-select: all; font-family: monospace; font-size: 16px; font-weight: 900; color: var(--primary); letter-spacing: 1px;">
                ${packCode}
            </div>
            <button onclick="navigator.clipboard.writeText('${packCode}'); window.Waggle.showToast('✅ Skopiowano kod!');" class="btn-main" style="width: 100%; box-shadow: 0 4px 15px rgba(52, 172, 224, 0.3);">📋 Kopiuj Kod</button>
        </div>
    `;
    modal.style.display = 'flex';
};

// 🔥 NOWOŚĆ: MODAL DOŁĄCZANIA (Dla Współopiekuna)
window.Waggle.showJoinPackModal = () => {
    let modal = document.getElementById('join-pack-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'join-pack-modal';
        modal.className = 'modal';
        modal.style.zIndex = '2147483646';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="card" style="padding: 30px 20px; max-width: 320px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
            <button class="close-modal-btn" onclick="document.getElementById('join-pack-modal').style.display='none'">✕</button>
            <div style="font-size: 40px; margin-bottom: 10px;">🤝</div>
            <h3 style="margin-top: 0; font-size: 22px; font-weight:900;">Dołącz do Stada</h3>
            <p style="font-size: 13px; color: var(--text-muted); font-weight: 600; line-height: 1.5; margin-bottom: 20px;">
                Wpisz Kod Stada otrzymany od głównego właściciela psa, aby uzyskać dostęp do dziennika i spacerów.
            </p>
            <input type="text" id="join-pack-input" placeholder="Wklej Kod Stada..." style="width: 100%; padding: 14px; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 15px; background: var(--bg-color); color: var(--text-color); font-weight: 700; text-align: center; font-family: monospace;">
            <button id="join-pack-submit-btn" class="btn-main" style="width: 100%; background: var(--secondary);">Połącz konta 🔗</button>
        </div>
    `;
    
    document.getElementById('join-pack-submit-btn').onclick = () => {
        const code = document.getElementById('join-pack-input').value.trim();
        if(code) {
            document.getElementById('join-pack-submit-btn').innerText = "ŁĄCZENIE... ⏳";
            window.Waggle.joinFamily(code);
            modal.style.display = 'none';
        }
    };
    
    modal.style.display = 'flex';
};

// 🔥 WAGGLE FAMILY: Rysowanie awatarów, czatu i blokada UI
export function renderCaretakers(profileData, loggedInUid) {
    const container = document.getElementById('caretakers-list-container');
    if (!container) return;
    
    const dogOwnerUid = localStorage.getItem('activeDogId') || loggedInUid;
    const isOwnerOfDog = dogOwnerUid === loggedInUid;
    
    let html = '';
    
    html += `<div style="width: 36px; height: 36px; background: #2c3e50; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); position: relative; flex-shrink: 0;" title="Główny Właściciel psa">
                WŁ
                <span style="position: absolute; bottom: -3px; right: -3px; background: #2d3436; color: #fff; font-size: 6px; padding: 1px 3px; border-radius: 4px; font-weight: 900; scale: 0.85; border: 1px solid white;">WŁ</span>
             </div>`;
    
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
            
            let clickAction = isOwnerOfDog 
                ? `window.Waggle.openMemberManagement('${uid}', '${name}', '${role}')` 
                : `if(window.Waggle && window.Waggle.openChatWithUser) { window.Waggle.openChatWithUser('${uid}', '${name}'); } else { alert('Wkrótce otworzy się tu czat z: ${name}'); }`;

            html += `<div onclick="${clickAction}" style="width: 36px; height: 36px; background: ${bgColor}; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12); cursor: pointer; position: relative; transition: transform 0.2s; flex-shrink: 0;" title="${name} (${role === 'domownik' ? 'Domownik' : 'Opiekun'})" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                ${name.charAt(0).toUpperCase()}
                <span style="position: absolute; bottom: -3px; right: -3px; background: #2d3436; color: white; font-size: 6px; padding: 1px 3px; border-radius: 4px; font-weight: 900; scale: 0.85; border: 1px solid white;">${roleBadge}</span>
            </div>`;
        }
    }
    
    if (currentRole !== 'domownik') {
        html += `<button onclick="window.openInviteModal()" style="background: var(--bg-color); border: 1px dashed var(--text-muted); color: var(--text-muted); width: 36px; height: 36px; border-radius: 50%; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; flex-shrink: 0;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Zaproś nowego opiekuna">+</button>`;
    }

    html += `<button onclick="if(window.Waggle && window.Waggle.openGroupChat) { window.Waggle.openGroupChat('${dogOwnerUid}', 'Stado: ${profileData.name || 'Piesek'}'); } else { alert('Czat grupowy Stada wkrótce!'); }" style="background: var(--primary); border: none; color: white; height: 36px; border-radius: 18px; padding: 0 15px; font-size: 12px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(255, 82, 82, 0.3); transition: transform 0.2s; margin-left: auto; flex-shrink: 0;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">💬 Czat Stada</button>`;
    
    container.innerHTML = html;

    const careSettingsBtn = document.getElementById('openCareSettingsBtn');
    const safeSetupBtn = document.getElementById('openSafeSetupBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');

    if (currentRole === 'owner') {
        if (careSettingsBtn) careSettingsBtn.style.display = 'inline-block';
        if (safeSetupBtn) safeSetupBtn.style.display = 'flex';
        if (deleteAccountBtn) deleteAccountBtn.parentElement ? deleteAccountBtn.parentElement.style.display = 'block' : deleteAccountBtn.style.display = 'block';
    } else {
        if (careSettingsBtn) careSettingsBtn.style.display = 'none';
        if (safeSetupBtn) safeSetupBtn.style.display = 'none';
        if (deleteAccountBtn) deleteAccountBtn.parentElement ? deleteAccountBtn.parentElement.style.display = 'none' : deleteAccountBtn.style.display = 'none';
    }
}

// 🔥 KRYTYCZNA POPRAWKA: Dwukierunkowa synchronizacja Stada
window.Waggle.joinFamily = async (ownerUid) => {
    if (!ownerUid) return;
    if (ownerUid === auth.currentUser.uid) {
        return notifyUser("Nie możesz dołączyć do własnego stada!");
    }
    
    const myUid = auth.currentUser.uid;
    let myName = localStorage.getItem('userName');
    if (!myName && auth.currentUser.email) myName = auth.currentUser.email.split('@')[0];
    if (!myName) myName = "Współopiekun";

    try {
        // Sprawdzamy czy Właściciel istnieje w bazie
        const ownerDoc = await db.collection('users').doc(ownerUid).get();
        if (!ownerDoc.exists) {
            return notifyUser("❌ Nie znaleziono Stada z takim kodem.");
        }

        // 1. Zapisujemy Współopiekuna u Właściciela psa (jako domyślnie 'caretaker')
        await db.collection('users').doc(ownerUid).set({
            [`caretakers.${myUid}`]: {
                name: myName,
                role: 'caretaker'
            }
        }, { merge: true });

        // 2. Zapisujemy u Współopiekuna, że od teraz "patrzy" na profil tego psa
        localStorage.setItem('activeDogId', ownerUid);
        
        await db.collection('users').doc(myUid).set({
            memberOf: fb.firestore.FieldValue.arrayUnion(ownerUid)
        }, { merge: true });
        
        notifyUser("🐾 Połączono konta! Witaj w nowym Stadzie.");
        
        setTimeout(() => {
            window.location.reload();
        }, 1500);
        
    } catch(e) {
        console.error(e);
        notifyUser("Błąd podczas dołączania do stada.");
    }
};
