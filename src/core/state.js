export const state = {
    user: null,
    profile: null,
    location: { lat: null, lng: null },
    isWalking: false,
    map: null,
    isFollowing: true, 
    currentChatId: null,
    listeners: []
};

// Funkcja dodająca połączenie (nasłuchiwanie) do listy
export function addListener(unsub) {
    state.listeners.push(unsub);
}

// Funkcja "sprzątająca" - zabija stare nasłuchiwania przy zmianie widoku
export function clearListeners() {
    console.log("Cleaning up listeners: ", state.listeners.length);
    state.listeners.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
    });
    state.listeners = [];
}
