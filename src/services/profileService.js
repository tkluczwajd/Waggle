import { db, fb } from '../core/firebase.js';

export function saveProfileData(uid, data) {
    return db.collection("users").doc(uid).set(data, { merge: true });
}
