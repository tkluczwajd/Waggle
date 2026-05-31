// src/ui/uiHelpers.js
import { mapManager } from '../modules/map/mapManager.js';
import { appState as state } from '../core/state.js';
import { updateNotificationBtnUI } from '../services/notificationService.js';

export function updateStatsUI() {
    if (!state.profile) return; const p = state.profile;
    // 🔥 AKTUALIZACJA KARTOTEKI MEDYCZNEJ (Ekran SAFE)
// 🔥 AKTUALIZACJA KARTOTEKI MEDYCZNEJ (Ekran SAFE)
    const chipDisplay = document.getElementById('displayChip');
    if (chipDisplay) {
        const hasSafeData = p.chip || p.allergies || p.meds || p.vet;
        const displayBlock = document.getElementById('safe-data-display');
        const fallbackText = document.getElementById('safe-data-fallback');
        const openBtn = document.getElementById('openSafeSetupBtn');

        if (hasSafeData) {
            if (displayBlock) displayBlock.style.display = 'block';
            if (fallbackText) fallbackText.style.display = 'none';
            if (openBtn) openBtn.innerText = "✏️ EDYTUJ DANE RATUNKOWE";
            
            if (document.getElementById('displayChip')) document.getElementById('displayChip').innerText = p.chip || "Brak danych";
            if (document.getElementById('displayAllergies')) document.getElementById('displayAllergies').innerText = p.allergies || "Brak";
            if (document.getElementById('displayMeds')) document.getElementById('displayMeds').innerText = p.meds || "Brak";
            if (document.getElementById('displayVet')) document.getElementById('displayVet').innerText = p.vet || "Brak kontaktu";
            
            // 👇 NOWY FRAGMENT WKLEJONY TUTAJ (PRZED ELSE) 👇
            if (p.safeId) {
                let safeLinkEl = document.getElementById('displaySafeLink');
                if (!safeLinkEl) {
                    safeLinkEl = document.createElement('div');
                    safeLinkEl.id = 'displaySafeLink';
                    safeLinkEl.style.marginTop = '10px';
                    safeLinkEl.style.paddingTop = '10px';
                    safeLinkEl.style.borderTop = '1px dashed var(--border-color)';
                    displayBlock.appendChild(safeLinkEl);
                }
                safeLinkEl.innerHTML = `<b>🔗 Mój publiczny link SAFE:</b> <br><span style="color: var(--primary); font-weight: 800; font-size: 14px;">joinwaggle.com/safe.html?id=${p.safeId}</span>`;
            }

        } else {
            // 👆 TUTAJ JEST ELSE
            if (displayBlock) displayBlock.style.display = 'none';
            if (fallbackText) fallbackText.style.display = 'block';
            if (openBtn) openBtn.innerText = "Wypełnij dane ratunkowe";
        }
    }
    const nameEl = document.getElementById('profileNameDisplay'); if(nameEl) nameEl.innerText = p.name || "Piesek";
    
    // 👇 NOWOŚĆ: Rysowanie Miasta i Rasy na nowym ekranie HOME
    const cityDisplay = document.getElementById('profileCityDisplay'); if(cityDisplay) cityDisplay.innerText = p.city || "Nie podano";
    const breedDisplay = document.getElementById('profileBreedDisplay'); if(breedDisplay) breedDisplay.innerText = p.breed || "Nie podano";
    
    const walksEl = document.getElementById('statWalks'); if(walksEl) walksEl.innerText = p.walkCount || 0;
    const distEl = document.getElementById('statDist'); if(distEl) distEl.innerText = ((p.walkCount || 0) * 1.2).toFixed(1);
    const breedInput = document.getElementById('setupBreed'); if(breedInput) breedInput.value = state.profile.breed || "";
    const cityInput = document.getElementById('setupCity'); if(cityInput) cityInput.value = state.profile.city || "";
    let lvl = "🌱 Nowik";
    if (p.walkCount >= 5) lvl = "🐕 Spacerowicz"; if (p.walkCount >= 20) lvl = "🐺 Weteran Osiedla"; if (p.walkCount >= 50) lvl = "👑 Alfa Stada";
    const lvlEl = document.getElementById('profileLevelDisplay'); if (lvlEl) lvlEl.innerText = lvl;
    const av = document.getElementById('profileAvatar'); if(av) av.src = (p.avatar && p.avatar.trim() !== "") ? p.avatar : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
    
    // 🔥 TUTAJ DODAJEMY AKTUALIZACJĘ PRZYCISKU POWIADOMIEŃ
    updateNotificationBtnUI(p.pushEnabled === true);

    const tempEl = document.getElementById('weather-temp');
    if (tempEl && state.weather) tempEl.innerHTML = `${state.weather.icon} ${state.weather.temp}°C`;
    if(state.location.lat && state.location.lng) updateUserMarker(state.location.lat, state.location.lng);
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
