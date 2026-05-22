// src/services/parksService.js

// Funkcja pomocnicza do obliczania dystansu w linii prostej (w kilometrach)
function getDistanceInKm(lat1, lng1, lat2, lng2) {
    const R = 6371; // Promień Ziemi w km
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

export async function fetchNearbyParks(lat, lng) {
    // 🔥 Nowe, potężne zapytanie Overpass API (od Konsultanta)
    const query = `[out:json];
    (
      node["leisure"="dog_park"](around:10000,${lat},${lng});
      way["leisure"="dog_park"](around:10000,${lat},${lng});

      node["leisure"="park"](around:10000,${lat},${lng});
      way["leisure"="park"](around:10000,${lat},${lng});

      way["natural"="wood"](around:10000,${lat},${lng});
      way["landuse"="forest"](around:10000,${lat},${lng});

      relation["natural"="wood"](around:10000,${lat},${lng});
      relation["landuse"="forest"](around:10000,${lat},${lng});
    );
    out center;`;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const places = [];

        data.elements.forEach(el => {
            // Pobieranie współrzędnych (node ma lat/lon, a way/relation mają center.lat/center.lon dzięki 'out center;')
            const eLat = el.lat || (el.center && el.center.lat);
            const eLng = el.lon || (el.center && el.center.lon);
            
            if (!eLat || !eLng || !el.tags) return;

            const dist = getDistanceInKm(lat, lng, eLat, eLng);

            // 🔥 Rozpoznawanie typu (od Konsultanta)
            const isRun = el.tags.leisure === 'dog_park';
            const isForest = el.tags.natural === 'wood' || el.tags.landuse === 'forest';

            // 🔥 Precyzyjne nazewnictwo
            const name = el.tags.name || (isRun ? "Wybieg dla psów" : isForest ? "Las / Teren leśny" : "Park");

            places.push({
                name,
                distance: dist,
                lat: eLat,
                lng: eLng,
                isDogPark: isRun,
                type: isForest ? 'forest' : 'park'
            });
        });

        // Sortujemy od najbliższego do najdalszego
        places.sort((a, b) => a.distance - b.distance);

        // Zwracamy maksymalnie 30 najbliższych miejsc, żeby nie zamulić telefonu
        return places.slice(0, 30);
        
    } catch (error) {
        console.error("Błąd pobierania parków z OSM:", error);
        return [];
    }
}
