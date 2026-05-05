import { state } from '../core/state.js';
import { db, fb } from '../core/firebase.js';

let lastUpdate = 0;

export function startWalk() {
    state.isWalking = true;
    document.getElementById('startWalkBtn').style.display = 'none';
    document.getElementById('stopWalkBtn').style.display = 'block';
    
    // Wymuszamy natychmiastowy update
    lastUpdate = 0; 
    updateWalkLocation();
}

export function stopWalk() {
    state.isWalking = false;
    document.getElementById('startWalkBtn').style.display = 'block';
    document.getElementById('stopWalkBtn').style.display = 'none';

    // Usuwamy pozycję z bazy (znikamy z radaru)
    db.collection("walks").doc(state.user.uid).delete();
    
    // Pół-reaktywne aktualizowanie statystyk
    db.collection("users").doc(state.user.uid).update({ 
        walkCount: fb.firestore.FieldValue.increment(1) 
    }).then(() => {
        // Zamiast location.reload(), wystarczy że Firebase zaktualizuje naszą lokalną zmienną state.profile
        alert("Spacer zapisany!");
    });
}

export function updateWalkLocation() {
    // Dławik: wysyłamy dane maksymalnie raz na 15 sekund (oszczędza transfer bazy!)
    if (Date.now() - lastUpdate < 15000) return;
    if (!state.location.lat) return;

    db.collection("walks").doc(state.user.uid).set({
        uid: state.user.uid,
        name: state.profile.name,
        avatar: state.profile.avatar,
        lat: state.location.lat,
        lng: state.location.lng,
        intent: document.getElementById('intent') ? document.getElementById('intent').value : 'walk',
        timestamp: Date.now()
    }, { merge: true });

    lastUpdate = Date.now();
}
