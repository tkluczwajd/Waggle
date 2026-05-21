// src/ui/uiListeners.js
import { initPostUi } from './postUiListeners.js';
import { initChatUi } from './chatUiListeners.js';
import { initWikiUi } from './wikiUiListeners.js';
import { initSettingsUi } from './settingsUiListeners.js';
import { initWalkUi } from './walkUiListeners.js';
import { initAlertsUi } from './alertsUiListeners.js';
import { initProfileUi } from './profileUiListeners.js';

export function initUiListeners() {
    initPostUi();
    initChatUi();
    initWikiUi();
    initSettingsUi();
    initWalkUi();
    initAlertsUi();
    initProfileUi();

    // Globalna obsługa zamykania modali krzyżykiem
    document.addEventListener('click', (e) => {
        if (e.target.closest('.close-modal-btn')) { 
            const modal = e.target.closest('.modal') || e.target.closest('.modal-overlay'); 
            if(modal) modal.style.display = 'none'; 
        }
    });
}
