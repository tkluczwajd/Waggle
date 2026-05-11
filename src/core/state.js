
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
    map: { instance: null },
    currentChatId: null
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
export const addListener = registerListener;
export const clearListeners = cleanupListeners;
export const ListenerManager = {
    add: registerListener,
    clear: cleanupListeners
};
