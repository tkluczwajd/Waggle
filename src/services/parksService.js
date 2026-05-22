// src/services/parksService.js

function getDistanceInKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lng2 - lng1) * Math.PI / 180;

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) *
            Math.cos(phi2) *
            Math.sin(deltaLambda / 2) *
            Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function fetchNearbyParks(lat, lng) {
    console.log("🌍 Pobieram dane OSM...");

    const query = `
    [out:json][timeout:25];
    (
      // WYBIEGI
      node["leisure"="dog_park"](around:8000,${lat},${lng});
      way["leisure"="dog_park"](around:8000,${lat},${lng});
      relation["leisure"="dog_park"](around:8000,${lat},${lng});

      node["name"~"wybieg",i](around:8000,${lat},${lng});
      way["name"~"wybieg",i](around:8000,${lat},${lng});
      relation["name"~"wybieg",i](around:8000,${lat},${lng});

      // PARKI
      node["leisure"="park"](around:4000,${lat},${lng});
      way["leisure"="park"](around:4000,${lat},${lng});
      relation["leisure"="park"](around:4000,${lat},${lng});

      // LASY
      way["natural"="wood"](around:4000,${lat},${lng});
      relation["natural"="wood"](around:4000,${lat},${lng});
      way["landuse"="forest"](around:4000,${lat},${lng});
      relation["landuse"="forest"](around:4000,${lat},${lng});
    );
    out center;
    `;

    try {
        // STABILNIEJSZY POST DO OVERPASS
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

        console.log("🌍 OSM status:", response.status);

        if (!response.ok) {
            throw new Error(`OSM ${response.status}`);
        }

        const data = await response.json();

        console.log(
            "🌳 OSM elements:",
            data.elements?.length || 0
        );

        if (!data.elements || !Array.isArray(data.elements)) {
            console.warn("⚠️ Brak elements z OSM");
            return [];
        }

        const dogParks = [];
        const greenAreas = [];
        const seen = new Set();

        data.elements.forEach(el => {
            const eLat = el.lat || el.center?.lat;
            const eLng = el.lon || el.center?.lon;

            if (!eLat || !eLng || !el.tags) return;

            // USUWANIE DUPLIKATÓW
            const key =
                Math.round(eLat * 10000) +
                "_" +
                Math.round(eLng * 10000);

            if (seen.has(key)) return;
            seen.add(key);

            const dist = getDistanceInKm(
                lat,
                lng,
                eLat,
                eLng
            );

            const nameLower = (
                el.tags.name || ""
            ).toLowerCase();

            const isDogPark =
                el.tags.leisure === "dog_park" ||
                nameLower.includes("wybieg") ||
                nameLower.includes("dla psów") ||
                nameLower.includes("psi park");

            const isForest =
                el.tags.natural === "wood" ||
                el.tags.landuse === "forest" ||
                nameLower.includes("las");

            const name =
                el.tags.name ||
                (isDogPark
                    ? "Wybieg dla psów"
                    : isForest
                    ? "Las / teren leśny"
                    : "Park");

            const item = {
                name,
                distance: dist,
                lat: eLat,
                lng: eLng,
                isDogPark,
                type: isDogPark
                    ? "dogpark"
                    : isForest
                    ? "forest"
                    : "park"
            };

            if (isDogPark) {
                dogParks.push(item);
            } else {
                greenAreas.push(item);
            }
        });

        dogParks.sort(
            (a, b) => a.distance - b.distance
        );

        greenAreas.sort(
            (a, b) => a.distance - b.distance
        );

        console.log(
            "🏞️ Wybiegi:",
            dogParks.length,
            "🌳 Parki/Lasy:",
            greenAreas.length
        );

        const combined = [
            ...dogParks,
            ...greenAreas
        ];

        return combined.slice(0, 35);

    } catch (error) {
        console.error(
            "❌ Błąd pobierania OSM:",
            error
        );
        return [];
    }
}
