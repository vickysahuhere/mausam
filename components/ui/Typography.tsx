import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface Props extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodyMedium' | 'caption';
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function Typography({ variant = 'body', color, align = 'left', style, ...props }: Props) {
  const theme = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'h1': return { fontSize: theme.typography.sizes.xxl, fontWeight: 'bold' as const };
      case 'h2': return { fontSize: theme.typography.sizes.xl, fontWeight: 'bold' as const };
      case 'h3': return { fontSize: theme.typography.sizes.l, fontWeight: 'bold' as const };
      case 'bodyMedium': return { fontSize: theme.typography.sizes.m, fontWeight: '500' as const };
      case 'caption': return { fontSize: theme.typography.sizes.s };
      case 'body':
      default:
        return { fontSize: theme.typography.sizes.m };
    }
  };

  return (
    <Text
      style={[
        getVariantStyles(),
        {
          color: color || theme.colors.text,
          textAlign: align,
          fontFamily: theme.typography.fontFamily.regular,
        },
        style,
      ]}
      {...props}
    />
  );
}
