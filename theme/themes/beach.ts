import { MausamTheme } from '../types';

export const BeachTheme: MausamTheme = {
  id: 'beach',
  name: 'Beach',
  tagline: 'Coastal Breeze & Organic Waves',
  artDirection: {
    cardStyle: 'pebble',
    badgeStyle: 'pill',
    dividerStyle: 'hairline',
    shadowOffset: { width: 0, height: 6 },
  },
  colors: {
    background: '#ECFEFF', // Coastal seafoam mist
    surface: '#FFFFFF',
    surfaceSecondary: '#CCFBF1',
    primary: '#0D9488', // Deep ocean teal
    accent: '#F59E0B', // Warm tropical sun
    text: '#134E4A',
    textSecondary: '#0F766E',
    border: '#A5F3FC', // Soft wave foam border
    success: '#10B981',
    warning: '#F59E0B',
    error: '#F43F5E',
    glow: 'rgba(13, 148, 136, 0.15)',
  },
  typography: {
    fontFamily: { regular: 'KinderChildKawaiiBubble', bold: 'KinderChildKawaiiBubble' },
    sizes: { xs: 12, s: 14, m: 17, l: 22, xl: 28, xxl: 36 },
  },
  spacing: { xs: 6, s: 12, m: 18, l: 26, xl: 36, xxl: 52 },
  shapes: { borderRadius: { s: 12, m: 20, l: 28, pill: 9999 } }, // Extra-rounded organic pebble corners
  cards: { elevation: 2, borderWidth: 1, shadowOpacity: 0.08 },
};
