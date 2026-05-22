// src/services/parksService.js

function getDistanceInKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

export async function fetchNearbyParks(lat, lng) {
    console.log("🌍 Rozpoczynam pobieranie danych z OSM (czekaj...)");

    // Zmniejszony promień do 8km (wybiegi) i 3km (parki), dodany timeout
    const query = `[out:json][timeout:25];
    (
      node["leisure"="dog_park"](around:8000,${lat},${lng});
      way["leisure"="dog_park"](around:8000,${lat},${lng});
      relation["leisure"="dog_park"](around:8000,${lat},${lng});
      
      node["name"~"wybieg",i](around:8000,${lat},${lng});
      way["name"~"wybieg",i](around:8000,${lat},${lng});
      relation["name"~"wybieg",i](around:8000,${lat},${lng});

      node["leisure"="park"](around:3000,${lat},${lng});
      way["leisure"="park"](around:3000,${lat},${lng});

      way["natural"="wood"](around:3000,${lat},${lng});
      way["landuse"="forest"](around:3000,${lat},${lng});
    );
    out center;`;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        const dogParks = [];
        const generalGreenAreas = [];

        data.elements.forEach(el => {
            const eLat = el.lat || (el.center && el.center.lat);
            const eLng = el.lon || (el.center && el.center.lon);
            
            if (!eLat || !eLng || !el.tags) return;

            const dist = getDistanceInKm(lat, lng, eLat, eLng);
            const nameLower = (el.tags.name || "").toLowerCase();
            
            const isRun = el.tags.leisure === 'dog_park' || nameLower.includes('wybieg') || nameLower.includes('dla psów');
            const isForest = el.tags.natural === 'wood' || el.tags.landuse === 'forest' || nameLower.includes('las');
            
            const name = el.tags.name || (isRun ? "Wybieg dla psów" : isForest ? "Las / Teren leśny" : "Park");

            const item = {
                name,
                distance: dist,
                lat: eLat,
                lng: eLng,
                isDogPark: isRun,
                type: isForest ? 'forest' : 'park'
            };

            if (isRun) {
                dogParks.push(item);
            } else {
                generalGreenAreas.push(item);
            }
        });

        dogParks.sort((a, b) => a.distance - b.distance);
        generalGreenAreas.sort((a, b) => a.distance - b.distance);

        console.log("🏞️ Dog parks:", dogParks.length, "🌳 Green:", generalGreenAreas.length);

        const combinedPlaces = [...dogParks, ...generalGreenAreas];
        return combinedPlaces.slice(0, 35);
        
    } catch (error) {
        console.error("Błąd pobierania parków z OSM:", error);
        return [];
    }
}
