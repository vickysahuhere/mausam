import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';

export interface TypographyProps extends React.HTMLAttributes<HTMLHeadingElement | HTMLParagraphElement | HTMLSpanElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodyMedium' | 'caption';
  color?: string;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  children?: React.ReactNode;
}

export function Typography({
  variant = 'body',
  color,
  align = 'left',
  numberOfLines,
  className = '',
  style,
  children,
  ...props
}: TypographyProps) {
  const theme = useTheme();

  const getVariantClasses = () => {
    switch (variant) {
      case 'h1':
        return 'text-4xl md:text-5xl font-bold tracking-tight';
      case 'h2':
        return 'text-2xl md:text-3xl font-bold tracking-tight';
      case 'h3':
        return 'text-lg md:text-xl font-bold';
      case 'bodyMedium':
        return 'text-sm md:text-base font-medium';
      case 'caption':
        return 'text-xs md:text-sm font-normal';
      case 'body':
      default:
        return 'text-sm md:text-base font-normal';
    }
  };

  const lineClampStyle: React.CSSProperties = numberOfLines
    ? {
        display: '-webkit-box',
        WebkitLineClamp: numberOfLines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }
    : {};

  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  const combinedStyle: React.CSSProperties = {
    color: color || theme.colors.text,
    ...lineClampStyle,
    ...style,
  };

  if (variant === 'h1') {
    return (
      <h1 className={`${getVariantClasses()} ${alignClass} ${className}`} style={combinedStyle} {...props}>
        {children}
      </h1>
    );
  }
  if (variant === 'h2') {
    return (
      <h2 className={`${getVariantClasses()} ${alignClass} ${className}`} style={combinedStyle} {...props}>
        {children}
      </h2>
    );
  }
  if (variant === 'h3') {
    return (
      <h3 className={`${getVariantClasses()} ${alignClass} ${className}`} style={combinedStyle} {...props}>
        {children}
      </h3>
    );
  }
  if (variant === 'caption') {
    return (
      <p className={`${getVariantClasses()} ${alignClass} ${className}`} style={combinedStyle} {...props}>
        {children}
      </p>
    );
  }

  return (
    <p className={`${getVariantClasses()} ${alignClass} ${className}`} style={combinedStyle} {...props}>
      {children}
    </p>
  );
}
