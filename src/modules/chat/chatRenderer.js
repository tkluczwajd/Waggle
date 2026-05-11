export function renderInboxList(chats, currentUid) {
    let html = "";
    chats.forEach(d => {
        const partnerUid = d.users.find(u => u !== currentUid);
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
    const container = document.getElementById('inbox-container');
    if(container) container.innerHTML = html || "<p style='text-align:center; padding:20px; color:var(--text-muted);'>Brak otwartych rozmów. Znajdź kogoś!</p>";
}

export function renderSearchResultsList(users, currentUid) {
    let html = "";
    users.forEach(u => {
        if (u.id === currentUid) return;
        const avatarSrc = u.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
        html += `
        <div class="post-card" style="display:flex; align-items:center; gap:15px; margin-bottom:10px; cursor:pointer;" onclick="window.Waggle.openChat('${u.id}', '${u.name || 'Piesek'}')">
            <img src="${avatarSrc}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color);">
            <div>
                <b style="font-size:16px; color:var(--text-color);">${u.name || 'Nieznajomy Piesek'}</b><br>
                <small style="color:var(--text-muted); font-weight:700;">📍 ${u.city || 'Nie podano'} • 🐕 ${u.breed || 'Wielorasowy'}</small>
            </div>
        </div>`;
    });
    const container = document.getElementById('inbox-container');
    if (container) container.innerHTML = html || "<p style='text-align:center; margin-top:20px;'>Nikogo nie znaleziono 🐾</p>";
}

export function renderChatMessages(messages, currentUid) {
    let html = "";
    messages.forEach(msg => {
        const isMine = msg.sender === currentUid;
        let contentHtml = msg.imageUrl ? `<img src="${msg.imageUrl}" style="width:100%; border-radius:12px; margin-bottom:5px; cursor:pointer;" onclick="window.Waggle.openLightbox('${msg.imageUrl}')">` : "";
        if(msg.text) contentHtml += msg.text;
        html += `<div class="chat-bubble ${isMine ? 'mine' : ''}">${contentHtml}</div>`;
    });
    const msgBox = document.getElementById('chatMessages');
    if(msgBox) {
        msgBox.innerHTML = html || "<p style='text-align:center; color:var(--text-muted); font-size:12px; margin-top:20px;'>Napisz pierwszą wiadomość!</p>";
        msgBox.scrollTop = msgBox.scrollHeight;
    }
}
