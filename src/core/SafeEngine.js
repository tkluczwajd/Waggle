// src/core/SafeEngine.js
import { db, fb } from './firebase.js';
import { eventBus, EVENTS } from './eventBus.js';
import { Logger } from './logger.js';

class SafeEngineClass {
    constructor() {
        this.radarUnsubscribe = null;
        this.currentUid = null;
    }

    // 1. INICJALIZACJA RADARU (Dla właściciela zgubionego psa)
    startRadar(userUid) {
        if (!userUid) return;
        this.currentUid = userUid;
        Logger.info('SafeEngine', `Uruchamiam radar dla UID: ${userUid}`);

        this.radarUnsubscribe = db.collection('safe_reports')
            .where('ownerUid', '==', userUid)
            .onSnapshot(snap => {
                snap.docChanges().forEach(change => {
                    if (change.type === 'added' || change.type === 'modified') {
                        this.handleIncomingReport(change.doc.data());
                    }
                });
            }, (error) => {
                Logger.error('SafeEngine', 'Błąd nasłuchu radaru:', error);
            });
    }

    stopRadar() {
        if (this.radarUnsubscribe) {
            this.radarUnsubscribe();
            this.radarUnsubscribe = null;
            Logger.info('SafeEngine', 'Radar zatrzymany');
        }
    }

    // 2. PRZETWARZANIE SYGNAŁU (Sprawdza, czy sygnał nie jest stary)
    handleIncomingReport(report) {
        const reportTime = report.timestamp && typeof report.timestamp.toMillis === 'function' 
            ? report.timestamp.toMillis() 
            : Date.now();
        
        // Reagujemy tylko na świeże alerty (max 15 minut)
        if ((Date.now() - reportTime) < 15 * 60000 && report.lat && report.lng) {
            Logger.safe('Otrzymano świeży sygnał SAFE!', report);
            
            // Silnik nie dotyka HTML! Emituje tylko event na magistralę.
            eventBus.emit(EVENTS.SAFE_ALERT_RECEIVED, report);
        }
    }

    // 3. LOGIKA ZNALAZCY (Wysłanie GPS do bazy)
    async sendFinderLocation(safeId) {
        return new Promise((resolve, reject) => {
            Logger.info('SafeEngine', 'Pobieram GPS dla znalazcy...');
            
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    await db.collection('safe_reports').add({
                        ownerUid: safeId, 
                        lat: latitude, 
                        lng: longitude, 
                        status: 'NEW', 
                        source: 'APP_MODAL',
                        timestamp: fb.firestore.FieldValue.serverTimestamp()
                    });
                    Logger.safe('Lokalizacja znalazcy wysłana do bazy!');
                    resolve({ latitude, longitude });
                } catch (err) {
                    Logger.error('SafeEngine', 'Błąd zapisu raportu', err);
                    reject(err);
                }
            }, (err) => { 
                Logger.warn('SafeEngine', 'Znalazca odmówił GPS lub nastąpił timeout', err);
                reject(err); 
            }, 
            { enableHighAccuracy: true, timeout: 15000 });
        });
    }
}

// Eksportujemy jako Singleton (jedna instancja na całą aplikację)
export const SafeEngine = new SafeEngineClass();
