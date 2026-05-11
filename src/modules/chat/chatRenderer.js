export function renderInboxList(chats, currentUid) {
    let html = "";
    chats.forEach(d => {
        const partnerUid = d.users.find(u => u !== currentUid);
        const partnerName = d.names ? d.names[partnerUid] : 'Nieznajomy';
        
        html += `
        <div class="post-card" style="display:flex; align-items:center; gap:15px; margin-bottom:10px; cursor:pointer; padding: 12px;" onclick="window.Waggle.openChat('${partnerUid}', '${partnerName}')">
            <div style="width:48px; height:48px; border-radius:50%; background:var(--primary); color:white; display:flex; align-items:center; justify-content:center; font-size:20px;">🐾</div>
            <div style="flex:1;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <b style="font-size:15px; color:var(--text-color);">${partnerName}</b>
                </div>
                <div style="font-size:13px; color:var(--text-muted); font-weight:600; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px;">
                    ${d.lastMsg || 'Brak wiadomości'}
                </div>
            </div>
        </div>`;
    });
    const container = document.getElementById('inbox-container');
    if(container) container.innerHTML = html || "<p style='text-align:center; padding:20px; color:var(--text-muted);'>Brak otwartych rozmów.</p>";
}

export function renderSearchResultsList(users, currentUid) {
    let html = "";
    users.forEach(u => {
        if (u.id === currentUid) return;
        const avatarSrc = u.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
        html += `
        <div class="post-card" style="display:flex; align-items:center; gap:12px; margin-bottom:10px; cursor:pointer; padding:12px;" onclick="window.Waggle.openChat('${u.id}', '${u.name || 'Piesek'}')">
            <img src="${avatarSrc}" style="width:45px; height:45px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color);">
            <div>
                <b style="font-size:15px; color:var(--text-color);">${u.name || 'Piesek'}</b><br>
                <small style="color:var(--text-muted); font-weight:700;">📍 ${u.city || 'Okolica'}</small>
            </div>
        </div>`;
    });
    const container = document.getElementById('inbox-container');
    if (container) container.innerHTML = html || "<p style='text-align:center; margin-top:20px;'>Nikogo nie znaleziono.</p>";
}

export function renderChatMessages(messages, currentUid) {
    let html = "";
    messages.forEach(msg => {
        const isMine = msg.sender === currentUid;
        const time = msg.time ? new Date(msg.time).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) : "";
        
        let contentHtml = msg.imageUrl ? `<img src="${msg.imageUrl}" style="width:100%; border-radius:10px; margin-bottom:5px; display:block;" onclick="window.Waggle.openLightbox('${msg.imageUrl}')">` : "";
        if(msg.text) contentHtml += `<div style="word-break: break-word;">${msg.text}</div>`;
        
        // Dodajemy kontener z czasem na dole bąbelka
        const timeHtml = `<div style="font-size:9px; opacity:0.7; text-align:right; margin-top:4px; font-weight:800;">${time}</div>`;

        html += `
            <div style="display: flex; justify-content: ${isMine ? 'flex-end' : 'flex-start'}; margin-bottom: 8px; width: 100%;">
                <div class="chat-bubble ${isMine ? 'mine' : ''}" style="max-width: 75%; position: relative;">
                    ${contentHtml}
                    ${timeHtml}
                </div>
            </div>`;
    });
    
    const msgBox = document.getElementById('chatMessages');
    if(msgBox) {
        msgBox.innerHTML = html;
        msgBox.scrollTop = msgBox.scrollHeight;
    }
}
