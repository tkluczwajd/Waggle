// src/modules/map/walksRenderer.js
import { appState as state } from '../../core/state.js';
import { mapManager } from './mapManager.js';

let dogMarkers = {};

export function renderWalks(walks) {
    const L = window.L;
    const activeUids = new Set();
    let html = "";
    let activeWalkersCount = 0; // Licznik osób na spacerze

    walks.forEach(d => {
        if (Date.now() - d.timestamp > 600000) return; // Ukryj po 10 min braku aktywności
        
        activeUids.add(d.uid);
        activeWalkersCount++; // Zwiększamy licznik widocznych spacerowiczów

        const isMe = d.uid === state.user?.uid;
        const avatarSrc = d.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150';

        // 1. BUDOWANIE KÓŁECZEK "STORIES" NA TABLICY
        html += `<div class="story-circle" onclick="window.Waggle.centerOnTarget(${d.lat}, ${d.lng})" style="flex-shrink:0; cursor:pointer; display:flex; flex-direction:column; align-items:center; width:65px;">
                    <div style="width:55px; height:55px; border-radius:50%; padding:2px; border:2px solid ${isMe ? 'var(--secondary)' : 'var(--primary)'}; background:white; box-shadow:var(--soft-shadow); overflow:hidden;">
                        <img src="${avatarSrc}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">
                    </div>
                    <div style="font-size:10px; font-weight:800; margin-top:5px; color:var(--text-color); text-align:center; width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${isMe ? 'Ty' : d.name}</div>
                 </div>`;

        // 2. RYSOWANIE INNYCH PSÓW NA MAPIE LEAFLET
        if (!isMe) {
            // Czy ten pies ma ustawiony status tekstowy "Co u Was?"
            const hasStatusText = d.statusText && d.statusText.trim() !== "";

            if (dogMarkers[d.uid]) {
                // Pies już jest na mapie - po prostu aktualizujemy jego pozycję
                const m = dogMarkers[d.uid];
                m.setLatLng([d.lat, d.lng]);
                
                // Aktualizacja dymka w locie (jeśli status się zmienił)
                if (hasStatusText) {
                    m.setTooltipContent(`<b>${d.name}</b><br>💬 <i>${d.statusText}</i>`);
                } else {
                    m.setTooltipContent(`<b>${d.name}</b>`);
                }

            } else {
                // Pies pojawia się na mapie po raz pierwszy - tworzymy nowy znacznik
                const m = L.marker([d.lat, d.lng], {
                    icon: L.divIcon({
                        className: '',
                        html: `<div style="width:40px;height:40px;border-radius:50%;border:3px solid white;overflow:hidden;background:white;box-shadow:var(--soft-shadow);"><img src="${avatarSrc}" style="width:100%;height:100%;object-fit:cover;"></div>`,
                        iconSize: [40, 40],
                        iconAnchor: [20, 20] // Wyśrodkowanie ikonki
                    })
                });

                // 🔥 POPRAWKA A: Wyświetlanie chmurki ze statusem "Co u Was?"
                if (hasStatusText) {
                    m.bindTooltip(`<b>${d.name}</b><br>💬 <i>${d.statusText}</i>`, {
                        permanent: true,     // Widoczne cały czas (nie tylko po najechaniu)
                        direction: 'top',    // Nad głową psa
                        offset: [0, -20],    // Przesunięcie lekko w górę
                        className: 'custom-walk-tooltip'
                    });
                } else {
                    // Jak nie ma wpisanego tekstu, wyświetlamy samo imię po najechaniu myszką
                    m.bindTooltip(`<b>${d.name}</b>`, { direction: 'top', offset: [0, -20] });
                }

                // 🔥 POPRAWKA B: Kliknięcie na mapie otwiera kartę profilu (Zamiast rzucać do starego widoku czatu)
                m.on('click', () => {
                    if (typeof window.Waggle.showUserActionModal === 'function') {
                        // Otwieramy naszą nową, luksusową wizytówkę akcji
                        window.Waggle.showUserActionModal(d.uid, d.name, avatarSrc);
                    } else {
                        // Fallback, jeśli stara funkcja by jeszcze gdzieś była potrzebna
                        console.warn("Waggle.showUserActionModal nie istnieje. Próba użycia awaryjnego menu.");
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

    // 🔥 4. AKTUALIZACJA LICZNIKA "PSY NA SPACERZE" NA EKRANIE HOME
    const homeActiveWalksCounter = document.getElementById('home-active-walks');
    if (homeActiveWalksCounter) {
        homeActiveWalksCounter.innerText = activeWalkersCount;
        
        // Mały bonus wizualny: jeśli są psy, podświetlamy licznik na niebiesko
        if (activeWalkersCount > 0) {
            homeActiveWalksCounter.style.background = 'rgba(52, 172, 224, 0.15)';
            homeActiveWalksCounter.style.color = 'var(--primary)';
        } else {
            homeActiveWalksCounter.style.background = 'var(--bg-color)';
            homeActiveWalksCounter.style.color = 'var(--text-muted)';
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
