'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'blue' | 'green' | 'wine' | 'pink' | 'purple' | 'light' | 'dark';
export type Font = 'sans' | 'serif' | 'mono';

interface ThemeConfig {
  primary: string;
  secondary: string;
  gradient: string;
  lightGradient: string;
  bg: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  ring: string;
  isDark: boolean;
}

const themeConfigs: Record<Theme, ThemeConfig> = {
  blue: {
    primary: 'blue-500',
    secondary: 'blue-600',
    gradient: 'from-blue-500 to-blue-600',
    lightGradient: 'from-blue-100 to-blue-200',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-500',
    ring: 'focus:ring-blue-500',
    isDark: false,
  },
  green: {
    primary: 'green-500',
    secondary: 'green-600',
    gradient: 'from-green-500 to-green-600',
    lightGradient: 'from-green-100 to-green-200',
    bg: 'bg-green-50',
    text: 'text-green-600',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-500',
    ring: 'focus:ring-green-500',
    isDark: false,
  },
  wine: {
    primary: 'red-500',
    secondary: 'red-600',
    gradient: 'from-red-500 to-red-600',
    lightGradient: 'from-red-100 to-red-200',
    bg: 'bg-red-50',
    text: 'text-red-600',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-500',
    ring: 'focus:ring-red-500',
    isDark: false,
  },
  pink: {
    primary: 'pink-500',
    secondary: 'pink-600',
    gradient: 'from-pink-500 to-pink-600',
    lightGradient: 'from-pink-100 to-pink-200',
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-500',
    ring: 'focus:ring-pink-500',
    isDark: false,
  },
  purple: {
    primary: 'purple-500',
    secondary: 'purple-600',
    gradient: 'from-purple-500 to-purple-600',
    lightGradient: 'from-purple-100 to-purple-200',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-500',
    ring: 'focus:ring-purple-500',
    isDark: false,
  },
  light: {
    primary: 'blue-500',
    secondary: 'blue-600',
    gradient: 'from-blue-500 to-blue-600',
    lightGradient: 'from-blue-100 to-blue-200',
    bg: 'bg-gray-50',
    text: 'text-blue-600',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-500',
    ring: 'focus:ring-blue-500',
    isDark: false,
  },
  dark: {
    primary: 'blue-400',
    secondary: 'blue-500',
    gradient: 'from-blue-400 to-blue-500',
    lightGradient: 'from-blue-900 to-blue-800',
    bg: 'bg-gray-900',
    text: 'text-blue-400',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-500',
    ring: 'focus:ring-blue-400',
    isDark: true,
  },
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  font: Font;
  setFont: (font: Font) => void;
  config: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('blue');
  const [font, setFont] = useState<Font>('sans');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && themeConfigs[savedTheme]) {
      setTheme(savedTheme);
    }
    const savedFont = localStorage.getItem('font') as Font;
    if (savedFont && ['sans', 'serif', 'mono'].includes(savedFont)) {
      setFont(savedFont);
    }
  }, []);

  const config = themeConfigs[theme];

  useEffect(() => {
    localStorage.setItem('theme', theme);
    // Apply dark mode class to HTML element
    if (config.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, config.isDark]);

  useEffect(() => {
    localStorage.setItem('font', font);
    document.body.className = `font-${font}`;
  }, [font]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, font, setFont, config }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}