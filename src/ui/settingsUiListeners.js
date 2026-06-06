import { appState as state } from '../core/state.js';

export function initSettingsUi() {
    document.addEventListener('click', (e) => {
        // Otwieranie ustawień
        if (e.target.closest('#openSettingsBtn')) document.getElementById('settings-modal').style.display = 'flex';
        
        // Zapisywanie ustawień
        if (e.target.closest('#saveSettingsBtn')) {
            const isGhost = document.getElementById('settingGhostMode')?.checked || document.getElementById('settingSearchable')?.checked || false; 
            const isHidden = document.getElementById('settingHiddenMode')?.checked || document.getElementById('settingHidden')?.checked || false;
            const font = document.getElementById('settingFontSize')?.value || '14px'; 
            const theme = document.getElementById('settingTheme')?.value || 'light';
            
            localStorage.setItem('waggle_ghost_mode', isGhost.toString()); 
            localStorage.setItem('waggle_hidden_mode', isHidden.toString()); 
            localStorage.setItem('waggle_font', font); localStorage.setItem('waggle_theme', theme);
            
            state.isGhostMode = isGhost; state.isHiddenMode = isHidden;
            document.body.style.fontSize = font; document.documentElement.style.setProperty('--base-font-size', font); 
            if (theme === 'dark') document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');
            
            const updateMarkerFunc = window.Waggle?.triggerMarkerRefresh;
            if (typeof updateMarkerFunc === 'function' && state.location.lat) updateMarkerFunc(state.location.lat, state.location.lng);
            
            document.getElementById('settings-modal').style.display = 'none'; 
            window.Waggle.showToast("Ustawienia prywatności zaktualizowane! 🔐");
        }

        // 🔥 NOWE: Usuwanie konta
        if (e.target.closest('#deleteAccountBtn')) {
            const confirmModal = document.getElementById('custom-confirm-modal');
            const confirmMsg = document.getElementById('custom-confirm-msg');
            
            // Podmień tekst na ostrzeżenie o usunięciu
            confirmMsg.innerText = "Czy na pewno chcesz bezpowrotnie usunąć swoje konto, dane psa i całą historię z Waggle?";
            
            // Pokaż modal
            confirmModal.style.display = 'flex';
            
            // Obsługa kliknięcia "Tak"
            document.getElementById('custom-confirm-ok').onclick = async () => {
                try {
                    // Wyświetlamy loader
                    document.getElementById('loader').style.display = 'flex'; 
                    
                    const user = firebase.auth().currentUser;
                    if (user) {
                        // Usuwamy użytkownika z bazy autoryzacji Firebase
                        await user.delete(); 
                        
                        // Odświeżamy stronę (wyloguje i cofnie do ekranu startowego)
                        window.location.reload(); 
                    }
                } catch (error) {
                    document.getElementById('loader').style.display = 'none';
                    confirmModal.style.display = 'none';
                    
                    console.error("Błąd usuwania konta:", error);
                    window.Waggle.showToast("Wymagane uwierzytelnienie. Wyloguj się, zaloguj ponownie i spróbuj jeszcze raz.");
                }
            };
            
            // Obsługa kliknięcia "Anuluj"
            document.getElementById('custom-confirm-cancel').onclick = () => {
                confirmModal.style.display = 'none';
            };
        }
    });
}
