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
    // 🔥 POPRAWKA (AUDYT): Limitujemy pobieranie tylko do 50 najnowszych wiadomości!
    return db.collection("chats").doc(chatId).collection("messages")
        .orderBy("time", "desc") // Sortujemy od najnowszych
        .limit(200)               // Sztywny szlaban Firebase
        .onSnapshot(snap => {
            let messages = [];
            snap.forEach(doc => messages.push({ id: doc.id, ...doc.data() }));
            // Odwracamy tablicę, żeby w UI najstarsze z tych 200 były na górze
            callback(messages.reverse());
        });
}

export async function saveMessageInDb(chatId, msg, partnerUid, partnerName, currentUser) {
    // 1. Zapisujemy samą wiadomość
    db.collection("chats").doc(chatId).collection("messages").add(msg);
    
    const chatRef = db.collection("chats").doc(chatId);
    const isGroup = chatId.startsWith("group_");

    if (isGroup) {
        // 🔥 LOGIKA DLA STADA (Czat Grupowy)
        // Pobieramy czat, żeby dowiedzieć się, kto jest w grupie
        const snap = await chatRef.get();
        if (snap.exists) {
            const data = snap.data();
            let updates = {
                lastMsg: msg.imageUrl ? "📷 Zdjęcie" : msg.text,
                lastUpdate: Date.now()
            };
            
            // Podbijamy licznik nieprzeczytanych WSZYSTKIM członkom grupy oprócz nadawcy
            (data.users || []).forEach(uid => {
                if (uid !== currentUser.uid) {
                    updates[`unreadCount.${uid}`] = fb.firestore.FieldValue.increment(1);
                }
            });

            // Zapisujemy zmiany bez nadpisywania listy 'users'!
            return chatRef.set(updates, { merge: true });
        }
    } else {
        // 🔥 LOGIKA DLA PRYWATNEGO CZATU (1-na-1)
        return chatRef.set({
            lastMsg: msg.imageUrl ? "📷 Zdjęcie" : msg.text,
            lastUpdate: Date.now(),
            users: chatId.split("_"),
            names: { 
                [currentUser.uid]: currentUser.name || "Piesek", 
                [partnerUid]: partnerName 
            },
            avatars: {
                [currentUser.uid]: currentUser.avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150"
            },
            // Tutaj powiadomienie idzie tylko do jednego partnera
            [`unreadCount.${partnerUid}`]: fb.firestore.FieldValue.increment(1)
        }, { merge: true });
    }
}
// Funkcja zerująca nasz licznik po wejściu w czat
export function markChatAsRead(chatId, myUid) {
    return db.collection("chats").doc(chatId).set({
        [`unreadCount.${myUid}`]: 0
    }, { merge: true });
}
// ==========================================
// TWORZENIE GRUPY (STADA) W BAZIE FIREBASE
// ==========================================
export function createGroupInDb(groupName, usersArray, namesMap, avatarsMap) {
    // Generujemy unikalne, losowe ID dla naszej grupy, ale dodajemy przedrostek "group_"!
    const newChatRef = db.collection("chats").doc(); 
    const groupId = "group_" + newChatRef.id; // 🔥 Prefix, żeby łatwo było odróżnić
    
    return db.collection("chats").doc(groupId).set({
        isGroup: true,
        groupName: groupName,
        lastMsg: "Stado utworzone! Zaszczekaj pierwszy 🐕",
        lastUpdate: Date.now(),
        users: usersArray,
        names: namesMap,
        avatars: avatarsMap,
        unreadCount: {} 
    }).then(() => {
        return groupId;
    });
}
