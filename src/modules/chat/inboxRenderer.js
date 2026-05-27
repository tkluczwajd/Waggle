// src/modules/chat/inboxRenderer.js

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
