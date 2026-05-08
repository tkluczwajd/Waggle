import { db, fb } from '../core/firebase.js';
import { state, ListenerManager } from '../core/state.js';
import { uploadImage } from './posts.js';

let currentChatUnsub = null; 

export function loadInbox() {
    if (!state.user) return;
    const unsub = db.collection("chats")
        .where("users", "array-contains", state.user.uid)
        .onSnapshot(snap => {
            let chatsList = [];
            snap.forEach(doc => chatsList.push({ id: doc.id, ...doc.data() }));
            chatsList.sort((a, b) => (b.lastUpdate || 0) - (a.lastUpdate || 0));
            let html = "";
            chatsList.forEach(d => {
                const partnerUid = d.users.find(u => u !== state.user.uid);
                const partnerName = d.names ? d.names[partnerUid] : 'Nieznajomy';
                html += `
                <div class="post-card" style="display:flex; align-items:center; gap:15px; margin-bottom:10px; cursor:pointer;" onclick="window.Waggle.openChat('${partnerUid}', '${partnerName}')">
                    <div style="width:50px; height:50px; border-radius:50%; background:var(--panel-bg); display:flex; align-items:center; justify-content:center; font-size:24px;">🐾</div>
                    <div style="flex:1;"><b style="font-size:16px;">${partnerName}</b><br><small style="color:var(--text-muted);">${d.lastMsg || 'Kliknij, aby pisać'}</small></div>
                </div>`;
            });
            const container = document.getElementById('inbox-container');
            if (container) container.innerHTML = html || "<p style='text-align:center; padding:20px; color:var(--text-muted);'>Brak rozmów.</p>";
        });
    ListenerManager.add(unsub);
}

function buildUserCard(uid, u, inStado) {
    const avatar = u.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
    return `
    <div class="post-card" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <div style="display:flex; align-items:center; gap:12px;">
            <img src="${avatar}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;">
            <div><b>${u.name || 'Piesek'}</b><br><small>${u.breed || 'Rasa nieznana'}</small></div>
        </div>
        <button class="btn-main" style="width:auto; padding:6px 10px; font-size:11px;" onclick="window.Waggle.openChat('${uid}', '${u.name || 'Piesek'}')">💬 Napisz</button>
    </div>`;
}

export function searchUsers(query) {
    db.collection("users").doc(state.user.uid).get().then(myDoc => {
        const myStado = myDoc.data().stado || [];
        const q = (query || "").toLowerCase();
        db.collection("users").get().then(snap => {
            let html = "";
            snap.forEach(doc => {
                const u = doc.data(); if(doc.id === state.user.uid) return; 
                if(!q || (u.name && u.name.toLowerCase().includes(q))) html += buildUserCard(doc.id, u, myStado.includes(doc.id));
            });
            const container = document.getElementById('inbox-container');
            if (container) container.innerHTML = html || "<p style='text-align:center; padding:20px;'>Nie znaleziono piesków.</p>";
        });
    });
}

export function toggleStado(friendUid) {
    if(!state.user) return;
    const ref = db.collection("users").doc(state.user.uid);
    ref.get().then(doc => {
        const stado = doc.data().stado || [];
        if(stado.includes(friendUid)) ref.update({ stado: fb.firestore.FieldValue.arrayRemove(friendUid) });
        else ref.update({ stado: fb.firestore.FieldValue.arrayUnion(friendUid) });
        searchUsers(document.getElementById('userSearchInput')?.value || '');
    });
}

export async function openChat(partnerUid, partnerName) {
    const chatId = [state.user.uid, partnerUid].sort().join("_");
    state.currentChatId = chatId;
    document.getElementById('chatPartnerName').innerText = partnerName;
    document.getElementById('chat-window').style.display = 'flex';
    if(currentChatUnsub) currentChatUnsub();
    currentChatUnsub = db.collection("chats").doc(chatId).collection("messages").orderBy("time", "asc").limit(50).onSnapshot(snap => {
        let html = "";
        snap.forEach(mDoc => {
            const m = mDoc.data(); const isMe = m.sender === state.user.uid;
            const imgHtml = m.imageUrl ? `<img src="${m.imageUrl}" style="max-width:100%; border-radius:10px; margin-top:5px; cursor:pointer;" onclick="window.Waggle.openLightbox('${m.imageUrl}')">` : "";
            html += `<div style="align-self: ${isMe ? 'flex-end' : 'flex-start'}; max-width: 80%; margin-bottom: 8px;">
                        <div style="background: ${isMe ? 'var(--primary)' : 'var(--panel-bg)'}; color: ${isMe ? 'white' : 'var(--text-color)'}; padding: 10px 15px; border-radius: 15px;">
                            ${m.text ? `<div>${m.text}</div>` : ""}${imgHtml}
                        </div>
                     </div>`;
        });
        const msgBox = document.getElementById('chatMessages');
        if(msgBox) { msgBox.innerHTML = html; msgBox.scrollTop = msgBox.scrollHeight; }
    });
}

export function sendMessage(text, imageUrl = null) {
    if (!state.currentChatId || (!text.trim() && !imageUrl)) return;
    const msg = { sender: state.user.uid, text: text.trim(), time: Date.now(), imageUrl };
    const partnerUid = state.currentChatId.replace(state.user.uid, "").replace("_", "");
    db.collection("chats").doc(state.currentChatId).collection("messages").add(msg);
    db.collection("chats").doc(state.currentChatId).set({ lastMsg: imageUrl ? "📷 Zdjęcie" : text, lastUpdate: Date.now(), users: state.currentChatId.split("_"), names: { [state.user.uid]: state.profile?.name || "Piesek", [partnerUid]: document.getElementById('chatPartnerName').innerText } }, { merge: true });
}

export function closeActiveChat() {
    document.getElementById('chat-window').style.display = 'none';
    state.currentChatId = null; if(currentChatUnsub) { currentChatUnsub(); currentChatUnsub = null; }
}

export async function sendChatImage(file) {
    if(!file) return; window.Waggle.showToast("Wysyłanie zdjęcia...");
    try { const url = await uploadImage(file); sendMessage("", url); } catch(e) { window.Waggle.showToast("Błąd wysyłania!"); }
}