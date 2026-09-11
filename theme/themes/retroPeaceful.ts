import { MausamTheme } from '../types';

export const RetroPeacefulTheme: MausamTheme = {
  id: 'retro-peaceful',
  name: 'Retro Peaceful 2D',
  tagline: 'Warm Nostalgia & 2D Flat Illustration',
  artDirection: {
    cardStyle: 'flat2d',
    badgeStyle: 'square',
    dividerStyle: 'solid',
    shadowOffset: { width: 4, height: 4 }, // Hard comic offset shadow
  },
  colors: {
    background: '#FAF3E0', // Warm aged parchment
    surface: '#FFFBF2',
    surfaceSecondary: '#F2E8CF',
    primary: '#E76F51', // Terracotta stamp
    accent: '#2A9D8F', // Sage cyan
    text: '#264653', // Deep retro ink
    textSecondary: '#6B7280',
    border: '#264653', // Bold comic outline
    success: '#2A9D8F',
    warning: '#E9C46A',
    error: '#E76F51',
    glow: 'rgba(231, 111, 81, 0.15)',
  },
  typography: {
    fontFamily: { regular: 'KinderChildKawaiiBubble', bold: 'KinderChildKawaiiBubble' },
    sizes: { xs: 12, s: 14, m: 16, l: 22, xl: 30, xxl: 40 },
  },
  spacing: { xs: 6, s: 12, m: 18, l: 26, xl: 36, xxl: 52 },
  shapes: { borderRadius: { s: 0, m: 4, l: 6, pill: 0 } }, // Deliberately sharp 2D corners
  cards: { elevation: 0, borderWidth: 2.5, shadowOpacity: 1 },
};
