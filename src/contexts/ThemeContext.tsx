import React, { createContext, useContext, useState } from 'react';

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    health: {
      excellent: string;
      good: string;
      warning: string;
      poor: string;
    };
  };
}

const themes: Theme[] = [
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#06b6d4',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      health: {
        excellent: '#10b981',
        good: '#84cc16',
        warning: '#f59e0b',
        poor: '#ef4444'
      }
    }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
      background: '#fef7f0',
      surface: '#ffffff',
      text: '#1c1917',
      textSecondary: '#78716c',
      health: {
        excellent: '#10b981',
        good: '#84cc16',
        warning: '#f59e0b',
        poor: '#ef4444'
      }
    }
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#14532d',
      textSecondary: '#6b7280',
      health: {
        excellent: '#10b981',
        good: '#84cc16',
        warning: '#f59e0b',
        poor: '#ef4444'
      }
    }
  },
  {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa',
      background: '#0f0f23',
      surface: '#1e1b4b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      health: {
        excellent: '#10b981',
        good: '#84cc16',
        warning: '#f59e0b',
        poor: '#ef4444'
      }
    }
  }
];

interface ThemeContextType {
  currentTheme: Theme;
  themes: Theme[];
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, themes, setTheme }}>
      <div style={{
        '--color-primary': currentTheme.colors.primary,
        '--color-secondary': currentTheme.colors.secondary,
        '--color-accent': currentTheme.colors.accent,
        '--color-background': currentTheme.colors.background,
        '--color-surface': currentTheme.colors.surface,
        '--color-text': currentTheme.colors.text,
        '--color-text-secondary': currentTheme.colors.textSecondary,
        '--color-health-excellent': currentTheme.colors.health.excellent,
        '--color-health-good': currentTheme.colors.health.good,
        '--color-health-warning': currentTheme.colors.health.warning,
        '--color-health-poor': currentTheme.colors.health.poor,
      } as React.CSSProperties}>
        {children}
      </div>
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