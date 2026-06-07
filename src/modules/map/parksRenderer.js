import { mapManager } from './mapManager.js';

// Helper: zamienia dystans na czytelny format
function formatDistance(distKm) {
    if (distKm < 1) return Math.round(distKm * 1000) + ' m';
    return distKm.toFixed(1).replace('.', ',') + ' km';
}

const typeConfig = {
    'dogpark': { icon: '🐕', label: 'Wybieg dla psów' },
    'forest': { icon: '🌲', label: 'Las' },
    'park': { icon: '🌳', label: 'Park' },
    'walk': { icon: '🚶', label: 'Teren spacerowy' }
};

export function renderParksOnMap(places) {
    mapManager.clearLayer('parks');
    const L = window.L;
    if (!L) return;

    places.forEach(place => {
        const config = typeConfig[place.type] || typeConfig['walk'];
        const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

        // 🔥 Dodany przycisk Ulubione (na razie wywołuje tylko wizualny efekt/toast)
        const popupContent = `
            <div style="font-family: 'Inter', sans-serif; padding: 5px; min-width: 170px; text-align: left;">
                <b style="font-size: 15px; color: var(--text-color); display: block; margin-bottom: 2px;">${place.name}</b>
                <span style="font-size: 12px; color: var(--text-muted); font-weight: 700;">${config.icon} ${config.label}</span>
                <div style="margin-top: 5px; font-size: 13px; font-weight: 900; color: var(--primary);">📍 ${formatDistance(place.distance)}</div>
                
                <div style="display: flex; gap: 8px; margin-top: 12px;">
                    <button class="btn-main" style="padding: 8px; font-size: 12px; border-radius: 8px; flex: 1;" 
                            onclick="window.open('${mapsLink}', '_blank')">
                        🧭 Nawiguj
                    </button>
                    <button class="btn-outline" style="padding: 8px; font-size: 16px; border-radius: 8px; flex-shrink: 0; border-color: var(--gold); color: var(--gold);" 
                            onclick="window.Waggle.showToast('Zapisano w Ulubionych! ⭐')" title="Dodaj do ulubionych">
                        ⭐
                    </button>
                </div>
            </div>
        `;

        const iconHtml = `<div style="font-size: ${place.type === 'dogpark' ? '32px' : '26px'}; line-height: 1; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3)); text-align: center;">${config.icon}</div>`;
        
        const icon = L.divIcon({
            className: 'waggle-park-marker',
            html: iconHtml,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -15]
        });

        const marker = L.marker([place.lat, place.lng], { icon });
        marker.bindPopup(popupContent);
        mapManager.addMarkerToLayer('parks', marker);
    });
}

export function renderPlacesList(places, containerId = 'places-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (places.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 13px; margin-top: 30px; font-weight: 700;">Brak miejsc w wybranej kategorii 😔</p>';
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
    
    places.forEach(place => {
        const config = typeConfig[place.type] || typeConfig['walk'];
        const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
        
        // 🔥 Dodana gwiazdka do widoku listy
        html += `
            <div class="place-card" style="background: white; border-radius: 16px; padding: 15px; display: flex; align-items: center; gap: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.04); border: 1px solid var(--border-color);">
                <div style="font-size: 32px; flex-shrink: 0; background: var(--bg-color); width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 12px;">
                    ${config.icon}
                </div>
                <div style="flex: 1; text-align: left; cursor: pointer;" onclick="window.open('${mapsLink}', '_blank')">
                    <h4 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 800; color: var(--text-color);">${place.name}</h4>
                    <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-muted); font-weight: 600;">
                        <span>${config.label}</span>
                        <span>•</span>
                        <span style="color: var(--primary); font-weight: 800;">📍 ${formatDistance(place.distance)}</span>
                    </div>
                </div>
                <button style="background: none; border: none; font-size: 22px; color: var(--text-muted); cursor: pointer; padding: 5px; transition: 0.2s;" 
                        onclick="window.Waggle.showToast('Zapisano w Ulubionych! ⭐'); this.style.color='var(--gold)';">
                    ⭐
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}
