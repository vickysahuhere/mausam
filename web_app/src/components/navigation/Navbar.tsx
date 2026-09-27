'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '../ui/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useLocaleStore } from '../../store/useLocaleStore';
import { useUnitStore } from '../../store/useUnitStore';
import { SUPPORTED_LOCALES } from '../../lib/i18n';
import { ThemeSelectorModal } from '../home/ThemeSelectorModal';

export function Navbar() {
  const theme = useTheme();
  const pathname = usePathname();

  const currentLocale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const t = useLocaleStore((s) => s.t);

  const temperatureUnit = useUnitStore((s) => s.temperatureUnit);
  const setTemperatureUnit = useUnitStore((s) => s.setTemperatureUnit);

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const navItems = [
    { label: t('homeTab') || 'Home', path: '/', icon: 'home' },
    { label: t('alertsTab') || 'Alerts', path: '/alerts', icon: 'alerts' },
    { label: t('locationsTab') || 'Locations', path: '/locations', icon: 'locations' },
    { label: t('meTab') || 'Me', path: '/me', icon: 'me' },
    { label: 'Survey', path: '/survey', icon: 'sliders' },
  ];

  const toggleTempUnit = () => {
    setTemperatureUnit(temperatureUnit === 'C' ? 'F' : 'C');
  };

  return (
    <>
      {/* Top Header */}
      <header
        className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors"
        style={{
          backgroundColor: `${theme.colors.surface}E6`,
          borderColor: theme.colors.border,
          color: theme.colors.text,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md transition-transform group-hover:scale-105"
              style={{ backgroundColor: theme.colors.primary }}
            >
              मौसम
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight block leading-tight">
                Mausam
              </span>
              <span className="text-[10px] font-semibold opacity-60 uppercase tracking-widest block">
                IMD • SIH 2026
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'shadow-sm'
                      : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: `${theme.colors.primary}18`,
                          color: theme.colors.primary,
                        }
                      : { color: theme.colors.text }
                  }
                >
                  <Icon name={item.icon} size={16} color={isActive ? theme.colors.primary : 'currentColor'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Header Controls (Theme, Unit, Bhasha Language) */}
          <div className="flex items-center gap-2">
            {/* Unit toggle (°C / °F) */}
            <button
              onClick={toggleTempUnit}
              className="px-2.5 py-1 rounded-xl text-xs font-bold border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              style={{ borderColor: theme.colors.border, color: theme.colors.text }}
              title="Toggle Temperature Unit"
            >
              °{temperatureUnit}
            </button>

            {/* Language Selector (Bhasha Engine) */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                style={{ borderColor: theme.colors.border, color: theme.colors.text }}
                title="Bhasha Engine (Change Language)"
              >
                <Icon name="globe" size={13} />
                <span className="uppercase">{currentLocale}</span>
              </button>

              {showLangMenu && (
                <div
                  className="absolute right-0 mt-2 w-36 rounded-2xl shadow-xl border p-1 z-50 animate-in fade-in"
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  }}
                >
                  {SUPPORTED_LOCALES.map((loc) => (
                    <button
                      key={loc.code}
                      onClick={() => {
                        setLocale(loc.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/10 ${
                        currentLocale === loc.code ? 'text-sky-500 font-bold' : ''
                      }`}
                    >
                      <span>{loc.nativeName}</span>
                      <span className="text-[10px] opacity-60 uppercase">{loc.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Studio Button */}
            <button
              onClick={() => setShowThemeModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm transition-transform active:scale-95"
              style={{ backgroundColor: theme.colors.primary }}
              title="Theme Studio"
            >
              <Icon name="sliders" size={13} color="#FFFFFF" />
              <span className="hidden sm:inline">Theme</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg flex justify-around items-center px-2 py-2"
        style={{
          backgroundColor: `${theme.colors.surface}F2`,
          borderColor: theme.colors.border,
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
                isActive ? 'opacity-100 font-bold' : 'opacity-60 hover:opacity-100'
              }`}
              style={{ color: isActive ? theme.colors.primary : theme.colors.text }}
            >
              <Icon name={item.icon} size={20} color={isActive ? theme.colors.primary : 'currentColor'} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Theme Studio Modal */}
      <ThemeSelectorModal isOpen={showThemeModal} onClose={() => setShowThemeModal(false)} />
    </>
  );
}
