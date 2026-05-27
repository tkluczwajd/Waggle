// src/modules/chat/groupRenderer.js

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
