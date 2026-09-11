import { MausamTheme } from '../types';

export const VintageCreamTheme: MausamTheme = {
  id: 'vintage-cream',
  name: 'Vintage Cream',
  tagline: 'Warm Parchment Glass & Pebble Contours',
  isDark: false,
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
    background: '#FAF5EF', // Warm vintage linen/cream
    surface: 'rgba(255, 255, 255, 0.75)', // Translucent frosted glass over warm cream
    surfaceSecondary: 'rgba(245, 235, 224, 0.65)', // Subtle warm parchment chip
    primary: '#854D0E', // Vintage amber bronze
    accent: '#CA8A04', // Golden Ochre
    text: '#292524', // Warm charcoal brown
    textSecondary: '#78716C', // Muted warm stone
    border: 'rgba(214, 205, 194, 0.7)', // Delicate warm specular edge
    onPrimary: '#FFFFFF',
    success: '#15803D',
    warning: '#B45309',
    error: '#B91C1C',
    successBg: 'rgba(21, 128, 61, 0.12)',
    warningBg: 'rgba(180, 83, 9, 0.12)',
    errorBg: 'rgba(185, 28, 28, 0.12)',
    glow: 'rgba(133, 77, 14, 0.25)',
  },
  typography: {
    fontFamily: { regular: 'KinderChildKawaiiBubble', bold: 'KinderChildKawaiiBubble' },
    sizes: { xs: 12, s: 14, m: 16, l: 20, xl: 26, xxl: 36 },
  },
  spacing: { xs: 4, s: 8, m: 14, l: 20, xl: 28, xxl: 36 },
  shapes: {
    borderRadius: {
      s: 10,
      m: 18,
      l: 26,
      pill: 9999,
    },
  },
  cards: {
    elevation: 0,
    borderWidth: 1.5,
    shadowOpacity: 0.1,
  },
};
