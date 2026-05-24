// src/services/weatherService.js
// 🔥 NOWOŚĆ: Importujemy stan, by zsynchronizować małą ikonkę na mapie
import { appState as state } from '../core/state.js';

export function getWeatherIcon(code) {
    if (code === 0) return '☀️'; if (code <= 3) return '⛅'; if (code <= 48) return '🌫️';
    if (code <= 55 || (code >= 61 && code <= 65) || (code >= 80 && code <= 82)) return '🌧️';
    if (code <= 77) return '❄️'; if (code >= 95) return '⛈️'; return '🌡️';
}

// Podmień tę funkcję w src/services/weatherService.js

export function fetchWeather(lat, lng) {
    if(!lat || !lng) return;
    
    // 🔥 TUNING PRECYZJI: Dodaliśmy parametr models=best_match
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&models=best_match&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`)
    .then(r=>r.json()).then(d => {
        
        // 🔥 POPRAWKA: Pobieramy kod pogody z TERAZ, a nie z całego dnia!
        const currentIcon = getWeatherIcon(d.current_weather.weathercode);
        const currentTemp = Math.round(d.current_weather.temperature);

        // Zapisujemy świeże, dokładne dane do stanu aplikacji
        state.weather = {
            temp: currentTemp,
            icon: currentIcon
        };

        // Odświeżamy mały widżet na mapie
        if (window.Waggle && typeof window.Waggle.updateStatsUI === 'function') {
            window.Waggle.updateStatsUI();
        }
        
        const contentEl = document.getElementById('weather-forecast-content');
        if(contentEl) {
            let html = `<div style="text-align:center; margin-bottom:15px;"><b style="font-size:20px;">Dziś: ${currentTemp}°C ${currentIcon}</b></div>`;
            html += `<div style="display:flex; justify-content:space-around; border-top:1px solid var(--border-color); padding-top:15px;">`;
            
            // W prognozie 3-dniowej zostawiamy 'daily.weathercode', bo tam faktycznie chcemy widzieć trend na całe dni
            for(let i=0; i<3; i++) {
                const date = new Date(d.daily.time[i]).toLocaleDateString('pl-PL', {weekday: 'short'});
                html += `<div style="text-align:center;"><div style="font-size:11px; font-weight:800; color:var(--text-muted);">${date}</div><div style="font-size:24px;">${getWeatherIcon(d.daily.weathercode[i])}</div><div style="font-weight:900;">${Math.round(d.daily.temperature_2m_max[i])}°</div><div style="font-size:10px; color:var(--text-muted);">${Math.round(d.daily.temperature_2m_min[i])}°</div></div>`;
            }
            html += `</div>`;
            contentEl.innerHTML = html;
        }
    }).catch(e=>console.warn("Błąd pogodowego API:", e));
}
