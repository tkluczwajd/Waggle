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
            return ref.update({
                likes: fb.firestore.FieldValue.arrayRemove(userId)
            });
        } else {
            return ref.update({
                likes: fb.firestore.FieldValue.arrayUnion(userId)
            });
        }
    });
}

export function subscribeToComments(postId, callback) {
    return db.collection("posts")
        .doc(postId)
        .collection("comments")
        .orderBy("timestamp", "asc")
        .onSnapshot(snap => {

            const comments = [];

            snap.forEach(doc =>
                comments.push({
                    id: doc.id,
                    ...doc.data()
                })
            );

            callback(comments);
        });
}

export function addCommentInDb(postId, commentData) {
    return db.collection("posts")
        .doc(postId)
        .collection("comments")
        .add({
            ...commentData,
            timestamp: fb.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            return db.collection("posts")
                .doc(postId)
                .update({
                    commentCount:
                        fb.firestore.FieldValue.increment(1)
                });
        });
}

// 🔥 OPTYMALIZACJA UPLOADU + WEBP + IMGBB
export async function uploadImageToService(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = e => {

            const img = new Image();
            img.src = e.target.result;

            img.onload = () => {

                const canvas =
                    document.createElement('canvas');

                let w = img.width;
                let h = img.height;

                // MAX szerokość
                const MAX_WIDTH = 1024;

                if (w > MAX_WIDTH) {
                    h = Math.round(
                        (h * MAX_WIDTH) / w
                    );
                    w = MAX_WIDTH;
                }

                canvas.width = w;
                canvas.height = h;

                canvas
                    .getContext('2d')
                    .drawImage(img, 0, 0, w, h);

                // WEBP 75%
                canvas.toBlob(blob => {

                    if (!blob) {
                        return reject(
                            new Error(
                                "Błąd konwersji zdjęcia."
                            )
                        );
                    }

                    const fd = new FormData();

                    fd.append(
                        "image",
                        blob,
                        "waggle_upload.webp"
                    );

                    fetch(
                        `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
                        {
                            method: "POST",
                            body: fd
                        }
                    )
                        .then(r => r.json())
                        .then(res => {

                            if (
                                res &&
                                res.success &&
                                res.data?.url
                            ) {
                                resolve(res.data.url);
                            } else {
                                reject(
                                    new Error(
                                        "ImgBB upload failed"
                                    )
                                );
                            }
                        })
                        .catch(reject);

                }, 'image/webp', 0.75);
            };

            img.onerror = reject;
        };

        reader.onerror = reject;
    });
}
