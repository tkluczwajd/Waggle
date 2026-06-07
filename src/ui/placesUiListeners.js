import { renderPlacesList, renderParksOnMap } from '../modules/map/parksRenderer.js';

let currentPlaces = [];

export function setPlacesData(places) {
    currentPlaces = places;
    applyPlacesFilter('all'); // Inicjalnie ładujemy filtrowaną listę główną
}

export function initPlacesUi() {
    const filterBtns = document.querySelectorAll('.filter-place');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = 'var(--text-color)';
            });
            
            btn.classList.add('active');
            btn.style.background = 'var(--text-color)';
            btn.style.color = 'white';
            
            applyPlacesFilter(btn.dataset.type);
        });
    });
}

function applyPlacesFilter(type) {
    let filtered = currentPlaces;
    
    // 🔥 Zmiana logiki: 'all' pokazuje tylko konkretne destynacje, ukrywa zwykłe 'walk'
    if (type === 'all') {
        filtered = currentPlaces.filter(p => p.type === 'dogpark' || p.type === 'forest' || p.type === 'park');
    } else if (type === 'favorites') {
        // Przygotowane pod kolejny etap
        filtered = []; 
    } else {
        filtered = currentPlaces.filter(p => p.type === type);
    }
    
    renderPlacesList(filtered);
    renderParksOnMap(filtered);
}
