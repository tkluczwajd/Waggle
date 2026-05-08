import { state, clearListeners } from './core/state.js';
import { auth, db, fb } from './core/firebase.js';
import { initAuth } from './modules/auth.js';
import { initMap, centerOnMe, centerOnTarget, nearbyPlaces } from './modules/map.js'; 
import { startWalk, stopWalk } from './modules/walk.js';
import { loadPosts, saveCommunityPost, uploadImage, openLightbox, setPostFilter, togglePostLike, openPostComments, addPostComment } from './modules/posts.js';
import { loadInbox, sendMessage, openChat, closeActiveChat, searchUsers, toggleStado, sendChatImage } from './modules/chat.js';

window.Waggle = window.Waggle || {};

// --- TOAST SYSTEM ---
window.Waggle.showToast = (msg) => {
    let toast = document.getElementById('waggle-toast');
    if(!toast) {
        toast = document.createElement('div');
        toast.id = 'waggle-toast';
        toast.style.cssText = 'position:fixed; bottom:110px; left:50%; transform:translateX(-50%); background:#2d3436; color:#fff; padding:12px 24px; border-radius:50px; z-index:99999; font-size:14px; font-weight:800; box-shadow:0 10px 20px rgba(0,0,0,0.2); transition:opacity 0.3s; text-align:center; white-space:nowrap; pointer-events:none;';
        document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.style.opacity = '1'; toast.style.display = 'block';
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(()=>toast.style.display='none',300); }, 3500);
}

// --- POGODA ---
function getWeatherIcon(code) {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 55 || (code >= 61 && code <= 65) || (code >= 80 && code <= 82)) return '🌧️';
    if (code <= 77) return '❄️';
    if (code >= 95) return '⛈️';
    return '🌡️';
}

function fetchWeather() {
    if(state.location && state.location.lat) {
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${state.location.lat}&longitude=${state.location.lng}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`)
        .then(r=>r.json()).then(d => {
            const tempEl = document.getElementById('weather-temp');
            if(tempEl) tempEl.innerText = `${Math.round(d.current_weather.temperature)}°C`;
            const contentEl = document.getElementById('weather-forecast-content');
            if(contentEl) {
                let forecastHtml = `<div style="text-align:center; margin-bottom:15px;"><b style="font-size:20px;">Dziś: ${Math.round(d.current_weather.temperature)}°C ${getWeatherIcon(d.current_weather.weathercode)}</b></div>`;
                forecastHtml += `<div style="display:flex; justify-content:space-around; border-top:1px solid var(--border-color); padding-top:15px;">`;
                for(let i=0; i<3; i++) {
                    const date = new Date(d.daily.time[i]).toLocaleDateString('pl-PL', {weekday: 'short'});
                    forecastHtml += `<div style="text-align:center;"><div style="font-size:11px;">${date}</div><div style="font-size:24px;">${getWeatherIcon(d.daily.weathercode[i])}</div><div>${Math.round(d.daily.temperature_2m_max[i])}°</div></div>`;
                }
                forecastHtml += `</div>`;
                contentEl.innerHTML = forecastHtml;
            }
        }).catch(e=>console.warn("Weather error:", e));
    } else { setTimeout(fetchWeather, 3000); }
}

// --- WIKI ---
function renderWiki(tab) {
    const container = document.getElementById('wiki-content');
    if (!container) return;
    container.innerHTML = '<p style="text-align:center; padding:20px;">Węszenie... 🐾</p>';
    db.collection("wiki").where("category", "==", tab).onSnapshot(snap => {
        let html = "";
        snap.forEach(doc => {
            const item = doc.data();
            const id = doc.id;
            const hasLiked = item.likes && item.likes.includes(state.user.uid);
            html += `<div class="post-card" style="border-left: 4px solid var(--secondary); padding:15px; margin-bottom:15px;">
                <b style="font-size: 17px;">${item.title || item.name}</b><br>
                <p style="margin-top:10px; font-size:14px; color:var(--text-muted);">${item.desc}</p>
                <span style="font-size:13px; cursor:pointer; color:${hasLiked ? 'var(--danger)' : 'var(--text-muted)'}" onclick="Waggle.likeWiki('${id}')">${hasLiked ? '❤️' : '🤍'} ${item.likes ? item.likes.length : 0}</span>
            </div>`;
        });
        container.innerHTML = html || '<p style="text-align:center;">Brak wpisów.</p>';
    });
}
window.Waggle.likeWiki = (id) => {
    const ref = db.collection("wiki").doc(id);
    ref.get().then(doc => {
        const likes = doc.data().likes || [];
        if (likes.includes(state.user.uid)) ref.update({ likes: fb.firestore.FieldValue.arrayRemove(state.user.uid) });
        else ref.update({ likes: fb.firestore.FieldValue.arrayUnion(state.user.uid) });
    });
};

// --- MIEJSCA ---
window.Waggle.renderPlaces = () => {
    const container = document.getElementById('places-container');
    if (!container) return;
    if (nearbyPlaces.length === 0) { container.innerHTML = '<p style="text-align:center; padding:20px;">Szukam... 🧭</p>'; return; }
    let html = "";
    nearbyPlaces.forEach(place => {
        html += `<div class="post-card" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; padding:15px; border-left:4px solid var(--secondary);">
            <div><b>${place.name}</b><br><small>${place.distance.toFixed(1)} km</small></div>
            <button class="btn-outline" style="width:auto; padding:8px;" onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}', '_blank')">🧭</button>
        </div>`;
    });
    container.innerHTML = html;
};

// --- GLOBALNE ---
window.Waggle.openChat = openChat;
window.Waggle.closeActiveChat = closeActiveChat;
window.Waggle.centerOnTarget = centerOnTarget;
window.Waggle.openLightbox = openLightbox;
window.Waggle.togglePostLike = togglePostLike;
window.Waggle.openPostComments = openPostComments;
window.Waggle.searchUsers = searchUsers;
window.Waggle.toggleStado = toggleStado;

function switchView(viewId) {
    clearListeners(); 
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const tv = document.getElementById('view-' + viewId);
    if (tv) tv.classList.add('active');
    const nb = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if (nb) nb.classList.add('active');
    if (viewId === 'map' && state.map) setTimeout(() => state.map.invalidateSize(), 300);
    if (viewId === 'community') loadPosts();
    if (viewId === 'wiki') renderWiki('rasy');
    if (viewId === 'places') window.Waggle.renderPlaces();
}

function updateStatsUI() {
    if (!state.profile) return; 
    document.getElementById('profileNameDisplay').innerText = state.profile.name || "Piesek";
    const walks = state.profile.walkCount || 0;
    document.getElementById('statWalks').innerText = walks;
    document.getElementById('statDist').innerText = (walks * 1.2).toFixed(1);
    const av = document.getElementById('profileAvatar');
    if(av) av.src = state.profile.avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
}

function loadSettings() {
    const theme = localStorage.getItem('waggle_theme') || 'light';
    if (theme === 'dark') document.body.classList.add('dark-mode');
    state.isGhostMode = localStorage.getItem('waggle_ghost_mode') === 'true';
    const sc = document.getElementById('settingSearchable');
    if (sc) sc.checked = !state.isGhostMode;
}

let pendingImageFile = null;

export function initApp() {
    loadSettings(); initMap(); loadPosts(); loadInbox(); updateStatsUI(); fetchWeather();
}

// LISTENERS
document.addEventListener('input', (e) => { if (e.target.id === 'userSearchInput') window.Waggle.searchUsers(e.target.value); });
document.addEventListener('change', (e) => {
    if(e.target.id === 'postImageInput') {
        pendingImageFile = e.target.files[0];
        if(pendingImageFile) {
            const r = new FileReader(); r.onload = (ex) => { document.getElementById('post-image-preview').src = ex.target.result; document.getElementById('post-image-preview-container').style.display = 'block'; }; r.readAsDataURL(pendingImageFile);
        }
    }
    if (e.target.id === 'isEventCheckbox') document.getElementById('eventDetailsInput').style.display = e.target.checked ? 'block' : 'none';
});

document.addEventListener('click', async (e) => {
    const navItem = e.target.closest('.nav-item');
    if (navItem) switchView(navItem.getAttribute('data-view'));
    if (e.target.classList.contains('close-modal-btn')) e.target.closest('.modal').style.display = 'none';

    // CZAT
    if (e.target.closest('#closeChatBtn')) closeActiveChat();
    if (e.target.closest('#sendMsgBtn')) { const i = document.getElementById('chatInput'); if (i && i.value.trim()) { sendMessage(i.value.trim()); i.value = ""; } }
    if (e.target.closest('#chatAddPhotoBtn')) { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = (ev) => sendChatImage(ev.target.files[0]); i.click(); }
    if (e.target.closest('#chatTabInbox')) { e.target.style.background = 'white'; document.getElementById('chatTabSearch').style.background = 'transparent'; document.getElementById('userSearchInput').style.display = 'none'; loadInbox(); }
    if (e.target.closest('#chatTabSearch')) { e.target.style.background = 'white'; document.getElementById('chatTabInbox').style.background = 'transparent'; document.getElementById('userSearchInput').style.display = 'block'; searchUsers(''); }

    // MAPA
    if (e.target.closest('#centerBtn')) centerOnMe();
    if (e.target.closest('#startWalkBtn')) startWalk();
    if (e.target.closest('#stopWalkBtn')) { stopWalk(); setTimeout(updateStatsUI, 500); }
    if (e.target.closest('#weatherWidgetBtn')) document.getElementById('weather-modal').style.display = 'flex';
    if (e.target.closest('#triggerAlertBtn')) document.getElementById('alert-modal').style.display = 'flex';
    if (e.target.closest('#saveAlertBtn')) {
        const text = document.getElementById('alertTextInput').value;
        if (text && state.location.lat) { db.collection("alerts").add({ text, lat: state.location.lat, lng: state.location.lng, createdAt: Date.now(), creator: state.user.uid }).then(() => { document.getElementById('alert-modal').style.display = 'none'; window.Waggle.showToast("Zgłoszono! ⚠️"); }); }
    }

    // SPOŁECZNOŚĆ
    if (e.target.closest('#addPostBtn')) document.getElementById('post-creator-modal').style.display = 'flex';
    if (e.target.closest('#publishPostBtn')) {
        const text = document.getElementById('postContent').value.trim();
        const isEvent = document.getElementById('isEventCheckbox').checked;
        const date = document.getElementById('eventDate').value;
        try { let url = null; if(pendingImageFile) url = await uploadImage(pendingImageFile); await saveCommunityPost(text, url, isEvent, date); document.getElementById('post-creator-modal').style.display = 'none'; window.Waggle.showToast("Gotowe! 🎉"); } catch(err) { window.Waggle.showToast("Błąd!"); }
    }
    if (e.target.closest('#sendCommentBtn')) { const i = document.getElementById('commentInput'); if (i && i.value.trim()) { addPostComment(i.value.trim()); i.value = ""; } }

    // WIKI
    if (e.target.classList.contains('wiki-tab-btn')) { document.querySelectorAll('.wiki-tab-btn').forEach(b => b.classList.remove('active')); e.target.classList.add('active'); renderWiki(e.target.getAttribute('data-tab')); }

    // USTAWIENIA
    if (e.target.closest('#openSettingsBtn')) document.getElementById('settings-modal').style.display = 'flex';
    if (e.target.closest('#saveSettingsBtn')) {
        const isSearchable = document.getElementById('settingSearchable').checked;
        localStorage.setItem('waggle_ghost_mode', (!isSearchable).toString());
        state.isGhostMode = !isSearchable;
        if (state.isGhostMode && state.user) db.collection("walks").doc(state.user.uid).delete();
        loadSettings(); document.getElementById('settings-modal').style.display = 'none';
        window.Waggle.showToast("Zapisano!");
    }
    if (e.target.closest('#openEditProfileBtn')) document.getElementById('profile-setup-modal').style.display = 'flex';
    if (e.target.closest('#saveProfileBtn')) {
        const d = { name: document.getElementById('setupName').value.trim(), city: document.getElementById('setupCity').value.trim(), breed: document.getElementById('setupBreed').value };
        const ai = document.getElementById('setupAvatarInput');
        if (ai.files.length > 0) { uploadImage(ai.files[0]).then(url => { d.avatar = url; db.collection("users").doc(state.user.uid).update(d); }); } else { db.collection("users").doc(state.user.uid).update(d); }
        document.getElementById('profile-setup-modal').style.display = 'none';
    }

    // AUTH
    if (e.target.closest('#loginBtn')) auth.signInWithEmailAndPassword(document.getElementById('authEmail').value, document.getElementById('authPass').value);
    if (e.target.closest('#logoutBtn')) auth.signOut().then(() => window.location.reload());
});

initAuth(initApp);