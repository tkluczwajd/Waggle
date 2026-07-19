// src/modules/map/parksRenderer.js
import { mapManager } from './mapManager.js';

function formatDistance(distKm) {
    if (distKm < 1) return Math.round(distKm * 1000) + ' m';
    return distKm.toFixed(1).replace('.', ',') + ' km';
}

const typeConfig = {
    'dogpark': { icon: '🐕', label: 'Wybieg dla psów', img: 'https://images.unsplash.com/photo-1596797882870-8c33dee144db?auto=format&fit=crop&w=300&q=80' },
    'forest': { icon: '🌲', label: 'Las', img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=300&q=80' },
    'park': { icon: '🌳', label: 'Park', img: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=300&q=80' },
    'walk': { icon: '🚶', label: 'Teren spacerowy', img: 'https://images.unsplash.com/photo-1517626154316-db322df72381?auto=format&fit=crop&w=300&q=80' }
};

export function renderParksOnMap(places, favIds = []) {
    mapManager.clearLayer('parks');
    const L = window.L;
    if (!L) return;

    places.forEach(place => {
        const config = typeConfig[place.type] || typeConfig['walk'];
        const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
        const isFav = favIds.includes(place.id);

        const starSvg = `
            <svg width="18" height="18" viewBox="0 0 24 24" 
                 fill="${isFav ? 'var(--gold)' : 'none'}" 
                 stroke="${isFav ? 'var(--gold)' : 'var(--text-muted)'}" 
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: 0.2s;">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
        `;

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
                    <button class="btn-outline" style="padding: 8px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-color: ${isFav ? 'var(--gold)' : 'var(--text-muted)'}; background: ${isFav ? 'rgba(255,177,66,0.1)' : 'transparent'};" 
                            onclick="window.Waggle.toggleFavoritePlace('${place.id}')" title="Ulubione">
                        ${starSvg}
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

export function renderPlacesList(places, favIds = [], containerId = 'places-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (places.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 13px; margin-top: 30px; font-weight: 700;">Brak miejsc do wyświetlenia 😔</p>';
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
    
    places.forEach(place => {
        const config = typeConfig[place.type] || typeConfig['walk'];
        const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
        const isFav = favIds.includes(place.id);
        
        const starSvg = `
            <svg width="22" height="22" viewBox="0 0 24 24" 
                 fill="${isFav ? 'var(--gold)' : 'none'}" 
                 stroke="${isFav ? 'var(--gold)' : 'var(--text-muted)'}" 
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: 0.2s;">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
        `;
        
        // 🔥 NOWOŚĆ: Miniaturki zdjęć dla uatrakcyjnienia miejscówki
        html += `
            <div class="place-card" style="background: white; border-radius: 16px; padding: 12px; display: flex; align-items: center; gap: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.04); border: 1px solid var(--border-color);">
                
                <div style="width: 65px; height: 65px; flex-shrink: 0; border-radius: 12px; overflow: hidden; position: relative; cursor: pointer;" onclick="window.open('${mapsLink}', '_blank')">
                    <img src="${config.img}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.6); color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px;">${config.icon}</div>
                </div>

                <div style="flex: 1; text-align: left; cursor: pointer;" onclick="window.open('${mapsLink}', '_blank')">
                    <h4 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 800; color: var(--text-color);">${place.name}</h4>
                    <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-muted); font-weight: 600;">
                        <span>${config.label}</span>
                        <span>•</span>
                        <span style="color: var(--primary); font-weight: 800;">📍 ${formatDistance(place.distance)}</span>
                    </div>
                </div>
                
                <button style="background: ${isFav ? 'rgba(255,177,66,0.1)' : 'var(--bg-color)'}; border: 1px solid ${isFav ? 'var(--gold)' : 'var(--border-color)'}; width: 44px; height: 44px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; flex-shrink: 0;" 
                        onclick="window.Waggle.toggleFavoritePlace('${place.id}')">
                    ${starSvg}
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}
