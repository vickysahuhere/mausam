'use client';

import React, { useMemo } from 'react';
import { Typography } from '../ui/Typography';
import { Icon } from '../ui/Icon';
import { Card } from '../ui/Card';
import { CompanionPerch } from '../companion/CompanionPerch';
import { useTheme } from '../../theme/ThemeProvider';
import { useWidgetData } from '../widgets/useWidgetData';
import { CurrentSummaryData, AqiData } from '../../lib/weatherService';
import { useLocaleStore } from '../../store/useLocaleStore';
import { useUnitStore } from '../../store/useUnitStore';
import { useLocationStore } from '../../store/useLocationStore';
import { calculateSolarTimes } from '../../lib/solarAlmanac';
import { haptics } from '../../lib/haptics';

interface MainWeatherHeroProps {
  locationName: string;
  onPressLocation?: () => void;
  onRefresh?: () => void;
}

export const MainWeatherHero = React.memo(function MainWeatherHero({
  locationName,
  onPressLocation,
  onRefresh,
}: MainWeatherHeroProps) {
  const theme = useTheme();
  const t = useLocaleStore((state) => state.t);
  const convertTemp = useUnitStore((state) => state.convertTemp);
  const formatWind = useUnitStore((state) => state.formatWind);
  const temperatureUnit = useUnitStore((state) => state.temperatureUnit);

  const { data: weather, loading, error, refresh } = useWidgetData<CurrentSummaryData>('current_summary');
  const { data: aqi } = useWidgetData<AqiData>('aqi_card');

  const locations = useLocationStore((state) => state.locations);
  const defaultLoc = locations.find((l) => l.isDefault) || locations[0];

  const solarTimes = useMemo(() => {
    if (!defaultLoc) return null;
    try {
      return calculateSolarTimes(defaultLoc.lat, defaultLoc.lon);
    } catch {
      return null;
    }
  }, [defaultLoc]);

  const daylightCountdown = useMemo(() => {
    if (!solarTimes) return null;
    const now = new Date();
    if (solarTimes.isDaylight) {
      const msLeft = solarTimes.sunset.getTime() - now.getTime();
      if (msLeft <= 0) return 'Dusk approaching';
      const h = Math.floor(msLeft / 3600000);
      const m = Math.floor((msLeft % 3600000) / 60000);
      return `${h}h ${m}m daylight left`;
    } else {
      const msLeft = solarTimes.sunrise.getTime() - now.getTime();
      if (msLeft <= 0) return 'Dawn approaching';
      const h = Math.floor(msLeft / 3600000);
      const m = Math.floor((msLeft % 3600000) / 60000);
      return `${h}h ${m}m to sunrise`;
    }
  }, [solarTimes]);

  const handleManualRefresh = () => {
    haptics.notificationSuccess();
    refresh();
    if (onRefresh) onRefresh();
  };

  return (
    <Card className="relative overflow-hidden mb-6 p-6 md:p-8">
      {/* Background ambient radial glow */}
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: theme.colors.primary }}
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left Side: Weather metrics & location */}
        <div className="flex-1 w-full text-center md:text-left">
          {/* Location button */}
          <button
            onClick={onPressLocation}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10 mb-3"
            style={{ color: theme.colors.primary }}
          >
            <Icon name="map-pin" size={15} />
            <span className="truncate max-w-[200px] md:max-w-none font-semibold">
              {locationName || 'New Delhi, India'}
            </span>
            <Icon name="chevron-right" size={14} className="opacity-60" />
          </button>

          {/* Main Temperature Display */}
          <div className="flex items-baseline justify-center md:justify-start gap-3 my-1">
            <Typography variant="h1" className="text-6xl md:text-7xl font-extrabold tracking-tighter">
              {weather ? `${convertTemp(weather.temp)}°` : '--°'}
            </Typography>
            <span className="text-xl md:text-2xl font-semibold opacity-70" style={{ color: theme.colors.textSecondary }}>
              {temperatureUnit}
            </span>
          </div>

          {/* Condition description */}
          <Typography variant="h3" className="font-medium capitalize text-lg md:text-xl mb-3">
            {weather?.desc || 'Fetching current weather...'}
          </Typography>

          {/* High / Low & Feels Like */}
          <div className="flex items-center justify-center md:justify-start gap-4 text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
            {weather && (
              <>
                <span>H: {convertTemp(weather.high)}°</span>
                <span>•</span>
                <span>L: {convertTemp(weather.low)}°</span>
                <span>•</span>
                <span>Feels like {convertTemp(weather.feelsLike)}°</span>
              </>
            )}
          </div>

          {/* Weather telemetry chips */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mt-5">
            {weather?.humidity !== undefined && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-sm"
                style={{
                  backgroundColor: `${theme.colors.primary}12`,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <Icon name="droplet" size={13} color={theme.colors.primary} />
                <span>{weather.humidity}% Humidity</span>
              </div>
            )}

            {weather?.windSpeed !== undefined && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-sm"
                style={{
                  backgroundColor: `${theme.colors.primary}12`,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <Icon name="wind" size={13} color={theme.colors.primary} />
                <span>
                  {formatWind(weather.windSpeed)} {weather.windDirection}
                </span>
              </div>
            )}

            {aqi && (
              (() => {
                const aqiColor =
                  aqi.aqi <= 50 ? '#10B981' : aqi.aqi <= 100 ? '#F59E0B' : aqi.aqi <= 200 ? '#F97316' : '#EF4444';
                return (
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-sm"
                    style={{
                      backgroundColor: `${aqiColor}15`,
                      color: aqiColor,
                      border: `1px solid ${aqiColor}30`,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: aqiColor }} />
                    <span>AQI {aqi.aqi} • {aqi.status}</span>
                  </div>
                );
              })()
            )}

            {daylightCountdown && (
              <div
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-sm"
                style={{
                  backgroundColor: `${theme.colors.primary}12`,
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <Icon name="sun" size={13} color={theme.colors.primary} />
                <span>{daylightCountdown}</span>
              </div>
            )}

            <button
              onClick={handleManualRefresh}
              className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-1"
              title="Refresh Weather"
              style={{ color: theme.colors.textSecondary }}
            >
              <Icon name="refresh" size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Right Side: Interactive Mimi Weather Companion */}
        <div className="shrink-0 flex justify-center items-center">
          <CompanionPerch />
        </div>
      </div>
    </Card>
  );
});
