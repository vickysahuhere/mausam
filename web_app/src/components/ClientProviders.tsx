'use client';

import React, { useEffect, useState } from 'react';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';
import { Navbar } from './navigation/Navbar';
import { useLocationStore } from '../store/useLocationStore';
import { useLayoutStore } from '../store/useLayoutStore';
import { useCompanionStore } from '../store/useCompanionStore';
import { useLocaleStore } from '../store/useLocaleStore';
import { useUnitStore } from '../store/useUnitStore';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize core stores
    useLayoutStore.getState().initializeForUser(null);
    useCompanionStore.getState().initialize();
    useLocaleStore.getState().loadLocale();
    useUnitStore.getState().loadUnits();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
      }}
    >
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ThemeWrapper>{children}</ThemeWrapper>
    </ThemeProvider>
  );
}
