import { state, addListener } from '../core/state.js';
import { db } from '../core/firebase.js';

export function loadInbox() {
    if (!state.user) return;
    const unsub = db.collection("messages").where("receiver", "==", state.user.uid).orderBy("timestamp", "desc").onSnapshot(snap => {
        let html = "";
        let seen = new Set();
        snap.forEach(doc => {
            const m = doc.data();
            if(!seen.has(m.sender)) {
                html += `<div class="post-card" style="cursor:pointer;" onclick="window.openChat('${m.sender}', '${m.senderName}')">
                    <b>${m.senderName}</b><br><small>${m.text.substring(0, 30)}...</small>
                </div>`;
                seen.add(m.sender);
            }
        });
        document.getElementById('inbox-container').innerHTML = html || "<p style='padding:20px;'>Brak rozmów.</p>";
    });
    addListener(unsub);
}

window.openChat = (partnerUid, partnerName) => {
    state.currentChatId = partnerUid;
    const chatId = [state.user.uid, partnerUid].sort().join('_');
    document.getElementById('chatPartnerName').innerText = partnerName;
    document.getElementById('chat-window').style.display = 'flex';

    const unsub = db.collection("messages").where("chatId", "==", chatId).orderBy("timestamp", "asc").onSnapshot(snap => {
        let html = "";
        snap.forEach(doc => {
            const m = doc.data();
            const isMe = m.sender === state.user.uid;
            const style = isMe ? 'align-self:flex-end; background:var(--primary); color:white;' : 'align-self:flex-start; background:var(--border-color);';
            html += `<div style="${style} padding:10px 15px; border-radius:15px; max-width:75%; margin-bottom:5px; font-weight:700;">${m.text}</div>`;
        });
        const box = document.getElementById('chatMessages');
        box.innerHTML = html;
        box.scrollTop = box.scrollHeight;
    });
    addListener(unsub);
};

export function sendMessage(text) {
    if (!text || !state.currentChatId) return;
    const chatId = [state.user.uid, state.currentChatId].sort().join('_');
    db.collection("messages").add({
        chatId, sender: state.user.uid, senderName: state.profile.name,
        receiver: state.currentChatId, text, timestamp: Date.now()
    });
}
