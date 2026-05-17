// src/services/weatherService.js

export function getWeatherIcon(code) {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 55 || (code >= 61 && code <= 65) || (code >= 80 && code <= 82)) return '🌧️';
    if (code <= 77) return '❄️';
    if (code >= 95) return '⛈️';
    return '🌡️';
}

// Pobieranie czystych danych z Open-Meteo API
export async function fetchWeatherData(lat, lng) {
    if(!lat || !lng) return null;
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`);
        return await response.json();
    } catch (error) {
        console.error("Weather API error:", error);
        return null;
    }
}

// Funkcja odpowiedzialna wyłącznie za renderowanie danych do HTML
export function renderWeatherUI(data) {
    if (!data) return;

    // 1. Aktualizacja małego widżetu temperatury na mapie głównej
    const tempEl = document.getElementById('weather-temp');
    if(tempEl && data.current_weather) {
        tempEl.innerText = `${Math.round(data.current_weather.temperature)}°C`;
    }

    // 2. Aktualizacja pełnej prognozy wewnątrz modalu pogodowego
    const contentEl = document.getElementById('weather-forecast-content');
    if(contentEl && data.daily && data.current_weather) {
        let html = `<div style="text-align:center; margin-bottom:15px;"><b style="font-size:20px;">Dziś: ${Math.round(data.current_weather.temperature)}°C ${getWeatherIcon(data.current_weather.weathercode)}</b></div>`;
        html += `<div style="display:flex; justify-content:space-around; border-top:1px solid var(--border-color); padding-top:15px;">`;
        
        for(let i = 0; i < 3; i++) {
            const date = new Date(data.daily.time[i]).toLocaleDateString('pl-PL', {weekday: 'short'});
            html += `
                <div style="text-align:center;">
                    <div style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform: capitalize;">${date}</div>
                    <div style="font-size:24px; margin: 4px 0;">${getWeatherIcon(data.daily.weathercode[i])}</div>
                    <div style="font-weight:900;">${Math.round(data.daily.temperature_2m_max[i])}°</div>
                    <div style="font-size:10px; color:var(--text-muted);">${Math.round(data.daily.temperature_2m_min[i])}°</div>
                </div>`;
        }
        html += `</div>`;
        contentEl.innerHTML = html;
    }
}
