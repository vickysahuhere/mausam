import React from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { Typography } from '../ui/Typography';
import { Icon, IconName } from '../ui/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useLocaleStore } from '../../store/useLocaleStore';

export interface WidgetProps {
  id: string;
  isCustomizing: boolean;
  onRemove?: () => void;
}

interface WrapperProps {
  title: string;
  iconName?: IconName;
  badge?: string;
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
  isCustomizing: boolean;
  onRemove?: () => void;
}

export function WidgetCard({
  title,
  iconName,
  badge,
  loading,
  error,
  children,
  isCustomizing,
  onRemove,
}: WrapperProps) {
  const theme = useTheme();
  const _locale = useLocaleStore((state) => state.locale);
  void _locale;
  const t = useLocaleStore((state) => state.t);
  const displayTitle = t(title);

  return (
    <Card style={{ marginBottom: theme.spacing.m, position: 'relative' }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.s,
          borderBottomWidth: theme.artDirection?.dividerStyle === 'hairline' ? 1 : 0,
          borderBottomColor: theme.colors.border,
          paddingBottom: theme.artDirection?.dividerStyle === 'hairline' ? 6 : 0,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, flexShrink: 1, marginRight: 8 }}>
          {iconName && (
            <View style={{ marginRight: 6 }}>
              <Icon name={iconName} size={16} color={theme.colors.primary} />
            </View>
          )}
          <Typography
            variant="caption"
            color={theme.colors.textSecondary}
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase', flexShrink: 1 }}
          >
            {displayTitle}
          </Typography>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {badge && !isCustomizing && (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: theme.artDirection?.badgeStyle === 'square' ? 2 : 12,
                backgroundColor: theme.colors.surfaceSecondary,
                borderWidth: theme.artDirection?.badgeStyle === 'outline' ? 1 : 0,
                borderColor: theme.colors.primary,
              }}
            >
              <Typography variant="caption" color={theme.colors.primary} style={{ fontSize: 11, fontWeight: '600' }}>
                {badge}
              </Typography>
            </View>
          )}

          {isCustomizing && (
            <TouchableOpacity
              onPress={onRemove}
              activeOpacity={0.7}
              style={{
                padding: 4,
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 9999,
                borderWidth: 1,
                borderColor: theme.colors.error,
              }}
            >
              <Icon name="close" size={12} color={theme.colors.error} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={{ height: 64, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.primary} size="small" />
        </View>
      ) : error ? (
        <View style={{ height: 64, justifyContent: 'center' }}>
          <Typography color={theme.colors.error}>{error}</Typography>
        </View>
      ) : (
        <View style={{ minHeight: 40 }}>{children}</View>
      )}
    </Card>
  );
}
