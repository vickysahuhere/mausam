import { MausamTheme } from '../types';

export const ParentTheme: MausamTheme = {
  id: 'parent',
  name: 'Parent',
  tagline: 'Warm, Reassuring & High Legibility',
  artDirection: {
    cardStyle: 'pebble',
    badgeStyle: 'pill',
    dividerStyle: 'solid',
    shadowOffset: { width: 0, height: 3 },
  },
  colors: {
    background: '#FEF9C3', // Warm reassuring sunshine buttercup
    surface: '#FFFFFF',
    surfaceSecondary: '#FEF08A',
    primary: '#0284C7', // Friendly safe blue
    accent: '#F59E0B', // Sun gold
    text: '#1C1917',
    textSecondary: '#57534E',
    border: '#FDE047', // Soft sunny card outline
    success: '#16A34A',
    warning: '#D97706',
    error: '#DC2626',
    glow: 'rgba(2, 132, 199, 0.15)',
  },
  typography: {
    fontFamily: { regular: 'KinderChildKawaiiBubble', bold: 'KinderChildKawaiiBubble' },
    sizes: { xs: 13, s: 15, m: 18, l: 24, xl: 32, xxl: 44 }, // Extra-large legible fonts
  },
  spacing: { xs: 6, s: 12, m: 20, l: 28, xl: 40, xxl: 56 }, // Large forgiving tap areas
  shapes: { borderRadius: { s: 10, m: 18, l: 24, pill: 9999 } },
  cards: { elevation: 3, borderWidth: 1.5, shadowOpacity: 0.08 },
};
