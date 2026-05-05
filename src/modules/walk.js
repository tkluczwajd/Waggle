import { state } from '../core/state.js';
import { db, fb } from '../core/firebase.js';

let lastUpdate = 0;

export function startWalk() {
    state.isWalking = true;
    document.getElementById('startWalkBtn').style.display = 'none';
    document.getElementById('stopWalkBtn').style.display = 'block';
    updateWalkLocation();
}

export function stopWalk() {
    state.isWalking = false;
    document.getElementById('startWalkBtn').style.display = 'block';
    document.getElementById('stopWalkBtn').style.display = 'none';
    db.collection("walks").doc(state.user.uid).delete();
    db.collection("users").doc(state.user.uid).update({ 
        walkCount: fb.firestore.FieldValue.increment(1) 
    });
    alert("Spacer zakończony!");
}

export function updateWalkLocation() {
    if (Date.now() - lastUpdate < 15000 || !state.location.lat) return;
    db.collection("walks").doc(state.user.uid).set({
        uid: state.user.uid, name: state.profile.name, avatar: state.profile.avatar,
        lat: state.location.lat, lng: state.location.lng, timestamp: Date.now()
    }, { merge: true });
    lastUpdate = Date.now();
}
