import { MausamTheme } from '../types';

export const AppleLiquidTheme: MausamTheme = {
  id: 'apple-liquid',
  name: 'Apple Liquid',
  tagline: 'Translucent Glass & Fluid Depth',
  artDirection: {
    cardStyle: 'glass',
    badgeStyle: 'pill',
    dividerStyle: 'hairline',
    shadowOffset: { width: 0, height: 8 },
  },
  colors: {
    background: '#E2E8F0', // Cool frosted sky-gray
    surface: 'rgba(255, 255, 255, 0.82)', // Frosted glass
    surfaceSecondary: 'rgba(255, 255, 255, 0.55)',
    primary: '#0284C7',
    accent: '#38BDF8',
    text: '#0F172A',
    textSecondary: '#64748B',
    border: 'rgba(255, 255, 255, 0.75)', // White glass specular edge
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    glow: 'rgba(56, 189, 248, 0.25)',
  },
  typography: {
    fontFamily: { regular: 'System', bold: 'System' },
    sizes: { xs: 12, s: 14, m: 16, l: 22, xl: 28, xxl: 36 },
  },
  spacing: { xs: 4, s: 10, m: 18, l: 26, xl: 34, xxl: 50 },
  shapes: { borderRadius: { s: 10, m: 18, l: 24, pill: 9999 } },
  cards: { elevation: 3, borderWidth: 1.5, shadowOpacity: 0.12 },
};
