// src/core/bootstrap/authBootstrap.js
import { setupAuth } from '../authInit.js';
import { initRouter } from '../router.js';
import { initGlobalUtils } from '../../ui/globalUtils.js';
import { initWaggleApi } from '../waggleApi.js';
import { updateStatsUI, updateUserMarker } from '../../ui/uiHelpers.js';

export function initAuthFlow(onAuthSuccess) {
    console.log("🔐 Inicjalizacja modułu autoryzacji...");
    
    // 1. Narzędzia globalne i API (muszą wystartować jako pierwsze)
    initGlobalUtils();
    initWaggleApi(updateUserMarker);
    window.Waggle.updateStatsUI = updateStatsUI; 

    // 2. Weryfikacja sesji użytkownika
    setupAuth(() => {
        // 3. Po udanym logowaniu odpalamy router (menu i ekrany)
        initRouter();
        
        // 4. Sygnał do głównego pliku, że można bezpiecznie załadować mapę i resztę
        if (typeof onAuthSuccess === 'function') {
            onAuthSuccess();
        }
    });
}
