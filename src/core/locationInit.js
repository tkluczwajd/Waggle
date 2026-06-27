// src/core/locationInit.js
import { appState as state } from './state.js';
import { db } from './firebase.js';
import { updateUserMarker } from '../ui/uiHelpers.js'; // 🔥 TUTAJ JEST POPRAWIONY IMPORT!

// Funkcja matematyczna do obliczania dystansu dla Throttlingu zapisu spacerów
function getDistanceInMeters(lat1, lng1, lat2, lng2) {
    const R = 6371e3; const phi1 = lat1 * Math.PI / 180; const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180; const deltaLambda = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); return R * c;
}

export function setupLocationTracking(onFirstFix) {
    if (!("geolocation" in navigator)) return;

    let lastFirebaseUploadTime = 0;
    let lastUploadedCoords = { lat: null, lng: null };

    navigator.geolocation.watchPosition(pos => {
        const lat = pos.coords.latitude; 
        const lng = pos.coords.longitude;
        
        // 🔥 WAGGLE V2: Zapisujemy "czarną skrzynkę" przy każdym nowym odczycie GPS!
        if (window.Waggle && window.Waggle.saveCheckpoint) {
            window.Waggle.saveCheckpoint(pos.coords);
        }

        const isFirstFix = !state.location.lat; 
        
        state.location.lat = lat; 
        state.location.lng = lng;

        // ... reszta Twojego kodu bez zmian ...

        // Jeśli to pierwszy sygnał GPS, uruchamiamy mapę i resztę aplikacji (callback z appBootstrap)
        if (isFirstFix) onFirstFix(lat, lng);

        // 🔥 Logika śledzenia spaceru i oszczędzania zapytań do Firebase
        if (state.isWalking && state.user && !state.isHiddenMode) {
            let uLat = lat; let uLng = lng; 
            if (state.isGhostMode && state.ghostOffset) { 
                uLat += state.ghostOffset.lat; 
                uLng += state.ghostOffset.lng; 
            }
            
            const now = Date.now();
            const timePassed = (now - lastFirebaseUploadTime) / 1000;
            let shouldUpload = false;
            
            if (!lastUploadedCoords.lat) shouldUpload = true;
            else {
                const distanceMoved = getDistanceInMeters(lastUploadedCoords.lat, lastUploadedCoords.lng, uLat, uLng);
                // Uploadujemy do bazy tylko co 30 sekund lub gdy pies przeszedł 25 metrów
                if (timePassed >= 30 || distanceMoved >= 25) shouldUpload = true;
            }

            if (shouldUpload) {
                db.collection("walks").doc(state.user.uid).set({ 
                    uid: state.user.uid, 
                    name: state.profile?.name || "Piesek", 
                    avatar: state.profile?.avatar || "", 
                    lat: uLat, 
                    lng: uLng, 
                    timestamp: now 
                }, { merge: true });
                
                lastFirebaseUploadTime = now; 
                lastUploadedCoords = { lat: uLat, lng: uLng };
            }
        }
        
        // Aktualizacja znacznika na mapie (korzysta z poprawionego importu z uiHelpers)
        if(!state.isHiddenMode) updateUserMarker(lat, lng);
        
    }, err => console.log("Czekam na GPS..."), { enableHighAccuracy: true });
}
