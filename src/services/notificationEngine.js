// src/services/notificationEngine.js
import { appState } from '../core/state.js';

export const NotificationEngine = {
    // Centralny hub powiadomień
    notify(type, data) {
        console.log(`[NotificationEngine] Event: ${type}`, data);

        switch(type) {
            case 'CHAT_MESSAGE':
                this.handleChatMessage(data);
                break;
            case 'SAFE_ALERT':
                this.handleSafeAlert(data);
                break;
            case 'SYSTEM_INFO':
                this.handleSystemInfo(data);
                break;
            default:
                this.showDefaultToast(data.message);
        }
    },

    handleChatMessage(data) {
        if (window.Waggle.showToast) {
            window.Waggle.showToast(`💬 Nowa wiadomość: ${data.message}`);
        }
    },

    handleSafeAlert(data) {
        // Tu w przyszłości dodamy logikę wyskakującego modala, a nie tylko toastu
        if (window.Waggle.showToast) {
            window.Waggle.showToast(`🚨 ${data.message}`, 8000);
        }
    },

    handleSystemInfo(data) {
        if (window.Waggle.showToast) {
            window.Waggle.showToast(`ℹ️ ${data.message}`);
        }
    },

    showDefaultToast(message) {
        if (window.Waggle.showToast) {
            window.Waggle.showToast(message);
        }
    }
};

window.Waggle = window.Waggle || {};
window.Waggle.notify = NotificationEngine.notify;
