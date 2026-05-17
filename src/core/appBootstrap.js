// src/core/appBootstrap.js (Fragment górny - Importy)
import { initRouter } from './router.js';
import { initMap, mapManager } from '../modules/map/mapManager.js'; 
import { initAuth } from '../modules/auth.js';
import { appState as state } from './state.js';
import { loadPosts } from '../modules/posts/postsListeners.js';
import { loadInbox, searchUsers } from '../modules/chat/chatListeners.js';
import { subscribeToWalks } from '../services/walkService.js';
import { renderWalks } from '../modules/map/walksRenderer.js';
import { subscribeToAlerts } from '../services/alertsService.js';
import { renderAlerts } from '../modules/alerts/alertsRenderer.js'; 
import { initGlobalUtils } from '../ui/globalUtils.js';

// 🔥 NOWE: Poprawny import z ujednoliconego serwisu pogodowego
import { fetchWeatherData, renderWeatherUI } from '../services/weatherService.js';

export function bootstrapApp() {
    initGlobalUtils();
    initRouter();
    initMap();
    state.map.instance = mapManager.map;

    loadPosts();
    loadInbox();
    subscribeToWalks(walks => renderWalks(walks));
    subscribeToAlerts(alerts => renderAlerts(alerts));

    window.Waggle = window.Waggle || {};
    window.Waggle.executeSearch = (query) => { if (typeof searchUsers === 'function') searchUsers(query); };
    window.Waggle.centerOnTarget = (lat, lng) => {
        import('./router.js').then(m => m.switchView('map'));
        setTimeout(() => mapManager.flyTo(lat, lng, 16), 300);
    };

    // Obsługa geolokalizacji zintegrowana z automatycznym pobieraniem danych pogodowych
    initAuth(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.watchPosition(async (pos) => {
                const lat = pos.coords.latitude; 
                const lng = pos.coords.longitude;
                const isFirstFix = !state.location.lat;
                state.location.lat = lat; 
                state.location.lng = lng;

                if (isFirstFix) { 
                    mapManager.flyTo(lat, lng, 15); 
                    
                    // 🔥 NOWOŚĆ: Pobieramy dane pogodowe i asynchronicznie wrzucamy je do interfejsu UI!
                    const weatherData = await fetchWeatherData(lat, lng);
                    renderWeatherUI(weatherData);
                }

                // ... sekcja obsługi Heartbeatu spacerów (zostaje bez zmian) ...

            }, err => console.log("Czekam na GPS..."), { enableHighAccuracy: true });
        }
        console.log("🚀 Waggle: Architektura modułowa bootstrap gotowa!");
    });
}
