import { state, clearListeners } from './core/state.js';
import { auth, db } from './core/firebase.js';
import { initAuth } from './modules/auth.js';
import { initMap, centerOnMe, centerOnTarget } from './modules/map.js';
import { startWalk, stopWalk } from './modules/walk.js';
import { loadPosts, saveCommunityPost, openLightbox } from './modules/posts.js';
import { loadInbox, sendMessage, openChat, closeActiveChat } from './modules/chat.js';
import { WIKI } from './data/wikiData.js'; 

window.Waggle = { openChat, centerOnTarget, openLightbox, closeActiveChat };

let currentWikiTab = 'rasy';

export function initApp() {
    console.log("Waggle Engine: Ready 🐾");
    loadFontSize(); // Wczytuje ustawienia czcionki
    initMap();
    loadPosts();
    loadInbox();
    renderWikiTab(currentWikiTab);
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
    // Nawigacja
    const navItem = e.target.closest('.nav-item');
    if (navItem) switchView(navItem.getAttribute('data-view'));

    // Przyciski Mapy
    if (e.target.closest('#centerBtn')) centerOnMe();
    if (e.target.closest('#startWalkBtn')) startWalk();
    if (e.target.closest('#stopWalkBtn')) { stopWalk(); setTimeout(updateStatsUI, 500); }
    
    // Logowanie
    if (e.target.closest('#loginBtn')) {
        const emailStr = document.getElementById('authEmail').value.trim();
        const passStr = document.getElementById('authPass').value;
        auth.signInWithEmailAndPassword(emailStr, passStr).catch(err => alert("Błąd: " + err.message));
    }
    if (e.target.closest('#logoutBtn')) auth.signOut().then(() => window.location.reload());

    // Posty i Czat
    if (e.target.closest('#addPostBtn')) {
        const text = prompt("Co słychać u pieska?");
        if(text && text.length > 2) await saveCommunityPost(text, null).catch(console.error);
    }
    if (e.target.closest('#sendMsgBtn')) {
        const input = document.getElementById('chatInput');
        if (input.value.trim()) { sendMessage(input.value.trim()); input.value = ""; }
    }

    // Zakładki Wiki
    if (e.target.classList.contains('wiki-tab-btn')) {
        document.querySelectorAll('.wiki-tab-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentWikiTab = e.target.getAttribute('data-tab');
        renderWikiTab(currentWikiTab);
    }

    // Edycja Profilu
    if (e.target.closest('#editProfileBtn')) {
        const newName = prompt("Podaj nowe imię pieska:", state.profile?.name || "");
        if (newName && newName.trim().length > 1) {
            db.collection("users").doc(state.user.uid).update({ name: newName.trim() })
              .then(() => { state.profile.name = newName.trim(); updateStatsUI(); alert("Profil zaktualizowany!"); })
              .catch(err => console.error("Błąd edycji:", err));
        }
    }

    // Zmiana Czcionki
    if (e.target.classList.contains('font-btn')) {
        const newSize = e.target.getAttribute('data-size');
        document.documentElement.style.setProperty('--base-font-size', newSize);
        localStorage.setItem('waggle_font_size', newSize);
        document.querySelectorAll('.font-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
    }
});

// --- WIKI Z ZAKŁADKAMI ---
function renderWikiTab(tabName) {
    let html = "";
    if (tabName === 'rasy') {
        WIKI.breeds.forEach(b => {
            html += `<div class="post-card"><b>${b.name}</b><p style="margin:5px 0;">${b.desc}</p><small style="color:var(--secondary);">Energia: ${b.energy} • Szkolenie: ${b.training}</small></div>`;
        });
    } else if (tabName === 'szkolenie') {
        WIKI.training.forEach(t => {
            html += `<div class="post-card" style="border-left: 4px solid var(--secondary);"><b>${t.title}</b><p style="margin-top:5px;">${t.desc}</p></div>`;
        });
    } else if (tabName === 'sytuacje') {
        WIKI.situations.forEach(s => {
            html += `<div class="post-card" style="border-left: 4px solid var(--danger);"><b>${s.title}</b><p style="margin-top:5px;">${s.desc}</p></div>`;
        });
    }
    const container = document.getElementById('wiki-content');
    if (container) container.innerHTML = html;
}

// --- FUNKCJE POMOCNICZE ---
function loadFontSize() {
    const savedSize = localStorage.getItem('waggle_font_size') || '16px';
    document.documentElement.style.setProperty('--base-font-size', savedSize);
    const btn = document.querySelector(`.font-btn[data-size="${savedSize}"]`);
    if(btn) btn.classList.add('active');
}

function updateStatsUI() {
    if (!state.profile) return; 
    document.getElementById('profileNameDisplay').innerText = state.profile.name || "Twój Pies";
    document.getElementById('profileAvatar').src = state.profile.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
    document.getElementById('statWalks').innerText = state.profile.walkCount || 0;
    document.getElementById('statDist').innerText = ((state.profile.walkCount || 0) * 1.2).toFixed(1);
}

initAuth();