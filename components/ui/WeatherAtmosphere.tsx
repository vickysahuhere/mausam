import React, { useEffect, useState } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, Polygon, G } from 'react-native-svg';
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
        {/* Apple Liquid & Glass Themes: Fluid Celestial Sky & Specular Radiance */}
        {(theme.artDirection?.cardStyle === 'glass' || theme.id === 'apple-liquid') ? (
          <View style={StyleSheet.absoluteFill}>
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="appleSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor={theme.isDark ? '#0B192C' : '#7DD3FC'} stopOpacity="0.55" />
                  <Stop offset="35%" stopColor={theme.isDark ? '#1E3E62' : '#BAE6FD'} stopOpacity="0.38" />
                  <Stop offset="75%" stopColor={theme.isDark ? '#0F172A' : '#E0F2FE'} stopOpacity="0.25" />
                  <Stop offset="100%" stopColor={theme.isDark ? '#020617' : '#F0F9FF'} stopOpacity="0.12" />
                </LinearGradient>
                <RadialGradient id="sunAtmosphereGlow" cx="80%" cy="15%" r="60%" fx="80%" fy="15%">
                  <Stop offset="0%" stopColor={theme.isDark ? '#38BDF8' : '#38BDF8'} stopOpacity="0.35" />
                  <Stop offset="50%" stopColor={theme.isDark ? '#818CF8' : '#818CF8'} stopOpacity="0.15" />
                  <Stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#appleSkyGrad)" />
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#sunAtmosphereGlow)" />
            </Svg>

            {/* Apple Weather Style Dynamic Drifting Atmospheric Cloud Layers */}
            <Animated.View
              style={{
                position: 'absolute',
                top: 50,
                left: -60,
                width: width * 0.9,
                height: 120,
                borderRadius: 60,
                backgroundColor: 'rgba(255, 255, 255, 0.22)',
                transform: [{ translateX: animationsEnabled ? cloud1 : 0 }],
              }}
            />
            <Animated.View
              style={{
                position: 'absolute',
                top: 220,
                right: -70,
                width: width * 0.8,
                height: 100,
                borderRadius: 50,
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                transform: [{ translateX: animationsEnabled ? cloud2 : 0 }],
              }}
            />
          </View>
        ) : (theme.artDirection?.cardStyle === 'flat2d' || theme.id === 'retro-peaceful') ? (
          /* Retro 2D Peaceful: Comic Sunburst & Bold Contoured 2D Cloud Vectors */
          <View style={StyleSheet.absoluteFill}>
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              <Defs>
                <RadialGradient id="retroSunGlow" cx="85%" cy="12%" r="45%" fx="85%" fy="12%">
                  <Stop offset="0%" stopColor="#E9C46A" stopOpacity="0.45" />
                  <Stop offset="60%" stopColor="#E76F51" stopOpacity="0.15" />
                  <Stop offset="100%" stopColor="#FAF3E0" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#retroSunGlow)" />

              {/* Retro 2D Comic Halftone Sunburst Rays */}
              <G opacity="0.15">
                <Polygon points={`${width * 0.85},${height * 0.12} ${width},0 ${width * 0.7},0`} fill="#E76F51" />
                <Polygon points={`${width * 0.85},${height * 0.12} ${width},${height * 0.05} ${width},${height * 0.18}`} fill="#E9C46A" />
                <Polygon points={`${width * 0.85},${height * 0.12} ${width * 0.6},0 ${width * 0.45},0`} fill="#E76F51" />
                <Polygon points={`${width * 0.85},${height * 0.12} ${width * 0.9},${height * 0.25} ${width * 0.75},${height * 0.28}`} fill="#E9C46A" />
              </G>
            </Svg>

            {/* Retro 2D Comic Clouds with Comic Border and Hard Offset Shadow */}
            <Animated.View
              style={{
                position: 'absolute',
                top: 45,
                left: -40,
                width: width * 0.75,
                height: 75,
                borderRadius: 20,
                backgroundColor: '#FFFBF2',
                borderWidth: 2,
                borderColor: '#264653',
                shadowColor: '#264653',
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 0,
                transform: [{ translateX: animationsEnabled ? cloud1 : 0 }],
              }}
            />
            <Animated.View
              style={{
                position: 'absolute',
                top: 150,
                right: -50,
                width: width * 0.65,
                height: 65,
                borderRadius: 18,
                backgroundColor: '#FFFBF2',
                borderWidth: 2,
                borderColor: '#264653',
                shadowColor: '#264653',
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 0,
                transform: [{ translateX: animationsEnabled ? cloud2 : 0 }],
              }}
            />
          </View>
        ) : (theme.id === 'beach') ? (
          /* Beach Theme: Tropical Horizon Gradient & Sun Ray */
          <View style={StyleSheet.absoluteFill}>
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="beachSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#0284C7" stopOpacity="0.25" />
                  <Stop offset="50%" stopColor="#38BDF8" stopOpacity="0.18" />
                  <Stop offset="85%" stopColor="#FDE68A" stopOpacity="0.22" />
                  <Stop offset="100%" stopColor="#FEF3C7" stopOpacity="0.15" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#beachSkyGrad)" />
            </Svg>

            <Animated.View
              style={{
                position: 'absolute',
                top: 30,
                right: -20,
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: '#F59E0B',
                opacity: 0.12,
                transform: [{ scale: animationsEnabled ? sunPulse : 1 }],
              }}
            />
          </View>
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
