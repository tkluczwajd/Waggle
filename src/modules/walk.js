import { appState as state, setState } from '../core/state.js';
import { db, fb } from '../core/firebase.js';
import { startWalkInDb, stopWalkInDb } from '../services/walkService.js';

export function startWalk() {
    if (!state.user || !state.location.lat) {
        window.Waggle.showToast("Brak lokalizacji GPS! 🛰️");
        return;
    }
    
    // Używamy nowej, bezpiecznej funkcji zapisu stanu
    setState('isWalking', true);
    
    const statusEl = document.getElementById('statusInput');
    const status = statusEl && statusEl.value ? statusEl.value : "Na spacerze";
    
    // Zlecenie zapisu do nowej "Warstwy Usług" (Service Layer)
    startWalkInDb(state.user.uid, {
        uid: state.user.uid,
        name: state.profile?.name || "Piesek",
        avatar: state.profile?.avatar || "",
        lat: state.location.lat,
        lng: state.location.lng,
        status: status,
        timestamp: Date.now()
    }).catch(e => console.warn(e));
    
    document.getElementById('startWalkBtn').style.display = 'none';
    document.getElementById('stopWalkBtn').style.display = 'block';
    
    window.Waggle.showToast("🐾 Wyruszyłeś na spacer! Jesteś widoczny na tablicy.");
}

export function stopWalk() {
    if (!state.user) return;
    
    setState('isWalking', false);
    stopWalkInDb(state.user.uid).catch(e => console.warn(e));
    
    document.getElementById('startWalkBtn').style.display = 'block';
    document.getElementById('stopWalkBtn').style.display = 'none';
    
    db.collection("users").doc(state.user.uid).update({
        walkCount: fb.firestore.FieldValue.increment(1)
    });
    
    if (state.profile) {
        setState('profile.walkCount', (state.profile.walkCount || 0) + 1);
    }
    
    window.Waggle.showToast("🏁 Spacer zakończony! Zapisano do statystyk.");
}
