import { MausamTheme } from '../types';

export const AgricultureTheme: MausamTheme = {
  id: 'agriculture',
  name: 'Agriculture',
  tagline: 'Earthy Soils & Field Ledger',
  artDirection: {
    cardStyle: 'rugged',
    badgeStyle: 'square',
    dividerStyle: 'solid',
    shadowOffset: { width: 0, height: 0 }, // Flat rugged field style
  },
  colors: {
    background: '#F5F5F0', // Fertile earth off-white
    surface: '#FFFFFF',
    surfaceSecondary: '#E7E5DF',
    primary: '#15803D', // Deep harvest green
    accent: '#B45309', // Rich loam amber
    text: '#292524',
    textSecondary: '#57534E',
    border: '#78716C', // Sturdy ledger line border
    success: '#15803D',
    warning: '#D97706',
    error: '#C2410C',
    glow: 'rgba(21, 128, 61, 0.15)',
  },
  typography: {
    fontFamily: { regular: 'KinderChildKawaiiBubble', bold: 'KinderChildKawaiiBubble' },
    sizes: { xs: 12, s: 14, m: 16, l: 20, xl: 26, xxl: 34 },
  },
  spacing: { xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48 },
  shapes: { borderRadius: { s: 0, m: 2, l: 4, pill: 9999 } }, // Blocky field ledger geometry
  cards: { elevation: 0, borderWidth: 2, shadowOpacity: 0 },
};
