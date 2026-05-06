import { db } from '../core/firebase.js';
import { state, ListenerManager } from '../core/state.js';

const IMGBB_KEY = "af2b35f5ca54dd9c8fc91595fe525de9"; 

export function loadPosts() {
    const unsub = db.collection("posts").orderBy("timestamp", "desc").limit(20).onSnapshot(snap => {
        let html = "";
        snap.forEach(doc => {
            const p = doc.data();
            const img = p.imageUrl ? `<img src="${p.imageUrl}" onclick="Waggle.openLightbox('${p.imageUrl}')" style="width:100%; border-radius:12px; margin-top:10px; cursor:pointer;">` : "";
            html += `<div class="post-card"><b>${p.author}</b><p>${p.content}</p>${img}</div>`;
        });
        document.getElementById('posts-container').innerHTML = html || "<p style='text-align:center;'>Brak postów.</p>";
    }, err => console.error("Posts error:", err));
    
    // ZMIANA: Menedżer Listenerów
    ListenerManager.register('posts', unsub);
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

async function compressAndUpload(file) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = e => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                if(w > 800) { h = Math.round((h * 800)/w); w = 800; }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                canvas.toBlob(blob => {
                    let fd = new FormData(); fd.append("image", blob);
                    fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: fd })
                    .then(r => r.json()).then(d => resolve(d.data.url));
                }, 'image/jpeg', 0.7);
            };
        };
    });
}
