import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupportedLocale, TRANSLATIONS, translateText } from '../lib/i18n';

const LOCALE_STORAGE_KEY = '@mausam_locale';

interface LocaleState {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  loadLocale: () => Promise<void>;
  t: (key: string) => string;
}

export const useLocaleStore = create<LocaleState>((set, get) => ({
  locale: 'en',

  setLocale: (locale: SupportedLocale) => {
    set({ locale });
    AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale).catch(() => {});
  },

  loadLocale: async () => {
    try {
      const stored = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored && (stored as SupportedLocale) in TRANSLATIONS) {
        set({ locale: stored as SupportedLocale });
      }
    } catch {
      // Default to en
    }
  },

  t: (key: string) => {
    return translateText(get().locale, key);
  },
}));

// Auto-load saved locale on module initialization
useLocaleStore.getState().loadLocale();

