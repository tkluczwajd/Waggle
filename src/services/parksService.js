// src/services/parksService.js
import { getDistance } from './geolocationService.js';

export async function fetchNearbyParks(lat, lng) {

    console.log("🌍 OSM START", lat, lng);

    const query = `
[out:json][timeout:20];
(
    node["leisure"="dog_park"](around:10000,${lat},${lng});
    way["leisure"="dog_park"](around:10000,${lat},${lng});

    node["leisure"="park"](around:8000,${lat},${lng});
    way["leisure"="park"](around:8000,${lat},${lng});

    way["natural"="wood"](around:8000,${lat},${lng});
    way["landuse"="forest"](around:8000,${lat},${lng});
);
out center;
`;

    try {

        const response = await fetch(
            `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
        );

        console.log("🌍 OSM STATUS:", response.status);

        if (!response.ok) {
            throw new Error(`OSM ${response.status}`);
        }

        const data = await response.json();

        console.log(
            "🌳 OSM ELEMENTS:",
            data?.elements?.length || 0
        );

        const places = [];
        const seen = new Set();

        (data.elements || []).forEach(el => {

            const eLat = el.lat || el.center?.lat;
            const eLng = el.lon || el.center?.lon;

            if (!eLat || !eLng || !el.tags) return;

            const key =
                Math.round(eLat * 10000) +
                "_" +
                Math.round(eLng * 10000);

            if (seen.has(key)) return;
            seen.add(key);

            const isDogPark =
                el.tags.leisure === 'dog_park';

            const isForest =
                el.tags.natural === 'wood' ||
                el.tags.landuse === 'forest';

            const name =
                el.tags.name ||
                (
                    isDogPark
                        ? "Wybieg dla psów"
                        : isForest
                        ? "Las"
                        : "Park"
                );

            const dist = getDistance(
                lat,
                lng,
                eLat,
                eLng
            );

            places.push({
                name,
                distance: dist,
                lat: eLat,
                lng: eLng,
                isDogPark,
                type: isForest ? 'forest' : 'park'
            });
        });

        console.log(
            "🏞️ FOUND:",
            places.length
        );

        // FALLBACK
        if (places.length === 0) {

            console.warn(
                "⚠️ OSM pusty → fallback"
            );

            places.push({
                name: "Park Waggle (Test)",
                distance: 1,
                lat: lat + 0.01,
                lng: lng + 0.01,
                isDogPark: true,
                type: 'park'
            });
        }

        // ===== CLUSTER LASÓW =====
        const forests =
            places.filter(
                p => p.type === 'forest'
            );

        const others =
            places.filter(
                p => p.type !== 'forest'
            );

        const clusteredForests = [];
        const used = [];

        forests.forEach(f => {

            const existing = used.find(c => {

                const dLat =
                    Math.abs(c.lat - f.lat);

                const dLng =
                    Math.abs(c.lng - f.lng);

                return (
                    dLat < 0.018 &&
                    dLng < 0.018
                );
            });

            if (!existing) {

                used.push(f);

                clusteredForests.push({
                    ...f,
                    name: "Las"
                });
            }
        });

        const finalPlaces = [
            ...others,
            ...clusteredForests
        ];

        return finalPlaces
            .sort(
                (a, b) =>
                    a.distance - b.distance
            )
            .slice(0, 25);

    } catch (error) {

        console.error(
            "❌ OSM ERROR:",
            error
        );

        return [{
            name: "Park Waggle",
            distance: 1,
            lat: lat + 0.01,
            lng: lng + 0.01,
            isDogPark: false,
            type: 'park'
        }];
    }
}
