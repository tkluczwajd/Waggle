// src/modules/board.js
import { db, auth, fb } from "../core/firebase.js";

window.Waggle = window.Waggle || {};
let allPosts = [];

export function initBoardEngine() {
    console.log("🗣️ Inicjalizacja Nowej, Głównej Tablicy...");

    // Pokazywanie/ukrywanie opcji daty dla Ustawki na spacer
    window.Waggle.togglePostTypeOptions = () => {
        const type = document.getElementById('post-type-select').value;
        const walkOptions = document.getElementById('post-walk-options');
        if (type === 'walk') {
            walkOptions.style.display = 'block';
        } else {
            walkOptions.style.display = 'none';
        }
    };

    // Filtrowanie z przycisków na górze
    window.Waggle.filterBoard = (type, btnElement) => {
        document.querySelectorAll('.board-filter-btn').forEach(btn => {
            btn.style.background = 'white';
            btn.style.color = 'var(--text-color)';
            btn.style.boxShadow = 'none';
        });
        
        if (btnElement) {
            btnElement.style.background = 'var(--text-color)';
            btnElement.style.color = 'white';
            btnElement.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
        }

        if (type === 'all') {
            renderPosts(allPosts);
        } else {
            renderPosts(allPosts.filter(p => p.type === type));
        }
    };

    // Publikacja nowego wpisu
    const publishBtn = document.getElementById('publish-post-btn');
    if (publishBtn) {
        publishBtn.addEventListener('click', async () => {
            const text = document.getElementById('post-content-input').value.trim();
            const type = document.getElementById('post-type-select').value;
            
            if (!text) return alert("Wpisz treść posta!");

            const postData = {
                type: type,
                text: text,
                authorId: auth.currentUser ? auth.currentUser.uid : 'anon',
                authorName: localStorage.getItem('userName') || (auth.currentUser ? auth.currentUser.email.split('@')[0] : "Opiekun"),
                timestamp: fb.firestore.FieldValue.serverTimestamp(),
                likes: 0,
                commentsCount: 0
            };

            // Jeśli to spacer, pobierzmy datę i miejsce
            if (type === 'walk') {
                postData.walkDate = document.getElementById('post-walk-date').value;
                postData.walkLocation = document.getElementById('post-walk-location').value || "W okolicy";
            }

            publishBtn.innerText = "WYSYŁANIE...";
            try {
                await db.collection('posts').add(postData);
                document.getElementById('post-creator-modal').style.display = 'none';
                document.getElementById('post-content-input').value = '';
                if(window.Waggle.showToast) window.Waggle.showToast("✅ Opublikowano na tablicy!");
            } catch(e) {
                console.error(e);
                alert("Błąd publikacji.");
            }
            publishBtn.innerText = "OPUBLIKUJ";
        });
    }

    // Odpalamy nasłuchiwanie postów z Firebase
    listenToPosts();
}

function listenToPosts() {
    db.collection('posts')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .onSnapshot(snapshot => {
            allPosts = [];
            snapshot.forEach(doc => {
                allPosts.push({ id: doc.id, ...doc.data() });
            });
            renderPosts(allPosts);
        });
}

function renderPosts(posts) {
    const container = document.getElementById('board-feed-container');
    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; margin-top: 40px;">
                <div style="font-size: 40px; margin-bottom: 10px;">🍃</div>
                <div style="color: var(--text-color); font-weight: 800; font-size: 16px;">Tutaj jeszcze nic nie ma!</div>
                <div style="color: var(--text-muted); font-size: 12px; margin-top: 5px;">Bądź pierwszy i wrzuć fotkę psa lub zadaj pytanie.</div>
            </div>`;
        return;
    }

    let html = '';
    posts.forEach(post => {
        
        // 1. Formatowanie czasu
        let timeStr = 'Przed chwilą';
        if (post.timestamp && typeof post.timestamp.toDate === 'function') {
            const d = post.timestamp.toDate();
            const today = new Date();
            if(d.toDateString() === today.toDateString()) {
                timeStr = `Dziś, ${d.toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'})}`;
            } else {
                timeStr = d.toLocaleDateString('pl-PL', {day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'});
            }
        }

        // 2. Rysowanie wnętrza w zależności od TYPU POSTA
        let contentHtml = '';
        let badgeHtml = '';
        let borderStyle = '1px solid var(--border-color)';
        
        if (post.type === 'alert') {
            borderStyle = '2px solid rgba(231, 76, 60, 0.4)';
            badgeHtml = `<div style="background: rgba(231, 76, 60, 0.1); color: var(--danger); font-size: 10px; font-weight: 900; padding: 4px 8px; border-radius: 8px; margin-left: auto;">⚠️ OSTRZEŻENIE</div>`;
            contentHtml = `<p style="margin: 0; font-size: 14px; color: var(--danger); font-weight: 800; line-height: 1.5;">${post.text}</p>`;
        
        } else if (post.type === 'walk') {
            badgeHtml = `<div style="background: rgba(52, 172, 224, 0.1); color: var(--secondary); font-size: 10px; font-weight: 900; padding: 4px 8px; border-radius: 8px; margin-left: auto;">🚶 USTAWKA SPACEROWA</div>`;
            
            // Formatowanie wybranej daty spaceru
            let walkTime = "Wkrótce";
            if (post.walkDate) {
                const wd = new Date(post.walkDate);
                walkTime = `${wd.toLocaleDateString('pl-PL', {day:'numeric', month:'short'})} o ${wd.toLocaleTimeString('pl-PL', {hour:'2-digit', minute:'2-digit'})}`;
            }

            contentHtml = `
                <p style="margin: 0 0 10px 0; font-size: 14px; color: var(--text-color); font-weight: 600; line-height: 1.5;">${post.text}</p>
                <div style="background: var(--bg-color); border-radius: 12px; padding: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px dashed var(--border-color);">
                    <div>
                        <div style="font-size: 11px; color: var(--text-muted); font-weight: 800;">📍 ${post.walkLocation || 'W okolicy'}</div>
                        <div style="font-size: 13px; color: var(--text-color); font-weight: 900;">📅 ${walkTime}</div>
                    </div>
                    <button onclick="alert('Dołączyłeś do spaceru!')" style="background: var(--secondary); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 900; cursor: pointer;">Będę! 👍</button>
                </div>
            `;

        } else if (post.type === 'question') {
            badgeHtml = `<div style="background: rgba(255, 177, 66, 0.1); color: #e1b12c; font-size: 10px; font-weight: 900; padding: 4px 8px; border-radius: 8px; margin-left: auto;">❓ PYTANIE</div>`;
            contentHtml = `<p style="margin: 0; font-size: 15px; color: var(--text-color); font-weight: 800; line-height: 1.5;">${post.text}</p>`;
        
        } else {
            // Domyślny wygląd: Zdjęcia / Ogłoszenia
            let isNotice = post.type === 'notice';
            if (isNotice) badgeHtml = `<div style="background: rgba(46, 213, 115, 0.1); color: #2ed573; font-size: 10px; font-weight: 900; padding: 4px 8px; border-radius: 8px; margin-left: auto;">🏠 OGŁOSZENIE</div>`;
            contentHtml = `<p style="margin: 0; font-size: 14px; color: var(--text-color); font-weight: 600; line-height: 1.5;">${post.text}</p>`;
            // Miejsce na ewentualne zdjęcie
            // contentHtml += `<img src="tutaj_url_zdjecia" style="width: 100%; border-radius: 12px; margin-top: 10px;">`;
        }

        // 3. Budowanie całej karty posta
        html += `
        <div style="background: white; border-radius: 20px; padding: 18px; border: ${borderStyle}; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
            
            <!-- Nagłówek Autora -->
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: #2d3436; color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900;">${post.authorName.charAt(0).toUpperCase()}</div>
                <div>
                    <div style="font-size: 13px; font-weight: 900; color: var(--text-color);">${post.authorName}</div>
                    <div style="font-size: 10px; font-weight: 700; color: var(--text-muted);">${timeStr}</div>
                </div>
                ${badgeHtml}
            </div>
            
            <!-- Zawartość -->
            <div style="margin-bottom: 15px;">
                ${contentHtml}
            </div>
            
            <!-- Stopka (Lajki i Komentarze) -->
            <div style="display: flex; align-items: center; gap: 15px; border-top: 1px solid var(--bg-color); padding-top: 12px;">
                <button onclick="alert('Polubiono!')" style="background: none; border: none; display: flex; align-items: center; gap: 5px; cursor: pointer; padding: 0;">
                    <span style="font-size: 16px; color: var(--danger);">❤️</span>
                    <span style="font-size: 12px; font-weight: 800; color: var(--text-muted);">${post.likes || 0}</span>
                </button>
                <button onclick="alert('Wkrótce otworzy się widok komentarzy!')" style="background: none; border: none; display: flex; align-items: center; gap: 5px; cursor: pointer; padding: 0;">
                    <span style="font-size: 16px;">💬</span>
                    <span style="font-size: 12px; font-weight: 800; color: var(--text-muted);">${post.commentsCount || 0}</span>
                </button>
            </div>
        </div>
        `;
    });
    
    container.innerHTML = html;
}
