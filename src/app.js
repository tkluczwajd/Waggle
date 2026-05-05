import { state, clearListeners } from './core/state.js';
import { auth } from './core/firebase.js';
import { initAuth } from './modules/auth.js';
import { initMap, centerOnMe, centerOnTarget } from './modules/map.js';
import { startWalk, stopWalk } from './modules/walk.js';
import { loadPosts, saveCommunityPost, openLightbox } from './modules/posts.js';
import { loadInbox, sendMessage, openChat, closeActiveChat } from './modules/chat.js';

// --- EKSPORT DO GLOBALNEGO OKNA (Dla HTML) ---
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
    loadDynamicWiki();
}

// --- FUNKCJA PRZEŁĄCZANIA WIDOKÓW ---
function switchView(viewId) {
    console.log("Switching to:", viewId);
    
    // 1. Czyścimy stare listenery (zapobiega lagom)
    clearListeners(); 

    // 2. Zarządzanie widocznością sekcji
    document.querySelectorAll('.view-section').forEach(v => {
        v.classList.remove('active');
        v.style.display = 'none'; // Twarde ukrycie
    });

    const target = document.getElementById('view-' + viewId);
    if(target) {
        target.classList.add('active');
        target.style.display = (viewId === 'map') ? 'flex' : 'block';
    }

    // 3. Aktualizacja menu
    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.remove('active');
        if(n.getAttribute('data-view') === viewId) n.classList.add('active');
    });

    // 4. Specjalna obsługa mapy (Fix na "rozjechaną" mapę)
    if(viewId === 'map' && state.map) {
        initMap(); // Upewniamy się, że mapa jest zainicjowana
        setTimeout(() => {
            state.map.invalidateSize(); // Wymusza przerysowanie kafli mapy
        }, 300);
    }

    // 5. Przeładowanie danych dla widoku
    if (viewId === 'community') loadPosts();
    if (viewId === 'chat') loadInbox();
}

// --- REJESTRACJA KLIKNIĘĆ (Fix na brak reakcji) ---
document.addEventListener('DOMContentLoaded', () => {
    // Nasłuchiwanie na nawigację dolną
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            if(view) switchView(view);
        });
    });

    // Inne przyciski
    const centerBtn = document.getElementById('centerBtn');
    if(centerBtn) centerBtn.onclick = () => centerOnMe();

    const startBtn = document.getElementById('startWalkBtn');
    if(startBtn) startBtn.onclick = () => startWalk();

    const stopBtn = document.getElementById('stopWalkBtn');
    if(stopBtn) stopBtn.onclick = () => stopWalk();
});

function loadDynamicWiki() {
    // Tu Twoja logika pobierania Wiki z Firebase (uproszczona)
    const container = document.getElementById('wiki-container');
    if (container) container.innerHTML = "<p style='padding:20px;'>Wczytywanie wiedzy...</p>";
}

initAuth();
