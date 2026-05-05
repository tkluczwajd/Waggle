import { state, addListener } from '../core/state.js';
import { db } from '../core/firebase.js';
import { updateWalkLocation } from './walk.js';

let myMarker = null;
let dogMarkers = {}; // Cache dla markerów innych psów

export function initMap() {
    if (state.map) return;

    // Inicjalizacja Leaflet
    state.map = L.map('map', { zoomControl: false }).setView([52.2297, 21.0122], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(state.map);

    // Kiedy user przesuwa mapę ręcznie - przestajemy go śledzić (żeby mapa mu "nie uciekała")
    state.map.on('dragstart', () => { state.isFollowing = false; });

    // ŚLEDZENIE GPS
    navigator.geolocation.watchPosition(pos => {
        state.location.lat = pos.coords.latitude;
        state.location.lng = pos.coords.longitude;

        // Tworzenie / aktualizacja markera użtykownika
        if (!myMarker) {
            myMarker = L.circleMarker([state.location.lat, state.location.lng], { 
                radius: 10, color: '#fff', fillColor: '#34ace0', fillOpacity: 1, weight: 3 
            }).addTo(state.map);
            state.map.setView([state.location.lat, state.location.lng], 15);
        } else { 
            myMarker.setLatLng([state.location.lat, state.location.lng]); 
        }

        // Automatyczne podążanie kamery
        if (state.isFollowing) state.map.panTo([state.location.lat, state.location.lng]);

        // Jeśli trwa spacer, wysyłamy sygnał do bazy
        if (state.isWalking) updateWalkLocation();
    }, null, { enableHighAccuracy: true });

    // POBIERANIE INNYCH PSÓW (STORIES)
    listenForOtherWalks();
}

function listenForOtherWalks() {
    const unsub = db.collection("walks").onSnapshot(snap => {
        let storiesHtml = "";
        const now = Date.now();
        const activeUids = new Set();

        snap.forEach(doc => {
            const d = doc.data();
            const walkTime = d.timestamp;

            // Usuwanie starych spacerów (starsze niż 4 godziny = śmieci)
            if (now - walkTime > 14400000) { 
                db.collection("walks").doc(doc.id).delete(); 
                return; 
            }

            activeUids.add(d.uid);

            // Wyświetlamy tylko innych
            if (d.uid !== state.user.uid) {
                storiesHtml += `
                    <div class="walk-card" onclick="centerOnTarget(${d.lat}, ${d.lng})">
                        <img src="${d.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150'}">
                        <div style="font-weight:900; font-size:12px; margin-top:5px;">${d.name}</div>
                    </div>`;

                // Aktualizacja markerów na mapie
                if (dogMarkers[d.uid]) {
                    dogMarkers[d.uid].setLatLng([d.lat, d.lng]);
                } else {
                    dogMarkers[d.uid] = L.marker([d.lat, d.lng], {
                        icon: L.divIcon({ className: '', html: `<div style="width:40px;height:40px;border-radius:50%;border:3px solid white;overflow:hidden;box-shadow:0 5px 15px rgba(0,0,0,0.2);"><img src="${d.avatar}" style="width:100%;height:100%;object-fit:cover;"></div>`, iconSize:[40,40] })
                    }).addTo(state.map);
                }
            }
        });

        // Czyszczenie markerów psów, które zakończyły spacer
        Object.keys(dogMarkers).forEach(uid => {
            if (!activeUids.has(uid)) {
                state.map.removeLayer(dogMarkers[uid]);
                delete dogMarkers[uid];
            }
        });

        document.getElementById('stories-container').innerHTML = storiesHtml || "<p style='font-size:12px; color:var(--text-muted);'>Brak spacerowiczów.</p>";
    });
    addListener(unsub);
}

export function centerOnMe() { 
    state.isFollowing = true; 
    if (state.location.lat) state.map.flyTo([state.location.lat, state.location.lng], 15); 
}

// Funkcja globalna dla onClick w renderowanym HTML
window.centerOnTarget = function(lat, lng) {
    state.isFollowing = false;
    state.map.flyTo([lat, lng], 16);
    document.getElementById('view-map').classList.add('active');
    document.getElementById('view-community').classList.remove('active');
    document.querySelectorAll('.nav-item')[0].classList.add('active');
    document.querySelectorAll('.nav-item')[1].classList.remove('active');
    setTimeout(() => state.map.invalidateSize(), 200);
}
