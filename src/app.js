import { state, clearListeners, addListener } from './core/state.js';
import { auth, db } from './core/firebase.js';

// Importujemy moduły (stworzysz je w kolejnym kroku)
import { initMap, centerOnMe } from './modules/map.js';
import { startWalk, stopWalk } from './modules/walk.js';
import { loadPosts } from './modules/posts.js';
import { loadInbox } from './modules/chat.js';

// 1. MONITOROWANIE AUTH
auth.onAuthStateChanged(user => {
    document.getElementById('loader').style.display = 'none';
    clearListeners(); // Czyścimy stare śmieci

    if (user) {
        state.user = user;
        // Pobieramy profil psa i uruchamiamy apkę
        const unsub = db.collection("users").doc(user.uid).onSnapshot(doc => {
            if (doc.exists) {
                state.profile = doc.data();
                setupApp();
            } else {
                console.log("Brak profilu - przekierowanie do setupu");
                // Tu w v22.1 dodamy modal tworzenia profilu
            }
        });
        addListener(unsub);
    } else {
        showScreen('auth-screen');
    }
});

function setupApp() {
    showScreen('app-interface');
    updateProfileUI();
    initMap();
    loadPosts();
    loadInbox();
}

// 2. NAWIGACJA MIĘDZY WIDOKAMI (BEZ RELOADA!)
function showScreen(id) {
    document.querySelectorAll('.screen-container').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'flex';
}

window.switchView = function(viewId, btn) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + viewId).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    btn.classList.add('active');

    if(viewId === 'map' && state.map) {
        setTimeout(() => state.map.invalidateSize(), 200);
    }
};

function updateProfileUI() {
    document.getElementById('profileNameDisplay').innerText = state.profile.name;
    document.getElementById('profileAvatar').src = state.profile.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
    document.getElementById('statWalks').innerText = state.profile.walkCount || 0;
}

// 3. EVENT LISTENERY (PODPIĘCIE PRZYCISKÓW)
document.getElementById('loginBtn').onclick = () => {
    const e = document.getElementById('authEmail').value;
    const p = document.getElementById('authPass').value;
    auth.signInWithEmailAndPassword(e, p).catch(err => alert(err.message));
};

document.getElementById('startWalkBtn').onclick = () => startWalk();
document.getElementById('stopWalkBtn').onclick = () => stopWalk();
document.getElementById('centerBtn').onclick = () => centerOnMe();
document.getElementById('logoutBtn').onclick = () => auth.signOut().then(() => location.reload());

// Podpięcie nawigacji dolnej
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.onclick = () => switchView(btn.dataset.view, btn);
});
