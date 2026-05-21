import { initRouter } from './router.js';
import { initProfileListeners } from '../modules/profile/profileListeners.js';
import { initGlobalUtils } from '../ui/globalUtils.js';
import { initUiListeners } from '../ui/uiListeners.js';
import { initWaggleApi } from './waggleApi.js';
import { setupAuth } from './authInit.js';
import { setupMap } from './mapInit.js';
import { setupSubscriptions } from './subscriptionInit.js';
import { setupLocationTracking } from './locationInit.js';
import { renderWiki } from '../ui/wikiRenderer.js';
import { fetchWeather } from '../services/weatherService.js';
import { appState as state } from './state.js';

export { updateUserMarker }; // Eksportujemy, żeby locationInit mógł z niej korzystać

export function bootstrapApp() {
    initGlobalUtils();
    initWaggleApi(updateUserMarker);
    
    setupAuth(() => {
        initRouter();
        initProfileListeners();
        initUiListeners();

        setupLocationTracking((lat, lng) => {
            // Pierwszy fix GPS
            state.map.instance = setupMap();
            setupSubscriptions();
            fetchWeather(lat, lng);
            renderWiki('rasy');
            
            // Fix mapy (tzw. "Pancerny")
            setTimeout(() => {
                if(state.map.instance) state.map.instance.invalidateSize(true);
            }, 300);
        });
    });
}
