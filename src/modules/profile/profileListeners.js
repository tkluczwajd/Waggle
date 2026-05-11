import { appState as state } from '../../core/state.js';
import { eventBus } from '../../core/eventBus.js';
import { saveProfileData } from '../../services/profileService.js';
import { uploadImage } from '../posts/postsListeners.js'; 

window.Waggle = window.Waggle || {};

export function initProfileListeners() {
    // 1. Otwieranie modala edycji
    document.addEventListener('click', (e) => {
        if (e.target.closest('#open-profile-setup')) {
            const modal = document.getElementById('profile-setup-modal');
            if (modal) {
                // Wypełniamy pola aktualnymi danymi ze stanu
                document.getElementById('setupName').value = state.profile?.name || "";
                document.getElementById('setupCity').value = state.profile?.city || "";
                document.getElementById('setupBreed').value = state.profile?.breed || "Mieszaniec";
                modal.style.display = 'flex';
            }
        }
    });

    // ... Twoja istniejąca sekcja document.addEventListener('click'...) z saveProfileBtn ...
}

    document.addEventListener('click', (e) => {
        // --- SEKCJA ZAPISU PROFILU ---
        if (e.target.closest('#saveProfileBtn')) {
            const btn = e.target.closest('#saveProfileBtn'); 
            btn.disabled = true; // Blokujemy przycisk na czas zapisu
            
            // Pobieramy dane z formularza
            const d = { 
                name: document.getElementById('setupName').value.trim(), 
                city: document.getElementById('setupCity').value.trim(), 
                breed: document.getElementById('setupBreed').value 
            };
            
            const avatarInput = document.getElementById('setupAvatarInput');

            // Funkcja pomocnicza, która wykonuje "betonowanie" stanu
            const finalizeSave = (dataWithAvatar) => {
                saveProfileData(state.user.uid, dataWithAvatar).then(() => {
                    
                    // --- TUTAJ WSTAWIASZ TEN KOD (BETONOWANIE STANU) ---
                    // 1. Aktualizujemy centralne źródło prawdy (State)
                    state.profile = { ...state.profile, ...dataWithAvatar }; 
                    
                    // 2. Informujemy resztę aplikacji (Renderer słucha tego zdarzenia)
                    eventBus.emit('profileUpdated', state.profile); 
                    // --------------------------------------------------

                    btn.disabled = false;
                    document.getElementById('profile-setup-modal').style.display = 'none';
                    window.Waggle.showToast("Profil zaktualizowany! ✅");
                });
            };

            // Logika uploadu zdjęcia (jeśli wybrano nowe)
            if (avatarInput && avatarInput.files.length > 0) {
                uploadImage(avatarInput.files[0]).then(url => {
                    d.avatar = url;
                    finalizeSave(d);
                });
            } else {
                finalizeSave(d);
            }
        }
    });
}
