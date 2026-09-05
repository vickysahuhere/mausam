import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface Props extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
}

export function Button({ title, variant = 'primary', loading, style, ...props }: Props) {
  const getBgColor = () => {
    if (props.disabled) return colors.border;
    if (variant === 'primary') return colors.primary;
    if (variant === 'secondary') return colors.surface;
    return 'transparent';
  };

  const getTextColor = () => {
    if (props.disabled) return colors.textSecondary;
    if (variant === 'primary') return '#FFF';
    if (variant === 'secondary' || variant === 'outline') return colors.primary;
    return colors.text;
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: getBgColor() },
        variant === 'outline' && styles.outline,
        style,
      ]}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    ...typography.bodyMedium,
  },
});
