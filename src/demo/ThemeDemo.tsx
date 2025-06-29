import React, { useState } from 'react';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';
import { defaultTheme } from '../theme/themes/default';
import { validateTheme } from '../theme/utils/themeValidation';

// Create a minimal custom theme that will pass validation
const customTheme = validateTheme({
  ...defaultTheme,
  name: 'custom',
  colors: {
    ...defaultTheme.colors,
    primary: {
      ...defaultTheme.colors.primary,
      500: '#ff5722',
    },
    secondary: {
      50: '#e0f7fa',
      100: '#b2ebf2',
      200: '#80deea',
      300: '#4dd0e1',
      400: '#26c6da',
      500: '#00bcd4',
      600: '#00acc1',
      700: '#0097a7',
      800: '#00838f',
      900: '#006064',
    },
    background: {
      ...defaultTheme.colors.background,
      primary: '#ffff00',
      secondary: '#e0e0e0',
      tertiary: '#eeeeee'
    },
    text: {
      ...defaultTheme.colors.text,
      primary: '#212121',
      secondary: '#757575',
      tertiary: '#bdbdbd',
      inverse: '#ffffff'
    },
  }
});

// Type for theme colors that may include secondary colors
type ThemeColors = {
  primary: Record<string, string>;
  secondary?: Record<string, string>;
  background: {
    primary: string;
    secondary?: string;
    tertiary?: string;
  };
  text: {
    primary: string;
    secondary?: string;
    tertiary?: string;
    inverse?: string;
  };
};

const ThemeDemoContent = () => {
  const { theme } = useTheme();
  
  if (!theme?.colors) {
    return <div>Loading theme...</div>;
  }

  // Safely access colors with proper typing
  const colors = theme.colors as ThemeColors;
  const primaryColor = colors.primary[500] || '#3b82f6';
  const secondaryColor = colors.secondary?.[500] || '#00bcd4';
  const bgColor = theme.colors.background?.primary || '#ffffff';
  const textColor = theme.colors.text?.primary || '#000000';
  const inverseTextColor = theme.colors.text?.inverse || '#ffffff';
  const spacing = theme.spacing?.md || '16px';
  
  console.log('Current theme colors:', {
    primary: primaryColor,
    secondary: secondaryColor,
    bg: bgColor,
    text: textColor
  });

  return (
    <div style={{
      marginTop: '20px',
      padding: '20px',
      backgroundColor: bgColor,
      color: textColor
    }}>
      <h2>Current Theme: {theme.name || 'Default'}</h2>
      <div style={{
        backgroundColor: primaryColor,
        color: inverseTextColor,
        padding: spacing,
        margin: `${spacing} 0`
      }}>
        Primary Color
      </div>
      <div style={{
        backgroundColor: secondaryColor,
        color: inverseTextColor,
        padding: spacing,
        margin: `${spacing} 0`
      }}>
        Secondary Color
      </div>
    </div>
  );
};

const ThemeSwitcher = () => {
  const [useCustomTheme, setUseCustomTheme] = useState(false);
  const { setTheme } = useTheme();

  const handleThemeChange = () => {
    const newTheme = useCustomTheme ? defaultTheme : customTheme;
    setTheme(newTheme);
    setUseCustomTheme(!useCustomTheme);
  };

  return (
    <button onClick={handleThemeChange}>
      {useCustomTheme ? 'Use Default Theme' : 'Use Custom Theme'}
    </button>
  );
};

export const ThemeDemo = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Theme Demo</h1>
      <ThemeProvider initialTheme={defaultTheme}>
        <ThemeSwitcher />
        <ThemeDemoContent />
      </ThemeProvider>
    </div>
  );
};
