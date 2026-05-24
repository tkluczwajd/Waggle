import { appState as state } from '../../core/state.js';
import { uploadImageToService as uploadImage } from '../../services/postsService.js';
// Dodano import createGroupInDb dla czatów grupowych
import { subscribeToInbox, searchUsersInDb, subscribeToMessages, saveMessageInDb, markChatAsRead, createGroupInDb } from '../../services/chatService.js';
import { renderInboxList, renderSearchResultsList, renderChatMessages } from './chatRenderer.js';

let currentChatUnsub = null; 
let inboxUnsub = null;
let chatUnreadStates = {};
let isInitialInboxLoad = true;

// 🔥 Globalny "koszyk" na wybrane zdjęcia
let pendingChatImages = []; 
// 🔥 Pamięć zaznaczonych psów do grupy
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
                    // Sprawdzamy, czy to czat grupowy, czy prywatny, by dobrze wyświetlić nazwę
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
    
    // 1. Jeśli klikamy w Stado (ma przedrostek "group_") albo to Twoja starsza, testowa grupa (20 znaków)
    if (targetId.startsWith('group_') || (targetId.length !== 28 && !targetId.includes('_'))) {
        chatId = targetId; 
    } 
    // 2. Jeśli idzie z historii czatów gotowy pokój 1-na-1 (zawiera podkreślnik)
    else if (targetId.includes('_')) {
        chatId = targetId;
    }
    // 3. Jeśli klikamy w Tablicy/Szukaj w konkretnego psa (czyste UID, 28 znaków)
    else {
        chatId = state.user.uid > targetId ? `${state.user.uid}_${targetId}` : `${targetId}_${state.user.uid}`;
    }
    
    state.currentChatId = chatId;
    
    const partnerNameEl = document.getElementById('chatPartnerName');
    if(partnerNameEl) partnerNameEl.innerText = name;
    
    document.getElementById('chat-window').style.display = 'flex';

    markChatAsRead(chatId, state.user.uid);

    if(currentChatUnsub) currentChatUnsub();
    currentChatUnsub = subscribeToMessages(chatId, (messages) => {
        renderChatMessages(messages, state.user.uid);
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
    
    // Dodajemy nowe pliki do koszyka
    Array.from(files).forEach(file => {
        if (pendingChatImages.length >= 5) {
            window.Waggle.showToast("Możesz dodać maksymalnie 5 zdjęć na raz! 📸");
            return;
        }
        pendingChatImages.push(file);
    });

    // Czyścimy input, by móc dodać kolejne
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
    const imagesToSend = [...pendingChatImages]; // Kopiujemy i czyścimy koszyk natychmiast
    
    if (!textToSend && imagesToSend.length === 0) return;
    
    const partnerUid = state.currentChatId.replace(state.user.uid, "").replace("_", "");
    const partnerName = document.getElementById('chatPartnerName').innerText;
    
    const baseMsg = { 
        sender: state.user.uid, 
        time: Date.now() 
    };

    const senderData = {
        uid: state.user.uid,
        name: state.profile?.name || "Ktoś",
        avatar: state.profile?.avatar || ""
    };

    // 1. Wysyłamy tekst (jeśli jakiś wpisano)
    if (textToSend) {
        saveMessageInDb(state.currentChatId, { ...baseMsg, text: textToSend, imageUrl: null }, partnerUid, partnerName, senderData);
    }

    // Czyszczenie interfejsu 
    const inputEl = document.getElementById('chatInput');
    if (inputEl) {
        inputEl.value = '';
        inputEl.style.height = 'auto'; // Reset wielkości pola tekstowego
    }
    
    pendingChatImages = [];
    renderChatImagePreviews();

    // 2. Wysyłamy paczkę zdjęć w tle (jeśli jakieś były w koszyku)
    if (imagesToSend.length > 0) {
        window.Waggle.showToast(`Wysyłam zdjęcia (${imagesToSend.length})... ⏳`);
        for (let file of imagesToSend) {
            try {
                const url = await uploadImage(file);
                // Każde zdjęcie wysyłane jest jako osobna wiadomość z obrazkiem (bez tekstu)
                saveMessageInDb(state.currentChatId, { ...baseMsg, text: "", imageUrl: url }, partnerUid, partnerName, senderData);
            } catch(err) {
                window.Waggle.showToast("Błąd wysyłania jednego ze zdjęć!");
                console.error("Błąd ładowania pliku:", err);
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

// Globalna rejestracja dla HTML
window.Waggle = window.Waggle || {};
window.Waggle.openChat = openChat;
window.Waggle.closeActiveChat = closeActiveChat;
window.Waggle.searchUsers = searchUsers;

// Funkcje Koszyka Zdjęć
window.Waggle.handleChatImageSelect = handleChatImageSelect;
window.Waggle.removeChatImagePreview = removeChatImagePreview;

// Funkcje Kreatora Stada
window.Waggle.loadUsersForGroup = loadUsersForGroup;
window.Waggle.toggleGroupUser = toggleGroupUser;
window.Waggle.createGroupChat = createGroupChat;
