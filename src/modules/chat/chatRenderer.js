export function renderInboxList(chats, currentUid) {
    let html = "";
    chats.forEach(d => {
        const partnerUid = d.users.find(u => u !== currentUid);
        const partnerName = d.names ? d.names[partnerUid] : 'Nieznajomy';
        
        // Zabezpieczenie danych – jeśli nie ma awatara, dajemy domyślny
        const partnerAvatar = (d.avatars && d.avatars[partnerUid]) ? d.avatars[partnerUid] : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
        
        // Odkrywamy licznik nieprzeczytanych przypisany bezpośrednio do nas
        const unreads = (d.unreadCount && d.unreadCount[currentUid]) ? d.unreadCount[currentUid] : 0;
        
        // Precyzyjne parsowanie czasu ostatniej wiadomości
        const timeStr = d.lastUpdate ? new Date(d.lastUpdate).toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'}) : '';
        
        // Stylizacje dynamiczne na podstawie odczytanych wiadomości
        const badgeHtml = unreads > 0 ? `<div style="background:var(--danger); color:white; font-size:11px; font-weight:900; border-radius:10px; padding:2px 8px; margin-left:10px;">${unreads}</div>` : '';
        const fw = unreads > 0 ? '900' : '600';
        const msgColor = unreads > 0 ? 'var(--text-color)' : 'var(--text-muted)';
        const cardBg = unreads > 0 ? 'rgba(52, 172, 224, 0.05)' : 'var(--panel-bg)';
        const cardBorder = unreads > 0 ? 'var(--primary)' : 'var(--border-color)';
        
        html += `
        <div class="post-card" style="display:flex; align-items:center; gap:15px; margin-bottom:10px; cursor:pointer; padding: 12px; background: ${cardBg}; border: 1px solid ${cardBorder};" onclick="window.Waggle.openChat('${partnerUid}', '${partnerName}')">
            <img src="${partnerAvatar}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border: 2px solid ${unreads > 0 ? 'var(--primary)' : 'transparent'};">
            
            <div style="flex:1; overflow:hidden;">
                <div style="display:flex; justify-content:space-between; align-items:baseline;">
                    <b style="font-size:15px; color:var(--text-color);">${partnerName}</b>
                    <small style="font-size:11px; color:var(--text-muted); font-weight:800;">${timeStr}</small>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:3px;">
                    <div style="font-size:13px; color:${msgColor}; font-weight:${fw}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                        ${d.lastMsg || 'Brak wiadomości'}
                    </div>
                    ${badgeHtml}
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
}    });
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
