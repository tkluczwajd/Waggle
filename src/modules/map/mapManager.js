// src/modules/map/mapManager.js
import { appState as state } from '../../core/state.js';

class MapManager {
    constructor() {
        this.map = null;
        this.layers = {};
    }

    init(containerId) {
        // 🔥 Defensive Check (Konsultant: Singelton pattern / Single Source of Truth)
        if (state.map.instance) {
            console.warn("🗺️ Mapa już istnieje, przerywam inicjalizację.");
            return;
        }

        // 🔥 Defensive Check (Konsultant: Czy Leaflet załadowany?)
        if (!window.L) {
            console.error("Leaflet nie został wczytany!");
            return;
        }

        this.map = L.map(containerId, { zoomControl: false });
        state.map.instance = this.map;
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(this.map);

        // Inicjalizacja warstw
        this.layers = {
            user: L.layerGroup().addTo(this.map),
            walks: L.layerGroup().addTo(this.map),
            alerts: L.layerGroup().addTo(this.map),
            parks: L.layerGroup().addTo(this.map)
        };

        // 🔥 Map health log (Konsultant: Oszczędza godziny debugowania)
        console.log("🗺️ Map ready", this.map);
    }

    addMarkerToLayer(layerName, marker) {
        if (this.layers[layerName]) {
            marker.addTo(this.layers[layerName]);
        }
    }

    removeMarkerFromLayer(layerName, marker) {
        if (this.layers[layerName]) {
            this.layers[layerName].removeLayer(marker);
        }
    }

    clearLayer(layerName) {
        if (this.layers[layerName]) {
            this.layers[layerName].clearLayers();
        }
    }

    flyTo(lat, lng, zoom = 15) {
        if (this.map) this.map.flyTo([lat, lng], zoom);
    }
    
    panTo(lat, lng) {
        if (this.map) this.map.panTo([lat, lng]);
    }

    invalidateSize() {
        if (this.map) {
            this.map.invalidateSize(true);
            // 🔥 Map health log
            console.log("🗺️ Map resized");
        }
    }
}

// Eksportujemy jedną, wspólną instancję (Singleton)
export const mapManager = new MapManager();

// Eksportujemy funkcję inicjującą, którą wołasz w appBootstrap
export function initMap() {
    mapManager.init('map');
    console.log("📍 Mapa gotowa.");
}
