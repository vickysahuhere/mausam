import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '../ui/Typography';
import { Icon } from '../ui/Icon';
import { useLayoutStore } from '../../store/useLayoutStore';
import { THEME_REGISTRY } from '../../theme/registry';
import { useTheme } from '../../theme/ThemeProvider';
import { MausamTheme } from '../../theme/types';

function ThemePreview({
  theme,
  isSelected,
  onSelect,
}: {
  theme: MausamTheme;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const currentTheme = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onSelect}
      style={{
        marginRight: currentTheme.spacing.m,
        width: 160,
        borderRadius: currentTheme.shapes.borderRadius.m,
        borderWidth: isSelected ? 2.5 : 1,
        borderColor: isSelected ? currentTheme.colors.primary : currentTheme.colors.border,
        backgroundColor: theme.colors.background,
        overflow: 'hidden',
        padding: 10,
      }}
    >
      {/* Header row with checkmark if selected */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <Typography
          variant="caption"
          style={{
            color: theme.colors.text,
            fontWeight: '700',
            fontSize: 13,
          }}
        >
          {theme.name}
        </Typography>
        {isSelected && (
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: currentTheme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="check" size={12} color="#FFFFFF" strokeWidth={3} />
          </View>
        )}
      </View>

      <Typography
        variant="caption"
        style={{
          color: theme.colors.textSecondary,
          fontSize: 10,
          marginBottom: 8,
          height: 24,
        }}
      >
        {theme.tagline || 'Visual Direction'}
      </Typography>

      {/* Mini Card simulating the theme's art direction */}
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.shapes.borderRadius.m,
          padding: 8,
          borderWidth: theme.cards.borderWidth,
          borderColor: theme.colors.border,
          height: 64,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ width: 30, height: 5, backgroundColor: theme.colors.textSecondary, borderRadius: 2 }} />
          <View
            style={{
              paddingHorizontal: 5,
              paddingVertical: 1,
              borderRadius: theme.artDirection?.badgeStyle === 'square' ? 1 : 6,
              backgroundColor: theme.colors.surfaceSecondary,
            }}
          >
            <Typography variant="caption" color={theme.colors.primary} style={{ fontSize: 8, fontWeight: '700' }}>
              32{'\u00B0'}
            </Typography>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: theme.colors.primary,
            }}
          />
          <View
            style={{
              height: 6,
              flex: 1,
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: 3,
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function ThemeSelector() {
  const { activeThemeId, setTheme } = useLayoutStore();
  const theme = useTheme();

  return (
    <View style={{ marginBottom: theme.spacing.m }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: theme.spacing.s }}>
        <Typography variant="h3">Visual Art Direction</Typography>
        <Typography variant="caption" color={theme.colors.textSecondary}>
          {THEME_REGISTRY[activeThemeId]?.name || 'Theme'}
        </Typography>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 4 }}>
        {Object.values(THEME_REGISTRY).map((t) => (
          <ThemePreview
            key={t.id}
            theme={t}
            isSelected={activeThemeId === t.id}
            onSelect={() => setTheme(t.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
