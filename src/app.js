import { state, clearListeners } from './core/state.js';
import { auth, db } from './core/firebase.js';
import { initAuth } from './modules/auth.js';
import { initMap, centerOnMe, centerOnTarget } from './modules/map.js';
import { startWalk, stopWalk } from './modules/walk.js';
import { loadPosts, saveCommunityPost, uploadImage, openLightbox } from './modules/posts.js';
import { loadInbox, sendMessage, openChat, closeActiveChat } from './modules/chat.js';

// SYSTEM POWIADOMIEŃ (Zastępuje brzydkie "alert()" z systemu)
window.Waggle = window.Waggle || {};
window.Waggle.showToast = (msg) => {
    let toast = document.getElementById('waggle-toast');
    if(!toast) {
        toast = document.createElement('div');
        toast.id = 'waggle-toast';
        toast.style.cssText = 'position:fixed; bottom:110px; left:50%; transform:translateX(-50%); background:#2d3436; color:#fff; padding:12px 24px; border-radius:50px; z-index:99999; font-size:14px; font-weight:800; box-shadow:0 10px 20px rgba(0,0,0,0.2); transition:opacity 0.3s; text-align:center; white-space:nowrap; pointer-events:none;';
        document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.style.opacity = '1';
    toast.style.display = 'block';
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(()=>toast.style.display='none',300); }, 3500);
}

// BAZA WIEDZY WBUDOWANA (Gwarancja działania)
const WIKI_DATA = {
    rasy: [
        {title: "Golden Retriever", desc: "Łagodny, inteligentny i oddany. Idealny pies rodzinny, wymaga dużo ruchu."},
        {title: "Owczarek Niemiecki", desc: "Lojalny, odważny. Świetny stróż, wymaga konsekwencji w szkoleniu."},
        {title: "Mops", desc: "Towarzyski, wesoły. Z racji budowy pyska źle znosi upały i wysiłek fizyczny."},
        {title: "Kundelek", desc: "Unikalny miks genów! Zazwyczaj zdrowsze i o wyjątkowym charakterze."}
    ],
    trening: [
        {title: "Luźna smycz (Zasada Drzewa)", desc: "Gdy pies napina smycz, zatrzymaj się. Rusz dopiero gdy smycz się rozluźni."},
        {title: "Awaryjne Przywołanie", desc: "Wołaj psa wesołym tonem, a gdy przybiegnie – nagradzaj jak za wygraną w lotto!"}
    ],
    sytuacje: [
        {title: "Mijanie innego psa", desc: "Zawsze pozwalaj psom minąć się łukiem, a nie na wprost. Nie zmuszaj do witania."},
        {title: "Pies zjada śmieci", desc: "Naucz komendy 'Zostaw'. Zawsze wymieniaj śmieci z ziemi na coś znacznie pyszniejszego z ręki."}
    ]
};

window.Waggle.openChat = openChat;
window.Waggle.closeActiveChat = closeActiveChat;
window.Waggle.centerOnTarget = centerOnTarget;
window.Waggle.openLightbox = openLightbox;
window.Waggle.deletePost = (id) => db.collection("posts").doc(id).delete();

// NOWOŚĆ: Otwieranie profilu użytkownika
window.Waggle.openUserMenu = (uid, name, avatar) => {
    if(uid === state.user.uid) return; // Nie otwieraj swojego własnego profilu na tablicy
    document.getElementById('actionUserName').innerText = name;
    document.getElementById('actionUserAvatar').src = avatar;
    const msgBtn = document.getElementById('actionMsgBtn');
    msgBtn.onclick = () => {
        document.getElementById('user-action-modal').style.display = 'none';
        document.querySelector('.nav-item[data-view="chat"]').click(); // Przełącz na czat
        window.Waggle.openChat(uid, name);
    };
    document.getElementById('user-action-modal').style.display = 'flex';
};

let pendingImageFile = null;

export function initApp() {
    loadSettings(); 
    initMap();
    loadPosts();
    loadInbox();
    updateStatsUI();
    fetchWeather(); // Pobieranie pogody
}

function fetchWeather() {
    if(state.location && state.location.lat) {
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${state.location.lat}&longitude=${state.location.lng}&current_weather=true`)
        .then(r=>r.json()).then(d => {
            const tempEl = document.getElementById('weather-temp');
            if(tempEl) tempEl.innerText = `${Math.round(d.current_weather.temperature)}°C`;
        }).catch(e=>console.warn("Błąd pogody:", e));
    } else {
        setTimeout(fetchWeather, 3000); // Spróbuj ponownie jeśli GPS jeszcze nie złapał
    }
}

function switchView(viewId) {
    clearListeners(); 
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('view-' + viewId).classList.add('active');
    document.querySelector(`.nav-item[data-view="${viewId}"]`).classList.add('active');
    
    if (viewId === 'map' && state.map) setTimeout(() => state.map.invalidateSize(), 300);
    if (viewId === 'community') loadPosts();
    if (viewId === 'chat') loadInbox();
    if (viewId === 'wiki') renderWiki('rasy'); // Wiki ładuje się zawsze!
}

document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('close-modal-btn')) e.target.closest('.modal').style.display = 'none';
    const navItem = e.target.closest('.nav-item');
    if (navItem) switchView(navItem.getAttribute('data-view'));

    if (e.target.closest('#centerBtn')) centerOnMe();
    if (e.target.closest('#startWalkBtn')) startWalk();
    if (e.target.closest('#stopWalkBtn')) { stopWalk(); setTimeout(updateStatsUI, 500); }
    
    // Zgłaszanie alertu
    if (e.target.closest('#triggerAlertBtn')) document.getElementById('alert-modal').style.display = 'flex';
    if (e.target.closest('#saveAlertBtn')) {
        const textInput = document.getElementById('alertTextInput');
        if (textInput && textInput.value && state.location.lat) {
            db.collection("alerts").add({ text: textInput.value, lat: state.location.lat, lng: state.location.lng, createdAt: Date.now(), creator: state.user.uid })
            .then(() => {
                document.getElementById('alert-modal').style.display = 'none';
                textInput.value = '';
                window.Waggle.showToast("Zagrożenie zgłoszone pomyślnie! ⚠️"); // Zmiana na ładny Toast
            }).catch(err => window.Waggle.showToast("Błąd zapisu: " + err.message));
        } else {
            window.Waggle.showToast("Brak GPS lub tekstu.");
        }
    }

    // Klikanie w filtry na tablicy
    if (e.target.closest('.top-pill') && e.target.closest('#view-community')) {
        const btn = e.target.closest('.top-pill');
        document.querySelectorAll('#view-community .top-pill').forEach(b => {
            b.style.background = 'transparent'; b.style.color = 'var(--text-color)';
        });
        btn.style.background = 'var(--text-color)'; btn.style.color = 'white';
        window.Waggle.showToast(`Filtrowanie: ${btn.innerText.trim()} (Wkrótce)`);
    }

    // Obsługa dodawania posta ze zdjęciem
    if (e.target.closest('#addPhotoBtn')) document.getElementById('postImageInput').click();
    if (e.target.closest('#removePostImageBtn')) {
        pendingImageFile = null; document.getElementById('post-image-preview-container').style.display = 'none';
    }
    if (e.target.closest('#addPostBtn')) document.getElementById('post-creator-modal').style.display = 'flex';
    if (e.target.closest('#publishPostBtn')) {
        const btn = e.target.closest('#publishPostBtn');
        const text = document.getElementById('postContent').value.trim();
        if(text.length < 3) return window.Waggle.showToast("Napisz coś więcej!");
        btn.disabled = true; btn.innerText = "WYSYŁANIE...";
        try {
            let finalUrl = null;
            if(pendingImageFile) finalUrl = await uploadImage(pendingImageFile);
            await saveCommunityPost(text, finalUrl);
            document.getElementById('post-creator-modal').style.display = 'none';
            document.getElementById('postContent').value = '';
            pendingImageFile = null;
            document.getElementById('post-image-preview-container').style.display = 'none';
            window.Waggle.showToast("Opublikowano! 🎉");
        } catch(err) { window.Waggle.showToast("Błąd wysyłania!"); } 
        finally { btn.disabled = false; btn.innerText = "OPUBLIKUJ"; }
    }

    // Zakładki w Wiki
    if (e.target.classList.contains('wiki-tab-btn')) {
        document.querySelectorAll('.wiki-tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        renderWiki(e.target.getAttribute('data-tab'));
    }

    // Zapisywanie profilu
    if (e.target.closest('#openEditProfileBtn')) {
        const p = state.profile || {};
        document.getElementById('setupName').value = p.name || "";
        document.getElementById('setupCity').value = p.city || "";
        const breedSelect = document.getElementById('setupBreed');
        if (breedSelect) breedSelect.value = p.breed || "";
        const routineSelect = document.getElementById('setupRoutine');
        if (routineSelect) routineSelect.value = p.routine || "brak";
        document.getElementById('profile-setup-modal').style.display = 'flex';
    }
    
    if (e.target.closest('#saveProfileBtn')) {
        const btn = e.target.closest('#saveProfileBtn');
        btn.innerText = "ZAPISYWANIE..."; btn.disabled = true;
        const d = { name: document.getElementById('setupName').value.trim(), city: document.getElementById('setupCity').value.trim() };
        const breedSelect = document.getElementById('setupBreed'); if(breedSelect) d.breed = breedSelect.value;
        const routineSelect = document.getElementById('setupRoutine'); if(routineSelect) d.routine = routineSelect.value;

        const avatarInput = document.getElementById('setupAvatarInput');
        const saveToDb = (data) => {
            db.collection("users").doc(state.user.uid).set(data, {merge:true}).then(() => {
                state.profile = {...state.profile, ...data};
                document.getElementById('profile-setup-modal').style.display = 'none';
                updateStatsUI();
                window.Waggle.showToast("Profil zapisany!");
                btn.innerText = "ZAPISZ"; btn.disabled = false;
            });
        };

        if (avatarInput && avatarInput.files.length > 0) {
            uploadImage(avatarInput.files[0]).then(url => { d.avatar = url; saveToDb(d); })
            .catch(err => { window.Waggle.showToast("Błąd zdjęcia"); btn.innerText = "ZAPISZ"; btn.disabled = false; });
        } else { saveToDb(d); }
    }

    if (e.target.closest('#openSettingsBtn')) document.getElementById('settings-modal').style.display = 'flex';
    if (e.target.closest('#saveSettingsBtn')) {
        localStorage.setItem('waggle_theme', document.getElementById('settingTheme').value);
        localStorage.setItem('waggle_font', document.getElementById('settingFontSize').value);
        loadSettings(); document.getElementById('settings-modal').style.display = 'none';
        window.Waggle.showToast("Ustawienia zapisane");
    }

    if (e.target.closest('#sendMsgBtn')) {
        const input = document.getElementById('chatInput');
        if (input && input.value.trim()) { sendMessage(input.value.trim()); input.value = ""; }
    }
    if (e.target.closest('#closeChatBtn')) closeActiveChat();
    if (e.target.closest('#loginBtn')) auth.signInWithEmailAndPassword(document.getElementById('authEmail').value, document.getElementById('authPass').value).catch(err => alert(err.message));
    if (e.target.closest('#logoutBtn')) auth.signOut().then(() => window.location.reload());
});

document.addEventListener('change', (e) => {
    if(e.target.id === 'postImageInput') {
        const file = e.target.files[0];
        if(file) {
            pendingImageFile = file;
            const reader = new FileReader();
            reader.onload = (ex) => {
                document.getElementById('post-image-preview').src = ex.target.result;
                document.getElementById('post-image-preview-container').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }
});

function renderWiki(tab) {
    let html = "";
    const items = WIKI_DATA[tab] || WIKI_DATA['rasy']; 
    items.forEach(item => {
        html += `<div class="post-card" style="border-left: 4px solid var(--secondary); padding-left: 15px; margin-bottom: 15px;">
                    <b style="font-size: 16px; color: var(--text-color);">${item.title}</b>
                    <p style="margin-top:8px; font-weight:600; font-size:14px; color:var(--text-muted); line-height: 1.4;">${item.desc}</p>
                 </div>`;
    });
    const container = document.getElementById('wiki-content');
    if (container) container.innerHTML = html;
}

function updateStatsUI() {
    if (!state.profile) return; 
    document.getElementById('profileNameDisplay').innerText = state.profile.name || "Piesek";
    const walks = state.profile.walkCount || 0;
    document.getElementById('statWalks').innerText = walks;
    document.getElementById('statDist').innerText = (walks * 1.2).toFixed(1);
    
    let level = "🌱 Nowik";
    if (walks >= 5) level = "🐕 Spacerowicz";
    if (walks >= 20) level = "🐺 Weteran Osiedla";
    if (walks >= 50) level = "👑 Alfa Stada";
    const lvlEl = document.getElementById('profileLevelDisplay');
    if (lvlEl) lvlEl.innerText = level;

    const avatarEl = document.getElementById('profileAvatar');
    if(avatarEl) avatarEl.src = state.profile.avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
}

function loadSettings() {
    const theme = localStorage.getItem('waggle_theme') || 'light';
    const font = localStorage.getItem('waggle_font') || '14px';
    if (theme === 'dark') document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
    document.documentElement.style.setProperty('--base-font-size', font);
}

initAuth(initApp);
