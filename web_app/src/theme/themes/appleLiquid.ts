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
    background: '#E0F2FE', // Luminous celestial sky
    surface: 'rgba(255, 255, 255, 0.72)', // Frosted glass with silky translucency
    surfaceSecondary: 'rgba(255, 255, 255, 0.52)', // Floating translucent glass chip
    primary: '#0284C7', // Vivid Sky Azure
    accent: '#6366F1', // Electric Indigo
    text: '#0C4A6E', // Deep Atlantic Navy for supreme clarity
    textSecondary: '#3B82F6', // Luminous Slate Blue
    border: 'rgba(255, 255, 255, 0.85)', // Crisp specular edge highlight
    onPrimary: '#FFFFFF',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    successBg: 'rgba(16, 185, 129, 0.16)',
    warningBg: 'rgba(245, 158, 11, 0.16)',
    errorBg: 'rgba(239, 68, 68, 0.16)',
    glow: 'rgba(56, 189, 248, 0.40)',
  },
  typography: {
    fontFamily: { regular: 'System', bold: 'System' },
    sizes: { xs: 12, s: 14, m: 16, l: 22, xl: 28, xxl: 38 },
  },
  spacing: { xs: 4, s: 10, m: 16, l: 24, xl: 32, xxl: 48 },
  shapes: { borderRadius: { s: 14, m: 20, l: 28, pill: 9999 } },
  cards: { elevation: 0, borderWidth: 1, shadowOpacity: 0.08 },
};
