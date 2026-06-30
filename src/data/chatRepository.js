// src/data/chatRepository.js
import { db } from '../core/firebase.js';

export const ChatRepository = {
    /**
     * Pobiera listę konwersacji (Inbox) dla danego użytkownika
     */
    async getInbox(uid) {
        try {
            const snap = await db.collection('chats')
                .where('participants', 'array-contains', uid)
                .orderBy('lastActivity', 'desc')
                .get();
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("[ChatRepository] Błąd pobierania skrzynki:", error);
            throw error;
        }
    },

    /**
     * Wysyła nową wiadomość i aktualizuje czas ostatniej aktywności w czacie
     */
    async sendMessage(chatId, senderId, text, imageUrl = null) {
        try {
            const messageData = {
                senderId: senderId,
                text: text,
                imageUrl: imageUrl,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };

            // 1. Zapisujemy wiadomość w podkolekcji
            await db.collection('chats').doc(chatId).collection('messages').add(messageData);

            // 2. Aktualizujemy główny dokument czatu, żeby przeniósł się na górę listy
            await db.collection('chats').doc(chatId).update({
                lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
                lastMessage: text ? text.substring(0, 30) + (text.length > 30 ? "..." : "") : "📷 Zdjęcie"
            });
            
            console.log("[ChatRepository] Wiadomość wysłana pomyślnie.");
        } catch (error) {
            console.error("[ChatRepository] Błąd wysyłania wiadomości:", error);
            throw error;
        }
    },

    /**
     * Podpina nasłuch (Live) na nowe wiadomości w danym czacie.
     * Zwraca funkcję `unsubscribe`, aby można było przerwać nasłuch po wyjściu z czatu.
     */
    subscribeToMessages(chatId, callback) {
        return db.collection('chats').doc(chatId).collection('messages')
            .orderBy('timestamp', 'asc')
            .onSnapshot(snap => {
                const messages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(messages);
            }, error => {
                console.error("[ChatRepository] Błąd nasłuchu wiadomości:", error);
            });
    }
};
