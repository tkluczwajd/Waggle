// src/modules/walkTracker.js
import { db, fb, auth } from '../core/firebase.js';
import { appState as state } from '../core/state.js';

let watchId = null;
let wakeLock = null; 
let activePolyline = null; 

// 🔥 KONFIGURACJA ZAAKCEPTOWANA PRZEZ AUDYT (Brak magicznych liczb)
const MAX_WALK_SPEED = 12; // km/h (Powyżej tej prędkości ignorujemy ruch - rower/auto)
const MAX_JUMP_KM = 0.05;  // 50m (Nagły skok między jednym a drugim odczytem to błąd GPS)
const MIN_MOVE_KM = 0.003; // 3m (Minimalny ruch, by uznać, że nie stoimy w miejscu)
const DB_SAVE_DIST = 0.01; // 10m (Co ile metrów zapisać punkt na stałe do bazy)

let walkData = {
    positions: [],
    pathForDb: [], // Oddzielna tablica tylko dla punktów zapisywanych do chmury
    lastSavedDbPos: null,
    distanceKm: 0,
    startTime: null,
    isActive: false
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) { return deg * (Math.PI / 180); }

async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
    } catch (err) { console.warn("Wake Lock niedostępny:", err); }
}

async function releaseWakeLock() {
    if (wakeLock !== null) { await wakeLock.release(); wakeLock = null; }
}

// START SPACERU
export async function startWalkTracker() {
    if (walkData.isActive) return;

    walkData = { positions: [], pathForDb: [], lastSavedDbPos: null, distanceKm: 0, startTime: Date.now(), isActive: true };
    await requestWakeLock(); 
    
    if (state.map && state.map.instance && window.L) {
        activePolyline = window.L.polyline([], {
            color: '#ff5252', weight: 5, opacity: 0.85, dashArray: '10, 10', lineJoin: 'round'
        }).addTo(state.map.instance);
    }
    
    if (window.Waggle && window.Waggle.showToast) window.Waggle.showToast("🐕 Spacer rozpoczęty! Ruszaj przed siebie.");

    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const now = Date.now();
            
            if (accuracy > 25) return;

            if (walkData.positions.length > 0) {
                const lastPos = walkData.positions[walkData.positions.length - 1];
                const dist = getDistanceFromLatLonInKm(lastPos.lat, lastPos.lng, latitude, longitude);
                
                // 🔥 Zabezpieczenie przed "teleportacją" i zgubieniem punktów
                if (dist > MAX_JUMP_KM) return; 

                const timeDiffHours = (now - lastPos.time) / 3600000; 
                
                if (timeDiffHours > 0) {
                    const speedKmH = dist / timeDiffHours;
                    
                    if (dist > MIN_MOVE_KM && speedKmH < MAX_WALK_SPEED) { 
                        walkData.distanceKm += dist;
                        const currentPoint = { lat: latitude, lng: longitude, time: now };
                        
                        walkData.positions.push(currentPoint);
                        if (activePolyline) activePolyline.addLatLng([latitude, longitude]);
                        
                        // 🔥 Uproszczenie trasy oparte na DYSTANSIE, a nie na indeksie
                        if (!walkData.lastSavedDbPos) {
                            walkData.pathForDb.push(currentPoint);
                            walkData.lastSavedDbPos = currentPoint;
                        } else {
                            const distFromLastSaved = getDistanceFromLatLonInKm(walkData.lastSavedDbPos.lat, walkData.lastSavedDbPos.lng, latitude, longitude);
                            if (distFromLastSaved > DB_SAVE_DIST) {
                                walkData.pathForDb.push(currentPoint);
                                walkData.lastSavedDbPos = currentPoint;
                            }
                        }
                        
                        const distCounter = document.getElementById('walk-distance-counter');
                        if (distCounter) distCounter.innerText = walkData.distanceKm.toFixed(2) + " km";
                    }
                }
            } else {
                const startPoint = { lat: latitude, lng: longitude, time: now };
                walkData.positions.push(startPoint);
                walkData.pathForDb.push(startPoint);
                walkData.lastSavedDbPos = startPoint;
                if (activePolyline) activePolyline.addLatLng([latitude, longitude]);
            }
        },
        (error) => { console.warn("GPS wstrzymany lub zgubił zasięg:", error); },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
}

// KONIEC SPACERU
export async function stopWalkTracker() {
    if (!walkData.isActive) return;
    
    navigator.geolocation.clearWatch(watchId);
    await releaseWakeLock(); 
    walkData.isActive = false;
    
    if (activePolyline && state.map && state.map.instance) {
        state.map.instance.removeLayer(activePolyline);
        activePolyline = null;
    }
    
    const durationMs = Date.now() - walkData.startTime;
    const durationMins = Math.round(durationMs / 60000);
    const finalDistance = parseFloat(walkData.distanceKm.toFixed(2));
    
    if (window.Waggle && window.Waggle.showToast) {
        window.Waggle.showToast(`🏁 Koniec spaceru! Dystans: ${finalDistance} km`);
    }

    const currentUid = localStorage.getItem('activeDogId') || (auth.currentUser ? auth.currentUser.uid : null);
    
    if (currentUid && finalDistance > 0.05) { 
        try {
            await db.collection('walks').add({
                dogId: currentUid,
                distanceKm: finalDistance,
                durationMinutes: durationMins,
                path: walkData.pathForDb, // Zoptymalizowana ścieżka gotowa do zapisu
                timestamp: fb.firestore.FieldValue.serverTimestamp()
            });
            
            const today = new Date().toISOString().split('T')[0];
            await db.collection('users').doc(currentUid).collection('daily_care').doc(today).set({
                walk: fb.firestore.FieldValue.increment(1),
                lastUpdated: fb.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // 🔥 Nowość: Zbieramy też totalWalkTime
            await db.collection('users').doc(currentUid).set({
                walkCount: fb.firestore.FieldValue.increment(1),
                totalDistance: fb.firestore.FieldValue.increment(finalDistance),
                totalWalkTime: fb.firestore.FieldValue.increment(durationMins)
            }, { merge: true });

        } catch (err) {
            console.error("Błąd zapisu spaceru:", err);
            if (window.Waggle && window.Waggle.showToast) window.Waggle.showToast("❌ Błąd zapisu spaceru.");
        }
    } else if (currentUid && finalDistance <= 0.05) {
        if (window.Waggle && window.Waggle.showToast) {
            window.Waggle.showToast("Dystans poniżej 50 metrów. Trening nie został zapisany.");
        }
    }
}
