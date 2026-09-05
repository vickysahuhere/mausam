/**
 * Supabase Edge Function: /functions/v1/aqi
 * 
 * Proxies Open-Meteo Air Quality API with server-side caching.
 * Returns normalized { aqi, pm25, pm10 } per TRD §6.
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
  if (req.method === 'OPTIONS') {
    return handleCorsPreFlight();
  }

  try {
    const url = new URL(req.url);
    const coords = parseCoordinates(url);
    if (coords instanceof Response) return coords;

    const { lat, lon } = coords;
    const cacheKey = coordKey('aqi', lat, lon);

    // Check server-side cache
    const cached = getServerCache<object>(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: { ...corsHeaders(), 'X-Cache': 'HIT' },
      });
    }

    // Fetch from Open-Meteo Air Quality API
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,european_aqi,us_aqi&timezone=auto`;

    const response = await fetch(aqiUrl);
    if (!response.ok) {
      throw new Error(`Open-Meteo AQI API returned ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;

    // Normalize to TRD §6 contract shape
    const normalized = {
      aqi: current?.us_aqi ?? current?.european_aqi ?? 0,
      pm25: current?.pm2_5 ?? 0,
      pm10: current?.pm10 ?? 0,
      metadata: {
        latitude: data.latitude,
        longitude: data.longitude,
        source: 'open-meteo',
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
    console.error('[aqi] Error:', message);
    return new Response(
      JSON.stringify({ error: 'Air quality service temporarily unavailable' }),
      { status: 502, headers: corsHeaders() }
    );
  }
});
