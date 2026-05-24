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
        
        const wayGeometries = {};
        const relations = [];

        // PAS 1: Zbieramy geometrię obszarów
        data.elements.forEach(el => {
            if (el.type === 'way' && el.geometry && el.geometry.length > 0) {
                wayGeometries[el.id] = el.geometry.map(point => [point.lat, point.lon]);
            } else if (el.type === 'relation') {
                relations.push(el);
            }
        });

        // PAS 2: Przetwarzamy elementy
        data.elements.forEach(el => {
            let geometry = null;
            let isMultiPolygon = false; 

            if (el.type === 'way' && wayGeometries[el.id]) {
                geometry = wayGeometries[el.id];
            } else if (el.type === 'relation') {
                if (el.members && el.members.length > 0) {
                    const multiCoords = [];
                    el.members.forEach(member => {
                        // 🔥 POPRAWKA: Szukamy geometrii schowanej głęboko wewnątrz 'member' (Multi-Polygon)
                        if (member.type === 'way') {
                            if (member.geometry && member.geometry.length > 0) {
                                multiCoords.push(member.geometry.map(pt => [pt.lat, pt.lon]));
                            } else if (wayGeometries[member.ref]) {
                                multiCoords.push(wayGeometries[member.ref]);
                            }
                        }
                    });
                    if (multiCoords.length > 0) {
                        geometry = multiCoords;
                        isMultiPolygon = true; 
                    }
                }
            }
            
            if (!el.tags) return; 

            // Obliczanie "środka" do mierzenia odległości
            let eLat = el.lat || el.center?.lat || (el.bounds ? (el.bounds.minlat + el.bounds.maxlat) / 2 : null);
            let eLng = el.lon || el.center?.lon || (el.bounds ? (el.bounds.minlon + el.bounds.maxlon) / 2 : null);

            if (!eLat && geometry && geometry.length > 0) {
                try {
                    if (isMultiPolygon && geometry[0].length > 0) {
                        eLat = geometry[0][0][0];
                        eLng = geometry[0][0][1];
                    } else if (!isMultiPolygon) {
                        eLat = geometry[0][0];
                        eLng = geometry[0][1];
                    }
                } catch (e) {
                    console.warn("Błąd wyciągania współrzędnych brzegowych", e);
                }
            }

            if (!eLat || !eLng) return; 

            // DEDUPLIKACJA
            const key = Math.round(eLat * 10000) + "_" + Math.round(eLng * 10000);
            if (seen.has(key)) return;
            seen.add(key);

            const isDogPark = el.tags.leisure === 'dog_park';
            const isForest = el.tags.natural === 'wood' || el.tags.landuse === 'forest';
            const isNamedPark = el.tags.leisure === 'park' && !!el.tags.name;
            const nameLower = (el.tags.name || "").toLowerCase();

            // SMART FILTRY JAKOŚCI:
            if (nameLower.includes("zieleń izolacyjna") || nameLower.includes("pas zieleni")) return;
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
                geometry: geometry, 
                isMultiPolygon: isMultiPolygon 
            });
        });

        const dogParks = places.filter(p => p.type === 'dogpark').sort((a,b) => a.distance - b.distance);
        const allGreenery = places.filter(p => p.type !== 'dogpark').sort((a,b) => a.distance - b.distance);

        // 🔥 POPRAWKA: Potężnie zwiększony limit, żeby duże lasy nie odpadały!
        const zone1 = allGreenery.filter(p => p.distance <= 4).slice(0, 50);
        const zone2 = allGreenery.filter(p => p.distance > 4 && p.distance <= 9).slice(0, 50);
        const zone3 = allGreenery.filter(p => p.distance > 9).slice(0, 50);

        const finalPlaces = [
            ...dogParks,
            ...zone1,
            ...zone2,
            ...zone3
        ];
        
        return finalPlaces.slice(0, 150);

    } catch (error) {
        console.error("❌ OSM ERROR:", error);
        return [];
    }
}
