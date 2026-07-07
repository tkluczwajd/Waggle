// src/core/bootstrap/safeBootstrap.js

export function initSafeFinderLogic() {
    window.Waggle.shareFinderLocation = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const safeId = urlParams.get('safe');
        const btn = document.getElementById('shareLocationBtn');
        if (btn) { btn.innerText = "POBIERAM SYGNAŁ GPS... ⏳"; btn.disabled = true; }

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                // Importujemy bazę w locie, żeby nie blokować startu apki
                const { db, fb } = await import('../firebase.js');
                await db.collection('safe_reports').add({
                    ownerUid: safeId, lat: latitude, lng: longitude, status: 'NEW', source: 'APP_MODAL',
                    timestamp: fb.firestore.FieldValue.serverTimestamp()
                });
                if (btn) { btn.innerText = "✅ WYSŁANO LOKALIZACJĘ!"; btn.style.background = "#2ed573"; }
                if (window.Waggle.showToast) window.Waggle.showToast("Dziękujemy! Opiekun otrzymał powiadomienie.");
            } catch (err) {
                console.error(err);
                if (btn) { btn.innerText = "❌ BŁĄD"; btn.disabled = false; }
            }
        }, (err) => { alert("Musisz zezwolić na dostęp do lokalizacji!"); btn.disabled = false; }, 
        { enableHighAccuracy: true, timeout: 15000 });
    };
}

export function startSafeRadar() {
    const currentUid = localStorage.getItem('activeDogId') || localStorage.getItem('uid');
    if (!currentUid) return;

    import('../firebase.js').then(({ db }) => {
        db.collection('safe_reports')
        .where('ownerUid', '==', currentUid)
        .onSnapshot(snap => {
            snap.docChanges().forEach(change => {
                if (change.type === 'added' || change.type === 'modified') {
                    const report = change.doc.data();
                    const reportTime = report.timestamp && typeof report.timestamp.toMillis === 'function' ? report.timestamp.toMillis() : Date.now();
                    if ((Date.now() - reportTime) < 15 * 60000 && report.lat && report.lng) {
                        if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
                        if (window.Waggle.showToast) window.Waggle.showToast("🚨 Namierzono psa! Sprawdź mapę!", 8000);
                        const mapTab = document.querySelector('[data-view="local"]');
                        if (mapTab) mapTab.click();
                    }
                }
            });
        });
    });
}
