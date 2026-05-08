import { appState as state } from '../../core/state.js';
import { mapManager } from './mapManager.js';

let dogMarkers = {};

export function renderWalks(walks) {
    const L = window.L;
    const activeUids = new Set();
    let html = "";

    walks.forEach(d => {
        if (Date.now() - d.timestamp > 600000) return; // Ukryj pieski nieaktywne od 10 min
        activeUids.add(d.uid);
        const isMe = d.uid === state.user?.uid;

        const avatarSrc = d.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';

        // Pasek na górze "Stories"
        html += `<div class="story-circle" onclick="window.Waggle.centerOnTarget(${d.lat}, ${d.lng})" style="flex-shrink:0; cursor:pointer; display:flex; flex-direction:column; align-items:center; width:65px;">
                    <div style="width:55px; height:55px; border-radius:50%; padding:2px; border:2px solid ${isMe ? 'var(--secondary)' : 'var(--primary)'}; background:white; box-shadow:var(--soft-shadow);">
                        <img src="${avatarSrc}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">
                    </div>
                    <div style="font-size:10px; font-weight:900; margin-top:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%; text-align:center;">${isMe ? 'Ty' : d.name}</div>
                 </div>`;

        // Rysowanie awatarów psów na mapie
        if (!isMe) {
            if (dogMarkers[d.uid]) {
                dogMarkers[d.uid].setLatLng([d.lat, d.lng]);
            } else {
                const m = L.marker([d.lat, d.lng], {
                    icon: L.divIcon({
                        className: '',
                        html: `<div style="width:40px;height:40px;border-radius:50%;border:3px solid white;overflow:hidden;background:white;box-shadow:var(--soft-shadow); box-sizing: border-box;"><img src="${avatarSrc}" style="width:100%;height:100%;object-fit:cover;"></div>`,
                        iconSize: [40, 40]
                    })
                }).on('click', () => {
                    if(window.Waggle.openUserMenu) window.Waggle.openUserMenu(d.uid, d.name, avatarSrc, d.lat, d.lng);
                });

                dogMarkers[d.uid] = m;
                mapManager.addMarkerToLayer('walks', m);
            }
        }
    });

    // Usuwanie psów, które zeszły ze spaceru
    Object.keys(dogMarkers).forEach(u => {
        if (!activeUids.has(u)) {
            mapManager.removeMarkerFromLayer('walks', dogMarkers[u]);
            delete dogMarkers[u];
        }
    });

    const sc = document.getElementById('stories-container');
    if(sc) sc.innerHTML = html || "<p style='font-size:12px; color:var(--text-muted); padding-left:10px;'>Cisza w okolicy. Wyjdź jako pierwszy!</p>";
}
