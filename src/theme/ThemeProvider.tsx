import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { defaultTheme, type Theme } from './themes/default';
import { type VariantConfig } from './variants/types';

interface ThemeContextValue {
  theme: Theme;
  variants: VariantConfig;
  setTheme: (theme: Theme) => void;
  setVariants: (variants: VariantConfig) => void;
  updateVariant: <K extends keyof VariantConfig>(key: K, value: VariantConfig[K]) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Theme;
  initialVariants?: VariantConfig;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = defaultTheme,
  initialVariants = {
    array: 'form',
    boolean: 'checkbox',
    size: 'md',
    density: 'normal',
    button: 'primary',
  },
}) => {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [variants, setVariants] = useState<VariantConfig>(initialVariants);

  const updateVariant = <K extends keyof VariantConfig>(
    key: K,
    value: VariantConfig[K]
  ) => {
    setVariants(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const contextValue: ThemeContextValue = {
    theme,
    variants,
    setTheme,
    setVariants,
    updateVariant,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <EmotionThemeProvider theme={theme}>
        {children}
      </EmotionThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper hook for accessing theme tokens directly
export const useThemeTokens = () => {
  const { theme } = useTheme();
  return {
    colors: theme.colors,
    spacing: theme.spacing,
    typography: theme.typography,
    shadows: theme.shadows,
    components: theme.components,
  };
};

// Helper hook for accessing variants
export const useVariants = () => {
  const { variants, updateVariant } = useTheme();
  return {
    variants,
    updateVariant,
  };
};
