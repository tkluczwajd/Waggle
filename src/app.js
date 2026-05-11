import { initAuth } from './modules/auth.js';
import { initMap, mapManager } from './modules/map/mapManager.js'; 
import { initProfileListeners } from './modules/profile/profileListeners.js';
import { loadPosts, setPostFilter, addPostComment, saveCommunityPost } from './modules/posts/postsListeners.js';
import { loadInbox, sendMessage, searchUsers } from './modules/chat/chatListeners.js';
import { initRouter } from './core/router.js';
import { appState as state } from './core/state.js';
import { eventBus } from './core/eventBus.js';
import { db, fb } from './core/firebase.js';
import { fetchNearbyParks } from './services/parksService.js';
import { renderParksOnMap } from './modules/map/parksRenderer.js';

window.Waggle = window.Waggle || {};

// 1. GLOBALNY TOAST Z SOBOTY
window.Waggle.showToast = (msg) => {
    let t = document.getElementById('waggle-toast');
    if(!t) {
        t = document.createElement('div'); t.id = 'waggle-toast';
        t.style.cssText = 'position:fixed; bottom:110px; left:50%; transform:translateX(-50%); background:#2d3436; color:#fff; padding:12px 24px; border-radius:25px; font-size:14px; font-weight:800; z-index:10000; border:2px solid var(--primary); transition:opacity 0.3s; text-align:center;';
        document.body.appendChild(t);
    }
    t.innerText = msg; t.style.display = 'block'; t.style.opacity = '1';
    setTimeout(() => { t.style.opacity = '0'; setTimeout(()=>t.style.display='none',300); }, 3500);
};

// 2. FUNKCJE POMOCNICZE Z SOBOTY (Pogoda, Statystyki, Miejsca)
function getWeatherIcon(code) {
    if (code === 0) return '☀️'; if (code <= 3) return '⛅'; if (code <= 48) return '🌫️';
    if (code <= 55 || (code >= 61 && code <= 65) || (code >= 80 && code <= 82)) return '🌧️';
    if (code <= 77) return '❄️'; if (code >= 95) return '⛈️'; return '🌡️';
}

function fetchWeather(lat, lng) {
    if(lat && lng) {
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`)
        .then(r=>r.json()).then(d => {
            const tempEl = document.getElementById('weather-temp');
            if(tempEl) tempEl.innerText = `${Math.round(d.current_weather.temperature)}°C`;
            const contentEl = document.getElementById('weather-forecast-content');
            if(contentEl) {
                let html = `<div style="text-align:center; margin-bottom:15px;"><b style="font-size:20px;">Dziś: ${Math.round(d.current_weather.temperature)}°C ${getWeatherIcon(d.current_weather.weathercode)}</b></div>`;
                html += `<div style="display:flex; justify-content:space-around; border-top:1px solid var(--border-color); padding-top:15px;">`;
                for(let i=0; i<3; i++) {
                    const date = new Date(d.daily.time[i]).toLocaleDateString('pl-PL', {weekday: 'short'});
                    html += `<div style="text-align:center;"><div style="font-size:11px; font-weight:800; color:var(--text-muted);">${date}</div><div style="font-size:24px;">${getWeatherIcon(d.daily.weathercode[i])}</div><div style="font-weight:900;">${Math.round(d.daily.temperature_2m_max[i])}°</div><div style="font-size:10px; color:var(--text-muted);">${Math.round(d.daily.temperature_2m_min[i])}°</div></div>`;
                }
                html += `</div>`;
                contentEl.innerHTML = html;
            }
        }).catch(e=>console.warn("Błąd pogody:", e));
    }
}

function updateStatsUI() {
    if (!state.profile) return; 
    const p = state.profile;
    const nameEl = document.getElementById('profileNameDisplay'); if(nameEl) nameEl.innerText = p.name || "Piesek";
    const walksEl = document.getElementById('statWalks'); if(walksEl) walksEl.innerText = p.walkCount || 0;
    const distEl = document.getElementById('statDist'); if(distEl) distEl.innerText = ((p.walkCount || 0) * 1.2).toFixed(1);
    
    let lvl = "🌱 Nowik";
    if (p.walkCount >= 5) lvl = "🐕 Spacerowicz"; if (p.walkCount >= 20) lvl = "🐺 Weteran Osiedla"; if (p.walkCount >= 50) lvl = "👑 Alfa Stada";
    const lvlEl = document.getElementById('profileLevelDisplay'); if (lvlEl) lvlEl.innerText = lvl;

    const av = document.getElementById('profileAvatar');
    if(av) av.src = (p.avatar && p.avatar.trim() !== "") ? p.avatar : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
}

function loadSettings() {
    const theme = localStorage.getItem('waggle_theme') || 'light';
    const font = localStorage.getItem('waggle_font') || '14px';
    if (theme === 'dark') document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');
    document.documentElement.style.setProperty('--base-font-size', font);
    state.isGhostMode = localStorage.getItem('waggle_ghost_mode') === 'true';
    state.isHiddenMode = localStorage.getItem('waggle_hidden_mode') === 'true';
    if(document.getElementById('settingSearchable')) document.getElementById('settingSearchable').checked = state.isGhostMode;
    if(document.getElementById('settingHidden')) document.getElementById('settingHidden').checked = state.isHiddenMode;
    if(document.getElementById('settingFontSize')) document.getElementById('settingFontSize').value = font;
    if(document.getElementById('settingTheme')) document.getElementById('settingTheme').value = theme;
}

// 3. WIKI (BAZA WIEDZY Z SOBOTY)
function renderWiki(tab) {
    const container = document.getElementById('wiki-content');
    if (!container) return;
    container.innerHTML = '<p style="text-align:center; padding:20px;">Węszenie... 🐾</p>';
    db.collection("wiki").where("category", "==", tab).onSnapshot(snap => {
        let html = "";
        snap.forEach(doc => {
            const item = doc.data(); const id = doc.id;
            const hasLiked = item.likes && item.likes.includes(state.user?.uid);
            let imgHtml = item.img ? `<img src="${item.img}" style="width:100%; height:160px; object-fit:cover; border-radius:12px; margin-bottom:10px;">` : "";
            html += `<div class="post-card" style="border-left: 4px solid var(--secondary); padding:15px; margin-bottom: 15px; text-align: left;">
                ${imgHtml}<b style="font-size: 17px;">⚡ ${item.title || item.name}</b><p style="margin-top:10px; font-size:14px; color:var(--text-muted); line-height: 1.5;">${item.desc}</p>
                <div style="margin-top: 15px;"><span style="font-size:13px; cursor:pointer; font-weight:800; color:${hasLiked ? 'var(--danger)' : 'var(--text-muted)'}" onclick="Waggle.likeWiki('${id}')">${hasLiked ? '❤️' : '🤍'} ${item.likes ? item.likes.length : 0}</span></div></div>`;
        });
        container.innerHTML = html || '<p style="text-align:center;">Brak wpisów.</p>';
    });
}
window.Waggle.likeWiki = (id) => {
    if(!state.user) return;
    const ref = db.collection("wiki").doc(id);
    ref.get().then(doc => {
        const likes = doc.data().likes || [];
        if (likes.includes(state.user.uid)) ref.update({ likes: fb.firestore.FieldValue.arrayRemove(state.user.uid) });
        else { ref.update({ likes: fb.firestore.FieldValue.arrayUnion(state.user.uid) }); window.Waggle.showToast("Dzięki za ocenę! ❤️"); }
    });
};

export function initApp() {
    initRouter();
    initMap();
    loadPosts();
    loadInbox();
    initProfileListeners();
    loadSettings();

    // PODPIĘCIE EVENTBUS (Z soboty) - To ożywi statystyki po logowaniu
    eventBus.on('profileUpdated', () => updateStatsUI());
    eventBus.on('viewChanged', async (view) => {
        if (view === 'wiki') renderWiki('rasy');
        if (view === 'places' && state.location.lat) {
            const container = document.getElementById('places-container');
            container.innerHTML = '<p style="text-align:center; padding:20px; color:var(--text-muted);">Szukam parków... 🧭</p>';
            const places = await fetchNearbyParks(state.location.lat, state.location.lng);
            renderParksOnMap(places);
            let html = "";
            places.forEach(place => {
                const color = place.isDogPark ? 'var(--secondary)' : 'var(--primary)';
                html += `
                    <div class="post-card" style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; padding: 15px; border-left: 4px solid ${color};">
                        <div style="display:flex; align-items:center; gap:15px;">
                            <div style="font-size:30px;">${place.isDogPark ? '🏞️' : '🌳'}</div>
                            <div>
                                <b style="font-size:16px; color:var(--text-color);">${place.name}</b><br>
                                <span style="font-size:12px; color:var(--text-muted); font-weight:800;">${place.isDogPark ? 'Wybieg' : 'Park'} • ${place.distance.toFixed(1)} km</span>
                            </div>
                        </div>
                        <button class="btn-outline" style="padding:8px 12px; font-size:12px; border-color:${color}; color:${color}; width:auto;" onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}', '_blank')">Prowadź</button>
                    </div>`;
            });
            container.innerHTML = html;
        }
    });

    // 📍 1. GPS i śledzenie
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(pos => {
            const lat = pos.coords.latitude; const lng = pos.coords.longitude;
            const isFirstFix = !state.location.lat;
            state.location.lat = lat; state.location.lng = lng;

            if(isFirstFix) fetchWeather(lat, lng); // Pobierz pogodę przy pierwszym namiarze

            if(!window.userMarker && !state.isHiddenMode) {
                window.userMarker = window.L.marker([lat, lng], {
                    icon: window.L.divIcon({ className: '', html: '<div style="background:#34ace0; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(0,0,0,0.3);"></div>', iconSize: [20,20] })
                });
                mapManager.addMarkerToLayer('user', window.userMarker);
                mapManager.flyTo(lat, lng, 15); 
            } else if (window.userMarker) {
                window.userMarker.setLatLng([lat, lng]); 
            }
        }, err => console.log("Czekam na GPS..."), { enableHighAccuracy: true });
    }

    // 🔌 2. SUPER-KLEJ DO WSZYSTKICH PRZYCISKÓW (Połączenie nowej architektury z logiką sobotnią)
    document.addEventListener('click', (e) => {
        
        // ZAKŁADKI WIKI
        if (e.target.classList.contains('wiki-tab-btn')) {
            document.querySelectorAll('.wiki-tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active'); renderWiki(e.target.getAttribute('data-tab'));
        }

        // ZAPISYWANIE USTAWIEŃ (Z soboty)
        if (e.target.closest('#saveSettingsBtn')) {
            const isGhost = document.getElementById('settingSearchable')?.checked || false;
            const isHidden = document.getElementById('settingHidden')?.checked || false;
            const font = document.getElementById('settingFontSize')?.value || '14px';
            const theme = document.getElementById('settingTheme')?.value || 'light';
            
            localStorage.setItem('waggle_ghost_mode', isGhost.toString()); localStorage.setItem('waggle_hidden_mode', isHidden.toString());
            localStorage.setItem('waggle_font', font); localStorage.setItem('waggle_theme', theme);
            
            state.isGhostMode = isGhost; state.isHiddenMode = isHidden;
            document.documentElement.style.setProperty('--base-font-size', font);
            if (theme === 'dark') document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');
            
            if (isHidden && state.user) db.collection("walks").doc(state.user.uid).delete();
            document.getElementById('settings-modal').style.display = 'none';
            window.Waggle.showToast("Ustawienia zapisane!");
        }

        // MAPA I SPACERY
        if (e.target.closest('#centerBtn')) {
            if (state.location.lat && state.location.lng) { mapManager.flyTo(state.location.lat, state.location.lng, 15); window.Waggle.showToast("Zlokalizowano! 📍"); }
        }
        if (e.target.closest('#startWalkBtn')) {
            state.isWalking = true;
            document.getElementById('startWalkBtn').style.display = 'none'; document.getElementById('stopWalkBtn').style.display = 'inline-block'; document.getElementById('statusInput').style.display = 'none';
            if (state.user && state.location.lat && !state.isHiddenMode) {
                db.collection("walks").doc(state.user.uid).set({
                    uid: state.user.uid, name: state.profile?.name || "Piesek", avatar: state.profile?.avatar || "",
                    lat: state.location.lat, lng: state.location.lng, timestamp: Date.now()
                }, { merge: true });
            }
            window.Waggle.showToast("Spacer rozpoczęty! 🐾");
        }
        if (e.target.closest('#stopWalkBtn')) {
            state.isWalking = false;
            document.getElementById('stopWalkBtn').style.display = 'none'; document.getElementById('startWalkBtn').style.display = 'inline-block'; document.getElementById('statusInput').style.display = 'inline-block'; document.getElementById('statusInput').value = '';
            if (state.user) db.collection("walks").doc(state.user.uid).delete();
            window.Waggle.showToast("Spacer zakończony! 🏁");
        }

        // MODALE ORAZ WIDŻETY (Zamykanie i otwieranie)
        if (e.target.closest('#weatherWidgetBtn')) document.getElementById('weather-modal').style.display = 'flex';
        if (e.target.closest('#triggerAlertBtn')) document.getElementById('alert-modal').style.display = 'flex';
        if (e.target.closest('#openSettingsBtn')) document.getElementById('settings-modal').style.display = 'flex';
        if (e.target.closest('.close-modal-btn')) {
            const modal = e.target.closest('.modal') || e.target.closest('.modal-overlay');
            if(modal) modal.style.display = 'none';
        }
    });

    console.log("🚀 Waggle: Architektura Hybrydowa aktywna!");
}

initAuth(initApp);
