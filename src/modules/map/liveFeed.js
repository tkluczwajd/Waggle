// src/modules/map/liveFeed.js
import { db } from '../../core/firebase.js';
import { appState as state } from '../../core/state.js';
import { getDistance } from '../../services/geolocationService.js';

let feedQueue = [];
let isDisplaying = false;

export function initLiveFeed() {
    const feedEl = document.getElementById('live-local-feed');
    const feedText = document.getElementById('feed-text');
    const feedIcon = document.getElementById('feed-icon');
    
    if (!feedEl) return;

    const appStartTime = new Date();

    // 1. NASŁUCH POSTÓW (Alerty i Ustawki)
    db.collection("posts")
      .where("timestamp", ">", appStartTime)
      .onSnapshot(snap => {
          snap.docChanges().forEach(change => {
              if (change.type === "added") {
                  const data = change.doc.data();
                  if (data.uid === state.user?.uid) return; 

                  let icon = "💬";
                  let text = `${data.author || 'Ktoś'} dodał wpis na tablicy.`;
                  let distanceStr = "";

                  if (state.location?.lat && data.lat && data.lng) {
                      const dist = getDistance(state.location.lat, state.location.lng, data.lat, data.lng);
                      distanceStr = dist < 1 ? ` (${(dist * 1000).toFixed(0)}m)` : ` (${dist.toFixed(1)}km)`;
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

    // 2. NASŁUCH NOWYCH SPACERÓW
    db.collection("walks")
      .where("timestamp", ">", appStartTime.getTime() - 600000) 
      .onSnapshot(snap => {
          snap.docChanges().forEach(change => {
              if (change.type === "added" && change.doc.data().timestamp > appStartTime.getTime()) {
                  const data = change.doc.data();
                  if (data.uid === state.user?.uid) return;
                  
                  if (state.location?.lat && data.lat && data.lng) {
                      const dist = getDistance(state.location.lat, state.location.lng, data.lat, data.lng);
                      if (dist <= 4) { 
                         const distStr = dist < 1 ? `${(dist * 1000).toFixed(0)}m stąd` : `${dist.toFixed(1)}km stąd`;
                         addToFeedQueue("🐾", `${data.name} rozpoczął spacer (${distStr})!`);
                      }
                  }
              }
          });
      });

    // 3. PULS OKOLICY
    setInterval(() => {
        const storiesContainer = document.getElementById('stories-container');
        if (!storiesContainer) return;
        
        let others = 0;
        storiesContainer.querySelectorAll('.story-circle').forEach(el => {
            if(!el.innerText.includes('Ty')) others++;
        });
        
        if (others > 0) {
            addToFeedQueue("🌳", `${others} psich kumpli spaceruje teraz w okolicy.`);
        }
    }, 180000); // 3 minuty

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
        
        setTimeout(() => {
            feedEl.style.opacity = '0';
            feedEl.style.transform = 'translate(-50%, -20px)';
            setTimeout(() => {
                isDisplaying = false;
                processQueue();
            }, 1000); 
        }, 4000);
    }
}

window.Waggle = window.Waggle || {};
window.Waggle.initLiveFeed = initLiveFeed;
