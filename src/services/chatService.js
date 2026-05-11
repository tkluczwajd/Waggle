import { db, fb } from '../core/firebase.js';

export function subscribeToInbox(uid, callback) {
    return db.collection("chats")
        .where("users", "array-contains", uid)
        .onSnapshot(snap => {
            let chats = [];
            snap.forEach(doc => chats.push({ id: doc.id, ...doc.data() }));
            chats.sort((a, b) => (b.lastUpdate || 0) - (a.lastUpdate || 0));
            callback(chats);
        });
}

export function searchUsersInDb(query, callback) {
    const q = query.toLowerCase().trim();
    db.collection("users").get().then(snap => {
        let users = [];
        snap.forEach(doc => {
            const u = doc.data();
            const nameMatch = u.name && u.name.toLowerCase().includes(q);
            const cityMatch = u.city && u.city.toLowerCase().includes(q);
            const breedMatch = u.breed && u.breed.toLowerCase().includes(q);
            if (!q || nameMatch || cityMatch || breedMatch) users.push({ id: doc.id, ...u });
        });
        callback(users);
    });
}

export function subscribeToMessages(chatId, callback) {
    return db.collection("chats").doc(chatId).collection("messages")
        .orderBy("time", "asc")
        .onSnapshot(snap => {
            let messages = [];
            snap.forEach(doc => messages.push({ id: doc.id, ...doc.data() }));
            callback(messages);
        });
}

export function saveMessageInDb(chatId, msg, partnerUid, partnerName, currentUser) {
    db.collection("chats").doc(chatId).collection("messages").add(msg);
    return db.collection("chats").doc(chatId).set({
        lastMsg: msg.imageUrl ? "📷 Zdjęcie" : msg.text,
        lastUpdate: Date.now(),
        users: chatId.split("_"),
        names: { 
            [currentUser.uid]: currentUser.name || "Piesek", 
            [partnerUid]: partnerName 
        }
    }, { merge: true });
}
