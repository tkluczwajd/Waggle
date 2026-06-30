// src/data/chatRepository.js
import { db } from '../core/firebase.js';

export const ChatRepository = {
    // 🔥 NOWOŚĆ: Live nasłuch na skrzynkę odbiorczą
   subscribeToInbox(uid, callback) {
        console.log("[DEBUG] Próbuję pobrać czaty dla UID:", uid);
        return db.collection('chats')
            .where('participants', 'array-contains', uid)
            .orderBy('lastActivity', 'desc')
            .onSnapshot(snap => {
                console.log("[DEBUG] Snapshot odebrany! Liczba czatów:", snap.size);
                const chats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(chats);
            }, error => {
                console.error("[ChatRepository] Błąd nasłuchu skrzynki:", error);
            });
    },

    async sendMessage(chatId, senderId, text, imageUrl = null) {
        try {
            const messageData = {
                senderId: senderId,
                text: text || "",
                imageUrl: imageUrl,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };

            // 1. Zapisujemy wiadomość
            await db.collection('chats').doc(chatId).collection('messages').add(messageData);

            // 2. Aktualizujemy główny dokument czatu - POPRAWIONA SKŁADNIA
            let updates = {
                lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
                lastUpdate: firebase.firestore.FieldValue.serverTimestamp(), // <--- Poprawione tutaj
                lastMessage: text ? text.substring(0, 30) + (text.length > 30 ? "..." : "") : "📷 Zdjęcie"
            };

            // 🔥 KLUCZOWE: Zwiększamy licznik nieprzeczytanych wiadomości dla ODBIORCY!
            if (chatId.includes('_') && !chatId.startsWith('family_') && !chatId.startsWith('group_')) {
                const uids = chatId.split('_');
                const partnerId = uids[0] === senderId ? uids[1] : uids[0];
                updates[`unreadCount.${partnerId}`] = firebase.firestore.FieldValue.increment(1);
            }

            await db.collection('chats').doc(chatId).update(updates);
            
            console.log("[ChatRepository] Wiadomość wysłana pomyślnie.");
        } catch (error) {
            console.error("[ChatRepository] Błąd wysyłania wiadomości:", error);
            throw error;
        }
    },

    // 🔥 NOWOŚĆ: Zerowanie licznika przy wejściu w czat
    async markAsRead(chatId, uid) {
        try {
            await db.collection('chats').doc(chatId).update({
                [`unreadCount.${uid}`]: 0
            });
        } catch (error) {
            console.warn("[ChatRepository] Błąd oznaczania jako przeczytane:", error);
        }
    },

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
