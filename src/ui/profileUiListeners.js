// src/modules/profileUiListeners.js
import { appState as state } from '../core/state.js';
import { db } from '../core/firebase.js';
import { uploadImageToService as uploadImage } from '../services/postsService.js';
import { createOrUpdateSafeProfile } from '../services/safeService.js';

let pendingProfileFile = null;

export function initProfileUi() {
    
    // 1. NASŁUCHIWANIE WYBORU ZDJĘCIA (Tylko lokalny podgląd)
    document.addEventListener('change', (e) => {
        if (e.target.id === 'setupAvatarInput') {
            const file = e.target.files[0];
            if (!file) return;
            
            pendingProfileFile = file; // Zapamiętujemy plik w pamięci podręcznej
            const preview = document.getElementById('setupAvatarPreview');
            if (preview) {
                preview.src = URL.createObjectURL(file); // Błyskawiczny podgląd
            }
        }
    });

    document.addEventListener('click', async (e) => {
        
        // 2. KLIKNIĘCIE W APARAT W FORMULARZU
        if (e.target.closest('#triggerProfileImageUpload')) {
            const fileInput = document.getElementById('setupAvatarInput');
            if (fileInput) fileInput.click();
        }

        // 3. OTWIERANIE MODALU EDYCJI PROFILU
        if (e.target.closest('#openEditProfileBtn') || e.target.closest('#open-profile-setup') || e.target.closest('.edit-profile-trigger')) {
            const modal = document.getElementById('profile-setup-modal');
            if(modal) {
                if(document.getElementById('setupName')) document.getElementById('setupName').value = state.profile?.name || "";
                if(document.getElementById('setupCity')) document.getElementById('setupCity').value = state.profile?.city || "";
                if(document.getElementById('setupBreed')) document.getElementById('setupBreed').value = state.profile?.breed || "";
                
                // Reset podglądu do zapisanego avatara
                const preview = document.getElementById('setupAvatarPreview');
                if (preview) preview.src = state.profile?.avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
                
                pendingProfileFile = null; // Czyścimy stare śmieci
                modal.style.display = 'flex';
            }
        }

        // 4. ZAPISYWANIE PROFILU (Z ODCHUDZANIEM ZDJĘCIA)
        if (e.target.id === 'saveProfileBtn' || e.target.closest('#saveProfileBtn')) {
            const btn = e.target.closest('#saveProfileBtn');
            const newName = document.getElementById('setupName')?.value; 
            const newCity = document.getElementById('setupCity')?.value; 
            const newBreed = document.getElementById('setupBreed')?.value;
            
            if(!newName) return window.Waggle.showToast("Imię jest wymagane! 🐾"); 
            
            btn.innerText = "Zapisywanie... ⏳";
            btn.disabled = true;

            try {
                let finalAvatarUrl = state.profile?.avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
                
                // Odpalamy ciężką maszynerię TYLKO jeśli użytkownik wybrał nowe zdjęcie
                if (pendingProfileFile) {
                    window.Waggle.showToast("Optymalizuję zdjęcie... 📷");
                    finalAvatarUrl = await uploadImage(pendingProfileFile);
                }

                await db.collection("users").doc(state.user.uid).set({ 
                    name: newName, 
                    city: newCity, 
                    breed: newBreed,
                    avatar: finalAvatarUrl 
                }, { merge: true }); 
                
                state.profile.name = newName;
                state.profile.city = newCity;
                state.profile.breed = newBreed;
                state.profile.avatar = finalAvatarUrl;

                document.querySelectorAll('#profileAvatar, .current-user-avatar').forEach(img => img.src = finalAvatarUrl);
                
                window.Waggle.updateStatsUI(); 
                document.getElementById('profile-setup-modal').style.display = 'none';
                window.Waggle.showToast("Zapisano profil! 🐾");
                
                pendingProfileFile = null; // Czyścimy plik po udanym wysłaniu

            } catch(err) { 
                console.error("Błąd zapisu:", err);
                window.Waggle.showToast("Wystąpił błąd podczas zapisu!"); 
            } finally {
                btn.innerText = "Zapisz i kontynuuj";
                btn.disabled = false;
            }
        }

        // 5. OBSŁUGA SCHOWKA (S.A.F.E.)
        if (e.target.closest('#copySafeLinkBtn')) {
            if (state.profile && state.profile.safeId) {
                const safeLink = `${window.location.origin}/safe.html?id=${state.profile.safeId}`;
                navigator.clipboard.writeText(safeLink).then(() => {
                    window.Waggle.showToast("Skopiowano link do schowka! 📋");
                }).catch(err => {
                    window.Waggle.showToast("Nie udało się skopiować linku.");
                });
            } else {
                window.Waggle.showToast("Najpierw wypełnij i zapisz kartotekę medyczną! 🏥");
            }
        }

        // 6. SZYBKA ZMIANA AVATARA (Poza formularzem)
        if (e.target.closest('#changeAvatarBtn')) {
            window.Waggle.selectPhotoSource(async (file) => {
                window.Waggle.showToast("Wysyłam nowe zdjęcie profilowe... ⏳");
                try {
                    const url = await uploadImage(file);
                    if(state.user) {
                        await db.collection("users").doc(state.user.uid).set({ avatar: url }, { merge: true }); 
                        state.profile.avatar = url;
                        document.querySelectorAll('#profileAvatar, .current-user-avatar').forEach(img => img.src = url);
                        window.Waggle.updateStatsUI(); 
                        window.Waggle.showToast("Awatar zmieniony! 🐾");
                    }
                } catch(err) { window.Waggle.showToast("Błąd wysyłania zdjęcia!"); }
            });
        }
    });
}
