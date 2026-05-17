// src/core/appBootstrap.js
import { initRouter, switchView } from './router.js';
import { initMap, mapManager } from '../modules/map/mapManager.js'; 
import { initAuth } from '../modules/auth.js';
import { appState as state } from './state.js';
import { eventBus } from './eventBus.js';
import { auth, db, fb } from './firebase.js';

import { initProfileListeners } from '../modules/profile/profileListeners.js';
import { loadPosts, setPostFilter, addPostComment, saveCommunityPost } from '../modules/posts/postsListeners.js';
import { loadInbox, sendMessage, searchUsers, sendChatImage } from '../modules/chat/chatListeners.js';
import { fetchNearbyParks } from '../services/parksService.js';
import { renderParksOnMap } from '../modules/map/parksRenderer.js';
import { subscribeToWalks } from '../services/walkService.js';
import { renderWalks } from '../modules/map/walksRenderer.js';
import { subscribeToAlerts } from '../services/alertsService.js';
import { renderAlerts } from '../modules/alerts/alertsRenderer.js'; 
import { uploadImageToService as uploadImage } from '../services/postsService.js';

import { initGlobalUtils } from '../ui/globalUtils.js';
import { fetchWeather } from '../services/weatherService.js';

// Wyciągnięte z app.js funkcje modułu mapy/wiki
function renderWiki(tab) {
    const container = document.getElementById('wiki-content');
    if (!container) return;
    container.innerHTML = '<p style="text-align:center; padding:20px;">Węszenie... 🐾</p>';
    db.collection("wiki").where("category", "==", tab).onSnapshot(snap => {
        let html = "";
        snap.forEach(doc => {
            const item = doc.data(); const id = doc.id;
            const hasLiked = item.likes && item.likes.includes(state.user?.uid);
            let imgHtml = item.img ? `<img src="${item.img}" style="width:100%; height:160px; object-fit:cover; border-radius:12px; margin-bottom:10px;">` : "";
            html += `<div class="post-card" style="border-left: 4px solid var(--secondary); padding:15px; margin-bottom: 15px; text-align: left;">
                ${imgHtml}<b style="font-size: 17px;">⚡ ${item.title || item.name}</b><p style="margin-top:10px; font-size:14px; color:var(--text-muted); line-height: 1.5;">${item.desc}</p>
                <div style="margin-top: 15px;"><span style="font-size:13px; cursor:pointer; font-weight:800; color:${hasLiked ? 'var(--danger)' : 'var(--text-muted)'}" onclick="Waggle.likeWiki('${id}')">${hasLiked ? '❤️' : '🤍'} ${item.likes ? item.likes.length : 0}</span></div></div>`;
        });
        container.innerHTML = html || '<p style="text-align:center;">Brak wpisów.</p>';
    });
}

function updateUserMarker(lat, lng) {
    const L = window.L; if (!L) return;
    if (state.isHiddenMode) {
        if (window.userMarker) { mapManager.map.removeLayer(window.userMarker); window.userMarker = null; }
        return; 
    }
    let displayLat = lat; let displayLng = lng;
    if (state.isGhostMode) {
        if (!state.ghostOffset) { state.ghostOffset = { lat: (Math.random() - 0.5) * 0.002, lng: (Math.random() - 0.5) * 0.002 }; }
        displayLat += state.ghostOffset.lat; displayLng += state.ghostOffset.lng;
    } else { state.ghostOffset = null; }

    const avatarSrc = state.profile?.avatar;
    let iconHtml = avatarSrc ? 
        `<div style="width:38px; height:38px; border-radius:50%; border:3px solid var(--secondary); box-shadow:0 0 15px rgba(0,0,0,0.3); overflow:hidden; background:white;"><img src="${avatarSrc}" style="width:100%; height:100%; object-fit:cover;"></div>` : 
        `<div style="background:#34ace0; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(0,0,0,0.3);"></div>`;
    
    const icon = L.divIcon({ className: '', html: iconHtml, iconSize: avatarSrc ? [38,38] : [20,20] });
    if (!window.userMarker) { window.userMarker = L.marker([displayLat, displayLng], { icon }); mapManager.addMarkerToLayer('user', window.userMarker); }
    else { window.userMarker.setLatLng([displayLat, displayLng]); window.userMarker.setIcon(icon); }
}

function updateStatsUI() {
    if (!state.profile) return; const p = state.profile;
    const nameEl = document.getElementById('profileNameDisplay'); if(nameEl) nameEl.innerText = p.name || "Piesek";
    const walksEl = document.getElementById('statWalks'); if(walksEl) walksEl.innerText = p.walkCount || 0;
    const distEl = document.getElementById('statDist'); if(distEl) distEl.innerText = ((p.walkCount || 0) * 1.2).toFixed(1);
    const breedInput = document.getElementById('setupBreed'); if(breedInput) breedInput.value = state.profile.breed || "";
    const cityInput = document.getElementById('setupCity'); if(cityInput) cityInput.value = state.profile.city || "";
    let lvl = "🌱 Nowik";
    if (p.walkCount >= 5) lvl = "🐕 Spacerowicz"; if (p.walkCount >= 20) lvl = "🐺 Weteran Osiedla"; if (p.walkCount >= 50) lvl = "👑 Alfa Stada";
    const lvlEl = document.getElementById('profileLevelDisplay'); if (lvlEl) lvlEl.innerText = lvl;
    const av = document.getElementById('profileAvatar'); if(av) av.src = (p.avatar && p.avatar.trim() !== "") ? p.avatar : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
    if(state.location.lat && state.location.lng) updateUserMarker(state.location.lat, state.location.lng);
}

function loadSettings() {
    const theme = localStorage.getItem('waggle_theme') || 'light';
    const font = localStorage.getItem('waggle_font') || '14px';
    if (theme === 'dark') document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');
    document.documentElement.style.setProperty('--base-font-size', font);
    state.isGhostMode = localStorage.getItem('waggle_ghost_mode') === 'true';
    state.isHiddenMode = localStorage.getItem('waggle_hidden_mode') === 'true';
    if(document.getElementById('settingFontSize')) document.getElementById('settingFontSize').value = font;
    if(document.getElementById('settingTheme')) document.getElementById('settingTheme').value = theme;
}

export function bootstrapApp() {
    initGlobalUtils();
    initRouter();
    initMap();
    updateStatsUI();
    state.map.instance = mapManager.map;

    loadPosts(); loadInbox(); initProfileListeners(); loadSettings();
    subscribeToWalks(walks => renderWalks(walks));
    subscribeToAlerts(alerts => renderAlerts(alerts));

    eventBus.on('profileUpdated', () => updateStatsUI());

    // Mostki i Funkcje Globalne wystawione do window.Waggle
    window.Waggle = window.Waggle || {};
    window.Waggle.updateStatsUI = updateStatsUI;
    window.Waggle.executeSearch = (query) => { if (typeof searchUsers === 'function') searchUsers(query); };
    window.Waggle.centerOnTarget = (lat, lng) => { switchView('map'); setTimeout(() => mapManager.flyTo(lat, lng, 16), 300); };
    window.Waggle.likeWiki = (id) => {
        if(!state.user) return; const ref = db.collection("wiki").doc(id);
        ref.get().then(doc => {
            const likes = doc.data().likes || [];
            if (likes.includes(state.user.uid)) { ref.update({ likes: fb.firestore.FieldValue.arrayRemove(state.user.uid) }); }
            else { ref.update({ likes: fb.firestore.FieldValue.arrayUnion(state.user.uid) }); window.Waggle.showToast("Dzięki za ocenę! ❤️"); }
        });
    };

    window.Waggle.submitAlert = async () => {
        const input = document.getElementById('alertInput') || document.getElementById('alertTextInput');
        const text = input?.value;
        if(!text || text.trim() === "") return window.Waggle.showToast("Wpisz treść ostrzeżenia!");
        if(!state.location.lat) return window.Waggle.showToast("Brak GPS!");
        try {
            const timestamp = Date.now(); window.Waggle.showToast("Wysyłam zgłoszenie... ⚠️");
            let alertUrl = null; if(state.pendingAlertFile) { alertUrl = await uploadImage(state.pendingAlertFile); state.pendingAlertFile = null; }
            let finalLat = state.location.lat; let finalLng = state.location.lng;
            if (state.isGhostMode && state.ghostOffset) { finalLat += state.ghostOffset.lat; finalLng += state.ghostOffset.lng; }
            await db.collection("alerts").add({ text: text, lat: finalLat, lng: finalLng, createdAt: timestamp, imageUrl: alertUrl, userId: auth.currentUser ? auth.currentUser.uid : 'anon' });
            await saveCommunityPost(`⚠️ ALERT: ${text}`, alertUrl, false, null, true, true);
            const alertBtn = document.getElementById('alertAddPhotoBtn'); if (alertBtn) alertBtn.innerHTML = "📷 Dodaj zdjęcie zagrożenia";
            document.getElementById('alert-modal').style.display = 'none'; if(input) input.value = ''; window.Waggle.showToast("Zgłoszono zagrożenie! ⚠️");
        } catch (err) { console.error(err); window.Waggle.showToast("Błąd wysyłania!"); }
    };

    eventBus.on('viewChanged', async (view) => {
        if (view === 'wiki') renderWiki('rasy');
        if (view === 'places' && state.location.lat) {
            if (state.placesLoaded) return; const container = document.getElementById('places-container');
            container.innerHTML = '<p style="text-align:center; padding:20px; color:var(--text-muted);">Szukam parków w okolicy... 🧭</p>';
            const places = await fetchNearbyParks(state.location.lat, state.location.lng); renderParksOnMap(places);
            let html = "";
            places.forEach(place => {
                const color = place.isDogPark ? 'var(--secondary)' : 'var(--primary)';
                html += `<div class="post-card" style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; padding: 15px; border-left: 4px solid ${color};">
                        <div style="display:flex; align-items:center; gap:15px;">
                            <div style="font-size:30px;">${place.isDogPark ? '🏞️' : '🌳'}</div>
                            <div><b style="font-size:16px; color:var(--text-color);">${place.name}</b><br><span style="font-size:12px; color:var(--text-muted); font-weight:800;">${place.isDogPark ? 'Wybieg' : 'Park'} • ${place.distance.toFixed(1)} km</span></div>
                        </div>
                        <button class="btn-outline" style="padding:8px 12px; font-size:12px; border-color:${color}; color:${color}; width:auto;" onclick="window.open('https://maps.google.com/?q=${place.lat},${place.lng}', '_blank')">Prowadź</button>
                    </div>`;
            });
            container.innerHTML = html; state.placesLoaded = true;
        }
    });

    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(pos => {
            const lat = pos.coords.latitude; const lng = pos.coords.longitude;
            const isFirstFix = !state.location.lat; state.location.lat = lat; state.location.lng = lng;
            if(isFirstFix) { 
                fetchWeather(lat, lng); mapManager.flyTo(lat, lng, 15); 
                (async () => {
                    try {
                        const container = document.getElementById('places-container'); const places = await fetchNearbyParks(lat, lng); renderParksOnMap(places);
                        let html = "";
                        places.forEach(place => {
                            const color = place.isDogPark ? 'var(--secondary)' : 'var(--primary)';
                            html += `<div class="post-card" style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; padding: 15px; border-left: 4px solid ${color};">
                                    <div style="display:flex; align-items:center; gap:15px;">
                                        <div style="font-size:30px;">${place.isDogPark ? '🏞️' : '🌳'}</div>
                                        <div><b style="font-size:16px; color:var(--text-color);">${place.name}</b><br><span style="font-size:12px; color:var(--text-muted); font-weight:800;">${place.isDogPark ? 'Wybieg' : 'Park'} • ${place.distance.toFixed(1)} km</span></div>
                                    </div>
                                    <button class="btn-outline" style="padding:8px 12px; font-size:12px; border-color:${color}; color:${color}; width:auto;" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}', '_blank')">Prowadź</button>
                                </div>`;
                        });
                        if (container) container.innerHTML = html; state.placesLoaded = true;
                    } catch (e) { console.warn("Błąd auto-ładowania parków:", e); }
                })();
            }
            if (state.isWalking && state.user && !state.isHiddenMode) {
                let uLat = lat; let uLng = lng; if (state.isGhostMode && state.ghostOffset) { uLat += state.ghostOffset.lat; uLng += state.ghostOffset.lng; }
                db.collection("walks").doc(state.user.uid).set({ uid: state.user.uid, name: state.profile?.name || "Piesek", avatar: state.profile?.avatar || "", lat: uLat, lng: uLng, timestamp: Date.now() }, { merge: true });
            }
            if(!state.isHiddenMode) updateUserMarker(lat, lng);
        }, err => console.log("Czekam na GPS..."), { enableHighAccuracy: true });
    }

    // Wielki Listener kliknięć i inputów (Super-Klej z app.js)
    document.addEventListener('input', (e) => { if (e.target.id === 'userSearchInput' || e.target.id === 'chatSearchInput') searchUsers(e.target.value); });
    document.addEventListener('change', (e) => {
        if (e.target.id === 'postImageInput') {
            const file = e.target.files[0]; const preview = document.getElementById('post-image-preview'); 
            if (file && preview) {
                const reader = new FileReader(); reader.onload = (ex) => {
                    if(preview.tagName === 'IMG') { preview.src = ex.target.result; preview.style.display = 'block'; } 
                    else { preview.innerHTML = `<img src="${ex.target.result}" style="width:100%; height:150px; object-fit:cover; border-radius:10px; margin-top:10px;">`; }
                }; reader.readAsDataURL(file);
            }
        }
    });

    document.addEventListener('click', async (e) => {
        if (e.target.closest('#addPostBtn')) { const modal = document.getElementById('post-creator-modal'); if(modal) modal.style.display = 'flex'; }
        if (e.target.closest('#addAlertBtnTab') || e.target.closest('#triggerAlertBtn')) { const modal = document.getElementById('alert-modal'); if(modal) modal.style.display = 'flex'; }
        if (e.target.classList.contains('wiki-tab-btn')) {
            const tabs = document.querySelectorAll('.wiki-tab-btn'); tabs.forEach(t => { t.style.background = 'transparent'; t.style.color = 'var(--text-muted)'; });
            e.target.style.background = 'var(--secondary)'; e.target.style.color = 'white';
            renderWiki(e.target.getAttribute('data-tab'));
        }
        if (e.target.closest('#openEditProfileBtn') || e.target.closest('#open-profile-setup') || e.target.closest('.edit-profile-trigger')) {
            const modal = document.getElementById('profile-setup-modal');
            if(modal) {
                if(document.getElementById('setupName')) document.getElementById('setupName').value = state.profile?.name || "";
                if(document.getElementById('setupCity')) document.getElementById('setupCity').value = state.profile?.city || "";
                if(document.getElementById('setupBreed')) document.getElementById('setupBreed').value = state.profile?.breed || "";
                modal.style.display = 'flex';
            }
        }
        if (e.target.closest('#chatAddPhotoBtn')) {
            window.Waggle.selectPhotoSource((file) => {
                state.pendingChatFile = file; const preview = document.getElementById('chat-preview-box') || document.getElementById('chat-preview-container');
                if (preview) {
                    preview.style.display = 'block';
                    preview.innerHTML = `<div style="display:inline-block; position:relative; margin-top:10px;"><img src="${URL.createObjectURL(file)}" style="height:60px; border-radius:12px; border:2px solid var(--primary); object-fit:cover;"><span style="position:absolute; top:-8px; right:-8px; background:var(--danger); color:white; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.2);" onclick="state.pendingChatFile=null; this.parentElement.parentElement.style.display='none'">✕</span></div>`;
                }
                window.Waggle.showToast("Zdjęcie załączone! 📸");
            });
        }
        if (e.target.closest('#active-alert-pill')) {
            window.Waggle.showToast("Przełączam na listę alertów... ⚠️"); switchView('community'); 
            setTimeout(() => {
                document.querySelectorAll('#view-community .top-pill').forEach(b => { b.style.background = 'transparent'; b.style.color = 'var(--text-color)'; });
                const alertBtn = Array.from(document.querySelectorAll('#view-community .top-pill')).find(el => el.innerText.includes('Alerty'));
                if (alertBtn) { alertBtn.style.background = 'var(--text-color)'; alertBtn.style.color = 'white'; }
                setPostFilter('alerts');
            }, 300);
        }
        if (e.target.closest('#triggerAlertBtn')) document.getElementById('alert-modal').style.display = 'flex';
        if (e.target.closest('#saveAlertBtn')) window.Waggle.submitAlert();
        if (e.target.closest('#alertAddPhotoBtn')) {
            window.Waggle.selectPhotoSource((file) => { state.pendingAlertFile = file; window.Waggle.showToast("Zdjęcie do alertu gotowe! 📸"); const btn = document.getElementById('alertAddPhotoBtn'); if(btn) btn.innerText = "✅ Zdjęcie załączone (Kliknij by zmienić)"; });
        }
        if (e.target.closest('#addPhotoBtn')) {
            window.Waggle.selectPhotoSource((file) => {
                const fileInput = document.getElementById('postImageInput');
                if (fileInput) { const dataTransfer = new DataTransfer(); dataTransfer.items.add(file); fileInput.files = dataTransfer.files; fileInput.dispatchEvent(new Event('change', { bubbles: true })); window.Waggle.showToast("Zdjęcie do posta gotowe! 📸"); }
            });
        }
        if (e.target.closest('#publishPostBtn')) {
            const content = document.getElementById('postContent').value; const file = document.getElementById('postImageInput').files[0]; if(!content.trim() && !file) return;
            window.Waggle.showToast("Publikuję... ⏳"); let url = file ? await uploadImage(file) : null;
            await saveCommunityPost(content, url, document.getElementById('isEventCheckbox')?.checked, null, document.getElementById('isInfoCheckbox')?.checked);
            document.getElementById('post-creator-modal').style.display = 'none'; document.getElementById('postContent').value = ''; document.getElementById('postImageInput').value = ''; window.Waggle.showToast("Opublikowano! 🐾");
        }
        if (e.target.closest('#sendCommentBtn')) { const input = document.getElementById('commentInput'); if (input && input.value.trim()) { addPostComment(input.value); input.value = ''; } }
        if (e.target.closest('#changeAvatarBtn') || e.target.closest('#profileAvatar')) {
            window.Waggle.selectPhotoSource(async (file) => {
                window.Waggle.showToast("Wysyłam nowe zdjęcie profilowe... ⏳");
                try {
                    const url = await uploadImage(file);
                    if(state.user) {
                        await db.collection("users").doc(state.user.uid).set({ avatar: url }, { merge: true }); state.profile.avatar = url;
                        document.querySelectorAll('#profileAvatar, .current-user-avatar').forEach(img => img.src = url);
                        eventBus.emit('profileUpdated', state.profile); updateStatsUI(); window.Waggle.showToast("Awatar zmieniony! 🐾");
                    }
                } catch(err) { window.Waggle.showToast("Błąd wysyłania zdjęcia!"); }
            });
        }
        if (e.target.closest('#openSettingsBtn')) document.getElementById('settings-modal').style.display = 'flex';
        if (e.target.closest('#saveSettingsBtn')) {
            const isGhost = document.getElementById('settingSearchable')?.checked || false; const isHidden = document.getElementById('settingHidden')?.checked || false;
            const font = document.getElementById('settingFontSize')?.value || '14px'; const theme = document.getElementById('settingTheme')?.value || 'light';
            localStorage.setItem('waggle_ghost_mode', isGhost.toString()); localStorage.setItem('waggle_hidden_mode', isHidden.toString()); localStorage.setItem('waggle_font', font); localStorage.setItem('waggle_theme', theme);
            state.isGhostMode = isGhost; state.isHiddenMode = isHidden;
            document.documentElement.style.setProperty('--base-font-size', font); if (theme === 'dark') document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');
            if(state.location.lat) updateUserMarker(state.location.lat, state.location.lng);
            document.getElementById('settings-modal').style.display = 'none'; window.Waggle.showToast("Ustawienia zapisane!");
        }
        if (e.target.id === 'saveProfileBtn' || e.target.closest('#saveProfileBtn')) {
            const newName = document.getElementById('setupName')?.value; const newCity = document.getElementById('setupCity')?.value; const newBreed = document.getElementById('setupBreed')?.value;
            if(!newName) return window.Waggle.showToast("Imię jest wymagane! 🐾"); window.Waggle.showToast("Zapisuję zmiany... ⏳");
            try {
                await db.collection("users").doc(state.user.uid).update({ name: newName, city: newCity, breed: newBreed, avatar: state.profile.avatar || "" });
                state.profile = { ...state.profile, name: newName, city: newCity, breed: newBreed }; updateStatsUI();
                document.getElementById('profile-setup-modal').style.display = 'none'; window.Waggle.showToast("Profil zaktualizowany! ✨");
            } catch (err) { console.error(err); window.Waggle.showToast("Błąd zapisu!"); }
        }
        if (e.target.closest('#centerBtn')) { if (state.location.lat && state.location.lng) { mapManager.flyTo(state.location.lat, state.location.lng, 15); window.Waggle.showToast("Zlokalizowano! 📍"); } }
        if (e.target.closest('#startWalkBtn')) {
            state.isWalking = true; document.getElementById('startWalkBtn').style.display = 'none'; document.getElementById('stopWalkBtn').style.display = 'inline-block'; document.getElementById('statusInput').style.display = 'none';
            db.collection("walks").doc(state.user.uid).set({ uid: state.user.uid, name: state.profile?.name, avatar: state.profile?.avatar, lat: state.location.lat, lng: state.location.lng, timestamp: Date.now() }, { merge: true }); window.Waggle.showToast("Spacer rozpoczęty! 🐾");
        }
        if (e.target.closest('#stopWalkBtn')) {
            state.isWalking = false; document.getElementById('stopWalkBtn').style.display = 'none'; document.getElementById('startWalkBtn').style.display = 'inline-block'; document.getElementById('statusInput').style.display = 'inline-block';
            if (state.user) db.collection("walks").doc(state.user.uid).delete(); window.Waggle.showToast("Spacer zakończony! 🏁");
        }
        if (e.target.closest('.top-pill') && e.target.closest('#view-community')) {
            const btn = e.target.closest('.top-pill'); document.querySelectorAll('#view-community .top-pill').forEach(b => { b.style.background = 'transparent'; b.style.color = 'var(--text-color)'; });
            btn.style.background = 'var(--text-color)'; btn.style.color = 'white';
            const filter = btn.innerText.includes('Wszystko') ? 'all' : (btn.innerText.includes('Ustawki') ? 'events' : (btn.innerText.includes('Alerty') ? 'alerts' : 'info')); setPostFilter(filter);
        }
        if (e.target.closest('#chatTabSearch')) {
            const inboxCont = document.getElementById('inbox-container'); if (inboxCont) inboxCont.style.display = 'none';
            const searchView = document.getElementById('chat-search-view'); if (searchView) searchView.style.display = 'block';
            const btnS = document.getElementById('chatTabSearch'); const btnI = document.getElementById('chatTabInbox');
            if (btnS) { btnS.style.backgroundColor = '#2d3436'; btnS.style.color = '#ffffff'; btnS.style.borderRadius = '20px'; }
            if (btnI) { btnI.style.backgroundColor = 'transparent'; btnI.style.color = 'var(--text-muted)'; }
            const sInput = document.getElementById('userSearchInput'); if (sInput) { sInput.value = ''; setTimeout(() => sInput.focus(), 100); }
            window.Waggle.executeSearch(''); 
        }
        if (e.target.closest('#chatTabInbox')) {
            const inboxCont = document.getElementById('inbox-container'); if (inboxCont) inboxCont.style.display = 'block';
            const searchView = document.getElementById('chat-search-view'); if (searchView) searchView.style.display = 'none';
            const btnS = document.getElementById('chatTabSearch'); const btnI = document.getElementById('chatTabInbox');
            if (btnI) { btnI.style.backgroundColor = '#2d3436'; btnI.style.color = '#ffffff'; btnI.style.borderRadius = '20px'; }
            if (btnS) { btnS.style.backgroundColor = 'transparent'; btnS.style.color = 'var(--text-muted)'; }
            loadInbox();
        }
        if (e.target.closest('#sendMessageBtn') || e.target.closest('#sendMsgBtn')) {
            const input = document.getElementById('chatInput'); const text = input?.value.trim();
            if(state.pendingChatFile) { window.Waggle.showToast("Wysyłam zdjęcie... 📸"); await sendChatImage(state.pendingChatFile); state.pendingChatFile = null; document.getElementById('chat-preview-container').innerHTML = ''; }
            if(text) { sendMessage(text); input.value = ''; }
        }
        if (e.target.closest('#weatherWidgetBtn')) document.getElementById('weather-modal').style.display = 'flex';
        if (e.target.closest('.close-modal-btn')) { const modal = e.target.closest('.modal') || e.target.closest('.modal-overlay'); if(modal) modal.style.display = 'none'; }
    });

    auth.onAuthStateChanged(user => {
        if (user) {
            db.collection("walks").doc(user.uid).get().then(doc => {
                if (doc.exists) {
                    const diff = (Date.now() - (doc.data().timestamp || 0)) / 1000 / 60;
                    if (diff > 30) { db.collection("walks").doc(user.uid).delete(); state.isWalking = false; } 
                    else {
                        state.isWalking = true;
                        if(document.getElementById('startWalkBtn')) document.getElementById('startWalkBtn').style.display = 'none';
                        if(document.getElementById('stopWalkBtn')) document.getElementById('stopWalkBtn').style.display = 'inline-block';
                    }
                }
            });
        }
    });
    console.log("🚀 Waggle: Bootstrap zainicjalizowany pomyślnie!");
}
