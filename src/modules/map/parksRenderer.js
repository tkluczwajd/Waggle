// src/modules/map/parksRenderer.js
import { mapManager } from './mapManager.js';

export function renderParksOnMap(places) {
    mapManager.clearLayer('parks');

    const L = window.L;
    if (!L) return;

    places.forEach(place => {
        const nameLower = (place.name || "").toLowerCase();
        
        let typeLabel = 'Park / Teren zielony';
        let fillColor = '#2ecc71'; 
        
        if (place.isDogPark) {
            typeLabel = 'Wybieg dla psów 🐕';
        } else if (nameLower.includes('las') || nameLower.includes('lasek') || place.type === 'forest') {
            typeLabel = 'Las / Kompleks leśny 🌲';
            fillColor = '#27ae60'; 
        }

        const popupContent = `
            <div style="font-family: 'Nunito', sans-serif; padding: 5px; min-width: 150px;">
                <b style="font-size: 14px; color: var(--text-color); display: block; margin-bottom: 4px;">${place.name}</b>
                <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${typeLabel}</span>
                <br>
                <button class="btn-outline" style="padding: 4px 8px; font-size: 11px; margin-top: 8px; width: 100%; height: auto;" 
                        onclick="window.open('https://www.google.com/maps/search/?api=1&query=$${place.lat},${place.lng}', '_blank')">
                    Nawiguj 🧭
                </button>
            </div>
        `;

        // HYBRYDOWA LOGIKA (OPCJA 3)
        
        if (!place.isDogPark && place.geometry) {
            
            const style = {
                color: fillColor, // Kolor obramowania
                weight: 2,        // Grubość obramowania
                fillColor: fillColor, 
                fillOpacity: 0.3  // Półprzezroczystość
            };

            let shape;

            if (place.isMultiPolygon) {
                // Relacje (lasy, duze parki)
                shape = L.multiPolygon(place.geometry, style);
            } else if (place.geometry.length > 2) {
                // closed ways
                shape = L.polygon(place.geometry, style);
            }

            if (shape) {
                shape.bindPopup(popupContent);
                mapManager.addMarkerToLayer('parks', shape);
            }
            
        } else {
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
        }
    });

    console.log(`🌲 Map Health: Wyrenderowano obiekty (Hybryda z MultiPolygon) na mapie.`);
}
