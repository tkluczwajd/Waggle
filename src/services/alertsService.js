import { db, fb } from '../core/firebase.js';

export function subscribeToAlerts(callback) {
    // 🔥 POPRAWKA (AUDYT): Filtrowanie po stronie SERWERA (mniej odczytów = mniejsze koszty)
    const yesterday = Date.now() - 86400000; // 24 godziny temu
    
    return db.collection("alerts")
        .where("createdAt", ">=", yesterday) // Serwer odda nam TYLKO te z dzisiaj
        .onSnapshot(snap => {
            const alerts = [];
            snap.forEach(doc => {
                alerts.push({ id: doc.id, ...doc.data() });
            });
            callback(alerts);
        });
}
