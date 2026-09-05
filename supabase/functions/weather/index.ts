/**
 * Supabase Edge Function: /functions/v1/weather
 * 
 * Proxies Open-Meteo Forecast API with server-side caching.
 * Returns normalized { current, hourly[], daily[] } per TRD §6.
 */
import {
  getServerCache,
  setServerCache,
  coordKey,
  parseCoordinates,
  corsHeaders,
  handleCorsPreFlight,
} from '../_shared/cache.ts';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreFlight();
  }

  try {
    const url = new URL(req.url);
    const coords = parseCoordinates(url);
    if (coords instanceof Response) return coords;

    const { lat, lon } = coords;
    const cacheKey = coordKey('weather', lat, lon);

    // Check server-side cache
    const cached = getServerCache<object>(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: { ...corsHeaders(), 'X-Cache': 'HIT' },
      });
    }

    // Fetch from Open-Meteo Forecast API
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum&timezone=auto`;

    const response = await fetch(forecastUrl);
    if (!response.ok) {
      throw new Error(`Open-Meteo forecast API returned ${response.status}`);
    }

    const data = await response.json();

    // Normalize to TRD §6 contract shape
    const normalized = {
      current: data.current,
      hourly: {
        time: data.hourly?.time ?? [],
        temperature_2m: data.hourly?.temperature_2m ?? [],
        relative_humidity_2m: data.hourly?.relative_humidity_2m ?? [],
        precipitation_probability: data.hourly?.precipitation_probability ?? [],
        precipitation: data.hourly?.precipitation ?? [],
        weather_code: data.hourly?.weather_code ?? [],
        visibility: data.hourly?.visibility ?? [],
      },
      daily: {
        time: data.daily?.time ?? [],
        weather_code: data.daily?.weather_code ?? [],
        temperature_2m_max: data.daily?.temperature_2m_max ?? [],
        temperature_2m_min: data.daily?.temperature_2m_min ?? [],
        sunrise: data.daily?.sunrise ?? [],
        sunset: data.daily?.sunset ?? [],
        uv_index_max: data.daily?.uv_index_max ?? [],
        precipitation_sum: data.daily?.precipitation_sum ?? [],
      },
      metadata: {
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        cached: false,
      },
    };

    // Cache server-side
    setServerCache(cacheKey, normalized, CACHE_TTL_MS);

    return new Response(JSON.stringify(normalized), {
      status: 200,
      headers: { ...corsHeaders(), 'X-Cache': 'MISS' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[weather] Error:', message);
    return new Response(
      JSON.stringify({ error: 'Weather service temporarily unavailable' }),
      { status: 502, headers: corsHeaders() }
    );
  }
});
