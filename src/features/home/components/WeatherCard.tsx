import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import {
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SHADOWS,
  SPACING,
} from "../../../theme";

const STORAGE_KEY = "@weather_cache";
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const LOCATION_LABEL = "San Isidro, Rodriguez, Rizal";
const LATITUDE = 14.7389;
const LONGITUDE = 121.1236;
const TIMEZONE = "Asia/Manila";

type WeatherPayload = {
  temperature: number;
  condition: string;
  rainProbability?: number;
  windSpeed: number;
  localTime?: string;
  feelsLike?: number;
  humidity?: number;
  uvIndex?: number;
  highTemp?: number;
  lowTemp?: number;
  sunrise?: string;
  sunset?: string;
};

type OpenMeteoResponse = {
  current_weather?: {
    temperature: number;
    windspeed: number;
    weathercode: number;
    time: string;
  };
  hourly?: {
    time: string[];
    precipitation_probability?: number[];
    apparent_temperature?: number[];
    relativehumidity_2m?: number[];
    uv_index?: number[];
  };
  daily?: {
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    sunrise?: string[];
    sunset?: string[];
  };
};

const weatherCodeLabel = (weathercode: number): string => {
  if (weathercode === 0) return "Clear";
  if (weathercode === 1 || weathercode === 2) return "Partly Cloudy";
  if (weathercode === 3) return "Cloudy";
  if (weathercode >= 45 && weathercode <= 48) return "Foggy";
  if (weathercode >= 51 && weathercode <= 67) return "Light Rain";
  if (weathercode >= 71 && weathercode <= 77) return "Snow Showers";
  if (weathercode >= 80 && weathercode <= 82) return "Rain Showers";
  if (weathercode >= 85 && weathercode <= 99) return "Stormy";
  return "Clear";
};

const weatherIconName = (condition: string) => {
  const normalized = condition.toLowerCase();
  if (normalized.includes("clear")) return "sun";
  if (normalized.includes("cloud") && normalized.includes("rain"))
    return "cloud-rain";
  if (normalized.includes("rain") || normalized.includes("storm"))
    return "cloud-rain";
  if (
    normalized.includes("cloud") ||
    normalized.includes("fog") ||
    normalized.includes("stormy")
  )
    return "cloud";
  return "sun";
};

const parseLocalTime = (isoString: string): string | undefined => {
  if (!isoString) return undefined;
  const split = isoString.split("T");
  if (split.length < 2) return undefined;
  const [hourStr, minuteStr] = split[1].split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return undefined;
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
};

const findNearestHourlyIndex = (
  hourly: OpenMeteoResponse["hourly"] | undefined,
  currentTime: string,
): number | undefined => {
  if (!hourly?.time?.length) return undefined;
  const currentDate = new Date(currentTime);
  if (Number.isNaN(currentDate.getTime())) return undefined;
  let nearestIndex = 0;
  let smallestDelta = Number.POSITIVE_INFINITY;
  hourly.time.forEach((entry, index) => {
    const entryDate = new Date(entry);
    if (Number.isNaN(entryDate.getTime())) return;
    const delta = Math.abs(entryDate.getTime() - currentDate.getTime());
    if (delta < smallestDelta) {
      smallestDelta = delta;
      nearestIndex = index;
    }
  });
  return nearestIndex;
};

const getNearestHourlyValue = (
  hourly: OpenMeteoResponse["hourly"] | undefined,
  currentTime: string,
  values?: number[],
): number | undefined => {
  const index = findNearestHourlyIndex(hourly, currentTime);
  if (index === undefined || !values?.length) return undefined;
  const value = values[index];
  return value === undefined ? undefined : Math.round(value);
};

const getRainProbability = (
  hourly: OpenMeteoResponse["hourly"] | undefined,
  currentTime: string,
): number | undefined => {
  return getNearestHourlyValue(
    hourly,
    currentTime,
    hourly?.precipitation_probability,
  );
};

const fetchWeather = async (): Promise<WeatherPayload> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current_weather=true&hourly=apparent_temperature,relativehumidity_2m,uv_index,precipitation_probability&windspeed_unit=kmh&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=${encodeURIComponent(
    TIMEZONE,
  )}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Weather service unavailable");
  const data = (await response.json()) as OpenMeteoResponse;
  if (!data.current_weather) throw new Error("Incomplete weather response");

  const condition = weatherCodeLabel(data.current_weather.weathercode);
  const highTemp = data.daily?.temperature_2m_max?.[0];
  const lowTemp = data.daily?.temperature_2m_min?.[0];
  const sunrise = data.daily?.sunrise?.[0];
  const sunset = data.daily?.sunset?.[0];

  return {
    temperature: Math.round(data.current_weather.temperature),
    condition,
    rainProbability: getRainProbability(data.hourly, data.current_weather.time),
    windSpeed: Math.round(data.current_weather.windspeed),
    feelsLike: getNearestHourlyValue(
      data.hourly,
      data.current_weather.time,
      data.hourly?.apparent_temperature,
    ),
    humidity: getNearestHourlyValue(
      data.hourly,
      data.current_weather.time,
      data.hourly?.relativehumidity_2m,
    ),
    uvIndex: getNearestHourlyValue(
      data.hourly,
      data.current_weather.time,
      data.hourly?.uv_index,
    ),
    highTemp: highTemp === undefined ? undefined : Math.round(highTemp),
    lowTemp: lowTemp === undefined ? undefined : Math.round(lowTemp),
    sunrise: sunrise ? parseLocalTime(sunrise) : undefined,
    sunset: sunset ? parseLocalTime(sunset) : undefined,
    localTime: parseLocalTime(data.current_weather.time),
  };
};

const useCachedWeather = () => {
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cachedRaw = await AsyncStorage.getItem(STORAGE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as {
          timestamp: number;
          entry: WeatherPayload;
        };
        if (cached.timestamp && cached.entry) {
          const age = Date.now() - cached.timestamp;
          if (age < CACHE_DURATION_MS) {
            setWeather(cached.entry);
            setLoading(false);
            return;
          }
        }
      }

      const freshWeather = await fetchWeather();
      const cachePayload = { timestamp: Date.now(), entry: freshWeather };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cachePayload));
      setWeather(freshWeather);
    } catch {
      setError("Unable to load weather information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWeather();
  }, [refreshWeather]);

  return { weather, loading, error };
};

const WeatherCard: React.FC = () => {
  const { weather, loading, error } = useCachedWeather();
  const { width } = Dimensions.get("window");

  return (
    <View style={styles.wrapper}>
      <View
        style={[styles.card, { paddingHorizontal: 20, paddingVertical: 18 }]}
      >
        <View style={styles.headerRow}>
          <View style={styles.locationBlock}>
            <View style={styles.locationTag}>
              <Feather name="map-pin" size={14} color={COLORS.white} />
              <Text style={styles.locationText}>{LOCATION_LABEL}</Text>
            </View>
            <Text style={styles.timeText}>
              {weather?.localTime ?? "Asia/Manila"}
            </Text>
          </View>
          <Feather
            name={weather ? weatherIconName(weather.condition) : "sun"}
            size={36}
            color={COLORS.white}
          />
        </View>

        {loading ? (
          <View style={styles.statusArea}>
            <ActivityIndicator color={COLORS.white} size="small" />
          </View>
        ) : error ? (
          <View style={styles.statusArea}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : weather ? (
          <View style={styles.content}>
            <View style={styles.middleRow}>
              <View style={styles.tempBlock}>
                <View style={styles.temperatureRow}>
                  <Text style={styles.temperatureValue}>
                    {weather.temperature}
                  </Text>
                  <Text style={styles.temperatureUnit}>°C</Text>
                </View>
                <View style={styles.conditionRow}>
                  <Text style={styles.conditionText}>{weather.condition}</Text>
                  <View style={styles.highLow}>
                    {weather.highTemp !== undefined && (
                      <Text style={styles.highText}>
                        H: {weather.highTemp}°
                      </Text>
                    )}
                    {weather.lowTemp !== undefined && (
                      <Text style={styles.lowText}>L: {weather.lowTemp}°</Text>
                    )}
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValueLarge}>
                  {weather.rainProbability !== undefined
                    ? `${weather.rainProbability}%`
                    : "—"}
                </Text>
                <Text style={styles.metricLabelSmall}>Rain</Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricValueLarge}>
                  {weather.windSpeed} km/h
                </Text>
                <Text style={styles.metricLabelSmall}>Wind</Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricValueLarge}>
                  {weather.feelsLike !== undefined
                    ? `${weather.feelsLike}°C`
                    : "—"}
                </Text>
                <Text style={styles.metricLabelSmall}>Feels</Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricValueLarge}>
                  {weather.humidity !== undefined
                    ? `${weather.humidity}%`
                    : "—"}
                </Text>
                <Text style={styles.metricLabelSmall}>Humidity</Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricValueLarge}>
                  {weather.uvIndex !== undefined ? weather.uvIndex : "—"}
                </Text>
                <Text style={styles.metricLabelSmall}>UV</Text>
              </View>
            </View>

            <View style={styles.sunContainer}>
              <Text style={styles.sunText}>
                Sunrise {weather.sunrise ?? "—"}
              </Text>
              <Text style={styles.sunText}>Sunset {weather.sunset ?? "—"}</Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: "#14203A",
    borderRadius: 20,
    minHeight: 160,
    maxHeight: 220,
    ...SHADOWS.medium,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationBlock: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  locationTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  locationText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
    marginLeft: SPACING.xs,
  },
  timeText: {
    color: "rgba(255,255,255,0.72)",
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    marginTop: 2,
  },
  statusArea: {
    minHeight: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body14,
    textAlign: "center",
  },
  content: {
    marginTop: SPACING.sm,
  },
  middleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tempBlock: {
    flex: 1,
  },
  temperatureRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  temperatureValue: {
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h28,
  },
  temperatureUnit: {
    color: "rgba(255,255,255,0.72)",
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body14,
    marginLeft: 6,
  },
  conditionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 4,
  },
  conditionText: {
    color: "rgba(255,255,255,0.86)",
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body14,
  },
  highLow: {
    flexDirection: "row",
    marginLeft: SPACING.md,
  },
  highText: {
    color: "rgba(255,255,255,0.72)",
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
    marginRight: SPACING.md,
  },
  lowText: {
    color: "rgba(255,255,255,0.72)",
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.md,
    flexWrap: "wrap",
  },
  metricItem: {
    width: "18%",
    minWidth: 56,
    alignItems: "center",
  },
  metricValueLarge: {
    color: COLORS.white,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h18,
  },
  metricLabelSmall: {
    color: "rgba(255,255,255,0.62)",
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
    marginTop: 2,
  },
  sunContainer: {
    marginTop: SPACING.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sunText: {
    color: "rgba(255,255,255,0.78)",
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
  },
});

export default WeatherCard;
