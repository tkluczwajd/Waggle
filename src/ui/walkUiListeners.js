// src/ui/walkUiListeners.js
import { appState as state } from '../core/state.js';
import { mapManager } from '../modules/map/mapManager.js';
import { startWalkInDb, stopWalkInDb } from '../services/walkService.js'; 
import { startWalkTracker, stopWalkTracker } from '../modules/walkTracker.js';
// 🔥 DODANY IMPORT DO ODŚWIEŻANIA STATYSTYK:
import { updateStatsUI } from './uiHelpers.js';

export function initWalkUi() {
    // 🔥 KRYTYCZNA ZMIANA: Dodano słowo "async" przed (e)
    document.addEventListener('click', async (e) => {
        
        // LOKALIZACJA
        if (e.target.closest('#centerBtn')) { 
            if (state.location.lat && state.location.lng) { 
                mapManager.flyTo(state.location.lat, state.location.lng, 15); 
                window.Waggle.showToast("Zlokalizowano! 📍"); 
            } 
        }
        
        // START SPACERU
        if (e.target.closest('#startWalkBtn')) {
            const statusInput = document.getElementById('statusInput');
            const statusText = statusInput ? statusInput.value.trim() : "";

            state.isWalking = true; 
            document.getElementById('startWalkBtn').style.display = 'none'; 
            document.getElementById('stopWalkBtn').style.display = 'inline-block'; 
            if (statusInput) statusInput.style.display = 'none';
            
            const liveStats = document.getElementById('walk-live-stats');
            if (liveStats) liveStats.style.display = 'block';
            
            const distCounter = document.getElementById('walk-distance-counter');
            if (distCounter) distCounter.innerText = "0.00 km";
            
            const speedCounter = document.getElementById('walk-speed-counter');
            if (speedCounter) speedCounter.innerText = "0.0";

            const payload = {
                uid: state.user.uid,
                name: state.profile?.name || "Piesek",
                avatar: state.profile?.avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150",
                lat: state.location.lat,
                lng: state.location.lng,
                timestamp: Date.now(),
                statusText: statusText 
            };

            startWalkInDb(state.user.uid, payload);
            
            // Odpalenie silnika liczącego dystans i rysującego na mapie (Diagnostyka!)
            await startWalkTracker();
        }
        
        // KONIEC SPACERU
        if (e.target.closest('#stopWalkBtn')) {
            state.isWalking = false; 
            document.getElementById('stopWalkBtn').style.display = 'none'; 
            document.getElementById('startWalkBtn').style.display = 'inline-block'; 
            
            const statusInput = document.getElementById('statusInput');
            if (statusInput) {
                statusInput.style.display = 'inline-block';
                statusInput.value = "";
            }

            const liveStats = document.getElementById('walk-live-stats');
            if (liveStats) liveStats.style.display = 'none';

            // 🔥 ZMIANA KOLEJNOŚCI ZGODNIE Z AUDYTEM:
            // Najpierw bezpiecznie zatrzymujemy tracker i zapisujemy HISTORIĘ spaceru
            await stopWalkTracker();
            
            // Następnie usuwamy aktywny spacer z mapy u innych użytkowników
            if (state.user) {
                await stopWalkInDb(state.user.uid); 
            }

            window.Waggle.showToast("Spacer zakończony! 🏁");
        }
        
        // POGODA
        if (e.target.closest('#weatherWidgetBtn')) {
            document.getElementById('weather-modal').style.display = 'flex';
        }
    });
}

// 🔥 NASŁUCHIWANIE ZAKOŃCZENIA SPACERU (Aktualizacja bez F5)
window.addEventListener('WAGGLE_WALK_COMPLETED', (e) => {
    if (state.profile) {
        // 1. Aktualizacja statystyk u góry (liczniki)
        state.profile.walkCount = (state.profile.walkCount || 0) + 1;
        state.profile.totalDistance = (Number(state.profile.totalDistance) || 0) + e.detail.distanceKm;
        updateStatsUI();

        // 2. Podmiana widżetu OSTATNIO na piękny kafel ze spacerem
        const recentBox = document.getElementById('recent-activity-box');
        if (recentBox) {
            // Nadpisujemy stare, zielone, przerywane style na nowe
            recentBox.style.background = 'white';
            recentBox.style.border = '1px solid #e1e8ed';
            recentBox.style.display = 'flex';
            recentBox.style.alignItems = 'center';
            recentBox.style.justifyContent = 'space-between';
            recentBox.style.padding = '16px';
            recentBox.style.boxShadow = '0 5px 15px rgba(0,0,0,0.03)';
            
            // Wrzucamy nową zawartość
            recentBox.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 24px; background: #f8f9fa; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">🐕</div>
                    <div style="text-align: left;">
                        <div style="font-weight: 900; color: var(--waggle-dark); font-size: 15px; margin-bottom: 2px;">Spacer</div>
                        <div style="color: var(--text-muted); font-size: 13px; font-weight: 700;">${e.detail.distanceKm.toFixed(2)} km • ${e.detail.durationMinutes} min</div>
                    </div>
                </div>
                <div style="color: var(--text-muted); font-size: 12px; font-weight: 900; background: #f1f2f6; padding: 6px 12px; border-radius: 10px;">
                    ${e.detail.time}
                </div>
            `;
        }
    }
});
