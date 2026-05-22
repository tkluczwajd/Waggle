// src/services/postsService.js
import { db, fb } from '../core/firebase.js';

const IMGBB_KEY = "af2b35f5ca54dd9c8fc91595fe525de9"; 

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

export function addCommentInDb(postId, commentData) {
    return db.collection("posts").doc(postId).collection("comments").add({
        ...commentData,
        timestamp: fb.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        return db.collection("posts").doc(postId).update({
            commentCount: fb.firestore.FieldValue.increment(1)
        });
    });
}

// 🔥 SZEFIE, TUTAJ ZASZŁA MAGIA OPTYMALIZACJI TRANSFERU:
export async function uploadImageToService(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader(); 
        reader.readAsDataURL(file);
        reader.onload = e => {
            const img = new Image(); 
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                
                // Podbijamy próg do 1024px dla lepszej ostrości, bo WebP i tak waży grosze!
                const MAX_WIDTH = 1024;
                if(w > MAX_WIDTH) { 
                    h = Math.round((h * MAX_WIDTH) / w); 
                    w = MAX_WIDTH; 
                }
                
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                
                // 🎯 Przechodzimy na format 'image/webp' z kompresją 0.75.
                // Zdjęcia z telefonów komórkowych będą teraz przesyłane błyskawicznie!
                canvas.toBlob(blob => {
                    if (!blob) return reject(new Error("Błąd konwersji zdjęcia."));
                    
                    const fd = new FormData(); 
                    fd.append("image", blob, "waggle_upload.webp"); // Narzucamy rozszerzenie .webp
                    
                    fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: fd })
                        .then(r => r.json())
                        .then(res => resolve(res.data.url))
                        .catch(reject);
                }, 'image/webp', 0.75);
            };
        };
    });
}
// Ożywia przycisk "Będę!" - dodaje lub usuwa użytkownika z listy uczestników ustawki
export async function toggleAttendanceInDb(postId, uid) {
    const postRef = db.collection('posts').doc(postId);
    
    try {
        const doc = await postRef.get();
        if (!doc.exists) return;
        
        const data = doc.data();
        const attendees = data.attendees || [];
        
        if (attendees.includes(uid)) {
            // Użytkownik już tam jest -> Wypisuje się
            return postRef.update({
                attendees: attendees.filter(id => id !== uid)
            });
        } else {
            // Użytkownik dołącza -> Zapisuje się
            return postRef.update({
                attendees: [...attendees, uid]
            });
        }
    } catch (error) {
        console.error("Błąd podczas zmiany statusu obecności:", error);
    }
}
