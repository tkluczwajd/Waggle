// src/ui/wikiRenderer.js
import { WIKI } from '../data/wikiData.js';

// --- HELPERY WIZUALNE DLA METADANYCH ---
function getDifficultyConfig(diff) {
    if (!diff) return { color: 'var(--text-muted)', label: 'Wiedza ogólna' };
    const d = diff.toLowerCase();
    if (d.includes('podstawowy') || d.includes('łatwy')) return { color: '#2ed573', label: '🎯 Podstawowy' };
    if (d.includes('średni')) return { color: '#ffa502', label: '⚡ Średni' };
    if (d.includes('zaawansowany') || d.includes('trudny')) return { color: '#ff4757', label: '🔥 Zaawansowany' };
    return { color: 'var(--text-muted)', label: `🎯 ${diff}` };
}

function getCategoryIcon(cat) {
    if (!cat) return '📌';
    const c = cat.toLowerCase();
    if (c.includes('zdrowie') || c.includes('pomoc') || c.includes('zagrożen') || c.includes('sos')) return '🏥';
    if (c.includes('trening') || c.includes('behawior')) return '🧠';
    if (c.includes('rasa')) return '🐕';
    return '📌';
}

const stableFallback = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH6gYVFA4XMS0UoQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkY2STAAAAlElEQVR42u3XwQkCQRBEQe08InM1YwsmY6vGg90ggh4M9KXuqqp76wEAAAAAAAAAAAAAAAAAALjGlfba077bK+v967v6ba+st0b767P6666st067Ndpfn9Vfd2W9ddqt0f76rP66K+ut026N9tdn9dddWW+ddmu0vz6rv+7Keuu0W6PdGu2vz+qvu7LeOu3WaH99Vn/dlfXW6X8BqNsTAQDgZgAAAAAElFTkSuQmCC";

// --- RENDEROWANIE GŁÓWNEJ LISTY ---
export function renderWiki(tab, searchQuery = "") {
    const container = document.getElementById('wiki-content');
    if (!container) return;
    
    const items = WIKI[tab] || [];
    let query = searchQuery.toLowerCase().trim();
    
    const filteredItems = items.filter(item => {
        if (!query) return true;
        const matchText = (item.title || "").toLowerCase().includes(query) || (item.desc || "").toLowerCase().includes(query);
        const matchTags = item.tags && item.tags.some(t => t.toLowerCase().includes(query));
        const matchKeywords = item.keywords && item.keywords.some(k => k.toLowerCase().includes(query));
        
        let matchAdvanced = false;
        if (item.filters) {
            if (query.includes("dziec") && item.filters.kidsFriendly >= 4) matchAdvanced = true;
            if (query.includes("mieszkan") && item.filters.apartmentLive >= 4) matchAdvanced = true;
            if (query.includes("łatw") && item.filters.easyToTrain >= 4) matchAdvanced = true;
            if (query.includes("kanap") && item.filters.energyLevel <= 2) matchAdvanced = true;
        }
        return matchText || matchTags || matchKeywords || matchAdvanced;
    });

    if (filteredItems.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:30px; color:var(--text-muted); font-weight:700;">Nie znaleziono pasujących porad. 🐾</p>';
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 12px; padding-bottom: 20px;">';

    filteredItems.forEach(item => {
        const readTime = item.readTime ? `⏱️ ${item.readTime}` : '⏱️ 1 min';
        const diff = getDifficultyConfig(item.difficulty);
        const catIcon = getCategoryIcon(item.category);
        const category = item.category || (tab === 'rasy' ? 'Rasa psa' : 'Porada');

        html += `
            <div style="background: white; border-radius: 16px; padding: 16px; cursor: pointer; border: 1px solid var(--border-color); box-shadow: 0 4px 15px rgba(0,0,0,0.02); text-align: left; transition: transform 0.2s;" 
                 onclick="window.Waggle.openWikiArticle('${item.id}')">
                <h4 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 900; color: var(--text-color); line-height: 1.3;">${item.title || "Brak nazwy"}</h4>
                
                <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 11px; font-weight: 800;">
                    <span style="background: var(--bg-color); color: var(--text-muted); padding: 4px 10px; border-radius: 8px;">
                        ${readTime}
                    </span>
                    <span style="background: ${diff.color}15; color: ${diff.color}; padding: 4px 10px; border-radius: 8px;">
                        ${diff.label}
                    </span>
                    <span style="background: var(--bg-color); color: var(--text-muted); padding: 4px 10px; border-radius: 8px;">
                        ${catIcon} ${category}
                    </span>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// --- OTWIERANIE POJEDYNCZEGO ARTYKUŁU (MODAL PRO) ---
window.Waggle = window.Waggle || {};
window.Waggle.openWikiArticle = (articleId) => {
    const allArticles = [...(WIKI.sytuacje || []), ...(WIKI.trening || []), ...(WIKI.rasy || [])];
    const article = allArticles.find(a => a.id === articleId);

    if (!article) return;

    const modal = document.getElementById('wiki-article-modal');
    const bodyContainer = document.getElementById('wiki-modal-body');
    if (!modal || !bodyContainer) return;

    const readTime = article.readTime ? `⏱️ ${article.readTime}` : '⏱️ 1 min';
    const diff = getDifficultyConfig(article.difficulty);
    const catIcon = getCategoryIcon(article.category);
    const category = article.category || 'Ogólne';

    let imageHtml = "";
    if (article.img) {
        imageHtml = `
            <div style="width: 100%; height: 200px; border-radius: 16px; overflow: hidden; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <img src="${article.img}" onerror="this.onerror=null; this.src='${stableFallback}';" style="width: 100%; height: 100%; object-fit: cover; object-position: center center;">
            </div>
        `;
    }

    let statsHtml = "";
    if (article.filters && typeof article.filters === 'object') {
        statsHtml += `<div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; background:var(--bg-color); padding:15px; border-radius:16px; margin-bottom:20px; border: 1px solid var(--border-color);">`;
        const labels = { kidsFriendly: "👶 Dzieci", easyToTrain: "🧠 Szkolenie", energyLevel: "⚡ Energia", apartmentLive: "🛋️ Blok" };
        
        for (const [key, value] of Object.entries(article.filters)) {
            let num = parseInt(value);
            if (isNaN(num) || num < 0) num = 0;
            if (num > 5) num = 5;
            let stars = "⭐".repeat(num);
            statsHtml += `<div style="font-size:12px; font-weight:800; color:var(--text-color);">${labels[key] || key}:<br><span style="letter-spacing:1px; font-size:14px;">${stars}</span></div>`;
        }
        statsHtml += `</div>`;
    }

    // 🔥 GENEROWANIE FLAG WAGGLE SOS (Triaż)
    let flagsHtml = "";
    if (article.flags) {
        flagsHtml += `<div style="margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px;">`;
        
        if (article.flags.green && article.flags.green.length > 0) {
            const listItems = article.flags.green.map(f => `<li style="margin-bottom: 4px;">${f}</li>`).join('');
            flagsHtml += `
                <div style="background: rgba(46, 213, 115, 0.1); border: 1px solid #2ed573; border-radius: 12px; padding: 15px;">
                    <h4 style="color: #27ae60; font-size: 14px; margin: 0 0 10px 0; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">🟢 Obserwuj w domu:</h4>
                    <ul style="margin: 0; padding-left: 20px; color: #2ecc71; font-size: 13px; font-weight: 700; line-height: 1.5;">
                        ${listItems}
                    </ul>
                </div>`;
        }
        
        if (article.flags.yellow && article.flags.yellow.length > 0) {
            const listItems = article.flags.yellow.map(f => `<li style="margin-bottom: 4px;">${f}</li>`).join('');
            flagsHtml += `
                <div style="background: rgba(255, 165, 2, 0.1); border: 1px solid #ffa502; border-radius: 12px; padding: 15px;">
                    <h4 style="color: #d35400; font-size: 14px; margin: 0 0 10px 0; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">🟡 Skonsultuj z weterynarzem (24h):</h4>
                    <ul style="margin: 0; padding-left: 20px; color: #e67e22; font-size: 13px; font-weight: 700; line-height: 1.5;">
                        ${listItems}
                    </ul>
                </div>`;
        }
        
        if (article.flags.red && article.flags.red.length > 0) {
            const listItems = article.flags.red.map(f => `<li style="margin-bottom: 4px;">${f}</li>`).join('');
            flagsHtml += `
                <div style="background: rgba(255, 71, 87, 0.1); border: 1px solid #ff4757; border-radius: 12px; padding: 15px;">
                    <h4 style="color: #c0392b; font-size: 14px; margin: 0 0 10px 0; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">🔴 Jedź natychmiast:</h4>
                    <ul style="margin: 0; padding-left: 20px; color: #e74c3c; font-size: 13px; font-weight: 700; line-height: 1.5;">
                        ${listItems}
                    </ul>
                </div>`;
        }
        flagsHtml += `</div>`;
    }

    let fullTagsHtml = "";
    if (article.tags && Array.isArray(article.tags)) {
        fullTagsHtml = `<div style="display:flex; flex-wrap:wrap; gap:6px; margin-top: 25px;">`;
        article.tags.forEach(tag => {
            fullTagsHtml += `<span style="font-size:12px; font-weight:800; background:var(--bg-color); color:var(--text-color); padding:6px 14px; border-radius:100px; border:1px solid var(--border-color);">${tag}</span>`;
        });
        fullTagsHtml += `</div>`;
    }

    let html = `
        ${imageHtml}
        <h2 style="margin: 0 0 15px 0; font-size: 24px; font-weight: 900; color: var(--text-color); line-height: 1.25;">${article.title}</h2>
        
        <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 12px; font-weight: 800; margin-bottom: 20px;">
            <span style="background: white; color: var(--text-muted); padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                ${readTime}
            </span>
            <span style="background: ${diff.color}15; color: ${diff.color}; padding: 6px 12px; border-radius: 8px; border: 1px solid ${diff.color}30;">
                ${diff.label}
            </span>
            <span style="background: white; color: var(--text-muted); padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                ${catIcon} ${category}
            </span>
        </div>

        ${statsHtml}
        
        ${flagsHtml}

        <div class="wiki-text-content" style="font-size: 15px; line-height: 1.6; color: var(--text-color); background: white; padding: 20px; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
            ${article.desc}
        </div>
        
        ${fullTagsHtml}
    `;

    if (article.related && Array.isArray(article.related) && article.related.length > 0) {
        const relatedArticles = allArticles.filter(a => article.related.includes(a.id) && a.id !== article.id);
        
        if (relatedArticles.length > 0) {
            html += `
                <div style="margin-top: 30px;">
                    <h4 style="font-size: 13px; font-weight: 900; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">🔗 Powiązane artykuły</h4>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
            `;

            relatedArticles.forEach(rel => {
                const relCatIcon = getCategoryIcon(rel.category);
                html += `
                    <div style="background: white; border-radius: 12px; padding: 15px; border: 1px solid var(--border-color); cursor: pointer; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);"
                         onclick="window.Waggle.openWikiArticle('${rel.id}')">
                        <div style="font-size: 24px; background: var(--bg-color); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px;">
                            ${relCatIcon}
                        </div>
                        <div style="flex: 1; font-size: 14px; font-weight: 800; color: var(--text-color); line-height: 1.3;">${rel.title}</div>
                        <div style="color: var(--primary); font-weight: 900; font-size: 18px;">➔</div>
                    </div>
                `;
            });

            html += `</div></div>`;
        }
    }

    bodyContainer.innerHTML = html;
    bodyContainer.scrollTop = 0; 
    modal.style.display = 'flex';
};

export function openWikiDetails(id, tab) {}
