import { WIKI_DATA } from '../data/wikiData.js';

export function loadDynamicWiki() {
    let html = "";

    // Sekcja Ras
    html += `<div style="padding: 10px 20px;"><h4>🐕 Rasy psów</h4></div>`;
    WIKI_DATA.breeds.forEach(b => {
        html += `
            <div class="post-card">
                <b>${b.name}</b> <small>(${b.size})</small>
                <p style="font-size:13px; margin: 5px 0;">${b.desc}</p>
                <div style="font-size:11px; color:var(--secondary);">Energia: ${b.energy}</div>
            </div>`;
    });

    // Sekcja Szkolenia
    html += `<div style="padding: 10px 20px;"><h4>🎓 Szybkie porady</h4></div>`;
    WIKI_DATA.training.forEach(t => {
        html += `
            <div class="post-card" style="border-left: 4px solid var(--secondary);">
                <b>${t.title}</b>
                <p style="font-size:13px;">${t.desc}</p>
            </div>`;
    });

    const container = document.getElementById('wiki-container');
    if (container) container.innerHTML = html;
}
