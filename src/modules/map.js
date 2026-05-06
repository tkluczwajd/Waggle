import { state, setListener } from '../core/state.js';
// ... CAŁA RESZTA TWOJEGO KODU MAPY POZOSTAJE BEZ ZMIAN ...

function listenForAlerts() {
    const unsub = db.collection("alerts").onSnapshot(snap => {
        // ... logika markerów alertów (nic tu nie zmieniasz) ...
    });
    // ZMIANA:
    setListener('alerts', unsub);
}

function listenForWalks() {
    const unsub = db.collection("walks").onSnapshot(snap => {
        // ... logika psów na mapie (nic tu nie zmieniasz) ...
    });
    // ZMIANA:
    setListener('walks', unsub);
}
