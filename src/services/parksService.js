// src/services/parksService.js

function getDistanceInKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export async function fetchNearbyParks(lat, lng) {
    console.log("🌍 OSM START", lat, lng);

    const query = `
[out:json][timeout:25];
(
node["leisure"="dog_park"](around:8000,${lat},${lng});
way["leisure"="dog_park"](around:8000,${lat},${lng});
relation["leisure"="dog_park"](around:8000,${lat},${lng});

node["name"~"wybieg",i](around:8000,${lat},${lng});
way["name"~"wybieg",i](around:8000,${lat},${lng});
relation["name"~"wybieg",i](around:8000,${lat},${lng});

node["leisure"="park"](around:5000,${lat},${lng});
way["leisure"="park"](around:5000,${lat},${lng});
relation["leisure"="park"](around:5000,${lat},${lng});

way["natural"="wood"](around:5000,${lat},${lng});
relation["natural"="wood"](around:5000,${lat},${lng});
way["landuse"="forest"](around:5000,${lat},${lng});
relation["landuse"="forest"](around:5000,${lat},${lng});
);
out center;
`;

    try {
        const response = await fetch(
            "https://overpass-api.de/api/interpreter",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },
                body: `data=${encodeURIComponent(query)}`
            }
        );

        console.log("🌍 OSM STATUS:", response.status);

        if (!response.ok) {
            const txt = await response.text();
            console.error("❌ OSM ERROR:", txt);
            return [];
        }

        const data = await response.json();

        console.log(
            "🌳 OSM ELEMENTS:",
            data?.elements?.length || 0
        );

        if (!data.elements?.length) return [];

        const seen = new Set();
        const places = [];

        data.elements.forEach(el => {
            const eLat = el.lat || el.center?.lat;
            const eLng = el.lon || el.center?.lon;

            if (!eLat || !eLng || !el.tags) return;

            const key =
                Math.round(eLat * 10000) +
                "_" +
                Math.round(eLng * 10000);

            if (seen.has(key)) return;
            seen.add(key);

            const nameLower = (
                el.tags.name || ""
            ).toLowerCase();

            const isDogPark =
                el.tags.leisure === "dog_park" ||
                nameLower.includes("wybieg") ||
                nameLower.includes("dla psów");

            const isForest =
                el.tags.natural === "wood" ||
                el.tags.landuse === "forest" ||
                nameLower.includes("las");

            places.push({
                name:
                    el.tags.name ||
                    (
                        isDogPark
                            ? "Wybieg dla psów"
                            : isForest
                            ? "Las"
                            : "Park"
                    ),
                lat: eLat,
                lng: eLng,
                isDogPark,
                type: isDogPark
                    ? "dogpark"
                    : isForest
                    ? "forest"
                    : "park",
                distance: getDistanceInKm(
                    lat,
                    lng,
                    eLat,
                    eLng
                )
            });
        });

        places.sort(
            (a, b) => a.distance - b.distance
        );

        console.log(
            "✅ GOTOWE:",
            places.length
        );

        return places.slice(0, 40);

    } catch (err) {
        console.error(
            "❌ OSM CRASH:",
            err
        );
        return [];
    }
}
