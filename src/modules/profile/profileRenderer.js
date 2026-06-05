// src/modules/profile/profileRenderer.js
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
    
    // 🔥 NOWOŚĆ: Obliczanie znajomych i daty
    const friendsCount = p.following ? p.following.length : 0;
    const friendsEl = document.getElementById('profileFriendsDisplay');
    if(friendsEl) friendsEl.innerText = friendsCount;

    const joinDateEl = document.getElementById('profileJoinDateDisplay');
    if(joinDateEl) {
        if(p.createdAt) {
            const date = p.createdAt.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
            // Wyświetli np. "lis 2025" lub "maj 2026"
            joinDateEl.innerText = date.toLocaleDateString('pl-PL', {month: 'short', year: 'numeric'});
        } else {
            joinDateEl.innerText = "Od początku";
        }
    }

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
