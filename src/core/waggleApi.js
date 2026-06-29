import { searchUsers } from '../modules/chat/chatListeners.js';
import { switchView } from './router.js';
import { mapManager } from '../modules/map/mapManager.js';
import { openWikiDetails, renderWiki } from '../ui/wikiRenderer.js';
import { db, auth } from './firebase.js';
import { appState as state } from './state.js';
import { uploadImageToService as uploadImage } from '../services/postsService.js';
import { toggleFollowUserInDb } from '../services/profileService.js'; // 🔥 Import nowej funkcji
import { eventBus } from './eventBus.js';

export function initWaggleApi(updateUserMarker) {
    window.Waggle = window.Waggle || {};
    
    // Podpinamy funkcje pod globalne API
    window.Waggle.triggerMarkerRefresh = updateUserMarker;
    window.Waggle.executeSearch = (query) => { if (typeof searchUsers === 'function') searchUsers(query); };
// ... wewnątrz waggleApi (3).js ...
window.Waggle.centerOnTarget = (lat, lng) => { 
    console.log("API: centerOnTarget requested", lat, lng);
    switchView('local'); 

    // Sprawdzamy czy mapa już jest (zmienna globalna w state lub instance)
    if (state.map && state.map.instance) {
        console.log("API: Map exists, flying to...");
        mapManager.flyTo(lat, lng, 17);
    } else {
        console.log("API: Waiting for MAP_READY event...");
        const onMapReady = (mapInstance) => {
            console.log("API: MAP_READY received, flying to...");
            mapManager.flyTo(lat, lng, 17);
            eventBus.off('MAP_READY', onMapReady);
        };
        eventBus.on('MAP_READY', onMapReady);
    }
};
    window.Waggle.openWikiDetails = openWikiDetails;
    
    window.Waggle.likeWiki = (id) => {
        let favorites = JSON.parse(localStorage.getItem('waggle_wiki_favorites')) || [];
        if (favorites.includes(id)) {
            favorites = favorites.filter(favId => favId !== id);
            localStorage.setItem('waggle_wiki_favorites', JSON.stringify(favorites));
            window.Waggle.showToast("Usunięto z ulubionych 💔");
        } else {
            favorites.push(id);
            localStorage.setItem('waggle_wiki_favorites', JSON.stringify(favorites));
            window.Waggle.showToast("Zapisano w ulubionych poradach! ❤️");
        }
        const activeTabBtn = document.querySelector('.wiki-tab-btn.active');
        if (activeTabBtn) renderWiki(activeTabBtn.getAttribute('data-tab'));
    };

    window.Waggle.submitAlert = async () => {
        const input = document.getElementById('alertInput') || document.getElementById('alertTextInput');
        const text = input?.value;
        if(!text || text.trim() === "") return window.Waggle.showToast("Wpisz treść ostrzeżenia!");
        if(!state.location.lat) return window.Waggle.showToast("Brak GPS!");
        try {
            const timestamp = Date.now(); window.Waggle.showToast("Wysyłam zgłoszenie... ⚠️");
            let alertUrl = null; if(state.pendingAlertFile) { alertUrl = await uploadImage(state.pendingAlertFile); state.pendingAlertFile = null; }
            let finalLat = state.location.lat; let finalLng = state.location.lng;
            if (state.isGhostMode && state.ghostOffset) { finalLat += state.ghostOffset.lat; finalLng += state.ghostOffset.lng; }
            await db.collection("alerts").add({ text: text, lat: finalLat, lng: finalLng, createdAt: timestamp, imageUrl: alertUrl, userId: auth.currentUser ? auth.currentUser.uid : 'anon' });
            await saveCommunityPost(`⚠️ ALERT: ${text}`, alertUrl, false, null, true, true);
            const alertBtn = document.getElementById('alertAddPhotoBtn'); if (alertBtn) alertBtn.innerHTML = "📷 Dodaj zdjęcie zagrożenia";
            document.getElementById('alert-modal').style.display = 'none'; if(input) input.value = ''; window.Waggle.showToast("Zgłoszono zagrożenie! ⚠️");
        } catch (err) { console.error(err); window.Waggle.showToast("Błąd wysyłania!"); }
    };

    // 🔥 MAGNES: Dynamiczny Profil Psa z opcją obserwowania
    window.Waggle.openUserMenu = (targetUid, name, avatar, lat, lng) => {
        if (targetUid === state.user?.uid) return; 
        
        const following = state.profile?.following || [];
        const isFollowing = following.includes(targetUid);
        
        const btnText = isFollowing ? 'Od-obserwuj' : '⭐ Obserwuj pieska';
        const border = isFollowing ? '2px solid var(--border-color)' : 'none';
        const bg = isFollowing ? 'transparent' : 'var(--gold)';
        const textCol = isFollowing ? 'var(--text-color)' : '#fff';

        let overlay = document.getElementById('user-menu-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'user-menu-overlay';
            overlay.className = 'modal-overlay';
            overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px;';
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div class="modal-content" style="background:var(--panel-bg); border-radius:24px; padding:24px; width:100%; max-width:300px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.3); position:relative;">
                <button onclick="this.closest('#user-menu-overlay').style.display='none'" style="position:absolute; top:15px; right:15px; background:none; border:none; font-size:20px; cursor:pointer; color:var(--text-muted);">✕</button>
                <img src="${avatar}" style="width:80px; height:80px; border-radius:50%; object-fit:cover; border:3px solid var(--primary); margin-bottom:15px;">
                <h3 style="margin:0 0 5px 0; color:var(--text-color); font-size:20px; font-weight:900;">${name}</h3>
                <p style="margin:0 0 20px 0; font-size:13px; color:var(--text-muted);">Lokalny spacerowicz 🐾</p>
                
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <button onclick="window.Waggle.toggleFollow('${targetUid}'); this.closest('#user-menu-overlay').style.display='none'" style="background:${bg}; color:${textCol}; border:${border}; padding:12px; border-radius:12px; font-weight:800; font-size:15px; cursor:pointer; transition:0.2s;">${btnText}</button>
                    <button onclick="window.Waggle.openChat('${targetUid}', '${name}'); this.closest('#user-menu-overlay').style.display='none'" style="background:var(--primary); color:white; border:none; padding:12px; border-radius:12px; font-weight:800; font-size:15px; cursor:pointer;">💬 Napisz wiadomość</button>
                </div>
            </div>
        `;
        overlay.style.display = 'flex';
    };

    window.Waggle.toggleFollow = async (targetUid) => {
        window.Waggle.showToast("Aktualizuję Twój Psi Krąg... ⏳");
        try {
            await toggleFollowUserInDb(state.user.uid, targetUid);
            let following = state.profile.following || [];
            if (following.includes(targetUid)) {
                state.profile.following = following.filter(id => id !== targetUid);
                window.Waggle.showToast("Usunięto z obserwowanych.");
            } else {
                state.profile.following = [...following, targetUid];
                window.Waggle.showToast("⭐ Dodano do obserwowanych! Zostaniesz powiadomiony o jego spacerach.");
            }
        } catch (e) {
            window.Waggle.showToast("Błąd! Spróbuj ponownie.");
        }
    };
}
