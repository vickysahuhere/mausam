/**
 * Supabase Edge Function: /functions/v1/sea
 * 
 * Proxies Open-Meteo Marine API with server-side caching.
 * Returns { tideTimes[], waveHeight, seaState } per TRD §6.
 * 
 * Architecture note: This function is designed as a provider abstraction.
 * Currently uses Open-Meteo Marine API. Can be extended to add INCOIS
 * as a secondary provider when a stable API becomes available.
 * 
 * Inland coordinates gracefully return null marine data with a status message.
 */
import {
  getServerCache,
  setServerCache,
  coordKey,
  parseCoordinates,
  corsHeaders,
  handleCorsPreFlight,
} from '../_shared/cache.ts';

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes (marine data changes slowly)

/**
 * Converts wave direction degrees (0-360) to cardinal compass description.
 */
function waveDirectionToText(deg: number | null): string {
  if (deg === null || deg === undefined) return 'Unknown';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((deg % 360) / 45)) % 8;
  return directions[index];
}

/**
 * Classifies sea condition based on wave height (Douglas scale simplified).
 */
function classifySeaCondition(waveHeight: number | null): string {
  if (waveHeight === null || waveHeight === undefined) return 'Unknown';
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
function rateSurf(waveHeight: number | null, wavePeriod: number | null): string {
  if (waveHeight === null || waveHeight === undefined) return 'N/A';
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
 * This is an approximation — real tidal data requires harmonic analysis.
 * Returns estimated tide schedule based on wave height variations.
 */
function estimateTides(
  hourlyTimes: string[] | undefined,
  hourlyWaveHeights: number[] | undefined
): { nextHigh: string; nextLow: string; tideTrend: string; tideEntries: Array<{ time: string; type: string; height: string }> } {
  if (!hourlyTimes || !hourlyWaveHeights || hourlyWaveHeights.length < 6) {
    return {
      nextHigh: 'Data unavailable',
      nextLow: 'Data unavailable',
      tideTrend: 'Unknown',
      tideEntries: [],
    };
  }

  // Find local maxima and minima in wave height as tide proxies
  const peaks: Array<{ index: number; height: number; type: 'high' | 'low' }> = [];

  for (let i = 1; i < hourlyWaveHeights.length - 1; i++) {
    const prev = hourlyWaveHeights[i - 1];
    const curr = hourlyWaveHeights[i];
    const next = hourlyWaveHeights[i + 1];
    if (curr === null || prev === null || next === null) continue;

    if (curr > prev && curr > next) {
      peaks.push({ index: i, height: curr, type: 'high' });
    } else if (curr < prev && curr < next) {
      peaks.push({ index: i, height: curr, type: 'low' });
    }
  }

  const formatTime = (isoStr: string): string => {
    try {
      const parts = isoStr.split('T');
      if (!parts[1]) return isoStr;
      const [h, m] = parts[1].split(':');
      let hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12;
      if (hour === 0) hour = 12;
      return `${hour}:${m} ${ampm}`;
    } catch {
      return isoStr;
    }
  };

  const now = new Date();
  const currentHourIndex = now.getUTCHours();

  // Find next high and low from current hour
  const futureHighs = peaks.filter(p => p.type === 'high' && p.index >= currentHourIndex);
  const futureLows = peaks.filter(p => p.type === 'low' && p.index >= currentHourIndex);

  const nextHigh = futureHighs.length > 0
    ? `${formatTime(hourlyTimes[futureHighs[0].index])} (${futureHighs[0].height.toFixed(1)}m)`
    : peaks.filter(p => p.type === 'high').length > 0
      ? `${formatTime(hourlyTimes[peaks.filter(p => p.type === 'high')[0].index])} (${peaks.filter(p => p.type === 'high')[0].height.toFixed(1)}m)`
      : 'Data unavailable';

  const nextLow = futureLows.length > 0
    ? `${formatTime(hourlyTimes[futureLows[0].index])} (${futureLows[0].height.toFixed(1)}m)`
    : peaks.filter(p => p.type === 'low').length > 0
      ? `${formatTime(hourlyTimes[peaks.filter(p => p.type === 'low')[0].index])} (${peaks.filter(p => p.type === 'low')[0].height.toFixed(1)}m)`
      : 'Data unavailable';

  // Determine current trend
  let tideTrend = 'Stable';
  if (currentHourIndex > 0 && currentHourIndex < hourlyWaveHeights.length) {
    const currentH = hourlyWaveHeights[currentHourIndex];
    const prevH = hourlyWaveHeights[currentHourIndex - 1];
    if (currentH !== null && prevH !== null) {
      if (currentH > prevH + 0.05) tideTrend = 'Rising';
      else if (currentH < prevH - 0.05) tideTrend = 'Falling';
    }
  }

  const tideEntries = peaks.slice(0, 6).map(p => ({
    time: formatTime(hourlyTimes[p.index]),
    type: p.type === 'high' ? 'High' : 'Low',
    height: `${p.height.toFixed(1)}m`,
  }));

  return { nextHigh, nextLow, tideTrend, tideEntries };
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
    const cacheKey = coordKey('sea', lat, lon);

    // Check server-side cache
    const cached = getServerCache<object>(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: { ...corsHeaders(), 'X-Cache': 'HIT' },
      });
    }

    // Fetch from Open-Meteo Marine API
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_period,ocean_current_velocity,ocean_current_direction&hourly=wave_height,wave_direction,wave_period&forecast_days=2`;

    const response = await fetch(marineUrl);
    if (!response.ok) {
      throw new Error(`Open-Meteo Marine API returned ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;

    // Check if this is an inland location (all current values are null)
    const isInland = current?.wave_height === null &&
                     current?.wave_direction === null &&
                     current?.wave_period === null;

    let result;

    if (isInland) {
      result = {
        waveHeight: null,
        seaState: null,
        tideTimes: [],
        status: 'unavailable',
        message: 'Marine data unavailable for inland locations',
        metadata: {
          latitude: data.latitude,
          longitude: data.longitude,
          provider: 'open-meteo-marine',
          cached: false,
        },
      };
    } else {
      const tideEstimate = estimateTides(data.hourly?.time, data.hourly?.wave_height);

      result = {
        waveHeight: current?.wave_height ? `${current.wave_height.toFixed(1)} m` : null,
        waveDirection: waveDirectionToText(current?.wave_direction),
        wavePeriod: current?.wave_period ? `${current.wave_period.toFixed(1)} sec` : null,
        swellHeight: current?.swell_wave_height ? `${current.swell_wave_height.toFixed(1)} m` : null,
        swellPeriod: current?.swell_wave_period ? `${current.swell_wave_period.toFixed(1)} sec` : null,
        seaState: classifySeaCondition(current?.wave_height),
        surfRating: rateSurf(current?.wave_height, current?.wave_period),
        oceanCurrent: current?.ocean_current_velocity
          ? `${current.ocean_current_velocity.toFixed(1)} km/h ${waveDirectionToText(current.ocean_current_direction)}`
          : null,
        tideTimes: tideEstimate.tideEntries,
        nextHigh: tideEstimate.nextHigh,
        nextLow: tideEstimate.nextLow,
        tideTrend: tideEstimate.tideTrend,
        status: 'available',
        metadata: {
          latitude: data.latitude,
          longitude: data.longitude,
          provider: 'open-meteo-marine',
          cached: false,
        },
      };
    }

    // Cache server-side
    setServerCache(cacheKey, result, CACHE_TTL_MS);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders(), 'X-Cache': 'MISS' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[sea] Error:', message);
    return new Response(
      JSON.stringify({ error: 'Marine service temporarily unavailable', status: 'error' }),
      { status: 502, headers: corsHeaders() }
    );
  }
});
