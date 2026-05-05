import { state, addListener } from '../core/state.js';
import { db } from '../core/firebase.js';

// Globalna funkcja by móc zamykać z HTML
window.closeActiveChat = function() {
    document.getElementById('chat-window').style.display = 'none';
    state.currentChatId = null;
}

export function loadInbox() {
    // Pobieramy wiadomości wysłane DO nas (jako odbiorcy)
    const unsub = db.collection("messages")
        .where("receiver", "==", state.user.uid)
        .orderBy("timestamp", "desc")
        .onSnapshot(snap => {
            let html = "";
            let seen = new Set();

            snap.forEach(doc => {
                const m = doc.data();
                // Pokazujemy tylko najnowszą wiadomość od danego nadawcy
                if(!seen.has(m.sender)) {
                    html += `
                        <div class="post-card" style="margin:10px; cursor:pointer;" onclick="openChat('${m.sender}', '${m.senderName}')">
                            <b>${m.senderName}</b><br>
                            <small>${m.text.substring(0, 30)}...</small>
                        </div>
                    `;
                    seen.add(m.sender);
                }
            });
            document.getElementById('inbox-container').innerHTML = html || "<p style='text-align:center; padding:20px;'>Pusta skrzynka.</p>";
        });
    addListener(unsub);
}

window.openChat = function(partnerUid, partnerName) {
    state.currentChatId = partnerUid;
    
    // Generujemy unikalne ID czatu (posortowane alfabetycznie, żeby dla obu stron było takie samo!)
    const chatId = [state.user.uid, partnerUid].sort().join('_');

    document.getElementById('chatPartnerName').innerText = partnerName;
    document.getElementById('chat-window').style.display = 'flex';

    // POBIERAMY TYLKO WIADOMOŚCI Z TEGO KONKRETNEGO CZATU! (Rozwiązanie recenzenta)
    const unsub = db.collection("messages")
        .where("chatId", "==", chatId)
        .orderBy("timestamp", "asc")
        .onSnapshot(snap => {
            let html = "";
            snap.forEach(doc => {
                const m = doc.data();
                const isMe = m.sender === state.user.uid;
                
                html += `
                    <div style="align-self:${isMe ? 'flex-end' : 'flex-start'}; 
                                background:${isMe ? 'var(--primary)' : 'var(--border-color)'}; 
                                color:${isMe ? '#fff' : 'var(--text-color)'}; 
                                padding:12px 18px; border-radius:20px; font-weight:700; margin-bottom:8px; max-width:75%;">
                        ${m.text}
                    </div>
                `;
            });
            const chatBox = document.getElementById('chatMessages');
            chatBox.innerHTML = html;
            chatBox.scrollTop = chatBox.scrollHeight; // Autoscroll w dół
        });
    addListener(unsub);
}

document.getElementById('sendMsgBtn').onclick = () => {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text || !state.currentChatId) return;

    // Tworzymy to samo unikalne ID
    const chatId = [state.user.uid, state.currentChatId].sort().join('_');

    db.collection("messages").add({
        chatId: chatId, // <--- NOWOŚĆ: Skalowalny klucz do wyszukiwania
        sender: state.user.uid,
        senderName: state.profile.name,
        receiver: state.currentChatId,
        text: text,
        timestamp: Date.now()
    });

    input.value = ""; // Czyścimy input
};
