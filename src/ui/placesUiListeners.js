import { renderPlacesList, renderParksOnMap } from '../modules/map/parksRenderer.js';
import { toggleFavoriteInDb, subscribeToFavorites } from '../services/favoritesService.js';
import { appState as state } from '../core/state.js';
import { getDistance } from '../services/geolocationService.js';

let currentPlaces = []; // Miejsca załadowane z mapy
let favoritePlaces = []; // Miejsca zaciągnięte z bazy Firestore
let unsubscribeFavorites = null;

// 🔥 GLOBALNA FUNKCJA: Potrzebna, bo z markerów Leaflet odpalamy akcje tekstowo (onclick)
window.Waggle = window.Waggle || {};
window.Waggle.toggleFavoritePlace = async (placeId) => {
    if (!state.user) {
        window.Waggle.showToast("Zaloguj się, aby dodawać do ulubionych!");
        return;
    }

    // Szukamy obiektu miejsca w aktualnie załadowanych danych lub w ulubionych
    const place = currentPlaces.find(p => p.id == placeId) || favoritePlaces.find(p => p.id == placeId);
    
    if (!place) return;

    // Odpalamy serwis
    const isNowFavorite = await toggleFavoriteInDb(state.user.uid, place);
    
    if (isNowFavorite) {
        window.Waggle.showToast("Zapisano w Ulubionych! ⭐");
    } else {
        window.Waggle.showToast("Usunięto z Ulubionych 🗑️");
    }
    // Widok odświeży się sam dzięki mechanizmowi subscribeToFavorites!
};

export function setPlacesData(places) {
    currentPlaces = places;
    
    // Inicjalizacja nasłuchu na ulubione, jeśli użytkownik jest zalogowany
    if (state.user && !unsubscribeFavorites) {
        unsubscribeFavorites = subscribeToFavorites(state.user.uid, (favs) => {
            favoritePlaces = favs;
            // Odświeżamy aktywną zakładkę za każdym razem, gdy baza się zaktualizuje
            const activeBtn = document.querySelector('.filter-place.active');
            if (activeBtn) applyPlacesFilter(activeBtn.dataset.type);
        });
    }

    applyPlacesFilter('all');
}

export function initPlacesUi() {
    const filterBtns = document.querySelectorAll('.filter-place');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = b.dataset.type === 'favorites' ? 'var(--gold)' : 'var(--text-color)';
            });
            
            btn.classList.add('active');
            btn.style.background = btn.dataset.type === 'favorites' ? 'var(--gold)' : 'var(--text-color)';
            btn.style.color = 'white';
            
            applyPlacesFilter(btn.dataset.type);
        });
    });
}

function applyPlacesFilter(type) {
    let filtered = currentPlaces;
    
    if (type === 'all') {
        filtered = currentPlaces.filter(p => p.type === 'dogpark' || p.type === 'forest' || p.type === 'park');
    } else if (type === 'favorites') {
        // 🔥 Wczytanie z bazy i przeliczenie dystansu na nowo z aktualnej pozycji GPS!
        filtered = favoritePlaces.map(fav => ({
            ...fav,
            distance: state.location.lat ? getDistance(state.location.lat, state.location.lng, fav.lat, fav.lng) : 0
        })).sort((a, b) => a.distance - b.distance);
    } else {
        filtered = currentPlaces.filter(p => p.type === type);
    }
    
    // Przekazujemy również tablicę ID ulubionych, żeby renderer wiedział, które gwiazdki zapalić
    const favIds = favoritePlaces.map(f => f.id);
    renderPlacesList(filtered, favIds);
    renderParksOnMap(filtered, favIds);
}
