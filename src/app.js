// --- IMPORTY CORE ---
import { initRouter } from './core/router.js';
import { initAuth } from './modules/auth.js';

// --- IMPORTY MODUŁÓW (Tymczasowo ładujemy stare moduły, dopóki ich nie zrefaktoryzujemy) ---
import { initMap } from './modules/map.js'; 
import { loadPosts } from './modules/posts.js';
import { loadInbox } from './modules/chat.js';

window.Waggle = window.Waggle || {};

// Globalny system powiadomień (zostawiamy tu, dopóki nie wydzielimy do src/ui/toast.js)
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

// Główna funkcja startowa
async function bootstrap() {
    console.log("🐾 Waggle Core Foundation V1 - Uruchamianie...");
    
    // Uruchamiamy nawigację dolnego menu
    initRouter();

    // Inicjalizujemy przestarzałe moduły (w Etapie 2 i 3 będziemy je po kolei sprzątać)
    initMap();
    loadPosts();
    loadInbox();
}

// Aplikacja zaczyna życie od autoryzacji
document.addEventListener('DOMContentLoaded', () => {
    initAuth(() => {
        // Jeśli logowanie się uda, odpalamy całą resztę (bootstrap)
        bootstrap();
    });
});
