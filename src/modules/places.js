// src/modules/places.js
import { db, auth, fb } from "../core/firebase.js";
import { mapManager } from './map/mapManager.js';
import { Logger } from '../core/logger.js'; // 🔥 Podpięty nasz Logger

window.Waggle = window.Waggle || {};
let allPlaces = [];
let userLat = 0;
let userLon = 0;
let currentFilter = 'all';

let favoritePlacesIds = JSON.parse(localStorage.getItem('waggle_fav_places') || '[]');

let currentPlaceCommentsUnsubscribe = null;
let currentPlaceId = null;

export function initPlacesEngine() {
    Logger.info('PlacesEngine', 'Inicjalizacja modułu miejsc...');
    const container = document.getElementById('places-list-container');
    if (container) container.innerHTML = '<div style="text-align: center; color: var(--text-muted); font-size: 13px; margin-top: 40px; font-weight: 700;">Szukam spacerowych miejsc w Twojej okolicy... 🐕⏳</div>';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLat = pos.coords.latitude;
                userLon = pos.coords.longitude;
                fetchPlacesFromOSM(userLat, userLon);
            },
            (err) => {
                Logger.error('PlacesEngine', 'Błąd geolokalizacji:', err);
                if (container) container.innerHTML = '<div style="text-align: center; color: var(--danger); font-size: 13px; margin-top: 40px; font-weight: 700;">Brak dostępu do lokalizacji. Włącz GPS! 🛰️</div>';
            },
            { enableHighAccuracy: true }
        );
    }

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            if (view !== 'local' && window.Waggle.tempPlaceMarker && mapManager.map) {
                mapManager.map.removeLayer(window.Waggle.tempPlaceMarker);
                window.Waggle.tempPlaceMarker = null;
            }
        });
    });

    window.Waggle.filterPlaces = (category, btnElement) => {
        currentFilter = category;
        
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

    window.Waggle.toggleFavoritePlace = (placeId, event) => {
        if (event) event.stopPropagation();
        if (favoritePlacesIds.includes(placeId)) favoritePlacesIds = favoritePlacesIds.filter(id => id !== placeId);
        else favoritePlacesIds.push(placeId);
        
        localStorage.setItem('waggle_fav_places', JSON.stringify(favoritePlacesIds));
        const place = allPlaces.find(p => p.id === placeId);
        if (place) place.isFavorite = favoritePlacesIds.includes(placeId);
        applyCurrentFilter();
    };

    // 🔥 Naprawiony adres Google Maps
    window.Waggle.openGoogleMaps = (lat, lon, event) => {
        if (event) event.stopPropagation();
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`, '_blank');
    };

    window.Waggle.showPlaceOnMap = (lat, lon, name, category, event) => {
        if (event) event.stopPropagation();
        if (!mapManager.map) return;
        
        if (window.Waggle.tempPlaceMarker) mapManager.map.removeLayer(window.Waggle.tempPlaceMarker);
        
        const icons = { park: '🌳', dogpark: '🐕', forest: '🌲', water: '💧', path: '🚶' };
        const markerHtml = `<div style="font-size: 32px; filter: drop-shadow(0 4px 8px rgba(52, 172, 224, 0.6)); transform: scale(1.1);">${icons[category] || '📍'}</div>`;
        const customIcon = window.L.divIcon({ html: markerHtml, className: 'custom-map-icon', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -35] });
        
        window.Waggle.tempPlaceMarker = window.L.marker([lat, lon], { icon: customIcon })
            .addTo(mapManager.map)
            .bindPopup(`<div style="text-align:center;"><b style="font-size:14px; color:var(--primary);">${name}</b><br><span style="font-size:10px; color:var(--text-muted);">Tymczasowy podgląd miejsca</span></div>`);
        
        mapManager.flyTo(lat, lon, 16);
        setTimeout(() => window.Waggle.tempPlaceMarker.openPopup(), 600);
        
        const mapTabBtn = document.querySelector('.bottom-nav [data-view="local"]');
        if (mapTabBtn) mapTabBtn.click();
    };

    window.Waggle.openPlaceDetails = (placeId, placeName, event) => {
        if (event) event.stopPropagation();
        currentPlaceId = placeId;
        document.getElementById('place-details-name').innerText = placeName;
        document.getElementById('place-details-modal').style.display = 'flex';

        const commentsList = document.getElementById('place-comments-list');
        commentsList.innerHTML = '<div style="text-align:center; font-size:12px; color:var(--text-muted); margin-top:20px; font-weight: 700;">Ładowanie opinii... ⏳</div>';

        if (currentPlaceCommentsUnsubscribe) currentPlaceCommentsUnsubscribe();

        currentPlaceCommentsUnsubscribe = db.collection('place_reviews').doc(placeId).collection('messages')
            .orderBy('timestamp', 'asc')
            .onSnapshot(snapshot => {
                if (snapshot.empty) {
                    commentsList.innerHTML = `
                        <div style="text-align:center; margin-top: 40px;">
                            <div style="font-size: 40px; margin-bottom: 10px;">🏕️</div>
                            <div style="font-size:13px; color:var(--text-color); font-weight: 800; margin-bottom: 5px;">Brak opinii o tym miejscu.</div>
                            <div style="font-size:11px; color:var(--text-muted); font-weight: 600;">Bądź pierwszy! Naciąłeś się na krzaki? Ostrzeż innych!</div>
                        </div>`;
                    return;
                }

                let html = '';
                snapshot.forEach(doc => {
                    const msg = doc.data();
                    const isMe = auth.currentUser && msg.authorId === auth.currentUser.uid;
                    const timeStr = msg.timestamp ? msg.timestamp.toDate().toLocaleDateString('pl-PL', {day:'numeric', month:'short'}) : 'Teraz';
                    
                    html += `
                    <div style="background: white; padding: 12px 15px; border-radius: 16px; border: 1px solid var(--border-color); margin-bottom: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                        <div style="display:flex; justify-content:space-between; align-items: center; margin-bottom:8px;">
                            <b style="font-size:12px; color:${isMe ? 'var(--primary)' : 'var(--text-color)'};">${msg.authorName}</b>
                            <span style="font-size:10px; color:var(--text-muted); font-weight: 700;">${timeStr}</span>
                        </div>
                        <div style="font-size:13px; color:var(--text-color); font-weight: 600; line-height:1.5;">${msg.text}</div>
                    </div>`;
                });
                commentsList.innerHTML = html;
                setTimeout(() => { commentsList.scrollTop = commentsList.scrollHeight; }, 100);
            });
    };

    const postBtn = document.getElementById('post-place-comment-btn');
    const inputField = document.getElementById('place-comment-input');
    
    if (postBtn && inputField) {
        const postAction = async () => {
            if (!currentPlaceId) return;
            const text = inputField.value.trim();
            if (!text) return;

            const userName = localStorage.getItem('userName') || (auth.currentUser ? auth.currentUser.email.split('@')[0] : "Opiekun");
            const uid = auth.currentUser ? auth.currentUser.uid : 'anonim';

            inputField.value = '';
            try {
                await db.collection('place_reviews').doc(currentPlaceId).collection('messages').add({
                    text: text,
                    authorId: uid,
                    authorName: userName,
                    timestamp: fb.firestore.FieldValue.serverTimestamp()
                });
            } catch (e) {
                Logger.error('PlacesEngine', 'Błąd dodawania komentarza:', e);
                alert("Wystąpił błąd podczas dodawania opinii.");
            }
        };
        postBtn.onclick = postAction;
        inputField.onkeypress = (e) => { if (e.key === 'Enter') postAction(); };
    }
}

function applyCurrentFilter() {
    if (currentFilter === 'all') renderPlacesList(allPlaces);
    else if (currentFilter === 'favorites') renderPlacesList(allPlaces.filter(p => p.isFavorite));
    else renderPlacesList(allPlaces.filter(p => p.category === currentFilter));
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
        if (!response.ok) throw new Error(`OSM Error: ${response.status}`);
        
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
                distance: parseFloat(dist),
                lat: placeLat,
                lon: placeLon,
                isFavorite: favoritePlacesIds.includes(el.id.toString())
            };
        }).filter(Boolean);

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
        Logger.warn('PlacesEngine', 'Nie udało się pobrać danych z OSM (może chwilowy brak sieci?):', e.message);
        const container = document.getElementById('places-list-container');
        if (container) container.innerHTML = '<div style="text-align:center; color:var(--text-muted); font-size:12px; margin-top:20px;">Brak danych o miejscach w okolicy. Spróbuj później! 🐾</div>';
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
        const starColor = place.isFavorite ? 'var(--gold, #f1c40f)' : 'var(--text-muted)';
        return `
        <div style="background: white; border-radius: 16px; padding: 12px; border: 1px solid var(--border-color); box-shadow: 0 2px 8px rgba(0,0,0,0.02); display: flex; gap: 12px; align-items: center;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: var(--bg-color); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; box-shadow: inset 0 0 5px rgba(0,0,0,0.05);">
                ${icons[place.category] || '📍'}
            </div>
            <div style="flex-grow: 1; overflow: hidden; display: flex; flex-direction: column; justify-content: center;">
                <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 900; color: var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${place.name}</h3>
                <div style="font-size: 11px; font-weight: 800; color: var(--primary);">${place.distance} km stąd</div>
            </div>
            <div style="display: flex; gap: 6px; flex-shrink: 0;">
                <button onclick="window.Waggle.openPlaceDetails('${place.id}', '${place.name.replace(/'/g, "\\'")}', event)" style="width: 36px; height: 36px; border-radius: 10px; background: var(--bg-color); border: 1px solid var(--border-color); color: var(--text-color); display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; transition: 0.2s;" title="Sprawdź opinie">💬</button>
                <button onclick="window.Waggle.openGoogleMaps(${place.lat}, ${place.lon}, event)" style="width: 36px; height: 36px; border-radius: 10px; background: var(--bg-color); border: 1px solid var(--border-color); color: var(--text-color); display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; transition: 0.2s;" title="Nawiguj Google Maps">🗺️</button>
                <button onclick="window.Waggle.showPlaceOnMap(${place.lat}, ${place.lon}, '${place.name.replace(/'/g, "\\'")}', '${place.category}', event)" style="width: 36px; height: 36px; border-radius: 10px; background: var(--bg-color); border: 1px solid var(--border-color); color: var(--text-color); display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; transition: 0.2s;" title="Pokaż na mapie">🧭</button>
                <button onclick="window.Waggle.toggleFavoritePlace('${place.id}', event)" style="width: 36px; height: 36px; border-radius: 10px; background: var(--bg-color); border: 1px solid var(--border-color); color: ${starColor}; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'" title="Ulubione">★</button>
            </div>
        </div>
        `;
    }).join('');
}
