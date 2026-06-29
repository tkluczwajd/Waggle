// src/data/userRepository.js
import { db } from '../core/firebase.js';

export const UserRepository = {
    /**
     * Pobiera pełny profil użytkownika/psa
     */
    async getProfile(uid) {
        try {
            const doc = await db.collection('users').doc(uid).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error(`[UserRepository] Błąd pobierania profilu ${uid}:`, error);
            throw error;
        }
    },

    /**
     * Aktualizuje status powiadomień Push
     */
    async updatePushSettings(uid, isEnabled) {
        try {
            await db.collection('users').doc(uid).update({
                pushEnabled: isEnabled
            });
            console.log(`[UserRepository] Zaktualizowano pushEnabled na: ${isEnabled}`);
        } catch (error) {
            console.error(`[UserRepository] Błąd aktualizacji pushEnabled dla ${uid}:`, error);
            throw error;
        }
    },

    /**
     * Zapisuje nowe cele dziennej opieki (Daily Care)
     */
    async updateDailyGoals(uid, goals) {
        try {
            await db.collection('users').doc(uid).set({ 
                dailyGoals: goals 
            }, { merge: true });
            console.log(`[UserRepository] Zapisano cele dzienne dla ${uid}`);
        } catch (error) {
            console.error(`[UserRepository] Błąd zapisu celów dla ${uid}:`, error);
            throw error;
        }
    }
};
