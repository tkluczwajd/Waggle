// src/ui/walkUiListeners.js
import { appState as state } from '../core/state.js';
import { mapManager } from '../modules/map/mapManager.js';
import { startWalkInDb, stopWalkInDb } from '../services/walkService.js'; // 🔥 Używamy w końcu gotowego serwisu!

export function initWalkUi() {
    document.addEventListener('click', (e) => {
        // LOKALIZACJA
        if (e.target.closest('#centerBtn')) { 
            if (state.location.lat && state.location.lng) { 
                mapManager.flyTo(state.location.lat, state.location.lng, 15); 
                window.Waggle.showToast("Zlokalizowano! 📍"); 
            } 
        }
        
        // START SPACERU
        if (e.target.closest('#startWalkBtn')) {
            // 🔥 1. Przechwytujemy wpisany tekst zanim schowamy pole!
            const statusInput = document.getElementById('statusInput');
            const statusText = statusInput ? statusInput.value.trim() : "";

            state.isWalking = true; 
            document.getElementById('startWalkBtn').style.display = 'none'; 
            document.getElementById('stopWalkBtn').style.display = 'inline-block'; 
            if (statusInput) statusInput.style.display = 'none';

            // 🔥 2. Kompletny ładunek danych wysyłany do bazy
            const payload = {
                uid: state.user.uid,
                name: state.profile?.name || "Piesek",
                avatar: state.profile?.avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150",
                lat: state.location.lat,
                lng: state.location.lng,
                timestamp: Date.now(),
                statusText: statusText // Tego nam wcześniej brakowało w bazie
            };

            // Przekazujemy ładunek do czystego serwisu
            startWalkInDb(state.user.uid, payload);
            window.Waggle.showToast("Spacer rozpoczęty! 🐾");
        }
        
        // KONIEC SPACERU
        if (e.target.closest('#stopWalkBtn')) {
            state.isWalking = false; 
            document.getElementById('stopWalkBtn').style.display = 'none'; 
            document.getElementById('startWalkBtn').style.display = 'inline-block'; 
            
            // Przywracamy i czyścimy pole tekstowe na wypadek kolejnego spaceru
            const statusInput = document.getElementById('statusInput');
            if (statusInput) {
                statusInput.style.display = 'inline-block';
                statusInput.value = "";
            }

            if (state.user) stopWalkInDb(state.user.uid); 
            window.Waggle.showToast("Spacer zakończony! 🏁");
        }
        
        // POGODA
        if (e.target.closest('#weatherWidgetBtn')) {
            document.getElementById('weather-modal').style.display = 'flex';
        }
    });
}
