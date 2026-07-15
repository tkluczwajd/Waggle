// src/ui/globalUtils.js
import { appState as state } from '../core/state.js';

export function initGlobalUtils() {
    window.Waggle = window.Waggle || {};

    // 1. Centralny system powiadomień Toast
    window.Waggle.showToast = (msg) => {
        let t = document.getElementById('waggle-toast');
        if(!t) {
            t = document.createElement('div'); t.id = 'waggle-toast';
            t.style.cssText = 'position:fixed; bottom:110px; left:50%; transform:translateX(-50%); background:#2d3436; color:#fff; padding:12px 24px; border-radius:25px; font-size:14px; font-weight:800; z-index:10000; border:2px solid var(--primary); transition:opacity 0.3s; text-align:center;';
            document.body.appendChild(t);
        }
        t.innerText = msg; t.style.display = 'block'; t.style.opacity = '1';
        setTimeout(() => { t.style.opacity = '0'; setTimeout(()=>t.style.display='none',300); }, 3500);
    };

    // 2. Podgląd zdjęć w oknie Lightbox
    window.Waggle.openLightbox = (url) => {
        const img = document.getElementById('lightbox-img');
        const modal = document.getElementById('lightbox-modal');
        if(img && modal) { img.src = url; modal.style.display = 'flex'; }
    };

    // 3. System wyboru źródła zdjęć (Aparat / Galeria) dla całej aplikacji
    window.Waggle.selectPhotoSource = (onFileSelected) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(5px); -webkit-backdrop-filter:blur(5px); z-index:30000; display:flex; align-items:center; justify-content:center; padding:20px;';
        const card = document.createElement('div');
        card.className = 'card';
        card.style.cssText = 'max-width:320px; padding:25px; text-align:center; display:flex; flex-direction:column; gap:12px; background:var(--panel-bg); border-radius:24px; box-shadow:var(--soft-shadow);';
        const title = document.createElement('h4');
        title.innerText = 'Wybierz zdjęcie 🐾';
        title.style.cssText = 'margin:0 0 10px 0; color:var(--text-color); font-weight:900;';
        
        const cameraBtn = document.createElement('button'); cameraBtn.className = 'btn-main'; cameraBtn.innerText = '📸 ZRÓB ZDJĘCIE (APARAT)';
        const galleryBtn = document.createElement('button'); galleryBtn.className = 'btn-outline'; galleryBtn.innerText = '🖼️ WYBIERZ Z GALERII';
        galleryBtn.style.cssText = 'border-color:var(--secondary); color:var(--secondary);';
        const cancelBtn = document.createElement('button'); cancelBtn.className = 'nav-item'; cancelBtn.innerText = 'Anuluj';
        cancelBtn.style.cssText = 'margin-top:5px; font-weight:800; cursor:pointer; background:none; border:none; color:var(--text-muted);';
        
        card.appendChild(title); card.appendChild(cameraBtn); card.appendChild(galleryBtn); card.appendChild(cancelBtn);
        overlay.appendChild(card); document.body.appendChild(overlay);
        const closeMenu = () => overlay.remove();
        cancelBtn.onclick = closeMenu;
        overlay.onclick = (e) => { if(e.target === overlay) closeMenu(); };
        
        const triggerInput = (useCamera) => {
            closeMenu();
            const input = document.createElement('input');
            input.type = 'file'; input.accept = 'image/*';
            if (useCamera) input.setAttribute('capture', 'environment');
            input.onchange = (e) => { const file = e.target.files[0]; if (file) onFileSelected(file); };
            input.click();
        };
        cameraBtn.onclick = () => triggerInput(true);
        galleryBtn.onclick = () => triggerInput(false);
    };
}

// 4. Modal profilu użytkownika (wyciągnięty z waggleApi.js)
export function renderUserMenuModal(targetUid, name, avatar, isFollowing) {
    const btnText = isFollowing ? 'Od-obserwuj' : '⭐ Obserwuj pieska';
    const border = isFollowing ? '2px solid var(--border-color)' : 'none';
    const bg = isFollowing ? 'transparent' : 'var(--gold)';
    const textCol = isFollowing ? 'var(--text-color)' : '#fff';

    let overlay = document.getElementById('user-menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'user-menu-overlay';
        overlay.className = 'modal-overlay';
        overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px;';
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
        <div class="modal-content" style="background:var(--panel-bg); border-radius:24px; padding:24px; width:100%; max-width:300px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.3); position:relative;">
            <button onclick="this.closest('#user-menu-overlay').style.display='none'" style="position:absolute; top:15px; right:15px; background:none; border:none; font-size:20px; cursor:pointer; color:var(--text-muted);">✕</button>
            <img src="${avatar}" style="width:80px; height:80px; border-radius:50%; object-fit:cover; border:3px solid var(--primary); margin-bottom:15px;">
            <h3 style="margin:0 0 5px 0; color:var(--text-color); font-size:20px; font-weight:900;">${name}</h3>
            <p style="margin:0 0 20px 0; font-size:13px; color:var(--text-muted);">Lokalny spacerowicz 🐾</p>
            
            <div style="display:flex; flex-direction:column; gap:10px;">
                <button onclick="window.Waggle.API.toggleFollow('${targetUid}'); this.closest('#user-menu-overlay').style.display='none'" style="background:${bg}; color:${textCol}; border:${border}; padding:12px; border-radius:12px; font-weight:800; font-size:15px; cursor:pointer; transition:0.2s;">${btnText}</button>
                <button onclick="window.Waggle.openChat('${targetUid}', '${name}'); this.closest('#user-menu-overlay').style.display='none'" style="background:var(--primary); color:white; border:none; padding:12px; border-radius:12px; font-weight:800; font-size:15px; cursor:pointer;">💬 Napisz wiadomość</button>
            </div>
        </div>
    `;
    overlay.style.display = 'flex';
}
