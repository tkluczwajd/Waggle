// src/services/parksService.js
import { getDistance } from './geolocationService.js';

export async function fetchNearbyParks(lat, lng) {
    console.log("🌍 OSM START", lat, lng);

    const query = `
[out:json][timeout:20];
(
    node["leisure"="dog_park"](around:15000,${lat},${lng});
    way["leisure"="dog_park"](around:15000,${lat},${lng});
    relation["leisure"="dog_park"](around:15000,${lat},${lng});

    node["leisure"="park"](around:12000,${lat},${lng});
    way["leisure"="park"](around:12000,${lat},${lng});
    relation["leisure"="park"](around:12000,${lat},${lng});

    way["natural"="wood"](around:15000,${lat},${lng});
    way["landuse"="forest"](around:15000,${lat},${lng});
    relation["natural"="wood"](around:15000,${lat},${lng});
    relation["landuse"="forest"](around:15000,${lat},${lng});
);
out geom;
`;

    try {
        const response = await fetch(
            `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
        );

        console.log("🌍 OSM STATUS:", response.status);

        if (!response.ok) {
            throw new Error(`OSM ${response.status}`);
        }

        const data = await response.json();
        console.log("🌳 OSM ELEMENTS:", data?.elements?.length || 0);

        if (!data || !data.elements || data.elements.length === 0) {
            console.warn("⚠️ OSM pusty → fallback");
            return [];
        }

        const places = [];
        const seen = new Set();
        
        // Pamięć dla geometrii sposobów i relacji
        const wayGeometries = {};
        const relations = [];

        // PAS 1: Zbieramy geometrię sposobów i relacje
        data.elements.forEach(el => {
            if (el.type === 'way' && el.geometry && el.geometry.length > 0) {
                wayGeometries[el.id] = el.geometry.map(point => [point.lat, point.lon]);
            } else if (el.type === 'relation') {
                relations.push(el);
            }
        });

        // PAS 2: Przetwarzamy wszystkie elementy
        data.elements.forEach(el => {
            // Środek dla markerów/listy odległości
            const eLat = el.lat || (el.bounds ? (el.bounds.minlat + el.bounds.maxlat) / 2 : null);
            const eLng = el.lon || (el.bounds ? (el.bounds.minlon + el.bounds.maxlon) / 2 : null);
            
            let geometry = null;
            let isMultiPolygon = false; 

            if (el.type === 'way' && wayGeometries[el.id]) {
                geometry = wayGeometries[el.id];
            } else if (el.type === 'relation') {
                // ZBIERAMY GEOMETRIĘ DLA RELACJI (MULTI-POLYGON)
                if (el.members && el.members.length > 0) {
                    const multiCoords = [];
                    el.members.forEach(member => {
                        if (member.type === 'way' && wayGeometries[member.ref]) {
                            multiCoords.push(wayGeometries[member.ref]);
                        }
                    });
                    if (multiCoords.length > 0) {
                        geometry = multiCoords;
                        isMultiPolygon = true; 
                    }
                }
            }
            
            if (!eLat || !eLng || !el.tags) return;

            // DEDUPLIKACJA
            const key = Math.round(eLat * 10000) + "_" + Math.round(eLng * 10000);
            if (seen.has(key)) return;
            seen.add(key);

            const isDogPark = el.tags.leisure === 'dog_park';
            const isForest = el.tags.natural === 'wood' || el.tags.landuse === 'forest';
            const isNamedPark = el.tags.leisure === 'park' && !!el.tags.name;

            // FILTR JAKOŚCI (Wycinamy nienazwane, małe skwerki)
            if (el.tags.leisure === 'park' && !isNamedPark) return;

            const name = el.tags.name || (isDogPark ? "Wybieg dla psów" : isForest ? "Teren leśny" : "Park");
            const dist = getDistance(lat, lng, eLat, eLng);
            
            places.push({
                name,
                distance: dist,
                lat: eLat,
                lng: eLng,
                isDogPark: isDogPark,
                type: isDogPark ? 'dogpark' : isForest ? 'forest' : 'park',
                geometry: geometry, // Może być pojedynczym ringiem lub tablicą ringów (Multi)
                isMultiPolygon: isMultiPolygon // 🔥 Przekazujemy flagę
            });
        });

        // ===== ZARZĄDZANIE STREFAMI (ZONES) DLA LISTY =====
        const dogParks = places.filter(p => p.type === 'dogpark').sort((a,b) => a.distance - b.distance);
        const allGreenery = places.filter(p => p.type !== 'dogpark').sort((a,b) => a.distance - b.distance);

        const zone1 = allGreenery.filter(p => p.distance <= 4).slice(0, 12);
        const zone2 = allGreenery.filter(p => p.distance > 4 && p.distance <= 9).slice(0, 12);
        const zone3 = allGreenery.filter(p => p.distance > 9).slice(0, 12);

        const finalPlaces = [
            ...dogParks,
            ...zone1,
            ...zone2,
            ...zone3
        ];

        return finalPlaces.slice(0, 50);

    } catch (error) {
        console.error("❌ OSM ERROR:", error);
        return [];
    }
}
