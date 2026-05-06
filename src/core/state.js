// --- NOWY, BEZPIECZNY STAN APLIKACJI ---
export const state = {
    user: null,
    profile: null,
    location: { lat: null, lng: null },
    isWalking: false,
    map: null,
    isFollowing: true,
    currentChatId: null,
    // Precyzyjny obiekt zamiast jednego worka (tablicy)
    listeners: {
        walks: null,
        posts: null,
        activeChat: null,
        inbox: null,
        alerts: null,
        authProfile: null
    }
};

// --- NOWY MENEDŻER LISTENERÓW ---
export const ListenerManager = {
    // Rejestruje nowy listener pod konkretną nazwą
    register: function(name, unsubscribeFunction) {
        if (state.listeners[name]) {
            state.listeners[name](); // Zabij stary nasłuch, jeśli istnieje
        }
        state.listeners[name] = unsubscribeFunction;
    },

    // Zabija tylko JEDEN konkretny nasłuchiwacz
    clear: function(name) {
        if (state.listeners[name]) {
            state.listeners[name]();
            state.listeners[name] = null;
        }
    },

    // Zabija wszystkie (używane TYLKO przy wylogowywaniu)
    clearAll: function() {
        Object.keys(state.listeners).forEach(key => {
            if (state.listeners[key]) {
                state.listeners[key]();
                state.listeners[key] = null;
            }
        });
    }
};
