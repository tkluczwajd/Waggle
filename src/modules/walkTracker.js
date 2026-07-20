// src/modules/walkTracker.js
import { db, fb, auth } from '../core/firebase.js';

let watchId = null;
let wakeLock = null; // Zabezpieczenie przed uśpieniem GPS przez telefon
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

// Blokada ekranu, by system nie "ubił" GPS-a w kieszeni
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
    await requestWakeLock(); // Odpalamy blokadę uśpienia
    
    if (window.Waggle && window.Waggle.showToast) {
        window.Waggle.showToast("🐕 Spacer rozpoczęty! Zbieram sygnał GPS...");
    }

    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const now = Date.now();
            
            // 1. ZAOSTRZONY RYGOR: Odrzucamy punkty z dokładnością gorszą niż 25 metrów 
            // (Blokujemy "skoki" wywołane odbiciem od bloków)
            if (accuracy > 25) return;

            if (walkData.positions.length > 0) {
                const lastPos = walkData.positions[walkData.positions.length - 1];
                const dist = getDistanceFromLatLonInKm(lastPos.lat, lastPos.lng, latitude, longitude);
                
                // 2. FILTR PRĘDKOŚCIOWY: Czas w godzinach
                const timeDiffHours = (now - lastPos.time) / 3600000; 
                
                // Zabezpieczenie przed dzieleniem przez 0
                if (timeDiffHours > 0) {
                    const speedKmH = dist / timeDiffHours;
                    
                    // Akceptujemy dystans TYLKO jeśli:
                    // A) Jest większy niż 3 metry (0.003 km)
                    // B) Prędkość jest mniejsza niż 15 km/h (odrzucamy jazdę autem i błędy GPS)
                    if (dist > 0.003 && speedKmH < 15) { 
                        walkData.distanceKm += dist;
                        walkData.positions.push({ lat: latitude, lng: longitude, time: now });
                        
                        const distCounter = document.getElementById('walk-distance-counter');
                        if (distCounter) {
                            distCounter.innerText = walkData.distanceKm.toFixed(2) + " km";
                        }
                    }
                }
            } else {
                // Pierwszy punkt
                walkData.positions.push({ lat: latitude, lng: longitude, time: now });
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
    await releaseWakeLock(); // Zwalniamy blokadę uśpienia
    walkData.isActive = false;
    
    const durationMs = Date.now() - walkData.startTime;
    const durationMins = Math.round(durationMs / 60000);
    const finalDistance = parseFloat(walkData.distanceKm.toFixed(2));
    
    if (window.Waggle && window.Waggle.showToast) {
        window.Waggle.showToast(`🏁 Koniec spaceru! Dystans: ${finalDistance} km`);
    }

    const currentUid = localStorage.getItem('activeDogId') || (auth.currentUser ? auth.currentUser.uid : null);
    
    // 🔥 UWAGA: Wymagany minimum 50 metrów (0.05 km) do zapisania w bazie!
    if (currentUid && finalDistance > 0.05) { 
        try {
            const simplifiedPath = walkData.positions.filter((_, index) => index % 5 === 0);

            // 1. Zapis śladu GPS do bazy
            await db.collection('walks').add({
                dogId: currentUid,
                distanceKm: finalDistance,
                durationMinutes: durationMins,
                path: simplifiedPath,
                timestamp: fb.firestore.FieldValue.serverTimestamp()
            });
            
            // 2. Dodanie +1 do dziennika (Paski postępu w "Codziennej opiece")
            const today = new Date().toISOString().split('T')[0];
            await db.collection('users').doc(currentUid).collection('daily_care').doc(today).set({
                walk: fb.firestore.FieldValue.increment(1),
                lastUpdated: fb.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // 3. Aktualizacja globalnych statystyk profilu (Górny pasek: ilość spacerów i łączne KM)
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
