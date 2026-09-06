import React from 'react';
import { View, ViewProps, ViewStyle, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { GlassView } from 'expo-glass-effect';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'subtle';
}

export function Card({ style, variant = 'default', ...props }: CardProps) {
  const theme = useTheme();
  const { artDirection, colors, shapes, spacing, cards } = theme;

  const getCardStyle = (): ViewStyle => {
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
      elevation: cards.elevation,
    };

    switch (artDirection?.cardStyle) {
      case 'glass':
        return {
          ...base,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1.5,
          borderRadius: shapes.borderRadius.l,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.12,
          shadowRadius: 20,
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

  if (artDirection?.cardStyle === 'glass') {
    return (
      <View
        style={[
          getCardStyle(),
          style,
          {
            position: 'relative',
            overflow: Platform.OS === 'ios' ? 'hidden' : 'visible',
            elevation: 0,
          },
        ]}
        {...props}
      >
        {Platform.OS === 'ios' && (
          <GlassView
            glassEffectStyle="regular"
            tintColor="rgba(255, 255, 255, 0.45)"
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: shapes.borderRadius.l,
              },
            ]}
            pointerEvents="none"
          />
        )}
        {/* Specular Inner Light Reflection Header (Figma Glassmorphism design) */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 20,
            right: 20,
            height: 1.5,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
