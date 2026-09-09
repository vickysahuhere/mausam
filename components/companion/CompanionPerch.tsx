import React, { useEffect, useRef, useMemo } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, AppState } from 'react-native';
import { MausamCatSvg } from './MausamCatSvg';
import { CatSoundBridge } from './CatSoundBridge';
import { useCompanionStore } from '../../store/useCompanionStore';
import { useAnimationStore } from '../../store/useAnimationStore';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../ui/Typography';
import { companionEvents } from '../../lib/companion/companionEvents';
import { getCatThemeStyle } from '../../lib/cat/catThemeAdapter';

interface CompanionPerchProps {
  compact?: boolean;
}

export const CompanionPerch = React.memo(function CompanionPerch({ compact = false }: CompanionPerchProps) {
  const theme = useTheme();

  // High-performance selective subscriptions (only re-render when relevant state slice changes)
  const isEnabled = useCompanionStore((s) => s.isEnabled);
  const name = useCompanionStore((s) => s.name);
  const currentState = useCompanionStore((s) => s.currentState);
  const affinityLevel = useCompanionStore((s) => s.affinityLevel);
  const tapCat = useCompanionStore((s) => s.tapCat);
  const longPressCat = useCompanionStore((s) => s.longPressCat);
  const petCat = useCompanionStore((s) => s.petCat);
  const feedCat = useCompanionStore((s) => s.feedCat);
  const dismissSpeech = useCompanionStore((s) => s.dismissSpeech);

  const animationsEnabled = useAnimationStore((state) => state.animationsEnabled);
  const themeStyle = useMemo(() => getCatThemeStyle(theme, Boolean(theme.isDark)), [theme]);

  const speechAnim = useRef(new Animated.Value(0)).current;
  const heartAnim = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;

  // Initialize store and subscribe to idle & inactivity timers with AppState awareness
  useEffect(() => {
    useCompanionStore.getState().initialize();

    if (!animationsEnabled) {
      return;
    }

    let idleInterval: ReturnType<typeof setInterval> | null = null;
    let inactivityInterval: ReturnType<typeof setInterval> | null = null;

    const startTimers = () => {
      if (idleInterval) clearInterval(idleInterval);
      if (inactivityInterval) clearInterval(inactivityInterval);

      idleInterval = setInterval(() => {
        useCompanionStore.getState().tickIdle();
      }, 14000);

      // 3-second interval (reduced from 1s) to eliminate unnecessary CPU wakeups
      inactivityInterval = setInterval(() => {
        useCompanionStore.getState().incrementInactivity(3);
      }, 3000);
    };

    const stopTimers = () => {
      if (idleInterval) clearInterval(idleInterval);
      if (inactivityInterval) clearInterval(inactivityInterval);
      idleInterval = null;
      inactivityInterval = null;
    };

    if (AppState.currentState === 'active') {
      startTimers();
    }

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        startTimers();
      } else {
        stopTimers();
      }
    });

    return () => {
      stopTimers();
      sub.remove();
    };
  }, [animationsEnabled]);

  // Speech bubble animation with graceful spring
  useEffect(() => {
    if (currentState.speechText) {
      if (!animationsEnabled) {
        speechAnim.setValue(1);
      } else {
        speechAnim.setValue(0);
        Animated.spring(speechAnim, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }).start();
      }

      const timer = setTimeout(() => {
        dismissSpeech();
      }, 3200);
      return () => clearTimeout(timer);
    } else {
      speechAnim.setValue(0);
    }
  }, [currentState.speechText, currentState.speechKey, speechAnim, dismissSpeech, animationsEnabled]);

  // Listen to petting for floating heart purr
  useEffect(() => {
    if (!animationsEnabled) return;
    const unsub = companionEvents.on('user_pet_cat', () => {
      heartAnim.setValue(0);
      heartOpacity.setValue(1);

      Animated.parallel([
        Animated.timing(heartAnim, {
          toValue: -28,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]).start();
    });

    return unsub;
  }, [heartAnim, heartOpacity, animationsEnabled]);

  if (!isEnabled) {
    return null;
  }

  const handleCatPress = () => {
    tapCat();
  };

  const handleCatLongPress = () => {
    longPressCat();
  };

  return (
    <View style={styles.wrapper}>
      {/* PROCEDURAL SYNTHESIZER AUDIO BRIDGE */}
      <CatSoundBridge />

      {/* 1. DEDICATED IN-FLOW SPEECH & MOOD STAGE (ZERO COLLISION WITH WEATHER CHIPS) */}
      <View style={styles.stageHeader}>
        {currentState.speechText ? (() => {
          const bubbleBg = themeStyle.shadowStyle === 'comic_offset'
            ? '#FFFBF2'
            : (theme.isDark ? '#1E293B' : '#FFFFFF');
          const bubbleBorder = themeStyle.shadowStyle === 'comic_offset'
            ? '#264653'
            : (theme.isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)');
          const isBongoCombo = currentState.speechText.toLowerCase().includes('bongo') || currentState.speechText.toLowerCase().includes('rhythm');

          return (
            <Animated.View
              style={[
                styles.speechBubble,
                {
                  backgroundColor: bubbleBg,
                  borderColor: bubbleBorder,
                  borderWidth: themeStyle.shadowStyle === 'comic_offset' ? 1.5 : 1,
                  opacity: speechAnim,
                  transform: [
                    {
                      scale: speechAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.88, 1],
                      }),
                    },
                    {
                      translateY: speechAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [4, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.speechContent}>
                {isBongoCombo ? (
                  <Typography variant="caption" style={{ fontSize: 13, marginRight: 2 }}>🥁</Typography>
                ) : (
                  <View
                    style={[
                      styles.speechDot,
                      { backgroundColor: themeStyle.accessoryTintColor ?? theme.colors.primary },
                    ]}
                  />
                )}
                <Typography
                  variant="caption"
                  color={themeStyle.shadowStyle === 'comic_offset' ? '#264653' : theme.colors.text}
                  style={{ fontWeight: '700', fontSize: 11.5, textAlign: 'center', lineHeight: 16 }}
                >
                  {currentState.speechText}
                </Typography>
              </View>
              {/* Downward Speech Bubble Tail pointing directly at Mimi */}
              <View
                style={[
                  styles.bubblePointer,
                  {
                    backgroundColor: bubbleBg,
                    borderColor: bubbleBorder,
                    borderRightWidth: themeStyle.shadowStyle === 'comic_offset' ? 1.5 : 1,
                    borderBottomWidth: themeStyle.shadowStyle === 'comic_offset' ? 1.5 : 1,
                  },
                ]}
              />
            </Animated.View>
          );
        })() : (
          /* Soft Ambient Mood Pill when silent */
          <View
            style={[
              styles.ambientMoodChip,
              {
                backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                borderColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              },
            ]}
          >
            <Typography
              variant="caption"
              color={theme.colors.textSecondary}
              style={{ fontSize: 10.5, fontWeight: '600' }}
            >
              {currentState.pose === 'bongo_tap'
                ? '🥁 Bongo Cat Groove'
                : currentState.expression === 'sleeping'
                ? '💤 Taking a cozy catnap'
                : currentState.pose === 'sit'
                ? '🐾 Sitting attentively'
                : currentState.pose === 'wave'
                ? '👋 Mimi waves hello!'
                : currentState.accessory === 'umbrella'
                ? '☔ Watching the rain'
                : currentState.accessory === 'sunglasses'
                ? '🕶️ Cool in the shade'
                : '🐾 Tap Mimi to chat'}
            </Typography>
          </View>
        )}
      </View>

      {/* FLOATING HEART PURR */}
      {animationsEnabled && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.floatingHeart,
            {
              opacity: heartOpacity,
              transform: [{ translateY: heartAnim }],
            },
          ]}
        >
          <Typography variant="body" style={{ fontSize: 18 }}>❤️</Typography>
        </Animated.View>
      )}

      {/* SLEEPING ZZZ PARTICLES */}
      {currentState.expression === 'sleeping' && (
        <View style={styles.zzzContainer} pointerEvents="none">
          <Typography variant="caption" color={themeStyle.accessoryTintColor ?? theme.colors.primary} style={{ fontWeight: '800', fontSize: 12 }}>
            z
          </Typography>
          <Typography variant="caption" color={themeStyle.accessoryTintColor ?? theme.colors.primary} style={{ fontWeight: '800', fontSize: 15, marginLeft: 2, marginTop: -4 }}>
            Z
          </Typography>
          <Typography variant="caption" color={themeStyle.accessoryTintColor ?? theme.colors.primary} style={{ fontWeight: '800', fontSize: 18, marginLeft: 3, marginTop: -8 }}>
            Z
          </Typography>
        </View>
      )}

      {/* 2. MAIN CAT MASCOT STAGE */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handleCatPress}
        onLongPress={handleCatLongPress}
        accessibilityRole="button"
        accessibilityLabel={`${name}, Mausam weather companion`}
        accessibilityHint="Tap for weather reaction. Long press for cuddle."
        style={styles.catContainer}
      >
        {/* Grounded Habitat Perch Pedestal & Contact Shadow */}
        <View
          style={{
            position: 'absolute',
            bottom: 2,
            width: compact ? 82 : 104,
            height: 8,
            borderRadius: 4,
            backgroundColor: themeStyle.shadowStyle === 'comic_offset'
              ? '#F2E8CF'
              : (theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.035)'),
            borderWidth: 1,
            borderColor: themeStyle.shadowStyle === 'comic_offset'
              ? '#264653'
              : (theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'),
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: -1,
            width: compact ? 70 : 88,
            height: 6,
            borderRadius: 3,
            backgroundColor: themeStyle.shadowStyle === 'comic_offset' ? '#264653' : (theme.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)'),
            opacity: themeStyle.shadowStyle === 'comic_offset' ? 0.22 : 0.7,
            transform: [{ scaleY: 0.5 }],
          }}
        />

        <MausamCatSvg
          expression={currentState.expression}
          pose={currentState.pose}
          accessory={currentState.accessory}
          gazeTarget={currentState.gazeTarget}
          size={compact ? 84 : 104}
          isDark={theme.isDark}
          themeStyle={themeStyle}
          animationsEnabled={animationsEnabled}
        />
      </TouchableOpacity>

      {/* 3. HABITAT DOCK & INTERACTION DECK */}
      <View style={styles.quickBar}>
        {/* Pet Button */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => petCat()}
          style={[
            styles.chipButton,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              borderColor: themeStyle.shadowStyle === 'comic_offset' ? '#264653' : theme.colors.border,
              borderWidth: themeStyle.shadowStyle === 'comic_offset' ? 1.5 : 1,
              borderRadius: themeStyle.shadowStyle === 'comic_offset' ? 6 : 14,
            },
          ]}
          accessibilityLabel={`Pet ${name}`}
        >
          <Typography variant="caption" style={{ fontSize: 11, fontWeight: '700' }}>🐾 Pet</Typography>
        </TouchableOpacity>

        {/* Treat Button */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => feedCat()}
          style={[
            styles.chipButton,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              borderColor: themeStyle.shadowStyle === 'comic_offset' ? '#264653' : theme.colors.border,
              borderWidth: themeStyle.shadowStyle === 'comic_offset' ? 1.5 : 1,
              borderRadius: themeStyle.shadowStyle === 'comic_offset' ? 6 : 14,
            },
          ]}
          accessibilityLabel={`Give treat to ${name}`}
        >
          <Typography variant="caption" style={{ fontSize: 11, fontWeight: '700' }}>🐟 Treat</Typography>
        </TouchableOpacity>

        {/* Affinity Deck with XP Progress Bar */}
        <View
          style={[
            styles.affinityDeck,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              borderWidth: themeStyle.shadowStyle === 'comic_offset' ? 1.5 : 1,
              borderColor: themeStyle.shadowStyle === 'comic_offset' ? '#264653' : theme.colors.border,
              borderRadius: themeStyle.shadowStyle === 'comic_offset' ? 6 : 14,
            },
          ]}
        >
          <Typography variant="caption" color={theme.colors.text} style={{ fontSize: 11, fontWeight: '800' }}>
            ❤️ Lv.{Math.floor(affinityLevel / 10)}
          </Typography>
          {/* Mini XP Progress Bar */}
          <View
            style={[
              styles.affinityTrack,
              { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' },
            ]}
          >
            <View
              style={[
                styles.affinityFill,
                { width: `${Math.max(15, (affinityLevel % 10) * 10)}%` },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 2,
  },
  stageHeader: {
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    zIndex: 25,
  },
  speechBubble: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 0,
    maxWidth: 270,
    position: 'relative',
    overflow: 'visible',
  },
  speechContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speechDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bubblePointer: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    width: 8,
    height: 8,
    transform: [{ rotate: '45deg' }],
  },
  ambientMoodChip: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  catContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingHeart: {
    position: 'absolute',
    top: 36,
    right: 32,
    zIndex: 30,
  },
  zzzContainer: {
    position: 'absolute',
    top: 32,
    right: 28,
    flexDirection: 'row',
    alignItems: 'flex-start',
    zIndex: 15,
  },
  quickBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  chipButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  affinityDeck: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  affinityTrack: {
    width: 32,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  affinityFill: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 2,
  },
});
