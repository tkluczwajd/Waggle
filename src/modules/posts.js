import { db } from '../core/firebase.js';
import { state, addListener } from '../core/state.js';

const IMGBB_KEY = "af2b35f5ca54dd9c8fc91595fe525de9"; 

export function loadPosts() {
    const unsub = db.collection("posts").orderBy("timestamp", "desc").limit(20).onSnapshot(snap => {
        let html = "";
        snap.forEach(doc => {
            const p = doc.data();
            const img = p.imageUrl ? `<img src="${p.imageUrl}" onclick="Waggle.openLightbox('${p.imageUrl}')" style="width:100%; border-radius:12px; margin-top:10px; cursor:pointer;">` : "";
            html += `<div class="post-card"><b>${p.author}</b><p>${p.content}</p>${img}</div>`;
        });
        document.getElementById('posts-container').innerHTML = html;
    }, err => console.error("Posts error:", err));
    addListener(unsub);
}

export function openLightbox(url) {
    const modal = document.getElementById('lightbox-modal');
    document.getElementById('lightbox-img').src = url;
    modal.style.display = 'flex';
}

export async function saveCommunityPost(content, file) {
    let url = "";
    if (file) url = await compressAndUpload(file).catch(e => { console.error(e); return ""; });
    return db.collection("posts").add({
        uid: state.user.uid,
        author: state.profile.name,
        content,
        imageUrl: url,
        timestamp: Date.now()
    });
}

// ... reszta funkcji compressAndUpload pozostaje bez zmian ...
