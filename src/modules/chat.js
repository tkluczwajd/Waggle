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
                    <div style="width:50px; height:50px; border-radius:50%; background:var(--panel-bg); display:flex; align-items:center; justify-content:center; font-size:24px; box-shadow:var(--soft-shadow);">🐾</div>
                    <div style="flex:1;">
                        <b style="font-size:16px; color:var(--text-color);">${partnerName}</b><br>
                        <span style="font-size:14px; color:var(--text-muted); font-weight:600;">${d.lastMsg || 'Brak wiadomości'}</span>
                    </div>
                </div>`;
            });
            const c = document.getElementById('inbox-container');
            if(c) c.innerHTML = html || "<p style='text-align:center; padding:20px; color:var(--text-muted);'>Brak otwartych rozmów. Znajdź kogoś z okolicy!</p>";
        });
    ListenerManager.add(unsub);
}

// NOWOŚĆ: Szukajka potrafi szukać po Imieniu, Mieście i Rasie!
export function searchUsers(query) {
    const q = query.toLowerCase().trim();
    db.collection("users").get().then(snap => {
        let html = "";
        snap.forEach(doc => {
            const u = doc.data();
            if (doc.id === state.user?.uid) return; // Nie szukaj siebie

            const nameMatch = u.name && u.name.toLowerCase().includes(q);
            const cityMatch = u.city && u.city.toLowerCase().includes(q);
            const breedMatch = u.breed && u.breed.toLowerCase().includes(q);
            
            // Jeśli coś wpisano i nic nie pasuje - omiń
            if (q && !nameMatch && !cityMatch && !breedMatch) return;

            const avatarSrc = u.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
            html += `
            <div class="post-card" style="display:flex; align-items:center; gap:15px; margin-bottom:10px; cursor:pointer;" onclick="window.Waggle.openChat('${doc.id}', '${u.name || 'Piesek'}')">
                <img src="${avatarSrc}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color);">
                <div>
                    <b style="font-size:16px; color:var(--text-color);">${u.name || 'Nieznajomy Piesek'}</b><br>
                    <small style="color:var(--text-muted); font-weight:700;">📍 ${u.city || 'Nie podano'} • 🐕 ${u.breed || 'Wielorasowy'}</small>
                </div>
            </div>`;
        });
        const container = document.getElementById('inbox-container');
        if (container) container.innerHTML = html || "<p style='text-align:center; margin-top:20px;'>Nikogo nie znaleziono 🐾</p>";
    });
}

export function openChat(uid, name) {
    if (!state.user) return;
    const chatId = state.user.uid > uid ? `${state.user.uid}_${uid}` : `${uid}_${state.user.uid}`;
    state.currentChatId = chatId;
    
    document.getElementById('chatPartnerName').innerText = name;
    document.getElementById('chat-window').style.display = 'flex';

    if(currentChatUnsub) currentChatUnsub();

    currentChatUnsub = db.collection("chats").doc(chatId).collection("messages").orderBy("time", "asc")
        .onSnapshot(snap => {
            let html = "";
            snap.forEach(doc => {
                const msg = doc.data();
                const isMine = msg.sender === state.user.uid;
                let contentHtml = msg.imageUrl ? `<img src="${msg.imageUrl}" style="width:100%; border-radius:12px; margin-bottom:5px; cursor:pointer;" onclick="window.Waggle.openLightbox('${msg.imageUrl}')">` : "";
                if(msg.text) contentHtml += msg.text;
                
                html += `<div class="chat-bubble ${isMine ? 'mine' : ''}">${contentHtml}</div>`;
            });
            const msgBox = document.getElementById('chatMessages');
            if(msgBox) {
                msgBox.innerHTML = html || "<p style='text-align:center; color:var(--text-muted); font-size:12px; margin-top:20px;'>Napisz pierwszą wiadomość!</p>";
                msgBox.scrollTop = msgBox.scrollHeight;
            }
        });
}

export function sendMessage(text, imageUrl = null) {
    if (!state.currentChatId || (!text.trim() && !imageUrl)) return;
    const msg = { sender: state.user.uid, text: text.trim(), time: Date.now(), imageUrl };
    
    const partnerUid = state.currentChatId.replace(state.user.uid, "").replace("_", "");
    const partnerName = document.getElementById('chatPartnerName').innerText;

    db.collection("chats").doc(state.currentChatId).collection("messages").add(msg);
    db.collection("chats").doc(state.currentChatId).set({
        lastMsg: imageUrl ? "📷 Zdjęcie" : text,
        lastUpdate: Date.now(),
        users: state.currentChatId.split("_"),
        names: { [state.user.uid]: state.profile?.name || "Piesek", [partnerUid]: partnerName }
    }, { merge: true });
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

export function toggleStado(partnerUid) {
    // Funkcja zarezerwowana pod rozwój Stada (znajomych)
    window.Waggle.showToast("Dodawanie do stada wkrótce! 🐕");
}
