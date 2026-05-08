import { state, clearListeners } from './core/state.js';
import { auth, db, fb } from './core/firebase.js';
import { initAuth } from './modules/auth.js';
import { initMap, centerOnMe, centerOnTarget } from './modules/map.js'; 
import { startWalk, stopWalk } from './modules/walk.js';
import { loadPosts, saveCommunityPost, uploadImage, openLightbox, setPostFilter, togglePostLike, openPostComments, addPostComment } from './modules/posts.js';
import { loadInbox, sendMessage, openChat, closeActiveChat, searchUsers, toggleStado, sendChatImage } from './modules/chat.js';

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

// BINDING FUNCTIONS TO WINDOW
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
    
    const targetView = document.getElementById('view-' + viewId);
    if (targetView) targetView.classList.add('active');
    
    const navBtn = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if (navBtn) navBtn.classList.add('active');
    
    if (viewId === 'map' && state.map) setTimeout(() => state.map.invalidateSize(), 300);
    if (viewId === 'community') loadPosts();
    if (viewId === 'chat') {
        document.getElementById('chatTabInbox').click();
    }
    if (viewId === 'wiki') renderWiki('rasy');
}

function renderWiki(tab) {
    const container = document.getElementById('wiki-content');
    if (!container) return;
    container.innerHTML = '<p style="text-align:center; padding:20px;">Węszenie w bazie danych... 🐾</p>';

    db.collection("wiki").where("category", "==", tab).onSnapshot(snap => {
        let html = "";
        snap.forEach(doc => {
            const item = doc.data();
            const id = doc.id;
            const likesCount = item.likes ? item.likes.length : 0;
            const hasLiked = item.likes && item.likes.includes(state.user.uid);

            let tagsHtml = (item.tags || []).map(tag => `<span style="display:inline-block; background:var(--panel-bg); color:var(--text-color); font-size:10px; font-weight:800; padding:3px 8px; border-radius:10px; margin-right:5px; margin-top:5px; border: 1px solid var(--border-color);">${tag}</span>`).join("");

            html += `
                <div class="post-card" style="border-left: 4px solid var(--secondary); padding-left: 15px; margin-bottom: 15px;">
                    <b style="font-size: 17px;">${item.title || item.name}</b><br>
                    ${tagsHtml}
                    <p style="margin-top:10px; font-weight:600; font-size:14px; color:var(--text-muted);">${item.desc}</p>
                    <div style="border-top: 1px solid var(--border-color); margin-top: 15px; padding-top: 10px;">
                        <span style="font-size:13px; cursor:pointer; font-weight:800; color: ${hasLiked ? 'var(--danger)' : 'var(--text-muted)'}" onclick="Waggle.likeWiki('${id}')">
                            ${hasLiked ? '❤️' : '🤍'} ${likesCount}
                        </span>
                    </div>
                </div>`;
        });
        container.innerHTML = html || '<p style="text-align:center; padding:20px;">Brak wpisów w tej kategorii.</p>';
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

function updateStatsUI() {
    if (!state.profile) return; 
    const nDisp = document.getElementById('profileNameDisplay');
    if(nDisp) nDisp.innerText = state.profile.name || "Piesek";
    const walks = state.profile.walkCount || 0;
    const wEl = document.getElementById('statWalks');
    const dEl = document.getElementById('statDist');
    if(wEl) wEl.innerText = walks;
    if(dEl) dEl.innerText = (walks * 1.2).toFixed(1);
    const av = document.getElementById('profileAvatar');
    if(av) av.src = state.profile.avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
}

function loadSettings() {
    const theme = localStorage.getItem('waggle_theme') || 'light';
    if (theme === 'dark') document.body.classList.add('dark-mode');
    state.isGhostMode = localStorage.getItem('waggle_ghost_mode') === 'true';
    const sC = document.getElementById('settingSearchable');
    if (sC) sC.checked = !state.isGhostMode;
}

export function initApp() {
    loadSettings(); initMap(); loadPosts(); loadInbox(); updateStatsUI();
}

// LISTENERS
document.addEventListener('click', (e) => {
    const navItem = e.target.closest('.nav-item');
    if (navItem) switchView(navItem.getAttribute('data-view'));

    if (e.target.closest('#closeChatBtn')) closeActiveChat();
    if (e.target.closest('#sendMsgBtn')) {
        const input = document.getElementById('chatInput');
        if (input && input.value.trim()) { sendMessage(input.value.trim()); input.value = ""; }
    }
    // Obsługa zdjęć w czacie
    if (e.target.closest('#chatAddPhotoBtn')) {
        const input = document.createElement('input');
        input.type = 'file'; input.accept = 'image/*';
        input.onchange = (ev) => sendChatImage(ev.target.files[0]);
        input.click();
    }

    if (e.target.closest('#centerBtn')) centerOnMe();
    if (e.target.closest('#startWalkBtn')) startWalk();
    if (e.target.closest('#stopWalkBtn')) { stopWalk(); setTimeout(updateStatsUI, 500); }

    if (e.target.closest('#chatTabInbox')) {
        e.target.style.background = 'white';
        document.getElementById('chatTabSearch').style.background = 'transparent';
        document.getElementById('userSearchInput').style.display = 'none';
        loadInbox();
    }
    if (e.target.closest('#chatTabSearch')) {
        e.target.style.background = 'white';
        document.getElementById('chatTabInbox').style.background = 'transparent';
        document.getElementById('userSearchInput').style.display = 'block';
        searchUsers('');
    }

    if (e.target.classList.contains('wiki-tab-btn')) {
        document.querySelectorAll('.wiki-tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        renderWiki(e.target.getAttribute('data-tab'));
    }

    // Modal settings
    if (e.target.closest('#openSettingsBtn')) document.getElementById('settings-modal').style.display = 'flex';
    if (e.target.closest('#saveSettingsBtn')) {
        const isSearchable = document.getElementById('settingSearchable').checked;
        localStorage.setItem('waggle_ghost_mode', (!isSearchable).toString());
        state.isGhostMode = !isSearchable;
        if (state.isGhostMode && state.user) db.collection("walks").doc(state.user.uid).delete();
        document.getElementById('settings-modal').style.display = 'none';
        window.Waggle.showToast("Ustawienia zapisane!");
    }

    if (e.target.classList.contains('close-modal-btn')) e.target.closest('.modal').style.display = 'none';
    if (e.target.closest('#loginBtn')) {
        auth.signInWithEmailAndPassword(document.getElementById('authEmail').value, document.getElementById('authPass').value);
    }
    if (e.target.closest('#logoutBtn')) auth.signOut().then(() => window.location.reload());
});

initAuth(initApp);
