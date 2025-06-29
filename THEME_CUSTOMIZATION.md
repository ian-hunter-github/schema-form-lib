# Theme Customization Guide

This document explains how to customize the theme for the schema-form application.

## Theme Structure

The theme consists of several key parts:
- **Colors**: Primary, semantic, text, border, and background colors
- **Spacing**: Standard spacing values and component-specific spacing
- **Typography**: Font sizes, weights, and line heights
- **Shadows**: Component shadows (field, button, card)
- **Components**: Component-specific styling overrides
- **Overrides**: Theme-specific customizations

## Customizing the Theme

There are three ways to customize the theme:

### 1. Using a Theme Object

```typescript
import { ThemeProvider } from './theme/ThemeProvider';
import { defaultTheme } from './theme/themes/default';

const customTheme = {
  ...defaultTheme,
  name: 'custom',
  colors: {
    ...defaultTheme.colors,
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    semantic: {
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    }
  }
};

function App() {
  return (
    <ThemeProvider initialTheme={customTheme}>
      {/* Your app components */}
    </ThemeProvider>
  );
}
```

### 2. Using a JSON String

```typescript
const themeJson = `{
  "name": "json-theme",
  "colors": {
    "primary": {
      "50": "#f0fdf4",
      "100": "#dcfce7",
      "200": "#bbf7d0",
      "300": "#86efac",
      "400": "#4ade80",
      "500": "#22c55e",
      "600": "#16a34a",
      "700": "#15803d",
      "800": "#166534",
      "900": "#14532d"
    }
  }
}`;

function App() {
  return (
    <ThemeProvider initialTheme={themeJson}>
      {/* Your app components */}
    </ThemeProvider>
  );
}
```

### 3. Loading from a URL

```typescript
function App() {
  return (
    <ThemeProvider themeUrl="https://example.com/themes/custom.json">
      {/* Your app components */}
    </ThemeProvider>
  );
}
```

## Theme Properties

### Required Properties
- `name`: Theme identifier
- `colors`: Must include at minimum:
  - `primary` color scale
  - `semantic.error`
  - `text.primary` and `text.secondary`
  - `border.primary`
  - `background.primary`

### Recommended Properties
For full theme support, include:
- Complete color palette
- Spacing scale (`xs`, `sm`, `md`, `lg`, `xl`)
- Typography settings
- Component shadows

## Theme Validation

The theme is validated against the schema (`theme.schema.json`). Invalid themes will fall back to the default theme.

## Using Theme Values in Components

Access theme values using the provided hooks:

```typescript
import { useThemeTokens } from './theme/ThemeProvider';

function ThemedComponent() {
  const { colors, spacing } = useThemeTokens();
  
  return (
    <div style={{ 
      color: colors.text.primary,
      padding: spacing.md 
    }}>
      Styled content
    </div>
  );
}
```

## Complete Example

```typescript
// themes/custom.ts
import { Theme } from '../theme/themes/default';

export const customTheme: Theme = {
  name: 'custom',
  colors: {
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    semantic: {
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981',
      info: '#3b82f6'
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      inverse: '#ffffff'
    },
    border: {
      primary: '#e5e7eb',
      secondary: '#d1d5db'
    },
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  typography: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  }
};
