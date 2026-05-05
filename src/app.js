import { state, clearListeners, addListener } from './core/state.js';
import { auth, db } from './core/firebase.js';
import { initAuth } from './modules/auth.js';
import { initMap, centerOnMe } from './modules/map.js';
import { loadPosts } from './modules/posts.js';
import { loadInbox } from './modules/chat.js';

export function initApp() {
    initMap();
    loadPosts();
    loadInbox();
    loadDynamicWiki(); // NOWOŚĆ: pobiera z bazy!
    updateStatsUI();
}

function loadDynamicWiki() {
    db.collection("wiki_breeds").orderBy("name").limit(20).get().then(snap => {
        let html = "";
        snap.forEach(doc => {
            const d = doc.data();
            html += `<div class="post-card"><h4>${d.name}</h4><p>${d.desc_pl || d.content}</p></div>`;
        });
        document.getElementById('wiki-container').innerHTML = html || "<p>Brak wpisów w bazie.</p>";
    });
}

function updateStatsUI() {
    if (state.profile) {
        document.getElementById('statWalks').innerText = state.profile.walkCount || 0;
        document.getElementById('statDist').innerText = ((state.profile.walkCount || 0) * 1.2).toFixed(1);
    }
}

// Obsługa nawigacji (fix dla przycisków)
document.addEventListener('click', e => {
    const btn = e.target.closest('.nav-item');
    if (btn) {
        const viewId = btn.dataset.view;
        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
        document.getElementById('view-' + viewId).classList.add('active');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        btn.classList.add('active');
        if(viewId === 'map' && state.map) setTimeout(() => state.map.invalidateSize(), 200);
    }
});

// Podpięcie Logowania i SOS
document.getElementById('loginBtn').onclick = () => {
    auth.signInWithEmailAndPassword(document.getElementById('authEmail').value, document.getElementById('authPass').value).catch(e => alert(e.message));
};

initAuth();
