import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Dimensions, AppState, AppStateStatus } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, Polygon, G, Circle, Line } from 'react-native-svg';
import { useAnimationStore } from '../../store/useAnimationStore';
import { useTheme } from '../../theme/ThemeProvider';

const { width, height } = Dimensions.get('window');

interface Props {
  weatherType?: 'clear' | 'clouds' | 'rain' | 'storm' | 'snow';
  children?: React.ReactNode;
}

export const WeatherAtmosphere = React.memo(function WeatherAtmosphere({ weatherType = 'clear', children }: Props) {
  const theme = useTheme();
  const animationsEnabled = useAnimationStore((state) => state.animationsEnabled);

  // Lean animated values initialized via ref (zero re-render allocations)
  const cloud1 = useRef(new Animated.Value(0)).current;
  const cloud2 = useRef(new Animated.Value(0)).current;
  const sunPulse = useRef(new Animated.Value(1)).current;
  const rainStreak = useRef(new Animated.Value(0)).current;
  const starTwinkle = useRef(new Animated.Value(0.3)).current;
  const shootingStarProgress = useRef(new Animated.Value(0)).current;
  const snowDrift = useRef(new Animated.Value(0)).current;

  // AppState awareness for battery and CPU preservation
  const [isAppActive, setIsAppActive] = useState(() => AppState.currentState === 'active');

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      setIsAppActive(state === 'active');
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!animationsEnabled || !isAppActive) {
      // Freeze all animations
      cloud1.stopAnimation();
      cloud2.stopAnimation();
      sunPulse.stopAnimation();
      rainStreak.stopAnimation();
      starTwinkle.stopAnimation();
      shootingStarProgress.stopAnimation();
      snowDrift.stopAnimation();
      return;
    }

    // Cloud drift loops
    const cloudLoop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(cloud1, {
          toValue: width * 0.4,
          duration: 14000,
          useNativeDriver: true,
        }),
        Animated.timing(cloud1, {
          toValue: -width * 0.2,
          duration: 14000,
          useNativeDriver: true,
        }),
      ])
    );

    const cloudLoop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(cloud2, {
          toValue: -width * 0.3,
          duration: 18000,
          useNativeDriver: true,
        }),
        Animated.timing(cloud2, {
          toValue: width * 0.3,
          duration: 18000,
          useNativeDriver: true,
        }),
      ])
    );

    // Sun / Ambient breathing pulse
    const sunLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sunPulse, {
          toValue: 1.18,
          duration: 3800,
          useNativeDriver: true,
        }),
        Animated.timing(sunPulse, {
          toValue: 1,
          duration: 3800,
          useNativeDriver: true,
        }),
      ])
    );

    // Rain drop streaks
    const rainLoop = Animated.loop(
      Animated.timing(rainStreak, {
        toValue: height * 0.65,
        duration: 850,
        useNativeDriver: true,
      })
    );

    // Starfield twinkle breathing
    const starLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(starTwinkle, {
          toValue: 0.95,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(starTwinkle, {
          toValue: 0.25,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    );

    // Shooting star sweep (repeats every 14 seconds)
    const shootingStarLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shootingStarProgress, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.delay(12000),
        Animated.timing(shootingStarProgress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // Snow drift loop
    const snowLoop = Animated.loop(
      Animated.timing(snowDrift, {
        toValue: height * 0.7,
        duration: 4500,
        useNativeDriver: true,
      })
    );

    cloudLoop1.start();
    cloudLoop2.start();
    sunLoop.start();
    rainLoop.start();
    starLoop.start();
    shootingStarLoop.start();
    snowLoop.start();

    return () => {
      cloudLoop1.stop();
      cloudLoop2.stop();
      sunLoop.stop();
      rainLoop.stop();
      starLoop.stop();
      shootingStarLoop.stop();
      snowLoop.stop();
    };
  }, [animationsEnabled, isAppActive, cloud1, cloud2, sunPulse, rainStreak, starTwinkle, shootingStarProgress, snowDrift]);

  // Pre-calculated starfield coordinates
  const stars = [
    { x: width * 0.08, y: 35, r: 1.6, op: 0.8 },
    { x: width * 0.22, y: 75, r: 2.2, op: 0.9 },
    { x: width * 0.38, y: 28, r: 1.4, op: 0.7 },
    { x: width * 0.52, y: 62, r: 2.6, op: 0.95 },
    { x: width * 0.68, y: 40, r: 1.8, op: 0.8 },
    { x: width * 0.82, y: 88, r: 2.4, op: 0.9 },
    { x: width * 0.92, y: 30, r: 1.5, op: 0.75 },
    { x: width * 0.15, y: 130, r: 2.0, op: 0.85 },
    { x: width * 0.32, y: 155, r: 1.5, op: 0.65 },
    { x: width * 0.62, y: 140, r: 2.2, op: 0.85 },
    { x: width * 0.78, y: 165, r: 1.7, op: 0.7 },
    { x: width * 0.88, y: 125, r: 2.5, op: 0.9 },
  ];

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
                  <Stop offset="0%" stopColor={theme.isDark ? '#081225' : '#60A5FA'} stopOpacity="0.6" />
                  <Stop offset="30%" stopColor={theme.isDark ? '#0F172A' : '#93C5FD'} stopOpacity="0.4" />
                  <Stop offset="65%" stopColor={theme.isDark ? '#0B0F19' : '#DBEAFE'} stopOpacity="0.22" />
                  <Stop offset="100%" stopColor={theme.isDark ? '#020617' : '#F8FAFC'} stopOpacity="0.08" />
                </LinearGradient>
                <RadialGradient id="sunAtmosphereGlow" cx="80%" cy="14%" r="65%" fx="80%" fy="14%">
                  <Stop offset="0%" stopColor={theme.isDark ? '#6366F1' : '#38BDF8'} stopOpacity="0.38" />
                  <Stop offset="45%" stopColor={theme.isDark ? '#818CF8' : '#818CF8'} stopOpacity="0.18" />
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
                top: 45,
                left: -60,
                width: width * 0.95,
                height: 125,
                borderRadius: 65,
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                transform: [{ translateX: animationsEnabled ? cloud1 : 0 }],
              }}
            />
            <Animated.View
              style={{
                position: 'absolute',
                top: 195,
                right: -70,
                width: width * 0.85,
                height: 105,
                borderRadius: 55,
                backgroundColor: 'rgba(255, 255, 255, 0.13)',
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

        {/* Twinkling Starfield in Dark Theme */}
        {theme.isDark && animationsEnabled && (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { opacity: starTwinkle },
            ]}
            pointerEvents="none"
          >
            <Svg width="100%" height={260} style={StyleSheet.absoluteFill}>
              {stars.map((s, idx) => (
                <G key={idx} opacity={s.op}>
                  <Circle cx={s.x} cy={s.y} r={s.r} fill="#E0E7FF" />
                  {idx % 4 === 0 && (
                    <>
                      <Line x1={s.x - 3} y1={s.y} x2={s.x + 3} y2={s.y} stroke="#FFFFFF" strokeWidth="0.8" opacity="0.8" />
                      <Line x1={s.x} y1={s.y - 3} x2={s.x} y2={s.y + 3} stroke="#FFFFFF" strokeWidth="0.8" opacity="0.8" />
                    </>
                  )}
                </G>
              ))}
            </Svg>
          </Animated.View>
        )}

        {/* Diagonal Shooting Star Animation */}
        {theme.isDark && animationsEnabled && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 40,
              left: width * 0.2,
              width: 80,
              height: 2,
              opacity: shootingStarProgress.interpolate({
                inputRange: [0, 0.1, 0.85, 1],
                outputRange: [0, 1, 0.8, 0],
              }),
              transform: [
                {
                  translateX: shootingStarProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, width * 0.55],
                  }),
                },
                {
                  translateY: shootingStarProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 90],
                  }),
                },
                { rotate: '32deg' },
              ],
            }}
            pointerEvents="none"
          >
            <Svg width="80" height="2">
              <Defs>
                <LinearGradient id="shootingStarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                  <Stop offset="70%" stopColor="#818CF8" stopOpacity="0.7" />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="80" height="2" rx="1" fill="url(#shootingStarGrad)" />
            </Svg>
          </Animated.View>
        )}

        {/* Volumetric Rain Streaks with Slanted Drops */}
        {(weatherType === 'rain' || weatherType === 'storm') && animationsEnabled && (
          <Animated.View
            style={[
              styles.rainStreakContainer,
              {
                transform: [
                  { translateY: rainStreak },
                  { rotate: '8deg' },
                ],
              },
            ]}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
              const dropLeft = (width / 12) * i + ((i % 3) * 6);
              const dropTop = ((i * 35) % 240);
              const dropHeight = 16 + (i % 4) * 5;
              const dropOp = 0.2 + (i % 3) * 0.12;

              return (
                <View
                  key={i}
                  style={[
                    styles.rainDrop,
                    {
                      left: dropLeft,
                      top: dropTop,
                      height: dropHeight,
                      backgroundColor: theme.colors.primary,
                      opacity: dropOp,
                    },
                  ]}
                />
              );
            })}
          </Animated.View>
        )}

        {/* Snow Flurries */}
        {weatherType === 'snow' && animationsEnabled && (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                transform: [{ translateY: snowDrift }],
              },
            ]}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  left: (width / 8) * i + 10,
                  top: (i * 45) % 280,
                  width: 6 + (i % 3) * 2,
                  height: 6 + (i % 3) * 2,
                  borderRadius: 5,
                  backgroundColor: theme.colors.text,
                  opacity: 0.35 + (i % 3) * 0.15,
                }}
              />
            ))}
          </Animated.View>
        )}
      </View>

      {/* Main Screen Content */}
      {children}
    </View>
  );
});

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
    top: -50,
    left: -20,
    right: -20,
    height: 380,
  },
  rainDrop: {
    position: 'absolute',
    width: 1.8,
    borderRadius: 1,
  },
});

