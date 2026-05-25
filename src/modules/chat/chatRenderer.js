// src/modules/chat/chatRenderer.js

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

        if (chat.isGroup) {
            title = chat.groupName || "Stado";
            avatarHtml = `<div style="width:50px; height:50px; border-radius:50%; background:var(--primary); color:white; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:bold; border:2px solid var(--border-color); flex-shrink:0;">🐾</div>`;
        } else {
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
        const avatarSrc = u.avatar && u.avatar.trim() !== "" ? u.avatar : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
        html += `
        <div class="post-card" style="display:flex; align-items:center; justify-content:space-between; padding:12px 15px; margin: 0 0 10px 0; background:var(--panel-bg); border-radius:16px; border:1px solid var(--border-color); text-align:left; overflow:hidden;">
            <div style="display:flex; align-items:center; gap:12px; overflow:hidden; white-space:nowrap;">
                <img src="${avatarSrc}" style="width:45px; height:45px; border-radius:50%; object-fit:cover; border:2px solid var(--secondary); flex-shrink:0;">
                <div style="overflow:hidden; text-overflow:ellipsis;">
                    <b style="font-size:15px; color:var(--text-color);">${u.name || 'Piesek'}</b><br>
                    <small style="color:var(--text-muted); font-weight:700;">📍 ${u.city || 'Okolica'} ${u.breed ? '• 🐕 ' + u.breed : ''}</small>
                </div>
            </div>
            <button class="btn-outline" style="width:auto; padding:8px 14px; font-size:12px; border-color:var(--secondary); color:var(--secondary); margin:0; flex-shrink:0;" onclick="window.Waggle.openChat('${u.id}', '${u.name || 'Piesek'}')">💬 Czat</button>
        </div>`;
    });
    const container = document.getElementById('users-list');
    if (container) container.innerHTML = html || "<p style='text-align:center; margin-top:20px;'>Nikogo nie znaleziono.</p>";
}

export function renderChatMessages(messages, currentUid, isGroupChat = false) {
    let html = "";
    const isGroup = isGroupChat; 

    messages.forEach(msg => {
        const isMine = msg.sender === currentUid;
        const time = msg.time ? new Date(msg.time).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) : "";
        
        let contentHtml = msg.imageUrl ? `<img src="${msg.imageUrl}" style="width:100%; border-radius:10px; margin-bottom:5px; display:block;" onclick="window.Waggle.openLightbox('${msg.imageUrl}')">` : "";
        if(msg.text) contentHtml += `<div style="word-break: break-word;">${msg.text}</div>`;
        
        const timeHtml = `<div style="font-size:9px; opacity:0.7; text-align:right; margin-top:4px; font-weight:800;">${time}</div>`;

        let senderIdentityHtml = "";
        if (isGroup && !isMine) {
            const senderName = msg.senderName || "Piesek";
            const senderAvatar = msg.senderAvatar && msg.senderAvatar.trim() !== "" ? msg.senderAvatar : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
            
            senderIdentityHtml = `
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px; margin-left:4px;">
                <img src="${senderAvatar}" style="width:16px; height:16px; border-radius:50%; object-fit:cover;">
                <span style="font-size:10px; font-weight:800; color:var(--text-muted);">${senderName}</span>
            </div>`;
        }

        html += `
            <div style="display: flex; flex-direction: column; align-items: ${isMine ? 'flex-end' : 'flex-start'}; margin-bottom: 12px; width: 100%;">
                ${senderIdentityHtml}
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

export function renderGroupUsersList(filteredUsers, container) {
    if(filteredUsers.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--text-muted); font-weight: bold;">Brak innych piesków w bazie.</p>';
        return;
    }

    let html = '';
    filteredUsers.forEach(user => {
        const avatarSrc = user.avatar && user.avatar.trim() !== "" ? user.avatar : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
        html += `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 15px; background:var(--bg-color); border-radius:12px; border:1px solid var(--border-color); overflow:hidden;">
            <div style="display:flex; align-items:center; gap:12px; overflow:hidden; white-space:nowrap;">
                <img src="${avatarSrc}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border: 2px solid var(--secondary); flex-shrink:0;">
                <div style="overflow:hidden; text-overflow:ellipsis;">
                    <b style="font-size:14px; color: var(--text-color);">${user.name || 'Piesek'}</b><br>
                    <span style="font-size: 11px; color: var(--text-muted);">${user.city || 'Nieznane'}</span>
                </div>
            </div>
            <input type="checkbox" value="${user.id}" data-name="${user.name || 'Piesek'}" data-avatar="${avatarSrc}" onchange="window.Waggle.toggleGroupUser(this)" style="width:22px; height:22px; accent-color:var(--primary); cursor: pointer; flex-shrink:0;">
        </div>`;
    });
    container.innerHTML = html;
}

export function renderGroupSettingsList(chatId, data, currentUid, iAmAdmin, container) {
    let html = '';
    const adminUid = data.users[0];
    
    (data.users || []).forEach(uid => {
        const isMe = uid === currentUid;
        const name = data.names ? data.names[uid] : "Piesek";
        const avatar = data.avatars ? data.avatars[uid] : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
        let actionBtns = '';
        
        if (!isMe) {
            actionBtns += `<button onclick="window.Waggle.openChat('${uid}', '${name}'); document.getElementById('group-settings-modal').style.display='none';" style="background:none; border:none; color:var(--secondary); font-size:16px; cursor:pointer;" title="Napisz prywatnie">💬</button>`;
            if (iAmAdmin) {
                actionBtns += `<button onclick="window.Waggle.removeUserFromGroup('${chatId}', '${uid}', '${name}')" style="background:none; border:none; color:var(--danger); font-size:16px; cursor:pointer; margin-left:12px;" title="Wyrzuć ze Stada">🗑️</button>`;
            }
        }
        
        let badge = isMe ? '(Ty)' : '';
        if (uid === adminUid) badge += ' <span style="font-size:12px;" title="Administrator grupy">👑</span>';

        html += `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:var(--panel-bg); border-radius:12px; border:1px solid var(--border-color);">
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${avatar}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border: 2px solid ${isMe ? 'var(--primary)' : 'var(--border-color)'};">
                <div>
                    <b style="font-size:14px; color: var(--text-color);">${name} <span style="font-size:10px; color:var(--primary); font-weight:800;">${badge}</span></b>
                </div>
            </div>
            <div>${actionBtns}</div>
        </div>`;
    });
    container.innerHTML = html;
}

export function renderChatImagePreviewsUI(images, container) {
    if (images.length === 0) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    container.style.display = 'flex';
    container.style.gap = '12px';
    container.style.flexWrap = 'wrap';
    container.style.paddingTop = '10px';
    
    let html = '';
    images.forEach((file, index) => {
        const url = URL.createObjectURL(file);
        html += `
        <div style="position: relative; display: inline-block; margin-top: 5px;">
            <img src="${url}" style="width: 65px; height: 65px; object-fit: cover; border-radius: 12px; border: 2px solid var(--primary); box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <button onclick="window.Waggle.removeChatImagePreview(${index})" style="position: absolute; top: -8px; right: -8px; background: var(--danger); color: white; border: none; border-radius: 50%; width: 22px; height: 22px; font-size: 12px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; padding: 0;">✕</button>
        </div>`;
    });
    container.innerHTML = html;
}
