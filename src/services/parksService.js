import { getDistance } from './geolocationService.js';

export async function fetchNearbyParks(lat, lng) {
    console.log("🌍 OSM START (Mapa 2.0 z filtrem pow.)", lat, lng);

    // 🔥 Zoptymalizowane zapytanie, ale ZACHOWUJEMY 'out bb center;' do obliczania pola
    const query = `
[out:json][timeout:20];
(
    node["leisure"="dog_park"](around:8000,${lat},${lng});
    way["leisure"="dog_park"](around:8000,${lat},${lng});
    relation["leisure"="dog_park"](around:8000,${lat},${lng});

    way["leisure"="park"]["access"!="private"]["access"!="no"](around:8000,${lat},${lng});
    relation["leisure"="park"]["access"!="private"]["access"!="no"](around:8000,${lat},${lng});

    way["natural"="wood"]["access"!="private"]["access"!="no"](around:8000,${lat},${lng});
    way["landuse"="forest"]["access"!="private"]["access"!="no"](around:8000,${lat},${lng});
    relation["natural"="wood"]["access"!="private"]["access"!="no"](around:8000,${lat},${lng});
    relation["landuse"="forest"]["access"!="private"]["access"!="no"](around:8000,${lat},${lng});

    way["leisure"="recreation_ground"]["access"!="private"]["access"!="no"](around:8000,${lat},${lng});
    way["natural"="grassland"]["access"!="private"]["access"!="no"](around:8000,${lat},${lng});
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

            // ZWRÓCONY KOD: Obliczamy przybliżoną powierzchnię w metrach kwadratowych
            let areaSqM = 10000; 
            if (el.bounds) {
                const widthM = (el.bounds.maxlon - el.bounds.minlon) * 71300; 
                const heightM = (el.bounds.maxlat - el.bounds.minlat) * 111000; 
                areaSqM = widthM * heightM;
            }

            const key = Math.round(eLat * 1000) + "_" + Math.round(eLng * 1000);
            if (seen.has(key)) return;
            seen.add(key);

            const tags = el.tags;
            const isDogPark = tags.leisure === 'dog_park';
            const isForest = tags.natural === 'wood' || tags.landuse === 'forest';
            const isPark = tags.leisure === 'park';
            const hasName = !!tags.name;
            const nameLower = (tags.name || "").toLowerCase();

            if (nameLower.includes("zieleń izolacyjna") || nameLower.includes("pas zieleni")) return;
            
            // 🔥 TWÓJ KLUCZOWY FILTR: Odrzucamy mikroskwerki i prywatne zagajniki
            if (isForest && !hasName && areaSqM < 4000) return;
            if (!isDogPark && !isForest && !hasName && areaSqM < 200) return; 

            // Mapowanie dla nowych filtrów UI (Odkrywaj)
            let type = 'walk';
            let name = tags.name || "Teren spacerowy";
            
            if (isDogPark) { type = 'dogpark'; name = tags.name || "Wybieg dla psów"; }
            else if (isForest) { type = 'forest'; name = tags.name || "Las"; }
            else if (isPark) { type = 'park'; name = tags.name || "Park"; }

            const dist = getDistance(lat, lng, eLat, eLng);
            
            places.push({
                id: el.id, name, distance: dist, lat: eLat, lng: eLng, type, isDogPark
            });
        });

        // Twoja sprawdzona logika sortowania i ucinania dystansu
        const dogParks = places.filter(p => p.type === 'dogpark').sort((a,b) => a.distance - b.distance);
        const allGreenery = places.filter(p => p.type !== 'dogpark').sort((a,b) => a.distance - b.distance);

        const finalPlaces = [
            ...dogParks.filter(p => p.distance <= 8), 
            ...allGreenery.filter(p => p.distance <= 8)
        ];
        return finalPlaces.slice(0, 150);

    } catch (error) {
        console.error("❌ OSM ERROR:", error);
        return [];
    }
}
