// src/app.js - Nowy, minimalistyczny punkt wejścia ekosystemu Waggle 🐾
import { bootstrapApp } from './core/appBootstrap.js';
// 🔥 IMPORTUJEMY NASZ NOWY SILNIK DZIENNIKA
import { addJournalEntry, subscribeToJournal } from './services/journalService.js';

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

// 2. Podpinamy nasłuchiwacz do wszystkich przycisków otwierających modale
function initPwaHistoryManager() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'style') {
                const target = mutation.target;
                const displayStyle = window.getComputedStyle(target).display;
                
                // 🔥 ZABEZPIECZENIE: Dodajemy do historii TYLKO przy pierwszym otwarciu
                if ((displayStyle === 'flex' || displayStyle === 'block') && target.dataset.isOpen !== 'true') {
                    target.dataset.isOpen = 'true';
                    window.history.pushState({ modalOpen: true }, "");
                } else if (displayStyle === 'none') {
                    target.dataset.isOpen = 'false';
                }
            }
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        observer.observe(modal, { attributes: true });
    });

    window.addEventListener('popstate', (e) => {
        window.Waggle.closeAllModals();
    });
}

// Uruchamiamy po załadowaniu drzewa dokumentu
document.addEventListener('DOMContentLoaded', initPwaHistoryManager);


// ============================================================================
// 🔥 WAGGLE FAMILY: LOGIKA DZIENNIKA PSA
// ============================================================================

// 1. Funkcja podpięta pod przyciski (uruchamia się po kliknięciu)
window.logDogActivity = async (type) => {
    // Tymczasowo, dopóki nie ma wielu psów, ID psa to po prostu UID zalogowanego użytkownika
    const currentUid = localStorage.getItem('uid') || (firebase.auth().currentUser ? firebase.auth().currentUser.uid : null);
    const userName = localStorage.getItem('userName') || "Opiekun";

    if (!currentUid) {
        console.error("Brak UID - użytkownik niezalogowany");
        return;
    }

    try {
        await addJournalEntry(currentUid, type, userName);
        
        // Powiadomienie o sukcesie z Twojego systemu powiadomień
        if (window.Waggle && window.Waggle.showToast) {
            window.Waggle.showToast("✅ Zapisano w dzienniku!");
        }
    } catch (error) {
        console.error("Błąd zapisu aktywności:", error);
    }
};

// 2. Nasłuchiwanie na zalogowanie i ładowanie listy z bazy
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        // Kiedy tylko upewnimy się, że użytkownik jest zalogowany, pobieramy dziennik
        subscribeToJournal(user.uid, (entries) => {
            // 🔥 WAGGLE FAMILY DASHBOARD: Wyświetlamy tylko 3 ostatnie!
            const recentEntries = entries.slice(0, 3);

            listElement.innerHTML = recentEntries.map((entry, index) => {
                let timeString = "Teraz";
                if (entry.timestamp) {
                    const date = entry.timestamp.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp);
                    timeString = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                }

                // Dodajemy zielonego ptaszka dla ułatwienia (Checklist style)
                return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: ${index === 0 ? 'rgba(46, 213, 115, 0.05)' : 'var(--bg-color)'}; border: 1px solid ${index === 0 ? 'rgba(46, 213, 115, 0.2)' : 'transparent'}; border-radius: 10px; font-size: 13px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 18px;">${icons[entry.type] || '🐾'}</span>
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-weight: 900; color: var(--text-color);">${labels[entry.type] || 'Aktywność'}</span>
                            <span style="font-size: 10px; color: var(--text-muted); font-weight: 700;">Przez: ${entry.doneByUserName}</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 900; color: var(--text-color); font-size: 12px;">${timeString}</span>
                        <span style="color: #2ed573; font-size: 14px;">✅</span>
                    </div>
                </div>`;
            }).join('');
        });
    }
});
