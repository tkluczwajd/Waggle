// --- NOWY, BEZPIECZNY STAN APLIKACJI ---
const state = {
    user: null,
    dogProfile: null,
    // Zamiast arraya listeners: [], wprowadzamy precyzyjny obiekt:
    listeners: {
        walks: null,
        posts: null,
        chat: null,
        inbox: null,
        alerts: null
    }
};

// --- NOWY MENEDŻER LISTENERÓW ---
const ListenerManager = {
    // Rejestruje nowy listener pod konkretną nazwą (np. 'walks')
    register: function(name, unsubscribeFunction) {
        // Jeśli pod tą nazwą działa już jakiś nasłuchiwacz, zabij go najpierw
        if (state.listeners[name]) {
            state.listeners[name]();
        }
        // Zapisz nowy
        state.listeners[name] = unsubscribeFunction;
    },

    // Zabija tylko JEDEN konkretny nasłuchiwacz (np. przy zamykaniu czatu)
    clear: function(name) {
        if (state.listeners[name]) {
            state.listeners[name](); // Wywołanie funkcji unsubscribe z Firebase
            state.listeners[name] = null;
        }
    },

    // Zabija wszystkie (używane TYLKO przy wylogowywaniu użytkownika)
    clearAll: function() {
        Object.keys(state.listeners).forEach(key => {
            if (state.listeners[key]) {
                state.listeners[key]();
                state.listeners[key] = null;
            }
        });
    }
};
