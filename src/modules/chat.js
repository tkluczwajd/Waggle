import { db, fb } from '../core/firebase.js';
import { state, ListenerManager } from '../core/state.js';

export function loadInbox() {
    if (!state.user) return;
    // Zmiana register -> add
    const unsub = db.collection("chats")
        .where("users", "array-contains", state.user.uid)
        .orderBy("lastUpdate", "desc")
        .onSnapshot(snap => {
            let html = "";
            snap.forEach(doc => {
                const d = doc.data();
                const partnerName = d.names[d.users.find(u => u !== state.user.uid)];
                html += `<div class="post-card" onclick="window.Waggle.openChat('${d.users.find(u => u !== state.user.uid)}', '${partnerName}')">
                            <b>${partnerName}</b><br><small>${d.lastMsg || 'Kliknij, aby pisać'}</small>
                         </div>`;
            });
            const container = document.getElementById('inbox-container');
            if (container) container.innerHTML = html || "<p style='text-align:center; padding:20px;'>Brak wiadomości.</p>";
        });
    ListenerManager.add(unsub);
}

export async function openChat(partnerUid, partnerName) {
    const chatId = [state.user.uid, partnerUid].sort().join("_");
    state.currentChatId = chatId;
    document.getElementById('chatPartnerName').innerText = partnerName;
    document.getElementById('chat-window').style.display = 'flex';
    
    const unsub = db.collection("chats").doc(chatId).collection("messages")
        .orderBy("time", "asc").limit(50).onSnapshot(snap => {
            let html = "";
            snap.forEach(mDoc => {
                const m = mDoc.data();
                const isMe = m.sender === state.user.uid;
                html += `<div style="align-self: ${isMe ? 'flex-end' : 'flex-start'}; background: ${isMe ? 'var(--primary)' : 'var(--border-color)'}; color: ${isMe ? 'white' : 'var(--text-color)'}; padding: 10px 15px; border-radius: 15px; max-width: 80%; margin-bottom: 5px; font-weight: 600;">${m.text}</div>`;
            });
            const msgBox = document.getElementById('chatMessages');
            msgBox.innerHTML = html;
            msgBox.scrollTop = msgBox.scrollHeight;
        });
    ListenerManager.add(unsub);
}

export function sendMessage(text) {
    if (!state.currentChatId) return;
    const msg = { sender: state.user.uid, text, time: Date.now() };
    db.collection("chats").doc(state.currentChatId).collection("messages").add(msg);
    db.collection("chats").doc(state.currentChatId).set({
        lastMsg: text,
        lastUpdate: Date.now(),
        users: state.currentChatId.split("_"),
        names: { [state.user.uid]: state.profile.name, [state.currentChatId.replace(state.user.uid, "").replace("_", "")]: document.getElementById('chatPartnerName').innerText }
    }, { merge: true });
}

export function closeActiveChat() {
    document.getElementById('chat-window').style.display = 'none';
    state.currentChatId = null;
}
