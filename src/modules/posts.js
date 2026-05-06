import { db, fb } from '../core/firebase.js';
import { state, addListener } from '../core/state.js';

const IMGBB_KEY = "af2b35f5ca54dd9c8fc91595fe525de9"; 

export function loadPosts() {
    const unsub = db.collection("posts").orderBy("timestamp", "desc").limit(30).onSnapshot(snap => { 
        let html = ""; 
        const isAdmin = state.profile?.isAdmin === true;
        
        snap.forEach(doc => { 
            const p = doc.data(); 
            let postImgHtml = p.imageUrl ? `<img src="${p.imageUrl}" style="width:100%; border-radius:16px; margin:15px 0; box-shadow:var(--soft-shadow); cursor:pointer;" onclick="Waggle.openLightbox('${p.imageUrl}')">` : "";
            let delBtn = (p.uid === state.user?.uid || isAdmin) ? `<button onclick="window.Waggle.deletePost('${doc.id}')" style="position:absolute; top:15px; right:15px; background:none; border:none; color:var(--danger); cursor:pointer; font-size:16px; padding:5px;">🗑️</button>` : "";
            
            html += `<div class="post-card" style="position:relative;">
                    ${delBtn}
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${p.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150'}" style="width:45px; height:45px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color);">
                        <b style="font-size:16px;">${p.author || 'Piesek'}</b>
                    </div>
                    <p style="color:var(--text-color); font-weight:600; margin-top:12px; word-break: break-word; font-size: 15px;">${p.content}</p>
                    ${postImgHtml}
                  </div>`; 
        }); 
        
        if(!html) {
            html = `<div style="text-align:center; padding:40px 20px; color:var(--text-muted);"><h3>Cisza na osiedlu</h3></div>`; 
        }
        document.getElementById('posts-container').innerHTML = html; 
    });
    addListener(unsub);
}

// FUNKCJA KOMPRESJI I WYSYŁKI
export async function uploadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = e => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                // Maksymalna szerokość 800px dla szybkości
                if(w > 800) { h = Math.round((h * 800)/w); w = 800; }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                
                canvas.toBlob(blob => {
                    const fd = new FormData();
                    fd.append("image", blob);
                    fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: fd })
                        .then(r => r.json())
                        .then(res => resolve(res.data.url))
                        .catch(err => reject(err));
                }, 'image/jpeg', 0.7);
            };
        };
    });
}

export async function saveCommunityPost(content, imageUrl = null) {
    return db.collection("posts").add({ 
        uid: state.user.uid, 
        author: state.profile.name || "Piesek", 
        avatar: state.profile.avatar || "", 
        content, 
        imageUrl, 
        timestamp: fb.firestore.FieldValue.serverTimestamp() 
    });
}