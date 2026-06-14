// src/modules/map/walksRenderer.js
import { appState as state } from '../../core/state.js';
import { mapManager } from './mapManager.js';

let dogMarkers = {};

export function renderWalks(walks) {
    const L = window.L;
    const activeUids = new Set();
    let html = "";
    let activeWalkersCount = 0; // Licznik osób na spacerze
    let activeWalkersAvatars = []; // 🔥 Tablica na zdjęcia awatarów

    walks.forEach(d => {
        if (Date.now() - d.timestamp > 600000) return; // Ukryj po 10 min braku aktywności
        
        activeUids.add(d.uid);
        activeWalkersCount++; // Zwiększamy licznik widocznych spacerowiczów

        const isMe = d.uid === state.user?.uid;
        const avatarSrc = d.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';

        // 🔥 Dodajemy zdjęcie psa do puli, żeby wyświetlić je na ekranie Home
        activeWalkersAvatars.push(avatarSrc);

        // 1. BUDOWANIE KÓŁECZEK "STORIES" NA TABLICY
        html += `<div class="story-circle" onclick="event.stopPropagation(); window.Waggle.showUserActionModal('${d.uid}', '${(d.name || '').replace(/'/g, "\\'")}', '${avatarSrc}', ${d.lat}, ${d.lng})" style="flex-shrink:0; cursor:pointer; display:flex; flex-direction:column; align-items:center; width:65px;">
                    <div style="width:55px; height:55px; border-radius:50%; padding:2px; border:2px solid ${isMe ? 'var(--secondary)' : 'var(--primary)'}; background:white; box-shadow:var(--soft-shadow); overflow:hidden;">
                        <img src="${avatarSrc}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">
                    </div>
                    <div style="font-size:10px; font-weight:800; margin-top:5px; color:var(--text-color); text-align:center; width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${isMe ? 'Ty' : d.name}</div>
                 </div>`;

        // 2. RYSOWANIE INNYCH PSÓW NA MAPIE LEAFLET
        if (!isMe) {
            const hasStatusText = d.statusText && d.statusText.trim() !== "";

            if (dogMarkers[d.uid]) {
                const m = dogMarkers[d.uid];
                m.setLatLng([d.lat, d.lng]);
                
                if (hasStatusText) {
                    m.setTooltipContent(`<b>${d.name}</b><br>💬 <i>${d.statusText}</i>`);
                } else {
                    m.setTooltipContent(`<b>${d.name}</b>`);
                }
            } else {
                const m = L.marker([d.lat, d.lng], {
                    icon: L.divIcon({
                        className: '',
                        html: `<div style="width:40px;height:40px;border-radius:50%;border:3px solid white;overflow:hidden;background:white;box-shadow:var(--soft-shadow);"><img src="${avatarSrc}" style="width:100%;height:100%;object-fit:cover;"></div>`,
                        iconSize: [40, 40],
                        iconAnchor: [20, 20]
                    })
                });

                if (hasStatusText) {
                    m.bindTooltip(`<b>${d.name}</b><br>💬 <i>${d.statusText}</i>`, {
                        permanent: true, direction: 'top', offset: [0, -20], className: 'custom-walk-tooltip'
                    });
                } else {
                    m.bindTooltip(`<b>${d.name}</b>`, { direction: 'top', offset: [0, -20] });
                }

                m.on('click', () => {
                    if (typeof window.Waggle.showUserActionModal === 'function') {
                        window.Waggle.showUserActionModal(d.uid, d.name, avatarSrc);
                    } else {
                        if(window.Waggle.openUserMenu) window.Waggle.openUserMenu(d.uid, d.name, avatarSrc, d.lat, d.lng);
                    }
                });

                dogMarkers[d.uid] = m;
                mapManager.addMarkerToLayer('walks', m);
            }
        }
    });

    // 3. AKTUALIZACJA "STORIES" NA ZAKŁADCE TABLICA
    const storiesContainer = document.getElementById('stories-container');
    if (storiesContainer) {
        storiesContainer.innerHTML = html || '<p style="font-size:10px; color:var(--text-muted); margin-left:15px; font-weight:700;">Brak psów na spacerze 🐾</p>';
    }

    // 🔥 4. NOWOŚĆ: EFEKT WOW NA EKRANIE HOME (Miniaturki)
    const container = document.getElementById('home-active-avatars');
    const countDisplay = document.getElementById('home-active-walks');
    
    // Uzupełniamy samą liczbę
    if (countDisplay) countDisplay.innerText = activeWalkersCount;

    // Budujemy stosik awatarów
    if (container) {
        if (activeWalkersAvatars.length === 0) {
            container.innerHTML = '<span style="font-size: 24px;">🗺️</span>';
        } else {
            const maxToDisplay = 3;
            const displayDogs = activeWalkersAvatars.slice(0, maxToDisplay);
            const extraDogs = activeWalkersAvatars.length - maxToDisplay;

            let avatarsHtml = '';
            displayDogs.forEach((imgUrl, index) => {
                const marginLeft = index === 0 ? '0' : '-12px';
                const zIndex = 10 - index;
                avatarsHtml += `
                    <img src="${imgUrl}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid white; margin-left: ${marginLeft}; z-index: ${zIndex}; position: relative; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                `;
            });

            if (extraDogs > 0) {
                avatarsHtml += `
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--bg-color); color: var(--text-color); border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; margin-left: -12px; z-index: 1; position: relative; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        +${extraDogs}
                    </div>
                `;
            }

            container.innerHTML = avatarsHtml;
        }
    }

    // 5. USUNIĘCIE PSÓW, KTÓRE SKOŃCZYŁY SPACER (ZESZŁY Z MAPY)
    Object.keys(dogMarkers).forEach(u => {
        if (!activeUids.has(u)) {
            mapManager.removeMarkerFromLayer('walks', dogMarkers[u]);
            delete dogMarkers[u];
        }
    });
}
