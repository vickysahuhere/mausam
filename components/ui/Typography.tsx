import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface Props extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodyMedium' | 'caption';
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function Typography({ variant = 'body', color, align = 'left', style, maxFontSizeMultiplier = 1.5, ...props }: Props) {
  const theme = useTheme();
  const isHeading = variant === 'h1' || variant === 'h2' || variant === 'h3';

  const getVariantStyles = () => {
    switch (variant) {
      case 'h1': 
        return { 
          fontSize: theme.typography.sizes.xxl, 
          lineHeight: Math.round(theme.typography.sizes.xxl * 1.25), 
          fontWeight: 'bold' as const 
        };
      case 'h2': 
        return { 
          fontSize: theme.typography.sizes.xl, 
          lineHeight: Math.round(theme.typography.sizes.xl * 1.3), 
          fontWeight: 'bold' as const 
        };
      case 'h3': 
        return { 
          fontSize: theme.typography.sizes.l, 
          lineHeight: Math.round(theme.typography.sizes.l * 1.35), 
          fontWeight: 'bold' as const 
        };
      case 'bodyMedium': 
        return { 
          fontSize: theme.typography.sizes.m, 
          lineHeight: Math.round(theme.typography.sizes.m * 1.4), 
          fontWeight: '500' as const 
        };
      case 'caption': 
        return { 
          fontSize: theme.typography.sizes.s, 
          lineHeight: Math.round(theme.typography.sizes.s * 1.35) 
        };
      case 'body':
      default:
        return { 
          fontSize: theme.typography.sizes.m, 
          lineHeight: Math.round(theme.typography.sizes.m * 1.4) 
        };
    }
  };

  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      accessibilityRole={props.accessibilityRole || (isHeading ? 'header' : undefined)}
      style={[
        getVariantStyles(),
        {
          color: color || theme.colors.text,
          textAlign: align,
          fontFamily: isHeading ? theme.typography.fontFamily.bold : theme.typography.fontFamily.regular,
          includeFontPadding: false,
        },
        style,
      ]}
      {...props}
    />
  );
}
