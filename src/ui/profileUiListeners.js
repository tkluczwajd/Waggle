// src/modules/profileUiListeners.js
import { appState as state } from '../core/state.js';
import { db } from '../core/firebase.js';
import { uploadImageToService as uploadImage } from '../services/postsService.js';
import { createOrUpdateSafeProfile } from '../services/safeService.js';

let pendingProfileFile = null;

export function initProfileUi() {
    
    // 1. NASŁUCHIWANIE WYBORU ZDJĘCIA (Lokalny podgląd)
    document.addEventListener('change', (e) => {
        if (e.target.id === 'setupAvatarInput') {
            const file = e.target.files[0];
            if (!file) return;
            
            pendingProfileFile = file; 
            const preview = document.getElementById('setupAvatarPreview');
            if (preview) {
                preview.src = URL.createObjectURL(file); 
            }
        }
    });

    document.addEventListener('click', async (e) => {
        
        // OTWIERANIE MODALU KARTY S.A.F.E.
        if (e.target.closest('#openSafeSetupBtn') || e.target.closest('#openEmptySafeBtn')) {
            const safeModal = document.getElementById('safe-setup-modal');
            if (safeModal) {
                // Ładujemy dane TYLKO dla karty medycznej
                if(document.getElementById('setupChip')) document.getElementById('setupChip').value = state.profile?.chip || "";
                if(document.getElementById('setupAllergies')) document.getElementById('setupAllergies').value = state.profile?.allergies || "";
                if(document.getElementById('setupMeds')) document.getElementById('setupMeds').value = state.profile?.meds || "";
                if(document.getElementById('setupVet')) document.getElementById('setupVet').value = state.profile?.vet || state.profile?.phone || "";
                
                safeModal.style.display = 'flex';
            }
        }

        // OTWIERANIE MODALU EDYCJI PROFILU GŁÓWNEGO
        if (e.target.closest('#openEditProfileBtn') || e.target.closest('#open-profile-setup') || e.target.closest('.edit-profile-trigger') || e.target.closest('#profileAvatar')) {
            const modal = document.getElementById('profile-setup-modal');
            if(modal) {
                // Ładujemy TYLKO podstawowe dane
                if(document.getElementById('setupName')) document.getElementById('setupName').value = state.profile?.name || "";
                if(document.getElementById('setupCity')) document.getElementById('setupCity').value = state.profile?.city || "";
                if(document.getElementById('setupBreed')) document.getElementById('setupBreed').value = state.profile?.breed || "";
                
                const preview = document.getElementById('setupAvatarPreview');
                if (preview) preview.src = state.profile?.avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
                
                pendingProfileFile = null; 
                modal.style.display = 'flex';
            }
        }

        // KLIKNIĘCIE W APARAT W FORMULARZU
        if (e.target.closest('#triggerProfileImageUpload')) {
            const fileInput = document.getElementById('setupAvatarInput');
            if (fileInput) fileInput.click();
        }

        // 🔥 ODDZIELNY ZAPIS GŁÓWNEGO PROFILU
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
                
                if (pendingProfileFile) {
                    window.Waggle.showToast("Optymalizuję zdjęcie... 📷");
                    finalAvatarUrl = await uploadImage(pendingProfileFile);
                }

                // Pakiet TYLKO z głównymi danymi (Nie ruszamy zdrowia!)
                const updatedData = { 
                    name: newName, 
                    city: newCity, 
                    breed: newBreed,
                    avatar: finalAvatarUrl
                };

                await db.collection("users").doc(state.user.uid).set(updatedData, { merge: true }); 
                
                // Aktualizujemy wizytówkę S.A.F.E. żeby miała nowe imię/zdjęcie
                if (state.profile) {
                    await createOrUpdateSafeProfile(state.user.uid, { ...state.profile, ...updatedData });
                }
                
                state.profile = { ...state.profile, ...updatedData };
                document.querySelectorAll('#profileAvatar, .current-user-avatar').forEach(img => img.src = finalAvatarUrl);
                
                window.Waggle.updateStatsUI(); 
                document.getElementById('profile-setup-modal').style.display = 'none';
                window.Waggle.showToast("Zapisano profil! 🐾");
                
                pendingProfileFile = null; 
            } catch(err) { 
                console.error("Błąd zapisu:", err);
                window.Waggle.showToast("Wystąpił błąd podczas zapisu!"); 
            } finally {
                btn.innerText = "Zapisz i kontynuuj";
                btn.disabled = false;
            }
        }

        // 🔥 ODDZIELNY ZAPIS KARTY S.A.F.E.
        if (e.target.id === 'saveSafeBtn' || e.target.closest('#saveSafeBtn')) {
            const btn = e.target.closest('#saveSafeBtn');
            
            const newChip = document.getElementById('setupChip')?.value || "";
            const newAllergies = document.getElementById('setupAllergies')?.value || "";
            const newMeds = document.getElementById('setupMeds')?.value || "";
            const newVet = document.getElementById('setupVet')?.value || "";

            btn.innerText = "Zapisywanie... ⏳";
            btn.disabled = true;

            try {
                // Pakiet TYLKO z danymi medycznymi (Nie ruszamy imienia i rasy!)
                const safeData = {
                    chip: newChip,
                    allergies: newAllergies,
                    meds: newMeds,
                    vet: newVet,
                    phone: newVet // Synchronizacja dla starszych widoków
                };

                await db.collection("users").doc(state.user.uid).set(safeData, { merge: true }); 
                
                if (state.profile) {
                    await createOrUpdateSafeProfile(state.user.uid, { ...state.profile, ...safeData });
                }
                
                state.profile = { ...state.profile, ...safeData };
                
                window.Waggle.updateStatsUI(); 
                document.getElementById('safe-setup-modal').style.display = 'none';
                window.Waggle.showToast("Zapisano dane medyczne S.A.F.E.! 🏥");
            } catch(err) { 
                console.error("Błąd zapisu:", err);
                window.Waggle.showToast("Wystąpił błąd podczas zapisu!"); 
            } finally {
                btn.innerText = "ZAPISZ KARTOTEKĘ 🏥";
                btn.disabled = false;
            }
        }

        // OBSŁUGA SCHOWKA (S.A.F.E.)
        if (e.target.closest('#copySafeLinkBtn') || e.target.closest('.copy-safe-trigger')) {
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
    });
}
