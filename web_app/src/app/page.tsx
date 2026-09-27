'use client';

import React, { useState, useEffect } from 'react';
import { MainWeatherHero } from '../components/home/MainWeatherHero';
import { useLayoutStore } from '../store/useLayoutStore';
import { useLocationStore } from '../store/useLocationStore';
import { useTheme } from '../theme/ThemeProvider';
import { useLocaleStore } from '../store/useLocaleStore';
import { WIDGET_MAP } from '../components/widgets/WeatherWidgets';
import { WidgetLibraryModal } from '../components/home/WidgetLibraryModal';
import { ThemeSelectorModal } from '../components/home/ThemeSelectorModal';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { Typography } from '../components/ui/Typography';
import { getAlertsForLocation } from '../lib/alertService';
import Link from 'next/link';

export default function HomePage() {
  const theme = useTheme();
  const t = useLocaleStore((s) => s.t);

  const layout = useLayoutStore((s) => s.layout);
  const removeWidget = useLayoutStore((s) => s.removeWidget);
  const setLayout = useLayoutStore((s) => s.setLayout);

  const locations = useLocationStore((s) => s.locations);
  const defaultLoc = locations.find((l) => l.isDefault) || locations[0] || {
    id: 'default',
    label: 'New Delhi, Delhi, India',
    lat: 28.6139,
    lon: 77.209,
    isDefault: true,
  };

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [severeAlerts, setSevereAlerts] = useState<any[]>([]);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const res = await getAlertsForLocation(defaultLoc.lat, defaultLoc.lon);
        setSevereAlerts(res.alerts || []);
      } catch {
        // Fallback
      }
    }
    loadAlerts();
  }, [defaultLoc.lat, defaultLoc.lon]);

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= layout.length) return;
    const newLayout = [...layout];
    const [moved] = newLayout.splice(index, 1);
    newLayout.splice(newIndex, 0, moved);
    setLayout(newLayout);
  };

  return (
    <div className="space-y-6">
      {/* Active Severe Alert Banner */}
      {severeAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-red-600 dark:text-red-400 animate-pulse">
          <div className="flex items-center gap-3">
            <Icon name="alert-triangle" size={20} color="#DC2626" />
            <div>
              <span className="text-sm font-bold block">
                {severeAlerts[0].headline || 'Active Severe Weather Advisory'}
              </span>
              <span className="text-xs opacity-80 block">
                {severeAlerts[0].description || 'Thunderstorm and heavy rain reported in district.'}
              </span>
            </div>
          </div>
          <Link
            href="/alerts"
            className="text-xs font-bold underline whitespace-nowrap ml-4 hover:opacity-80"
          >
            View Details →
          </Link>
        </div>
      )}

      {/* Main Weather Hero Card with Mascot */}
      <MainWeatherHero
        locationName={defaultLoc.label}
      />

      {/* Dashboard Customization Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border backdrop-blur-sm"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
            Layout Mode:
          </span>
          <button
            onClick={() => setIsCustomizing(!isCustomizing)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              isCustomizing
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-black/5 dark:bg-white/10 opacity-80 hover:opacity-100'
            }`}
          >
            {isCustomizing ? '✓ Done Editing' : '✏️ Edit Layout'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLibrary(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold border hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            style={{ borderColor: theme.colors.border, color: theme.colors.text }}
          >
            <Icon name="plus" size={13} />
            <span>Add Widget</span>
          </button>

          <button
            onClick={() => setShowThemeModal(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold border hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            style={{ borderColor: theme.colors.border, color: theme.colors.text }}
          >
            <Icon name="sliders" size={13} />
            <span>Theme Studio</span>
          </button>

          <Link
            href="/survey"
            className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold text-white shadow-sm transition-transform active:scale-95"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <span>Persona Quiz</span>
          </Link>
        </div>
      </div>

      {/* Dynamic Grid of Personalized Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {layout.map((item, index) => {
          const WidgetComponent = WIDGET_MAP[item.type];
          if (!WidgetComponent) return null;

          return (
            <div key={item.id} className="relative group">
              {/* Order Controls during customization */}
              {isCustomizing && (
                <div className="absolute top-2 right-12 z-20 flex gap-1 bg-black/70 backdrop-blur-md p-1 rounded-lg text-white text-xs">
                  <button
                    disabled={index === 0}
                    onClick={() => moveWidget(index, 'up')}
                    className="px-1.5 py-0.5 rounded hover:bg-white/20 disabled:opacity-30"
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    disabled={index === layout.length - 1}
                    onClick={() => moveWidget(index, 'down')}
                    className="px-1.5 py-0.5 rounded hover:bg-white/20 disabled:opacity-30"
                    title="Move down"
                  >
                    ▼
                  </button>
                </div>
              )}

              <WidgetComponent
                id={item.id}
                isCustomizing={isCustomizing}
                onRemove={() => removeWidget(item.id)}
              />
            </div>
          );
        })}
      </div>

      {/* Widget Library Modal */}
      <WidgetLibraryModal isOpen={showLibrary} onClose={() => setShowLibrary(false)} />

      {/* Theme Studio Modal */}
      <ThemeSelectorModal isOpen={showThemeModal} onClose={() => setShowThemeModal(false)} />
    </div>
  );
}
