import { initAuth } from "./modules/auth.js";
import { initMap, centerOnMe } from "./modules/map.js";
import { loadPosts } from "./modules/posts.js";
import { loadInbox } from "./modules/chat.js";
import { startWalk, stopWalk } from "./modules/walk.js";

// Funkcja wywoływana przez auth.js po zalogowaniu
export function initApp() {
    console.log("Waggle Engine: Ready 🐾");
    initMap();
    loadPosts();
    loadInbox();
}

// Podpięcie przycisków (Event Listeners)
document.addEventListener('DOMContentLoaded', () => {
    // Nawigacja i Mapa
    const centerBtn = document.getElementById('centerBtn');
    if(centerBtn) centerBtn.onclick = () => centerOnMe();

    // Spacer
    const startBtn = document.getElementById('startWalkBtn');
    if(startBtn) startBtn.onclick = () => startWalk();

    const stopBtn = document.getElementById('stopWalkBtn');
    if(stopBtn) stopBtn.onclick = () => stopWalk();

    // Logowanie (jeśli guziki są w index.html)
    // ... tu podepnij resztę logiki UI
});

// Odpalamy sprawdzanie sesji
initAuth();
