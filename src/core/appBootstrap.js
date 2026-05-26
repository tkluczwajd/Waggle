// src/core/appBootstrap.js
import { initRouter } from './router.js';
import { initProfileListeners } from '../modules/profile/profileListeners.js';
import { initGlobalUtils } from '../ui/globalUtils.js';
import { initUiListeners } from '../ui/uiListeners.js';
import { initWaggleApi } from './waggleApi.js';
import { setupAuth } from './authInit.js';
import { setupSubscriptions } from './subscriptionInit.js';
import { setupLocationTracking } from './locationInit.js';
import { renderWiki } from '../ui/wikiRenderer.js';
import { updateStatsUI, updateUserMarker, loadSettings } from '../ui/uiHelpers.js';
import { initMap } from '../modules/map/mapManager.js';
import { appState as state } from './state.js';
import { fetchWeather } from '../services/weatherService.js';
import { fetchNearbyParks } from '../services/parksService.js';
import { renderParksOnMap } from '../modules/map/parksRenderer.js';

// Uporządkowane moduły komunikacji i powiadomień okolicy:
import { initLiveFeed } from '../modules/map/liveFeed.js';
import { loadInbox } from '../modules/chat/chatListeners.js';
import '../modules/chat/groupListeners.js'; // Rejestruje Stado w window.Waggle przed startem UI

export function bootstrapApp() {
    initGlobalUtils();
    loadSettings();
    initWaggleApi(updateUserMarker);
    window.Waggle.updateStatsUI = updateStatsUI; 

    // Startujemy auth, po którym bezpiecznie odpala się reszta aplikacji
    setupAuth(() => {
        initRouter();
        initProfileListeners();
        initUiListeners();

        // Uruchomienie lokalnego radaru oraz nasłuchu wiadomości
        initLiveFeed();
        loadInbox();

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
            renderWiki('rasy');

            // Ładowanie psich parków, lasów i generowanie listy w panelu
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

                        html += `<div class="post-card" style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; padding: 15px; border-left: 4px solid ${color};">
                                    <div style="display:flex; align-items:center; gap:15px;">
                                        <div style="font-size:30px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">${emoji}</div>
                                        <div>
                                            <b style="font-size:16px; color:var(--text-color);">${placeName}</b><br>
                                            <span style="font-size:12px; color:var(--text-muted); font-weight:800;">${label} • ${distanceStr} km</span>
                                        </div>
                                    </div>
                                    <button class="btn-outline" style="padding:8px 12px; font-size:12px; border-color:${color}; color:${color}; width:auto;" onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}', '_blank')">Prowadź</button>
                                </div>`;
                    });
                    
                    if (container) {
                        container.innerHTML = html || '<p style="text-align:center; padding:20px; color:var(--text-muted);">Brak zielonych terenów w najbliższej okolicy. 🐾</p>'; 
                    }
                    state.placesLoaded = true;
                } catch (e) { 
                    console.error("Krytyczny błąd podczas budowania listy parków:", e); 
                }
            })();

            // Wymuszenie ponownego odświeżenia i skanowania parków po kliknięciu celownika 🎯
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

            // Odświeżamy pogodę automatycznie co 30 minut
            setInterval(() => {
                if (state.location.lat) fetchWeather(state.location.lat, state.location.lng);
            }, 1800000);
        });

        // Ukrycie loaderu startowego po pełnym załadowaniu kontekstu auth
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 300);
        }
    });

    // Reakcja na zmianę wielkości ekranu (naprawa Leafleta)
    window.addEventListener('resize', () => {
        if (state.map.instance) state.map.instance.invalidateSize();
    });
}
