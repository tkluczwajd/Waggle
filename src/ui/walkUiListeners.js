// src/ui/walkUiListeners.js
import { appState as state } from '../core/state.js';
import { mapManager } from '../modules/map/mapManager.js';
import { startWalkInDb, stopWalkInDb } from '../services/walkService.js'; 
import { startWalkTracker, stopWalkTracker } from '../modules/walkTracker.js';

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
