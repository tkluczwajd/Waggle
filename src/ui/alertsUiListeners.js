import { appState as state } from '../core/state.js';
import { switchView } from '../core/router.js';
import { setPostFilter } from '../modules/posts/postsListeners.js';

export function initAlertsUi() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('#addAlertBtnTab') || e.target.closest('#triggerAlertBtn')) { const modal = document.getElementById('alert-modal'); if(modal) modal.style.display = 'flex'; }
        if (e.target.closest('#triggerAlertBtn')) document.getElementById('alert-modal').style.display = 'flex';
        if (e.target.closest('#saveAlertBtn')) window.Waggle.submitAlert();
        if (e.target.closest('#alertAddPhotoBtn')) {
            window.Waggle.selectPhotoSource((file) => { state.pendingAlertFile = file; window.Waggle.showToast("Zdjęcie do alertu gotowe! 📸"); const btn = document.getElementById('alertAddPhotoBtn'); if(btn) btn.innerText = "✅ Zdjęcie załączone (Kliknij by zmienić)"; });
        }
        if (e.target.closest('#active-alert-pill')) {
            window.Waggle.showToast("Przełączam na listę alertów... ⚠️"); switchView('community'); 
            setTimeout(() => {
                document.querySelectorAll('#view-community .top-pill').forEach(b => { b.style.background = 'transparent'; b.style.color = 'var(--text-color)'; });
                const alertBtn = Array.from(document.querySelectorAll('#view-community .top-pill')).find(el => el.innerText.includes('Alerty'));
                if (alertBtn) { alertBtn.style.background = 'var(--text-color)'; alertBtn.style.color = 'white'; }
                setPostFilter('alerts');
            }, 300);
        }
    });
}
