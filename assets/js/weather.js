async function fetchWeather(lat, lon) {
  const url = `${ CONFIG.WEATHER_BASE }/weather?lat=${ lat }&lon=${ lon }&units=metric&appid=${ CONFIG.WEATHER_API_KEY }`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather API returned an error: ${ response.status }`);
  }

  const data = await response.json();
  return data;
}


function renderWeather(data) {
  const iconCode = data.weather[0].icon;

  const temperature = Math.round(data.main.temp);

  const cityName = data.name;
  const description = data.weather[0].description;

  return `
    <div class="flex items-center gap-4">
      <img class="w-16 h-16 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" src="${ iconUrl }" alt="${ description }" />
      <div>
        <div class="text-4xl font-extrabold bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">${ temperature }°C</div>
        <div>
          <div class="text-base font-semibold">${ cityName }</div>
          <div class="text-sm text-slate-400 capitalize">${ description }</div>
        </div>
      </div>
    </div>`;
}


async function initWeather() {
  const spinner = document.getElementById('weather-spinner');
  const content = document.getElementById('weather-content');

  const lat = 30.0444;
  const lon = 31.2357;

  try {
    const weatherData = await fetchWeather(lat, lon);

    content.innerHTML = renderWeather(weatherData);

    content.style.display = 'block';
  } catch (error) {
    content.innerHTML = `<div class="text-red-500 text-center py-4 text-sm">${ error.message }</div>`;
    content.style.display = 'block';
  } finally {
    spinner.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', initWeather);
