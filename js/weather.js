async function fetchWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${CONFIG.OPENWEATHER_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Weather API error');
  return response.json();
}

function getWeatherIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

function renderWeather(data) {
  const widget = document.getElementById('weather-widget');
  if (!widget) return;
  widget.innerHTML = `
    <div class="weather-content">
      <div class="weather-header">
        <img src="${getWeatherIconUrl(data.weather[0].icon)}" alt="${data.weather[0].description}" class="weather-icon">
        <div class="weather-temp">${Math.round(data.main.temp)}°C</div>
      </div>
      <div class="weather-city">${data.name}, ${data.sys.country}</div>
      <div class="weather-desc">${data.weather[0].description}</div>
      <div class="weather-details">
        <span>Humidity: ${data.main.humidity}%</span>
        <span>Wind: ${Math.round(data.wind.speed)} m/s</span>
      </div>
    </div>
  `;
}

function renderWeatherError(message) {
  const widget = document.getElementById('weather-widget');
  if (!widget) return;
  widget.innerHTML = `<div class="error-message">${message}</div>`;
}

function renderWeatherLoading() {
  const widget = document.getElementById('weather-widget');
  if (!widget) return;
  widget.innerHTML = `<div class="spinner"></div>`;
}

async function initWeather() {
  renderWeatherLoading();
  if (!navigator.geolocation) {
    renderWeatherError('Geolocation is not supported by your browser.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const data = await fetchWeather(position.coords.latitude, position.coords.longitude);
        renderWeather(data);
      } catch {
        renderWeatherError('Failed to load weather data. Please check your API key.');
      }
    },
    () => {
      renderWeatherError('Location access denied. Please enable location permissions.');
    }
  );
}

document.addEventListener('DOMContentLoaded', initWeather);
