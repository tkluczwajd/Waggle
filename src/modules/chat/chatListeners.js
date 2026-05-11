import { appState as state } from '../../core/state.js';
import { registerListener } from '../../core/listeners.js';
import { uploadImage } from '../posts/postsListeners.js'; 
import { subscribeToInbox, searchUsersInDb, subscribeToMessages, saveMessageInDb } from './chatService.js';
import { renderInboxList, renderSearchResultsList, renderChatMessages } from './chatRenderer.js';

window.Waggle = window.Waggle || {};

let currentChatUnsub = null;

export function loadInbox() {
    if (!state.user) return;
    const unsub = subscribeToInbox(state.user.uid, (chats) => {
        renderInboxList(chats, state.user.uid);
    });
    registerListener(unsub);
}

export function searchUsers(query) {
    searchUsersInDb(query, (users) => {
        renderSearchResultsList(users, state.user?.uid);
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
