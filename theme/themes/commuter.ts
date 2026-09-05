import { MausamTheme } from '../types';

export const CommuterTheme: MausamTheme = {
  id: 'commuter',
  name: 'Commuter',
  tagline: 'Asphalt Slate & Transit HUD',
  artDirection: {
    cardStyle: 'transit',
    badgeStyle: 'neon',
    dividerStyle: 'hairline',
    shadowOffset: { width: 0, height: 3 },
  },
  colors: {
    background: '#0F172A', // Deep highway night asphalt
    surface: '#1E293B', // Urban transit panel
    surfaceSecondary: '#334155',
    primary: '#FBBF24', // High-visibility road caution amber
    accent: '#38BDF8', // Clear sky HUD blue
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: '#334155', // High-contrast lane marker border
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    glow: 'rgba(251, 191, 36, 0.25)',
  },
  typography: {
    fontFamily: { regular: 'System', bold: 'System' },
    sizes: { xs: 12, s: 14, m: 17, l: 22, xl: 28, xxl: 38 },
  },
  spacing: { xs: 4, s: 8, m: 14, l: 20, xl: 28, xxl: 40 }, // Dense glanceable spacing
  shapes: { borderRadius: { s: 4, m: 8, l: 12, pill: 9999 } },
  cards: { elevation: 3, borderWidth: 1.5, shadowOpacity: 0.25 },
};
