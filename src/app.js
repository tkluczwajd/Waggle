import { state, clearListeners } from './core/state.js';
import { auth, db, fb } from './core/firebase.js';
import { initAuth } from './modules/auth.js';
import { initMap, centerOnMe, centerOnTarget, nearbyPlaces } from './modules/map.js'; 
import { startWalk, stopWalk } from './modules/walk.js';
import { loadPosts, saveCommunityPost, uploadImage, openLightbox, setPostFilter, togglePostLike, openPostComments, addPostComment } from './modules/posts.js';
import { loadInbox, sendMessage, openChat, closeActiveChat, searchUsers, toggleStado } from './modules/chat.js';

window.Waggle = window.Waggle || {};

// TOAST SYSTEM
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

// EXPOSE TO WINDOW
window.Waggle.openChat = openChat;
window.Waggle.closeActiveChat = closeActiveChat;
window.Waggle.centerOnTarget = centerOnTarget;
window.Waggle.openLightbox = openLightbox;
window.Waggle.deletePost = (id) => db.collection("posts").doc(id).delete();
window.Waggle.togglePostLike = togglePostLike;
window.Waggle.openPostComments = openPostComments;
window.Waggle.searchUsers = searchUsers;
window.Waggle.toggleStado = toggleStado;

// VIEW SWITCHER
function switchView(viewId) {
    clearListeners(); 
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const targetView = document.getElementById('view-' + viewId);
    const targetNav = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    
    if (targetView) targetView.classList.add('active');
    if (targetNav) targetNav.classList.add('active');
    
    if (viewId === 'map' && state.map) setTimeout(() => state.map.invalidateSize(), 300);
    if (viewId === 'community') loadPosts();
    if (viewId === 'chat') loadInbox();
}

// APP INITIALIZATION
export function initApp() {
    loadSettings(); 
    initMap();
    loadPosts();
    loadInbox();
    updateStatsUI();
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
    if (searchableCheckbox) searchableCheckbox.checked = !isGhost;
}

function updateStatsUI() {
    if (!state.profile) return; 
    const nameDisp = document.getElementById('profileNameDisplay');
    if(nameDisp) nameDisp.innerText = state.profile.name || "Piesek";
    
    const walks = state.profile.walkCount || 0;
    const walkEl = document.getElementById('statWalks');
    const distEl = document.getElementById('statDist');
    if(walkEl) walkEl.innerText = walks;
    if(distEl) distEl.innerText = (walks * 1.2).toFixed(1);
    
    const avatarEl = document.getElementById('profileAvatar');
    if(avatarEl) avatarEl.src = state.profile.avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
}

// GLOBAL EVENT LISTENERS
document.addEventListener('click', async (e) => {
    // Modals
    if (e.target.classList.contains('close-modal-btn')) e.target.closest('.modal').style.display = 'none';
    
    // Navigation
    const navItem = e.target.closest('.nav-item');
    if (navItem) switchView(navItem.getAttribute('data-view'));

    // Map Controls
    if (e.target.closest('#centerBtn')) centerOnMe();
    if (e.target.closest('#startWalkBtn')) startWalk();
    if (e.target.closest('#stopWalkBtn')) { stopWalk(); setTimeout(updateStatsUI, 500); }

    // Auth Actions
    if (e.target.closest('#loginBtn')) {
        const email = document.getElementById('authEmail').value;
        const pass = document.getElementById('authPass').value;
        auth.signInWithEmailAndPassword(email, pass).catch(err => alert(err.message));
    }
    
    if (e.target.closest('#registerBtn')) {
        const email = document.getElementById('authEmail').value;
        const pass = document.getElementById('authPass').value;
        auth.createUserWithEmailAndPassword(email, pass).then(() => {
            db.collection("users").doc(auth.currentUser.uid).set({ name: "Nowy Piesek", walkCount: 0 });
        }).catch(err => alert(err.message));
    }

    if (e.target.closest('#logoutBtn')) auth.signOut().then(() => window.location.reload());

    // Settings
    if (e.target.closest('#openSettingsBtn')) document.getElementById('settings-modal').style.display = 'flex';
    if (e.target.closest('#saveSettingsBtn')) {
        const theme = document.getElementById('settingTheme').value;
        const font = document.getElementById('settingFontSize').value;
        const isSearchable = document.getElementById('settingSearchable').checked;

        localStorage.setItem('waggle_theme', theme);
        localStorage.setItem('waggle_font', font);
        localStorage.setItem('waggle_ghost_mode', (!isSearchable).toString());
        
        state.isGhostMode = !isSearchable;
        if (state.isGhostMode && state.user) db.collection("walks").doc(state.user.uid).delete();

        loadSettings();
        document.getElementById('settings-modal').style.display = 'none';
        window.Waggle.showToast("Ustawienia zapisane! 🐾");
    }

    // Community Actions
    if (e.target.closest('#addPostBtn')) document.getElementById('post-creator-modal').style.display = 'flex';
});

// START AUTH
initAuth(initApp);
