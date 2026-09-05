/**
 * Derived-Index Helpers (TRD §5)
 * Pure, unit-testable meteorological algorithms shared across widgets
 */

export interface ComfortResult {
  score: number;
  category: 'Optimal' | 'Comfortable' | 'Warm' | 'Humid & Sticky' | 'Oppressive';
  humidityImpact: string;
  coolingTip: string;
}

export function comfortIndex(tempC: number, humidityPercent: number, windSpeedKmh: number): ComfortResult {
  // Discomfort Index (Thom formula approx)
  const di = tempC - 0.55 * (1 - humidityPercent / 100) * (tempC - 14.5);
  // Wind chill adjustment
  const windFactor = Math.min(10, windSpeedKmh * 0.2);
  const adjustedScore = Math.max(0, Math.min(100, Math.round(100 - (di - 18) * 3.5 + windFactor)));

  if (adjustedScore >= 80) {
    return {
      score: adjustedScore,
      category: 'Optimal',
      humidityImpact: 'Ideal humidity balance',
      coolingTip: 'Perfect conditions for all outdoor activities',
    };
  } else if (adjustedScore >= 65) {
    return {
      score: adjustedScore,
      category: 'Comfortable',
      humidityImpact: 'Pleasant atmospheric feel',
      coolingTip: 'Light hydration recommended during direct sunlight',
    };
  } else if (adjustedScore >= 45) {
    return {
      score: adjustedScore,
      category: 'Warm',
      humidityImpact: 'Moderate perspiration likely',
      coolingTip: 'Seek shade during peak afternoon hours',
    };
  } else if (adjustedScore >= 30) {
    return {
      score: adjustedScore,
      category: 'Humid & Sticky',
      humidityImpact: 'High moisture impedes sweat evaporation',
      coolingTip: 'Stay in ventilated areas; drink water frequently',
    };
  } else {
    return {
      score: adjustedScore,
      category: 'Oppressive',
      humidityImpact: 'Extreme thermal stress condition',
      coolingTip: 'Limit strenuous exertion; stay hydrated indoors',
    };
  }
}

export interface FrostWindow {
  hasFrostRisk: boolean;
  minTemp: number;
  riskLevel: 'None' | 'Low' | 'Moderate' | 'Severe';
  frostWindowHours: string[];
  safetyTip: string;
}

export function frostAlert(hourlyTemps: Array<{ time: string; temp: number }>): FrostWindow {
  const frostHours = hourlyTemps.filter((h) => h.temp <= 3.0);
  const minTemp = hourlyTemps.length > 0 ? Math.min(...hourlyTemps.map((h) => h.temp)) : 10;

  if (frostHours.length === 0) {
    return {
      hasFrostRisk: false,
      minTemp,
      riskLevel: 'None',
      frostWindowHours: [],
      safetyTip: 'No frost threat detected. Crops are safe tonight.',
    };
  }

  const riskLevel = minTemp <= 0 ? 'Severe' : minTemp <= 2 ? 'Moderate' : 'Low';
  const safetyTip =
    riskLevel === 'Severe'
      ? 'Cover tender seedlings and activate nursery irrigation to mitigate ground frost.'
      : 'Protect potted plants and sensitive vegetable crops during early morning.';

  return {
    hasFrostRisk: true,
    minTemp,
    riskLevel,
    frostWindowHours: frostHours.map((h) => h.time),
    safetyTip,
  };
}

export interface DouglasSeaDegree {
  degree: number;
  description: string;
  waveRange: string;
  surfRating: 'Flat' | 'Beginner' | 'Fun' | 'Caution' | 'Hazardous';
}

export function douglasSeaScale(waveHeightMeters: number): DouglasSeaDegree {
  if (waveHeightMeters <= 0.1) {
    return { degree: 0, description: 'Calm (glassy)', waveRange: '0 m', surfRating: 'Flat' };
  } else if (waveHeightMeters <= 0.5) {
    return { degree: 1, description: 'Calm (rippled)', waveRange: '0.1 – 0.5 m', surfRating: 'Beginner' };
  } else if (waveHeightMeters <= 1.25) {
    return { degree: 2, description: 'Smooth', waveRange: '0.5 – 1.25 m', surfRating: 'Beginner' };
  } else if (waveHeightMeters <= 2.5) {
    return { degree: 3, description: 'Slight', waveRange: '1.25 – 2.5 m', surfRating: 'Fun' };
  } else if (waveHeightMeters <= 4.0) {
    return { degree: 4, description: 'Moderate', waveRange: '2.5 – 4.0 m', surfRating: 'Caution' };
  } else if (waveHeightMeters <= 6.0) {
    return { degree: 5, description: 'Rough', waveRange: '4.0 – 6.0 m', surfRating: 'Hazardous' };
  } else if (waveHeightMeters <= 9.0) {
    return { degree: 6, description: 'Very rough', waveRange: '6.0 – 9.0 m', surfRating: 'Hazardous' };
  } else {
    return { degree: 7, description: 'High / Phenomenal', waveRange: '> 9.0 m', surfRating: 'Hazardous' };
  }
}
