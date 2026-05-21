// src/core/authInit.js
import { initAuth } from '../modules/auth.js';
import { db, auth } from './firebase.js'; // 🔥 TUTAJ BRAKOWAŁO SŁOWA 'auth'
import { appState as state } from './state.js';

export function setupAuth(callback) {
    initAuth(() => {
        auth.onAuthStateChanged(user => {
            if (user) {
                db.collection("walks").doc(user.uid).get().then(doc => {
                    if (doc.exists) {
                        const diff = (Date.now() - (doc.data().timestamp || 0)) / 1000 / 60;
                        if (diff > 30) { db.collection("walks").doc(user.uid).delete(); state.isWalking = false; }  
                        else {
                            state.isWalking = true;
                            if(document.getElementById('startWalkBtn')) document.getElementById('startWalkBtn').style.display = 'none';
                            if(document.getElementById('stopWalkBtn')) document.getElementById('stopWalkBtn').style.display = 'inline-block';
                        }
                    }
                });
            }
        });
        callback(); // To wywołanie było zablokowane przez błąd!
    });
}
