import { appState as state } from '../../core/state.js';
import { eventBus } from '../../core/eventBus.js';
import { saveProfileData } from '../../services/profileService.js';
import { uploadImageToService as uploadImage } from '../../services/postsService.js'; 

export function initProfileListeners() {
    document.addEventListener('click', (e) => {
        // Otwieranie
        if (e.target.closest('#open-profile-setup')) {
            const modal = document.getElementById('profile-setup-modal');
            if (modal) {
                document.getElementById('setupName').value = state.profile?.name || "";
                document.getElementById('setupCity').value = state.profile?.city || "";
                document.getElementById('setupBreed').value = state.profile?.breed || "";
                modal.style.display = 'flex';
            }
        }
        // Zapisywanie
        if (e.target.closest('#saveProfileBtn')) {
            const btn = e.target.closest('#saveProfileBtn');
            btn.disabled = true;
            const d = { 
                name: document.getElementById('setupName').value.trim(),
                city: document.getElementById('setupCity').value.trim(),
                breed: document.getElementById('setupBreed').value 
            };
            
            saveProfileData(state.user.uid, d).then(() => {
                state.profile = { ...state.profile, ...d };
                eventBus.emit('profileUpdated', state.profile);
                btn.disabled = false;
                document.getElementById('profile-setup-modal').style.display = 'none';
                window.Waggle.showToast("Zapisano! 🐾");
            });
        }
    });
}
