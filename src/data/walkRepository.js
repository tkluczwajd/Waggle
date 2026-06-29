// src/data/walkRepository.js
import { db } from '../core/firebase.js';

export const WalkRepository = {
    /**
     * Zapisuje "checkpoint" (punkt na trasie) w chmurze
     */
    async saveCheckpoint(uid, lat, lng) {
        try {
            await db.collection('users').doc(uid).collection('activeWalkHistory').add({
                lat: lat,
                lng: lng,
                // Używamy globalnego firebase (zgodnie z Twoim wcześniejszym kodem)
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log(`[WalkRepository] Checkpoint zapisany w chmurze dla: ${uid}`);
        } catch (error) {
            console.error(`[WalkRepository] Błąd zapisu checkpointu dla ${uid}:`, error);
            throw error;
        }
    },

    /**
     * Zapisuje finalny spacer (przygotowane pod przyszłą rozbudowę)
     */
    async saveFinalWalk(uid, walkData) {
        try {
            await db.collection('walks').add({
                ownerUid: uid,
                ...walkData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log(`[WalkRepository] Finalny spacer zapisany pomyślnie!`);
        } catch (error) {
            console.error(`[WalkRepository] Błąd zapisu finalnego spaceru:`, error);
            throw error;
        }
    }
};
