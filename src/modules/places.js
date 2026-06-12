// src/modules/places.js
import { db } from "../core/firebase.js";

window.Waggle = window.Waggle || {};
let allPlaces = []; 

// Niezawodne dane startowe do testów
const localMockPlaces = [
    { id: '1', name: "Dolina Trzech Stawów (Wybieg)", category: "dogpark", address: "Katowice, Francuska", rating: 4.8, reviewsCount: 124, distance: "2.1 km", image: "url('https://images.unsplash.com/photo-1601758228041-f3b279ce7bec?auto=format&fit=crop&w=200&q=80')", isFavorite: true },
    { id: '2', name: "Klinika Weterynaryjna 24h", category: "vet", address: "Katowice, Brynowska", rating: 4.9, reviewsCount: 312, distance: "4.5 km", image: "", isFavorite: false },
    { id: '3', name: "Kawiarnia 'Dwie Kawy'", category: "cafe", address: "Rynek, Katowice", rating: 4.6, reviewsCount: 89, distance: "1.0 km", image: "url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=200&q=80')", isFavorite: true },
    { id: '4', name: "Park Kościuszki", category: "park", address: "Katowice, ul. Kościuszki", rating: 5.0, reviewsCount: 45, distance: "1.2 km", image: "url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=200&q=80')", isFavorite: false },
    { id: '5', name: "Las Murckowski", category: "forest", address: "Katowice Murcki", rating: 4.7, reviewsCount: 67, distance: "8.5 km", image: "url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=200&q=80')", isFavorite: false }
];

export function initPlacesEngine() {
    // Od razu ładujemy lokalne dane, żeby ominąć blokady bazy na etapie testów
    allPlaces = localMockPlaces;
    renderPlacesList(allPlaces);

    // Globalna funkcja filtrowania
    window.Waggle.filterPlaces = (category, btnElement) => {
        document.querySelectorAll('.place-filter-btn').forEach(btn => {
            btn.style.background = 'white';
            btn.style.color = btn.innerText.includes('Ulubione') ? 'var(--gold, #f1c40f)' : 'var(--text-color)';
            btn.style.border = '1px solid var(--border-color)';
            btn.style.boxShadow = 'none';
        });
        
        if (btnElement) {
            btnElement.style.background = 'var(--secondary)';
            btnElement.style.color = 'white';
            btnElement.style.border = 'none';
            btnElement.style.boxShadow = '0 4px 10px rgba(52,172,224,0.3)';
        }

        if (category === 'all') {
            renderPlacesList(allPlaces);
        } else if (category === 'favorites') {
            renderPlacesList(allPlaces.filter(p => p.isFavorite));
        } else {
            renderPlacesList(allPlaces.filter(p => p.category === category));
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

    const icons = { park: '🌳', dogpark: '🐕', vet: '🏥', cafe: '☕', forest: '🌲', other: '📍' };

    container.innerHTML = places.map(place => {
        const stars = '⭐'.repeat(Math.round(place.rating || 5));
        const favIcon = place.isFavorite ? '<span style="color: var(--gold, #f1c40f); font-size: 14px;">⭐</span>' : '';
        
        return `
        <div style="background: white; border-radius: 20px; padding: 15px; border: 1px solid var(--border-color); box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; gap: 15px; align-items: center; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
            
            <div style="width: 60px; height: 60px; border-radius: 16px; background: ${place.image || 'var(--bg-color)'}; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; box-shadow: inset 0 0 10px rgba(0,0,0,0.1);">
                ${!place.image ? (icons[place.category] || '📍') : ''}
            </div>

            <div style="flex-grow: 1; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h3 style="margin: 0; font-size: 15px; font-weight: 900; color: var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${place.name} ${favIcon}</h3>
                    <div style="font-size: 11px; font-weight: 900; color: var(--primary); background: rgba(52, 172, 224, 0.1); padding: 3px 8px; border-radius: 8px;">${place.distance}</div>
                </div>
                <p style="margin: 3px 0; font-size: 12px; color: var(--text-muted); font-weight: 600;">${place.address}</p>
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px;">
                    <span style="font-size: 10px;">${stars}</span>
                    <span style="font-size: 10px; font-weight: 900; color: var(--text-muted);">${place.rating} (${place.reviewsCount} opinii)</span>
                </div>
            </div>
        </div>
        `;
    }).join('');
}
