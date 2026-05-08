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
    profile: null, // Tu trzymamy dane usera (imię, awatar, tryb ducha)
    isWalking: false,
    map: null,
    currentChatId: null
};

// Funkcja do bezpiecznej zmiany danych
export function setState(path, value) {
    const keys = path.split('.');
    let current = appState;
    while (keys.length > 1) {
        current = current[keys.shift()];
    }
    current[keys[0]] = value;
}

// Tymczasowy most dla Twoich starszych funkcji, by ich nie popsuć
export const state = appState;
