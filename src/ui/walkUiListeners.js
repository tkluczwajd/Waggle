// src/ui/walkUiListeners.js
import { appState as state } from '../core/state.js';
import { mapManager } from '../modules/map/mapManager.js';
import { startWalkInDb, stopWalkInDb } from '../services/walkService.js'; 
import { startWalkTracker, stopWalkTracker } from '../modules/walkTracker.js';
import { updateStatsUI } from './uiHelpers.js';
// 🔥 NOWOŚĆ: Importujemy bazę danych, żeby móc pobrać historię spacerów!
import { db } from '../core/firebase.js';

export function initWalkUi() {
    document.addEventListener('click', async (e) => {
        
        // LOKALIZACJA (Guzik "Celownika" na mapie)
        if (e.target.closest('#centerBtn')) { 
            if (state.location.lat && state.location.lng) { 
                mapManager.flyTo(state.location.lat, state.location.lng, 15); 
                window.Waggle.showToast("Zlokalizowano! 📍"); 
            } 
        }
        
        // 🔥 ROZWIĄZANIE PROBLEMU 1: Kliknięcie w zakładkę "Mapa" w dolnym menu
        const mapTabBtn = e.target.closest('[data-view="local"]');
        if (mapTabBtn) {
            // Dajemy przeglądarce 300 milisekund, żeby zdążyła pokazać mapę na ekranie
            setTimeout(() => {
                // 1. Odświeżamy silnik mapy (naprawia "szare tło" po zmianie zakładki)
                if (state.map && state.map.instance) {
                    state.map.instance.invalidateSize(); 
                }
                // 2. Jeśli jesteśmy w trakcie spaceru - automatycznie centrujemy na GPS!
                if (state.isWalking && state.location.lat && state.location.lng) {
                    mapManager.flyTo(state.location.lat, state.location.lng, 17);
                }
            }, 300);
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

            await stopWalkTracker();
            
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

// NASŁUCHIWANIE ZAKOŃCZENIA SPACERU (Aktualizacja Kafelka Home)
window.addEventListener('WAGGLE_WALK_COMPLETED', (e) => {
    if (state.profile) {
        state.profile.walkCount = (state.profile.walkCount || 0) + 1;
        state.profile.totalDistance = (Number(state.profile.totalDistance) || 0) + e.detail.distanceKm;
        updateStatsUI();

        const recentBox = document.getElementById('recent-activity-box');
        if (recentBox) {
            recentBox.style.background = 'white';
            recentBox.style.border = '1px solid #e1e8ed';
            recentBox.style.display = 'flex';
            recentBox.style.alignItems = 'center';
            recentBox.style.justifyContent = 'space-between';
            recentBox.style.padding = '16px';
            recentBox.style.boxShadow = '0 5px 15px rgba(0,0,0,0.03)';
            
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

// 🔥 NOWOŚĆ: Dedykowana funkcja TYLKO do historii spacerów GPS
window.openWalkHistory = async () => {
    const modal = document.getElementById('walk-history-modal');
    const content = document.getElementById('walk-history-content');
    
    if (modal) modal.style.display = 'flex';
    if (content) content.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 12px; font-weight: 700; margin-top: 20px;">Ładowanie tras GPS... ⏳</p>';

    try {
        const uid = localStorage.getItem('activeDogId') || (state.user ? state.user.uid : null);
        if (!uid) return;

        // Pobieramy maksymalnie 20 ostatnich spacerów z Firebase
        const snap = await db.collection('walks')
            .where('dogId', '==', uid)
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();

        // Górny pasek ze statystykami łącznymi (Total)
        let html = `
            <div style="background: var(--primary); color: white; padding: 20px; border-radius: 16px; margin-bottom: 20px; text-align: center; box-shadow: 0 4px 15px rgba(255,82,82,0.3);">
                <div style="font-size: 11px; font-weight: 900; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Razem pokonaliście</div>
                <div style="font-size: 36px; font-weight: 900; margin: 5px 0;">${state.profile?.totalDistance ? Number(state.profile.totalDistance).toFixed(2) : "0.00"} <span style="font-size: 18px;">km</span></div>
                <div style="font-size: 13px; font-weight: 800; opacity: 0.9;">Podczas ${state.profile?.walkCount || 0} spacerów! 🐾</div>
            </div>
            <h4 style="margin: 0 0 12px 0; font-size: 15px; color: var(--text-color); font-weight: 900;">Zapisane trasy</h4>
        `;

        // Generowanie listy pojedynczych spacerów
        if (snap.empty) {
            html += `<div style="text-align:center; padding: 20px; color: var(--text-muted); font-weight: 800; font-size: 13px;">Brak zapisanych tras z GPS. Czas wyjść z domu! 🐕</div>`;
        } else {
            html += `<div style="display: flex; flex-direction: column; gap: 12px;">`;
            
            snap.forEach(doc => {
                const data = doc.data();
                const date = data.timestamp ? data.timestamp.toDate().toLocaleDateString('pl-PL') : "Brak daty";
                const dist = data.distanceKm ? data.distanceKm.toFixed(2) : "0.00";
                const dur = data.durationMinutes || 0;
                const speed = dur > 0 ? (data.distanceKm / (dur / 60)).toFixed(1) : "0.0";

                html += `
                    <div style="background: white; border: 1px solid var(--border-color); border-radius: 16px; padding: 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="font-size: 24px; background: rgba(52, 172, 224, 0.1); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">🗺️</div>
                            <div>
                                <div style="font-weight: 900; color: var(--text-color); font-size: 16px; margin-bottom: 2px;">${dist} km</div>
                                <div style="color: var(--text-muted); font-size: 12px; font-weight: 800;">⏱️ ${dur} min • ⚡ ${speed} km/h</div>
                            </div>
                        </div>
                        <div style="color: var(--text-muted); font-size: 11px; font-weight: 900; background: #f8f9fa; padding: 6px 10px; border-radius: 10px; border: 1px solid var(--border-color);">
                            ${date}
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }
        content.innerHTML = html;

    } catch (err) {
        console.error("Błąd ładowania historii:", err);
        content.innerHTML = '<p style="text-align: center; color: var(--danger); font-size: 13px; font-weight: 800;">Nie udało się załadować tras.</p>';
    }
};
