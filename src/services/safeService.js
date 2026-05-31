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
        // Sprawdzamy, czy użytkownik ma już swój Safe ID
        const userRef = db.collection("users").doc(userUid);
        const userDoc = await userRef.get();
        let safeId = userDoc.data().safeId;

        // Jeśli nie ma, generujemy nowy
        if (!safeId) {
            safeId = await getUniqueSafeId();
            await userRef.update({ safeId: safeId });
        }

        // Zapisujemy publiczne dane do specjalnej, oddzielnej kolekcji
        const safeProfileData = {
            safeId: safeId,
            ownerUid: userUid,
            dogName: profileData.name || "Piesek",
            breed: profileData.breed || "Nie podano",
            imageUrl: profileData.avatar || "",
            phone: profileData.vet || "", // Na razie bierzemy z weterynarza, potem zrobimy osobne pole dla właściciela
            allowPhone: true,
            notes: `Chip: ${profileData.chip || 'Brak'}. Leki: ${profileData.meds || 'Brak'}`,
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
// 🔥 NASŁUCHIWANIE NA SYGNAŁ SOS OD ZNALAZCY
export function listenForSafeAlerts(safeId, onAlertReceived) {
    if (!safeId) return;

    console.log("🚨 Uruchamiam radar SAFE dla ID:", safeId);

    // Nasłuchujemy tylko na nowe, nieprzeczytane zgłoszenia
    return db.collection("safe_messages")
        .where("safeId", "==", safeId)
        .where("status", "==", "unread")
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const alertData = change.doc.data();
                    
                    // Oznaczamy jako przeczytane, żeby alarm nie wył za każdym odświeżeniem aplikacji
                    change.doc.ref.update({ status: 'read' });
                    
                    // Przekazujemy dane do mapy
                    onAlertReceived(alertData);
                }
            });
        }, (error) => {
            console.error("Błąd radaru SAFE:", error);
        });
}
