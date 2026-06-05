// src/ui/wikiRenderer.js
import { WIKI } from '../data/wikiData.js';

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
        let tagsHtml = "";
        if (item.tags && Array.isArray(item.tags)) {
            tagsHtml = `<div style="display:flex; flex-wrap:wrap; gap:6px; margin-top: 6px;">`;
            item.tags.slice(0, 2).forEach(tag => {
                // 🔥 ZMIANA: Eleganckie tagi w kształcie pigułek (Pill-shape)
                tagsHtml += `<span style="font-size:10px; font-weight:800; background:var(--bg-color); color:var(--text-color); padding:4px 10px; border-radius:100px; border:1px solid var(--border-color);">${tag}</span>`;
            });
            tagsHtml += `</div>`;
        }

        if (tab === 'rasy') {
            // 🐕 KARTA RASY: Płynne okręgi i czysty luksus
            html += `
                <div onclick="window.Waggle.openWikiDetails('${item.id}', '${tab}')" 
                     style="display: flex; align-items: center; gap: 15px; padding: 12px 15px; margin-bottom: 10px; background: var(--panel-bg); cursor: pointer; border-radius: 20px; border: 1px solid var(--border-color); box-shadow: 0 4px 15px rgba(0,0,0,0.02); box-sizing: border-box; width: 100%; transition: transform 0.2s;">
                    
                    <div style="width: 60px; height: 60px; min-width: 60px; overflow:hidden; border-radius: 50%; border:2px solid var(--bg-color); background: var(--bg-color); flex-shrink: 0; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                        <img src="${item.img || stableFallback}" onerror="this.onerror=null; this.src='${stableFallback}';" style="width:100%; height:100%; object-fit:cover; display:block;">
                    </div>
                    
                    <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center;">
                        <b style="font-size: 16px; color:var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; font-weight: 900; letter-spacing: -0.3px;">${item.title}</b>
                        <p style="margin: 3px 0 0 0; font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600;">
                            ${item.desc}
                        </p>
                        ${tagsHtml}
                    </div>
                    <div style="color: var(--text-muted); font-size: 18px; padding-left: 5px; font-weight: 900; flex-shrink: 0;">›</div>
                </div>
            `;
        } else {
            // 📘 SZKOLENIA I SYTUACJE: Czysta linia (iOS style)
            html += `
                <div onclick="window.Waggle.openWikiDetails('${item.id}', '${tab}')" 
                     style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; margin-bottom: 10px; background: var(--panel-bg); cursor: pointer; border-radius: 20px; border: 1px solid var(--border-color); border-left: 5px solid var(--secondary); box-shadow: 0 4px 15px rgba(0,0,0,0.02); box-sizing: border-box; width: 100%; transition: transform 0.2s;">
                    
                    <b style="font-size: 15px; color:var(--text-color); font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${item.title}</b>
                    
                    <div style="color: var(--text-muted); font-size: 18px; padding-left: 10px; font-weight: 900; flex-shrink: 0;">›</div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html || '<p style="text-align:center; padding:30px; color:var(--text-muted); font-weight:700;">Nie znaleziono pasujących porad ani ras. 🐾</p>';
}

export function openWikiDetails(id, tab) {
    const modal = document.getElementById('wiki-details-modal');
    const items = WIKI[tab] || [];
    const item = items.find(i => i.id === id);
    if (!modal || !item) return;

    document.getElementById('wikiDetailsTitle').innerText = item.title;
    document.getElementById('wikiDetailsDesc').innerText = item.desc;
    
    const imgEl = document.getElementById('wikiDetailsImg');
    if (imgEl) {
        if (item.img && tab === 'rasy') {
            imgEl.src = item.img;
            // 🔥 Wracamy do "cover" - w połączeniu z naszym nowym zaokrągleniem w HTML da to luksusowy efekt zdjęcia jak w apkach Apple
            imgEl.style.objectFit = "cover"; 
            imgEl.parentElement.style.display = "block";
            imgEl.onerror = function() {
                this.onerror = null;
                this.parentElement.style.display = "none";
            };
        } else {
            imgEl.parentElement.style.display = "none";
        }
    }

    const tagsContainer = document.getElementById('wikiDetailsTags');
    tagsContainer.innerHTML = "";
    if (item.tags) {
        item.tags.forEach(tag => {
            tagsContainer.innerHTML += `<span style="font-size:12px; font-weight:800; background:var(--panel-bg); color:var(--text-color); padding:6px 14px; border-radius:100px; border:1px solid var(--border-color);">${tag}</span>`;
        });
    }

    const statsContainer = document.getElementById('wikiDetailsStats');
    if (item.filters && tab === 'rasy') {
        statsContainer.style.display = "grid";
        statsContainer.style.gridTemplateColumns = "1fr 1fr";
        statsContainer.style.gap = "10px";
        
        const labels = { kidsFriendly: "👶 Przyjazny dzieciom", easyToTrain: "🧠 Łatwość szkolenia", energyLevel: "⚡ Poziom energii", apartmentLive: "🛋️ Życie w bloku" };
        let statsHtml = "";
        for (const [key, value] of Object.entries(item.filters)) {
            let stars = "⭐".repeat(value);
            statsHtml += `<div style="font-size:13px; font-weight:800; color:var(--text-color);">${labels[key] || key}: <span style="letter-spacing:1px;">${stars}</span></div>`;
        }
        statsContainer.innerHTML = statsHtml;
    } else {
        statsContainer.style.display = "none";
    }

    modal.style.display = "flex";
}
