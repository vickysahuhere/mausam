import React from 'react';
import { View, Animated } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop as SvgStop, Line, Rect } from 'react-native-svg';
import { WidgetCard, WidgetProps } from './WidgetCard';
import { useWidgetData } from './useWidgetData';
import { Typography } from '../ui/Typography';
import { Icon } from '../ui/Icon';
import { useTheme } from '../../theme/ThemeProvider';

export function CurrentSummaryWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('current_summary', 'default');
  const theme = useTheme();

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
                {data.temp}{'\u00B0'}C
              </Typography>
              <Typography variant="bodyMedium" numberOfLines={2} style={{ fontWeight: '600', marginTop: 2 }}>
                {data.desc}
              </Typography>
            </View>
            <View style={{ alignItems: 'flex-end', paddingTop: 6, flexShrink: 0 }}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600' }}>
                H: {data.high}{'\u00B0'} / L: {data.low}{'\u00B0'}
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 2 }}>
                Feels like {data.feelsLike}{'\u00B0'}C
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
                {data.windSpeed} km/h {data.windDirection}
              </Typography>
            </View>
          </View>
        </View>
      )}
    </WidgetCard>
  );
}

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

  return (
    <WidgetCard
      title="Air Quality (AQI)"
      iconName="wind"
      badge={data?.status}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', flexShrink: 1 }}>
              <Typography variant="h1" color={getAqiColor(data.aqi, theme.colors)} style={{ fontSize: 36, fontWeight: '800', lineHeight: 40 }}>
                {data.aqi}
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginLeft: 8, fontWeight: '700' }}>
                US AQI &bull; {data.status}
              </Typography>
            </View>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 8,
                backgroundColor: theme.colors.surfaceSecondary,
              }}
            >
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600', fontSize: 11 }}>
                PM2.5: {data.pm25} {'\u00B5'}g/m{'\u00B3'}
              </Typography>
            </View>
          </View>

          {/* Continuous Rainbow Spectrum Bar */}
          <View style={{ marginTop: 10, marginBottom: 8 }}>
            <View style={{ height: 8, borderRadius: 4, overflow: 'hidden' }}>
              <Svg width="100%" height="8">
                <Defs>
                  <SvgLinearGradient id="aqiSpectrumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <SvgStop offset="0%" stopColor="#10B981" />
                    <SvgStop offset="25%" stopColor="#F59E0B" />
                    <SvgStop offset="50%" stopColor="#F97316" />
                    <SvgStop offset="75%" stopColor="#EF4444" />
                    <SvgStop offset="90%" stopColor="#8B5CF6" />
                    <SvgStop offset="100%" stopColor="#881337" />
                  </SvgLinearGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="8" rx="4" fill="url(#aqiSpectrumGrad)" />
              </Svg>
            </View>

            {/* Glowing Cursor Pin on Bar */}
            <View
              style={{
                position: 'absolute',
                top: -3,
                left: `${aqiPct}%`,
                marginLeft: -7,
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: '#FFFFFF',
                borderWidth: 2.5,
                borderColor: getAqiColor(data.aqi, theme.colors),
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.35,
                shadowRadius: 3,
                elevation: 0,
              }}
            />
          </View>

          {/* Spectrum Scale Labels */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 }}>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 10, fontWeight: '600' }}>0 Good</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 10, fontWeight: '600' }}>100 Mod</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 10, fontWeight: '600' }}>200 Poor</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 10, fontWeight: '600' }}>300+ Haz</Typography>
          </View>

          {/* Advisory & Telemetry Chips */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 8,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
            }}
          >
            <Icon name="shield" size={13} color={theme.colors.primary} />
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginLeft: 6, flex: 1, fontWeight: '500' }}>
              {data.advisory}
            </Typography>
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

  return (
    <WidgetCard
      title="UV Index & Sun Guard"
      iconName="shield"
      badge={data?.level}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Typography variant="h1" color={getUvColor(data.uvIndex, theme.colors)} style={{ fontSize: 34, fontWeight: '800', lineHeight: 38 }}>
                {data.uvIndex}
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginLeft: 6, fontWeight: '600' }}>
                / 12 &bull; {data.level}
              </Typography>
            </View>
            <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: theme.colors.surfaceSecondary }}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600', fontSize: 11 }}>
                Max at {data.peakTime}
              </Typography>
            </View>
          </View>

          {/* Continuous UV Segment Bar */}
          <View style={{ marginTop: 10, marginBottom: 8 }}>
            <View style={{ height: 6, borderRadius: 3, overflow: 'hidden' }}>
              <Svg width="100%" height="6">
                <Defs>
                  <SvgLinearGradient id="uvBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <SvgStop offset="0%" stopColor="#10B981" />
                    <SvgStop offset="25%" stopColor="#F59E0B" />
                    <SvgStop offset="55%" stopColor="#F97316" />
                    <SvgStop offset="80%" stopColor="#EF4444" />
                    <SvgStop offset="100%" stopColor="#8B5CF6" />
                  </SvgLinearGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="6" rx="3" fill="url(#uvBarGrad)" />
              </Svg>
            </View>

            {/* Pointer pin */}
            <View
              style={{
                position: 'absolute',
                top: -3,
                left: `${uvPct}%`,
                marginLeft: -6,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#FFFFFF',
                borderWidth: 2,
                borderColor: getUvColor(data.uvIndex, theme.colors),
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
                elevation: 0,
              }}
            />
          </View>

          <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 2, fontWeight: '500' }}>
            {data.protectionTip}
          </Typography>
        </View>
      )}
    </WidgetCard>
  );
}

export function PollenWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('pollen_estimate', 'default');
  const theme = useTheme();

  return (
    <WidgetCard
      title="Pollen & Allergens"
      iconName="plant"
      badge={data?.level}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Typography variant="caption" color={theme.colors.textSecondary}>Tree: {data.treePollen}</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>Grass: {data.grassPollen}</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>Ragweed: {data.ragweed}</Typography>
          </View>
          <Typography variant="caption" color={theme.colors.textSecondary}>
            {data.tip}
          </Typography>
        </View>
      )}
    </WidgetCard>
  );
}

export function BestRunHoursWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('best_run_hours', 'default');
  const theme = useTheme();

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
                <Typography variant="caption" color={theme.colors.success || '#10B981'} style={{ fontSize: 10, fontWeight: '600', marginTop: 2 }}>
                  {idx === 0 ? 'Optimal' : 'Good'}
                </Typography>
              </View>
            ))}
          </View>

          {/* Sub-telemetry details */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 6, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 11 }}>
              Morning: ~{data.morningTemp}°C
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 11 }}>
              Evening: ~{data.eveningTemp}°C
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

  // Calculate sun position along daylight curve
  const currentHour = new Date().getHours() + new Date().getMinutes() / 60;
  const isDay = currentHour >= 6 && currentHour <= 18.5;
  const dayProgress = Math.max(0, Math.min(1, (currentHour - 6) / 12.5));

  // Parametric parabolic coordinates for 240x60 viewBox
  const sunX = 20 + dayProgress * 200;
  const sunY = 50 - 42 * Math.sin(Math.PI * dayProgress);

  return (
    <WidgetCard
      title="Sun Track & Daylight"
      iconName="sun"
      badge={data?.daylightDuration}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View>
          {/* SVG Daylight Horizon Arc */}
          <View style={{ alignItems: 'center', marginVertical: 4 }}>
            <Svg width="100%" height="68" viewBox="0 0 240 68">
              <Defs>
                <SvgLinearGradient id="sunArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <SvgStop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                  <SvgStop offset="50%" stopColor="#EAB308" stopOpacity="1" />
                  <SvgStop offset="100%" stopColor="#F97316" stopOpacity="0.4" />
                </SvgLinearGradient>
              </Defs>

              {/* Horizon Line */}
              <Line x1="10" y1="52" x2="230" y2="52" stroke={theme.colors.border} strokeWidth="1.5" strokeDasharray="3 3" />

              {/* Parabolic Solar Curve */}
              <Path
                d="M 20 52 Q 120 4 220 52"
                fill="none"
                stroke="url(#sunArcGrad)"
                strokeWidth="2.5"
              />

              {/* Sun Position Node */}
              {isDay && (
                <>
                  {/* Glowing Solar Aura */}
                  <Circle cx={sunX} cy={sunY} r="9" fill="#FBBF24" opacity="0.3" />
                  {/* Sun Core */}
                  <Circle cx={sunX} cy={sunY} r="5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
                </>
              )}
            </Svg>
          </View>

          {/* Times Grid */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
            <View style={{ alignItems: 'flex-start' }}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 11, fontWeight: '600' }}>
                First Light
              </Typography>
              <Typography variant="bodyMedium" style={{ fontWeight: '700', fontSize: 13, marginTop: 1 }}>
                {data.firstLight}
              </Typography>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 11, fontWeight: '600' }}>
                Sunrise
              </Typography>
              <Typography variant="bodyMedium" style={{ fontWeight: '700', fontSize: 13, marginTop: 1, color: '#F59E0B' }}>
                {data.sunrise}
              </Typography>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 11, fontWeight: '600' }}>
                Sunset
              </Typography>
              <Typography variant="bodyMedium" style={{ fontWeight: '700', fontSize: 13, marginTop: 1, color: '#F97316' }}>
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
                  Water ~{data.waterTemp}°C
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
              <Typography variant="h3" color={theme.colors.primary}>{c.temp}{'\u00B0'}C</Typography>
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
            <Typography variant="h3" color={theme.colors.primary}>{data.temp}{'\u00B0'}C</Typography>
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
            <Typography variant="caption" color={theme.colors.textSecondary}>Min ground ~{data.minGroundTemp}{'\u00B0'}C</Typography>
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
      badge={data?.saturation}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View>
          {/* Dual Layer Stratification */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
            <View style={{ flex: 1, backgroundColor: theme.colors.surfaceSecondary, padding: 8, borderRadius: 8 }}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 10, fontWeight: '600' }}>
                Topsoil (0-10cm)
              </Typography>
              <Typography variant="bodyMedium" style={{ fontWeight: '700', marginTop: 2 }}>
                {data.depth10cm}
              </Typography>
              <View style={{ height: 4, borderRadius: 2, backgroundColor: theme.colors.border, marginTop: 4, overflow: 'hidden' }}>
                <View style={{ width: '68%', height: '100%', backgroundColor: theme.colors.primary, borderRadius: 2 }} />
              </View>
            </View>

            <View style={{ flex: 1, backgroundColor: theme.colors.surfaceSecondary, padding: 8, borderRadius: 8 }}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 10, fontWeight: '600' }}>
                Root Zone (10-40cm)
              </Typography>
              <Typography variant="bodyMedium" style={{ fontWeight: '700', marginTop: 2 }}>
                {data.depth40cm}
              </Typography>
              <View style={{ height: 4, borderRadius: 2, backgroundColor: theme.colors.border, marginTop: 4, overflow: 'hidden' }}>
                <View style={{ width: '82%', height: '100%', backgroundColor: theme.colors.success || '#10B981', borderRadius: 2 }} />
              </View>
            </View>
          </View>

          <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '500' }}>
            {data.recommendation}
          </Typography>
        </View>
      )}
    </WidgetCard>
  );
}

export function VisibilityFogWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('visibility_fog', 'default');
  const theme = useTheme();

  return (
    <WidgetCard
      title="Road Visibility & Fog"
      iconName="fog"
      badge={data?.status}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexShrink: 0, marginRight: 8 }}>
              <Typography variant="h1" style={{ fontSize: 32, fontWeight: '800' }}>
                {data.visibility}
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600' }}>
                Fog Risk: {data.fogRisk}
              </Typography>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Typography variant="caption" numberOfLines={2} color={theme.colors.textSecondary} style={{ textAlign: 'right', fontWeight: '500' }}>
                {data.commuteImpact}
              </Typography>
            </View>
          </View>

          {/* Visibility distance progress indicator */}
          <View style={{ height: 4, borderRadius: 2, backgroundColor: theme.colors.surfaceSecondary, marginTop: 10, overflow: 'hidden' }}>
            <View style={{ width: '85%', height: '100%', backgroundColor: theme.colors.primary, borderRadius: 2 }} />
          </View>
        </View>
      )}
    </WidgetCard>
  );
}

export function ExtendedForecastWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('extended_forecast', 'default');
  const theme = useTheme();

  const days = data?.days || [];
  const minWeek = days.length > 0 ? Math.min(...days.map((d: any) => typeof d.low === 'number' ? d.low : parseInt(d.low, 10) || 15)) : 15;
  const maxWeek = days.length > 0 ? Math.max(...days.map((d: any) => typeof d.high === 'number' ? d.high : parseInt(d.high, 10) || 30)) : 30;
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
            const low = typeof d.low === 'number' ? d.low : parseInt(d.low, 10) || 15;
            const high = typeof d.high === 'number' ? d.high : parseInt(d.high, 10) || 30;
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
                        backgroundColor: '#FFFFFF',
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

  return (
    <WidgetCard
      title="Thermal Comfort Index"
      iconName="thermometer"
      badge={data?.category}
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexShrink: 0, marginRight: 8 }}>
            <Typography variant="h2" color={theme.colors.primary}>
              {data.score} <Typography variant="caption" color={theme.colors.textSecondary}>/ 100</Typography>
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>{data.humidityImpact}</Typography>
          </View>
          <View style={{ flex: 1, flexShrink: 1, alignItems: 'flex-end' }}>
            <Typography variant="caption" numberOfLines={2} color={theme.colors.textSecondary} style={{ textAlign: 'right' }}>
              {data.coolingTip}
            </Typography>
          </View>
        </View>
      )}
    </WidgetCard>
  );
}
