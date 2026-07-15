// src/core/eventBus.js
import { Logger } from './logger.js';

// 🛑 SŁOWNIK EVENTÓW - JEDNO ŹRÓDŁO PRAWDY
export const EVENTS = Object.freeze({
    MAP_READY: 'MAP_READY',
    SAFE_REPORT: 'SAFE_REPORT',
    SAFE_ALERT_RECEIVED: 'SAFE_ALERT_RECEIVED',
    CHAT_MESSAGE: 'CHAT_MESSAGE',
    USER_LOGGED_IN: 'USER_LOGGED_IN',
    USER_LOGGED_OUT: 'USER_LOGGED_OUT',
    LOCATION_UPDATED: 'LOCATION_UPDATED',
    NOTIFICATION_RECEIVED: 'NOTIFICATION_RECEIVED',
    PROFILE_UPDATED: 'profileUpdated', // Dodane ze starego kodu
    VIEW_CHANGED: 'viewChanged'        // Dodane ze starego kodu
});

const listeners = {};

export const eventBus = {
    on(event, callback) {
        if (!Object.values(EVENTS).includes(event)) {
            Logger.warn('EventBus', `Próba nasłuchiwania na niezarejestrowany event: ${event}`);
        }
        if (!listeners[event]) {
            listeners[event] = [];
        }
        listeners[event].push(callback);
    },

    emit(event, data) {
        if (!Object.values(EVENTS).includes(event)) {
            Logger.warn('EventBus', `Próba emisji niezarejestrowanego eventu: ${event}`);
            return; // Zatrzymujemy emisję fałszywego eventu
        }
        if (!listeners[event]) return;
        
        Logger.info('EventBus', `Emit: ${event}`, data || '');
        listeners[event].forEach(cb => cb(data));
    },

    off(event, callback) {
        if (!listeners[event]) return;
        listeners[event] = listeners[event].filter(item => item !== callback);
    }
};
