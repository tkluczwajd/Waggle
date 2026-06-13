// src/modules/board.js
import { db, auth, fb } from "../core/firebase.js";

window.Waggle = window.Waggle || {};
let allPosts = [];
let currentPostId = null;
let currentCommentsUnsubscribe = null;
let selectedImageBase64 = null;
let boardUnsubscribe = null; // 🔥 Referencja do nasłuchiwacza na poziomie modułu

export function initBoardEngine() {
    console.log("🗣️ Inicjalizacja Pancernej Tablicy ze strażnikiem Auth...");

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

    const mapAlertBtn = document.getElementById('triggerAlertBtn');
    if (mapAlertBtn) {
        const newMapAlertBtn = mapAlertBtn.cloneNode(true);
        mapAlertBtn.parentNode.replaceChild(newMapAlertBtn, mapAlertBtn);
        newMapAlertBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const typeSelect = document.getElementById('post-type-select');
            if(typeSelect) typeSelect.value = 'alert'; 
            window.Waggle.togglePostTypeOptions();
            document.getElementById('post-creator-modal').style.display = 'flex';
        });
    }

    const addPhotoBtn = document.getElementById('addPhotoBtn');
    const imageInput = document.getElementById('postImageInput');
    const previewContainer = document.getElementById('post-image-preview-container');
    const previewImg = document.getElementById('post-image-preview');

    if (addPhotoBtn && imageInput) {
        addPhotoBtn.onclick = (e) => {
            e.preventDefault();
            imageInput.value = ''; 
            imageInput.click();
        };

        imageInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            setTimeout(() => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 800;
                        const MAX_HEIGHT = 800;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                        } else {
                            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);

                        selectedImageBase64 = canvas.toDataURL('image/jpeg', 0.6);
                        
                        if (previewImg) previewImg.src = selectedImageBase64;
                        if (previewContainer) previewContainer.style.display = 'block';
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }, 150); 
        };
    }

    window.Waggle.removePostPhoto = () => {
        selectedImageBase64 = null;
        if (previewImg) previewImg.src = '';
        if (previewContainer) previewContainer.style.display = 'none';
        if (imageInput) imageInput.value = '';
    };

    const publishBtn = document.getElementById('publish-post-btn');
    if (publishBtn) {
        const newPublishBtn = publishBtn.cloneNode(true);
        publishBtn.parentNode.replaceChild(newPublishBtn, publishBtn);

        newPublishBtn.addEventListener('click', async () => {
            const textEl = document.getElementById('post-content-input');
            const typeEl = document.getElementById('post-type-select');
            
            if (!textEl || !typeEl) return;
            const text = textEl.value.trim();
            const type = typeEl.value;
            
            if (!text && !selectedImageBase64) return alert("Musisz wpisać treść lub dodać zdjęcie!");

            let safeUserName = "Psiarz";
            const localName = localStorage.getItem('userName');
            if (localName) {
                safeUserName = localName;
            } else if (auth.currentUser && auth.currentUser.email) {
                safeUserName = auth.currentUser.email.split('@')[0];
            }

            const postData = {
                type: type,
                text: text,
                authorId: auth.currentUser ? auth.currentUser.uid : 'anonim',
                authorName: safeUserName,
                timestamp: fb.firestore.FieldValue.serverTimestamp(),
                likes: 0,
                commentsCount: 0,
                attendees: []
            };

            if (selectedImageBase64) postData.imageUrl = selectedImageBase64;

            if (type === 'walk') {
                postData.walkDate = document.getElementById('post-walk-date').value;
                postData.walkLocation = document.getElementById('post-walk-location').value || "W okolicy";
            }

            newPublishBtn.innerText = "WYSYŁANIE...";
            try {
                await db.collection('posts').add(postData);
                document.getElementById('post-creator-modal').style.display = 'none';
                textEl.value = '';
                window.Waggle.removePostPhoto();
                if(window.Waggle.showToast) window.Waggle.showToast("✅ Opublikowano!");
            } catch(e) {
                console.error("Błąd zapisu:", e);
                alert("Błąd publikacji.");
            }
            newPublishBtn.innerText = "OPUBLIKUJ";
        });
    }

    window.Waggle.joinWalk = async (postId) => {
        const uid = auth.currentUser ? auth.currentUser.uid : 'anon';
        try {
            await db.collection('posts').doc(postId).update({ attendees: fb.firestore.FieldValue.arrayUnion(uid) });
            if(window.Waggle.showToast) window.Waggle.showToast("✅ Dołączyłeś do spaceru!");
        } catch(e) { console.error("Błąd", e); }
    };

    window.Waggle.likePost = async (postId) => {
        try {
            await db.collection('posts').doc(postId).update({ likes: fb.firestore.FieldValue.increment(1) });
        } catch(e) { console.error("Błąd lajkowania", e); }
    };

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

    const postAnswerBtn = document.getElementById('post-answer-btn');
    const answerInput = document.getElementById('new-answer-input');
    
    if(postAnswerBtn && answerInput) {
        const newPostAnswerBtn = postAnswerBtn.cloneNode(true);
        postAnswerBtn.parentNode.replaceChild(newPostAnswerBtn, postAnswerBtn);

        const sendComment = async () => {
            if (!currentPostId) return;
            const text = answerInput.value.trim();
            if (!text) return;

            let safeUserName = "Psiarz";
            const localName = localStorage.getItem('userName');
            if (localName) {
                safeUserName = localName;
            } else if (auth.currentUser && auth.currentUser.email) {
                safeUserName = auth.currentUser.email.split('@')[0];
            }

            const uid = auth.currentUser ? auth.currentUser.uid : 'anonim';
            answerInput.value = '';

            try {
                const postRef = db.collection('posts').doc(currentPostId);
                await postRef.collection('comments').add({
                    text: text, authorId: uid, authorName: safeUserName, timestamp: fb.firestore.FieldValue.serverTimestamp()
                });
                await postRef.update({ commentsCount: fb.firestore.FieldValue.increment(1) });
            } catch(e) { console.error(e); }
        };
        newPostAnswerBtn.onclick = sendComment;
        answerInput.onkeypress = (e) => { if(e.key === 'Enter') sendComment(); };
    }

    // Odpalamy inteligentny strumień postów
    listenToPosts();
}

// 🔥 POPRAWIONA, INTELIGENTNA FUNKCJA NASŁUCHIWANIA Z SECURE AUTH WATCHER
function listenToPosts() {
    const container = document.getElementById('board-feed-container');
    
    // Czekamy bezpiecznie na załadowanie profilu użytkownika przez Firebase
    auth.onAuthStateChanged(user => {
        if (!user) {
            if (container) container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 13px; font-weight: 700; margin-top: 20px;">Weryfikacja sesji w toku... 🔐</div>`;
            if (boardUnsubscribe) { boardUnsubscribe(); boardUnsubscribe = null; }
            return;
        }

        // Zapobiegamy wielokrotnym połączeniom (duplikatom)
        if (boardUnsubscribe) return;

        if (container && allPosts.length === 0) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 13px; font-weight: 700; margin-top: 20px;">Ładowanie tablicy... ⏳</div>`;
        }

        boardUnsubscribe = db.collection('posts')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .onSnapshot(snapshot => {
                allPosts = [];
                snapshot.forEach(doc => { allPosts.push({ id: doc.id, ...doc.data() }); });
                renderPosts(allPosts);
            }, (error) => {
                console.error("🔥 Stały błąd bazy danych posts:", error);
                if (container && allPosts.length === 0) {
                    container.innerHTML = `<div style="text-align: center; color: var(--danger); font-size: 13px; font-weight: 700; margin-top: 20px;">🚨 Brak uprawnień do bazy. Skontaktuj się z administratorem.</div>`;
                }
            });
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
    } else {
        const currentUid = auth.currentUser ? auth.currentUser.uid : 'anonim';
        let html = '';

        posts.forEach(post => {
            let timeStr = 'Przed chwilą';
            if (post.timestamp && typeof post.timestamp.toDate === 'function') {
                const d = post.timestamp.toDate();
                if(d.toDateString() === new Date().toDateString()) timeStr = `Dziś, ${d.toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'})}`;
                else timeStr = d.toLocaleDateString('pl-PL', {day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'});
            }

            let contentHtml = '';
            let badgeHtml = '';
            let borderStyle = '1px solid var(--border-color)';
            const imageHtml = post.imageUrl ? `<img src="${post.imageUrl}" style="width: 100%; border-radius: 12px; margin-top: 10px; max-height: 350px; object-fit: cover;">` : '';

            if (post.type === 'alert') {
                borderStyle = '2px solid rgba(231, 76, 60, 0.4)';
                badgeHtml = `<div style="background: rgba(231, 76, 60, 0.1); color: var(--danger); font-size: 10px; font-weight: 900; padding: 4px 8px; border-radius: 8px; margin-left: auto;">⚠️ OSTRZEŻENIE</div>`;
                contentHtml = `<p style="margin: 0; font-size: 14px; color: var(--danger); font-weight: 800; line-height: 1.5;">${post.text}</p>${imageHtml}`;
            } else if (post.type === 'walk') {
                badgeHtml = `<div style="background: rgba(52, 172, 224, 0.1); color: var(--secondary); font-size: 10px; font-weight: 900; padding: 4px 8px; border-radius: 8px; margin-left: auto;">🚶 USTAWKA</div>`;
                let walkTime = "Wkrótce";
                if (post.walkDate) {
                    const wd = new Date(post.walkDate);
                    walkTime = `${wd.toLocaleDateString('pl-PL', {day:'numeric', month:'short'})} o ${wd.toLocaleTimeString('pl-PL', {hour:'2-digit', minute:'2-digit'})}`;
                }
                const attendeesCount = post.attendees ? post.attendees.length : 0;
                const hasJoined = post.attendees && post.attendees.includes(currentUid);
                const buttonHtml = hasJoined 
                    ? `<button style="background: var(--bg-color); color: var(--primary); border: 1px solid var(--primary); padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 900; cursor: default;">Dołączyłeś ✅</button>`
                    : `<button onclick="window.Waggle.joinWalk('${post.id}')" style="background: var(--secondary); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 900; cursor: pointer;">Będę! 👍</button>`;
                contentHtml = `
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: var(--text-color); font-weight: 600; line-height: 1.5;">${post.text}</p>${imageHtml}
                    <div style="background: var(--bg-color); border-radius: 12px; padding: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px dashed var(--border-color); margin-top: 10px;">
                        <div>
                            <div style="font-size: 11px; color: var(--text-muted); font-weight: 800;">📍 ${post.walkLocation || 'W okolicy'}</div>
                            <div style="font-size: 13px; color: var(--text-color); font-weight: 900;">📅 ${walkTime}</div>
                            ${attendeesCount > 0 ? `<div style="font-size: 10px; color: var(--secondary); font-weight: 800; margin-top: 4px;">🐕 ${attendeesCount} psów dołączy!</div>` : ''}
                        </div>
                        ${buttonHtml}
                    </div>`;
            } else if (post.type === 'question') {
                badgeHtml = `<div style="background: rgba(255, 177, 66, 0.1); color: #e1b12c; font-size: 10px; font-weight: 900; padding: 4px 8px; border-radius: 8px; margin-left: auto;">❓ PYTANIE</div>`;
                contentHtml = `<p style="margin: 0; font-size: 15px; color: var(--text-color); font-weight: 800; line-height: 1.5;">${post.text}</p>${imageHtml}`;
            } else {
                if (post.type === 'notice') badgeHtml = `<div style="background: rgba(46, 213, 115, 0.1); color: #2ed573; font-size: 10px; font-weight: 900; padding: 4px 8px; border-radius: 8px; margin-left: auto;">🏠 OGŁOSZENIE</div>`;
                contentHtml = `<p style="margin: 0; font-size: 14px; color: var(--text-color); font-weight: 600; line-height: 1.5;">${post.text}</p>${imageHtml}`;
            }

            html += `
            <div style="background: white; border-radius: 20px; padding: 18px; border: ${borderStyle}; box-shadow: 0 4px 10px rgba(0,0,0,0.02); margin-bottom: 15px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: #2d3436; color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900;">${post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U'}</div>
                    <div>
                        <div style="font-size: 13px; font-weight: 900; color: var(--text-color);">${post.authorName || 'Użytkownik'}</div>
                        <div style="font-size: 10px; font-weight: 700; color: var(--text-muted);">${timeStr}</div>
                    </div>
                    ${badgeHtml}
                </div>
                <div style="margin-bottom: 15px;">${contentHtml}</div>
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
            </div>`;
        });
        container.innerHTML = html;
    }

    // Synchronizacja z mapą
    const activeAlertPill = document.getElementById('active-alert-pill');
    if (activeAlertPill) {
        const hasRecentAlert = posts.some(p => {
            if (p.type !== 'alert') return false;
            if (!p.timestamp) return true;
            return (new Date() - p.timestamp.toDate()) < 24 * 60 * 60 * 1000;
        });

        activeAlertPill.style.cssText = hasRecentAlert 
            ? 'display: block !important; background: var(--danger); color: white; cursor: pointer;' 
            : 'display: none !important;';

        const newPill = activeAlertPill.cloneNode(true);
        activeAlertPill.parentNode.replaceChild(newPill, activeAlertPill);

        newPill.onclick = () => {
            const boardTab = document.querySelector('[data-view="community"]');
            if (boardTab) boardTab.click();
            
            setTimeout(() => {
                const alertFilterBtn = Array.from(document.querySelectorAll('.board-filter-btn')).find(b => b.innerText.includes('Alerty'));
                if (alertFilterBtn) window.Waggle.filterBoard('alert', alertFilterBtn);
            }, 100);
        };
    }
}
