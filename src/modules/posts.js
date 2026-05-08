import { db, fb } from '../core/firebase.js';
import { state, addListener } from '../core/state.js';

const IMGBB_KEY = "af2b35f5ca54dd9c8fc91595fe525de9"; 

export let currentFilter = 'all';
let currentPosts = []; 
let currentCommentsUnsub = null; 

export function setPostFilter(filter) {
    currentFilter = filter;
    renderPosts(); 
}

export function loadPosts() {
    const unsub = db.collection("posts").orderBy("timestamp", "desc").limit(50).onSnapshot(snap => { 
        currentPosts = [];
        snap.forEach(doc => { 
            currentPosts.push({ id: doc.id, ...doc.data() });
        }); 
        renderPosts();
    });
    addListener(unsub);
}

function renderPosts() {
    let html = ""; 
    const isAdmin = state.profile?.isAdmin === true;
    
    currentPosts.forEach(p => { 
        if (currentFilter === 'events' && !p.isEvent) return;
        if (currentFilter === 'alerts' && !p.isAlert) return;
        if (currentFilter === 'info' && !p.isInfo) return;

        let timeString = "Przed chwilą";
        if (p.timestamp) {
            const d = p.timestamp.toDate ? p.timestamp.toDate() : new Date(p.timestamp);
            timeString = d.toLocaleString('pl-PL', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'});
        }

        const avatarSrc = p.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
        let postImgHtml = p.imageUrl ? `<img src="${p.imageUrl}" style="width:100%; height:200px; object-fit:cover; border-radius:16px; margin:15px 0; box-shadow:var(--soft-shadow); cursor:pointer;" onclick="window.Waggle.openLightbox('${p.imageUrl}')">` : "";
        let delBtn = (p.uid === state.user?.uid || isAdmin) ? `<button onclick="window.Waggle.deletePost('${p.id}')" style="position:absolute; top:15px; right:15px; background:none; border:none; color:var(--danger); cursor:pointer; font-size:16px; padding:5px; z-index:10;">🗑️</button>` : "";
        
        let userHeader = `<button onclick="window.Waggle.openUserMenu('${p.uid}', '${p.author || 'Piesek'}', '${avatarSrc}')" style="background:none; border:none; padding:0; cursor:pointer; text-align:left; display:flex; align-items:center; gap:12px; width:100%;">
            <img src="${avatarSrc}" style="width:45px; height:45px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color);">
            <div style="line-height:1.2;">
                <b style="font-size:16px; color:var(--text-color);">${p.author || 'Piesek'}</b><br>
                <small style="color:var(--text-muted); font-size:11px; font-weight:700;">${timeString}</small>
            </div>
        </button>`;

        let eventBanner = "";
        let cardStyle = "position:relative;";
        
        if (p.isEvent) {
            cardStyle = "position:relative; border: 2px solid var(--primary);";
            let eventDateStr = p.eventDate ? new Date(p.eventDate).toLocaleString('pl-PL', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'}) : "Nieznana data";
            eventBanner = `<div style="background:var(--primary); color:white; padding:10px 15px; border-radius:10px; margin-bottom:15px; font-size:13px; display:flex; justify-content:space-between; align-items:center; box-shadow: 0 4px 10px rgba(52, 172, 224, 0.3);">
                <div><b style="font-size:15px;">📅 Ustawka!</b><br><small style="font-weight:700;">${eventDateStr}</small></div>
                <button onclick="window.Waggle.showToast('Zadeklarowałeś obecność! 🐾')" style="background:white; color:var(--primary); border:none; border-radius:20px; padding:6px 15px; font-weight:900; font-size:12px; cursor:pointer;">BĘDĘ!</button>
            </div>`;
        } else if (p.isAlert) {
            cardStyle = "position:relative; border: 2px solid var(--danger);";
            eventBanner = `<div style="background:var(--danger); color:white; padding:8px 12px; border-radius:8px; margin-bottom:10px; font-size:12px; font-weight:800;">⚠️ ZAGROŻENIE</div>`;
        } else if (p.isInfo) {
            cardStyle = "position:relative; border: 2px solid #f39c12;";
            eventBanner = `<div style="background:#f39c12; color:white; padding:8px 12px; border-radius:8px; margin-bottom:10px; font-size:12px; font-weight:800;">ℹ️ OGŁOSZENIE</div>`;
        }

        const likesCount = p.likes ? p.likes.length : 0;
        const hasLiked = p.likes && p.likes.includes(state.user?.uid);
        const commentCount = p.commentCount || 0; 

        html += `<div class="post-card" style="${cardStyle}">
                    ${eventBanner}
                    ${delBtn}
                    ${userHeader}
                    <p style="color:var(--text-color); font-weight:600; margin-top:12px; word-break: break-word; font-size: 15px;">${p.content}</p>
                    ${postImgHtml}
                    <div style="border-top: 1px solid var(--border-color); margin-top: 15px; padding-top: 12px; display:flex; gap: 20px;">
                        <span style="font-size:13px; color:${hasLiked ? 'var(--danger)' : 'var(--text-muted)'}; font-weight:800; cursor:pointer;" onclick="window.Waggle.togglePostLike('${p.id}')">
                            ${hasLiked ? '❤️' : '🤍'} ${likesCount > 0 ? likesCount : 'Lubię to'}
                        </span>
                        <span style="font-size:13px; color:var(--text-muted); font-weight:800; cursor:pointer;" onclick="window.Waggle.openPostComments('${p.id}')">
                            💬 ${commentCount > 0 ? commentCount + ' Komentarze' : 'Komentarze'}
                        </span>
                    </div>
                </div>`; 
    }); 
    
    if(!html) html = `<div style="text-align:center; padding:40px 20px; color:var(--text-muted);"><h3>Brak wpisów 🐕</h3><p>Bądź pierwszy i dodaj posta!</p></div>`; 
    const container = document.getElementById('posts-container');
    if(container) container.innerHTML = html; 
}

export function togglePostLike(postId) {
    if (!state.user) return;
    const ref = db.collection("posts").doc(postId);
    ref.get().then(doc => {
        const likes = doc.data().likes || [];
        if (likes.includes(state.user.uid)) {
            ref.update({ likes: fb.firestore.FieldValue.arrayRemove(state.user.uid) });
        } else {
            ref.update({ likes: fb.firestore.FieldValue.arrayUnion(state.user.uid) });
        }
    });
}

export function openPostComments(postId) {
    state.currentCommentPostId = postId; 
    document.getElementById('comments-modal').style.display = 'flex';
    
    if(currentCommentsUnsub) currentCommentsUnsub(); 
    
    currentCommentsUnsub = db.collection("posts").doc(postId).collection("comments").orderBy("timestamp", "asc").onSnapshot(snap => {
        let html = "";
        snap.forEach(doc => {
            const c = doc.data();
            const timeStr = c.timestamp ? new Date(c.timestamp.toDate ? c.timestamp.toDate() : c.timestamp).toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'}) : '';
            html += `
                <div style="background:var(--panel-bg); padding:10px 15px; border-radius:12px; margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:baseline;">
                        <b style="font-size:14px; color:var(--text-color);">${c.author}</b>
                        <small style="font-size:10px; color:var(--text-muted);">${timeStr}</small>
                    </div>
                    <p style="margin:5px 0 0 0; font-size:14px; font-weight:600;">${c.text}</p>
                </div>
            `;
        });
        const list = document.getElementById('comments-list');
        if(list) {
            list.innerHTML = html || "<p style='text-align:center; color:var(--text-muted); padding-top:20px;'>Brak komentarzy. Bądź pierwszy!</p>";
            list.scrollTop = list.scrollHeight; 
        }
    });
}

export function addPostComment(text) {
    if(!state.user || !state.currentCommentPostId || !text.trim()) return;
    const postId = state.currentCommentPostId;
    
    db.collection("posts").doc(postId).collection("comments").add({
        uid: state.user.uid,
        author: state.profile?.name || "Piesek",
        text: text.trim(),
        timestamp: fb.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        db.collection("posts").doc(postId).update({
            commentCount: fb.firestore.FieldValue.increment(1)
        });
    });
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

export async function saveCommunityPost(content, imageUrl = null, isEvent = false, eventDate = null, isInfo = false) {
    if (!state.user || !state.profile) return;
    return db.collection("posts").add({ 
        uid: state.user.uid, 
        author: state.profile.name || "Piesek", 
        avatar: state.profile.avatar || "", 
        content, 
        imageUrl, 
        isEvent,
        eventDate,
        isInfo,
        isAlert: false,
        likes: [], 
        commentCount: 0, 
        timestamp: fb.firestore.FieldValue.serverTimestamp() 
    });
}

export function openLightbox(url) {
    const img = document.getElementById('lightbox-img');
    const modal = document.getElementById('lightbox-modal');
    if (img && modal) { img.src = url; modal.style.display = 'flex'; }
}
