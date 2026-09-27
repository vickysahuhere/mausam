import React from 'react';
import { Card } from '../ui/Card';
import { Typography } from '../ui/Typography';
import { Icon, IconName } from '../ui/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useLocaleStore } from '../../store/useLocaleStore';

export interface WidgetProps {
  id: string;
  isCustomizing?: boolean;
  onRemove?: () => void;
}

interface WrapperProps {
  title: string;
  iconName?: IconName | string;
  badge?: string;
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
  isCustomizing?: boolean;
  onRemove?: () => void;
  className?: string;
}

export function WidgetCard({
  title,
  iconName,
  badge,
  loading,
  error,
  children,
  isCustomizing = false,
  onRemove,
  className = '',
}: WrapperProps) {
  const theme = useTheme();
  useLocaleStore((state) => state.locale);
  const t = useLocaleStore((state) => state.t);
  const displayTitle = t(title);

  return (
    <Card className={`relative group transition-all duration-200 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {iconName && (
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${theme.colors.primary}18`,
                color: theme.colors.primary,
              }}
            >
              <Icon name={iconName} size={15} color={theme.colors.primary} />
            </div>
          )}
          <Typography variant="bodyMedium" className="font-semibold truncate">
            {displayTitle}
          </Typography>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {badge && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `${theme.colors.primary}15`,
                color: theme.colors.primary,
              }}
            >
              {badge}
            </span>
          )}

          {isCustomizing && onRemove && (
            <button
              onClick={onRemove}
              className="w-6 h-6 rounded-full flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              title="Remove widget"
            >
              <Icon name="x" size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
          <div
            className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: `${theme.colors.primary} transparent ${theme.colors.primary} ${theme.colors.primary}` }}
          />
          <span className="text-xs">Fetching telemetry...</span>
        </div>
      ) : error ? (
        <div className="py-4 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
          {error}
        </div>
      ) : (
        <div>{children}</div>
      )}
    </Card>
  );
}
