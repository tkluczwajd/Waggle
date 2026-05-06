import { state, clearListeners } from './core/state.js';
import { auth, db } from './core/firebase.js';
import { initAuth } from './modules/auth.js';
import { initMap, centerOnMe, centerOnTarget } from './modules/map.js';
import { startWalk, stopWalk } from './modules/walk.js';
import { loadPosts, saveCommunityPost, openLightbox } from './modules/posts.js';
import { loadInbox, sendMessage, openChat, closeActiveChat } from './modules/chat.js';
import { WIKI } from './data/wikiData.js'; 

window.Waggle = { openChat, closeActiveChat, centerOnTarget, openLightbox };

let currentWikiTab = 'rasy';

export function initApp() {
    loadSettings(); // Wczytuje rozmiar czcionki i motyw
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
    // ZAMYKANIE MODALI
    if (e.target.classList.contains('close-modal-btn')) {
        e.target.closest('.modal').style.display = 'none';
    }

    // NAWIGACJA
    const navItem = e.target.closest('.nav-item');
    if (navItem) switchView(navItem.getAttribute('data-view'));

    // MAPA
    if (e.target.closest('#centerBtn')) centerOnMe();
    if (e.target.closest('#startWalkBtn')) startWalk();
    if (e.target.closest('#stopWalkBtn')) { stopWalk(); setTimeout(updateStatsUI, 500); }

    // ALERTY (Rozwiązanie zgłoszonego problemu)
    if (e.target.closest('#triggerAlertBtn')) {
        document.getElementById('alert-modal').style.display = 'flex';
    }
    if (e.target.closest('#saveAlertBtn')) {
        const text = document.getElementById('alertTextInput').value;
        if (text && state.location.lat) {
            db.collection("alerts").add({ text, lat: state.location.lat, lng: state.location.lng, createdAt: Date.now(), creator: state.user.uid })
            .then(() => {
                document.getElementById('alert-modal').style.display = 'none';
                document.getElementById('alertTextInput').value = '';
                alert("Znacznik ostrzegawczy został dodany na mapę!");
            });
        }
    }

    // POGODA NA 3 DNI (Rozwiązanie zgłoszonego problemu)
    if (e.target.closest('#weatherWidgetBtn')) {
        document.getElementById('weather-modal').style.display = 'flex';
        loadWeatherForecast();
    }

    // LOGOWANIE / WYLOGOWANIE
    if (e.target.closest('#loginBtn')) {
        const mail = document.getElementById('authEmail').value.trim();
        const pass = document.getElementById('authPass').value;
        auth.signInWithEmailAndPassword(mail, pass).catch(err => alert("Błąd: " + err.message));
    }
    if (e.target.closest('#registerBtn')) {
        if(!document.getElementById('legalTerms').checked) return alert("Zaakceptuj regulamin.");
        const mail = document.getElementById('authEmail').value.trim();
        const pass = document.getElementById('authPass').value;
        auth.createUserWithEmailAndPassword(mail, pass).catch(err => alert("Błąd: " + err.message));
    }
    if (e.target.closest('#logoutBtn')) auth.signOut().then(() => window.location.reload());

    // POSTY I CZAT
    if (e.target.closest('#addPostBtn')) {
        const text = prompt("Co słychać u pieska?");
        if(text && text.length > 2) await saveCommunityPost(text, null).catch(console.error);
    }
    if (e.target.closest('#sendMsgBtn')) {
        const input = document.getElementById('chatInput');
        if (input.value.trim()) { sendMessage(input.value.trim()); input.value = ""; }
    }
    if (e.target.closest('#closeChatBtn')) closeActiveChat();

    // WIKI
    if (e.target.classList.contains('wiki-tab-btn')) {
        document.querySelectorAll('.wiki-tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentWikiTab = e.target.getAttribute('data-tab');
        renderWiki(currentWikiTab);
    }

    // EDYCJA PROFILU
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

    // USTAWIENIA (Otwieranie)
    if (e.target.closest('#openSettingsBtn')) {
        document.getElementById('settingTheme').value = localStorage.getItem('waggle_theme') || 'light';
        document.getElementById('settingFontSize').value = localStorage.getItem('waggle_font') || '14px';
        // Zaznaczenie checkboxa prywatności (domyślnie włączone)
        document.getElementById('settingSearchable').checked = state.profile?.isSearchable !== false;
        document.getElementById('settings-modal').style.display = 'flex';
    }
    
    // USTAWIENIA (Zapisywanie + zapis prywatności w Firebase)
    if (e.target.closest('#saveSettingsBtn')) {
        const theme = document.getElementById('settingTheme').value;
        const font = document.getElementById('settingFontSize').value;
        const isSearchable = document.getElementById('settingSearchable').checked;

        localStorage.setItem('waggle_theme', theme);
        localStorage.setItem('waggle_font', font);
        
        // Zapis udostępniania danych w bazie
        db.collection("users").doc(state.user.uid).set({ isSearchable }, { merge: true }).then(() => {
            if (state.profile) state.profile.isSearchable = isSearchable;
            loadSettings(); // Aktualizacja wyglądu natychmiast
            document.getElementById('settings-modal').style.display = 'none';
            alert("Ustawienia zapisane!");
        });
    }
});

// POBIERANIE POGODY NA 3 DNI
async function loadWeatherForecast() {
    if(!state.location.lat) {
        document.getElementById('weather-forecast-content').innerHTML = "Brak dostępu do GPS.";
        return;
    }
    try {
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${state.location.lat}&longitude=${state.location.lng}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
        const d = await r.json();
        let html = "";
        const dni = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
        
        for(let i=0; i<3; i++) {
            const dataObj = new Date(d.daily.time[i]);
            const nazwaDnia = i === 0 ? "Dzisiaj" : (i === 1 ? "Jutro" : dni[dataObj.getDay()]);
            const max = Math.round(d.daily.temperature_2m_max[i]);
            const min = Math.round(d.daily.temperature_2m_min[i]);
            
            html += `
                <div style="padding:15px; background:var(--bg-color); border-radius:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; box-shadow:var(--soft-shadow);">
                    <b style="font-size:16px;">${nazwaDnia}</b>
                    <span style="font-weight:800; color:var(--text-muted);">↓${min}°C &nbsp; <span style="color:var(--danger);">↑${max}°C</span></span>
                </div>`;
        }
        document.getElementById('weather-forecast-content').innerHTML = html;
    } catch(e) {
        document.getElementById('weather-forecast-content').innerHTML = "Błąd serwera pogodowego.";
    }
}

function renderWiki(tab) {
    let html = "";
    if (tab === 'rasy') {
        WIKI.breeds.forEach(b => html += `<div class="post-card"><b>${b.name}</b><p style="margin:5px 0 10px;">${b.desc}</p><small style="color:var(--secondary);">Energia: ${b.energy}</small></div>`);
    } else if (tab === 'trening') {
        WIKI.training.forEach(t => html += `<div class="post-card" style="border-left:4px solid var(--secondary);"><b>${t.title}</b><p style="margin-top:5px;">${t.desc}</p></div>`);
    } else if (tab === 'sytuacje') {
        WIKI.situations.forEach(s => html += `<div class="post-card" style="border-left:4px solid var(--danger);"><b>${s.title}</b><p style="margin-top:5px;">${s.desc}</p></div>`);
    }
    const container = document.getElementById('wiki-content');
    if (container) container.innerHTML = html;
}

function updateStatsUI() {
    if (!state.profile) return; 
    document.getElementById('profileNameDisplay').innerText = state.profile.name || "Piesek";
    if (state.profile.avatar) document.getElementById('profileAvatar').src = state.profile.avatar;
    document.getElementById('statWalks').innerText = state.profile.walkCount || 0;
    document.getElementById('statDist').innerText = ((state.profile.walkCount || 0) * 1.2).toFixed(1);
}

function loadSettings() {
    const theme = localStorage.getItem('waggle_theme') || 'light';
    const font = localStorage.getItem('waggle_font') || '14px';
    if (theme === 'dark') document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
    document.documentElement.style.setProperty('--base-font-size', font);
}

initAuth();