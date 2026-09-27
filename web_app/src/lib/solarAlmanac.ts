/**
 * High-precision on-device Solar & Lunar Ephemeris Calculator.
 * Operates 100% offline using standard astronomical algorithms (NOAA / Jean Meeus).
 */

export interface SolarTimes {
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
  civilDawn: Date;
  civilDusk: Date;
  goldenHourMorning: { start: Date; end: Date };
  goldenHourEvening: { start: Date; end: Date };
  daylightMinutes: number;
  daylightProgressPercent: number; // 0 to 100
  solarAltitudeDegrees: number; // -90 (nadir) to +90 (zenith)
  isDaylight: boolean;
  isGoldenHour: boolean;
}

export type MoonPhaseName =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent';

export interface MoonPhaseInfo {
  phaseValue: number; // 0.0 to 1.0 (0.0 = new moon, 0.5 = full moon)
  phaseName: MoonPhaseName;
  illuminationPercent: number; // 0 to 100
  daysIntoCycle: number; // 0 to 29.53
  emoji: string;
}

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/**
 * Calculates solar milestones, daylight percentage, and altitude for a given lat/lon and date.
 */
export function calculateSolarTimes(
  latitude: number,
  longitude: number,
  targetDate: Date = new Date()
): SolarTimes {
  const date = new Date(targetDate);
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000) + 1;

  // Fractional year in radians
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1 + (date.getUTCHours() - 12) / 24);

  // Equation of time in minutes
  const eqTime = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(gamma) -
    0.032077 * Math.sin(gamma) -
    0.014615 * Math.cos(2 * gamma) -
    0.040849 * Math.sin(2 * gamma)
  );

  // Solar declination angle in radians
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const latRad = latitude * DEG2RAD;

  // Helper to calculate time for a given zenith angle
  const getTimeForZenith = (zenithDeg: number): { riseUTCMinutes: number; setUTCMinutes: number } => {
    const zenithRad = zenithDeg * DEG2RAD;
    const cosHourAngle =
      (Math.cos(zenithRad) - Math.sin(latRad) * Math.sin(decl)) /
      (Math.cos(latRad) * Math.cos(decl));

    // Clamp for polar day / night
    const clampedCos = Math.max(-1, Math.min(1, cosHourAngle));
    const hourAngleDeg = Math.acos(clampedCos) * RAD2DEG;

    // Local solar noon in UTC minutes
    const noonUTC = 720 - (4 * longitude) - eqTime;
    return {
      riseUTCMinutes: noonUTC - hourAngleDeg * 4,
      setUTCMinutes: noonUTC + hourAngleDeg * 4,
    };
  };

  const toLocalDate = (utcMinutes: number): Date => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCMinutes(utcMinutes);
    return d;
  };

  // Standard sunrise/sunset: 90.833° (accounting for atmospheric refraction and solar disc)
  const standard = getTimeForZenith(90.833);
  // Civil twilight: 96°
  const civil = getTimeForZenith(96);
  // Golden hour: sun from 6° above horizon down to horizon (84° to 90.833°)
  const golden = getTimeForZenith(84);

  const noonUTC = 720 - (4 * longitude) - eqTime;

  const sunrise = toLocalDate(standard.riseUTCMinutes);
  const sunset = toLocalDate(standard.setUTCMinutes);
  const solarNoon = toLocalDate(noonUTC);
  const civilDawn = toLocalDate(civil.riseUTCMinutes);
  const civilDusk = toLocalDate(civil.setUTCMinutes);

  const goldenHourMorning = {
    start: toLocalDate(standard.riseUTCMinutes),
    end: toLocalDate(golden.riseUTCMinutes),
  };
  const goldenHourEvening = {
    start: toLocalDate(golden.setUTCMinutes),
    end: toLocalDate(standard.setUTCMinutes),
  };

  const daylightMs = Math.max(0, sunset.getTime() - sunrise.getTime());
  const daylightMinutes = Math.round(daylightMs / 60000);

  const nowMs = date.getTime();
  const isDaylight = nowMs >= sunrise.getTime() && nowMs <= sunset.getTime();

  let daylightProgressPercent = 0;
  if (daylightMs > 0) {
    if (nowMs <= sunrise.getTime()) {
      daylightProgressPercent = 0;
    } else if (nowMs >= sunset.getTime()) {
      daylightProgressPercent = 100;
    } else {
      daylightProgressPercent = Math.min(100, Math.max(0, ((nowMs - sunrise.getTime()) / daylightMs) * 100));
    }
  }

  const isGoldenHour =
    (nowMs >= goldenHourMorning.start.getTime() && nowMs <= goldenHourMorning.end.getTime()) ||
    (nowMs >= goldenHourEvening.start.getTime() && nowMs <= goldenHourEvening.end.getTime());

  // Instantaneous solar altitude angle calculation
  const currentUTCMinutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  const currentHourAngleDeg = (currentUTCMinutes - noonUTC) / 4;
  const currentHourAngleRad = currentHourAngleDeg * DEG2RAD;

  const sinAlt =
    Math.sin(latRad) * Math.sin(decl) +
    Math.cos(latRad) * Math.cos(decl) * Math.cos(currentHourAngleRad);
  const solarAltitudeDegrees = Math.round(Math.asin(Math.max(-1, Math.min(1, sinAlt))) * RAD2DEG * 10) / 10;

  return {
    sunrise,
    sunset,
    solarNoon,
    civilDawn,
    civilDusk,
    goldenHourMorning,
    goldenHourEvening,
    daylightMinutes,
    daylightProgressPercent: Math.round(daylightProgressPercent),
    solarAltitudeDegrees,
    isDaylight,
    isGoldenHour,
  };
}

/**
 * Calculates current Moon Phase, illumination, and cycle position offline.
 */
export function calculateMoonPhase(targetDate: Date = new Date()): MoonPhaseInfo {
  const LUNAR_CYCLE_DAYS = 29.53058867;
  // Known New Moon reference epoch: 2000-01-06 18:14 UTC (JD 2451549.26)
  const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

  const elapsedMs = targetDate.getTime() - KNOWN_NEW_MOON_MS;
  const elapsedDays = elapsedMs / 86400000;

  // Normalized phase value between 0.0 and 1.0
  let phaseValue = (elapsedDays % LUNAR_CYCLE_DAYS) / LUNAR_CYCLE_DAYS;
  if (phaseValue < 0) phaseValue += 1;

  const daysIntoCycle = Math.round(phaseValue * LUNAR_CYCLE_DAYS * 10) / 10;

  // Illumination calculation: 0% at new moon, 100% at full moon (phase 0.5)
  const illuminationPercent = Math.round((1 - Math.cos(phaseValue * 2 * Math.PI)) / 2 * 100);

  let phaseName: MoonPhaseName;
  let emoji: string;

  if (phaseValue < 0.03 || phaseValue >= 0.97) {
    phaseName = 'New Moon';
    emoji = '🌑';
  } else if (phaseValue < 0.22) {
    phaseName = 'Waxing Crescent';
    emoji = '🌒';
  } else if (phaseValue < 0.28) {
    phaseName = 'First Quarter';
    emoji = '🌓';
  } else if (phaseValue < 0.47) {
    phaseName = 'Waxing Gibbous';
    emoji = '🌔';
  } else if (phaseValue < 0.53) {
    phaseName = 'Full Moon';
    emoji = '🌕';
  } else if (phaseValue < 0.72) {
    phaseName = 'Waning Gibbous';
    emoji = '🌖';
  } else if (phaseValue < 0.78) {
    phaseName = 'Last Quarter';
    emoji = '🌗';
  } else {
    phaseName = 'Waning Crescent';
    emoji = '🌘';
  }

  return {
    phaseValue: Math.round(phaseValue * 1000) / 1000,
    phaseName,
    illuminationPercent,
    daysIntoCycle,
    emoji,
  };
}
