import { db, fb } from '../core/firebase.js';

const walksRef = db.collection("walks");

export function startWalkInDb(uid, payload) {
    return walksRef.doc(uid).set(payload, { merge: true });
}

export function stopWalkInDb(uid) {
    return walksRef.doc(uid).delete();
}

export function subscribeToWalks(callback) {
    return walksRef.onSnapshot(snap => {
        const walks = [];
        snap.forEach(doc => walks.push({ id: doc.id, ...doc.data() }));
        callback(walks);
    });
}
