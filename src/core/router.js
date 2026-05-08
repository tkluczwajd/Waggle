import { appState, setState } from './state.js';
import { cleanupListeners } from './listeners.js';

export function switchView(view) {
    // Ukrywamy wszystkie ekrany
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.remove('active');
    });
    
    // Odznaczamy wszystkie przyciski w menu
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });

    // Pokazujemy nowy ekran
    const targetView = document.getElementById(`view-${view}`);
    if (targetView) targetView.classList.add('active');
    
    // Zaznaczamy kliknięty przycisk
    const navBtn = document.querySelector(`.nav-item[data-view="${view}"]`);
    if (navBtn) navBtn.classList.add('active');

    setState('ui.activeView', view);
    
    // Odświeżenie wielkości mapy (zapobiega błędom ładowania kafli w Leaflet)
    if (view === 'map' && appState.map) {
        setTimeout(() => appState.map.invalidateSize(), 300);
    }
}
