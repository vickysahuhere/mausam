import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '../ui/Typography';
import { Icon } from '../ui/Icon';
import { useLayoutStore } from '../../store/useLayoutStore';
import { THEME_REGISTRY } from '../../theme/registry';
import { useTheme } from '../../theme/ThemeProvider';
import { MausamTheme } from '../../theme/types';
import { useCustomThemeStore } from '../../store/useCustomThemeStore';
import { ThemeStudioModal } from '../theme/ThemeStudioModal';

function ThemePreview({
  theme,
  isSelected,
  onSelect,
  onEdit,
}: {
  theme: MausamTheme;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
}) {
  const currentTheme = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onSelect}
      style={{
        marginRight: currentTheme.spacing.m,
        width: 164,
        borderRadius: currentTheme.shapes.borderRadius.m,
        borderWidth: isSelected ? 2.5 : 1,
        borderColor: isSelected ? currentTheme.colors.primary : currentTheme.colors.border,
        backgroundColor: theme.colors.background,
        overflow: 'hidden',
        padding: 10,
      }}
    >
      {/* Header row with custom badge, edit button, and checkmark */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 6 }}>
          <Typography
            variant="caption"
            numberOfLines={1}
            style={{
              color: theme.colors.text,
              fontWeight: '700',
              fontSize: 13,
              flexShrink: 1,
            }}
          >
            {theme.name}
          </Typography>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {theme.isCustom && onEdit && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              style={{
                padding: 3,
                borderRadius: 6,
                backgroundColor: currentTheme.colors.surfaceSecondary,
              }}
            >
              <Icon name="sliders" size={11} color={currentTheme.colors.primary} />
            </TouchableOpacity>
          )}

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
      </View>

      <Typography
        variant="caption"
        numberOfLines={2}
        style={{
          color: theme.colors.textSecondary,
          fontSize: 10,
          marginBottom: 8,
          height: 26,
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
              32{'°'}
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
  const { customThemes } = useCustomThemeStore();
  const theme = useTheme();

  const [studioVisible, setStudioVisible] = useState(false);
  const [editingTheme, setEditingTheme] = useState<MausamTheme | null>(null);

  const activeThemeName =
    customThemes.find((t) => t.id === activeThemeId)?.name ||
    THEME_REGISTRY[activeThemeId]?.name ||
    'Custom Theme';

  const handleOpenNewStudio = () => {
    setEditingTheme(null);
    setStudioVisible(true);
  };

  const handleOpenEditStudio = (t: MausamTheme) => {
    setEditingTheme(t);
    setStudioVisible(true);
  };

  return (
    <View style={{ marginBottom: theme.spacing.m }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: theme.spacing.s }}>
        <Typography variant="h3">Visual Art Direction</Typography>
        <Typography variant="caption" color={theme.colors.textSecondary}>
          {activeThemeName}
        </Typography>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 4 }}>
        {/* "+ Create Theme" Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenNewStudio}
          style={{
            marginRight: theme.spacing.m,
            width: 140,
            borderRadius: theme.shapes.borderRadius.m,
            borderWidth: 1.5,
            borderColor: theme.colors.primary,
            borderStyle: 'dashed',
            backgroundColor: theme.colors.surfaceSecondary,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 14,
            height: 140,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}
          >
            <Icon name="plus" size={20} color="#FFFFFF" />
          </View>
          <Typography variant="caption" style={{ fontWeight: '800', color: theme.colors.primary, textAlign: 'center' }}>
            + Create Theme
          </Typography>
          <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 10, textAlign: 'center', marginTop: 2 }}>
            Design Atmosphere
          </Typography>
        </TouchableOpacity>

        {/* User's Custom Themes */}
        {customThemes.map((t) => (
          <ThemePreview
            key={t.id}
            theme={t}
            isSelected={activeThemeId === t.id}
            onSelect={() => setTheme(t.id)}
            onEdit={() => handleOpenEditStudio(t)}
          />
        ))}

        {/* Built-in Preset Themes */}
        {Object.values(THEME_REGISTRY).map((t) => (
          <ThemePreview
            key={t.id}
            theme={t}
            isSelected={activeThemeId === t.id}
            onSelect={() => setTheme(t.id)}
          />
        ))}
      </ScrollView>

      {/* Theme Studio Modal */}
      {studioVisible && (
        <ThemeStudioModal
          visible={studioVisible}
          onClose={() => setStudioVisible(false)}
          initialTheme={editingTheme}
        />
      )}
    </View>
  );
}
