import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TemperatureUnit = 'C' | 'F';
export type WindSpeedUnit = 'km/h' | 'm/s';

const TEMP_STORAGE_KEY = '@mausam_temp_unit';
const WIND_STORAGE_KEY = '@mausam_wind_unit';

interface UnitState {
  temperatureUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setWindSpeedUnit: (unit: WindSpeedUnit) => void;
  loadUnits: () => Promise<void>;

  convertTemp: (tempC: number | null | undefined) => number;
  formatTemp: (tempC: number | null | undefined, showUnit?: boolean) => string;
  convertWind: (speedKmh: number | null | undefined) => number;
  formatWind: (speedKmh: number | null | undefined, showUnit?: boolean) => string;
}

export const useUnitStore = create<UnitState>((set, get) => ({
  temperatureUnit: 'C',
  windSpeedUnit: 'km/h',

  setTemperatureUnit: (unit: TemperatureUnit) => {
    set({ temperatureUnit: unit });
    AsyncStorage.setItem(TEMP_STORAGE_KEY, unit).catch(() => {});
  },

  setWindSpeedUnit: (unit: WindSpeedUnit) => {
    set({ windSpeedUnit: unit });
    AsyncStorage.setItem(WIND_STORAGE_KEY, unit).catch(() => {});
  },

  loadUnits: async () => {
    try {
      const [savedTemp, savedWind] = await Promise.all([
        AsyncStorage.getItem(TEMP_STORAGE_KEY),
        AsyncStorage.getItem(WIND_STORAGE_KEY),
      ]);
      if (savedTemp === 'C' || savedTemp === 'F') {
        set({ temperatureUnit: savedTemp });
      }
      if (savedWind === 'km/h' || savedWind === 'm/s') {
        set({ windSpeedUnit: savedWind });
      }
    } catch {
      // Default to C and km/h
    }
  },

  convertTemp: (tempC: number | null | undefined): number => {
    if (tempC === null || tempC === undefined || isNaN(tempC)) return 0;
    const { temperatureUnit } = get();
    if (temperatureUnit === 'F') {
      return Math.round((tempC * 9) / 5 + 32);
    }
    return Math.round(tempC);
  },

  formatTemp: (tempC: number | null | undefined, showUnit: boolean = false): string => {
    if (tempC === null || tempC === undefined || isNaN(tempC)) return '--';
    const converted = get().convertTemp(tempC);
    const { temperatureUnit } = get();
    if (showUnit) {
      return `${converted}°${temperatureUnit}`;
    }
    return `${converted}°`;
  },

  convertWind: (speedKmh: number | null | undefined): number => {
    if (speedKmh === null || speedKmh === undefined || isNaN(speedKmh)) return 0;
    const { windSpeedUnit } = get();
    if (windSpeedUnit === 'm/s') {
      return Math.round((speedKmh / 3.6) * 10) / 10;
    }
    return Math.round(speedKmh);
  },

  formatWind: (speedKmh: number | null | undefined, showUnit: boolean = true): string => {
    if (speedKmh === null || speedKmh === undefined || isNaN(speedKmh)) return '--';
    const converted = get().convertWind(speedKmh);
    const { windSpeedUnit } = get();
    if (showUnit) {
      return `${converted} ${windSpeedUnit}`;
    }
    return `${converted}`;
  },
}));

// Load persisted units on module initialization
useUnitStore.getState().loadUnits();
