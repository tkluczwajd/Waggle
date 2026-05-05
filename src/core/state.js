export const state = {
    user: null,
    profile: null,
    location: { lat: null, lng: null },
    isWalking: false,
    map: null,
    isFollowing: true, // Teraz zdefiniowane poprawnie
    currentChatId: null,
    listeners: []
};

export function addListener(unsub) {
    state.listeners.push(unsub);
}

export function clearListeners() {
    console.log("Cleaning up listeners: ", state.listeners.length);
    state.listeners.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
    });
    state.listeners = [];
}
