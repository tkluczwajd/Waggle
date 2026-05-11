import { appState as state } from '../../core/state.js';
import { eventBus } from '../../core/eventBus.js';
import { saveProfileData } from './profileService.js';
import { uploadImage } from '../posts/postsListeners.js'; 

export function initProfileListeners() {
    // ... inne listenery ...

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
