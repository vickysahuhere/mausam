import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MausamTheme } from '../theme/types';

export const STARTER_CUSTOM_THEMES: MausamTheme[] = [
  {
    id: 'custom-monsoon-violet',
    name: 'Monsoon Violet',
    tagline: 'Deep stormy purples with lightning cyan accents',
    isCustom: true,
    artDirection: {
      cardStyle: 'glass',
      badgeStyle: 'neon',
      dividerStyle: 'hairline',
      shadowOffset: { width: 0, height: 6 },
      iconStyle: 'neon',
      wallpaper: {
        type: 'gradient',
        gradientColors: ['#1A0B2E', '#2D124D'],
      },
    },
    colors: {
      background: '#120524',
      surface: '#24103E',
      surfaceSecondary: '#35185A',
      primary: '#A855F7',
      accent: '#06B6D4',
      text: '#F3E8FF',
      textSecondary: '#C084FC',
      border: '#4C1D95',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      glow: '#A855F7',
    },
    typography: {
      fontFamily: { regular: 'KinderChildKawaiiBubble', bold: 'KinderChildKawaiiBubble' },
      sizes: { xs: 11, s: 13, m: 15, l: 18, xl: 22, xxl: 32 },
    },
    spacing: { xs: 4, s: 8, m: 14, l: 20, xl: 28, xxl: 36 },
    shapes: { borderRadius: { s: 8, m: 16, l: 24, pill: 999 } },
    cards: { elevation: 6, borderWidth: 1, shadowOpacity: 0.25 },
  },
  {
    id: 'custom-sunset-amber',
    name: 'Sunset Amber',
    tagline: 'Warm golden twilight and glowing terracotta',
    isCustom: true,
    artDirection: {
      cardStyle: 'pebble',
      badgeStyle: 'pill',
      dividerStyle: 'hairline',
      shadowOffset: { width: 0, height: 4 },
      iconStyle: 'bold',
      wallpaper: {
        type: 'gradient',
        gradientColors: ['#2A1208', '#421C0B'],
      },
    },
    colors: {
      background: '#1F0B05',
      surface: '#36160A',
      surfaceSecondary: '#4D200E',
      primary: '#F97316',
      accent: '#FBBF24',
      text: '#FFF7ED',
      textSecondary: '#FDBA74',
      border: '#7C2D12',
      success: '#34D399',
      warning: '#F59E0B',
      error: '#EF4444',
      glow: '#F97316',
    },
    typography: {
      fontFamily: { regular: 'KinderChildKawaiiBubble', bold: 'KinderChildKawaiiBubble' },
      sizes: { xs: 11, s: 13, m: 15, l: 18, xl: 22, xxl: 32 },
    },
    spacing: { xs: 4, s: 8, m: 14, l: 20, xl: 28, xxl: 36 },
    shapes: { borderRadius: { s: 10, m: 18, l: 28, pill: 999 } },
    cards: { elevation: 5, borderWidth: 1, shadowOpacity: 0.2 },
  },
  {
    id: 'custom-cyber-neon',
    name: 'Cyber Neon',
    tagline: 'High-contrast pitch black with radioactive lime',
    isCustom: true,
    artDirection: {
      cardStyle: 'oled',
      badgeStyle: 'neon',
      dividerStyle: 'solid',
      shadowOffset: { width: 0, height: 0 },
      iconStyle: 'neon',
      wallpaper: {
        type: 'solid',
      },
    },
    colors: {
      background: '#050505',
      surface: '#111111',
      surfaceSecondary: '#1C1C1C',
      primary: '#22C55E',
      accent: '#06B6D4',
      text: '#FFFFFF',
      textSecondary: '#86EFAC',
      border: '#166534',
      success: '#22C55E',
      warning: '#EAB308',
      error: '#EF4444',
      glow: '#22C55E',
    },
    typography: {
      fontFamily: { regular: 'KinderChildKawaiiBubble', bold: 'KinderChildKawaiiBubble' },
      sizes: { xs: 11, s: 13, m: 15, l: 18, xl: 22, xxl: 32 },
    },
    spacing: { xs: 4, s: 8, m: 14, l: 20, xl: 28, xxl: 36 },
    shapes: { borderRadius: { s: 4, m: 8, l: 12, pill: 999 } },
    cards: { elevation: 0, borderWidth: 1.5, shadowOpacity: 0 },
  },
  {
    id: 'custom-vintage-cream',
    name: 'Vintage Cream',
    tagline: 'Warm parchment glass with pebble contours',
    isCustom: true,
    artDirection: {
      cardStyle: 'glass',
      badgeStyle: 'pill',
      dividerStyle: 'hairline',
      shadowOffset: { width: 0, height: 6 },
      iconStyle: 'bold',
      wallpaper: {
        type: 'solid',
      },
    },
    colors: {
      background: '#FAF5EF',
      surface: 'rgba(255, 255, 255, 0.75)',
      surfaceSecondary: 'rgba(245, 235, 224, 0.65)',
      primary: '#854D0E',
      accent: '#CA8A04',
      text: '#292524',
      textSecondary: '#78716C',
      border: 'rgba(214, 205, 194, 0.7)',
      success: '#15803D',
      warning: '#B45309',
      error: '#B91C1C',
      glow: '#854D0E',
      onPrimary: '#FFFFFF',
      successBg: 'rgba(21, 128, 61, 0.12)',
      warningBg: 'rgba(180, 83, 9, 0.12)',
      errorBg: 'rgba(185, 28, 28, 0.12)',
    },
    typography: {
      fontFamily: { regular: 'KinderChildKawaiiBubble', bold: 'KinderChildKawaiiBubble' },
      sizes: { xs: 11, s: 13, m: 15, l: 18, xl: 22, xxl: 32 },
    },
    spacing: { xs: 4, s: 8, m: 14, l: 20, xl: 28, xxl: 36 },
    shapes: { borderRadius: { s: 10, m: 18, l: 26, pill: 999 } },
    cards: { elevation: 0, borderWidth: 1.5, shadowOpacity: 0.1 },
  },
];

interface CustomThemeState {
  customThemes: MausamTheme[];
  saveCustomTheme: (theme: MausamTheme) => void;
  deleteCustomTheme: (id: string) => void;
  getCustomTheme: (id: string) => MausamTheme | undefined;
  resetToDefaults: () => void;
}

export const useCustomThemeStore = create<CustomThemeState>()(
  persist(
    (set, get) => ({
      customThemes: STARTER_CUSTOM_THEMES,

      saveCustomTheme: (newTheme: MausamTheme) => {
        set((state) => {
          const index = state.customThemes.findIndex((t) => t.id === newTheme.id);
          if (index >= 0) {
            const updated = [...state.customThemes];
            updated[index] = { ...newTheme, isCustom: true };
            return { customThemes: updated };
          } else {
            return { customThemes: [newTheme, ...state.customThemes] };
          }
        });
      },

      deleteCustomTheme: (id: string) => {
        set((state) => ({
          customThemes: state.customThemes.filter((t) => t.id !== id),
        }));
      },

      getCustomTheme: (id: string) => {
        return get().customThemes.find((t) => t.id === id);
      },

      resetToDefaults: () => {
        set({ customThemes: STARTER_CUSTOM_THEMES });
      },
    }),
    {
      name: '@mausam_custom_themes',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
