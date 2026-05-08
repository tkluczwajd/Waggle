const activeListeners = [];

export function registerListener(unsubscribe) {
    activeListeners.push(unsubscribe);
}

export function cleanupListeners() {
    activeListeners.forEach(unsub => {
        if (typeof unsub === 'function') {
            unsub();
        }
    });
    activeListeners.length = 0;
}

// Kompatybilność wsteczna dla Twoich starszych plików (zostawiamy, żeby nic nie zepsuć!)
export const ListenerManager = {
    add: registerListener,
    clear: cleanupListeners
};
