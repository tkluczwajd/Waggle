import { state } from './core/state.js';
import { auth, db, fb } from './core/firebase.js';
import { initRouter } from './core/router.js'; 
import { eventBus } from './core/eventBus.js'; 
import { initAuth } from './modules/auth.js';
import { initMap, centerOnMe, centerOnTarget, nearbyPlaces } from './modules/map.js'; 
import { startWalk, stopWalk } from './modules/walk.js';
import { loadPosts, saveCommunityPost, uploadImage, openLightbox, setPostFilter, togglePostLike, openPostComments, addPostComment } from './modules/posts.js';
import { loadInbox, sendMessage, openChat, closeActiveChat, searchUsers, toggleStado, sendChatImage } from './modules/chat.js';

window.Waggle = window.Waggle || {};

window.Waggle.showToast = (msg) => {
    let toast = document.getElementById('waggle-toast');
    if(!toast) {
        toast = document.createElement('div');
        toast.id = 'waggle-toast';
        toast.style.cssText = 'position:fixed; bottom:110px; left:50%; transform:translateX(-50%); background:#2d3436; color:#fff; padding:12px 24px; border-radius:50px; z-index:99999; font-size:14px; font-weight:800; box-shadow:0 10px 20px rgba(0,0,0,0.2); transition:opacity 0.3s; text-align:center; white-space:nowrap; pointer-events:none;';
        document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.style.opacity = '1'; toast.style.display = 'block';
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(()=>toast.style.display='none',300); }, 3500);
}

// Globalne bindingi (Naprawa niedziałających funkcji)
window.Waggle.openChat = openChat;
window.Waggle.closeActiveChat = closeActiveChat;
window.Waggle.centerOnTarget = centerOnTarget;
window.Waggle.openLightbox = openLightbox;
window.Waggle.togglePostLike = togglePostLike;
window.Waggle.openPostComments = openPostComments;
window.Waggle.searchUsers = searchUsers;

document.addEventListener('click', async (e) => {
    // NAPRAWA PRZYCISKU ZAMKNIJ CZAT
    if (e.target.closest('#closeChatBtn') || e.target.classList.contains('close-modal-btn')) {
        const modal = e.target.closest('.modal');
        if (modal) modal.style.display = 'none';
        if (modal && modal.id === 'chat-window') closeActiveChat();
    }

    if (e.target.closest('#centerBtn')) centerOnMe();
    if (e.target.closest('#startWalkBtn')) startWalk();
    if (e.target.closest('#stopWalkBtn')) { stopWalk(); }

    // NAPRAWA PRZYCISKU ZGŁOŚ (ALERTY)
    if (e.target.closest('#triggerAlertBtn')) document.getElementById('alert-modal').style.display = 'flex';
    if (e.target.closest('#saveAlertBtn')) {
        const textInput = document.getElementById('alertTextInput');
        if (!textInput.value.trim()) return window.Waggle.showToast("Wpisz treść alertu!");
        
        if (!state.location.lat) {
            window.Waggle.showToast("Czekam na sygnał GPS... spróbuj za chwilę 🛰️");
            return;
        }

        const alertText = textInput.value;
        db.collection("alerts").add({ 
            text: alertText, lat: state.location.lat, lng: state.location.lng, 
            createdAt: Date.now(), creator: state.user.uid 
        }).then(() => {
            db.collection("posts").add({ 
                uid: state.user.uid, author: state.profile?.name || "Piesek", avatar: state.profile?.avatar || "", 
                content: alertText, imageUrl: null, isEvent: false, isAlert: true, isInfo: false,
                likes: [], commentCount: 0, timestamp: fb.firestore.FieldValue.serverTimestamp() 
            });
            document.getElementById('alert-modal').style.display = 'none';
            textInput.value = ''; window.Waggle.showToast("Zagrożenie zgłoszone! ⚠️");
        });
    }

    // NAPRAWA PRZYCISKU WYŚLIJ (CZAT)
    if (e.target.closest('#sendMsgBtn')) {
        const input = document.getElementById('chatInput');
        if (input && input.value.trim()) {
            sendMessage(input.value.trim());
            input.value = ""; 
        }
    }

    // ZAPISYWANIE PROFILU (Naprawa zerowania danych)
    if (e.target.closest('#saveProfileBtn')) {
        const btn = e.target.closest('#saveProfileBtn');
        btn.disabled = true;
        const d = { 
            name: document.getElementById('setupName').value.trim(), 
            city: document.getElementById('setupCity').value.trim(), 
            breed: document.getElementById('setupBreed').value 
        };
        db.collection("users").doc(state.user.uid).update(d).then(() => {
            btn.disabled = false;
            document.getElementById('profile-setup-modal').style.display = 'none';
            window.Waggle.showToast("Profil zaktualizowany! ✅");
        });
    }
});

export function initApp() {
    initRouter(); 
    eventBus.on('viewChanged', (view) => {
        if (view === 'community') loadPosts();
        if (view === 'chat') loadInbox();
    });
    initMap();
    loadPosts();
    loadInbox();
}

initAuth(initApp);
