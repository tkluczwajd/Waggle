export function renderParksOnMap(places) {
    const L = window.L;
    import { mapManager } from './mapManager.js';
    mapManager.clearLayer('parks');
    
    places.forEach(place => {
        // Tu zaszła zmiana:
        const iconHtml = `<div style="background:${place.isDogPark ? '#4cd137' : '#00a8ff'}; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; border:2px solid white; box-shadow:var(--soft-shadow); font-size:16px;">${place.isDogPark ? '🏞️' : '🌳'}</div>`;
        
        const icon = L.divIcon({ className: '', html: iconHtml, iconSize: [30, 30] });
        const marker = L.marker([place.lat, place.lng], { icon });
        marker.bindPopup(`<b>${place.name}</b><br>${place.distance.toFixed(2)} km`);
        mapManager.addMarkerToLayer('parks', marker);
    });
}
