import { mapManager } from './mapManager.js';

export function renderParksOnMap(places) {
    mapManager.clearLayer('parks');

    const L = window.L;
    if (!L) return;

    places.forEach(place => {
        const nameLower = (place.name || "").toLowerCase();
        
        let typeLabel = 'Park / Teren zielony';
        
        if (place.isDogPark) {
            typeLabel = 'Wybieg dla psów 🐕';
        } else if (nameLower.includes('las') || nameLower.includes('lasek') || place.type === 'forest') {
            typeLabel = 'Las / Kompleks leśny 🌲';
        }

        const popupContent = `
            <div style="font-family: 'Nunito', sans-serif; padding: 5px; min-width: 150px;">
                <b style="font-size: 14px; color: var(--text-color); display: block; margin-bottom: 4px;">${place.name}</b>
                <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${typeLabel}</span>
                <br>
                <button class="btn-outline" style="padding: 4px 8px; font-size: 11px; margin-top: 8px; width: 100%; height: auto;" 
                        onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}', '_blank')">
                    Nawiguj 🧭
                </button>
            </div>
        `;

        // 🔥 Czysta pinezka - zero błędów, najwyższa wydajność
        const emoji = place.isDogPark ? '🏞️' : (place.type === 'forest' ? '🌲' : '🌳');
        
        const iconHtml = `<div style="font-size: 26px; line-height: 1; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3)); text-align: center;">${emoji}</div>`;
        const icon = L.divIcon({
            className: 'waggle-park-marker',
            html: iconHtml,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -10]
        });

        const marker = L.marker([place.lat, place.lng], { icon });
        marker.bindPopup(popupContent);
        mapManager.addMarkerToLayer('parks', marker);
    });

    console.log(`🌲 Map Health: Wyrenderowano znaczniki na mapie.`);
}
