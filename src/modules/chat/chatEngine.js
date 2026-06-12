// src/modules/chat/chatEngine.js
import { auth, db, fb } from "../../core/firebase.js"; // Dostosuj ścieżkę w zależności od folderu

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
    if(closeChatBtn) {
        closeChatBtn.onclick = () => {
            document.getElementById('chat-window').style.display = 'none';
        };
    }

    // Obsługa wysyłania wiadomości
    const sendMsgBtn = document.getElementById('sendMsgBtn');
    const chatInput = document.getElementById('chatInput');

    if(sendMsgBtn && chatInput) {
        sendMsgBtn.onclick = sendMessage;
        chatInput.onkeypress = (e) => {
            if(e.key === 'Enter' && !e.shiftKey) {
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

    if (currentChatUnsubscribe) currentChatUnsubscribe();

    currentChatUnsubscribe = db.collection('chats').doc(chatId).collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
            messagesContainer.innerHTML = '';
            if(snapshot.empty) {
                messagesContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted); font-size:12px; margin-top:20px;">Brak wiadomości. Napisz jako pierwszy! 👋</p>';
                return;
            }

            snapshot.forEach(doc => {
                const msg = doc.data();
                const isMe = msg.senderId === auth.currentUser.uid;
                const time = msg.timestamp ? msg.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Teraz';
                
                const align = isMe ? 'flex-end' : 'flex-start';
                const bg = isMe ? 'var(--primary)' : 'var(--bg-color)';
                const color = isMe ? 'white' : 'var(--text-color)';
                const border = isMe ? 'none' : '1px solid var(--border-color)';
                const borderRadius = isMe ? '15px 15px 0 15px' : '15px 15px 15px 0';

                const senderNameHtml = !isMe ? `<div style="font-size: 10px; color: var(--text-muted); margin-bottom: 3px; margin-left: 5px; font-weight:700;">${msg.senderName}</div>` : '';

                messagesContainer.innerHTML += `
                    <div style="display: flex; flex-direction: column; align-items: ${align}; margin-bottom: 12px;">
                        ${senderNameHtml}
                        <div style="background: ${bg}; color: ${color}; padding: 10px 15px; border-radius: ${borderRadius}; max-width: 75%; border: ${border}; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); word-wrap: break-word;">
                            ${msg.text}
                        </div>
                        <div style="font-size: 9px; color: var(--text-muted); margin-top: 4px; margin-right: ${isMe ? '5px' : '0'}; margin-left: ${isMe ? '0' : '5px'};">${time}</div>
                    </div>
                `;
            });
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
}

async function sendMessage() {
    if (!currentChatId) return;
    const chatInput = document.getElementById('chatInput');
    const text = chatInput.value.trim();
    if (!text) return;

    const myUid = auth.currentUser.uid;
    const myName = localStorage.getItem('userName') || auth.currentUser.email.split('@')[0];

    chatInput.value = '';
    chatInput.style.height = 'auto'; 

    try {
        await db.collection('chats').doc(currentChatId).collection('messages').add({
            text: text,
            senderId: myUid,
            senderName: myName,
            timestamp: fb.firestore.FieldValue.serverTimestamp()
        });
    } catch(e) {
        console.error(e);
        notifyUser("❌ Błąd wysyłania wiadomości");
    }
}
