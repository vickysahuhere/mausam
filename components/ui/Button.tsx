import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface Props extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
}

export function Button({ title, variant = 'primary', loading, style, ...props }: Props) {
  const theme = useTheme();

  const getBgColor = () => {
    if (props.disabled) return theme.colors.border;
    if (variant === 'primary') return theme.colors.primary;
    if (variant === 'secondary') return theme.colors.surface;
    return 'transparent';
  };

  const getTextColor = () => {
    if (props.disabled) return theme.colors.textSecondary;
    if (variant === 'primary') return theme.colors.onPrimary || '#FFF';
    if (variant === 'secondary' || variant === 'outline') return theme.colors.primary;
    return theme.colors.text;
  };

  const baseStyle: ViewStyle = {
    minHeight: 44,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    borderRadius: theme.shapes.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: getBgColor(),
  };

  const outlineStyle: ViewStyle | undefined = variant === 'outline' ? {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  } : undefined;

  const textStyle: TextStyle = {
    fontSize: theme.typography.sizes.m,
    color: getTextColor(),
    fontFamily: theme.typography.fontFamily.bold,
    textAlign: 'center',
    flexShrink: 1,
    includeFontPadding: false,
  };

  return (
    <TouchableOpacity
      style={[baseStyle, outlineStyle, style]}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!props.disabled, busy: !!loading }}
      accessibilityLabel={props.accessibilityLabel || title}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={textStyle}
          numberOfLines={2}
          maxFontSizeMultiplier={1.4}
          adjustsFontSizeToFit={true}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
