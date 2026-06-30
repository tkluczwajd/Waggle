// src/modules/chat/chatListeners.js
import { appState as state } from '../../core/state.js';
import { uploadImageToService as uploadImage } from '../../services/postsService.js';
// Zostawiamy stare importy tylko dla funkcji, których jeszcze nie przenieśliśmy
import { subscribeToInbox, searchUsersInDb, markChatAsRead } from '../../services/chatService.js';
import { ChatRepository } from '../../data/chatRepository.js'; // 🔥 Nasze nowe repozytorium!
import { renderInboxList } from './inboxRenderer.js';
import { renderChatMessages, renderChatImagePreviewsUI } from './messageRenderer.js';
import { renderSearchResultsList } from './groupRenderer.js';

let currentChatUnsub = null; 
let inboxUnsub = null;
let chatUnreadStates = {};
let isInitialInboxLoad = true;
let pendingChatImages = []; 

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
    } catch (e) { console.warn("Audio zablokowane:", e); }
}

export function loadInbox() {
    if (!state.user || inboxUnsub) return; 
    
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
        renderSearchResultsList(filteredUsers, currentUid);
    });
}

export function openChat(targetId, name) {
    if (!state.user) return;
    
    let chatId;
    let isGroupChat = false; 
    
    if (targetId.startsWith('group_') || (targetId.length !== 28 && !targetId.includes('_'))) {
        chatId = targetId; isGroupChat = true; 
    } else if (targetId.includes('_')) {
        chatId = targetId;
    } else {
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
        } else { settingsBtn.style.display = 'none'; }
    }
    
    document.getElementById('chat-window').style.display = 'flex';
    markChatAsRead(chatId, state.user.uid);

    if(currentChatUnsub) currentChatUnsub();
    
    // 🔥 ZMIANA: Używamy Repozytorium do nasłuchu
    currentChatUnsub = ChatRepository.subscribeToMessages(chatId, (messages) => {
        renderChatMessages(messages, state.user.uid, isGroupChat);
    });
}

export function closeActiveChat() {
    document.getElementById('chat-window').style.display = 'none';
    state.currentChatId = null;
    if(currentChatUnsub) { currentChatUnsub(); currentChatUnsub = null; }
}

export function handleChatImageSelect(files) {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
        if (pendingChatImages.length >= 5) return window.Waggle.showToast("Maksymalnie 5 zdjęć! 📸");
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

// 🔥 ZMIANA: Całkowicie nowa, zoptymalizowana funkcja wysyłania (Tekst + Zdjęcia) przez Repozytorium
export async function sendMessage(text) {
    if (!state.currentChatId) return;
    
    const textToSend = text ? text.trim() : "";
    const imagesToSend = [...pendingChatImages]; 
    if (!textToSend && imagesToSend.length === 0) return;
    
    const inputEl = document.getElementById('chatInput');
    if (inputEl) { inputEl.value = ''; inputEl.style.height = 'auto'; }
    
    pendingChatImages = [];
    const previewBox = document.getElementById('chat-preview-box');
    if (previewBox) renderChatImagePreviewsUI(pendingChatImages, previewBox);

    try {
        // 1. Jeśli jest tekst, wysyłamy jako zwykłą wiadomość
        if (textToSend) {
            await ChatRepository.sendMessage(state.currentChatId, state.user.uid, textToSend, null);
        }

        // 2. Jeśli są zdjęcia, wysyłamy je pojedynczo jako kolejne wiadomości
        if (imagesToSend.length > 0) {
            window.Waggle.showToast(`Wysyłam zdjęcia (${imagesToSend.length})... ⏳`);
            for (let file of imagesToSend) {
                const url = await uploadImage(file);
                await ChatRepository.sendMessage(state.currentChatId, state.user.uid, "", url);
            }
        }
    } catch (err) {
        console.error("Błąd wysyłania w czacie:", err);
        window.Waggle.showToast("Błąd wysyłania wiadomości!");
    }
}

window.Waggle = window.Waggle || {};
window.Waggle.openChat = openChat;
window.Waggle.closeActiveChat = closeActiveChat;
window.Waggle.searchUsers = searchUsers;
window.Waggle.handleChatImageSelect = handleChatImageSelect;
window.Waggle.removeChatImagePreview = removeChatImagePreview;
