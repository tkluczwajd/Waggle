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
import { initMap } from '../modules/map/mapManager.js'; // 🔥 Tylko initMap, zero mapManagera!
import { appState as state } from './state.js';
import { fetchWeather } from '../services/weatherService.js';
import { fetchNearbyParks } from '../services/parksService.js';
import { renderParksOnMap } from '../modules/map/parksRenderer.js';
// 🔥 NOWY IMPORT:
import { initLiveFeed } from '../modules/map/liveFeed.js';

export function bootstrapApp() {
    initGlobalUtils();
    loadSettings();
    initWaggleApi(updateUserMarker);
    window.Waggle.updateStatsUI = updateStatsUI; 

    // Startujemy auth, po którym odpala się reszta aplikacji
    setupAuth(() => {
        initRouter();
        initProfileListeners();
        initUiListeners(); // Rejestrujemy kliknięcia

        // 🔥 ODPALAMY NASŁUCHIWANIE OKOLICY (Live Feed):
        initLiveFeed();

        setupLocationTracking((lat, lng) => {
            initMap(); // Ta funkcja sama tworzy mapę i zapisuje do state.map.instance
            updateStatsUI();

            // 🔥 Fix od konsultanta - czyste, bezpieczne centrowanie mapy
            if(state.map.instance) {
                state.map.instance.setView([lat, lng], 15, { animate: false });
                setTimeout(() => { 
                    state.map.instance.invalidateSize(true); 
                }, 300);
            }

            setupSubscriptions();
            fetchWeather(lat, lng);
            renderWiki('rasy');

            // Ładowanie psich parków i lasów (Zabezpieczone przed błędami danych)
            (async () => {
                try {
                    const container = document.getElementById('places-container'); 
                    const places = await fetchNearbyParks(lat, lng); 
                    
                    if (places && places.length > 0) {
                        renderParksOnMap(places);
                    }
                    
                    let html = "";
                    places.forEach(place => {
                        const nameLower = (place.name || "").toLowerCase();
                        let color = 'var(--primary)'; 
                        let emoji = '🌳';
                        let label = 'Park';

                        if (place.isDogPark) {
                            color = 'var(--secondary)';
                            emoji = '🏞️';
                            label = 'Wybieg dla psów';
                        } else if (nameLower.includes('las') || nameLower.includes('lasek') || place.type === 'forest') {
                            color = '#2ecc71'; 
                            emoji = '🌲';
                            label = 'Las / Teren leśny';
                        }

                        // 🔥 BEZPIECZNE POBIERANIE ZMIENNYCH (Brak crasha jeśli brakuje danych!)
                        const distanceStr = place.distance ? place.distance.toFixed(1) : "?";
                        const placeName = place.name || "Teren zielony";

                        html += `<div class="post-card" style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; padding: 15px; border-left: 4px solid ${color};">
                                <div style="display:flex; align-items:center; gap:15px;">
                                    <div style="font-size:30px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">${emoji}</div>
                                    <div>
                                        <b style="font-size:16px; color:var(--text-color);">${placeName}</b><br>
                                        <span style="font-size:12px; color:var(--text-muted); font-weight:800;">${label} • ${distanceStr} km</span>
                                    </div>
                                </div>
                                <button class="btn-outline" style="padding:8px 12px; font-size:12px; border-color:${color}; color:${color}; width:auto;" onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}', '_blank')">Prowadź</button>
                            </div>`;
                    });
                    
                    if (container) {
                        container.innerHTML = html || '<p style="text-align:center; padding:20px; color:var(--text-muted);">Brak zielonych terenów w najbliższej okolicy. 🐾</p>'; 
                    }
                    state.placesLoaded = true;
                } catch (e) { 
                    console.error("Krytyczny błąd podczas budowania listy parków:", e); 
                }
            })();

        });
    });
    console.log("🚀 Waggle: Bootstrap zainicjalizowany!");
}
