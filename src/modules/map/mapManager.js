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
            parks: L.layerGroup(),
            // 🔥 NOWOŚĆ: Warstwa na wyrysowane, historyczne trasy
            history: L.layerGroup().addTo(this.map) 
        };

       console.log("🗺️ Map ready", this.map);
        // 🔥 Emitujemy sygnał, że mapa wstała i można centrować
        eventBus.emit('MAP_READY', this.map);
    } 

    // Funkcja aktualizująca puls na żywo
    updatePulse() {
        const pulseWidget = document.getElementById('mapPulsCount');
        if (pulseWidget && this.layers.walks) {
            const activeDogs = this.layers.walks.getLayers().length;
            pulseWidget.innerText = activeDogs;
        }
    }

    addMarkerToLayer(layerName, marker) {
        if (this.layers[layerName]) {
            marker.addTo(this.layers[layerName]);
            if (layerName === 'walks') this.updatePulse(); 
        }
    }

    removeMarkerFromLayer(layerName, marker) {
        if (this.layers[layerName]) {
            this.layers[layerName].removeLayer(marker);
            if (layerName === 'walks') this.updatePulse(); 
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

    // ==========================================
    // 🔥 RYSOWANIE HISTORYCZNEJ TRASY (KONSULTANT ZADANIE 10)
    // ==========================================
    drawHistoricalPath(pathArray) {
        if (!this.map || !window.L || !pathArray || pathArray.length === 0) return;

        // Czyścimy poprzednią wyrysowaną trasę z mapy
        if (this.layers.history) {
            this.layers.history.clearLayers();
        }

        // Konwertujemy obiekty JSON {lat, lng} na format Leafleta [lat, lng]
        const latLngs = pathArray.map(point => [point.lat, point.lng]);

        // Rysujemy piękną linię (używamy jasnoniebieskiego koloru by odróżnić od "aktywnego" spaceru)
        const polyline = window.L.polyline(latLngs, {
            color: '#3498db', 
            weight: 6,
            opacity: 0.9,
            lineJoin: 'round'
        }).addTo(this.layers.history);

        // Automatyczne dopasowanie kamery do granic trasy!
        this.map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }

    clearHistoricalPath() {
        if (this.layers.history) {
            this.layers.history.clearLayers();
        }
    }
}

export const mapManager = new MapManager();

export function initMap() {
    mapManager.init('map');
    console.log("📍 Mapa gotowa.");
}
