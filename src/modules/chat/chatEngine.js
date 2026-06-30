// src/modules/chat/chatEngine.js
import { auth } from "../../core/firebase.js"; // Usunęliśmy 'db' i 'fb' - widok nie potrzebuje już Firestore'a!
import { ChatRepository } from "../../data/chatRepository.js"; // Importujemy nasze repozytorium

window.Waggle = window.Waggle || {};

let currentChatUnsubscribe = null;
let currentChatId = null;

function notifyUser(msg) {
    if (window.Waggle && typeof window.Waggle.showToast === 'function') {
        window.Waggle.showToast(msg);
    } else {
        console.log(msg);
    }
}

export function initChatEngine() {
    window.Waggle.openChatWithUser = (partnerUid, partnerName) => {
        const myUid = auth.currentUser.uid;
        const chatId = [myUid, partnerUid].sort().join('_');
        openChatWindow(chatId, partnerName);
    };

    window.Waggle.openGroupChat = (ownerUid, groupName) => {
        const chatId = `family_${ownerUid}`;
        openChatWindow(chatId, groupName);
    };

    // Obsługa zamykania okna czatu
    const closeChatBtn = document.getElementById('closeChatBtn');
    if (closeChatBtn) {
        closeChatBtn.onclick = () => {
            document.getElementById('chat-window').style.display = 'none';
            if (currentChatUnsubscribe) {
                currentChatUnsubscribe(); // Zatrzymujemy nasłuch przy zamykaniu okna!
                currentChatUnsubscribe = null;
            }
        };
    }

    // Obsługa wysyłania wiadomości
    const sendMsgBtn = document.getElementById('sendMsgBtn');
    const chatInput = document.getElementById('chatInput');

    if (sendMsgBtn && chatInput) {
        sendMsgBtn.onclick = sendMessage;
        chatInput.onkeypress = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        };
    }
}

function openChatWindow(chatId, title) {
    currentChatId = chatId;
    document.getElementById('chatPartnerName').innerText = title;
    document.getElementById('chat-window').style.display = 'flex';
    
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted); font-size:12px; margin-top:20px;">Ładowanie wiadomości... ⏳</p>';

    // Przerywamy poprzedni nasłuch, jeśli przełączyliśmy się na inny czat
    if (currentChatUnsubscribe) currentChatUnsubscribe();

    // 🚀 Używamy Repozytorium zamiast bezpośredniego zapytania do bazy!
    currentChatUnsubscribe = ChatRepository.subscribeToMessages(chatId, (messages) => {
        messagesContainer.innerHTML = '';
        if (messages.length === 0) {
            messagesContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted); font-size:12px; margin-top:20px;">Brak wiadomości. Napisz jako pierwszy! 👋</p>';
            return;
        }

        messages.forEach(msg => {
            const isMe = msg.senderId === auth.currentUser.uid;
            
            // Formatowanie czasu (bezpieczne)
            let timeString = 'Teraz';
            if (msg.timestamp && typeof msg.timestamp.toDate === 'function') {
                timeString = msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            
            const align = isMe ? 'flex-end' : 'flex-start';
            const bg = isMe ? 'var(--primary)' : 'var(--bg-color)';
            const color = isMe ? 'white' : 'var(--text-color)';
            const border = isMe ? 'none' : '1px solid var(--border-color)';
            const borderRadius = isMe ? '15px 15px 0 15px' : '15px 15px 15px 0';

            const senderNameHtml = !isMe ? `<div style="font-size: 10px; color: var(--text-muted); margin-bottom: 3px; margin-left: 5px; font-weight:700;">${msg.senderName || 'Opiekun'}</div>` : '';

            // Wyświetlanie opcjonalnego zdjęcia w wiadomości (zabezpieczone pod przyszłe funkcje)
            const imageHtml = msg.imageUrl ? `<img src="${msg.imageUrl}" style="max-width: 100%; border-radius: 10px; margin-bottom: 5px; cursor: pointer;" onclick="window.Waggle.openLightbox('${msg.imageUrl}')">` : '';

            messagesContainer.innerHTML += `
                <div style="display: flex; flex-direction: column; align-items: ${align}; margin-bottom: 12px;">
                    ${senderNameHtml}
                    <div style="background: ${bg}; color: ${color}; padding: 10px 15px; border-radius: ${borderRadius}; max-width: 75%; border: ${border}; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); word-wrap: break-word;">
                        ${imageHtml}
                        ${msg.text ? `<div>${msg.text}</div>` : ''}
                    </div>
                    <div style="font-size: 9px; color: var(--text-muted); margin-top: 4px; margin-right: ${isMe ? '5px' : '0'}; margin-left: ${isMe ? '0' : '5px'};">${timeString}</div>
                </div>
            `;
        });
        // Przewijamy do najnowszej wiadomości na dole
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

async function sendMessage() {
    if (!currentChatId) return;
    const chatInput = document.getElementById('chatInput');
    const text = chatInput.value.trim();
    if (!text) return;

    const myUid = auth.currentUser.uid;
    
    // Zatrzymujemy tekst do Optimistic UI
    chatInput.value = '';
    chatInput.style.height = 'auto'; 

    try {
        // 🚀 Używamy Repozytorium do wysyłania!
        await ChatRepository.sendMessage(currentChatId, myUid, text);
    } catch(e) {
        console.error(e);
        notifyUser("❌ Błąd wysyłania wiadomości. Sprawdź połączenie.");
    }
}
