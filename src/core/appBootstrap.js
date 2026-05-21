// src/core/appBootstrap.js
import { initRouter, switchView } from './router.js';
import { initMap, mapManager } from '../modules/map/mapManager.js'; 
import { initAuth } from '../modules/auth.js';
import { appState as state } from './state.js';
import { eventBus } from './eventBus.js';
import { auth, db } from './firebase.js';

import { initProfileListeners } from '../modules/profile/profileListeners.js';
import { loadPosts } from '../modules/posts/postsListeners.js';
import { loadInbox } from '../modules/chat/chatListeners.js';
import { fetchNearbyParks } from '../services/parksService.js';
import { renderParksOnMap } from '../modules/map/parksRenderer.js';
import { subscribeToWalks } from '../services/walkService.js';
import { renderWalks } from '../modules/map/walksRenderer.js';
import { subscribeToAlerts } from '../services/alertsService.js';
import { renderAlerts } from '../modules/alerts/alertsRenderer.js'; 

import { initGlobalUtils } from '../ui/globalUtils.js';
import { fetchWeather } from '../services/weatherService.js';
import { initUiListeners } from '../ui/uiListeners.js';
import { renderWiki } from '../ui/wikiRenderer.js';
import { initWaggleApi } from './waggleApi.js';

export { renderWiki };

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
    if (tempEl && state.weather) tempEl.innerHTML = `${state.weather.icon} ${state.weather.temp}°C`;

    if(state.location.lat && state.location.lng) updateUserMarker(state.location.lat, state.location.lng);
}

function loadSettings() {
    const theme = localStorage.getItem('waggle_theme') || 'light';
    const font = localStorage.getItem('waggle_font') || '14px';
    if (theme === 'dark') document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');
    document.body.style.fontSize = font;
    document.documentElement.style.setProperty('--base-font-size', font);
    state.isGhostMode = localStorage.getItem('waggle_ghost_mode') === 'true';
    state.isHiddenMode = localStorage.getItem('waggle_hidden_mode') === 'true';
    const ghostInput = document.getElementById('settingGhostMode') || document.getElementById('settingSearchable');
    const hiddenInput = document.getElementById('settingHiddenMode') || document.getElementById('settingHidden');
    if (ghostInput) ghostInput.checked = state.isGhostMode;
    if (hiddenInput) hiddenInput.checked = state.isHiddenMode;
    if(document.getElementById('settingFontSize')) document.getElementById('settingFontSize').value = font;
    if(document.getElementById('settingTheme')) document.getElementById('settingTheme').value = theme;
}

export function bootstrapApp() {
    initGlobalUtils();
    loadSettings();
    initWaggleApi(updateUserMarker);
    window.Waggle.updateStatsUI = updateStatsUI; 
    
    let lastFirebaseUploadTime = 0;
    let lastUploadedCoords = { lat: null, lng: null };

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

                    // 🔥 Zmiana od Konsultanta: Natychmiastowe ustawienie widoku i opóźnione przeliczenie mapy 🔥
                    state.map.instance.setView([lat, lng], 15, { animate: false });
                    setTimeout(() => {
                        if(state.map.instance) {
                            state.map.instance.invalidateSize(true);
                        }
                    }, 300);

                    // Pancerne zabezpieczenie ResizeObserver
                    const mapContainer = document.getElementById('map');
                    if (mapContainer && window.ResizeObserver) {
                        const resizeObserver = new ResizeObserver(() => {
                            if (state.map.instance) state.map.instance.invalidateSize();
                        });
                        resizeObserver.observe(mapContainer);
                    }

                    state.activeListeners.walks = subscribeToWalks(walks => renderWalks(walks));
                    state.activeListeners.alerts = subscribeToAlerts(alerts => renderAlerts(alerts));
                    state.activeListeners.posts = loadPosts();
                    state.activeListeners.inbox = loadInbox();

                    fetchWeather(lat, lng); 
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
            
            // Poprawka dla starszych przeglądarek przy przełączaniu zakładek
            if (view === 'map') {
                setTimeout(() => {
                    if (state.map.instance) state.map.instance.invalidateSize(true);
                }, 150);
            }
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
