import { db } from '../../core/firebase.js';
import { appState as state } from '../../core/state.js';

let feedTimeout = null;

export function initLiveFeed() {
    const feedEl = document.getElementById('live-local-feed');
    const feedText = document.getElementById('feed-text');
    const feedIcon = document.getElementById('feed-icon');
    
    if (!feedEl) return;

    // Ustalamy "punkt zero" - nasłuchujemy tylko zdarzeń po uruchomieniu aplikacji
    const appStartTime = new Date();

    // Nasłuchiwanie na nowe Posty (Alerty, Ustawki, Ogłoszenia)
    db.collection("posts")
      .where("timestamp", ">", appStartTime)
      .onSnapshot(snap => {
          snap.docChanges().forEach(change => {
              // Reagujemy tylko na świeżo dodane dokumenty
              if (change.type === "added") {
                  const data = change.doc.data();
                  
                  // Ignorujemy własne akcje, żeby nie dostawać powiadomień o tym, co sami zrobiliśmy
                  if (data.uid === state.user?.uid) return; 

                  let icon = "💬";
                  let text = `${data.author || 'Ktoś'} dodał wpis na tablicy.`;

                  if (data.isAlert) {
                      icon = "⚠️";
                      text = `${data.author} zgłosił zagrożenie!`;
                  } else if (data.isEvent) {
                      icon = "📅";
                      text = `${data.author} organizuje ustawkę!`;
                  }

                  showFeedItem(icon, text);
              }
          });
      });
      
    // (Miejsce na przyszłe nasłuchiwanie aktywnych spacerów - np. db.collection('walks')...)

    function showFeedItem(icon, text) {
        feedIcon.innerText = icon;
        feedText.innerText = text;
        
        // Animacja wjazdu (dzięki transition z CSS ułoży się z pięknym efektem "sprężyny")
        feedEl.style.opacity = '1';
        feedEl.style.transform = 'translate(-50%, 0)';
        
        // Czyścimy poprzedni timer, jeśli powiadomienia wpadają jedno po drugim
        if(feedTimeout) clearTimeout(feedTimeout);
        
        // Animacja zjazdu po 4 sekundach
        feedTimeout = setTimeout(() => {
            feedEl.style.opacity = '0';
            feedEl.style.transform = 'translate(-50%, -20px)';
        }, 4000);
    }
}

// Globalne bindowanie na wypadek wywołań ręcznych
window.Waggle = window.Waggle || {};
window.Waggle.initLiveFeed = initLiveFeed;
