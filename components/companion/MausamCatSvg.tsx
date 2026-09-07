import React, { useEffect, useState } from 'react';
import { View, Animated } from 'react-native';
import Svg, { Path, Circle, Ellipse, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import {
  CompanionExpression,
  CompanionPose,
  CompanionAccessory,
  GazeTarget,
} from '../../lib/companion/companionBrain';

interface MausamCatSvgProps {
  expression: CompanionExpression;
  pose: CompanionPose;
  accessory: CompanionAccessory;
  gazeTarget?: GazeTarget;
  size?: number;
  isDark?: boolean;
}

export function MausamCatSvg({
  expression = 'neutral',
  pose = 'perch',
  accessory = 'none',
  gazeTarget = 'user',
  size = 110,
  isDark = false,
}: MausamCatSvgProps) {
  // Safe React 19 animated values
  const [tailAngle] = useState(() => new Animated.Value(0));
  const [headBob] = useState(() => new Animated.Value(0));
  const [headTilt] = useState(() => new Animated.Value(0));
  const [leftPawY] = useState(() => new Animated.Value(0));
  const [rightPawY] = useState(() => new Animated.Value(0));
  const [earTwitch] = useState(() => new Animated.Value(0));

  // Colors adapted for light/dark themes
  const coatColor = isDark ? '#E2E8F0' : '#FFFDF7';
  const earInner = '#FDA4AF';
  const outlineColor = isDark ? '#1E293B' : '#475569';
  const cheekColor = '#F472B6';
  const eyeColor = '#1E293B';
  const noseColor = '#F43F5E';

  // Dynamic animations based on pose
  useEffect(() => {
    // 1. Tail gentle swaying
    const tailLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(tailAngle, {
          toValue: pose === 'curl_sleep' ? -4 : 12,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(tailAngle, {
          toValue: pose === 'curl_sleep' ? -8 : -10,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    tailLoop.start();

    // 2. Head gentle breathing bob
    const headLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(headBob, {
          toValue: -2.5,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(headBob, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    headLoop.start();

    return () => {
      tailLoop.stop();
      headLoop.stop();
    };
  }, [pose, tailAngle, headBob]);

  // Paw animation for Bongo-tap or wave
  useEffect(() => {
    if (pose === 'bongo_tap') {
      const bongoLoop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(leftPawY, { toValue: -6, duration: 140, useNativeDriver: true }),
            Animated.timing(rightPawY, { toValue: 2, duration: 140, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(leftPawY, { toValue: 2, duration: 140, useNativeDriver: true }),
            Animated.timing(rightPawY, { toValue: -6, duration: 140, useNativeDriver: true }),
          ]),
        ])
      );
      bongoLoop.start();
      return () => bongoLoop.stop();
    } else if (pose === 'wave') {
      const waveLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(rightPawY, { toValue: -12, duration: 180, useNativeDriver: true }),
          Animated.timing(rightPawY, { toValue: -4, duration: 180, useNativeDriver: true }),
        ])
      );
      waveLoop.start();
      return () => waveLoop.stop();
    } else {
      leftPawY.setValue(0);
      rightPawY.setValue(0);
    }
  }, [pose, leftPawY, rightPawY]);

  // Ear twitch effect
  useEffect(() => {
    if (expression === 'curious' || expression === 'surprised') {
      Animated.sequence([
        Animated.timing(earTwitch, { toValue: -4, duration: 100, useNativeDriver: true }),
        Animated.timing(earTwitch, { toValue: 4, duration: 100, useNativeDriver: true }),
        Animated.timing(earTwitch, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  }, [expression, earTwitch]);

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

  useEffect(() => {
    Animated.timing(headTilt, {
      toValue: targetTilt,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [targetTilt, headTilt]);

  const tiltDeg = headTilt.interpolate({
    inputRange: [-10, 10],
    outputRange: ['-10deg', '10deg'],
  });

  const scale = size / 120;

  return (
    <View style={{ width: size, height: size * 0.9, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          width: 120,
          height: 108,
          transform: [{ scale }, { translateY: headBob }, { rotate: tiltDeg }],
        }}
      >
        <Svg width="120" height="108" viewBox="0 0 120 108">
          <Defs>
            <LinearGradient id="coatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={coatColor} />
              <Stop offset="100%" stopColor={isDark ? '#CBD5E1' : '#F5F2EB'} />
            </LinearGradient>
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
          </Defs>

          {/* PERCH LEDGE / AMBIENT SHADOW */}
          <Ellipse cx="60" cy="98" rx="38" ry="6" fill={isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'} />

          {/* ANIMATED TAIL */}
          <G transform={pose === 'curl_sleep' ? 'translate(28, 86) rotate(-20)' : 'translate(82, 82) rotate(15)'}>
            <Path
              d="M 0 0 C 14 -12 24 -4 20 10 C 18 18 8 16 4 8 Z"
              fill="url(#coatGrad)"
              stroke={outlineColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </G>

          {/* CAT BODY */}
          <Path
            d={
              pose === 'curl_sleep'
                ? 'M 30 92 C 26 70 42 60 60 60 C 78 60 94 70 90 92 C 86 98 34 98 30 92 Z'
                : 'M 34 94 C 32 64 42 56 60 56 C 78 56 88 64 86 94 C 84 98 36 98 34 94 Z'
            }
            fill="url(#coatGrad)"
            stroke={outlineColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* LEFT EAR */}
          <Path
            d={
              expression === 'startled'
                ? 'M 38 42 L 20 48 L 44 50 Z' // Folded back
                : 'M 36 40 L 30 18 L 50 32 Z' // Upright perked
            }
            fill="url(#coatGrad)"
            stroke={outlineColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {expression !== 'startled' && (
            <Path d="M 36 36 L 33 24 L 46 32 Z" fill={earInner} />
          )}

          {/* RIGHT EAR */}
          <Path
            d={
              expression === 'startled'
                ? 'M 82 42 L 100 48 L 76 50 Z'
                : 'M 84 40 L 90 18 L 70 32 Z'
            }
            fill="url(#coatGrad)"
            stroke={outlineColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {expression !== 'startled' && (
            <Path d="M 84 36 L 87 24 L 74 32 Z" fill={earInner} />
          )}

          {/* HEAD */}
          <Ellipse
            cx="60"
            cy="46"
            rx="27"
            ry="23"
            fill="url(#coatGrad)"
            stroke={outlineColor}
            strokeWidth="2.5"
          />

          {/* ROSY BLUSH CHEEKS */}
          <Circle cx="41" cy="53" r="4.5" fill={cheekColor} opacity="0.4" />
          <Circle cx="79" cy="53" r="4.5" fill={cheekColor} opacity="0.4" />

          {/* EYES */}
          {expression === 'happy' || expression === 'blissful' ? (
            // Happy crescent arcs ^_^
            <G>
              <Path d="M 44 45 Q 50 38 56 45" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <Path d="M 64 45 Q 70 38 76 45" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
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
              <Ellipse cx={50 + eyeDx} cy={46 + eyeDy} rx="4" ry="2.5" fill={eyeColor} />
              <Ellipse cx={70 + eyeDx} cy={46 + eyeDy} rx="4" ry="2.5" fill={eyeColor} />
            </G>
          ) : expression === 'surprised' || expression === 'startled' ? (
            // Wide surprised pupils O_O
            <G>
              <Circle cx={50 + eyeDx} cy={44 + eyeDy} r="5" fill={eyeColor} />
              <Circle cx={48.5 + eyeDx} cy={42.5 + eyeDy} r="1.5" fill="#FFFFFF" />
              <Circle cx={70 + eyeDx} cy={44 + eyeDy} r="5" fill={eyeColor} />
              <Circle cx={68.5 + eyeDx} cy={42.5 + eyeDy} r="1.5" fill="#FFFFFF" />
            </G>
          ) : expression === 'annoyed' ? (
            // Mildly annoyed sideways glance
            <G>
              <Path d="M 45 42 L 55 45" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" />
              <Path d="M 75 42 L 65 45" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" />
            </G>
          ) : expression === 'curious' ? (
            // Inquisitive gaze directed by gazeTarget
            <G>
              <Circle cx={49 + eyeDx} cy={44 + eyeDy} r="4.2" fill={eyeColor} />
              <Circle cx={47.5 + eyeDx} cy={43 + eyeDy} r="1.3" fill="#FFFFFF" />
              <Circle cx={69 + eyeDx} cy={44 + eyeDy} r="4.2" fill={eyeColor} />
              <Circle cx={67.5 + eyeDx} cy={43 + eyeDy} r="1.3" fill="#FFFFFF" />
            </G>
          ) : (
            // Neutral relaxed eyes
            <G>
              <Circle cx={50 + eyeDx} cy={45 + eyeDy} r="4" fill={eyeColor} />
              <Circle cx={48.5 + eyeDx} cy={43.5 + eyeDy} r="1.2" fill="#FFFFFF" />
              <Circle cx={70 + eyeDx} cy={45 + eyeDy} r="4" fill={eyeColor} />
              <Circle cx={68.5 + eyeDx} cy={43.5 + eyeDy} r="1.2" fill="#FFFFFF" />
            </G>
          )}

          {/* NOSE & MUZZLE */}
          <Path d="M 58 50 L 62 50 L 60 52 Z" fill={noseColor} />
          {expression === 'happy' ? (
            <Path d="M 55 53 Q 60 58 65 53" stroke={outlineColor} strokeWidth="1.8" strokeLinecap="round" fill="none" />
          ) : expression === 'surprised' ? (
            <Circle cx="60" cy="55" r="2" stroke={outlineColor} strokeWidth="1.6" fill="none" />
          ) : (
            // Classic 'w' cat mouth
            <G>
              <Path d="M 56 52 Q 58 55 60 52" stroke={outlineColor} strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <Path d="M 60 52 Q 62 55 64 52" stroke={outlineColor} strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </G>
          )}

          {/* WHISKERS */}
          <Path d="M 36 50 L 26 48 M 36 53 L 25 54" stroke={outlineColor} strokeWidth="1.4" strokeLinecap="round" />
          <Path d="M 84 50 L 94 48 M 84 53 L 95 54" stroke={outlineColor} strokeWidth="1.4" strokeLinecap="round" />

          {/* ACCESSORIES */}
          {accessory === 'scarf' && (
            <G>
              <Path
                d="M 40 64 Q 60 70 80 64 Q 82 72 60 74 Q 38 72 40 64 Z"
                fill="url(#scarfGrad)"
                stroke="#B91C1C"
                strokeWidth="1.5"
              />
              <Path d="M 68 68 L 72 82 L 78 81 L 74 67 Z" fill="url(#scarfGrad)" stroke="#B91C1C" strokeWidth="1.5" />
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
              {/* Umbrella canopy */}
              <Path
                d="M 8 36 Q 30 8 52 36 Q 41 33 30 36 Q 19 33 8 36 Z"
                fill="url(#umbrellaGrad)"
                stroke="#0369A1"
                strokeWidth="1.5"
              />
              {/* Umbrella stick */}
              <Path d="M 30 36 L 30 64 Q 30 68 26 68" stroke="#64748B" strokeWidth="2" strokeLinecap="round" fill="none" />
            </G>
          )}

          {accessory === 'fan' && (
            <G transform="translate(78, 64) rotate(-15)">
              <Path d="M 0 0 L 16 -12 Q 24 -4 18 10 Z" fill="#F472B6" stroke="#DB2777" strokeWidth="1.2" />
              <Path d="M 0 0 L 18 2" stroke="#9D174D" strokeWidth="1" />
            </G>
          )}

          {(accessory === 'eye_mask' || accessory === 'sleeping_cap') && (
            <G>
              {/* Mask Elastic Strap wrapping behind ears */}
              <Path
                d="M 37 46 Q 32 44 28 42 M 83 46 Q 88 44 92 42"
                stroke="#3730A3"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Contoured Silk Sleeping Eye Mask Cushion */}
              <Path
                d="M 37 45 C 34 37 47 36 54 40 C 57 42 60 42 63 40 C 70 36 83 37 80 45 C 83 53 71 55 64 50 C 61 48 59 48 56 50 C 46 55 34 53 37 45 Z"
                fill="url(#maskGrad)"
                stroke="#312E81"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />

              {/* Soft Satin Silk Specular Sheen */}
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

              {/* Left Embroidered Sleeping Eyelashes (Golden Silk) */}
              <Path
                d="M 45 46 Q 49 49 53 46"
                stroke="#FEF08A"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
              <Path d="M 47 48 L 46 50.5" stroke="#FEF08A" strokeWidth="1.3" strokeLinecap="round" />
              <Path d="M 51 48 L 52 50.5" stroke="#FEF08A" strokeWidth="1.3" strokeLinecap="round" />

              {/* Right Embroidered Sleeping Eyelashes (Golden Silk) */}
              <Path
                d="M 67 46 Q 71 49 75 46"
                stroke="#FEF08A"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
              <Path d="M 69 48 L 68 50.5" stroke="#FEF08A" strokeWidth="1.3" strokeLinecap="round" />
              <Path d="M 73 48 L 74 50.5" stroke="#FEF08A" strokeWidth="1.3" strokeLinecap="round" />

              {/* Golden Crescent Moon Bridge Motif */}
              <Path
                d="M 59.2 38.8 A 2.2 2.2 0 0 0 61.2 42.2 A 1.8 1.8 0 0 1 59.2 38.8 Z"
                fill="#FDE047"
              />
            </G>
          )}

          {/* FRONT PAWS (RESPONSIVE BONGO PAWS) */}
          {pose === 'umbrella_hold' ? (
            <G>
              <Ellipse cx="48" cy="62" rx="5" ry="4" fill={coatColor} stroke={outlineColor} strokeWidth="2" />
              <Ellipse cx="58" cy="88" rx="7" ry="5" fill={coatColor} stroke={outlineColor} strokeWidth="2" />
            </G>
          ) : pose === 'curl_sleep' ? (
            <G>
              <Ellipse cx="52" cy="88" rx="6" ry="4.5" fill={coatColor} stroke={outlineColor} strokeWidth="1.8" />
              <Ellipse cx="66" cy="88" rx="6" ry="4.5" fill={coatColor} stroke={outlineColor} strokeWidth="1.8" />
            </G>
          ) : (
            // Resting or Bongo-Tapping Paws
            <G>
              <Ellipse cx="46" cy="91" rx="6.5" ry="5" fill={coatColor} stroke={outlineColor} strokeWidth="2" />
              <Ellipse cx="74" cy="91" rx="6.5" ry="5" fill={coatColor} stroke={outlineColor} strokeWidth="2" />
            </G>
          )}
        </Svg>
      </Animated.View>
    </View>
  );
}
