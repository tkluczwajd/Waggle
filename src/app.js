// src/app.js - Nowy, minimalistyczny punkt wejścia ekosystemu Waggle 🐾
import { bootstrapApp } from './core/appBootstrap.js';

bootstrapApp();

// ============================================================================
// 🔥 MANAGER HISTORII PWA (Naprawa przycisku "Wstecz" na Androidzie)
// ============================================================================

// 1. Zastępujemy domyślną funkcję zamykania modali, aby była widoczna globalnie
window.Waggle = window.Waggle || {};
window.Waggle.closeAllModals = () => {
    const modals = document.querySelectorAll('.modal');
    let anyModalClosed = false;
    
    modals.forEach(modal => {
        if (modal.style.display === 'flex' || modal.style.display === 'block') {
            modal.style.display = 'none';
            anyModalClosed = true;
        }
    });
    
    return anyModalClosed; // Zwraca true, jeśli faktycznie jakieś okno było otwarte
};

// 2. Podpinamy nasłuchiwacz do wszystkich przycisków otwierających JAKIEKOLWIEK modale
function initPwaHistoryManager() {
    // Obserwator zmian - wykrywa, gdy pojawia się nowy modal
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'style') {
                const displayStyle = window.getComputedStyle(mutation.target).display;
                if (displayStyle === 'flex' || displayStyle === 'block') {
                    // Kiedy modal się otwiera, dodajemy "pusty" stan do historii telefonu
                    window.history.pushState({ modalOpen: true }, "");
                }
            }
        });
    });

    // Zaczynamy obserwować wszystkie modale
    document.querySelectorAll('.modal').forEach(modal => {
        observer.observe(modal, { attributes: true });
    });

    // 3. Magia: Przechwytujemy fizyczny przycisk "Wstecz" na telefonie!
    window.addEventListener('popstate', (e) => {
        // Zamiast cofać stronę internetową, po prostu zamykamy okienka aplikacji
        const didCloseSomething = window.Waggle.closeAllModals();
        
        // Jeśli nie było okienek do zamknięcia, nic nie robimy (apka zminimalizuje się naturalnie)
    });
}

// Uruchamiamy po załadowaniu drzewa dokumentu
document.addEventListener('DOMContentLoaded', initPwaHistoryManager);
