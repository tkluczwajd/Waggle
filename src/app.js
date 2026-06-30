// src/app.js - Nowy, minimalistyczny punkt wejścia ekosystemu Waggle 🐾

// Standardowe importy systemowe
import { bootstrapApp } from './core/appBootstrap.js';
import { addJournalEntry, subscribeToJournal, getJournalHistory } from './services/journalService.js';
import { initChatEngine } from './modules/chat/chatEngine.js'; 
import { initCalendarEngine } from './modules/calendar.js';
import { initPlacesEngine } from './modules/places.js';
import { initBoardEngine } from './modules/board.js';
import { initWikiEngine } from './modules/wiki.js';
import { db } from './core/firebase.js'; 
import { NotificationEngine } from './services/notificationEngine.js';
import { UserRepository } from './data/userRepository.js';
import { WalkRepository } from './data/walkRepository.js';

// Uruchomienie głównych systemów
bootstrapApp();
initChatEngine();
initCalendarEngine();
initPlacesEngine();
initBoardEngine();
// ... poprzednie init
initWikiEngine();
// Dodaj to:
window.Waggle.notify = NotificationEngine.notify;

// ============================================================================
// 🔥 MANAGER HISTORII PWA (Naprawa przycisku "Wstecz" na Androidzie)
// ============================================================================
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
    return anyModalClosed;
};

function initPwaHistoryManager() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'style') {
                const target = mutation.target;
                const displayStyle = window.getComputedStyle(target).display;
                
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
        if(modal) observer.observe(modal, { attributes: true });
    });

    window.addEventListener('popstate', (e) => {
        window.Waggle.closeAllModals();
    });
}
document.addEventListener('DOMContentLoaded', initPwaHistoryManager);

// ============================================================================
// 🔥 WAGGLE: WERSJONOWANIE I AKTUALIZACJE PWA
// ============================================================================
export const APP_VERSION = "1.0.1";

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(reg => {
            reg.onupdatefound = () => {
                const installingWorker = reg.installing;
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        if (window.Waggle && window.Waggle.showToast) {
                            window.Waggle.showToast("🐾 Dostępna nowa wersja Waggle! Odświeżam...");
                        }
                        setTimeout(() => window.location.reload(true), 2000);
                    }
                };
            };
        }).catch(err => console.error('[SW] Błąd rejestracji:', err));
    });
}

// ROZWIĄZANIE 5: Funkcja dla przycisku "Wymuś aktualizację"
window.Waggle.forceAppUpdate = async () => {
    if (window.Waggle && window.Waggle.showToast) {
        window.Waggle.showToast("🔄 Czyścimy stary cache...");
    }
    
    // 1. Usuwamy wszystkie cache
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    
    // 2. Unregister SW
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (let reg of registrations) {
        await reg.unregister();
    }
    
    // 3. Przeładowanie z pominięciem cache
    window.location.reload(true);
};

// ============================================================================
// 🔥 WAGGLE TRACKING: MECHANIZM RATUNKOWY (Checkpointing)
// ============================================================================
window.Waggle.saveCheckpoint = async (coords) => {
    // 1. Zapis lokalny - błyskawiczny (Storage)
    localStorage.setItem('waggle_last_checkpoint', JSON.stringify({
        lat: coords.latitude,
        lng: coords.longitude,
        timestamp: Date.now()
    }));
    
    // 2. Pobranie ID psa
    const currentUid = localStorage.getItem('activeDogId');
    if (!currentUid) return;
    
    // 3. Zapis w chmurze przez Repozytorium (Zero bezpośredniego Firebase'a w widoku!)
    try {
        await WalkRepository.saveCheckpoint(currentUid, coords.latitude, coords.longitude);
    } catch(e) {
        console.error("Nie udało się wysłać checkpointu do chmury:", e);
    }
};

window.Waggle.checkPendingWalks = () => {
    // 🔥 ZABEZPIECZENIE: Sprawdź czy już pokazywaliśmy ten komunikat w tej sesji
    if (sessionStorage.getItem('pending_walk_alert_shown')) return;

    const lastCheckpointStr = localStorage.getItem('waggle_last_checkpoint');
    if (!lastCheckpointStr) return;

    try {
        const lastCheckpoint = JSON.parse(lastCheckpointStr);
        const now = Date.now();
        const twoHours = 2 * 60 * 60 * 1000;

        if (now - lastCheckpoint.timestamp > twoHours) {
            // Zapisujemy, że już wyświetliliśmy ten alert
            sessionStorage.setItem('pending_walk_alert_shown', 'true');
            
            const confirmModal = document.getElementById('custom-confirm-modal');
            const confirmMsg = document.getElementById('custom-confirm-msg');
            
            if (confirmModal && confirmMsg) {
                confirmMsg.innerText = "Wykryto niedokończony spacer (ponad 2 godziny temu). Czy chcesz go teraz zakończyć i zapisać?";
                confirmModal.style.display = 'flex';
                
                document.getElementById('custom-confirm-ok').onclick = () => {
                    confirmModal.style.display = 'none';
                    if (window.Waggle.finalizeWalk) window.Waggle.finalizeWalk(); 
                };
                
                document.getElementById('custom-confirm-cancel').onclick = () => {
                    confirmModal.style.display = 'none';
                    localStorage.removeItem('waggle_last_checkpoint');
                };
            }
        }
    } catch (e) {
        localStorage.removeItem('waggle_last_checkpoint');
    }
};

window.Waggle.finalizeWalk = async () => {
    // 🔥 Na razie robimy awaryjne zamknięcie: czyścimy pamięć, żeby odblokować apkę.
    // Docelowo podepniemy tu WalkRepository do zapisu pełnej historii.
    localStorage.removeItem('waggle_last_checkpoint');
    window.Waggle.showToast("Spacer został awaryjnie zamknięty.");
};
// ============================================================================
// 🔥 WAGGLE FAMILY: LOGIKA DZIENNIKA PSA
// ============================================================================
window.logDogActivity = async (type) => {
    const currentUid = localStorage.getItem('activeDogId') || localStorage.getItem('uid') || (firebase.auth().currentUser ? firebase.auth().currentUser.uid : null);
    const userName = localStorage.getItem('userName') || "Opiekun";

    if (!currentUid) return;

    try {
        await addJournalEntry(currentUid, type, userName);
        if (window.Waggle && window.Waggle.showToast) {
            window.Waggle.showToast("✅ Zapisano w dzienniku!");
        }
    } catch (error) {
        console.error("Błąd zapisu aktywności:", error);
    }
};

const WIEDZA_DNIA_BAZA = [
    "🐕 Czy wiesz, że nos psa ma aż 300 milionów receptorów węchowych? Twój ma tylko 6 milionów!",
    "🥵 Pies może dostać udaru cieplnego już przy 24°C, jeśli biega na pełnym słońcu. Zawsze miej przy sobie wodę!",
    "🍫 Złota zasada 2 godzin: Jeśli pies zjadł czekoladę, masz 2 godziny na wywołanie wymiotów u weta.",
    "🐾 Reguła 5 sekund: Jeśli nie możesz utrzymać dłoni na asfalcie przez 5 sekund, łapy psa ulegną poparzeniu.",
    "🦷 Sucha karma NIE czyści psich zębów! To tak, jakbyś mył zęby jedząc krakersy. Używaj gryzaków."
];

function renderWiedzaDnia() {
    const dzisiaj = new Date().getDate();
    const ciekawostka = WIEDZA_DNIA_BAZA[dzisiaj % WIEDZA_DNIA_BAZA.length];
    const targetDiv = document.getElementById('wiedza-dnia-target');
    let wiedzaContainer = document.getElementById('wiedza-dnia-container');
    
    if (!wiedzaContainer && targetDiv) {
        wiedzaContainer = document.createElement('div');
        wiedzaContainer.id = 'wiedza-dnia-container';
        targetDiv.appendChild(wiedzaContainer);
    }

    if (wiedzaContainer) {
        wiedzaContainer.innerHTML = `
            <div onclick="const tab = document.querySelector('[data-view=\\'wiki\\']'); if(tab) tab.click();" style="display: flex; gap: 10px; align-items: center; cursor: pointer; padding: 10px 15px; background: transparent; border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 20px; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-color)'" onmouseout="this.style.background='transparent'">
                <div style="font-size: 16px; opacity: 0.6;">💡</div>
                <div style="font-size: 11px; color: var(--text-muted); font-weight: 600; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    <b style="color: var(--text-color);">Psia wiedza:</b> ${ciekawostka}
                </div>
            </div>
        `;
    }
}

function calculateStreak(entries, type) {
    if (!entries || entries.length === 0) return 0;
    let daysWithActivity = new Set();
    entries.forEach(e => {
        if (e.type === type && e.timestamp && typeof e.timestamp.toDate === 'function') {
            daysWithActivity.add(e.timestamp.toDate().toDateString());
        }
    });

    let streak = 0;
    let checkDate = new Date();
    
    if (daysWithActivity.has(checkDate.toDateString())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
    } else {
        checkDate.setDate(checkDate.getDate() - 1);
        if (!daysWithActivity.has(checkDate.toDateString())) return 0; 
    }

    while (daysWithActivity.has(checkDate.toDateString())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
}

function initJournalListener() {
    const currentUid = localStorage.getItem('activeDogId') || localStorage.getItem('uid') || (firebase.auth().currentUser ? firebase.auth().currentUser.uid : null);
    if (!currentUid) {
        setTimeout(initJournalListener, 1000);
        return;
    }

    firebase.firestore().collection('users').doc(currentUid).get().then(doc => {
        const dailyGoals = doc.exists && doc.data().dailyGoals ? doc.data().dailyGoals : { feed: 2, walk: 3, med: 1, water: 3 };

        subscribeToJournal(currentUid, (entries) => {
            const listElement = document.getElementById('journal-live-list');
            const alertsContainer = document.getElementById('smart-care-alerts'); 
            
            if (!listElement) return;

            renderWiedzaDnia();

            const todayStr = new Date().toDateString();
            const dailyCounts = { feed: 0, walk: 0, med: 0, water: 0 };
            let lastWalkTime = null;

            if (entries && entries.length > 0) {
                const sortedEntries = [...entries].sort((a, b) => {
                    const timeA = a.timestamp ? a.timestamp.toMillis() : 0;
                    const timeB = b.timestamp ? b.timestamp.toMillis() : 0;
                    return timeB - timeA;
                });

                const lastWalk = sortedEntries.find(e => e.type === 'walk');
                if (lastWalk && lastWalk.timestamp) lastWalkTime = lastWalk.timestamp.toDate();

                entries.forEach(entry => {
                    if (entry.timestamp && typeof entry.timestamp.toDate === 'function') {
                        if (entry.timestamp.toDate().toDateString() === todayStr) {
                            if (dailyCounts[entry.type] !== undefined) dailyCounts[entry.type]++;
                        }
                    }
                });
            }

            ['feed', 'walk', 'med', 'water'].forEach(type => {
                const countEl = document.getElementById(`count-${type}`);
                const goalEl = document.getElementById(`goal-${type}`);
                const bgEl = document.getElementById(`progress-bg-${type}`);
                
                if (countEl && bgEl && goalEl) {
                    countEl.innerText = dailyCounts[type];
                    goalEl.innerText = dailyGoals[type];
                    let percentage = dailyGoals[type] > 0 ? Math.min((dailyCounts[type] / dailyGoals[type]) * 100, 100) : 100;
                    bgEl.style.width = `${percentage}%`;

                    if (dailyGoals[type] > 0 && dailyCounts[type] >= dailyGoals[type]) {
                        bgEl.style.background = 'rgba(46, 213, 115, 0.15)'; 
                        countEl.style.color = '#2ed573';
                    } else {
                        bgEl.style.background = 'rgba(52, 172, 224, 0.08)'; 
                        countEl.style.color = 'var(--text-color)';
                    }
                }
            });

            let alertsHtml = '';
            const now = new Date();
            const currentHour = now.getHours();

            const walkStreak = calculateStreak(entries, 'walk');
            const medStreak = calculateStreak(entries, 'med');

            if (walkStreak >= 3) {
                alertsHtml += `
                <div class="waggle-card" style="padding: 12px 15px; border-left: 4px solid var(--danger); display: flex; align-items: center; gap: 12px; margin-bottom: 0;">
                    <div style="font-size: 20px;">🔥</div>
                    <div>
                        <div style="font-size: var(--font-md); font-weight: 900; color: var(--danger);">Imponująca Seria!</div>
                        <div style="font-size: var(--font-sm); color: var(--text-muted); font-weight: 600;">Spacery zaliczone <b>${walkStreak} dni</b> z rzędu.</div>
                    </div>
                </div>`;
            }

            if (medStreak >= 5) {
                alertsHtml += `
                <div class="waggle-card" style="padding: 12px 15px; border-left: 4px solid #2ed573; display: flex; align-items: center; gap: 12px; margin-bottom: 0;">
                    <div style="font-size: 20px;">💊</div>
                    <div>
                        <div style="font-size: var(--font-md); font-weight: 900; color: #2ed573;">Zdrowie pod kontrolą!</div>
                        <div style="font-size: var(--font-sm); color: var(--text-muted); font-weight: 600;">Leki na czas przez <b>${medStreak} dni</b> z rzędu.</div>
                    </div>
                </div>`;
            }

            if (dailyCounts.feed === 0 && currentHour >= 9) {
                alertsHtml += `
                    <div class="waggle-card" style="padding: 12px 15px; border-left: 4px solid var(--danger); display: flex; align-items: center; gap: 12px; margin-bottom: 0;">
                        <div style="font-size: 20px;">🍖</div>
                        <div>
                            <div style="font-size: var(--font-md); font-weight: 900; color: var(--danger);">Głodny Pies!</div>
                            <div style="font-size: var(--font-sm); color: var(--text-muted); font-weight: 600;">Pies nie dostał dzisiaj jeszcze śniadania.</div>
                        </div>
                    </div>`;
            }
            
            if (dailyCounts.walk === 0 && currentHour >= 8 && currentHour < 12) {
                alertsHtml += `
                    <div class="waggle-card" style="padding: 12px 15px; border-left: 4px solid #e1b12c; display: flex; align-items: center; gap: 12px; margin-bottom: 0;">
                        <div style="font-size: 20px;">🦮</div>
                        <div>
                            <div style="font-size: var(--font-md); font-weight: 900; color: #e1b12c;">Poranny Spacer</div>
                            <div style="font-size: var(--font-sm); color: var(--text-muted); font-weight: 600;">Pies rano nie był jeszcze na dworze.</div>
                        </div>
                    </div>`;
            } else if (lastWalkTime && (now - lastWalkTime) / (1000 * 60 * 60) >= 8 && currentHour >= 8 && currentHour <= 22) {
                alertsHtml += `
                    <div class="waggle-card" style="padding: 12px 15px; border-left: 4px solid var(--danger); display: flex; align-items: center; gap: 12px; margin-bottom: 0;">
                        <div style="font-size: 20px;">⚠️</div>
                        <div>
                            <div style="font-size: var(--font-md); font-weight: 900; color: var(--danger);">Wymagany Spacer!</div>
                            <div style="font-size: var(--font-sm); color: var(--text-muted); font-weight: 600;">Minęło ponad 8 godzin od ostatniego wyjścia.</div>
                        </div>
                    </div>`;
            }

            if (alertsContainer) alertsContainer.innerHTML = alertsHtml;

            let totalGoals = (dailyGoals.feed || 0) + (dailyGoals.walk || 0) + (dailyGoals.med || 0) + (dailyGoals.water || 0);
            let totalDone = Math.min(dailyCounts.feed, dailyGoals.feed || 0) 
                          + Math.min(dailyCounts.walk, dailyGoals.walk || 0) 
                          + Math.min(dailyCounts.med, dailyGoals.med || 0) 
                          + Math.min(dailyCounts.water, dailyGoals.water || 0);
            
            let percent = totalGoals > 0 ? Math.round((totalDone / totalGoals) * 100) : 0;
            let wowText = "Czas zacząć dzień! 🌅";
            if (percent > 0 && percent < 50) wowText = "Dobry początek! 🐾";
            else if (percent >= 50 && percent < 100) wowText = "Świetnie Ci idzie! 🔥";
            else if (percent === 100 && totalGoals > 0) wowText = "Plan wykonany w 100%! 🏆";

            let wowBadge = document.getElementById('daily-wow-badge');
            if (!wowBadge) {
                const nameEl = document.getElementById('profileNameDisplay');
                if (nameEl && nameEl.parentNode) {
                    wowBadge = document.createElement('div');
                    wowBadge.id = 'daily-wow-badge';
                    wowBadge.style.cssText = "display: inline-block; font-size: 11px; font-weight: 900; padding: 4px 10px; border-radius: 12px; margin-top: 5px; transition: all 0.3s;";
                    nameEl.parentNode.insertBefore(wowBadge, nameEl.nextSibling);
                }
            }
            if (wowBadge) {
                wowBadge.innerHTML = `Dzisiaj: <b>${percent}%</b> planu • ${wowText}`;
                if (percent === 100) {
                    wowBadge.style.background = 'rgba(46, 213, 115, 0.15)';
                    wowBadge.style.color = '#2ed573';
                } else {
                    wowBadge.style.background = 'rgba(52, 172, 224, 0.1)';
                    wowBadge.style.color = 'var(--secondary)';
                }
            }

            const emptyStateHtml = `
                <div style="text-align: center; padding: 15px; background: rgba(52, 172, 224, 0.05); border: 1px dashed var(--secondary); border-radius: 14px; margin-top: 5px;">
                    <div style="font-size: 24px; margin-bottom: 5px;">🌱</div>
                    <div style="font-size: 13px; font-weight: 800; color: var(--text-color);">Dzień dopiero się zaczyna!</div>
                    <div style="font-size: 11px; color: var(--text-muted); font-weight: 700; margin-top: 2px;">Dodaj pierwszą aktywność, aby napełnić paski.</div>
                </div>
            `;

            if (!entries || entries.length === 0) {
                listElement.innerHTML = emptyStateHtml;
                return;
            }

            const icons = { feed: '🍖', walk: '🚶', med: '💊', water: '💧', vet: '🏥' };
            const labels = { feed: 'Nakarmiony', walk: 'Spacer', med: 'Lek', water: 'Woda', vet: 'Weterynarz' };
            
            const todaysEntries = entries.filter(e => e.timestamp && e.timestamp.toDate().toDateString() === todayStr);
            const recentEntries = todaysEntries.slice(0, 3);
            
            if (recentEntries.length === 0) {
                 listElement.innerHTML = emptyStateHtml;
                 return;
            }

            listElement.innerHTML = recentEntries.map((entry, index) => {
                let timeString = "Teraz";
                if (entry.timestamp && typeof entry.timestamp.toDate === 'function') {
                    timeString = entry.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                }
                return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: ${index === 0 ? 'rgba(46, 213, 115, 0.05)' : 'var(--bg-color)'}; border-radius: 10px; font-size: 12px; border-left: 2px solid ${index === 0 ? '#2ed573' : 'transparent'}; margin-bottom: 5px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 16px;">${icons[entry.type] || '🐾'}</span>
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-weight: 800; color: var(--text-color);">${labels[entry.type] || 'Aktywność'}</span>
                            <span style="font-size: 9px; color: var(--text-muted); font-weight: 700;">${entry.doneByUserName}</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <span style="font-weight: 800; color: var(--text-muted); font-size: 11px;">${timeString}</span>
                    </div>
                </div>`;
            }).join('');
        });
    });
}
window.addEventListener('load', () => { 
    setTimeout(initJournalListener, 500); 
    
    // 🔥 MECHANIZM RATUNKOWY: Sprawdź przy starcie czy nie ma zawieszonego spaceru
    setTimeout(() => {
        if (window.Waggle && window.Waggle.checkPendingWalks) {
            window.Waggle.checkPendingWalks();
        }
    }, 2000); // Czekamy 2s, aż Firebase się zainicjuje
});
    

// ============================================================================
// 🔥 WAGGLE FAMILY: PEŁNA HISTORIA (GRUPOWANIE PO DACIE)
// ============================================================================
window.openJournalHistory = async () => {
    const modal = document.getElementById('journal-history-modal');
    const content = document.getElementById('journal-history-content');
    modal.style.display = 'flex';
    content.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 12px; font-weight: 700; margin-top: 20px;">Ładowanie historii...</p>';

    const currentUid = localStorage.getItem('activeDogId') || localStorage.getItem('uid') || (firebase.auth().currentUser ? firebase.auth().currentUser.uid : null);
    if (!currentUid) return;

    const entries = await getJournalHistory(currentUid);
    if (entries.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-weight: 700; margin-top: 20px;">Brak wpisów w historii.</p>';
        return;
    }

    const icons = { feed: '🍖', walk: '🚶', med: '💊', water: '💧', vet: '🏥' };
    const labels = { feed: 'Karmienie', walk: 'Spacer', med: 'Lek', water: 'Woda', vet: 'Weterynarz' };
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
            if (d.toDateString() === today.toDateString()) dateGroup = "Dzisiaj";
            else if (d.toDateString() === yesterday.toDateString()) dateGroup = "Wczoraj";
            else dateGroup = d.toLocaleDateString();
        }
        if (!grouped[dateGroup]) grouped[dateGroup] = [];
        grouped[dateGroup].push({ ...entry, timeStr });
    });

    let html = '';
    for (const [dateTitle, items] of Object.entries(grouped)) {
        html += `<h5 style="margin: 20px 0 10px 0; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid var(--border-color); padding-bottom: 5px;">${dateTitle}</h5>`;
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
                <div style="font-weight: 900; color: var(--text-color); font-size: 13px; background: var(--bg-color); padding: 6px 12px; border-radius: 8px;">${item.timeStr}</div>
            </div>`;
        });
    }
    content.innerHTML = html;
};

// ============================================================================
// 🔥 WAGGLE FAMILY: GENERATOR I ODBIERANIE ZAPROSZEŃ
// ============================================================================
window.openInviteModal = () => {
    const currentUid = localStorage.getItem('uid') || (firebase.auth().currentUser ? firebase.auth().currentUser.uid : 'demo-id');
    const inviteLink = `https://joinwaggle.com/?invite=${currentUid}`;
    document.getElementById('invite-link-display').innerText = inviteLink;
    document.getElementById('invite-qr-code').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(inviteLink)}`;
    document.getElementById('invite-caretaker-modal').style.display = 'flex';
};

window.copyInviteLink = () => {
    const currentUid = localStorage.getItem('uid') || (firebase.auth().currentUser ? firebase.auth().currentUser.uid : 'demo-id');
    const inviteLink = `https://joinwaggle.com/?invite=${currentUid}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
        if (window.Waggle && window.Waggle.showToast) window.Waggle.showToast("🔗 Link skopiowany do schowka!");
        document.getElementById('invite-caretaker-modal').style.display = 'none';
    }).catch(err => console.error('Błąd kopiowania:', err));
};

function checkInvitesOnLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteUid = urlParams.get('invite');
    if (inviteUid) {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                if (user.uid === inviteUid) {
                    window.history.replaceState({}, document.title, "/");
                    return;
                }
                const userName = localStorage.getItem('userName') || (user.email ? user.email.split('@')[0] : "Domownik");
                document.getElementById('custom-confirm-msg').innerText = "Zostałeś zaproszony do współdzielenia profilu i opieki nad psem! Chcesz dołączyć?";
                document.getElementById('custom-confirm-modal').style.display = 'flex';
                
                document.getElementById('custom-confirm-ok').onclick = async () => {
                    try {
                        await firebase.firestore().collection('users').doc(inviteUid).set({
                            caretakers: { [user.uid]: { name: userName, role: 'caretaker' } }
                        }, { merge: true });
                        localStorage.setItem('activeDogId', inviteUid);
                        if (window.Waggle && window.Waggle.showToast) window.Waggle.showToast("✅ Dołączyłeś do rodziny!");
                        document.getElementById('custom-confirm-modal').style.display = 'none';
                        window.history.replaceState({}, document.title, "/");
                        setTimeout(() => window.location.reload(), 1500);
                    } catch(e) { console.error(e); }
                };
                document.getElementById('custom-confirm-cancel').onclick = () => {
                     document.getElementById('custom-confirm-modal').style.display = 'none';
                     window.history.replaceState({}, document.title, "/");
                };
            } else {
                if (window.Waggle && window.Waggle.showToast) window.Waggle.showToast("🐕 Zaloguj się lub załóż konto, aby przyjąć zaproszenie!");
            }
        });
    }
}
window.addEventListener('load', () => {
    setTimeout(checkInvitesOnLoad, 1000);
    
    // Zmiana ekranu logowania dla zaproszonych
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('invite')) {
        const authTitleDesc = document.querySelector('#auth-screen p');
        if (authTitleDesc) authTitleDesc.innerHTML = "🐕 <b style='color: var(--primary);'>Zostałeś zaproszony do Stada!</b><br>Zaloguj się lub załóż konto, aby dołączyć do opieki nad psem.";
    }
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
                if (typeof initJournalListener === 'function') initJournalListener();
            } catch(e) {
                console.error(e);
                alert("Błąd zapisu celów.");
                saveGoalsBtn.innerText = "ZAPISZ CELE 🎯";
            }
        });
    }
});

// 🔥 ZOPTYMALIZOWANA FUNKCJA TOGGLE (Optimistic UI)
window.Waggle.toggleNotifications = async () => {
    const btn = document.getElementById('togglePushBtn');
    if (!btn) return;

    // 1. Zidentyfikuj aktualny stan (zakładamy, że tekst przycisku jest "WŁĄCZ" lub "WYŁĄCZ")
    const isCurrentlyOn = btn.innerText.includes("WYŁĄCZ");
    const newState = !isCurrentlyOn;

    // 2. OPTIMISTIC UI: Zmień wygląd przycisku NATYCHMIAST (0ms czekania)
    const originalText = btn.innerText;
    btn.innerText = newState ? "🔔 WYŁĄCZ POWIADOMIENIA" : "🔔 WŁĄCZ POWIADOMIENIA";
    btn.style.opacity = "0.6"; // Lekkie przygaszenie informujące o pracy w tle
    btn.disabled = true;

    try {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error("Nie jesteś zalogowany");

        // 3. Wykonaj zapis w tle za pomocą Repozytorium
        await UserRepository.updatePushSettings(user.uid, newState);
        
        localStorage.setItem('pushEnabled', newState.toString());
        window.Waggle.showToast(newState ? "✅ Powiadomienia włączone!" : "✅ Powiadomienia wyłączone!");
        
    } catch (err) {
        // 4. ROLLBACK: Jeśli coś pójdzie nie tak, cofnij zmiany wizualne
        console.error("Błąd przy zmianie powiadomień:", err);
        btn.innerText = originalText;
        window.Waggle.showToast("❌ Błąd! Sprawdź połączenie.");
    } finally {
        // 5. Przywróć przycisk do stanu klikalnego
        btn.style.opacity = "1";
        btn.disabled = false;
    }

    // ============================================================================
// 🔥 PANCERNY SYSTEM S.A.F.E. (Niezależny od błędów Androida)
// ============================================================================
async function checkRecentSafeReports() {
    const currentUid = localStorage.getItem('activeDogId') || localStorage.getItem('uid');
    if (!currentUid) return;

    try {
        // Pytamy bazę o NAJŚWIEŻSZY raport ratunkowy
        const snap = await db.collection('safe_reports')
            .where('ownerUid', '==', currentUid)
            .orderBy('timestamp', 'desc')
            .limit(1)
            .get();

        if (!snap.empty) {
            const report = snap.docs[0].data();
            const reportTime = report.timestamp ? report.timestamp.toMillis() : 0;
            const ageMins = (Date.now() - reportTime) / 60000;

            // Reagujemy TYLKO, jeśli raport jest z ostatnich 15 minut
            if (ageMins < 15 && report.lat && report.lng) {
                console.log("🚨 PANCERNY SKAN: Znaleziono świeży alarm z S.A.F.E!");
                if (window.Waggle && window.Waggle.centerOnTarget) {
                    window.Waggle.showToast("🚨 Namierzono psa! Pobieram lokalizację...", 6000);
                    // Odbijamy na mapę i centrujemy
                    const tab = document.querySelector('[data-view="local"]');
                    if(tab) tab.click();
                    
                    setTimeout(() => {
                        window.Waggle.centerOnTarget(parseFloat(report.lat), parseFloat(report.lng));
                    }, 500);
                }
            }
        }
    } catch(e) { console.error("Błąd pancernego skanowania S.A.F.E:", e); }
}

// Sprawdzaj po wejściu do aplikacji (zimny start)...
window.addEventListener('load', () => setTimeout(checkRecentSafeReports, 2000));

// ...oraz za każdym razem, gdy apka budzi się z tła po kliknięciu powiadomienia
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === 'visible') {
        setTimeout(checkRecentSafeReports, 1000);
    }
});
};
