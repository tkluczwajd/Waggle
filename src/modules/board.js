// src/modules/board.js
import { db, auth, fb } from "../core/firebase.js";

window.Waggle = window.Waggle || {};
let allPosts = [];
let currentPostId = null;
let currentCommentsUnsubscribe = null;

export function initBoardEngine() {
    console.log("🗣️ Inicjalizacja Nowej Tablicy z Komentarzami...");

    window.Waggle.togglePostTypeOptions = () => {
        const type = document.getElementById('post-type-select').value;
        const walkOptions = document.getElementById('post-walk-options');
        if (walkOptions) walkOptions.style.display = (type === 'walk') ? 'block' : 'none';
    };

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

        if (type === 'all') renderPosts(allPosts);
        else renderPosts(allPosts.filter(p => p.type === type));
    };

    // 🔥 LOGIKA POLUBIEŃ
    window.Waggle.likePost = async (postId) => {
        try {
            await db.collection('posts').doc(postId).update({
                likes: fb.firestore.FieldValue.increment(1)
            });
        } catch(e) { console.error("Błąd lajkowania", e); }
    };

    // 🔥 LOGIKA KOMENTARZY (Z SYSTEMEM FIREBASE)
    window.Waggle.openComments = (postId, postText) => {
        currentPostId = postId;
        document.getElementById('modal-question-text').innerText = postText;
        document.getElementById('qa-answers-modal').style.display = 'flex';
        
        const list = document.getElementById('answers-list');
        list.innerHTML = '<div style="text-align:center; font-size:12px; color:var(--text-muted); margin-top:20px; font-weight:700;">Ładowanie komentarzy... ⏳</div>';

        if (currentCommentsUnsubscribe) currentCommentsUnsubscribe();

        currentCommentsUnsubscribe = db.collection('posts').doc(postId).collection('comments')
            .orderBy('timestamp', 'asc')
            .onSnapshot(snapshot => {
                if (snapshot.empty) {
                    list.innerHTML = '<div style="text-align:center; margin-top: 40px;"><div style="font-size: 40px; margin-bottom: 10px;">🤫</div><div style="font-size:13px; color:var(--text-muted); font-weight:700;">Brak komentarzy. Bądź pierwszy!</div></div>';
                    return;
                }

                let html = '';
                snapshot.forEach(doc => {
                    const ans = doc.data();
                    const isMe = auth.currentUser && ans.authorId === auth.currentUser.uid;
                    const timeStr = ans.timestamp ? ans.timestamp.toDate().toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'}) : 'Teraz';
                    const align = isMe ? 'flex-end' : 'flex-start';
                    const bg = isMe ? 'var(--secondary)' : 'white';
                    const color = isMe ? 'white' : 'var(--text-color)';
                    const border = isMe ? 'none' : '1px solid var(--border-color)';
                    const radius = isMe ? '18px 18px 0 18px' : '18px 18px 18px 0';

                    html += `
                    <div style="display: flex; flex-direction: column; align-items: ${align}; margin-bottom: 15px;">
                        ${!isMe ? `<div style="font-size: 10px; color: var(--text-muted); font-weight: 800; margin-bottom: 4px; margin-left: 5px;">${ans.authorName}</div>` : ''}
                        <div style="background: ${bg}; color: ${color}; padding: 12px 16px; border-radius: ${radius}; border: ${border}; max-width: 85%; font-size: 13px; font-weight: 600; line-height: 1.4; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                            ${ans.text}
                        </div>
                        <div style="font-size: 9px; color: var(--text-muted); font-weight: 700; margin-top: 5px; ${isMe ? 'margin-right: 5px;' : 'margin-left: 5px;'}">${timeStr}</div>
                    </div>`;
                });
                list.innerHTML = html;
                setTimeout(() => { list.scrollTop = list.scrollHeight; }, 100);
            });
    };

    // Wysłanie komentarza
    const postAnswerBtn = document.getElementById('post-answer-btn');
    const answerInput = document.getElementById('new-answer-input');
    
    if(postAnswerBtn && answerInput) {
        const sendComment = async () => {
            if (!currentPostId) return;
            const text = answerInput.value.trim();
            if (!text) return;

            const userName = localStorage.getItem('userName') || (auth.currentUser ? auth.currentUser.email.split('@')[0] : "Opiekun");
            const uid = auth.currentUser ? auth.currentUser.uid : 'unknown';

            answerInput.value = '';

            try {
                const postRef = db.collection('posts').doc(currentPostId);
                await postRef.collection('comments').add({
                    text: text,
                    authorId: uid,
                    authorName: userName,
                    timestamp: fb.firestore.FieldValue.serverTimestamp()
                });
                // Podbijamy licznik w głównym poście
                await postRef.update({
                    commentsCount: fb.firestore.FieldValue.increment(1)
                });
            } catch(e) {
                console.error(e);
                alert("Błąd wysyłania komentarza.");
            }
        };
        postAnswerBtn.onclick = sendComment;
        answerInput.onkeypress = (e) => { if(e.key === 'Enter') sendComment(); };
    }

    // Publikacja Głównego Posta
    const publishBtn = document.getElementById('publish-post-btn');
    if (publishBtn) {
        publishBtn.addEventListener('click', async () => {
            const textEl = document.getElementById('post-content-input');
            const typeEl = document.getElementById('post-type-select');
            
            if (!textEl || !typeEl) return;
            const text = textEl.value.trim();
            const type = typeEl.value;
            
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

            if (type === 'walk') {
                postData.walkDate = document.getElementById('post-walk-date').value;
                postData.walkLocation = document.getElementById('post-walk-location').value || "W okolicy";
            }

            publishBtn.innerText = "WYSYŁANIE...";
            try {
                await db.collection('posts').add(postData);
                document.getElementById('post-creator-modal').style.display = 'none';
                textEl.value = '';
                if(window.Waggle.showToast) window.Waggle.showToast("✅ Opublikowano!");
            } catch(e) {
                console.error(e);
                alert("Błąd publikacji. Sprawdź konsole.");
            }
            publishBtn.innerText = "OPUBLIKUJ";
        });
    }

    listenToPosts();
}

function listenToPosts() {
    const container = document.getElementById('board-feed-container');
    
    db.collection('posts')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .onSnapshot(snapshot => {
            allPosts = [];
            snapshot.forEach(doc => {
                allPosts.push({ id: doc.id, ...doc.data() });
            });
            renderPosts(allPosts);
        }, (error) => {
            console.error("🔥 Błąd pobierania tablicy:", error);
            if (container) {
                container.innerHTML = `<div style="text-align: center; color: var(--danger); font-size: 13px; font-weight: 700; margin-top: 20px;">🚨 Błąd połączenia z bazą danych.<br>Sprawdź konsolę deweloperską.</div>`;
            }
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

        let contentHtml = '';
        let badgeHtml = '';
        let borderStyle = '1px solid var(--border-color)';
        
        if (post.type === 'alert') {
            borderStyle = '2px solid rgba(231, 76, 60, 0.4)';
            badgeHtml = `<div style="background: rgba(231, 76, 60, 0.1); color: var(--danger); font-size: 10px; font-weight: 900; padding: 4px 8px; border-radius: 8px; margin-left: auto;">⚠️ OSTRZEŻENIE</div>`;
            contentHtml = `<p style="margin: 0; font-size: 14px; color: var(--danger); font-weight: 800; line-height: 1.5;">${post.text}</p>`;
        
        } else if (post.type === 'walk') {
            badgeHtml = `<div style="background: rgba(52, 172, 224, 0.1); color: var(--secondary); font-size: 10px; font-weight: 900; padding: 4px 8px; border-radius: 8px; margin-left: auto;">🚶 USTAWKA</div>`;
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
            if (post.type === 'notice') badgeHtml = `<div style="background: rgba(46, 213, 115, 0.1); color: #2ed573; font-size: 10px; font-weight: 900; padding: 4px 8px; border-radius: 8px; margin-left: auto;">🏠 OGŁOSZENIE</div>`;
            contentHtml = `<p style="margin: 0; font-size: 14px; color: var(--text-color); font-weight: 600; line-height: 1.5;">${post.text}</p>`;
        }

        html += `
        <div style="background: white; border-radius: 20px; padding: 18px; border: ${borderStyle}; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: #2d3436; color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900;">${post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U'}</div>
                <div>
                    <div style="font-size: 13px; font-weight: 900; color: var(--text-color);">${post.authorName || 'Użytkownik'}</div>
                    <div style="font-size: 10px; font-weight: 700; color: var(--text-muted);">${timeStr}</div>
                </div>
                ${badgeHtml}
            </div>
            
            <div style="margin-bottom: 15px;">
                ${contentHtml}
            </div>
            
            <!-- 🔥 PODŁĄCZAMY LAJKI I KOMENTARZE -->
            <div style="display: flex; align-items: center; gap: 15px; border-top: 1px solid var(--bg-color); padding-top: 12px;">
                <button onclick="window.Waggle.likePost('${post.id}')" style="background: none; border: none; display: flex; align-items: center; gap: 5px; cursor: pointer; padding: 0;">
                    <span style="font-size: 16px; color: var(--danger);">❤️</span>
                    <span style="font-size: 12px; font-weight: 800; color: var(--text-muted);">${post.likes || 0}</span>
                </button>
                <button onclick="window.Waggle.openComments('${post.id}', '${post.text.replace(/'/g, "\\'")}')" style="background: none; border: none; display: flex; align-items: center; gap: 5px; cursor: pointer; padding: 0;">
                    <span style="font-size: 16px;">💬</span>
                    <span style="font-size: 12px; font-weight: 800; color: var(--text-muted);">${post.commentsCount || 0}</span>
                </button>
            </div>
        </div>
        `;
    });
    
    container.innerHTML = html;
}
