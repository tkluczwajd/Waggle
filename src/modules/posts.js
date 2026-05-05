import { db } from '../core/firebase.js';
import { state, addListener } from '../core/state.js';

const IMGBB_API_KEY = "af2b35f5ca54dd9c8fc91595fe525de9"; 

export function loadPosts() {
    const unsub = db.collection("posts")
        .orderBy("timestamp", "desc")
        .limit(20)
        .onSnapshot(snap => {
            let html = "";
            snap.forEach(doc => {
                const p = doc.data();
                const img = p.imageUrl ? `<img src="${p.imageUrl}" onclick="window.openLightbox('${p.imageUrl}')" style="cursor:pointer; width:100%; border-radius:12px; margin-top:10px;">` : "";
                html += `
                    <div class="post-card">
                        <b style="color:var(--primary); font-size:16px;">${p.author}</b>
                        <p style="margin-top:8px;">${p.content}</p>
                        ${img}
                    </div>`;
            });
            document.getElementById('posts-container').innerHTML = html || "<p style='text-align:center;'>Cisza w stadzie...</p>";
        });
    addListener(unsub);
}

// Przywrócona funkcja wysyłania postów z v21.13
export async function saveCommunityPost(content, imageFile) {
    let imageUrl = "";

    if (imageFile) {
        imageUrl = await compressAndUpload(imageFile);
    }

    return db.collection("posts").add({
        uid: state.user.uid,
        author: state.profile.name,
        content: content,
        imageUrl: imageUrl,
        timestamp: Date.now()
    });
}

// Logika kompresji zdjęć - oszczędza Twój transfer!
async function compressAndUpload(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = e => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                const MAX = 800;
                if(w > MAX) { h = Math.round((h * MAX)/w); w = MAX; }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                canvas.toBlob(blob => {
                    let fd = new FormData();
                    fd.append("image", blob);
                    fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: fd })
                        .then(r => r.json())
                        .then(d => resolve(d.data.url));
                }, 'image/jpeg', 0.7);
            };
        };
    });
}
