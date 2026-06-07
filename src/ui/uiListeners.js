// src/ui/uiListeners.js
import { initPostUi } from './postUiListeners.js';
import { initChatUi } from './chatUiListeners.js';
import { initWikiUi } from './wikiUiListeners.js';
import { initSettingsUi } from './settingsUiListeners.js';
import { initWalkUi } from './walkUiListeners.js';
import { initAlertsUi } from './alertsUiListeners.js';
import { initProfileUi } from './profileUiListeners.js';
import { initPlacesUi } from './placesUiListeners.js';

export function initUiListeners() {
    initPostUi();
    initChatUi();
    initWikiUi();
    initSettingsUi();
    initWalkUi();
    initAlertsUi();
    initProfileUi();
    initPlacesUi(); // 🔥 Tutaj jest właściwe miejsce na inicjalizację nowej zakładki

    // =========================================================================
    // 🔥 KULOODPORNY SYSTEM HISTORII (SPRZĘTOWY PRZYCISK WSTECZ DLA MODALI)
    // =========================================================================
    
    // 1. Robot wykrywający kiedy okno się otwiera
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'style') {
                const modal = mutation.target;
                const isVisible = window.getComputedStyle(modal).display !== 'none';
                
                // Jeśli modal się pojawił na ekranie i nie ma go w historii
                if (isVisible && !modal.dataset.inHistory) {
                    modal.dataset.inHistory = 'true';
                    // Wstrzykujemy krok do historii telefonu
                    history.pushState({ modalOpen: modal.id }, '');
                } 
                // Czyszczenie flagi, jeśli modal zniknął z ekranu
                else if (!isVisible && modal.dataset.inHistory) {
                    modal.dataset.inHistory = '';
                }
            }
        });
    });

    // 2. Podpinamy robota pod wszystkie okna w aplikacji
    document.querySelectorAll('.modal, #lightbox-modal').forEach(modal => {
        if(modal) observer.observe(modal, { attributes: true, attributeFilter: ['style'] });
    });

    // 3. Nasłuch na fizyczne wciśnięcie przycisku "Wstecz" (cofnięcie się)
    window.addEventListener('popstate', (e) => {
        // Szukamy otwartych okienek i je bezwzględnie zamykamy
        document.querySelectorAll('.modal, #lightbox-modal').forEach(modal => {
            if (modal && window.getComputedStyle(modal).display !== 'none') {
                modal.style.display = 'none';
                modal.dataset.inHistory = ''; // Czyścimy flagę
            }
        });
    });

    // 4. Globalna obsługa zamykania modali i kliknięć
    document.addEventListener('click', (e) => {
        // Zamykanie klasycznym krzyżykiem
        if (e.target.closest('.close-modal-btn')) { 
            const modal = e.target.closest('.modal') || e.target.closest('.modal-overlay'); 
            if(modal) {
                modal.style.display = 'none'; 
                if (modal.dataset.inHistory) {
                    modal.dataset.inHistory = '';
                    history.back(); 
                }
            }
        }
        
        // Zamykanie powiększonego zdjęcia po kliknięciu w ekran
        if (e.target.id === 'lightbox-modal' || e.target.closest('#lightbox-modal')) {
            const lb = document.getElementById('lightbox-modal');
            if (lb && lb.dataset.inHistory) {
                lb.dataset.inHistory = '';
                history.back(); // To wyzwoli zamknięcie dzięki popstate!
            } else if (lb) {
                lb.style.display = 'none';
            }
        }

        // 🔥 OŻYWIENIE LIGHTBOXA: Automatyczne przechwytywanie zdjęć z Tablicy
        if (e.target.tagName === 'IMG' && e.target.closest('.post-card')) {
            // Ignorujemy miniaturki z awatarem użytkownika (są wewnątrz przycisku)
            if (!e.target.closest('button')) {
                const lightboxModal = document.getElementById('lightbox-modal');
                const lightboxImg = document.getElementById('lightbox-img');
                if (lightboxModal && lightboxImg) {
                    lightboxImg.src = e.target.src; // Pobiera źródło dokładnie tego zdjęcia, które kliknąłeś
                    lightboxModal.style.display = 'flex'; // Odpala pełny ekran
                }
            }
        }
    });
}
