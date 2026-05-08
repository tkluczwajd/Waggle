import { appState, setState } from './state.js';
import { cleanupListeners } from './listeners.js';
import { eventBus } from './eventBus.js';

export function switchView(view) {
    cleanupListeners(); 

    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));

    const target = document.getElementById(`view-${view}`);
    if (target) target.classList.add('active');
    
    const navBtn = document.querySelector(`.nav-item[data-view="${view}"]`);
    if (navBtn) navBtn.classList.add('active');

    setState('ui.activeView', view);
    
    // TWARDY RESET MAPY - naprawia szare tło po powrocie z innej zakładki!
    if (view === 'map' && appState.map && appState.map.instance) {
        setTimeout(() => {
            appState.map.instance.invalidateSize();
        }, 150);
    }

    eventBus.emit('viewChanged', view);
}

export function initRouter() {
    document.querySelectorAll('[data-view]').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });
}
