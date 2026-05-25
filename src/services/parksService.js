import { getDistance } from './geolocationService.js';

export async function fetchNearbyParks(lat, lng) {
    console.log("🌍 OSM START", lat, lng);

const query = `
[out:json][timeout:20];
(
    node["leisure"="dog_park"](around:8000,${lat},${lng});
    way["leisure"="dog_park"](around:8000,${lat},${lng});
    relation["leisure"="dog_park"](around:8000,${lat},${lng});

    node["leisure"="park"]["access"!="private"]["access"!="no"](around:8000,${lat},${lng});
    way["leisure"="park"]["access"!="private"]["access"!="no"](around:8000,${lat},${lng});
    relation["leisure"="park"]["access"!="private"]["access"!="no"](around:8000,${lat},${lng});

    way["natural"="wood"]["access"!="private"]["access"!="no"](around:8000,${lat},${lng});
    way["landuse"="forest"]["access"!="private"]["access"!="no"](around:8000,${lat},${lng});
    relation["natural"="wood"]["access"!="private"]["access"!="no"](around:8000,${lat},${lng});
    relation["landuse"="forest"]["access"!="private"]["access"!="no"](around:8000,${lat},${lng});
);
out bb center;
`;

    try {
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(`OSM ${response.status}`);
        
        const data = await response.json();
        if (!data || !data.elements) return [];

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

            const key = Math.round(eLat * 1000) + "_" + Math.round(eLng * 1000);
            if (seen.has(key)) return;
            seen.add(key);

            const isDogPark = el.tags.leisure === 'dog_park';
            const isForest = el.tags.natural === 'wood' || el.tags.landuse === 'forest';
            const hasName = !!el.tags.name;
            const nameLower = (el.tags.name || "").toLowerCase();

            if (nameLower.includes("zieleń izolacyjna") || nameLower.includes("pas zieleni")) return;
            
            // 🔥 KLUCZOWY FILTR: Odrzucamy lasy bez nazwy, KTÓRE SĄ MNIEJSZE NIŻ 4000 m2 (prywatne zagajniki)
            if (isForest && !hasName && areaSqM < 4000) return;
            // Odrzucamy nienazwane mikroskwerki poniżej 200 m2
            if (!isDogPark && !isForest && !hasName && areaSqM < 200) return; 

            const name = el.tags.name || (isDogPark ? "Wybieg dla psów" : isForest ? "Lokalny las" : "Teren spacerowy");
            const dist = getDistance(lat, lng, eLat, eLng);
            
            places.push({
                name, distance: dist, lat: eLat, lng: eLng, isDogPark,
                type: isDogPark ? 'dogpark' : isForest ? 'forest' : 'park'
            });
        });

        const dogParks = places.filter(p => p.type === 'dogpark').sort((a,b) => a.distance - b.distance);
        const allGreenery = places.filter(p => p.type !== 'dogpark').sort((a,b) => a.distance - b.distance);

        const finalPlaces = [...dogParks, ...allGreenery.filter(p => p.distance <= 9)];
        return finalPlaces.slice(0, 150);
    } catch (error) {
        return [];
    }
}
