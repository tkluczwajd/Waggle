// src/modules/chat/groupRenderer.js

export function renderSearchResultsList(users, currentUid) {
    let html = "";
    users.forEach(u => {
        if (u.id === currentUid) return;
        const avatarSrc = u.avatar && u.avatar.trim() !== "" ? u.avatar : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
        
        // Zaktualizowany styl Premium dla wyników wyszukiwania
        html += `
        <div class="post-card" style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; margin: 0 0 10px 0; background:white; border-radius:16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border:1px solid transparent; text-align:left; overflow:hidden; transition: transform 0.2s;">
            <div style="display:flex; align-items:center; gap:14px; overflow:hidden; white-space:nowrap;">
                <img src="${avatarSrc}" style="width:48px; height:48px; border-radius:50%; object-fit:cover; border:2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); flex-shrink:0;">
                <div style="overflow:hidden; text-overflow:ellipsis;">
                    <b style="font-size:16px; font-weight:900; color:var(--text-color);">${u.name || 'Piesek'}</b><br>
                    <small style="color:var(--text-muted); font-weight:700; font-size:12px; margin-top:2px; display:block;">📍 ${u.city || 'Okolica'} ${u.breed ? '• 🐕 ' + u.breed : ''}</small>
                </div>
            </div>
            <button class="btn-outline" style="width:auto; padding:8px 16px; font-size:13px; font-weight:800; border-color:var(--secondary); color:var(--secondary); margin:0; border-radius:100px; flex-shrink:0;" onclick="window.Waggle.openChat('${u.id}', '${u.name || 'Piesek'}')">💬 Czat</button>
        </div>`;
    });
    
    const container = document.getElementById('users-list');
    if (container) container.innerHTML = html || "<p style='text-align:center; margin-top:30px; font-weight:700; color:var(--text-muted);'>Nikogo nie znaleziono 🐾</p>";
}

export function renderGroupUsersList(filteredUsers, container) {
    if(filteredUsers.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--text-muted); font-weight: bold; margin-top:20px;">Brak innych piesków w bazie.</p>';
        return;
    }
    
    let html = '';
    filteredUsers.forEach(user => {
        const avatarSrc = user.avatar && user.avatar.trim() !== "" ? user.avatar : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
        
        // 🔥 ZAMIANA DIV NA LABEL - klikasz całą kartę, żeby zaznaczyć pieska!
        html += `
        <label style="display: flex; align-items: center; justify-content: space-between; background: white; padding: 10px 16px; border-radius: 16px; margin-bottom: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); cursor: pointer; border: 1px solid var(--border-color); transition: transform 0.1s;">
            <div style="display:flex; align-items:center; gap:14px; overflow:hidden; white-space:nowrap;">
                <img src="${avatarSrc}" style="width:48px; height:48px; border-radius:50%; object-fit:cover; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); flex-shrink:0;">
                <div style="overflow:hidden; text-overflow:ellipsis;">
                    <div style="font-size:16px; font-weight:900; color: var(--text-color);">${user.name || 'Piesek'}</div>
                    <div style="font-size: 12px; font-weight:700; color: var(--text-muted); margin-top:2px;">📍 ${user.city || 'Nieznane'}</div>
                </div>
            </div>
            <input type="checkbox" value="${user.id}" data-name="${user.name || 'Piesek'}" data-avatar="${avatarSrc}" onchange="window.Waggle.toggleGroupUser(this)" style="width:24px; height:24px; accent-color:var(--primary); cursor: pointer; flex-shrink:0; margin:0;">
        </label>`;
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
            actionBtns += `<button onclick="window.Waggle.openChat('${uid}', '${name}'); document.getElementById('group-settings-modal').style.display='none';" style="background:var(--panel-bg); border:none; color:var(--secondary); font-size:18px; width:40px; height:40px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 5px rgba(0,0,0,0.05);" title="Napisz prywatnie">💬</button>`;
            if (iAmAdmin) {
                actionBtns += `<button onclick="window.Waggle.removeUserFromGroup('${chatId}', '${uid}', '${name}')" style="background:var(--panel-bg); border:none; color:var(--danger); font-size:18px; width:40px; height:40px; border-radius:50%; cursor:pointer; margin-left:8px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 5px rgba(0,0,0,0.05);" title="Wyrzuć ze Stada">🗑️</button>`;
            }
        }
        
        let badge = isMe ? '(Ty)' : '';
        if (uid === adminUid) badge += ' <span style="font-size:14px; margin-left:4px;" title="Administrator grupy">👑</span>';
        
        // Zaktualizowany styl dla ustawień grupy (krystaliczne białe karty)
        html += `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; margin-bottom:8px; background:white; border-radius:16px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); border:1px solid transparent; overflow:hidden;">
            <div style="display:flex; align-items:center; gap:12px; overflow:hidden; white-space:nowrap;">
                <img src="${avatar}" style="width:42px; height:42px; border-radius:50%; object-fit:cover; border: 2px solid ${isMe ? 'var(--primary)' : '#fff'}; box-shadow: 0 2px 6px rgba(0,0,0,0.1); flex-shrink:0;">
                <div style="overflow:hidden; text-overflow:ellipsis;">
                    <b style="font-size:15px; font-weight:900; color: var(--text-color); display:flex; align-items:center;">${name} <span style="font-size:11px; color:var(--primary); font-weight:900; margin-left:6px;">${badge}</span></b>
                </div>
            </div>
            <div style="display:flex;">${actionBtns}</div>
        </div>`;
    });
    
    container.innerHTML = html;
}
