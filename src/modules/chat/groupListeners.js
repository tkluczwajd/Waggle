// src/modules/chat/groupListeners.js
import { appState as state } from '../../core/state.js';
import { db } from '../../core/firebase.js';
import { searchUsersInDb, createGroupInDb } from '../../services/chatService.js';
import { renderGroupUsersList, renderGroupSettingsList } from './chatRenderer.js';

let selectedGroupUsers = []; 

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

    if(checkbox.checked) {
        selectedGroupUsers.push({uid, name, avatar});
    } else {
        selectedGroupUsers = selectedGroupUsers.filter(u => u.uid !== uid);
    }
}

export function createGroupChat() {
    const nameInput = document.getElementById('groupNameInput');
    const groupName = nameInput.value.trim();
    
    if(!groupName) { window.Waggle.showToast("Wpisz najpierw nazwę stada! 🐕"); return; }
    if(selectedGroupUsers.length === 0) { window.Waggle.showToast("Zaznacz przynajmniej jednego znajomego! 🐾"); return; }

    const myUid = state.user.uid;
    const myName = state.profile?.name || "Ja";
    const myAvatar = state.profile?.avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";

    let allUsersIds = [myUid, ...selectedGroupUsers.map(u => u.uid)];
    let namesMap = { [myUid]: myName };
    let avatarsMap = { [myUid]: myAvatar };

    selectedGroupUsers.forEach(u => {
        namesMap[u.uid] = u.name;
        avatarsMap[u.uid] = u.avatar;
    });

    window.Waggle.showToast("Tworzę stado... ⏳");

    createGroupInDb(groupName, allUsersIds, namesMap, avatarsMap).then((chatId) => {
        window.Waggle.showToast("Stado utworzone! 🎉");
        document.getElementById('group-creator-modal').style.display = 'none';
        nameInput.value = '';
        window.Waggle.openChat(chatId, groupName);
    });
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
            if(confirm("Czy na pewno chcesz opuścić to Stado? 🐕")) {
                window.Waggle.showToast("Opuszczasz Stado... 🐾");
                try {
                    const fb = await import('../../core/firebase.js').then(m => m.fb);
                    await db.collection("chats").doc(chatId).update({
                        users: fb.firestore.FieldValue.arrayRemove(state.user.uid)
                    });
                    
                    import('../../services/chatService.js').then(({ saveMessageInDb }) => {
                        saveMessageInDb(chatId, {
                            sender: 'system',
                            text: `💨 ${state.profile.name || "Ktoś"} opuścił stado.`,
                            time: Date.now()
                        }, null, null, state.user);
                    });
                    
                    modal.style.display = 'none';
                    window.Waggle.closeActiveChat();
                    window.Waggle.showToast("Stado opuszczone.");
                } catch(e) {
                    window.Waggle.showToast("Błąd! Spróbuj ponownie.");
                }
            }
        };

    } catch (e) {
        listCont.innerHTML = '<p style="color:var(--danger); text-align:center;">Błąd ładowania danych.</p>';
    }
}

export async function removeUserFromGroup(chatId, userUid, userName) {
    if(!confirm(`Czy na pewno chcesz wyrzucić pieska ${userName} ze Stada? 🛑`)) return;

    window.Waggle.showToast(`Wyrzucam ${userName}... ⏳`);
    try {
        const fb = await import('../../core/firebase.js').then(m => m.fb);
        await db.collection("chats").doc(chatId).update({
            users: fb.firestore.FieldValue.arrayRemove(userUid)
        });
        
        import('../../services/chatService.js').then(({ saveMessageInDb }) => {
            saveMessageInDb(chatId, {
                sender: 'system',
                text: `🚷 Administrator usunął ${userName} ze stada.`,
                time: Date.now()
            }, null, null, state.user);
        });
        
        window.Waggle.showToast(`Piesek ${userName} wyrzucony ze Stada.`);
        openGroupSettings(chatId);
    } catch(e) {
        window.Waggle.showToast("Wystąpił błąd podczas usuwania.");
    }
}

// Rejestracja globalna dla zdarzeń onClick z HTML
window.Waggle = window.Waggle || {};
window.Waggle.loadUsersForGroup = loadUsersForGroup;
window.Waggle.toggleGroupUser = toggleGroupUser;
window.Waggle.createGroupChat = createGroupChat;
window.Waggle.openGroupSettings = openGroupSettings;
window.Waggle.removeUserFromGroup = removeUserFromGroup;
