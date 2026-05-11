import { initAuth } from './modules/auth.js';
import { initMap } from './modules/map/mapManager.js'; 
import { initProfileListeners } from './modules/profile/profileListeners.js';
import { loadPosts } from './modules/posts/postsListeners.js';
import { loadInbox } from './modules/chat/chatListeners.js';
import { initRouter } from './core/router.js';

window.Waggle = window.Waggle || {};

// Toast zostaje w globalu, by każdy moduł mógł go użyć
window.Waggle.showToast = (msg) => {
    let t = document.getElementById('waggle-toast');
    if(!t) {
        t = document.createElement('div'); t.id = 'waggle-toast';
        t.style.cssText = 'position:fixed; bottom:110px; left:50%; transform:translateX(-50%); background:#2d3436; color:#fff; padding:12px 24px; border-radius:25px; font-size:14px; font-weight:800; z-index:10000; border:2px solid var(--primary);';
        document.body.appendChild(t);
    }
    t.innerText = msg; t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 3000);
};

export function initApp() {
    initRouter();
    initMap();
    loadPosts();
    loadInbox();
    initProfileListeners();
    
    console.log("🚀 Waggle: Systemy ustabilizowane. Fundamenty utwardzone.");
}

initAuth(initApp);
