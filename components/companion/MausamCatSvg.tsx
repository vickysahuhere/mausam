import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, AppState, AppStateStatus, Text } from 'react-native';
import Svg, { Path, Circle, Ellipse, G, Defs, LinearGradient, RadialGradient, Stop, Rect, Line } from 'react-native-svg';
import {
  CompanionExpression,
  CompanionPose,
  CompanionAccessory,
  GazeTarget,
} from '../../lib/companion/companionBrain';
import { CatThemeStyle } from '../../lib/cat/catTypes';

export type ExtendedExpression =
  | CompanionExpression
  | 'worried'
  | 'shivering'
  | 'panting_hot'
  | 'playful';

export type ExtendedPose =
  | CompanionPose
  | 'holding_on_wind'
  | 'shiver_cold';

export type ExtendedAccessory =
  | CompanionAccessory
  | 'straw_hat'
  | 'sports_headband';

interface MausamCatSvgProps {
  expression?: ExtendedExpression;
  pose?: ExtendedPose;
  accessory?: ExtendedAccessory;
  gazeTarget?: GazeTarget;
  size?: number;
  isDark?: boolean;
  themeStyle?: CatThemeStyle;
  animationsEnabled?: boolean;
}

export const MausamCatSvg = React.memo(function MausamCatSvg({
  expression = 'neutral',
  pose = 'perch',
  accessory = 'none',
  gazeTarget = 'user',
  size = 110,
  isDark = false,
  themeStyle,
  animationsEnabled = true,
}: MausamCatSvgProps) {
  // Ultra-lean React Native animated references with native driver
  const tailAngle = useRef(new Animated.Value(0)).current;
  const headBob = useRef(new Animated.Value(0)).current;
  const headTilt = useRef(new Animated.Value(0)).current;
  const leftPawY = useRef(new Animated.Value(0)).current;
  const rightPawY = useRef(new Animated.Value(0)).current;
  const leftEarTwitch = useRef(new Animated.Value(0)).current;
  const rightEarTwitch = useRef(new Animated.Value(0)).current;
  const bodyBreath = useRef(new Animated.Value(0)).current;
  const bongoNoteY1 = useRef(new Animated.Value(0)).current;
  const bongoNoteY2 = useRef(new Animated.Value(0)).current;
  const bongoNoteOpacity = useRef(new Animated.Value(0)).current;

  // Natural living eye blinking state
  const [isBlinking, setIsBlinking] = useState(false);

  // AppState awareness to freeze loops when backgrounded
  const [isAppActive, setIsAppActive] = useState(() => AppState.currentState === 'active');

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      setIsAppActive(state === 'active');
    });
    return () => sub.remove();
  }, []);

  // Theme-driven colors with graceful fallbacks
  const coatColor = themeStyle?.coatColor ?? (isDark ? '#E2E8F0' : '#FFFDF7');
  const earInner = themeStyle?.earInnerColor ?? '#FDA4AF';
  const outlineColor = themeStyle?.outlineColor ?? (isDark ? '#1E293B' : '#334155');
  const outlineWidth = themeStyle?.outlineWidth ?? 2.4;
  const cheekColor = themeStyle?.cheekColor ?? '#FDA4AF';
  const eyeColor = themeStyle?.eyeColor ?? (isDark ? '#0F172A' : '#1E293B');
  const noseColor = themeStyle?.noseColor ?? '#FB7185';
  const auraGlow = themeStyle?.auraGlowColor;
  const shadowStyle = themeStyle?.shadowStyle ?? 'glass_ambient';
  const motionFactor = animationsEnabled ? (themeStyle?.motionIntensity ?? 1.0) : 0;

  // Gaze pupil offsets & head tilt
  let eyeDx = 0;
  let eyeDy = 0;
  let targetTilt = 0;

  if (gazeTarget === 'left') {
    eyeDx = -2.8;
    eyeDy = 0;
    targetTilt = -3;
  } else if (gazeTarget === 'right') {
    eyeDx = 2.8;
    eyeDy = 0;
    targetTilt = 3;
  } else if (gazeTarget === 'up') {
    eyeDx = 0;
    eyeDy = -2.5;
    targetTilt = 0;
  } else if (gazeTarget === 'down') {
    eyeDx = 0;
    eyeDy = 2.5;
    targetTilt = 0;
  }

  // 1. Natural slow eye-blinking timer (every 3.8s)
  useEffect(() => {
    if (!animationsEnabled || !isAppActive || expression === 'sleeping') {
      setIsBlinking(false);
      return;
    }
    const blinkTimer = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3800);

    return () => clearInterval(blinkTimer);
  }, [animationsEnabled, isAppActive, expression]);

  // 2. Continuous body breathing & gentle head bob loops
  useEffect(() => {
    if (!animationsEnabled || motionFactor === 0 || !isAppActive) {
      headBob.setValue(0);
      bodyBreath.setValue(0);
      return;
    }

    const breathLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bodyBreath, {
          toValue: 1,
          duration: Math.round(1600 / motionFactor),
          useNativeDriver: true,
        }),
        Animated.timing(bodyBreath, {
          toValue: 0,
          duration: Math.round(1600 / motionFactor),
          useNativeDriver: true,
        }),
      ])
    );

    const headLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(headBob, {
          toValue: -2.8,
          duration: Math.round(1600 / motionFactor),
          useNativeDriver: true,
        }),
        Animated.timing(headBob, {
          toValue: 0,
          duration: Math.round(1600 / motionFactor),
          useNativeDriver: true,
        }),
      ])
    );

    breathLoop.start();
    headLoop.start();

    return () => {
      breathLoop.stop();
      headLoop.stop();
    };
  }, [animationsEnabled, motionFactor, isAppActive, headBob, bodyBreath]);

  // 3. Dynamic tail sway pivoted around base joint
  useEffect(() => {
    if (!animationsEnabled || motionFactor === 0 || !isAppActive) {
      tailAngle.setValue(0);
      return;
    }

    const tailLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(tailAngle, {
          toValue: pose === 'curl_sleep' ? -4 : 14,
          duration: Math.round(1100 / motionFactor),
          useNativeDriver: true,
        }),
        Animated.timing(tailAngle, {
          toValue: pose === 'curl_sleep' ? -8 : -12,
          duration: Math.round(1100 / motionFactor),
          useNativeDriver: true,
        }),
      ])
    );
    tailLoop.start();

    return () => tailLoop.stop();
  }, [pose, animationsEnabled, motionFactor, isAppActive, tailAngle]);

  // 4. Independent Front Paws (Bongo drumming alternating combo & wave)
  useEffect(() => {
    if (!animationsEnabled || motionFactor === 0 || !isAppActive) {
      leftPawY.setValue(0);
      rightPawY.setValue(0);
      return;
    }

    if (pose === 'bongo_tap') {
      // Rapid alternating drumming paws
      const bongoLoop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(leftPawY, { toValue: -8, duration: 110, useNativeDriver: true }),
            Animated.timing(rightPawY, { toValue: 3, duration: 110, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(leftPawY, { toValue: 3, duration: 110, useNativeDriver: true }),
            Animated.timing(rightPawY, { toValue: -8, duration: 110, useNativeDriver: true }),
          ]),
        ])
      );
      bongoLoop.start();
      return () => bongoLoop.stop();
    } else if (pose === 'wave') {
      const waveLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(rightPawY, { toValue: -14, duration: 170, useNativeDriver: true }),
          Animated.timing(rightPawY, { toValue: -4, duration: 170, useNativeDriver: true }),
        ])
      );
      waveLoop.start();
      return () => waveLoop.stop();
    } else if (pose === 'holding_on_wind' || (pose as string) === 'shiver_cold') {
      const shiverLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(leftPawY, { toValue: -2, duration: 80, useNativeDriver: true }),
          Animated.timing(rightPawY, { toValue: 2, duration: 80, useNativeDriver: true }),
          Animated.timing(leftPawY, { toValue: 2, duration: 80, useNativeDriver: true }),
          Animated.timing(rightPawY, { toValue: -2, duration: 80, useNativeDriver: true }),
        ])
      );
      shiverLoop.start();
      return () => shiverLoop.stop();
    } else {
      leftPawY.setValue(0);
      rightPawY.setValue(0);
    }
  }, [pose, animationsEnabled, motionFactor, isAppActive, leftPawY, rightPawY]);

  // 5. Independent ear twitching (occasional playful flick)
  useEffect(() => {
    if (!animationsEnabled || !isAppActive || expression === 'sleeping') return;

    const twitchInterval = setInterval(() => {
      const isLeft = Math.random() > 0.5;
      const targetAnim = isLeft ? leftEarTwitch : rightEarTwitch;
      const targetDeg = isLeft ? -9 : 9;

      Animated.sequence([
        Animated.timing(targetAnim, { toValue: targetDeg, duration: 90, useNativeDriver: true }),
        Animated.timing(targetAnim, { toValue: 0, duration: 110, useNativeDriver: true }),
      ]).start();
    }, 4200);

    return () => clearInterval(twitchInterval);
  }, [animationsEnabled, isAppActive, expression, leftEarTwitch, rightEarTwitch]);

  // 6. Bongo celebration floating notes & sparkles
  useEffect(() => {
    if (!animationsEnabled || !isAppActive || pose !== 'bongo_tap') {
      bongoNoteOpacity.setValue(0);
      return;
    }

    bongoNoteOpacity.setValue(1);
    const noteLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bongoNoteY1, { toValue: -18, duration: 700, useNativeDriver: true }),
          Animated.timing(bongoNoteY2, { toValue: -22, duration: 900, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(bongoNoteY1, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(bongoNoteY2, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    noteLoop.start();

    return () => noteLoop.stop();
  }, [pose, animationsEnabled, isAppActive, bongoNoteY1, bongoNoteY2, bongoNoteOpacity]);

  useEffect(() => {
    if (!animationsEnabled) {
      headTilt.setValue(targetTilt);
      return;
    }
    Animated.timing(headTilt, {
      toValue: targetTilt,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [targetTilt, headTilt, animationsEnabled]);

  const tiltDeg = headTilt.interpolate({
    inputRange: [-10, 10],
    outputRange: ['-10deg', '10deg'],
  });

  const tailDeg = tailAngle.interpolate({
    inputRange: [-20, 20],
    outputRange: ['-20deg', '20deg'],
  });

  const leftEarDeg = leftEarTwitch.interpolate({
    inputRange: [-15, 15],
    outputRange: ['-15deg', '15deg'],
  });

  const rightEarDeg = rightEarTwitch.interpolate({
    inputRange: [-15, 15],
    outputRange: ['-15deg', '15deg'],
  });

  const breathScaleY = bodyBreath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });

  const scale = size / 120;

  return (
    <View style={{ width: size, height: size * 0.9, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 120,
          height: 108,
          transform: [{ scale }],
          position: 'relative',
        }}
      >
        {/* 1. BASE LAYER: Soft Aura Glow & Contact Grounding Shadow */}
        <Svg width="120" height="108" viewBox="0 0 120 108" style={{ position: 'absolute', top: 0, left: 0 }}>
          <Defs>
            <LinearGradient id="coatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={coatColor} />
              <Stop offset="100%" stopColor={isDark ? '#CBD5E1' : '#EFECE6'} />
            </LinearGradient>
            <LinearGradient id="chestBibGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="100%" stopColor={isDark ? '#E2E8F0' : '#FFFDF9'} />
            </LinearGradient>
            <RadialGradient id="blushGrad" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor={cheekColor} stopOpacity="0.6" />
              <Stop offset="100%" stopColor={cheekColor} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="auraRadial" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor={auraGlow || '#38BDF8'} stopOpacity="0.22" />
              <Stop offset="80%" stopColor={auraGlow || '#38BDF8'} stopOpacity="0.06" />
              <Stop offset="100%" stopColor={auraGlow || '#38BDF8'} stopOpacity="0" />
            </RadialGradient>
            <LinearGradient id="umbrellaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#38BDF8" />
              <Stop offset="100%" stopColor="#0284C7" />
            </LinearGradient>
            <LinearGradient id="scarfGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#EF4444" />
              <Stop offset="50%" stopColor="#F87171" />
              <Stop offset="100%" stopColor="#DC2626" />
            </LinearGradient>
            <LinearGradient id="maskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#818CF8" />
              <Stop offset="50%" stopColor="#6366F1" />
              <Stop offset="100%" stopColor="#4F46E5" />
            </LinearGradient>
            <LinearGradient id="strawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FDE047" />
              <Stop offset="100%" stopColor="#CA8A04" />
            </LinearGradient>
          </Defs>

          {/* Soft Aura Ambient Glow */}
          {auraGlow && auraGlow !== 'transparent' && (
            <Ellipse cx="60" cy="54" rx="46" ry="40" fill="url(#auraRadial)" />
          )}

          {/* Contact Pedestal Grounding Shadow */}
          {shadowStyle === 'comic_offset' ? (
            <Ellipse cx="62" cy="101" rx="40" ry="6" fill="#264653" opacity={0.25} />
          ) : (
            <Ellipse cx="60" cy="99" rx="40" ry="6" fill={isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.09)'} />
          )}
        </Svg>

        {/* 2. TAIL LAYER (Fluffy S-Curve Tail with Dynamic Sway) */}
        <Animated.View
          style={{
            position: 'absolute',
            left: pose === 'curl_sleep' ? 14 : 76,
            top: pose === 'curl_sleep' ? 74 : 64,
            width: 40,
            height: 42,
            transform: [{ rotate: tailDeg }],
          }}
        >
          <Svg width="40" height="42" viewBox="0 0 40 42">
            <Defs>
              <LinearGradient id="tailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={coatColor} />
                <Stop offset="100%" stopColor={isDark ? '#CBD5E1' : '#EFECE6'} />
              </LinearGradient>
            </Defs>
            <Path
              d="M 6 32 C 14 20 28 14 34 22 C 38 28 32 36 24 36 C 14 36 8 34 6 32 Z"
              fill="url(#tailGrad)"
              stroke={outlineColor}
              strokeWidth={outlineWidth * 0.9}
              strokeLinejoin="round"
            />
          </Svg>
        </Animated.View>

        {/* 3. CAT BODY LAYER (Breathing Squash & Stretch + Fluffy Chest Fur Bib) */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 120,
            height: 108,
            transform: [{ scaleY: breathScaleY }],
          }}
        >
          <Svg width="120" height="108" viewBox="0 0 120 108">
            <Defs>
              <LinearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={coatColor} />
                <Stop offset="100%" stopColor={isDark ? '#CBD5E1' : '#EFECE6'} />
              </LinearGradient>
              <LinearGradient id="bibGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#FFFFFF" />
                <Stop offset="100%" stopColor={isDark ? '#E2E8F0' : '#FFFDF9'} />
              </LinearGradient>
            </Defs>
            <Path
              d={
                pose === 'curl_sleep'
                  ? 'M 28 92 C 24 68 42 58 60 58 C 78 58 96 68 92 92 C 88 98 32 98 28 92 Z'
                  : 'M 33 94 C 29 70 38 56 60 56 C 82 56 91 70 87 94 C 85 98 35 98 33 94 Z'
              }
              fill="url(#bodyGrad)"
              stroke={outlineColor}
              strokeWidth={outlineWidth}
              strokeLinejoin="round"
            />
            {/* Fluffy Mochi Chest Fur Bib */}
            {pose !== 'curl_sleep' && (
              <Path
                d="M 49 63 C 49 76 71 76 71 63 C 67 69 63 69 60 65 C 57 69 53 69 49 63 Z"
                fill="url(#bibGrad)"
                stroke={outlineColor}
                strokeWidth={0.8}
                opacity={0.9}
              />
            )}
          </Svg>
        </Animated.View>

        {/* 4. HEAD & FACE LAYER (Mochi Cheeks + Blinking Anime Eyes + Twitches) */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 120,
            height: 108,
            transform: [{ translateY: headBob }, { rotate: tiltDeg }],
          }}
        >
          {/* Left Twitching Ear (Soft curved tip & inner fold) */}
          <Animated.View
            style={{
              position: 'absolute',
              left: 20,
              top: 10,
              width: 34,
              height: 40,
              transform: [{ rotate: leftEarDeg }],
            }}
          >
            <Svg width="34" height="40" viewBox="0 0 34 40">
              <Defs>
                <LinearGradient id="earGradL" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor={coatColor} />
                  <Stop offset="100%" stopColor={isDark ? '#CBD5E1' : '#EFECE6'} />
                </LinearGradient>
              </Defs>
              <Path
                d={
                  expression === 'startled' || expression === 'worried'
                    ? 'M 20 30 L 2 35 L 26 38 Z'
                    : 'M 18 30 C 12 26 7 12 13 6 C 21 4 28 17 28 28 Z'
                }
                fill="url(#earGradL)"
                stroke={outlineColor}
                strokeWidth={outlineWidth}
                strokeLinejoin="round"
              />
              {expression !== 'startled' && expression !== 'worried' && (
                <>
                  <Path
                    d="M 17 26 C 13 22 11 13 15 10 C 20 9 24 17 25 24 Z"
                    fill={earInner}
                  />
                  {/* Fluffy Kitten Ear Tufts */}
                  <Path
                    d="M 22 27 C 18 24 15 19 18 16 C 19 19 23 22 26 24 Z"
                    fill="#FFFFFF"
                    opacity={isDark ? 0.45 : 0.8}
                  />
                </>
              )}
            </Svg>
          </Animated.View>

          {/* Right Twitching Ear (Soft curved tip & inner fold) */}
          <Animated.View
            style={{
              position: 'absolute',
              left: 66,
              top: 10,
              width: 34,
              height: 40,
              transform: [{ rotate: rightEarDeg }],
            }}
          >
            <Svg width="34" height="40" viewBox="0 0 34 40">
              <Defs>
                <LinearGradient id="earGradR" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor={coatColor} />
                  <Stop offset="100%" stopColor={isDark ? '#CBD5E1' : '#EFECE6'} />
                </LinearGradient>
              </Defs>
              <Path
                d={
                  expression === 'startled' || expression === 'worried'
                    ? 'M 14 30 L 32 35 L 8 38 Z'
                    : 'M 16 30 C 22 26 27 12 21 6 C 13 4 6 17 6 28 Z'
                }
                fill="url(#earGradR)"
                stroke={outlineColor}
                strokeWidth={outlineWidth}
                strokeLinejoin="round"
              />
              {expression !== 'startled' && expression !== 'worried' && (
                <>
                  <Path
                    d="M 17 26 C 21 22 23 13 19 10 C 14 9 10 17 9 24 Z"
                    fill={earInner}
                  />
                  {/* Fluffy Kitten Ear Tufts */}
                  <Path
                    d="M 12 27 C 16 24 19 19 16 16 C 15 19 11 22 8 24 Z"
                    fill="#FFFFFF"
                    opacity={isDark ? 0.45 : 0.8}
                  />
                </>
              )}
            </Svg>
          </Animated.View>

          {/* Head & Facial Features SVG */}
          <Svg width="120" height="108" viewBox="0 0 120 108" style={{ position: 'absolute', top: 0, left: 0 }}>
            <Defs>
              <LinearGradient id="headGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={coatColor} />
                <Stop offset="100%" stopColor={isDark ? '#CBD5E1' : '#EFECE6'} />
              </LinearGradient>
              <RadialGradient id="blushGrad2" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor={cheekColor} stopOpacity="0.6" />
                <Stop offset="100%" stopColor={cheekColor} stopOpacity="0" />
              </RadialGradient>
              <LinearGradient id="umbrellaGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#38BDF8" />
                <Stop offset="100%" stopColor="#0284C7" />
              </LinearGradient>
              <LinearGradient id="scarfGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#EF4444" />
                <Stop offset="50%" stopColor="#F87171" />
                <Stop offset="100%" stopColor="#DC2626" />
              </LinearGradient>
              <LinearGradient id="bellGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FEF08A" />
                <Stop offset="40%" stopColor="#FBBF24" />
                <Stop offset="85%" stopColor="#D97706" />
                <Stop offset="100%" stopColor="#92400E" />
              </LinearGradient>
              <LinearGradient id="collarRibbon2" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#E11D48" />
                <Stop offset="50%" stopColor="#FB7185" />
                <Stop offset="100%" stopColor="#BE123C" />
              </LinearGradient>
              <LinearGradient id="maskGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#818CF8" />
                <Stop offset="50%" stopColor="#6366F1" />
                <Stop offset="100%" stopColor="#4F46E5" />
              </LinearGradient>
              <LinearGradient id="strawGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FDE047" />
                <Stop offset="100%" stopColor="#CA8A04" />
              </LinearGradient>
            </Defs>

            {/* CHUBBY MOCHI KAWAII HEAD SHAPE */}
            <Path
              d="M 32 46 C 30 58 44 64 60 64 C 76 64 90 58 88 46 C 86 32 74 26 60 26 C 46 26 34 32 32 46 Z"
              fill="url(#headGrad)"
              stroke={outlineColor}
              strokeWidth={outlineWidth}
              strokeLinejoin="round"
            />

            {/* SOFT MOCHI FOREHEAD HIGHLIGHT */}
            <Path d="M 56 31 Q 60 33.5 64 31" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.45" fill="none" />

            {/* SOFT AIRBRUSHED ROSY CHEEKS WITH SPARKLE DOTS */}
            <Ellipse cx="41" cy="51" rx="6.5" ry="4.5" fill="url(#blushGrad2)" />
            <Ellipse cx="79" cy="51" rx="6.5" ry="4.5" fill="url(#blushGrad2)" />
            <Circle cx="40" cy="50" r="0.9" fill="#FFFFFF" opacity="0.9" />
            <Circle cx="78" cy="50" r="0.9" fill="#FFFFFF" opacity="0.9" />

            {/* EYES (With Blinking & Double Catchlight Highlights) */}
            {isBlinking && expression !== 'sleeping' && expression !== 'sleepy' ? (
              // Cute natural blinking anime arc
              <G>
                <Path d="M 44 45 Q 50 49 56 45" stroke={eyeColor} strokeWidth="2.6" strokeLinecap="round" fill="none" />
                <Path d="M 64 45 Q 70 49 76 45" stroke={eyeColor} strokeWidth="2.6" strokeLinecap="round" fill="none" />
              </G>
            ) : expression === 'happy' || expression === 'blissful' ? (
              // Happy crescent arcs ^_^
              <G>
                <Path d="M 44 46 Q 50 39 56 46" stroke={eyeColor} strokeWidth="2.8" strokeLinecap="round" fill="none" />
                <Path d="M 64 46 Q 70 39 76 46" stroke={eyeColor} strokeWidth="2.8" strokeLinecap="round" fill="none" />
              </G>
            ) : expression === 'playful' ? (
              // One wink eye, one shiny eye
              <G>
                <Path d="M 44 45 L 56 45" stroke={eyeColor} strokeWidth="2.6" strokeLinecap="round" />
                <Ellipse cx={70} cy={44} rx="4.6" ry="5.2" fill={eyeColor} />
                <Circle cx={68.2} cy={42.2} r="1.8" fill="#FFFFFF" />
                <Circle cx={71.6} cy={45.8} r="0.9" fill="#FFFFFF" opacity="0.85" />
              </G>
            ) : expression === 'sleeping' ? (
              // Sleeping closed slits
              <G>
                <Path d="M 44 46 Q 50 48 56 46" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <Path d="M 64 46 Q 70 48 76 46" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </G>
            ) : expression === 'sleepy' ? (
              // Sleepy half-lidded eyes
              <G>
                <Ellipse cx={50 + eyeDx} cy={46 + eyeDy} rx="4.2" ry="2.6" fill={eyeColor} />
                <Ellipse cx={70 + eyeDx} cy={46 + eyeDy} rx="4.2" ry="2.6" fill={eyeColor} />
              </G>
            ) : expression === 'surprised' || expression === 'startled' ? (
              // Wide surprised anime pupils O_O
              <G>
                <Circle cx={50 + eyeDx} cy={44 + eyeDy} r="5.4" fill={eyeColor} />
                <Circle cx={48.2 + eyeDx} cy={42.2 + eyeDy} r="2" fill="#FFFFFF" />
                <Circle cx={51.8 + eyeDx} cy={46.2 + eyeDy} r="1" fill="#FFFFFF" opacity="0.85" />
                <Circle cx={70 + eyeDx} cy={44 + eyeDy} r="5.4" fill={eyeColor} />
                <Circle cx={68.2 + eyeDx} cy={42.2 + eyeDy} r="2" fill="#FFFFFF" />
                <Circle cx={71.8 + eyeDx} cy={46.2 + eyeDy} r="1" fill="#FFFFFF" opacity="0.85" />
              </G>
            ) : expression === 'worried' ? (
              // Worried curved inner eyebrows
              <G>
                <Ellipse cx={50 + eyeDx} cy={45 + eyeDy} rx="4.4" ry="4.8" fill={eyeColor} />
                <Circle cx={48.4 + eyeDx} cy={43.4 + eyeDy} r="1.5" fill="#FFFFFF" />
                <Ellipse cx={70 + eyeDx} cy={45 + eyeDy} rx="4.4" ry="4.8" fill={eyeColor} />
                <Circle cx={68.4 + eyeDx} cy={43.4 + eyeDy} r="1.5" fill="#FFFFFF" />
                <Path d="M 45 39 L 53 37" stroke={eyeColor} strokeWidth="1.8" strokeLinecap="round" />
                <Path d="M 75 39 L 67 37" stroke={eyeColor} strokeWidth="1.8" strokeLinecap="round" />
              </G>
            ) : expression === 'annoyed' ? (
              // Mildly annoyed sideways glance
              <G>
                <Path d="M 45 42 L 55 45" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" />
                <Path d="M 75 42 L 65 45" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" />
              </G>
            ) : (
              // Soulful anime eyes with triple sparkle catchlights & iris specular arc
              <G>
                {/* Left Eye */}
                <Ellipse cx={50 + eyeDx} cy={44 + eyeDy} rx="4.6" ry="5.2" fill={eyeColor} />
                <Path
                  d={`M ${47.2 + eyeDx} ${45.8 + eyeDy} Q ${50 + eyeDx} ${48.2 + eyeDy} ${52.8 + eyeDx} ${45.8 + eyeDy}`}
                  stroke="rgba(255, 255, 255, 0.42)"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  fill="none"
                />
                <Circle cx={48.2 + eyeDx} cy={42.2 + eyeDy} r="1.85" fill="#FFFFFF" />
                <Circle cx={51.8 + eyeDx} cy={45.8 + eyeDy} r="0.95" fill="#FFFFFF" opacity="0.9" />
                <Circle cx={52 + eyeDx} cy={42.8 + eyeDy} r="0.5" fill="#FFFFFF" opacity="0.85" />

                {/* Right Eye */}
                <Ellipse cx={70 + eyeDx} cy={44 + eyeDy} rx="4.6" ry="5.2" fill={eyeColor} />
                <Path
                  d={`M ${67.2 + eyeDx} ${45.8 + eyeDy} Q ${70 + eyeDx} ${48.2 + eyeDy} ${72.8 + eyeDx} ${45.8 + eyeDy}`}
                  stroke="rgba(255, 255, 255, 0.42)"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  fill="none"
                />
                <Circle cx={68.2 + eyeDx} cy={42.2 + eyeDy} r="1.85" fill="#FFFFFF" />
                <Circle cx={71.8 + eyeDx} cy={45.8 + eyeDy} r="0.95" fill="#FFFFFF" opacity="0.9" />
                <Circle cx={72 + eyeDx} cy={42.8 + eyeDy} r="0.5" fill="#FFFFFF" opacity="0.85" />
              </G>
            )}

            {/* CUTE INVERTED PINK TRIANGLE NOSE */}
            <Path d="M 58.5 48 L 61.5 48 C 61.5 48 60 50.5 60 50.5 C 60 50.5 58.5 48 58.5 48 Z" fill={noseColor} />

            {/* ADORABLE ':3' MOUTH (With Pink Tongue for Bongo / Happy) */}
            {pose === 'bongo_tap' || expression === 'happy' || expression === 'playful' ? (
              <G>
                <Path d="M 55 51 C 55 58 65 58 65 51 Z" fill="#E11D48" />
                <Path d="M 57 53.5 C 57 57.5 63 57.5 63 53.5 Z" fill="#FDA4AF" />
                <Path
                  d="M 54 50.5 Q 57 53 60 50.5 Q 63 53 66 50.5"
                  stroke={outlineColor}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                />
              </G>
            ) : expression === 'surprised' || expression === 'worried' ? (
              <Circle cx="60" cy="54" r="2" stroke={outlineColor} strokeWidth="1.6" fill="none" />
            ) : (expression as string) === 'panting_hot' ? (
              <G>
                <Path d="M 57 52 Q 60 54 63 52" stroke={outlineColor} strokeWidth="1.6" strokeLinecap="round" fill="none" />
                <Path d="M 58 53 C 58 57 62 57 62 53 Z" fill="#F43F5E" />
              </G>
            ) : (
              // Classic sweet ':3' cat mouth
              <G>
                <Path d="M 56 50.5 Q 58 53.5 60 50.5" stroke={outlineColor} strokeWidth="1.6" strokeLinecap="round" fill="none" />
                <Path d="M 60 50.5 Q 62 53.5 64 50.5" stroke={outlineColor} strokeWidth="1.6" strokeLinecap="round" fill="none" />
              </G>
            )}

            {/* DELICATE NATURAL CURVED WHISKERS */}
            <Path d="M 36 49 Q 25 46 22 47" stroke={outlineColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
            <Path d="M 36 53 Q 26 53 23 55" stroke={outlineColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
            <Path d="M 84 49 Q 95 46 98 47" stroke={outlineColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
            <Path d="M 84 53 Q 94 53 97 55" stroke={outlineColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />

            {/* ACCESSORIES */}
            {/* SIGNATURE MASCOT BELL COLLAR (Rendered when not wearing winter scarf) */}
            {accessory !== 'scarf' && (
              <G>
                {/* Delicate Ribbon Band Hugging Neck */}
                <Path
                  d="M 44 63 Q 60 68.5 76 63"
                  stroke="url(#collarRibbon2)"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Golden Mascot Bell */}
                <Circle cx="60" cy="65.8" r="3.4" fill="url(#bellGrad2)" stroke="#78350F" strokeWidth="0.75" />
                {/* Bell Highlight Specular Shine */}
                <Circle cx="59.1" cy="64.5" r="0.95" fill="#FFFFFF" opacity="0.85" />
                {/* Horizontal Bell Seam */}
                <Path d="M 58 67 L 62 67" stroke="#78350F" strokeWidth="0.65" strokeLinecap="round" />
                {/* Bell Hole */}
                <Circle cx="60" cy="67.5" r="0.45" fill="#451A03" />
              </G>
            )}

            {accessory === 'scarf' && (
              <G>
                <Path
                  d="M 40 64 Q 60 70 80 64 Q 82 72 60 74 Q 38 72 40 64 Z"
                  fill="url(#scarfGrad2)"
                  stroke="#B91C1C"
                  strokeWidth="1.5"
                />
                <Path d="M 68 68 L 72 82 L 78 81 L 74 67 Z" fill="url(#scarfGrad2)" stroke="#B91C1C" strokeWidth="1.5" />
              </G>
            )}

            {accessory === 'sunglasses' && (
              <G>
                <Path d="M 42 41 L 57 41 L 55 49 L 44 49 Z" fill="#0F172A" />
                <Path d="M 63 41 L 78 41 L 76 49 L 65 49 Z" fill="#0F172A" />
                <Path d="M 57 44 L 63 44" stroke="#0F172A" strokeWidth="2.5" />
                {/* Specular glass reflection */}
                <Path d="M 45 43 L 53 43" stroke="rgba(255,255,255,0.7)" strokeWidth="1" strokeLinecap="round" />
                <Path d="M 66 43 L 74 43" stroke="rgba(255,255,255,0.7)" strokeWidth="1" strokeLinecap="round" />
              </G>
            )}

            {accessory === 'umbrella' && (
              <G transform="translate(18, 6)">
                <Path
                  d="M 8 36 Q 30 8 52 36 Q 41 33 30 36 Q 19 33 8 36 Z"
                  fill="url(#umbrellaGrad2)"
                  stroke="#0369A1"
                  strokeWidth="1.5"
                />
                <Path d="M 30 36 L 30 64 Q 30 68 26 68" stroke="#64748B" strokeWidth="2" strokeLinecap="round" fill="none" />
              </G>
            )}

            {accessory === 'fan' && (
              <G transform="translate(78, 64) rotate(-15)">
                <Path d="M 0 0 L 16 -12 Q 24 -4 18 10 Z" fill="#F472B6" stroke="#DB2777" strokeWidth="1.2" />
                <Path d="M 0 0 L 18 2" stroke="#9D174D" strokeWidth="1" />
              </G>
            )}

            {accessory === 'straw_hat' && (
              <G transform="translate(32, 16)">
                <Ellipse cx="28" cy="18" rx="26" ry="6" fill="url(#strawGrad2)" stroke="#854D0E" strokeWidth="1.2" />
                <Path d="M 16 17 C 16 8 40 8 40 17 Z" fill="url(#strawGrad2)" stroke="#854D0E" strokeWidth="1.2" />
                <Path d="M 17 16 Q 28 18 39 16" stroke="#DC2626" strokeWidth="2" />
              </G>
            )}

            {accessory === 'sports_headband' && (
              <G transform="translate(36, 32)">
                <Path d="M 0 4 Q 24 8 48 4 Q 48 9 24 12 Q 0 9 0 4 Z" fill="#EA580C" stroke="#9A3412" strokeWidth="1" />
                <Path d="M 2 5 Q 24 9 46 5" stroke="#FFFFFF" strokeWidth="1.2" />
              </G>
            )}

            {(accessory === 'eye_mask' || accessory === 'sleeping_cap') && (
              <G>
                <Path
                  d="M 37 46 Q 32 44 28 42 M 83 46 Q 88 44 92 42"
                  stroke="#3730A3"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <Path
                  d="M 37 45 C 34 37 47 36 54 40 C 57 42 60 42 63 40 C 70 36 83 37 80 45 C 83 53 71 55 64 50 C 61 48 59 48 56 50 C 46 55 34 53 37 45 Z"
                  fill="url(#maskGrad2)"
                  stroke="#312E81"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <Path
                  d="M 40 40 Q 47 37 53 40"
                  stroke="rgba(255, 255, 255, 0.45)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  fill="none"
                />
                <Path
                  d="M 67 40 Q 73 37 80 40"
                  stroke="rgba(255, 255, 255, 0.45)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  fill="none"
                />
                <Path
                  d="M 45 46 Q 49 49 53 46"
                  stroke="#FEF08A"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                />
                <Path d="M 47 48 L 46 50.5" stroke="#FEF08A" strokeWidth="1.3" strokeLinecap="round" />
                <Path d="M 51 48 L 52 50.5" stroke="#FEF08A" strokeWidth="1.3" strokeLinecap="round" />
                <Path
                  d="M 67 46 Q 71 49 75 46"
                  stroke="#FEF08A"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                />
                <Path d="M 69 48 L 68 50.5" stroke="#FEF08A" strokeWidth="1.3" strokeLinecap="round" />
                <Path d="M 73 48 L 74 50.5" stroke="#FEF08A" strokeWidth="1.3" strokeLinecap="round" />
                <Path
                  d="M 59.2 38.8 A 2.2 2.2 0 0 0 61.2 42.2 A 1.8 1.8 0 0 1 59.2 38.8 Z"
                  fill="#FDE047"
                />
              </G>
            )}
          </Svg>
        </Animated.View>

        {/* 5. FRONT STAGE: BONGO DRUMS / RESTING PAWS */}
        {pose === 'bongo_tap' ? (
          <>
            {/* MINIATURE CHERRYWOOD BONGO DRUMS */}
            <Svg width="120" height="108" viewBox="0 0 120 108" style={{ position: 'absolute', top: 0, left: 0 }}>
              <Defs>
                <LinearGradient id="bongoWood" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#D97706" />
                  <Stop offset="50%" stopColor="#B45309" />
                  <Stop offset="100%" stopColor="#78350F" />
                </LinearGradient>
                <LinearGradient id="bongoRim" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#FDE047" />
                  <Stop offset="50%" stopColor="#F59E0B" />
                  <Stop offset="100%" stopColor="#B45309" />
                </LinearGradient>
                <LinearGradient id="bongoSkin" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#FFFBEB" />
                  <Stop offset="100%" stopColor="#FDE68A" />
                </LinearGradient>
              </Defs>
              {/* Connector Bridge */}
              <Rect x="48" y="87" width="14" height="4" rx="1.5" fill="#78350F" stroke="#451A03" strokeWidth="0.8" />
              {/* Left Bongo Drum */}
              <G>
                <Path d="M 32 84 L 34 96 C 34 99 48 99 48 96 L 50 84 Z" fill="url(#bongoWood)" stroke="#78350F" strokeWidth="1" />
                <Line x1="35" y1="86" x2="36" y2="94" stroke="#FDE047" strokeWidth="1.2" />
                <Line x1="47" y1="86" x2="46" y2="94" stroke="#FDE047" strokeWidth="1.2" />
                <Ellipse cx="41" cy="84" rx="9" ry="3.2" fill="url(#bongoRim)" stroke="#92400E" strokeWidth="0.8" />
                <Ellipse cx="41" cy="84" rx="7.6" ry="2.4" fill="url(#bongoSkin)" stroke="#CA8A04" strokeWidth="0.6" />
              </G>
              {/* Right Bongo Drum */}
              <G>
                <Path d="M 60 84 L 62 96 C 62 99 76 99 76 96 L 78 84 Z" fill="url(#bongoWood)" stroke="#78350F" strokeWidth="1" />
                <Line x1="63" y1="86" x2="64" y2="94" stroke="#FDE047" strokeWidth="1.2" />
                <Line x1="75" y1="86" x2="74" y2="94" stroke="#FDE047" strokeWidth="1.2" />
                <Ellipse cx="69" cy="84" rx="9" ry="3.2" fill="url(#bongoRim)" stroke="#92400E" strokeWidth="0.8" />
                <Ellipse cx="69" cy="84" rx="7.6" ry="2.4" fill="url(#bongoSkin)" stroke="#CA8A04" strokeWidth="0.6" />
              </G>
            </Svg>

            {/* Left Drumming Paw (Tapping down onto Left Drum) */}
            <Animated.View
              style={{
                position: 'absolute',
                left: 31,
                top: 72,
                width: 22,
                height: 18,
                transform: [{ translateY: leftPawY }],
              }}
            >
              <Svg width="22" height="18" viewBox="0 0 22 18">
                <Defs>
                  <LinearGradient id="pawGradL" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor={coatColor} />
                    <Stop offset="100%" stopColor={isDark ? '#CBD5E1' : '#EFECE6'} />
                  </LinearGradient>
                </Defs>
                <Ellipse cx="11" cy="9" rx="8" ry="6.5" fill="url(#pawGradL)" stroke={outlineColor} strokeWidth={outlineWidth * 0.85} />
                <Path d="M 8 6 Q 9 9 9 11 M 14 6 Q 13 9 13 11" stroke={outlineColor} strokeWidth="0.9" strokeLinecap="round" opacity="0.3" />
              </Svg>
            </Animated.View>

            {/* Right Drumming Paw (Tapping down onto Right Drum) */}
            <Animated.View
              style={{
                position: 'absolute',
                left: 59,
                top: 72,
                width: 22,
                height: 18,
                transform: [{ translateY: rightPawY }],
              }}
            >
              <Svg width="22" height="18" viewBox="0 0 22 18">
                <Defs>
                  <LinearGradient id="pawGradR" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor={coatColor} />
                    <Stop offset="100%" stopColor={isDark ? '#CBD5E1' : '#EFECE6'} />
                  </LinearGradient>
                </Defs>
                <Ellipse cx="11" cy="9" rx="8" ry="6.5" fill="url(#pawGradR)" stroke={outlineColor} strokeWidth={outlineWidth * 0.85} />
                <Path d="M 8 6 Q 9 9 9 11 M 14 6 Q 13 9 13 11" stroke={outlineColor} strokeWidth="0.9" strokeLinecap="round" opacity="0.3" />
              </Svg>
            </Animated.View>

            {/* Floating Musical Particles */}
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 14,
                top: 6,
                opacity: bongoNoteOpacity,
                transform: [{ translateY: bongoNoteY1 }, { rotate: '-12deg' }],
              }}
            >
              <Text style={{ fontSize: 16 }}>🎵</Text>
            </Animated.View>
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                right: 14,
                top: 4,
                opacity: bongoNoteOpacity,
                transform: [{ translateY: bongoNoteY2 }, { rotate: '12deg' }],
              }}
            >
              <Text style={{ fontSize: 16 }}>✨</Text>
            </Animated.View>
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 52,
                top: -8,
                opacity: bongoNoteOpacity,
                transform: [{ translateY: bongoNoteY1 }],
              }}
            >
              <Text style={{ fontSize: 15 }}>🎶</Text>
            </Animated.View>
          </>
        ) : pose === 'wave' ? (
          <>
            {/* Left Resting Paw */}
            <Svg width="120" height="108" viewBox="0 0 120 108" style={{ position: 'absolute', top: 0, left: 0 }}>
              <Defs>
                <LinearGradient id="pawRestGradL" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor={coatColor} />
                  <Stop offset="100%" stopColor={isDark ? '#CBD5E1' : '#EFECE6'} />
                </LinearGradient>
                <RadialGradient id="pawShadowGradL" cx="50%" cy="50%" rx="50%" ry="50%">
                  <Stop offset="0%" stopColor="#000000" stopOpacity="0.22" />
                  <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Ellipse cx="47" cy="95.5" rx="8.5" ry="2.2" fill="url(#pawShadowGradL)" />
              <Ellipse cx="47" cy="91" rx="8.2" ry="6.2" fill="url(#pawRestGradL)" stroke={outlineColor} strokeWidth={outlineWidth * 0.85} />
              <Path d="M 42 88.5 Q 47 87 52 88.5" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.65" fill="none" />
              <Path d="M 44.5 89 Q 45 92.5 45 94.5 M 49.5 89 Q 49 92.5 49 94.5" stroke={outlineColor} strokeWidth="0.9" strokeLinecap="round" opacity="0.28" />
            </Svg>
            {/* Right Waving Paw */}
            <Animated.View
              style={{
                position: 'absolute',
                left: 72,
                top: 72,
                width: 24,
                height: 22,
                transform: [{ translateY: rightPawY }, { rotate: '18deg' }],
              }}
            >
              <Svg width="24" height="22" viewBox="0 0 24 22">
                <Defs>
                  <LinearGradient id="pawWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor={coatColor} />
                    <Stop offset="100%" stopColor={isDark ? '#CBD5E1' : '#EFECE6'} />
                  </LinearGradient>
                </Defs>
                <Ellipse cx="12" cy="11" rx="8" ry="6.5" fill="url(#pawWaveGrad)" stroke={outlineColor} strokeWidth={outlineWidth * 0.85} />
                <Circle cx="8" cy="9" r="1.3" fill={earInner} />
                <Circle cx="12" cy="7.5" r="1.4" fill={earInner} />
                <Circle cx="16" cy="9" r="1.3" fill={earInner} />
                <Ellipse cx="12" cy="12.5" rx="3" ry="2" fill={earInner} />
              </Svg>
            </Animated.View>
          </>
        ) : pose === 'umbrella_hold' ? (
          <Svg width="120" height="108" viewBox="0 0 120 108" style={{ position: 'absolute', top: 0, left: 0 }}>
            <Defs>
              <LinearGradient id="pawUmbrellaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={coatColor} />
                <Stop offset="100%" stopColor={isDark ? '#CBD5E1' : '#EFECE6'} />
              </LinearGradient>
            </Defs>
            <Ellipse cx="48" cy="62" rx="5.5" ry="4.5" fill="url(#pawUmbrellaGrad)" stroke={outlineColor} strokeWidth={outlineWidth * 0.85} />
            <Ellipse cx="62" cy="90" rx="8" ry="6" fill="url(#pawUmbrellaGrad)" stroke={outlineColor} strokeWidth={outlineWidth * 0.85} />
            <Path d="M 59 88 Q 62 86.5 65 88" stroke="#FFFFFF" strokeWidth="0.9" strokeLinecap="round" opacity="0.6" fill="none" />
          </Svg>
        ) : pose === 'curl_sleep' ? (
          <Svg width="120" height="108" viewBox="0 0 120 108" style={{ position: 'absolute', top: 0, left: 0 }}>
            <Defs>
              <LinearGradient id="pawSleepGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={coatColor} />
                <Stop offset="100%" stopColor={isDark ? '#CBD5E1' : '#EFECE6'} />
              </LinearGradient>
            </Defs>
            <Ellipse cx="52" cy="88" rx="7.2" ry="5.2" fill="url(#pawSleepGrad)" stroke={outlineColor} strokeWidth={outlineWidth * 0.8} />
            <Ellipse cx="68" cy="88" rx="7.2" ry="5.2" fill="url(#pawSleepGrad)" stroke={outlineColor} strokeWidth={outlineWidth * 0.8} />
          </Svg>
        ) : (
          /* Natural Cozy Resting Front Paws (Plump Mochi Mittens with Grounding Shadows) */
          <Svg width="120" height="108" viewBox="0 0 120 108" style={{ position: 'absolute', top: 0, left: 0 }}>
            <Defs>
              <LinearGradient id="pawRestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={coatColor} />
                <Stop offset="100%" stopColor={isDark ? '#CBD5E1' : '#EFECE6'} />
              </LinearGradient>
              <RadialGradient id="pawShadowGrad" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor="#000000" stopOpacity="0.22" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            {/* Soft Contact Shadows Underneath Paws */}
            <Ellipse cx="47" cy="95.5" rx="8.5" ry="2.2" fill="url(#pawShadowGrad)" />
            <Ellipse cx="73" cy="95.5" rx="8.5" ry="2.2" fill="url(#pawShadowGrad)" />

            {/* Left Paw - Soft Plump Kitten Mitten */}
            <Ellipse cx="47" cy="91" rx="8.2" ry="6.2" fill="url(#pawRestGrad)" stroke={outlineColor} strokeWidth={outlineWidth * 0.85} />
            {/* Soft highlight curve on top of paw */}
            <Path d="M 42 88.5 Q 47 87 52 88.5" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.65" fill="none" />
            {/* Toe separator indents */}
            <Path d="M 44.5 89 Q 45 92.5 45 94.5 M 49.5 89 Q 49 92.5 49 94.5" stroke={outlineColor} strokeWidth="0.9" strokeLinecap="round" opacity="0.28" />

            {/* Right Paw - Soft Plump Kitten Mitten */}
            <Ellipse cx="73" cy="91" rx="8.2" ry="6.2" fill="url(#pawRestGrad)" stroke={outlineColor} strokeWidth={outlineWidth * 0.85} />
            {/* Soft highlight curve on top of paw */}
            <Path d="M 68 88.5 Q 73 87 78 88.5" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.65" fill="none" />
            {/* Toe separator indents */}
            <Path d="M 70.5 89 Q 71 92.5 71 94.5 M 75.5 89 Q 75 92.5 75 94.5" stroke={outlineColor} strokeWidth="0.9" strokeLinecap="round" opacity="0.28" />
          </Svg>
        )}
      </View>
    </View>
  );
});
