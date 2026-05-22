// src/modules/map/parksRenderer.js
import { mapManager } from './mapManager.js';

export function renderParksOnMap(places) {
    // 1. Czyszczenie starej warstwy parków przed narysowaniem nowych
    mapManager.clearLayer('parks');

    const L = window.L;
    if (!L) return;

    places.forEach(place => {
        const nameLower = (place.name || "").toLowerCase();
        
        // 2. Inteligentny dobór ikony na mapę
        let emoji = '🌳'; // Domyślnie zwykły park
        let typeLabel = 'Park / Teren zielony';

        if (place.isDogPark) {
            emoji = '🏞️';
            typeLabel = 'Wybieg dla psów 🐕';
        } else if (nameLower.includes('las') || nameLower.includes('lasek') || place.type === 'forest') {
            emoji = '🌲';
            typeLabel = 'Las / Kompleks leśny 🌲';
        }

        // 3. Tworzenie pancernej ikony HTML dla Leafleta
        const iconHtml = `<div style="font-size: 26px; line-height: 1; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3)); text-align: center;">${emoji}</div>`;
        
        const icon = L.divIcon({
            className: 'waggle-park-marker',
            html: iconHtml,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -10]
        });

        // 4. Tworzenie markera i przypisanie ładnego okienka Popup po kliknięciu
        const marker = L.marker([place.lat, place.lng], { icon });
        
        marker.bindPopup(`
            <div style="font-family: 'Nunito', sans-serif; padding: 5px; min-width: 150px;">
                <b style="font-size: 14px; color: var(--text-color); display: block; margin-bottom: 4px;">${place.name}</b>
                <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${typeLabel}</span>
                <br>
                <button class="btn-outline" style="padding: 4px 8px; font-size: 11px; margin-top: 8px; width: 100%; height: auto;" 
                        onclick="window.open('https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}', '_blank')">
                    Nawiguj 🧭
                </button>
            </div>
        `);

        // 5. Bezpieczne dodanie do dedykowanej warstwy
        mapManager.addMarkerToLayer('parks', marker);
    });

    console.log(`🌲 Map Health: Wyrenderowano ${places.length} zielonych punktów na mapie.`);
}
