/**
 * Supabase Edge Function: /functions/v1/alerts
 * 
 * Derives weather alerts from atmospheric data with server-side caching.
 * Returns { activeAlerts: [{ severity, type, message, validUntil }] } per TRD §6.
 * 
 * Alert derivation mirrors the client-side alertService.ts logic but runs server-side
 * for consistency and reduced client computation.
 */
import {
  getServerCache,
  setServerCache,
  coordKey,
  parseCoordinates,
  corsHeaders,
  handleCorsPreFlight,
} from '../_shared/cache.ts';

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface AlertItem {
  severity: 'yellow' | 'orange' | 'red' | 'advisory';
  type: string;
  message: string;
  validUntil: string;
  agency: string;
}

/**
 * Maps WMO weather codes to human-readable descriptions.
 */
function describeWeatherCode(code: number): string {
  const map: Record<number, string> = {
    0: 'Clear Sky', 1: 'Mainly Sunny', 2: 'Partly Cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Foggy', 51: 'Light Drizzle', 53: 'Moderate Drizzle',
    55: 'Dense Drizzle', 61: 'Light Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
    80: 'Passing Showers', 81: 'Moderate Showers', 82: 'Violent Showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with Hail', 99: 'Thunderstorm with Hail',
  };
  return map[code] ?? 'Partly Cloudy';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreFlight();
  }

  try {
    const url = new URL(req.url);
    const coords = parseCoordinates(url);
    if (coords instanceof Response) return coords;

    const { lat, lon } = coords;
    const district = url.searchParams.get('district') ?? 'District';
    const cacheKey = coordKey('alerts', lat, lon);

    // Check server-side cache
    const cached = getServerCache<object>(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: { ...corsHeaders(), 'X-Cache': 'HIT' },
      });
    }

    // Fetch weather + AQI data to derive alerts
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=visibility,precipitation_probability&daily=precipitation_sum&timezone=auto`;
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,us_aqi&timezone=auto`;

    const [forecastRes, aqiRes] = await Promise.all([
      fetch(forecastUrl),
      fetch(aqiUrl).catch(() => null),
    ]);

    if (!forecastRes.ok) {
      throw new Error(`Open-Meteo returned ${forecastRes.status}`);
    }

    const forecast = await forecastRes.json();
    const aqiData = aqiRes && aqiRes.ok ? await aqiRes.json() : null;

    const current = forecast.current;
    const temp = current?.temperature_2m ?? 25;
    const weatherCode = current?.weather_code ?? 0;
    const windSpeed = current?.wind_speed_10m ?? 0;
    const desc = describeWeatherCode(weatherCode);
    const usAqi = aqiData?.current?.us_aqi ?? 0;
    const pm25 = aqiData?.current?.pm2_5 ?? 0;
    const visibility = forecast.hourly?.visibility?.[0] ?? 10000;
    const visibilityKm = visibility / 1000;
    const dailyPrecipSum = forecast.daily?.precipitation_sum ?? [];
    const totalRainMm = dailyPrecipSum.reduce((sum: number, v: number) => sum + (v || 0), 0);

    const now = new Date();
    const validUntil6h = new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();
    const validUntil24h = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const alerts: AlertItem[] = [];

    // Thunderstorm / Hail
    if (desc.toLowerCase().includes('hail')) {
      alerts.push({
        severity: 'red',
        type: 'thunderstorm',
        message: `Severe thunderstorm & hail warning for ${district}. Damaging winds exceeding 50 km/h likely.`,
        validUntil: validUntil6h,
        agency: 'IMD Regional Meteorological Centre',
      });
    } else if (desc.toLowerCase().includes('thunderstorm')) {
      alerts.push({
        severity: 'orange',
        type: 'thunderstorm',
        message: `Thunderstorm & lightning warning for ${district}. Localized waterlogging expected.`,
        validUntil: validUntil6h,
        agency: 'IMD Nowcast Meteorological Cell',
      });
    }

    // Heavy rainfall
    if (totalRainMm > 50) {
      alerts.push({
        severity: 'orange',
        type: 'heavy_rain',
        message: `Heavy rainfall alert: cumulative precipitation exceeds ${Math.round(totalRainMm)} mm for ${district}.`,
        validUntil: validUntil24h,
        agency: 'State Disaster Management Authority',
      });
    }

    // Air quality
    if (usAqi >= 300) {
      alerts.push({
        severity: 'red',
        type: 'air_quality',
        message: `Severe air quality emergency. PM2.5 at ${pm25} µg/m³ in ${district}.`,
        validUntil: validUntil24h,
        agency: 'Central Pollution Control Board (CPCB)',
      });
    } else if (usAqi >= 200) {
      alerts.push({
        severity: 'orange',
        type: 'air_quality',
        message: `Unhealthy air quality advisory. US AQI ${usAqi} in ${district}.`,
        validUntil: validUntil24h,
        agency: 'CPCB',
      });
    } else if (usAqi >= 150) {
      alerts.push({
        severity: 'yellow',
        type: 'air_quality',
        message: `Poor air quality advisory. US AQI ${usAqi} in ${district}.`,
        validUntil: validUntil24h,
        agency: 'CPCB / Environmental Pollution Authority',
      });
    }

    // Dense fog
    if (visibilityKm < 1) {
      alerts.push({
        severity: 'yellow',
        type: 'fog',
        message: `Dense fog warning. Visibility reduced to ${visibilityKm.toFixed(1)} km in ${district}.`,
        validUntil: validUntil6h,
        agency: 'IMD Highway Weather Division',
      });
    }

    // Heatwave
    if (temp >= 44) {
      alerts.push({
        severity: 'red',
        type: 'heatwave',
        message: `Severe heatwave red alert. Temperature ${temp}°C in ${district}.`,
        validUntil: validUntil6h,
        agency: 'IMD National Weather Forecasting Centre',
      });
    } else if (temp >= 40) {
      alerts.push({
        severity: 'orange',
        type: 'heatwave',
        message: `Heatwave warning. Temperature climbing to ${temp}°C in ${district}.`,
        validUntil: validUntil6h,
        agency: 'IMD National Weather Forecasting Centre',
      });
    }

    // High wind
    if (windSpeed >= 60) {
      alerts.push({
        severity: 'orange',
        type: 'high_wind',
        message: `High wind warning. Sustained winds ${Math.round(windSpeed)} km/h in ${district}.`,
        validUntil: validUntil6h,
        agency: 'IMD Cyclone Warning Division',
      });
    }

    const result = {
      activeAlerts: alerts,
      metadata: {
        totalAlerts: alerts.length,
        lastUpdated: now.toISOString(),
        cached: false,
      },
    };

    // Cache server-side
    setServerCache(cacheKey, result, CACHE_TTL_MS);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders(), 'X-Cache': 'MISS' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[alerts] Error:', message);
    return new Response(
      JSON.stringify({ error: 'Alert service temporarily unavailable', activeAlerts: [] }),
      { status: 502, headers: corsHeaders() }
    );
  }
});
