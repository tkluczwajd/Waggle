// src/modules/calendar.js
import { auth, db } from "../core/firebase.js";

export function initCalendarEngine() {
    const openBtn = document.getElementById('openAddCalendarBtn');
    const modal = document.getElementById('calendar-add-modal');
    const saveBtn = document.getElementById('saveCalendarEventBtn');

    if (openBtn && modal) {
        openBtn.onclick = () => {
            // Ustawiamy domyślnie dzisiejszą datę w formularzu
            document.getElementById('calDateInput').value = new Date().toISOString().split('T')[0];
            document.getElementById('calNoteInput').value = '';
            modal.style.display = 'flex';
        };
    }

    if (saveBtn) {
        saveBtn.onclick = async () => {
            const currentUid = localStorage.getItem('activeDogId') || auth.currentUser.uid;
            const type = document.getElementById('calTypeSelect').value;
            const dateStr = document.getElementById('calDateInput').value;
            const note = document.getElementById('calNoteInput').value.trim();

            if (!dateStr) return alert("Wybierz datę!");

            try {
                saveBtn.innerText = "DODAWANIE...";
                // Zapisujemy pod-kolekcję 'calendar' wewnątrz profilu psa
                await db.collection('users').doc(currentUid).collection('calendar').add({
                    type: type,
                    date: dateStr,
                    note: note || "",
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                modal.style.display = 'none';
                saveBtn.innerText = "DODAJ DO TERMINARZA 🗓️";
                if (window.Waggle && window.Waggle.showToast) window.Waggle.showToast("📅 Dodano do terminarza!");
            } catch(e) {
                console.error(e);
                alert("Błąd podczas dodawania przypomnienia.");
                saveBtn.innerText = "DODAJ DO TERMINARZA 🗓️";
            }
        };
    }

    // ODPALAMY NASŁUCHIWANIE TERMINARZA
    listenToCalendarEvents();
}

function listenToCalendarEvents() {
    const currentUid = localStorage.getItem('activeDogId') || (auth.currentUser ? auth.currentUser.uid : null);
    if (!currentUid) {
        setTimeout(listenToCalendarEvents, 1000);
        return;
    }

    const listElement = document.getElementById('calendar-live-list');
    if (!listElement) return;

    // Pobieramy wydarzenia posortowane po dacie
    db.collection('users').doc(currentUid).collection('calendar')
        .orderBy('date', 'asc')
        .onSnapshot(snapshot => {
            listElement.innerHTML = '';

            if (snapshot.empty) {
                listElement.innerHTML = '<div style="text-align: center; font-size: 12px; color: var(--text-muted); font-weight: 700; padding: 10px 0;">Brak nadchodzących wydarzeń...</div>';
                return;
            }

            const icons = { vaccine: '💉', deworm: '💊', vet: '🏥', groomer: '✂️', other: '🗓️' };
            const labels = { vaccine: 'Szczepienie', deworm: 'Odrobaczanie / Kleszcze', vet: 'Weterynarz', groomer: 'Groomer', other: 'Wydarzenie' };

            const todayStr = new Date().toISOString().split('T')[0];

            snapshot.forEach(doc => {
                const event = doc.data();
                const eventId = doc.id;

                // Sprawdzamy czy termin minął (porównanie dat jako tekst RRRR-MM-DD)
                const isOverdue = event.date < todayStr;
                const isToday = event.date === todayStr;

                // Formatowanie ładnej daty (np. 15.06)
                const dateObj = new Date(event.date);
                const formattedDate = dateObj.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });

                // Stylowanie w zależności od pilności
                let badgeBg = 'var(--bg-color)';
                let borderStyle = '1px solid var(--border-color)';
                let statusText = '';

                if (isOverdue) {
                    badgeBg = 'rgba(231, 76, 60, 0.07)';
                    borderStyle = '1px solid rgba(231, 76, 60, 0.3)';
                    statusText = `<span style="color: var(--danger); font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">⚠️ TERMIN MINĄŁ!</span>`;
                } else if (isToday) {
                    badgeBg = 'rgba(46, 213, 115, 0.08)';
                    borderStyle = '1px solid #2ed573';
                    statusText = `<span style="color: #2ed573; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">🌟 DZISIAJ!</span>`;
                }

                listElement.innerHTML += `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: ${badgeBg}; border: ${borderStyle}; border-radius: 14px; font-size: 13px; box-shadow: 0 2px 5px rgba(0,0,0,0.01);">
                        <div style="display: flex; align-items: center; gap: 12px; width: 75%;">
                            <span style="font-size: 20px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.05));">${icons[event.type] || '🗓️'}</span>
                            <div style="display: flex; flex-direction: column; gap: 2px; overflow: hidden;">
                                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                                    <span style="font-weight: 900; color: var(--text-color);">${labels[event.type]}</span>
                                    ${statusText}
                                </div>
                                <span style="font-size: 11px; color: var(--text-muted); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${event.note || 'Brak dodatkowego opisu'}</span>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="font-weight: 900; color: var(--text-color); font-size: 12px; background: white; border: 1px solid var(--border-color); padding: 5px 10px; border-radius: 8px; text-transform: capitalize; box-shadow: 0 2px 4px rgba(0,0,0,0.02); text-align: center; min-width: 45px;">
                                ${formattedDate}
                            </div>
                            <button onclick="window.Waggle.deleteCalendarEvent('${eventId}')" style="background: none; border: none; font-size: 14px; cursor: pointer; padding: 5px;" title="Usuń przypomnienie">✅</button>
                        </div>
                    </div>
                `;
            });
        });
}

// Globalna funkcja usuwania / odhaczania wydarzenia
window.Waggle.deleteCalendarEvent = async (eventId) => {
    const currentUid = localStorage.getItem('activeDogId') || auth.currentUser.uid;
    try {
        await db.collection('users').doc(currentUid).collection('calendar').doc(eventId).delete();
        if (window.Waggle && window.Waggle.showToast) window.Waggle.showToast("✅ Wydarzenie odhaczone!");
    } catch(e) {
        console.error(e);
        alert("Błąd podczas usuwania wydarzenia.");
    }
};
