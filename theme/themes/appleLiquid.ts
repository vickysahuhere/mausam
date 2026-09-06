import { MausamTheme } from '../types';

export const AppleLiquidTheme: MausamTheme = {
  id: 'apple-liquid',
  name: 'Apple Liquid',
  tagline: 'Translucent Glass & Fluid Depth',
  isDark: false,
  artDirection: {
    cardStyle: 'glass',
    badgeStyle: 'pill',
    dividerStyle: 'hairline',
    shadowOffset: { width: 0, height: 10 },
    iconStyle: 'line',
    wallpaper: {
      type: 'mesh',
      gradientColors: ['#38BDF8', '#818CF8'],
    },
  },
  colors: {
    background: '#EFF6FF', // Soft atmospheric sky-mist
    surface: 'rgba(255, 255, 255, 0.65)', // Frosted glass with high optical clarity
    surfaceSecondary: 'rgba(255, 255, 255, 0.45)', // Floating glass chip
    primary: '#0284C7', // Sky Azure
    accent: '#6366F1', // Electric Indigo
    text: '#0F172A',
    textSecondary: '#475569',
    border: 'rgba(255, 255, 255, 0.82)', // Specular white glass highlight edge
    onPrimary: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    successBg: 'rgba(16, 185, 129, 0.14)',
    warningBg: 'rgba(245, 158, 11, 0.14)',
    errorBg: 'rgba(239, 68, 68, 0.14)',
    glow: 'rgba(56, 189, 248, 0.35)',
  },
  typography: {
    fontFamily: { regular: 'System', bold: 'System' },
    sizes: { xs: 12, s: 14, m: 16, l: 22, xl: 28, xxl: 36 },
  },
  spacing: { xs: 4, s: 10, m: 18, l: 26, xl: 34, xxl: 50 },
  shapes: { borderRadius: { s: 12, m: 20, l: 26, pill: 9999 } },
  cards: { elevation: 0, borderWidth: 1.5, shadowOpacity: 0.14 },
};
