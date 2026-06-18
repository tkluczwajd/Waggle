// src/services/parksService.js
import { getDistance } from './geolocationService.js'; // Używamy Twojego kalkulatora odległości

export async function fetchNearbyParks(lat, lng) {
    // 1. GENEROWANIE KLUCZA CACHE
    // Zaokrąglamy koordynaty do 2 miejsc po przecinku (to siatka o boku ok. 1.1 km).
    // Dzięki temu drobne ruchy na spacerze nie powodują ciągłego spamowania serwera.
    const cacheKey = `waggle_parks_${lat.toFixed(2)}_${lng.toFixed(2)}`;
    const cacheTimeKey = `${cacheKey}_time`;
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 godziny w milisekundach

    // 2. SPRAWDZANIE PAMIĘCI TELEFONU
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);

    if (cachedData && cachedTime) {
        const now = new Date().getTime();
        // Jeśli dane są młodsze niż 24h, zwracamy je od razu!
        if (now - parseInt(cachedTime) < CACHE_TTL) {
            console.log("🌳 OSM: Ładuję parki z pamięci telefonu (Brak zapytań do serwera!)");
            return JSON.parse(cachedData);
        }
    }

    // 3. JEŚLI NIE MAMY DANYCH (LUB SĄ STARE) - PYTAMY SERWER
    console.log(`🌍 OSM START (Szukam nowych terenów: ${lat}, ${lng})`);
    
    const radius = 8000; // 8km
    const query = `
    [out:json][timeout:20];
    (
        node["leisure"="dog_park"](around:${radius},${lat},${lng});
        way["leisure"="dog_park"](around:${radius},${lat},${lng});
        relation["leisure"="dog_park"](around:${radius},${lat},${lng});

        way["leisure"="park"]["access"!="private"]["access"!="no"](around:${radius},${lat},${lng});
        relation["leisure"="park"]["access"!="private"]["access"!="no"](around:${radius},${lat},${lng});

        way["natural"="wood"]["access"!="private"]["access"!="no"](around:${radius},${lat},${lng});
        way["landuse"="forest"]["access"!="private"]["access"!="no"](around:${radius},${lat},${lng});
        relation["natural"="wood"]["access"!="private"]["access"!="no"](around:${radius},${lat},${lng});
        relation["landuse"="forest"]["access"!="private"]["access"!="no"](around:${radius},${lat},${lng});
    );
    out bb center;`;

    try {
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`OSM ${response.status}`);
        }
        
        const data = await response.json();
        
        // Przetwarzanie i filtrowanie wyników
        const places = data.elements.map(el => {
            const latEl = el.lat || el.center?.lat;
            const lonEl = el.lon || el.center?.lon;
            const name = el.tags?.name || "Teren zielony";
            const isDogPark = el.tags?.leisure === "dog_park";
            const type = el.tags?.leisure || el.tags?.landuse || el.tags?.natural;
            
            let distance = 0;
            if (latEl && lonEl) distance = getDistance(lat, lng, latEl, lonEl);

            return {
                id: el.id,
                name: name,
                lat: latEl,
                lng: lonEl,
                isDogPark: isDogPark,
                type: type,
                distance: distance
            };
        });

        // Sortujemy miejsca od najbliższego do najdalszego
        places.sort((a, b) => a.distance - b.distance);

        // 4. ZAPISUJEMY ŚWIEŻE DANE DO PAMIĘCI TELEFONU
        localStorage.setItem(cacheKey, JSON.stringify(places));
        localStorage.setItem(cacheTimeKey, new Date().getTime().toString());

        return places;

    } catch (error) {
        console.error("❌ OSM ERROR:", error);
        
        // 5. TRYB AWARYJNY (Fallback)
        // Jeśli serwer wyrzucił błąd 429 (Too Many Requests), ale mamy w pamięci 
        // wygasłe parki (np. sprzed 2 dni), ładujemy je, żeby nie zostawić pustego ekranu!
        if (cachedData) {
            console.warn("⚠️ OSM: Serwer odrzucił zapytanie. Używam wygasłych danych z pamięci awaryjnie.");
            return JSON.parse(cachedData);
        }
        
        // Jeśli nie mamy absolutnie nic, zwracamy pustą tablicę
        return [];
    }
}
