import { state } from '../core/state.js';
import { db, fb } from '../core/firebase.js';

export function startWalk() {
    if (!state.user || !state.location.lat) {
        window.Waggle.showToast("Brak lokalizacji GPS! 🛰️");
        return;
    }
    state.isWalking = true;
    const statusEl = document.getElementById('statusInput');
    const status = statusEl && statusEl.value ? statusEl.value : "Na spacerze";
    
    db.collection("walks").doc(state.user.uid).set({
        uid: state.user.uid,
        name: state.profile?.name || "Piesek",
        avatar: state.profile?.avatar || "",
        lat: state.location.lat,
        lng: state.location.lng,
        status: status,
        timestamp: Date.now()
    });
    
    document.getElementById('startWalkBtn').style.display = 'none';
    document.getElementById('stopWalkBtn').style.display = 'block';
    
    // Używamy własnego powiadomienia zamiast systemowego!
    window.Waggle.showToast("🐾 Wyruszyłeś na spacer! Jesteś widoczny na tablicy.");
}

export function stopWalk() {
    if (!state.user) return;
    state.isWalking = false;
    
    db.collection("walks").doc(state.user.uid).delete();
    document.getElementById('startWalkBtn').style.display = 'block';
    document.getElementById('stopWalkBtn').style.display = 'none';
    
    db.collection("users").doc(state.user.uid).update({
        walkCount: fb.firestore.FieldValue.increment(1)
    });
    
    if (state.profile) {
        state.profile.walkCount = (state.profile.walkCount || 0) + 1;
    }
    
    // Własne powiadomienie
    window.Waggle.showToast("🏁 Spacer zakończony! Zapisano do statystyk.");
}
