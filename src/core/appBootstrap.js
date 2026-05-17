// src/core/appBootstrap.js

import { initRouter } from './router.js'; [cite: 73]
import { initMap, mapManager } from '../modules/map/mapManager.js';  [cite: 73]
import { initAuth } from '../modules/auth.js'; [cite: 73]
import { appState as state } from './state.js'; [cite: 74]
import { loadPosts } from '../modules/posts/postsListeners.js'; [cite: 72]
import { loadInbox, searchUsers } from '../modules/chat/chatListeners.js'; [cite: 73]
import { subscribeToWalks } from '../services/walkService.js'; [cite: 76]
import { renderWalks } from '../modules/map/walksRenderer.js'; [cite: 76]
import { subscribeToAlerts } from '../services/alertsService.js'; [cite: 76]
import { renderAlerts } from '../modules/alerts/alertsRenderer.js';  [cite: 77]
import { initGlobalUtils } from '../ui/globalUtils.js';

export function bootstrapApp() {
    // 1. Narzędzia UI (Toasty, Lightbox)
    initGlobalUtils();

    // 2. Inicjalizacja podstawy architektury (Router, Mapa)
    initRouter(); [cite: 135]
    initMap(); [cite: 135]
    state.map.instance = mapManager.map; [cite: 135]

    // 3. Subskrypcje danych z bazy Firebase live
    loadPosts(); [cite: 135]
    loadInbox(); [cite: 135]
    subscribeToWalks(walks => renderWalks(walks)); [cite: 136]
    subscribeToAlerts(alerts => renderAlerts(alerts)); [cite: 136]

    // 4. Globalne pomosty dla HTML, żeby wyszukiwarka stada działała live
    window.Waggle = window.Waggle || {};
    window.Waggle.executeSearch = (query) => {
        if (typeof searchUsers === 'function') {
            searchUsers(query);
        }
    };

    window.Waggle.centerOnTarget = (lat, lng) => {
        import('./router.js').then(m => m.switchView('map'));
        setTimeout(() => mapManager.flyTo(lat, lng, 16), 300);
    };

    // 5. Autoryzacja i start GPS po zalogowaniu
    initAuth(() => {
        console.log("🚀 Waggle: Architektura modułowa bootstrap gotowa!");
    });
}
