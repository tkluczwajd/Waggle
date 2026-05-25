// src/modules/map/liveFeed.js
import { db } from '../../core/firebase.js';
import { appState as state } from '../../core/state.js';
// Upewnij się, że ta ścieżka pasuje do Twojej struktury:
import { getDistance } from '../../services/geolocationService.js'; 

let feedQueue = []; // Kolejka powiadomień
let isDisplaying = false; // Flaga blokująca nakładanie się animacji

export function initLiveFeed() {
    const feedEl = document.getElementById('live-local-feed');
    const feedText = document.getElementById('feed-text');
    const feedIcon = document.getElementById('feed-icon');
    
    if (!feedEl) return;

    const appStartTime = Date.now();

    // 1. NASŁUCH POSTÓW (Alerty i Ustawki z dystansem)
    db.collection("posts")
      .where("timestamp", ">", new Date(appStartTime))
      .onSnapshot(snap => {
          snap.docChanges().forEach(change => {
              if (change.type === "added") {
                  const data = change.doc.data();
                  if (data.uid === state.user?.uid) return; 

                  let icon = "💬";
                  let text = `${data.author || 'Ktoś'} dodał wpis.`;
                  let distanceStr = "";

                  // Magia lokalności: obliczamy dystans
                  if (state.location?.lat && data.lat && data.lng) {
                      const dist = getDistance(state.location.lat, state.location.lng, data.lat, data.lng);
                      distanceStr = dist < 1 ? ` (${(dist * 1000).toFixed(0)}m stąd)` : ` (${dist.toFixed(1)}km stąd)`;
                  }

                  if (data.isAlert) {
                      icon = "⚠️";
                      text = `Uwaga! Nowy alert${distanceStr}`;
                  } else if (data.isEvent) {
                      icon = "📅";
                      text = `Nowa ustawka${distanceStr}!`;
                  }

                  addToFeedQueue(icon, text);
              }
          });
      });
      
    // 2. NASŁUCH NOWYCH SPACERÓW (Ktoś wyszedł z psem)
    // Nasłuchujemy walks, żeby wiedzieć, kto wstał z kanapy
    db.collection("walks")
      .where("timestamp", ">", appStartTime - 600000) // Bierzemy aktywne max 10 min wstecz
      .onSnapshot(snap => {
          snap.docChanges().forEach(change => {
              // Reagujemy tylko, gdy dokument faktycznie pojawia się jako nowy po odpaleniu aplikacji
              if (change.type === "added" && change.doc.data().timestamp > appStartTime) {
                  const data = change.doc.data();
                  if (data.uid === state.user?.uid) return;
                  
                  if (state.location?.lat && data.lat && data.lng) {
                      const dist = getDistance(state.location.lat, state.location.lng, data.lat, data.lng);
                      
                      // Hiperlokalność: powiadamiamy tylko o psach w promieniu np. 4 km
                      if (dist <= 4) { 
                         const distStr = dist < 1 ? `${(dist * 1000).toFixed(0)}m stąd` : `${dist.toFixed(1)}km stąd`;
                         addToFeedQueue("🐾", `${data.name} właśnie rozpoczął spacer (${distStr})!`);
                      }
                  }
              }
          });
      });

    // 3. PULS OKOLICY (Cykliczne podsumowanie)
    // Zamiast zasypywać usera powiadomieniami przy każdym kroku innych psów,
    // robimy "puls" co 3 minuty, który chwyta aktualny stan mapy.
    setInterval(() => {
        // Lekki hack zliczający wyrenderowane na UI koła "Stories"
        // Odejmujemy 1, żeby nie liczyć samego siebie (o ile jesteś wyrenderowany)
        const storiesContainer = document.getElementById('stories-container');
        if (!storiesContainer) return;
        
        const activeWalksCount = storiesContainer.querySelectorAll('.story-circle').length - 1; 
        
        if (activeWalksCount > 0) {
            addToFeedQueue("🌳", `${activeWalksCount} psich kumpli spaceruje teraz w okolicy.`);
        }
    }, 180000); // 3 minuty

    // -- SYSTEM KOLEJKOWANIA POWIADOMIEŃ --
    function addToFeedQueue(icon, text) {
        feedQueue.push({ icon, text });
        processQueue();
    }

    function processQueue() {
        if (isDisplaying || feedQueue.length === 0) return;
        
        isDisplaying = true;
        const item = feedQueue.shift();
        
        feedIcon.innerText = item.icon;
        feedText.innerText = item.text;
        
        feedEl.style.opacity = '1';
        feedEl.style.transform = 'translate(-50%, 0)';
        
        // Zwijamy animację po 4.5 sekundy
        setTimeout(() => {
            feedEl.style.opacity = '0';
            feedEl.style.transform = 'translate(-50%, -20px)';
            isDisplaying = false;
            
            // Dajemy 1.5 sekundy oddechu między powiadomieniami
            setTimeout(processQueue, 1500); 
        }, 4500);
    }
}

window.Waggle = window.Waggle || {};
window.Waggle.initLiveFeed = initLiveFeed;
