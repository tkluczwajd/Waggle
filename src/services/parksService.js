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
    // 🔥 OPTYMALIZACJA QUERY: Wybiegi łapiemy z 10km, lasy i parki zawężamy do 4km, by uniknąć potopu danych
    const query = `[out:json];
    (
      node["leisure"="dog_park"](around:10000,${lat},${lng});
      way["leisure"="dog_park"](around:10000,${lat},${lng});

      node["leisure"="park"](around:4000,${lat},${lng});
      way["leisure"="park"](around:4000,${lat},${lng});

      way["natural"="wood"](around:4000,${lat},${lng});
      way["landuse"="forest"](around:4000,${lat},${lng});
    );
    out center;`;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Rozdzielamy punkty na dwie osobne kategorie
        const dogParks = [];
        const generalGreenAreas = [];

        data.elements.forEach(el => {
            const eLat = el.lat || (el.center && el.center.lat);
            const eLng = el.lon || (el.center && el.center.lon);
            
            if (!eLat || !eLng || !el.tags) return;

            const dist = getDistanceInKm(lat, lng, eLat, eLng);
            const isRun = el.tags.leisure === 'dog_park';
            const isForest = el.tags.natural === 'wood' || el.tags.landuse === 'forest';
            const name = el.tags.name || (isRun ? "Wybieg dla psów" : isForest ? "Las / Teren leśny" : "Park");

            const item = {
                name,
                distance: dist,
                lat: eLat,
                lng: eLng,
                isDogPark: isRun,
                type: isForest ? 'forest' : 'park'
            };

            // Segregacja na starcie
            if (isRun) {
                dogParks.push(item);
            } else {
                generalGreenAreas.push(item);
            }
        });

        // Sortujemy obie grupy niezależnie od najbliższych
        dogParks.sort((a, b) => a.distance - b.distance);
        generalGreenAreas.sort((a, b) => a.distance - b.distance);

        // 🔥 STRATEGIA MIKSU: Zawsze pokazuj WSZYSTKIE znalezione wybiegi (bo to apka dla psów!), 
        // a resztę listy uzupełnij najbliższymi parkami i lasami.
        const combinedPlaces = [...dogParks, ...generalGreenAreas];

        // Zwracamy bezpieczne top 35 miejsc do wyrenderowania
        return combinedPlaces.slice(0, 35);
        
    } catch (error) {
        console.error("Błąd pobierania parków z OSM:", error);
        return [];
    }
}
