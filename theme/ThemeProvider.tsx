import React, { createContext, useContext, useEffect, useState } from 'react';
import { MausamTheme } from './types';
import { CustomTheme } from './themes/custom';
import { THEME_REGISTRY } from './registry';
import { useLayoutStore } from '../store/useLayoutStore';

const ThemeContext = createContext<MausamTheme>(CustomTheme);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const activeThemeId = useLayoutStore((state) => state.activeThemeId);
  const [theme, setTheme] = useState<MausamTheme>(CustomTheme);

  useEffect(() => {
    if (activeThemeId && THEME_REGISTRY[activeThemeId as keyof typeof THEME_REGISTRY]) {
      setTheme(THEME_REGISTRY[activeThemeId as keyof typeof THEME_REGISTRY]);
    } else {
      setTheme(CustomTheme);
    }
  }, [activeThemeId]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
