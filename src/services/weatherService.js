// src/services/weatherService.js
import { getWeatherIcon } from './weather.js'; // Tymczasowo korzystamy z Twoich ikon [cite: 510, 511, 512, 513, 514]

export function fetchWeather(lat, lng) {
    if(lat && lng) { [cite: 101]
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`) [cite: 101]
        .then(r=>r.json()).then(d => { [cite: 101]
            const tempEl = document.getElementById('weather-temp'); [cite: 101]
            if(tempEl) tempEl.innerText = `${Math.round(d.current_weather.temperature)}°C`; [cite: 101]
            const contentEl = document.getElementById('weather-forecast-content'); [cite: 101]
            if(contentEl) { [cite: 101]
                let html = `<div style="text-align:center; margin-bottom:15px;"><b style="font-size:20px;">Dziś: ${Math.round(d.current_weather.temperature)}°C ${getWeatherIcon(d.current_weather.weathercode)}</b></div>`; [cite: 102]
                html += `<div style="display:flex; justify-content:space-around; border-top:1px solid var(--border-color); padding-top:15px;">`; [cite: 102]
                for(let i=0; i<3; i++) { [cite: 102]
                    const date = new Date(d.daily.time[i]).toLocaleDateString('pl-PL', {weekday: 'short'}); [cite: 102]
                    html += `<div style="text-align:center;"><div style="font-size:11px; font-weight:800; color:var(--text-muted);">${date}</div><div style="font-size:24px;">${getWeatherIcon(d.daily.weathercode[i])}</div><div style="font-weight:900;">${Math.round(d.daily.temperature_2m_max[i])}°</div><div style="font-size:10px; color:var(--text-muted);">${Math.round(d.daily.temperature_2m_min[i])}°</div></div>`; [cite: 103]
                } [cite: 104]
                html += `</div>`; [cite: 104]
                contentEl.innerHTML = html; [cite: 105]
            } [cite: 105]
        }).catch(e=>console.warn("Błąd pogody:", e)); [cite: 105]
    } [cite: 106]
}
