// src/modules/care.js
import { db, auth, fb } from '../core/firebase.js';

// Nasłuchujemy na zmiany w dzisiejszych aktywnościach
export function listenToDailyCare() {
    const currentUid = localStorage.getItem('activeDogId') || (auth.currentUser ? auth.currentUser.uid : null);
    if (!currentUid) return;

    // Generujemy dzisiejszą datę w formacie YYYY-MM-DD jako ID dokumentu
    const today = new Date().toISOString().split('T')[0];
    
    db.collection('users').doc(currentUid).collection('daily_care').doc(today)
        .onSnapshot(doc => {
            const data = doc.exists ? doc.data() : { feed: 0, walk: 0, med: 0, water: 0 };
            
            // Pobieramy cele z localStorage (lub ustawiamy domyślne)
            const goals = {
                feed: parseInt(localStorage.getItem('goal_feed')) || 2,
                walk: parseInt(localStorage.getItem('goal_walk')) || 3,
                med: parseInt(localStorage.getItem('goal_med')) || 1,
                water: parseInt(localStorage.getItem('goal_water')) || 3
            };

            // Aktualizujemy każdy pasek na ekranie Home
            updateProgressBar('feed', data.feed || 0, goals.feed);
            updateProgressBar('walk', data.walk || 0, goals.walk);
            updateProgressBar('med', data.med || 0, goals.med);
            updateProgressBar('water', data.water || 0, goals.water);
        });
}

// Funkcja animująca pasek i aktualizująca licznik
function updateProgressBar(type, current, goal) {
    const countEl = document.getElementById(`count-${type}`);
    const goalEl = document.getElementById(`goal-${type}`);
    const bgEl = document.getElementById(`progress-bg-${type}`);
    
    if (countEl && goalEl && bgEl) {
        countEl.innerText = current;
        goalEl.innerText = goal;
        
        let percent = (current / goal) * 100;
        if (percent > 100) percent = 100;
        
        bgEl.style.width = `${percent}%`;
        
        // Zmiana koloru na zielony, gdy cel zostanie osiągnięty
        if (current >= goal) {
            bgEl.style.background = 'rgba(46, 213, 115, 0.2)';
            countEl.style.color = '#2ed573';
        } else {
            bgEl.style.background = 'rgba(52, 172, 224, 0.08)';
            countEl.style.color = 'var(--text-color)';
        }
    }
}

// Funkcja wywoływana po kliknięciu kafelka opieki
window.logDogActivity = async (type) => {
    const currentUid = localStorage.getItem('activeDogId') || auth.currentUser.uid;
    const today = new Date().toISOString().split('T')[0];
    
    const docRef = db.collection('users').doc(currentUid).collection('daily_care').doc(today);
    
    try {
        // Używamy "increment", żeby bezpiecznie dodać +1 nawet gdy dwa telefony klikną naraz
        await docRef.set({
            [type]: fb.firestore.FieldValue.increment(1),
            lastUpdated: fb.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        // Opcjonalnie: Zapis do dziennika historii
        const labels = { feed: "Nakarmiono", walk: "Spacer", med: "Podano leki", water: "Wymieniono wodę" };
        const icons = { feed: "🍖", walk: "🦮", med: "💊", water: "💧" };
        
        await db.collection('users').doc(currentUid).collection('journal').add({
            action: labels[type],
            icon: icons[type],
            timestamp: fb.firestore.FieldValue.serverTimestamp(),
            caretakerName: auth.currentUser.displayName || "Opiekun"
        });

        if (window.Waggle && window.Waggle.showToast) {
            window.Waggle.showToast(`✅ ${labels[type]}!`);
        }
        
    } catch (e) {
        console.error("Błąd zapisu aktywności:", e);
    }
};
