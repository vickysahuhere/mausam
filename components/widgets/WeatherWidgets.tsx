import React from 'react';
import { View } from 'react-native';
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

export function AqiWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('aqi_card', 'default');
  const theme = useTheme();

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
              <Typography variant="h1" color={data.aqi > 100 ? theme.colors.warning : theme.colors.success}>
                {data.aqi}
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginLeft: 8 }}>
                US AQI
              </Typography>
            </View>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ flexShrink: 1 }}>
              PM2.5: {data.pm25} {'\u00B5'}g/m{'\u00B3'}
            </Typography>
          </View>
          <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
            {data.advisory}
          </Typography>
        </View>
      )}
    </WidgetCard>
  );
}

export function UvIndexWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('uv_index', 'default');
  const theme = useTheme();

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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h2" color={theme.colors.warning}>
              {data.uvIndex} <Typography variant="caption" color={theme.colors.textSecondary}>/ 12</Typography>
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>
              Max at {data.peakTime}
            </Typography>
          </View>
          <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
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
          <Typography variant="bodyMedium" color={theme.colors.success} style={{ fontWeight: '600' }}>
            {data.hours.join('  \u2022  ')}
          </Typography>
          <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
            Morning ~{data.morningTemp}{'\u00B0'}C  |  Evening ~{data.eveningTemp}{'\u00B0'}C  |  Air {data.airScore}
          </Typography>
        </View>
      )}
    </WidgetCard>
  );
}

export function SunriseSunsetWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('sunrise_sunset', 'default');
  const theme = useTheme();

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
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
          <View style={{ alignItems: 'center' }}>
            <Typography variant="caption" color={theme.colors.textSecondary}>First Light</Typography>
            <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>{data.firstLight}</Typography>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Typography variant="caption" color={theme.colors.textSecondary}>Sunrise</Typography>
            <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>{data.sunrise}</Typography>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Typography variant="caption" color={theme.colors.textSecondary}>Sunset</Typography>
            <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>{data.sunset}</Typography>
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexShrink: 0, marginRight: 8 }}>
            <Typography variant="h2" color={theme.colors.primary}>{data.waveHeight}</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>Swell: {data.swellPeriod}</Typography>
          </View>
          <View style={{ flex: 1, flexShrink: 1, alignItems: 'flex-end' }}>
            <Typography variant="bodyMedium" numberOfLines={2} style={{ fontWeight: '600', textAlign: 'right' }}>
              {data.seaCondition}
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>Water ~{data.waterTemp}{'\u00B0'}C</Typography>
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, flexShrink: 1, marginRight: 8 }}>
            <Typography variant="caption" color={theme.colors.textSecondary}>Next High Tide</Typography>
            <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>{data.nextHigh}</Typography>
          </View>
          <View style={{ flex: 1, flexShrink: 1, alignItems: 'flex-end' }}>
            <Typography variant="caption" color={theme.colors.textSecondary}>Next Low Tide</Typography>
            <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>{data.nextLow}</Typography>
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
            <View key={i} style={{ flex: 1, paddingRight: 8 }}>
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {data.timeline?.map((slot: any, i: number) => (
              <View key={i} style={{ alignItems: 'center' }}>
                <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 11 }}>
                  {slot.time}
                </Typography>
                <View
                  style={{
                    width: 14,
                    height: Math.max(8, slot.prob * 0.5),
                    backgroundColor: slot.prob > 20 ? theme.colors.primary : theme.colors.border,
                    borderRadius: 3,
                    marginVertical: 4,
                  }}
                />
                <Typography variant="caption" style={{ fontSize: 10, fontWeight: '600' }}>
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Typography variant="caption" color={theme.colors.textSecondary}>Depth 10cm: {data.depth10cm}</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>Depth 40cm: {data.depth40cm}</Typography>
          </View>
          <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexShrink: 0, marginRight: 8 }}>
            <Typography variant="h2">{data.visibility}</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>Fog Risk: {data.fogRisk}</Typography>
          </View>
          <View style={{ flex: 1, flexShrink: 1, alignItems: 'flex-end' }}>
            <Typography variant="caption" numberOfLines={2} color={theme.colors.textSecondary} style={{ textAlign: 'right' }}>
              {data.commuteImpact}
            </Typography>
          </View>
        </View>
      )}
    </WidgetCard>
  );
}

export function ExtendedForecastWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('extended_forecast', 'default');
  const theme = useTheme();

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
        <View>
          {data.days?.map((d: any, i: number) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 3,
              }}
            >
              <Typography variant="bodyMedium" numberOfLines={1} style={{ width: 80, flexShrink: 0, fontWeight: '500' }}>{d.day}</Typography>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, flexShrink: 1, paddingHorizontal: 4 }}>
                {d.iconName && (
                  <View style={{ marginRight: 6 }}>
                    <Icon name={d.iconName} size={14} color={theme.colors.textSecondary} />
                  </View>
                )}
                <Typography variant="caption" numberOfLines={1} color={theme.colors.textSecondary}>{d.cond}</Typography>
              </View>
              <Typography variant="bodyMedium" style={{ fontWeight: '600', flexShrink: 0 }}>
                {d.high}{'\u00B0'} <Typography variant="caption" color={theme.colors.textSecondary}>{d.low}{'\u00B0'}</Typography>
              </Typography>
            </View>
          ))}
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
