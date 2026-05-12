import { initAuth } from './modules/auth.js';
import { initMap, mapManager } from './modules/map/mapManager.js'; 
import { initProfileListeners } from './modules/profile/profileListeners.js';
import { loadPosts, setPostFilter, addPostComment, saveCommunityPost } from './modules/posts/postsListeners.js';
import { loadInbox, sendMessage, searchUsers, sendChatImage } from './modules/chat/chatListeners.js';
import { initRouter, switchView } from './core/router.js'; 
import { appState as state } from './core/state.js';
import { eventBus } from './core/eventBus.js';
import { db, fb } from './core/firebase.js';
import { fetchNearbyParks } from './services/parksService.js';
import { renderParksOnMap } from './modules/map/parksRenderer.js';
import { subscribeToWalks } from './services/walkService.js';
import { renderWalks } from './modules/map/walksRenderer.js';
import { subscribeToAlerts } from './services/alertsService.js';
import { renderAlerts } from './modules/alerts/alertsRenderer.js'; 
import { uploadImageToService as uploadImage } from './services/postsService.js'; 

window.Waggle = window.Waggle || {};

// 1. GLOBALNY TOAST I CENTROWANIE MAPY
window.Waggle.showToast = (msg) => {
    let t = document.getElementById('waggle-toast');
    if(!t) {
        t = document.createElement('div'); t.id = 'waggle-toast';
        t.style.cssText = 'position:fixed; bottom:110px; left:50%; transform:translateX(-50%); background:#2d3436; color:#fff; padding:12px 24px; border-radius:25px; font-size:14px; font-weight:800; z-index:10000; border:2px solid var(--primary); transition:opacity 0.3s; text-align:center;';
        document.body.appendChild(t);
    }
    t.innerText = msg; t.style.display = 'block'; t.style.opacity = '1';
    setTimeout(() => { t.style.opacity = '0'; setTimeout(()=>t.style.display='none',300); }, 3500);
};

window.Waggle.centerOnTarget = (lat, lng) => {
    switchView('map');
    setTimeout(() => mapManager.flyTo(lat, lng, 16), 300);
};

window.Waggle.openLightbox = (url) => {
    const img = document.getElementById('lightbox-img');
    const modal = document.getElementById('lightbox-modal');
    if(img && modal) { img.src = url; modal.style.display = 'flex'; }
};

window.Waggle.triggerAvatarUpload = () => {
    let input = document.getElementById('hiddenAvatarInput');
    if(!input) {
        input = document.createElement('input');
        input.type = 'file'; input.id = 'hiddenAvatarInput'; input.accept = 'image/*'; input.style.display = 'none';
        document.body.appendChild(input);
        
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if(!file) return;
            window.Waggle.showToast("Wysyłam nowe zdjęcie... ⏳");
            try {
                const url = await uploadImage(file);
                if(state.user) {
                    await db.collection("users").doc(state.user.uid).set({ avatar: url }, { merge: true });
                    state.profile.avatar = url;
                    eventBus.emit('profileUpdated', state.profile);
                    window.Waggle.showToast("Zdjęcie zmienione! 🐾");
                }
            } catch(err) { window.Waggle.showToast("Błąd wysyłania zdjęcia!"); }
        });
    }
    input.click();
};

window.Waggle.submitAlert = () => {
    const text = document.getElementById('alertInput')?.value || document.getElementById('alertTextInput')?.value;
    if(!text) return window.Waggle.showToast("Wpisz treść ostrzeżenia!");
    if(!state.location.lat) return window.Waggle.showToast("Brak GPS!");
    db.collection("alerts").add({ text, lat: state.location.lat, lng: state.location.lng, createdAt: Date.now() });
    document.getElementById('alert-modal').style.display = 'none';
    if(document.getElementById('alertInput')) document.getElementById('alertInput').value = '';
    if(document.getElementById('alertTextInput')) document.getElementById('alertTextInput').value = '';
    window.Waggle.showToast("Zgłoszono zagrożenie! ⚠️");
};

// 2. FUNKCJE POMOCNICZE (POGODA, STATYSTYKI, WIKI)
function getWeatherIcon(code) {
    if (code === 0) return '☀️'; if (code <= 3) return '⛅'; if (code <= 48) return '🌫️';
    if (code <= 55 || (code >= 61 && code <= 65) || (code >= 80 && code <= 82)) return '🌧️';
    if (code <= 77) return '❄️'; if (code >= 95) return '⛈️'; return '🌡️';
}

function fetchWeather(lat, lng) {
    if(lat && lng) {
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`)
        .then(r=>r.json()).then(d => {
            const tempEl = document.getElementById('weather-temp');
            if(tempEl) tempEl.innerText = `${Math.round(d.current_weather.temperature)}°C`;
            const contentEl = document.getElementById('weather-forecast-content');
            if(contentEl) {
                let html = `<div style="text-align:center; margin-bottom:15px;"><b style="font-size:20px;">Dziś: ${Math.round(d.current_weather.temperature)}°C ${getWeatherIcon(d.current_weather.weathercode)}</b></div>`;
                html += `<div style="display:flex; justify-content:space-around; border-top:1px solid var(--border-color); padding-top:15px;">`;
                for(let i=0; i<3; i++) {
                    const date = new Date(d.daily.time[i]).toLocaleDateString('pl-PL', {weekday: 'short'});
                    html += `<div style="text-align:center;"><div style="font-size:11px; font-weight:800; color:var(--text-muted);">${date}</div><div style="font-size:24px;">${getWeatherIcon(d.daily.weathercode[i])}</div><div style="font-weight:900;">${Math.round(d.daily.temperature_2m_max[i])}°</div><div style="font-size:10px; color:var(--text-muted);">${Math.round(d.daily.temperature_2m_min[i])}°</div></div>`;
                }
                html += `</div>`;
                contentEl.innerHTML = html;
            }
        }).catch(e=>console.warn("Błąd pogody:", e));
    }
}

function updateStatsUI() {
    if (!state.profile) return; 
    const p = state.profile;
    const nameEl = document.getElementById('profileNameDisplay'); if(nameEl) nameEl.innerText = p.name || "Piesek";
    const walksEl = document.getElementById('statWalks'); if(walksEl) walksEl.innerText = p.walkCount || 0;
    const distEl = document.getElementById('statDist'); if(distEl) distEl.innerText = ((p.walkCount || 0) * 1.2).toFixed(1);

    // DODAJ TO, ABY MODAL EDYCJI PAMIĘTAŁ DANE:
    const breedInput = document.getElementById('setupBreed');
    if(breedInput) breedInput.value = state.profile.breed || "";
    
    const cityInput = document.getElementById('setupCity');
    if(cityInput) cityInput.value = state.profile.city || "";

    
    let lvl = "🌱 Nowik";
    if (p.walkCount >= 5) lvl = "🐕 Spacerowicz"; if (p.walkCount >= 20) lvl = "🐺 Weteran Osiedla"; if (p.walkCount >= 50) lvl = "👑 Alfa Stada";
    const lvlEl = document.getElementById('profileLevelDisplay'); if (lvlEl) lvlEl.innerText = lvl;

    const av = document.getElementById('profileAvatar');
    if(av) av.src = (p.avatar && p.avatar.trim() !== "") ? p.avatar : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";

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

window.Waggle.likeWiki = (id) => {
    if(!state.user) return; // Zabezpieczenie przed niezalogowanym
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

function updateUserMarker(lat, lng) {
    const L = window.L;
    if (!L || state.isHiddenMode) return;
    const avatarSrc = state.profile?.avatar;
    let iconHtml = avatarSrc ? `<div style="width:38px; height:38px; border-radius:50%; border:3px solid var(--secondary); box-shadow:0 0 15px rgba(0,0,0,0.3); overflow:hidden; background:white;"><img src="${avatarSrc}" style="width:100%; height:100%; object-fit:cover;"></div>` 
                             : `<div style="background:#34ace0; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(0,0,0,0.3);"></div>`;
    const icon = L.divIcon({ className: '', html: iconHtml, iconSize: avatarSrc ? [38,38] : [20,20] });
    if (!window.userMarker) {
        window.userMarker = L.marker([lat, lng], { icon });
        mapManager.addMarkerToLayer('user', window.userMarker);
    } else {
        window.userMarker.setLatLng([lat, lng]);
        window.userMarker.setIcon(icon);
    }
}

// ---------------------------------------------
// 3. INICJALIZACJA APLIKACJI
// ---------------------------------------------
export function initApp() {
    initRouter();
    initMap();
    updateStatsUI();
    
    state.map.instance = mapManager.map;

    loadPosts();
    loadInbox();
    initProfileListeners();
    loadSettings();

    subscribeToWalks(walks => renderWalks(walks));
    subscribeToAlerts(alerts => renderAlerts(alerts));

    eventBus.on('profileUpdated', () => updateStatsUI());

    eventBus.on('viewChanged', async (view) => {
        if (view === 'wiki') renderWiki('rasy');
        if (view === 'places' && state.location.lat) {
            if (state.placesLoaded) return; 
            const container = document.getElementById('places-container');
            container.innerHTML = '<p style="text-align:center; padding:20px; color:var(--text-muted);">Szukam parków w okolicy... 🧭</p>';
            const places = await fetchNearbyParks(state.location.lat, state.location.lng);
            renderParksOnMap(places);
            let html = "";
            places.forEach(place => {
                const color = place.isDogPark ? 'var(--secondary)' : 'var(--primary)';
                html += `<div class="post-card" style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; padding: 15px; border-left: 4px solid ${color};">
                        <div style="display:flex; align-items:center; gap:15px;">
                            <div style="font-size:30px;">${place.isDogPark ? '🏞️' : '🌳'}</div>
                            <div>
                                <b style="font-size:16px; color:var(--text-color);">${place.name}</b><br>
                                <span style="font-size:12px; color:var(--text-muted); font-weight:800;">${place.isDogPark ? 'Wybieg' : 'Park'} • ${place.distance.toFixed(1)} km</span>
                            </div>
                        </div>
                        <button class="btn-outline" style="padding:8px 12px; font-size:12px; border-color:${color}; color:${color}; width:auto;" onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}', '_blank')">Prowadź</button>
                    </div>`;
            });
            container.innerHTML = html;
            state.placesLoaded = true;
        }
    });

if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(pos => {
            const lat = pos.coords.latitude; 
            const lng = pos.coords.longitude;
            const isFirstFix = !state.location.lat;
            
            state.location.lat = lat; 
            state.location.lng = lng;

            if(isFirstFix) { 
                fetchWeather(lat, lng); 
                mapManager.flyTo(lat, lng, 15); 
            }

            // --- HEARTBEAT: Aktualizacja spaceru na żywo ---
            if (state.isWalking && state.user && !state.isHiddenMode) {
                db.collection("walks").doc(state.user.uid).update({
                    lat: lat,
                    lng: lng,
                    lastActive: Date.now() // Dodajemy znacznik czasu
                }).catch(() => {
                    // Jeśli dokument zniknął (np. sprzątacz go usunął), stwórz go na nowo
                    db.collection("walks").doc(state.user.uid).set({
                        uid: state.user.uid, name: state.profile?.name || "Piesek",
                        avatar: state.profile?.avatar || "", lat, lng, lastActive: Date.now()
                    });
                });
            }

            if(!state.isHiddenMode) updateUserMarker(lat, lng);
        }, err => console.log("Czekam na GPS..."), { enableHighAccuracy: true });
    }

    document.addEventListener('input', (e) => {
        if (e.target.id === 'settingFontSize') {
            document.documentElement.style.setProperty('--base-font-size', e.target.value);
        }
    });

    // 🔌 4. SUPER-KLEJ (KLIKNIĘCIA) - TUTAJ NAPRAWIŁEM PRZYCISKI
    document.addEventListener('click', async (e) => {
        
        // --- MODALE (Otwieranie) ---
        if (e.target.closest('#addPostBtn')) {
            document.getElementById('post-creator-modal').style.display = 'flex';
        }
        if (e.target.closest('#triggerAlertBtn') || e.target.closest('#active-alert-pill')) {
            document.getElementById('alert-modal').style.display = 'flex';
        }
        if (e.target.closest('#openSettingsBtn')) {
            document.getElementById('settings-modal').style.display = 'flex';
        }
        if (e.target.closest('#weatherWidgetBtn')) {
            document.getElementById('weather-modal').style.display = 'flex';
        }

        // --- PROFIL I AWATAR ---
        if (e.target.closest('#changeAvatarBtn') || e.target.closest('#profileAvatar')) {
            window.Waggle.triggerAvatarUpload();
        }

        if (e.target.classList.contains('wiki-tab-btn')) {
            document.querySelectorAll('.wiki-tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active'); renderWiki(e.target.getAttribute('data-tab'));
        }

        if (e.target.closest('#saveSettingsBtn')) {
            const isGhost = document.getElementById('settingSearchable')?.checked || false;
            const isHidden = document.getElementById('settingHidden')?.checked || false;
            const font = document.getElementById('settingFontSize')?.value || '14px';
            const theme = document.getElementById('settingTheme')?.value || 'light';
            localStorage.setItem('waggle_ghost_mode', isGhost.toString()); localStorage.setItem('waggle_hidden_mode', isHidden.toString());
            localStorage.setItem('waggle_font', font); localStorage.setItem('waggle_theme', theme);
            state.isGhostMode = isGhost; state.isHiddenMode = isHidden;
            if (theme === 'dark') document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');
            document.getElementById('settings-modal').style.display = 'none';
            window.Waggle.showToast("Ustawienia zapisane!");
        }

        if (e.target.closest('#centerBtn')) {
            if (state.location.lat && state.location.lng) { mapManager.flyTo(state.location.lat, state.location.lng, 15); window.Waggle.showToast("Zlokalizowano! 📍"); }
        }

        if (e.target.closest('#startWalkBtn')) {
            state.isWalking = true;
            document.getElementById('startWalkBtn').style.display = 'none'; document.getElementById('stopWalkBtn').style.display = 'inline-block'; document.getElementById('statusInput').style.display = 'none';
            if (state.user && state.location.lat && !state.isHiddenMode) {
                db.collection("walks").doc(state.user.uid).set({
                    uid: state.user.uid, name: state.profile?.name || "Piesek", avatar: state.profile?.avatar || "",
                    lat: state.location.lat, lng: state.location.lng, timestamp: Date.now()
                }, { merge: true });
            }
            window.Waggle.showToast("Spacer rozpoczęty! 🐾");
        }

        if (e.target.closest('#stopWalkBtn')) {
            state.isWalking = false;
            document.getElementById('stopWalkBtn').style.display = 'none'; document.getElementById('startWalkBtn').style.display = 'inline-block'; document.getElementById('statusInput').style.display = 'inline-block';
            if (state.user) db.collection("walks").doc(state.user.uid).delete();
            window.Waggle.showToast("Spacer zakończony! 🏁");
        }

        if (e.target.closest('#saveAlertBtn') || e.target.closest('#submitAlertBtn')) {
            window.Waggle.submitAlert();
        }

        // Pigułka Alertu na Mapie - Widok listy alertów
    if (e.target.closest('#active-alert-pill')) {
        // Zamiast otwierać dodawanie, otwieramy listę alertów (upewnij się, że masz modal o tym ID)
        const listModal = document.getElementById('alerts-list-modal');
        if(listModal) listModal.style.display = 'flex';
        else {
            // Jeśli nie masz modala listy, idź do tablicy z filtrem
            document.querySelector('.nav-item[data-view="community"]').click();
            setTimeout(() => setPostFilter('alerts'), 200);
        }
    }

        // --- POSTY (Publikowanie ze zdjęciem) ---
        if (e.target.closest('#publishPostBtn')) {
            const content = document.getElementById('postContent').value;
            const file = document.getElementById('postImageInput').files[0];
            if(!content.trim() && !file) return;

            window.Waggle.showToast("Publikuję... ⏳");
            let url = null;
            if(file) {
                url = await uploadImage(file);
            }
            await saveCommunityPost(content, url, document.getElementById('isEventCheckbox')?.checked, null, document.getElementById('isInfoCheckbox')?.checked);
            document.getElementById('post-creator-modal').style.display = 'none';
            document.getElementById('postContent').value = '';
            document.getElementById('postImageInput').value = '';
            window.Waggle.showToast("Opublikowano! 🐾");
        }

        if (e.target.closest('.filter-btn') || (e.target.closest('.top-pill') && e.target.closest('#view-community'))) {
            const btn = e.target.closest('.filter-btn') || e.target.closest('.top-pill');
            const filterName = btn.innerText.trim();
            document.querySelectorAll('#view-community .top-pill, .filter-btn').forEach(b => {
                b.style.background = 'transparent'; b.style.color = 'var(--text-color)';
            });
            btn.style.background = 'var(--text-color)'; btn.style.color = 'white';
            if (filterName.includes('Wszystko')) setPostFilter('all');
            else if (filterName.includes('Ustawki')) setPostFilter('events');
            else if (filterName.includes('Alerty')) setPostFilter('alerts');
            else if (filterName.includes('Info')) setPostFilter('info');
        }

        // --- CZAT (Wiadomości / Stado) ---
        if (e.target.closest('#chatTabInbox')) {
            document.getElementById('chatTabInbox').classList.add('active');
            document.getElementById('chatTabSearch').classList.remove('active');
            document.getElementById('chat-inbox-view').style.display = 'block';
            document.getElementById('chat-search-view').style.display = 'none';
            loadInbox();
        }
        
        if (e.target.closest('#chatTabSearch')) {
             document.getElementById('chatTabSearch').style.background = 'white';
             document.getElementById('chatTabInbox').style.background = 'transparent';
             const searchInput = document.getElementById('userSearchInput');
        if(searchInput) {
            searchInput.style.display = 'block';
            searchInput.focus(); // Automatycznie ustaw kursor
        }
        window.Waggle.searchUsers(''); 
    }  

        if (e.target.closest('#sendMessageBtn') || e.target.closest('#sendMsgBtn')) {
            const input = document.getElementById('chatInput');
            if(input && input.value.trim()) { sendMessage(input.value); input.value = ''; }
        }
        if (e.target.closest('#addPhotoBtn') || e.target.closest('.post-setup-avatar-btn')) {
            const fileInput = document.getElementById('postImageInput');
            if(fileInput) fileInput.click();
        }

        if (e.target.closest('#openEditProfileBtn')) {
            document.getElementById('setupName').value = state.profile?.name || "";
            document.getElementById('setupCity').value = state.profile?.city || "";
            document.getElementById('profile-setup-modal').style.display = 'flex';
        }

        if (e.target.closest('.close-modal-btn')) {
            const modal = e.target.closest('.modal') || e.target.closest('.modal-overlay');
            if(modal) modal.style.display = 'none';
// ... wcześniejszy kod (okolice linii 400+) ...
        }
    });

    // --- TUTAJ WKLEJASZ TEN KOD "SPRZĄTACZA" ---
    auth.onAuthStateChanged(user => {
        if (user) {
            db.collection("walks").doc(user.uid).get().then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    const now = Date.now();
                    const diff = (now - (data.lastActive || 0)) / 1000 / 60;

                    if (diff > 30) { 
                        db.collection("walks").doc(user.uid).delete();
                        state.isWalking = false;
                        window.Waggle.showToast("Spacer zakończony automatycznie.");
                    } else {
                        state.isWalking = true;
                        if(document.getElementById('startWalkBtn')) document.getElementById('startWalkBtn').style.display = 'none';
                        if(document.getElementById('stopWalkBtn')) document.getElementById('stopWalkBtn').style.display = 'inline-block';
                        if(document.getElementById('statusInput')) document.getElementById('statusInput').style.display = 'none';
                    }
                }
            });
        }
    });
    // --- KONIEC WKLEJKI ---

    console.log("🚀 Waggle: Architektura Hybrydowa aktywna!");
} // <--- TO JEST TEN NAWIAS, KTÓRY ZAMYKA initApp. Kod musi być nad nim!

initAuth(initApp); // <--- TO ZOSTAJE NA SAMYM DOLE PLIKU
