import { state, clearListeners } from './core/state.js';
import { auth, db } from './core/firebase.js';
import { initAuth } from './modules/auth.js';
import { initMap, centerOnMe, centerOnTarget } from './modules/map.js';
import { startWalk, stopWalk } from './modules/walk.js';
import { loadPosts, saveCommunityPost, openLightbox } from './modules/posts.js';
import { loadInbox, sendMessage, openChat, closeActiveChat } from './modules/chat.js';

// --- FUNDAMENT: WYSTAWIAMY FUNKCJE DO OKNA (Żeby HTML je widział) ---
window.Waggle = {
    openChat,
    centerOnTarget,
    openLightbox,
    closeActiveChat,
    switchView: (v) => switchView(v)
};

export function initApp() {
    console.log("Waggle Engine: Ready 🐾");
    initMap();
    loadPosts();
    loadInbox();
    loadDynamicWiki();
    updateStatsUI();
}

function switchView(viewId) {
    console.log("Przełączam na:", viewId);
    clearListeners(); 

    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    const target = document.getElementById('view-' + viewId);
    if(target) target.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.remove('active');
        if(n.getAttribute('data-view') === viewId) n.classList.add('active');
    });

    if (viewId === 'map' && state.map) {
        setTimeout(() => state.map.invalidateSize(), 300);
    }
    
    // Odśwież dane przy wejściu w widok
    if (viewId === 'community') loadPosts();
    if (viewId === 'chat') loadInbox();
    if (viewId === 'wiki') loadDynamicWiki();
}

// --- CENTRALNY OBSŁUGIWACZ KLIKNIĘĆ (Fix na toporną nawigację) ---
document.addEventListener('click', async (e) => {
    // Nawigacja (łapie kliknięcie w ikonę lub tekst)
    const navItem = e.target.closest('.nav-item');
    if (navItem) {
        const view = navItem.getAttribute('data-view');
        switchView(view);
    }

    // Przyciski akcji
    if (e.target.closest('#centerBtn')) centerOnMe();
    if (e.target.closest('#startWalkBtn')) startWalk();
    if (e.target.closest('#stopWalkBtn')) {
        stopWalk();
        setTimeout(updateStatsUI, 500);
    }
    
    // Wylogowanie (Fix!)
    if (e.target.closest('#logoutBtn')) {
        console.log("Wylogowuję...");
        auth.signOut().then(() => window.location.reload());
    }

    if (e.target.closest('#addPostBtn')) {
        const text = prompt("Co słychać u pieska?");
        if(text && text.length > 2) {
            await saveCommunityPost(text, null).catch(err => console.error(err));
        }
    }

    if (e.target.closest('#sendMsgBtn')) {
        const input = document.getElementById('chatInput');
        if (input.value.trim()) {
            sendMessage(input.value.trim());
            input.value = "";
        }
    }
});

function loadDynamicWiki() {
    db.collection("wiki_breeds").orderBy("name").limit(20).get().then(snap => {
        let html = "";
        snap.forEach(doc => {
            const d = doc.data();
            html += `<div class="post-card"><h4>${d.name}</h4><p>${d.desc_pl || d.content}</p></div>`;
        });
        const container = document.getElementById('wiki-container');
        if (container) container.innerHTML = html || "<p style='padding:20px;'>Brak wpisów w bazie wiedzy.</p>";
    }).catch(err => console.error("Wiki error:", err));
}

function updateStatsUI() {
    if (!state.profile) return; // Zabezpieczenie przed błędem
    document.getElementById('profileNameDisplay').innerText = state.profile.name || "Twój Pies";
    document.getElementById('profileAvatar').src = state.profile.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
    document.getElementById('statWalks').innerText = state.profile.walkCount || 0;
    document.getElementById('statDist').innerText = ((state.profile.walkCount || 0) * 1.2).toFixed(1);
}

initAuth();
