// src/services/postsService.js
import { db, fb } from '../core/firebase.js';

// Usunęliśmy stary klucz ImgBB - nie będzie już potrzebny!

export function subscribeToPosts(limit, callback) {
    return db.collection("posts")
        .orderBy("timestamp", "desc")
        .limit(limit)
        .onSnapshot(snap => {
            const posts = [];
            snap.forEach(doc => posts.push({ id: doc.id, ...doc.data() }));
            callback(posts);
        });
}

export async function addPost(postData) {
    return db.collection("posts").add({
        ...postData,
        timestamp: fb.firestore.FieldValue.serverTimestamp()
    });
}

export function deletePostInDb(postId) {
    return db.collection("posts").doc(postId).delete();
}

export function toggleLikeInDb(postId, userId) {
    const ref = db.collection("posts").doc(postId);
    return ref.get().then(doc => {
        const likes = doc.data().likes || [];
        if (likes.includes(userId)) {
            return ref.update({ likes: fb.firestore.FieldValue.arrayRemove(userId) });
        } else {
            return ref.update({ likes: fb.firestore.FieldValue.arrayUnion(userId) });
        }
    });
}

export function subscribeToComments(postId, callback) {
    return db.collection("posts").doc(postId).collection("comments")
        .orderBy("timestamp", "asc")
        .onSnapshot(snap => {
            const comments = [];
            snap.forEach(doc => comments.push({ id: doc.id, ...doc.data() }));
            callback(comments);
        });
}

export async function addComment(postId, commentData) {
    const ref = db.collection("posts").doc(postId);
    await ref.collection("comments").add({
        ...commentData,
        timestamp: fb.firestore.FieldValue.serverTimestamp()
    });
    
    // Zwiększamy licznik komentarzy w głównym poście
    return ref.update({
        commentsCount: fb.firestore.FieldValue.increment(1)
    });
}

// 🔥 WŁASNY FIREBASE STORAGE Z KOMPRESJĄ WEBP
export function uploadImageToService(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                // Skalujemy do max 1200px szerokości, by oszczędzać transfer
                const MAX_WIDTH = 1200;
                let scaleSize = 1;
                if (img.width > MAX_WIDTH) {
                    scaleSize = MAX_WIDTH / img.width;
                }
                
                canvas.width = img.width * scaleSize;
                canvas.height = img.height * scaleSize;
                
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                canvas.toBlob(blob => {
                    if (!blob) return reject(new Error("Błąd konwersji zdjęcia."));
                    
                    // Tworzymy bezpieczną i unikalną nazwę pliku
                    const fileName = `uploads/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.webp`;
                    
                    // Łączymy się z Twoim Firebase Storage
                    const storageRef = fb.storage().ref().child(fileName);
                    
                    // Wysyłamy skompresowany plik WebP
                    const uploadTask = storageRef.put(blob);
                    
                    uploadTask.on('state_changed', 
                        null, 
                        (error) => {
                            console.error("Błąd Firebase Storage:", error);
                            reject(error);
                        }, 
                        () => {
                            // Sukces! Zwracamy publiczny, bezpieczny URL bezpośrednio z Google
                            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                                resolve(downloadURL);
                            });
                        }
                    );
                }, 'image/webp', 0.75); // Jakość 75% - złoty środek dla zdjęć psów
            };
        };
    });
}

// Ożywia przycisk "Będę!" w ustawkach
export async function toggleAttendanceInDb(postId, uid) {
    const postRef = db.collection('posts').doc(postId);
    try {
        const doc = await postRef.get();
        if (!doc.exists) return;
        
        const data = doc.data();
        const attendees = data.attendees || [];
        
        if (attendees.includes(uid)) {
            return postRef.update({ attendees: attendees.filter(id => id !== uid) });
        } else {
            return postRef.update({ attendees: [...attendees, uid] });
        }
    } catch (error) {
        console.error(error);
    }
}
