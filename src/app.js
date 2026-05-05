import { state, clearListeners, addListener } from './core/state.js';
import { auth, db } from './core/firebase.js';
import { initAuth } from './modules/auth.js';
import { initMap, centerOnMe } from './modules/map.js';
import { startWalk, stopWalk } from './modules/walk.js';
import { loadPosts, saveCommunityPost } from './modules/posts.js';
import { loadInbox, sendMessage } from './modules/chat.js';

// INICJALIZACJA APLIKACJI (Wywoływana z auth.js po zalogowaniu)
export function initApp() {
    console.log("Waggle Engine: Ready 🐾");
    initMap();
    loadPosts();
    loadInbox();
    loadDynamicWiki();
}

// NAWIGACJA
function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    const target = document.getElementById('view-' + viewId);
    if(target) target.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.remove('active');
        if(n.dataset.view === viewId) n.classList.add('active');
    });

    if(viewId === 'map' && state.map) setTimeout(() => state.map.invalidateSize(), 200);
}

// LISTENERY PRZYCISKÓW
document.addEventListener('click', async (e) => {
    const navItem = e.target.closest('.nav-item');
    if (navItem) switchView(navItem.dataset.view);

    if (e.target.id === 'centerBtn') centerOnMe();
    if (e.target.id === 'startWalkBtn') startWalk();
    if (e.target.id === 'stopWalkBtn') stopWalk();
    if (e.target.id === 'logoutBtn') auth.signOut().then(() => location.reload());
    
    if (e.target.id === 'addPostBtn') {
        const text = prompt("Co u pieska?");
        if(text) await saveCommunityPost(text, null);
    }

    if (e.target.id === 'sendMsgBtn') {
        const input = document.getElementById('chatInput');
        sendMessage(input.value);
        input.value = "";
    }

    if (e.target.id === 'closeChatBtn') {
        document.getElementById('chat-window').style.display = 'none';
        state.currentChatId = null;
    }
});

// WIKI Z BAZY
function loadDynamicWiki() {
    db.collection("wiki_breeds").orderBy("name").limit(20).get().then(snap => {
        let html = "";
        snap.forEach(doc => {
            const d = doc.data();
            html += `<div class="post-card"><h4>${d.name}</h4><p>${d.desc_pl || d.content}</p></div>`;
        });
        document.getElementById('wiki-container').innerHTML = html || "<p>Brak wpisów.</p>";
    });
}

// GLOBALNY FIX DLA LIGHTBOXA
window.openLightbox = (url) => {
    document.getElementById('lightbox-img').src = url;
    document.getElementById('lightbox-modal').style.display = 'flex';
};

initAuth();
