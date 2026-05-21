// src/core/appBootstrap.js
import { initRouter } from './router.js';
import { initProfileListeners } from '../modules/profile/profileListeners.js';
import { initGlobalUtils } from '../ui/globalUtils.js';
import { initUiListeners } from '../ui/uiListeners.js';
import { initWaggleApi } from './waggleApi.js';
import { setupAuth } from './authInit.js';
import { setupSubscriptions } from './subscriptionInit.js';
import { setupLocationTracking } from './locationInit.js';
import { renderWiki } from '../ui/wikiRenderer.js';
import { updateStatsUI, updateUserMarker, loadSettings } from '../ui/uiHelpers.js';
import { initMap, mapManager } from '../modules/map/mapManager.js'; // 🔥 Poprawiony import mapy
import { appState as state } from './state.js';
import { fetchWeather } from '../services/weatherService.js';
import { fetchNearbyParks } from '../services/parksService.js';
import { renderParksOnMap } from '../modules/map/parksRenderer.js';

export function bootstrapApp() {
    initGlobalUtils();
    loadSettings();
    initWaggleApi(updateUserMarker);
    window.Waggle.updateStatsUI = updateStatsUI; 

    // Startujemy auth, po którym odpala się reszta aplikacji
    setupAuth(() => {
        initRouter();
        initProfileListeners();
        initUiListeners(); // 🔥 Teraz to się załaduje, więc przyciski ożyją!

        setupLocationTracking((lat, lng) => {
            initMap();
            state.map.instance = mapManager.map;
            updateStatsUI();

            state.map.instance.setView([lat, lng], 15, { animate: false });
            setTimeout(() => { if(state.map.instance) state.map.instance.invalidateSize(true); }, 300);

            setupSubscriptions();
            fetchWeather(lat, lng);
            renderWiki('rasy');

            // Przywrócone ładowanie psich parków
            (async () => {
                try {
                    const container = document.getElementById('places-container'); 
                    const places = await fetchNearbyParks(lat, lng); 
                    renderParksOnMap(places);
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
                    if (container) container.innerHTML = html; 
                    state.placesLoaded = true;
                } catch (e) { console.warn("Błąd auto-ładowania parków:", e); }
            })();

        });
    });
    console.log("🚀 Waggle: Bootstrap zainicjalizowany!");
}
