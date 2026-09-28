'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
  className?: string;
  onClick?: () => void;
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
  className = '',
  onClick,
}: MausamCatSvgProps) {
  // Natural multi-mode blinking (single, double, sleepy-slow)
  const [isBlinking, setIsBlinking] = useState(false);
  const [earTwitch, setEarTwitch] = useState<'none' | 'left' | 'right'>('none');

  useEffect(() => {
    if (!animationsEnabled || expression === 'sleeping') {
      setIsBlinking(false);
      return;
    }

    let timerId: NodeJS.Timeout | null = null;
    let isCancelled = false;

    const scheduleNextBlink = () => {
      if (isCancelled) return;
      let delay = Math.floor(3200 + Math.random() * 3600);
      if (expression === 'sleepy') {
        delay = Math.floor(2000 + Math.random() * 2200);
      } else if (expression === 'happy' || expression === 'surprised') {
        delay = Math.floor(4000 + Math.random() * 3200);
      }

      timerId = setTimeout(() => {
        if (isCancelled) return;
        const roll = Math.random();

        if (expression === 'sleepy' || roll < 0.16) {
          // Slow sleepy blink
          setIsBlinking(true);
          setTimeout(() => {
            if (!isCancelled) setIsBlinking(false);
            scheduleNextBlink();
          }, 280);
        } else if (roll < 0.36) {
          // Double flutter blink
          setIsBlinking(true);
          setTimeout(() => {
            if (isCancelled) return;
            setIsBlinking(false);
            setTimeout(() => {
              if (isCancelled) return;
              setIsBlinking(true);
              setTimeout(() => {
                if (!isCancelled) setIsBlinking(false);
                scheduleNextBlink();
              }, 120);
            }, 80);
          }, 110);
        } else {
          // Standard natural blink
          setIsBlinking(true);
          setTimeout(() => {
            if (!isCancelled) setIsBlinking(false);
            scheduleNextBlink();
          }, 140);
        }
      }, delay);
    };

    scheduleNextBlink();
    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [animationsEnabled, expression]);

  // Occasional playful ear twitch
  useEffect(() => {
    if (!animationsEnabled || expression === 'sleeping') return;
    const interval = setInterval(() => {
      const side = Math.random() > 0.5 ? 'left' : 'right';
      setEarTwitch(side);
      setTimeout(() => setEarTwitch('none'), 220);
    }, 4500);
    return () => clearInterval(interval);
  }, [animationsEnabled, expression]);

  // Theme-driven palette
  const coatColor = themeStyle?.coatColor ?? (isDark ? '#E2E8F0' : '#FFFDF7');
  const earInner = themeStyle?.earInnerColor ?? '#FDA4AF';
  const outlineColor = themeStyle?.outlineColor ?? (isDark ? '#1E293B' : '#334155');
  const outlineWidth = themeStyle?.outlineWidth ?? 2.4;
  const cheekColor = themeStyle?.cheekColor ?? '#FDA4AF';
  const eyeColor = themeStyle?.eyeColor ?? (isDark ? '#0F172A' : '#1E293B');
  const noseColor = themeStyle?.noseColor ?? '#FB7185';
  const auraGlow = themeStyle?.auraGlowColor;

  // Gaze offsets
  const { eyeDx, eyeDy, tiltDeg } = useMemo(() => {
    switch (gazeTarget) {
      case 'left':
        return { eyeDx: -2.8, eyeDy: 0, tiltDeg: -3.5 };
      case 'right':
        return { eyeDx: 2.8, eyeDy: 0, tiltDeg: 3.5 };
      case 'up':
        return { eyeDx: 0, eyeDy: -2.6, tiltDeg: -1.5 };
      case 'down':
        return { eyeDx: 0, eyeDy: 2.6, tiltDeg: 1.5 };
      default:
        return { eyeDx: 0, eyeDy: 0, tiltDeg: 0 };
    }
  }, [gazeTarget]);

  const scale = size / 120;

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer transition-transform duration-200 active:scale-95 ${className}`}
      style={{
        width: size,
        height: size * 0.9,
      }}
    >
      <style jsx>{`
        @keyframes mimiBreathe {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.028); }
        }
        @keyframes mimiHeadBob {
          0%, 100% { transform: translateY(0px) rotate(${tiltDeg}deg); }
          50% { transform: translateY(-2.8px) rotate(${tiltDeg}deg); }
        }
        @keyframes mimiTailSway {
          0%, 100% { transform: rotate(14deg); }
          50% { transform: rotate(-12deg); }
        }
        @keyframes mimiTailSleep {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(-9deg); }
        }
        @keyframes mimiTailFast {
          0%, 100% { transform: rotate(18deg); }
          50% { transform: rotate(-16deg); }
        }
        @keyframes mimiBongoLeft {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes mimiBongoRight {
          0%, 100% { transform: translateY(-8px); }
          50% { transform: translateY(0px); }
        }
        @keyframes mimiWave {
          0%, 100% { transform: translateY(-14px) rotate(18deg); }
          50% { transform: translateY(-4px) rotate(18deg); }
        }
        @keyframes mimiNoteFloat1 {
          0% { transform: translateY(0px) rotate(-12deg); opacity: 0; }
          40% { opacity: 1; }
          100% { transform: translateY(-20px) rotate(-12deg); opacity: 0; }
        }
        @keyframes mimiNoteFloat2 {
          0% { transform: translateY(0px) rotate(12deg); opacity: 0; }
          40% { opacity: 1; }
          100% { transform: translateY(-24px) rotate(12deg); opacity: 0; }
        }
      `}</style>

      <div
        className="relative"
        style={{
          width: 120,
          height: 108,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* 1. BASE LAYER: Soft Aura Ambient Glow & Contact Pedestal Grounding Shadow */}
        <svg
          width="120"
          height="108"
          viewBox="0 0 120 108"
          className="absolute top-0 left-0 pointer-events-none"
        >
          <defs>
            <linearGradient id="mimiCoatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={coatColor} />
              <stop offset="100%" stopColor={isDark ? '#CBD5E1' : '#EFECE6'} />
            </linearGradient>
            <linearGradient id="mimiBibGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor={isDark ? '#E2E8F0' : '#FFFDF9'} />
            </linearGradient>
            <radialGradient id="mimiBlushGrad" cx="50%" cy="50%" rx="50%" ry="50%">
              <stop offset="0%" stopColor={cheekColor} stopOpacity="0.6" />
              <stop offset="100%" stopColor={cheekColor} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="mimiAuraRadial" cx="50%" cy="50%" rx="50%" ry="50%">
              <stop offset="0%" stopColor={auraGlow || '#38BDF8'} stopOpacity="0.22" />
              <stop offset="80%" stopColor={auraGlow || '#38BDF8'} stopOpacity="0.06" />
              <stop offset="100%" stopColor={auraGlow || '#38BDF8'} stopOpacity="0" />
            </radialGradient>
            <linearGradient id="mimiBellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="40%" stopColor="#FBBF24" />
              <stop offset="85%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
            <linearGradient id="mimiCollarRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E11D48" />
              <stop offset="50%" stopColor="#FB7185" />
              <stop offset="100%" stopColor="#BE123C" />
            </linearGradient>
            <linearGradient id="mimiUmbrellaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="mimiScarfGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="50%" stopColor="#F87171" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
            <linearGradient id="mimiStrawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
            <linearGradient id="mimiMaskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
            <radialGradient id="mimiPawShadowGrad" cx="50%" cy="50%" rx="50%" ry="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Soft Aura Ambient Glow */}
          {auraGlow && auraGlow !== 'transparent' && (
            <ellipse cx="60" cy="54" rx="46" ry="40" fill="url(#mimiAuraRadial)" />
          )}

          {/* Contact Pedestal Grounding Shadow */}
          <ellipse
            cx="60"
            cy="99"
            rx="40"
            ry="6"
            fill={isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.09)'}
          />
        </svg>

        {/* 2. TAIL LAYER (Fluffy S-Curve Tail with Dynamic Sway) */}
        <div
          className="absolute"
          style={{
            left: pose === 'curl_sleep' ? 14 : 76,
            top: pose === 'curl_sleep' ? 74 : 64,
            width: 40,
            height: 42,
            transformOrigin: '6px 32px',
            animation: animationsEnabled
              ? pose === 'curl_sleep'
                ? 'mimiTailSleep 2.4s ease-in-out infinite'
                : pose === 'bongo_tap' || pose === 'wave' || expression === 'happy'
                ? 'mimiTailFast 0.8s ease-in-out infinite'
                : 'mimiTailSway 1.8s ease-in-out infinite'
              : undefined,
          }}
        >
          <svg width="40" height="42" viewBox="0 0 40 42">
            <path
              d="M 6 32 C 14 20 28 14 34 22 C 38 28 32 36 24 36 C 14 36 8 34 6 32 Z"
              fill="url(#mimiCoatGrad)"
              stroke={outlineColor}
              strokeWidth={outlineWidth * 0.9}
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 3. CAT BODY LAYER (Breathing Squash & Stretch + Fluffy Chest Fur Bib) */}
        <div
          className="absolute top-0 left-0 w-[120px] h-[108px]"
          style={{
            transformOrigin: '60px 94px',
            animation: animationsEnabled ? 'mimiBreathe 3.2s ease-in-out infinite' : undefined,
          }}
        >
          <svg width="120" height="108" viewBox="0 0 120 108">
            <path
              d={
                pose === 'curl_sleep'
                  ? 'M 28 92 C 24 68 42 58 60 58 C 78 58 96 68 92 92 C 88 98 32 98 28 92 Z'
                  : 'M 33 94 C 29 70 38 56 60 56 C 82 56 91 70 87 94 C 85 98 35 98 33 94 Z'
              }
              fill="url(#mimiCoatGrad)"
              stroke={outlineColor}
              strokeWidth={outlineWidth}
              strokeLinejoin="round"
            />
            {/* Fluffy Mochi Chest Fur Bib */}
            {pose !== 'curl_sleep' && (
              <path
                d="M 49 63 C 49 76 71 76 71 63 C 67 69 63 69 60 65 C 57 69 53 69 49 63 Z"
                fill="url(#mimiBibGrad)"
                stroke={outlineColor}
                strokeWidth={0.8}
                opacity={0.9}
              />
            )}
          </svg>
        </div>

        {/* 4. HEAD & FACE LAYER (Mochi Cheeks + Blinking Anime Eyes + Twitches) */}
        <div
          className="absolute top-0 left-0 w-[120px] h-[108px]"
          style={{
            transformOrigin: '60px 60px',
            animation: animationsEnabled ? 'mimiHeadBob 3.2s ease-in-out infinite' : `rotate(${tiltDeg}deg)`,
          }}
        >
          {/* Left Twitching Ear */}
          <div
            className="absolute left-[20px] top-[10px] w-[34px] h-[40px] transition-transform duration-150"
            style={{
              transformOrigin: '20px 30px',
              transform: earTwitch === 'left' ? 'rotate(-9deg)' : 'rotate(0deg)',
            }}
          >
            <svg width="34" height="40" viewBox="0 0 34 40">
              <path
                d={
                  expression === 'startled' || expression === 'worried'
                    ? 'M 20 30 L 2 35 L 26 38 Z'
                    : 'M 18 30 C 12 26 7 12 13 6 C 21 4 28 17 28 28 Z'
                }
                fill="url(#mimiCoatGrad)"
                stroke={outlineColor}
                strokeWidth={outlineWidth}
                strokeLinejoin="round"
              />
              {expression !== 'startled' && expression !== 'worried' && (
                <>
                  <path
                    d="M 17 26 C 13 22 11 13 15 10 C 20 9 24 17 25 24 Z"
                    fill={earInner}
                  />
                  {/* Fluffy Kitten Ear Tufts */}
                  <path
                    d="M 22 27 C 18 24 15 19 18 16 C 19 19 23 22 26 24 Z"
                    fill="#FFFFFF"
                    opacity={isDark ? 0.45 : 0.8}
                  />
                </>
              )}
            </svg>
          </div>

          {/* Right Twitching Ear */}
          <div
            className="absolute left-[66px] top-[10px] w-[34px] h-[40px] transition-transform duration-150"
            style={{
              transformOrigin: '14px 30px',
              transform: earTwitch === 'right' ? 'rotate(9deg)' : 'rotate(0deg)',
            }}
          >
            <svg width="34" height="40" viewBox="0 0 34 40">
              <path
                d={
                  expression === 'startled' || expression === 'worried'
                    ? 'M 14 30 L 32 35 L 8 38 Z'
                    : 'M 16 30 C 22 26 27 12 21 6 C 13 4 6 17 6 28 Z'
                }
                fill="url(#mimiCoatGrad)"
                stroke={outlineColor}
                strokeWidth={outlineWidth}
                strokeLinejoin="round"
              />
              {expression !== 'startled' && expression !== 'worried' && (
                <>
                  <path
                    d="M 17 26 C 21 22 23 13 19 10 C 14 9 10 17 9 24 Z"
                    fill={earInner}
                  />
                  {/* Fluffy Kitten Ear Tufts */}
                  <path
                    d="M 12 27 C 16 24 19 19 16 16 C 15 19 11 22 8 24 Z"
                    fill="#FFFFFF"
                    opacity={isDark ? 0.45 : 0.8}
                  />
                </>
              )}
            </svg>
          </div>

          {/* Head & Facial Features SVG */}
          <svg width="120" height="108" viewBox="0 0 120 108" className="absolute top-0 left-0">
            {/* CHUBBY MOCHI KAWAII HEAD SHAPE */}
            <path
              d="M 32 46 C 30 58 44 64 60 64 C 76 64 90 58 88 46 C 86 32 74 26 60 26 C 46 26 34 32 32 46 Z"
              fill="url(#mimiCoatGrad)"
              stroke={outlineColor}
              strokeWidth={outlineWidth}
              strokeLinejoin="round"
            />

            {/* SOFT MOCHI FOREHEAD HIGHLIGHT */}
            <path
              d="M 56 31 Q 60 33.5 64 31"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.45"
              fill="none"
            />

            {/* SOFT AIRBRUSHED ROSY CHEEKS WITH SPARKLE DOTS */}
            <ellipse cx="41" cy="51" rx="6.5" ry="4.5" fill="url(#mimiBlushGrad)" />
            <ellipse cx="79" cy="51" rx="6.5" ry="4.5" fill="url(#mimiBlushGrad)" />
            <circle cx="40" cy="50" r="0.9" fill="#FFFFFF" opacity="0.9" />
            <circle cx="78" cy="50" r="0.9" fill="#FFFFFF" opacity="0.9" />

            {/* EYES (With Blinking & Anime Sparkle Highlights) */}
            {isBlinking && expression !== 'sleeping' && expression !== 'sleepy' ? (
              <g>
                <path d="M 44 45 Q 50 49 56 45" stroke={eyeColor} strokeWidth="2.6" strokeLinecap="round" fill="none" />
                <path d="M 64 45 Q 70 49 76 45" stroke={eyeColor} strokeWidth="2.6" strokeLinecap="round" fill="none" />
              </g>
            ) : expression === 'happy' || expression === 'blissful' ? (
              <g>
                <path d="M 44 46 Q 50 39 56 46" stroke={eyeColor} strokeWidth="2.8" strokeLinecap="round" fill="none" />
                <path d="M 64 46 Q 70 39 76 46" stroke={eyeColor} strokeWidth="2.8" strokeLinecap="round" fill="none" />
              </g>
            ) : expression === 'playful' ? (
              <g>
                <path d="M 44 45 L 56 45" stroke={eyeColor} strokeWidth="2.6" strokeLinecap="round" />
                <ellipse cx={70} cy={44} rx="4.6" ry="5.2" fill={eyeColor} />
                <circle cx={68.2} cy={42.2} r="1.8" fill="#FFFFFF" />
                <circle cx={71.6} cy={45.8} r="0.9" fill="#FFFFFF" opacity="0.85" />
              </g>
            ) : expression === 'sleeping' ? (
              <g>
                <path d="M 44 46 Q 50 48 56 46" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M 64 46 Q 70 48 76 46" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </g>
            ) : expression === 'sleepy' ? (
              <g>
                <ellipse cx={50 + eyeDx} cy={46 + eyeDy} rx="4.2" ry="2.6" fill={eyeColor} />
                <ellipse cx={70 + eyeDx} cy={46 + eyeDy} rx="4.2" ry="2.6" fill={eyeColor} />
              </g>
            ) : expression === 'surprised' || expression === 'startled' ? (
              <g>
                <circle cx={50 + eyeDx} cy={44 + eyeDy} r="5.4" fill={eyeColor} />
                <circle cx={48.2 + eyeDx} cy={42.2 + eyeDy} r="2" fill="#FFFFFF" />
                <circle cx={51.8 + eyeDx} cy={46.2 + eyeDy} r="1" fill="#FFFFFF" opacity="0.85" />
                <circle cx={70 + eyeDx} cy={44 + eyeDy} r="5.4" fill={eyeColor} />
                <circle cx={68.2 + eyeDx} cy={42.2 + eyeDy} r="2" fill="#FFFFFF" />
                <circle cx={71.8 + eyeDx} cy={46.2 + eyeDy} r="1" fill="#FFFFFF" opacity="0.85" />
              </g>
            ) : expression === 'worried' ? (
              <g>
                <ellipse cx={50 + eyeDx} cy={45 + eyeDy} rx="4.4" ry="4.8" fill={eyeColor} />
                <circle cx={48.4 + eyeDx} cy={43.4 + eyeDy} r="1.5" fill="#FFFFFF" />
                <ellipse cx={70 + eyeDx} cy={45 + eyeDy} rx="4.4" ry="4.8" fill={eyeColor} />
                <circle cx={68.4 + eyeDx} cy={43.4 + eyeDy} r="1.5" fill="#FFFFFF" />
                <path d="M 45 39 L 53 37" stroke={eyeColor} strokeWidth="1.8" strokeLinecap="round" />
                <path d="M 75 39 L 67 37" stroke={eyeColor} strokeWidth="1.8" strokeLinecap="round" />
              </g>
            ) : (
              // Soulful anime eyes with triple sparkle catchlights & iris specular arc
              <g>
                <ellipse cx={50 + eyeDx} cy={44 + eyeDy} rx="4.6" ry="5.2" fill={eyeColor} />
                <path
                  d={`M ${47.2 + eyeDx} ${45.8 + eyeDy} Q ${50 + eyeDx} ${48.2 + eyeDy} ${52.8 + eyeDx} ${45.8 + eyeDy}`}
                  stroke="rgba(255, 255, 255, 0.42)"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx={48.2 + eyeDx} cy={42.2 + eyeDy} r="1.85" fill="#FFFFFF" />
                <circle cx={51.8 + eyeDx} cy={45.8 + eyeDy} r="0.95" fill="#FFFFFF" opacity="0.9" />
                <circle cx={52 + eyeDx} cy={42.8 + eyeDy} r="0.5" fill="#FFFFFF" opacity="0.85" />

                <ellipse cx={70 + eyeDx} cy={44 + eyeDy} rx="4.6" ry="5.2" fill={eyeColor} />
                <path
                  d={`M ${67.2 + eyeDx} ${45.8 + eyeDy} Q ${70 + eyeDx} ${48.2 + eyeDy} ${72.8 + eyeDx} ${45.8 + eyeDy}`}
                  stroke="rgba(255, 255, 255, 0.42)"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx={68.2 + eyeDx} cy={42.2 + eyeDy} r="1.85" fill="#FFFFFF" />
                <circle cx={71.8 + eyeDx} cy={45.8 + eyeDy} r="0.95" fill="#FFFFFF" opacity="0.9" />
                <circle cx={72 + eyeDx} cy={42.8 + eyeDy} r="0.5" fill="#FFFFFF" opacity="0.85" />
              </g>
            )}

            {/* CUTE INVERTED PINK TRIANGLE NOSE */}
            <path
              d="M 58.5 48 L 61.5 48 C 61.5 48 60 50.5 60 50.5 C 60 50.5 58.5 48 58.5 48 Z"
              fill={noseColor}
            />

            {/* ADORABLE ':3' MOUTH (With Pink Tongue for Bongo / Happy) */}
            {pose === 'bongo_tap' || expression === 'happy' || expression === 'playful' ? (
              <g>
                <path d="M 55 51 C 55 58 65 58 65 51 Z" fill="#E11D48" />
                <path d="M 57 53.5 C 57 57.5 63 57.5 63 53.5 Z" fill="#FDA4AF" />
                <path
                  d="M 54 50.5 Q 57 53 60 50.5 Q 63 53 66 50.5"
                  stroke={outlineColor}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            ) : expression === 'surprised' || expression === 'worried' ? (
              <circle cx="60" cy="54" r="2" stroke={outlineColor} strokeWidth="1.6" fill="none" />
            ) : (
              <g>
                <path
                  d="M 56 50.5 Q 58 53.5 60 50.5"
                  stroke={outlineColor}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 60 50.5 Q 62 53.5 64 50.5"
                  stroke={outlineColor}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}

            {/* DELICATE NATURAL CURVED WHISKERS */}
            <path d="M 36 49 Q 25 46 22 47" stroke={outlineColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
            <path d="M 36 53 Q 26 53 23 55" stroke={outlineColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
            <path d="M 84 49 Q 95 46 98 47" stroke={outlineColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
            <path d="M 84 53 Q 94 53 97 55" stroke={outlineColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />

            {/* SIGNATURE MASCOT BELL COLLAR (When not wearing scarf) */}
            {accessory !== 'scarf' && (
              <g>
                {/* Delicate Ribbon Band Hugging Neck */}
                <path
                  d="M 44 63 Q 60 68.5 76 63"
                  stroke="url(#mimiCollarRibbon)"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Golden Mascot Bell */}
                <circle cx="60" cy="65.8" r="3.4" fill="url(#mimiBellGrad)" stroke="#78350F" strokeWidth="0.75" />
                {/* Specular Shine */}
                <circle cx="59.1" cy="64.5" r="0.95" fill="#FFFFFF" opacity="0.85" />
                {/* Seam & Hole */}
                <path d="M 58 67 L 62 67" stroke="#78350F" strokeWidth="0.65" strokeLinecap="round" />
                <circle cx="60" cy="67.5" r="0.45" fill="#451A03" />
              </g>
            )}

            {/* ACCESSORY: WINTER SCARF */}
            {accessory === 'scarf' && (
              <g>
                <path
                  d="M 40 64 Q 60 70 80 64 Q 82 72 60 74 Q 38 72 40 64 Z"
                  fill="url(#mimiScarfGrad)"
                  stroke="#B91C1C"
                  strokeWidth="1.5"
                />
                <path d="M 68 68 L 72 82 L 78 81 L 74 67 Z" fill="url(#mimiScarfGrad)" stroke="#B91C1C" strokeWidth="1.5" />
              </g>
            )}

            {/* ACCESSORY: SUNGLASSES */}
            {accessory === 'sunglasses' && (
              <g>
                <path d="M 42 41 L 57 41 L 55 49 L 44 49 Z" fill="#0F172A" />
                <path d="M 63 41 L 78 41 L 76 49 L 65 49 Z" fill="#0F172A" />
                <path d="M 57 44 L 63 44" stroke="#0F172A" strokeWidth="2.5" />
                <path d="M 45 43 L 53 43" stroke="rgba(255,255,255,0.7)" strokeWidth="1" strokeLinecap="round" />
                <path d="M 66 43 L 74 43" stroke="rgba(255,255,255,0.7)" strokeWidth="1" strokeLinecap="round" />
              </g>
            )}

            {/* ACCESSORY: UMBRELLA */}
            {accessory === 'umbrella' && (
              <g transform="translate(18, 6)">
                <path
                  d="M 8 36 Q 30 8 52 36 Q 41 33 30 36 Q 19 33 8 36 Z"
                  fill="url(#mimiUmbrellaGrad)"
                  stroke="#0369A1"
                  strokeWidth="1.5"
                />
                <path d="M 30 36 L 30 64 Q 30 68 26 68" stroke="#64748B" strokeWidth="2" strokeLinecap="round" fill="none" />
              </g>
            )}

            {/* ACCESSORY: STRAW HAT */}
            {accessory === 'straw_hat' && (
              <g transform="translate(32, 16)">
                <ellipse cx="28" cy="18" rx="26" ry="6" fill="url(#mimiStrawGrad)" stroke="#854D0E" strokeWidth="1.2" />
                <path d="M 16 17 C 16 8 40 8 40 17 Z" fill="url(#mimiStrawGrad)" stroke="#854D0E" strokeWidth="1.2" />
                <path d="M 17 16 Q 28 18 39 16" stroke="#DC2626" strokeWidth="2" />
              </g>
            )}

            {/* ACCESSORY: SPORTS HEADBAND */}
            {accessory === 'sports_headband' && (
              <g transform="translate(36, 32)">
                <path d="M 0 4 Q 24 8 48 4 Q 48 9 24 12 Q 0 9 0 4 Z" fill="#EA580C" stroke="#9A3412" strokeWidth="1" />
                <path d="M 2 5 Q 24 9 46 5" stroke="#FFFFFF" strokeWidth="1.2" />
              </g>
            )}

            {/* ACCESSORY: SLEEP MASK */}
            {(accessory === 'eye_mask' || accessory === 'sleeping_cap') && (
              <g>
                <path
                  d="M 37 46 Q 32 44 28 42 M 83 46 Q 88 44 92 42"
                  stroke="#3730A3"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M 37 45 C 34 37 47 36 54 40 C 57 42 60 42 63 40 C 70 36 83 37 80 45 C 83 53 71 55 64 50 C 61 48 59 48 56 50 C 46 55 34 53 37 45 Z"
                  fill="url(#mimiMaskGrad)"
                  stroke="#312E81"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path d="M 45 46 Q 49 49 53 46" stroke="#FEF08A" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                <path d="M 67 46 Q 71 49 75 46" stroke="#FEF08A" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                <path d="M 59.2 38.8 A 2.2 2.2 0 0 0 61.2 42.2 A 1.8 1.8 0 0 1 59.2 38.8 Z" fill="#FDE047" />
              </g>
            )}
          </svg>
        </div>

        {/* 5. FRONT STAGE: BONGO DRUMS / WAVING PAW / RESTING PAWS */}
        {pose === 'bongo_tap' ? (
          <>
            {/* MINIATURE CHERRYWOOD BONGO DRUMS */}
            <svg width="120" height="108" viewBox="0 0 120 108" className="absolute top-0 left-0 pointer-events-none">
              <defs>
                <linearGradient id="mimiBongoWood" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D97706" />
                  <stop offset="50%" stopColor="#B45309" />
                  <stop offset="100%" stopColor="#78350F" />
                </linearGradient>
                <linearGradient id="mimiBongoRim" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FDE047" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
                <linearGradient id="mimiBongoSkin" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFBEB" />
                  <stop offset="100%" stopColor="#FDE68A" />
                </linearGradient>
              </defs>
              <rect x="48" y="87" width="14" height="4" rx="1.5" fill="#78350F" stroke="#451A03" strokeWidth="0.8" />
              {/* Left Bongo */}
              <g>
                <path d="M 32 84 L 34 96 C 34 99 48 99 48 96 L 50 84 Z" fill="url(#mimiBongoWood)" stroke="#78350F" strokeWidth="1" />
                <line x1="35" y1="86" x2="36" y2="94" stroke="#FDE047" strokeWidth="1.2" />
                <line x1="47" y1="86" x2="46" y2="94" stroke="#FDE047" strokeWidth="1.2" />
                <ellipse cx="41" cy="84" rx="9" ry="3.2" fill="url(#mimiBongoRim)" stroke="#92400E" strokeWidth="0.8" />
                <ellipse cx="41" cy="84" rx="7.6" ry="2.4" fill="url(#mimiBongoSkin)" stroke="#CA8A04" strokeWidth="0.6" />
              </g>
              {/* Right Bongo */}
              <g>
                <path d="M 60 84 L 62 96 C 62 99 76 99 76 96 L 78 84 Z" fill="url(#mimiBongoWood)" stroke="#78350F" strokeWidth="1" />
                <line x1="63" y1="86" x2="64" y2="94" stroke="#FDE047" strokeWidth="1.2" />
                <line x1="75" y1="86" x2="74" y2="94" stroke="#FDE047" strokeWidth="1.2" />
                <ellipse cx="69" cy="84" rx="9" ry="3.2" fill="url(#mimiBongoRim)" stroke="#92400E" strokeWidth="0.8" />
                <ellipse cx="69" cy="84" rx="7.6" ry="2.4" fill="url(#mimiBongoSkin)" stroke="#CA8A04" strokeWidth="0.6" />
              </g>
            </svg>

            {/* Left Drumming Paw */}
            <div
              className="absolute left-[31px] top-[72px] w-[22px] h-[18px]"
              style={{
                animation: animationsEnabled ? 'mimiBongoLeft 0.22s ease-in-out infinite' : undefined,
              }}
            >
              <svg width="22" height="18" viewBox="0 0 22 18">
                <ellipse cx="11" cy="9" rx="8" ry="6.5" fill="url(#mimiCoatGrad)" stroke={outlineColor} strokeWidth={outlineWidth * 0.85} />
                <path d="M 8 6 Q 9 9 9 11 M 14 6 Q 13 9 13 11" stroke={outlineColor} strokeWidth="0.9" strokeLinecap="round" opacity="0.3" />
              </svg>
            </div>

            {/* Right Drumming Paw */}
            <div
              className="absolute left-[59px] top-[72px] w-[22px] h-[18px]"
              style={{
                animation: animationsEnabled ? 'mimiBongoRight 0.22s ease-in-out infinite' : undefined,
              }}
            >
              <svg width="22" height="18" viewBox="0 0 22 18">
                <ellipse cx="11" cy="9" rx="8" ry="6.5" fill="url(#mimiCoatGrad)" stroke={outlineColor} strokeWidth={outlineWidth * 0.85} />
                <path d="M 8 6 Q 9 9 9 11 M 14 6 Q 13 9 13 11" stroke={outlineColor} strokeWidth="0.9" strokeLinecap="round" opacity="0.3" />
              </svg>
            </div>

            {/* Floating Musical Particles */}
            {animationsEnabled && (
              <>
                <div
                  className="absolute left-[14px] top-[6px] text-base pointer-events-none"
                  style={{ animation: 'mimiNoteFloat1 1.4s ease-out infinite' }}
                >
                  🎵
                </div>
                <div
                  className="absolute right-[14px] top-[4px] text-base pointer-events-none"
                  style={{ animation: 'mimiNoteFloat2 1.8s ease-out infinite' }}
                >
                  ✨
                </div>
                <div
                  className="absolute left-[52px] -top-[8px] text-sm pointer-events-none"
                  style={{ animation: 'mimiNoteFloat1 1.6s ease-out infinite 0.5s' }}
                >
                  🎶
                </div>
              </>
            )}
          </>
        ) : pose === 'wave' ? (
          <>
            {/* Left Resting Paw */}
            <svg width="120" height="108" viewBox="0 0 120 108" className="absolute top-0 left-0 pointer-events-none">
              <ellipse cx="47" cy="95.5" rx="8.5" ry="2.2" fill="url(#mimiPawShadowGrad)" />
              <ellipse cx="47" cy="91" rx="8.2" ry="6.2" fill="url(#mimiCoatGrad)" stroke={outlineColor} strokeWidth={outlineWidth * 0.85} />
              <path d="M 42 88.5 Q 47 87 52 88.5" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.65" fill="none" />
              <path d="M 44.5 89 Q 45 92.5 45 94.5 M 49.5 89 Q 49 92.5 49 94.5" stroke={outlineColor} strokeWidth="0.9" strokeLinecap="round" opacity="0.28" />
            </svg>
            {/* Right Waving Paw */}
            <div
              className="absolute left-[72px] top-[72px] w-[24px] h-[22px]"
              style={{
                transformOrigin: '12px 18px',
                animation: animationsEnabled ? 'mimiWave 0.35s ease-in-out infinite' : 'translateY(-10px) rotate(18deg)',
              }}
            >
              <svg width="24" height="22" viewBox="0 0 24 22">
                <ellipse cx="12" cy="11" rx="8" ry="6.5" fill="url(#mimiCoatGrad)" stroke={outlineColor} strokeWidth={outlineWidth * 0.85} />
                <circle cx="8" cy="9" r="1.3" fill={earInner} />
                <circle cx="12" cy="7.5" r="1.4" fill={earInner} />
                <circle cx="16" cy="9" r="1.3" fill={earInner} />
                <ellipse cx="12" cy="12.5" rx="3" ry="2" fill={earInner} />
              </svg>
            </div>
          </>
        ) : pose === 'curl_sleep' ? (
          <svg width="120" height="108" viewBox="0 0 120 108" className="absolute top-0 left-0 pointer-events-none">
            <ellipse cx="52" cy="88" rx="7.2" ry="5.2" fill="url(#mimiCoatGrad)" stroke={outlineColor} strokeWidth={outlineWidth * 0.8} />
            <ellipse cx="68" cy="88" rx="7.2" ry="5.2" fill="url(#mimiCoatGrad)" stroke={outlineColor} strokeWidth={outlineWidth * 0.8} />
          </svg>
        ) : (
          /* Plump Mochi Mittens with Grounding Shadows */
          <svg width="120" height="108" viewBox="0 0 120 108" className="absolute top-0 left-0 pointer-events-none">
            <ellipse cx="47" cy="95.5" rx="8.5" ry="2.2" fill="url(#mimiPawShadowGrad)" />
            <ellipse cx="73" cy="95.5" rx="8.5" ry="2.2" fill="url(#mimiPawShadowGrad)" />

            {/* Left Paw */}
            <ellipse cx="47" cy="91" rx="8.2" ry="6.2" fill="url(#mimiCoatGrad)" stroke={outlineColor} strokeWidth={outlineWidth * 0.85} />
            <path d="M 42 88.5 Q 47 87 52 88.5" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.65" fill="none" />
            <path d="M 44.5 89 Q 45 92.5 45 94.5 M 49.5 89 Q 49 92.5 49 94.5" stroke={outlineColor} strokeWidth="0.9" strokeLinecap="round" opacity="0.28" />

            {/* Right Paw */}
            <ellipse cx="73" cy="91" rx="8.2" ry="6.2" fill="url(#mimiCoatGrad)" stroke={outlineColor} strokeWidth={outlineWidth * 0.85} />
            <path d="M 68 88.5 Q 73 87 78 88.5" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.65" fill="none" />
            <path d="M 70.5 89 Q 71 92.5 71 94.5 M 75.5 89 Q 75 92.5 75 94.5" stroke={outlineColor} strokeWidth="0.9" strokeLinecap="round" opacity="0.28" />
          </svg>
        )}
      </div>
    </div>
  );
});
