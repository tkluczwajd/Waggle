import { state, addListener, clearListeners } from './core/state.js';
import { auth, db } from './core/firebase.js';
import { initAuth } from './modules/auth.js';
import { initMap, centerOnMe } from './modules/map.js';
import { startWalk, stopWalk } from './modules/walk.js';
import { loadPosts } from './modules/posts.js';
import { loadInbox } from './modules/chat.js';

// --- DYRYGENT APLIKACJI ---

export function initApp() {
    console.log("Waggle Engine: Ready 🐾");
    initMap();
    loadPosts();
    loadInbox();
    loadWiki(); // Przywrócone Wiki
}

// --- LOGIKA NAWIGACJI (NAPRAWA KLIKANIA) ---

function switchView(viewId) {
    // 1. Ukryj wszystkie sekcje
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    
    // 2. Pokaż wybraną
    const targetView = document.getElementById('view-' + viewId);
    if (targetView) targetView.classList.add('active');
    
    // 3. Zaktualizuj menu na dole
    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.remove('active');
        if (n.dataset.view === viewId) n.classList.add('active');
    });

    // 4. Odśwież mapę jeśli trzeba
    if (viewId === 'map' && state.map) {
        setTimeout(() => state.map.invalidateSize(), 200);
    }
}

// Podpięcie nawigacji (Event Delegation)
document.addEventListener('click', (e) => {
    const navItem = e.target.closest('.nav-item');
    if (navItem) {
        switchView(navItem.dataset.view);
    }
});

// --- PRZYWRÓCONE FUNKCJE ---

function loadWiki() {
    db.collection("wiki_breeds").orderBy("name").limit(10).get().then(snap => {
        let html = "";
        snap.forEach(doc => {
            const d = doc.data();
            html += `<div class="post-card"><h4>${d.name}</h4><p>${d.desc_pl}</p></div>`;
        });
        const container = document.getElementById('wiki-container');
        if (container) container.innerHTML = html || "<p>Wczytywanie wiedzy...</p>";
    });
}

// --- PODPIĘCIE PRZYCISKÓW INTERFEJSU ---

document.addEventListener('DOMContentLoaded', () => {
    // Mapa
    const centerBtn = document.getElementById('centerBtn');
    if(centerBtn) centerBtn.onclick = () => centerOnMe();

    // Spacer
    const startBtn = document.getElementById('startWalkBtn');
    if(startBtn) startBtn.onclick = () => startWalk();

    const stopBtn = document.getElementById('stopWalkBtn');
    if(stopBtn) stopBtn.onclick = () => stopWalk();

    // Logowanie
    const loginBtn = document.getElementById('loginBtn');
    if(loginBtn) {
        loginBtn.onclick = () => {
            const e = document.getElementById('authEmail').value;
            const p = document.getElementById('authPass').value;
            auth.signInWithEmailAndPassword(e, p).catch(err => alert(err.message));
        };
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) logoutBtn.onclick = () => auth.signOut().then(() => location.reload());
});

// Start systemu autoryzacji
initAuth();
