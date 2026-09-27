'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuthStore } from '../../store/useAuthStore';
import { useLocaleStore } from '../../store/useLocaleStore';
import { useUnitStore } from '../../store/useUnitStore';
import { useCompanionStore } from '../../store/useCompanionStore';
import { useLayoutStore } from '../../store/useLayoutStore';
import { THEME_REGISTRY } from '../../theme/registry';
import { SUPPORTED_LOCALES } from '../../lib/i18n';
import { Card } from '../../components/ui/Card';
import { Typography } from '../../components/ui/Typography';
import { Icon } from '../../components/ui/Icon';
import { Button } from '../../components/ui/Button';

export default function MePage() {
  const theme = useTheme();

  // Stores
  const personaVector = useAuthStore((s) => s.personaVector);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const temperatureUnit = useUnitStore((s) => s.temperatureUnit);
  const setTemperatureUnit = useUnitStore((s) => s.setTemperatureUnit);
  const windSpeedUnit = useUnitStore((s) => s.windSpeedUnit);
  const setWindSpeedUnit = useUnitStore((s) => s.setWindSpeedUnit);

  const companionEnabled = useCompanionStore((s) => s.isEnabled);
  const setCompanionEnabled = useCompanionStore((s) => s.setEnabled);
  const soundEnabled = useCompanionStore((s) => s.soundEnabled);
  const setSoundEnabled = useCompanionStore((s) => s.setSoundEnabled);
  const companionName = useCompanionStore((s) => s.name);
  const setCompanionName = useCompanionStore((s) => s.setName);

  const activeThemeId = useLayoutStore((s) => s.activeThemeId);
  const setTheme = useLayoutStore((s) => s.setTheme);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(companionName || 'Mimi');

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setCompanionName(nameInput.trim());
      setEditingName(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <Typography variant="h2" className="font-extrabold">
          Preferences & Profile
        </Typography>
        <Typography variant="caption" style={{ color: theme.colors.textSecondary }}>
          Personalize themes, language, units, and your Mimi weather companion
        </Typography>
      </div>

      {/* 1. Persona Profile Card */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-500 block mb-1">
              Active Persona Blend
            </span>
            <Typography variant="h3" className="font-bold">
              Tailored Layout Metrics
            </Typography>
          </div>
          <Link
            href="/survey"
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-sky-500 text-white shadow-sm hover:bg-sky-600 transition-colors"
          >
            Retake Quiz ↺
          </Link>
        </div>

        {personaVector ? (
          <div className="space-y-2.5">
            {Object.entries(personaVector)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 4)
              .map(([persona, weight]) => (
                <div key={persona} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold capitalize">
                    <span>{persona}</span>
                    <span>{Math.round((weight as number) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: `${Math.round((weight as number) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-xs opacity-75">
            You are currently using the default balanced layout. Take the 3-question survey to tailor your dashboard to your health, fitness, or commute needs!
          </div>
        )}
      </Card>

      {/* 2. Visual Theme Studio (11 Themes) */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Typography variant="h3" className="font-bold text-base">
              Aesthetic Themes (11 Directions)
            </Typography>
            <Typography variant="caption" style={{ color: theme.colors.textSecondary }}>
              Decoupled visual styles ranging from Apple Liquid Glass to Retro 2D
            </Typography>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {Object.values(THEME_REGISTRY).map((t) => {
            const isSelected = activeThemeId === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  isSelected ? 'ring-2 ring-sky-500 font-bold scale-[1.01]' : 'hover:opacity-90'
                }`}
                style={{
                  backgroundColor: t.colors.surface,
                  borderColor: isSelected ? t.colors.primary : t.colors.border,
                  color: t.colors.text,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-0.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.colors.background, border: '1px solid #cbd5e1' }} />
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.colors.primary }} />
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.colors.accent }} />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">{t.name}</span>
                    <span className="text-[10px] opacity-65 block">{t.artDirection.cardStyle}</span>
                  </div>
                </div>
                {isSelected && <span className="text-xs text-sky-500 font-bold">Active</span>}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3. Bhasha Engine & Units */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Language Selection */}
        <Card className="p-5">
          <Typography variant="h3" className="font-bold text-sm mb-3">
            Bhasha Engine (Language)
          </Typography>
          <div className="space-y-1.5">
            {SUPPORTED_LOCALES.map((loc) => (
              <button
                key={loc.code}
                onClick={() => setLocale(loc.code)}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-colors ${
                  locale === loc.code ? 'bg-sky-500 text-white font-bold' : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>{loc.nativeName} ({loc.name})</span>
                <span className="uppercase text-[10px] opacity-75">{loc.code}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Unit Settings */}
        <Card className="p-5 space-y-4">
          <div>
            <Typography variant="h3" className="font-bold text-sm mb-2">
              Temperature Unit
            </Typography>
            <div className="flex gap-2">
              <button
                onClick={() => setTemperatureUnit('C')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  temperatureUnit === 'C' ? 'bg-sky-500 text-white border-sky-500' : 'hover:bg-black/5'
                }`}
              >
                Celsius (°C)
              </button>
              <button
                onClick={() => setTemperatureUnit('F')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  temperatureUnit === 'F' ? 'bg-sky-500 text-white border-sky-500' : 'hover:bg-black/5'
                }`}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          <div>
            <Typography variant="h3" className="font-bold text-sm mb-2">
              Wind Velocity
            </Typography>
            <div className="flex gap-2">
              {(['km/h', 'm/s'] as const).map((unit) => (
                <button
                  key={unit}
                  onClick={() => setWindSpeedUnit(unit)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    windSpeedUnit === unit ? 'bg-sky-500 text-white border-sky-500' : 'hover:bg-black/5'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Mimi Companion Settings */}
      <Card className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <Typography variant="h3" className="font-bold text-sm">
              Mimi — Weather Companion
            </Typography>
            <Typography variant="caption" style={{ color: theme.colors.textSecondary }}>
              Enable reactive mascot expressions, eye gaze tracking, and speech remarks
            </Typography>
          </div>
          <button
            onClick={() => setCompanionEnabled(!companionEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-colors ${
              companionEnabled ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          >
            {companionEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {companionEnabled && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold">Mascot Name:</span>
              {editingName ? (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="px-2 py-0.5 rounded border bg-transparent text-xs w-28"
                  />
                  <button onClick={handleSaveName} className="text-xs text-sky-500 font-bold">
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="font-bold underline hover:opacity-80"
                >
                  {companionName || 'Mimi'} ✏️
                </button>
              )}
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold">Purrs & Audio Sounds:</span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  soundEnabled ? 'bg-sky-500/10 text-sky-500' : 'bg-slate-500/10 opacity-70'
                }`}
              >
                {soundEnabled ? 'Sound On' : 'Muted'}
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* 5. Attribution / Credits */}
      <div className="text-center text-xs opacity-60 py-4 space-y-1">
        <p>Mausam (मौसम) — SIH 2026 Problem Statement 26076</p>
        <p>Ministry of Earth Sciences • India Meteorological Department (IMD)</p>
      </div>
    </div>
  );
}
