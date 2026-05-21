// src/core/waggleApi.js
import { searchUsers } from '../modules/chat/chatListeners.js';
import { switchView } from './router.js';
import { mapManager } from '../modules/map/mapManager.js';
import { openWikiDetails, renderWiki } from '../ui/wikiRenderer.js';
import { db, auth } from './firebase.js';
import { appState as state } from './state.js';
import { uploadImageToService as uploadImage } from '../services/postsService.js';
import { saveCommunityPost } from '../modules/posts/postsListeners.js';

export function initWaggleApi(updateUserMarker) {
    window.Waggle = window.Waggle || {};
    
    // Podpinamy funkcje pod globalne API
    window.Waggle.triggerMarkerRefresh = updateUserMarker;
    window.Waggle.executeSearch = (query) => { if (typeof searchUsers === 'function') searchUsers(query); };
    window.Waggle.centerOnTarget = (lat, lng) => { switchView('map'); setTimeout(() => mapManager.flyTo(lat, lng, 16), 300); };
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
}
