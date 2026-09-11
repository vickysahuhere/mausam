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

  // Kinder Child Kawaii Bubble proportional typographic scale & letter spacing
  const getVariantStyles = () => {
    switch (variant) {
      case 'h1': 
        return { 
          fontSize: theme.typography.sizes.xxl, 
          lineHeight: Math.round(theme.typography.sizes.xxl * 1.28), 
          fontWeight: '700' as const,
          letterSpacing: 0.5,
        };
      case 'h2': 
        return { 
          fontSize: theme.typography.sizes.xl, 
          lineHeight: Math.round(theme.typography.sizes.xl * 1.30), 
          fontWeight: '700' as const,
          letterSpacing: 0.4,
        };
      case 'h3': 
        return { 
          fontSize: theme.typography.sizes.l, 
          lineHeight: Math.round(theme.typography.sizes.l * 1.32), 
          fontWeight: '600' as const,
          letterSpacing: 0.3,
        };
      case 'bodyMedium': 
        return { 
          fontSize: theme.typography.sizes.m, 
          lineHeight: Math.round(theme.typography.sizes.m * 1.36), 
          fontWeight: '500' as const,
          letterSpacing: 0.25,
        };
      case 'caption': 
        return { 
          fontSize: theme.typography.sizes.s, 
          lineHeight: Math.round(theme.typography.sizes.s * 1.32),
          fontWeight: '400' as const,
          letterSpacing: 0.2,
        };
      case 'body':
      default:
        return { 
          fontSize: theme.typography.sizes.m, 
          lineHeight: Math.round(theme.typography.sizes.m * 1.38),
          fontWeight: '400' as const,
          letterSpacing: 0.2,
        };
    }
  };

  const themeFont = isHeading ? theme.typography.fontFamily.bold : theme.typography.fontFamily.regular;
  const fontFamily = (themeFont && themeFont !== 'System') ? themeFont : 'KinderChildKawaiiBubble';

  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      accessibilityRole={props.accessibilityRole || (isHeading ? 'header' : undefined)}
      style={[
        getVariantStyles(),
        {
          color: color || theme.colors.text,
          textAlign: align,
          fontFamily,
          includeFontPadding: false,
        },
        style,
      ]}
      {...props}
    />
  );
}
