import { Persona } from './surveyQuestions';

export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  relevance: Partial<Record<Persona, number>>;
  defaultSize?: 'small' | 'medium' | 'large';
}

export const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  // Base summary
  current_summary: {
    id: 'current_summary',
    name: 'Current Weather',
    description: 'Temperature, high/low, and current atmospheric conditions',
    category: 'Essential',
    icon: 'sun',
    relevance: {
      health: 1.0,
      fitness: 1.0,
      beach: 1.0,
      travel: 1.0,
      parent: 1.0,
      agriculture: 1.0,
      commuter: 1.0,
      event: 1.0,
    },
    defaultSize: 'large',
  },

  // 24-Hour Continuous Hourly Timeline
  hourly_forecast: {
    id: 'hourly_forecast',
    name: 'Hourly Forecast',
    description: '24-hour horizontal forecast timeline with rain chances and temperature trend',
    category: 'Essential',
    icon: 'clock',
    relevance: {
      health: 0.85,
      fitness: 0.85,
      beach: 0.85,
      travel: 0.85,
      parent: 0.85,
      agriculture: 0.85,
      commuter: 0.85,
      event: 0.85,
    },
    defaultSize: 'large',
  },

  // Health
  aqi_card: {
    id: 'aqi_card',
    name: 'Air Quality Index',
    description: 'AQI score, PM2.5, PM10 & health advisory',
    category: 'Health',
    icon: 'wind',
    relevance: { health: 1.0, agriculture: 0.3, commuter: 0.3 },
  },
  uv_index: {
    id: 'uv_index',
    name: 'UV Index & Sun Guard',
    description: 'Current UV radiation level and skin safety duration',
    category: 'Health & Outdoors',
    icon: 'shield',
    relevance: { health: 0.9, beach: 0.8, fitness: 0.7 },
  },
  pollen_estimate: {
    id: 'pollen_estimate',
    name: 'Pollen & Allergens',
    description: 'Tree, grass & ragweed seasonal allergy levels',
    category: 'Health',
    icon: 'plant',
    relevance: { health: 1.0, parent: 0.6 },
  },

  // Fitness
  best_run_hours: {
    id: 'best_run_hours',
    name: 'Best Workout Hours',
    description: 'Ranked best hours for running, cycling and workouts',
    category: 'Fitness',
    icon: 'run',
    relevance: { fitness: 1.0, health: 0.4 },
  },
  sunrise_sunset: {
    id: 'sunrise_sunset',
    name: 'Sun Track & Daylight',
    description: 'First light, sunrise, sunset and golden hour windows',
    category: 'Outdoors',
    icon: 'sun',
    relevance: { fitness: 0.7, beach: 0.8, event: 0.7 },
  },

  // Beach
  sea_state: {
    id: 'sea_state',
    name: 'Sea State & Wave Height',
    description: 'Swell height, wave period, coastal water condition',
    category: 'Marine',
    icon: 'wave',
    relevance: { beach: 1.0 },
  },
  tide_times: {
    id: 'tide_times',
    name: 'Tide Schedule (INCOIS)',
    description: 'High and low tide timings for coastal stations',
    category: 'Marine',
    icon: 'compass',
    relevance: { beach: 1.0 },
  },

  // Travel
  destination_weather: {
    id: 'destination_weather',
    name: 'Destination Outlook',
    description: 'Weather overview and travel warnings for upcoming trips',
    category: 'Travel',
    icon: 'map-pin',
    relevance: { travel: 1.0 },
  },
  packing_tip: {
    id: 'packing_tip',
    name: 'Smart Packing Assistant',
    description: 'Clothing and gear recommendations based on destination forecast',
    category: 'Travel',
    icon: 'calendar',
    relevance: { travel: 1.0 },
  },

  // Parent & Family
  school_commute: {
    id: 'school_commute',
    name: 'School Run & Drop-off',
    description: '7-9 AM morning commute weather window & rain safety',
    category: 'Family',
    icon: 'cloud',
    relevance: { parent: 1.0, commuter: 0.5 },
  },
  rain_timeline: {
    id: 'rain_timeline',
    name: 'Precipitation Timeline',
    description: 'Hour-by-hour rain probability and expected volume',
    category: 'Essential',
    icon: 'rain',
    relevance: { commuter: 1.0, parent: 0.8, event: 0.8, fitness: 0.5 },
  },

  // Agriculture
  frost_alert: {
    id: 'frost_alert',
    name: 'Frost & Cold Risk',
    description: 'Overnight ground frost detection and crop safety warnings',
    category: 'Agriculture',
    icon: 'thermometer',
    relevance: { agriculture: 1.0 },
  },
  rainfall_forecast: {
    id: 'rainfall_forecast',
    name: 'District Rainfall Prediction',
    description: 'IMD agricultural district rainfall volume estimate',
    category: 'Agriculture',
    icon: 'droplet',
    relevance: { agriculture: 1.0, event: 0.4 },
  },
  soil_moisture: {
    id: 'soil_moisture',
    name: 'Soil Moisture Index',
    description: 'Topsoil saturation level and planting guidance',
    category: 'Agriculture',
    icon: 'plant',
    relevance: { agriculture: 1.0 },
  },

  // Commuter
  visibility_fog: {
    id: 'visibility_fog',
    name: 'Road Visibility & Fog',
    description: 'Highway sight distance, fog alerts and traffic speed risk',
    category: 'Commute',
    icon: 'fog',
    relevance: { commuter: 1.0, travel: 0.5 },
  },

  // Event
  extended_forecast: {
    id: 'extended_forecast',
    name: '10-Day Extended Outlook',
    description: 'Long-range forecast trends for event and weekend planning',
    category: 'Planning',
    icon: 'calendar',
    relevance: { event: 1.0, travel: 0.8, agriculture: 0.6, health: 0.4 },
  },
  comfort_index: {
    id: 'comfort_index',
    name: 'Thermal Comfort Index',
    description: 'Feels-like comfort combining temperature, humidity & wind',
    category: 'Planning',
    icon: 'thermometer',
    relevance: { event: 0.9, health: 0.7, fitness: 0.6 },
  },
  secondary_locations: {
    id: 'secondary_locations',
    name: 'Secondary Locations',
    description: 'Live weather and conditions for your saved places (School, Work, Home)',
    category: 'Essential',
    icon: 'map-pin',
    relevance: {
      commuter: 1.0,
      parent: 1.0,
      travel: 1.0,
      health: 0.8,
      fitness: 0.8,
      beach: 0.8,
      agriculture: 0.8,
      event: 0.8,
    },
    defaultSize: 'large',
  },
  companion_card: {
    id: 'companion_card',
    name: 'Weather Companion',
    description: 'Interactive weather cat providing live micro-advice and reactions',
    category: 'Essential',
    icon: 'sun',
    relevance: {
      health: 0.9,
      fitness: 0.9,
      beach: 0.9,
      travel: 0.9,
      parent: 0.9,
      agriculture: 0.9,
      commuter: 0.9,
      event: 0.9,
    },
    defaultSize: 'medium',
  },
  wind_compass: {
    id: 'wind_compass',
    name: 'Wind Compass & Gust Rose',
    description: '360° aerodynamic wind rose, compass heading & Beaufort scale breeze rating',
    category: 'Outdoors',
    icon: 'compass',
    relevance: {
      beach: 1.0,
      fitness: 0.9,
      agriculture: 0.8,
      commuter: 0.7,
      event: 0.7,
    },
    defaultSize: 'medium',
  },
  barometer_pressure: {
    id: 'barometer_pressure',
    name: 'Barometer & Storm Trend',
    description: 'Atmospheric surface pressure dial with rising/falling storm tendency indicator',
    category: 'Planning',
    icon: 'compass',
    relevance: {
      health: 0.8,
      agriculture: 0.9,
      beach: 0.9,
      travel: 0.8,
      event: 0.8,
    },
    defaultSize: 'medium',
  },
  moon_phase: {
    id: 'moon_phase',
    name: 'Moon Phase & Night Sky',
    description: 'Real-time lunar cycle, illumination %, phase tracker & celestial night outlook',
    category: 'Outdoors',
    icon: 'moon',
    relevance: {
      event: 0.9,
      beach: 0.9,
      fitness: 0.7,
      travel: 0.8,
      health: 0.6,
      parent: 0.7,
      agriculture: 0.8,
      commuter: 0.6,
    },
    defaultSize: 'medium',
  },
};
