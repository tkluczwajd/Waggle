import { appState as state } from '../../core/state.js';
import { eventBus } from '../../core/eventBus.js';
import { saveProfileData } from './profileService.js';
import { renderProfileStats, fillProfileSetupForm } from './profileRenderer.js';
import { uploadImage } from '../posts.js'; 

export function initProfileListeners() {
    // Kiedy auth.js pobierze nowe dane, odświeżamy widok
    eventBus.on('profileUpdated', () => {
        renderProfileStats();
        fillProfileSetupForm();
    });

    document.addEventListener('click', (e) => {
        // Otwieranie modala
        if (e.target.closest('#openEditProfileBtn')) {
            fillProfileSetupForm();
            document.getElementById('profile-setup-modal').style.display = 'flex';
        }
        
        // Zapisywanie profilu
        if (e.target.closest('#saveProfileBtn')) {
            const btn = e.target.closest('#saveProfileBtn'); 
            btn.disabled = true;
            
            const d = { 
                name: document.getElementById('setupName').value.trim(), 
                city: document.getElementById('setupCity').value.trim(), 
                breed: document.getElementById('setupBreed').value 
            };
            const avatarInput = document.getElementById('setupAvatarInput');
            
            const updateStateAndUI = (data) => {
                if (data.avatar) state.profile.avatar = data.avatar;
                state.profile.name = data.name;
                state.profile.city = data.city;
                state.profile.breed = data.breed;
                eventBus.emit('profileUpdated', state.profile); 
                btn.disabled = false; 
                document.getElementById('profile-setup-modal').style.display = 'none'; 
                window.Waggle.showToast("Zapisano! ✅");
            };

            if (avatarInput && avatarInput.files.length > 0) {
                uploadImage(avatarInput.files[0]).then(url => { 
                    d.avatar = url; 
                    saveProfileData(state.user.uid, d).then(() => updateStateAndUI(d)); 
                });
            } else { 
                saveProfileData(state.user.uid, d).then(() => updateStateAndUI(d)); 
            }
        }
    });
}
