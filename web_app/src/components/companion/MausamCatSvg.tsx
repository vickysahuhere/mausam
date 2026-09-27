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
  const [isBlinking, setIsBlinking] = useState(false);
  const [breathePhase, setBreathePhase] = useState(0);

  // Natural blinking interval
  useEffect(() => {
    if (!animationsEnabled || pose === 'curl_sleep') return;
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 4200);
    return () => clearInterval(interval);
  }, [animationsEnabled, pose]);

  // Breathing loop
  useEffect(() => {
    if (!animationsEnabled) return;
    const interval = setInterval(() => {
      setBreathePhase((p) => (p === 0 ? 1 : 0));
    }, 1800);
    return () => clearInterval(interval);
  }, [animationsEnabled]);

  // Gaze pupil calculation
  const pupilOffset = useMemo(() => {
    switch (gazeTarget) {
      case 'left':
        return { x: -2.8, y: 0.5 };
      case 'right':
        return { x: 2.8, y: 0.5 };
      case 'up':
        return { x: 0, y: -2.5 };
      case 'down':
        return { x: 0, y: 2.2 };
      default:
        return { x: 0, y: 0 };
    }
  }, [gazeTarget]);

  // Theme palettes
  const furColor = isDark ? '#334155' : '#FED7AA';
  const furShadow = isDark ? '#1E293B' : '#FDBA74';
  const outlineColor = isDark ? '#0F172A' : '#7C2D12';
  const earInner = isDark ? '#475569' : '#FCA5A5';
  const eyeColor = isDark ? '#38BDF8' : '#0284C7';

  const isSleeping = pose === 'curl_sleep' || expression === 'sleepy';

  return (
    <div
      onClick={onClick}
      className={`relative select-none inline-block ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size * 0.9 }}
    >
      <svg
        width={size}
        height={size * 0.9}
        viewBox="0 0 120 108"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300"
      >
        <defs>
          <linearGradient id="bodyGradWeb" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={furColor} />
            <stop offset="100%" stopColor={furShadow} />
          </linearGradient>
          <linearGradient id="earInnerGradWeb" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={earInner} />
            <stop offset="100%" stopColor="#F87171" />
          </linearGradient>
          <linearGradient id="collarRibbonWeb" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#BE123C" />
          </linearGradient>
          <linearGradient id="bellGradWeb" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="maskGradWeb" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>

        {/* Tail */}
        <g
          className="transition-transform duration-500 origin-[24px_80px]"
          style={{ transform: breathePhase ? 'rotate(6deg)' : 'rotate(-4deg)' }}
        >
          <path
            d="M 22 75 C 10 70 4 58 10 50 C 14 44 24 46 22 56 C 20 64 26 70 30 74 Z"
            fill="url(#bodyGradWeb)"
            stroke={outlineColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Body */}
        <g style={{ transform: breathePhase ? 'scale(1.02)' : 'scale(1)', transformOrigin: '60px 80px' }}>
          <ellipse
            cx="60"
            cy="76"
            rx="28"
            ry="22"
            fill="url(#bodyGradWeb)"
            stroke={outlineColor}
            strokeWidth="2"
          />
          {/* Paws */}
          <ellipse cx="48" cy="94" rx="7" ry="4" fill={furColor} stroke={outlineColor} strokeWidth="1.5" />
          <ellipse cx="72" cy="94" rx="7" ry="4" fill={furColor} stroke={outlineColor} strokeWidth="1.5" />
        </g>

        {/* Ears */}
        {/* Left Ear */}
        <path
          d="M 40 38 L 32 18 C 30 14 36 12 40 18 L 49 32 Z"
          fill="url(#bodyGradWeb)"
          stroke={outlineColor}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M 37 32 L 34 22 L 44 28 Z" fill="url(#earInnerGradWeb)" />

        {/* Right Ear */}
        <path
          d="M 80 38 L 88 18 C 90 14 84 12 80 18 L 71 32 Z"
          fill="url(#bodyGradWeb)"
          stroke={outlineColor}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M 83 32 L 86 22 L 76 28 Z" fill="url(#earInnerGradWeb)" />

        {/* Head */}
        <g
          className="transition-transform duration-300"
          style={{ transform: breathePhase ? 'translateY(-1px)' : 'translateY(1px)' }}
        >
          <ellipse
            cx="60"
            cy="44"
            rx="25"
            ry="20"
            fill="url(#bodyGradWeb)"
            stroke={outlineColor}
            strokeWidth="2"
          />

          {/* Cheeks / Whiskers */}
          <path d="M 30 46 L 18 44 M 30 49 L 16 50 M 30 52 L 18 56" stroke={outlineColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          <path d="M 90 46 L 102 44 M 90 49 L 104 50 M 90 52 L 102 56" stroke={outlineColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

          {/* Eyes or Sleep Mask */}
          {accessory === 'eye_mask' || isSleeping ? (
            <g>
              {/* Silk Sleep Mask with crescent moon and eyelashes */}
              <path
                d="M 36 44 C 33 36 46 35 53 39 C 56 41 64 41 67 39 C 74 35 87 36 84 44 C 87 52 75 54 68 49 C 65 47 55 47 52 49 C 45 54 33 52 36 44 Z"
                fill="url(#maskGradWeb)"
                stroke="#3730A3"
                strokeWidth="1.5"
              />
              {/* Crescent Moon Embroidery */}
              <path d="M 62 41 A 3 3 0 0 0 58 45 A 3.5 3.5 0 0 1 62 41 Z" fill="#FDE047" />
              {/* Golden Eyelashes */}
              <path d="M 44 46 Q 47 48 50 46" stroke="#FDE047" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <path d="M 70 46 Q 73 48 76 46" stroke="#FDE047" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            </g>
          ) : isBlinking || expression === 'happy' ? (
            <g>
              {/* Curved Happy / Blink Eyes */}
              <path d="M 46 44 Q 50 48 54 44" stroke={outlineColor} strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M 66 44 Q 70 48 74 44" stroke={outlineColor} strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            <g>
              {/* Left Eye */}
              <ellipse cx="50" cy="42" rx="4.5" ry="5.5" fill="#FFFFFF" stroke={outlineColor} strokeWidth="1" />
              <circle
                cx={50 + pupilOffset.x}
                cy={42 + pupilOffset.y}
                r="3"
                fill={eyeColor}
              />
              <circle cx={50 + pupilOffset.x + 1} cy={42 + pupilOffset.y - 1} r="1" fill="#FFFFFF" />

              {/* Right Eye */}
              <ellipse cx="70" cy="42" rx="4.5" ry="5.5" fill="#FFFFFF" stroke={outlineColor} strokeWidth="1" />
              <circle
                cx={70 + pupilOffset.x}
                cy={42 + pupilOffset.y}
                r="3"
                fill={eyeColor}
              />
              <circle cx={70 + pupilOffset.x + 1} cy={42 + pupilOffset.y - 1} r="1" fill="#FFFFFF" />
            </g>
          )}

          {/* Nose & Mouth */}
          <polygon points="58.5,49 61.5,49 60,51" fill="#F87171" />
          <path d="M 57 52 Q 60 54 60 52 Q 60 54 63 52" stroke={outlineColor} strokeWidth="1.2" strokeLinecap="round" fill="none" />

          {/* Blush */}
          <ellipse cx="40" cy="48" rx="3.5" ry="2" fill="#FCA5A5" opacity="0.6" />
          <ellipse cx="80" cy="48" rx="3.5" ry="2" fill="#FCA5A5" opacity="0.6" />

          {/* Signature Collar with Bell */}
          <path d="M 45 58 Q 60 63 75 58" stroke="url(#collarRibbonWeb)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="60" cy="61" r="3.2" fill="url(#bellGradWeb)" stroke="#78350F" strokeWidth="0.75" />
          <circle cx="59.2" cy="60" r="0.8" fill="#FFFFFF" opacity="0.9" />
        </g>
      </svg>
    </div>
  );
});
