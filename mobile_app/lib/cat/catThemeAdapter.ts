/**
 * Cat Theme Adapter
 * Harmonizes Mausam Cat visuals with all 11 Mausam Art Directions & Color Palettes.
 */

import { MausamTheme } from '../../theme/types';
import { CatThemeStyle } from './catTypes';

export function getCatThemeStyle(theme: MausamTheme, isDark: boolean): CatThemeStyle {
  const themeId = theme.id || 'apple-liquid';
  const cardStyle = theme.artDirection?.cardStyle;
  switch (themeId) {
    case 'retro-peaceful':
    case 'retro-peaceful-2d':
      return {
        themeId,
        coatColor: isDark ? '#EADBC8' : '#FAF3E0',
        earInnerColor: '#E76F51',
        outlineColor: '#264653',
        outlineWidth: 2,
        cheekColor: '#E76F51',
        eyeColor: '#264653',
        noseColor: '#E76F51',
        auraGlowColor: 'transparent',
        shadowStyle: 'comic_offset',
        cardSurfaceTint: '#FAF0CA',
        accessoryTintColor: '#E76F51',
        motionIntensity: 0.9,
      };

    case 'health':
      return {
        themeId,
        coatColor: isDark ? '#ECFDF5' : '#FFFFFF',
        earInnerColor: '#A7F3D0',
        outlineColor: isDark ? '#064E3B' : '#059669',
        outlineWidth: 1.2,
        cheekColor: '#34D399',
        eyeColor: '#064E3B',
        noseColor: '#10B981',
        auraGlowColor: 'rgba(16, 185, 129, 0.18)',
        shadowStyle: 'flat_soft',
        cardSurfaceTint: 'rgba(16, 185, 129, 0.08)',
        accessoryTintColor: '#059669',
        motionIntensity: 0.85,
      };

    case 'fitness':
      return {
        themeId,
        coatColor: isDark ? '#F1F5F9' : '#FFFFFF',
        earInnerColor: '#FED7AA',
        outlineColor: isDark ? '#7C2D12' : '#C2410C',
        outlineWidth: 1.4,
        cheekColor: '#FB923C',
        eyeColor: '#431407',
        noseColor: '#EA580C',
        auraGlowColor: 'rgba(234, 88, 12, 0.22)',
        shadowStyle: 'neon_glow',
        cardSurfaceTint: 'rgba(234, 88, 12, 0.08)',
        accessoryTintColor: '#EA580C',
        motionIntensity: 1.15,
      };

    case 'beach':
      return {
        themeId,
        coatColor: isDark ? '#FEF3C7' : '#FFFBEB',
        earInnerColor: '#FDE68A',
        outlineColor: isDark ? '#164E63' : '#0E7490',
        outlineWidth: 1.2,
        cheekColor: '#FBBF24',
        eyeColor: '#155E75',
        noseColor: '#0284C7',
        auraGlowColor: 'rgba(14, 165, 233, 0.18)',
        shadowStyle: 'glass_ambient',
        cardSurfaceTint: 'rgba(14, 165, 233, 0.06)',
        accessoryTintColor: '#0284C7',
        motionIntensity: 0.95,
      };

    case 'travel':
      return {
        themeId,
        coatColor: isDark ? '#F3E8FF' : '#FAF5FF',
        earInnerColor: '#E9D5FF',
        outlineColor: isDark ? '#4C1D95' : '#6D28D9',
        outlineWidth: 1.2,
        cheekColor: '#C084FC',
        eyeColor: '#3B0764',
        noseColor: '#7C3AED',
        auraGlowColor: 'rgba(124, 58, 237, 0.16)',
        shadowStyle: 'glass_ambient',
        cardSurfaceTint: 'rgba(124, 58, 237, 0.06)',
        accessoryTintColor: '#7C3AED',
        motionIntensity: 1.0,
      };

    case 'parent':
      return {
        themeId,
        coatColor: isDark ? '#FFF1F2' : '#FFF5F5',
        earInnerColor: '#FECDD3',
        outlineColor: isDark ? '#881337' : '#BE123C',
        outlineWidth: 1.2,
        cheekColor: '#FDA4AF',
        eyeColor: '#4C0519',
        noseColor: '#F43F5E',
        auraGlowColor: 'rgba(244, 63, 94, 0.15)',
        shadowStyle: 'flat_soft',
        cardSurfaceTint: 'rgba(244, 63, 94, 0.05)',
        accessoryTintColor: '#F43F5E',
        motionIntensity: 0.85,
      };

    case 'agriculture':
      return {
        themeId,
        coatColor: isDark ? '#FEF9C3' : '#FEFCE8',
        earInnerColor: '#FEF08A',
        outlineColor: isDark ? '#713F12' : '#854D0E',
        outlineWidth: 1.4,
        cheekColor: '#FACC15',
        eyeColor: '#422006',
        noseColor: '#CA8A04',
        auraGlowColor: 'rgba(202, 138, 4, 0.16)',
        shadowStyle: 'comic_offset',
        cardSurfaceTint: 'rgba(202, 138, 4, 0.08)',
        accessoryTintColor: '#CA8A04',
        motionIntensity: 0.9,
      };

    case 'commuter':
      return {
        themeId,
        coatColor: isDark ? '#E2E8F0' : '#F8FAFC',
        earInnerColor: '#CBD5E1',
        outlineColor: isDark ? '#0F172A' : '#334155',
        outlineWidth: 1.2,
        cheekColor: '#94A3B8',
        eyeColor: '#0F172A',
        noseColor: '#475569',
        auraGlowColor: 'rgba(71, 85, 105, 0.12)',
        shadowStyle: 'flat_soft',
        cardSurfaceTint: 'rgba(71, 85, 105, 0.05)',
        accessoryTintColor: '#334155',
        motionIntensity: 0.95,
      };

    case 'event':
      return {
        themeId,
        coatColor: isDark ? '#FDF4FF' : '#FAF5FF',
        earInnerColor: '#F0ABFC',
        outlineColor: isDark ? '#581C87' : '#7E22CE',
        outlineWidth: 1.3,
        cheekColor: '#E879F9',
        eyeColor: '#3B0764',
        noseColor: '#A855F7',
        auraGlowColor: 'rgba(168, 85, 247, 0.22)',
        shadowStyle: 'neon_glow',
        cardSurfaceTint: 'rgba(168, 85, 247, 0.08)',
        accessoryTintColor: '#A855F7',
        motionIntensity: 1.1,
      };

    case 'apple-liquid':
    default:
      // Apple Liquid Glass Aesthetics
      return {
        themeId: 'apple-liquid',
        coatColor: isDark ? '#E2E8F0' : '#FFFDF7',
        earInnerColor: '#FDA4AF',
        outlineColor: isDark ? '#1E293B' : '#475569',
        outlineWidth: cardStyle === 'flat2d' ? 2 : 1,
        cheekColor: '#F472B6',
        eyeColor: '#1E293B',
        noseColor: '#F43F5E',
        auraGlowColor: isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.15)',
        shadowStyle: 'glass_ambient',
        cardSurfaceTint: theme.colors.surface,
        accessoryTintColor: theme.colors.primary,
        motionIntensity: 1.0,
      };
  }
}
