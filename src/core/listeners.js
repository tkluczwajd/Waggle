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
