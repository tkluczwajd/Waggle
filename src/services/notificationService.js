// src/services/notificationService.js
import { appState as state } from '../core/state.js';
import { db } from '../core/firebase.js';

export async function toggleNotifications() {
    if (!state.user) {
        window.Waggle.showToast("Zaloguj się, aby zarządzać powiadomieniami. 🐾");
        return;
    }

    try {
        const userRef = db.collection('users').doc(state.user.uid);
        const doc = await userRef.get();
        const userData = doc.data() || {};
        
        // Sprawdzamy, czy użytkownik ma aktualnie włączone powiadomienia
        const isCurrentlyEnabled = userData.pushEnabled === true;

        if (isCurrentlyEnabled) {
            // 🔴 AKCJA: WYŁĄCZANIE (Soft Disable)
            await userRef.update({ pushEnabled: false });
            window.Waggle.showToast("🔕 Powiadomienia wyciszone.");
            updateNotificationBtnUI(false);
            
        } else {
            // 🟢 AKCJA: WŁĄCZANIE (Pytanie o zgodę i pobieranie tokena)
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                const messaging = window.firebase.messaging();
                const currentToken = await messaging.getToken({ 
                    vapidKey: 'BDe5V4WgJZisgVNjd8mmme9tlfqsyQL8BAWgNEyx5_ZCFac7SRFBA7K5EuOtn_cbM58Q4zkLo_V_huURv9gH5U0' 
                });
                
                if (currentToken) {
                    // Zapisujemy token i włączamy zielone światło dla serwera
                    await userRef.update({
                        fcmToken: currentToken,
                        pushEnabled: true
                    });
                    
                    window.Waggle.showToast("🔔 Powiadomienia aktywne!");
                    updateNotificationBtnUI(true);

                    // Nasłuchujemy wiadomości również wtedy, gdy aplikacja jest OTWARTA
                    messaging.onMessage((payload) => {
                        console.log('💬 Otrzymano wiadomość na żywo (Foreground):', payload);
                        const msgTitle = payload.notification?.title || 'Waggle';
                        const msgBody = payload.notification?.body || 'Masz nową wiadomość!';
                        window.Waggle.showToast(`💬 ${msgTitle}: ${msgBody}`);
                    });
                }
            } else {
                window.Waggle.showToast("❌ Odblokuj powiadomienia w ustawieniach przeglądarki!");
            }
        }
    } catch (error) {
        console.error("Błąd zarządzania powiadomieniami:", error);
    }
}

// Funkcja aktualizująca wygląd przycisku w zależności od statusu
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
            btn.style.background = '#ffb142'; // Złoty kolor Waggle
            btn.style.border = 'none';
            btn.style.color = '#2d3436';
        }
    }
}

// Eksport do globalnego obiektu, aby HTML mógł to kliknąć
window.Waggle = window.Waggle || {};
window.Waggle.toggleNotifications = toggleNotifications;

// Nasłuchiwanie powiadomień, gdy użytkownik ma OTWARTĄ aplikację (Pierwszy plan)
if ('serviceWorker' in navigator) {
    try {
        const messaging = window.firebase.messaging();
        messaging.onMessage((payload) => {
            console.log('🔔 Odebrano powiadomienie na żywo w aplikacji:', payload);
            
            // Pobieramy treść powiadomienia
            const title = payload.notification?.title || "Waggle 🐾";
            const body = payload.notification?.body || "Nowa wiadomość!";
            
            // Wyświetlamy piękny Toast wewnątrz aplikacji zamiast systemowego paska
            if (window.Waggle && window.Waggle.showToast) {
                window.Waggle.showToast(`<b>${title}</b><br>${body}`);
            }
        });
    } catch (e) {
        console.warn("FCM foreground messaging nie mogło wystartować (prawdopodobnie brak logowania):", e);
    }
}
