// src/modules/map/mapManager.js
import { appState as state } from '../../core/state.js';
import { eventBus } from '../../core/eventBus.js';

class MapManager {
    constructor() {
        this.map = null;
        this.layers = {};
    }

    init(containerId) {
        if (state.map.instance) {
            console.warn("🗺️ Mapa już istnieje, przerywam inicjalizację.");
            return;
        }

        if (!window.L) {
            console.error("Leaflet nie został wczytany!");
            return;
        }

        const L = window.L;

        this.map = L.map(containerId, { zoomControl: false });
        state.map.instance = this.map;
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(this.map);

        this.layers = {
            user: L.layerGroup().addTo(this.map),
            walks: L.layerGroup().addTo(this.map),
            alerts: L.layerGroup().addTo(this.map),
            // 🔥 TRIK: Usuwamy .addTo(this.map) z warstwy parks. Choinki znikną!
            parks: L.layerGroup() 
        };

       console.log("🗺️ Map ready", this.map);
        // 🔥 Emitujemy sygnał, że mapa wstała i można centrować
        eventBus.emit('MAP_READY', this.map);
    } // koniec funkcji init

    // 🔥 NOWOŚĆ: Funkcja aktualizująca puls na żywo
    updatePulse() {
        const pulseWidget = document.getElementById('mapPulsCount');
        if (pulseWidget && this.layers.walks) {
            // Zlicza ile znaczników spacerów jest obecnie w warstwie
            const activeDogs = this.layers.walks.getLayers().length;
            pulseWidget.innerText = activeDogs;
        }
    }

    addMarkerToLayer(layerName, marker) {
        if (this.layers[layerName]) {
            marker.addTo(this.layers[layerName]);
            if (layerName === 'walks') this.updatePulse(); // Aktualizuj po dodaniu
        }
    }

    removeMarkerFromLayer(layerName, marker) {
        if (this.layers[layerName]) {
            this.layers[layerName].removeLayer(marker);
            if (layerName === 'walks') this.updatePulse(); // Aktualizuj po usunięciu
        }
    }

    clearLayer(layerName) {
        if (this.layers[layerName]) {
            this.layers[layerName].clearLayers();
            if (layerName === 'walks') this.updatePulse();
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
            console.log("🗺️ Map resized");
        }
    }
}

export const mapManager = new MapManager();

export function initMap() {
    mapManager.init('map');
    console.log("📍 Mapa gotowa.");
}
