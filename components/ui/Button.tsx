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
    if (variant === 'primary') return '#FFF';
    if (variant === 'secondary' || variant === 'outline') return theme.colors.primary;
    return theme.colors.text;
  };

  const baseStyle: ViewStyle = {
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
  };

  return (
    <TouchableOpacity
      style={[baseStyle, outlineStyle, style]}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
