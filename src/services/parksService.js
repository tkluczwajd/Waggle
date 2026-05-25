import { getDistance } from './geolocationService.js';

export async function fetchNearbyParks(lat, lng) {
    console.log("🌍 OSM START", lat, lng);

    // Blokujemy prywatne posesje i prosimy o obszar (out bb center;)
    const query = `
[out:json][timeout:20];
(
    node["leisure"="dog_park"](around:15000,${lat},${lng});
    way["leisure"="dog_park"](around:15000,${lat},${lng});
    relation["leisure"="dog_park"](around:15000,${lat},${lng});

    node["leisure"="park"]["access"!="private"]["access"!="no"](around:12000,${lat},${lng});
    way["leisure"="park"]["access"!="private"]["access"!="no"](around:12000,${lat},${lng});
    relation["leisure"="park"]["access"!="private"]["access"!="no"](around:12000,${lat},${lng});

    way["natural"="wood"]["access"!="private"]["access"!="no"](around:15000,${lat},${lng});
    way["landuse"="forest"]["access"!="private"]["access"!="no"](around:15000,${lat},${lng});
    relation["natural"="wood"]["access"!="private"]["access"!="no"](around:15000,${lat},${lng});
    relation["landuse"="forest"]["access"!="private"]["access"!="no"](around:15000,${lat},${lng});
);
out bb center;
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
        
        data.elements.forEach(el => {
            let eLat = el.lat || el.center?.lat;
            let eLng = el.lon || el.center?.lon;

            if (!eLat || !eLng || !el.tags) return; 

            // Obliczamy przybliżoną powierzchnię w metrach kwadratowych
            let areaSqM = 10000; 
            if (el.bounds) {
                const widthM = (el.bounds.maxlon - el.bounds.minlon) * 71300; 
                const heightM = (el.bounds.maxlat - el.bounds.minlat) * 111000; 
                areaSqM = widthM * heightM;
            }

            // DEDUPLIKACJA
            const key = Math.round(eLat * 1000) + "_" + Math.round(eLng * 1000);
            if (seen.has(key)) return;
            seen.add(key);

            const isDogPark = el.tags.leisure === 'dog_park';
            const isForest = el.tags.natural === 'wood' || el.tags.landuse === 'forest';
            const isNamedPark = el.tags.leisure === 'park' && !!el.tags.name;
            const hasName = !!el.tags.name;
            const nameLower = (el.tags.name || "").toLowerCase();

            // FILTRY JAKOŚCIOWE
            if (nameLower.includes("zieleń izolacyjna") || nameLower.includes("pas zieleni")) return;
            
            // Jeśli to "las", nie ma nazwy, i jest mniejszy niż 4000 m2 - odrzucamy jako posesję
            if (isForest && !hasName && areaSqM < 4000) return;
            
            // Jeśli to park, ale absolutnie mikroskopijny (poniżej 100 m2) to klomb
            if (!isDogPark && !isForest && areaSqM < 100) return; 

            const name = el.tags.name || (isDogPark ? "Wybieg dla psów" : isForest ? "Teren leśny" : "Teren zielony / Skwer");
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

        const dogParks = places.filter(p => p.type === 'dogpark').sort((a,b) => a.distance - b.distance);
        const allGreenery = places.filter(p => p.type !== 'dogpark').sort((a,b) => a.distance - b.distance);

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
