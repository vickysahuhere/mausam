import { useState, useEffect } from 'react';

// Mock hook isolating the data boundary.
// In Phase 4, replace the switch statement branches with Open-Meteo, IMD, or Supabase Edge Function calls.
export function useWidgetData<T>(endpoint: string, locationId: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);

      // Brief delay to simulate fast local cached network fetch
      await new Promise((resolve) => setTimeout(resolve, 350));
      if (cancelled) return;

      switch (endpoint) {
        case 'current_summary':
          setData({
            temp: 32,
            high: 35,
            low: 26,
            desc: 'Partly Cloudy',
            humidity: 62,
            windSpeed: 14,
            windDirection: 'NW',
            feelsLike: 36,
          } as T);
          break;

        case 'aqi_card':
          setData({
            aqi: 142,
            pm25: 58.4,
            pm10: 112.0,
            status: 'Moderate',
            dominantPollutant: 'PM2.5',
            advisory: 'Sensitive groups should reduce prolonged outdoor exertion.',
          } as T);
          break;

        case 'uv_index':
          setData({
            uvIndex: 7.8,
            level: 'Very High',
            peakTime: '12:00 PM - 2:30 PM',
            protectionTip: 'Wear SPF 30+, sunglasses and a wide-brim hat.',
            safeMinutesWithoutBurn: 20,
          } as T);
          break;

        case 'pollen_estimate':
          setData({
            level: 'Moderate',
            treePollen: 'Low',
            grassPollen: 'Moderate',
            ragweed: 'Low',
            tip: 'Keep bedroom windows closed during late morning hours.',
          } as T);
          break;

        case 'best_run_hours':
          setData({
            hours: ['05:30 AM - 07:00 AM', '06:30 PM - 08:00 PM'],
            morningTemp: 26,
            eveningTemp: 29,
            airScore: 'Good',
            comfortScore: 88,
          } as T);
          break;

        case 'sunrise_sunset':
          setData({
            sunrise: '06:04 AM',
            sunset: '06:42 PM',
            firstLight: '05:42 AM',
            goldenHour: '06:10 PM',
            daylightDuration: '12h 38m',
          } as T);
          break;

        case 'sea_state':
          setData({
            waveHeight: '1.4 m',
            swellPeriod: '9 sec',
            seaCondition: 'Moderate Swell',
            waterTemp: 28,
            surfRating: 'Fair (3/5)',
          } as T);
          break;

        case 'tide_times':
          setData({
            station: 'Port Observation',
            nextHigh: '11:20 AM (3.8m)',
            nextLow: '05:45 PM (0.9m)',
            tideTrend: 'Falling',
          } as T);
          break;

        case 'destination_weather':
          setData({
            savedCities: [
              { name: 'Bengaluru', temp: 24, cond: 'Pleasant Rain' },
              { name: 'Goa', temp: 30, cond: 'Tropical Breeze' },
            ],
            alertCount: 0,
          } as T);
          break;

        case 'packing_tip':
          setData({
            recommendations: [
              'Light breathable cottons for daytime',
              'Compact umbrella for scattered evening showers',
              'UV sunglasses & sunscreen',
            ],
          } as T);
          break;

        case 'school_commute':
          setData({
            window: '07:30 AM - 08:45 AM',
            temp: 27,
            rainChance: '10%',
            status: 'Clear Commute',
            advisory: 'No delays expected due to weather.',
          } as T);
          break;

        case 'rain_timeline':
          setData({
            summary: 'Dry next 3 hours; 25% chance of light drizzle at 5 PM',
            timeline: [
              { time: '1 PM', prob: 5, mm: 0 },
              { time: '2 PM', prob: 10, mm: 0 },
              { time: '3 PM', prob: 15, mm: 0 },
              { time: '4 PM', prob: 20, mm: 0.2 },
              { time: '5 PM', prob: 35, mm: 0.8 },
              { time: '6 PM', prob: 25, mm: 0.3 },
            ],
          } as T);
          break;

        case 'frost_alert':
          setData({
            riskLevel: 'None',
            minGroundTemp: 22,
            frostWindow: 'No risk in next 72 hrs',
            cropSafetyTip: 'Normal open field irrigation recommended.',
          } as T);
          break;

        case 'rainfall_forecast':
          setData({
            districtPrediction: '3.2 mm (Normal range)',
            sevenDayTotal: '18.4 mm',
            soilMoistureStatus: 'Adequate',
          } as T);
          break;

        case 'soil_moisture':
          setData({
            saturation: '64%',
            depth10cm: 'Optimal (68%)',
            depth40cm: 'Moist (72%)',
            recommendation: 'Soil ready for top-dress fertilization.',
          } as T);
          break;

        case 'visibility_fog':
          setData({
            visibility: '7.5 km',
            status: 'Clear Visibility',
            fogRisk: 'Low',
            commuteImpact: 'No highway slowdowns reported.',
          } as T);
          break;

        case 'extended_forecast':
          setData({
            days: [
              { day: 'Today', high: 35, low: 26, cond: 'Partly Cloudy' },
              { day: 'Tomorrow', high: 34, low: 25, cond: 'Passing Showers' },
              { day: 'Wed', high: 33, low: 25, cond: 'Thunderstorm' },
              { day: 'Thu', high: 32, low: 24, cond: 'Light Rain' },
              { day: 'Fri', high: 34, low: 25, cond: 'Clear Sky' },
            ],
          } as T);
          break;

        case 'comfort_index':
          setData({
            score: 72,
            category: 'Comfortable',
            humidityImpact: 'Mild humid warmth',
            coolingTip: 'Ceiling fans sufficient indoors.',
          } as T);
          break;

        default:
          setData({ message: 'Weather data ready' } as T);
          break;
      }

      setLoading(false);
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [endpoint, locationId]);

  return { data, loading, error };
}
