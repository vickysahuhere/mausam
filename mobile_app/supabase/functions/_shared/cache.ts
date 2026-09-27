/**
 * Shared server-side in-memory cache for Supabase Edge Functions.
 * Simple Map-based cache with TTL support.
 * 
 * Note: Deno Edge Function runtime is ephemeral — cache lives per-instance.
 * This reduces upstream API hits without requiring external KV storage.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Get a cached value by key. Returns null if not found or expired.
 */
export function getServerCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  const isExpired = Date.now() - entry.timestamp > entry.ttlMs;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

/**
 * Store a value in the server cache with a TTL.
 */
export function setServerCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, timestamp: Date.now(), ttlMs });
}

/**
 * Generate a coordinate-based cache key with 2-decimal precision.
 */
export function coordKey(prefix: string, lat: number, lon: number): string {
  return `${prefix}_${lat.toFixed(2)}_${lon.toFixed(2)}`;
}

// ==========================================
// Request Validation
// ==========================================

export interface CoordinateParams {
  lat: number;
  lon: number;
}

/**
 * Parse and validate lat/lon from URL search params.
 * Returns parsed coordinates or an error Response.
 */
export function parseCoordinates(url: URL): CoordinateParams | Response {
  const latStr = url.searchParams.get('lat');
  const lonStr = url.searchParams.get('lon');

  if (!latStr || !lonStr) {
    return new Response(
      JSON.stringify({ error: 'Missing required parameters: lat, lon' }),
      { status: 400, headers: corsHeaders() }
    );
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return new Response(
      JSON.stringify({ error: 'Invalid coordinates. lat must be -90..90, lon must be -180..180' }),
      { status: 400, headers: corsHeaders() }
    );
  }

  return { lat, lon };
}

// ==========================================
// CORS Headers
// ==========================================

/**
 * Standard CORS headers for Edge Function responses.
 */
export function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
    'Content-Type': 'application/json',
  };
}

/**
 * Handle CORS preflight OPTIONS request.
 */
export function handleCorsPreFlight(): Response {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
