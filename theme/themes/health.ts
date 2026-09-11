import { MausamTheme } from '../types';

export const HealthTheme: MausamTheme = {
  id: 'health',
  name: 'Health',
  tagline: 'Clinical Precision & Wellness Focus',
  artDirection: {
    cardStyle: 'clinical',
    badgeStyle: 'pill',
    dividerStyle: 'hairline',
    shadowOffset: { width: 0, height: 1 },
  },
  colors: {
    background: '#F8FAFC', // Sterile breathable light blue-gray
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',
    primary: '#0284C7', // Medical clean cyan
    accent: '#0EA5E9',
    text: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0', // Hairline clinical divider
    success: '#059669', // Clean green AQI indicator
    warning: '#D97706',
    error: '#DC2626',
    glow: 'rgba(14, 165, 233, 0.12)',
  },
  typography: {
    fontFamily: { regular: 'KinderChildKawaiiBubble', bold: 'KinderChildKawaiiBubble' },
    sizes: { xs: 11, s: 13, m: 15, l: 19, xl: 24, xxl: 32 },
  },
  spacing: { xs: 4, s: 8, m: 14, l: 22, xl: 30, xxl: 44 },
  shapes: { borderRadius: { s: 4, m: 8, l: 12, pill: 9999 } },
  cards: { elevation: 1, borderWidth: 1, shadowOpacity: 0.04 },
};
