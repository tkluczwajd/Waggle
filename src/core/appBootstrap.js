// src/core/appBootstrap.js
import { initRouter } from './router.js';
import { initGlobalUtils } from '../ui/globalUtils.js';
import { initUiListeners } from '../ui/uiListeners.js';
import { initWaggleApi } from './waggleApi.js';
import { setupAuth } from './authInit.js';
import { setupSubscriptions } from './subscriptionInit.js';
import { setupLocationTracking } from './locationInit.js';
import { renderWiki } from '../ui/wikiRenderer.js';
import { updateStatsUI, updateUserMarker } from '../ui/uiHelpers.js';
import { initMap } from '../modules/map/mapManager.js';
import { appState as state } from './state.js';
import { fetchWeather } from '../services/weatherService.js';
import { fetchNearbyParks } from '../services/parksService.js';
import { renderParksOnMap } from '../modules/map/parksRenderer.js';
import { listenToDailyCare } from '../modules/care.js';
import { initProfileUi } from '../ui/profileUiListeners.js';

// Uporządkowane moduły komunikacji i powiadomień okolicy:
import { initLiveFeed } from '../modules/map/liveFeed.js';
import { loadInbox } from '../modules/chat/chatListeners.js';
import '../modules/chat/groupListeners.js'; 
import { listenForSafeAlerts } from '../services/safeService.js';

export function bootstrapApp() {
    initGlobalUtils();
    initWaggleApi(updateUserMarker);
    window.Waggle.updateStatsUI = updateStatsUI; 

    // Startujemy auth, po którym bezpiecznie odpala się reszta aplikacji
    setupAuth(() => {
        initRouter();
        initProfileUiListeners();
        initUiListeners();

        // Uruchomienie lokalnego radaru oraz nasłuchu wiadomości
        initLiveFeed();
        loadInbox();

        // Rysujemy profil natychmiast po zalogowaniu
        updateStatsUI();
        listenToDailyCare(); // 🔥 ODPALAMY SILNIK CODZIENNEJ OPIEKI

        // ODPALAMY RADAR SAFE (jeśli pies ma wygenerowany kod)
        if (state.profile && state.profile.safeId) {
            listenForSafeAlerts(state.profile.safeId, (alertData) => {
                if (alertData.type === 'sighting' && alertData.location) {
                    const lat = alertData.location.latitude;
                    const lng = alertData.location.longitude;

                    window.Waggle.showToast("🚨 UWAGA! Ktoś namierzył Twojego psa! Sprawdź mapę!", 8000); 

                    if (state.map.instance) { 
                        const L = window.L;

                        const sosIcon = L.divIcon({
                            className: 'sos-marker',
                            html: `
                                <div style="background: white; border: 4px solid #ff5252; border-radius: 50%; width: 45px; height: 45px; display: flex; justify-content: center; align-items: center; box-shadow: 0 0 25px rgba(255, 82, 82, 0.8), 0 0 0 8px rgba(255, 82, 82, 0.2);">
                                    <div style="font-size: 22px; animation: pulse 1s infinite;">🚨</div>
                                </div>
                            `,
                            iconSize: [53, 53],
                            iconAnchor: [26, 26],
                            popupAnchor: [0, -30]
                        });

                        const popupHtml = `
                            <div style="text-align: center; font-family: 'Inter', sans-serif; min-width: 160px; padding: 4px;">
                                <div style="font-size: 11px; color: #ff5252; font-weight: 900; letter-spacing: 1px; margin-bottom: 6px;">OSTATNIA ZNANA POZYCJA</div>
                                <div style="font-size: 16px; color: #2d3436; font-weight: 800; line-height: 1.2;">Pies namierzony!</div>
                                <div style="font-size: 12px; color: #636e72; font-weight: 700; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">Zgłoszono przez znalazcę<br>Waggle SAFE</div>
                            </div>
                        `;

                        L.marker([lat, lng], { icon: sosIcon, zIndexOffset: 9999 })
                            .addTo(state.map.instance)
                            .bindPopup(popupHtml, { 
                                closeButton: false, 
                                offset: L.point(0, -10)
                            })
                            .openPopup();

                        state.map.instance.flyTo([lat, lng], 17, { animate: true, duration: 1.5 });
                    }
                }
            });
        }

        // Geolokalizacja i dynamiczne ładowanie otoczenia
        setupLocationTracking((lat, lng) => {
            initMap(); 
            updateStatsUI(); 

            // Czyste, stabilne centrowanie mapy na start
            if(state.map.instance) {
                state.map.instance.setView([lat, lng], 15, { animate: false });
                setTimeout(() => { 
                    state.map.instance.invalidateSize(true); 
                }, 300);
            }

            setupSubscriptions();
            fetchWeather(lat, lng);
            renderWiki('sytuacje');

            // Ładowanie psich parków
            (async () => {
                try {
                    const container = document.getElementById('places-container'); 
                    const places = await fetchNearbyParks(lat, lng); 
                    
                    if (places && places.length > 0) {
                        renderParksOnMap(places);
                    }
                    
                    let html = "";
                    places.forEach(place => {
                        const nameLower = (place.name || "").toLowerCase();
                        let color = 'var(--primary)'; 
                        let emoji = '🌳';
                        let label = 'Park';

                        if (place.isDogPark) {
                            color = 'var(--secondary)';
                            emoji = '🏞️';
                            label = 'Wybieg dla psów';
                        } else if (nameLower.includes('las') || nameLower.includes('lasek') || place.type === 'forest') {
                            color = '#2ecc71'; 
                            emoji = '🌲';
                            label = 'Las / Teren leśny';
                        }

                        const distanceStr = place.distance ? place.distance.toFixed(1) : "?";
                        const placeName = place.name || "Teren zielony";

                        // 🔥 POPRAWKA: Prawidłowy i bezpieczny link do Google Maps nawigacji
                        const navLink = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;

                        html += `<div class="post-card" style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; padding: 15px; border-left: 4px solid ${color};">
                                    <div style="display:flex; align-items:center; gap:15px;">
                                        <div style="font-size:30px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">${emoji}</div>
                                        <div>
                                            <b style="font-size:16px; color:var(--text-color);">${placeName}</b><br>
                                            <span style="font-size:12px; color:var(--text-muted); font-weight:800;">${label} • ${distanceStr} km</span>
                                        </div>
                                    </div>
                                    <button class="btn-outline" style="padding:8px 12px; font-size:12px; border-color:${color}; color:${color}; width:auto;" onclick="window.open('${navLink}', '_blank')">Prowadź</button>
                                </div>`;
                    });
                    
                    if (container) {
                        container.innerHTML = html || '<p style="text-align:center; padding:20px; color:var(--text-muted);">Brak zielonych terenów w najbliższej okolicy. 🐾</p>'; 
                    }
                    state.placesLoaded = true;
                } catch (e) { 
                    console.error("Błąd podczas budowania listy parków:", e); 
                }
            })();

            const centerBtn = document.getElementById('centerBtn');
            if (centerBtn) {
                centerBtn.onclick = async () => {
                    if (state.location.lat && state.location.lng) {
                        window.Waggle.showToast("Skanuję nowe tereny wokół Ciebie... 🌳");
                        
                        if (state.map.instance) {
                            state.map.instance.setView([state.location.lat, state.location.lng], 15, { animate: true });
                        } 
                        
                        try {
                            const newPlaces = await fetchNearbyParks(state.location.lat, state.location.lng);
                            if (newPlaces && newPlaces.length > 0) {
                                renderParksOnMap(newPlaces);
                                window.Waggle.showToast("Gotowe! Miejscówki na mapie. 🐾");
                            } else {
                                window.Waggle.showToast("Brak zielonych terenów w tej okolicy.");
                            }
                        } catch (e) {
                            window.Waggle.showToast("Błąd połączenia z bazą miejsc.");
                        }
                    }
                };
            }

            setInterval(() => {
                if (state.location.lat) fetchWeather(state.location.lat, state.location.lng);
            }, 1800000);
        });

        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 300);
        }
    });

    window.addEventListener('resize', () => {
        if (state.map.instance) state.map.instance.invalidateSize();
    });
}
