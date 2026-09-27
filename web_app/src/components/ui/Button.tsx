import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  icon,
  className = '',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const theme = useTheme();

  const getVariantStyles = (): React.CSSProperties => {
    if (disabled) {
      return {
        backgroundColor: theme.colors.border,
        color: theme.colors.textSecondary,
        cursor: 'not-allowed',
        opacity: 0.6,
      };
    }
    if (variant === 'primary') {
      return {
        backgroundColor: theme.colors.primary,
        color: theme.colors.onPrimary || '#FFFFFF',
        boxShadow: `0 4px 14px 0 ${theme.colors.glow || 'rgba(0,0,0,0.1)'}`,
      };
    }
    if (variant === 'secondary') {
      return {
        backgroundColor: theme.colors.surface,
        color: theme.colors.primary,
        border: `1px solid ${theme.colors.border}`,
      };
    }
    if (variant === 'outline') {
      return {
        backgroundColor: 'transparent',
        color: theme.colors.primary,
        border: `1px solid ${theme.colors.primary}`,
      };
    }
    return {
      backgroundColor: 'transparent',
      color: theme.colors.text,
    };
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold text-sm px-4 py-2.5 transition-all duration-200 active:scale-95 cursor-pointer disabled:pointer-events-none rounded-xl gap-2 ${className}`}
      style={{
        borderRadius: theme.shapes.borderRadius.m,
        ...getVariantStyles(),
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : icon ? (
        <span>{icon}</span>
      ) : null}
      <span>{title}</span>
    </button>
  );
}
