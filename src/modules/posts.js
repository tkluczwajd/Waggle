import { db, fb } from '../core/firebase.js';
import { state, addListener } from '../core/state.js';

const IMGBB_KEY = "af2b35f5ca54dd9c8fc91595fe525de9"; 

window.Waggle = window.Waggle || {};
window.Waggle.deletePost = (id) => {
    if(confirm('Na pewno usunąć ten post?')) {
        db.collection("posts").doc(id).delete();
    }
};

export function loadPosts() {
    const unsub = db.collection("posts").orderBy("timestamp", "desc").limit(30).onSnapshot(snap => { 
        let html = ""; 
        const isAdmin = state.profile?.isAdmin === true;
        
        snap.forEach(doc => { 
            const p = doc.data(); 
            
            // Formatowanie czasu
            let timeString = "Przed chwilą";
            if (p.timestamp) {
                const d = p.timestamp.toDate();
                timeString = d.toLocaleString('pl-PL', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'});
            }

            // Domyślny awatar
            const avatarSrc = p.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
            
            let postImgHtml = p.imageUrl ? `<img src="${p.imageUrl}" style="width:100%; border-radius:16px; margin:15px 0; box-shadow:var(--soft-shadow); cursor:pointer;" onclick="Waggle.openLightbox('${p.imageUrl}')">` : "";
            
            // Przyciski akcji
            let delBtn = (p.uid === state.user?.uid || isAdmin) ? `<button onclick="window.Waggle.deletePost('${doc.id}')" style="position:absolute; top:15px; right:15px; background:none; border:none; color:var(--danger); cursor:pointer; font-size:16px; padding:5px;">🗑️</button>` : "";
            let chatBtn = (p.uid !== state.user?.uid) ? `<button onclick="window.Waggle.openChat('${p.uid}', '${p.author || 'Piesek'}')" style="background:none; border:none; color:var(--secondary); font-weight:900; cursor:pointer; font-size:14px; padding:5px;">💬 Napisz (Priv)</button>` : "";

            html += `<div class="post-card" style="position:relative;">
                        ${delBtn}
                        <div style="display:flex; align-items:center; gap:12px;">
                            <img src="${avatarSrc}" style="width:45px; height:45px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color);">
                            <div style="line-height:1.2;">
                                <b style="font-size:16px;">${p.author || 'Piesek'}</b><br>
                                <small style="color:var(--text-muted); font-size:11px; font-weight:700;">${timeString}</small>
                            </div>
                        </div>
                        <p style="color:var(--text-color); font-weight:600; margin-top:12px; word-break: break-word; font-size: 15px;">${p.content}</p>
                        ${postImgHtml}
                        <div style="display:flex; justify-content:flex-end; margin-top:10px;">${chatBtn}</div>
                    </div>`; 
        }); 
        
        if(!html) html = `<div style="text-align:center; padding:40px 20px; color:var(--text-muted);"><h3>Cisza na osiedlu</h3></div>`; 
        
        const container = document.getElementById('posts-container');
        if(container) container.innerHTML = html; 
    });
    addListener(unsub);
}

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
                if(w > 800) { h = Math.round((h * 800)/w); w = 800; }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                
                canvas.toBlob(blob => {
                    const fd = new FormData(); fd.append("image", blob);
                    fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: fd })
                        .then(r => r.json()).then(res => resolve(res.data.url)).catch(reject);
                }, 'image/jpeg', 0.7);
            };
        };
    });
}

export async function saveCommunityPost(content, imageUrl = null) {
    if (!state.user || !state.profile) return;
    return db.collection("posts").add({ 
        uid: state.user.uid, 
        author: state.profile.name || "Piesek", 
        avatar: state.profile.avatar || "", 
        content, imageUrl, 
        timestamp: fb.firestore.FieldValue.serverTimestamp() 
    });
}

export function openLightbox(url) {
    const img = document.getElementById('lightbox-img');
    const modal = document.getElementById('lightbox-modal');
    if (img && modal) { img.src = url; modal.style.display = 'flex'; }
}