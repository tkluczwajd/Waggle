import { getDistance } from './geolocationService.js';
import { setPlacesData } from '../ui/placesUiListeners.js'; // 🔥 Spinamy filtry!

export async function fetchNearbyParks(lat, lng) {
    console.log("🌍 OSM START (Mapa 2.0 - Tarcza Anty-Choinkowa)", lat, lng);

    // 🔥 Usunięto grassland i recreation_ground - koniec ze spamem ludzików!
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
);
out bb center;
`;

    try {
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(`OSM ${response.status}`);
        
        const data = await response.json();
        if (!data || !data.elements) return [];

        const places = [];
        const seenCoordinates = new Set();
        const seenNames = new Set(); // 🔥 Nowość: Blokada klonów z tą samą nazwą
        
        data.elements.forEach(el => {
            let eLat = el.lat || el.center?.lat;
            let eLng = el.lon || el.center?.lon;
            if (!eLat || !eLng || !el.tags) return; 

            // 1. Blokada mikroskopijnych różnic w koordynatach
            const coordKey = Math.round(eLat * 100) + "_" + Math.round(eLng * 100);
            if (seenCoordinates.has(coordKey)) return;
            seenCoordinates.add(coordKey);

            let areaSqM = 10000; 
            if (el.bounds) {
                const widthM = (el.bounds.maxlon - el.bounds.minlon) * 71300; 
                const heightM = (el.bounds.maxlat - el.bounds.minlat) * 111000; 
                areaSqM = widthM * heightM;
            }

            const tags = el.tags;
            const isDogPark = tags.leisure === 'dog_park';
            const isForest = tags.natural === 'wood' || tags.landuse === 'forest';
            const isPark = tags.leisure === 'park';
            const hasName = !!tags.name;
            const nameLower = (tags.name || "").toLowerCase();

            if (nameLower.includes("zieleń izolacyjna") || nameLower.includes("pas zieleni")) return;
            
            // 2. 🔥 KLUCZOWY FILTR NAZWY: Jeśli mamy już np. "Las Murckowski", nie dodawaj kolejnego!
            if (hasName) {
                const nameKey = nameLower + "_" + (isDogPark ? "dog" : isForest ? "forest" : "park");
                if (seenNames.has(nameKey)) return; // Blokujemy klona!
                seenNames.add(nameKey);
            }

            if (isForest && !hasName && areaSqM < 4000) return;
            if (!isDogPark && !isForest && !hasName && areaSqM < 200) return; 

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

        const dogParks = places.filter(p => p.type === 'dogpark').sort((a,b) => a.distance - b.distance);
        const allGreenery = places.filter(p => p.type !== 'dogpark').sort((a,b) => a.distance - b.distance);

        const finalList = [
            ...dogParks.filter(p => p.distance <= 8), 
            ...allGreenery.filter(p => p.distance <= 8)
        ].slice(0, 150);

        // 🔥 AUTOMATYCZNA SYNCHRONIZACJA Z FILTRAMI UI
        // To rozwiązuje problem znikających punktów po przejściu do zakładki!
        setPlacesData(finalList);

        return finalList;

} catch (error) {
        console.error("❌ OSM ERROR:", error);
        
        // 🔥 NOWOŚĆ: Informujemy użytkownika, że to wina serwera map, a nie brak miejsc
        if (window.Waggle && window.Waggle.showToast) {
            window.Waggle.showToast("Chwilowy problem z serwerem map. Spróbuj ponownie za chwilę! 📡");
        }
        
        return [];
    }
}
