// src/modules/chat/chatRenderer.js

export function renderInboxList(chats, currentUid) {
    const container = document.getElementById('inbox-container');
    if (!container) return;

    if (chats.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px 20px;"><div style="font-size:40px; margin-bottom:10px; opacity:0.5;">📭</div><b style="color:var(--text-muted);">Brak wiadomości.</b></div>';
        return;
    }

    let html = '';
    chats.forEach(chat => {
        const unreads = chat[`unreadCount.${currentUid}`] || 0;
        const isUnread = unreads > 0;
        
        // Zamiast czerwonego prostokąta, nowoczesna kropka przy nazwie
        const unreadDotHtml = isUnread ? `<div class="inbox-unread-dot"></div>` : '';

        let title = '';
        let avatarHtml = '';

        if (chat.isGroup) {
            title = chat.groupName || "Stado";
            avatarHtml = `<div style="width:52px; height:52px; border-radius:50%; background:linear-gradient(135deg, var(--primary) 0%, #ff7b7b 100%); color:white; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:bold; flex-shrink:0; box-shadow: 0 4px 10px rgba(255,82,82,0.2);">🐾</div>`;
        } else {
            const partnerUid = chat.users.find(u => u !== currentUid);
            title = chat.names ? (chat.names[partnerUid] || 'Piesek') : 'Piesek';
            const avatar = chat.avatars && chat.avatars[partnerUid] ? chat.avatars[partnerUid] : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
            avatarHtml = `<img src="${avatar}" style="width:52px; height:52px; border-radius:50%; object-fit:cover; border:2px solid ${isUnread ? 'var(--primary)' : 'transparent'}; flex-shrink:0; transition:0.2s;">`;
        }

        const lastMsg = chat.lastMsg || "Brak wiadomości";
        // Krótszy format czasu dla dzisiejszych wiadomości
        let timeStr = '';
        if (chat.lastUpdate) {
            const date = new Date(chat.lastUpdate);
            const today = new Date();
            if(date.toDateString() === today.toDateString()) {
                timeStr = date.toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'});
            } else {
                timeStr = date.toLocaleDateString('pl-PL', {day: '2-digit', month:'2-digit'});
            }
        }

        html += `
        <div class="post-card" onclick="window.Waggle.openChat('${chat.id}', '${title}')" style="display:flex; align-items:center; padding:12px 15px; margin-bottom:10px; background:var(--panel-bg); border-radius:20px; border:1px solid ${isUnread ? 'var(--primary)' : 'var(--border-color)'}; cursor:pointer; transition:0.2s; box-shadow: ${isUnread ? '0 4px 12px rgba(255,82,82,0.1)' : 'var(--soft-shadow)'};">
            ${avatarHtml}
            <div style="margin-left:14px; flex-grow:1; overflow:hidden;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2px;">
                    <div style="display:flex; align-items:center; gap:8px; overflow:hidden;">
                        <b style="font-size:16px; color:var(--text-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${title}</b>
                        ${unreadDotHtml}
                    </div>
                    <small style="font-size:11px; color:${isUnread ? 'var(--primary)' : 'var(--text-muted)'}; font-weight:${isUnread ? '800' : '600'};">${timeStr}</small>
                </div>
                <div style="display:flex; align-items:center;">
                    <p style="margin:0; font-size:14px; color:${isUnread ? 'var(--text-color)' : 'var(--text-muted)'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:${isUnread ? '700' : '500'};">${lastMsg}</p>
                </div>
            </div>
        </div>`;
    });

    container.innerHTML = html;
}

export function renderChatMessages(messages, currentUid, isGroupChat = false) {
    let html = "";
    const isGroup = isGroupChat; 

    messages.forEach(msg => {
        const isMine = msg.sender === currentUid;
        const time = msg.time ? new Date(msg.time).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) : "";
        
        let contentHtml = msg.imageUrl ? `<img src="${msg.imageUrl}" style="width:100%; border-radius:12px; margin-bottom:6px; display:block; cursor:pointer;" onclick="window.Waggle.openLightbox('${msg.imageUrl}')">` : "";
        if(msg.text) contentHtml += `<div style="word-break: break-word;">${msg.text}</div>`;
        
        // Dodajemy znaczek wysłania dla własnych wiadomości
        const checkmark = isMine ? `<span style="font-size:11px; margin-left:2px; opacity:0.8;">✓</span>` : "";
        const timeHtml = `<div class="chat-time">${time} ${checkmark}</div>`;

        let senderIdentityHtml = "";
        if (isGroup && !isMine) {
            const senderName = msg.senderName || "Piesek";
            const senderAvatar = msg.senderAvatar && msg.senderAvatar.trim() !== "" ? msg.senderAvatar : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
            
            senderIdentityHtml = `
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px; margin-left:4px;">
                <img src="${senderAvatar}" style="width:18px; height:18px; border-radius:50%; object-fit:cover; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <span style="font-size:11px; font-weight:800; color:var(--text-muted);">${senderName}</span>
            </div>`;
        }

        html += `
            <div style="display: flex; flex-direction: column; align-items: ${isMine ? 'flex-end' : 'flex-start'}; margin-bottom: 14px; width: 100%;">
                ${senderIdentityHtml}
                <div class="chat-bubble ${isMine ? 'mine' : ''}" style="max-width: 78%;">
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

// ... zachowaj bez zmian renderSearchResultsList, renderGroupUsersList, renderGroupSettingsList, renderChatImagePreviewsUI ...
// (Wklej tu pozostałe funkcje z Twojego oryginalnego pliku, ponieważ nie wymagają one zmian w UX czatu)

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

export function renderGroupUsersList(users, container) {
    if (users.length === 0) {
        container.innerHTML = '<p style="text-align:center; font-size:12px; color:var(--text-muted); padding: 20px;">Brak innych piesków w okolicy.</p>';
        return;
    }

    let html = '';
    users.forEach(u => {
        // Zabezpieczenie przed pustymi danymi z bazy
        const name = u.dogName || u.name || 'Nieznany Piesek';
        const city = u.city || 'Nieznane miasto';
        const avatar = u.photoUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`;

        html += `
        <label style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: white; border: 1px solid var(--border-color); border-radius: 16px; margin-bottom: 8px; cursor: pointer; transition: 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 12px; overflow: hidden; flex: 1;">
                <img src="${avatar}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--bg-color); flex-shrink: 0;">
                <div style="overflow: hidden;">
                    <div style="font-weight: 900; font-size: 15px; color: var(--text-color); white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${name}</div>
                    <div style="font-size: 11px; font-weight: 700; color: var(--text-muted);">${city}</div>
                </div>
            </div>
            
            <input type="checkbox" value="${u.id}" data-name="${name.replace(/'/g, "\\'")}" data-avatar="${avatar}" onchange="window.Waggle.toggleGroupUser(this)" class="group-user-checkbox" style="width: 24px; height: 24px; accent-color: var(--secondary); flex-shrink: 0; margin-left: 10px; cursor: pointer;">
        </label>
        `;
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
        <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:var(--panel-bg); border-radius:12px; border:1px solid var(--border-color); overflow:hidden;">
            <div style="display:flex; align-items:center; gap:10px; overflow:hidden; white-space:nowrap;">
                <img src="${avatar}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border: 2px solid ${isMe ? 'var(--primary)' : 'var(--border-color)'}; flex-shrink:0;">
                <div style="overflow:hidden; text-overflow:ellipsis;">
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
