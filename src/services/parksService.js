import { getDistance } from './geolocationService.js';

export async function fetchNearbyParks(lat, lng) {
    console.log("🌍 OSM START", lat, lng);

    // 🔥 ZMIANA 1: Żądamy 'out geom', by odzyskać kształty terenów zielonych
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

        const places = [];
        const seen = new Set();

        (data.elements || []).forEach(el => {
            // Środek dla markerów/listy odległości
            const eLat = el.lat || (el.bounds ? (el.bounds.minlat + el.bounds.maxlat) / 2 : null);
            const eLng = el.lon || (el.bounds ? (el.bounds.minlon + el.bounds.maxlon) / 2 : null);
            
            // 🔥 ZMIANA 2: Wyciągamy tablicę koordynatów do obrysowania poligonu
            let geometry = null;
            if (el.geometry && el.geometry.length > 0) {
                // Mapujemy [{lat, lon}] na formę akceptowaną przez Leaflet [[lat, lng]]
                geometry = el.geometry.map(point => [point.lat, point.lon]);
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
                geometry: geometry // Przekazujemy kształt do frontendu!
            });
        });

        if (places.length === 0) {
            console.warn("⚠️ OSM pusty → fallback");
            return [];
        }

        // 🔥 Usunąłem sztuczne klastrowanie lasów - nie jest już potrzebne, bo rysujemy faktyczne obszary, a nie ikonki!

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
