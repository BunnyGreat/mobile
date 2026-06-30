import type { DashboardData, WeatherSummary } from "../types/home.types";
import { getHomeCache, saveHomeCache } from "./homeCache.service";
import { HOME_QUICK_ACTIONS } from "../utils/quickActions";
import { formatGreeting } from "../utils/formatGreeting";

const fetchWeatherSummary = async (): Promise<WeatherSummary | null> => {
  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=14.7389&longitude=121.1236&current_weather=true&hourly=relativehumidity_2m,precipitation_probability&timezone=Asia%2FManila"
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      current_weather?: {
        temperature?: number;
        weathercode?: number;
        windspeed?: number;
      };
      hourly?: {
        relativehumidity_2m?: number[];
      };
    };

    const currentWeather = data.current_weather;
    if (!currentWeather) {
      return null;
    }

    const condition =
      currentWeather.weathercode === 0
        ? "Clear"
        : currentWeather.weathercode === 1 || currentWeather.weathercode === 2
          ? "Partly Cloudy"
          : currentWeather.weathercode === 3
            ? "Cloudy"
            : "Clear";

    return {
      temperature: Math.round(currentWeather.temperature ?? 0),
      condition,
      icon: condition.toLowerCase().replace(/\s+/g, "-"),
      city: "San Isidro, Rodriguez, Rizal",
      humidity: data.hourly?.relativehumidity_2m?.[0],
      windSpeed: Math.round(currentWeather.windspeed ?? 0),
    };
  } catch (error: unknown) {
    console.error("[DASHBOARD] Failed to load weather", error);
    return null;
  }
};

export const getDashboard = async (): Promise<DashboardData> => {
  try {
    const cachedDashboard = await getHomeCache();
    if (cachedDashboard) {
      return cachedDashboard;
    }

    const weather = await fetchWeatherSummary();
    const dashboard: DashboardData = {
      greeting: formatGreeting(),
      weather,
      quickActions: HOME_QUICK_ACTIONS,
    };

    await saveHomeCache(dashboard);
    return dashboard;
  } catch (error: unknown) {
    console.error("[DASHBOARD] Unexpected error", error);
    return {
      greeting: formatGreeting(),
      weather: null,
      quickActions: HOME_QUICK_ACTIONS,
    };
  }
};

export default getDashboard;
