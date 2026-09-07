import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'subtle';
}

export function Card({ style, variant = 'default', ...props }: CardProps) {
  const theme = useTheme();
  const { artDirection, colors, shapes, spacing, cards } = theme;

  const isGlass = artDirection?.cardStyle === 'glass';
  const isTranslucent = colors.surface.startsWith('rgba') || (colors.surface.startsWith('#') && colors.surface.length > 7);

  const getCardStyle = (): ViewStyle => {
    // Critical: Android's hardware renderer (ViewOutlineProvider) draws an opaque
    // white/gray rectangular tile behind translucent surfaces when elevation > 0.
    // Glass and translucent surfaces must always have elevation: 0.
    const safeElevation = (isGlass || isTranslucent) ? 0 : cards.elevation;

    const base: ViewStyle = {
      backgroundColor: colors.surface,
      borderRadius: shapes.borderRadius.l,
      padding: spacing.m,
      borderWidth: cards.borderWidth,
      borderColor: colors.border,
      shadowColor: artDirection?.cardStyle === 'flat2d' ? colors.border : (theme.isDark ? colors.border : '#1E293B'),
      shadowOffset: artDirection?.shadowOffset || { width: 0, height: 2 },
      shadowOpacity: cards.shadowOpacity,
      shadowRadius: artDirection?.cardStyle === 'flat2d' ? 0 : shapes.borderRadius.m,
      elevation: safeElevation,
    };

    switch (artDirection?.cardStyle) {
      case 'glass':
        return {
          ...base,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: shapes.borderRadius.l,
          shadowColor: '#0284C7',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 0,
        };

      case 'flat2d':
        return {
          ...base,
          borderWidth: 2.5,
          borderRadius: shapes.borderRadius.s,
          shadowRadius: 0,
        };

      case 'oled':
        return {
          ...base,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1.5,
          shadowColor: colors.primary,
          shadowOpacity: 0.15,
          elevation: 0,
        };

      case 'pebble':
        return {
          ...base,
          borderRadius: shapes.borderRadius.l,
          borderWidth: 1,
        };

      case 'rugged':
        return {
          ...base,
          borderRadius: shapes.borderRadius.s,
          borderWidth: 2,
          shadowOpacity: 0,
          elevation: 0,
        };

      case 'transit':
        return {
          ...base,
          borderWidth: 1.5,
          borderColor: colors.border,
        };

      case 'editorial':
        return {
          ...base,
          borderRadius: shapes.borderRadius.m,
          borderWidth: 1,
          borderColor: colors.border,
        };

      default:
        return base;
    }
  };

  if (isGlass) {
    return (
      <View
        style={[
          getCardStyle(),
          style,
          {
            position: 'relative',
            overflow: 'hidden',
          },
        ]}
        {...props}
      >
        {/* Specular Inner Light Reflection Header (Apple Liquid Glassmorphism) */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 16,
            right: 16,
            height: 1.5,
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            borderRadius: 1,
          }}
          pointerEvents="none"
        />
        {props.children}
      </View>
    );
  }

  return <View style={[getCardStyle(), style]} {...props} />;
}
