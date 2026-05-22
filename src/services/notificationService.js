// src/services/notificationService.js
import { appState as state } from '../core/state.js';
import { db } from '../core/firebase.js';

export async function requestNotificationPermission() {
    if (!state.user) {
        window.Waggle.showToast("Zaloguj się, aby włączyć powiadomienia.");
        return;
    }

    try {
        console.log("🔔 Pytam użytkownika o zgodę na powiadomienia...");
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            console.log("✅ Zgoda przyznana! Inicjalizuję Firebase Messaging...");
            
            // Pobieramy globalną instancję Firebase zadeklarowaną w index.html
            const messaging = window.firebase.messaging();
            
            // 🔥 TUTAJ UŻYWAMY TWOJEGO KLUCZA VAPID
            const currentToken = await messaging.getToken({ 
                vapidKey: 'BDe5V4WgJZisgVNjd8mmme9tlfqsyQL8BAWgNEyx5_ZCFac7SRFBA7K5EuOtn_cbM58Q4zkLo_V_huURv9gH5U0' 
            });
            
            if (currentToken) {
                console.log("📱 Wygenerowano FCM Token dla tego urządzenia:", currentToken);
                
                // Zapisujemy token do profilu użytkownika w bazie Firestore
                await db.collection('users').doc(state.user.uid).update({
                    fcmToken: currentToken
                });
                
                window.Waggle.showToast("Powiadomienia włączone! 🔔");
                
                // Nasłuchujemy wiadomości również wtedy, gdy aplikacja jest OTWARTA
                messaging.onMessage((payload) => {
                    console.log('💬 Otrzymano wiadomość na żywo:', payload);
                    window.Waggle.showToast(`Nowa wiadomość: ${payload.notification?.body}`);
                });

            } else {
                console.warn("Brak tokena powiadomień (problem z rejestracją).");
            }
        } else {
            console.warn("❌ Użytkownik odmówił zgody na powiadomienia.");
            window.Waggle.showToast("Powiadomienia zostały zablokowane.");
        }
    } catch (error) {
        console.error("Błąd konfiguracji powiadomień:", error);
    }
}

// Udostępniamy funkcję dla interfejsu HTML
window.Waggle = window.Waggle || {};
window.Waggle.requestPush = requestNotificationPermission;
