'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MausamCatSvg } from './MausamCatSvg';
import { useCompanionStore } from '../../store/useCompanionStore';
import { useAnimationStore } from '../../store/useAnimationStore';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../ui/Typography';
import { haptics } from '../../lib/haptics';

interface CompanionPerchProps {
  compact?: boolean;
}

export const CompanionPerch = React.memo(function CompanionPerch({ compact = false }: CompanionPerchProps) {
  const theme = useTheme();

  const isEnabled = useCompanionStore((s) => s.isEnabled);
  const name = useCompanionStore((s) => s.name);
  const currentState = useCompanionStore((s) => s.currentState);
  const tapCat = useCompanionStore((s) => s.tapCat);
  const petCat = useCompanionStore((s) => s.petCat);
  const feedCat = useCompanionStore((s) => s.feedCat);
  const dismissSpeech = useCompanionStore((s) => s.dismissSpeech);

  const animationsEnabled = useAnimationStore((state) => state.animationsEnabled);
  const [showHeart, setShowHeart] = useState(false);

  useEffect(() => {
    useCompanionStore.getState().initialize();
    if (animationsEnabled) {
      useCompanionStore.getState().startEngine();
    }
    return () => {
      useCompanionStore.getState().stopEngine();
    };
  }, [animationsEnabled]);

  const handleTap = () => {
    haptics.impactLight();
    tapCat();
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1200);
  };

  if (!isEnabled) return null;

  const currentSpeech = currentState?.speechText;

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Floating Interactive Floating Hearts */}
      {showHeart && (
        <div className="absolute -top-4 text-xl animate-bounce pointer-events-none transition-all duration-300">
          💖
        </div>
      )}

      {/* Speech Bubble */}
      {currentSpeech && (
        <div
          onClick={dismissSpeech}
          className="relative mb-2 max-w-[220px] px-3.5 py-2 rounded-2xl cursor-pointer shadow-lg backdrop-blur-md transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-2"
          style={{
            backgroundColor: theme.isDark ? '#1E293B' : '#FFFFFF',
            border: `1.5px solid ${theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
            boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.15)',
          }}
        >
          <p
            className="font-bold text-xs text-center leading-snug"
            style={{ color: theme.isDark ? '#F8FAFC' : '#0F172A' }}
          >
            {currentSpeech}
          </p>
          {/* Triangle tail */}
          <div
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
            style={{
              backgroundColor: theme.isDark ? '#1E293B' : '#FFFFFF',
              borderBottom: `1.5px solid ${theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
              borderRight: `1.5px solid ${theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
            }}
          />
        </div>
      )}

      {/* Mascot Graphic */}
      <div className="relative group">
        <MausamCatSvg
          expression={currentState?.expression}
          pose={currentState?.pose}
          accessory={currentState?.accessory}
          gazeTarget={currentState?.gazeTarget}
          size={compact ? 95 : 125}
          isDark={Boolean(theme.isDark)}
          animationsEnabled={animationsEnabled}
          onClick={handleTap}
        />

        {/* Quick action buttons on hover / focus */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 bg-black/40 backdrop-blur-md p-1 rounded-full text-xs">
          <button
            onClick={(e) => {
              e.stopPropagation();
              haptics.felinePurr();
              petCat();
            }}
            className="px-2 py-0.5 rounded-full hover:bg-white/20 text-white"
            title="Pet Mimi"
          >
            ✋ Pet
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              haptics.impactMedium();
              feedCat();
            }}
            className="px-2 py-0.5 rounded-full hover:bg-white/20 text-white"
            title="Give Fish Treat"
          >
            🐟 Snack
          </button>
        </div>
      </div>

      {/* Mascot Name Badge */}
      <span
        className="text-[11px] font-medium px-2 py-0.5 rounded-full mt-1 opacity-80"
        style={{
          color: theme.colors.textSecondary,
        }}
      >
        {name || 'Mimi'}
      </span>
    </div>
  );
});
