/**
 * Cat Weather Advice & Contextual Micro-Remarks Engine
 * Provides short, useful, non-annoying weather micro-guidance.
 */

import { CatMessage } from './catTypes';

export interface WeatherContextData {
  temp?: number;
  condition?: string;
  isRain?: boolean;
  isHeavyRain?: boolean;
  isThunder?: boolean;
  isSnow?: boolean;
  isClear?: boolean;
  isCloudy?: boolean;
  windSpeed?: number;
  aqi?: number;
  uvIndex?: number;
  humidity?: number;
  dominantPersona?: string;
  hour?: number;
  cityName?: string;
}

export function generateWeatherMicroAdvice(ctx: WeatherContextData): CatMessage | null {
  const hour = ctx.hour ?? new Date().getHours();

  // 1. Critical Severe Weather & Alerts (Highest Priority)
  if (ctx.isThunder) {
    return {
      id: 'adv_thunder',
      text: 'Thunder in the area! Stay indoors and cozy.',
      category: 'alert',
      importance: 'high',
    };
  }

  if (ctx.isHeavyRain) {
    return {
      id: 'adv_heavy_rain',
      text: 'Heavy downpour outside. Avoid waterlogged paths!',
      category: 'weather',
      importance: 'high',
    };
  }

  // 2. Air Quality Health Advisory
  if (ctx.aqi && ctx.aqi > 200) {
    return {
      id: 'adv_bad_aqi',
      text: 'Air quality isn\'t great today. Wear a mask outdoors.',
      category: 'advice',
      importance: 'high',
    };
  }

  // 3. Extreme Temperature Caution
  if (ctx.temp !== undefined && ctx.temp >= 38) {
    return {
      id: 'adv_extreme_heat',
      text: 'It\'s blistering hot! Keep hydrated and stay cool.',
      category: 'weather',
      importance: 'high',
    };
  }

  if (ctx.temp !== undefined && ctx.temp <= 8) {
    return {
      id: 'adv_extreme_cold',
      text: 'Brrr! Shivering cold outside. Wrap up warm.',
      category: 'weather',
      importance: 'high',
    };
  }

  // 4. High UV Protection
  if (ctx.uvIndex && ctx.uvIndex >= 7) {
    return {
      id: 'adv_high_uv',
      text: 'UV index is strong. Slip on sunglasses and SPF.',
      category: 'advice',
      importance: 'medium',
    };
  }

  // 5. High Wind
  if (ctx.windSpeed && ctx.windSpeed >= 35) {
    return {
      id: 'adv_wind',
      text: 'Gusty winds today! Hold on to loose hats.',
      category: 'weather',
      importance: 'medium',
    };
  }

  // 6. Persona-Informed Weather Insights (No Lock-In, Adaptive)
  const p = ctx.dominantPersona?.toLowerCase() || '';

  if (p === 'fitness' || p === 'athlete') {
    if (ctx.isRain || (ctx.temp && ctx.temp > 34) || (ctx.aqi && ctx.aqi > 150)) {
      return {
        id: 'adv_fitness_indoor',
        text: 'Maybe skip that outdoor run for now.',
        category: 'persona',
        importance: 'medium',
      };
    }
    if (ctx.temp && ctx.temp >= 16 && ctx.temp <= 26) {
      return {
        id: 'adv_fitness_prime',
        text: 'Prime weather for outdoor cardio today!',
        category: 'persona',
        importance: 'medium',
      };
    }
  }

  if (p === 'beach') {
    if (ctx.isClear && ctx.temp && ctx.temp >= 24 && (!ctx.windSpeed || ctx.windSpeed < 25)) {
      return {
        id: 'adv_beach_ideal',
        text: 'Perfect weather for a beach day!',
        category: 'persona',
        importance: 'medium',
      };
    }
  }

  if (p === 'parent') {
    if (ctx.aqi && ctx.aqi > 120) {
      return {
        id: 'adv_parent_aqi',
        text: 'Moderate haze today—limit playground time.',
        category: 'persona',
        importance: 'medium',
      };
    }
    if (ctx.isClear && ctx.temp && ctx.temp >= 20 && ctx.temp <= 30) {
      return {
        id: 'adv_parent_play',
        text: 'Great afternoon for the little ones outdoors!',
        category: 'persona',
        importance: 'medium',
      };
    }
  }

  if (p === 'agriculture' || p === 'farmer') {
    if (ctx.isRain) {
      return {
        id: 'adv_agri_rain',
        text: 'Good moisture arriving for the soil.',
        category: 'persona',
        importance: 'medium',
      };
    }
    if (ctx.temp && ctx.temp <= 4) {
      return {
        id: 'adv_agri_frost',
        text: 'Frost hazard overnight. Protect sensitive crops.',
        category: 'persona',
        importance: 'high',
      };
    }
  }

  if (p === 'commuter') {
    if (ctx.isRain) {
      return {
        id: 'adv_commuter_rain',
        text: 'Roads may be slick. Allow extra commute time.',
        category: 'persona',
        importance: 'medium',
      };
    }
  }

  // 7. General Rain / Drizzle
  if (ctx.isRain) {
    return {
      id: 'adv_rain',
      text: 'Rain is active. Don\'t forget your umbrella!',
      category: 'weather',
      importance: 'medium',
    };
  }

  // 8. Pleasant / Clear Day
  if (ctx.isClear && ctx.temp && ctx.temp >= 18 && ctx.temp <= 28) {
    return {
      id: 'adv_clear_walk',
      text: 'Looks like a pleasant time for a walk.',
      category: 'weather',
      importance: 'low',
    };
  }

  // 9. Time of Day Micro Moments
  if (hour >= 6 && hour <= 9) {
    return {
      id: 'adv_morning',
      text: 'Morning stretch! Have a wonderful day ahead.',
      category: 'time',
      importance: 'low',
    };
  }

  if (hour >= 17 && hour <= 19) {
    return {
      id: 'adv_sunset',
      text: 'Golden hour colors in the sky.',
      category: 'time',
      importance: 'low',
    };
  }

  return {
    id: 'adv_default',
    text: 'Keep an eye on the sky today.',
    category: 'advice',
    importance: 'low',
  };
}
