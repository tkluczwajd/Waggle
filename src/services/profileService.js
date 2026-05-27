import { db, fb } from '../core/firebase.js';

export function saveProfileData(uid, data) {
    return db.collection("users").doc(uid).set(data, { merge: true });
}

// 🔥 MAGNES: Logika dodawania do "Psiego Kręgu"
export async function toggleFollowUserInDb(myUid, targetUid) {
    const ref = db.collection("users").doc(myUid);
    const doc = await ref.get();
    
    // Zabezpieczenie dla nowych kont
    if (!doc.exists) {
        return ref.set({ following: [targetUid] }, { merge: true });
    }
    
    const following = doc.data().following || [];
    
    // Atomowe dodawanie/usuwanie z tablicy
    if (following.includes(targetUid)) {
        return ref.update({ following: fb.firestore.FieldValue.arrayRemove(targetUid) });
    } else {
        return ref.update({ following: fb.firestore.FieldValue.arrayUnion(targetUid) });
    }
}
