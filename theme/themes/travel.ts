import { MausamTheme } from '../types';

export const TravelTheme: MausamTheme = {
  id: 'travel',
  name: 'Travel',
  tagline: 'Passport Itinerary & Boarding Pass',
  artDirection: {
    cardStyle: 'ticket',
    badgeStyle: 'square',
    dividerStyle: 'dashed', // Boarding pass tear perforation
    shadowOffset: { width: 0, height: 2 },
  },
  colors: {
    background: '#F1F5F9', // Clean airport terminal slate
    surface: '#FFFFFF',
    surfaceSecondary: '#E2E8F0',
    primary: '#1E3A8A', // Deep passport navy
    accent: '#EA580C', // Luggage tag orange
    text: '#0F172A',
    textSecondary: '#475569',
    border: '#CBD5E1', // Itinerary card border
    success: '#15803D',
    warning: '#D97706',
    error: '#B91C1C',
    glow: 'rgba(30, 58, 138, 0.12)',
  },
  typography: {
    fontFamily: { regular: 'KinderChildKawaiiBubble', bold: 'KinderChildKawaiiBubble' },
    sizes: { xs: 11, s: 13, m: 15, l: 20, xl: 26, xxl: 34 },
  },
  spacing: { xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48 },
  shapes: { borderRadius: { s: 4, m: 8, l: 12, pill: 9999 } },
  cards: { elevation: 2, borderWidth: 1, shadowOpacity: 0.08 },
};
