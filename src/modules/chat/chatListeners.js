import { appState as state } from '../../core/state.js';
import { uploadImageToService as uploadImage } from '../../services/postsService.js';
import { subscribeToInbox, searchUsersInDb, subscribeToMessages, saveMessageInDb } from '../../services/chatService.js';
import { renderInboxList, renderSearchResultsList, renderChatMessages } from './chatRenderer.js';

let currentChatUnsub = null; 

export function loadInbox() {
    if (!state.user) return;
    subscribeToInbox(state.user.uid, (chats) => {
        renderInboxList(chats, state.user.uid);
    });
}

// Zastąp funkcję searchUsers w src/modules/chat/chatListeners.js:

export function searchUsers(query) {
    const usersListCont = document.getElementById('users-list');
    
    // Odpalamy zapytanie do serwisu chatService
    searchUsersInDb('', (users) => {
        if (!usersListCont) return;

        const currentUid = state.user?.uid;
        const cleanQuery = query.toLowerCase().trim();
        
        // Filtrujemy użytkowników lokalnie w aplikacji, co daje nam wyszukiwanie błyskawiczne i niewrażliwe na wielkość liter
        const filteredUsers = users.filter(user => {
            // Nie pokazujemy samych siebie w wyszukiwarce
            if (user.id === currentUid) return false;

            const name = (user.name || "").toLowerCase();
            const city = (user.city || "").toLowerCase();
            const breed = (user.breed || "").toLowerCase();

            // Szukamy dopasowania w imieniu, mieście lub rasie psa!
            return cleanQuery === "" || 
                   name.includes(cleanQuery) || 
                   city.includes(cleanQuery) || 
                   breed.includes(cleanQuery);
        });

        // Przekazujemy przefiltrowaną listę do renderera
        renderSearchResultsList(filteredUsers, currentUid);
        
        // Mały UX fix: Jeśli lista po filtrowaniu jest pusta, wyświetlamy komunikat
        if (filteredUsers.length === 0) {
            usersListCont.innerHTML = `<p style="text-align:center; padding:20px; color:var(--text-muted); font-weight:700;">Nie znaleziono psiaków o tej rasie lub w tym mieście... 🐾</p>`;
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

    saveMessageInDb(state.currentChatId, msg, partnerUid, partnerName, {
        uid: state.user.uid,
        name: state.profile?.name
    });
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
