// src/services/notificationEngine.js
import { appState as state } from '../core/state.js';
import { Logger } from '../core/logger.js';
import { eventBus, EVENTS } from '../core/eventBus.js';

export const NotificationEngine = {
    
    init() {
        Logger.info('NotificationEngine', 'Uruchamiam silnik powiadomień...');

        // 📡 NASŁUCH NA TŁO: Odbieranie żądań routingu z Service Workera (kliknięcie w powiadomienie)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'NOTIFICATION_ROUTING') {
                    Logger.info('NotificationEngine', 'Otrzymano komendę z tła', event.data.routeData);
                    this.routeUser(event.data.routeData);
                }
            });
        }
    },

    // 🚦 ROUTER: Decyduje, co zrobić po kliknięciu w powiadomienie
    routeUser(routeData) {
        if (!routeData) return;
        
        Logger.info('NotificationEngine', `Przekierowuję na ekran: ${routeData.type}`);
        
        switch(routeData.type) {
            case 'SAFE':
            case 'SIGHTING':
                // Rzucamy usera na mapę
                const mapTab = document.querySelector('[data-view="local"]');
                if (mapTab) mapTab.click();
                break;
                
            case 'CHAT':
                // Rzucamy usera do wiadomości
                const chatTab = document.querySelector('[data-view="messages"]');
                if (chatTab) chatTab.click();
                // Docelowo dodamy tu kod otwierający konkretne okno czatu za pomocą routeData.chatId
                break;
                
            default:
                Logger.info('NotificationEngine', 'Standardowe powiadomienie, brak specjalnego routingu.');
        }
    },

    // 🔔 FOREGROUND: Obsługa powiadomienia, które przychodzi GDY aplikacja jest otwarta na ekranie
    handleForegroundPush(payload) {
        const title = payload.notification?.title || "Waggle 🐾";
        const body = payload.notification?.body || "Nowe zdarzenie";
        const data = payload.data || {};
        
        Logger.info('NotificationEngine', 'Push odebrany w tle (Foreground)', payload);

        // Emitujemy uniwersalny event dla reszty systemu
        eventBus.emit(EVENTS.NOTIFICATION_RECEIVED, payload);

        // Alarmowe powiadomienia wymuszają dłuższą wibrację i komunikat
        if (data.type === 'SAFE' || data.type === 'SIGHTING') {
            if (window.Waggle.showToast) window.Waggle.showToast(`🚨 ${title}: ${body}`, 8000);
            if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 1000]);
        } else {
            // Zwykłe wiadomości
            if (window.Waggle.showToast) window.Waggle.showToast(`💬 ${title}: ${body}`);
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
    }
};
