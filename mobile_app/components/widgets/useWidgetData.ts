import { useState, useEffect, useCallback } from 'react';
import { useLocationStore } from '../../store/useLocationStore';
import { getWeatherData, getCachedWeather, NormalizedWeatherData } from '../../lib/weatherService';

export interface WidgetDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isStale: boolean;
  isOffline: boolean;
  lastUpdated: number | null;
  cacheAgeSeconds: number;
  refresh: () => Promise<void>;
}

/**
 * Hook providing live weather data for any registered widget.
 * Implements Stale-While-Revalidate (SWR):
 * - Renders cached data immediately if available.
 * - Revalidates fresh telemetry in the background.
 * - Retains usable cached forecasts when offline.
 * - Deduplicates concurrent calls from multiple widgets.
 */
export function useWidgetData<T>(
  endpoint: keyof NormalizedWeatherData | string,
  locationId?: string | null
): WidgetDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [cacheAgeSeconds, setCacheAgeSeconds] = useState(0);

  const locations = useLocationStore((state) => state.locations);
  const activeLoc =
    locationId && locationId !== 'default'
      ? locations.find((l) => l.id === locationId)
      : locations.find((l) => l.isDefault) || locations[0];

  const lat = activeLoc?.lat ?? 28.6139;
  const lon = activeLoc?.lon ?? 77.209;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      let hasData = false;

      // 1. Immediately check cache (SWR initial step)
      try {
        const cached = await getCachedWeather(lat, lon);
        if (cancelled) return;
        if (cached?.data) {
          const slice = (cached.data as any)[endpoint];
          if (slice !== undefined) {
            setData(slice as T);
            setIsStale(cached.isExpired);
            setLastUpdated(cached.timestamp);
            setCacheAgeSeconds(cached.ageSeconds);
            setLoading(false);
            hasData = true;
          }
        }
      } catch {
        // Cache lookup non-blocking
      }

      // 2. Fetch fresh / revalidate from Open-Meteo
      try {
        const freshDataset = await getWeatherData(lat, lon);
        if (cancelled) return;
        const freshSlice = (freshDataset as any)[endpoint];
        if (freshSlice !== undefined) {
          setData(freshSlice as T);
        }
        const isOfflineSource = !!freshDataset._meta?.isOfflineCached;
        setIsOffline(isOfflineSource);
        setIsStale(!!freshDataset._meta?.isStale);
        setLastUpdated(freshDataset._meta?.lastUpdated ?? Date.now());
        setCacheAgeSeconds(freshDataset._meta?.cacheAgeSeconds ?? 0);
        setError(null);
      } catch (err: any) {
        if (cancelled) return;
        if (hasData) {
          setIsOffline(true);
          setIsStale(true);
        } else {
          setError(err?.message || 'Weather service offline. Please check network.');
          setIsOffline(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [endpoint, lat, lon]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const freshDataset = await getWeatherData(lat, lon, { forceRefresh: true });
      const freshSlice = (freshDataset as any)[endpoint];
      if (freshSlice !== undefined) {
        setData(freshSlice as T);
      }
      const isOfflineSource = !!freshDataset._meta?.isOfflineCached;
      setIsOffline(isOfflineSource);
      setIsStale(!!freshDataset._meta?.isStale);
      setLastUpdated(freshDataset._meta?.lastUpdated ?? Date.now());
      setCacheAgeSeconds(freshDataset._meta?.cacheAgeSeconds ?? 0);
      setError(null);
    } catch (err: any) {
      setIsOffline(true);
      setError(err?.message || 'Failed to refresh');
    } finally {
      setLoading(false);
    }
  }, [endpoint, lat, lon]);

  return { data, loading, error, isStale, isOffline, lastUpdated, cacheAgeSeconds, refresh };
}


