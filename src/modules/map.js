import { appState as state, setState } from '../core/state.js';
import { db } from '../core/firebase.js';
import { mapManager } from './map/mapManager.js';
import { registerListener } from '../core/listeners.js';
import { eventBus } from '../core/eventBus.js';

import { subscribeToWalks } from '../services/walkService.js';
import { renderWalks } from './map/walksRenderer.js';
import { subscribeToAlerts } from '../services/alerts/alertsService.js';
import { renderAlerts } from './alerts/alertsRenderer.js';
import { fetchNearbyParks } from '../services/parks/parksService.js';
import { renderParksOnMap } from './map/parksRenderer.js';

let myMarker = null;
let parksLoaded = false;
export let nearbyPlaces = []; 

function handleLocationUpdate(latitude, longitude) {
    setState('location.lat', latitude);
    setState('location.lng', longitude);
    
    eventBus.emit('locationUpdated', { lat: latitude, lng: longitude });

    const myAvatarSrc = state.profile?.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';
    const myIcon = L.divIcon({
        className: '',
        html: `<div style="width:50px;height:50px;border-radius:50%;border:3px solid var(--secondary);box-shadow: 0 0 20px var(--secondary);overflow:hidden;background:white;"><img src="${myAvatarSrc}" style="width:100%;height:100%;object-fit:cover;"></div>`,
        iconSize: [50, 50]
    });

    if (!myMarker) {
        myMarker = L.marker([latitude, longitude], { icon: myIcon, zIndexOffset: 1000 });
        mapManager.addMarkerToLayer('user', myMarker);
        mapManager.flyTo(latitude, longitude, 15);

        if (!parksLoaded) {
            fetchNearbyParks(latitude, longitude).then(places => {
                nearbyPlaces = places;
                renderParksOnMap(places);
                if (window.Waggle?.renderPlaces) window.Waggle.renderPlaces();
                parksLoaded = true;
            });
        }
    } else {
        myMarker.setLatLng([latitude, longitude]).setIcon(myIcon);
    }

    if(state.location.following) mapManager.panTo(latitude, longitude);

    if (state.isWalking && state.user) {
        if (state.isHiddenMode) {
            db.collection("walks").doc(state.user.uid).delete().catch(() => {});
        } else {
            let latToSave = latitude;
            let lngToSave = longitude;
            
            if (state.isGhostMode) {
                if (!state.ghostOffset) {
                    state.ghostOffset = { lat: (Math.random() - 0.5) * 0.006, lng: (Math.random() - 0.5) * 0.006 };
                }
                latToSave += state.ghostOffset.lat;
                lngToSave += state.ghostOffset.lng;
            }

            db.collection("walks").doc(state.user.uid).set({
                uid: state.user.uid,
                name: state.profile?.name || "Piesek",
                avatar: state.profile?.avatar || "",
                lat: latToSave,
                lng: lngToSave,
                timestamp: Date.now()
            }, { merge: true });
        }
    }
}

export function initMap() {
    if (state.map?.instance) return;

    mapManager.init('map', 52.2, 21.0, 13);
    setState('map.instance', mapManager);

    // DODANO: Wyłączenie auto-śledzenia, gdy użytkownik sam przesuwa mapę palcem
    if (mapManager.map) {
        mapManager.map.on('dragstart', () => {
            setState('location.following', false);
        });
    }

    if ("geolocation" in navigator) {
        // Twardy strzał przy starcie (wymusza pobranie lokalizacji bez klikania)
        navigator.geolocation.getCurrentPosition(
            pos => handleLocationUpdate(pos.coords.latitude, pos.coords.longitude),
            err => console.warn("Początkowy błąd GPS:", err.message),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        // Startujemy ciągły nasłuch w tle
        navigator.geolocation.watchPosition(
            pos => handleLocationUpdate(pos.coords.latitude, pos.coords.longitude), 
            err => {
                console.warn("Błąd GPS (w tle):", err.message);
                if (!state.location.lat) handleLocationUpdate(52.2297, 21.0122); 
            }, 
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
        );
    } else {
        window.Waggle.showToast("Przeglądarka nie obsługuje GPS!");
    }

// Nasłuchy VIP - nie dodajemy ich do "niszczarki" (registerListener)
    // Dzięki temu śledzą innych graczy i alerty przez cały czas działania apki!
    subscribeToWalks(walks => renderWalks(walks));
    subscribeToAlerts(alerts => renderAlerts(alerts));
}
export function centerOnMe() {
    setState('location.following', true);
    if ("geolocation" in navigator) {
        window.Waggle.showToast("Szukam sygnału GPS... 🛰️");
        navigator.geolocation.getCurrentPosition(
            pos => {
                handleLocationUpdate(pos.coords.latitude, pos.coords.longitude);
                mapManager.flyTo(pos.coords.latitude, pos.coords.longitude, 16);
            },
            err => {
                console.warn("Twardy błąd GPS:", err);
                if (err.code === 1) window.Waggle.showToast("GPS zablokowany! (Brak uprawnień lub HTTPS)");
                else window.Waggle.showToast("Słaby sygnał GPS. Spróbuj na zewnątrz.");
                if (state.location.lat) mapManager.flyTo(state.location.lat, state.location.lng, 15);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    }
}

export function centerOnTarget(lat, lng) {
    setState('location.following', false);
    mapManager.flyTo(lat, lng, 16);
    const mapBtn = document.querySelector('.nav-item[data-view="map"]');
    if(mapBtn) mapBtn.click();
}
