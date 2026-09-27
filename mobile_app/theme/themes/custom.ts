import { MausamTheme } from '../types';

export const CustomTheme: MausamTheme = {
  id: 'custom',
  name: 'Custom',
  tagline: 'Clean & Adaptable Baseline',
  artDirection: {
    cardStyle: 'standard',
    badgeStyle: 'pill',
    dividerStyle: 'solid',
    shadowOffset: { width: 0, height: 2 },
  },
  colors: {
    background: '#F4F4F5',
    surface: '#FFFFFF',
    surfaceSecondary: '#E4E4E7',
    primary: '#2563EB',
    accent: '#3B82F6',
    text: '#09090B',
    textSecondary: '#71717A',
    border: '#E4E4E7',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  typography: {
    fontFamily: { regular: 'System', bold: 'System' },
    sizes: { xs: 12, s: 14, m: 16, l: 20, xl: 24, xxl: 32 },
  },
  spacing: { xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48 },
  shapes: { borderRadius: { s: 6, m: 12, l: 16, pill: 9999 } },
  cards: { elevation: 2, borderWidth: 1, shadowOpacity: 0.06 },
};
