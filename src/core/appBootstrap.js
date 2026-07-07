// src/core/appBootstrap.js
import { initAuthFlow } from './bootstrap/authBootstrap.js';
import { initSafeFinderLogic, startSafeRadar } from './bootstrap/safeBootstrap.js';

import { initUiListeners } from '../ui/uiListeners.js';
import { setupSubscriptions } from './subscriptionInit.js';
import { setupLocationTracking } from './locationInit.js';
import { renderWiki } from '../ui/wikiRenderer.js';
import { updateStatsUI } from '../ui/uiHelpers.js';
import { initMap } from '../modules/map/mapManager.js';
import { appState as state } from './state.js';
import { fetchWeather } from '../services/weatherService.js';
import { fetchNearbyParks } from '../services/parksService.js';
import { renderParksOnMap } from '../modules/map/parksRenderer.js';
import { listenToDailyCare } from '../modules/care.js';
import { initProfileUi } from '../ui/profileUiListeners.js';
import { initLiveFeed } from '../modules/map/liveFeed.js';
import { loadInbox } from '../modules/chat/chatListeners.js';
import '../modules/chat/groupListeners.js'; 

export function bootstrapApp() {
    // 1. Zezwalamy na wysyłanie lokalizacji bez logowania (dla znalazcy)
    initSafeFinderLogic();

    // 2. Startujemy proces logowania
    initAuthFlow(() => {
        // 🔥 3. Po zalogowaniu odpalamy Radar i całą resztę modułów
        startSafeRadar();
        
        initProfileUi();
        initUiListeners();
        initLiveFeed();
        loadInbox();
        updateStatsUI();
        listenToDailyCare();

        // 4. Pobieramy lokalizację i ładujemy mapę
        setupLocationTracking((lat, lng) => {
            initMap(); 
            updateStatsUI(); 
            if(state.map.instance) {
                state.map.instance.setView([lat, lng], 15, { animate: false });
                setTimeout(() => state.map.instance.invalidateSize(true), 300);
            }
            setupSubscriptions();
            fetchWeather(lat, lng);
            renderWiki('sytuacje');
            (async () => { try { const p = await fetchNearbyParks(lat, lng); if (p) renderParksOnMap(p); } catch (e) { console.error(e); } })();

            const loader = document.getElementById('loader');
            if (loader) { loader.style.opacity = '0'; setTimeout(() => loader.style.display = 'none', 300); }
        });
    });
}
