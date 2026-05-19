// src/ui/uiListeners.js
import { appState as state } from '../core/state.js';
import { switchView } from '../core/router.js';
import { mapManager } from '../modules/map/mapManager.js';
import { db, auth } from '../core/firebase.js';

import { setPostFilter, addPostComment, saveCommunityPost } from '../modules/posts/postsListeners.js';
import { searchUsers, sendMessage, sendChatImage, loadInbox } from '../modules/chat/chatListeners.js';
import { uploadImageToService as uploadImage } from '../services/postsService.js';

// Importujemy funkcję renderowania wiki lokalnie
import { renderWiki } from '../core/appBootstrap.js'; 

export function initUiListeners() {
    // 1. Globalne nasłuchiwanie wejścia tekstowego (Wyszukiwarka)
    document.addEventListener('input', (e) => { 
        if (e.target.id === 'userSearchInput' || e.target.id === 'chatSearchInput') {
            searchUsers(e.target.value); 
        }
        // 🔥 Obsługa wyszukiwarki w Encyklopedii Wiki
        if (e.target.id === 'wikiSearchInput') {
            const activeTabBtn = document.querySelector('.wiki-tab-btn[style*="white"]') || document.querySelector('.wiki-tab-btn.active');
            const currentTab = activeTabBtn ? activeTabBtn.getAttribute('data-tab') : 'rasy';
            renderWiki(currentTab, e.target.value);
        }
    });

    // 2. Globalne nasłuchiwanie zmian w polach plików (Miniaturka zdjęcia posta)
    document.addEventListener('change', (e) => {
        if (e.target.id === 'postImageInput') {
            const file = e.target.files[0]; 
            const preview = document.getElementById('post-image-preview'); 
            if (file && preview) {
                const reader = new FileReader(); 
                reader.onload = (ex) => {
                    if(preview.tagName === 'IMG') { 
                        preview.src = ex.target.result; 
                        preview.style.display = 'block'; 
                    } else { 
                        preview.innerHTML = `<img src="${ex.target.result}" style="width:100%; height:150px; object-fit:cover; border-radius:10px; margin-top:10px;">`; 
                    }
                }; 
                reader.readAsDataURL(file);
            }
        }
    });

    // 3. Wielki centralny listener kliknięć Premium UI
    document.addEventListener('click', async (e) => {
        if (e.target.closest('#addPostBtn')) { const modal = document.getElementById('post-creator-modal'); if(modal) modal.style.display = 'flex'; }
        if (e.target.closest('#addAlertBtnTab') || e.target.closest('#triggerAlertBtn')) { const modal = document.getElementById('alert-modal'); if(modal) modal.style.display = 'flex'; }
        
        if (e.target.closest('.top-pill') && e.target.closest('#view-community')) {
            const btn = e.target.closest('.top-pill'); 
            document.querySelectorAll('#view-community .top-pill').forEach(b => { 
                b.style.background = 'transparent'; 
                b.style.color = 'var(--text-color)'; 
            });
            btn.style.background = 'var(--text-color)'; 
            btn.style.color = 'white';
    
            const filter = btn.innerText.includes('Wszystko') ? 'all' : (btn.innerText.includes('Ustawki') ? 'events' : (btn.innerText.includes('Alerty') ? 'alerts' : 'info')); 
            setPostFilter(filter);
        }

        if (e.target.classList.contains('wiki-tab-btn')) {
            const tabs = document.querySelectorAll('.wiki-tab-btn'); 
            tabs.forEach(t => { t.style.background = 'transparent'; t.style.color = 'var(--text-muted)'; t.classList.remove('active'); });
            e.target.style.background = 'var(--secondary)'; e.target.style.color = 'white'; e.target.classList.add('active');
            
            // Czyszczenie pola wyszukiwarki przy zmianie zakładki
            const searchInput = document.getElementById('wikiSearchInput');
            if (searchInput) searchInput.value = "";
            
            if (typeof renderWiki === 'function') renderWiki(e.target.getAttribute('data-tab'));
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
                state.pendingChatFile = file; 
                const preview = document.getElementById('chat-preview-box') || document.getElementById('chat-preview-container');
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
                        window.Waggle.updateStatsUI(); window.Waggle.showToast("Awatar zmieniony! 🐾");
                    }
                } catch(err) { window.Waggle.showToast("Błąd wysyłania zdjęcia!"); }
            });
        }
        
        if (e.target.closest('#openSettingsBtn')) document.getElementById('settings-modal').style.display = 'flex';
        
        if (e.target.closest('#saveSettingsBtn')) {
            const ghostInput = document.getElementById('settingGhostMode') || document.getElementById('settingSearchable');
            const hiddenInput = document.getElementById('settingHiddenMode') || document.getElementById('settingHidden');
            
            const isGhost = ghostInput?.checked || false; 
            const isHidden = hiddenInput?.checked || false;
            
            const font = document.getElementById('settingFontSize')?.value || '14px'; 
            const theme = document.getElementById('settingTheme')?.value || 'light';
            
            localStorage.setItem('waggle_ghost_mode', isGhost.toString()); 
            localStorage.setItem('waggle_hidden_mode', isHidden.toString()); 
            localStorage.setItem('waggle_font', font); 
            localStorage.setItem('waggle_theme', theme);
            
            state.isGhostMode = isGhost; 
            state.isHiddenMode = isHidden;
            
            document.documentElement.style.setProperty('--base-font-size', font); 
            if (theme === 'dark') document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');
            
            const updateMarkerFunc = window.Waggle?.triggerMarkerRefresh;
            if (typeof updateMarkerFunc === 'function' && state.location.lat) {
                updateMarkerFunc(state.location.lat, state.location.lng);
            }
            
            document.getElementById('settings-modal').style.display = 'none'; 
            window.Waggle.showToast("Ustawienia prywatności zaktualizowane! 🔐");
        }
        
        if (e.target.id === 'saveProfileBtn' || e.target.closest('#saveProfileBtn')) {
            const newName = document.getElementById('setupName')?.value; const newCity = document.getElementById('setupCity')?.value; const newBreed = document.getElementById('setupBreed')?.value;
            if(!newName) return window.Waggle.showToast("Imię jest wymagane! 🐾"); window.Waggle.showToast("Zapisuję zmiany... ⏳");
            try {
                await db.collection("users").doc(state.user.uid).update({ name: newName, city: newCity, breed: newBreed, avatar: state.profile.avatar || "" });
                state.profile = { ...state.profile, name: newName, city: newCity, breed: newBreed }; window.Waggle.updateStatsUI();
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

        // Dopisz na samym dole listenera kliknięć w src/ui/uiListeners.js
        if (e.target.id === 'closeWikiDetailsBtn' || e.target.closest('#closeWikiDetailsBtn')) {
            document.getElementById('wiki-details-modal').style.display = 'none';
        }
        
        if (e.target.closest('#weatherWidgetBtn')) document.getElementById('weather-modal').style.display = 'flex';
        if (e.target.closest('.close-modal-btn')) { const modal = e.target.closest('.modal') || e.target.closest('.modal-overlay'); if(modal) modal.style.display = 'none'; } 
}
    }); 
}
