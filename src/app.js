import { state, clearListeners } from './core/state.js';
import { auth, db, fb } from './core/firebase.js';
import { initAuth } from './modules/auth.js';
import { initMap, centerOnMe, centerOnTarget, nearbyPlaces } from './modules/map.js'; 
import { startWalk, stopWalk } from './modules/walk.js';
import { loadPosts, saveCommunityPost, uploadImage, openLightbox, setPostFilter, togglePostLike, openPostComments, addPostComment } from './modules/posts.js';
import { loadInbox, sendMessage, openChat, closeActiveChat, searchUsers, toggleStado } from './modules/chat.js';

window.Waggle = window.Waggle || {};
window.Waggle.showToast = (msg) => {
    let toast = document.getElementById('waggle-toast');
    if(!toast) {
        toast = document.createElement('div');
        toast.id = 'waggle-toast';
        toast.style.cssText = 'position:fixed; bottom:110px; left:50%; transform:translateX(-50%); background:#2d3436; color:#fff; padding:12px 24px; border-radius:50px; z-index:99999; font-size:14px; font-weight:800; box-shadow:0 10px 20px rgba(0,0,0,0.2); transition:opacity 0.3s; text-align:center; white-space:nowrap; pointer-events:none;';
        document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 3000);
};

window.Waggle.openChat = openChat;
window.Waggle.centerOnTarget = centerOnTarget;
window.Waggle.toggleStado = toggleStado;

// Funkcja pokazująca szybki modal użytkownika po kliknięciu w avatar na mapie
window.Waggle.showUserModal = (userData) => {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="card" style="width:280px; text-align:center; padding:25px;">
            <div style="width:80px; height:80px; margin:0 auto 15px; border-radius:50%; border:3px solid var(--primary); padding:3px;">
                <img src="${userData.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150'}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">
            </div>
            <h3 style="margin:0;">${userData.name}</h3>
            <p style="color:var(--text-muted); font-size:13px; margin-top:5px;">${userData.status || 'Na spacerze'}</p>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:20px;">
                <button class="btn-main" id="modalChatBtn" style="padding:10px; font-size:12px;">NAPISZ</button>
                <button class="btn-outline" id="modalStadoBtn" style="padding:10px; font-size:12px;">STADO</button>
            </div>
            <button class="btn-outline" onclick="this.closest('.modal').remove()" style="margin-top:10px; border:none;">Zamknij</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('modalChatBtn').onclick = () => {
        modal.remove();
        openChat(userData.uid, userData.name);
    };
    document.getElementById('modalStadoBtn').onclick = () => {
        toggleStado(userData.uid);
        modal.remove();
    };
};

document.addEventListener('DOMContentLoaded', () => {
    initAuth(() => {
        loadSettings();
        initApp();
    });
});

function initApp() {
    initMap();
    loadPosts();
    loadInbox();
    updateStatsUI();

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.getAttribute('data-view');
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(view).classList.add('active');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
        });
    });

    document.addEventListener('click', (e) => {
        if (e.target.id === 'startWalkBtn') startWalk();
        if (e.target.id === 'stopWalkBtn') stopWalk();
        if (e.target.id === 'centerMeBtn') centerOnMe();
        if (e.target.id === 'openPostCreatorBtn') document.getElementById('post-modal').style.display = 'flex';
        if (e.target.id === 'closePostModal') document.getElementById('post-modal').style.display = 'none';
        if (e.target.id === 'openSettingsBtn') document.getElementById('settings-modal').style.display = 'flex';
        if (e.target.id === 'closeSettingsBtn') document.getElementById('settings-modal').style.display = 'none';
        if (e.target.id === 'openSearchBtn') document.getElementById('search-modal').style.display = 'flex';
        if (e.target.id === 'closeSearchBtn') document.getElementById('search-modal').style.display = 'none';
        if (e.target.id === 'logoutBtn') auth.signOut().then(() => window.location.reload());
        
        // Zapisywanie ustawień
        if (e.target.id === 'saveSettingsBtn') {
            const theme = document.getElementById('settingTheme').value;
            const font = document.getElementById('settingFontSize').value;
            const isSearchable = document.getElementById('settingSearchable').checked;

            localStorage.setItem('waggle_theme', theme);
            localStorage.setItem('waggle_font', font);
            localStorage.setItem('waggle_ghost_mode', (!isSearchable).toString());
            
            state.isGhostMode = !isSearchable;
            
            // Jeśli tryb ducha włączony, usuwamy nas z mapy natychmiast
            if (state.isGhostMode && state.user) {
                db.collection("walks").doc(state.user.uid).delete();
            }

            loadSettings();
            document.getElementById('settings-modal').style.display = 'none';
            window.Waggle.showToast("Ustawienia zapisane! 🐾");
        }
    });

    const searchInput = document.getElementById('userSearchInput');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => searchUsers(e.target.value));
    }
}

function loadSettings() {
    const theme = localStorage.getItem('waggle_theme') || 'light';
    const font = localStorage.getItem('waggle_font') || '14px';
    const isGhost = localStorage.getItem('waggle_ghost_mode') === 'true';

    if (theme === 'dark') document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
    
    document.documentElement.style.setProperty('--base-font-size', font);
    
    state.isGhostMode = isGhost;
    const searchableCheckbox = document.getElementById('settingSearchable');
    if (searchableCheckbox) {
        searchableCheckbox.checked = !isGhost; 
    }
}

function updateStatsUI() {
    if (!state.profile) return; 
    document.getElementById('profileNameDisplay').innerText = state.profile.name || "Piesek";
    const walks = state.profile.walkCount || 0;
    document.getElementById('statWalks').innerText = walks;
    document.getElementById('statDist').innerText = (walks * 1.2).toFixed(1);
    
    let level = "🌱 Nowik";
    if (walks >= 5) level = "🐕 Spacerowicz";
    if (walks >= 20) level = "🐺 Weteran Osiedla";
    if (walks >= 50) level = "👑 Alfa Stada";
    const lvlEl = document.getElementById('profileLevelDisplay');
    if (lvlEl) lvlEl.innerText = level;

    const avatarEl = document.getElementById('profileAvatar');
    if(avatarEl) avatarEl.src = state.profile.avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
}
