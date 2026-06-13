// src/modules/wiki.js

// 🔥 Pobieramy Twój główny obiekt WIKI z danymi
import { WIKI } from '../data/wikiData.js';

window.Waggle = window.Waggle || {};
let currentWikiFilter = 'sytuacje'; // Domyślna zakładka (klucze w WIKI to: sytuacje, trening, rasy)

export function initWikiEngine() {
    console.log("🧠 Inicjalizacja Silnika Wiedzy Waggle...");
    
    const tabs = document.querySelectorAll('.wiki-tab-btn');
    const searchInput = document.getElementById('wikiSearchInput');
    
    // Obsługa zakładek u góry (Sytuacje, Szkolenie, Rasy)
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => {
                t.classList.remove('active');
                t.style.background = 'transparent';
                t.style.color = 'var(--text-muted)';
            });
            
            e.target.classList.add('active');
            e.target.style.background = 'var(--secondary)';
            e.target.style.color = 'white';
            
            currentWikiFilter = e.target.getAttribute('data-tab');
            if (searchInput) searchInput.value = ''; 
            renderWikiList();
        });
    });

    // Obsługa wyszukiwarki Live
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            renderWikiList(query);
        });
    }

    renderWikiList();
}

function renderWikiList(searchQuery = '') {
    const container = document.getElementById('wiki-content');
    if (!container) return;

    // Pobieramy artykuły przypisane do aktualnej zakładki (sytuacje / trening / rasy)
    let activeArticles = WIKI[currentWikiFilter] || [];
    
    // Filtrowanie z wyszukiwarki
    if (searchQuery.trim() !== '') {
        activeArticles = activeArticles.filter(a => {
            const inTitle = a.title && a.title.toLowerCase().includes(searchQuery);
            const inKeywords = a.keywords && a.keywords.some(k => k.toLowerCase().includes(searchQuery));
            return inTitle || inKeywords;
        });
    }

    if (activeArticles.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 40px; margin-bottom: 10px;">📭</div>
                <h4 style="margin: 0 0 5px 0; color: var(--text-color);">Brak wyników</h4>
                <p style="margin: 0; font-size: 13px; color: var(--text-muted);">Nie znaleźliśmy artykułów dla tego zapytania.</p>
            </div>
        `;
        return;
    }

    let html = '';
    activeArticles.forEach(article => {
        // Określamy ikonę dla danej kategorii
        let icon = '📖';
        if (currentWikiFilter === 'sytuacje') icon = '🚨';
        if (currentWikiFilter === 'trening') icon = '🦮';
        if (currentWikiFilter === 'rasy') icon = '🐕';

        // Jeśli to rasa psa (ma zdjęcie), pokazujemy fotkę. Jeśli to artykuł - ikonkę.
        const visualHtml = article.img 
            ? `<img src="${article.img}" style="width: 55px; height: 55px; border-radius: 14px; object-fit: cover; flex-shrink: 0; border: 1px solid var(--border-color);">`
            : `<div style="width: 55px; height: 55px; border-radius: 14px; background: var(--bg-color); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">${icon}</div>`;

        // Generujemy "pigułki" informacyjne pod tytułem (Poziom trudności i Czas)
        let badgesHtml = '';
        if (article.difficulty) {
            const isCritical = article.difficulty.toLowerCase().includes('krytyczne');
            const bg = isCritical ? 'rgba(231, 76, 60, 0.1)' : 'var(--bg-color)';
            const color = isCritical ? 'var(--danger)' : 'var(--text-color)';
            badgesHtml += `<span style="background: ${bg}; color: ${color}; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 8px;">${article.difficulty}</span>`;
        }
        if (article.readTime) {
            badgesHtml += `<span style="background: var(--bg-color); color: var(--text-muted); font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 8px; margin-left: 5px;">⏱️ ${article.readTime}</span>`;
        }
        if (article.tags && article.tags.length > 0) {
            badgesHtml += `<span style="background: var(--bg-color); color: var(--primary); font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 8px;">${article.tags[0]}</span>`;
        }

        const borderStyle = (article.difficulty && article.difficulty.toLowerCase().includes('krytyczne')) 
            ? '2px solid rgba(231, 76, 60, 0.3)' 
            : '1px solid var(--border-color)';

        // Mały skrót opisu dla rasy (żeby nie pchać całego HTML na listę)
        let shortPreview = article.desc.replace(/<[^>]*>?/gm, '').substring(0, 60) + '...';

        html += `
        <div onclick="window.Waggle.openWikiArticle('${article.id}')" style="background: white; border-radius: 16px; padding: 15px; border: ${borderStyle}; box-shadow: 0 4px 15px rgba(0,0,0,0.02); margin-bottom: 12px; display: flex; gap: 15px; align-items: center; cursor: pointer; transition: transform 0.1s;">
            ${visualHtml}
            <div style="flex-grow: 1; overflow: hidden;">
                <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: 900; color: var(--text-color); white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${article.title}</h3>
                <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 5px;">
                    ${badgesHtml}
                </div>
                <p style="margin: 0; font-size: 11px; color: var(--text-muted); font-weight: 600; line-height: 1.4; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${shortPreview}</p>
            </div>
            <div style="color: var(--primary); font-size: 16px; font-weight: 900;">➔</div>
        </div>
        `;
    });

    container.innerHTML = html;
}

window.Waggle.openWikiArticle = (articleId) => {
    // Szukamy klikniętego artykułu w obecnie aktywnej zakładce
    const article = WIKI[currentWikiFilter].find(a => a.id === articleId);
    if (!article) return;

    const modalBody = document.getElementById('wiki-modal-body');
    const modal = document.getElementById('wiki-article-modal');
    
    if (!modalBody || !modal) return;

    let icon = '📖';
    if (currentWikiFilter === 'sytuacje') icon = '🚨';
    if (currentWikiFilter === 'trening') icon = '🦮';
    if (currentWikiFilter === 'rasy') icon = '🐕';

    const visualHtml = article.img 
        ? `<img src="${article.img}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin-bottom: 15px; border: 4px solid white; box-shadow: var(--soft-shadow);">`
        : `<div style="font-size: 50px; margin-bottom: 10px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));">${icon}</div>`;

    modalBody.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            ${visualHtml}
            <h2 style="margin: 0 0 5px 0; color: var(--text-color); font-weight: 900; font-size: 24px; line-height: 1.2;">${article.title}</h2>
            <div style="font-size: 12px; color: var(--text-muted); font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                ${article.category || 'Wiedza Waggle'}
            </div>
        </div>
        <div style="font-size: 14px; line-height: 1.6; color: var(--text-color);">
            ${article.desc}
        </div>
    `;

    modal.style.display = 'flex';
};
