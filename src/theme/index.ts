// Export all theme-related functionality from a single entry point
export { ThemeProvider, useTheme, useThemeTokens, useVariants } from './ThemeProvider';
export { defaultTheme } from './themes/default';
export type { Theme } from './themes/default';
export type { VariantConfig } from './variants/types';

// Export design tokens
export { colors } from './tokens/colors';
export { spacing } from './tokens/spacing';
export { typography } from './tokens/typography';
export { shadows } from './tokens/shadows';
export { components } from './tokens/components';
