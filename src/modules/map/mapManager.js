// Usuwamy: import L from 'leaflet';
// Leaflet jest dostępny globalnie jako window.L

export class MapManager {
    constructor() {
        this.map = null;
        this.layers = {};
    }

    init(containerId, lat = 52.2, lng = 21.0, zoom = 13) {
        if (this.map) return;
        
        // Pobieramy Leafleta z obiektu window
        const L = window.L;
        
        this.map = L.map(containerId, { zoomControl: false }).setView([lat, lng], zoom);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(this.map);
        
        this.layers = {
            user: L.layerGroup().addTo(this.map),
            walks: L.layerGroup().addTo(this.map),
            alerts: L.layerGroup().addTo(this.map),
            parks: L.layerGroup().addTo(this.map)
        };
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
        if (this.map) this.map.invalidateSize();
    }
}

export const mapManager = new MapManager();
