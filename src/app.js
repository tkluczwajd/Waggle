import { state, clearListeners } from './core/state.js';
import { auth, db } from './core/firebase.js';
import { initAuth } from './modules/auth.js';
import { initMap, centerOnMe, centerOnTarget } from './modules/map.js';
import { startWalk, stopWalk } from './modules/walk.js';
import { loadPosts, saveCommunityPost, openLightbox } from './modules/posts.js';
import { loadInbox, sendMessage, openChat, closeActiveChat } from './modules/chat.js';
import { WIKI } from './data/wikiData.js'; // IMPORT LOKALNEJ BAZY WIEDZY

window.Waggle = { openChat, centerOnTarget, openLightbox, closeActiveChat };

export function initApp() {
    console.log("Waggle Engine: Ready 🐾");
    initMap();
    loadPosts();
    loadInbox();
    loadDynamicWiki();
    updateStatsUI();
}

function switchView(viewId) {
    clearListeners(); 
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

    if (viewId === 'map' && state.map) setTimeout(() => state.map.invalidateSize(), 300);
    if (viewId === 'community') loadPosts();
    if (viewId === 'chat') loadInbox();
}

document.addEventListener('click', async (e) => {
    const navItem = e.target.closest('.nav-item');
    if (navItem) switchView(navItem.getAttribute('data-view'));

    if (e.target.closest('#centerBtn')) centerOnMe();
    if (e.target.closest('#startWalkBtn')) startWalk();
    if (e.target.closest('#stopWalkBtn')) { stopWalk(); setTimeout(updateStatsUI, 500); }
    
    // FIX LOGOWANIA: Używam unikalnych nazw zmiennych (emailStr, passStr)
    if (e.target.closest('#loginBtn')) {
        console.log("Próba logowania...");
        const emailStr = document.getElementById('authEmail').value.trim();
        const passStr = document.getElementById('authPass').value;
        auth.signInWithEmailAndPassword(emailStr, passStr).catch(err => alert("Błąd: " + err.message));
    }

    // FIX WYLOGOWANIA
    if (e.target.closest('#logoutBtn')) {
        console.log("Wylogowywanie...");
        auth.signOut().then(() => {
            window.location.reload();
        });
    }

    if (e.target.closest('#addPostBtn')) {
        const text = prompt("Co słychać u pieska?");
        if(text && text.length > 2) await saveCommunityPost(text, null).catch(console.error);
    }

    if (e.target.closest('#sendMsgBtn')) {
        const input = document.getElementById('chatInput');
        if (input.value.trim()) { sendMessage(input.value.trim()); input.value = ""; }
    }
});

// WIKI POBIERANE Z LOKALNEGO PLIKU ZAMIAST Z FIREBASE
function loadDynamicWiki() {
    let html = "<div style='padding: 20px;'>";
    
    html += "<h3 style='color:var(--primary);'>🐕 Rasy Psów</h3>";
    WIKI.breeds.forEach(b => {
        html += `<div class="post-card" style="margin: 10px 0;">
            <b style="font-size:16px;">${b.name}</b>
            <p style="margin: 5px 0 10px 0;">${b.desc}</p>
            <small style="color:var(--secondary); font-weight:800;">Energia: ${b.energy} • Szkolenie: ${b.training}</small>
        </div>`;
    });

    html += "<h3 style='color:var(--primary); margin-top:20px;'>🎓 Szkolenie</h3>";
    WIKI.training.forEach(t => {
        html += `<div class="post-card" style="margin: 10px 0; border-left: 4px solid var(--secondary);">
            <b>${t.title}</b><p style="margin-top:5px;">${t.desc}</p>
        </div>`;
    });

    html += "<h3 style='color:var(--primary); margin-top:20px;'>⚠️ Sytuacje na spacerze</h3>";
    WIKI.situations.forEach(s => {
        html += `<div class="post-card" style="margin: 10px 0; border-left: 4px solid var(--danger);">
            <b>${s.title}</b><p style="margin-top:5px;">${s.desc}</p>
        </div>`;
    });

    html += "</div>";
    
    const container = document.getElementById('wiki-container');
    if (container) container.innerHTML = html;
}

function updateStatsUI() {
    if (!state.profile) return; 
    document.getElementById('profileNameDisplay').innerText = state.profile.name || "Twój Pies";
    document.getElementById('profileAvatar').src = state.profile.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
    document.getElementById('statWalks').innerText = state.profile.walkCount || 0;
    document.getElementById('statDist').innerText = ((state.profile.walkCount || 0) * 1.2).toFixed(1);
}

initAuth();
