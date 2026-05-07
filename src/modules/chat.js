import { db, fb } from '../core/firebase.js';
import { state, ListenerManager } from '../core/state.js';

let currentChatUnsub = null; // Zmienna pilnująca otwartego okna czatu

export function loadInbox() {
    if (!state.user) return;
    
    // Zdejmujemy orderBy z bazy, aby ominać błąd brakującego indeksu Firebase!
    const unsub = db.collection("chats")
        .where("users", "array-contains", state.user.uid)
        .onSnapshot(snap => {
            let chatsList = [];
            snap.forEach(doc => chatsList.push({ id: doc.id, ...doc.data() }));
            
            // Sortujemy czaty w pamięci telefonu od najnowszego
            chatsList.sort((a, b) => (b.lastUpdate || 0) - (a.lastUpdate || 0));

            let html = "";
            chatsList.forEach(d => {
                const partnerUid = d.users.find(u => u !== state.user.uid);
                const partnerName = d.names ? d.names[partnerUid] : 'Nieznajomy';
                
                html += `
                <div class="post-card" style="display:flex; align-items:center; gap:15px; margin-bottom:10px; cursor:pointer;" onclick="window.Waggle.openChat('${partnerUid}', '${partnerName}')">
                    <div style="width:50px; height:50px; border-radius:50%; background:var(--panel-bg); display:flex; align-items:center; justify-content:center; font-size:24px; box-shadow:var(--soft-shadow);">🐾</div>
                    <div style="flex:1;">
                        <b style="font-size:16px;">${partnerName}</b><br>
                        <small style="color:var(--text-muted);">${d.lastMsg || 'Kliknij, aby pisać'}</small>
                    </div>
                </div>`;
            });
            const container = document.getElementById('inbox-container');
            if (container) container.innerHTML = html || "<p style='text-align:center; padding:20px; color:var(--text-muted);'>Brak rozmów. Przejdź do zakładki STADO i poznaj kogoś!</p>";
        });
    ListenerManager.add(unsub);
}

export function searchUsers(query) {
    if(!query || query.length < 2) {
        document.getElementById('inbox-container').innerHTML = "<p style='text-align:center; padding:20px; color:var(--text-muted);'>Wpisz min. 2 litery (imię, rasę lub miasto)...</p>";
        return;
    }
    const q = query.toLowerCase();
    
    db.collection("users").get().then(snap => {
        let html = "";
        snap.forEach(doc => {
            const u = doc.data();
            if(doc.id === state.user.uid) return; 
            
            const matchName = u.name && u.name.toLowerCase().includes(q);
            const matchBreed = u.breed && u.breed.toLowerCase().includes(q);
            const matchCity = u.city && u.city.toLowerCase().includes(q);
            
            if(matchName || matchBreed || matchCity) {
                const avatar = u.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
                html += `
                <div class="post-card" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:12px; cursor:pointer;" onclick="window.Waggle.openUserMenu('${doc.id}', '${u.name || 'Piesek'}', '${avatar}')">
                        <img src="${avatar}" style="width:50px;height:50px;border-radius:50%;object-fit:cover; border:2px solid var(--border-color);">
                        <div style="line-height:1.2;">
                            <b style="font-size:16px;">${u.name || 'Piesek'}</b><br>
                            <small style="color:var(--text-muted); font-size:12px; font-weight:800;">${u.breed || 'Rasa nieznana'} • ${u.city || 'Miasto nieznane'}</small>
                        </div>
                    </div>
                    <button class="btn-main" style="width:auto; padding:8px 15px; font-size:12px;" onclick="window.Waggle.openChat('${doc.id}', '${u.name || 'Piesek'}')">💬 Napisz</button>
                </div>`;
            }
        });
        document.getElementById('inbox-container').innerHTML = html || "<p style='text-align:center; padding:20px; color:var(--text-muted);'>Nie znaleziono piesków spełniających kryteria.</p>";
    });
}

export async function openChat(partnerUid, partnerName) {
    const chatId = [state.user.uid, partnerUid].sort().join("_");
    state.currentChatId = chatId;
    document.getElementById('chatPartnerName').innerText = partnerName;
    document.getElementById('chat-window').style.display = 'flex';
    
    // Jeśli mieliśmy otwarty inny czat, odpinamy go
    if(currentChatUnsub) currentChatUnsub();
    
    currentChatUnsub = db.collection("chats").doc(chatId).collection("messages")
        .orderBy("time", "asc").limit(50).onSnapshot(snap => {
            let html = "";
            snap.forEach(mDoc => {
                const m = mDoc.data();
                const isMe = m.sender === state.user.uid;
                html += `<div style="align-self: ${isMe ? 'flex-end' : 'flex-start'}; background: ${isMe ? 'var(--primary)' : 'var(--panel-bg)'}; color: ${isMe ? 'white' : 'var(--text-color)'}; padding: 10px 15px; border-radius: 15px; max-width: 80%; margin-bottom: 5px; font-weight: 600; box-shadow:var(--soft-shadow);">${m.text}</div>`;
            });
            const msgBox = document.getElementById('chatMessages');
            msgBox.innerHTML = html || "<p style='text-align:center; color:var(--text-muted); font-size:12px; margin-top:20px;'>Napisz pierwszą wiadomość!</p>";
            msgBox.scrollTop = msgBox.scrollHeight;
        });
}

export function sendMessage(text) {
    if (!state.currentChatId) return;
    const msg = { sender: state.user.uid, text, time: Date.now() };
    
    const partnerUid = state.currentChatId.replace(state.user.uid, "").replace("_", "");
    const partnerName = document.getElementById('chatPartnerName').innerText;
    const myName = state.profile?.name || "Piesek";

    db.collection("chats").doc(state.currentChatId).collection("messages").add(msg);
    db.collection("chats").doc(state.currentChatId).set({
        lastMsg: text,
        lastUpdate: Date.now(),
        users: state.currentChatId.split("_"),
        names: { [state.user.uid]: myName, [partnerUid]: partnerName }
    }, { merge: true });
}

export function closeActiveChat() {
    document.getElementById('chat-window').style.display = 'none';
    state.currentChatId = null;
    if(currentChatUnsub) {
        currentChatUnsub();
        currentChatUnsub = null;
    }
}