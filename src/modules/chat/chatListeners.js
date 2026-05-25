// src/modules/chat/chatListeners.js
import { appState as state } from '../../core/state.js';
import { uploadImageToService as uploadImage } from '../../services/postsService.js';
import { subscribeToInbox, searchUsersInDb, subscribeToMessages, saveMessageInDb, markChatAsRead, createGroupInDb } from '../../services/chatService.js';
import { db } from '../../core/firebase.js'; 
import { 
    renderInboxList, 
    renderSearchResultsList, 
    renderChatMessages,
    renderChatImagePreviewsUI,
    renderGroupUsersList,
    renderGroupSettingsList
} from './chatRenderer.js';

let currentChatUnsub = null; 
let inboxUnsub = null;
let chatUnreadStates = {};
let isInitialInboxLoad = true;

let pendingChatImages = []; 
let selectedGroupUsers = []; 

function playNotificationSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
        console.warn("Audio zablokowane:", e);
    }
}

export function loadInbox() {
    if (!state.user || inboxUnsub) return; 
    
    console.log("🌐 Waggle: Uruchamiam globalny nasłuch wiadomości w tle...");
    
    inboxUnsub = subscribeToInbox(state.user.uid, (chats) => {
        let currentTotalUnread = 0;

        chats.forEach(chat => {
            const unreads = chat[`unreadCount.${state.user.uid}`] || 0;
            const prevUnreads = chatUnreadStates[chat.id] || 0;

            if (!isInitialInboxLoad && unreads > prevUnreads) {
                playNotificationSound();

                if (state.currentChatId !== chat.id) {
                    const partnerName = chat.isGroup ? chat.groupName : (chat.names ? chat.names[chat.users.find(u => u !== state.user.uid)] : 'Ktoś');
                    window.Waggle.showToast(`💬 Nowa wiadomość od: ${partnerName}`);
                }
            }

            chatUnreadStates[chat.id] = unreads;
            currentTotalUnread += unreads;
        });

        const badge = document.getElementById('nav-chat-badge');
        if (badge) {
            badge.innerText = currentTotalUnread;
            badge.style.display = currentTotalUnread > 0 ? 'flex' : 'none';
        }

        isInitialInboxLoad = false;
        renderInboxList(chats, state.user.uid);
    });
}

export function searchUsers(query) {
    const usersListCont = document.getElementById('users-list');
    if (!usersListCont) return;

    searchUsersInDb('', (users) => {
        const currentUid = state.user?.uid;
        const cleanQuery = query.toLowerCase().trim();
        
        const filteredUsers = users.filter(user => {
            if (user.id === currentUid) return false;
            const name = (user.name || "").toLowerCase();
            const city = (user.city || "").toLowerCase();
            const breed = (user.breed || "").toLowerCase();
            return cleanQuery === "" || name.includes(cleanQuery) || city.includes(cleanQuery) || breed.includes(cleanQuery);
        });

        renderSearchResultsList(filteredUsers, usersListCont);
    });
}

export function openChat(targetId, name) {
    if (!state.user) return;
    
    let chatId;
    let isGroupChat = false; 
    
    if (targetId.startsWith('group_') || (targetId.length !== 28 && !targetId.includes('_'))) {
        chatId = targetId; 
        isGroupChat = true; 
    } 
    else if (targetId.includes('_')) {
        chatId = targetId;
    }
    else {
        chatId = state.user.uid > targetId ? `${state.user.uid}_${targetId}` : `${targetId}_${state.user.uid}`;
    }
    
    state.currentChatId = chatId;
    
    const partnerNameEl = document.getElementById('chatPartnerName');
    if(partnerNameEl) partnerNameEl.innerText = name;
    
    const settingsBtn = document.getElementById('groupSettingsBtn');
    if (settingsBtn) {
        if (isGroupChat) {
            settingsBtn.style.display = 'block';
            settingsBtn.onclick = () => window.Waggle.openGroupSettings(chatId);
        } else {
            settingsBtn.style.display = 'none';
        }
    }
    
    document.getElementById('chat-window').style.display = 'flex';
    markChatAsRead(chatId, state.user.uid);

    if(currentChatUnsub) currentChatUnsub();
    currentChatUnsub = subscribeToMessages(chatId, (messages) => {
        renderChatMessages(messages, state.user.uid, isGroupChat);
    });
}

export function closeActiveChat() {
    document.getElementById('chat-window').style.display = 'none';
    state.currentChatId = null;
    if(currentChatUnsub) { currentChatUnsub(); currentChatUnsub = null; }
}

// --- SYSTEM ZDJĘĆ ---

export function handleChatImageSelect(files) {
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
        if (pendingChatImages.length >= 5) {
            window.Waggle.showToast("Możesz dodać maksymalnie 5 zdjęć na raz! 📸");
            return;
        }
        pendingChatImages.push(file);
    });

    const inputEl = document.getElementById('chatImageInput');
    if(inputEl) inputEl.value = '';
    
    const previewBox = document.getElementById('chat-preview-box');
    if (previewBox) renderChatImagePreviewsUI(pendingChatImages, previewBox);
}

export function removeChatImagePreview(index) {
    pendingChatImages.splice(index, 1);
    const previewBox = document.getElementById('chat-preview-box');
    if (previewBox) renderChatImagePreviewsUI(pendingChatImages, previewBox);
}

export async function sendMessage(text) {
    if (!state.currentChatId) return;
    
    const textToSend = text ? text.trim() : "";
    const imagesToSend = [...pendingChatImages]; 
    
    if (!textToSend && imagesToSend.length === 0) return;
    
    const partnerName = document.getElementById('chatPartnerName').innerText;
    
    const baseMsg = { 
        sender: state.user.uid, 
        senderName: state.profile?.name || "Piesek",
        senderAvatar: state.profile?.avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150",
        time: Date.now() 
    };

    const senderData = { uid: state.user.uid, name: state.profile?.name || "Piesek", avatar: state.profile?.avatar || "" };

    if (textToSend) {
        saveMessageInDb(state.currentChatId, { ...baseMsg, text: textToSend, imageUrl: null }, null, partnerName, senderData);
    }

    const inputEl = document.getElementById('chatInput');
    if (inputEl) { inputEl.value = ''; inputEl.style.height = 'auto'; }
    
    pendingChatImages = [];
    const previewBox = document.getElementById('chat-preview-box');
    if (previewBox) renderChatImagePreviewsUI(pendingChatImages, previewBox);

    if (imagesToSend.length > 0) {
        window.Waggle.showToast(`Wysyłam zdjęcia (${imagesToSend.length})... ⏳`);
        for (let file of imagesToSend) {
            try {
                const url = await uploadImage(file);
                saveMessageInDb(state.currentChatId, { ...baseMsg, text: "", imageUrl: url }, null, partnerName, senderData);
            } catch(err) {
                window.Waggle.showToast("Błąd wysyłania jednego ze zdjęć!");
            }
        }
    }
}

// --- TWORZENIE STADA ---

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

// --- ZARZĄDZANIE STADEM ---

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

// Globalna rejestracja dla HTML
window.Waggle = window.Waggle || {};
window.Waggle.openChat = openChat;
window.Waggle.closeActiveChat = closeActiveChat;
window.Waggle.searchUsers = searchUsers;
window.Waggle.handleChatImageSelect = handleChatImageSelect;
window.Waggle.removeChatImagePreview = removeChatImagePreview;
window.Waggle.loadUsersForGroup = loadUsersForGroup;
window.Waggle.toggleGroupUser = toggleGroupUser;
window.Waggle.createGroupChat = createGroupChat;
window.Waggle.openGroupSettings = openGroupSettings;
window.Waggle.removeUserFromGroup = removeUserFromGroup;
