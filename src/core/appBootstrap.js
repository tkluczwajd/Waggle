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
import { initMap } from '../modules/map/mapManager.js';
import { appState as state } from './state.js';

export function bootstrapApp() {
    initGlobalUtils();
    loadSettings();
    initWaggleApi(updateUserMarker);
    window.Waggle.updateStatsUI = updateStatsUI; 

    setupAuth(() => {
        initRouter();
        initProfileListeners();
        initUiListeners();

        setupLocationTracking((lat, lng) => {
            initMap();
            state.map.instance = mapManager.map;
            updateStatsUI();

            state.map.instance.setView([lat, lng], 15, { animate: false });
            setTimeout(() => { if(state.map.instance) state.map.instance.invalidateSize(true); }, 300);

            setupSubscriptions();
            renderWiki('rasy');
        });
    });
    console.log("🚀 Waggle: Bootstrap zainicjalizowany!");
}
