import { mapManager } from '../map/mapManager.js';

let alertMarkers = {};
let dismissedAlerts = JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');

export function renderAlerts(alerts) {
    const L = window.L;

    // Rysowanie pinesek na mapie
    alerts.forEach(a => {
        if (!alertMarkers[a.id] && !dismissedAlerts.includes(a.id)) {
            const icon = L.divIcon({
                className: '',
                html: `<div style="background:var(--danger); width:35px; height:35px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; border:3px solid white; font-size:18px; box-shadow:0 0 15px rgba(255,82,82,0.5);">⚠️</div>`,
                iconSize: [35,35]
            });
            const m = L.marker([a.lat, a.lng], { icon }).bindPopup(`<b>ZAGROŻENIE!</b><br>${a.text}`);

            alertMarkers[a.id] = m;
            mapManager.addMarkerToLayer('alerts', m);
   }
    });

    // DODANO: Włączenie/Wyłączenie pigułki alertu nad mapą
    const alertPill = document.getElementById('active-alert-pill');
    if (alertPill) {
        alertPill.style.display = alerts.length > 0 ? 'flex' : 'none';
    }

    // Wypełnianie listy w panelu bocznym/modalu
    const container = document.getElementById('active-alerts-list');
    if (!container) return; // Teraz można bezpiecznie przerwać

    if (alerts.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted);">Brak aktywnych alertów w okolicy. Czysto! 🐾</div>`;
        return;
    }

    let html = "";
    alerts.forEach(a => {
        html += `<div class="post-card" style="margin-bottom:10px; border-left:4px solid var(--danger);">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                        <div style="flex:1;">
                            <b style="color:var(--danger); font-size:12px;">⚠️ ALERT ZAGROŻENIA</b>
                            <p style="margin:5px 0; font-size:14px; font-weight:700;">${a.text}</p>
                            <small style="color:var(--text-muted);">Zgłoszono: ${new Date(a.createdAt).toLocaleTimeString()}</small>
                        </div>
                        <button class="btn-outline" onclick="window.Waggle.centerOnTarget(${a.lat}, ${a.lng})" style="width:auto; padding:8px 12px; font-size:12px;">POKAŻ</button>
                    </div>
                 </div>`;
    });
    container.innerHTML = html;
}
