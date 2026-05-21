import { appState as state } from './state.js';
import { db } from './firebase.js';
import { updateUserMarker } from './appBootstrap.js'; // Uwaga: będziesz musiał wyeksportować tę funkcję

export function setupLocationTracking(onFirstFix) {
    if (!("geolocation" in navigator)) return;

    let lastFirebaseUploadTime = 0;
    let lastUploadedCoords = { lat: null, lng: null };

    navigator.geolocation.watchPosition(pos => {
        const lat = pos.coords.latitude; 
        const lng = pos.coords.longitude;
        const isFirstFix = !state.location.lat; 
        state.location.lat = lat; 
        state.location.lng = lng;

        if (isFirstFix) onFirstFix(lat, lng);

        // Logika śledzenia spaceru
        if (state.isWalking && state.user && !state.isHiddenMode) {
             // ... [Tutaj wklej logikę uploadu z dotychczasowego bootstrapa] ...
        }
        
        if(!state.isHiddenMode) updateUserMarker(lat, lng);
    }, err => console.log("Czekam na GPS..."), { enableHighAccuracy: true });
}
