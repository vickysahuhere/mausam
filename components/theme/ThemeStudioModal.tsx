import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { MausamTheme } from '../../theme/types';
import { useCustomThemeStore } from '../../store/useCustomThemeStore';
import { useLayoutStore } from '../../store/useLayoutStore';
import { useTheme } from '../../theme/ThemeProvider';

interface ThemeStudioModalProps {
  visible: boolean;
  onClose: () => void;
  initialTheme?: MausamTheme | null;
}

interface PalettePreset {
  name: string;
  bg: string;
  surface: string;
  primary: string;
  accent: string;
  text: string;
  textSecondary: string;
  border: string;
  gradient: [string, string];
}

const PALETTE_PRESETS: PalettePreset[] = [
  {
    name: 'Monsoon Violet',
    bg: '#120524',
    surface: '#24103E',
    primary: '#A855F7',
    accent: '#06B6D4',
    text: '#F3E8FF',
    textSecondary: '#C084FC',
    border: '#4C1D95',
    gradient: ['#120524', '#2E1052'],
  },
  {
    name: 'Sunset Amber',
    bg: '#1F0B05',
    surface: '#36160A',
    primary: '#F97316',
    accent: '#FBBF24',
    text: '#FFF7ED',
    textSecondary: '#FDBA74',
    border: '#7C2D12',
    gradient: ['#1F0B05', '#451A0A'],
  },
  {
    name: 'Cyber Neon',
    bg: '#050505',
    surface: '#111111',
    primary: '#22C55E',
    accent: '#06B6D4',
    text: '#FFFFFF',
    textSecondary: '#86EFAC',
    border: '#166534',
    gradient: ['#050505', '#0F291E'],
  },
  {
    name: 'Oceanic Azure',
    bg: '#031926',
    surface: '#0B2538',
    primary: '#0EA5E9',
    accent: '#38BDF8',
    text: '#F0F9FF',
    textSecondary: '#7DD3FC',
    border: '#0369A1',
    gradient: ['#031926', '#083344'],
  },
  {
    name: 'Rose Quartz',
    bg: '#1A0D15',
    surface: '#2D1525',
    primary: '#EC4899',
    accent: '#F472B6',
    text: '#FDF2F8',
    textSecondary: '#F9A8D4',
    border: '#831843',
    gradient: ['#1A0D15', '#3F1732'],
  },
  {
    name: 'Forest Pine',
    bg: '#061A14',
    surface: '#0F2D24',
    primary: '#10B981',
    accent: '#34D399',
    text: '#ECFDF5',
    textSecondary: '#6EE7B7',
    border: '#065F46',
    gradient: ['#061A14', '#0F382C'],
  },
  {
    name: 'Midnight OLED',
    bg: '#000000',
    surface: '#121212',
    primary: '#6366F1',
    accent: '#818CF8',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    border: '#27272A',
    gradient: ['#000000', '#18181B'],
  },
  {
    name: 'Vintage Cream',
    bg: '#FAF5EF',
    surface: '#FFFFFF',
    primary: '#854D0E',
    accent: '#CA8A04',
    text: '#292524',
    textSecondary: '#78716C',
    border: '#E7E5E4',
    gradient: ['#FAF5EF', '#F5EBE0'],
  },
];

export function ThemeStudioModal({ visible, onClose, initialTheme }: ThemeStudioModalProps) {
  const currentTheme = useTheme();
  const { saveCustomTheme, deleteCustomTheme } = useCustomThemeStore();
  const { setTheme } = useLayoutStore();

  const [themeId] = useState(() => initialTheme?.id || 'custom-' + Date.now());
  const [name, setName] = useState(initialTheme?.name || 'My Custom Theme');
  const [tagline, setTagline] = useState(initialTheme?.tagline || 'Customized weather visuals');

  // Colors
  const [background, setBackground] = useState(initialTheme?.colors.background || '#120524');
  const [surface, setSurface] = useState(initialTheme?.colors.surface || '#24103E');
  const [primary, setPrimary] = useState(initialTheme?.colors.primary || '#A855F7');
  const [accent, setAccent] = useState(initialTheme?.colors.accent || '#06B6D4');
  const [textColor, setTextColor] = useState(initialTheme?.colors.text || '#F3E8FF');
  const [textSecondary, setTextSecondary] = useState(initialTheme?.colors.textSecondary || '#C084FC');
  const [borderColor, setBorderColor] = useState(initialTheme?.colors.border || '#4C1D95');

  // Aesthetics
  const [cardRadius, setCardRadius] = useState<number>(initialTheme?.shapes.borderRadius.m || 16);
  const [cardStyle, setCardStyle] = useState<'standard' | 'glass' | 'oled' | 'pebble'>(
    (initialTheme?.artDirection.cardStyle as any) || 'glass'
  );
  const [badgeStyle, setBadgeStyle] = useState<'pill' | 'square' | 'outline' | 'neon'>(
    initialTheme?.artDirection.badgeStyle || 'neon'
  );
  const [dividerStyle, setDividerStyle] = useState<'solid' | 'dashed' | 'hairline'>(
    initialTheme?.artDirection.dividerStyle || 'hairline'
  );
  const [iconStyle, setIconStyle] = useState<'line' | 'bold' | 'neon'>(
    initialTheme?.artDirection.iconStyle || 'neon'
  );
  const [wallpaperType, setWallpaperType] = useState<'solid' | 'gradient'>(
    (initialTheme?.artDirection.wallpaper?.type === 'solid' ? 'solid' : 'gradient')
  );
  const [gradientColors, setGradientColors] = useState<[string, string]>(
    initialTheme?.artDirection.wallpaper?.gradientColors || ['#120524', '#2E1052']
  );

  const applyPalette = (p: PalettePreset) => {
    setBackground(p.bg);
    setSurface(p.surface);
    setPrimary(p.primary);
    setAccent(p.accent);
    setTextColor(p.text);
    setTextSecondary(p.textSecondary);
    setBorderColor(p.border);
    setGradientColors(p.gradient);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Theme Name Required', 'Please enter a name for your custom theme.');
      return;
    }

    const builtTheme: MausamTheme = {
      id: themeId,
      name: name.trim(),
      tagline: tagline.trim(),
      isCustom: true,
      artDirection: {
        cardStyle,
        badgeStyle,
        dividerStyle,
        shadowOffset: { width: 0, height: 4 },
        iconStyle,
        wallpaper: {
          type: wallpaperType,
          gradientColors,
        },
      },
      colors: {
        background,
        surface,
        surfaceSecondary: surface,
        primary,
        accent,
        text: textColor,
        textSecondary,
        border: borderColor,
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        glow: primary,
      },
      typography: {
        fontFamily: { regular: 'KinderChildKawaiiBubble', bold: 'KinderChildKawaiiBubble' },
        sizes: { xs: 11, s: 13, m: 15, l: 18, xl: 22, xxl: 32 },
      },
      spacing: { xs: 4, s: 8, m: 14, l: 20, xl: 28, xxl: 36 },
      shapes: {
        borderRadius: {
          s: Math.max(4, cardRadius - 8),
          m: cardRadius,
          l: cardRadius + 8,
          pill: 999,
        },
      },
      cards: {
        elevation: (cardStyle === 'oled' || cardStyle === 'glass') ? 0 : 5,
        borderWidth: (cardStyle === 'oled' || cardStyle === 'glass') ? 1.5 : 1,
        shadowOpacity: cardStyle === 'glass' ? 0.12 : 0.25,
      },
    };

    saveCustomTheme(builtTheme);
    setTheme(builtTheme.id);
    Alert.alert('Theme Applied!', `"${builtTheme.name}" has been saved and applied to your app.`);
    onClose();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Theme',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCustomTheme(themeId);
            setTheme('custom');
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.colors.border,
          }}
        >
          <TouchableOpacity onPress={onClose} style={{ padding: 6 }}>
            <Icon name="x" size={20} color={currentTheme.colors.text} />
          </TouchableOpacity>

          <View style={{ alignItems: 'center' }}>
            <Typography variant="h3" style={{ fontWeight: '800' }}>
              Theme Studio
            </Typography>
            <Typography variant="caption" color={currentTheme.colors.textSecondary}>
              Create Your Atmosphere
            </Typography>
          </View>

          <Button
            title="Save & Apply"
            variant="primary"
            onPress={handleSave}
            style={{ paddingHorizontal: 14, paddingVertical: 6 }}
          />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
          {/* LIVE PREVIEW CARD */}
          <Typography variant="caption" color={currentTheme.colors.textSecondary} style={{ fontWeight: '700', marginBottom: 6 }}>
            LIVE PREVIEW
          </Typography>

          <View
            style={{
              padding: 16,
              borderRadius: cardRadius + 4,
              backgroundColor: background,
              borderWidth: 1,
              borderColor: borderColor,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                backgroundColor: surface,
                borderRadius: cardRadius,
                padding: 16,
                borderWidth: cardStyle === 'oled' ? 1.5 : 1,
                borderColor: borderColor,
                shadowColor: primary,
                shadowOpacity: 0.3,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              {/* Header row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                  <Icon name="sun" size={18} color={primary} />
                  <Typography variant="bodyMedium" style={{ fontWeight: '700', color: textColor, marginLeft: 6 }}>
                    New Delhi
                  </Typography>
                </View>
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: badgeStyle === 'pill' ? 999 : badgeStyle === 'square' ? 3 : 8,
                    backgroundColor: badgeStyle === 'outline' ? 'transparent' : primary,
                    borderWidth: badgeStyle === 'outline' ? 1 : 0,
                    borderColor: primary,
                  }}
                >
                  <Typography
                    variant="caption"
                    style={{
                      color: badgeStyle === 'outline' ? primary : '#FFFFFF',
                      fontSize: 10,
                      fontWeight: '800',
                    }}
                  >
                    LIVE PREVIEW
                  </Typography>
                </View>
              </View>

              {/* Temp row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                <View>
                  <Typography variant="h1" style={{ fontSize: 38, fontWeight: '800', color: textColor, lineHeight: 42 }}>
                    28{'°'}C
                  </Typography>
                  <Typography variant="caption" style={{ color: textSecondary, marginTop: 2, fontWeight: '600' }}>
                    Partly Cloudy • Humid
                  </Typography>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Typography variant="caption" style={{ color: textSecondary, fontWeight: '600' }}>
                    H: 32{'°'} / L: 24{'°'}
                  </Typography>
                  <Typography variant="caption" style={{ color: accent, marginTop: 2, fontWeight: '700' }}>
                    AQI 84 (Moderate)
                  </Typography>
                </View>
              </View>

              {/* Divider */}
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: borderColor,
                  borderStyle: dividerStyle === 'dashed' ? 'dashed' : 'solid',
                  paddingTop: 8,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="caption" style={{ color: textSecondary }}>
                  Humidity: 65%
                </Typography>
                <Typography variant="caption" style={{ color: textSecondary }}>
                  Wind: 12 km/h NW
                </Typography>
              </View>
            </View>
          </View>

          {/* THEME IDENTITY */}
          <Typography variant="caption" color={currentTheme.colors.textSecondary} style={{ fontWeight: '700', marginBottom: 8 }}>
            THEME IDENTITY
          </Typography>
          <View style={{ marginBottom: 16 }}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Theme Name"
              placeholderTextColor={currentTheme.colors.textSecondary}
              style={{
                backgroundColor: currentTheme.colors.surface,
                color: currentTheme.colors.text,
                padding: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: currentTheme.colors.border,
                fontSize: 15,
                fontWeight: '600',
                marginBottom: 8,
              }}
            />
            <TextInput
              value={tagline}
              onChangeText={setTagline}
              placeholder="Theme Tagline (e.g. Glowing neon and stormy hues)"
              placeholderTextColor={currentTheme.colors.textSecondary}
              style={{
                backgroundColor: currentTheme.colors.surface,
                color: currentTheme.colors.text,
                padding: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: currentTheme.colors.border,
                fontSize: 13,
              }}
            />
          </View>

          {/* PALETTE PRESETS */}
          <Typography variant="caption" color={currentTheme.colors.textSecondary} style={{ fontWeight: '700', marginBottom: 8 }}>
            COLOR PALETTE PRESETS (TAP TO APPLY)
          </Typography>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {PALETTE_PRESETS.map((p) => {
              const isCurrent = background === p.bg && primary === p.primary;
              return (
                <TouchableOpacity
                  key={p.name}
                  activeOpacity={0.8}
                  onPress={() => applyPalette(p)}
                  style={{
                    marginRight: 10,
                    padding: 10,
                    borderRadius: 12,
                    backgroundColor: p.bg,
                    borderWidth: isCurrent ? 2 : 1,
                    borderColor: isCurrent ? p.primary : p.border,
                    width: 120,
                  }}
                >
                  <View style={{ flexDirection: 'row', gap: 4, marginBottom: 8 }}>
                    <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: p.primary }} />
                    <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: p.accent }} />
                    <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: p.surface }} />
                  </View>
                  <Typography variant="caption" style={{ color: p.text, fontWeight: '700', fontSize: 11 }} numberOfLines={1}>
                    {p.name}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* CARD STYLE SELECTOR */}
          <Typography variant="caption" color={currentTheme.colors.textSecondary} style={{ fontWeight: '700', marginBottom: 8 }}>
            CARD ART DIRECTION STYLE
          </Typography>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            {(['glass', 'standard', 'pebble', 'oled'] as const).map((cs) => (
              <TouchableOpacity
                key={cs}
                onPress={() => setCardStyle(cs)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: cardStyle === cs ? currentTheme.colors.primary : currentTheme.colors.surface,
                  borderWidth: 1,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <Typography
                  variant="caption"
                  style={{
                    color: cardStyle === cs ? '#FFFFFF' : currentTheme.colors.text,
                    fontWeight: '700',
                    textTransform: 'capitalize',
                  }}
                >
                  {cs}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>

          {/* CARD CORNER RADIUS */}
          <Typography variant="caption" color={currentTheme.colors.textSecondary} style={{ fontWeight: '700', marginBottom: 8 }}>
            CARD CORNER RADIUS
          </Typography>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Square (4px)', val: 4 },
              { label: 'Smooth (16px)', val: 16 },
              { label: 'Pebble (26px)', val: 26 },
            ].map((r) => (
              <TouchableOpacity
                key={r.label}
                onPress={() => setCardRadius(r.val)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: 'center',
                  backgroundColor: cardRadius === r.val ? currentTheme.colors.primary : currentTheme.colors.surface,
                  borderWidth: 1,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <Typography
                  variant="caption"
                  style={{
                    color: cardRadius === r.val ? '#FFFFFF' : currentTheme.colors.text,
                    fontWeight: '700',
                  }}
                >
                  {r.label}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>

          {/* BADGE STYLE */}
          <Typography variant="caption" color={currentTheme.colors.textSecondary} style={{ fontWeight: '700', marginBottom: 8 }}>
            BADGE STYLE
          </Typography>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            {(['neon', 'pill', 'square', 'outline'] as const).map((b) => (
              <TouchableOpacity
                key={b}
                onPress={() => setBadgeStyle(b)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: badgeStyle === b ? currentTheme.colors.primary : currentTheme.colors.surface,
                  borderWidth: 1,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <Typography
                  variant="caption"
                  style={{
                    color: badgeStyle === b ? '#FFFFFF' : currentTheme.colors.text,
                    fontWeight: '700',
                    textTransform: 'capitalize',
                  }}
                >
                  {b}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>

          {/* DIVIDER & ICON STYLE */}
          <Typography variant="caption" color={currentTheme.colors.textSecondary} style={{ fontWeight: '700', marginBottom: 8 }}>
            DIVIDER STYLE
          </Typography>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            {(['hairline', 'solid', 'dashed'] as const).map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setDividerStyle(d)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: dividerStyle === d ? currentTheme.colors.primary : currentTheme.colors.surface,
                  borderWidth: 1,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <Typography
                  variant="caption"
                  style={{
                    color: dividerStyle === d ? '#FFFFFF' : currentTheme.colors.text,
                    fontWeight: '700',
                    textTransform: 'capitalize',
                  }}
                >
                  {d}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>

          {/* ICON STYLE */}
          <Typography variant="caption" color={currentTheme.colors.textSecondary} style={{ fontWeight: '700', marginBottom: 8 }}>
            ICON STYLE
          </Typography>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            {(['neon', 'line', 'bold'] as const).map((ic) => (
              <TouchableOpacity
                key={ic}
                onPress={() => setIconStyle(ic)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: iconStyle === ic ? currentTheme.colors.primary : currentTheme.colors.surface,
                  borderWidth: 1,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <Typography
                  variant="caption"
                  style={{
                    color: iconStyle === ic ? '#FFFFFF' : currentTheme.colors.text,
                    fontWeight: '700',
                    textTransform: 'capitalize',
                  }}
                >
                  {ic}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>

          {/* WALLPAPER & ATMOSPHERE */}
          <Typography variant="caption" color={currentTheme.colors.textSecondary} style={{ fontWeight: '700', marginBottom: 8 }}>
            WALLPAPER STYLE
          </Typography>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
            {[
              { label: 'Atmospheric Gradient', val: 'gradient' as const },
              { label: 'Solid Minimalist', val: 'solid' as const },
            ].map((w) => (
              <TouchableOpacity
                key={w.label}
                onPress={() => setWallpaperType(w.val)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: 'center',
                  backgroundColor: wallpaperType === w.val ? currentTheme.colors.primary : currentTheme.colors.surface,
                  borderWidth: 1,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <Typography
                  variant="caption"
                  style={{
                    color: wallpaperType === w.val ? '#FFFFFF' : currentTheme.colors.text,
                    fontWeight: '700',
                  }}
                >
                  {w.label}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>

          {/* DELETE BUTTON (IF CUSTOM THEME) */}
          {initialTheme?.isCustom && (
            <TouchableOpacity
              onPress={handleDelete}
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: '#FEE2E2',
                borderColor: '#EF4444',
                borderWidth: 1,
                alignItems: 'center',
                marginBottom: 30,
              }}
            >
              <Typography variant="caption" style={{ color: '#DC2626', fontWeight: '800' }}>
                Delete This Theme
              </Typography>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
