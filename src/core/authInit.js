import { initAuth } from '../modules/auth.js';
import { db } from './firebase.js';
import { appState as state } from './state.js';

export function setupAuth(onReady) {
    initAuth(() => {
        // Logika po zalogowaniu - czyszczenie starych sesji spacerów
        state.user = state.user; // Zależnie od tego, jak masz to w initAuth
        
        // Callback do głównego bootstrapper'a
        if (onReady) onReady();
    });
}
