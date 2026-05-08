import { registerListener, cleanupListeners } from './listeners.js';

export const appState = {
    auth: {
        user: null,
        initialized: false
    },
    ui: {
        activeView: 'map',
        activeModal: null,
        loading: false,
        theme: 'light'
    },
    location: {
        lat: null,
        lng: null,
        following: true,
        watchId: null
    },
    profile: null,
    isWalking: false,
    map: null,
    currentChatId: null
};

// Funkcja do bezpiecznej zmiany danych w nowej architekturze
export function setState(path, value) {
    const keys = path.split('.');
    let current = appState;
    while (keys.length > 1) {
        current = current[keys.shift()];
    }
    current[keys[0]] = value;
}

// === MOST KOMPATYBILNOŚCI WSTECZNEJ DLA STARYCH MODUŁÓW ===
// Poniższe eksporty ratują niezrefaktoryzowane pliki (posts.js, chat.js) przed awarią

export const state = appState; 
export const addListener = registerListener;
export const clearListeners = cleanupListeners;
export const ListenerManager = {
    add: registerListener,
    clear: cleanupListeners
};
