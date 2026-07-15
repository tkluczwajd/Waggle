// src/services/notificationService.js
import { appState as state } from '../core/state.js';
import { db } from '../core/firebase.js';
import { Logger } from '../core/logger.js';
import { NotificationEngine } from './notificationEngine.js';

export async function toggleNotifications() {
    if (!state.user) {
        window.Waggle.showToast("Zaloguj się, aby zarządzać powiadomieniami. 🐾");
        return;
    }

    try {
        const userRef = db.collection('users').doc(state.user.uid);
        const doc = await userRef.get();
        const userData = doc.data() || {};
        
        const isCurrentlyEnabled = userData.pushEnabled === true;

        if (isCurrentlyEnabled) {
            // 🔴 WYŁĄCZANIE
            await userRef.update({ pushEnabled: false });
            window.Waggle.showToast("🔕 Powiadomienia wyciszone.");
            updateNotificationBtnUI(false);
            Logger.info('NotificationService', 'Powiadomienia wyłączone przez użytkownika.');
            
        } else {
            // 🟢 WŁĄCZANIE
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                const messaging = window.firebase.messaging();
                const currentToken = await messaging.getToken({ 
                    vapidKey: 'BDe5V4WgJZisgVNjd8mmme9tlfqsyQL8BAWgNEyx5_ZCFac7SRFBA7K5EuOtn_cbM58Q4zkLo_V_huURv9gH5U0' 
                });
                
                if (currentToken) {
                    await userRef.update({
                        fcmToken: currentToken,
                        pushEnabled: true
                    });
                    
                    window.Waggle.showToast("🔔 Powiadomienia aktywne!");
                    updateNotificationBtnUI(true);
                    Logger.info('NotificationService', 'Powiadomienia aktywne, token zapisany.');
                }
            } else {
                window.Waggle.showToast("❌ Odblokuj powiadomienia w ustawieniach przeglądarki!");
                Logger.warn('NotificationService', 'Odmowa uprawnień do powiadomień.');
            }
        }
    } catch (error) {
        Logger.error('NotificationService', 'Błąd zarządzania powiadomieniami', error);
    }
}

export function updateNotificationBtnUI(isEnabled) {
    const btn = document.getElementById('togglePushBtn');
    if (btn) {
        if (isEnabled) {
            btn.innerHTML = '🔕 WYCISZ POWIADOMIENIA';
            btn.style.background = 'transparent';
            btn.style.border = '2px solid var(--danger)';
            btn.style.color = 'var(--danger)';
        } else {
            btn.innerHTML = '🔔 WŁĄCZ POWIADOMIENIA';
            btn.style.background = '#ffb142'; 
            btn.style.border = 'none';
            btn.style.color = '#2d3436';
        }
    }
}

window.Waggle = window.Waggle || {};
window.Waggle.toggleNotifications = toggleNotifications;

// 📡 DELEGACJA ODBIORU NA ŻYWO (gdy apka jest otwarta)
if ('serviceWorker' in navigator) {
    setTimeout(() => {
        try {
            const messaging = window.firebase.messaging();
            messaging.onMessage((payload) => {
                // Przekazujemy ładunek od razu do Mózgu Operacyjnego
                NotificationEngine.handleForegroundPush(payload);
            });
        } catch (e) {
            Logger.warn('NotificationService', 'FCM foreground messaging oczekuje na inicjalizację.');
        }
    }, 1500);
}
