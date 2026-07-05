// src/core/appBootstrap.js
import { initRouter } from './router.js';
import { initGlobalUtils } from '../ui/globalUtils.js';
import { initUiListeners } from '../ui/uiListeners.js';
import { initWaggleApi } from './waggleApi.js';
import { setupAuth } from './authInit.js';
import { setupSubscriptions } from './subscriptionInit.js';
import { setupLocationTracking } from './locationInit.js';
import { renderWiki } from '../ui/wikiRenderer.js';
import { updateStatsUI, updateUserMarker } from '../ui/uiHelpers.js';
import { initMap } from '../modules/map/mapManager.js';
import { appState as state } from './state.js';
import { fetchWeather } from '../services/weatherService.js';
import { fetchNearbyParks } from '../services/parksService.js';
import { renderParksOnMap } from '../modules/map/parksRenderer.js';
import { listenToDailyCare } from '../modules/care.js';
import { initProfileUi } from '../ui/profileUiListeners.js';
import { initLiveFeed } from '../modules/map/liveFeed.js';
import { loadInbox } from '../modules/chat/chatListeners.js';
import '../modules/chat/groupListeners.js'; 

// --- LOGIKA WYSYŁANIA LOKALIZACJI PRZEZ ZNALAZCĘ ---
window.Waggle.shareFinderLocation = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const safeId = urlParams.get('safe');
    const btn = document.getElementById('shareLocationBtn');
    if (btn) { btn.innerText = "POBIERAM SYGNAŁ GPS... ⏳"; btn.disabled = true; }

    navigator.geolocation.getCurrentPosition(async (position) => {
        try {
            const { latitude, longitude } = position.coords;
            const { db, fb } = await import('./firebase.js');
            await db.collection('safe_reports').add({
                ownerUid: safeId, lat: latitude, lng: longitude, status: 'NEW', source: 'APP_MODAL',
                timestamp: fb.firestore.FieldValue.serverTimestamp()
            });
            if (btn) { btn.innerText = "✅ WYSŁANO LOKALIZACJĘ!"; btn.style.background = "#2ed573"; }
            if (window.Waggle.showToast) window.Waggle.showToast("Dziękujemy! Opiekun otrzymał powiadomienie.");
        } catch (err) {
            console.error(err);
            if (btn) { btn.innerText = "❌ BŁĄD"; btn.disabled = false; }
        }
    }, (err) => { alert("Musisz zezwolić na dostęp do lokalizacji!"); btn.disabled = false; }, 
    { enableHighAccuracy: true, timeout: 15000 });
};

export function bootstrapApp() {
    initGlobalUtils();
    initWaggleApi(updateUserMarker);
    window.Waggle.updateStatsUI = updateStatsUI; 

    setupAuth(() => {
        initRouter();

        // 🔥 RADAR S.A.F.E.
        const startSafeRadar = () => {
            const currentUid = localStorage.getItem('activeDogId') || localStorage.getItem('uid');
            if (!currentUid) return;
            import('./firebase.js').then(({ db }) => {
                db.collection('safe_reports').where('ownerUid', '==', currentUid).onSnapshot(snap => {
                    snap.docChanges().forEach(change => {
                        if (change.type === 'added' && (Date.now() - (change.doc.data().timestamp?.toMillis() || Date.now())) < 900000) {
                            if (window.Waggle.showToast) window.Waggle.showToast("🚨 Namierzono psa!", 8000);
                            const mapTab = document.querySelector('[data-view="local"]');
                            if (mapTab) mapTab.click();
                        }
                    });
                });
            });
        };
        startSafeRadar();
        
        initProfileUi();
        initUiListeners();
        initLiveFeed();
        loadInbox();
        updateStatsUI();
        listenToDailyCare();

        setupLocationTracking((lat, lng) => {
            initMap(); 
            updateStatsUI(); 
            if(state.map.instance) {
                state.map.instance.setView([lat, lng], 15, { animate: false });
                setTimeout(() => state.map.instance.invalidateSize(true), 300);
            }
            setupSubscriptions();
            fetchWeather(lat, lng);
            renderWiki('sytuacje');
            (async () => { try { const p = await fetchNearbyParks(lat, lng); if (p) renderParksOnMap(p); } catch (e) { console.error(e); } })();

            const loader = document.getElementById('loader');
            if (loader) { loader.style.opacity = '0'; setTimeout(() => loader.style.display = 'none', 300); }
        });
    });
}
