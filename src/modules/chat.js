import { state, addListener } from '../core/state.js';
import { db } from '../core/firebase.js';

export function loadInbox() {
    if (!state.user) return;

    // Pobieramy tylko te konwersacje, w których biorę udział
    const unsub = db.collection("messages")
        .where("receiver", "==", state.user.uid)
        .orderBy("timestamp", "desc")
        .onSnapshot(snap => {
            let html = "";
            let seen = new Set();

            snap.forEach(doc => {
                const m = doc.data();
                if(!seen.has(m.sender)) {
                    html += `
                        <div class="post-card" onclick="openChat('${m.sender}', '${m.senderName}')">
                            <b>${m.senderName}</b><br>
                            <small>${m.text.substring(0, 30)}...</small>
                        </div>`;
                    seen.add(m.sender);
                }
            });
            const container = document.getElementById('inbox-container');
            if(container) container.innerHTML = html || "<p>Brak wiadomości.</p>";
        });
    addListener(unsub);
}

// Globalnie dostępna funkcja otwierania czatu
window.openChat = function(partnerUid, partnerName) {
    state.currentChatId = partnerUid;
    const chatId = [state.user.uid, partnerUid].sort().join('_');

    document.getElementById('chatPartnerName').innerText = partnerName;
    document.getElementById('chat-window').style.display = 'flex';

    const unsub = db.collection("messages")
        .where("chatId", "==", chatId) // 🔥 Kluczowa optymalizacja!
        .orderBy("timestamp", "asc")
        .onSnapshot(snap => {
            let html = "";
            snap.forEach(doc => {
                const m = doc.data();
                const isMe = m.sender === state.user.uid;
                html += `<div class="msg ${isMe ? 'me' : 'them'}">${m.text}</div>`;
            });
            const msgBox = document.getElementById('chatMessages');
            if(msgBox) {
                msgBox.innerHTML = html;
                msgBox.scrollTop = msgBox.scrollHeight;
            }
        });
    addListener(unsub);
}
