// src/modules/places.js
import { db } from "../core/firebase.js";

window.Waggle = window.Waggle || {};
let allPlaces = []; // Tu będziemy trzymać pobrane miejsca, żeby filtrować je błyskawicznie

export function initPlacesEngine() {
    console.log("📍 Inicjalizacja modułu Miejsc...");
    
    // Pobieramy miejsca z Firebase
    db.collection('places').onSnapshot(snapshot => {
        allPlaces = [];
        snapshot.forEach(doc => {
            allPlaces.push({ id: doc.id, ...doc.data() });
        });

        // Jeśli baza jest pusta, wstrzykujemy kilka miejsc testowych (np. na Śląsk/Kraków)
        if (allPlaces.length === 0) {
            console.log("Baza miejsc pusta! Generuję dane testowe...");
            seedMockPlaces();
        } else {
            renderPlacesList(allPlaces); // Rysujemy wszystkie na start
        }
    });

    // Globalna funkcja filtrowania (podpięta pod przyciski)
    window.Waggle.filterPlaces = (category, btnElement) => {
        // Zmiana stylu przycisków
        document.querySelectorAll('.place-filter-btn').forEach(btn => {
            btn.style.background = 'white';
            btn.style.color = 'var(--text-color)';
            btn.style.border = '1px solid var(--border-color)';
            btn.style.boxShadow = 'none';
        });
        
        if (btnElement) {
            btnElement.style.background = 'var(--secondary)';
            btnElement.style.color = 'white';
            btnElement.style.border = 'none';
            btnElement.style.boxShadow = '0 4px 10px rgba(52,172,224,0.3)';
        }

        // Filtrowanie i rysowanie
        if (category === 'all') {
            renderPlacesList(allPlaces);
        } else {
            const filtered = allPlaces.filter(p => p.category === category);
            renderPlacesList(filtered);
        }
    };
}

function renderPlacesList(places) {
    const container = document.getElementById('places-list-container');
    if (!container) return;

    if (places.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; background: white; border-radius: 20px; border: 1px dashed var(--border-color);">
                <div style="font-size: 40px; margin-bottom: 10px;">🏝️</div>
                <h4 style="margin: 0 0 5px 0; color: var(--text-color);">Brak miejsc w tej kategorii</h4>
                <p style="margin: 0; font-size: 12px; color: var(--text-muted);">Znasz fajne miejsce? Dodaj je jako pierwszy!</p>
            </div>
        `;
        return;
    }

    const icons = { park: '🐕', vet: '🏥', cafe: '☕', forest: '🌲' };

    container.innerHTML = places.map(place => {
        // Generowanie gwiazdek oceny
        const stars = '⭐'.repeat(Math.round(place.rating || 5));
        
        return `
        <div style="background: white; border-radius: 20px; padding: 15px; border: 1px solid var(--border-color); box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; gap: 15px; align-items: center; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
            
            <div style="width: 60px; height: 60px; border-radius: 16px; background: ${place.image || 'var(--bg-color)'}; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; box-shadow: inset 0 0 10px rgba(0,0,0,0.1);">
                ${!place.image ? (icons[place.category] || '📍') : ''}
            </div>

            <div style="flex-grow: 1; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h3 style="margin: 0; font-size: 15px; font-weight: 900; color: var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${place.name}</h3>
                    <div style="font-size: 11px; font-weight: 900; color: var(--primary); background: rgba(255, 82, 82, 0.1); padding: 3px 8px; border-radius: 8px;">${place.distance || '1.2 km'}</div>
                </div>
                <p style="margin: 3px 0; font-size: 12px; color: var(--text-muted); font-weight: 600;">${place.address}</p>
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px;">
                    <span style="font-size: 10px;">${stars}</span>
                    <span style="font-size: 10px; font-weight: 900; color: var(--text-muted);">${place.rating} (${place.reviewsCount} opinii)</span>
                </div>
            </div>

            <button onclick="alert('Wkrótce: Pokażę na mapie!')" style="background: var(--bg-color); border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--primary); font-size: 16px; flex-shrink: 0; transition: background 0.2s;" onmouseover="this.style.background='rgba(52, 172, 224, 0.1)'" onmouseout="this.style.background='var(--bg-color)'">
                🧭
            </button>
        </div>
        `;
    }).join('');
}

// Funkcja dodająca testowe dane startowe (Możesz usunąć później)
async function seedMockPlaces() {
    const mockData = [
        { name: "Wybieg Psia Łąka", category: "park", address: "Park Śląski, Chorzów", rating: 4.8, reviewsCount: 124, distance: "2.1 km", image: "url('https://images.unsplash.com/photo-1601758228041-f3b279ce7bec?auto=format&fit=crop&w=200&q=80')" },
        { name: "Klinika Weterynaryjna 24h", category: "vet", address: "ul. Brynowska, Katowice", rating: 4.9, reviewsCount: 312, distance: "4.5 km", image: "" },
        { name: "Kawiarnia 'Dwie Kawy'", category: "cafe", address: "Rynek, Katowice", rating: 4.6, reviewsCount: 89, distance: "1.0 km", image: "url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=200&q=80')" },
        { name: "Las Murckowski (Szlak)", category: "forest", address: "Katowice Murcki", rating: 5.0, reviewsCount: 45, distance: "8.2 km", image: "url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=200&q=80')" }
    ];

    for (let place of mockData) {
        await db.collection('places').add(place);
    }
}
