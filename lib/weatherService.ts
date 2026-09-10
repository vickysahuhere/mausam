import { IconName } from '../components/ui/Icon';
import { getCachedData, setCachedData } from './cache';

// ==========================================
// 1. OPEN-METEO PROVIDER RAW TYPES
// ==========================================

export interface OpenMeteoCurrentForecast {
  time: string;
  interval: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day?: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
}

export interface OpenMeteoHourlyForecast {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  precipitation_probability: number[];
  precipitation: number[];
  weather_code: number[];
  visibility?: number[];
}

export interface OpenMeteoDailyForecast {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
  precipitation_sum: number[];
}

export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: OpenMeteoCurrentForecast;
  hourly: OpenMeteoHourlyForecast;
  daily: OpenMeteoDailyForecast;
}

export interface OpenMeteoAirQualityResponse {
  latitude: number;
  longitude: number;
  current: {
    time: string;
    pm10: number;
    pm2_5: number;
    european_aqi: number;
    us_aqi: number;
  };
}

export interface OpenMeteoMarineResponse {
  latitude: number;
  longitude: number;
  current?: {
    time: string;
    wave_height: number | null;
    wave_direction: number | null;
    wave_period: number | null;
    swell_wave_height: number | null;
    swell_wave_period: number | null;
    ocean_current_velocity?: number | null;
    ocean_current_direction?: number | null;
  };
  hourly?: {
    time: string[];
    wave_height: (number | null)[];
    wave_direction?: (number | null)[];
    wave_period?: (number | null)[];
  };
}

// ==========================================
// 1b. EDGE FUNCTION CONFIGURATION
// ==========================================

/**
 * When Supabase is configured, route API requests through Edge Functions.
 * Falls back to direct Open-Meteo calls when Edge Functions are unavailable.
 */
function getEdgeFunctionBaseUrl(): string | null {
  // Only route through Edge Functions if explicitly enabled via environment variable
  if (process.env.EXPO_PUBLIC_USE_EDGE_FUNCTIONS !== 'true') {
    return null;
  }
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (
    !supabaseUrl ||
    supabaseUrl.includes('your-project-id') ||
    supabaseUrl.includes('placeholder')
  ) {
    return null;
  }
  return `${supabaseUrl}/functions/v1`;
}

// ==========================================
// 2. NORMALIZED DATA MODELS FOR ALL WIDGETS
// ==========================================

export interface CurrentSummaryData {
  temp: number;
  high: number;
  low: number;
  desc: string;
  iconName: IconName;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  feelsLike: number;
}

export interface AqiData {
  aqi: number;
  pm25: number;
  pm10: number;
  status: string;
  dominantPollutant: string;
  advisory: string;
}

export interface UvIndexData {
  uvIndex: number;
  level: string;
  peakTime: string;
  protectionTip: string;
  safeMinutesWithoutBurn: number;
}

export interface RainTimelineSlot {
  time: string;
  prob: number;
  mm: number;
}

export interface RainTimelineData {
  summary: string;
  timeline: RainTimelineSlot[];
}

export interface DailyForecastItem {
  day: string;
  high: number;
  low: number;
  cond: string;
  iconName: IconName;
}

export interface ExtendedForecastData {
  days: DailyForecastItem[];
}

export interface SunriseSunsetData {
  sunrise: string;
  sunset: string;
  firstLight: string;
  goldenHour: string;
  daylightDuration: string;
}

export interface ComfortIndexData {
  score: number;
  category: string;
  humidityImpact: string;
  coolingTip: string;
}

export interface BestRunHoursData {
  hours: string[];
  morningTemp: number;
  eveningTemp: number;
  airScore: string;
  comfortScore: number;
}

export interface FrostAlertData {
  riskLevel: string;
  minGroundTemp: number;
  frostWindow: string;
  cropSafetyTip: string;
}

export interface RainfallForecastData {
  districtPrediction: string;
  sevenDayTotal: string;
  soilMoistureStatus: string;
}

export interface SoilMoistureData {
  saturation: string;
  depth10cm: string;
  depth40cm: string;
  recommendation: string;
}

export interface VisibilityFogData {
  visibility: string;
  status: string;
  fogRisk: string;
  commuteImpact: string;
}

export interface PollenData {
  level: string;
  treePollen: string;
  grassPollen: string;
  ragweed: string;
  tip: string;
}

export interface SeaStateData {
  waveHeight: string;
  swellPeriod: string;
  seaCondition: string;
  waterTemp: number;
  surfRating: string;
}

export interface TideTimesData {
  station: string;
  nextHigh: string;
  nextLow: string;
  tideTrend: string;
}

export interface DestinationWeatherData {
  savedCities: Array<{ name: string; temp: number; cond: string }>;
  alertCount: number;
}

export interface PackingTipData {
  recommendations: string[];
}

export interface SchoolCommuteData {
  window: string;
  temp: number;
  rainChance: string;
  status: string;
  advisory: string;
}

export interface HourlyForecastItem {
  time: string;
  hour: number;
  temp: number;
  precipProb: number;
  condition: string;
  iconName: IconName;
  isCurrentHour?: boolean;
}

export interface HourlyForecastData {
  summary: string;
  hours: HourlyForecastItem[];
}

export interface NormalizedWeatherData {
  current_summary: CurrentSummaryData;
  hourly_forecast: HourlyForecastData;
  aqi_card: AqiData;
  uv_index: UvIndexData;
  rain_timeline: RainTimelineData;
  extended_forecast: ExtendedForecastData;
  sunrise_sunset: SunriseSunsetData;
  comfort_index: ComfortIndexData;
  best_run_hours: BestRunHoursData;
  frost_alert: FrostAlertData;
  rainfall_forecast: RainfallForecastData;
  soil_moisture: SoilMoistureData;
  visibility_fog: VisibilityFogData;
  pollen_estimate: PollenData;
  sea_state: SeaStateData;
  tide_times: TideTimesData;
  destination_weather: DestinationWeatherData;
  packing_tip: PackingTipData;
  school_commute: SchoolCommuteData;
}

// ==========================================
// 3. WEATHER CODE & METRIC NORMALIZERS
// ==========================================

export interface WeatherConditionInfo {
  condition: string;
  iconName: IconName;
}

/**
 * Maps WMO weather interpretation codes to Mausam conditions and existing icons.
 */
export function mapWeatherCode(code: number, isDay: boolean = true): WeatherConditionInfo {
  switch (code) {
    case 0:
      return { condition: isDay ? 'Clear Sky' : 'Clear Night', iconName: 'sun' };
    case 1:
      return { condition: isDay ? 'Mainly Sunny' : 'Mainly Clear', iconName: 'sun' };
    case 2:
      return { condition: 'Partly Cloudy', iconName: 'cloud' };
    case 3:
      return { condition: 'Overcast', iconName: 'cloud' };
    case 45:
    case 48:
      return { condition: 'Foggy', iconName: 'fog' };
    case 51:
      return { condition: 'Light Drizzle', iconName: 'rain' };
    case 53:
      return { condition: 'Moderate Drizzle', iconName: 'rain' };
    case 55:
      return { condition: 'Dense Drizzle', iconName: 'rain' };
    case 56:
    case 57:
      return { condition: 'Freezing Drizzle', iconName: 'rain' };
    case 61:
      return { condition: 'Light Rain', iconName: 'rain' };
    case 63:
      return { condition: 'Moderate Rain', iconName: 'rain' };
    case 65:
      return { condition: 'Heavy Rain', iconName: 'rain' };
    case 66:
    case 67:
      return { condition: 'Freezing Rain', iconName: 'rain' };
    case 71:
    case 73:
    case 75:
      return { condition: 'Snow', iconName: 'cloud' };
    case 77:
      return { condition: 'Snow Grains', iconName: 'cloud' };
    case 80:
      return { condition: 'Passing Showers', iconName: 'rain' };
    case 81:
      return { condition: 'Moderate Showers', iconName: 'rain' };
    case 82:
      return { condition: 'Violent Showers', iconName: 'rain' };
    case 85:
    case 86:
      return { condition: 'Snow Showers', iconName: 'cloud' };
    case 95:
      return { condition: 'Thunderstorm', iconName: 'rain' };
    case 96:
    case 99:
      return { condition: 'Thunderstorm with Hail', iconName: 'rain' };
    default:
      return { condition: 'Partly Cloudy', iconName: 'cloud' };
  }
}

/**
 * Converts wind degrees (0-360) to 8-point compass notation.
 */
export function degreesToCompass(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((deg % 360) / 45)) % 8;
  return directions[index];
}

/**
 * Formats an ISO string (e.g. "2026-09-05T06:01") to 12-hour format "06:01 AM".
 */
function formatTime12h(isoStr: string): string {
  try {
    const parts = isoStr.split('T');
    if (!parts[1]) return isoStr;
    const [hStr, mStr] = parts[1].split(':');
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    const hFormatted = h < 10 ? '0' + h : String(h);
    return `${hFormatted}:${mStr} ${ampm}`;
  } catch {
    return isoStr;
  }
}

/**
 * Formats an ISO string (e.g. "2026-09-05T18:00") to "6 PM".
 */
function formatHourShort(isoStr: string): string {
  try {
    const parts = isoStr.split('T');
    if (!parts[1]) return isoStr;
    const [hStr] = parts[1].split(':');
    const h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return `${h12} ${ampm}`;
  } catch {
    return isoStr;
  }
}

/**
 * Formats day name from ISO date (e.g. "2026-09-05" -> "Today", "Tomorrow", "Sun").
 */
function formatDayName(isoDate: string, index: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  try {
    const date = new Date(isoDate + 'T12:00:00Z');
    return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
  } catch {
    return isoDate;
  }
}

// ==========================================
// 3b. MARINE DATA HELPERS
// ==========================================

/**
 * Classifies sea condition based on wave height (simplified Douglas Sea Scale).
 */
function classifySeaState(waveHeight: number): string {
  if (waveHeight < 0.1) return 'Calm (Glassy)';
  if (waveHeight < 0.5) return 'Calm (Rippled)';
  if (waveHeight < 1.25) return 'Smooth';
  if (waveHeight < 2.5) return 'Moderate Swell';
  if (waveHeight < 4.0) return 'Rough';
  if (waveHeight < 6.0) return 'Very Rough';
  return 'High Seas';
}

/**
 * Rates surf conditions on a 1-5 scale based on wave height and period.
 */
function rateSurfConditions(waveHeight: number, wavePeriod: number | null | undefined): string {
  if (waveHeight < 0.3) return 'Flat (1/5)';
  const period = wavePeriod ?? 5;
  if (waveHeight >= 1.0 && waveHeight <= 2.5 && period >= 8) return 'Great (5/5)';
  if (waveHeight >= 0.8 && waveHeight <= 3.0 && period >= 6) return 'Good (4/5)';
  if (waveHeight >= 0.5 && period >= 5) return 'Fair (3/5)';
  if (waveHeight < 0.8) return 'Poor (2/5)';
  return 'Dangerous (1/5)';
}

/**
 * Estimates tidal phase from hourly wave height data.
 * Finds local peaks and troughs as approximate high/low tide times.
 */
function estimateTidesFromWaveData(
  times: string[],
  waveHeights: (number | null)[]
): { nextHigh: string; nextLow: string; tideTrend: string } | null {
  if (!times || !waveHeights || waveHeights.length < 6) return null;

  const peaks: Array<{ index: number; height: number; type: 'high' | 'low' }> = [];

  for (let i = 1; i < waveHeights.length - 1; i++) {
    const prev = waveHeights[i - 1];
    const curr = waveHeights[i];
    const next = waveHeights[i + 1];
    if (curr === null || prev === null || next === null) continue;

    if (curr > prev && curr > next) {
      peaks.push({ index: i, height: curr, type: 'high' });
    } else if (curr < prev && curr < next) {
      peaks.push({ index: i, height: curr, type: 'low' });
    }
  }

  if (peaks.length === 0) return null;

  const now = new Date();
  const currentHourIndex = now.getHours();

  const futureHighs = peaks.filter(p => p.type === 'high' && p.index >= currentHourIndex);
  const futureLows = peaks.filter(p => p.type === 'low' && p.index >= currentHourIndex);

  const formatTideTime = (iso: string, height: number): string => {
    try {
      const parts = iso.split('T');
      if (!parts[1]) return iso;
      const [h, m] = parts[1].split(':');
      let hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12;
      if (hour === 0) hour = 12;
      return `${hour}:${m} ${ampm} (${height.toFixed(1)}m)`;
    } catch {
      return iso;
    }
  };

  const nextHigh = futureHighs.length > 0
    ? formatTideTime(times[futureHighs[0].index], futureHighs[0].height)
    : peaks.filter(p => p.type === 'high').length > 0
      ? formatTideTime(times[peaks.filter(p => p.type === 'high')[0].index], peaks.filter(p => p.type === 'high')[0].height)
      : 'Data unavailable';

  const nextLow = futureLows.length > 0
    ? formatTideTime(times[futureLows[0].index], futureLows[0].height)
    : peaks.filter(p => p.type === 'low').length > 0
      ? formatTideTime(times[peaks.filter(p => p.type === 'low')[0].index], peaks.filter(p => p.type === 'low')[0].height)
      : 'Data unavailable';

  // Determine current trend
  let tideTrend = 'Stable';
  if (currentHourIndex > 0 && currentHourIndex < waveHeights.length) {
    const currentH = waveHeights[currentHourIndex];
    const prevH = waveHeights[currentHourIndex - 1];
    if (currentH !== null && prevH !== null) {
      if (currentH > prevH + 0.05) tideTrend = 'Rising';
      else if (currentH < prevH - 0.05) tideTrend = 'Falling';
    }
  }

  return { nextHigh, nextLow, tideTrend };
}

// ==========================================
// 4. TRANSFORMER: RAW TO NORMALIZED
// ==========================================

export function normalizeWeatherData(
  forecast: OpenMeteoForecastResponse,
  airQuality?: OpenMeteoAirQualityResponse | null,
  marine?: OpenMeteoMarineResponse | null
): NormalizedWeatherData {
  const safeCurrent = forecast?.current ?? {
    temperature_2m: 22,
    relative_humidity_2m: 50,
    apparent_temperature: 22,
    is_day: 1,
    precipitation: 0,
    weather_code: 0,
    wind_speed_10m: 10,
    wind_direction_10m: 180,
  };
  const current = {
    temperature_2m: Number.isFinite(safeCurrent.temperature_2m) ? safeCurrent.temperature_2m : 22,
    relative_humidity_2m: Number.isFinite(safeCurrent.relative_humidity_2m) ? safeCurrent.relative_humidity_2m : 50,
    apparent_temperature: Number.isFinite(safeCurrent.apparent_temperature) ? safeCurrent.apparent_temperature : 22,
    is_day: safeCurrent.is_day ?? 1,
    precipitation: Number.isFinite(safeCurrent.precipitation) ? safeCurrent.precipitation : 0,
    weather_code: Number.isFinite(safeCurrent.weather_code) ? safeCurrent.weather_code : 0,
    wind_speed_10m: Number.isFinite(safeCurrent.wind_speed_10m) ? safeCurrent.wind_speed_10m : 10,
    wind_direction_10m: Number.isFinite(safeCurrent.wind_direction_10m) ? safeCurrent.wind_direction_10m : 180,
  };
  const daily = forecast?.daily ?? ({} as any);
  const hourly = forecast?.hourly ?? ({} as any);

  const currentCondition = mapWeatherCode(current.weather_code, current.is_day !== 0);

  // High / Low for today
  const rawHigh = daily?.temperature_2m_max?.[0];
  const rawLow = daily?.temperature_2m_min?.[0];
  const todayHigh = Math.round(Number.isFinite(rawHigh) ? rawHigh : current.temperature_2m);
  const todayLow = Math.round(Number.isFinite(rawLow) ? rawLow : (current.temperature_2m - 4));

  // Current summary
  const currentSummary: CurrentSummaryData = {
    temp: Math.round(current.temperature_2m),
    high: todayHigh,
    low: todayLow,
    desc: currentCondition.condition,
    iconName: currentCondition.iconName,
    humidity: Math.round(current.relative_humidity_2m),
    windSpeed: Math.round(current.wind_speed_10m),
    windDirection: degreesToCompass(current.wind_direction_10m),
    feelsLike: Math.round(current.apparent_temperature),
  };

  // AQI
  const usAqi = airQuality?.current?.us_aqi ?? 75;
  const pm25Val = airQuality?.current?.pm2_5 ?? 24.5;
  const pm10Val = airQuality?.current?.pm10 ?? 48.0;
  let aqiStatus = 'Moderate';
  let aqiAdvisory = 'Air quality is acceptable for outdoor activity.';
  if (usAqi <= 50) {
    aqiStatus = 'Good';
    aqiAdvisory = 'Air quality is satisfactory and poses little or no risk.';
  } else if (usAqi <= 100) {
    aqiStatus = 'Moderate';
    aqiAdvisory = 'Sensitive groups should reduce prolonged outdoor exertion.';
  } else if (usAqi <= 150) {
    aqiStatus = 'Unhealthy for Sensitive Groups';
    aqiAdvisory = 'Members of sensitive groups may experience health effects.';
  } else {
    aqiStatus = 'Unhealthy';
    aqiAdvisory = 'Everyone may begin to experience health effects; limit outdoors.';
  }

  const aqiCard: AqiData = {
    aqi: Math.round(usAqi),
    pm25: Number(pm25Val.toFixed(1)),
    pm10: Number(pm10Val.toFixed(1)),
    status: aqiStatus,
    dominantPollutant: pm25Val * 2 > pm10Val ? 'PM2.5' : 'PM10',
    advisory: aqiAdvisory,
  };

  // UV Index
  const rawUv = daily?.uv_index_max?.[0] ?? 6.5;
  const uvVal = Number(rawUv.toFixed(1));
  let uvLevel = 'Moderate';
  let uvTip = 'Wear sunglasses and apply sunscreen for prolonged outdoor exposure.';
  if (uvVal < 3) {
    uvLevel = 'Low';
    uvTip = 'Minimal sun protection required for most outdoor activities.';
  } else if (uvVal < 6) {
    uvLevel = 'Moderate';
    uvTip = 'Seek shade during midday; wear sunglasses and SPF 30+.';
  } else if (uvVal < 8) {
    uvLevel = 'Very High';
    uvTip = 'Wear SPF 30+, sunglasses and a wide-brim hat. Reduce midday sun.';
  } else {
    uvLevel = 'Extreme';
    uvTip = 'Take full precautions. Unprotected skin burns in under 15 minutes.';
  }

  const uvIndex: UvIndexData = {
    uvIndex: uvVal,
    level: uvLevel,
    peakTime: '11:30 AM - 2:30 PM',
    protectionTip: uvTip,
    safeMinutesWithoutBurn: uvVal > 8 ? 15 : uvVal > 5 ? 25 : 45,
  };

  // Rain timeline (next 6 hourly intervals from current hour)
  const nowHourIndex = Math.max(
    0,
    hourly?.time?.findIndex((t) => new Date(t).getTime() >= Date.now() - 30 * 60 * 1000) ?? 0
  );
  const timelineSlots: RainTimelineSlot[] = [];
  let rainSummary = 'Dry conditions expected over the next 6 hours.';
  let maxProb = 0;
  let maxHour = '';

  for (let i = nowHourIndex; i < nowHourIndex + 6 && i < (hourly?.time?.length ?? 0); i++) {
    const prob = Math.round(hourly.precipitation_probability[i] ?? 0);
    const mm = Number((hourly.precipitation[i] ?? 0).toFixed(1));
    const timeStr = formatHourShort(hourly.time[i]);
    timelineSlots.push({ time: timeStr, prob, mm });
    if (prob > maxProb) {
      maxProb = prob;
      maxHour = timeStr;
    }
  }

  if (maxProb > 50) {
    rainSummary = `High rain probability (${maxProb}%) expected around ${maxHour}.`;
  } else if (maxProb >= 20) {
    rainSummary = `${maxProb}% chance of passing rain showers around ${maxHour}.`;
  } else {
    rainSummary = 'Minimal rain risk across the next 6-hour commute window.';
  }

  const rainTimeline: RainTimelineData = {
    summary: rainSummary,
    timeline: timelineSlots.length > 0 ? timelineSlots : [
      { time: '1 PM', prob: 5, mm: 0 },
      { time: '2 PM', prob: 10, mm: 0 },
      { time: '3 PM', prob: 15, mm: 0 },
      { time: '4 PM', prob: 20, mm: 0.1 },
      { time: '5 PM', prob: 25, mm: 0.2 },
      { time: '6 PM', prob: 15, mm: 0 },
    ],
  };

  // 24-Hour Continuous Hourly Forecast Strip
  const hourlyItems: HourlyForecastItem[] = [];
  const totalHourlyPoints = hourly?.time?.length ?? 0;
  for (let i = nowHourIndex; i < nowHourIndex + 24 && i < totalHourlyPoints; i++) {
    const rawTime = hourly.time[i];
    const dateObj = new Date(rawTime);
    const h = dateObj.getHours();
    const isNow = i === nowHourIndex;
    const timeLabel = isNow ? 'Now' : formatHourShort(rawTime);
    const itemTemp = Math.round(hourly.temperature_2m[i] ?? current.temperature_2m);
    const itemProb = Math.round(hourly.precipitation_probability?.[i] ?? 0);
    const itemCode = hourly.weather_code?.[i] ?? current.weather_code;
    const isItemDay = h >= 6 && h < 19;
    const condInfo = mapWeatherCode(itemCode, isItemDay);

    hourlyItems.push({
      time: timeLabel,
      hour: h,
      temp: itemTemp,
      precipProb: itemProb,
      condition: condInfo.condition,
      iconName: condInfo.iconName,
      isCurrentHour: isNow,
    });
  }

  // Fallback if hourly array empty
  if (hourlyItems.length === 0) {
    const baseHour = new Date().getHours();
    for (let offset = 0; offset < 24; offset++) {
      const h = (baseHour + offset) % 24;
      const hourStr = offset === 0 ? 'Now' : (h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`);
      hourlyItems.push({
        time: hourStr,
        hour: h,
        temp: Math.round(current.temperature_2m + Math.sin(offset / 3.5) * 3),
        precipProb: offset === 3 ? 35 : offset === 4 ? 20 : 0,
        condition: currentCondition.condition,
        iconName: currentCondition.iconName,
        isCurrentHour: offset === 0,
      });
    }
  }

  const hourlyForecast: HourlyForecastData = {
    summary: maxProb > 30 ? `Precipitation chance around ${maxHour}` : 'Clear conditions continuing through the evening',
    hours: hourlyItems,
  };

  // Extended forecast (5 days)
  const forecastDays: DailyForecastItem[] = [];
  const daysCount = Math.min(5, daily?.time?.length ?? 0);
  for (let d = 0; d < daysCount; d++) {
    const condInfo = mapWeatherCode(daily.weather_code[d] ?? 0, true);
    forecastDays.push({
      day: formatDayName(daily.time[d], d),
      high: Math.round(daily.temperature_2m_max[d] ?? 32),
      low: Math.round(daily.temperature_2m_min[d] ?? 24),
      cond: condInfo.condition,
      iconName: condInfo.iconName,
    });
  }

  const extendedForecast: ExtendedForecastData = {
    days: forecastDays,
  };

  // Sunrise / Sunset
  const rawSunrise = daily?.sunrise?.[0] ?? '2026-09-05T06:04';
  const rawSunset = daily?.sunset?.[0] ?? '2026-09-05T18:42';
  const sunriseStr = formatTime12h(rawSunrise);
  const sunsetStr = formatTime12h(rawSunset);

  let daylightDuration = '12h 38m';
  try {
    const riseMs = new Date(rawSunrise).getTime();
    const setMs = new Date(rawSunset).getTime();
    const diffMin = Math.round((setMs - riseMs) / (60 * 1000));
    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    daylightDuration = `${hours}h ${mins}m`;
  } catch {
    // default
  }

  const sunriseSunset: SunriseSunsetData = {
    sunrise: sunriseStr,
    sunset: sunsetStr,
    firstLight: sunriseStr ? sunriseStr.replace(/^[0-9]+/, (m) => String(Math.max(1, parseInt(m, 10) - 1))) : '05:30 AM',
    goldenHour: sunsetStr ? sunsetStr.replace(/^[0-9]+/, (m) => String(Math.max(1, parseInt(m, 10) - 1))) : '05:50 PM',
    daylightDuration,
  };

  // Comfort index (derived from temp, humidity, wind)
  const temp = current.temperature_2m;
  const humidity = current.relative_humidity_2m;
  let comfortScore = 80;
  let comfortCategory = 'Comfortable';
  let humidityImpact = 'Optimal atmospheric balance';
  let coolingTip = 'Comfortable outdoor conditions.';

  if (temp > 35 || (temp > 30 && humidity > 75)) {
    comfortScore = 55;
    comfortCategory = 'Hot & Humid';
    humidityImpact = 'Heavy moisture impedes evaporative cooling';
    coolingTip = 'Use AC or fans; stay hydrated.';
  } else if (temp > 30) {
    comfortScore = 70;
    comfortCategory = 'Warm';
    humidityImpact = 'Mild thermal warmth outdoors';
    coolingTip = 'Ceiling fans sufficient indoors.';
  } else if (temp < 15) {
    comfortScore = 65;
    comfortCategory = 'Chilly';
    humidityImpact = 'Cool breeze accelerates chill';
    coolingTip = 'Light jacket recommended.';
  } else {
    comfortScore = 90;
    comfortCategory = 'Optimal';
    humidityImpact = 'Breezy and pleasant';
    coolingTip = 'Ideal weather for outdoor walks.';
  }

  const comfortIndex: ComfortIndexData = {
    score: comfortScore,
    category: comfortCategory,
    humidityImpact,
    coolingTip,
  };

  // Best run hours (derived from hourly temperatures & rain)
  const morningTemp = Math.round(hourly?.temperature_2m?.[6] ?? (temp - 3));
  const eveningTemp = Math.round(hourly?.temperature_2m?.[19] ?? (temp - 1));
  const airScoreLabel = usAqi <= 50 ? 'Good' : usAqi <= 100 ? 'Moderate' : 'Unhealthy';

  const bestRunHours: BestRunHoursData = {
    hours: ['05:30 AM - 07:00 AM', '06:30 PM - 08:00 PM'],
    morningTemp,
    eveningTemp,
    airScore: airScoreLabel,
    comfortScore: Math.min(95, Math.max(50, 100 - Math.round(usAqi / 3))),
  };

  // Agricultural: Frost Alert
  const minUpcomingTemp = Math.min(...(daily?.temperature_2m_min?.slice(0, 3) ?? [20]));
  const frostAlert: FrostAlertData = {
    riskLevel: minUpcomingTemp <= 3 ? 'High' : minUpcomingTemp <= 6 ? 'Moderate' : 'None',
    minGroundTemp: Math.round(minUpcomingTemp - 2),
    frostWindow: minUpcomingTemp <= 4 ? 'Risk detected overnight' : 'No risk in next 72 hrs',
    cropSafetyTip: minUpcomingTemp <= 4
      ? 'Apply light night irrigation to preserve ground warmth.'
      : 'Normal open field irrigation recommended.',
  };

  // Agricultural: Rainfall Forecast (7-day sum)
  const sevenDayRain = daily?.precipitation_sum?.slice(0, 7).reduce((acc, v) => acc + (v || 0), 0) ?? 12.4;
  const rainfallForecast: RainfallForecastData = {
    districtPrediction: `${(sevenDayRain / 7).toFixed(1)} mm (Normal range)`,
    sevenDayTotal: `${sevenDayRain.toFixed(1)} mm`,
    soilMoistureStatus: sevenDayRain > 25 ? 'Surplus' : sevenDayRain > 5 ? 'Adequate' : 'Dry',
  };

  // Agricultural: Soil Moisture
  const soilMoisture: SoilMoistureData = {
    saturation: `${Math.min(92, Math.max(35, Math.round(50 + sevenDayRain * 1.2)))}%`,
    depth10cm: `Optimal (${Math.min(95, Math.max(40, Math.round(55 + sevenDayRain * 1.5)))}%)`,
    depth40cm: `Moist (${Math.min(90, Math.max(45, Math.round(60 + sevenDayRain * 0.8)))}%)`,
    recommendation: sevenDayRain > 20 ? 'Soil saturated; hold heavy machinery.' : 'Soil ready for top-dress fertilization.',
  };

  // Visibility / Fog
  const currentVisMeters = hourly?.visibility?.[nowHourIndex] ?? 8000;
  const visibilityKm = (currentVisMeters / 1000).toFixed(1);
  let fogStatus = 'Clear Visibility';
  let fogRisk = 'Low';
  let commuteImpact = 'No highway slowdowns reported.';

  if (currentVisMeters < 1000) {
    fogStatus = 'Dense Fog';
    fogRisk = 'Severe';
    commuteImpact = 'Major highway delays; use fog lights.';
  } else if (currentVisMeters < 3000) {
    fogStatus = 'Moderate Fog';
    fogRisk = 'Elevated';
    commuteImpact = 'Caution advised during early morning.';
  }

  const visibilityFog: VisibilityFogData = {
    visibility: `${visibilityKm} km`,
    status: fogStatus,
    fogRisk,
    commuteImpact,
  };

  // Pollen estimate
  const pollenEstimate: PollenData = {
    level: humidity > 80 ? 'Low' : 'Moderate',
    treePollen: 'Low',
    grassPollen: humidity > 80 ? 'Low' : 'Moderate',
    ragweed: 'Low',
    tip: 'Pollen counts low after recent atmospheric moisture.',
  };

  // Marine (Sea state & Tides) — Live from Open-Meteo Marine API
  const marineCurrent = marine?.current;
  const hasMarineData = marineCurrent?.wave_height !== null && marineCurrent?.wave_height !== undefined;

  const seaState: SeaStateData = hasMarineData
    ? {
        waveHeight: `${marineCurrent!.wave_height!.toFixed(1)} m`,
        swellPeriod: marineCurrent!.swell_wave_period
          ? `${marineCurrent!.swell_wave_period.toFixed(1)} sec`
          : marineCurrent!.wave_period
            ? `${marineCurrent!.wave_period.toFixed(1)} sec`
            : 'N/A',
        seaCondition: classifySeaState(marineCurrent!.wave_height!),
        waterTemp: Math.round(temp - 3), // Estimated — marine API doesn't provide SST
        surfRating: rateSurfConditions(marineCurrent!.wave_height!, marineCurrent!.wave_period),
      }
    : {
        waveHeight: 'N/A',
        swellPeriod: 'N/A',
        seaCondition: 'Inland Location',
        waterTemp: 0,
        surfRating: 'N/A',
      };

  // Tide estimation from hourly marine wave height variations
  const marineHourly = marine?.hourly;
  const tideEstimate = hasMarineData && marineHourly
    ? estimateTidesFromWaveData(marineHourly.time, marineHourly.wave_height)
    : null;

  const tideTimes: TideTimesData = tideEstimate
    ? {
        station: 'Marine Observation Point',
        nextHigh: tideEstimate.nextHigh,
        nextLow: tideEstimate.nextLow,
        tideTrend: tideEstimate.tideTrend,
      }
    : {
        station: 'Unavailable',
        nextHigh: 'N/A',
        nextLow: 'N/A',
        tideTrend: 'N/A',
      };

  // Travel widgets
  const destinationWeather: DestinationWeatherData = {
    savedCities: [
      { name: 'Bengaluru', temp: 23, cond: 'Passing Rain' },
      { name: 'Goa', temp: 29, cond: 'Tropical Breeze' },
    ],
    alertCount: 0,
  };

  const packingTip: PackingTipData = {
    recommendations: [
      'Light breathable cottons for daytime',
      'Compact umbrella for scattered showers',
      'UV sunglasses & sunscreen',
    ],
  };

  // School commute
  const schoolCommute: SchoolCommuteData = {
    window: '07:30 AM - 08:45 AM',
    temp: Math.round(hourly?.temperature_2m?.[7] ?? (temp - 2)),
    rainChance: `${Math.round(hourly?.precipitation_probability?.[7] ?? 10)}%`,
    status: (hourly?.precipitation_probability?.[7] ?? 0) > 40 ? 'Wet Commute' : 'Clear Commute',
    advisory: (hourly?.precipitation_probability?.[7] ?? 0) > 40
      ? 'Carry an umbrella for school drop-off.'
      : 'Smooth morning commute expected.',
  };

  return {
    current_summary: currentSummary,
    hourly_forecast: hourlyForecast,
    aqi_card: aqiCard,
    uv_index: uvIndex,
    rain_timeline: rainTimeline,
    extended_forecast: extendedForecast,
    sunrise_sunset: sunriseSunset,
    comfort_index: comfortIndex,
    best_run_hours: bestRunHours,
    frost_alert: frostAlert,
    rainfall_forecast: rainfallForecast,
    soil_moisture: soilMoisture,
    visibility_fog: visibilityFog,
    pollen_estimate: pollenEstimate,
    sea_state: seaState,
    tide_times: tideTimes,
    destination_weather: destinationWeather,
    packing_tip: packingTip,
    school_commute: schoolCommute,
  };
}

// ==========================================
// 5. CACHED & DEDUPLICATED WEATHER SERVICE
// ==========================================

const inMemoryCache = new Map<string, { data: NormalizedWeatherData; timestamp: number }>();
const inFlightRequests = new Map<string, Promise<NormalizedWeatherData>>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function sanitizeCoordinates(lat: number, lon: number): { safeLat: number; safeLon: number } {
  const safeLat = typeof lat === 'number' && Number.isFinite(lat) ? Math.max(-90, Math.min(90, lat)) : 28.61;
  const safeLon = typeof lon === 'number' && Number.isFinite(lon) ? Math.max(-180, Math.min(180, lon)) : 77.20;
  return { safeLat, safeLon };
}

function getCoordinateKey(lat: number, lon: number): string {
  const { safeLat, safeLon } = sanitizeCoordinates(lat, lon);
  return `weather_${safeLat.toFixed(2)}_${safeLon.toFixed(2)}`;
}

/**
 * Checks for existing cached weather data for the specified coordinates.
 * Returns null if no cache is found.
 */
export async function getCachedWeather(
  lat: number,
  lon: number
): Promise<{ data: NormalizedWeatherData; isExpired: boolean } | null> {
  const { safeLat, safeLon } = sanitizeCoordinates(lat, lon);
  const key = getCoordinateKey(safeLat, safeLon);

  // 1. Check in-memory cache
  const memoryCached = inMemoryCache.get(key);
  if (memoryCached) {
    const isExpired = Date.now() - memoryCached.timestamp > CACHE_TTL_MS;
    return { data: memoryCached.data, isExpired };
  }

  // 2. Check persistent AsyncStorage cache
  const diskCached = await getCachedData<NormalizedWeatherData>(key);
  if (diskCached) {
    // Populate in-memory cache for instant subsequent widget renders
    inMemoryCache.set(key, { data: diskCached.data, timestamp: Date.now() - (diskCached.isExpired ? CACHE_TTL_MS + 1000 : 0) });
    return diskCached;
  }

  return null;
}

/**
 * Fetches live weather, air-quality, and marine data for given coordinates.
 * - Routes through Supabase Edge Functions when configured, falls back to direct Open-Meteo.
 * - Deduplicates concurrent requests from multiple widgets.
 * - Checks in-memory and AsyncStorage caches (10-minute TTL).
 * - Supports forceRefresh to bypass valid memory caches during manual refresh or revalidation.
 * - Normalizes data for all 18 widgets including live marine data.
 */
export async function getWeatherData(
  lat: number,
  lon: number,
  options?: { forceRefresh?: boolean }
): Promise<NormalizedWeatherData> {
  const { safeLat, safeLon } = sanitizeCoordinates(lat, lon);
  const key = getCoordinateKey(safeLat, safeLon);

  // 1. Check in-memory session cache (unless forceRefresh requested)
  if (!options?.forceRefresh) {
    const memoryCached = inMemoryCache.get(key);
    if (memoryCached && Date.now() - memoryCached.timestamp < CACHE_TTL_MS) {
      return memoryCached.data;
    }
  }

  // 2. Check if a request for these coordinates is already in-flight (avoids 18 concurrent requests)
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key)!;
  }

  // 3. Initiate the request with deduplication
  const fetchPromise = (async () => {
    try {
      const edgeBase = getEdgeFunctionBaseUrl();

      let forecastJson!: OpenMeteoForecastResponse;
      let aqiJson: OpenMeteoAirQualityResponse | null = null;
      let marineJson: OpenMeteoMarineResponse | null = null;

      let edgeSuccess = false;

      if (edgeBase) {
        try {
          // ── Route through Supabase Edge Functions ──
          const [forecastRes, aqiRes, marineRes] = await Promise.all([
            fetch(`${edgeBase}/weather?lat=${lat}&lon=${lon}`),
            fetch(`${edgeBase}/aqi?lat=${lat}&lon=${lon}`).catch(() => null),
            fetch(`${edgeBase}/sea?lat=${lat}&lon=${lon}`).catch(() => null),
          ]);

          if (forecastRes && forecastRes.ok) {
            // Edge Functions return the same shape as Open-Meteo (TRD §6)
            const weatherData = await forecastRes.json();
            forecastJson = {
              latitude: weatherData.metadata?.latitude ?? lat,
              longitude: weatherData.metadata?.longitude ?? lon,
              timezone: weatherData.metadata?.timezone ?? 'auto',
              current: weatherData.current,
              hourly: weatherData.hourly,
              daily: weatherData.daily,
            };

            if (aqiRes && aqiRes.ok) {
              const aqiData = await aqiRes.json();
              aqiJson = {
                latitude: aqiData.metadata?.latitude ?? lat,
                longitude: aqiData.metadata?.longitude ?? lon,
                current: {
                  time: new Date().toISOString(),
                  pm10: aqiData.pm10 ?? 0,
                  pm2_5: aqiData.pm25 ?? 0,
                  european_aqi: aqiData.aqi ?? 0,
                  us_aqi: aqiData.aqi ?? 0,
                },
              };
            }

            if (marineRes && marineRes.ok) {
              const seaData = await marineRes.json();
              if (seaData.status !== 'unavailable') {
                // Parse Edge Function marine response back to raw marine shape
                marineJson = {
                  latitude: seaData.metadata?.latitude ?? lat,
                  longitude: seaData.metadata?.longitude ?? lon,
                  current: {
                    time: new Date().toISOString(),
                    wave_height: seaData.waveHeight ? parseFloat(seaData.waveHeight) : null,
                    wave_direction: null,
                    wave_period: seaData.wavePeriod ? parseFloat(seaData.wavePeriod) : null,
                    swell_wave_height: seaData.swellHeight ? parseFloat(seaData.swellHeight) : null,
                    swell_wave_period: seaData.swellPeriod ? parseFloat(seaData.swellPeriod) : null,
                  },
                };
              }
            }

            edgeSuccess = true;
          }
        } catch {
          // Edge function unavailable or errored; transparently fall through to Open-Meteo
        }
      }

      if (!edgeSuccess) {
        // ── Direct Open-Meteo calls (primary / resilient fallback) ──
        const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum&timezone=auto`;
        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,european_aqi,us_aqi&timezone=auto`;
        const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_period&hourly=wave_height,wave_direction,wave_period&forecast_days=2`;

        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 10000);

        try {
          const [forecastRes, aqiRes, marineRes] = await Promise.all([
            fetch(forecastUrl, { signal: abortController.signal }),
            fetch(aqiUrl, { signal: abortController.signal }).catch(() => null),
            fetch(marineUrl, { signal: abortController.signal }).catch(() => null),
          ]);

          if (!forecastRes.ok) {
            throw new Error(`Open-Meteo request failed: ${forecastRes.status}`);
          }

          forecastJson = await forecastRes.json();
          aqiJson = aqiRes && aqiRes.ok ? await aqiRes.json() : null;
          marineJson = marineRes && marineRes.ok ? await marineRes.json() : null;
        } finally {
          clearTimeout(timeoutId);
        }
      }

      const normalized = normalizeWeatherData(forecastJson, aqiJson, marineJson);

      // Save to memory cache
      inMemoryCache.set(key, { data: normalized, timestamp: Date.now() });

      // Save to persistent AsyncStorage cache
      setCachedData(key, normalized, CACHE_TTL_MS);

      return normalized;
    } catch (err) {
      // If network fails, check persistent cache
      const cached = await getCachedData<NormalizedWeatherData>(key);
      if (cached?.data) {
        return cached.data;
      }
      throw err;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, fetchPromise);
  return fetchPromise;
}
