// src/modules/chat/groupListeners.js
import { appState as state } from '../../core/state.js';
import { db, fb } from '../../core/firebase.js';
import { searchUsersInDb, createGroupInDb } from '../../services/chatService.js';

// Jeśli rozbiłeś już renderery, zmień 'chatRenderer.js' na 'groupRenderer.js'
import { renderGroupUsersList, renderGroupSettingsList } from './chatRenderer.js'; 

let selectedGroupUsers = []; 

// 🔥 Nowa funkcja: Własne okienko potwierdzenia zamiast brzydkiego confirm()
window.Waggle.showCustomConfirm = function(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-confirm-modal');
        const msgEl = document.getElementById('custom-confirm-msg');
        const btnOk = document.getElementById('custom-confirm-ok');
        const btnCancel = document.getElementById('custom-confirm-cancel');

        if (!modal) {
            // Jeśli ktoś zapomniał wkleić HTML, awaryjnie włącz brzydki systemowy
            resolve(confirm(message));
            return;
        }

        msgEl.innerText = message;
        modal.style.display = 'flex';

        btnOk.onclick = () => { modal.style.display = 'none'; resolve(true); };
        btnCancel.onclick = () => { modal.style.display = 'none'; resolve(false); };
    });
};

export function loadUsersForGroup() {
    const listCont = document.getElementById('groupUsersList');
    if (!listCont) return;
    listCont.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 12px; margin: 10px 0;">Szukam piesków w okolicy...</p>';
    selectedGroupUsers = []; 
    searchUsersInDb('', (users) => {
        const currentUid = state.user?.uid;
        const filteredUsers = users.filter(u => u.id !== currentUid);
        renderGroupUsersList(filteredUsers, listCont);
    });
}

export function toggleGroupUser(checkbox) {
    const uid = checkbox.value;
    const name = checkbox.getAttribute('data-name');
    const avatar = checkbox.getAttribute('data-avatar');
    if(checkbox.checked) { selectedGroupUsers.push({uid, name, avatar}); }
    else { selectedGroupUsers = selectedGroupUsers.filter(u => u.uid !== uid); }
}

export function createGroupChat() {
    const nameInput = document.getElementById('groupNameInput');
    const groupName = nameInput.value.trim();
    if(!groupName) { window.Waggle.showToast("Wpisz nazwę stada! 🐕"); return; }
    if(selectedGroupUsers.length === 0) { window.Waggle.showToast("Zaznacz kogoś! 🐾"); return; }
    const myUid = state.user.uid;
    const myName = state.profile?.name || "Ja";
    const myAvatar = state.profile?.avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
    let allUsersIds = [myUid, ...selectedGroupUsers.map(u => u.uid)];
    let namesMap = { [myUid]: myName };
    let avatarsMap = { [myUid]: myAvatar };
    selectedGroupUsers.forEach(u => { namesMap[u.uid] = u.name; avatarsMap[u.uid] = u.avatar; });
    window.Waggle.showToast("Tworzę stado... ⏳");
    createGroupInDb(groupName, allUsersIds, namesMap, avatarsMap).then((chatId) => {
        window.Waggle.showToast("Stado utworzone! 🎉");
        document.getElementById('group-creator-modal').style.display = 'none';
        nameInput.value = '';
        if(window.Waggle.openChat) window.Waggle.openChat(chatId, groupName);
    });
}

// 🔥 NOWOŚĆ: Bezpieczna, w 100% bezpośrednia funkcja do komunikatów systemowych
async function sendSystemMessage(chatId, text) {
    const msg = {
        sender: 'system',
        senderName: 'Waggle System',
        senderAvatar: 'https://placehold.co/150x150/ff5252/FFF?text=!',
        text: text,
        time: Date.now(),
        imageUrl: null
    };
    try {
        await db.collection("chats").doc(chatId).collection("messages").add(msg);
        await db.collection("chats").doc(chatId).update({
            lastMsg: text,
            lastUpdate: msg.time
        });
    } catch (e) {
        console.error("Błąd wysyłania wiadomości systemowej:", e);
    }
}

export async function openGroupSettings(chatId) {
    const modal = document.getElementById('group-settings-modal');
    const listCont = document.getElementById('groupMembersList');
    const nameEl = document.getElementById('groupSettingsName');
    const leaveBtn = document.getElementById('leaveGroupBtn');
    if (!modal || !listCont || !chatId.startsWith('group_')) return;
    listCont.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 12px;">Ładowanie członków...</p>';
    nameEl.innerText = document.getElementById('chatPartnerName').innerText;
    modal.style.display = 'flex';
    try {
        const snap = await db.collection("chats").doc(chatId).get();
        if (!snap.exists) return;
        const data = snap.data();
        const iAmAdmin = data.users[0] === state.user.uid;
        renderGroupSettingsList(chatId, data, state.user.uid, iAmAdmin, listCont);
        
leaveBtn.onclick = async () => {
            // 👇 Tutaj też podpinamy nasz ładny modal!
            const isConfirmed = await window.Waggle.showCustomConfirm("Czy na pewno chcesz opuścić to Stado?");
            if(isConfirmed) {
                window.Waggle.showToast("Opuszczasz Stado... 🐾");
                try {
                    await db.collection("chats").doc(chatId).update({
                        users: fb.firestore.FieldValue.arrayRemove(state.user.uid)
                    });
                    
                    await sendSystemMessage(chatId, `💨 ${state.profile.name || "Ktoś"} opuścił stado.`);
                    
                    modal.style.display = 'none';
                    if(window.Waggle.closeActiveChat) window.Waggle.closeActiveChat();
                    window.Waggle.showToast("Stado opuszczone.");
                } catch(e) { window.Waggle.showToast("Błąd opuszczania!"); }
            }
        };
    } catch (e) { listCont.innerHTML = '<p style="color:var(--danger); text-align:center;">Błąd ładowania.</p>'; }
}

export async function removeUserFromGroup(chatId, userUid, userName) {
    // 👇 Zastępujemy confirm() naszą nową funkcją asynchroniczną
    const isConfirmed = await window.Waggle.showCustomConfirm(`Czy na pewno wyrzucić psa: ${userName}?`);
    if (!isConfirmed) return;
    
    window.Waggle.showToast(`Wyrzucam ${userName}... ⏳`);
    try {
        await db.collection("chats").doc(chatId).update({ 
            users: fb.firestore.FieldValue.arrayRemove(userUid) 
        });
        
        await sendSystemMessage(chatId, `🚷 Admin usunął użytkownika ${userName} ze stada.`);
        
        window.Waggle.showToast(`Piesek wyrzucony.`);
        openGroupSettings(chatId);
    } catch(e) { window.Waggle.showToast("Błąd wyrzucania!"); }
}

window.Waggle = window.Waggle || {};
window.Waggle.loadUsersForGroup = loadUsersForGroup;
window.Waggle.toggleGroupUser = toggleGroupUser;
window.Waggle.createGroupChat = createGroupChat;
window.Waggle.openGroupSettings = openGroupSettings;
window.Waggle.removeUserFromGroup = removeUserFromGroup;
