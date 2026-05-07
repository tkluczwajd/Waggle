import { db, fb } from '../core/firebase.js';
import { state, addListener } from '../core/state.js';

const IMGBB_KEY = "af2b35f5ca54dd9c8fc91595fe525de9"; 

export function loadPosts() {
    const unsub = db.collection("posts").orderBy("timestamp", "desc").limit(30).onSnapshot(snap => { 
        let html = ""; 
        const isAdmin = state.profile?.isAdmin === true;
        
        snap.forEach(doc => { 
            const p = doc.data(); 
            let timeString = "Przed chwilą";
            if (p.timestamp) {
                const d = p.timestamp.toDate();
                timeString = d.toLocaleString('pl-PL', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'});
            }

            const avatarSrc = p.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
            let postImgHtml = p.imageUrl ? `<img src="${p.imageUrl}" style="width:100%; border-radius:16px; margin:15px 0; box-shadow:var(--soft-shadow); cursor:pointer;" onclick="window.Waggle.openLightbox('${p.imageUrl}')">` : "";
            let delBtn = (p.uid === state.user?.uid || isAdmin) ? `<button onclick="window.Waggle.deletePost('${doc.id}')" style="position:absolute; top:15px; right:15px; background:none; border:none; color:var(--danger); cursor:pointer; font-size:16px; padding:5px;">🗑️</button>` : "";
            
            // Klikalny nagłówek z awatarem
            let userHeader = `<button onclick="window.Waggle.openUserMenu('${p.uid}', '${p.author || 'Piesek'}', '${avatarSrc}')" style="background:none; border:none; padding:0; cursor:pointer; text-align:left;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <img src="${avatarSrc}" style="width:45px; height:45px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color);">
                    <div style="line-height:1.2;">
                        <b style="font-size:16px; color:var(--text-color);">${p.author || 'Piesek'}</b><br>
                        <small style="color:var(--text-muted); font-size:11px; font-weight:700;">${timeString}</small>
                    </div>
                </div>
            </button>`;

            html += `<div class="post-card" style="position:relative;">
                        ${delBtn}
                        ${userHeader}
                        <p style="color:var(--text-color); font-weight:600; margin-top:12px; word-break: break-word; font-size: 15px;">${p.content}</p>
                        ${postImgHtml}
                        <div style="border-top: 1px solid var(--border-color); margin-top: 15px; padding-top: 12px; display:flex; gap: 20px;">
                            <span style="font-size:13px; color:var(--text-muted); font-weight:800; cursor:pointer;" onclick="window.Waggle.showToast('Lubię to! ❤️')">🤍 Lubię to</span>
                            <span style="font-size:13px; color:var(--text-muted); font-weight:800; cursor:pointer;" onclick="window.Waggle.showToast('Komentarze w budowie!')">💬 Pokaż komentarze</span>
                        </div>
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
        const reader = new FileReader(); reader.readAsDataURL(file);
        reader.onload = e => {
            const img = new Image(); img.src = e.target.result;
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
        uid: state.user.uid, author: state.profile.name || "Piesek", avatar: state.profile.avatar || "", 
        content, imageUrl, timestamp: fb.firestore.FieldValue.serverTimestamp() 
    });
}
