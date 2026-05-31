import { appState as state } from '../core/state.js';
import { db } from '../core/firebase.js';
import { uploadImageToService as uploadImage } from '../services/postsService.js';
import { createOrUpdateSafeProfile } from '../services/safeService.js';

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
        // 🔥 OTWIERANIE MODALU DANYCH RATUNKOWYCH
        if (e.target.id === 'openSafeSetupBtn' || e.target.closest('#openSafeSetupBtn')) {
            const modal = document.getElementById('safe-setup-modal');
            if (modal) {
                if (document.getElementById('setupChip')) document.getElementById('setupChip').value = state.profile?.chip || "";
                if (document.getElementById('setupAllergies')) document.getElementById('setupAllergies').value = state.profile?.allergies || "";
                if (document.getElementById('setupMeds')) document.getElementById('setupMeds').value = state.profile?.meds || "";
                if (document.getElementById('setupVet')) document.getElementById('setupVet').value = state.profile?.vet || "";
                modal.style.display = 'flex';
            }
        }
        
        // 🔥 ZAPISYWANIE DANYCH RATUNKOWYCH DO FIREBASE
// 🔥 ZAPISYWANIE DANYCH RATUNKOWYCH DO FIREBASE I GENEROWANIE SAFE ID
        if (e.target.id === 'saveSafeBtn' || e.target.closest('#saveSafeBtn')) {
            const newChip = document.getElementById('setupChip')?.value || "";
            const newAllergies = document.getElementById('setupAllergies')?.value || "";
            const newMeds = document.getElementById('setupMeds')?.value || "";
            const newVet = document.getElementById('setupVet')?.value || "";
            
            window.Waggle.showToast("Zapisuję kartotekę medyczną... ⏳");
            try {
                // 1. Aktualizacja prywatnego profilu użytkownika
                await db.collection("users").doc(state.user.uid).update({
                    chip: newChip,
                    allergies: newAllergies,
                    meds: newMeds,
                    vet: newVet
                });
                
                // 2. Aktualizacja lokalnego stanu aplikacji
                state.profile = { ...state.profile, chip: newChip, allergies: newAllergies, meds: newMeds, vet: newVet };
                
                // 3. 🔥 TWORZENIE PUBLICZNEGO PROFILU SAFE I POBRANIE UNIKALNEGO KODU
                const safeId = await createOrUpdateSafeProfile(state.user.uid, state.profile);
                state.profile.safeId = safeId; // Zapisujemy kod w pamięci podręcznej
                
                window.Waggle.updateStatsUI();
                document.getElementById('safe-setup-modal').style.display = 'none';
                window.Waggle.showToast("Kartoteka zaktualizowana! 🏥✨");
            } catch (err) {
                console.error(err);
                window.Waggle.showToast("Błąd zapisu danych medycznych.");
            }
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
