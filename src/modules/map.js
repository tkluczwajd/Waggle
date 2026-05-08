import { appState as state, setState } from '../core/state.js';
import { db } from '../core/firebase.js';
import { mapManager } from './map/mapManager.js';
import { registerListener } from '../core/listeners.js';

import { subscribeToWalks } from '../services/walkService.js';
import { renderWalks } from './map/walksRenderer.js';
import { subscribeToAlerts } from '../services/alerts/alertsService.js';
import { renderAlerts } from './alerts/alertsRenderer.js';
import { fetchNearbyParks } from '../services/parks/parksService.js';
import { renderParksOnMap } from './map/parksRenderer.js';

let myMarker = null;
let parksLoaded = false;
export let nearbyPlaces = []; 

// FUNKCJA DO OBSŁUGI POZYCJI (Zdefiniowana poza init, aby centerOnMe mogło z niej korzystać)
function handleLocationUpdate(latitude, longitude) {
    setState('location.lat', latitude);
    setState('location.lng', longitude);

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
        if (state.isGhostMode) {
            db.collection("walks").doc(state.user.uid).delete().catch(() => {});
        } else {
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
}

export function initMap() {
    if (state.map?.instance) return;

    const L = window.L;
    mapManager.init('map', 52.2, 21.0, 13);
    setState('map.instance', mapManager);

    // SYSTEM LOKALIZACJI
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
            pos => handleLocationUpdate(pos.coords.latitude, pos.coords.longitude), 
            err => {
                console.warn("Błąd GPS:", err.message);
                if (err.code === 1) window.Waggle.showToast("Zablokowałeś lokalizację. Odblokuj ją w ustawieniach kłódki!");
                else window.Waggle.showToast("Problem z GPS... Używam Warszawy jako fallbacku.");
                handleLocationUpdate(52.2297, 21.0122); 
            }, 
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
        );
    }

    const walksUnsub = subscribeToWalks(walks => renderWalks(walks));
    registerListener(walksUnsub);

    const alertsUnsub = subscribeToAlerts(alerts => renderAlerts(alerts));
    registerListener(alertsUnsub);
}

export function centerOnMe() {
    setState('location.following', true);
    if (state.location.lat && state.location.lng) {
        mapManager.flyTo(state.location.lat, state.location.lng, 15);
    } else {
        window.Waggle.showToast("Szukam sygnału GPS... 🛰️");
        navigator.geolocation.getCurrentPosition(
            pos => handleLocationUpdate(pos.coords.latitude, pos.coords.longitude),
            err => window.Waggle.showToast("Nadal nie mogę znaleźć GPS.")
        );
    }
}

export function centerOnTarget(lat, lng) {
    setState('location.following', false);
    mapManager.flyTo(lat, lng, 16);
    const mapBtn = document.querySelector('.nav-item[data-view="map"]');
    if(mapBtn) mapBtn.click();
}
