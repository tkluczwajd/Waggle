import { state, addListener } from '../core/state.js';
import { db } from '../core/firebase.js';

let myMarker = null;
let dogMarkers = {};
let alertMarkers = {};

export function initMap() {
    if (state.map) return;
    state.map = L.map('map', { zoomControl: false }).setView([52.2297, 21.0122], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(state.map);

    navigator.geolocation.watchPosition(pos => {
        const { latitude, longitude } = pos.coords;
        state.location = { lat: latitude, lng: longitude };

        if (!myMarker) {
            myMarker = L.circleMarker([latitude, longitude], { radius: 10, color: '#fff', fillColor: '#34ace0', fillOpacity: 1, weight: 3 }).addTo(state.map);
            state.map.setView([latitude, longitude], 15);
            getWeather(latitude, longitude); // Przywrócona POGODA
        } else {
            myMarker.setLatLng([latitude, longitude]);
        }
    }, null, { enableHighAccuracy: true });

    listenForWalks();
    listenForAlerts(); // Przywrócone ALERTY
}

async function getWeather(lat, lon) {
    try {
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const d = await r.json();
        document.getElementById('weather-temp').innerText = `${Math.round(d.current_weather.temperature)}°C`;
    } catch(e) { console.error("Weather error", e); }
}

function listenForAlerts() {
    const unsub = db.collection("alerts").onSnapshot(snap => {
        // Usuwamy stare
        Object.values(alertMarkers).forEach(m => state.map.removeLayer(m));
        alertMarkers = {};
        
        snap.forEach(doc => {
            const a = doc.data();
            const marker = L.marker([a.lat, a.lng], {
                icon: L.divIcon({ className: '', html: `<div style="background:red; color:white; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; border:2px solid white;">⚠️</div>` })
            }).addTo(state.map).bindPopup(a.text);
            alertMarkers[doc.id] = marker;
        });
    });
    addListener(unsub);
}

function listenForWalks() {
    const unsub = db.collection("walks").onSnapshot(snap => {
        let html = "";
        snap.forEach(doc => {
            const d = doc.data();
            if(d.uid !== state.user.uid) {
                html += `<div class="walk-card" onclick="window.centerOnTarget(${d.lat}, ${d.lng})">
                    <img src="${d.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150'}">
                    <div>${d.name}</div>
                </div>`;
            }
        });
        document.getElementById('stories-container').innerHTML = html;
    });
    addListener(unsub);
}

export function centerOnMe() { state.map.flyTo([state.location.lat, state.location.lng], 15); }
