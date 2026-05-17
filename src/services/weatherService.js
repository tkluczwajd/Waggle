// src/services/weatherService.js

export function getWeatherIcon(code) {
    if (code === 0) return '☀️'; if (code <= 3) return '⛅'; if (code <= 48) return '🌫️';
    if (code <= 55 || (code >= 61 && code <= 65) || (code >= 80 && code <= 82)) return '🌧️';
    if (code <= 77) return '❄️'; if (code >= 95) return '⛈️'; return '🌡️';
}

export function fetchWeather(lat, lng) {
    if(!lat || !lng) return;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`)
    .then(r=>r.json()).then(d => {
        // 🔥 POPRAWKA: Pobieramy kod pogody z dzisiejszego dnia prognozy (indeks 0), który jest dokładniejszy
        const todayWeatherCode = d.daily.weathercode[0];

        const tempEl = document.getElementById('weather-temp');
        if(tempEl) tempEl.innerText = `${Math.round(d.current_weather.temperature)}°C`;
        
        const contentEl = document.getElementById('weather-forecast-content');
        if(contentEl) {
            let html = `<div style="text-align:center; margin-bottom:15px;"><b style="font-size:20px;">Dziś: ${Math.round(d.current_weather.temperature)}°C ${getWeatherIcon(todayWeatherCode)}</b></div>`;
            html += `<div style="display:flex; justify-content:space-around; border-top:1px solid var(--border-color); padding-top:15px;">`;
            for(let i=0; i<3; i++) {
                const date = new Date(d.daily.time[i]).toLocaleDateString('pl-PL', {weekday: 'short'});
                html += `<div style="text-align:center;"><div style="font-size:11px; font-weight:800; color:var(--text-muted);">${date}</div><div style="font-size:24px;">${getWeatherIcon(d.daily.weathercode[i])}</div><div style="font-weight:900;">${Math.round(d.daily.temperature_2m_max[i])}°</div><div style="font-size:10px; color:var(--text-muted);">${Math.round(d.daily.temperature_2m_min[i])}°</div></div>`;
            }
            html += `</div>`;
            contentEl.innerHTML = html;
        }
    }).catch(e=>console.warn("Błąd pogodowego API:", e));
}
