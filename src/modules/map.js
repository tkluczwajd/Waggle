import { state, addListener } from '../core/state.js';
import { db } from '../core/firebase.js';

let myMarker = null; 
let dogMarkers = {}; 
let alertMarkers = {};
let activeAlertsList = []; 
let dismissedAlerts = JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');
let parksLoaded = false; 
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

        // GPS NA ŻYWO Z OBSŁUGĄ GHOST MODE
        if (state.isWalking && state.user) {
            if (state.isGhostMode) {
                // Jeśli Ghost Mode jest włączony, usuwamy naszą pozycję z bazy widocznych spacerów
                db.collection("walks").doc(state.user.uid).delete().catch(() => {});
            } else {
                // Jeśli jesteśmy widoczni, normalnie aktualizujemy pozycję
                db.collection("walks").doc(state.user.uid).set({
                    uid: state.user.uid,
                    name: state.profile?.name || "Piesek",
                    avatar: state.profile?.avatar || "",
                    lat: latitude,
                    lng: longitude,
                    timestamp: Date.now()
                }, { merge: true });
            }
        }

    }, err => console.warn("GPS Error:", err), { enableHighAccuracy: true });

    listenForWalks(); 
    listenForAlerts(); 
}

function loadParksAndRuns(lat, lng) {
    if (parksLoaded) return;
    const query = `[out:json];(node["leisure"="dog_park"](around:5000,${lat},${lng});way["leisure"="dog_park"](around:5000,${lat},${lng});node["leisure"="park"](around:3000,${lat},${lng}););out center;`;
    fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
        .then(r => r.json()).then(data => {
            data.elements.forEach(el => {
                const eLat = el.lat || el.center.lat;
                const eLng = el.lon || el.center.lon;
                const isRun = el.tags.leisure === 'dog_park';
                const name = el.tags.name || (isRun ? "Wybieg dla psów" : "Park");
                
                const dist = getDistance(lat, lng, eLat, eLng);
                nearbyPlaces.push({ name, dist, lat: eLat, lng: eLng, isRun });

                const icon = L.divIcon({
                    className: '',
                    html: `<div style="background:${isRun ? '#4cd137' : '#00a8ff'}; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; border:2px solid white; box-shadow:var(--soft-shadow); font-size:16px;">${isRun ? '🐕' : '🌳'}</div>`,
                    iconSize: [30,30]
                });
                L.marker([eLat, eLng], { icon }).addTo(state.map).bindPopup(`<b>${name}</b><br>${dist.toFixed(2)} km`);
            });
            nearbyPlaces.sort((a, b) => a.dist - b.dist);
            parksLoaded = true;
        });
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2-lat1) * Math.PI / 180;
    const dLon = (lon2-lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function listenForWalks() {
    const unsub = db.collection("walks").onSnapshot(snap => {
        const activeUids = new Set();
        let html = "";
        snap.forEach(doc => {
            const d = doc.data();
            if (Date.now() - d.timestamp > 600000) return; 
            activeUids.add(d.uid);
            const isMe = d.uid === state.user?.uid;
            
            const avatarSrc = d.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
            html += `<div class="story-circle" onclick="window.Waggle.centerOnTarget(${d.lat}, ${d.lng})" style="flex-shrink:0; cursor:pointer; display:flex; flex-direction:column; align-items:center; width:65px;">
                        <div style="width:55px; height:55px; border-radius:50%; padding:2px; border:2px solid ${isMe ? 'var(--secondary)' : 'var(--primary)'}; background:white; box-shadow:var(--soft-shadow);">
                            <img src="${avatarSrc}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">
                        </div>
                        <div style="font-size:10px; font-weight:900; margin-top:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%; text-align:center;">${isMe ? 'Ty' : d.name}</div>
                     </div>`;
            
            if(!isMe) {
                if (dogMarkers[d.uid]) dogMarkers[d.uid].setLatLng([d.lat, d.lng]);
                else dogMarkers[d.uid] = L.marker([d.lat, d.lng], { 
                    icon: L.divIcon({ 
                        className: '', 
                        html: `<div style="width:40px;height:40px;border-radius:50%;border:3px solid white;overflow:hidden;background:white;box-shadow:var(--soft-shadow); box-sizing: border-box;"><img src="${avatarSrc}" style="width:100%;height:100%;object-fit:cover;"></div>`, 
                        iconSize: [40, 40] 
                    }) 
                }).addTo(state.map).on('click', () => {
                    window.Waggle.showUserModal(d);
                });
            }
        });
        Object.keys(dogMarkers).forEach(u => { if(!activeUids.has(u)) { state.map.removeLayer(dogMarkers[u]); delete dogMarkers[u]; }});
        
        const sc = document.getElementById('stories-container');
        if(sc) sc.innerHTML = html || "<p style='font-size:12px; color:var(--text-muted); padding-left:10px;'>Cisza w okolicy. Wyjdź jako pierwszy!</p>";
    });
    addListener(unsub);
}

function listenForAlerts() {
    const unsub = db.collection("alerts").onSnapshot(snap => {
        activeAlertsList = [];
        snap.forEach(doc => {
            const data = { id: doc.id, ...doc.data() };
            if (Date.now() - data.createdAt > 86400000) return; 
            activeAlertsList.push(data);

            if (!alertMarkers[doc.id] && !dismissedAlerts.includes(doc.id)) {
                const icon = L.divIcon({
                    className: '',
                    html: `<div style="background:var(--danger); width:35px; height:35px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; border:3px solid white; font-size:18px; box-shadow:0 0 15px rgba(255,82,82,0.5);">⚠️</div>`,
                    iconSize: [35,35]
                });
                alertMarkers[doc.id] = L.marker([data.lat, data.lng], { icon }).addTo(state.map).bindPopup(`<b>ZAGROŻENIE!</b><br>${data.text}`);
            }
        });
        updateAlertHubUI();
    });
    addListener(unsub);
}

function updateAlertHubUI() {
    const container = document.getElementById('active-alerts-list');
    if (!container) return;
    if (activeAlertsList.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted);">Brak aktywnych alertów w okolicy. Czysto! 🐾</div>`;
        return;
    }
    let html = "";
    activeAlertsList.forEach(a => {
        html += `<div class="post-card" style="margin-bottom:10px; border-left:4px solid var(--danger);">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                        <div style="flex:1;">
                            <b style="color:var(--danger); font-size:12px;">⚠️ ALERT ZAGROŻENIA</b>
                            <p style="margin:5px 0; font-size:14px; font-weight:700;">${a.text}</p>
                            <small style="color:var(--text-muted);">Zgłoszono: ${new Date(a.createdAt).toLocaleTimeString()}</small>
                        </div>
                        <button class="btn-outline" onclick="window.Waggle.centerOnTarget(${a.lat}, ${a.lng})" style="width:auto; padding:8px 12px; font-size:12px;">POKAŻ</button>
                    </div>
                 </div>`;
    });
    container.innerHTML = html;
}

export function centerOnMe() { state.isFollowing = true; state.map.flyTo([state.location.lat, state.location.lng], 15); }
export function centerOnTarget(lat, lng) { state.isFollowing = false; state.map.flyTo([lat, lng], 16); document.querySelector('.nav-item[data-view="map"]').click(); }
