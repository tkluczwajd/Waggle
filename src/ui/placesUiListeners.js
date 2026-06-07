// src/ui/placesUiListeners.js
import { renderPlacesList, renderParksOnMap } from '../modules/map/parksRenderer.js';

let currentPlaces = [];

export function setPlacesData(places) {
    currentPlaces = places;
    applyPlacesFilter('all'); // Inicjalne ładowanie pełnej listy
}

export function initPlacesUi() {
    const filterBtns = document.querySelectorAll('.filter-place');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Zarządzanie stanem wizualnym przycisków
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = 'var(--text-color)';
            });
            
            btn.classList.add('active');
            btn.style.background = 'var(--text-color)';
            btn.style.color = 'white';
            
            // Aplikacja filtru
            applyPlacesFilter(btn.dataset.type);
        });
    });
}

function applyPlacesFilter(type) {
    let filtered = currentPlaces;
    
    if (type !== 'all') {
        filtered = currentPlaces.filter(p => p.type === type);
    }
    
    // Prawdziwa magia wspólnego źródła danych (Single Source of Truth)
    renderPlacesList(filtered);
    renderParksOnMap(filtered);
}
