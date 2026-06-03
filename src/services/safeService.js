// src/services/safeService.js
import { db, fb } from '../core/firebase.js';

// Generuje krótki, przyjazny kod np. "AX72K9"
function generateSafeId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Sprawdza, czy kod jest unikalny w bazie
async function getUniqueSafeId() {
    let safeId = generateSafeId();
    let isUnique = false;
    
    while (!isUnique) {
        const doc = await db.collection("safe_profiles").doc(safeId).get();
        if (!doc.exists) {
            isUnique = true;
        } else {
            safeId = generateSafeId();
        }
    }
    return safeId;
}

// Generuje lub aktualizuje publiczny profil SAFE
export async function createOrUpdateSafeProfile(userUid, profileData) {
    try {
        const userRef = db.collection("users").doc(userUid);
        const userDoc = await userRef.get();
        let safeId = userDoc.data().safeId;

        if (!safeId) {
            safeId = await getUniqueSafeId();
            await userRef.update({ safeId: safeId });
        }

        // 🔥 NOWOŚĆ: Ustrukturyzowane dane medyczne w osobnej kolekcji
        const safeProfileData = {
            safeId: safeId,
            ownerUid: userUid,
            dogName: profileData.name || "Piesek",
            breed: profileData.breed || "Nie podano",
            imageUrl: profileData.avatar || "",
            chip: profileData.chip || "",
            allergies: profileData.allergies || "",
            meds: profileData.meds || "",
            phone: profileData.vet || "",
            allowPhone: true,
            active: true,
            updatedAt: fb.firestore.FieldValue.serverTimestamp()
        };

        await db.collection("safe_profiles").doc(safeId).set(safeProfileData, { merge: true });
        
        return safeId;
    } catch (error) {
        console.error("Błąd generowania SAFE ID:", error);
        throw error;
    }
}

// Nasłuchiwanie na sygnał SOS OD ZNALAZCY
export function listenForSafeAlerts(safeId, onAlertReceived) {
    if (!safeId) return;

    console.log("🚨 Uruchamiam radar SAFE dla ID:", safeId);

    return db.collection("safe_messages")
        .where("safeId", "==", safeId)
        .where("status", "==", "unread")
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const alertData = change.doc.data();
                    change.doc.ref.update({ status: 'read' });
                    onAlertReceived(alertData);
                }
            });
        }, (error) => {
            console.error("Błąd radaru SAFE:", error);
        });
}
