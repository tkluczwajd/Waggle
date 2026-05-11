import { appState as state } from '../../core/state.js';
import { eventBus } from '../../core/eventBus.js';
import { saveProfileData } from '../../services/profileService.js';
import { uploadImageToService as uploadImage } from '../../services/postsService.js'; 

window.Waggle = window.Waggle || {};

export function initProfileListeners() {
    // 1. Otwieranie modala
    document.addEventListener('click', (e) => {
        if (e.target.closest('#open-profile-setup')) {
            const modal = document.getElementById('profile-setup-modal');
            if (modal) {
                document.getElementById('setupName').value = state.profile?.name || "";
                document.getElementById('setupCity').value = state.profile?.city || "";
                document.getElementById('setupBreed').value = state.profile?.breed || "Mieszaniec";
                modal.style.display = 'flex';
            }
        }
    });

    // 2. Zapisywanie profilu
    document.addEventListener('click', (e) => {
        if (e.target.closest('#saveProfileBtn')) {
            const btn = e.target.closest('#saveProfileBtn'); 
            btn.disabled = true;
            
            const d = { 
                name: document.getElementById('setupName').value.trim(), 
                city: document.getElementById('setupCity').value.trim(), 
                breed: document.getElementById('setupBreed').value 
            };
            
            const avatarInput = document.getElementById('setupAvatarInput');

            const finalizeSave = (dataWithAvatar) => {
                saveProfileData(state.user.uid, dataWithAvatar).then(() => {
                    state.profile = { ...state.profile, ...dataWithAvatar }; 
                    eventBus.emit('profileUpdated', state.profile); 
                    btn.disabled = false;
                    document.getElementById('profile-setup-modal').style.display = 'none';
                    window.Waggle.showToast("Profil zaktualizowany! ✅");
                });
            };

            if (avatarInput && avatarInput.files.length > 0) {
                uploadImage(avatarInput.files[0]).then(url => {
                    d.avatar = url;
                    finalizeSave(d);
                }).catch(() => {
                    btn.disabled = false;
                    window.Waggle.showToast("Błąd zdjęcia!");
                });
            } else {
                finalizeSave(d);
            }
        }
    });
}
