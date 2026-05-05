import { state, clearListeners } from './core/state.js';
import { auth, db } from './core/firebase.js';
import { initAuth } from './modules/auth.js';
import { initMap, centerOnMe, centerOnTarget } from './modules/map.js';
import { startWalk, stopWalk } from './modules/walk.js';
import { loadPosts, saveCommunityPost, openLightbox } from './modules/posts.js';
import { loadInbox, sendMessage, openChat, closeActiveChat } from './modules/chat.js';

// --- UDOSTĘPNIENIE FUNKCJI DLA RENDEROWANEGO HTML ---
window.Waggle = {
    openChat,
    centerOnTarget,
    openLightbox,
    closeActiveChat
};

export function initApp() {
    console.log("Waggle Engine: Ready 🐾");
    initMap();
    loadPosts();
    loadInbox();
    loadWiki();
    updateStatsUI();
}

// --- SYSTEM PRZEŁĄCZANIA WIDOKÓW ---
function switchView(viewId) {
    clearListeners(); // Zapobiega memory leaks

    document.querySelectorAll('.view-section').forEach(v => {
        v.classList.remove('active');
        v.style.display = 'none';
    });

    const target = document.getElementById('view-' + viewId);
    if(target) {
        target.classList.add('active');
        target.style.display = (viewId === 'map') ? 'flex' : 'block';
    }

    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.remove('active');
        if(n.getAttribute('data-view') === viewId) n.classList.add('active');
    });

    if(viewId === 'map' && state.map) {
        setTimeout(() => state.map.invalidateSize(), 300);
    }
}

// --- PODPIĘCIE PRZYCISKÓW (ZAMIAST ONCLICK W HTML) ---
document.addEventListener('DOMContentLoaded', () => {
    // Nawigacja dolna
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.getAttribute('data-view')));
    });

    // Przyciski Mapy
    const centerBtn = document.getElementById('centerBtn');
    if(centerBtn) centerBtn.onclick = () => centerOnMe();

    // Przyciski Spaceru
    const startBtn = document.getElementById('startWalkBtn');
    if(startBtn) startBtn.onclick = () => startWalk();

    const stopBtn = document.getElementById('stopWalkBtn');
    if(stopBtn) stopBtn.onclick = () => {
        stopWalk();
        updateStatsUI(); // Natychmiastowe odświeżenie cyferek w profilu
    };

    // Czat i Posty
    const closeChatBtn = document.getElementById('closeChatBtn');
    if(closeChatBtn) closeChatBtn.onclick = () => closeActiveChat();

    const sendMsgBtn = document.getElementById('sendMsgBtn');
    if(sendMsgBtn) sendMsgBtn.onclick = () => {
        const input = document.getElementById('chatInput');
        if(input.value.trim()) {
            sendMessage(input.value.trim());
            input.value = "";
        }
    };

    // Logowanie
    const loginBtn = document.getElementById('loginBtn');
    if(loginBtn) {
        loginBtn.onclick = () => {
            const e = document.getElementById('authEmail').value;
            const p = document.getElementById('authPass').value;
            auth.signInWithEmailAndPassword(e, p).catch(err => alert(err.message));
        };
    }
});

// --- FUNKCJE POMOCNICZE ---
function loadWiki() {
    db.collection("wiki_breeds").orderBy("name").limit(20).get().then(snap => {
        let h = "";
        snap.forEach(doc => {
            const d = doc.data();
            h += `<div class="post-card"><h4>${d.name}</h4><p>${d.desc_pl || d.content}</p></div>`;
        });
        const container = document.getElementById('wiki-container');
        if(container) container.innerHTML = h || "<p style='padding:20px;'>Brak wpisów.</p>";
    });
}

function updateStatsUI() {
    if (state.profile) {
        document.getElementById('profileNameDisplay').innerText = state.profile.name;
        document.getElementById('profileAvatar').src = state.profile.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
        document.getElementById('statWalks').innerText = state.profile.walkCount || 0;
        document.getElementById('statDist').innerText = ((state.profile.walkCount || 0) * 1.2).toFixed(1);
    }
}

initAuth();
