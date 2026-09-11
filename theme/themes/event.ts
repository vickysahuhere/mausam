import { MausamTheme } from '../types';

export const EventTheme: MausamTheme = {
  id: 'event',
  name: 'Event',
  tagline: 'Champagne Gold & Refined Calendar',
  artDirection: {
    cardStyle: 'editorial',
    badgeStyle: 'outline',
    dividerStyle: 'hairline',
    shadowOffset: { width: 0, height: 2 },
  },
  colors: {
    background: '#FAFAF9', // Ivory wedding stationery
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F5F4',
    primary: '#B45309', // Champagne warm gold
    accent: '#D97706',
    text: '#1C1917',
    textSecondary: '#78716C',
    border: '#E7E5E4', // Fine stationery deckle edge
    success: '#15803D',
    warning: '#D97706',
    error: '#B91C1C',
    glow: 'rgba(180, 83, 9, 0.15)',
  },
  typography: {
    fontFamily: { regular: 'KinderChildKawaiiBubble', bold: 'KinderChildKawaiiBubble' },
    sizes: { xs: 11, s: 13, m: 15, l: 22, xl: 30, xxl: 40 },
  },
  spacing: { xs: 8, s: 14, m: 22, l: 32, xl: 44, xxl: 60 }, // Generous breathing space
  shapes: { borderRadius: { s: 2, m: 6, l: 10, pill: 9999 } },
  cards: { elevation: 1, borderWidth: 1, shadowOpacity: 0.05 },
};
