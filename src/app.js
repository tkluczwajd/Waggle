import { state, clearListeners } from './core/state.js';
import { auth, db } from './core/firebase.js';
import { initAuth } from './modules/auth.js';
import { initMap, centerOnMe } from './modules/map.js';
import { startWalk, stopWalk } from './modules/walk.js';
import { loadPosts, saveCommunityPost } from './modules/posts.js';
import { loadInbox, sendMessage, openChat, closeActiveChat } from './modules/chat.js';
import { WIKI } from './data/wikiData.js'; 

window.Waggle = { openChat, closeActiveChat };

let currentWikiTab = 'rasy';

export function initApp() {
    loadSettings(); // Wczytywanie czcionki i motywu
    initMap();
    loadPosts();
    loadInbox();
    renderWiki(currentWikiTab);
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
}

document.addEventListener('click', async (e) => {
    // 1. ZAMYKANIE MODALI
    if (e.target.classList.contains('close-modal-btn')) {
        e.target.closest('.modal').style.display = 'none';
    }

    // 2. NAWIGACJA DOLNA
    const navItem = e.target.closest('.nav-item');
    if (navItem) switchView(navItem.getAttribute('data-view'));

    // 3. MAPA & SPACER
    if (e.target.closest('#centerBtn')) centerOnMe();
    if (e.target.closest('#startWalkBtn')) startWalk();
    if (e.target.closest('#stopWalkBtn')) { stopWalk(); setTimeout(updateStatsUI, 500); }

    // 4. LOGOWANIE I REJESTRACJA
    if (e.target.closest('#loginBtn')) {
        const mail = document.getElementById('authEmail').value.trim();
        const pass = document.getElementById('authPass').value;
        auth.signInWithEmailAndPassword(mail, pass).catch(err => alert("Błąd logowania: " + err.message));
    }
    if (e.target.closest('#registerBtn')) {
        if(!document.getElementById('legalTerms').checked) {
            alert("Musisz zaakceptować regulamin, aby dołączyć do stada.");
            return;
        }
        const mail = document.getElementById('authEmail').value.trim();
        const pass = document.getElementById('authPass').value;
        auth.createUserWithEmailAndPassword(mail, pass).catch(err => alert("Błąd rejestracji: " + err.message));
    }
    if (e.target.closest('#logoutBtn')) auth.signOut().then(() => window.location.reload());

    // 5. POSTY I CZAT
    if (e.target.closest('#addPostBtn')) {
        const text = prompt("Co słychać u pieska?");
        if(text && text.length > 2) await saveCommunityPost(text, null).catch(console.error);
    }
    if (e.target.closest('#sendMsgBtn')) {
        const input = document.getElementById('chatInput');
        if (input.value.trim()) { sendMessage(input.value.trim()); input.value = ""; }
    }
    if (e.target.closest('#closeChatBtn')) closeActiveChat();

    // 6. WIKI ZAKŁADKI
    if (e.target.classList.contains('wiki-tab')) {
        document.querySelectorAll('.wiki-tab').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentWikiTab = e.target.getAttribute('data-tab');
        renderWiki(currentWikiTab);
    }

    // 7. EDYCJA PROFILU (Otwieranie i Zapisywanie)
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

    // 8. USTAWIENIA (Otwieranie i Zapisywanie)
    if (e.target.closest('#openSettingsBtn')) {
        document.getElementById('settingTheme').value = localStorage.getItem('waggle_theme') || 'light';
        document.getElementById('settingFontSize').value = localStorage.getItem('waggle_font') || 'small';
        document.getElementById('settings-modal').style.display = 'flex';
    }

    if (e.target.closest('#saveSettingsBtn')) {
        const theme = document.getElementById('settingTheme').value;
        const font = document.getElementById('settingFontSize').value;
        localStorage.setItem('waggle_theme', theme);
        localStorage.setItem('waggle_font', font);
        loadSettings(); // Aktualizuj na żywo
        document.getElementById('settings-modal').style.display = 'none';
    }
});

// FUNKCJE POMOCNICZE
function renderWiki(tab) {
    let html = "";
    if (tab === 'rasy') {
        WIKI.breeds.forEach(b => html += `<div class="post-card"><b>${b.name}</b><p>${b.desc}</p><small style="color:var(--secondary);">Energia: ${b.energy}</small></div>`);
    } else if (tab === 'trening') {
        WIKI.training.forEach(t => html += `<div class="post-card" style="border-left:4px solid var(--secondary);"><b>${t.title}</b><p>${t.desc}</p></div>`);
    } else if (tab === 'sytuacje') {
        WIKI.situations.forEach(s => html += `<div class="post-card" style="border-left:4px solid var(--danger);"><b>${s.title}</b><p>${s.desc}</p></div>`);
    }
    const container = document.getElementById('wiki-container');
    if (container) container.innerHTML = html;
}

function updateStatsUI() {
    if (!state.profile) return; 
    document.getElementById('profileNameDisplay').innerText = state.profile.name || "Piesek";
    document.getElementById('statWalks').innerText = state.profile.walkCount || 0;
    document.getElementById('statDist').innerText = ((state.profile.walkCount || 0) * 1.2).toFixed(1);
}

function loadSettings() {
    const theme = localStorage.getItem('waggle_theme') || 'light';
    const font = localStorage.getItem('waggle_font') || 'small';
    if (theme === 'dark') document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add('font-' + font);
}

initAuth(); 