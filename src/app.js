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

// ... Funkcja switchView pozostaje bez zmian ...
function switchView(viewId) {
    clearListeners(); 
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('view-' + viewId).classList.add('active');
    document.querySelector(`.nav-item[data-view="${viewId}"]`).classList.add('active');
    if (viewId === 'map' && state.map) setTimeout(() => state.map.invalidateSize(), 300);
    if (viewId === 'community') loadPosts();
    if (viewId === 'chat') loadInbox();
}

document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('close-modal-btn')) e.target.closest('.modal').style.display = 'none';
    const navItem = e.target.closest('.nav-item');
    if (navItem) switchView(navItem.getAttribute('data-view'));

    // Przyciski Mapy
    if (e.target.id === 'centerBtn') centerOnMe();
    if (e.target.id === 'startWalkBtn') startWalk();
    if (e.target.id === 'stopWalkBtn') { stopWalk(); setTimeout(updateStatsUI, 500); }
    if (e.target.id === 'triggerAlertBtn') document.getElementById('alert-modal').style.display = 'flex';

    // 📸 OBSŁUGA ZDJĘCIA W POSTACH
    if (e.target.id === 'addPhotoBtn') document.getElementById('postImageInput').click();
    
    if (e.target.id === 'removePostImageBtn') {
        pendingImageFile = null;
        document.getElementById('post-image-preview-container').style.display = 'none';
    }

    if (e.target.id === 'addPostBtn') document.getElementById('post-creator-modal').style.display = 'flex';

    if (e.target.id === 'publishPostBtn') {
        const btn = e.target;
        const text = document.getElementById('postContent').value.trim();
        if(text.length < 3) return alert("Napisz coś więcej!");

        btn.disabled = true;
        btn.innerText = "WYSYŁANIE...";

        try {
            let finalUrl = null;
            if(pendingImageFile) finalUrl = await uploadImage(pendingImageFile);
            
            await saveCommunityPost(text, finalUrl);
            
            // Czyścimy wszystko po sukcesie
            document.getElementById('post-creator-modal').style.display = 'none';
            document.getElementById('postContent').value = '';
            pendingImageFile = null;
            document.getElementById('post-image-preview-container').style.display = 'none';
        } catch(err) {
            alert("Błąd wysyłania!");
        } finally {
            btn.disabled = false;
            btn.innerText = "OPUBLIKUJ";
        }
    }

    // ... Reszta obsługi (Logowanie, Wiki, Czat) pozostaje bez zmian ...
    if (e.target.id === 'loginBtn') {
        auth.signInWithEmailAndPassword(document.getElementById('authEmail').value, document.getElementById('authPass').value).catch(err => alert(err.message));
    }
    if (e.target.id === 'logoutBtn') auth.signOut().then(() => window.location.reload());
});

// Listener dla wyboru zdjęcia
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

// ... Funkcje pomocnicze (updateStatsUI, loadSettings) pozostają bez zmian ...
function updateStatsUI() {
    if (!state.profile) return; 
    document.getElementById('profileNameDisplay').innerText = state.profile.name || "Piesek";
    document.getElementById('statWalks').innerText = state.profile.walkCount || 0;
    document.getElementById('statDist').innerText = ((state.profile.walkCount || 0) * 1.2).toFixed(1);
}

function loadSettings() {
    const theme = localStorage.getItem('waggle_theme') || 'light';
    if (theme === 'dark') document.body.classList.add('dark-mode');
}

initAuth(initApp);