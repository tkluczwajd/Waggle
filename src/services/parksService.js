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
    console.log("🌍 Rozpoczynam bezpieczne pobieranie danych z OSM (Metoda POST)...");

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

    try {
        // 🔥 Zmiana na stabilne żądanie POST z kodowaniem formularza
        const response = await fetch(
            "https://overpass-api.de/api/interpreter",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `data=${encodeURIComponent(query)}`
            }
        );

        // 📝 Log statusu odpowiedzi sieciowej
        console.log("🌍 OSM status:", response.status);

        if (!response.ok) {
            throw new Error(`OSM ${response.status}`);
        }

        const data = await response.json();

        // 📝 Log surowej liczby elementów z serwera
        console.log("🌳 OSM elements:", data.elements?.length || 0);
        
        const dogParks = [];
        const generalGreenAreas = [];

        if (data && data.elements) {
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
        }

        dogParks.sort((a, b) => a.distance - b.distance);
        generalGreenAreas.sort((a, b) => a.distance - b.distance);

        // Dodatkowy log po naszej segregacji
        console.log("🏞️ Przefiltrowane wybiegi:", dogParks.length, "🌳 Przefiltrowana zieleń:", generalGreenAreas.length);

        const combinedPlaces = [...dogParks, ...generalGreenAreas];
        return combinedPlaces.slice(0, 35);
        
    } catch (error) {
        console.error("Krytyczny błąd pobierania parków z OSM:", error);
        return [];
    }
}
