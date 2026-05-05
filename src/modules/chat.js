import { state, addListener } from '../core/state.js';
import { db } from '../core/firebase.js';

export function loadInbox() {
    if (!state.user) return;
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
                        <div class="post-card" style="cursor:pointer;" onclick="openChat('${m.sender}', '${m.senderName}')">
                            <b>${m.senderName}</b><br>
                            <small style="color:var(--text-muted);">${m.text.substring(0, 30)}...</small>
                        </div>`;
                    seen.add(m.sender);
                }
            });
            document.getElementById('inbox-container').innerHTML = html || "<p style='text-align:center; padding:20px;'>Brak wiadomości.</p>";
        });
    addListener(unsub);
}

window.openChat = function(partnerUid, partnerName) {
    state.currentChatId = partnerUid;
    const chatId = [state.user.uid, partnerUid].sort().join('_');
    const overlay = document.getElementById('chat-window');
    overlay.style.display = 'flex';
    document.getElementById('chatPartnerName').innerText = partnerName;

    const unsub = db.collection("messages")
        .where("chatId", "==", chatId)
        .orderBy("timestamp", "asc")
        .onSnapshot(snap => {
            let html = "";
            snap.forEach(doc => {
                const m = doc.data();
                const isMe = m.sender === state.user.uid;
                const style = isMe ? 'align-self:flex-end; background:var(--primary); color:white;' : 'align-self:flex-start; background:var(--border-color);';
                html += `<div style="${style} padding:12px 18px; border-radius:20px; max-width:75%; font-weight:700;">${m.text}</div>`;
            });
            const box = document.getElementById('chatMessages');
            box.innerHTML = html;
            box.scrollTop = box.scrollHeight;
        });
    addListener(unsub);
};

window.closeActiveChat = () => {
    document.getElementById('chat-window').style.display = 'none';
    state.currentChatId = null;
};

// Funkcja wysyłki
export function sendMessage(text) {
    if (!text || !state.currentChatId) return;
    const chatId = [state.user.uid, state.currentChatId].sort().join('_');
    db.collection("messages").add({
        chatId,
        sender: state.user.uid,
        senderName: state.profile.name,
        receiver: state.currentChatId,
        text,
        timestamp: Date.now()
    });
}
