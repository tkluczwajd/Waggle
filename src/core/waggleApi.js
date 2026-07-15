// src/core/waggleApi.js
import { searchUsers } from '../modules/chat/chatListeners.js';
import { switchView } from './router.js';
import { mapManager } from '../modules/map/mapManager.js';
import { openWikiDetails, renderWiki } from '../ui/wikiRenderer.js';
import { db, auth } from './firebase.js';
import { appState as state } from './state.js';
import { uploadImageToService as uploadImage } from '../services/postsService.js';
import { toggleFollowUserInDb } from '../services/profileService.js'; 
import { eventBus, EVENTS } from './eventBus.js';
import { Logger } from './logger.js';
import { renderUserMenuModal } from '../ui/globalUtils.js';

export function initWaggleApi(updateUserMarker) {
    window.Waggle = window.Waggle || {};
    
    // 🏗️ PODZIAŁ ARCHITEKTURY - Przygotowanie pod usunięcie globalnego worka
    window.Waggle.Map = {};
    window.Waggle.UI = {};
    window.Waggle.API = {};

    // --- SEKCJA MAPY ---
    window.Waggle.Map.centerOnTarget = (lat, lng) => { 
        Logger.info('WaggleAPI', 'Centrowanie mapy na współrzędnych:', { lat, lng });
        switchView('local'); 

        if (state.map && state.map.instance) {
            mapManager.flyTo(lat, lng, 17);
        } else {
            const onMapReady = () => {
                mapManager.flyTo(lat, lng, 17);
                eventBus.off(EVENTS.MAP_READY, onMapReady);
            };
            eventBus.on(EVENTS.MAP_READY, onMapReady);
        }
    };
    window.Waggle.Map.triggerMarkerRefresh = updateUserMarker;
    
    // Aliasy dla kompatybilności z istniejącym kodem HTML
    window.Waggle.centerOnTarget = window.Waggle.Map.centerOnTarget;
    window.Waggle.triggerMarkerRefresh = window.Waggle.Map.triggerMarkerRefresh;

    // --- SEKCJA UI ---
    window.Waggle.UI.openWikiDetails = openWikiDetails;
    
    window.Waggle.UI.likeWiki = (id) => {
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

    window.Waggle.UI.openUserMenu = (targetUid, name, avatar, lat, lng) => {
        if (targetUid === state.user?.uid) return; 
        
        const following = state.profile?.following || [];
        const isFollowing = following.includes(targetUid);
        
        // Wywołujemy czystą funkcję UI bez plątania HTML-a w API
        renderUserMenuModal(targetUid, name, avatar, isFollowing);
    };

    // Aliasy UI
    window.Waggle.openWikiDetails = window.Waggle.UI.openWikiDetails;
    window.Waggle.likeWiki = window.Waggle.UI.likeWiki;
    window.Waggle.openUserMenu = window.Waggle.UI.openUserMenu;

    // --- SEKCJA API (Zewnętrzne akcje) ---
    window.Waggle.API.executeSearch = (query) => { 
        if (typeof searchUsers === 'function') searchUsers(query); 
    };

    window.Waggle.API.submitAlert = async () => {
        const input = document.getElementById('alertInput') || document.getElementById('alertTextInput');
        const text = input?.value;
        if(!text || text.trim() === "") return window.Waggle.showToast("Wpisz treść ostrzeżenia!");
        if(!state.location.lat) return window.Waggle.showToast("Brak GPS!");
        
        try {
            const timestamp = Date.now(); 
            window.Waggle.showToast("Wysyłam zgłoszenie... ⚠️");
            Logger.info('WaggleAPI', 'Wysyłanie alertu...');

            let alertUrl = null; 
            if(state.pendingAlertFile) { 
                alertUrl = await uploadImage(state.pendingAlertFile); 
                state.pendingAlertFile = null; 
            }
            
            let finalLat = state.location.lat; 
            let finalLng = state.location.lng;
            
            if (state.isGhostMode && state.ghostOffset) { 
                finalLat += state.ghostOffset.lat; 
                finalLng += state.ghostOffset.lng; 
            }
            
            await db.collection("alerts").add({ 
                text: text, 
                lat: finalLat, 
                lng: finalLng, 
                createdAt: timestamp, 
                imageUrl: alertUrl, 
                userId: auth.currentUser ? auth.currentUser.uid : 'anon' 
            });
            
            await saveCommunityPost(`⚠️ ALERT: ${text}`, alertUrl, false, null, true, true);
            const alertBtn = document.getElementById('alertAddPhotoBtn'); 
            if (alertBtn) alertBtn.innerHTML = "📷 Dodaj zdjęcie zagrożenia";
            
            document.getElementById('alert-modal').style.display = 'none'; 
            if(input) input.value = ''; 
            
            window.Waggle.showToast("Zgłoszono zagrożenie! ⚠️");
            Logger.info('WaggleAPI', 'Alert wysłany pomyślnie');
        } catch (err) { 
            Logger.error('WaggleAPI', 'Błąd wysyłania alertu', err);
            window.Waggle.showToast("Błąd wysyłania!"); 
        }
    };

    window.Waggle.API.toggleFollow = async (targetUid) => {
        window.Waggle.showToast("Aktualizuję Twój Psi Krąg... ⏳");
        try {
            await toggleFollowUserInDb(state.user.uid, targetUid);
            let following = state.profile.following || [];
            if (following.includes(targetUid)) {
                state.profile.following = following.filter(id => id !== targetUid);
                window.Waggle.showToast("Usunięto z obserwowanych.");
            } else {
                state.profile.following = [...following, targetUid];
                window.Waggle.showToast("⭐ Dodano do obserwowanych!");
            }
        } catch (e) {
            Logger.error('WaggleAPI', 'Błąd przełączania obserwacji', e);
            window.Waggle.showToast("Błąd! Spróbuj ponownie.");
        }
    };

    // Aliasy API
    window.Waggle.executeSearch = window.Waggle.API.executeSearch;
    window.Waggle.submitAlert = window.Waggle.API.submitAlert;
    window.Waggle.toggleFollow = window.Waggle.API.toggleFollow;
}
