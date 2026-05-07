import { state, addListener } from '../core/state.js';
import { db } from '../core/firebase.js';

let myMarker = null; 
let dogMarkers = {}; 
let alertMarkers = {};
let activeAlertsList = []; 
let dismissedAlerts = JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');
let parksLoaded = false; 

// NOWOŚĆ: używamy "const", żeby referencja się nigdy nie zerwała
export const nearbyPlaces = []; 

export function initMap() {
    if (state.map) return;
    state.map = L.map('map', { zoomControl: false }).setView([52.2, 21.0], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(state.map);

    navigator.geolocation.watchPosition(pos => {
        const { latitude, longitude } = pos.coords;
        state.location = { lat: latitude, lng: longitude };
        
        const myAvatarSrc = state.profile?.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
        const myIcon = L.divIcon({ 
            className: '', 
            html: `<div style="width:50px;height:50px;border-radius:50%;border:3px solid var(--secondary);box-shadow: 0 0 20px var(--secondary);overflow:hidden;background:white;"><img src="${myAvatarSrc}" style="width:100%;height:100%;object-fit:cover;"></div>`, 
            iconSize: [50, 50] 
        });

        if (!myMarker) {
            myMarker = L.marker([latitude, longitude], { icon: myIcon, zIndexOffset: 1000 }).addTo(state.map);
            state.map.setView([latitude, longitude], 15);
            loadParksAndRuns(latitude, longitude); 
        } else { 
            myMarker.setLatLng([latitude, longitude]).setIcon(myIcon); 
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

function listenForAlerts() {
    const unsub = db.collection("alerts").onSnapshot(snap => {
        Object.values(alertMarkers).forEach(m => state.map.removeLayer(m));
        alertMarkers = {}; activeAlertsList = [];
        snap.forEach(doc => {
            const a = doc.data();
            if(Date.now() - a.createdAt < 86400000) {
                const marker = L.marker([a.lat, a.lng], { icon: L.divIcon({ className: '', html: `<div style="background:var(--danger); color:white; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-size:18px; border:3px solid white; box-shadow:var(--soft-shadow); box-sizing: border-box;">⚠️</div>`, iconSize:[32,32] }) })
                .addTo(state.map).bindPopup(`<b>Zagrożenie:</b><br>${a.text}`);
                alertMarkers[doc.id] = marker; activeAlertsList.push({ id: doc.id, ...a });
            }
        });
        updateAlertHubUI();
    });
    addListener(unsub);
}

function updateAlertHubUI() {
    if (!state.location.lat) return;
    const nearby = activeAlertsList.filter(a => getDistance(state.location.lat, state.location.lng, a.lat, a.lng) < 5);
    const unread = nearby.filter(a => !dismissedAlerts.includes(a.id));
    const pill = document.getElementById('active-alert-pill');
    if (!pill) return;
    if (nearby.length > 0) {
        pill.style.display = 'flex';
        pill.onclick = () => window.showAllAlertsPopup(nearby);
        if (unread.length > 0) {
            pill.style.background = 'var(--danger)'; pill.innerHTML = `⚠️ ${unread.length} NOWE ZAGROŻENIA!`;
            pill.style.animation = 'pulse-red 1.5s infinite'; 
        } else {
            pill.style.background = 'var(--panel-bg)'; pill.style.color = 'var(--danger)';
            pill.innerHTML = `⚠️ ${nearby.length} w okolicy`; pill.style.animation = 'none';
        }
    } else { pill.style.display = 'none'; }
}

window.showAllAlertsPopup = function(nearbyAlerts) {
    let html = "";
    nearbyAlerts.forEach(a => {
        const dist = getDistance(state.location.lat, state.location.lng, a.lat, a.lng).toFixed(1);
        const diffMin = Math.round((Date.now() - a.createdAt) / 60000);
        let timeText = diffMin < 60 ? `${diffMin} min temu` : `${Math.floor(diffMin/60)} godz. temu`;
        html += `<div style="padding: 15px; border-radius: 16px; background: var(--bg-color); margin-bottom: 10px; border-left: 4px solid var(--danger);">
                    <b style="color: var(--danger); font-size: 15px;">${a.text}</b><br>
                    <small style="color: var(--text-muted); font-weight: 800;">Około ${dist} km stąd • ${timeText}</small>
                 </div>`;
        if(!dismissedAlerts.includes(a.id)) dismissedAlerts.push(a.id);
    });
    document.getElementById('alert-hub-list').innerHTML = html;
    document.getElementById('alert-hub-modal').style.display = 'flex';
    localStorage.setItem('dismissedAlerts', JSON.stringify(dismissedAlerts));
    updateAlertHubUI();
};

async function loadParks(lat, lng) {
    if (parksLoaded) return; parksLoaded = true;
    const query = `[out:json];(node["leisure"="park"](around:5000,${lat},${lng});way["leisure"="park"](around:5000,${lat},${lng});node["leisure"="dog_park"](around:5000,${lat},${lng});way["leisure"="dog_park"](around:5000,${lat},${lng}););out center;`;
    
    try {
        const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        nearbyPlaces.length = 0; // POPRAWKA: Bezpieczne czyszczenie listy
        const parkIcon = L.divIcon({ className: '', html: '<div style="font-size:22px; text-shadow: 0 2px 5px rgba(0,0,0,0.3);">🌳</div>', iconSize: [24,24] });
        const dogParkIcon = L.divIcon({ className: '', html: '<div style="font-size:22px; text-shadow: 0 2px 5px rgba(0,0,0,0.3);">🐕</div>', iconSize: [24,24] });

        data.elements.forEach(el => {
            const pLat = el.lat || el.center.lat; const pLon = el.lon || el.center.lon;
            const isDogPark = el.tags && el.tags.leisure === 'dog_park';
            const name = el.tags && el.tags.name ? el.tags.name : (isDogPark ? "Wybieg dla psów" : "Park / Zielen");
            const distance = getDistance(lat, lng, pLat, pLon);
            
            nearbyPlaces.push({
                name: name, isDogPark: isDogPark, lat: pLat, lng: pLon, distance: distance
            });

            L.marker([pLat, pLon], { icon: isDogPark ? dogParkIcon : parkIcon }).addTo(state.map)
             .bindPopup(`<b>${name}</b><br><a href="https://www.google.com/maps/dir/?api=1&destination=${pLat},${pLon}" target="_blank" style="color:var(--secondary); font-weight:800; text-decoration:none; display:inline-block; margin-top:5px;">Nawiguj tutaj 🧭</a>`);
        });

        nearbyPlaces.sort((a, b) => a.distance - b.distance);
        
        // Zmuszamy widok "miejsc" do odświeżenia, jeśli pobierze dane z opóźnieniem
        if (window.Waggle && window.Waggle.renderPlaces) {
            window.Waggle.renderPlaces();
        }
    } catch(err) { parksLoaded = false; }
}

function loadParksAndRuns(lat, lng) { loadParks(lat, lng); }

function listenForWalks() {
    const unsub = db.collection("walks").onSnapshot(snap => {
        let html = ""; const activeUids = new Set();
        snap.forEach(doc => {
            const d = doc.data();
            activeUids.add(d.uid);
            const isMe = (d.uid === state.user?.uid);
            const avatarSrc = d.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
            const bColor = isMe ? 'var(--primary)' : 'white';
            
            // Pasek na górze Tablicy!
            html += `<div class="walk-card" onclick="window.Waggle.centerOnTarget(${d.lat}, ${d.lng})">
                        <img src="${avatarSrc}" style="border: 3px solid ${bColor};">
                        <div style="font-size:12px; font-weight:900; margin-top:5px;">${isMe ? 'Ty' : d.name}</div>
                     </div>`;
            
            if(!isMe) {
                if (dogMarkers[d.uid]) dogMarkers[d.uid].setLatLng([d.lat, d.lng]);
                else dogMarkers[d.uid] = L.marker([d.lat, d.lng], { icon: L.divIcon({ className: '', html: `<div style="width:40px;height:40px;border-radius:50%;border:3px solid white;overflow:hidden;background:white;box-shadow:var(--soft-shadow); box-sizing: border-box;"><img src="${avatarSrc}" style="width:100%;height:100%;object-fit:cover;"></div>`, iconSize: [40, 40] }) }).addTo(state.map);
            }
        });
        Object.keys(dogMarkers).forEach(u => { if(!activeUids.has(u)) { state.map.removeLayer(dogMarkers[u]); delete dogMarkers[u]; }});
        
        // Renderujemy do paska na tablicy
        const sc = document.getElementById('stories-container');
        if(sc) sc.innerHTML = html || "<p style='font-size:12px; color:var(--text-muted);'>Cisza w okolicy. Wyjdź jako pierwszy!</p>";
    }); 
    addListener(unsub);
}

export function centerOnMe() { state.isFollowing = true; state.map.flyTo([state.location.lat, state.location.lng], 15); }
export function centerOnTarget(lat, lng) { state.isFollowing = false; state.map.flyTo([lat, lng], 16); document.querySelector('.nav-item[data-view="map"]').click(); }
