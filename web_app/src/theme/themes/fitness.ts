import { MausamTheme } from '../types';

export const FitnessTheme: MausamTheme = {
  id: 'fitness',
  name: 'Fitness',
  tagline: 'High-Contrast OLED & Neon Energy',
  artDirection: {
    cardStyle: 'oled',
    badgeStyle: 'neon',
    dividerStyle: 'solid',
    shadowOffset: { width: 0, height: 4 },
  },
  colors: {
    background: '#09090B', // True OLED black
    surface: '#18181B', // Dark charcoal tile
    surfaceSecondary: '#27272A',
    primary: '#A3E635', // Electric neon lime
    accent: '#22D3EE', // Electric cyan
    text: '#FAFAFA',
    textSecondary: '#A1A1AA',
    border: '#27272A', // Crisp dark edge
    success: '#A3E635',
    warning: '#FB923C',
    error: '#F87171',
    glow: 'rgba(163, 230, 53, 0.28)', // Neon aura
  },
  typography: {
    fontFamily: { regular: 'System', bold: 'System' },
    sizes: { xs: 12, s: 14, m: 16, l: 22, xl: 30, xxl: 42 },
  },
  spacing: { xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48 },
  shapes: { borderRadius: { s: 4, m: 8, l: 14, pill: 9999 } },
  cards: { elevation: 4, borderWidth: 1.5, shadowOpacity: 0.35 },
};
