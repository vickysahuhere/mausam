import React from 'react';
import { View, Animated, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop as SvgStop, Line, Rect, G, Polygon, RadialGradient, LinearGradient, Stop } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { WidgetCard, WidgetProps } from './WidgetCard';
import { useWidgetData } from './useWidgetData';
import { Typography } from '../ui/Typography';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { useTheme } from '../../theme/ThemeProvider';
import { useUnitStore } from '../../store/useUnitStore';
import { useLocationStore, SavedLocation } from '../../store/useLocationStore';
import { useCompanionStore } from '../../store/useCompanionStore';
import { CompanionPerch } from '../companion/CompanionPerch';
import { calculateSolarTimes, calculateMoonPhase } from '../../lib/solarAlmanac';

export const CurrentSummaryWidget = React.memo(function CurrentSummaryWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('current_summary', 'default');
  const theme = useTheme();
  const convertTemp = useUnitStore((state) => state.convertTemp);
  const formatWind = useUnitStore((state) => state.formatWind);
  const temperatureUnit = useUnitStore((state) => state.temperatureUnit);

  return (
    <WidgetCard
      title="Current Conditions"
      iconName={data?.iconName || 'sun'}
      badge="Live"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, flexShrink: 1, paddingRight: 8 }}>
              <Typography variant="h1" style={{ fontSize: 44, fontWeight: '700', lineHeight: 50 }}>
                {convertTemp(data.temp)}{'\u00B0'}{temperatureUnit}
              </Typography>
              <Typography variant="bodyMedium" numberOfLines={2} style={{ fontWeight: '600', marginTop: 2 }}>
                {data.desc}
              </Typography>
            </View>
            <View style={{ alignItems: 'flex-end', paddingTop: 6, flexShrink: 0 }}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600' }}>
                H: {convertTemp(data.high)}{'\u00B0'} / L: {convertTemp(data.low)}{'\u00B0'}
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 2 }}>
                Feels like {convertTemp(data.feelsLike)}{'\u00B0'}{temperatureUnit}
              </Typography>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: theme.spacing.m,
              paddingTop: theme.spacing.s,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1, marginRight: 8 }}>
              <Icon name="droplet" size={14} color={theme.colors.primary} />
              <Typography variant="caption" color={theme.colors.textSecondary} numberOfLines={1} style={{ marginLeft: 4, flexShrink: 1 }}>
                {data.humidity}% Humidity
              </Typography>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
              <Icon name="wind" size={14} color={theme.colors.primary} />
              <Typography variant="caption" color={theme.colors.textSecondary} numberOfLines={1} style={{ marginLeft: 4, flexShrink: 1 }}>
                {formatWind(data.windSpeed)} {data.windDirection}
              </Typography>
            </View>
          </View>
        </View>
      )}
    </WidgetCard>
  );
});

export const HourlyForecastWidget = React.memo(function HourlyForecastWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('hourly_forecast', 'default');
  const theme = useTheme();
  const convertTemp = useUnitStore((state) => state.convertTemp);
  const hours = data?.hours || [];

  return (
    <WidgetCard
      title="Hourly Forecast"
      iconName="clock"
      badge="24h"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View>
          {data.summary && (
            <Typography
              variant="caption"
              color={theme.colors.textSecondary}
              numberOfLines={1}
              style={{ fontWeight: '600', marginBottom: 10, marginTop: -2 }}
            >
              {data.summary}
            </Typography>
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 8, gap: 8 }}
          >
            {hours.map((item: any, idx: number) => {
              const isNow = item.isCurrentHour;
              const hasPrecip = typeof item.precipProb === 'number' && item.precipProb >= 10;
              const tempVal = convertTemp(item.temp);

              const capsuleBg = isNow
                ? (theme.colors.primary + (theme.isDark ? '28' : '18'))
                : theme.colors.surfaceSecondary;

              const capsuleBorder = isNow
                ? theme.colors.primary
                : theme.colors.border;

              return (
                <View
                  key={idx}
                  accessible={true}
                  accessibilityRole="text"
                  accessibilityLabel={`Forecast for ${item.time}: ${tempVal} degrees${hasPrecip ? `, ${item.precipProb} percent chance of rain` : ''}`}
                  style={{
                    width: 62,
                    paddingVertical: 10,
                    paddingHorizontal: 4,
                    borderRadius: 16,
                    backgroundColor: capsuleBg,
                    borderWidth: isNow ? 1.5 : 1,
                    borderColor: capsuleBorder,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: 102,
                  }}
                >
                  {/* Hour Label */}
                  <Typography
                    variant="caption"
                    color={isNow ? theme.colors.primary : theme.colors.text}
                    style={{
                      fontWeight: isNow ? '800' : '600',
                      fontSize: 11,
                      letterSpacing: -0.2,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {item.time}
                  </Typography>

                  {/* Weather Icon */}
                  <View style={{ marginVertical: 4 }}>
                    <Icon
                      name={item.iconName || 'sun'}
                      size={22}
                      color={isNow ? theme.colors.primary : theme.colors.text}
                    />
                  </View>

                  {/* Rain Probability Badge or Spacer */}
                  {hasPrecip ? (
                    <Typography
                      variant="caption"
                      style={{
                        fontSize: 10,
                        fontWeight: '800',
                        color: theme.colors.primary,
                        lineHeight: 12,
                        fontVariant: ['tabular-nums'],
                      }}
                    >
                      {item.precipProb}%
                    </Typography>
                  ) : (
                    <View style={{ height: 12 }} />
                  )}

                  {/* Hourly Temperature */}
                  <Typography
                    variant="bodyMedium"
                    color={theme.colors.text}
                    style={{
                      fontWeight: isNow ? '800' : '700',
                      fontSize: 14,
                      letterSpacing: -0.3,
                      marginTop: 2,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {tempVal}°
                  </Typography>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </WidgetCard>
  );
});

function getAqiColor(aqi: number, themeColors: any): string {
  if (aqi <= 50) return themeColors.success || '#10B981';
  if (aqi <= 100) return themeColors.warning || '#F59E0B';
  return themeColors.error || '#EF4444';
}

function getUvColor(uv: number, themeColors: any): string {
  if (uv <= 2) return themeColors.success || '#10B981';
  if (uv <= 7) return themeColors.warning || '#F59E0B';
  return themeColors.error || '#EF4444';
}

export function AqiWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('aqi_card', 'default');
  const theme = useTheme();

  const aqiVal = data?.aqi || 0;
  const aqiPct = Math.min(96, Math.max(4, (aqiVal / 300) * 100));
  const aqiColor = getAqiColor(aqiVal, theme.colors);

  return (
    <WidgetCard
      title="Air Quality (AQI)"
      iconName="wind"
      badge={`${aqiVal} AQI`}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View>
          {/* Top Hero Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Typography
                variant="h1"
                color={aqiColor}
                style={{ fontSize: 38, fontWeight: '700', letterSpacing: -1.2, lineHeight: 42, fontVariant: ['tabular-nums'] }}
              >
                {data.aqi}
              </Typography>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: aqiColor + (theme.isDark ? '25' : '15'),
                  paddingHorizontal: 9,
                  paddingVertical: 3.5,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: aqiColor + '40',
                  marginLeft: 8,
                  gap: 5,
                }}
              >
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: aqiColor }} />
                <Typography variant="caption" color={aqiColor} style={{ fontWeight: '700', fontSize: 11.5, letterSpacing: 0.2 }}>
                  {data.status}
                </Typography>
              </View>
            </View>

            <View
              style={{
                paddingHorizontal: 9,
                paddingVertical: 4,
                borderRadius: 10,
                backgroundColor: theme.colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600', fontSize: 11 }}>
                PM2.5: <Typography variant="caption" color={theme.colors.text} style={{ fontWeight: '700', fontVariant: ['tabular-nums'] }}>{data.pm25}</Typography> µg/m³
              </Typography>
            </View>
          </View>

          {/* Continuous Rainbow Spectrum Bar */}
          <View style={{ marginTop: 12, marginBottom: 8, position: 'relative' }}>
            <View style={{ height: 8, borderRadius: 4, overflow: 'hidden' }}>
              <Svg width="100%" height="8">
                <Defs>
                  <SvgLinearGradient id="aqiSpectrumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <SvgStop offset="0%" stopColor={theme.colors.success} />
                    <SvgStop offset="30%" stopColor={theme.colors.warning} />
                    <SvgStop offset="70%" stopColor={theme.colors.error} />
                    <SvgStop offset="100%" stopColor={theme.colors.accent} />
                  </SvgLinearGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="8" rx="4" fill="url(#aqiSpectrumGrad)" />
              </Svg>
            </View>

            {/* Glowing Cursor Pin on Bar */}
            <View
              style={{
                position: 'absolute',
                top: -4,
                left: `${aqiPct}%`,
                marginLeft: -8,
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: theme.colors.surface,
                borderWidth: 3,
                borderColor: aqiColor,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.35,
                shadowRadius: 3,
                elevation: 1,
              }}
            />
          </View>

          {/* Spectrum Scale Labels */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 }}>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 0.3 }}>0 GOOD</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 0.3 }}>50 MOD</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 0.3 }}>150 POOR</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 0.3 }}>300+ HAZ</Typography>
          </View>

          {/* Health Guidance Deck */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: 10,
              marginTop: 10,
              gap: 8,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: aqiColor + (theme.isDark ? '25' : '15'),
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 1,
              }}
            >
              <Icon name="shield" size={12} color={aqiColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '700', fontSize: 9.5, letterSpacing: 0.5, marginBottom: 2 }}>
                HEALTH GUIDANCE
              </Typography>
              <Typography variant="caption" color={theme.colors.text} style={{ fontWeight: '500', fontSize: 11.5, lineHeight: 16 }}>
                {data.advisory}
              </Typography>
            </View>
          </View>
        </View>
      )}
    </WidgetCard>
  );
}

export function UvIndexWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('uv_index', 'default');
  const theme = useTheme();

  const uvVal = data?.uvIndex || 0;
  const uvPct = Math.min(96, Math.max(4, (uvVal / 12) * 100));
  const uvColor = getUvColor(uvVal, theme.colors);

  return (
    <WidgetCard
      title="UV Index & Sun Guard"
      iconName="shield"
      badge={`UV ${data?.uvIndex ?? 0}`}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View>
          {/* Top Hero Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Typography
                variant="h1"
                color={uvColor}
                style={{ fontSize: 38, fontWeight: '700', letterSpacing: -1.2, lineHeight: 42, fontVariant: ['tabular-nums'] }}
              >
                {data.uvIndex}
              </Typography>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: uvColor + (theme.isDark ? '25' : '15'),
                  paddingHorizontal: 9,
                  paddingVertical: 3.5,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: uvColor + '40',
                  marginLeft: 8,
                  gap: 5,
                }}
              >
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: uvColor }} />
                <Typography variant="caption" color={uvColor} style={{ fontWeight: '700', fontSize: 11.5, letterSpacing: 0.2 }}>
                  {data.level}
                </Typography>
              </View>
            </View>

            <View
              style={{
                paddingHorizontal: 9,
                paddingVertical: 4,
                borderRadius: 10,
                backgroundColor: theme.colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600', fontSize: 11 }}>
                Peak: <Typography variant="caption" color={theme.colors.text} style={{ fontWeight: '700' }}>{data.peakTime}</Typography>
              </Typography>
            </View>
          </View>

          {/* Continuous UV Segment Bar */}
          <View style={{ marginTop: 12, marginBottom: 8, position: 'relative' }}>
            <View style={{ height: 8, borderRadius: 4, overflow: 'hidden' }}>
              <Svg width="100%" height="8">
                <Defs>
                  <SvgLinearGradient id="uvBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <SvgStop offset="0%" stopColor={theme.colors.success} />
                    <SvgStop offset="30%" stopColor={theme.colors.warning} />
                    <SvgStop offset="70%" stopColor={theme.colors.error} />
                    <SvgStop offset="100%" stopColor={theme.colors.accent} />
                  </SvgLinearGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="8" rx="4" fill="url(#uvBarGrad)" />
              </Svg>
            </View>

            {/* Pointer pin */}
            <View
              style={{
                position: 'absolute',
                top: -4,
                left: `${uvPct}%`,
                marginLeft: -8,
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: theme.colors.surface,
                borderWidth: 3,
                borderColor: uvColor,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.35,
                shadowRadius: 3,
                elevation: 1,
              }}
            />
          </View>

          {/* UV Scale Labels */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 }}>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 0.3 }}>0 LOW</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 0.3 }}>3 MOD</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 0.3 }}>6 HIGH</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 0.3 }}>8 V.HIGH</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 0.3 }}>11+ EXT</Typography>
          </View>

          {/* Sun Protection Guidance Deck */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: 10,
              marginTop: 10,
              gap: 8,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: uvColor + (theme.isDark ? '25' : '15'),
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 1,
              }}
            >
              <Icon name="shield" size={12} color={uvColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '700', fontSize: 9.5, letterSpacing: 0.5, marginBottom: 2 }}>
                SUN PROTECTION GUIDANCE
              </Typography>
              <Typography variant="caption" color={theme.colors.text} style={{ fontWeight: '500', fontSize: 11.5, lineHeight: 16 }}>
                {data.protectionTip}
              </Typography>
            </View>
          </View>
        </View>
      )}
    </WidgetCard>
  );
}

export function PollenWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('pollen_estimate', 'default');
  const theme = useTheme();

  const getPollenColor = (lvl: string) => {
    const l = (lvl || '').toLowerCase();
    if (l.includes('high') || l.includes('very')) return theme.colors.error;
    if (l.includes('mod')) return theme.colors.warning;
    return theme.colors.success;
  };

  const overallColor = getPollenColor(data?.level);

  return (
    <WidgetCard
      title="Pollen & Allergens"
      iconName="plant"
      badge={data?.level || 'Low'}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View>
          {/* 3 Allergen Category Tiles */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <View
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 10,
                backgroundColor: theme.colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: theme.colors.border,
                alignItems: 'center',
              }}
            >
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 0.4 }}>
                TREE
              </Typography>
              <Typography variant="bodyMedium" style={{ fontWeight: '700', fontSize: 12, marginTop: 2, color: getPollenColor(data.treePollen) }}>
                {data.treePollen}
              </Typography>
            </View>

            <View
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 10,
                backgroundColor: theme.colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: theme.colors.border,
                alignItems: 'center',
              }}
            >
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 0.4 }}>
                GRASS
              </Typography>
              <Typography variant="bodyMedium" style={{ fontWeight: '700', fontSize: 12, marginTop: 2, color: getPollenColor(data.grassPollen) }}>
                {data.grassPollen}
              </Typography>
            </View>

            <View
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 10,
                backgroundColor: theme.colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: theme.colors.border,
                alignItems: 'center',
              }}
            >
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 0.4 }}>
                RAGWEED
              </Typography>
              <Typography variant="bodyMedium" style={{ fontWeight: '700', fontSize: 12, marginTop: 2, color: getPollenColor(data.ragweed) }}>
                {data.ragweed}
              </Typography>
            </View>
          </View>

          {/* Allergy Guidance Deck */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: 10,
              gap: 8,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: overallColor + (theme.isDark ? '25' : '15'),
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 1,
              }}
            >
              <Icon name="plant" size={12} color={overallColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '700', fontSize: 9.5, letterSpacing: 0.5, marginBottom: 2 }}>
                ALLERGY ADVISORY
              </Typography>
              <Typography variant="caption" color={theme.colors.text} style={{ fontWeight: '500', fontSize: 11.5, lineHeight: 16 }}>
                {data.tip}
              </Typography>
            </View>
          </View>
        </View>
      )}
    </WidgetCard>
  );
}

export function BestRunHoursWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('best_run_hours', 'default');
  const theme = useTheme();
  const { convertTemp, temperatureUnit } = useUnitStore();

  return (
    <WidgetCard
      title="Best Workout Windows"
      iconName="run"
      badge={`Score ${data?.comfortScore || 88}`}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View>
          {/* Horizontal Chips for Workout Windows */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            {data.hours?.map((hour: string, idx: number) => (
              <View
                key={idx}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  paddingHorizontal: 6,
                  borderRadius: theme.shapes.borderRadius.s,
                  backgroundColor: theme.colors.surfaceSecondary,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: idx === 0 ? theme.colors.primary : theme.colors.border,
                }}
              >
                <Typography variant="caption" style={{ fontWeight: '700', fontSize: 12, color: idx === 0 ? theme.colors.primary : theme.colors.text }}>
                  {hour}
                </Typography>
                <Typography variant="caption" color={theme.colors.success} style={{ fontSize: 10, fontWeight: '600', marginTop: 2 }}>
                  {idx === 0 ? 'Optimal' : 'Good'}
                </Typography>
              </View>
            ))}
          </View>

          {/* Sub-telemetry details */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 6, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 11 }}>
              Morning: ~{convertTemp(data.morningTemp)}°{temperatureUnit}
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 11 }}>
              Evening: ~{convertTemp(data.eveningTemp)}°{temperatureUnit}
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 11 }}>
              Air Score: {data.airScore}
            </Typography>
          </View>
        </View>
      )}
    </WidgetCard>
  );
}

export function SunriseSunsetWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('sunrise_sunset', 'default');
  const theme = useTheme();
  const locations = useLocationStore((state) => state.locations);
  const activeLoc = locations.find((l) => l.isDefault) || locations[0];
  const lat = activeLoc?.lat ?? 28.61;
  const lon = activeLoc?.lon ?? 77.20;

  const solar = calculateSolarTimes(lat, lon);
  const moon = calculateMoonPhase();

  const isDay = solar.isDaylight;
  const progressRatio = isDay
    ? solar.daylightProgressPercent / 100
    : Math.max(0.1, Math.min(0.9, moon.phaseValue));

  // Parametric parabolic coordinates for 240x84 viewBox
  const nodeX = 15 + Math.max(0, Math.min(1, progressRatio)) * 210;
  const nodeY = 66 - 54 * Math.sin(Math.PI * Math.max(0, Math.min(1, progressRatio)));

  const badgeText = isDay
    ? (solar.isGoldenHour ? '✨ Golden Hour' : `${solar.daylightProgressPercent}% Daylight`)
    : `${moon.emoji} ${moon.illuminationPercent}% lit`;

  return (
    <WidgetCard
      title={isDay ? "Sun Track & Daylight" : "Moon & Celestial Track"}
      iconName={isDay ? "sun" : "moon"}
      badge={badgeText}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View
          accessible={true}
          accessibilityRole="summary"
          accessibilityLabel={
            isDay
              ? `Daylight track: ${solar.daylightProgressPercent} percent complete. Sunrise at ${data.sunrise}, sunset at ${data.sunset}.`
              : `Moon track: ${moon.phaseName}, ${moon.illuminationPercent} percent illuminated. Next sunrise at ${data.sunrise}.`
          }
        >
          {/* Celestial Horizon & Glowing Solar/Lunar Dome */}
          <View style={{ alignItems: 'center', width: '100%', position: 'relative', marginTop: 2, marginBottom: 4 }}>
            <Svg width="100%" height="84" viewBox="0 0 240 84">
              <Defs>
                <SvgLinearGradient id="celestialDomeFill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <SvgStop
                    offset="0%"
                    stopColor={isDay ? theme.colors.warning : theme.colors.primary}
                    stopOpacity={0.22}
                  />
                  <SvgStop
                    offset="100%"
                    stopColor={isDay ? theme.colors.warning : theme.colors.primary}
                    stopOpacity={0.02}
                  />
                </SvgLinearGradient>

                <SvgLinearGradient id="celestialArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <SvgStop
                    offset="0%"
                    stopColor={isDay ? theme.colors.warning : theme.colors.primary}
                    stopOpacity={0.7}
                  />
                  <SvgStop
                    offset="50%"
                    stopColor={isDay ? theme.colors.warning : theme.colors.accent}
                    stopOpacity={1}
                  />
                  <SvgStop
                    offset="100%"
                    stopColor={isDay ? theme.colors.accent : theme.colors.primary}
                    stopOpacity={0.7}
                  />
                </SvgLinearGradient>
              </Defs>

              {/* Glowing Ambient Celestial Dome */}
              <Path
                d="M 15 66 Q 120 12 225 66 L 225 66 L 15 66 Z"
                fill="url(#celestialDomeFill)"
              />

              {/* Horizon Line */}
              <Line
                x1="8"
                y1="66"
                x2="232"
                y2="66"
                stroke={theme.colors.border}
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Parabolic Celestial Curve */}
              <Path
                d="M 15 66 Q 120 12 225 66"
                fill="none"
                stroke="url(#celestialArcGrad)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Left/Right Horizon Terminal Dots */}
              <Circle cx="15" cy="66" r="3" fill={theme.colors.border} />
              <Circle cx="225" cy="66" r="3" fill={theme.colors.border} />

              {/* Celestial Body Node */}
              {isDay ? (
                <>
                  {/* Glowing Solar Aura */}
                  <Circle cx={nodeX} cy={nodeY} r="12" fill={theme.colors.warning} opacity={0.25} />
                  <Circle cx={nodeX} cy={nodeY} r="7" fill={theme.colors.warning} opacity={0.6} />
                  {/* Sun Core */}
                  <Circle cx={nodeX} cy={nodeY} r="4.5" fill={theme.colors.surface} stroke={theme.colors.warning} strokeWidth="2" />
                </>
              ) : (
                <>
                  {/* Glowing Lunar Aura */}
                  <Circle cx={nodeX} cy={nodeY} r="11" fill={theme.colors.primary} opacity={0.28} />
                  <Circle cx={nodeX} cy={nodeY} r="6.5" fill={theme.colors.primary} opacity={0.55} />
                  {/* Moon Core */}
                  <Circle cx={nodeX} cy={nodeY} r="4" fill={theme.colors.surface} stroke={theme.colors.primary} strokeWidth="2" />
                </>
              )}
            </Svg>

            {/* In-Dome Status Pill */}
            <View style={{ position: 'absolute', top: 4, alignItems: 'center', width: '100%' }}>
              <View
                style={{
                  backgroundColor: (isDay ? theme.colors.warning : theme.colors.primary) + (theme.isDark ? '25' : '15'),
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: (isDay ? theme.colors.warning : theme.colors.primary) + '40',
                }}
              >
                <Typography
                  variant="caption"
                  color={isDay ? theme.colors.warning : theme.colors.primary}
                  style={{ fontWeight: '700', fontSize: 10.5 }}
                >
                  {isDay
                    ? (solar.isGoldenHour ? '✨ Golden Hour Light' : `☀️ ${Math.floor(solar.daylightMinutes / 60)}h ${solar.daylightMinutes % 60}m Total Daylight`)
                    : `${moon.emoji} ${moon.phaseName} • ${moon.illuminationPercent}% Lit`}
                </Typography>
              </View>
            </View>
          </View>

          {/* 3-Column Structured Telemetry Deck */}
          <View style={{ flexDirection: 'row', gap: 8, width: '100%', marginTop: 6 }}>
            <View
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 10,
                backgroundColor: theme.colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: theme.colors.border,
                alignItems: 'center',
              }}
            >
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 0.4 }}>
                {isDay ? 'FIRST LIGHT' : 'PHASE'}
              </Typography>
              <Typography variant="bodyMedium" numberOfLines={1} style={{ fontWeight: '700', fontSize: 11.5, marginTop: 2, fontVariant: ['tabular-nums'] }}>
                {isDay ? data.firstLight : `${moon.emoji} ${moon.phaseName}`}
              </Typography>
            </View>

            <View
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 10,
                backgroundColor: theme.colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: theme.colors.border,
                alignItems: 'center',
              }}
            >
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 0.4 }}>
                SUNRISE
              </Typography>
              <Typography variant="bodyMedium" style={{ fontWeight: '700', fontSize: 11.5, marginTop: 2, color: theme.colors.warning, fontVariant: ['tabular-nums'] }}>
                {data.sunrise}
              </Typography>
            </View>

            <View
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 10,
                backgroundColor: theme.colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: theme.colors.border,
                alignItems: 'center',
              }}
            >
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 0.4 }}>
                SUNSET
              </Typography>
              <Typography variant="bodyMedium" style={{ fontWeight: '700', fontSize: 11.5, marginTop: 2, color: theme.colors.accent, fontVariant: ['tabular-nums'] }}>
                {data.sunset}
              </Typography>
            </View>
          </View>
        </View>
      )}
    </WidgetCard>
  );
}

export function SeaStateWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('sea_state', 'default');
  const theme = useTheme();
  const { convertTemp, temperatureUnit } = useUnitStore();

  return (
    <WidgetCard
      title="Sea State & Wave Height"
      iconName="wave"
      badge={data?.surfRating}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexShrink: 0, marginRight: 8 }}>
              <Typography variant="h1" color={theme.colors.primary} style={{ fontSize: 32, fontWeight: '800' }}>
                {data.waveHeight}
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600' }}>
                Swell: {data.swellPeriod}
              </Typography>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Typography variant="bodyMedium" numberOfLines={2} style={{ fontWeight: '700', textAlign: 'right' }}>
                {data.seaCondition}
              </Typography>
              <View
                style={{
                  marginTop: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 6,
                  backgroundColor: theme.colors.surfaceSecondary,
                }}
              >
                <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600', fontSize: 11 }}>
                  Water ~{convertTemp(data.waterTemp)}°{temperatureUnit}
                </Typography>
              </View>
            </View>
          </View>

          {/* SVG Wave Silhouette */}
          <View style={{ height: 20, marginTop: 8, overflow: 'hidden' }}>
            <Svg width="100%" height="20" viewBox="0 0 300 20">
              <Path
                d="M 0 12 C 40 4, 70 18, 110 10 C 150 2, 180 16, 220 9 C 260 2, 280 14, 300 8 L 300 20 L 0 20 Z"
                fill={theme.colors.primary}
                opacity="0.15"
              />
              <Path
                d="M 0 15 C 35 8, 75 19, 120 12 C 160 5, 200 18, 240 11 C 275 5, 290 14, 300 10"
                fill="none"
                stroke={theme.colors.primary}
                strokeWidth="1.5"
                opacity="0.5"
              />
            </Svg>
          </View>
        </View>
      )}
    </WidgetCard>
  );
}

export function TideTimesWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('tide_times', 'default');
  const theme = useTheme();

  return (
    <WidgetCard
      title="Tide Schedule (INCOIS)"
      iconName="compass"
      badge={data?.tideTrend}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View>
          {/* Tide Cycle Sine Curve */}
          <View style={{ height: 36, marginVertical: 4 }}>
            <Svg width="100%" height="36" viewBox="0 0 240 36">
              <Defs>
                <SvgLinearGradient id="tideSineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <SvgStop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.8" />
                  <SvgStop offset="100%" stopColor={theme.colors.accent} stopOpacity="0.8" />
                </SvgLinearGradient>
              </Defs>
              <Path
                d="M 10 18 Q 45 4 80 18 T 150 18 T 220 18"
                fill="none"
                stroke="url(#tideSineGrad)"
                strokeWidth="2.5"
              />
              {/* High Tide Crest Marker */}
              <Circle cx="45" cy="8" r="4" fill={theme.colors.primary} stroke="#fff" strokeWidth="1.5" />
              {/* Low Tide Trough Marker */}
              <Circle cx="115" cy="28" r="4" fill={theme.colors.accent} stroke="#fff" strokeWidth="1.5" />
            </Svg>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 11, fontWeight: '600' }}>
                Next High Tide
              </Typography>
              <Typography variant="bodyMedium" style={{ fontWeight: '700', color: theme.colors.primary }}>
                {data.nextHigh}
              </Typography>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 11, fontWeight: '600' }}>
                Next Low Tide
              </Typography>
              <Typography variant="bodyMedium" style={{ fontWeight: '700', color: theme.colors.accent }}>
                {data.nextLow}
              </Typography>
            </View>
          </View>
        </View>
      )}
    </WidgetCard>
  );
}

export function DestinationWeatherWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('destination_weather', 'default');
  const theme = useTheme();
  const { convertTemp, temperatureUnit } = useUnitStore();

  return (
    <WidgetCard
      title="Destination Outlook"
      iconName="map-pin"
      badge="Travel"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {data.savedCities?.map((c: any, i: number) => (
            <View key={i} style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
              <Typography variant="bodyMedium" numberOfLines={1} style={{ fontWeight: '600' }}>{c.name}</Typography>
              <Typography variant="h3" color={theme.colors.primary}>{convertTemp(c.temp)}{'\u00B0'}{temperatureUnit}</Typography>
              <Typography variant="caption" numberOfLines={1} color={theme.colors.textSecondary}>{c.cond}</Typography>
            </View>
          ))}
        </View>
      )}
    </WidgetCard>
  );
}

export function PackingTipWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('packing_tip', 'default');
  const theme = useTheme();

  return (
    <WidgetCard
      title="Smart Packing Assistant"
      iconName="calendar"
      badge="Suggestions"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View>
          {data.recommendations?.map((tip: string, i: number) => (
            <Typography key={i} variant="caption" color={theme.colors.text} style={{ marginBottom: 3 }}>
              {'\u2022'} {tip}
            </Typography>
          ))}
        </View>
      )}
    </WidgetCard>
  );
}

export function SchoolCommuteWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('school_commute', 'default');
  const theme = useTheme();
  const { convertTemp, temperatureUnit } = useUnitStore();

  return (
    <WidgetCard
      title="School Commute Window"
      iconName="cloud"
      badge={data?.status}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, flexShrink: 1, paddingRight: 8 }}>
            <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>{data.window}</Typography>
            <Typography variant="caption" numberOfLines={2} color={theme.colors.textSecondary}>{data.advisory}</Typography>
          </View>
          <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
            <Typography variant="h3" color={theme.colors.primary}>{convertTemp(data.temp)}{'\u00B0'}{temperatureUnit}</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>Rain: {data.rainChance}</Typography>
          </View>
        </View>
      )}
    </WidgetCard>
  );
}

function AnimatedPrecipBar({ prob, color, borderColor, index }: { prob: number; color: string; borderColor: string; index: number }) {
  const [heightAnim] = React.useState(() => new Animated.Value(4));
  const targetHeight = Math.max(8, prob * 0.55);

  React.useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 60),
      Animated.spring(heightAnim, {
        toValue: targetHeight,
        friction: 6,
        tension: 40,
        useNativeDriver: false,
      }),
    ]).start();
  }, [targetHeight, heightAnim, index]);

  return (
    <Animated.View
      style={{
        width: 14,
        height: heightAnim,
        backgroundColor: prob > 20 ? color : borderColor,
        borderRadius: 4,
        marginVertical: 4,
      }}
    />
  );
}

export function RainTimelineWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('rain_timeline', 'default');
  const theme = useTheme();

  return (
    <WidgetCard
      title="Precipitation Timeline"
      iconName="rain"
      badge="Next 6h"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View>
          <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginBottom: 8 }}>
            {data.summary}
          </Typography>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', minHeight: 70 }}>
            {data.timeline?.map((slot: any, i: number) => (
              <View key={i} style={{ alignItems: 'center' }}>
                <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 11 }}>
                  {slot.time}
                </Typography>
                <AnimatedPrecipBar
                  prob={slot.prob}
                  color={theme.colors.primary}
                  borderColor={theme.colors.border}
                  index={i}
                />
                <Typography variant="caption" style={{ fontSize: 10, fontWeight: '700' }}>
                  {slot.prob}%
                </Typography>
              </View>
            ))}
          </View>
        </View>
      )}
    </WidgetCard>
  );
}

export function FrostAlertWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('frost_alert', 'default');
  const theme = useTheme();
  const { convertTemp, temperatureUnit } = useUnitStore();

  return (
    <WidgetCard
      title="Frost & Cold Risk"
      iconName="thermometer"
      badge={`Risk: ${data?.riskLevel}`}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>{data.frostWindow}</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>Min ground ~{convertTemp(data.minGroundTemp)}{'\u00B0'}{temperatureUnit}</Typography>
          </View>
          <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
            {data.cropSafetyTip}
          </Typography>
        </View>
      )}
    </WidgetCard>
  );
}

export function RainfallForecastWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('rainfall_forecast', 'default');
  const theme = useTheme();

  return (
    <WidgetCard
      title="District Rainfall Forecast"
      iconName="droplet"
      badge="Agriculture"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography variant="h3" color={theme.colors.primary}>{data.districtPrediction}</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>7-Day Total: {data.sevenDayTotal}</Typography>
          </View>
          <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 2 }}>
            Soil status: {data.soilMoistureStatus}
          </Typography>
        </View>
      )}
    </WidgetCard>
  );
}

export function SoilMoistureWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('soil_moisture', 'default');
  const theme = useTheme();

  return (
    <WidgetCard
      title="Soil Moisture Index"
      iconName="plant"
      badge={data?.saturation || 'Optimal'}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View>
          {/* Dual Layer Stratification Tiles */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: theme.colors.surfaceSecondary,
                padding: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 0.4 }}>
                TOPSOIL (0-10CM)
              </Typography>
              <Typography variant="h3" color={theme.colors.text} style={{ fontWeight: '700', fontSize: 16, marginTop: 3, fontVariant: ['tabular-nums'] }}>
                {data.depth10cm}
              </Typography>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.colors.border, marginTop: 8, overflow: 'hidden' }}>
                <View style={{ width: '68%', height: '100%', backgroundColor: theme.colors.primary, borderRadius: 3 }} />
              </View>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: theme.colors.surfaceSecondary,
                padding: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 0.4 }}>
                ROOT ZONE (10-40CM)
              </Typography>
              <Typography variant="h3" color={theme.colors.text} style={{ fontWeight: '700', fontSize: 16, marginTop: 3, fontVariant: ['tabular-nums'] }}>
                {data.depth40cm}
              </Typography>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.colors.border, marginTop: 8, overflow: 'hidden' }}>
                <View style={{ width: '82%', height: '100%', backgroundColor: theme.colors.success, borderRadius: 3 }} />
              </View>
            </View>
          </View>

          {/* Agronomic Recommendation Deck */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: 10,
              gap: 8,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: theme.colors.primary + (theme.isDark ? '25' : '15'),
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 1,
              }}
            >
              <Icon name="plant" size={12} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '700', fontSize: 9.5, letterSpacing: 0.5, marginBottom: 2 }}>
                FIELD GUIDANCE
              </Typography>
              <Typography variant="caption" color={theme.colors.text} style={{ fontWeight: '500', fontSize: 11.5, lineHeight: 16 }}>
                {data.recommendation}
              </Typography>
            </View>
          </View>
        </View>
      )}
    </WidgetCard>
  );
}

export function VisibilityFogWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('visibility_fog', 'default');
  const theme = useTheme();

  const isFogAlert = (data?.fogRisk || '').toLowerCase().includes('high');
  const statusColor = isFogAlert ? theme.colors.warning : theme.colors.success;

  return (
    <WidgetCard
      title="Road Visibility & Fog"
      iconName="fog"
      badge={data?.status || 'Good'}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View>
          {/* Top Hero Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Typography
                variant="h1"
                color={theme.colors.text}
                style={{ fontSize: 36, fontWeight: '700', letterSpacing: -1, lineHeight: 40, fontVariant: ['tabular-nums'] }}
              >
                {data.visibility}
              </Typography>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: statusColor + (theme.isDark ? '25' : '15'),
                  paddingHorizontal: 9,
                  paddingVertical: 3.5,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: statusColor + '40',
                  marginLeft: 8,
                  gap: 5,
                }}
              >
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusColor }} />
                <Typography variant="caption" color={statusColor} style={{ fontWeight: '700', fontSize: 11, letterSpacing: 0.2 }}>
                  {data.status}
                </Typography>
              </View>
            </View>

            <View
              style={{
                paddingHorizontal: 9,
                paddingVertical: 4,
                borderRadius: 10,
                backgroundColor: theme.colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600', fontSize: 11 }}>
                Fog Risk: <Typography variant="caption" color={statusColor} style={{ fontWeight: '700' }}>{data.fogRisk}</Typography>
              </Typography>
            </View>
          </View>

          {/* Visibility distance progress bar */}
          <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.colors.surfaceSecondary, marginTop: 12, marginBottom: 10, overflow: 'hidden' }}>
            <View style={{ width: '85%', height: '100%', backgroundColor: theme.colors.primary, borderRadius: 3 }} />
          </View>

          {/* Commute Impact Deck */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: 10,
              gap: 8,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: statusColor + (theme.isDark ? '25' : '15'),
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 1,
              }}
            >
              <Icon name="compass" size={12} color={statusColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '700', fontSize: 9.5, letterSpacing: 0.5, marginBottom: 2 }}>
                TRANSIT ADVISORY
              </Typography>
              <Typography variant="caption" color={theme.colors.text} style={{ fontWeight: '500', fontSize: 11.5, lineHeight: 16 }}>
                {data.commuteImpact}
              </Typography>
            </View>
          </View>
        </View>
      )}
    </WidgetCard>
  );
}

export function ExtendedForecastWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('extended_forecast', 'default');
  const theme = useTheme();
  const { convertTemp } = useUnitStore();

  const rawDays = data?.days || [];
  const days = rawDays.map((d: any) => {
    const rawLow = typeof d.low === 'number' ? d.low : parseInt(d.low, 10) || 15;
    const rawHigh = typeof d.high === 'number' ? d.high : parseInt(d.high, 10) || 30;
    return {
      ...d,
      low: convertTemp(rawLow),
      high: convertTemp(rawHigh),
    };
  });
  const minWeek = days.length > 0 ? Math.min(...days.map((d: any) => d.low)) : 15;
  const maxWeek = days.length > 0 ? Math.max(...days.map((d: any) => d.high)) : 30;
  const range = Math.max(1, maxWeek - minWeek);

  return (
    <WidgetCard
      title="5-Day Forecast Outlook"
      iconName="calendar"
      badge="Extended"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View style={{ paddingTop: 2 }}>
          {days.map((d: any, i: number) => {
            const low = d.low;
            const high = d.high;
            const isToday = i === 0 || d.day?.toLowerCase().includes('today');

            // Percentage positions along the global week range
            const leftPct = Math.max(0, Math.min(85, ((low - minWeek) / range) * 100));
            const rightPct = Math.max(leftPct + 12, Math.min(100, ((high - minWeek) / range) * 100));
            const barWidthPct = Math.max(14, rightPct - leftPct);

            // Current temperature position for "Today"
            const currentTemp = isToday ? Math.round((low + high) / 2) : null;
            const dotPct = currentTemp !== null ? Math.max(leftPct, Math.min(rightPct, ((currentTemp - minWeek) / range) * 100)) : null;

            return (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 6,
                  borderBottomWidth: i < days.length - 1 ? 1 : 0,
                  borderBottomColor: theme.colors.border,
                }}
              >
                {/* Day Name */}
                <Typography
                  variant="bodyMedium"
                  numberOfLines={1}
                  style={{
                    width: 58,
                    fontWeight: isToday ? '700' : '500',
                    color: isToday ? theme.colors.primary : theme.colors.text,
                    fontSize: 13,
                  }}
                >
                  {d.day}
                </Typography>

                {/* Weather Icon */}
                <View style={{ width: 28, alignItems: 'center', marginRight: 6 }}>
                  <Icon name={d.iconName || 'sun'} size={15} color={theme.colors.primary} />
                </View>

                {/* Min Temp */}
                <Typography
                  variant="caption"
                  color={theme.colors.textSecondary}
                  style={{
                    width: 30,
                    textAlign: 'right',
                    fontWeight: '600',
                    fontSize: 12,
                    marginRight: 8,
                  }}
                >
                  {low}°
                </Typography>

                {/* Apple Weather Horizontal Range Capsule Bar */}
                <View
                  style={{
                    flex: 1,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: theme.colors.surfaceSecondary,
                    position: 'relative',
                    justifyContent: 'center',
                    marginHorizontal: 4,
                  }}
                >
                  {/* Colored Active Temperature Span */}
                  <View
                    style={{
                      position: 'absolute',
                      left: `${leftPct}%`,
                      width: `${barWidthPct}%`,
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: theme.colors.primary,
                      opacity: 0.85,
                    }}
                  />

                  {/* Glowing Indicator Dot for Today */}
                  {isToday && dotPct !== null && (
                    <View
                      style={{
                        position: 'absolute',
                        left: `${dotPct}%`,
                        marginLeft: -4,
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.colors.surface,
                        borderWidth: 1.5,
                        borderColor: theme.colors.primary,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                        elevation: 0,
                      }}
                    />
                  )}
                </View>

                {/* Max Temp */}
                <Typography
                  variant="bodyMedium"
                  style={{
                    width: 32,
                    textAlign: 'right',
                    fontWeight: '700',
                    fontSize: 13,
                    marginLeft: 8,
                    color: theme.colors.text,
                  }}
                >
                  {high}°
                </Typography>
              </View>
            );
          })}
        </View>
      )}
    </WidgetCard>
  );
}

export function ComfortIndexWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('comfort_index', 'default');
  const theme = useTheme();

  const score = data?.score ?? 75;
  const category = data?.category ?? 'Comfortable';
  const humidityImpact = data?.humidityImpact || 'Optimal relative humidity';
  const coolingTip = data?.coolingTip || 'Ideal conditions for outdoor activity';

  const clampedScore = Math.max(0, Math.min(100, score));

  const getScoreColor = (s: number) => {
    if (s >= 80) return theme.colors.success;
    if (s >= 65) return theme.colors.primary;
    if (s >= 50) return theme.colors.warning;
    return theme.colors.error;
  };

  const scoreColor = getScoreColor(score);

  // Geometric arc calculations (Semicircle: R=75, cx=110, cy=92)
  const arcLength = 235.62; // Math.PI * 75
  const strokeOffset = arcLength * (1 - clampedScore / 100);
  const angleRad = Math.PI - (clampedScore / 100) * Math.PI;
  const tipX = 110 + 75 * Math.cos(angleRad);
  const tipY = 92 - 75 * Math.sin(angleRad);

  return (
    <WidgetCard
      title="Thermal Comfort Index"
      iconName="thermometer"
      badge={`${score} / 100`}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View style={{ alignItems: 'center' }}>
          {/* Semicircular Apple-Grade Comfort Progress Arc */}
          <View style={{ width: '100%', height: 116, alignItems: 'center', justifyContent: 'flex-start', position: 'relative' }}>
            <Svg width="220" height="110" viewBox="0 0 220 110">
              <Defs>
                <SvgLinearGradient id="comfortArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <SvgStop offset="0%" stopColor={theme.colors.error} />
                  <SvgStop offset="35%" stopColor={theme.colors.warning} />
                  <SvgStop offset="70%" stopColor={theme.colors.primary} />
                  <SvgStop offset="100%" stopColor={theme.colors.success} />
                </SvgLinearGradient>
              </Defs>

              {/* Background Guide Rail */}
              <Path
                d="M 35 92 A 75 75 0 0 1 185 92"
                fill="none"
                stroke={theme.colors.border}
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Active Progress Arc */}
              <Path
                d="M 35 92 A 75 75 0 0 1 185 92"
                fill="none"
                stroke="url(#comfortArcGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${arcLength} ${arcLength}`}
                strokeDashoffset={strokeOffset}
              />

              {/* Glowing Tip Indicator Jewel */}
              <Circle cx={tipX} cy={tipY} r="8" fill={scoreColor} opacity={0.35} />
              <Circle cx={tipX} cy={tipY} r="5" fill={theme.colors.surface} stroke={scoreColor} strokeWidth="2.5" />
            </Svg>

            {/* Inside the Amphitheater: Numeric Score & Status Pill */}
            <View style={{ position: 'absolute', top: 22, alignItems: 'center', width: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Typography
                  variant="h1"
                  color={theme.colors.text}
                  style={{ fontSize: 36, fontWeight: '700', letterSpacing: -1.2, fontVariant: ['tabular-nums'] }}
                >
                  {score}
                </Typography>
                <Typography
                  variant="caption"
                  color={theme.colors.textSecondary}
                  style={{ fontSize: 13, fontWeight: '600', marginLeft: 3 }}
                >
                  / 100
                </Typography>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: scoreColor + (theme.isDark ? '25' : '15'),
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: scoreColor + '40',
                  marginTop: 2,
                  gap: 5,
                }}
              >
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: scoreColor }} />
                <Typography variant="caption" color={scoreColor} style={{ fontWeight: '700', fontSize: 11, letterSpacing: 0.2 }}>
                  {category}
                </Typography>
              </View>
            </View>

            {/* Clean Outer Scale Labels */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '84%', position: 'absolute', bottom: 2 }}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 0.4 }}>
                0 POOR
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 0.4 }}>
                100 OPTIMAL
              </Typography>
            </View>
          </View>

          {/* Dual Telemetry Cards */}
          <View style={{ flexDirection: 'row', gap: 8, width: '100%', marginTop: 8 }}>
            <View
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 12,
                backgroundColor: theme.colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Icon name="droplet" size={12} color={theme.colors.primary} />
                <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginLeft: 5, fontWeight: '700', fontSize: 10, letterSpacing: 0.5 }}>
                  HUMIDITY
                </Typography>
              </View>
              <Typography variant="caption" color={theme.colors.text} numberOfLines={2} style={{ fontWeight: '600', fontSize: 11.5, lineHeight: 15 }}>
                {humidityImpact}
              </Typography>
            </View>

            <View
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 12,
                backgroundColor: theme.colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Icon name="compass" size={12} color={theme.colors.primary} />
                <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginLeft: 5, fontWeight: '700', fontSize: 10, letterSpacing: 0.5 }}>
                  GUIDANCE
                </Typography>
              </View>
              <Typography variant="caption" color={theme.colors.text} numberOfLines={2} style={{ fontWeight: '600', fontSize: 11.5, lineHeight: 15 }}>
                {coolingTip}
              </Typography>
            </View>
          </View>
        </View>
      )}
    </WidgetCard>
  );
}

function SecondaryLocationCard({
  location,
  onMakePrimary,
}: {
  location: SavedLocation;
  onMakePrimary: () => void;
}) {
  const theme = useTheme();
  const { convertTemp, temperatureUnit } = useUnitStore();
  const { data, loading } = useWidgetData<any>('current_summary', location.id);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: theme.shapes.borderRadius.s,
        backgroundColor: theme.colors.surfaceSecondary,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <View style={{ flex: 1, paddingRight: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <Icon name="map-pin" size={14} color={theme.colors.primary} />
          <Typography variant="bodyMedium" style={{ fontWeight: '700' }} numberOfLines={1}>
            {location.label}
          </Typography>
        </View>
        <Typography variant="caption" color={theme.colors.textSecondary} numberOfLines={1}>
          {data ? data.desc : loading ? 'Fetching conditions...' : 'Saved location'}
        </Typography>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {data ? (
          <View style={{ alignItems: 'flex-end' }}>
            <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
              {convertTemp(data.temp)}°{temperatureUnit}
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 11 }}>
              H:{convertTemp(data.high)}° L:{convertTemp(data.low)}°
            </Typography>
          </View>
        ) : loading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : null}

        <TouchableOpacity
          onPress={onMakePrimary}
          style={{
            backgroundColor: theme.colors.primary + '18',
            borderColor: theme.colors.primary,
            borderWidth: 1,
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '700', fontSize: 11 }}>
            Make Primary
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function SecondaryLocationsWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const router = useRouter();
  const theme = useTheme();
  const locations = useLocationStore((state) => state.locations);
  const setDefaultLocation = useLocationStore((state) => state.setDefaultLocation);

  const secondaryLocations = locations.filter((l) => !l.isDefault);

  return (
    <WidgetCard
      title="Secondary Locations"
      iconName="map-pin"
      badge={secondaryLocations.length > 0 ? `${secondaryLocations.length} Saved` : undefined}
      loading={false}
      error={null}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {secondaryLocations.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 12 }}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: theme.colors.primary + '15',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
            }}
          >
            <Icon name="compass" size={22} color={theme.colors.primary} />
          </View>
          <Typography variant="bodyMedium" style={{ fontWeight: '700', textAlign: 'center' }}>
            No Secondary Locations
          </Typography>
          <Typography
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ textAlign: 'center', marginTop: 4, marginBottom: 12, paddingHorizontal: 16 }}
          >
            Add School, Work, College, or your hometown to view live weather side-by-side.
          </Typography>
          <Button
            title="Manage Locations"
            variant="outline"
            onPress={() => router.push('/(tabs)/locations')}
            style={{ paddingHorizontal: 16, paddingVertical: 6 }}
          />
        </View>
      ) : (
        <View>
          {secondaryLocations.map((loc) => (
            <SecondaryLocationCard
              key={loc.id}
              location={loc}
              onMakePrimary={() => setDefaultLocation(loc.id)}
            />
          ))}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/locations')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 6,
              marginTop: 4,
              gap: 4,
            }}
          >
            <Icon name="plus" size={14} color={theme.colors.primary} />
            <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '700' }}>
              Add Another Location
            </Typography>
          </TouchableOpacity>
        </View>
      )}
    </WidgetCard>
  );
}

export const CompanionCardWidget = React.memo(function CompanionCardWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const catMood = useCompanionStore((s) => s.catMood);
  const catActivity = useCompanionStore((s) => s.catActivity);
  const name = useCompanionStore((s) => s.name);
  const isEnabled = useCompanionStore((s) => s.isEnabled);
  const theme = useTheme();

  if (!isEnabled) {
    return null;
  }

  const activityLabels: Record<string, string> = {
    basking: 'Basking in the warm sun',
    napping: 'Taking a cozy cat nap',
    gazing_sky: 'Watching rainfall from shelter',
    grooming: 'Grooming whiskers and paws',
    seeking_shelter: 'Hiding safely from storm',
    shivering: 'Keeping warm from chill',
    panting: 'Hydrating in the afternoon heat',
    checking_map: 'Observing travel routes',
    exercising: 'Active and energetic',
    parenting: 'Watching over the family',
    commuting: 'Tracking transit weather',
    farming: 'Monitoring rainfall and soil',
    celebrating: 'Celebrating great weather!',
    resting: 'Perched and observing',
  };

  const activityText = activityLabels[catActivity] || 'Perched and observing';

  return (
    <WidgetCard
      title={`${name} — Weather Companion`}
      iconName="sun"
      badge={catMood.toUpperCase()}
      loading={false}
      error={null}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 4 }}>
        <CompanionPerch compact />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceSecondary,
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 14,
            marginTop: 6,
            gap: 6,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: theme.colors.primary,
            }}
          />
          <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600', fontSize: 11 }}>
            {activityText}
          </Typography>
        </View>
      </View>
    </WidgetCard>
  );
});

export const WindCompassWidget = React.memo(function WindCompassWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('wind_compass', 'default');
  const theme = useTheme();
  const formatWind = useUnitStore((state) => state.formatWind);

  const degrees = data?.degrees ?? 180;
  const speed = data?.speed ?? 12;
  const gustSpeed = data?.gustSpeed ?? 18;
  const compassDir = data?.compassDir ?? 'S';
  const beaufort = data?.beaufortScale ?? 'Gentle Breeze';
  const desc = data?.description ?? 'Leaves and twigs in motion';

  // Rotation transform for SVG needle (pointing in direction wind is blowing TO)
  const rotationDeg = (degrees + 180) % 360;

  return (
    <WidgetCard
      title="Wind Compass & Rose"
      iconName="compass"
      badge={`${compassDir} • ${formatWind(speed)}`}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View
          accessible={true}
          accessibilityRole="summary"
          accessibilityLabel={`Wind blowing from ${compassDir} at ${formatWind(speed)}, gusts up to ${formatWind(gustSpeed)}. ${beaufort}`}
          style={{ alignItems: 'center' }}
        >
          <View style={{ width: 140, height: 140, alignItems: 'center', justifyContent: 'center', marginVertical: 4 }}>
            <Svg width="140" height="140" viewBox="0 0 140 140">
              <Defs>
                <RadialGradient id="compassCenterGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity={0.15} />
                  <Stop offset="100%" stopColor={theme.colors.primary} stopOpacity={0} />
                </RadialGradient>
              </Defs>

              {/* Outer Dial Circle */}
              <Circle cx="70" cy="70" r="66" fill="url(#compassCenterGlow)" stroke={theme.colors.border} strokeWidth="1.5" />
              <Circle cx="70" cy="70" r="54" fill="none" stroke={theme.colors.border} strokeWidth="1" strokeDasharray="3 4" opacity={0.6} />

              {/* Cardinal Markers */}
              <Line x1="70" y1="6" x2="70" y2="14" stroke={theme.colors.error} strokeWidth="2.5" strokeLinecap="round" />
              <Line x1="134" y1="70" x2="126" y2="70" stroke={theme.colors.textSecondary} strokeWidth="1.8" strokeLinecap="round" />
              <Line x1="70" y1="134" x2="70" y2="126" stroke={theme.colors.textSecondary} strokeWidth="1.8" strokeLinecap="round" />
              <Line x1="6" y1="70" x2="14" y2="70" stroke={theme.colors.textSecondary} strokeWidth="1.8" strokeLinecap="round" />

              {/* Diagonal Ticks */}
              <Line x1="25" y1="25" x2="31" y2="31" stroke={theme.colors.border} strokeWidth="1.2" strokeLinecap="round" />
              <Line x1="115" y1="25" x2="109" y2="31" stroke={theme.colors.border} strokeWidth="1.2" strokeLinecap="round" />
              <Line x1="25" y1="115" x2="31" y2="109" stroke={theme.colors.border} strokeWidth="1.2" strokeLinecap="round" />
              <Line x1="115" y1="115" x2="109" y2="109" stroke={theme.colors.border} strokeWidth="1.2" strokeLinecap="round" />

              {/* Rotating Aerodynamic Wind Arrow Needle */}
              <G transform={`rotate(${rotationDeg}, 70, 70)`}>
                {/* Arrow Tail */}
                <Polygon points="70,98 65,70 75,70" fill={theme.colors.textSecondary} opacity={0.8} />
                {/* Arrow Head Pointing Downwind */}
                <Polygon points="70,18 63,64 70,58 77,64" fill={theme.colors.primary} />
                {/* Center Hub */}
                <Circle cx="70" cy="70" r="18" fill={theme.colors.surface} stroke={theme.colors.primary} strokeWidth="2" />
                <Circle cx="70" cy="70" r="5" fill={theme.colors.primary} />
              </G>
            </Svg>

            {/* Central Wind Heading Readout */}
            <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }} pointerEvents="none">
              <Typography variant="bodyMedium" color={theme.colors.text} style={{ fontWeight: '800', fontSize: 13, fontVariant: ['tabular-nums'] }}>
                {degrees}°
              </Typography>
              <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '700', fontSize: 10, marginTop: -2 }}>
                {compassDir}
              </Typography>
            </View>

            {/* Cardinal Points */}
            <Typography variant="caption" style={{ position: 'absolute', top: 10, fontWeight: '800', fontSize: 10, color: theme.colors.error }} pointerEvents="none">
              N
            </Typography>
            <Typography variant="caption" style={{ position: 'absolute', bottom: 10, fontWeight: '700', fontSize: 9.5, color: theme.colors.textSecondary }} pointerEvents="none">
              S
            </Typography>
            <Typography variant="caption" style={{ position: 'absolute', right: 10, fontWeight: '700', fontSize: 9.5, color: theme.colors.textSecondary }} pointerEvents="none">
              E
            </Typography>
            <Typography variant="caption" style={{ position: 'absolute', left: 10, fontWeight: '700', fontSize: 9.5, color: theme.colors.textSecondary }} pointerEvents="none">
              W
            </Typography>
          </View>

          {/* Beaufort Status Pill */}
          <View
            style={{
              backgroundColor: theme.colors.surfaceSecondary,
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 12,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Typography variant="caption" color={theme.colors.text} style={{ fontWeight: '700', fontSize: 11 }}>
              🍃 {beaufort}
            </Typography>
          </View>

          {/* Detailed Metric Strip */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingTop: 6, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
            <View style={{ alignItems: 'flex-start' }}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 10.5 }}>
                Steady Speed
              </Typography>
              <Typography variant="bodyMedium" style={{ fontWeight: '700', fontSize: 13, fontVariant: ['tabular-nums'] }}>
                {formatWind(speed)}
              </Typography>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 10.5 }}>
                Peak Gusts
              </Typography>
              <Typography variant="bodyMedium" color={theme.colors.warning} style={{ fontWeight: '700', fontSize: 13, fontVariant: ['tabular-nums'] }}>
                {formatWind(gustSpeed)}
              </Typography>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 10.5 }}>
                Bearing
              </Typography>
              <Typography variant="bodyMedium" style={{ fontWeight: '700', fontSize: 13, fontVariant: ['tabular-nums'] }}>
                {degrees}° {compassDir}
              </Typography>
            </View>
          </View>

          <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 10.5, textAlign: 'center', marginTop: 6, fontStyle: 'italic' }}>
            {desc}
          </Typography>
        </View>
      )}
    </WidgetCard>
  );
});

export const BarometerPressureWidget = React.memo(function BarometerPressureWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('barometer_pressure', 'default');
  const theme = useTheme();

  const pressure = data?.pressureHpa ?? 1013;
  const trend = data?.trend ?? 'steady';
  const tendency = data?.tendencyLabel ?? 'Normal Barometer';
  const summary = data?.forecastSummary ?? 'Stable conditions';
  const altitude = data?.altitudeEstimateM ?? 0;

  // Gauge needle rotation from -80deg (at 970 hPa) to +80deg (at 1040 hPa)
  const clampedPressure = Math.max(970, Math.min(1040, pressure));
  const progress = (clampedPressure - 970) / (1040 - 970);
  const needleDeg = -80 + progress * 160;

  const trendColor = trend === 'rising'
    ? theme.colors.success
    : trend === 'falling'
      ? theme.colors.warning
      : theme.colors.primary;

  const trendIcon = trend === 'rising' ? '↗' : trend === 'falling' ? '↘' : '↔';

  return (
    <WidgetCard
      title="Barometer & Storm Trend"
      iconName="compass"
      badge={`${pressure} hPa`}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View
          accessible={true}
          accessibilityRole="summary"
          accessibilityLabel={`Barometric pressure is ${pressure} hectopascals, ${tendency}. ${summary}`}
          style={{ alignItems: 'center' }}
        >
          {/* Semicircular Analog Gauge */}
          <View style={{ width: 180, height: 95, alignItems: 'center', justifyContent: 'flex-start', overflow: 'hidden' }}>
            <Svg width="180" height="120" viewBox="0 0 180 120">
              <Defs>
                <LinearGradient id="baroArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor={theme.colors.error} />
                  <Stop offset="45%" stopColor={theme.colors.warning} />
                  <Stop offset="100%" stopColor={theme.colors.success} />
                </LinearGradient>
              </Defs>

              {/* Background Arc Track */}
              <Path
                d="M 22 90 A 68 68 0 0 1 158 90"
                fill="none"
                stroke={theme.colors.border}
                strokeWidth="7"
                strokeLinecap="round"
              />

              {/* Colored Gauge Arc */}
              <Path
                d="M 22 90 A 68 68 0 0 1 158 90"
                fill="none"
                stroke="url(#baroArcGrad)"
                strokeWidth="5"
                strokeLinecap="round"
                opacity={0.85}
              />

              {/* Major Scale Markings */}
              <Line x1="28" y1="84" x2="34" y2="81" stroke={theme.colors.textSecondary} strokeWidth="1.5" />
              <Line x1="90" y1="23" x2="90" y2="31" stroke={theme.colors.textSecondary} strokeWidth="1.5" />
              <Line x1="152" y1="84" x2="146" y2="81" stroke={theme.colors.textSecondary} strokeWidth="1.5" />

              {/* Gauge Needle */}
              <G transform={`rotate(${needleDeg}, 90, 90)`}>
                <Polygon points="90,30 87,90 93,90" fill={theme.colors.text} />
                <Circle cx="90" cy="90" r="6" fill={trendColor} stroke={theme.colors.surface} strokeWidth="1.5" />
              </G>
            </Svg>

            {/* Gauge Zone Labels */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '88%', position: 'absolute', bottom: 4 }}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9, fontWeight: '700', letterSpacing: 0.3 }}>
                970 STORM
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 9, fontWeight: '700', letterSpacing: 0.3 }}>
                1040 FAIR
              </Typography>
            </View>
          </View>

          {/* Digital Readout & Tendency Pill */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 6 }}>
            <Typography variant="h2" color={theme.colors.text} style={{ fontSize: 26, fontWeight: '800', fontVariant: ['tabular-nums'] }}>
              {pressure} <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 13, fontWeight: '600' }}>hPa</Typography>
            </Typography>

            <View
              style={{
                backgroundColor: trendColor + '18',
                paddingHorizontal: 9,
                paddingVertical: 3,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: trendColor + '40',
              }}
            >
              <Typography variant="caption" color={trendColor} style={{ fontWeight: '800', fontSize: 11 }}>
                {tendency} {trendIcon}
              </Typography>
            </View>
          </View>

          {/* Forecast Summary & Elevation */}
          <Typography variant="caption" color={theme.colors.text} style={{ fontWeight: '600', fontSize: 11, textAlign: 'center', marginBottom: 4 }}>
            {summary}
          </Typography>

          <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 10 }}>
            Estimated sea-level baseline offset: {altitude > 0 ? `+${altitude}m` : `${altitude}m`}
          </Typography>
        </View>
      )}
    </WidgetCard>
  );
});

export const MoonPhaseWidget = React.memo(function MoonPhaseWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('moon_phase', 'default');
  const theme = useTheme();

  const phaseName = data?.phaseName || 'Waxing Gibbous';
  const illumination = data?.illuminationPercent ?? 75;
  const cycleDay = data?.daysIntoCycle ?? 10.5;
  const emoji = data?.emoji || '🌔';
  const nextMilestone = data?.nextMilestone || 'Full Moon in 4 days';
  const visibilityTip = data?.visibilityTip || 'Clear celestial skies for night viewing';

  return (
    <WidgetCard
      title="Moon Phase & Night Sky"
      iconName="moon"
      badge={`${illumination}% Lit`}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View style={{ alignItems: 'center' }}>
          {/* Celestial Lunar Stage with Starfield & Radiant Moon Disc */}
          <View
            style={{
              width: '100%',
              height: 120,
              borderRadius: 16,
              backgroundColor: theme.colors.surfaceSecondary,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              marginBottom: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            {/* Background Night Sky Stars & Moon Halo */}
            <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
              <Defs>
                <RadialGradient id="moonGlowGrad" cx="50%" cy="50%" rx="50%" ry="50%">
                  <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.25" />
                  <Stop offset="60%" stopColor={theme.colors.primary} stopOpacity="0.08" />
                  <Stop offset="100%" stopColor={theme.colors.primary} stopOpacity="0" />
                </RadialGradient>
              </Defs>

              {/* Distant Star Constellation Sparkles */}
              <Circle cx="20" cy="25" r="1.5" fill={theme.colors.text} opacity={0.5} />
              <Circle cx="45" cy="85" r="1.2" fill={theme.colors.text} opacity={0.35} />
              <Circle cx="75" cy="20" r="1.8" fill={theme.colors.text} opacity={0.6} />
              <Circle cx="120" cy="18" r="1.2" fill={theme.colors.text} opacity={0.4} />
              <Circle cx="150" cy="90" r="1.5" fill={theme.colors.text} opacity={0.5} />
              <Circle cx="180" cy="30" r="1" fill={theme.colors.text} opacity={0.35} />
              <Circle cx="220" cy="75" r="1.8" fill={theme.colors.text} opacity={0.6} />
              <Circle cx="250" cy="22" r="1.2" fill={theme.colors.text} opacity={0.4} />
              <Circle cx="280" cy="80" r="1.5" fill={theme.colors.text} opacity={0.5} />

              {/* Moon Outer Atmospheric Halo */}
              <Circle cx="50%" cy="50%" r="52" fill="url(#moonGlowGrad)" />

              {/* Base Moon Sphere (Unlit / Dark Side) */}
              <Circle cx="50%" cy="50%" r="32" fill={theme.colors.surface} stroke={theme.colors.border} strokeWidth="1" />

              {/* Craters on Dark Side */}
              <Circle cx="46%" cy="42%" r="4" fill={theme.colors.textSecondary} opacity={0.15} />
              <Circle cx="54%" cy="60%" r="5.5" fill={theme.colors.textSecondary} opacity={0.15} />
              <Circle cx="51%" cy="38%" r="2.5" fill={theme.colors.textSecondary} opacity={0.12} />
            </Svg>

            {/* Central Moon Phase Emoji & Large Illuminated Disc */}
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h1" style={{ fontSize: 46, lineHeight: 52 }}>
                {emoji}
              </Typography>
            </View>

            {/* Floating Top-Right Phase Pill */}
            <View
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 10,
              }}
            >
              <Typography variant="caption" style={{ color: theme.colors.text, fontWeight: '800', fontSize: 10 }}>
                {illumination}% ILLUMINATED
              </Typography>
            </View>
          </View>

          {/* Phase Title & Cycle Day Readout */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 10 }}>
            <View>
              <Typography variant="bodyMedium" color={theme.colors.text} style={{ fontWeight: '800', fontSize: 16 }}>
                {phaseName}
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600', fontSize: 11, marginTop: 1 }}>
                Day {cycleDay} of 29.5 lunar cycle
              </Typography>
            </View>

            <View
              style={{
                backgroundColor: theme.colors.primary + (theme.isDark ? '25' : '15'),
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.primary + (theme.isDark ? '40' : '25'),
              }}
            >
              <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '800', fontSize: 11 }}>
                {nextMilestone}
              </Typography>
            </View>
          </View>

          {/* Night Sky Visibility Advisory Strip */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 10,
              backgroundColor: theme.colors.surfaceSecondary,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Icon name="compass" size={13} color={theme.colors.primary} />
            <Typography
              variant="caption"
              color={theme.colors.textSecondary}
              style={{ marginLeft: 6, flex: 1, fontWeight: '600', fontSize: 11 }}
            >
              {visibilityTip}
            </Typography>
          </View>
        </View>
      )}
    </WidgetCard>
  );
});


