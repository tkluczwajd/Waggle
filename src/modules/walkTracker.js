// src/modules/walkTracker.js
import { db, fb, auth } from '../core/firebase.js';
import { appState as state } from '../core/state.js'; // 🔥 DODANO: Dostęp do silnika mapy

let watchId = null;
let wakeLock = null; 
let activePolyline = null; // 🔥 Zmienna trzymająca "wstążkę" na mapie

let walkData = {
    positions: [],
    distanceKm: 0,
    startTime: null,
    isActive: false
};

// Formuła Haversine'a: Oblicza odległość w linii prostej na kuli ziemskiej
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

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Blokada ekranu przed uśpieniem (Dla PWA)
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
        }
    } catch (err) {
        console.warn("Wake Lock niedostępny:", err);
    }
}

async function releaseWakeLock() {
    if (wakeLock !== null) {
        await wakeLock.release();
        wakeLock = null;
    }
}

// START SPACERU
export async function startWalkTracker() {
    if (walkData.isActive) return;

    walkData = { positions: [], distanceKm: 0, startTime: Date.now(), isActive: true };
    await requestWakeLock(); 
    
    // 🔥 TWORZYMY LINIĘ NA MAPIE (Tylko wizualnie)
    if (state.map && state.map.instance && window.L) {
        activePolyline = window.L.polyline([], {
            color: '#ff5252', // Zgodny z Twoim kolorem var(--danger/primary)
            weight: 5,
            opacity: 0.85,
            dashArray: '10, 10', // Przerywana linia symulująca ślad kroków
            lineJoin: 'round'
        }).addTo(state.map.instance);
    }
    
    if (window.Waggle && window.Waggle.showToast) {
        window.Waggle.showToast("🐕 Spacer rozpoczęty! Ruszaj przed siebie.");
    }

    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const now = Date.now();
            
            // 1. ZAOSTRZONY RYGOR MIEJSKI: Odrzucamy zgadywanki satelity gorsze niż 25m
            if (accuracy > 25) return;

            if (walkData.positions.length > 0) {
                const lastPos = walkData.positions[walkData.positions.length - 1];
                const dist = getDistanceFromLatLonInKm(lastPos.lat, lastPos.lng, latitude, longitude);
                
                // 2. FILTR PRĘDKOŚCIOWY I DYSTANSOWY
                const timeDiffHours = (now - lastPos.time) / 3600000; 
                
                if (timeDiffHours > 0) {
                    const speedKmH = dist / timeDiffHours;
                    
                    // Akceptujemy punkt gdy:
                    // A) Zrobiłeś minimum 3 metry kroku (0.003 km)
                    // B) Prędkość < 15 km/h (Brak aut, brak "teleportacji" pod blokami)
                    if (dist > 0.003 && speedKmH < 15) { 
                        walkData.distanceKm += dist;
                        walkData.positions.push({ lat: latitude, lng: longitude, time: now });
                        
                        // 🔥 DODAJEMY ZAAKCEPTOWANY PUNKT DO RYSOWANEJ LINII
                        if (activePolyline) {
                            activePolyline.addLatLng([latitude, longitude]);
                        }
                        
                        // Aktualizacja licznika "KM" na ekranie na żywo
                        const distCounter = document.getElementById('walk-distance-counter');
                        if (distCounter) {
                            distCounter.innerText = walkData.distanceKm.toFixed(2) + " km";
                        }
                    }
                }
            } else {
                // To jest pierwszy, startowy punkt po kliknięciu Start
                walkData.positions.push({ lat: latitude, lng: longitude, time: now });
                if (activePolyline) {
                    activePolyline.addLatLng([latitude, longitude]);
                }
            }
        },
        (error) => {
            console.warn("GPS wstrzymany lub zgubił zasięg:", error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
}

// KONIEC SPACERU
export async function stopWalkTracker() {
    if (!walkData.isActive) return;
    
    navigator.geolocation.clearWatch(watchId);
    await releaseWakeLock(); 
    walkData.isActive = false;
    
    // 🔥 ZWIJAMY NARYSOWANĄ LINIĘ Z MAPY
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
    
    // Zapisujemy w bazie wyłącznie spacery powyżej 50 metrów (0.05 km)
    if (currentUid && finalDistance > 0.05) { 
        try {
            // Zostawiamy co 5 punkt, żeby oszczędzać miejsce w bazie
            const simplifiedPath = walkData.positions.filter((_, index) => index % 5 === 0);

            // Zapis historii na potrzeby tablicy/feedów
            await db.collection('walks').add({
                dogId: currentUid,
                distanceKm: finalDistance,
                durationMinutes: durationMins,
                path: simplifiedPath,
                timestamp: fb.firestore.FieldValue.serverTimestamp()
            });
            
            // +1 do dziennika paska postępu
            const today = new Date().toISOString().split('T')[0];
            await db.collection('users').doc(currentUid).collection('daily_care').doc(today).set({
                walk: fb.firestore.FieldValue.increment(1),
                lastUpdated: fb.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // Zsumowanie dystansu (Ożywia System Rang i statystyki)
            await db.collection('users').doc(currentUid).set({
                walkCount: fb.firestore.FieldValue.increment(1),
                totalDistance: fb.firestore.FieldValue.increment(finalDistance)
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
