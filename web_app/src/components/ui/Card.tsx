import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'subtle';
  children?: React.ReactNode;
}

export function Card({ className = '', style, children, variant = 'default', ...props }: CardProps) {
  const theme = useTheme();
  const { artDirection, colors, shapes, spacing, cards } = theme;

  const isGlass = artDirection?.cardStyle === 'glass';
  const isFlat2d = artDirection?.cardStyle === 'flat2d';
  const isOled = artDirection?.cardStyle === 'oled';

  const getCardClasses = () => {
    switch (artDirection?.cardStyle) {
      case 'glass':
        return 'backdrop-blur-xl border border-white/20 shadow-xl';
      case 'flat2d':
        return 'border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]';
      case 'oled':
        return 'border border-lime-400/30 shadow-[0_0_15px_rgba(163,230,53,0.15)]';
      case 'pebble':
        return 'rounded-3xl border border-teal-500/20 shadow-md';
      case 'rugged':
        return 'rounded-md border-2 border-amber-800/30';
      case 'editorial':
        return 'rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm';
      default:
        return 'border border-slate-200 dark:border-slate-800 shadow-sm';
    }
  };

  const dynamicStyles: React.CSSProperties = {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: isFlat2d ? 8 : shapes?.borderRadius?.l || 16,
    padding: spacing?.m ? `${spacing.m}px` : '16px',
    borderColor: isFlat2d ? colors.border : colors.border,
    ...style,
  };

  return (
    <div
      className={`relative overflow-hidden transition-all duration-200 ${getCardClasses()} ${className}`}
      style={dynamicStyles}
      {...props}
    >
      {/* Specular highlight for glassmorphism */}
      {isGlass && (
        <div
          className="absolute top-0 left-4 right-4 h-[1px] pointer-events-none rounded-full"
          style={{
            backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.85)',
          }}
        />
      )}
      {children}
    </div>
  );
}
