import { db } from '../../core/firebase.js';

export function subscribeToAlerts(callback) {
    return db.collection("alerts").onSnapshot(snap => {
        const alerts = [];
        snap.forEach(doc => {
            const data = { id: doc.id, ...doc.data() };
            if (Date.now() - data.createdAt <= 86400000) { // Tylko z ostatnich 24h
                alerts.push(data);
            }
        });
        callback(alerts);
    });
}
