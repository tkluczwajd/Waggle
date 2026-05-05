// Centralny stan aplikacji
export const state = {
    user: null,
    profile: null,
    location: { lat: null, lng: null },
    isWalking: false,
    map: null,
    isFollowing: true,
    currentChatId: null,
    listeners: [], // Tu trzymamy funkcje wyłączające realtime updates
    i18n: {
        pl: { auth_subtitle: "Dołącz do stada! 🐕", btn_login: "ZALOGUJ SIĘ", btn_register: "REJESTRACJA", nav_map: "Mapa", nav_board: "Tablica", nav_chat: "Czat", nav_profile: "Profil", btn_start_walk: "WYJDŹ NA SPACER 🐾", title_nearby: "W okolicy" },
        en: { auth_subtitle: "Join the pack! 🐕", btn_login: "LOG IN", btn_register: "REGISTER", nav_map: "Map", nav_board: "Board", nav_chat: "Chat", nav_profile: "Profile", btn_start_walk: "START WALK 🐾", title_nearby: "Nearby" }
    }
};

// Funkcja dodająca listener do listy (aby go potem wyłączyć)
export function addListener(unsub) {
    state.listeners.push(unsub);
}

// Funkcja czyszcząca wszystko (np. przy wylogowaniu) - KONIEC MEMORY LEAKS
export function clearListeners() {
    state.listeners.forEach(unsub => unsub());
    state.listeners = [];
}
