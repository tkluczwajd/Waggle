// --- IMPORTY CORE ---
import { state } from './core/state.js';
import { auth, db, fb } from './core/firebase.js';
import { initRouter } from './core/router.js'; 
import { eventBus } from './core/eventBus.js'; 

// --- IMPORTY MODUŁÓW ---
import { initAuth } from './modules/auth.js';
import { initMap, centerOnMe, centerOnTarget, nearbyPlaces } from './modules/map.js'; 
import { startWalk, stopWalk } from './modules/walk.js';
import { loadPosts, saveCommunityPost, uploadImage, openLightbox, setPostFilter, togglePostLike, openPostComments, addPostComment } from './modules/posts.js';
import { loadInbox, sendMessage, openChat, closeActiveChat, searchUsers, toggleStado, sendChatImage } from './modules/chat.js';

window.Waggle = window.Waggle || {};

// SYSTEM POWIADOMIEŃ
window.Waggle.showToast = (msg) => {
    let toast = document.getElementById('waggle-toast');
    if(!toast) {
        toast = document.createElement('div');
        toast.id = 'waggle-toast';
        toast.style.cssText = 'position:fixed; bottom:110px; left:50%; transform:translateX(-50%); background:#2d3436; color:#fff; padding:12px 24px; border-radius:50px; z-index:99999; font-size:14px; font-weight:800; box-shadow:0 10px 20px rgba(0,0,0,0.2); transition:opacity 0.3s; text-align:center; white-space:nowrap; pointer-events:none;';
        document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.style.opacity = '1'; toast.style.display = 'block';
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(()=>toast.style.display='none',300); }, 3500);
}

function getWeatherIcon(code) {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 55 || (code >= 61 && code <= 65) || (code >= 80 && code <= 82)) return '🌧️';
    if (code <= 77) return '❄️';
    if (code >= 95) return '⛈️';
    return '🌡️';
}

// BINDINGI GLOBALNE
window.Waggle.openChat = openChat;
window.Waggle.closeActiveChat = closeActiveChat;
window.Waggle.centerOnTarget = centerOnTarget;
window.Waggle.openLightbox = openLightbox;
window.Waggle.deletePost = (id) => db.collection("posts").doc(id).delete();
window.Waggle.togglePostLike = togglePostLike;
window.Waggle.openPostComments = openPostComments;
window.Waggle.searchUsers = searchUsers;
window.Waggle.toggleStado = toggleStado; 

window.Waggle.openUserMenu = (uid, name, avatar, lat = null, lng = null) => {
    if(uid === state.user.uid) return; 
    document.getElementById('actionUserName').innerText = name;
    document.getElementById('actionUserAvatar').src = avatar;
    const msgBtn = document.getElementById('actionMsgBtn');
    msgBtn.onclick = () => {
        document.getElementById('user-action-modal').style.display = 'none';
        document.querySelector('.nav-item[data-view="chat"]').click(); 
        window.Waggle.openChat(uid, name);
    };
    const mapBtn = document.getElementById('actionMapBtn');
    if (mapBtn) {
        if (lat !== null && lng !== null) {
            mapBtn.style.display = 'inline-block';
            mapBtn.onclick = () => {
                document.getElementById('user-action-modal').style.display = 'none';
                window.Waggle.centerOnTarget(lat, lng);
            };
        } else { mapBtn.style.display = 'none'; }
    }
    document.getElementById('user-action-modal').style.display = 'flex';
};

window.Waggle.renderPlaces = () => {
    const container = document.getElementById('places-container');
    if (!container) return;
    if (nearbyPlaces.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px; color:var(--text-muted);">Szukam parków w okolicy... 🧭</p>';
        return;
    }
    let html = "";
    nearbyPlaces.forEach(place => {
        const icon = place.isDogPark ? '🏞️' : '🌳';
        const color = place.isDogPark ? 'var(--secondary)' : 'var(--primary)';
        html += `
            <div class="post-card" style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; padding: 15px; border-left: 4px solid ${color};">
                <div style="display:flex; align-items:center; gap:15px;">
                    <div style="font-size:30px;">${icon}</div>
                    <div>
                        <b style="font-size:16px; color:var(--text-color);">${place.name}</b><br>
                        <span style="font-size:12px; color:var(--text-muted); font-weight:800;">${place.isDogPark ? 'Wybieg' : 'Park'} • ${place.distance.toFixed(1)} km</span>
                    </div>
                </div>
                <button class="btn-outline" style="padding:8px 12px; font-size:12px; border-color:${color}; color:${color}; width:auto;" onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}', '_blank')">Prowadź</button>
            </div>
        `;
    });
    container.innerHTML = html;
};

let pendingImageFile = null;

// INPUT LISTENERY
document.addEventListener('input', (e) => {
    if (e.target.id === 'userSearchInput') window.Waggle.searchUsers(e.target.value);
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
    if (e.target.id === 'isEventCheckbox') {
        const detailsInput = document.getElementById('eventDetailsInput');
        if(detailsInput) detailsInput.style.display = e.target.checked ? 'block' : 'none';
    }
});

// GŁÓWNY NASŁUCHIWACZ KLIKNIĘĆ
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('close-modal-btn')) e.target.closest('.modal').style.display = 'none';
    if (e.target.closest('#closeChatBtn')) closeActiveChat();
    if (e.target.closest('#centerBtn')) centerOnMe();
    
    // Pigułka Alertu na Mapie
    if (e.target.closest('#active-alert-pill')) {
        document.querySelector('.nav-item[data-view="community"]').click();
        setTimeout(() => setPostFilter('alerts'), 200); 
    }
    
    // Spacer z automatycznym wskakiwaniem na Tablicę
    if (e.target.closest('#startWalkBtn')) {
        startWalk();
        if (state.user && state.location.lat && !state.isHiddenMode) {
            let latToSave = state.location.lat;
            let lngToSave = state.location.lng;
            if (state.isGhostMode) {
                latToSave += (Math.random() - 0.5) * 0.006;
                lngToSave += (Math.random() - 0.5) * 0.006;
            }
            db.collection("walks").doc(state.user.uid).set({
                uid: state.user.uid,
                name: state.profile?.name || "Piesek",
                avatar: state.profile?.avatar || "",
                lat: latToSave,
                lng: lngToSave,
                timestamp: Date.now()
            }, { merge: true });
        }
    }
    
    if (e.target.closest('#stopWalkBtn')) { stopWalk(); setTimeout(updateStatsUI, 500); }
    if (e.target.closest('#weatherWidgetBtn')) document.getElementById('weather-modal').style.display = 'flex';

    if (e.target.closest('#triggerAlertBtn')) document.getElementById('alert-modal').style.display = 'flex';
    if (e.target.closest('#saveAlertBtn')) {
        const textInput = document.getElementById('alertTextInput');
        if (textInput && textInput.value) {
            if (!state.location.lat) return window.Waggle.showToast("Czekam na sygnał GPS...");
            const alertText = textInput.value;
            db.collection("alerts").add({ text: alertText, lat: state.location.lat, lng: state.location.lng, createdAt: Date.now(), creator: state.user.uid })
            .then(() => {
                db.collection("posts").add({ 
                    uid: state.user.uid, author: state.profile?.name || "Piesek", avatar: state.profile?.avatar || "", 
                    content: alertText, imageUrl: null, isEvent: false, isAlert: true, isInfo: false,
                    likes: [], commentCount: 0, timestamp: fb.firestore.FieldValue.serverTimestamp() 
                });
                document.getElementById('alert-modal').style.display = 'none';
                textInput.value = ''; window.Waggle.showToast("Zagrożenie zgłoszone! ⚠️");
            });
        }
    }

    if (e.target.closest('.top-pill') && e.target.closest('#view-community')) {
        const btn = e.target.closest('.top-pill');
        const filterName = btn.innerText.trim();
        document.querySelectorAll('#view-community .top-pill').forEach(b => {
            b.style.background = 'transparent'; b.style.color = 'var(--text-color)';
        });
        btn.style.background = 'var(--text-color)'; btn.style.color = 'white';
        if (filterName.includes('Wszystko')) setPostFilter('all');
        else if (filterName.includes('Ustawki')) setPostFilter('events');
        else if (filterName.includes('Alerty')) setPostFilter('alerts');
        else if (filterName.includes('Info')) setPostFilter('info');
    }

    if (e.target.closest('#addPhotoBtn')) document.getElementById('postImageInput').click();
    if (e.target.closest('#removePostImageBtn')) {
        pendingImageFile = null; document.getElementById('post-image-preview-container').style.display = 'none';
    }
    if (e.target.closest('#addPostBtn')) document.getElementById('post-creator-modal').style.display = 'flex';
    
    if (e.target.closest('#publishPostBtn')) {
        const btn = e.target.closest('#publishPostBtn');
        const text = document.getElementById('postContent').value.trim();
        if(text.length < 3) return window.Waggle.showToast("Napisz coś więcej!");
        btn.disabled = true;
        try {
            let finalUrl = null;
            if(pendingImageFile) finalUrl = await uploadImage(pendingImageFile);
            const isEvent = document.getElementById('isEventCheckbox')?.checked || false;
            const eventDate = document.getElementById('eventDate')?.value || null;
            const isInfo = document.getElementById('isInfoCheckbox')?.checked || false;
            await saveCommunityPost(text, finalUrl, isEvent, eventDate, isInfo);
            document.getElementById('post-creator-modal').style.display = 'none';
            pendingImageFile = null; window.Waggle.showToast("Opublikowano! 🎉");
        } catch(err) { window.Waggle.showToast("Błąd wysyłania!"); } 
        finally { btn.disabled = false; }
    }

    if (e.target.closest('#sendCommentBtn')) {
        const input = document.getElementById('commentInput');
        if (input && input.value.trim()) { addPostComment(input.value.trim()); input.value = ""; }
    }

    if (e.target.closest('#chatTabInbox')) {
        document.getElementById('chatTabInbox').style.background = 'white';
        document.getElementById('chatTabSearch').style.background = 'transparent';
        document.getElementById('userSearchInput').style.display = 'none';
        loadInbox();
    }
    if (e.target.closest('#chatTabSearch')) {
        document.getElementById('chatTabSearch').style.background = 'white';
        document.getElementById('chatTabInbox').style.background = 'transparent';
        document.getElementById('userSearchInput').style.display = 'block';
        window.Waggle.searchUsers(''); 
    }

    if (e.target.closest('#chatAddPhotoBtn')) {
        const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
        input.onchange = (ev) => sendChatImage(ev.target.files[0]);
        input.click();
    }

    // WIKI TABS
    if (e.target.classList.contains('wiki-tab-btn')) {
        document.querySelectorAll('.wiki-tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active'); renderWiki(e.target.getAttribute('data-tab'));
    }

    if (e.target.closest('#openEditProfileBtn')) {
        document.getElementById('setupName').value = state.profile?.name || "";
        document.getElementById('setupCity').value = state.profile?.city || "";
        if(document.getElementById('setupBreed')) document.getElementById('setupBreed').value = state.profile?.breed || "";
        document.getElementById('profile-setup-modal').style.display = 'flex';
    }
    
if (e.target.closest('#saveProfileBtn')) {
        const btn = e.target.closest('#saveProfileBtn'); btn.disabled = true;
        const d = { name: document.getElementById('setupName').value.trim(), city: document.getElementById('setupCity').value.trim(), breed: document.getElementById('setupBreed').value };
        const avatarInput = document.getElementById('setupAvatarInput');
        
        // Funkcja wymuszająca odświeżenie UI po zapisie
        const updateStateAndUI = (data) => {
            if (data.avatar) state.profile.avatar = data.avatar;
            state.profile.name = data.name;
            state.profile.city = data.city;
            state.profile.breed = data.breed;
            eventBus.emit('profileUpdated', state.profile); // Megafon krzyczy "Zmieniono profil!"
            btn.disabled = false; 
            document.getElementById('profile-setup-modal').style.display = 'none'; 
            window.Waggle.showToast("Zapisano! ✅");
        };

        if (avatarInput && avatarInput.files.length > 0) {
            uploadImage(avatarInput.files[0]).then(url => { 
                d.avatar = url; 
                db.collection("users").doc(state.user.uid).set(d, {merge:true}).then(() => updateStateAndUI(d)); 
            });
        } else { 
            db.collection("users").doc(state.user.uid).set(d, {merge:true}).then(() => updateStateAndUI(d)); 
        }
    }
    // USTAWIENIA
    if (e.target.closest('#openSettingsBtn')) document.getElementById('settings-modal').style.display = 'flex';
    if (e.target.closest('#saveSettingsBtn')) {
        const isGhost = document.getElementById('settingSearchable')?.checked || false;
        const isHidden = document.getElementById('settingHidden')?.checked || false;
        const font = document.getElementById('settingFontSize')?.value || '14px';
        const theme = document.getElementById('settingTheme')?.value || 'light';
        
        localStorage.setItem('waggle_ghost_mode', isGhost.toString());
        localStorage.setItem('waggle_hidden_mode', isHidden.toString());
        localStorage.setItem('waggle_font', font);
        localStorage.setItem('waggle_theme', theme);
        
        state.isGhostMode = isGhost;
        state.isHiddenMode = isHidden;
        
        document.documentElement.style.setProperty('--base-font-size', font);
        if (theme === 'dark') document.body.classList.add('dark-mode');
        else document.body.classList.remove('dark-mode');
        
        if (isHidden && state.user) db.collection("walks").doc(state.user.uid).delete();
        document.getElementById('settings-modal').style.display = 'none';
        window.Waggle.showToast("Ustawienia zapisane!");
    }
});

// WIKI RENDERER I LAJKOWANIE
function renderWiki(tab) {
    const container = document.getElementById('wiki-content');
    if (!container) return;
    container.innerHTML = '<p style="text-align:center; padding:20px;">Węszenie... 🐾</p>';
    db.collection("wiki").where("category", "==", tab).onSnapshot(snap => {
        let html = "";
        snap.forEach(doc => {
            const item = doc.data(); const id = doc.id;
            const hasLiked = item.likes && item.likes.includes(state.user.uid);
            let imgHtml = item.img ? `<img src="${item.img}" style="width:100%; height:160px; object-fit:cover; border-radius:12px; margin-bottom:10px;">` : "";
            html += `<div class="post-card" style="border-left: 4px solid var(--secondary); padding:15px; margin-bottom: 15px; text-align: left;">
                ${imgHtml}<b style="font-size: 17px;">⚡ ${item.title || item.name}</b><p style="margin-top:10px; font-size:14px; color:var(--text-muted); line-height: 1.5;">${item.desc}</p>
                <div style="margin-top: 15px;"><span style="font-size:13px; cursor:pointer; font-weight:800; color:${hasLiked ? 'var(--danger)' : 'var(--text-muted)'}" onclick="Waggle.likeWiki('${id}')">${hasLiked ? '❤️' : '🤍'} ${item.likes ? item.likes.length : 0}</span></div></div>`;
        });
        container.innerHTML = html || '<p style="text-align:center;">Brak wpisów.</p>';
    });
}

window.Waggle.likeWiki = (id) => {
    const ref = db.collection("wiki").doc(id);
    ref.get().then(doc => {
        const likes = doc.data().likes || [];
        if (likes.includes(state.user.uid)) {
            ref.update({ likes: fb.firestore.FieldValue.arrayRemove(state.user.uid) });
        } else {
            ref.update({ likes: fb.firestore.FieldValue.arrayUnion(state.user.uid) });
            window.Waggle.showToast("Dzięki za ocenę! ❤️");
        }
    });
};

function updateStatsUI() {
    if (!state.profile) return; 
    const nameEl = document.getElementById('profileNameDisplay');
    if(nameEl) nameEl.innerText = state.profile.name || "Piesek";
    
    const walks = state.profile.walkCount || 0;
    const walksEl = document.getElementById('statWalks');
    if(walksEl) walksEl.innerText = walks;
    
    const distEl = document.getElementById('statDist');
    if(distEl) distEl.innerText = (walks * 1.2).toFixed(1);
    
    let level = "🌱 Nowik";
    if (walks >= 5) level = "🐕 Spacerowicz";
    if (walks >= 20) level = "🐺 Weteran Osiedla";
    if (walks >= 50) level = "👑 Alfa Stada";
    const lvlEl = document.getElementById('profileLevelDisplay');
    if (lvlEl) lvlEl.innerText = level;

    const av = document.getElementById('profileAvatar');
    if(av) {
        const avatarUrl = (state.profile.avatar && state.profile.avatar.trim() !== "") 
            ? state.profile.avatar 
            : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
        av.src = avatarUrl;
    }
}

function loadSettings() {
    const theme = localStorage.getItem('waggle_theme') || 'light';
    const font = localStorage.getItem('waggle_font') || '14px';
    if (theme === 'dark') document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
    document.documentElement.style.setProperty('--base-font-size', font);
    
    state.isGhostMode = localStorage.getItem('waggle_ghost_mode') === 'true';
    state.isHiddenMode = localStorage.getItem('waggle_hidden_mode') === 'true';
    
    if(document.getElementById('settingSearchable')) document.getElementById('settingSearchable').checked = state.isGhostMode;
    if(document.getElementById('settingHidden')) document.getElementById('settingHidden').checked = state.isHiddenMode;
    if(document.getElementById('settingFontSize')) document.getElementById('settingFontSize').value = font;
    if(document.getElementById('settingTheme')) document.getElementById('settingTheme').value = theme;
}

function fetchWeather(lat, lng) {
    if(lat && lng) {
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`)
        .then(r=>r.json()).then(d => {
            const tempEl = document.getElementById('weather-temp');
            if(tempEl) tempEl.innerText = `${Math.round(d.current_weather.temperature)}°C`;
            const contentEl = document.getElementById('weather-forecast-content');
            if(contentEl) {
                let forecastHtml = `<div style="text-align:center; margin-bottom:15px;"><b style="font-size:20px;">Dziś: ${Math.round(d.current_weather.temperature)}°C ${getWeatherIcon(d.current_weather.weathercode)}</b></div>`;
                forecastHtml += `<div style="display:flex; justify-content:space-around; border-top:1px solid var(--border-color); padding-top:15px;">`;
                for(let i=0; i<3; i++) {
                    const date = new Date(d.daily.time[i]).toLocaleDateString('pl-PL', {weekday: 'short'});
                    forecastHtml += `<div style="text-align:center;"><div style="font-size:11px; font-weight:800; color:var(--text-muted);">${date}</div><div style="font-size:24px;">${getWeatherIcon(d.daily.weathercode[i])}</div><div style="font-weight:900;">${Math.round(d.daily.temperature_2m_max[i])}°</div><div style="font-size:10px; color:var(--text-muted);">${Math.round(d.daily.temperature_2m_min[i])}°</div></div>`;
                }
                forecastHtml += `</div>`;
                contentEl.innerHTML = forecastHtml;
            }
        }).catch(e=>console.warn("Weather error:", e));
    }
}

export function initApp() {
    initRouter(); 
    
    eventBus.on('profileUpdated', (profile) => {
        updateStatsUI();
        if(profile) {
            document.getElementById('setupName').value = profile.name || "";
            document.getElementById('setupCity').value = profile.city || "";
            if(document.getElementById('setupBreed')) document.getElementById('setupBreed').value = profile.breed || "";
        }
    });

    eventBus.on('locationUpdated', (loc) => {
        fetchWeather(loc.lat, loc.lng);
    });

    eventBus.on('viewChanged', (view) => {
        if (view === 'community') loadPosts();
        if (view === 'chat') loadInbox();
        if (view === 'places') window.Waggle.renderPlaces();
        if (view === 'wiki') renderWiki('rasy'); // ZAPALNIK BAZY WIEDZY
    });

    loadSettings();
    initMap();
    loadPosts();
    loadInbox();
    updateStatsUI();
}

initAuth(initApp);
