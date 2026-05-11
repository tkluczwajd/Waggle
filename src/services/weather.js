// src/services/weather.js

export function getWeatherIcon(code) {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 55 || (code >= 61 && code <= 65) || (code >= 80 && code <= 82)) return '🌧️';
    if (code <= 77) return '❄️';
    if (code >= 95) return '⛈️';
    return '🌡️';
}

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
