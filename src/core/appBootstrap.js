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

// --- RADAR S.A.F.E. (Przechwytywanie skanów QR z ulicy) ---
const urlParams = new URLSearchParams(window.location.search);
const safeId = urlParams.get('safe');

// --- LOGIKA WYSYŁANIA LOKALIZACJI PRZEZ ZNALAZCĘ ---
window.Waggle.shareFinderLocation = () => {
    const btn = document.getElementById('shareLocationBtn');
    if (btn) {
        btn.innerText = "POBIERAM SYGNAŁ GPS... ⏳";
        btn.disabled = true;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                // Dynamiczny import z uwagi na globalny kontekst funkcji
                const { db, fb } = await import('./firebase.js');
                
                await db.collection('safe_reports').add({
                    ownerUid: safeId,
                    lat: latitude,
                    lng: longitude,
                    status: 'NEW',
                    source: 'APP_MODAL',
                    timestamp: fb.firestore.FieldValue.serverTimestamp()
                });

                if (btn) {
                    btn.innerText = "✅ WYSŁANO LOKALIZACJĘ!";
                    btn.style.background = "#2ed573";
                    btn.style.borderColor = "#2ed573";
                }
                if (window.Waggle.showToast) window.Waggle.showToast("Dziękujemy! Opiekun otrzymał powiadomienie z pozycją na mapie.");
            } catch (err) {
                console.error("Błąd zapisu SAFE:", err);
                if (btn) {
                    btn.innerText = "❌ BŁĄD WYSYŁANIA";
                    btn.disabled = false;
                }
                if (window.Waggle.showToast) window.Waggle.showToast("Błąd serwera. Spróbuj ponownie.");
            }
        },
        (err) => {
            console.warn("Błąd GPS:", err);
            if (btn) {
                btn.innerText = "❌ BRAK ZGODY NA GPS";
                btn.disabled = false;
            }
            alert("Musisz zezwolić przeglądarce na dostęp do lokalizacji, aby pomóc pieskowi!");
        },
        // Wymuszamy najwyższą dokładność, dajemy 15 sekund na znalezienie satelit i nie używamy cache'u GPS
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
};

if (safeId) {
    const modal = document.getElementById('public-safe-modal');
    if (modal) modal.style.display = 'flex';

    // Pobieramy na żywo dane psa i wyświetlamy znalazcy
    import('./core/firebase.js').then(({ db }) => {
        db.collection('users').doc(safeId).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('publicSafeName').innerText = data.name || "Nieznane imię";
                document.getElementById('publicSafeBreed').innerText = data.breed || "Brak danych o rasie";

                if (data.avatar) {
                    const av = document.getElementById('publicSafeAvatar');
                    av.src = data.avatar;
                    av.style.display = 'block';
                }

                const phone = data.phone || data.vet || "";
                const phoneBtn = document.getElementById('publicSafePhone');
                if (phone) {
                    phoneBtn.href = "tel:" + phone;
                    phoneBtn.style.display = 'inline-block';
                }

                document.getElementById('publicSafeAllergies').innerText = data.allergies || "Brak";
                document.getElementById('publicSafeMeds').innerText = data.meds || "Brak";
                document.getElementById('publicSafeChip').innerText = data.chip || "Brak";
                document.getElementById('publicSafeNotes').innerText = data.notes || "Brak";
            } else {
                document.getElementById('publicSafeName').innerText = "Profil nie istnieje";
            }
        }).catch(err => {
            console.error("Błąd pobierania S.A.F.E:", err);
            document.getElementById('publicSafeName').innerText = "Błąd połączenia";
        });
    });
}
// ---------------------------------------------------------

export function bootstrapApp() {
    initGlobalUtils();
    initWaggleApi(updateUserMarker);
    window.Waggle.updateStatsUI = updateStatsUI; 

    // Startujemy auth, po którym bezpiecznie odpala się reszta aplikacji
// Startujemy auth, po którym bezpiecznie odpala się reszta aplikacji
// ... wewnątrz bootstrapApp() -> setupAuth() ...
    // Startujemy auth, po którym bezpiecznie odpala się reszta aplikacji
    setupAuth(() => {
        initRouter();

        // 🔥 PANCERNY SYSTEM RATUNKOWY S.A.F.E. - RADAR NA ŻYWO
        const startSafeRadar = () => {
            const currentUid = localStorage.getItem('activeDogId') || localStorage.getItem('uid');
            if (!currentUid) return;

            import('./firebase.js').then(({ db }) => {
                // Używamy onSnapshot, aby apka nasłuchiwała bazy przez cały czas
                db.collection('safe_reports')
                .where('ownerUid', '==', currentUid)
                .onSnapshot(snap => {
                    snap.docChanges().forEach(change => {
                        // Reagujemy tylko na nowo dodane lub zaktualizowane raporty
                        if (change.type === 'added' || change.type === 'modified') {
                            const report = change.doc.data();
                            const reportTime = report.timestamp && typeof report.timestamp.toMillis === 'function' ? report.timestamp.toMillis() : Date.now();
                            const ageInMinutes = (Date.now() - reportTime) / 60000;

                            // Reagujemy na alarmy wyłącznie z ostatnich 15 minut
                            if (ageInMinutes < 15 && report.lat && report.lng) {
                                console.log("🚨 RADAR SAFE: Odebrano sygnał ratunkowy!");
                                
                                // 1. Wibracja (jeśli przeglądarka na telefonie na to pozwala)
                                if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 1000]);
                                
                                // 2. Agresywny komunikat Toast
                                if (window.Waggle && window.Waggle.showToast) {
                                    window.Waggle.showToast("🚨 UWAGA! Ktoś namierzył Twojego psa! Sprawdź mapę!", 8000);
                                }

                                // 3. Przełączenie widoku na mapę
                                const mapTab = document.querySelector('[data-view="local"]');
                                if (mapTab) mapTab.click();

                                // 4. Rysowanie potężnego czerwonego markera SOS
                                setTimeout(() => {
                                    if (state.map && state.map.instance) {
                                        const L = window.L;
                                        const sosIcon = L.divIcon({
                                            className: 'sos-marker',
                                            html: `
                                                <div style="background: white; border: 4px solid #ff5252; border-radius: 50%; width: 45px; height: 45px; display: flex; justify-content: center; align-items: center; box-shadow: 0 0 25px rgba(255, 82, 82, 0.9), 0 0 0 10px rgba(255, 82, 82, 0.3);">
                                                    <div style="font-size: 24px; animation: pulse 1s infinite;">🚨</div>
                                                </div>
                                            `,
                                            iconSize: [53, 53],
                                            iconAnchor: [26, 26],
                                            popupAnchor: [0, -30]
                                        });

                                        const popupHtml = `
                                            <div style="text-align: center; font-family: 'Inter', sans-serif; min-width: 160px; padding: 5px;">
                                                <div style="font-size: 11px; color: #ff5252; font-weight: 900; letter-spacing: 1px; margin-bottom: 6px;">LOKALIZACJA PSA</div>
                                                <div style="font-size: 14px; color: #2d3436; font-weight: 800; line-height: 1.2;">Skan Kodu S.A.F.E.</div>
                                                <div style="font-size: 11px; color: #636e72; font-weight: 700; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">Znalazca udostępnił pozycję</div>
                                            </div>
                                        `;

                                        // Dodajemy marker i centrujemy mapę
                                        L.marker([report.lat, report.lng], { icon: sosIcon, zIndexOffset: 99999 })
                                            .addTo(state.map.instance)
                                            .bindPopup(popupHtml, { closeButton: false, offset: L.point(0, -10) })
                                            .openPopup();

                                        state.map.instance.flyTo([report.lat, report.lng], 18, { animate: true, duration: 1.5 });
                                    }
                                }, 1000);
                            }
                        }
                    });
                });
            });
        };

        // Odpalamy nasłuch natychmiast
        startSafeRadar();

        // Odpalamy sprawdzanie natychmiast przy każdym "wybudzeniu" lub "zimnym starcie"
        checkRecentSafeReports();
        
        // Dodajemy nasłuch na powrót aplikacji z tła na Androidzie (visibilitychange)
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === 'visible') {
                checkRecentSafeReports();
            }
        });

        // -------------------------------------------------------------
        
        initProfileUi();
        initUiListeners();

        // Uruchomienie lokalnego radaru oraz nasłuchu wiadomości
        initLiveFeed();
        loadInbox();
        
        // ... (reszta Twojego kodu bez zmian)

        // Rysujemy profil natychmiast po zalogowaniu
        updateStatsUI();
        listenToDailyCare(); // 🔥 ODPALAMY SILNIK CODZIENNEJ OPIEKI

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
