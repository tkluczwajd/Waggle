// src/modules/walkTracker.js
import { db, fb, auth } from '../core/firebase.js';
import { appState as state } from '../core/state.js';

let watchId = null;
let wakeLock = null; 
let activePolyline = null; 

// Konfiguracja do testów polowych
const MAX_WALK_SPEED = 12; // km/h
const MIN_MOVE_KM = 0.003; // 3m
const DB_SAVE_DIST = 0.01; // 10m

let walkData = {
    positions: [],
    pathForDb: [], 
    lastSavedDbPos: null,
    distanceKm: 0,
    startTime: null,
    isActive: false
};

// 🔥 FUNKCJA DIAGNOSTYCZNA (Zapisuje logi do pamięci telefonu)
function saveLogToPhone(type, data) {
    const timeStr = new Date().toLocaleTimeString();
    const logEntry = `[${timeStr}] ${type}: ${JSON.stringify(data)}\n`;
    
    // Zapisz do localStorage
    let currentLogs = localStorage.getItem('waggle_gps_logs') || "";
    // Ogranicznik, żeby nie zapchać telefonu (ucięcie starych logów)
    if (currentLogs.length > 500000) currentLogs = currentLogs.substring(currentLogs.length - 200000);
    
    localStorage.setItem('waggle_gps_logs', currentLogs + logEntry);
    
    // Wypisz też do konsoli (dla formalności)
    console.log(`${type}`, data);
}

// -----------------------------------------------------------

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

export async function startWalkTracker() {
    if (walkData.isActive) return;

    walkData = { positions: [], pathForDb: [], lastSavedDbPos: null, distanceKm: 0, startTime: Date.now(), isActive: true };
    await requestWakeLock(); 
    
    // 🔥 CZYŚCIMY STARE LOGI PRZY STARCIE NOWEGO SPACERU
    localStorage.removeItem('waggle_gps_logs');
    
    if (state.map && state.map.instance && window.L) {
        activePolyline = window.L.polyline([], {
            color: '#ff5252', weight: 6, opacity: 0.9, dashArray: '10, 10', lineJoin: 'round'
        }).addTo(state.map.instance);
    }
    
    if (window.Waggle && window.Waggle.showToast) window.Waggle.showToast("🐕 Spacer rozpoczęty!");

    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const now = Date.now();
            
            saveLogToPhone('[WALK GPS RAW]', { lat: latitude, lng: longitude, accuracy: Math.round(accuracy) });

            if (accuracy > 30) {
                saveLogToPhone('[WALK GPS REJECTED]', { reason: 'Słaba dokładność (>30m)', accuracy: Math.round(accuracy) });
                return;
            }

            const currentPoint = { lat: latitude, lng: longitude, time: now };
            const currentMap = (state.map && state.map.instance) || window.map || (window.Waggle && window.Waggle.map);

            if (walkData.positions.length > 0) {
                const lastPos = walkData.positions[walkData.positions.length - 1];
                const dist = getDistanceFromLatLonInKm(lastPos.lat, lastPos.lng, latitude, longitude);
                const timeDiffHours = (now - lastPos.time) / 3600000; 
                
                if (timeDiffHours > 0) {
                    const speedKmH = dist / timeDiffHours;
                    
                    if (dist > MIN_MOVE_KM && speedKmH < MAX_WALK_SPEED) { 
                        
                        walkData.distanceKm += dist;
                        walkData.positions.push(currentPoint);
                        
                        saveLogToPhone('[WALK GPS ACCEPTED]', { 
                            accuracy: Math.round(accuracy), 
                            distance: dist, 
                            speed: speedKmH, 
                            totalDistance: walkData.distanceKm 
                        });

                        if (currentMap && window.L) {
                            if (!activePolyline) {
                                const allLatLngs = walkData.positions.map(p => [p.lat, p.lng]);
                                activePolyline = window.L.polyline(allLatLngs, {
                                    color: '#ff5252', weight: 6, opacity: 0.9, dashArray: '10, 10', lineJoin: 'round'
                                }).addTo(currentMap);
                            } else {
                                if (!currentMap.hasLayer(activePolyline)) activePolyline.addTo(currentMap);
                                activePolyline.addLatLng([latitude, longitude]);
                            }
                        }
                        
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

                        const speedCounter = document.getElementById('walk-speed-counter');
                        if (speedCounter) speedCounter.innerText = speedKmH.toFixed(1);
                        
                    } else {
                        saveLogToPhone('[WALK GPS REJECTED]', { 
                            reason: 'Limity ruchu/prędkości',
                            distance_km: dist, 
                            speed_kmh: speedKmH,
                            accuracy: Math.round(accuracy)
                        });
                    }
                }
            } else {
                walkData.positions.push(currentPoint);
                walkData.pathForDb.push(currentPoint);
                walkData.lastSavedDbPos = currentPoint;

                saveLogToPhone('[WALK GPS INITIALIZED]', { lat: latitude, lng: longitude, accuracy: Math.round(accuracy) });

                if (currentMap && window.L) {
                    if (!activePolyline) {
                        activePolyline = window.L.polyline([[latitude, longitude]], {
                            color: '#ff5252', weight: 6, opacity: 0.9, dashArray: '10, 10', lineJoin: 'round'
                        }).addTo(currentMap);
                    } else {
                        if (!currentMap.hasLayer(activePolyline)) activePolyline.addTo(currentMap);
                        activePolyline.addLatLng([latitude, longitude]);
                    }
                }
            }
        },
        (error) => { 
            console.warn("GPS wstrzymany:", error); 
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
}

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
    
    const currentUid = localStorage.getItem('activeDogId') || (auth.currentUser ? auth.currentUser.uid : null);
    
    if (currentUid && finalDistance > 0.05) { 
        try {
            await db.collection('walks').add({
                dogId: currentUid,
                distanceKm: finalDistance,
                durationMinutes: durationMins,
                path: walkData.pathForDb, 
                timestamp: fb.firestore.FieldValue.serverTimestamp()
            });
            
            const today = new Date().toISOString().split('T')[0];
            await db.collection('users').doc(currentUid).collection('daily_care').doc(today).set({
                walk: fb.firestore.FieldValue.increment(1),
                lastUpdated: fb.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            await db.collection('users').doc(currentUid).set({
                walkCount: fb.firestore.FieldValue.increment(1),
                totalDistance: fb.firestore.FieldValue.increment(finalDistance),
                totalWalkTime: fb.firestore.FieldValue.increment(durationMins)
            }, { merge: true });

        } catch (err) {
            console.error("Błąd zapisu spaceru:", err);
        }
    } else {
        saveLogToPhone('[WALK CANCELLED]', `Dystans zbyt krótki do zapisu (${finalDistance} km)`);
    }
}
