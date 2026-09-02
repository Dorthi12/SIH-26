import axios from "axios";

// Default fallback coordinates for local development (Prayagraj, UP, India)
const DEFAULT_LOCATION = {
  city: "Prayagraj",
  region: "Uttar Pradesh",
  country: "India",
  locationName: "Prayagraj, Uttar Pradesh",
  lat: 25.4358,
  lon: 81.8463,
};

/**
 * Maps Open-Meteo WMO weather codes to human-readable text and icon keys.
 * WMO Weather Code table: https://open-meteo.com/en/docs
 */
function mapWmoCodeToCondition(code) {
  if (code === 0) return { condition: "Sunny", icon: "sun" };
  if (code === 1 || code === 2) return { condition: "Partly Cloudy", icon: "partly" };
  if (code === 3) return { condition: "Cloudy", icon: "cloud" };
  if ([45, 48].includes(code)) return { condition: "Foggy", icon: "cloud" };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { condition: "Rainy", icon: "rain" };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { condition: "Snowy", icon: "cloud" };
  if ([95, 96, 99].includes(code)) return { condition: "Thunderstorm", icon: "storm" };
  return { condition: "Partly Cloudy", icon: "partly" };
}

/**
 * Format day string given an index (0: Today, 1: Tomorrow, 2+: Day name or +N Days)
 */
function formatDayName(dateStr, index) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  } catch {
    return `+${index} Days`;
  }
}

/**
 * Lookup IP coordinates using public IP geolocation services.
 */
async function getCoordinatesFromIp(ip) {
  // Clean up IPv6 mapped IPv4 address if needed (e.g., ::ffff:127.0.0.1)
  const cleanIp = ip ? ip.replace(/^.*:/, "") : "";

  const isLocalIp =
    !cleanIp ||
    cleanIp === "127.0.0.1" ||
    cleanIp === "localhost" ||
    cleanIp.startsWith("10.") ||
    cleanIp.startsWith("192.168.") ||
    (cleanIp.startsWith("172.") && parseInt(cleanIp.split(".")[1], 10) >= 16 && parseInt(cleanIp.split(".")[1], 10) <= 31);

  if (isLocalIp) {
    return DEFAULT_LOCATION;
  }

  try {
    const response = await axios.get(`http://ip-api.com/json/${cleanIp}`, { timeout: 3000 });
    if (response.data && response.data.status === "success") {
      const city = response.data.city || DEFAULT_LOCATION.city;
      const region = response.data.regionName || response.data.region || DEFAULT_LOCATION.region;
      return {
        city,
        region,
        country: response.data.country || DEFAULT_LOCATION.country,
        locationName: `${city}, ${region}`,
        lat: response.data.lat,
        lon: response.data.lon,
      };
    }
  } catch (err) {
    console.warn(`[WeatherService] IP lookup failed for ${cleanIp}, using default location:`, err.message);
  }

  return DEFAULT_LOCATION;
}

/**
 * Reverse geocode latitude & longitude to get a human-readable city & state name.
 */
async function reverseGeocode(lat, lon) {
  try {
    const response = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1`,
      { timeout: 3000 }
    );
    if (response.data && response.data.results && response.data.results.length > 0) {
      const res = response.data.results[0];
      const city = res.name || res.city || res.admin2 || "Local Field";
      const state = res.admin1 || res.country || "";
      return state ? `${city}, ${state}` : city;
    }
  } catch (_) {
    try {
      const nomRes = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
        { timeout: 3000, headers: { "User-Agent": "AgriSense/1.0" } }
      );
      if (nomRes.data && nomRes.data.address) {
        const addr = nomRes.data.address;
        const city = addr.city || addr.town || addr.village || addr.county || "Local Field";
        const state = addr.state || addr.country || "";
        return state ? `${city}, ${state}` : city;
      }
    } catch (e) {
      console.warn("[WeatherService] Reverse geocode failed, using coordinates fallback:", e.message);
    }
  }
  return `${Number(lat).toFixed(2)}°N, ${Number(lon).toFixed(2)}°E`;
}

/**
 * Main weather service function.
 */
export async function getWeatherService({ lat, lon, ip }) {
  let targetLat;
  let targetLon;
  let locationName;
  let isPrecise = false;

  if (lat !== undefined && lon !== undefined && lat !== null && lon !== null && !isNaN(Number(lat)) && !isNaN(Number(lon))) {
    targetLat = Number(lat);
    targetLon = Number(lon);
    isPrecise = true;
    locationName = await reverseGeocode(targetLat, targetLon);
  } else {
    const ipGeo = await getCoordinatesFromIp(ip);
    targetLat = ipGeo.lat;
    targetLon = ipGeo.lon;
    locationName = ipGeo.locationName;
  }

  // Fetch forecast from Open-Meteo API
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code&timezone=auto`;

  const weatherRes = await axios.get(weatherUrl, { timeout: 5000 });
  const data = weatherRes.data;

  const currentData = data.current || {};
  const dailyData = data.daily || {};

  const currentCondition = mapWmoCodeToCondition(currentData.weather_code ?? 0);

  const forecast = (dailyData.time || []).slice(0, 5).map((dateStr, i) => {
    const dayCondition = mapWmoCodeToCondition(dailyData.weather_code?.[i] ?? 0);
    const rainChance = dailyData.precipitation_probability_max?.[i] ?? Math.min(100, Math.round((dailyData.precipitation_sum?.[i] || 0) * 15));
    return {
      day: formatDayName(dateStr, i),
      high_c: Math.round(dailyData.temperature_2m_max?.[i] ?? 28),
      low_c: Math.round(dailyData.temperature_2m_min?.[i] ?? 20),
      rainfall_mm: Math.round((dailyData.precipitation_sum?.[i] ?? 0) * 10) / 10,
      rain_chance: rainChance,
      condition: dayCondition.condition,
      condition_icon: dayCondition.icon,
    };
  });

  // Calculate dynamic rain alert & advice
  const tomorrowForecast = forecast[1];
  let alertTitle = "Stable weather conditions";
  let alertDesc = "Weather conditions are optimal for general field preparation and regular crop monitoring.";

  if (tomorrowForecast && (tomorrowForecast.rain_chance > 40 || tomorrowForecast.rainfall_mm > 2)) {
    alertTitle = "Rain expected tomorrow";
    alertDesc = "Consider planning irrigation accordingly and delay spraying until the field dries.";
  } else if (forecast.some((d) => d.rain_chance > 50)) {
    alertTitle = "Precipitation expected in upcoming days";
    alertDesc = "Keep an eye on the 5-day outlook to schedule fertilizer application and harvesting.";
  }

  const currentRainChance = forecast[0]?.rain_chance ?? Math.min(100, Math.round((currentData.precipitation || 0) * 20));

  return {
    location: locationName,
    latitude: targetLat,
    longitude: targetLon,
    isPrecise,
    season: "Kharif",
    recommended_crop: "Maize",
    weather_compatibility: "High",

    current: {
      temperature_c: Math.round(currentData.temperature_2m ?? 28),
      feels_like_c: Math.round(currentData.apparent_temperature ?? 30),
      humidity_percent: Math.round(currentData.relative_humidity_2m ?? 72),
      rainfall_mm: Math.round((currentData.precipitation ?? 0) * 10) / 10,
      rain_chance: currentRainChance,
      wind_kmh: Math.round(currentData.wind_speed_10m ?? 12),
      condition: currentCondition.condition,
      condition_icon: currentCondition.icon,
    },

    forecast,

    alert: {
      title: alertTitle,
      description: alertDesc,
    },
  };
}
