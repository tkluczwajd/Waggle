import { initAuth } from './modules/auth.js';
import { initMap, mapManager } from './modules/map/mapManager.js'; 
import { initProfileListeners } from './modules/profile/profileListeners.js';
import { loadPosts, setPostFilter, addPostComment, saveCommunityPost } from './modules/posts/postsListeners.js';
import { loadInbox, sendMessage, searchUsers } from './modules/chat/chatListeners.js';
import { initRouter } from './core/router.js';
import { appState as state } from './core/state.js';

window.Waggle = window.Waggle || {};

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

    // 📍 1. GPS i śledzenie
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            state.location.lat = lat;
            state.location.lng = lng;

            if(!window.userMarker) {
                window.userMarker = window.L.marker([lat, lng], {
                    icon: window.L.divIcon({
                        className: '',
                        html: '<div style="background:#34ace0; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(0,0,0,0.3);"></div>',
                        iconSize: [20,20]
                    })
                });
                mapManager.addMarkerToLayer('user', window.userMarker);
                mapManager.flyTo(lat, lng, 15); 
            } else {
                window.userMarker.setLatLng([lat, lng]); 
            }
        }, err => console.log("Czekam na GPS..."), { enableHighAccuracy: true });
    }

    // 🔌 2. SUPER-KLEJ (Wszystkie przyciski interfejsu)
    document.addEventListener('click', (e) => {
        
        // --- 📝 POSTY ---
        if (e.target.closest('#addPostBtn')) {
            document.getElementById('post-creator-modal').style.display = 'flex';
        }
        if (e.target.closest('#publishPostBtn')) {
            const content = document.getElementById('postContent').value;
            const isEvent = document.getElementById('isEventCheckbox').checked;
            const isInfo = document.getElementById('isInfoCheckbox').checked;
            if(!content.trim()) return window.Waggle.showToast("Wpisz treść posta!");
            
            saveCommunityPost(content, null, isEvent, null, isInfo).then(() => {
                document.getElementById('post-creator-modal').style.display = 'none';
                document.getElementById('postContent').value = '';
                window.Waggle.showToast("Opublikowano! 🐾");
            });
        }
        if (e.target.closest('.filter-btn')) {
            const btn = e.target.closest('.filter-btn');
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setPostFilter(btn.dataset.filter || 'all');
        }
        if (e.target.closest('#sendCommentBtn')) {
            const input = document.getElementById('commentInput');
            if(input) { addPostComment(input.value); input.value = ''; }
        }

        // --- 💬 CZAT ---
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
        if (e.target.closest('#sendMsgBtn')) {
            const input = document.getElementById('chatInput');
            if(input) { sendMessage(input.value); input.value = ''; }
        }
        if (e.target.id === 'chatSearchBtn') {
            const query = document.getElementById('chatSearchInput').value;
            searchUsers(query);
        }

        // --- 👤 PROFIL I INNE MODALE ---
        if (e.target.closest('#openEditProfileBtn')) {
            const modal = document.getElementById('profile-setup-modal');
            if(modal) {
                document.getElementById('setupName').value = state.profile?.name || "";
                document.getElementById('setupCity').value = state.profile?.city || "";
                document.getElementById('setupBreed').value = state.profile?.breed || "";
                modal.style.display = 'flex';
            }
        }
        if (e.target.closest('#openSettingsBtn')) {
            document.getElementById('settings-modal').style.display = 'flex';
        }
        if (e.target.closest('#triggerAlertBtn')) {
            document.getElementById('alert-modal').style.display = 'flex';
        }
        if (e.target.closest('#weatherWidgetBtn')) {
            document.getElementById('weather-modal').style.display = 'flex';
        }

        // --- ❌ ZAMYKANIE MODALI ---
        if (e.target.closest('.close-modal-btn')) {
            const modal = e.target.closest('.modal') || e.target.closest('.modal-overlay');
            if(modal) modal.style.display = 'none';
        }
    });

    console.log("🚀 Waggle: Systemy ustabilizowane. Fundamenty utwardzone.");
}

initAuth(initApp);
