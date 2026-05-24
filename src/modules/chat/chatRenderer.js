export function renderInboxList(chats, currentUid) {
    const container = document.getElementById('inbox-container');
    if (!container) return;

    if (chats.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:20px; font-weight: bold;">Brak wiadomości. 🐾</p>';
        return;
    }

    let html = '';
    chats.forEach(chat => {
        const unreads = chat[`unreadCount.${currentUid}`] || 0;
        const badgeHtml = unreads > 0 ? `<div style="background:var(--danger); color:white; font-size:11px; font-weight:bold; padding:2px 7px; border-radius:10px; margin-left:10px;">${unreads}</div>` : '';

        let title = '';
        let avatarHtml = '';

        // 🔥 NOWOŚĆ: Logika rysowania w zależności od typu czatu
        if (chat.isGroup) {
            // WYGLĄD DLA STADA (Grupy)
            title = chat.groupName || "Stado";
            // Zamiast zdjęcia psa, dajemy np. ikonę łapki na niebieskim tle
            avatarHtml = `<div style="width:50px; height:50px; border-radius:50%; background:var(--primary); color:white; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:bold; border:2px solid var(--border-color); flex-shrink:0;">🐾</div>`;
        } else {
            // WYGLĄD DLA CZATU 1-NA-1
            const partnerUid = chat.users.find(u => u !== currentUid);
            title = chat.names ? (chat.names[partnerUid] || 'Piesek') : 'Piesek';
            const avatar = chat.avatars && chat.avatars[partnerUid] ? chat.avatars[partnerUid] : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
            avatarHtml = `<img src="${avatar}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color); flex-shrink:0;">`;
        }

        const lastMsg = chat.lastMsg || "Brak wiadomości";
        const timeStr = chat.lastUpdate ? new Date(chat.lastUpdate).toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'}) : '';

        html += `
        <div class="post-card" onclick="window.Waggle.openChat('${chat.id}', '${title}')" style="display:flex; align-items:center; padding:12px 15px; margin-bottom:10px; background:var(--panel-bg); border-radius:16px; border:1px solid var(--border-color); cursor:pointer; transition:0.2s;">
            ${avatarHtml}
            <div style="margin-left:12px; flex-grow:1; overflow:hidden;">
                <div style="display:flex; justify-content:space-between; align-items:baseline;">
                    <b style="font-size:15px; color:var(--text-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${title}</b>
                    <small style="font-size:11px; color:var(--text-muted); margin-left:10px;">${timeStr}</small>
                </div>
                <div style="display:flex; align-items:center;">
                    <p style="margin:2px 0 0 0; font-size:13px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:80%; font-weight:${unreads > 0 ? '800' : '500'};">${lastMsg}</p>
                    ${badgeHtml}
                </div>
            </div>
        </div>`;
    });

    container.innerHTML = html;
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
}
