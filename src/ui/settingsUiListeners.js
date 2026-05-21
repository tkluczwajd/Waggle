import { appState as state } from '../core/state.js';

export function initSettingsUi() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('#openSettingsBtn')) document.getElementById('settings-modal').style.display = 'flex';
        
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
    });
}
