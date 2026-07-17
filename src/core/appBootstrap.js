// src/core/appBootstrap.js
import { initAuthFlow } from './bootstrap/authBootstrap.js';
import { SafeEngine } from './SafeEngine.js'; 
import { NotificationEngine } from '../services/notificationEngine.js'; // 🔥 DODANY IMPORT
import { eventBus, EVENTS } from './eventBus.js';
import { Logger } from './logger.js';

import { initUiListeners } from '../ui/uiListeners.js';
import { setupSubscriptions } from './subscriptionInit.js';
import { setupLocationTracking } from './locationInit.js';
import { renderWiki } from '../ui/wikiRenderer.js';
import { updateStatsUI } from '../ui/uiHelpers.js';
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
import { initLegalManager } from '../ui/legalManager.js';



export function bootstrapApp() {
    Logger.info('Bootstrap', 'Startowanie aplikacji WAGGLE...');
    
    NotificationEngine.init(); 
    initLegalManager();
    initNetworkMonitor(); // 🔥 DODANE: Odpalamy radar połączenia
    // ... reszta kodu

    // 1. Zezwalamy na wysyłanie lokalizacji bez logowania (dla znalazcy)
    window.Waggle.shareFinderLocation = async () => {
        const urlParams = new URLSearchParams(window.location.search);
// ... i tu dalej leci reszta Twojego kodu bez zmian
        const safeId = urlParams.get('safe');
        const btn = document.getElementById('shareLocationBtn');
        if (btn) { btn.innerText = "POBIERAM SYGNAŁ GPS... ⏳"; btn.disabled = true; }

        try {
            await SafeEngine.sendFinderLocation(safeId);
            if (btn) { btn.innerText = "✅ WYSŁANO LOKALIZACJĘ!"; btn.style.background = "#2ed573"; }
            if (window.Waggle.showToast) window.Waggle.showToast("Dziękujemy! Opiekun otrzymał powiadomienie.");
        } catch (error) {
            if (btn) { btn.innerText = "❌ BŁĄD GPS"; btn.disabled = false; }
            alert("Musisz zezwolić na dostęp do lokalizacji!");
        }
    };

    // 2. Globalny nasłuch na alarmy SAFE (Logika UI)
    eventBus.on(EVENTS.SAFE_ALERT_RECEIVED, (report) => {
        if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 1000]);
        if (window.Waggle.showToast) window.Waggle.showToast("🚨 Namierzono psa! Sprawdź mapę!", 8000);
        
        // Przełączenie na mapę
        const mapTab = document.querySelector('[data-view="local"]');
        if (mapTab) mapTab.click();
        
        // Jeśli mapa jest gotowa, centrujemy na psie
        if (window.Waggle.API && window.Waggle.Map) {
            window.Waggle.Map.centerOnTarget(report.lat, report.lng);
        }
    });

    // 3. Startujemy proces logowania
    initAuthFlow(() => {
        const activeUid = localStorage.getItem('activeDogId') || localStorage.getItem('uid');
        
        // 🔥 4. Odpalamy czysty SafeEngine po zalogowaniu
        SafeEngine.startRadar(activeUid);
        
        initProfileUi();
        initUiListeners();
        initLiveFeed();
        loadInbox();
        updateStatsUI();
        listenToDailyCare();

        // 5. Pobieramy lokalizację i ładujemy mapę
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
            (async () => { try { const p = await fetchNearbyParks(lat, lng); if (p) renderParksOnMap(p); } catch (e) { Logger.warn('Bootstrap', 'OSM Parks timeout'); } })();

            const loader = document.getElementById('loader');
            if (loader) { loader.style.opacity = '0'; setTimeout(() => loader.style.display = 'none', 300); }
        });
    });
}

// 🔥 SYSTEM MONITOROWANIA SIECI (Lie-Fi & Offline UX)
function initNetworkMonitor() {
    // 1. Tworzymy element UI (Pigułka statusu)
    let offlineBadge = document.getElementById('waggle-offline-badge');
    if (!offlineBadge) {
        offlineBadge = document.createElement('div');
        offlineBadge.id = 'waggle-offline-badge';
        offlineBadge.innerHTML = '☁️ Tryb Offline';
        offlineBadge.style.cssText = `
            position: fixed; top: 15px; left: 50%; transform: translateX(-50%) translateY(-100px);
            background: rgba(255, 71, 87, 0.9); color: white; padding: 6px 14px;
            border-radius: 20px; font-size: 11px; font-weight: 800; z-index: 99999;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            backdrop-filter: blur(4px); letter-spacing: 0.5px;
        `;
        document.body.appendChild(offlineBadge);
    }

    // 2. Funkcja aktualizująca stan
    const updateNetworkStatus = () => {
        if (!navigator.onLine) {
            // Brak sieci - wysuwamy czerwoną pigułkę
            offlineBadge.style.transform = 'translateX(-50%) translateY(0)';
            offlineBadge.style.background = 'rgba(255, 71, 87, 0.9)';
            offlineBadge.innerHTML = '☁️ Brak połączenia (Offline)';
            if (window.Waggle && window.Waggle.showToast) {
                window.Waggle.showToast("Działasz w trybie offline. Ładuję dane z pamięci.");
            }
        } else {
            // Sieć wróciła - na chwilę zmieniamy na zielono, a potem chowamy
            offlineBadge.style.background = 'rgba(46, 213, 115, 0.9)';
            offlineBadge.innerHTML = '✅ Jesteś z powrotem online!';
            if (window.Waggle && window.Waggle.showToast) {
                window.Waggle.showToast("Połączenie przywrócone! 🚀");
            }
            setTimeout(() => {
                offlineBadge.style.transform = 'translateX(-50%) translateY(-100px)';
            }, 3000);
        }
    };

    // 3. Podpinamy nasłuchiwacze pod przeglądarkę
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // 4. Sprawdzamy stan początkowy przy starcie apki
    if (!navigator.onLine) {
        updateNetworkStatus();
    }
}
