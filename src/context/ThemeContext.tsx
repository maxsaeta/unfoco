import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors } from '../constants/darkColors';
import { lightColors } from '../constants/lightColors';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';

export type Colors = typeof darkColors;

interface ThemeContextValue {
  colors: Colors;
  colorScheme: ColorScheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const THEME_STORAGE_KEY = '@unpaso_theme_mode';

const ThemeContext = createContext<ThemeContextValue>({
  colors: darkColors,
  colorScheme: 'dark',
  themeMode: 'system',
  setThemeMode: () => {},
  isDark: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setThemeModeState(stored);
      }
    });
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  }, []);

  const resolvedScheme: ColorScheme = (() => {
    if (themeMode === 'system') {
      return systemScheme === 'light' ? 'light' : 'dark';
    }
    return themeMode;
  })();

  const colors = resolvedScheme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        colors,
        colorScheme: resolvedScheme,
        themeMode,
        setThemeMode,
        isDark: resolvedScheme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
