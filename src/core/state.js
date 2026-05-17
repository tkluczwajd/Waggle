// src/core/state.js

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
    profile: {
        // 🔥 NOWOŚĆ: Domyślna flaga konta Premium, przygotowana pod przyszłą monetyzację startupu! 💰
        isPremium: false 
    },
    isWalking: false,
    map: { instance: null },
    currentChatId: null,
    
    // 🔥 NOWOŚĆ: Centralny koszyk na aktywne listenery Firebase (.onSnapshot)
    // Dzięki temu bootstrap będzie mógł odpiąć nieaktywne tunele danych przy zmianie widoków!
    activeListeners: {} 
};

export function setState(path, value) {
    const keys = path.split('.');
    let current = appState;
    while (keys.length > 1) {
        current = current[keys.shift()];
    }
    current[keys[0]] = value;
}

export const state = appState;
