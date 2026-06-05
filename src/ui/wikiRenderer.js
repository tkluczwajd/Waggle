// src/ui/wikiRenderer.js
import { WIKI } from '../data/wikiData.js';

// Inicjalizacja globalnej funkcji do rozwijania kart
window.Waggle = window.Waggle || {};
window.Waggle.toggleWikiAccordion = (el) => {
    const content = el.nextElementSibling;
    const chevron = el.querySelector('.chevron');

    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        chevron.style.transform = 'rotate(90deg)';
    } else {
        content.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
    }
};

export function renderWiki(tab, searchQuery = "") {
    const container = document.getElementById('wiki-content');
    if (!container) return;
    
    const items = WIKI[tab] || [];
    let query = searchQuery.toLowerCase().trim();
    
    const filteredItems = items.filter(item => {
        if (!query) return true;
        const matchText = item.title.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query);
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

    let html = "";
    
    // Transparentny, bezpieczny mini-placeholder Base64
    const stableFallback = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH6gYVFA4XMS0UoQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkY2STAAAAlElEQVR42u3XwQkCQRBEQe08InM1YwsmY6vGg90ggh4M9KXuqqp76wEAAAAAAAAAAAAAAAAAALjGlfba077bK+v967v6ba+st0b767P6666st067Ndpfn9Vfd2W9ddqt0f76rP66K+ut026N9tdn9dddWW+ddmu0vz6rv+7Keuu0W6PdGu2vz+qvu7LeOu3WaH99Vn/dlfXW6X8BqNsTAQDgZgAAAAAElFTkSuQmCC";

    filteredItems.forEach(item => {
        // Skrócone tagi do nagłówka
        let shortTagsHtml = "";
        if (item.tags && Array.isArray(item.tags)) {
            shortTagsHtml = `<div style="display:flex; flex-wrap:wrap; gap:6px; margin-top: 6px;">`;
            item.tags.slice(0, 2).forEach(tag => {
                shortTagsHtml += `<span style="font-size:10px; font-weight:800; background:var(--bg-color); color:var(--text-color); padding:4px 10px; border-radius:100px; border:1px solid var(--border-color);">${tag}</span>`;
            });
            shortTagsHtml += `</div>`;
        }

        // Pełne tagi po rozwinięciu karty
        let fullTagsHtml = "";
        if (item.tags && Array.isArray(item.tags)) {
            fullTagsHtml = `<div style="display:flex; flex-wrap:wrap; gap:6px; margin-top: 15px;">`;
            item.tags.forEach(tag => {
                fullTagsHtml += `<span style="font-size:12px; font-weight:800; background:var(--bg-color); color:var(--text-color); padding:6px 14px; border-radius:100px; border:1px solid var(--border-color);">${tag}</span>`;
            });
            fullTagsHtml += `</div>`;
        }

        if (tab === 'rasy') {
            let statsHtml = "";
            if (item.filters) {
                statsHtml += `<div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; background:var(--bg-color); padding:15px; border-radius:16px; margin-bottom:15px; border: 1px solid var(--border-color);">`;
                const labels = { kidsFriendly: "👶 Dzieci", easyToTrain: "🧠 Szkolenie", energyLevel: "⚡ Energia", apartmentLive: "🛋️ Blok" };
                for (const [key, value] of Object.entries(item.filters)) {
                    let stars = "⭐".repeat(value);
                    statsHtml += `<div style="font-size:12px; font-weight:800; color:var(--text-color);">${labels[key] || key}:<br><span style="letter-spacing:1px; font-size:14px;">${stars}</span></div>`;
                }
                statsHtml += `</div>`;
            }

            html += `
                <div style="margin-bottom: 12px; background: var(--panel-bg); border-radius: 20px; border: 1px solid var(--border-color); box-shadow: 0 4px 15px rgba(0,0,0,0.02); overflow: hidden;">
                    <div onclick="window.Waggle.toggleWikiAccordion(this)" 
                         style="display: flex; align-items: center; gap: 15px; padding: 12px 15px; cursor: pointer; box-sizing: border-box; width: 100%;">
                        
                        <div style="width: 60px; height: 60px; min-width: 60px; overflow:hidden; border-radius: 50%; border:2px solid var(--bg-color); background: var(--bg-color); flex-shrink: 0; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                            <img src="${item.img || stableFallback}" onerror="this.onerror=null; this.src='${stableFallback}';" style="width:100%; height:100%; object-fit:cover; display:block;">
                        </div>
                        
                        <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center;">
                            <b style="font-size: 16px; color:var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; font-weight: 900; letter-spacing: -0.3px;">${item.title}</b>
                            <p style="margin: 3px 0 0 0; font-size: 12px; color: var(--text-muted); font-weight: 600;">
                                Kliknij, aby poznać szczegóły
                            </p>
                            ${shortTagsHtml}
                        </div>
                        <div class="chevron" style="color: var(--text-muted); font-size: 22px; padding-left: 5px; font-weight: 900; flex-shrink: 0; transition: transform 0.3s;">›</div>
                    </div>
                    
                    <div class="wiki-expanded-content" style="display: none; padding: 0 20px 20px 20px; border-top: 1px solid var(--border-color); margin-top: 5px; padding-top: 20px;">
                        <div style="width: 100%; height: 200px; border-radius: 16px; overflow: hidden; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                            <img src="${item.img || stableFallback}" style="width: 100%; height: 100%; object-fit: cover; object-position: center center;">
                        </div>
                        ${statsHtml}
                        <h4 style="margin:0 0 10px 0; font-size:18px; font-weight:900; color:var(--text-color);">O rasie</h4>
                        <p style="font-size: 15px; color: var(--text-color); line-height: 1.7; font-weight: 600; margin: 0;">${item.desc}</p>
                        ${fullTagsHtml}
                    </div>
                </div>
            `;
        } else {
            // 📘 SZKOLENIA I SYTUACJE (Czysty Accordion bez dużych zdjęć)
            html += `
                <div style="margin-bottom: 12px; background: var(--panel-bg); border-radius: 20px; border: 1px solid var(--border-color); border-left: 5px solid var(--secondary); box-shadow: 0 4px 15px rgba(0,0,0,0.02); overflow: hidden;">
                    <div onclick="window.Waggle.toggleWikiAccordion(this)" 
                         style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; cursor: pointer; box-sizing: border-box; width: 100%;">
                        
                        <b style="font-size: 15px; color:var(--text-color); font-weight: 800; flex: 1;">${item.title}</b>
                        <div class="chevron" style="color: var(--text-muted); font-size: 22px; padding-left: 10px; font-weight: 900; flex-shrink: 0; transition: transform 0.3s;">›</div>
                    </div>
                    
                    <div class="wiki-expanded-content" style="display: none; padding: 0 20px 20px 20px; border-top: 1px dashed var(--border-color); padding-top: 15px;">
                        <p style="font-size: 15px; color: var(--text-color); line-height: 1.7; font-weight: 600; margin: 0;">${item.desc}</p>
                        ${fullTagsHtml}
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html || '<p style="text-align:center; padding:30px; color:var(--text-muted); font-weight:700;">Nie znaleziono pasujących porad. 🐾</p>';
}

// Funkcja pozostawiona pusta, by nie wywoływać błędów (zastąpiliśmy ją rozwijaniem)
export function openWikiDetails(id, tab) {}
