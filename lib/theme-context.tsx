'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark';
type AccentColor = 'navy' | 'emerald' | 'gold';

interface ThemeContextType {
  mode: ThemeMode;
  accent: AccentColor;
  toggleMode: () => void;
  setAccent: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<ThemeMode>('light');
  const [accent, setAccentColor] = useState<AccentColor>('navy');

  // Initialize theme from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode || 'light';
    const savedAccent = localStorage.getItem('theme-accent') as AccentColor || 'navy';
    
    // Check system preference for dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialMode = savedMode || (prefersDark ? 'dark' : 'light');
    
    setMode(initialMode);
    setAccentColor(savedAccent);
    
    // Apply to document
    document.documentElement.setAttribute('data-mode', initialMode);
    document.documentElement.setAttribute('data-accent', savedAccent);
    
    setMounted(true);
  }, []);

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
    document.documentElement.setAttribute('data-mode', newMode);
  };

  const setAccent = (color: AccentColor) => {
    setAccentColor(color);
    localStorage.setItem('theme-accent', color);
    document.documentElement.setAttribute('data-accent', color);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ mode, accent, toggleMode, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
