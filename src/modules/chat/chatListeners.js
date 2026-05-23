import { appState as state } from '../../core/state.js';
import { uploadImageToService as uploadImage } from '../../services/postsService.js';
// 🔥 DODANO markChatAsRead DO IMPORTÓW:
import { subscribeToInbox, searchUsersInDb, subscribeToMessages, saveMessageInDb, markChatAsRead } from '../../services/chatService.js';
import { renderInboxList, renderSearchResultsList, renderChatMessages } from './chatRenderer.js';

let currentChatUnsub = null; 

export function loadInbox() {
    if (!state.user) return;
    subscribeToInbox(state.user.uid, (chats) => {
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

export function openChat(uid, name) {
    if (!state.user) return;
    const chatId = state.user.uid > uid ? `${state.user.uid}_${uid}` : `${uid}_${state.user.uid}`;
    state.currentChatId = chatId;
    
    const partnerNameEl = document.getElementById('chatPartnerName');
    if(partnerNameEl) partnerNameEl.innerText = name;
    
    document.getElementById('chat-window').style.display = 'flex';

    // 🔥 KRYTYCZNE ZEROWANIE BADGE'A: Wejście w czat oznacza przeczytanie wiadomości
    markChatAsRead(chatId, state.user.uid);

    if(currentChatUnsub) currentChatUnsub();
    currentChatUnsub = subscribeToMessages(chatId, (messages) => {
        renderChatMessages(messages, state.user.uid);
    });
}

export function sendMessage(text, imageUrl = null) {
    if (!state.currentChatId || (!text.trim() && !imageUrl)) return;
    
    const partnerUid = state.currentChatId.replace(state.user.uid, "").replace("_", "");
    const partnerName = document.getElementById('chatPartnerName').innerText;
    
    const msg = { 
        sender: state.user.uid, 
        text: text.trim(), 
        time: Date.now(), 
        imageUrl 
    };

    // Przekazujemy pełniejsze dane o sobie (z awatarem!), aby partner miał naszą ikonę na liście
    const currentUserData = {
        uid: state.user.uid,
        name: state.profile?.name,
        avatar: state.profile?.avatar || ""
    };

    saveMessageInDb(state.currentChatId, msg, partnerUid, partnerName, currentUserData);
}

export function closeActiveChat() {
    document.getElementById('chat-window').style.display = 'none';
    state.currentChatId = null;
    if(currentChatUnsub) { currentChatUnsub(); currentChatUnsub = null; }
}

export async function sendChatImage(file) {
    if(!file) return;
    window.Waggle.showToast("Wysyłam zdjęcie... ⏳");
    try {
        const url = await uploadImage(file);
        sendMessage("", url);
    } catch(err) {
        window.Waggle.showToast("Błąd wysyłania zdjęcia!");
    }
}

window.Waggle = window.Waggle || {};
window.Waggle.openChat = openChat;
window.Waggle.closeActiveChat = closeActiveChat;
window.Waggle.searchUsers = searchUsers;
window.Waggle.sendChatImage = sendChatImage;
