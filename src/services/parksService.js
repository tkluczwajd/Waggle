import { getDistance } from './geolocationService.js';

export async function fetchNearbyParks(lat, lng) {
    console.log("🌍 OSM START (Tylko oficjalne/nazwane miejsca)", lat, lng);

    // 🔥 KLUCZOWA ZMIANA: Wymuszamy tag ["name"] dla parków i lasów. 
    // Bezimienne kępy drzew i prywatne klomby zostają permanentnie zablokowane na poziomie serwera.
    const query = `
[out:json][timeout:20];
(
    node["leisure"="dog_park"](around:15000,${lat},${lng});
    way["leisure"="dog_park"](around:15000,${lat},${lng});
    relation["leisure"="dog_park"](around:15000,${lat},${lng});

    way["leisure"="park"]["name"](around:12000,${lat},${lng});
    relation["leisure"="park"]["name"](around:12000,${lat},${lng});

    way["natural"="wood"]["name"](around:15000,${lat},${lng});
    way["landuse"="forest"]["name"](around:15000,${lat},${lng});
    relation["natural"="wood"]["name"](around:15000,${lat},${lng});
    relation["landuse"="forest"]["name"](around:15000,${lat},${lng});
);
out center;
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
        console.log("🌳 OSM ELEMENTS (Tylko oficjalne):", data?.elements?.length || 0);

        if (!data || !data.elements || data.elements.length === 0) {
            console.warn("⚠️ OSM pusty");
            return [];
        }

        const places = [];
        const seen = new Set();
        
        data.elements.forEach(el => {
            const eLat = el.lat || el.center?.lat;
            const eLng = el.lon || el.center?.lon;

            if (!eLat || !eLng || !el.tags) return; 

            // DEDUPLIKACJA (zaokrąglanie do 3 miejsc po przecinku daje ok. 100m bufora)
            const key = Math.round(eLat * 1000) + "_" + Math.round(eLng * 1000);
            if (seen.has(key)) return;
            seen.add(key);

            const isDogPark = el.tags.leisure === 'dog_park';
            const isForest = el.tags.natural === 'wood' || el.tags.landuse === 'forest';
            const nameLower = (el.tags.name || "").toLowerCase();

            // Dodatkowe filtry bezpieczeństwa dla nazw
            if (nameLower.includes("zieleń izolacyjna") || nameLower.includes("pas zieleni") || nameLower.includes("ogród prywatny")) return;

            const name = el.tags.name || (isDogPark ? "Wybieg dla psów" : "Park");
            const dist = getDistance(lat, lng, eLat, eLng);
            
            places.push({
                name,
                distance: dist,
                lat: eLat,
                lng: eLng,
                isDogPark: isDogPark,
                type: isDogPark ? 'dogpark' : isForest ? 'forest' : 'park'
            });
        });

        // Sortowanie i strefowanie odległości
        const dogParks = places.filter(p => p.type === 'dogpark').sort((a,b) => a.distance - b.distance);
        const allGreenery = places.filter(p => p.type !== 'dogpark').sort((a,b) => a.distance - b.distance);

        const zone1 = allGreenery.filter(p => p.distance <= 4).slice(0, 30);
        const zone2 = allGreenery.filter(p => p.distance > 4 && p.distance <= 9).slice(0, 30);
        const zone3 = allGreenery.filter(p => p.distance > 9).slice(0, 30);

        const finalPlaces = [
            ...dogParks,
            ...zone1,
            ...zone2,
            ...zone3
        ];
        
        return finalPlaces.slice(0, 100);

    } catch (error) {
        console.error("❌ OSM ERROR:", error);
        return [];
    }
}
