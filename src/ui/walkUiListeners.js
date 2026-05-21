import { appState as state } from '../core/state.js';
import { db } from '../core/firebase.js';
import { mapManager } from '../modules/map/mapManager.js';

export function initWalkUi() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('#centerBtn')) { 
            if (state.location.lat && state.location.lng) { mapManager.flyTo(state.location.lat, state.location.lng, 15); window.Waggle.showToast("Zlokalizowano! 📍"); } 
        }
        if (e.target.closest('#startWalkBtn')) {
            state.isWalking = true; document.getElementById('startWalkBtn').style.display = 'none'; document.getElementById('stopWalkBtn').style.display = 'inline-block'; document.getElementById('statusInput').style.display = 'none';
            db.collection("walks").doc(state.user.uid).set({ uid: state.user.uid, name: state.profile?.name, avatar: state.profile?.avatar, lat: state.location.lat, lng: state.location.lng, timestamp: Date.now() }, { merge: true }); window.Waggle.showToast("Spacer rozpoczęty! 🐾");
        }
        if (e.target.closest('#stopWalkBtn')) {
            state.isWalking = false; document.getElementById('stopWalkBtn').style.display = 'none'; document.getElementById('startWalkBtn').style.display = 'inline-block'; document.getElementById('statusInput').style.display = 'inline-block';
            if (state.user) db.collection("walks").doc(state.user.uid).delete(); window.Waggle.showToast("Spacer zakończony! 🏁");
        }
        if (e.target.closest('#weatherWidgetBtn')) document.getElementById('weather-modal').style.display = 'flex';
    });
}
