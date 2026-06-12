// src/app.js - Nowy, minimalistyczny punkt wejścia ekosystemu Waggle 🐾
import { bootstrapApp } from './core/appBootstrap.js';
import { addJournalEntry, subscribeToJournal, getJournalHistory } from './services/journalService.js';

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
   // Sprawdzamy najpierw czy mamy współdzielonego psa, jak nie to bierzemy własnego
    const currentUid = localStorage.getItem('activeDogId') || localStorage.getItem('uid') || (firebase.auth().currentUser ? firebase.auth().currentUser.uid : null);
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

// 2. Kuloodporne nasłuchiwanie na zmiany w Dzienniku + CELOWANIE
function initJournalListener() {
    const currentUid = localStorage.getItem('activeDogId') || localStorage.getItem('uid') || (firebase.auth().currentUser ? firebase.auth().currentUser.uid : null);
    
    if (!currentUid) {
        setTimeout(initJournalListener, 1000);
        return;
    }

    console.log("🐾 Podpinam nasłuchiwacz Dziennika dla ID:", currentUid);

    // 🔥 NOWOŚĆ: Najpierw pobieramy zapisane cele z profilu (z bazy users)
    firebase.firestore().collection('users').doc(currentUid).get().then(doc => {
        // Jeśli nie ma ustawionych celów, bierzemy domyślne
        const dailyGoals = doc.exists && doc.data().dailyGoals ? doc.data().dailyGoals : { feed: 2, walk: 3, med: 1, water: 3 };

        // Dopiero teraz podpinamy nasłuch historii
        subscribeToJournal(currentUid, (entries) => {
            const listElement = document.getElementById('journal-live-list');
            if (!listElement) return;

            const todayStr = new Date().toDateString();
            const dailyCounts = { feed: 0, walk: 0, med: 0, water: 0 };

            if (entries && entries.length > 0) {
                entries.forEach(entry => {
                    if (entry.timestamp && typeof entry.timestamp.toDate === 'function') {
                        if (entry.timestamp.toDate().toDateString() === todayStr) {
                            if (dailyCounts[entry.type] !== undefined) dailyCounts[entry.type]++;
                        }
                    }
                });
            }

            // Rysowanie pasków postępu na bazie TWOICH WŁASNYCH celów
            ['feed', 'walk', 'med', 'water'].forEach(type => {
                const countEl = document.getElementById(`count-${type}`);
                const goalEl = document.getElementById(`goal-${type}`);
                const bgEl = document.getElementById(`progress-bg-${type}`);
                
                if (countEl && bgEl && goalEl) {
                    countEl.innerText = dailyCounts[type];
                    goalEl.innerText = dailyGoals[type]; // Wyświetlamy cel z bazy!

                    // Obliczamy % wypełnienia (zabezpieczenie przed dzieleniem przez zero)
                    let percentage = dailyGoals[type] > 0 ? Math.min((dailyCounts[type] / dailyGoals[type]) * 100, 100) : 100;
                    bgEl.style.width = `${percentage}%`;

                    // Jeśli osiągnięto cel
                    if (dailyGoals[type] > 0 && dailyCounts[type] >= dailyGoals[type]) {
                        bgEl.style.background = 'rgba(46, 213, 115, 0.2)'; 
                        countEl.style.color = '#2ed573';
                    } else {
                        bgEl.style.background = 'rgba(52, 172, 224, 0.1)'; 
                        countEl.style.color = 'var(--text-color)';
                    }
                }
            });

            // Rysowanie 3 ostatnich aktywności
            if (!entries || entries.length === 0) {
                listElement.innerHTML = '<div style="text-align: center; font-size: 12px; color: var(--text-muted); font-weight: 700; padding: 10px 0;">Brak aktywności z dzisiaj...</div>';
                return;
            }

            const icons = { feed: '🍖', walk: '🚶', med: '💊', water: '💧', vet: '🏥' };
            const labels = { feed: 'Nakarmiony', walk: 'Spacer', med: 'Lek', water: 'Woda', vet: 'Weterynarz' };

            const recentEntries = entries.slice(0, 3);
            listElement.innerHTML = recentEntries.map((entry, index) => {
                let timeString = "Teraz";
                if (entry.timestamp && typeof entry.timestamp.toDate === 'function') {
                    timeString = entry.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                }

                return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: ${index === 0 ? 'rgba(46, 213, 115, 0.05)' : 'var(--bg-color)'}; border: 1px solid ${index === 0 ? 'rgba(46, 213, 115, 0.2)' : 'transparent'}; border-radius: 10px; font-size: 13px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 18px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));">${icons[entry.type] || '🐾'}</span>
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-weight: 900; color: var(--text-color);">${labels[entry.type] || 'Aktywność'}</span>
                            <span style="font-size: 10px; color: var(--text-muted); font-weight: 700;">Przez: <span style="color: var(--primary);">${entry.doneByUserName}</span></span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 900; color: var(--text-color); font-size: 12px;">${timeString}</span>
                        <span style="color: #2ed573; font-size: 14px;">✅</span>
                    </div>
                </div>`;
            }).join('');
        });
    });
}

// Odpalamy naszą funkcję chwilę po załadowaniu okna aplikacji
window.addEventListener('load', () => {
    setTimeout(initJournalListener, 500);
});
// ============================================================================
// 🔥 WAGGLE FAMILY: PEŁNA HISTORIA (GRUPOWANIE PO DACIE)
// ============================================================================

window.openJournalHistory = async () => {
    const modal = document.getElementById('journal-history-modal');
    const content = document.getElementById('journal-history-content');
    
    // Pokaż okienko i loader
    modal.style.display = 'flex';
    content.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 12px; font-weight: 700; margin-top: 20px;">Ładowanie historii...</p>';

    // Sprawdzamy najpierw czy mamy współdzielonego psa, jak nie to bierzemy własnego
    const currentUid = localStorage.getItem('activeDogId') || localStorage.getItem('uid') || (firebase.auth().currentUser ? firebase.auth().currentUser.uid : null);    if (!currentUid) return;

    // Pobierz z bazy
    const entries = await getJournalHistory(currentUid);
    
    if (entries.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-weight: 700; margin-top: 20px;">Brak wpisów w historii.</p>';
        return;
    }

    const icons = { feed: '🍖', walk: '🚶', med: '💊', water: '💧', vet: '🏥' };
    const labels = { feed: 'Karmienie', walk: 'Spacer', med: 'Lek', water: 'Woda', vet: 'Weterynarz' };

    // Logika grupowania dat
    const grouped = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    entries.forEach(entry => {
        let dateGroup = "Starsze wpisy";
        let timeStr = "--:--";

        if (entry.timestamp && typeof entry.timestamp.toDate === 'function') {
            const d = entry.timestamp.toDate();
            timeStr = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            if (d.toDateString() === today.toDateString()) {
                dateGroup = "Dzisiaj";
            } else if (d.toDateString() === yesterday.toDateString()) {
                dateGroup = "Wczoraj";
            } else {
                dateGroup = d.toLocaleDateString(); // Np. 15.08.2025
            }
        }

        if (!grouped[dateGroup]) grouped[dateGroup] = [];
        grouped[dateGroup].push({ ...entry, timeStr });
    });

    // Renderowanie wygenerowanej listy
    let html = '';
    for (const [dateTitle, items] of Object.entries(grouped)) {
        // Nagłówek grupy (np. "DZISIAJ")
        html += `<h5 style="margin: 20px 0 10px 0; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid var(--border-color); padding-bottom: 5px;">${dateTitle}</h5>`;

        // Wpisy dla danej grupy
        items.forEach(item => {
            html += `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px; background: white; border: 1px solid var(--border-color); border-radius: 14px; margin-bottom: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <span style="font-size: 22px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));">${icons[item.type] || '🐾'}</span>
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span style="font-weight: 900; color: var(--text-color); font-size: 14px;">${labels[item.type] || 'Aktywność'}</span>
                        <span style="font-size: 11px; color: var(--text-muted); font-weight: 700;">Przez: <span style="color: var(--primary);">${item.doneByUserName}</span></span>
                    </div>
                </div>
                <div style="font-weight: 900; color: var(--text-color); font-size: 13px; background: var(--bg-color); padding: 6px 12px; border-radius: 8px;">
                    ${item.timeStr}
                </div>
            </div>`;
        });
    }

    content.innerHTML = html;
};
// ============================================================================
// 🔥 WAGGLE FAMILY: GENERATOR ZAPROSZEŃ
// ============================================================================

window.openInviteModal = () => {
    const currentUid = localStorage.getItem('uid') || (firebase.auth().currentUser ? firebase.auth().currentUser.uid : 'demo-id');
    
    // Zmiana formatu na bezpieczny parametr ?invite=
    const inviteLink = `https://joinwaggle.com/?invite=${currentUid}`;
    
    document.getElementById('invite-link-display').innerText = inviteLink;
    document.getElementById('invite-qr-code').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(inviteLink)}`;
    
    document.getElementById('invite-caretaker-modal').style.display = 'flex';
};

window.copyInviteLink = () => {
    const currentUid = localStorage.getItem('uid') || (firebase.auth().currentUser ? firebase.auth().currentUser.uid : 'demo-id');
    const inviteLink = `https://joinwaggle.com/?invite=${currentUid}`;
    
    navigator.clipboard.writeText(inviteLink).then(() => {
        if (window.Waggle && window.Waggle.showToast) {
            window.Waggle.showToast("🔗 Link skopiowany do schowka!");
        }
        document.getElementById('invite-caretaker-modal').style.display = 'none';
    }).catch(err => console.error('Błąd kopiowania:', err));
};
// ============================================================================
// 🔥 WAGGLE FAMILY: ODBIERANIE ZAPROSZEŃ (DOŁĄCZANIE DO STADA)
// ============================================================================

function checkInvitesOnLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteUid = urlParams.get('invite');
    
    if (inviteUid) {
        // Mamy zaproszenie w linku! Sprawdzamy czy użytkownik jest zalogowany
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                // Nie pozwalamy zaprosić samego siebie
                if (user.uid === inviteUid) {
                    window.history.replaceState({}, document.title, "/");
                    return;
                }

                const userName = localStorage.getItem('userName') || (user.email ? user.email.split('@')[0] : "Domownik");
                
                // Pokazujemy okienko z pytaniem (korzystamy z Twojego pięknego designu)
                document.getElementById('custom-confirm-msg').innerText = "Zostałeś zaproszony do współdzielenia profilu i opieki nad psem! Chcesz dołączyć?";
                document.getElementById('custom-confirm-modal').style.display = 'flex';
                
                // Jeśli kliknie TAK
                document.getElementById('custom-confirm-ok').onclick = async () => {
                    try {
                        // 1. Zapisujemy w Firebase, że ten domownik ma uprawnienia (do rekordu właściciela psa)
                        await firebase.firestore().collection('users').doc(inviteUid).set({
                            caretakers: {
                                [user.uid]: { name: userName, role: 'caretaker' }
                            }
                        }, { merge: true });
                        
                        // 2. Trik Waggle Family: Przełączamy aplikację domownika, żeby "patrzyła" na psa zapraszającego!
                        localStorage.setItem('activeDogId', inviteUid);
                        
                        if (window.Waggle && window.Waggle.showToast) window.Waggle.showToast("✅ Dołączyłeś do rodziny!");
                        document.getElementById('custom-confirm-modal').style.display = 'none';
                        
                        // Czyścimy link i resetujemy widok
                        window.history.replaceState({}, document.title, "/");
                        setTimeout(() => window.location.reload(), 1500);
                    } catch(e) {
                        console.error("Błąd dołączania:", e);
                    }
                };
                
                // Jeśli kliknie ANULUJ
                document.getElementById('custom-confirm-cancel').onclick = () => {
                     document.getElementById('custom-confirm-modal').style.display = 'none';
                     window.history.replaceState({}, document.title, "/");
                };
            } else {
                // Jeśli ktoś kliknął link, ale nie ma konta
                if (window.Waggle && window.Waggle.showToast) {
                    window.Waggle.showToast("🐕 Zaloguj się lub załóż konto, aby przyjąć zaproszenie!");
                }
            }
        });
    }
}

// Uruchamiamy sprawdzanie zaproszeń sekundę po starcie apki
window.addEventListener('load', () => {
    setTimeout(checkInvitesOnLoad, 1000);
});
// ============================================================================
// 🔥 WAGGLE FAMILY: USTAWIENIA CELÓW (OPIEKA+)
// ============================================================================
window.addEventListener('load', () => {
    const careSettingsBtn = document.getElementById('openCareSettingsBtn');
    if (careSettingsBtn) {
        careSettingsBtn.addEventListener('click', async () => {
            const currentUid = localStorage.getItem('activeDogId') || (firebase.auth().currentUser ? firebase.auth().currentUser.uid : null);
            if (!currentUid) return;

            // Pobieramy aktualne z bazy żeby wyświetlić w formularzu
            const doc = await firebase.firestore().collection('users').doc(currentUid).get();
            const goals = doc.exists && doc.data().dailyGoals ? doc.data().dailyGoals : { feed: 2, walk: 3, med: 1, water: 3 };

            document.getElementById('goalInputFeed').value = goals.feed;
            document.getElementById('goalInputWalk').value = goals.walk;
            document.getElementById('goalInputMed').value = goals.med;
            document.getElementById('goalInputWater').value = goals.water;

            document.getElementById('care-settings-modal').style.display = 'flex';
        });
    }

    const saveGoalsBtn = document.getElementById('saveCareGoalsBtn');
    if (saveGoalsBtn) {
        saveGoalsBtn.addEventListener('click', async () => {
            const currentUid = localStorage.getItem('activeDogId') || (firebase.auth().currentUser ? firebase.auth().currentUser.uid : null);
            if (!currentUid) return;

            // Zbieramy wpisane liczby
            const newGoals = {
                feed: parseInt(document.getElementById('goalInputFeed').value) || 0,
                walk: parseInt(document.getElementById('goalInputWalk').value) || 0,
                med: parseInt(document.getElementById('goalInputMed').value) || 0,
                water: parseInt(document.getElementById('goalInputWater').value) || 0
            };

            try {
                saveGoalsBtn.innerText = "ZAPISYWANIE...";
                await firebase.firestore().collection('users').doc(currentUid).set({ dailyGoals: newGoals }, { merge: true });
                document.getElementById('care-settings-modal').style.display = 'none';
                saveGoalsBtn.innerText = "ZAPISZ CELE 🎯";
                
                if (window.Waggle && window.Waggle.showToast) window.Waggle.showToast("✅ Cele zaktualizowane!");
                
                // PŁYNNA ZMIANA (Bez przeładowania strony!)
                // Zmuszamy nasłuchiwacz, by odpalił się jeszcze raz i sam przeliczył paski
                if (typeof initJournalListener === 'function') {
                    initJournalListener();
                }
            } catch(e) {
                console.error(e);
                alert("Błąd zapisu celów.");
                saveGoalsBtn.innerText = "ZAPISZ CELE 🎯";
            }
        });
    }
});
