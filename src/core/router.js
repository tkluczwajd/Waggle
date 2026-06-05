// src/core/router.js
import { appState, setState } from './state.js';
import { eventBus } from './eventBus.js';

export function switchView(view, pushToHistory = true) {

    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));

    const target = document.getElementById(`view-${view}`);
    if (target) target.classList.add('active');
    
    const navBtn = document.querySelector(`.nav-item[data-view="${view}"]`);
    if (navBtn) navBtn.classList.add('active');

    setState('ui.activeView', view);
    
    // 🔥 Wpis do historii przeglądarki dla nawigacji dolnym menu
    if (pushToHistory) {
        history.pushState({ view: view }, '');
    }
    
    // NAPRAWA SZAREJ MAPY: Przeliczenie rozmiaru dla nowego widoku "local"
    if (view === 'local' && appState.map && appState.map.instance) {
        setTimeout(() => {
            appState.map.instance.invalidateSize();
            // Jeśli nadal byłoby szare, powtarzamy po pół sekundy
            setTimeout(() => appState.map.instance.invalidateSize(), 400);
        }, 200);
    }

    eventBus.emit('viewChanged', view);
}

export function initRouter() {
    // 🔥 Ustawienie początkowego stanu w historii, żebyśmy mieli do czego wracać
    history.replaceState({ view: 'home' }, '');

    document.querySelectorAll('[data-view]').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view, true));
    });

    // 🔥 Nasłuchiwanie sprzętowego przycisku Wstecz dla zakładek menu
    window.addEventListener('popstate', (e) => {
        // Jeśli telefon cofa nas do innej zakładki:
        if (e.state && e.state.view) {
            // Przełączamy widok, ale NIE dodajemy nowego wpisu, bo po prostu "cofamy czas"
            switchView(e.state.view, false);
        }
    });
}
