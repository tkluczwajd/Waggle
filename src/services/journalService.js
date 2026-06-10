// src/services/journalService.js
import { db } from './firebaseInit.js'; // Upewnij się, że tak nazywa się Twój plik inicjalizacyjny Firebase

/**
 * Dodaje nowy wpis do codziennego dziennika aktywności psa
 * @param {string} dogId - ID psa, którego dotyczy akcja
 * @param {string} type - Typ akcji ('feed', 'walk', 'med', 'water', 'vet')
 * @param {string} userName - Imię domownika, który wykonał akcję
 * @param {string} details - Opcjonalny krótki opis (np. "sucha karma 80g")
 */
export async function addJournalEntry(dogId, type, userName, details = "") {
    if (!dogId) return console.error("Brak ID psa przy dodawaniu wpisu do dziennika!");
    
    try {
        await db.collection("dogs").doc(dogId).collection("journal").add({
            type: type,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            doneByUserName: userName,
            details: details
        });
        console.log(`✅ Pomyślnie dodano akcję: ${type} przez ${userName}`);
    } catch (error) {
        console.error("❌ Błąd podczas dodawania wpisu do dziennika:", error);
        throw error;
    }
}

/**
 * Subskrybuje (słucha w czasie rzeczywistym) ostatnich 20 wpisów z dziennika psa
 * @param {string} dogId - ID psa
 * @param {function} callback - Funkcja zwrotna, która dostanie tablicę wpisów przy każdej zmianie
 */
export function subscribeToJournal(dogId, callback) {
    if (!dogId) return;

    return db.collection("dogs").doc(dogId).collection("journal")
        .orderBy("timestamp", "desc")
        .limit(20)
        .onSnapshot(snap => {
            let entries = [];
            snap.forEach(doc => {
                entries.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            callback(entries);
        }, error => {
            console.error("❌ Błąd subskrypcji dziennika:", error);
        });
}
