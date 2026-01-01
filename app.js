// weather.js
// Free Weather API (No API Key): Open-Meteo
// https://open-meteo.com/

const cityNameEl = document.getElementById("city");
const dateEl = document.getElementById("date");
const tempEl = document.getElementById("temp");
const conditionEl = document.getElementById("condition");
const windEl = document.getElementById("wind");
const humidityEl = document.getElementById("humidity");
const rainEl = document.getElementById("rain");
const forecastEl = document.getElementById("forecast");

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");


fetchWeatherByCity("New York");

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function weatherCodeToText(code) {
  const map = {
    0: "Clear ☀️",
    1: "Mostly Clear 🌤️",
    2: "Partly Cloudy ⛅",
    3: "Cloudy ☁️",
    45: "Fog 🌫️",
    51: "Drizzle 🌦️",
    61: "Rain 🌧️",
    71: "Snow ❄️",
    80: "Showers 🌧️",
    95: "Storm ⛈️",
  };
  return map[code] || "Weather";
}

async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.results) throw new Error("City not found");
  return data.results[0];
}

async function fetchWeatherByCity(city) {
  try {
    const location = await getCoordinates(city);
    const { latitude, longitude, name, country } = location;

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m&daily=temperature_2m_max,weathercode,precipitation_probability_max&timezone=auto`;

    const res = await fetch(weatherUrl);
    const data = await res.json();

    const current = data.current_weather;

    cityNameEl.textContent = `${name}, ${country}`;
    dateEl.textContent = formatDate(new Date());
    tempEl.textContent = Math.round(current.temperature);
    conditionEl.textContent = weatherCodeToText(current.weathercode);
    windEl.textContent = `${Math.round(current.windspeed)} km/h`;
    humidityEl.textContent = `${data.hourly.relativehumidity_2m[0]}%`;
    rainEl.textContent = `${data.daily.precipitation_probability_max[0]}%`;

    
    forecastEl.innerHTML = "";
    for (let i = 1; i <= 4; i++) {
      const day = new Date(data.daily.time[i]);
      const temp = Math.round(data.daily.temperature_2m_max[i]);
      const icon = weatherCodeToText(data.daily.weathercode[i]).split(" ")[1];

      const div = document.createElement("div");
      div.className = "flex flex-col items-center";
      div.innerHTML = `
        <span class="text-xs text-gray-500">
          ${day.toLocaleDateString("en-US", { weekday: "short" })}
        </span>
        <span>${icon || "🌤️"}</span>
        <span class="text-sm font-medium">${temp}°</span>
      `;
      forecastEl.appendChild(div);
    }
  } catch (err) {
    conditionEl.textContent = "City not found ❌";
    console.error(err);
  }
}

searchBtn.addEventListener("click", () => {
  const city = searchInput.value.trim();
  if (city) fetchWeatherByCity(city);
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});
