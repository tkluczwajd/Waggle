import { db } from '../core/firebase.js';

// Globalna referencja do kolekcji ulubionych
const favoritesRef = db.collection("favorites");

export async function toggleFavoriteInDb(uid, place) {
    if (!uid) return false;

    const docRef = favoritesRef.doc(uid);
    const docSnap = await docRef.get();
    
    let places = [];
    if (docSnap.exists) {
        places = docSnap.data().places || [];
    }

    // Sprawdzamy, czy miejsce już jest w ulubionych (po jego ID z OSM)
    const existsIndex = places.findIndex(p => p.id === place.id);
    
    if (existsIndex >= 0) {
        // Mamy to! Zatem użytkownik chce je USUNĄĆ
        places.splice(existsIndex, 1);
        await docRef.set({ places });
        return false; // Zwracamy false (już nie jest w ulubionych)
    } else {
        // Nie ma go w bazie. Użytkownik chce je DODAĆ
        // Zapisujemy tylko kluczowe dane, żeby nie śmiecić w Firestore
        const safePlace = {
            id: place.id,
            name: place.name,
            lat: place.lat,
            lng: place.lng,
            type: place.type,
            isDogPark: place.isDogPark || false
        };
        places.push(safePlace);
        await docRef.set({ places });
        return true; // Zwracamy true (dodano do ulubionych)
    }
}

// Nasłuchiwacz działający w czasie rzeczywistym
export function subscribeToFavorites(uid, callback) {
    if (!uid) return () => {}; // Pusta funkcja, jeśli brak usera

    return favoritesRef.doc(uid).onSnapshot(doc => {
        if (doc.exists) {
            callback(doc.data().places || []);
        } else {
            callback([]);
        }
    });
}
