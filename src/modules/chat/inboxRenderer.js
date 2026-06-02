// src/modules/chat/inboxRenderer.js

export function renderInboxList(chats, currentUid) {
    const container = document.getElementById('inbox-container');
    if (!container) return;

    // Komunikat gdy brak wiadomości
    if (chats.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 20px;">
                <div style="font-size:40px; margin-bottom:10px; opacity:0.5;">📭</div>
                <b style="color:var(--text-muted);">Brak wiadomości.</b>
            </div>`;
        return;
    }

    let html = '';
    chats.forEach(chat => {
        // Sprawdzamy czy są nieprzeczytane wiadomości
        const unreads = chat[`unreadCount.${currentUid}`] || 0;
        const isUnread = unreads > 0;

        let title = '';
        let avatarElement = '';

        // Rysowanie awatara: Grupa vs Pojedynczy użytkownik
        if (chat.isGroup) {
            title = chat.groupName || "Stado";
            avatarElement = `<div style="width: 55px; height: 55px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, #ff7b7b 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">🐾</div>`;
        } else {
            const partnerUid = chat.users.find(u => u !== currentUid);
            title = chat.names ? (chat.names[partnerUid] || 'Piesek') : 'Piesek';
            const avatar = chat.avatars && chat.avatars[partnerUid] ? chat.avatars[partnerUid] : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
            avatarElement = `<img src="${avatar}" style="width: 55px; height: 55px; border-radius: 50%; object-fit: cover; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">`;
        }

        const lastMsg = chat.lastMsg || "Brak wiadomości";
        
        // Formatowanie czasu (godzina jeśli dzisiaj, data jeśli starsze)
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

        // 🔥 NOWY, KRYSTALICZNIE CZYSTY STYL KARTY
        html += `
        <div onclick="window.Waggle.openChat('${chat.id}', '${title}')" style="display: flex; align-items: center; gap: 15px; background: white; padding: 16px; border-radius: 20px; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; border: 1px solid transparent;">
            <div style="position: relative; flex-shrink: 0;">
                ${avatarElement}
                ${isUnread ? `<div style="position: absolute; top: 0; right: 0; width: 14px; height: 14px; background: var(--danger); border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>` : ''}
            </div>
            
            <div style="flex: 1; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                    <b style="font-size: 16px; color: var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</b>
                    <span style="font-size: 11px; color: var(--text-muted); font-weight: 800; flex-shrink: 0;">${timeStr}</span>
                </div>
                <p style="margin: 0; font-size: 14px; color: ${isUnread ? 'var(--text-color)' : 'var(--text-muted)'}; font-weight: ${isUnread ? '800' : '600'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${lastMsg}
                </p>
            </div>
        </div>
        `;
    });

    // Zrzucenie gotowego HTML do kontenera na stronie
    container.innerHTML = html;
}
