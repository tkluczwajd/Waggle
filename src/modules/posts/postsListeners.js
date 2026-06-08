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
    uploadImageToService,
    toggleAttendanceInDb
} from '../../services/postsService.js';

// 🔥 Importujemy subskrypcję wiadomości czatu do obsługi rezerwowej
import { subscribeToMessages } from '../../services/chatService.js';
import { renderPostsList, renderCommentsList } from './postsRenderer.js';

window.Waggle = window.Waggle || {};

let currentFilter = 'all';
let currentPosts = [];
let currentCommentsUnsub = null;

// Eksportujemy do użycia w app.js
export function loadPosts() {
    // 🔥 POPRAWKA (AUDYT): Zmniejszenie limitu pobieranych postów z 50 do 20
    const unsub = subscribeToPosts(20, (posts) => {
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
        isAlert, 
        category: isAlert ? 'alerts' : (isEvent ? 'events' : (isInfo ? 'info' : 'all')),
        likes: [], 
        commentCount: 0
    });
}

// --- BINDOWANIA GLOBALNE (DLA HTML) ---

window.Waggle.deletePost = (id) => deletePostInDb(id);
window.Waggle.togglePostLike = togglePostLike;
window.Waggle.openPostComments = openPostComments;

// Nasłuchiwacz kliknięcia w przycisk ustawki
window.Waggle.toggleEventAttendance = async (postId) => {
    if (!state.user) {
        window.Waggle.showToast("Musisz być zalogowany, aby dołączyć do stada! 🐾");
        return;
    }
    window.Waggle.showToast("Aktualizuję... ⏳");
    await toggleAttendanceInDb(postId, state.user.uid);
};

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

// 🔥 URUCHOMIENIE CZATU Z POZIOMU PROFILU NA TABLICY
window.Waggle.openUserMenu = (uid, name, avatar) => {
    const modal = document.getElementById('user-action-modal');
    if (modal) {
        document.getElementById('actionUserName').innerText = name;
        document.getElementById('actionUserAvatar').src = avatar;
        modal.style.display = 'flex';
        
        const msgBtn = document.getElementById('actionMsgBtn');
        if (msgBtn) {
            msgBtn.onclick = () => {
                // Ukrywamy pop-up profilu
                modal.style.display = 'none';
                
                if (!state.user) {
                    window.Waggle.showToast("Zaloguj się, aby rozmawiać! 🐕");
                    return;
                }
                
                if (uid === state.user.uid) {
                    window.Waggle.showToast("Nie możesz pisać sam ze sobą! 😉");
                    return;
                }

                // 1. Generujemy unikalne ID czatu na podstawie UID rozmówców (posortowane alfabetycznie)
                const chatId = [state.user.uid, uid].sort().join("_");
                
                // 2. Wstrzykujemy dane rozmówcy do stanu globalnego aplikacji
                state.currentChatId = chatId;
                state.chatPartnerUid = uid;
                state.chatPartnerName = name;
                state.chatPartnerAvatar = avatar;
                
                // 3. Sprawdzamy, czy w projekcie istnieje już globalna funkcja otwierania okna czatu
                if (window.Waggle.openChatWindow) {
                    window.Waggle.openChatWindow(chatId, name, uid);
                } else if (window.Waggle.openChat) {
                    window.Waggle.openChat(uid, name, avatar);
                } else {
                    // 4. PANCERNY FALLBACK: Samodzielnie otwieramy okno modalne czatu i bindujemy wiadomości live
                    const chatModal = document.getElementById('chat-window');
                    const partnerNameElem = document.getElementById('chatPartnerName');
                    
                    if (chatModal && partnerNameElem) {
                        partnerNameElem.innerText = name;
                        chatModal.style.display = 'flex';
                        
                        // Czyścimy poprzedni nasłuch czatu, jeśli jakiś był aktywny
                        if (window.Waggle.activeChatUnsubscribe) {
                            window.Waggle.activeChatUnsubscribe();
                        }
                        
                        // Podpinamy nasłuchiwanie bazy danych na żywo dla tego czatu
                        window.Waggle.activeChatUnsubscribe = subscribeToMessages(chatId, (messages) => {
                            const messagesContainer = document.getElementById('chatMessages');
                            if (messagesContainer) {
                                let chatHtml = "";
                                messages.forEach(m => {
                                    const isMe = m.senderId === state.user.uid || m.uid === state.user.uid;
                                    const bg = isMe ? 'var(--primary)' : 'var(--panel-bg)';
                                    const color = isMe ? '#ffffff' : 'var(--text-color)';
                                    const align = isMe ? 'flex-end' : 'flex-start';
                                    const radius = isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px';
                                    const imgHtml = m.imageUrl ? `<img src="${m.imageUrl}" style="width:100%; max-height:200px; object-fit:cover; border-radius:12px; margin-bottom:6px; display:block;">` : "";
                                    
                                    chatHtml += `
                                        <div style="align-self: ${align}; background: ${bg}; color: ${color}; padding: 10px 14px; border-radius: ${radius}; max-width: 75%; box-shadow: 0 2px 5px rgba(0,0,0,0.05); margin-bottom: 5px; word-break: break-word;">
                                            ${imgHtml}
                                            <span style="font-weight:600; font-size:14px;">${m.text || ""}</span>
                                        </div>
                                    `;
                                });
                                messagesContainer.innerHTML = chatHtml;
                                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                            }
                        });
                    }
                }
                
                // 5. Automatycznie przełączamy widok dolnego menu na zakładkę "Czat", by odświeżyć skrzynkę odbiorczą
                const chatTabButton = document.querySelector('.nav-item[data-view="chat"]');
                if (chatTabButton) {
                    chatTabButton.click();
                }
                
                window.Waggle.showToast(`Rozpoczynanie rozmowy z ${name}... 💬`);
            };
        }
    }
};
