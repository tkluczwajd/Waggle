// src/modules/community/postRenderer.js
import { appState as state } from '../../core/state.js';

export function renderPostsList(posts, filter) {
    let html = ""; 
    const isAdmin = state.profile?.isAdmin === true;
    
    posts.forEach(p => { 
        // Logika filtrowania - Sztywne zasady dla Info
        if (filter === 'events' && !p.isEvent) return;
        if (filter === 'alerts' && !p.isAlert) return;
        // Wpuść tylko te, które są informacją, ale WYKLUCZ takie, które są alertem lub ustawką
        if (filter === 'info' && (!p.isInfo || p.isAlert || p.isEvent)) return;

        let timeString = "Przed chwilą";
        if (p.timestamp) {
            const d = p.timestamp.toDate ? p.timestamp.toDate() : new Date(p.timestamp);
            timeString = d.toLocaleString('pl-PL', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'});
        }

        const avatarSrc = p.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
        let postImgHtml = p.imageUrl ? `<img src="${p.imageUrl}" style="width:100%; height:200px; object-fit:cover; border-radius:16px; margin:15px 0; box-shadow:var(--soft-shadow); cursor:pointer;" onclick="window.Waggle.openLightbox('${p.imageUrl}')">` : "";
        
        // 🔥 POPRAWKA 1: Półprzezroczysty, szary krzyżyk usunięcia. Dobrze widoczny na zwykłej karcie i na banerze
        let delBtn = (p.uid === state.user?.uid || isAdmin) ? `<button onclick="window.Waggle.deletePost('${p.id}')" style="position:absolute; top:12px; right:12px; background:rgba(0,0,0,0.08); border:none; color:var(--text-color); cursor:pointer; font-size:14px; width:28px; height:28px; border-radius:50%; display:flex; justify-content:center; align-items:center; z-index:10; transition: 0.2s;">✕</button>` : "";        
        
        // 🔥 POPRAWKA 2: showUserActionModal zamiast openUserMenu (Naprawia problem z PUSTYM EKRANEM)
        let userHeader = `<button onclick="window.Waggle.showUserActionModal('${p.uid}', '${p.author || 'Piesek'}', '${avatarSrc}')" style="background:none; border:none; padding:0; cursor:pointer; text-align:left; display:flex; align-items:center; gap:12px; width:100%;">
            <img src="${avatarSrc}" style="width:45px; height:45px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color);">
            <div style="line-height:1.2;">
                <b style="font-size:16px; color:var(--text-color);">${p.author || 'Piesek'}</b><br>
                <small style="color:var(--text-muted); font-size:11px; font-weight:700;">${timeString}</small>
            </div>
        </button>`;

        let eventBanner = "";
        let cardStyle = "position:relative;";
        
        if (p.isEvent) {
            cardStyle = "position:relative; border: 2px solid var(--primary);";
            let eventDateStr = p.eventDate ? new Date(p.eventDate).toLocaleString('pl-PL', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'}) : "Nieznana data";
            
            const attendees = p.attendees || [];
            const isAttending = state.user && attendees.includes(state.user.uid);
            
            const btnBg = isAttending ? 'transparent' : 'white';
            const btnColor = isAttending ? 'white' : 'var(--primary)';
            const btnBorder = isAttending ? '1px solid white' : 'none';
            const btnText = isAttending ? 'Wypisz się ❌' : 'BĘDĘ! 🐾';
            
            const attendeesCountHtml = attendees.length > 0 
                ? `<div style="margin-top: 6px; font-size: 11px; font-weight: bold; background: rgba(0,0,0,0.15); padding: 4px 8px; border-radius: 10px; display: inline-block;">👥 Chętnych psów: ${attendees.length}</div>` 
                : '';

            eventBanner = `<div style="background:var(--primary); color:white; padding:12px 15px; border-radius:10px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center; box-shadow: 0 4px 10px rgba(52, 172, 224, 0.3);">
                <div>
                    <b style="font-size:15px;">📅 Ustawka!</b><br>
                    <small style="font-weight:700; font-size:13px;">${eventDateStr}</small><br>
                    ${attendeesCountHtml}
                </div>
                <button onclick="window.Waggle.toggleEventAttendance('${p.id}')" style="background:${btnBg}; color:${btnColor}; border:${btnBorder}; border-radius:20px; padding:8px 15px; font-weight:900; font-size:12px; cursor:pointer; transition:0.2s;">
                    ${btnText}
                </button>
            </div>`;
        } else if (p.isAlert) {
            cardStyle = "position:relative; border: 2px solid var(--danger);";
            // Dodano padding-right: 40px aby napis nie wchodził pod krzyżyk
            eventBanner = `<div style="background:var(--danger); color:white; padding:8px 12px; border-radius:8px; margin-bottom:10px; font-size:12px; font-weight:800; padding-right:40px;">⚠️ ZAGROŻENIE</div>`;
        } else if (p.isInfo) {
            cardStyle = "position:relative; border: 2px solid #8e44ad;";
            eventBanner = `<div style="background:#8e44ad; color:white; padding:8px 12px; border-radius:8px; margin-bottom:10px; font-size:12px; font-weight:800; display:flex; justify-content:space-between; padding-right:40px;">
                <span>📢 OGŁOSZENIE / OFERTA</span>
            </div>`;
        }

        const likesCount = p.likes ? p.likes.length : 0;
        const hasLiked = p.likes && p.likes.includes(state.user?.uid);
        const commentCount = p.commentCount || 0; 

        html += `<div class="post-card" style="${cardStyle}">
                    ${eventBanner}
                    ${delBtn}
                    ${userHeader}
                    <p style="color:var(--text-color); font-weight:600; margin-top:12px; word-break: break-word; font-size: 15px;">${p.content}</p>
                    ${postImgHtml}
                    <div style="border-top: 1px solid var(--border-color); margin-top: 15px; padding-top: 12px; display:flex; gap: 20px;">
                        <span style="font-size:13px; color:${hasLiked ? 'var(--danger)' : 'var(--text-muted)'}; font-weight:800; cursor:pointer;" onclick="window.Waggle.togglePostLike('${p.id}')">
                            ${hasLiked ? '❤️' : '🤍'} ${likesCount > 0 ? likesCount : 'Lubię to'}
                        </span>
                        <span style="font-size:13px; color:var(--text-muted); font-weight:800; cursor:pointer;" onclick="window.Waggle.openPostComments('${p.id}')">
                            💬 ${commentCount > 0 ? commentCount + ' Komentarze' : 'Komentarze'}
                        </span>
                    </div>
                </div>`; 
    }); 
    
    if(!html) html = `<div style="text-align:center; padding:40px 20px; color:var(--text-muted);"><h3>Brak wpisów 🐕</h3><p>Bądź pierwszy i dodaj posta!</p></div>`; 
    const container = document.getElementById('posts-container');
    if(container) container.innerHTML = html; 
}

export function renderCommentsList(comments) {
    let html = "";
    comments.forEach(c => {
        const timeStr = c.timestamp ? new Date(c.timestamp.toDate ? c.timestamp.toDate() : c.timestamp).toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'}) : '';
        html += `
            <div style="background:var(--panel-bg); padding:10px 15px; border-radius:12px; margin-bottom:10px; text-align: left;">
                <div style="display:flex; justify-content:space-between; align-items:baseline;">
                    <b style="font-size:14px; color:var(--text-color);">${c.author}</b>
                    <small style="font-size:10px; color:var(--text-muted);">${timeStr}</small>
                </div>
                <p style="margin:5px 0 0 0; font-size:14px; font-weight:600;">${c.text}</p>
            </div>
        `;
    });
    const list = document.getElementById('comments-list');
    if(list) {
        list.innerHTML = html || "<p style='text-align:center; color:var(--text-muted); padding-top:20px;'>Brak komentarzy. Bądź pierwszy!</p>";
        list.scrollTop = list.scrollHeight; 
    }
}
