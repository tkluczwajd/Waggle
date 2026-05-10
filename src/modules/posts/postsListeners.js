import { appState as state } from '../../core/state.js';
import { registerListener } from '../../core/listeners.js';
import { 
    subscribeToPosts, 
    addPost, 
    deletePostInDb, 
    toggleLikeInDb, 
    subscribeToComments, 
    addCommentInDb, 
    uploadImageToService 
} from './postsService.js';
import { renderPostsList, renderCommentsList } from './postsRenderer.js';

let currentFilter = 'all';
let currentPosts = [];
let currentCommentsUnsub = null;

// Eksportujemy do użycia w app.js
export function loadPosts() {
    const unsub = subscribeToPosts(50, (posts) => {
        currentPosts = posts;
        renderPostsList(currentPosts, currentFilter);
    });
    registerListener(unsub);
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

export async function saveCommunityPost(content, imageUrl = null, isEvent = false, eventDate = null, isInfo = false) {
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
        isAlert: false,
        likes: [], 
        commentCount: 0
    });
}

// Zapewniamy, że obiekt Waggle istnieje w oknie przeglądarki
window.Waggle = window.Waggle || {};

// Teraz bezpiecznie przypisujemy funkcje dla onclicków w HTML
window.Waggle.deletePost = (id) => deletePostInDb(id);
window.Waggle.togglePostLike = togglePostLike;
window.Waggle.openPostComments = openPostComments;

export function openLightbox(url) {
    const img = document.getElementById('lightbox-img');
    const modal = document.getElementById('lightbox-modal');
    if (img && modal) { img.src = url; modal.style.display = 'flex'; }
}
window.Waggle.openLightbox = openLightbox;

export const uploadImage = uploadImageToService;
