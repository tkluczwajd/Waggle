// src/services/walkService.js
import { db } from '../core/firebase.js';

const walksRef = db.collection("walks");

export function startWalkInDb(uid, payload) {
    // Zapisuje wszystkie dane psa, GPS i wpisany statusText do kolekcji walks
    return walksRef.doc(uid).set(payload, { merge: true });
}

export function stopWalkInDb(uid) {
    // Usuwa dokument po zakończeniu spaceru
    return walksRef.doc(uid).delete();
}

export function subscribeToWalks(callback) {
    // Nasłuchuje na zmiany i odświeża mapę i licznik u wszystkich na żywo
    return walksRef.onSnapshot(snap => {
        const walks = [];
        snap.forEach(doc => walks.push({ id: doc.id, ...doc.data() }));
        callback(walks);
    });
}
