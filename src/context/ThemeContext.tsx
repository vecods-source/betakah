import React, { createContext, useContext } from 'react';
import { Colors, ThemeColors } from '../constants/colors';

interface ThemeContextType {
  themeMode: 'light';
  isDark: false;
  colors: ThemeColors;
  cardBackground: string;
  screenBackground: string;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  setThemeMode: (mode: 'light') => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value: ThemeContextType = {
    themeMode: 'light',
    isDark: false,
    colors: Colors,
    cardBackground: '#FFFFFF',
    screenBackground: '#F7FAFC',
    borderColor: '#E0E0E0',
    textPrimary: '#000000',
    textSecondary: '#616161',
    textTertiary: '#9E9E9E',
    setThemeMode: async () => {},
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

export type ThemeMode = 'light';
