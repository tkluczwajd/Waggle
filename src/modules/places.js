// src/modules/places.js
import { mapManager } from './map/mapManager.js'; 

window.Waggle = window.Waggle || {};
let allPlaces = [];
let userLat = 0;
let userLon = 0;
let currentFilter = 'all';

// Ładujemy ulubione z pamięci telefonu
let favoritePlacesIds = JSON.parse(localStorage.getItem('waggle_fav_places') || '[]');

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

    // Filtrowanie
    window.Waggle.filterPlaces = (category, btnElement) => {
        currentFilter = category; // Zapisujemy obecny filtr
        
        if (btnElement) {
            document.querySelectorAll('.place-filter-btn').forEach(btn => {
                btn.style.background = 'white';
                btn.style.color = btn.innerText.includes('Ulubione') ? 'var(--gold, #f1c40f)' : 'var(--text-color)';
                btn.style.border = '1px solid var(--border-color)';
                btn.style.boxShadow = 'none';
            });
            btnElement.style.background = 'var(--secondary)';
            btnElement.style.color = 'white';
            btnElement.style.border = 'none';
            btnElement.style.boxShadow = '0 4px 10px rgba(52,172,224,0.3)';
        }

        applyCurrentFilter();
    };

    // Dodawanie/Usuwanie z Ulubionych
    window.Waggle.toggleFavoritePlace = (placeId, event) => {
        if (event) event.stopPropagation(); // Zapobiega kliknięciu w tło
        
        if (favoritePlacesIds.includes(placeId)) {
            favoritePlacesIds = favoritePlacesIds.filter(id => id !== placeId);
        } else {
            favoritePlacesIds.push(placeId);
        }
        
        localStorage.setItem('waggle_fav_places', JSON.stringify(favoritePlacesIds));
        
        // Aktualizujemy status w głównej tablicy
        const place = allPlaces.find(p => p.id === placeId);
        if(place) place.isFavorite = favoritePlacesIds.includes(placeId);
        
        // Odświeżamy widok
        applyCurrentFilter();
    };

    // Nawigacja Google Maps
    window.Waggle.openGoogleMaps = (lat, lon, event) => {
        if (event) event.stopPropagation();
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
    };

    // Pokazywanie na naszej Mapie Waggle
    window.Waggle.showPlaceOnMap = (lat, lon, name, category, event) => {
        if (event) event.stopPropagation();
        if (!mapManager.map) return;
        
        mapManager.clearLayer('parks'); 
        
        const icons = { park: '🌳', dogpark: '🐕', forest: '🌲', water: '💧', path: '🚶' };
        const markerHtml = `<div style="font-size: 24px; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.3));">${icons[category] || '📍'}</div>`;
        const customIcon = window.L.divIcon({ html: markerHtml, className: 'custom-map-icon', iconSize: [30, 30], iconAnchor: [15, 30] });
        
        const marker = window.L.marker([lat, lon], { icon: customIcon }).bindPopup(`<b>${name}</b>`);
        mapManager.addMarkerToLayer('parks', marker);
        mapManager.flyTo(lat, lon, 16); 
        
        // 🔥 AUTOMATYCZNE PRZEŁĄCZENIE ZAKŁADKI NA MAPĘ
        const mapTabBtn = document.querySelector('.bottom-nav [data-view="local"]');
        if (mapTabBtn) mapTabBtn.click();
    };
}

function applyCurrentFilter() {
    if (currentFilter === 'all') {
        renderPlacesList(allPlaces);
    } else if (currentFilter === 'favorites') {
        renderPlacesList(allPlaces.filter(p => p.isFavorite));
    } else {
        renderPlacesList(allPlaces.filter(p => p.category === currentFilter));
    }
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
    const query = `
    [out:json][timeout:15];
    (
      nwr["leisure"="dog_park"](around:5000,${lat},${lon});
      nwr["leisure"="park"](around:5000,${lat},${lon});
      nwr["natural"="wood"](around:5000,${lat},${lon});
      nwr["natural"="water"](around:5000,${lat},${lon});
    );
    out center;`;

    try {
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        allPlaces = data.elements.map(el => {
            const placeLat = el.lat || (el.center && el.center.lat);
            const placeLon = el.lon || (el.center && el.center.lon);
            if (!placeLat || !placeLon) return null;

            const dist = getDistanceFromLatLonInKm(lat, lon, placeLat, placeLon);
            let cat = 'park';
            if (el.tags.leisure === 'dog_park') cat = 'dogpark';
            else if (el.tags.natural === 'wood') cat = 'forest';
            else if (el.tags.natural === 'water') cat = 'water';

            let name = el.tags.name;
            if (!name) {
                if (cat === 'water') name = 'Staw / Jezioro';
                else if (cat === 'forest') name = 'Las / Teren zalesiony';
                else if (cat === 'dogpark') name = 'Wybieg dla psów';
                else name = 'Teren zielony';
            }

            return {
                id: el.id.toString(),
                name: name,
                category: cat,
                address: "Odkryte przez OpenStreetMap",
                distance: parseFloat(dist),
                lat: placeLat,
                lon: placeLon,
                isFavorite: favoritePlacesIds.includes(el.id.toString())
            };
        }).filter(Boolean);

        // Usuwanie duplikatów dla anonimowych lasów/terenów
        const uniquePlaces = [];
        const seenNames = new Set();
        for (const place of allPlaces) {
            if (!place.name.includes("Teren") && !place.name.includes("Las") && !place.name.includes("Staw")) {
                if (!seenNames.has(place.name)) {
                    seenNames.add(place.name);
                    uniquePlaces.push(place);
                }
            } else {
                uniquePlaces.push(place);
            }
        }

        allPlaces = uniquePlaces;
        allPlaces.sort((a, b) => a.distance - b.distance);
        applyCurrentFilter();
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
                <h4 style="margin: 0 0 5px 0; color: var(--text-color);">Brak miejsc</h4>
                <p style="margin: 0; font-size: 12px; color: var(--text-muted);">Zmień filtry lub dodaj nowe miejsce!</p>
            </div>
        `;
        return;
    }

    const icons = { park: '🌳', dogpark: '🐕', forest: '🌲', water: '💧', path: '🚶' };

    container.innerHTML = places.map(place => {
        const starColor = place.isFavorite ? 'var(--gold, #f1c40f)' : '#dfe6e9';
        
        return `
        <div style="background: white; border-radius: 20px; padding: 15px; border: 1px solid var(--border-color); box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 10px;">
            
            <div style="display: flex; gap: 15px; align-items: center;">
                <div style="width: 50px; height: 50px; border-radius: 14px; background: var(--bg-color); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; box-shadow: inset 0 0 10px rgba(0,0,0,0.05);">
                    ${icons[place.category] || '📍'}
                </div>

                <div style="flex-grow: 1; overflow: hidden;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <h3 style="margin: 0; font-size: 15px; font-weight: 900; color: var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${place.name}</h3>
                        <button onclick="window.Waggle.toggleFavoritePlace('${place.id}', event)" style="background: none; border: none; font-size: 20px; padding: 0; cursor: pointer; color: ${starColor}; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">★</button>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 3px;">
                        <span style="font-size: 11px; font-weight: 900; color: var(--primary); background: rgba(52, 172, 224, 0.1); padding: 3px 8px; border-radius: 8px;">${place.distance} km stąd</span>
                    </div>
                </div>
            </div>

            <div style="display: flex; gap: 8px; border-top: 1px dashed var(--border-color); padding-top: 10px; margin-top: 2px;">
                <button onclick="window.Waggle.openGoogleMaps(${place.lat}, ${place.lon}, event)" style="flex: 1; background: var(--bg-color); color: var(--text-color); border: 1px solid var(--border-color); padding: 8px; border-radius: 10px; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">🗺️ Nawiguj</button>
                <button onclick="window.Waggle.showPlaceOnMap(${place.lat}, ${place.lon}, '${place.name.replace(/'/g, "\\'")}', '${place.category}', event)" style="flex: 1; background: var(--bg-color); color: var(--text-color); border: 1px solid var(--border-color); padding: 8px; border-radius: 10px; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">🧭 Pokaż na mapie</button>
            </div>
            
        </div>
        `;
    }).join('');
}
