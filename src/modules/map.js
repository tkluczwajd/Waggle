import { state, ListenerManager } from '../core/state.js';
import { db } from '../core/firebase.js';

let myMarker = null;
let dogMarkers = {};
let alertMarkers = {};
let activeAlertsList = []; 
let dismissedAlerts = JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');
let parksLoaded = false; 

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
            loadParksAndRuns(latitude, longitude); 
            getWeatherSnippet(latitude, longitude); // Ładuje pogodę na pill mapy
        } else {
            myMarker.setLatLng([latitude, longitude]);
        }
        if(state.isFollowing && state.map) state.map.panTo([latitude, longitude]);
        updateAlertHubUI(); 
    }, err => console.warn("GPS Error:", err), { enableHighAccuracy: true });

    listenForWalks();
    listenForAlerts();
}

function getDistance(lat1, lon1, lat2, lon2) { 
    const R = 6371; const dLat = (lat2-lat1) * Math.PI / 180; const dLon = (lon2-lon1) * Math.PI / 180; 
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
}

async function getWeatherSnippet(lat, lon) {
    try {
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const d = await r.json();
        const tempEl = document.getElementById('weather-temp');
        if(tempEl) tempEl.innerText = `${Math.round(d.current_weather.temperature)}°C`;
    } catch(e) {}
}

function listenForAlerts() {
    const unsub = db.collection("alerts").onSnapshot(snap => {
        Object.values(alertMarkers).forEach(m => state.map.removeLayer(m));
        alertMarkers = {};
        activeAlertsList = [];

        snap.forEach(doc => {
            const a = doc.data();
            if(Date.now() - a.createdAt < 86400000) {
                const marker = L.marker([a.lat, a.lng], {
                    icon: L.divIcon({ className: '', html: `<div style="background:var(--danger); color:white; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-size:18px; border:3px solid white; box-shadow:var(--soft-shadow); box-sizing: border-box;">⚠️</div>`, iconSize:[32,32] })
                }).addTo(state.map).bindPopup(`<b>Zagrożenie:</b><br>${a.text}`);
                alertMarkers[doc.id] = marker;
                activeAlertsList.push({ id: doc.id, ...a });
            }
        });
        updateAlertHubUI();
    });
    ListenerManager.register('alerts', unsub);
}

function updateAlertHubUI() {
    if (!state.location.lat) return;
    const nearby = activeAlertsList.filter(a => getDistance(state.location.lat, state.location.lng, a.lat, a.lng) < 5);
    const unread = nearby.filter(a => !dismissedAlerts.includes(a.id));
    const pill = document.getElementById('active-alert-pill');
    
    if (!pill) return;

    if (nearby.length > 0) {
        pill.style.display = 'flex';
        pill.onclick = () => showAllAlertsPopup(nearby); 
        if (unread.length > 0) {
            pill.style.background = 'var(--danger)';
            pill.innerHTML = `⚠️ ${unread.length} NOWE ZAGROŻENIA!`;
            pill.style.animation = 'pulse-red 1.5s infinite'; 
        } else {
            pill.style.background = 'var(--panel-bg)';
            pill.style.color = 'var(--danger)';
            pill.innerHTML = `⚠️ ${nearby.length} w okolicy`;
            pill.style.animation = 'none';
        }
    } else {
        pill.style.display = 'none';
    }
}

function showAllAlertsPopup(nearbyAlerts) {
    let msg = "Zagrożenia w okolicy:\n\n";
    nearbyAlerts.forEach(a => {
        msg += `- ${a.text} (${getDistance(state.location.lat, state.location.lng, a.lat, a.lng).toFixed(1)} km stąd)\n`;
        if(!dismissedAlerts.includes(a.id)) dismissedAlerts.push(a.id);
    });
    localStorage.setItem('dismissedAlerts', JSON.stringify(dismissedAlerts));
    updateAlertHubUI(); 
    alert(msg); 
}

async function loadParks(lat, lng) {
    if (parksLoaded) return;
    parksLoaded = true;
    const query = `[out:json];(node["leisure"="park"](around:3000,${lat},${lng});way["leisure"="park"](around:3000,${lat},${lng});node["leisure"="dog_park"](around:3000,${lat},${lng});way["leisure"="dog_park"](around:3000,${lat},${lng}););out center;`;
    try {
        const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const data = await res.json();
        const parkIcon = L.divIcon({ className: '', html: '<div style="font-size:22px; text-shadow: 0 2px 5px rgba(0,0,0,0.3);">🌳</div>', iconSize: [24,24] });
        const dogParkIcon = L.divIcon({ className: '', html: '<div style="font-size:22px; text-shadow: 0 2px 5px rgba(0,0,0,0.3);">🐕</div>', iconSize: [24,24] });
        data.elements.forEach(el => {
            const pLat = el.lat || el.center.lat; const pLon = el.lon || el.center.lon;
            const isDogPark = el.tags && el.tags.leisure === 'dog_park';
            L.marker([pLat, pLon], { icon: isDogPark ? dogParkIcon : parkIcon }).addTo(state.map);
        });
    } catch(err) { parksLoaded = false; }
}

function loadParksAndRuns(lat, lng) { loadParks(lat, lng); }

function listenForWalks() {
    const unsub = db.collection("walks").onSnapshot(snap => {
        let html = "";
        const activeUids = new Set();
        snap.forEach(doc => {
            const d = doc.data();
            if(d.uid !== state.user.uid) {
                activeUids.add(d.uid);
                html += `<div class="walk-card" onclick="Waggle.centerOnTarget(${d.lat}, ${d.lng})">
                            <img src="${d.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150'}">
                            <div style="font-size:12px; font-weight:900; margin-top:5px;">${d.name}</div>
                        </div>`;
                if (dogMarkers[d.uid]) dogMarkers[d.uid].setLatLng([d.lat, d.lng]);
                else {
                    dogMarkers[d.uid] = L.marker([d.lat, d.lng], {
                        icon: L.divIcon({ className: '', html: `<div style="width:40px;height:40px;border-radius:50%;border:3px solid white;overflow:hidden;background:white;box-shadow:var(--soft-shadow); box-sizing: border-box;"><img src="${d.avatar}" style="width:100%;height:100%;object-fit:cover;"></div>`, iconSize: [40, 40] })
                    }).addTo(state.map);
                }
            }
        });
        Object.keys(dogMarkers).forEach(u => { if(!activeUids.has(u)) { state.map.removeLayer(dogMarkers[u]); delete dogMarkers[u]; }});
        document.getElementById('stories-container').innerHTML = html || "<p style='font-size:12px;'>Cisza w okolicy.</p>";
    });
    ListenerManager.register('walks', unsub);
}

export function centerOnMe() { state.isFollowing = true; state.map.flyTo([state.location.lat, state.location.lng], 15); }
export function centerOnTarget(lat, lng) { state.isFollowing = false; state.map.flyTo([lat, lng], 16); document.querySelector('.nav-item[data-view="map"]').click(); }
