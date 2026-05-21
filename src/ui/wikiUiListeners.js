import { renderWiki } from './wikiRenderer.js';

export function initWikiUi() {
    document.addEventListener('input', (e) => {
        if (e.target.id === 'wikiSearchInput') {
            const activeTabBtn = document.querySelector('.wiki-tab-btn[style*="white"]') || document.querySelector('.wiki-tab-btn.active');
            const currentTab = activeTabBtn ? activeTabBtn.getAttribute('data-tab') : 'rasy';
            renderWiki(currentTab, e.target.value);
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('wiki-tab-btn')) {
            document.querySelectorAll('.wiki-tab-btn').forEach(t => { t.style.background = 'transparent'; t.style.color = 'var(--text-muted)'; t.classList.remove('active'); });
            e.target.style.background = 'var(--secondary)'; e.target.style.color = 'white'; e.target.classList.add('active');
            const searchInput = document.getElementById('wikiSearchInput'); if (searchInput) searchInput.value = "";
            renderWiki(e.target.getAttribute('data-tab'));
        }
        if (e.target.id === 'closeWikiDetailsBtn' || e.target.closest('#closeWikiDetailsBtn')) {
            document.getElementById('wiki-details-modal').style.display = 'none';
        }
    });
}
