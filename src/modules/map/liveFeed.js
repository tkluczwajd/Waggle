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

    db.collection("posts")
      .where("timestamp", ">", appStartTime)
      .onSnapshot(snap => {
          snap.docChanges().forEach(change => {
              if (change.type === "added") {
                  const data = change.doc.data();
                  if (data.uid === state.user?.uid) return; 
                  let icon = "💬", text = `${data.author || 'Ktoś'} dodał wpis.`, distanceStr = "";
                  if (state.location?.lat && data.lat && data.lng) {
                      const dist = getDistance(state.location.lat, state.location.lng, data.lat, data.lng);
                      distanceStr = dist < 1 ? ` (${(dist * 1000).toFixed(0)}m)` : ` (${dist.toFixed(1)}km)`;
                  }
                  if (data.isAlert) { icon = "⚠️", text = `Nowy alert${distanceStr}`; }
                  else if (data.isEvent) { icon = "📅", text = `Nowa ustawka${distanceStr}!`; }
                  addToFeedQueue(icon, text);
              }
          });
      });

    db.collection("walks")
      .where("timestamp", ">", appStartTime.getTime() - 600000) 
      .onSnapshot(snap => {
          snap.docChanges().forEach(change => {
              if (change.type === "added" && change.doc.data().timestamp > appStartTime.getTime()) {
                  const data = change.doc.data();
                  if (data.uid === state.user?.uid) return;
                  
                  // 🔥 MAGNES 2: Sprawdzamy, czy to pies z "Mojego Kręgu"
                  const isFollowed = state.profile?.following?.includes(data.uid);
                  
                  if (state.location?.lat && data.lat && data.lng) {
                      const dist = getDistance(state.location.lat, state.location.lng, data.lat, data.lng);
                      
                      // Jeżeli to VIP (obserwowany), dystans nie ma znaczenia, zawsze informujemy
                      if (dist <= 4 || isFollowed) { 
                         const distStr = dist < 1 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`;
                         
                         if (isFollowed) {
                             addToFeedQueue("⭐", `${data.name} z Twojego Kręgu wyszedł na spacer (${distStr})!`);
                         } else {
                             addToFeedQueue("🐾", `${data.name} rozpoczął spacer (${distStr})!`);
                         }
                      }
                  }
              }
          });
      });

    // 🔥 MAGNES 1: Inteligentny Puls Okolicy (co 3 minuty)
    setInterval(async () => {
        const storiesContainer = document.getElementById('stories-container');
        if (!storiesContainer) return;
        
        let others = 0;
        storiesContainer.querySelectorAll('.story-circle').forEach(el => {
            if(!el.innerText.includes('Ty')) others++;
        });
        
        let eventsToday = 0;
        try {
            const today = new Date();
            today.setHours(0,0,0,0);
            const postsSnap = await db.collection("posts").orderBy("timestamp", "desc").limit(20).get();
            postsSnap.forEach(doc => {
                const data = doc.data();
                if(data.isEvent && data.timestamp && (data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)) >= today) {
                    eventsToday++;
                }
            });
        } catch(e) { console.warn("Puls: Błąd pobierania ustawek.", e); }
        
        if (eventsToday > 0) { 
            addToFeedQueue("📅", `W okolicy zaplanowano dziś ${eventsToday} ustawki. Sprawdź Tablicę!`); 
        } else if (others > 0) { 
            addToFeedQueue("🌳", `${others} psich kumpli spaceruje teraz wokół Ciebie.`); 
        }
    }, 180000); 

    function addToFeedQueue(icon, text) { feedQueue.push({ icon, text }); processQueue(); }

    function processQueue() {
        if (isDisplaying || feedQueue.length === 0) return;
        isDisplaying = true;
        const item = feedQueue.shift();
        feedIcon.innerText = item.icon; feedText.innerText = item.text;
        feedEl.style.opacity = '1'; feedEl.style.transform = 'translate(-50%, 0)';
        setTimeout(() => {
            feedEl.style.opacity = '0'; feedEl.style.transform = 'translate(-50%, -20px)';
            setTimeout(() => { isDisplaying = false; processQueue(); }, 1000); 
        }, 4500);
    }
}

window.Waggle = window.Waggle || {};
window.Waggle.initLiveFeed = initLiveFeed;
