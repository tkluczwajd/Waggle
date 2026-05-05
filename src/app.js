import { state, clearListeners } from './core/state.js';
import { auth } from './core/firebase.js';
import { initAuth } from './modules/auth.js';
import { initMap, centerOnMe, centerOnTarget } from './modules/map.js';
import { startWalk, stopWalk } from './modules/walk.js';
import { loadPosts, saveCommunityPost, openLightbox } from './modules/posts.js';
import { loadInbox, sendMessage, openChat, closeActiveChat } from './modules/chat.js';

// --- NAMESPACE DLA HTML ---
// Dzięki temu onclick="Waggle.openChat()" zadziała w modułach
window.Waggle = {
    openChat,
    centerOnTarget,
    openLightbox,
    closeActiveChat
};

export function initApp() {
    console.log("Waggle Engine: Ready 🐾");
    initMap();
    loadPosts();
    loadInbox();
}

function switchView(viewId) {
    // 🔥 KLUCZ: Sprzątamy stare nasłuchiwanie przy zmianie zakładki
    // Zapobiega to nakładaniu się postów i wiadomości
    clearListeners(); 

    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    const target = document.getElementById('view-' + viewId);
    if(target) target.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.remove('active');
        if(n.dataset.view === viewId) n.classList.add('active');
    });

    // Re-inicjalizacja danych dla konkretnego widoku po czyszczeniu
    if (viewId === 'community') loadPosts();
    if (viewId === 'chat') loadInbox();
    if (viewId === 'map' && state.map) {
        initMap(); // Upewniamy się, że mapa żyje
        setTimeout(() => state.map.invalidateSize(), 200);
    }
}

document.addEventListener('click', async (e) => {
    const navItem = e.target.closest('.nav-item');
    if (navItem) switchView(navItem.dataset.view);

    if (e.target.id === 'centerBtn') centerOnMe();
    if (e.target.id === 'startWalkBtn') startWalk();
    if (e.target.id === 'stopWalkBtn') stopWalk();
    if (e.target.id === 'logoutBtn') auth.signOut();
    
    if (e.target.id === 'addPostBtn') {
        const text = prompt("Co u pieska?");
        // Walidacja zgodnie z review
        if(text && text.length > 2 && text.length < 500) {
            await saveCommunityPost(text, null).catch(err => console.error("Post error:", err));
        } else if (text) {
            alert("Post musi mieć od 2 do 500 znaków.");
        }
    }

    if (e.target.id === 'sendMsgBtn') {
        const input = document.getElementById('chatInput');
        if (input.value.trim()) {
            sendMessage(input.value.trim());
            input.value = "";
        }
    }
});

initAuth();
