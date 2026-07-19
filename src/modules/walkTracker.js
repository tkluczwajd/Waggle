// src/modules/walkTracker.js
import { db, fb, auth } from '../core/firebase.js';

let watchId = null;
let walkData = {
    positions: [],
    distanceKm: 0,
    startTime: null,
    isActive: false
};

// Formuła Haversine'a: Oblicza odległość w linii prostej na kuli ziemskiej
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Promień Ziemi w kilometrach
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

// START SPACERU
export function startWalkTracker() {
    if (walkData.isActive) return;

    walkData = { positions: [], distanceKm: 0, startTime: Date.now(), isActive: true };
    
    if (window.Waggle && window.Waggle.showToast) {
        window.Waggle.showToast("🐕 Spacer rozpoczęty! Zbieram sygnał GPS...");
    }

    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            
            // Ignorujemy skrajnie niedokładne odczyty (np. z masztów GSM)
            if (accuracy > 50) return;

            if (walkData.positions.length > 0) {
                const lastPos = walkData.positions[walkData.positions.length - 1];
                const dist = getDistanceFromLatLonInKm(lastPos.lat, lastPos.lng, latitude, longitude);
                
                // Filtrujemy szum: dodajemy dystans tylko, jeśli przeszedłeś od 5 do 200 metrów od ostatniego punktu
                if (dist > 0.005 && dist < 0.2) { 
                    walkData.distanceKm += dist;
                }
            }
            
            walkData.positions.push({ lat: latitude, lng: longitude, time: Date.now() });

            // Wyświetlanie dystansu na żywo w interfejsie
            const distCounter = document.getElementById('walk-distance-counter');
            if (distCounter) {
                distCounter.innerText = walkData.distanceKm.toFixed(2) + " km";
            }
        },
        (error) => {
            console.warn("GPS wstrzymany lub zgubił zasięg:", error);
        },
        // Wymuszamy wysoką dokładność i zakazujemy używania cache'u dla GPS
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
}

// KONIEC SPACERU
export async function stopWalkTracker() {
    if (!walkData.isActive) return;
    
    navigator.geolocation.clearWatch(watchId);
    walkData.isActive = false;
    
    const durationMs = Date.now() - walkData.startTime;
    const durationMins = Math.round(durationMs / 60000);
    const finalDistance = parseFloat(walkData.distanceKm.toFixed(2));
    
    if (window.Waggle && window.Waggle.showToast) {
        window.Waggle.showToast(`🏁 Koniec spaceru! Dystans: ${finalDistance} km`);
    }

    const currentUid = localStorage.getItem('activeDogId') || (auth.currentUser ? auth.currentUser.uid : null);
    
    // Zapisujemy tylko jeśli spacer miał min. 50 metrów (0.05 km)
    if (currentUid && finalDistance > 0.05) { 
        try {
            // Upraszczamy ścieżkę do bazy: zostawiamy co 5 punkt, żeby zaoszczędzić miejsce w dokumencie
            const simplifiedPath = walkData.positions.filter((_, index) => index % 5 === 0);

            // 1 operacja: Zapis pełnej historii spaceru (do rysowania tras w przyszłości)
            await db.collection('walks').add({
                dogId: currentUid,
                distanceKm: finalDistance,
                durationMinutes: durationMins,
                path: simplifiedPath,
                timestamp: fb.firestore.FieldValue.serverTimestamp()
            });
            
            // 2 operacja: Dodanie "+1" do dziennych statystyk na głównym ekranie (Paski postępu)
            const today = new Date().toISOString().split('T')[0];
            await db.collection('users').doc(currentUid).collection('daily_care').doc(today).set({
                walk: fb.firestore.FieldValue.increment(1),
                lastUpdated: fb.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // 🔥 3 operacja (NOWA): Dodanie statystyk do profilu głównego, aby górny pasek je wyświetlił
            await db.collection('users').doc(currentUid).set({
                walkCount: fb.firestore.FieldValue.increment(1),
                totalDistance: fb.firestore.FieldValue.increment(finalDistance)
            }, { merge: true });

        } catch (err) {
            console.error("Błąd zapisu spaceru:", err);
            if (window.Waggle && window.Waggle.showToast) window.Waggle.showToast("❌ Błąd zapisu spaceru.");
        }
    } else if (currentUid && finalDistance <= 0.05) {
        // 🔥 Powiadomienie, gdy użytkownik zrobi krok i wyłączy spacer
        if (window.Waggle && window.Waggle.showToast) {
            window.Waggle.showToast("Zbyt krótki dystans (<50m), aby zapisać spacer w statystykach.");
        }
    }
}
