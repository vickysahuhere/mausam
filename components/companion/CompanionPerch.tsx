import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { MausamCatSvg } from './MausamCatSvg';
import { useCompanionStore } from '../../store/useCompanionStore';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../ui/Typography';
import { companionEvents } from '../../lib/companion/companionEvents';

interface CompanionPerchProps {
  compact?: boolean;
}

export function CompanionPerch({ compact = false }: CompanionPerchProps) {
  const theme = useTheme();
  const {
    isEnabled,
    name,
    currentState,
    tapCat,
    petCat,
    feedCat,
    dismissSpeech,
    tickIdle,
    affinityLevel,
    incrementInactivity,
  } = useCompanionStore();

  const [showMiniMenu, setShowMiniMenu] = useState(false);
  const [speechAnim] = useState(() => new Animated.Value(0));
  const [heartAnim] = useState(() => new Animated.Value(0));
  const [heartOpacity] = useState(() => new Animated.Value(0));

  // Initialize store and subscribe to idle and inactivity tickers
  useEffect(() => {
    useCompanionStore.getState().initialize();

    const idleInterval = setInterval(() => {
      tickIdle();
    }, 14000);

    const inactivityInterval = setInterval(() => {
      incrementInactivity();
    }, 1000);

    return () => {
      clearInterval(idleInterval);
      clearInterval(inactivityInterval);
    };
  }, [tickIdle, incrementInactivity]);

  // Speech bubble animation
  useEffect(() => {
    if (currentState.speechText) {
      speechAnim.setValue(0);
      Animated.spring(speechAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        dismissSpeech();
      }, 2600);
      return () => clearTimeout(timer);
    } else {
      speechAnim.setValue(0);
    }
  }, [currentState.speechText, currentState.speechKey, speechAnim, dismissSpeech]);

  // Listen to petting for heart float
  useEffect(() => {
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
  }, [heartAnim, heartOpacity]);

  if (!isEnabled) {
    return null;
  }

  const handleCatPress = () => {
    tapCat();
  };

  const toggleMiniMenu = () => {
    setShowMiniMenu(!showMiniMenu);
  };

  return (
    <View style={styles.wrapper}>
      {/* SPEECH BUBBLE */}
      {currentState.speechText && (
        <Animated.View
          style={[
            styles.speechBubble,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              opacity: speechAnim,
              transform: [
                {
                  scale: speechAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.75, 1],
                  }),
                },
                {
                  translateY: speechAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [6, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Typography
            variant="caption"
            color={theme.colors.text}
            style={{ fontWeight: '700', fontSize: 11, textAlign: 'center' }}
          >
            {currentState.speechText}
          </Typography>
          {/* Bubble tail */}
          <View
            style={[
              styles.speechTail,
              { borderTopColor: theme.colors.surface },
            ]}
          />
        </Animated.View>
      )}

      {/* FLOATING HEART PURR */}
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

      {/* SLEEPING ZZZ PARTICLES */}
      {currentState.expression === 'sleeping' && (
        <View style={styles.zzzContainer} pointerEvents="none">
          <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '800', fontSize: 12 }}>
            z
          </Typography>
          <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '800', fontSize: 15, marginLeft: 2, marginTop: -4 }}>
            Z
          </Typography>
          <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '800', fontSize: 18, marginLeft: 3, marginTop: -8 }}>
            Z
          </Typography>
        </View>
      )}

      {/* MAIN CAT TOUCHABLE AREA */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleCatPress}
        onLongPress={toggleMiniMenu}
        accessibilityRole="button"
        accessibilityLabel={`${name}, your weather companion. Double tap or tap to interact.`}
        style={styles.catContainer}
      >
        {/* Ambient Perch Pedestal Grounding Shadow */}
        <View
          style={{
            position: 'absolute',
            bottom: -2,
            width: compact ? 64 : 80,
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.artDirection?.cardStyle === 'flat2d' ? '#264653' : (theme.isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.07)'),
            opacity: theme.artDirection?.cardStyle === 'flat2d' ? 0.2 : 0.75,
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
        />
      </TouchableOpacity>

      {/* MINI INTERACTION BUTTONS (Pet, Treat, Affinity) */}
      <View style={styles.quickBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => petCat()}
          style={[
            styles.chipButton,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              borderColor: theme.artDirection?.cardStyle === 'flat2d' ? '#264653' : theme.colors.border,
              borderWidth: theme.artDirection?.cardStyle === 'flat2d' ? 1.5 : 1,
              borderRadius: theme.artDirection?.cardStyle === 'flat2d' ? 4 : 12,
            },
          ]}
          accessibilityLabel={`Pet ${name}`}
        >
          <Typography variant="caption" style={{ fontSize: 11, fontWeight: '700' }}>🐾 Pet</Typography>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => feedCat()}
          style={[
            styles.chipButton,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              borderColor: theme.artDirection?.cardStyle === 'flat2d' ? '#264653' : theme.colors.border,
              borderWidth: theme.artDirection?.cardStyle === 'flat2d' ? 1.5 : 1,
              borderRadius: theme.artDirection?.cardStyle === 'flat2d' ? 4 : 12,
            },
          ]}
          accessibilityLabel={`Give treat to ${name}`}
        >
          <Typography variant="caption" style={{ fontSize: 11, fontWeight: '700' }}>🐟 Treat</Typography>
        </TouchableOpacity>

        <View
          style={[
            styles.affinityChip,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              borderWidth: theme.artDirection?.cardStyle === 'flat2d' ? 1.5 : 0,
              borderColor: '#264653',
              borderRadius: theme.artDirection?.cardStyle === 'flat2d' ? 4 : 10,
            },
          ]}
        >
          <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 10, fontWeight: '700' }}>
            Lv.{Math.floor(affinityLevel / 10)}
          </Typography>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 4,
  },
  catContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechBubble: {
    position: 'absolute',
    top: -34,
    zIndex: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 0,
    maxWidth: 220,
  },
  speechTail: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  floatingHeart: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 30,
  },
  zzzContainer: {
    position: 'absolute',
    top: 6,
    right: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    zIndex: 15,
  },
  quickBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -4,
  },
  chipButton: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  affinityChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
});
