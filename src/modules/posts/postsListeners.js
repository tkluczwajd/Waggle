import { appState as state } from '../../core/state.js';
import { eventBus } from '../../core/eventBus.js';

// Nowy, zbiorczy import ze "spłaszczonego" folderu services
import { 
    subscribeToPosts, 
    addPost, 
    deletePostInDb, 
    toggleLikeInDb, 
    subscribeToComments, 
    addCommentInDb, 
    uploadImageToService 
} from '../../services/postsService.js';

import { renderPostsList, renderCommentsList } from './postsRenderer.js';

window.Waggle = window.Waggle || {};

let currentFilter = 'all';
let currentPosts = [];
let currentCommentsUnsub = null;

// Eksportujemy do użycia w app.js
export function loadPosts() {
    const unsub = subscribeToPosts(50, (posts) => {
        currentPosts = posts;
        renderPostsList(currentPosts, currentFilter);
    })
}

export function setPostFilter(filter) {
    currentFilter = filter;
    renderPostsList(currentPosts, currentFilter);
}

export function togglePostLike(postId) {
    if (!state.user) return;
    toggleLikeInDb(postId, state.user.uid);
}

export function openPostComments(postId) {
    state.currentCommentPostId = postId; 
    document.getElementById('comments-modal').style.display = 'flex';
    
    if(currentCommentsUnsub) currentCommentsUnsub(); 
    
    currentCommentsUnsub = subscribeToComments(postId, (comments) => {
        renderCommentsList(comments);
    });
}

export function addPostComment(text) {
    if(!state.user || !state.currentCommentPostId || !text.trim()) return;
    
    addCommentInDb(state.currentCommentPostId, {
        uid: state.user.uid,
        author: state.profile?.name || "Piesek",
        text: text.trim()
    });
}

export async function saveCommunityPost(content, imageUrl = null, isEvent = false, eventDate = null, isInfo = false, isAlert = false) {
    if (!state.user || !state.profile) return;
    return addPost({ 
        uid: state.user.uid, 
        author: state.profile.name || "Piesek", 
        avatar: state.profile.avatar || "", 
        content, 
        imageUrl, 
        isEvent,
        eventDate,
        isInfo,
        isAlert, // Teraz przyjmuje wartość z argumentu, a nie false na sztywno
        category: isAlert ? 'alerts' : (isEvent ? 'events' : (isInfo ? 'info' : 'all')),
        likes: [], 
        commentCount: 0
    });
}
// --- BINDOWANIA GLOBALNE (DLA HTML) ---

// Ten "bezpiecznik" sprawia, że jeśli Waggle jeszcze nie istnieje, to zostanie utworzony
window.Waggle = window.Waggle || {};

window.Waggle.deletePost = (id) => deletePostInDb(id);
window.Waggle.togglePostLike = togglePostLike;
window.Waggle.openPostComments = openPostComments;

export function openLightbox(url) {
    const img = document.getElementById('lightbox-img');
    const modal = document.getElementById('lightbox-modal');
    if (img && modal) { 
        img.src = url; 
        modal.style.display = 'flex'; 
    }
}
window.Waggle.openLightbox = openLightbox;
export const uploadImage = uploadImageToService;

// 🔥 FIX: Brakująca funkcja otwierająca profil użytkownika
window.Waggle.openUserMenu = (uid, name, avatar) => {
    const modal = document.getElementById('user-action-modal');
    if (modal) {
        document.getElementById('actionUserName').innerText = name;
        document.getElementById('actionUserAvatar').src = avatar;
        modal.style.display = 'flex';
        
        // Zabezpieczenie przycisku wiadomości prywatnej (w przyszłości dopniesz tam bazę)
        const msgBtn = document.getElementById('actionMsgBtn');
        if (msgBtn) {
            msgBtn.onclick = () => {
                modal.style.display = 'none';
                window.Waggle.showToast("Czat z tablicy w przygotowaniu! 🐾");
            };
        }
    }
};
