// src/app.js - Nowy, minimalistyczny punkt wejścia ekosystemu Waggle 🐾
import { bootstrapApp } from './core/appBootstrap.js';
import { addJournalEntry, subscribeToJournal, getJournalHistory } from './services/journalService.js';
import { initChatEngine } from './modules/chat/chatEngine.js'; 
import { initCalendarEngine } from './modules/calendar.js';
import { initPlacesEngine } from './modules/places.js';
import { initBoardEngine } from './modules/board.js'; // 🔥 1. IMPORTUJEMY TABLICĘ
import { initWikiEngine } from './modules/wiki.js';

// Uruchomienie głównych systemów
bootstrapApp();
initChatEngine();
initCalendarEngine();
initPlacesEngine();
initBoardEngine(); // 🔥 2. URUCHAMIAMY TABLICĘ
initWikiEngine();

// ============================================================================
// 🔥 MANAGER HISTORII PWA (Naprawa przycisku "Wstecz" na Androidzie)
// reszta Twojego kodu w app.js pozostaje bez zmian...
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
        observer.observe(modal, { attributes: true });
    });

    window.addEventListener('popstate', (e) => {
        window.Waggle.closeAllModals();
    });
}
document.addEventListener('DOMContentLoaded', initPwaHistoryManager);

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
            const alertsContainer = document.getElementById('smart-care-alerts'); // 🚨 Nasz nowy kontener na alerty
            
            if (!listElement) return;

            const todayStr = new Date().toDateString();
            const dailyCounts = { feed: 0, walk: 0, med: 0, water: 0 };
            
            let lastWalkTime = null;
            let lastFeedTime = null;

            if (entries && entries.length > 0) {
                // Szukamy ostatniego spaceru i karmienia w CAŁEJ historii
                const sortedEntries = [...entries].sort((a, b) => {
                    const timeA = a.timestamp ? a.timestamp.toMillis() : 0;
                    const timeB = b.timestamp ? b.timestamp.toMillis() : 0;
                    return timeB - timeA;
                });

                const lastWalk = sortedEntries.find(e => e.type === 'walk');
                const lastFeed = sortedEntries.find(e => e.type === 'feed');

                if (lastWalk && lastWalk.timestamp) lastWalkTime = lastWalk.timestamp.toDate();
                if (lastFeed && lastFeed.timestamp) lastFeedTime = lastFeed.timestamp.toDate();

                // Liczymy dzisiejsze statystyki
                entries.forEach(entry => {
                    if (entry.timestamp && typeof entry.timestamp.toDate === 'function') {
                        if (entry.timestamp.toDate().toDateString() === todayStr) {
                            if (dailyCounts[entry.type] !== undefined) dailyCounts[entry.type]++;
                        }
                    }
                });
            }

            // 🎯 RYSOWANIE PASKÓW POSTĘPU
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
                        bgEl.style.background = 'rgba(46, 213, 115, 0.2)'; 
                        countEl.style.color = '#2ed573';
                    } else {
                        bgEl.style.background = 'rgba(52, 172, 224, 0.1)'; 
                        countEl.style.color = 'var(--text-color)';
                    }
                }
            });

            // 🚨 INTELIGENTNE ALERTY OPIEKI
            let alertsHtml = '';
            const now = new Date();

            // Reguła 1: Brak śniadania (jeśli jest po 10:00 rano i licznik dzisiejszego jedzenia to 0)
            if (dailyCounts.feed === 0 && now.getHours() >= 10) {
                alertsHtml += `
                    <div style="background: rgba(231, 76, 60, 0.08); border: 1px solid rgba(231, 76, 60, 0.3); border-radius: 16px; padding: 12px 15px; display: flex; align-items: center; gap: 12px;">
                        <div style="font-size: 24px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));">🍖</div>
                        <div>
                            <div style="font-size: 13px; font-weight: 900; color: var(--danger);">Głodny Pies!</div>
                            <div style="font-size: 11px; color: var(--text-color); font-weight: 600;">Pies nie dostał dzisiaj jeszcze żadnego posiłku.</div>
                        </div>
                    </div>`;
            }

            // Reguła 2: Brak spaceru ponad 8 godzin
            if (lastWalkTime) {
                const hoursSinceWalk = (now - lastWalkTime) / (1000 * 60 * 60);
                if (hoursSinceWalk >= 8) {
                    alertsHtml += `
                    <div style="background: rgba(255, 177, 66, 0.08); border: 1px solid rgba(255, 177, 66, 0.3); border-radius: 16px; padding: 12px 15px; display: flex; align-items: center; gap: 12px;">
                        <div style="font-size: 24px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));">🐕</div>
                        <div>
                            <div style="font-size: 13px; font-weight: 900; color: #e1b12c;">Czas na spacer!</div>
                            <div style="font-size: 11px; color: var(--text-color); font-weight: 600;">Minęło ponad ${Math.floor(hoursSinceWalk)} godzin od ostatniego spaceru.</div>
                        </div>
                    </div>`;
                }
            } else if (dailyCounts.walk === 0 && now.getHours() >= 11) {
                // Jeśli w ogóle nie ma historii spacerów, ale jest już późno
                alertsHtml += `
                    <div style="background: rgba(255, 177, 66, 0.08); border: 1px solid rgba(255, 177, 66, 0.3); border-radius: 16px; padding: 12px 15px; display: flex; align-items: center; gap: 12px;">
                        <div style="font-size: 24px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));">🐕</div>
                        <div>
                            <div style="font-size: 13px; font-weight: 900; color: #e1b12c;">Pierwszy spacer?</div>
                            <div style="font-size: 11px; color: var(--text-color); font-weight: 600;">Nikt dzisiaj nie odnotował jeszcze spaceru.</div>
                        </div>
                    </div>`;
            }

            if (alertsContainer) alertsContainer.innerHTML = alertsHtml;

            // 📝 RYSOWANIE OSTATNICH WPISÓW (LIVE FEED)
            if (!entries || entries.length === 0) {
                listElement.innerHTML = '<div style="text-align: center; font-size: 12px; color: var(--text-muted); font-weight: 700; padding: 10px 0;">Brak aktywności z dzisiaj...</div>';
                return;
            }

            const icons = { feed: '🍖', walk: '🚶', med: '💊', water: '💧', vet: '🏥' };
            const labels = { feed: 'Nakarmiony', walk: 'Spacer', med: 'Lek', water: 'Woda', vet: 'Weterynarz' };
            
            // Filtrujemy tylko wpisy z dzisiaj do małego podglądu
            const todaysEntries = entries.filter(e => e.timestamp && e.timestamp.toDate().toDateString() === todayStr);
            const recentEntries = todaysEntries.slice(0, 3);
            
            if (recentEntries.length === 0) {
                 listElement.innerHTML = '<div style="text-align: center; font-size: 12px; color: var(--text-muted); font-weight: 700; padding: 10px 0;">Brak aktywności z dzisiaj...</div>';
                 return;
            }

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
window.addEventListener('load', () => { setTimeout(initJournalListener, 500); });

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
