import React, { useEffect, useState } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { useAnimationStore } from '../../store/useAnimationStore';
import { useTheme } from '../../theme/ThemeProvider';

const { width, height } = Dimensions.get('window');

interface Props {
  weatherType?: 'clear' | 'clouds' | 'rain' | 'storm' | 'snow';
  children?: React.ReactNode;
}

export function WeatherAtmosphere({ weatherType = 'clear', children }: Props) {
  const theme = useTheme();
  const animationsEnabled = useAnimationStore((state) => state.animationsEnabled);

  // Animation values initialized safely for React 19
  const [cloud1] = useState(() => new Animated.Value(0));
  const [cloud2] = useState(() => new Animated.Value(0));
  const [sunPulse] = useState(() => new Animated.Value(1));
  const [rainStreak] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!animationsEnabled) {
      // Freeze all animations
      cloud1.stopAnimation();
      cloud2.stopAnimation();
      sunPulse.stopAnimation();
      rainStreak.stopAnimation();
      return;
    }

    // Cloud drift loops
    const cloudLoop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(cloud1, {
          toValue: width * 0.4,
          duration: 12000,
          useNativeDriver: true,
        }),
        Animated.timing(cloud1, {
          toValue: -width * 0.2,
          duration: 12000,
          useNativeDriver: true,
        }),
      ])
    );

    const cloudLoop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(cloud2, {
          toValue: -width * 0.3,
          duration: 16000,
          useNativeDriver: true,
        }),
        Animated.timing(cloud2, {
          toValue: width * 0.3,
          duration: 16000,
          useNativeDriver: true,
        }),
      ])
    );

    // Sun breathing pulse
    const sunLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sunPulse, {
          toValue: 1.15,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(sunPulse, {
          toValue: 1,
          duration: 3500,
          useNativeDriver: true,
        }),
      ])
    );

    // Rain drop streaks
    const rainLoop = Animated.loop(
      Animated.timing(rainStreak, {
        toValue: height * 0.6,
        duration: 900,
        useNativeDriver: true,
      })
    );

    cloudLoop1.start();
    cloudLoop2.start();
    sunLoop.start();
    rainLoop.start();

    return () => {
      cloudLoop1.stop();
      cloudLoop2.stop();
      sunLoop.stop();
      rainLoop.stop();
    };
  }, [animationsEnabled, cloud1, cloud2, sunPulse, rainStreak]);

  return (
    <View
      style={children ? styles.container : StyleSheet.absoluteFill}
      pointerEvents={children ? 'auto' : 'none'}
    >
      {/* Atmosphere Background Elements */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Glassmorphism Radiant Mesh Glow Orbs (Figma Glassmorphism Design) */}
        {(theme.artDirection?.cardStyle === 'glass' || theme.id === 'apple-liquid') ? (
          <>
            {/* Top-Right Radiant Cyan/Sky Orb */}
            <Animated.View
              style={[
                styles.glassOrb,
                {
                  top: -40,
                  right: -50,
                  width: 300,
                  height: 300,
                  borderRadius: 150,
                  backgroundColor: '#38BDF8',
                  opacity: 0.38,
                  transform: [{ scale: animationsEnabled ? sunPulse : 1 }],
                },
              ]}
            />

            {/* Mid-Left Electric Indigo/Violet Orb */}
            <Animated.View
              style={[
                styles.glassOrb,
                {
                  top: 220,
                  left: -80,
                  width: 320,
                  height: 320,
                  borderRadius: 160,
                  backgroundColor: '#818CF8',
                  opacity: 0.32,
                  transform: [{ translateX: animationsEnabled ? cloud1 : 0 }],
                },
              ]}
            />

            {/* Lower-Right Sunset Rose/Amber Orb */}
            <Animated.View
              style={[
                styles.glassOrb,
                {
                  top: 500,
                  right: -60,
                  width: 280,
                  height: 280,
                  borderRadius: 140,
                  backgroundColor: '#F472B6',
                  opacity: 0.28,
                  transform: [{ translateX: animationsEnabled ? cloud2 : 0 }],
                },
              ]}
            />
          </>
        ) : (
          <>
            {/* Soft Sun/Glow orb */}
            <Animated.View
              style={[
                styles.sunGlow,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: (theme.isDark ?? theme.colors.background === '#09090B') ? 0.08 : 0.05,
                  transform: [{ scale: animationsEnabled ? sunPulse : 1 }],
                },
              ]}
            />

            {/* Drifting Clouds */}
            <Animated.View
              style={[
                styles.cloudShape,
                {
                  top: 40,
                  left: -50,
                  width: width * 0.8,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: theme.colors.primary,
                  opacity: (theme.isDark ?? theme.colors.background === '#09090B') ? 0.04 : 0.03,
                  transform: [{ translateX: animationsEnabled ? cloud1 : 0 }],
                },
              ]}
            />

            <Animated.View
              style={[
                styles.cloudShape,
                {
                  top: 130,
                  right: -60,
                  width: width * 0.7,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: theme.colors.accent || theme.colors.primary,
                  opacity: 0.035,
                  transform: [{ translateX: animationsEnabled ? cloud2 : 0 }],
                },
              ]}
            />
          </>
        )}

        {/* Rain streaks for rain/storm */}
        {weatherType === 'rain' && animationsEnabled && (
          <Animated.View
            style={[
              styles.rainStreakContainer,
              {
                transform: [{ translateY: rainStreak }],
              },
            ]}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                style={[
                  styles.rainDrop,
                  {
                    left: (width / 6) * i,
                    top: i * 40,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            ))}
          </Animated.View>
        )}
      </View>

      {/* Main Screen Content */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  sunGlow: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  glassOrb: {
    position: 'absolute',
  },
  cloudShape: {
    position: 'absolute',
  },
  rainStreakContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  rainDrop: {
    position: 'absolute',
    width: 1.5,
    height: 16,
    borderRadius: 1,
    opacity: 0.25,
  },
});
