// src/modules/places.js
import { mapManager } from './map/mapManager.js'; 

window.Waggle = window.Waggle || {};
let allPlaces = [];
let userLat = 0;
let userLon = 0;

export function initPlacesEngine() {
    const container = document.getElementById('places-list-container');
    if(container) container.innerHTML = '<div style="text-align: center; color: var(--text-muted); font-size: 13px; margin-top: 40px; font-weight: 700;">Szukam spacerowych miejsc w Twojej okolicy... 🐕⏳</div>';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLat = pos.coords.latitude;
                userLon = pos.coords.longitude;
                fetchPlacesFromOSM(userLat, userLon);
            },
            (err) => {
                console.error("Błąd geolokalizacji:", err);
                if(container) container.innerHTML = '<div style="text-align: center; color: var(--danger); font-size: 13px; margin-top: 40px; font-weight: 700;">Brak dostępu do lokalizacji. Włącz GPS! 🛰️</div>';
            },
            { enableHighAccuracy: true }
        );
    }

    window.Waggle.filterPlaces = (category, btnElement) => {
        document.querySelectorAll('.place-filter-btn').forEach(btn => {
            btn.style.background = 'white';
            btn.style.color = btn.innerText.includes('Ulubione') ? 'var(--gold, #f1c40f)' : 'var(--text-color)';
            btn.style.border = '1px solid var(--border-color)';
            btn.style.boxShadow = 'none';
        });
        
        if (btnElement) {
            btnElement.style.background = 'var(--secondary)';
            btnElement.style.color = 'white';
            btnElement.style.border = 'none';
            btnElement.style.boxShadow = '0 4px 10px rgba(52,172,224,0.3)';
        }

        if (category === 'all') renderPlacesList(allPlaces);
        else if (category === 'favorites') renderPlacesList(allPlaces.filter(p => p.isFavorite));
        else renderPlacesList(allPlaces.filter(p => p.category === category));
    };

    window.Waggle.showPlaceOnMap = (lat, lon, name, category) => {
        if (!mapManager.map) return;
        mapManager.clearLayer('parks'); 
        
        const icons = { park: '🌳', dogpark: '🐕', forest: '🌲', water: '💧', path: '🚶' };
        const markerHtml = `<div style="font-size: 24px; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.3));">${icons[category] || '📍'}</div>`;
        const customIcon = window.L.divIcon({ html: markerHtml, className: 'custom-map-icon', iconSize: [30, 30], iconAnchor: [15, 30] });
        
        const marker = window.L.marker([lat, lon], { icon: customIcon }).bindPopup(`<b>${name}</b>`);
        mapManager.addMarkerToLayer('parks', marker);
        mapManager.flyTo(lat, lon, 16); 

        if (window.Waggle && window.Waggle.showToast) window.Waggle.showToast("📍 Przejdź do zakładki Mapa!");
    };
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
}

async function fetchPlacesFromOSM(lat, lon) {
    // Zapytanie o: wybiegi, parki, lasy, wodę i ścieżki!
    const query = `
    [out:json];
    (
      node["leisure"="dog_park"](around:5000,${lat},${lon});
      node["leisure"="park"](around:5000,${lat},${lon});
      node["natural"="wood"](around:5000,${lat},${lon});
      node["natural"="water"](around:5000,${lat},${lon});
      node["highway"="path"](around:5000,${lat},${lon});
    );
    out;`;

    try {
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        allPlaces = data.elements.map(el => {
            const dist = getDistanceFromLatLonInKm(lat, lon, el.lat, el.lon);
            let cat = 'park';
            if (el.tags.leisure === 'dog_park') cat = 'dogpark';
            else if (el.tags.natural === 'wood') cat = 'forest';
            else if (el.tags.natural === 'water') cat = 'water';
            else if (el.tags.highway === 'path') cat = 'path';

            return {
                id: el.id,
                name: el.tags.name || (cat === 'water' ? 'Staw / Rzeka' : (cat === 'path' ? 'Trasa spacerowa' : 'Teren zielony')),
                category: cat,
                address: "Odkryte przez OpenStreetMap",
                distance: parseFloat(dist),
                lat: el.lat,
                lon: el.lon,
                isFavorite: false
            };
        });

        allPlaces.sort((a, b) => a.distance - b.distance);
        renderPlacesList(allPlaces);
    } catch (e) {
        console.error("Błąd OSM:", e);
    }
}

function renderPlacesList(places) {
    const container = document.getElementById('places-list-container');
    if (!container) return;

    if (places.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; background: white; border-radius: 20px; border: 1px dashed var(--border-color);">
                <div style="font-size: 40px; margin-bottom: 10px;">🏝️</div>
                <h4 style="margin: 0 0 5px 0; color: var(--text-color);">Brak miejsc w tej okolicy</h4>
            </div>
        `;
        return;
    }

    const icons = { park: '🌳', dogpark: '🐕', forest: '🌲', water: '💧', path: '🚶' };

    container.innerHTML = places.map(place => {
        return `
        <div style="background: white; border-radius: 20px; padding: 15px; border: 1px solid var(--border-color); box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; gap: 15px; align-items: center; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
            
            <div style="width: 50px; height: 50px; border-radius: 14px; background: var(--bg-color); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; box-shadow: inset 0 0 10px rgba(0,0,0,0.05);">
                ${icons[place.category] || '📍'}
            </div>

            <div style="flex-grow: 1; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h3 style="margin: 0; font-size: 15px; font-weight: 900; color: var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${place.name}</h3>
                </div>
                <p style="margin: 3px 0 0 0; font-size: 11px; color: var(--text-muted); font-weight: 600;">${place.address}</p>
            </div>

            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                <div style="font-size: 11px; font-weight: 900; color: var(--primary); background: rgba(52, 172, 224, 0.1); padding: 4px 8px; border-radius: 8px;">${place.distance} km</div>
                <button onclick="window.Waggle.showPlaceOnMap(${place.lat}, ${place.lon}, '${place.name.replace(/'/g, "\\'")}', '${place.category}')" style="background: var(--bg-color); border: none; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--primary); font-size: 14px; transition: background 0.2s;" onmouseover="this.style.background='rgba(52, 172, 224, 0.1)'" onmouseout="this.style.background='var(--bg-color)'" title="Pokaż na mapie">
                    🧭
                </button>
            </div>
        </div>
        `;
    }).join('');
}
