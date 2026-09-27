'use client';

import React from 'react';
import { THEME_REGISTRY } from '../../theme/registry';
import { useLayoutStore } from '../../store/useLayoutStore';
import { useTheme } from '../../theme/ThemeProvider';
import { Icon } from '../ui/Icon';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeSelectorModal({ isOpen, onClose }: ThemeSelectorModalProps) {
  const currentTheme = useTheme();
  const activeThemeId = useLayoutStore((s) => s.activeThemeId);
  const setTheme = useLayoutStore((s) => s.setTheme);

  if (!isOpen) return null;

  const themes = Object.values(THEME_REGISTRY);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-xl max-h-[85vh] rounded-3xl p-6 flex flex-col shadow-2xl overflow-hidden"
        style={{
          backgroundColor: currentTheme.colors.surface,
          color: currentTheme.colors.text,
          border: `1.5px solid ${currentTheme.colors.border}`,
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <Typography variant="h3" className="font-bold">
              Theme Studio
            </Typography>
            <Typography variant="caption" style={{ color: currentTheme.colors.textSecondary }}>
              Choose from 11 decoupled aesthetic art directions
            </Typography>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Theme List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {themes.map((t) => {
            const isSelected = activeThemeId === t.id;

            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer border transition-all ${
                  isSelected ? 'ring-2 ring-sky-500 scale-[1.01]' : 'hover:opacity-90'
                }`}
                style={{
                  backgroundColor: t.colors.surface,
                  borderColor: isSelected ? t.colors.primary : t.colors.border,
                  color: t.colors.text,
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Swatch preview */}
                  <div className="flex gap-1">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: t.colors.background, border: '1px solid #cbd5e1' }} />
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: t.colors.primary }} />
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: t.colors.accent }} />
                  </div>
                  <div>
                    <span className="text-sm font-bold block">{t.name}</span>
                    <span className="text-xs opacity-70 block">{t.tagline}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider"
                    style={{ backgroundColor: `${t.colors.primary}20`, color: t.colors.primary }}
                  >
                    {t.artDirection.cardStyle}
                  </span>
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full flex items-center justify-center bg-sky-500 text-white text-xs font-bold">
                      ✓
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <Button title="Apply Theme" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}
