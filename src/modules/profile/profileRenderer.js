import { appState as state } from '../../core/state.js';

export function renderProfileStats() {
    if (!state.profile) return; 
    const p = state.profile;
    
    const nameEl = document.getElementById('profileNameDisplay');
    if(nameEl) nameEl.innerText = p.name || "Piesek";
    
    const walks = p.walkCount || 0;
    const walksEl = document.getElementById('statWalks');
    if(walksEl) walksEl.innerText = walks;
    
    const distEl = document.getElementById('statDist');
    if(distEl) distEl.innerText = (walks * 1.2).toFixed(1);
    
    let level = "🌱 Nowik";
    if (walks >= 5) level = "🐕 Spacerowicz";
    if (walks >= 20) level = "🐺 Weteran Osiedla";
    if (walks >= 50) level = "👑 Alfa Stada";
    const lvlEl = document.getElementById('profileLevelDisplay');
    if (lvlEl) lvlEl.innerText = level;

    const av = document.getElementById('profileAvatar');
    if(av) {
        const avatarUrl = (p.avatar && p.avatar.trim() !== "") 
            ? p.avatar 
            : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
        av.src = avatarUrl;
    }
}

export function fillProfileSetupForm() {
    if (!state.profile) return;
    const p = state.profile;
    const setupName = document.getElementById('setupName');
    if(setupName) setupName.value = p.name || "";
    const setupCity = document.getElementById('setupCity');
    if(setupCity) setupCity.value = p.city || "";
    const setupBreed = document.getElementById('setupBreed');
    if(setupBreed) setupBreed.value = p.breed || "";
}
