import { state } from './core/state.js';
import { auth, db, fb } from './core/firebase.js';
import { initRouter } from './core/router.js'; 
import { eventBus } from './core/eventBus.js'; 
import { initAuth } from './modules/auth.js';
import { initMap, centerOnMe, centerOnTarget, nearbyPlaces } from './modules/map.js'; 
import { startWalk, stopWalk } from './modules/walk.js';
import { loadPosts, saveCommunityPost, uploadImage, openLightbox, setPostFilter, togglePostLike, openPostComments, addPostComment } from './modules/posts.js';
import { loadInbox, sendMessage, openChat, closeActiveChat, searchUsers } from './modules/chat.js';

window.Waggle = window.Waggle || {};

// TOASTY
window.Waggle.showToast = (msg) => {
    let toast = document.getElementById('waggle-toast');
    if(!toast) {
        toast = document.createElement('div');
        toast.id = 'waggle-toast';
        toast.style.cssText = 'position:fixed; bottom:110px; left:50%; transform:translateX(-50%); background:#2d3436; color:#fff; padding:12px 24px; border-radius:50px; z-index:99999; font-size:14px; font-weight:800; box-shadow:0 10px 20px rgba(0,0,0,0.2); transition:opacity 0.3s; text-align:center; pointer-events:none;';
        document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.style.opacity = '1'; toast.style.display = 'block';
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(()=>toast.style.display='none',300); }, 3000);
}

// POGODA
function fetchWeather(lat, lng) {
    if(!lat || !lng) return;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`)
    .then(r=>r.json()).then(d => {
        const tempEl = document.getElementById('weather-temp');
        if(tempEl) tempEl.innerText = `${Math.round(d.current_weather.temperature)}°C`;
        const contentEl = document.getElementById('weather-forecast-content');
        if(contentEl) {
            let html = `<div style="text-align:center; margin-bottom:15px;"><b style="font-size:20px;">Dziś: ${Math.round(d.current_weather.temperature)}°C</b></div>`;
            html += `<div style="display:flex; justify-content:space-around; border-top:1px solid var(--border-color); padding-top:15px;">`;
            for(let i=0; i<3; i++) {
                const date = new Date(d.daily.time[i]).toLocaleDateString('pl-PL', {weekday: 'short'});
                html += `<div style="text-align:center;"><small>${date}</small><div style="font-size:18px;">🌤️</div><b>${Math.round(d.daily.temperature_2m_max[i])}°</b></div>`;
            }
            html += `</div>`;
            contentEl.innerHTML = html;
        }
    }).catch(e=>console.warn("Weather error"));
}

// STATYSTYKI
function updateStatsUI() {
    if (!state.profile) return; 
    const nameEl = document.getElementById('profileNameDisplay');
    if(nameEl) nameEl.innerText = state.profile.name || "Piesek";
    const walksEl = document.getElementById('statWalks');
    if(walksEl) walksEl.innerText = state.profile.walkCount || 0;
    const distEl = document.getElementById('statDist');
    if(distEl) distEl.innerText = ((state.profile.walkCount || 0) * 1.2).toFixed(1);
    const av = document.getElementById('profileAvatar');
    if(av) av.src = state.profile.avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
}

// BINDINGI
window.Waggle.openChat = openChat;
window.Waggle.closeActiveChat = closeActiveChat;
window.Waggle.centerOnTarget = centerOnTarget;
window.Waggle.openLightbox = openLightbox;
window.Waggle.togglePostLike = togglePostLike;
window.Waggle.openPostComments = openPostComments;
window.Waggle.searchUsers = searchUsers;

// KLIKNIĘCIA
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('close-modal-btn')) e.target.closest('.modal').style.display = 'none';
    if (e.target.closest('#closeChatBtn')) closeActiveChat();
    if (e.target.closest('#centerBtn')) centerOnMe();
    if (e.target.closest('#startWalkBtn')) startWalk();
    if (e.target.closest('#stopWalkBtn')) stopWalk();
    if (e.target.closest('#weatherWidgetBtn')) document.getElementById('weather-modal').style.display = 'flex';

    // Alerty
    if (e.target.closest('#triggerAlertBtn')) document.getElementById('alert-modal').style.display = 'flex';
    if (e.target.closest('#saveAlertBtn')) {
        const text = document.getElementById('alertTextInput').value;
        if (!text.trim() || !state.location.lat) return window.Waggle.showToast("Czekam na GPS...");
        db.collection("alerts").add({ text, lat: state.location.lat, lng: state.location.lng, createdAt: Date.now(), creator: state.user.uid })
        .then(() => {
            db.collection("posts").add({ uid: state.user.uid, author: state.profile?.name || "Piesek", avatar: state.profile?.avatar || "", content: text, isAlert: true, likes: [], commentCount: 0, timestamp: fb.firestore.FieldValue.serverTimestamp() });
            document.getElementById('alert-modal').style.display = 'none';
            window.Waggle.showToast("Zgłoszono! ⚠️");
        });
    }

    // Czat i Posty
    if (e.target.closest('#sendMsgBtn')) {
        const input = document.getElementById('chatInput');
        if (input && input.value.trim()) { sendMessage(input.value.trim()); input.value = ""; }
    }
    if (e.target.closest('#sendCommentBtn')) {
        const input = document.getElementById('commentInput');
        if (input && input.value.trim()) { addPostComment(input.value.trim()); input.value = ""; }
    }

    // Edycja Profilu
    if (e.target.closest('#openEditProfileBtn')) {
        document.getElementById('setupName').value = state.profile?.name || "";
        document.getElementById('setupCity').value = state.profile?.city || "";
        document.getElementById('setupBreed').value = state.profile?.breed || "";
        document.getElementById('profile-setup-modal').style.display = 'flex';
    }
    if (e.target.closest('#saveProfileBtn')) {
        const btn = e.target.closest('#saveProfileBtn');
        const d = { 
            name: document.getElementById('setupName').value.trim(), 
            city: document.getElementById('setupCity').value.trim(), 
            breed: document.getElementById('setupBreed').value 
        };
        btn.disabled = true;
        db.collection("users").doc(state.user.uid).update(d).then(() => {
            btn.disabled = false;
            document.getElementById('profile-setup-modal').style.display = 'none';
            window.Waggle.showToast("Zapisano! ✅");
        });
    }
});

// WIKI I MIEJSCA
window.Waggle.renderPlaces = () => {
    const container = document.getElementById('places-container');
    if (!container) return;
    if (nearbyPlaces.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px;">Szukam parków... 🧭</p>';
        return;
    }
    let html = "";
    nearbyPlaces.forEach(place => {
        html += `<div class="post-card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-left: 4px solid var(--secondary);">
            <div><b>${place.name}</b><br><small>${place.distance.toFixed(1)} km stąd</small></div>
            <button class="btn-outline" style="width:auto; padding:5px 10px;" onclick="window.open('http://googleusercontent.com/maps.google.com/4{place.lat},${place.lng}')">Prowadź</button>
        </div>`;
    });
    container.innerHTML = html;
};

export function initApp() {
    initRouter(); 
    
    // Słuchamy zmian profilu, by odświeżyć UI
    eventBus.on('profileUpdated', () => {
        updateStatsUI();
    });

    // Słuchamy GPS, by pobrać pogodę
    eventBus.on('locationUpdated', (loc) => {
        fetchWeather(loc.lat, loc.lng);
    });

    // Słuchamy zmiany zakładek
    eventBus.on('viewChanged', (view) => {
        if (view === 'community') loadPosts();
        if (view === 'chat') loadInbox();
        if (view === 'places') window.Waggle.renderPlaces();
    });

    initMap();
    loadPosts();
    loadInbox();
    updateStatsUI();
}

initAuth(initApp);
