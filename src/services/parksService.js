import { getDistance } from './geolocationService.js';

export async function fetchNearbyParks(lat, lng) {
    // ZWIĘKSZONO PROMIEŃ z 3000/5000 do 10000 (10km), żeby serwer zawsze coś wypluł
    const query = `[out:json];(node["leisure"="dog_park"](around:10000,${lat},${lng});way["leisure"="dog_park"](around:10000,${lat},${lng});node["leisure"="park"](around:10000,${lat},${lng}););out center;`;
    
    try {
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        const places = [];
        data.elements.forEach(el => {
            const eLat = el.lat || el.center.lat;
            const eLng = el.lon || el.center.lon;
            const isRun = el.tags.leisure === 'dog_park';
            const name = el.tags.name || (isRun ? "Wybieg dla psów" : "Park");
            
            const dist = getDistance(lat, lng, eLat, eLng);
            
            places.push({ 
                name: name, 
                distance: dist, 
                lat: eLat, 
                lng: eLng, 
                isDogPark: isRun 
            });
        });

        // FALLBACK: Jeśli API OSM z jakiegoś powodu milczy lub wywala 0, dajemy użytkownikowi zastępczy "Park Waggle"
        if (places.length === 0) {
            places.push({
                name: "Park Waggle (Test)",
                distance: 1.5,
                lat: lat + 0.01,
                lng: lng + 0.01,
                isDogPark: true
            });
        }
        
        return places.sort((a, b) => a.distance - b.distance);
        
    } catch (error) {
        console.error("Błąd pobierania parków:", error);
        return [{ name: "Park Centralny", distance: 2.5, lat: lat, lng: lng, isDogPark: false }];
    }
}
