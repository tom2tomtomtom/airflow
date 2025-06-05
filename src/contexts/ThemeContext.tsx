import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PaletteMode } from '@mui/material';

interface ThemeContextType {
  mode: PaletteMode;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
};

interface ThemeModeProviderProps {
  children: ReactNode;
}

export const ThemeModeProvider: React.FC<ThemeModeProviderProps> = ({ children }) => {
  // Initialize with the theme that's already set by the blocking script
  const [mode, setMode] = useState<PaletteMode>(() => {
    if (typeof window !== 'undefined') {
      // Get the theme that was set by our blocking script
      const currentTheme = document.documentElement.getAttribute('data-mui-color-scheme');
      if (currentTheme === 'dark' || currentTheme === 'light') {
        return currentTheme;
      }
    }
    return 'light'; // Fallback for SSR
  });

  useEffect(() => {
    // Sync with any theme that might have been set by the blocking script
    const currentTheme = document.documentElement.getAttribute('data-mui-color-scheme');
    if (currentTheme && (currentTheme === 'dark' || currentTheme === 'light') && currentTheme !== mode) {
      setMode(currentTheme);
    }
  }, [mode]);

  useEffect(() => {
    // Update data attribute for CSS variables
    document.documentElement.setAttribute('data-mui-color-scheme', mode);
  }, [mode]);

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};