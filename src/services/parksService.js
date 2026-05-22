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
        console.log("🌳 OSM ELEMENTS:", data?.elements?.length || 0);

        const places = [];
        const seen = new Set();

        (data.elements || []).forEach(el => {
            const eLat = el.lat || el.center?.lat;
            const eLng = el.lon || el.center?.lon;

            if (!eLat || !eLng || !el.tags) return;

            // DEDUPLIKACJA
            const key = Math.round(eLat * 10000) + "_" + Math.round(eLng * 10000);
            if (seen.has(key)) return;
            seen.add(key);

            const isDogPark = el.tags.leisure === 'dog_park';
            const isForest = el.tags.natural === 'wood' || el.tags.landuse === 'forest';
            const isNamedPark = el.tags.leisure === 'park' && !!el.tags.name;

            // FILTR JAKOŚCI
            if (el.tags.leisure === 'park' && !isNamedPark) return;

            const name = el.tags.name || (isDogPark ? "Wybieg dla psów" : isForest ? "Las / Teren leśny" : "Park");
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

        if (places.length === 0) {
            console.warn("⚠️ OSM pusty → fallback");
            return [];
        }

        // ===== CLUSTER LASÓW =====
        const forests = places.filter(p => p.type === 'forest');
        const others = places.filter(p => p.type !== 'forest');

        const clusteredForests = [];
        const used = [];

        forests.forEach(f => {
            const existing = used.find(c => {
                const dLat = Math.abs(c.lat - f.lat);
                const dLng = Math.abs(c.lng - f.lng);
                return dLat < 0.010 && dLng < 0.010; 
            });

            if (!existing) {
                used.push(f);
                clusteredForests.push({ ...f, name: f.name === "Las / Teren leśny" ? "Las" : f.name });
            }
        });

        // ===== NOWA LOGIKA: ZARZĄDZANIE STREFAMI (ZONES) =====
        const dogParks = others.filter(p => p.type === 'dogpark').sort((a,b) => a.distance - b.distance);
        const normalParks = others.filter(p => p.type === 'park');

        // Wszystkie parki i lasy wrzucamy do jednego wora i sortujemy
        const allGreenery = [...normalParks, ...clusteredForests].sort((a,b) => a.distance - b.distance);

        // Rozdzielamy zieleń na 3 koszyki odległościowe
        const zone1 = allGreenery.filter(p => p.distance <= 4).slice(0, 12); // Spacerówki: do 4 km (max 12 sztuk)
        const zone2 = allGreenery.filter(p => p.distance > 4 && p.distance <= 9).slice(0, 12); // Autem: 4-9 km (max 12 sztuk)
        const zone3 = allGreenery.filter(p => p.distance > 9).slice(0, 12); // Wypady: powyżej 9 km (max 12 sztuk)

        // Składamy ostateczną listę
        const finalPlaces = [
            ...dogParks, // Wybiegi wchodzą wszystkie jak leci (najwyższy priorytet)
            ...zone1,
            ...zone2,
            ...zone3
        ];

        console.log(`🗺️ Strefy: Wybiegi(${dogParks.length}), Blisko(${zone1.length}), Średnio(${zone2.length}), Daleko(${zone3.length})`);

        return finalPlaces.slice(0, 50); // Bezpieczny limit maksymalny

    } catch (error) {
        console.error("❌ OSM ERROR:", error);
        return [];
    }
}
