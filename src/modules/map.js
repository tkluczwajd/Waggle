import { state, addListener } from '../core/state.js';
import { db } from '../core/firebase.js';

let myMarker = null;
let dogMarkers = {};

export function initMap() {
    if (state.map) return;
    state.map = L.map('map', { zoomControl: false }).setView([52.2, 21.0], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(state.map);

    navigator.geolocation.watchPosition(pos => {
        const { latitude, longitude } = pos.coords;
        state.location = { lat: latitude, lng: longitude };

        if (!myMarker) {
            myMarker = L.circleMarker([latitude, longitude], { radius: 10, color: '#fff', fillColor: '#34ace0', fillOpacity: 1, weight: 3 }).addTo(state.map);
            state.map.setView([latitude, longitude], 15);
            getWeather(latitude, longitude);
        } else {
            myMarker.setLatLng([latitude, longitude]);
        }
        if(state.isFollowing && state.map) state.map.panTo([latitude, longitude]);
    }, err => console.warn("GPS Error:", err), { enableHighAccuracy: true });

    listenForWalks();
}

async function getWeather(lat, lon) {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
        .then(r => r.json())
        .then(d => {
            const tempEl = document.getElementById('weather-temp');
            if(tempEl) tempEl.innerText = `${Math.round(d.current_weather.temperature)}°C`;
        })
        .catch(err => console.error("Weather fetch failed:", err));
}

function listenForWalks() {
    const unsub = db.collection("walks").onSnapshot(snap => {
        let html = "";
        const activeUids = new Set();
        snap.forEach(doc => {
            const d = doc.data();
            if(d.uid !== state.user.uid) {
                activeUids.add(d.uid);
                html += `
                    <div class="walk-card" onclick="Waggle.centerOnTarget(${d.lat}, ${d.lng})">
                        <img src="${d.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150'}">
                        <div>${d.name}</div>
                    </div>`;
                
                if (dogMarkers[d.uid]) {
                    dogMarkers[d.uid].setLatLng([d.lat, d.lng]);
                } else {
                    dogMarkers[d.uid] = L.marker([d.lat, d.lng], {
                        icon: L.divIcon({ className: '', html: `<img src="${d.avatar}" style="width:40px;height:40px;border-radius:50%;border:2px solid white;">`, iconSize: [40, 40] })
                    }).addTo(state.map);
                }
            }
        });
        
        Object.keys(dogMarkers).forEach(u => { 
            if(!activeUids.has(u)) { 
                state.map.removeLayer(dogMarkers[u]); 
                delete dogMarkers[u]; 
            }
        });
        document.getElementById('stories-container').innerHTML = html || "<p style='font-size:12px;'>Cisza w okolicy.</p>";
    }, err => console.error("Walks listener error:", err));
    
    addListener(unsub);
}

export function centerOnMe() { 
    state.isFollowing = true; 
    state.map.flyTo([state.location.lat, state.location.lng], 15); 
}

export function centerOnTarget(lat, lng) {
    state.isFollowing = false;
    state.map.flyTo([lat, lng], 16);
    // Przełącz na mapę jeśli jesteśmy w innym widoku
    document.querySelector('[data-view="map"]').click();
}
