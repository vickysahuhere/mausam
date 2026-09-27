'use client';

import React from 'react';
import { WidgetCard, WidgetProps } from './WidgetCard';
import { useWidgetData } from './useWidgetData';
import { Typography } from '../ui/Typography';
import { Icon } from '../ui/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useUnitStore } from '../../store/useUnitStore';
import { calculateMoonPhase } from '../../lib/solarAlmanac';

// 1. Current Summary Widget
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
        <div>
          <div className="flex justify-between items-start">
            <div>
              <Typography variant="h1" className="text-4xl font-extrabold">
                {convertTemp(data.temp)}°{temperatureUnit}
              </Typography>
              <Typography variant="bodyMedium" className="font-medium mt-1">
                {data.desc}
              </Typography>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold opacity-70 block">
                H: {convertTemp(data.high)}° / L: {convertTemp(data.low)}°
              </span>
              <span className="text-xs opacity-60 mt-1 block">
                Feels like {convertTemp(data.feelsLike)}°{temperatureUnit}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-1.5" style={{ color: theme.colors.textSecondary }}>
              <Icon name="droplet" size={14} color={theme.colors.primary} />
              <span>{data.humidity}% Humidity</span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: theme.colors.textSecondary }}>
              <Icon name="wind" size={14} color={theme.colors.primary} />
              <span>{formatWind(data.windSpeed)} {data.windDirection}</span>
            </div>
          </div>
        </div>
      )}
    </WidgetCard>
  );
});

// 2. Hourly Forecast Widget (24-Hour horizontal timeline)
export const HourlyForecastWidget = React.memo(function HourlyForecastWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('hourly_forecast', 'default');
  const theme = useTheme();
  const convertTemp = useUnitStore((state) => state.convertTemp);

  return (
    <WidgetCard
      title="24-Hour Forecast"
      iconName="clock"
      badge="Timeline"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data?.hours && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
          {data.hours.slice(0, 12).map((item: any, idx: number) => (
            <div
              key={idx}
              className="flex flex-col items-center min-w-[62px] p-2.5 rounded-xl snap-start text-center border border-slate-200/50 dark:border-slate-800/50"
              style={{ backgroundColor: `${theme.colors.surfaceSecondary || theme.colors.surface}` }}
            >
              <span className="text-xs font-semibold opacity-75">{item.time}</span>
              <div className="my-2 text-sky-500">
                <Icon name={item.icon || 'sun'} size={20} color={theme.colors.primary} />
              </div>
              <span className="text-sm font-bold">{convertTemp(item.temp)}°</span>
              {item.precipProb !== undefined && (
                <span className="text-[10px] font-medium text-blue-500 mt-1">
                  {item.precipProb}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
});

// 3. Air Quality Index (AQI) Widget
export const AqiWidget = React.memo(function AqiWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('aqi_card', 'default');
  const theme = useTheme();

  return (
    <WidgetCard
      title="Air Quality (AQI)"
      iconName="wind"
      badge="Health"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold" style={{ color: data.color }}>
                {data.aqi}
              </span>
              <span className="text-sm font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: `${data.color}20`, color: data.color }}>
                {data.category}
              </span>
            </div>
            <div className="text-xs text-right opacity-70">
              <div>PM2.5: {data.pm25} µg/m³</div>
              <div>PM10: {data.pm10} µg/m³</div>
            </div>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${Math.min(100, (data.aqi / 350) * 100)}%`,
                backgroundColor: data.color,
              }}
            />
          </div>
          <p className="text-xs font-medium opacity-80 leading-relaxed">
            {data.advisory || 'Air quality is within normal limits. Enjoy outdoor activities.'}
          </p>
        </div>
      )}
    </WidgetCard>
  );
});

// 4. UV Index & Sun Guard Widget
export const UvIndexWidget = React.memo(function UvIndexWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('uv_index', 'default');
  const theme = useTheme();

  return (
    <WidgetCard
      title="UV Index & Sun Guard"
      iconName="shield"
      badge="Outdoors"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <div>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-3xl font-extrabold" style={{ color: theme.colors.primary }}>
              {data.value ?? data.uvIndex ?? '3.5'}
            </span>
            <span className="text-sm font-semibold">{data.level || 'Moderate'}</span>
          </div>
          <p className="text-xs opacity-80 leading-relaxed">
            {data.recommendation || 'Apply SPF 30+ sunscreen if outdoors for more than 45 minutes.'}
          </p>
        </div>
      )}
    </WidgetCard>
  );
});

// 5. Pollen & Allergens Widget
export const PollenWidget = React.memo(function PollenWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('pollen_estimate', 'default');
  const theme = useTheme();

  return (
    <WidgetCard
      title="Pollen & Allergens"
      iconName="plant"
      badge="Health"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <div className="space-y-2">
          {['Tree', 'Grass', 'Ragweed'].map((type) => (
            <div key={type} className="flex justify-between items-center text-xs">
              <span className="font-medium opacity-80">{type} Pollen</span>
              <span className="px-2 py-0.5 rounded-md font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Low
              </span>
            </div>
          ))}
          <p className="text-xs opacity-75 pt-1 border-t border-slate-200 dark:border-slate-800">
            {data.summary || 'Low allergen risk today. Ideal for open window ventilation.'}
          </p>
        </div>
      )}
    </WidgetCard>
  );
});

// 6. Best Workout Hours Widget
export const BestRunHoursWidget = React.memo(function BestRunHoursWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('best_run_hours', 'default');
  const theme = useTheme();

  return (
    <WidgetCard
      title="Best Workout Windows"
      iconName="run"
      badge="Fitness"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2.5 py-1 rounded-lg font-bold bg-lime-500/20 text-lime-600 dark:text-lime-400">
              Optimal: {data.bestWindow || '6:00 AM - 8:30 AM'}
            </span>
          </div>
          <p className="text-xs opacity-80 leading-relaxed">
            {data.tip || 'Cool morning temperatures with low humidity offer peak endurance performance.'}
          </p>
        </div>
      )}
    </WidgetCard>
  );
});

// 7. Sun Track & Daylight Widget
export const SunriseSunsetWidget = React.memo(function SunriseSunsetWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('sunrise_sunset', 'default');
  const theme = useTheme();

  return (
    <WidgetCard
      title="Sun Track & Daylight"
      iconName="sun"
      badge="Solar"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      {data && (
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <Icon name="sun" size={16} className="mx-auto mb-1 text-amber-500" />
            <span className="text-[11px] opacity-70 block">Sunrise</span>
            <span className="text-sm font-bold">{data.sunrise || '6:18 AM'}</span>
          </div>
          <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <Icon name="moon" size={16} className="mx-auto mb-1 text-indigo-500" />
            <span className="text-[11px] opacity-70 block">Sunset</span>
            <span className="text-sm font-bold">{data.sunset || '6:42 PM'}</span>
          </div>
        </div>
      )}
    </WidgetCard>
  );
});

// 8. Sea State & Wave Height
export const SeaStateWidget = React.memo(function SeaStateWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('sea_state', 'default');
  return (
    <WidgetCard
      title="Sea State & Wave Height"
      iconName="wave"
      badge="Marine"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      <div className="flex justify-between items-center">
        <div>
          <span className="text-2xl font-bold">{data?.waveHeight || '0.8 m'}</span>
          <span className="text-xs opacity-70 block">{data?.state || 'Smooth (Douglas Scale 2)'}</span>
        </div>
        <div className="text-right text-xs opacity-80">
          <div>Water: {data?.waterTemp || '27°C'}</div>
          <div>Period: {data?.period || '6 sec'}</div>
        </div>
      </div>
    </WidgetCard>
  );
});

// 9. Tide Times Widget
export const TideTimesWidget = React.memo(function TideTimesWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('tide_times', 'default');
  return (
    <WidgetCard
      title="Tide Schedule (INCOIS)"
      iconName="wave"
      badge="Coastal"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <span className="font-bold block">High Tide</span>
          <span>10:45 AM • 2.4m</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-500/10 opacity-80">
          <span className="font-bold block">Low Tide</span>
          <span>4:20 PM • 0.6m</span>
        </div>
      </div>
    </WidgetCard>
  );
});

// 10. Destination Weather Widget
export const DestinationWeatherWidget = React.memo(function DestinationWeatherWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('destination_weather', 'default');
  return (
    <WidgetCard
      title="Destination Outlook"
      iconName="compass"
      badge="Travel"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      <div className="flex justify-between items-center text-xs">
        <div>
          <span className="font-bold text-sm block">Mumbai</span>
          <span className="opacity-70">Clear Skies</span>
        </div>
        <div className="text-right">
          <span className="text-base font-extrabold">31°C</span>
          <span className="opacity-70 block">AQI 85</span>
        </div>
      </div>
    </WidgetCard>
  );
});

// 11. Smart Packing Tip Widget
export const PackingTipWidget = React.memo(function PackingTipWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('packing_tip', 'default');
  return (
    <WidgetCard
      title="Smart Packing Assistant"
      iconName="shield"
      badge="Travel"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      <p className="text-xs opacity-85 leading-relaxed">
        {data?.tip || 'Light cotton clothing recommended with sunglasses and a compact umbrella for sudden afternoon showers.'}
      </p>
    </WidgetCard>
  );
});

// 12. School Commute Window Widget
export const SchoolCommuteWidget = React.memo(function SchoolCommuteWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('school_commute', 'default');
  return (
    <WidgetCard
      title="School Commute Window"
      iconName="calendar"
      badge="Family"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-500/10">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Morning Drop (7-9 AM)</span>
          <span className="font-bold">24°C • Dry</span>
        </div>
        <div className="flex justify-between items-center p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
          <span className="font-semibold">Afternoon Pickup (2-4 PM)</span>
          <span className="font-bold">32°C • Sunny</span>
        </div>
      </div>
    </WidgetCard>
  );
});

// 13. Precipitation / Rain Timeline Widget
export const RainTimelineWidget = React.memo(function RainTimelineWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('rain_timeline', 'default');
  return (
    <WidgetCard
      title="Precipitation Timeline"
      iconName="rain"
      badge="Rain"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      <div className="text-xs">
        <span className="font-bold text-sm block mb-1">
          {data?.summary || 'No precipitation expected in the next 12 hours.'}
        </span>
        <span className="opacity-70">Probability under 10% across your district.</span>
      </div>
    </WidgetCard>
  );
});

// 14. Frost & Cold Alert Widget
export const FrostAlertWidget = React.memo(function FrostAlertWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('frost_alert', 'default');
  return (
    <WidgetCard
      title="Frost & Cold Risk"
      iconName="thermometer"
      badge="Agriculture"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-emerald-500/15 text-emerald-600">
          ✓
        </div>
        <div className="text-xs">
          <span className="font-bold block">No Frost Threat</span>
          <span className="opacity-70">Minimum ground temperature safely above 12°C.</span>
        </div>
      </div>
    </WidgetCard>
  );
});

// 15. District Rainfall Forecast
export const RainfallForecastWidget = React.memo(function RainfallForecastWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('rainfall_forecast', 'default');
  return (
    <WidgetCard
      title="District Rainfall Forecast"
      iconName="rain"
      badge="Agriculture"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      <div className="text-xs">
        <span className="font-bold text-base block">0.0 mm / 24h</span>
        <span className="opacity-70">Normal seasonal baseline for this district.</span>
      </div>
    </WidgetCard>
  );
});

// 16. Soil Moisture Index Widget
export const SoilMoistureWidget = React.memo(function SoilMoistureWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('soil_moisture', 'default');
  return (
    <WidgetCard
      title="Soil Moisture Index"
      iconName="plant"
      badge="Agriculture"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between font-semibold">
          <span>Root Zone (0-10cm)</span>
          <span>42% (Optimal)</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 w-[42%]" />
        </div>
      </div>
    </WidgetCard>
  );
});

// 17. Visibility & Fog Widget
export const VisibilityFogWidget = React.memo(function VisibilityFogWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('visibility_fog', 'default');
  return (
    <WidgetCard
      title="Road Visibility & Fog"
      iconName="fog"
      badge="Commute"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      <div className="flex justify-between items-center text-xs">
        <div>
          <span className="text-xl font-extrabold block">10+ km</span>
          <span className="opacity-70">Clear Driving Conditions</span>
        </div>
        <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold">
          High Visibility
        </span>
      </div>
    </WidgetCard>
  );
});

// 18. Extended Forecast (5-7 Day Outlook)
export const ExtendedForecastWidget = React.memo(function ExtendedForecastWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('extended_forecast', 'default');
  const convertTemp = useUnitStore((state) => state.convertTemp);

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
      {data?.days && (
        <div className="space-y-2.5">
          {data.days.slice(0, 5).map((d: any, i: number) => (
            <div key={i} className="flex justify-between items-center text-xs">
              <span className="font-semibold w-16">{d.day}</span>
              <div className="flex items-center gap-1.5 opacity-80 flex-1">
                <Icon name={d.icon || 'sun'} size={15} />
                <span className="truncate">{d.condition}</span>
              </div>
              <span className="font-bold text-right w-20">
                {convertTemp(d.max)}° / {convertTemp(d.min)}°
              </span>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
});

// 19. Thermal Comfort Index Widget
export const ComfortIndexWidget = React.memo(function ComfortIndexWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const { data, loading, error } = useWidgetData<any>('comfort_index', 'default');
  return (
    <WidgetCard
      title="Thermal Comfort Index"
      iconName="thermometer"
      badge="Comfort"
      loading={loading}
      error={error}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      <div className="flex justify-between items-center text-xs">
        <div>
          <span className="text-xl font-bold block">Comfortable</span>
          <span className="opacity-70">Balanced temperature & low humidity</span>
        </div>
        <span className="text-2xl">😊</span>
      </div>
    </WidgetCard>
  );
});

// 20. Moon Phase Widget
export const MoonPhaseWidget = React.memo(function MoonPhaseWidget({ id, isCustomizing, onRemove }: WidgetProps) {
  const moon = calculateMoonPhase();
  return (
    <WidgetCard
      title="Lunar Cycle & Moon Phase"
      iconName="moon"
      badge="Astronomy"
      loading={false}
      error={null}
      isCustomizing={isCustomizing}
      onRemove={onRemove}
    >
      <div className="flex justify-between items-center text-xs">
        <div>
          <span className="text-base font-bold block">{moon.phaseName}</span>
          <span className="opacity-70">Illumination: {moon.illuminationPercent}%</span>
        </div>
        <span className="text-3xl">🌔</span>
      </div>
    </WidgetCard>
  );
});

// Export master widget map
export const WIDGET_MAP: Record<string, React.FC<any>> = {
  current_summary: CurrentSummaryWidget,
  hourly_forecast: HourlyForecastWidget,
  aqi_card: AqiWidget,
  uv_index: UvIndexWidget,
  pollen_estimate: PollenWidget,
  best_run_hours: BestRunHoursWidget,
  sunrise_sunset: SunriseSunsetWidget,
  sea_state: SeaStateWidget,
  tide_times: TideTimesWidget,
  destination_weather: DestinationWeatherWidget,
  packing_tip: PackingTipWidget,
  school_commute: SchoolCommuteWidget,
  rain_timeline: RainTimelineWidget,
  frost_alert: FrostAlertWidget,
  rainfall_forecast: RainfallForecastWidget,
  soil_moisture: SoilMoistureWidget,
  visibility_fog: VisibilityFogWidget,
  extended_forecast: ExtendedForecastWidget,
  comfort_index: ComfortIndexWidget,
  moon_phase: MoonPhaseWidget,
};
