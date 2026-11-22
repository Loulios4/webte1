const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Server odpovedal chybou ${response.status}.`);
  }
  return response.json();
}

export function getForecast(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: "temperature_2m,wind_speed_10m",
    daily: "temperature_2m_max,temperature_2m_min",
    timezone: "auto",
  });
  return getJson(`${FORECAST_URL}?${params}`);
}

export async function findCity(name) {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=1&language=sk`;
  const data = await getJson(url);
  if (!data.results) {
    throw new Error(`Mesto „${name}“ sa nenašlo.`);
  }
  return data.results[0];
}
