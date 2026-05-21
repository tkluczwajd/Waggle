import { initMap, mapManager } from '../modules/map/mapManager.js';

export function setupMap() {
    initMap();
    return mapManager.map;
}
