// src/core/state.js

export const state = {
    user: null,
    profile: null,
    location: { lat: null, lng: null },
    isWalking: false,
    isGhostMode: false, //
    map: null,
    isFollowing: true, 
    currentChatId: null,
    listeners: []
};

// Nowy standard funkcji
export function addListener(unsub) {
    state.listeners.push(unsub);
}

export function clearListeners() {
    state.listeners.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
    });
    state.listeners = [];
}

// "Most" kompatybilności dla starszych plików
export const ListenerManager = {
    add: addListener,
    clear: clearListeners
};
