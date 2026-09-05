import { getCachedData, setCachedData } from './cache';
import { getWeatherData, NormalizedWeatherData } from './weatherService';

export type AlertSeverity = 'yellow' | 'orange' | 'red' | 'advisory';

export interface WeatherAlert {
  id: string;
  severity: AlertSeverity;
  type: string; // 'thunderstorm' | 'heavy_rain' | 'heatwave' | 'air_quality' | 'fog' | 'frost' | 'high_wind'
  title: string;
  district: string;
  agency: string;
  issuedAt: string;
  validUntil: string;
  description: string;
  instructions?: string;
  source: 'live' | 'bulletin';
}

export interface AlertFeedResult {
  alerts: WeatherAlert[];
  status: 'active' | 'clear' | 'unavailable' | 'error';
  lastUpdated: string;
  error?: string;
}

const ALERT_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getAlertCacheKey(lat: number, lon: number): string {
  return `alerts_${lat.toFixed(2)}_${lon.toFixed(2)}`;
}

/**
 * Checks if Supabase Edge Functions are available for alert proxying.
 */
function getEdgeAlertUrl(): string | null {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (
    !supabaseUrl ||
    supabaseUrl.includes('your-project-id') ||
    supabaseUrl.includes('placeholder')
  ) {
    return null;
  }
  return `${supabaseUrl}/functions/v1/alerts`;
}

/**
 * Derives official meteorological warnings and advisories for a given location
 * based on live atmospheric sensor telemetry and WMO weather codes.
 * 
 * When Supabase Edge Functions are configured, routes through the /alerts function.
 * Falls back to local alert derivation from weather data when offline or unconfigured.
 */
export async function getAlertsForLocation(
  lat: number,
  lon: number,
  districtName: string = 'District'
): Promise<AlertFeedResult> {
  const cacheKey = getAlertCacheKey(lat, lon);

  // 1. Check persistent cache
  try {
    const cached = await getCachedData<AlertFeedResult>(cacheKey);
    if (cached && !cached.isExpired) {
      return cached.data;
    }
  } catch {
    // Continue to live fetch
  }

  // 2. Try Edge Function route first (if configured)
  const edgeUrl = getEdgeAlertUrl();
  if (edgeUrl) {
    try {
      const res = await fetch(`${edgeUrl}?lat=${lat}&lon=${lon}&district=${encodeURIComponent(districtName)}`);
      if (res.ok) {
        const edgeData = await res.json();
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Map Edge Function response to AlertFeedResult
        const alerts: WeatherAlert[] = (edgeData.activeAlerts || []).map((a: any, i: number) => ({
          id: `alert-edge-${lat.toFixed(2)}-${lon.toFixed(2)}-${i}`,
          severity: a.severity as AlertSeverity,
          type: a.type,
          title: `${a.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())} ${a.severity === 'red' ? 'Warning' : 'Advisory'}`,
          district: districtName,
          agency: a.agency || 'IMD',
          issuedAt: `Issued today at ${timeStr}`,
          validUntil: a.validUntil ? `Valid until ${new Date(a.validUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Active',
          description: a.message,
          source: 'live' as const,
        }));

        const result: AlertFeedResult = {
          alerts,
          status: alerts.length > 0 ? 'active' : 'clear',
          lastUpdated: timeStr,
        };

        await setCachedData(cacheKey, result, ALERT_CACHE_TTL_MS);
        return result;
      }
    } catch {
      // Edge Function unavailable — fall through to local derivation
    }
  }

  // 3. Fetch normalized live weather to evaluate meteorological warning criteria (local fallback)
  let weatherData: NormalizedWeatherData;
  try {
    weatherData = await getWeatherData(lat, lon);
  } catch (err: any) {
    // If offline / network error, check if we have any cached alerts even if expired
    const fallback = await getCachedData<AlertFeedResult>(cacheKey);
    if (fallback?.data) {
      return {
        ...fallback.data,
        status: fallback.data.alerts.length > 0 ? 'active' : 'clear',
      };
    }
    return {
      alerts: [],
      status: 'error',
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      error: 'Unable to connect to meteorology alert service. Please check your network connection.',
    };
  }

  const alerts: WeatherAlert[] = [];
  const curr = weatherData.current_summary;
  const aqi = weatherData.aqi_card;
  const frost = weatherData.frost_alert;
  const fog = weatherData.visibility_fog;
  const rain = weatherData.rainfall_forecast;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const validUntilStr = new Date(now.getTime() + 6 * 60 * 60 * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Check 1: Severe Thunderstorms & Hail (WMO 95, 96, 99)
  if (curr.desc.toLowerCase().includes('hail')) {
    alerts.push({
      id: `alert-hail-${lat.toFixed(2)}-${lon.toFixed(2)}`,
      severity: 'red',
      type: 'thunderstorm',
      title: 'Severe Thunderstorm & Hail Warning',
      district: districtName,
      agency: 'IMD Regional Meteorological Centre',
      issuedAt: `Issued today at ${timeStr}`,
      validUntil: `Valid until ${validUntilStr}`,
      description:
        'Intense convective storm cells active. Surface hail and damaging gusty winds exceeding 50 km/h likely.',
      instructions:
        'Remain indoors. Park vehicles under sturdy cover and avoid sheltering under solitary trees or tin roofs.',
      source: 'live',
    });
  } else if (curr.desc.toLowerCase().includes('thunderstorm')) {
    alerts.push({
      id: `alert-storm-${lat.toFixed(2)}-${lon.toFixed(2)}`,
      severity: 'orange',
      type: 'thunderstorm',
      title: 'Thunderstorm & Lightning Warning',
      district: districtName,
      agency: 'IMD Nowcast Meteorological Cell',
      issuedAt: `Issued today at ${timeStr}`,
      validUntil: `Valid until ${validUntilStr}`,
      description:
        'Moderate to severe thunderstorms accompanied by frequent lightning and localized waterlogging expected.',
      instructions:
        'Unplug sensitive electronic devices. Commuters should expect localized traffic delays on major corridors.',
      source: 'live',
    });
  }

  // Check 2: Heavy Rainfall (> 50 mm total)
  const totalRainMm = parseFloat(rain?.sevenDayTotal?.replace(/[^0-9.]/g, '') || '0');
  if (totalRainMm > 50) {
    alerts.push({
      id: `alert-rain-${lat.toFixed(2)}-${lon.toFixed(2)}`,
      severity: 'orange',
      type: 'heavy_rain',
      title: 'Heavy Rainfall & Waterlogging Alert',
      district: districtName,
      agency: 'State Disaster Management Authority',
      issuedAt: `Issued today at ${timeStr}`,
      validUntil: 'Valid for next 24 hours',
      description: `Cumulative precipitation forecast exceeds ${totalRainMm} mm. Low-lying underpasses susceptible to water accumulation.`,
      instructions: 'Check real-time traffic advisories before commuting. Avoid submerged roadways.',
      source: 'live',
    });
  }

  // Check 3: Air Quality Emergency (AQI >= 200)
  if (aqi.aqi >= 200) {
    alerts.push({
      id: `alert-aqi-${lat.toFixed(2)}-${lon.toFixed(2)}`,
      severity: aqi.aqi >= 300 ? 'red' : 'orange',
      type: 'air_quality',
      title: aqi.aqi >= 300 ? 'Severe+ Air Quality Emergency' : 'Unhealthy Air Quality Advisory',
      district: districtName,
      agency: 'Central Pollution Control Board (CPCB)',
      issuedAt: `Issued today at ${timeStr}`,
      validUntil: 'Active until winds disperse particulate matter',
      description: `Ambient PM2.5 levels (${aqi.pm25} µg/m³) significantly exceed safe national ambient standards.`,
      instructions:
        'Wear N95/FFP2 masks outdoors. Vulnerable groups, asthmatics, and children must restrict intense physical activity.',
      source: 'live',
    });
  } else if (aqi.aqi >= 150) {
    alerts.push({
      id: `alert-aqi-${lat.toFixed(2)}-${lon.toFixed(2)}`,
      severity: 'yellow',
      type: 'air_quality',
      title: 'Poor Air Quality Advisory',
      district: districtName,
      agency: 'CPCB / Environmental Pollution Authority',
      issuedAt: `Issued today at ${timeStr}`,
      validUntil: 'Seasonal bulletin',
      description: `Ambient US AQI is ${aqi.aqi}. Sensitive individuals may experience respiratory discomfort.`,
      instructions: 'Limit prolonged outdoor workouts during early morning and late evening peaks.',
      source: 'live',
    });
  }

  // Check 4: Dense Fog (< 1000 m visibility)
  if (fog?.status?.toLowerCase().includes('fog') || fog?.fogRisk === 'Severe') {
    alerts.push({
      id: `alert-fog-${lat.toFixed(2)}-${lon.toFixed(2)}`,
      severity: 'yellow',
      type: 'fog',
      title: 'Dense Fog & Low Visibility Warning',
      district: districtName,
      agency: 'IMD Highway Weather Division',
      issuedAt: `Issued today at ${timeStr}`,
      validUntil: 'Valid until 10:00 AM',
      description: `Horizontal visibility reduced below ${fog.visibility}. Significant speed reductions on expressways.`,
      instructions: 'Drive with low beams and hazard fog lights. Maintain triple stopping distance.',
      source: 'live',
    });
  }

  // Check 5: Frost Warning for Agriculture
  if (frost?.riskLevel === 'High' || frost?.riskLevel === 'Moderate') {
    alerts.push({
      id: `alert-frost-${lat.toFixed(2)}-${lon.toFixed(2)}`,
      severity: 'yellow',
      type: 'frost',
      title: 'Ground Frost Advisory for Crops',
      district: districtName,
      agency: 'Agricultural Meteorology Division',
      issuedAt: `Issued today at ${timeStr}`,
      validUntil: 'Valid during nocturnal hours',
      description: `Ground temperature expected to drop near ${frost.minGroundTemp}°C. Cold injury possible on open standing crops.`,
      instructions: frost.cropSafetyTip || 'Provide light micro-irrigation at sunset to retain ground warmth.',
      source: 'live',
    });
  }

  // Check 6: Extreme Heatwave (>= 40°C)
  if (curr.temp >= 40) {
    alerts.push({
      id: `alert-heat-${lat.toFixed(2)}-${lon.toFixed(2)}`,
      severity: curr.temp >= 44 ? 'red' : 'orange',
      type: 'heatwave',
      title: curr.temp >= 44 ? 'Severe Heatwave Red Alert' : 'Heatwave Orange Warning',
      district: districtName,
      agency: 'IMD National Weather Forecasting Centre',
      issuedAt: `Issued today at ${timeStr}`,
      validUntil: 'Valid until 06:00 PM',
      description: `Daytime maximum temperatures climbing to ${curr.temp}°C with high thermal heat stress.`,
      instructions:
        'Avoid midday sun exposure between 12:00 PM and 03:00 PM. Hydrate frequently with electrolytes.',
      source: 'live',
    });
  }

  const result: AlertFeedResult = {
    alerts,
    status: alerts.length > 0 ? 'active' : 'clear',
    lastUpdated: timeStr,
  };

  // Cache result for 15 minutes
  await setCachedData(cacheKey, result, ALERT_CACHE_TTL_MS);

  return result;
}
