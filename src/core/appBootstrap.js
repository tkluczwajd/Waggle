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

// 🔥 NOWOŚĆ: Importujemy wycięty moduł klikalności oraz lokalny bank wiedzy offline
import { initUiListeners } from '../ui/uiListeners.js';
import { WIKI } from '../data/wikiData.js';

// --- SEKCJA FUNKCJI POMOCNICZYCH ---

// 🎯 ULTRA OPTYMALIZACJA UX & KOSZTÓW: Pobieranie wiedzy z lokalnego pliku (0ms czasu ładowania i 0 kosztów Firebase!)
// Nadpisz tę funkcję w src/core/appBootstrap.js

// Nadpisz sekcję renderWiki oraz początek mostków w src/core/appBootstrap.js

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
            tagsHtml = `<div style="display:flex; flex-wrap:wrap; gap:6px; margin: 8px 0 0 0;">`;
            item.tags.forEach(tag => {
                tagsHtml += `<span style="font-size:11px; font-weight:800; background:var(--panel-bg); color:var(--text-color); padding:4px 8px; border-radius:12px; border:1px solid var(--border-color);">${tag}</span>`;
            });
            tagsHtml += `</div>`;
        }

        // 🔥 POPRAWKA SKALOWANIA: Ustawiamy object-fit: cover oraz stały punkt zakotwiczenia (center)
        let imgHtml = item.img ? `
            <div style="width:100%; height:160px; overflow:hidden; border-radius:12px; margin-bottom:12px; border:1px solid var(--border-color);">
                <img src="${item.img}" style="width:100%; height:100%; object-fit:cover; object-position:center;">
            </div>
        ` : "";

        // 🔥 Dodajemy aktywne kliknięcie (cursor:pointer) otwierające modal szczegółów
        html += `
            <div class="post-card" onclick="window.Waggle.openWikiDetails('${item.id}', '${tab}')" style="border-left: 4px solid var(--secondary); padding:18px; margin-bottom: 15px; text-align: left; background:var(--card-bg); cursor:pointer; transition: transform 0.2s;">
                ${imgHtml}
                <b style="font-size: 18px; color:var(--text-color);">⚡ ${item.title}</b>
                ${tagsHtml}
            </div>
        `;
    });
    
    container.innerHTML = html || '<p style="text-align:center; padding:30px; color:var(--text-muted); font-weight:700;">Nie znaleziono pasujących porad ani ras. 🐾</p>';
}

// Funkcja obsługująca zaawansowane okno szczegółów encyklopedii
function openWikiDetails(id, tab) {
    const modal = document.getElementById('wiki-details-modal');
    const items = WIKI[tab] || [];
    const item = items.find(i => i.id === id);
    if (!modal || !item) return;

    // Uzpelnianie podstawowych danych
    document.getElementById('wikiDetailsTitle').innerText = item.title;
    document.getElementById('wikiDetailsDesc').innerText = item.desc;
    
    const imgEl = document.getElementById('wikiDetailsImg');
    if(item.img) {
        imgEl.src = item.img;
        imgEl.parentElement.style.display = "block";
    } else {
        imgEl.parentElement.style.display = "none";
    }

    // Uzpelnianie tagów w modalu
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

// --- BOOTSTRAP APLIKACJI (Fragment rejestracji mostków globalnych) ---
export function bootstrapApp() {
    initGlobalUtils();
    loadSettings();

    window.Waggle = window.Waggle || {};
    window.Waggle.updateStatsUI = updateStatsUI;
    window.Waggle.triggerMarkerRefresh = updateUserMarker;
    window.Waggle.executeSearch = (query) => { if (typeof searchUsers === 'function') searchUsers(query); };
    window.Waggle.centerOnTarget = (lat, lng) => { switchView('map'); setTimeout(() => mapManager.flyTo(lat, lng, 16), 300); };
    window.Waggle.openWikiDetails = openWikiDetails; // 🔥 Rejestrujemy pomost otwierania modalu szczegółów Wiki
window.Waggle.likeWiki = (id) => {
        // Pobieramy dotychczasowe ulubione z pamieci telefonu lub tworzymy czystą tablicę
        let favorites = JSON.parse(localStorage.getItem('waggle_wiki_favorites')) || [];
        
        if (favorites.includes(id)) {
            // Jeśli już tam jest – usuwamy go (odlubienie)
            favorites = favorites.filter(favId => favId !== id);
            localStorage.setItem('waggle_wiki_favorites', JSON.stringify(favorites));
            window.Waggle.showToast("Usunięto z ulubionych 💔");
        } else {
            // Jeśli go nie ma – dodajemy do listy offline
            favorites.push(id);
            localStorage.setItem('waggle_wiki_favorites', JSON.stringify(favorites));
            window.Waggle.showToast("Zapisano w ulubionych poradach! ❤️");
        }
        
        // Odświeżamy widok, by natychmiast zaktualizować kolor serduszka w UI
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

    // Odpalamy pas startowy Auth dopiero po udanym zalogowaniu
    initAuth(() => {
        initRouter();
        initProfileListeners();
        
        // 🔥 NOWOŚĆ: Inicjalizujemy globalne listenery kliknięć z nowego pliku!
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
                    
                    // 🔥 NOWOŚĆ AUTO-START: Inicjalnie napełniamy Wiki pierwszą kategorią bez czekania na kliknięcie!
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

        // Obsługa przełączania widoków (Unsubscribe system)
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
