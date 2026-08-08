// src/ui/uiHelpers.js
import { mapManager } from '../modules/map/mapManager.js';
import { appState as state } from '../core/state.js';
import { updateNotificationBtnUI } from '../services/notificationService.js';

export function updateStatsUI() {
    if (!state.profile) return; 
    const p = state.profile;
    
    // --- ŁADOWANIE KARTY S.A.F.E. NA EKRAN ---
    const safeFallback = document.getElementById('safe-data-fallback');
    const safeDisplay = document.getElementById('safe-data-display');
    const safeCardContent = document.getElementById('safe-card-content');
    
    const hasSafeData = Boolean(p.chip || p.allergies || p.meds || p.weight || p.phone || p.vet);

    if (safeFallback && safeDisplay) {
        safeFallback.style.display = hasSafeData ? 'none' : 'block';
        safeDisplay.style.display = hasSafeData ? 'block' : 'none';
    }

    if (hasSafeData) {
        if (document.getElementById('displaySafeWeight')) document.getElementById('displaySafeWeight').innerText = p.weight ? p.weight + " kg" : "Brak";
        if (document.getElementById('displaySafeChip')) document.getElementById('displaySafeChip').innerText = p.chip || "Brak";
        if (document.getElementById('displaySafeAllergies')) document.getElementById('displaySafeAllergies').innerText = p.allergies || "Brak";
        if (document.getElementById('displaySafeMeds')) document.getElementById('displaySafeMeds').innerText = p.meds || "Brak";
        if (document.getElementById('displaySafePhone')) document.getElementById('displaySafePhone').innerText = p.phone || p.vet || "Brak";
        if (document.getElementById('displaySafeNotes')) document.getElementById('displaySafeNotes').innerText = p.notes || "-";
    }
    
    // --- STATYSTYKI, DYSTANS I RANGI ---
    const nameEl = document.getElementById('profileNameDisplay'); if(nameEl) nameEl.innerText = p.name || "Piesek";
    const cityDisplay = document.getElementById('profileCityDisplay'); if(cityDisplay) cityDisplay.innerText = p.city || "Nie podano";
    const breedDisplay = document.getElementById('profileBreedDisplay'); if(breedDisplay) breedDisplay.innerText = p.breed || "Nie podano";
    
    const walksCount = p.walkCount || 0;
    // Pobieramy prawdziwy dystans z bazy (lub estymujemy dla starych kont)
    const distTotal = Number(p.totalDistance || 0); 
    
    const walksEl = document.getElementById('statWalks'); if(walksEl) walksEl.innerText = walksCount;
    const distEl = document.getElementById('statDist'); if(distEl) distEl.innerText = distTotal.toFixed(1);
    
    const breedInput = document.getElementById('setupBreed'); if(breedInput) breedInput.value = state.profile.breed || "";
    const cityInput = document.getElementById('setupCity'); if(cityInput) cityInput.value = state.profile.city || "";
    
    // 🔥 NOWY SYSTEM RANG Z KOLORAMI
    let lvl = "🌱 Nowik";
    let lvlColor = "var(--text-muted)";
    
    if (distTotal >= 10) { lvl = "🐕 Wędrowiec"; lvlColor = "#2ed573"; } 
    if (distTotal >= 50) { lvl = "🐺 Tropiciel"; lvlColor = "#1e90ff"; } 
    if (distTotal >= 150) { lvl = "🏅 Weteran Osiedla"; lvlColor = "#9c88ff"; } 
    if (distTotal >= 300) { lvl = "👑 Alfa Stada"; lvlColor = "var(--gold)"; } 
    
    const lvlEl = document.getElementById('profileLevelDisplay'); 
    if (lvlEl) { 
        lvlEl.innerText = lvl;
        lvlEl.style.color = lvlColor;
    }
    
    const av = document.getElementById('profileAvatar'); if(av) av.src = (p.avatar && p.avatar.trim() !== "") ? p.avatar : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
    
    updateNotificationBtnUI(p.pushEnabled === true);

    const tempEl = document.getElementById('weather-temp');
    if (tempEl && state.weather) tempEl.innerHTML = `${state.weather.icon} ${state.weather.temp}°C`;
    if(state.location.lat && state.location.lng) updateUserMarker(state.location.lat, state.location.lng);

    setTimeout(() => {
        const linkInput = document.getElementById('safe-public-link-input');
        if (linkInput) {
            let currentUid = null;
            if (state.user && state.user.uid) currentUid = state.user.uid;
            else if (localStorage.getItem('activeDogId')) currentUid = localStorage.getItem('activeDogId');
            else if (localStorage.getItem('uid')) currentUid = localStorage.getItem('uid');
            
            linkInput.value = currentUid ? `https://joinwaggle.com/safe.html?id=${currentUid}` : 'Brak ID psa';
        }
    }, 300);
}

export function updateUserMarker(lat, lng) {
    const L = window.L; if (!L) return;
    if (state.isHiddenMode) {
        if (window.userMarker) { mapManager.map.removeLayer(window.userMarker); window.userMarker = null; }
        return; 
    }
    let displayLat = lat; let displayLng = lng;
    if (state.isGhostMode) {
        if (!state.ghostOffset) { state.ghostOffset = { lat: (Math.random() - 0.5) * 0.002, lng: (Math.random() - 0.5) * 0.002 }; }
        displayLat += state.ghostOffset.lat; displayLng += state.ghostOffset.lng;
    } else { state.ghostOffset = null; }
    const avatarSrc = state.profile?.avatar;
    let iconHtml = avatarSrc ? 
        `<div style="width:38px; height:38px; border-radius:50%; border:3px solid var(--secondary); box-shadow:0 0 15px rgba(0,0,0,0.3); overflow:hidden; background:white;"><img src="${avatarSrc}" style="width:100%; height:100%; object-fit:cover;"></div>` : 
        `<div style="background:#34ace0; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(0,0,0,0.3);"></div>`;
    const icon = L.divIcon({ className: '', html: iconHtml, iconSize: avatarSrc ? [38,38] : [20,20] });
    if (!window.userMarker) { window.userMarker = L.marker([displayLat, displayLng], { icon }); mapManager.addMarkerToLayer('user', window.userMarker); }
    else { window.userMarker.setLatLng([displayLat, displayLng]); window.userMarker.setIcon(icon); }
}

export function loadSettings() {
    const theme = localStorage.getItem('waggle_theme') || 'light';
    const font = localStorage.getItem('waggle_font') || '14px';
    if (theme === 'dark') document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');
    document.body.style.fontSize = font;
    document.documentElement.style.setProperty('--base-font-size', font);
    state.isGhostMode = localStorage.getItem('waggle_ghost_mode') === 'true';
    state.isHiddenMode = localStorage.getItem('waggle_hidden_mode') === 'true';
    const ghostInput = document.getElementById('settingGhostMode') || document.getElementById('settingSearchable');
    const hiddenInput = document.getElementById('settingHiddenMode') || document.getElementById('settingHidden');
    if (ghostInput) ghostInput.checked = state.isGhostMode;
    if (hiddenInput) hiddenInput.checked = state.isHiddenMode;
    if(document.getElementById('settingFontSize')) document.getElementById('settingFontSize').value = font;
    if(document.getElementById('settingTheme')) document.getElementById('settingTheme').value = theme;
}

window.Waggle.openUserMenu = (uid, name, avatar) => {
    const isMe = state.user && state.user.uid === uid;
    
    let modal = document.getElementById('user-action-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'user-action-modal';
        modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:99999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);";
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
        document.body.appendChild(modal);
    }

    const safeAvatar = avatar && avatar.trim() !== "" && avatar !== "undefined" 
        ? avatar 
        : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';

    modal.innerHTML = `
        <div style="background:white; width:85%; max-width:320px; border-radius:28px; padding:35px 20px 25px 20px; text-align:center; position:relative; box-shadow:0 20px 40px rgba(0,0,0,0.2);">
            <button class="close-modal-btn" onclick="document.getElementById('user-action-modal').style.display='none'" style="position:absolute; top:15px; right:15px; background:var(--bg-color); border:none; width:32px; height:32px; border-radius:50%; font-size:18px; color:var(--text-muted); cursor:pointer; display:flex; align-items:center; justify-content:center;">✕</button>
            
            <img src="${safeAvatar}" style="width:110px; height:110px; border-radius:50%; object-fit:cover; border:4px solid white; box-shadow:0 10px 25px rgba(52, 172, 224, 0.2); margin-bottom:15px;">
            <h3 style="margin:0 0 5px 0; color:var(--text-color); font-size:24px; font-weight:900; letter-spacing:-0.5px;">${name}</h3>
            <p style="color:var(--text-muted); margin:0 0 25px 0; font-size:14px; font-weight:700;">W okolicy 📍</p>
            
            ${!isMe ? `
            <button onclick="window.Waggle.startDirectChat('${uid}', '${name}', '${safeAvatar}')" style="background:linear-gradient(135deg, var(--primary), #0984e3); color:white; border:none; padding:16px; border-radius:100px; width:100%; font-weight:900; font-size:15px; display:flex; align-items:center; justify-content:center; gap:10px; cursor:pointer; box-shadow:0 8px 20px rgba(52, 172, 224, 0.4); transition:transform 0.2s;">
                <span style="font-size:20px;">💬</span> NAPISZ WIADOMOŚĆ
            </button>
            ` : `
            <div style="background:#f4f6f9; color:var(--text-muted); padding:16px; border-radius:100px; font-weight:800; font-size:14px;">
                To jest Twój profil 🐾
            </div>
            `}
        </div>
    `;
    
    modal.style.display = 'flex';
};

window.Waggle.startDirectChat = (uid, name, avatar) => {
    document.getElementById('user-action-modal').style.display = 'none';
    if (typeof window.Waggle.openChat === 'function') {
        window.Waggle.openChat(uid, name, avatar);
    } else {
        alert(`Uruchamiam czat z: ${name} 💬!`);
    }
};

window.Waggle = window.Waggle || {};
window.Waggle.copySafePublicLink = () => {
    const linkInput = document.getElementById('safe-public-link-input');
    if (linkInput && linkInput.value) {
        navigator.clipboard.writeText(linkInput.value).then(() => {
            if (window.Waggle && window.Waggle.showToast) {
                window.Waggle.showToast("🔗 Skopiowano link ratunkowy!");
            }
        }).catch(err => alert('Nie udało się skopiować linku.'));
    }
};
