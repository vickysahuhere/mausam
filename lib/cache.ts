import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEnvelope<T> {
  timestamp: number;
  data: T;
  ttlMs: number;
}

const CACHE_PREFIX = 'mausam_cache_';

/**
 * Retrieves cached data for a key. Returns null if not found.
 * `isExpired` indicates whether the item has exceeded its TTL.
 */
export async function getCachedData<T>(
  key: string
): Promise<{ data: T; isExpired: boolean; timestamp: number; ageSeconds: number } | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const envelope: CacheEnvelope<T> = JSON.parse(raw);
    const ageSeconds = Math.max(0, Math.floor((Date.now() - envelope.timestamp) / 1000));
    const isExpired = Date.now() - envelope.timestamp > envelope.ttlMs;
    return { data: envelope.data, isExpired, timestamp: envelope.timestamp, ageSeconds };
  } catch {
    return null;
  }
}

/**
 * Stores data in AsyncStorage with an expiration timestamp.
 */
export async function setCachedData<T>(
  key: string,
  data: T,
  ttlMs: number = 10 * 60 * 1000
): Promise<void> {
  try {
    const envelope: CacheEnvelope<T> = {
      timestamp: Date.now(),
      data,
      ttlMs,
    };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(envelope));
  } catch {
    // Ignore storage write failures gracefully
  }
}

/**
 * Removes a specific cache entry.
 */
export async function clearCacheKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
  } catch {
    // Ignore
  }
}
