import { appState, setState } from './state.js';
import { cleanupListeners } from './listeners.js';

export function switchView(view) {
    // 1. Czyścimy stare nasłuchy bazy danych (żeby nie zżerało limitów i RAMu)
    cleanupListeners(); 

    // 2. Chowamy wszystkie widoki i odznaczamy przyciski
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });

    // 3. Pokazujemy docelowy widok
    const target = document.getElementById(`view-${view}`);
    if (target) {
        target.classList.add('active');
    }
    
    const navBtn = document.querySelector(`.nav-item[data-view="${view}"]`);
    if (navBtn) {
        navBtn.classList.add('active');
    }

    // 4. Zapisujemy w centralnym stanie, gdzie jesteśmy
    setState('ui.activeView', view);
    
    // Zdarzenia specjalne przy wejściu na widok
    if (view === 'map' && appState.map?.instance) {
        setTimeout(() => appState.map.instance.invalidateSize(), 300);
    }
}

export function initRouter() {
    // Automatycznie podpinamy kliknięcia pod wszystkie przyciski dolnego menu
    document.querySelectorAll('[data-view]').forEach(btn => {
        btn.addEventListener('click', () => {
            switchView(btn.dataset.view);
        });
    });
}
