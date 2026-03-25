async function fetchWeather(lat, lon) {
  const url = `${ CONFIG.WEATHER_BASE }/weather?lat=${ lat }&lon=${ lon }&units=metric&appid=${ CONFIG.WEATHER_API_KEY }`;
  console.log("[Weather] Requesting data from:", url);
  const response = await fetch(url);
  if (response.ok === false) {
    throw new Error(`Weather API returned an error: ${ response.status }`);
  }
  const data = await response.json();
  return data;
}
function renderWeather(data) {
  const weatherStatus = data.weather[0];
  const iconCode = weatherStatus.icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  const temperature = Math.round(data.main.temp);
  const cityName = data.name;
  const description = weatherStatus.description;
  return `
    <div class="flex items-center gap-4">
      <img class="w-16 h-16 drop-shadow-sm" src="${ iconUrl }" alt="${ description }" />
      <div>
        <div class="text-4xl font-extrabold text-gray-800">${ temperature }°C</div>
        <div>
          <div class="text-base font-semibold text-gray-900">${ cityName }</div>
          <div class="text-sm text-gray-500 capitalize">${ description }</div>
        </div>
      </div>
    </div>`;
}
async function initWeather() {
  console.log("[Weather] Setting up widget...");
  const spinnerContainer = document.getElementById('weather-spinner');
  const widgetContent = document.getElementById('weather-content');
  const lat = 30.0444;
  const lon = 31.2357;
  try {
    const weatherData = await fetchWeather(lat, lon);
    const htmlString = renderWeather(weatherData);
    widgetContent.innerHTML = htmlString;
    widgetContent.style.display = 'block';
  } catch (error) {
    console.error("[Weather] Oh no! Something broke:", error);
    widgetContent.innerHTML = `<div class="text-red-600 text-center py-4 text-sm">Failed to load weather: ${ error.message }</div>`;
    widgetContent.style.display = 'block';
  } finally {
    spinnerContainer.style.display = 'none';
  }
}
document.addEventListener('DOMContentLoaded', initWeather);
