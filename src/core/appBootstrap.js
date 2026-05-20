// src/core/appBootstrap.js
import { initRouter, switchView } from './router.js';
import { initMap, mapManager } from '../modules/map/mapManager.js'; 
import { initAuth } from '../modules/auth.js';
import { appState as state } from './state.js';
import { eventBus } from './eventBus.js';
import { auth, db, fb } from './firebase.js';

import { initProfileListeners } from '../modules/profile/profileListeners.js';
import { loadPosts, setPostFilter, saveCommunityPost } from '../modules/posts/postsListeners.js';
import { loadInbox, searchUsers } from '../modules/chat/chatListeners.js';
import { fetchNearbyParks } from '../services/parksService.js';
import { renderParksOnMap } from '../modules/map/parksRenderer.js';
import { subscribeToWalks } from '../services/walkService.js';
import { renderWalks } from '../modules/map/walksRenderer.js';
import { subscribeToAlerts } from '../services/alertsService.js';
import { renderAlerts } from '../modules/alerts/alertsRenderer.js'; 
import { uploadImageToService as uploadImage } from '../services/postsService.js';

import { initGlobalUtils } from '../ui/globalUtils.js';
import { fetchWeather } from '../services/weatherService.js';

// 🔥 Importujemy wycięty moduł klikalności oraz lokalny bank wiedzy offline
import { initUiListeners } from '../ui/uiListeners.js';
import { WIKI } from '../data/wikiData.js';

// --- SEKCJA FUNKCJI POMOCNICZYCH ---

// Podmień funkcję renderWiki w src/core/appBootstrap.js

// Podmień funkcję renderWiki w src/core/appBootstrap.js

export function renderWiki(tab, searchQuery = "") {
    const container = document.getElementById('wiki-content');
    if (!container) return;
    
    const items = WIKI[tab] || [];
    let query = searchQuery.toLowerCase().trim();
    
    const filteredItems = items.filter(item => {
        if (!query) return true;
        const matchText = item.title.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query);
        const matchTags = item.tags && item.tags.some(t => t.toLowerCase().includes(query));
        const matchKeywords = item.keywords && item.keywords.some(k => k.toLowerCase().includes(query));
        
        let matchAdvanced = false;
        if (item.filters) {
            if (query.includes("dziec") && item.filters.kidsFriendly >= 4) matchAdvanced = true;
            if (query.includes("mieszkan") && item.filters.apartmentLive >= 4) matchAdvanced = true;
            if (query.includes("łatw") && item.filters.easyToTrain >= 4) matchAdvanced = true;
            if (query.includes("kanap") && item.filters.energyLevel <= 2) matchAdvanced = true;
        }
        return matchText || matchTags || matchKeywords || matchAdvanced;
    });

    let html = "";
    
    filteredItems.forEach(item => {
        let tagsHtml = "";
        if (item.tags && Array.isArray(item.tags)) {
            tagsHtml = `<div style="display:flex; flex-wrap:wrap; gap:4px; margin-top: 4px;">`;
            // Wyświetlamy max 2 tagi na liście, żeby nie przepełnić małego wiersza
            item.tags.slice(0, 2).forEach(tag => {
                tagsHtml += `<span style="font-size:9px; font-weight:800; background:var(--panel-bg); color:var(--text-muted); padding:2px 6px; border-radius:8px; border:1px solid var(--border-color);">${tag}</span>`;
            });
            tagsHtml += `</div>`;
        }

        // 🔥 FIX BRAKU ZDJĘCIA + UKŁAD LTR (Kompaktowa miniaturka z lewej)
        // Jeśli img nie istnieje lub rzuci błąd ładowania, onerror podstawi ładny kontener zastępczy
        const fallbackImg = `this.onerror=null; this.parentElement.innerHTML='<div style=\"width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--panel-bg);font-size:24px;\">🐾</div>';`;
        
        let imgHtml = `
            <div style="width: 70px; height: 70px; min-width: 70px; overflow:hidden; border-radius: 12px; border:1px solid var(--border-color); background: var(--panel-bg); position: relative;">
                <img src="${item.img || ''}" onerror="${fallbackImg}" style="width:100%; height:100%; object-fit:cover;">
            </div>
        `;

        // Budujemy superlekki wiersz listy (horyzontalny flex)
        html += `
            <div class="post-card" onclick="window.Waggle.openWikiDetails('${item.id}', '${tab}')" 
                 style="display: flex; align-items: center; gap: 14px; padding: 10px 12px; margin-bottom: 8px; text-align: left; background: var(--card-bg); cursor: pointer; border-radius: 14px; border: 1px solid var(--border-color); box-shadow: 0 2px 6px rgba(0,0,0,0.01);">
                
                ${imgHtml}
                
                <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center;">
                    <div style="display:flex; align-items:center; gap:4px;">
                        <span style="font-size:12px; flex-shrink:0;">⚡</span>
                        <b style="font-size: 15px; color:var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${item.title}</b>
                    </div>
                    <p style="margin: 2px 0 0 0; font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${item.desc}
                    </p>
                    ${tagsHtml}
                </div>
                
                <div style="color: var(--text-muted); font-size: 14px; padding-left: 4px; font-weight: bold;">➔</div>
            </div>
        `;
    });
    
    container.innerHTML = html || '<p style="text-align:center; padding:30px; color:var(--text-muted); font-weight:700;">Nie znaleziono pasujących porad ani ras. 🐾</p>';
}

// Podmień tę funkcję w src/core/appBootstrap.js

function openWikiDetails(id, tab) {
    const modal = document.getElementById('wiki-details-modal');
    const items = WIKI[tab] || [];
    const item = items.find(i => i.id === id);
    if (!modal || !item) return;

    // Uzupełnianie podstawowych danych tekstowych
    document.getElementById('wikiDetailsTitle').innerText = item.title;
    document.getElementById('wikiDetailsDesc').innerText = item.desc;
    
    // 🔥 FIX ZABEZPIECZENIA ZDJĘCIA W MODALU
    const imgEl = document.getElementById('wikiDetailsImg');
    if (imgEl) {
        if (item.img) {
            imgEl.parentElement.style.display = "block";
            imgEl.src = item.img;
            // Awaryjny autorski placeholder SVG, jeśli link z Unsplash wygaśnie
            imgEl.onerror = function() {
                this.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%23ccc'><rect width='100%' height='100%' fill='%23f1f2f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' font-weight='bold' fill='%23a4b0be'>🐾 Brak zdjęcia</text></svg>";
            };
        } else {
            // Jeśli obiekt w ogóle nie posiada zdefiniowanego zdjęcia
            imgEl.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%23ccc'><rect width='100%' height='100%' fill='%23f1f2f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' font-weight='bold' fill='%23a4b0be'>🐾 Brak zdjęcia</text></svg>";
        }
    }

    // Uzupełnianie tagów w modalu
    const tagsContainer = document.getElementById('wikiDetailsTags');
    tagsContainer.innerHTML = "";
    if (item.tags) {
        item.tags.forEach(tag => {
            tagsContainer.innerHTML += `<span style="font-size:12px; font-weight:800; background:var(--panel-bg); color:var(--text-color); padding:6px 12px; border-radius:12px; border:1px solid var(--border-color);">${tag}</span>`;
        });
    }

    // Budowanie paska statystyk liczbowych (tylko dla ras psów)
    const statsContainer = document.getElementById('wikiDetailsStats');
    if (item.filters && tab === 'rasy') {
        statsContainer.style.display = "grid";
        statsContainer.style.gridTemplateColumns = "1fr 1fr";
        statsContainer.style.gap = "10px";
        
        const labels = { kidsFriendly: "👶 Przyjazny dzieciom", easyToTrain: "🧠 Łatwość szkolenia", energyLevel: "⚡ Poziom energii", apartmentLive: "🛋️ Życie w bloku" };
        let statsHtml = "";
        for (const [key, value] of Object.entries(item.filters)) {
            let stars = "⭐".repeat(value);
            statsHtml += `<div style="font-size:13px; font-weight:800; color:var(--text-color);">${labels[key] || key}: <span style="letter-spacing:1px;">${stars}</span></div>`;
        }
        statsContainer.innerHTML = statsHtml;
    } else {
        statsContainer.style.display = "none";
    }

    modal.style.display = "flex";
}

function updateUserMarker(lat, lng) {
    const L = window.L; if (!L) return;
    if (state.isHiddenMode) {
        if (window.userMarker) { mapManager.map.removeLayer(window.userMarker); window.userMarker = null; }
        return; 
    }
    let displayLat = lat; let displayLng = lng;
    if (state.isGhostMode) {
        if (!state.ghostOffset) { state.ghostOffset = { lat: (Math.random() - 0.5) * 0.002, lng: (Math.random() - 0.5) * 0.002 }; }
        displayLat += state.ghostOffset.lat; displayLng += state.ghostOffset.lng;
    } else { state.ghostOffset = null; }

    const avatarSrc = state.profile?.avatar;
    let iconHtml = avatarSrc ? 
        `<div style="width:38px; height:38px; border-radius:50%; border:3px solid var(--secondary); box-shadow:0 0 15px rgba(0,0,0,0.3); overflow:hidden; background:white;"><img src="${avatarSrc}" style="width:100%; height:100%; object-fit:cover;"></div>` : 
        `<div style="background:#34ace0; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(0,0,0,0.3);"></div>`;
    
    const icon = L.divIcon({ className: '', html: iconHtml, iconSize: avatarSrc ? [38,38] : [20,20] });
    if (!window.userMarker) { window.userMarker = L.marker([displayLat, displayLng], { icon }); mapManager.addMarkerToLayer('user', window.userMarker); }
    else { window.userMarker.setLatLng([displayLat, displayLng]); window.userMarker.setIcon(icon); }
}

function updateStatsUI() {
    if (!state.profile) return; const p = state.profile;
    const nameEl = document.getElementById('profileNameDisplay'); if(nameEl) nameEl.innerText = p.name || "Piesek";
    const walksEl = document.getElementById('statWalks'); if(walksEl) walksEl.innerText = p.walkCount || 0;
    const distEl = document.getElementById('statDist'); if(distEl) distEl.innerText = ((p.walkCount || 0) * 1.2).toFixed(1);
    const breedInput = document.getElementById('setupBreed'); if(breedInput) breedInput.value = state.profile.breed || "";
    const cityInput = document.getElementById('setupCity'); if(cityInput) cityInput.value = state.profile.city || "";
    let lvl = "🌱 Nowik";
    if (p.walkCount >= 5) lvl = "🐕 Spacerowicz"; if (p.walkCount >= 20) lvl = "🐺 Weteran Osiedla"; if (p.walkCount >= 50) lvl = "👑 Alfa Stada";
    const lvlEl = document.getElementById('profileLevelDisplay'); if (lvlEl) lvlEl.innerText = lvl;
    const av = document.getElementById('profileAvatar'); if(av) av.src = (p.avatar && p.avatar.trim() !== "") ? p.avatar : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
    
    const tempEl = document.getElementById('weather-temp');
    if (tempEl && state.weather) {
        tempEl.innerHTML = `${state.weather.icon} ${state.weather.temp}°C`;
    }

    if(state.location.lat && state.location.lng) updateUserMarker(state.location.lat, state.location.lng);
}

// 🔥 PRZYWRÓCONA FUNKCJA STRATEGICZNA: Wczytywanie motywu i czcionek z pamięci telefonu
// 🔥 POPRAWKA BŁĘDU GRY: Wczytywanie ustawień z pełną synchronizacją HTML i dynamiczną zmianą czcionki body
function loadSettings() {
    const theme = localStorage.getItem('waggle_theme') || 'light';
    const font = localStorage.getItem('waggle_font') || '14px';
    
    // Synchronizacja motywu wizualnego
    if (theme === 'dark') document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');
    
    // 🔥 FIX CZCIONKI: Wymuszamy zmianę rozmiaru bezpośrednio na body, by ominąć blokady sztywnych pikseli w CSS
    document.body.style.fontSize = font;
    document.documentElement.style.setProperty('--base-font-size', font);
    
    // Odczyt stanów prywatności
    state.isGhostMode = localStorage.getItem('waggle_ghost_mode') === 'true';
    state.isHiddenMode = localStorage.getItem('waggle_hidden_mode') === 'true';
    
    // 🔥 FIX PAMIĘCI TRYBU DUCHA: Szukamy suwaków w HTML i fizycznie ustawiamy ich zaznaczenie na start!
    const ghostInput = document.getElementById('settingGhostMode') || document.getElementById('settingSearchable');
    const hiddenInput = document.getElementById('settingHiddenMode') || document.getElementById('settingHidden');
    if (ghostInput) ghostInput.checked = state.isGhostMode;
    if (hiddenInput) hiddenInput.checked = state.isHiddenMode;
    
    if(document.getElementById('settingFontSize')) document.getElementById('settingFontSize').value = font;
    if(document.getElementById('settingTheme')) document.getElementById('settingTheme').value = theme;
}

// --- BOOTSTRAP APLIKACJI ---

export function bootstrapApp() {
    initGlobalUtils();
    loadSettings();

    window.Waggle = window.Waggle || {};
    window.Waggle.updateStatsUI = updateStatsUI;
    window.Waggle.triggerMarkerRefresh = updateUserMarker;
    window.Waggle.executeSearch = (query) => { if (typeof searchUsers === 'function') searchUsers(query); };
    window.Waggle.centerOnTarget = (lat, lng) => { switchView('map'); setTimeout(() => mapManager.flyTo(lat, lng, 16), 300); };
    window.Waggle.openWikiDetails = openWikiDetails;
    
    window.Waggle.likeWiki = (id) => {
        let favorites = JSON.parse(localStorage.getItem('waggle_wiki_favorites')) || [];
        if (favorites.includes(id)) {
            favorites = favorites.filter(favId => favId !== id);
            localStorage.setItem('waggle_wiki_favorites', JSON.stringify(favorites));
            window.Waggle.showToast("Usunięto z ulubionych 💔");
        } else {
            favorites.push(id);
            localStorage.setItem('waggle_wiki_favorites', JSON.stringify(favorites));
            window.Waggle.showToast("Zapisano w ulubionych poradach! ❤️");
        }
        const activeTabBtn = document.querySelector('.wiki-tab-btn.active');
        if (activeTabBtn) renderWiki(activeTabBtn.getAttribute('data-tab'));
    };

    window.Waggle.submitAlert = async () => {
        const input = document.getElementById('alertInput') || document.getElementById('alertTextInput');
        const text = input?.value;
        if(!text || text.trim() === "") return window.Waggle.showToast("Wpisz treść ostrzeżenia!");
        if(!state.location.lat) return window.Waggle.showToast("Brak GPS!");
        try {
            const timestamp = Date.now(); window.Waggle.showToast("Wysyłam zgłoszenie... ⚠️");
            let alertUrl = null; if(state.pendingAlertFile) { alertUrl = await uploadImage(state.pendingAlertFile); state.pendingAlertFile = null; }
            let finalLat = state.location.lat; let finalLng = state.location.lng;
            if (state.isGhostMode && state.ghostOffset) { finalLat += state.ghostOffset.lat; finalLng += state.ghostOffset.lng; }
            await db.collection("alerts").add({ text: text, lat: finalLat, lng: finalLng, createdAt: timestamp, imageUrl: alertUrl, userId: auth.currentUser ? auth.currentUser.uid : 'anon' });
            await saveCommunityPost(`⚠️ ALERT: ${text}`, alertUrl, false, null, true, true);
            const alertBtn = document.getElementById('alertAddPhotoBtn'); if (alertBtn) alertBtn.innerHTML = "📷 Dodaj zdjęcie zagrożenia";
            document.getElementById('alert-modal').style.display = 'none'; if(input) input.value = ''; window.Waggle.showToast("Zgłoszono zagrożenie! ⚠️");
        } catch (err) { console.error(err); window.Waggle.showToast("Błąd wysyłania!"); }
    };

    initAuth(() => {
        initRouter();
        initProfileListeners();
        initUiListeners();

        if ("geolocation" in navigator) {
            navigator.geolocation.watchPosition(pos => {
                const lat = pos.coords.latitude; const lng = pos.coords.longitude;
                const isFirstFix = !state.location.lat; state.location.lat = lat; state.location.lng = lng;
                
                if(isFirstFix) { 
                    initMap();
                    state.map.instance = mapManager.map;
                    updateStatsUI();

                    state.activeListeners.walks = subscribeToWalks(walks => renderWalks(walks));
                    state.activeListeners.alerts = subscribeToAlerts(alerts => renderAlerts(alerts));
                    state.activeListeners.posts = loadPosts();
                    state.activeListeners.inbox = loadInbox();

                    fetchWeather(lat, lng); 
                    mapManager.flyTo(lat, lng, 15); 
                    renderWiki('rasy');

                    (async () => {
                        try {
                            const container = document.getElementById('places-container'); const places = await fetchNearbyParks(lat, lng); renderParksOnMap(places);
                            let html = "";
                            places.forEach(place => {
                                const color = place.isDogPark ? 'var(--secondary)' : 'var(--primary)';
                                html += `<div class="post-card" style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; padding: 15px; border-left: 4px solid ${color};">
                                        <div style="display:flex; align-items:center; gap:15px;">
                                            <div style="font-size:30px;">${place.isDogPark ? '🏞️' : '🌳'}</div>
                                            <div><b style="font-size:16px; color:var(--text-color);">${place.name}</b><br><span style="font-size:12px; color:var(--text-muted); font-weight:800;">${place.isDogPark ? 'Wybieg' : 'Park'} • ${place.distance.toFixed(1)} km</span></div>
                                        </div>
                                        <button class="btn-outline" style="padding:8px 12px; font-size:12px; border-color:${color}; color:${color}; width:auto;" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}', '_blank')">Prowadź</button>
                                    </div>`;
                            });
                            if (container) container.innerHTML = html; state.placesLoaded = true;
                        } catch (e) { console.warn("Błąd auto-ładowania parków:", e); }
                    })();
                }
                
                if (state.isWalking && state.user && !state.isHiddenMode) {
                    let uLat = lat; let uLng = lng; if (state.isGhostMode && state.ghostOffset) { uLat += state.ghostOffset.lat; uLng += state.ghostOffset.lng; }
                    const now = Date.now();
                    const timePassed = (now - lastFirebaseUploadTime) / 1000;
                    let shouldUpload = false;
                    
                    if (!lastUploadedCoords.lat) shouldUpload = true;
                    else {
                        const distanceMoved = getDistanceInMeters(lastUploadedCoords.lat, lastUploadedCoords.lng, uLat, uLng);
                        if (timePassed >= 30 || distanceMoved >= 25) shouldUpload = true;
                    }

                    if (shouldUpload) {
                        db.collection("walks").doc(state.user.uid).set({ uid: state.user.uid, name: state.profile?.name || "Piesek", avatar: state.profile?.avatar || "", lat: uLat, lng: uLng, timestamp: now }, { merge: true });
                        lastFirebaseUploadTime = now; lastUploadedCoords = { lat: uLat, lng: uLng };
                    }
                }
                if(!state.isHiddenMode) updateUserMarker(lat, lng);
            }, err => console.log("Czekam na GPS..."), { enableHighAccuracy: true });
        }

        auth.onAuthStateChanged(user => {
            if (user) {
                db.collection("walks").doc(user.uid).get().then(doc => {
                    if (doc.exists) {
                        const diff = (Date.now() - (doc.data().timestamp || 0)) / 1000 / 60;
                        if (diff > 30) { db.collection("walks").doc(user.uid).delete(); state.isWalking = false; }  
                        else {
                            state.isWalking = true;
                            if(document.getElementById('startWalkBtn')) document.getElementById('startWalkBtn').style.display = 'none';
                            if(document.getElementById('stopWalkBtn')) document.getElementById('stopWalkBtn').style.display = 'inline-block';
                        }
                    }
                });
            }
        });

        eventBus.on('viewChanged', async (view) => {
            if (view !== 'community' && state.activeListeners.posts) { state.activeListeners.posts(); state.activeListeners.posts = null; }
            if (view !== 'chat' && state.activeListeners.inbox) { state.activeListeners.inbox(); state.activeListeners.inbox = null; }
            if (view === 'community' && !state.activeListeners.posts) { state.activeListeners.posts = loadPosts(); }
            if (view === 'chat' && !state.activeListeners.inbox) { state.activeListeners.inbox = loadInbox(); }
        });
    });

    console.log("🚀 Waggle: Bootstrap zainicjalizowany pomyślnie!");
}

function getDistanceInMeters(lat1, lng1, lat2, lng2) {
    const R = 6371e3; const phi1 = lat1 * Math.PI / 180; const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180; const deltaLambda = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); return R * c;
}

let lastFirebaseUploadTime = 0;
let lastUploadedCoords = { lat: null, lng: null };
