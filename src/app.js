import { state, clearListeners } from './core/state.js';
import { auth, db } from './core/firebase.js';
import { initAuth } from './modules/auth.js';
import { initMap, centerOnMe, centerOnTarget } from './modules/map.js';
import { startWalk, stopWalk } from './modules/walk.js';
import { loadPosts, saveCommunityPost, uploadImage, openLightbox } from './modules/posts.js';
import { loadInbox, sendMessage, openChat, closeActiveChat } from './modules/chat.js';
import { WIKI } from './data/wikiData.js'; 

window.Waggle = { openChat, closeActiveChat, centerOnTarget, openLightbox, deletePost: (id) => db.collection("posts").doc(id).delete() };

let pendingImageFile = null;

export function initApp() {
    loadSettings(); 
    initMap();
    loadPosts();
    loadInbox();
    updateStatsUI();
}

function switchView(viewId) {
    clearListeners(); 
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('view-' + viewId).classList.add('active');
    document.querySelector(`.nav-item[data-view="${viewId}"]`).classList.add('active');
    if (viewId === 'map' && state.map) setTimeout(() => state.map.invalidateSize(), 300);
    if (viewId === 'community') loadPosts();
    if (viewId === 'chat') loadInbox();
    if (viewId === 'wiki') renderWiki('rasy');
}

document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('close-modal-btn')) e.target.closest('.modal').style.display = 'none';
    const navItem = e.target.closest('.nav-item');
    if (navItem) switchView(navItem.getAttribute('data-view'));

    // UŻYwamy e.target.closest żeby kliknięcie W TEKST przycisku też działało!
    if (e.target.closest('#centerBtn')) centerOnMe();
    if (e.target.closest('#startWalkBtn')) startWalk();
    if (e.target.closest('#stopWalkBtn')) { stopWalk(); setTimeout(updateStatsUI, 500); }
    if (e.target.closest('#triggerAlertBtn')) document.getElementById('alert-modal').style.display = 'flex';

    if (e.target.closest('#addPhotoBtn')) document.getElementById('postImageInput').click();
    
    if (e.target.closest('#removePostImageBtn')) {
        pendingImageFile = null;
        document.getElementById('post-image-preview-container').style.display = 'none';
    }

    if (e.target.closest('#addPostBtn')) document.getElementById('post-creator-modal').style.display = 'flex';

    if (e.target.closest('#publishPostBtn')) {
        const btn = e.target.closest('#publishPostBtn');
        const text = document.getElementById('postContent').value.trim();
        if(text.length < 3) return alert("Napisz coś więcej!");

        btn.disabled = true; btn.innerText = "WYSYŁANIE...";
        try {
            let finalUrl = null;
            if(pendingImageFile) finalUrl = await uploadImage(pendingImageFile);
            await saveCommunityPost(text, finalUrl);
            
            document.getElementById('post-creator-modal').style.display = 'none';
            document.getElementById('postContent').value = '';
            pendingImageFile = null;
            document.getElementById('post-image-preview-container').style.display = 'none';
        } catch(err) { alert("Błąd wysyłania!"); } 
        finally { btn.disabled = false; btn.innerText = "OPUBLIKUJ"; }
    }

    // WIKI (renderowanie zakładek)
    if (e.target.classList.contains('wiki-tab-btn')) {
        document.querySelectorAll('.wiki-tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        renderWiki(e.target.getAttribute('data-tab'));
    }

    // PRZYCISKI PROFILU (Teraz w 100% działają)
    if (e.target.closest('#openEditProfileBtn')) {
        const p = state.profile || {};
        document.getElementById('setupName').value = p.name || "";
        document.getElementById('setupCity').value = p.city || "";
        document.getElementById('setupBreed').value = p.breed || "";
        document.getElementById('setupRoutine').value = p.routine || "brak";
        document.getElementById('profile-setup-modal').style.display = 'flex';
    }
    if (e.target.closest('#saveProfileBtn')) {
        const d = { 
            name: document.getElementById('setupName').value.trim(), 
            city: document.getElementById('setupCity').value.trim(), 
            breed: document.getElementById('setupBreed').value.trim(), 
            routine: document.getElementById('setupRoutine').value 
        };
        db.collection("users").doc(state.user.uid).set(d, {merge:true}).then(() => {
            state.profile = {...state.profile, ...d};
            document.getElementById('profile-setup-modal').style.display = 'none';
            updateStatsUI();
        });
    }

    if (e.target.closest('#openSettingsBtn')) document.getElementById('settings-modal').style.display = 'flex';
    
    if (e.target.closest('#saveSettingsBtn')) {
        const theme = document.getElementById('settingTheme').value;
        const font = document.getElementById('settingFontSize').value;
        localStorage.setItem('waggle_theme', theme);
        localStorage.setItem('waggle_font', font);
        loadSettings(); 
        document.getElementById('settings-modal').style.display = 'none';
    }

    if (e.target.closest('#loginBtn')) auth.signInWithEmailAndPassword(document.getElementById('authEmail').value, document.getElementById('authPass').value).catch(err => alert(err.message));
    if (e.target.closest('#logoutBtn')) auth.signOut().then(() => window.location.reload());
});

document.addEventListener('change', (e) => {
    if(e.target.id === 'postImageInput') {
        const file = e.target.files[0];
        if(file) {
            pendingImageFile = file;
            const reader = new FileReader();
            reader.onload = (ex) => {
                document.getElementById('post-image-preview').src = ex.target.result;
                document.getElementById('post-image-preview-container').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }
});

function renderWiki(tab) {
    let html = "";
    const items = WIKI[tab] || [];
    items.forEach(item => {
        html += `<div class="post-card"><b>${item.name || item.title}</b><p style="margin-top:5px; font-weight:600; font-size:13px; color:var(--text-muted);">${item.desc}</p></div>`;
    });
    const container = document.getElementById('wiki-content');
    if (container) container.innerHTML = html;
}

function updateStatsUI() {
    if (!state.profile) return; 
    document.getElementById('profileNameDisplay').innerText = state.profile.name || "Piesek";
    document.getElementById('statWalks').innerText = state.profile.walkCount || 0;
    document.getElementById('statDist').innerText = ((state.profile.walkCount || 0) * 1.2).toFixed(1);
    
    // Gwarancja pokazania awatara
    const avatarEl = document.getElementById('profileAvatar');
    if(avatarEl) avatarEl.src = state.profile.avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
}

function loadSettings() {
    const theme = localStorage.getItem('waggle_theme') || 'light';
    const font = localStorage.getItem('waggle_font') || '14px';
    if (theme === 'dark') document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
    document.documentElement.style.setProperty('--base-font-size', font);
}

initAuth(initApp);