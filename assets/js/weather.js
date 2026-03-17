// ═══════════════════════════════════════════════════════════
//  weather.js — Weather Widget Fetch & Render
// ═══════════════════════════════════════════════════════════

/**
 * Fetches the current weather for a specific latitude and longitude
 */
async function fetchWeather(lat, lon) {
  // 1. Build the URL using the API Key and coordinates
  const url = `${CONFIG.WEATHER_BASE}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${CONFIG.WEATHER_API_KEY}`;
  
  // 2. Make the network request
  const response = await fetch(url);
  
  // 3. Check for errors
  if (!response.ok) {
    throw new Error(`Weather API returned an error: ${response.status}`);
  }
  
  // 4. Return the data as a JavaScript object
  const data = await response.json();
  return data;
}

/**
 * Creates the HTML to display the weather data
 */
function renderWeather(data) {
  // Get the icon URL from OpenWeatherMap
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  
  // Round the temperature to the nearest whole number
  const temperature = Math.round(data.main.temp);
  
  // Get the city name and description (e.g., "Cairo", "clear sky")
  const cityName = data.name;
  const description = data.weather[0].description;

  // Return the simple HTML structure
  return `
    <div class="weather-card">
      <img class="weather-icon" src="${iconUrl}" alt="${description}" />
      <div>
        <div class="weather-temp">${temperature}°C</div>
        <div>
          <div class="weather-city">${cityName}</div>
          <div class="weather-desc">${description}</div>
        </div>
      </div>
    </div>`;
}

/**
 * Main function to start the weather widget
 */
async function initWeather() {
  // 1. Get HTML elements
  const spinner = document.getElementById('weather-spinner');
  const content = document.getElementById('weather-content');

  // We are hardcoding the coordinates for Cairo (latitude: 30.0444, longitude: 31.2357)
  const lat = 30.0444;
  const lon = 31.2357;

  try {
    // 2. Fetch the data
    const weatherData = await fetchWeather(lat, lon);
    
    // 3. Build HTML and inject it into the page
    content.innerHTML = renderWeather(weatherData);
    
    // 4. Make the content visible
    content.style.display = 'block';
  } catch (error) {
    // 5. If it fails, show an error message
    content.innerHTML = `<div class="error-msg">${error.message}</div>`;
    content.style.display = 'block';
  } finally {
    // 6. Hide the loading spinner
    spinner.style.display = 'none';
  }
}

// Start the widget when the page loads
document.addEventListener('DOMContentLoaded', initWeather);
