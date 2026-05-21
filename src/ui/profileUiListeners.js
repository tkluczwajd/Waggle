import { appState as state } from '../core/state.js';
import { db } from '../core/firebase.js';
import { uploadImageToService as uploadImage } from '../services/postsService.js';

export function initProfileUi() {
    document.addEventListener('click', async (e) => {
        if (e.target.closest('#openEditProfileBtn') || e.target.closest('#open-profile-setup') || e.target.closest('.edit-profile-trigger')) {
            const modal = document.getElementById('profile-setup-modal');
            if(modal) {
                if(document.getElementById('setupName')) document.getElementById('setupName').value = state.profile?.name || "";
                if(document.getElementById('setupCity')) document.getElementById('setupCity').value = state.profile?.city || "";
                if(document.getElementById('setupBreed')) document.getElementById('setupBreed').value = state.profile?.breed || "";
                modal.style.display = 'flex';
            }
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
    });
}
