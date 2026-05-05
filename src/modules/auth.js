import { auth, db } from "../core/firebase.js";
import { state, addListener, clearListeners } from "../core/state.js";
import { initApp } from "../app.js";

export function initAuth() {
    auth.onAuthStateChanged(user => {
        clearListeners(); 
        document.getElementById("loader").style.display = "none";

        if (user) {
            state.user = user;
            // Snapshot profilu
            const unsub = db.collection("users").doc(user.uid).onSnapshot(doc => {
                if (doc.exists) {
                    state.profile = doc.data();
                } else {
                    // Fallback jeśli dokumentu w bazie jeszcze nie ma
                    state.profile = { name: "Piesek", walkCount: 0 };
                }
                
                document.getElementById("auth-screen").style.display = "none";
                document.getElementById("app-interface").style.display = "flex";
                initApp();
            }, err => {
                console.error("Auth error:", err);
                document.getElementById("app-interface").style.display = "flex";
                initApp();
            });
            
            addListener(unsub);
        } else {
            state.user = null;
            state.profile = null;
            document.getElementById("app-interface").style.display = "none";
            document.getElementById("auth-screen").style.display = "flex";
        }
    });
}
