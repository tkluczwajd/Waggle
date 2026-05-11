import { initAuth } from './modules/auth.js';
import { initMap, mapManager } from './modules/map/mapManager.js'; 
import { initProfileListeners } from './modules/profile/profileListeners.js';
import { loadPosts, setPostFilter, addPostComment } from './modules/posts/postsListeners.js';
import { loadInbox, sendMessage, searchUsers } from './modules/chat/chatListeners.js';
import { initRouter } from './core/router.js';
import { appState as state } from './core/state.js';

window.Waggle = window.Waggle || {};

// Globalny Toast
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

    // 📍 1. WŁĄCZENIE GPS (To przywróci śledzenie i niebieską kropkę)
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            state.location.lat = lat;
            state.location.lng = lng;

            if(!window.userMarker) {
                // Tworzymy niebieską kropkę
                window.userMarker = window.L.marker([lat, lng], {
                    icon: window.L.divIcon({
                        className: '',
                        html: '<div style="background:#34ace0; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(0,0,0,0.3);"></div>',
                        iconSize: [20,20]
                    })
                });
                mapManager.addMarkerToLayer('user', window.userMarker);
                mapManager.flyTo(lat, lng, 15); // Wyśrodkowanie na użytkowniku
            } else {
                window.userMarker.setLatLng([lat, lng]); // Aktualizacja pozycji
            }
        }, err => console.log("Czekam na GPS..."), { enableHighAccuracy: true });
    }

    // 🔌 2. PODPIĘCIE PRZYCISKÓW (Super-Klej dla UI)
    document.addEventListener('click', (e) => {
        // --- FILTRY POSTÓW ---
        if (e.target.closest('.filter-btn')) {
            const btn = e.target.closest('.filter-btn');
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setPostFilter(btn.dataset.filter || 'all');
        }

        // --- DODAWANIE KOMENTARZY ---
        if (e.target.closest('#sendCommentBtn')) {
            const input = document.getElementById('commentInput');
            if(input) {
                addPostComment(input.value);
                input.value = '';
            }
        }

        // --- ZAKŁADKI CZATU (Wiadomości / Szukaj) ---
        if (e.target.id === 'chatTabInbox') {
            document.getElementById('chat-inbox-view').style.display = 'block';
            document.getElementById('chat-search-view').style.display = 'none';
            e.target.classList.add('active');
            document.getElementById('chatTabSearch').classList.remove('active');
        }
        if (e.target.id === 'chatTabSearch') {
            document.getElementById('chat-inbox-view').style.display = 'none';
            document.getElementById('chat-search-view').style.display = 'block';
            e.target.classList.add('active');
            document.getElementById('chatTabInbox').classList.remove('active');
        }

        // --- PRZYCISKI CZATU ---
        if (e.target.closest('#sendMessageBtn')) {
            const input = document.getElementById('chatInput');
            if(input) {
                sendMessage(input.value);
                input.value = '';
            }
        }
        if (e.target.id === 'chatSearchBtn') {
            const query = document.getElementById('chatSearchInput').value;
            searchUsers(query);
        }

        // --- ZAMYKANIE MODALI ---
        if (e.target.closest('.close-modal-btn')) {
            const modal = e.target.closest('.modal-overlay') || document.getElementById('comments-modal');
            if(modal) modal.style.display = 'none';
        }
    });

    console.log("🚀 Waggle: Systemy ustabilizowane. Fundamenty utwardzone.");
}
