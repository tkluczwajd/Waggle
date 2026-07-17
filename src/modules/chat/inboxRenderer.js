// src/modules/chat/inboxRenderer.js

export function renderInboxList(chats, currentUid) {
    const container = document.getElementById('inbox-container');
    if (!container) return;

    // 🔥 NOWY SYSTEM PUSTYCH STANÓW (FUX) DLA CZATU
    if (chats.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; margin-top: 30px; padding: 40px 20px; background: white; border-radius: 24px; border: 1px dashed var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
                <div style="font-size: 56px; margin-bottom: 15px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));">📭</div>
                <div style="color: var(--text-color); font-weight: 900; font-size: 20px; margin-bottom: 10px; letter-spacing: -0.5px;">Pusta skrzynka</div>
                <div style="color: var(--text-muted); font-size: 13px; line-height: 1.6; max-width: 260px; margin: 0 auto;">Nie masz jeszcze żadnych rozpoczętych rozmów. Poznaj sąsiadów z psami i umów się na wspólny spacer!</div>
                <button onclick="const searchTab = document.getElementById('chatTabSearch'); if(searchTab) searchTab.click();" style="margin-top: 20px; padding: 12px 24px; background: var(--secondary); color: white; border: none; border-radius: 12px; font-weight: 900; font-size: 14px; cursor: pointer; box-shadow: 0 4px 15px rgba(52, 172, 224, 0.3); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">🔍 Znajdź przyjaciół z psami</button>
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

        // Rysowanie awatara: Mniejsze wymiary (48px zamiast 55px)
        if (chat.isGroup) {
            title = chat.groupName || "Stado";
            avatarElement = `<div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, #ff7b7b 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">🐾</div>`;
        } else {
            const partnerUid = chat.users.find(u => u !== currentUid);
            title = chat.names ? (chat.names[partnerUid] || 'Piesek') : 'Piesek';
            const avatar = chat.avatars && chat.avatars[partnerUid] ? chat.avatars[partnerUid] : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
            avatarElement = `<img src="${avatar}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">`;
        }

        const lastMsg = chat.lastMsg || "Brak wiadomości";
        
        // 🔥 POPRAWKA: Stabilne formatowanie daty (wspiera Firestore Timestamp)
        let timeStr = '';
        if (chat.lastUpdate) {
            // Sprawdzamy czy to obiekt Firestore (ma metodę toDate)
            let date;
            if (chat.lastUpdate.toDate) {
                date = chat.lastUpdate.toDate();
            } else {
                date = new Date(chat.lastUpdate);
            }

            // Sprawdzamy czy data jest poprawna
            if (date instanceof Date && !isNaN(date)) {
                const today = new Date();
                if(date.toDateString() === today.toDateString()) {
                    timeStr = date.toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'});
                } else {
                    timeStr = date.toLocaleDateString('pl-PL', {day: '2-digit', month:'2-digit'});
                }
            }
        }

        // 🔥 ODCHUDZONY STYL: Mniejszy padding (12px 16px), mniejszy odstęp (8px), spójniejsze zaokrąglenia (16px)
        html += `
        <div onclick="window.Waggle.openChat('${chat.id}', '${title}')" style="display: flex; align-items: center; gap: 14px; background: white; padding: 12px 16px; border-radius: 16px; margin-bottom: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; border: 1px solid transparent;">
            <div style="position: relative; flex-shrink: 0;">
                ${avatarElement}
                ${isUnread ? `<div style="position: absolute; top: 0; right: 0; width: 12px; height: 12px; background: var(--danger); border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>` : ''}
            </div>
            
            <div style="flex: 1; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px;">
                    <b style="font-size: 15px; color: var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</b>
                    <span style="font-size: 11px; color: var(--text-muted); font-weight: 800; flex-shrink: 0;">${timeStr}</span>
                </div>
                <p style="margin: 0; font-size: 13px; color: ${isUnread ? 'var(--text-color)' : 'var(--text-muted)'}; font-weight: ${isUnread ? '800' : '600'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${lastMsg}
                </p>
            </div>
        </div>
        `;
    });

    container.innerHTML = html;
}
