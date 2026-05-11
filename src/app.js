// --- IMPORTY CORE ---
import { initRouter } from './core/router.js';
import { initAuth } from './modules/auth.js';

// --- IMPORTY MODUŁÓW (LISTENERY I MANAGERY) ---
import { initMap } from './modules/map/mapManager.js'; 
import { initProfileListeners } from './modules/profile/profileListeners.js';
import { loadPosts } from './modules/posts/postsListeners.js';
import { loadInbox } from './modules/chat/chatListeners.js';

// --- GLOBALNE NARZĘDZIA ---
window.Waggle = window.Waggle || {};

// System powiadomień (Toast) - zostaje tutaj, bo jest używany wszędzie
window.Waggle.showToast = (msg) => {
    let toast = document.getElementById('waggle-toast');
    if(!toast) {
        toast = document.createElement('div');
        toast.id = 'waggle-toast';
        toast.style.cssText = 'position:fixed; bottom:110px; left:50%; transform:translateX(-50%); background:#2d3436; color:#fff; padding:12px 24px; border-radius:25px; font-size:14px; font-weight:800; z-index:10000; transition:all 0.3s ease; box-shadow:0 10px 30px rgba(0,0,0,0.3); border:2px solid var(--primary);';
        document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.style.display = 'block';
    toast.style.opacity = '1';
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 3000);
};

// --- GŁÓWNA INICJALIZACJA ---
export function initApp() {
    // 1. Uruchomienie routingu (przełączanie widoków)
    initRouter();
    
    // 2. Start Mapy (GPS i markery)
    initMap();
    
    // 3. Start nasłuchiwania danych (Posty i Czat)
    loadPosts();
    loadInbox();
    
    // 4. Aktywacja interakcji profilu (edytowanie)
    initProfileListeners();
    
    console.log("🚀 Waggle: Systemy ustabilizowane. Fundamenty utwardzone.");
}

// START: Najpierw sprawdzamy autoryzację, potem odpalamy resztę
initAuth(initApp);
