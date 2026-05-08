import { getDistance } from '../geolocation/geolocationService.js';

export async function fetchNearbyParks(lat, lng) {
    // Twoje niezawodne zapytanie do Overpass API
    const query = `[out:json];(node["leisure"="dog_park"](around:5000,${lat},${lng});way["leisure"="dog_park"](around:5000,${lat},${lng});node["leisure"="park"](around:3000,${lat},${lng}););out center;`;
    
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
        
        // Zwracamy posortowaną listę (od najbliższego)
        return places.sort((a, b) => a.distance - b.distance);
        
    } catch (error) {
        console.error("Błąd pobierania parków:", error);
        return [];
    }
}
