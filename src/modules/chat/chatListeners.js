import { appState as state } from '../../core/state.js';
import { uploadImageToService as uploadImage } from '../../services/postsService.js';
import { subscribeToInbox, searchUsersInDb, subscribeToMessages, saveMessageInDb, markChatAsRead, createGroupInDb } from '../../services/chatService.js';
import { renderInboxList, renderSearchResultsList, renderChatMessages } from './chatRenderer.js';
import { db } from '../../core/firebase.js'; // Dodany import dla ustawień grupy

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

        let html = "";
        filteredUsers.forEach(user => {
            const avatarSrc = user.avatar && user.avatar.trim() !== "" 
                ? user.avatar 
                : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";

            html += `
                <div class="post-card" style="display:flex; align-items:center; justify-content:space-between; padding:12px 15px; margin: 0 0 10px 0; background:var(--panel-bg); border-radius:16px; border:1px solid var(--border-color); text-align:left;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <img src="${avatarSrc}" style="width:45px; height:45px; border-radius:50%; object-fit:cover; border:2px solid var(--secondary);">
                        <div>
                            <b style="font-size:15px; color:var(--text-color);">${user.name || "Piesek"}</b><br>
                            <span style="font-size:12px; color:var(--text-muted); font-weight:700;">
                                📍 ${user.city || "Nieznane"} ${user.breed ? '• 🐕 ' + user.breed : ''}
                            </span>
                        </div>
                    </div>
                    <button class="btn-outline" style="width:auto; padding:8px 14px; font-size:12px; border-color:var(--secondary); color:var(--secondary); margin:0;" onclick="window.Waggle.openChat('${user.id}', '${user.name || "Piesek"}')">💬 Czat</button>
                </div>`;
        });

        if (filteredUsers.length === 0) {
            usersListCont.innerHTML = `<p style="text-align:center; padding:20px; color:var(--text-muted); font-weight:700;">Nie znaleziono psiaków o tej rasie lub w tym mieście... 🐾</p>`;
        } else {
            usersListCont.innerHTML = html;
        }
    });
}

export function openChat(targetId, name) {
    if (!state.user) return;
    
    let chatId;
    let isGroupChat = false; // 🔥 NOWOŚĆ: Zmienna zapamiętująca, czy to stado
    
    // Rozpoznajemy stado (nowe z "group_" oraz stare bez "_")
    if (targetId.startsWith('group_') || (targetId.length !== 28 && !targetId.includes('_'))) {
        chatId = targetId; 
        isGroupChat = true; // Zaznaczamy flagę stada!
    } 
    // Rozpoznajemy czat prywatny
    else if (targetId.includes('_')) {
        chatId = targetId;
    }
    // Nowy czat prywatny
    else {
        chatId = state.user.uid > targetId ? `${state.user.uid}_${targetId}` : `${targetId}_${state.user.uid}`;
    }
    
    state.currentChatId = chatId;
    
    const partnerNameEl = document.getElementById('chatPartnerName');
    if(partnerNameEl) partnerNameEl.innerText = name;
    
    // 🔥 Ujawniamy trybik ustawień w oparciu o uniwersalną flagę
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
        // Podajemy flagę do renderera, by rysował imiona
        renderChatMessages(messages, state.user.uid, isGroupChat);
    });
}

export function closeActiveChat() {
    document.getElementById('chat-window').style.display = 'none';
    state.currentChatId = null;
    if(currentChatUnsub) { currentChatUnsub(); currentChatUnsub = null; }
}

// ========================================================
// 📸 SYSTEM OBSŁUGI ZDJĘĆ Z "KOSZYKIEM"
// ========================================================

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
    
    renderChatImagePreviews();
}

export function removeChatImagePreview(index) {
    pendingChatImages.splice(index, 1);
    renderChatImagePreviews();
}

function renderChatImagePreviews() {
    const previewBox = document.getElementById('chat-preview-box');
    if (!previewBox) return;
    
    if (pendingChatImages.length === 0) {
        previewBox.style.display = 'none';
        previewBox.innerHTML = '';
        return;
    }

    previewBox.style.display = 'flex';
    previewBox.style.gap = '12px';
    previewBox.style.flexWrap = 'wrap';
    previewBox.style.paddingTop = '10px';
    
    let html = '';
    pendingChatImages.forEach((file, index) => {
        const url = URL.createObjectURL(file);
        html += `
        <div style="position: relative; display: inline-block; margin-top: 5px;">
            <img src="${url}" style="width: 65px; height: 65px; object-fit: cover; border-radius: 12px; border: 2px solid var(--primary); box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <button onclick="window.Waggle.removeChatImagePreview(${index})" style="position: absolute; top: -8px; right: -8px; background: var(--danger); color: white; border: none; border-radius: 50%; width: 22px; height: 22px; font-size: 12px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; padding: 0;">✕</button>
        </div>`;
    });
    
    previewBox.innerHTML = html;
}

export async function sendMessage(text) {
    if (!state.currentChatId) return;
    
    const textToSend = text ? text.trim() : "";
    const imagesToSend = [...pendingChatImages]; 
    
    if (!textToSend && imagesToSend.length === 0) return;
    
    const partnerName = document.getElementById('chatPartnerName').innerText;
    
    // 🔥 WSTRZYKUJEMY DANE NADAWCY BEZPOŚREDNIO W WIADOMOŚĆ (DLA GRUP)
    const baseMsg = { 
        sender: state.user.uid, 
        senderName: state.profile?.name || "Piesek",
        senderAvatar: state.profile?.avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150",
        time: Date.now() 
    };

    const senderData = {
        uid: state.user.uid,
        name: state.profile?.name || "Piesek",
        avatar: state.profile?.avatar || ""
    };

    if (textToSend) {
        saveMessageInDb(state.currentChatId, { ...baseMsg, text: textToSend, imageUrl: null }, null, partnerName, senderData);
    }

    const inputEl = document.getElementById('chatInput');
    if (inputEl) {
        inputEl.value = '';
        inputEl.style.height = 'auto'; 
    }
    
    pendingChatImages = [];
    renderChatImagePreviews();

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

// ========================================================
// 🐾 TWORZENIE STADA (CZATY GRUPOWE)
// ========================================================

export function loadUsersForGroup() {
    const listCont = document.getElementById('groupUsersList');
    if (!listCont) return;
    
    listCont.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 12px; margin: 10px 0;">Szukam piesków w okolicy...</p>';
    selectedGroupUsers = []; 

    searchUsersInDb('', (users) => {
        const currentUid = state.user?.uid;
        const filteredUsers = users.filter(u => u.id !== currentUid);

        if(filteredUsers.length === 0) {
            listCont.innerHTML = '<p style="text-align:center; color: var(--text-muted); font-weight: bold;">Brak innych piesków w bazie.</p>';
            return;
        }

        let html = '';
        filteredUsers.forEach(user => {
            const avatarSrc = user.avatar && user.avatar.trim() !== "" 
                ? user.avatar 
                : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";

            html += `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 15px; background:var(--bg-color); border-radius:12px; border:1px solid var(--border-color);">
                <div style="display:flex; align-items:center; gap:12px;">
                    <img src="${avatarSrc}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border: 2px solid var(--secondary);">
                    <div>
                        <b style="font-size:14px; color: var(--text-color);">${user.name || 'Piesek'}</b><br>
                        <span style="font-size: 11px; color: var(--text-muted);">${user.city || 'Nieznane'}</span>
                    </div>
                </div>
                <input type="checkbox" value="${user.id}" data-name="${user.name || 'Piesek'}" data-avatar="${avatarSrc}" onchange="window.Waggle.toggleGroupUser(this)" style="width:22px; height:22px; accent-color:var(--primary); cursor: pointer;">
            </div>`;
        });
        listCont.innerHTML = html;
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
    
    if(!groupName) {
        window.Waggle.showToast("Wpisz najpierw nazwę stada! 🐕");
        return;
    }
    if(selectedGroupUsers.length === 0) {
        window.Waggle.showToast("Zaznacz przynajmniej jednego znajomego! 🐾");
        return;
    }

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

// ========================================================
// ⚙️ ZARZĄDZANIE STADEM (MODAL)
// ========================================================

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
        let html = '';
        
        // 🔥 LOGIKA ADMINA: Twórca grupy jest zawsze pierwszy na liście w bazie
        const adminUid = data.users[0];
        const iAmAdmin = adminUid === state.user.uid;
        
        (data.users || []).forEach(uid => {
            const isMe = uid === state.user.uid;
            const name = data.names ? data.names[uid] : "Piesek";
            const avatar = data.avatars ? data.avatars[uid] : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
            
            let actionBtns = '';
            
            if (!isMe) {
                // Przycisk "Napisz na priv" (dostępny dla każdego)
                actionBtns += `<button onclick="window.Waggle.openChat('${uid}', '${name}'); document.getElementById('group-settings-modal').style.display='none';" style="background:none; border:none; color:var(--secondary); font-size:16px; cursor:pointer;" title="Napisz prywatnie">💬</button>`;
                
                // 🔥 Przycisk "Wyrzuć" (Wyświetlany TYLKO dla admina)
                if (iAmAdmin) {
                    actionBtns += `<button onclick="window.Waggle.removeUserFromGroup('${chatId}', '${uid}', '${name}')" style="background:none; border:none; color:var(--danger); font-size:16px; cursor:pointer; margin-left:12px;" title="Wyrzuć ze Stada">🗑️</button>`;
                }
            }
            
            // Oznaczamy admina wizualnie
            let badge = isMe ? '(Ty)' : '';
            if (uid === adminUid) badge += ' <span style="font-size:12px;" title="Administrator grupy">👑</span>';

            html += `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:var(--panel-bg); border-radius:12px; border:1px solid var(--border-color);">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${avatar}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border: 2px solid ${isMe ? 'var(--primary)' : 'var(--border-color)'};">
                    <div>
                        <b style="font-size:14px; color: var(--text-color);">${name} <span style="font-size:10px; color:var(--primary); font-weight:800;">${badge}</span></b>
                    </div>
                </div>
                <div>${actionBtns}</div>
            </div>`;
        });
        
        listCont.innerHTML = html;
        
        leaveBtn.onclick = async () => {
            if(confirm("Czy na pewno chcesz opuścić to Stado? 🐕")) {
                window.Waggle.showToast("Opuszczasz Stado... 🐾");
                try {
                    const fb = await import('../../core/firebase.js').then(m => m.fb);
                    await db.collection("chats").doc(chatId).update({
                        users: fb.firestore.FieldValue.arrayRemove(state.user.uid)
                    });
                    
                    // Importujemy bezpiecznie funkcję do wysyłania wiadomości systemowej
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

// 🔥 NOWA FUNKCJA: Wyrzucanie ze Stada (dla Admina)
export async function removeUserFromGroup(chatId, userUid, userName) {
    if(!confirm(`Czy na pewno chcesz wyrzucić pieska ${userName} ze Stada? 🛑`)) return;

    window.Waggle.showToast(`Wyrzucam ${userName}... ⏳`);
    try {
        // Usuwamy gościa z tablicy w Firebase
        const fb = await import('../../core/firebase.js').then(m => m.fb);
        await db.collection("chats").doc(chatId).update({
            users: fb.firestore.FieldValue.arrayRemove(userUid)
        });
        
        // Wysyłamy czerwoną wiadomość systemową
        import('../../services/chatService.js').then(({ saveMessageInDb }) => {
            saveMessageInDb(chatId, {
                sender: 'system',
                text: `🚷 Administrator usunął ${userName} ze stada.`,
                time: Date.now()
            }, null, null, state.user);
        });
        
        window.Waggle.showToast(`Piesek ${userName} wyrzucony ze Stada.`);
        // Odświeżamy listę w otwartym modalu!
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
// 🔥 EKSPORT NOWEJ FUNKCJI!
window.Waggle.removeUserFromGroup = removeUserFromGroup;
