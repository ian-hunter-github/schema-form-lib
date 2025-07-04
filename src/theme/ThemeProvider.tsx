import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { defaultTheme, type Theme } from './themes/default';
import { type VariantConfig } from './variants/types';
import { parseThemeJson, validateTheme } from './utils/themeValidation';

interface ThemeContextValue {
  theme: Theme;
  variants: VariantConfig;
  setTheme: (theme: Theme | string) => void;
  setVariants: (variants: VariantConfig) => void;
  updateVariant: <K extends keyof VariantConfig>(key: K, value: VariantConfig[K]) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Theme | string; // Can be Theme object or JSON string
  initialVariants?: VariantConfig;
  themeUrl?: string; // URL to fetch theme JSON from
  onThemeError?: (error: Error) => void; // Callback for theme loading errors
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
  themeUrl,
  onThemeError,
}) => {
  const [theme, setTheme] = useState<Theme>(
    typeof initialTheme === 'string' 
      ? parseThemeJson(initialTheme) 
      : initialTheme
  );
  const [loading, setLoading] = useState(!!themeUrl);

  useEffect(() => {
    if (!themeUrl) return;

    const loadThemeFromUrl = async () => {
      try {
        setLoading(true);
        const response = await fetch(themeUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch theme: ${response.statusText}`);
        }
        const json = await response.json();
        const validatedTheme = validateTheme(json);
        setTheme(validatedTheme);
      } catch (error) {
        onThemeError?.(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setLoading(false);
      }
    };

    loadThemeFromUrl();
  }, [themeUrl, onThemeError]);

  const safeSetTheme = (newTheme: Theme | string) => {
    try {
      const validatedTheme = typeof newTheme === 'string'
        ? parseThemeJson(newTheme)
        : validateTheme(newTheme);
      setTheme(validatedTheme);
    } catch (error) {
      onThemeError?.(error instanceof Error ? error : new Error(String(error)));
    }
  };
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
    setTheme: safeSetTheme,
    setVariants,
    updateVariant,
  };

  if (loading) {
    return null; // Or return a loading spinner if desired
  }

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
