export const state = {
    user: null,
    profile: null,
    location: { lat: null, lng: null },
    isWalking: false,
    map: null,
    isFollowing: true,
    currentChatId: null,
    listeners: {} // ZMIANA: To teraz obiekt, a nie tablica!
};

// NOWOŚĆ: Inteligentne dodawanie nasłuchu
export function setListener(name, unsub) {
    // Jeśli nasłuch o tej nazwie już działa, zabij go przed odpaleniem nowego (zapobiega dublowaniu)
    if (state.listeners[name]) {
        state.listeners[name]();
    }
    state.listeners[name] = unsub;
}

// NOWOŚĆ: Ubijanie konkretnego nasłuchu
export function clearListener(name) {
    if (state.listeners[name]) {
        state.listeners[name]();
        delete state.listeners[name];
    }
}

// Zostawiamy to TYLKO do twardego wylogowania
export function clearAllListeners() {
    console.log("Hard reset: ubijam wszystkie procesy Firebase.");
    Object.keys(state.listeners).forEach(key => {
        state.listeners[key]();
    });
    state.listeners = {};
}
